# Newark, New Jersey — research record

**Status: published** (New Jersey, pass 11). Three permit pages: building, electrical and
plumbing.

- **Verification date:** 2026-09-25
- **Issuing authority:** City of Newark, Department of Engineering — Office of Uniform
  Construction Code, 920 Broad Street, Newark NJ 07102
- **Enabling law:** New Jersey's Uniform Construction Code, N.J.S.A. 52:27D-119 et seq. The
  *shape* of every municipal construction fee is fixed by **N.J.A.C. 5:23-4.18**, which requires
  the basic construction fee to be computed "on the basis of the volume of the building or, in
  the case of alterations, the estimated construction cost", plus a unit rate per plumbing
  fixture, per electrical device and per sprinkler head. The unit rates are the municipality's,
  and Newark's are in Chapter 7:2 of the City Code.

| Document | Where |
| --- | --- |
| Newark Municipal Code, Chapter 7:2 "Permits and Fees" — §7A:2-1 (payment, plan review), §7A:2-2 (how volume is computed), §7A:2-3 (the fee schedule: building, renovation and alteration, certificates and other permits, electrical subcode, fire protection subcode, plumbing subcode, elevators) | `https://ecode360.com/36645711` |
| The same chapter's building subcode as the codifier splits it | `https://ecode360.com/36645722` |
| N.J.A.C. 5:23-4.17, 4.18 and 4.19 — municipal enforcing agency fees, standards for municipal fees, and New Jersey State permit surcharge fees | `https://www.nj.gov/dca/codes/codreg/pdf_regs/njac_5_23_4.pdf` |
| DCA's index of the Uniform Construction Code subchapters | `https://www.nj.gov/dca/codes/codreg/ucc.shtml` |

## 1. The access problem, and how it was solved

`www.newarknj.gov` **cannot be read from this environment**: every request returns HTTP 403 to a
plain client, and the proxy route returns Cloudflare's "Just a moment…" challenge page instead of
content. That is the same class of failure that stopped the Idaho cycle (see
`../idaho/README.md`), with a different cause — Idaho's domains did not answer at all; Newark's
answer only to a browser.

The chapter itself was still readable, because the codifier that publishes Newark's code serves it
as plain HTML: `ecode360.com/36645711` returns the whole of Chapter 7:2, including the amendment
history of every section, and it is the source of record for every modelled amount. Two useful
consequences:

- **The amendment history is the dating instrument.** §7A:2-3 is annotated `amended 3-20-2024 by
  Ord. No. 6PSF-A, 03-20-2024`, immediately after a list of ten earlier amendments running back to
  1988. That date is what `effectiveFrom` records, and it is the only basis for saying the fees are
  current to 2024.
- **The City's own portal pages are metadata, not sources.** The department's URL is recorded in
  the seed so a reader can find the office, and no figure on this site comes from a page that could
  not be read. Nothing is cited for a rate that was not read.

`nj.gov` is reachable directly, which is what makes the State half of this pass possible: the
Department of Community Affairs publishes each subchapter of N.J.A.C. 5:23 as a PDF, and
`njac_5_23_4.pdf` carries its own revision date line — "including all Regulations adopted and
published through the New Jersey Register, Vol. 58 No. 16, August 17, 2026".

## 2. What the mechanism is

**Volume for new construction, estimated construction cost for alterations, and counts for the
trades.** Three mechanisms in one chapter, and the first of them is why this pass needed an engine
change: Newark prices a new building in **cubic feet**, which no basis in this dataset named
before.

