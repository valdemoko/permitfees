# Madison, Wisconsin — research record

**Status: published** (Wisconsin, pass 11). Three permit pages: building, electrical and
plumbing.

- **Verification date:** 2026-09-25
- **Issuing authority:** City of Madison, Building Inspection (Development Services Center),
  215 Martin Luther King Jr. Blvd. Suite 017, Madison, WI 53703, (608) 266-4551,
  binspection@cityofmadison.com, Monday to Friday 7:30 a.m. to 4:30 p.m., permit counter by
  appointment only.
- **Enabling law:** Madison's instrument is the **Madison General Ordinances**, and the fee
  schedule lives in three of its chapters at once: **MGO 29.09** (Building Code),
  **MGO 18.09** (Plumbing Code) and **MGO 19.11** (Electrical Code). Each chapter was
  repealed and recreated together by ORD-21-00024, ORD-21-00025 and ORD-21-00026 — all
  passed 2021-03-16, effective **2021-03-27**. The City acts for the State where the codes
  say so: MGO 18.07(1)(d) has the Building Inspection Division sit "[a]s an agent
  municipality" and examine the plumbing plans it lists, sending the rest to the Wisconsin
  Department of Safety and Professional Services. Wisconsin's own part of a Madison permit is
  not a permit fee at all — it is the DSPS State Seal fee and the plan-review and
  examination tables in SPS 302, and the trade licences (Wis. Stat. ch. 145 for plumbing,
  cited by MGO 18.06 itself).

| Document | Where |
| --- | --- |
| Building Inspection Fees — the division's own page (the schedule a filer reads) | `https://www.cityofmadison.com/development-services-center/fees/building-inspection-fees` |
| MGO Ch. 29 "Building Code", repealed and recreated, ORD-21-00024, eff. 2021-03-27 — §29.09 Fee Schedule | `https://mcclibraryfunctions.azurewebsites.us/api/ordinanceDownload/50000/1074843/pdf` |
| MGO Ch. 18 "Plumbing Code", repealed and recreated, ORD-21-00025, eff. 2021-03-27 — §18.09 Plumbing Permit Fee Schedule | `https://mcclibraryfunctions.azurewebsites.us/api/ordinanceDownload/50000/1074844/pdf` |
| MGO Ch. 19 "Electrical Code", repealed and recreated, ORD-21-00026, eff. 2021-03-27 — §19.11 Electric Permit Fee Schedule | `https://mcclibraryfunctions.azurewebsites.us/api/ordinanceDownload/50000/1074846/pdf` |
| Permits — "Do I need a permit?" chart | `https://www.cityofmadison.com/development-services-center/permits` |
| 1 & 2 Family Residential — who may apply for a permit | `https://www.cityofmadison.com/development-services-center/1-2-family-residential` |
| Building Inspection — contact record | `https://www.cityofmadison.com/dpced/building-inspection/contact` |

All seven were read on 2026-09-25 and are recorded as `sources` in the seed payload.
`cityofmadison.com` is reachable from this environment **directly**; the three ordinance PDFs
come from Madison's legislative document library (`mcclibraryfunctions.azurewebsites.us`),
which serves the enacted file with its cover sheet, fiscal note and full body.

Two things about the corpus are worth saying before any number:

1. **The enacted ordinance and the division's web page are not the same document.** They
   agree on every group rate except one row (see §6). The page is the schedule a filer is
   shown; the ordinance is the instrument that fixes the fee. Where they differ this
   publication charges the ordinance and names the page's figure beside it — the same rule
   the New Jersey pass used when a city printed an older State amount.
2. **`docs.legis.wisconsin.gov` returns HTTP 000 from this environment** — the same block
   that stopped Idaho. The State's SPS fee tables are therefore *named* on the pages and
   *not* transcribed: an unread table is not a table.

## 1. What the mechanism is

**Madison prices a permit from the use group of the building, and the three trades are three
separate schedules that happen to share one set of group definitions.**

The City's fee page prints the whole thing as one table with four columns and a `Total`
column; the ordinances show where each column comes from — one chapter apiece:

| Row | Building (MGO 29.09) | Electrical (MGO 19.11) | Plumbing (MGO 18.09) |
| --- | --- | --- | --- |
| **Group I** — new residential and R-2/R-3/R-4 | `$.10` per sq ft | `$.09` per sq ft | `$.09` per sq ft |
| **Group II** — new commercial non-residential | `$.18` per sq ft | `$.11` per sq ft | `$.10` per sq ft |
| **Group III** — new industrial | `$.12` per sq ft | `$.06` per sq ft | `$.06` per sq ft |
| **Minimum fee** (every row) | `$25.00` | `$25.00` | `$25.00` |
| **Group IV** — alterations and repairs to existing structures | `$11.00` for each `$1,000` value or fraction thereof, minimum `$25.00` | `$25.00` first ten openings, `$1.00` each additional opening; `$50.00` per service panel for an electric service replacement | `$8.00` per fixture, minimum `$25.00` |

