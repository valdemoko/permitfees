# Toledo, Ohio — research record

**Research pass:** 14 (Ohio)
**Read on:** 2026-09-25
**Jurisdiction:** City of Toledo, Lucas County
**Pages published:** building, electrical, plumbing

## Sources actually read

| # | Source | URL | Type | Effective / dated |
| --- | --- | --- | --- | --- |
| 1 | **Toledo Municipal Code Chapter 1307 — Fees**, sections 1307.01 through 1307.14, Ord. 476-18 | `https://codelibrary.amlegal.com/codes/toledo/latest/toledo_oh/0-0-0-108691` (+ per-section docs `0-0-0-108709`, `108713`, `154015`, `154070`, `154119`, `154184`, `154188`, `154206`, `158699`, `108997`, `109000`, `109003`, `109014`, `158717`) | municipal_code | Ord. 476-18, passed 12-4-18 |
| 2 | **Building Permit application** (fee worksheet + valuation definition), Division of Building Inspection | `https://toledo.oh.gov/` DocumentCenter application PDF (local copy `.tmp-research/oh_toledo_app.pdf`) | permit_portal | read 2026-09-25 |
| 3 | **Commercial Building Alteration** permit page (fee prose + worked example) | `https://toledo.oh.gov/business/how-to-build-in-the-city/permits/commercial-building-alteration` | municipal_website | read 2026-09-25 |
| 4 | Demolition Permit, Certificate of Occupancy, Building Permits, Permits index, Department pages | `https://toledo.oh.gov/business/how-to-build-in-the-city/permits/*` | municipal_website | read 2026-09-25 |
| 5 | Ohio Rev. Code § 3781.10 (state surcharge statute behind 1307.13) | see Cleveland record's access notes | state_agency | **unreachable** |

**Access notes.**
- The codifier 403s curl and our URL reader alike (Cloudflare); every Chapter 1307 section was read in the rendered browser session, and the section list was extracted from the chapter's own table of contents.
- Toledo's website has no electrical or plumbing fee page — the trade fees live only in the code and on the application form. Portal: `https://applyforpermits.toledo.oh.gov/portal`.
- Division of Building Inspection: One Government Center, 640 Jackson St. Suite 1600, Toledo, OH 43604, 8 a.m.–3 p.m. Monday–Friday; department phone **419-245-1220**.

## The mechanism, by page

### Building page — § 1307.02

Valuation/area definitions come from the application form: *"Valuation is the total cost of general contract, or the appraised market value of the project, including material and labor. Exclude cost of mechanical and electrical work for which separate permits are required."* The building fee itself, however, is **area-based, not valuation-based**:

- **(a) Residential 1, 2, or 3 family** — new construction, additions, alterations (interior or exterior) and their accessory structures: base **$60.00 + $0.20 per gross square foot**, "100 sq. ft. minimum per alteration". The 100 sq ft floor is modelled as a rule minimum of `base + 0.20 × 100` = $80.00 (the base is always charged, so the area floor is the only variable part).
- **(a)(2)** Residential **non-structural exterior** alterations (roofs, siding, doors, windows): **$60.00 per alteration** — flat, and mutually exclusive with (a)(1) via `custom.non_structural_exterior`. The application form adds a commercial figure the code does not print: "**($60 Residential $95 Commercial each)**". Both are modelled, the $95 carrying the form as its source; conflict with the code's silence recorded.
- **(b) Commercial and 4-family-or-larger residential** — new, additions, alterations: base **$75.00 + $0.20 per gross sq. ft.**, 100 sq ft minimum.
- **(c) Festivals and/or tents:** first tent $75 + $25 for each additional tent (the additional-tent count has no per-unit kind — first tent modelled flat, the count recorded).
- **(d) Removal and demolition** (see § 1305.09, not read) — priced on **volume**:
  - buildings not exceeding 6,000 cu. ft. — $75.00;
  - 6,000 to 50,000 cu. ft. — $100.00;
  - in excess of 50,000 cu. ft. — $100.00 **plus $3.00/1,000 cu. ft. or fraction thereof**;
  - in-ground tanks: $75 first tank + $25 each additional (same count limitation as tents).
- **(e)** Zoning appeals $200 · **(f)** Signs → § 1383.09 (not read; no sign page in this set) · **(g)** Certificate of Occupancy / Partial CO $75 each · **(h)** Floodplain Development permit $60 residential / $100 other occupancies, Community Acknowledgement form $50 · **(i)** Parking lots (construct/new paving/re-paving/resurfacing, more than five spaces) $75 · **(j)** Manufactured homes $250 per unit · **(k)** Certificate of Zoning Compliance $50.

