# Philadelphia, Pennsylvania — research record

**Status: published** (Pennsylvania, research pass 13). Three permit pages: building, electrical and
plumbing. Verified **2026-09-25**, every figure read from a City of Philadelphia document on that
date.

- **Issuing authority:** the **Department of Licenses and Inspections (L&I)** issues building,
  electrical, plumbing, mechanical, fire-suppression and zoning permits. One department, one
  portal. Philadelphia is a consolidated city–county, so the City is also **Philadelphia County**
  (state FIPS 42, county FIPS 42101) and there is no second authority whose fees would sit beside
  these.
- **Portal:** **eCLIPSE**, `https://eclipse.phila.gov/` — every service page routes applications and
  payment through it ("Log in to your eCLIPSE account and apply for a permit. Upload all required
  documents and pay the filing fee.").
- **Counter:** L&I Permit and License Center, Municipal Services Building (MSB), Public Service
  Concourse, **1401 John F. Kennedy Blvd., Philadelphia, PA 19102**; office hours **8 a.m. to
  3:30 p.m., Monday through Friday**, by appointment. General questions: **311** or **(215)
  686-8686**; inspections are requested through eCLIPSE or **(215) 255-4040**.

## 1. Sources, all read 2026-09-25

| # | Document | URL | Why it matters |
| --- | --- | --- | --- |
| S1 | **Construction Permit Fees, effective January 1, 2025 (PG_012, Rev 2.2026)** — the four-page table L&I publishes | `https://www.phila.gov/media/20260209092722/PG_012_INF_Summary-of-construction-permit-fees-Eff-1.1.2025-Rev-2.2026.pdf` | The schedule in force on the verification date. Building, electrical, plumbing, mechanical, fire suppression and administration, in two columns: *Residential (1 or 2 family)* and *Other Occupancies*. |
| S2 | **L&I regulation "Regulations Governing Fee Increases for Permits and Licenses" (§§ 6-301, 9-102, 4-A-901.15)** | `https://www.phila.gov/media/20240903113807/li-regs-permit-license-fee-increase-schedule-amendment-2024-09-20.pdf` | The operative legal instrument: it states the CPI multiplier (26.5% on the July 1, 2017 base), the effective date (January 1, 2025), that it "replaces and supersedes the fee schedule promulgated on August 8, 2022", and it pairs each fee row with its **Philadelphia Code** citation (A-902.2.1, A-903.2, A-905.3.1…). |
| S3 | **Construction Permit Fees, effective October 1, 2026 (PG_012, Rev 7.2026)** — published 2026-07-29 | `https://www.phila.gov/media/20260729134349/PG_012_INF_Summary-of-construction-permit-fees-Eff-1.1.2025-Rev-7.2026.pdf` | The next revision. Takes effect six days after this verification; **differs from S1 in exactly one administrative row** (see §4). |
| S4 | **L&I regulation of August 8, 2022 (CPI 16.1%, effective January 1, 2023)** | `https://www.phila.gov/media/20220908100105/li-regs-permit-license-fee-schedule-20220908.pdf` | Superseded, read for the chain of authority and to check the arithmetic: every 2025 figure is the 2023 figure × 1.0896 (1.265 ÷ 1.161). |
| S5 | **Get a Building Permit** (service page: Who / Requirements / **Cost**) | `https://www.phila.gov/services/permits-violations-licenses/apply-for-a-permit/building-and-repair-permits/get-a-building-permit/` | Publishes the fee stack the table does not: filing fee, City and State surcharges, development impact tax, record retention, accelerated review, and the eCLIPSE workflow. |
| S6 | **Get an Electrical Permit** | `https://www.phila.gov/services/permits-violations-licenses/apply-for-a-permit/building-and-repair-permits/get-an-electrical-permit/` | The electrical fee in words ("$25 for each $1000 or fraction thereof … minimum $63 … maximum $18,975"), the exemption list of Title 4-A-301.2.3, and the third-party inspection rule. |
| S7 | **Get a Plumbing Permit** | `https://www.phila.gov/services/permits-violations-licenses/apply-for-a-permit/building-and-repair-permits/get-a-plumbing-permit/` | The three plumbing categories as the City states them (new construction and additions / alterations / repairs and replacements), each row with its residential exception. |
| S8 | **Get a Foundation-only Building Permit** | `https://www.phila.gov/services/permits-violations-licenses/apply-for-a-permit/building-and-repair-permits/get-a-foundation-only-building-permit/` | The three foundation tiers stated without the table's column drift: $253 / $442 / $759. |
| S9 | **Fees for L&I permits and licenses** (documents index) | `https://www.phila.gov/documents/fees-for-li-permits-and-licenses/` | Lists every schedule with its release date, which is how the in-force document was told from the one effective 2026-10-01, and carries the separate zoning fee schedule (PZ_008). |

Every PDF was read twice — `pdftotext -layout` and plain `pdftotext` — and the two modes were then
reconciled against each other and against the service pages. That mattered: S1's layout mode
mispairs labels with amounts in the two-column blocks (its "Foundation Only" row appears to sit
beside `$16.40 per 100 sq. ft.`), and S2's three-column table drifts by one row (its citation
column puts `A-902.2.4` on the tenant fit-out line). The pairings below are the ones both readings
and the service pages agree on.

