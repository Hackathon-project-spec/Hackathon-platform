package com.raptors.submission.event;

import java.time.Instant;
import java.util.UUID;

public class SubmissionEvents {
    private SubmissionEvents() {}

    public static final String SUBMISSION_CREATED = "submission.created";
    public static final String SUBMISSION_FINALIZED = "submission.finalized";

    /** Published once, when a team first saves a draft. */
    public record SubmissionCreated(UUID submissionId, UUID eventId, UUID teamId, Instant occurredAt) {
        public static SubmissionCreated now(UUID id, UUID eventId, UUID teamId) {
            return new SubmissionCreated(id, eventId, teamId, Instant.now());
        }
    }

    /** Published when a team locks in their submission (DRAFT -> SUBMITTED). judging-service listens for this. */
    public record SubmissionFinalized(UUID submissionId, UUID eventId, UUID teamId, UUID trackId, String title, Instant occurredAt) {
        public static SubmissionFinalized now(UUID id, UUID eventId, UUID teamId, UUID trackId, String title) {
            return new SubmissionFinalized(id, eventId, teamId, trackId, title, Instant.now());
        }
    }
}
