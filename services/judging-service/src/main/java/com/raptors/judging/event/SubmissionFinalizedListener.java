package com.raptors.judging.event;

import com.raptors.judging.domain.SubmissionCache;
import com.raptors.judging.repository.SubmissionCacheRepository;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class SubmissionFinalizedListener {

    private final SubmissionCacheRepository repository;

    public SubmissionFinalizedListener(SubmissionCacheRepository repository) {
        this.repository = repository;
    }

    @KafkaListener(topics = "submission.finalized", containerFactory = "submissionFinalizedListenerFactory")
    public void onFinalized(SubmissionFinalizedFacts facts) {
        if (repository.existsById(facts.submissionId())) return;
        repository.save(new SubmissionCache(facts.submissionId(), facts.eventId(), facts.teamId(), facts.trackId(), facts.title()));
    }
}
