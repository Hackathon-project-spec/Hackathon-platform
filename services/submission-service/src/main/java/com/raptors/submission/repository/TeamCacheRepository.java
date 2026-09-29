package com.raptors.submission.repository;

import com.raptors.submission.domain.TeamCache;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface TeamCacheRepository extends JpaRepository<TeamCache, UUID> {
}
