# South Bend, Indiana — research record

**Jurisdiction.** City of South Bend, St. Joseph County, Indiana. The permitting authority is
the **St. Joseph County / City of South Bend Building Department**, a joint county/city
department; the city is its home and the county is the other half of its jurisdiction. The
schedule was retrieved and read on **2026-09-26**, and every rate in
`src/content/southbend/fee-rules.ts` traces to it.

**Status.** Published. Three permit pages — building, electrical, plumbing.

---

## Why South Bend opened Indiana

Indiana was the first state after Tennessee with two reachable authorities whose fee instruments
are real documents rather than JavaScript shells. South Bend was chosen over Indianapolis to go
first only because its instrument is one PDF rather than one workbook; both were read in the
same pass. The gate that mattered was the one the process names: **is the rate readable, or only
the page around it.** South Bend's answer is a seventeen-page PDF whose building section is a
formula and a hundred-row ladder, and whose electrical and plumbing sections are price lists —
all of it extractable, with one caveat recorded below.

---

## Sources actually read

**S1 — "St. Joseph County / City of South Bend Building Department Permit Fee Schedule 2026".**
`https://southbendin.gov/wp-content/uploads/2026/01/FeeSchedule-2026-1.pdf`, published January
2026, linked from the Building Department page. Seventeen pages, retrieved 2026-09-26.

**S2 — Building Department page.** `https://www.southbendin.gov/departments/building`. The page
that publishes S1, and the authority's own index to it. Read as HTML.

### How S1 was read — and the one defect in the reading

`pdftotext` in this environment is Xpdf 4.00 (`pdftotext version 4.00`), not Poppler: it has no
`-bbox` and no `-table`, but it does have `-raw`, `-simple`, `-fixed` and `-layout`. **The plumbing
page (page 10) is mis-paired by `-layout` and `-fixed` and correctly paired by `-raw` and
`-simple`.** The disagreement is not cosmetic — it moves every amount on the page by one row
from "Backflow Protection" onward:

| Row | `-layout` / `-fixed` | `-raw` / `-simple` (what the sheet prints) |
| --- | --- | --- |
| Backflow Protection, each | $12.00 | **$6.00** |
| Building Sewer, under 100' / 100'+ | $25.00 / $12.00 | **$12.00 / $25.00** |
| Building Water, under 100' / 100'+ | $25.00 / $7.00 | **$12.00 / $25.00** |
| Water softener, each | $10.00 | **$7.00** |
| Trailer Park Sewer, each | $6.00 | **$10.00** |
| Water heater and/or vent, each | $7.00 | **$7.00** |
| Lawn sprinkler system, per meter | $60.00 | **$6.00** |
| Fire protection sprinkler, up to 30 heads | $8.00 | **$60.00** |

Two modes agree against two, and the pairs are internally consistent (the `-raw` set is the one
where the sprinkler block reads "$60.00 up to 30 heads / plus $8.00 for each additional 10" and
the lawn sprinkler row reads like every other $6.00 device row). The model follows `-raw`/
`-simple`; the page names the disagreement in its FAQ. **The building pages (3–6), the electrical
page (9) and the HVAC pages (11–12) agree across all four modes**, so only the plumbing page
carries this caveat.

---

## The building section, as read (S1, complete)

Two mechanisms in one section, selected by the work rather than by the applicant.

**New construction and additions.** The formula, verbatim:

> The fee for permits issued for residential and commercial new construction and building
> additions shall be based upon the following:
> a. Cost per Square Foot (CSF) times the Total Square Footage (TSF) times the Local Variable
> Factor (LVF) of $.00098.
> b. Cost per Square Foot (CSF) shall be determined by the International Code Council Building
> Valuation Table in effect in January of each year.
> c. The cost per square foot (CSF) by occupancy classifications shall be amended as follows:
> 1. Groups F-1, F-2, H-1, H-2, H-3, H-4, and M shall have the same rate As A-3.
> 2. Groups I-4, R-2, and R-4 shall have the same rate as I-1.
> 3. Groups S-1, S-2, and U shall have the same rate as R-3.
> d. Minimum Fee - $60.00

`CSF × TSF` is the construction valuation; `.00098` is the rate applied to it. Modelled as
`percent` on `valuation` with the exact fraction `98/100000` and `minimumCents: 6000`. Paragraph
(c) is a rule about the ICC table, not about the rate, and is carried as a requirement.

**Remodeling, alterations and repairs over $500.00, fence installations, in-ground pool
installation, communication towers, and utilities.** A printed table of 100 rows:

