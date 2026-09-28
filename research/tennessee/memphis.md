# Memphis, Tennessee (Shelby County) — research record

Second Tennessee jurisdiction. The Memphis-Shelby County Construction Code
Enforcement office issues every OCCE permit — building, electrical, plumbing,
mechanical and gas — for Memphis, Arlington, Germantown, Lakeland, Millington
and unincorporated Shelby County from one office at 6465 Mullins Station Road.
One 9-page 2022 Building Fee Schedule prices all five trades. The joint
Develop 901 portal links it as the approved building fee schedule.

Everything below was read on **2026-09-25**. Nothing is estimated.

## Why Memphis second

Nashville was the first because its PDF was readable from this environment and
its schedule is a single instrument. The second jurisdiction in Tennessee had
to be on the same state's code family and answer from the same host; the
alternatives — Knoxville, Chattanooga — required walking the open-web (403 on
several government document hosts) while Shelby County answered 200 on two fee
schedule PDFs with the same commercial building bands and plan-review tiers
stable between them. Memphis is the state's second market and the same OCCE
covers six jurisdictions, so the coverage is five cities for one read.

## Sources actually read

| Key | Instrument | How read |
| --- | --- | --- |
| S1 | **2022 Building Fee Schedule** — `shelbycountytn.gov/DocumentCenter/View/39428/2022-BUILDING-FEE-SCHEDULE` (9 pages, 357,947 bytes, HTTP 200) | `curl` + `pymupdf` blocks-mode + `pdftotext -layout`; read end to end |
| S2 | **2019 New Fee Schedule** — `shelbycountytn.gov/DocumentCenter/View/33930/New-Fee-Schedule-2019` (6 pages, 179,040 bytes, HTTP 200) | `curl` + `pymupdf`; predecessor read to confirm stability of the commercial building bands and plan-review tiers (bases moved: $3,025→$3,537.50, $51,025→$57,537.50) |
| S3 | **Develop 901 — Fee Information** — `develop901.com/fee-information` (HTTP 200) | `curl` + HTML strip; the joint portal's description of OCCE jurisdiction and its tab linking the approved fee schedule |
| S4 | **Shelby County OCCE — construction code enforcement letterhead** (`/DocumentCenter/View/35065/6-Permit-fees-letterhead`) | `curl` + HTML strip; the \"what are permit fees in addition to plan review?\" letter confirming the valuation-plus-plan-review reading |

The schedule prints **no effective date** on its face. The file is the \"2022 BUILDING FEE SCHEDULE\" by its own title and document name, and the date carried for the rules is **2022-01-01**.

## The cover line, as read (S1, p.1)

> ****ALL FEES BELOW DO NOT INCLUDE AN ADMINISTRATIVE CHARGE OF $4.00 AND A SURCHARGE OF $1.00 FOR RESIDENTIAL OR $5.00 FOR COMMERCIAL (ADD $5 TO RESIDENTIAL TOTAL AND $9 TO COMMERCIAL TOTAL)

So every residential permit is $4 + $1 = $5 of `other` and every commercial one is $4 + $5 = $9. The tests assert the sum, not the addend, because a reader pays one line that says what the cover promises.

## The commercial building ladder, as read (S1, pp.1–2)

**NEW CONSTRUCTION/ ADDITIONS/ ACCESSORY BUILDINGS COMMERCIAL**

| Valuation | Fee, as printed |
| --- | --- |
| $0 - $25,000 | $5.00/1,000 |
| $25,001 - $1,000,000 | $125 + $3.50/1,000 |
| $1,000,001 - $25,000,000 | $3537.50 + $2.25/1,000 |
| $25,000,001 AND UP | $57,537.50 + 1.75/1,000 |

With \"MINIMUM FEE $75.00\". Each row writes \"$X/1,000\" with **no** \"or fraction thereof\" — prorated — and each base above the first is exactly the arithmetic below it: $125 is $5.00 × 25, $3,537.50 is $125 + 975 × $3.50, $57,537.50 is $3,537.50 + 24,000 × $2.25. The ladder chains; Nashville's three printed seams (sixteen, seventeen and fifty-four cents off) are the contrast the tests assert.

**PLAN REVIEW FEE** — nine flat bands ($80-$3,000):

