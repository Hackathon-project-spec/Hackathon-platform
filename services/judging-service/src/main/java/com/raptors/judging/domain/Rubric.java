package com.raptors.judging.domain;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "rubrics")
public class Rubric {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private UUID eventId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private boolean active = true;

    @OneToMany(mappedBy = "rubric", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RubricCriterion> criteria = new ArrayList<>();

    protected Rubric() {}

    public Rubric(UUID eventId, String name) {
        this.eventId = eventId;
        this.name = name;
    }

    public UUID getId() { return id; }
    public UUID getEventId() { return eventId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public List<RubricCriterion> getCriteria() { return criteria; }
}
