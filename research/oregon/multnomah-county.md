# Unincorporated Multnomah County, Oregon — research record

Second jurisdiction of pass 10, published beside the City of Portland. Read 2026-09-24.
This is the closest pair of jurisdictions on the site, and the reason is an accident of
local government: the county's permits are issued by a **City bureau**.

## 0. Sources

| # | Document | URL | Read |
|---|---|---|---|
| C1 | **Building and Other Permits Fee Schedule, Unincorporated Multnomah County**, effective July 10, 2026 | `portland.gov/ppd/documents/building-and-other-permits-fee-schedule-unincorporated-multnomah-county-effective-1/download` | three `pdftotext` modes compared; four pages; sha256 begins `4211463f0eac9f3e` |
| C2 | **Electrical Permit Fee Schedule, Unincorporated Multnomah County**, effective July 10, 2026 | `portland.gov/ppd/documents/electrical-permit-fee-schedule-unincorporated-multnomah-county-effective-july-10-2026/download` | three modes; three pages; sha256 begins `ab23308d3994` |
| C3 | **Plumbing Permit Fee Schedule, Unincorporated Multnomah County**, effective July 10, 2026 | `portland.gov/ppd/documents/plumbing-permit-fee-schedule-unincorporated-multnomah-county-effective-july-10-2026/download` | three modes; four pages; sha256 begins `a42ebd9f8969` |
| C4 | **OAR 918-050-0100**, Statewide Fee Methodologies for Residential and Commercial Permits | `secure.sos.state.or.us/oard/view.action?ruleNumber=918-050-0100` | read live from the Secretary of State's current-rules database |
| C5 | **State of Oregon Permit Surcharge Fee**, Building Codes Division backgrounder | `oregon.gov/bcd/jurisdictions/Documents/surcharge-backgrounder.pdf` | full text read |

All three schedules carry *"Effective Date: July 10, 2026"*. The county's building
document is **four pages against the City's eleven**: the extra pages of the City's are the
two Development Services Fee tables and a long miscellaneous list, and the county has
neither.

## 1. The authority: a City bureau issuing county permits

**Portland Permitting & Development — a City bureau — publishes these schedules and issues
these permits for unincorporated Multnomah County.** The practical consequence is the whole
of this record:

| | City of Portland | Unincorporated Multnomah County |
|---|---|---|
| Building Permit Fee table | five bands, $167.00 minimum | **identical, row for row** |
| Plan review | 65% of the permit fee | **same** |
| Electrical schedule | — | **identical in every amount** |
| Plumbing schedule | — | **identical in every amount** |
| State surcharge | 12% | **same** |
| **Development Services Fee** | Commercial + Residential tables | **none** |
| Demolition, commercial | $1,372.00 | $1,038.00 |
| Demolition, residential | $1,352.00 | $1,018.00 |

**How "identical" was established.** Not by reading both and believing them. The two
building documents' full text was compared, and for the electrical and plumbing pairs every
`$X.XX` string was extracted from each document and the two *sorted multisets* diffed —
`diff` came out empty for both pairs. Amount-for-amount identity is the kind of claim that
should be checkable, so it was checked, and the check is recorded in the payload's own
verification notes.

Because the fee tables are one set, the two payloads are built from the **same rule
factories** in `src/content/portland/fee-rules.ts`, differing only by source id, and a test
asserts the two rule sets are identical by code and by config. Two transcriptions of one
document is how a pair of pages ends up disagreeing about a fee.

## 2. What the county charges less, and by exactly how much

**The Development Services Fee is the entire difference on ordinary work.** It is charged on
the same valuation as the building permit fee, and the county's document does not contain it:

| Valuation | Difference (City − County) |
|---|---|
| $100,000 | $356.91 |
| $250,000 | **$650.91** |
| $500,000 | $1,140.91 |
| $1,000,000 | $2,120.91 |
| $5,000,000 | $9,960.91 |

