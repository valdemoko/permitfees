# SEO Architecture

> **Status: approved architecture, not yet filled with content.** The routes in
> section 2 are implemented; they deliberately return `404` until a jurisdiction
> has real, verified data behind it.

SEO is a structural property of this product, not a layer added at the end. Two
rules drive everything below:

1. **Never create a URL we cannot justify with unique, verified information.**
2. **Never serve the same content on two URLs.**

## 1. URL architecture: evaluating the proposal

The proposed structure was:

```
/
/states/
/texas/
/texas/houston/
/texas/houston/building-permit-fee/
/texas/houston/electrical-permit-cost/
```

It is close to right, but it contains two latent problems and one inconsistency.

### Problem A — the `/states/` prefix is inconsistent

`/states/` is the index of states, but individual states are proposed at the
root (`/texas/`), not under it (`/states/texas/`). Pick one mental model.

### Problem B — `/building-permit-fee/` vs `/electrical-permit-cost/`

The first uses `-fee`, the second `-cost`, for the same kind of page. That is not
a style nit: it means two pages per permit type competing for one intent, or an
arbitrary choice that future editors will get wrong. "Fee" and "cost" are the
same query intent in practice.

### Options considered

| Option | Shape | Assessment |
| --- | --- | --- |
| **A** | `/texas/houston/building-permit-fee/` | Short, semantic. Inconsistent suffix; collides with nothing but requires discipline. |
| **B** | `/states/texas/houston/building-permit-cost/` | Fully namespaced, zero collision risk. One extra level, and every money page is 4 segments deep. |
| **C** | `/permits/texas/houston/building-permit-cost/` | Namespaced, but adds a level that carries no meaning for the searcher. |
| **D** | `/building-permit-cost-houston-tx/` | Flat. Best raw keyword adjacency, worst information architecture, no hub pages, unscalable internal linking. Rejected. |

### Recommendation: Option A, with two corrections

```
/                                                   National entry point
/states/                                            Directory of states
/texas/                                             State hub
/texas/houston/                                     Jurisdiction hub
/texas/houston/building-permit-cost/                The money page
/texas/houston/kitchen-remodel-permit-cost/          Project-specific page
```

**Correction 1 — consistent suffix.** One canonical suffix per page class. We
use `-cost` for the permit/project cost page because the dominant query phrasing
is "how much does X cost", and we target "permit fee" phrasing *inside* the page
rather than in the URL. The suffix is stored on the entity (`permit_types.slug`,
`project_types.slug`), so the convention is data, not a hard-coded string, and
can be tuned per page once Search Console gives us real query data.

**Correction 2 — state at the root.** Reasons:

- It is the shortest form, and it matches how the searcher already thinks
  ("Houston building permit" → `/texas/houston/`).
- It keeps the money page at three segments: state / city / permit. Every
  additional segment dilutes both link equity and crawl relevance.
- It creates the natural hub structure `/` → `/texas/` → `/texas/houston/` →
  permit page, which is also the internal linking skeleton.

The cost of this choice is **slug collisions**: a root-level `[state]` segment
will try to swallow `/about`, `/methodology`, `/states`, etc. Mitigations, all
of which are implemented:

1. Next.js gives static routes precedence over dynamic segments, so
   `/methodology` can never be captured by `[state]`.
2. A reserved-word list (`lib/seo/slugs.ts`) is enforced against every slug we
   write to the database, so "houston", "states" or "about" can never become a
   state slug.
3. Any `[state]` that does not resolve to a real state calls `notFound()` — a
   `404`, never a thin page.

**Why we do not create both `-fee` and `-cost` pages:** they would be the same
page with different titles, which is the textbook definition of the doorway-page
pattern that Google penalises. One canonical URL, both phrasings inside.

### Levels we deliberately do not have

- **No county level in the URL.** Counties matter as *authorities*, not as
  navigational levels. Where the permit authority is a county (unincorporated
  Harris County, for example), the county becomes the jurisdiction and it owns
  its own slug. Nesting counties in URLs would create a fourth level that most
  searchers never use.
- **No `/states/texas/houston/` duplicate.** Only one form of any page exists.
- **No keyword permutations.** No `/cheap-building-permit-houston/`, no
  `/2026-building-permit-cost-houston/`. These are thin pages by construction;
  the year belongs in content that gets updated, not in the URL that then goes
  stale.

## 2. Implemented routes

| Route | Page class | Indexable when |
| --- | --- | --- |
| `/` | National entry | Always |
| `/states/` | State directory | Always (harmless while short; revisit if it stays empty) |
| `/{state}/` | State hub | The state has ≥1 publishable jurisdiction page |
| `/{state}/{city}/` | Jurisdiction hub | `jurisdiction_profiles.publish_status = 'published'` |
| `/{state}/{city}/{permit}/` | Permit cost page | `jurisdiction_permit_pages` passes the editorial gate |
| `/methodology/`, `/about/`, `/contact/`, `/privacy/`, `/terms/` | Editorial | Always |

