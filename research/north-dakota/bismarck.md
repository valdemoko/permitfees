# Bismarck, North Dakota — research record

**Research pass:** 14 (North Dakota)
**Read on:** 2026-09-25
**Jurisdiction:** City of Bismarck, Burleigh County
**Pages published:** building, electrical, plumbing

## Sources actually read

| # | Source | URL | Type | Effective / dated |
| --- | --- | --- | --- | --- |
| 1 | **Residential Permit Fees** (Community Development Dept., Building Inspections Division), 1 p. | `https://www.bismarcknd.gov/DocumentCenter/View/49820/2025_RESIDENTIAL-PERMIT-FEES-` | fee_schedule_pdf | **Last Revised 1/01/25** (printed) |
| 2 | **Commercial Permit Fees**, 1 p. | `https://bismarcknd.gov/DocumentCenter/View/30726` | fee_schedule_pdf | **Last Revised 1/10/2018** (printed) |
| 3 | **Additional Permit Fees** (trade permits: plumbing, mechanical, electrical, septic, demolition, moving…), 1 p. | `https://bismarcknd.gov/DocumentCenter/View/30724` | fee_schedule_pdf | **Last Revised 1/10/2018** (printed) |
| 4 | Permit Fees hub page | `https://www.bismarcknd.gov/123/Permit-Fees` | municipal_website | Says **"Permit Fees Effective January 1, 2020"**; read 2026-09-25 |
| 5 | Title 4 — Building Ordinance (the City's building code) | `https://www.bismarcknd.gov/DocumentCenter/View/151/Title-04---Building-Regulations` | municipal_code | Reachable (HTTP 200); read for jurisdiction context, not for amounts |
| 6 | North Dakota State Electrical Board — Inspection Fees | `https://www.ndseb.com/inspections/inspection-fees/` | state_agency | **Effective July 1, 2024** (with the superseded table printed beneath it) |

All six returned HTTP 200 from this environment on 2026-09-25.

## Access notes

- `bismarcknd.gov` serves its DocumentCenter PDFs plainly. The fee hub's links are the
  live ones: its "Residential Permit Fees (PDF)" anchor points at the **2025** revision
  (`/49820`) even though an older `/32654` (2019) copy also exists in the document
  centre; the anchor was followed, not the search result.
- The two older sheets (`/30726` commercial, `/30724` additional) carry no year in
  their URLs — their dates come from the "Last Revised" line printed on each sheet.
- `pdftotext -layout` mispairs the commercial and trade tables (their fee column wraps);
  `-table` mode pairs every band cleanly, and both modes were run — the transcription
  below is from `-table`, with `-layout` as the cross-check.
- Title 4 (the building ordinance) is readable here — unlike the codifiers that answered
  403 in New Jersey, New York and Buffalo — but the fee sheets, not the ordinance, are
  the operative price list, so the ordinance is cited only for context.

## What prices a permit in Bismarck

**One ladder, printed on both building sheets.** The residential sheet prices a project
valuation (new construction: the area table below; alterations: "the construction value
based on the total bid amount of the project") and then applies the **permit fee
multiplier** table; the commercial sheet prices "TOTAL COST OF JOB" and applies a table
whose eight bands are *numerically identical* to the residential one:

| Total cost of job | Permit cost |
| --- | --- |
| $0.00 to $500.00 | $40.00 |
| $501.00 to $2,000.00 | $40.00 for first $500.00 PLUS $1.85 for each additional $100.00 |
| $2,001 to $25,000.00 | $67.75 for first $2,000.00 PLUS $8.40 for each additional $1000.00 |
| $25,001.00 to $50,000.00 | $260.95 for first $25,000.00 PLUS $6.10 for each additional $1000.00 |
| $50,001.00 to $100,000.00 | $413.45 for first $50,000.00 PLUS $4.20 for each additional $1000.00 |
| $100,001.00 to $500,000.00 | $623.45 for first $100,000 PLUS $3.40 for each additional $1,000.00 |
| $500,001.00 to $1,000,000.00 | $1,983.45 for first $500,000.00 PLUS $2.85 for each additional $1,000.00 |
| $1,000,001.00 and Higher | $3,408.45 for first $1,000,000.00 PLUS $2.20 for each additional $1,000.00 |

(The residential copy prints its fifth range as "$50,0001.00" — a typo for $50,001.00;
the commercial copy prints that band's rate as "$$4.20" — a doubled dollar sign. Both
are read as the obvious figure and recorded here.) The commercial sheet adds one line
the residential sheet does not print: **"A Review Fee of 20% of the permit fee will be
added to all Commercial Building Permits."**

**Residential valuation by area** (the sheet's own table, "Price per square foot"):
Garage $25.00; 1st Floor $165.67; 2nd Floor $79.50; Unfinished Basement $15.25; Finished
Basement $36.75; Deck $15.75; Covered Deck $22.50; Covered Patio/Entry $15.00;
Alterations = Bid Amount; Basement Finish $21.50; Detached Shed $15.00; Detached Shop or
Garage $25.00.

**Trade permits (the Additional sheet)** — plumbing on its own four-band valuation
ladder ($40.00 flat to $2,000; then $1.65, $1.10 and $0.60 per additional $1,000 with
printed bases $40.00, $69.70 and $157.70 — the same shape as the building ladder,
seamed at $20,000 and $100,000); Mechanical/HVAC on a ladder numerically identical to
the plumbing one; **Electrical permits $25.00 flat**; Septic/Drainfield $75.00; Home
Occupation $25.00; Temporary Use $50.00; Demolition $75.00; Moving $25.00; Manufactured
Homes $150.00.

**Electrical, second source: NDSEB.** The state board's inspection fee (effective July 1,
2024) rides every electrical installation on the total contract or total cost to the
owner including extras: up to $500.00 → $50.00 (minimum); $500 to $20,000 → $50.00 for
the first $500.00 plus 2% of the balance; over $20,000 → $440.00 for the first $20,000.00
plus 1/10 of 1% of the balance. Appliances, HVAC units, electric motors/PLC/generators
and industrial machines are excluded from the cost; a late wiring certificate adds
$50.00 to the normal fee.

## Readings this dataset depends on

**(a) The two building sheets print the same ladder, so the ladder is modelled once.**
All eight bands are numerically identical across the residential and commercial sheets —
same bases, same rates — so duplicating them by construction class would create sixteen
rules that must agree to stay honest. One eight-band ladder (source: the residential
sheet, the later revision) carries both sheets' arithmetic, the descriptions say so, and
the class switch does the one job the sheets actually differ on: the 20% review fee,
which the commercial sheet prints and the residential sheet does not. A test asserts the
sheets' printed ladders are the same ladder by charging both classes at several
valuations.

**(b) Neither sheet prints the round-up phrase, so the ladder prorates.** No band says
"or fraction thereof" — the phrase Fargo prints in every band and Bismarck never prints
— so a fraction of a $1,000 (or of a $100 step in band 2) is charged as the fraction it
is: $2,500 of job cost is $67.75 + $500 × $8.40/$1,000 = $71.95, where a whole-thousand
reading would be $76.15. The mid-band figure is asserted in the tests, beside Fargo's
round-up, as the pair of readings the phrase decides.

**(c) The ladder is continuous at all seven seams, and every seam is asserted.**
$40.00 + 15 × $1.85 = $67.75 at $2,000; $67.75 + 23 × $8.40 = $260.95 at $25,000;
$260.95 + 25 × $6.10 = $413.45 at $50,000; $413.45 + 50 × $4.20 = $623.45 at $100,000;
$623.45 + 400 × $3.40 = $1,983.45 at $500,000; $1,983.45 + 500 × $2.85 = $3,408.45 at
$1,000,000. Each closing figure is the next band's printed base — the ladder was built
to close, and the tests walk it in both directions. The plumbing ladder closes the same
way ($40.00 + 18 × $1.65 = $69.70 at $20,000; $69.70 + 80 × $1.10 = $157.70 at
$100,000).

**(d) The 20% review fee is unconditional on the commercial sheet and belongs to no
residential rule.** "A Review Fee of 20% of the permit fee will be added to **all**
Commercial Building Permits" — no plan-review fact gates it, because the sheet does not
condition it; it is a `plan_review` component reading `permit_fee`, gated only by the
class (not a one- or two-family dwelling), and the application fee the percentage might
have swallowed does not exist here: Bismarck prints no application fee at all.

**(e) The residential area table is a valuation derivation, not a fee.** The sheet says
how the valuation is *determined* (area × $/sf; alterations by total bid amount) and
then charges the ladder on it. The engine takes the valuation as an input — the same
stance as Buffalo's ICC table and Fargo's ICC-minus-15% — and the pages print the
per-square-foot table as the method, quoted rather than re-run.

**(f) The trade sheet's rows are split across the three pages by what they permit.**
Plumbing's ladder and Septic/Drainfield ($75) go to the plumbing page; Electrical
($25.00) to the electrical page; Demolition ($75), Moving ($25), Manufactured Homes
($150), Home Occupation ($25) and Temporary Use ($50) are building-shaped permits and go
to the building page; Mechanical/HVAC's ladder — numerically identical to plumbing's —
is quoted on both pages as a separate permit rather than attached to a fourth page this
site does not publish.

**(g) NDSEB's bands are two percent rules with thresholds, prorated.** No round-up
phrase appears in the state table, so 2% and 1/10 of 1% charge the balance as the
fraction it is: the first band is a threshold at $500 with a $50 base (which also covers
jobs under $500 — the minimum fee *is* the whole fee there), the second a threshold at
$20,000 with a $440 base; the $50 late-certificate increase is its own gated rule. Both
cities carry the same three rules with their own source rows, because NDSEB bills the
installer directly in both — a state fee, not a city one, and `state_surcharge` says so
in the breakdown.

**(h) The hub's date disagrees with its own residential link, and the disagreement is
kept.** The Permit Fees page still says "Permit Fees Effective January 1, 2020" while
its residential anchor is a sheet printed "Last Revised 1/01/25". The dated documents
win for their own figures (the residential ladder is effective 2025-01-01); the hub's
2020 sentence is recorded rather than deleted, exactly as Buffalo's stale hub date is.

**(i) Typos are read as the figure the arithmetic confirms.** "$50,0001.00" is $50,001
because the band's printed base $413.45 is what the ladder computes at $50,000, and
"$$4.20" is $4.20 because $413.45 + 50 × $4.20 = $623.45 closes the next seam. Both
readings are recorded in the research and in the rules' descriptions.

## Requirements read

From the Department's own documents: the fee sheets' letterhead contact (Building
Inspections Division, 701-355-1465, buildinginspections@bismarcknd.gov, PO Box 5503);
the valuation instructions on the residential sheet (how a new-construction valuation is
built from the area table, how an alteration's is the total bid); the commercial
sheet's review-fee sentence as the plan-review requirement; Title 4 as the ordinance the
division enforces (reachable and read for jurisdiction context); and the state's
electrical regime through NDSEB — the board sets the inspection fee, the exclusions and
the late-certificate increase, while the City issues the $25 permit.

## Not modelled (named on the page, never papered over)

- **Mechanical/HVAC permits** — priced on the trade sheet by a ladder identical to
  plumbing's; quoted as a separate permit on both trade pages (no mechanical page is
  published).
- **The residential area table's derivation** (reading e) — the valuation method, taken
  as an input.
- **The hub's "Effective January 1, 2020" sentence** (reading h) — recorded, not
  followed where the sheets' own revision dates disagree.
- **NDSEB's exclusions, hourly special services and correction-order charge** — quoted
  beside the modeled bands.
- **License, rental and administrative charges** outside the permit sheets — not
  permitting.

## Effective dates on record

| Instrument | Effective |
| --- | --- |
| Residential permit fees | 2025-01-01 ("Last Revised 1/01/25") |
| Commercial permit fees | 2018-01-10 ("Last Revised 1/10/2018") |
| Additional (trade) permit fees | 2018-01-10 ("Last Revised 1/10/2018") |
| Permit Fees hub page copy | "Effective January 1, 2020" — contradicted by its own 2025 residential link |
| NDSEB inspection fees | 2024-07-01 (printed, with the superseded table beneath) |

## Open questions

1. Whether the 2018 commercial and trade sheets have later revisions that the hub does
   not link — the document centre holds older copies of other sheets, and no later
   commercial sheet was found; the 2018 dates are the sheets' own.
2. Whether Bismarck charges a residential plan review despite the residential sheet's
   silence (Fargo prints one, Bismarck does not).
3. The trade sheet's plumbing and mechanical ladders are identical in every figure —
   whether that is deliberate policy or a copy of one table into the other row is not
   stated anywhere on the sheet.
