# Sioux Falls, South Dakota — Permit Fee Research

**City:** Sioux Falls, South Dakota (Minnehaha County)
**Authority:** City of Sioux Falls — Building Services Division (City Center, 231 N. Dakota Ave.), under the Code of Ordinances Chapter 150 (Building) and the annually-adopted fee schedule
**Research date:** 2026-09-26
**Researcher:** Permit Fee Intelligence — South Dakota pass

---

## 1. Authority

Building, electrical, plumbing and mechanical permits in Sioux Falls are issued by
**Building Services**. The fee amounts live in two instruments read together:

1. **The annual Building Permit Valuation/Fee Schedule** (a City PDF; the 2026
   edition was titled "2026 Fee Schedule Clean" and published at
   siouxfalls.gov as "2025-fee-schedule.pdf" then superseded by
   `2026-fee-schedule-01012026.pdf`). It carries the residential and commercial
   building-permit ladders, the square-foot valuation factors for new
   residential construction, and the flat rows.
2. **The Code of Ordinances, Chapter 150** (adopted IBC/IRC/IMC/UPC/NEC
   amendments), whose § 150.017 Table 1-A/1-B reproduce the ladders and whose
   § 109.2.1/Table 1-C and the trade-code articles carry the plan-review
   percentages and event fees. The electrical (§§ 150.201–150.221), mechanical
   and plumbing (§§ 150.302–150.304) articles each carry their own fee tables
   effective January 1, 2022.

### Sources (all fetched and read 2026-09-26)

| Document | URL | Status |
| --- | --- | --- |
| Building Permit Valuation/Fee Schedule (2026, 6 pp.) | `https://www.siouxfalls.gov/files/assets/public/v/2/2025-fee-schedule.pdf` (also `/v/3/2026-fee-schedule-01012026.pdf`) | HTTP 403 to scripted curl; read via reader proxy |
| MEP Permit Fees (2026, 1 p.) | `https://www.siouxfalls.gov/files/assets/public/v/3/files/assets/public/zbusiness-and-permits/2026-mep-permit-fees.pdf` | read via reader proxy |
| Building Permits page (fee PDF links, $40 floor) | `https://www.siouxfalls.gov/business-permits/permits-licenses-inspections/permits/building-permits` | read via reader proxy |
| § 150.017 (IBC amendments; Tables 1-A/1-B/1-C; plan review 25%) | `https://codelibrary.amlegal.com/codes/siouxfalls/latest/siouxfalls_sd/0-0-0-60648` | read in browser (amlegal blocks the reader proxy) |
| § 150.213 (electrical fees, 2022+ valuation table) | `https://codelibrary.amlegal.com/codes/siouxfalls/latest/siouxfalls_sd/0-0-0-61967` | read via reader proxy |
| § 150.302 (2024 UPC amendments; Table 104.5 plumbing fees) | `https://codelibrary.amlegal.com/codes/siouxfalls/latest/siouxfalls_sd/0-0-0-62271` | read via reader proxy |
| § 150.215 (electrical plan review, hourly) | `https://codelibrary.amlegal.com/codes/siouxfalls/latest/siouxfalls_sd/0-0-0-61998` | read via reader proxy |
| Residential code chapter (R108.2 Table 1-A residential ladder) | `https://codelibrary.amlegal.com/codes/siouxfalls/latest/siouxfalls_sd/0-0-0-60119` | read via reader proxy |

The 2026 fee PDF's own header notes the residential valuation method has been
reviewed yearly since 1985 (commercial since 1992).

## 2. Mechanism, by permit family

### 2.1 Building — residential (R-3 and accessory U)

**Valuation first.** For new residential construction the applicant does not
declare a value: the schedule sets square-foot factors that derive it —

| Component | Factor |
| --- | --- |
| Finished habitable space | $128.00/sq ft |
| Finished basements | $79.00/sq ft |
| Unfinished space (basement and upper levels) | $41.00/sq ft |
| Attached garages | $42.00/sq ft |
| Detached garages | $38.00/sq ft |

Apartments (3+ units, wood-framed): $127.00/sq ft Type V; $149.00/sq ft Type III
fire-retardant wood; basement garages Type I $93.00/sq ft. Other construction
types and hotels quote the bid price. **Remodels and renovations always use the
actual bid price.**

**Then the ladder** (Table 1-A / the schedule's Residential Occupancies table —
they agree):

| Total valuation | Fee |
| --- | --- |
| $1 – $4,000 | $40.00 |
| $4,001 – $25,000 | $32.50 for the first $2,000 + $6.00 per additional $1,000 or fraction, to $25,000 |
| $25,001 – $50,000 | $170.50 for the first $25,000 + $4.50 per additional $1,000 or fraction, to $50,000 |
| $50,001 – $100,000 | $283.00 for the first $50,000 + $3.00 per additional $1,000 or fraction, to $100,000 |
| $100,001 and up | $433.00 for the first $100,000 + $2.50 per additional $1,000 or fraction |

