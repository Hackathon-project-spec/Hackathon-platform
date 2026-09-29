# Judging Methodology

This document exists to be defended out loud, not just read. It explains what
`judging-service` does and, more importantly, *why*, including the
trade-offs knowingly accepted.

## Rubrics

A rubric is a named, ordered set of criteria per event
(`POST /api/rubrics`). Each criterion has a **relative weight** and a
**min/max score range** — e.g. "Technical Execution" (weight 3, 0-10),
"Creativity" (weight 2, 0-10), "Presentation" (weight 1, 0-10). Weights don't
need to sum to anything in particular; they're normalized to fractions of the
total at scoring time (`NormalizationService.rankEvent`), so an organizer can
add or reweight a criterion without needing to re-balance every other number
by hand. Only one rubric is "active" per event at a time (`Rubric.active`);
scoring always validates against the active rubric, so a rubric can be
revised between events (or even mid-event, with the caveat that a swap
changes what "the weighted total" means for anyone already scored — this
build does not retroactively re-score, which is a deliberate choice: silently
rewriting a judge's already-submitted opinion under a new weighting scheme is
worse than requiring an organizer to consciously re-open judging).

## Assignment algorithm

**What it does**: `AssignmentService.assignBatch(eventId, judgeIds,
reviewsPerSubmission)` shuffles the event's finalized submissions (seeded by
`eventId.hashCode()` so it's deterministic per event, not truly random —
reproducibility for debugging beats unpredictability here), then for each
submission picks the `reviewsPerSubmission` currently least-loaded eligible
judges (sorted by running assignment count, ties broken by input order) who
aren't already assigned to it.

**Why greedy load-balancing instead of something fancier**: The obvious
"more optimal" alternatives are a min-cost-flow / bipartite-matching
formulation (which could also encode conflict-of-interest constraints,
track-affinity preferences, etc.) or a constraint solver. Those are real
options for a mature version of this platform. For this build, greedy
load-balancing was chosen because:
1. It's O(submissions × judges × log judges) — fast enough to run inline in
   an HTTP request with no background job infrastructure.
2. **It's auditable.** An organizer (or an acceptance suite) can explain any
   single assignment in one sentence: "judge X had the fewest assignments at
   the time submission Y was processed." A min-cost-flow solution's output is
   optimal but not intuitively explainable to a judge who asks "why was I
   assigned this project and not that one?"
3. It's idempotent-ish: re-running the batch after late submissions arrive
   tops up only what's missing (`needed = k - alreadyAssigned.size()`) rather
   than recomputing a global optimum that might reassign everyone.

**What it does not do** (explicit gaps): no conflict-of-interest exclusion
(a judge who is also a participant on a team is not automatically excluded
from that team's submission), no track-affinity weighting (a judge is
equally likely to be assigned any track), no support for judges opting out of
specific submissions. All three are natural next additions to
`AssignmentService` — the current shape (a filtered, sorted candidate list
per submission) is built to make each of those a small change (an extra
predicate on `candidates`), not a rewrite.

## Cross-judge score normalization

**The problem**: judges differ systematically in two ways — *severity*
(some judges give everything a 6/10, others a 9/10) and *spread* (some judges
use the full range, others cluster everything near the middle). A raw
average across judges rewards submissions that happened to draw lenient or
high-spread judges, which has nothing to do with project quality.

**The approach — per-judge z-score standardization**:
1. For each (judge, submission) pair, compute the judge's **weighted total**:
   Σ(criterion value × criterion weight / Σweights).
2. For each judge, compute the **mean** and **population standard
   deviation** of their weighted totals across every submission *that judge*
   scored this event.
3. Convert each of that judge's totals to a **z-score**:
   `z = (total − judge_mean) / judge_stdev`. A z-score of 0 means "average,
   by this judge's own standard"; +1 means "one of this judge's own standard
   deviations above their average."
4. A submission's **normalized score** is the mean z-score across every
   judge who scored it.
5. Submissions are ranked by normalized score, descending.

**Why z-scores and not, say, min-max rescaling or a Bayesian model**:
z-scores are the simplest transform that removes both severity (mean
subtraction) and spread (stdev division) as confounds in one step, and the
result — "how many of *this judge's own* standard deviations above their
average did they rate you" — is explainable in one sentence, which matters
for a public-facing judging process people will ask to have explained.
Min-max rescaling only handles range, not central tendency, and a Bayesian
shrinkage model (pulling small-sample judges toward a prior) is a genuinely
better answer for very small events but adds a parameter (the prior strength)
that's hard to justify to a judge asking "why was my scoring adjusted?" A
future iteration could add shrinkage for judges with very few (<3) scored
submissions specifically to address the edge case below.

