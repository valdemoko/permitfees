## 10. Florida — the first state of counties

Florida is the first state where the jurisdictions are counties rather than
cities, and it changes the shape of the pages. Miami-Dade and Orange County
share § 553.721 and § 468.631 as the two state surcharges, and the pages are
the argument: Miami-Dade states the 1% and the 1.5% as two rows with two
$2.00 floors, so at a $147.00 permit fee it collects $2.00 + $2.21 = $4.21;
Orange County adds the two statutes up first and states one 2.5% row with a
single $4.00 floor, so the same permit pays $4.00. That 21 cents is asserted
in both jurisdictions' tests and in the database, because the two rows are
the same statutes read the same way, and the difference is exactly the
evidence that the two rows are not equivalent.

Two other things distinguish Florida and belong on the pages:

1. **A building permit is priced by area, not by valuation.** Miami-Dade's
   fees are per square foot of structure or per named item; Orange County's
   are per *total valuation*, in two bands that break at $2,000,000, and the
   County publishes the average cost per square foot table it derives the
   valuation from — R-3 (one and two family) runs from 97 a square foot at
   construction type VB up to 158 at IA, nine construction types per
   occupancy. A reader can check the valuation the fee is charged on against
   the County's own printed table, which is the point of the file.
2. **A single document carries three fee schedules.** The Building Safety
   section of the Fee Directory (pages 26-45) contains the building,
   electrical and plumbing tables, and the gas schedule is on pages 38-39.
   The electrical and plumbing sections are cited in the payload to the same
   source key, and both are the same document.

Neither county prices mechanical, and both name the **Plan Submittal Fee**
and the private provider reduction as excluded items rather than modelling
them. The pages say so explicitly, because a reader who wants the total has
to know which body will not quote it.

## 11. California — two cities that are opposites

The standing rule for the second jurisdiction in a state is that it should be a
*feature* that it differs from the first. California delivered the largest version
of that: San Diego prices a building permit from **area** as plan check plus
inspection and its trade permits **per unit of work**, while Sacramento prices a
building permit from **valuation** as a hundred-bracket ladder that hands over to a
printed formula, and prices its trade permits as **flat named scopes** with no
per-item rate anywhere.

Three content decisions belong to the record:

1. **Sacramento publishes a fee sheet and a fee listing, and they are not the same
   document.** The four charges around a building permit — the General Plan Maintenance
   Fee, the Construction Excise Tax, the City Business Operations Tax and the
   Residential Construction Tax — appear in neither Table A nor Table B.1. Both
   sources are cited, and the source key on each rule says which document the figure
   came from, because "the City's fee schedule" is not one thing.
2. **Plan review and the Technology Surcharge built on it are named, not computed.**
   The City prices plan review on a third document this project did not read, and the
   surcharge is "10% of the Plan Review Fee (if applicable) and Building Permit Fee
   (if applicable)" — so computing it would have made every Sacramento total wrong by
   roughly 10% of its largest item while looking exactly like a finished answer. The
   page states both figures and states why neither is in the total.
3. **Two columns that disagree on two rows are carried as printed.** Table A's
   Residential column reads $577 where its Commercial column reads $557 at $33,999 of
   valuation, and $586 against $585 at $36,999. Whether those are City-side typos is
   not knowable from the document, so the payload carries both and the page names the
   divergence. A "helpful" smoothing would have published a number the City does not
   print on the row that applies to a homeowner.

San Diego's own decision is the inverse: its IB-501 PDF has **no text layer**, so the
bulletin's HTML page is recorded as a `municipal_website` source rather than a
`fee_schedule_pdf`. A source type is a claim about what was read.

## 12. North Carolina — a fee that is a percentage of another fee

Raleigh is the first jurisdiction on the site whose trade permits have no rate schedule
of their own: the guide prints them as **shares of the calculated building permit** —
49% electrical residential and 100% commercial, 34% plumbing residential and 56%
commercial — each floored at a **$124.00 per-trade minimum** and carrying a **4%
technology surcharge**. Three content decisions belong to the record:

1. **The share is composed from two published rates, and the page shows the
   arithmetic.** The electrical rule charges 49% × 0.38% of the valuation rather than
   reading a building permit this page does not price, and the prose walks the same
   path in dollars — $1,520.00 of building permit, 49% of it $744.80, plus $29.79 of
   surcharge for $774.59 — so a reader can rebuild the figure from the two numbers the
   guide prints. The page also states what the share means: the electrical permit is
   sized by the building, not by the wiring.
2. **The guide's two cost columns were both read, and the payload says which one is
   used.** Every fee row prints a Prior Year cost and an FY27 cost, and several rates
   moved between them — residential electrical 54% → 49%, Tier 1 commercial 0.20% →
   0.21%. Taking the left column would have produced a complete, internally consistent,
   last-year schedule, which is why the source notes, the profile and the research
   record all name FY27 and the effective date comes from the guide's cover.
3. **What is not modelled is named with the reason it cannot be.** The alteration
   levels (28%, 50%, 75%) are priced against a building permit fee the guide never
   prints for an alteration, so no figure exists for the share to apply to; the
   mechanical permit (28% / 76%), the special projects fee, the conditional service
   fees and the other five departments' schedules inside the same document are listed
   with their published amounts rather than dropped silently.

