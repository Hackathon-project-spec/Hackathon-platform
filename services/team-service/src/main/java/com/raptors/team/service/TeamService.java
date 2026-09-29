package com.raptors.team.service;

import com.raptors.team.domain.*;
import com.raptors.team.dto.TeamDtos.CreateInviteRequest;
import com.raptors.team.dto.TeamDtos.CreateTeamRequest;
import com.raptors.team.event.TeamEvents;
import com.raptors.team.repository.EventCacheRepository;
import com.raptors.team.repository.TeamInviteRepository;
import com.raptors.team.repository.TeamMemberRepository;
import com.raptors.team.repository.TeamRepository;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
public class TeamService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository memberRepository;
    private final TeamInviteRepository inviteRepository;
    private final EventCacheRepository eventCacheRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final SecureRandom random = new SecureRandom();

    public TeamService(TeamRepository teamRepository, TeamMemberRepository memberRepository,
                        TeamInviteRepository inviteRepository, EventCacheRepository eventCacheRepository,
                        KafkaTemplate<String, Object> kafkaTemplate) {
        this.teamRepository = teamRepository;
        this.memberRepository = memberRepository;
        this.inviteRepository = inviteRepository;
        this.eventCacheRepository = eventCacheRepository;
        this.kafkaTemplate = kafkaTemplate;
    }

    @Transactional
    public Team createTeam(UUID ownerId, CreateTeamRequest req) {
        EventCache event = eventCacheRepository.findById(req.eventId())
                .orElseThrow(() -> new NoSuchElementException("Unknown event: " + req.eventId()));

        if (Instant.now().isAfter(event.getRegistrationClosesAt())) {
            throw new IllegalStateException("Registration is closed for this event");
        }
        if (memberRepository.findByEventIdAndUserId(req.eventId(), ownerId).isPresent()) {
            throw new IllegalStateException("You are already on a team for this event");
        }

        Team team = teamRepository.save(new Team(req.eventId(), req.name(), ownerId));
        memberRepository.save(new TeamMember(team.getId(), ownerId, req.eventId(), TeamMember.MemberRole.OWNER));

        kafkaTemplate.send(TeamEvents.TEAM_CREATED, team.getId().toString(),
                TeamEvents.TeamCreated.now(team.getId(), team.getEventId(), team.getName(), ownerId));
        return team;
    }

    public Team get(UUID id) {
        return teamRepository.findById(id).orElseThrow(() -> new NoSuchElementException("Team not found: " + id));
    }

    public List<TeamMember> members(UUID teamId) {
        return memberRepository.findByTeamId(teamId);
    }

    public List<Team> byEvent(UUID eventId) {
        return teamRepository.findByEventId(eventId);
    }

    @Transactional
    public TeamInvite createInvite(UUID teamId, UUID requesterId, CreateInviteRequest req) {
        Team team = get(teamId);
        requireOwner(team, requesterId);

        String token = generateToken();
        TeamInvite invite = new TeamInvite(teamId, token, requesterId, req.expiresAt(),
                (req.maxUses() != null && req.maxUses() > 0) ? req.maxUses() : Integer.MAX_VALUE);
        return inviteRepository.save(invite);
    }

    @Transactional
    public Team acceptInvite(String token, UUID userId) {
        TeamInvite invite = inviteRepository.findByToken(token)
                .orElseThrow(() -> new NoSuchElementException("Invalid invite link"));

        if (!invite.isUsable(Instant.now())) {
            throw new IllegalStateException("This invite link is no longer valid");
        }

        Team team = get(invite.getTeamId());
        EventCache event = eventCacheRepository.findById(team.getEventId())
                .orElseThrow(() -> new NoSuchElementException("Unknown event: " + team.getEventId()));

        if (Instant.now().isAfter(event.getRegistrationClosesAt())) {
            throw new IllegalStateException("Registration is closed for this event; cannot join a team");
        }
        if (memberRepository.findByEventIdAndUserId(team.getEventId(), userId).isPresent()) {
            throw new IllegalStateException("You are already on a team for this event");
        }
        long currentSize = memberRepository.countByTeamId(team.getId());
        if (currentSize >= event.getMaxTeamSize()) {
            throw new IllegalStateException("This team is already at the maximum size of " + event.getMaxTeamSize());
        }

        memberRepository.save(new TeamMember(team.getId(), userId, team.getEventId(), TeamMember.MemberRole.MEMBER));
        invite.recordUse();

        kafkaTemplate.send(TeamEvents.TEAM_MEMBER_JOINED, team.getId().toString(),
                TeamEvents.TeamMemberJoined.now(team.getId(), team.getEventId(), userId, "MEMBER"));
        return team;
    }

    @Transactional
    public void revokeInvite(UUID inviteId, UUID requesterId) {
        TeamInvite invite = inviteRepository.findById(inviteId)
                .orElseThrow(() -> new NoSuchElementException("Invite not found"));
        Team team = get(invite.getTeamId());
        requireOwner(team, requesterId);
        invite.revoke();
    }

    private void requireOwner(Team team, UUID userId) {
        if (!team.getOwnerId().equals(userId)) {
            throw new SecurityException("Only the team owner can do this");
        }
    }

    private String generateToken() {
        byte[] bytes = new byte[24];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
