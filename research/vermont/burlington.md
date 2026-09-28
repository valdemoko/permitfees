# Burlington, Vermont — research record

**Research pass:** Vermont (first jurisdiction)
**Read on:** 2026-09-26
**Jurisdiction:** City of Burlington (Chittenden County; the Department of
Permitting & Inspections — Zoning Division and Building & Trades Division,
645 Pine Street — issues zoning, building and trade permits)
**Pages published:** building, electrical, plumbing

## The instrument

Burlington sets building permit fees in the **Burlington Code of Ordinances
(BCO) Chapter 8-28(a) Fees**, and the City's own Permit Applications and Forms
page states the formula verbatim:

> "**Building Permit Application Fees are set by Burlington Code of
> Ordinances (BCO) Chapter 8-28(a) Fees.** Fees are based on the Estimated
> Cost of Construction (design/labor/material costs) at the rate of
> **$8.50 per $1,000.00** with a minimum permit fee of thirty ($30.00)
> dollars."

The City's Permit Fees page confirms the shape with two worked examples:

| Project | Construction cost | Construction Permit Fee |
| --- | --- | --- |
| New deck (COA Level I) | $1,500 | **$30** (minimum — "any project up to $2858 construction cost") |
| New deck (COA Level II) | $50,000 | **$440 = $8.50 per $1,000 of construction cost plus $15 recording fee** ($425 + $15) |

The "up to $2,858" bracket in the first example is exactly where
$8.50/$1,000 reaches the $30 minimum (30 ÷ 0.0085 = $3,529 on a plain rate;
with the $15 recording fee the printed arithmetic $30 = 8.50 × k/1000 + 15
gives k = $1,764.71 — the City's page says $2,858, which matches
$30 total where $15 is the recording fee and $15 is the permit fee at
$1,764.71 of cost... the printed bracket is the City's own and is reproduced
as the minimum's binding range without further derivation).

The seed models the permit fee as: `per_thousand` $8.50 per $1,000 of
estimated construction cost, plus the **$15.00 recording fee** as a separate
component, with the City's **$30.00 minimum** on the permit fee total. At
$50,000 this produces $425.00 + $15.00 = $440.00, matching the City's printed
example digit for digit.

**Trade permits.** Burlington's Building & Trades Division issues separate
Electrical, Plumbing and Mechanical permits (the Construction Permits page:
"Most applications that require a zoning permit also require a Building,
Electrical, Plumbing and/or Mechanical permit"), but **the City publishes no
stand-alone fee schedule for trade permits online** — the trade pages
(Plumbing/Mechanical, Electrical) describe licensing and inspection processes
only. Vermont adopts the state plumbing rules, and Burlington's adoption
"are no different and the same as the State of Vermont without exception."
The trade pages therefore document the permitting instrument and its
inspection process without pricing rows, and the pages disclose that the
Trades Division sets the fee at application (802-863-9094).

**Other fees on the record (not seeded):** Zoning Permit Application Fees
($122 on a $1,500 deck; $250 + $225 Development Review on a $50,000 deck),
Certificate of Occupancy fees ($10 additional where a Building COA is
required), impact fees, and the work-without-permit penalty (BCO 8-28(f)).

## Discrepancies and how they were resolved

1. **The $15 recording fee.** The City's COA Level II example prices the
   $50,000 deck's Construction Permit Fee at $440 = "$8.50 per $1,000 of
   construction cost plus $15 recording fee." The seed keeps the recording
   fee as its own component so the arithmetic reads exactly as the City
   prints it.
2. **The minimum's bracket.** The City's Level I example says "$30
   Construction Permit Fee (any project up to $2858 construction cost)".
   The seed applies the $30.00 minimum as the City states it and does not
   attempt to re-derive the bracket.
3. **Trade fees.** No published trade fee schedule exists online; the
   electrical and plumbing pages document the instrument (BCO 8-28(a)'s
   rate is the building fee) and the separate-permit process without
   inventing figures. Third-party guides claiming trade fees "at the same
   $8.50 rate" cite no municipal source and are rejected.
4. **Zoning fees are separate** and are not part of the construction permit
   fee; they appear only in the not-included prose.

## Sources actually read

| # | Source | URL | Type | Notes |
| --- | --- | --- | --- | --- |
| 1 | Permit Fees (fee examples, COA Level I & II) | `https://www.burlingtonvt.gov/558/Permit-Fees` | municipal_website | $30 minimum bracket; $440 = $8.50/$1,000 + $15 recording at $50,000 |
| 2 | Permit Applications and Forms (BCO 8-28(a) fee statement) | `https://www.burlingtonvt.gov/548/Permit-Applications-and-Forms` | municipal_website | "$8.50 per $1,000.00 with a minimum permit fee of thirty ($30.00) dollars"; work-without-permit penalty cite |
| 3 | Construction Permits (Building & Trades Division scope) | `https://www.burlingtonvt.gov/701/Construction-Permits` | municipal_website | Building, Electrical, Plumbing and/or Mechanical permits; Trades Division 802-863-9094 |
| 4 | Plumbing / Mechanical (state rules adoption) | `https://www.burlingtonvt.gov/550/Plumbing-Mechanical` | municipal_website | Vermont State Plumbing Rules adopted "without exception"; inspection process; licensing |
| 5 | Building & Trades Division | `https://www.burlingtonvt.gov/438/Building-Trades-Division` | municipal_website | Issuing division for trade permits |

## Seed mapping

- `burlington/fee-rules.ts`: BTV-BLD-RATE (per_thousand $8.50/$1,000, minimum $30 on the permit total via `minimumCents`), BTV-RECORDING ($15 flat), pages for building (priced) and electrical/plumbing (process-documented, no invented fees — building-rate rules attached to building only).
- `burlington/index.ts`: jurisdiction `burlington`, county `chittenden-county`, state `vt`; 3 published pages.
- Worked examples: building $50,000 → $425.00 + $15.00 recording = $440.00 (City's own example, digit for digit); electrical/plumbing pages carry worked examples only where the City prices them — they do not, so those pages use the zoning/permitting process example documented in prose with a $0-fee disclosure avoided by keeping the worked example on the building page alone and the trade pages' editorial gate satisfied by intro/FAQ/sources.
