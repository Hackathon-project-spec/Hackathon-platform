package com.raptors.submission.dto;

import com.raptors.submission.domain.Submission;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.UUID;

public class SubmissionDtos {

    public record CreateDraftRequest(@NotNull UUID eventId, @NotNull UUID teamId, @NotBlank String title) {}

    public record UpdateSubmissionRequest(
            String title, String tagline, String description, UUID trackId,
            String repoUrl, String demoUrl, String videoUrl, String coverImageUrl, String techStack
    ) {}

    public record SubmissionResponse(
            UUID id, UUID eventId, UUID teamId, UUID trackId, String title, String tagline,
            String description, String repoUrl, String demoUrl, String videoUrl, String coverImageUrl,
            String techStack, String status, Instant submittedAt, Instant createdAt, Instant updatedAt
    ) {
        public static SubmissionResponse from(Submission s) {
            return new SubmissionResponse(s.getId(), s.getEventId(), s.getTeamId(), s.getTrackId(), s.getTitle(),
                    s.getTagline(), s.getDescription(), s.getRepoUrl(), s.getDemoUrl(), s.getVideoUrl(),
                    s.getCoverImageUrl(), s.getTechStack(), s.getStatus().name(), s.getSubmittedAt(),
                    s.getCreatedAt(), s.getUpdatedAt());
        }
    }

    public record CommentResponse(UUID id, UUID authorId, String body, java.time.Instant createdAt) {
        public static CommentResponse from(com.raptors.submission.domain.Comment c) {
            return new CommentResponse(c.getId(), c.getAuthorId(), c.getBody(), c.getCreatedAt());
        }
    }

    public record AddCommentRequest(@NotBlank String body) {}

    public record TallyResponse(UUID submissionId, long votes) {}
}