**Demolition band-3 reading:** the $3.00 rate is applied to the **whole volume**, not the excess over 50,000. The band label ("Buildings in excess of 50,000 cu. ft.") is the trigger; the amount line contains no "above"/"in excess of" base the way § 3105.25 of Cleveland does when a draftsperson means an excess base ("$7.00 for each $1,000.00 … above $1,000,000.00"). Both sides of the seam are asserted in the tests (60,000 cu. ft. → $100 + 60 × $3 = $280), and the alternative reading is recorded here.

### Plan review and ESPP — § 1307.03

- **(a) Ohio Building Code plans:** plan examination **$75.00 base + $0.03 per square foot** (100 sf min). Resubmissions: the fee includes the initial review plus one resubmission; after the first resubmission **$150.00**, and **$300.00** for each additional. Amended construction documents after initial approval $100 each; phased plan approval $100 per phase + $0.03/sf (100 sf min).
- **(b) Residential Code of Ohio plans:** **$50.00 base + $0.03 per square foot** (100 sf min); resubmission after the first $75; amended documents $50.
- § 1307.03(a)(2) cross-references "section 1307.08(a)" for its included reviews, but 1307.08(a) is the refund clause — an internal cross-reference error; the intent (fees under 1307.03 include one initial + one resubmission) is readable from the sentence itself. Recorded.
- **(c) Early Start Phased Permit:** building — **one half of one percent of the building permit valuation, minimum $100**; electrical/plumbing/HVAC/hydronic/refrigeration — $100 each. Expires on permit issuance or 90 days.

