package com.raptors.team.event;

import java.time.Instant;
import java.util.UUID;

public class TeamEvents {
    private TeamEvents() {}

    public static final String TEAM_CREATED = "team.created";
    public static final String TEAM_MEMBER_JOINED = "team.member-joined";

    public record TeamCreated(UUID teamId, UUID eventId, String name, UUID ownerId, Instant occurredAt) {
        public static TeamCreated now(UUID teamId, UUID eventId, String name, UUID ownerId) {
            return new TeamCreated(teamId, eventId, name, ownerId, Instant.now());
        }
    }

    public record TeamMemberJoined(UUID teamId, UUID eventId, UUID userId, String role, Instant occurredAt) {
        public static TeamMemberJoined now(UUID teamId, UUID eventId, UUID userId, String role) {
            return new TeamMemberJoined(teamId, eventId, userId, role, Instant.now());
        }
    }
}
