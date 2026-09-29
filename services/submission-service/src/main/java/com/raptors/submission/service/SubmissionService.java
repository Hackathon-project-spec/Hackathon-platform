package com.raptors.submission.service;

import com.raptors.submission.domain.EventCache;
import com.raptors.submission.domain.Submission;
import com.raptors.submission.domain.TeamCache;
import com.raptors.submission.dto.SubmissionDtos.CreateDraftRequest;
import com.raptors.submission.dto.SubmissionDtos.UpdateSubmissionRequest;
import com.raptors.submission.event.SubmissionEvents;
import com.raptors.submission.repository.EventCacheRepository;
import com.raptors.submission.repository.SubmissionRepository;
import com.raptors.submission.repository.TeamCacheRepository;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
public class SubmissionService {

    private final SubmissionRepository repository;
    private final EventCacheRepository eventCacheRepository;
    private final TeamCacheRepository teamCacheRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public SubmissionService(SubmissionRepository repository, EventCacheRepository eventCacheRepository,
                              TeamCacheRepository teamCacheRepository, KafkaTemplate<String, Object> kafkaTemplate) {
        this.repository = repository;
        this.eventCacheRepository = eventCacheRepository;
        this.teamCacheRepository = teamCacheRepository;
        this.kafkaTemplate = kafkaTemplate;
    }

    @Transactional
    public Submission createDraft(UUID requesterId, CreateDraftRequest req) {
        requireTeamMember(req.teamId(), requesterId);
        requireSubmissionWindowOpen(req.eventId());

        if (repository.findByEventIdAndTeamId(req.eventId(), req.teamId()).isPresent()) {
            throw new IllegalStateException("This team already has a submission for this event");
        }

        Submission submission = repository.save(new Submission(req.eventId(), req.teamId(), req.title()));
        kafkaTemplate.send(SubmissionEvents.SUBMISSION_CREATED, submission.getId().toString(),
                SubmissionEvents.SubmissionCreated.now(submission.getId(), req.eventId(), req.teamId()));
        return submission;
    }

    public Submission get(UUID id) {
        return repository.findById(id).orElseThrow(() -> new NoSuchElementException("Submission not found: " + id));
    }

    @Transactional
    public Submission update(UUID id, UUID requesterId, UpdateSubmissionRequest req) {
        Submission submission = get(id);
        requireTeamMember(submission.getTeamId(), requesterId);
        requireSubmissionWindowOpen(submission.getEventId());

        if (req.title() != null) submission.setTitle(req.title());
        if (req.tagline() != null) submission.setTagline(req.tagline());
        if (req.description() != null) submission.setDescription(req.description());
        if (req.trackId() != null) submission.setTrackId(req.trackId());
        if (req.repoUrl() != null) submission.setRepoUrl(req.repoUrl());
        if (req.demoUrl() != null) submission.setDemoUrl(req.demoUrl());
        if (req.videoUrl() != null) submission.setVideoUrl(req.videoUrl());
        if (req.coverImageUrl() != null) submission.setCoverImageUrl(req.coverImageUrl());
        if (req.techStack() != null) submission.setTechStack(req.techStack());
        submission.touch();
        return submission;
    }

    /** DRAFT -> SUBMITTED. Idempotent: re-finalizing an already-submitted project just re-saves edits. */
    @Transactional
    public Submission finalizeSubmission(UUID id, UUID requesterId) {
        Submission submission = get(id);
        requireTeamMember(submission.getTeamId(), requesterId);
        requireSubmissionWindowOpen(submission.getEventId());

        boolean wasAlreadySubmitted = submission.getStatus() == Submission.SubmissionStatus.SUBMITTED;
        submission.setStatus(Submission.SubmissionStatus.SUBMITTED);
        submission.setSubmittedAt(Instant.now());
        submission.touch();

        if (!wasAlreadySubmitted) {
            kafkaTemplate.send(SubmissionEvents.SUBMISSION_FINALIZED, submission.getId().toString(),
                    SubmissionEvents.SubmissionFinalized.now(submission.getId(), submission.getEventId(),
                            submission.getTeamId(), submission.getTrackId(), submission.getTitle()));
        }
        return submission;
    }

    public List<Submission> gallery(UUID eventId, UUID trackId, String query) {
        String likePattern = (query == null || query.isBlank()) ? null : "%" + query.toLowerCase() + "%";
        return repository.searchGallery(eventId, trackId, likePattern);
    }

    public Submission byTeam(UUID eventId, UUID teamId) {
        return repository.findByEventIdAndTeamId(eventId, teamId)
                .orElseThrow(() -> new NoSuchElementException("No submission yet for this team"));
    }

    public List<Submission> submittedForEvent(UUID eventId) {
        return repository.findByEventIdAndStatus(eventId, Submission.SubmissionStatus.SUBMITTED);
    }

    private void requireTeamMember(UUID teamId, UUID userId) {
        TeamCache team = teamCacheRepository.findById(teamId)
                .orElseThrow(() -> new NoSuchElementException("Unknown team: " + teamId));
        if (!team.hasMember(userId)) {
            throw new SecurityException("Only members of this team can edit its submission");
        }
    }

    private void requireSubmissionWindowOpen(UUID eventId) {
        EventCache event = eventCacheRepository.findById(eventId)
                .orElseThrow(() -> new NoSuchElementException("Unknown event: " + eventId));
        if (Instant.now().isAfter(event.getSubmissionDeadline())) {
            throw new IllegalStateException("The submission deadline for this event has passed");
        }
    }
}
