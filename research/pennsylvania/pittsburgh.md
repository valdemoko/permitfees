# Pittsburgh, Pennsylvania — research record

**Status: published** (Pennsylvania, research pass 14 — the state's second jurisdiction). Three
permit pages: building, electrical and mechanical. Verified **2026-09-25**, every figure read from
a City of Pittsburgh document on that date.

- **Issuing authority:** the **Department of Permits, Licenses, and Inspections (PLI)** issues
  building (the "Building & Development Application"), demolition, land operations, signs,
  electrical, mechanical, fire alarm, suppression, occupancy-only and occupant-load placard
  permits. **Plumbing is not PLI's**: "all plumbing not associated with sprinkler systems in the
  City of Pittsburgh is regulated by Allegheny County Health Department, not the City" — which is
  why this jurisdiction's third page is mechanical rather than plumbing (the same fact Seattle
  records for a different county body).
- **Counter / contact:** 412 Boulevard of The Allies; PLI's phone, printed in the footer of every
  schedule page, is **412-255-2175**; application-technology questions go to
  PLIAppTech@pittsburghpa.gov. Payments run through the **OneStopPGH** portal or the OneStopPGH
  counter (card, check, money order, cashier's check — no cash, no mail).
- **Application:** since June 2024, OneStopPGH's **Building and Development Application (BDA)**
  "combined the Building Permit with Zoning approval into one application."

## 1. Sources, all read 2026-09-25

| # | Document | URL | Why it matters |
| --- | --- | --- | --- |
| S1 | **2026 Fee Schedule, PLI, effective 1/1/2026** | `https://www.pittsburghpa.gov/files/assets/city/v/1/pli/documents/fees/2026-fee-schedule-final-2.pdf` | The schedule in force. Four pages: permit fees for all construction permit types, additional fees and discounts, accelerated review and boards, licenses and registrations. |
| S2 | **2025 Fee Schedule, PLI, effective 1/1/2025** | `https://www.pittsburghpa.gov/files/assets/city/v/1/pli/documents/fees/pli-fee-schedule-1-1-2025.pdf` | The predecessor, diffed line for line against S1: the residential rows did not move at all, and the commercial/sign/stormwater ceiling went **$80,000 → $95,000** (with accelerated-review ceilings and two overtime-inspection rows). Read so the change is recorded rather than assumed. |
| S3 | **PLI Fees page** (last updated 09/02/2026) | `https://www.pittsburghpa.gov/Business-Development/Permits-Licenses-and-Inspections/Fees` | Links the current schedule and states the mechanism in one sentence: "The cost of a permit will now be calculated based on the total construction value of the project… if the construction value changes between the time of application and permit issuance, the total cost of your permit may also change." Also carries the SETF statute note and the zoning note. |
| S4 | **PLI Permitting Fee Calculator** (HTML app, dated 1-3-2025) | `https://www.pittsburghpa.gov/files/assets/city/v/2/pli/documents/fees/pli-permitting-fee-calculator_1-3-2025.html` | The City's own arithmetic, as executable code: the rate variables (`.006` / `.007`), the min–max clamps, the technology-fee brackets keyed on the **adjusted base fee**, the TPA discount scope, the 40% application fee, the SETF exclusion, the flat reconnect fees and the bundled zoning estimate. This is what settles the two readings the schedule leaves open (see §2.1). |
| S5 | **Fee Calculator page** (last updated 04/24/2025) | `https://www.pittsburghpa.gov/Business-Development/Permits-Licenses-and-Inspections/Fees/Fee-Calculator` | Index of the calculators and the sentence that matters for trust: "PLI will verify the final cost of your application based on our most current fee schedule both when you apply for your permit and again when your permit is issued." |
| S6 | **Permitting page** (last updated 09/14/2026) | `https://www.pittsburghpa.gov/Business-Development/Permits-Licenses-and-Inspections/Permitting` | Permit types, the **structure-type definitions** the fee split turns on, the three work types, and the plumbing hand-off to Allegheny County. |
| S7 | **Electrical Permit page** | `https://www.pittsburghpa.gov/Business-Development/Permits-Licenses-and-Inspections/Permitting/Electrical-Permit` | When an electrical permit is required, the work scopes, and the City's own one-sentence rule for picking the fee column: "Work on single and two-family homes and structures accessory to them requires a Residential permit, while all other work requires a Commercial permit." |
| S8 | **Mechanical Permit page** | `https://www.pittsburghpa.gov/Business-Development/Permits-Licenses-and-Inspections/Permitting/Mechanical-Permit` | The same residential/commercial sentence for mechanical and fuel-gas work, plus its work scopes. |
| S9 | **Third Party Agencies and Special Inspections** | `https://www.pittsburghpa.gov/Business-Development/Permits-Licenses-and-Inspections/Permitting/Third-Party-Agencies-and-Special-Inspections` | Which permits **require** TPA service — "TPA Inspection of commercial electrical permits", stormwater after 5/25/22, residential electrical before 1/1/21 — and "A TPA discount per PLI's Current Fee Schedule is applicable to permits that require TPA services." Without this page the schedule's "on applicable permit types" is unresolvable. |
| S10 | **Work Not Requiring a Permit** | `https://www.pittsburghpa.gov/Business-Development/Permits-Licenses-and-Inspections/Permitting/Work-Not-Requiring-a-Permit` | The exemption list (what needs no BDA, what needs zoning review only), the June 2024 BDA consolidation, and the Allegheny County plumbing sentence quoted above. |

Both schedules were read in `pdftotext -layout` **and** plain `pdftotext` and then diffed against
each other; the four calculator passages quoted below were read out of the app's own
`tw-passagedata` source, not inferred from its output.

## 2. The mechanism

**One formula, three add-ons, one payment split.**

### 2.1 The base fee — every construction permit type, two columns

The schedule's whole first block, verbatim in both extraction modes:

| Row | Rate | Minimum | Maximum (2026) |
| --- | --- | --- | --- |
| Base Permit Fee (Residential) | **$6.00 per $1,000 of Construction Value** | $130 | $8,000 |
| Base Permit Fee (Commercial) | **$7.00 per $1,000 of Construction Value** | $605 | $95,000 |
| Base Permit Fee (Sign) | $7.00 per $1,000 | $350 | $95,000 |
| Base Permit Fee (Stormwater) | $7.00 per $1,000 | $605 | $95,000 |

"ALL CONSTRUCTION PERMIT TYPES" heads the block: building, electrical and mechanical permits are
the same formula. Two readings the schedule alone does not settle, and the calculator settles both:

1. **No "or fraction thereof" appears, and the calculator prorates.** Its code is
   `base_fee_calc = con_value_validated * permit_fee_rate_residential` with
   `permit_fee_rate_residential = .006` — a straight multiplication, no rounding to whole
   thousands. $25,100 of construction value is **$150.60**, not the $156 a per-thousand round-up
   would produce. Modelled with `per_thousand` and **no** `incrementCents`, which is exactly what
   that optional field means in this engine (see Las Cruces for the opposite schedule, which prints
   the phrase and rounds up).
2. **The clamp is on the multiplied figure**, then (for commercial electrical) the discount
   applies to the clamped figure: `if base < minimum → adj = minimum; elif base > maximum → adj =
   maximum`. The calculator proves it by labelling the output "PLI Minimum Fee Applies" / "PLI
   Maximum Fee Applies" on the adjusted base.

**Which column** is the reader's own declaration, and the City defines it twice. The Permitting
page: *Residential – single-family* = detached single-family dwellings and townhouses 3 stories or
less under the IRC (plus accessories); *Residential – two-family* = detached two-family dwellings
3 stories or less under the IRC; *Commercial – all other uses* = everything IBC-regulated,
including attached and mixed-use and anything over 3 stories. The trade pages compress it to one
sentence: "Work on single and two-family homes and structures accessory to them requires a
Residential permit, while all other work requires a Commercial permit." The calculator's dropdown
offers exactly two values, `Residential` and `Commercial`. Modelled as
`custom.structure_type`, and — following the column default this site uses everywhere — **absent
the flag the commercial row applies**, which is the larger figure.

Nothing else touches the base fee. Not the work type, not the occupancy class, not the scope
questions: in the calculator the work type feeds only the zoning flag.

### 2.2 The three add-ons

- **Technology Fee**, from the schedule's own table, "assessed based on range of Base Permit Fee":
  **$2.00** for a base fee of $0–$200, **$5.00** for $201–$1,000, **$15.00** for $1,001–$10,000,
  **$25.00** for $10,001+. The calculator keys the bracket on `adj_base_fee_calc` — the clamped
  base fee — so it is a `tiered_table` on the `permit_fee` basis, four brackets, cents all the way
  up ($10,001+ is the open bracket).
- **State Education & Training Fund (SETF), $4.50 per permit.** The schedule prints the amount;
  the Fees page prints the authority: "Effective October 25, 2017, the fees collected for the
  Pennsylvania code official training fund (SEFT [sic] fees) have increased from $4.00 to $4.50.
  Governor Wolf signed Act 37 of 2017 authorizing the increase of fees collected by municipalities
  administering and enforcing construction or building permits in accordance with the Pennsylvania
  Construction Code Act." Modelled as `state_surcharge`.
- **Digital Record Retention Fee, $5.00 per permit.** Modelled as `other`. (The calculator also
  defines a `$document_retention_fee = 3` variable that its total never reads — a dormant value,
  noted rather than charged.)

### 2.3 The payment split, and the discount

"**40% of Base Fee (Non-Refundable) Due at Application; Remainder of Base Fee Due at
Issuance**" — printed four times, once per base row. It is a timing and risk fact, not an extra
charge: the filer pays 40% of the base fee at application and loses it if the application is
abandoned; the total the permit costs does not change. The calculator's application-fee figure is
`(adj_base_fee_calc - tpa_discount) * .4` (plus the accelerated-review fee when elected). **Named
on every page, never added to a total**, the same treatment Las Cruces gives its 25% plan-check
payment schedule.

The **Third Party Agency Discount** — "15% of Base Fee on applicable permit types" — is the one
place a published fee reduces a total, and S9 resolves "applicable": PLI *requires* TPA inspection
of commercial electrical permits (and stormwater, and pre-2021 residential electrical), and "A TPA
discount per PLI's Current Fee Schedule is applicable to permits that require TPA services." The
calculator applies it to commercial electrical minus reconnect, unconditionally:
`tpa_discount = adj_base_fee_calc * .15`, subtracted in the total. The engine has no negative
component, so the discount is folded into the commercial electrical **base rate**: $7.00 × 0.85 =
**$5.95 per $1,000**, minimum $605 × 0.85 = **$514.25**, maximum $95,000 × 0.85 = **$80,750** —
algebraically identical to clamp-then-discount for every input, because scaling and clamping
commute for positive scales. One known consequence is recorded as `needs_review` (§6).

### 2.4 What the City's own total contains and this site's does not

The calculator's total is
`adjusted base + technology + SETF + digital retention + zoning estimate − TPA discount +
accelerated review + fire maintenance`. This site's totals are base + technology + SETF + digital
retention (with the TPA discount inside the commercial electrical base). The four named-but-not-
modelled pieces:

- **Zoning fees.** The BDA bundles the zoning *approval* into the application; the zoning *fee*
  comes from City Planning's Zoning Fee Schedule, and the Fees page says so: "Zoning Fees may
  apply. Please consult the Zoning Fee Schedule." The calculator estimates it internally (0.1% of
  value residential, 0.3% commercial, minimums $50/$100, $40,000 cap, and a $250 complex-project
  path) — quoted in the research record, deliberately **not** quoted as a rate on the pages,
  because the zoning schedule itself was not read (§6).
