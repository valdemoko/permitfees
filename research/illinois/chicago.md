# Chicago, Illinois — research record

Last verified: 2026-09-25. Everything below was read from the sources listed; nothing is
inferred from a third-party fee site. Where a reading required a judgement, the judgement
is stated.

---

## 1. Authority

- **Issuer:** City of Chicago Department of Buildings (DOB) for building, electrical and
  plumbing permits. Fee questions: `dob-info@cityofchicago.org` (published on the fee page).
- **Legal basis:** Chicago Construction Codes Administrative Provisions (Title 14A),
  §14A-12-1204 (fees) and §14A-4-412 (how fees are calculated), Municipal Code of Chicago.
- **Fee calculator:** DOB publishes an official calculator ("Calculate the Cost of a
  Building Permit") whose inputs are construction type, occupancy type, floor area and
  project scope — **not a valuation**. That is the first thing to know about Chicago: the
  building permit fee is area-based.
- **Trade permits** are issued through the **Express Permit Program** (launched
  2023-11-06, replacing the Easy Permit and Short Form processes; expanded 2024-09-16).
  Guided worktypes include Electrical Work, Plumbing Work, monthly electrical/plumbing
  maintenance, small-scale solar, generators, etc.

## 2. Sources

| Key | Document | URL | Notes |
| --- | --- | --- | --- |
| C1 | **2026 Amended Building Permit Fee Tables** (effective January 6, 2026) | `https://www.chicago.gov/content/dam/city/depts/bldgs/general/Permitfees/2026%20Amended%20Permit%20Fee%20Tables.pdf` | sha256 `2e5f2a52b5ccfd48e8f477f889ab5e8b0c3935408d03d74e17683c1a5f4a4dd6`. Issued 2025-10-01 under §14A-12-1204.3.1, updated 2025-12-23 for Ordinance SO2025-0021719. Contains Tables 14A-12-1204.3(1), (3), (4), (5), (6). |
| C2 | **Substitute Ordinance SO2025-0021719** ("2026 Municipal Code Revenue Ordinance Alternative"), passed 2025-12-19 | Retrieved through the City Clerk's official Legislation API (`api.chicityclerkelms.chicago.gov`, `GET /matter/recordNumber/SO2025-0021719`), attachment `NEW UPDATED SO2025-0021719 Substitute Ordinance 2.pdf` → `https://occprodstoragev1.blob.core.usgovcloudapi.net/matterattachmentspublic/27253856-496b-4f12-81be-4d69dddfcc7a.pdf` | sha256 `37df4b6046141705951610615d0220ac14b451402d3c5f46fa66a6d90dc8c4b2`. Articles XV–XXIII take effect on passage with **new fee amounts effective no earlier than 10 days later or January 1, 2026, whichever is later** (Art. XXVI §3); DOB published them effective 2026-01-06. |
| C3 | **Excerpts of the Chicago Construction Codes related to building permit fees**, effective January 1, 2022 | `https://www.chicago.gov/content/dam/city/depts/bldgs/general/Permitfees/Permit%20Fee%20Excerpts%202022.pdf` | sha256 `2512a021386417487b83560f4e8fd5a1c77b3360308e5ce2ea5476cc15a92425`. Contains §14A-4-412 (the fee formula and process fees) and Tables 14A-12-1204.1 and 14A-12-1204.2 (stand-alone permit fees) as they read in 2022. |
| C4 | **14A Permit Fee Excerpts**, effective July 1, 2019 | `https://www.chicago.gov/content/dam/city/depts/bldgs/general/Permitfees/14A%20PERMIT%20FEE%20EXCERPTS.pdf` | sha256 `e154fa66302100c0e63a4751aff176604d86aa9bea8a70934176669de38cdf8f`. Used to confirm that the amount column of Table 14A-12-1204.1 pairs the way C3's table-mode extraction says it does (deposit $300, extension 25%, review fee $25). |
| C5 | **Calculate the Cost of a Building Permit** (fee index + calculator) | `https://www.chicago.gov/city/en/depts/bldgs/provdrs/permits/svcs/permit_fee_calculator.html` | 200. Names C1 as the schedule for permits issued 2026-01-01 or later and lists the superseded 2023–2025 tables. |
| C6 | **Express Permit Program** | `https://www.chicago.gov/city/en/depts/bldgs/provdrs/permits/svcs/express-permits.html` | 200. Guided worktypes; confirms electrical and plumbing permits are issued as express/stand-alone permits. |

Extraction: `pdftotext -table` (xpdf 4.00). `-layout` mis-pairs the amount column in
Tables 14A-12-1204.1/1204.2 by up to two rows and must not be used for rates; every
amount below was cross-checked between `-table` and `-raw`, and 2019/2022/2026 against
each other where a document was reprinted in more than one year.

## 3. The building permit formula

§14A-4-412.2.2.1 (C3):

```
permit fee = CF × RF × A
  CF = construction factor, Table 14A-12-1204.3(1)   (occupancy class × construction type)
  RF = scope of review factor, Table 14A-12-1204.3(3) new construction,
                                 Table 14A-12-1204.3(4) rehabilitation,
                                 Table 14A-12-1204.3(6) phased permitting
  A  = gross floor area of all construction, demolition or rehabilitation work,
       including basements excluded from building area, in square feet
```

- **No valuation is involved.** The fee is a dollar rate per square foot
  (CF, printed as `$0.23`–`$1.06`) multiplied by the scope factor and the area.
- Each RF row also prints a **Minimum Fee** column (flat, "$900 per story", "$250 per
  unit served", "$300 per unit"), and footnote c adds a global floor:
  2026 Tables (4)/(5)/(6) — "A minimum fee of $602 applies to all permits"; Table (3) —
  "$302 for temporary structures, $602 for all other permits" (raised from the $302 of
  2022 by SO2025-0021719). Reading: **fee = max(CF × RF × A, row minimum, $602)**, with
  $302 instead of $602 for temporary structures. This site models the global floor as a
  floor on the component and the row minimum as a table-driven floor; the larger wins.
- Footnote b (Tables 3/4/6): where more than one scope of review factor applies, **the
  highest applicable multiplier applies to all areas** — so a mixed-scope project pays
  the higher factor, not a blend.
- Footnote a (Table 1): mixed occupancy is weighted by gross floor area; if one
  occupancy is ≥85% of the area, the whole fee uses that classification.
- **Demolition is different:** footnote d of Table (4) — demolition permits under
  §14A-4-407 "are not subject to the area- and construction-factor-based fee formula and
  are only subject to the minimum fees in this table and inspection fees per
  §14A-5-503." Ordinary demolition therefore costs its $600 minimum flat; complex
  demolition its $2,450.
- **Exterior wall rehabilitation (Table 5) cannot be computed:** §14A-4-412.2.2.2 sends
  CF to **Table 14A-12-1204.3(2), which is `[Reserved]`** in both the 2022 excerpts and
  the 2026 tables. The RF exists; the CF does not. Recorded as not modelled — the
  published code literally references an empty table.
- Revisions: §14A-4-412.2.2.4 allows `F_sp = F_op × P_op/P_sp` (page-proportional), at
  the building official's discretion — named, not modelled (it needs the original
  permit's fee and page counts).
- Process fees (Table 14A-12-1204.1, C3 as amended by C2 §7): permit fee **deposit**
  **$300 for a temporary structure / $600 for all other work** (non-refundable, paid on
  submission, credited against the permit fee — §14A-4-412.1.2/412.2.1); stand-alone
  permit review fee $25; accessibility pre-review $150 first hour + $100 additional;
  pre-permit debt check $30; extension of time or reinstatement 25% of the original
  permit fee per 180-day period; monthly electrical/plumbing maintenance permit $75 per
  building per 30 days. All named rather than added: the deposit is a prepayment of the
  fee this page computes, not an extra charge.

### Table 14A-12-1204.3(1) — Construction factor (C1, 2026)

Dollars per square foot of area, per occupancy class (rows) × construction type I–V
(columns):

| Group | I | II | III | IV | V |
| --- | --- | --- | --- | --- | --- |
| A | 0.97 | 0.90 | 0.86 | 0.83 | 0.74 |
| B | 0.84 | 0.78 | 0.74 | 0.69 | 0.61 |
| E | 0.87 | 0.80 | 0.79 | 0.73 | 0.64 |
| F | 0.57 | 0.45 | 0.42 | 0.39 | 0.32 |
| H | 0.84 | 0.78 | 0.74 | 0.69 | 0.61 |
| I | 1.06 | 0.98 | 0.97 | 0.86 | 0.78 |
| M | 0.61 | 0.56 | 0.52 | 0.50 | 0.42 |
| R-1, R-2, R-3 | 0.84 | 0.78 | 0.78 | 0.70 | 0.63 |
| R-4, R-5 | 0.52 | 0.50 | 0.49 | 0.47 | 0.44 |
| S | 0.53 | 0.41 | 0.39 | 0.35 | 0.28 |
| U | 0.35 | 0.30 | 0.29 | 0.27 | 0.23 |

(R-1/R-2/R-3 share one printed row; R-4/R-5 share another. The 2022 table printed
R-1/R-2/R-3 and R-4 and R-5 as three rows, so the 2026 pairing follows the printed
alignment: the first value row is centred on R-2, the second on R-4.)

### Table 14A-12-1204.3(3) — Scope of review factor, new construction (C1, 2026)

Factor → description → minimum fee. Rows whose description is "Not applicable" carry no
fee and are omitted here. Where one factor cell spans several descriptions (the PDF
prints the factor once, centred), the descriptions share that factor.

- **Group A:** 1 → "All new construction, including first buildout of tenant space" → $3,650
- **Group B:** 0.5 → "Initial buildout of a tenant space, including sales centers and model
  units, excluding telecommunication equipment areas and ambulatory care facilities" →
  **$900 per story**; 0.75 → "Construction of a single-story building, excluding
  telecommunications equipment areas and ambulatory care facilities" → $3,650; 0.75 →
  "Construction or initial buildout including a telecommunication equipment area" → $2,450;
  1 → "Construction or initial buildout of an ambulatory care facility" → $3,650; 1 →
  "Construction of a multi-story building" → $3,650
- **Group E:** 0.5 → "Initial buildout of a tenant space" → $900 per story; 1 → "All other
  new construction" → $3,650
- **Group F:** 0.75 → "Single-story building without regulated equipment" → $2,450; 1 →
  "Multi-story building without regulated equipment" → $3,650; 1.25 → "Facility with
  regulated equipment" → $3,650
- **Group H:** 1 → "Facility without regulated equipment" → $3,650; 1.25 → "Facility with
  regulated equipment" → $3,650
- **Group I:** 1 → "Facility without regulated equipment" → $2,450; 1.25 → "Facility with
  regulated equipment" → $3,650
- **Group M:** 0.5 → "Initial buildout of a tenant space, including sales centers and model
  units" → $900 per story; 0.75 → "Construction of a single-story building" → $3,650; 1 →
  "Construction of a multi-story building" → $3,650
- **Group R:** 0.5 → "Detached private garage or carport (fee in addition to primary
  residence fee)" → $600; 0.75 → "Residential construction with maximum of 4 stories and
  maximum of 3 dwelling units" → $2,450; 1 → "Residential construction with 5 or more
  stories or 4 or more dwelling units" → $3,650; 1 → "Residential construction with any
  number of sleeping units" → $3,650
- **Group S:** 0.75 → "Single-story facility without regulated equipment" → $2,450; 1 →
  "Multi-story facility without regulated equipment" → $3,650; 1.25 → "Facility with
  regulated equipment" → $3,650
- **Group U:** 0.5 → "Detached private garage or carport (fee in addition to fee for main
  building)" → $600; 0.5 → "Temporary structures not covered in Table 14A-12-1204.2" →
  $300; 0.75 → "Single-story building or structure not more than 15 feet above the ground,
  such as a parking lot, bridge, bus shelter, or retaining wall, not covered in Table
  14A-12-1204.2" → $300; 1 → "Multi-story building or structure more than 15 feet above
  the ground, such as a utility plant, cell phone tower, or rail station" → $3,650
