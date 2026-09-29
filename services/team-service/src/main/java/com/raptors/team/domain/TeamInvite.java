package com.raptors.team.domain;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "team_invites")
public class TeamInvite {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private UUID teamId;

    @Column(nullable = false, unique = true)
    private String token;

    @Column(nullable = false)
    private UUID createdBy;

    private Instant expiresAt;

    @Column(nullable = false)
    private int maxUses;

    @Column(nullable = false)
    private int usesCount = 0;

    @Column(nullable = false)
    private boolean revoked = false;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    protected TeamInvite() {}

    public TeamInvite(UUID teamId, String token, UUID createdBy, Instant expiresAt, int maxUses) {
        this.teamId = teamId;
        this.token = token;
        this.createdBy = createdBy;
        this.expiresAt = expiresAt;
        this.maxUses = maxUses;
    }

    public boolean isUsable(Instant now) {
        if (revoked) return false;
        if (expiresAt != null && now.isAfter(expiresAt)) return false;
        return usesCount < maxUses;
    }

    public void recordUse() { this.usesCount++; }

    public UUID getId() { return id; }
    public UUID getTeamId() { return teamId; }
    public String getToken() { return token; }
    public UUID getCreatedBy() { return createdBy; }
    public Instant getExpiresAt() { return expiresAt; }
    public int getMaxUses() { return maxUses; }
    public int getUsesCount() { return usesCount; }
    public boolean isRevoked() { return revoked; }
    public void revoke() { this.revoked = true; }
    public Instant getCreatedAt() { return createdAt; }
}