| Estimated construction cost | Permit fee |
| --- | --- |
| $1.00 to 3,000.00 | $60.00 |
| 3,001.00 to 4,000.00 | $65.00 |
| 4,001.00 to 5,000.00 | $70.00 |
| 5,001.00 to 6,000.00 | $75.00 |
| … (+$5.00 per $1,000 band) | … |
| 9,001.00 to 10,000.00 | $95.00 |
| … | … |
| 99,001.00 to 100,000.00 | $545.00 |
| 100,000 and up | $550.00\* |

> \* PLUS per thousand dollars ($1000.00) of estimated construction cost thereafter, up to
> $1,000,000.00 total estimated construction cost … $0.90
> \* PLUS per one thousand dollars ($1000.00) of estimated construction cost thereafter … $0.60

Read as one arithmetic — $60.00 at $1–$3,000 plus $5.00 per $1,000 band above $3,000, each band
bought whole — the model reproduces **all 100 printed rows exactly**. Row-by-row verification
found no misprint in this table, which makes it the cleanest long table in the dataset so far
(compare Saint Paul's three defects and Minneapolis's two-cent seam).

**The seam steps up.** $545.00 at $100,000 and $550.00 at $100,001 — $5.00 *higher*, where
Minneapolis and Saint Paul both print a step down. Charged as printed, and explained on the page.

**Two inspection rows** close the building section: "Each reinspection for commercial and
industrial projects … $60.00" and "Each additional final inspection necessitated by the failure
to pass previous final inspection … $80.00". Modelled as `inspection` components gated on the
trip being requested.

**CITY PROJECTS ONLY — Fire Department Commercial Plan Review Fee.** $348.00 sprinkled, $205.00
non-sprinkled, $253.00 addition, and a remodel ladder from $45.00 at $1,000 to $250.00 at
$58,000 with $253.00 above it. **Not modelled**: its own heading says it prices the City's own
projects, not a permit a reader buys.

**NORTHEAST NEIGHBORHOOD DEVELOPMENT AREA DESIGN REVIEW FEES.** "All stand-alone residential or
commercial new construction, in addition to and separate from any other permit, processing, or
review fee … $160.00\*". Modelled as an `other` component gated on the plan being in the overlay
district.

**The penalty.** "WHERE A PERSON SHALL UNLAWFULLY PROCEED TO DO ANY WORK OR CONSTRUCTION WITHOUT
A REQUIRED PERMIT, THE PERMIT FEES SHALL BE TRIPLED AS A PENALTY." Stated as a requirement, never
multiplied into a rule.

---

## The electrical section, as read (S1 page 9, complete)

Opening line: "Electrical permits issued and obtained prior to commencement of the work for
which such permit is required, the following fees shall be levied, **with a minimum permit fee
being $60.00**."

| Row | Fee |
| --- | --- |
| Temporary Services (All amperage) | $7.00 |
| Switchboards and Panel Boards each (new and replaced): 60 / 100 / 200 / 400 / 600 amp | $7.00 / $9.00 / $12.00 / $15.00 / $20.00 |
| … Over 600 to 2,000 amp / Over 2,000 amp | $25.00 / $50.00 |
| Circuits, each (new or replaced) | $5.00 |
| Horsepower (machinery): First hp / Each additional hp | $7.00 / $0.25 |
| Back-up generator: a. 10 Kw or less / b. Over 10 Kw | $60.00 / $70.00 |
| Pool wiring and/or bonding | $60.00 |
| Repair, extension, and/or maintenance of wiring | $60.00 |
| Reset, Relocation, and Reconnect, each | $60.00 |
| Reinspection fee, each | $60.00 |
| Additional final inspection, each | $60.00 |
| Solar Array | $60.00 plus percentage of the construction cost as established by the Departments fee schedule |
| Electrical Vehicle Device | $60.00 |

A closing note about applying, not paying: "If the exact number of circuits or horsepower is
unknown at the time of application for a permit, a permit may be taken for the minimum amount
known with new permits issued as the intent of the work known."

**Modelled as a stacked price list** — each row its own rule gated on its own fact — with the
$60.00 floor as one `permit_minimum` over the permit, because that is what the opening line says.

**The panel classes.** Seven printed rows selected by the board's amperage. The model reads one
amperage fact for the permit and one count of boards, which is exact for the ordinary one-board
service change and is **named on the page as a limitation** for a permit carrying boards of
several different amperages. This is the same shape Nashville's class rows had, but here it is
modelled rather than left out, because the row is the second-most-used line in the section.

