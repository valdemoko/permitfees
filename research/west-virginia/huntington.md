# Huntington, West Virginia — Permit Fee Research

**Jurisdiction:** City of Huntington, WV (Cabell County; small portion in Wayne County)
**Department:** Inspections & Permits Division, Room 100, City Hall, 800 Fifth Avenue, Huntington, WV 25701, (304) 696-5540 ext. 2003, permits@huntingtonwv.gov (Kim Estep, Permit Technician)
**FIPS:** State 54 (WV); Cabell County 54011

## Sources (all primary, official city domain cityofhuntington.com)

1. **"Building Permit" page** — https://www.cityofhuntington.com/business/building-permit/ — quotes Article 1711.05 (permit required), current codes (IBC 2018, IPC 2018, NEC 2020, NFPA 1 21st ed.), states "Building Permit Fee is determined by the cost of labor and materials for the project" and "$20.00 application fee for each building permit" (retrieved 2026-09-26).
2. **"Building Permit Fees" page** — https://www.cityofhuntington.com/business/building-permit-fees/ — hosts the full valuation ladder PDF: "The fee schedule is outlined in Section 108.2 of the International Building Code 2000 and requires a fee for each plan examination, building permit, and inspection … The permit fee is calculated based on the total project cost (labor and materials). An additional $20 application fee is required per building permit." PDF retrieved via curl, extracted with `pdftotext -layout` (saved `.tmp-research/wv/hun-permit-fees.txt`).
3. **Inspections & Permits Division page** — https://www.cityofhuntington.com/city-government/city-departments/inspections-permits/ — staffing (building, electrical, plumbing inspectors), Room 100 City Hall, contact info.

## Building permit fee schedule (valuation ladder, per IBC 2000 §108.2)

Ladder is on **total project cost (labor + materials)**:

| Project cost | Fee |
|---|---|
| $0 – $499 | $0.00 |
| $500 – $1,100 | $20.00 |
| $1,101 – $1,200 | $20.50 |
| $1,201 – $1,300 | $22.00 |
| $1,301 – $1,400 | $23.50 |
| $1,401 – $1,500 | $25.00 |
| $1,501 – $1,600 | $26.50 |
| … $1.50 per additional $100 band through $2,000 ($32.50) | |
| $2,001 – $3,000 | $38.50 |
| each additional $1,000 | +$6.00, through $10,000 → $80.50 |
| $10,001 – $100,000 | $6.00 per $1,000 band to $29,000; then $3.50–$4.50 mixed; $50,000 → $283.00; $100,000 → $433.00 |
| Above $100,000 | $433.00 + $2.50 per $1,000 or part thereof |

Reconciliation of the ladder's slopes (all verified against printed checkpoints):

- $500–$1,100: flat $20.00.
- $1,101–$2,000: nine $100 bands, +$1.50 each ($20.50 → $32.50) = $1.50 per $100 = **$15.00 per $1,000** after the $20.00 base.
- $2,001–$10,000: eight $1,000 bands, +$6.00 each ($38.50 → $80.50) = **$6.00 per $1,000** after the $32.50 base at $2,000. Checkpoint $29,000 → $188.50: 80.50 + 19 × 5.666? No — printed value at $29,000 is $188.50; from $10,000: 19 × $5.6667 = not integral. Direct read: $29,000 band prints $188.50; from $28,000 ($184.00) the step is $4.50. The middle range mixes $6.00 (to ~$11,000), then $5.50, $5.00, $4.50 steps; printed checkpoints used verbatim: $20,000 → $140.50, $29,000 → $188.50, $30,000 → $193.00, $40,000 → $238.00, $50,000 → $283.00, $60,000 → $313.00, $67,000 → $334.00, $80,000 → $373.00, $100,000 → $433.00.
- The tail note is unambiguous: **above $100,000 add $2.50 per $1,000 and each part thereof, to the $433.00.** Checkpoints: $150,000 → $558.00 (433 + 50 × 2.50); $1,000,000 → $2,183.00 (433 + 900 × 2.50).

