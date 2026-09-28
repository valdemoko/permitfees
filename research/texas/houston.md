# Houston, Texas — permit fee research

**Status:** research complete for the structural building, electrical, plumbing and
mechanical permit fee schedules. **Implemented in Phase 1:** the structural,
electrical and plumbing schedules are seeded and published. Not yet extracted: the
square-footage valuation table (§118.2.1 / IBC Table 601, Ord. No. 2023-907) and
the full §118.5.1 plumbing list.

**Research date:** 2026-09-23
**Researcher:** Permit Fee Intelligence
**Rule:** no figure enters the database without a primary source recorded below.

**Two findings from this pass changed the architecture**, and both came from the
data rather than from design review:

- §5.2 — Houston publishes rates in *dollars per $1,000*, which is not an integer
  number of basis points. This added the `per_thousand` primitive.
- §5.3 — modelling Houston's plumbing fixture fee with that same primitive made it
  wrong by a factor of 1,000. This added a free-allowance option to `per_unit`.

Both were caught by asserting the city's own published figures against the engine.
Neither would have surfaced from reading the schedule alone.

---

## 1. Authority

| Field | Value |
| --- | --- |
| Issuing authority | City of Houston |
| Department | Houston Public Works — Houston Permitting Center |
| Address | 1002 Washington Ave., Houston, TX 77002 |
| Phone | 832.394.9000 |
| Authority kind | `city` |
| Governs | Property **inside the Houston city limits** |

**Decision — jurisdiction type.** Houston is modelled as a `city` jurisdiction
under the `texas` state. It is *not* merged with Harris County.

**Why this matters.** A Houston mailing address is not necessarily inside the city
limits. Unincorporated Harris County issues its own permits, under its own fee
order, and its fees are not Houston's. Merging the two would produce confidently
wrong answers for a large share of the metro. Harris County will be modelled
separately, as its own `county` jurisdiction, in a later phase. The Houston pages
must state the limit plainly.

---

## 2. Official sources

### S1 — City-Wide Fee Schedule (primary)

| Field | Value |
| --- | --- |
| Title | City-Wide Fee Schedule |
| Publisher | City of Houston |
| URL | https://cohweb.houstontx.gov/fin_feeschedule/default.aspx |
| Source type | `municipal_website` |
| Authority kind | `city` |
| Issuing authority | City of Houston |
| Effective date | Per-fee, via an `As Of` column on every row |
| Last verified | 2026-09-23 |
| Primary | Yes |

**Relevant information.** The authoritative, current fee schedule, covering all
City departments. Every fee row carries three things we depend on:

1. **Statutory authority** — e.g. `Bldg. Code Sec. 118.2.1`. This tells us exactly
   which code section sets the fee, which is what makes the rule auditable.
2. **Amount** — the published dollar figure, or `Calculation` where the code
   defines a formula rather than a number.
3. **`As Of` date** — the date the current amount took effect, per row. Most
   building-related rows show `01/01/2026`.

**Data extracted.** The `HPW` department section (951 fee rows) was read in a real
browser. The `Bldg. Code Sec. 118.x` subset is the building permit fee schedule
and is reproduced in section 4 below.

**Ambiguity A1 — the content is not statically retrievable.** The page renders its
tables client-side, so a plain HTML fetch returns only the page shell. The figures
below were read from the interactive table itself. Until we have an automated
capture, every extraction is a manual, human-checked step. That is acceptable at
this scale and is recorded honestly rather than hidden.

**Ambiguity A2 — there is no single "effective date" for the schedule.** Dates are
per row. A page therefore cannot claim "the schedule is current as of X"; it can
only claim "as of X, this rule read Y". The data model already supports this
(effective dating is per rule, not per document), and the page copy must not
overstate it.

**Decision.** S1 is the primary source for every fee rule in this research. Each
rule records `effective_from` from its `As Of` date, and cites its code section in
the rule description so a reader can find it in the schedule themselves.

### S2 — Houston Building Code, Chapter 10, Article II, Division 2, Section 118

| Field | Value |
| --- | --- |
| Title | Houston Amendments to the Building Code — fee schedule |
| Publisher | City of Houston / Municipal Code Corporation |
| URL | https://library.municode.com/tx/houston/codes/code_of_ordinances |
| Source type | `municipal_code` |
| Authority kind | `city` |
| Primary | Yes |

**Relevant information.** The ordinance text behind the schedule: the formulas,
conditions and defaults that the schedule's `Amount` column abbreviates. Needed
wherever the schedule says `Calculation` rather than giving a figure — most
importantly HVAC §118.3.1 (`Base Charge plus 2% of Unit Valuation`) and the
valuation method in §118.2.1.

