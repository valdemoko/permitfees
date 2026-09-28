# Kansas City, Missouri — research record

First Missouri jurisdiction. Kansas City straddles four counties (Jackson, Clay, Platte and Cass) but the permit authority is the City's own City Planning and Development Department, which publishes one commercial fee schedule for every trade: Building, Mechanical, Plumbing, Electrical, Elevator and Fire Protection, each valuation-billed separately.

Everything below was read on **2026-09-26**. Nothing is estimated.

## Why Missouri, and why Kansas City first

The gate is verifiability from this environment. Two Missouri sources answer 200 with byte-stable PDFs: Kansas City's commercial permit-fee sheet and Springfield's two fee ordinances plus the 2009 IBC Fee Calculation Data matrix, all re-read this day. St Louis County (`stlouiscountymo.gov/ordinance-29445`) and the City of St Louis building-permit hub both answer 403/Cloudflare challenge from this sandbox; Columbia's `como.gov` the same; no St Louis primary was readable without a third-party site, which this project never uses as a source of a rate. Kansas City is the state's largest market and Springfield is its third-largest and the only pair that supplies a verifiable *different mechanism* — a valuation ladder versus a construction-factor marginal table — which is the process's second gate. So Missouri opens with Kansas City.

## Sources actually read

| Key | Instrument | How read |
| --- | --- | --- |
| S1 | **Permit Fee Schedule — Commercial Projects Including Residential Buildings with Three or More Dwelling Units** — `https://data.kcmo.org/api/file_data/NQBR-PGwgb7p5xa8YAUChBI6ooDAfSBo7ba3tZuL2oQ?filename=Permit+fees+commercial.pdf` (1 page, 68,049 bytes, SHA-256 `350051f8f1b081bee9e716bc60050284123aa280c07d2068edb6b7b59b8bda84`, HTTP 200) | `curl -L` + `pymupdf` text extraction; read end to end |
| S2 | **Building and Development Fee Schedule hub** — `https://kcmo.gov/city-hall/departments/city-planning-development/building-and-development-fee-schedule` | `curl` + HTML strip — answers **403 Access Denied (Akamai)** from this sandbox; recorded as the portal that links S1 where it is reachable |
| S3 | **Ordinance #080766 (effective 05/01/2012)** — cited on S1 as `(Printed 05/01/2012 from Ord #080766 eff. 05/01/2012)` | The date and ordinance number on the sheet itself; no separate fetch |
| S4 | **Permit Center contact** — `816-513-1500 option 3` printed on S1 | Department context only |

