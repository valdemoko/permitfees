# Louisiana — Baton Rouge (City-Parish of East Baton Rouge)

**Status:** researched & seeded. **Last verified:** 2026-09-26.

## 1. Authority

- Issuer: **City of Baton Rouge & Parish of East Baton Rouge** — consolidated
  city-parish government. Department of Development, Inspection & Permits division
  (brla.gov, P.O. Box 1471, Baton Rouge, LA 70821; 225-389-3000).
- Primary text: the City-Parish's own **Permit & Inspection Fees** page
  (brla.gov/2694/Permit-Inspection-Fees), read in full from a live browser session.
  The consolidated Code of Ordinances (Municode) defers fee amounts to the schedule
  the Department publishes; the CivicPlus-hosted page is the operative schedule.
- Fire Prevention fees are the Baton Rouge Fire Department's own lines on the same
  page — recorded, not modelled (fire system acceptance is a separate regime).

## 2. Fee mechanisms (all from the Department's page)

### All permits (flat)

- **Technology fee: $25.00** (every permit).
- Flood zone determination $25.00; reinspection $75.00; Board of Appeals $100.00;
  Board of Adjustment $100.00; after-hours $150.00. Credit-card payment adds 5%.

### Residential (new building, remodel, addition, accessory)

- **$0.80 per square foot + $125** — new building **$125 minimum**; remodel/addition/
  accessory **$250 minimum** (EMP's — electrical/mechanical/plumbing trade permits —
  not included). The page prints "$.0.80" for remodel (a typo read as $0.80; both
  columns agree on the rate).
- **Residential trade permits (mechanical, electrical, plumbing, gas): $125.00 flat each.**
- Other named rows: occupancy $125; demolition $125; pool $500; fence $250;
  generator $500; solar $375; manufactured home $500; driveway $250; house moving
  $125 + remodel permit; small lot grading $250.

### Commercial

- **Permit fee, valuation-based, $100 minimum**:
  - ≤ $100,000: **$5 per thousand**
  - $100,001–$500,000: **$500 + $4 per thousand above $100,000** (chained: 100 × $5 = $500)
  - > $500,000: **$2,100 + $1.50 per thousand above $500,000** (chained: 500 + 400 × $4 = $2,100)
- **Plan review fee, valuation-based, $100 minimum**:
  - ≤ $500,000: **$3 per thousand**
  - > $500,000: **$1,500 + $0.50 per thousand above $500,000** (chained: 500 × $3 = $1,500)
- **Commercial MEP trade permits (mechanical, electrical, plumbing), valuation-based flat:**
  - ≤ $100,000: **$125**
  - $100,001–$500,000: **$300**
  - $500,001–$2,000,000: **$400**
  - > $2,000,000: **$600**

### Reading notes

- The commercial bands chain exactly; verified band by band and asserted.
- The page prints no "or fraction thereof" on any per-thousand rate → all per-thousand
  bands **prorate**. A $150,000 commercial permit is $500 + $4 × 50 = $700 exactly;
  a $150,001 permit prorates to $700.004 → $700.00 (half-up rounding at the cent).
- Residential is priced by **area**, commercial by **valuation** — two mechanisms in
  one department, each with its own permit page shape.
- Commercial plan review is charged **in addition to** the commercial permit fee
  (both are stated as fees due; neither is a credit).

## 3. Worked-example arithmetic (asserted in tests)

1. **Building (residential)** — 2,500 sq ft new house: 2,500 × $0.80 = $2,000.00 +
   $125 = **$2,125.00** (above the $125 minimum); + $25 technology = **$2,150.00**.
2. **Building (commercial)** — $220,000: $500 + $4 × 120 = **$980.00**; plan review
   $3 × 220 = **$660.00**; technology $25. Total **$1,665.00**.
3. **Electrical (commercial MEP)** — $220,000 valuation: flat **$300.00**; + $25
   technology = **$325.00**.

## 4. Discrepancies and open questions

- The page's "Minimum Fee is $100" header sits above both commercial tables; the
  residential table carries its own $125/$250 minimums per row. Modelled literally:
  $100 floor on commercial permit and plan review, row minimums on residential.
- The "$.0.80" typo on the Remodel row is read as $0.80 (both other rows and the
  minimum arithmetic confirm); noted rather than silently corrected.
- The Plan Review fee's "$1,500 dollars" prints "dollars" on both bands ("$1,500
  dollars plus $0.50") — read as $1,500.
- Ordinance section: the Code of Ordinances defers to the published schedule; no
  chapter/section number prints on the fee page itself, so the source's URL is the
  citation of record.

## 5. Sources (all .gov)

| Key | Source | URL |
| --- | --- | --- |
| `brla-permit-fees` | Permit & Inspection Fees — Department of Development, Inspection & Permits | https://www.brla.gov/2694/Permit-Inspection-Fees |
| `brla-inspection-permits` | Inspection & Permits division page | https://www.brla.gov/ (Department directory) |
| `brla-code` | Consolidated Code of Ordinances (Municode consolidation) | https://library.municode.com/la/baton_rouge,_east_baton_rouge_parish/codes/code_of_ordinances |