**Status.** Identified but **not yet read.** The schedule gives us enough to
implement the structural, electrical, plumbing and mechanical schedules
faithfully; the code is required before we implement the HVAC
percentage-of-valuation rule, because publishing "2% of unit valuation" without
knowing what the code defines as unit valuation would be publishing a formula we
cannot apply.

### S3 — Houston online permit fee estimators

| Field | Value |
| --- | --- |
| Title | Commercial / Residential Building Permit Fee Estimator |
| Publisher | City of Houston Public Works |
| URLs | https://hpwolptest.houstontx.gov/BuildingPermitFee/index.html (commercial), `.../index2.html` (residential) |
| Source type | `official_calculator` |
| Authority kind | `city` |
| Last verified | 2026-09-23 |
| Primary | Yes |

**Relevant information.** Two things of real value, both quoted verbatim below
because the wording is itself a published definition:

> **Valuation.** The total cost of construction to the end user, excluding the
> land purchase costs and the overhead attributed to the land purchase. The value
> of donated goods and services is included.

> **DISCLAIMER:** The fee calculated above is approximate and based solely on the
> information provided. Valuations will be compared to recognized standards. This
> fee does not include sidewalks, alarms, or other permit type fees.

And the exclusion list, which is the single most useful piece of content on the
page for our purposes:

> Other Departments' Fees — Fees associated with construction permits that are
> administered by other City Departments/Sections are not included in the building
> permit fee. Below is a list of City Departments/Sections that may impose
> additional fees, Planning & Development Department, Utility Planning & Analysis
> Branch, Flood Plain Management Section, Engineering Services Section, Health
> Department, Administration & Regulatory Affairs Department (Commercial permits).

**Decision.** Use S3 for two things and two things only: the official definition of
"valuation", and the authoritative list of what the building permit fee excludes.
Both go on the Houston pages verbatim, attributed. The estimators' own numbers are
not used as a source — we compute from the schedule so the arithmetic is
inspectable.

### S4 — City of Houston Code of Ordinances, Section 1-14 (administrative fee)

| Field | Value |
| --- | --- |
| Publishing note (on S1) | "The fees listed in this schedule may be subject to an administrative fee per Code Section 1-14. Check with the City Department under which the fee is listed." |
| Amount as scheduled | `$33.56`, As Of `01/01/2026` |
| Also scheduled as | `Bldg. Code Sec. 118.1.1 — Permit or License Administrative Fee: $33.56` |

**Relevance.** A general administrative fee may sit on top of a permit fee, and the
schedule itself tells the reader to ask the department whether it applies.

**Ambiguity A3.** The word "may" is the city's, not ours. We cannot determine from
the published schedule alone which transactions attract it.

**Decision.** Record it as a separate `surcharge` component with a condition-free
rule but **exclude it from the default calculated total**, and surface it on the
page as "an administrative fee may apply — see §1-14". Presenting it as certain
would overstate; omitting it entirely would hide a real cost. The page says which
choice we made and why.

---

## 3. The valuation mechanism (answers the ICC question directly)

The city does **not** simply accept a contractor's stated valuation, and it does
not use one generic regional table. Houston defines its own:

| Field | Value |
| --- | --- |
| Section | `Bldg. Code Sec. 118.2.1` together with `602.1–602.5`, `Table 601 (Building Construction Type)` |
| Adopting ordinance | **Ord. No. 2023-907** |
| Rows in schedule | 34 per construction type (types 602.1 through 602.5), 17 for 602.4 |
| Establishes | Valuation from **building construction type**, i.e. a square-footage × type table |
| Statute as displayed | `Bldg. Code Sec. 118.2.1, 602.1, Table 601 (Building Construction Type); Ord. No. 2023-907` |

**What this means for the product.**

1. **There is no ICC BVD to import here.** Houston codified its own construction-type
   valuation table in 2023. Implementing an ICC valuation module for Houston would
   be inventing a mechanism the city does not use — precisely the generic
   approximation the project is built to avoid.
2. **The mechanism is square footage × construction type**, so it is expressible
   with the existing `tiered_table` primitive once the table is extracted, with
   `basis: square_footage` and a condition on `custom.construction_type`.
3. **It is a separate module, not an engine change.** Valuation *derivation* is a
   distinct concern from fee *calculation*: it turns user inputs into a valuation,
   which the fee engine then consumes unchanged. That is the boundary the
   architecture already anticipated.

**Status: identified, not extracted.** The 34×5 rows are in the schedule and are
the next research task. Until they are captured and tested, no page may claim to
derive valuation from square footage, and `custom.construction_type` conditions
must not be written.

---

## 4. Data extracted

