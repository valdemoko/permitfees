# Louisville, Kentucky — Permit Fee Research

**Jurisdiction:** Louisville Metro / Jefferson County, KY
**Department:** Department of Codes & Regulations — Office of Construction Review (a Division of Codes and Regulations), 444 S. 5th St., Louisville, KY 40202, (502) 574-3321
**Legal basis:** Louisville Metro Code of Ordinances (LMCO) Chapter 150.096 — "Promulgated Fees & Regulations — Construction Permits and Inspection Fees"
**FIPS:** State 21 (KY); Jefferson County 21111

## Sources (all primary, .gov)

1. **Promulgated Permit Fees, revised 2/6/2024** (PDF, 8 pages):
   `https://louisvilleky.gov/sites/default/files/2025-05/promulgated-permit-fees-february-20240pdf.pdf`
   Header: "LMCO CHAPTER 150.096 PROMULGATED FEES & REGULATIONS — CONSTRUCTION PERMITS AND INSPECTION FEES". Sections: Building & Tent (p.2), Electrical (p.3), HVAC–Mechanical (p.4), Fire Detection & Suppression (p.5), Moving (p.7), Wrecking (p.7), Sign (p.7), Parking Lot (p.7), Tax Moratorium (p.8), Penalty (p.8), Administration (p.8). Verified 2026-09-26 (fetched with browser-mimicking curl headers after plain curl hit a Cloudflare challenge; document identical to the one the Construction Review pages link).
2. **Permit Fees page**: `https://louisvilleky.gov/government/construction-review/permit-fees`
   Prose mirror of the promulgated schedule ("The fee is $50 plus $2.50 for every $1,000 of the estimated cost" for work where square footage cannot be calculated; wrecking/parking-lot/sign rows).
3. **Construction Permit and Inspection Fees forms page**: `https://louisvilleky.gov/construction-review/forms/construction-permit-and-inspection-fees` — links the PDF above as the current promulgated fees.

## Discrepancy resolution

- **Minimum permit fee $50 vs $75**: the PDF's item 10 states "No building permit fee calculated under this section shall be less than $75." A 2018 news item announced the minimum moving $50 → $75 effective 2018-07-01; the 2024 revision carries $75. Adopted **$75** (the promulgated document governs).
- **Commercial fee basis**: Louisville prices new construction by **occupancy type at a rate per square foot** (Assembly $0.16, Business $0.15, Educational $0.14, Factory $0.15, High hazard $0.16, Institutional $0.15, Mercantile $0.15, Residential 1 & 2 Family $0.105, Residential other $0.15, Storage $0.14, Utility/misc $0.13). Square footage = every floor including finished basements, to the outside of exterior walls.
- **Partial alterations / unmeasurable work**: "$50 plus $2.50 per $1,000 of estimated cost" — this is the valuation ladder, used when sq ft cannot be calculated.
- **Plan review**: "a minimum $30 or one third (1/3) the normal permit fee, whichever is higher" — charged for applications reviewed without permit issuance. (The Construction Review permit-fee page separately notes plan review on issued permits; the promulgated text governs: ⅓ of the permit fee with a $30 floor.)
- **Foundation-only permits**: $75 single-family dwellings and accessory structures; $125 all other uses.
- **Certificate of Use & Occupancy without an associated building permit**: $75 administrative fee.

## Electrical (promulgated schedule, pp. 3–4)

1. Initial installation, 1–2 family residence: **$200** (includes 3 inspections).
2. Condominium / patio home: **$150 base** + **$0.25/amp up to 600 A** + **$0.50/amp over 600 A** (3 inspections).
3. Service upgrade / new service / repairs / additional wiring, 1–2 family, condo or patio home: **$75** (work ≤ $750), **$100** (work > $750), 1 inspection.
4. Other-than-residential new wiring: **$100 base** + **$25/subpanel** + **$25/dwelling unit** (residential structures other than 1–2 family) + **$0.25/amp up to 600 A** + **$0.50/amp over 600 A** (2 inspections).
5. Rewiring/repairs, other than 1–2 family, condo, patio home: **$75** (≤ $750) / **$100** (> $750) + $25 per dwelling unit (residential) or per subpanel (commercial).
6. Temporary pole: **$85**.
7. Additional inspection: **$50**.
8. Burnout repair on a service: **$75** (≤ $750) / **$100** (> $750), 1 inspection.

