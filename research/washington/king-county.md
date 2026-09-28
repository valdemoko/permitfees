# King County, Washington — research record

Third state of pass 9, and the first jurisdiction on this site whose **three permit types
come from three different authorities**. Read 2026-09-24. Everything here is quoted from a
document published by one of those three bodies; nothing is inferred from a neighbouring
jurisdiction.

## 0. Sources, with hashes and how they were read

| # | Document | URL | Read |
|---|---|---|---|
| S1 | 2026 Fee Guide 04, *Commercial or Multifamily Residential Building Construction* (December 2025) | `cdn.kingcounty.gov/-/media/king-county/depts/local-services/permits/fee-guides/04-fee-2026-commercial-multifamily-building-construction.pdf` | `pdftotext` in `-raw`, `-layout` and `-table`; sha256 begins `72ef257d6aab25d1` |
| S2 | 2026 Fee Guide 02, *Single Family Residential Construction* (December 2025) | `.../fee-guides/02-fee-2026-single-family-residential-construction.pdf` | same three modes; sha256 begins `2a1e0f0f0a2b4e5b` |
| S3 | Public Health — Seattle & King County, *Plumbing and Gas Piping Program* fees, effective January 1, 2026 | `cdn.kingcounty.gov/-/media/king-county/depts/dph/documents/health-safety/environmental-health/fees/plumbing-gas-piping-service-fees-through-2026.pdf` | same three modes; sha256 begins `8c320351a45027d9` |
| S4 | WAC 296-46B-906, *Inspection fees* | `app.leg.wa.gov/wac/default.aspx?cite=296-46B-906` | official citation page, whole section |

All four URLs answered **200 / application/pdf** (HTML for S4) on 2026-09-24.

## 1. Who charges what

This is the finding the jurisdiction contributes, and it is stated by the county itself.
Guide 02's margin says:

> "Electrical permits are issued by the WA State Department of Labor & Industries. On-site
> septic design and installation, plumbing, and gas-piping permits are issued by
> Seattle-King County Public Health."

So: **building and mechanical** are the Permitting Division's, **plumbing and gas piping**
are the health department's, and **electrical is the state's**. No permit type on this
county's pages cites a county electrical schedule, because there is none.

## 2. The building fee is two valuation tables, and both are charged

Guide 04's method paragraph decides the question:

> "The permit technician or plans examiner determines the County valuation of the building
> construction or mechanical installation of a project, using data tables that list the
> standard construction cost per square foot, by type of construction and occupancy, or
> other data provided by the permit applicant. … The County valuation is then applied to
> the fee tables below to determine the required plan review and inspection fees."

The tables' own column headings on page 1 are **Application** and **Permit**, which is
what makes "both" the reading rather than "either":

| Valuation | Plan review | Inspection |
|---|---|---|
| $1 – $25,000.00 | $103 + $27.40 per $1,000 | $183 + $44.60 per $1,000 |
| $25,000.01 – $50,000.00 | $788 + $20.60 per $1,000 over $25,000 | $1,298 + $30.80 per $1,000 over $25,000 |
| $50,000.01 – $100,000.00 | $1,303 + $13.70 per $1,000 over $50,000 | $2,068 + $21.70 per $1,000 over $50,000 |
| $100,000.01 – $500,000.00 | $1,988 + $11.40 per $1,000 over $100,000 | $3,153 + $17.10 per $1,000 over $100,000 |
| $500,000.01 – $1,000,000.00 | $6,548 + $8.00 per $1,000 over $500,000 | $9,993 + $13.70 per $1,000 over $500,000 |
| $1,000,000.01 – $5,000,000.00 | $10,548 + $6.85 per $1,000 over $1,000,000 | $16,843 + $10.30 per $1,000 over $1,000,000 |
| Over $5,000,000.00 | $37,948 + $5.70 per $1,000 over $5,000,000 | $58,043 + $7.40 per $1,000 over $5,000,000 |

**Every seam of both tables closes**, which is asserted band by band in the tests and again
from PostgreSQL in `npm run db:verify`:

* review: `$788`, `$1,303`, `$1,988`, `$6,548`, `$10,548`, `$37,948`
* inspection: `$1,298`, `$2,068`, `$3,153`, `$9,993`, `$16,843`, `$58,043`

## 3. The reading that differs from every other schedule here

Neither guide contains the string **"fraction"** — the count is zero in both. Boulder
City's table, Clark County's table and Denver's table all print *"or fraction thereof"*
exactly where they mean a valuation is rounded up to the next step, and Houston's brackets
are built on the phrase.

Modelled as printed, a rate "per $1,000 of Value" is therefore charged on the **exact**
number of thousands: $12,500 pays for 12.5 of them — $445.50 of review and $740.50 of
inspection — where rounding up to thirteen would give $459.20 and $762.80. The seam
figures are identical either way, because they are multiples of $1,000. The building page
states both figures and says the guides are silent rather than explicit, so a reader can
see which reading produced the number they are looking at.

## 4. The state surcharge, at two amounts from two guides

| Guide | Row |
|---|---|
| 04 (commercial/multifamily) | "State building code surcharge: minimum fee per building permit **$25**; fee per additional dwelling unit permitted **$2**" |
| 02 (single family) | "State building code surcharge (b) **$6.50**" |

RCW 19.27.085 resolves the apparent conflict with the same two figures — $6.50 on each
residential building permit, $25.00 on each commercial one, plus $2.00 for each residential
unit after the first — so both guides are right for the occupancy each covers. Modelled as
two rules gated on `custom.building_class`, with an unnamed permission priced as the
commercial row because that is the guide these pages quote.

