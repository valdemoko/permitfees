# Providence, Rhode Island — research record

**Research pass:** Rhode Island (first jurisdiction)
**Read on:** 2026-09-26
**Jurisdiction:** City of Providence (Providence County, fips 44007; the
Department of Inspection & Standards, 780 Allens Avenue, issues building,
mechanical, electrical, plumbing, moving and demolition permits)
**Pages published:** building, electrical, plumbing

## The instrument

Rhode Island prices municipal building permit fees **statewide**: regulation
**510-RICR-00-00-21 "State Wide Permitting Fee"** (R.I. Gen. Laws §
23-27.3-119; ACTIVE RULE, amendment effective **2023-12-10**) says at §21.6:
"The building permit fees assessed by municipalities shall be computed in
accordance with the fee schedules listed in § 21.12 of this Part herein," and
prints one fee schedule per municipality — all 39. The regulation is the
City's own fee law of the land; the City's department pages point applicants
to e-Permitting and to the fee schedule rather than printing a competing one.

**City of Providence schedule** (§21.12(A)(28)):

| Project valuation | Fee |
| --- | --- |
| $1 to $10,000 | $23.00 per $1,000 |
| From $10,001 to $50,000 | $230 + $21.00 per $1,000 exceeding $10k |
| From $50,001 to no limit | $1,070 + $19.00 per $1,000 exceeding $50k |
| Note | **$125 minimum fee** |

Band bases chain exactly ($23.00 × 10 = $230; $230 + $21.00 × 40 = $1,070).

**Also on the record:** Providence's own Permit Fee Calculator page exists
(providenceri.gov/permit-fee-calculator-lk) and the Department of Inspection &
Standards FAQ tells applicants to "see the fee schedule for Building,
Plumbing, Mechanical" — the state regulation's schedule is that schedule.
The e-Permitting portal (launched for building, mechanical, electrical,
plumbing, moving and demolition permits) is the application route.

## Discrepancies and how they were resolved

1. **Blog figures ("$500 to $25,000+ commercial", "$100 base application
   fee")** are third-party estimates. The regulation's printed schedule
   governs; no separate base application fee appears in it.
2. **Rounding of partial thousands.** The regulation prints band boundaries
   only. The seed uses the project-wide "per $1,000" convention (each
   partial thousand rounds up, `incrementCents: 100_000`), which matches the
   whole-dollar row convention of the regulation's own band bases; worked
   examples use exact band checkpoints to stay unambiguous.
3. **Trades.** The statewide schedule prices permit fees by valuation for
   the municipality; the City FAQ names Building, Plumbing and Mechanical
   fee schedules together. The seed prices electrical and plumbing permits
   on the same ladder and documents the statewide instrument.

## Sources actually read

| # | Source | URL | Type | Notes |
| --- | --- | --- | --- | --- |
| 1 | 510-RICR-00-00-21 State Wide Permitting Fee (§21.12(A)(28)) | `https://rules.sos.ri.gov/regulations/part/510-00-00-21` | municipal_code | Active rule, amendment eff. 2023-12-10; Providence schedule read verbatim |
| 2 | Department of Inspection & Standards — Permit Inspections | `https://www.providenceri.gov/inspection/permit-inspections/` | municipal_website | 780 Allens Avenue; hours and contact |
| 3 | Providence e-Permitting | `https://www.providenceri.gov/inspection/online-permitting/` | permit_portal | Building, mechanical, electrical, plumbing, moving and demolition permits online |