The schedule prints its effective date on its face: **2012-05-01** (Ord #080766). The only other date on the sheet is the print stamp, which is the same day.

## The fee, as read (S1)

### Header, as printed

> PERMIT FEE SCHEDULE — COMMERCIAL PROJECTS INCLUDING RESIDENTIAL BUILDINGS WITH THREE OR MORE DWELLING UNITS
> Building, Mechanical, Plumbing, Electrical, Elevator and Fire Protection Permit Fees
> PERMIT FEES SHALL BE CALCULATED SEPARATELY FOR EACH BUILDING
> (Printed 05/01/2012 from Ord #080766 eff. 05/01/2012)

> At the time of building permit application, separate construction valuation shall be provided for each trade of work involved in the project.

So one ladder, charged once per building **per trade**, on that trade's declared valuation.

### The ladder, as printed

**$1 to $50,000 — flat table, one amount per $1,000 bracket (51 brackets):**

| Valuation | Fee |
| --- | --- |
| $1–500 | $48.00 |
| $501–2,000 | $86.00 |
| $2,001–3,000 | $98.50 |
| $3,001–4,000 | $111.00 |
| $4,001–5,000 | $123.50 |
| $5,001–6,000 | $136.00 |
| $6,001–7,000 | $148.50 |
| … $12.50 per additional $1,000 or bracket … |
| $49,001–50,000 | $686.00 |

Every $1,000 above $5,000 buys one more $12.50 step until $50,000 (the sheet prints each bracket; the arithmetic step above $5,000 is uniformly $12.50).

**$50,001–$200,000:** "$686.00 for the first $50,000 plus $12.50 for each additional $1,000 or fraction thereof, to and including $200,000."

**$200,001–$1,000,000:** "$2,561.00 for the first $200,000 plus $8.30 for each additional $1,000 or fraction thereof, to and including $1,000,000."

**$1,000,001 and over:** "$9,201.00 for the first $1,000,000 plus $3.60 for each additional $1,000 or fraction thereof."

The three bands above $50,000 **chain exactly:**

- $686.00 + 150 × $12.50 = $2,561.00 at $200,000 — the second band's printed base;
- $2,561.00 + 800 × $8.30 = $9,201.00 at $1,000,000 — the third band's printed base.

So the whole ladder from $1 to infinity is continuous. The two higher `or fraction thereof` clauses mean the chargeable amount above the threshold is rounded **up** to the next $1,000 before the rate is applied; the $1–$50,000 table, which prints brackets rather than a rate, is applied by bracket — one flat amount per $1,000 window.

### The plan-review block, as printed

> PLAN REVIEW FEES: A fee of **one-half of the permit cost** is required to be paid at the time plans are submitted for plan review, **this will be credited towards the total fee when the permit is issued.**

This is a **prepayment share credited back**, not a second charge. At application the applicant pays half the permit fee; at issuance the permit fee is due less that half. The sentence is why no `plan_review` rule adds 50% here — adding it would double-count.

Five ancillary fees on the same page, all flat:

| Row, as printed | Amount |
| --- | --- |
| Fee for review of changes to previously approved plans | $50.00 |
| Minimum partial permit fee (dividing a job into two or more partial permits) | $77.00 minimum (each partial permit is a separate permit fee, not a supplement) |
| Minimum supplemental permit fee | $50.00 |
| Resubmittal plan review — one-eighth of the total fee, when previously identified deficiencies remain uncorrected | $272.00 maximum |
| Express plan review, paid prior to meeting with the plan reviewer | $69.00 |

The partial/supplemental sentences are quoted because they are the reason the minimums are not floors on the ladder: a partial permit *replaces* the schedule's calculation with its own minimum.

## The mechanism, named

- **Basis:** `valuation` in cents, per trade per building.
- **Shape $1–$50,000:** `tiered_table` — 51 flat brackets.
- **Shape above $50,000:** `per_thousand` with `baseCents + $X per $1,000 above threshold, or fraction thereof` (threshold = 50,000 / 200,000 / 1,000,000; increment = $1,000; rates 1250 / 830 / 360 cents per $1,000).
- **Plan review:** `credited prepayment` — no rule adds it; page names it as a payment schedule.
- **Ancillary flats:** issuance/change/express/resubmittal/partial/supplemental — named, not papered over.

A separate ladder for residential buildings of one or two dwelling units was **not found** on this sheet, and `kcmo.gov/city-hall/departments/city-planning-development/building-and-development-fee-schedule` answered 403, so no residential counterpart is claimed.

## Readings this dataset depends on

1. The $1–$50,000 table is 51 flat brackets, not a rate on the whole valuation; the three bands above it are `base + rate per $1,000 above threshold, or fraction thereof`.
2. The bands chain: $686, $2,561 and $9,201 are derivable from the band below, not printed over a seam.
3. `or fraction thereof` above $50,000 means round up to whole $1,000; the flat table does not state it and is applied by bracket.
4. Plan review is credited, not charged in addition — which is why this jurisdiction contributes no `plan_review` `percent` rule.
5. The sheet covers all six trades on one ladder, with one valuation per trade per building.

## Effective dates on record

| Instrument | Date carried | Why |
| --- | --- | --- |
| Permit Fee Schedule — Commercial Projects | **2012-05-01** | Printed as `eff. 05/01/2012` from Ord #080766, on the sheet's own last line. |
| Verification | **2026-09-26** | Every source re-read this day. |

## Not modelled (named on the schedule, never papered over)

- Plan review half-fee (credited prepayment, see above) — described on every page, never charged as a rule.
- Fee for review of changes $50; minimum partial $77; minimum supplemental $50; resubmittal 1/8 max $272; express $69 — ancillary flat rows.
- The $77 partial-permit minimum and $50 supplemental minimum — each is a floor on a *different instrument* (a partial or supplemental permit), not on the ladder's own $48 minimum.
- State or county surcharge — none is printed on this sheet, and the search for `surcharge`, `technology` and `training` on S1 comes back empty.
- Residential one- and two-family dwellings — no KC schedule for them was readable from this sandbox, so no amount is estimated.

## Open questions

1. Whether Kansas City publishes a separate one- and two-family residential ladder and where it sits — the fee-schedule hub that should link it answers 403 from this sandbox, and no codifier consolidation was found that reproduces the commercial ladder's own brackets.
2. Whether the 2012 ladder has been amended since Ord #080766 — the sheet prints the ordinance number beside the print date and no amending ordinance was located from this host; a newer printing would replace the 2012 effective date.
3. Whether the $77 partial-permit minimum and $50 supplemental minimum are adjusted by CPI or council action — neither figure appears in the code excerpts fetched, and the sheet gives no adjustment formula.
