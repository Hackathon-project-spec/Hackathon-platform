package com.raptors.team.repository;

import com.raptors.team.domain.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TeamMemberRepository extends JpaRepository<TeamMember, UUID> {
    List<TeamMember> findByTeamId(UUID teamId);
    Optional<TeamMember> findByEventIdAndUserId(UUID eventId, UUID userId);
    long countByTeamId(UUID teamId);
    List<TeamMember> findByUserId(UUID userId);
}
