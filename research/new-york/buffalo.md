# Buffalo, New York — research record

**Research pass:** 13 (New York)
**Read on:** 2026-09-25
**Jurisdiction:** City of Buffalo, Erie County
**Pages published:** building, electrical, plumbing

## Sources actually read

| # | Source | URL | Type | Effective / dated |
| --- | --- | --- | --- | --- |
| 1 | Building Permit Fee Schedule — **Residential, detached 1- & 2-family dwellings** (1 p.) | `https://www.buffalony.gov/DocumentCenter/View/15213/Residential_Permit_Fees` | fee_schedule_pdf | **EFFECTIVE 7/1/2025** (printed on the sheet) |
| 2 | Building Permit Fee Schedule — **Commercial Buildings** (4 pp., incl. the ICC Building Valuation Data Table) | `https://www.buffalony.gov/DocumentCenter/View/15216/Commercial_Permit_Fees` | fee_schedule_pdf | **EFFECTIVE 7/1/2025** (printed on the sheet) |
| 3 | City of Buffalo **Plumbing Permit Fee Schedule** (plain-text page) | `https://www.buffalony.gov/614/Plumbing-Permit-Fees` | municipal_website | Undated; read 2026-09-25 |
| 4 | **Electric Permit Types and Fees** (flat-fee and area-calculated schedules, Schedules A and B) | `https://www.buffalony.gov/DocumentCenter/View/3204/NEW-electrical-fee-schedule` (served as a Word file) | fee_schedule_pdf | Undated; file metadata 2017-05-31 |
| 5 | Fee Schedule hub page | `https://www.buffalony.gov/721/Fee-Schedule` | municipal_website | Read 2026-09-25; carries a stale "effective July 29, 2014" sentence (see access notes) |
| 6 | Department of Permit & Inspection Services — division pages | `https://www.buffalony.gov/435/Permit-Inspection-Services`, `https://www.buffalony.gov/719/Permits`, `https://www.buffalony.gov/499/Electrical` | municipal_website | Read 2026-09-25 |
| 7 | ICC Building Valuation Data (Feb 2023), the mean-cost table the commercial schedule points to | `https://www.buffalony.gov/DocumentCenter/View/11964/ICC_BuildingValuationFeb2023cleaned` | fee_schedule_pdf | Feb 2023 |

All seven returned HTTP 200 from this environment on 2026-09-25.

## Access notes

- `buffalony.gov` serves everything plainly — pages, PDFs, and (for the electrical
  schedule) a Word file that had to be unzipped rather than parsed as a PDF. The
  document's real type was checked with `file`, not assumed from the URL.
- The **Buffalo City Code is not readable here**: `ecode360.com` (which the City's own
  pages link for Chapters 103 and 175) answers with **HTTP 403**, as does the amlegal
  codifier. Every figure therefore comes from the Department's own fee sheets and pages
  on `buffalony.gov`, which are the operative documents an applicant actually pays
  against. The code's role is only what the sheets themselves cite: the commercial sheet
  opens with "Permits are required for all work that is not listed as exempted in Section
  103-2.3 of the Buffalo City Charter."
- The fee-schedule **hub page is stale**: it still says "The fee changes are effective
  from July 29, 2014" while both PDFs it links are printed **EFFECTIVE 7/1/2025**. The
  PDFs win — they are the dated instruments — and the disagreement is recorded here
  rather than resolved in favor of the newer-looking page copy.
- One extraction oddity: the residential sheet contains a stray "65" in a different font,
  mid-page, in no value column (all values sit at the same x-coordinate; the artifact
  sits elsewhere). Coordinates were checked against the PDF content stream; it is a
  layout artifact of the sheet's header block, not a fee. The application fee row reads
  $25.

## What prices a permit in Buffalo

The three schedules are **separate documents for separate trades** — the commercial
sheet says so in its own header: *"Heating, Electrical, and Plumbing (M/E/P) permits and
fees are separate."* The fee-schedule hub page says the same from the other direction:
"Building Permit fees … does not include plumbing, electrical, or heating work."

1. **Building (residential sheet)** — detached 1- and 2-family dwellings: a $25
   application fee; plan review at 20% of the permit fee ($25 minimum) when plans are
   required (it includes M/E/P plan review); permit fees for new dwellings **by area
   created** (flat bands: $500 / $600 / $750 / $900 for a one-family by floor-area band;
   $1,000 for a two-family; $500 per unit for townhouses); additions, alterations and
   repairs **by cost of work** ($5 per $1,000, $50 minimum); a list of flat fees by job
   type (chimney, pools, fence, driveway, alternative energy, sheds/garages, interior
   tear-out); demolitions by unit ($300 dwelling, $75 accessory structure); and use
   permits ($25 each). The sheet states the addition rule itself: *total = application +
   plan review (as necessary) + use permit (as necessary) + flat fees (as necessary) +
   permit fee.*
