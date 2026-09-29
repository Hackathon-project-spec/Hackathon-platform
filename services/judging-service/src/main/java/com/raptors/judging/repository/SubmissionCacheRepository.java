package com.raptors.judging.repository;

import com.raptors.judging.domain.SubmissionCache;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SubmissionCacheRepository extends JpaRepository<SubmissionCache, UUID> {
    List<SubmissionCache> findByEventId(UUID eventId);
}
