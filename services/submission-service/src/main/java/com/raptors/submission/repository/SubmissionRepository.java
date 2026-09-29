package com.raptors.submission.repository;

import com.raptors.submission.domain.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SubmissionRepository extends JpaRepository<Submission, UUID> {
    Optional<Submission> findByEventIdAndTeamId(UUID eventId, UUID teamId);

    List<Submission> findByEventIdAndStatus(UUID eventId, Submission.SubmissionStatus status);

    @Query("""
        SELECT s FROM Submission s
        WHERE s.status = 'SUBMITTED'
          AND (:eventId IS NULL OR s.eventId = :eventId)
          AND (:trackId IS NULL OR s.trackId = :trackId)
          AND (:q IS NULL OR LOWER(s.title) LIKE :q OR LOWER(s.tagline) LIKE :q
               OR LOWER(s.description) LIKE :q OR LOWER(s.techStack) LIKE :q)
        ORDER BY s.submittedAt DESC
        """)
    List<Submission> searchGallery(@Param("eventId") UUID eventId, @Param("trackId") UUID trackId, @Param("q") String q);
}
