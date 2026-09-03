import org.apache.spark.sql.SparkSession
import org.apache.spark.sql.functions._

object MetadataProcessor {

  def main(args: Array[String]): Unit = {

    if (args.length < 1) {
      println("Usage: MetadataProcessor <chunks-json-file>")
      System.exit(1)
    }

    val inputFile = args(0)

    val spark = SparkSession.builder()
      .appName("RAG-Powered-Document-Intelligence-Assistant-MetadataProcessor")
      .master("local[*]")
      .config("spark.hadoop.fs.permissions.umask-mode", "000")
      .getOrCreate()

    println("========================================")
    println("Scala Spark Metadata Processor Started")
    println("========================================")

    // The Python worker writes JSON Lines (NDJSON).
    // Each line contains one chunk as a JSON object.
    val chunks = spark.read
      .json(inputFile)

    println(s"Input file: $inputFile")
    println(s"Total chunks: ${chunks.count()}")

    val processed = chunks
      .withColumn(
        "contentLength",
        length(col("content"))
      )
      .withColumn(
        "wordCount",
        size(
          split(
            trim(col("content")),
            "\\s+"
          )
        )
      )
      .withColumn(
        "processedBy",
        lit("Scala Spark")
      )

    println("Metadata processing completed successfully.")

    processed.select(
      "documentId",
      "chunkIndex",
      "contentLength",
      "wordCount",
      "processedBy"
    ).show(10, false)

    val outputPath = "output/scala_document_metadata"

    val metadataRows = processed.select(
      "documentId",
      "chunkIndex",
      "contentLength",
      "wordCount",
      "processedBy"
    ).collect()

    val outputFile = new java.io.File(
      outputPath + ".json"
    )

    outputFile.getParentFile.mkdirs()

    val writer = new java.io.PrintWriter(
      outputFile,
      "UTF-8"
    )

    try {

      metadataRows.foreach { row =>

        val documentId =
          row.getAs[Any]("documentId").toString

        val chunkIndex =
          row.getAs[Any]("chunkIndex").toString

        val contentLength =
          row.getAs[Any]("contentLength").toString

        val wordCount =
          row.getAs[Any]("wordCount").toString

        val processedBy =
          row.getAs[Any]("processedBy").toString

        writer.println(
          s"""{"documentId":"$documentId","chunkIndex":$chunkIndex,"contentLength":$contentLength,"wordCount":$wordCount,"processedBy":"$processedBy"}"""
        )
      }

    } finally {
      writer.close()
    }

    println("========================================")
    println("SCALA SPARK PROCESSING SUCCESSFUL")
    println(s"Output: $outputFile")
    println("========================================")

    spark.stop()
  }
}