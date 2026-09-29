package com.raptors.submission.event;

import java.time.Instant;
import java.util.UUID;

/** Mirrors team-service's TeamEvents.TeamMemberJoined. */
public record TeamMemberJoinedFacts(UUID teamId, UUID eventId, UUID userId, String role, Instant occurredAt) {}