The first and third points are the same lesson Sacramento taught from the opposite
side: a document can publish a complete schedule and still not publish the number one
of its own rows applies to.

Durham is the second North Carolina jurisdiction and the page's counter-argument to
Raleigh's: the same state, the same permit types, and the opposite treatment of the
same surcharge. Its four schedules state that **every amount already includes the
technology surcharge**, so the payload carries no surcharge rule at all, and the
not-included list says so rather than leaving a reader to wonder why no line appears.
Three content decisions belong to the record:

1. **An absence is asserted, not assumed.** A test checks that no `fee_subtotal`
   rule exists anywhere in the Durham payload — the mirror of Raleigh's test that
   three exist. Without it, the next editor to add a fee would have no signal that
   the schedule already prices it, and every Durham total would silently go up 4%.
2. **Floors are stacked, and the prose says in what order.** The $65.00 permit floor
   and the $100.00 / $150.00 rough-in floor both measure the same running subtotal,
   so the page states that the rough-in floor is reached *after* the permit floor —
   and the worked example (18 outlets, a rough-in and a paper application) is chosen
   to show all three lines at once: $65.00, topped to $100.00, plus $5.00.
3. **Charlotte is named as blocked inside the record, not skipped.** The intended
   second city's permit fees are Mecklenburg County's, which returns 403 from here;
   the five Charlotte fee PDFs that were read prove they price plan review and
   inspections instead. §5 of the Durham research file says exactly that, so the
   next reader does not re-read five PDFs to reach the same conclusion.

## 13. Illinois — the first fee that is a product of two tables

Chicago is the first jurisdiction where the fee is **not any one rule's number**, and the
content problem it set is a wording problem rather than a data one. §14A-4-412.2.2.1 prices
a building permit as `CF × RF × A` — a construction factor from Table 14A-12-1204.3(1), a
scope-of-review factor from Table (3) or (4), and the gross floor area — so the fee-structure
table on the page has **no single rate to print**. Three content decisions belong to the
record:

1. **The formula is stated as the two tables that produce it, never as one factor.** A page
   that printed "$0.78 per sq ft" would be telling a reader the whole formula while showing
   one of its factors, and the same construction factor is paired with seven different scope
   factors in Group B alone. The engine's own `describeFeeRule` therefore returns
   "Construction factor × scope of review factor per sq ft; minimum fee from the schedule's
   own row", and a test refuses any rate-like number appearing in it.
2. **The page states which floor it charges, because the document prints two.** Footnote c
   puts a **$602 minimum under every permit** while the table's own rows print $600 and $300 —
   last year's floors. Both are minimums, so the larger is what is collected, and the page
   says so with the $602 example (a 1,500-square-foot Level 1 alteration computes to $292.50
   and pays $602.00) rather than leaving a reader to wonder why a printed $600 never appears.
   The one exception is stated too: a temporary structure takes footnote c's own **$302**.
3. **Two things the code cannot price are named, with their amounts.** Exterior wall
   rehabilitation needs a construction factor from Table 14A-12-1204.3(2), which is printed
   `[Reserved]` in both the 2022 excerpts and the 2026 tables; phased permitting's first row
   prints no factor at all. The page lists the seven exterior-wall amounts and the five phased
   amounts it is not charging, because a reader who came for tuckpointing should leave knowing
   the schedule publishes $350 for it and that this site will not multiply it by a factor no
   document prints.

The trades are the opposite shape and are treated as such: Table 14A-12-1204.2 is a list of
stand-alone fees, and §14A-4-412.1 makes them **stack** when one permit covers more than one
listed scope. A 200-ampere service and eighteen circuits are $75.00 plus $300.00, not the
larger — a page that took the larger would understate almost every electrical permit — and
the worked example is chosen to show the stack: $375.00, then $450.00 once a residential
generator joins it.

## 14. Growth policy

Every state added since Oregon has been chosen by the standing order in
`research/index.md`: **verifiability first**, then a different mechanism from the
states already published, then market significance. Idaho and Utah were stopped at the
first gate and recorded as blocked rather than published from an unreachable source;
Florida showed that a state can be a set of counties with different fee models;
California showed that two cities in one state can be opposites, and that a jurisdiction
whose fee schedule lives partly in a second, undated document still has to cite both;
North Carolina showed that a trade permit can be priced as a share of a fee the same
document computes elsewhere, and that the page has to carry the composition rather
than the intermediate number it does not itself charge — and that its second
jurisdiction can charge the same surcharge by leaving the rule out entirely, since a
schedule that states its amounts are inclusive publishes the answer already. Illinois
showed the opposite again: that a fee can be the **product of two published tables**
with no valuation in it anywhere, that a schedule can print a minimum on every row and a
second one for every permit at once, and that an engine field can carry a whole
mechanism — `rateTables` and `floorTable` replaced what would otherwise have been over a
thousand rules.

The order for the remaining states is therefore not a ranking of importance — it is
the order in which a primary schedule can actually be read from this environment, with
each state's record written up in `research/index.md` as it is added or blocked.
