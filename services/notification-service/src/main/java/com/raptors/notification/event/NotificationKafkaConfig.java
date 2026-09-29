package com.raptors.notification.event;

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
public class NotificationKafkaConfig {

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    private <T> ConsumerFactory<String, T> factoryFor(Class<T> type) {
        JsonDeserializer<T> deserializer = new JsonDeserializer<>(type, false);
        deserializer.setRemoveTypeHeaders(true);
        deserializer.addTrustedPackages("*");
        Map<String, Object> props = new HashMap<>();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, "notification-service");
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        return new DefaultKafkaConsumerFactory<>(props,
                new ErrorHandlingDeserializer<>(new StringDeserializer()),
                new ErrorHandlingDeserializer<>(deserializer));
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, UserRegisteredFacts> userRegisteredListenerFactory() {
        var factory = new ConcurrentKafkaListenerContainerFactory<String, UserRegisteredFacts>();
        factory.setConsumerFactory(factoryFor(UserRegisteredFacts.class));
        return factory;
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, TeamMemberJoinedFacts> teamMemberJoinedListenerFactory() {
        var factory = new ConcurrentKafkaListenerContainerFactory<String, TeamMemberJoinedFacts>();
        factory.setConsumerFactory(factoryFor(TeamMemberJoinedFacts.class));
        return factory;
    }
}
