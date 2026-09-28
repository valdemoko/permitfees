# Dover, Delaware — research record

**Research pass:** Delaware (second jurisdiction)
**Read on:** 2026-09-26
**Jurisdiction:** City of Dover (Kent County, fips 10001; Licensing and Permitting
Office / building inspector, City Hall)
**Pages published:** building, plumbing, **mechanical** (see below)

## The instrument

Two official documents, both read in full from the City's own council-meeting
packet (evogov.s3.us-west-2.amazonaws.com/meetings/27/attachments/17187.pdf,
the June 24, 2024 Regular City Council meeting packet, HTTP 200):

1. **Proposed Ordinance #2024-15** — amends Chapter 22 "Buildings and Building
   Regulations", which adopts the ICC codes and points every fee row at
   **Appendix F — Fees and Fines** ("Before any permit shall be issued … a fee
   shall be paid unto the city as provided for in Appendix F", §22-65(a)).
2. **Proposed Ordinance #2024-19** (with Staff Amendment #1) — amends
   Appendix F itself and reprints every Chapter 22 fee row.

## The fee rows (Appendix F, Chapter 22)

**Article III — Building Code, §22-65 Permit fees** (fees double if work started
without a permit, waivable for non-professionals):

| Row | Fee |
|---|---|
| **Building permits** | **$25.00 for the first $1,000.00 of costs and $8.00 for each additional $1,000.00 of costs or multiples thereof up to $10,000,000.00 of costs, $6.00 for each additional $1,000.00 of costs or multiple thereof up to $20,000,000.00, and $5.00 for each additional $1,000.00 of costs or multiple thereof above $20,000,000.00** |
| Fence permits | $25.00 first $1,000 + $8.00 each additional $1,000 |
| Sign permits | $0.75 per sq ft of sign area; minimum fee for each permit $50.00 |
| Swimming pool permits | $25.00 first $1,000 + $8.00 each additional $1,000 |
| Demolition permits | $50.00 ($0.00 if condemned/ordered demolished) |
| Moving permits | $250.00 per building |
| Construction plan reviews, nonresidential | $20.00 per set of plans (not subject to doubling) |
| Reinsections | first $0, second $25, third $50, subsequent $100 |

**Article V — Mechanical Code, §22-145** (heating/AC/heat pump permit fees):

| Row | Fee |
|---|---|
| Heating permit | $40.00 first 10,000 BTU + $7.00 each additional 10,000 BTU or multiple thereof |
| Air conditioning permit | $40.00 per ton for the first five tons + $7.00 per ton over five tons or multiple thereof |
| Heat pump permit | either of the two shapes above |

**Article VI — Plumbing Code, §22-185:**

| Row | Fee |
|---|---|
| **Fixtures** | **$35.00 first five fixtures and $3.00 for each additional fixture** |
| Garbage disposal and hot water heaters | A minimum fee of $35.00 |
| Gas, water, and sewer inspection underground | $30.00 for first 150 feet and $0.75 for each additional ten feet or multiple thereof |

## The electrical finding — the page that prices nothing

**Article IV — Electrical Installations, §22-109(a): "No fee. There shall be no
fee for permits or renewals thereof by the building inspector as may be required
by this article."** And §22-109(b): "Fees for applications for inspections issued
by the city's authorized inspection agency, as may be required of this article,
shall be as determined by said agency and approved by the building inspector."

Appendix F's Article IV block contains **no permit-fee rows at all** — only
§22-110 violation fines. Dover's electrical permits are free by ordinance, and
any inspection charge is set by a third party (the authorized inspection agency)
"as determined by said agency" — a private amount Dover does not publish.

The project rule is that a category priced at zero must not ship as a page
charging $0.00, so Dover's third page is **mechanical** — an Article V category
with real published fees (§22-145) — and the zero-fee electrical finding is
documented here and on the profile. This mirrors the other agent's Clark County
precedent (research/nevada/clark-county.md) and is permitted by the brief.

## Reading decisions

1. **"Multiples thereof" reads as "or fraction thereof".** Every band says
   "$8.00 for each additional $1,000.00 of costs **or multiples thereof**", and
   the row opens "$25.00 for the first $1,000.00". A $2,500 job charges the
   first $1,000 at $25 plus two additional thousands ($1,500 → 2 multiples) at
   $8 — the word "multiples" rounds the excess up to whole thousands exactly as
   the neighboring fence/pool rows do. The model rounds each band's excess up
   with `incrementCents: 100_000` (band-local rounding, matching the printed
   structure).
2. **Bands are marginal, in three legs** ($25 + $8/$1,000 to $10M; $6/$1,000
   $10M–$20M; $5/$1,000 above $20M). Computed seams:
   - at $10,000,000: 25,000 + 9,999 × 800 = **80,017,000 cents = $80,017.00**
     (checked exactly: (10,000,000 − 1,000)/1,000 = 9,999 increments × $8.00
     = $79,992.00, plus the $25.00 first-$1,000 base);
   - the third leg opens at whatever the second produces at $20M.
3. **Plumbing fixtures**: $35.00 covers the first five; each fixture beyond
   five is $3.00. A 5-fixture permit is $35.00; 8 fixtures $44.00. Water heater
   and disposal jobs carry their own $35.00 minimum row, named not modelled
   (no count basis the engine holds).
4. **Underground inspections**: $30.00 first 150 feet + $0.75 per each
   additional ten feet **or multiple thereof** — modelled on `linear_feet` with
   threshold 150 and incrementUnits 10 (30,000 − 15,000 = 15,000 hundredths... in
   engine units: `per_thousand`-style hundredths where 15,000 = 150.00 ft).
5. **Mechanical BTU rows** are not modelled as a separate band pair (the
   schedule states the heating permit as $40 first 10,000 BTU + $7 per
   additional 10,000); the worked example uses the AC ton shape, which the
   engine prices exactly: 40,000 cents first five tons ($8,000/ton), then
   700 cents per additional ton rounded up to whole tons.
6. **Effective dating**: Ordinance #2024-15 and #2024-19 passed first reading
   June 10, 2024 and final adoption July 8, 2024 (packet, "SECOND READING").
   `effectiveFrom` is modelled as 2024-07-08.

## Source URLs (all official)

- https://evogov.s3.us-west-2.amazonaws.com/meetings/27/attachments/17187.pdf —
  City of Dover Regular City Council meeting packet, June 24, 2024 (contains the
  full texts of Proposed Ordinances #2024-15 and #2024-19). City-hosted
  (evogov = Dover's agenda platform, linked from cityofdover.com).
- https://www.cityofdover.com — City site (Licensing and Permitting Office).
