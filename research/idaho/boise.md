# Boise, Idaho — Permit Fee Research

**Jurisdiction:** City of Boise, Ada County, ID
**Department:** Planning & Development Services — Building Division, 150 N Capitol Blvd, Boise, ID 83702, (208) 608-7070, permits@cityofboise.org
**FIPS:** State 16 (ID); Ada County 16001

## Sources (all primary, .gov)

1. **"Boise City Building Code Fee Schedule"** (effective Oct 1, 2023; FY27 redline at `/media/21655/fy27-boise-city-building-code-fee-schedule-10-1-26.pdf` shows Table 1-A unchanged into the proposed FY27 edition):
   `https://www.cityofboise.org/media/17652/final-boise-city-building-code-fee-schedule-10-1-23.pdf`
   Read with `pdftotext -layout` (`.tmp-research/id/boise-fees.txt`). Contains Table 1-A (building permit ladder), commercial plan review at 65%, residential plan review at 20% (1-2 family), solar PV flat $165, reinspection $55, etc.
2. **"Boise City Electrical Code Fee Schedule"** (current: 7-17-19, `/media/8322/final-electrical-code-fee-schedule-7-17-19.pdf`; FY27 redline `/media/21651/...10-1-26.pdf` shows the proposed uplifts — NOT used here):
   Read with pdftotext (`.tmp-research/id/boise-elec-cur.txt`).
3. **"Boise City Plumbing Code Fee Schedule"** (current: 10-1-21, `/media/8324/final-plumbing-code-fee-schedule-10-1-21.pdf`).
4. **"Boise City Mechanical Code and Fuel Gas Code Fee Schedule"** (current: 10-1-21, `/media/8323/final-mechanical-code-and-fuel-gas-code-fee-schedule-10-1-21.pdf`).

**Version discipline:** the FY27 "proposed" schedules (posted 2026 as redlines, marked "Oct. 2026") are NOT yet adopted — the redline PDFs show old/strikethrough text merged with proposed figures. This seed prices the CURRENT adopted schedules (electrical Oct. 2019 as amended 7-17-19; plumbing/mechanical Oct. 2021; building Oct. 2023). The redlines' higher figures ($57 branch circuit vs $55; $32.33 vs $32 base) were deliberately not modelled.

## Building permit (Table 1-A, valuation ladder)

| Total valuation | Fee |
|---|---|
| $1.00 – $2,000.00 | $26.37 for the first $500.00 + $2.95 per additional $100 or fraction, to and including $2,000 |
| $2,001.00 – $25,000.00 | $70.76 for the first $2,000.00 + $12.71 per additional $1,000 or fraction, to and including $25,000 |
| $25,001.00 – $50,000.00 | $362.80 for the first $25,000.00 + $9.30 per additional $1,000 or fraction, to and including $50,000 |
| $50,001.00 – $100,000.00 | $595.30 for the first $50,000.00 + $6.35 per additional $1,000 or fraction, to and including $100,000 |
| $100,001.00 and up | $913.09 for the first $100,000.00 + $5.17 per additional $1,000 or fraction |

Plan review: **commercial 65% of the building permit fee** (item 8); **residential 1- and 2-family dwellings, townhouses and their accessory structures 20% of the permit fee** (item 9). Residential solar PV plan review/inspection permit fee: $165 flat (item 11). Reinspection: $55. Special investigation (work before permit): 100% of the permit fee. Energy Code Inspection Fee $55.

## Electrical permit (Electrical Code Fee Schedule, Table 1-a/2-b/3-a/5-a/6-b)

- **New residential construction** (SFD, duplex, multifamily ≤ 8 units), per dwelling unit by square footage of the structure (per unit): ≤ 2,500 sq ft **$135**; 2,501–3,500 **$155**; 3,501–4,500 **$175**; ≥ 4,501 **$210 plus $65 for each additional 1,000 sq ft or portion over 4,501**.
- **Single branch circuit** in existing residential (3-8 units): flat **$55** (Table 2-b; no base fee).
- Other residential flat rows (Table 3-a, no base fee): more than one branch circuit (addition/alteration/repair/fixture replacement) **$110**; photovoltaic system **$110**; residential elevator/dumbwaiter **$110**; radiant floor heating **$110**; swimming pools **$165** (three inspections); hot tub/spa **$110**; misc residential **$110**.
  NOTE: pdftotext's column layout interleaved the values; the sheet's rows read $110/$110/$110/$165/$110 across the seven row labels with the pool row (3 inspections) at $165. Cross-checked against the FY27 redline, which shows the current values $110.00 and $165 with proposed uplifts marked separately.
