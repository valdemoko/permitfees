# Durham, North Carolina — permit fee research

Status: **modelled, seeded and published.** Three pages (`/north-carolina/durham/…`):
building, electrical, plumbing.

Last verified: **2026-09-25**. Four city-published PDFs, one per trade, all bearing the
same effective date on their own face.

This is the second North Carolina jurisdiction, and it is deliberately the opposite of
[Raleigh](./raleigh.md). Raleigh prices a permit as a percentage of the City's own
calculated value and prices the trades as a share of the building permit; Durham prices
the building permit **by gross square footage** for a new house and **by construction
contract value** for commercial work, and prices the trades **by the count of the thing
being permitted** — an outlet, a fixture, an ampere of service. The two cities are 12
miles apart, publish nothing in common, and give the same $400,000 commercial project
two unrelated answers.

## 0. How the sources were obtained

| # | Document | URL | Kind | Effective |
| --- | --- | --- | --- | --- |
| D1 | *Building Permit Fee Schedule* | `durhamnc.gov/DocumentCenter/View/2706/Building-Permits-PDF` | fee_schedule_pdf | 2018-07-01 |
| D2 | *Electrical Permit Fee Schedule* | `durhamnc.gov/DocumentCenter/View/1008/Electrical-Permits-PDF` | fee_schedule_pdf | 2018-07-01 |
| D3 | *Plumbing Permit Fee Schedule* | `durhamnc.gov/DocumentCenter/View/1010/Plumbing-Permits-PDF` | fee_schedule_pdf | 2018-07-01 |
| D4 | *Mechanical Permit Fee Schedule* | `durhamnc.gov/DocumentCenter/View/1009/Mechanical-Permits-PDF` | fee_schedule_pdf | 2018-07-01 |
| D5 | *Fee Schedules* (the index that publishes D1–D4) | `durhamnc.gov/302/Fee-Schedules` | municipal_website | — |

All four PDFs are linked from D5, the City's own Fee Schedules page, which was read on
2026-09-25 and lists exactly these four permit schedules plus the City Impact Fee
Ordinance. sha256 prefixes as downloaded that day:

| File | Bytes | sha256 (first 16) |
| --- | --- | --- |
| building.pdf | 1,127,925 | `84dc8a02035d810f` |
| electrical.pdf | 1,084,801 | `10763b17d1426cc4` |
| plumbing.pdf | 1,060,919 | `fc4f685508fa5b60` |
| mechanical.pdf | 1,060,244 | `cc11b8ca62d5f703` |

Extracted with `pdftotext -raw` and re-read with `pdftotext -layout`, because the two
cost columns of Schedule E and the Schedule C/D headings are only unambiguous in the
layout pass (the same failure mode that cost Scottsdale a pass — see
[`../arizona/scottsdale.md`](../arizona/scottsdale.md) §4).

**The effective date is on the documents, not inferred.** Each schedule's own header
reads `(Effective 7/1/18--Includes Technology Surcharge)`. No newer schedule is linked
from D5, so 2018-07-01 is the date recorded, and the fact that the City still publishes
these as its current schedules on 2026-09-25 is recorded too rather than quietly treated
as a fresh schedule.

## 1. Authority

| Field | Value |
| --- | --- |
| Jurisdiction | City of Durham / Durham County (consolidated), North Carolina |
| County | Durham County, FIPS 37063 |
| Issuing department | **City-County Building & Safety Department** |
| Phone | 919-560-1200 |
| Address | 101 City Hall Plaza, Durham, NC |
| Website | `durhamnc.gov` (`/293` is the department page) |

The department's own page states the authority in one sentence: *"The City-County
Building & Safety Department provides permit, plan review, and inspection services for
the **City and County of Durham**. These services ensure the health, safety, and welfare
of the public through administration and enforcement of the North Carolina State
Building Code and the zoning ordinances for both the City and County."*

That matters for the model: Durham is one authority covering the incorporated city and
the unincorporated county, so there is no second jurisdiction to reconcile — unlike
Wake County beside Raleigh, and unlike Florida's two counties. The payload therefore
carries one department, one schedule set and one set of pages for both.

## 2. Mechanism — what makes this jurisdiction different

