package com.raptors.judging.repository;

import com.raptors.judging.domain.JudgeAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface JudgeAssignmentRepository extends JpaRepository<JudgeAssignment, UUID> {
    List<JudgeAssignment> findByEventId(UUID eventId);
    List<JudgeAssignment> findByEventIdAndJudgeId(UUID eventId, UUID judgeId);
    List<JudgeAssignment> findBySubmissionId(UUID submissionId);
    Optional<JudgeAssignment> findByEventIdAndJudgeIdAndSubmissionId(UUID eventId, UUID judgeId, UUID submissionId);
    long countByEventIdAndSubmissionId(UUID eventId, UUID submissionId);
}
