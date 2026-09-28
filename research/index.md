# Research ledger — national expansion

One row per state, and one file per jurisdiction under `research/<state>/<city>.md`. The
purpose of this file is to answer two questions without reading anyone's memory: *what is
published, and what is blocking what is not.*

**Nothing here is a plan for future work presented as work done.** A state appears as
`published` only when at least one jurisdiction in it has real rates, real sources, a real
verification date, passing tests and a live page. Everything else says what it says.

Last updated: **2026-09-27** (West Virginia completed with Charleston and Huntington — the first state whose pass published a page with real primary amounts beside a page with none at all, because Charleston posts no plumbing fee table; Charleston's building schedule is a 2008 image scan reconciled against its own printed checkpoints, its electrical amounts live on a 2015 permit form, and Huntington's division publishes **one** IBC §108.2 ladder covering plan examination, permits and inspections alike. Oklahoma was completed with Oklahoma City and Tulsa — the first state whose whole fee apparatus is one ordinance chapter with two fiscal-year columns, whose alteration ladder prorates while its class rates key on `custom.building_class`, and whose stack charges a global floor last against `fee_subtotal`; audit pass: worked examples repaired for Anchorage and Springfield, Fairbanks plumbing example given its fixture count, sources integrity pass, ledger resynchronised). Missouri was completed with Kansas City and Springfield — the first state to price one city on a flat-table valuation ladder with chained `per_thousand` bands and the other on a half-cent construction-factor marginal table. Indiana was completed with Indianapolis and South Bend — the first schedule in the dataset published as a spreadsheet. Tennessee was completed with Nashville and Memphis; Ohio with Cleveland and Toledo; Massachusetts with Boston and Cambridge; Wisconsin with Green Bay as Madison's second jurisdiction; Michigan with Detroit and Grand Rapids; Minnesota with Saint Paul as Minneapolis's second jurisdiction.

---

## The process, in order

Every jurisdiction goes through the same steps, and each one has a gate:

1. **Authorities.** Who issues the permit — city, county, or a state agency. Recorded, not assumed.
   Then, before concluding that a permit type has no published fee, **search the document for
   the words such a fee would contain** — the trade, the device, `minimum`, `per item`. Two
   Arizona cities were once written off as having no trade fees on the strength of not having
   seen one. See [`arizona/phoenix.md` §4.4](./arizona/phoenix.md).
2. **Sources.** Official fee schedules, ordinances, codes, permit portals. Municipal and
   county government first; a third-party site may only be used to *find* an official source,
   never as the source of a rate.
3. **Read the document.** At least two `pdftotext` modes per PDF, because the mode that looks
   best can mis-pair labels and amounts (see [`arizona/scottsdale.md` §4](./arizona/scottsdale.md)).
4. **Mechanism.** Determine *how* the fee is computed: flat, valuation, area, per item,
   percentage of another component, or a combination. Never assume it resembles the last city's.
5. **Model.** Extend the calculation engine only when the real mechanism requires it, and then
   generically. See [`../CALCULATION_ENGINE.md`](../CALCULATION_ENGINE.md).
6. **Seed.** Idempotent, into Neon, through the same `State → Jurisdiction → Permit type →
   Fee rules → Sources → Verification` model every city uses.
7. **Pages.** Only where the editorial gate passes: at least one official source and a real
   verification date. A permit type the city does not price individually does not get a page.
8. **Verify.** `npm run db:verify`, `npm run typecheck`, `npx vitest run`, `npm run build`,
   then HTTP checks on the built site for status codes, canonical, and sitemap membership.
9. **Record.** The jurisdiction's research file, with URLs, hashes, effective dates, what was
   modelled, what was not, and what is still unresolved.

## Coverage

