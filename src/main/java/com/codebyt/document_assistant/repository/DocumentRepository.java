package com.codebyt.document_assistant.repository;
import com.codebyt.document_assistant.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DocumentRepository extends JpaRepository<Document, Long> {
}