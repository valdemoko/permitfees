# Bridgeport, Connecticut — research record

**Research pass:** Connecticut (first jurisdiction)
**Read on:** 2026-09-26
**Jurisdiction:** City of Bridgeport (Fairfield County, fips 09001; the Building
Department issues building and trade permits citywide through the Park City
Portal)
**Pages published:** building, electrical, plumbing

## The instrument

One PDF on the City's own host: **"PERMIT FEES - BUILDING DEPARTMENT -
Effective 5/18/16"** (`https://www.bridgeportct.gov/sites/default/files/2023-03/Bldg_2016_05_18_Fee_Schedule.pdf`,
served 200, 464,261 bytes; text layer extracted with pdftotext). The City's
Building Department page ("Building Permit") points applicants to the Park
City Portal and names the department as the issuing office.

The schedule's own calculation line:

> "To calculate: $60.00 for the 1st $1,000 in Value of Work, plus $30.00 per
> thousand or part of, after first thousand"

## Fee facts (Building Department schedule, effective 2016-05-18)

**Building permit table** (printed, "Value From / To / Fee"):

| Value | Fee |
| --- | --- |
| $0.00–$500.00 | $40.00 |
| $501.00–$1,000.00 | $60.00 |
| $1,001.00–$2,000.00 | $90.00 |
| $2,001.00–$3,000.00 | $120.00 |
| ... linear +$30.00 per $1,000 ... | |
| $50,000 | $1,530.00 |
| $100,000 | $3,030.00 |

The printed table continues in the same linear pattern to roughly $1.49M of
value ($44,820.00) — every row equals $60 + 30 × (thousands above $1,000),
confirming the whole schedule is the two-line formula above. The rows are
purely linear: no band bases, no seam corrections, no maximum row.

**Flat rows on the same schedule:**

- "ALL BUILDING PERMITS ADD $125 for C/O Fee" — the certificate-of-occupancy
  fee added to every building permit.
- "CERTIFICATE OF OCCUPANCY $125.00" (standalone).
- "REPLACEMENT WATER HEATER ONLY: $40.00" (building side).
- "ELECTRICAL WORK, WATER HEATER ONLY: $40.00".
- "NEW SIGN LICENSE: $150.00" / "RENEW SIGN LICENSE: $85.00".

**Trades.** The PDF publishes no separate electrical/plumbing/mechanical
tables. The "ELECTRICAL WORK, WATER HEATER ONLY: $40.00" row shows electrical
permits are issued by the same Building Department against the same
Value-of-Work table (the water-heater-only row is a discounted carve-out for
that single scope). The external corroboration (a local electrical contractor's
published walkthrough) prices Bridgeport electrical permits at "$40 for
$1–$500 of job value, $60 for $501–$1,000, $90 above" — the same table rows.
Plumbing and mechanical permits are issued the same way with the same
schedule; there is no published fixture-based trade table.

**Connecticut state education surcharge.** Connecticut municipalities collect
a $0.26-per-$1,000 education surcharge on building permits (state DAS "Fees
Assessed on Building Permits"). The Bridgeport schedule's printed rows are
round dollars ($40 / $60 / $90) and the printed formula is "$60.00 for the
1st $1,000 plus $30.00 per thousand or part of" — the surcharge is either
absorbed into the City's general fund remittance or not itemized on this
schedule. The seed prices the printed City rows as printed and documents the
surcharge as named-but-not-itemized.

## Discrepancies and how they were resolved

1. **Blog claims of "$15–25 per $1,000 plus 50–65% plan review."** Those are
   generic Connecticut estimates. Bridgeport's own printed schedule is
   $30.00 per $1,000 or part of after the first $1,000, and the schedule
   publishes no plan-review percentage anywhere. No plan review is modelled.
2. **The third-party code-library hit "1705.08 BUILDING PERMIT AND
   INSPECTION FEES" is Bridgeport, WEST VIRGINIA** (amlegal.com/codes/
   bridgeport_wv) — a different city with a $20/$10-per-$1,000 ladder. It was
   excluded on host evidence alone.
3. **The $40 first row.** $0–$500 prices $40.00, not $60: the printed table
   and the printed formula ("$60.00 for the 1st $1,000") disagree below
   $1,000. The table is the more specific instrument, so the seed models a
   $40.00 flat first bracket to $500, $60.00 to $1,000, then the formula.

## Seed mapping

- Building: three `per_thousand` legs on valuation, each gated to its own
  window so exactly one answers — LEG-1 flat-bracket row ($40.00, valuation
  ≤ $500), LEG-2 ($60.00 + $30.00 per $1,000 or part of from $501 to $1,000,
  i.e. the printed $60 row window ≤ $1,000), LEG-3 the formula itself
  ($60.00 base + $30.00 per $1,000 or fraction above $1,000, unbounded). The
  "or part of" is modelled with `incrementCents: 100_000`.
- Electrical: the same Value-of-Work table (the schedule's own
  "ELECTRICAL WORK, WATER HEATER ONLY" row proves the department prices
  electrical from it) — LEG-2' $60.00 + $30.00 per $1,000 or part of above
  $1,000 (the $40/≤$500 row belongs to the water-heater carve-out) plus the
  $40.00 water-heater-only row conditioned on that scope.
- Plumbing: the same $60.00 + $30.00 per $1,000 or part of above $1,000 leg.
- The $125.00 C/O fee and the sign/water-heater rows are named in prose,
  not modelled as components (the C/O attaches to the finished building, not
  to the permit calculator's inputs).

## Sources actually read

| # | Source | URL | Type | Notes |
| --- | --- | --- | --- | --- |
| 1 | PERMIT FEES - BUILDING DEPARTMENT - Effective 5/18/16 | `https://www.bridgeportct.gov/sites/default/files/2023-03/Bldg_2016_05_18_Fee_Schedule.pdf` | fee_schedule_pdf | City's own host, HTTP 200; formula line + full printed table read from the text layer |
| 2 | Building Permit (Building Department) | `https://www.bridgeportct.gov/government/departments/building-department/building-permit` | municipal_website | Names the Park City Portal as the application route and the department as issuing office |
| 3 | Fees Assessed on Building Permits (CT DAS) | `https://portal.ct.gov/das/services/licensing-certification-permitting-and-codes/fees-assessed-on-building-permits` | state_agency | The $0.26-per-$1,000 state education surcharge; named-not-modelled |
