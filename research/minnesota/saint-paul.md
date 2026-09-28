# Saint Paul, Minnesota — research record

Second Minnesota jurisdiction, after Minneapolis. Saint Paul is the state capital, sits on the
opposite bank of the Mississippi, and makes the dataset's cleanest comparison: the same state,
the same statute book, and the *opposite* answer to the question Minneapolis raises — who issues
an electrical permit. Minneapolis's is the State's, under 326B.37, priced from DLI's worksheets.
Saint Paul's is the City's own, priced by DSI's Electrical Inspection Department from six
published tables. Two cities, one river, two authorities.

Everything below was read on **2026-09-25**. Nothing is estimated.

## Why Saint Paul completes Minnesota

The user's rule for a state is two cities with all three trades. Minneapolis gave Minnesota its
building/plumbing city and a state-electrical boundary; Saint Paul gives it an authority that
prices all three trades itself, and the two instruments the state's surcharge actually lives on.
It also brings the dataset two things no other jurisdiction has:

- **The first long closed valuation table.** 103 printed rows — $100 wide to $2,000, $1,000 wide
  to $100,000 — which turn out to be four segments of one arithmetic.
- **A statutory surcharge read from the statute.** The schedule names M.S. § 326B.148 and defers
  to it above $1,000,000; the six bands are marginal rates that reproduce every seam exactly.

## Sources actually read

| Key | Instrument | How read |
| --- | --- | --- |
| S1 | **DSI Building Permit Fee Schedule**, 3-page PDF, "Effective: 2/25/2023", "Section 33.04 of the Saint Paul Legislative Code" — `stpaul.gov/sites/default/files/2023-02/DSI.BldgPermitFeeSchedule.2023_0_3.pdf` | `curl` + `pdftotext -layout` and `pdftotext -table`; all 112 printed valuation rows parsed and compared against the model |
| S2 | **Electrical permit pages** — the trade hub plus six fee-bearing subpages (service/circuits, AC/furnace/boiler, capacitor/generator/transformer, low voltage, fire alarm, solar PV) | `curl` + HTML strip; each subpage's `Fees` table captured row by row |
| S3 | **Plumbing application and inspection fees** — the plumbing trade's fee table | `curl` + HTML strip; the six-row table captured verbatim |
| S4 | **Minnesota Statutes § 326B.148** — "Surcharge", 2025 edition | `revisor.mn.gov/statutes/cite/326B.148`, subdivision 1 read in full |
| S5 | **Plumbing plan review guidelines** PDF (`DSI.Bldg_Plumbing_PLUMBING PLAN REVIEW GUIDELINES AND PLUMBING INSPECTION 2023.pdf`) | `pdftotext -layout`; requirement rules only, no fee |
| S6 | **Building Permits & Inspections** and sibling pages (demolition, fence, stucco/plaster, warm air) | `curl` + HTML strip; row extraction for the not-modelled list |

The pages carrying S2 and S3 print **no date of their own**. They sit inside PAULIE, the City's
permitting platform, whose launch the City's own announcements date to **September 17, 2025** —
the date carried for those tables. The building schedule dates itself: **2/25/2023**.

## The building schedule, as read (S1, complete)

Header: `DEPARTMENT OF SAFETY & INSPECTIONS (DSI) / BUILDING PERMIT FEE SCHEDULE / Section 33.04
of the Saint Paul Legislative Code / Effective: 2/25/2023`.

**Pages 1–2 — the closed table.** `VALUATION / FEE`, two columns, in the sheet's own words:

