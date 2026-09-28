# Atlanta, Georgia — research record

**Research pass:** Georgia (first jurisdiction of the seven-state expansion)
**Read on:** 2026-09-26
**Jurisdiction:** City of Atlanta (Fulton/DeKalb Counties, fips 13121 locator; the
Department of City Planning, Office of Buildings issues the permits citywide)
**Pages published:** building, electrical, plumbing

## Why the read went through Wayback

`www.atlantaga.gov` answers **HTTP 403** to every non-browser client (the same
Akamai wall that disqualified the city in the Wisconsin pass — see
`research/wisconsin/green-bay.md`, which names Atlanta as a prior 403). The
fee tables were read from the Internet Archive's snapshot of the City's own
"Getting started with our Zoning, Development, and Permitting Services" page
(snapshot 2025-11-05, `web.archive.org/web/20251105131841/`), which reproduces
the Department of City Planning fee tables verbatim. Municode's code library
requires an authenticated session API (401), so the ordinance citation
(Chapter 20, Article IV, Sec. 20-6 and Appendix B Table 100) is carried from
the City's own page, which names both instruments. `atl311.com` — the City's
official 311 knowledge base — confirms the minimum ($150) and the technology
fee ($25) live, and was read directly on 2026-09-26.

## Fee facts (Department of City Planning, Office of Buildings)

Building permit:

| Item | Amount |
| --- | --- |
| Building permit | **$7 per $1,000 of Cost of Construction** |
| Minimum fee | **$150** |
| Technology fee (per permit) | **$25** |
| Permit extension (each) | $110 |
| Change of contractor / record change | $50 |

The City's page directs valuation to **Table 100 of Appendix B** of the Code
of Ordinances (the ICC building valuation data). The permit fee is set on the
higher of the sworn cost-of-construction estimate or the reviewer's estimate
from the City's standard construction-cost table. Repairs to single-family,
duplex, multi-family or non-residential structures under **$10,000** of total
valuation are exempt from permit and fee (Ord. 17-O-1307); in historic
districts (Chapter 20 of the zoning ordinance) the repair exemption drops to
**$2,500**.

Trade permits (base fee / minimum fee):

| Permit | Base fee | Min fee |
| --- | --- | --- |
| Mechanical permit | $150 | $175 |
| **Electrical permit** | $150 | $75 |
| **Plumbing permit** | $150 | $175 |
| Hot water tank (remove & replace, 1- & 2-family) | $50 | $175 |
| Temporary power | $150 | $175 |
| Gas pressure test | $150 | $175 |
| Public utility permit | $50 | $75 |
| Low voltage (min $45 first 3,000 sq ft, $1.50 per add'l 1,000) | $150 | $175 |

> "***A $25 Technology fee is applied to each of the permit base fees." —
> the City's own footnote. Every worked example in the seed carries it.

Certificate of occupancy (context, not in the three pages' totals): new
1- & 2-family residence $100; additions $50; commercial $200/floor (1–7
stories); commercial interior alterations $100/suite.

## Discrepancies and how they were resolved

1. **Third-party blogs claim "separate plan review at 50–65%".** The City's
   fee table publishes **no separate plan-review line** for building permits
   (plan review is bundled; the sheet has no percentage anywhere). The seed
   charges only the three published components — permit fee, minimum, tech
   fee — and the FAQ on the building page states that no separate plan-review
   percentage is published.
2. **Trade permit "base $150, min $75"** (electrical) looks inverted against
   the other two trades' "$150 / $175". It is not: the base fee is the
   ordinary calculation floor and the *minimum fee* column is what a
   combination permit pays. The seed models electrical at a $150 flat with a
   $75 minimum, and plumbing/mechanical at a $150 flat with a $175 minimum,
   exactly as the table prints.
3. **Atlanta vs Savannah rounding.** Atlanta's "$7 per $1,000" prints no
   "or fraction thereof", so the rate prorates ($7.00 × thousands); Savannah's
   Revenue Ordinance prints "any fraction thereof" explicitly for every trade
   and the building side chains its three bands. Each city keeps its own
   reading.

## Sources actually read

| # | Source | URL | Type | Notes |
| --- | --- | --- | --- | --- |
| 1 | Dept. of City Planning — Getting started with ZD&P Services (fee tables) | `https://www.atlantaga.gov/government/departments/city-planning/zoning-development-permitting-services/getting-started-with-our-zd-p-services` via `https://web.archive.org/web/20251105131841/...` | municipal_website (official snapshot) | Fee tables read from the archived copy; live URL 403s to scripts |
| 2 | ATL311 — Office of Buildings, Residential Permits | `https://www.atl311.com/en-us/knowledgearticle/?code=KB0012509` | municipal_website | Confirms $150 minimum + $25 technology fee; names the Code of Ordinances schedule; modified 2026-08-20 |
| 3 | Code of Ordinances Ch. 20 Art. IV / Appendix B Table 100 (citation) | `https://library.municode.com/ga/atlanta/codes/code_of_ordinances` | municipal_code | Named as the schedule's legal source by both official pages; content behind authenticated viewer |

## Seed mapping

- Building: `per_thousand` on valuation at 700 cents per $1,000 (prorates —
  no fraction language), `$150` minimum charged as a shortfall
  (`permit_minimum` on `permit_fee`), `$25` technology fee as a flat
  `technology` component.
- Electrical: `$150` flat base with `$75` minimum floor; `$25` technology fee.
- Plumbing: `$150` flat base with `$175` minimum floor; `$25` technology fee.
