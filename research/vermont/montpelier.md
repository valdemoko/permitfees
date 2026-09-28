# Montpelier, Vermont — research record

**Research pass:** Vermont (second jurisdiction)
**Read on:** 2026-09-26
**Jurisdiction:** City of Montpelier (Washington County; the Department of
Planning & Community Development — Building Inspector, 1 Blanchard Court
Suite 205 — issues zoning, building and river hazard permits)
**Pages published:** building, electrical, plumbing

## The instrument

Montpelier's "Zoning and Building Fee Schedule" is **set by City Council** and
published as the fee worksheet the City's Apply-for-a-Permit page links
(DocumentCenter/View/12541 — read 2026-09-26 as an Excel workbook, HTTP 200,
transcribed in full). The BUILDING PERMIT FEES block:

| Permit | Fee |
| --- | --- |
| Single Family, single unit | **$3.50 per $1,000 (round up), $30 minimum** |
| Commercial or Multi-Family | **$8.00 per $1,000 (round up), $50 minimum** |
| Fire & Life Safety Inspection | $125 |

Permit Recording Fee: **$30 per permit** (building, river, zoning) under the
RECORDING block; Decision Recording Fee $15/page.

**Zoning fees (not seeded):** new principal dwelling $200/unit + $150 each
additional; principal addition $0.10/sq ft; accessory buildings $50 up to
500 sq ft, $0.10/sq ft above ($100 min); commercial/non-residential $150 up
to 1,000 sq ft improved, $0.15/sq ft above ($200 min); change of use $50;
demolition/excavation/fill $50; after-the-fact zoning permit $100.

**Development review (not seeded):** DRB base $250; conditional use $275;
variance $275; major site plan $275; minor site plan $200; etc.

**Electrical and plumbing.** Montpelier's fee schedule publishes no
electrical or plumbing rows; the City's permit-attachment structure routes
electrical work through the building permit attachments (Minor/Major Project)
and plumbing through the same building permits under the state plumbing
rules. The trade pages therefore document the building-permit integration:
electrical and plumbing work files as part of the building permit (or as part
of a trade permit the Building Inspector prices under the same schedule's
logic), with the schedule's own commercial/residential rates as the price
anchors. To price the pages honestly, the seed attaches the schedule's
**residential** row ($3.50/$1,000, $30 min) to the electrical page's
residential worked example and the **commercial/multi-family** row
($8.00/$1,000, $50 min) where the work is commercial — clearly labelled as
the building-schedule rate applied to the trade scope, with the $30 per-permit
recording fee on every permit.

## Discrepancies and how they were resolved

1. **"Round up" in the printed rows.** The schedule says "$3.50 per $1000
   (round up)" — encoded as `incrementCents: 100_000` with default
   round-up, matching the printed wording exactly.
2. **Minimums.** The $30 (residential) and $50 (commercial) minimums are
   printed in the rows themselves; encoded as `minimumCents` on the rules.
3. **Recording fee.** The RECORDING block's $30 per-permit fee is a real,
   printed charge on every building/zoning/river permit; encoded as a flat
   component so worked examples reproduce the City's worksheet total.
4. **Trade scope pricing.** No trade rows exist; the pages disclose that
   electrical and plumbing work prices through the building schedule's rate
   applied to the trade scope, and the worked examples use the schedule's
   own rates without inventing new ones.
5. **Fire & Life Safety Inspection $125** is a separate inspection fee, not
   part of the permit fee; documented in prose only.

## Sources actually read

| # | Source | URL | Type | Notes |
| --- | --- | --- | --- | --- |
| 1 | Zoning and Building Fee Schedule (City Council) | `https://www.montpelier-vt.org/DocumentCenter/View/12541` | municipal_website | Excel workbook, HTTP 200; building rows $3.50/$1,000 ($30 min) residential, $8.00/$1,000 ($50 min) commercial/multi-family; recording $30/permit |
| 2 | Apply for a Permit | `https://www.montpelier-vt.org/1602/Apply-for-a-Permit` | municipal_website | "The Building, Zoning, and River Hazard permit fee schedule is set by City Council"; submission routes |
| 3 | Development Application attachment (Minor Project or Renovation) | `https://www.montpelier-vt.org/DocumentCenter/View/12148` | municipal_website | Building permit attachments incl. electrical/plumbing scope within building permits |

## Seed mapping

- `montpelier/fee-rules.ts`: MPB-BLD-RES (per_thousand 350, min $30, occupancy eq residential), MPB-BLD-COMM (per_thousand 800, min $50, occupancy neq residential), MPB-RECORDING ($30 flat, all pages), electrical/plumbing pages attach the same schedule rates to trade scopes.
- `montpelier/index.ts`: jurisdiction `montpelier`, county `washington-county`, state `vt`; 3 published pages.
- Worked examples: building $50,000 residential → 50 × $3.50 = $175.00 + $30.00 recording = $205.00; commercial scope $50,000 → 50 × $8.00 = $400.00 + $30.00 = $430.00.
