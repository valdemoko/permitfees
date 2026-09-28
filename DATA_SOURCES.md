# Data Sources & Verification Protocol

The product's only real asset is trustworthiness. This is the procedure that
produces it, and the record that proves it.

## 1. Hierarchy of evidence

Every published fact has exactly **one primary source**. Anything else is
discovery assistance and must never be presented as the citation.

### Tier 1 — primary (allowed as the cited source)

1. The jurisdiction's own website: permit department / building division pages.
2. The published fee schedule document (PDF or web page) issued by that
   jurisdiction.
3. The municipal code, county code, or adopted ordinance (including adopted
   model codes where the jurisdiction publishes them).
4. A state agency schedule where the state sets the fee.
5. The jurisdiction's own permit portal, when it itemises fees for a real
   application.
6. Official application forms and instructions that list fees or requirements.

### Tier 2 — discovery only (never cited as the source)

- Third-party permit-expediting sites and their published fee tables.
- Contractor blogs, forums, Reddit, Quora.
- Aggregator/SEO sites about permit costs.
- Trade association summaries.
- Newspaper articles.

Tier 2 material may be used to **find** the Tier 1 document, or to decide which
jurisdictions are worth researching. It is never the reason a number appears on
the site. If only Tier 2 material exists for a fact, the fact is not published.

### Tier 3 — staff statements

A phone or email answer from a permit office is legitimate evidence, but it is
recorded as such: `verification_method = phone | email`, with the date, the
office contacted, and the name of the person if given. It never replaces a
published schedule, and both are stored when they disagree.

Note the important nuance: **a Tier 1 source can be outdated.** Code and
schedules disagree, and staff sometimes apply a rule that is not in the
published document. We record the conflict rather than picking a winner
silently.

## 2. What we record for every source

```
sources
  title                  "Building Permit Fee Schedule"
  url                    the exact page or document URL
  source_type            fee_schedule_pdf | municipal_code | ordinance | ...
  issuing_authority      "City of Houston"
  authority_kind         city | county | state | other
  jurisdiction_id        which jurisdiction it governs (nullable for state-wide)
  effective_from         when it takes effect, when stated
  document_date          when the document was published/updated, when stated
  retrieved_at           when we fetched it
  is_primary             must be true to be cited
  notes                  amendments, caveats, ambiguity

source_snapshots
  source_id, captured_at, content_hash, storage_ref
```

`content_hash` is the quiet workhorse: it lets us detect that a schedule changed
under us between verifications, and it survives the municipality renaming the
URL — which they always eventually do.

## 3. Research procedure per jurisdiction

Run this in order and stop as soon as the answer is clear.

1. **Identify the authority.** City site first. If the property is in an
   unincorporated area, the county may be the authority instead. Record which
   one the schedule actually comes from; do not assume the city governs
   everything with its name on it.
2. **Find the fee schedule.** Look for "fee schedule", "permit fees",
   "development fees", "consolidated fee schedule". Code chapters (for example
   a building code chapter with a fee article) are equally valid and often more
   authoritative.
3. **Identify the effective date.** A schedule without a date is a risk. Record
   "undated" explicitly rather than guessing.
4. **Extract the rules.** One row per calculable component. Capture the
   conditionals verbatim in notes before translating them into the engine's
   condition format — translation errors are the most common defect.
5. **Capture the non-fee facts.** Requirements (documents, inspections,
   licences), the issuing department, the portal URL, and any published
   calculator.
6. **Cross-check.** If the code and the schedule disagree, record both, mark the
   rule `needs_review`, and note the discrepancy. Do not average anything.
7. **Write the verification record.** Method, date, verifier, notes.
8. **Snapshot.** Capture the hash of the document as it stood.

## 4. Verification status and cadence

| Status | Meaning | Displayed to users |
| --- | --- | --- |
| `verified` | Checked against the primary source within the last review window | Verified date shown |
| `needs_review` | Verified previously, but something changed or is ambiguous | Shown with an uncertainty note |
| `outdated` | Superseded or beyond the review window | Shown, but the page is marked for re-verification |
| `disputed` | Sources conflict | Both values shown, with the conflict explained |
| `unverified` | Not yet checked | **Not published.** No page is created. |

Review cadence, by how much the number matters:

- Fee schedules: re-checked quarterly, and always at the start of a fiscal year
  (many jurisdictions update fees with the fiscal budget).
- Requirements and process pages: re-checked every six months.
- Department contacts and portals: re-checked annually.

A page whose data has aged past its window degrades gracefully: it stays online
(it is still the best available answer) but says so, and it is queued for
re-verification. We never silently present stale numbers as current.

## 5. Fidelity rules

These are the rules that separate this project from a scraper.

1. **Never invent a fee.** If the schedule is not public, the honest answer is
   "this jurisdiction does not publish a fee schedule" — and that is a
   publishable, useful page.
2. **Never assume two cities share rules**, even within the same state. State
   law sets floors and mandates; cities set the numbers.
3. **Never present an estimate as an official fee.** The interface labels
   calculated output as *Estimated permit cost*, states the inputs it used, and
   links the official document. Where the jurisdiction publishes its own
   calculator, we prefer it and say so.
4. **Preserve units.** Cents vs dollars, per-$1,000 vs percent, per-square-foot
   vs per-square-metre. Unit confusion produces confident wrong answers.
