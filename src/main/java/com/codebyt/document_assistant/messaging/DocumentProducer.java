package com.codebyt.document_assistant.messaging;

import com.codebyt.document_assistant.config.RabbitMQConfig;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
public class DocumentProducer {

    private final RabbitTemplate rabbitTemplate;

    public DocumentProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void sendDocumentForProcessing(DocumentMessage message) {

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.PYSPARK_PROCESSING_QUEUE,
                message
        );

        System.out.println(
                "Document sent to PySpark queue: " +
                RabbitMQConfig.PYSPARK_PROCESSING_QUEUE
        );
    }
}