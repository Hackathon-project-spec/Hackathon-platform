package com.raptors.submission.repository;

import com.raptors.submission.domain.EventCache;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface EventCacheRepository extends JpaRepository<EventCache, UUID> {
}
