# Clark County, Nevada — research record

**Status: published.** Three permit pages (building, electrical, plumbing), 18 distinct fee
rules, two sources, eighteen verification rows, live at `/nevada/clark-county/`.

Two passes are recorded here. **Pass 1** (§1–§7) is the source discovery, kept as it was
written — including the places pass 2 corrected it, which are marked in §8 rather than edited
out of the history. **Pass 2** (§8–§9) is the modelling, seeding and publication.

The pass-1 rule still holds and is worth restating at the top: a research file states what was
looked for, what was found and what stopped it, rather than dressing up a partial pass as a
completed jurisdiction. §8 is the other half of that rule — what the completed pass found out
that the discovery pass could not.

---

## 1. Why Clark County is first in Nevada, and what is not

The obvious first Nevada city is **Las Vegas**, and it was tried first. The City publishes a
**Permit Fee Estimator** at `lasvegasnevada.gov/Business/Permits-Licenses/Building-Permits/Permit-Fee-Estimator`.
It answers `200`, and the extracted page text is the string `Permit Fee Estimator` and nothing
else: the figures are rendered by client-side JavaScript, so there is no fee table in the HTML
to read. That is the same class of blocker already recorded for Scottsdale's own calculator
(§10 of [`../arizona/scottsdale.md`](../arizona/scottsdale.md)) and for Houston's HPW department
section, and it is recorded here rather than worked around.

A City of Las Vegas flat fee-schedule PDF was not located in this pass. The City is therefore
**blocked on a readable source**, not written off.

**Clark County** is not blocked. Its Department of Building & Fire Prevention publishes Chapter
22.02 of the Clark County Code — the Building Administrative Code — as a single PDF whose fee
tables have a working text layer. That is a primary, authority-issued document, and it is the
source this record is about.

The county is also the right first entry for a second reason: **jurisdiction ≠ city** is one of
the things this site exists to explain, and a county that issues its own permits under its own
code is the cleanest possible illustration of it. Whether
Clark County issues construction permits for *unincorporated* areas only, and for which
functions, has **not** been verified against the County's own site. It is recorded as an open
question in §7 and nothing is claimed about it yet.

---

## 2. Sources

| Key | Document | URL | Retrieved | Pages | sha256 |
|---|---|---|---|---|---|
| `clark-admin-code` | 2018 Clark County Building Administrative Code (Chapter 22.02 compilation, printed 10-2022) | `clarkcountynv.gov/adobe/assets/urn:aaid:aem:d43c9c5d-c4bc-46a5-8ca1-6f3bd9a5b921/original/as/administrative-code-2nd-proof-final-08-18-22-printed-10-2022.pdf` | 2026-09-24 | 92 | `0df85ac497b9a57703bab62ccbb6bc1e8152b56d8b871a8dae3bfb0bcd244e48` |

| Key | Document | URL | Retrieved | Read? |
|---|---|---|---|---|
| `clark-fees-calculator` | Clark County "Fees Calculator" page | `clarkcountynv.gov/government/departments/building___fire_prevention/permit_issuance/fees` | 2026-09-24 | Page text read; **the calculator itself is client-rendered**, so it published no rate |
| `lasvegas-estimator` | City of Las Vegas Permit Fee Estimator | `lasvegasnevada.gov/Business/Permits-Licenses/Building-Permits/Permit-Fee-Estimator` | 2026-09-24 | Title only. **Blocked**: figures are client-rendered |

**A caveat that has to be resolved before any figure is published.** The PDF is a *compilation*
— "2nd proof", printed October 2022 — and its own front matter says: *"If there is a legal
question, the Clark County Code, Chapter(s) 22.02 should be reviewed for the actual language as
adopted by the [Board]."* It also carries a running amendment history (for example *Amended
Date 02-15-22; Effective 03-01-22, Ord. 4917*). So the compilation establishes the **mechanism
and the table structure** with confidence, but the **currently adopted version of Chapter 22.02
and its effective date have not been established**, and this project publishes a fee only with a
real verification date behind it. That is step 1 of the modelling pass, not an afterthought.

---

## 3. What the document contains

Chapter 22.02 defines twelve fee tables. This is the table of contents, not a transcription:

