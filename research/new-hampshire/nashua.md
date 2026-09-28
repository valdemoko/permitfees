# Nashua, New Hampshire — research record

**Status: published** (New Hampshire, pass 10). Three permit pages: building, electrical and
plumbing.

- **Verification date:** 2026-09-25
- **Issuing authority:** City of Nashua, Department of Building Safety, 229 Main Street,
  2nd Floor of City Hall, Nashua NH 03060, (603) 589-3080
- **Enabling law:** as in Manchester, the State Building Code adopted under RSA 155-A is
  enforced locally and the fees are municipal. Nashua's are in Chapter 105 of the Revised
  Ordinances, not in a State schedule.

| Document | Where |
| --- | --- |
| Nashua Revised Ordinances, Ch. 105 "Building Construction", Art. VIII "Fees" — §105-27 and §105-28 (schedules A–D) | `https://ecode360.com/8729813` |
| Ordinance O-21-045, amending the building construction ordinances and increasing the Building Department fees | `https://www.nashuanh.gov/Archive.aspx?ADID=6680` |
| Permits — Department of Building Safety | `https://www.nashuanh.gov/278/Permits` |
| Permits Required & Cost — Department of Building Safety | `https://www.nashuanh.gov/281/Permits-Required-Cost` |
| Residential Electrical Permit application | `https://www.nashuanh.gov/DocumentCenter/View/18496` |
| Residential Plumbing Permit application | `https://www.nashuanh.gov/DocumentCenter/View/18500` |
| Commercial electrical / mechanical / plumbing forms | `.../View/18495`, `.../18497`, `.../18498`, `.../18499` |

## 1. The access problem, and how it was solved

Two of Nashua's own documents are **page images with no text layer**:

- `Ordinance 0-21-045` (`Archive.aspx?ADID=6680`) — 22 pages of scans.
- The "simplified Permit Fee Schedule" (`DocumentCenter/View/8065`) — 2 pages of scans, and
  the file has no extractable text at all (`pdftotext` returns form feeds).

The trade permit forms are the same: they render fine as documents, but their fee columns do
not extract — the residential plumbing form, for example, prints `$50.00` against the
application fee line and nothing against the fixture rows, which read as a tick-box table.

