package com.raptors.team.repository;

import com.raptors.team.domain.Team;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TeamRepository extends JpaRepository<Team, UUID> {
    List<Team> findByEventId(UUID eventId);
}
