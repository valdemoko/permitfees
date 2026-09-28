# Wichita, Kansas — Permit Fee Research

**City:** Wichita, Kansas (Sedgwick County)
**Authority:** Metropolitan Area Building and Construction Department (MABCD) — a joint City of Wichita / Sedgwick County department operating under the Wichita-Sedgwick County Unified Building and Trade Code (UBTC)
**Research date:** 2026-09-26
**Researcher:** Permit Fee Intelligence — Kansas pass

---

## 1. Authority

Wichita does not run its own building department. Building, electrical, plumbing and
mechanical permits for the City of Wichita (and for Sedgwick County and the smaller
contracted cities) are issued by **MABCD**, the Metropolitan Area Building and
Construction Department, under the **Wichita-Sedgwick County Unified Building and
Trade Code (UBTC)** — adopted by City of Wichita ordinance (most recently amended by
Ordinance No. 52-564, printed at wichita.gov/Archive/ViewFile/Item/11044) and by
Board of County Commissioners action. The UBTC's Article 1, Section 2 carries the
fee tables; MABCD publishes them as numbered one-page "Fee Table" forms, revised
2019, still the operative schedule on the MABCD Fees page.

MABCD is self-supported (fee-funded), and its Table B text preserves the operative
legal citation: "Consistent with the City of Wichita Resolution R-95-560 and
reflecting the agreement reached between the City and the Wichita Area Builders
Association … the Director of MABCD is granted the authority to make temporary and
discretionary reduction of fees not to exceed 20% below those published in Table B."

### Sources (all fetched and read 2026-09-26)

| Document | URL | Status |
| --- | --- | --- |
| MABCD Fees page (index of fee tables) | `https://www.sedgwickcounty.org/mabcd/fees/` | HTTP 200 (via reader proxy; direct curl times out) |
| **Fee Table B** — Building Permit Fees, Rev. 5/8/2019, 1 p. | `https://www.sedgwickcounty.org/media/55339/fee-table-b.pdf` | HTTP 200, `application/pdf` (via reader proxy) |
| **Fee Table I** — Uniform Electrical Code Fees, Rev. 5/9/2019, 1 p. | `https://www.sedgwickcounty.org/media/55335/fee-table-i.pdf` | HTTP 200, `application/pdf` (via reader proxy) |
| **Fee Table H** — Uniform Plumbing Code Fees, Rev. 5/9/2019, 1 p. | `https://www.sedgwickcounty.org/media/55343/fee-table-h.pdf` | HTTP 200, `application/pdf` (via reader proxy) |
| UBTC text, Art. 1 §109.5.1 (plan review 60%) | `https://www.wichita.gov/Archive/ViewFile/Item/11044` | HTTP 200 (via reader proxy) |
| MABCD Permits page (residential sq-ft rates, roofing) | `https://www.sedgwickcounty.org/mabcd/permits/` | HTTP 200 |

sedgwickcounty.org sits behind a filter that times out plain curl, but every
document above was retrieved intact through the reader proxy; the fee tables are
one-page text PDFs and read cleanly.

## 2. Mechanism, by permit family

### 2.1 Building — residential new construction (per-square-foot)

Table B §1: "On Residential New Build, the building permit shall be **38 cents for
each square foot of finished space and 30 cents for each square foot of unfinished
space**. For non-commercial, accessory structures (all private, non-dwelling
structures on residential property), the building permit shall be 25 cents for each
square foot of finished space and 20 cents for each square foot of unfinished space.
If unfinished space of an accessory structure exceeds 5,000 square feet, the building
permit shall be 20 cents for each square foot of unfinished space for the first 5,000
square feet and 10 cents for each additional unfinished square foot thereafter."

The MABCD Permits page restates the dwelling figures operationally: "$0.38 per
finished square foot of area. For unfinished basements, attached garages, covered
porches, and decks, the fee will be $0.30 per square foot."

Modelled with two `percent` rules, each with its own area basis so the two areas
never share an input:

