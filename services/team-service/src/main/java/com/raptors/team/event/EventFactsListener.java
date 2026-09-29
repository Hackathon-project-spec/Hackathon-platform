package com.raptors.team.event;

import com.raptors.team.domain.EventCache;
import com.raptors.team.repository.EventCacheRepository;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class EventFactsListener {

    private final EventCacheRepository repository;

    public EventFactsListener(EventCacheRepository repository) {
        this.repository = repository;
    }

    @KafkaListener(topics = {"event.created", "event.updated"}, containerFactory = "eventFactsListenerFactory")
    public void onEventFacts(EventFacts facts) {
        EventCache cache = repository.findById(facts.eventId())
                .orElse(new EventCache(facts.eventId(), facts.name(), facts.registrationClosesAt(),
                        facts.submissionDeadline(), facts.maxTeamSize()));
        cache.setName(facts.name());
        cache.setRegistrationClosesAt(facts.registrationClosesAt());
        cache.setSubmissionDeadline(facts.submissionDeadline());
        cache.setMaxTeamSize(facts.maxTeamSize());
        repository.save(cache);
    }
}
