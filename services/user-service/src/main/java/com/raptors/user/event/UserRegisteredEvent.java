package com.raptors.user.event;

import java.time.Instant;
import java.util.UUID;

/**
 * Published to the "user.registered" topic whenever a brand-new identity is
 * synced from Keycloak. Other services (notification-service, team-service's
 * read model, etc.) consume this instead of calling user-service synchronously.
 */
public record UserRegisteredEvent(
        UUID userId,
        String email,
        String firstName,
        String lastName,
        String primaryRole,
        Instant occurredAt
) {
    public static UserRegisteredEvent now(UUID userId, String email, String firstName, String lastName, String primaryRole) {
        return new UserRegisteredEvent(userId, email, firstName, lastName, primaryRole, Instant.now());
    }
}