All amounts below are quoted from the City-Wide Fee Schedule (S1) as read on
2026-09-23. `As Of` is `01/01/2026` for every row in this section.

### 4.1 Minimum, administrative and inspection fees — §118.1

| Code section | Description | Amount |
| --- | --- | --- |
| 118.1.1 | Permit or License Administrative Fee | $33.56 |
| 118.1.2 | Fee or Deposit Fee Receipt when issued by the building official | $33.56 |
| 118.1.3 | Minimum Permit Fee for all permits except Plumbing | $91.06 |
| 118.1.3 | Plumbing Minimum Permit Fee | $97.56 |
| 118.1.3 | Named separately for: Structural, Electrical, HVAC Equipment, Boiler permit, Boiler Installation, Elevator permit, Occupancy, Signs, Electronic locks | $91.06 each |
| 118.1.5 | Re-Inspection Fee | $94.00 |
| 118.1.6 | Specially Requested Inspection during working hours, per day | $322.27 |
| 118.1.7 | Emergency Inspection Base Charge, up to 4 hours | $201.41 |
| 118.1.7 | Emergency Inspection — each hour or fraction above 4 hours | $47.00 |
| 118.1.8 | Inspection and Plan Review Outside Normal Working Hours, base up to 4 hours | $322.27 |
| 118.1.8 | Inspection and Plan Review Outside Normal Working Hours, per hour above 4 | $83.91 |
| 118.1.9 | Minimum Fee for Inspections Outside of Jurisdiction, per person (plus IRS mileage rate) | $322.27 |
| 118.1.10(1) | Approved fabricators and certifying agent — inspection | $604.26 |
| 118.1.10(2) | Approved fabricators — verifying and approving a fabricator | $671.40 |
| 118.2.1(3) | Incinerator Inspection | $94.00 |
| — | City Engineer Plan Review: administrative fee on submission, and on any update or revision | $134.28 |
| — | City Engineer Plan Review: per plan sheet, first review and any revision | $96.67 |
| — | City Engineer Plan Review: per additional plan sheet added after first review | $96.67 |

Statutory authority for the City Engineer plan review items:
`City Code Ch. 2, Article VIII, Sec. 2-283; Ord. No. 2005-820 and Ord. No. 2011-1168`.

### 4.2 Structural building permit fee — §118.2.1

This is the flagship schedule. Houston publishes it as **nine brackets**, each as a
pair of rows: a *Base Charge* (the fee at the bracket floor) and a *rate per
additional $1,000 of valuation, or fraction thereof, above the bracket floor*.

| Valuation range | Base charge | Rate per additional $1,000 (or fraction) | Base charge applies to first |
| --- | --- | --- | --- |
| $0.01 – $7,000 | $47.00 | — (flat) | — |
| $7,001 – $150,000 | $47.00 | $5.36 | $7,000 |
| $150,001 – $200,000 | $815.07 | $5.03 | $150,000 |
| $200,001 – $300,000 | $1,066.86 | $4.70 | $200,000 |
| $300,001 – $500,000 | $1,536.83 | $4.36 | $300,000 |
| $500,001 – $1,000,000 | $2,409.66 | $4.02 | $500,000 |
| $1,000,001 – $5,000,000 | $4,423.87 | $3.68 | $1,000,000 |
| $5,000,001 – $50,000,000 | $19,194.73 | $2.00 | $5,000,000 |
| $50,000,001 and up | $109,834.09 | $1.34 | $50,000,000 |

**Formula, as the city states it:**

```
fee = Base Charge + Rate × ceil((valuation − bracket floor) / $1,000)
```

The `ceil` is the city's: *"or fraction thereof"*. It is not cosmetic — for a
valuation of $150,000.01 the chargeable amount above $7,000 is $143,000.01, which
rounds up to 144 increments.

**Ambiguity A4 — the base charges are not internally consistent. (Important.)**

Chaining one bracket into the next does not reproduce the published base charge:

| Boundary | Chained from previous bracket | Published base charge | Difference |
| --- | --- | --- | --- |
| $150,000 | $47.00 + 5.36 × 143 = $813.48 | $815.07 | +$1.59 |
| $200,000 | $815.07 + 5.03 × 50 = $1,066.57 | $1,066.86 | +$0.29 |
| $300,000 | $1,066.86 + 4.70 × 100 = $1,536.86 | $1,536.83 | −$0.03 |
| $500,000 | $1,536.83 + 4.36 × 200 = $2,408.83 | $2,409.66 | +$0.83 |
| $1,000,000 | $2,409.66 + 4.02 × 500 = $4,419.66 | $4,423.87 | +$4.21 |
| $5,000,000 | $4,423.87 + 3.68 × 4,000 = $19,143.87 | $19,194.73 | +$50.86 |
| $50,000,000 | $19,194.73 + 2.00 × 45,000 = $109,194.73 | $109,834.09 | +$639.36 |

