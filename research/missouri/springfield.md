# Springfield, Missouri — research record

Second Missouri jurisdiction. Building Development Services (BDS) publishes two fee ordinances — one commercial, one residential — dated 07/01/2025, whose building-permit calculation cites a third instrument, the **2009 IBC Fee Calculation Data** matrix (effective 2009-07-01), for the Type of Construction Factor.

Everything below was read on **2026-09-26**. Nothing is estimated.

## Why Springfield second

Kansas City was the first because its commercial ladder is a single verifiable valuation table with an ordinance date on its face. Springfield was the only other Missouri city whose fee documents answer 200 with byte-stable files *and* use a different mechanism — a non-money marginal table on a **construction factor** rather than a valuation ladder — which is the process's second gate. St Louis (city and county) and Columbia both answer 403/Cloudflare challenge from this sandbox, the same wall that stopped Milwaukee in Wisconsin. Two mechanisms, two readable hosts, one state — Springfield closes Missouri.

## Sources actually read

| Key | Instrument | How read |
| --- | --- | --- |
| S1 | **Building Development Services — Commercial Construction fee schedule (Effective 07/01/2025)** — `https://www.springfieldmo.gov/DocumentCenter/View/910` (docx, 29,975 bytes, SHA-256 `db5512282d15cdfdae65564a4d72e6be2ee55b9fef726bd1e63319e2aed070cb`, HTTP 200) | `curl -L` + `pymupdf` docx extraction (9 pages); read end to end |
| S2 | **Building Development Services — Residential Construction fee schedule (Effective 07/01/2025)** — `https://www.springfieldmo.gov/DocumentCenter/View/926` (docx, 23,556 bytes, SHA-256 `4965997b259f86f666ac9f8ee0c0c3de8942836ec6db4bd1bcb77132f447cba0`, HTTP 200) | `curl -L` + `pymupdf` docx extraction (6 pages); read end to end |
| S3 | **City of Springfield — 2009 IBC Fee Calculation Data (Effective July 1, 2009)** — `https://www.springfieldmo.gov/DocumentCenter/View/902` (PDF, 25,597 bytes, SHA-256 `9763689a735154ef4f99a1086eeb573e962c8d9f5479cc824c8b3ac99fa37b0a`, HTTP 200) | `curl -L` + `pymupdf` text extraction (1 page); read end to end |
| S4 | **BDS fee hub** — `https://www.springfieldmo.gov/DocumentCenter/View/910` etc. fetched 2026-09-25/26 as HTML strip | Department context; fee hub and permit-guide pages |

S1 and S2 print their effective date on their own first line: **07/01/2025**. S3 prints its effective date on its own first line: **July 1, 2009**. All three dates are carried.

## The commercial fee, as read (S1, pp.1–3)

### The formula, as printed

> To calculate the building permit fee you will need: *Use Group, *Construction Type, Gross Floor Area (square footage).
> Gross Area Modifier = 85.
> Gross area (Sq Ft) × Gross area Modifier (85) × Type of Construction Factor = Construction Factor used to calculate the building permit fee.

> 1st 50,000 of Construction Factor × 0.005 = Permit Fee A +
> 2nd 50,000 of Construction Factor × 0.004 = Permit Fee B +
> 3rd 50,000 of Construction Factor × 0.003 = Permit Fee C +
> Remaining amount × 0.0015 = Permit Fee D
> Total of A + B + C + D = Building Permit Fee (minimum $171.00, whichever is greater)

So a **four-band marginal table on construction factor** at 0.005 / 0.004 / 0.003 / 0.0015 dollars per factor (50 / 40 / 30 / 15 cents per 10 factor? No — **0.5 / 0.4 / 0.3 / 0.15 cents per factor**, printed as `.005` etc.). Minimum $171.00.

Two variants on the same arithmetic:

> **INFILLS AND RENOVATIONS:** The Construction Factor will be calculated in the same manner as a New Building or Addition, except the Type of Construction Factor is **0.30** and then the above formula will be used to calculate the Building Permit Fee. Gross area (Square Feet) involved in the renovation only × Gross area Modifier (85) × **0.30** = Construction Factor.

> **COMMERCIAL SHELL BUILDINGS:** A Shell Building with no defined tenant infill spaces, has been added as a sub-category to the Business Use Group, and the Type of Construction Factor has been established **similar to an S-1, Storage, Moderate Hazard Use. This will reduce the permit fee for the Shell Building.**

All three — new building/addition, infill/renovation, and shell — share the same marginal table; only the factor that feeds it changes.

### The IBC matrix (S3), as printed

S3 is a table: rows are the IBC Use Groups (A-1 through U, with sub-rows), columns are the Type of Construction factors **IA, IB, IIA, IIB, IIIA, IIIB, IV, VA, VB**, every cell a multiplier between 0.40 and 2.71, and the Gross Area Modifier is **85** in its own column, constant. Header: `Gross Area Modifier | IA | IB | … | VB`. Two cells print `N.P.` (Not permitted). The B row (Business) reads 1.61/1.55/1.50/1.43/1.30/1.25/1.38/1.14/1.09; the S-1 row (moderate-hazard storage, the shell reference) reads 0.91/0.86/0.81/0.78/0.69/0.66/0.74/0.56/0.52; the Open Shells row reads 0.84/0.80/0.75/0.73/0.62/0.63/0.70/0.52/0.49. The matrix is reproduced in full in memory but its 31 × 9 numeric grid is not transcribed here because the content seed is required to quote the source, not to paginate it.

