# Las Cruces, New Mexico — research record

**Status: published** (New Mexico, pass 12). Three permit pages: building, electrical and
plumbing.

- **Verification date:** 2026-09-25
- **Issuing authority:** City of Las Cruces, Community Development Department — One Stop
  Shop, 700 N. Main St., Suite 1100, P.O. Box 20000, Las Cruces NM 88001, 575-528-3059
- **Enabling law:** **Resolution 21-019**, adopted August 17, 2020, "repealing Resolution
  No.s 90-235, 00-360, 03-361, 03-009, 11-221, 14-026, and 19-131 containing building
  permit fee schedules, and replacing with a unified Community Development fee schedule to
  be effective September 1, 2020." Exhibit A is the schedule itself.

| Document | Where |
| --- | --- |
| Resolution 21-019 with Exhibit A — the 2020 Schedule of Fees (the whole fee schedule) | `https://lascruces.civicweb.net/document/7542` |
| The City's document portal, which serves the above | `https://lascruces.civicweb.net/` |
| The City's general site (403 to plain clients — see §1) | `https://lascruces.gov/` |

## 1. Access

The **City's own document portal serves the resolution as a text-extractable PDF** with no
authentication — `lascruces.civicweb.net/document/7542` answers 200 to a plain client and
`pdftotext` reads all 933 lines cleanly. That single document is the source of record for
every figure on this site's Las Cruces pages.

`lascruces.gov` itself **answers 403 to plain clients** (Cloudflare bot challenge), the same
class of failure as Newark (see `../new-jersey/newark.md` §1) and unlike Albuquerque, whose
`cabq.gov` was directly readable. What was salvaged from the general site came through
search-engine snippets rather than page reads — the "Regulatory Resources" page path and
its note that the Municipal Code runs to Chapters 1–29 — and **no fee figure comes from
it**. The `las-cruces.org/184/Community-Development` URL printed in the schedule's own
contact block is recorded as the document's words, not as a page this pass read.

The municode mirror of the Municipal Code was checked for a codified fee section: the fee
schedule is *not* codified — it lives in the resolution, which is why the resolution rather
than a code chapter is the source. (Chapter 30 turned out to be the start of the Land
Development Code, not the buildings chapter.)

## 2. What the mechanism is

**Two building paths, three trade tables, one standing tripling sentence.**

| Schedule | Priced by |
| --- | --- |
| **Residential building, new** | `$0.20` per sq ft of gross floor area to outside walls, for "New single-family dwellings, townhouses, and duplexes"; "Remodels and additions follow the commercial process". |
| **Commercial building process (Fee Table)** | Total project valuation without land, seven bands: `$50` under `$2,000`; `$50` first `$2,000` + `$10`/`$1,000` to `$25,000`; `$280` + `$8` to `$50,000`; `$480` + `$7` to `$100,000`; `$830` + `$6` to `$500,000`; `$3,330` + `$5` to `$1,000,000`; `$5,830` + `$4` above. |
| **Electrical, residential** | Enclosed living area of "new, remodels, and additions to one-and two-unit dwellings and townhomes": `<1,000 sf $35`, `1,000–1,499 $65`, `≥1,500 $110 + $5.00 per 100 sf over 2,000`. |
| **Electrical, commercial** | "New (in Amps)": `≤150 $130`, `151–200 $200`, `201–400 $300`, `≥401 $300 + $50.00 per 100 amps over 401`. Plus plan review `$45` (unless part of the building permit), temp service `$45`, pools `$90`/`$180`, mobile home service `$45`, alternative energy `$45`, low voltage `$45`, residential solar PV `$250` bundled. |
| **Mechanical** | Material value: `$50` ≤`$500`, `$100` `$500.01–$1,000`, `$100` first `$1,000` + `$5`/`$1,000` **or fraction** above. |
| **Plumbing, residential new** | Bathrooms and dwelling units: one unit ≤1½ baths `$100`; one or two units 2–3½ baths `$150`; one or two units 4+ baths `$200`; >2 units `$200 + $30` per unit over two. "A roughed-in bathroom constitutes a bathroom." |
| **Plumbing, otherwise** | Plumbing valuation ("total dollar value of the complete plumbing installation including materials, fixtures, and all installation costs"): `≤$500 $50`, `$500.01–$1,000 $100`, above `$100` first `$1,000` + `$5`/`$1,000` **or fraction**. |

