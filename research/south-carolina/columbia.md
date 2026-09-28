# Columbia, South Carolina — research record

**Research pass:** South Carolina (second jurisdiction)
**Read on:** 2026-09-26
**Jurisdiction:** City of Columbia (Richland & Lexington Counties, fips 45079
locator; Planning & Development Services, Development Center — 1401 Main
Street, 3rd Floor — issues the permits citywide)
**Pages published:** building, electrical, plumbing

## The instruments

Two one-page fee schedules served from the Development Center's own document
library, plus the permit application:

| Document | URL | Dated |
| --- | --- | --- |
| Residential Development Review Fees ("Residential Fees.xls", LR-08.05) | `https://planninganddevelopment.columbiasc.gov/wp-content/uploads/2021/01/residential_fees.pdf` | sheet footer "City of Columbia - Development Center - 08.05"; PDF created 2014-07-08 |
| Commercial Development Review Fees ("commercial_fees_revised2014_07_01", LR-06/20/14) | `https://planninganddevelopment.columbiasc.gov/wp-content/uploads/2021/01/commercial_fees_revised2014_07_01.pdf` | PDF created 2014-06-23 |
| Commercial Building/Zoning Permit Application (rev. 2.8.24) | `https://planninganddevelopment.columbiasc.gov/wp-content/uploads/2024/02/dc_commercial_apprev.2.8.24.pdf` | 2024-02-02 |
| Electrical Permit Application (rev. 1/2026) | `https://planninganddevelopment.columbiasc.gov/wp-content/uploads/2026/07/Electrical20262.pdf` | 2026-01 |

## Fee facts

**Residential (one & two family):**

| Item | Amount |
| --- | --- |
| Plan Review | **$25.00** |
| Building permit, $1.00–$5,000 of value | **$20.00** |
| Building permit, over $5,000 | **$4.00 per $1,000 or fraction thereof** |
| Zoning permit, under $10,000 | $5.00 |
| Zoning permit, over $10,000 and/or multi-family | $10.00 |
| Demolition | Garage/accessory $25; one-story $50; two-story $75 |

The note on the residential sheet fixes the valuation basis: "Permit fees are
calculated on a per building basis and shall be based on the total contract
price or total value of work to be done or per square foot values for
construction as reported in the International Code Council (ICC) Building
Safety Journal for building valuation data, with one and two family dwellings
calculated as follows: **Average $45.00; Good $63.00; Best $70.00; Garage
$25.00**" (per square foot).

**Commercial / multi-family:** plan review is **30% of the building permit
fee**; the building-and-trade ladder runs $50.00 at $1–$5,000; $50.00 +
$9.00/$1,000 or fraction to $100,000; $905.00 + $4.00/$1,000 or fraction to
$1,000,000; $4,505.00 + $3.00/$1,000 or fraction to $5,000,000; $16,505.00 +
$2.00/$1,000 or fraction above.

**Trade permits.** The commercial application's NOTE is the operative rule:
"**Subcontractors must obtain individual trade permits for electrical,
mechanical, plumbing & gas.** Subcontractors must provide the general
contractor's permit # for a **no-cost permit**, otherwise the subcontractor
will be responsible for payment of permit fees." The trade ladders match the
building ladder's bands ($50 base, then $9/$4/$3/$2 per $1,000 or fraction by
band) for commercial; standalone residential trades run **$20 for the first
$1–$5,000 of value, then $4.00 per $1,000 or fraction thereof** — the
residential building rate without the plan review.

## Rounding readings

Every rate row prints "**or fraction thereof**", so the value of work rounds
**up** to the whole $1,000 inside each band (the Fargo reading), and each
band's printed base is the amount the band below produces at its top (the
ladder chains exactly: $50 + 95 × $9 = $905 at $100,000; $905 + 900 × $4 =
$4,505 at $1,000,000; $4,505 + 4,000 × $3 = $16,505 at $5,000,000 — all
verified).

## Sources actually read

| # | Source | URL | Type | Notes |
| --- | --- | --- | --- | --- |
| 1 | Residential Development Review Fees | see above | fee_schedule_pdf | Plan review $25; building $20 to $5,000 then $4/$1,000 or fraction; ICC valuation note |
| 2 | Commercial Development Review Fees | see above | fee_schedule_pdf | Plan review 30%; the four-band trade/building ladder with "or fraction thereof" |
| 3 | Commercial Building/Zoning Permit Application | see above | permit_portal form | The no-cost-trade-permit rule for scopes inside a GC's building permit |
| 4 | Electrical Permit Application (rev. 1/2026) | see above | permit_portal form | Names the total contract value as the fee basis; SC-LLR license required |

## Seed mapping

- Building: `tiered_marginal` on valuation, split by occupancy — residential
  $20 to $5,000 then $4.00/$1,000 or fraction; commercial $50 to $5,000 then
  the $9/$4/$3/$2 chained bands. Plan review $25 flat residential / 30% of
  the permit fee commercial.
- Electrical / plumbing: the same residential ladder standalone ($20 base,
  $4.00/$1,000 or fraction), with the no-cost rule documented on the pages
  and modelled as a condition the seed's `custom.trade_covered` fact can
  express.
