# Oklahoma City, Oklahoma — research record

**Research pass:** 15 (Oklahoma)
**Read on:** 2026-09-26
**Jurisdiction:** City of Oklahoma City, Oklahoma County
**Pages published:** building, electrical, plumbing

## Sources actually read

| # | Source | URL | Type | Effective / dated |
| --- | --- | --- | --- | --- |
| 1 | **Permit Fees** — the department's hub page, linking the four trade schedules and the fee-change PDF | `https://www.okc.gov/Services/Permits/Building-Trade-Permits/Permit-Fees` | municipal_website | read 2026-09-26 |
| 2 | **OKC Code of Ordinances, Chapter 60 — General Schedule of Fees**, Title 12 (Building Code) | `https://library.municode.com/ok/oklahoma_city/codes/code_of_ordinances?nodeId=OKMUCO2020_CH60GESCFE_TIT12BUCO` | municipal_code | Ord. 27978, 11-18-25; two-column fees from 2026-07-01 |
| 3 | Same chapter, Title 18 (Electrical Code) | `https://library.municode.com/ok/oklahoma_city/codes/code_of_ordinances?nodeId=OKMUCO2020_CH60GESCFE_TIT18ELCO` | municipal_code | Ord. 27978, 11-18-25 |
| 4 | Same chapter, Title 42 (Plumbing Code) | `https://library.municode.com/ok/oklahoma_city/codes/code_of_ordinances?nodeId=OKMUCO2020_CH60GESCFE_TIT42PLCO` | municipal_code | Ord. 27978, 11-18-25 |
| 5 | Same chapter, Title 29 (Mechanical Code) | `https://library.municode.com/ok/oklahoma_city/codes/code_of_ordinances?nodeId=OKMUCO2020_CH60GESCFE_TIT29MECO` | municipal_code | Ord. 27978, 11-18-25 |
| 6 | **Development Impact Fees** — streets and parks rate tables, benefit areas, the estimator | `https://www.okc.gov/Services/Permits/Building-Trade-Permits/Development-Impact-Fees` | municipal_website | in effect since January 2017; table read 2026-09-26 |
| 7 | Development Services Fee Changes (PDF, July 2025) | `https://www.okc.gov/files/assets/city/v/1/development-services/documents/development-services-fee-changes.pdf` | fee_schedule_pdf | July 2025 — linked from source 1, not relied on (the code carries the operative figures) |

**Access notes.**
- `okc.gov` 403s plain fetchers (a scripted request returns a 438-byte stub); every page above was read through the browser session.
- The Municode codifier renders as an SPA and returns only its title to text extractors; the four chapter nodes were read through the browser session, section by section.
- Permit portal: `https://aca-prod.accela.com/OKC/Cap/CapHome.aspx?module=Permits&TabName=HOME` (Accela Citizen Access).
- No worked example is published by the City for any of the four schedules; the rules are asserted against the text of Chapter 60 itself.

## What the sources are

Chapter 60 is one ordinance-book chapter holding the fee schedules of all four trades: Title 12 (building), Title 18 (electrical), Title 42 (plumbing) and Title 29 (mechanical). Every section's history ends with `Ord. No. 27978, § …, 11-18-25`, the ordinance that set the current two-column fee tables: a column for `July 1, 2025 through June 30, 2026` and a column for `July 1, 2026 and thereafter`. **The 2026 column is in force on the date of this pass** (2026-09-26), and it is the column the rules carry; the FY2025-26 column is recorded here and charged nowhere. Sections that print a single amount (no columns) carry the date of their own last amending ordinance as their effective date.

The permit-fee hub page is the City's own index: it links each trade's schedule into Municode, links the fee-changes PDF, and carries the contact numbers. The Development Impact Fees page is a second, separate instrument — streets and parks fees assessed by land-use category, assessment area and square footage when a building permit is issued.

## The mechanism, by page

### Building page (Title 12)

