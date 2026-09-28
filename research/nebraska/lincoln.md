# Lincoln, Nebraska — research record

**Status: published** (Nebraska, pass 8; extended in pass 9). **Three** permit pages —
building, electrical and mechanical/fuel-gas. The mechanical page exists because a
second, wider read of Titles 24 and 25 turned up the one trade-permit fee table Lincoln
does publish — the Lincoln Gas Piping Systems Code at Sec. 24.05.380. The two fees it
does *not* publish (plumbing, and HVAC mechanical) are stated on the pages rather than
filled in with an estimate.

- **Verification date:** 2026-09-25
- **Issuing authority:** City of Lincoln, Planning Department — Building and Safety
- **Transcription:** the Municipal Code read through the enCodePlus-hosted code at
  `online.encodeplus.com/regs/lincoln-ne`.

| Document | Where |
| --- | --- |
| LMC Sec. 20.06.130 / Sec. 109.2 — Schedule of Permit Fees (Tables 1A and 1B) | `https://online.encodeplus.com/regs/lincoln-ne/doc-view.aspx?ajax=0&secid=10138` |
| LMC Sec. 23.10.520 — Permit Fees (Electrical Contractor Fee Schedule) | `https://online.encodeplus.com/regs/lincoln-ne/doc-view.aspx?ajax=0&secid=10608` |
| LMC Sec. 24.12.095 — Uniform Plumbing Code Sec. 104.5 amended; Fees | `https://online.encodeplus.com/regs/lincoln-ne/doc-view.aspx?ajax=0&secid=10745` |
| LMC Sec. 25.06.090 — Mechanical Code Sec. 109.2 amended; Fee Schedule | `https://online.encodeplus.com/regs/lincoln-ne/doc-view.aspx?ajax=0&secid=10956` |
| LMC Sec. 24.05.380 — Lincoln Gas Piping Systems Code: Permit Fee | `https://online.encodeplus.com/regs/lincoln-ne/doc-view.aspx?ajax=0&secid=10712` |
| LMC Sec. 25.12.180 — IFGC Chapter 4 deleted; gas piping installations | `https://online.encodeplus.com/regs/lincoln-ne/doc-view.aspx?ajax=0&secid=11082` |
| LMC Sec. 24.05.030 — Application for Permit; Sec. 24.05.220 — Registration Required | `https://online.encodeplus.com/regs/lincoln-ne/doc-view.aspx?ajax=0&secid=10677` / `...&secid=10696` |

All were read on 2026-09-25 and are recorded as `sources` in the seed payload.

**Correction to pass 8:** the Sec. 25.06.090 link was recorded as `secid=10945`; the
section is `secid=10956`. The fee text was quoted correctly either way — only the anchor
was wrong. The gas sections above were found by reading **every** dollar amount in the
full text of Titles 24 and 25, which is the check that should have been run first.

## 1. What the mechanism is

**A valuation table that chains exactly.** Table 1A has four rows, written in the same
*"$X for the first $N plus $Y for each additional $1,000 or fraction thereof"* form as
Omaha's and Houston's, and — like Omaha's, and unlike Houston's — it closes at both of
its seams:

| Band (total valuation) | Fee at the band's top | Opening figure of the next row |
| --- | --- | --- |
| $0 – $1,000 | $55.00 | $55.00 — flat row, no continuity claimed |
| $1,001 – $10,000 | **$127.00** | **$127.00 — closes** |
| $10,001 – $25,000 | **$202.00** | **$202.00 — closes** |
| Over $25,000 | open-ended | — |

The check is the row's own arithmetic: 9 increments at $8.00 on $55.00 = $127.00; 15 at
$5.00 on $127.00 = $202.00. Both are asserted in `tests/content/lincoln-seed.test.ts`.