Four things make this schedule its own shape rather than a transcription of another city's:

- **The same measurement, three times.** A new building's *building*, *electrical* and
  *plumbing* permits are each priced from the building's square footage — not from devices,
  fixtures or a contract value. A 2,400 sq ft house in Group I is `$240.00`, `$216.00` and
  `$216.00` for the three permits. The City's page adds a `Total` column (`.37`, `.51`,
  `.30` per sq ft) which is the sum of the four columns including HVAC.
- **The group definitions are occupancy classes, not building types.** Group I is "all single
  or two family residential buildings *and* all commercial building space classified as R-2,
  R-3 or R4"; Group II is A-1…A-5, B, E, H-1…H-5, I-1…I-4, M and R-1; Group III is F-1, F-2,
  S-1, S-2, U and anything not in Groups I, II and IV. A hotel is Group II, an apartment
  building is Group I, a warehouse is Group III — which is why no `occupancy` fact can derive
  the group and `custom.fee_group` exists.
- **Square footage has a published definition.** The City: "the total square footage of the
  building including all floor levels, attached garages, porches, balconies and decks".
  MGO 29.09(2)(b): "floor area measurements shall be taken from outside of building at each
  floor level, including basement".
- **Two reductions and one cap are written into the schedule.** A permit for a property
  where *only the shell* is completed, and a permit for *interior* work in a shell already
  permitted, are each charged at **50% of the total fee for that fee group** — in all three
  chapters. MGO 29.09(2)(c) caps alterations: "In no case shall the fee exceed those as
  calculated for new buildings as listed in Section 29.09(3)(a), MGO, Groups I, II and III."

**The second mechanism sits on top: plan review.** MGO 29.09(3)(b) and the City's page print
the same table — "Round up all fees to the next highest dollar":

| Project type | Fee |
| --- | --- |
| Commercial building, new | `$.04` per sq ft, minimum `$100.00` |
| Commercial building, alterations and remodeling | `$.04` per sq ft, minimum `$100.00` |
| HVAC commercial building new / alterations | `$.03` per sq ft, minimum `$100.00` |
| New single family or two family residential buildings | `$100.00` |
| Alteration or remodel of single family or two family residential buildings | `$25.00` |
| Structural review of building elements | `$50.00` per element (free if the elements come in with the plans) |
| Fire escape / stadium seating / miscellaneous / revisions to examined plans | `$100.00`, `$0.05` per seat (min `$100`), `$100.00`, `$100.00` |

…and the City's page then adds two charges the ordinance also names: **the State Seal fee as
charged by DSPS**, and **"plan review fees as prescribed by SPS 3031(1)(g) in Table
3031-3"** — a citation the page prints corrupted. The ordinance prints it correctly:
**"SPS 302.31(1)(g) in Table 302.31-3"**. Chapter 18 sends plumbing plan examination
elsewhere again: **"the plan examination fee shall be determined using the fee schedule found
in SPS 302.64, Table 302.64-1"**. Neither State table is reachable from this environment.

**The third charge is the zoning review fee.** The City's page: "Madison General Ordinance
28.206 requires a review fee of $0.03 /sq. ft. be collected at the time the building permit
is issued. Minimum fee of $25.00."

**And the penalty, which every one of the three chapters prints identically:** "Penalty for
failure to obtain a permit before starting work shall be **double the fees**… in addition, a
penalty of one hundred dollars ($100) shall be assessed for each day that any work requiring
a permit progresses without a permit".

## 2. What is modelled

- **Building:** the three group rates as a published lookup over `custom.fee_group`, each
  with the `$25.00` floor; the same table at **50%** for a shell-only or interior-only
  permit; Group IV's `$11.00 per $1,000 or fraction` with its `$25.00` floor; plan review at
  `$100.00` / `$25.00` for one- and two-family work and `$.04` per sq ft (minimum `$100.00`)
  for everything else; and the MGO 28.206 zoning review fee at `$.03` per sq ft, minimum
  `$25.00`.
- **Electrical:** the three group rates with the `$25.00` floor and the 50% reduction;
  Group IV's `$25.00` for the first ten openings plus `$1.00` each additional one, where an
  *opening* is the ordinance's own definition — "switches, convenience outlets, fixtures, and
  fixed appliance connections"; and `$50.00` per service panel for an electric service
  replacement.
