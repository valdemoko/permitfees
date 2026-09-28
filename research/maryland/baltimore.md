# Baltimore, Maryland — research record

**Research pass:** Maryland (first jurisdiction)
**Read on:** 2026-09-26
**Jurisdiction:** City of Baltimore (independent city, fips 24510; Department of
Housing & Community Development, Office of the Building Official, issues all
building and trade permits through the One-Stop Permit Center)
**Pages published:** building, electrical, plumbing

## The instrument

One codified section: **Baltimore City Building Code, Article 27, §109
"Fees"**, maintained by the City's Law Library at
`codes.baltimorecity.gov` (American Legal Publishing codification platform,
the City's own host). The whole fee schedule for building, electrical,
mechanical and plumbing work lives in §109.6 "Fee schedules". Read on
2026-09-26, HTTP 200.

## §109.6.1 — Building permit fees (building page)

The building fee is **volumetric**, not valuation-based — one of only two such
cities in this dataset (Jersey City is the other):

- **New buildings and additions — 1- and 2-family dwellings:** $10 for each
  1,000 cubic feet or fraction of 1,000 cubic feet of gross volume, including
  all basements and cellars. Minimums: **$150** new building, **$75** additions.
- **New buildings and additions — all others:** $20 per 1,000 cubic feet or
  fraction, of *adjusted* gross volume (each story's volume more than 20 feet
  above that story's floor is excluded). Minimums: **$250** new, **$150** additions.
- **Alterations and repairs — 1- and 2-family dwellings:** $0.30 per square
  foot or fraction of affected gross floor area, minimum **$50**. Exception:
  exterior-only work or interior-door-only work is $10 per $1,000 or fraction
  of estimated cost, minimum $50.
- **Alterations and repairs — all others:** $0.35 per square foot or fraction,
  minimum **$150**. Exception: exterior-only, interior-door-only, new-tenant
  demising wall, or new-tenant shell work at $12 per $1,000 or fraction,
  minimum $150.
- **Application fee (§109.5.7), nonrefundable, before processing:**
  $25 (1-2 family, no plan review), $50 (all others, no plan review),
  **$125** (1-2 family, construction documents for plan review), **$150**
  (all others, plan review).
- §109.3: "Unless otherwise specified, the minimum fee or service charge is
  $25. All fees are to be rounded to the nearest dollar."

## §109.6.2 — Electrical permit fees (electrical page)

- **Service wiring and equipment** (by ampere rating, install/replace/relocate,
  including meter connection): 0–100 A **$25**; over 100–200 **$30**;
  over 200–400 **$40**; over 400–800 **$60**; over 800–1,000 **$100**;
  over 1,000–2,000 **$150**; over 2,000 **$200**. Services over 600 volts: add $100.
- **New branch circuits, feeders, extensions or replacements:** **$6 each**
  (with 3-/4-wire single-phase counting conventions printed).
- **Fixtures or devices only:** 1 to 25 fixtures **$25**, plus **$5** for each
  additional 25 or fraction of 25 fixtures or devices.
- Sub feeders for additional meters follow the same amperage table starting at $30.

## §109.6.3(j) — Plumbing and on-site utilities (plumbing page)

- **Install, replace, or reconstruct plumbing fixtures:** **$5 each.**
- Remove fixtures only: $20. Electric water heaters, new or replacement: $20 each.
- Water service pipe, new or replacement: $25 (1-2 family) / $50 (all other).
- Sanitary connection: $25 / $50. Storm water connection: $25 / $50.
- Reconstruct water/sanitary/storm lines on premises: $20 per utility.
- Cap off lines: $50 per utility. On-site utilities new or reconstruction: $50 per utility.
- Private disposal systems: $100 plus $5 per fixture. Lawn irrigation: $25.
- Backflow prevention device: installation **less than 2" $25**; **2" or more $100**;
  annual testing inspection $30.
- Grease interceptors $25 each.

## Resolution of discrepancies

1. **Volumetric vs valuation.** New-construction fees key off cubic feet, so a
   valuation input cannot drive the building rule. The worked example computes
   volume from the inputs it publishes (1,800 sq ft × 9 ft ceilings + 800 sq ft
   unfinished basement = 23,400 cu ft) and states the arithmetic in the notes.
2. **Fraction rounding.** §109.6.1(a) says "or fraction of 1,000 cubic feet,"
   so each partial thousand charges the full rate — modelled with
   `incrementCents`-style rounding up in the per-unit rate (1 cent per 0.1 cu ft
   = $10 per 1,000 cu ft).
3. **Alteration minimums.** The $0.30/$0.35 rows carry their own minimums
   ($50/$150), which are `minimumCents` on the rule record, not the §109.3
   default $25 — because §109.3 only applies "unless otherwise specified" and
   the rows specify.

## Sources

| Key | Source | URL | Primary | Verified |
| --- | --- | --- | --- | --- |
| `baltimore-building-code-109` | Baltimore City Building Code §109 (Law Library codification) | https://codes.baltimorecity.gov/us/md/cities/baltimore/code/building-codes/II/109 | yes | 2026-09-26 |
| `baltimore-permit-center` | DHCD One-Stop Permit Center (applications, ePermits) | https://dhcd.baltimorecity.gov/permits | yes | 2026-09-26 |