- finished area: `percent` on `square_footage` at `rate: {numerator: 3800,
  denominator: 100}` with `rateUnit: "currency_per_unit"` — the fraction
  multiplies the raw area and the product is cents, so 38¢ lands in the
  numerator as 3,800/100 (the engine prints "$3,800/100 per sq ft"-shaped
  working as "$0.38 per sq ft");
- unfinished area: same shape on the engine's second-area basis
  (`covered_square_footage`, fact `custom.covered_square_footage`) at 3,000/100
  per sq ft — the unfinished area is its own input so a dwelling with both a
  finished and an unfinished area prices both rows. Conditioned on the fact
  being present (the worked example supplies it).

Accessory-structure rows (25¢/20¢/10¢ above 5,000 unfinished sq ft) are recorded,
not modelled: they key on a different occupancy of structure than a dwelling and the
worked examples price dwellings.

Table B §3: "For all remodels or rebuilds for both residential and commercial, the
building permit shall be based upon the amounts specified in paragraph 2 above" —
i.e. remodels read the **commercial** valuation ladder. Modelled: the ladder rules
are not conditioned on occupancy, only on the remodel fact, so a declared remodel
prices through Table B §2 at any occupancy (see §2.2).

### 2.2 Building — commercial and remodels (valuation ladder, Table B §2)

Table B §2, printed ladder (every band "or fraction thereof" on its increment):

| Total valuation | Fee |
| --- | --- |
| $1 – $1,000 | $40.00 |
| $1,000.01 – $2,000 | $40 + $3.00 per additional $100 or fraction |
| $2,000.01 – $40,000 | $70 + $11.00 per additional $1,000 or fraction |
| $40,000.01 – $100,000 | $488 + $9.00 per additional $1,000 or fraction |
| $100,000.01 – $500,000 | $1,028 + $7.00 per additional $1,000 or fraction |
| $500,000.01 – $1,000,000 | $3,828 + $5.00 per additional $1,000 or fraction |
| $1,000,000.01 – $5,000,000 | $6,328 + $3.00 per additional $1,000 or fraction |
| $5,000,000.01 + | $18,328 + $2.25 per additional $1,000 or fraction |

Seam check (internal): $2,000.01 band base $70.00 = $40 + 10 × $3.00 ✓; $40,000 base
$488.00 = $70 + 38 × $11.00 ✓; $100,000 base $1,028.00 = $488 + 60 × $9.00 ✓;
$500,000 base $3,828.00 = $1,028 + 400 × $7.00 ✓; $1,000,000 base $6,328.00 =
$3,828 + 500 × $5.00 ✓; $5,000,000 base $18,328.00 = $6,328 + 4,000 × $3.00 ✓. The
ladder chains exactly — the internal check on the read.

Modelled as eight mutually-exclusive `per_thousand` rules (basis `valuation`,
`incrementCents` = the band's own increment — 10_000 for the two $100-step
bands, 100_000 elsewhere — which reproduces "or fraction thereof" round-up),
each conditioned to its valuation range. The first band is a flat $40
(`centsPerThousand: 0` — the printed row is flat to $1,000; the $100 steps
begin at $1,000.01). Bands are **not** occupancy-conditioned: Table B §2 is
the printed home of remodels/rebuilds of both classes, and new non-residential
construction lands in the same rows because the residential-new rows are keyed on
`work_type` + facts.

Roofing (MABCD Permits page): "$0.05 per square foot (Min. $50.00 / Max. $1,500.00)"
— recorded, not modelled (it is a scope row, not one of the three pages).

### 2.3 Plan review — 60% of the building permit fee (UBTC §109.5.1)