| Valuation | Fee |
| --- | --- |
| $0 - $25,000 | $80 |
| $25,001 - $50,000 | $160 |
| $50,001 - $100,000 | $325 |
| $100,001 - $200,000 | $650 |
| $200,001 - $500,000 | $875 |
| $500,001 - $1,000,000 | $1,200 |
| $1,000,001 - $2,000,000 | $1,600 |
| $2,000,001 - $5,000,000 | $2,000 |
| $5,000,001 AND UP | $3,000 |

With \"SIGNS $1.25 PER SQ FT\" (same page), and \"INSTALLATION PRIOR TO ISSUANCE OF PERMIT TRIPLE FEE\" on signs and \"WORK COMMENCING BEFORE PERMIT ISSUANCE DOUBLE FEE\" on building.

The 2019 predecessor (S2) prints the same bands with rounded bases ($3,025 instead of $3,537.50, $51,025 instead of $57,537.50) at the same plan-review tiers — the mechanism is stable.

## The residential building rows, as read (S1, pp.1–2)

- APPLICATION FEE — NEW, ADDITIONS $50.00; ALTERATIONS, REPAIRS, ACCESSORY $25.00
- NEW CONSTRUCTION OR ADDITION PER SQ. FT. $0.07; MINIMUM FEE FOR NEW SFR OR DUP $125.00
- Additions: 400 or less $50; 401–800 $75; over 800 $125; detached accessory 400 or less $25, over 400 at $0.07 min $50
- ALTERATION/REPAIR ($5.00/1,000) $50.00 MIN / $325.00 MAX; DECKS/SPAS $50; POOL/RETAINING WALL $70 MIN at $5.00/1,000; RESIDENTIAL FENCE 400 or less $25, 401+ at $0.07 min $50
- One- and two-family dwellings plan review: up to 2,500 sq ft $125, over 2,500 $150

Modelled: $0.07/ft with the $125 floor as `BLD-RES-NEW`'s `minimumCents`, and alteration/repair at $5.00/1,000 clamped $50–$325. The rest — application fees, accessory classifications, fence/per-pool rows, plan-review flats — are transcribed and named on the page.

## The electrical schedule, as read (S1, pp.5–6)

E-0 FEE ISSUANCE $20.00 (except meter put backs E-5.2); E-3.1 MINIMUM $15.00; E5.1.1 RE-INSPECTION $50; E5.2 METER PUT BACK $50; E-6.6 MANUFACTURED HOMES $50; E6.8 TEMPORARY METER CENTER $25; E6.5 LOW VOLTAGE $30 (residential and multifamily).

- E-6.1 NEW MULTIFAMILY RESIDENTIAL: MAIN OVERCURRENT DEVICES PER TENANT $1.00; 0–150A $70; 151–400A $125; OVER 400A $250. Three inspections.
- E-6.2 EXISTING RESIDENTIAL (1 & 2 family and multifamily): 1 TO 5 CIRCUITS $30; OVER 5 CIRCUITS $45. Two inspections.
- E6.3 SERVICE, FEEDER, OR PANEL REPLACEMENT $50. One inspection.
- E6.4 IN-GROUND RESIDENTIAL SWIMMING POOL $100. Two inspections.
- E7/E8 NEW SERVICES OR FEEDERS and INCREASE IN SERVICE SIZE (same figures): 120/240V single phase $1.00; 277V single phase over 400A $1.50; 277V up to 400A $2.00; EXCESS OF 480V — FIRST 10,000 KVA $1.50; BETWEEN 10,001 AND UP TO 50,000 KVA $0.50; GREATER THAN 50,000 KVA $0.25.
- E-2.1 WORK COMMENCING BEFORE PERMIT ISSUANCE DOUBLE FEE; E-4 REFUND 2/3 with $15 minimum.

Modelled: issuance $20, minimum $15, E-6.1's three amperage flats plus the per-tenant $1.00, E-6.2's two circuit flats, service replacement, pool, low voltage, 120/240V at $1.00/amp as currency-per-unit, and the excess-480V first block at $1.50/KVA (the two higher KVA bands are `needs_review` — a non-money count the engine's marginal tiers don't express).

## The plumbing schedule, as read (S1, p.7)

