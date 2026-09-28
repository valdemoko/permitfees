# PermitFees

A reference for US construction permit costs: official sources, deterministic
calculations, and human-written explanations.

**Status: nineteen jurisdictions, end to end — Houston and Dallas (Texas),
Phoenix and Scottsdale (Arizona), Clark County and Boulder City (Nevada),
Denver and Westminster (Colorado), King County and Seattle (Washington),
Portland and unincorporated Multnomah County (Oregon), Orange County and
Miami-Dade County (Florida), San Diego and Sacramento (California),
Raleigh and Durham (North Carolina), and Chicago and Oak Park (Illinois).**
Each is researched from official
sources, stored in PostgreSQL, calculated by the deterministic engine,
published, and covered by tests. Every data route without a verified source
returns `404`, and national expansion adds jurisdictions one at a time under
the same bar. No fee figure in this repository is invented.

## Coverage at a glance

| State | Jurisdictions | Pages |
| --- | --- | --- |
| Texas | Houston, Dallas | 6 |
| Arizona | Phoenix, Scottsdale | 6 |
| Nevada | Clark County, Boulder City | 6 |
| Colorado | Denver, Westminster | 6 |
| Washington | King County, Seattle | 6 |
| Oregon | Portland, unincorporated Multnomah County | 6 |
| Florida | Orange County, Miami-Dade County | 6 |
| California | San Diego, Sacramento | 6 |
| North Carolina | Raleigh, Durham | 6 |
| Illinois | Chicago, Oak Park | 6 |

## Contents

