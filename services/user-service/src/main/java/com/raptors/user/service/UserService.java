package com.raptors.user.service;

import com.raptors.user.domain.AppUser;
import com.raptors.user.event.Topics;
import com.raptors.user.event.UserRegisteredEvent;
import com.raptors.user.repository.AppUserRepository;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    private final AppUserRepository repository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public UserService(AppUserRepository repository, KafkaTemplate<String, Object> kafkaTemplate) {
        this.repository = repository;
        this.kafkaTemplate = kafkaTemplate;
    }

    /**
     * Called on every authenticated request's first touch (see SyncFilter) or
     * explicitly via POST /api/users/sync right after login. Keycloak is the
     * source of truth for identity+credentials; this creates/updates the local
     * profile row idempotently so other services have a stable user id to key on.
     */
    public AppUser syncFromToken(UUID id, String email, String firstName, String lastName, AppUser.PrimaryRole highestRole) {
        Optional<AppUser> existing = repository.findById(id);
        if (existing.isPresent()) {
            AppUser user = existing.get();
            user.setEmail(email);
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.touchLogin();
            return repository.save(user);
        }

        AppUser created = new AppUser(id, email, firstName, lastName, highestRole);
        repository.save(created);
        kafkaTemplate.send(Topics.USER_REGISTERED,
                id.toString(),
                UserRegisteredEvent.now(id, email, firstName, lastName, highestRole.name()));
        return created;
    }

    public Optional<AppUser> findById(UUID id) {
        return repository.findById(id);
    }

    public List<AppUser> findAll() {
        return repository.findAll();
    }
}