PERMIT ISSUANCE $20.00; ISSUING EACH PERMIT (DATA PROCESSING) $4.00; RESIDENTIAL/COMMERCIAL SURCHARGE $1.00/$5.00; PERMIT AMENDMENT $20.

Unit fees (P-1):
- EACH PLUMBING FIXTURE/TRAP $7.50 — and the same $7.50 for roof drains, electric water heaters (each and replacement), interceptors and backflow.
- RESIDENTIAL SEWER CONNECTION $30; same $30 for residential sewer repair/replacement and private sewage disposal.
- COMMERCIAL SEWER $8.00 PER $1000 MINIMUM $100; same $100 for repair/replacement of commercial sewer.
- WATER SERVICE 1" $20; 1-1/4" through 2" $30; COMMERCIAL WATER SERVICE 2-1/2" and larger $8.00/1,000 MIN $200; repair/replacement of commercial water $200 min.
- BACKFLOW $7.50; FIRE PROTECTION $8.00/1,000 MIN $100; MEDICAL GAS $8.00/1,000 MIN $100.
- Second reinspection and each thereafter $50.

Modelled: issuance+processing $24 flat, fixtures $7.50, residential sewer $30, commercial sewer/fire at $8.00/1,000 ($100 floor), household water service by size, large commercial water at $8.00/1,000 ($200 floor). Mechanical (M) and gas (G) at $15/$8/$3 per $1,000 with $15 minimum are transcribed alongside plumbing but are separate trades, not charged here.

## Readings this dataset depends on

1. The $4 + $1/$5 cover line (see above) — every permit's `other`, never inside the base the minimum measures.
2. The commercial building ladder is prorated (no fraction phrase), Nashville's the opposite.
3. The commercial ladder chains — no printed seam — distinct from Nashville's three.
4. Plan review is a tiered table of flat bands, not a percentage of the permit fee or the valuation.
5. E-6.1 per tenant $1.00 rides alongside whichever amperage band fires; E-6.2 is scope-gated, not class-gated.
6. Electrical excess-480V's KVA ladder is a count at $/KVA — the first block is modelled as per-unit KVA with a ceiling, the higher blocks are `needs_review`.

## Effective dates on record

| Instrument | Date carried | Why |
| --- | --- | --- |
| 2022 Building Fee Schedule | **2022-01-01** | No date printed; the file's title and document name are \"2022 BUILDING FEE SCHEDULE\". |
| 2019 New Fee Schedule | **2019-01-01** | Predecessor, read for stability only. |
| Verification | **2026-09-25** | Every source re-read this day. |

## Not modelled (named on the schedule, never papered over)

- Sign erection ($1.25/sq ft with $25 minimum), annual sign reinspection, appurtenances ($70 / $2.00/1,000), elevator/escalator/amusement tables, demolition ($9/25k cu ft), roofing, temporary office ($45/6mo), curb cut ($35), fence/residential accessory classifications, residential plan-review flats — transcribed.
- Electrical 277V rows, meter put backs ($50), temporary meter center ($25), manufactured homes ($50), excess-480V KVA blocks above 10,000.
- Mechanical (M-3 at $15/$8/$3 per $1,000, M-3.2.1 single-family minimum $1,000/ton, refunds, appeals) and gas (G-3 at $15/$8/$3 per $1,000, water-heater $15/$8, per-outlet $2.50).
- Elevator first-$1,000 $15 — the same $15/$8/$3 shape as M and G.
- Tents ($70 + $12 each), board of appeals ($125), permit amendment ($25), certificate of occupancy ($125), administrative site plan review ($650), doubling/tripling penalties — named rather than charged.

## Open questions

1. Whether the residential \"total\" the cover line adds the $5/$9 to is the trade fee or the all-trades sum — the tests assert the per-permit reading (the building, electrical and plumbing permits each ride their own $4 + $1/$5).
2. The excess-480V KVA bands' published meaning — \"BETWENN 10,001 AND UP TO 50,000 KVA $0.50\" — is plainly the schedule's (misspelled \"BETWENN\") but whether it is marginal or tiered is why the higher bands are `needs_review`.
3. Whether Knoxville and Chattanooga's department calculators, which render the same valuation shapes with different percentages ($0.55–0.25% by bracket), will be the Tennessee third jurisdiction after Memphis is the stable second.
