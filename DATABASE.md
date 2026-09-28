# Database

PostgreSQL on Neon, modelled with Drizzle ORM. The schema is the single source
of truth; TypeScript types are inferred from it rather than declared twice.

## 1. Guiding decisions

**D1 — Fees are data, never code.** A jurisdiction's fee schedule is rows, not a
TypeScript function. Adding a city must never require a deploy.

**D2 — Rules are versioned by effective dating, not by copying rows forward.**
Every fee rule carries `effective_from` / `effective_to`. Querying "the fee as
of 2026-09-23" is a filter, not a migration. This answers "what did it cost last
year?" without a data-warehouse project.

**D3 — Provenance is a first-class entity.** A `source` is a real row with an
authority, a type, and a URL. Fees, requirements and content all point at
sources. There is no "notes field that mentions where this came from".

**D4 — Verification is its own record, not a boolean.** `last_verified_at` alone
cannot express "verified by phone, contradicted by the published PDF". A
`verification_records` ledger captures who checked what, how, and when.

**D5 — Geography is a hierarchy, not a string.** `state → county?  → jurisdiction`.
A city belongs to a state; a county-level jurisdiction belongs to a county. The
permit authority is often *not* the city (unincorporated county areas are the
classic trap), which is exactly why the jurisdiction carries its own type.

**D6 — Pages are earned.** A URL exists only if a `jurisdiction_permit_pages`
row exists *and* passes the editorial gate. The database — not the router —
decides what is publishable. This structurally prevents thin programmatic pages.

**D7 — No audit-log table yet.** Effective dating plus the verification ledger
reconstructs history well enough for a single-editor project. Add
`audit_log` when there are multiple editors. (Deliberate deferral, see
`ROADMAP.md`.)

## 2. Entities

### Geography

| Table | Purpose | Key constraints |
| --- | --- | --- |
| `states` | 50 states + DC + territories. | `code` unique (2 letters), `slug` unique. |
| `counties` | Counties, used when the permit authority is a county. | `(state_id, slug)` unique. |
| `jurisdictions` | The permit-issuing authority. City, county, town, village, borough, or special district. | `(state_id, slug)` unique globally-resolvable via its state. |
| `departments` | Real contact routes: building, planning, fire, health, utilities. | `(jurisdiction_id, kind)` unique. |

Why a separate `departments` table instead of columns on `jurisdictions`: a
jurisdiction routinely has several relevant offices with different phone
numbers and portals, and the "right" one depends on permit type. Flattening
that into columns forces us to choose one and lose the rest.

### Permit catalogue (global, reusable)

| Table | Purpose |
| --- | --- |
| `permit_types` | `building`, `electrical`, `plumbing`, `mechanical`, `roofing`, `demolition`, `fence`, `pool`, `solar`, `signage`, `grading`, `fire`, `zoning`, `other`. |
| `project_types` | New construction, addition, kitchen remodel, bathroom remodel, ADU, re-roof, water heater replacement, EV charger, deck, fence, pool. |

Both are **global catalogues** because "electrical permit" means the same thing
everywhere. Anything jurisdiction-specific belongs in a relationship table:

| Table | Purpose |
| --- | --- |
| `jurisdiction_permit_types` | Does this jurisdiction issue this permit? Under what local name? Link to its official page. |

This is the difference between a fact about permits and a fact about a city, and
keeping them apart is what lets the dataset scale without contradiction.

### Requirements

| Table | Purpose |
| --- | --- |
| `permit_requirements` | Documents, inspections, licences, bonds, insurance, zoning review, HOA review. Scoped to jurisdiction + permit type, optionally narrowed to a project type. |

Requirements are separate from fees because users research them separately
("what do I need" precedes "what does it cost"), and because they change on a
different cadence than fee schedules.

### Fees

| Table | Purpose |
| --- | --- |
| `sources` | The official reference: URL, title, type, issuing authority, dates, archive pointer. |
| `source_snapshots` | Immutable evidence that a source said X at time T (`content_hash`, capture date). |
| `fee_schedules` | A published schedule document-era: title, official URL, effective window, status. Groups rules. |
| `fee_rules` | One calculable component: type, config (JSONB, Zod-validated), conditions, min/max, priority, effective window, status, source. |

`sources` and `fee_schedules` are intentionally **not merged**: the same official
fee-schedule PDF can govern several jurisdictions' worth of rules, and the same
source URL can support both a fee rule and a requirement. The snapshot table is
what lets us still answer questions when a municipal site reorganises its URLs.

### Editorial

