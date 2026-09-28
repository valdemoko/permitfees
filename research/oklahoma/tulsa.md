# Tulsa, Oklahoma — research record

**Research pass:** 15 (Oklahoma)
**Read on:** 2026-09-26
**Jurisdiction:** City of Tulsa, Tulsa County
**Pages published:** building, electrical, plumbing

## Sources actually read

| # | Source | URL | Type | Effective / dated |
| --- | --- | --- | --- | --- |
| 1 | **TRO Title 49, Chapter 1 — General Administrative Fees** (Municode, City of Tulsa) | `https://library.municode.com/ok/tulsa/codes/code_of_ordinances?nodeId=COOR_TIT49ADPELIFE_CH1GEADFE` | municipal_code | Ord. 25351, 7-17-24 (§ 108 amended by Ord. 25794, 5-13-26) |
| 2 | **TRO Title 49, Chapter 3 — Building Permit Fees** | `https://library.municode.com/ok/tulsa/codes/code_of_ordinances?nodeId=COOR_TIT49ADPELIFE_CH3BUPEFE` | municipal_code | §§ 301/302 amended by Ord. 25794, 5-13-26; rest Ord. 25351, 7-17-24 |
| 3 | **TRO Title 49, Chapter 4 — Electrical Permit Fees** | `https://library.municode.com/ok/tulsa/codes/code_of_ordinances?nodeId=COOR_TIT49ADPELIFE_CH4ELPEFE` | municipal_code | Ord. 25351, 7-17-24 |
| 4 | **TRO Title 49, Chapter 8 — Plumbing Permit Fees** | `https://library.municode.com/ok/tulsa/codes/code_of_ordinances?nodeId=COOR_TIT49ADPELIFE_CH8PLPEFE` | municipal_code | Ord. 25351, 7-17-24 |
| 5 | **Ordinance No. 25794** (adopted 5-13-26) — the packet the City Clerk filed: staff memo + ordinance text as adopted | `https://www.cityoftulsa.org/apps/COTDisplayDocument?DocumentType=CouncilDocument&DocumentIdentifiers=6369` | ordinance | Adopted 2026-05-13 with emergency clause |
| 6 | City of Tulsa — Plans Review (Development Services): process, codes adopted, the "building and development fees" link into Title 49 | `https://www.cityoftulsa.org/government/departments/development-services/plans-review/` | municipal_website | read 2026-09-26 |
| 7 | City of Tulsa — Development Services contact list (phones, emails, hours) | `https://www.cityoftulsa.org/government/departments/development-services/contact-us/` | municipal_website | read 2026-09-26 |
| 8 | Title 49 of the Tulsa Revised Ordinances, 2021 printing (City-hosted PDF) | `https://www.cityoftulsa.org/media/16945/title-49-2021.pdf` | fee_schedule_pdf | Ord. 24664, 8-25-21 — **image-only PDF, no text layer; Google's index confirms the same "closest One Thousand" wording in 2021 but the figures could not be extracted here** |

**Access notes.**
- Municode renders as an SPA: every section above was read through the browser session, section by section, after the City's own link (`nodeId=CD_ORD_TIT49ADPELIFE`) returned "Content Not Found" — that link is stale, the live ids are the `COOR_TIT49…` ones above, and the City's plans-review page still publishes the stale one.
- The ordinance full text is not on Municode ("This organization does not use MuniDocs"): the May 13, 2026 council agenda was found through Granicus, its attachment mapped through the City's CouncilDocuments viewer, and the packet's PDF (14 pages, scanned with OCR) read with `pdftotext -layout`.
- The 2021 Title 49 PDF is image-only and this environment has no OCR; Google's snippet of that file confirms § 302's B/C wording existed in 2021 ("calculated in One Thousand Dollar ($1,000.00) increments to the closest One Thousand …"), so the structure predates the FY2027 adjustment — but its *figures* are unread and charged nowhere.
- Permit portal: `https://tulsaok-energovweb.tylerhost.net/apps/selfservice` (Tyler EnerGov self-service).

## What the sources are