Seam check (internal): band 2 ends at $32.50 + 23 × $6.00 = $170.50 = band 3's
base ✓; band 3 ends at $170.50 + 25 × $4.50 = $283.00 ✓; band 4 ends at $283.00 +
50 × $3.00 = $433.00 ✓. The ladder chains exactly.

Modelled as four mutually-exclusive `per_thousand` rules with `incrementCents`
100_000 ("or fraction thereof" round-up), conditioned on valuation ranges, plus
a flat $40 band. The derived-valuation factors are carried as page text and
worked-example inputs: the worked example declares the derived valuation and
names the factors in the notes (a reader enters their own derived number).

Flat $40 rows: residential re-shingling and residing, swimming-pool fence
enclosures, razing permits, window replacements (sashes only) — recorded, not
modelled (scope rows, not the building-permit ladder).

### 2.2 Building — commercial (Table 1-B)

| Total valuation | Fee |
| --- | --- |
| $1 – $2,000 | $40.00 |
| $2,001 – $25,000 | $45.00 for the first $2,000 + $9.00 per additional $1,000 or fraction, to $25,000 |
| $25,001 – $50,000 | $252.00 for the first $25,000 + $6.50 per additional $1,000 or fraction, to $50,000 |
| $50,001 – $100,000 | $414.50 for the first $50,000 + $4.50 per additional $1,000 or fraction, to $100,000 |
| $100,001 – $500,000 | $639.50 for the first $100,000 + $3.50 per additional $1,000 or fraction, to $500,000 |
| $500,001 and up | $2,039.50 for the first $500,000 + $3.00 per additional $1,000 or fraction |

Valuation: "the total value of all construction work … as well as all finish
work, painting, roofing, electrical, plumbing, heating, air-conditioning,
elevators, fire-extinguishing system, and other permanent equipment exclusive of
site improvements and parking lots costs."

Seam check: $45 + 23 × $9.00 = $252.00 ✓; $252 + 25 × $6.50 = $414.50 ✓; $414.50
+ 50 × $4.50 = $639.50 ✓; $639.50 + 400 × $3.50 = $2,039.50 ✓.

### 2.3 Plan review — 25% of the building permit fee, commercial

Table 1-C row 11: "Said plan review fee shall be **25 percent of the building
permit fee as specified on Table 1-B** … in addition to the building permit
fee." Additional review for changed plans is another 25%. The trade codes each
mirror it: electrical plan review is "25% of the electrical portion of the
building permit fee as shown on Table No. 1-B" (§ 150.213, fee 6); plumbing the
same phrasing (Table 104.5, row 4); mechanical likewise. Modelled once as a
`percent` rule on `permit_fee` at 2,500 bps on the building page, conditioned on
`valuation > 200_000` cents (the ladder's $2,000 seam — the $40 flat band is a
permit-only tier). The MEP pages carry their own plan-review rows as the same
25% of the Table 1-B fee — recorded in the research file, not double-charged.

The MEP form also states the collection order: "PLAN REVIEW FEE ONLY: Building
permit fees will be collected at the time of permit issuance" — plan review is
paid up front on commercial submittals; the permit fee at issuance.

### 2.4 Electrical / Mechanical / Plumbing — the shared MEP ladder (2022+)

Since January 1, 2022 all three trades price identically, from the **trade's own
valuation** ("Electrical/Mechanical/Plumbing Valuation"), with the Total Project
Valuation used instead whenever a building permit is issued for the same work:

| Trade valuation | Fee |
| --- | --- |
| $0.01 – $5,000 | $40.00 |
| $5,000.01 – $25,000 | $40 for the first $5,000 + $6 per additional $1,000 or fraction, to $25,000 |
| $25,000.01 – $50,000 | $160 for the first $25,000 + $5.25 per additional $1,000 or fraction, to $50,000 |
| $50,000.01 – $100,000 | $291.25 for the first $50,000 + $4.50 per additional $1,000 or fraction, to $100,000 |
| $100,000.01 – $250,000 | $516.25 for the first $100,000 + $4.25 per additional $1,000 or fraction, to $250,000 |
| $250,000.01 – $500,000 | $1,153.75 for the first $250,000 + $4.00 per additional $1,000 or fraction, to $500,000 |
| $500,000.01 – $1,000,000 | $2,153.75 for the first $500,000 + $3.50 per additional $1,000 or fraction, to $1,000,000 |
| $1,000,000.01 and up | $3,903.75 for the first $1,000,000 + $3.00 per additional $1,000 or fraction |

