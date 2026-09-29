package com.raptors.judging.dto;

import com.raptors.judging.domain.JudgeAssignment;
import com.raptors.judging.domain.Rubric;
import com.raptors.judging.domain.RubricCriterion;
import com.raptors.judging.service.NormalizationService.SubmissionResult;
import com.raptors.judging.service.RubricService.CriterionInput;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class JudgingDtos {

    public record CriterionRequest(@NotBlank String name, String description, double weight, double minScore, double maxScore) {
        public CriterionInput toInput() { return new CriterionInput(name, description, weight, minScore, maxScore); }
    }

    public record CreateRubricRequest(@NotNull UUID eventId, @NotBlank String name,
                                       @NotEmpty List<CriterionRequest> criteria, boolean activate) {}

    public record CriterionResponse(UUID id, String name, String description, double weight, double minScore, double maxScore) {
        public static CriterionResponse from(RubricCriterion c) {
            return new CriterionResponse(c.getId(), c.getName(), c.getDescription(), c.getWeight(), c.getMinScore(), c.getMaxScore());
        }
    }

    public record RubricResponse(UUID id, UUID eventId, String name, boolean active, List<CriterionResponse> criteria) {
        public static RubricResponse from(Rubric r) {
            return new RubricResponse(r.getId(), r.getEventId(), r.getName(), r.isActive(),
                    r.getCriteria().stream().map(CriterionResponse::from).toList());
        }
    }

    public record AssignBatchRequest(@NotNull UUID eventId, @NotEmpty List<UUID> judgeIds, int reviewsPerSubmission) {}

    public record AssignmentResponse(UUID id, UUID judgeId, UUID submissionId, boolean complete, Instant assignedAt, Instant completedAt) {
        public static AssignmentResponse from(JudgeAssignment a) {
            return new AssignmentResponse(a.getId(), a.getJudgeId(), a.getSubmissionId(), a.isComplete(), a.getAssignedAt(), a.getCompletedAt());
        }
    }

    public record SubmitScoresRequest(@NotNull UUID eventId, @NotNull UUID submissionId,
                                       @NotEmpty Map<UUID, Double> scores, Map<UUID, String> notes) {}

    public record RankingResponse(int rank, UUID submissionId, double rawWeightedAverage, double normalizedScore, int judgesScored) {
        public static List<RankingResponse> fromRanked(List<SubmissionResult> ranked) {
            List<RankingResponse> out = new java.util.ArrayList<>();
            int rank = 1;
            for (SubmissionResult r : ranked) {
                out.add(new RankingResponse(rank++, r.submissionId(), r.rawWeightedAverage(), r.normalizedScore(), r.judgeCount()));
            }
            return out;
        }
    }

    public record JudgeProgressResponse(UUID judgeId, int totalAssigned, int completed, double percentComplete) {}
}
