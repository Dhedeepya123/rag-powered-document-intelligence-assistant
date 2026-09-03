package com.codebyt.document_assistant.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;

@Service
public class DocumentExtractionService {

    public String extractText(String filePath) throws IOException {

        Path path = Path.of(filePath);

        if (!Files.exists(path)) {
            throw new IOException("File not found: " + filePath);
        }

        String lowerCasePath = filePath.toLowerCase();

        if (lowerCasePath.endsWith(".pdf")) {
            return extractPdfText(path);
        }

        if (lowerCasePath.endsWith(".docx")) {
            return extractDocxText(path);
        }

        throw new IOException("Unsupported file type. Only PDF and DOCX are supported.");
    }

    private String extractPdfText(Path path) throws IOException {

        try (var document = Loader.loadPDF(path.toFile())) {

            PDFTextStripper stripper = new PDFTextStripper();

            return stripper.getText(document);
        }
    }

    private String extractDocxText(Path path) throws IOException {

        StringBuilder text = new StringBuilder();

        try (InputStream inputStream = Files.newInputStream(path);
             XWPFDocument document = new XWPFDocument(inputStream)) {

            for (XWPFParagraph paragraph : document.getParagraphs()) {

                String paragraphText = paragraph.getText();

                if (paragraphText != null && !paragraphText.isBlank()) {
                    text.append(paragraphText);
                    text.append(System.lineSeparator());
                }
            }
        }

        return text.toString();
    }
}