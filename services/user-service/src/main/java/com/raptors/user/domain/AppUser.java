package com.raptors.user.domain;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Local profile mirror of a Keycloak-authenticated identity.
 * The row's primary key is the Keycloak subject (sub) claim, so every other
 * service can reference the same user id without calling back into Keycloak.
 */
@Entity
@Table(name = "app_users")
public class AppUser {

    @Id
    private UUID id; // == Keycloak "sub"

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PrimaryRole primaryRole;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    private Instant lastLoginAt = Instant.now();

    protected AppUser() {
    }

    public AppUser(UUID id, String email, String firstName, String lastName, PrimaryRole primaryRole) {
        this.id = id;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.primaryRole = primaryRole;
    }

    public UUID getId() { return id; }
    public String getEmail() { return email; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public PrimaryRole getPrimaryRole() { return primaryRole; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getLastLoginAt() { return lastLoginAt; }

    public void setEmail(String email) { this.email = email; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public void setPrimaryRole(PrimaryRole primaryRole) { this.primaryRole = primaryRole; }
    public void touchLogin() { this.lastLoginAt = Instant.now(); }

    public enum PrimaryRole { PARTICIPANT, JUDGE, ORGANIZER, ADMIN }
}