### Associated fees (S1, pp.2–9), as printed

| Row, as printed | Amount |
| --- | --- |
| Commercial plan review fee | **75% of building permit fee**, minimum $492.00 for projects requiring review by multiple city departments; minimum **$257.00** for projects requiring review by BDS and City Utilities only; no plan review for work minor in nature under §36.1234 |
| Provisional (phase approval) permit fee | **30% of the building permit fee**, minimum $171.00, *in addition* to the normal permit fee |
| Post-permit (change orders, addenda, revisions) plan review fee, per occurrence | $50.00 |
| Technology fee | **18.5% of the building permit fee**, minimum $50.00 (not applicable if plan review is not applicable) |
| Certificate of occupancy — change of use / change of ownership (A groups) | $30.00 each |
| Penalty for occupancy prior to certificate | $250.00 |
| Stormwater detention permit | $171.00 |
| Commercial MEP permit fees **associated** with a building permit | **40% of the building permit fee**, minimum $171.00 |
| Commercial gas permit | $171.00 flat |
| Air-test-only permit | $171.00 flat |
| Commercial MEP permits **not associated** with a building permit | $171.00 flat |
| Mechanical refrigeration (cooler) | $25.00 |
| Exhaust hood | $25.00 |
| Fire sprinkler — new overhead (FIS) | $171.00; plan review $257; tech $50 (if not associated with building) |
| Underground fire sprinkler | $171.00 |
| Sprinkler modifications (no calcs required) | $25.00 |
| Hood suppression FIS | $25.00 |
| Signs — detached | $249.00 + plan review $100 + tech $46 |
| Signs — wall | $69.00 + plan review $50 + tech $13 |
| Temporary sign/banner | $25.00 per 30 days |
| Communication towers / commercial pool / floodplain / parking lot / wrecking | $171.00 (+ plan review $257 + tech $50 where printed) |
| Fence 6 ft or less | No cost permit required |
| Fence over 6 ft | $50.00 |
| Re-submittal plan review (prior to issuance) | $250 for 4th submittal, $500 for 5th+ |
| Re-inspections | $100 after 1st, $200 after 2nd/3rd, $500 after 4th+ |
| Penalty for work without permit | Required fee × 2 + $200 |
| Building/wrecking required by dangerous-building proceedings after legal notice | Required fee × 2 |

Every percentage sentence above is quoted verbatim as the source prints it; the seven trade-flats at $171.00 are the same figure repeated by that many rows because the schedule prices them that way, not because this record collapsed them.

## The residential fee, as read (S2, pp.1–5)

### The formula, as printed

> *Type of Construction Factor = **1.02 multiplied by 0.38**
> Finished Living Area Square Footage (excludes garage and unfinished basement)
> Use Group = R-3 and IRC 2012
> Finished Living Area Square Footage × Gross Area Modifier (85) × Type of Construction Factor (1.02 × 0.38) = Construction Factor used to calculate Building Permit Fee:
> 1st 50,000 of Construction Factor × **0.004** = Permit Fee A +
> 2nd 50,000 of Construction Factor × **0.003** = Permit Fee B +
> 3rd 50,000 of Construction Factor × **0.002** = Permit Fee C +
> Remaining amount × **0.001** = Permit Fee D
> Total of A + B + C + D = Building Permit Fee (minimum $151.00)

So the residential table is the same four-band shape **at different rates**: 0.004 / 0.003 / 0.002 / 0.001 dollars per factor (0.4 / 0.3 / 0.2 / 0.1 cents per factor), minimum $151.00. The only Use Group the residential sheet names is **R-3 / IRC** with a single fixed Type Factor of 0.3876.

> **RESIDENTIAL GARAGE ADDITION (attached or detached), HOME ADDITION OR ACCESSORY STRUCTURE:** Square Feet × 85 × 1.02 × 0.38 = Construction Factor — same formula, same marginal table.

### Associated residential fees (S2, pp.2–5), as printed

| Row | Amount |
| --- | --- |
| Residential MEP permit fee | **40% of building permit fee**, minimum $110 |
| Gas permit | $110 |
| Air-test-only gas | $49 |
| MEP not associated with building | $110 |
| Furnace and/or air conditioner change-out | $49 |
| Water heater change-out | $49 |
| Electrical service repair | $49 |
| Lawn sprinkler / backflow preventer plumbing | $110 |
| Wrecking | $151 |
| Swimming pool (site plan + agreement) | $151 |
| Family home day care inspection | $151 |
| House moving / foundation for moved structure | $151 each |
| Fence over 6 ft | $50; 6 ft or less no-cost permit |
| Wheelchair ramp | No-cost permit |

