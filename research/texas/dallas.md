# Dallas, Texas — permit fee research

Status: **modelled, seeded, published.** Three pages live (`/texas/dallas/…`), one
rule held as `draft` because two official documents disagree about it, and one open
question stated on the pages rather than papered over.

Last verified: **2026-09-24**. Effective from **2024-05-01** (Ordinance 32676), with
four commercial rows and the Table B-I amendment dated separately.

This is the second jurisdiction in the project and the first whose fee structure is
*materially different* from Houston's. Two of the three differences are the whole
reason this document exists: Dallas publishes no trade permit fees at all, and two of
its own documents contradict each other about plan review.

## 0. How these sources were obtained, and what that costs

The City of Dallas web host **did not respond to a direct fetch from this
environment**. Every document below was retrieved from the Internet Archive's raw
snapshot and read locally, which is a stand-in for a primary source and is recorded
as one.

| # | Document | Live URL | Snapshot | Size / hash | Pages |
| --- | --- | --- | --- | --- | --- |
| S1 | Permit Fee Schedule (eff. 2024-05-01, Ordinance 32676) | `dallascityhall.com/departments/sustainabledevelopment/DCH documents/DSD Fees.pdf` | 2025-11-29 | 534,875 B · sha256 `90cb9d4a…a492b117` | 10 |
| S2 | PDV Fee Estimate Worksheet Examples | `…/buildinginspection/DCH documents/pdf/PDV_Fee Estimate Worksheet Examples.pdf` | 2025-10-16 | 166,761 B | 6 |
| S3 | Ordinance 25-0638 (eff. 2025-04-15) | `…/buildinginspection/DCH documents/25-0638.pdf` | none (live fetch succeeded) | 395,589 B | 3 |

Text was extracted with `pdftotext -layout` (table shape) and `pdftotext -raw` (which
resolves row/column ambiguity — see §5.1). S3's text layer is a poor scan, so only
passages legible in more than one place were relied on; §5.2 records the one place
where that mattered.

**What this costs.** The hashes and dates are above so a re-capture can be proven
identical or shown to have changed. Until someone re-fetches S1 and S2 from the live
host, every published figure rests on an archived copy of a document the City
published — and the pages say so on their source rows rather than implying a
first-hand reading.

## 1. Authority

| Field | Value | Source |
| --- | --- | --- |
| Jurisdiction | City of Dallas, Dallas County, Texas | S1 cover, S3 |
| Type | city | — |
| Issuing department | Building Inspection, Department of Sustainable Development | City URL path (see §7.6) |
| Address / phone | **not recorded** | — |
| Permit portal | **not recorded** | — |

The department has been renamed at least once — older material and third-party sites
say "Development Services" or "Building Inspection". A page that tells a reader who to
call has to be right about it, so no phone number, email or street address is
published for Dallas. The name recorded is the one in the City's own URL path for the
permitting pages. See §7.6.

## 2. Official sources

### S1 — Permit Fee Schedule

Effective **1 May 2024**, adopted by **Ordinance 32676**. Line items A–Z plus tables
A-I, A-II, A-III, B-I and B-II. It carries its own disclaimer:

> "the fees listed in this schedule are for informational purposes only and are
> subject to change. Final permit fees will be calculated at the time of submittal
> based on the specifics of each project and any applicable regulations or
> ordinances."

That is the city saying what this product says on every figure. It is quoted on the
Dallas pages.

**It is no longer wholly current.** Ordinance 25-0638 amended Table B-I and the
technology, Q-Team review, mover's licence and non-premise sign fees on 15 April 2025,
and *removed* the postage and handling fee and the inspection scheduling fee — both of
which S1 still prints.

### S2 — PDV Fee Estimate Worksheet Examples

The department's own estimator, with five worked examples: a new single-family
dwelling, a residential remodel, a new commercial office building, a commercial
tenant finish-out, and a multi-family complex with an accessory structure.

