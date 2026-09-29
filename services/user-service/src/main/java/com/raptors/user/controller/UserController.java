package com.raptors.user.controller;

import com.raptors.user.config.CurrentUser;
import com.raptors.user.domain.AppUser;
import com.raptors.user.dto.UserResponse;
import com.raptors.user.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /** Idempotent identity sync — the frontend calls this right after Keycloak login. */
    @PostMapping("/sync")
    public UserResponse sync(JwtAuthenticationToken auth) {
        Jwt jwt = auth.getToken();
        UUID id = UUID.fromString(jwt.getSubject());
        String email = jwt.getClaimAsString("email");
        String firstName = jwt.getClaimAsString("given_name");
        String lastName = jwt.getClaimAsString("family_name");
        AppUser.PrimaryRole role = highestRole(auth);

        AppUser user = userService.syncFromToken(id, email, firstName, lastName, role);
        return UserResponse.from(user);
    }

    @GetMapping("/me")
    public UserResponse me() {
        return userService.findById(CurrentUser.id())
                .map(UserResponse::from)
                .orElseThrow(() -> new IllegalStateException("Call /api/users/sync first"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> byId(@PathVariable UUID id) {
        return userService.findById(id)
                .map(UserResponse::from)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','ORGANIZER')")
    public List<UserResponse> all() {
        return userService.findAll().stream().map(UserResponse::from).toList();
    }

    /** Internal, network-local lookup used by other services (see ARCHITECTURE.md). */
    @GetMapping("/internal/{id}")
    public ResponseEntity<Map<String, Object>> internalLookup(@PathVariable UUID id) {
        return userService.findById(id)
                .map(u -> ResponseEntity.ok(Map.<String, Object>of(
                        "id", u.getId(), "email", u.getEmail(),
                        "firstName", u.getFirstName(), "lastName", u.getLastName())))
                .orElse(ResponseEntity.notFound().build());
    }

    private AppUser.PrimaryRole highestRole(JwtAuthenticationToken auth) {
        var authorities = auth.getAuthorities().stream().map(a -> a.getAuthority()).toList();
        if (authorities.contains("ROLE_ADMIN")) return AppUser.PrimaryRole.ADMIN;
        if (authorities.contains("ROLE_ORGANIZER")) return AppUser.PrimaryRole.ORGANIZER;
        if (authorities.contains("ROLE_JUDGE")) return AppUser.PrimaryRole.JUDGE;
        return AppUser.PrimaryRole.PARTICIPANT;
    }
}
