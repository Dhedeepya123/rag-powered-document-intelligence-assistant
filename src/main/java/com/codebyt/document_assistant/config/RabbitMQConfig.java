package com.codebyt.document_assistant.config;

import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String DOCUMENT_PROCESSING_QUEUE =
            "document-processing";

    public static final String PYSPARK_PROCESSING_QUEUE =
            "pyspark-processing";

    public static final String EMBEDDING_PROCESSING_QUEUE =
            "embedding-processing";

    @Bean
    public Queue documentProcessingQueue() {
        return new Queue(DOCUMENT_PROCESSING_QUEUE, true);
    }

    @Bean
    public Queue pysparkProcessingQueue() {
        return new Queue(PYSPARK_PROCESSING_QUEUE, true);
    }

    @Bean
    public Queue embeddingProcessingQueue() {
        return new Queue(EMBEDDING_PROCESSING_QUEUE, true);
    }

    @Bean
    public Jackson2JsonMessageConverter jackson2JsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(
            ConnectionFactory connectionFactory,
            Jackson2JsonMessageConverter messageConverter) {

        RabbitTemplate rabbitTemplate =
                new RabbitTemplate(connectionFactory);

        rabbitTemplate.setMessageConverter(messageConverter);

        return rabbitTemplate;
    }
}