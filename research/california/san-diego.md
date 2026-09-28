# San Diego, California — permit fee research

Status: **modelled, being seeded and published.** Three pages planned
(`/california/san-diego/…`): building, electrical, plumbing.

Last verified: **2026-09-24**. Two bulletins, each with its own effective date.

This is the first California jurisdiction, and the first in this dataset whose
**building permit is priced as plan check plus inspection** — a base rate that
covers a stated number of square feet plus a per-square-foot increment above it —
rather than on a valuation band. The mechanism is new to the engine, which is the
reason the state was chosen: it tests a shape nothing else here has.

## 0. How these sources were obtained

Both bulletins are published by the City of San Diego Development Services
Department (DSD) as **Information Bulletins**, which are web pages that also carry
a PDF of the same text.

| # | Document | URL | Kind | Effective |
| --- | --- | --- | --- | --- |
| S1 | Information Bulletin 501, *Fee Schedule for Construction Permits-Structures* | `sandiego.gov/development-services/forms-publications/information-bulletins/501` | municipal_website | August 2026 (previous version last effective 2026-08-06) |
| S2 | Information Bulletin 103, *Fee Schedule for Mechanical, Electrical, Plumbing/Gas Permits* | `sandiego.gov/development-services/forms-publications/information-bulletins/103` | municipal_website | May 2026 (previous version last effective 2026-05-03) |
| S3 | Information Bulletin 101, *Building Valuation Schedule* | `sandiego.gov/sites/default/files/dsdib101.pdf` | municipal_website | referenced by S1 for valuation determination |

**Why the HTML page is the source and not the PDF.** The IB-501 PDF
(`/sites/default/files/2026-08/dsdib501.pdf`, 3,717,650 bytes, sha256 beginning
`356a4dbda0bbe683`) has **no text layer** — `pdftotext` returns nothing, because it
is a rendered image. The City publishes the same schedule as text on the bulletin
page, and that text is what was read. S1 is therefore recorded as a
`municipal_website` source rather than a `fee_schedule_pdf`, and the page notes it.
IB-103's PDF path returned an HTML error document, so its bulletin page is likewise
the source.

## 1. Authority

| Field | Value |
| --- | --- |
| Jurisdiction | City of San Diego, San Diego County, California |
| Type | city |
| Issuing department | Development Services Department (DSD) |
| Permit portal | `aca-prod.accela.com/SANDIEGO` (Accela) and `opendsd.sandiego.gov` |
| Website | `sandiego.gov` |

San Diego issues its own building, electrical, mechanical and plumbing permits.
Addresses in the unincorporated county are a different authority (San Diego
County), which is **not** modelled here; only the city is.

## 2. Mechanism — what makes this jurisdiction different

A San Diego building permit is **plan check plus inspection**, and each is printed
as a base rate that covers a stated number of square feet plus an increment per
square foot above that base:

> Table 501A — Res-SDU/DUP … Base Sq. Ft. 3,000 … Plan Check Base Rate $8,085.26,
> Increment Rate $4.10 … Inspection Base Rate $8,401.90, Increment Rate $4.21

So a 2,500 sq ft house pays the base rates alone ($8,085.26 + $8,401.90), and a
5,000 sq ft house pays them plus 2,000 sq ft at $4.10 and $4.21. The plan check and
the inspection are **two separate charges**, and the state's own fees ride on the
valuation.

This is exactly the shape the `percent` primitive already had for Portland
(`rate` + `thresholdCents` + `baseCents`), read against `square_footage` with
`rateUnit: "currency_per_unit"`. No new primitive was needed.

## 3. What is modelled

**S1 — building (Table 501A, plus the flat and state fees):**

- Plan check and inspection for the principal project types: New Commercial, High
  Rise, New MDU, Residential MDU & Non-Residential Addition, Res-SDU/DUP,
  Res-SDU/DUP Add/Remodel, Tenant Improvement/Remodel, Attached Townhomes,
  Standalone Parking Garage, Warehouse/Self-Storage.
- The **State/Seismic Fee** — "13 cents per $1,000 estimated valuation on all
  permits for construction of single or multifamily structures one or two stories
  high", rising to "28 cents per $1,000 … for multifamily construction three
  stories or higher and for permits on nonresidential construction".
- The **Building Standards Fee** — "$4 per one hundred thousand dollars
  ($100,000) in valuation, with appropriate fractions thereof, but not less than
  one dollar ($1.00)", the fractions themselves being "$1.00 per every twenty-five
  thousand ($25,000)".
- Flat add-ons collected at issuance: **Mapping Fee $12.16**, **Lead Hazard
  Prevention Fee $58.00**, **Fee Collection — Other Agencies $17.11**, and the
  **General Plan Maintenance Fee $737.00** at submittal.

**S2 — electrical (Table 2):** the new-MDU service charge, the panel
replace/upgrade, and the several per-item rows (conduit and j-box only, generator
only, temporary construction pole, specialised occupancy).

**S2 — plumbing (Tables 3A and 3B):** new and remodel MDU by dwelling unit,
non-residential restrooms and kitchens by five-fixture group, and the per-item rows
— water heater, water softener, backflow preventer, gas system/meter, sewage
ejector, water/waste pipe repair.

## 4. What is deliberately **not** modelled, and named on the pages instead

- **The circuit bands.** Table 2 prices 15–45 A circuits as "First 5 Circuits
  $176.57 … 6-10 Circuits $52.39 … each additional 10 circuits over 10, up to 50
  $52.39 … each additional 50 circuits over 50 $141.28". The bands are not a
  clean per-circuit ladder and the base covers a group, so the site names the row
  rather than guessing a per-circuit rate.
- **Several named Table 501A rows** not needed for a residential or ordinary
  commercial example: Master Plan-Est-MDU, Manufactured/FBH SDU, Factory Built
  Housing MDU, Repetitive Structure rows, Partial Permits (Table 501B).
- **Table 501C miscellaneous items** — antennas, awnings, carports, decks, fences,
  pools, retaining walls, signs, skylights and the rest. Each is a real line on the
  schedule; none is priced here.
- **The mechanical permit.** IB-103 Tables 1A and 1B price it per building use and
  per item; no page of this site prices a mechanical permit in any jurisdiction.
- **Enhanced and hourly services** — Development Project Manager ($176.84/hr),
  Express Plan Check ($793.95 + 1.5×), address fee ($529.71), traffic study
  ($2,473.03), storm water inspection ($1,466.11), and the state school fees
  (IB-146).
- **Every other agency's charge** collected with the permit: water and sewer
  capacity and installation fees, Development Impact Fees, the school district's
  fees, and the County Water Authority's meter capacity fee.

## 5. Open questions

1. **Exact effective days.** The bulletin headers read "August 2026" and "May
   2026"; the "Previous Versions" lists end on 2026-08-06 and 2026-05-03
   respectively, so the current versions are recorded as effective 2026-08-07 and
   2026-05-04. A re-read against a dated PDF (were a text-bearing one published)
   would settle it.
2. **The state fee's story test.** The State/Seismic fee's two rates (13¢ and 28¢)
   turn on building height and occupancy; the site reads them from `occupancy` and
   a `custom.stories`-style fact, and only the reading is modelled, not a
   height survey.
3. **The circuit bands** above are the single largest group left unmodelled in an
   otherwise-complete electrical schedule.
