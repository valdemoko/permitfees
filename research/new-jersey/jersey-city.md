# Jersey City, New Jersey — research record

**Status: published** (New Jersey, pass 11). Three permit pages: building, electrical and
plumbing.

- **Verification date:** 2026-09-25
- **Issuing authority:** City of Jersey City, Department of Housing, Economic Development and
  Commerce — Construction Code. Applications are taken through the City's online permitting and
  licensing portal; no street address or telephone number was published in a document this pass
  could read, and the seed leaves both empty rather than guessing.
- **Enabling law:** as in Newark — N.J.S.A. 52:27D-119 et seq. and N.J.A.C. 5:23-4. §160-1 M of the
  City Code is headed "Chapter 131, Uniform Construction Code fees established pursuant to
  N.J.S.A. 52:27D-126a", which is the statutory authority for a municipality to set its own
  construction fees.

| Document | Where |
| --- | --- |
| Jersey City Municipal Code, Chapter 160 "Fees and Charges", §160-1 M — the Uniform Construction Code fee block (building, plumbing, electrical, fire, elevator and miscellaneous subcodes) | `https://library.municode.com/nj/jersey_city/codes/code_of_ordinances?nodeId=CH160FECH_S160-1FESCES` |
| Ordinance 26-051, amending Chapter 160, with the amended chapter as its attachment — adopted on second reading 15 July 2026 | `https://cityofjerseycity.civicweb.net/document/455677` |
| Chapter 131, Uniform Construction Code (the enforcement chapter the fees implement) | `https://library.municode.com/nj/jersey_city/codes/code_of_ordinances?nodeId=CH131COCOUN` |
| The City's Codes & Ordinances page, which links both, and the Construction Code department's page | `https://www.jerseycitynj.gov/cityhall/HousingAndDevelopment/constructioncode/codes___ordinances` |
| N.J.A.C. 5:23-4.18 and 5:23-4.19 — standards for municipal fees and the State permit surcharge | `https://www.nj.gov/dca/codes/codreg/pdf_regs/njac_5_23_4.pdf` |

## 1. What the access situation was

Unlike Newark, `jerseycitynj.gov` **is** reachable from this environment, and the City's own
Codes & Ordinances page is where the code links came from rather than from a search engine. What
that page links to is the codifier — the City publishes no fee schedule of its own as a document,
and §160-1 M is the whole of it.

Two access notes worth recording for the next pass:

- The codifier's chapter page renders as a single long HTML document and can be read in one
  request; the chapter may also arrive as part of an ordinance attachment, which is how the second
  source was found.
- The ordinance PDFs on the City's civic platform (`cityofjerseycity.civicweb.net/document/<id>`)
  download directly and have clean text layers. Those are the City's own instruments, which makes
  them the best available dating evidence in this journal.

## 2. What the mechanism is

**Volume for new construction, estimated cost for alterations, blocks for electrical devices, and a
flat rate a fixture for plumbing** — the same State shape as Newark, priced quite differently.

| Schedule | Priced by |
| --- | --- |
| **Building subcode, new construction** | Volume: `$0.027` a cubic foot for buildings and structures "of all use groups", **except** `$0.15` a cubic foot for use groups A-1, A-2, A-4, A-5, F-1, F-2, S-1 and S-2. |
| **Building subcode, renovations and alterations** | Estimated cost of work: `$15` per `$1,000`, with a `$50` floor for a short permit and a `$100` floor for a plan permit. |
| **Electrical subcode** | Blocks of devices: `$25` for the first ten receptacles, fixtures or devices, and `$25` for each additional twenty-five. Then `$10`, `$45`, `$85` and `$412` per item by horsepower, kilowatt and ampere rating; `$46` flat for a private pool, spa, hot tub or fountain; `$23` a dwelling unit for detectors and alarm systems in a one- or two-family dwelling; `$100` a leak detection system; `$25` a year for a pool certificate of compliance. |
| **Plumbing subcode** | `$10` a plumbing fixture, with twenty-two items named and a second list at the same rate; a menu of two dozen devices at `$15` to `$60`; and `$300` for a back flow cross connection including three external and one internal inspection. |
| **Fire subcode** | Sprinkler heads `$75` to `$125` plus `$1` a head over 100; suppression systems and valves `$150` with standpipes `$230` a riser; alarm devices `$25`, `$60` and `$1` each after that plus `$100` per 10,000 square feet; pre-engineered systems `$100` and `$150`; kitchen exhaust `$100`; gas or oil fired devices `$50`; tanks `$100` to `$300` by gallonage; a `$75` minimum, a `$125` Public Safety connection and `$365` for incinerators and crematoriums. |
| **Elevator subcode** | Two tables, the permit fees from `$43` for oil buffers to `$405` for a traction elevator above ten floors, and the annual inspection schedule from `$54` to `$497`. |
| **Miscellaneous** | Demolition `$200`/`$250`, variations `$200`, certificates of occupancy `$100` and continued occupancy `$200`, the annual construction permit at `$667` a worker, and the non-construction rows in M(7). |

