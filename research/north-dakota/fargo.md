# Fargo, North Dakota — research record

**Research pass:** 14 (North Dakota)
**Read on:** 2026-09-25
**Jurisdiction:** City of Fargo, Cass County
**Pages published:** building, electrical, plumbing

## Sources actually read

| # | Source | URL | Type | Effective / dated |
| --- | --- | --- | --- | --- |
| 1 | **Fargo Residential Building Permit Fees** (one- and two-family dwellings), 1 p. | `https://download.fargond.gov/0/2026_residential_fees.pdf` | fee_schedule_pdf | **Effective January 1, 2026** (printed) |
| 2 | **Fargo Commercial Building Permit and Plan Review Fees**, 1 p. | `https://download.fargond.gov/0/2026_commercial_fees.pdf` | fee_schedule_pdf | **Effective January 1, 2026** (printed) |
| 3 | **Fargo Schedule for Plumbing & Sanitary or Storm Sewer Permits**, 2 pp. | `https://download.fargond.gov/0/plumbing_permit_fees_-_effective_january_1_2025.pdf` | fee_schedule_pdf | **Effective January 1, 2025** (printed) |
| 4 | Residential Permit & Fees page (links the fee PDFs, the fee calculator, and the trade subpages) | `https://fargond.gov/city-government/departments/inspections/residential-permits-fees` | municipal_website | "Effective January 1, 2026"; read 2026-09-25 |
| 5 | Commercial Building Permits & Fees page (the valuation rules) | `https://fargond.gov/city-government/departments/inspections/commercial-building-permits-fees` | municipal_website | "Effective January 1, 2026"; "Content Updated January 2026" |
| 6 | Plumbing page (process, ND State Plumbing Code, the separate-permits sentence) | `https://fargond.gov/city-government/departments/inspections/residential-permits-fees/plumbing` | municipal_website | Undated; read 2026-09-25 |
| 7 | Electrical Self-Wire page (no city fee; NDSEB bills the homeowner) | `https://fargond.gov/city-government/departments/inspections/residential-permits-fees/electrical-self-wire` | municipal_website | Undated; read 2026-09-25 |
| 8 | City Code page — the Department's own fee-schedule index | `https://fargond.gov/work/doing-business/city-code` | municipal_website | Read 2026-09-25 |
| 9 | North Dakota State Electrical Board — Inspection Fees | `https://www.ndseb.com/inspections/inspection-fees/` | state_agency | **Effective July 1, 2024** (with the superseded table printed beneath it) |

All nine returned HTTP 200 from this environment on 2026-09-25.

## Access notes

- `fargond.gov` and `download.fargond.gov` serve everything plainly — pages and PDFs. The
  three fee PDFs were extracted with `pdftotext -table`, which pairs the valuation column
  with its fee cleanly on both building schedules.
- The Department publishes a **Building Permit Fee Calculator** (JavaScript) beside both
  fee pages — an official calculator, but its inputs are project type and estimated value
  only; the fee tables above are what it computes from.
- The **fee-schedule index on the City Code page is the honest answer to "what does Fargo
  charge for electrical permits?"** — it links Residential Building Fees, the Heating
  Permit Fee Schedule, the Plumbing Permit Fee Schedule, the Sign Permit Fee Schedule and
  the Code Enforcement Fee Schedule. **There is no electrical entry.** The self-wire page
  completes the picture: the City takes the application, the inspector determines "the
  value of the work done" at rough-in, and "the North Dakota State Electrical Board
  (NDSEB) will be notified of the value of work done and NDSEB will bill applicable fees
  to the homeowner." The dollars for electrical work are the state board's, not the
  City's, and the electrical page is built on that fact rather than on an invented city
  fee.
- NDSEB is `ndseb.com` (not a `.nd.gov` domain); its Inspection Fees page prints the
  current table, its effective date, **and** the superseded table beneath it — the rare
  source that dates its own change.

## What prices a permit in Fargo

**Building (residential sheet, one- and two-family dwellings)** — a three-band ladder on
total valuation: up to and including $1,000 is $50.00; $1,001 to $100,000 is $50.00 for
the first $1,000 plus **$5.56 for each additional $1,000, or fraction thereof**, to and
including $100,000; $100,001 and up is $600.44 for the first $100,000 plus **$3.06 for
each additional $1,000 or fraction thereof**. The sheet then lists flat rows — Demolition
$100.00 / $50.00 for buildings under 400 SF and buildings without utility services; House
Moving $300.00 / $50.00 on the same two conditions, and $150.00 / $50.00 for moves within
the extraterritorial area; Board of Appeals $150.00 — plus the hourly items ($75.00 per
hour for after-hours inspections with a two-hour minimum, reinspection under IBC §§108–109,
unspecified inspections and additional plan review at a half-hour minimum; outside
consultants at actual cost) and the **work begun without a permit** table: permit fee
doubled for $0–$50,000 (second offence within 180 days $200 minimum, $100 for each
additional violation subsequent), 50% of permit fee for $50,001–$500,000 (minimum $550),
25% for over $500,000 (minimum $2,000).