## 3. The indexability gate

This is the mechanism that enforces "quality over quantity" in code. A page is
indexable only if **all** of these hold:

1. A page row exists with `publish_status = 'published'` and `noindex = false`.
2. It has human-written, page-specific prose above a minimum length.
3. It has at least one primary `source` with a resolvable URL.
4. It has at least one active fee rule **or** an explicit "no public schedule"
   note.
5. `last_verified_at` is present.

If any check fails, the page either does not exist (`404`) or is served with
`robots: noindex, follow`. The gate lives in `src/lib/editorial/`, and the
sitemap uses the same function, so the two can never disagree.

## 4. Canonical URL rules

- Exactly one canonical form per page, always with a trailing slash, always
  absolute, always lowercase, always the production origin.
- `trailingSlash: true` in `next.config.ts` makes Next.js 308-redirect the
  non-slash variant, so duplicates are prevented at the server, not with a tag.
- `metadataBase` is set from `NEXT_PUBLIC_SITE_URL`, so `alternates.canonical`
  and Open Graph URLs are correct without per-page string building.
- The app is **not indexable unless `NEXT_PUBLIC_SITE_INDEXABLE=true`**. Staging,
  preview deployments and localhost emit `noindex` site-wide. This is a
  deliberate safety rail: a preview URL leaking into the index is one of the
  most common and most damaging SEO accidents.
- Query parameters never change content and are not in any canonical form.

## 5. Metadata templates

Titles are built from data, never hand-written per page, so they cannot drift.

| Page class | Title template |
| --- | --- |
| Home | `PermitFees — Construction permit costs, sourced from official fee schedules` |
| State hub | `{State} building permit costs by city` |
| Jurisdiction hub | `{City}, {ST} permit fees and requirements` |
| Permit page | `{Permit} cost in {City}, {ST}` |
| Project page | `{Project} permit cost in {City}, {ST}` |
| Methodology | `Methodology — how we source and verify permit fee data` |

Descriptions are also generated from real fields (fee range, last verified
date, authority), so a description can never claim something the page does not
contain. Titles are length-capped with an explicit truncation helper rather than
being cut arbitrarily by Google.

## 6. Structured data

Only markup that reflects content actually on the page. No invented ratings, no
fake review counts, no `Product`/`Offer` markup for an estimate (that would be
inaccurate and is the sort of thing that earns a manual action).

| Type | Used on | Conditions |
| --- | --- | --- |
| `Organization` + `WebSite` | Layout (site-wide) | Always |
| `BreadcrumbList` | Every page below the root | Matches the visible breadcrumbs |
| `WebPage` | Data pages | With `dateModified` from verification data |
| `FAQPage` | Pages with a real FAQ block | Only when the questions are visible on the page |
| `Dataset` | Jurisdiction hub, later | When we can honestly describe the dataset and its update cadence |

Deliberately **not** used: `Product`, `Offer`, `AggregateRating`,
`SoftwareApplication`. There is no product, no price, no rating.

## 7. Crawl and duplication controls

- `/robots.txt` (generated): allows everything except `/admin/`, `/api/`, and
  the internal tooling paths; declares the sitemap; sets `host`.
- `/sitemap.xml` (generated): contains **only** pages that pass the indexability
  gate, with `lastModified` taken from real verification dates rather than
  build time. A sitemap full of `dateModified = now` is noise and hurts trust.
- `404`: a real, useful `404` with navigation back into the directory. Unknown
  states/cities/permits call `notFound()` rather than rendering an empty shell.
- **Redirects**: any URL change gets a single 301 to the new canonical URL. We
  never delete a URL that has traction; we redirect it. The redirect map will be
  a versioned file (`lib/seo/redirects.ts`) so it is reviewable in git.
- **Pagination**: not needed and not implemented. If a directory ever exceeds a
  browsable size, the correct answer is better hub pages, not `?page=2`.

## 8. Internal linking

The linking graph is generated from the data, not hand-maintained:

```
home → states directory → state hub → jurisdiction hub → permit pages
permit page → sibling permit pages in the same city (relevant, not exhaustive)
permit page → methodology + the official source (outbound, attributed)
jurisdiction hub → neighbouring jurisdictions in the same state (bounded)
```

Rules: every page is reachable within 3 clicks of the home page; no orphans; no
site-wide link blocks whose only purpose is to pass equity; anchor text comes
from the target page's actual subject.

## 9. Search Console operating plan

The point of Search Console is to *decide what to build next*, not to watch
impressions. The workflow we design for:

1. **Quarterly query review**: cluster queries by state, permit type and project
   type. Queries with impressions but no matching page are the highest-value
   backlog candidates.
2. **Page-level diagnostics**: track `Discovered – not indexed` and
   `Crawled – not indexed` as signals that a page exists but did not earn its
   place. Those pages get improved or removed — removing is a legitimate answer.