**Not modelled from this page:** the percentage in the solar row (the row defers to "the
Departments fee schedule", and that instrument is not published).

---

## The plumbing section, as read (S1 page 10, complete, via `-raw`)

Opening line: "… with a minimum permit fee being $60.00."

| Row | Fee |
| --- | --- |
| Each plumbing fixture or trap or set of fixtures on one trap, incl. water and drainage piping | $6.00 |
| Backflow Protection, each | $6.00 |
| Building Sewer, each: Under 100' / 100' or over | $12.00 / $25.00 |
| Building Water, each: Under 100' / 100' or over | $12.00 / $25.00 |
| Water softener, each | $7.00 |
| Trailer Park Sewer, each | $10.00 |
| Drain within building for rainwater systems, each | $6.00 |
| Water heater and/or vent, each | $7.00 |
| Gas Reconnection, each | $60.00 |
| Each gas piping system, per outlet | $3.00 |
| Industrial waste pretreatment interception, incl. trap and vent, excepting kitchen-type grease interceptors functioning as fixture traps, each | $8.00 |
| Installation, alteration or repair of water piping and/or water treating equipment | $6.00 |
| Repair or alteration of drainage or vent piping | $6.00 |
| Drywells, each | $12.00 |
| Lawn sprinkler system on any one meter, incl. backflow protection devices, each | $6.00 |
| Fire protection sprinkler system: Up to 30 heads / Plus each additional 10 heads thereafter | $60.00 / $8.00 |
| Gas tanks and pumps | $12.00 |
| Back-up generator -gas line: a. 10 Kw or less / b. Over 10 Kw | $60.00 / $70.00 |
| Reinspection | $60.00 |
| Additional final inspection, each | $75.00 |

**The block rate.** "Up to 30 heads $60.00; Plus each additional 10 heads thereafter $8.00" is
$60.00 for the first thirty heads and $8.00 for each whole or partial ten above them. Stated in
the engine as **$0.80 a head inside a ten-head increment**, so 30 heads is $60.00, 31 is $68.00
and 41 is $76.00. The same reading is what South Bend's panel rows and Indianapolis's commercial
plumbing row need: a block rate is not a per-unit rate.

**Every row on the page is a count, a length or a capacity.** Nothing here prices a valuation or
an area — the opposite of the building section above it on the same document — which is why the
plumbing page has no "what counts as the valuation" note and why the two front-of-document
sections cannot be read by the same rule.

---

## Readings this dataset depends on

1. **The plumbing page needs two extraction modes.** Recorded above in full; the model follows
   `-raw`/`-simple` and the page names the disagreement.
2. **New construction is 0.00098 of the valuation.** `CSF × TSF` is the ICC table's construction
   valuation, so the rate multiplies a valuation and not an area. Stated as the exact fraction
   `98/100000` rather than a rounded decimal.
3. **The alteration ladder is one arithmetic and its 100 rows reproduce exactly** — $60.00 at
   $1–$3,000 plus $5.00 per $1,000 band, each band bought whole.
4. **The seam at $100,000 steps up**, from $545.00 to $550.00, and is charged as printed.
5. **The two open rates are $0.90 per $1,000 to $1,000,000 and $0.60 per $1,000 above it**, and
   the base above $1,000,000 is the $1,360.00 the band beneath reaches at the seam — the sheet
   prints the rate and not the base, so the base is derived from continuity and named as such.
6. **Two $60.00 minimums and two different pairs of inspection rows.** Electrical prices its
   reinspection and additional final inspection at $60.00 each, so one rule carries them;
   plumbing prices the same pair at $60.00 and $75.00, so the model separates reinspections from
   final inspections as two facts.
7. **A block rate is divided by its block.** The fire-protection row is $0.80 a head inside a
   ten-head increment, which is what makes 31 heads $68.00 rather than $140.00.
8. **The panel board limitation is stated, not hidden.** One amperage per permit, exact for a
   one-board change.
9. **The triple-fee penalty is a requirement, not a multiplier.**

## Effective dates on record

| Instrument | Date | How it was determined |
| --- | --- | --- |
| The 2026 fee schedule | `2026-01-01` | Title page: "PERMIT FEE SCHEDULE 2026"; file published January 2026 under `/2026/01/`. The document carries no day-level stamp, so the year's first day is recorded as the effective date and every rule cites it. |

## Requirements read (for the requirement rows)

- **The valuation basis is the ICC table's**, with three occupancy groupings amended onto it
  (paragraphs b and c). Quoted in full above and carried as a requirement.
- **The department's jurisdiction** — the city, the unincorporated county (Wyatt, Granger, Terre
  Coupe, Crumstown) and five towns (Indian Village, Lakeville, North Liberty, Osceola, Roseland)
  that hand it their inspections while keeping their own improvement location permits;
  Mishawaka, New Carlisle and Walkerton have their own departments. The department's own
  discriminator is the address: five digits is the county, three or four with a South Bend
  mailing is the city.
