package com.raptors.team.event;

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
public class TeamKafkaConfig {

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    @Bean
    public ConsumerFactory<String, EventFacts> eventFactsConsumerFactory() {
        JsonDeserializer<EventFacts> deserializer = new JsonDeserializer<>(EventFacts.class, false);
        deserializer.setRemoveTypeHeaders(true);
        deserializer.addTrustedPackages("*");

        Map<String, Object> props = new HashMap<>();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, "team-service");
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");

        return new DefaultKafkaConsumerFactory<>(props,
                new ErrorHandlingDeserializer<>(new StringDeserializer()),
                new ErrorHandlingDeserializer<>(deserializer));
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, EventFacts> eventFactsListenerFactory(
            ConsumerFactory<String, EventFacts> eventFactsConsumerFactory) {
        ConcurrentKafkaListenerContainerFactory<String, EventFacts> factory = new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(eventFactsConsumerFactory);
        return factory;
    }
}
