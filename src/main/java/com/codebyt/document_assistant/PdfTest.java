package com.codebyt.document_assistant;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.text.PDFTextStripper;

import java.io.File;

public class PdfTest {

    public static void main(String[] args) throws Exception {

        File file = new File("uploads/Dhedeepya.pdf");

        System.out.println("File exists: " + file.exists());
        System.out.println("File size: " + file.length());

        try (var document = Loader.loadPDF(file)) {

            System.out.println("Number of pages: " + document.getNumberOfPages());

            PDFTextStripper stripper = new PDFTextStripper();

            String text = stripper.getText(document);

            System.out.println("Extracted characters: " + text.length());

            System.out.println("----- FIRST 1000 CHARACTERS -----");

            System.out.println(
                    text.substring(0, Math.min(1000, text.length()))
            );

            System.out.println("----- END -----");
        }
    }
}