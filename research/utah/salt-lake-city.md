# Salt Lake City, Utah — research record

**Research pass:** Utah (first jurisdiction)
**Read on:** 2026-09-26
**Jurisdiction:** Salt Lake City Corporation (Salt Lake County; the Building
Services & Civil Enforcement division, 451 South State Street, Room 215,
issues building and trade permits)
**Pages published:** building, electrical, plumbing

## The instrument

Salt Lake City prices permits on the **Consolidated Fee Schedule**, adopted by
Ordinance 2011-25 and amended periodically by the City Council. The current
version was **amended 06/16/2026 by Ord. 2026-29** (read 2026-09-26 from
tools.slc.gov/feeschedule, the City's official fee schedule viewer). The
schedule is codified through Salt Lake City Code chapters — building permit
fees at **SLC Code 18.32.035** (the schedule's own citation column), plan
review at 18.32.035/18.20.050, electrical at 18.36, plumbing at 18.56,
mechanical at 18.52. The Building Services "Building Permit Applications"
page (slc.gov/buildingservices/building-permits) links the Consolidated Fee
Schedule as the fee authority.

**Building permit fees** (18.32.035, total project valuation):

| Total project valuation | Fee |
| --- | --- |
| $0.01 – $500.00 | $55.97 |
| $500.01 – $2,000.00 | $55.97 for the first $500 plus **$4.00 per $100** or fraction thereof, to and including $2,000 |
| $2,000.01 – $25,000.00 | $115.97 for the first $2,000 plus **$20.00 per $1,000** or fraction thereof, to and including $25,000 |
| $25,000.01 – $50,000.00 | $575.97 for the first $25,000 plus **$14.00 per $1,000** or fraction thereof, to and including $50,000 |
| $50,000.01 – $100,000.00 | $925.97 for the first $50,000 plus **$10.00 per $1,000** or fraction thereof, to and including $100,000 |
| $100,000.01 – $500,000.00 | $1,425.97 for the first $100,000 plus **$8.00 per $1,000** or fraction thereof, to and including $500,000 |
| $500,000.01 – $1,000,000.00 | $4,625.97 for the first $500,000 plus **$7.00 per $1,000** or fraction thereof, to and including $1,000,000 |
| $1,000,000.01 and up | $8,125.97 for the first $1,000,000 plus **$5.00 per $1,000** or fraction thereof, above |

**Band bases chain exactly** ($55.97 + 15 × $4.00 = $115.97; $115.97 + 23 ×
$20.00 = $575.97; $575.97 + 25 × $14.00 = $925.97; $925.97 + 50 × $10.00 =
$1,425.97; $1,425.97 + 400 × $8.00 = $4,625.97; $4,625.97 + 500 × $7.00 =
$8,125.97). Each band is a separate printed row, so the seed gates each leg on
its own valuation range — unlike Honolulu's Table 18-A, whose bands read the
total valuation. SLC's rows are written as chained bases with rates on the
excess, so the marginal-ladder encoding is exact.

**Plan review fee:** "65% of building permit fee" (18.32.035). **Hourly plan
review fee: $146** (deferred items, project changes after issuance, and plan
reviews for non-building permits). Expedited building plan review: twice the
standard plan review fee (18.20.050).

**Electrical permits** (18.36.100/.120): Base fee **$59** (the Base Fee row
appears under both commercial and residential electrical). Commercial and
industrial: minimum fee (up to $1,600 of work) **$40**. Residential: minor
remodel/additional circuits $40; service change $40; homeowner electrical
remodel permit $48.

**Plumbing permits** (18.56.040): Base fee **$59** (schedule citation column
shows 18.56.040 for the plumbing base fee row).

## Discrepancies and how they were resolved

1. **Third-party figures ("$115.97 + $20/k", "$59 base trade fee", "65% plan
   review")** matched the official Consolidated Fee Schedule read directly
   from tools.slc.gov — the primary source governs and confirms them.
2. **Amendment currency.** The schedule as read is the 06/16/2026 amendment
   (Ord. 2026-29); older ordinance PDFs on webdme.slcgov.com (Ord. 2025-xx)
   are superseded. Figures transcribed from the current viewer.
3. **Band encoding.** SLC's building ladder prints per-band bases with "or
   fraction thereof" language; it is encoded as a marginal ladder (each leg
   gated on the valuation range, rate applied to the excess), which
   reproduces the schedule's own chained bases exactly at every seam.
4. **The $55.97 flat row.** The first row ("$0.01 – $500.00: $55.97") is a
   flat charge; encoded as a flat rule gated lte $500, distinct from the
   per-$100 second row.

## Sources actually read

| # | Source | URL | Type | Notes |
| --- | --- | --- | --- | --- |
| 1 | Salt Lake City Consolidated Fee Schedule (amended 06/16/2026, Ord. 2026-29) | `https://tools.slc.gov/feeschedule/` | municipal_website | Official fee schedule viewer; building ladder 18.32.035, plan review 65%, electrical/plumbing base fees read verbatim |
| 2 | Building Services — Building Permit Applications | `https://www.slc.gov/buildingservices/building-permits/` | municipal_website | Issuing office; links Consolidated Fee Schedule and fee calculation forms |
| 3 | SLC Code 18.20.020 — Fees (building permit fees based on total valuation per consolidated fee schedule) | `https://codelibrary.amlegal.com/codes/saltlakecityut/latest/saltlakecity_ut/0-0-0-59987` | municipal_code | Confirms valuation basis and the consolidated fee schedule as the fee authority |

## Seed mapping

- `saltlakecity/fee-rules.ts`: SLC-BLD-500 (flat $55.97), SLC-BLD-2K/25K/50K/100K/500K/1M/UP (per_thousand legs, chained bases), SLC-PLAN-REVIEW (65% of permit_fee), SLC-ELEC-BASE ($59 flat), SLC-ELEC-MIN ($40 flat residential minor work), SLC-PLUMB-BASE ($59 flat).
- `saltlakecity/index.ts`: jurisdiction `saltlakecity`, county `salt-lake-county`, state `ut`; 3 published pages.
- Worked examples: building $150,000 → $1,425.97 + 50 × $8.00 = $1,825.97; electrical base $59.00; plumbing base $59.00.