Title 49 is the City's whole fee title — eighteen chapters from general administrative fees to animal services. Chapter 1 is the stack: § 102 says its fees "are applied to each permit, license, certificate, and registration governed by this Title 49, unless specifically provided otherwise in any individual chapters", and each trade chapter's own introductory section repeats it ("In addition to the fees listed below, administrative fees pursuant to Chapter 1 of this title shall be required"). Chapters 3, 4 and 8 are the trade schedules. Ord. 25351 (7-17-24) rewrote almost the entire title; Ord. 25794 (5-13-26) then amended § 108, §§ 301–302, § 904, § 1207 (new), §§ 1701–1702 — the staff memo says why: *"As part of the FY2027 budget these are adjusted to meet cost of service, inflation and other necessary adjustments"* — adopted with an emergency clause to coincide with the 2027 budget approval. The figures below are the FY2027 column, in force since 2026-05-13.

## The mechanism, by page

### The Chapter 1 stack (every permit, all three pages)

| § | Line | Modelled as |
| --- | --- | --- |
| 100.A | `$4.00` collected under 59 O.S. § 1000.25 on all building/construction permits, remitted monthly to the State | `state_surcharge`, flat |
| 100.D | `$0.50` administrative fee retained by the City under the same statute | `other`, flat |
| 117 | `Five and 50/100 Dollars ($5.50) plus eight percent (8%) of the … permit fee`, "in addition to any … fee, or minimum fee" | `surcharge`, percent on `fee_subtotal` + `$5.50` base — evaluated directly after the chapter's base rows, so its 8% reads the chapter fee and nothing else |
| 103 | `A surcharge of Five Dollars ($5.00) … on each permit … processed` | `other`, flat |
| 107 | `A minimum fee of Eighty Dollars ($80.00) shall apply to any permit` | `permit_minimum` on `fee_subtotal`, priority 200 — the shortfall, after every other line |

The order is the schedule's own: base rows first (evaluation order guarantees it), then § 117's 8% while the subtotal is still just the chapter fee, then the state's `$4.50`, then the `$5.00`, then the `$80` floor reading the whole bill. § 116 waives fees for governmental entities on written request (noted, not modelled); § 105's penalty for work started without a permit (`$214.00` or three times the regular fee, whichever is greater, "in addition to") is named — the engine cannot compute `max($214, 3×fee)` *on top of* the fee without mis-stating one of the two branches; § 106's `$100` resubmission, § 108's `$64` additional inspection, § 109's `$75` reinspection, § 110's recall (`$150/hr, 2-hour minimum`), § 111's `$2.00` record-retention page and § 114's `$250` appeal are event fees, named.

### Building page (Chapter 3)

**§ 302 is the whole permit fee, and it turns on three readings:**