This document turned out to be decisive, and it is used **arithmetically, never
copied**: every one of its five totals was reproduced to the cent from the tables it
uses, which is what makes it a check rather than a claim. It resolves two things S1
leaves open (§4.3, §7.3) and creates one contradiction (§4.5).

### S3 — Ordinance 25-0638

Amends Chapter 52 Sec. 303: Table B-I (alterations or repairs), the technology permit
fee (restated unchanged at $15), Q-Team review caps, mover's licence, non-premise sign
registration; removes the duplicate/temporary/partial certificate of occupancy fees,
the postage and handling fee, and the inspection scheduling fee. Effective
2025-04-15.

It also settles the arithmetic typo in S1's Table B-I: the row S1 prints as
`$500,000,001 – 10,000,000` is `$5,000,001 – 10,000,000`, and the amendment replaces
that whole table anyway.

## 3. What Dallas actually charges — the structural difference from Houston

**Dallas's published fee schedule contains no electrical, plumbing or mechanical
permit fee at all.** A case-insensitive search of the extracted text returns **zero
matches** for "electrical", "plumbing" and "mechanical" across all ten pages, and
none for "water heater", "grease" or "sewer" either.

Trade inspections are priced instead through the **Minimum Inspection Fee Schedule**,
a function of **how many trades the job involves**:

| Number of trades | Minimum inspection fee |
| --- | --- |
| 1 | $125 |
| 2 | $250 |
| 3 | $375 |
| 4 | $500 |
| 5 | $625 |
| 6 | $750 |
| 7 | $875 |
| 8 | $1,000 |
| 9 or more | $1,125 |

The table appears three times — under A-I, under A-III, and under B-I, where it is
qualified "based on # of trades or valuation — whichever is greater".

**How it combines with the table fee** is settled by S2: on the new-construction path
its worksheets list a Base Fee Subtotal, then an inspection fee entered by number of
trades, then the technology fee, and **add** them. So on that path it is a component,
not a floor, and that is how it is modelled. On B-I's alteration path the wording
points the other way, which is one more reason B-I is not modelled here (§4.4).

### The three consequences

1. **Dallas's electrical and plumbing pages cannot publish a rate, because Dallas
   does not publish one.** They publish the mechanism — the trade-count table — and
   say plainly that the schedule has no trade permit fee in it. No competitor does
   this, and it is the honest answer to the question people are searching for.
2. **What remains uncertain is stated as uncertain.** The schedule's silence does not
   prove that no other mechanism prices a permit filed for a single trade; S2 shows
   the inspection fee charged once per permit application, scaled by the job's trade
   count, and S1 prices a $25 "Document Handling Fee – Stand Alone Trade Review",
   which shows trade permits exist as documents without giving them a fee. Both pages
   are marked `needs_review` for exactly that reason (§7.2).
3. **It is a content problem, not a modelling one.** A per-trade table is a `per_unit`
   rule with a ceiling; the engine needed one new count kind (`trades`), not a new
   fee type.

## 4. Data as modelled

All amounts below are what the site publishes. Every rule cites S1, S2 or S3
individually, and every rule's `description` names the table it came from.

### 4.1 Table A-I — new single-family and duplex construction

Fee is a function of **square footage**, and the rate applies to the **whole area**,
not to the part above a bracket floor:

| Square footage | Formula |
| --- | --- |
| 0 – 700 | `sqft × 1.07` |
| 701 – 2,350 | `sqft × 0.34569 + 300` |
| 2,351 – 10,500 | `sqft × 0.077 + 800` |
| 10,501 + | `sqft × 0.0272 + 1,000` |

Whole-area charging is not an inference: S2's example for a 2,500 sq ft house gives a
$992.50 base fee, which is `2,500 × 0.077 + 800` and not `(2,500 − 2,350) × 0.077 + 800`.

**The step at 700 sq ft is real.** 700 sq ft pays $749.00 and 701 pays $542.33 — the
fee *falls* by $206.67 as the building gets one square foot bigger. Third-party sites
quote "$749" as "the Dallas single-family permit fee", which is the top of the first
bracket quoted as if it were the whole schedule.

