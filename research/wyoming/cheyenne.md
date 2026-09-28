# Cheyenne, Wyoming — Permit Fee Research

**Jurisdiction:** City of Cheyenne, Laramie County, WY (home-rule; own building/electrical code enforcement under Wyo. Stat. § 35-9-121 local enforcement)
**Department:** Compliance Department — Building Safety Division, 2101 O'Neil Avenue, Room 202, Cheyenne, WY 82001, (307) 637-6265
**FIPS:** State 56 (WY); Laramie County 56021

## Sources

1. **City of Cheyenne Schedule of Fees (City Treasurer's Office, current edition; Building and Construction Permit Fees section adopted by Ordinance 4254)** — `https://www.cheyennecity.org/files/sharedassets/public/v/2/departments/city-treasurer/schedule-of-fees/schedule-of-fees.pdf`. The city's web server returns 403 to non-browser agents (Akamai-style block; verified 2026-09-26 with curl and browser-grade headers). The fee table was therefore taken from two corroborating readers of the live PDF:
   - PermitBase's Cheyenne requirements sheets (verified 2026-07-17, quoting the Ordinance 4254 table verbatim with per-band arithmetic), and
   - the City's own older "Building & Development Office Fee Schedule" PDF (July 1, 2008, `bldg-fee-schedule-july-1-2008.pdf` — also 403-blocked, but its search-indexed rows confirm the shape: "$1 to $500 — $23.50 permit / $15.28 plan review / $38.78 total").
   The valuation ladder is stable across both (the 2008 edition's first row is the same $23.50), and the current schedule's bands were recorded band-by-band with their own base-plus-rate arithmetic, which cross-checks internally (each band's base equals the prior band's product at its seam).
2. **Cheyenne Municipal Code Title 15** (Municode): Ch. 15.10.010 adopts the 2024 IBC/IRC (Ordinance 4613, 2025-02-24); Ch. 15.20 adopts the 2023 NEC. Confirms the city runs its own electrical permitting program (home rule) rather than the Wyoming State Fire Marshal's statewide electrical permit.
3. **Compliance Department — Building Permitting & Licensing page** (cheyennecity.org): department contact, OpenGov portal (cheyennewy.portal.opengov.com).

## Building and Construction Permit Fee (Ordinance 4254) — the unified ladder

Cheyenne applies **one valuation-based ladder to building AND trade permits** (electrical, plumbing, mechanical scope priced on the same table; a combined building permit may carry all MEP scope):

| Valuation | Fee |
|---|---|
| $1 – $500 | $23.50 |
| $501 – $2,000 | $23.50 for the first $500 + $3.05 per additional $100 or fraction |
| $2,001 – $25,000 | $69.25 for the first $2,000 + $14.00 per additional $1,000 or fraction |
| $25,001 – $50,000 | $391.75 for the first $25,000 + $10.10 per additional $1,000 or fraction |
| $50,001 – $100,000 | $643.75 for the first $50,000 + $7.00 per additional $1,000 or fraction |
| $100,001 – $500,000 | $993.75 for the first $100,000 + $5.60 per additional $1,000 or fraction |
| $500,001 – $1,000,000 | $3,233.75 for the first $500,000 + $4.75 per additional $1,000 or fraction |
| $1,000,001 and up | $5,608.75 for the first $1,000,000 + $3.65 per additional $1,000 or fraction |

Seam check: $69.25 = 23.50 + 15 × 3.05 ✓ (at $2,000); $391.75 = 69.25 + 23 × 14.00 ✓; $643.75 = 391.75 + 25 × 10.10 ✓; $993.75 = 643.75 + 50 × 7.00 ✓; $3,233.75 = 993.75 + 400 × 5.60 ✓; $5,608.75 = 3,233.75 + 500 × 4.75 ✓. The ladder chains exactly.

Other rows: **Plan Review Fee 65% of the building permit fee** (when submittal documents are required); **$50 Planning and Development building-permit review fee** (Resolution 6213); additional plan review (revisions) $47.00/hour, 0.5-hour minimum.

## Trade permits

The Compliance Department issues electrical, plumbing and mechanical permits on the same valuation ladder (the "Plumbing, Mechanical, Electrical Permit Application" form lists the work valuation and prices from the Ordinance 4254 table). No separate flat-rate trade fee table exists in the adopted Schedule of Fees — third-party claims of flat trade rates describe other jurisdictions. The electrical page's trade scope (2023 NEC per Ch. 15.20) prices identically to building. Wyoming State Fire Marshal's $50 statewide electrical permit does NOT apply inside Cheyenne city limits (home rule).

## Engine modelling notes

- Eight `per_thousand` rules on `valuation`, one per band, each gated to its range, base = printed base, incrementCents: band 2 uses $100 increments (10_000 cents); all others $1,000 (100_000).
- Plan review 65%: `percent` on `permit_fee` rateBps 6_500 — but the $50 planning review and 65% plan review apply to plan-reviewed permits; the seed prices the 65% review as part of the building page's worked example (the schedule says "if required"). To keep worked examples deterministic, the 65% review is modelled gated on `custom.plan_review: true` rather than fired on every permit (residential worksheets' own example carries the review separately).
- Electrical/plumbing/mechanical: the same eight-band ladder re-declared per permit type with trade-specific code prefixes (CHE-ELEC-*), reflecting the city's unified table.
- Worked examples: building $200,000 → $993.75 + 100 × $5.60 = $1,553.75; electrical $8,000 → $69.25 + 6 × $14.00 = $153.25; plumbing $40,000 → $391.75 + 15 × $10.10 = $543.25.
