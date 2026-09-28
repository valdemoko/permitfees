# Mississippi — Jackson

**Status:** researched & seeded (honest no-schedule publication). **Last verified:** 2026-09-26.

## 1. Authority

- Issuer: City of Jackson, Department of Planning and Development, Office of Code
  Services — Building Permit Division. Website: `www.jacksonms.gov`. Permit portal:
  OpenGov (`jacksonms.portal.opengov.com/categories/1071`, "Building Permitting").
- Location: Warren Hood Building, 200 S. President Street, 3rd floor, Jackson, MS
  39201. Phones: 601-960-1160 (division), 601-960-1167 (permits).
- Governing code provision: **Code of Ordinances, Ch. 26 (Buildings and Building
  Regulations), Sec. 26-2 "Permit, fee"** — "The permit fee for work requiring a
  permit shall be established by the adopted schedule of fees. The adopted schedule
  of fees shall govern." (Ord. No. 2019-30(9), eff. 2019-03-05; Municode node
  `…_S26-2PEFE`, Ch. 26 nodeId `COOR_CH26BUBURE`.)
- Adopted codes context (Sec. 26-1 / Ch. 26): International Building, Residential,
  Mechanical, Fuel Gas, Plumbing and existing-building codes with local amendments.

## 2. Fee mechanisms

**None published.** This is a deliberate, documented absence, not a gap:

1. The City's own website pages (`/government/city-departments/planning-and-development/office-of-code-services/building-permits/`,
   `/residents/residential-building-and-permits/`) describe *how* to apply but
   publish **no fee amounts** — no schedule page, no PDF, no calculator.
2. The OpenGov portal category lists Residential Building, Commercial Building,
   Demolition/Moving, Electrical, Fence, Gas, Mechanical, Plumbing, POD and related
   application types, but the **"Apply Online" action for each routes to the
   Viewpoint Cloud sign-in** (checked live 2026-09-26 on the Plumbing Permit
   record type: the application form itself is behind the login wall), so no fee
   amount is visible before authentication.
3. Third-party guides ("Install Planner" style sites) circulate figures such as
   "$85 base + $8 per $1,000" for Jackson MS. **Not adopted** — no .gov or official
   source corroborates them, and the division itself refers fee questions to a
   phone call (PermitFlow's summary of the process quotes the same instruction).
4. Municode's Ch. 26 defers entirely to "the adopted schedule of fees" without
   reproducing it, and no appendix reproduces it.

### What is published instead (and seeded)

- The **governing section text** (Sec. 26-2) — that an adopted schedule exists and
  governs — is a primary source and is cited on every page.
- The **OpenGov portal** is the primary application channel and is cited for the
  permit catalogue (the trade permit descriptions quoted on the pages come from it).
- Each of the three pages states plainly that the City publishes no complete public
  fee schedule, that amounts are set at review and quoted on the issued permit, and
  that the division (601-960-1160) quotes fees before payment ("You will be notified
  when … you will receive notification to pay your permit fee" — portal process text).

### Seed modelling

- `feeRules: []` for all three permit types (building, electrical, plumbing) —
  zero invented rows. The permit_minimum rule type is NOT used: no floor is published.
- `feeSchedules` carries one row with `status: "draft"` and `notes` recording that
  no public document has been identified.
- Pages are published with a **no-schedule statement**: the editorial gate accepts
  zero fee rules when the page says so (`hasNoScheduleStatement`). Page intro and
  FAQs state the absence and describe what drives the final amount (valuation,
  plan review, trade counts) without pricing it.
- `WorkedExample: null` on all three pages (the worked-example contract requires a
  computed total > 0; there is nothing to compute).
- Verification ledger: source rows `verified`; fee_schedule row `needs_review`
  (method `official_portal_check`) recording the OpenGov login-wall finding; each
  page row `verified` for the editorial/no-schedule statement.

## 3. Sources

| Key | What | URL | Date |
| --- | --- | --- | --- |
| `jackson-code-26-2` | Code of Ordinances Ch. 26, Sec. 26-2 (adopted-schedule clause) | library.municode.com/ms/jackson/codes/code_of_ordinances?nodeId=…_S26-2PEFE | Ord. 2019-30(9), 2019-03-05 |
| `jackson-building-permits-page` | Office of Code Services — Building Permits (process, contacts) | jacksonms.gov/government/city-departments/planning-and-development/office-of-code-services/building-permits/ | read 2026-09-26 |
| `jackson-opengov-portal` | Building Permitting category (permit catalogue, payment process) | jacksonms.portal.opengov.com/categories/1071 | read 2026-09-26 |
| `jackson-residential-page` | Residential Building and Permits page | jacksonms.gov/residents/residential-building-and-permits/ | read 2026-09-26 |

All primary (`.gov` / official portal), `isPrimary: true`, `lastVerifiedAt` set.

## 4. Confidence

- The *absence* is verified by exhaustive check of the City site, the Municode
  consolidation and the OpenGov portal (application forms login-gated).
- Nothing on these pages should ever display a dollar amount. If a future reader
  obtains the adopted schedule, this research note and the fee_schedule verification
  row are the flags to update.
