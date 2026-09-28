# Phoenix, Arizona — permit fee research

Status: **modelled, seeded, published.** One page live
(`/arizona/phoenix/building-permit-cost/`), three rules, three sources. This is the
first jurisdiction outside Texas and the first whose fee schedule was reachable
live: every document below was fetched from `phoenix.gov` directly on the date
recorded, not from an archive.

Last verified: **2026-09-24**. Effective from **2026-01-20** (Ordinance G-7465,
approved 2025-12-17).

Phoenix is the first city in this project whose **plan review is a percentage of its
own permit fee**, and that single fact is why the engine gained a primitive. See
§5.

## 0. How these sources were obtained, and what that costs

Unlike Dallas, no archive was needed. `phoenix.gov` answered from this environment
and every URL below returned 200 on 2026-09-24.

| # | Document | URL | Size / hash | Pages |
| --- | --- | --- | --- | --- |
| S1 | PDD Fee Schedule (Chapter 9, Appendix A.2; eff. 2026-01-20, Ordinance G-7465) | `phoenix.gov/content/dam/phoenix/pddsite/documents/impact-fees/fee-schedule.pdf` | 616,766 B · sha256 `4193e742…4ff9436d` | 50 |
| S2 | Fees, Valuations and Assurances | `phoenix.gov/administration/departments/pdd/tools-resources/fees.html` | HTML, 314,733 B | — |
| S3 | Building Valuation Table (revised 2026-01-20) | `phoenix.gov/content/dam/phoenix/pddsite/documents/impact-fees/building-valuation-table.pdf` | sha256 `2949f758…ac3519fe` | — |

Text was extracted with `pdftotext -layout` (table shape) and `pdftotext -raw`
(cross-check). **S3 could not be read**: the file downloads, but `pdftotext`
returns zero lines — it has no text layer — and this environment has no OCR. That is
recorded rather than worked around, and S3 is carried as `needs_review`.

**What this costs.** Less than Dallas: the hashes above are of files fetched from
the publisher's own host, so a re-capture is a direct comparison rather than an
archive stand-in. What it still costs is that S1 is a single 50-page document with
one effective date for everything in it; nothing here has been confirmed against a
permit the City actually issued.

## 1. Authority

| Field | Value | Source |
| --- | --- | --- |
| Jurisdiction | City of Phoenix, Maricopa County, Arizona | S1 cover |
| Type | city | — |
| Issuing department | Planning & Development Department (PDD) | S1 cover, S2 |
| Address | 200 W Washington St., 3rd Floor, Phoenix, AZ 85003 | S1 cover |
| Phone | 602-262-7811 (S1 cover); 602-495-0243 for fee questions (S2) | S1, S2 |
| Permit portal | `apps-secure.phoenix.gov/PDD/Permits/` — verified: answers on the City's host and redirects an unauthenticated visit to its logon page | S2 |
| Timezone | America/Phoenix (Arizona does not observe DST) | — |

S2 also names **SHAPE PHX** as a newer front end for the same department. No stable
public URL for it was confirmed, so it is not recorded as the portal.

## 2. Official sources

### S1 — PDD Fee Schedule

Approved **2025-12-17**, effective **2026-01-20**, adopted by **Ordinance G-7465**,
Phoenix City Code Chapter 9 Appendix A.2. Fifty pages: site planning, environmental,
subdivision, sign, civil engineering, building safety, parklet, miscellaneous and a
glossary. Every figure on the published page comes from the building safety section
and nothing else.

It carries one effective date for the whole schedule, unlike Houston's per-row
"As Of" column. That makes it simpler to date and harder to detect partial
amendments in: an amendment would have to be a new document.

### S2 — Fees, Valuations and Assurances

The department's own fee landing page. Used for four things, all of them things a
fee schedule cannot state about itself:

1. It publishes S1 as **the** development fee schedule and dates it 20 January 2026,
   which is how the effective date was confirmed independently of the PDF cover.
2. It names the fee schedules that are **not** part of S1 — Zoning; Impact Fees; Fire
   Permit and Plan Review Fees; Water and Sewer Fees — which is the basis for the
   "not included" section on every page.
