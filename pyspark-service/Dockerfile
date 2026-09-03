FROM apache/spark:4.2.0-java21-python3

USER root

WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    gzip && \
    rm -rf /var/lib/apt/lists/*

RUN curl -fL https://github.com/VirtusLab/scala-cli/releases/latest/download/scala-cli-x86_64-pc-linux.gz \
    -o /tmp/scala-cli.gz && \
    gzip -d /tmp/scala-cli.gz && \
    mv /tmp/scala-cli /usr/local/bin/scala-cli && \
    chmod +x /usr/local/bin/scala-cli

RUN pip3 install --no-cache-dir \
    pypdf \
    python-docx \
    pika

COPY pyspark-service /app/pyspark-service

COPY scala-service /app/scala-service

ENV PYSPARK_PYTHON=python3
ENV PYSPARK_DRIVER_PYTHON=python3
ENV SCALA_CLI=/usr/local/bin/scala-cli
ENV SCALA_FILE=/app/scala-service/src/MetadataProcessor.scala
ENV RABBITMQ_HOST=rabbitmq

WORKDIR /app/pyspark-service

CMD ["python3", "rabbitmq_worker.py"]