## 2. The mechanism

**One stack, four pieces, on every permit:**

1. **Filing fee**, paid at submission, **nonrefundable and credited toward the final permit
   fee** — building $25 for a one-or-two-family dwelling and $100 for any other occupancy; $100 for
   electrical; $100 for plumbing. Because it is credited and never refunded, the permit fee can
   never end below it, which makes the filing fee a **floor on the permit fee** rather than a
   fifth charge. Modelled exactly that way, as a `permit_minimum` rule measured on `permit_fee`
   and charged as the shortfall (the idiom Manchester already uses).
2. **Permit fee** — S1's table, below.
3. **Surcharge fees** — "City surcharge: $3 per permit" and "State surcharge: $4.50 per permit",
   flat, on every permit, from each service page. The rough-in standard prints the pair together as
   "Surcharges of $7.50 will apply".
4. **Record retention fee** — "$4 per plan" / "per page larger than 8.5 in. by 14 in." Not modelled:
   it is a function of how many sheets get filed, which is an input this calculator does not ask
   for. Named on every page.

**No separate plan review fee is published.** Each service page's Cost block lists filing, permit,
surcharges, record retention and one optional *Accelerated* Plan Review ($2,000 for building and
foundation permits, $1,050 for electrical and plumbing) — and nothing else. Plan review is inside
the permit fee; expedited review is the only line that prices it, and it is optional.

### Building — S1 page 1, restated by S2 with code citations (§4-A-902.2.x)

| Row | Residential (1 or 2 family) | Other Occupancies |
| --- | --- | --- |
| New construction | **$1,328 flat** | **$253** for the first 500 sq. ft., **+$73** for each additional 100 sq. ft. **or fraction** |
| Addition (incl. accessory structures) | **$75** first 500 sq. ft. **+$56** per additional 100 sq. ft. or fraction | **$253 + $73** per additional 100 sq. ft. or fraction |
| Alteration | **$76** first 500 sq. ft. **+$56** per additional 100 sq. ft. over 500 | **$253 + $60** per additional 100 sq. ft. over 500 |
| Alteration, on request | "Alteration fees may be based on **2% of the cost of construction** at request of the applicant (minimum $253)" — a choice the applicant makes, published without a column split | |
| Initial tenant fit-out | N/A | **$16.40** per 100 sq. ft. or fraction, minimum **$189** |
| Manufactured / industrialized housing | $569 per building | $1,138 per building |
| Foundation only | **$253** ≤500 sq. ft.; **$442** 501–2,500; **$759** >2,500 (S8 states the tiers with no occupancy split) | |
| Complete demolition | **$25.30** per 100 sq. ft. or fraction, minimum $253, maximum $50,600 — one row spanning both columns, with "Separate permit by licensed Demolition Contractor required for complete demolition." | |
| Interior (non-load-bearing) demolition | $76 first 4,000 sq. ft. + $5 per additional 100 sq. ft. — one row spanning both columns | |

The **area band is the shape of this state**: a published base plus a rate per 100 square feet *or
fraction of one*, above a 500-square-foot threshold. In engine terms that is exactly one rule —
`thresholdCents: 500`, `incrementCents: 100`, `baseCents`, and a `currency_per_unit` rate in cents
per square foot ($73 → `{ numerator: 73, denominator: 1 }`) — which is the same primitive Las
Cruces's ladders and Madison's increments use, aimed at a schedule that nobody has aimed it at
before.

