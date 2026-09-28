# Albuquerque, New Mexico — research record

**Status: published** (New Mexico, pass 12). Three permit pages: building, electrical and
plumbing.

- **Verification date:** 2026-09-25
- **Issuing authority:** City of Albuquerque, Planning Department — Building Safety Division,
  Plaza Del Sol, 505-924-3320 (permits and plan review 8 a.m.–5 p.m.; inspections and trade
  permits 7:30 a.m.–4:30 p.m., Monday to Friday)
- **Enabling law:** the City's own **Uniform Administrative Code (UAC)**, Section 112 "Fees".
  New Mexico's statewide technical codes (the UAC adopts them with local amendments) carry an
  effective date of January 1, 2025 per the UAC's Exhibit A; Section 112 collects every permit
  fee the City charges inside the same document.

| Document | Where |
| --- | --- |
| 2024 City of Albuquerque Uniform Administrative Code — §112 "Fees": §112.2 (Tables 112-A–H), §112.2.1 (valuations and the regional modifiers), §112.3 (plan review), §112.4 (investigation), §112.5 (refunds), Tables 112-A (building), 112-B (electrical), 112-D (plumbing) | `https://www.cabq.gov/planning/documents/2024-uac-adopted.pdf` |
| "Fee Schedule — Plan Review & Building Permit Handout (Revised April 2010)" — the Division's seven-page handout printing Table 112-A multiplied out in four columns | `https://www.cabq.gov/planning/documents/FeeSchedule.pdf` |
| Building Safety Division FAQ — plan review 65%, FasTrax, valuation language | `https://www.cabq.gov/planning/building-safety-division/building-safety-faqs` |
| Building Safety Division permits page — phone, Plaza Del Sol, hours, homeowner exam, licensed-contractor rule | `https://www.cabq.gov/planning/building-safety-division/permits` |
| Sitemap used to enumerate the Division's URLs (permits, inspections, FasTrax, forms, online applications) | `https://www.cabq.gov/legal/sitemap` |

## 1. Access

`cabq.gov` is **reachable directly** — a Plone 6 site that answers plain clients — so no proxy
was needed for anything cited here. The sitemap endpoint enumerates every page, the two fee PDFs
download with normal requests, and the FAQ and permits pages extract cleanly from HTML. One
general lesson for this project: an earlier search pass treated Albuquerque as blocked because
search-engine snippets were thin; the documents themselves were never behind a wall.

Three secondary reads supported the primary ones:

- **The City's electrical fee estimator (XLSX)**, served from `cabq.gov`, which restates the
  Table 112-B item rates and their formulas — useful as an independent restatement, not cited
  for any rate.
- **A historical DFA budget table** ("TABLE NO. 3_B: ELECTRICAL PERMIT FEES", the pre-2000
  schedule) which was *decisive*: it is the same table with every rate exactly halved, and the
  ×2 relationship is what resolved a `pdftotext` column-alignment problem in Table 112-B (§4f).
- The handout's own columns, which reproduce Table 112-A × modifier row for row — 335 rows
  checked programmatically with zero mismatches.

## 2. What the mechanism is

**One raw ladder priced twice for buildings; printed per-item rows for the trades; plan review
on top of everything.**

