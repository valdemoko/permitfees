# Des Moines, Iowa — Permit Fee Research

**City:** Des Moines, Iowa (Polk County)
**Authority:** City of Des Moines — Permit and Development Center (PDC), Building Division
**Research date:** 2026-09-26
**Researcher:** Permit Fee Intelligence — Iowa pass

---

## 1. Authority

Building, electrical, mechanical and plumbing permits in Des Moines are issued by the
**Permit and Development Center**, a consolidated permit office serving the City's
Building, Engineering, Fire and Planning functions. The operative fee instrument is the
PDC's consolidated fee schedule, adopted effective **February 1, 2025** (the PDF is
titled "Des Moines Permit and Development Center Permit Fees – New Fees 2-1-25"; the
Building Division's older-style schedule is headed "CITY OF DES MOINES – BUILDING
DIVISION PERMIT FEE SCHEDULE", effective 01-02-2025, "Fees established as per DMMC
14.01.090"). Both documents were retrieved and read on 2026-09-26.

### Sources (all fetched and read 2026-09-26)

| Document | URL | Status |
| --- | --- | --- |
| PDC Permit Fee Schedule ("New Fees 2-1-25"), 4 pp. | `https://cms2.revize.com/revize/desmoines/PDC%20Permit%20Fee%20Schedule.pdf` | HTTP 200, `application/pdf` (verified via HEAD) |
| Building Division Permit Fee Schedule 2025, 1 p. (valuation ladder + review-fee factors) | `https://cdnsm5-hosted.civiclive.com/UserFiles/Servers/Server_17385004/File/Departments/Planning%20and%20Building/Building%20Division/Permit%20Applications%20%26%20Information/CITY%20OF%20DES%20MOINES%20-%20BUILDING%20DIVISION%20PERMIT%20FEE%20SCHEDULE.2025.pdf` | HTTP 200, `application/pdf` (verified via HEAD) |

The City's own site (`dmgov.org`) serves pages through a bot manager, but the fee
PDFs themselves are served plain from the City's CMS host (`cms2.revize.com` /
`cdnsm5-hosted.civiclive.com`) — no WAF issue for the operative documents.

## 2. Mechanism, by permit family

### 2.1 Building — residential (flat area-based fees)

For **townhouses, single-family dwellings, two-family dwellings and buildings accessory
thereto**, the PDC schedule abandons valuation entirely and prices by finished floor
area:

| Scope | Fee |
| --- | --- |
| New single-family dwelling, total finished floor area ≤ 1,200 sq ft (basement & garage excluded) | $1,050.00 |
| New single-family dwelling, 1,201–2,000 sq ft | $1,350.00 |
| New single-family dwelling, > 2,000 sq ft | $1,750.00 |
| New townhouse / two-family dwelling, per unit, ≤ 1,200 sq ft | $1,300.00 |
| New townhouse / two-family dwelling, per unit, 1,201–2,000 sq ft | $1,500.00 |
| New townhouse / two-family dwelling, per unit, > 2,000 sq ft | $1,900.00 |
| New construction of accessory housing unit on residential lot | $550.00 |

"Other Building Permits" (all flat):

| Scope | Fee |
| --- | --- |
| Additions to dwellings | $250.00 |
| Renovations to dwellings | $150.00 |
| New detached sheds and garages | $175.00 |
| Decks, fences, retaining walls, swimming pools, hot tubs, other accessory structures | $75.00 |

Demolition (per building): dwellings & accessory $50.00; other structures by
conventional methods $250.00; with explosives $500.00. Sewer/water disconnects for
demolition $75.00.

### 2.2 Building — commercial (valuation ladder)

The same PDC document prices commercial building permits from **total valuation**,
each band printing "or fraction thereof" (round up the excess to whole $1,000):

| Total valuation | Fee |
| --- | --- |
| Less than $2,000 | $64.38 |
| More than $2,000 but no more than $25,000 | $64.38 for the first $2,000 + $9.06 per additional $1,000 or fraction |
| More than $25,000 but no more than $50,000 | $271.88 for the first $25,000 + $7.75 per additional $1,000 or fraction |
| More than $50,000 but no more than $100,000 | $465 for the first $50,000 + $6.44 per additional $1,000 or fraction |
| More than $100,000 but no more than $500,000 | $786.88 for the first $100,000 + $3.88 per additional $1,000 or fraction |
| More than $500,000 | $2,331.25 for the first $500,000 + $2.63 per additional $1,000 or fraction |

These bands are **capped**: each states an inclusive upper bound, and the top band
($500,001+) is the only open one. Modelled as six `per_thousand` rules with
`baseCents` = band base, `thresholdCents` = band floor, `incrementCents` = 100_000
(whole $1,000, "or fraction thereof" → default round-up) and valuation-range
conditions making the bands mutually exclusive.

A second City document (the Building Division's own one-page schedule, effective
01-02-2025) prints an **older, different ladder** for all building work — $1–$2,000:
$121.00; then $24.26/$18.15/$13.55/$11.13/$9.02/$5.93 per $1,000 or fraction, plus
review-fee factors (plan check 65%, Engineering 35% commercial / 20% residential, Fire
15%). The two documents conflict. **Resolution:** the PDC document is the newer
consolidated instrument (titled "New Fees 2-1-25", i.e. later than 01-02-2025) and the
one the PDC publishes for the same Center that issues every permit. The seed charges
the PDC ladder and documents the superseded schedule here; the older PDF is kept as a
secondary source for the review-fee factors that the PDC document restates (plan check
65%).

### 2.3 Plan check and energy review (commercial)

