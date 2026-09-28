# Meridian, Idaho — Permit Fee Research

**Jurisdiction:** City of Meridian, Ada County, ID
**Department:** Community Development — Building Services Division, 33 E. Broadway Ave, Suite 102, Meridian, ID 83642, (208) 884-5534
**FIPS:** State 16 (ID); Ada County 16001

## Sources (all primary, .org official city domain)

1. **City Fees Schedule portal** (`apps.meridiancity.org/CITYFEEWEB/`): the official fee database, each row carrying its adopting resolution number — Building Structural 1.1 and Building Electrical 1.2 rows under **Resolution 18-2110** (with later amendments 20-2230, 20-2234, 22-2306). Retrieved via the browser (Cloudflare blocks plain curl); full table captured and parsed.
2. **Residential Fee Calculation Worksheet** (`meridiancity.org/media/1o3dqvgg/residential-fee-calculation-worksheet-6-1-2026.xlsx`, dated 6-1-2026) — read with openpyxl including cell formulas, which print the exact arithmetic: `=IF(OR(C15="Yes",C14="Yes"),C19*94.06,0)+(C21*36.91)+(C23*16)+(C25*16)+C26` and `=(D26/1000*5.5)+50`.
3. **New Commercial Fee Calculation Worksheet** (`/media/jbopem3k/new-commercial-fee-calculation-worksheet-6-1-2026.xlsx`) — formulas: `=50+(5.5*(C15/1000))`, plan review `=G15*0.65`, fire plan review `=G15*0.3`, police impact `IF(C16="Restaurant/Retail",1.23,...0.19)` per sq ft, fire impact 1.29/0.96 per sq ft.
4. **Fee Schedules, Calculators & Estimating page** (`meridiancity.org/community-development/building/fee-schedules-calculators-estimating/`) — links the worksheets and the CITYFEEWEB full schedule.

## Building permit (Resolution 18-2110, sec. 1.1)

**One formula for everything, on project value: $50.00 base + $5.50 per $1,000 of project value, or fraction thereof.** ("Residential/Commercial Permit Fee Calculation Formula: $50 base fee plus $5.50 add'l for ea $1,000 of project value or fraction thereof.")

Valuation guidance per square foot (used to derive project value):
- Residential/commercial valuation: **$94.06 per sq ft** (per BVD table; the residential worksheet multiplies livable area × $94.06 for new homes/rebuilds)
- Additions: **$72.00 per sq ft**
- Garages: **$36.91 per sq ft**
- Covered patios / storage sheds: **$16.00 per sq ft**

Other structural rows: application fee $50 (residential additions/remodels/garages/sheds; commercial < $20k; multi-family < $20k) or $150 (new residential projects; commercial/multi-family > $20k); commercial plan check **65% of the building permit fee** (applied to permit); demo fee $50; re-inspection $45; double fee (re-inspection) $90; Certificate of Occupancy (no construction) $110; TCO $114.75; mobile home set-up $50; woodstoves $50; permit extension $50; after-hours inspection $52.93/hour; work without permit → double fee.

