package com.raptors.notification.repository;

import com.raptors.notification.domain.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    List<Notification> findByRecipientUserIdOrderByCreatedAtDesc(UUID recipientUserId);
}