| Table | Section | Subject |
|---|---|---|
| 3-A | 22.02.390 | Permit fees based on valuation |
| 3-B | 22.02.395 | Electrical permit fees |
| 3-C | 22.02.400 | Mechanical permit fees |
| 3-D | 22.02.405 | Plumbing permit fees |
| 3-E | 22.02.410 | Grading plan review fees |
| 3-F | 22.02.415 | Grading permit fees |
| 3-G | 22.02.420 | Amusement and transportation system fees |
| 3-H | 22.02.425 | Administrative and investigative fees |
| 3-I | 22.02.430 | Other plans examination, inspections and miscellaneous fees |
| 3-J | 22.02.431 | Sign construction permit fees, based on project valuation |
| 3-L | 22.02.433 | Storm sewer inspection fees |

Note that Clark County prices **four** permit types in tables of their own — building by
valuation, and electrical, mechanical and plumbing separately. That is the first jurisdiction in
this project where all three trades have their own published schedule rather than being priced
per item (Houston), by trade count (Dallas), from the building valuation (Phoenix) or as flat
items in a miscellaneous list (Scottsdale). If it models cleanly, Clark County is a
four-page jurisdiction: building, electrical, plumbing **and** mechanical.

---

## 4. The mechanism, from the tables read

Read twice per this project's rule: `pdftotext -layout` and `pdftotext -table` agree on Table
3-A, row for row, label against amount. Pages 67–69.

### 4.1 Table 3-A — building, by valuation, as chained marginal bands

| Total valuation | Fee calculation |
|---|---|
| $1 to $500 | $54.00 |
| $501 to $2,000 | $54.00 for the first $500.00 plus $1.683 for each additional $100.00 or fraction thereof, to and including $2,000.00 |
| $2,001 to $25,000 | $79.29 for the first $2,000.00 plus $7.371 for each additional $1,000.00 or fraction thereof, to and including $25,000.00 |
| $25,001 to $50,000 | $248.82 for the first $25,000.00 plus $4.725 for each additional $1,000.00 or fraction thereof, to and including $50,000.00 |
| $50,001 to $100,000 | $366.95 for the first $50,000.00 plus $3.402 for each additional $1,000.00 or fraction thereof, to and including $100,000.00 |
| $100,001 and up | $537.05 for the first $100,000.00 plus $2.934 for each additional $1,000.00 or fraction thereof |

**This is the shape the engine already calls `tiered_marginal`, and it is the opposite
convention to Houston's.** Houston's bracket table was built so the base charges deliberately
**do not chain** — the correct reading of Houston's document — and a test pins that. Here each
band's opening figure is explicitly *"for the first N"*, so the bands **do** chain: the $248.82
in the third band is built on the $79.29, which is built on the $54.00. Two jurisdictions, the
same word ("table"), opposite arithmetic. The model has to state which convention applies rather
than carrying the last city's.

Two further properties of the table worth recording before modelling:

* **"or fraction thereof"** applies to the additional amounts. A valuation of $501 is charged
  $1.683 for the *first* additional $100 and a whole second $1.683 for the $1 in the second
  hundred. The project already treats that rounding as written, because it changes the answer.
* **$54.00 repeats as a base** across the tables (3-A's first band, 3-B, 3-C and 3-D's permit
  issuance). Whether that is one fee with four expressions or four fees that happen to be equal
  is exactly the kind of question that must be settled from the document, not inferred, because
  it decides whether a project takes one $54 or three.

The table also fixes the valuation basis in words: *"Contract valuations supplied by the
applicant shall be utilized by the Building Official"*, with the Building Official reserving the
right to ask for documentation and to set the final valuation. So the applicant declares the
value and the department sets it — the engine takes it as an input.

### 4.2 Table 3-B — electrical

Flat fees, plus per-unit charges, plus a documented fallback:

| Item | Fee |
|---|---|
| Permit issuance | $54.00 |
| Online: Electric re-tag only | $61.88 |
| Online: same-size panel replacement up to 200 A | $61.88 |
| Online: same-size panel replacement up to 600 A | $70.56 |
| Online: same-size panel replacement up to 2000 A | $86.80 |
| Online: same-size panel replacement over 2000 A | $119.16 |
| Each subpanel or distribution board | $4.35 |
| Signals, alarms, television outlets, control panels, telephones, switchboards — each | $0.45 |

The fallback sentence is part of the schedule and is quoted here because it decides more than any
row: *"Fees for projects not specified in this schedule shall be determined by the Building
Official by applying the total value of the scope of work being performed to Table 3-A of this
chapter."* In other words the general electrical permit **is** Table 3-A applied to the electrical
contract value; Table 3-B is the list of exceptions. That is a mechanism no previous jurisdiction
has had, and it is the one place this jurisdiction is likely to need the engine extended
generically rather than locally — a component that is *another rule set*, evaluated against a
different basis.

### 4.3 Table 3-C — mechanical