**The ladder is two sections, not one.** § 60-12-7 prices alterations/removal/repair at `$6.00 per $1,000` of valuation with a `$75` minimum; § 60-12-9 prices new construction by **square footage** with the same `$75` minimum and five class rates:

| Class (§ 60-12-9(b)) | Per sq ft |
| --- | --- |
| warehouse buildings | $0.19 |
| commercial buildings, office buildings and office space | $0.28 |
| industrial buildings | $0.28 |
| residential buildings, including accessory buildings | $0.16 |
| accessory buildings to agricultural uses with electrical connection only | $0.05 |

The class a building belongs to is not derivable from the engine's `occupancy` labels ("commercial" does not say whether the building is a warehouse or an office), so the permit asks for one fact — `custom.building_class` — following the `custom.fee_group` shape Green Bay established. § 60-12-7's rate prints no "or fraction thereof", so the per-thousand amount prorates (the Bismarck reading); § 60-12-9's rates are per square foot with the minimum stated as a floor on the rule.

**Demolition is priced by stories** (§ 60-12-8): first story `$78` (2026 column; `$74` in FY2025-26), each additional story `$12.00` — a count of stories, which is the `stories` per-unit kind the engine already carries.

**Plan review is a credit, not a charge** (§ 60-12-6). Subsection (b): plan review submitted with the application is `50.0% of total building permit fee`, `not to exceed $2,750.00`, and — the sentence that decides it — "This fee is not refundable, but will be credited towards the total permit fee, the remainder of which is due upon issuance of the permit." A fee credited against the total leaves the total unchanged: the applicant pays 50% at submission and the rest at issuance. This is Pittsburgh's 40% share exactly — a payment schedule, named on the page and summed nowhere. Subsections (a) (`$142.60` → `$150.00` pre-application review, which "do[es] not apply to one-and-two-family or City-owned buildings") and (c) (pre-construction meeting `$450` → `$500`) are optional services with their own triggers; they are recorded as requirements, not charged.

**The one line added to every permit** is § 60-12-1's Oklahoma Uniform Building Code Commission collection fee: `Administrative Collection Fee, per permit ..... $0.50`, "for the collection and remittance of fees to the Oklahoma Uniform Building Code Commission as established by 59 O.S. § 1000.25". A state surcharge, fifty cents, on every permit of every trade (§§ 60-18-27, 60-42-11, 60-29-25 repeat it per trade). The same sections also impose a `2.7 percent` card service fee — "if payment is made with a credit or debit card" — which is a property of the payment channel rather than of the permit and is named instead of charged.

**Rows modelled on this page** (each behind its own `custom.<fact>` boolean, Buffalo's flat-list pattern): swimming pool/hot tub permit `$75`, occupancy certificate `$25`, photovoltaic system `$96` (2026 column), pre-manufactured in-ground fallout/tornado shelter `$78` (2026 column; above-ground shelters are priced through § 60-12-9's rates), roof replacement or repair over 500 sq ft `$90`, residential insulation installation `$0.03` per sq ft, and the mobile home park fee (`$478` minimum 2026 column + `$5.00` per lot being created). **Development impact fees** are charged when the reader supplies the project's land-use category: streets = square footage × the category's per-square-foot rate from the six-by-four table, parks = square footage × `$0.53` for residential development only. The table's rate rows are stored as the schedule's own `rateTables` product (land use × assessment area), the same shape Buffalo's Schedule B established.

**Recorded, not charged:** § 60-12-6(a)/(c) optional services and the credited 50% plan review; reinspection/trip fee `$50`, address-change admin `$43`, temporary CO `$250` (2026), after-hours inspection `$175` (2026), consultation `$100` (2026) — event-driven fees with no trigger in a permit calculation; § 60-12-11's elevator tables (a full inspection regime keyed to device type and test type); § 60-12-12's house-moving area table; copies of standard specifications, appeals, contractor and insulation-contractor registrations, building contractor registration `$100/yr`; the parks 38% waiver and the private-park exemption (credits with their own application process); and the 2.7% card fee.