- **Mixed Occupancy:** 1 → "Facility without regulated equipment" → $3,650; 1.25 →
  "Facility with regulated equipment" → $3,650

### Table 14A-12-1204.3(4) — Scope of review factor, rehabilitation (C1, 2026)

**All occupancies** (the "All" block applies to every classification):

- 0.0 (footnote d, demolition not subject to the formula): "Ordinary demolition
  (Section 14A-4-407)" → $600 flat; "Complex demolition (Section 14A-4-407)" → $2,450 flat.
  ("For interior demolition use Table 14A-12-1204.3(6)")
- 0.25: "Repair (nonstructural)" → $600; "In-kind replacement of a single MEP system" →
  $600; "Alteration without the reconfiguration of space, the addition or elimination of
  any door or window, the reconfiguration or extension of any system, or the installation
  of additional equipment (Level 1 alteration)" → $600; "Roof repair, roof recover, or
  roof replacement with structural repair" → $900
- 0.5 (qualifier: no structural work except as noted, no installation or alteration of
  regulated equipment): "Structural repair as entire scope of work (except in residential
  buildings with 1–3 dwelling units and no mixed occupancy)" → $900; "Relocated building"
  → $1,800
- 0.75: "Change of occupancy without an increase in any hazard category (per Chapter 10 of
  the Chicago Building Rehabilitation Code) and without creation of food-related
  facilities requiring a public health inspection" → $2,450
