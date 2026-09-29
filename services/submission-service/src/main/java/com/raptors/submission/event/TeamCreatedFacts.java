package com.raptors.submission.event;

import java.time.Instant;
import java.util.UUID;

/** Mirrors team-service's TeamEvents.TeamCreated. */
public record TeamCreatedFacts(UUID teamId, UUID eventId, String name, UUID ownerId, Instant occurredAt) {}
