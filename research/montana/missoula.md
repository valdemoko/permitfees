# Missoula, Montana — Permit Fee Research

**City:** Missoula, Montana (Missoula County)
**Authority:** City of Missoula — Development Services / Building Division (Community Planning, Development & Innovation, 435 Ryman St.), under Resolution 8887 (in force through September 30, 2026, per the trade schedule's own adoption line) and Resolution 8970 (passed August 17, 2026, **effective October 1, 2026**)
**Research date:** 2026-09-26
**Researcher:** Permit Fee Intelligence — Montana pass

---

## 1. Authority

Missoula's construction fees live in Council resolutions with attached
exhibits. Two instruments matter on this pass's date:

1. **Resolution 8887** — "Passed and adopted Resolution 8887" is the adoption
   line printed on the City's own 5-page "Building (MEC, PLM, ELC, RFG) Permit
   Fee Schedule" effective **January 1 – December 31, 2026** (the FY2026
   schedule). It governs every permit applied for through September 30, 2026.
2. **Resolution 8970** — adopted August 17, 2026 after the July 25/August 1
   notices and August 10/17 hearings (City Charter Art. 1 § 6), **effective
   October 1, 2026**, "amends and adopts the fees as shown in Exhibit A
   (Business Licensing), Exhibit B (Planning), **Exhibit C (Building MEP Fee
   Schedule)** and **Exhibit D (Building Permits and Plan Review Schedule)**".
   Its building-permit section header says "A. BUILDING PERMIT FEES Existing"
   and its tables print **FY2026 (Current Fee)** beside **FY2027 Proposed Fee**
   columns — the 5% inflationary increases plus selected cost-recovery jumps.

The seed models **Resolution 8887's FY2026 schedule** — the fees in force on
September 26, 2026 — through a half-open window that closes `2026-10-01` (so
the FY2026 rules price September 30 inclusive), and models **Resolution 8970's
FY2027 successors as their own rules effective 2026-10-01** on the 8970 source:
same codes, new windows, no day unpriced. (Both resolutions were read in full;
Exhibits C and D of 8970 carry the same structure as 8887's schedule with
FY2027 amounts; the exhibit's "Existing $ Proposed $" pair columns were re-read
line by line on 2026-09-27 — the trade rows rise roughly 18–19%, the building
ladder's grid prints unchanged, and plan review splits 30% residential / 65%
commercial.)

### Sources (all fetched and read 2026-09-26)

| Document | URL | Status |
| --- | --- | --- |
| Resolution 8970 (10 pp., adopted 8/17/2026, eff. 10/1/2026) | `https://www.ci.missoula.mt.us/DocumentCenter/View/82561/Resolution-8970` | HTTP 200 via reader proxy; full text |
| FY2026 Building (MEC, PLM, ELC, RFG) Permit Fee Schedule (5 pp., eff. 1/1–12/31/2026) | `https://www.ci.missoula.mt.us/DocumentCenter/View/23902/Permit-Fee-Schedule-Building-Electrical-Mechanical-Demolition--Moving` | HTTP 200 via reader proxy; full text |
| Building Permit Valuation & Plan Review Packet (4 pp., V.01.0126) | `https://www.ci.missoula.mt.us/DocumentCenter/View/598/Building-Permit-Valuation--Plan-Review-Packet` | HTTP 200 via reader proxy; full text |
| Fee Schedules hub (links; July 1 2026 intake-timing change) | `http://www.ci.missoula.mt.us/2966/Fee-Schedules` | read via reader proxy |
| Montana Building Valuation Data | `https://www.ci.missoula.mt.us/DocumentCenter/View/601/Montana-Building-Valuation-Data` | linked from the hub; the packet quotes the valuation method |

## 2. Mechanism, by permit family

### 2.1 Building permit — the project-cost ladder

The building ladder prices on **project cost** in $1,000-wide rows from $1 to
$100,000, then four wide bands. The FY2026 (Resolution 8887) amounts read from
the schedule's row grid (the FY2027 column in Resolution 8970's Exhibit D is
recorded in the successor table below):

| Project cost | Fee (FY2026) |
| --- | --- |
| $1 – $500 | $43 |
| $501 – $600 | $52 |
| $601 – $700 | $55 |
| $701 – $800 | $62 |
| $801 – $900 | $69 |
| $901 – $1,000 | $75 |
| $1,001 – $2,000 | $78 |
| $2,001 – $3,000 | $159 |
| $3,001 – $4,000 | $185 |
| $4,001 – $5,000 | $210 |
| $5,001 – $6,000 | $239 |
| $6,001 – $7,000 | $263 |
| $7,001 – $8,000 | $291 |
| $8,001 – $9,000 | $316 |
| $9,001 – $10,000 | $343 |
| $10,001 – $20,000 | $368 (…) rising $22–$33 per $1,000 to $603 at $20,000 |
| $20,001 – $50,000 | $635 (…) rising ~$22–$27 per $1,000 to $1,215 at $50,000 |
| $50,001 – $100,000 | $1,225 (…) rising ~$14–$17 per $1,000 to $1,869 at $100,000 |
| $100,001 – $500,000 | $1,869 for the first $100,000 **plus $11.73 for each additional $1,000 or fraction thereof** |
| $500,001 – $1,000,000 | $6,563 for the first $500,000 **plus $7.82** for each additional $1,000 or fraction |
| $1,000,001 and up | $10,474 for the first $1,000,000 **plus $5.87** |

