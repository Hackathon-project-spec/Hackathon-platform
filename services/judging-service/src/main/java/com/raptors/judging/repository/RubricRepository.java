package com.raptors.judging.repository;

import com.raptors.judging.domain.Rubric;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RubricRepository extends JpaRepository<Rubric, UUID> {
    List<Rubric> findByEventId(UUID eventId);
    Optional<Rubric> findByEventIdAndActiveTrue(UUID eventId);
}
