# Indianapolis, Indiana — research record

**Jurisdiction.** City of Indianapolis, Marion County, Indiana — the Consolidated City and
County of Indianapolis-Marion County. The permitting authority is the **Department of Business
and Neighborhood Services (DBNS)**. Everything was retrieved and read on **2026-09-26**, and
every rate in `src/content/indianapolis/fee-rules.ts` traces to it.

**Status.** Published. Three permit pages — building, electrical, plumbing.

---

## Sources actually read

**S1 — the fee schedule workbook, "As of 1.5.2026."** Five worksheets: *Permits*, *Inspections*,
*Code Enforcement*, *Licenses*, *Misc.*
`https://us-east-1-indy.graphassets.com/ActDBC5rvRWeCZlNNnLrDz/cmk5m819t0az807k8xug0dwuw?dl=true`.
**It is an `.xlsx`, not a PDF** — 33 KB, `Microsoft Excel 2007+` — so it was read as a
spreadsheet, with every cell's reference printed, rather than through `pdftotext`.

**S2 — "License and Permit Fees."** `https://www.indy.gov/activity/license-and-permit-fees`.
The page that publishes S1, states the effective date, and answers the transition and scope
questions. **Read from a rendered browser, not by fetching**: `curl` returns a 4,361-byte
application shell (`<div id="app" activity_id="license-and-permit-fees"></div>`) to both an
ordinary user-agent and to Googlebot and bingbot, and the page's text appears only once its
JavaScript runs. The rendered DOM is also where S1's URL was read from a `<a>` element.

**S3 — City-County Council Proposal No. 239, 2025.** Fourteen pages, adopted October 2025.
`https://us-east-1-indy.graphassets.com/ActDBC5rvRWeCZlNNnLrDz/cme31mtvm1fbp07k64bi1va4o`. The
ordinance behind the 1/5/2026 table, printing each amended section's old figure beside its new
one.

**S4 — "Residential Development Permits."** `https://www.indy.gov/activity/residential-development-permits`,
also read from the rendered browser. Class 2 permit types, documents, sequences and exemptions.

**S5 — Administrative Fee Appeal Form.** One page, last revised 8/18/2016.
`https://citybase-cms-prod.s3.amazonaws.com/2ec73be1277c4ea1b2e822861ec160e3.pdf`. The 536-609
administrative fee and its appeal.

**Also downloaded and read, for cross-checking only:** Proposal No. 334, 2025
(`https://us-east-1-indy.graphassets.com/ActDBC5rvRWeCZlNNnLrDz/cmhf5asbf0mm907lkwppqrl42`) — the
licensing and permit-eligibility ordinance, whose definitions and craft-certificate sections are
recorded below. Chapter 536 itself was attempted at
`https://interactive.wthr.com/pdfs/Chapter_536___BUILDINGS_AND_CONSTRUCTION_Code.pdf` and
**returned HTML rather than the PDF**, so its text is quoted only where S3 prints it.

---

## The Permits sheet, as read (S1, complete)

The sheet's header row is the mechanism, and reading it as a spreadsheet rather than as
extracted text is what settled it:

```
R7:  A7="Permit Type" | B7="Subtype/Description" | C7="Application Fee" | D7="Review Fee" | E7="Issuance Fee"
```

and the header block above it:

```
R5:  A5="Admin Fees" | B5=250
```

**Every Structural Permit row fills C, D and E. Every craft row fills only C.** That is not
formatting: S2 says the same thing in words, and S3 amends no craft section at all.

### Building — Structural Permit (STR)

| R | Subtype | C (application) | D (review) | E (issuance) |
| --- | --- | --- | --- | --- |
| 27 | Construction of/placements of/additions to Class 2 primary structures | $40 | $175 (≤2,000 sqft), $25 per additional 500 | $750 (≤2,000 sqft), $100 per additional 500 |
| 28 | Addition and simultaneous remodel of a primary Class 2 structure | $40 | $150 (≤1,000), $25 per 500 | $400 (≤1,000), $50 per 500 |
| 29 | Construction of/additions to an accessory Class 2 structure | $40 | $150 (≤1,000), $25 per 500 | $300 (200–1,000 sqft), $25 per 500 |
| 30 | Addition and simultaneous remodel of an accessory Class 2 structure | $40 | $100 (≤1,000), $25 per 500 | $250 (≤1,000), $25 per 500 |
| 31 | Remodeling, alteration or repair of Class 2 structures; no addition | $40 | $150 (≤1,000), $25 per 500 | $200 (≤1,000), $50 per 500 |
| 32 | Misc. Residential (Class 2) | $40 | $100 (≤1,000), $25 per 500 | $150 flat |
| 33 | Construction of/additions to Class 1 structures | $40 | $200 | $1,000 (≤2,500 sqft), $150 per additional 1,000 |
| 34 | Remodeling, alteration or repair of Class 1 structures | $40 | $200 | $350 (1–999 sqft); $750 (1,000–2,500); $150 per additional 1,000 |
| 35 | Misc. Commercial (Class 1) | $40 | $200 | $175 flat |

