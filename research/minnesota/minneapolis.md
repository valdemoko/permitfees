# Minneapolis, Minnesota — research record

**Research pass:** 16 (Minnesota, first jurisdiction)
**Read on:** 2026-09-25
**Jurisdiction:** City of Minneapolis (Hennepin County, fips 27053 — the County is a
locator; Minneapolis Development Review, inside Community Planning & Economic
Development, issues the City's construction permits citywide)
**Pages published:** building, electrical, plumbing

## Why Minneapolis opened Minnesota

Eight candidate cities were probed; five answered. Kansas City 403 (WAF), Louisville 403,
Minneapolis redirected 301 → 200 and — the decisive fact — publishes its fee schedules as
Smartsheet documents embedded on City fee pages, readable from this environment as static
HTML. Saint Paul, Nashville, Indianapolis and Salt Lake City answered 200; Minneapolis won
on market significance and instrument quality: its building schedule is the dataset's
clearest printed formula ("Building Permit Fee + Plan Review Fee (65% x building permit
fee) + MN State Surcharge (Value of Work x 0.0005) = Total Permit Fee"), and its electrical
trade is the state's own, giving Minnesota the authority-boundary pattern Fargo pioneered.

## Sources actually read

| # | Source | URL | Type | Dated |
| --- | --- | --- | --- | --- |
| 1 | Minneapolis Building Permit Fee Schedule (Smartsheet) | `https://publish.smartsheet.com/5bac769dc10f49f7a65d69b39243a54f` | fee_schedule (published sheet) | No date on the sheet |
| 2 | Minneapolis Plumbing Fee Schedule (Smartsheet) | `https://publish.smartsheet.com/2fef8aaf1a294ca2a7b815ec6c2bf33b` | fee_schedule (published sheet) | No date on the sheet |
| 3 | Building permit fees (page embedding S1) | `https://www.minneapolismn.gov/business-services/licenses-permits-inspections/construction-permits/permits-overview/fees/building/` | municipal_website | "Last updated on February 27, 2026" |
| 4 | Plumbing permit fees (page embedding S2) | `https://www.minneapolismn.gov/business-services/licenses-permits-inspections/construction-permits/permits-overview/fees/plumbing/` | municipal_website | "Last updated on February 27, 2026" |
| 5 | DLI — Electrical permits - contractors (+ printable page, worksheets) | `https://www.dli.mn.gov/business/electrical-contractors/electrical-permits-contractors` | state_agency | Worksheets "REV 6.2025" |
| 6 | DLI fee worksheets: `ele-fee-new.pdf`, `ele-fee-exist.pdf`, `ele-fee-non.pdf`, `ele-fee-multi-new.pdf` | `https://www.dli.mn.gov/sites/default/files/pdf/ele-fee-*.pdf` | state_agency | "Fees are determined by Minnesota Statute 326B.37"; REV 6.2025 |

All returned HTTP 200 from this environment on 2026-09-25. The Smartsheet embeds were
found by reading the fee pages' own "View full screen" links (`publish.smartsheet.com/…`)
and fetched as static HTML — the sheets render server-side, so every cell is readable
without a browser.

## The building schedule, as read (Smartsheet S1, complete)

The sheet's first row is the formula, quoted verbatim:

> "The total fee for a Building Permit is determined by adding together: Building Permit
> Fee + Plan Review Fee (65% x building permit fee) + MN State Surcharge (Value of Work x
> 0.0005) = Total Permit Fee"

| Construction Value | Building Permit Fee |
| --- | --- |
| Minimum Fee — Residential or Commercial | **$84.20** (does not include State Surcharge) |
| $1.00 - $500.00 | $36.70 (Minimum Fee Applies) |
| $501.00 - $2,000.00 | $36.70 — first $500 plus **$4.50 each add'l $100** and fraction thereof including $2,000 |
| $2,001.00 - $25,000.00 | $104.20 — first $2,000 plus **$20.60 each add'l $1,000** and fraction thereof including $25,000 |
| $25,001.00 - $50,000.00 | $578.00 — first $25,000 plus **$14.90 each add'l $1,000** and fraction thereof including $50,000 |
| $50,001.00 - $100,000.00 | $950.50 — first $50,000 plus **$10.60 each add'l $1,000** and fraction thereof including $100,000 |
| $100,001.00 - $500,000.00 | $1,480.50 — first $100,000 plus **$8.40 each add'l $1,000** and fraction thereof including $500,000 |
| $500,001.00 - $1,000,000.00 | $4,840.50 — first $500,000 plus **$6.90 each add'l $1,000** and fraction thereof including $1,000,000 |
| $1,000,001.00 and up | $8,290.50 — first $1,000,000 plus **$5.60 each add'l $1,000** and fraction thereof |

Footnote: "*Construction Value to be included in determining building permit valuation in
accordance with building code language (1300.0160 Subp 3), bulletin 058 and Minneapolis
Code of Ordinances (Title 5, Ch. 91, Article II, Section 91.220)".

Also on the sheet: "Detached garages — See Minneapolis detached garage fee schedule" (a
separate schedule, named and not read as part of this pass).

## The plumbing schedule, as read (Smartsheet S2, complete)

| Type of work | Fee |
| --- | --- |
| Minimum Fee — Residential & Commercial | **$85.20 (Includes $1.00 State Surcharge)** |
| Full Fixture — All Occupancies | $41.40 |
| Fixture Set Only — All Occupancies | $41.40 |
| Waste and Vent Only — All Occupancies | $41.40 |
| Rainwater Leader, for 10 stories or fraction thereof | $41.40 |
| Replacing or extending water distribution piping, each 100 lineal feet or fraction thereof | $41.40 |
| Alterations — each $500 or fraction thereof | $41.40 |
| MN State Surcharge fee of $1.00 is required for each permit application | $1.00 |

Also on the sheet (gas permits, not the plumbing permit): "See Chapter 91 for Complete Fee
Schedule"; Non-Heating Gas Burner rows ($85.20 minimum; $73.30 not exceeding 399,999 Btu;
$291.00 400,000 and over; footnote on combined burners); "Gas Piping Only — 1.99% of the
value or the minimum fee, whichever is greater"; "MN State Surcharge fee of $1.00 should
be added to the total permit fee (except minimum as shown)".

