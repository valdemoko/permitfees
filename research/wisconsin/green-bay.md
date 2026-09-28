# Green Bay, Wisconsin — research record

**Research pass:** 15 (Wisconsin, second jurisdiction)
**Read on:** 2026-09-25
**Jurisdiction:** City of Green Bay (Brown County, fips 55009 — the County is a locator;
the Inspection Division of Community & Economic Development issues the permits citywide)
**Pages published:** building, electrical, plumbing

## Why Milwaukee was not this state's second city

Milwaukee is the market-significant pick, and it is unreachable from this environment: every
URL on `city.milwaukee.gov` and `www.milwaukee.gov` — including the static PDF
`/ImageLibrary/Groups/dnsAuthors/permits/Documents/DevCenterFeeCombo.pdf` found by search —
returns **HTTP 403** through the WAF, the same wall that stopped Kenosha (403) and the
Akamai wall that disqualified Atlanta. The gate is verifiability first: a schedule that
cannot be read is not a schedule. Among the Wisconsin cities that answered, Green Bay
(200) had the strongest instrument: a consolidated ordinance-keyed fee schedule PDF linked
from its own permit pages, with a dated fee column. Racine and Eau Claire answered 200 but
their department URLs 404; Appleton timed out (000). Wisconsin Steel is West Allis's own
naming; Green Bay it is.

## Sources actually read

| # | Source | URL | Type | Effective / dated |
| --- | --- | --- | --- | --- |
| 1 | City of Green Bay Fee Schedule (PDF) | `https://www.greenbaywi.gov/DocumentCenter/View/944/City-of-Green-Bay-Fee-Schedule-PDF` | fee_schedule_pdf | Column headed "**2026 Fee**"; permit-guides page: fees "go into effect January 1, 2026" |
| 2 | Permit Guides, Forms & Fees | `https://www.greenbaywi.gov/313/Permit-Guides-Forms-Fees` | municipal_website | States the 2026-01-01 effective date; links the fee schedule under "Fees and Payments" |
| 3 | Residential Permits | `https://www.greenbaywi.gov/322/Residential-Permits` | municipal_website | No date; read 2026-09-25 |
| 4 | Commercial Permits | `https://www.greenbaywi.gov/321/Commercial-Permits` | municipal_website | Carries "PLUMBING INSPECTION UPDATE EFFECTIVE OCTOBER 1, 2021" |
| 5 | Permitting Process | `https://www.greenbaywi.gov/315/Permitting-Process` | municipal_website | No date; read 2026-09-25 |
| 6 | Licensed Contractor Electrical Permit Application (PDF) | `https://www.greenbaywi.gov/DocumentCenter/View/946/Licensed-Contractor-Electrical-Permit-Application-PDF` | permit_portal form | No date; read 2026-09-25 |

All returned HTTP 200 from this environment on 2026-09-25. The fee schedule PDF is 309,782
bytes.

## How the fee schedule was read

The PDF was extracted three ways, which is the process requirement. `pdftotext -layout`
mispairs columns exactly as Boston's sheet did — it hands "Water heater replacement" the
Lawn sprinkler row's amount, shifts Palmer valve and Back water valve, and leaves the
commercial section's row names and amounts offset by one. `pdftotext -raw` pairs most rows
correctly but scrambles the same tail section. `pdftotext -table` pairs every row cleanly
and is the transcription this site uses; the three extractions agree on every amount the
-live pages restate. The schedule has three columns: "Code Section", "Description", "2026
Fee", with ordinance sections keyed in the left margin (8-47, 8-360, 8-369, 8-449, 8-451,
8-478, 8-629, 8-671 across Chapter 8).

## What prices a permit in Green Bay

