# Miami-Dade County, Florida — research record

**Published on this site:** 2026-09-24 · **Jurisdiction key:** `miami-dade` · **Fee schedule effective:** 2026-06-26
**Pages:** `/florida/miami-dade/building-permit-cost/`, `/electrical-permit-cost/`, `/plumbing-permit-cost/`

Miami-Dade County is the county as a permitting authority: Building and Neighborhood Compliance,
inside the Department of Regulatory and Economic Resources, issues the permits and sets the fees
by implementing order of the Board of County Commissioners. It is on this site for two reasons
that no other jurisdiction in the dataset supplies. It prices a building permit **by area** — there
is no valuation anywhere in the building section — and it prices its trade permits from **forms the
applicant fills in**, so a trade permit is a sum over rows rather than one rate.

---

## 1. Sources read

| # | Document | URL | sha256 (first 16) | Read |
|---|---|---|---|---|
| S1 | Implementing Order No. 4-63, "Fee Schedule for Regulatory and Economic Resources Department (Building and Neighborhood Compliance)" | `https://documents.miamidade.gov/ao-io/IO/IO-04-63.pdf` | `7f23cd971ade46be` | 2026-09-24, three pdftotext modes |
| S2 | Electrical Fee Sheet, form 123_01-57/26 | `https://www.miamidade.gov/resources/economy/building/documents/electrical-fee.pdf` | `c52d753a6c00f281` | 2026-09-24, three modes |
| S3 | Plumbing and Gas Fee Sheet, form 123_01-708/26 | `https://www.miamidade.gov/resources/economy/building/documents/plumbing-gas-fee.pdf` | `c4aec030fb2ff505` | 2026-09-24, three modes |
| S4 | Mechanical Fee Sheet | `https://www.miamidade.gov/resources/economy/building/documents/mechanical-fee.pdf` | `921276a654826807` | 2026-09-24, read not modelled |
| S5 | Building Fee Schedules, Refunds & Cancelations | `https://www.miamidade.gov/global/economy/building/building-permit-fees.page` | — | 2026-09-24 |
| S6 | Plan Review | `https://www.miamidade.gov/global/economy/building/plan-review.page` | — | 2026-09-24 |

All four PDFs were **re-fetched on 2026-09-24** to confirm the URLs still serve the files the rules
were built from. Each returned HTTP 200 with the same byte count and the same sha256 as the copy
read. The two URLs for the implementing order and the three fee sheets are the ones the County's
own fee page (S5) links, not URLs guessed from a file-name convention.

**Dating.** S1 states "Ordered June 16, 2026, Effective June 26, 2026, superseding the order of
June 26, 2025". S5 still carries the notice for the *previous* change: "Effective Oct. 1, 2025 the
Building Division will be implementing a revised fee schedule adopted by the Board of County
Commissioners on June 30, 2025. This is the first increase in more than 17 years and is necessary
due to increased cost in providing the highest quality of services." So this county has had two
published fee events in two years after seventeen without one, and the site records the order that
is actually in force.

---

## 2. The building section — priced by area, not by valuation

Section I.B. Every row is an area rate or a named flat item. Section 4 of the website payload
holds the requirement that says so; the numbers are:

| Row | Rate | Section |
|---|---|---|
| New construction of detached single family and duplex | $0.96 per sq ft | B.3 |
| Multi-unit single family townhomes | $0.40 per sq ft | B.3 |
| Additions to single family and duplex | $0.96 per sq ft | B.3 |
| Alterations or repairs to single family residence or duplex | $0.500 per sq ft of the structure, **maximum fee $847.95** | B.3 |
| All other occupancies, new construction and additions | $0.40 per sq ft to 100,000 sq ft, then $0.15 | B.4 |
| Alterations and repairs, all other occupancies | same two tiers, **minimum fee $254.40** | B.5 |
| Roofing, shingle and other roof types not listed | $0.11 per sq ft of coverage including overhangs | B.8a |
| Roofing, clay and concrete tile | $0.140 per sq ft | B.8b |
| Moving a building | $11.28 per 100 sq ft or fraction | B.6 |
| Slab on grade, residential and commercial | $88.55 flat | B.7 |
| Screen enclosure | $11.13 per 100 sq ft or fraction | B.15 |
| Temporary platform or bleachers | $6.68 per 100 sq ft or fraction | B.11 |

**Minimums.** B.2: "The minimum fee for all residential dwelling building permits (single family,
duplex) is applicable to all items in this section, except as otherwise specified. 147.00" and "The
minimum fee for all other uses 147.00", with "This minimum fee does not apply to add-on building
permits issued as supplementary to current outstanding permits for the same job." The sentence
attaches the floor to **each item**, which is the reading this site implements; a permit combining
two items pays it twice. That second half is a reading, not a quotation, and the page says so.