- **Plumbing:** the three group rates with the `$25.00` floor and the 50% reduction; Group
  IV's `$8.00` per fixture with its `$25.00` floor and the ordinance's fixture-counting note
  (a two-bowl laundry tray or multi-bowl bar sink is *one* fixture, and so is each replacement
  of a fixture, each water heater or softener, each capped opening left for a future fixture,
  and each altered building sewer, drain, soil, waste or vent run).

## 3. Design decisions worth recording

- **`custom.fee_group` is a custom fact rather than a derivation from `occupancy`.** The
  groups cross occupancy: Group I holds houses *and* apartments, Group II holds hotels. No
  pairing of `occupancy` and `work_type` reproduces them, so the reader states the group and
  the schedule reads it. The three columns are one `rateTables` rule each rather than three
  rules, because the table *is* the published structure and the breakdown then shows the
  group that was selected.
- **The 50% shell/interior reduction is a second rule with `rateMultiplier: 1/2`, not a
  second table.** The reduction multiplies whatever group applies, so it is a multiplier on
  the same published table rather than six more rows. Both rules carry the `$25.00` minimum,
  because the schedule states the minimum beside the group rate rather than beside the
  reduction — half of a small Group I permit still floors at `$25.00`.
- **The new-work and existing-work regimes are separated by one fact.** A permit with
  `custom.fee_group` is new construction or an addition and prices from area; a permit
  without it, whose `work_type` is an alteration, remodel, repair or replacement, prices from
  Group IV. Making `fee_group` the switch keeps the two regimes from ever both firing on the
  same calculation, and it is the same switch the schedule uses ("new construction and any
  additions" against "all alterations and repairs to existing structures").
- **The service-panel row keys on `custom.panels` — the count of panels replaced or
  relocated — not on a separate boolean.** `per_unit` with `unit: "panels"` reads that fact,
  so a calculation that gives a count is a service replacement and pays `$50.00` a panel,
  while one that gives none does not touch the service and never carries the row. Two flags
  for one fee ("is it a replacement?" plus "how many?") invite a calculation that answers
  them inconsistently; a count answers both.
- **Plan review keys on `custom.single_or_two_family` and not on `occupancy`.** The flat
  `$100.00` and `$25.00` rows say "single family or two family residential buildings", and a
  twelve-unit apartment building is neither — it takes `$.04` per sq ft. Absent the flag, the
  rules charge the commercial rate, which is the conservative reading of an ambiguous input.
- **The zoning review fee is charged against building square footage.** MGO 28.206 as the
  City's page states it does not name the area it measures. Square footage is the only area
  this site collects, it is the area the schedule's other per-square-foot rows use, and the
  assumption is stated in the rule description rather than left in the code.
- **The application's arithmetic is rounded to the cent, not up to the dollar.** Both the
  ordinance tables and the plan-review table say "Round up all fees to the next highest
  dollar". The engine rounds a component once, to the cent (see `assumptions` in every
  result), and there is no primitive that rounds a computed fee to a whole dollar. The
  difference is always less than one dollar per fee and the pages say so.
- **The group rates are stored as cents per square foot.** A `currency_per_unit` exact rate
  in this engine is *cents* per unit of the basis — `formatUnitRate` divides the numerator by
  100 to print dollars — so the schedule's `$.10` is `{ numerator: 10, denominator: 1 }`.
  Storing the published figure as a fraction of a dollar (`{ 1, 10 }`) charges a tenth of a
  cent a square foot, which drops below the `$25.00` minimum on every permit and yields a
  plausible-looking wrong number rather than an error.

## 4. What is NOT modelled

- **The State's money.** The **DSPS State Seal fee** and the **SPS 302.31(1)(g) / Table
  302.31-3 plan review fee** are collected by the division on top of every plan review, and
  **plumbing plan examination is set by SPS 302.64, Table 302.64-1**. `docs.legis.wisconsin.gov`
  answered no request from this environment on 2026-09-25, so no figure from those tables is
  transcribed anywhere on this site. They are named on every page that would charge them.
- **The HVAC column.** The City's page publishes `$.09` / `$.11` / `$.06` per sq ft for a new
  building's HVAC permit and prices a replacement heater at `$25.00` / `$50.00` / `$75.00` by
  BTU output, an air-conditioning unit at `$25.00` and a ductless split or wall pack at
  `$25.00`. Madison's third page here is plumbing, so the mechanical column is transcribed in
  this record and in the profile rather than attached to a page.
- **The alteration cap in MGO 29.09(2)(c)** — "In no case shall the fee exceed those as
  calculated for new buildings". A cap that compares this fee against a fee this calculation
  has not run cannot be expressed as a fixed `maximumCents`, so an alteration whose valuation
  is high enough to reach the cap is **overstated** here, and the pages say so.