- 1: "Change of occupancy or change of use involving creation of food-related facilities
  requiring a public health inspection" → $1,800; "Change of occupancy with an increase in
  any hazard category (per Chapter 10 of the Chicago Building Rehabilitation Code)" → $3,650

**Group A:** 0.5 → "Repair or in-kind replacement of more than one MEP system (no
reconfiguration)" → $1,800; 0.75 → "Level 2 or Level 3 alteration, occupant load less than
300" → $1,800; 1 → "Addition" → $2,450; "Creation or reconfiguration of mixed-occupancy or
tenant separations" → $3,650; "Level 2 or Level 3 alteration, occupant load 300 or more"
→ $3,650.

**Group B:** 0.5 → "Level 2 or Level 3 alteration to a single tenant space on a single
story, including existing telecommunication equipment area" → $900; "Level 2 or Level 3
alteration to common areas on a single story" → $900; "Repair or in-kind replacement of
more than one MEP system (no reconfiguration)" → $900; 0.75 → "Level 2 or Level 3
alteration to common areas on multiple stories" → $1,800; "Level 2 or Level 3 alteration to
multiple tenant spaces or multiple stories" → $1,800; "Level 2 or Level 3 alteration to
restaurant or other food-related facility requiring public health inspection" → $1,800; 1 →
"Addition" → $2,450; "Installation of new telecommunication equipment area where none
previously existed" → $2,450; "Creation or reconfiguration of mixed-occupancy or tenant
separations" → $3,650.