**The table that makes the fee checkable.** Above B.3 the order prints: "The following minimum
schedule of valuations shall be applied to the structure(s) for which a permit is filed. However,
should the contract valuation be greater it shall be used for determining the fee". Then an ICC
occupancy-by-construction-type table of average cost per square foot, and three notes: "Unfinished
basements (all use groups) = $15.00 per sq.ft.", "For shell only buildings deduct 20%", and
"Private Detached Garages use 'Utility, miscellaneous'". **The table is for valuing the work, not
for charging the fee** — the building fee itself is per square foot regardless — and the worked
example uses it only to state what the County would value the house at.

## 3. Three surcharges, and one is the county's own

| Row | Rate | Base | Floor |
|---|---|---|---|
| A.15 RER surcharge | 7.5% | all Building Permitting fees in Section I except K | none |
| A.20 State mandated, § 553.721 | 1% | permit fees associated with enforcement of the FBC | $2.00 |
| A.21 State mandated, § 468.631 | 1.5% | the same | $2.00 |

A.15 is charged on everything charged before it, including the $65.00 up-front fee; the two state
surcharges are charged on the permit fee. That is why the RER surcharge is $184.88 on a $2,465.00
house permit and the state's 1% is $24.00.

## 4. The $227.90 floor, and where it comes from

Both trade fee sheets state it in the same words at the top of the form:

> "Minimum fee for electrical permits is $227.90."
> "Minimum fee for plumbing permits is $227.90."

Neither sheet shows the arithmetic. It is **($147.00 + $65.00) x 1.075 = $227.90**:

* $147.00 — the Section I.B.2 minimum, $147.00 (used here as the trade floor);
* $65.00 — the A.8 non-refundable up-front fee for permit support functions;
* 7.5% — the A.15 RER surcharge, applied to the **sum of both**.

This is the single most useful thing in the county's paperwork, because it fixes the *order* of the
charge as well as the amount: the floor is on the fee rows, the up-front fee is added after it, and
the RER surcharge is charged on both. The state's two surcharges then ride on top, so the least a
trade permit costs in total is $227.90 + $2.00 + $2.21 = **$232.11** — which is what this site's
rules compute for a permit consisting of one service or one pool. The engine gained a
`permit_minimum` fee type for this, because a per-rule minimum would charge $227.90 once per row:
the sheet states the floor once per permit, and a permit is as many rows as the job has. See
`CALCULATION_ENGINE.md` §20.

## 5. Trade permits are sums over rows

S5 states the mechanism: "Permit Fee Sheets must be submitted as part of a permit application when
applying for electrical, mechanical or plumbing permits. Fee sheets break down the cost of permit by
category." The sheets are tables of fee code, description, calculation, unit and count. A permit
therefore lists several rows, and only genuinely exclusive rows are alternatives.

**Electrical (S2, matching Section I.D of S1):**

| Code | Row | Rate | Modelled |
|---|---|---|---|
| `G034` | Permanent service to building | $7.26 per 100 amps | yes (selector) |
| `G067` / `G079` | Repair or upgrade of an existing service; safety check for re-energizing | $7.26 per 100 amps | yes (same rule) |
| `G080` | Residential wiring, new construction, additions, alterations and repairs | $0.113 per sq ft of the master permit | yes |
| `G005` | General wiring outlet box | $2.59 per outlet | yes |
| `G009` | Fixture / luminaires | $2.59 per fixture | yes (count) |
| `G082` | Special outlets (fixed appliance or equipment 30 A or greater) | $11.28 per outlet | yes (selector) |
| `G045` | Panel board, switchboard, control panel | $32.21 per board | yes (count) |
| `G008` | Air conditioning, refrigeration, cooler | $9.66 per ton | yes (count) |
| `G033` | Electrical feeders | $19.33 per feeder | yes (count) |
| `G059` | Pool or spa, residential electrical | $144.91 | yes |
| `G089`-ish | Temporary service for construction | $147.00 | yes |
| — | Solar photovoltaic, roof / ground mounted | $365.63 / $325.00 | yes |
| — | Burglar alarm; electrical demolition | $40.00; $64.61 | yes |
| `G012`, `G041` | Transformer and mechanical heating equipment | $11.28 per 10 KW | **not modelled** |
| `G010`, `G076` | Plugmold track lighting; empty conduit ductbank | per 5 ft; per lineal ft | **not modelled** (length) |
| `G025`, `G075`, `G077`, `G083` | Smoke/CO detector per device; time clock; manhole; motor replacement | fixed per unit | **not modelled** |

**Plumbing and gas (S3, matching Section I.C of S1):** `P051`/`P052` new or altered one and two
family dwelling at $0.143 per sq ft (the sheet prints "0.14⅓ per Sq ft"; the order prints the
three-decimal 0.143, which is what is charged); `P001` rough/plug per outlet and `P032` fixture/set
per fixture, both $9.66; `P003`/`P044` sewer connection to a public or private system at $48.31;
`P010` water service connection at $12.88 per meter on each lot; `P033`/`P034` backflow assemblies
at $56.36 (2" or less) and $88.55 (2 1/2" or larger); `P015` sump pump $12.88; `P009` condensate
drain $5.10; `P011` water connection for an outlet or appliance $9.66; `P060` additional
inspections $92.48. Category 02 is gas on the same form: `P018`/`P019` residential outlets and
appliances $9.66; `P061`/`P062` commercial $16.10; `P020` meters $6.45; `P021` repairs to gas pipes
$56.36; `P065` flue pipe $9.66. Category 03 is a lawn sprinkler at $27.06 per zone; Category 05
chemical toilets for special events, $147.00 for the first and $13.29 for each additional.

