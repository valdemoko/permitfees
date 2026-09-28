# New Haven, Connecticut — research record

**Research pass:** Connecticut (second jurisdiction)
**Read on:** 2026-09-26
**Jurisdiction:** City of New Haven (New Haven County, fips 09009; the
Building Department — Office of Building Inspection & Enforcement, 200 Orange
Street, 5th Floor — issues building and trade permits citywide)
**Pages published:** building, electrical, plumbing

## The instrument

The City's "Building Department Applications" page
(`https://www.newhavenct.gov/business/building-development/permits-applications`,
redirecting to `/government/departments-divisions/office-of-building-inspection-enforcement/building-department-applications`)
states: **"Building, Sign, Electrical, Plumbing, HVAC Permit Fees follow the
below fee schedule"** and links two PDFs (residential and commercial). The
live host serves HTTP 403 to scripted requests; the page was read in a real
browser session and the PDFs were downloaded through it. Each PDF was
extracted with pdftotext.

## Fee facts

**1&2 Family (Residential) Fee Schedule** (`showpublisheddocument/3546`,
PDF produced from Excel, metadata "FEES, NEW, SCHEDULE, 2016", created
2020-09-29): a printed linear table from $1,000 to $160,000 of construction
cost, in $1,000 steps:

| Construction cost | Permit fee |
| --- | --- |
| $1,000 | $50.26 |
| $2,000 | $77.52 |
| $3,000 | $104.78 |
| $10,000 | $295.60 |
| $50,000 | $1,386.00 |
| $100,000 | $2,749.00 |
| $160,000 | $4,384.60 |

Every step is exactly **+$27.26 per $1,000**, and the first step is $50.26 —
so the schedule is the linear formula **$50.26 for the first $1,000 plus
$27.26 per additional $1,000** (fraction steps read upward: the table prices
at each completed thousand; the $0.26 rider marks the state education
surcharge, $0.26 per $1,000, riding every row).

**3+ Family, Commercial, Mixed-Use Fee Schedule** (`showpublisheddocument/3540`,
same series): same shape, **$55.26 for the first $1,000 plus $35.26 per
additional $1,000** ($1,000 → $55.26, $2,000 → $90.52, $10,000 → $372.60,
$50,000 → $1,783.00, $100,000 → $3,546.00).

The page's own scope line puts **Building, Sign, Electrical, Plumbing, HVAC**
permits on these two schedules — the trade permits are priced from the same
cost-of-construction tables (which is also why the City publishes separate
"Trade Minimum Acceptable Cost" sheets, below).

**Trade Minimum Acceptable Cost sheets** — these fix the *cost estimate* the
fee tables read, not a separate fee:

- Electrical (`showpublisheddocument/23120`, rev. current): minimum acceptable
  cost estimates — 100 A service $1,900; 200 A service $3,000; single-family
  200 A $12,000; two-family 200 A $15,000; three-family 200 A $18,000; kitchen
  gut $3,200; solar $4/watt.
- Plumbing & Heating (`showpublisheddocument/23122`, revision date printed
  09/06/2024): full bath $5,000; new house (1.5 bath, Pex) $9,500; water
  heater $1,100; per fixture $800; boiler replacement $5,500; full hot-water
  system $8,500; etc.

**Certificates:** Residential C/O $50.00 for the first new unit + $30.00 each
additional; commercial $55.00 per 20,000 sq ft + $35.00 per additional 10,000;
Certificate of Approval (Completion) $30.00. Demolition has its own two
schedules.

## Discrepancies and how they were resolved

1. **The fees are per-$1,000 lines, not "50–65% plan review" blog figures.**
   The City's own PDFs are linear cost tables; no plan-review percentage is
   published on either sheet.
2. **The $0.26 rider.** The fractional $x.26 endings reproduce Connecticut's
   state education surcharge ($0.26 per $1,000, CT DAS). The seed prices the
   printed total rows (which already include the rider) rather than adding a
   separate surcharge component.
3. **Trade permits.** No separate trade *fee* table exists — the fee schedule
   line names electrical/plumbing/HVAC on the same cost tables, and the
   "minimum cost" sheets are estimate floors. The seed prices trades from the
   residential/commercial cost tables and documents the minimum-cost sheets
   in prose.

## Seed mapping

- Building: two `per_thousand` legs on valuation — residential
  (`$50.26 + $27.26/k`) gated `occupancy eq residential`; commercial
  (`$55.26 + $35.26/k`) gated `occupancy neq residential`. The first-$1,000
  base is the `baseCents`; the "per additional $1,000" is a
  `thresholdCents: 100_000` with `incrementCents: 100_000` (partial thousands
  read up to the next row, matching the table's completed-thousand rows).
- Electrical / plumbing: the same two legs (the page's scope line names the
  trades on these schedules).
- The C/O, Certificate of Approval and minimum-cost sheets are named in
  prose, not modelled.

## Sources actually read

| # | Source | URL | Type | Notes |
| --- | --- | --- | --- | --- |
| 1 | Building Department Applications (fees section) | `https://www.newhavenct.gov/business/building-development/permits-applications` | municipal_website | "Building, Sign, Electrical, Plumbing, HVAC Permit Fees follow the below fee schedule"; read in browser (live host 403s scripts) |
| 2 | 1&2 Family Residential Fee Schedule (PDF) | `https://www.newhavenct.gov/home/showpublisheddocument/3546/637749232702600000` | fee_schedule_pdf | Linear table $1,000–$160,000; $50.26 first, +$27.26 per $1,000 |
| 3 | 3+ Family, Commercial, Mixed-Use Fee Schedule (PDF) | `https://www.newhavenct.gov/home/showpublisheddocument/3540/637749232685900000` | fee_schedule_pdf | Linear table; $55.26 first, +$35.26 per $1,000 |
| 4 | Electrical Minimum Acceptable Costs (PDF) | `https://www.newhavenct.gov/home/showpublisheddocument/23120/638612281033430000` | fee_schedule_pdf | Estimate floors (service sizes, solar $/watt) |
| 5 | Plumbing & Heating Minimum Acceptable Costs (PDF) | `https://www.newhavenct.gov/home/showpublisheddocument/23122/638612278336900000` | fee_schedule_pdf | Estimate floors; revision date 09/06/2024 |
| 6 | Fees Assessed on Building Permits (CT DAS) | `https://portal.ct.gov/das/services/licensing-certification-permitting-and-codes/fees-assessed-on-building-permits` | state_agency | The $0.26-per-$1,000 education surcharge the .26 endings carry |
