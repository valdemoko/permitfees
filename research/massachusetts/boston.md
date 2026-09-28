# Boston, Massachusetts — research record

**Research pass:** 14 (Massachusetts)
**Read on:** 2026-09-25
**Jurisdiction:** City of Boston (Suffolk County, fips 25025 — the County is a locator;
the Inspectional Services Department issues the permits citywide)
**Pages published:** building, electrical, plumbing

## Sources actually read

| # | Source | URL | Type | Effective / dated |
| --- | --- | --- | --- | --- |
| 1 | ISD, *Building Division Permit Fees* (2 pp.) | `https://www.boston.gov/sites/default/files/file/2021/10/Building%20Division%20Fees.pdf` | fee_schedule_pdf | Foot of both pages: **Rev. 2021**; no effective date printed |
| 2 | ISD, "Short-Form Permit" | `https://www.boston.gov/permitting/permits/short-form-permit` | municipal_website | Read 2026-09-25 |
| 3 | ISD, "Long-Form Permit" | `https://www.boston.gov/permitting/permits/long-form-permit` | municipal_website | Read 2026-09-25 |
| 4 | ISD, "Plumbing Permit" | `https://www.boston.gov/permitting/permits/plumbing-permit` | municipal_website | Read 2026-09-25 |
| 5 | ISD, "Electrical Permit" | `https://www.boston.gov/permitting/permits/electrical-permit` | municipal_website | Read 2026-09-25 |
| 6 | "Welcome to Boston Permitting" (hub) | `https://www.boston.gov/boston-permitting` | municipal_website | Read 2026-09-25 |
| 7 | Inspectional Services Department, department page | `https://www.boston.gov/departments/inspectional-services` | municipal_website | Read 2026-09-25 |

All seven returned HTTP 200 from this environment on 2026-09-25; the PDF returned 200 with
263,477 bytes (`application/pdf`). The four permit pages carry canonical URLs under
`/permitting/permits/`, and each prints its own fee line under a `Fees` heading — those
four lines are the independent check on the PDF (see reading (a)).

## How the fee sheet was read

The PDF is the schedule: two pages titled **BUILDING DIVISION PERMIT FEES**, one column of
application types and one column of fees, with the department's own block at the foot of
each page — *Inspectional Services Department, 1010 Massachusetts Ave. (5th Floor) Boston,
MA 02118, www.boston.gov/ISD, (617) 635-5300, Rev. 2021*.

It was extracted with `pdftotext` twice, because the two columns are laid out as separate
text blocks:

- **`-layout` mispairs them.** It prints the left column to its full depth and then the
  right column, so every fee lands one or more rows above its label — `Plumbing:` picks up
  `$250.00 (see counter #3)`, which is the *Off Hour Inspection* amount, and
  `Use of Premises:` picks up `$20.00 primary fee plus $1.00 per head`, which is
  *Sprinkler*.
- **`-raw` pairs them correctly**, because it emits each row's cells in reading order. The
  `-raw` extraction is the one transcribed below, and every row it pairs is corroborated by
  a live boston.gov page where one exists (Short Form, Long Form, Plumbing, Electrical).

This is the same failure mode recorded for New York (a page break splitting a row) and
Scottsdale (label/amount columns interleaving): the extraction that *looks* best is the one
that mispairs.

## The sheet, as read

**Building Division rows (page 1 and 2):**

| Application | Fee as printed |
| --- | --- |
| Short Form Building (Minor Alteration) | $20.00 primary fee plus $10.00 per $1,000.00 of the estimated cost of work |
| Long Form Building (1-3 family) (Major Alteration) | $50.00 primary fee plus $10.00 per $1,000.00 of the estimated cost of work |
| Amendment | $20.00 primary fee plus $10.00 per $1,000.00 of the estimated cost of work |
| Changes of Occupancy — 3 Family and under / 4 Family and up / Commercial | $20.00 / $50.00 / $50.00 |
| Nominal Fee | $300.00 (Nominal fee) (plus $50.00 application fee, plus $50.00 change of occupancy fee) |
| Microfilming | $3.00 per sheet |
| Board of Appeal — 1-3 Family / 4 family and up or Commercial | $150.00 primary fee / $150.00 for each violation cited |
| Subdivision / Combining Lots of Land | $50.00 primary fee; $100.00 for Subdivisions & Combining lots |
| Trench | $60.00 primary fee |
| Use of Premises | $50.00 primary fee |
| Off Hour Application / Off Hour Inspection | $100.00 per event / $250.00 |
| Sheet Metal | $20.00 primary fee; $25.00 first 200 lin or sq ft; $25.00 for each additional 200 lin or sq ft |
| **DOUBLE FEE** | "When work has been started without a required permit or undervalued in the estimated cost" |

**Electrical rows (all on the same sheet):**

- *When upgrading service or installing new service:* "1) $20.00 Application fee plus $.25
  amp up to 240 Volts 2) $20.00 Application fee plus $.75 amp up to 480 Volts".
- *When there is no change in service:* "$20.00 Application fee plus $1.00 each fixture,
  plug or outlet, $5.00 all meters approved."