### 4.2 Table A-II — new multi-family construction

**$652 per dwelling unit.** S1 adds: "Does not apply to accessory structures. See
Table A-III" — so parking garages, gyms and leasing offices are valued separately and
priced from the commercial table. A 200-unit building is therefore one calculation
plus, usually, a second one for its garage.

### 4.3 Table A-III — new commercial construction

Ten brackets. S1 prints six (ending at $1,500,000); S2 prints ten, and its example for
a $6,000,500 valuation exercises the fifth of the extra rows:

| Value of proposed work | Formula |
| --- | --- |
| $0 – 2,000 | flat $75 |
| $2,001 – 25,000 | `× 0.0095 + 100` |
| $25,001 – 60,000 | `× 0.0075 + 100` |
| $60,001 – 200,000 | `× 0.027665 + 350` |
| $200,001 – 900,000 | `× 0.006325 + 400` |
| $900,001 – 1,500,000 | `× 0.003895 + 500` |
| $1,500,001 – 2,500,000 | `× 0.003862 + 700` ← S2 only |
| $2,500,001 – 5,000,000 | `× 0.003630 + 850` ← S2 only |
| $5,000,001 – 10,000,000 | `× 0.005095 + 1,100` ← S2 only |
| $10,000,001 + | `× 0.002527 + 1,300` ← S2 only |

The four S2-only rows carry **2025-10-16** as their effective date (the earliest
capture of the document that contains them) rather than S1's 2024-05-01. The
disagreement between the two documents is recorded rather than smoothed: S1 stopping
early is silence, and S2's own example proves the row it exercises. Resolved as §7.3.

### 4.4 Table B-I — alterations and repairs: **not modelled**

S1's Table B-I is a thirteen-bracket valuation table with add factors. It is **out of
date**: Ordinance 25-0638 replaced it on 15 April 2025 with a table whose every row is
`(valuation × rate + add factor) × 1.33`, plus the trade-count minimum as a floor
("based on # of trades or valuation — whichever is greater").

Two reasons it is not in the model, and both are engine limits rather than choices:

1. The outer `× 1.33` after the add factor. Folding it into the rates and add factors
   is arithmetically possible and would hide the multiplier from the reader, which is
   the opposite of what these pages are for.
2. The floor is a function of trade count, so the fee is `max(valuation table,
   trade table)` — a maximum of two functions, which no single rule expresses.

Modelling it would mean a new fee type or a composed rule, and neither is justified by
what it adds. The Dallas pages name it, cite it, and say it is not estimated.

Table B-II (alterations to single-family and duplex: $181 per dwelling unit plus $100
for additional trades) is in the same position and is named on the page.

### 4.5 Plan review — **disputed, and published as disputed**

S1, three times over (residential, commercial, multi-family):

> "Plan Review Fee $0.46 per sq. ft. or $577 (whichever is greater)"

S2, in all five of its worked examples, computes **$0.046 per sq ft**:

| Area entered | S2's plan review | `area × 0.046` | `area × 0.46` |
| --- | --- | --- | --- |
| 2,500 sq ft | $577 (the minimum) | $115 | $1,150 |
| 11,500 sq ft | $577 (the minimum) | $529 | $5,290 |
| 25,000 sq ft | $1,150 | $1,150 | $11,500 |
| 100,000 sq ft | $4,600 | $4,600 | $46,000 |
| 180,000 sq ft | $8,280 | $8,280 | $82,800 |

All five of S2's example totals balance to the cent at 0.046 and **none balances at
0.46**. Each reading is internally consistent, neither document is a misreading, and
no third source resolves it.

**Decision: publish the contradiction, charge neither figure.** The rule is modelled
at S2's rate with the $577 floor, shipped as `draft` so it cannot enter a total, and
stated on every page with both readings. This is the same treatment Houston's disputed
minimum fee gets, and for the same reason: a confident wrong number is the failure
mode this project exists to avoid.

