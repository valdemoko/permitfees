# Scottsdale, Arizona — permit fee research record

Status: **published**. One permit page, seven fee rules, five schedule documents and two
department pages cited, all read from `scottsdaleaz.gov` on **2026-09-24**.

This file exists so a later pass can reproduce this verification without guessing: every
figure on the site traces to one of the documents below, every document has a URL, a hash
and a retrieval method, and every decision to *not* model something is written down with the
reason.

Up: [`index.md`](../index.md) · plan: [`../../ROADMAP.md`](../../ROADMAP.md)

---

## 1. Why Scottsdale, and what happened to Tucson

The coverage plan is two jurisdictions per state. Arizona's first was Phoenix. The second
was meant to be Tucson.

**Tucson was blocked, not skipped.** `tucsonaz.gov` answers 403 to this environment, and the
Internet Archive — the route that worked for Dallas — was unreachable when this jurisdiction
was researched (`web.archive.org` set up connections and never responded; it had answered
earlier the same session for Dallas, so the failure is intermittent rather than permanent).
Two independent paths to Tucson's Development Services fee schedule both failed, so no figure
from Tucson appears anywhere on this site.

Scottsdale was chosen as Arizona's second jurisdiction on the criteria the plan sets out:
significance as a construction market, clarity of the permit mechanism, and *verifiability*.
The last one decided it. Scottsdale publishes its entire fee schedule as separate PDFs per
subject and per year, on a host that answers, with a resolution number and an effective date
on every page — and its mechanism (two areas, no valuation) is genuinely different from
Phoenix's, so the second Arizona jurisdiction also tests the engine rather than repeating it.

**Tucson is not abandoned.** It remains a candidate for a third Arizona jurisdiction when the
archive is reachable or the city's host stops rejecting this environment.

## 2. The mechanism, in one paragraph

Scottsdale does **not** price a permit from valuation. It prices it from area:

```
permit fee  = $237 + $0.94 × (area with A/C) + $0.54 × (covered area without A/C)
plan review =        $0.54 × (area with A/C) + $0.34 × (covered area without A/C)
```

Plan review is a second schedule with its own rates and **no base fee at all**, so reviewing
the plans never adds a second $237. Remodels and tenant improvements keep the full base and
the full covered-area rate, but the area-with-A/C rate is scaled by the percentage printed
beside the row — 30% in every remodel row the City publishes.

## 3. Sources

All fetched from `scottsdaleaz.gov` on **2026-09-24** with `curl -sSL`, read locally with
`pdftotext`, and hashed with `sha256sum`.

### 3.1 Fee documents

| # | Document | URL | Pages | sha256 | Bytes |
|---|---|---|---|---|---|
| S1 | Permit Fee Schedule — **Residential** | `.../fees-fy26-27/permit-fee-schedule---residential.pdf?sfvrsn=3330d226_1` | 2 (pp. 10–11 of 23) | `6f43f6738e12f1258a92cf6c7bc82a4c7c9b27bed94bd612100d9072a8d9cb08` | 123,060 |
| S2 | Permit Fee Schedule — **Commercial** | `.../fees-fy26-27/permit-fee-schedule---commercial.pdf?sfvrsn=913d3970_1` | 2 (pp. 8–9 of 23) | `e6910aecc536134b6ec6d04266381bfbd5f328f35c297645d0a214b8ac4594e4` | 110,675 |
| S3 | Plan Review Fee Schedule — **Residential** | `.../fees-fy26-27/plan-review-fee-schedule---residential.pdf?sfvrsn=6e283610_1` | 1 (p. 5 of 23) | `b952eed35cff264a6a607b110a57b650c79cef9f6ebf13518ad320d4b5a4939d` | 104,226 |
| S4 | Plan Review Fee Schedule — **Commercial** | `.../fees-fy26-27/plan-review-fee-schedule---commercial.pdf?sfvrsn=111251c6_1` | 1 (p. 4 of 23) | `6ac4debe2a812e27004e1bee5672a1db8fc5083544ab098fdddb77e340a37918` | 103,989 |
| S5 | Permit Fee Schedule — **Miscellaneous** | `.../fees-fy26-27/permit-fee-schedule---miscellaneous.pdf?sfvrsn=bcebac04_1` | 2 (pp. 12–13 of 23) | `489d15a21aa3713a4aaca378c771db79398d51fa0d4c45fedef66b688c98da57` | 126,332 |

