# Raleigh, North Carolina — permit fee research

Status: **modelled, seeded and published.** Three pages (`/north-carolina/raleigh/…`):
building, electrical, plumbing.

Last verified: **2026-09-25**. One source, a city-published PDF that carries the whole
schedule and bears its own fiscal year.

This is the first North Carolina jurisdiction, and the third distinct way a **trade
permit** is priced in this dataset: Houston and Dallas price by item, San Diego prices
by unit of work, Sacramento prices a flat named scope — and **Raleigh prices a trade
permit as a percentage of the building permit fee it belongs to.** The City prints
"49%" as the electrical permit for new residential construction and "56%" as the
plumbing permit for new commercial construction, both against a figure the same
schedule calculates somewhere else.

## 0. How the source was obtained

| # | Document | URL | Kind | Effective |
| --- | --- | --- | --- | --- |
| R1 | *Development Fee Guide — Comprehensive Guide for Raleigh Development Fees* | `cityofraleigh0drupal.blob.core.usgovcloudapi.net/drupal-prod/COR15/DevelopmentFeeGuide.pdf` | fee_schedule_pdf | 2026-07-01 to 2027-06-30 |

The guide is a 55-page PDF of 993,935 bytes, sha256 `b10565b399afaede…`, linked from
`raleighnc.gov/permits/services/development-fee-guide-and-calculator` and from the
City's FY27 announcement. Its own cover page states the period: **"July 1, 2026 -
June 30, 2027"**, which is the effective date recorded for the schedule — a fiscal-year
document, so no inference from a "previous versions" list was needed, as San Diego's
bulletins were.

Extracted with `pdftotext -raw`, which reads the fee tables row by row (Fee, Rate,
FY27 Cost, Unit of Measure) in a single pass. A second `-layout` pass was run to
confirm that the FY27 column is the right-hand one of the two cost columns: every row
prints a **Prior Year Cost** and an **FY27 Cost**, and taking the wrong one would
publish last year's schedule throughout. The guide also carries a **Technology Fee
Reference Guide** near its end that restates every fee as `Fee` and `Fee Total = Fee +
Surcharge`, which is how the surcharge in §2 was read rather than assumed.

## 1. Authority

| Field | Value |
| --- | --- |
| Jurisdiction | City of Raleigh, Wake County, North Carolina |
| Type | city |
| Issuing department | Planning and Development Department (`planning@raleighnc.gov`, 919-996-2682) |
| Website | `raleighnc.gov` |

Raleigh issues its own building, electrical, plumbing and mechanical permits for work
inside the City. Addresses in unincorporated Wake County are a different authority
(Wake County), which is **not** modelled here; only the city is. The County publishes
its own `Permits & Inspections Fee Schedule`, which includes a different trade rule —
"a single permit fee for electrical, mechanical and plumbing, regardless of number of
trades involved" — so the two authorities are not interchangeable and the pages say
the guide is the City's.

## 2. Mechanism — what makes this jurisdiction different

**A trade permit is a percentage of another component.** The Building and Safety table
prints, for new construction:

| | Residential | Commercial |
| --- | --- | --- |
| Building permit | 0.38% of calculated construction value | tiered, see below |
| **Electrical permit** | **49% of the calculated building permit** | **100%** |
| Plumbing permit | 34% of the calculated building permit | 56% |
| Mechanical permit | 28% | 76% (not modelled anywhere on this site) |
| Plan review | 57% of the calculated building permit | 65% |

For alterations and repairs the same relationship is printed three more times as
**Level 1 / 2 / 3**, at 28%, 50% and 75% of the calculated building permit, with the
note "Minimum Permit fees per trade do apply. Fee is calculated by (Building Permit Fee
x rate %)".

The commercial building permit itself is a three-band schedule:

> Tier 1, $0 – $500,000: **0.21%** of calculated construction value
> Tier 2, $500,001 – $10,000,000: **$1,050.00 base** + **0.06%** of value
> Tier 3, $10,000,001 and up: **$7,250.00 base** + **0.01%** of value

**A 4% technology surcharge.** The guide's own Technology Fee Reference Guide states:
"A 4% technology surcharge is applied to the following development fees to support the
technology resources that allow for permitting in the City of Raleigh", and then
restates every Building and Safety fee as `Fee` and `Fee Total = Fee + Surcharge`.
$150.00 becomes $156.00, $124.00 becomes $129.00, $215.00 becomes $224.00 — the 4%
reads against the whole fee, not against a component, which is the shape the engine's
`fee_subtotal` basis exists for.

**A per-trade minimum.** "Minimum Trade Permit Fee — Any fee not specifically listed as
an individual fee will be charged at the minimum permit fee. This also applies to a
minimum building plan review fee. Which are assessed as per trade per review.
**$124.00**". This is what floors a 49%-of-a-small-building-permit electrical permit.