One consolidated schedule prices all four trades, and every trade section is split the
same way: **by what the building is** — "One- and two-family residential", "Multi-family
residential", "Commercial, educational, institutional, industrial" — and then **by what
the scope is**. The licensed-contractor electrical application prints the same classes as
occupancy boxes ("Single-Family / Two-Family / Multi-Family / Commercial / Educational /
Manufacturing / Other"), which is what makes the class a reader's choice rather than a
determination: the model asks for it as `custom.property_class`.

## The schedule, as read (Chapter 8 — Buildings and construction)

### Plan approval (§8-47) — charged at application, separate from the permit

| Item | One/two-family | Multi-family | Commercial |
| --- | --- | --- | --- |
| Principal-use building plan | **$75.00** | $125.00 | $125.00 |
| Accessory-use building plan | $50.00 | $125.00 | $125.00 |
| Sign structural plan | — | $75.00 | $75.00 |
| HVAC plan | Energy (heat loss) calculations **$0.00** | Mechanical systems plan $125.00 | $125.00 |
| Plumbing plan | Fixture list **$0.00** | Plumbing system plan $125.00 | $125.00 |

The two $0.00 rows are read as filed-not-priced: a one- and two-family application carries
energy calculations and a fixture list and pays nothing for the plan itself. These are
application-stage fees and are not modelled as permit fees.

### Building permits (§8-360)

| Item | One/two-family | Multi-family | Commercial |
| --- | --- | --- | --- |
| New construction / general construction (per sq. ft) | **$0.01** | **$0.14** | group 1 **$0.07** / group 2 **$0.14** |
| Windows/doors | $75.00 | — | — |
| Move building | $75.00 | $100.00 | $100.00 base + $0.14/sq ft foundation area |
| Raze/demolish building | $75.00 | $100.00 | $100.00 |
| Roofing replacement | — | $100.00 + $0.01/sq ft (built-up or membrane) | $100.00 + $0.01/sq ft |
| Siding | — | $100.00 + $0.01/sq ft (brick veneer) | $100.00 + $0.01/sq ft |
| Accessory structures (curb cut, fencing, hot tub, pool, pond, satellite, tower) | $75.00 each | $100.00 each | $100.00 each |
| Subdivision/neighborhood signage | $50.00 + $0.50/sq ft | $50.00 + $0.50/sq ft | $50.00 + $0.50/sq ft |
| Temporary or mobile sign | — | — | $50.00 |

### Plumbing permits (§8-360)

| Item | One/two-family | Multi-family | Commercial |
| --- | --- | --- | --- |
| General plumbing (per fixture) | **$7.00** | **$8.00** | **$8.00** |
| Water service connection permit | $50.00 | $50.00 | $50.00 |
| Sanitary sewer connection | $50.00 | $50.00 | $50.00 |
| Storm sewer connection (each) | $50.00 | $50.00 | $50.00 |
| **Fire suppression system (per head)** | **$2.50 ($70.00 min, up to $200.00)** | same | same |
| Lawn sprinkler system RPV | $75.00 | $100.00 | $100.00 |
| Water heater replacement | $50.00 | $100.00 | $100.00 |
| Palmer valve | $75.00 | — | — |
| Back water valve | $50.00 | — | — |
| Sewer cap | — | — | $100.00 |

The sprinkler row is printed identically in all three sections, with its clamp in the
row's own parenthetical. `8-369 Private well operation permit fee $125.00` sits beside the
sections as its own row.

### Electrical permits (§8-451)

| Item | One/two-family | Multi-family | Commercial |
| --- | --- | --- | --- |
| General electrical system (per sq. ft) | **$0.05** | **$0.09** | group 1 **$0.05** / group 2 **$0.09** |
| Electrical service | $50.00 | initial $100.00, each additional $50.00 | — |
| Air conditioning addition | $75.00 | $100.00 | — |
| Project cost ladder | — | — | $0–10k **$100**; $10,001–50k **$240**; $50,001–100k **$310**; $100,001–200k **$400**; $200,001–300k **$500**; >$300k **$600** |
| Additional fee per $100,000 above $300,000 | — | — | **$100.00** |
| Internally/externally illuminated sign | — | — | $100.00 |

`8-449 Reinspections of electrical wiring $75.00` sits above the electrical sections and
applies to all of them.

### Mechanical (HVAC) permits (§8-478)

| Item | One/two-family | Multi-family | Commercial |
| --- | --- | --- | --- |
| General HVAC system (per sq. ft) | **$0.05** | **$0.09** | ductless unit-heater **$0.05** / ducted or hydronic **$0.09** |
| Heating unit replacement | $75.00 | $100.00 | $100.00 |
| Air conditioning addition (per unit) | $75.00 | $100.00 | $100.00 |

### On the electrical application, not in the schedule

The licensed-contractor electrical application prints "JOB DESCRIPTION: *$150 permit fee"
with the asterisk footnoted to the "Generator *see below" checkbox, and requires
calculations for electrical and gas line capacity plus an HVAC permit for the gas line.
$150.00 for a generator is the City's own figure, from its own form.

## Readings this dataset depends on

**(a) The property class is asked, not derived.** Every application form prints the
occupancy boxes; the schedule prices the same scope at two or three rates across them.
`custom.property_class` holds the choice, and the one- and two-family rules are written as
NOT(a class is stated and it is not one- or two-family) — an application that states no
class is priced at the residential rate, which is the default a homeowner filing without
help actually needs.

**(b) Area rows are exact and unbanded.** Every "(per sq. foot)" row charges the exact
area: 1,500 sq ft at $0.05 is $75.00, not a stepped table. No minimum and no rounding is
printed on any area row, so none is applied.

**(c) The commercial electrical ladder replaces the area rates.** The commercial electrical
section prints area rates *and* a project-cost ladder. The ladder's rows carry no "(per
sq. foot)" mark and read the application's "Value of work" field; the area rates read the
area. Both cannot charge at once, so the ladder is gated on
`custom.electrical_fee_basis: project_cost` and the area rates on its absence. The
"+$100 per $100,000 above $300,000" line is its own rule — the top band is open-ended, so
the schedule's six bands cannot hold the arithmetic the seventh line adds.

