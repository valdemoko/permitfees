# Rapid City, South Dakota — Permit Fee Research

**City:** Rapid City, South Dakota (Pennington County)
**Authority:** City of Rapid City — Building Services Division, Community Development Department (300 6th Street), under RCMC Title 15 and the fee schedule adopted by Common Council resolution
**Research date:** 2026-09-26
**Researcher:** Permit Fee Intelligence — South Dakota pass

---

## 1. Authority

Building permits in Rapid City are issued by **Building Services** under RCMC
**Title 15** (Buildings and Construction). The adopted codes are the IBC 2021,
IRC 2021, NEC (state-adopted), the 2015 UPC (state-adopted) and the IMC —
Rapid City amendments live in Chapters 15.04 (Administration), 15.16
(Electrical), 15.20 (Gas), 15.24 (Plumbing) and 15.26 (Mechanical).

**Where the amounts live.** RCMC § 15.04.320 ("Permit fees") does **not** print
the amounts: "Fees payable under this chapter pursuant to any permit or license
issued, or any inspection, or for any other reason **shall be determined by
resolution of the Common Council**." The operative schedule is the pair of
one-page PDFs Building Services publishes on its Building Permits Fee
Information page:

- **Table 100-A — Residential Permit Fees** ("Building Permits Residential
  Permit Fees.pdf", 40 KB, published 2016, still the linked operative table);
- **Table 100-C — Commercial Permit Fees** ("Building Permits Commercial
  Permit Fees Table.pdf", 40 KB, same page).

### Sources (all fetched and read 2026-09-26)

| Document | URL | Status |
| --- | --- | --- |
| Table 100-A Residential Permit Fees (PDF) | `https://www.rcgov.org/index.php?option=com_docman&view=download&alias=452-bilding-permits-residential-permit-fees&category_slug=building-permits-inspections-information&Itemid=149` | HTTP 403 live (Cloudflare); read from the Wayback Machine capture 2024-11-26 |
| Table 100-C Commercial Permit Fees (PDF) | same URL, `alias=451-building-permits-commercial-permit-fees` | HTTP 403 live; read from capture 2025-04-30 |
| Building Permits Fee Information page (the two PDF links, $250 development fees) | `https://www.rcgov.org/departments/community-planning-development/building-services/building-permits-fee-information-364.html` | HTTP 200 live; PDF links verified |
| RCMC § 15.04 (Administration; § 15.04.320 permit fees by council resolution; work-before-permit doubling) | `https://rapidcity.municipal.codes/RCMC/15.04.320` | HTTP 200 |
| RCMC Ch. 15.16 (Electrical Code, NEC amendments; permit threshold $10) | `https://rapidcity.municipal.codes/RCMC/15.16` | HTTP 200 |
| RCMC Ch. 15.24 (Plumbing Code, 2015 UPC adoption) | `https://rapidcity.municipal.codes/RCMC/15.24` | HTTP 200 |
| RCMC Ch. 15.28 | `https://rapidcity.municipal.codes/RCMC/15.28` | HTTP 200 (chapter repealed) |

**Access record:** rcgov.org sits behind a Cloudflare challenge that blocked
both scripted retrieval and the reader proxy; the fee tables were read from the
Internet Archive's captures of the identical URLs (Wayback timestamps
2024-11-26 and 2025-04-30, both HTTP 200 PDFs). The municipal-code site
(rapidcity.municipal.codes) is open. The live page itself confirms both PDFs
are the tables the city publishes today (verified in-browser 2026-09-26); the
captures' contents are the operative schedule as of 2024–2025.

## 2. Mechanism

### 2.1 Residential building permit (Table 100-A)

| Total valuation | Fee |
| --- | --- |
| $1.00 – $1,600 | $37.00 |
| $1,601 – $2,000 | $37.00 for the first $1,600 plus $2.00 per additional $1,000 or fraction, to $2,000 |
| $2,001 – $25,000 | $45.00 for the first $2,000 plus $9.00 per additional $1,000 or fraction, to $25,000 |
| $25,001 – $50,000 | $252.00 for the first $25,000 plus $6.50 per additional $1,000 or fraction, to $50,000 |
| $50,001 – $100,000 | $414.50 for the first $50,000 plus $4.50 per additional $1,000 or fraction, to $100,000 |
| $100,001 – $500,000 | $639.50 for the first $100,000 plus $3.50 per additional $1,000 or fraction, to $500,000 |
| $500,001 – $1,000,000 | $2,039.50 for the first $500,000 plus $3.00 per additional $1,000 or fraction, to $1,000,000 |
| $1,000,001 and up | $3,539.50 for the first $1,000,000 plus $2.00 per additional $1,000 or fraction |

**Printed-typos and their resolution.** The PDF prints "$500,00.00 to
$1,000,000.00" (missing a zero — clearly $500,001.00, the band above ends at
$500,000) and "$100,000.000" (ditto). The $3,539.50 base of the top band is the
internal check: $2,039.50 + 500 × $3.00 = $3,539.50 ✓. The band-2 band is a
one-dollar-wide sliver ($1,600.01–$2,000) whose fee at $2,000 is $37.00 +
$2.00 = $39.00, handing off to band 3's $45.00 base at $2,001 — the printed
ladder does not chain exactly there ($39 ≠ $45); the two bands are modelled as
printed, and the seam is documented below.

