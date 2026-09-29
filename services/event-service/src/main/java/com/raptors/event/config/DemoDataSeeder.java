package com.raptors.event.config;

import com.raptors.event.domain.Event;
import com.raptors.event.domain.Prize;
import com.raptors.event.domain.Track;
import com.raptors.event.event.EventEvents;
import com.raptors.event.repository.EventRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

/**
 * Seeds one realistic demo event so `docker compose up` produces a browsable
 * platform immediately. Team formation, submissions, and judging are exercised
 * live (through the API / demo video) rather than pre-seeded, since those are
 * exactly the flows the acceptance suite and demo walk through.
 *
 * Event id is fixed so other services/tests can refer to it deterministically.
 */
@Component
@Profile({"docker", "local"})
public class DemoDataSeeder implements CommandLineRunner {

    public static final UUID DEMO_EVENT_ID = UUID.fromString("20000000-0000-0000-0000-000000000001");
    private static final UUID DEMO_ORGANIZER_ID = UUID.fromString("00000000-0000-0000-0000-000000000002");

    private final EventRepository repository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public DemoDataSeeder(EventRepository repository, KafkaTemplate<String, Object> kafkaTemplate) {
        this.repository = repository;
        this.kafkaTemplate = kafkaTemplate;
    }

    @Override
    public void run(String... args) {
        if (repository.existsById(DEMO_EVENT_ID)) return;

        Instant now = Instant.now();
        Event event = new Event(
                "Hackathon Raptors Demo 2026",
                "A demonstration event seeded on startup: registration and hacking are open now, "
                        + "so you can immediately form a team and submit a project.",
                DEMO_ORGANIZER_ID,
                now.minus(1, ChronoUnit.DAYS),   // registration opened yesterday
                now.plus(6, ChronoUnit.DAYS),    // registration closes in 6 days
                now.minus(1, ChronoUnit.DAYS),   // hacking started yesterday
                now.plus(7, ChronoUnit.DAYS),    // submission deadline in 7 days
                4
        );
        event.setVotingOpensAt(now.plus(7, ChronoUnit.DAYS));
        event.setVotingClosesAt(now.plus(9, ChronoUnit.DAYS));
        event.setJudgingOpensAt(now.plus(7, ChronoUnit.DAYS));
        event.setJudgingClosesAt(now.plus(9, ChronoUnit.DAYS));
        event.setResultsPublishedAt(now.plus(10, ChronoUnit.DAYS));
        event.setStatus(Event.EventStatus.LIVE);

        setId(event, DEMO_EVENT_ID);

        event.getTracks().add(new Track(event, "AI / ML", "Projects applying machine learning to a real problem."));
        event.getTracks().add(new Track(event, "Web & Mobile", "Full-stack or mobile apps solving an everyday need."));

        event.getPrizes().add(new Prize(event, "Grand Prize", "Best overall project", null, 1));
        event.getPrizes().add(new Prize(event, "Best AI/ML Project", "Track winner", null, 1));

        repository.save(event);

        kafkaTemplate.send(EventEvents.EVENT_CREATED, event.getId().toString(),
                EventEvents.EventCreated.now(event.getId(), event.getName(), event.getOrganizerId(),
                        event.getSubmissionDeadline(), event.getRegistrationClosesAt(), event.getMaxTeamSize()));
    }

    /** JPA entities generate their own id; reflection sets our fixed demo id after construction. */
    private void setId(Event event, UUID id) {
        try {
            var field = Event.class.getDeclaredField("id");
            field.setAccessible(true);
            field.set(event, id);
        } catch (ReflectiveOperationException e) {
            throw new IllegalStateException("Failed to seed demo event id", e);
        }
    }
}