So a $250,000 commercial building permit is **$3,508.63** in the county against
**$4,159.54** in the city, and the three figures that make up each — permit fee $1,982.28,
plan review $1,288.48, state surcharge $237.87 — are the same on both pages. That is the
point of publishing the two together: the comparison is exact, not approximate.

Two caveats the pages carry. The plan review is **the same $1,288.48 either way**, because
it reads the *permit fee* and not the total. And the county still **needs a building
permit** for work inside unincorporated Multnomah County: the county's own government does
not issue it.

**The demolition rows are the only amounts in the county's four pages that are not the
city's** — $1,038.00 and $1,018.00 against $1,372.00 and $1,352.00, $334.00 lower on both.
They are stated on the page rather than modelled, and the sewer cap, erosion control and
site review fees are added separately in the schedule's own words.

## 3. What is the state's, in both jurisdictions

The county charges nothing the state has not decided, and the pages say so rather than
presenting state policy as local choice:

* **Valuation — OAR 918-050-0100**: the ICC Building Valuation Data Table current as of
  April 1 × square footage, with a commercial project paying on *"the greater of"* that
  figure or the applicant's stated value; a new house's plumbing permit priced by **baths**;
  the first **100 feet** of water and sewer lines included; and plan review *"based on a
  predetermined percentage of the permit fee set by the municipality"*.
* **The 12% surcharge — ORS 455.210(4)**: four statutory surcharges (4% state
  administration, 2% state inspection, up to 1% code administration, 4% electronic system)
  applied to all building permit types in Oregon. On a $250,000 project it is **$237.87** as
  modelled on the permit fee; on the finished total it would be $392.49, $154.62 more. Both
  are stated.

## 4. The trade schedules, which are the city's word for word

Electrical and plumbing are priced by the same rows the City's pages use, and the tests
assert they are the same objects. The two rows that matter are unchanged: a **branch
circuit is $21.00 where a service or feeder fee was also paid and $174.00 for the first one
where none was**, and a **new one- or two-family dwelling is priced by baths** — $792.00,
$1,187.00, $1,388.00 plus $334.00 for each additional bath or kitchen — with everything
else at $63.00 per fixture or item. The plumbing schedule prints the same
*"25% of total mechanical permit fee"* plan-review line the City's does, read here the same
way as 25% of the plumbing permit fee (see
[`portland.md`](./portland.md) §4).

The Development Services Fee that separates the two jurisdictions on a building permit
**does not apply to a trade permit**, because the City's table is charged on building, site
development and zoning permits. An electrician or plumber working in unincorporated
Multnomah County therefore pays exactly what the same work costs inside Portland.

## 5. What was built

* `src/content/multnomahcounty/index.ts` — three permit pages (building, electrical,
  plumbing), five sources, six requirements, fourteen verifications, and a `mechanical`
  permit type recorded without a page.
* `tests/content/multnomah-seed.test.ts` (17 tests), including the cross-jurisdiction
  comparison against Portland's rules.

**Worked examples, computed by the engine:**

| Page | Inputs | Total |
|---|---|---|
| Building | $250,000 commercial | **$3,508.63** ($1,982.28 + $1,288.48 + $237.87) |
| Electrical | 200 A service + 6 circuits | same as the city: **$463.06** |
| Electrical — package | 1,700 sq ft residential | same as the city: $813.78 |
| Plumbing | new dwelling, 2 baths | same as the city: $1,626.19 |

## 6. Open questions

1. **Whether a permit in unincorporated Multnomah County is ever issued by the county.**
   The schedules' own cover says Portland Permitting & Development issues them, and no
   Multnomah County fee schedule of any other kind was found. Recorded as the reading it is.
2. **The county's land use, road and right-of-way permits**, which are the county's own and
   are not in these schedules; nothing about them is claimed.
3. **Whether the county's demolition rows cover plan review and inspections** — the
   schedule's own note says they do, and no separate charge is modelled.
4. **The City's Development Services Fee on a county site** is charged on the City's
   schedule, and nothing in either document says what applies where a site is inside the
   city limits but permitted under a county-titled schedule.
5. **Mechanical** is priced on the same host for the same effective date and is not
   modelled in this release.
