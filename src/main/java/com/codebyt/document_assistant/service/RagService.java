package com.codebyt.document_assistant.service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RagService {

private final VectorStore vectorStore;
private final ChatClient chatClient;

public RagService(
        VectorStore vectorStore,
        ChatClient.Builder chatClientBuilder) {

    this.vectorStore = vectorStore;
    this.chatClient = chatClientBuilder.build();
}

public String ask(String question) {

    List<Document> documents = vectorStore.similaritySearch(
            SearchRequest.builder()
                    .query(question)
                    .topK(5)
                    .build()
    );

    if (documents == null || documents.isEmpty()) {
        return "I could not find relevant information in the uploaded documents.";
    }

    StringBuilder context = new StringBuilder();

    for (Document document : documents) {
        context.append(document.getText());
        context.append("\n\n");
    }

    String prompt = """
            You are a document intelligence assistant.

            Answer the user's question using ONLY the information
            provided in the document context below.

            If the answer cannot be found in the context,
            say that the information is not available in the uploaded document.

            DOCUMENT CONTEXT:
            %s

            USER QUESTION:
            %s
            """.formatted(context, question);

    return chatClient
            .prompt()
            .user(prompt)
            .call()
            .content();
}

}