### 2.1 Building: four different bases inside one document

**Schedule A — new one- and two-family dwellings, priced by gross area.** Eight
brackets, each a flat pair of amounts (permit / plan review):

| Gross area | Permit | Plan review |
| --- | --- | --- |
| Up to 1,200 sq ft | $146.00 | $146.00 |
| 1,201–1,800 | $325.00 | $146.00 |
| 1,801–2,400 | $400.00 | $146.00 |
| 2,401–3,000 | $456.00 | $146.00 |
| 3,001–3,600 | $537.00 | $146.00 |
| 3,601–4,200 | $650.00 | $146.00 |
| 4,201–5,000 | $740.00 | $146.00 |
| 5,001 and over | $810.00 | $146.00 |

A `tiered_table` over `square_footage`. The plan review column is $146 in **every**
bracket, so it is one flat rule, not a table — and it is charged with the permit,
because the schedule says "The Plan Review Fee must be paid at time of plan submittal".

**Schedule B — multi-family, priced per dwelling unit.** "First unit $300.00 / Each
additional unit, per building $150.00", plan review $450.00 flat with "no additional
fee". That is `per_unit` with `unit: "dwelling_units"`, a base charge covering the first
unit and a per-unit rate after it — the same shape Houston's plumbing fixtures take.

**Schedule C — accessory buildings, flat, $50 with no footing and $100 with one.** The
$50 difference is an add-on rule gated on a footing fact, so a reader who does not know
yet is not charged the difference.

**Schedule D — renovations and additions, priced by construction contract value.**
"0 to $10,000.00 — no footing — $125.00" and "$10,001.00 and over — no footing —
$250.00", "(add $50.00 if footing required)" on both, plan review $125.00 flat.

**Schedule E — nonresidential, priced by contract value with a per-thousand increment.**
This is the schedule with the seams:

| Contract value | Permit | Plan review | Increment |
| --- | --- | --- | --- |
| $0–$5,000 | $104.00 | $104.00 | — |
| $5,001–$50,000 | $104.00 | $104.00 | + $7.80 per $1,000 over $5,000 |
| $50,001–$100,000 | $456.00 | $230.00 | + $6.60 per $1,000 over $50,000 |
| $100,001–$500,000 | $786.00 | $400.00 | + $4.32 per $1,000 over $100,000 |
| Over $500,000 | $2,513.00 | $1,300.00 | + $1.25 per $1,000 over $500,000 |

Modelled as five `per_thousand` rules (four with `thresholdCents` and `baseCents`, one
flat) plus five flat plan-review rules. **The plan review column does not carry the
increment**, and the layout pass is what settled it: if it did, plan review at $100,000
would be $560 and the next band would print $400 — a $160 step backwards — while the
permit column meets its next band exactly ($456 + 50 × $6.60 = $786 = the next base).
The increments belong to the permit column alone.

**The three seams, as published:**

- **$5,000 → $5,001**: $104.00 → $111.80. A $7.80 step, which is one increment. Correct.
- **$50,000 → $50,001**: $104.00 + 45 × $7.80 = **$455.00** → the next band prints
  **$456.00**. A **$1.00** step that the schedule does not explain. Carried as printed.
- **$500,000 → $500,001**: $786.00 + 400 × $4.32 = **$2,514.00** → the next band prints
  **$2,513.00** plus one increment of $1.25 = **$2,514.25**. A **$0.25** step, again
  because the bands are alternatives rather than a joined ladder.

None of these is smoothed. Each band is charged over the range the schedule prints for
it, and the boundaries are asserted in the tests.

### 2.2 Trades: priced by the count of the thing permitted

**Electrical.** Schedule A prices house service by size ($156.00 for 100–200 A,
$187.00 for 400 A, one permit per house meter). Schedule B prices outlets "1 – 10
outlets $21.00 / Each additional outlet $0.83" and Schedule C prices fixtures in the
identical shape — a flat charge covering the first ten, then 83 cents each, which is
`per_unit` with `baseCents`, `thresholdUnits: 10` and `centsPerUnit: 83`. Schedule F
prices service equipment by ampacity: "Up to 100 amperes $34.00 / Each additional 100
amperes or fraction thereof $6.97", a `per_thousand` on the `amperage` basis with a
100-ampere threshold and a 100-ampere increment — the same primitive Miami-Dade's
"$7.26 per 100 Amps" uses (see `CALCULATION_ENGINE.md` §17).

