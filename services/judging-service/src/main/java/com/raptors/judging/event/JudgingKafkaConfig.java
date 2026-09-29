package com.raptors.judging.event;

import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.support.serializer.ErrorHandlingDeserializer;
import org.springframework.kafka.support.serializer.JsonDeserializer;

import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableKafka
public class JudgingKafkaConfig {

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, SubmissionFinalizedFacts> submissionFinalizedListenerFactory() {
        JsonDeserializer<SubmissionFinalizedFacts> deserializer = new JsonDeserializer<>(SubmissionFinalizedFacts.class, false);
        deserializer.setRemoveTypeHeaders(true);
        deserializer.addTrustedPackages("*");

        Map<String, Object> props = new HashMap<>();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, "judging-service");
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");

        ConsumerFactory<String, SubmissionFinalizedFacts> cf = new DefaultKafkaConsumerFactory<>(props,
                new ErrorHandlingDeserializer<>(new StringDeserializer()),
                new ErrorHandlingDeserializer<>(deserializer));

        var factory = new ConcurrentKafkaListenerContainerFactory<String, SubmissionFinalizedFacts>();
        factory.setConsumerFactory(cf);
        return factory;
    }
}
