# Omaha, Nebraska — research record

**Status: published** (Nebraska, pass 8). Three permit pages: building, electrical,
plumbing. State Nebraska is activated with this jurisdiction and Lincoln.

- **Verification date:** 2026-09-25
- **Issuing authority:** City of Omaha, Planning Department — Permits and Inspections Division
- **Transcription:** the Municipal Code read through the Municode Library at code version
  **August 31, 2026 (current)**; the Planning Department's own fee page read directly.

| Document | Where |
| --- | --- |
| Omaha Municipal Code Ch. 43, Sec. 43-91 + Table 43-91 (building permit fees) and Sec. 43-92 (plan review fees) | `https://library.municode.com/ne/omaha/codes/code_of_ordinances?nodeId=OMMUCOCHGEORVOII_CH43BU_ARTIADEN_DIV7FE_S43-91PEFE` |
| Omaha Municipal Code Ch. 44, Sec. 44-130 (electrical fee schedule) | `https://library.municode.com/ne/omaha/codes/code_of_ordinances?nodeId=OMMUCOCHGEORVOII_CH44EL_ARTIVPEIN` |
| Omaha Municipal Code Ch. 49, Sec. 49-304 + Table 49-304 (plumbing permit fees) | `https://library.municode.com/ne/omaha/codes/code_of_ordinances?nodeId=OMMUCOCHGEORVOII_CH49PL_ARTIIIPEINFE_DIV1PE_S49-304PEFE` |
| Planning Department, "Application Fees" — Technology and Training Fee Schedule (Ord. #39121) | `https://planning.omaha.gov/application-fees/` |

All four were read on 2026-09-25 and are recorded as `sources` in the seed payload.

## 1. What the mechanism is

**A valuation table that chains exactly.** Table 43-91 has seven rows, each written as
an amount *"for the first $N, plus $Y for each additional $1,000.00 or fraction
thereof"*. Unlike Houston's (which drifts by design) and Denver's (whose $25,000 seam is
a dollar short), **every Omaha handover closes to the cent**:

| Band (valuation) | Fee at the band's top | Opening figure of the next band |
| --- | --- | --- |
| $1.00 – $2,000.00 | $41.00 | $41.00 — closes |
| $2,000.01 – $25,000.00 | $260.19 | $260.19 — closes |
| $25,000.01 – $50,000.00 | $421.19 | $421.19 — closes |
| $50,000.01 – $100,000.00 | $580.69 | $580.69 — closes |
| $100,000.01 – $500,000.00 | $1,692.69 | $1,692.69 — closes |
| $500,000.01 – $1,000,000.00 | $2,877.69 | $2,877.69 — closes |
| $1,000,000.01 and up | open-ended | — |

The sub-check for each row is the row's own rate: 23 increments at $9.53 give $219.19 on
top of $41.00 = $260.19; 25 at $6.44 on $260.19 = $421.19; 50 at $3.19 on $421.19 =
$580.69; 400 at $2.78 on $580.69 = $1,692.69; 500 at $2.37 on $1,692.69 = $2,877.69. All
six close, which is asserted in `tests/content/omaha-seed.test.ts`.

**Plan review is its own section at 25%.** Sec. 43-92 makes plan review "25 percent of
the building permit fee as shown in table 43-91" — the same percentage-of-another-
component shape Denver's review column has, expressed here as a `permit_fee` rule. It is
gated on `custom.plan_review`, because the City's own `$10,000` deck example carries no
review fee.

**The Technology and Training fee is a third real component, and the City's own example
proves where it attaches.** Under Ordinance #39121 the Planning Department adds a fee to
"all fees paid to the Planning Department":

| Underlying fee charged for permit | Technology and Training fee |
| --- | --- |
| $0.00 – $624.99 | 8% of underlying fees |
| $625.00 – $2,499.99 | $50.00 |
| $2,500 and above | $100.00 |

The City's news page states that "a permit fee of $126.62 would be charged for a
$10,000 deck". Table 43-91 at $10,000 gives $41.00 + 8 × $9.53 = **$117.24**, and
`$117.24 × 1.08 = $126.62` exactly. That is the corroboration that the surcharge lands
on the permit fee, and it is why the building page's worked example includes it.

## 2. Trade permits are per-item, not valuation

