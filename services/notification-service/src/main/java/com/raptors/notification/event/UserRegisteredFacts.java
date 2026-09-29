package com.raptors.notification.event;

import java.time.Instant;
import java.util.UUID;

public record UserRegisteredFacts(UUID userId, String email, String firstName, String lastName, String primaryRole, Instant occurredAt) {}