| Item | Fee |
|---|---|
| Each permit issuance | $54.00 |
| Online: A/C or furnace replacement | $61.88 |
| Online: furnace replacement < 100 K BTU | $62.28 |
| Online: furnace replacement > 100 K BTU | $63.81 |
| Online: residential condenser combo | $83.34 |

Same fallback to Table 3-A on the total contract value of the scope of work, in the same words.

### 4.4 Table 3-D — plumbing

Read only as far as the first rows on this pass: **permit issuance $54.00**, and at least one
online simple fee (**gas re-tag only, $61.88**). The remainder of the table has not been
transcribed, so nothing about plumbing is claimed here beyond the issuance fee existing.

---

## 5. What this would need from the calculation engine

Recorded now so the modelling pass starts from a decision rather than from discovery:

1. **`tiered_marginal` with chaining bands.** Already supported. The work is the model, not the
   engine: the rule must be written so the chaining is explicit, and a test must pin a value in
   each band on both sides of every boundary.
2. **Per-unit kinds that may not exist yet.** `$4.35 each subpanel or distribution board` and
   `$0.45 for signals, alarms, television outlets, control panels, telephones, switchboards,
   each` probably need one or two additions to `PER_UNIT_KINDS`. That is a *generic* extension —
   a countable thing in a published schedule — which is the only kind this project allows.
   Decided after the transcription is complete, not before.
3. **A rule set referenced as a basis.** The Table 3-A fallback is not a rate; it is "apply the
   other table to this value". Whether that is modelled as a `permit_fee`-style cross-reference
   (the primitive Phoenix produced) or something new depends on the transcription, and it must
   not become a local special case in the engine.
4. **A selection pattern already in use.** The "online simple permit fee" rows are flat fees
   chosen by item, which is the same shape Scottsdale uses via `custom.schedule_item`. Reusable
   as-is, and a second jurisdiction using it is the evidence that it was worth having.

---

## 6. Open questions, unresolved (as recorded at the end of pass 1)

1. **Which effective date applies.** The compilation is not the adopted code (see §2). The
   currently adopted Chapter 22.02 must be established, with its date, before any figure is
   published.
2. **The $54.00 question.** Does a project that takes a building permit and three trade permits
   pay $54 once or four times? The document has to say; the tables alone do not.
3. **The scope of the county's authority.** Whether Clark County issues construction permits for
   unincorporated areas only, and for which functions, is unverified.
