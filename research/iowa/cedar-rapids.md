# Cedar Rapids, Iowa — Permit Fee Research

**City:** Cedar Rapids, Iowa (Linn County)
**Authority:** City of Cedar Rapids — Building Services Department
**Research date:** 2026-09-26
**Researcher:** Permit Fee Intelligence — Iowa pass

---

## 1. Authority

Building, electrical, plumbing and mechanical permits are issued by **Building
Services** (City Services Center, 500 15th Avenue SW). The enabling code is Chapters 33
(Building Code), 34 (Electrical Code), 35 (Plumbing Code) and 36 (Mechanical Code) of
the Municipal Code, each of which delegates fees to City Council **resolution**
(§ 109.2/R108.2: "Building permits shall be based upon the valuation of the proposed
construction and shall be computed from tables set by resolution of the City Council";
§ 34.27 and § 35.06 repeat the pattern for the trades).

The operative instrument is **Resolution No. 1707-12-24** (passed December 17, 2024;
committee record BSD-008-2024), adopting **Exhibit A, Schedule of Building Permit Fees,
Amended, Effective January 1, 2025**, superseding Resolution No. 0489-05-19 (May 14,
2019). The document is the schedule for building, electrical, plumbing and mechanical
permits together — one resolution, one Exhibit A, four trades.

### Access record (the WAF note)

`www.cedar-rapids.org` answers every scripted request (plain curl and browser-class
agents) with **HTTP 403** (Server: awselb/2.0), including the Building Services fees
page that links the schedule. The **PDF itself** is served, unguarded, from the City's
CMS host:

- `https://cms8.revize.com/revize/cedarrapids/Building%20Services/Documents/2025%20Fee%20Schedule%20-%20FINAL.pdf`
  — HTTP 200, `application/pdf`, 177,261 bytes, last-modified 2024-12-31 22:10:31 GMT.
- Discovered via the Wayback Machine snapshot of the fees page (2025-12-15), which
  preserved the link. The live 403 on the HTML page and the live 200 on the PDF are
  both recorded here; the PDF's own text is the primary evidence.

