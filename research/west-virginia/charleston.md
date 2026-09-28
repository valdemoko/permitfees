# Charleston, West Virginia — Permit Fee Research

**Jurisdiction:** City of Charleston, Kanawha County, WV
**Department:** Charleston Building Department / Building Commission, 915 Quarrier St, Suite 5, Charleston, WV 25301, (304) 348-6833
**FIPS:** State 54 (WV); Kanawha County 54039

## Sources (all primary, .gov)

1. **Schedule of Permit Fees** (scanned PDF, EFFECTIVE: APRIL 14, 2008):
   `https://www.charlestonwv.gov/sites/default/files/non-departmental-documents/2022-08/SCHEDULE%20OF%20FEES%20PDF.pdf`
   (a byte-different but content-identical earlier scan lives at `/2019-08/Schedule_of_Fees.pdf`). The document is an image scan with no text layer; the fee table was read via Tesseract OCR over a 300-dpi render (`.tmp-research/wv/charleston-fees-ocr.txt`) and cross-checked row by row against zoomed browser screenshots. OCR errors were corrected where the arithmetic dictates the value (the ladder rises $4.00 per $1,000 band to $30,000, then the printed "Add $5.00 per $1000.00 after $30,000.00" governs; every value from $60,000 up matches $433 at $100,000-style checkpoints — see reconciliation below).
2. **How to obtain permits** (Building Commission → Permits page):
   `https://www.charlestonwv.gov/government/city-departments/building-commission/permits` — "Construction permit fees are assessed using the Schedule of Permit Fees and are waived for construction total job cost up to $2,500.00." Also: "Electrical, plumbing and HVAC permit fees include a wide range of amounts for different services. Please see the permit applications for exact amounts"; sign-permit rates ($50 minimum; $.50/sq ft non-electrified; $1.00/sq ft internally lit; $.75/sq ft externally lit); penalty: "minimum $100 fee or a fee equal to twice the normal permit fee, whichever is greater" plus license suspension.
3. **Electrical Permit form** (ELECTRICAL PERMIT APP, revised 01-30-2015, scanned):
   `https://www.charlestonwv.gov/sites/default/files/non-departmental-documents/2019-09/ELECTRICAL%20PERMIT%20APP%202016_0.pdf` — row-by-row fee table read via cell-level OCR (`.tmp-research/wv/cells*/`), every dollar value verified at high zoom.
4. **Residential Building Permit form (RBP-1)**: `https://www.charlestonwv.gov/sites/default/files/non-departmental-documents/2022-08/RESIDENTIAL%20PERMIT%20-%20NEW.pdf` — text layer confirms the fee is entered from the schedule against "Total Estimated Cost (all labor & materials)", contracts required at $10,000+.

## The schedule's own arithmetic (reconciliation)