**A valuation the City adjusts.** "Permit fees are based off a valuation calculation for
construction projects. This calculation uses nationally … Building Valuation Data (BVD)
… The City of Raleigh further adjusts the calculated values by using a regional cost
adjustment … Currently, our valuation calculation **reduces the national average by
12.4%**." The guide carries the ICC's Building Valuation Data tables as an appendix.

## 3. What is modelled

**R1 — building:** the residential new-construction rate (0.38%), the three commercial
tiers with their base fees, and the plan review percentage (57% residential, 65%
commercial) as its own component.

**R1 — electrical:** the percentage-of-building-permit relationship for new
construction (49% residential, 100% commercial), the three alteration levels (28%, 50%,
75%), the $124 per-trade minimum, and the stand-alone electrical permits the schedule
enumerates — commercial generator $396, parking lot lighting $320, UPS system $340,
co-locate on a building $300.

**R1 — plumbing:** the same relationship at 34% residential and 56% commercial, the
alteration levels, the $124 minimum, and the stand-alone plumbing permits — fixture
replacement/retro-fit at 26–50 fixtures $236, 51–100 $297, over 100 $325, and the
plumbing utility inspection $133.

**The 4% technology surcharge**, on every fee above.

## 4. What is deliberately **not** modelled, and named on the pages instead

- **Mechanical permits.** The guide prices them at 28% and 76% of the calculated
  building permit, and no page of this site prices a mechanical permit in any
  jurisdiction.
- **The conditional service fees** — $215 per trade per unit commercial, $157
  residential — which are charges for a service the City provides rather than a
  permit rate, and the special projects fee of 0.25% of construction value per trade.
- **Fire Department, Parks, Raleigh Water, Stormwater and Transportation fees**, which
  are four other departments' schedules inside the same document: water and sewer tap
  fees, meter installation, capital facility fees, thoroughfare and right-of-way fees,
  tree fees in lieu, and the fire marshal's own permits.
- **Express services and hourly charges** — Express Plan Review at $1,146 per hour,
  the alternative means of compliance hourly rate $173, after-hours inspections,
  re-inspections at $122, and the pre-construction meeting at $419.
- **The enumerated fees this site does not price** — demolition $150, manufactured
  homes $415, building relocation $472, temporary and partial certificates of
  occupancy, the stocking permit, and the Pony Express expedited review.
- **The BVD appendix itself.** The site takes the applicant's declared valuation, as
  it does everywhere else, and states that Raleigh reduces the national average by
  12.4% rather than reproducing the tables.

## 5. Open questions

1. **How the trade percentage is computed without dragging the building permit into the
   electrical page.** "49% of the calculated building permit" is a percentage of a
   number the schedule computes elsewhere. Charging the building permit as a component
   of the *electrical* page would make that page's total 149% of the building permit,
   which is not what an electrical permit costs. So the percentage is carried into the
   rule as the exact product of the two published rates — 49% × 0.38% of construction
   value — derived in code from the two named constants so neither can drift alone, and
   the rule's own description states the City's wording. The composition is exact for
   new construction, where the relationship is printed as a single pair of rates.
2. **Whether a building permit has its own published minimum.** The guide's
   introduction says "no building permit fee will fall below the established minimum",
   and the only minimum it prints is the $124 **Minimum Trade Permit Fee**, which is
   described as applying to "any fee not specifically listed as an individual fee … per
   trade per review". No separate building minimum is printed anywhere in the document.
   This site therefore floors the trade permits at $124 and does not floor the building
   permit, and says so. Whether a $10,000 residential project pays 0.38% ($38.00) or
   $124.00 is not answerable from the guide.
3. **Tier 2 and Tier 3 are alternatives, not a marginal ladder.** $1,050 + 0.06% at
   exactly $500,001 is $1,350, and 0.21% at $500,000 is $1,050, so the bands do not
   meet; and $7,250 at $10,000,001 against Tier 2's $7,050 at $10,000,000 leaves a
   $200 step. Each band is therefore modelled as its own formula over its own range,
   which is what the rows print, and the discontinuity is recorded rather than
   smoothed.
4. **The alteration levels' unit.** The Level 1/2/3 rows are printed with the unit "%
   Of Calculated Building Permit" and the note "Minimum Permit fees per trade do
   apply", which reads as a per-trade percentage rather than as one fee for the
   alteration as a whole. They are modelled as the electrical and plumbing share of a
   building permit for an alteration of that level; the pages say the City describes
   them per trade.
5. **The Technology Fee Reference Guide's scope.** The guide says the surcharge applies
   "to the following development fees" and then lists them. This site applies it to the
   fees it models, all of which are in that list, and does not apply it to fees from
   other departments — which the guide's own listing supports, since water, sewer,
   thoroughfare and stormwater fees are in their own sections.
