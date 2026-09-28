# Tennessee — state status

**Published (2): Nashville and Memphis — the state is complete.** Nashville was this pass's city
(see [`nashville.md`](./nashville.md)); Memphis and Shelby County were added in a parallel pass on
the same checkout, and the two make the state's own comparison — a consolidated city-county
government pricing its own permits in one, and a county code-enforcement office pricing a city's
and its unincorporated area's in the other.

**Murfreesboro is the next Tennessee candidate**, not a blocker: two cities were required to
close the state and the state is closed, so the resolution below is recorded for whichever pass
takes Tennessee to three — or takes up the state's model for another city. Its source is already
downloaded, and the pass that takes it up should start from these notes rather than a search.

## Sources already located, with their status

| City | Instrument | Status |
| --- | --- | --- |
| Nashville | Codes Fee Schedule PDF (`nashville.gov/sites/default/files/2025-12/Building-Permit-Fee-Scheudle-2025.pdf`) | **read and published** — see [`nashville.md`](./nashville.md) |
| Murfreesboro | **Resolution 26-R-10**, adopting a Schedule of Fees for permits issued by the City of Murfreesboro Building and Codes Department — `murfreesborotn.gov/DocumentCenter/View/8464/Schedule-of-Permit-Fees_26-R-10-PDF` (linked from the Permit Center page, `/540/Permit-Center`) | **downloaded (485 lines via `pdftotext -layout`), not yet modelled** — the next Tennessee pass's first source |
| Memphis | `memphistn.gov` construction code enforcement | **403 from this environment** — unreachable as of 2026-09-25 |
| Knoxville | `knoxvilletn.gov` (site answers 200; the plans-review paths tried returned 404) | needs a link walk from the department index |
| Chattanooga | `chattanooga.gov` (site answers 200; fee documents not linked from the pay-and-apply or building-codes pages tried) | needs a link walk |
| Franklin, Johnson City, Germantown, Clarksville, Provo-style 403s | — | **403 from this environment** |

## Murfreesboro: what the resolution adopts, and how to read it

Resolution 26-R-10 adopts, in one document: Commercial/Industrial/Multifamily Building Permit
Fees, One- and Two-Family and Multiple Single Family Dwelling Building Permit Fees, Mechanical
Permit Fees, Electrical Permit Fees, Gas Permit and Inspection Fees, Plumbing Permit Fees, Mass
Grading Permit Fees, Additional Building Permit Fees, a Final Inspection Deposit, a re-inspection
fee and a Technology Fee. Its recitals cite the City Code sections behind each (7-2, 7-5, 7-8,
7-12, 7-15, 11-9, 15-2, 23-2) and its purpose clause dates the superseded schedule to 2018.

Shapes already visible in the text, for the modelling pass:

- **A commercial valuation ladder** whose printed bases again need checking against their own
  arithmetic: `$101.00–$2,000.00`; `$2,001–$15,000` at $50.00 per thousand; then
  `$250.00 for the first $15,000 plus $13.00` to `$50,000`; `$705.00 plus $10.00` to `$100,000`;
  `$1,230.00 plus $6.50` to `$500,000`; `$3,830.00 plus $4.00` beyond. Fees are "rounded up to the
  next dollar amount".
- **A residential schedule priced by square feet**, not by valuation: under 1,000 sq ft → a
  $500.00 minimum; 1,000–2,000 sq ft → $500.00 plus $0.50/sq ft over 1,000; 2,001–3,000 →
  $1,000.00 plus $0.60/sq ft over 2,000; over 3,000 → $1,600.00 plus $0.65/sq ft over 3,000, with
  "total square feet" defined as heated areas plus one-third of unheated areas and areas under
  roof. The bands are **not continuous** ($750.00 at 2,000 sq ft by the formula against $1,000.00
  printed at 2,001), so each is a printed base — the same seam question Nashville's ladder has.
- **Additions and alterations** at $8.00 per $1,000 of valuation with a $50.00 minimum; pools at
  $100.00 above ground and $150.00 in-ground on residential property; fences $75.00; additional
  certificates of occupancy $200.00 each; a temporary certificate of occupancy deposit of
  $1,000.00 per TCO; partial permits $100.00 each; educational occupancies reduced by 50% where
  the State Fire Marshal also reviews.
- **Mechanical** under the IRC at $150.00 per dwelling unit for new construction and $75.00 per
  addition/remodel, and under the IMC a valuation rate ($75.00 for the first $1,000 plus $7.00 per
  additional $1,000, or $75.00 plus $4.00 for repairs and alterations) beside a boiler table
  priced by BTU/Hp bands ($50.00 to $90.00).
- **Electrical**: a non-residential table priced by amperage and inspection type (rough-in, final,
  temporary poles and service releases), HVAC and VAV rows, sign permits; and a residential table
  of dwelling-unit base fees with amperage bands, pools, step systems and HVAC rows.
- **Gas and plumbing tables**, and the technology fee, in the sections after line 330.

**Read it in at least two `pdftotext` modes.** The `-layout` extraction of the electrical section
interleaves the ITEM and FEE columns so badly that the residential table's rows and amounts lose
their pairing (the same failure mode Scottsdale's, Philadelphia's and Boston's schedules showed).
`-table` mode, or a page-image read of pages 5–6, is required before any of the electrical rows
are modelled — and the reconciliation between the two modes belongs in the research record the
same way Nashville's and Saint Paul's does.
