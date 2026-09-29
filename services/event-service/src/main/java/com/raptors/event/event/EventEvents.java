package com.raptors.event.event;

import java.time.Instant;
import java.util.UUID;

public class EventEvents {
    private EventEvents() {}

    public static final String EVENT_CREATED = "event.created";
    public static final String EVENT_UPDATED = "event.updated";
    public static final String EVENT_PUBLISHED = "event.published";
    public static final String EVENT_STATUS_CHANGED = "event.status-changed";

    public record EventCreated(UUID eventId, String name, UUID organizerId, Instant submissionDeadline,
                                Instant registrationClosesAt, int maxTeamSize, Instant occurredAt) {
        public static EventCreated now(UUID eventId, String name, UUID organizerId, Instant deadline,
                                        Instant registrationClosesAt, int maxTeamSize) {
            return new EventCreated(eventId, name, organizerId, deadline, registrationClosesAt, maxTeamSize, Instant.now());
        }
    }

    public record EventStatusChanged(UUID eventId, String previousStatus, String newStatus, Instant occurredAt) {
        public static EventStatusChanged now(UUID eventId, String prev, String next) {
            return new EventStatusChanged(eventId, prev, next, Instant.now());
        }
    }
}
