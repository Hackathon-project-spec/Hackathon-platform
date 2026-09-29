package com.raptors.judging.domain;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "scores", uniqueConstraints = @UniqueConstraint(columnNames = {"judgeId", "submissionId", "criterionId"}))
public class Score {

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
    private UUID criterionId;

    @Column(nullable = false)
    private double value;

    @Column(length = 2000)
    private String notes;

    @Column(nullable = false)
    private Instant scoredAt = Instant.now();

    protected Score() {}

    public Score(UUID eventId, UUID judgeId, UUID submissionId, UUID criterionId, double value, String notes) {
        this.eventId = eventId;
        this.judgeId = judgeId;
        this.submissionId = submissionId;
        this.criterionId = criterionId;
        this.value = value;
        this.notes = notes;
    }

    public UUID getId() { return id; }
    public UUID getEventId() { return eventId; }
    public UUID getJudgeId() { return judgeId; }
    public UUID getSubmissionId() { return submissionId; }
    public UUID getCriterionId() { return criterionId; }
    public double getValue() { return value; }
    public void setValue(double value) { this.value = value; this.scoredAt = Instant.now(); }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public Instant getScoredAt() { return scoredAt; }
}
