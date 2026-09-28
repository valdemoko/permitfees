# Portland, Oregon — research record

First jurisdiction of pass 10, published beside unincorporated Multnomah County. Read
2026-09-24. Portland is the first jurisdiction on this site where **the city issues
another jurisdiction's permits**, and the first where a fee table is identical in two
documents and only a second table separates the two prices.

## 0. Sources

| # | Document | URL | Read |
|---|---|---|---|
| S1 | **Building and Other Permits Fee Schedule, City of Portland**, effective July 10, 2026 | `portland.gov/ppd/documents/building-and-other-permits-fee-schedule-city-portland-effective-july-10-2026/download` | three `pdftotext` modes compared; eleven pages; sha256 begins `1f61bb394035119e` |
| S2 | **Electrical Permit Fee Schedule, City of Portland**, effective July 10, 2026 | `portland.gov/ppd/documents/electrical-permit-fee-schedule-city-portland-effective-july-10-2026/download` | three modes; three pages; sha256 begins `934b553c3f27` |
| S3 | **Plumbing Permit Fee Schedule, City of Portland**, effective July 10, 2026 | `portland.gov/ppd/documents/plumbing-permit-fee-schedule-city-portland-effective-july-10-2026/download` | three modes; four pages; sha256 begins `7388a9804250` |
| S4 | **OAR 918-050-0100**, Statewide Fee Methodologies for Residential and Commercial Permits | `secure.sos.state.or.us/oard/view.action?ruleNumber=918-050-0100` | read live from the Secretary of State's current-rules database |
| S5 | **State of Oregon Permit Surcharge Fee**, Building Codes Division backgrounder | `oregon.gov/bcd/jurisdictions/Documents/surcharge-backgrounder.pdf` | full text read |

All three fee schedules print the same line on their title page: *"Effective Date: July
10, 2026"*. A **mechanical** schedule exists under S1's host for the same date; it is not
modelled here, for the reason the other states' mechanical schedules are not modelled
either, and the absence is stated on the pages rather than left as a silence.

## 1. The finding: one department, two schedules, one fee table

**Portland Permitting & Development is a City bureau that also issues building,
electrical and plumbing permits for unincorporated Multnomah County**, publishing a
separate schedule under the county's name for each trade. That is the whole shape of this
state, and it decides the modelling:

* The two jurisdictions' **Building Permit Fee** tables are *identical* — same $167.00
  minimum, same $3.59 per additional $100 in the first band, same seams at $220.85,
  $540.78, $797.28 and $1,137.78. This was established by comparing the two documents'
  full text, not by reading both and believing them.
* The **electrical and plumbing schedules match in every dollar amount**. Checked the
  only way that means anything: every `$X.XX` string was extracted from each pair of
  documents and the two *sorted multisets* diffed. Both diffs were empty.
* What differs is a **table**, not a rate. The City's document carries two **Development
  Services Fee** tables (Commercial and Residential) that the county's document does not
  contain at all, and the City's two demolition rows are $334.00 higher on each.

The two payloads are therefore built from the **same rule factories** in
`src/content/portland/fee-rules.ts` with a different source id, so the two pages cannot
drift apart, and a test compares the two rule sets by code and by config.

## 2. The building permit fee: five bands, every seam closed

| Valuation | Fee | Printed as |
|---|---|---|
| $1 – $500 | **$167.00** | "Minimum Fee — $167.00" |
| $501 – $2,000 | $167.00 + $3.59 each additional **$100** | "For each additional $100 or fraction thereof up to and including $2,000" |
| $2,001 – $25,000 | $220.85 + $13.91 per $1,000 | |
| $25,001 – $50,000 | $540.78 + $10.26 per $1,000 | |
| $50,001 – $100,000 | $797.28 + $6.81 per $1,000 | |
| $100,001 + | $1,137.78 + $5.63 per $1,000 | |