Guide 04's footnote (d) is what excludes it from mechanical: *"Per WAC 51-05-200, the State
surcharge is not applicable to mechanical or fire protection systems, or tank permits, but
is applicable to permits for the demolition of buildings."*

## 5. Plumbing and gas piping — Public Health

S3's rows, read in the two modes that agree (`-layout` mis-pairs the value column against
the page header; `-table` pairs each label with its own value):

| Item | Fee |
|---|---|
| Plumbing/Backflow Permit | $137 plus $27 per fixture |
| Gas Piping/Medical Gas Permit | $137 plus $27 per outlet |
| Plan review (both) | $273 per hour |
| Inspection outside regular hours | $410 per hour |
| Requested site visit, no permit | $273 |
| Permit renewal | $68 |
| Administrative fee (modification, correction, refund) | $41 |
| Already Built Construction (ABC) Permit | $273 plus $55 per fixture/outlet |
| Re-inspection | $137 |

**The base is a charge, not a first fixture.** The row attaches no allowance to the $137,
so one fixture is $164.00 and three are $218.00. That single reading changes the price of
every small permit, so it is stated on the page with its consequence.

The same document prices plumbing permits **in Seattle**, which is why the two Washington
payloads share the rule records instead of transcribing the schedule twice —
`tests/content/seattle-seed.test.ts` compares them by code and by config.

## 6. Electrical — WAC 296-46B-906

Outside Seattle, Tacoma and Tacoma Power's service area, electrical permits are the state's.
The section names its own unit in its first sentence — *"To calculate inspection fees, the
amperage is based on the conductor ampacity or the overcurrent device rating"* — and it
runs **two tracks** that price the same amperage differently:

| Work | Residential | Commercial |
|---|---|---|
| Altered service, 0–200 A | $109.90 | $129.40 |
| Altered service, 201–600 A | $161.00 | $303.60 |
| Altered service, 601–1000 A | $242.70 | $457.90 |
| Altered service, over 1000 A | — | $508.60 |
| Circuits | $78.80 for the first four, $8.20 each after | $100.50 for the first five per panel, $8.20 each after |
| Temporary service, 0–60 / 61–100 / 101–200 / 201–400 / 401–600 / 601+ | $69.10 / $78.80 / $100.50 / $119.90 / $161.00 / $182.60 | same |
| Portable generator transfer equipment | $109.90 | $109.90 |
| Low-voltage and telecom, first 2,500 sq ft | $69.10 | $69.10 |
| Signs, first and each additional | $59.50 / $27.90 | same |
| Over 600 volts, per permit | $100.50 surcharge | same |
| Plan review | **35% of the permit fee** (9)(a) | same |

**The residential circuit row carries a published ceiling**, the only one in this dataset on
a sum rather than a line: *"Total cost of the alterations in an individual panel should not
exceed the cost of a complete altered service or feeder of the same rating."* It is modelled
as a $109.90 maximum — the 0–200 A altered-service rate — and the test asserts that two
hundred circuits stops there instead of growing.

**Not modelled, and named on the page instead:** the residential new-construction rows
(per square foot: $119.90 for the first 1,300 sq ft, $38.20 for each additional 500), the
per-2,500-sq-ft low-voltage increments, the heater, transformer, car-charger and irrigation
tables, annual permits, and every hourly and trip fee.

## 7. What was built

* `src/content/kingcounty/fee-rules.ts` — the two valuation tables, three surcharge rules,
  the health department's plumbing and gas rows, and the state's electrical rows.
* `src/content/kingcounty/index.ts` — three permit pages (building, electrical, plumbing),
  four sources, six requirements, sixteen verifications. Worked examples, computed by the
  engine before the prose was written: **$30,846.00** (building, $1,200,000),
  **$219.80** (electrical, 200 A service plus transfer equipment), **$218.00** (plumbing,
  three fixtures).
* No engine change. The split fee needed `plan_review` and `inspection` component types,
  both of which already existed, and nothing else was required — the fourth jurisdiction in
  a row expressible with the existing primitives.

## 8. Open questions

1. **Rounding inside a thousand.** Neither guide says "or fraction thereof". The site takes
   the literal reading (prorated) and states the alternative and its size; a definitive
   answer would come from the county's fee calculator, which is not published.
2. **Whether the county accepts a declared valuation.** The method paragraph says it may use
   its own cost tables instead of "other data provided by the permit applicant", without
   saying when. The pages compute from the figure entered and say so.
3. **The commercial circuits row is charged per branch-circuit panel**, and the modelled
   rule prices one panel's circuits because the page cannot know how many panels a job has.
4. **Guide 02's rows are quoted but not modelled**, because they are priced per square foot
   and per named job while these pages take a valuation and a count.
5. **Whether King County issues only in unincorporated territory** — as with Clark County,
   the guides describe unincorporated King County, and incorporated cities are separate
   authorities.

## 9. Cities checked and not published

| Jurisdiction | Blocked by |
|---|---|
| Spokane | `my.spokanecity.org` and the municipal code host answered nothing this environment could read (curl exit 47 on every attempt, with and without a browser user-agent). Its fee table is reported in the Spokane Municipal Code. |
| Bellevue | Publishes a permit fee *calculator* rather than a schedule; no fee table was readable in the HTML. |
| Tacoma | Same class: `tacomapermits.org` prices through a calculator, and the schedule PDF could not be located. |

None is written off, and no figure from any of them appears on the site. Seattle is in King
County and is published as the second jurisdiction of this state.