4. **Which Nevada jurisdictions pair here.** Clark County is the county entry. The city entry is
   open: the City of Las Vegas is blocked on a readable source, and Henderson, North Las Vegas
   and Boulder City have not been examined. (A Boulder City "Permit Fee Schedule and Valuation
   Table" PDF was seen in a search result and **not** fetched, so nothing is claimed about it.)
5. **Whether grading, signs and storm sewer get pages.** Tables 3-E, 3-F, 3-J and 3-L exist. The
   editorial gate decides, not enthusiasm.

---

## 7. Next steps, in order (as recorded at the end of pass 1)

1. Establish the currently adopted Chapter 22.02 and its effective date; record it with the URL
   and the retrieval method.
2. Transcribe Tables 3-A, 3-B, 3-C and 3-D in full, reading each PDF page in two `pdftotext`
   modes and recording the hash of what was read.
3. Resolve §6.1 and §6.2 from the document.
4. Decide the city entry for Nevada, or record it as blocked and publish the county alone.
5. Only then: model, seed, page, test, verify — the same gate as every other jurisdiction.

All five are done. What each one turned into is in §8, and the two that did not end the way
pass 1 expected are marked there.

---

## 8. Pass 2 — what was modelled, and what changed

### 8.1 The effective dates (§6.1, resolved)

§2 recorded that the PDF is a 2022 *compilation* whose front matter says the adopted code
governs a legal question, and §6.1 made establishing the adopted version the first step. It was
resolved from the document itself plus the County's code host:

* The compilation carries an **amendment history**. Section 22.02.390 (Table 3-A) was last
  amended by **Ordinance 4663, effective 6 February 2019**; sections 22.02.395, 22.02.400 and
  22.02.405 (Tables 3-B, 3-C and 3-D) by **Ordinance 4917, effective 1 March 2022**.
* The County's adopted code is published on **Municode**
  (`library.municode.com/nv/clark_county`) under Title 22, Chapter 22.02 — the authoritative
  text, reachable and readable.

So the schedule row carries `effectiveFrom = 2022-03-01` and the Table 3-A rules carry
`2019-02-06` individually. That split is deliberate: flattening the two dates into one would
throw away the only place in the record where the difference is visible.

### 8.2 The transcription (§7.2, done — with one correction)

Tables 3-A, 3-B, 3-C and 3-D were all read to the end. Table 3-D is complete, which corrects
**§4.4's** "read only as far as the first rows": it is a $54 issuance row, five online simple
permits (gas re-tag $61.88; re-pipe, reverse osmosis, water heater and water softener $56.57
each) and the same Table 3-A fallback in the same words as 3-B.

### 8.3 The mechanism that mattered: a per-$1,000 rate finer than a cent

This is the one thing pass 1 could not have known from §4.1's table of bands, and it is the
reason three of the six rows needed an engine change rather than a transcription:

| Band | Published rate | In cents per $1,000 |
|---|---|---|
| $501–$2,000 | $1.683 per additional $100 | 1,683 — whole cents, because the step is $100 |
| $2,001–$25,000 | $7.371 per additional $1,000 | **737.1** |
| $25,001–$50,000 | $4.725 per additional $1,000 | **472.5** |
| $50,001–$100,000 | $3.402 per additional $1,000 | **340.2** |
| $100,001 and up | $2.934 per additional $1,000 | **293.4** |

`per_thousand` stored whole cents per $1,000, and `percent` had already grown an exact-fraction
rate for Dallas. `per_thousand` grew the same field (`rateCentsPerThousand`), and the schema
requires exactly one of the two — so a rule can no longer be written as a rate it cannot hold.

**The error this caught, recorded because it is the most useful thing in this file.** The first
version of the $7.371 band stored `centsPerThousand: 7_371`. That reads naturally — "7.371
dollars per $1,000" — and it is ten times the published rate: it charged a $25,000 valuation
**$1,774.62** where the table says **$248.82**. Nothing in prose, nothing in a schema check and
nothing in a type would have caught it; a boundary-value arithmetic test did, on the first run.
It is now asserted twice: in the payload's own test file and in `npm run db:verify`, which
reads the stored JSON back out of PostgreSQL and compares it against the figure the table
produces.

### 8.4 The mechanism that did not need the engine: the trade fallback

§4.2 and §4.3 read the fallback sentence — unspecified work is priced by applying Table 3-A to
the value of that scope — and §5.3 guessed it might need "a component that is another rule set".
It did not. Both trade tables end by *routing* unspecified work to Table 3-A, not by adding a
component to it, so the trade pages simply carry the Table 3-A bands plus the table's own flat
rows, and the rows are made mutually exclusive with the bands by a condition on
`custom.schedule_item`. That condition is the second thing this jurisdiction reused from
Scottsdale, and a second user is the evidence it was worth having.

The per-unit charges did need one addition: **`low_voltage_points`**. "$0.45 — for signals,
alarms, or television outlets, control panels, telephones, switchboards, each" is charged per
device, and half that list is not an outlet. Reading it as Houston's `outlets` would have
described a switchboard as an outlet and made two jurisdictions share one count. `panels` was
reused for the $4.35 subpanel row, because an electrical panel is what that row prices.

### 8.5 The seam: four close, one does not

§4.1 asserted the bands chain — "the $248.82 in the third band is built on the $79.29, which is
built on the $54.00". Modelling it turned that assertion into a number, and the number is
mostly right and partly not. Checked by running the engine at each band's top:

| Handover | Value the band below produces | Opening figure of the band above | Difference |
|---|---|---|---|
| $500 | $54.00 | $54.00 | none |
| **$2,000** | **$79.245 ($79.25 rounded)** | **$79.29** | **4 cents** |
| $25,000 | $248.823 ($248.82 rounded) | $248.82 | none |
| $50,000 | $366.945 ($366.95 rounded) | $366.95 | none |
| $100,000 | $537.05 | $537.05 | none |

The four that close, close only after their half-cent increments are rounded, which is why they
are asserted by running the arithmetic rather than by multiplying on paper. The one that does
not close is four cents apart, and it is in the County's own table: $79.245 against $79.29, both
printed. The pages state it rather than reconciling it.

### 8.6 The $54 question (§6.2) — a reading, stated as one

§6.2 asked whether a project taking a building permit and three trade permits pays $54 once or
four times. The document answers it by accident rather than by design: every trade table opens
with a "Permit Issuance — for issuing permit — $54.00" row, and Table 3-A's own first row is
**also $54.00**, for a valuation of $1 to $500. Two different rows that are the same floor.

The reading taken is that they are one floor, not two charges: a general trade permit is Table
3-A applied to the value of the trade work, so the $54 is the value table's minimum rather than
an addition to it. Charging both would bill the same $54 twice for one permit. If the County
means the issuance fee to be additional, every published electrical and plumbing figure here is
$54 low — and both trade pages say so in those words, in the exclusion list and in a FAQ.

### 8.7 What was published, and what was not

| | Clark County |
|---|---|
| Fee rules stored | 30 rows, 18 distinct codes (6 valuation bands, 7 electrical items, 5 plumbing items) |
| Permit pages | 3 — building, electrical, plumbing |
| Requirements | 6, across the three permit types |
| Sources | 2 (the code compilation, and the Department's fee page) |
| Verification rows | 14 |
| Worked examples | building $250,000 → $977.15; electrical $30,000 + 2 subpanels → $281.15; plumbing water heater → $56.57 |

**Mechanical was transcribed and not published** (§3's guess that this would be a four-page
jurisdiction was wrong, and deliberately so). Table 3-C is real, readable and quoted in §4.3;
no mechanical page exists in this release. That is a scope decision, and it is stated in the
payload's own notes rather than left as an absence.

**Seven tables are named and charged by nobody**: 3-E and 3-F (grading, per cubic yard of
excavation and fill), 3-G (amusement and transportation systems), 3-H (administrative and
investigative), 3-I (plans examination, inspections and miscellaneous), 3-J (signs) and 3-L
(storm sewer). Every page names the ones a reader might expect to be included, with the reason.

**The Department's own fee page is recorded as read but not as a source of rates.** It answers
200, lists the development impact fees charged at issuance — transportation tax, residential
park fee, multi-family park fee, MSHCP mitigation and administrative fees, public facility needs
assessment, traffic mitigation, state water impact fee — and publishes no rate for any of them.
Its calculator is client-rendered, so no figure is taken from it. All eight are named on every
page and charged by none.

### 8.8 The city entry (§7.4, resolved): Boulder City

The City of Las Vegas is blocked — its estimator renders figures client-side and no City fee
schedule was located. Henderson's estimator is blocked the same way, and North Las Vegas answers
**403** to this environment (recorded, with Boulder City's findings, in
[`boulder-city.md`](./boulder-city.md) §1). Boulder City publishes a two-page PDF with a working
text layer and its own effective date, so it is the second Nevada jurisdiction. Its record is
[`boulder-city.md`](./boulder-city.md).

### 8.9 Open questions, still open

1. **Is the $54 issuance fee additional?** §8.6 records the reading and the consequence if it
   is wrong. The document does not settle it.
2. **Does a stand-alone trade permit attract plan review?** The chapter prices plan review
   through the same valuation table and through hourly Table 3-I rates, and the tables read do
   not separate it from the permit fee. No plan review figure is charged on any page, and each
   says why.
3. **The scope of the County's authority** (§6.3). The pages say plainly that Las Vegas,
   Henderson, North Las Vegas and Boulder City issue their own permits and that which authority
   covers an address follows from the city limits; whether Clark County permits *only*
   unincorporated territory was not verified against the County's own site, so no page claims it.
4. **Table 3-I's hourly rates** were read and not modelled: they price events (re-inspection,
   revisions, extensions, after-hours), not construction permits.

---

## 9. Verification — pass 2

| Check | Method | Result |
|---|---|---|
| Both sources retrieved | live fetch, 2026-09-24 | read; `clark-admin-code` sha256 `0df85ac497b9a57703bab62ccbb6bc1e8152b56d8b871a8dae3bfb0bcd244e48` |
| Tables 3-A, 3-B, 3-D transcribed | `pdftotext -layout` and `-table` | agree row for row on 3-A; 3-B and 3-D read in `-layout` after that check |
| Fee page's calculator | extracted page text | client-rendered; no rate taken, recorded as read |
| Band boundaries | engine over the rules read from PostgreSQL | five boundaries pinned: $54.00, $79.25, $248.82, $366.95, $537.05 |
| Seams | value at each band top vs the band above's opening figure | four close to the cent; $2,000 is four cents apart, as printed |
| `$7.371` storage | stored JSON, read back from the database | `rateCentsPerThousand {7371, 10}` and no `centsPerThousand`; the whole-cents reading is asserted to produce the wrong $1,774.62 |
| Worked examples | engine over the stored rules | $977.15, $281.15, $56.57 |
| Rule inventory | SQL over `fee_rules` | 30 rows, 18 distinct codes, 0 plan-review components |
| Tests | `npx vitest run`, `npm run typecheck` | green, with the seam and the fraction stored as tests rather than comments |
