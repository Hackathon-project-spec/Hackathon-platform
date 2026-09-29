package com.raptors.user.dto;

import com.raptors.user.domain.AppUser;

import java.time.Instant;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String email,
        String firstName,
        String lastName,
        String primaryRole,
        Instant createdAt
) {
    public static UserResponse from(AppUser user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getPrimaryRole().name(),
                user.getCreatedAt()
        );
    }
}
