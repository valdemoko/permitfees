# Orange County, Florida — research record

**Published on this site:** 2026-09-24 · **Jurisdiction key:** `orange-county` · **Fee schedule effective:** 2025-07-01
**Pages:** `/florida/orange-county/building-permit-cost/`, `/electrical-permit-cost/`, `/plumbing-permit-cost/`

Orange County is the Florida county whose fees are published inside a document about everything
else the county charges. The **Fee Directory** is one PDF per fiscal year, prepared by the Office of
Management and Budget, and its section 3 — "Planning, Environmental and Development" — carries the
Building Safety fee tables on pages 26 to 45, the Zoning Division's review rows on page 57, and
Planning, Environmental and Development Services' own schedules in between. A reader who knows only
that document exists can find a building permit fee; a reader who knows which section is which can
tell a permit fee from an impact fee.

Two things put this jurisdiction on the site. It is the fee authority that **publishes the valuation
inputs** its own fee is derived from — a table of average cost per square foot by occupancy and
construction type, with three notes that amend it — and its building permit is charged on
**valuation** in marginal bands that break at $2,000,000, which makes it the exact counterpart of
Miami-Dade's area-based schedule 200 miles north.

---

## 1. Sources read

| # | Document | URL | sha256 (first 16) | Read |
|---|---|---|---|---|
| S1 | Orange County Fee Directory, Fiscal Year 2025-2026 (Office of Management and Budget) | `https://www.orangecountyfl.net/Portals/0/resource%20library/Open%20Government/FeeDirectory.pdf` | `8eb4eaaec6770373` | 2026-09-24, three pdftotext modes |
| S2 | Division of Building Safety — permits, fees and frequently asked questions | `https://www.orangecountyfl.net/PermitsLicenses/DivisionOfBuildingSafety.aspx` | — | 2026-09-24 |

### The document's own dating is inconsistent, and that matters

* The first page reads: **"Fee Directory / Fiscal Year / 2025-2026 / Prepared by: Office of
  Management and Budget"**.
* Every **content** page in the Building Safety section is footed **"Effective July 2025"**.
* Every **table-of-contents** page is footed **"Effective 10/1/13"** — a footer that has not been
  updated in more than a decade.

The site takes the effective date from the content pages (**2025-07-01**) and records the stale
footer here rather than tidying it away, because a reader who opens the PDF at the contents page
will see `10/1/13` and needs to know which page to believe.

### Section map used to separate the fees

| Section | Pages | What is in it |
|---|---|---|
| 1 | 8-13 | Administrative fees for all departments |
| 2 | 14-21 | Parks and Recreation |
| 3 | 22-59 | Planning, Environmental and Development — **including Building Safety at 26-45** and **Zoning at 53-59** |
| 4 | 60 | Corrections |
| 5 | 61 | Family Services |
| 6 | 63-69 | Fire Rescue |
| 7 | 70- | Health Services |

The division's own FAQ (S2) says the same thing in one sentence: "Please see Orange County's Fee
Directory, **Building Safety fees are in Section 3**, Planning, Environmental and Development."

---

## 2. The building schedule — valuation bands that break at $2,000,000

From page 27 of the directory, verbatim (the amounts are on the right-hand column of the printed
table and are reassembled here from the raw text mode):

| Row | Up to and including $1,000 | Each additional $1,000 to $2,000,000 | Each additional $1,000 above $2,000,000 |
|---|---|---|---|
| One and two family dwelling — residential | $26.00 | $3.00 | $1.00 |
| Accessory structures and uses to a one and two family dwelling | $26.00 | $4.00 | — |
| Commercial/Multifamily — new construction | $26.00 | $4.00 | $1.00 |
| Commercial/Multifamily — other than new construction | $26.00 | $5.00 | — |
| Residential — re-roof | $26.00 | $5.00 | — |
| Commercial — re-roof | $26.00 | $5.00 | — |
| Commercial/Multifamily — roof permit | $54.00 | $5.00 | — |

Flat rows in the same block: "Roof permit on new dwelling only 38.00" and "Permits For Site Work
Only 27.00". The roof permit row carries the directory's own exception: "On new construction, where
a licensed general contractor has an active building permit, a separate, no fee roofing permit is
required. The name and license number of the roofing contractor shall be supplied on the permit
application."