The UBTC as amended: "said plan review fee shall be **60 percent of the building
permit fee** as shown in Tables B and C … in addition to the building permit fees."
Commercial plan review starts with a Plan Review Application at the MABCD portal.
Modelled as a `percent` rule on `permit_fee` at 6,000 bps, conditioned on
`custom.plan_review: true` (the project is declared in the plan-review path, which
is how MABCD sequences commercial work) and `valuation > 100_000` cents. The
residential per-square-foot path is permit-only in MABCD practice ("The first step
for Commercial permits is a plan review"), so the residential worked example does
not supply the fact.

### 2.4 Electrical — Table I, item-priced with a $25 permit issuance fee

Table I is an item list — each row a count × price — plus a flat: "Permit Issuance
Fee **$25.00**". Item rows (Rev. 5/9/2019):

| # | Item | Fee |
| --- | --- | --- |
| 1–2 | 120 V / 277 V circuit | $2.00 each |
| 3 | Heating appliance < 4,500 W | $3.00 |
| 4 | Range or heat device ≥ 4,500 W | $8.00 |
| 5 | Clothes dryer | $8.00 |
| 6 | Feeder | $9.00 |
| 7 | Pool / hot tub / sauna / jacuzzi | $14.00 |
| 8 | Special power circuit | $9.00 |
| 9 | Generator | $29.00 |
| 10 | Sign, per circuit | $7.00 |
| 11 | Outlets added to existing circuit | $0.75 |
| 12 | Smoke detectors | $0.75 |
| 13 | Light fixture or lampholder (incl. retrofits) | $0.75 |
| 14 | Motor, 1 HP or less | $5.00 |
| 15 | Motor, over 1 HP | $7.00 |
| 16 | Water well motor | $7.00 |
| 17a | Service ≤ 480 V, per meter (≤ 100 A) | $11.00 |
| 17b | Each additional amp | $0.06 |
| 18 | Service over 480 V, each entrance | $71.00 |
| 19–20 | Construction service | $14.00 / $28.00 |
| 21 | Re-inspection (meter reset) | $11.00 |
| 22 | Transformer | $11.00 |
| 23 | Miscellaneous | $14.00 |
| 24 | Photovoltaic (solar) system | $29.00 |

Table I's own bundling note: "electrical work done in conjunction with a building
project covered by a building permit for a one- or two-family dwelling new
construction, repair, remodel or addition is covered and permitted under the
authority granted by the building permit and does not require a separate electrical
permit" — modelled with the `custom.trade_bundled` stand-down condition (absent =
not bundled).

