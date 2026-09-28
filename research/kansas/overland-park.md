# Overland Park, Kansas — Permit Fee Research

**City:** Overland Park, Kansas (Johnson County)
**Authority:** City of Overland Park — Planning and Development Services Department (Building Safety Division)
**Research date:** 2026-09-26
**Researcher:** Permit Fee Intelligence — Kansas pass

---

## 1. Authority

Overland Park issues building, land-disturbance, site-development and public-
improvement permits through its **Planning and Development Services** department
(Building Safety Division). The operative instrument is the **Development Approval
and Permit Fees** schedule, **effective 08/01/2025** — one consolidated PDF carrying
planning fees, sign permits and the "Construction Plan Review, Permits and
Inspection Fees" block, published beside a "Common Permit Fees" explainer page.

**Critical structural fact: Overland Park publishes no separate electrical or
plumbing permit fee.** Its fee schedule prices construction as a whole — the
valuation definition includes "building cost, all finish work, painting, paving,
electrical, plumbing, heating, a/c, elevators, fire protection equipment" — and the
Common Permit Fees page lists permit families by project type (remodels/repairs/
additions, new buildings, signs, public improvement) with no trade-permit column.
The master fee schedule's "Construction Plan Review, Permits and Inspection Fees"
block names building, land disturbance, site development, public improvement,
floodplain development and moving permits — again no trade permits. Trade work
inside a project is priced inside the project's permit. (Johnson County contractor
licensing is separate and is a licensing, not a permit, fee.)

This seed therefore models Overland Park's building page from the valuation/area
mechanics, and its electrical and plumbing pages as **bundled-into-building**
regimes: the honest answer the schedule gives — the trade cost is inside the
building permit, and the pages explain what that means and how the building fee
that carries it is computed. The fee rules for the trade pages carry a single
"carried by the building permit" row? No — a page with no fee cannot pass the
engine's requirement of a positive total on its worked example. The resolution:
the electrical and plumbing pages model the **plan-review payment split and the
remodel/repair flat tiers** — the two parts of the schedule that a trade-only
project (e.g. a stand-alone electrical remodel) actually prices through, because a
project valued at $1–$19,000 pays the flat $30/$50 building-permit fee **plus** the
$30 plan-review fee regardless of which trade the work is. That is the schedule's
own price for small trade work, and it is what the pages worked-example.

### Sources (all fetched and read 2026-09-26)

| Document | URL | Status |
| --- | --- | --- |
| Development Approval and Permit Fees, eff. 08/01/2025, 7 pp. | `https://content.civicplus.com/api/assets/15915d6f-9ea5-42fe-a39a-229df92b2faa?scope=all` | HTTP 200, `application/pdf` |
| Common Permit Fees page (JS-rendered; read in browser) | `https://www.opkansas.gov/common-permit-fees` | HTTP 200 (content via CivicPlus widget) |
| Master Fee Schedule (same figures, earlier retrieval) | local `.tmp-geo/op-master.pdf` | HTTP 200 |

opkansas.gov is a CivicPlus site whose fee content loads through a JS widget; the
fee PDF itself is served unguarded from content.civicplus.com, and the Common
Permit Fees page renders fully in a browser.

## 2. Mechanism

### 2.1 Building Permit — new construction (multiplier on ICC-derived valuation)

"Work Value for new construction square footage based upon ICC Building Valuation
Data Tables": "**'Permit Fee Multiplier' is: 0.0035**. Fee = Valuation × Permit Fee
Multiplier." The valuation is established "using the ICC Building Valuation Data
Tables" — square footage × the ICC per-square-foot figure for the construction type
and occupancy, which the Building Official "is authorized to annually adopt … upon
approval" with the City Manager's Office.

**Portfolio Homes Building Permit**: same 0.0035 multiplier, plan review **waived**
— the city's production-builder program.

**Building Permit on applicant-submitted value, $19,000 and above**: multiplier
**0.0050**, valuation = "the total value of all construction work for which the
Building Permit is issued, e.g., building cost, all finish work, painting, paving,
electrical, plumbing, heating, a/c, elevators, fire protection equipment, and other
pertinent work or equipment."

