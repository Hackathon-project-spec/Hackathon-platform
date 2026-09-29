package com.raptors.team.domain;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "teams", uniqueConstraints = @UniqueConstraint(columnNames = {"eventId", "name"}))
public class Team {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private UUID eventId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private UUID ownerId;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    protected Team() {}

    public Team(UUID eventId, String name, UUID ownerId) {
        this.eventId = eventId;
        this.name = name;
        this.ownerId = ownerId;
    }

    public UUID getId() { return id; }
    public UUID getEventId() { return eventId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public UUID getOwnerId() { return ownerId; }
    public Instant getCreatedAt() { return createdAt; }
}