**Electrical (Sec. 44-130).** A minimum of $25.00 on all electrical work, then a list of
items. New single-family/two-family/town home wiring is priced by area at $0.06 per
square foot (covering all wiring, the service, major appliances and electric heat).
Commercial, apartment and existing-residential work is priced per item: $2.00 per branch
circuit or feeder, $20.00 for an existing service, and a new-service fee by amperage
($25.00 to 200 A, $65.00 to 400 A, $105.00 to 600 A, $145.00 to 800 A, $185.00 to
1,000 A, then $20.00 per additional 100 A). Temporary poles are $25.00.

**Plumbing (Sec. 49-304).** A $22.70 minimum, then Table 49-304: $7.95 per fixture,
roughed-in opening or roof drain; $7.95 per residential water heater; $11.35 per pressure
vacuum breaker assembly; and a long tail of larger items (below-ground pools $58.90,
commercial water heaters $34.00, water services $7.95–$150.00, sewer connections $45.30
and $61.80, grease interceptors $50.00).

## 3. What is modelled

- **Building:** all seven Table 43-91 bands; plan review at 25%.
- **Technology and Training fee:** all three bands, as `technology` components.
- **Electrical:** the minimum, the residential square-foot rate, the per-circuit rate, the
  existing-service fee, the six new-service bands and the temporary-pole fee.
- **Plumbing:** the minimum, and the three per-item rows named above.

## 4. What is NOT modelled (and why)

- **The quadruple penalty** for work begun without a permit (`Ord.` text: "quadruple the
  amount of the regular fee"), waived only for emergencies permitted within 48 hours.
  It is a penalty, not a fee for the work, and it is stated on the page rather than
  charged.
- **Table 43-91's non-valuation rows** — shoring, and the three insulation fees.
- **The certificate-of-occupancy family, the building analysis fee, duplicate-plan fees
  and after-hours inspection fees** — all flat, all named in the exclusions.
- **The electrical rows not modelled**: pre-connect, re-connect, low-voltage, outage and
  multiple pre-connects; and the $50.00 second re-inspection trip (the first is free).
- **Most of Table 49-304**, which is a long per-item table; the rows modelled are the
  ones a residential permit touches, and the rest are named on the page.
- **The plumbing rows that share a count namespace.** Table 49-304 prices three backflow
  devices separately (atmospheric $7.95, pressure vacuum breaker $11.35, RPZ/double-check
  $28.85). All three read one count, so modelling all three would charge one device three
  times; only the middle row is modelled and the page says so.

## 5. Effective dates

Omaha has no single schedule effective date. Each code section carries the ordinance that
last amended it, and the Municipal Code's own citation block for Chapter 43 shows the
base ordinance (Ord. No. 33582, 1995). Table 43-91 was amended in 2025 by **Ord. No.
44525**, published by the City Clerk as a **scanned PDF with no text layer** (5 pages;
`https://cityclerk.cityofomaha.org/wp-content/uploads/images/ORD-44525.pdf`, 403 from this
sandbox and empty when text-extracted through a proxy). Rather than invent an amendment
date, the seed records the **code version date, 2026-08-31**, as `effectiveFrom` and says
so in the source notes. The electrical schedule's own citation (Ord. No. 32967, 1993)
and the plumbing section's (Ord. No. 40524, 2015; Ord. No. 42654, 2021) are older than
the figures shown, which is normal for a code that amends dollar amounts by later
ordinance without reprinting the citation on every row.

## 6. Blocked, and how it was worked around

`www.cityofomaha.org`, `planning.omaha.gov` and `cityclerk.cityofomaha.org` all return
**HTTP 403** to a direct fetch from this sandbox, and the City Clerk's ordinance PDF is
image-only. The Municipal Code was reached through the **Municode Library**, which is a
City-contracted codification host and returns the same enacted text, and the Planning
Department's fee page was read through a text-extraction proxy. The rates themselves come
from the code, not from any third party.

## 7. Open questions

- **Ord. No. 44525's exact adoption date** was not read (image-only PDF). The figures are
  as published in the code version of 2026-08-31; if the City reprints the ordinance with
  a text layer, the amendment date should replace the code-version date here.
- **Whether the Technology and Training fee attaches to electrical and plumbing permits.**
  It is written for "all fees paid to the Planning Department", and the Permits and
  Inspections Division issues all three permits — so it probably does — but the only
  published example is a building permit. It is charged on the building page and named in
  the electrical and plumbing exclusions rather than assumed.