**Building (commercial sheet)** — a seven-band ladder with its own numbers, every band
printed **"or fraction thereof"**: $55.00 up to $1,000; then $12.75, $8.70, $6.14, $4.99,
$4.87 and $4.64 per additional $1,000 with printed bases $55.00, $361.00, $578.75,
$885.75, $2,881.75 and $5,316.75. Plan Review: "All projects when a plan review is
required. Twenty (20) percent of the attributable building permit fee. Minimum fee $50."
Same demolition/moving/appeals rows, same hourly items, same unpermitted-work table with
**commercial minimums** ($980 and $2,500 where the residential sheet prints $550 and
$2,000).

**Plumbing** — an itemized schedule, not a valuation ladder: Water Heating Permits $35.00;
Inside Plumbing Permits minimum $50.00 including up to 5 fixtures or traps, each fixture
or trap over 5 is $10.00 each; Original Sanitary or Storm Sewer Line into each building
$125.00; Disconnect $70.00; Additional line into each building or to a manhole or catch
basin $30.00; Repair or Replacement of Sanitary or Storm Sewer $75.00; Lawn Sprinkler
System $40.00; the same $75.00-per-hour other-inspection list; "Permit fees will be
charged for all government projects"; and "Double fees for all work commenced without a
permit. In case of an emergency, a permit must be taken out within 48 hours after
commencement of work."

**Electrical** — no city schedule exists (see access notes). The published dollars are
NDSEB's, effective July 1, 2024, on the total contract or total cost to the owner
including extras: up to $500.00 → $50.00 (minimum fee); $500.00 to $20,000.00 → $50.00
for the first $500.00 plus **2%** on the balance; over $20,000.00 → $440.00 for the first
$20,000.00 plus **1/10 of 1%** on the balance. Appliances, HVAC units, electric
motors/PLC/generators and industrial machines "need not be included in the cost". A late
wiring certificate increases the normal inspection fee by $50.00; a correction order not
completed in time is a $50.00 administration charge; special services are $50.00 per hour
plus mileage.

## Readings this dataset depends on

**(a) Two building sheets, one switch.** The residential sheet says on its face what it
covers — "(one- and two-family dwellings)" — and the commercial sheet covers everything
else. The content gates both ladders on `custom.one_two_family` (Las Cruces and Buffalo
precedent), asserted so both cannot answer the same input.

**(b) Every Fargo ladder rounds up — the sheets print the phrase.** Both building sheets
say "or fraction thereof" in every band after the first, so each rule carries an
increment of $1,000 and rounds the chargeable cost up: $1,001 of residential cost is
$50.00 + $5.56, and $1,500 of commercial cost is $55.00 + 2 × $12.75 (two whole steps),
not $55.00 + $16.94 of prorated steps. This is the phrase-driven reading the dataset has
used since Las Cruces, and Fargo's sheets supply it in every band.

