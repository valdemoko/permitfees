# Wilmington, Delaware — research record

**Research pass:** Delaware (first jurisdiction)
**Read on:** 2026-09-26
**Jurisdiction:** City of Wilmington (New Castle County, fips 10003; Department of
Licenses & Inspections, Louis L. Redding City/County Building, 800 N. French Street,
3rd Floor)
**Pages published:** building, electrical, plumbing

## The instrument

One official City page: **"Approved L & I Fee Increases"**, Department of Licenses &
Inspections, wilmingtonde.gov. The live host serves HTTP 403 to scripted requests
(same Akamai-style wall as atlantaga.gov), so the page was read from the Internet
Archive capture of the City's own URL — snapshot **2026-06-09**
(`web.archive.org/web/20260609181416/...`), status 200. The page is dated
**"Effective June 1, 2014"** and presents every fee in two columns,
`CURRENT FEE` / `NEW FEE`; the recorded fees are the NEW FEE column. A
City banner above the table states: "The fees coincide with the approved and
adopted International Code Council Building Codes."

## The fee rows (NEW FEE column)

| Item | Fee |
|---|---|
| **Permit fees** (building/construction) | **$12.00 per $1,000.00** (was $10) |
| **Plumbing** | **$20.00** (was $10) |
| Heating installation | $20.00 |
| Air conditioning system | $20.00 |
| Mechanical ventilation | $20.00 |
| **Electrical work** | **$20.00** (was $10) |
| Fire suppression | $20.00 |
| Alarm system | $20.00 |
| Refrigeration equipment | $20.00 |

Same page, Certificates of Occupancy/Compliance (named in pages, not modelled):
dwellings and two-family houses $75; private accessory buildings $75; all other
buildings $100; temporary CO residential $100, commercial $250; change of
occupancy $100.

## Reading decisions and discrepancies

1. **Trade fees read as flat $20.00.** The L&I table lists Plumbing, Electrical
   work, Heating installation, Air conditioning system, Mechanical ventilation,
   Fire suppression, Alarm system and Refrigeration equipment each as a plain
   dollar amount, while "Permit fees" is the only row expressed as "$X per
   $1,000.00". A third-party guide (PermitFlow, 2026) repeats this reading
   ("A Wilmington plumbing permit costs $20.00"). The page publishes no
   per-valuation trade table.
2. **No minimum fee is printed anywhere on the page.** The table has no minimum
   column and no footnote; no municipal fee schedule PDF was reachable. The
   model therefore charges no minimum on any Wilmington rule.
3. **Valuation basis.** "Permit fees — $12.00 per $1,000.00" is a rate on the
   cost/valuation of the work, matching the third-party guide's reading
   ("$12 per $1,000 of construction"). No seam table exists — a single rate
   applies at every valuation.
4. **The 2014 date.** The schedule is a 2014 *increase* schedule (CURRENT→NEW).
   The City has published no later replacement page that this pass could reach:
   the department's other pages (Construction & Development Review, read from
   the 2026-08-14 Wayback capture of wilmingtonde.gov) link fee amounts only
   through the Step-by-Step Guide document, which is itself not published as an
   addressable HTML page. The 2014 amounts are therefore the last amounts the
   City itself published in an addressable form, and the research record says so
   plainly rather than papering over it.

## Modelling notes

- Building: `per_thousand`, basis valuation, centsPerThousand 1,200
  ($12.00 per $1,000), no minimum.
- Electrical: flat $20.00.
- Plumbing: flat $20.00.
- Plan review (Fire Marshal): "…$5.00 for every $1,000 of construction costs in
  excess of $1,000,000, with a minimum plan review fee of $200 on all plans" —
  published on the Fire Marshal's plan-review page; named on the building page,
  not modelled (it is a fire-protection review charge, not the building permit).

## Source URLs (all official)

- https://www.wilmingtonde.gov/government/city-departments/department-of-licenses-and-inspections/approved-l-i-fee-increases
  (live host; read via Wayback snapshot 2026-06-09)
- https://www.wilmingtonde.gov/business/construction-development (context; read
  via Wayback snapshot 2026-08-14)
- https://www.wilmingtonde.gov/government/public-safety/fire-marshal-s-office/fire-protection-plan-review-application/plan-review-fees
  (plan review, named not modelled)
