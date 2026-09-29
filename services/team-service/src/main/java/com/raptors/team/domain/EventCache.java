package com.raptors.team.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

import java.time.Instant;
import java.util.UUID;

/**
 * team-service does not query event-service's database directly (each service
 * owns its own schema). Instead it keeps a small local projection of the
 * event facts it actually needs, kept up to date by consuming
 * event.created / event.updated from Kafka. This avoids a synchronous,
 * availability-coupling REST call on every team-formation request.
 */
@Entity
public class EventCache {

    @Id
    private UUID eventId;

    private String name;
    private Instant registrationClosesAt;
    private Instant submissionDeadline;
    private int maxTeamSize;

    protected EventCache() {}

    public EventCache(UUID eventId, String name, Instant registrationClosesAt, Instant submissionDeadline, int maxTeamSize) {
        this.eventId = eventId;
        this.name = name;
        this.registrationClosesAt = registrationClosesAt;
        this.submissionDeadline = submissionDeadline;
        this.maxTeamSize = maxTeamSize;
    }

    public UUID getEventId() { return eventId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Instant getRegistrationClosesAt() { return registrationClosesAt; }
    public void setRegistrationClosesAt(Instant v) { this.registrationClosesAt = v; }
    public Instant getSubmissionDeadline() { return submissionDeadline; }
    public void setSubmissionDeadline(Instant v) { this.submissionDeadline = v; }
    public int getMaxTeamSize() { return maxTeamSize; }
    public void setMaxTeamSize(int v) { this.maxTeamSize = v; }
}
