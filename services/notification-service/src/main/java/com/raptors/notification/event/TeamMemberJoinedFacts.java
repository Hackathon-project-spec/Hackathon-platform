package com.raptors.notification.event;

import java.time.Instant;
import java.util.UUID;

public record TeamMemberJoinedFacts(UUID teamId, UUID eventId, UUID userId, String role, Instant occurredAt) {}