| Table | Purpose |
| --- | --- |
| `jurisdiction_profiles` | Human-written local context for a city page, plus SEO fields and publish status. |
| `jurisdiction_permit_pages` | The per-permit page: intro, local summary, FAQs, worked example, publish status, `noindex`. Unique on `(jurisdiction_id, permit_type_id)`. |

### Verification

| Table | Purpose |
| --- | --- |
| `verification_records` | Polymorphic ledger: `(entity_type, entity_id, status, method, verified_at, verified_by, notes, source_id)`. |

The polymorphic reference is a deliberate exception to strict normalisation.
Verification applies uniformly to sources, fee rules, requirements and
jurisdiction profiles, and four typed join tables would add complexity without
adding integrity we currently rely on.

## 3. Enumerations

Postgres enums (Drizzle `pgEnum`) for closed, slow-changing sets:

- `jurisdiction_type`: city, county, town, village, borough, special_district
- `department_kind`: building, planning, fire, health, utilities, other
- `permit_category`: structural, electrical, plumbing, mechanical, fire, zoning, site, other
- `occupancy_class`: residential, commercial, industrial, mixed, other
- `source_type`: municipal_website, municipal_code, ordinance, fee_schedule_pdf, state_agency, county_website, official_calculator, permit_portal, other
- `authority_kind`: city, county, state, other
- `fee_component_type`: base, plan_review, technology, inspection, surcharge, state_surcharge, other
- `fee_type`: flat, percent, tiered_marginal, tiered_table, per_unit
- `fee_rule_status`: draft, active, superseded, archived
- `publish_status`: draft, published, hidden
- `verification_status`: unverified, verified, needs_review, outdated, disputed
- `verification_method`: manual_review, official_pdf_review, official_portal_check, phone, email

Enums are for sets we control and expect to be stable. Anything open-ended
(occupancy sub-types, project-specific conditions) is a JSONB key inside the
rule config, validated by Zod, so a new condition does not require a migration.

## 4. Versioning model

```
fee_schedules           fee_rules
─────────────────       ──────────────────────────────────────────
title                   fee_schedule_id  → the era it belongs to
source_id               effective_from   ┐
effective_from          effective_to     │ the as-of query
effective_to            status           ┘
status                                        ↓
                        verification_records (who checked, how, when)
                                      ↓
                        sources + source_snapshots (the proof)
```

Rules:
1. A fee change **never mutates** an existing rule. Close it
   (`effective_to`, `status = 'superseded'`) and insert a new one. History is
   preserved by construction.
2. Effective windows are **half-open**: `[effective_from, effective_to)`. A new
   rule starting on the same day an old one ends does not overlap.
3. Queries always take an explicit `asOf`. There is no "current fee" concept
   without a date — that ambiguity is how stale data silently ships.
4. `verification_records` is append-only. Never edit a verification; add one.

## 5. Indexing

Indexes exist for the access patterns the routes actually use:

- `states(slug)` — unique, powers `/texas/`
- `jurisdictions(state_id, slug)` — unique, powers `/texas/houston/`
- `jurisdiction_permit_pages(jurisdiction_id, permit_type_id)` — unique
- `jurisdiction_permit_pages(publish_status, noindex)` — drives sitemap queries
- `fee_rules(jurisdiction_id, permit_type_id, status)` — the hot calculation path
- `fee_rules(fee_schedule_id)`
- `fee_rules(effective_from, effective_to)` — as-of filtering
- `permit_requirements(jurisdiction_id, permit_type_id)`
- `verification_records(entity_type, entity_id)`
- `sources(jurisdiction_id)`

## 6. Neon free-plan constraints

- Every public page issues **a bounded number of queries** (no N+1). A permit
  page resolves with a handful of round trips via joins.
- Rows are small. Content is text, not binaries; source PDFs are referenced by
  URL (and optionally by content hash) rather than stored in the database.
- The HTTP driver keeps connections stateless, so an idle deployment does not
  hold compute awake.
- Migrations are generated and committed; production changes go through
  `drizzle-kit migrate`, never `push`.

## 7. Phase 1 changes, and what the first real jurisdiction taught us

*(These are schema changes made after seeding Houston. Each was forced by real
data; none is speculative.)*

### 7.1 `fee_type` enum gained `per_thousand`

The Phase 0 enum listed `flat, percent, tiered_marginal, tiered_table, per_unit`
and **omitted `per_thousand`**, while the engine's `FEE_TYPES` already included it.
The mismatch would have failed on the first insert of a Houston structural rule
with a Postgres enum error, and — worse — it would have failed *at seed time*, not
at design time, if the two lists were not compared anywhere.

