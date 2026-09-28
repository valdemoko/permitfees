# Honolulu, Hawaii — research record

**Research pass:** Hawaii (first jurisdiction)
**Read on:** 2026-09-26
**Jurisdiction:** City and County of Honolulu (Honolulu County, fips 15003;
the Department of Planning & Permitting, Permit Center, issues building
permits for Oahu)
**Pages published:** building (the permit is consolidated)

## The instrument

The **Revised Ordinances of Honolulu, Chapter 18** ("Fees and Permits for
Building, Electrical, Plumbing, and Sidewalk Codes"), read on the American
Legal Publishing code host through a real browser session (the host serves
HTTP 403 to scripts):

- **§ 18-6.2 Building permit fees** — "A fee for each building permit ... as
  set forth in Table No. 18-A." Subsection (b) fixes the valuation: "the
  total value of all construction work for which the permit is issued, as
  well as all finish work, painting, roofing, **electrical, plumbing,
  heating, air conditioning**, elevators, fire extinguishing systems, and
  any other permanent work or permanent equipment."
- **Table No. 18-A** (at the end of the chapter; § 18-7.5 page carries the
  table text; amendment list ends Ords. 92-74 ... 19-21, 20-18):

| Total Estimated Valuation of Work | Fee to Be Charged |
| --- | --- |
| $0.01 to $500 | $20 |
| $500.01 to $1,000 | $8 + $2.50 per $100 or fraction thereof of the total valuation |
| $1,000.01 to $20,000 | $12 + $2.20 per $100 or fraction thereof of the total valuation |
| $20,000.01 to $50,000 | $82 + $18 per $1,000 or fraction thereof of the total valuation |
| $50,000.01 to $100,000 | $286 + $14 per $1,000 or fraction thereof of the total valuation |
| $100,000.01 to $500,000 | $700 + $10 per $1,000 or fraction thereof of the total valuation |
| $500,000.01 to $2,000,000 | $3,200 + $5 per $1,000 or fraction thereof of the total valuation |
| $2,000,000.01 and above | $4,300 + $4.50 per $1,000 or fraction thereof of the total valuation |

Other fees on the same table: plan review of revisions $200 or 10% of the
original permit fee (greater); temporary C/O $200; change of contractor $50;
applications for material methods $300; special assignment inspection $1,000.

- **§ 18-6.1 Plan review fees** — "The plan review fee is 20 percent of the
  tentative building permit fee as set forth in Table No. 18-A ... but not
  greater than $25,000." Exceptions: fences, retaining walls, pools,
  driveways and similar city-agency work.

## Reading decisions

1. **The rate reads the TOTAL valuation, not the excess.** Every band's
   phrase is "per $100 / per $1,000 ... of the total estimated valuation of
   work". The excess reading is arithmetically impossible: the $82+$18/k
   band would close at $622 at $50,000 while the next band opens at $286 —
   a fee that *drops* $336 at the seam. The total reading is monotonic at
   every seam ($20 → $23 → $34 ... $982 → $1,000). The bases are floors
   added to the per-unit computation over the whole valuation.
2. **One consolidated permit.** § 18-6.2(b) includes electrical, plumbing,
   heating and air-conditioning work in the single permit's valuation; the
   Chapter 18 fee article publishes no separate electrical or plumbing fee
   tables. There are no trade fees of their own to price — the trades ride
   the building permit. (DPP's fee calculator prices exactly one permit.)
3. **Plan review is modelled** as a 20% component on the permit fee, capped
   at $25,000 (the ordinance's own cap), because § 18-6.1 charges it
   whenever plans are required — which is every project above the trivial
   scope. The fence/pool/driveway exception is documented in prose.

## Seed mapping

- Building: eight gated legs. Band 1 flat $20.00 (valuation ≤ $500). Bands
  2-8: `per_thousand` with `baseCents` = printed base, `thresholdCents: 0`
  (the rate reads the *whole* valuation), `centsPerThousand` = the printed
  per-$100/per-$1,000 rate converted to cents per $1,000, and
  `incrementCents` = the step ($100 bands get 10,000; $1,000 bands get
  100,000) for "or fraction thereof".
- Plan review: `percent` on `permit_fee`, `rateBps: 2_000`,
  `maximumCents: 2_500_000`.
- Electrical/plumbing: no separate permits — documented, not priced.

## Sources actually read

| # | Source | URL | Type | Notes |
| --- | --- | --- | --- | --- |
| 1 | ROH Chapter 18, Article 6 (§§ 18-6.1, 18-6.2) | `https://codelibrary.amlegal.com/codes/honolulu/latest/honolulu/0-0-0-17330` | municipal_code | Read in browser (host 403s scripts); valuation definition §18-6.2(b) |
| 2 | ROH Table No. 18-A | `https://codelibrary.amlegal.com/codes/honolulu/latest/honolulu/0-0-0-17450` | municipal_code | Full eight-band table + other fees, read verbatim |
| 3 | DPP Building Permit Fee Calculator | `https://www.honolulu.gov/dpp/permitting/building-permits-home/bp-fee-calc/` | official_calculator | The City's own estimator ("plans review and permit fees") |
| 4 | DPP Building Permit Requirements | `https://www.honolulu.gov/dpp/permitting/building-permits-home/building-permit-requriements/` | municipal_website | Permit Center contacts (808-768-8220); calculator reference |
