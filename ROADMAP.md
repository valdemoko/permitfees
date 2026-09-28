## Growth policy

**The unit of work is one jurisdiction, and the gate is unchanged from Phase 1:**
official sources, a real verification date, rules the engine computes, a
worked example computed at render time, and SEO that is specific to the
place. A new jurisdiction means a new row in `ALL_SEEDS`, a new row in the
progress table, and a new research record — and the count in
`research/index.md` is derived from `npm run db:verify`, so the ledger and
the database cannot drift.

### How the next state is picked

Not by population, and not by size of the city. In order:

1. **Verifiability first.** Can the official fee schedule actually be
   obtained and read? If not, no amount of market importance makes the
   jurisdiction publishable.
2. **A different mechanism is a feature.** Two cities whose fees are shaped
   differently test the engine; two that are shaped the same way mostly test
   transcription.
3. **Then market significance**, as a tie-breaker among jurisdictions that
   already pass (1).

The second jurisdiction in each state is also the natural place to check a
neighbouring city whose schedule is published on the same host, since the
retrieval cost is already paid.

### The standing choices, and why

- **Texas was the wrong first pair in one respect.** Houston and Dallas are
  two cities in one state, and they share three permit types, so the schema
  had to de-duplicate the shared rows (states, counties, permit types) before
  anything else. That cost a migration. Arizona's Phoenix–Scottsdale pair
  was free of it, and learning that was worth a state.
- **Oregon was the wrong second jurisdiction in a different respect.** The
  two closest jurisdictions are also the two whose schedules are closest — in
  Oregon's case the *same* tables, in Texas's the two tables that share a
  source host. Picking them proved the "same source → same rules" invariant
  instead of discovering it.

Both lessons point the same way: each new jurisdiction should test the
engine's ability to say something it has not said before. That is why
Arizona, then Nevada, then Colorado, then Washington, then Oregon, then
Florida.

### Florida was the first state of counties

The two Florida jurisdictions are both counties, which is the first time the
site has covered two counties that are not in the same pair. They share §
553.721 and § 468.631 as the two state surcharges, and the pages are the
argument. Miami-Dade states the 1% and the 1.5% as two rows with two $2.00
floors, so at a $147.00 permit fee it collects $2.00 + $2.21 = $4.21;
Orange County adds the two statutes up first and states one 2.5% row with a
single $4.00 floor, so the same permit pays $4.00. That 21 cents is asserted
in both jurisdictions' tests and in the database, because the two rows are
the same statutes read the same way, and the difference is the evidence that
the two rows are not equivalent.

Two other things distinguish Florida and belong on the pages:

1. **A building permit is priced by area, not by valuation.** Miami-Dade's
   fees are per square foot of structure or per named item; Orange County's
   are per *total valuation*, in two bands that break at $2,000,000, and the
   County publishes the average cost per square foot table it derives the
   valuation from — R-3 (one and two family) runs from 97 a square foot at
   construction type VB to 158 at IA, nine construction types per occupancy.
   A reader can check the valuation the fee is charged on against the
   County's own printed table, which is the point of the file.
2. **A single document carries three fee schedules.** The Building Safety
   section of the Fee Directory (pages 26-45) contains the building,
   electrical and plumbing tables, and the gas schedule is on pages 38-39.
   All are cited in the payload to the same source key, and both are the same
   document.

Neither county prices mechanical, and both name the **Plan Submittal Fee**
and the private provider reduction as excluded items rather than modelling
them. The pages say so explicitly, because a reader who wants the total has
to know which body will not quote it.

### North Carolina priced the trade off the building permit

Raleigh is the first jurisdiction whose **trade permit is a percentage of another
fee**, which is a mechanism no previous state had. One document — the City's
Development Fee Guide, dated on its own cover as July 1, 2026 – June 30, 2027 —
carries the building permit (0.38% of calculated construction value residential,
three bands with base fees commercial), plan review (57% / 65% of that permit
fee), the electrical and plumbing permits (49% / 100% and 34% / 56% of it), a
**$124.00 per-trade-per-review minimum**, and a **4% technology surcharge** on the
fees. The record is in
[`research/north-carolina/raleigh.md`](./research/north-carolina/raleigh.md).

Two things it forced into the open:

1. **A share published as two rates has to be composed, not nested.** "49% of the
calculated building permit" could be modelled as `permit_fee`, but attaching the
building permit to the electrical page so the percentage could read it would make
that page's total 149% of the building permit. The rule instead charges the exact
product of the two published rates — 49% × 0.38% — formed in code from two named
constants, and a test runs both rule sets and requires the share to equal 49% of
what the building rules charge for the same input.
2. **Bands with base fees are alternatives, not a ladder.** The guide's three
commercial bands do not meet: $300 of step at $500,001, $1,200 of step the *same*
direction at $10,000,001, and the Tier 2 and Tier 3 formulas only agree at
$12,400,000. Each is charged over the range the guide prints for it, and both
steps are asserted at their boundary valuations — the second one exists because a
draft of the page described it as a $200 step the other way.

Every fee row in the guide prints two cost columns, Prior Year and FY27, and
several rates moved between them (residential electrical 54% → 49%, Tier 1
commercial 0.20% → 0.21%). Reading the left column would have produced a
complete, internally consistent, last-year schedule — the reason the research
record states which column was read.

### Durham charged the surcharge the opposite way

