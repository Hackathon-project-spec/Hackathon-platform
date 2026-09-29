package com.raptors.submission.repository;

import com.raptors.submission.domain.Vote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface VoteRepository extends JpaRepository<Vote, UUID> {
    Optional<Vote> findBySubmissionIdAndVoterId(UUID submissionId, UUID voterId);
    long countBySubmissionId(UUID submissionId);
    List<Vote> findByVoterIdAndVotedAtAfter(UUID voterId, java.time.Instant since);
}
