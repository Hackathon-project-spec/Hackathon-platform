package com.raptors.submission.domain;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

/**
 * One row per (submission, voter) — the unique constraint IS the anti-abuse
 * mechanism: a signed-in identity can vote for a given project exactly once.
 * Re-voting updates the existing row rather than creating a duplicate.
 */
@Entity
@Table(name = "votes", uniqueConstraints = @UniqueConstraint(columnNames = {"submissionId", "voterId"}))
public class Vote {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private UUID submissionId;

    @Column(nullable = false)
    private UUID voterId;

    @Column(nullable = false)
    private Instant votedAt = Instant.now();

    protected Vote() {}

    public Vote(UUID submissionId, UUID voterId) {
        this.submissionId = submissionId;
        this.voterId = voterId;
    }

    public UUID getId() { return id; }
    public UUID getSubmissionId() { return submissionId; }
    public UUID getVoterId() { return voterId; }
    public Instant getVotedAt() { return votedAt; }
}