Note what the $577 floor implies. If the rate were 0.46, any plan review over 1,254
sq ft would exceed the minimum and the minimum would be dead text. At 0.046 it bites
up to 12,543 sq ft, which is a meaningful floor for the buildings Dallas reviews most.

### 4.6 Line items the pages name

| Service | Cost | Note |
| --- | --- | --- |
| Technology permit fee | $15 | per application, permit, plan or document submitted (S3 restates it) |
| Permit Extension Fee | $200 per permit | |
| Reinspection Fee | $75 | |
| Additional Inspection Service Fee | $125 per trade inspection | |
| After Hours Inspection Fee | $125/hour | $300 minimum |
| Same Day Inspection Fee | $250 | requests 7am–2pm the day of inspection |
| Unauthorized Concealment Fee | $200 per trade | |
| Work Without a Permit Investigation Fee | $100/hour/per trade | |
| Document Handling — Stand Alone Trade Review | $25 | the only line item near a trade permit |
| Residential Plans Check Addendum | $100 per trade added or substituted | |
| Zoning surcharge (PD, SUP, DR) | 10% of the permit fee | applied to the base fee, per S2's examples |
| Certificate of Occupancy | $375 general / $104 partial / $250 residential TCO | |
| Postage & handling · Inspection scheduling | **removed 2025-04-15** | S1 still prints them |

The last row matters: publishing a fee the City repealed in April 2025 would be a
wrong number with a citation attached. It is exactly the kind of error that reading
only the fee schedule produces.

## 5. Notes on method

### 5.1 Two extraction passes, on purpose

`-layout` preserves table shape and is right for the numbered tables. `-raw` reads in
content-stream order and resolves rows where the layout pass interleaves two columns.
Both were run; figures came from whichever pass was unambiguous, and disagreements
were treated as open questions.

### 5.2 A row that `-layout` got wrong

`-layout` produced, in sequence: "Street Name Change…", "10% of the total permit fee",
"Surcharge for planned development…", "$15 per document submitted", "Technology Permit
Fee". The values were shifted by one row: the 10% belongs to the *surcharge* and $15 to
the *Technology Permit Fee*. `-raw` gives both correctly. Had only one pass been run,
two real fees would have been transcribed onto the wrong services — and both would
have looked perfectly plausible.

### 5.3 Everything is per the effective date, not per today

S1 dates from 1 May 2024 and S3 from 15 April 2025. Any Dallas page states the
effective date and the check date separately, exactly as the Houston pages do.

### 5.4 The documents are not committed

`.tmp-research/` holds the downloaded PDFs and their text extractions; both are
ignored by Git. What is committed is the transcription, with URLs, snapshot dates and
hashes, so anyone can re-capture and compare.

## 6. Authority boundary

Houston's pages explain that an address outside the city limits belongs to Harris
County. Dallas raises the same question and it is **not answered**: whether Dallas
County issues building permits for unincorporated areas, and for which functions, has
not been checked against the county's own site. "General knowledge suggests" is not a
source, so no Dallas County jurisdiction row exists — a row whose only content was an
absence would be worse than no row.

## 7. Open questions

### 7.1 The arithmetic typo in Table B-I — **RESOLVED**

S1 printed `"$500,000,001 – 10,000,000"` in a table running to $10,000,000, which
cannot be right. Ordinance 25-0638's amended Table B-I reads `$5,000,001 – 10,000,000`
in two independently legible places, which settles the lower bound as $5,000,001. The
amendment then replaces the multipliers for every row, so the corrected figure is of
historical interest only — and no Dallas page charges a B-I fee either way.

### 7.2 Is a stand-alone trade permit charged the trade-count minimum? — **OPEN, stated on the page**