2. **Building (commercial sheet)** — $50 application; plan review at **$0.75 per $1,000
   of mean construction cost, $75 minimum** (mean cost taken from the ICC Building
   Valuation Data Table on page 2 of the same PDF); permit fee **$8 per $1,000 of cost,
   $100 minimum** for new construction, additions, change of use and alterations (repairs
   and work on elements not part of the building use the contract amount instead); flat
   fees (awnings, signs by kind, tanks, antennas, fence, trailer, storage pod, sheds);
   demolitions ($0.12 per sq ft, $500 minimum; accessory $75; interior tear-out $200;
   $1,500 penalty when demolition happens without a permit); certificates (conditional
   $200; residential $50; commercial $300 / $600 / $900 by floor-area band); use permit
   $50. The sheet states its own total: *application + plan review + flat fees + use
   permit + certificate fee + permit fee.*
3. **Electrical** — two regimes. **Flat** (only when no drawings/plans are required by
   the NYS Building Code): a $50 application fee **plus one** flat amount — $50 new work
   at a one-family dwelling or one apartment of a two-family; $75 when both apartments of
   a two-family are done; $50 meter release (first meter); $75 low-voltage per system
   plus $5 per termination; $75 electrical site work not tied to a building project.
   **Area-calculated** (when plans are required): Schedule A gives three charges —
   application $50; plan review **greater of $50 or $0.0025 × SF × multiplier**; permit
   and inspection **greater of $50 or $0.0275 × SF × multiplier**; plus $25 per electric
   meter ($3.00 per panel for commercial solar). Schedule B supplies the multiplier by
   occupancy: A/E = 1.5, B/F/M = 1, H = 2.25, I-1 = 1.75, R-1/R-2 = 1.28, R-3 = 0.5,
   R-4 = 1.34, S = 0.7, U = 0.85 — and **leaves I-2, I-3 and I-4 blank**.
4. **Plumbing** — $50 application (flat, all applications); $100 plan review when plans
   are required; $75 per reinspection; fixtures **$12 each** for 1-/2-family residential
   (the sheet's own list: toilet, urinal, basin, bathtub, shower, sink, water heater, sump
   pump, floor drain, backflow device, drinking fountain, laundry connection, catch
   basin, manhole, other) or **first fixture $50 + $20 each additional** for commercial /
   other; underground piping **$60 for the first 100 linear feet** (any size), then $20
   per additional 100 feet for pipe ≤6" and $55 per additional 100 feet for pipe >6". The
   declared job valuation "is used for record-keeping purposes and does not replace the
   required permit fees". Total = application + plan review + fixture + underground +
   reinspection fees.

## Readings this dataset depends on

**(a) The two building sheets are different schedules, not one schedule with a column
split.** The residential sheet covers *detached 1- and 2-family dwellings* only, prices
new dwellings by flat area bands, and has no valuation table. The commercial sheet covers
everything else, prices off mean construction cost, and prints the ICC table itself. The
content models them as separate rule sets gated on the construction class
(`custom.one_two_family`), asserted so both cannot answer the same input.

**(b) The residential $5 row prorates; the commercial rows round up — each reading in the
sheet's own words.** The residential cost row prints "$5 per $1,000; $50 minimum" and
never prints the round-up phrase, so a fraction of a $1,000 is charged as the fraction it
is (Las Cruces established the contrast: the schedules that round up say so). The
commercial sheet does say so, twice: its plan review line reads "$0.75 per $1,000 of mean
construction cost **or portion thereof**", and both worked examples compute the $8 permit
row as "$8.00 per $1,000. of mean construction cost or portion thereof" — rounding the
cost itself to the next whole $1,000 ($3,741,600 is charged as $3,742,000). Both
commercial rows therefore carry an increment of $1,000 and the residential row carries
none, and a test pins a mid-band figure for each reading so a later reader sees the choice.

**(c) The commercial "mean construction cost" is a *cost* input, not a fee lookup.** The
sheet says to determine mean cost from the ICC table (area × $/sf by group and
construction type) and then apply $0.75/$1,000 (plan review) and $8/$1,000 (permit). The
engine takes the resulting cost in cents; **the ICC area × rate derivation itself is not
modelled** (it would need a 300-cell lookup the engine's tables do not express as one
rule), and the page says so: enter the mean cost the table produces.

**(d) Plan review is a separate line with its own floor.** Residential: 20% of the
permit fee with a $25 floor — a percent-of-another-component rule, gated on plans being
required (`custom.plan_review`), componentType `plan_review`. Commercial: $0.75/$1,000
with a $75 floor on the same gate. Both are *in addition to* the permit fee per the
sheets' own totals.

