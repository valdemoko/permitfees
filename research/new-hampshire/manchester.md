# Manchester, New Hampshire — research record

**Status: published** (New Hampshire, pass 10). Three permit pages: building, electrical and
plumbing.

- **Verification date:** 2026-09-25
- **Issuing authority:** City of Manchester, Planning and Community Development — Building
  Regulations Division, One City Hall Plaza, Manchester NH 03101, (603) 624-6475
- **Enabling law:** New Hampshire adopted the State Building Code under RSA 155-A;
  Manchester enforces it with local amendments in the Building Code of the City of Manchester,
  adopted July 6, 2021. **New Hampshire has no State fee schedule** — permitting and pricing
  are municipal, which is why nothing here comes from a State agency.

| Document | Where |
| --- | --- |
| Building Code of the City of Manchester, Sec. 109 "Fees" (incl. IBC Sec. 109.8 Fee Schedule), adopted 2021-07-06 | `https://www.manchesternh.gov/pcd/Regulations/BuildingCode.pdf` |
| Building Fees — the department's page | `https://www.manchesternh.gov/Departments/Planning-and-Comm-Dev/Building/Fees` |
| Permit Applications — the department's page | `https://www.manchesternh.gov/Departments/Planning-and-Comm-Dev/Building/Permit-Applications` |
| Application for Electrical Permit (effective 09/02/14) | `https://www.manchesternh.gov/pcd/Forms/ElectricalPermit.pdf` |
| Application for Plumbing Permit (effective 09/02/14) | `https://www.manchesternh.gov/pcd/Forms/PlumbingPermit.pdf` |
| Application for Heating Permit (effective 09/02/14) | `https://www.manchesternh.gov/pcd/Forms/HeatingPermit.pdf` |
| Application for Plan Review and Building Permit | `https://www.manchesternh.gov/pcd/Forms/BuildingPermit.pdf` |

All were read on 2026-09-25 and are recorded as `sources` in the seed payload. Note that
`manchesternh.gov` is reachable from this environment **directly** — unlike Lincoln, Omaha or
Nashua, whose details sit behind a code host or behind scans.

## 1. What the mechanism is

**Manchester prices a permit two ways, in one schedule, and the schedule itself is the
Building Code.**

Section 151.10.4 says it outright: "Fees for any and all permits issued under the Building
Code are defined in the Fee Table inserted as an amendment to the International Building Code
at Section 109.8." There is no separate fee-schedule document to find, no fee ordinance to
cross-reference, and no portal fee table: Section 109.8 is the whole of it.

The two mechanisms:

| Mechanism | Rows |
| --- | --- |
| **Rate on the certified estimated cost of the work** | Building: `.006` for a new 1&2 family dwelling, `.010` for all other new buildings and additions, `.010` for alterations/renovations/repairs. Electrical: `.01` residential alterations, `.015` commercial. Plumbing: `.015` for everything but a new residential dwelling. Low voltage above $25,000: `.005`. |
| **Fixed amounts** | $100 per new residential electrical unit and $75 per additional one; $150 and $100 for plumbing; demolition bands; storage tanks; signs; heating equipment; gas piping; ventilation ductwork; elevators and amusement devices. |

Two charges attach to *every* permit, and they are the quiet part of the schedule:

- **$25.00 non-refundable application fee** — "for all permits except yard sale permits".
- **$30.00 minimum permit fee** — "for all permits requiring inspections". Sec. 109.5(A)
  separately sets the re-inspection fee at "a minimum of $30.00".
- (For other administrative permits the minimum is $10.00.)

**They add rather than net.** Manchester's own Electrical and Plumbing applications print the
arithmetic as one line at the foot of the fee column: `$30 MINIMUM FEE + $25 APPLICATION FEE:
$55.00`. That sentence is the single most useful thing in the research: it fixes the
relationship between the two charges for the whole dataset, and the seed reproduces it as a
test. A plumbing permit with $15 of calculated fee is $30.00 of permit fee plus $25.00, not
$30.00 in total.

## 2. What is modelled

- **Building:** both rates (`.006`, `.010`); plan review at `$0.02 per square foot` for
  everything but 1&2 family dwellings and accessory structures; demolition bands ($20 / $75 /
  $150); the application fee; the $30.00 minimum; the re-inspection minimum.
