# Richmond, Virginia — research record

**Research pass:** Virginia (second jurisdiction)
**Read on:** 2026-09-26
**Jurisdiction:** City of Richmond (independent city; Department of Planning &
Development Review, Bureau of Permits and Inspections — 900 East Broad Street,
Room 108)
**Pages published:** building, electrical, plumbing

## The instrument

One two-page PDF: **"City of Richmond Fee Schedule"**, Department of Planning &
Development Review, Bureau of Permits and Inspections, **effective 07/01/2024**
(revision 07-01-2024), linked from the City's permit pages
(`https://www.rva.gov/sites/default/files/2024-08/PermitsFeeSchedule.pdf`,
read with `pdftotext -layout`). The schedule's own NOTE is the state layer:

> "NOTE: For all permits, a **2.0% state surcharge** is added to the final
> calculated fee. Value of work equals the higher of either the Contractor
> estimate or RS Means price."

And the opening paragraph scopes the permit types:

> "A building, mechanical, sign, **electrical**, security, **plumbing**,
> gas-piping, tank, fire alarm, sprinkler, hood/fire suppression,
> civil/storm water, demolition, or elevator permit to erect, construct,
> reconstruct, enlarge, extend, repair, structurally alter or move a building
> or structure shall be calculated as follows:"

## Fee facts (effective 2024-07-01)

| Item | Amount |
| --- | --- |
| Residential (1 & 2 family) building permit, $0–$2,000 | **$63.00** |
| Residential, over $2,000 | **$63.00 + $6.07 per $1,000 or fraction thereof** |
| Commercial building permit, $0–$2,000 | **$131.00** |
| Commercial, over $2,000 | **$131.00 + $8.50 per $1,000 or fraction thereof** |
| Demolition | Residential $184.00 / Commercial $368.00 (+$.01/sq ft above 10,000 sq ft, max $1,000) |
| Re-inspection / failure to appear | Residential $32.00 / Commercial $63.00 |
| After-hours inspection | $110.00/hour |
| Certificate of Occupancy | $263.00 |
| Permit extensions | $25.00 |
| Withdrawn/rejected minimum admin fee | 5% of initial fee, min $25 |
| Withdrawn/rejected plan review minimum | 10% of initial fee, min $25 |
| Revised plan fee after issuance | 10% of initial fee, min $30 |
| **State surcharge** | **2.0% of the final calculated fee** |

The City's permit page confirms the trade split: "a building permit only
covers the building and structural portion of a project… Any electrical,
mechanical, and plumbing work for a project will be done under a **separate
trade permit**."

## Trade permits

The 2024 fee schedule prices trade permits through the same two formulas —
the schedule's opening sentence lists the electrical and plumbing permits
among those "calculated as follows". Richmond therefore prices electrical and
plumbing work on the value of work (the higher of the contractor estimate or
RS Means) at the **residential** formula ($63 + $6.07/$1,000 or fraction) or
the **commercial** formula ($131 + $8.50/$1,000 or fraction) depending on the
project's occupancy class, with the 2% state surcharge added. This is the
same one-ladder-for-all-permits structure the schedule states on its face,
and it is how the City auditor's review describes the trade fees ("Permit
fees for various trade types were properly calculated" against "City of
Richmond Fee Schedule").

## Rounding reading

Both formulas print "**or fraction thereof**", so the value of work rounds
**up** to the whole $1,000 above the $2,000 threshold. A $12,300 residential
job pays $63 + $6.07 × 11 = $129.77 + the 2% levy. The $0–$2,000 band pays
the flat $63.00 / $131.00.

## Sources actually read

| # | Source | URL | Type | Notes |
| --- | --- | --- | --- | --- |
| 1 | City of Richmond Fee Schedule (effective 07/01/2024) | `https://www.rva.gov/sites/default/files/2024-08/PermitsFeeSchedule.pdf` | fee_schedule_pdf | 2 pages; linked from the residential plan-review requirements PDF |
| 2 | Permits and Inspections (department page) | `https://www.rva.gov/planning-development-review/permits-and-inspections` | municipal_website | Confirms the trade-permit split and links the fee schedule |
| 3 | Residential Building Plan Review Requirements | `https://www.rva.gov/sites/default/files/2025-02/Building%20Plan%20Requirements%20Residential%202021%20VRC%20_Updated.pdf` | municipal_website (PDF) | Names the fee schedule URL; states fees are based on provided construction costs and square footage |

## Seed mapping

- Building: `per_thousand` on valuation at **607 cents per $1,000** with
  `incrementCents: 100_000` (round up) and `baseCents: 6300` +
  `thresholdCents: 200_000` under occupancy `residential`; a commercial twin
  at **850 cents per $1,000** with `baseCents: 13100`; the 2% state
  surcharge as a `percent` rule on `fee_subtotal`; conditions keyed on
  `occupancy`.
- Electrical / plumbing: the same two valuation formulas by occupancy class
  (Richmond prices trades from the value of work on the same ladder), with
  the 2% surcharge. Worked examples pin the round-up reading.