**Seams.** Both valuation tiers close exactly, which was verified at the boundary rather than
assumed: a $1,999,999 residential valuation and a $2,000,000 one both produce $6,023.00 of permit
fee, and the next cent of valuation steps by $1.00. $26.00 + 1,999 x $3.00 = $6,023.00 is what the
tier above opens with. This is the opposite of the Portland Development Services Fee, where the
same document disagrees with itself by 90 cents at its first seam.

**The ceiling that is not in the permit table.** The commercial architectural review carries one:

| Row | Fee |
|---|---|
| Architectural Standards and Guidelines for Commercial Buildings and Projects — new and redevelopment of C-1, C-2, C-3 and PO buildings and commercial components of PDs, up to and including $1,000 of value | $27.00 |
| For each additional $1,000 or fraction thereof | $3.00 |
| **Note: Maximum fee of $10,000** | |

At $4,000,000 of valuation the rate would produce $11,997.00 and the rule charges $10,000.00. The
ceiling binds at about $3,325,666.67 of valuation. It is scoped **by zoning classification** rather
than by occupancy, so the site asks for `zoning_class` and leaves the row out of a commercial
project that has not named one — rather than assuming C-2 and overstating.

## 3. The valuation table the county publishes

Above the bands the directory prints, in its own words: "The following minimum schedule of
valuations shall be applied to the structure(s) for which a permit is filed. However, should the
contract valuation be greater it shall be used for determining the fee... The applicable
valuation(s) shall be multiplied by the square footage of the structure(s) for the purpose of
charging the inspection fee in accordance with the fee schedule."

Then a full ICC occupancy-by-construction-type table of average cost per square foot. Six of its
rows are transcribed into `OC_AVERAGE_COST_PER_SQ_FT` — the ones an ordinary job lands in — across
all nine construction types the document prints (IA, IB, IIA, IIB, IIIA, IIIB, IV, VA, VB):

| Occupancy | IA | IB | IIA | IIB | IIIA | IIIB | IV | VA | VB |
|---|---|---|---|---|---|---|---|---|---|
| R-3 Residential, one and two-family | 124 | 121 | 104 | 101 | 111 | 107 | 113 | 104 | **97** |
| B Business | 158 | 153 | 138 | 135 | 127 | 122 | 134 | 111 | **106** |
| M Mercantile | 109 | 107 | 83 | 100 | 92 | 84 | 92 | 80 | 77 |
| A-2 Assembly, restaurants, bars, banquet halls | 154 | 150 | 120 | 115 | 131 | 129 | 136 | 119 | 115 |
| S-1 Storage, moderate hazard | 71 | 67 | 46 | 42 | 56 | 47 | 58 | 49 | 43 |
| U Utility, miscellaneous | 59 | 58 | 58 | 54 | 51 | 47 | 54 | 39 | 37 |

Three notes amend the table: "Unfinished basements (all use groups) = $15.00 per sq.ft.", "For shell
only buildings deduct 20%", and "Private Detached Garages use 'Utility, miscellaneous'".

The worked example uses the county's own figure for the project it describes — a 2,500 square foot
R-3 dwelling of construction type VB at 97 a square foot is $242,500 — and the test suite reads that
97 out of the table rather than restating it, so the published figure and the calculated fee cannot
drift apart.

## 4. Where the review rows live, and why it matters

A house pays **two different divisions'** review rows, both printed in the same document:

* **Zoning Division (page 57):** "Residential Plans Review - One and Two Family Dwelling — New
  Construction **$34.00**; Other than new construction **$32.00**; Accessory Structures
  **$12.00**", the last with the note that accessory structures "include, but are not limited to:
  utility buildings, swimming pools, spas, pool decks and pool screen enclosures, boat
  docks/houses, concrete slabs installed after initial construction, air conditioners, and
  generators".
* **Building Safety (page 44):** the commercial architectural review above.

Note that the $12.00 accessory **review** and the Building Safety section's accessory **permit** row
($26.00 + $4.00 per $1,000) are two different charges on the same project — which is why the site
models them as separate components with separate descriptions.

The county's own FAQ (S2) explains why no total is published: "Permits for new construction can
involve review and/or inspection fees by 10 or more different divisions. These fees are not all set
amounts, but can be based on factors such as site perimeter, square footage, value of work,
use/number of units and type of construction which can only be determined during plan review. Many
of the fees are generated automatically by the computer system when the reviewer approves the
review. Consequently, it's not possible to provide the total cost of a permit before it's ready to
issue." That sentence is quoted on the pages and in the profile.