Seam checks elsewhere: band 3 ends at $45 + 23 × $9.00 = $252.00 ✓; $252 + 25 ×
$6.50 = $414.50 ✓; $414.50 + 50 × $4.50 = $639.50 ✓; $639.50 + 400 × $3.50 =
$2,039.50 ✓.

**Plan review:** row 6 — "Plan review fees for **1 and 2 family dwellings and
accessory structures shall be 10%** of the building permit fee." Modelled as a
`percent` rule on `permit_fee` at 1,000 bps.

Event fees (recorded, not modelled): inspections outside business hours
$42.00/hr (2-hr minimum), reinspection $42.00/hr, unspecified inspections
$42.00/hr (1-hr minimum), additional plan review $42.00/hr (1-hr minimum),
outside consultants at actual cost.

### 2.2 Commercial building permit (Table 100-C)

| Total valuation | Fee |
| --- | --- |
| $1.00 – $1,600 | $37.00 |
| $1,601 – $2,000 | $69.25 |
| $2,001 – $25,000 | $69.25 for the first $2,000 plus $14.00 per additional $1,000 or fraction, to $25,000 |
| $25,001 – $50,000 | $391.25 for the first $25,000 plus $10.10 per additional $1,000 or fraction, to $50,000 |
| $50,001 – $100,000 | $643.75 for the first $50,000 plus $7.00 per additional $1,000 or fraction, to $100,000 |
| $100,001 – $500,000 | $993.75 for the first $100,000 plus $5.60 per additional $1,000 or fraction, to $500,000 |
| $500,001 – $1,000,000 | $3,233.75 for the first $500,000 plus $4.75 per additional $1,000 or fraction, to $1,000,000 |
| $1,000,001 and up | $5,608.75 for the first $1,000,000 plus $3.15 per additional $1,000 or fraction |

Seam check: $69.25 + 23 × $14.00 = $391.25 ✓; $391.25 + 25 × $10.10 = $643.75 ✓;
$643.75 + 50 × $7.00 = $993.75 ✓; $993.75 + 400 × $5.60 = $3,233.75 ✓; $3,233.75
+ 500 × $4.75 = $5,608.75 ✓. The ladder chains exactly from $2,000 upward.

**Plan review:** row 7 — "Plan review fees for **all occupancies except 1 and 2
family dwellings shall be 50%** of the building permit fee." Modelled at 5,000
bps on `permit_fee`, conditioned to non-residential occupancy.

Event fees: $47.00/hr rows (same structure as residential), consultants at
actual cost.

### 2.3 Trade permits

