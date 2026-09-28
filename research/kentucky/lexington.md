# Lexington, Kentucky — Permit Fee Research

**Jurisdiction:** Lexington-Fayette Urban County Government (LFUCG), Lexington, KY (merged city-county government)
**Department:** Department of Environmental Quality and Public Works — **Division of Building Inspection**, 101 E. Vine St., Lexington, KY 40507, (859) 258-3770, buildinginspection@lexingtonky.gov
**FIPS:** State 21 (KY); Fayette County 21067

## Sources (all primary, .gov)

1. **"2021 Fee Schedule" PDF** (revised 10/27/21; "EFFECTIVE JULY 1, 2019" per its header — the FY20 budget restructured fees, primarily residential):
   `https://content.lexingtonky.gov/sites/default/files/2024-11/2021%20Fee%20Schedule.pdf`
   Linked as "Fee schedule" from the Division of Building Inspection page. Contains: Commercial Section, Residential Section, Other Services, HVAC/Mechanical Fees (commercial cost table, residential per-system), Fire Detection Systems and Sprinkler Systems. Verified 2026-09-26.
2. **Building Inspection department page**: `https://www.lexingtonky.gov/government/departments-programs/environmental-quality-public-works/building-inspection` — "Current permit fees took effect July 1, 2019… The changes primarily impact the residential sector with some limited impact to the commercial sector." Links the fee schedule above.
3. **Electrical permits, licensing and inspections page**: `https://www.lexingtonky.gov/working/building-permits/electrical-permits-licensing-inspections` — "**Electrical permits cost $10 each.**" Master Electrician license (state-issued) + LFUCG business license required; homeowners may pull permits on their own residence; inspections are performed by the Commonwealth Inspection Bureau, (859) 263-7800 (separate from the permit).
4. **Commercial construction page**: `https://www.lexingtonky.gov/working/building-permits/commercial-construction` — "Plumbing – Application, review and permit by **State Inspector**, (859) 899-3244"; "Electrical – Permit by LFUCG; inspections by Commonwealth Inspections Bureau". Also: Building Inspection, 101 E. Vine St.
5. **Plumbing permits page**: `https://www.lexingtonky.gov/working/building-permits/plumbing-permits` — Lexington's Plumbing Program role is health-plan review (Lexington Health Department, (859) 899-5244); the plumbing permit itself is state.
6. **New residential construction page**: `https://www.lexingtonky.gov/working/building-permits/new-residential-construction` — "Permit fees are based on the square footage to be built and a per dwelling base fee" (matches the schedule's ".10 X Sq. Ft. … + $180").

## Discrepancy resolution

- The schedule document says "EFFECTIVE JULY 1, 2019" while its filename/footer say 2021 (revised 10/27/21). Resolved: fees took effect 2019-07-01; the 10/27/21 mark is a document revision. Seed `effectiveFrom: "2019-07-01"`, documentDate "2021-10-27".
- "090 X Sq. Ft." / ".062" etc. are per-square-foot **dollar** rates printed without the decimal point/leading zero (Educational $0.90/sq ft; Restaurant $0.90 + $0.252; Office $0.62 + $0.175; Retail $0.42 + $0.119; Warehouse $0.28 + $0.077; Hotel/Motel $0.68 + $0.189; Canopies/All Other $0.42 + $0.119). The second adder is documented locally as additional-cost work; the calculator prices the first (base) rate and names the adder in prose/FAQ.
- "06 X Sq. Ft. (Min. $50)" = **$0.06/sq ft** commercial plan review. Plan review is charged on top of the permit for reviewed work; kept as its own rule because the schedule lists it as a separate line (it is not the Louisville ⅓ rule).
- Residential "Min. $150" applies to the .10 × sq ft portion, **before** the $180/$100-per-unit adder.
- Wrecking/Moving: .002 × assessed valuation (min $100) — valuation-basis; included as building-page rule gated on workType demolition/other via `custom.moving_or_wrecking`.
- Tanks: .002 × gallons (min $100); Signs: $0.50/sq ft (min $50); Towers $250; Co-locates $100; Fit-ups $100; Paving commercial .006/sq ft (min $50), residential .006 (min $25); Curb cuts $25/$10; Commercial fence $100; Residential fence $50; Pools $200 commercial / $100 residential.

## Electrical — local flat permit

"Electrical permits cost $10 each" — a **flat $10 per electrical permit** issued by LFUCG Building Inspection, with inspections performed (and priced) by the Commonwealth Inspection Bureau separately. The $10 appears only on the electrical page (not in the fee-schedule PDF), so the seed's electrical rule cites the electrical-permits page as its source. Seed models: flat $10, no conditions (one permit per job; the page prices the permit, not the work).

## Plumbing — NOT a local fee

The LFUCG fee schedule has **no plumbing section**, and the commercial-construction page routes plumbing to the **State Inspector** ((859) 899-3244) — the same statewide arrangement documented in research/kentucky/louisville.md:

- Kentucky Division of Plumbing (dhbc.ky.gov) issues plumbing construction permits statewide.
- **815 KAR 20:050** §4: residential 1–2 family **$50 base + $14/opening**; other buildings **$50 base + $20/opening**; single water heater replacement **$50 flat**; 5 inspections included, additional inspection $50 (waived over $250 permit).

The Lexington plumbing page prices that **state** permit and says so plainly, citing dhbc.ky.gov and the KAR text (Internet Archive snapshot 2024-09-27 of apps.legislature.ky.gov, which does not answer directly).

## HVAC/Mechanical (documented, not a calculator page)

The schedule's HVAC tables exist (commercial by construction cost, $125 at ≤$2,000 to $3,965 at $1.5M–$1.6M then +$200 per $100,000; residential 1st system $105, each additional $50; fire detection $275 up to 20,000 sq ft + $30 per additional 10,000; sprinklers $150–$375 by head count, +30¢/head over 750). These belong to the mechanical (HVAC) permit, which is **outside the three assigned pages** (building/electrical/plumbing) and is named in `notIncluded` prose.

## Engine modelling notes

- Occupancy per-sq-ft rates → `percent` with `rateUnit: "currency_per_unit"`: $0.10/sq ft = `{10, 1}` cents per sq ft (residential single family), each with its own `minimumCents` (e.g. 15_000) and an adder rule (flat $180, or per-unit $100 × `custom.dwelling_units`).
- Commercial occupancies keyed on `custom.building_use` (`in` [...]) with rates as {numerator, denominator} cents/sq ft: Educational {90,1}, Restaurant {90,1}, Office {62,1}, Retail {42,1}, Warehouse {28,1}, Hotel/Motel {68,1}, Canopies/All Other {42,1}, each min $250.
- Remodeling (commercial) {10,1} min $250; residential remodel/additions/accessory {10,1} min $150.
- Plan review: commercial `percent` {6,1} cents/sq ft min $50; residential flat $25.
- Reinspections ($50/$100/$200) and CoO ($25) omitted from calculators (event-driven), named in prose.
- Double-fee-without-permit (header note) named in FAQs, not modelled (penalty, not a fee schedule row).
