package com.raptors.team.event;

import java.time.Instant;
import java.util.UUID;

/**
 * Structurally matches event-service's EventEvents.EventCreated record
 * (field-for-field, since JSON type headers are disabled cluster-wide —
 * see config-repo/application.yml). Consumed from both "event.created" and
 * "event.updated" to keep the local EventCache projection current.
 */
public record EventFacts(
        UUID eventId,
        String name,
        UUID organizerId,
        Instant submissionDeadline,
        Instant registrationClosesAt,
        int maxTeamSize,
        Instant occurredAt
) {}
