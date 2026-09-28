# Denver, Colorado — research record

**Status: published** (pass 1). Three permit pages: building, electrical, plumbing.
State Colorado is activated on the map with this one jurisdiction.

- **Verification date:** 2026-09-24
- **Issuing authority:** City and County of Denver, Community Planning & Development
- **Transcription:** three `pdftotext` readings of the same PDF (`-raw`, `-layout`, `-table`),
  kept in `.tmp-research/colorado/`. Table No. 1 is a bordered table, so `-layout` is the
  reading that preserves the fee column against its band; `-table` was used to confirm the
  band boundaries and `-raw` to confirm that the third column is a percentage of each band's
  own permit fee rather than of the valuation.

| Document | sha256 (first 16) | Where |
| --- | --- | --- |
| `admin_138.pdf` — Building Permit Policy, Building and Related Fees (ADMIN 125 and 138) | `85f133340a280bbf` | `https://www.denvergov.org/files/assets/public/v/9/community-planning-and-development/documents/ds/building-codes/policies/admin_138.pdf` |
| Building and Land Development Fees (department page) | — (HTML) | `https://www.denvergov.org/Government/Agencies-Departments-Offices/Agencies-Departments-Offices-Directory/Community-Planning-and-Development/Plan-Review-Permits-and-Inspections/Development-Fees` |

Both were read on 2026-09-24 and are recorded as `sources` in the seed payload. The
department page is the fallback for the plain-language statements (review is paid before
review begins; a valuation is the higher of two numbers) that the policy states in the
section text rather than in the table.

## 1. What the mechanism is

**One valuation table, and the plan review is a column of it.** Table No. 1 has eight bands
and a third column that prints a percentage beside each band — `0` for the two lowest, then
`50%`. Section 200 says the review fee "is a percentage of the building permit fee as shown
in Table No. 1" and is "separate from and in addition to the permit fee". That is the same
`permit_fee` primitive Phoenix produced, used here for an entire column of a published table.

**Each row is a closed-form arithmetic.** Every band is written as *"$X for the first $N plus
$Y for each additional $1,000 or fraction thereof"*, and the lower bands are flat figures.
The bands are therefore chained, and the property worth checking is the seam: what the band
below produces at its top against the opening figure of the band above.

| Band (valuation) | Fee at the band's top | Opening figure of the next band |
| --- | --- | --- |
| $1 – $500 | $20.00 | $35.00 (flat row, no continuity claimed) |
| $501 – $2,000 | $35.00 | $35.00 — closes |
| $2,001 – $25,000 | **$219.00** | **$220.00 — a dollar apart** |
| $25,001 – $50,000 | $420.00 | $420.00 — closes |
| $50,001 – $100,000 | $770.00 | $770.00 — closes |
| $100,001 – $500,000 | $3,010.00 | $3,010.00 — closes |
| $500,001 – $1,000,000 | $5,385.00 | $5,385.00 — closes |
| $1,000,001 and over | open-ended | — |

The `$25,000` seam is a dollar short, and it is **published that way**: the table says
*"$220.00 for the first $25,000"* in the row above a row that produces `$219.00` at
`$25,000`. Denver resolves it by band membership rather than by reconciling the figures —
`$25,000` is in the lower band and pays `$219.00`; `$25,001` is in the upper band and pays
`$220.00` plus `$8.00` for the fraction of a thousand it added, so `$228.00`. Both are
asserted in `tests/content/denver-seed.test.ts` and neither is smoothed over. The step from
`$219.00` to `$228.00` for one extra dollar of valuation is the table's own arithmetic.

**Plan review is four rows and four modes, not four charges.** The document lists: the
table's column (50% of the permit fee); express review at 20% of the permit fee with a
$100 minimum for construction "with a valuation over $2,000"; type-approved (TA) review at
10% of the permit fee; and master plans at "50% of the valuation of the master", which the
policy itself glosses as "equal to 50% of the calculated permit fee" — the same arithmetic,
so it is modelled as the same rule. The four are mutually exclusive by construction: the
model carries a `custom.review_type` selector and treats its absence as the standard column,
so two review modes cannot both be charged.

**Quick permits take no review at all:** "A review is not performed and there are no plan
review fees associated with quick permits." Modelled as a condition on the review rules
(`custom.permit_kind`), so a quick permit cannot be charged one — rather than as a rule of
its own that would have to be kept in step with the column.

**Trade permits are the same table on that trade's valuation.** The policy: separate permits
"are required for each discipline", and each one's fee "is based on the valuation of the work
for that specific trade permitted under that specific permit". So the electrical and plumbing
pages are Table No. 1 applied to the electrical and plumbing contract value, with no
surcharge and no per-device pricing. Denver's electrical permit does not move when the
building's valuation moves — a different question from the one Houston's or Clark County's
electrical pages answer, and the reason those pages ask for different inputs.