| Schedule | Priced by |
| --- | --- |
| **Building subcode, new construction and additions** | Volume: `$0.02` a cubic foot for use groups A, F, I and S; `$0.03` for B, E, H, M, R and U. Plus a State surcharge line printed as `$0.016` a cubic foot. |
| **Building renovation and alteration** | Estimated cost of construction, per `$1,000`: `$28` for the first `$50,000`, `$21` from `$50,001` to `$100,000`, `$17` above `$100,000`. Plus a DCA administrative surcharge printed as `0.80` per `$1,000` "rounded to the nearest $1" and "as required by U.C.C. 5:23-4.19 (B)". |
| **Electrical subcode** | Receptacles and fixtures in blocks — first 50 `$58`, each additional 20 `$12`; motors and devices at `$58 / $115 / $575 / $863` by horsepower; transformers and generators on the same ladder by kilowatt; service panels, entrances and subpanels at `$81 / $460 / $1,150` by amperage. |
| **Fire protection subcode** | Sprinkler heads in six bands (`$75 / $138 / $252 / $683 / $945 / $1,208`), smoke and heat detectors in four (`$40 / $55 / $70 / $85`), pre-engineered systems `$106`, standpipes `$263`, kitchen hood exhaust and gas or oil fired appliances `$58`, incinerators and crematoriums `$420`. |
| **Plumbing subcode** | `$14` a fixture, piece of equipment or appliance — including appliances on the gas or oil piping — and `$75` a special device from a printed list. |
| **Certificates and other permits** | Certificates of occupancy by unit count, by floor area and by occupancy group; certificates of continued occupancy and of change of use `$138`; demolition `$144 / $403`; asbestos `$81` and lead `$161` abatement; signs `$1` a square foot to a `$690` maximum; siding and roofing for R-3/R-4/R-5 `$58`. |

Three charges attach to permits generally:

- **A non-refundable `$58` processing fee** "applied to all permits, due at the time of
  application", which the chapter then says "will be applied against the total permit fee" — and
  which is separately published as "Minimum Building Permit: $58", and again as the minimum fee of
  the electrical, fire and plumbing subcodes.
- **Plan review at 20% of the construction fee**, "paid at the time of submission of an
  application" and then "deducted from the amount of the fee due for a construction permit when
  same is issued". Not a surcharge.
- **The State permit surcharge**, which is a State amount collected locally (§5:23-4.19(a)) and
  whose printed figure in the chapter is out of date (see §4).

## 3. What is modelled

Three pages — building, electrical and plumbing — and 17 rules, all validating, every figure
asserted against the chapter.

- **Building:** both volumetric rates; the graduating alteration table; the `$58` floor; the State
  surcharge on the volumetric path and on the cost path, as a component of type `state_surcharge`
  so the part of the bill the City keeps none of is visible as its own line.
- **Electrical:** the block row for receptacles and fixtures; the three service, panel, entrance
  and subpanel bands, charged per device at the amperage entered; the `$58` floor; the State
  surcharge on the value of the work.
- **Plumbing:** `$14` a fixture; `$75` a special device; the `$58` floor; the State surcharge.

The four facts the rules are gated on:

- **`custom.use_group`** — one of the ten IBC use-group letters the chapter publishes, and the
  only thing that selects between `$0.02` and `$0.03`.
- **`custom.cubic_footage`** — the volume, on the new basis this pass added to the engine. A
  permit that supplies a floor area and no volume is left unpriced with the reason stated, not
  charged the cheaper rate.
- **`custom.building_alteration`** — switches the permit from the volumetric path to the cost
  path, and takes the volumetric rules out rather than adding to them.
- **`custom.special_devices`** — the subcode's own name for the listed devices that cost `$75`
  rather than `$14`.

## 4. Two readings, and why

**The alteration table graduates.** Newark prints it as a table — "Between $0 - $50,000 | $28;
$50,001 - $100,000 | 21; Over $100,000 | 17" — and the State model behind it is spelled out in the
municipalities whose ordinances write the bands as sentences. Northfield's §128-3B(1)(b) is the
clearest example found: "For the first $50,000 of estimated cost of work, the fee shall be $34 per
$1,000 … From $50,001 to and including $100,000, an **additional** fee in the amount of $26 per
$1,000 … From $100,001 estimated cost, an **additional** fee of $22 per each $1,000 … of the work
greater than $100,001" (`https://ecode360.com/33675513`). "Additional" is the whole argument: the
first fifty thousand is charged at the first rate however large the job is. Under a flat reading, a
$400,000 alteration would be $6,800.00; the graduating reading is $7,550.00, and both are asserted
in `tests/content/newark-seed.test.ts` at the band boundaries.

