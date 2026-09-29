package com.raptors.user.config;

import com.raptors.user.domain.AppUser;
import com.raptors.user.repository.AppUserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Seeds local profile rows for the demo identities baked into
 * infra/keycloak/realm-export.json, so a fresh `docker compose up` has a
 * working, browsable platform without anyone logging in first.
 *
 * IDs here MUST match the "id" fields in realm-export.json.
 */
@Component
@Profile({"docker", "local"})
public class DemoDataSeeder implements CommandLineRunner {

    private final AppUserRepository repository;

    public DemoDataSeeder(AppUserRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(String... args) {
        if (repository.count() > 0) return;

        seed("00000000-0000-0000-0000-000000000001", "admin1@hackathonraptors.dev", "Alex", "Admin", AppUser.PrimaryRole.ADMIN);
        seed("00000000-0000-0000-0000-000000000002", "organizer1@hackathonraptors.dev", "Ola", "Organizer", AppUser.PrimaryRole.ORGANIZER);
        seed("00000000-0000-0000-0000-000000000003", "judge1@hackathonraptors.dev", "Jan", "Judge", AppUser.PrimaryRole.JUDGE);
        seed("00000000-0000-0000-0000-000000000004", "judge2@hackathonraptors.dev", "Jamie", "Judge", AppUser.PrimaryRole.JUDGE);
        seed("00000000-0000-0000-0000-000000000005", "participant1@hackathonraptors.dev", "Pat", "Participant", AppUser.PrimaryRole.PARTICIPANT);
        seed("00000000-0000-0000-0000-000000000006", "participant2@hackathonraptors.dev", "Robin", "Participant", AppUser.PrimaryRole.PARTICIPANT);
    }

    private void seed(String id, String email, String first, String last, AppUser.PrimaryRole role) {
        repository.save(new AppUser(UUID.fromString(id), email, first, last, role));
    }
}