- **Residential service equipment** (Table 5-a, standalone service/panel changes): ≤ 200 A **$55**; > 200 A **$65**; temporary service **$40**.
- **Commercial**: base fee **$14.00** plus Table 6-b on total wiring cost: ≤ $2,000 → **$22.83 plus 2.28% of wiring cost over $100** (the table's first row carries a $100 allowance); $2,000–$10,000 → **$84.32 plus 1.14% of wiring cost over $2,000**; > $10,000 → **$197.18 plus 0.57% of the portion over $10,000**. Commercial temporary power pole flat **$80.00** each.
- Residential plan review (where plans are reviewed) at the Building schedule's 20%/65% rows; electrical reinspection $55.

## Plumbing permit (Plumbing Code Fee Schedule, Tables B(1)/B(2)/B(3)/C(1))

- **New single-family/duplex base fee** per dwelling unit by square footage: ≤ 1,500 sq ft **$130**; 1,501–2,500 **$180**; 2,501–3,500 **$250**; 3,501–4,500 **$290**; ≥ 4,501 **$325 plus $65 per additional 1,000 sq ft or portion over 4,501**.
- Table B(1.a) add-ons within the base permit: NFPA 13D fire sprinkler service with backflow **$12**; lawn sprinkler supply through the backflow **$44**; sewer service only **$55**; sewer+water combination **$55** (one inspection, same contractor); steam shower with backflow **$12**.
- **Residential 3+ units, additions, alterations, fixture replacement**: base **$32** plus **$12 per fixture/appliance** (Table B(2): water closets, sinks, tubs/showers, water heaters, dishwashers, floor drains, wash basins, clothes washers, garbage disposals, etc., all $12 Each). Sewer service only / water service only **$55 each**; sewer+water combo **$55**.
- **Miscellaneous residential** (Table B(3)): water or waste re-piping **$80**; re-plumbing entire house/unit **$110**; single fixture/appliance **$55**; single sewer or water line **$55**.
- **Commercial**: base **$32** plus, by project (selling-price) value: < $500,000 → **2.28% of value**; $500,000–$1,000,000 → **$11,410.88 plus 1.71% of value over $500,000**; > $1,000,000 → **$19,969.04 plus 1.14% of value over $1,000,000**.
- Reinspection $55.

## Mechanical permit (Mechanical Code & Fuel Gas Fee Schedule)

- **Residential new SFD/duplex** per dwelling unit by sq ft: identical ladder to plumbing ($130/$180/$250/$290/$325 + $65 per 1,000 over 4,501).
- Residential 3+ units / alterations: base **$32** + **$12 per fixture/appliance** (furnaces, A/C, mini-splits, gas fire pits, pool heaters, pellet stoves, woodstoves, gas fireplaces; gas piping pressure test $12; duct work, bath/dryer/range exhaust $12 each).
- Misc residential: single fixture/appliance **$55**.
- **Commercial**: base **$32** plus the same 2.28% / $11,400 + 1.71% / $19,950 + 1.14% value ladder (Table C(1); the plumbing sheet's more precise $11,410.88/$19,969.04 figures print with two decimals and are used in the plumbing seed; the mechanical sheet prints whole dollars).

## Engine modelling notes

- Building Table 1-A: five `per_thousand` rules on `valuation`, one per printed band, each gated `valuation > <band floor>` / `<= <band ceiling>`, with the printed first-band amount as `baseCents` and "or fraction thereof" as `incrementCents` (100_000 cents money; the first band uses 10_000-cent increments because it bands per $100). The first band's $2.95-per-$100 rate: centsPerThousand 295 with incrementCents 10_000.
- Plan review: two `percent` rules on `permit_fee` — 65% (`rateBps 6_500`) gated `occupancy neq residential`, 20% (`rateBps 2_000`) gated `occupancy eq residential`. These run after base components (engine evaluates base first).
- Electrical new-residential ladder: `per_unit` rows on kind `dwelling_units` (fact key `units`) gated by `square_footage` bands; the ≥ 4,501 row adds a `per_thousand`-style extra — modelled as the $210 row plus a separate per-thousand-on-`square_footage` rule ($65 per 1,000 sq ft over 4,501, threshold 4_501 units, basis `square_footage`, increment 1_000, gated `square_footage > 4500` and `custom.new_residential_wiring: true`).
- Electrical Table 6-b: `percent` rules on basis `valuation` (wiring cost carried on `valuation`) with rate fractions in cents-per-cent and thresholds: 2.28% = rate {228, 100} with rateUnit fraction? — modelled as rate {228,10000} fraction via `rate: {numerator: 228, denominator: 10000}`? The engine's `percent` charges `basis × rate`; 2.28% of the portion over $100 = rate {228, 10000} plus thresholdCents 10_000 (basis-unit cents) plus the $22.83 base. Second row: base 8_432, rate {114, 10000}, threshold 200_000. Third: base 19_718, rate {57, 10000}, threshold 1_000_000. Commercial base fee $14.00 flat.
- Plumbing/mechanical residential ladder: `per_unit` on `dwelling_units` by square-footage band (same gating), plus the $65-over-4,501 companion rule; fixture fees `per_unit` on `fixtures` at $12; commercial value ladder `percent` on `valuation` with the printed bases and thresholds as above.
- `sq_ft_1000` extra: `percent` feeType with basis `square_footage`, rateUnit `currency_per_unit` — rate {65,1} = $0.65 per sq ft? No: $65 per 1,000 sq ft = rate {6500, 100} cents per unit with threshold 4_501 units and increment 1_000 — implemented as `per_thousand` on basis `square_footage` (the engine's per_thousand reads any basis; thresholdCents here is 4_501 units and incrementCents 1_000).
- Worked examples: building $300,000 → $913.09 + 200 × $5.17 = $1,947.09 (+65% comm review for commercial); electrical new 2,000 sq ft SFD → $135; plumbing 3+ unit project with 10 fixtures → $32 + 10 × $12 = $152.