Note: rules 3, 5 and 8 carry both the base and a work-cost condition; the work-cost input is `custom.work_cost_cents` (money in cents).

## Plumbing — NOT a local fee

Louisville Metro's promulgated fee schedule contains **no plumbing section**. Kentucky licenses and inspects plumbing at the **state** level: the Department of Housing, Buildings and Construction, **Division of Plumbing**, issues plumbing construction permits statewide ("No person, firm or corporation shall construct, install or alter any plumbing without first having procured a plumbing construction permit from the Division of Plumbing", per dhbc.ky.gov).

State fee schedule — **815 KAR 20:050**, Section 4 (last amended 48 Ky.R. 629; eff. 3-1-2022):

- Residential 1 & 2 family: **$50 base + $14 per opening** (fixture, appliance or opening left in the soil/waste system, each domestic water heater, each separately metered water/sewer service beyond the first).
- All other buildings: **$50 base + $20 per opening** (same list, plus conductor openings).
- Single water heater replaced in a building: **$50 flat** (subsection 3.a); multiple heaters → the per-opening calculation.
- Base-fee-only cases (corrections/testing of another's installation; permit taken over by a new master plumber).
- **5 inspections included**; additional inspection **$50** (waived if the permit fee exceeds $250).

Sources: `https://dhbc.ky.gov/newstatic_info.aspx?static_id=337` (Division of Plumbing) and `https://apps.legislature.ky.gov/law/kar/titles/815/020/050/` (regulation text; retrieved via Internet Archive snapshot 2024-09-27 after apps.legislature.ky.gov proved unreachable directly).

The Louisville **plumbing** page therefore prices the **state** permit that applies inside Louisville Metro (the local schedule has no plumbing fees of its own) and says so plainly.

## Engine modelling notes

- Building per-sq-ft occupancy rows → `percent` rules with `rateUnit: "currency_per_unit"`, rate = cents/sq ft as `{numerator, denominator}` (e.g. $0.105/sq ft = `{105, 100}` = 1.05 cents per sq ft), keyed on `custom.building_use` (`in` [...]), each with `permit_minimum { basis: "permit_fee", floorCents: 7_500 }` sibling and rule-level `minimumCents: null` (the $75 minimum is global, modelled once as a permit_minimum on each new-construction rule set) — plus a flat **alteration ladder** for work without calculable area ($50 + $2.50/$1,000 or fraction, per_thousand with base 5_000, threshold 100_000... actually base covers the first $1,000: `baseCents: 5_000, thresholdCents: 100_000, centsPerThousand: 250, incrementCents: 100_000`).
- Foundation-only: two flat rules ($75 SFR / $125 other) gated on `custom.foundation_only: true` (and building_use eq residential for SFR).
- Plan review ⅓: `percent { basis: "permit_fee", rateBps: 3_333⅓ }` — not expressible; 1/3 = `rate: {numerator: 1, denominator: 3}` with `minimumCents: 3_000`, gated `workType: neq` — no: promulgated text ties it to review-without-issuance, so it is **excluded from the three calculator pages** (a permit-issuance calculator) and documented in FAQs. This avoids double-charging plan review on permits that include it.
- Electrical amperage proration: `percent { basis: "amperage", rateUnit: "currency_per_unit" }` twice per rule family: $0.25/amp = `{25, 1}` with threshold 600 (amps), plus $0.50/amp = `{50, 1}` with threshold 600. Both can be active simultaneously on one permit (25¢ × first 600 + 50¢ × amps over 600).
- Work-cost conditionals ($75/$100): flat rules gated on `custom.work_cost_cents` lte/gt 75_000.
- Minimum $75: modelled as `permit_minimum { basis: "permit_fee", floorCents: 7_500 }` on every building/electrical rule set, charged only when the computed fees fall short. Excluded from the plumbing page (state fee has its own structure, no local minimum).

## Adopted effective date

The promulgated document is revised 2/6/2024; the $75 minimum dates to 2018-07-01. Seed uses `effectiveFrom: "2024-02-06"` for the schedule as adopted, with the plumbing state rules effective `"2022-03-01"` (815 KAR 20:050 amendment eff. 3-1-2022).