**(d) The sprinkler clamp is the schedule's own punctuation.** "$2.50 per head ($70.00
minimum, increased per head, up to $200.00)" — the parenthetical is printed on the row, so
the floor and ceiling are the rule's own `minimumCents` and `maximumCents`: ten heads are
$25.00 charged at $70.00, thirty-two are $80.00, eighty would be $200.00 charged at
$200.00. The first per-unit row in this dataset that publishes both bounds.

**(e) The commercial building "groups" are not defined in the schedule.** Building and
electrical both split commercial work into "building group 1" and "building group 2"
without saying what assigns a building to either; the split is the Inspection Division's
determination. The model asks for `custom.building_group` and charges only the stated
group — an application that states none charges nothing on either commercial row rather
than being guessed at. HVAC's commercial split is the one the schedule *does* define, by
system kind (ductless unit-heater $0.05, ducted or hydronic $0.09), and it is asked as
`custom.hvac_system`.

**(f) The A/C row prices units, not tons.** "Air conditioning addition (per unit)" — so a
3-ton and a 5-ton replacement are one unit each. The engine's `ac_units` kind was added for
exactly this: `tons` would have billed the larger machine as more units. The commercial
electrical section prints no A/C row of its own; the commercial A/C charge carries the
section rate the multi-family row prints ($100.00) and is marked as that reading in the
rule's description.

**(g) The owner-occupant rules are the pages'.** Residential pages: the owner of an
existing single-family dwelling where they reside may pull building, electrical, HVAC and
plumbing permits for that dwelling; rental work is licensed-contractor-only; electrical
services and all other wiring must be done by a Green Bay-licensed electrical contractor;
plumbing contractors must be Wisconsin master plumbers; a DIY electrician must meet an
inspector with a floor plan and answer basic wiring questions before a permit issues.
Commercial: building permits may be taken by contractor, tenant or owner; HVAC is no
longer city-licensed (state licence only).

**(h) Penalties.** The permitting-process page: "Failure to obtain a building permit may
result in the doubling of permit fees, a municipal citation of over $500, and the work
ordered redone or removed if in non-compliance" — a doubling on a fee that has not been
computed, named rather than modelled.

## Effective dates on record

The fee schedule's own column is headed "**2026 Fee**", and the City's permit-guides page
states: "Permit fees listed in the guides go into effect **January 1, 2026**." That is a
real enactment date for the schedule's rows — stronger than a read date — and it is what
every rule and the fee schedule row carry as `effectiveFrom`. The commercial page's
"PLUMBING INSPECTION UPDATE EFFECTIVE OCTOBER 1, 2021" dates an inspection *procedure*
(SPS 382.21 witnessing), not a fee.

