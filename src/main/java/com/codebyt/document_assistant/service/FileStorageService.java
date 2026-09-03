package com.codebyt.document_assistant.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class FileStorageService {

    private final Path uploadDirectory =
            Paths.get("uploads").toAbsolutePath().normalize();

    public FileStorageService() throws IOException {
        Files.createDirectories(uploadDirectory);
    }

    public String storeFile(MultipartFile file) throws IOException {

        String fileName = file.getOriginalFilename();

        if (fileName == null || fileName.isBlank()) {
            throw new IOException("Invalid file name");
        }

        // Prevent path traversal
        fileName = Paths.get(fileName).getFileName().toString();

        Path targetPath = uploadDirectory.resolve(fileName);

        file.transferTo(targetPath);

        return targetPath.toString();
    }
}