- **Electrical:** $100 + $75/unit new residential; `.01` residential alterations; `.015`
  commercial; the three low-voltage bands ($10 to $2,000, $75 to $25,000, `.005` above);
  application fee, minimum, re-inspection.
- **Plumbing:** $150 + $100/unit new residential; `.015` on calculated cost for everything
  else; application fee, minimum, re-inspection.

## 3. Design decisions worth recording

- **The application fee is a component of type `other`, not `base`.** The engine reads a
  `permit_minimum` against the base subtotal, so putting the $25 inside `base` would have
  netted it against the $30 floor and produced a $30.00 minimum instead of the City's $55.00.
  This is the only structural decision in the Manchester module and it is made for a
  documentary reason rather than a technical one.
- **Plan review excludes demolition.** Item 2 applies to "all buildings and structures covered
  under item 1 above"; demolition is item 4. Modelling it as merely "not a house" charged a
  demolition permit a $0.02-per-square-foot review against a valuation it does not have. The
  condition now names demolition as well.
- **The two `.010` building rows are one rule.** Items 1(B) and 1(C) charge the same rate, so
  two rules would have printed two identical rows in every breakdown.
- **The unit count is the engine's own `units` fact**, not a `custom.*` key, because dwelling
  units are shared vocabulary across the dataset. The first draft of the tests used
  `custom.dwelling_units` and silently charged nothing; the tests now pin the top-level fact.
- **The heating form's two-column table was read twice.** A plain text extraction of
  `HeatingPermit.pdf` renders the rate column shifted by one row. The pairing was established
  from the form's own text order and then checked against Sec. 109.8 item 8, which prints the
  same rows label-first. Both agree, and the code is the source of record.

## 4. What is NOT modelled

- **Heating, gas piping and ventilation** (item 8) — $40 / $50 / $75 / $125 / $15 per unit,
  $75 up to 100,000 BTU commercial plus $0.20 per additional 1,000 BTU (with the notes on
  converting bonnet capacity, horsepower and radiation to BTUs), $30 for a burner replacement
  alone, $15 for other minor alterations, $20 for the first 50 lineal feet of gas piping plus
  $0.05 a foot, $4.00 an outlet, $15 up to 400 CFM of ductwork plus $10 per additional 400
  CFM. **Published and transcribed; Manchester's third page is plumbing, so no mechanical page
  carries them.** They are named in the profile's `notIncluded` rather than left out silently.
- **Item 12**, the whole elevator/escalator/dumbwaiter/conveyor/amusement-device table.
- **Signs, storage tanks, foundation-in-advance permits, yard sales, bazaars.**
- **The 100% surcharge for unpermitted work**, the **$300 appeal fee**, the **$35 retention**
  on a refund (Sec. 109.6), and the **affordable-housing deferral** (Sec. 109.9).
- **The water-tank rows on the 2014 heating form** ($10 / $30 / $60 / $100 by gallonage):
  present in the form, absent from the 2021 code.
- **The electrical form's sign row** ($10 each), likewise absent from the 2021 code — where
  signs are priced on the building side instead.

## 5. Effective dates and access

- **Fees as modelled:** `effectiveFrom = 2021-07-06` — the date the Building Code containing
  Section 109.8 was adopted. Every modelled row is in that schedule.
- **Forms:** the three trade applications print "Effective: 09/02/14" and are recorded with
  their own `documentDate`, but they corroborate the code rather than date it: their rows match
  Section 109.8 line for line.
- **Access:** direct HTTP to `manchesternh.gov` works; the code and the forms are ordinary
  PDFs with text layers. No proxy or code host was needed.

## 6. Open questions

- **How a single application that mixes low-voltage work with commercial work is billed.**
  Item 11(B) excludes "low voltage and control wiring" from the `.015` commercial rate and item
  11(C) prices it separately, but the form carries one estimated cost and an itemised column.
  The site charges both, shows the arithmetic, and says on the electrical page that a filer
  whose form states the low-voltage work separately should confirm the split with the
  department. Resolving it would take a department answer, not a reading of the code.
- **Whether any permit requiring inspections is exempt from the $30.00 minimum.** The schedule
  says "all permits requiring inspections" and does not enumerate them. The site applies it to
  every permit it prices, which is the conservative reading and reproduces the City's own
  printed $55.00 floor on the two forms that state one.