The common prefix is
`https://www.scottsdaleaz.gov/docs/default-source/scottsdaleaz/planning---develpment`.

The `?sfvrsn=` query string is kept verbatim. The City's CMS serves these documents through
Sitefinity, and stripping the parameter is not guaranteed to resolve.

### 3.2 Web pages

| # | Page | URL | Verified | City's own "Last Updated" |
|---|---|---|---|---|
| S6 | Fees (Planning & Development) | `https://www.scottsdaleaz.gov/planning-development/fees` | 2026-09-24 | 2026-07-02 |
| S7 | One Stop Shop | `https://www.scottsdaleaz.gov/planning-development/one-stop-shop` | 2026-09-24 | 2026-08-13 |

### 3.3 Effective date and authority

Every page of all four FY 26/27 schedules carries the same footer:

```
Effective July 1, 2026                    Resolution No. 13661
```

The fee page states it in the same words on the web: `FY 26/27 - Effective July 1, 2026`.
**Effective from: 2026-07-01.** No end date is published.

### 3.4 Documents found and NOT used

* **`eservices.scottsdaleaz.gov/bldgresources/PermitFee`** — the City's own "Permit Fee
  Calculator Quick Reference: Calculates Building Permits Fees Only", linked from S6. It
  answered **403** to this environment. **No figure was taken from it**, and it is recorded
  as unread rather than treated as agreeing with the PDFs. It is the single most useful
  document to read in a later pass: an official calculator is direct evidence about how the
  City itself composes the fee.
* **Permit Fee Schedule — Right-of-Way Improvements** (2 pp., sha256
  `174225c8ebace3a3bcf0d8651f9a8276343c89b043a0a5e519c7ed7cf70b297b`). Downloaded, not cited:
  right-of-way work is not a building permit.
* **Plan Review Fee Schedule — Miscellaneous** (1 p., sha256
  `045c7ec5b4f1968e…`). Downloaded and read; its content is hourly review rates and plat fees,
  all of which are listed on the page as *not included* rather than modelled. It is described
  in section 8.

## 4. Reading method, and the trap in this document

`pdftotext -layout` **produces wrong pairings on these files.** Each schedule is a two-column
layout — labels in one column, amounts in another — and the columns do not share a baseline,
so the layout pass attaches an amount to the wrong row.

Concretely: on S1, `-layout` shows the `$0.94 sq. ft.` amount on the line below the one it
belongs to and pairs `Certificate of Occupancy` with the base fee. Read that way the whole
schedule is wrong, and wrong in a way that still looks like a fee schedule.

The pairing that was used instead:

```bash
pdftotext -table permit-fee-schedule---residential.pdf -   # pairs each label with its amount
pdftotext -raw   permit-fee-schedule---residential.pdf -   # content-stream order, to confirm
pdftotext -layout permit-fee-schedule---residential.pdf -  # only to see that the mismatch is
                                                          # a layout artefact
```

`-table` is optimised for exactly this shape and produces one label and one amount per line.
Its output is quoted in section 5 and is the basis of every rate shipped.

**This is worth generalising:** the reader that produces the prettiest output is not
necessarily the reader that preserves row identity. Dallas needed `-layout`; Scottsdale is
broken by it. Every jurisdiction from here is read at least two ways.

## 5. What was transcribed

### 5.1 Permit fee (S1 residential, S2 commercial) — identical rates

`pdftotext -table` output, quoted:

```
Single Family Custom                          (S1)        Commercial Building Permit            (S2)
  Base fee                                   $237          Base fee                          $237
  Livable area with A/C              $0.94 sq. ft.          Area with A/C            $0.94 sq. ft.
  Covered area (non A/C)             $0.54 sq. ft.          Covered area (non A/C)   $0.54 sq. ft.
  Certificate of Occupancy                   $195          Certificate of Occupancy          $195
  GIS fee                                    $379          GIS fee                           $379
  Lowest Floor Certificate Review            $363          Lowest Floor Certificate Review   $363

Single Family Addition                        (S1)        Commercial Addition                   (S2)
  Base fee / Livable area with A/C / Covered area (non A/C)  — the same three rates
```