| State | Status | Jurisdictions | Files |
| --- | --- | --- | --- |
| Texas | **published** (2) | Houston, Dallas | [`texas/houston.md`](./texas/houston.md), [`texas/dallas.md`](./texas/dallas.md) |
| Arizona | **published** (2) | Phoenix, Scottsdale | [`arizona/phoenix.md`](./arizona/phoenix.md), [`arizona/scottsdale.md`](./arizona/scottsdale.md) |
| Nevada | **published** (2) | Clark County, Boulder City | [`nevada/clark-county.md`](./nevada/clark-county.md), [`nevada/boulder-city.md`](./nevada/boulder-city.md) |
| Colorado | **published** (2) | Denver, Westminster | [`colorado/denver.md`](./colorado/denver.md), [`colorado/westminster.md`](./colorado/westminster.md) |
| Washington | **published** (2) | King County, Seattle | [`washington/king-county.md`](./washington/king-county.md), [`washington/seattle.md`](./washington/seattle.md) |
| Oregon | **published** (2) | Portland, unincorporated Multnomah County | [`oregon/portland.md`](./oregon/portland.md), [`oregon/multnomah-county.md`](./oregon/multnomah-county.md) |
| Florida | **published** (2) | Orange County, Miami-Dade County | [`florida/orange-county.md`](./florida/orange-county.md), [`florida/miami-dade-county.md`](./florida/miami-dade-county.md) |
| California | **published** (2) | San Diego, Sacramento | [`california/san-diego.md`](./california/san-diego.md), [`california/sacramento.md`](./california/sacramento.md) |
| North Carolina | **published** (2) | Raleigh, Durham | [`north-carolina/raleigh.md`](./north-carolina/raleigh.md), [`north-carolina/durham.md`](./north-carolina/durham.md) |
| Illinois | **published** (2) | Chicago, Oak Park | [`illinois/chicago.md`](./illinois/chicago.md), [`illinois/oak-park.md`](./illinois/oak-park.md) |
| Alabama | **published** (2) | Birmingham, Huntsville | [`alabama/birmingham.md`](./alabama/birmingham.md), [`alabama/huntsville.md`](./alabama/huntsville.md) |
| Nebraska | **published** (2) | Omaha, Lincoln | [`nebraska/omaha.md`](./nebraska/omaha.md), [`nebraska/lincoln.md`](./nebraska/lincoln.md) |
| Alaska | **published** (2) | Anchorage, Fairbanks | [`alaska/anchorage.md`](./alaska/anchorage.md), [`alaska/fairbanks.md`](./alaska/fairbanks.md) |
| New Hampshire | **published** (2) | Manchester, Nashua | [`new-hampshire/manchester.md`](./new-hampshire/manchester.md), [`new-hampshire/nashua.md`](./new-hampshire/nashua.md) |
| New Jersey | **published** (2) | Newark, Jersey City | [`new-jersey/newark.md`](./new-jersey/newark.md), [`new-jersey/jersey-city.md`](./new-jersey/jersey-city.md) |
| New Mexico | **published** (2) | Albuquerque, Las Cruces | [`new-mexico/albuquerque.md`](./new-mexico/albuquerque.md), [`new-mexico/las-cruces.md`](./new-mexico/las-cruces.md) |
| Wisconsin | **published** (2) | Madison, Green Bay | [`wisconsin/madison.md`](./wisconsin/madison.md), [`wisconsin/green-bay.md`](./wisconsin/green-bay.md) |
| New York | **published** (2) | New York City, Buffalo | [`new-york/new-york-city.md`](./new-york/new-york-city.md), [`new-york/buffalo.md`](./new-york/buffalo.md) |
| Pennsylvania | **published** (2) | Philadelphia, Pittsburgh | [`pennsylvania/philadelphia.md`](./pennsylvania/philadelphia.md), [`pennsylvania/pittsburgh.md`](./pennsylvania/pittsburgh.md) |
| North Dakota | **published** (2) | Fargo, Bismarck | [`north-dakota/fargo.md`](./north-dakota/fargo.md), [`north-dakota/bismarck.md`](./north-dakota/bismarck.md) |
| Massachusetts | **published** (2) | Boston, Cambridge | [`massachusetts/boston.md`](./massachusetts/boston.md), [`massachusetts/cambridge.md`](./massachusetts/cambridge.md) |
| Minnesota | **published** (2) | Minneapolis, Saint Paul | [`minnesota/minneapolis.md`](./minnesota/minneapolis.md), [`minnesota/saint-paul.md`](./minnesota/saint-paul.md) |
| Michigan | **published** (2) | Detroit, Grand Rapids | [`michigan/detroit.md`](./michigan/detroit.md), [`michigan/grand-rapids.md`](./michigan/grand-rapids.md) |
| Tennessee | **published** (2) | Nashville, Memphis | [`tennessee/nashville.md`](./tennessee/nashville.md), [`tennessee/memphis.md`](./tennessee/memphis.md) |
| Ohio | **published** (2) | Cleveland, Toledo | [`ohio/cleveland.md`](./ohio/cleveland.md), [`ohio/toledo.md`](./ohio/toledo.md) |
| Indiana | **published** (2) | Indianapolis, South Bend | [`indiana/indianapolis.md`](./indiana/indianapolis.md), [`indiana/south-bend.md`](./indiana/south-bend.md) |
| Missouri | **published** (2) | Kansas City, Springfield | [`missouri/kansas-city.md`](./missouri/kansas-city.md), [`missouri/springfield.md`](./missouri/springfield.md) |
| Oklahoma | **published** (2) | Oklahoma City, Tulsa | [`oklahoma/oklahoma-city.md`](./oklahoma/oklahoma-city.md), [`oklahoma/tulsa.md`](./oklahoma/tulsa.md) |
| West Virginia | **published** (2) | Charleston, Huntington | [`west-virginia/charleston.md`](./west-virginia/charleston.md), [`west-virginia/huntington.md`](./west-virginia/huntington.md) |
| **Idaho** | **not started** — the older blocker is stale | — | See [`idaho/README.md`](./idaho/README.md) |
| **Wyoming** | **not started** | — | No research file yet; Cheyenne's fee schedule is reachable, Casper's answers 403 |

| | |
| --- | --- |
| States with a live page | 48 of 50 |
| Jurisdictions published | 96 |
| Permit pages published | 285 |
| Fee rules stored | 2,427 |
| Sources stored | 351 |

Two of those counts are worth reading carefully. The summary above is computed from the
catalogue itself (`ALL_SEEDS`), so it is right; the table above it is **not yet reconciled** —
the rows were added a state at a time and stop at the early states, which is why 48 live pages
sit over a table that names fewer. Reconciling the table is its own pass and is recorded here as
outstanding rather than done. The other count that matters is the last one: Idaho's `blocked`
row is now **stale**. Its research cycle ended because ten Idaho government domains answered
nothing from the sandbox at the time; on 2026-09-27 `pocatello.gov`'s building fee table and
Boise's fee schedule both answered a plain HTTP request, so the gate that stopped the cycle is
no longer the reason Idaho is absent. What is left is the work, not the wall. Wyoming has not
been researched at all.

## How the next state should be picked

The existing order in `research/index.md`:

1. **Verifiability first.** The primary fee schedule must be reachable and readable from the
   environment used for the research. An unverified schedule is not a schedule. This is the
   gate that stopped the Idaho cycle: every Idaho government domain I could enumerate
   (`idaho.gov`, `ada.id.gov`, `idahodocs.gov`, `idahocounty.gov`, `icbc.idaho.gov`,
   `idahobuilding.org`, `idahodivisionofbuildingsafety.com`, …) returns HTTP 000 from this
   sandbox, and `idaba.org` resolves to a German-language site with no Idaho content.

2. **A different mechanism is a feature.** Two cities whose fees are shaped differently test the
   engine; two that are shaped the same way mostly test transcription.

3. **Then market significance**, as a tie-breaker among jurisdictions that already pass (1).

The standing example of why verifiability is the first gate: a state that cannot be read cannot
be published, and the site's policy is that "the only thing that should be published is real,
readable, primary-source figures" — "not modelled" is named on any page, never papered over.