- **Contractor registration** — all contractors and subcontractors must be registered or
  licensed with the department, except an owner-occupant of a residential dwelling. Registration
  fees ($125.00 against bonds, $50.00 examination filing fee) are recorded and **not charged**.
- **The electrical page's application note** — a permit may be taken for the minimum known and
  the count settled later.
- **The triple-fee penalty**, quoted above.
- **The residential application checklists** (page 17) — remodeling, additions and new
  dwellings, including the New Construction list's requirement of septic/well permits from the
  St. Joseph County Health Department or sewer/water permits from South Bend Engineering, and a
  driveway permit from County Engineering where applicable.

## Not modelled (named, never papered over)

- The **heating, ventilating and air-conditioning schedule** (pages 11–12; read `-raw`, and it
  agrees with `-layout`) — a fourth trade with its own $60.00 minimum and its own capacity rule
  ("When the total capacity of any system in any single installation is provided by more than one
  (l) unit, the sum of the capacities of each unit and the total number of such units shall
  determine the fee"): space heaters at 30,000 BTU input or more, warm-air furnaces, unit and
  cabinet heaters and radiant tube heaters, oil and gas conversions and electric air-handling
  furnaces all $60.00; central electric A/C $60.00 under 10 tons and $70.00 over; water chillers
  $85.00; EMI air blowers $60.00; ventilating and exhaust systems $6.00 / $12.00 / $20.00 by CFM;
  ventilating commercial hoods $120.00 each; refrigeration and engine-drive, gas-fired or
  oil-fired cooling $60.00 up to 10 horsepower and $75.00 above; rooftop combination units
  $60.00 up to 7½ tons and $75.00 above; heat pumps $75.00 up to 7½ tons and $85.00 above, with
  earth-coupled water source at $60.00; mini-splits $60.00 a unit and $20.00 a head; boilers
  $60.00 up to 300,000 BTU and $70.00 above; VAV boxes and P-Tac units $60.00; air handlers
  $70.00; duct and register work $60.00 / $80.00 / $100.00 by openings; a back-up generator's gas
  line and a gas reconnection at $60.00; gas piping $3.00 an outlet; wood burning stoves $60.00 a
  flue; reinspections $60.00; and additional final inspections $70.00 — $5.00 below the plumbing
  page's $75.00 for the same trip, which is the kind of disagreement between two pages of one
  document this dataset keeps rather than averages.
- The **Fire Department commercial plan review table** — "CITY PROJECTS ONLY".
- The **solar row's percentage** — the row defers to an instrument the department does not
  publish.
- The **miscellaneous permit fees** (page 13) — moving ($125.00/$175.00), wrecking ($0.02 or
  $0.015 a square foot with a $60.00 minimum), signs ($40.00 to $120.00 by area, plus temporary
  signs), tents and temporary structures, and a $70.00 document processing fee.
- The **licensing and registration rows** (pages 14–15).
- The **minimum required inspections** and the **residential application checklists** (pages
  16–17) — requirements, with no fee row of their own.

## Open questions

1. **The schedule carries no day-level effective date.** Its title says 2026 and its file path
   says January 2026; the model records `2026-01-01` and every rule cites it. If the department
   publishes a stamped edition, the date should be replaced with the stamped one.
2. **The alteration ladder's over-$1,000,000 base is derived, not printed.** The sheet prints
   "$0.60 per one thousand ... thereafter" with no base; the model uses the $1,360.00 the band
   beneath reaches at $1,000,000, which is the only figure that makes the two printed rows
   continuous. Worth re-checking against a later edition.
3. **A permit with panel boards of several different amperages is priced at the amperage
   entered.** The sheet prices the board and not a class total, and the model has one amperage
   fact. Exact for a one-board change; an approximation for a mixed one, and stated on the page.
4. **The percentage in the solar row is unpublishable.** The row points at "the Departments fee
   schedule" and that percentage is not on the instrument published at the department's own URL.
   A second document may exist in the department's office.
5. **Mishawaka, New Carlisle and Walkerton are outside this schedule** and have their own
   departments. They were not probed; if any of them publishes a fee schedule, it is a separate
   record.
