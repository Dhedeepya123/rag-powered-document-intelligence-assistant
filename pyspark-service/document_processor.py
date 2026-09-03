import sys
import os
import json
from pathlib import Path

from pyspark.sql import SparkSession
from pypdf import PdfReader
from docx import Document as DocxDocument


CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200


def extract_pdf(file_path):
    reader = PdfReader(file_path)

    pages = []

    for page in reader.pages:
        text = page.extract_text()

        if text:
            pages.append(text)

    return "\n".join(pages)


def extract_docx(file_path):
    document = DocxDocument(file_path)

    paragraphs = []

    for paragraph in document.paragraphs:
        text = paragraph.text.strip()

        if text:
            paragraphs.append(text)

    return "\n".join(paragraphs)


def extract_text(file_path):
    lower_path = file_path.lower()

    if lower_path.endswith(".pdf"):
        return extract_pdf(file_path)

    if lower_path.endswith(".docx"):
        return extract_docx(file_path)

    raise ValueError("Only PDF and DOCX files are supported.")


def create_chunks(text):
    if not text:
        return []

    text = text.strip()

    chunks = []

    start = 0

    while start < len(text):

        end = min(start + CHUNK_SIZE, len(text))

        chunk = text[start:end].strip()

        if chunk:
            chunks.append(chunk)

        if end >= len(text):
            break

        start = end - CHUNK_OVERLAP

    return chunks


def main():

    if len(sys.argv) < 3:
        print("Usage: python document_processor.py <input_file> <document_id>")
        sys.exit(1)

    input_file = sys.argv[1]
    document_id = sys.argv[2]

    if not os.path.exists(input_file):
        print("ERROR: File does not exist:", input_file)
        sys.exit(1)

    print("==========================================")
    print("PySpark Document Processor")
    print("==========================================")

    print("Input file:", input_file)
    print("Document ID:", document_id)

    print("\nExtracting document text...")

    extracted_text = extract_text(input_file)

    print("Extracted characters:", len(extracted_text))

    print("\nCreating semantic chunks...")

    chunks = create_chunks(extracted_text)

    print("Created chunks:", len(chunks))

    if not chunks:
        print("ERROR: No text chunks were created.")
        sys.exit(1)

    spark = (
        SparkSession.builder
        .master("local[*]")
        .appName("AcademicCertificateVaultProcessor")
        .getOrCreate()
    )

    spark.sparkContext.setLogLevel("WARN")

    print("\nSpark version:", spark.version)

    rows = []

    for index, chunk in enumerate(chunks):
        rows.append(
            (
                document_id,
                index,
                chunk,
                len(chunk)
            )
        )

    dataframe = spark.createDataFrame(
        rows,
        [
            "documentId",
            "chunkIndex",
            "content",
            "characterCount"
        ]
    )

    print("\nSpark DataFrame created.")

    dataframe.show(5, truncate=80)

    output_directory = Path("output")

    output_directory.mkdir(
        parents=True,
        exist_ok=True
    )

    output_file = output_directory / (
        "document_" + str(document_id) + "_chunks.json"
    )

    records = dataframe.collect()

    output_data = []

    for row in records:

        output_data.append(
            {
                "documentId": row["documentId"],
                "chunkIndex": row["chunkIndex"],
                "content": row["content"],
                "characterCount": row["characterCount"]
            }
        )

    with open(
        output_file,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            output_data,
            file,
            indent=2,
            ensure_ascii=False
        )

    print("\nProcessed output written to:")
    print(output_file)

    spark.stop()

    print("\n==========================================")
    print("PYSPARK PROCESSING SUCCESSFUL")
    print("==========================================")


if __name__ == "__main__":
    main()