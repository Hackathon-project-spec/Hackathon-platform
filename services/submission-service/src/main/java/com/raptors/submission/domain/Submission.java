package com.raptors.submission.domain;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "submissions", uniqueConstraints = @UniqueConstraint(columnNames = {"eventId", "teamId"}))
public class Submission {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private UUID eventId;

    @Column(nullable = false)
    private UUID teamId;

    private UUID trackId;

    @Column(nullable = false)
    private String title;

    private String tagline;

    @Column(length = 8000)
    private String description;

    private String repoUrl;
    private String demoUrl;
    private String videoUrl;
    private String coverImageUrl;

    /** Comma-separated for simplicity; a real build might normalize this into its own table. */
    private String techStack;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubmissionStatus status = SubmissionStatus.DRAFT;

    private Instant submittedAt;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    protected Submission() {}

    public Submission(UUID eventId, UUID teamId, String title) {
        this.eventId = eventId;
        this.teamId = teamId;
        this.title = title;
    }

    public void touch() { this.updatedAt = Instant.now(); }

    public UUID getId() { return id; }
    public UUID getEventId() { return eventId; }
    public UUID getTeamId() { return teamId; }
    public UUID getTrackId() { return trackId; }
    public void setTrackId(UUID trackId) { this.trackId = trackId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getTagline() { return tagline; }
    public void setTagline(String tagline) { this.tagline = tagline; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getRepoUrl() { return repoUrl; }
    public void setRepoUrl(String repoUrl) { this.repoUrl = repoUrl; }
    public String getDemoUrl() { return demoUrl; }
    public void setDemoUrl(String demoUrl) { this.demoUrl = demoUrl; }
    public String getVideoUrl() { return videoUrl; }
    public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }
    public String getCoverImageUrl() { return coverImageUrl; }
    public void setCoverImageUrl(String coverImageUrl) { this.coverImageUrl = coverImageUrl; }
    public String getTechStack() { return techStack; }
    public void setTechStack(String techStack) { this.techStack = techStack; }
    public SubmissionStatus getStatus() { return status; }
    public void setStatus(SubmissionStatus status) { this.status = status; }
    public Instant getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(Instant submittedAt) { this.submittedAt = submittedAt; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    public enum SubmissionStatus { DRAFT, SUBMITTED }
}