**Group E:** 0.5 → "Repair or in-kind replacement of more than one MEP system (no
reconfiguration)" → $1,800; 0.75 → "Level 2 or Level 3 alteration" → $1,800; 1 → "Addition"
→ $2,450; "Creation or reconfiguration of mixed occupancy or tenant separations" → $3,650.

**Group F:** 0.5 → "Repair or in-kind replacement of more than one MEP system (no
reconfiguration)" → $1,800; 0.75 → "Level 2 or Level 3 alteration to single-story building"
→ $900; 1 → "Level 2 or Level 3 alteration to multi-story building" → $1,800; "Addition" →
$2,450; "Creation or reconfiguration of mixed occupancy or tenant separations" → $3,650;
1.25 → "Any work including installation or alteration of regulated equipment" → $1,800.

**Group H:** 0.5 → MEP repair → $1,800; 0.75 → "Level 2 or Level 3 alteration to
single-story building" → $2,450; 1 → "Addition" → $3,650; "Creation or reconfiguration of
mixed occupancy or tenant separations" → $3,650; "Level 2 or Level 3 alteration to
multi-story building" → $3,650; 1.25 → "Any work including installation or alteration of
regulated equipment" → $1,800.

**Group I:** 0.5 → MEP repair → $1,800; 0.75 → "Level 2 or Level 3 alteration to
single-story building" → $1,800; 1 → "Creation or alteration of machine room" → $2,450;
"Addition" → $3,650; "Creation or reconfiguration of mixed occupancy or tenant
separations" → $3,650; "Level 2 or Level 3 alteration to multi-story building" → $3,650;
1.25 → "Any work including installation or alteration of regulated equipment" → $1,800.