**New Jersey added a second shape to that gate, and it is worth naming.** Newark's own website
(`newarknj.gov`) answers every request from this environment with HTTP 403, and the proxy route
returns Cloudflare's bot challenge rather than a page — so the *city's* site is unreadable while
the *code* is not, because the codifier that republishes it serves plain HTML. The pass that
followed from that discovery is the general one: when a municipality is behind a bot challenge,
the codifier's consolidation is still a primary route to the text, and the amendment history it
carries is often better dating evidence than the city's own PDFs would have been.

The other thing New Jersey changed is where the *operative* instrument sits. In every state
before this one, the city set its own fees; in New Jersey the State sets the *shape* —
N.J.A.C. 5:23-4.18 requires the basic construction fee to be computed on the volume of the
building or on the estimated construction cost — and then sets the permit surcharge that rides on
top of every local fee, at `$0.00371` a cubic foot and `$1.90` per `$1,000`. Both of this pass's
cities print older versions of that State fee and incorporate the State's changes by reference,
which is the first time a page here has had to publish a figure the city does not print. The
answer is on the page in both places: the State's amount is charged, the city's is named beside
it, and the reasoning is in the research record.

**New Mexico's contribution is about reading a document against itself.** Albuquerque published
a fee handout whose 335 rows were reproduced programmatically from the code's own raw ladder
times its regional modifier before a line of content was written — zero mismatches — which is
what settled the two readings the model depends on (the `$23.50` minimum applies *after* the
modifier, and the handout's plan-review column is derived rather than independent). Las Cruces
then supplied the opposite case: one resolution whose Fee Table prorates partial thousands
because it omits "or fraction thereof" while its mechanical and plumbing ladders in the same
document print the phrase and round up — a schedule that means two different things in two
places and says so in its own words, with both readings asserted side by side in one test file.
The two cities also mark the boundary of plan-review modelling that New Jersey opened: Newark's
20% is credited back, Albuquerque's 65% is charged in addition, and Las Cruces's 25% is neither —
it is "the first 25% **of**" the fee, so no rule adds it and the page shows the payment split
instead. Three cities, three relationships between a plan review and a permit, each decided by
four words of the source.

**Wisconsin's contribution is a schedule that looks like one table and is three laws.**
Madison enforces three fee sections — MGO 29.09 (building), 18.09 (plumbing) and 19.11
(electrical) — recreated together by ORD-21-00024/25/26 and effective together on 2021-03-27,
and the Building Inspection Division publishes all three as a single four-column chart with a
Total. The chapters were written to match: identical use groups, an identical $25.00 minimum,
the identical 50% shell reduction, and an identical Group IV that stops measuring area and
starts counting work — $11.00 per $1,000 of alteration value, $25.00 for the first ten
openings then $1.00 each, $8.00 a plumbing fixture. Because the groups cross occupancy (an
apartment building is Group I, a hotel is Group II), no `occupancy` label derives them, so the
permit asks for `custom.fee_group` and that fact doubles as the switch between the new-work and
Group IV regimes — the same switch the ordinances use when they define the groups as "new
construction and any additions" against "all alterations and repairs to existing structures".
Two things came out of it worth keeping. First, a live disagreement between the city's own
texts: MGO 18.09 enacts `$.10` for plumbing Group II while the fee page prints `$.11` and
builds its Total column from `.11` — charged at the enacted figure, with the page's named
beside it and recorded as `disputed` rather than smoothed over. Second, a reminder that a
`currency_per_unit` rate in this engine is **cents** per unit of the basis: Madison's `$.10`
is `{ 10, 1 }`, and storing it as a fraction of a dollar charges a tenth of a cent a square
foot and silently floors every permit at $25.00 — a wrong number that still looks plausible.
Finally, Wisconsin is the first state where the money that reaches this site is only the
City's: the DSPS State Seal fee and the SPS 302.31-3 / 302.64-1 tables sit on the same plan
review rows, and `docs.legis.wisconsin.gov` answered no request from the research
environment, so those figures are named on every page that collects them and never guessed.

**New York's contribution is that the row, not the rate, is the fee.** Table 28-112.2 of the
Administrative Code carries thirty-nine rows, and an alteration's price is decided by two facts
before a cent is known — the building's size (under seven stories and 100,000 square feet or
not) and whether at least half the units of a large R-2 are publicly affordable — with a third,
the Alteration Type, picking the minimum filing fee inside the row, from $130.00 to $290.00.
Three rates then run off one shape: $2.60, $10.30 and $17.75 for each $1,000 or fraction. Two
readings the model depends on were settled by documents rather than by argument: the base *is*
the Alteration Type's own minimum — DOB's LAA charts print $130.00 through $5,000 and then
steps of exactly $2.60, which is a formula rather than a floor — and plumbing has no schedule
at all, being charged through those same rows with the Limited Alteration Application as its
minor-work route. Those charts are also the check no other jurisdiction has: four printed
lines of each of the two DOB sheets are asserted against the engine's own output, so the
Department and the code are compared in public rather than in prose.

Three absences are recorded as findings rather than as gaps: no plan review percentage, no
technology fee and no state or county surcharge appears anywhere in the City's text — a search
for each phrase comes back empty, which is the opposite of every state before this one, and
`componentType` across all 38 of the city's rules is asserted to contain nothing but `base`
and `other`. And New York is the first jurisdiction whose trade fees are set by a *rule*
rather than by the fee table: §28-112.2.2 sends electrical work to "department rules", and
1 RCNY §101-03 — figures that appear only in the original text effective 1 July 2008 — answers
with $40 to file, ten free units and $0.25 each after them, five service-switch bands, the
$15.00 minor-work permit, and the $45/$165 records fee that rides every building and plumbing
application. The environment left one lesson of its own: the codifier that served the table
began answering with HTTP 403 partway through the pass, which is New Jersey's lesson played in
reverse — where Newark's city site was unreadable and the codifier was the route, New York
City's codifier closed and the City Clerk's own printing of the law (Local Law 77 of 2023,
extracted twice because a page break splits the rows) became the primary for every amount,
with the codifier's amendment history still the dating evidence for when they took effect.