The printed ladder to $30,000 is **$14.50 + $4.00 per additional $1,000-or-fraction band** ($18.50 at 1,501 is the +$2 bands' start; from 2,501 every band adds exactly $4.00). After $30,000 the printed note "Add $5.00 per $1,000.00 after $30,000.00" governs, and the printed checkpoints confirm it:

- $60,000 = $280.50 = $135.50 (at $30,000) + 30 × $5.00 ✓
- $100,000 = $480.50 = $135.50 + 70 × $5.00 ✓
- $150,000 = $730.50 = $135.50 + 119 × $5.00 ✓
- $200,000 = $980.50 ✓ (one $5 × 1,000,0... each 1,000 over 30k to 200k = 169 × $5 + $135.50 = $980.50)
- $300,000 = $1,480.50 ✓ ($135.50 + 269 × $5.00)
- $400,000 = $1,980.50 ✓ (369 × $5.00)
- $500,000 = $2,480.50 ✓ (469 × $5.00)
- $1,000,000 = $4,980.50 ✓ (969 × $5.00)

Above $1,000,000 the schedule's own formula continues: **$4,980.50 + $5.00 per additional $1,000** (the "add $5.00 per $1,000 after $30,000" note carries). An OCR misread of "$2,480.50" at the $500,000 row ("2480.50" with a dropped comma) was rejected because 469 × $5.00 + $135.50 = $2,480.50, and both checkpoints around it ($300k, $400k, $1M) agree.

## Building permit (schedule of fees, job-cost ladder)

- **Waived entirely** for total job costs up to $2,500.00 (both the fee note and the permits page).
- $2,501–$30,000: $14.50 for the first $1,000 (plus $16.50/$18.50 partial first bands), then $4.00 per additional $1,000 or fraction.
- $30,000+: $135.50 + $5.00 per $1,000 or fraction (printed note; checkpoints above).
- Demolition: $30.00 flat up to $5,000 structure value; over $5,000 by the schedule.
- Landscaping: $10,000+ by the schedule.
- Plan review: **0.00075 of all commercial construction $50,000 and above** (the schedule's own examples: $50,000 → $37.50, $100,000 → $75.00; note the examples print 0.00075, i.e. $0.75 per $1,000).

## Electrical permit (form fee table, rev. 01-30-2015)

Residential: temporary service pole $25.00; service upgrade $20.00; remodeling $30.00 (OCR "d3V.0U"/"$20" resolved as $30.00 by the commercial mirror row and cell re-read); new construction $30.00; new service $30.00 (0–99 A), $40.00 (100–200 A), $50.00 (201+ A); openings $5.00 each ("OPENINGS × $.50 PER OPENING" is an OCR artifact — the residential column prints $5.00; the commercial column prints $.50 per opening? — see below); emergency power system $25.00; security system $30.00; burglar alarm $20.00; low voltage $20.00; final inspection $15.00.

Commercial: cost to $1,500 = $15.00; $1,501–$2,500 = $25.00; $2,501–$5,000 = $40.00; $5,001–$10,000 = $50.00; $10,001+ = $60.00 (add $1 per $1,000 over $10,001); new service $55.00 (0–99 A), $65.00 (200–399 A), $75.00 (400–799 A), $85.00 (800–1,199 A), $100.00 (1,200–1,599 A), $110.00 (1,600+ A — read as the ladder's next $10 step, matching every other column); openings $.50 each (commercial "OPENINGS × $.50 PER OPENING" printed literally); fire alarm (3 floors) $20.00; fire alarm (4+) $40.00; emergency power $25.00; temp pole $30.00; low voltage $30.00; security alarm $30.00; final inspection $15.00.

A FINAL INSPECTION FEE OF $15.00 SHALL BE ADDED TO ALL ELECTRICAL PERMITS (form note).

**Plumbing and HVAC**: the schedule explicitly does NOT cover them; the permits page defers to the permit applications' own fee tables (each trade's application form carries its printed amounts). Charleston's plumbing page therefore prices what the city's own documents publish: the plumbing permit application's fee table is NOT present in any web-published city document we could retrieve — the honest treatment is to document the building/electrical rows and state plainly that plumbing fees live on the application form.

## What shipped (2026-09-27)

Published as `src/content/charlestonwv/` with three pages. The building page prices the
waiver, the ladder and the $5.00 note exactly as reconciled above; the electrical page prices
the 2015 form's Residential and Commercial columns, with occupancy as the switch and the
`$15.00` final-inspection fee charged on every permit. The plumbing page publishes **no rules
at all** — a no-schedule page under the editorial gate's `hasNoScheduleStatement` case, because
the schedule says it does not apply to plumbing and the City does not post the plumbing
application. The schedule's own printed checkpoints are the test: $60,000 → $280.50 and
$1,000,000 → $4,980.50 both reproduce to the cent, and the plan-review examples ($37.50 at
$50,000, $75.00 at $100,000) do too.

Two readings are carried rather than resolved. The commercial new-service row's boundary
between the `$65.00` and `$75.00` bands is the one the scan leaves ambiguous — the amounts are
certain, the boundary is not — so the `$65.00` band is drawn wide (100–399 A) and no amperage
is left unpriced, with the rule's verification set to `needs_review`. The demolition line is
read as a replacement rather than an addition: $30.00 for a structure valued at $5,000 or less,
and the valuation ladder above that, which is what the schedule's "Over $5000.00 by schedule of
fees" means.

## Engine modelling notes

- Job-cost ladder → `tiered_table` on `valuation` (brackets to $1,000,000) is the wrong shape for the waived-under-$2,500 rule; instead: flat $0 rule gated `valuation lte 250_000` + `gte 1` (the waiver is a published $0 fee), then the ladder as `per_thousand` twice: base 1_450 threshold 100_000 centsPerThousand 400 increment 100_000 gated `valuation gt 250_000` and `lte 3_000_000`... the printed first-band amounts ($14.50/$16.50/$18.50) are the $1,000-band at fractions; the $4.00-per-band reading starts at 2,501. Modelled as printed: one `per_thousand` rule ($14.50 base + $4.00/$1,000 or fraction) gated `valuation > 250_000` and `valuation <= 3_000_000`, and the $5.00 rule ($135.50 base + $5.00/$1,000 or fraction) gated `valuation > 3_000_000`.
- Electrical rows: flat rules per row; openings `per_unit` ($5.00 residential fact `custom.openings`; commercial $.50), service amperage brackets as flat rules on `custom.amperage` bands, commercial cost ladder as `tiered_table` on `custom.work_cost_cents`... actually `valuation` — the form's "TOTAL ELECTRICAL JOB COST" is the job cost, so `valuation` carries it; final inspection $15.00 flat on every permit (form note).
- Plumbing: no published local fee table → plumbing page documents the building/electrical treatment and defers to the application form. (See jackson precedent — but here the permit type exists with a real application; the page publishes the $15 final-inspection style notes? No: publish an honest no-fee-table statement per the Jackson precedent with `feeRules: []` for plumbing.)
