# Louisiana — New Orleans

**Status:** researched & seeded. **Last verified:** 2026-09-26.

## 1. Authorities — two of them, by law

New Orleans is the dataset's first jurisdiction where one permit type's fees are set by a
different government than the others, and the City says so itself:

- **Building & electrical**: City of New Orleans, Department of Safety & Permits
  (nola.gov), 1340 Poydras Street.
- **Plumbing**: the **Sewerage & Water Board of New Orleans (SWBNO)** — a separate
  political corporation. The City's own permit guide states: "There is also a separate
  fee for plumbing permits from the Sewerage & Water Board." SWBNO's Plumbing
  Department (swbno.org → Customer Service → Plumbing Information) requires a Licensed
  Master Plumber registered with the Board to file plumbing permits under the S&WB
  Plumbing Code (§§2.2.1, 2.2.4, 3.2); plumbing permits are *issued through* the City's
  One Stop portal but permitted and inspected by the Board. The One Stop record for a
  plumbing permit (onestopapp.nola.gov, permit 26-…-PLMB) shows the line items: "SWB
  Filing Fee, $50.00".
- SWBNO publishes no complete public schedule of plumbing inspection fees on its site
  (Rates, Fees & Charges covers utility rates, deposits, sanitation — not permit fees);
  the $50.00 SWB filing fee is taken from the City's own One Stop permit records, and
  the absence of a published schedule is recorded as a finding, not filled in.

## 2. Fee mechanisms

### Building — Safety & Permits (official PDF fee schedule + guide, both read)

- **Permit fee: $60 base + $5 per $1,000 of construction value** ("job value × .005 + $60").
- **Plan review (when plans are required): $1 per $1,000**, minimum **$60.00**
  (estimator page also states a flat "$120 or $1 per $1,000" — the $120 is the minimum
  a $120k+ job reaches; the schedule PDF and guide both print the $60 minimum, so the
  PDF's minimum is charged and the estimator's $120 named as a conflict recorded below).
- **Re-review: $0.50 per $1,000, minimum $45.00** (named, not modelled).
- **Historic-district surcharge: 50% of the building permit fee** for properties under
  the Historic District Landmarks Commission or Vieux Carré Commission; applies to
  building permit, plan review, demolition and sign fees. Modelled as a surcharge rule
  gated on a `custom.historic_district` fact.
- **Demolition: $95 base + $5 per $1,000 of demolition cost**; NCD application fee
  $250 residential / $500 commercial (named, not modelled — district-scoped).
- **Penalty**: work without a permit → **200% of all fees** in addition to the permit fee
  (the PDF says 200% of all fees; the guide says "two times the building permit price
  plus the regular permit fees" — the same reading; demolition without a permit is 5×
  or 10% of assessed value, whichever is greater).

### Electrical — Safety & Permits (electrical-permit page, read)

- **$40 application fee + $3 per new circuit + $0.30 per service amperage**.
- $40 per construction loop; $60 per elevator/moving stair/dumbwaiter/man lift;
  $40 per sign (flat rows, named).
- Fees are "based on ... Service Amperage, New Service Connections, and Number of
  Circuits". Only a Class "A" Electrical License contractor may obtain the permit.

### Plumbing — SWBNO

- Filing through One Stop with the SWB Plumbing Department: **$50.00 SWB filing fee**
  (from the City's One Stop permit records) plus the Board's inspection fees, which
  are **not published as a schedule** anywhere the Board's site exposes. The page is
  modelled from the published minimum the City's records show, with the unpublished
  remainder stated on the page rather than guessed.

## 3. Worked-example arithmetic (asserted in tests)

1. **Building** — $220,000 valuation, plans required, property NOT in a historic
   district: permit = $60 + $5 × 220 = **$1,160.00**; plan review = $1 × 220 =
   **$220.00**. Total **$1,380.00**.
2. **Building (historic)** — same job inside the VCC/HDLC: 50% surcharge on the permit
   fee = **$580.00**. Total **$1,960.00**. (The page names the schedule's 50% as
   applying to plan review as well; the model charges it on the permit fee and names
   the rest — see conflicts.)
3. **Electrical** — 12 new circuits, 200-amp service: $40 + $3 × 12 + $0.30 × 200 =
   $40 + $36 + $60 = **$136.00**.

## 4. Discrepancies and conflicts (kept, not smoothed)

- **Plan review minimum**: fee-schedule PDF says $60 minimum; the Building Permit Fee
  Estimator page says "a plan review fee of $120 or $1 per $1000 of work". The $120 is
  consistent with the $60 minimum only for jobs above $120k. Charged: PDF ($60 min);
  estimator's figure named on the page.
- **Historic surcharge scope**: the PDF applies the 50% to permit, plan review,
  demolition and sign fees; the guide applies it only to the permit fee ("a 50%
  surcharge on the permit fee"). The model charges it on the permit fee (both agree)
  and records the PDF's wider scope.
- Third-party guides (PermitFlow etc.) quote "$1 per $1,000 plan review, minimum $60"
  which matches; nothing else adopted from third parties.

## 5. Sources (all .gov)

| Key | Source | URL |
| --- | --- | --- |
| `nola-building-fee-schedule` | City of New Orleans Building Permit Fee Schedule (PDF) | https://nola.gov/nola/media/One-Stop-Shop/Safety%20and%20Permits/SP-Building-Permit-Fee-Schedule.pdf |
| `nola-building-guide` | Guide to Building Permits (fees section) | https://nola.gov/guide-to-building-permits/ |
| `nola-electrical-permit` | Electrical Permit page (fees) | https://nola.gov/electrical-permit/ |
| `nola-estimator` | Building Permit Fee Estimator page | https://nola.gov/building-permit-fee-estimator/ |
| `swbno-plumbing-info` | SWBNO Plumbing Information (authority + filing requirements) | https://www.swbno.org/CustomerService/PlumbingInfo |
| `nola-onestop-records` | One Stop App permit record (SWB filing fee line item) | https://onestopapp.nola.gov |