## The state electrical schedule, as read (DLI worksheets, complete for new dwellings)

Every worksheet carries: "The minimum fee for each separate inspection is $55 … Any fee
discrepancies will be reviewed by the inspector, and you will be billed for the
difference. Fees are determined by Minnesota Statute 326B.37."

**New one- and two-family dwellings (ele-fee-new.pdf, REV 6.2025):**

| Line | Item | Fee |
| --- | --- | --- |
| 1 | Number of inspection trip(s) | $55/inspection trip |
| 2-4 | Services, generators, other power sources, feeders to separate structures: 0-400 A / 401-800 A / over 800 A | $35 / $60 / $100 per source |
| 5-6 | New Dwelling Unit 1 / Unit 2 (up to 30 circuits and/or feeders per unit) | $165/dwelling unit |
| 7-8 | Additional circuits and/or feeders over 30 per unit | $12/feeder or circuit |
| 9 | Separate bonding inspection | $55/inspection |
| 10 | Inspection of concrete-encased grounding electrode | $55/inspection |
| 11 | Technology circuits & circuits less than 50 volts | 75¢/device or apparatus |
| 13 | The largest amount from line 1 OR line 12 (subtotal) | — |
| 14 | "The Minimum fee for a new one-family dwelling is $200, and a two-family dwelling is $400 (for each separate dwelling unit, this includes the service up to 400 A, up to 30 circuits, and a maximum of 4 inspections)" | Enter $200 or $400 |
| 16 | Required permit fee | $25.00 |
| 17 | Required permit surcharge | $1.00 |
| 18 | GRAND TOTAL = lines 15 through 17 | — |