Two things are worth recording. The first band **counts in hundreds** where every other
band counts in thousands, which is why its rate is carried as $35.90 per $1,000 against a
$100 increment; that is what makes it land exactly on the second band's opening figure.
And **all four seams close to the cent** — $220.85, $540.78, $797.28, $1,137.78 — which
was checked by computing with the rules at each boundary and comparing against the figure
the next band prints. Every one of them is asserted in
`tests/content/portland-seed.test.ts` and recomputed from PostgreSQL in `npm run db:verify`.

## 3. The Development Services Fee: the City's own second table

Two five-band tables, Commercial and Residential, charged on **the same valuation** as
the building permit fee, and in the schedule's own words applied *"to all Building Permits,
Site Development Permits (except where work involves only clearing) and Zoning Permits"*.

| Valuation | Commercial | Residential |
|---|---|---|
| $50,000 | $26.49 + $1.16 each $100 **or fraction** after $50,000 | $21.19 + $0.97 |
| $200,000 | $4.65 — band 2 opens at $44.79 | $35.74 — closes exactly |
| $250,000 | $4.79 + $0.469 per $100 = $650.91 | $3.574 + $0.374 = $523.01 |
| $500,000 | $1,140.91 | — |
| $1,000,000 | $2,120.91 | — |
| $5,000,000 | $9,960.91 | — |

**The commercial table does not close at its own first seam.** At $2,000 the band
produces $26.49 + 15 × $1.16 = **$43.89**, while band 2 opens at **$44.79** — ninety
cents that exist in the City's own document. The residential table's first seam *does*
close, at $35.74. Both facts are asserted in the tests and stated on the page, and the
$0.90 is reported rather than smoothed away, the same way Clark County's four cents and
Denver's dollar are reported.

**This table is the entire difference between the two jurisdictions on ordinary work.**
On a $250,000 commercial project the City's Development Services Fee is $650.91, which is
exactly the difference between the county's $3,508.63 and the City's $4,159.54.

## 4. Plan review: two percentages in one jurisdiction

* **Building: 65% of the building permit fee** — the City's fuller wording is *"For the
  original submittal — 65% of the building permit fee, maximum of 2 allowable
  checksheets"*, and the county's schedule prints the same percentage as one line.
* **Trades: 25% of the permit fee** — a different percentage, printed in the electrical
  and plumbing schedules.

The percentage reads the **permit fee**, not the total, so plan review on a $250,000
project is $1,288.48 inside the city and in the county alike, even though the county
charges less overall. That is the reason the 12% state surcharge is modelled on
`permit_fee` rather than on the finished total: the plan review is itself a percentage of
the permit fee, so a percentage of the two together would be a percentage of a
percentage. Both readings are stated with their dollar difference on the page
($237.87 as modelled, $470.60 on the total — an alternative that is $232.73 more).

**A slip in the City's own document.** The plumbing schedule's plan review row prints
*"25% of total **mechanical** permit fee"*. It is read as 25% of the *plumbing* permit
fee — the row is a plan review stated inside a plumbing permit fee schedule — and the
slip is recorded here and on the page rather than silently corrected.

## 5. The state's part: valuation and a 12% surcharge

Two things on every one of these permits are not the municipality's decision.

**Valuation — OAR 918-050-0100**, read live from the Secretary of State's current-rules
database rather than from the City's paraphrase. The rule sets the method statewide:

* the **ICC Building Valuation Data Table current as of April 1** multiplied by square
  footage;
* a commercial project pays on *"the greater of"* that figure or the applicant's stated
  value — a tie-break no other jurisdiction on this site publishes;
* a **plumbing permit for a new house is priced by the number of baths, from one to
  three**, rather than by fixtures;
* the first **100 feet** of water and sewer lines are included, with no charge;
* *"the plan review fee shall be based on a predetermined percentage of the permit fee
  set by the municipality"* — which is where the 65% and the 25% get their authority.

**The surcharge — ORS 455.210(4)**, via the Building Codes Division's backgrounder: four
statutory surcharges totalling **12%**, being 4% for state administrative costs, 2% for
state inspection costs, up to 1% for administering the state building code, and 4% for the
electronic building codes information system. The Division states it *"is applied to all
building permit types issued in the State of Oregon"*, and the backgrounder's own list
includes mechanical and electrical services. It is charged here on the **permit fee**;
both readings are published.