**Cause.** Houston adjusts permit fees annually by a small percentage — the city
published a 0.276392% increase on 1 January 2021 as an example of the practice —
and each bracket's base charge and rate are adjusted and rounded independently.
Over a decade of compounding, the brackets drift apart. The drift is the city's,
not an error in our reading.

**Decision — do NOT reconcile them.** Each bracket is modelled as its own rule
using the **published** Base Charge and the **published** rate, verbatim. That
reproduces the city's own arithmetic exactly, for any valuation. Recomputing a base
charge from the neighbouring bracket would produce numbers the permit office will
not match — the worst possible outcome for this product.

**Ambiguity A5 — what happens between $7,000 and $7,000.01.** The published
brackets are `$0.01–$7,000` (flat $47.00) and `$7,001–$150,000` (base + rate). The
gap from `$7,000.01` to `$7,000.99` is not addressed by the dollar-rounded
ranges. **Decision:** model the brackets in cents on a half-open interval,
`[0, $7,000.00]` flat and `($7,000.00, …]` base+rate, so there is no gap and no
overlap at any cent value. The condition boundary is documented in the rule.

### 4.3 Other structural permits — §118.2.1

| Description | Amount | Notes |
| --- | --- | --- |
| Building Demolition — Base Charge for first story | $94.00 | |
| Building Demolition — each additional story above the first | $47.00 | |
| Incinerator permit | $100.71 | |
| Prefabricated Fireplace permit | $20.14 | |
| Sand blasting or water blasting permit | $47.00 | |
| Grading permit | $47.00 | |
| Heliport / Helistop — Construction Permit | $939.96 | |

### 4.4 Electrical permit fee — §118.6

| Code section | Description | Amount |
| --- | --- | --- |
| 118.6.1 | Electrical Meter Loop and Service up to 50 kW | $94.00 |
| 118.6.1 | Electrical Meter Loop and Service, 51–250 kW | $100.71 |
| 118.6.1 | Electrical Meter Loop and Service, over 250 kW | $107.42 |
| 118.6.1 | Electrical Panel with 8 or more circuits, each | $9.39 |
| 118.6.1 | Electrical Outlet — per outlet | $1.34 |
| 118.6.1 | EV Charging Outlet — Level 1 | $94.00 |
| 118.6.1 | EV Charging Outlet — Level 2 | $100.71 |
| 118.6.1 | EV Charging Outlet — Level 3 | $107.42 |
| 118.6.2 | Lighting or appliance — per fixture | $1.34 |
| 118.6.2 | Electrical Range — per receptacle | $4.70 |
| 118.6.2 | Clothes Dryer — per unit | $4.70 |
| 118.6.2 | Stove Top — per unit | $4.70 |
| 118.6.2 | Oven — per unit | $4.70 |
| 118.6.2 | Garbage Disposal — per unit | $4.70 |
| 118.6.2 | Dishwasher — per unit | $4.70 |
| 118.6.2 | Window A/C receptacle — per unit | $4.70 |
| 118.6.3 | Motor up to 1 HP or kW | $4.02 |
| 118.6.3 | Motor over 1 and up to 10 HP or kW | $11.41 |
| 118.6.3 | Motor over 10 HP/kW — Base Charge | $8.05 |
| 118.6.3 | Motor over 10 HP/kW — each additional HP/kW over 10 (in addition to Base Charge) | $1.81 |
| 118.6.4 | Shop inspection of electrical signs 0–5 kVA — Base Charge | $47.00 |
| 118.6.4 | Shop inspection of electrical signs — each additional kVA over 5 | $10.73 |
| 118.6.4 | Installation inspection of electrical signs 0–5 kVA — Base Charge | $47.00 |
| 118.6.4 | Installation inspection of electrical signs — each additional kVA over 5 | $10.73 |
| 118.6.5 | Ball park / parking lot light poles — Base Charge for 1st pole | $94.00 |
| 118.6.5 | each additional pole over 1 | $47.00 |
| 118.6.5 | Temporary saw poles, per installation | $94.00 |
| 118.6.5 | Temporary Cut-In made permanent | $94.00 |
| 118.6.5 | Reconnection Fee | $94.00 |
| 118.1.3 | Electrical permit: Minimum Permit Fee | $91.06 |
| Elect. Code 301.4 | Annual Maintenance permit, per premises | $272.62 |

### 4.5 Plumbing permit fee — §118.5