**The State surcharge is charged at the State's amount.** The chapter prints `$0.016` a cubic foot
for new construction and `0.80` per `$1,000` for alterations, and cites "U.C.C. 5:23-4.19(B)" for
the second. §5:23-4.19(b) now reads: "$0.00371 per cubic foot volume of new buildings and
additions… The fee for all other construction shall be $1.90 per $1,000 of value of construction",
with a minimum permit surcharge fee of `$1.00`. The regulation's own history shows the amount
moving `$0.0016 → $0.00265 → $0.00334 → $0.00371` a cubic foot and `$0.96 → $1.35 → $1.70 → $1.90`
per `$1,000` — which is what makes the chapter's figures read as older versions of the same State
fee rather than as a different fee. Since §5:23-4.19(a) has the enforcing agency collect the fee
and forward it to the Division of Codes and Standards, the City does not set it, and the site
charges the State's current amount while printing the City's on the same page. **If the City
collects its printed figures instead, every State-surcharge line here is wrong in a known
direction: too low by $0.01229 a cubic foot, and too high by $1.10 per $1,000 of alteration cost.**
This is the one open question worth a telephone call, and it is recorded on the page rather than
hidden in the model.

## 5. What is NOT modelled, and why

- **The fire protection subcode** in full. Transcribed in the JSON payload's descriptions and named
  on the building page with every amount; the sprinkler-head and detector tables need countable
  kinds this dataset does not have yet (`sprinkler_heads`, `detectors`, `standpipes`,
  `pre_engineered_systems`), and adding four kinds for one jurisdiction's second page was not this
  pass's job. This is the obvious next page for Newark.
- **Motors, electrical devices, transformers and generators.** Four published ladders priced by
  horsepower and kilowatts, which no input on this site collects. Named on the electrical page with
  all four amounts each.
- **The inspection charges on an existing building** in the electrical subcode — `$5` for up to five
  dwelling units, `$0.75` a unit to twenty-one, then `$20` plus `$0.50` a unit, and a square-foot
  scale for commercial buildings. Those are charges for an inspection certificate rather than for a
  construction permit.
- **The annual construction permit** (`$173` plus a `$161` State training registration fee), the
  **restricted-permit registration** (`$50`), the **annual electrical repair permit** (`$150` plus
  `$140`), and the **annual plumbing permit** (`$173` plus `$161`).
- **The elevator subcode**, which the chapter prices by N.J.A.C. 5:23-12.5 and 5:23-12.6 with a 40%
  administrative fee on the third-party vendor's charges.
- **The 20% reduction when a plan review is waived**, the **fee waiver for City-occupied
  properties** and the **waiver for non-profit developers of low and moderate income housing**.
- **Plan review itself**, deliberately: modelling a 20% row and then a permit fee would charge the
  same money twice. The page explains the deduction instead.
- **Everything charged by another authority** — Essex County, the Newark Watershed, and the State's
  own licences and training fees, of which only the permit surcharge is included.

## 6. Effective dates

- **Fees as modelled:** `effectiveFrom = 2024-03-20` (Ord. No. 6PSF-A), the amendment that §7A:2-3
  carries as its last.
- **The State regulation:** the PDF is current through New Jersey Register Vol. 58 No. 16
  (17 August 2026); §5:23-4.19's own history gives each surcharge amount its own effective date,
  and the rule is recorded with `documentDate` 2026-08-17 and no `effectiveFrom` rather than with a
  date invented for the current figure.
- The chapter's earlier amendments — 1988 through 2007, listed in the section's own annotation —
  are superseded for every row modelled here.

## 7. Open questions

- **Which State surcharge amount the Construction Official's software collects.** See §4. Both
  figures are on the page; the arguments for the State's are that the regulation sets the amount,
  that the City cites it by number, and that the City forwards the money rather than keeping it.
- **Whether an "addition" is ever priced on cost rather than volume.** Newark's block is headed "New
  Construction and Addition Fees" and prices additions per cubic foot, which is what N.J.A.C.
  5:23-4.18(c)1iii requires ("fees for additions shall be computed on the same basis as for new
  construction for the added portion"). A reader whose project is an addition *and* an alteration of
  the existing building is priced on both here, which is the combination rule §5:23-4.18(c)1iv
  states.
- **What the department does with a volume it cannot compute.** §5:23-4.18(c)1vii has the
  municipality charge a flat rate for "temporary structures and all structures for which volume
  cannot be computed, such as swimming pools and open structural towers", and Newark's chapter
  publishes no such flat row. A project in that shape is unpriced here and says so.
- **The 2024 amendment's own text.** It is cited by the codifier with its date and number but was
  not read: `newarknj.gov` is unreachable and the codifier does not republish ordinance bodies. If
  a rate and the ordinance ever disagree, the codifier's text is what this site follows.