**Non-dwellings (ele-fee-non.pdf)** add: over-600-volt power sources $70/$120/$200;
circuits 0-200 A $12, over 200 A $15; over 600 V $24/$30; reconnected existing circuit $2;
transformers $15 (≤10 kVA) / $30 (>10 kVA); manufactured home park lot supply $35/pedestal;
RV pedestals $12/circuit; street/parking lot/traffic standards $5/standard; sign power
supplies $5/power supply; technology circuits 75¢/device; lighting retrofit 25¢/fixture;
center pivot irrigation boom $35, drive units $5/unit. The multi-family and
existing-dwelling worksheets follow the same shape.

## Readings this dataset depends on

**(a) The ladder is marginal with per-band fraction round-ups.** Every band after the
first reads "first $X plus $Y each additional $1,000 and fraction thereof". The sheet's
own anchor makes the reading unambiguous: $2,001 of value is $104.20 — the printed base
plus one whole $20.60 step for the single-dollar fraction. Each band is its own rule
carrying its printed base, because the seams are the schedule's own printed bases
($104.20, $578.00, $950.50 …), not derivable arithmetic — the $25,000 seam prints $578.00
where the prior band's formula computes $578.20, a two-cent rounding the schedule itself
contains, charged as printed. Band 2's ladder is denominated in $100 steps, the only one
of its kind on the sheet; it is a per-thousand row over $100,000 cents with its increment
set to $100.

**(b) The plan review is 65% of the permit fee.** The formula's own words. No separate
plan-review table exists on the sheet; the relationship is the table. Charged as a
plan-review component reading `permit_fee`, the engine's base subtotal, so the 65% is of
the permit fee alone.

**(c) The state surcharge takes two forms, each where its sheet says it.** Building:
"Value of Work x 0.0005" — five cents per $1,000 of work, a factor charged on the work.
Plumbing: "$1.00 per permit application". Both are `state_surcharge` components charged
exactly as their schedules state them.

**(d) The two minimums disagree about the surcharge, on purpose.** Building: "$84.20 (does
not include State Surcharge)" — the formula adds the surcharge after. Plumbing: "$85.20
(Includes $1.00 State Surcharge)" — at the floor the surcharge is inside. The plumbing
model implements the sheet's own logic: the minimum rule and the $1.00 rule are wired so
the surcharge charges only when the floor does not bind (the minimum sets
`custom.mn_surcharge_paid` when it applies), so $41.40 of rows pays $85.20 and never
$86.20.

**(e) The plumbing rows stack with the minimum as floor.** "$41.40" is seven rows of the
sheet, of which three are scope rows (full fixture, fixture set, waste and vent — selected
by the scope stated), one is a per-10-stories block, one a per-100-feet block, one a
per-$500 block, plus the $1.00. The minimum is a floor on the permit — "$85.20 Minimum Fee
- Residential & Commercial" — and a one-fixture permit computes $42.40 ($41.40 + $1.00) and
pays $85.20; ten fixtures compute $415.00 and pay it.

**(f) Electrical is the state's, under 326B.37.** The City's fee pages list no electrical
fee schedule; the state's Electrical Act gives the inspection to DLI or its contract
inspectors, and the AHJ directory decides who issues where. The electrical page is built
from the state's own worksheets — inspection trips at $55, power sources by amperage,
dwelling units at $165 with the $200/$400 minimums, the $25 permit fee and $1 surcharge —
the same authority boundary Fargo recorded with NDSEB, and the worksheet's "largest of
line 13 or line 14" logic is carried as the $165 rows beside the $200 minimum rule.

**(g) The worksheet's trueing rule is named, not modelled.** "These calculated fees may
not accurately represent all the required inspection fees. Any fee discrepancies will be
reviewed by the inspector, and you will be billed for the difference." An estimate that
the inspector trues up — the pages charge what the worksheets compute and state the
trueing rule beside them.

## Effective dates on record