| Code section | Description | Amount |
| --- | --- | --- |
| 118.5.1 | Manufactured home inspection fee (where no state inspection has been made) | $94.00 |
| 118.5.2 | Furnace installation (non-duct) — Base Charge for first furnace | $34.24 |
| 118.5.2 | each additional furnace on the same permit | $11.41 |
| 118.5.2 | Floor furnace, non-duct, each | $47.00 |
| 118.5.2 | Incinerators: gas fired with 2 burners or more | $80.56 |
| 118.5.2 | Infrared heaters — Base Charge for 1–2 heaters | $34.24 |
| 118.5.2 | each additional heater above 2 under the same permit | $11.41 |
| 118.5.3 | Yard light or BBQ grill — Base Charge for first opening | $34.24 |
| 118.5.3 | each additional opening above one | $11.41 |
| 118.5.4 | Wall heater — Base Charge for one heater | $34.24 |
| 118.5.4 | each additional heater above one on the same permit | $11.41 |
| 118.5.4 | Gas steam radiator — Base Charge for one | $47.00 |
| 118.5.4 | each additional unit above one on the same permit | $11.41 |
| 118.5.4 | Commercial oven installation | $53.71 |
| 118.5.4 | Commercial dryer installation | $47.00 |
| 118.5.4 | **Plumbing fixture — Base Charge for 1 to 3 units** | $34.24 |
| 118.5.4 | **each additional fixture over 3 on the same permit** | $11.41 |
| 118.5.4 | Warm-air circulator (gas non-duct) — Base Charge for 1–3 units | $47.00 |
| 118.5.4 | each additional unit above 3 | $11.41 |
| 118.5.4 | Tie to curb inlet / storm sewer | $87.27 |
| 118.5.4 | Manholes, each | $87.27 |
| 118.5.4 | Roof drain or outside downspout connection — Base Charge for 1–2 | $34.24 |
| 118.5.4 | each additional above 2 | $11.41 |
| 118.5.4 | Catch basin or outside area drain — Base Charge for 1–2 | $34.24 |
| 118.5.4 | each additional above 2 | $11.41 |
| 118.5.4 | Sewer connection, each | $53.71 |
| 118.5.4 | Ground-in plumbing for shell building — Base Charge up to 3,000 sq ft | $47.00 |
| 118.5.4 | each additional 1,000 sq ft or portion thereof above 3,000 sq ft | $21.48 |
| 118.5.4 | Septic tank or individual sewage treatment plant, each | $53.71 |
| 118.5.4 | Disconnect and plug main sewer connection | $94.00 |
| 118.5.4 | Tanks (non-septic) up to 1,000 gal | $94.00 |
| 118.5.4 | Tanks (non-septic) 1,001–6,000 gal | $114.13 |
| 118.5.4 | Tanks (non-septic) 6,001–15,000 gal | $140.99 |
| 118.5.4 | Tanks (non-septic) 15,001–30,000 gal | $201.41 |
| 118.5.4 | Tanks (non-septic) over 30,000 gal | $228.28 |
| 118.1.3 | Plumbing Minimum Permit Fee | $97.56 |

**Not yet extracted.** `Bldg. Code Sec. 118.5.1; Ord. No. 2011-547` has **16**
further rows in the schedule which are not in the table above. They must be read
before the plumbing page can claim completeness.

### 4.6 Mechanical / HVAC permit fee — §118.3

| Code section | Description | Amount |
| --- | --- | --- |
| 118.3.1 | HVAC — Permit Fee Base Charge | $94.00 |
| 118.3.1 | HVAC Permit — Base Charge plus 2% of Unit Valuation | `Calculation` |
| 118.3.1(1) | Ventilating systems or heating-only systems (other than boilers) — Base Charge plus 2% of Unit Valuation | `Calculation` |
| 118.3.1(2) | Repairs or alterations to an existing heating/ventilating/A-C/refrigeration system — Base Charge plus 2% of Valuation | `Calculation` |
| 118.3.1(2) | Repairs or alterations to duct/grill in lease space where total valuation is less than $500 — Base Charge | $47.00 |
| 118.3.2 | Temporary Operation Inspection | $47.00 |
| 118.3.3 | Permits for local vents, central vacuum system and ventilation fans up to 2,000 cfm | $94.00 |
| 118.3.4 | Self-contained A/C unit — Base Charge | $47.00 |
| 118.3.4 | per ton or HP of all units combined, or the minimum permit fee, whichever is greater (in addition to Base Charge) | $11.41 |
| 118.3.5 | HVAC for manufactured home inspection — heating & ductwork | $94.00 |
| 118.3.6 | HVAC Certificate of Approval | $26.85 |
| 118.1.3 | HVAC Equipment: Minimum Permit Fee | $91.06 |