**Two surcharges exist and neither is on these pages.** Projects permitted in two or three
phases add 25% or 50% "to both fees" (permit and review); the Affordable Housing Linkage Fee
and other development charges sit outside this policy entirely. Both are named in
`notIncluded` rather than modelled, because the phase count is a fact about the applicant's
filing, not about the work.

## 2. What was built

- **Rules:** 8 Table No. 1 bands (`denver-t1-*`) + 3 review rules (`denver-review-standard`,
  `denver-review-express`, `denver-review-type-approved`) + the electrical and plumbing rule
  sets, each of which is the same table. Every rule cites the policy source.
- **No engine change.** Table No. 1's review column needed `permit_fee` (Phoenix), the
  minimum needed `minimumCents` (Dallas), and the modes needed an `absent`-or-`eq` condition
  (Clark County). Pass 1 of Colorado added nothing to `src/lib/calc` — the second jurisdiction
  in a row to be expressible with what already exists, which is what the engine work in the
  earlier passes was for.
- **Pages:** `building-permit-cost`, `electrical-permit-cost`, `plumbing-permit-cost`, each
  with 6 FAQs, its own `seoTitle`/`seoDescription`, and a worked example whose inputs live in
  the payload and whose arithmetic is computed by the engine at render time.
- **Mechanical is a permit type with no page.** Denver requires separate mechanical permits,
  but nothing in the fee policies read here prices one independently of Table No. 1's
  valuation, so no page claims a mechanism for it. The link is seeded and the absence is
  deliberate.

## 3. The error this pass caught, and how

The electrical page's worked example was written as "a stand-alone electrical permit for
$25,000 of electrical work", and every word around it — intro, summary, notes, FAQ — said
`$219.00`. The input was stored as `25_000_000` cents, i.e. `$250,000`, and the engine
therefore rendered **`$1,610.00`**. Nothing type-checks a cent count against a sentence: the
schema validates the rule, not the prose. It was caught by computing each page's worked
example through the engine and comparing the total with the figure its own notes state.

Two consequences, both now in place:

1. `tests/content/denver-seed.test.ts` asserts the worked example of every page against the
   figure its notes describe, so the payload cannot drift from its own prose again.
2. The same class of error as Clark County's `7.371` cents-per-thousand: **a stored number is
   not wrong until something recomputes it.** The rule schema, the typechecker and the prose
   are all silent about a factor of ten.

## 4. Open questions

- **Plan review on a stand-alone trade permit.** The review column is written about the
  building permit, and the commercial review team is described as reviewing
  "architectural, structural, mechanical, plumbing, and electrical" disciplines together —
  the building's drawings. Whether a stand-alone electrical or plumbing permit attracts its
  own review fee is not stated, so none is charged and the question is recorded on the pages
  rather than answered.
- **Which figure is "the valuation"** for a trade permit when the applicant declares
  materials only, or labour only. The policy sets the valuation as the higher of two numbers
  for the building permit; the trade pages take the contract value as declared, since that is
  the wording the policy uses for trades.
- **Express review availability** is stated as a rate for construction "with a valuation over
  $2,000"; whether it is available for any trade permit is not stated.

## 5. Second jurisdiction: Westminster (published in the same pass, pass 8)

Westminster's schedule was read in the same pass — 8 valuation bands, and **every seam
closes**: the table is internally exact. Its structure is richer than Denver's:

- plan review at **65% of the building permit fee**;
- **estimated use tax at 4.25% of 50% of the total valuation** (confirmed against the City's
  own Fees page, which also shows the value this replaced — 3.85% — which is what makes the
  reading certain);
- **trade permits at an additional 15% of the permit fee**, for each of mechanical, plumbing
  and electric, plus **15% of the plan review fee** for each of them;
- a separate flat list of "Miscellaneous SFD Residential Permit Fees" (re-roof $100, water
  heater $40, air conditioner/furnace/evaporative cooler $60–$80, lawn sprinkler $60,
  fence $50, solar $300 …).

This record first concluded that the mechanism could not be modelled, because a trade permit
here is priced as a percentage of another component's value, per trade, and the schedule
states no base for a **stand-alone** trade permit. That conclusion was half right and the
wrong half mattered: the percentage is computable whenever the *project's* fees are known,
so the trade pages take a project valuation and answer the question the schedule actually
prices — "what does the electrical permit add to this project" — instead of the one it does
not. The stand-alone gap is stated on the page as an open question rather than filled with a
number.

Westminster is therefore published (pass 8), with three pages, and its own record at
[`westminster.md`](./westminster.md) carries the table, the seven seams, the two readings and
the double-charge guard the trade rules needed. What it contributed to this state and not
just to this state:

- **The first schedule on this site that is internally exact.** All seven seams close; the
  seams of every other jurisdiction visited here need a sentence explaining which printed
  figure is off and by how much.
- **A flat-by-job fee list**, which answers a question the valuation mechanism cannot: a
  water heater replacement is $40.00, not a valuation to be declared.
- **A third jurisdiction in a row with no engine change**, and the second in which the trade
  mechanism is a percentage of another component rather than a permit of its own.