### Electrical page (Title 18)

Five regimes, and the schedule's own scope words gate them:

- **§ 60-18-14 residential new construction**: base `$175` (240-volt single phase service up to 200 amps; `$164.90` in FY2025-26) + `$50.00` per each additional 100 amps **or portion thereof** over 200 + required inspection pair: rough `$50`, final `$50`. The base's parenthetical sets the amp threshold the add-on measures from (200, not 100).
- **§ 60-18-16 residential add-on/remodel/service**: add-on with no service change `$100` (2026); service charge up to 200 amps `$100` + `$50` per additional 100 amps or portion; temporary construction service `$75` (2026); meter base inspection `$50`.
- **§§ 60-18-20 / 60-18-22 commercial new construction, split by floor area**: under 4,000 sq ft — base `$67` + `$40.50` per 100 amperes or portion over 200 + rough `$20.50` + final `$27`; 4,000 sq ft or more — base `$221` + `$103.50` per 100 amperes over 200 + rough `$22.50` + final `$25.50`. The 4,000 sq ft seam is a condition on the project's own area (the same branch shape Boston's three-way electrical split uses).
- **§ 60-18-24 commercial add-on/service change**: add-on under 4,000 sq ft `$93`, over 4,000 `$201`; service change `$100`; temporary construction service `$75` (2026). The per-100-amp add-on in (c) prices "service size" — the size *added*, which is not an input this engine has — so (c) is named rather than priced against total amperage.
- **§ 60-18-26 miscellaneous rows**: pool wiring `$93`, generator `$93`, photovoltaic installations `$120`, commercial low-voltage `$93`, service for sign `$93` (all 2026 column) are modelled behind row facts; water-well service `$50`, temporary heat `$29.50`, carnival service `$84`, booth spaces `$75`, after-hours inspection `$175` and consultation `$100` are named.

§ 60-18-12's "Five outlets or less, unrelated to building permits and requiring no change in service" (`$100`, both occupancy classes — residential and commercial print the same 2026 figure) is a standalone permit, and the branch rules stand down when it is selected: its own scope words ("unrelated to building permits") make it exclusive with new construction.

**No minimum applies to electrical.** Title 18 states no permit floor; the `$75` minimums live in Title 12 § 60-12-7/§ 60-12-9 and do not reach across titles. Registrations ($100 electrical contractor, annually) are licensing.

### Plumbing page (Title 42)

Three schedules, split by the same scope words the plumbing sections use:

- **§ 60-42-6 residential new construction (one- and two-family dwellings and condominiums)**: base `$83` ("all fixtures integral to the structure"), + `$28.50` for each bathroom more than one (or part thereof) + `$15` per water and sewer service. Line extensions over ten feet are `$15` each — a count of lines this engine has no kind for, recorded rather than flattened. Permits for multifamily dwellings are *not* in this section's scope.
- **§ 60-42-7 residential, addition or replacement** (same scope): alteration base `$84` (2026 column; `$78.40` in FY2025-26) "required when alteration or addition is sufficient to require a building permit" + `$7.00` per appliance or fixture requiring connection + `$25.50` per water or sewer connection. Line extensions `$100` (2026) named as above.
- **§ 60-42-9 commercial new construction, addition, or replacement ("all structures except one-and-two-family dwellings and condominiums")**: base `$120` (2026 column) + `$7` per fixture + `$25.50` per service connection. Multifamily therefore prices here — the section's own exclusion defines the residential one.
- **§ 60-42-10 special plumbing fees**: commercial dishwasher `$15`, garage grit or grease interceptor `$15` each, commercial garbage disposal `$15`, yard sprinkler system `$30`, fire protection yard line `$100` are modelled (the interceptor as a per-unit count); the washing-machine tiers (one machine `$15`, two to seven `$25.50`, seven to fifteen `$116`), carwash `$28.50`, slaughterhouse traps `$28.50`, building-move alteration `$28.50`, consultation `$100` (2026) and after-hours inspection `$175` (2026) are named.

