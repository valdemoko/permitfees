# Arkansas — Fort Smith

**Status:** researched & seeded. **Last verified:** 2026-09-26.

## 1. Authority

- Issuer: City of Fort Smith, Building & Business → Building & Development (Building
  Safety Division / Building Official). Website: `fortsmithar.gov`. Permit portal:
  CityView (`cityview2.iharriscomputer.com/FortSmithARPortal/`).
- Code: Fort Smith Code of Ordinances, Chapter 6 (Buildings and Building Regulations):
  - Building: Art. II, **Sec. 6-30 "Fee schedule"** (Ord. 23-99 (1999-04-20), Ord.
    108-09 (2010-02-01), altered in the 2019 recodification; code adopted per Ord.
    26-23 (2023-03-07) as the 2021 Arkansas Fire Prevention Code Vol. II).
  - Electrical: Art. III, **Sec. 6-75 "Permit fees"** (Ord. 23-99 (1999-04-20)).
  - Plumbing & gas: Art. VI, **Sec. 6-242(b) "Inspection fees"** (Ord. 23-99
    (1999-04-20), Ord. 55-02 (2002-09-17)).
- Texts read from the Municode Library consolidation
  (`library.municode.com/ar/fort_smith`), which serves plain HTML; the City's own
  fee-schedule page 403s scripted requests (Akamai) and was read in a browser session;
  its four fee links point at exactly these Municode sections, which confirms the
  City's own routing to them.

## 2. Fee mechanisms

### Building — Sec. 6-30

**Minimum valuation for new residential construction** (used to floor a valuation):

| Square feet | $/sq ft |
| --- | --- |
| 0–1,800 | 80 |
| 1,801–2,500 | 100 |
| 2,501–3,500 | 125 |
| 3,501+ | 180 |

(Owner/contractor may establish a lesser figure with a Marshall & Swift report.)

**Residential fee** (single-family and duplex; new, remodel, repair, additions,
alterations):

| Cost of construction | Fee |
| --- | --- |
| $50–$500 | $15.00 |
| $501–$1,000 | $22.50 |
| $1,001–$1,500 | $30.00 |
| $1,501–$2,000 | $37.50 |
| $2,001 and over | $37.50 plus $1.50 per additional $1,000 or fraction thereof |

**Nonresidential fee** (multifamily, commercial, industrial, institutional):

| Cost of construction | Fee |
| --- | --- |
| $50–$500 | $15.00 |
| $501–$1,000 | $37.50 |
| $1,001–$1,500 | $52.50 |
| $1,501–$2,000 | $67.50 |
| $2,001–$10,000 | $67.50 plus $4.50 per additional $1,000 |
| $10,001–$50,000 | $103.50 plus $3.75 per additional $1,000 |
| $50,001–$100,000 | $253.50 plus $3.00 per additional $1,000 |
| $100,001–$1,000,000 | $403.50 plus $2.25 per additional $1,000 |
| $1,000,001+ | $2,536.50 plus $1.50 per additional $1,000 |

Reading notes:

- **The residential $2,001-and-over row prints "or fraction thereof"; the
  nonresidential rows do not.** Charged accordingly: the residential top band rounds
  up; every nonresidential band prorates. This is the Fargo/Bismarck
  phrase-detection reading applied twice inside one section — asserted from both
  sides in the seed test.