The labels differ (`Livable area with A/C` vs `Area with A/C`) and the figures do not. **This
is why no rule in this jurisdiction carries an occupancy condition.**

### 5.2 The remodels and tenant improvements — 30%

| Row | Schedule | Base | Area with A/C | Covered (non A/C) |
|---|---|---|---|---|
| Single Family Remodel | S1 | $237 | **$0.94 × 30%** | $0.54 |
| Single Family Remodel with Roof Modification | S1 | $237 | $0.94 × 70% | $0.54 |
| Commercial Remodel (Existing) | S2 | $237 | $0.94 × 30% | $0.54 |
| Commercial T.I. (New) & Multi-Family Build Out | S2 | $237 | $0.94 × 30% | $0.54 |
| Commercial Vanilla Shell T.I. | S2 | $237 | $0.94 × 30% | $0.54 |
| Shell Only for Commercial & Multi-Family | S2 | $237 | $0.94 × 95% | $0.54 |
| Foundation Only | S2 | $237 | $0.94 × 25% *(as "Foundation")* | — |

Four of the seven rows are 30%, in both schedules, with an unchanged base and an unscaled
covered rate. That is the rule this site models, and the reason the remodel can be modelled
at all without an occupancy condition.

### 5.3 Plan review (S3 residential, S4 commercial) — no base fee anywhere

```
Single Family Custom Homes      Livable area with A/C  $0.54 sq. ft.   Covered area (non A/C)  $0.34 sq. ft.
Single Family Addition          $0.54                  $0.34
Single Family Remodel           $0.54 sq. ft. x 30%    (no covered-area line)
Commercial                      $0.54                  $0.34
Commercial Addition             $0.54                  $0.34
Apartments/Condos               $0.54                  $0.34
Commercial Remodel / T.I.       $0.54 sq. ft. x 30%    (no covered-area line)
Shell Only                      $0.54 sq. ft. x 95%    $0.34
Foundation Only                 $0.54 sq. ft. x 25% + $270
```

Two facts taken from this table, both of them structural rather than numeric:

1. **There is no base fee in plan review.** Not on any row, on either schedule. The $237 is
   charged once per permit and never again for the review. This is the opposite of Phoenix,
   where plan review *is* a percentage of the permit fee, and of Houston, where it is its own
   per-$1,000 rate.
2. **The remodel rows price the conditioned area only.** No covered-area line appears under
   either remodel row. So a remodel is reviewed on its area with A/C and nothing else — which
   is modelled as scope, not as a rule that happens to be missing.

### 5.4 Rates that are not whole cents, and how they are stored

`$0.94 × 30% = $0.282` and `$0.54 × 30% = $0.162`. Neither is a whole number of cents, and
neither is a whole number of basis points of anything. Both ship as exact fractions —
`{ numerator: 282, denominator: 10 }` and `{ numerator: 162, denominator: 10 }` cents per
square foot — through the primitive Dallas required (§13.1 of `CALCULATION_ENGINE.md`). No
new engine capability was needed for them.

### 5.5 The Miscellaneous permit schedule, in full

The third of the four permit schedules, and the one the two trade pages are built on. Its
entries, verbatim, because the reasoning in section 9.1 depends on which of them exist:

