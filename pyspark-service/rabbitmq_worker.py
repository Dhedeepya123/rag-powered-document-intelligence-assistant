import json
import os
import subprocess

import pika

from document_processor import extract_text, create_chunks


RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "localhost")

PYSPARK_QUEUE = "pyspark-processing"

EMBEDDING_QUEUE = "embedding-processing"

SCALA_CLI = os.getenv(
    "SCALA_CLI",
    r"C:\Program Files\scala-cli-x86_64-pc-win32\scala-cli.exe"
)

SCALA_FILE = os.getenv(
    "SCALA_FILE",
    r"scala-service\src\MetadataProcessor.scala"
)


def run_scala_metadata_processor(chunks_file):
    print()
    print("Starting Scala Spark metadata processing...")

    command = [
        SCALA_CLI,
        "run",
        SCALA_FILE,
        "--scala",
        "2.13.18",
        "--dependency",
        "org.apache.spark::spark-sql:4.2.0",
        "--",
        chunks_file
    ]

    result = subprocess.run(
        command,
        capture_output=True,
        text=True
    )

    if result.stdout:
        print(result.stdout)

    if result.stderr:
        print(result.stderr)

    if result.returncode != 0:
        raise RuntimeError(
            "Scala Spark processing failed with exit code "
            + str(result.returncode)
        )

    print("Scala Spark processing completed successfully.")


def publish_embedding_message(document_id, chunks_file):
    connection = pika.BlockingConnection(
        pika.ConnectionParameters(
            host=RABBITMQ_HOST,
            heartbeat=600
        )
    )

    channel = connection.channel()

    channel.queue_declare(
        queue=EMBEDDING_QUEUE,
        durable=True
    )

    message = {
        "documentId": document_id,
        "chunksFile": chunks_file
    }

    channel.basic_publish(
        exchange="",
        routing_key=EMBEDDING_QUEUE,
        body=json.dumps(message),
        properties=pika.BasicProperties(
            delivery_mode=2,
            content_type="application/json"
        )
    )

    print("Embedding processing message sent:")
    print(message)

    connection.close()


def process_document(document_id, file_path):
    print()
    print("========================================")
    print("Processing document:", document_id)
    print("File:", file_path)
    print("========================================")

    text = extract_text(file_path)

    print("Extracted characters:", len(text))

    chunks = create_chunks(text)

    print("Created chunks:", len(chunks))

    output_directory = "output"

    os.makedirs(
        output_directory,
        exist_ok=True
    )

    chunks_file = os.path.join(
        output_directory,
        "document_" + str(document_id) + "_chunks.json"
    )

    with open(
        chunks_file,
        "w",
        encoding="utf-8"
    ) as file:

        for index, chunk in enumerate(chunks):

            chunk_object = {
                "documentId": document_id,
                "chunkIndex": index,
                "content": chunk
            }

            file.write(
                json.dumps(
                    chunk_object,
                    ensure_ascii=False
                )
                + "\n"
            )

    print("PySpark output:", chunks_file)

    run_scala_metadata_processor(chunks_file)

    publish_embedding_message(
        document_id,
        chunks_file
    )

    print()
    print("PYSPARK + SCALA SPARK PROCESSING SUCCESSFUL")


def callback(ch, method, properties, body):
    try:
        message = json.loads(
            body.decode("utf-8")
        )

        print()
        print("Received RabbitMQ message:")
        print(message)

        document_id = message["documentId"]

        file_path = message["filePath"]

        process_document(
            document_id,
            file_path
        )

        ch.basic_ack(
            delivery_tag=method.delivery_tag
        )

        print("RabbitMQ message acknowledged.")

    except Exception as e:
        print()
        print("ERROR while processing document:")
        print(e)

        ch.basic_nack(
            delivery_tag=method.delivery_tag,
            requeue=False
        )


def main():
    connection = pika.BlockingConnection(
        pika.ConnectionParameters(
            host=RABBITMQ_HOST,
            heartbeat=600
        )
    )

    channel = connection.channel()

    channel.queue_declare(
        queue=PYSPARK_QUEUE,
        durable=True
    )

    channel.queue_declare(
        queue=EMBEDDING_QUEUE,
        durable=True
    )

    channel.basic_qos(
        prefetch_count=1
    )

    channel.basic_consume(
        queue=PYSPARK_QUEUE,
        on_message_callback=callback
    )

    print("========================================")
    print("PySpark RabbitMQ Worker Started")
    print("========================================")

    print("Waiting for documents...")

    print("RabbitMQ queue:", PYSPARK_QUEUE)

    print("Result queue:", EMBEDDING_QUEUE)

    print("RabbitMQ host:", RABBITMQ_HOST)

    print("Scala CLI:", SCALA_CLI)

    print("Scala file:", SCALA_FILE)

    channel.start_consuming()


if __name__ == "__main__":
    main()