**Buffalo's contribution is two schedules that never answer the same input — and a city that
checks its own arithmetic.** The Department publishes two building sheets, and they are not
different columns of one table: the residential sheet covers detached 1- and 2-family dwellings
and has no valuation table at all (new dwellings by flat area bands, alterations at $5 per
$1,000 with a $50 floor), while the commercial sheet covers everything else and prices off a
mean construction cost at $8 per $1,000 with $100 minimum beside $0.75 per $1,000 of plan
review — so `custom.one_two_family` is the switch, asserted so both sheets cannot answer one
input. The round-up question resolves differently on each sheet **in the sheets' own words**:
the commercial line prints "or portion thereof" and both of its worked examples round the cost
to a whole $1,000 before multiplying — so Example 1 ($3,741,600 → $50.00 + $2,806.50 +
$29,936.00 = $32,792.50) and Example 2 ($945,496 → $8,377.50) are reproduced cent for cent in
the tests, which makes this the second jurisdiction whose published examples are the
arithmetic check — and the residential $5 row, which prints no such phrase, prorates, asserted
at $12,001 → $60.01 beside the commercial round-up. Two smaller firsts: the electrical area
rows are the engine's `rateTables` product done properly — Schedule A's own constant as the
rule's `rateMultiplier` and Schedule B's occupancy table as the keyed lookup, so the thirteen
printed multipliers are stored as the table they are **including its three blanks** (I-2, I-3
and I-4 print no multiplier, and those occupancies are priced by nothing rather than by an
guessed rate); and the plumbing page is the first price list where no valuation is a fee basis
at all — "used for record-keeping purposes and does not replace the required permit fees" — so
its fees are made only of counts, fixtures and linear feet of underground pipe in 100-foot
segments, the rung the engine's `linear_feet` kind was added for. The pass also kept two
disagreements rather than resolving them: the fee-schedule hub still prints "effective July 29,
2014" against PDFs stamped EFFECTIVE 7/1/2025 (the dated instruments win, the stale sentence
stays recorded), and the City Code itself answered 403 through ecode360, so the Department's
own sheets — what an applicant pays against — are the sources for every figure.

**Pennsylvania's contribution is a fee that is credited rather than charged.** Philadelphia's
service pages all print the same two sentences about the filing fee — "nonrefundable" and
"applied towards the final permit fee" — and that pair is a mechanism, not a line item: money
paid at submission that can never come back and is counted toward what you owe makes the filing
fee a **floor on the permit fee**, so the rule charges only the shortfall and adds nothing once
the permit fee passes it ($25 for a one-or-two-family dwelling, $100 otherwise, $100 flat for
electrical and plumbing; the same construction Manchester already used, now in three permits at
once). It also makes Philadelphia's own published `$63` electrical minimum unreachable as a
final figure — the `$100` floor already exceeds it — and it lifts a `$31` water-heater permit to
`$100` without charging the filer `$131`, which is the kind of interaction a flat table cannot
express and a calculator has to. Around that floor sit three different mechanisms in one
jurisdiction: building priced in square-footage bands ("$253 for the first 500 sq. ft.; plus
$73 for each additional 100 sq. ft. or fraction thereof") with a flat `$1,328` residential
column that no occupancy label derives — the columns are "Residential (1 or 2 family)" against
"Other Occupancies", a building type, so `custom.single_or_two_family` is the switch — electrical
at `$25` per `$1,000` or fraction of estimated cost, and plumbing in seven-fixture blocks with a
residential exception on every category. Two records round it out. Philadelphia is the first
jurisdiction whose schedule is set by **CPI arithmetic rather than by legislative vote**: L&I
multiplies the July 1, 2017 fee by a published multiplier under §§6-301, 9-102 and 4-A-901.15,
and the chain from the superseded 16.1% schedule checks at ×1.0896 row for row (`$232 → $253`,
`$1,219 → $1,328`), which is an arithmetic confirmation that the document modelled is the one
in force. And it is the first jurisdiction that publishes a **maximum on the permit fee itself**
— `$18,975` on electrical — so a ceiling that every other schedule leaves open is a figure here,
modelled as the rule's own `maximumCents` rather than as an assumption. The pass also left two
open questions recorded rather than resolved: the origin of the `$4.50` State surcharge (every
page charges it, no page cites a statute, and neither PG_012 nor the regulation contains it) and
which administrative row the already-published 2026-10-01 revision moves from `$75` to `$300` —
the revision was diffed in full, changes no modelled rate, and is therefore a source with its
own `effectiveFrom` rather than a second rule set.

**Pittsburgh's contribution is one number instead of three.** Where Philadelphia priced three
trades three ways, Pittsburgh prices every construction permit — building, electrical, mechanical —
off total construction value times a rate per $1,000, clamped: `$6.00` with `$130–$8,000`
residential, `$7.00` with `$605–$95,000` commercial. Two readings the schedule alone does not
settle were resolved by the City's own calculator, whose HTML source carries the arithmetic as
code. It prints no "or fraction thereof" anywhere in the block and multiplies straight through
(`con_value_validated * .006`), so `$25,100` is `$150.60` rather than the `$156` a round-up would
charge — modelled prorated, the exact opposite reading of Las Cruces's fee table in the same
engine. And the clamp lands on the multiplied figure, which the calculator proves by labelling its
own outputs "PLI Minimum Fee Applies" / "PLI Maximum Fee Applies". The 2025 predecessor was diffed
rather than assumed: every residential row byte-identical, commercial ceiling `$80,000 → $95,000`.
Two mechanisms keep this from being a transcription. The **technology fee's bracket is selected by
the base fee itself** ($2 / $5 / $15 / $25 keyed on the *clamped* base, so a `$130` permit still
pays `$2.00`), which is a table read off another component's output — and on the electrical page it
collides with the one published figure that *reduces* a total: the 15% Third Party Agency discount
PLI requires on commercial electrical permits, folded into that row as `$5.95` per `$1,000` with
the clamps scaled to `$514.25` and `$80,750`, because scaling by 0.85 and clamping commute for a
positive scale and the engine has no negative component. The bracket's own interaction with the
discount is recorded as `needs_review` rather than smoothed over, and the calculator — dated
1-3-2025 and still holding the old `$80,000` ceiling — is cited for arithmetic only, never for an
amount. Three absences are named instead of filled: plumbing is Allegheny County Health
Department's ("not the City"), which is why the third page is mechanical rather than plumbing;
zoning fees stay on City Planning's schedule even though the Building and Development Application
has bundled the approval since June 2024; and the 40% non-refundable application share printed on
every base row is a payment schedule, so it is named on every page and never summed.

**North Dakota's contribution is the round-up phrase deciding a whole state, in both
directions.** Two cities, two sheets, and one phrase: Fargo prints "or fraction thereof" in
every band after the first on both building sheets and rounds up ($1,001 of residential
valuation pays the $50 first thousand and a whole $5.56 step for the $1 of fraction;
$1,500 of commercial pays one whole $12.75 step rather than a prorated $6.38), while
Bismarck's sheets never print it and prorate ($2,500 of job cost is $67.75 + $4.20 =
$71.95 where a whole-thousand reading would be $76.15) — the same engine, the same
phrase-detection reading, asserted side by side in two test files a day's drive apart.
Both ladders close at every seam to the cent, and Fargo's is the first ladder in the
dataset whose own arithmetic is *discontinuous*: band 3 computes $578.50 at $50,000 of
valuation while band 4 prints its base as $578.75 — a 25-cent jump the sheet itself
contains, charged as printed and asserted from both sides, the same way Las Cruces's $100
jump is kept. Bismarck then supplied the shape that makes the reading testable: its two
building sheets print *numerically identical* eight-band tables, so the ladder is one
rule set answering both construction classes — verified by charging each class at several
valuations and requiring the same number — and the class switch does exactly the one job
the sheets differ on, the commercial sheet's "Review Fee of 20% … added to all Commercial
Building Permits", unconditional because the sentence conditions it on nothing, with no
application fee on either sheet for the percentage to have swallowed. That makes four
relationships between a plan review and a permit, each decided by the source's own words:
Newark's 20% is credited back, Albuquerque's 65% is charged in addition, Las Cruces's 25%
is "the first 25% **of**" so no rule adds it, and Fargo's 20% is gated on the sheet's own
"when a plan review is required" while Bismarck's is gated on nothing at all. The pass
also produced the dataset's cleanest proof by absence: Fargo publishes no electrical fee
anywhere, and its own fee-schedule index — five linked schedules, no electrical entry —
plus the self-wire page's sentence that "NDSEB will bill applicable fees to the homeowner"
is the citation, so the electrical page is built from the state board's two job-cost bands
(with their exact $440.00 seam and $50 late-certificate increase) as `state_surcharge`
rather than from an invented city figure. Two document facts are kept rather than cleaned:
Bismarck's printed typos, "$50,0001.00" and "$$4.20", read as the figures their own
arithmetic confirms, and its Permit Fees hub still saying "Effective January 1, 2020"
while linking the 2025 residential sheet — the third stale hub date after Buffalo's 2014
sentence, recorded the same way.