On top of all of it sits the State's permit surcharge, and on top of that the two readings
below.

## 3. What is modelled

Three pages — building, electrical, plumbing — and 15 rules, all validating, every figure asserted
against §160-1 M.

- **Building:** both volumetric rates, with the printed use-group list matched as printed; the
  single alteration rate at `$15` per `$1,000`; both alteration floors, gated so exactly one can
  apply; the State surcharge on the volumetric and cost paths as its own component.
- **Electrical:** the block row; the `$46` private pool; `$23` a dwelling unit for residential
  detectors and alarm systems; the `$100` leak detection system; the State surcharge.
- **Plumbing:** `$10` a fixture; the `$300` back flow cross connection; the State surcharge.

The rate arithmetic is stored exactly rather than rounded: `$0.027` a cubic foot is the fraction
`27/10` cents, so a 100,000 cubic foot building is `$2,700.00` and not `$3,000.00`; and the State's
`$0.00371` a cubic foot is `371/1000` of a cent, so the surcharge on the same building is
`$371.00` and not `$370.00` or `$310.00`.

## 4. Three readings, and why

**Plan review is a prepayment.** M(1)(o) reads "Plan Review Fee shall be 25% of the estimated cost
of permits which is nonrefundable", and stops there — Jersey City's row does not repeat Newark's
"shall then be deducted". The deduction is in the rule the ordinance implements: N.J.A.C.
5:23-4.18(a)1 provides that the plan review fee, "computed as a percentage of the fee for a
construction permit, shall be paid at the time of submission of an application for a permit" and
that "the amount of this fee shall then be deducted from the amount of the fee due for a
construction permit, when the permit is issued". A municipal fee ordinance has to meet that
standard, so the 25% is the first quarter of the permit fee. This site charges no plan-review row
and says on the building page that a permit read the other way would be 25% higher. It is the one
reading in this jurisdiction a reader could reasonably disagree with, and it is stated rather than
buried.