**Two workbook defects are named on the page and not smoothed:**

1. **R27's issuance cell** reads `"$750 (≤2,000 sqft) 2,000 sqft; $100 per additional 500 sqft. Sqft
   calculations include the area of an attached garage or carport, and the area of a finished
   basement or attic, but excludes the area of an unfinished basement or attic."` The stray
   `2,000 sqft` is a typo; the figure is $750.00 to 2,000 square feet and $100.00 per additional
   500, and the sentence after it defines the area the row reads.
2. **R29's issuance cell** opens its bracket at 200 square feet (`$300 (200 - 1000 sqft)`) where
   every other cell opens at one, which is the accessory-structure threshold stated in a fee cell.

**The plan review is 536-620 and the ordinance prints its rows** (S3, page 3):

> 536-620 Plan review of a new primary or accessory Class 2 structure. Review includes
> appropriate structural and mechanical plan review — Eighty-five dollars ($85.00) One hundred
> and seventy-five dollars ($175.00) for structures less than 1,000 **2,000** square feet. For
> each additional 500 square feet an additional fee of twenty-one dollars ($21.00) **twenty-five
> dollars ($25.00)** … Plan review of Class 1 structures … Included in fees for Sections 536-602
> and 536-603 **$200.00**

(The struck-through figures are the ordinance's own old-and-new pairs.) **The permit fee itself
is 536-602/536-603**, printed old-and-new in the same section:

> 536-603 Remodeling, alteration, or repair of a Class 2 structure … For structures less than or
> equal to 1,000 square feet, a fee of one hundred fifty-nine dollars ($159.00) **two hundred
> dollars ($200.00)**; for each additional 500 square feet, an additional fee of thirty-nine
> dollars ($39.00) **fifty dollars ($50.00)**.
> 536-603 Addition and simultaneous remodeling, alteration, or repair of primary Class 2
> structures — For structures less than or equal to 1,000 square feet, a fee of … ($400.00); for
> each additional 500 square feet, an additional fee of fifty dollars ($50.00) …
> 536-603 Remodeling, alteration, or repair of Class 1 structures — For structures less than or
> equal to 2,500 **999** square feet, a fee of six hundred ninety-seven dollars ($697.00) **three
> hundred and fifty dollars ($350.00)**; for structures equal to or greater than 1,000 square
> feet, but are less than 2,500 square feet, a fee of seven hundred and fifty dollars ($750.00),
> each additional 1,000 square feet, an additional fee of forty-two dollars ($42.00) **one hundred
> and fifty dollars ($150.00)** shall apply.
> 536-612 General construction permit, where not specified by chapter 536 or 131 of this Code —
> $170.00 $141.00 **$175.00 for Class 1 structures; and $150.00 for Class 2 structures**

Every figure in the sheet's two right-hand columns is one of those ordinances' new figures, which
is how the three-column reading was confirmed rather than assumed.

**The $40.00 is 536-619:**

> 536-619 Additional service fee for applying for all demolition, master, sign, structural, and
> infrastructure related permits — $32.00 **$40.00**

That is why the improvement location and floodplain rows on the same sheet still carry `$32 per
application`, and why the schedule cannot be read as a single rate card.

### Electrical — Electrical Permit (ELE)

Column C only; D and E empty.

| R | Subtype | Fee |
| --- | --- | --- |
| 79 | Installation – New Structure or Commercial Addition | $202 (≤2,500 sf) $23 (per additional 1,000 sf over 2,500 sf) |
| 80 | Repair to Existing Structure or Residential Addition | $169 (≤1,000 sf) $23 (per additional 500 sf over 1,000 sf) |
| 81 | Install, Replace Space Heating Equipment | Space Heating $146 (≤10,000 sf); Space Cooling $146 (≤10,000 sf); Combined Htg/Clg $178 (≤10,000 sf); $23 (per additional 2,500 sf over 10,000 sf) |
| 82 | Initial Connection or Reconnection to Relocated Structure | $89 |
| 83 | Manufactured Home – New Mobile Home Park, Installation, Alteration, Replacement, Repair | $498 |
| 84 | General Service Activity | $89 |
| 85 | Self-Certification Tags | $22 |

**The two block sizes are the trap.** Both rows print `$23`, but one is per additional 1,000
square feet over a 2,500-square-foot allowance and the other per additional 500 over 1,000 —
$23.00 per 1,000 against $46.00 per 1,000. The appliance row is three figures in one cell with a
10,000-square-foot allowance and a 2,500-square-foot block ($9.20 per 1,000).

**R85 prints no unit.** `"Self-Certification Tags … 22"` — no "each", no "/tag". Charged once
under its own subtype, and the page says so rather than inventing a count.

### Plumbing — Plumbing Permit (PLM)

Column C only.

| R | Subtype | Fee |
| --- | --- | --- |
| 74 | New Residential Structure – Installation | $185 (≤2,500 sf) $23 (per 500 sf over 2,500 sf) |
| 75 | Residential Structure – Repair, Alteration, Remodel | $153 (≤1,000 sf) $23 (per 500 sf over 1,000 sf) |
| 76 | Commercial Structure – Installation, Repair, Alteration, Remodel, Additions, Accessory Structures | $182 (0–10 fixtures) $23 (per additional 5 fixtures) |
| 77 | Initial Connection or Reconnection to Relocated Structure | $134 |
| 78 | General Service Activity | $89 |

**R76 is the only count in either trade**, and it is a block rate: $23.00 per additional five
fixtures, not per fixture. Modelled as $4.60 a fixture inside a five-fixture increment, so eleven
fixtures is $205.00, sixteen is $228.00 and 106 is $642.00.

### Heating/Cooling (HTG) — read, not modelled

Rows 86–90: $153 (≤2,500 sf) plus $23 per additional 1,000 for heating systems or cooling
systems; $185 combined; $156 for refrigeration equipment; $89 for refrigeration general service.
Not modelled, and named on the profile.

---

## The other sheets, as read (S1, for the not-modelled list)

- **Inspections.** "Unless otherwise noted below, inspection fees are included in the issuance
  fee" — then general construction inspection $154, reinspection $175, and the accelerated
  options: same-day / next-day / next-day-scheduled / after-hours for Class 2 at $232 / $187 /
  $245 / $348, and for Class 1 at $750 for two hours plus $250 an hour, $300 for two plus $150,
  $500 for two plus $150, and $750 for two plus $250. Plus stop-work violations ($250 Class 2,
  $750 Class 1) and licensed-premises inspections at $84.
- **Code Enforcement.** Illegal dumping $1,000, demolition administrative fees, vacant board
  order $288, and the first-offence violations at $25–$325 (sign violation $100, work without an
  improvement location permit $250, inoperable vehicle $100, non-permitted use $325, and so on).
- **Licenses.** General/electrical/HVAC/wrecking at $247.00 a year for a business entity and
  $377.00 for an individual licence, plumbing at $142.00 for either, $63.00 per eligible employee
  beyond five, and the business-licence table beside them.
- **Misc.** Permit transfer $48, amendment $101, renewal $56, annual utility permit $477, the
  standalone administrative fee $215 (see below), the accelerated inspections repeated, and
  zoning letters.

**"Admin Fees — 250."** Every worksheet's header block carries it, and S3 places it:

> 536-609 Administrative fee — $215.00 **$250.00**

S5 states when it attaches — a permit for which a Certificate of Completion and Compliance has
not been filed — and names its appeal route. The `Misc.` sheet's own `Administrative Fee 215` is
the same section's pre-1/5/2026 figure, left in place on a sheet whose header block carries the
new one. **The model does not charge it to every permit**, because charging it would charge the
applicants who close their permits on time.

---

## Readings this dataset depends on

1. **A structural permit is application + review + issuance**, and the subtype selects the last
   two. Nine subtypes; the same square footage costs different amounts under different ones
   ($1,215.00 for 3,000 square feet of new primary structure against $565.00 as an accessory).
2. **The $40.00 has a section number and a reason it is not $32.** 536-619, raised from $32.00,
   which is why the ILP and floodplain rows still print $32.00.
3. **Nothing reads a valuation.** The programme's other jurisdictions all price at least one
   component from a job value; this schedule prices a subtype, an area and one fixture count.
4. **Craft permits are one figure each and their section is unchanged.** Stated in words on S2
   and in documentary form by S3's silence.
5. **A block rate is divided by its block.** Indianapolis's commercial plumbing row and South
   Bend's fire-protection sprinkler row are the two places this pass needed that reading.
6. **The administrative fee is a condition, not a charge.** 536-609 attaches to an unclosed
   permit.
7. **Two of the sheet's cells are defective and are named rather than smoothed** — R27's stray
   `2,000 sqft` and R29's 200-square-foot bracket floor.
8. **The self-certification row has no unit.** Charged once; the page says so.
9. **The site serves scripted requests a shell.** Both indy.gov pages used here were read from
   the rendered browser; a plain fetch of either returns 4.3 KB of empty application markup with
   a 200 status, which is the failure mode the process's second gate exists to catch.

## Effective dates on record

| Instrument | Date | How it was determined |
| --- | --- | --- |
| The fee schedule workbook | `2026-01-05` | Every worksheet is stamped "As of 1.5.2026"; S2 adds that the proposals "were fully approved in October 2025 and took effect January 5, 2026", and that permits applied for before that date are invoiced under the old schedule. |

## Requirements read (for the requirement rows)

- **The Class 1 / Class 2 split and the three columns** (S1 R7 and every STR row).
- **The 536-609 administrative fee** (S3 and S5) — quoted above.
- **The permitting sequence** (S4): infrastructure review and a drainage permit, then the
  improvement location permit ("Once the improvement location permit has been approved and
  issued, the structural permit can be obtained"), then the structural permit — with the caveat
  that "You may be required to secure permits for sewer connection, flood, drainage, wrecking,
  and improvement location before the structural permit can be released."
- **The four electrical exemptions** (S4), quoted in full on the page.
- **The four plumbing exemptions** (S4), including the 20-per-cent bound on replacement in kind.
- **The eligibility and craft-certificate provisions** (Proposal No. 334, 2025) — the definitions
  of "electrical power distribution system", "plumbing fixture" and the rest, and the sections
  governing who may obtain a permit and how craft work certificates of completion are purchased.
- **The structural application's documents** (S4): legal description, scaled site plan,
  foundation plan, floor plan, wall section, elevations, and engineer-stamped truss specs.

## Not modelled (named, never papered over)

- The **improvement location permit (ILP)** — its own $32.00 application fee and its own table
  (residential new single-family $199.00 metes-and-bounds / $156.00 platted-master permit /
  $156.00 platted, accessory buildings and additions $108.00, two-family $199.00, multi-family
  $682.00 plus $29.00 a unit or $380.00 plus $122.00 per additional 1,000 square feet, commercial
  new construction $380.00 up to 1,000 square feet plus $122.00 per additional 1,000, surface
  parking $152.00 per 1,000 square feet).
- The **sign, encroachment, right-of-way, street, driveway, wrecking, floodplain, drainage and
  private-provider rows**.
- The **residential parking, short-term rental and special event rows**.
- The **inspection table** and the **code-enforcement penalties**.
- The **contractor licensing and business licensing tables**.
- The **heating/cooling permit (HTG)**, a fourth trade on the same sheet.
- The **administrative fee**, as a per-permit charge — it is stated as a requirement instead.

## Open questions

1. **Chapter 536 itself could not be read.** The codifier URL returned HTML. The ordinance's own
   quotations (S3) carry every fee section used here, so nothing in the model depends on the
   chapter text; a later pass could confirm 536-620's exact bracket wording.
2. **R27's `2,000 sqft` and R29's `200` bracket floor are read as typos/thresholds.** The page
   names both. If the department publishes a corrected workbook, the readings should be revisited.
3. **The self-certification row's unit is unknown.** S1 prints `$22` with no unit and neither S2
   nor Proposal No. 334 prices a tag. Charged once; a phone call would settle it.
4. **Craft permits did not change on 1/5/2026, but their last change date is unrecorded.** S2 says
   the last large round of permitting-fee updates was split between 2010 and 2011; the craft
   sections may or may not have moved then. The page records `2026-01-05` as the schedule's
   effective date, which is the date the instrument was published rather than the date these
   rows were set.
5. **Accela is the portal, and its own fee display was not read.** A test application would
   confirm the order in which the three building components are charged, which the sheet does not
   state.