Three floors and a surcharge sit on top of the electrical schedule:

- **"Minimum electrical permit fee … $65.00"** — a floor on the *permit*, not on any
  one row, so it is a `permit_minimum` rule measured against `permit_fee`.
- **"Minimum fee for any permit requiring a rough-in inspection: Commercial $150.00 /
  Residential $100.00"** — two more `permit_minimum` rules, selected by occupancy, and
  gated so only one floor can fire at a time: the schedule states three floors for one
  permit, not three charges.
- **"$5.00 … for each plumbing, electrical, or mechanical application that is submitted
  manually"** — a conditional flat charge, keyed on paper submittal.

**Plumbing.** Six schedules, all count- or scope-based: $170.00 for all new dwellings
(Schedule A); $6.24 per fixture with a $127.00 minimum for multi-family (B); $7.90 per
fixture with a $187.00 minimum without water and sewer and $265.00 with it (C);
additions (D) as separate lines — building sewer and water $65.00, then 1–7 fixtures
$94.00, 8–15 $119.00, over 15 at $7.90 each; fixture replacement with no change to
rough-in (E) 1–4 fixtures $65.00 and 5 or over at $6.86 each, plus an electric water
heater permit at $65.00; and miscellaneous flats (F).

The plumbing schedule's minimums are **per-rule** floors ("Minimum … $127.00" sits next
to "Per Fixture $6.24"), so they are `minimumCents` on the rule, unlike electrical's
permit-level floors. Same document family, two different ways of stating a floor.

### 2.3 The technology surcharge is already inside every number

All four schedules say `(Effective 7/1/18--Includes Technology Surcharge)`. Durham does
not print a separate surcharge line because it has already been folded into each amount.
That is the exact counterpart of Raleigh, which prints a 4% technology surcharge as its
own row and charges it last against the fees. **No surcharge rule exists in this
payload**, and the pages say why: a reader comparing Durham with Raleigh will otherwise
assume one of the two numbers is missing it.

## 3. What is modelled

- **Building**: Schedule A as a `tiered_table` over `square_footage` with its flat plan
  review; Schedule B's per-unit fee and its $450 plan review; Schedule C with the
  footing difference; Schedule D's two value bands, footing difference and $125 plan
  review; Schedule E's five bands and five plan-review amounts; and eleven Schedule F
  flats (mobile home, modular unit, moving permit, both demolition bands, demolition
  with a forthcoming permit, residential reroofing, residential decks, change of
  occupancy, both commercial roofing bands).
- **Electrical**: both service rows, the outlet and fixture shapes, water heaters as
  counted devices, sign circuits, service equipment by ampacity, solar and
  mobile/modular inspections, the $5 paper surcharge, and all three permit-level floors.
- **Plumbing**: all six schedules, including the two Schedule C minima selected by the
  water-and-sewer line, Schedule E's water-heater permit, and the $5 paper surcharge.
- **Plan review** is charged where the schedule publishes a plan review column —
  building Schedules A–E — and is not invented for the trades, which publish none.

Every rule carries the schedule's own wording in its description, so a reader can match
the breakdown line to the PDF row.

## 4. What is deliberately **not** modelled, and named on the pages instead

1. **Schedule D of the electrical schedule — motors and generators.** "$18.00 minimum
   charge / Each motor $3.22 / Additional charge per hp or fraction thereof, applied
   against total hp $0.62." Three lines, two of them variables, and the schedule does not
   say whether the $18.00 minimum *includes* the first motor's $3.22 or replaces it. A
   per-motor count alone would undercharge a 10-hp motor; a per-hp count alone would
   undercharge a one-motor permit. Named with all three published amounts.
2. **The rest of the electrical schedule's device rows** — disposals, dryers and
   dishwashers, electric heat, unit heaters, furnaces and "all other devices … each
   $10.90" — are per-item rows this site prices only where the schedule's item is one
   the calculator already asks about (water heaters and sign circuits are modelled).
   Each unmodelled row is named at its published amount.