- Plan Checking Fee for buildings with value greater than $1,000.00: **65% of building
  permit fee**. Modelled as a `percent` rule on `permit_fee` at 6,500 bps, conditioned
  on `valuation > 1_000_00` (cents). Residential flat-fee permits carry no plan-check
  line in the PDC document — the 65% sits only in the commercial block, so the rule is
  conditioned to commercial permits only.
- Energy Review Fee for buildings with enclosed heated/cooled space: **2% of building
  permit fee with a $21.00 minimum**. Modelled as `percent` 200 bps on `permit_fee`
  with `minimumCents: 2_100`, conditioned on `custom.energy_reviewed`.

### 2.4 Electrical — residential flat / commercial unit-priced

Residential electrical is flat: new dwellings (including temp power pole) **$225.00**;
alterations and additions to existing dwellings and accessory structures **$75.00**.

Commercial electrical is **base fee + unit fees**: base $75.00; meter settings $10.00
first / $5.00 each additional; circuits first ten (incl. feeders) $4.00 each,
eleventh–100th $2.00 each, over 100 $1.50 each; openings added to existing circuits
$1.20; fixed appliance $6.50; fixtures $0.50; baseboard heat $0.75/kW; motors priced
by class and count; starting permit $50.00; deenergization permit $15.00.

Modelled: two residential flat rules keyed on `work_type`; commercial base $75 flat
plus per-unit rows — circuits modelled with a threshold/base decomposition:
`per_unit` on `circuits`, `baseCents` = 4_000 for the first ten at an effective
$4.00, then `centsPerUnit: 200` with `thresholdUnits: 10`; the 100+ tier expressed as
a second rule with `thresholdUnits: 100` at 150 cents (`incrementUnits: 1`). Meter
settings: `per_unit` with `baseCents: 1_000`, `thresholdUnits: 1`, `centsPerUnit:
500`. Fixtures: 50 cents each. Openings: $1.20 each on `custom.openings_added`.
Fixed appliances: $6.50 each on `custom.fixed_appliances`. Gas-piping-style outlet
rows are mechanical-side and not modelled here.

### 2.5 Plumbing — residential flat / commercial unit-priced

Residential plumbing: new dwellings **$200.00**; sewer & water services only for new
dwellings **$75.00**; alterations and additions **$75.00**; sewer/water disconnects
$75.00.

Commercial plumbing: base $75.00; water service (domestic) $7.50 each; interior water
piping openings $1.50 per fixture served; water service (fire) $10.00 per 100 linear
feet or fraction; private water main $10.00 per 100 lf; private sewers $10.00 per 100
lf; building sewer service $7.50 each; septic tank/private sewage treatment unit
$50.00 each; each plumbing fixture $7.50 (the schedule's own long list includes water
heaters, backflow preventers, grease traps etc.); reconstruction of each drain/stack/
vent line $7.50; gas piping $4.00 each of first four outlets, $2.00 after; uncategorised
item $7.50; grease interceptor $20.00.

Modelled: residential flats by `work_type`; commercial base $75 plus per-unit rows:
fixtures $7.50 each (`fixtures`), building sewer $7.50 (`connections`), water service
$7.50 (`water_service_connections`), grease interceptors $20.00
(`grease_interceptors`), septic tanks $50.00 (`septic_tanks`), fire-water/private-main/
private-sewer runs at $10.00 per 100 lf via `linear_feet` per-unit with
`incrementUnits: 100` (the schedule's "per 100 lineal feet or fraction thereof" is the
block-round-up shape the engine already carries).

### 2.6 Mechanical (recorded, no page)

Residential mechanical: new dwellings $125.00; fireplace-only $75.00; alterations/
additions $75.00. Commercial mechanical: base $75.00 plus unit fees (furnaces $15,
vents $10, boiler $10 + $3 per 100,000 BTU/Hr input or portion, cooling $15, air
handling $7, duct fans $7, evaporative coolers $10, gas outlets $4 first four / $2
after, dampers $10.50 first / $1.50 additional, Type I hood $30, other hoods $15).
Recorded here, not modelled: Des Moines publishes mechanical as its own permit family
and this pass models the three standard categories only.

## 3. Discrepancies and their resolution

1. **Two City fee schedules, two different building ladders.** The Building Division's
   01-02-2025 sheet (valuation-based, with 65/35/20/15% review factors) vs the PDC's
   02-01-25 consolidated schedule (residential flat by area; commercial valuation
   bands). The PDC instrument is the newer and is the consolidated Center-wide
   schedule; the seed charges the PDC figures and keeps the Division sheet as a
   dated secondary source. No figures from the older ladder enter any total.
2. **$465 vs $465.00 / "$2331.25"** — the PDF prints "$465 for the first $50,000"
   and "$2331.25 for the first $500,000" without the trailing zeros; read as the
   dollar amounts they are.
3. **Plan check 65% — commercial only.** The 65% line sits under "Other associated
   fees" in the commercial block; the residential flat-fee rows carry no plan-check
   percentage, so the rule is gated to commercial.
4. **Round-up phrase.** Every commercial valuation band prints "or fraction thereof";
   the engine's default `per_thousand` round-up reproduces it.

## 4. What is modelled vs not

Modelled (three permit types): residential building flats, commercial valuation
ladder, plan check 65% (commercial), energy review 2% ($21 min), residential
electrical flats, commercial electrical base + unit rows, residential plumbing flats,
commercial plumbing base + unit rows.

Recorded but not modelled: mechanical permit family; demolition flats; ROW obstruction
permits; wireless towers; permit extension/reinstatement; overtime inspection;
temporary/partial COs; residential permit reinstatement.