Note: the commercial worksheet adds a **fire plan review at 30% of the building permit fee** and (from the portal's rows) fire-plan-review is a separate Fire-department line. The seed prices the building permit and the 65% commercial plan check (and 20%? — no: Meridian has no residential plan-check line in the structural schedule; the residential worksheet charges none). A residential plan review line does not exist in the published structural schedule — the residential worksheet's only review-adjacent fee is none. Modelled honestly: commercial 65% only.

## Electrical permit (sec. 1.2, Resolution 18-2110)

- **New residential** (single family dwelling, includes everything within the structure and attached garage wired at the same time): ≤ 200 A service **$120**; 201–400 A **$210**; 401 A and above → commercial fee schedule.
- **Existing residential**: $40 permit fee plus **$10 for each branch circuit**.
- **Mobile home service**: $50 permit fee plus $10 per each additional branch circuit.
- **Multi-family dwellings — duplexes**: $210. Three (3) or more multi-family units: **$120 per building plus $60 per unit**.
- **Commercial, industrial and other** (by total wiring cost — all labor and material): ≤ $2,000 → **$40 plus 2.5% of total wiring cost**; $2,001–$10,000 → **$100 plus 1% of total wiring cost**; > $10,000 → **$180 plus ½ of 1% of that portion** over $10,000.
- **Hot tubs, swimming pools and other spas**: $40. **Ground grid**: $40.
- **Temporary power poles** (Res. 20-2230): residential ≤ 200 A, one location — **$40**; residential > 200 A and all commercial → commercial schedule.
- Re-inspection $45; after-hours $57.41/hour; double fee (work without permit) minimum.

## Mechanical permit (sec. 1.3, Resolution 18-2110)

- **Base fee applied to all permits: $50.**
- **Fixtures and appliances** (furnace, furnace-AC combo, heat pump, A/C, evaporative cooler, unit heater, space heater, decorative gas appliance, incinerator, boiler, pool heater and similar): **first $35, each additional $15.**
- **Fuel gas piping** (fixture/appliance outlets): first $15, each additional $5.00.
- **Exhaust and ventilation ducts** (dryer, range hood, cook stove, bath fan): first $15, each additional $5.
- **Fireplace-only permit** (gas piping in place): $50 base + $35 first fixture + $15 each additional.
- **Multi-family and commercial** (per IBC), by job value: ≤ $20,000 → **3% of job value plus $50 base**; $20,000.01–$100,000 → **2% of job value over $20,000 plus $650**; $100,000–$200,000 → **1% of job value over $100,000 plus $2,250**; ≥ $200,000 → **½% of job value over $200,000 plus $3,250**.
- Re-inspection $45; double fee $90.

## Plumbing permit (sec. 1.4, Resolution 18-2110)

- **Permit fee (each living unit)**: each single family dwelling or living unit in an apartment/condo/townhouse — **$30**; **per fixture $8**; replacement per fixture $8; backflow device $8; water conditioner $30 (+ $8 per additional unit); fixture replacement permit $30; lawn sprinkler permit $30; mobile home connect/reconnect $40; residential sewer/water combo (one inspection) $50; residential sewer line or replacement $38.
- **Project valuation table** (commercial-scale plumbing): ≤ $20,000 → **3% of job value and $30**; $20,000–$100,000 → **2% of job value over $20,000 plus $630**; $100,000–$200,000 → **1% of job value over $100,000 plus $2,230**; ≥ $200,000 → **½% of job value over $200,000 plus $3,230**.
- Re-inspections $45; double fee for work without permit.

## Engine modelling notes

- Building: one `per_thousand` rule — baseCents 5_000, thresholdCents 100_000, centsPerThousand 550, incrementCents 100_000, no gate (the formula IS the schedule). Project value carried on `valuation`.
- Commercial plan check: `percent` on `permit_fee`, rateBps 6_500, gated `occupancy neq residential`.
- Electrical new-residential: three flat rows gated on `custom.amperage` bands (≤ 200 → 12_000; 201-400 → 21_000; > 400 → excluded to commercial) plus `occupancy eq residential` + `work_type new_construction`-style gate via `custom.new_residential: true` (any amperage-bearing default charges the ≤200 row).
- Electrical multi-family 3+: `per_unit` on `dwelling_units` at 6_000 gated `units >= 3` plus flat 12_000 per building (gated `units >= 3`); duplex flat 21_000 gated `units == 2` via `units lte 2` + `units gte 2`.
- Electrical existing residential: flat 4_000 + `per_unit` on `circuits` at 1_000 gated `custom.circuits gte 1`.
- Electrical commercial: three `percent` rules on `valuation` (wiring cost) with bases and thresholds: 2.5% ({250,10000}) threshold 10_000 base 4_000 gated ≤ 200_000; 1% ({100,10000}) threshold 200_000 base 10_000 gated ≤ 1_000_000; 0.5% ({50,10000}) threshold 1_000_000 base 18_000. Hot tub/ground grid flats at 4_000 gated on flags; temp pole ≤ 200 A flat 4_000.
- Mechanical: base 5_000 flat + first/additional appliance pair — `per_unit` on `heating_appliances` at 1_500 gated `gte 1` plus a first-unit surcharge of 2_000 (35 − 15) to express "first $35, each additional $15" — modelled as per_unit 1_500 with baseCents via companion flat 2_000 gated gte 1. Gas piping `per_unit` on `gas_units` 500 gated gte 1 + first-surcharges 1_000. Commercial/multi-family value ladder: four `percent` rules on `valuation` with bases (5_000 / 65_000 / 225_000 / 325_000) and thresholds (0 / 2_000_000 / 10_000_000 / 20_000_000).
- Plumbing: per-living-unit `per_unit` on `dwelling_units` at 3_000; per-fixture `per_unit` on `fixtures` at 800; backflow `per_unit` on `backflow_devices` at 800; combo/sewer/lawn-sprinkler flats; commercial value ladder like mechanical with plumbing's own bases (3_000 / 63_000 / 223_000 / 323_000).
- Worked examples: building new 2,000 sq ft home (value 2,000 × 94.06 = $188,120 → $50 + 189 × $5.50 = $1,089.50); electrical new SFD 200 A → $120; plumbing 2 living units + 5 fixtures → 2 × $30 + 5 × $8 = $100.