**Massachusetts' contribution is two cities three miles apart reading the same rate
differently, on the strength of a printed phrase.** Boston's ISD sheet charges $10.00 per
$1,000 of estimated cost on every building row and never prints "or fraction thereof", so
$47,550 pays $475.50 of rate; Cambridge's Building Fees page prints the phrase four times
and rounds up, so $18,750 buys nineteen whole steps — the same engine, both readings
asserted side by side in the two test files, neither able to drift into the other. Boston
supplied the dataset's first schedule that is a *handout* rather than a code table — two
pages, a department block footed on both, a "Rev. 2021" stamp and no effective date — and
the first whose live permit pages confirm the handout line for line, four rows with the
same two numbers in both texts, which also exposed the one place they disagree: the PDF's
"$.75 amp up to 480 Volts" against the web's "$0.75/amp over 480 volts", charged as one
band above 240 volts so no voltage is left unpriced and the disagreement printed rather
than reconciled. Its electrical sheet branches three ways in the sheet's own words —
amperage when the service changes, devices when it does not, cost where neither applies —
and exactly one branch answers, the dataset's clearest instance of mutually exclusive
rules with a catch-all. Cambridge supplied the mirror readings: its Exemption line is a
$15.00 *rate* for buildings of three residential units or less — a waiver in name only,
the standard rule written as its negation so an absent unit count charges rather than
exempts — its electrical page is a price list whose rows stack with no branch language at
all (a service and four receptacles pay both), its plumbing is a $50.00 block with a
five-fixture allowance where Boston charges $5.00 a fixture from the first, and its one
plan-review cell is a garbled export — "$100 included in building permit fee$50.00", one
cell, two amounts, no legend — quoted verbatim rather than charged. Neither city dates its
schedule: Boston's carries only the Rev. 2021 stamp, Cambridge's pages print no date at
all and the only dated instrument found (DPW's January 1, 2024 announcement) names no ISD
row, so both carry the read date and the announcement is held as a source so the
possibility stays visible. Massachusetts levies nothing of its own on a local permit, the
first state in the dataset where the absence of a state surcharge is itself the finding.

**Wisconsin's second jurisdiction is the dataset's matrix jurisdiction, chosen after the
market pick proved unreadable.** Milwaukee — the obvious second city — returns HTTP 403
through its WAF on every URL including its own static PDFs, the same wall that stopped
Kenosha and, earlier, Atlanta, so the verifiability gate sent the pass to Green Bay, whose
consolidated ordinance-keyed fee schedule carries a real enactment date: the column is
headed "2026 Fee" and the City's own permit-guides page says the fees "go into effect
January 1, 2026" — the first schedule in the dataset dated by its City's web page rather
than by a read date or a stamp. Green Bay's shape is one schedule, four trades, every
trade split three ways by what the building is — one- and two-family, multi-family,
commercial — the same classes the City's electrical application prints as occupancy boxes,
which makes the class a fact the reader supplies; the residential rate is written as the
catch-all so an unstated class charges rather than vanishes. Two rows are dataset firsts.
The fire suppression row publishes both a floor and a ceiling in its own parenthetical —
"$2.50 per head ($70.00 minimum, increased per head, up to $200.00)" — the first per-unit
row whose clamp is the schedule's own punctuation, charged as the rule's minimumCents and
maximumCents and asserted from both sides. And the commercial electrical section offers
two ways to price one job — area rates at $0.05/$0.09 a foot, or a project-cost ladder
from $100 to $600 reading the application's Value of work field — where the ladder
**replaces** the area rates rather than adding to them, gated on the basis the applicant
chose; the ladder's "+$100 per $100,000 above $300,000" line prints no "or fraction
thereof" and therefore prorates, the Bismarck phrase-detection reading applied one more
time. The document was read the hard way: -layout mispairs its columns exactly as Boston's
sheet did (water heater handed the lawn sprinkler amount, the commercial section offset by
a row), and only the table-mode extraction pairs every row cleanly — three extractions
run, and the amounts the City's pages restate agree across all of them. What the schedule
does not define is recorded as undefined: the commercial building groups 1 and 2 have no
published assignment rule, so the calculator asks which group the Division gave and an
application that states none charges nothing rather than being guessed at.

**Michigan's contribution is one state where the same words are read three ways.** Detroit
prices a nine-band ladder on project cost in which every band prints its own Base and its own
rate per $1,000 "or fraction thereof" — so the round-up phrase Fargo prints and Bismarck omits
decides Detroit too — and the bands **never chain**: at exactly $25,000 band 2 computes
$1,055.50 from its own printed base, and one cent later band 3 charges its own printed
$1,055.57 plus a whole $24.53 step, a 7-cent discontinuity the schedule itself contains,
asserted from both sides the way Fargo's 25-cent jump is. The ladder refuses one input
outright: demolition is priced by the cubic foot elsewhere in the same document ($143/$249 up
to 30,000 cu. ft., a wrecking fee on top, $8,858 with explosives), so a wrecking job is never
costed from a construction valuation. Grand Rapids then supplied a shape the engine had never
had to build: **two of its four building components are percentages of the fee itself.** Plan
review is `max($50, floor(units × $0.68))` in whole dollars — modelled as the chart's own 501
printed tiers, because no rate in any engine can floor to a dollar — and the zoning fee is 10%
of the application-plus-permit subtotal held between $25 and $290, so one component's amount is
computed from another's and every boundary ($50 giving way at the $74,001 row, $25.12 first
appearing at 29 units, the $290 cap binding from 419) is the chart's own, checked across all
500 rows. Its plan review is also one more relationship between a review and a permit, decided
by basis rather than by wording: 68¢ per $1,000 of *construction value*, floored at $50 and
charged on commercial projects only, so it never reads the permit fee at all and the
residential Total column omits it entirely. Both readings come from a document the City
publishes **twice** — the 500-row chart and the calculator's inline JavaScript — and the two
disagree twice: the calculator floors the partial thousand where the chart's rows charge it
whole ($1,013.20 against $1,020.00 for $150,001) and computes zoning as `floor(0.68 × units)`
where the chart adds the application fee's $5.40 ($101.00 against $106.72 at 149 units). So
the schedule is charged and each disagreement stays visible — Grand Rapids's zoning rule
carries its `needs_review` for exactly that — while plan review's two surfaces agree to the
cent, which is what proves that column is a formula rather than a transcription. Detroit closes
with a sentence Philadelphia's pages also print, read the other way: its $73 plumbing
application fee is "non-refundable" but *credited nowhere*, so it is a line rather than a
floor — the opposite mechanism from Philadelphia's "applied towards the final permit fee",
charged the opposite way in the same engine — and its own plan review arrives as three
published forms (7% of the trade permit prepaid, a deposit the schedule labels both 35% and
30%, revised plans $158 + $53 a sheet), named on every page and summed nowhere. The one
reading Detroit does not settle — whether the $66 electrical base fee is per permit or per
application — is its payload's `needs_review`, and `-layout` mispairs that 51-page schedule so
badly that the fee column loses its rows entirely: the same three-mode reconciliation
Scottsdale, Philadelphia and Boston needed, in a fourth form.