- **Accelerated Plan Review** — 1.5% of value (Building Development Application, minimum $2,500,
  maximum $95,000), 1.0% for other commercial permits (min $1,500, cap $95,000) and 1.0%
  residential (min $500, cap $9,200) — and currently unavailable for everything except fire alarm
  and fire suppression: "Due to current capacity, expedited review is only offered for Fire Alarm
  and Fire Suppression permit types" (S3).
- **The complex-project path.** The calculator's flag: a Building & Development permit of 50,000+
  sq ft, or 100+ new dwelling units, or more than $20,000,000 of construction value — "Your
  application requires a mandatory pre-application meeting. You will be charged only for this
  meeting at application. All other fees and requirements will be assessed following the
  pre-application meeting." The fee shown for that meeting is $250 in the calculator (it appears
  nowhere on the schedule — §6), and the SETF waiver the calculator carries for this path is moot
  because every other fee is deferred. **Named on the pages; such a total is stated as not final.**
- **Everything not a construction permit**: certificates of occupancy and occupant-load placards,
  floodplain review, overtime inspections, board and meeting fees, trade and business licenses,
  rental registrations, permit amendments (same rates on the *change* in value) and the $50
  license-holder change, the $100 fire-alarm/suppression maintenance fee, the optional
  pre-application plan review meeting (0.25% of project value, minimum $125, maximum $7,000), and
  payment processing fees.

