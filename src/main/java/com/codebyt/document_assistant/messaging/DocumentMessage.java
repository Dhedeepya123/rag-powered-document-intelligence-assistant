package com.codebyt.document_assistant.messaging;

public class DocumentMessage {

    private Long documentId;
    private String fileName;
    private String filePath;

    public DocumentMessage() {
    }

    public DocumentMessage(Long documentId, String fileName) {
        this.documentId = documentId;
        this.fileName = fileName;
        this.filePath = "uploads/" + fileName;
    }

    public DocumentMessage(Long documentId, String fileName, String filePath) {
        this.documentId = documentId;
        this.fileName = fileName;
        this.filePath = filePath;
    }

    public Long getDocumentId() {
        return documentId;
    }

    public void setDocumentId(Long documentId) {
        this.documentId = documentId;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }
}