- *When none of the above apply:* "$20.00 application fee plus $10.00 per $1,000.00 of the
  estimated cost." (The same sentence adds "*All state buildings*".)
- Electrical Fire Alarm: $20.00 primary fee plus $10.00 per $1,000.00 of the estimated cost.
- Electrical Low Voltage: $20.00 primary fee plus $10.00 per $1,000.00 of the estimated cost.
- Electrical Temporary Service: $25.00 primary fee; $10.00 for each month up to six months,
  then apply again.
- Electrical Yearly Maintenance: $320.00 primary fee.

**Trades and other rows:** Plumbing $20.00 primary fee plus $5.00 each fixture; Sprinkler
$20.00 primary fee plus $1.00 per head; Gasfitting $20.00 primary fee plus $5.00 per
appliance meter approved, $.09 per 1,000 BTU for boilers/heaters/furnaces, $50.00 each
furnace, $15.00 plus $5.00 per 100 lb. of gas stored, $5.00 plus $2.50 per propane/gas
heating device.

**What the four live pages add** (boston.gov, read 2026-09-25):

- Short-Form: "A Short-Form Permit covers **minor alterations that don't change a building's
  structure or use**"; Fees — "$20, plus $10 per $1,000 of estimated cost", stated again as
  "There is a $20 application fee and $10 per every $1,000 of the work estimate."
- Long-Form: "covers **major alterations or renovations that change a building's structure or
  use**"; Fees — "$50, plus $10 per $1,000 of estimated work cost", stated again as "$50
  application fee / Plus $10 for every $1,000 of the estimated cost of work".
- Plumbing: Fees — "$20, plus $5 per fixture"; "There is a $20 application fee plus $5 for
  each fixture, such as toilets and sinks."
- Electrical: Fees — "$20 + usage-based rate", then the three branches: "When upgrading
  service or installing new service: $20 application fee, plus $0.25/amp up to 240 volts, or
  $0.75/amp over 480 volts. When there's no change in service: $20 application fee, plus $1
  for each fixture, plug, or outlet, and $5 for each approved meter. When neither of the
  above applies (including all Massachusetts state buildings): $20 application fee, plus $10
  per $1,000 of the estimated cost."
- All four pages: all fees due upfront; work must start within six months of issue; starting
  early means ISD "may: charge double the permit cost" — the sheet's DOUBLE FEE, in the
  City's own web words. Licensed contractor required for plumbing and electrical; a
  homeowner must hire one.

## Readings this dataset depends on