The 100 sq ft floors are modelled as rule minimums of `base + 0.03 × 100` = $78.00 (commercial) / $53.00 (residential). Plan review is gated on `custom.plan_review eq true` (Albuquerque's pattern) so demolition/CO examples don't pay it.

### Electrical — § 1307.04

Minimum for any permit: **$75.00** (`permit_minimum`, floor 7500, evaluated after the rows).

1. New residential 1–3 family: **$90.00 per unit** (+ items 7, 9, 11).
2. Existing residential 1–3 family, alteration or addition: **$60.00 per unit** (+ 7, 9, 11).
3. Commercial — new, alterations, replacements, additions: **$100.00 per unit** (+ 4, 7, 8, 9, 10, 11).
4. Commercial/industrial fixtures & circuits, each additional circuit and/or fixture: **$2.00** (a drop-cord pendant counts as one fixture; fixtures as supplied count as one regardless of tubes/lamps).
5. Temporary pole: residential $75; commercial $75 + $0.50 per amp.
6. Release of electrical services: residential $50 per unit; commercial $75 per unit + $0.50 per amp.
7. **Electrical services, including packaged connected solar arrays, photovoltaic modules and wind turbines, in all occupancies: $0.50 per amp** (multi-residential based on total amp capacity per unit) — a `percent` rule with `rateUnit: "currency_per_unit"` on the `amperage` basis; ungated, so entering a service amperage applies it exactly as the schedule's parentheticals do.
8. Motors: ≤5 hp $6; >5–100 hp $6 + $0.50/hp; over 100 hp or fraction $60 + $0.25/hp (group installations by total rated hp). **Not modelled** — the engine has no horsepower basis, and the bands' rate base (total vs excess hp) is not resolvable from the text alone.
9. Generators: $40 minimum or $0.30/kw. **Not modelled** — no kilowatt basis.
10. Mobile/manufactured homes $0.50 per amp (pedestal only, no hookup, same rate).
11. Swimming pool bonding $75.

Registration/renewal fees (contractor $200/$140, journeyman $100/$50, apprentice $25/$25, traveler $100) are licensing, not permit fees — recorded, not modelled.

### Plumbing — § 1307.05

Minimum for any permit: **$75.00** (`permit_minimum`, floor 7500).

1. **Commercial:** new/alterations/replacements/additions — base **$100.00 + $6.00 each fixture**. Backflow and cross-connection control building survey: Category I (high hazard) **$100.00 annual**; Category II (intermediate/low) **$75.00 for two years**.
2. **Residential 1–3 family:** new construction **$90.00 base + $6.00 each additional fixture**; existing **$65.00 base + $6.00 each additional fixture** — "additional" is read as beyond the first, so the per-unit rows carry `thresholdUnits: 1` while the commercial row (its text says "each fixture", not "each additional") does not.
3. The schedule's fixture list: all plumbing fixtures, water heater, water line, water service, sanitary pipe, backflow protection device, interceptors, floor drains, tempering valves, etc.

**Hydronic (§ 1307.05(d)):** commercial new $75 per 30,000 BTU connected load or fraction; replacement under 200,000 BTU same rate; fixture replacement (cooling towers, unit heaters, baseboards, convectors, radiators, fan coils) $75 each; residential $65 per unit (boilers, space heaters). The BTU-denominated rows are **not modelled** (no BTU basis); recorded.

### Other Chapter 1307 sections (context, no rules)

- **1307.01** general — permit fee due on filing.
- **1307.06/07** HVAC and refrigeration/pressure piping — no HVAC page in this set; rows recorded verbatim in the build notes.
- **1307.08** administrative: no refund once the application is accepted and fees paid; cancellation re-issued by another contractor: refund minus **$50** processing; rejected exam applicants: refund minus **$25**.
- **1307.09** illegal/unauthorized work → see Chapter 1319 (**not read** — the investigation/tripling fee lives there; recorded as not modelled).
- **1307.10 Reinspection:** **$100 per hour or fraction** for each additional reinspection caused by incomplete/faulty work, wrong address, missed appointments, or similar.
- **1307.11 Special inspections/services:** **$75 per hour or fraction, minimum two hours** (= $150 floor) on time consumed.
- **1307.12 Pools:** Certificate of Zoning Compliance required for residential pools deeper than 24"; commercial pool **$50 + $0.15/sq. ft. + CZC**; pool bonding cross-references "§ 1307.03(C)(11)" but § 1307.03(c) is the ESPP clause — the bonding fee is § 1307.04(c)(11) ($75). Cross-reference error recorded.
- **1307.14** copying fees $2/sheet — not permit fees.

### State surcharge — § 1307.13

> In addition to the fees stated in this chapter, when a permit is subject to Ohio Building Code or the Residential Code of Ohio requirements, each permit applicant shall also be charged an additional surcharge fee imposed by the State of Ohio.
> (a) Residential (all permits for 1, 2, or 3 family dwellings & accessory structures) plus **1% of total**
> (b) Commercial (all permits other than residential) plus **3% of total**

Two modelled `state_surcharge` rules on `fee_subtotal`, gated `custom.one_two_family` true / `neq true`.

**What "total" means is settled by the city's own worked example** (Commercial Building Alteration page, 5,000 sq ft): plan review $75 + $.03 × 5,000 = **$225**; building permit $75 + $.20 × 5,000 = **$1,075**; state surcharge **$1,300 × .03 = $39**; certificate of occupancy $75; estimated total $1,414. The surcharge base is **plan review + permit** ($1,300), and the **CO sits after it** in the total. The application worksheet orders its lines the same way: Subtotal → State of Ohio Surcharge → Certificate of Occupancy $75 each → Other Fees → Total. The engine's component order (`base`, `plan_review`, … `state_surcharge`, `other`) reproduces this exactly: surcharge reads `fee_subtotal` after base and plan review have run, and the CO (component type `other`) runs after, outside the base.

## The website's swapped prose (verified three ways)

The Commercial Building Alteration page states:

> The Plan Review fee is **$75 + $.20 per sq. ft.** The Commercial Building Permit fee is **$75 + $.03 per sq. ft**.

— labels swapped. Three independent checks: (1) the **worked example in the table immediately below** uses $.03 for plan review ($225) and $.20 for the building permit ($1,075); (2) the **codified schedule** says plan examination is $75 + $0.03/sf (§ 1307.03(a)(1)) and the commercial building fee is $75 + $0.20/sf (§ 1307.02(b)); (3) the **application form** prints "Building Permit: Base fee $75 + 0.20/Sq. Ft" and "Plan Review: Base fee $75 + 0.03/Sq. Ft". The code's figures are modelled; the prose swap is a published-page defect worth citing in the page copy.

Two smaller conflicts, recorded:

- The page's "Amendment fee for plans changed after approval: **$103**" vs the code's **$100** (§ 1307.03(a)(3)) — likely the 3% surcharge folded into the displayed figure. The code's $100 is modelled (the surcharge rule already covers the percentage).
- The page lists "The standard inspection fee is $75. An expedited inspection fee is $150" — neither figure appears anywhere in Chapter 1307 (1307.11's special service is $75/hour, 1307.10's reinspection is $100/hour). Recorded as page-only and **not modelled**: the schedule position of a flat "standard inspection fee" is unresolvable from the sources.

## Effective dates and open questions

- Chapter 1307: Ord. 476-18, passed 12-4-18 — every section carries it.
- Open: Chapter 1319 (investigation of illegal work) unread — the 1307.09 cross-reference target.
- Open: § 1383.09 sign base fees unread (no sign page in this set).
- Open: RC 3781.10(E) unreachable (same access note as Cleveland).
- Open: whether 1307.04(c)'s parentheticals mean add-on items are mandatory alongside a base row (read that way: rows 4/7/9/11 price their own facts and simply don't fire when the fact is absent).

## Verification status

Filled in at build time: see the Ohio row of `research/index.md`.
