package com.raptors.judging.service;

import com.raptors.judging.domain.Rubric;
import com.raptors.judging.domain.RubricCriterion;
import com.raptors.judging.repository.RubricRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
public class RubricService {

    private final RubricRepository repository;

    public RubricService(RubricRepository repository) {
        this.repository = repository;
    }

    public record CriterionInput(String name, String description, double weight, double minScore, double maxScore) {}

    @Transactional
    public Rubric create(UUID eventId, String name, List<CriterionInput> criteria, boolean makeActive) {
        if (makeActive) {
            repository.findByEventIdAndActiveTrue(eventId).ifPresent(existing -> existing.setActive(false));
        }
        Rubric rubric = new Rubric(eventId, name);
        rubric.setActive(makeActive);
        for (CriterionInput c : criteria) {
            rubric.getCriteria().add(new RubricCriterion(rubric, c.name(), c.description(), c.weight(), c.minScore(), c.maxScore()));
        }
        return repository.save(rubric);
    }

    public Rubric get(UUID id) {
        return repository.findById(id).orElseThrow(() -> new NoSuchElementException("Rubric not found: " + id));
    }

    public List<Rubric> byEvent(UUID eventId) {
        return repository.findByEventId(eventId);
    }

    public Rubric activeFor(UUID eventId) {
        return repository.findByEventIdAndActiveTrue(eventId)
                .orElseThrow(() -> new NoSuchElementException("No active rubric for event " + eventId));
    }

    @Transactional
    public Rubric activate(UUID rubricId) {
        Rubric rubric = get(rubricId);
        repository.findByEventIdAndActiveTrue(rubric.getEventId()).ifPresent(existing -> existing.setActive(false));
        rubric.setActive(true);
        return rubric;
    }
}