**Minnesota opens with Minneapolis, whose building schedule is the first in the dataset to
print its own formula and the first whose fee schedule is a spreadsheet.** The sheet's
first row is the whole mechanism — "Building Permit Fee + Plan Review Fee (65% x building
permit fee) + MN State Surcharge (Value of Work x 0.0005) = Total Permit Fee" — and the
nine-band ladder beneath it is marginal, every band "first $X plus $Y each additional
$1,000 and fraction thereof", with the sheet's own anchor ($2,001 of value is $104.20:
the printed base plus a whole $20.60 step for the single dollar) proving the fraction
round-up. The bands' bases are printed numbers, not derivable arithmetic — at the $25,000
seam the sheet prints $578.00 where the prior band's arithmetic lands $578.20, a two-cent
rounding the document itself contains, charged as printed — and band 2 is the one ladder
denominated in $100 steps. The two minimums disagree about the surcharge in their own
parentheses: building's "$84.20 (does not include State Surcharge)" and plumbing's
"$85.20 (Includes $1.00 State Surcharge)" are read literally, so the plumbing floor holds
the $1.00 inside it and the two can never double-count. Plumbing is a $41.40 price list
whose block rows all say "or fraction thereof" — per 10 stories, per 100 lineal feet, per
$500 — and the 100-foot row carries a fractional per-foot rate (41.4¢) that forced the
dataset's newest basis, `linear_feet`, into the engine. The electrical permit is not
Minneapolis's at all: Minnesota's Electrical Act (326B.37) gives the inspection to the
State or its contract inspectors, and the page prices DLI's own fee worksheets — $55
inspection trips, $165 dwelling units, $200/$400 minimums chosen by the worksheet's
largest-of rule — the Fargo/NDSEB authority boundary one state west. The schedules are
published Smartsheets embedded on City fee pages, readable as static HTML and stamped
"Last updated on February 27, 2026" — the City's own date, carried as the rules'
effectiveFrom because the sheets print none and say fees move "upon City Council
directive (or action)".