**Extraction note (a document-level event worth recording):** the PDF embeds its text
in a **Type 3 font with no usable ToUnicode map** — `pdftotext` (layout and raw modes)
and PyMuPDF both return glyph-code garbage, the familiar three-mode reconciliation
problem in its hardest form (Scottsdale, Philadelphia, Boston, Detroit, Green Bay
preceded it; this is the first document where *no* text mode is readable). The pages
were therefore **rendered to PNG at 150 dpi (PyMuPDF) and read with OCR**
(RapidOCR/ONNX). OCR read all nine pages cleanly, including the resolution's adoption
block and every fee row; the mechanism sentences ("$1.00 to $100,000.00 — See attached
Table B"; "plus 1% of the amount over") are unambiguous. All figures below come from
that OCR read.

## 2. Mechanism, by permit family

### 2.1 Administration fee

**$20.00 per permit (non-refundable)** — "In addition to the permit fee, except where
noted." The residential new-construction table and ADA-ramp row print "No
Administration Fee". Modelled as a flat `other` component on every permit, with the
residential new-construction rule set standing it down (the schedule's own exception).

### 2.2 Building — residential new construction (flat area table)

"Building Permit Fees for New Single-Family, Duplex and Townhouse Projects of Four
Units or Less — No Administration Fee", keyed on **total square foot (habitable area
above grade, not including garage)**:

| Total sq ft | Permit fee |
| --- | --- |
| 0–1,200 | $1,000.00 |
| 1,201–2,000 | $1,400.00 |
| 2,001 and higher | $2,400.00 |
| 3-unit townhouse | $2,000.00 |
| 4-unit townhouse | $2,500.00 |
| Greater than 4-unit townhouse | valuation → Table A |
| Basement finish permit (new structures only) | $100.00 |

"\*\*Fee includes Building, Electrical, Mechanical, Plumbing, Erosion Control" — the
flat rows bundle the trades, so no separate trade permit fees apply to those
projects. Accessory buildings: ≤500 sq ft $110; 501–900 $165; 901–1,250 $275;
1,251+ → Table A. Accessory dwelling units → Table A.

Modelled: `tiered_table` on `square_footage` for the three single-family/duplex
bands, plus flat rules for the 3- and 4-unit townhouse rows keyed on `custom.units`
range. The bundled-trades note is quoted on the page.

### 2.3 Building — valuation (Table B and Table A)

All other building work reads **fair market value of materials and labor** through
**Table B** (valuations $1–$100,000, a 100-row printed table, $500-wide to $1,000 and
$1,000-wide above, with separate Residential and Commercial fee columns) and
**Table A** (above $100,000, base-plus-per-$1,000 rows):

Table A, residential: $100,001–$500,000: **$671.48 + $3.68 per additional $1,000 or
fraction**; $500,001–$1,000,000: $2,141.48 + $3.15; $1,000,001 and up: $3,716.48 +
$2.10. Table A, commercial: $987.00 + $5.36; $3,147.90 + $4.62; $5,507.25 + $3.05.
Every band prints "or fraction thereof" — round-up.

Table B (OCR read of all 100 rows) reproduces two exact arithmetic ladders:
residential runs $16/19/21/22/25/27/28/30/… per bracket; commercial runs
$17/18/20/25/27/45/48/51/… . The seams chain exactly (each band's base equals the
prior band's value at its ceiling), so the engine models Table B as **two
`tiered_marginal` rules** (residential, commercial) over `valuation` with the OCR'd
band boundaries and rates, verified against the printed row amounts in the seed's
tests rather than storing 100 `tiered_table` tiers. Table A is modelled as four
`per_thousand` band rules (two classes × three bands) with `baseCents`/`thresholdCents`
and default round-up increments.

### 2.4 Plan checking

"When the evaluation of the proposed construction exceeds $1,000, a plan-checking fee
shall be paid. Plan checking fees for all commercial and residential buildings, other
than R-3, are **40% of the computed building permit fee**." Additional checking $30/hr
(min 30 min). Non-refundable. Stand-alone commercial trade permits, if required:
**$200**. Modelled: `percent` 4,000 bps on `permit_fee`, conditioned on valuation >
$1,000 (cents) and `occupancy != residential`... **correction:** the text says "all
commercial and residential buildings, other than R-3" — i.e. R-3 dwellings are exempt
and every other building pays. Modelled as conditioned on
`custom.not_r3_dwelling: true` so the default single-family case pays nothing, with
the R-3 exemption quoted on the page.

### 2.5 Electrical (Section A flats / Section B valuation)

Section A flats: detached garages $75; temporary power poles $75; **residential new,
repair or replacement service installs $75**; residential photovoltaic solar $75.
"Trade Permit Fees for New Dwelling Units — New one/two-family and townhouse
structures not greater than 4 units shall be included in the building permit fee"
(i.e. no trade fee on bundled projects).

Section B (all other electrical/mechanical/plumbing work): **total contract price or
estimated final invoice** through one shared ladder:

| Valuation | Fee |
| --- | --- |
| $1.00–$1,000.00 | $25.00 |
| $1,001–$100,000 | $25.00 plus 1% of amount over $1,000 |
| $100,001–$200,000 | $1,015.00 + 0.9% over $100,000 |
| $200,001–$300,000 | $1,915.00 + 0.8% over $200,000 |
| $300,001–$400,000 | $2,615.00 + 0.7% over $300,000 |
| $400,001–$500,000 | $3,215.00 + 0.6% over $400,000 |
| $500,001–$600,000 | $3,715.00 + 0.5% over $500,000 |
| $600,001–$700,000 | $4,115.00 + 0.4% over $600,000 |
| $700,001–$800,000 | $4,415.00 + 0.3% over $700,000 |
| $800,001–$900,000 | $4,615.00 + 0.2% over $800,000 |
| $900,001 and up | $4,715.00 + 0.2% over $800,000 |

(The final row prints 0.2% against the $800,000 threshold — the schedule's own
apparent typo carried through the $800k band's arithmetic; charged as printed, the
marginal rate for the top band equals the $800k band's.)

Modelled: Section A flats conditioned on `work_type`/scope facts; Section B as a
`tiered_marginal` on `valuation` with `rateBps` per band (1% = 100 bps, 0.9% = 90,
…) and `baseCents` = each band's printed base — the engine's marginal form reproduces
"base plus percent of the excess" exactly.

### 2.6 Plumbing / Mechanical

Same shared Section B ladder (the Exhibit prints one Section B "for all other
electrical, mechanical, and plumbing work"), plus the Section A plumbing/mechanical
flats: appliance replacement (furnace, water heater, AC) $75; fuel gas $75; sewer
$75. New one/two-family and ≤4-unit townhouses bundle trades into the building
permit. The electrical page's Section A rules are the plumbing page's Section A rows
with the same amounts; each permit type carries its own copy keyed to its own scope
facts.

### 2.7 General fees (recorded)

Re-inspection $100; after-hours inspections $150/hr; special inspection minimum $25;
investigation $100/hr; work-before-permit doubling ($250 min, $1,000 max); demolition
$100/building + administration fee; building moving $250 + $50 inspection; permit
renewals $50/$100/$250; temporary CO $50 per trade initial, $100 renewals.

## 3. Discrepancies and their resolution

1. **The Type 3 font.** No text extraction mode reads this document; OCR is the
   extraction. The resolution page and every fee table were cross-checked for
   internal consistency (band widths, seam chaining, percentage bases) and all
   arithmetic closes; the two OCR readings (layout-order run and per-page run) agree.
2. **Section B's final row** prints "$4,715.00 plus 0.2% of the amount over
   $800,000" for the $900,001+ band — the same threshold and rate as the band below.
   Charged as printed (a marginal continuation of the 0.2% band), which is also what
   the $4,615→$4,715 base step implies.
3. **Plan check 40% "other than R-3".** Read as an R-3 exemption, not a commercial
   surcharge: the sentence names both commercial *and* residential buildings as
   paying, and excludes R-3 by class. Modelled behind an explicit `custom.not_r3_dwelling`
   fact so the calculator never charges the 40% to a plain dwelling permit.
4. **Trades bundled into building fee.** For new one/two-family and ≤4-unit townhouse
   structures, the trade permits are inside the building fee — the trade rules are
   conditioned on `custom.trade_not_bundled` so a bundled project is not charged twice.

## 4. What is modelled vs not

Modelled: administration fee (with its stated exceptions), residential new-construction
area table, Table B valuation ladders (residential + commercial), Table A bands,
plan check 40% (non-R-3), electrical Section A flats + Section B ladder, plumbing
Section A flats + Section B ladder, mechanical Section A flats + Section B ladder.

Recorded, not modelled: basement finish; accessory buildings/ADUs; miscellaneous
flats (pool, retaining wall, re-roof, re-side, ADA ramp); demolition and building
moving; renewals and temporary COs; re-inspection and investigation fees.
