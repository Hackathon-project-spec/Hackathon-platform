package com.raptors.team.controller;

import com.raptors.team.config.CurrentUser;
import com.raptors.team.domain.Team;
import com.raptors.team.domain.TeamInvite;
import com.raptors.team.dto.TeamDtos.*;
import com.raptors.team.repository.TeamMemberRepository;
import com.raptors.team.service.TeamService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
public class TeamController {

    private final TeamService teamService;
    private final TeamMemberRepository memberRepository;

    public TeamController(TeamService teamService, TeamMemberRepository memberRepository) {
        this.teamService = teamService;
        this.memberRepository = memberRepository;
    }

    @PostMapping("/api/teams")
    @PreAuthorize("hasRole('PARTICIPANT')")
    public TeamResponse create(@Valid @RequestBody CreateTeamRequest req) {
        Team team = teamService.createTeam(CurrentUser.id(), req);
        return TeamResponse.from(team, teamService.members(team.getId()));
    }

    @GetMapping("/api/teams/{id}")
    public TeamResponse get(@PathVariable UUID id) {
        Team team = teamService.get(id);
        return TeamResponse.from(team, teamService.members(id));
    }

    @GetMapping("/api/teams")
    public List<TeamResponse> byEvent(@RequestParam UUID eventId) {
        return teamService.byEvent(eventId).stream()
                .map(t -> TeamResponse.from(t, teamService.members(t.getId())))
                .toList();
    }

    @GetMapping("/api/teams/mine")
    @PreAuthorize("isAuthenticated()")
    public List<TeamResponse> mine() {
        return memberRepository.findByUserId(CurrentUser.id()).stream()
                .map(m -> teamService.get(m.getTeamId()))
                .map(t -> TeamResponse.from(t, teamService.members(t.getId())))
                .toList();
    }

    @PostMapping("/api/teams/{id}/invites")
    @PreAuthorize("hasRole('PARTICIPANT')")
    public InviteResponse createInvite(@PathVariable UUID id, @Valid @RequestBody CreateInviteRequest req) {
        TeamInvite invite = teamService.createInvite(id, CurrentUser.id(), req);
        return InviteResponse.from(invite);
    }

    @DeleteMapping("/api/teams/invites/{inviteId}")
    @PreAuthorize("hasRole('PARTICIPANT')")
    public void revokeInvite(@PathVariable UUID inviteId) {
        teamService.revokeInvite(inviteId, CurrentUser.id());
    }

    @PostMapping("/api/invites/{token}/accept")
    @PreAuthorize("hasRole('PARTICIPANT')")
    public TeamResponse acceptInvite(@PathVariable String token) {
        Team team = teamService.acceptInvite(token, CurrentUser.id());
        return TeamResponse.from(team, teamService.members(team.getId()));
    }
}
