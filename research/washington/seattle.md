# Seattle, Washington — research record

Second jurisdiction of pass 9, published beside King County. Read 2026-09-24. Seattle is
the first jurisdiction on this site whose fee is defined as a **percentage of an index**
rather than as a table of amounts, and the first whose plumbing permit is priced by an
authority that is not the jurisdiction and is not the state either.

## 0. Sources

| # | Document | URL | Read |
|---|---|---|---|
| S1 | **2026 Fee Subtitle**, Seattle Municipal Code Chapter 22.900, adopted as Ordinance 119255 with later amendments | `seattle.gov/documents/Departments/SDCI/Codes/FeeSubtitleFinal.pdf` | three `pdftotext` modes; sha256 begins `d7c6bc15590c7052` |
| S2 | Table D-15 within S1 (electrical permit fees where plans are not required) | same document, same URL | same |
| S3 | **RCW 19.27.085**, building code council fees | `app.leg.wa.gov/rcw/default.aspx?cite=19.27.085` | official citation page |
| S4 | Public Health — Seattle & King County, Plumbing and Gas Piping Program fees | King County's copy of the same PDF | three modes |

The subtitle dates itself: *"including changes becoming effective January 1, 2026"*.

## 1. The mechanism: an index, and then percentages of it

Table D-1 for 22.900D.010 returns a **Development Fee Index** in 26 bands; Table D-2 then
says what a permit and a plan review are as percentages of the index:

* **a building permit is 100% of the index, and the plan review fee is another 100%** — a
  project pays the index twice;
* a project processed as **subject to field inspection** pays 100% for the permit and
  **40%** for the review.

Why this matters rather than being a filing detail:

1. The fee is a *reading* of one number, so the permit fee and the review fee can never
   disagree about which band the valuation fell in, and a second review mode is a
   percentage change rather than a second table.
2. A seam error in the index would be paid **twice**, which is why both seams that matter
   are asserted twice over — in `tests/content/seattle-seed.test.ts` and again from
   PostgreSQL in `npm run db:verify`:

| Valuation | Index (from the published bases and rates) | Check |
|---|---|---|
| $1,500,000 | $11,734.00 | the band below produces exactly this at its top |
| $1,500,001 | $11,740.50 | the new band's first thousand, one cent later |
| $2,000,000 | $14,984.00 | its own band below produces exactly this at its top |
| $2,000,001 | $14,990.00 | the new band's first thousand |

## 2. Two charges on top, neither of them Seattle's idea of a fee

* **Technology fee, 5%**, SMC 22.900A.100: *"applied in addition to all listed fees in
  Chapters 22.900B, 22.900C, 22.900D, 22.900E, 22.900F and 22.900H in the amount of five
  percent of all fees or charges required under the above chapters."* This is the first
  surcharge in the dataset that reads **the whole bill** rather than one component, and it
  is why the calculation engine grew a `fee_subtotal` basis (see
  [`../CALCULATION_ENGINE.md`](../CALCULATION_ENGINE.md)). A percentage of each component
  separately is not a percentage of the total, and on a $2,000,000 project the difference
  is visible in the third decimal.
* **Washington State Building Code Council fee**, RCW 19.27.085: *"a fee of six dollars and
  fifty cents on each residential building permit and a fee of twenty-five dollars for each
  commercial building permit"*, plus *"two dollars for each residential unit, but not
  including the first unit"*. Collected by the City and remitted. The second charge in this
  dataset set by statute rather than ordinance, and the first split by **occupancy** rather
  than by size — the same convention King County's two guides print, so both Washington
  payloads key it on `custom.building_class`.

## 3. Electrical: two tables, and which applies is a determination

Table D-15 prices work where plans are not required; Table D-14 prices the same work by
valuation where plans are reviewed, and the subtitle's own notes send a project to D-14
when *"the base fee and SDCI hourly rate are used to calculate the fee"*. A 200-ampere
service is a flat **$292.00** under D-15 and a function of valuation under D-14. The choice
is the department's, so D-15 is what this site models and D-14 is named in prose.