5. **Preserve conditionality.** "Residential only" or "commercial only" is not a
   footnote; it is part of the rule and must be enforced by the engine's
   conditions, not just mentioned in prose.
6. **Quote the local name.** If the jurisdiction calls it a "Building
   Construction Permit", say that, then map it to our canonical permit type.
7. **Record negations.** "No separate electrical permit fee; included in the
   building permit" is a first-class, useful fact.

## 6. Handling the awkward cases

| Case | Handling |
| --- | --- |
| No public fee schedule | Publish the requirements page only, state plainly that the jurisdiction does not publish fees, and list the department and its phone number. Do not estimate. |
| Fees only available via a portal after login | Record the portal as the source; do not create fee rules. Explain how to get the quote. |
| Fee schedule is in a scanned image PDF | Extract carefully, record that extraction was manual, and snapshot the page images as evidence. |
| Fee is set by an annual resolution (variable) | Record the resolution, its date, and the formula; mark the rule with its effective window and expect renewal. |
| Multiple authorities (city + county + school district) | Model as separate jurisdictions. Do not merge fees into one total without labelling each component's authority. |
| State surcharge on top of local fee | Separate rule, `component_type = state_surcharge`, with the state agency as its own source. |
| Schedule changed mid-year | Two rules with adjacent effective windows. Both retained. |

## 7. Legal and ethical boundaries

- We cite, summarise and attribute. We do not republish a fee schedule document
  wholesale.
- We respect `robots.txt` and site terms when fetching public documents. We use
  normal request rates; no scraping at scale without review.
- We link to the official source as the canonical answer on every page about a
  fee.
- We take no position on whether a fee is fair, only what it is.
- Personal data about staff (names, direct emails) is recorded only when it is
  the official public contact for a department. Phone-call notes record the
  office and date; individual names are omitted unless the person is a public,
  published contact.
- Content is corrected promptly when a jurisdiction updates its schedule, and
  errors are fixed rather than quietly deleted.

## 8. Source inventory to build during data collection

For each jurisdiction, the research worksheet collects:

- [ ] Permit authority name, type, and website
- [ ] Building department name, phone, email, hours
- [ ] Online permit portal URL and whether it is mandatory
- [ ] Fee schedule URL and effective date
- [ ] Municipal/county code citation for fees
- [ ] Official calculator or valuation tool, if any
- [ ] Building permit fee rules (residential / commercial)
- [ ] Electrical, plumbing, mechanical, roofing rules
- [ ] Plan review fee basis
- [ ] Technology / automation fees
- [ ] Inspection fees, if separate
- [ ] State surcharges
- [ ] Valuation basis: contractor-declared vs jurisdiction-computed
- [ ] Required documents and licences
- [ ] Inspection sequence
- [ ] Notable local quirks, recorded in plain language

That worksheet becomes the input to the importer/admin in Phase 4. It is a
worksheet on purpose: data enters the system through a human, deliberately.

## Completed example: Houston, Texas

The worksheet was filled in for real in Phase 1. The full record is
`research/texas/houston.md`; this is what the process produced, including the parts that
did not go to plan.

| Step | Houston |
| --- | --- |
| Official permit department | Houston Public Works — Houston Permitting Center, 1002 Washington Ave., 832.394.9000 |
| Fee schedule | [City-Wide Fee Schedule](https://cohweb.houstontx.gov/fin_feeschedule/default.aspx), primary |
| Municipal code | [Houston Code of Ordinances](https://library.municode.com/tx/houston/codes/code_of_ordinances), primary, identified but **not yet read** |
| Official calculator | [Building Permit Fee Estimator](https://hpwoltest.houstontx.gov/BuildingPermitFee/index.html), used only for the City's definition of "valuation" and its list of excluded fees |
| Valuation basis | **City-defined**, not contractor-declared and not an outside valuation service: total construction cost to the end user, excluding land purchase and its overhead. A separate construction-type table (Table 601, Ord. No. 2023-907) establishes valuation from building type and floor area; not yet transcribed |
| Fee rules extracted | Structural (nine brackets), electrical (§118.6), plumbing (§118.5), mechanical (§118.3), demolition, minimum and administrative fees |
| Plan review | City Engineer, billed separately: $134.28 administrative plus $96.67 per plan sheet |
| Inspection fees | Re-inspection $94.00; specially requested and after-hours inspections priced per day or per hour |
| Local quirks | Rates published as dollars per $1,000, not percentages. Base charges do not chain arithmetically across brackets. "Or fraction thereof" is a real round-up. Unincorporated Harris County issues its own permits under a different fee order |
| Contradiction found | Bldg. Code Sec. 118.1.3 ($91.06 minimum) vs Sec. 118.2.1 ($47.00 flat) for small valuations. Recorded as `disputed`; neither figure is applied |

### What the process taught

Two rules of the method earned their place during this worksheet:

1. **Reading the schedule is not the same as reading the code.** The schedule gives
   amounts and code references; the code gives formulas and definitions. Where a
   schedule row says `Calculation` instead of a number — as Houston's HVAC
   percentage row does — the schedule alone is not enough, and the honest move is to
   withhold the component.
2. **A dollar figure the engine cannot reproduce is a finding, not an obstacle.**
   Two of Houston's rules were mis-modelled on the first attempt and the regression
   tests caught both. Reach for a new primitive only when the published unit demands
   it, and then check that the new primitive did not quietly change an existing one.