```
Active Permits Records Change - Residential                     $121
Active Permits Records Change - Commercial                      $195
Administrative Site Review Fee                  20% of sq. ft. / ln. ft. fee
Annual Facilities Permit (pro-rated by quarter)   $5,349 / $4,092 / $2,677 / $1,410
Building Permit Extension Request                               $379
Certificate of Occupancy (visual inspection only)               $195
Change of Occupant Permit                                       $195
Demolition Permits                                              $379
Demolition Permit - Pool                                        $121
Industrial Racking Permit                                       $379
Minimum Permit (one discipline)                                 $121
Minimum Combination (all disciplines)                           $379
Native Plant Permit                        $37 + $1/plant + $237 base
Native Plant Relocation Methodology                              $63
Off Hours Civil Inspections                                     $379
Off Hours Building Inspections                                  $379
On Site Grading                                                 $121
Pools & Spas Attached        $0.61 sq. ft. + Planning Insp. Fee ($195) + Base Fee ($237)
Stand Alone Spas                                       $142 + Planning Insp. Fee + Base Fee
Refuse - Single Enclosure                                       $305
Refuse - Double Enclosure                                       $410
Reinspection                                                    $121
Solar Residential                                               $168
Solar Commercial                                                $331
Solar Water Heaters                                              $90
Temporary Power Pole                                            $121
Water Heaters (except solar)                                     $63
Signs                        base $237 once per application, then $26 / $168 / $268 / $363 per sign
```

Four things follow from reading it as a whole rather than as a list:

1. **Nothing in it is mechanical.** That is the whole of the evidence for mechanical having no
   page.
2. **The two minimums are the only rows phrased as floors.** Every other row is a price.
3. **The solar rows split by what the work is, not by who does it.** Residential solar is $168
   and commercial $331; a solar *water heater* is $90. The $168 rule and the $331 rule therefore
   carry the electrified/thermal distinction, and the $331 is not modelled so a commercial job
   cannot silently pick up the residential figure.
4. **The water heater row carves solar out of itself** — "except solar" — which is why the $63
   and the $90 are separate rules rather than one rule with a condition. The City wrote the
   carve-out; the model reproduces it instead of re-deriving it.

## 6. What was modelled

Fifteen rules, all `active`, all effective `2026-07-01`: seven on the building permit, four on
**each** trade permit.

### 6.1 The building permit

| Code | Component | Basis | Rate | Scope |
|---|---|---|---|---|
| `PERMIT-BASE` | permit | — | $237 flat | new construction, addition, remodel |
| `PERMIT-AC-AREA` | permit | area with A/C | $0.94/sq ft | new construction, addition |
| `PERMIT-AC-REMODEL` | permit | area with A/C | $0.282/sq ft | remodel |
| `PERMIT-COVERED-AREA` | permit | covered area | $0.54/sq ft | new construction, addition, remodel |
| `REVIEW-AC-AREA` | plan review | area with A/C | $0.54/sq ft | new construction, addition |
| `REVIEW-AC-REMODEL` | plan review | area with A/C | $0.162/sq ft | remodel |
| `REVIEW-COVERED-AREA` | plan review | covered area | $0.34/sq ft | new construction, addition |

Total for the published example — a 2,500 sq ft new home with 400 sq ft of covered patio:
$237 + $2,350 + $216 + $1,350 + $136 = **$4,289.00**.

### 6.2 The trade permits

| Code | Permit type | Fee | Applies when |
|---|---|---|---|
| `TEMPORARY-POWER-POLE` | electrical | $121 flat | a temporary power pole is selected |
| `SOLAR-RESIDENTIAL` | electrical | $168 flat | a residential solar system is selected |
| `WATER-HEATER` | plumbing | $63 flat | a water heater is selected |
| `SOLAR-WATER-HEATER` | plumbing | $90 flat | a solar water heater is selected |
| `TRADE-MINIMUM-ONE-DISCIPLINE` | both | $121 flat | no item from the schedule is selected |
| `REINSPECTION` | both | $121 flat | a re-inspection is selected |

Worked examples: a temporary power pole permit, **$121.00**; a water heater permit, **$63.00**.
Both are a single published fee, because that is what the City publishes for each — the schedule
lists them as separate permit fees and no combination of them is published anywhere.

The mutual exclusion is the load-bearing part of the model. `custom.schedule_item` is a fact
whose value names which line of the Miscellaneous schedule applies, and the six rules are
conditioned so that exactly one of the five price rules can fire: the item rules match a value,
and the minimum rule matches the **absence** of one. A project that selects nothing gets the
published minimum; a project that selects a water heater gets the published water heater fee and
`TRADE-MINIMUM-ONE-DISCIPLINE` is reported as *excluded* rather than added.

## 7. The bug this jurisdiction produced, and the guards that now catch it

