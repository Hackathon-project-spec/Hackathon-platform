package com.raptors.event.dto;

import com.raptors.event.domain.Event;
import com.raptors.event.domain.Prize;
import com.raptors.event.domain.Track;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class EventDtos {

    public record CreateEventRequest(
            @NotBlank String name,
            String description,
            @NotNull Instant registrationOpensAt,
            @NotNull Instant registrationClosesAt,
            @NotNull Instant hackingStartsAt,
            @NotNull Instant submissionDeadline,
            @Min(1) int maxTeamSize
    ) {}

    public record UpdateTimelineRequest(
            Instant registrationOpensAt,
            Instant registrationClosesAt,
            Instant hackingStartsAt,
            Instant submissionDeadline,
            Instant votingOpensAt,
            Instant votingClosesAt,
            Instant judgingOpensAt,
            Instant judgingClosesAt,
            Instant resultsPublishedAt
    ) {}

    public record CreateTrackRequest(@NotBlank String name, String description) {}

    public record CreatePrizeRequest(@NotBlank String title, String description, UUID trackId, @Min(1) int rank) {}

    public record TrackResponse(UUID id, String name, String description) {
        public static TrackResponse from(Track t) { return new TrackResponse(t.getId(), t.getName(), t.getDescription()); }
    }

    public record PrizeResponse(UUID id, String title, String description, UUID trackId, int rank) {
        public static PrizeResponse from(Prize p) { return new PrizeResponse(p.getId(), p.getTitle(), p.getDescription(), p.getTrackId(), p.getRank()); }
    }

    public record EventResponse(
            UUID id, String name, String description, UUID organizerId, String status,
            Instant registrationOpensAt, Instant registrationClosesAt, Instant hackingStartsAt,
            Instant submissionDeadline, Instant votingOpensAt, Instant votingClosesAt,
            Instant judgingOpensAt, Instant judgingClosesAt, Instant resultsPublishedAt,
            boolean resultsHiddenDuringVoting, int maxTeamSize,
            List<TrackResponse> tracks, List<PrizeResponse> prizes
    ) {
        public static EventResponse from(Event e) {
            return new EventResponse(
                    e.getId(), e.getName(), e.getDescription(), e.getOrganizerId(), e.getStatus().name(),
                    e.getRegistrationOpensAt(), e.getRegistrationClosesAt(), e.getHackingStartsAt(),
                    e.getSubmissionDeadline(), e.getVotingOpensAt(), e.getVotingClosesAt(),
                    e.getJudgingOpensAt(), e.getJudgingClosesAt(), e.getResultsPublishedAt(),
                    e.isResultsHiddenDuringVoting(), e.getMaxTeamSize(),
                    e.getTracks().stream().map(TrackResponse::from).toList(),
                    e.getPrizes().stream().map(PrizeResponse::from).toList()
            );
        }
    }
}
