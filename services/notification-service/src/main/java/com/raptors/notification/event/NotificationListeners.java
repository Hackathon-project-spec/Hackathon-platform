package com.raptors.notification.event;

import com.raptors.notification.domain.Notification;
import com.raptors.notification.repository.NotificationRepository;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/**
 * Demonstrates the event-driven notification pattern: every domain service
 * publishes facts, and notification-service is the one place that turns
 * "things that happened" into "things a person is told". Two event types are
 * wired up end-to-end here (user.registered, team.member-joined); adding a
 * new notification for e.g. submission.finalized is the same shape of change.
 */
@Component
public class NotificationListeners {

    private final NotificationRepository repository;

    public NotificationListeners(NotificationRepository repository) {
        this.repository = repository;
    }

    @KafkaListener(topics = "user.registered", containerFactory = "userRegisteredListenerFactory")
    public void onUserRegistered(UserRegisteredFacts facts) {
        repository.save(new Notification(facts.userId(), "WELCOME",
                "Welcome to Hackathon Raptors, " + facts.firstName() + "!"));
    }

    @KafkaListener(topics = "team.member-joined", containerFactory = "teamMemberJoinedListenerFactory")
    public void onMemberJoined(TeamMemberJoinedFacts facts) {
        repository.save(new Notification(facts.userId(), "TEAM_JOINED",
                "You joined a team for event " + facts.eventId()));
    }
}
