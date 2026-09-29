package com.raptors.submission.domain;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "comments")
public class Comment {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private UUID submissionId;

    @Column(nullable = false)
    private UUID authorId;

    @Column(nullable = false, length = 2000)
    private String body;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    protected Comment() {}

    public Comment(UUID submissionId, UUID authorId, String body) {
        this.submissionId = submissionId;
        this.authorId = authorId;
        this.body = body;
    }

    public UUID getId() { return id; }
    public UUID getSubmissionId() { return submissionId; }
    public UUID getAuthorId() { return authorId; }
    public String getBody() { return body; }
    public Instant getCreatedAt() { return createdAt; }
}