- **Plan review by element and by seat:** structural review at `$50.00` per building element,
  fire escapes at `$100.00` each, stadium and grandstand seating at `$0.05` per seat, the
  `$100.00` miscellaneous and `$100.00` revision rows, Priority Review (double the plan
  review fee) and the Early Start permit.
- **The rest of MGO 29.09(3)(a) Group IV:** accessory buildings and detached garages at
  `$.06` per sq ft, awnings `$20.00`, tents `$50.00`, in-ground pools `$25.00`, moving a
  structure at `$0.125` per cubic foot (min `$250.00`, max `$450.00`), razing an accessory
  building `$20.00`, a one-family dwelling `$150.00`, a two-family dwelling `$250.00`, a
  commercial building by volume, solar panels `$21.00`, certificates of occupancy at `$10.00`
  and `$150.00` (`$75.00` for a change of use), mobile-home occupancy `$15.00`, and the
  erosion control fee at `$0.01` per sq ft of lot area.
- **The penalty for work without a permit** — double the fee plus `$100.00` a day — and the
  permit-extension fee of half the original inspection fee.
- **Everything another authority charges:** DSPS licence fees, the State's own plan review
  for work it retains, utility and water-sewer connection charges, and the Fire Department's
  permits, which the City's own permit chart routes to a different number.

## 5. Effective dates and access

- **Fees as modelled:** `effectiveFrom = 2021-03-27` — the date Chapters 18, 19 and 29 took
  effect together. Every modelled row is in one of those three schedules.
- **Amendments:** the Common Council does amend §29.09 — a June 2025 file amends
  §29.09(3) "to update the Certificate of Occupancy fee". No amending file for §18.09 or
  §19.11 was reachable from this environment, so the 2021 recreation is the most recent text
  of those two sections this pass could read.
- **The division's page is live and maintained.** The Wayback Machine's
  `20220123180733` snapshot of the fee page still carries "Priority Review (Optional) — Double
  above fees" and "Early Start Permission (Optional) — $50.00", both of which the 2021
  ordinance prints; today's page has dropped Priority Review and reads "Early Start Permit
  (Optional, Commercial Buildings Only) — $50.00 + $0.01 per square foot … Includes Zoning
  fee". The page has been edited since 2022, which is why it is cited as a source in its own
  right rather than as a restatement of the ordinance.
- **Access:** `cityofmadison.com` and `mcclibraryfunctions.azurewebsites.us` both answer
  directly. The ordinance PDFs were read twice — `pdftotext -layout` and plain `pdftotext` —
  because the fee tables are two- and three-column and the plain mode mispairs labels with
  amounts (the `-layout` reading is the one quoted above, checked against the City's page row
  for row). `docs.legis.wisconsin.gov` returns HTTP 000.
- **The documents are not committed.** `.tmp-research/wisconsin/` holds the three ordinance
  PDFs and their text extractions, and is ignored by Git. What is committed is this
  transcription, with URLs and dates, so anyone can re-capture and compare.

## 6. Open questions

- **Group II plumbing: `$.10` or `$.11`?** MGO 18.09 as enacted prints **`$.10 per sq. ft.`**
  The City's fee page prints **`$.11/sq. ft.`** for the same cell, and its `Total` column
  (`.51`) is consistent with `.11`. Every other cell of that table matches its ordinance
  exactly — including electrical Group II at `$.11`, which is the cell next door. No amending
  file for §18.09 was found. **This site charges `$.10`, the enacted figure, and the plumbing
  page names the page's `$.11` beside it.** A single call to (608) 266-4551 would settle it,
  and until then the discrepancy is printed rather than resolved by preference.
- **What area the `$.03` zoning review fee is measured against.** MGO 28.206 is cited by the
  City's page but the page names no area. Modelled against building square footage, stated in
  the rule.
- **Razing a commercial building: `$0.075` or `$0.005` per cubic foot?** MGO 29.09(3)(a)
  prints `$0.075`; the City's page prints `$0.005`. Fifteen-fold, and not modelled either
  way, so it is recorded here rather than resolved.
- **Whether the four-column table's `Total` is what one application pays.** The ordinances
  issue three separate permits with three separate `$25.00` minimums, and the page's minimum
  row repeats `$25.00` in every column — which reads as four charges rather than one. This
  site charges per permit, which is what a filer with three applications would pay.
- **Whether the shell/interior 50% reduction also halves the plan review fee.** The
  reduction is printed in the *inspection* fee tables of all three chapters; the plan review
  table carries no such note. Modelled as applying to the permit fee only.
