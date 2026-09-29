package com.raptors.team.domain;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "team_members", uniqueConstraints = @UniqueConstraint(columnNames = {"teamId", "userId"}))
public class TeamMember {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private UUID teamId;

    @Column(nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private UUID eventId; // denormalized for the "one team per event per user" check

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MemberRole role;

    @Column(nullable = false)
    private Instant joinedAt = Instant.now();

    protected TeamMember() {}

    public TeamMember(UUID teamId, UUID userId, UUID eventId, MemberRole role) {
        this.teamId = teamId;
        this.userId = userId;
        this.eventId = eventId;
        this.role = role;
    }

    public UUID getId() { return id; }
    public UUID getTeamId() { return teamId; }
    public UUID getUserId() { return userId; }
    public UUID getEventId() { return eventId; }
    public MemberRole getRole() { return role; }
    public Instant getJoinedAt() { return joinedAt; }

    public enum MemberRole { OWNER, MEMBER }
}
