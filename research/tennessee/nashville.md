# Nashville, Tennessee — research record

First Tennessee jurisdiction. Nashville and Davidson County are one consolidated government, so
the "city" here is also the county, and one fee schedule covers both. The schedule is the Metro
Code's own fee text — sections 16.28.110 (building), 16.12.220 (plumbing), 16.16.400
(gas/mechanical) and 16.20.250 (electrical) — published by Metro Codes as a single PDF with ICC's
valuation data behind it.

Everything below was read on **2026-09-25**. Nothing is estimated.

## Why Tennessee, and why Nashville first

The process's first gate is verifiability, and Tennessee is the first remaining state where two
of its cities' primary sources are readable from this environment. Nashville answered 200 and its
fee schedule is a single PDF; Murfreesboro answered 200 with a council resolution that adopts
their whole schedule of fees (building, electrical, plumbing, gas, mechanical, grading). Memphis
and Franklin answer 403, and Knoxville's and Chattanooga's department pages did not link fee
documents from the paths tried. Nashville is the state's largest market and its schedule is the
state's model — the electrical table below is the same subsections-and-rates shape Knoxville,
Chattanooga and Memphis all use — so the state opens here.

## Sources actually read

| Key | Instrument | How read |
| --- | --- | --- |
| S1 | **Codes Fee Schedule** — `nashville.gov/sites/default/files/2025-12/Building-Permit-Fee-Scheudle-2025.pdf` (the City's own filename) | `curl` + `pdftotext -layout`; 393 lines, read end to end |
| S2 | **Codes publications list** — `nashville.gov/departments/codes/construction-and-permits/publications-list` | `curl` + HTML strip; the page that links the schedule as the City's fee schedule |
| S3 | **BL2022-1215** — the fee legislation, cited on the schedule with its Legistar link | Legistar report URL captured from the schedule's own text |
| S4 | **BL2022-1254** — the Codes Tech Fee legislation, cited beside it | Same |
| S5 | Metro Codes construction-and-permits hub and the e-permits pages | `curl` + HTML strip; department context, the drawings-requirements PDF, and the permit-history lookup |

The schedule prints **no effective date of its own**. It carries the City's `2025-12` folder date
in its URL and reprints ICC's *Building Valuation Data, February 2025*; the ordinances it cites
(BL2022-1215, BL2022-1254) are its enactment. The date carried for the rules is **2025-12-03**
(the file's own publication timestamp, `?ct=1764795572`), with the ordinance dates noted as the
better anchor if a reader needs the fees' exact start.

## The building fee, as read (S1, 16.28.110)

The schedule opens with the mechanism, in four lines:

> The total permit cost for a building permit includes:
> Zoning Examination Fee of $25
> Building Valuation Fee: See below (Valuation Table is on last page)
> Codes Tech Fee: 10% of the Building Valuation Fee
> Building Plan Review Fee: See below

**A.1 Residential — one rate.** "Building Permit Fees for Residential Construction based on
valuation. Residential construction includes one-family and two-family residential construction
and townhouses as defined by the 2018 Edition of the International Residential Code, but not
multi-family construction shall be $5.00 per $1,000 total valuation."

**A.2 Commercial and all other construction — four bands**, each "for the first $X plus $Y for
each additional thousand or fraction thereof, to and including $Z":

| Total valuation | Fee, as printed |
| --- | --- |
| $0.00 – $2,000.00 | $40.39 |
| $2,000.01 – $50,000.00 | $40.39 + $6.92 per $1,000 |
| $50,000.01 – $100,000.00 | **$372.71** + $5.57 per $1,000 |
| $100,000.01 – $500,000.00 | **$651.38** + $4.19 per $1,000 |
| $500,000.01 and up | **$2,326.84** + $2.79 per $1,000 |

The three bolded bases are **not** the arithmetic of the band beneath them:

- band 2's rate reaches $40.39 + 48 × $6.92 = **$372.55** at $50,000, and band 3 prints $372.71;
- band 3's rate reaches $372.71 + 50 × $5.57 = **$651.21** at $100,000, and band 4 prints $651.38;
- band 4's rate reaches $651.38 + 400 × $4.19 = **$2,327.38** at $500,000, and band 5 prints
  $2,326.84 — **fifty-four cents lower**.

All three are charged as printed. This is the same finding as Minneapolis's two cents, Saint
Paul's $23 and Saint Paul's plan check's $7.22, now at three seams in one ladder.

**B–F, H–I — the other building rows.** Moving a building or structure $252.00; signs "determined
from Section A.2 above using the schedule for commercial construction" with a $55.00 minimum;
$55.00 for each trailer or mobile home; $55.00 for a use and occupancy permit or certificate of
compliance where no building permit issued; **$50.00 re-inspection**; a $50.00 use verification
letter and a $40.00 beer and liquor distance letter.

**G — plans examination.** The plan review, which is the fourth component of the total:

| Total valuation | Plans examination fee, as printed |
| --- | --- |
| $0.00 – $275,000.00 | one-half of the building permit fee (subsection A) |
| $275,000.01 – $5,000,000.00 | $1,338.54 + $0.18 per $1,000 |
| $5,000,000.01 and above | $2,181.82 + $0.07 per $1,000 |

Read with the building table this produces the dataset's sharpest seam: at $275,000 of valuation
the building permit fee is $651.38 + 175 × $4.19 = **$1,384.63**, so the plans examination fee is
**$692.32**; at $275,000.01 the printed band charges **$1,338.72**. A 93% step for one dollar. And
the top band's printed base of $2,181.82 is $7.22 below the $2,189.04 the band beneath it reaches
at $5,000,000. Both charged as printed.

G.2 is the exemption, quoted in full because it is the reason residential permits cost what they
cost:

> Exceptions from plans examination fee: a. One- and two-family dwelling building permits;
> b. Townhouse building permits; c. Demolition permits; d. Blasting permits.

G.1's closing sentence is the refund rule: "in no case shall this be refunded even if there is not
a subsequent building permit issued."

**The valuation paragraph** (repeated in the residential section) defines the basis: "Valuation is
defined as the cost of construction including structural, electrical, plumbing, mechanical, gas,
interior finish, site preparation and development, architectural and design fees, overhead, and
profit. The valuation is based on the contract amount. The City reserves the right to require a
copy of the contract should the valuation be less than seventy-five percent (75%) of the national
average for the type of construction appearing in the Building Valuation Data -- February 2024, or
the most recent edition, published by the International Code Council." The schedule's last pages
are that BVD table (February 2025 edition), with per-square-foot costs by occupancy group and
construction type and a worked permit-fee-multiplier example.

## The plumbing fee, as read (S1, 16.12.220)

```
Minimum fee (each permit) ... $75.00
*Plumbing fixtures (each fixture) ... $11.00
Each additional building drain ... $32.00
Sewer connection ... $80.00
Water service connection ... $80.00
Septic tank and disposal field ... $80.00
Hot water heater ... $43.00
Reinspection fee (each) ... $50.00
```

with the footnote that decides the count — "* Each fixture outlet shall be counted as one fixture
in figuring the total permit fee, whether or not the fixture is actually set at the time the
plumbing system is installed." — and subsection C's list of thirty-two classifications that each
count as one fixture: area drains, backflow preventers, baptisteries, bathtubs, boiler blowoff
tanks, combination sink and tray, commercial icemakers, dental lavatory, dental unit or cuspidor,
diluting tanks and interceptors, dishwasher (fixed unit), disposal units (commercial), drinking
fountains, floor drains, grease traps and interceptors, kitchen sinks, lavatory, pools/fountains/
aquaria, roof drains, shower drains, slop sinks, "Solar panels when connected to plumbing system",
sump pumps, swimming pools, urinals, washers (clothes, domestic, fixed drains), washers
(commercial, fixed drains), water closets, water tanks.

**Reading.** The minimum is a floor, not a base: a $43.00 hot water heater replacement pays
$75.00. Each of the four infrastructure rows is its own count — a building drain is not a fixture
and not the sewer connection it feeds — and the water service connection is counted apart from the
sewer connection even though both cost $80.00.

## The electrical fee, as read (S1, 16.20.250)

Subsections C.1–C.14, verbatim in structure:

1. Lighting circuits / outlets ≤130 V: **10 or fewer $6.00**; each additional over 10 **$1.00**.
2. Motors and generators: one horsepower or less **$2.00**; two to 10 hp **$8.00**; over 10 hp
   **$14.00**; motor generator sets **$20.00**.
3. Electric ranges: residential **$20.00**; commercial **$25.00**.
4. Water heaters: residential **$15.00**; commercial **$20.00**.
5. Electric heat and electrically heated appliances other than ranges and water heaters: 1–5 kW
   **$8.00**; 5–10 kW **$14.00**; over 10 kW **$20.00**.
6. Electric dryers: residential **$10.00**; commercial **$14.00**.
7. Electric signs (excluding service), each **$20.00**.
8. Service, new installation, increasing size or relocation, **per meter $12.00**.
9. Any wiring, device, apparatus, appliance or equipment not specifically covered (disconnects,
   220 V receptacles, …), each **$9.00**.
10. Distribution, lighting or switch panels: ≤200 A **$10.00**; 201–400 **$20.00**; 401–800
    **$30.00**; 801–1600 **$50.00**; 1601–3000 **$75.00**; 3001–6000 **$145.00**; each additional
    100 amperes or fraction **$3.00**.
11. **Minimum fee (each permit) $75.00**, with its long parenthesis defining what the permit
    covers (new systems, additions, alterations, repairs, fixtures, equipment, devices,
    appurtenances, temporary services).
12. Reinspection fee (each) **$50.00**.
13. Service releases: residential one- or two-family except condominium units, each service riser
    **$75.00**; residential more than two-family and condominium units, each riser **$75.00**;
    commercial or industrial, each riser **$102.00**.
14. Emergency re-connection of service, each **$102.00**.

Subsection B is the penalty: "In addition to any other penalty imposed for failure to obtain a
permit where electrical work of any type, for which a permit is required, is commenced before a
permit is issued, the permit fees shall be tripled."

**Why the class-based rows are not modelled.** Subsections C.2–C.6 and C.10 price each *item* by
that item's own rating — a motor by horsepower, a panel by amperage class, electric heat by
kilowatts. A permit can carry items of several classes at once (a 400-ampere distribution panel
and six 100-ampere branch panels is the ordinary commercial job), so a single class fact cannot
represent it, and this engine's per-unit facts price one count at one rate. The rows are
transcribed above in full and named on the page; approximating them with one class would misprice
the common case, which is the error the dataset's own rules exist to prevent. The next generic
shape this engine needs — a count priced by the counted item's class — is named here as the
reason.

## The gas/mechanical fee, as read (S1, 16.16.400, transcribed only)

Minimum fee (each permit) $75.00; gas and/or mechanical appliance in excess of the first —
residential **$11.00**, commercial **$16.00**; gas meter connection $11.00; hot water heater
$21.00; fuel piping (underground fuel lines) $50.00; re-inspection fee $50.00; and, in addition,
heating, ventilating, ductwork, air-conditioning and refrigeration systems at **$32.00 per
100,000 Btuh or fraction thereof** of the total input of all appliances. Subsection C lists the
classifications that count as appliance — forty-plus kinds, from air-conditioning units and air
handling units to unit heaters and water heaters. This is a permit type of its own (gas/mechanical)
and is not one of the three pages published here; it is recorded so the next pass or another city's
comparison starts from the text.

## Readings this dataset depends on

1. **Four components, four bases.** Zoning examination ($25, every permit, `other`), building
   valuation fee (`base`, reads the valuation), codes tech fee (10% of the valuation fee, reads
   the base subtotal), plan review (reads the base subtotal again, in two different shapes).
   Keeping the zoning fee out of the base is what makes the 10% right.
2. **Three printed ladder seams, charged as printed** — $372.71/$372.55, $651.38/$651.21,
   $2,326.84/$2,327.38.
3. **Residential is a branch, and multifamily is not in it.** $5.00 per $1,000 for one- and
   two-family dwellings and townhouses; the commercial ladder for everything else, which the
   section defines by exclusion.
4. **No plans examination on a dwelling.** Subsection G.2 lists the exemptions, and the calculator
   gates the plan review to commercial work.
5. **The plan review turns over at $275,000** and its top band's base steps down $7.22.
6. **Every $75 floor is a shortfall**, on both trade tables.
7. **The water heater is two different prices on two permits** — $43.00 on plumbing, $21.00 on
   gas/mechanical — and both are real.

## Effective dates on record

| Instrument | Date carried | Why |
| --- | --- | --- |
| Codes Fee Schedule | **2025-12-03** | No date printed; the City's own file path is `2025-12` and the file's publication timestamp is 2025-12-03. The valuation data inside is ICC's February 2025 edition. |
| BL2022-1215 / BL2022-1254 | (cited, not dated) | The ordinances are the enactment; their passage dates would replace the above. |
| Verification | **2026-09-25** | Every source re-read this day. |

## Not modelled (named on the schedule, never papered over)

- **The electrical class rows** — motors and generators, ranges, water heaters, dryers, electric
  heat, the catch-all wiring row and the panel ladder (see above for the reason).
- **The gas/mechanical permit** — its own permit type, transcribed in full.
- **Moving ($252.00), signs, trailers ($55.00), use and occupancy ($55.00), the use verification
  letter ($50.00) and the beer and liquor letter ($40.00)** — building-permit-adjacent rows for
  other instruments.
- **Re-inspection fees ($50.00 plumbing and electrical)** — charged when an inspection is
  repeated; the electrical one is carried as an inspection component, the plumbing one named.
- **The tripling penalty** — a multiplier on the fee, not a fee.
- **Metro Water Services taps, meters and sewer availability** — the utility's own charges.

## Open questions

1. **The passage date of BL2022-1215.** The schedule cites the ordinance but prints no date; the
   Legistar record is the place to read it, and it would replace the URL-derived effective date.
2. **Whether the residential rate applies to townhouses above three stories.** A.1 points at the
   2018 IRC's definitions, and the IRC's townhouse definition has a height limit that the BVD's
   own notes do not resolve; a tall townhouse could fall to the commercial ladder.
3. **Whether the three ladder seams are deliberate or drafting drift.** Three bands in a row whose
   printed base is not the arithmetic below them is the kind of pattern that a codifier's
   amendment creates; the 2022 ordinance text would show whether the bases were set as printed.
4. **How a permit with panels of several amperage classes is priced.** The panel row is per panel
   by class; whether the City's e-permits system sums classes or charges the largest is a question
   for Metro Codes, and it is the question that decides how the engine should grow next.
5. **Whether the plans examination fee's $275,000 seam is intended.** A 93% step up for one dollar
   of valuation is either a deliberate discouragement of mid-size projects or a drafting artifact
   of two fee tables stitched together; nothing on the sheet says which.