**Ambiguity A6 — §118.3.1 publishes a rate without a base.** The schedule states
"Base Charge plus 2% of Unit Valuation" with an `Amount` of `Calculation`. The base
charge is published in the same section ($94.00), but **"unit valuation" is
defined only in the code text (S2), which we have not yet read.**

**Decision.** The `$47.00` and `$94.00` flat rows are implementable now. The
percentage-of-valuation rows are **not** implemented until S2 is read. Publishing a
calculated 2% figure while being unable to define the multiplicand would be exactly
the kind of confident-but-unsourced number this project forbids. The mechanical page
will state that the percentage-of-valuation component is not yet modelled, and link
the schedule.

**Decision, revised in Phase 1.** The mechanical page is **withheld**, not
published with a caveat. Once the flat rows were transcribed it became clear that
the page's headline answer *is* the component we cannot compute: a reader asking
what an HVAC permit costs in Houston is asking about §118.3.1, and a page whose
main content explains what it cannot tell you is a worse page than no page. It is
seeded as `draft` and `noindex`, with the blocking gap recorded in the test suite.

**Ambiguity A7 — §118.3.4 says "whichever is greater".** "per ton or HP of all
units combined **or the minimum permit fee, whichever is greater**" is a minimum-fee
instruction, not a bracket. Our engine expresses this exactly with `minimumCents`
on the rule.

### 4.7 Minimum permit fee vs the structural flat fee — the rules contradict

**Ambiguity A8 — two published rules give different answers for the same project.
(Important.)**

| Section | Says | For a $5,000 valuation |
| --- | --- | --- |
| `Bldg. Code Sec. 118.2.1` | Flat fee for valuations from $0.01 to $7,000 | `$47.00` |
| `Bldg. Code Sec. 118.1.3` | Minimum permit fee for all permits except Plumbing | `$91.06` |

Both rows are in the same published schedule, both show `As Of 01/01/2026`, and
the schedule does not say which prevails. §118.1.3 names "Structural" explicitly in
the list of permit types that carry the $91.06 minimum, which makes the conflict
harder to dismiss rather than easier.

**Why this is not a rounding detail.** A $47.00 structural fee and a $91.06
structural fee differ by 94%. Guessing would put a wrong number in front of the
exact user this product exists to help: someone with a small job trying to budget
before calling the city.

**Why it is not a modelling problem either.** The engine can express a floor on a
component (`minimumCents`) but not on a total, which is what a "minimum permit fee"
actually is. Adding a total-floor primitive in order to represent this conflict
would mean encoding a rule we do not understand well enough to apply.

**Decision.**

1. Both rules are recorded, with the published amounts, citing the schedule.
2. Both ship as `status = 'draft'`, so the engine reports them in its `excluded`
   list with a reason instead of silently adding $91.06 to a fee.
3. A `verification_records` row is written with `status = 'disputed'` and notes
explaining the conflict. The value $91.06 is never presented as the answer.
4. The published pages state the conflict in prose and tell the reader that the
   permit fee will be at least the minimum. That is the honest version of the
   answer, and it is more useful than either of the two candidate figures.

The `disputed` status exists in the schema precisely for this case and had never
been used until now. That it was needed on the very first real jurisdiction is
itself the argument for having built it.

---

## 5. The rate unit problem (architectural finding)

**This is the one finding that required changing the data model.**

Houston publishes its structural rate as **dollars per $1,000 of valuation**, e.g.
`$5.36 per additional $1,000`. As a percentage that is `0.536%`, which is
**53.6 basis points** — not an integer.

The Phase 0 engine stores rates as integer basis points and computes with integer
arithmetic, deliberately, so that no floating-point error can enter a financial
result. `53.6` cannot be represented, and rounding it to `54` would make every
structural fee calculation wrong (a $150,000 valuation would come out $1.44 high).

**Options considered**

| Option | Assessment |
| --- | --- |
| Allow fractional basis points | Reintroduces floats into rate storage — rejects the property the engine exists to guarantee. |
| Store rates as a decimal string | Exact, but pushes decimal arithmetic into the engine and every consumer. |
| Multiply everything by 10 (micro-percent) | Works, but encodes a unit the city does not use and makes rule authoring error-prone. |
| **Add a `per_thousand` primitive** | **Matches the published unit exactly.** `$5.36 per $1,000` → `centsPerThousand: 536`. Integer arithmetic, no conversion step, and the rule reads the way the document reads. |

**Decision.** Add a `per_thousand` fee primitive with `centsPerThousand`, an
optional `thresholdCents` (only the portion above the threshold is charged), an
optional `incrementCents` (the "or fraction thereof" round-up) and an optional
`baseCents` (the published Base Charge).

