package com.raptors.submission.config;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import java.util.UUID;

public final class CurrentUser {

    private CurrentUser() {}

    public static UUID id() {
        Jwt jwt = jwt();
        return UUID.fromString(jwt.getSubject());
    }

    public static String email() {
        return jwt().getClaimAsString("email");
    }

    public static String firstName() {
        return jwt().getClaimAsString("given_name");
    }

    public static String lastName() {
        return jwt().getClaimAsString("family_name");
    }

    private static Jwt jwt() {
        var auth = (JwtAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            throw new IllegalStateException("No authenticated principal in context");
        }
        return auth.getToken();
    }
}