### Electrical — §4-A-903.2

"The permit fee for electrical work shall be **$25 for each $1,000 or fraction thereof of estimated
electrical construction costs; minimum fee of $63 and maximum fee of $18,975**." One row for every
occupancy (S1 prints it as a single cell spanning both columns). A `per_thousand` rule with
`incrementCents: 100_000` for the "or fraction thereof", `minimumCents: 6_300`,
`maximumCents: 1_897_500` — the first jurisdiction in this dataset that publishes its **maximum**
on the permit fee rather than leaving the top of the ladder open. Rough-in permit $150, optional,
separate application.

### Plumbing — §4-A-905.3.x

Three categories, and the pages print them as three tables:

- **New construction and additions**: **$284 for the first 7 fixtures, $25 each additional** — one
  row for every occupancy — with the published exceptions: **$50 for up to 7 fixtures associated
  with additions to one- and two-family homes, $22.50 each after**; new plumbing systems with no
  structures **$284**; new water distribution and drainage lines as a separate application **$253**.
- **Alterations**: **$189 for the first 7 fixtures, $22.50 each additional**; **$50 / $22.50** for a
  one-or-two-family dwelling.
- **Repairs and replacements**, one row per activity: waste/water lines and stacks **$126 each
  pipe** ($37 flat, 1–2 family); house drain, trap and fresh air inlet **$75** ($31); area, roof and
  storm drains **$75** ($31); water distribution line replacement **$126**; **water heater $37 each**
  ($31 flat); **fixture replacement (no piping) $75 for the first 7 fixtures, $6.30 each additional**
  ($31 flat for 1–2 family). Rough-in permit $150.

Fixture counts are first-class facts here the way Madison's openings were: `fixtures` for the block
rows, `heaters` for the water-heater row, and `custom.plumbing_activity` to say which of the repair
rows the job is.

### Zoning and the rest

