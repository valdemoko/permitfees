# Savannah, Georgia — research record

**Research pass:** Georgia (second jurisdiction)
**Read on:** 2026-09-26
**Jurisdiction:** City of Savannah (Chatham County, fips 13051; Development
Services Department issues the permits citywide)
**Pages published:** building, electrical, plumbing

## The instrument

One document: the **Revenue Ordinance** (the City's annual ordinance to assess
and levy taxes and raise revenues), Article P "Inspection Fees". The copy read
is the codification PDF served by the City's code platform (EncodePlus,
`online.encodeplus.com/regs/savannah-ga`), 2022 Revenue Ordinance; the 2021
document (dated 2021-11-23) carries the same Article P figures and the 2022
copy is the one indexed by search. Sections used:

- **Section 1 — Building Permit Fees.** Cost of construction is defined as
  floor area × a construction cost multiplier: **$80.00/sq ft residential**,
  **$125.00/sq ft commercial**. The all-inclusive permit fee is a three-band
  marginal ladder: **$8.00 per $1,000** of cost up to $5,000,000, **plus $4.00
  per $1,000** between $5M and $10M, **plus $2.00 per $1,000** above $10M.
  **Minimum all-inclusive fee $40.00.**
- **Section 1(B)(1) — Plan Review Fee**, a flat valuation-banded table:
  $0–6,000 → $40; $6,001–25,000 → $50; $25,001–50,000 → $100; $50,001–100,000
  → $150; $100,001–500,000 → $200; $500,001–1,000,000 → $300; $1,000,001–5M →
  $500; $5,000,001–10M → $1,000; over $10M → $2,000.
- **Section 2 — Electrical Permit Fees.** "No electrical permit fees shall be
  charged for work which has been included in the scope of a building permit.
  For work not covered by a building permit, the fees for electrical permits
  shall be **$8.00 per $1,000.00, and any fraction thereof, of total work
  cost. The minimum fee shall be $40.00.**"
- **Section 4 — Plumbing Permit Fees.** Same shape and same amounts:
  **$8.00 per $1,000.00, and any fraction thereof**, minimum **$40.00**.
- **Section 19 — Technology Fee.** "**$5.00 per permit** shall be added to all
  All-Inclusive Building permits, Standalone Trade permits, …" collected with
  the plan review fee or at issuance.
- **Section 8 — Extra inspection fees** ($50 first re-inspection, $100 second
  and each subsequent) — context, not charged in the three worked examples.

## Rounding readings (the "any fraction thereof" question)

The trade sections print "**and any fraction thereof**" in the same sentence
as the $8.00 rate, so every trade permit rounds the work cost **up** to the
next whole $1,000 before applying the rate — the Fargo reading. The building
ladder prints no fraction phrase band-by-band; the marginal engine applies
each band's rate to its own slice exactly, so the building side prorates
within bands (the Bismarck reading). Both readings are carried in the rules
and asserted in the tests.

## Discrepancies and how they were resolved

1. **A 2016 GSU practicum describes "+$65 trade fees … and $50 administrative
   fee."** That predates the current Revenue Ordinance; the ordinance's own
   Section 2/4 amounts ($8/$1,000, $40 min) and Section 19's $5.00 technology
   fee are charged, and the older figure is recorded here only as history.
2. **"All-inclusive" vs the trade carve-out.** Section 1 calls the building
   fee "all-inclusive", and Sections 2–4 exempt work already inside a building
   permit's scope. The seed therefore prices standalone trade permits from the
   trade sections and notes the exemption on the electrical and plumbing
   pages — a homeowner with a building permit pays nothing extra for trades
   inside its scope.
3. **Expedited plan review (50% of the permit fee, $1,000 minimum)** exists
   for commercial applications that choose it (Section 1(B)(3)); it is an
   *option*, so the seed models the regular path and documents the expedited
   row in the FAQ.

## Sources actually read

| # | Source | URL | Type | Notes |
| --- | --- | --- | --- | --- |
| 1 | Revenue Ordinance codification PDF (Article P) | `https://online.encodeplus.com/regs/savannah-ga/doclibrary.aspx?id=6c9013ee-e3c6-4847-b66d-c0d730e114a8` | fee_schedule_pdf (official codification) | Read with `pdftotext -layout`; 1.5 MB; Article P at pages 51–57 |
| 2 | City of Savannah Code of Ordinances document library | `https://online.encodeplus.com/regs/savannah-ga/doc-viewer.aspx?secid=1493` | municipal_code | Names the annual revenue ordinance as the fee-setting instrument |

## Seed mapping

- Building: `tiered_marginal` on valuation with rates 800 / 400 / 200 cents
  per $1,000 across the three bands ($0–5M, $5–10M, $10M+), $40 minimum as a
  `permit_minimum` shortfall, $5 technology fee flat, plan review as a
  `tiered_table` on valuation of the nine published bands.
- Electrical: `per_thousand` at 800 cents per $1,000 with
  `incrementCents: 100_000` ("any fraction thereof"), $40 minimum shortfall,
  $5 technology fee.
- Plumbing: identical shape to electrical.