```
0 to 500 = 36          501 to 600 = 41        601 to 700 = 46
701 to 800 = 51        801 to 900 = 56        901 to 1,000 = 61
1,001 to 1,100 = 66    …  1,901 to 2,000 = 111
2,001 to 3,000 = 127   3,001 to 4,000 = 148   4,001 to 5,000 = 169
…                      12,001 to 13,000 = 337
…                      24,001 to 25,000 = 589
25,001 to 26,000 = 606 …  49,001 to 50,000 = 966
50,001 to 51,000 = 983 …  67,001 to 68,000 = 1,170
68,001 to 69,000 = 1,181   …  80,001 to 81,000 = 1,313
82,001 to 83,000 = 1,335   84,001 to 85,000 = 1,357
85,001 to 86,000 = 1,369   86,001 to 87,000 = 1,379
…                          99,001 to 100,000 = 1,522
```

Three defects in that table, all found by parsing every row and comparing it with the arithmetic:

1. **$81,001–$82,000 is missing.** The sheet prints `80,001 to 81,000 = 1,313` and then
   `82,001 to 83,000 = 1,335`. Two rows span two steps ($22 = 2 × $11), so the omitted row is
   $1,324 at the arithmetic.
2. **$83,001–$84,000 is missing.** `82,001 to 83,000 = 1,335` is followed by
   `84,001 to 85,000 = 1,357`, another two-step span, so the omitted row is $1,346.
3. **$85,001–$86,000 is printed $1,369 where the arithmetic gives $1,368.** Every neighbouring
   row is $11 away from its neighbour; this one is $12 above $1,357 and $10 below $1,379.

Both extraction modes (`-layout` and `-table`) agree, so the omissions are in the document, not
in the reading. **The calculator charges the arithmetic** — the omitted rows at $1,324 and $1,346,
the misprinted row at $1,368 — because the table states one rate ($11.00 per $1,000) across that
band and the three defects are transcription noise, not printed bases. This is the opposite call
from Minneapolis's two-cent seam, where each band's *base* is printed and the printed base wins;
here no row in the band has a base of its own. Named on the page and in the test.

**Page 3 — the open bands, the surcharge and the plan check.**

```
$100,001 TO $500,000     $1,499 for the first $100,000 plus $8 for each additional $1,000 or
                         fraction thereof
$500,001 - $1,000,000    $4,899 for the first $500,000 plus $7 for each additional $1,000 or
                         fraction thereof
$1,000,000 & Up          $8,463 for the first $1,000,000 plus $5 for each additional $1,000 or
                         fraction thereof
```

Note the **step down**: the closed table reaches **$1,522 at $100,000**, and the first open band
starts at **$1,499 for the first $100,000** — $23 lower at the seam. Charged as printed, exactly
as Minneapolis's $578.00 is.

```
STATE SURCHARGE:
Minnesota Statute 326B.148   Value                Surcharge
                             $1.00 - $1,000       =  $0.50
                             $1,000,000           =  0.0005 x Job Value
                             > $1,000,000         =  see statute

PLAN CHECK FEE:              Valuations ≤ $1,000   =  no fee
                             Valuations > $1,000   =  65% of permit fee from table above
```

Closing note, quoted in full because it is a page-length disclaimer rather than a footnote:

> This calculation is for the building permit fee only and does not include other fees that may
> be included to obtain your building permit. An example would be SAC, Parkland Dedication,
> Zoning and other miscellaneous required fees).

## The electrical schedule, as read (S2, complete)

Saint Paul prices electrical itself. Six tables, one per sub-permit; every one ends with the state
surcharge row.