While the rules were being written, four of them were given a helper that defaulted the
engine basis to `square_footage`. The two covered-area rules therefore read the area with
A/C. Everything about them looked right: they validated, they were scoped correctly, the
`$0.54` and `$0.34` rates were the published ones, and a 2,500 sq ft house with a 400 sq ft
patio produced a total that was plausible and **$1,350 too high**.

Nothing in the type system could have caught it — `square_footage` and
`covered_square_footage` are both square feet — and nothing in the database could have
either, because a rule's `config` is JSONB.

It was caught by a test written *before* the code was trusted, asserting which basis each
rule reads rather than what the total comes to:

* `tests/content/scottsdale-seed.test.ts` — `reads no valuation anywhere` asserts the exact
  set of bases used; `does not charge the covered rate on the area with A/C` asserts that
  the covered component is *absent* when no covered area is entered.
* `tests/integration/scottsdale-database.test.ts` — `stores the two areas as two distinct
  bases` reads the bases back out of PostgreSQL and asserts that both rules whose basis is
  the covered area address `custom.covered_square_footage` in their conditions.

The helper now takes the basis as a required argument. The two guards are kept anyway: the
argument can still be passed wrongly, and a schema cannot express this invariant.

## 8. Named on the site, deliberately not modelled

Published in the same Exhibit A, listed in full on the jurisdiction page and the permit page,
and **not** in any calculation. None is estimated.

* **Scaled area rows**: roof-modification remodel 70%, shell only 95%, foundation only 25%,
  addition under 500 sq ft. Each is a separate row with its own base treatment.
* **The $379 combination minimum** (S5). Its $121 sibling *is* modelled on the trade pages — see
  section 9.1 — but the combination minimum is not, because it is a floor on the permit that
  covers every discipline, which is the building permit, whose fee is published in full in
  another schedule. A floor shown beside a computed figure is an invitation to add them.
* **Whether either minimum floors the $237 base on a building permit.** The schedule does not
  say, so the *building* page leaves both out. **This is the same call made for Phoenix's $98
  water-heater and $234 pool minimums, for the same reason** — charging both would double-count
  and charging either alone would be a guess.
* **Fees charged alongside**: certificate of occupancy $195, certificate of shell $195, GIS
  fee $379, lowest floor certificate review $363 (and $363 for the special-flood-hazard case),
  standard-plan administrative site review at 15% of the square-footage fee, plan review
  extension request $379, permit extension request $379, re-inspection $121, off-hours
  inspections $379.
* **Pools, spas, fences and walls**: attached pools and spas at $0.61/sq ft plus a $195
  planning inspection fee plus the $237 base, stand-alone spas $142, fence walls $0.27/ln ft
  and retaining walls $2.49/ln ft behind a $237 base, both with plan review at $0.18/ln ft.
* **Signs**: $26 / $168 / $268 / $363 per sign by size band behind a $237 base charged *once
  per application, not per sign*.
* **Trade work**: water heaters $63, solar water heaters $90, solar residential $168,
  temporary power pole $121 and the $121 one-discipline minimum **are modelled on the two trade
  pages**, as is the $121 re-inspection. Still unmodelled: **solar commercial $331**, which is
  named on the electrical page rather than offered as an option so that a commercial job cannot
  pick up the residential figure; **demolition $379** and **pool demolition $121**, which are
  priced but are one number each with no mechanism.
* **Hourly and review services** (S3, S5): every miscellaneous or revision review at $121 an
  hour, engineering review per sheet at $1,057 and $363, additional elevations $121 each,
  review after the third review at 50% of the original fee, and the green compliance review
  at $0.10/sq ft capped at $600, and the $270 add factor on foundation-only plan review.
* **Other City schedules** listed on S6: application fees, right-of-way annual fees,
  customized expedited plan review, in-lieu parking, records, stormwater management.

## 9. Which permits got pages, and which did not

**Published:** `building-permit-cost`, `electrical-permit-cost`, `plumbing-permit-cost` — three
pages, worked examples of $4,289.00, $121.00 and $63.00, six FAQs each.

**Not published, with the reason:**