Modelled: the $25 issuance flat; circuits at $2.00 each (`per_unit`, `circuits`);
feeders $9.00 (`custom.feeders`); special power circuits $9.00
(`custom.special_circuits`); outlets added to existing circuits $0.75
(`outlets`); smoke detectors $0.75 (`custom.smoke_detectors`); fixtures $0.75
(`custom.lighting_fixtures` fact via the `lighting_fixtures` unit kind); motors —
1 HP or less $5.00 and over 1 HP $7.00 split on `custom.motor_size_class`; service
meters $11.00 (`meters`); generators $29.00 (`custom.generators`); PV systems
$29.00 (`custom.pv_systems`). Remaining rows recorded, not modelled (heating
appliances, pools, signs, transformers, construction services, over-480 V
services, well motors — each a named scope a contractor declares; the modelled set
carries the common permit and every row's price is in this file).

### 2.5 Plumbing — Table H, item-priced with a $25 permit issuance fee

Table H (Rev. 5/9/2019), same shape:

| # | Item | Fee |
| --- | --- | --- |
| 1 | Waste openings | $4.50 |
| 2 | Reconnect moved building | $11.00 |
| 3 | Interior rainwater drain | $4.00 |
| 4 | Gas meter loop / pressure test | $9.00 |
| 5 | Gas opening / pressure test | $9.00 |
| 6 | Medical gas openings | $5.00 |
| 7 | Water service new or replacement | $5.00 |
| 8 | Mobile home water service | $5.00 |
| 9 | Water heater new or replacement | $9.00 |
| 10 | Backflow device | $5.00 |
| 11 | Lawn sprinklers | $10.00 |
| 12 | Water conditioning | $4.50 |
| 13 | Standpipes, per riser | $36.00 |
| 14 | Miscellaneous | $9.00 |
| 16 | **Permit Issuance Fee** | **$25.00** |

Table H carries the same one/two-family bundling note as Table I, modelled with the
same `custom.trade_bundled` stand-down.

Modelled: the $25 issuance flat; waste openings $4.50 (`openings`); water services
$5.00 (`water_service_connections`); water heaters $9.00 (`custom.water_heaters`);
backflow devices $5.00 (`backflow_devices`); medical gas openings $5.00
(`custom.medical_gas_openings`); standpipes $36.00 per riser (`custom.standpipes`);
lawn sprinklers $10.00 (`custom.lawn_sprinklers`). Remaining rows recorded, not
modelled.

### 2.6 Mechanical (Table K, recorded, no page)

Mechanical permits price on Table K (same item-plus-issuance-fee shape). Recorded
here as a gap; not modelled in this pass — Kansas models the three standard pages.

## 3. Discrepancies and their resolution

1. **"38 cents finished / 30 cents unfinished" vs the Permits page's "$0.20 per
   square foot"** for additions' unfinished space. The $0.20 line is the Permits
   page's paraphrase of Table B's *accessory-structure* 20¢ unfinished rate, not a
   dwelling rate; Table B is the operative form and is what the seed charges.
2. **Two "reinspection" amounts in circulation** — Table I's $11.00 meter-reset row
   and the master fee schedule's $50/$140 reinspection rows. The $50/$140 rows are
   inspection-event penalties, not permit-computation rows; recorded, not modelled.
3. **Residential remodels.** Table B §3 sends remodels of both classes to the §2
   valuation ladder; the seed's ladder rules are therefore not occupancy-gated, and
   the residential-new rows are keyed on `work_type` so a remodel cannot answer them.
4. **Plan review 60% is a UBTC code section, not a Table B row.** The seed charges
   it when the project is declared in the plan-review path
   (`custom.plan_review: true`), which matches how MABCD actually sequences
   commercial work (plan review application first) and leaves the residential
   per-square-foot path permit-only.

## 4. Worked examples (engine-verified 2026-09-26)

- **Commercial build-out, $650,000 valuation, plan-review path.** Ladder band 6
  ($3,828 + 150 × $5.00 = $4,578.00) + plan review 60% = $2,746.80 → **$7,324.80**.
- **Electrical, 25 circuits, 2 feeders, 3 special circuits, 40 outlets, 60 fixtures,
  2 meters, 1 generator, 1 PV — not bundled.** $25 + 25×$2 + 2×$9 + 3×$9 + 40×$0.75
  + 60×$0.75 + 2×$11 + $29 + $29 = $25 + $50 + $18 + $27 + $30 + $45 + $22 + $29 +
  $29 = **$275.00**.
- **Plumbing, 12 waste openings, 2 water services, 3 water heaters, 2 backflow
  devices, 1 standpipe riser, 1 lawn sprinkler — not bundled.** $25 + 12×$4.50 +
  2×$5 + 3×$9 + 2×$5 + $36 + $10 = $25 + $54 + $10 + $27 + $10 + $36 + $10 =
  **$172.00**.

## 5. What is modelled vs not

Modelled (three permit types): residential-new per-square-foot rows (finished +
unfinished areas), the eight-band commercial/remodel valuation ladder, plan review
60% (plan-review path), electrical Table I issuance fee + modelled item rows,
plumbing Table H issuance fee + modelled item rows, with the one/two-family
bundling stand-down on both trades.

Recorded but not modelled: Table K mechanical; Table A contractor licensing; Tables
C/F/G/J (other inspections, fire sprinkler, miscellaneous, elevator); accessory-
structure rates; roofing $0.05/sq ft ($50–$1,500); reinspection and after-hours
event fees; floodplain $50; wastewater $100/$200; the Director's 20% temporary
reduction authority; the 180-day permit expiration and reinstatement provisions.