**The rates therefore come from the codifier's consolidation of Chapter 105**, which serves
the same text as the ordinance in HTML: `§105-28` with subsections A (building), B
(mechanical), C (electrical) and D (plumbing), each carrying its own amendment history. Every
subsection is annotated `Amended 3-9-2021 by Ord. No. O-21-045`, which is the ordinance the
department's permits page names, so the consolidation and the City's own document agree about
which instrument set the current rates. The ordinance and the forms are cited for the dates,
the structure and the plain-language statements ("fees are normally determined by the square
footage of the project", "there is an additional $35 filing fee for each permit") rather than
for figures.

## 2. What the mechanism is

**Nashua does not price from the value of the work. It prices from measurements.**

| Schedule | Priced by |
| --- | --- |
| **A. Building** | Area affected in square feet: `$0.18` residential new, `$0.28` commercial/multifamily new, `$0.13` residential alteration, `$0.18` commercial alteration. Additional plan review for minor modifications: `$0.10` / `$0.15`. |
| **C. Electrical** | Residential: `$0.080` per square foot of habitable area for new construction, `$0.080` per square foot of work area for low voltage, `$35` service entrance, `$55` house meter, `$55` + `$20`/unit service change, `$30` a subpanel, `$60` a pool, `$50` temporary service. Commercial: `$0.50` per ampere of service, `$1` an outlet, `$1` a lighting fixture, `$30` a panel, `$35` a sign, `$15` a water heater, `$300` an annual permit. |
| **D. Plumbing** | `$9.50` a residential fixture and `$12` a commercial one; `$18`/`$25` an electric water heater; `$18` per 100 feet of pipe; `$35` a residential sewer connection; `$30` a grease interceptor; `$20` an irrigation system; `$16` a backflow preventer; `$20` a roof drain inlet. |

Four charges attach to every permit in all four schedules, and they are identical across them:

- **$50.00 non-refundable application processing and review fee**, paid when any application is
  filed.
- **$75.00 re-inspection** "for the same work due to the failure to pass an initial inspection
  or the unavailability of the premises at the time of initial inspection".
- **100% surcharge** for a permit issued after construction started without one, **capped at
  $275.00 residential and $750.00 commercial**.
- Two things the department's own summary adds and the code does not: a **$35 filing fee per
  permit** and a **$25 land use review fee**. They are named in `notIncluded` and not charged,
  because the code's fee article does not state them or say which permits carry them.

## 3. What is modelled

Every row in the table above, plus the application fee, the re-inspection fee on all three
permit types, and the two surcharge caps. All 44 rules validate, and each of the three pages'
worked examples is asserted against the engine.

The three facts the rules are gated on:

- **`occupancy`** — residential (one- and two-family and townhouses) against the commercial
  table, "including multifamily". The schedule itself draws the line there, and it is not
  cosmetic: a fixture is $9.50 or $12.00, a service entrance is $35.00 or $0.50 an ampere, and
  a residential electrical permit has no outlet row at all.
- **`custom.building_alteration`** — picks `$0.13`/`$0.18` over `$0.18`/`$0.28`.
- **`custom.worked_without_permit`** — picks up the surcharge.

## 4. What is NOT modelled, and why

- **The per-100-foot pipe rows** (water pipes, drain/waste/vent, storm drainage at `$18` per
  100 feet or part thereof, in both plumbing tables). The engine's `FEE_BASES` has no
  linear-measure basis. Adding one for a single city's pipe rows would be a project-wide change
  made on thin evidence, so the rows are documented on the plumbing page and priced nowhere.
  This is the same judgement call the Clark County pass recorded for curable extensions.
- **Demolition**: `$40` up to 1,000 square feet plus "`$3.15` for each additional 100 square
  feet **or part thereof**". The round-up *is* the fee — 1,001 sq ft and 1,100 sq ft both pay
  $3.15 — so there is no honest integer rate that reproduces it. (`tiered_marginal` has a
  `bandCents` form that might, and would be worth trying in a later pass with a real test
  case.)
- **The discretionary minimums**: "minimum fee for miscellaneous equipment (each)" at `$30`
  residential / `$50` commercial, and its trade equivalents at `$40`, `$45` and `$50`. They
  apply "where not otherwise provided for by this section" and at the official's judgement, so
  no scope of work can reach them.
- **The LEED reductions** (5% / 10% / 15% / 20% off the building permit fee). A discount that
  depends on a certification document is not a fee a reader can be quoted without showing it.
- **The rest of §105-28A**: moving a building (`$200`), certificate of occupancy (`$50`), work
  not related to floor area (cost × `$0.65` per `$100`), retaining walls (`$0.15`/`$0.30` per
  linear foot against `$25`/`$50` minimums), phased construction's 25% per-phase surcharge and
  the expedite fee (`$80` per hour per staff member, `$250` minimum out of hours).
- **The mechanical schedule (§105-28B)** — gas piping at `$0.30` per 1,000 BTU residential and
  `$0.35` commercial, equipment at `$45`/`$55`, ductwork at `$0.125` per ten square feet of
  area served, hoods and exhaust fans at `$90` commercial, and the rest. Transcribed and named;
  Nashua's third page is plumbing.
- **Fire protection permits**, which are the Fire Marshal's under a separate schedule
  (O-22-023), including the sprinkler and fire alarm tables.

## 5. Effective dates

- **Fees as modelled:** `effectiveFrom = 2021-03-09` (Ord. No. O-21-045), which every
  subsection of §105-28 carries as its last amendment.
- The article's earlier amendments — 8-14-2007 (O-07-106), 12-11-2007 (O-07-144), 6-12-2018
  (O-18-012) — are recorded in the code's own notes and are superseded for every row here.

## 6. Open questions

- **Whether the $35 filing fee and $25 land use review fee stack on every permit.** The
  department's summary says "an additional $35 filing fee for each permit" and "an additional
  $25 fee for Land Use review". If they do apply to trade permits, every figure on the three
  pages is $35 low (and $60 for anything needing land use review). The site states them on the
  pages that cite the summary and does not add them, because the code's fee article — which is
  the operative instrument — does not mention either.
- **What "area affected" means for a fire-damage repair** where the damaged area and the
  repaired area differ. §105-28A(4) prices "alterations, repairs, fire damage" by area
  affected and does not define the measurement for that case.