| Permit | Why not |
|---|---|
| Mechanical | Issued. **Nothing in the Miscellaneous schedule is mechanical** — no furnace, no air conditioner, no refrigeration row — and the permit schedules price construction by area. A page would carry the area rates plus a statement of absence, which is exactly the thin page this project refuses to publish. |
| Demolition | **Priced and verified**: $379, or $121 for a pool. But it is one flat number and one exception, with no plan review fee published for it and nothing else the City says about it. One number is not a page. |

### 9.1 Why electrical and plumbing do get pages, when they have no rate either

This is the decision worth recording, because the first release of this jurisdiction got it
wrong in the opposite direction and the correction is instructive.

The first read concluded that because Exhibit A publishes no electrical rate and no plumbing
rate, neither trade could have a page — the same reasoning applied to Phoenix at the time. What
that read under-weighted is the rest of the Miscellaneous permit schedule, which prices a short
list of **items**, and those items belong to trades:

| Published flat fee | Electrical | Plumbing |
|---|---|---|
| Water heater (except solar), $63 | | ✔ |
| Solar water heater, $90 | | ✔ |
| Residential solar, $168 | ✔ | |
| Temporary power pole, $121 | ✔ | |
| Re-inspection, $121 | ✔ | ✔ |
| Minimum permit, one discipline, $121 | ✔ | ✔ |

Those are real published fees with real numbers behind them, and a page that computes them
answers the question a reader actually arrived with. What makes them a *page* rather than a
stub is the second half of the answer, which the same schedule supplies: electrical and plumbing
work on a building project is not priced by trade at all, it is inside the permit that the area
rates price. A page can therefore say something specific and true about both cases, and link to
the building page for the second.

**The one-discipline minimum is where the care went.** S5 publishes both a minimum for a permit
covering one discipline and flat fees for individual items, and never says the minimum floors
them. Two rules that both fired would charge **$184 for a water heater permit the City prices at
$63**, which is precisely the class of invention this project exists to avoid. So every trade
rule is conditioned on `custom.schedule_item`, they are alternatives rather than a sum, and the
loser of each pair is reported as *excluded* rather than silently dropped — `npm run db:verify`
asserts both halves: the $63 is charged, and `TRADE-MINIMUM-ONE-DISCIPLINE` is excluded with
`conditions_not_met`.

The $379 combination minimum is deliberately not computed, and the reason is not the same as the
$121 one. It is a floor on the permit covering **every** discipline, which is the building
permit, whose fee is published in full in another schedule and is already computed on the
building page. Presenting a floor beside a computed figure invites a reader to add them; it is
named on the pages instead.

**What the trade pages do not carry.** The area rates. A stand-alone trade permit is not priced
by the schedules that price construction, and every Scottsdale trade rule is a flat published
fee — asserted in `npm run db:verify` as a count (8 rules, 0 of them rates), because a rate
appearing there silently would be this site making a claim the City never made. Plan review is
absent for a simpler reason: the review schedules price reviews of buildings, and the schedule
does not price the review of a stand-alone trade permit.

## 10. Open questions, unresolved

1. **Does the $237 base fee apply to a stand-alone trade permit?** The minimums ($121 / $379)
   suggest a permit can exist without the $237 base, but S5 does not say. Unresolved, and
   nothing on the site depends on it: the trade pages charge only published flat fees and never
   the base.
2. **What does the City's own calculator do?** It answered 403. It is the single document most
   likely to settle question 1, and it would confirm the remodel percentages. Named as unread in
   every place it matters.
3. **Does a plan review fee ever apply without a permit fee?** The review schedule prices
   reviews for fences, retaining walls, solar and pools, some of which are stand-alone
   permits. Not modelled, not described as resolved.
4. **Is the low-rise `<500 sq ft` addition row a different rate or the same rate with a
   different set of extras?** The S1 row lists the same $0.94 and $0.54 with no percentage,
   which reads as the same rates and fewer extras, but the layout makes the row's extent
   ambiguous and it is not modelled.
5. **Maricopa County.** Whether the county issues construction permits for unincorporated
   areas, and for which functions, has not been verified against the county's own site. It is
   therefore described nowhere, on this or on the Phoenix pages.
