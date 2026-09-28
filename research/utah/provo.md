# Provo, Utah — research record

**Research pass:** Utah (second jurisdiction)
**Read on:** 2026-09-26
**Jurisdiction:** Provo City Corporation (Utah County; the Building
Inspection division, 351 West Center Street, issues building and trade
permits)
**Pages published:** building, electrical, plumbing

## The instrument

Provo prices building permits on the **1997 UBC Table 1-A** fee chart, applied
without amendment. Three sources agree:

1. **Provo City Consolidated Fee Schedule** (Inspection Fees section,
   provo.municipal.codes/Code/FS_Inspection): "Building permit — Based on the
   1997 UBC Fee Chart. Building Valuation — Based upon International Code
   Council Building Valuation Data. **Plan review — 65% of the Building
   Permit Fee.**"
2. **provo.gov FAQ (QID 91)**: "The permit cost is based on the cost
   (valuation) of the construction. We use a table found in the 1997 UBC to
   assess the permit fees. A plan check fee of 65% of the building permit fee
   is charged. **A state fee of 1% of the building permit fee** is charged
   and sent to the state for training of inspectors and contractors."
3. **The 1997 UBC Table 1-A itself**, read from a municipal code that adopts
   it verbatim (Northglenn CO ch. 10 art. 2, §10-2-5(g), "1997 UBC, Table 1-A
   Building Permit Fee Schedule"):

| Total valuation | Fee |
| --- | --- |
| $1 – $500 | $23.50 |
| $500.01 – $2,000 | $23.50 for the first $500 plus **$3.05 per $100** or fraction thereof |
| $2,000.01 – $25,000 | $69.25 for the first $2,000 plus **$14.00 per $1,000** or fraction thereof |
| $25,000.01 – $50,000 | $391.25 for the first $25,000 plus **$10.10 per $1,000** or fraction thereof |
| $50,000.01 – $100,000 | $643.75 for the first $50,000 plus **$7.00 per $1,000** or fraction thereof |
| $100,000.01 – $500,000 | $993.75 for the first $100,000 plus **$5.60 per $1,000** or fraction thereof |
| $500,000.01 – $1,000,000 | $3,233.75 for the first $500,000 plus **$4.75 per $1,000** or fraction thereof |
| $1,000,000.01 and up | $5,608.75 for the first $1,000,000 plus **$3.15 per $1,000** or fraction thereof |

**Band bases chain exactly** ($23.50 + 15 × $3.05 = $69.25; $69.25 + 23 ×
$14.00 = $391.25; $391.25 + 25 × $10.10 = $643.75; $643.75 + 50 × $7.00 =
$993.75; $993.75 + 400 × $5.60 = $3,233.75; $3,233.75 + 500 × $4.75 =
$5,608.75). Encoded as a marginal ladder, gated per band.

**Trade permits** (Consolidated Fee Schedule, Inspection Fees): "For
residential structures with not more than 4 units the building permit fee
includes the plumbing, electrical, and mechanical permit fees." Stand-alone:
Electrical Inspection **$75.00**; Commercial Electrical **$175.00**;
Electrical service charge $75.00 + $0.02/sq ft ($75 minimum). Mechanical
minimum $75.00; Commercial Mechanical $175.00. Plumbing minimum (including
permit issuance) **$75.00**; first fixture $20.00; each additional fixture
$6.00; each water heater $6.00.

## Discrepancies and how they were resolved

1. **Provo-specific numbers are not printed anywhere online** — the City
   points to the 1997 UBC chart and the chart is published in adopting
   municipal codes and the UBC Volume 1 itself. The unamended Table 1-A
   values are used; the adopting-code transcription confirms every row.
2. **State fee 1%.** The provo.gov FAQ documents it, but it is a state
   assessment collected with the permit, not part of the City's printed
   schedule; the seed documents it in prose and sources rather than adding a
   component that would misstate the City's own fee.
3. **Trade permits for ≤4-unit residential are bundled** into the building
   permit fee. The electrical/plumbing pages document stand-alone trade
   permits (commercial scope, or residential work filed separately) using the
   printed minimums.
4. **Third-party figure "$8/k over $100k"** (research notes from an earlier
   pass) matches the UBC 1997 row "$5.60 per $1,000" only loosely; the
   printed Table 1-A row governs.

## Sources actually read

| # | Source | URL | Type | Notes |
| --- | --- | --- | --- | --- |
| 1 | Provo City Consolidated Fee Schedule — Inspection Fees | `https://provo.municipal.codes/Code/FS_Inspection` | municipal_code | Building permit "Based on the 1997 UBC Fee Chart"; plan review 65%; trade minimums $75/$175; plumbing fixture rows |
| 2 | provo.gov FAQ — "What are the current building codes?" | `https://www.provo.gov/FAQ.aspx?QID=91` | municipal_website | Confirms 1997 UBC fee table, 65% plan check, 1% state fee |
| 3 | 1997 UBC Table 1-A Building Permit Fee Schedule (verbatim adoption, Northglenn CO Municipal Code §10-2-5(g)) | `https://municode.northglenn.org/ch10/content_10-2.html` | municipal_code | Full 8-row UBC 1997 ladder transcribed; band bases chain exactly |
| 4 | Provo Building Division | `https://www.provo.gov/200/Building` | municipal_website | Issuing office |

## Seed mapping

- `provo/fee-rules.ts`: PRV-BLD-500 (flat $23.50), PRV-BLD-2K/25K/50K/100K/500K/1M/UP (per_thousand legs, chained bases), PRV-PLAN-REVIEW (65% of permit_fee), PRV-ELEC-MIN ($75 flat), PRV-ELEC-COMM ($175 flat commercial), PRV-PLUMB-MIN ($75 flat).
- `provo/index.ts`: jurisdiction `provo`, county `utah-county`, state `ut`; 3 published pages.
- Worked examples: building $150,000 → $993.75 + 50 × $5.60 = $1,273.75; electrical $75.00 (minimum); plumbing $75.00 (minimum).
