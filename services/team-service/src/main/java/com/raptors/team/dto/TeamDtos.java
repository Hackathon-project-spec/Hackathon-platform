package com.raptors.team.dto;

import com.raptors.team.domain.Team;
import com.raptors.team.domain.TeamInvite;
import com.raptors.team.domain.TeamMember;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class TeamDtos {

    public record CreateTeamRequest(@NotNull UUID eventId, @NotBlank String name) {}

    public record CreateInviteRequest(Instant expiresAt, Integer maxUses) {}

    public record MemberResponse(UUID userId, String role, Instant joinedAt) {
        public static MemberResponse from(TeamMember m) {
            return new MemberResponse(m.getUserId(), m.getRole().name(), m.getJoinedAt());
        }
    }

    public record TeamResponse(UUID id, UUID eventId, String name, UUID ownerId, Instant createdAt, List<MemberResponse> members) {
        public static TeamResponse from(Team t, List<TeamMember> members) {
            return new TeamResponse(t.getId(), t.getEventId(), t.getName(), t.getOwnerId(), t.getCreatedAt(),
                    members.stream().map(MemberResponse::from).toList());
        }
    }

    public record InviteResponse(UUID id, UUID teamId, String token, Instant expiresAt, int maxUses, int usesCount, boolean revoked) {
        public static InviteResponse from(TeamInvite i) {
            return new InviteResponse(i.getId(), i.getTeamId(), i.getToken(), i.getExpiresAt(), i.getMaxUses(), i.getUsesCount(), i.isRevoked());
        }
    }
}