1. **The bands.** `$0–$5,000 → $137.00`; `$5,000.01–$40,000 → $219.00`; over $40,000 to $150,000 → `$6.18 per thousand of the estimated valuation`; over $150,000 → "the additional fee … `$3.09` per thousand of the estimated valuation **above** $150,000". Every rate band is "calculated in One Thousand Dollar increments **to the closest** One Thousand Dollars" — a rounding this engine had never been asked for, because every other schedule in the dataset says "or fraction thereof". The mode is the new `incrementRounding: "nearest"` on `per_thousand` (see `tests/calc/per-thousand-rounding.test.ts`): $40,499 buys forty steps, not forty-one, and ties round half up.
2. **What the >$150,000 band adds to.** For valuations above $150,000 the text states only an *additional* fee — subsection B is explicitly capped at $150,000, so the base it must be additional to is B's own computation at its ceiling: `$6.18 × 150` = **`$927.00`**, plus `$3.09` per closest thousand of the excess. That reading (continuous at the seam: exactly $150,000 pays $927.00 from B, one dollar more pays $927.00 + nothing) is charged. The alternative reading — that B's rate continues on the *full* valuation with the excess layer stacked on it (a marginal rate of $9.27 above the seam) — requires applying subsection B outside the scope its own cap states, and is recorded here as the alternative with `needs_review` on the rule. The drafter's pattern supports the charged reading: where § 301 means a replacement formula it prints one ("Above $100,000.00 → `$1.00/$1,000 Value`"), and where § 302 means an addition it says "additional" — and a schedule that prints fixed sums when it means fixed sums ($137, $219) would have printed `$927.00 plus …` if that base were meant to be literal. Both readings are asserted in the tests; the City publishes no worked example that settles it.
3. **§ 301 is credited, so it is a payment schedule.** Application fee by *declared* valuation: `$0–$15,000 → $66.00`; `$15,000.01–$100,000 → $101.50`; above $100,000 → `$1.00/$1,000 Value`. § 302.A says the permit fee "shall be decreased by the amount of any previously paid building permit application fee" — and § 302's figure exceeds § 301's at every valuation (checked band by band: $137 > $66, $219 > $101.50, $6.18/k > $1.00/k), so the credited application fee never changes the total. Named on the page as a prepayment (Pittsburgh's precedent), never summed. § 118's own words agree: application fee first, "upon approval … advised of what remaining fees are due".

**Other building rows:** demolition `$133` flat (§ 314 — the sewer plug permit is Chapter 13's, named); carport `$98` (§ 304); and § 306's storm-shelter carve-out, which is the chapter's own exclusivity instruction: *"Storm shelter permit fee shall be a flat fee with no other administrative, zoning, or watershed fees applicable with the exception of Section 100"* — indoor `$88`, outdoor `$132`. So a storm-shelter permit charges its flat **plus the state's `$4.50` and nothing else**: the valuation bands, § 117's 8%, § 103's `$5` and § 107's `$80` floor all stand down while `custom.storm_shelter` is set, and the two shelter flats are the only base rules that answer.

**Recorded, not charged:** § 301 (credited, above); § 303's CO and zoning-clearance table (CO new `$70`, residential CO `$34`, existing/change of use `$384`, temporary/partial `$367`, zoning clearance `$92` commercial / `$75.50` residential — separate permits and certificates, not lines of a building permit; § 306's carve-out says "no … zoning … fees" for shelters, which is itself evidence the zoning clearance is not automatic); § 305's expediting trio (`$121` professional home builder, `$500` residential fast track, `$500` commercial priority); § 307–§ 313's fire regime — the sprinkler-head and fire-alarm-device tables (nine bands each, `$113`–`$781` heads / `$1,550` devices, then `$0.85`/`$1.75` per head or device over 750 with an inspection allowance per 125) — priced by counts on a fire permit, not by this building page; § 315's tents (`$90` + `$29` each additional); § 316 special assembly `$135`; § 317's sign table (minimum `$81`, application `$81` counted toward the total, outdoor `$464`, business `$190`…); § 318 temporary residential use `$166.50`; §§ 319–323 building moves; § 327 registration `$178`; § 101's `$400` code-compliance meeting (credited toward plan review per the City's pre-development page).

### Electrical page (Chapter 4)

**Four priced regimes and a catch-all, gated by the chapter's own scope words:**

- **§ 401 residential one/two-family, new construction and additions**: electric service fee (§ 404.A) **plus** a base by area — `1–2,000 sq ft $230`, `2,001–6,000 $293`, then `$58.00` per each additional 1,000 sq ft. The additional-square-foot line prints no "or fraction thereof", so it prorates (Bismarck reading) — modeled as a percent rate of `$58 per 1,000 sq ft` above 6,000.
- **§ 402 commercial/industrial**: (A) new construction — seven area bands (`$293` to `$1,179` to 100,000 sq ft, then `$64` per each additional 5,000 sq ft); (B) additions and major remodels — a second seven-band table (`$189` to `$745`). The note under (B) is a gate: *"On remodel projects having less than fifty percent (50%) of the space in the area involved, the fees shall be as provided in Section 404"* — so a remodel under half the space falls to the catch-all, and the ≥50% remodel is `custom.major_remodel`.
- **§ 403 low density** (parking garages, shell buildings, warehouses): a third seven-band table (`$144` to `$739`). It prices by land use rather than occupancy, so it is `custom.low_density_project`, and it stands against § 402 (which stands down when it is set).
- **§ 404 other electrical work** — the catch-all the chapter itself points to: service (first 100 amps `$98`, each additional 100 amps **or portion** `$18`), swimming pool `$235`, generator `$235` (+ `$118` each additional), HVAC unit `$81` (+ `$11.89` each additional), transformer/motor/elevator `$81` each (+ `$11.89`), electrical equipment `1–25 $81` (+ `$2.68` each additional), reconnect `$81`. All of it is gated `not covered by 401–403` in the chapter's own words ("shall apply to … work not covered in Sections 401 through 403"). The service fee and its amp row fire on covered work too — 401/402/403 each say their total *is* the service fee plus the base — so the service rules read `any[covered, custom.electrical_service]`. The "each additional" unit rows whose counts the inputs cannot observe (generators beyond the first, motors, transformers, elevators beyond the first) are recorded as gaps beside the first-unit figures rather than priced.
- § 405's contractor registration `$178` is licensing.