## 6. Electrical: two rows that depend on the rest of the permit

The schedule is printed identically by the City and the County.

| Row | Fee |
|---|---|
| Service, 200 A | $212.00 |
| Service, 201–400 A | $298.00 |
| Service, 401–600 A | $391.00 |
| Service, 601–1,000 A | $588.00 |
| Service, over 1,000 A | $1,077.00 |
| Reconnect | $190.00 |
| Renewable systems, up to 25 kVA | $212.00 / $298.00 / $391.00 by service size |
| Temporary service | $187.00 / $283.00 / $356.00 |
| **Branch circuit** | **$21.00 each** where a service or feeder fee was also paid; **$174.00 for the first** and $21.00 each after where none was |
| Miscellaneous | $161.00 |
| Borderline neon | $309.00 per elevation |
| Wall washing | $1.23 per square foot |
| **Residential square-foot package** | **$408.00** for the first 1,000 sq ft **+ $93.00 per additional 500 sq ft or portion** |
| Appeal | $346.00 one- and two-family · $721.00 other |

The branch-circuit pair is the row this release exists to get right: **the same circuit
costs $21.00 or $174.00 depending on what else is on the permit.** That is why the rules
are gated on the item selected rather than on the circuit count alone — the same discipline
Seattle's D-15 rows required, in a different state and for a different reason.

The residential package is charged as a **percentage of a rounded area**, not a per-unit
rate, because *"or portion thereof"* is what makes it different from a rate. At 1,000 sq ft
it is $408.00 and at 1,001 it is **$501.00**, not $408.19; at 1,700 it is $594.00; at 2,001
it is $687.00. The increments are asserted in the tests.

## 7. Plumbing: a new house is priced by baths

* **New one- or two-family dwelling**: **$792.00** for one bath, **$1,187.00** for two,
  **$1,388.00** for three, plus **$334.00** for each additional bath **or kitchen**.
  *"Includes 100 feet for each utility connection"* — the state rule's inclusion, printed
  in the schedule.
* **Everything else**: **$63.00 per fixture or item** across more than thirty named rows.
* Site utilities $63.00 / $144.00; exterior lines $180.00 for the first 100 feet plus
  $137.00 per additional 100; residential water line replacement $128.00 first floor plus
  $52.00 per floor; sewer cap $159.00; solar $139.00; storm tank $162.00.

The bath method is not a municipal choice — OAR 918-050-0100 requires it — and the page
says so, because a reader comparing Portland with a fixture-priced city would otherwise
conclude the schedules disagree about houses rather than about methods.

## 8. What was built

* `src/content/portland/fee-rules.ts` — the five building bands, the 65% review, the two
  Development Services tables, the 12% surcharge, and the electrical and plumbing rows.
  Exported as factories (`buildingPermitFeeRules(sourceId)`, `electricalRules(sourceId)`,
  …) so both jurisdictions instantiate the same rules.
* `src/content/portland/index.ts` — three permit pages (building, electrical, plumbing),
  five sources, six requirements, fourteen verifications, and one `mechanical` permit type
  recorded without a page.
* `src/content/multnomahcounty/index.ts` — the same three pages for the unincorporated
  county, pointing at the county's own six documents.
* `tests/content/portland-seed.test.ts` (36 tests) and
  `tests/content/multnomah-seed.test.ts` (17 tests), each including a comparison of the two
  jurisdictions' rule configs so neither can drift.

**Worked examples, computed by the engine before the prose was written:**

| Page | Inputs | Total |
|---|---|---|
| Building | $250,000 commercial | **$4,159.54** ($1,982.28 + $650.91 + $1,288.48 + $237.87) |
| Building — residential | $250,000 | $4,031.64 (Development Services $523.01) |
| Electrical | 200 A service + 6 circuits | **$463.06** ($212.00 + $126.00 + $84.50 + $40.56) |
| Electrical — no service | 6 circuits | $382.23 ($174.00 + $105.00 + $69.75 + $33.48) |
| Electrical — package | 1,700 sq ft residential | $813.78 ($594.00 + $148.50 + $71.28) |
| Plumbing | new dwelling, 2 baths | **$1,626.19** ($1,187.00 + $296.75 + $142.44) |
| Plumbing | 4 fixtures | $345.24 ($252.00 + $63.00 + $30.24) |