| Schedule | Priced by |
| --- | --- |
| **Building (Table 112-A × §112.2.1 modifier)** | Valuation: six bands — `$23.50` first `$500`, `$3.05` per `$100` or fraction to `$2,000`; `$69.25` + `$14.00` per `$1,000` to `$25,000`; `$391.75` + `$10.10` to `$50,000`; `$643.75` + `$7.00` to `$100,000`; `$993.75` + `$5.60` per `$1,000` unbounded — times `.67` (apartments, public, commercial) or `.50` (one- and two-family dwelling and townhouse, *including renovations, alterations and additions*), floored at `$23.50`. |
| **Electrical (Table 112-B, modifier 1.0)** | `$47.00` administrative charge on every application; meter loops `$40.00` (temporary `$40.00` separate permit, ganged `$60.00` per gang); outlets `$1.50` each first 20 / `$0.90` above; commercial lighting fixtures `$1.50` first 20 / `$1.00` above; panels `$8.00`; sign connections `$40.00`. Plus motor equipment, coolers, appliances, transformers, space heating, communication/signal, pre-final and pool rows (not modelled). |
| **Plumbing (Table 112-D, modifier 1.0)** | `$47.00` administrative charge; fixture `$10.00` "includes drain and vent"; gas outlet `$6.00`; water distribution `$14.00`; water service `$14.00`; sewer tap `$18.00`; house sewer + 2-way cleanout `$28.00`; lawn sprinkler per meter `$18.00` incl. backflow; atmospheric vacuum breakers `$15.00` (1–5) / `$3.00` above; other backflow devices `$15.00` (≤2") / `$30.00` (>2"), "(ALSO FOR REPAIR)"; sewer repair in street `$16.00`; roof drain `$12.00`; septic tank `$80.00`; pools `$80.00`/`$60.00`; fire, utility-service, hydrant and interceptor rows (not modelled). |

Three rules cut across the tables:

- **The regional modifier** (§112.2.1): `.67` / `.50` for Table 112-A only; **1.0** for Tables
  112-B, 112-C, 112-D, 112-E, 112-F and 112-G — the trade rates are charged as printed. Each
  Table 112-A modifier carries "(Minimum fee shall $23.50)".
- **Plan review** (§112.3): `65%` of the building or sign permit fee, `25%` of the electrical,
  mechanical and plumbing permit fee, charged "at the time of submitting plans", and — the
  sentence that decides its modelling — "separate fees from the permit fees specified in
  Section 112.2 and … **in addition to** the permit fees". The FAQ confirms from the counter:
  "Plan review fees are paid at the time of submittal. They are 65% of the permit fee, plus
  zoning and hydrology fees."
- **Investigation for work without a permit** (§112.4.2): an investigation fee "in addition to
  the permit fee … equal to the amount of the permit fee required by this Code", collected
  "whether or not a permit is then or subsequently issued", with "the same … minimum fee" as
  the tables.

## 3. What is modelled

Three pages, **27 rules** (5 building, 10 electrical, 12 plumbing), all validating.

- **Building:** the generated commercial column and residential column (one raw-ladder
  function + two modifier generators, not 335 transcribed rows); plan review at 65% of
  `permit_fee` as its own `plan_review` component; the investigation fee at 100% of
  `permit_fee` as a `surcharge`; the `$47.00` re-inspection "each" from Table 112-A's Other
  Inspections list.
- **Electrical:** the administrative charge (unconditional — the table says "all
  applications"); meter loops; the outlets pair (first-20 rule gated `lte 20`, over-20 rule
  with `baseCents 3000, thresholdUnits 20` so 20 pay `$30.00` and 21 pay `$30.90`); the
  lighting pair with its own `$1.00` over-twenty rate; panels; sign connections; plan review
  at 25%; the investigation fee.