3. **CTR analysis on money pages**: a page ranking well with a low CTR means the
   title/description template is wrong, which is a fixable, site-wide lever.
4. **Coverage hygiene**: any `noindex` page unexpectedly appearing in coverage
   reports means the gate is leaking; that is a bug, not a marketing problem.

Phase 5 adds an ingestion layer for this. Phase 1 only guarantees that the URL
and metadata architecture makes the analysis possible (stable URL classes, no
parameter soup, one page per intent).

## 10. Anti-patterns this architecture structurally prevents

| Anti-pattern | Prevention |
| --- | --- |
| Thin city pages that repeat a template | Pages require a DB row that passes the editorial gate |
| Doorway pages per keyword variant | One canonical URL per intent; no `-fee`/`-cost` twins |
| Auto-generated sitemaps of doomed URLs | Sitemap and gate share one function |
| Duplicate content via trailing slash / casing | Server-level 308 + lowercase slug enforcement |
| Stale `dateModified` | Dates come from verification records, not build time |
| Content scaled before demand exists | New pages require a documented demand signal |

## 11. Phase 1 verification against a real jurisdiction

The anti-patterns above are structurally prevented, which is a claim worth testing.
Houston exercised the first two on the first attempt:

- **Two pages were withheld.** Mechanical and demolition are seeded as `draft` with
  `noindex = true`, so `/texas/houston/mechanical-permit-cost/` does not exist and is
  absent from the sitemap. Nothing had to be deleted; the gate simply never opened.
  `tests/content/houston-seed.test.ts` asserts that exactly those two are withheld,
  so opening one later requires deliberately changing a test that names the reason.
- **The gate and the sitemap share a predicate.** `listSitemapEntries()` filters on
  `publish_status = 'published' AND noindex = false`, and so does every route. The
  sitemap therefore cannot advertise a URL the router would 404, because both read
  the same two columns. The sitemap entitlement is 1 hour, shorter than any content
  change cadence, so a change to the gate cannot leave a stale sitemap behind.

## 12. End-to-end verification against live PostgreSQL

Phase 1B connected a real Neon database and found four defects that no test had
reached, because all four only appear in rendered output or in a deployment's env.
Each one is now fixed and pinned by a test.

### Pages and files are not the same kind of URL

`absoluteUrl` guarantees a trailing slash, because every page on this site has one
and that guarantee is what keeps one canonical form per page. `robots.txt` used
that same helper for its `Sitemap:` directive, so the deployed file advertised
`/sitemap.xml/` — which answers **308** and redirects. A crawler was being sent to
a redirect instead of the sitemap.

`absoluteFileUrl` now handles files (the sitemap, the Open Graph image), and
`tests/seo/robots.test.ts` asserts the directive has no trailing slash. The Open
Graph image path had the same bug, latent because no page had set one yet.

### Two flags, not one, decide whether a deployment is indexable

A deployment is `noindex` site-wide unless `NEXT_PUBLIC_SITE_INDEXABLE=true`, and
canonical URLs come from `NEXT_PUBLIC_SITE_URL`. Both are `NEXT_PUBLIC_*`, so Next
inlines them **at build time**: setting them after `next build` changes nothing.
With only `DATABASE_URL` present — the state a new developer lands in — the
sitemap is legitimately empty and `robots.txt` says `Disallow: /`. That is the
guard working, not a bug, but it means "the sitemap is empty" is expected until the
flags are set. Verified with the flags on: 12 URLs, the 3 Houston permit pages
among them, and `index, follow` on every public page.

### Room for a reader, and room for the crawler

Two rendering defects were only visible by looking at the page:

- The **Applies when** column printed `describeCondition`, the debug formatter:
  `valuation gt 0 AND valuation lte 700000`. Cents, operators, and a `$0` bound
  true of every project. `describeConditionForReader` now renders the same
  condition as "Project valuation up to $7,000" and hoists a shared subject for a
  bracket's two bounds.
- The excluded-fees list printed one sentence eight times, because Houston's nine
  mutually exclusive brackets leave eight applying nothing. Identical exclusions
  are grouped and counted: "…does not apply to the inputs provided. (8 rules)".

### The thing to check before the second jurisdiction

Not the data model — the **environment**. `drizzle-kit` reads only `.env`,
Vitest reads neither file into `process.env`, and the application reads
`.env.local`. Three tools, three answers to "where do environment variables come
from", and each one failed silently in a different way: a migration that reports a
missing URL while `npm run dev` works, and an integration suite that *skips* —
which looks exactly like passing.

`scripts/load-env.ts` is now the single loader (real environment, then
`.env.local`, then `.env`), used by the app, `drizzle-kit`, the seed and
the test setup. Any second jurisdiction inherits the fix.

### What remains unverified

The four defects above are all in the code path a **second city** would reuse, so
they are worth more than the Houston data itself. What is still unproven is
anything that needs traffic: whether these pages rank, and which of them earn
impressions. That is the Search Console phase, and it is the only reason to
hesitate before adding a city.
