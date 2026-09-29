package com.raptors.judging.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

import java.util.UUID;

/** Local projection: only finalized (SUBMITTED) projects are judgeable. Kept via Kafka. */
@Entity
public class SubmissionCache {
    @Id
    private UUID submissionId;

    private UUID eventId;
    private UUID teamId;
    private UUID trackId;
    private String title;

    protected SubmissionCache() {}

    public SubmissionCache(UUID submissionId, UUID eventId, UUID teamId, UUID trackId, String title) {
        this.submissionId = submissionId;
        this.eventId = eventId;
        this.teamId = teamId;
        this.trackId = trackId;
        this.title = title;
    }

    public UUID getSubmissionId() { return submissionId; }
    public UUID getEventId() { return eventId; }
    public UUID getTeamId() { return teamId; }
    public UUID getTrackId() { return trackId; }
    public String getTitle() { return title; }
}