| Sub-permit | Rows, verbatim |
| --- | --- |
| Service / circuits | `Per Service; New, Altered, or Repaired` **$85.00** · `Per Circuit; New, Altered, or Repaired` **$15.00** · `Minimum Fee` **$85.00** · `State Surcharge (Minimum)` **$1.00** |
| Air conditioner / furnace / boiler | `Per Unit Installed, Per Circuit` **$15** · `Per Unit Installed, With Other Electrical Work, No New Circuit` **$0** · `Minimum Fee` **$85** · `Minimum State Surcharge` **$1** |
| Capacitor / generator / transformer | `Per unit installed` **$54.00** · `For KVA or KVAR; or fraction thereof` **$1.00** · `Minimum fee` **$85.00** · `Minimum state surcharge` **$1.00** |
| Low voltage power circuit | `Per Control Panel` **$85.00** · `Per Device` **$2.00** · `Minimum Fee` **$85.00** · `Minimum State Surcharge` **$1.00** |
| Fire alarm | Electrical permit: `Per Control Panel` **$78.00** · `Per Device (Horn, Strobe, Pull Station, Etc.)` **$1.88** · `Minimum Fee` **$78.00** · `Minimum State Surcharge` **$1.00** — *and* a second table under **Fire Engineering Application**: `Flat Fee` **$78.00** · `Fire Alarm Control Panel` **$22.00** · `Per device (horn, strobe, pull station, etc.)` **$2.00** · `Plan Review (required for over 100 devices)` **65%** · `Minimum State surcharge` **$1.00** |
| Solar PV | `0-20 kW (kilowatt) System` **$138.00** · `21-40 kW System` **$332.00** · `Above 40 kW` **$315, plus $3.00 for every kW above 40 kW** · `State Surcharge (minimum)` **$1.00** |

Two readings the model takes from this table:

- **The appliance table's `$0` row is why the tables are scoped.** `Per Unit Installed, With
  Other Electrical Work, No New Circuit — $0` says an appliance covered by another electrical
  permit is not charged again. The model therefore prices each sub-permit under a
  `custom.electrical_scope` value, so an appliance count and a service/circuit count are never
  charged against each other.
- **`Minimum State Surcharge` is a minimum on a surcharge**, which is § 326B.148's own shape:
  one-half mill of the fee **or $1, whichever is greater**. Charged as 0.0005 × the permit fee
  with a $1.00 floor, rather than as a flat dollar.

Also on the trade hub, and not modelled: the 2026 NEC note ("The 2026 National Electrical Code
will be enforced on all permits obtained on or after August 17th, 2026"), the dwelling-unit
checklists (rough-in, final, service, garage, AC/furnace/boiler), the bulletins (2023-01,
2020-01, 2018-01, 2017-01), the inspector area maps, and the homeowner affidavit requirement.

## The plumbing schedule, as read (S3, complete)

The whole table, six rows:

```
Description                                                                    Fees
Initial permit fee                                                             $92
Per unit - Plumbing                                                            $36
Per unit - Water                                                               $6
Per unit - Gas                                                                 $34
If unit BTU's greater than 100,000, additional fee for each 100,000 BTU's
  or fraction thereof                                                          $15