- [Permit pages](#permit-pages)
- [Mechanism by state](#mechanism-by-state)
- [Method](#method)
- [Blocked jurisdictions](#blocked-jurisdictions)
- [Running the app](#running-the-app)
- [Commands](#commands)
- [Architecture](#architecture)

## Permit pages

| Jurisdiction | Published pages | Research record |
| --- | --- | --- |
| **Houston, Texas** | 3 (building, electrical, plumbing) | `research/texas/houston.md` |
| **Dallas, Texas** | 3 (building, electrical, plumbing) | `research/texas/dallas.md` |
| **Phoenix, Arizona** | 3 (building, electrical, plumbing) | `research/arizona/phoenix.md` |
| **Scottsdale, Arizona** | 3 (building, electrical, plumbing) | `research/arizona/scottsdale.md` |
| **Clark County, Nevada** | 3 (building, electrical, plumbing) | `research/nevada/clark-county.md` |
| **Boulder City, Nevada** | 3 (building, electrical, plumbing) | `research/nevada/boulder-city.md` |
| **Denver, Colorado** | 3 (building, electrical, plumbing) | `research/colorado/denver.md` |
| **Westminster, Colorado** | 3 (building, electrical, plumbing) | `research/colorado/westminster.md` |
| **King County, Washington** | 3 (building, electrical, plumbing) | `research/washington/king-county.md` |
| **Seattle, Washington** | 3 (building, electrical, plumbing) | `research/washington/seattle.md` |
| **Portland, Oregon** | 3 (building, electrical, plumbing) | `research/oregon/portland.md` |
| **Unincorporated Multnomah County, Oregon** | 3 (building, electrical, plumbing) | `research/oregon/multnomah-county.md` |
| **Orange County, Florida** | 3 (building, electrical, plumbing, gas) | `research/florida/orange-county.md` |
| **Miami-Dade County, Florida** | 3 (building, electrical, plumbing) | `research/florida/miami-dade-county.md` |
| **San Diego, California** | 3 (building, electrical, plumbing) | `research/california/san-diego.md` |
| **Sacramento, California** | 3 (building, electrical, plumbing) | `research/california/sacramento.md` |
| **Raleigh, North Carolina** | 3 (building, electrical, plumbing) | `research/north-carolina/raleigh.md` |
| **Durham, North Carolina** | 3 (building, electrical, plumbing) | `research/north-carolina/durham.md` |
| **Chicago, Illinois** | 3 (building, electrical, plumbing) | `research/illinois/chicago.md` |
| **Oak Park, Illinois** | 3 (building, electrical, plumbing) | `research/illinois/oak-park.md` |

### Houston and Dallas

Houston prices trades per item and drives its structural fee from a bracket
table whose base charges deliberately do not chain. Dallas picks between three
construction tables by building type and prices trade inspections by how many
trades a job involves. Houston's mechanical and demolition pages are seeded as
drafts and withheld by the editorial gate, because the sources do not yet
support a page worth publishing. Phoenix and Scottsdale do publish trade
figures, so both have electrical and plumbing pages: Phoenix prices a trade
permit from the same valuation Table A as a building permit and adds $98 for
each meter after the first of each utility and $98 for each backflow device
after the first, while Scottsdale's Miscellaneous schedule charges a flat fee
per discipline and per item — $121 minimum, or a named item such as a water
heater at $63 or a residential solar array at $168. Neither state has a
mechanical page yet, and Phoenix's demolition fee is priced but not
published.

Colorado's two documents are the same fee table and the review fee written
into it: Denver prices plan review as the third column of Table No. 1,
Westminster as 65% of the permit fee. Washington is where the authorities
multiply. **King County publishes two valuation tables and charges both** —
a plan review fee at application and an inspection fee at issuance, so a
$1,200,000 project pays $11,918.00 and then $18,903.00 — and its three permit
types come from three different bodies: the county prices building work, the
county **health department** prices plumbing, and the **state** prices
electrical, at fees identical in every county it covers. Seattle is in the
same county and prices a building permit as an **index charged twice** (100%
for the permit, another 100% for plan review), adds a 5% technology fee on
the whole bill and the state's $6.50 or $25.00, and sends plumbing to the
same county health department the unincorporated county uses — the one
schedule in the dataset that prices permits in two jurisdictions.

### Oregon

Oregon is the same lesson from the other direction. Portland Permitting &
Development is a **City bureau that also issues permits for unincorporated
Multnomah County**, publishing a separate schedule under the county's name —
and the two fee tables are the *same* table: the building permit fee is
identical row for row, and every dollar amount in the electrical and plumbing
schedules matches, which was established by diffing the amounts extracted
from both documents rather than by reading them. The two payloads are
therefore built from one set of rule factories, and a test asserts they
cannot drift apart. What separates them is a **table**: the City charges a
Development Services Fee on the same valuation that the county's document
does not contain at all, $650.91 on a $250,000 commercial project, which is
exactly the difference between the county's $3,508.63 and the City's
$4,159.54. The building schedule's four seams all close, and its first band
counts in **hundreds** rather than thousands; the City's Development
Services Fee table does not close at its first seam, ninety cents that exist
in the City's own document. On top sits the state's **12%** surcharge under
ORS 455.210(4), charged — as the page states with both readings — on the
permit fee rather than the total.

### Florida

Florida is the first state of counties rather than of cities. The two
jurisdictions share a statute, and the pages are the argument: Miami-Dade
states the 1% and 1.5% Building Code surcharges as two rows with two
$2.00 floors, and Orange County adds them up first and states one 2.5% row
with a single $4.00 floor. At a $147.00 permit fee the two counties collect
$4.21 and $4.00 respectively, and the difference is asserted in both
jurisdictions' tests. Everything else divides: Miami-Dade prices a building
permit by area and states the trade sheet's $227.90 minimum as a
permit-level `permit_minimum` rule; Orange County prices by total valuation
in two bands that break at $2,000,000, and publishes the average
cost-per-square-foot table it derives the valuation from, so a reader can
check the fee against the County's own table. Neither county prices
mechanical, and both name the **Plan Submittal Fee** and the private
provider reduction as excluded items rather than modelling them.

### California

California is where two cities in one state turned out to be opposites, which is
what makes the pair useful. **San Diego prices a building permit from area** as
plan check plus inspection — a base rate covering the first 3,000 square feet and
an increment per square foot above it, printed twice for one project type — and
its trade permits **per unit of work**, a First Unit and an Each Additional Unit
amount on almost every row. **Sacramento prices a building permit from
valuation**: a hundred brackets of $1,000 each from $999 ($75) to $99,999
($1,078), and then, instead of a hundred-and-first bracket, three printed
formulas — "$1078 + $0.006787 each $1 > $100,000" — that meet the ladder exactly
at $100,000, at $3,000,000 and at $10,000,000. Its trade permits are flat named
scopes instead: one $105 permit covers a panel change-out, a whole-or-partial
re-wire and new branch circuits, and one $105 permit covers a sewer service, a
water supply line and toilet replacement.

The two disagree on what decides a fee, and both are published from their own
sources. San Diego carries two State of California fees on the valuation; Sacramento
adds four City charges that the fee sheet does not contain at all — the General Plan
Maintenance Fee at $2.60 per $1,000 (capped at $38,200), an excise tax at 0.008 of
the valuation, a business operations tax at $0.40 per $1,000 (capped at $5,000 and
charged only when a licensed contractor holds the permit) and a per-unit residential
construction tax at $250, $315 or $385 by bedroom count. Sacramento's **plan review
fee and the 10% Technology Surcharge built on it are named rather than computed**,
because the City prices them on a separate schedule this project did not read.

### North Carolina

Raleigh is the first jurisdiction on the site that prices a **trade permit as a
percentage of the building permit fee**. One document carries the whole schedule:
the City's Development Fee Guide, whose cover states the fiscal year it runs (July
1, 2026 – June 30, 2027) and whose every fee row prints **two** cost columns — Prior
Year and FY27 — so taking the left one would publish a complete, internally
consistent, last-year schedule. The building permit is 0.38% of the calculated
construction value for new residential work and a three-band schedule with base
fees for commercial (0.21%; then $1,050.00 + 0.06%; then $7,250.00 + 0.01%); plan
review is 57% or 65% of *that permit fee*; and the electrical and plumbing permits
are **49%/100%** and **34%/56%** of it, each floored at a **$124.00 per-trade
minimum** and carrying a **4% technology surcharge** on the fees. The share is
charged as the product of the two rates the guide publishes — 49% × 0.38% — so a
page's electrical total is not 149% of the building permit. The three commercial
bands are alternatives rather than a ladder: they step $300 at $500,001, step
$1,200 the same way at $10,000,001, and the Tier 2 and Tier 3 formulas are only
equal at $12,400,000.

Durham is the second North Carolina jurisdiction and the structural opposite of
the first. One City-County department prices all three permits from four
schedules, all stamped *Effective 7/1/18*, and **states that every amount already
includes the technology surcharge** — so the payload carries no surcharge rule at
all, the exact counterpart of Raleigh's three 4% lines. The building permit is
area-based in Schedule A (eight valuation-independent brackets, each with a flat
$146.00 plan review), Schedule E prices commercial work by valuation in five
bands whose each-band charge is a flat permit + a flat plan review + a
per-thousand increment that differs by band, and the seam tests close at every
break ($500,000→$500,001, $5,000,000, $10,000,000, $50,000,000). Electrical and
plumbing price named items — outlets, fixtures, circuits, water heaters — and
electrical stacks **three `permit_minimum` floors in ascending priority** ($65.00
permit, then $100.00/$150.00 rough-in), each floor measuring the subtotal the
floor before it raised, so 18 outlets plus a paper application collect $65.00
plus the $5.00 surcharge rather than one or the other.

### Illinois

Chicago is the first jurisdiction on the site whose building fee is **the product of
two published lookup tables** rather than any single rate. §14A-4-412.2.2.1 prices it
as `CF × RF × A` — a construction factor from Table 14A-12-1204.3(1) by occupancy
class and construction type, a scope-of-review factor from Table (3) for new
construction or Table (4) for rehabilitation, and the gross floor area — and
**nothing in the building permit is a valuation**: the Department's own calculator
asks for area, not value. Every scope row prints a Minimum Fee, footnote c puts a
city-wide **$602 floor** under every permit ($302 for a temporary structure), and
footnote d takes demolition out of the formula entirely at a flat $600.00 ordinary
or $2,450.00 complex. The trades are a different mechanism: Table 14A-12-1204.2 is a
list of **stand-alone fees** which §14A-4-412.1 says **stack** when one permit covers
more than one listed scope — a 200-ampere service and eighteen circuits are $75.00
plus $300.00, not the larger. The tables are carried by two config fields
(`rateTables`, `floorTable`), so the rate is selected from matrices and multiplied as
exact fractions; Table (4)'s all-occupancy block and the shared Group R row are
expanded across the classifications the schedule prints them for. Two things the code
cannot price are named rather than guessed: **exterior wall rehabilitation**, whose
construction factor comes from Table 14A-12-1204.3(2), printed `[Reserved]`, and
**phased permitting**, whose first row prints no factor at all.

## Method

See [CONTENT_STRATEGY.md](./CONTENT_STRATEGY.md).

## Blocked jurisdictions

See [research/index.md](./research/index.md).

## Running the app

See [README.md](./README.md) Quick start.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run typecheck` | Run `tsc --noEmit` |
| `npm test` | Run `vitest run` |
| `npm run build` | Build for production |
| `npm run db:seed` | Seed PostgreSQL |
| `npm run db:verify` | Run the database checks |
| `npm run check` | `typecheck` + `test` |
