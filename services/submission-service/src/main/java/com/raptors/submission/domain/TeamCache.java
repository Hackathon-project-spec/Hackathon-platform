package com.raptors.submission.domain;

import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

/** Local projection of team membership, kept via Kafka events from team-service. */
@Entity
public class TeamCache {
    @Id
    private UUID teamId;

    @Column(nullable = false)
    private UUID eventId;

    @Column(nullable = false)
    private String name;

    @ElementCollection
    @CollectionTable(name = "team_cache_members", joinColumns = @JoinColumn(name = "team_id"))
    @Column(name = "user_id")
    private Set<UUID> memberIds = new HashSet<>();

    protected TeamCache() {}

    public TeamCache(UUID teamId, UUID eventId, String name) {
        this.teamId = teamId;
        this.eventId = eventId;
        this.name = name;
    }

    public boolean hasMember(UUID userId) { return memberIds.contains(userId); }
    public void addMember(UUID userId) { memberIds.add(userId); }

    public UUID getTeamId() { return teamId; }
    public UUID getEventId() { return eventId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Set<UUID> getMemberIds() { return memberIds; }
}