State Surcharge                                                                $1
```

No minimum row, no valuation row, no brackets. The `$92` initial fee is the base every permit
starts from. The three per-unit rows are the schedule's own division of a plumbing job —
plumbing, water, gas — and the model counts them three ways for that reason. The BTU row charges
on a **unit's rated capacity**, above an allowance of the first 100,000 BTU, so it is a block
count with a one-block threshold.

Beside it, on the same trade pages and not modelled: the plan review *requirement* (S5 — Section
A, owner/occupant and "minor remodel" work of five or fewer fixture-types in non-licensed
facilities, no review; Section B, commercial and everything else, review required; no fee row
anywhere), the permit categories (Plumbing, Sewer — storm or sanitary —, Gas Fitting, Radon
Mitigation Systems), the Homeowner Affidavit, the inspectors' area map, and the SPRWS boundary
for water service, meter and distribution on new buildings.

## The state surcharge, as read (S4, the schedule's own deferral)

The schedule names § 326B.148 and prints the first rows; **above $1,000,000 it prints "see
statute"**. The statute, subdivision 1:

- fee fixed in amount → **one-half mill (.0005) of the fee or $1, whichever greater**;
- otherwise, valuation ≤ $1,000,000 → **one-half mill (.0005) of the valuation**;
- > $1,000,000 → **$500 plus two-fifths mill (.0004) of the value between $1,000,000 and
  $2,000,000**;
- > $2,000,000 → **$900 plus three-tenths mill (.0003)** between $2,000,000 and $3,000,000;
- > $3,000,000 → **$1,200 plus one-fifth mill (.0002)** between $3,000,000 and $4,000,000;
- > $4,000,000 → **$1,400 plus one-tenth mill (.0001)** between $4,000,000 and $5,000,000;
- > $5,000,000 → **$1,500 plus one-twentieth mill (.00005)** of the value above $5,000,000.

The bands are **marginal and cumulative**, so their rates alone reproduce every seam with no
compensating base: 0.5 mill to $1,000,000 gives $500 at the seam, then 0.4 mill to $2,000,000
adds $400 for the $900 the statute prints at $2,000,000, and so on. Modelled as five marginal
bands (5, 4, 3, 2, 1 basis points) plus one per-$1,000 rule for the last band, whose 0.5 basis
points cannot be stated as a whole number — $0.05 per $1,000 is exact. The $1,500 the statute
prints at the $5,000,000 seam is charged once, by the banded rule; the excess rule carries no
base of its own.

The schedule's own first row — `$1.00 - $1,000 = $0.50` — is the floor: one-half mill of a $1
valuation is a fraction of a cent, and the sheet rounds it up to fifty cents. Modelled as
`minimumCents: 50` on the surcharge rule.

## Readings this dataset depends on

1. **The closed table is one arithmetic in four segments.** `$36.00 + $5.00 per $100` to $2,000;
   `$106.00 + $21.00 per $1,000` to $25,000; `$591.00 + $15.00 per $1,000` to $50,000;
   `$972.00 + $11.00 per $1,000` to $100,000. Each segment's base is the value the table's own
   rows reach at that segment's floor. Verified against the document: **111 of 112 printed rows
   reproduce exactly**, and the one that does not is defect 3 above.
2. **Where the shipment's rows disagree with its arithmetic, the printed *base* wins and the
   printed *row* loses.** The open bands print bases ($1,499, $4,899, $8,463) and those are
   charged exactly as printed even though $1,499 sits $23 below the closed table's $1,522 —
   Minneapolis's seam rule. The closed table's interior is a single rate with two dropped rows
   and one misprint, so the arithmetic is charged there. The distinction is stated on the page.
3. **Plan check: 65% of the permit fee, gated at $1,000 of valuation.** The sheet's own two rows.
4. **Electrical is the City's, and the sub-permits are selected by scope.** Six tables, two
   minimums ($85 for four of them, $78 for fire alarm), one device count shared between the low
   voltage and fire alarm tables and charged by only one of them.
5. **Plumbing has no minimum.** The table's $92 initial fee is a base, not a floor, and the page
   says so — a permit with only the base and the $1 surcharge is $93.
6. **The surcharges differ in wording on purpose, and each is charged as it prints.** Electrical:
   `$1.00 minimum` (0.0005 × permit fee, floored at $1). Plumbing: `$1` flat. Building: the
   statute's bands with the sheet's $0.50 floor.

## Effective dates on record

| Instrument | Date carried | Why |
| --- | --- | --- |
| Building permit fee schedule | **2023-02-25** | Printed on the PDF: "Effective: 2/25/2023". |
| Electrical fee pages | **2025-09-17** | No date printed; the PAULIE platform that the pages describe launched 2025-09-17, and no later fee-change notice appears on them. |
| Plumbing fee table | **2025-09-17** | Same pages, same absence of a date. |
| M.S. § 326B.148 | (none) | A statute; the citation is the date. |
| Verification | **2026-09-25** | Every source re-read this day. |

## Requirements read (for the requirement rows)

- **Section 33.04 of the Legislative Code** — the schedule's own authority line, and the chapter
  that fixes what a permit valuation must include.
- **The schedule's closing note** — the building permit fee only, "not ... SAC, Parkland
  Dedication, Zoning and other miscellaneous required fees".
- **Electrical applicants and codes** — contractor information for commercial work, homeowner
  affidavit for residential; NEC edition changes dated on the page.
- **Fire alarm needs two permits** — the electrical one and a Fire Engineering permit for 100 or
  fewer, or over 100, devices; "You may also apply for both permits in PAULIE."
- **Plumbing plan review** — S5's Section A / Section B split and the five-fixture-type boundary.

## Not modelled (named on the schedule, never papered over)

- **Demolition** — "Per one thousand (1,000) cubic feet or fraction thereof $5.00", "Minimum
  Permit Fee $85.00", "Zoning Review Fee $90.00".
- **Fences** — "$45 for the first 200 lineal feet or fraction thereof and $15 for each additional
  100 lineal feet or fraction thereof", with an $85 variance application fee.
- **Grading / fill** — cubic yards in five bands: `< 100 = $36.00`; 100–1,000 at "$36.00 for the
  first one hundred (100) cubic yards, plus $27.00 for each additional one hundred"; 1,001–10,000
  at "$263.00 ... plus $22.00 for each additional one thousand"; 10,001–100,000 at "$452.00 ...
  plus $96.00 for each additional ten thousand"; `> 100,000` at "$1,317.00 ... plus $53.00 for
  each additional ten thousand".
- **Stucco, plaster, veneer plaster, EIFS, re-dash, patching, spray-on fireproofing** — "1% of the
  estimated job cost, with a minimum fee of $85", with the surcharge stated beside it: "$.50" for
  an estimated cost of $1.00–$1,000, ".0005 multiplied times the estimated cost" above $1,001.
- **Warm air / ventilation** — commercial at "one percent (1%) of the total valuation ... The
  minimum fee is $85"; residential at "$85 for the first 100,000 input BTU per hour or fraction
  thereof, plus $15 for each additional 100,000 input BTU per hour", ventilation work at 1% of
  valuation per dwelling unit with an $85 minimum per unit.
- **The Fire Engineering fire alarm permit** — the second table on the fire alarm page ($78 flat,
  $22 a control panel, $2 a device, 65% plan review over 100 devices): a Fire Department permit
  filed beside the electrical one.
- **Elevator permits and annual inspection fees** — a separate trade page.
- **The § 326B.148 fixed-fee branch's $5 window (2010-2015)** — historical, not current.

## Open questions

1. **The real date of the electrical and plumbing tables.** They print none. The PAULIE launch
   (2025-09-17) is the earliest date they can have been rewritten, and it is what the seed
   carries; a Legislative Code § 33.04 amendment history would replace it with the fees' actual
   enactment date, as Minneapolis's § 91.220 would for its ladder.
2. **Whether the closed table's three defects are corrigenda or errors in the PDF only.** The
   printed document omits two rows and misprints one; the City's PAULIE fee calculator, which is
   not published as a table, would show whether the database behind the table agrees with the
   arithmetic. The calculator charges the arithmetic either way, and says so.
3. **Whether an appliance row and a circuit row may legitimately both charge.** The appliance
   table prices a unit installed on its own circuit; the service/circuit table prices circuits.
   The model separates them by scope, following the table's own `$0` row for appliances installed
   with other electrical work and no new circuit — but a permit that both runs a new circuit for
   an appliance and counts it as an appliance would be $30.00 under one reading and $15.00 under
   the other. The City's counter answer would settle it.
4. **Whether Saint Paul's electrical permits are ever issued by the State.** Minnesota's § 326B.37
   framework lets a municipality be its own AHJ, and Saint Paul plainly is; whether any Saint Paul
   address still routes to a DLI contract inspector (as Minneapolis's do) is a directory lookup at
   permit time rather than a fee question.
5. **The plumbing table's `$1` surcharge above $2,000 of fee.** The statute's fixed-fee branch
   would take one-half mill of the fee once that exceeds $1; the plumbing page prints a flat `$1`
   with no "minimum" wording, so the model charges the flat dollar. The electrical pages' own
   `"$1.00 minimum"` wording suggests the City knows the difference.
