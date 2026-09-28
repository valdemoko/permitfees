# Mississippi — Gulfport

**Status:** researched & seeded. **Last verified:** 2026-09-26.

## 1. Authority

- Issuer: City of Gulfport, **Urban Development Department — Building Code
  Services**, 1410 24th Avenue, Gulfport, MS 39501. Phone 228-868-5790. Assistant
  Director Roy Sheriff (`rsheriff@gulfport-ms.gov`). Website: `www.gulfport-ms.gov`.
- Department page: `gulfport-ms.gov/departments/urban_development/building_code_services/index.php`
  (Revize CMS; document-center links carry `?t=` timestamps).
- Fee documents (all official PDFs under `Documents/Departments/Urban Development/Building Code Services/`):
  - `BUILDING-PERMIT-FEES.pdf` — "Building Permit Fee Schedule" (undated; ~100-row
    valuation table + closing prose; arithmetic is seamless with the prose rule).
  - `ElecPermitFeeSchedule2002.pdf` — "Electrical Permit Fee Schedule", column
    headed **"Type of Permit FY 2002 Permit Fee"** (dated).
  - `PlumbingPermitFeeSchedule2002.pdf` — "Plumbing Permit Fee Schedule", same
    FY 2002 column (dated).
  - `MechPermitFeeSchedule2002.pdf` exists (mechanical) — not used; building,
    electrical and plumbing pages are the assignment.
- **Disambiguation:** `mygulfport.us` is Gulfport, *Florida*. All URLs use
  `gulfport-ms.gov`.

## 2. Fee mechanisms

### Building — BUILDING-PERMIT-FEES.pdf

A **Base Fee of $30.00** for issuing each permit, **plus** the valuation ladder:

| Project valuation | Permit fee (plus base) |
| --- | --- |
| $0 – $1,001 | $24.00 |
| $1,002 – $2,001 | $28.00 |
| … each +$4.00 per additional $1,000-or-fraction band, ~100 printed rows … | |
| $99,002 – $100,001 | $420.00 |
| $500,002 and up | $2,020.00 + $3.20 per additional $1,000 or fraction |

Closing prose states the rule the table instantiates: "$24.00 for the first one
thousand dollars plus $4.00 for each additional thousand or fraction thereof up to
and including $500,001.00; $2,020.00 for the first five hundred thousand dollars
plus $3.20 for each additional thousand or fraction thereof."

Modelling: `per_thousand` on `valuation` with `baseCents: 2_400`,
`thresholdCents: 100_000`, `centsPerThousand: 400`, `incrementCents: 100_000`
("or fraction thereof" → round up), conditioned to valuation ≤ $500,001; plus a
flat $30.00 base-fee rule (unconditional). The top band ($500,002+) is a second
`per_thousand` with `baseCents: 202_000`, `thresholdCents: 500_000_000`,
`centsPerThousand: 320`, `incrementCents: 100_000`. The ~100 printed rows are the
same arithmetic at $4.00/row — charged from the rule, not transcribed row by row;
the table is cited and two bracket seams are asserted in the test.

### Electrical — ElecPermitFeeSchedule2002.pdf

Base permit fee **$30.00** plus the equipment/appliance table. Rows seeded:

- **Service entrance / switch gear** ladder (by `custom.amperage`; feeder circuits read their own `custom.feeder_amperage` so the two ladders never collide): ≤100A $10;
  125–200A $20; 225–400A $30; 450–600A $40; 700–800A $50; ≥1000A $2.00 per
  additional amp capacity. Modelled as bracketed `flat` rows by amperage bands
  (`tiered_table` on `amperage`), with the ≥1000A overage as a `percent` rule on
  `amperage` at 2¢/amp over 800 (`thresholdCents: 800`, rate `{2,1}`,
  `rateUnit: "currency_per_unit"`).
- **Feeder circuits** ladder: ≤60A $6; 70–100A $8; 125–200A $15; 225–400A $20;
  450–600A $25; 700–800A $30; 800–1000A $35 — bracketed flat rows keyed to
  feeder amperage (`custom.feeder_amperage`).
- **Branch circuit**: $6.00 per circuit (`per_unit` on `circuits`).
- **Distribution / sub-panel** ($0.25 per amp, banded): ≤60A = 0.25/amp;
  70–100A $15–25; 125–200A $31.25–50; 225–400A $56.25–100; 450–600A
  $112.50–150; 600A+ $0.25/additional amp. Banded rows conditioned on
  `custom.amperage`; the 600A+ overage as 25¢/amp over 600.
