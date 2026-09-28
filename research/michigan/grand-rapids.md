# Grand Rapids, Michigan — research record

**Status: published** (Michigan, research pass 15 — the state's second jurisdiction). Three permit
pages: building, electrical and plumbing. Verified **2026-09-25**, every figure read from a City of
Grand Rapids document on that date.

- **Issuing authority:** the **Planning, Design and Development Department** — its **Building
  Inspections Division** prints the "CONSTRUCTION CODE ADMINISTRATION FEES" schedule, and applicants
  deal with the **Development Center** (1120 Monroe Ave. NW, 3rd Floor, Grand Rapids, MI 49503).
- **Contacts:** phone **616-456-4100**, fax 616-456-4088, email **devcenter@grcity.us**, hours
  Mon–Fri 7:30 AM – 4 PM. All three pages print the same block.
- **Portal:** **Accela Citizen Access** at `https://aca-prod.accela.com/GRANDRAPIDS` (the "Citizen
  Access Application Portal" link on every Development Center page), with plans through the City's
  **ePlan Room**.
- **The mechanism in one line:** the building permit is a four-component stack — **$54 application +
  $6.80 per each additional $1,000 + a commercial-only plan review + a zoning fee** — where two of
  the four are *percentages of the fee itself* floored or capped into whole dollars, and the City's
  own calculator reproduces that arithmetic as inline JavaScript on the fee page.

## 1. Sources, all read 2026-09-25

| # | Document | URL | Why it matters |
| --- | --- | --- | --- |
| S1 | **PLANNING, DESIGN, and DEVELOPMENT FEE SCHEDULE, FY 2027** (effective July 1, 2026) | `https://media-002-us.cdn.govstack.com/grandrapidsmi-us/media/4lzl0erl/planning-design-and-development-fee-schedule-fy2027.pdf` | The schedule in force. Building division fees (permits, administrative, electrical, mechanical, plumbing), the Planning Division fees, the building-use group classifications, and the **BUILDING PERMIT FEE CHART** — 500 printed rows keyed by $1,000 value ranges with every component and both totals. Every amount this site charges comes from it. |
| S2 | **Grand Rapids Building Permit Fee Calculator** (the fee page itself) | `https://www.grandrapidsmi.gov/grow-and-thrive/development-center/building-permit-fees/` | The page links S1 as "a full list of fees" and carries the **Estimated Permit Fee Calculator as inline JavaScript** — the four result lines (`Building Application Fee / Permit Fee / Plan Review Fee / Zoning Fee`), the constants (`revMin 50`, `zoneMin 25`, `zoneMax 290`, `residentialZoneCap 25`), `units = floor((value − 1000)/1000)`, `baselinePermitFee = units * 6.8`, `floor(0.68 * units)` for both zoning and plan review, and the three project-type branches. Also defines the occupancy split: *"Residential projects include only single-family homes or duplexes. For projects with three or more residential units, please select commercial."* and disclaims: *"This estimate does not include trade, planning, or land use develoment permit fees, such as Electrical, Plumbing, or Mechanical permits."* |
| S3 | **Permits — City of Grand Rapids** | `https://www.grandrapidsmi.gov/grow-and-thrive/development-center/permits/` | The permit taxonomy (residential building = single-family and duplex; commercial building and multiplex = 3+ units; trade permits = "Applications for mechanical, electrical, and plumbing permits"; right-of-way), the portal link (`https://aca-prod.accela.com/GRANDRAPIDS`) and the Development Center contact block. |
| S4 | **Trade Permits** | `https://www.grandrapidsmi.gov/grow-and-thrive/development-center/permits/trade-permits/` | The nine trade-permit cards (commercial/residential electrical, mechanical, plumbing, plus CO₂, sprinkler and fire alarm permits) and the framing: an electrical permit is needed for work "under the Michigan Electrical Code or Michigan Residential Code", a mechanical one under the Michigan Mechanical Code. Several card descriptions are visibly copy-paste mismatches (the LUDS paragraph sits on the residential electrical and plumbing cards) — recorded, not quoted for any figure. |
| S5 | **Residential Building Permits** | `https://www.grandrapidsmi.gov/grow-and-thrive/development-center/permits/residential-building-permits/` | The filing rule in one sentence — *"To apply, you must be either the property owner or a licensed contractor"* — the full application list (new/addition, remodel, ADU, accessory structure, re-roof/re-side, demolition, temporary occupancy, the three trade applications, water/sewer connection, deck, driveway, fence, pool, change of use) and the LUDS trigger: *"A LUDS site plan review is required on single-family or duplex properties when the parcel is within 500 feet of a body of water or wetland."* |

**Extraction, in three modes.** S1 was read with `pdftotext -layout`, `-table` and `-raw`, because
`-layout` mispairs rows in this document exactly as it does in Detroit's: in the electrical section
it drops the "$4.00" of *Alternative Power, ea. add'l 1 KW* and shifts every row below it (reading
*Fire Alarm, up to 10 Devices* as $4.00 where the table is $63.00), then runs out of alignment
entirely, leaving orphan amounts ($26.00, $52.00) with no label at the section's end. `-table` and
`-raw` agree with each other on **every** disputed row, so their pairing is the one recorded here
(the same two-of-three reconciliation Detroit needed). The fee chart itself parses cleanly in both
`-layout` and `-table`; all 500 rows were extracted programmatically and checked (§2.1).

## 2. The mechanism

### 2.1 Building — a four-component stack, two of whose parts are percentages of the fee

S1's BUILDING PERMITS block and its footnote:

> **Building Permit, Base Fee** — City Code, Chapter 131 — **$54.00 plus Zoning Permit fee**
> **Building Permit, Incremental Fee** — City Code, Chapter 131 — **$6.80**
>
> ¹ Base fee charged for first $1,000 of construction cost; incremental fee charged for each
> additional $1,000 of construction/contract cost.
>
> ⁶ For 1-2 family residential projects, a $25 Zoning Permit fee typically is added to the Building
> Permit fee. For all other projects, a maximum $290 Zoning Permit fee typically is added; this fee
> is implemented on a sliding scale so as not to be more than 10% of the Building Permit fee.

And S1's BUILDING PERMIT FEE CHART (FY 2027) prints the whole arithmetic as a table — columns:
`Value Range | App Fee | Com Plan Review | Permit Fee | Zoning (Residential/Commercial) | Total
Permit Fee (Residential/Commercial)` — 500 rows from $1–$1,000 to $500,001–$501,000. All 500 rows
were parsed and checked against four formulas; **every row matches every formula**:

| Component | Formula (verified on all 500 rows) | Modelled as |
| --- | --- | --- |
| App Fee | **$54.00**, every row | `flat` $54 |
| Permit Fee | **$6.80 × units**, units = the row's whole thousands above the first ($1–$1,000 row prints `-`) | `per_thousand` $6.80 with a $1,000 threshold and a $1,000 round-up increment |
| Com Plan Review | **max($50, floor(units × $0.68))** — whole dollars, commercial rows only (the residential total never includes it) | `tiered_table` over valuation, 501 printed tiers, commercial only |
| Zoning, residential | **$25.00**, every row | `flat` $25, residential |
| Zoning, commercial | **clamp(10% × (54 + 6.80 × units), $25, $290)** in exact cents — e.g. units 29 → $25.12, units 149 → $106.72, capped from units 419 | `percent` 10% of the permit fee with a $25 floor and a $290 cap, commercial only |
| Total Residential | App + Permit + Zoning-res — **never** plan review | the sum of three rows |
| Total Commercial | App + Com Plan Review + Permit + Zoning-com | the sum of four rows |

Two boundary checks straight from the chart: the $50 plan-review floor stops binding at the
$74,001–$75,000 row (units 74 → floor(50.32) = 50; units 75 → 51); the $290 zoning cap first binds
at $419,001 (10% × (54 + 6.80×419) = $290.32 → $290), and the $25 zoning floor stops binding at
units 29 ($25.12).

**Where the City's calculator and the chart disagree — the chart wins.** S2's inline script computes
`units = Math.floor((value - 1000) / 1000)` (rounding the partial thousand **down**, where the
chart's rows charge the row's units and therefore **up**: $150,001 is the $1,020.00 row, not
$1,013.20) and `baselineZoningFee = Math.floor(0.68 * units)` clamped [25, 290] — which omits the
$5.40 (10% of the $54 application fee) the chart's zoning column demonstrably includes, and floors
to whole dollars where the chart prints cents. At units 149 the chart says $106.72 and the
calculator says $101.00. The calculator is labelled an *estimate* ("To estimate your building
permit fees…") and the chart is the schedule with its authority column (Chapter 131) beside it, so
**the chart's figures are charged**, the calculator's are recorded, and the zoning rule carries a
needs_review flag so the disagreement stays visible. On plan review the two agree exactly —
`Math.floor(0.68 * units)` with `revMin = 50` is the chart's column to the cent.

**Project types exist in the calculator and nowhere in the schedule.** S2's script branches on
*New / Addition / Remodel*, *Roofing and/or Siding* and *Deck and/or Pool*: residential roof/siding
charges permit $66 and waives everything else; commercial roof/siding charges permit $220 with the
standard zoning fee; residential deck/pool charges permit $66, waives the application and plan
review and caps zoning (the comment says $24, the constant says 25). The schedule's own flat rows
say something different — *Residential Deck $22.00*, *Residential Pool $15.00 (plans larger than
11x17)*, *Residential Re-siding $5.00 (plans larger than 11x17)*, *Residential Re-roofing* with no
amount printed at all. Two City surfaces, three mismatches, one code comment that disagrees with
itself: named on every page, modelled nowhere.

**Above the chart.** The last printed row is $500,001–$501,000 (plan review $340, zoning $290 —
capped, total commercial $4,084.00). The chart does not say what happens next. The engine applies
the top published row with a warning when a value exceeds it; the calculator implies the same
formulas simply continue (its `floor(0.68 * units)` has no cap). Recorded rather than chosen.

### 2.2 Electrical — an application fee plus four amperage bands

S1, "ELECTRCIAL PERMIT FEES" [sic] (Chapter 133), `-table`/`-raw` pairing:

| Row | Fee |
| --- | --- |
| Application (Includes 1 inspection) | **$52.00** |
| Up to 200 Amp Service | **$17.00** |
| 201-600 Amp Service | **$31.00** |
| 601-1,000 Amp Service | **$63.00** |
| Over 1,000 Amp Service & GFPE | **$105.00** |

Named and not modelled: Additional Inspection $42, Admin Fee (working prior to permit) $173,
Written Report and Certificates and Special Inspection $63 (per hour / each), **New Single Family
Home $210** (the schedule does not say whether that is an alternative to the itemised rows or one
of them), Conduit or Grounding Only $47, Hazardous Locations "2x Permit Fee", Meter Set/Mast Repair
$10, Temporary Service $17, Alternative Power $42 first 10 KW + $4 each KW after, Fire Alarm $63 up
to 10 devices + $6 each additional, General Branch Circuit $10, Lighting Branch Circuit $10, the
"Addition, Alteration, Repair Existing, Replace per 25 Devices or Lighting" $10 rows, the $10 flat
appliance rows (range, dryer, A/C, furnace, data outlets per 20, temperature control up to 10,
microwave, water heater, heating device per 5,000 watts), Vehicle Charging Station $21, Pool $63,
Hot Tub $21, Other Fixed Appliances $10, Illuminated Signs $21 per circuit, Neon/LED supplies $21,
Feeders $11 each, Bus Duct $11 per 50 ft, and motors at $10 / $26 / $52 by HP.

### 2.3 Plumbing — application plus a $5 item list and a size-keyed distribution row

S1, "PLUMBING PERMIT FEES" (Chapter 132), `-table`/`-raw` pairing:

| Row | Fee |
| --- | --- |
| Application (Includes 1 inspection) | **$52.00** |
| Each listed fixture/device (the long $5 list) | **$5.00** |
| Water Heater | **$21.00** |
| Water Distribution 3/4" · 1" · 1-1/4" · 1-1/2" · 2" · Over 2" | **$6 · $10 · $21 · $26 · $31 · $36** |
| Medical Gas Zones | $52.00 |
| Gas Piping per Opening | $5.00 |

The $5 list is 28 named items: backflow preventer, backwater valve, bath tub-shower,
catch basin/sump/roof drain, dishwashing machine, drinking fountain, floor drain/floor sink/trench
drain, garbage disposal, grease trap/oil separator, laundry tray/stand pipes, lavatory, lawn
sprinkler, water connected appliance, three-compartment pot and pan, kitchen sink, sink other than
family use, slop or service sink, stacks (soil, waste, vent), urinal, water closet/toilet, foot
bath/pedicure bath/shampoo, clinical sink, eye wash/emergency shower, bidet — all $5.00 each. There
is no catch-all clause (unlike Detroit's), so the row is modelled as what it is: each *listed*
item. Also named: Additional Inspection $42, Admin Fee $173, Written Report $63/hour.

### 2.4 Everything else in the document

Mechanical (Chapter 134): the same $52 application / $42 inspection / $173 admin / $63 report head,
then commercial items ($7–$99), ventilation and air-handler bands by cfm, the ductwork ladder
($31 / $42 / $57 / $73, then "$11.00 per each add'l $3,000" over $15,000), and residential rows
($5–$52). Administrative fees: Administrative Hourly Rate $141, Change of Use $220, demolition
$220 residential + zoning / $250 commercial + $70 sewer / $331 explosives, Incomplete Building
Permit App $551 + $70 sewer, Re-Review of Plans $88 per page, Large Format Scanning "10% permit fee
$50.00 min", Temporary Use & Occ $66 + zoning, Tent/Canopy $66 + $66 per extra, Re-open Expired
Permit $189, Construction Code Board of Appeals $52/$131/$262. Inspection fees: Failure to Gain
Access / Work Not Ready $131, Stop Work and Evening/Weekend/Holiday $84. Enforcement: Working
Without a Permit $173, Correction Notice $165, Notice of Violation $260, Civil Infraction
Preparation $360, Warrant Preparation $350, Collection 10.40 + 1%/mo. And the Planning Division's
own schedule (zoning changes $3,610–$5,560, special land use $2,640, site plan review, board of
zoning appeals $750–$2,640, signs, historic preservation) — a different division's money entirely.

## 3. What is modelled

- **Building (5 rules):** the $54 application fee; the $6.80 incremental fee with its $1,000
  threshold and round-up; the commercial plan review as the chart's 501 printed tiers (max $50,
  floor of 68¢ × units, whole dollars, no published row above $501,000); the $25 residential zoning
  fee; and the commercial zoning fee as 10% of the application-plus-permit subtotal with the
  chart's $25 floor and $290 cap.
- **Electrical (5 rules):** the $52 application fee (one inspection included) and the four service
  bands keyed on `custom.amperage`, mutually exclusive.
- **Plumbing (9 rules):** the $52 application fee, $5 per listed item on the `fixtures` count, the
  $21 water heater behind `custom.water_heater`, and the six water-distribution sizes keyed on
  `custom.water_distribution`, exactly one of which can fire.

Every rule reads `valuation`, `occupancy`, `fixtures`, `custom.amperage`, `custom.water_heater` or
`custom.water_distribution` — nothing else, because no other fact on this schedule moves a figure.

## 4. What is NOT modelled

- **The calculator's project-type branches** — $66 residential roof/siding and deck/pool, $220
  commercial roof/siding, with the waived application and plan review — which disagree with the
  schedule's own flat rows ($22 deck, $15 pool, $5 re-siding, blank re-roofing) and with their own
  code comment. All four schedule rows are named on the page.
- **Mechanical** in full (the third trade this pass did not publish a page for), and the electrical
  and plumbing rows listed in §2.2 and §2.3.
- **Change of Use ($220), demolition ($220/$250/$331 + $70 sewer), the incomplete application
  ($551), re-review ($88/page), scanning (10%, $50 min), hourly and administrative fees, the
  inspection and enforcement schedules** — named with their amounts.
- **Plan review's per-sheet and hourly cousins** — only the chart's plan review column is modelled;
  Re-Review of Plans is $88 a page.
- **The Planning Division's schedule** (zoning map amendments, special land use, site plan review,
  board of zoning appeals, signs, historic preservation) and the **right-of-way and LUDS permits**
  (other programs; LUDS combines "review and permit fee for one simple payment").
- **Water/sewer connection permits**, filed on their own application through LUDS.

## 5. Effective dates and access

- **Fees as modelled:** `effectiveFrom = 2026-07-01` — every page of S1 is headed "CONSTRUCTION CODE
  ADMINISTRATION FEES - EFFECTIVE JULY 1, 2026", the document is titled "FY 2027", and the chart
  itself is headed "BUILDING PERMIT FEE CHART / FY 2027". Read on 2026-09-25, three months into
  force.
- **Access:** `grandrapidsmi.gov` answers plain clients directly — S1 (CDN PDF) and every service
  page returned HTTP 200 with no challenge. The fee page's calculator script is inline in its own
  HTML, which is how the arithmetic in §2.1 was read as code rather than inferred from output (the
  same move Pittsburgh's calculator allowed).

## 6. Open questions

- **Which rounding the incremental fee really uses when a value is not on a $1,000 boundary.** The
  chart is row-keyed and its rows charge the row's units (round the remainder up — $150,001 is the
  $1,020.00 row); the calculator's `floor((value - 1000)/1000)` rounds down ($1,013.20). The chart
  is the schedule, so the chart is charged and the calculator's read is recorded here. The
  footnote's own words — "each additional $1,000 of construction/contract cost" — settle neither.
- **The commercial zoning formula's two expressions.** The chart's column is exactly 10% of
  (application + permit) in cents — provably, on all 500 rows, and consistent with footnote 6's "not
  more than 10% of the Building Permit fee" read as including the base fee; the calculator computes
  `floor(0.68 × units)` in whole dollars, which is 10% of the *permit* fee alone. Charged: the
  chart's. Flagged: needs_review against the rule.
- **What happens above $501,000.** The chart stops. The calculator's formulas continue unbounded
  (its plan review has no cap). The engine applies the top printed row and warns; neither surface
  publishes a row for a million-dollar project.
- **The project-type flat fees.** $66 / $220 in the calculator against $22 / $15 / $5 / blank in
  the schedule, plus a code comment saying "capped at $24" beside a constant of 25. Three
  disagreements, one document each: recorded, not modelled.
- **"New Single Family Home — $210" (electrical).** An alternative permit price for a new house, or
  a row that stacks with the service bands? The schedule does not say; not modelled.
- **The unit the water distribution rows are priced per.** The column header says "Fee per Unit" and
  the rows say only the pipe size — per permit, per service line, or per run of that size is not
  stated. Modelled as one declared distribution size per permit, which is the reading that makes
  the six rows mutually exclusive.

## 7. Why Michigan second, and Grand Rapids next

Detroit and Grand Rapids share a state code and nothing else: Detroit's building fee is a
nine-band ladder on project cost with "or fraction thereof" printed on every rate row, Grand
Rapids's is a $54 base plus $6.80 steps with two percentages of the fee itself folded into the
total — two cities, one state, two mechanisms, which is the reason both were picked (see
research/michigan/detroit.md §6 for the cross-reference).
