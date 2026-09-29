package com.raptors.notification.domain;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private UUID recipientUserId;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false, length = 1000)
    private String message;

    @Column(nullable = false)
    private boolean read = false;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    protected Notification() {}

    public Notification(UUID recipientUserId, String type, String message) {
        this.recipientUserId = recipientUserId;
        this.type = type;
        this.message = message;
    }

    public UUID getId() { return id; }
    public UUID getRecipientUserId() { return recipientUserId; }
    public String getType() { return type; }
    public String getMessage() { return message; }
    public boolean isRead() { return read; }
    public void markRead() { this.read = true; }
    public Instant getCreatedAt() { return createdAt; }
}