**Known edge case, handled explicitly**: if a judge gives every submission
they score the *exact same* total (stdev = 0), the code defines their
z-score as `0` for all of them rather than dividing by zero. This is the
correct treatment, not just a crash-avoidance hack: a judge who didn't
differentiate between submissions contributed no ranking information, so
contributing exactly nothing (0, the "average" value) to every submission
they touched is the right outcome.

**Known limitation, stated rather than hidden**: z-scores are noisy with few
data points. A judge who only scored 2 submissions has a mean and stdev
computed from n=2, which is not statistically meaningful. The API returns
both `rawWeightedAverage` and `normalizedScore` side by side
(`GET /api/judging/events/{eventId}/rankings`) specifically so an organizer
can sanity-check the normalized ranking against the raw one rather than
trusting either blindly. The acceptance report should be read with this in
mind: normalization is *implemented and mathematically sound*, not a
guarantee of perfect fairness at small n.

## Judge progress dashboard

`GET /api/judging/events/{eventId}/dashboard` (organizer/admin only) groups
all assignments for an event by judge and reports `totalAssigned`,
`completed` (an assignment is complete when `ScoringService.submitScores`
successfully validates and saves every criterion for it), and
`percentComplete`. This is the operational view an organizer uses to chase
down judges who are behind before a deadline.

## CSV export

Three exports, all organizer/admin-gated, all under
`/api/judging/events/{eventId}/export/`:
- `assignments.csv` — every (judge, submission) pair with completion status.
- `scores.csv` — every individual criterion score, with judge, submission
  title, criterion name, value, notes, and timestamp — the raw audit trail.
- `rankings.csv` — the final computed ranking: rank, submission, raw
  weighted average, normalized score, and how many judges scored it.

These are plain `text/csv` responses with `Content-Disposition: attachment`,
so they download directly from a browser or `curl -O`.

## Community voting and anti-abuse

`submission-service` implements voting as **one authenticated vote per
identity per submission**, not anonymous or IP-based voting. This is a
deliberate, defensible choice over the alternative (anonymous ballot-box
voting, possibly with IP-based rate limiting):

- **Duplicate prevention is a database constraint**, not application logic
  that could be bypassed: `votes` has a unique constraint on
  `(submission_id, voter_id)`. Casting a second "vote" for a project you
  already voted for is a no-op, not an error and not a second row.
- **Identity-based voting beats IP-based rate limiting** for a hackathon
  audience specifically because contestants are frequently on the same
  shared conference/venue Wi-Fi — IP-based limiting would either block
  legitimate voters behind a NAT or fail to stop abuse from someone who just
  switches networks. Requiring a Keycloak-authenticated identity (the same
  identity used for the whole platform) is a much higher bar to fake at
  scale than an IP address.
- **A rate limit still exists on top of that** (`VotingService`,
  `MAX_VOTES_PER_WINDOW = 30` per hour per identity) specifically to blunt a
  single compromised or scripted account from mass-voting across many
  projects in a burst, which duplicate-prevention alone doesn't address
  (duplicate-prevention stops voting for the *same* project twice; it does
  nothing to stop a bot voting for fifty *different* projects in ten
  seconds).
- **Vote tallies are never returned by the public gallery endpoint** —
  only an organizer/admin-gated `GET /api/gallery/{id}/tally` exposes counts.
  This is the mechanism behind "hidden results during voting": rather than a
  time-window check (which would need to reason about the parent event's
  voting-close time from a different service), the simplest and hardest-to-
  get-wrong version is "counts are never public in the first place, period" —
  an organizer can build a "reveal results" feature on top of the existing
  tally endpoint when they choose to, without the platform racing a clock.

**What's explicitly not implemented**: comment moderation/deletion, an
organizer-configurable choice between "community voting" and an alternative
mechanism (the spec allows an alternative "that can be technically
defended" — this build only implements identity-gated voting, not a
second mechanism to choose between), randomized project ordering in the
gallery response (the gallery currently sorts by `submitted_at DESC`; a
`sort=random` query option would be a small addition to
`SubmissionRepository.searchGallery`), and a dedicated audit-trail table
(Kafka's event log *is* a partial audit trail for cross-service actions, but
there's no queryable, retained audit log exposed via an API).
