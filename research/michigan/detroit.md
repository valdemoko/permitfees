# Detroit, Michigan — research record

**Status: published** (Michigan, research pass 15 — the state's first jurisdiction). Three permit
pages: building, electrical and plumbing. Verified **2026-09-25**, every figure read from a City of
Detroit document on that date.

- **Issuing authority:** the **Buildings, Safety Engineering, and Environmental Department
  (BSEED)** issues building permits (commercial, residential, sign), demolition/wrecking permits and
  the trade permits — mechanical, electrical, plumbing, elevator, fire alarm, generators and
  boilers. The City's own pages list the six trade teams of the Construction Inspection Division:
  boilers, buildings, electrical, elevators, mechanical, plumbing.
- **Portal:** applications run through **Accela / eLAPS** (`https://permits.detroitmi.gov`) with
  plans uploaded to ProjectDox ("ePLANS"); inspections are scheduled in Accela or at the
  Construction Division Office. Customer help line **(313) 224-3179**; general customer service
  **(313) 224-3202**. Trade-code questions: Electrical 313-224-3228, Mechanical 313-224-0113,
  Plumbing 313-224-3118.
- **Address:** Coleman A. Young Municipal Center, 2 Woodward Ave., Detroit, MI 48226 (Construction
  Inspection in Suite 408; permits and licensing on the same campus).

## 1. Sources, all read 2026-09-25

| # | Document | URL | Why it matters |
| --- | --- | --- | --- |
| S1 | **BSEED Fee Schedule, effective January 1, 2024, modified July 18, 2025** (51 pages) | `https://detroitmi.gov/sites/detroitmi.localhost/files/2025-12/Fee%20Schedule.Effective_January_1_2024_Modified%20July%2018%2C%202025.pdf` | The schedule in force. Parts A–C (licenses, certificates, service fees), the building/residential block (A building permits … F plan review), then the **ELECTRICAL**, **PLUMBING** and **MECHANICAL** trade sections, then property maintenance, dangerous buildings, vacant property and the administrative tail. Every figure this site charges comes from it. |
| S2 | **Building Permit Fees** document page | `https://detroitmi.gov/document/building-permit-fees` | The page that links S1 as the current download ("Download the latest list of fees for permits"), which is how the document in force was told from the older schedules still on the domain. |
| S3 | **Building Permits** — City of Detroit | `https://detroitmi.gov/departments/buildings-safety-engineering-and-environmental-department-bseed/building-permits` | The seven-step process, the Accela/ProjectDox submission rules, the license rules per permit type ("No license required" for commercial; residential contractors need a Builder's License and City registration), sealed plans, and the published turnaround times (5 days residential, 20 days commercial). |
| S4 | **Trade Permits** — City of Detroit | `https://detroitmi.gov/departments/buildings-safety-engineering-and-environmental-department-bseed/trade-permits` | The permit-type matrix for mechanical, electrical, plumbing, elevator, fire alarm, generators and boilers: when a trade permit is needed, the licence each trade requires ("City of Detroit licensed Electrician/Plumbing Contractor/Mechanical Contractor"), what an owner must bring (deed + ID), and the published turnaround (1 day mechanical, 2 days electrical, 1 day plumbing). |
| S5 | **Construction** — City of Detroit | `https://detroitmi.gov/how-do-i/apply-or-renew-permit-or-certification/construction` | Submittal requirements in the City's own words (sealed drawings by a Michigan-registered architect or engineer, three sets plus calculations and specifications, site plan, geotechnical report), the codes in force, the trade division phone numbers, and the ten facts about certificates of occupancy. |
| S6 | **Permits & Plan Review** — BSEED | `https://detroitmi.gov/departments/buildings-safety-engineering-and-environmental-department-bseed/bseed-divisions/permits-plan-review` | What plan review *is* here — "verification of compliance to City of Detroit Zoning Ordinance, Michigan Building Code, Michigan Residential Code, Michigan Rehabilitation Code, Michigan Electrical Code, Michigan Mechanical Code, Michigan Plumbing Code, International Fuel Gas Code, City Elevator Code and Boiler Code" — plus the ePLANS workflow, the plan checklists and the Pre-Plan Consultation. |
| S7 | **Construction Inspection** — BSEED | `https://detroitmi.gov/departments/buildings-safety-engineering-and-environmental-department-bseed/bseed-divisions/construction-inspection` | The six trade teams with their supervisors and phones, the Certificate of Occupancy / Certificate of Acceptance procedure (72-hour turnaround), inspection scheduling, and the fire-alarm permitting update: "No separate building permit is required solely for fire alarm systems when a Fire Marshal permit has been issued … Trade permits (electrical, mechanical, etc.) are still required for applicable installation work." |
| S8 | **BSEED department page** | `https://detroitmi.gov/departments/buildings-safety-engineering-and-environmental-department-bseed` | The department's own description of what it issues ("Apply for a Building Permit / Apply for a Electrical, Plumbing or Mechanical Permit"), the division map, and the links to the permit portal (`https://permits.detroitmi.gov`) and the fee schedule. |

S1 was downloaded and read in **three** `pdftotext` modes — `-layout`, plain, and `-table` — because
the first two mis-pair labels with amounts in this document: `-layout` pushes the whole "Fee Amount"
column into its own stream of numbers with no row to belong to, and plain mode separates every label
from every amount. `-table` pairs them correctly, and it is the pairing recorded here (the same
three-mode reconciliation Scottsdale and Philadelphia needed, in a fourth form).

## 2. The mechanism

**Three schedules in one document: a valuation ladder for building, itemised fees for the trades,
and percentages for plan review.**

### 2.1 Building — a nine-band ladder on project cost

Page 7 of S1, under "A: BUILDING and RESIDENTIAL PERMITS / New Buildings, Alterations, Repairs, And
Additions":

> The following general building permit fees are based on the project cost (design and construction
> cost) estimated using the square foot cost table copy attached:

| Band | Base (fee for the first N) | Rate over the threshold |
| --- | --- | --- |
| $2,000 or less | **$271.43** flat | — |
| Over $2,000 – $25,000 | first $2,000: **$271.43** | **$34.09** per $1,000 or fraction over $2,000 |
| Over $25,000 – $100,000 | first $25,000: **$1,055.57** | **$24.53** per $1,000 or fraction over $25,000 |
| Over $100,000 – $500,000 | first $100,000: **$2,895.29** | **$27.82** per $1,000 or fraction over $100,000 |
| Over $500,000 – $1,000,000 | first $500,000: **$14,024.05** | **$26.24** per $1,000 or fraction over $500,000 |
| Over $1,000,000 – $5,000,000 | first $1,000,000: **$27,143.33** | **$11.54** per $1,000 or fraction over $1,000,000 |
| Over $5,000,000 – $20,000,000 | first $5,000,000: **$73,287.00** | **$5.97** per $1,000 or fraction over $5,000,000 |
| Over $20,000,000 – $50,000,000 | first $20,000,000: **$162,859.99** | **$3.62** per $1,000 or fraction over $20,000,000 |
| Over $50,000,000 | first $50,000,000: **$271,433.32** | **$1.81** per $1,000 or fraction over $50,000,000 |

Three things about it, all read rather than assumed:

1. **The phrase is printed.** Every rate row says "or fraction thereof", so the amount above each
   threshold rounds up to a whole $1,000 — the opposite of Pittsburgh's block, which omits the
   phrase and prorates. Same engine, two readings, each sourced.
2. **The bands do not chain exactly.** The published base of each band is what the band *below*
   claims at its own top, minus a rounding seam: $271.43 + 23 × $34.09 = $1,055.50 against the
   printed $1,055.57 (7¢); $1,055.57 + 75 × $24.53 = $2,895.32 against $2,895.29 (3¢); and the
   seam grows to $16.33 at $5,000,000 and $26.67 at $50,000,000. So each band is modelled with
   **its own printed base and its own printed rate**, never by chaining the arithmetic — the
   document's figures are the document's figures.
3. **The first band is the minimum.** "$2,000 or less → $271.43 flat" is a floor stated as a band:
   a $500 repair permit is $271.43. Modelled as that band rather than as `minimumCents`, because
   the schedule writes it as a row of the same table.

The **basis** is project cost (design and construction cost), which the City says it estimates
"using the square foot cost table copy attached" — see the open questions: that table is not in the
PDF and was not linked from any page read on 2026-09-25.

### 2.2 Electrical — a base fee plus itemised rows, keyed on counts and amperage

Page 19 of S1 opens the ELECTRICAL section with **"PART A / Base fee / Base / $66"**, and the
section carries its own note: **"NOTE: Base Fee does not apply to a permit containing only Part B
items."** The modelled rows:

| Row | Published fee |
| --- | --- |
| A1: each circuit (new or extended, altered or removed) | **$20** each |
| A3: fixtures — residential | **$1.17** per fixture |
| A3: fixtures — commercial (luminaires) | **$1.46** per fixture |
| A5: service, 1,000 volts or less | 100 A or less **$59**; over 100–200 **$117**; over 200–400 **$176**; over 400–800 **$293**; over 800–1,200 **$527**; over 1,200 **$820** |
| A5: service, over 1,000 volts | 200 A or less **$281**; over 200 A **$422** |

The residential/commercial fixture split is a *fee row*, not an occupancy class the City defines on
this schedule; the site reads it from `occupancy`, defaulting to the commercial figure — the same
column default used everywhere else. Service size is read from `custom.amperage`, and the
over-1,000-volt table from `custom.over_1000_volts`, so exactly one service row can fire.

Named and not modelled: A2 rough inspection ($59 for one- and two-family dwellings), A4 electrical
units by nameplate HP/kW/kVA in seven bands ($29–$254), A6 interruptible service ($53), A7
distribution panel boards and transfer switches by amperage ($51–$322), A8 hardwired cooking,
dryers and water heaters ($45), A9 feeders ($41 per 100 feet or fraction), A10 underfloor headers
($70 per 100 feet), A11 motion picture apparatus ($70), A12 sign connection ($22), A13 outline neon
($59 per 25 ft), A14 residential smoke alarms ($2.81), and Part B in full — general repairs at
$176/hour, special inspections at $176/hour, service reconnect ($86 up to 200 A, $106 to 400 A,
$190 above, plus $176/hour), multi-family and commercial rough inspections by the hour, special
event inspections, the industrial/commercial annual permit, fire alarm systems, EV charging
stations, telecommunications cabling and renewable energy installations.

### 2.3 Plumbing — a non-refundable application fee plus per-item rows

Page 28 of S1, "PLUMBING / INSTALLATION PERMITS":

| Row | Published fee |
| --- | --- |
| Application Fee (Non-Refundable) | **$73** flat |
| Each: stack, stack alteration (soil, waste, vent, conductor), sump, interceptor, pump, device, plumbing fixture, plumbing appliance, plumbing appurtenance, plus any other fixture, drain, water-connected appliance or appurtenance not specifically listed | **$44** each |
| Building drain, building sewer (sanitary, storm, manhole, catch basin, combined) each one | **$146** each |
| Manhole, catch basin, each one | $53 each |
| Medical gas system: minimum one hour, then each additional half hour | $176 / $88 per hour and half hour |
| Water distribution system, each one | $66 each |
| Water service (curb stop into the house) | $88 each |
| Re-inspection fee (work not ready, no access, etc.) | **$176** per re-inspection |

The $44 row is the schedule's own catch-all — it enumerates eight things and then "any other … not
specifically listed" — so one `fixtures` count prices all of them, which is what the row means.
The $146 row is the separate `connections` count for drains and sewers. The application fee is
**non-refundable and not credited** anywhere in the document, so it is charged as its own line
rather than as a floor (the opposite of Philadelphia's filing fee, whose page says "applied toward
the final permit fee").

Also read in the mechanical block that follows: unfired pressure vessels ($100–$190 by diameter),
power and process piping ($249 base + $176/hour), hazardous gases ($125–$403 by quantity), boilers
($112 commercial / $95 residential installation, plus annual and biennial licences), gas-fired
equipment ($203 central heating units, $148 burner/furnace alterations), fire suppression and
refrigerating systems — all named on this site's pages and none of them modelled.

### 2.4 Plan review: a percentage, a deposit, and a per-sheet fee

Page 14 of S1, "F: PLAN REVIEW":

- **As part of Building Permit Processing** — "A fee is charged for Electrical, Mechanical and
  Plumbing plan review. This fee must be prepaid when a plan review is required." Each of the three
  trades is **7% of Bldg. Permit Fee**, and **Building, Structural, and Zoning Code Plan Review
  (Deposit)** is **35% of Bldg. Permit Fee**.
- **Revised plans**, and **plan review not as part of building permit processing**, are priced the
  same way: **$158** for the first three sheets and **$53** for each additional sheet, per
  discipline.
- Page 15 then states the deposit: "The non-refundable deposit is the sum of 35% of the building
  permit fee which is the permit processing and building, structural and zoning plan review
  expenses, plus plan handling and routing fee plus electrical, mechanical and plumbing plan review
  fees. **The deposit of 30% Building Permit fee is adjustable towards the full fee when a final
  building permit is procured.**"

Two readings that document does not settle are recorded as open questions; nothing in this section
is charged on any page here, because every one of the three charges either needs a sheet count this
site does not collect, needs a *building* permit fee that a stand-alone trade permit does not have,
or is a deposit whose credit relationship to the final fee is stated in two different percentages.

### 2.5 Refunds, and the rest of the schedule

Page 7's REFUNDS block: refunds must be requested within a year, "An amount equal to **35% of the
Building Permit Fee** shall be deducted for all Building Permit Fee Refunds to cover the expenses
for Zoning, Structural and building plan reviews and permit processing", and **25%** of any permit
or application (capped at $100) for general overhead. Also on the schedule: delinquent service
charge 10%, returned-check fee $35, site plan review ($210 minor / $466 major), zoning fees,
demolition by cubic volume (§2.6), sign permits, certificates of occupancy ($147), temporary
certificates ($520), permit extensions ($227), consultation meetings ($190), "fail to obtain
permit" and "fail to gain access" charges ($176 each), overtime inspections, property maintenance
and dangerous-building fees, and the whole licence and examination catalogue of Parts A–C.

### 2.6 Demolition is a different schedule inside the same document

Page 12: wrecking/demolition is priced on **cubic volume**, not money — "Not exceeding 30,000 cu.
Ft. — without basement: $143 / with basement: $249" each, and the Detroit Demolition Wrecking Fee
of $238 (≤30,000 cu. ft.), $319 base + $66 per 10,000 cu. ft. or fraction (30,000–60,000), $425
base + $35 per 10,000 cu. ft. or fraction (over 60,000), with explosives at $8,858 on top. Because
it is a different basis for a different permit, the building ladder on this site **excludes
`work_type = demolition`** rather than pricing a wrecking job from a construction valuation — the
same "charges nothing rather than guessing at a work type it has not modelled" discipline Durham
uses.

## 3. What is modelled

- **Building (9 rules):** the nine bands of §2.1, each as its own rule with its own printed base,
  its own printed rate, the "or fraction thereof" rounding, and a condition on the project-cost
  range — plus the demolition exclusion above.
- **Electrical (12 rules):** the $66 Part A base fee; $20 per circuit; fixtures at $1.17 residential
  and $1.46 commercial; and the eight service bands of §2.2 as gated rows (six at 1,000 volts or
  less, two above), each mutually exclusive by amperage range and voltage class.
- **Plumbing (4 rules):** the $73 non-refundable application fee, $44 per listed item, $146 per
  building drain or sewer, and the $176 re-inspection behind `custom.re_inspection`.

Every rule reads `valuation`, `occupancy`, `fixtures`, `custom.circuits`, `custom.amperage`,
`custom.over_1000_volts` or `custom.re_inspection` — nothing else, because no other fact on this
schedule moves a figure.

## 4. What is NOT modelled

- **Plan review**, all three of its published forms (§2.4): the 7% trade percentages, the 35%
  deposit, and the $158 + $53-per-sheet per-discipline fee. Each is named with its amount and its
  reason — a cross-permit percentage, a deposit with an unresolved credit, and a sheet count no
  input collects.
- **The 30% deposit credit** and the refund deductions (35% / 25% capped at $100): money that moves
  in the other direction or after the fact, named on every page and never summed.
- **The square-foot cost table** the City uses to estimate project cost (§6) — the basis is named,
  the estimator is not.
- **Demolition and wrecking** (§2.6), priced by volume on a different permit.
- **Every row of the trade sections not listed in §2.2 and §2.3**: rough inspections, reconnects,
  hourly and special inspections, annual permits, fire alarm, EV charging, telecom cabling,
  renewable energy, and the whole mechanical block (pressure vessels, piping, gases, boilers,
  gas-fired equipment, fire suppression, refrigeration).
- **Change of Use** ($249), revised permits ($187 minimum, plus the difference between the new and
  old permit fee), signs (§2.5's block), zoning and site plan review fees, certificates of
  occupancy and temporary certificates, permit extensions, "fail to obtain permit" charges, property
  maintenance, dangerous buildings, vacant property, and Parts A–C of the schedule (licences,
  examinations, certificates and copies).
- **Water and sewer permits** (Water & Sewerage Department) and **right-of-way permits**
  (Department of Public Works) — the building page sends readers there in the City's own words.
- **Payment and delinquent charges**: 10% delinquent service charge, $35 returned-check fee.

## 5. Effective dates and access

- **Fees as modelled:** `effectiveFrom = 2024-01-01` — the schedule's own header, "EFFECTIVE,
  JANUARY 1, 2024", as modified **7/18/2025** (the modification date is printed in the same
  header on all 51 pages). The document page (S2) links this file as the current download on
  2026-09-25.
- **Older schedules still on the domain**: a 2009 "GENERAL FEE SCHEDULE" under
  `/Portals/0/docs/Permits/BSEED/` is superseded and was read only to confirm it is not the linked
  document — its refund sentence still says 30% where the current one says 35%, which is how the two
  were told apart.
- **Access:** `detroitmi.gov` answers plain clients directly — the fee schedule PDF (538 KB) and
  every service page above returned HTTP 200 without a bot challenge. The only friction was
  extraction, and `-table` resolved it (§1).

## 6. Open questions

- **Where the square-foot cost table lives.** The fee basis is "the project cost (design and
  construction cost) estimated using the square foot cost table copy attached" — attached to the
  printed schedule, not present in the PDF's 51 pages, and not linked from the building-permits,
  construction, plan-review or BSEED pages read on 2026-09-25. The *basis* (project cost) is
  unambiguous and modelled; the City's own estimator for an applicant without a contract price is
  not published anywhere this pass could reach. A search of the domain for the table's own words
  returns only the sentence that refers to it.
- **Which permit fee the 7% plan-review percentages are read from.** The unit column prints "% of
  Bldg. Permit Fee" beside Electrical, Mechanical and Plumbing plan review, under a heading "As
  part of Building Permit Processing". Either each trade's review is 7% of the *building* permit
  fee being processed (which a stand-alone trade permit does not have), or the column is the
  schedule's generic "permit fee" and it is 7% of that trade's own permit fee. Nothing on the page
  disambiguates, so neither is charged and both are recorded.
- **The deposit's two percentages.** "The non-refundable deposit is the sum of 35% of the building
  permit fee" and, two sentences later, "The deposit of 30% Building Permit fee is adjustable
  towards the full fee when a final building permit is procured". Whether 30% is a subset of the
  35% (net cost: permit fee + 5%) or a second sum paid alongside it (net: permit fee + 35%, with
  30% credited against the fee) changes what a filer pays, and the document says both. Charged:
  neither. Named: both.
- **The $53 "Manhole, Catch Basin" row sits under a $146 row that already lists manhole and catch
  basin.** The $146 row reads "Building Drain, Building Sewer (sanitary, storm, manhole, catch
  basin, combined) each one" and the next line is "Manhole, Catch Basin, each one — $53". The
  relationship between them — separate scopes, or a partial list — is not stated, so only the
  unambiguous $146 drain/sewer row is modelled.
- **Whether the $66 electrical base fee is per permit or per application.** It is printed once at
  the head of PART A with the Part B exception beneath it; the schedule never says "per year" or
  "per application", so it is modelled as one charge per permit, which is what "Base fee" without a
  unit means everywhere else in this document.
- **Cross-jurisdiction note, not a resolution.** Michigan's two published passes will share a state
  code and nothing else: Detroit's building fee is a nine-band ladder on project cost, and Grand
  Rapids's is a base fee plus an incremental per-$1,000 row under Chapter 131. Two cities, one
  state, two mechanisms — which is the reason both were picked.
