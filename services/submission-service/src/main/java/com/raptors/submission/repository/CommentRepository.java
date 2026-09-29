package com.raptors.submission.repository;

import com.raptors.submission.domain.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CommentRepository extends JpaRepository<Comment, UUID> {
    List<Comment> findBySubmissionIdOrderByCreatedAtAsc(UUID submissionId);
}
