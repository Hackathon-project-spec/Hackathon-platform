package com.raptors.judging.domain;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "judge_assignments", uniqueConstraints = @UniqueConstraint(columnNames = {"eventId", "judgeId", "submissionId"}))
public class JudgeAssignment {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private UUID eventId;

    @Column(nullable = false)
    private UUID judgeId;

    @Column(nullable = false)
    private UUID submissionId;

    @Column(nullable = false)
    private Instant assignedAt = Instant.now();

    private Instant completedAt;

    protected JudgeAssignment() {}

    public JudgeAssignment(UUID eventId, UUID judgeId, UUID submissionId) {
        this.eventId = eventId;
        this.judgeId = judgeId;
        this.submissionId = submissionId;
    }

    public boolean isComplete() { return completedAt != null; }
    public void markComplete() { this.completedAt = Instant.now(); }

    public UUID getId() { return id; }
    public UUID getEventId() { return eventId; }
    public UUID getJudgeId() { return judgeId; }
    public UUID getSubmissionId() { return submissionId; }
    public Instant getAssignedAt() { return assignedAt; }
    public Instant getCompletedAt() { return completedAt; }
}
