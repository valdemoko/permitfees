# Arkansas — Little Rock

**Status:** researched & seeded. **Last verified:** 2026-09-26.

## 1. Authority

- Issuer: City of Little Rock, Planning & Development Department — Building Codes Division.
- Code: Little Rock City Code, Chapter 8 (Buildings and Building Regulations), Art. III
  (Building Code), Sec. 8-31 "Building permits and permit fees".
- Primary text used: full text of the City of Little Rock Building Code as published by the
  City and archived via archive.org (`gov.ar.littlerock.buiding`), which carries the fee
  schedules of Sec. 8-31 verbatim. The City's own WebLink document server
  (`web.littlerock.state.ar.us`) requires cookie sign-in and refused scripted fetches.
- Online permit portal: eTrakit (`littlerockar.gov`), referenced for process only.

## 2. Fee mechanism (Sec. 8-31(c))

### I. Building Permit Fees — Table A (valuation ladder)

| Total valuation | Fee |
| --- | --- |
| $500 and less | No fee, unless inspection required ($20.00 per inspection) |
| $501–$50,000 | $30.00 for the first $500 up to $2,000, plus $3.50 per additional $1,000 or fraction thereof |
| $50,001–$100,000 | $198.00 for the first $50,000, plus $2.40 per additional $1,000 or fraction thereof |
| $100,001–$500,000 | $318.00 for the first $100,000, plus $2.10 per additional $1,000 or fraction thereof |
| $500,001 and up | $1,158.00 for the first $500,000, plus $1.60 per additional $1,000 or fraction thereof |

Reading notes (all from the printed text):

- The $501–$50,000 band's opening sentence is "…$30.00 for the first $500 up to $2,000",
  i.e. the $30.00 covers the range up to $2,000, then $3.50 per additional $1,000 or
  fraction thereof to $50,000. Modelled as `per_thousand` with
  `thresholdCents: 200_000`, `incrementCents: 100_000` (round up).
- Every band prints "or fraction thereof" → `incrementCents` rounds UP.
- Minimum permit fee $30.00 (Sec. 8-31(c)(I)(B)).
- Valuation documentation: contract or affidavit required; absent documentation the ICC
  building valuation data chart determines valuation.
- Commercial plan-checking fee: 1/2 (50%) of the building permit fee when valuation
  exceeds $500 and plans are required; minimum $50.00 for new construction, repair,
  remodels and miscellaneous permits requiring plan review. Charged in addition.
- Data processing fee (all trades): $3 / $4 / $6 / $8 by valuation band. Flat.
- 75% fee reduction in the Central High, Downtown and Philander Smith Targeted
  Neighborhood Enhancement Areas (residential building, electrical, plumbing and
  mechanical), floored at the minimum — recorded, not modelled (area-based discount).
- Penalty: unpermitted work triples the fee.

### II. Electrical Permit Fees

- New one- and two-family dwelling: $0.08/sq ft under roof.
- Load centers (regardless of voltage): up to 60A $8.00; up to 100A $16.00; up to 150A
  $24.00; up to 200A $33.00; over 200A $5.00 per 100 amps over 200.
- Openings (ladder): 1–20 $10; 21–60 $25; 61–100 $30; 101–200 $50; 201–300 $65; 301–400
  $80; each 25 over 400 $5.
- Minimum permit: $30.00 (Sec. 8-31(c)(II)(G)).

### III. Plumbing Permit Fees

- New one- and two-family dwellings: $0.08/sq ft under roof.
- Unit costs (repair/alteration/addition, and all other occupancies): each plumbing
  fixture outlet or appliance $5.00; water service $25.00; water heater $15.00; gas
  housepiping $25.00; etc.
- Minimum fee: $30.00. Out-of-city work: +50% surcharge.

## 3. Worked-example arithmetic (asserted in tests)

1. **Building** — $220,000 valuation → $318.00 for the first $100,000 + $2.10 × 120
   (whole thousands, fraction rounds up) = $318.00 + $252.00 = **$570.00** permit;
   plan review (commercial, >$500 valuation, plans required) = 50% = **$285.00**;
   data processing $6.00. Total **$861.00**.
2. **Electrical** — new 1-/2-family dwelling, 2,000 sq ft under roof: 2,000 × $0.08 =
   $160.00, above the $30 minimum → **$160.00**.
3. **Plumbing** — alteration, 6 fixture outlets × $5.00 = $30.00 + water heater $15.00
   = $45.00, above the $30 minimum → **$45.00**.

## 4. Discrepancies and open questions

- The archived building code text is the 2002/2003-era code as published (Arkansas Fire
  Prevention Code 2002 cited in the fee section). Third-party permit guides describe the
  same schedule still being charged (e.g. "$1,158 for a $500,000 project" — Arkansas
  Times, 2014; PermitFlow 2026 lists minimum $50 + $25 data processing, a *conflict* we
  do not adopt because no city document states it). Charged: the code's own table.
- Ord. No. 2005-153 (2005-11-06) is the last ordinance establishing "permit fee
  schedules for building …" found on the City's document server; it could not be
  fetched (cookie-gated). The schedule modelled is the one the published code prints.
- Third-party guides (PermitFlow) cite an "Act 474 surcharge" of $0.50 per $1,000 on
  commercial permits (state education fee, A.C.A. 6-64-101 et seq. as amended by Act
  474 of 1999). Little Rock's code does not print it. Recorded as `needs_review` in
  spirit: not modelled, named in FAQ prose only.

## 5. Sources (all .gov / official)

| Key | Source | URL |
| --- | --- | --- |
| `littlerock-building-code-fees` | Little Rock City Code Ch. 8 Art. III Sec. 8-31 (published building code text) | https://web.littlerock.state.ar.us/WebLink/DocView.aspx?id=40904 (mirrored full text: https://archive.org/details/gov.ar.littlerock.buiding) |
| `littlerock-planning-development` | Planning & Development Department — Building Codes Division | https://www.littlerock.gov/city-government/city-departments/planning-and-development/ |
| `littlerock-etrakit` | eTrakit online permit portal | https://www.littlerock.gov/resident/city-services/online-services/ |

The archived full text was fetched and read directly; the Sec. 8-31 fee schedules were
transcribed from that text. The `littlerock-building-code-fees` source's `url` field
stores the City's own WebLink record for the same document (primary route), with the
archive mirror named in notes.