- **The nonresidential bands chain at three of four seams**: $67.50 + 8 × $4.50 =
  $103.50 (band 6's base); $103.50 + 40 × $3.75 = $253.50 (band 7's base);
  $253.50 + 50 × $3.00 = $403.50 (band 8's base) — verified band by band. The
  fourth seam does **not** chain: band 8 computes $403.50 + 900 × $2.25 = $2,428.50
  at $1,000,000, where the top band prints its own $2,536.50 base — a $108.00
  step-up the schedule itself contains. Charged as printed (the Fargo 25-cent /
  Detroit 7-cent discontinuity pattern), asserted from both sides of the seam.
- Plan review (multifamily, commercial, industrial): **20% of the building permit
  fee, not to exceed $1,500**, nonrefundable, in addition to the permit fee. No
  minimum printed → a $15 residential-scale nonresidential permit would pay $3.00 of
  plan review; scope: charged on multifamily/commercial/industrial only.
- Demolition: $50.00 for the first 1,000 sq ft and $1.00 per 100 sq ft after that
  (prorates — no "fraction" phrase), plus $25.00 sewer and water inspection.
- No Act 474 education surcharge appears in this section (named, not modelled).

### Electrical — Sec. 6-75

Fees based on the number of **active circuits** installed under one permit:

| Number of active circuits | Charge per circuit |
| --- | --- |
| 1–4 | $5.50 |
| 5–10 | $5.00 |
| 11–20 | $4.50 |
| 21–42 | $4.00 |
| 43+ | $3.50 |

Minimum inspection fee: $30.00. Counting rules: 2-/3-wire single-phase circuit = 2
circuits; 3-/4-wire three-phase = 3. Flat rows: panel replacement $30.00 (relocated
>5 ft → circuits × rate); temporary construction service $30.00; mobile home /
travel trailer service $35.00; electric sign $35.00; generators $30.00 (50 W–3,000 W)
/ $40.00 (>3,000 W); transformers <5 KVA $15, 5–50 KVA $40, >50 KVA $60.
Unpermitted work: 3× fee.

Modelled as a tiered ladder on `custom.circuits`: the per-circuit rate × the count
in each band, marginal — 50 circuits = 4 × $5.50 + 6 × $5.00 + 10 × $4.50 + 22 ×
$4.00 + 8 × $3.50 = $22 + $30 + $45 + $88 + $28 = **$213.00**. The schedule prices
*each* circuit at its band's rate (a band table of per-circuit charges, not a
bracket fee), which is the marginal reading of a per-unit ladder.

### Plumbing — Sec. 6-242(b)

Inspection fees paid to the city:

1. Each fixture outlet: $5.50
2. Water or sewer service: $5.50
3. Each water heater, disposer, dishwasher and floor drain: $4.00
4. Gas service with up to five outlets: $5.50
5. Each additional gas outlet: $1.50
6. Final inspection: $12.00
7. **Minimum fee: $24.00**

Plus the $20.00 reinspection penalty (per additional inspection) — named, not
modelled. Modelled: `per_unit` on fixture outlets ($5.50), water/sewer services
($5.50 each, own kind), appliance count ($4.00), final inspection ($12.00 flat),
with the $24.00 minimum as `minimumCents` on the fixture rule plus a `permit_minimum`
floor on the permit fee so a permit of only services still reaches $24.00.

## 3. Worked-example arithmetic (asserted in tests)

1. **Building (residential)** — $220,000 cost of construction: $37.50 + 218 whole
   thousands × $1.50 (fraction rounds up) = $37.50 + $327.00 = **$364.50**. No plan
   review (residential). Data/sidewalk assessments excluded.
2. **Building (nonresidential)** — $220,000: $403.50 for the first $100,000 + $2.25 ×
   120 = $403.50 + $270.00 = **$673.50** (bands prorate — $2.25 × 120.0 exactly, no
   round-up); plan review 20% = $134.70 (below the $1,500 cap). Total **$808.20**.
3. **Electrical** — 24 active circuits: 4 × $5.50 + 6 × $5.00 + 10 × $4.50 + 4 ×
   $4.00 = $22 + $30 + $45 + $16 = **$113.00** (≥ $30 minimum).
4. **Plumbing** — 6 fixture outlets + 1 water heater + final: 6 × $5.50 = $33.00 +
   $4.00 + $12.00 = **$49.00**.

## 4. Discrepancies and open questions

- The 2019 recodification note ("altered in 2019 recodification") attaches to Secs.
  6-30, 6-75 and 6-242; the fee text itself is unchanged from Ord. 23-99 (1999).
  Dates carried as `effectiveFrom: 1999-04-20` with the recodification named in
  notes.
- PermitFlow-style third-party guides publish ranges ("$45–$540") that match no city
  document; ignored.
- The residential minimum-valuation chart (§$80–$180/sq ft) floors *valuations*, not
  fees; modelled only as documentation — the fee rules read the entered cost of
  construction. A new dwelling's `valuationCents` should be at least sq ft × $80;
  stated in prose.
