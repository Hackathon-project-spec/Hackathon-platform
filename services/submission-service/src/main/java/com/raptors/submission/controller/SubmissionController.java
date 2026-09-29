package com.raptors.submission.controller;

import com.raptors.submission.config.CurrentUser;
import com.raptors.submission.domain.Submission;
import com.raptors.submission.dto.SubmissionDtos.*;
import com.raptors.submission.service.SubmissionService;
import com.raptors.submission.service.VotingService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
public class SubmissionController {

    private final SubmissionService service;
    private final VotingService votingService;

    public SubmissionController(SubmissionService service, VotingService votingService) {
        this.service = service;
        this.votingService = votingService;
    }

    @PostMapping("/api/submissions")
    @PreAuthorize("hasRole('PARTICIPANT')")
    public SubmissionResponse createDraft(@Valid @RequestBody CreateDraftRequest req) {
        return SubmissionResponse.from(service.createDraft(CurrentUser.id(), req));
    }

    @GetMapping("/api/submissions/{id}")
    public SubmissionResponse get(@PathVariable UUID id) {
        return SubmissionResponse.from(service.get(id));
    }

    @PatchMapping("/api/submissions/{id}")
    @PreAuthorize("hasRole('PARTICIPANT')")
    public SubmissionResponse update(@PathVariable UUID id, @RequestBody UpdateSubmissionRequest req) {
        return SubmissionResponse.from(service.update(id, CurrentUser.id(), req));
    }

    @PostMapping("/api/submissions/{id}/finalize")
    @PreAuthorize("hasRole('PARTICIPANT')")
    public SubmissionResponse finalizeSubmission(@PathVariable UUID id) {
        return SubmissionResponse.from(service.finalizeSubmission(id, CurrentUser.id()));
    }

    @GetMapping("/api/submissions/by-team")
    public SubmissionResponse byTeam(@RequestParam UUID eventId, @RequestParam UUID teamId) {
        return SubmissionResponse.from(service.byTeam(eventId, teamId));
    }

    /** Public, searchable gallery — no auth required. Backs T1's "searchable public gallery". */
    @GetMapping("/api/gallery")
    public List<SubmissionResponse> gallery(
            @RequestParam(required = false) UUID eventId,
            @RequestParam(required = false) UUID trackId,
            @RequestParam(required = false) String q) {
        return service.gallery(eventId, trackId, q).stream().map(SubmissionResponse::from).toList();
    }

    /** Used by judging-service / exports to enumerate what's judgeable for an event. */
    @GetMapping("/api/submissions/internal/by-event")
    public List<SubmissionResponse> submittedForEvent(@RequestParam UUID eventId) {
        return service.submittedForEvent(eventId).stream().map(SubmissionResponse::from).toList();
    }

    // ---------------- Community voting & comments (T3) ----------------

    @PostMapping("/api/gallery/{submissionId}/vote")
    @PreAuthorize("isAuthenticated()")
    public void vote(@PathVariable UUID submissionId) {
        votingService.castVote(submissionId, CurrentUser.id());
    }

    /** Organizer/admin only — vote tallies are not exposed on the public gallery while voting is open. */
    @GetMapping("/api/gallery/{submissionId}/tally")
    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    public TallyResponse tally(@PathVariable UUID submissionId) {
        return new TallyResponse(submissionId, votingService.tally(submissionId));
    }

    @PostMapping("/api/gallery/{submissionId}/comments")
    @PreAuthorize("isAuthenticated()")
    public CommentResponse addComment(@PathVariable UUID submissionId, @Valid @RequestBody AddCommentRequest req) {
        return CommentResponse.from(votingService.addComment(submissionId, CurrentUser.id(), req.body()));
    }

    @GetMapping("/api/gallery/{submissionId}/comments")
    public List<CommentResponse> comments(@PathVariable UUID submissionId) {
        return votingService.comments(submissionId).stream().map(CommentResponse::from).toList();
    }
}