Everything in §3 points the same way, and the evidence is now stronger than an absence:
S2's worksheets price a permit's trades once, by count, and S1 prices a $25 document
handling fee for a "stand alone trade review", which shows trade permits are handled as
their own documents. But neither document says whether such a permit is *charged* the
trade-count minimum, or whether that minimum is charged once on the construction permit
covering the job.

The electrical and plumbing pages therefore publish the schedule's mechanism, publish
no trade permit rate, and carry a `needs_review` verification record naming this
question. Confirming it needs the City to answer, or a real application's fee breakdown.

### 7.3 What applies above $1,500,000 in the commercial table — **RESOLVED**

S2's commercial table has four more brackets, and its own worked example
($6,000,500 → $31,672.55) exercises the 5,000,001–10,000,000 row arithmetically. The
four rows are published with S2 as their source and 2025-10-16 as their effective date.
What is still not known is *why* S1 stops where it does: a truncated printout is the
most likely explanation and is not a fact, so the pages cite S2 for those rows rather
than claiming the schedule always had them.

### 7.4 Does the engine express "whichever is greater"? — **RESOLVED**

Yes, for a rate with a fixed floor: `minimumCents` on a rule clamps the component, and
Dallas's plan review uses it. Modelling the rule at all also required two additions to
the `percent` primitive and one to `per_unit`:

- **Exact rational rates** (`rate: { numerator, denominator }`). Dallas publishes
  `0.027665` and `0.005095` — 2,766.5 and 509.5 basis points, neither an integer. As
  basis points they would have been rounded before multiplying, and the City's own
  commercial example would not have come out.
- **`rateUnit: "currency_per_unit"`**, so `square feet × 0.34569 + 300` reads as
  "$0.34569 per sq ft" and not "3456.9% of project area".
- **`trades`** as a `per_unit` kind, with `maximumCents` reproducing the schedule's
  nine rows exactly.

No new fee type was needed, and no migration: `config` is JSONB and the only new enum
value lives in TypeScript.

The version of "whichever is greater" that is **not** expressible is a maximum of two
*functions* — valuation table versus trade table. That is the obstacle in §4.4.

### 7.5 Does Dallas County get a jurisdiction entry? — **OPEN, see §6**

### 7.6 Department name and contact details — **OPEN, handled by omission**

Whatever appears on a jurisdiction page has to be read from the City's own site on the
day the page is verified. The City's page did not load from this environment, so the
department is recorded by the name in its own URL path and no phone, email or street
address is published. A wrong phone number is a real harm; a missing one is a gap, and
the page does not pretend otherwise.

### 7.7 The technology fee is per document, and is charged once

S3: "$15.00 for each application, permit, plan, or other related construction document
submitted". A permit application with a plan attached is at least two documents by that
wording, and Dallas's own worksheets show a single $15 line. The pages charge one and
say so.

## 8. What was built from this

| | |
| --- | --- |
| Rules | 24 rows in `fee_rules` for Dallas (21 active, 3 draft), across building, electrical and plumbing |
| Pages | `/texas/dallas/building-permit-cost/`, `/electrical-permit-cost/`, `/plumbing-permit-cost/` — all three published and indexable |
| Sources | 3 (`sources`), each with URL, retrieval date, snapshot and hash in its notes |
| Verification | 13 ledger rows, including two `needs_review` on the trade pages and one `disputed` on the plan review rule |
| Engine | exact rational rates, `rateUnit`, `trades` count, strict rule configs |
| Checks | the City's worksheet 1, 3 and 5 reproduced from PostgreSQL; the $178,151.05 multi-family total accounted for line by line |

Deliberately **not** built: Table B-I and B-II alterations, the 10% zoning surcharge,
plan review (published as disputed), and any Dallas County row. Each is named on the
pages that would otherwise have to invent it.

Modelling Dallas changed one thing in the engine that protects Houston too: rule config
objects are now **strict**, so a field written in the wrong place fails validation
instead of being stripped. That was found by this research, not by a test — the plan
review floor was initially misplaced inside `config`, and it silently produced $115
where the schedule's floor is $577.