(The plumbing table's own bases run $50 higher in the three bands above $50,000 —
$323/$548/$1,186/$2,186/$3,936 vs $291.25/$516.25/$1,153.75/$2,153.75/$3,903.75 —
an inconsistency inside the 2024 UPC ordinance itself; the seed charges the
common figures the city's own MEP form publishes, and the divergence is
documented below.)

Seam check on the common ladder: $40 + 20 × $6.00 = $160.00 ✓; $160 + 25 ×
$5.25 = $291.25 ✓; $291.25 + 50 × $4.50 = $516.25 ✓; $516.25 + 150 × $4.25 =
$1,153.75 ✓; $1,153.75 + 250 × $4.00 = $2,153.75 ✓; $2,153.75 + 500 × $3.50 =
$3,903.75 ✓.

Modelled as eight mutually-exclusive `per_thousand` rules per trade, identical
amounts, on the `valuation` basis (the trade's own declared valuation — a
stand-alone MEP permit never reads the building's value). Each trade also
carries a **$25.00 homeowner's permit** flat and a **$5.00 state wiring
permit** flat (electrical, per § 150.213), recorded not modelled (they are
one-time administrative rows, not part of the computed permit).

### 2.5 The old electrical regime (through 2021) — recorded, not modelled

§ 150.213(a) preserves the pre-2022 item-priced electrical inspection fees:
new 1–2 family services by amperage ($100/$200/$250), service connections
($45–$250), circuits ($6/$12/$15 + $10 per additional 100 A), remodel openings
and fixtures ($1 first 40, $0.50 each additional), apartments $35/unit, signs
$45, area lighting $25/standard, mobile-home services $50/$25, RV pedestals
$40/$25, residential pools $125, homeowner permit $25 + $5 state wiring permit,
minimum inspection $20. Recorded here as history; the seed charges the 2022+
valuation ladder, which is what Building Services applies today.

## 3. Discrepancies and their resolution

1. **Two PDF names, one schedule.** `2025-fee-schedule.pdf` carries a document
   whose internal title is "2026 Fee Schedule Clean" with 2026 factors ($128/
   $79/$41/$42/$38 per sq ft); the Building Permits page links the 2026 file
   (`2026-fee-schedule-01012026.pdf`) beside it. The amounts agree everywhere
   both files overlap; the seed charges the 2026 figures and records the
   v/2 URL as the retrieval path that worked.
2. **The plumbing table's higher bases.** Table 104.5 (2024 UPC ordinance)
   prints bases $31.75–$32 above the identical electrical and mechanical
   ladders in the three bands above $50,000 of trade valuation. The City's own
   one-page 2026 MEP fee form publishes one common ladder with the lower
   bases. Resolution: charge the common ladder (the published form a
   contractor actually files with), document the divergence here. No worked
   example prices in the divergent bands' bases without the common ladder
   being what the city's form states.
3. **Plan review percentages.** Building: 25% of Table 1-B. Each trade code
   says "25% of the [trade] portion of the building permit fee" — the same
   Table 1-B amount, attributed to the trade. Modelled once on the building
   page so a project's plan review is charged exactly once; the MEP pages'
   plan-review rows are recorded, not modelled, to avoid double-charging a
   commercial project that pulls both.
4. **Residential remodels never use the square-foot factors** — the schedule's
   own sentence ("The valuation … for remodels and renovations remains as the
   actual bid price"). The valuation-derivation text lives on the page, but no
   rule multiplies area; the ladder reads the declared valuation.

## 4. Worked examples (engine-verified 2026-09-26)

- **Commercial build-out, $450,000 valuation, plan review.** Band 5: $639.50 +
  350 × $3.50 = $1,864.50; plan review 25% = $466.13 (0.25 × $1,864.50 =
  $466.125, rounds to the cent) → **$2,330.63**.
- **Electrical stand-alone, $60,000 of electrical valuation.** Band 4: $291.25
  + 10 × $4.50 = **$336.25** (no plan review — the MEP ladder is the permit).
- **Plumbing stand-alone, $18,000 of plumbing valuation.** Band 2: $40 + 13 ×
  $6.00 = **$118.00**.

## 5. What is modelled vs not

Modelled (three permit types): the four-band residential building ladder with
its $40 flat band and the square-foot valuation factors as page text; the
six-band commercial ladder; the 25% plan review (commercial, on the building
page); the eight-band common MEP ladder on the electrical and plumbing pages.

Recorded but not modelled: apartments' Type III/V factors and hotels (bid
price); the flat $40 scope rows (re-shingle, reside, pool fence, razing, window
sashes); wrecking $40; the $100/$200 hourly event fees; board of appeals $100;
late-corrections $100 and failure-to-inspect $250 administrative fees; the
homeowner $25 and state wiring $5 administrative flats; the pre-2022 electrical
item-price regime; the Table 104.5 plumbing-base divergence (charges the common
ladder); mechanical as a page.