3. It lists the counters that collect fees, their email addresses and their phone
   numbers.
4. It is the source for S3 being revised on the same date as the schedule.

S2 also carries a **notice of a proposed** user fee increase. A proposal is not a
fee and it is not reflected anywhere in the data.

### S3 — Building Valuation Table

Published by the same department, revised 2026-01-20. It is the table behind the
schedule's definition of valuation ("building square footage times standard rate for
occupancy"). It was downloaded and hashed, and it **could not be read**: no text
layer, no OCR available. No square-footage rate from it appears anywhere on this
site. It is recorded as a source with `lastVerifiedAt: null` and a `needs_review`
verification record, because that is what happened.

## 3. What Phoenix actually charges — the structural difference

Two features separate Phoenix from both Texas cities.

**First: one valuation table for everything.** Houston prices trades per item and
has a nine-bracket structural table; Dallas picks between three construction tables
by building type and prices trades by trade count. Phoenix has **one** table, Table
A, applied to the valuation of the work, and it is the same table for a house, a
tenant improvement and a warehouse. No square-footage rate, no per-dwelling-unit
rate, no per-fixture rate, no trade-count rate.

**Second: plan review is a percentage of the permit fee.**

> Building Plan Review fees are based on a percentage of the calculated building
> permit fee with a minimum charge for each application.

Specifically: **100%** of the permit fee for valuations of $50,000 or less, **80%**
above that, **minimum $195** in both cases, applying where the valuation exceeds
$5,000 and a plan review is required.

That is not expressible as a valuation-based percentage, because the permit fee is
not linear in valuation. It is a percentage of another computed component, and the
engine had no way to say that. §5 records what was added.

## 4. Data as modelled

### 4.1 Table A — the valuation-based permit fee

Phoenix prints seven rows. Read as a marginal schedule they are one rule, because
each row's base amount is exactly what the rows below it produce:

| Project valuation | Published row | Check |
| --- | --- | --- |
| $1 – $1,000 | $195 base fee only | — |
| $1,001 – $10,000 | $195 on first $1,000, plus $12 per additional $1,000 or fraction thereof | $303 at $10,000 = $195 + 9 × $12 |
| $10,001 – $50,000 | $303 on first $10,000 plus $10 per additional $1,000 | $703 at $50,000 = $303 + 40 × $10 |
| $50,001 – $200,000 | $703 on first $50,000 plus $9 per additional $1,000 | $2,053 at $200,000 = $703 + 150 × $9 |
| $200,001 – $1,000,000 | $2,053 on first $200,000 plus $9 per additional $1,000 | $9,253 at $1,000,000 = $2,053 + 800 × $9 |
| $1,000,001 – $10,000,000 | $9,253 on first $1,000,000 plus $5 per additional $1,000 | $54,253 at $10,000,000 = $9,253 + 9,000 × $5 |
| Over $10,000,000 | $54,253 on first $10,000,000 plus $5 per additional $1,000 | — |

The chaining is the reason one rule suffices, and it is the **opposite** of
Houston's schedule, whose published base charges deliberately do not chain
(Houston's top of the $7,001–$150,000 bracket computes to $813.48 while the next
bracket publishes a base of $815.07). Houston's drift had to be reproduced
per-bracket; Phoenix's does not drift, so it is one rule.

**"Or fraction thereof" is modelled, not rounded away.** Every rate is charged per
additional $1,000 *or fraction thereof*. This is implemented with `incrementCents:
100000`, which rounds the valuation up to the next whole $1,000 before the bands
are applied. Because every band boundary is itself a whole $1,000, that is
arithmetically identical to rounding each band's own excess — which is exactly how
the table is written. At $1,001 the fee is $207, not $195.01.

**The rates are whole basis points, so nothing is lost.** $12 per $1,000 is exactly
1.2% (120 bps), $10 is 1% (100), $9 is 0.9% (90) and $5 is 0.5% (50). No exact
rational rate was needed here, unlike Dallas.

**The City's own example is reproduced.** S1 states:

> assuming a total project valuation of $250,500: $2,053 base fee plus $459
> (51 × $9) on the project valuation = Total permit fee cost of $2,512