Same state line as the other trades (§ 60-42-11, `$0.50` OUBCC). Contractor registration `$100/yr` and the outside-of-city travel fee are licensing/event rows.

### Not in scope of the three pages (recorded, no rules)

Title 29 (Mechanical) is read and not published as a page in this pass: forced-air units `$31` by class (E/D/C/B/A hp-ton bands `$31`–`$454`), boiler installation bands `$31`–`$154.50`, gasfitting appliance rows `$50`, gas services `$50`, plus its own `$0.50` OUBCC line. Also recorded without rules: § 60-12-11's elevator regime; § 60-12-12 house moving (area table `$30.50`–`$302.50` + advance inspection `$227`); § 60-12-24's above-ground shelter clause (priced through § 60-12-9); the Development Impact Fees for **water and wastewater** (the page says the City charges them and publishes no table on the page read); parks credits and exemptions; and the fee-changes PDF of July 2025 (superseded by Ord. 27978's two-column tables).

## Effective dates and open questions

1. **The two-column tables are dated, and the later column is charged.** Ord. 27978 (11-18-25) printed both: `Fee effective July 1, 2025 through June 30, 2026` and `Fee effective July 1, 2026 and thereafter`. Rules from those sections carry `effectiveFrom: 2026-07-01`; the FY2025-26 figures are recorded here (`$142.60` plan review, `$74` first demolition story, `$164.90` residential electrical base, `$78.40` residential alteration base, `$110.85` commercial alteration base, `$434` mobile home park, `$225` temporary CO, `$157.50` after-hours, `$90` consultation, `$86.40`/$83.70 rows that moved, `$95` mechanical registration) and are charged nowhere.
2. **Plan review's 50% is credited, so it never changes the total** — named on the page as Pittsburgh's 40% share was, never summed. If the City ever publishes an example where the credit is *not* applied to the remainder, that reading changes.
3. **The impact-fee tables print no date.** The page says the fees "went into effect in January 2017 and will be updated July 1st of each subsequent year"; the amounts read on 2026-09-26 are carried as current with the page's January 2017 origin on the schedule row. Whether the 2026-07-01 update actually moved them is an open question; there is no dated instrument to check.
4. **Rough and final inspections are charged on new construction, partial rough is not.** §§ 60-18-14/20/22 list "plus, for required inspection: rough … final …" inside the fee schedule — schedule lines for inspections the permit requires. The partial-rough row ("slab, wall, service, etc.") is conditional on a slab/stage the input does not know, and reinspection/trip fees are event-driven; both are named.
5. **Amperage is read from `custom.amperage`**, and the threshold the schedule charges above is the base fee's own parenthetical (200 amps for residential, 200 for commercial) — the add-on measures "over 200", not "over 100", on every branch that prints a base covering 200.
6. **`custom.building_class` is required for new-construction square-foot rates.** Withholding the fact produces no charge and a clean exclusion, which is the honest answer when the schedule's class is unknown; the page says so.

## Verification status

- All seven sources read in the browser session on 2026-09-26 (the City's pages and the codifier both refuse scripted fetches).
- Every rule's text traced to its section; two-column figures dated from Ord. 27978's own column headers.
- Rules: building 13 (11 Chapter-60 rows + the two impact-fee rows), electrical 28, plumbing 18 — 59 in total, with the $0.50 OUBCC line attached per trade.
- Engine probe: all rules validate; worked examples reproduce cent for cent (building `$13,860.50`, electrical `$476.50`, plumbing `$170.50` — see the seed's workedExample notes; `tests/content/oklacity-seed.test.ts`, 23 tests, green).
