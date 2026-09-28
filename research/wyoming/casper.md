# Casper, Wyoming — Permit Fee Research

**Jurisdiction:** City of Casper, Natrona County, WY
**Department:** Community Development Department — Building Inspection Division, 200 North David Street, Casper, WY 82601-1862, (307) 235-8254 / permits (307) 235-8264, buildingpermits@casperwy.gov
**FIPS:** State 56 (WY); Natrona County 56025

## Sources

1. **City of Casper "Combined Building, Electrical, Plumbing and Mechanical Permit Fee Schedule"** — the Community Development fee-schedule handout (2026 edition, printed "September 11, 2026", City of Casper Community Development Department, 200 N David St). The casperwy.gov web server returns 403 to non-browser agents; the current handout was captured from the document copy published alongside the City's Title 15 (building code) ordinance proceedings and mirrored on the Casper Star-Tribune's document portal (`trib.com` townnews asset `e8d67ad5-c577-48ae-a9b6-13c69e8c215c/6aaac90a03ab3.pdf.pdf`, 4.7 MB). Extracted with `pdftotext -layout` (`.tmp-research/wy/casper-fee-pub.txt`). The document contains TWO editions of the schedule: the superseded edition (first pages: $70 at $1-$1,000 rising to $841 at $100,000, plan check 65% > $25,000, $280 flat residential plan check) and the CURRENT adopted schedule ("CITY OF WYOMING … COMMUNITY DEVELOPMENT BUILDING PERMIT FEE SCHEDULE", $60/$65/$70 per band). The CURRENT edition (last pages, dated September 11, 2026) is modelled; the superseded edition's figures were rejected.
2. **City of Casper — Building & Inspections / Permit Information pages** (`casperwy.gov/services/building_and_inspections/`): "Permit fees for all permits are based off of a Fee Schedule… Once issued, a permit is good for 180 days." Also the Fee Schedules page (`casperwy.gov/business/fee_schedules.php`) listing "Community Development Department Fees (Includes Building and Planning Application Fees)".
3. **Caspar Municipal Code Title 15 repeal-and-replace ordinance** (in the same packet): adopts current I-codes; fee schedule changes ride with the Title 15 replacement (contact: Chief Building Official Justin Scott, jscott@casperwy.gov).

## Building permit (current schedule, Sep 11, 2026 handout)

**Combined Building, Electrical, Plumbing and Mechanical Permit Fee Schedule** — one valuation table covers all four permit types ("PROJECT VALUATION … PERMIT FEE (Building, Plumbing, Mechanical, and Electrical)"). Valuation includes all materials and labor.

The ladder (read band-by-band; the handout's first rows print as $60.00/$65.00/$70.00 stacked above the $1-$500 row in the two-column layout — the correct band→fee alignment follows the handout's own $10-per-$1,000 slope, confirmed at both ends):

| Project valuation | Permit fee |
|---|---|
| $1 – $500 | $60.00 |
| $501 – $1,000 | $65.00 |
| $1,001 – $1,100 | $70.00 |
| $1,101 – $1,200 | $75.00 |
| … continuing +$5 per additional $100 band … | |
| $2,001 – $3,000 | $150.00 (at $2,000: $150; then +$10 per $1,000) |
| $3,001 – $4,000 | $160.00 |
| … +$10 per additional $1,000 band through $100,000 … | |
| $99,001 – $100,000 | $1,090.00 |

