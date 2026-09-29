# Hackathon Raptors Platform

A self-hostable, API-first hackathon platform: registration, teams, submissions,
a public gallery, judge assignment, weighted rubrics, cross-judge score
normalization, community voting, and CSV exports — built as Java/Spring Boot
microservices behind an API gateway, with Keycloak for auth, Postgres per
service, and Kafka for inter-service events.

## Status: honest summary

This build is a **working T1 core plus a substantial slice of T2**, not a
finished implementation of all four tiers. See `acceptance-report.txt` for the
tier-by-tier breakdown of what's implemented, partial, or not started. Please
read that file before assuming a feature exists — this README describes intent
and architecture; the acceptance report describes what's actually there.

One thing worth knowing before you run this:

**Authentication is fully offline.** Keycloak uses only its local realm user
store (seeded demo accounts below) — there is no external identity provider,
so the platform needs no internet access at runtime. The realm is re-applied
from `infra/keycloak/realm-export.json` on every `docker compose up`.

**This code has not been compiled in the environment it was authored in**
(no Maven Central access there). Run `docker compose up --build` and check
the build logs — if anything fails to compile, that's a real bug to fix,
not an environment issue on your end.

## Quickstart

```bash
docker compose up --build
```

First boot takes a few minutes (Maven dependency downloads, Keycloak realm
import, Kafka topic creation). When it settles:

| Service | URL |
|---|---|
| **Frontend (React app)** | **http://localhost:3000** |
| API Gateway (all `/api/**` traffic) | http://localhost:9000 |
| Keycloak admin console | http://localhost:8080 (admin/admin) |
| Eureka dashboard | http://localhost:8761 |
| Config Server | http://localhost:8888 |

The gateway is the single entry point for the API. Individual backend
services are not published on the host beyond Postgres (5432) and Kafka
(9092), which are exposed for debugging/inspection.

### Frontend notes

The `frontend` container builds the React app fresh with the backend URLs
baked in at build time (`http://localhost:9000` for the API,
`http://localhost:8080` for Keycloak — both already published to the host),
then serves the static build via nginx on port 3000. The browser talks to
the gateway and Keycloak directly; nginx only serves static files.

If you'd rather run the frontend outside Docker with hot reload:

```bash
docker compose up --build \
  postgres zookeeper kafka keycloak config-server eureka-server \
  api-gateway user-service event-service team-service \
  submission-service judging-service notification-service
# in a second terminal:
cd frontend && npm install && npm run dev
```

That starts everything except the `frontend` container (avoiding a port
3000 clash) and runs Vite's dev server instead, which proxies `/api` to the
gateway per `vite.config.js`.


### Demo accounts (all offline-usable, password `Passw0rd!`)

| Username | Role |
|---|---|
| `admin1` | ADMIN |
| `organizer1` | ORGANIZER |
| `judge1`, `judge2` | JUDGE |
| `participant1`, `participant2` | PARTICIPANT |

A demo event ("Hackathon Raptors Demo 2026") is seeded on startup with
registration and hacking already open, two tracks, and two prizes, so you can
immediately: log in as a participant → create a team → invite a second
participant → submit a project → log in as organizer → create a rubric →
assign judges → log in as a judge → score → view the normalized rankings →
export CSVs. That flow is what the demo video walks through.

## Architecture, data model, and judging methodology

See `ARCHITECTURE.md`, `DATA-MODEL.md`, and `JUDGING.md` for the deeper
explanations — in particular, `JUDGING.md` documents and defends the
cross-judge normalization approach (per-judge z-score standardization) and the
assignment algorithm (greedy load balancing), and `ARCHITECTURE.md` explains
why services keep local Kafka-fed projections of each other's data instead of
calling each other synchronously.

## Repository layout

```
config-server/       Spring Cloud Config Server (serves config-repo/)
eureka-server/        Service discovery
api-gateway/           Single entry point, JWT validation, routing
services/
  user-service/        Identity sync from Keycloak
  event-service/        Events, tracks, prizes, timeline
  team-service/         Team formation, invite links
  submission-service/   Draft/submit projects, public gallery, voting, comments
  judging-service/       Rubrics, assignment, scoring, normalization, CSV export
  notification-service/ Kafka-driven per-user notification feed
infra/
  keycloak/realm-export.json   Roles, clients, demo users (source of truth, re-imported on every boot)
  postgres/init-multi-db.sh    Creates one database per service
docker-compose.yml
acceptance-report.txt
ARCHITECTURE.md / DATA-MODEL.md / JUDGING.md
```

## Running tests

```bash
cd services/judging-service && mvn test
```

(Each service is an independent Maven project; run `mvn test` inside any of
them. See `acceptance-report.txt` for current test coverage — it's currently
thin and is flagged there as a gap, not hidden.)

## License

MIT — see `LICENSE`.