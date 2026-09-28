# Architecture

PermitFees is a data-backed reference for US construction permit
fees. It combines official-source data, deterministic fee calculations, and
human-written editorial content. This document records the architecture and,
more importantly, *why* each choice was made.

## 1. Product constraints that drive the architecture

These are not negotiable, and they rule out several fashionable options:

1. **Every published number must be traceable to an official source.** So the
   data model has to carry provenance and verification state natively, not as
   an afterthought.
2. **Calculations must be deterministic and reproducible.** No model inference
   in the request path, ever. The same inputs and the same rule set must
   produce the same output, byte for byte.
3. **Pages are earned, not generated.** A URL exists only when a jurisdiction
   has enough verified, unique information. Indexability is a property we
   assert deliberately, not a default.
4. **Quality over quantity.** A small curated dataset beats a large scraped one.
5. **The MVP must run on Neon's free plan.** Query pattern and storage size are
   architectural concerns, not deployment details.

## 2. Stack

| Concern | Choice | Notes |
| --- | --- | --- |
| Framework | Next.js 16 (App Router) | Server Components by default. |
| Language | TypeScript, `strict` + `noUncheckedIndexedAccess` | |
| Styling | Tailwind CSS v4 | Configured in CSS (`@theme`), no JS config file. |
| Database | PostgreSQL on Neon (serverless) | Free plan during MVP. |
| Data access | Drizzle ORM + `@neondatabase/serverless` (HTTP driver) | |
| Validation | Zod 4 | Shared by env parsing and fee-rule validation. |
| Tests | Vitest | Node environment; no DOM tests yet. |
| Package manager | npm | Committed lockfile. |

Deliberately absent: no CMS, no state manager, no component library, no UI kit,
no analytics SDK, no auth provider, no monorepo. Each would be a dependency with
no current job. See `ROADMAP.md` for when they would earn their place.

## 3. Module boundaries

```
src/
  app/                  Routes. Server Components unless a file is marked
                        "use client" for a genuine interaction need.
  components/
    ui/                 Primitive design-system pieces (no data awareness).
    layout/             Header, footer, navigation, page shell.
    data/               Domain presentation: source blocks, estimate notices,
                        calculation breakdowns, verification badges.
    seo/                JSON-LD emitters and breadcrumbs.
  lib/
    calc/               PURE. The fee engine. Must never import db/, env, or
                        anything server-specific. Testable in isolation.
    db/                 Schema, client, queries. Server-only.
    sources/            Source and verification domain logic.
    editorial/          Publishing gates: what deserves a URL.
    seo/                URL builders, metadata builders, slug rules.
    site.ts             Site-wide config (name, origin, defaults).
    env.ts              Zod-validated environment access.
tests/                  Unit tests, grouped by module.
drizzle/                Generated SQL migrations (committed).
```

### Enforced rules

- **`lib/calc` is pure.** It receives plain rule objects and returns a plain
  result. It has no database, no clock, and no network. This is what makes
  financial correctness testable and regression-proof.
- **`lib/db` is server-only.** It imports `server-only`, so any accidental
  client import fails at build time rather than leaking credentials.
- **`DATABASE_URL` never reaches the browser.** Only `NEXT_PUBLIC_*` variables
  are readable client-side; nothing else is inlined.

## 4. Rendering strategy

The content is curated and changes slowly (a fee schedule update is a manual,
verifiable event — not a real-time feed). That makes Incremental Static
Regeneration the correct default, and `force-dynamic` an anti-pattern here.

| Route | Strategy | Rationale |
| --- | --- | --- |
| `/` | Static, `revalidate` 1h | Editorial, changes rarely. |
| `/methodology/`, `/about/`, `/privacy/`, `/terms/`, `/contact/` | Static | Pure editorial. |
| `/states/` | ISR, `revalidate` 1h | Directory; grows with the dataset. |
| `/{state}/` | ISR, `revalidate` 1h | Jurisdiction rollup. |
| `/{state}/{city}/` | ISR, `revalidate` 1h | Jurisdiction hub. |
| `/{state}/{city}/{permit}/` | ISR, `revalidate` 1h | The highest-value pages. |
| `/sitemap.xml`, `/robots.txt` | Generated, `revalidate` 1h | Must reflect published pages only. |
| `/admin/*` (Phase 4) | Dynamic, never cached | Authenticated mutation surface. |

Because the dataset is small and non-volatile, ISR keeps the Neon compute
suspended most of the time — which is also how we stay inside the free plan.

Cache invalidation after a data edit will be **on-demand revalidation** from the
admin surface (Phase 4), not a short TTL. That keeps freshness explicit and
auditable instead of making every page expire constantly.

## 5. Request data flow

```
route (Server Component)
  → lib/editorial gate        is this page publishable at all?
  → lib/db/queries            typed Drizzle query, indexed, no N+1
  → lib/calc                  rule objects in → breakdown out (pure)
  → components/data           render breakdown + sources + verification
  → lib/seo                   metadata + JSON-LD from the same data
```

The calculation is always shown as a *breakdown* (component by component), not
a single number. Transparency is a product requirement, and it doubles as the
debug surface when a rule is wrong.

## 6. Failure and degradation policy

- If `DATABASE_URL` is unset (fresh clone, CI, preview build), the app must
  still build and render its editorial pages. Query helpers return empty
  results and data-dependent routes call `notFound()`.
- A database error on a public page must not produce a 500 for a crawler. We
  log with context and degrade to an unavailable state.
- The engine never fails silently: unsupported rule configurations raise a
  typed error and are covered by tests.

## 7. Security posture

- Environment variables are validated with Zod, on the server, lazily.
- All SQL goes through Drizzle's parameterized query builder. No string-built
  SQL anywhere.
- Static content is authored in TypeScript, not accepted from users, so there
  is no CMS-shaped injection surface yet.
- Security headers are set in `next.config.ts`. A nonce-based CSP is a Phase 2
  item (it needs a nonce strategy to avoid `unsafe-inline`).
- No public API, no user accounts, no payments, no public calculator POST
  endpoint in Phase 1. Calculations run server-side in the render.

## 8. Deferred decisions (recorded on purpose)

| Deferred | Why now is too early | Trigger to revisit |
| --- | --- | --- |
| Monorepo / separate calc package | One consumer. | A second consumer (CLI, API) appears. |
| Admin CMS | The dataset does not exist yet. | Data entry becomes the bottleneck. |
| Audit log table | Effective-dating already reconstructs history. | Multiple editors or regulatory disputes. |
| Search Console ingestion | Needs production traffic. | Phase 5, with real query data. |
| AdSense integration | Needs content depth and policy pages first. | After the Phase 3 content bar is met. |
| `unstable_cache` / `use cache` | Route-level ISR is sufficient and simpler. | Query cost becomes the bottleneck. |