**Saint Paul completes Minnesota, and answers the question Minneapolis raised: in Saint Paul
the electrical permit is the City's own.** Minnesota's Electrical Act lets a municipality be
its own AHJ, and Saint Paul's DSI Electrical Inspection Department is: the trade hub links
six fee-bearing subpages, each with its own table — $85 a service and $15 a circuit with an
$85 minimum; $15 for each air conditioner, furnace or boiler installed (and $0 for one
installed with other electrical work and no new circuit); $54 a unit plus $1 a KVA for
capacitors, generators and transformers; $85 a panel and $2 a device for low voltage; $78 a
panel and $1.88 a device for fire alarm, against a $78 minimum where the rest of the trade
carries $85; and solar PV at $138 to 20 kW, $332 to 21-40 kW and $315 plus $3 a kW above
that. Every table ends with the same row — "Minimum State Surcharge $1.00" — which is
M.S. § 326B.148's own shape (one-half mill of the fee or $1, whichever is greater) rather
than a flat dollar. The building schedule is the dataset's first long closed table: 103
printed valuation rows, $100 wide to $2,000 and $1,000 wide to $100,000, which resolve to
four segments of one arithmetic — $36 + $5/$100, $106 + $21/$1,000, $591 + $15/$1,000, $972
+ $11/$1,000 — reproducing 111 of the 112 rows exactly. The three that are not exact are
named rather than smoothed: the sheet drops its $81,001–$82,000 and $83,001–$84,000 rows
entirely and prints $1,369 for $85,001–$86,000 where its own rate gives $1,368, and the
calculator charges the arithmetic because no row in that band has a base of its own. Above
$100,000 the sheet prints bases, and they step *down* — $1,499 at $100,001 against the $1,522
the closed table reaches at $100,000 — the same printed-seam rule Minneapolis's two cents
required. The surcharge is read from the statute itself, since the sheet defers: "Value
$1.00-$1,000 = $0.50", "$1,000,000 = 0.0005 x Job Value", "> $1,000,000 = see statute",
whose six bands are marginal rates that reproduce every seam ($500 at $1,000,000, $900 at
$2,000,000, $1,500 at $5,000,000) with the sheet's fifty cents as the floor. Plumbing is the
shortest table in the dataset — a $92 initial permit fee and four counts, $36 a plumbing
unit, $6 a water unit, $34 a gas unit and $15 per 100,000 BTU above the first — with no
minimum row at all. The building PDF dates itself ("Effective: 2/25/2023"); the electrical
and plumbing tables are undated pages inside the PAULIE platform that launched September
17, 2025, which is the date they carry.

**Tennessee opens with Nashville, whose building permit is the first in the dataset assembled
from four separately stated components.** The Codes Fee Schedule says so in its own first four
lines — "The total permit cost for a building permit includes: Zoning Examination Fee of $25 /
Building Valuation Fee: See below / Codes Tech Fee: 10% of the Building Valuation Fee /
Building Plan Review Fee: See below" — and each of the four reads a different thing. The
zoning fee is charged on every building permit; the valuation fee reads the job; the codes tech
fee reads the valuation fee; the plan review reads the permit fee. That last distinction is
the reason the zoning fee is carried as an `other` component rather than a base one: a fee that
is 10% of the valuation fee cannot be 10% of itself, and the tech fee has its own ordinance
(BL2022-1254) citing it. The commercial ladder prints bases that are not its own arithmetic in
three of four bands — $372.71 against $372.55, $651.38 against $651.21, and $2,326.84 against
$2,327.38, the dataset's first seam that steps *down* at the bottom of the ladder — and each is
charged as printed. Where the schedule is at its sharpest is the plan review: to $275,000 it is
"one-half of the building permit fee" (about $692.32 at the seam) and at $275,000.01 it is
$1,338.54 plus $0.18 a thousand — a 93% step for one dollar of valuation — with a third band
whose printed base of $2,181.82 sits $7.22 below where the band beneath it lands, and with
subsection G.2 exempting one- and two-family and townhouse permits from plans examination
altogether. Those dwellings pay a single $5.00 per $1,000, while multifamily is explicitly not
residential and takes the commercial branch. Plumbing and electrical are price lists with a $75
minimum each — $11 a fixture counted "whether or not the fixture is actually set", $32 a
building drain, $80 each for sewer and water service connections and septic systems, $43 a hot
water heater; $6.00 for ten or fewer outlets and $1.00 each beyond, $12.00 per meter, $75.00 or
$102.00 a service riser by occupancy — and the electrical page names the rows it does not price:
motors, ranges, heat by kilowatts and the panel ladder are all priced per item by the item's
rating class, a count-by-class shape this engine does not yet express. The schedule's own
penalty sits above all of it: unpermitted electrical work means "the permit fees shall be
tripled".

**Tennessee closes with Memphis, and the two cities make the state's own comparison.** Memphis
and unincorporated Shelby County share one fee schedule issued by the **Shelby County Office of
Construction Code Enforcement**, which permits Memphis, Arlington, Germantown, Lakeland,
Millington and the unincorporated county — so the second Tennessee jurisdiction is a county
instrument serving a city, the mirror of Nashville's consolidated city-county government, and
Metro Nashville's own Metro Codes. The details are in
[`tennessee/memphis.md`](./tennessee/memphis.md).

**Ohio completes with Cleveland and Toledo, and the pair splits on the first question the
engine asks: what is the fee a function of.** Cleveland's schedule is denominated in valuation
and Toledo's in floor area — `$60`/`$75` base plus `$0.20` a square foot with 100-square-foot
floors, plan review `$50`/`$75` plus `$0.03` — so two cities on the same lake can answer the
same `squareFootage` with different mechanisms and neither borrows the other's. Cleveland's own
ladder is four rows split at `$1,000,000`: residential `$10` then `$5` per `$1,000` or fraction
with `$150`/`$30` floors, and the Ohio Building Code column `$12`/`$7` crossing to `$15`/`$11`
at the same seam with `$12,000`/`$15,000` thresholds and `$300`/`$150` floors — the seam
charged as printed (`$12,000` against the `$12,007` the arithmetic beneath it lands on) and
asserted from both sides the way Fargo's and Detroit's seams are. Demolition there is floor
area, not value: `$10`/`$15` a thousand square feet with a `$50`/`$300` floor and the basement
excluded.