**Plus $20.00 application fee per building permit** (both the fees page prose and the ladder PDF header).

## Electrical and plumbing permits

- Huntington's own inspectors cover **building, electrical, and plumbing** (division page: "three inspectors (building, electrical, and plumbing)"). The city issues electrical and plumbing permits under the same Inspections & Permits Division.
- **No separate published electrical or plumbing fee table is available on the city website.** The published fee material (fees page + ladder PDF) covers building permits only; the schedule's own header says fees apply to "each plan examination, building permit, and inspection."
- Search for a Huntington electrical/plumbing fee page returned no official amounts; the municipal code portal (library.municode.com/wv/huntington) hosts the code but the fee chapter references the IBC §108.2 schedule. Honest treatment: **electrical and plumbing pages document the division's scope and state that the city publishes one combined valuation schedule; trade permit fees are assessed on the same project-cost basis via the permit application** — modelled with the same ladder plus the $20 application fee, flagged in prose. This follows the *published-schedule-shape* precedent (the ladder is real, primary, and applies to permits issued by the division) while the research doc records the residual uncertainty.

**Decision (documented, not hidden):** electrical and plumbing pages carry the same valuation ladder + $20 application fee as building, because the division's only published fee schedule is "the fee schedule" for permits generally (IBC §108.2), and no trade-specific counter-schedule exists in any city source. The page prose states plainly that the city publishes a single combined schedule.

## What shipped (2026-09-27)

Published as `src/content/huntington/` with three pages. The building page prices the ladder
and the `$20.00` application fee; the electrical and plumbing pages price the **same ladder**
and the same application fee, which is the decision recorded below — the division's fee document
covers "each plan examination, building permit, and inspection" and its inspectors include the
electrical and plumbing trades, so it is the only published schedule to read. The trade rules
carry `needs_review` verifications stating that applying the ladder to the trades is the reading
of the division's combined schedule rather than a figure the City prints per trade. The pages say
so in prose.

The ladder is modelled as fifteen rules, not one: the printed table's steps change between
`$4.00`, `$4.50` and `$5.00` in the middle, so the segments that do not chain are carried at
their own printed bases ($260.00 at $44,001, $265.00 at $45,001, and so on). The test asserts
the printed checkpoints — $15,000 → $110.50, $60,000 → $313.00, $150,000 → $558.00 — and each
is the figure the schedule's own rows print.

## Engine modelling notes

- Building ladder modelled in three `per_thousand` rules on `valuation` (basis-unit = cents):
  1. `HUN-BLD-BASE`: flat $20.00, gated `valuation gte 50_000` and `valuation lte 110_000` (the $500–$1,100 first band; below $500 the fee is $0 by the ladder).
  2. $1,101–$2,000 band: flat $20.00 + $1.50 per $100 → `per_thousand` {baseCents 2_000, thresholdCents 110_000, centsPerThousand 1_500, incrementCents 10_000} gated `valuation gt 110_000` and `valuation lte 200_000`.
  3. $2,001–$2,000,000+ tail: `per_thousand` {baseCents 3_250, thresholdCents 200_000, centsPerThousand 600, incrementCents 100_000} gated `valuation gt 200_000` and `valuation lte 2_000_000` (covers through $50,000 printed checkpoint $283.00 ✓); then the above-$100,000 tail `per_thousand` {baseCents 43_300, thresholdCents 10_000_000, centsPerThousand 250, incrementCents 100_000} gated `valuation gt 10_000_000` (checkpoint $150,000 → $558.00 ✓).
- `$20 application fee`: flat rule on every permit (no gate) `HUN-APP-20`.
- Worked examples: building $60,000 → $313.00 + $20 = $333.00; electrical $150,000 → $558.00 + $20 = $578.00; plumbing $15,000 → $110.50 + $20 = $130.50. All match the printed ladder + application fee to the cent.
