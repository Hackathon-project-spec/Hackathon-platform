# Architecture

## Service map

| Service | Owns | Port | Database |
|---|---|---|---|
| frontend | React SPA (static, served via nginx) | 3000 | — |
| config-server | Central config (`config-repo/`, native profile) | 8888 | — |
| eureka-server | Service discovery | 8761 | — |
| api-gateway | Routing, JWT validation, CORS | 9000 | — |
| user-service | Identity profile mirror | 8081 | `userdb` |
| event-service | Events, tracks, prizes, timeline | 8082 | `eventdb` |
| team-service | Teams, membership, invite links | 8083 | `teamdb` |
| submission-service | Drafts/submissions, public gallery, votes, comments | 8084 | `submissiondb` |
| judging-service | Rubrics, assignment, scores, normalization, exports | 8085 | `judgingdb` |
| notification-service | Per-user notification feed | 8086 | `notificationdb` |

Each service owns its schema exclusively — no service reads another's
database directly. This is deliberate: it's the one rule that keeps "domain
driven, microservices" honest rather than decorative. The cost is that
services need each other's facts sometimes (team-service needs to know an
event's max team size; submission-service needs to know team membership;
judging-service needs to know which submissions were finalized). That's
solved with Kafka, not synchronous REST, described below.

## Why Kafka projections instead of synchronous service-to-service calls

A tempting shortcut would be: "team-service needs event data? Call
event-service's REST API." That couples team-service's *availability* to
event-service's uptime, and couples *every write* to a network round trip.
Instead, each service that needs another service's facts keeps a small local
read-model table ("cache" in the code), kept current by consuming that other
service's Kafka events:

- `event.created` / `event.updated` → consumed by team-service and
  submission-service into local `EventCache` tables (just the fields each
  actually needs: deadline, max team size).
- `team.created` / `team.member-joined` → consumed by submission-service into
  a local `TeamCache` (membership set), used to authorize who can edit a
  submission.
- `submission.finalized` → consumed by judging-service into a
  `SubmissionCache` (only finalized projects are judgeable).
- `user.registered` → consumed by notification-service to greet new users.

This is eventual consistency, not strict consistency — there's a small window
after, say, `event-service` creates an event where `team-service` doesn't yet
know about it. In practice (single-node Kafka, low volume) that window is
milliseconds, but it's a real trade-off worth naming rather than hiding: a
`POST /api/teams` for an event created a few hundred milliseconds ago could
transiently 404. A production hardening pass would add a synchronous
fallback lookup (call the owning service directly) for the narrow case where
the local cache doesn't yet have the record, with the Kafka-fed cache as the
steady-state fast path. That fallback is not implemented in this build.

JSON messages are published without Spring's type-info headers
(`spring.json.add.type.headers: false`, set once in `config-repo/application.yml`)
so consumers deserialize into their own local record types that structurally
match the producer's payload, rather than depending on the producer's Java
package existing on the consumer's classpath. That's a deliberate anti-coupling
choice for a "domain driven" system — the wire format is the contract, not a
shared JAR.

## Security: backend-enforced role isolation

Every service, not just the gateway, independently:
1. Validates the JWT signature against Keycloak's issuer (`spring-boot-starter-oauth2-resource-server`,
   configured per service in `application.yml`).
2. Extracts `realm_access.roles` from the token and maps each to a
   `ROLE_<NAME>` Spring Security authority (`KeycloakJwtRoleConverter`,
   duplicated per service rather than shared as a library — see "Known
   simplifications" below).
3. Enforces role checks with `@PreAuthorize` at the controller-method level.

This means a request that somehow bypassed the gateway (e.g. a direct call
inside the Docker network) is still fully authorized by the receiving service.
The gateway also validates the JWT and does a first-pass route restriction
(`api-gateway`'s `SecurityConfig`), but that's a defense-in-depth convenience,
not the source of truth — each service would refuse an unauthorized request
even with no gateway in front of it at all.

`CurrentUser` (one small class per service) reads the authenticated user's id
(the JWT `sub`, which is the Keycloak user id) and basic claims out of the
security context — this is how a service knows "who is making this request"
without a session store of its own; Keycloak-issued JWTs are the only session
state.

## Offline authentication

The platform must run with no network access, so Keycloak uses only its local
realm user store — no federated identity provider (e.g. Google) is configured.
The realm (`infra/keycloak/realm-export.json`) seeds password accounts for every
demo role and is re-imported on every boot, keeping it the single source of truth.

## Assignment algorithm and cross-judge normalization

Both are implemented in `judging-service` and documented in depth in
`JUDGING.md`, including the reasoning behind choosing a simple, auditable
greedy load-balancer over a more "optimal" but opaque assignment algorithm,
and per-judge z-score standardization for normalization. Summarized:

- **Assignment**: shuffle submissions, then for each one pick the N
  currently-least-loaded judges who aren't already assigned to it. Re-running
  the batch (e.g. after late submissions) tops up rather than reassigning.
- **Normalization**: per judge, compute their mean and standard deviation of
  weighted totals across everything they scored; convert each of their scores
  to a z-score; a submission's normalized score is the mean z-score across the
  judges who scored it. This removes each judge's personal
  leniency/harshness and spread as confounds.

## Deployment topology

`docker-compose.yml` is the only supported way to run this. Every Java service
builds from source in a multi-stage Dockerfile (Maven build stage → JRE
runtime stage), so `docker compose up --build` needs internet access *to
build*, but the running containers make no outbound calls except to each
other, Postgres, and Kafka — satisfying "must run on a laptop with the network
turned off" once the images are built. `docker compose up` without `--build`
after images already exist requires no network at all.

## Known simplifications (see acceptance-report.txt for the full, tier-by-tier list)

- Security boilerplate (`KeycloakJwtRoleConverter`, `SecurityConfig`,
  `CurrentUser`, `GlobalExceptionHandler`) is duplicated per service rather
  than extracted into a shared library. In a true polyglot/independently-
  deployable microservice fleet this is often the right call (no shared JAR
  coupling deploy cadences); with all services on the same stack, a shared
  `common` module would reduce duplication. Left as-is for build simplicity.
- No API rate limiting at the gateway (only submission-service's vote
  endpoint has its own rate limit). A production deployment would add
  Spring Cloud Gateway's `RequestRateLimiter` filter.
- No file/image upload handling — `coverImageUrl` etc. are plain URL fields;
  a real deployment would add object storage (e.g. MinIO, which is itself
  self-hostable) and this is a natural extension point.
- Synchronous fallback for cache-miss reads (see Kafka section above) is not
  implemented.