### 2.5 Electrical and mechanical specifics

- **Electrical**: the same two-column formula (S7's residential/commercial sentence), no separate
  electrical schedule anywhere. The calculator carries two flat rows the schedule does not print —
  service reconnect **$75 residential / $150 commercial** (the "Service Reconnect In-Kind" work
  scope) — named but not modelled (§6). Commercial electrical carries the required-TPA discount
  (§2.3).
- **Mechanical**: the same two-column formula (S8's sentence), no mechanical-specific fee anywhere
  on the schedule. Commercial new-construction mechanical "requires the submission of stamped
  drawings".
- **Plumbing**: not priced here at all — Allegheny County Health Department's Plumbing Division
  issues those permits (S6, S10).

## 3. What is modelled

- **Building (5 rules):** the residential base row ($6/$1,000, $130–$8,000), the commercial base
  row ($7/$1,000, $605–$95,000), the technology fee's four brackets on the base fee, the $4.50
  SETF, the $5.00 digital record retention.
- **Electrical (5 rules):** the residential base row, the commercial base row **after** the
  required TPA discount ($5.95/$1,000, $514.25–$80,750), the technology fee, SETF, retention.
- **Mechanical (5 rules):** identical in shape to building — the two base rows without any
  discount (TPA does not apply to mechanical), the technology fee, SETF, retention.

Every rule reads `custom.structure_type` (or nothing); no rule reads a work type or an occupancy
class, because the schedule's fee does not depend on one.

## 4. What is NOT modelled

- **The 40% application split** — timing, not cost (§2.3). Named on every page.
- **Zoning fees** — City Planning's separate schedule, bundled into the BDA for approval only
  (§2.4). Named, with the calculator's internal estimate recorded here rather than published as a
  rate.
- **Accelerated Plan Review** and its current capacity limits; the **pre-application plan review
  meeting** (0.25%, $125–$7,000); the **complex-project mandatory meeting** ($250 in the
  calculator) and the fee deferral it triggers (§2.4).
- **The reconnect flat rows** ($75 / $150), which live only in the calculator, not on the schedule
  (§6).
- **The other permit rows on the same schedule**: sign ($350 minimum), stormwater, demolition, land
  operations, occupancy-only, fire alarm and suppression (plus the $100 maintenance fee), and the
  administrative row cluster — certificates of occupancy, placards, floodplain, overtime, boards,
  licenses, registrations, amendments.
- **Plumbing**, issued by Allegheny County (S6, S10), and **every other authority's charge**,
  including the Allegheny County asbestos permit that may be needed before demolition.
- **Payment processing fees** (credit card and eCheck surcharges).

## 5. Effective dates and access

- **Fees as modelled:** `effectiveFrom = 2026-01-01` — the schedule's own header ("2026 FEE
  SCHEDULE / EFFECTIVE 1/1/2026"), which is the document the PLI Fees page links as current.
- **The 2025 predecessor** (effective 1/1/2025) was diffed against it on 2026-09-25: residential
  rates, residential minimum and maximum, all base rates, minimums, the technology table, SETF,
  retention, the 40% split and the discounts are **unchanged**; the commercial/sign/stormwater
  maximum went $80,000 → $95,000, accelerated-review caps moved ($80,000 → $95,000; residential
  $8,000 → $9,200), commercial overtime inspections $785 → $699 and residential $175 → $150, and
  some business-license rows shifted. Modelled at the 2026 figures.
- **The calculator predates the 2026 schedule** (dated 1-3-2025) and still carries the $80,000
  commercial maximum. Where the two disagree on a figure, the schedule wins and the calculator is
  cited only for *arithmetic*, not for amounts.
- **Access:** `pittsburghpa.gov` answers plain clients directly — both PDFs, both service pages and
  the calculator HTML downloaded without a bot challenge, and `pdftotext` extracted both schedules
  cleanly in both modes. Nothing in this record required a route that failed.

## 6. Open questions

- **How the technology fee's bracket interacts with the TPA discount.** The schedule says the
  bracket is a "range of Base Permit Fee"; the calculator reads it off the base fee *before* the
  discount. This site's commercial electrical base already includes the discount (§2.3), so the
  bracket is read off the discounted figure — the same answer as the calculator everywhere except
  a pre-discount base fee in ($200, $235.29], ($1,000, $1,176.47] or ($10,000, $11,764.71], where
  the City's calculator charges one band higher (a difference of $3 to $10). Recorded as
  `needs_review` against the electrical technology rule rather than hidden.
- **The reconnect flat rows** ($75 residential / $150 commercial) appear only in the calculator.
  They are named on the electrical page with their source and not modelled; a schedule line or a
  bulletin would settle them.
- **The complex-project meeting fee ($250)** is likewise calculator-only: the schedule's
  pre-application meeting row is 0.25% of project value ($125–$7,000), which is a different thing.
  The deferral itself is unambiguous; only the meeting's price is unresolved.
- **The zoning rates are not published here.** The calculator embeds 0.1%/0.3% of value with
  $50/$100 minimums and a $40,000 cap, but City Planning's Zoning Fee Schedule was not read on
  2026-09-25, so the pages say "consult the Zoning Fee Schedule" instead of quoting a rate.
- **Construction value is defined nowhere the City publishes.** S3 says the fee is based on "the
  total construction value of the project", S5 promises "Fee definitions, how to calculate your
  value of construction", and the Fees page contains neither — only the download link. What is
  certain is when it is checked: S5, "PLI will verify the final cost of your application based on
  our most current fee schedule both when you apply for your permit and again when your permit is
  issued", which S3 echoes ("if the construction value changes between the time of application and
  permit issuance, the total cost of your permit may also change").
- **Cross-jurisdiction note, not a resolution.** Philadelphia's pages charge a "$4.50 State
  surcharge" that no Philadelphia document ties to a statute; Pittsburgh's Fees page ties its
  $4.50 to Act 37 of 2017's code-official training fund for municipalities administering
  construction permits. The amounts and the description match, which suggests they are the same
  fund — but no Philadelphia document read on 2026-09-25 says so, so Philadelphia's open question
  stays open exactly as recorded in `research/pennsylvania/philadelphia.md`.