3. **Feeders and transformers** (Schedule F): feeders are priced by ampacity of the
   feeder, which is a *second* amperage fact, and the engine has one `amperage` basis.
   Charging a feeder from the service's amperage would be wrong; naming the row is not.
4. **Re-reviews, re-inspections and after-hours work** — 2nd re-review $200, 3rd and
   after $300, re-inspections $100/$100/$200/$300, after-hours inspection $125/hour with
   a two-hour minimum, Enhanced Plan Review $600/hour. All are fees for a *second*
   encounter with the Department, not for the permit.
5. **The building schedule's administrative rows**: work begun without a permit (double
   fee), voiding a permit (15% of permit cost, no maximum), duplicate placard $5,
   change of address/PIN/PID $10 per trade, re-stamping plans $20 per plan, partial
   occupancy $200, stocking permit $100, floodplain permits $150/$500, change of
   impervious surface $250, and the Schedule G fire-prevention and Schedule H/I service
   rows.
6. **The $50 trip charge** for water or sewer work needing more than two inspector
   trips, and the paper-application surcharge is modelled but only when the applicant
   says the submittal was on paper.
7. **The mechanical permit** (D4) — read, cited, and not priced: no page of this site
   prices mechanical work in any jurisdiction, which the pages state rather than leave
   to be inferred.

## 5. Charlotte and Mecklenburg County — why the second North Carolina city is not Charlotte

Recorded here rather than left as silence, because the reason is a real blocker and not
an oversight.

- `charlottenc.gov` sits behind an Akamai interstitial. The challenge is solvable from
  this environment (proof-of-work POST to `/_sec/verify?provider=interstitial`, then the
  cookie opens the site), and it was solved: the City's **User Fee Schedules** page and
  its FY2027 Development Center PDFs were read.
- Those PDFs are **not permit fees**. *FY2027 Nonresidential*, *FY2027 Individual
  Residential Lot*, *FY2027 Residential Zoning*, plat and subdivision schedules price
  **plan review and inspection across departments** — Planning, CDOT, Stormwater,
  Grading, Tree, Detention, Fire CATS — as flat amounts per project type (e.g.
  Non-Residential Review & Inspection $1,180 / $2,000 / $1,570 / $880 / $3,350). There
  is no building, electrical or plumbing permit row in them at all.
- The **building, electrical and plumbing permit fees for Charlotte are Mecklenburg
  County's**, issued through `webpermit.mecklenburgcountync.gov` and published by
  Mecklenburg County — and `mecklenburgcountync.gov` (403), `webpermit.mecklenburgcountync.gov`
  (403) and `greensboro-nc.gov` (403) are unreachable from this environment.

So Charlotte is **blocked on the primary source for all three permit types**, while
Durham — reachable in one click from the City's own index — publishes four complete
schedules. Charlotte can be revisited if Mecklenburg's domain becomes readable; the
Development Center schedules alone cannot support the three pages, and publishing them
as if they were permit fees would be the exact error this project's gate exists to stop.

## 6. Open questions

1. **Is the 7/1/18 schedule still the whole truth in 2027?** The City links it as
   current and no newer document is published from D5, but a fee change adopted by
   ordinance and not re-uploaded as a PDF would not be visible here. The pages date
   themselves to the schedule's own effective date for that reason.
2. **Schedule E's $1.00 seam at $50,000.** Whether the Department intends $455.00 at
   $50,000 or has adopted $456.00 as the next band's first dollar is not stated in the
   document. Charged as printed on each side.
3. **Schedule D of the plumbing schedule** lists "Building sewer and water $65.00" and
   the fixture rows as separate lines under one heading. Read as separate chargeable
   lines — the same way Schedule E's "Electric water heater (permit required) $65.00" is
   a line of its own — and the calculator therefore charges the $65 line only when the
   applicant's job includes building sewer or water work, which the page states.
4. **Plan review for the trades.** Neither trade schedule publishes a plan review fee,
   and the building schedule's "Plans Review-re-review" row is about re-reviews only, so
   no trade plan review is computed.