The second North Carolina jurisdiction is the structural counter-example to the
first, and it is why "same state" is not "same mechanism". Durham's City-County
Building & Safety Department publishes four schedules (building, electrical,
plumbing, mechanical), all stamped *Effective 7/1/18*, and every amount in them
**already includes the technology surcharge** — stated on the face of the
schedule. Raleigh reaches the same money with three 4% `fee_subtotal` rules on
every permit; Durham reaches it with none. The payload therefore contains no
surcharge rule at all, and a test asserts that absence by name, the same way
Raleigh's asserts its three presences.

Three things the schedules forced into the open:

1. **Floors can stack, and each one measures the subtotal the last one raised.**
   Electrical has a $65.00 permit floor, then a $100.00 residential / $150.00
   commercial rough-in floor, all as `permit_minimum` rules on `permit_fee` in
   ascending priority — because `permit_fee` is re-injected before every rule.
   18 outlets ($65.00 of charges) reach exactly the first floor; adding a paper
   application then collects the $5.00 surcharge *on top*, since a surcharge is
   not part of what the floor measures.
2. **A plan review column can be flat while the permit column is banded.**
   Schedule A's eight brackets each print a flat $146.00 plan review next to a
   rising permit fee, so the plan-review rule is one flat amount per bracket, not
   a percentage of the permit (Raleigh's 57% / 65%).
3. **Bands can carry their own increment rate.** Schedule E prices commercial
   valuation in five bands, each with a flat permit, a flat plan review, *and* a
   per-thousand increment ($780 / $660 / $432 / $125 above its own threshold),
   so the same $1,000 of valuation is worth a different amount in every band.
   The seams all close at $500,000, $5,000,000, $10,000,000 and $50,000,000.

Charlotte was the intended second city and is **blocked, not skipped**: its
Development Center's FY2027 fee PDFs are plan-review and inspection fees across
departments, and the permit fees a builder pays are Mecklenburg County's — which
returns 403 from here. The blocker, with the documents read proving it, is
recorded in [`research/north-carolina/durham.md`](./research/north-carolina/durham.md)
§5.

### Illinois priced a building permit as the product of two published tables

Chicago is the first jurisdiction whose fee **is not any single rule's number**.
§14A-4-412.2.2.1 states it as `CF × RF × A` — a construction factor read from Table
14A-12-1204.3(1) by occupancy class and construction type, a scope-of-review factor read
from Table (3) for new construction or Table (4) for rehabilitation, and the gross floor
area — and **no valuation appears anywhere in it**: the Department's own calculator asks
for construction type, occupancy type, floor area and project scope, and for nothing
else. Written as ordinary rules that formula is one rule per cell of a 14 × 5 × 39 cross
product, over a thousand of them. It shipped as **two config fields** instead —
`rateTables` and `floorTable` — so the rate is selected from two matrices and multiplied
as exact fractions, and a row the schedule does not publish excludes the rule rather than
inventing a number.

Three things the schedule forced into the open:

1. **A minimum fee column can be per unit, and a city-wide floor can sit under it.**
   Chicago's scope rows print "$900 per story", "$250 per unit served", "$300 per unit"
   beside $3,650 / $2,450 / $600, and footnote c puts a **$602 floor under every permit**
   ($302 for a temporary structure). Both are minimums, so the larger applies — which is
   why every row carries its own full literal minimum, and why the temporary-structure row
   is the case that proves the field has to be per-row: a rule-level $602 floor would have
   overwritten footnote c's own $302.
2. **A dimensionless table factor is a multiplier, not a percentage.** Chicago prints its
   scope factors as 0.25, 0.5, 0.75, 1, 1.25. Rendering 0.75 as "75%" in the working
   would invite reading it as a rate against the wrong base, so the engine gained a
   `formatMultiplier`, and the per-unit label gained real plurals after "Number of storys"
   reached a warning a reader sees.
3. **The exclusion is data, and the disjointness it depends on is a test.** The two
   formula rules carry no scope condition at all: a project finds a row in one table and
   not the other, so the other rule is excluded for publishing no rate. That keeps the
   applicability sentence readable instead of printing thirty-nine slugs into the
   fee-structure table — and it means a slug in both tables would charge a building twice,
   silently, which is why a test asserts the two sets are disjoint.

The trades are a different mechanism entirely, and deliberately so: Table 14A-12-1204.2 is
a list of **stand-alone fees**, and §14A-4-412.1 says a permit covering more than one
listed scope pays **each applicable fee**. A 200-ampere service and eighteen circuits are
$75.00 plus $300.00, not the larger of the two. Two things the published code cannot price
are named rather than guessed: exterior wall rehabilitation, whose construction factor
comes from Table 14A-12-1204.3(2), printed `[Reserved]` in both the 2022 and 2026
printings, and phased permitting, whose first row prints no factor at all.

### The next states

California is the second state of this phase and the fourth added since Oregon, and it
demonstrates the rule the growth policy had been written for: two cities in one state,
read independently, turned out to be opposites — San Diego by area as plan check plus
inspection, Sacramento by valuation as a ladder that hands over to a formula. The
research record for both is in [`research/california/`](./research/california/).

After North Carolina and Illinois the next states are not ranked by importance but by
reachability. The
rule for a jurisdiction to be publishable stops at "no official source readable from
here": a calculator that renders its figures client-side, an API that answers 403, or a
government domain that returns nothing is a blocker that is recorded, not a state that
does not exist. That gate has already stopped Idaho and Utah outright, and it is why
the coverage table in [`research/index.md`](./research/index.md) has a `blocked` row
rather than an empty one.

What matters for the next pair is the same thing California mattered for: a new
mechanism is a feature. A state whose cities price from a shape the engine already
holds tests transcription; a state whose cities price from a shape nothing here has
holds is what the engine is expanded for, one field at a time, when it is genuinely
needed.
