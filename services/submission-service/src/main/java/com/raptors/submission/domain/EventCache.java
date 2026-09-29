package com.raptors.submission.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

import java.time.Instant;
import java.util.UUID;

/** Local projection of the event facts submission-service needs, kept via Kafka. */
@Entity
public class EventCache {
    @Id
    private UUID eventId;
    private String name;
    private Instant submissionDeadline;

    protected EventCache() {}

    public EventCache(UUID eventId, String name, Instant submissionDeadline) {
        this.eventId = eventId;
        this.name = name;
        this.submissionDeadline = submissionDeadline;
    }

    public UUID getEventId() { return eventId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Instant getSubmissionDeadline() { return submissionDeadline; }
    public void setSubmissionDeadline(Instant v) { this.submissionDeadline = v; }
}