## 5. Electrical — priced by service size, not by cost

| Table | 0-150 A | 151-200 | 201-400 | 401-600 | 601-800 | 801-1,000 | Over 1,000, per ea. add'l 1,000 A or fraction |
|---|---|---|---|---|---|---|---|
| 1 phase 240 V | $75.00 | $91.00 | $117.00 | $170.00 | $255.00 | $308.00 | $170.00 |
| 3 phase 208 or 240 V | $117.00 | $144.00 | $181.00 | $271.00 | $372.00 | $468.00 | $281.00 |
| 3 phase 480 V | $250.00 | $313.00 | $399.00 | $606.00 | $796.00 | $982.00 | $584.00 |

The schedule says what it measures: "Electrical permit fees are based upon the total amperage of the
service required to meet the needs of all fixtures, etc., installed. Service is determined by the
KVA Load available to the premises."

Three structural facts:

* **The bands are alternatives, not a chain.** A 400-ampere service is $117.00 in the single-phase
  table, not $75.00 plus something. Every band boundary was checked at each edge (150, 151, 200,
  201, 400, 401, 600, 601, 800, 801, 1,000, 1,001) to confirm no amperage matches two rows.
* **The row above 1,000 amperes is a rate**, "or fraction thereof", so 1,001 A, 1,500 A and 2,000 A
  all pay one additional thousand and 2,001 A pays two. Whether the 801-1,000 band is charged *as
  well* is not stated; the page prices both readings.
* **Above 480 volts** the rule is "a proportional increase over the cost for 480V", illustrated with
  a 600-ampere 480-volt service at $606.00 becoming $60,600.00 where 48,000 volts are available. It
  needs a voltage, so it is named and not modelled.

Flat rows: a temporary construction service for a one or two family dwelling site at $27.00 (maximum
60 A / 240 V / single phase); `LOW VOLTAGE PERMIT` at $38.00 up to the first $1,000 of valuation
plus $5.00 per additional $1,000; "Simple Installation of one item of Equipment Regardless of
Amperage" $38.00; tent $59.00 plus $11.00 each additional; carnival safety inspection $101.00; pool
wiring $59.00; T.U.G. agreement $106.00; meter reset $38.00 (shared Inspection Fees section);
re-inspection $38.00 (same section, with the county's own "$11.00 collection fee per account" after
60 days). Two valuation rows exist for alterations: one that does **not** require a service change
($38.00 to the first $1,000, then $5.00), and one that **does** ("the fee shall be the applicable
permit fee for the difference between the new service amperage and the previous service amperage, if
positive") — the second needs two amperages and is not modelled.

## 6. Plumbing and gas — the simplest schedule on the site

| Row | Fee |
|---|---|
| Permit fee for new construction, addition or alteration (commercial or residential, **plus $6 per fixture charge**, unless specified otherwise) | $75.00 |
| Per plumbing fixture (added, plugged, moved or future opening) | $6.00 |
| Minimum permit fee, replacement if expired under 6 months | $38.00 |
| Mobile home plumbing · water heater (stand alone) · solar water heater (stand alone) · backflow preventer (stand alone) · water softener (stand alone) · spa with permanent connections · sewer replacement · re-pipe (residential) · re-pipe (commercial, per unit) · second meter for irrigation | $38.00 each |
| Swimming pool permit | $64.00 |
| Lawn irrigation system: 1-100 heads / 101-200 / 201 and up | $38.00 / $54.00 / $64.00 |

Gas is its own schedule in the same section — "Equipment, Ventilation, Combustion Air, Piping,
Boilers and any other installation(s) which requires(s) a Gas Permit: valuation based on cost of all
equipment supplied by owner or contractor, materials and labor — up to and including the first
$1,000 $64.00; for each additional $1,000 or fraction thereof 6.00" — and is priced on the plumbing
page because the same division issues it and because a gas permit with no plumbing permit beside it
is the ordinary case for a water heater replacement.

**Not modelled and named instead:** demolition (per 25,000 cubic feet, $25.00 minimum, $400.00
maximum — a volume the engine has no basis for), the sign schedule ($38.00 to 25 sq ft rising to
$69.00 to 300 sq ft, then $11.00 per additional 100 sq ft), the mechanical schedule (per ton, and
refrigeration on valuation across a $25,000 break), the Plan Submittal Fee and its re-submittal
table, the private provider reduction under F.S. 553.791 (55% or 10%, never below the minimum), the
work-without-a-permit penalty (double the fee or $103.00, whichever is greater), the special
after-hours inspection ($212.00 for four hours, then $51.00 an hour), and every hourly rate.

## 7. The state surcharge, as one row

"A surcharge will be assessed at the rate of **2.5%** of each permit (building, electrical,
mechanical, plumbing, roof, and gas) fee associated with the enforcement of the Florida Building
Code as per Florida Statutes section 468.631 and 553.721. The minimum amount collected in accordance
with the Florida Statutes mentioned above on any permit issued shall be **$4.00**."

