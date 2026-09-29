package com.raptors.judging.repository;

import com.raptors.judging.domain.Score;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ScoreRepository extends JpaRepository<Score, UUID> {
    List<Score> findByEventIdAndJudgeIdAndSubmissionId(UUID eventId, UUID judgeId, UUID submissionId);
    List<Score> findByEventIdAndJudgeId(UUID eventId, UUID judgeId);
    List<Score> findByEventIdAndSubmissionId(UUID eventId, UUID submissionId);
    List<Score> findByEventId(UUID eventId);
    Optional<Score> findByJudgeIdAndSubmissionIdAndCriterionId(UUID judgeId, UUID submissionId, UUID criterionId);
}