Calculated here: $250,500 rounds to $251,000; the bands give $195 + $108 + $400 +
$1,350 + $459 = $2,512. Reproduced to the dollar, and asserted in three places —
the engine test, the content test and `npm run db:verify`.

### 4.2 Plan review

| Valuation | Plan review |
| --- | --- |
| ≤ $5,000 | No fee (counter review of 15 minutes or less) |
| over $5,000, up to $50,000 | 100% of the permit fee, minimum $195 |
| over $50,000 | 80% of the permit fee, minimum $195 |

Modelled as two `percent` rules whose basis is `permit_fee`, with the occupancy
distinction dropped: the schedule writes four rows (residential and commercial,
either side of $50,000) and the four rows say only two different things, so
occupancy is not a condition.

**The $195 minimum is published but inert, and it is modelled anyway.** At the
schedule's own thresholds the floor cannot bind: the cheapest permit fee a plan
review can be charged on is the fee at a valuation just over $5,000, which is $255
(100% of it), and 80% of the smallest fee above $50,000 is $562.40. The fee is kept
in the rule because it is in the document and deleting a published term would be a
silent edit; it is exercised in the engine tests against a synthetic base fee, which
is the only place it can be exercised at all.

**The plan review step at $50,000 makes the total fall.** This is real and it is
stated on the page:

| Valuation | Permit fee | Plan review | Total |
| --- | --- | --- | --- |
| $50,000 | $703.00 | $703.00 (100%) | $1,406.00 |
| $50,001 | $712.00 | $569.60 (80%) | $1,281.60 |

The project grew by a dollar and the permit got $124.40 cheaper. Like Dallas's step
at 700 square feet, it is a property of the published schedule rather than a
transcription error, and it is reproduced rather than smoothed.

### 4.3 What is published but NOT modelled

None of the following is estimated. Each is named on the jurisdiction page or the
permit page, or both.

| Item | Published figure | Why it is not modelled |
| --- | --- | --- |
| Residential water heater and fence minimum | $98 (Table A, first row) | The schedule does not say whether it **replaces** or **floors** the $195 base. Table A's rule is unconditional, so an additive $98 rule would double-charge every water heater and fence permit, and a replacement reading would be a guess. |
| Swimming pool minimum | $234 plus a $30 aquatics program surcharge (Ordinance G-3114) | Same ambiguity: replace or floor. |
| Plan review services other than the basic one | Plot plan ($98–$390), single-family design, engineering components, fire life safety ($1,170 min), phased/deferred submittals (160% or 200%), permits by appointment or inspection, expedited (3× basic), corrections after the second (20%), self-certification ($1,950 + 10% surcharge), all at $195/hour with their own minimums | Each is its own published service with its own scope. Charging one requires knowing the project took that route, which no input determines. |
| Event fees | Re-inspection $195; after-hours inspection $195/hour ($390 or $585 min); conditional utility clearance; temporary power $195; temporary or partial certificate of occupancy $780; annual facilities, elevator, refrigeration | They attach to events, not to permits. |
| Solar | Five flat over-the-counter residential PV options ($780, $585, $488, $390, $293); non-standard priced from Table A; solar water heaters directed to the department schedule | A separate permit path with its own document structure, not modelled in this pass. |
| Work without a permit | Investigation fee $250 or the permit fee, whichever is greater, capped at $2,500 per day; permit fee at 2× Table A | Enforcement, not a permit fee. |
| Site planning, environmental, subdivision, sign, civil engineering, parklet, miscellaneous | An entire second and third of the document | Different permits from different counters. Out of scope for a building permit page. |

### 4.4 Trade permits — the first read, the correction, and what the pages rest on

**This section was wrong for one release of this jurisdiction, and the correction is worth
recording rather than tidying away.**

The first read of the schedule concluded that Phoenix has no trade mechanism at all: across
all fifty pages there is no electrical, plumbing or mechanical permit fee, and no per-outlet,
per-fixture, per-panel, per-ton or per-circuit rate. Every word of that is true. The
conclusion drawn from it — that a trade page would have nothing behind it but a statement of
absence — was not.