Residential re-inspections and penalties are verbatim the same figures as the commercial sheet (see S2 p.3).

## The mechanism, named

- **Basis:** `construction_factor` — a non-money count derived as described above; the engine reads it as `custom.construction_factor`.
- **Shape commercial:** `tiered_marginal` on construction factor — rates 0.005 / 0.004 / 0.003 / 0.0015 with minimum $171. The IBC matrix is **not** modelled as rules here; each cell is a published fact `custom.construction_factor` feeds on, and the page is required to name the matrix and its date, because the number of rules such a matrix would need is the reason it is not modelled. (31 use groups × 9 construction types = 279 distinct factors; modelling them would triple-count every fee with the matrix's own 279 rows.)
- **Shape residential:** `tiered_marginal` on the same basis — rates 0.004 / 0.003 / 0.002 / 0.001 with minimum $151, single factor 0.3876 (1.02 × 0.38).
- **Infills/renovations:** same marginal table fed by the 0.30 factor, documented as a distinct `construction_factor` scope rather than a separate percentage rule.
- **Dependent components:** commercial `plan_review` **75% of permit fee** (floor $257 / $492 by department scope), `technology` **18.5% of permit fee** (floor $50); residential MEP **40% of permit fee** (floor $110); commercial MEP **40% / $171** where associated.
- **Trade flats:** eleven commercial flats at $171; four residential flats at $110; eight change-out flats at $49 — each a `flat` rule gated by scope, where that scope is stated.

## Readings this dataset depends on

1. The construction factor is `Gross Area × 85 × Type Factor`; the IBC's 2009 matrix is the source of the Type Factor for commercial work.
2. The commercial marginal rates are **half cents** (0.5¢, 0.4¢, 0.3¢, 0.15¢ per factor), carried as `{numerator, denominator}` rather than whole cents — the engine's new `rate: {ExactRate}` on a marginal tier.
3. The plan review and technology fees read `permit_fee`, which is the sum of base components — the engine's `permit_fee` basis — so no duplicative ladder is stated.
4. The residential construction-factor table is not a different shape: it is the same four bands at different rates, and the factor's own derivation (0.3876 only) is why the residential building permit has no matrix.
5. The $257 / $492 plan-review floor is **not branched** here; the lower of the two ($257, BDS + CU) is the `minimumCents` carried, and the higher is named on the pages and in the `notIncluded` where the project requires multiple departments — collapsing a two-floor table into one rule would overcharge the common case and undercharge the other.

## Effective dates on record

| Instrument | Date carried | Why |
| --- | --- | --- |
| Commercial Construction fee schedule | **2025-07-01** | Printed on its first line: `(Effective 07/01/2025)`. |
| Residential Construction fee schedule | **2025-07-01** | Same line on its first page. |
| 2009 IBC Fee Calculation Data | **2009-07-01** | Printed header: `Effective Date: July 1, 2009`; the matrix's own date. |
| Verification | **2026-09-26** | Every source re-read this day. |

## Not modelled (named on the schedule, never papered over)

- The **Type of Construction Factor matrix itself** — 279 published factors (31 use groups × 9 construction types), each a multiplier in `rateTables`, named on every Springfield page rather than carried as 279 rate-table rows inside one building-permit fee.
- The **30% provisional (phase approval) fee** — `in addition to the normal permit fee`, a second payment schedule rather than a charge inside a total, named on the pages.
- The **$50 post-permit plan review fee**, stormwater $171, certificates $30, boarded-up $200/180 days, fence/wheelchair no-cost instruments, communication-tower/pool/floodplain/parking fixtures, signs, coolers, hoods, fire-sprinkler distinctions (overhead FIS $171 + plan $257 + tech $50 vs no-calcs mod $25), re-inspections, re-submittals, penalties and dangerous-building multipliers — each transcribed and named.
- **Missouri has no state building surcharge** on a local permit — the search for `surcharge`, `technology` and `training` on S1–S3's own texts comes back empty at the state level; the 18.5% technology figure is the City's, not the State's.
- The **residential gas air-test-only $49 vs associated gas $110 vs not-associated MEP $110** distinctions on the residential sheet, which share the same dollar figure but are different scopes.

## Open questions

1. Whether Springfield's BDS maintains a machine-readable copy of the 2009 IBC matrix beyond the PDF that prints it — the matrix is shown as a scan and the docx schedules say `Copies are available from Building Development Services` beside it, which is how an applicant who has not fetched S3 still knows which factor to use.
2. Whether the 2025-07-01 commercial and residential ordinances are the same instrument or two — both carry the same date but their first pages title one `COMMERCIAL CONSTRUCTION` and the other `NEW RESIDENTIAL BUILDINGS AND ADDITIONS`, and no combined ordinance number appears on either.
3. Whether the shell-building 0.84/0.80/… Open Shells row or the S-1 row is charged for a given shell job — S1 says `similar to an S-1` and S3 prints both `Open Shells` and `S-1` as separate rows, and either reading satisfies the sentence while changing the factor by 0.07 at most.