## 9. Engine changes, and one bug this pass found

**Two additions, both generic:**

1. **`thresholdCents` on `percent`.** The residential square-foot electrical package is
  *"$408.00 for the first 1,000 square feet plus $93.00 per additional 500 or portion
  thereof"* — a fixed amount for the first block of a measured basis, then a rate on the
  excess, rounded up to whole blocks. `per_thousand` already had a threshold; `percent`
  did not, and without it the row would have charged the first 1,000 square feet at the
  rate as well. See `CALCULATION_ENGINE.md` §19.
2. **A `bathrooms` per-unit kind.** One- and two-family dwellings are counted in **baths
  and kitchens**, and the same document counts **fixtures** at $63.00 for everything else.
  Two counts, one schedule, and sharing one kind would let a four-fixture job be billed as
  four baths.

Four smaller corrections were made in the same pass, because these pages exposed them as
already wrong elsewhere on the site:

* **`fee_subtotal` was not formatted as money.** `isMoneyBasis` now covers `valuation`,
  `permit_fee` and `fee_subtotal`, so Seattle's technology fee renders `$1,498.40` rather
  than `149840`.
* **`describePerUnit` mis-described an included allowance** where the allowance was zero:
  Houston, King County and Seattle already published *"the first 0 fixtures is included in
  the permit fee, then $27.00 for each additional fixture"*. It now reads *"$137.00 plus
  $27.00 per fixture"* when there is a base charge.
* **Prose in three published payloads was escaped rather than real.** Westminster, King
  County and Seattle stored `\n\n` as literal characters, so the pages rendered
  `\n\n` in the browser and each page's prose as one block. The cause was writing the
  payloads with escaped separators; the fix collapsed every runaway backslash run, and
  `tests/content/prose-rendering.test.ts` now iterates `ALL_SEEDS` — it previously listed
  six seeds by hand, which is why the three broken ones were never checked — and forbids
  `\[ntu]` anywhere in the prose.
* **The lead never went through the prose parser at all.** A page's lead is set as a
  standfirst rather than as body copy, so the page header renders it itself — and it was
  rendering the stored string directly. Every lead written with `**emphasis**` in it
  therefore showed literal asterisks in the first sentence a reader meets: **fifteen** lead
  blocks across twelve jurisdictions, being the whole of Washington's, King County's,
  Portland's and the county's permit intros and three hub summaries. `splitLead` now also
  refuses to cut a pair in half, and the guard is `tests/lib/lead-text.test.ts`, which
  renders the component over every lead on the site — no DOM needed, because a React
  component is a function and its result is a tree of plain objects. That is the only kind
  of test that could have caught it: the stored strings were correct in every case.

## 10. Open questions

1. **Whether the Development Services Fee applies to a building permit's *revision*.**
   The table says it applies to building, site development and zoning permits; nothing
   says what happens on a second submittal, and nothing is charged.
2. **Which valuation a trade permit declares.** OAR 918-050-0100 defines the method for
   the building permit and for a new dwelling's plumbing; the electrical schedule's own
   residential package is priced by **area** instead, and a commercial electrical permit's
   valuation basis is not stated in the schedule.
3. **Whether the $167.00 re-inspection fee is inside or in addition to a band's included
   inspections.** The table caps included inspections at three in its smallest band and
   seven in the band below the top, and the fee is stated on the page rather than modelled.
4. **The plan-review row's "mechanical" wording** in the plumbing schedule (§4) is read as
   a copy-and-paste slip. It is stated as a reading, not as a finding.
5. **Mechanical** is priced by a schedule of the same effective date and is not modelled
   in this release; the state surcharge's application to mechanical permits is quoted from
   the Division's backgrounder, not computed.