**Group M:** 0.5 → "Level 2 or Level 3 alteration to a single tenant space on a single
story, including existing telecommunication equipment area" → $900; "Level 2 or Level 3
alteration to common areas on a single story" → $900; "Repair or in-kind replacement of
more than one MEP system (no reconfiguration)" → $900; 0.75 → "Level 2 or Level 3
alteration involving structural work" → $1,800; "Level 2 or Level 3 alteration to common
areas on multiple stories" → $1,800; "Level 2 or Level 3 alteration to multiple tenant
spaces or multiple stories" → $1,800; 1 → "Addition" → $2,450; "Installation of new
telecommunication equipment area where none previously existed" → $2,450; "Creation or
reconfiguration of mixed occupancy or tenant separations" → $2,450.

**Group R:** 0.25 → "Structural repair as entire scope of work, building with 1–3 dwelling
units and no mixed occupancy" → $600; 0.5 → "Installation or alteration of porch, balcony,
deck, exterior stair, or occupiable rooftop" → **$250 per unit served**; "Level 2 or Level
3 alteration, building with 1–3 dwelling units and no mixed occupancy" → $600; "Level 2 or
Level 3 alteration to single dwelling unit" → $600; "Repair or in-kind replacement of more
than one shared MEP system (no reconfiguration)" → $1,800; 0.75 → "Level 2 or Level 3
alteration to 4–29 dwelling units or sleeping units and common areas in same building" →
**$300 per unit**; "Addition to building with 1–3 dwelling units and no mixed occupancy" →
$900; "Level 2 alteration to common areas only in a building with 4 or more dwelling units
or any number of sleeping units" → $1,800; 1 → "Level 2 or Level 3 alteration to 30 or more
dwelling units or sleeping units and common areas in same building" → **$300 per unit**;
"Decrease in number of dwelling units or sleeping units" → $1,800; "Increase in number of
dwelling units or sleeping units" → $1,800; "Addition to building with 4 or more dwelling
units or any number of sleeping units" → $2,450; "Alteration to mixed occupancy or tenant
separation" → $2,450.

**Group S:** 0.5 → MEP repair → $1,800; 0.75 → "Level 2 or Level 3 alteration to
single-story building" → $900; "Level 2 or Level 3 alteration to multi-story building" →
$1,800; 1 → "Addition" → $2,450; "Creation or reconfiguration of mixed occupancy or tenant
separations" → $3,650; 1.25 → "Any work including installation or alteration of regulated
equipment" → $1,800.

**Group U:** 0.75 → "Level 2 or 3 alteration to a single-story building or structure not
more than 15 feet above the ground, such as a parking lot, bridge, bus shelter, or
retaining wall not covered in Table 14A-12-1204.2" → $300; 1 → "Level 2 or 3 alteration to
a multi-story building or structure more than 15 feet above the ground, such as a utility
plant, cell phone towers, or rail station" → $600; "Addition to building" → $600.

**Mixed Occupancy:** 1 → "Facility without regulated equipment, no changes to mixed
occupancy or tenant separations" → $1,800; "Facility without regulated equipment, creation
or reconfiguration of mixed occupancy or tenant separations" → $3,650; 1.25 → "Facility
with regulated equipment" → $3,650.