Rows priced by length — `P028` building sewerline at $11.28 per 50 ft, `P016` repairs to water
piping at $2.59 per 50 ft, `P046` sanitary pipelines at $11.28 per 50 ft — are **not modelled**,
because this site does not collect a pipe length. The site prices the sewer *connection* and not
the *line*, and the page says so.

## 6. The implementing order and the fee sheets disagree in one place

**D.19 commercial pools.** The order prices a commercial pool or spa at $225.41 and a commercial
*combination* pool/spa at $305.92. The electrical fee sheet prices "New pool or spa (commercial)"
at $305.92 (`G059`). Neither row is modelled on this site (the residential pool row is), and the
disagreement is recorded here and stated on the electrical page rather than resolved by choosing
one document over the other. It is the only rate conflict found between the two documents: every
other shared rate was compared row by row and agrees.

## 7. What a permit fee does not include, in the county's own words

S5: "Permit fees include other fees assessed by other service areas, agencies and/or departments
involved in the permitting process, including, but not limited to: Miami-Dade Department of
Transportation and Public Works (DTPW); Miami-Dade Development Services Division; Miami-Dade
Department of Environmental Resources Management (DERM); Miami-Dade Fire Rescue (MDFR); Miami-Dade
Water and Sewer Department (WASD); State of Florida (septic tanks) (DOH-HRS)." None of those is
priced on this site, and the three departments that own them are recorded on the jurisdiction so a
reader can tell a permit fee from an agency charge.

**Plan review.** S6 states the up-front fee's place in the process — "To initiate the plan review
process, upfront fees will first need to be paid" — and that reviews "may take between 24 hours and
10 business days for the initial review". It also names a charge with no rate in any schedule:
applicants who submit plans on paper "will be assessed a conversion fee based on the current fee
schedule". Expedited routes (Affordable and Workforce Housing, Concierge, Cookie Cutter, Green
Building, Master) are named and not priced.

## 8. Worked examples, computed with the engine

| Scenario | Components | Total |
|---|---|---|
| New detached single family house, 2,500 sq ft | $2,400.00 + $65.00 + $184.88 + $24.00 + $36.00 | **$2,709.88** |
| The same 2,500 sq ft as townhome units | $640.00 + $65.00 + $52.88 + $6.40 + $9.60 | **$773.88** |
| Alteration to a house of the same size (capped) | $847.95 + $65.00 + $68.47 + $8.48 + $12.72 | **$1,002.62** |
| Commercial new construction, 30,000 sq ft | $12,000.00 + $65.00 + $904.88 + $120.00 + $180.00 | **$13,269.88** |
| Slab permit, 900 sq ft (raised to the minimum) | $147.00 + $65.00 + $15.90 + $2.00 + $2.21 | **$232.11** |
| Electrical: 60 outlet boxes, 1 panel, 40 fixtures, 5 tons | $339.51 + $65.00 + $30.34 + $3.40 + $5.09 | **$443.34** |
| Electrical: a 400-ampere service alone | $29.04 + $117.96 + $65.00 + $15.90 + $2.00 + $2.21 | **$232.11** |
| Plumbing: new house 2,500 sq ft, 18 fixtures, sewer, meter | $592.57 + $65.00 + $49.32 + $5.93 + $8.89 | **$721.71** |

The second electrical row is the one worth keeping: $29.04 + $117.96 + $65.00 + $15.90 is **exactly
the $227.90 the sheet prints**, computed from the four published parts. It is asserted in
`tests/content/miamidade-seed.test.ts`, and it is the reason the engine has a permit-level minimum.

## 9. Open questions

1. **Whether the trade floor is $147.00 or $227.90 as a floor.** This site applies $147.00 to the
   fee rows and lets the up-front fee and the RER surcharge follow, because that is the only
   arrangement that reproduces $227.90. A reader who reads the sheet as "the permit may not be
   issued for less than $227.90 including everything" gets the same total, so the ambiguity does not
   change any published figure — but it means the site's explanation of *why* is an inference.
2. **Whether the building section's floor is per item or per permit.** B.2 says "applicable to all
   items in this section", which the site reads as per item; a per-permit reading would halve a
   two-item permit's floor. Both readings are stated on the page.
3. **The commercial pool rate**, §6 above.
4. **The two "up-front" fees.** B.1's per-square-foot processing fee ($0.60 / $0.30 / $0.26) is
   credited toward the final fee and is therefore a deposit; A.8's flat $65.00 is not. The site adds
   only the second, and names the first in the exclusions.
5. **Fees are re-ordered often.** Two orders in two years, after seventeen years without an
   increase, and the order reserves the right to adjust. Anything read from this record should be
   checked against the order in force on the date asked about.