### Plumbing page (Chapter 8)

One short price list, § 801: gas piping `$41` **per meter**; backflow prevention assembly `$79`; interceptor/separator `$150`; water heater `$35`; water service `$35`; fixtures base `$81` (including the first fixture) plus `$3.31` each additional. Every row is a per-unit or count charge the inputs already carry (`meters`, `backflow_devices`, `grease_interceptors`, `heaters`, `water_service_connections`, `fixtures`), so a permit charges exactly the rows its job touches.

**The one garbled figure in the title:** § 801.A's second line reads `Plus, per opening .....$2.6887.00` — two decimal points in one amount, in the codified text exactly as the 2021 printing had it. It is quoted verbatim on the page and charged nowhere (Toledo's `$100 included in building permit fee$50.00` precedent: a figure that cannot be read is named, never guessed — `$2.68`, `$87.00` and `$2.6887` are all defensible splits of the same characters, and the schedule offers no arithmetic to check them against). § 802's outside-city travel fee `$92` and § 803's registration `$178` are named.

## Effective dates and open questions

1. **Every figure is FY2027.** §§ 108, 301, 302 date from Ord. 25794 (adopted 5-13-26, emergency clause); the rest of the modelled text from Ord. 25351 (7-17-24). § 305's `$121` professional-home-builder expediting row is from Ord. 25572 (5-21-25). Rules carry those dates as `effectiveFrom`.
2. **The >$150,000 base is the charged reading of an ambiguous sentence** — `$927 + $3.09/k of excess` charged; `$6.18/k of full valuation + $3.09/k of excess` recorded as the alternative. The rule carries a `needs_review` verification with both readings in the notes. A City-published worked example would settle it; none exists.
3. **"To the closest" is a real rounding, not a transcription of "or fraction".** Google's index of the City's own 2021 Title 49 PDF shows the same phrase five years before the FY2027 adjustment, so it is not a typo introduced in 2026 — the engine's new `incrementRounding: "nearest"` exists because of this schedule.
4. **§ 117's 8% base.** "Eight percent (8%) of the … permit fee" is read as 8% of the chapter's permit fee — the surcharge component evaluates directly after the base rows, before the state and maintenance lines, so it cannot see them. Whether the `$5.50 + 8%` itself falls inside the `$80` minimum (it is charged before the floor reads the bill, so a small permit pays `$80` total either way) is settled by § 117's own "in addition to any … minimum fee".
5. **The `$80` floor is global.** § 107 says "any permit", and the chapters say Chapter 1 applies — so a $35 water-heater permit pays `$80` (the worked example asserts exactly that).
6. **Stale City link.** The plans-review page's "building and development fees" anchor (`nodeId=CD_ORD_TIT49ADPELIFE`) 404s in Municode; the live ids are `COOR_TIT49…`. Recorded so the next pass does not spend the hour this one did.
7. **Uncodified Ord. 25849 (8-5-26)** amends Title 49 Chapter 18 (animal services only) — noted, no effect on these pages.

## Verification status

- All four chapters read in the browser session on 2026-09-26, section by section; the May 13, 2026 ordinance packet (staff memo + adopted text) read from the City Clerk's own PDF; the contact list read from the City's page.
- § 302's recital in the ordinance packet matches the codified text word for word (the packet is where the FY2027 figures were double-checked against Municode's rendering).
- Rules: building 13 (8 Chapter-3 rows + the five-line Chapter 1 stack), electrical 38 (33 Chapter-4 rows + the stack), plumbing 11 (6 Chapter-8 rows + the stack) — 62 in total, the stack attached per permit type so each page carries its own five lines.
- Engine probe: all rules validate; worked examples reproduce cent for cent (building `$1,349.88`, electrical `$456.72`, plumbing `$80.00` on the floor — see the seed's workedExample notes; `tests/content/tulsa-seed.test.ts`, 23 tests, green).