Cross-cutting, all from the same document:

- **Technology fees** (Administrative Fees): trade permits `$10`; residential new/alteration/
  addition `$20`; commercial new/alteration/addition greater of `$100` or `5%` of permit
  fee; other permits `$10`.
- **Plan check**: "the first 25% of the building permit fee", due at application,
  non-refundable, rate in effect at application — for building and sitework permits.
- **Expedited**: "the greater of $1000 or an additional payment of the permit fee, whichever
  is greater" (admin table: "$1000 or double permit fee").
- **Tripling**: "This fee is tripled on permits for work started or completed without an
  approved permit" — above the building, electrical, mechanical, plumbing, roofing,
  demolition, grading, sign and right-of-way schedules.
- **Reinspection**: `$45.00 per occurrence` ("Reinspection Fees are due before any other
  inspections may be performed"); `$150` for a second-or-more on the same team.
- **Valuation construction**: the commercial fee "is based on the value of the work covered
  by the permit", "determined using the City of Las Cruces Valuation Table ... as adjusted
  by the scope modifier and the local area modifier" — scope: addition/new `100%`, shell
  `75%`, remodel/repair/tenant finish/tenant remodel `50%`; local area `88%`; the valuation
  table's footnote: "Local area modifier and scope modifier will be applied to the table
  values above"; determination "by the building official based on the adopted Building
  Valuation Data Table".

## 3. What is modelled

Three pages, **42 rules** (13 building, 19 electrical, 10 plumbing), all validating.

- **Building:** the $0.20 residential-new path (gated on the dwelling type *and* the work
  type); the seven Fee Table bands as range-bounded `per_thousand`/`flat` rules behind a
  `not(residential-new)` gate; the residential `$20` and commercial `max($100, 5%)`
  technology fees; expedited; the tripling surcharge; the `$45` reinspection.
- **Electrical:** the four area rows (gated on one-and-two-family + work type + not-solar),
  the four amperage rows (gated on "not a one-and-two-family dwelling" by either the
  dwelling type or a non-residential occupancy), plan review `$45`, the flat rows (temp
  service, pools by dwelling type, mobile home, alternative energy, low voltage, bundled
  solar PV), the `$10` trade technology fee, tripling, reinspection.
- **Plumbing:** the four bathroom/unit bands behind the same residential-new gate, the three
  plumbing-valuation bands behind its negation, the trade technology fee, tripling,
  reinspection.

The facts the rules read: `custom.one_two_family` (the schedule's own line between its two
building paths, and between residential and commercial electrical), `work_type`,
`occupancy`, `valuation`, `square_footage`, `units`, `custom.bathrooms`, `custom.amperage`,
`custom.plan_review`, `custom.solar_pv`, `custom.swimming_pool`, `custom.temp_service`,
`custom.mobile_home_service`, `custom.alt_energy`, `custom.low_voltage`,
`custom.unpermitted_work`, `custom.reinspection`, and `is_expedited`.

## 4. The readings this model depends on

**(a) The fee table prorates; the trade ladders round up.** The Fee Table's bands read
"$10 for each additional $1000" — no "or fraction thereof". The mechanical ladder in the
same document reads "$5.00 for each additional $1,000.00 **or fraction thereof**", and so
does the plumbing valuation row; the phrase appears three times in the document and never
on the fee table. A schedule that writes the phrase where it means it and omits it where it
does not is read as meaning what it wrote: building `$2,001` costs `$50.01` (asserted),
plumbing `$1,001` costs `$105.00` (asserted), and the two assertions sit next to each other
in the test file because the pair *is* the reading. The electrical per-100 rows ("$5.00 per
100 sf over 2,000 sf", "$50.00 per 100 amps over 401 amps") also omit the phrase and are
prorated the same way — 2,400 sq ft adds `$20.00`, 451 amps adds `$25.00`.

The fee table's own seams confirm the reading: each band closes at exactly the next band's
printed base — `$280`, `$480`, `$830`, `$5,830` — which only holds under proration at the
stated boundaries (both readings coincide at exact multiples, but the printed bases are
what a prorated ladder computes continuously).

**(b) The $100 discontinuity at $500,000 is the document's, not a modelling error.** The
band below computes `$830 + 400 × $6 = $3,230` at `$500,000`; the `$500,001` band opens at
the printed `$3,330`. Both figures are stated in adjacent rows of the same table. Each band
is modelled with its own printed formula, the `$100` jump is asserted from both sides
(`323_000` at `$500,000`, `333_001` at `$500,001`), and the page says so — the same
discipline as Clark County's four-cents seam (engine doc §17.4).

The same table has a range typo: the band is printed "$101,001 through $500,000" while its
base reads "for the first $100,000" and the band below ends at `$100,000`. The range is
read as `$100,001`, matching the base in the same row, and the typo is printed on the page.

**(c) The entered valuation is the schedule's determined valuation — modifiers not
re-applied.** The scope modifier (`100/75/50%`) and local area modifier (`88%`) are, by the
valuation table's own footnote, applied "to the table values" — they are how the ICC's
national square-foot costs become a Las Cruces valuation, which the building official then
determines. The Fee Table reads that figure. This site takes the determined valuation as
its input and does **not** multiply again: re-applying `×scope×0.88` would charge the
schedule's own arithmetic twice. The page tells the reader what the entered number must
contain (value of the work covered, without land, post-modifiers) and the requirement row
quotes the full determination clause. **If the counter instead applies the modifiers to an
entered gross valuation at the terminal**, every fee-table figure here would be low — by
12% on new commercial work and by 56% on a remodel — and that is the one open question
worth a telephone call (§7).

**(d) Plan check is a payment schedule, not a component.** "Plan check fee is the first
25% **of** the building permit fee" — the first quarter of the money, at application,
non-refundable. It is not "in addition to" (Albuquerque's words) and not "deducted from"
(Newark's words): it was never outside the fee. So no rule adds it; the page shows the
25/75 split and the tests assert that no `plan_review` component exists on a Las Cruces
total.

**(e) The commercial "Service Change" row is published without a price.** The electrical
table prints "Service Change (Calculated service capacity using cost X 75%)" with **no
amount beside it**, and the residential section has no service-change row at all. The row
is quoted on the electrical page and modelled by nothing — inventing a rate from the
"cost × 75%" wording would be inventing a rate.

**(f) The partitions are answered facts, not defaults.** The two building paths, the
residential/commercial electrical split and the plumbing bands are all exclusive pairs. A
fact that was not answered excludes a rule rather than defaulting it: no `one_two_family`
answer charges neither `$0.20/sq ft` nor the commercial technology fee (the valuation still
prices, because the Fee Table asks only for the valuation); a bathroom count between 3½ and
4 charges nothing on the plumbing page; a dwelling's service upgrade by amperage charges
nothing. Every one of these states the reason in `excluded`, and the pages say which
questions the schedule asks.

## 5. What is NOT modelled, and why

- **Mechanical** — three bands, same shape as the plumbing valuation ladder including the
  round-up phrase; transcribed in full and recorded as a fourth `jurisdictionPermitType`
  with its rates, not attached to a page (this release's three pages follow the building/
  electrical/plumbing pattern).
- **Roofing** ("the Building Permit Fee schedule applies per the applicant's valuation"),
  **demolition** (`$0` with a building permit, `$50` interior non-load bearing, `$175` all
  other).
- **Site work**: grading (four rows by acreage), floodplain review (`$150`), site cleanup
  (`$1,000` + cost), rock walls (5% of construction value; yard walls `$0` zoning check),
  right-of-way (5% of construction value; franchisees 5% for maintenance/aerial, new
  underground by trenching value, others no fee), traffic (`$50` control review, `$175`/
  `$350` per week/month, `$85` an hour TIA, one-day free), erosion/storage/temporary
  equipment "No fee at this time".
- **Signs** (`$45`/`$70`/`$100`/`$250` by type, face change `$0`, real estate/construction
  `$0`), **fire systems** (water/chemical and tenant-improvement head ladders `$120–$640`
  + `$200` per hundred, additional hydraulic calculation `$40`, chemical/dry/foam/pre-action
  `$40`, fire pumps `$160`/`$80`, commercial alarm `$160–$320`, hoods `$80`, after-hours
  `$60/hr`), **mobile home installation** (`$75`, zoning and floodplain — the electrical
  connection permit is this site's `$45` row).
- **Certificates and other building fees**: change of occupancy `$45`/`$100` (creditable
  within 90 days), reinstatement 25% of the building permit fee, temporary CO greater of
  `$100` or 25%, same-day CO `$100`.
- **Inspection charges beyond reinspection**: after-hours `$60/hr` (two-hour minimum),
  partial inspection `$45`, second-or-more reinspection on same team `$150`, fire
  after-hours `$60/hr`. The `$45` per-occurrence reinspection is modelled on all three pages.
- **The revision/addendum fee** (`$45` per reviewer) — the number of reviews is not knowable
  at application.
- **Land-use and administrative review application fees** (`$150–$1,000`, hourly
  statements, subdivisions `$220 + $5/lot`, rezonings `$600`, etc.) and the **UNAPPROVED OR
  NON-PERMITTED variance fees** (`$100–$2,000`, assessed by the board that hears the
  variance).
- **Fee waivers and the infill incentive** (waivers only where the Municipal Code allows,
  credited from a city account; infill reimbursement on CO issuance, above `$5,000` only
  with Council approval), and **HISTORIC PRESERVATION FEES**, which the schedule itself
  marks "This section to be developed."
- **The "Utility Fees section"** the plumbing fee's line points at ("Additional fees may
  apply. Refer to the Utility Fees section for additional information") — **this resolution
  does not contain such a section**; the table of contents runs from General Information to
  Historic Preservation with no Utility Fees entry. Whatever those fees are, they are in
  another document this pass did not find. Named on the plumbing page, charged by nothing.

## 6. Effective dates

- **Fees as modelled:** `effectiveFrom = 2020-09-01` — the resolution's own title and
  enactment clause ("to be effective September 1, 2020").
- **The resolution:** `documentDate = 2020-08-17`, the adoption date printed on the
  Council Action form.
- **Currency check:** no amending resolution for the fee schedule was published on the
  City's document portal as of 2026-09-25 (searched for 2022–2025 fee-schedule
  resolutions; only 21-019 and unrelated hits appear), and the schedule's own rule — "The
  rates in effect at the time of permit issuance apply unless otherwise noted" — is the
  currency statement the pages quote. The earlier resolutions 90-235, 00-360, 03-361,
  03-009, 11-221, 14-026 and 19-131 are repealed by this one and superseded for every row
  modelled here; Resolution 19-131 survives only as history — it is the instrument that
  raised the residential rate from `$0.14` to `$0.20`, which the schedule's background note
  records.

## 7. Open questions

- **Where the scope and local-area modifiers are applied in the counter's software.** §4c.
  This site treats them as inputs to the official's valuation determination (the reading
  the valuation-table footnote supports). The alternative — modifiers applied to an entered
  gross valuation when the fee is computed — would change every fee-table figure, and the
  schedule's own sentences can be read either way: "It shall be determined using the City
  of Las Cruces Valuation Table ... as adjusted by ..." has an "It" (the fee, or the
  valuation?) that the document never resolves. One question to the One Stop Shop settles
  it: *"When a permit application enters a valuation, is the scope modifier applied before
  the fee table is read?"*
- **How the 25% plan check appears on the receipt.** The reading here (part of the fee,
  split payment) follows "the first 25% of the building permit fee"; whether the counter
  prints it as a line inside the total or as a separate charge is not visible from the
  document. Either way the total is the same, which is why this is a presentation question
  rather than a modelling one.
- **What the missing Utility Fees section contains.** Water/sewer connection charges are
  the obvious candidates, and the plumbing page says exactly that: they would be looked
  for in a document this pass did not find.
- **The Service Change price.** §4e — the row exists with no amount; if the City publishes
  the calculation (cost × 75% of service capacity, then what?), it becomes an `amperage`-
  or valuation-based rule in a later pass.
- **A bathroom count between 3½ and 4.** No band contains it; the schedule may intend
  "2 to 3½" to run to 4 by drafting rather than by fact, but the model does not close a gap
  the document leaves open.