6. **The sitefinity document URLs carry a version parameter.** If the City republishes a
   schedule under the same filename, `?sfvrsn=` changes and the recorded URL may not resolve
   to the byte-identical file. The hashes are the durable identifier; a later pass should
   compare bytes, not URLs.

## 11. Verification performed

| Check | Result |
|---|---|
| `npm run db:migrate` | No migration needed for either release: a second area and a flat trade fee are both JSONB values, not columns. |
| `npm run db:seed` | 15 rules, 7 sources, 2 schedules, 8 permit-type links, 1 page, 17 ledger rows. Then 8 more rules, 4 more permit-type links, 2 more pages and 10 more ledger rows for the trades. Run twice; the second run changed nothing. |
| `npm run db:verify` | All checks pass, including the two-area example ($4,289.00), the remodel ($985.80), the no-covered-area case, the basis counts read back out of PostgreSQL, and both trade pages — including the assertion that the one-discipline minimum is *excluded* rather than added to the $63 water heater fee. |
| `npm run typecheck` | Clean. |
| `npx vitest run` | 404 tests over 27 files, all passing (16 of them this jurisdiction's integration suite, 27 its content suite). |
| `npm run build` | Clean; the hub and all three permit routes in the route table. |
| sitemap | All four Scottsdale URLs present; mechanical and demolition absent. |
| HTTP, production build | Hub and all three permit URLs 200 with `index, follow` and a self-referencing canonical, one `h1`, and `WebPage` + `BreadcrumbList` + `FAQPage` structured data; mechanical and demolition 404. |

**A note on the build cache, because it cost a false negative here.** The sitemap is
prerendered with `revalidate = 3600`, and a rebuild in this workspace reused Next's on-disk
fetch cache from an *earlier* build. The first verification of this release therefore read a
sitemap that did not contain Scottsdale at all, while `npm run db:verify` — which queries the
database directly — did. `rm -rf .next` and a rebuild produced the correct file. A stale local
cache is not a deploy-time risk, since a platform builds from a clean checkout, but it is a
trap for anyone verifying a sitemap by hand here, and it is why the verification steps in this
file say "clean build".

## 12. Internal summary — Arizona

**State:** Arizona (`AZ`, FIPS 04) — **activated on the map**: two published jurisdictions.

| | |
|---|---|
| Jurisdictions researched | Phoenix, Scottsdale, Tucson (blocked) |
| Published | Phoenix (building, electrical, plumbing), Scottsdale (building, electrical, plumbing) |
| Blocked / not published | Tucson — `tucsonaz.gov` 403 and `web.archive.org` unreachable; no figures held |
| Sources cited | 7 for Scottsdale (5 schedule PDFs, 2 department pages); 3 for Phoenix |
| Fee rules | Phoenix 11 (3 building + 4 electrical + 4 plumbing, Table A shared), Scottsdale 15 (7 + 4 + 4) |
| Pages | six: `building-permit-cost`, `electrical-permit-cost` and `plumbing-permit-cost` under each city |
| Tests | 60 for Arizona across four files (content and integration for each city) |
| Map state | Arizona available (≥1 publishable jurisdiction); Arizona hub links both cities |

Both Arizona cities turned out **not** to price their trades per item: there is no outlet,
fixture, circuit or trade-count rate in either schedule. What each city does publish is a short
list of flat fees for specific trade items, and those are what the four trade pages compute —
Phoenix's meters, temporary power, backflow devices and re-inspections against its valuation
table, and Scottsdale's water heaters, solar, temporary power pole and one-discipline minimum.
Neither city got a mechanical page, and for once the reason is identical in both: neither
publishes a mechanical fee.

**The correction this state carries.** Both cities' first releases concluded, from the absence
of a trade *rate*, that a trade *page* was impossible. That was wrong, and it was wrong in a way
worth repeating: the absence had been established by not having seen a rate, rather than by
searching the document for the words a rate would contain. Phoenix's electrical and plumbing
fees — meters, temporary power, backflow devices — were sitting in the same Building Safety
section the first pass had read for its valuation brackets. Both research files now record the
correction, and the pages say plainly what is and is not published rather than implying a fee
exists where the City has none.
