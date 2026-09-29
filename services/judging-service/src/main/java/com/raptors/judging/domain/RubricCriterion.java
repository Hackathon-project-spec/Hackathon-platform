package com.raptors.judging.domain;

import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "rubric_criteria")
public class RubricCriterion {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rubric_id", nullable = false)
    private Rubric rubric;

    @Column(nullable = false)
    private String name;

    private String description;

    /** Relative weight; criteria weights need not sum to 1 — they're normalized at scoring time. */
    @Column(nullable = false)
    private double weight;

    @Column(nullable = false)
    private double minScore = 0;

    @Column(nullable = false)
    private double maxScore = 10;

    protected RubricCriterion() {}

    public RubricCriterion(Rubric rubric, String name, String description, double weight, double minScore, double maxScore) {
        this.rubric = rubric;
        this.name = name;
        this.description = description;
        this.weight = weight;
        this.minScore = minScore;
        this.maxScore = maxScore;
    }

    public UUID getId() { return id; }
    public Rubric getRubric() { return rubric; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public double getWeight() { return weight; }
    public void setWeight(double weight) { this.weight = weight; }
    public double getMinScore() { return minScore; }
    public void setMinScore(double minScore) { this.minScore = minScore; }
    public double getMaxScore() { return maxScore; }
    public void setMaxScore(double maxScore) { this.maxScore = maxScore; }
}