Qualifier sentences printed inside the table ("For any scope under this multiplier: no
structural work…") are the schedule's own scope limits for that factor. They are
transcribed with the factor they follow in the printed cell; they are prose, not rules.

### Table 14A-12-1204.3(6) — Phased permitting (C1, 2026)

- (first row, no factor printed — see open questions): "Caissons only, or slurry wall
  only, or grade beams only (no area)" → $7,300
- 0.25 → "Interior demolition work, including the removal of mechanical, electrical, and
  plumbing systems, with no structural work and no alteration of fire separations, in
  preparation for rehabilitation work" → $350
- 0.5 → "All other below-grade construction (foundation, below grade floors)" → $3,650;
  "Above-grade new construction or addition work where same building area will be
  permitted in more than one phase of construction" → $3,650
- 0.75 → "Interior demolition work, with structural work or alteration of fire separations,
  in preparation for rehabilitation work" → $1,200; "Rehabilitation work with interior
  demolition work for same building area permitted as a separate phase" → *minimum "per
  Table 14A-12-1204.3(4)"* (the floor is another table's floor)
- 1 → "Above-grade new construction or addition with only below-grade work as a separate
  phase" → $3,650

### Table 14A-12-1204.3(5) — Exterior wall rehabilitation (C1, 2026)

RF rows exist (0.05 tuckpointing $350; 0.1 siding/window wall $350/$600; 0.5 lintel $300;
1 concrete repair/parapet/cornice $600/$300/$300) but **CF comes from Table
14A-12-1204.3(2), which is `[Reserved]`** — §14A-4-412.2.2.2 is uncomputable as printed.

## 4. Trade permits: Table 14A-12-1204.2 stand-alone fees

§14A-4-412.1: a permit covering **only** scopes listed in Table 14A-12-1204.2 pays the
table's flat fee; a permit whose application includes more than one listed scope pays
**each applicable fee** (they stack). A permit with any scope *not* listed goes through
the CF × RF × A route instead (§14A-4-412.2). Footnote c on a row means that row's fee is
**in addition to** a permit fee calculated under §14A-12-1204.3.

Amounts below: C3 (2022) rows, as amended by C2 §8 (effective Jan 2026). Rows not printed
in C2 are untouched since 2022 — verified against C4 (2019) where the row exists in both.

### Electrical (permit fees)

| Scope | Fee | Notes |
| --- | --- | --- |
| Installation of electrical service only, less than 400 amps | **$75** | drawings per §14E-2-215.5 |
| Installation of electrical service only, 400 to less than 1,000 amps | **$300** | |
| Installation of electrical service only, 1,000 amps or more | **$750** | |
| Installation of low-voltage electrical system | **$75 per system per floor** | footnote f: telephone, security, cable and media are each separate systems |
| Installation of low-voltage electrical system within or serving a single dwelling unit | **$75 per system** | |
| Installation of permanent power generator, whether required or discretionary | **$750** | renamed from "power generator" and given footnote c (stacks with a §1204.3 fee) in 2026; amount unchanged |
| Installation of permanent power generator for residential building with 3 or fewer dwelling units (no mixed occupancy) | **$75** | footnote c, same 2026 change |
| Installation of emergency lighting system | **$125** | |
| Installation of electrical system for outdoor illumination per 1,000 square feet of parking lot or landscape area | **$75** | |
| Installation of up to 10 new circuits on a single service | **$150** | |
| Installation of 11 to 20 new circuits on a single service | **$300** | |
| Installation of 21 to 40 new circuits on a single service | **$600** | |
| Installation of 41 to 80 new circuits on a single service | **$1,500** | |
| Installation of 81 new circuits or more on a single service | **$2,250** | |
| Repair or alteration of devices on existing electrical circuits | **$75 per service** | |
| Solar panel installation (less than 13.44 kW) with or without installation of energy storage system (up to 20 kWh) | **$225** | 2026 wording adds storage; zoning fee applies |
| Solar panel installation (13.44 kW or greater) (no energy storage system) | **$250 per array ($1,000 minimum)** | footnote c; zoning fee applies |
| Temporary electrical service | **$150** | |
| Electrical maintenance (per building, per 30 days) | **$75** | monthly permit, footnote c |

### Plumbing (permit fees)

| Scope | Fee |
| --- | --- |
| Install private swimming pool or hot tub (electrical work as a separate permit) | **$400** |
| Repair or in-kind replacement of hot water heater (individual equipment) or plumbing fixtures without alteration to plumbing in walls | **$75 per dwelling unit, toilet room, or tenant space** |
| Repair or in-kind replacement of hot water heater serving more than one dwelling unit or tenant space without alteration to plumbing in walls | **$150 each** |
| Repair or in-kind replacement of plumbing piping, all occupancies | **$150 per dwelling unit, toilet room, or tenant space** |
| Repair or in-kind replacement of plumbing riser within existing plumbing chase | **$150 per dwelling unit, toilet room, or tenant space served** |
| Plumbing maintenance (per building, per 30 days) | **$75** (monthly permit, footnote c) |

Adjacent rows other trades may look for (same table, named in prose): Repairs — minor
scope not involving HVAC/electrical/plumbing, $175 per dwelling unit or tenant space;
Roof — rooftop structure $175, roof repair/recover $175, roof replacement $450; fence up
to 6 ft $75 (2026 amended, see open questions); fire escapes $150/$450/$900 per fire
escape; porch/deck/balcony rows $75–$300 per structure; construction trailer $250 per
year.

## 5. Amendment chain (why 2022 + SO2025-0021719 is the current stand-alone table)

- The stand-alone table lives in the **code** (Title 14A), not in DOB's annual fee
  tables — DOB's annual PDFs only re-print the CPI-adjusted Tables 14A-12-1204.3(x)
  under §14A-12-1204.3.1.
- Annual CPI adjustment of the *stand-alone* table is brand new: SO2025-0021719 §9 inserts
  **§14A-12-1204.2.1**, "Beginning in 2026 … prepare a fee schedule, based on Table
  14A-12-1204.2 … effective on January 1 of the succeeding year." The first such schedule
  would take effect **2027-01-01**; for calendar 2026 the code amounts below stand.
- Revenue ordinances checked through the City Clerk's Legislation API: the 2024 revenue
  ordinance (SO2023-0005293) amends Titles 2, 3, 9, 11, 14; the 2025 one
  (SO2024-0013671) Titles 3, 4, 9, 10; neither touches Title 14A. The 2022 revenue
  ordinance (O2021-4786) is already reflected in C3 (effective 2022-01-01). The 2026
  revenue ordinance SO2025-0021719 is the only amender of Table 14A-12-1204.2 between
  2022 and today, and its §8 prints exactly which rows changed (generators, solar,
  administrative wording, monthly permits, fence, fire escapes, porch, trailer).
- amlegal's Code Library (the City-Linked publisher of the Municipal Code) is behind
  Cloudflare from this environment (403) — the eLMS API + ordinance PDFs are the official
  route actually used.

## 6. Modelled / not modelled

**Modelled**

- Building: `CF × RF × A` for Table (3) new construction and Table (4) rehabilitation,
  with row minimums (flat, per-story, per-unit) and the $602/$302 global floors, and the
  flat demolition fees of Table (4) footnote d. Shipped as **two lookup tables plus a
  floor table** in one rule each (`rateTables`/`floorTable`), so the rate is the product of
  the two matched rows as exact fractions rather than a rule per cell. Table (4)'s "All
  occupancies" block is expanded across the fourteen classifications the schedule prints it
  for, and Group R's single printed row across R-1 to R-5, at load time — 246 rehabilitation
  rows and 45 new-construction rows from 97 hand-transcribed rows. Mixed Occupancy is not
  among them (see below).
- Electrical: every Electrical row of Table 14A-12-1204.2 above, as separate stacking
  components (the schedule says each applicable fee is included when a permit covers more
  than one scope). The service rows are banded by the amperage the applicant gives; the
  circuit rows by the count on a single service; the low-voltage row prices **one count of
  system installations**, which collapses its two published dimensions ("per system per
  floor") into the count a reader can supply; repair-of-devices and the monthly maintenance
  permit are charged as the single-service and single-building amounts, since that is the
  common case and the page says so.
- Plumbing: every Plumbing row of Table 14A-12-1204.2 above, as separate stacking
  components. The three per-unit rows read the number of dwelling units, toilet rooms or
  tenant spaces the work reaches; the pool row is flat; the water heater serving more than
  one unit is the $150.00 "each" amount charged once.

**Not modelled, and why**

- **Table (5) exterior wall rehabilitation** — §14A-4-412.2.2.2 requires CF from Table
  14A-12-1204.3(2), which is `[Reserved]`. There is no published construction factor for
  it; any figure would be invented.
- **Table (6) phased permitting** — the first row prints no factor, and the 0.75 row's
  minimum is "per Table 14A-12-1204.3(4)" (a floor defined by reference). Named on the
  page rather than half-transcribed.
- **Revision permits** (§14A-4-412.2.2.4, page-proportional) and the **penalty**
  (§14A-4-412.2.2.3, up to the deposit) — discretionary determinations by the building
  official, not schedules.
- **Mixed-occupancy weighting** (Table 1 footnote a) — a weighted CF needs each
  occupancy's area; the predominant-occupancy rule (≥85%) is what a reader can use, so the
  page says to enter the predominant group.
- **Process fees** (deposit, review fee, extension/reinstatement, pre-review, debt
  check), **inspection fees** (§14A-5-503), **stop-work-order penalties**, and other
  departments' fees (zoning fees printed in Table 14A-12-1204.2, sprinkler/standpipe
  review under Municipal Code §15-16-190, fire fees under §11-4-130, regulated equipment
  under §11-4-2170) — named in `notIncluded`.
- **Two electrical rows that need a second dimension**: installation of an electrical
  system for outdoor illumination, $75 per 1,000 square feet of parking lot or landscape
  area (a second area figure, distinct from the building's floor area), and solar arrays of
  13.44 kW or more, $250 per array with a $1,000 minimum (an array count). Both amounts are
  named on the page; neither is applied to a figure the calculator does not ask for.
- **`per_unit` rows read by a count the calculator cannot verify**, listed here for the
  record: the low-voltage row's "per floor" multiplier and the maintenance permit's "per
  building" are the reader's counts, stated on the page rather than inferred.
- **Zoning fee / drawings-required columns** of Table 14A-12-1204.2 — flags, not amounts.

## 7. Open questions

1. **Fence fee row prints two amounts** in C2 §8: "$150 $75". Ordinance markup (struck vs
   underscored) is drawn as lines in the PDF and pdftotext cannot distinguish them. Not
   needed for the three published pages; recorded so the next reader does not re-derive
   it. (A third-party guide reading the ordinance says $75 — unverified against the
   official markup.)
2. **Table (6) first row ("Caissons only…")** prints no factor cell. Whether it inherits
   0.25 from the row below or is its own row is not resolvable from the text layer; Table
   (6) is not modelled for that reason as well as footnote-reference floors.
3. **Row minimum vs global floor**: read as `max(row, $602)`. The alternative reading
   (row minimum replaces the global floor) would change only the $300/$600 rows, where
   the two readings differ by $2 and $2. The pages state the floor they apply.
4. **"$900 per story" / "$250 per unit served" / "$300 per unit" floors** need a story
   count and a dwelling-unit count the calculator does not ask for. The page asks for
   them as inputs (`custom.stories`, `units`) and says why.

## 8. Worked figures asserted in tests (all computed by the engine, checked by hand)

To be listed in `tests/content/chicago-seed.test.ts` once the payload exists; the
hand-checks behind them:

- Group B, Type II, new construction (factor 1, min $3,650), 10,000 sq ft:
  0.78 × 1 × 10,000 = **$7,800.00**.
- Group R-2, Type III, "1–3 dwelling units, max 4 stories" (0.75, min $2,450), 2,400 sq ft:
  0.78 × 0.75 × 2,400 = **$1,404.00** → floored to **$2,450.00**.
- Group B, Type II, Level 1 alteration (0.25, min $600 printed), 1,500 sq ft:
  0.78 × 0.25 × 1,500 = **$292.50** → floored to **$602.00**. The row prints $600
  and footnote c's city-wide floor is $602, and both are minimums, so the larger is
  what is collected — the reading §7.3 records, applied consistently here.
- Group A, Type I, all new construction (1, min $3,650), 42,000 sq ft:
  0.97 × 1 × 42,000 = **$40,740.00**.
- Ordinary demolition, Group B Type II, any area: flat **$600.00** (footnote d),
  raised to **$602.00** by the same city-wide floor; complex demolition **$2,450.00**,
  which the floor does not reach.
- Electrical: 200 A service (<400 A row) + 18 new circuits (11–20 row) → 75 + 300 =
  **$375.00**; plus a permanent generator (residential ≤3 units) → + $75 = **$450.00**.
- Plumbing: water-heater replacement in 6 dwelling units → 6 × $75 = **$450.00**; pool
  install → + $400 = **$850.00**.
- Temporary structure, Group U Type V, 800 sq ft with 2 stories: 0.23 × 0.5 × 800 =
  $92.00 → floored to **$302.00** (footnote c's temporary-structure floor, not $602).
- A residential porch/balcony row (0.5, "$250 per unit served") at 5 dwelling units:
  max(computed, $602, 5 × $250) = **$1,250.00**.

Where the two readings of §7.3 differ, this site publishes the `max(row, global)` one,
so the $600 row appears as $602.00 and the $300 row as $602.00 (and $302.00 for a
temporary structure). The table's own $600 and $300 are last year's floors, which is
the evidence that the global floor is the one that binds.