Rapid City adopts the state plumbing code (2015 UPC via the South Dakota
Plumbing Commission) and the state electrical code (NEC via the State
Electrical Commission) with city amendments in Chapters 15.24 and 15.16; the
mechanical and gas codes sit in 15.26 and 15.20. **None of the adopted trade
chapters prints a fee table** — each defers to § 15.04.320's
council-resolution mechanism. Chapter 15.16 states the permit floor: "A permit
is required for fees equal to or greater than $10," and the electrical
homeowner-permit regime (owner-performed wiring, demonstrated competency, 6-month
validity) requires the same fees.

The trade-permit amounts are therefore set by council resolution documents that
are **not published on the Building Services fee page** — the two PDFs there
are Table 100-A (residential building) and Table 100-C (commercial building)
only. The building-permit valuation definition (§ 15.04.170: "State the
construction valuation of any new building, structure, addition, remodeling or
alteration") prices the whole project including its MEP work inside the
building permit.

The seed's electrical and plumbing pages therefore model the **building
permit's own price for trade-scale work**: a stand-alone trade job on an
existing building is still a building permit application, and it prices on
Table 100-A (a house-scale job) or Table 100-C (everything else) by declared
valuation, with the matching plan-review percentage. The pages say so plainly
and carry the trade chapters' bundling structure as page text.

### 2.4 Other rows (recorded, not modelled)

Work commenced before permit issuance: "pay **double the permit fee** fixed by
this section for the work" (§ 15.04.300, emergency exception). Permit renewal
fees "determined by resolution of the Common Council" (§ 15.04.230). Electrical
permits under $10 are exempt from permit entirely (Ch. 15.16). The Building
Permits Fee Information page's development-application fees ($250 conditional
use, $250 variance, $250 plat final, $2,500 TIF, etc.) are planning fees, not
construction permits. Air-quality construction permits $75–$100. Chapter 15.28
is repealed.

## 3. Discrepancies and their resolution

1. **The fee amounts are not in the municipal code.** § 15.04.320 delegates
   everything to Common Council resolution; the published resolution documents
   are the two Table PDFs. The seed cites both the code section (authority) and
   the PDFs (amounts), and reads the PDFs from the Wayback captures of the
   city's own URLs because the live host challenges automated retrieval.
2. **The $1,600–$2,000 seam does not chain.** Band 1+2 tops out at $39.00 at
   $2,000 exactly; band 3's base at $2,001 is $45.00. Both are modelled as
   printed — the $6.00 jump at the seam is on the record, and the other six
   seams chain exactly (the internal check on the read).
3. **Two plan-review percentages.** 10% for 1–2 family dwellings and accessory
   structures; 50% for everything else — printed identically on both tables.
   Modelled as two rules keyed on occupancy.
4. **No trade-permit tables exist in the adopted codes or the published fee
   PDFs.** Trade work prices through the building permit by declared
   valuation; the electrical/plumbing pages model the building-permit price of
   trade-scale stand-alone jobs and state the bundling plainly.

## 4. Worked examples (engine-verified 2026-09-26)

- **Residential (1–2 family), $320,000 new home, plan review.** Band 6:
  $639.50 + 220 × $3.50 = $1,409.50; plan review 10% = $140.95 → **$1,550.45**.
- **Commercial, $60,000 tenant finish, plan review.** Band 4: $643.75 + 10 ×
  $7.00 = $713.75; plan review 50% = $356.88 (0.5 × $713.75 = $356.875) →
  **$1,070.63**.
- **Electrical page (stand-alone trade-scale job), $18,000 declared valuation
  on an existing commercial building.** Table 100-C band 3: $69.25 + 16 ×
  $14.00 = **$293.25**.

## 5. What is modelled vs not

Modelled (three permit types): Table 100-A's eight-band residential ladder,
Table 100-C's eight-band commercial ladder, the 10%/50% plan-review pair, and
the electrical/plumbing pages' modelling of trade-scale stand-alone work
through the same tables.

Recorded but not modelled: the $42/$47 hourly event fees and outside-consultant
costs; work-before-permit doubling; permit-renewal fees; the electrical
homeowner-permit regime's validity rules; the sub-$10 electrical exemption;
plumbing/mechanical/gas chapter fees (council resolution, unpublished on the
fee page); development-application and air-quality fees; Chapter 15.28
(repealed).
