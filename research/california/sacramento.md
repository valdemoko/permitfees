# Sacramento, California — permit fee research

Status: **modelled, seeded and published.** Three pages
(`/california/sacramento/…`): building, electrical, plumbing.

Last verified: **2026-09-24**. Two sources, one of them a PDF revised
**2025-07-19** and the other the City's live fee listing.

This is the second California jurisdiction, and the reason it was chosen is that it is
the *opposite* of San Diego on both counts. San Diego prices a building permit from
**area** and its trade permits **per unit of work**; Sacramento prices a building
permit from **valuation** — a hundred $1,000 brackets that hand over to three printed
formulas above $100,000 — and prices its trade permits as **flat named scopes**, with
no per-circuit, per-outlet or per-fixture table at all. Two jurisdictions in one state
is the test the standing order asks for: if they had been shaped the same way they
would have tested transcription rather than the engine.

## 0. How these sources were obtained

Sacramento publishes its schedule in two different places, and the split is the first
thing a researcher here has to get right: the **fee sheet** is a PDF attachment on the
City's searchable fee record, and the **add-ons around a permit** are on the searchable
listing itself and appear nowhere in the PDF.

| # | Document | URL | Kind | Effective |
| --- | --- | --- | --- | --- |
| S1 | Building Division Fee Detail — Table A, *Building Permit Fee Schedule (based on Valuation)*, and Table B.1, *Flat Fee Building Permits* | `cityofsacramento.org/Online-Services/FeeChargeSearch.aspx?cu_fee_id=28` (attachment on that record) | fee_schedule_pdf | 2025-07-19 |
| S2 | City of Sacramento *Fees and Charges* searchable fee listing | `cityofsacramento.org/Online-Services/FeeChargeSearch` | municipal_website | none printed per row |

**S1's exact artifact.** The attachment is
`Building-Permit-Fee-Tables-A-and-B.1_2025-0719.pdf`, 1,341,269 bytes, sha256
`e1de2a29ae12011e…`. Table A's header reads "TABLE A — Effective July 20, 2020*" and
its footer "Revised July 19, 2025"; Table B.1 is headed "Effective July 19, 2025", so
the schedule is recorded as effective **2025-07-19**, the later of the two dates it
prints.

**Why three `pdftotext` modes.** The first extraction (`-layout`) rendered Table A's
two columns side by side and **mis-paired them by one row** partway down the page: it
produced a ladder in which the Residential column printed `$577` against the
Commercial `$557` on the `$32,999` row and then stayed ahead of the Commercial column
for the rest of the table. The `-raw` mode reads the document row by row, and every
row it produces reproduces the document's own arithmetic — each $1,000 of valuation
adds a few dollars to the bracket below it, and no bracket is ever lower than the one
beneath it. On that read the two divergent rows are **`$33,999` and `$36,999`**, not
`$32,999` and `$35,999`. The same `-raw` mode was what resolved Table B.1, where
`-layout` had appeared to pair `$175` with the electrical panel row and `$107` with the
re-wire row; the row-by-row read shows `$175` belongs to *Re-Roof*, `$107` to *Safety
Inspection*, and `$105` to the whole *Residential Minor Electrical Work* category.

This is the failure mode the standing method warns about, and it is worth recording
that **the mis-paired reading passed the first eyeball**: the mis-paired ladder still
looked like a fee table. Only checking the arithmetic of adjacent brackets exposed it.

**How the attachment was reached.** The City's fee pages are a JavaScript application
that does not render its content into HTML, so the schedule was not readable from the
page source. The page's own network traffic was read instead, which named the City's
published ArcGIS feature service (`services5.arcgis.com/54falWtcpty3V47Z/…/Fees_And_Charges/FeatureServer/1`)
— the official backing of the City's fee listing — and from it the fee records, their
calculation notes, and their attachments. The attachment endpoint that works is
`…/FeatureServer/1/{OBJECTID}/attachments/{attachmentId}`; `…/attachments/{attachmentId}`
returns the REST directory index instead of the file.

## 1. Authority

| Field | Value |
| --- | --- |
| Jurisdiction | City of Sacramento, Sacramento County, California |
| Type | city |
| Issuing department | Community Development Department, **Building Division** |
| Permit portal | `aca-prod.accela.com/sacramento` (Accela Citizen Access) |
| Website | `cityofsacramento.gov` |

Sacramento issues its own building permit and the trade permits this site prices.
Addresses in unincorporated Sacramento County are a different authority (Sacramento
County), which is **not** modelled here; only the city is.

## 2. Mechanism — what makes this jurisdiction different

**A ladder that hands over to a formula.** Table A prints a bracket for every $1,000
of valuation:

> $999 → $75 … $40,999 → $622 … $99,999 → $1,078

and then, instead of a hundred-and-first bracket, three formulas:

> $1078 + $0.006787 each $1 > $100,000
> $20,761 + $0.005133 each $1 >$3 mil
> $56,692 + $0.004620 each $1 >$10 mil

They are **continuous with the ladder where they meet it**: $1,078 at $100,000 is the
ladder's own last bracket, $20,761 at $3,000,000 is what the first formula reaches
($1,078 + 2,900,000 × $0.006787 = $20,760.30, printed as $20,761), and $56,692 at
$10,000,000 is what the second reaches. That continuity is the test the pages make:
the engine is asked for $100,000 and for $100,001 and must return $1,078.00 and
$1,078.01, and for $2,999,999.99 and $3,000,000 and must return $20,760.30 and
$20,761.00.