**(e) The area-calculated electrical charges are "whichever is greater" rows.** "greater
of $50 or rate × SF × multiplier" is one rule with `minimumCents: 5000`, a
`currency_per_unit` rate on square footage, the sheet's own constant ($0.0025 plan review,
$0.0275 permit and inspection per square foot) as the rule's `rateMultiplier`, and
Schedule B itself as a `rateTables` lookup keyed on the occupancy fact — which is the
shape the engine documents for a product of a published table and a fixed factor. Each
occupancy's exact product is asserted in the tests (0.0025 × 1.5 = 0.00375,
0.0275 × 1.28 = 0.0352, …), so the table's rows and the constant are checked against the
schedule's own arithmetic rather than against each other.

**(f) Schedule B's blank cells are a real gap.** I-2, I-3 and I-4 have **no multiplier
printed** (the I-2 row of the City's document even stops mid-sentence). Those
occupancies are priced by nothing: the lookup has no row for them, the calculation
reports that no rate is published rather than a figure, the page says the schedule does
not print a multiplier for them, and no figure is invented.

**(g) The electrical flat rows are "plus one of", not "plus all of".** "APPLICATION FEE
of $50 PLUS one of the following" — the schedule's own words. The model gates each flat
row on a fact describing the job (one-family work, both apartments, meter release,
low-voltage system, site work) so exactly one answers, asserted like Albuquerque's
disjoint columns.

**(h) The $5,000 cap and unit rules of NYC do not apply here** — this schedule has no
unit-count cap; its area rows have floors only.

**(i) Underground piping is priced in 100-foot segments of *linear feet*, a quantity no
engine basis reads.** The generic additive move — the same one the engine documents for
`meters`, `low_voltage_points` and friends — is a per-unit kind whose fact key is a
custom fact: `linear_feet` reading `custom.linear_feet`, with `incrementUnits: 100`
for the sheet's "per additional 100 linear feet" and `thresholdUnits: 100` for the first
100 feet the $60 line already covers; the per-foot rate is the segment price divided out
($20 per 100 feet is $0.20 a foot, 20 cents, so the integer cents the schema wants). Two
rules then split on the size flag (`custom.ug_over_6in`): the 20-cent rate at 6 inches and
under, 55 cents above. The first-100-feet line itself is a flat rule gated on the run
being answered above zero, so a job with no underground piping charges neither line.

**(j) Reinspection and demolition-without-permit are gated facts.**
`custom.reinspection` ($75 plumbing) and `custom.unpermitted_work` ($1,500 commercial
demolition penalty) follow the Albuquerque/Las Cruces pattern: charged only when the
input says the event happened.

## Requirements read

From the Department's own pages: plumbing applications must be signed by a City of
Buffalo Licensed Master Plumber (a plumbing permit issues only to a licensed master
plumber); mechanical, plumbing and electrical work go through their own divisions with
named contacts; the commercial sheet requires permits for all non-exempt work per
Charter §103-2.3; the hub page links ePermits for online filing (with a $2 convenience
fee noted on the ePermits page); plan review is required whenever the sheets print a plan
review line.

## Not modelled (named on the page, never papered over)

- **The ICC area × rate mean-cost derivation** (commercial) — the per-thousand charges
  compute from the cost you supply; producing that cost from area and occupancy is the
  applicant's lookup (reading c).
- **Certificate of Compliance / Certificate of Occupancy fees** (commercial sheet:
  $200 / $50 / $300 / $600 / $900) — adjacent to the permit decision, quoted on the page.
- **The $1,500 no-permit demolition penalty** is modelled as a gated rule because the
  sheet prints it as a fee line; **license fees, rental registration, and returned-check
  charges** are not permitting and are not charged.
- **Heating/mechanical (fuel device) permits** — a third sheet this pass did not find on
  the Department's pages; building, electrical and plumbing are the three pages.

## Effective dates on record

| Instrument | Effective |
| --- | --- |
| Residential building fee sheet | 2025-07-01 (printed) |
| Commercial building fee sheet | 2025-07-01 (printed) |
| Plumbing permit fee page | undated; read 2026-09-25 |
| Electric permit types and fees | undated; document metadata 2017-05-31; read 2026-09-25 |
| Fee-schedule hub page copy | stale "July 29, 2014" sentence, contradicted by its own linked PDFs |

## Open questions

1. The plumbing page and electrical schedule carry no effective dates of their own. Both
   are read as current because the Department publishes them as its live fee pages
   today; if the Department dates them later, the figures move.
2. Whether the City has since added a mechanical/heating fee sheet in the same format —
   not found on the pages read.
3. Chapter 175 of the City Code (which the code sections cross-reference for fees) could
   not be read (ecode360 403); if a reachable codifier appears, the sheets should be
   checked against it.