**(a) The four live pages settle the PDF's column pairing.** Every row the `-raw`
extraction pairs appears on a boston.gov page with the same two numbers (Short Form
$20/$10, Long Form $50/$10, Plumbing $20/$5, Electrical's three branches). Where the PDF and
a live page differ, it is only in the *voltage wording* — see (d). The pages are therefore
cited as sources in their own right and not as mere confirmations.

**(b) The rate prorates: there is no "or fraction thereof" on this sheet.** Boston prints
"$10.00 per $1,000.00 of the estimated cost of work" and nothing else, and the City's own
page repeats it as "$10 per every $1,000 of the work estimate". The engine therefore charges
the exact product — no `incrementCents` — so a $47,500 job pays $475.00 on the Short Form
rather than the $480.00 a rounded-up schedule would charge. Cambridge, 3 miles west, prints
the phrase four times and rounds up; the contrast is asserted in both cities' tests.

**(c) One application pays one building row, selected by `custom.form_type`.** The sheet
lists rows as *types of application*, and the City's Long-Form page confirms the taxonomy
("Amendment: Only for changes to existing Long-Form permit applications"; "Use of Premise:
Only for Use of Premise permit filings"). So `custom.form_type` selects `short_form`,
`long_form`, `amendment`, `change_of_occupancy` or `nominal_fee`, and the Short Form — the
row the City presents as the default route for work that changes nothing structural — is the
catch-all: it is written as `not_in` the other four, which matches an *absent* fact, so a
reader who supplies only a cost still gets a number. Exactly one row can fire; the tests
assert that.

**(d) The service-voltage discrepancy is resolved as the union of both texts, and the union
is stated.** The PDF reads "$.75 amp **up to** 480 Volts" in a numbered two-tier list (tier 1
up to 240, tier 2 up to 480); the live page reads "$0.75/amp **over** 480 volts", which leaves
241–480 V unpriced. Read together they agree on two bands: **240 V or less at $0.25 an ampere,
above 240 V at $0.75 an ampere**, which is what the model charges — `$0.25/amp` gated on
`custom.service_voltage` not exceeding 240 (matching an absent voltage, the common
residential case), `$0.75/amp` above it. Both texts are quoted on the electrical page and
the disagreement is recorded rather than smoothed over.

**(e) "$5.00 all meters approved" is charged once, not per meter.** The sentence prints no
"each" for meters where it prints one for fixtures, plugs and outlets — "$1.00 *each*
fixture, plug or outlet, $5.00 all meters approved" — so the model charges a flat $5.00 when
meters are on the application rather than $5.00 apiece. If ISD means per meter, the row is
undercharged for multi-meter work; that is the open question at the foot of this file.

**(f) The three electrical branches are mutually exclusive, and the fourth and fifth rows
are separate application types.** "When upgrading service…" / "When there is no change in
service" / "When none of the above apply" is the schedule's own branching, so exactly one
can price an application: a service change prices it by amperage, no service change prices
it by the device count (or by cost when no count is given), and Fire Alarm and Low Voltage
are their own rows at $20 + $10 per $1,000 of cost. Temporary Service replaces the $20.00
application fee with its own $25.00. The $10.00-per-month element of Temporary Service is
priced in months — a unit no kind in this engine counts — and is named on the page instead
of charged.

**(g) No plan review percentage, no technology fee and no state surcharge exists in Boston's
text.** The fee sheet prints none; the four permit pages print none; searches for those
phrases across the sheet and the pages come back empty. 780 CMR (the State building code)
sets fees for *state* matters and authorises local fees without prescribing a percentage,
and no Massachusetts instrument read for this pass adds a levy to a Boston permit.
`componentType` across all eighteen Boston rules is therefore `base` — there is no
plan-review, technology or surcharge component to find in this jurisdiction.

## Requirements read (for the requirement rows)

From the four permit pages and the ISD pages: plumbing and electrical permits "are available
to licensed contractors only" and "The permit applicant must be the contractor performing the
work" — a homeowner must hire a licensed contractor. Applications go through the Inspectional
Services Department portal with an account; the required attachments are a short description
of the work (scope, materials, floors and rooms, related permit numbers), the estimated total
project cost entered without special characters, design plans stamped by a Massachusetts
registered engineer or architect, and — where the work does not follow the intended zoning —
a nominal fee letter for the Zoning Board of Appeal. Fire protection plan and narrative where
there is fire protection. Parks & Recreation approval for work within 100 feet of a park or
parkway. Fees are due upfront, online or at 1010 Massachusetts Avenue, 5th Floor. Contact as
printed: 617-635-5300, isd@boston.gov (permit questions: isdpermits@boston.gov), Monday
through Friday, 8 a.m. – 4 p.m.

## Not modelled (named on the page, never papered over)

- **DOUBLE FEE** — the penalty for starting work without a permit or undervaluing the cost:
  a multiplier on a fee that has not been computed, which no rule type here expresses. Named
  on both the building and electrical pages, and the City's web pages repeat it ("may:
  charge double the permit cost").
- **Temporary Service's $10.00 per month** (up to six months) — priced in months, a unit no
  per-unit kind counts; the $25.00 primary fee is charged and the monthly element is named.
- **Off Hour Application ($100 per event), Off Hour Inspection ($250), Board of Appeal
  ($150), Microfilming ($3 per sheet), Use of Premises ($50), Trench ($60), Subdivision
  ($50/$100), Sheet Metal ($20 + $25 per 200 lin or sq ft), Electrical Yearly Maintenance
  ($320)** — read off the sheet, transcribed here, not attached to a page: each is either an
  event fee, a different permit type, or priced by a measurement (linear feet, sheets) no
  input on these three pages collects.
- **Sprinkler ($20 + $1 per head) and Gasfitting ($20 + $5 per appliance meter, $.09 per
  1,000 BTU, $50 per furnace, the stored-gas and propane rows)** — ISD rows for trades these
  three pages do not price; sprinkler and alarm work is largely Fire Prevention's, whose
  forms and fees the hub links separately.
- **Board of Appeal fines and the $150-per-violation row** — adjudicated penalties rather
  than permit fees.
- **Plan review, technology and surcharge lines** — none exist (reading (g)); their absence
  is stated rather than filled with an assumed percentage.

## Effective dates on record

| Instrument | Effective |
| --- | --- |
| Building Division Permit Fees sheet | **Rev. 2021** (the document's own stamp); the file is served from boston.gov's `/file/2021/10/` path, which is what the schedule row records as `effectiveFrom` — the document prints no effective date, and the month it was published to the City's file store is the only date it carries |
| The four permit pages | Undated; read 2026-09-25 and treated as the City's live statement of the same schedule |

## Open questions

1. **The exact effective date of the Rev. 2021 sheet.** "Rev. 2021" is the only date printed;
   the `/2021/10/` path is a publication month, not an enactment. If ISD ever publishes a
   dated replacement, every figure here moves together.
2. **241–480 V.** The PDF's tier 2 says "up to 480", the live page says "over 480". The model
   charges $0.75 above 240 V (the union of both texts); if the City means $0.25 through 480 V,
   a 480-volt service is overcharged by $0.50 an ampere. A call to ISD (617-635-5300) would
   close it.
3. **Meters: each or all.** "$5.00 all meters approved" is charged once (reading (e)); the
   parallel Cambridge row prints "Meter, each $5.00" and is charged per meter. The two
   readings are in different cities' tests so neither can drift silently.
4. **Which row a mixed application takes.** The sheet prices one application type at a time;
   a job that both changes service and installs fire alarm devices is priced by the service
   branch here, because the branches are the sheet's own words. ISD's counter practice would
   settle whether such a job is two applications.