This is additive: no existing primitive changes, no existing test changes, and the
`percent` primitive remains correct for jurisdictions that genuinely publish
percentages (Houston's own HVAC §118.3.1 does). Documented in
`CALCULATION_ENGINE.md` and `DATABASE.md`.

### 5.3 The same unit can be the wrong primitive (found by testing)

**Ambiguity A9 — `per_thousand` is a money primitive, not a counting primitive.**

§118.5.4 prices plumbing fixtures as *"Base Charge for 1 to 3 units: $34.24, each
additional fixture over 3 on the same permit: $11.41"*. The first implementation
reused `per_thousand` for it, on the reasoning that both shapes are "a base plus a
rate above a threshold".

It was wrong by a factor of 1,000. `per_thousand` means *cents per 1,000 units of
basis*, so `centsPerThousand: 1141` charged 1.141 cents per fixture instead of
$11.41. The regression test caught it immediately, and the failure is worth
recording because the two rules look almost identical:

| Rule | Correct shape | Reusing `per_thousand` gives |
| --- | --- | --- |
| Structural, 4 fixtures over the floor | `$47.00 + $5.36 × 4` | correct |
| Plumbing, 4 fixtures | `$34.24 + $11.41 × 1` | `$34.25` instead of `$45.65` |

The distinction is not the formula, it is **what the basis unit is**. A valuation is
a money amount, so "per $1,000" is a meaningful scale factor. A fixture is a whole
countable object, and no jurisdiction prices anything per thousand fixtures.

**Decision.** `per_unit` gained `baseCents` and `thresholdUnits`, so a free
allowance is expressed in the unit the schedule counts in. Schema validation
rejects `baseCents` without `thresholdUnits`, because that combination would charge
the base amount *and* the per-unit rate for the first unit — a double charge, not a
fee schedule.

**Second finding from the same review: every per-unit kind needs its own input.**
The first draft pointed sewer connections, heaters and furnace tonnage all at
`unit: "fixtures"`, which meant one number typed by a user would be consumed by
three unrelated rules. `PER_UNIT_KINDS` gained `furnaces`, `heaters`, `openings`,
`connections`, `tons` and `lighting_fixtures`, each mapping to its own fact key.
This is additive and needs no migration, because a rule's `config` is JSONB.

---

## 6. What each candidate page needs before it can be published

Per the editorial gate: human prose, at least one primary source, at least one
active fee rule (or an honest "no published schedule" statement), and a
verification date.

| Page | Ready? | Why |
| --- | --- | --- |
| `/texas/houston/building-permit-cost/` | **Yes** | Full nine-bracket schedule extracted (A4, A5 resolved by decision). Square-footage valuation table is a documented gap, stated on the page. |
| `/texas/houston/electrical-permit-cost/` | **Yes** | §118.6 extracted in full, including per-unit rates and the §118.1.3 minimum. |
| `/texas/houston/plumbing-permit-cost/` | **Almost** | §118.5.2/5.3/5.4 extracted; the 16 rows of §118.5.1 are still unread. |
| `/texas/houston/mechanical-permit-cost/` | **Partly** | Flat schedules extracted; the "2% of unit valuation" rows cannot be modelled without S2. |
| `/texas/houston/roofing-permit-cost/` | **No** | Not yet researched. Texas does not license roofing statewide and Houston's treatment of re-roofing is not established by the sources read so far. |
| `/texas/houston/demolition-permit-cost/` | **Yes, but thin** | Two rows ($94.00 first story, $47.00 each additional). Publishes only if the page has something genuinely additional to say. |

**Decision as implemented in Phase 1** (supersedes the research-time plan above):

| Page | Seeded status | Reasoning |
| --- | --- | --- |
| `building-permit-cost` | **published** | Nine brackets, complete and tested. |
| `electrical-permit-cost` | **published** | §118.6 rows transcribed; the unmodelled §118.6 rows are named on the page. |
| `plumbing-permit-cost` | **published** | §118.5.2–.4 complete for fixtures and appliances, which is what a plumbing permit cost question is asking. The unread §118.5.1 group is stated as a scope limit on the page and flagged `needs_review` in the ledger. |
| `mechanical-permit-cost` | **withheld** (`draft`, `noindex`) | See the revised A6 decision: the headline component is the one we cannot compute. |
| `demolition-permit-cost` | **withheld** (`draft`, `noindex`) | Two rows, nothing to add beyond restating them. |
| `roofing-permit-cost` | **not created** | Not researched. Houston's treatment of re-roofing is not established by any source read. |

The plumbing decision was revised from "almost" to published on one condition:
the page states its own scope limit rather than implying it covers every plumbing
permit the City issues. A reader gets the fixture arithmetic they came for and an
honest boundary. Withholding it would have been treating the gap as larger than it
is.

---

## 7. Corrections found while wiring the calculation to the page

Phase 1b put the engine on the page, so a reader now sees a breakdown rather than
a table of rates. Two things that looked correct on paper did not survive that.

### 7.1 Two rules were reading another row's input

| Rule | Was reading | Now reads | What was actually wrong |
| --- | --- | --- | --- |
| `ELEC-118.6.1-OUTLET` (§118.6.1, $1.34 per outlet) | `fixtures` | `outlets` | No amount was wrong — $1.34 is also the plumbing fixture rate. But the breakdown would have told a reader "Number of fixtures: 40" on an electrical page, and the rule shared an input with §118.5.4. |
| `PLUMB-118.5.4-SEPTIC` (§118.5.4, $53.71 each) | `openings` | `septic_tanks` | A septic tank is not an opening. `openings` is the count §118.5.3 (yard light or BBQ grill, $34.24 + $11.41) reads. |

**Neither error reached a reader.** §118.5.3 was transcribed but attached to no
permit type, so nothing ever priced one count twice — the collision was latent
until §118.5.3 was linked (7.2). The outlet row could not mis-bill either, because
the electrical page computes electrical rules only.

The rule this leaves behind, now enforced by a test: **within one permit type, no
two per-unit rules may read the same count.**

### 7.2 §118.5.3 (yard light or BBQ grill) was transcribed but unreachable

The row was in `src/content/houston/fee-rules.ts` and in the plumbing page's own
copy — "The same $34.24-then-$11.41 pattern applies to furnaces, wall heaters,
yard lights and BBQ grill openings, and roof drains" — but it was attached to no
permit type, so the page named a row its own table did not list. It is now linked
to the plumbing permit type. No published total changes: the worked example
supplies a fixture count and nothing else.

### 7.3 Researched but still not modelled

- **Roof drain or outside downspout connection** (§118.5.4, $34.24 for 1–2, $11.41
  each above 2) and the other §118.5 rows in the §4.5 table. The plumbing page's
  `notIncluded` states the boundary, and the copy naming them describes the
  schedule rather than claiming coverage.
- **§118.5.1's 16 rows** — still unread (§8).

### 7.4 Open modelling question: the meter-loop row

`ELEC-118.6.1-METER-50` is modelled as `flat` with no condition, so it contributes
$94.00 to **every** electrical calculation. The schedule states the row ("Meter
Loop and Service up to 50kW — $94.00") without saying whether it is charged per
loop or once per permit, and without saying what happens on a permit that involves
no meter loop at all — two outlets in an existing house, for example.

Three options, none derivable from the source as read:

1. leave it unconditional, and let the page state that the figure assumes the work
   includes a service;
2. gate it behind a presence input (`custom.meter_loop`), which needs every future
   calculator to ask for it — forget, and the estimate is $94 low;
3. model it as a per-item row (one meter loop per permit), which asserts "per loop"
   that the schedule does not state.

**Recommendation: hold at 1 until S2 (§118.6.1 in the Building Code itself) is
read**, and revisit alongside the calculator, where the input set gets designed.
The published example describes work that includes a service, so no page currently
claims the $94 applies to an electrical permit in general.

## 8. Open tasks (next research pass)

- [ ] **Confirm the §118.1.3 minimum fee conflict (Ambiguity A8) with the Houston
      Permitting Center.** This is the highest-value open item: it affects every
      permit under $7,000 of valuation, and it is the one published figure we
      currently decline to apply. Phone 832.394.9000.
- [ ] Extract §118.2.1 ÷ §602.1–602.5 / IBC Table 601 — the 34×5 square-footage ×
      construction-type valuation table (Ord. No. 2023-907).
- [ ] Read S2 (Houston Building Code §118) for: the definition of "unit valuation",
      the §118.2.1 valuation method, the §118.3.1 percentage rule, and whether
      §118.6.1's meter-loop row is charged per loop, once per permit, or only when
      a service is part of the work (7.4).
- [ ] Extract the remaining 16 rows of §118.5.1.
- [ ] Confirm the current annual adjustment basis (the schedule's fee-type filter
      offers `CPI`, `PPI`, `State`, `Other`) and whether a 2027 adjustment is scheduled.
- [ ] Establish Houston's re-roofing/permit requirement from the code, or record
      explicitly that it is not established.
- [ ] Record whether platform/permit-portal fees are charged on top.
- [ ] Transcribe the remaining §118.5 rows already listed in §4.5 (roof drains,
      catch basins, gas steam radiators, warm-air circulators, commercial ovens and
      dryers, tie to curb inlet, manholes, ground-in plumbing for shell buildings,
      non-septic tanks by size, disconnect and plug main sewer connection).