**This is the one place the two Florida counties can be compared directly.** Miami-Dade states the
same two statutes as two rows, each with its own $2.00 minimum. The two are not equivalent: at the
$147.00 permit fee the two counties share, Orange County collects $4.00 and Miami-Dade collects
$2.00 + $2.21 = **$4.21**. The 21 cents is asserted in both jurisdictions' tests on this site, and it
is the smallest difference between two published schedules the dataset records.

## 8. Worked examples, computed with the engine

| Scenario | Components | Total |
|---|---|---|
| New house, 2,500 sq ft R-3 VB at the county's own $97/sq ft | $752.00 + $34.00 + $18.80 | **$804.80** |
| Commercial new construction, 12,000 sq ft B VB at $106/sq ft | $5,110.00 + $3,840.00 + $127.75 | **$9,077.75** |
| The same commercial project without a zoning classification | $5,110.00 + $127.75 | **$5,237.75** |
| Commercial alteration, $530,000 of valuation | $2,671.00 + $66.78 | **$2,737.78** |
| Accessory structure, $60,000 | $262.00 + $12.00 + $6.55 | **$280.55** |
| Residential re-roof, $45,000 | $246.00 + $32.00 + $6.15 | **$284.15** |
| Electrical, 3 phase 208/240 V, 400 A | $181.00 + $4.53 | **$185.53** |
| Electrical, 1 phase 240 V, 400 A | $117.00 + $4.00 | **$121.00** |
| Electrical, 3 phase 480 V, 400 A | $399.00 + $9.98 | **$408.98** |
| Plumbing, new construction with 6 fixtures | $75.00 + $36.00 + $4.00 | **$115.00** |
| Plumbing, stand-alone water heater | $38.00 + $4.00 | **$42.00** |
| Gas, $8,000 of valuation | $106.00 + $4.00 | **$110.00** |

The three electrical rows are the same 400 amperes priced at $121.00, $185.53 and $408.98 — a span
of $287.98 for one measurement, which is the clearest illustration in the dataset of a fee that
follows what was installed rather than what it cost.

## 9. What changed in the engine for this jurisdiction

Nothing was added to the engine for Orange County's own arithmetic — the bands, the $10,000 ceiling
and the two-tier valuation rows all used primitives that existed. One **defect** was found and fixed
while modelling it: the per-thousand rate divisor was assumed to be cents-to-thousands (100,000) for
every basis, so Orange County's "over 1,000 per ea. add'l. 1,000 amp or fraction: $281.00" computed
$2.81 for a 1,500-ampere service. The divisor is now basis-aware
(`PER_THOUSAND_COUNT_DENOMINATOR`), the rule is asserted at 1,001 / 1,500 / 2,000 / 2,001 amperes,
and the regression test is `tests/calc/per-thousand-count-basis.test.ts`. Miami-Dade's per-100-ampere
and per-100-square-foot rows were wrong by the same factor of 100 and are fixed by the same change.

## 10. Open questions

1. **Whether a re-roof's zoning review really applies.** The $32.00 "other than new construction"
   row is charged on the site's re-roof example because the row is the county's published residential
   plans review for anything that is not new construction. If the Zoning Division does not review a
   re-roof, that row should come out of the re-roof example and nothing else changes.
2. **The 90 cents that are not a seam** in this jurisdiction's counterpart — see the Portland record.
   Here every seam closes, and that was verified rather than assumed.
3. **Fee adjustments.** The directory states: "Fees will be adjusted for private providers according
   to Florida Statue 553.791. All fees may be adjusted annually for changes in the Consumer Price
   index or 3%, whichever is less." A figure read from this record can therefore be up to a year of
   CPI out of date even though the document has not changed.
4. **The mechanical and sign schedules** are transcribed nowhere on this site, and the plan submittal
   fee is named but not modelled because it is conditional on all permits being issued at once.
