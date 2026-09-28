# Oak Park, Illinois — research record

**Jurisdiction:** Village of Oak Park, Cook County, Illinois (FIPS 17-031-55311).
**Type:** village. **Department:** Development Services Department — Permits & Development Division.
**Research date:** 2026-09-25. **Effective date of priced figures:** 2026-03-01.

## 1. Documents read

| Key | Document | URL | Notes |
| --- | --- | --- | --- |
| `oak-park-2026-construction-fees` | Village of Oak Park *2026 Construction Fees* (Annual Fee Ordinance §7-8-1) | `https://www.oak-park.us/files/assets/oakpark/v/3/development-services/permits/2026-construction-fees-and-credits.pdf` | sha256 begins `748c88d7631cf0c0`; updated 01/26/2026 on its face; header states "Construction Fee(s) Effective on March 1st, 2026" |
| `oak-park-building-permits-page` | Village of Oak Park — Building Permits | `https://www.oak-park.us/Building-Business/Building-Permits` | HTTP 200 2026-09-25; authority for the separate-permit structure of the trades |

Read with `pdftotext` (default layout mode pairs this document correctly; the two flat lists at the foot were cross-checked line by line against the PDF).

## 2. The building fee

Two rows, one chart, two multipliers:

- **New Construction and Additions:** `Area (SF) × Construction Cost (CC) × .0194`, where CC is the ICC Square Foot Construction Cost Chart reproduced inside the schedule. The row states the fee "does not include any exterior work or other required fees for Water Service, Sprinklers, Alarms, Electric Service, Demolition, Plan Review Fees".
- **Remodel – General** (and **Tenant buildout of non-residential, mixed use, commercial, and institutional structures**): `SF × CC × .008 (min $300)` residential; `(min $500)` multi-family, commercial, institutional. The schedule prints the two minimums on the same row structure, split by residential vs IBC project class.

**No valuation field exists anywhere on the schedule.** CC is the ICC's published square-foot construction cost for the use group × construction type, not the applicant's contract price.

Chart footnotes as printed: private garages use Utility/miscellaneous; shell-only buildings deduct 20%; unfinished basements in R-3 are $31.50 per SF; chart and footnotes credited to *Building Valuation Data — August 2025* (ICC).

## 3. The ICC chart

27 use groups × nine construction types (IA, IB, IIA, IIB, IIIA, IIIB, IV, VA, VB) = 243 cells. Five cells are printed **NP — Not Permitted** and publish no cost:

- H-1 explosives × VB
- I-2 hospitals × IIIB, I-2 hospitals × VB
- I-2 nursing homes × IIIB, I-2 nursing homes × VB

238 published cells, transcribed and re-checked cell by cell. Values run from $69.64 (U × VB) to $473.85 (I-2 hospitals × IA).

## 4. Plan review (charged on top of the building fee)

| Row | Amount | Unit |
| --- | --- | --- |
| New one- and two-family dwelling units/additions | $500.00 | per unit |
| Interior alterations | $150.00 | per floor |
| Non-roofed accessory (one/two family) | $50.00 | flat |
| Roofed accessory (one/two family) | $100.00 | flat |
| New structure/additions/alterations (multifamily, commercial, institutional) | $500.00 | per floor |
| Non-roofed accessory (IBC) | $150.00 | flat |
| Roofed accessory (IBC) | $200.00 | flat |

Third-party plan review, when required, is billed at the Village's cost plus these base fees (§7-8-2.A); plan review fees are non-refundable.

## 5. The trades as stand-alone permits

The Building Permits page states: "A separate permit from a general construction permit is necessary because electrical work requires specialized skills and knowledge" (electrical) and the equivalent for plumbing, which "can cause significant water damage to a building". Owners of single-family homes may obtain a plumbing permit by affidavit.

| Trade | Row | Amount |
| --- | --- | --- |
| Electrical | Miscellaneous alterations | $100.00 per circuit |
| Electrical | System installations (services, panels, generators, solar, EV chargers, ESS…) | $175.00 per system/unit |
| Plumbing | Alterations (piping, fixtures) | $100.00 per unit |
| Plumbing | System installations (water heater, softener, irrigation, RPZ…) | $175.00 per system/unit |
| Plumbing | Flood control / sewer backup control | $200.00 per system/unit |
| Plumbing | Sanitary/storm sewer connection or repair | $250.00 flat (+ refundable $1,000.00 ROW restoration deposit if applicable) |

Water service work is deferred to the Water & Sewer Division's separate *Schedule of Water Service Cost and Fees* and is not priced here.

## 6. Deliberately not modelled

- **Alteration – General rows** ($150 residential / $250 IBC, "per type of work") — the count is the number of kinds of work, not a fact this calculator asks for.
- **Fire alarm / fire sprinkler final inspections** ($25.00 per unit, $350.00 minimum) and the Fire Department plan reviews — fire-process rows.
- **Interior demolition** ($300.00 per unit **or** $.35 × SF, whichever is greater) and **demolition of any structure** ($5,000.00 per structure **or** $.35 × SF, whichever is greater) — greater-of-two-products comparisons; named on the pages, not computed.
- **HVAC/mechanical rows** ($100/$175) — mechanical is not one of the three priced permit types.
- **Application deposits** ($100 residential / $200 commercial, non-refundable but applied to the permit) — process steps, not fee components.
- **Zoning, small wireless, ROW utility, penalty and enforcement rows.**

## 7. Hand-checked figures

| Scenario | Arithmetic | Amount |
| --- | --- | --- |
| 1,000 SF new home, R-3, Type IIIA | 1,000 × $195.98 × .0194 | **$3,802.01** |
| + plan review, two units | 2 × $500.00 | $1,000.00 → permit total **$4,802.01** |
| 1,000 SF remodel, R-3, IIIA | 1,000 × $195.98 × .008 | **$1,567.84** |
| 100 SF remodel, R-3, IIIA (residential floor) | 100 × $195.98 × .008 = $156.78 → floor | **$300.00** |
| 100 SF remodel, IBC floor | $156.78 → floor | **$500.00** |
| 800 SF tenant buildout, B, IIB | 800 × $268.41 × .008 | **$1,717.82** |
| 2,000 SF hospital, I-2, IA | 2,000 × $473.85 × .0194 | **$18,385.38** |
| 1,000 SF I-2, IA (verify-db check) | 1,000 × $473.85 × .0194 | **$9,192.69** |
| Twelve electrical circuits | 12 × $100.00 | **$1,200.00** |
| + sub-panel system row | + $175.00 | **$1,375.00** |
| Five units of plumbing alteration | 5 × $100.00 | **$500.00** |
| Flood control + water heater | $200.00 + $175.00 | **$375.00** |
| Sewer connection | flat | **$250.00** |

All asserted in `tests/content/oakpark-seed.test.ts` and recomputed from PostgreSQL in `scripts/verify-db.ts`.