**(c) The commercial sheet's own $0.25 jump at $50,000 is kept, not reconciled.** Band 3
("$361.00 for the first $25,000 plus $8.70 for each additional $1,000, or fraction
thereof, to and including $50,000") computes exactly $578.50 at $50,000 of valuation
($361.00 + 25 × $8.70), and band 4 prints its base as **$578.75** — the printed base is
25¢ above what the band below computes at the boundary. Both figures are asserted —
$578.50 computed at exactly $50,000, and band 5's printed $578.75 as the base above it —
and the page states the jump rather than smoothing either number. (The same read as Las
Cruces's $100 jump: the document's arithmetic is charged as printed.) Above the jump the
sheet closes again: $578.75 + 50 × $6.14 = $885.75 at $100,000, band 5's own base.

**(d) The seam that is continuous is asserted too.** The residential ladder closes
exactly at every step — $50.00 + 99 × $5.56 = $600.44 at $100,000, which is band 3's
printed base — and the commercial ladder closes at $25,000 ($55.00 + 24 × $12.75 =
$361.00), $100,000 ($578.75 + 50 × $6.14 = $885.75), $500,000 and $1,000,000. Tests
walk every seam on both sheets.

**(e) Plan review is commercial-only, gated on the plan-review fact, at 20% with a $50
floor.** The commercial sheet prints the line; the residential sheet prints none — an
absence recorded rather than assumed (the City may require residential plan review under
its submittal requirements, but no residential sheet read for this pass prices it, so no
residential rule charges it). "Attributable" in "the attributable building permit fee"
is the sheet's own hedge about partly-reviewed projects; the rule reads 20% of the
permit fee and the page quotes the word.

**(f) The valuation is the applicant's, reviewed by the Department, derived from the ICC
table less 15%.** The commercial page: applicants provide a valuation split into Building
Valuation and Parking Lot Valuation; "The Inspections Department uses the current
International Code Council (ICC) building valuation data as a guide for calculating
permit valuations, less 15% for local area considerations"; valuations are reviewed at
submission and before issuance; "The Building Official makes the final valuation
determination as required in the building code." The engine takes the valuation as an
input; the ICC-minus-15% derivation is the Department's, named on the pages rather than
re-run here (the same stance as Buffalo's R × S × W). The reason the page requires two
valuation totals (building and parking lot) is not answered by any fee sheet read — see
open questions.

**(g) The unpermitted-work table is modelled in its three bands, with each sheet's own
minimums, and the repeat-offence lines are quoted.** "Permit fee is doubled" is a
surcharge equal to the permit fee; the 50% and 25% rows are surcharges with the minimums
printed on the sheet that prints them ($550/$2,000 residential, $980/$2,500 commercial),
so four rules carry four different floors — and "Second offence within 180 days — $200
minimum / $100 for each additional violation subsequent" needs a violation count this
site does not collect, so it is quoted on the page, not charged.

**(h) The reduced demolition and moving rows are two-condition facts.** "$100.00 / $50.00
for buildings under 400 SF and buildings without utility services" is read as one
discount condition (`custom.demo_reduced`) satisfied by *both* conditions of the sheet —
the slash pairs the standard price with the reduced one, and the sentence states both
requirements. Same for the moving rows, where the extraterritorial $150.00 is a third
rule (`custom.extraterritorial`).

**(i) Electrical is priced by the state, and the page says so in its first line.** No
city fee exists to model — the fee-schedule index proves the absence — so the electrical
page's rules are NDSEB's two bands plus the $50 late-certificate increase, all as
`state_surcharge` components with the state board as the source, and the page states
that Fargo publishes no electrical permit fee of its own. NDSEB's percentages are
prorated (no round-up phrase anywhere in the table): 2% and 1/10 of 1% of the balance.

**(j) Plumbing's fixture allowance is one rule, and the double fee is a gated
surcharge.** "Minimum Fee $50.00 (includes up to 5 fixtures or traps) (each fixture or
trap over 5 is $10.00 each)" is a single per-unit rule with a base, a threshold of 5 and
a $10 rate. "Double fees for all work commenced without a permit" is the plumbing
sheet's own unpermitted-work line: a surcharge equal to the plumbing permit fee, gated on
`custom.unpermitted_work`, like Las Cruces's tripling read as doubling here.

## Requirements read

From the Department's own pages: the plumbing page's self-work checklist (ND State
Plumbing Code; a licensed contractor for the street-to-building sewer and water; all
underground inspected and tested before cover; a final inspection after fixtures are
set) and its closing sentence — "Any building, electrical or mechanical work requires
permits separate from plumbing permits"; the self-wire page's eligibility rule (only the
owner-occupant of a single-family home, not rentals, day cares or mobile homes; all other
work by a licensed contractor; the inspector sets the value at rough-in and NDSEB bills
the homeowner); the commercial page's valuation process (two totals, two review points,
Building Official final); electricians licensed by the ND State Electrical Board (the
City's own "Selecting a Contractor" page).

## Not modelled (named on the page, never papered over)

- **The hourly inspection and plan-review items** ($75.00 per hour with their minimums,
  outside consultants at actual cost) — priced by hours this calculator does not collect.
- **The repeat-offence increments** ("Second offence within 180 days — $200 minimum;
  $100 for each additional violation subsequent") — needs a violation history.
- **The heating/HVAC, sign, code-enforcement and rental schedules** — separate fee
  schedules linked from the City's own index, named on the pages as separate permits
  (this pass publishes building, electrical and plumbing).
- **The ICC-minus-15% valuation derivation and the two-total split** (reading f) — the
  Department's calculation, taken as an input.
- **NDSEB's exclusions, hourly special services and $50 correction-order charge** —
  quoted beside the modeled bands; only the two job-cost bands and the late-certificate
  $50 are charged.
- **Water Permit to Connect and Tapping Fees** — a utility connection schedule linked
  from the plumbing page; tap charges are utility charges rather than permit fees.

## Effective dates on record

| Instrument | Effective |
| --- | --- |
| Residential building fee sheet | 2026-01-01 (printed) |
| Commercial building fee sheet | 2026-01-01 (printed) |
| Plumbing fee schedule | 2025-01-01 (printed) |
| Residential / commercial pages | "Effective January 1, 2026"; commercial "Content Updated January 2026" |
| NDSEB inspection fees | 2024-07-01 (printed, with the superseded table beneath) |
| Electrical self-wire / plumbing pages | undated; read 2026-09-25 |

## Open questions

1. Why the commercial page requires the valuation split into Building and Parking Lot
   totals — no fee sheet read prices parking lots separately; an engineering or street
   permit may, outside these schedules.
2. Whether residential plan review is charged under the submittal requirements despite
   the residential sheet's silence (reading e).
3. Fargo's code pages are served from the City's own CMS while one fee PDF sits on
   `download.cityoffargo.com` (the code-enforcement schedule); the three schedules used
   here are all on `download.fargond.gov`.