- **Plumbing:** the administrative charge; fixtures; lawn sprinkler per meter; the backflow
  pair (default ≤2", `custom.backflow_over_2in` selects the `$30.00` row); gas outlets on
  `custom.openings`; the three connection rows gated on `eq true`; septic tanks; plan review
  at 25%; the investigation fee.

The facts the rules read: `custom.one_two_family` (the modifier's construction class — asked
directly because "apartments … and one- and two-family dwelling" is a construction question
an occupancy label cannot answer), `custom.plan_review`, `custom.unpermitted_work`,
`custom.reinspection`, `custom.outlets`, `custom.lighting_fixtures`, `custom.panels`,
`custom.signs`, `custom.meters`, `custom.backflow_devices`, `custom.backflow_over_2in`,
`custom.openings`, `custom.water_service`, `custom.sewer_tap`, `custom.house_sewer`,
`custom.septic_tanks`.

## 4. The readings this model depends on

**(a) The $23.50 minimum is applied after the modifier, not before.** §112.2.1 prints the
minimum beside each modifier. A `$600` valuation computes raw `$26.55` → `$17.79` at `.67` and
`$13.28` at `.50`, and the handout's columns print `$23.50` for both — so the floor is taken
against the multiplied figure. The fingerprint is in the crossings: the commercial column
first exceeds `$23.50` at an **$801** valuation, the residential at **$1,201**. Both are
asserted in the tests one cent either side.

**(b) The published handout is derived, not independent.** All 335 of its rows = raw ladder ×
modifier, rounded half up, floored at `$23.50` — checked row by row before a line of content
was written, zero mismatches. Two consequences: this site computes the product instead of
transcribing it, and disagreements with the handout can only come from rounding, not from a
different schedule.

**(c) The generated table continues past the handout's last row.** The handout stops at a
`$321,000` valuation; Table 112-A's sixth band is unbounded ("$5.60 for each additional
$1,000 or fraction thereof"). The generator runs the City's own formula to a stated
`$10,000,000` ceiling; above it the engine applies the top bracket with a warning, and the
pages say so in words. No bracket was invented.

**(d) Plan review is a charge, and it is gated.** Newark's 20% is a prepayment credited back;
Albuquerque's 65%/25% is "in addition to the permit fee", so it is a component here. It is
gated behind `custom.plan_review` because §112.3 opens "When a plan or other data is required
to be submitted by Sections 110.2 and 110.3" — a permit without submitted plans owes no plan
review fee. The investigation surcharge reads `permit_fee` (base only), so an unpermitted-work
permit doubles the *permit* and not the plan review, which matches §112.4.2's definition.

**(e) Plan review is computed from the rounded permit fee.** The handout's plan-review column
sometimes comes from an unrounded intermediate: row 1 (`$23.50 × 65% = $15.275`) prints
`$15.27` in the commercial column and `$15.28` in the residential column of the same table.
The code states a percentage, so this site charges 65% of the permit fee rounded half up, and
the cent-level differences from the handout's column are this source of.

**(f) Table 112-B's extracted amount column is shifted one row below item 5(c).** `pdftotext
-layout` prints `9 Sign Connections $8.00`, which is wrong: the schedule's amounts sit one
label-row low across items 5(c)–15 after the page break at `-19-`. The historical DFA table
("TABLE NO. 3_B") has every rate exactly halved, and pairing under the one-row shift makes all
eight of items 8–15 come out at exactly ×2 (residential fixed appliances `$8`, **sign
connections `$40`**, transformers `$8`, space heating `$8`, communication and signal `$20`,
pre-final `$40`, pools `$80`/`$60`), while the unshifted reading breaks ×2 on seven of eight.
Items 1–4 are unshifted (×2 exact as printed: `$40`, `$1.50`/`$0.90`, `$1.50`/`$1.00`) and the
`$47.00` administrative charge matches Table 112-A's hourly rate independently. Modelled rows
therefore use: panels `$8`, signs `$40`. The ambiguous rows (motors, transformers, pools, …)
are named on the page **without** rates and are not charged.

**(g) Re-inspection differs between the tables.** Table 112-A prints "Re-inspection fee
assessed under provisions of Section 113.5.8 — **$47.00 each**"; Tables 112-B and 112-D print
the same line under an "Other Inspections and Fees: **$47.00 per hour**" header. The building
row is modelled as `$47.00 each`; the trade rows are named on the trade pages as hourly and
not charged, because "per hour" for a re-inspection event has no quantity this site collects.

## 5. What is NOT modelled, and why

- **Zoning and hydrology review** — the handout's own footers: "Zoning: $25 < 4000sqft or $45
  > 4000sqft" and "Hydrology: $50". Real charges on a plan-reviewed permit, but the schedule
  never says what the 4,000 square feet is measured on (lot, floor area, review area), and
  that ambiguity *is* the fee. Named on every page, charged on none.
- **Tables 112-C (mechanical), 112-E (signs), 112-F (walls), 112-G (re-roof)** — published in
  the same section; this release's three pages follow the Newark pattern (building, electrical,
  plumbing).
- **Demolition** (`$47.00` to 1,500 sq. ft. + `$10.00` per additional 500 sq. ft. or
  fraction), **temporary CO** (`$50.00`), **certificate of occupancy** (`$100.00`).
- **The hourly and recheck charges**: outside-hours and no-fee inspections `$47.00/hr`
  (two-hour minimum), additional plan review for changes `$47.00/hr`, rechecks and duplicate
  plan sets at ½ plan check fee, preliminary/integrated review `$75.00/hr`, and trade
  re-inspection `$47.00/hr` (see §4g).
- **FasTrax** — the FAQ's expedited plan review at "three times the cost for the standard plan
  review" (the sentence continues past what the page exposes; see §7).
- **Electrical rows rated by equipment**: motor operated equipment, evaporative coolers,
  residential fixed appliances, transformers, space heating, communication and signal systems,
  pre-final inspections, swimming pools — per horsepower, per unit, per pool; no input here
  collects those. Named without rates (§4f).
- **Plumbing rows not collected**: gas line tests (`$10.00`), high-pressure tests (`$16.00`),
  temporary gas (`$40.00`), water distribution (`$14.00`), atmospheric vacuum breakers by
  count, sewer repair in a public street (`$16.00`), roof drains (`$12.00`), pools, the fire
  rows, utility service lines, hydrant inspections, interceptors/ejectors, and the catch-all
  fixture row. The water distribution row in particular is excluded because the schedule does
  not distinguish it from a water service by any fact this site asks for — and charging both
  would be a guess.
- **Fee refunds** (§112.5), **City Projects' Promise to Pay** (§112.3), and anything another
  authority charges (CID statewide licensing, utility fees).

## 6. Effective dates

- **Fees as modelled:** `effectiveFrom = 2025-01-01` — the UAC 2024 edition's Exhibit A
  effective date for the technical codes it amends. Section 112 prints no separate fee
  effective date; this is the document's own.
- **The handout:** "Revised April 2010" — cited as corroboration of the computed columns, not
  as the operative schedule (`effectiveFrom = null`).
- **FAQ and permits page:** undated pages, read 2026-09-25, cited for interpretation and
  process facts rather than for dated rates.

## 7. Open questions

- **Whether the counter computes plan review from the rounded or the unrounded permit fee.**
  The handout's own columns disagree with each other at row 1 (§4e), so the City's software
  and the printed table are not perfectly consistent. This site follows the code's percentage
  on the rounded fee; a one-cent difference from the handout is possible on small permits.
- **What the 4,000 square feet in the zoning fee measures.** Not charged here until the
  schedule says (§5).
- **Whether the $47.00 administrative charge belongs inside the 25% trade plan review base.**
  Readings considered: §112.3 says "25 percent of the total permit fee as set forth in Tables
  112-B/112-D", and the administrative charge is row 1 of those tables — so it is inside the
  base here. If the Division reads "permit fee" as the item rows only, trade plan review on
  this site is `$11.75` high on every permit (25% × `$47.00`), and that is the whole
  exposure.
- **FasTrax's exclusions.** The FAQ sentence reads "three times the cost for the standard plan
  review, excluding the …" and the page cuts the sentence there; whatever is excluded is not
  recorded because it was not readable.
- **Whether an apartment building with ground-floor retail is `.67` throughout.** The modifier
  text splits by construction class with no mixed-use language; the model asks one answer per
  permit and prices the whole valuation at that rate. A mixed-class permit should be confirmed
  with the Building Official, and the page says the modifier is a construction-class question.