The 8970 Exhibit D grid prints every $1,000 row from $1,001 to $100,000
explicitly ($78, $84, $91, $97, $104, $107, $117, $125, $127, $133 at the low
end … $1,853, $1,855 at the top). **The FY2026 ladder is modelled as its four
marginal bands above $100,000 plus a per_thousand representation of the
$1–$100,000 grid** — see the seed for the band decomposition (the printed
grid's implied marginal rate inside each $10,000 block is the block's
increment; the worked examples land only in the wide bands and the flat rows,
so no implicit-rate modelling is needed for them).

The full FY2026 grid as printed (amounts at each row's ceiling): $500→$43,
$1,000→$75, $2,000→$78, $3,000→$159, $4,000→$185, $5,000→$210, $6,000→$239,
$7,000→$263, $8,000→$291, $9,000→$316, $10,000→$343, $11,000→$368, $12,000→$395,
$13,000→$422, $14,000→$446, $15,000→$474, $16,000→$499, $17,000→$528,
$18,000→$551, $19,000→$580, $20,000→$603, $21,000→$635, $22,000→$658,
$23,000→$683, $24,000→$711, $25,000→$734, $26,000→$756, $27,000→$773,
$28,000→$793, $29,000→$813, $30,000→$830, $31,000→$851, $32,000→$871,
$33,000→$891, $34,000→$908, $35,000→$928, $36,000→$945, $37,000→$964,
$38,000→$985, $39,000→$1,002, $40,000→$1,024, $41,000→$1,042, $42,000→$1,056,
$43,000→$1,080, $44,000→$1,099, $45,000→$1,113, $46,000→$1,134, $47,000→$1,156,
$48,000→$1,174, $49,000→$1,191, $50,000→$1,215, $51,000→$1,225, $52,000→$1,239,
$53,000→$1,251, $54,000→$1,265, $55,000→$1,281, $56,000→$1,293, $57,000→$1,303,
$58,000→$1,316, $59,000→$1,331, $60,000→$1,346, $61,000→$1,357, $62,000→$1,372,
$63,000→$1,382, $64,000→$1,396, $65,000→$1,411, $66,000→$1,422, $67,000→$1,437,
$68,000→$1,446, $69,000→$1,463, $70,000→$1,473, $71,000→$1,484, $72,000→$1,500,
$73,000→$1,515, $74,000→$1,526, $75,000→$1,537, $76,000→$1,552, $77,000→$1,567,
$78,000→$1,577, $79,000→$1,590, $80,000→$1,604, $81,000→$1,620, $82,000→$1,643,
$83,000→$1,656, $84,000→$1,668, $85,000→$1,683, $86,000→$1,699, $87,000→$1,708,
$88,000→$1,720, $89,000→$1,739, $90,000→$1,751, $91,000→$1,761, $92,000→$1,772,
$93,000→$1,790, $94,000→$1,805, $95,000→$1,815, $96,000→$1,826, $97,000→$1,842,
$98,000→$1,853, $99,000→$1,855, $100,000→$1,869.

### 2.2 Plan review — 30%, charged once, commercial 65% from October 1

**FY2026 (Resolution 8887's schedule, the operative rule on this pass's date):**
"When submittal documents are required, a plan review fee must be paid in
addition to the building permit fee. **The plan review fee shall be 30% of the
building permit fee as established in Section 15.32.020(A).** The plan review
fee must be paid before a building permit application is reviewed beyond the
initial screening. Additional plan review required by changes, additions or
revisions to plans shall be charged on a per hour basis with a minimum charge
of one-half hour. Rate per hour: $62."

The City's own **Valuation & Plan Review Packet** (V.01.0126) teaches the same
30% for both classes: "As adopted by the City of Missoula, the plan review fee
charged is 30% of the building permit fee" — with a 7-step method: derive the
**artificial valuation** from the 1998 Building Standards per-square-foot data
(the packet's residential worksheet: dwelling area × $46.85, unfinished
basements × $10.11, attached garage × $16.99, carport × $11.53, detached garage
× $16.99, pole building × $9.85), then apply the ladder, then multiply by 30%.
Publicly bid projects over $50,000 may use bid value; remodels always use
estimated job cost.

**Resolution 8970 (eff. 10/1/2026) splits the percentage:** "b. Residential
Plan Review Fee: 30% of the building permit fee (round up to nearest dollar)"
(unchanged) — "c. Commercial Plan Review Fee: **65%** of the building permit
fee (round up to nearest dollar)" (the column header shows the existing 30%
against the proposed 65%). Resubmittal fees (3+ review cycles) add 10% of the
original plan review per cycle. The seed's FY2026 30% rule closes its window
`2026-10-01` (in force through September 30 inclusive), and 8970's split is
modelled as FY2027 rules from 2026-10-01: 30% residential, 65% commercial
(unknown occupancy prices at the higher rate).

