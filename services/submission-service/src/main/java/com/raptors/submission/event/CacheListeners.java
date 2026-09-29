package com.raptors.submission.event;

import com.raptors.submission.domain.EventCache;
import com.raptors.submission.domain.TeamCache;
import com.raptors.submission.repository.EventCacheRepository;
import com.raptors.submission.repository.TeamCacheRepository;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class CacheListeners {

    private final EventCacheRepository eventCacheRepository;
    private final TeamCacheRepository teamCacheRepository;

    public CacheListeners(EventCacheRepository eventCacheRepository, TeamCacheRepository teamCacheRepository) {
        this.eventCacheRepository = eventCacheRepository;
        this.teamCacheRepository = teamCacheRepository;
    }

    @KafkaListener(topics = {"event.created", "event.updated"}, containerFactory = "eventFactsListenerFactory")
    public void onEvent(EventFacts facts) {
        EventCache cache = eventCacheRepository.findById(facts.eventId())
                .orElse(new EventCache(facts.eventId(), facts.name(), facts.submissionDeadline()));
        cache.setName(facts.name());
        cache.setSubmissionDeadline(facts.submissionDeadline());
        eventCacheRepository.save(cache);
    }

    @KafkaListener(topics = "team.created", containerFactory = "teamCreatedListenerFactory")
    public void onTeamCreated(TeamCreatedFacts facts) {
        TeamCache cache = new TeamCache(facts.teamId(), facts.eventId(), facts.name());
        cache.addMember(facts.ownerId());
        teamCacheRepository.save(cache);
    }

    @KafkaListener(topics = "team.member-joined", containerFactory = "teamMemberJoinedListenerFactory")
    public void onMemberJoined(TeamMemberJoinedFacts facts) {
        teamCacheRepository.findById(facts.teamId()).ifPresentOrElse(
                cache -> {
                    cache.addMember(facts.userId());
                    teamCacheRepository.save(cache);
                },
                () -> {
                    // Team-created event hasn't arrived yet (out-of-order delivery) —
                    // create a minimal cache row and fill it in when it does.
                    TeamCache cache = new TeamCache(facts.teamId(), facts.eventId(), "");
                    cache.addMember(facts.userId());
                    teamCacheRepository.save(cache);
                }
        );
    }
}