What the first read missed is that the **Building Safety** section publishes four fees that
belong to a trade and to nothing else, scattered between the meter rows and the inspection
fees:

| Published fee | Where | Which trade |
|---|---|---|
| Each additional meter per utility, $98 (the first meter of each type is included in the permit fee) | Building Safety permit fees, item 3 | electric meters → electrical; gas and water meters → plumbing |
| Temporary Power, inspection fee $195 | Building Safety inspection fees, item 4 | electrical |
| Backflow Prevention Devices, $195 for the first and $98 for each one after | Building Safety inspection fees, item 6.c | plumbing |
| Re-inspection Fee for All Construction Permits, $195 each | Building Safety inspection fees, item 1 | both |

And the sentence that makes a trade page more than a list of extras appears **twice** in the
same section, under Temporary Power and under Refrigeration System Periodic Inspections:

> For installation, repair, or replacement work, see Permit Fee Table A.

That is the schedule saying, in terms, that trade installation work is looked up in the same
valuation table as construction. It is what lets an electrical page compute Table A rather than
showing only a meter fee — a page that showed the meter fee and left out the permit that carries
it would state a wrong total, not an incomplete one.

**How the correction was found.** By searching the extracted text for the words a trade fee
would have to contain — `electrical`, `plumbing`, `mechanical`, `outlet`, `fixture`, `circuit`,
`meter`, `minimum` — rather than by reading the section again. The first pass had read the
Building Safety tables for the *valuation* rows, which is what the page needed at the time; the
trade rows sit around them in the same table and were structurally invisible to a reader looking
only for brackets. **The transferable lesson is that "the schedule publishes no X" has to be
established by searching for X, not by not having seen it.**

**What this changed:** Phoenix now publishes three pages instead of one. Mechanical still has
none, and that is now the deliberate, tested omission rather than an accident of reading: the
only mechanical fees in the document are periodic inspection rates for refrigeration systems and
elevators, and a periodic inspection is not a permit. Demolition also has none — it is priced
($195 for a single-family structure) but is one number with no mechanism.

**What is on the trade pages and what is not.** Table A is shared with both trade permit types,
because the schedule routes trade work to it. Each trade then carries its own published fees.
Plan review is deliberately **not** attached: item 1.a scopes itself in its own words to new
construction, additions and remodels of a *building*, and the schedule never says whether a
permit taken out for one trade alone attracts the 100%/80% percentage. The pages say that,
with the building page linked for the project case. The $98 residential water heater minimum and
the $234 pool minimum remain unmodelled, for the reason in section 4.3.

## 5. The engine change Phoenix required

`permit_fee` is a new **basis** (§3 in `CALCULATION_ENGINE.md`). It is the second
capability this project has had to add for a jurisdiction and, like Dallas's exact
rational rates, it was added generically rather than locally.

### 5.1 Why not just scale Table A

Plan review at 80% of the permit fee is, for any single valuation, a second copy of
Table A with every rate multiplied by 0.8. That would have produced identical
numbers and needed no engine change. It was rejected because:

- it duplicates eight numbers (the base and seven band rates) that would have to be
  re-derived by hand every time Phoenix changes a rate, and a drifted copy of a fee
  schedule is the failure this project exists to prevent;
- the 100%-up-to-$50,000 / 80%-above-$50,000 split means the copy is not a clean
  scaling anyway: above $50,000 the fee is `0.8 × Table A(V) + 0.2 × Table A(50000)`,
  which is a marginal table plus a constant that would appear out of nowhere in the
  description;
- the rule would no longer read the way the City writes it.

### 5.2 What was added, and how it is made safe

A `permit_fee` rule reads the sum of the **`base` components computed in the same
run**. Two design decisions make that safe:

1. **Evaluation order is separated from display order.** Base components are
   evaluated first, whatever priorities a jurisdiction assigned; the breakdown is
   then restored to the schedule's own order before it is returned. Priorities can
   therefore not silently zero a plan review fee.
