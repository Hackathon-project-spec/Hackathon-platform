package com.raptors.submission.event;

import java.time.Instant;
import java.util.UUID;

/** Mirrors event-service's EventEvents.EventCreated (field-for-field JSON match). */
public record EventFacts(
        UUID eventId, String name, UUID organizerId, Instant submissionDeadline,
        Instant registrationClosesAt, int maxTeamSize, Instant occurredAt
) {}