- **Appliances**: flat rows ($6 range/oven/dryer/dishwasher/electric water heater/
  bathroom space heater; $10 refrigerator/freezer/washer/disposal/compactor/
  attic fan/self-contained commercial units/grills/fryers; $12 window A/C; $8
  commercial electric water heater) — modelled as counts
  (`custom.appliances_6dollar`, `custom.appliances_10dollar`, `custom.window_ac`,
  `custom.comm_water_heater`) priced per unit.
- **Motors** ($5 first hp…), **generators/transformers/heaters/welders** (KW bands,
  $3 per additional 100 KW), **signs/outline lighting** ($10 per light, $10 per
  transformer/ballast), **miscellaneous** ($30: temporary service/power pole,
  correct-wiring-for-occupancy, X-ray, transformer welders) — seeded as the flat
  and per-unit rows a job selects (`custom.sign_lights`, `custom.sign_transformers`,
  `custom.temporary_service`, …).
- **Mobile home / travel trailer**: $30.00 (see major-appliance charges).

### Plumbing — PlumbingPermitFeeSchedule2002.pdf

Base permit fee **$30.00** plus a fixture price list. Seeded per-unit rows:

- $5.00 each: fixtures (generic `fixtures` count), water closet, sink, bath tub,
  grease trap, urinal, laundry tub, sewer connection, shower, water fountain,
  dishwasher, disposal, washing machine, swimming pool, kitchen range, hot plate,
  boiler.
- $7.00 each: lavatories, floor drain.
- $10.00 each: floor drain with trap primer, water heater (full-auto), water
  heater (instant), radiant heater, floor furnace, hot-air furnace, radiator
  (gas/steam/vent, non-vented), circulating heater, gas service line, sprinkler
  heads 1–5 ($10 + $2 each additional).
- **$50.00: water connection** (the standout row).
- $25.00: "Other" connections; $5.00: piping.
- $15.00: backflow preventer.

Layout note: the extraction garbles some row/column pairs (the FY2002 column and
the septic-tank rows interleave); pairs were re-checked against the PDF's own
"Permit fees shall include a base permit fee … plus a fee for each fixture listed
below" structure before transcription. Modelled with distinct `custom.*` counts
per price point (e.g. `custom.lavatories: 7_00`, `custom.water_connection: 50_00`)
so no two price points can read one input.

### Date honesty

Both trade schedules are **FY 2002** documents. `effectiveFrom` is recorded as the
document's own date context; the schedule rows carry `documentDate: "2002-…"` in
their source records, page prose states the vintage, and the fee_schedule
verification rows note it. The building schedule is undated on its face and is
carried as current (it is the schedule the department's own page links for fees).

## 3. Sources

| Key | What | URL |
| --- | --- | --- |
| `gulfport-building-fee-schedule` | Building Permit Fee Schedule PDF | gulfport-ms.gov/Documents/Departments/Urban Development/Building Code Services/BUILDING-PERMIT-FEES.pdf |
| `gulfport-electrical-fee-schedule` | Electrical Permit Fee Schedule (FY 2002) PDF | …/ElecPermitFeeSchedule2002.pdf |
| `gulfport-plumbing-fee-schedule` | Plumbing Permit Fee Schedule (FY 2002) PDF | …/PlumbingPermitFeeSchedule2002.pdf |
| `gulfport-bcs-page` | Building Code Services department page | gulfport-ms.gov/departments/urban_development/building_code_services/index.php |

All primary, `isPrimary: true`, `lastVerifiedAt` set.

## 4. Worked examples

- **Building:** $220,000 valuation → $30 base + $24 first $1,000 + 219 × $4.00 =
  $930.00 total (asserted against the printed row $89,002–$90,001's $380 + 130 ×
  $4 = same arithmetic from the ladder).
- **Electrical:** 200A service + 4 branch circuits + window A/C: $30 + $20 + 4 ×
  $6 + $12 = $86.00 (feeder circuits are a separate ladder keyed to
  `custom.feeder_amperage`, so they never double-charge the service size).
- **Plumbing:** bath remodel — 3 generic fixtures, 1 lavatory, 1 floor drain, 1
  water heater, water connection: $30 + 3×$5 + $7 + $7 + $10 + $50 = $119.00.

## 5. Confidence

- Building schedule: high — prose rule and table agree arithmetically.
- Trade schedules: amounts are verbatim but the documents are FY 2002; treated as
  the schedule the department currently publishes, dated honestly.
