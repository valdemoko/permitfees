# Virginia Beach, Virginia — research record

**Research pass:** Virginia (first jurisdiction)
**Read on:** 2026-09-26
**Jurisdiction:** City of Virginia Beach (independent city, fips 810 locator
within VA fips 51; Permits & Inspections, Planning Department issues the
permits citywide)
**Pages published:** building, electrical, plumbing

## The instruments

Two official fee-sheet PDFs (rev. **Jul-2025**, linked from the City's own
permit pages) and the City's trade-permits web page:

| Document | URL | Read |
| --- | --- | --- |
| Residential Building Permit Fees (rev. Jul-2025) | `https://s3.us-east-1.amazonaws.com/virginia-beach-departments-docs/planning/Divisions-Offices/Permits_Inspections/Documents/Residential-Permit-Fees.pdf` | `pdftotext -layout` |
| Commercial Building Permit Fees (rev. Jul-2025) | `https://s3.us-east-1.amazonaws.com/virginia-beach-departments-docs/planning/Divisions-Offices/Permits_Inspections/Documents/Commercial-Permit-Fees.pdf` | `pdftotext -layout` |
| Trades Permits (electrical / plumbing / mechanical) | `https://planning.virginiabeach.gov/permits/trade` | live HTML |

## Fee facts

Residential building (new & additions), heated living area:

> "**$50.00 plus $7.00 per 100 square feet of area or fraction thereof**"

Non-heated residential: **$50.00 plus $4.00 per 100 sq ft** (or fraction).
Residential alterations: **$50.00 plus $5.00 per $1,000 of construction value**
(or fraction thereof).

Commercial building (new & additions): **$50.00 plus $8.00 per 100 sq ft** of
area or fraction thereof; non-heated commercial storage $50 + $4/100 sq ft;
commercial alterations $50 + $5.00 per $1,000 of construction value (or
fraction).

Both sheets then print the shared tail:

> "Residential Plan Review Fee … $100.00 / Commercial Plan Review Fee … $200.00
> Certificate of Occupancy … $75.00 · Re-inspection … $75.00
> **A 2% State Levy will be assessed on the permit fees listed above.
> A $10.00 Technology Fee is assessed on all permits.**"

Trade permits (City web page):

- **Electrical.** New service single-phase **$50.00 plus $20.00 per 50 amps**
  (50 A $70; 100 A $90; 150 A $110; 200 A $130; 300 A $170; 400 A $210);
  three-phase $80 + $20/50 A. Change of service = ½ of new-service fee.
  Additions/repairs: **$50.00 plus $5.00 per circuit**; generator circuit,
  temp pole, subfed panel, panel replacement/relocation, meter swap, pool
  bonding, trailer service, OH-to-UG: **$50.00 each**. Re-inspection $75;
  work-without-permit admin fee $250. **2% state levy + $10.00 technology fee.**
- **Plumbing.** **$50.00 plus $6.00 per fixture/drain**; water or sewer line
  conversion/replacement $50; on-site collector/distribution lines $80 (one
  building) or $50 + $50/building; caps $50; ULF toilets $30 first three +
  $5 each additional. Plan review $50; re-inspection $75; admin $250.
  **2% state levy + $10.00 technology fee.**
- Mechanical: $50 + $5 per $1,000 of construction value with a printed ladder
  ($55 at $1,000 through $160 at $23,000 — note the sheet's own typo at
  $24,000, printed $160 again); plan review $50; same 2% + $10.

## Rounding reading

Every area and value row on both sheets prints "**or fraction thereof**", so
the 100-sq-ft and $1,000 steps round **up** (the Fargo reading). The seed
models the residential heated rate with `incrementCents`/`incrementUnits`
rounding up and charges the 2% state levy and $10 technology fee as their own
components on all three pages.

## Discrepancies and how they were resolved

1. **Blog claims of "$8–$10 per $1,000 valuation" for commercial building.**
   The City's sheet prices commercial new construction by **area** ($8 per
   100 sq ft), not by valuation; only *alterations* use the $5/$1,000 value
   rate. The area reading is charged.
2. **The mechanical ladder's $24,000 row prints $160** (same as $23,000's
   $165 would suggest a typo) — mechanical is out of scope for this seed's
   three pages, and the typo is recorded here rather than charged.
3. **Pool fees repeat the residential formula** ($50 + $5/$1,000 of
   construction value) — they are a scoped application of the same building
   schedule, carried as a FAQ rather than a separate rule.

## Seed mapping

- Building: `percent` on square footage at 700 cents per 100 sq ft
  (`incrementCents: 100` sq-ft units with threshold 0, round up) + $50.00
  base; plan review $100 residential / $200 commercial as `tiered_table` on
  occupancy; 2% state levy (`percent` on `fee_subtotal`, priority after base)
  and $10 technology fee.
- Electrical: `per_unit` on `custom.amperage_50` blocks ($20 per 50 amps or
  fraction, modelled as `amperage` basis per-unit with incrementUnits 50) +
  $50 base; $5 per circuit `per_unit`; 2% levy + $10 tech fee. The worked
  example uses a 200 A service: $50 + 4 × $20 = $130 + $10 + 2% = $142.80.
- Plumbing: `per_unit` on fixtures ($50 base + $6/fixture); 2% levy + $10
  tech fee.
