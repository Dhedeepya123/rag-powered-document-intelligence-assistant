package com.codebyt.document_assistant.messaging;

import com.codebyt.document_assistant.config.RabbitMQConfig;
import com.codebyt.document_assistant.service.EmbeddingService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.util.ArrayList;
import java.util.List;

@Service
public class DocumentConsumer {

    private final EmbeddingService embeddingService;
    private final ObjectMapper objectMapper;

    public DocumentConsumer(
            EmbeddingService embeddingService) {

        this.embeddingService = embeddingService;
        this.objectMapper = new ObjectMapper();

        System.out.println("Embedding Consumer initialized.");
        System.out.println(
                "Waiting for processed chunks from PySpark..."
        );
    }

    @RabbitListener(
            queues = RabbitMQConfig.EMBEDDING_PROCESSING_QUEUE
    )
    public void processEmbeddingMessage(
            java.util.Map<String, Object> message) {

        try {

            System.out.println();
            System.out.println(
                    "========================================"
            );
            System.out.println(
                    "Received embedding processing message"
            );
            System.out.println(
                    "========================================"
            );

            System.out.println("Message: " + message);

            Long documentId = Long.valueOf(
                    String.valueOf(
                            message.get("documentId")
                    )
            );

            String chunksFile = String.valueOf(
                    message.get("chunksFile")
            );

            System.out.println(
                    "Document ID: " + documentId
            );

            System.out.println(
                    "Chunks file: " + chunksFile
            );

            File file = new File(chunksFile);

            if (!file.exists()) {

                throw new RuntimeException(
                        "Chunks file not found: "
                                + file.getAbsolutePath()
                );
            }

            List<String> chunks = new ArrayList<>();

            /*
             * PySpark writes the chunks file as JSON Lines.
             *
             * Each line contains one JSON object:
             *
             * {
             *   "documentId": 13,
             *   "chunkIndex": 0,
             *   "content": "..."
             * }
             *
             * Therefore we read the file line by line.
             */

            try (BufferedReader reader =
                         new BufferedReader(
                                 new FileReader(file))) {

                String line;

                while ((line = reader.readLine()) != null) {

                    line = line.trim();

                    if (line.isEmpty()) {
                        continue;
                    }

                    JsonNode chunk =
                            objectMapper.readTree(line);

                    JsonNode contentNode =
                            chunk.get("content");

                    if (contentNode != null
                            && !contentNode.asText().isBlank()) {

                        chunks.add(
                                contentNode.asText()
                        );
                    }
                }
            }

            System.out.println(
                    "Chunks loaded: " + chunks.size()
            );

            if (chunks.isEmpty()) {

                System.out.println(
                        "No chunks found for document "
                                + documentId
                );

                return;
            }

            embeddingService.storeChunks(
                    documentId,
                    chunks
            );

            System.out.println(
                    "Successfully stored "
                            + chunks.size()
                            + " chunks in PGVector."
            );

            System.out.println(
                    "Document embedding processing completed."
            );

        } catch (Exception e) {

            System.err.println();
            System.err.println(
                    "ERROR while processing embedding message:"
            );

            e.printStackTrace();

            throw new RuntimeException(
                    "Embedding processing failed",
                    e
            );
        }
    }
}