package com.codebyt.document_assistant.controller;

import com.codebyt.document_assistant.entity.Document;
import com.codebyt.document_assistant.messaging.DocumentMessage;
import com.codebyt.document_assistant.messaging.DocumentProducer;
import com.codebyt.document_assistant.repository.DocumentRepository;
import com.codebyt.document_assistant.service.FileStorageService;
import com.codebyt.document_assistant.service.RagService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

private final DocumentRepository documentRepository;
private final DocumentProducer documentProducer;
private final FileStorageService fileStorageService;
private final RagService ragService;

public DocumentController(
        DocumentRepository documentRepository,
        DocumentProducer documentProducer,
        FileStorageService fileStorageService,
        RagService ragService) {

    this.documentRepository = documentRepository;
    this.documentProducer = documentProducer;
    this.fileStorageService = fileStorageService;
    this.ragService = ragService;
}

@PostMapping("/upload")
public ResponseEntity<Map<String, Object>> uploadDocument(
        @RequestParam("file") MultipartFile file) {

    Map<String, Object> response = new HashMap<>();

    try {

        if (file.isEmpty()) {
            response.put("error", "File cannot be empty");
            return ResponseEntity.badRequest().body(response);
        }

        String fileName = file.getOriginalFilename();

        if (fileName == null || fileName.isBlank()) {
            response.put("error", "File name is missing");
            return ResponseEntity.badRequest().body(response);
        }

        String lowerCaseFileName = fileName.toLowerCase();

        if (!lowerCaseFileName.endsWith(".pdf")
                && !lowerCaseFileName.endsWith(".docx")) {

            response.put(
                    "error",
                    "Only PDF and DOCX files are supported"
            );

            return ResponseEntity.badRequest().body(response);
        }

        String storedPath = fileStorageService.storeFile(file);

        String fileType = file.getContentType();

        Document document = new Document(fileName, fileType);

        Document savedDocument = documentRepository.save(document);

        String filePath = "uploads/" + savedDocument.getFileName();

        DocumentMessage message = new DocumentMessage(
                savedDocument.getId(),
                savedDocument.getFileName(),
                filePath
        );

        documentProducer.sendDocumentForProcessing(message);

        response.put("message", "Document uploaded successfully");
        response.put("documentId", savedDocument.getId());
        response.put("fileName", savedDocument.getFileName());
        response.put("storedPath", storedPath);
        response.put("status", "PROCESSING");

        return ResponseEntity.ok(response);

    } catch (IOException e) {

        e.printStackTrace();

        response.put(
                "error",
                "Could not store uploaded file: " + e.getMessage()
        );

        return ResponseEntity.internalServerError()
                .body(response);
    }
}

@PostMapping("/ask")
public ResponseEntity<Map<String, Object>> askQuestion(
        @RequestBody Map<String, String> request) {

    Map<String, Object> response = new HashMap<>();

    String question = request.get("question");

    if (question == null || question.isBlank()) {
        response.put("error", "Question cannot be empty");
        return ResponseEntity.badRequest().body(response);
    }

    try {

        System.out.println("Received question: " + question);

        String answer = ragService.ask(question);

        System.out.println("Generated answer successfully.");

        response.put("question", question);
        response.put("answer", answer);

        return ResponseEntity.ok(response);

    } catch (Exception e) {

        System.err.println("ERROR while answering question:");
        e.printStackTrace();

        response.put(
                "error",
                "Could not answer question: " + e.getMessage()
        );

        return ResponseEntity.internalServerError()
                .body(response);
    }
}


}