**The State surcharge is charged at the State's amount.** M(1)(g) prints "State of New Jersey
training fee: $0.00265 per cubic foot volume of new construction. $0.00135 of cost of construction
for alterations, renovations, and repairs." Those were the State's amounts before the mid-1990s —
§5:23-4.19's own history runs `$0.00265 → $0.00334 → $0.00371` a cubic foot and `$1.35 → $1.70 →
$1.90` per `$1,000` — and the same section of the code says: "Certain fees described above as
charged by the Office of the Construction Official are set by the State of New Jersey. Any changes
in those fees by the State of New Jersey will be incorporated herein by reference." That sentence
is the City instructing a reader to the regulation, so the regulation's current figures are
charged and the City's printed pair is named on every page. On this city the difference is smaller
than on Newark and in the same direction: the site's surcharge is higher than the printed one.

**The high-rate use-group list is modelled as printed.** M(1)(a): "The new construction fee shall
be in the amount of $.027 per cubic foot of volume for buildings and structures of all use groups
except that the fee shall be $0.15 per cubic foot of volume for use groups A-1, A-2, **A-2**, A-4,
A-5, F-1, F-2, S-1 and S-2." A-2 appears twice and A-3 does not appear at all, in a list that
otherwise walks the A series in order. The duplicate is very likely A-3, and the State's model
lists in other municipalities do include A-3 — but the ordinance does not say so, and the gap
between `$0.027` and `$0.15` is a factor of 5.5 on every cubic foot of an assembly building. The
model matches the printed list, so an A-3 building is charged the general rate here, and the
building page states the ambiguity in full so that an A-3 applicant asks rather than assumes. A
test asserts this behaviour, so changing it is a deliberate act.

## 5. What is NOT modelled, and why

- **The fire subcode** (M(4)) in full — heads, suppression systems, standpipes, alarm devices,
  kitchen exhaust, gas and oil fired devices, tanks, the `$75` minimum and the `$125` Public Safety
  connection. Every amount is named on the pages that mention it. As with Newark, the sprinkler and
  detector tables need countable kinds the engine does not have yet.
- **The plumbing device menu** in M(2)(b) and M(2)(c) — two dozen devices priced individually from a
  tankless heater at `$25` to a fire sprinkler main at `$60`. The model charges the `$10` fixture
  row and names every menu amount on the plumbing page. A menu of individually priced devices is
  the shape this dataset still has no honest way to model generically: one price per row needs one
  count per row, and adding thirty kinds for one city's plumbing page would be a content problem
  dressed as an engine feature.
- **The electrical rating bands** — the `$10`, `$45`, `$85` and `$412` rows, priced per device by
  horsepower, kilowatt and ampere. Named on the electrical page with their contents.
- **The public-pool route** in M(3)(f), which sends a public pool's electrical work to the device and
  rating counts instead of the `$46` flat fee. The certificate of compliance for pools at `$25` a
  year is an annual certificate rather than a permit fee.
- **Everything else in M(1)**: asbestos removal `$50`, lead paint abatement `$140`, exterior
  hoistways `$260`, above- and in-ground pools `$50` to `$150` by size, tents `$92`, signs `$1.50` a
  square foot, prototype filing at 80% for each additional prototype, and emergency and exit lights
  at `$25` for the first ten and `$25` for each additional twenty-five.
- **The elevator subcode** (M(5)), both tables.
- **M(6) and M(7)**: demolition, variations, certificates of occupancy, the annual construction
  permit at `$667` a worker, the no-certificate letter, the discharge of lis pendens and the
  returned-check fee.
- **Anything charged by another authority** — Hudson County, the Municipal Utilities Authority, and
  the State's own licences and training fees.

## 6. Effective dates

- **Fees as modelled:** `effectiveFrom = 2013-09-11`. That is the last date the Uniform Construction
  Code block changed — Ord. 13-081, the amendment the codifier's consolidation carries inside M for
  the Department of Public Safety connection fee (the other, from 13 April 2005 by Ord. 04-154,
  covers the non-construction rows in M(7)). The City's base rates are older than that date and the
  consolidation does not date them row by row; the recorded date is therefore "no later instrument
  changed these rows" rather than "these rates began here", and it is described that way in the
  schedule's own notes.
- **Ordinance 26-051**, adopted on second reading 15 July 2026, revised Chapter 160
  comprehensively. It is recorded as a source because it **dates the schedule**: its attachment
  reproduces the chapter with the existing and the amended figure printed for each fee it changes
  — a marriage-record correction from `$20` to `$30`, a franchise petition from `$3,500` to
  `$10,000` — and the Uniform Construction Code block carries one figure per row throughout. That
  is the evidence, and it is the reason no 2026 date appears on any fee here. Under N.J.S.A.
  40:49-2 an ordinance takes effect twenty days after adoption unless it says otherwise.
- **The State regulation:** current through New Jersey Register Vol. 58 No. 16 (17 August 2026).

## 7. Open questions

- **Whether the City treats its 25% plan review as a prepayment or as an extra charge.** See §4.
  The State standard says prepayment; the City's row is silent. It is the largest single reading in
  this jurisdiction — 25% of every building permit — and it deserves a call to the Construction
  Code office.
- **What applies to an A-3 building.** See §4.
- **Which State surcharge amount the portal collects.** The code's sentence incorporating State
  changes by reference is a strong argument that it collects the State's current figures, and the
  model does; a filer comparing the site with an issued permit would settle it in one line.
- **Whether the alteration floors apply to trade permits.** M(1)(c) and M(1)(d) are written inside
  the building subcode and speak of "renovations, alterations or repairs"; the electrical and
  plumbing subcodes publish no floor of their own, so this site charges none on those pages. A
  small plumbing permit here can therefore be `$10.00`, which is unusual in this dataset.
- **The §160-1 M block's full amendment history.** The consolidation annotates only the rows that
  changed in 2005 and 2013; the base rates carry no dates. Anything older than the codifier's
  current supplement would need the City's ordinance archive rather than the code.