**Plan review is a separate section at 65% with a $100 floor.** Sec. 109.2.1: "an amount
equal to 65% of the building permit fee as shown in Table 1A above, or $100.00 whichever
is greater, for commercial buildings, accessory buildings, and apartments." It is
"separate from and in addition to the permit fees" and is not credited against the permit
fee if the permit issues. It is modelled on the `permit_fee` basis with the $100 floor as
the rule's `minimumCents`, behind a `custom.plan_review` fact — a one- or two-family
dwelling is not in the list of occupancies that pay it.

**Table 1B is the miscellaneous schedule**, and it is *not* modelled: demolition
($200.00 residential, $250.00 plus $0.01 per square foot commercial, $30.00 garages), the
$100.00 fire- and building-damage investigation fees, expedited plan review (100% of the
plan-review fee, minimum $300.00, maximum $6,000.00), a 10% application-extension fee
and a 100% reinstatement fee for an expired permit. All are named on the building page.

## 2. Electrical is per-item, with a base fee that is not an allowance

Sec. 23.10.520 is an "Electrical Contractor Fee Schedule":

- **Base Permit Fee — $30.00**, described as "To be added to all other fees that apply to
  the application."
- **Branch circuit(s) and/or feeder(s) — $6.00 each.**
- **Service equipment** (new or replacement, and repairs), by amperage: 0–200 A $30.00,
  201–400 A $45.00, 401–800 A $90.00, 801–2,000 A $200.00, over 2,000 A $400.00.
- **Dormant-service inspection** (to restore power) — $30.00.
- **Re-inspection fee** — $50.00 each.

The base fee is modelled as a fee in its own right, **not** as a base charge covering the
first circuit. The code's own parenthesis — "To be added to all other fees that apply to
the application" — is the reason: a permit for one new circuit is $30.00 + $6.00 = $36.00,
not $6.00.

## 2a. The gas table: the one trade permit Lincoln prices itself

Sec. 24.05.380, **Permit Fee**, prints five lines and is the only trade-permit fee table
anywhere in Titles 20 through 25:

| Row | Fee |
| --- | --- |
| New construction (1–5 outlets) | **$25.00** |
| Each additional outlet | **$1.00** |
| Replacement with another permit (heating or plumbing) | **$6.00** |
| Replacement alone (with no other permit) | **$35.00** |
| Gas piping alteration | **$15.00** |

Two readings decide the arithmetic:

1. **The outlet row is a base with an allowance.** $25.00 covers the first five outlets and
   $1.00 each covers the sixth onwards — eight outlets is $28.00. A reader who takes it as
   $1.00 per outlet gets $33.00 and overcharges by three dollars. It is modelled with the
   `per_unit` base-and-allowance form (`baseCents 2500`, `thresholdUnits 5`,
   `centsPerUnit 100`) — the shape Phoenix's backflow row produced, reused unchanged.
2. **The five lines are alternatives.** They are "the permit fees charged in this
   chapter", so a replacement is not also new construction. `custom.gas_work` carries the
   choice the way `custom.schedule_item` does for Scottsdale, and the outlet row is the
   default when no work type is chosen.

**Why this table is operative rather than superseded.** Sec. 25.12.180: "Chapter 4 of the
International Fuel Gas Code is hereby deleted. Gas piping installations are governed by
the Lincoln Fuel Gas Code." The IFGC's own gas piping chapter is switched off and the
City's 2013 code takes over — which is what leaves Sec. 24.05.380 in force. Without that
section the table would have looked like an artefact of a code the City had replaced.

**Surrounding law, stated not charged.** Sec. 24.05.030 requires a written application
with plans in triplicate (waivable where plan review is unnecessary); Sec. 24.05.220
requires registration as a master plumber, an HVAC contractor under Ch. 25.01, or a master
gas fitter; Sec. 24.05.060 requires notice before inspection; Sec. 24.05.080 forbids
turning the gas on before the outlets are approved; Sec. 24.05.070 provides a certificate
of inspection.

## 3. What is modelled