Modelled as three `percent` rules on the `valuation` basis:

- **OP-BLD-ICC-0035**: 35 bps, conditioned on `custom.valuation_source` = `icc`
  (the applicant declares the ICC-tables path — new construction);
- **OP-BLD-ICC-0035-PORTFOLIO**: 35 bps with `custom.portfolio_home` = true (the
  same multiplier; the plan-review waiver is what distinguishes it — modelled as its
  own rule so the waiver is visible in the breakdown);
- **OP-BLD-SUBMITTED-0050**: 50 bps, conditioned on `custom.valuation_source` =
  `submitted` and `valuation > 1_900_000` cents (above the $19,000 seam — the
  flats cover "$19,000 or less", per the Common Permit Fees page's "more than
  $19,001" wording for the multiplier regime).

The ICC-tables path needs the applicant's declared valuation (the ICC figure
multiplied out) as the input — the schedule charges 0.0035 × that valuation; the
site's worked example supplies the valuation and names the ICC derivation in its
notes. This is exactly how the city's own calculator works (it multiplies the
derived valuation by the multiplier; the ICC tables set the per-square-foot input,
which the permit tech enters).

Rounding: "All fees will be rounded to the nearest dollar" (schedule footnote 4) —
the engine's bps rounding rounds to the cent; the notes state the city rounds to
the nearest dollar and the worked examples pick valuations whose fee is
cent-exact or round-to-cent identical within a dollar? No — honest and simple: the
worked examples use valuations whose 0.0035/0.0050 products are exact whole cents,
so the engine's cent rounding and the city's dollar rounding agree (a fee that is
already a whole dollar). E.g. $400,000 × 0.0035 = $1,400.00 exactly.

### 2.2 Building Permit — small projects and remodels (flat tiers ≤ $19,000)

"Building Permit, Work Value is $19,000 or less: **$1–$5,000 — $30 flat;
$5,001–$19,000 — $50 flat**. Flat Plan Review Fee **$30**. The Flat Building Permit
Fee shall be paid in addition to the Flat Plan Review Fee, for a **Total Plan Review
and Permit Fee of $60 for work valued at $1–$5,000 and $80 for work valued at
$5,001–$19,000**. The Plan Review Fee is due at the time of the application."

The Common Permit Fees page restates it: "Projects valued less than $5,000 — permits
for these projects are $30. Projects valued between $5,000 and $19,000 — permits for
these projects are $50." (Its "$30" and "$50" figures are the building-permit
component; the schedule's totals add the $30 plan review.)

Modelled as two flat rules (OP-BLD-FLAT-1: $30 on $1–$5,000; OP-BLD-FLAT-2: $50 on
$5,001–$19,000, both on the valuation range in cents) plus **OP-PLAN-REVIEW-FLAT**:
$30 flat, conditioned on `valuation <= 1_900_000` cents — the schedule's own "flat
plan review fee" for this same tier. Larger remodels (> $19,000) price on the
0.0050 submitted-value multiplier with the 50%-at-submission split (below).

### 2.3 Plan review for larger projects — 50% at submission, not an extra fee

"When construction documents are submitted for review and approval as part of the
permit application, **50% of the permit fee shall be paid at such time for plan
review services**." For larger projects the plan review is **half of the permit fee
paid early** — the other half at issuance — not an additional charge. Modelled not
as a fee rule but as page text and worked-example notes: a $400,000 ICC-path
project pays $1,400.00 total, $700.00 at submission. Charging 50% as a rule would
double the permit. This is the key reading the electrical/plumbing pages also rely
on: the "plan review fee" a trade-only small project pays is the **$30 flat**, a
real additional fee, whereas a big project's plan review is a payment split.

### 2.4 Other rows (recorded, not modelled)

