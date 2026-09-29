package com.raptors.submission.service;

import com.raptors.submission.domain.Comment;
import com.raptors.submission.domain.Vote;
import com.raptors.submission.repository.CommentRepository;
import com.raptors.submission.repository.SubmissionRepository;
import com.raptors.submission.repository.VoteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

/**
 * Community voting with two anti-abuse layers:
 *  1. Duplicate prevention: a (submissionId, voterId) unique constraint means
 *     casting a second vote for the same project just no-ops — one identity,
 *     one vote, enforced at the database, not just the UI.
 *  2. Rate limiting: a voter is capped at {@link #MAX_VOTES_PER_WINDOW} votes
 *     per {@link #WINDOW} across all submissions, which blunts a single
 *     compromised or scripted account from mass-voting across many projects
 *     in a burst.
 *
 * This requires an authenticated identity (Keycloak-backed) to vote at all,
 * which is the project's chosen alternative to anonymous/IP-based voting —
 * see JUDGING.md for the fuller defense of this trade-off.
 */
@Service
public class VotingService {

    private static final int MAX_VOTES_PER_WINDOW = 30;
    private static final java.time.Duration WINDOW = java.time.Duration.ofHours(1);

    private final VoteRepository voteRepository;
    private final CommentRepository commentRepository;
    private final SubmissionRepository submissionRepository;

    public VotingService(VoteRepository voteRepository, CommentRepository commentRepository,
                          SubmissionRepository submissionRepository) {
        this.voteRepository = voteRepository;
        this.commentRepository = commentRepository;
        this.submissionRepository = submissionRepository;
    }

    @Transactional
    public void castVote(UUID submissionId, UUID voterId) {
        submissionRepository.findById(submissionId)
                .orElseThrow(() -> new NoSuchElementException("Submission not found: " + submissionId));

        if (voteRepository.findBySubmissionIdAndVoterId(submissionId, voterId).isPresent()) {
            return; // idempotent: already voted, no-op rather than an error
        }

        long recentVotes = voteRepository.findByVoterIdAndVotedAtAfter(voterId, Instant.now().minus(WINDOW.toMillis(), ChronoUnit.MILLIS)).size();
        if (recentVotes >= MAX_VOTES_PER_WINDOW) {
            throw new IllegalStateException("Vote rate limit reached — please try again later");
        }

        voteRepository.save(new Vote(submissionId, voterId));
    }

    public long tally(UUID submissionId) {
        return voteRepository.countBySubmissionId(submissionId);
    }

    @Transactional
    public Comment addComment(UUID submissionId, UUID authorId, String body) {
        submissionRepository.findById(submissionId)
                .orElseThrow(() -> new NoSuchElementException("Submission not found: " + submissionId));
        if (body == null || body.isBlank()) {
            throw new IllegalArgumentException("Comment cannot be empty");
        }
        return commentRepository.save(new Comment(submissionId, authorId, body.trim()));
    }

    public List<Comment> comments(UUID submissionId) {
        return commentRepository.findBySubmissionIdOrderByCreatedAtAsc(submissionId);
    }
}