- **Building:** all four Table 1A rows; plan review at 65% with the $100 floor; the
  $55.00 reinspection fee.
- **Electrical:** the base fee, the per-circuit rate, the five service-equipment bands,
  the dormant-service inspection and the $50.00 re-inspection fee.
- **Mechanical/fuel-gas:** all four rows of Sec. 24.05.380 — the outlet row with its
  five-outlet allowance, both replacement rates and the alteration.

## 4. What is NOT modelled, and what cannot be

- **The plumbing permit fee.** Sec. 24.12.095 amends the Uniform Plumbing Code to read:
  "A fee for each plumbing permit shall be paid to the Authority Having Jurisdiction. The
  fees shall be set by the City Council and shall be provided to the applicant by the
  Authority Having Jurisdiction." There is **no published amount**. This site publishes no
  Lincoln plumbing page. Quoting a figure would mean inventing one.
- **The HVAC mechanical permit fee.** Sec. 25.06.090 says the same of it: "pay a fee to
  the Code Official as approved by the City Council. The fee schedule, table, or other
  information concerning fees shall be provided by the Code Official." The mechanical
  page is published on the fuel-gas rows that *are* published, and says in its own words
  that equipment, ductwork and ventilation are not priced there.
- **Gas fitter and plumber licence fees** — examination and annual registration in
  Sec. 24.05.350 and Sec. 24.12.125 — which are licences rather than permits.
- **Table 1B**, in full (see §1).
- **The development-permit and flood-plain rows** that follow Table 1B in the same
  section.
- **The doubling rule** (`Ord.` text: work "started or proceeded with prior to obtaining
  said permit" doubles the fee), which Sec. 24.12.095 repeats for plumbing and the
  electrical schedule repeats for electrical; and the refund limits (two-thirds of the
  original fee, with the remainder capped at $25.00). These are stated, not charged.

## 5. Effective dates

Both modelled schedules carry the ordinance that last amended them, read from the section
page:

- Table 1A / Sec. 109.2: **Ord. 21786 §42, September 29, 2025** → `effectiveFrom =
  2025-09-29`.
- Sec. 23.10.520: **Ord. 21875 §1, June 01, 2026** → `effectiveFrom = 2026-06-01`.
- Sec. 24.05.380: **Ord. 19822 §4, January 28, 2013** → `effectiveFrom = 2013-01-28`. The
  date is the table's own last amendment and is deliberately not modernised: the amounts
  have not changed since 2013, and a fresher-looking date would misstate that. Recency of
  *reading* is carried separately, by `retrievedAt`/`lastVerifiedAt` = 2026-09-25.

## 6. Access

`www.lincoln.ne.gov` returns **HTTP 403** to a direct fetch from this sandbox, and its
pages render from JavaScript. The Municipal Code is served by **enCodePlus**, a
City-contracted codification host, and its section bodies are retrievable directly
(`doc-view.aspx?ajax=0&secid=...`), which is how every rate here was read. The section
text, tables and ordinance citations all came from that host.

## 7. Open questions

- **Where the Council-set plumbing and HVAC fees live.** They exist — the code says so —
  but they are not in the code. If Building and Safety publishes them (a permit-fee page, a
  Citizen Access fee table, or a Council resolution), both pages can be filled out from
  that source. Reverse-engineering them from the building table is not an option: the code
  gives no method.
- **Whether Sec. 24.05.380 and the newer Title 25 mechanical code will be reconciled.**
  Lincoln now has two fuel-gas codes: Ch. 24.05 (2013, NFPA 54/58 by reference, with the
  published fee table) and Ch. 25.12 (amended to the 2021 IFGC, with fees delegated to the
  Council). Sec. 25.12.180 currently sends gas piping to the older code. If a later
  ordinance reverses that, the gas table would stop being the operative one and this page
  would have to be re-priced — which is why the delegation section is cited as its own
  source rather than buried in a note.