The Smartsheet schedules print no date; the City pages embedding them are stamped "Last
updated on February 27, 2026", and the sheet says "Fees are updated upon City Council
directive (or action)" — so 2026-02-27 is carried as each rule's `effectiveFrom`, the
City's own last-updated stamp, with the caveat recorded. The DLI worksheets print
"REV 6.2025" and cite 326B.37; the state rows carry the read date with the revision
numbered.

## Requirements read (for the requirement rows)

From the fee pages' contact block: Minneapolis Development Review, Community Planning &
Economic Development, 612-673-3000, Public Service Building, 505 Fourth Ave. S., Room 220,
Minneapolis, MN 55415; service center hours Monday-Thursday 8 a.m. - 4 p.m., Friday 9
a.m. - 4 p.m. "Fees are updated upon City Council directive (or action)" — the fee-change
mechanism, quoted on both pages. From DLI: "If the AHJ column lists 'State,' file the
permit with us"; the inspector directory, virtual-inspection eligibility (three circuits,
standard $35 fee), and the account/linking requirement for online permits.

## Not modelled (named on the sheet, never papered over)

- **The detached-garage schedule** — "See Minneapolis detached garage fee schedule": a
  separate instrument, named by the building sheet, not read this pass.
- **The gas rows on the plumbing sheet** — Non-Heating Gas Burner ($73.30 / $291.00,
  minimum $85.20, combined-burner footnote) and "Gas Piping Only — 1.99% of the value or
  the minimum fee, whichever is greater": gas permits, a trade this site's plumbing page
  does not price; transcribed here in full.
- **The plumbing sheet's Chapter 91 pointer** — "See Chapter 91 for Complete Fee
  Schedule": the ordinance behind the sheet, named rather than read as the source (the
  sheet is the City's own published schedule).
- **The DLI worksheet rows not on the new-dwelling sheet** — over-600-volt services
  ($70/$120/$200), non-dwelling circuits ($12/$15/$24/$30), reconnected circuits ($2),
  transformers ($15/$30), pedestals and signs ($35/$12/$5), technology devices (75¢),
  lighting retrofit (25¢), irrigation ($35/$5): transcribed in this record, modelled
  where the page's facts reach (services, dwelling units, trips) and named where they do
  not.
- **Parkland dedication, signs, code compliance, refunds** — separate City fee pages in
  the same fee index, other instruments entirely.

## Open questions

1. **The date the current ladder took effect.** The sheet says fees change "upon City
   Council directive"; the pages stamp February 27, 2026 as their last update. If the
   ordinance history of §91.220 is found, the ladder gains its real enactment date.
2. **Whether the $84.20 building minimum includes the plan review.** The sheet's
   parenthetical excludes only the State Surcharge; the formula's 65% plan review applies
   to "the building permit fee", and a minimum fee is that fee. The model charges 65% of
   $84.20 beside it. A Development Review confirmation would settle whether the minimum
   is before or after plan review.
3. **The plumbing minimum's interaction with the block rows.** The model reads the $85.20
   as a floor on the whole permit (the sheet's "Minimum Fee - Residential & Commercial"
   beside "Type of work" rows), so a five-block alteration ($207.00 + $1.00) pays its own
   arithmetic. If the minimum instead applies per row, multi-block jobs are understated.
   With that floor settled, the two block rows read as block rates and nothing else:
   "Alterations - each $500 or fraction thereof $41.40" is $82.80 per $1,000 applied to
   value rounded up to whole $500s ($2,000 → $165.60, $2,100 → $207.00), and "Rainwater
   Leader, for 10 stories or fraction thereof $41.40" is $4.14 per story applied to the
   count rounded up to whole ten-story blocks (25 stories → $124.20). Both readings were
   wrong on first pass — a $8.28-per-$1,000 rate and a base-plus-allowance shape, each
   understating the permit by an order of magnitude — and both were corrected against the
   printed rows before publication.
4. **The AHJ boundary in practice.** The state issues where the directory says "State",
   contract inspectors elsewhere; the electrical page prices the state's own worksheet.
   Whether Minneapolis ever appears as its own AHJ for electrical is a directory lookup
   at permit time, not a fee question.