2. **No base fee means no percentage.** The fact is only injected once a non-zero
   base subtotal exists. A `permit_fee` rule that runs with no base fee at all is
   reported as a *missing input* — an excluded component and a warning — rather than
   as a confident 0%, or as its $195 minimum on a fee that has no base.

Both behaviours are covered by `tests/calc/permit-fee-basis.test.ts`, and the
`permit_fee` basis is asserted to be used by exactly the two Phoenix rules and
nothing else.

No migration was needed: a basis lives inside a rule's JSONB `config`, so nothing
in the PostgreSQL schema changed.

## 6. Authority boundary

Phoenix's schedule is the City's. Whether **Maricopa County** issues construction
permits for unincorporated areas, and for which functions, has not been checked
against the county's own site, so no Maricopa County jurisdiction row exists and
nothing on the page describes it. "General knowledge suggests" is not a source.

## 7. Open questions

### 7.1 Does the $98 minimum replace or floor the $195 base? — **OPEN, stated on the page**

Table A's first row prints "$98 Minimum for Residential Water Heaters and Fences"
alongside the "$195 Base fee only" row for the same valuation band. Neither reading
is supported by the document. Not modelled; named on the page. Confirming it needs
the department to answer, or a real permit's fee breakdown.

### 7.2 Is the $234 pool minimum additive to Table A? — **OPEN, same shape as 7.1**

The schedule calls it a "minimum permit fee" and adds a separate $30 surcharge, so
the surcharge is additive and the minimum is ambiguous.

### 7.3 What are the Building Valuation Table's rates? — **OPEN, blocked by tooling**

S3 has no text layer and there is no OCR here. The schedule defines valuation as
square footage × occupancy rate, so those rates decide the fee for anyone who
answers the square-footage question rather than the valuation question. The pages
tell the reader to supply the valuation instead of inferring one.

### 7.4 Does a standalone trade permit exist, and what does it cost? — **OPEN**

See §4.4. The schedule prices no trade permit; whether another document does, or
whether the PDD Online portal produces one from Table A, was not established.

### 7.5 Is plan review charged on every permit over $5,000? — **OPEN, stated on the page**

The schedule scopes its general plan review to permits "where valuation exceeds
$5,000 and **a plan review is required**", and separately prices counter review,
over-the-counter options and expedited routes. Which projects require a plan review
is the department's determination, not something the valuation alone decides. The
worked example therefore states that it assumes a review is required.

## 8. What was built from this

| | |
| --- | --- |
| Rules | 11 rows in `fee_rules` for Phoenix (all active): 3 on the building permit, 4 on each trade permit, with Table A shared across all three permit types |
| Pages | `/arizona/phoenix/building-permit-cost/`, `/arizona/phoenix/electrical-permit-cost/`, `/arizona/phoenix/plumbing-permit-cost/` — all published and indexable; `/arizona/phoenix/` hub published |
| Sources | 3 (`sources`), each with URL, retrieval date and hash; the valuation table carried as unread |
| Verification | 18 ledger rows (17 verified, 1 `needs_review` on the unread table) |
| Engine | a `permit_fee` basis; evaluation order separated from display order; loud exclusion when there is no base fee; a `tiered_marginal` description that states its rounding and says "no charge" instead of "0%"; two per-unit kinds that are not money and not each other (`meters`, `backflow_devices`); a per-unit description that says an allowance is *included* rather than costing $0.00 |
| Checks | Table A's six bounded rows and the City's own $250,500 → $2,512 example, recomputed from PostgreSQL; the $50,000 step verified in both directions; the meter allowance at 1 and 3 meters, and backflow devices at 1 and 3, each checked against the published row and against the wrong reading |

Deliberately **not** built: any mechanical, demolition, solar, pool, water-heater or
site-planning page or rule, and any Maricopa County row. Mechanical and demolition are
both tested as non-resolving routes rather than left to a comment.

Modelling Phoenix changed the engine in one way that protects every other
jurisdiction: the `tiered_marginal` description now states the increment rounding.
Phoenix's fee is a whole $1,000 increment higher than a marginal reading would give
whenever a valuation is not a round thousand, and a page that described the bands
without the rounding would have been wrong by up to $12 per band.
