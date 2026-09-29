package com.raptors.judging.event;

import java.time.Instant;
import java.util.UUID;

/** Mirrors submission-service's SubmissionEvents.SubmissionFinalized. */
public record SubmissionFinalizedFacts(UUID submissionId, UUID eventId, UUID teamId, UUID trackId, String title, Instant occurredAt) {}