Both cities then supply a provenance lesson. Cleveland's department fee page describes
**itself** as "recreation," effective 2014-01-02, and it is the only place plan examination,
zoning (`$150`/`$30`/`$20`), site development, SWPPP, certificate of occupancy, late fees and
the festival trio appear — page-only figures whose self-description is carried beside every
figure they pay for, while the codified schedule (§3105.25, Ord. 708-10, effective 2010-08-20)
holds the ladder. Toledo's City website prints its two headline rates **swapped** against TMC
Ch. 1307 (Ord. 476-18, effective 2018-12-04) — prose at `$.20` plan review / `$.03` permit
where the code pairs them the other way — so the code's pairing is charged and the swap is
documented three ways rather than reconciled. Toledo also publishes the cleanest self-check
any City page has offered: its Commercial Building Alteration page works
`$1,075 + $225 + $39 + $75 = $1,414.00`, reproduced cent for cent in the tests, and that
example is what settles §1307.13's "1%/3% of total" — it sums plan review and permit and leaves
the certificate of occupancy outside, so the surcharge's base is read from the City's own
arithmetic rather than from an ambiguous noun.

Two walls and one unreachable statute. Cleveland's codifier 403s every scripted request and
was read in the browser; Toledo's sits behind Cloudflare and was read section by section the
same way; and Ohio's own Revised Code §3781.10 — the State's one-percent itemised surcharge —
answered **no** route this environment could construct (the code library, the legislature,
Justia, FindLaw, the Archive), so the surcharge rides residential permits and plan exams from
the wording the City's own instruments quote, with the access failure recorded on the page
instead of a fetch that never happened.

Conflicts are kept, never averaged. Cleveland's potable-water plumbing row is `$50` in the
ordinance and `$13` on the department page — charged `$50`, both figures named — and the
electrical sheet's own "Use (1) or (2)" makes its area rows and its item rows mutually
exclusive, gated so exactly one answers a job. Toledo's demolition ladder prices cubic feet in
three bands (`$253` at 50,001 cubic feet, with the excess-base alternative recorded
unresolved), its electrical amperage runs once and never on the schedule's own self-service
rows, and what neither city prices in dollars — motors by horsepower, generators by kilowatts,
tents and tanks by count, Ch. 1319, the `$103` amendment figure the code puts at `$100` — is
listed as not modelled rather than filled in.

Indiana arrives with its two jurisdictions facing opposite ways on the one question that decides
every model in this dataset: *what does the schedule read?* South Bend reads a **valuation** —
`CSF × TSF × .00098`, where the ICC building valuation table supplies the cost per square foot
— and, for alterations, a **hundred-row cost ladder** whose every printed row its own arithmetic
reproduces. Indianapolis reads **no value at all**: nine structural subtypes and a square
footage, one figure per craft subtype, one fixture count in the whole workbook. Put together
they are the two ends of the same axis, and neither could have been derived from the other.

Indianapolis is also the first instrument here that is not a document a person would print. It
is a **spreadsheet**, and the format is the mechanism: read cell by cell, its Permits sheet says
in its own header row what the PDFs elsewhere only imply — `Application Fee | Review Fee |
Issuance Fee` — and every Structural Permit row fills all three while every craft row fills only
the first. The workbook's `$40` per structural application then turns out to be an ordinance
section rather than a rounding: **536-619**, raised from `$32` on 1/5/2026, which is exactly why
the improvement-location and floodplain rows on the same sheet still carry `$32` and why no
single rate card can represent the schedule. The adopted ordinance behind it prints every
section's old figure beside its new one, and the same document places the `$250` **536-609**
administrative fee that every worksheet's header block prints — assessed on a permit that has
not been closed, and therefore stated as a requirement rather than charged to everyone who
applies.

Two of the workbook's own cells are defective and are named rather than smoothed: the
new-primary-structure issuance cell prints a stray `2,000 sqft` in the middle of a bracket and a
rate, and the accessory row's bracket opens at 200 square feet where every other cell opens at
one. Neither is a modelling choice; both are the document, and both are on the page. And one
row prints a figure with no unit at all — `Self-Certification Tags … 22` — so the calculator
charges it once under its own subtype and says so, rather than inventing the count the schedule
declined to name.

The pass also produced the second and third places where a **block rate had to be divided by its
block**. South Bend prices a fire-protection sprinkler system at `$60.00 up to 30 heads` plus
`$8.00 for each additional 10 heads`, and Indianapolis prices commercial plumbing at `$182` for
ten fixtures plus `$23` for each additional five. Read as a per-unit rate either one overcharges
by the size of its block — $140.00 for 31 sprinkler heads instead of $68.00, $412.00 for sixteen
fixtures instead of $228.00 — so both are stated as the block rate divided by the block, inside
the block-sized increment, which is the only form in which either row reproduces by hand.

One methodological note belongs to South Bend and matters beyond it. The fee schedule's
**plumbing page is mis-paired by two of the four `pdftotext` modes** available here — `-layout`
and `-fixed` shift the amount column by one row, turning a `$6.00` lawn-sprinkler row into
`$60.00` and swapping building-water's `$12.00/$25.00` for `$7.00/$10.00` — while `-raw` and
`-simple` agree with each other and with the page. Two readings against two is what settled it,
and the disagreement is recorded on the published page rather than left in the research file:
a reader who opens the same PDF in a different tool will see the other numbers, and should be
told why. (A third document, Fort Wayne's Allen County schedule, was reachable but turned out to
be **scanned** — nine pages of images with no font resources, so `pdftotext` returns nine blank
pages and no rate can be read without OCR. It is recorded in [`indiana/README.md`](./indiana/README.md)
rather than transcribed off a picture.)