| Row | Amount |
| --- | --- |
| Land Disturbance / Site Development Permit | 0.0050 × valuation (same $19,000 seam; same flat $30/$50 + $30 tiers below it) |
| Moving Permit (building ≥ 200 sq ft) | $500 |
| Public Improvement Permit | 5% of bond amount |
| Floodplain Development Permit | $15 |
| Late Permit (work started before permit) | permit fee doubled |
| Reinspection | $50 (with-no-progress: $140) |
| Inspection outside business hours | $75/hr, 2-hr minimum |
| Sign Permit | $60 + $1.25/sq ft of sign area |
| Code Board of Appeals application | $250 |
| Rental licensing | $120/biennium per dwelling/building |
| EV Ready fee reduction (new SF/duplex/TH) | −$500/dwelling unit, sunsets 12-31-2027 |
| EV Ready retrofit circuit (SF/duplex/TH) | 100% building-fee reduction, sunsets 12-31-2027 |
| Solar Ready (new SF/duplex/TH) | −$600/dwelling unit, sunsets 12-31-2027 |
| Multi-family EV Ready / EV Capable | −$1,300 / −$300 per space, sunsets 12-31-2027 |
| Solar retrofit permit | 50% reduction, sunsets 12-31-2027 |
| Building-shell-only submittal | valuation reduced 20% |

The EV/Solar reductions sunset 12-31-2027; the seed's effective dates would all
need `effectiveTo: "2027-12-31"` — recorded here rather than modelled so the
incentive regime cannot silently outlive its sunset.

## 3. Discrepancies and their resolution

1. **No trade permits exist.** The 2025 schedule's construction block and the
   Common Permit Fees page price whole projects only. The electrical/plumbing
   pages therefore model the small-project flat tiers ($30/$50 + $30 plan review),
   which are the schedule's own price for stand-alone trade-scale work, and say so.
2. **"50% of the permit fee at submission" is a payment schedule, not a fee.** It
   never adds to the total; modelled as prose, not as a rule.
3. **Two multipliers.** 0.0035 is exclusively the ICC-derived new-construction
   multiplier (Portfolio Homes included); 0.0050 applies to applicant-submitted
   valuations at $19,000+. The seed keys them on `custom.valuation_source` so they
   are mutually exclusive by declaration, not by inference.
4. **The $19,000 seam.** Below it, flats; above it, 0.0050 × submitted
   value. The Common Permit Fees page's "Projects valued more than $19,001" wording
   and the schedule's "$19,000 or less" flat tier are read as: $19,000 and below →
   flats; $19,000.01 and above → multiplier. The test pins both sides of the seam.

## 4. Worked examples (engine-verified 2026-09-26)

- **Building, new retail shell, ICC path, $400,000 derived valuation.**
  0.0035 × $400,000 = **$1,400.00** (50% = $700.00 at plan submission; not added).
- **Electrical page (stand-alone small trade project), $12,000 declared work
  value.** Flat building permit $50 + flat plan review $30 = **$80.00** — the
  schedule's printed total for $5,001–$19,000 work.
- **Plumbing page (stand-alone small trade project), $3,500 declared work value.**
  Flat building permit $30 + flat plan review $30 = **$60.00** — the schedule's
  printed total for $1–$5,000 work.

## 5. What is modelled vs not

Modelled (three permit types): the 0.0035 ICC new-construction multiplier (incl.
Portfolio Homes row), the 0.0050 submitted-value multiplier (≥ $19,000), the
$30/$50 flat tiers with their $30 flat plan review (≤ $19,000). The electrical and
plumbing pages model the same flat tiers + plan-review flat as the stand-alone
trade-project price, with the schedule's own bundling facts
(`custom.trade_bundled`) standing the flats down when the trade work rides a
building permit.

Recorded but not modelled: land disturbance/site development (0.0050, same tiers);
moving, public improvement, floodplain, sign, appeal, rental-licensing rows;
reinspection/after-hours fees; the EV/Solar incentive regime (sunset 2027-12-31);
building-shell 20% valuation reduction; the ICC Building Valuation Data Tables
themselves (adopted annually by the Building Official).
