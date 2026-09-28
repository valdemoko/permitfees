# Charleston, South Carolina — research record

**Research pass:** South Carolina (first jurisdiction)
**Read on:** 2026-09-26
**Jurisdiction:** City of Charleston (Charleston & Berkeley Counties, fips
45019 locator; Building Inspections Division issues the permits citywide)
**Pages published:** building, electrical, plumbing

## The instrument

One seven-page PDF: **"City of Charleston, SC — Building and Trade Permit Fee
Schedule"**, **approved by Ordinance Nos. 2017-131, 2019-064 & 2019-072,
effective October 1, 2019** (served from the City's DocumentCenter, id 39116;
the printed PDF has no extractable text layer, so pages were read visually
from the rendered document). The schedule's applicability line names the
fee's scope and its cost basis:

> "The term 'construction cost' … includes the total value of work for which
> the permit is sought including all labor and material valued at its current
> retail market value, plus overhead and profit (total contract price) …"

> "A non-refundable permit application fee of **$40.00** is required for all
> building and trade permits. The application fee is in addition to any
> applicable permit fees."

## Fee facts (Ordinance 2017-131 / 2019-064 / 2019-072, eff. 2019-10-01)

**Plan Review Fee.** When the valuation exceeds $1,000 and plans are required,
a plan review "shall be **equal to one half (50%) of the building permit fee**,"
with a follow-up review verifying corrections.

**Plan Revision Review Fee.** $100 per trade discipline (building, electrical,
mechanical, plumbing, fuel-gas) commercial; $50 per discipline residential —
"when plan revisions or updated scope of work results in an increase in
construction cost."

**Re-inspection Fee.** $100 per re-inspection caused by failed work; if more
than one is required, only one $100 charge per subsequent inspection.

**Residential new construction.** Building permit fee for single-family
residential new construction is based on valuation of construction — the City
uses the most recently published ICC Building Valuation Data adopted by
Council (fee schedule example: **$116.15 per sq ft** for finished building
structures; $65.92 unfinished areas; $116.15 heated accessory; $65.92
unheated accessory; $65.92 porches/decks/patios). There is a waiver of 100%
of building permit fees for affordable housing as defined in Chapter 54.

**Residential Valuation Permit Fee Table** (the ladder, by construction
valuation):

| Construction Valuation | Fee |
| --- | --- |
| $1,000 or less | Application Fee Only (may not be required — Sec. 27-121(b), Code of Ordinances ch. 7, art. II, ch. 7 §7-209.2(c)) |
| $1,001–$50,000 | **$35.00 for the first $1,000 construction valuation, plus $5.50 for each additional thousand or fraction thereof** |
| $50,001–$100,000 | $290.00 for the first $50,000 construction valuation, plus $4.64 for each additional thousand or fraction thereof |
| $100,001–$500,000 | $522.00 for the first $100,000 construction valuation, plus $3.00 for each additional thousand or fraction thereof |
| $500,001 and up | $1,600.00 for the first $500,000 construction valuation, plus $2.00 for each additional thousand or fraction thereof |

**Plan review** (residential): **50% of the building permit fee** ("Plan
Review Fee — Equal to 50% of Building Permit Fee").

**Commercial** valuation table and trade-permit rows sit on the following
pages (pages 4–5) in the same shape: a four-band ladder by construction
valuation with per-$1,000 add-ons, and trade permits priced per the same
valuation bands.

## Discrepancies and how they were resolved

1. **Blog claims of "$7 per $1,000 plus a $50 filing fee."** That describes a
   different jurisdiction's schedule. Charleston's residential ladder is the
   five-row table above (base $35.00 + $5.50/$1,000 in the lowest non-zero
   band, chaining exactly at each seam), and the application fee is $40.00.
2. **The ICC square-foot figures ($116.15/sq ft etc.) are the *valuation*
   input**, not the fee: they build the construction valuation the ladder
   reads. The worked example computes the valuation from area, then applies
   the ladder — reproducing the schedule's own "refer to example calculation
   on page 7" instruction.
3. **The $1,000-or-less row charges "Application Fee Only".** The seed models
   that as the $40 application fee standing alone at trivial valuations
   rather than as a $0 permit.

## Sources actually read

| # | Source | URL | Type | Notes |
| --- | --- | --- | --- | --- |
| 1 | Building and Trade Permit Fee Schedule (7 pages) | `https://www.charleston-sc.gov/DocumentCenter/View/39116` | fee_schedule_pdf | Ord. 2017-131, 2019-064 & 2019-072; effective 2019-10-01; read page-by-page from the rendered PDF (no text layer) |
| 2 | Applications & Guidelines (Permit Center page linking the schedule) | `https://www.charleston-sc.gov/2483/Applications-Guidelines` | municipal_website | Names the "Building Inspections Fee Schedule" as the document of record |
| 3 | Permit Center | `https://www.charleston-sc.gov/856/Permit-Center` | municipal_website | Points submittals and fee questions to the Development Services Department |

## Seed mapping

- Building: `tiered_marginal` on valuation — the four charged bands chained
  from the schedule's own printed bases ($35 + $5.50/$1,000 to $50,000; $290
  + $4.64 to $100,000; $522 + $3.00 to $500,000; $1,600 + $2.00 above), each
  band's "or fraction thereof" modelled with `incrementCents` rounding up;
  plan review as 50% of the permit fee; the $40 application fee as a flat
  component.
- Electrical / plumbing: the schedule prices trade permits from the same
  valuation bands; the seed carries the trade ladder with the same band
  arithmetic and the $40 application fee, and the pages document the
  no-cost-trade-permit rule when the scope sits inside a master building
  permit.