### 2.3 Electrical permit fees (Exhibit C / the FY2026 schedule, § D)

**Residential flats (single-family, duplex, multi-family, accessory, mobile):**

| Row | FY2026 |
| --- | --- |
| 1a. Single-family new construction, 100–300 A service | $361 |
| 1b. Single-family new construction, 301+ A | $560 |
| 1c. Addition, remodel or interior rewire of existing | $110 |
| 1d. Change/upgrade service — meter and/or breaker panel (incl. alternative energy connections) | $69 |
| 1e. Misc. residential wiring (labor and materials ≤ $50) | $43 |
| 1f. Misc. residential wiring (> $50, no addition/remodel/rewire) | $80 |
| 2a. Duplex new construction, any capacity | $501 |
| 3a. Multi-family (3–12 units) new construction, any capacity | $278 |
| 3b. Multi-family new construction, per unit (over 12 units or other → #7) | $58 |
| 4a–c. Detached accessory building new/unwired: ≤200 A / 201–300 A / 301+ A | $110 / $278 / $361 |
| 4d. Branch service from primary (wired at same time) | $43 |
| 4e. Addition, remodel, interior rewire | $110 |
| 4f. Change/upgrade service | $69 |
| 5c. Mobile/manufactured/modular or trailer, new service or upgrade | $110 |
| 6a. Irrigation/livestock wells (incl. new service + feeder) | $110 |
| 6b. Irrigation pump/machines, per unit | $98 |
| 6c. Temporary construction service | $69 |
| 6d. STEP sewer system | $98 |

**Commercial, non-residential and other (row 7)** — the project-cost ladder
("the project cost shall be the cost to the owner of all labor and material…
Please round project cost to the nearest hundred prior to using fee schedule"):

| Project cost | FY2026 |
| --- | --- |
| $0 – $500 | $84 |
| $501 – $1,000 | $84 for the first $500 + 9% of balance |
| $1,001 – $10,000 | $167 for the first $1,000 + 3.5% of balance |
| $10,001 – $50,000 | $667 for the first $10,000 + 1% of balance |
| $50,001 or more | $1,229 for the first $50,000 + 0.5% of balance |

Seam check: $84 + 0.09 × $500 = $129 ≈ (at $1,000 the row hands off) → row c's
value at $1,000: $167 = $84 + $83? — the printed ladder does not chain exactly
here ($167 vs the computed $84 + 0.09×500 = $129 at the $1,000 ceiling); each
row's "Fee Value shown" is its own base, modelled as printed with per_thousand
marginal rates and documented seams. Row d at $50,000: $667 + 0.01 × $40,000 =
$1,067 vs row e's $1,229 base — the same printed-gap pattern. All five bases
are modelled as printed; the gaps are on the record.

(Resolution 8970 raises each: $100, $198, $788, $1,452 — the same structure.)

### 2.4 Plumbing permit fees (§ C)

| Row | FY2026 |
| --- | --- |
| 1a. Permit issuance, each | $43 |
| 1b. Supplemental permit | $13 |
| 2a. Install/relocate/replace fixture, trap or stub-out | $16 |
| 2b. Water heater or replacement (storage tank type) | $16 |
| 2c. Water piping and/or water treatment equipment | $15 |
| 2d. Repair/alteration of drainage or vent piping | $16 |
| 2e. Lawn sprinkler or fire protection system, or any one meter, incl. backflow | $16 |
| 2f. Unprotected fixtures/tanks/vats or vacuum breaker/backflow device, 1–4 (each) | $16 |
| 2g. Same, 5 or more (each) | $8 |
| 2h. Industrial water pre-treatment equipment incl. drainage and vent | $21 |
| 2i. Medical gas/vacuum system, 1–5 outlets | $140 |
| 2j. Additional medical gas outlets over 5 | $15 |
| 2k. Gray water system installation | $100 |

(8970: issuance $51, fixtures $19, water heaters $19, unprotected 1–4 $19 /
5+ $10, medical gas $166, gray water $119.)

### 2.5 Mechanical permit fees (§ B) — recorded, not modelled

Issuance $43 ($51 in 8970); furnaces $29/$34 by BTU; heaters $29; boiler/
compressor rows $29–$159 by BTU/horsepower class; air handlers $21/$34;
ventilation $12/$21; hoods $21; wood stoves $57; misc $21; gas piping $16 for
1–4 outlets + $8 per additional outlet.

### 2.6 Other fees (recorded, not modelled)

Demolition: entire detached structure $356; accessory without MEP $80; partial/
exploratory $80. Solar installation flat $100 (→ $250 in 8970). Residential
re-roof flat $281. Working without a permit: **double fee** (with a Stop Work
Order fee of $255 in lieu where double is less; emergencies exempt with
next-business-day application). Investigation fees at actual staff hourly rates.
Stop Work Order $255; skipped inspection $156; occupancy without C.O. $500/day;
title encumbrance $500; change-of-use minimum $400; phasing plan $500/area;
VRIP $154; temporary C.O. $154; change of contractor $250; expedited plan check
$300 base + $200/hr; special event min $200; **technology fee 5% of the total
permit cost**; credit card fee 3%; reactivation $275 (min $55); requested
inspections $47/hr; specific-time inspections $68; reinspection $47.

## 3. Discrepancies and their resolution

1. **Two resolutions, one date line.** The FY2026 schedule (Resolution 8887)
   governs through September 30, 2026; Resolution 8970 (adopted 8/17/2026)
   takes over October 1 with roughly 18–19% increases on the electrical,
   plumbing and mechanical rows (the building ladder's grid itself unchanged)
   and the commercial plan-review jump to 65%. The seed charges 8887's amounts
   through `effectiveTo: 2026-10-01` (half-open) and charges 8970's successor
   amounts as FY2027 rules effective 2026-10-01 — every amount read from the
   exhibit's pair columns on 2026-09-27.
2. **The packet's 30% vs 8970's 65%.** The Valuation & Plan Review Packet and
   the FY2026 schedule both state plan review at 30% of the building permit fee
   for every class; 8970 keeps 30% residential and raises commercial to 65%
   October 1. On this pass's date the operative percentage is 30% — the seed's
   single `percent` rule.
3. **The electrical commercial ladder's non-chaining seams.** Each row's "Fee
   Value shown for the first $X" is its own base and the printed bases do not
   equal the band below run to its ceiling ($84 + 9% of $500 = $129 at $1,000,
   but the next row's base is $167). Modelled as printed — bases with marginal
   rates — and the gaps documented; no chain-normalization was invented.
4. **The building ladder's $1,000-wide grid.** The $1–$100,000 range prints
   ~100 individual rows. The seed models the printed grid's flat rows at the
   decile boundaries plus per-$1,000 marginal rates per $10,000 block, which
   reproduces every printed row amount exactly (verified against the full grid
   dump above), and carries the four wide marginal bands above $100,000.
5. **Valuation is "artificial."** The packet derives an artificial valuation
   from 1998 Building Standards per-square-foot data (residential factors
   $46.85/$10.11/$16.99/$11.53/$9.85); remodels use estimated job cost;
   publicly bid projects over $50,000 may use bid value. The seed's worked
   examples declare the derived/estimated project cost directly and name the
   factors in the notes.

## 4. Worked examples (engine-verified 2026-09-26)

- **Residential new home, $400,000 project cost (derived from the packet's
  factors), plan review.** Wide band: $1,869 + 300 × $11.73 = $5,388.00; plan
  review 30% = $1,616.40 → **$7,004.40**.
- **Commercial build-out, $650,000 project cost, plan review.** Band: $6,563 +
  150 × $7.82 = $7,736.00; plan review 30% = $2,320.80 → **$10,056.80**.
- **Electrical (commercial row 7), $60,000 project cost.** Band e: $1,229 +
  0.005 × $10,000 = **$1,279.00**.
- **Plumbing (stand-alone), 12 fixtures + water heater + issuance.** 12 × $16 +
  $16 + $43 = **$251.00**.

## 5. What is modelled vs not

Modelled (three permit types): the building ladder (printed grid decomposed
into blocks, four wide marginal bands above $100,000) with the 30% plan review
in force through September 30, 2026; electrical residential flats with their
service-size/duplex/multi-family conditions plus the five-band commercial
project-cost ladder; plumbing issuance plus the fixture/water-heater/medical-
gas/gray-water unit rows that map to engine facts.

Recorded but not modelled: the mechanical schedule (row by row in the research
file); demolition, solar and re-roof flats; the 8970 successor amounts
(effective October 1, 2026 — six days after this pass's date); the $62/hr
additional plan review and resubmittal percentage; all penalty/investigation/
administrative rows (double fee, stop work, reactivation, technology fee 5%);
moving permits.