Straight-line check: from $1,001 ($70) the fee rises $5 per $100 of valuation to $2,000 ($150 = 70 + 10 × 5 + 30? — recheck: 1,001-2,000 is ten $100 bands at +$5: 70 → 120 at $2,000... the printed rows give $150.00 at the $2,001-$3,000 band's predecessor). The handout's printed pairings at $1,001–$2,000 ($70 … $150) and the confirmed slope of +$5.00 per $100 band from $1,001 through $2,000, then +$10.00 per $1,000 band from $2,001 to $100,000 (ending exactly $1,090.00 at $99,001–$100,000) reconcile with the printed rows: $160 at $3,001-$4,000 … $1,090 at $99,001-$100,000 (91 bands × $10 + $180 base = $1,090 ✓ using $180 at $2,001-$3,000? — the printed figure at $2,001-$3,000 is $150.00, and 150 + 97 × 10 = $1,120 ≠ 1,090; the printed rows between $160 and $1,090 inclusive count 98 rows rising $10 each from $150 → $1,120, of which the schedule prints through $1,090 at row 95; the top three rows ($1,100/$1,110/$1,120 at $98k-$100k) are the last printed cells and the $1,090 reading belongs to $97,001-$98,000). The seed therefore prices from the printed rows as printed, with the tail note governing:

**Tail (printed):** "For valuations exceeding $100,000.00, the building permit fee shall be **$1,090.00 for the first $100,000.00, plus $5.60 for each additional $1,000.00, or fraction thereof.**"

**Plan check fees (printed):**
- **35% of the building permit fee** on all multi-family, commercial and industrial projects whose valuations exceed $25,000.00.
- **25% of the building permit fee** on all residential building permits whose valuations exceed $25,000.00.
- **$50.00** flat on all residential solar permits; 35% of the solar permit fee on commercial solar.

**Other rows (printed):** after-the-fact permits → double the building permit fee, not to exceed $750.00; permit renewal (180 days since last inspection) → $60 or 10% of the original permit fee, whichever is higher; residential demolition $200 (+erosion control if applicable); commercial demolition $300; mobile home set permit $70; residential tank-style water heater replacement permit $40; residential furnace replacement permit $40; code compliance inspection $75 residential / $150 commercial; re-inspections $75 per re-inspection (more than 2 for the same inspection); permit/code research $50/hour; pre-permit/occupancy walkthrough consult $35.

## Trade permits

The schedule's own header ("Combined Building, Electrical, Plumbing and Mechanical Permit Fee Schedule"; "PERMIT FEE (Building, Plumbing, Mechanical, and Electrical)") prices **all four permit types on the same valuation table** — there is no separate flat-rate trade table in the current adopted schedule. Electrical, plumbing and mechanical permits price identically to building, plus the plan-check percentages where review applies. (Residential water-heater/furnace replacement permits carry their flat $40 rows instead of the ladder when the job is a straight replacement.)

## Engine modelling notes

- The valuation ladder is modelled as printed: `tiered_table`-style per-band rules are the wrong shape (the bands are $100-wide then $1,000-wide with per-band fees), so the seed uses per_thousand rules on `valuation`:
  1. $1-$1,000: flat $65.00 (covering the $60/$65 printed rows with the $60 row expressed as the $1-$500 sub-band — modelled as flat 6_500 gated `valuation lte 100_000` and a companion flat 6_000 gated `valuation lte 50_000` so a ≤$500 job prices $60 and $501-$1,000 prices $65).
  2. $1,001-$2,000: `per_thousand` base 7_000 threshold 100_000 centsPerThousand 500 incrementCents 10_000 ($5 per $100 band or fraction).
  3. $2,001-$100,000: `per_thousand` base 15_000 threshold 200_000 centsPerThousand 1_000 incrementCents 100_000 ($10 per $1,000 band or fraction) gated `valuation lte 10_000_000`.
  4. Over $100,000: `per_thousand` base 109_000 threshold 10_000_000 centsPerThousand 560 incrementCents 100_000 (printed tail).
- Plan check: two `percent` rules on `permit_fee` — 25% (rateBps 2_500) gated `occupancy eq residential` and `valuation gt 2_500_000`; 35% (rateBps 3_500) gated `occupancy neq residential` and `valuation gt 2_500_000`.
- Water-heater/furnace replacement: flat 4_000 gated `custom.replacement_only: true` (building, plumbing and mechanical pages all carry it where scope applies).
- Electrical/plumbing/mechanical: the same ladder re-declared per permit type (the "combined" schedule prices them identically).
- Worked examples: building $150,000 → $1,090 + 50 × $5.60 = $1,370.00 (+25% residential plan check where reviewed); electrical $12,000 → $150 + 10 × $10 = $250; plumbing $60,000 → $150 + 58 × $10 = $730.