## Requirements read (for the requirement rows)

From the permit pages: all trades' permits must be received before work begins and no
inspection can be scheduled until the fee is paid; an inspection is required upon
completion of work in every trade; a contractor must carry the State of Wisconsin Dwelling
Contractor Certification and Dwelling Contractor Qualifier Certification for one- and
two-family work (state verification required before the City issues, 608-261-8500); more
than three standalone outlets added triggers an electrical permit even where no building
permit is needed; plumbing contractors must be State-licensed master plumbers; HVAC
contractors are State-licensed only (the City licence requirement "is no longer in
effect"); plumbing installations of sanitary sewers and interior DWV must be tested and
witnessed per SPS 382.21 (effective 2021-10-01); a Certificate of Appropriateness is
required from the Landmarks Commission for listed historic properties; erosion control
permit and plan required before land-disturbing activity; short-form application for
driveways, sheds, fences and patios, long form for everything else, and all commercial
projects use the long form. Department contact: Building Permits & Inspections,
Community & Economic Development, 920-448-3300; inspection scheduling by online request
form or phone.

## Not modelled (named on the page, never papered over)

- **The §8-47 plan-approval fees** — application-stage charges ($75/$125 principal-use,
  $50/$125 accessory, $125 HVAC/plumbing system plans, $75 sign structural plan), separate
  from the permit fees this site prices.
- **The $0.00 residential plan rows** — energy (heat loss) calculations and the plumbing
  fixture list are filed and priced at nothing; recorded because a zero is the schedule
  speaking, not an absence.
- **Roofing replacement and siding rows** — $100.00 base plus $0.01/sq ft for built-up or
  membrane roofing and brick veneer siding, mixed flat-plus-area shapes priced for scopes
  these three pages do not carry; transcribed here, not attached.
- **Move building** — $75/$100 plus a $0.14/sq ft foundation-area fee, needs a foundation
  area alongside the building area; named with its amounts.
- **The accessory-structure grid** — curb cut, culvert, driveway, landscape structures,
  fencing, hot tub, swimming pool, pond, satellite receiver, tower structure at
  $75/$100 each, and subdivision signage at $50 + $0.50/sq ft: permits of their own kind.
- **Connection rows** — water service connection, sanitary sewer connection, storm sewer
  connection at $50.00 each (external-work permits, and the sewer-connection application
  is its own form), Palmer valve ($75.00), back water valve ($50.00), lawn sprinkler RPV
  ($75/$100), sewer cap ($100.00), private well operation ($125.00).
- **The illuminated-sign row** — $100.00, commercial electrical section.
- **The rooming-house rows** (§8-629) — $50.00 plus $10.00 per dwelling or rooming unit —
  and the mobile-home-park late-renewal penalty (§8-671, $50.00).
- **The permit doubling and the $500 citation** — penalties on work started without a
  permit, multipliers and citations rather than charges.

## Open questions

1. **What assigns a commercial building to group 1 or group 2.** Neither the schedule nor
   the pages define it; the model asks. A call to the Inspection Division (920-448-3300)
   would settle whether it is construction class, occupancy or size.
2. **The commercial electrical A/C row's absence.** The commercial electrical section
   prints no air conditioning row; the commercial charge here carries the multi-family
   row's $100.00. If the Division prices commercial A/C by the mechanical section alone,
   the electrical commercial rule overstates by nothing — the mechanical row exists at the
   same price — but the electrical row's very applicability is the open part.
3. **Whether the electrical ladder's bands are cumulative.** The rows read as replacement
   bands ("Project cost $10,001-$50,000 $240.00" — one amount per band, not $100 + $240),
   which is how the tiered-table shape charges them. A cumulative reading would make a
   $20,000 job $340.00 rather than $240.00; the bands' wording ("Project cost $X-$Y" with
   one amount each) is the replacement reading, and no application note says otherwise.
4. **The generator's $150.00 scope.** The application footnote sits next to the generator
   checkbox and nowhere else; whether it also covers the required HVAC gas-line permit or
   is the electrical permit fee alone is not stated. The model charges it as the
   electrical generator row only.
