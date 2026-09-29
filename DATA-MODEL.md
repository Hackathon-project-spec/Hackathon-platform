# Data Model

Each service owns its own PostgreSQL database (`userdb`, `eventdb`, `teamdb`,
`submissiondb`, `judgingdb`, `notificationdb`), created by
`infra/postgres/init-multi-db.sh` on first Postgres boot. Tables within each
database are managed by Hibernate (`ddl-auto: update`) from the JPA entities
below — there are no hand-written migrations in this build (see gaps at the
bottom).

## Demo identity IDs

Fixed so cross-service demo data lines up (see `infra/keycloak/realm-export.json`
and `event-service`'s `DemoDataSeeder`):

| UUID | Identity |
|---|---|
| `00000000-0000-0000-0000-000000000001` | admin1 (ADMIN) |
| `00000000-0000-0000-0000-000000000002` | organizer1 (ORGANIZER) |
| `00000000-0000-0000-0000-000000000003` | judge1 (JUDGE) |
| `00000000-0000-0000-0000-000000000004` | judge2 (JUDGE) |
| `00000000-0000-0000-0000-000000000005` | participant1 (PARTICIPANT) |
| `00000000-0000-0000-0000-000000000006` | participant2 (PARTICIPANT) |
| `20000000-0000-0000-0000-000000000001` | Demo event ("Hackathon Raptors Demo 2026") |

## user-service (`userdb`)

**app_users** — mirrors Keycloak identity locally so other services (and this
one) have a stable id to key on without calling back to Keycloak per request.
| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | == Keycloak `sub` claim |
| email | text, unique | |
| first_name, last_name | text | |
| primary_role | enum (PARTICIPANT/JUDGE/ORGANIZER/ADMIN) | highest role at last sync |
| created_at, last_login_at | timestamp | |

## event-service (`eventdb`)

**events**
| Column | Notes |
|---|---|
| id (PK) | |
| name, description | |
| organizer_id | FK-by-value to a user id (no DB FK across services) |
| registration_opens_at / closes_at | |
| hacking_starts_at | |
| submission_deadline | enforced by submission-service via its EventCache |
| voting_opens_at / closes_at | |
| judging_opens_at / closes_at | |
| results_published_at | |
| status | enum: DRAFT, PUBLISHED, LIVE, JUDGING, COMPLETED, CANCELLED |
| results_hidden_during_voting | boolean |
| max_team_size | int |

**tracks** — `id, event_id (FK), name, description`
**prizes** — `id, event_id (FK), title, description, track_id (nullable), rank`

## team-service (`teamdb`)

**teams** — `id, event_id, name, owner_id, created_at` — unique (event_id, name)
**team_members** — `id, team_id, user_id, event_id, role (OWNER/MEMBER), joined_at`
  — unique (team_id, user_id); `event_id` is denormalized onto this table
  specifically to make "does this user already have a team for this event"
  a single indexed lookup instead of a join.
**team_invites** — `id, team_id, token (unique), created_by, expires_at, max_uses, uses_count, revoked, created_at`
**event_cache** — local projection: `event_id (PK), name, registration_closes_at, submission_deadline, max_team_size`, fed by `event.created`/`event.updated`.

## submission-service (`submissiondb`)

**submissions** — unique (event_id, team_id): one project per team per event.
| Column | Notes |
|---|---|
| id (PK) | |
| event_id, team_id, track_id | |
| title, tagline, description | |
| repo_url, demo_url, video_url, cover_image_url | plain URL fields — no file upload in this build |
| tech_stack | comma-separated string |
| status | enum: DRAFT, SUBMITTED |
| submitted_at, created_at, updated_at | |

**votes** — `id, submission_id, voter_id, voted_at` — unique (submission_id,
voter_id): the uniqueness constraint *is* the duplicate-vote prevention.
**comments** — `id, submission_id, author_id, body, created_at`
**event_cache** — `event_id (PK), name, submission_deadline`, fed by `event.created`/`event.updated`.
**team_cache** — `team_id (PK), event_id, name`, plus a `team_cache_members`
join table (`team_id, user_id`) — fed by `team.created`/`team.member-joined`.

## judging-service (`judgingdb`)

**rubrics** — `id, event_id, name, active` (only one rubric active per event
at a time — enforced in `RubricService`, not a DB constraint).
**rubric_criteria** — `id, rubric_id (FK), name, description, weight, min_score, max_score`.
Weights are relative, not required to sum to 1 — normalized at scoring time
(see `NormalizationService`).
**judge_assignments** — `id, event_id, judge_id, submission_id, assigned_at,
completed_at` — unique (event_id, judge_id, submission_id).
**scores** — `id, event_id, judge_id, submission_id, criterion_id, value,
notes, scored_at` — unique (judge_id, submission_id, criterion_id): one score
per judge per criterion per submission; resubmitting overwrites.
**submission_cache** — `submission_id (PK), event_id, team_id, track_id,
title` — fed by `submission.finalized`; only finalized submissions ever
appear here, which is what makes a submission "judgeable".

## notification-service (`notificationdb`)

**notifications** — `id, recipient_user_id, type, message, read, created_at`.

## Kafka topics (the cross-service contract)

| Topic | Producer | Consumers | Payload |
|---|---|---|---|
| `user.registered` | user-service | notification-service | id, email, name, role |
| `event.created` | event-service | team-service, submission-service | id, name, organizer, deadline, reg-close, max-team-size |
| `event.updated` | event-service | team-service, submission-service | same shape as `event.created` |
| `team.created` | team-service | submission-service | team id, event id, name, owner id |
| `team.member-joined` | team-service | submission-service, notification-service | team id, event id, user id, role |
| `submission.created` | submission-service | *(none yet — reserved for future consumers)* | submission id, event id, team id |
| `submission.finalized` | submission-service | judging-service | submission id, event id, team id, track id, title |

Type headers are disabled cluster-wide, so payloads are plain JSON matching
each producer's record shape field-for-field; consumers deserialize into
their own locally-defined record with the same fields (see ARCHITECTURE.md).

## Known gaps

- No formal migration tool (Flyway/Liquibase) — schema is Hibernate
  `ddl-auto: update`, which is fine for a seeded demo but not how a
  production system should manage schema change.
- No cross-service foreign keys (by design — each service owns its schema),
  which means referential integrity between e.g. `submissions.team_id` and
  team-service's `teams.id` is enforced in application code (via the
  `team_cache` membership check), not the database.
