package com.raptors.event.domain;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "events")
public class Event {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(length = 4000)
    private String description;

    @Column(nullable = false)
    private UUID organizerId;

    // --- configurable timeline ---
    @Column(nullable = false)
    private Instant registrationOpensAt;
    @Column(nullable = false)
    private Instant registrationClosesAt;
    @Column(nullable = false)
    private Instant hackingStartsAt;
    @Column(nullable = false)
    private Instant submissionDeadline;
    private Instant votingOpensAt;
    private Instant votingClosesAt;
    private Instant judgingOpensAt;
    private Instant judgingClosesAt;
    private Instant resultsPublishedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventStatus status = EventStatus.DRAFT;

    @Column(nullable = false)
    private boolean resultsHiddenDuringVoting = true;

    @Column(nullable = false)
    private int maxTeamSize = 4;

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Track> tracks = new ArrayList<>();

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Prize> prizes = new ArrayList<>();

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    protected Event() {}

    public Event(String name, String description, UUID organizerId,
                 Instant registrationOpensAt, Instant registrationClosesAt,
                 Instant hackingStartsAt, Instant submissionDeadline, int maxTeamSize) {
        this.name = name;
        this.description = description;
        this.organizerId = organizerId;
        this.registrationOpensAt = registrationOpensAt;
        this.registrationClosesAt = registrationClosesAt;
        this.hackingStartsAt = hackingStartsAt;
        this.submissionDeadline = submissionDeadline;
        this.maxTeamSize = maxTeamSize;
    }

    public boolean isSubmissionOpen(Instant now) {
        return status != EventStatus.CANCELLED && now.isBefore(submissionDeadline);
    }

    public boolean isRegistrationOpen(Instant now) {
        return now.isAfter(registrationOpensAt) && now.isBefore(registrationClosesAt);
    }

    public boolean isVotingOpen(Instant now) {
        return votingOpensAt != null && votingClosesAt != null
                && now.isAfter(votingOpensAt) && now.isBefore(votingClosesAt);
    }

    public boolean areResultsVisible(Instant now) {
        if (!resultsHiddenDuringVoting) return true;
        return resultsPublishedAt != null && now.isAfter(resultsPublishedAt);
    }

    // getters/setters
    public UUID getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public UUID getOrganizerId() { return organizerId; }
    public Instant getRegistrationOpensAt() { return registrationOpensAt; }
    public void setRegistrationOpensAt(Instant v) { this.registrationOpensAt = v; }
    public Instant getRegistrationClosesAt() { return registrationClosesAt; }
    public void setRegistrationClosesAt(Instant v) { this.registrationClosesAt = v; }
    public Instant getHackingStartsAt() { return hackingStartsAt; }
    public void setHackingStartsAt(Instant v) { this.hackingStartsAt = v; }
    public Instant getSubmissionDeadline() { return submissionDeadline; }
    public void setSubmissionDeadline(Instant v) { this.submissionDeadline = v; }
    public Instant getVotingOpensAt() { return votingOpensAt; }
    public void setVotingOpensAt(Instant v) { this.votingOpensAt = v; }
    public Instant getVotingClosesAt() { return votingClosesAt; }
    public void setVotingClosesAt(Instant v) { this.votingClosesAt = v; }
    public Instant getJudgingOpensAt() { return judgingOpensAt; }
    public void setJudgingOpensAt(Instant v) { this.judgingOpensAt = v; }
    public Instant getJudgingClosesAt() { return judgingClosesAt; }
    public void setJudgingClosesAt(Instant v) { this.judgingClosesAt = v; }
    public Instant getResultsPublishedAt() { return resultsPublishedAt; }
    public void setResultsPublishedAt(Instant v) { this.resultsPublishedAt = v; }
    public EventStatus getStatus() { return status; }
    public void setStatus(EventStatus status) { this.status = status; }
    public boolean isResultsHiddenDuringVoting() { return resultsHiddenDuringVoting; }
    public void setResultsHiddenDuringVoting(boolean v) { this.resultsHiddenDuringVoting = v; }
    public int getMaxTeamSize() { return maxTeamSize; }
    public void setMaxTeamSize(int maxTeamSize) { this.maxTeamSize = maxTeamSize; }
    public List<Track> getTracks() { return tracks; }
    public List<Prize> getPrizes() { return prizes; }
    public Instant getCreatedAt() { return createdAt; }

    public enum EventStatus { DRAFT, PUBLISHED, LIVE, JUDGING, COMPLETED, CANCELLED }
}
