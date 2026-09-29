package com.raptors.event.domain;

import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "prizes")
public class Prize {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Column(nullable = false)
    private String title;

    private String description;

    /** Optional: prize is scoped to one track, or null for overall/best-in-show. */
    private UUID trackId;

    private int rank; // 1 = first place, etc.

    protected Prize() {}

    public Prize(Event event, String title, String description, UUID trackId, int rank) {
        this.event = event;
        this.title = title;
        this.description = description;
        this.trackId = trackId;
        this.rank = rank;
    }

    public UUID getId() { return id; }
    public Event getEvent() { return event; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public UUID getTrackId() { return trackId; }
    public void setTrackId(UUID trackId) { this.trackId = trackId; }
    public int getRank() { return rank; }
    public void setRank(int rank) { this.rank = rank; }
}