`scripts/seed.ts` now closes that gap permanently: every rule is passed through the
engine's own `validateFeeRule` before it is written, so a rule the engine cannot
compute cannot reach the database. A future engine/DB divergence surfaces as a seed
failure with the rule code in the message.

### 7.2 `per_unit` config gained `baseCents` and `thresholdUnits`

No migration was needed: `config` is JSONB, which is exactly why rule shapes can
evolve without DDL. See `CALCULATION_ENGINE.md` §11.2 and
`research/texas/houston.md` §5.3 for the arithmetic that forced it.

### 7.3 What the schema got right on first contact

Two things absorbed real data without modification and are worth keeping in mind
before changing them:

- **Effective dating per rule, not per document.** Houston's fee schedule has no
  single effective date: every row shows its own `As Of`. A document-level date
  would have been a lie on day one, and a per-rule `effective_from` was already the
  shape.
- **`verification_status = 'disputed'`.** It was unused in Phase 0 and was needed by
the very first jurisdiction: Bldg. Code Sec. 118.1.3 publishes a $91.06 minimum
  permit fee while Sec. 118.2.1 publishes a $47.00 flat fee, for the same small
  valuations. Had the enum only offered `verified`/`unverified`, the conflict would
  have had to be resolved by guessing, which is the failure mode the whole model
exists to prevent.

### 7.4 Idempotency of the seed

Every seeded table has a natural key the seed upserts on: state `code`, county and
jurisdiction `(state_id, slug)`, permit type and project type `key`, source `url`,
fee rule `(jurisdiction_id, permit_type_id, code, effective_from)`,
jurisdiction profile `jurisdiction_id`, permit page `(jurisdiction_id, scope_key)`.

Two tables have no unique index and are therefore resolved by explicit lookup:
`fee_schedules` (a jurisdiction may publish two schedules with the same title in
different years) and `permit_requirements` (title within jurisdiction and permit
type).

`verification_records` is append-only, so the seed inserts a row only when an
identical `(entity, verified_at, status)` triple is absent. It never updates or
deletes one. `npm run db:reseed` exists to prove this: it runs the seed twice and
leaves the same number of rows.

## 8. Credentials, and where they are read from

`DATABASE_URL` lives in `.env.local`, which `.gitignore` excludes. Three things
need it — the Next.js server, `drizzle-kit`, and the seed script — and they do not
agree by default: `drizzle-kit` bundles its own `dotenv`, which reads `.env` only.
A developer following Next's own advice, and putting the connection string in
`.env.local`, would have found `npm run db:migrate` reporting a missing database
while `npm run dev` worked.

`scripts/load-env.ts` closes that gap and is the single answer to "where do
environment variables come from":

1. the real environment — so `DATABASE_URL=… npm run db:seed` overrides;
2. `.env.local`;
3. `.env`.

That is Next's precedence, applied to every entry point.

No log line may print a connection string. `src/lib/errors.ts` redacts PostgreSQL
URLs, `password=` parameters, assignments to sensitive names and Neon API keys,
and every error path that can receive a driver error routes through it — `safeQuery`
in the app and the seed's failure handler. `tests/lib/security.test.ts` also walks
the repository looking for a committed credential, ignoring only values that are
visibly placeholders.

## 9. What the integration suite asserts

`tests/integration/houston-database.test.ts` is skipped unless `DATABASE_URL` is
set, because every assertion in it is a claim about a database that exists. When it
runs, it reads through the application's own query layer — a query layer that
passes here is the one the pages use — and checks four things the unit tests cannot:

1. **The migration.** All fifteen tables, the `fee_type` enum carrying every type
the engine can compute (`per_thousand` included), and the unique indexes each seed
upsert targets.
2. **The seed.** Row counts compared against the payload rather than hard-coded, so
a half-written seed fails; and zero duplicates on every natural key, which is what
"idempotent" actually means.
3. **Engine ↔ database.** Every stored rule carries a `fee_type`, `component_type`
and `status` the engine recognises, passes `validateFeeRule`, and resolves to a
real source and jurisdiction. A rule the engine cannot compute cannot be published.
4. **Pages and indexability.** The three published pages pass the editorial gate,
the withdrawn and never-researched ones do not resolve at all, the published
figures compute from the rows PostgreSQL returned, and every URL in the sitemap is
re-resolved through the same query the route uses.

## 10. Deferred

- `audit_log` — add with multiple editors.
- Search Console metric tables — Phase 5, once there is real traffic.
- `content_changelog` for "what changed this month" reporting — a content
  marketing asset, not a data-integrity need.
- Full-text search — Postgres `tsvector` is the right tool, but only after the
  dataset is big enough that browsing stops working.