Zoning permits are a **separate schedule** (S9's PZ_008 summary) and, in the City's words, "In most
cases, you must get a Zoning Permit before you can apply for a Building Permit" — so a zoning fee
is never inside a building total on this site.

## 3. What is modelled

- **Building (12 rules):** the new-construction pair, the addition pair (residential only; the
  other-occupancy addition shares the new-construction row), the alteration pair, the 2%-of-cost
  alteration option behind `custom.alteration_by_cost`, the foundation tiers behind
  `custom.foundation_only`, complete demolition, the two filing-fee floors, and the City and State
  surcharges.
- **Electrical (5 rules):** the $25-per-$1,000 ladder with its published minimum and maximum, the
  $100 filing floor, the optional $150 rough-in behind `custom.rough_in`, and the two surcharges.
- **Plumbing (12 rules):** new construction, addition (both occupancy sides), alteration (both
  sides), water heater and fixture replacement (both sides) behind `custom.plumbing_activity`, the
  $100 filing floor, and the two surcharges.

Every rule that fires on occupancy reads `custom.single_or_two_family`, the same fact Madison's
schedule turns on — Philadelphia's columns are "Residential (1 or 2 family)" against "Other
Occupancies", which is a building-type question, not an `occupancy` class.

## 4. What is NOT modelled

- **The record retention fee** — "$4 per plan" / "per page larger than 8.5 in. by 14 in." A count of
  sheets this calculator does not collect. Named with its amount on every page.
- **The development impact tax** — the building page publishes it as "Fixed values based on
  construction and use classification for new construction" and "1% of total improvement costs for
  alterations and additions", applying only to residential projects "eligible for a real estate tax
  abatement", with an affordable-housing exemption routed through the Planning Department. Both the
  fixed values and the eligibility test are outside what the page publishes; named, not priced.
- **Accelerated Plan Review** ($2,000 building/foundation, $1,050 electrical/plumbing) — an optional
  service ("Accelerated review fees will not be credited toward your final permit fee").
- **Zoning permit fees** (S9's own schedule) and every other authority's charge: Philadelphia Water
  Department connections and meters, the Streets footway permit issued alongside a plumbing permit,
  Department of Public Health approvals, fire permits.
- **Mechanical and fire suppression** — priced on the same S1 table (mechanical at "2% of value of
  construction, minimum $189"; sprinklers at "$15.10 per sprinkler head, minimum $189"). This
  release's third page is plumbing, so they are transcribed here and named on the pages.
- **The repair rows that need a count this calculator does not ask for**: waste/water lines and
  stacks ($126 each pipe; $37 flat for 1–2 family), house drain/trap/fresh air inlet ($75; $31),
  area/roof/storm drains ($75; $31) and water distribution line replacement ($126). Amounts named,
  never estimated — modelling only their residential halves would be half a schedule.
- **Interior (non-load-bearing) demolition** ($76 first 4,000 sq. ft. + $5 each additional 100),
  which needs the applicant to have chosen the interior row rather than the complete one.
- **The Administrative Services rows** of S1 — amended permits, copies of a permit or certificate,
  certificates of occupancy, preliminary review, permit extensions and reinstatements. S1's layout
  and S2's drifting columns do not agree on which amount belongs to which label, and none of them
  is a construction permit for work; recorded rather than paired by guess.
- **The tenant fit-out row ($16.40 per 100 sq. ft., minimum $189)** — published, transcribed above,
  not priced: this release models new construction, additions and alterations, and a tenant fit-out
  is its own row with its own threshold.
- **Payment surcharges** — credit card +2.10%, debit +$3.45 — which are payment methods rather than
  permit fees.

## 5. Effective dates and access

- **Fees as modelled:** `effectiveFrom = 2025-01-01`. S2 states it: "This new fee schedule shall
  take effect on January 1, 2025. It replaces and supersedes the fee schedule promulgated on
  August 8, 2022, which became law on September 8, 2022, effective January 1, 2023." Both S1 and
  S2 carry the same amounts, row for row.
- **The revision already published for 2026-10-01** (S3). The whole four-page document was diffed
  against S1 on 2026-09-25: the header changes ("Effective January 1, 2025" → "Effective October 1,
  2026"), the footer revision changes (Rev 2.2026 → Rev 7.2026), and **one administrative row
  changes, $75 → $300 for an other-occupancy administrative fee**. Every row this site models —
  every area band, the electrical ladder, every plumbing block, every surcharge — is byte-identical
  between the two documents. The revision is recorded as its own source (S3, `effectiveFrom
  2026-10-01`) rather than as a second rule set, because there is no rate in it to re-price.
- **The CPI chain.** Fees are not set by City Council ordinance per row; L&I promulgates them under
  §§6-301, 9-102 and 4-A-901.15 as "the fee as it existed on July 1, 2017, multiplied by the CPI
  Multiplier". 16.1% produced the 2023 schedule; 26.5% produced the one in force. The chain checks:
  every 2025 figure equals its 2023 figure × 1.0896 — $232 → $253, $67 → $73, $1,219 → $1,328,
  $23 → $25.30 (rounded), $15 → $16.40.
- **Access:** `phila.gov` answers plain clients directly, serving the PDFs from `/media/` with no
  bot challenge; `pdftotext` extracts both S1 and S2 cleanly in both modes. Nothing in this record
  required a route that failed.

## 6. Open questions

- **Which administrative row is the $300 in the October 2026 revision?** The row reads "No Fee
  (owner occupied one-family dwelling)" in the residential column and "$300" in the other, in the
  Administrative Services block, whose labels S1's layout mode and S2's drifting columns pair
  differently. The change is real and is quoted here; the label it hangs on is not resolvable from
  the extraction alone, which is another reason it is a source rather than a rule.
- **Where the $4.50 State surcharge comes from.** Every service page charges it and none of them
  cites the statute; S1 and S2 do not contain it at all (the rough-in standard prints the pair as
  "$7.50"). Charged as published, cited to the page rather than to a law this pass did not read.
- **The plumbing page's row labels under "Alterations".** The table's rows are labelled "All new
  construction and additions" and "Additions to one-or-two-family homes" — the headings of the
  table above it — while sitting under an "Alterations" header, with amounts ($189/22.50 and
  $50/22.50) that S1 and S2 both print on the Alterations row. The amounts are certain; the page's
  labels are a copy-paste error, recorded as a `needs_review` verification against that rule rather
  than smoothed over.
- **Whether a residential foundation-only permit uses the same three tiers.** S1 prints the tiers
  once, in the row block where the other-occupancy column reads them, and S8's service page states
  them with no occupancy split at all — "For foundations 500 sq. ft. or less: $253" — so the tiers
  are charged to every occupancy, which is what the City's own page says.
