package com.raptors.event.domain;

import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "tracks")
public class Track {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Column(nullable = false)
    private String name;

    @Column(length = 2000)
    private String description;

    protected Track() {}

    public Track(Event event, String name, String description) {
        this.event = event;
        this.name = name;
        this.description = description;
    }

    public UUID getId() { return id; }
    public Event getEvent() { return event; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
