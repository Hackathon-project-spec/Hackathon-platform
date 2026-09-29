package com.raptors.notification.controller;

import com.raptors.notification.config.CurrentUser;
import com.raptors.notification.domain.Notification;
import com.raptors.notification.repository.NotificationRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@RestController
public class NotificationController {

    private final NotificationRepository repository;

    public NotificationController(NotificationRepository repository) {
        this.repository = repository;
    }

    public record NotificationResponse(UUID id, String type, String message, boolean read, Instant createdAt) {
        static NotificationResponse from(Notification n) {
            return new NotificationResponse(n.getId(), n.getType(), n.getMessage(), n.isRead(), n.getCreatedAt());
        }
    }

    @GetMapping("/api/notifications")
    public List<NotificationResponse> mine() {
        return repository.findByRecipientUserIdOrderByCreatedAtDesc(CurrentUser.id()).stream()
                .map(NotificationResponse::from).toList();
    }

    @PostMapping("/api/notifications/{id}/read")
    public void markRead(@PathVariable UUID id) {
        Notification n = repository.findById(id).orElseThrow(() -> new NoSuchElementException("Not found"));
        if (!n.getRecipientUserId().equals(CurrentUser.id())) {
            throw new SecurityException("Not your notification");
        }
        n.markRead();
        repository.save(n);
    }
}
