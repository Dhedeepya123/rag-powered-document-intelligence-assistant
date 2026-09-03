package com.codebyt.document_assistant.service;

import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmbeddingService {

    private final VectorStore vectorStore;

    public EmbeddingService(VectorStore vectorStore) {
        this.vectorStore = vectorStore;
    }

    public void storeChunks(
            Long documentId,
            List<String> chunks) {

        if (chunks == null || chunks.isEmpty()) {
            return;
        }

        List<Document> documents = new java.util.ArrayList<>();

        for (int i = 0; i < chunks.size(); i++) {

            Document document = new Document(chunks.get(i));

            document.getMetadata().put(
                    "documentId",
                    documentId
            );

            document.getMetadata().put(
                    "chunkIndex",
                    i
            );

            documents.add(document);
        }

        vectorStore.add(documents);
    }
}