The hand-over needed no new primitive. The ladder is a `tiered_table` with its final
bracket left open-ended (so the $100,000 row itself is charged $1,078 rather than
reported as "above the highest published bracket"), and each formula is a `percent`
rule with an exact-fraction rate, a `thresholdCents` and a `baseCents` — the shape
Portland had already given `percent`. The rates are far below the resolution of basis
points (`0.006787` is 67.87 bps), so they are stored as exact fractions, which is the
reason `rate` exists.

**Trade permits as flat named scopes.** Table B.1 prices the electrical and plumbing
rows as a flat amount for a *named list of scopes*, not for an item: $105 for
*Residential Minor Electrical Work*, $105 for *Residential Minor Plumbing Repair or
Replacement Work*, $75 for a water heater, $107 for a safety inspection. The sheet is
explicit that a single permit may authorise one or more of the listed scopes — and
equally explicit that more than one *fixture* moves the job to a flat remodel fee or to
a valuation instead. That limit is quoted verbatim on the page rather than paraphrased.

**Four add-ons, none of them in the fee sheet.** The General Plan Maintenance Fee
($2.60 per $1,000, capped at $38,200), the Construction Excise Tax (0.008 of the
valuation), the City Business Operations Tax ($0.40 per $1,000, capped at $5,000 and
charged only when a licensed contractor holds the permit) and the Residential
Construction Tax ($250/$315/$385 **per unit** by bedroom count) all come from the fee
listing.

## 3. What is modelled

**S1 — building (Table A and Table B.1):**

- The **whole valuation ladder**, Commercial and Residential columns, brackets $999
  through $99,999 — 100 brackets, with the two rows where the columns differ carried
  as printed.
- The **three formulas** above $100,000, each gated to the valuation band it covers.
- Table B.1's **flat scopes**: non-structural bathroom remodel ($320), non-structural
  kitchen remodel ($425), site-built patio cover ($288) and pre-engineered patio cover
  ($250). These *replace* the ladder, which is why the ladder's conditions exclude
  them.

**S2 — the four add-ons**, with their two published ceilings (`maximumCents`) and the
contractor-only condition on the City Business Operations Tax.

**S1 — electrical:** the $105 residential minor electrical scope, the $107 safety
inspection, and the $216 sign electrical fee.

**S1 — plumbing:** the $105 residential minor plumbing scope and the $75 water heater.

## 4. What is deliberately **not** modelled, and named on the pages instead

- **The plan review fee.** The fee sheet prints a Plan Review Fee column beside every
  flat scope ($164 beside the $288 patio cover), and the City's record for it describes
  two ways of computing it: from a separate valuation table, or hourly at the current
  staff rate. The valuation table is a different document that was not read, and an
  hourly fee is not a rate this site can state. Plan review is named on every page.
- **The Technology Surcharge**, for a reason that follows directly from the above: it
  is "10% of the Plan Review Fee (if applicable) and Building Permit Fee (if
  applicable)", so it cannot be stated correctly while the plan review fee is not
  modelled. Guessing it would have produced a plausible total that was wrong by about
  10% of the largest item on the bill.
- **The solar permit.** Photovoltaic and solar water heater systems route to the City's
  separate streamlined permit, whose fee the sheet states as a reference to its own
  detail rather than as an amount.
- **Mechanical work** — the City's separate $175 HVAC cut-in or change-out permit, and
  the fact that no page of this site prices a mechanical permit in any jurisdiction.
- **Re-roof and wrecking permits** ($175 each) and the sign permit fee itself, which is
  priced "based on the valuation of the sign" against its own tables.
- **Every hourly, penalty and cost-recovery charge**: the $216 staff hourly rate,
  expedited plan review at 50%, renewals, extensions, re-inspections, master plan
  review, and the work-without-permit penalty (3× the permit fee under $250, $500 over).
- **Every other agency's charge** collected with the permit: the utilities' water,
  sewer, drainage and meter fees, Sacramento Regional County Sanitation District, school
  impact fees, SAFCA flood control, the transportation authority's fee, the fire
  department's plan review and inspection fees, and the City's own impact fees, park and
  housing charges.

## 5. Open questions

1. **The fee listing has no per-row effective date.** S2 prints no date for the General
   Plan Maintenance Fee, the excise tax, the business operations tax or the Residential
   Construction Tax. The fee schedule row is recorded as effective 2025-07-19 because
   that is the date of the fee sheet it is read alongside, and the source row says so
   explicitly. A dated ordinance or council resolution for each row would settle it.
2. **The Construction Excise Tax's 2002 ICBO Valuation.** The listing states
   ".008 x of the 2002 ICBO Valuation". The City's own ICBO tables were not read, so
   the site charges 0.008 of the valuation a reader supplies and says so on the page
   rather than implying it reproduces those tables. Whether the City's figure would
   differ from a reader's declared valuation for a given building is unresolved.
3. **Whether Table B's plan review schedule is current.** The City's live fee record
   for plan review attaches a document headed "Effective 7/01/2016" while the fee sheet
   beside it is revised 2025-07-19. That inconsistency is one of the reasons plan review
   is not modelled: publishing a 2016 schedule as if it were the current one would be
   the kind of wrong number this project refuses to publish.
4. **The two divergent columns.** Whether the Residential column's `$577` at `$33,999`
   and `$586` at `$36,999` are City-side typos or intentional is not knowable from the
   document. Both are carried as printed, and the page names the divergence.
5. **San Diego and Sacramento share a state but not a schedule.** Whether a third
   California city prices from valuation, area or something else is not predictable from
   either, which is the argument for reading each city from scratch rather than
   extrapolating the first one.
