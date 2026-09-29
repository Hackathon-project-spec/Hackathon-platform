package com.raptors.team.repository;

import com.raptors.team.domain.EventCache;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface EventCacheRepository extends JpaRepository<EventCache, UUID> {
}