Table D-15's rows overlap **by design**, which is the modelling problem the table poses:
a 200-ampere service is $292.00 under item 6 and a 200-ampere feeder is $146.00 under item
7 — one amperage, two rows, two prices. Every rule is therefore gated on
`custom.electrical_item` as well as on size, and the tests assert that an unnamed item is
charged **nothing** rather than falling into the first band.

| Item | Fee |
|---|---|
| Administrative fee | **$55.48**, on every item except the City Light safety inspection |
| Minimum, standard OTC self-issued permit | **$105.12** |
| Service, new or altered | $146.00 up to 125 A · $292.00 at 150–200 A · $365.00 at 225–350 A · *"Plan Review Only"* at 400 A or more |
| Branch circuit or feeder, each | $26.28 up to 25 A · $43.80 at 30–50 A · $146.00 at 60–200 A · $292.00 at 225–350 A |
| Low-voltage / communications | $17.52 per control unit · $2.92 per device or outlet, maximum $636.56 on communications |
| Specialty permits | $146.00 each: service repair, temporary construction power (under 400 A), underground work only, City Light safety inspection (no administrative fee) |
| Ufer test when covered before inspection | $292.00 |
| Heaters / transformers / car chargers | $8.76–$146.00 by kW · $20.44–$219.00 by kVA · $26.28–$146.00 by level and amperage |

**The minimum is not a formality**, and the page says so with the arithmetic: one
20-ampere circuit is $26.28, the administrative fee is $55.48, and 5% of the two is $4.09 —
**$85.85**, which is $19.27 short of the floor, so $105.12 is what such a permit costs.

## 4. Plumbing is not Seattle's

SMC 22.900G.030, inside the City's own fee subtitle:

> "Fees for plumbing, medical or dental gas, lab gas, and fuel gas piping shall be collected
> by the Director of King County Public Health in accordance with the fee schedule as set
> forth in Seattle Municipal Code Section 504."

The schedule it points to is the same one King County's plumbing page uses — $137.00 plus
$27.00 per fixture, plan review at $273.00 per hour. The two payloads therefore **share the
rule records** rather than each transcribing the schedule, and a test asserts they are
identical by code and by config, because two transcriptions of one document is how a pair
of pages ends up disagreeing about a fee.

## 5. What was built

* `src/content/seattle/fee-rules.ts` — the 26-band index, the 100%/100%/40% review
  percentages, the technology fee on `fee_subtotal`, the three state-fee rows, and the
  Table D-15 items including the branch-circuit rows added in this pass.
* `src/content/seattle/index.ts` — three permit pages, four sources, six requirements,
  fourteen verifications. Worked examples, computed before the prose was written:
  **$31,491.40** (building, $2,000,000 commercial: $14,984.00 + $14,984.00 + $1,498.40 +
  $25.00), **$364.85** (electrical, 200 A service), **$245.00** (plumbing, four fixtures).
* **One engine change:** the `fee_subtotal` basis, added for the technology fee and
  described in `CALCULATION_ENGINE.md` §18. It reads every component computed before it in
  the same run, which is what "five percent of all fees or charges required" means and what
  no existing basis could express.

## 6. Open questions

1. **Which electrical table applies to a given job** is a departmental determination, and
   the subtitle prices the consequence of getting it wrong rather than the rule.
2. **Whether the $105.12 minimum is charged in addition to or instead of the items.** It is
   a floor on a channel ("a standard Online Trade-Construction (OTC) self-issued electrical
   permit"), so it is stated on the page and not modelled as a component.
3. **The communications maximum of $636.56** applies to one of the two systems item 5
   covers, so it is quoted rather than applied.
4. **Phased permits** divide a project's fee across permits and charge one times the base fee
   per additional application; neither the division nor the base-fee charge is modelled.
5. **Whether plan review is charged on a permit priced by Table D-15 at all** — D-14 exists
   for work with plans, which suggests the review is inside that schedule rather than an
   addition to D-15.
