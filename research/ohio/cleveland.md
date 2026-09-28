# Cleveland, Ohio — research record

**Research pass:** 14 (Ohio)
**Read on:** 2026-09-25
**Jurisdiction:** City of Cleveland, Cuyahoga County
**Pages published:** building, electrical, plumbing

## Sources actually read

| # | Source | URL | Type | Effective / dated |
| --- | --- | --- | --- | --- |
| 1 | **Cleveland Code of Ordinances § 3105.25 Schedule of Permit Fees** (Land Use Code, Ch. 3105 Permits and Occupancy Certificates), Ord. No. 708-10 | `https://codelibrary.amlegal.com/codes/cleveland/latest/cleveland_oh/0-0-0-19698` | municipal_code | Passed 8-18-10, eff. 8-20-10 |
| 2 | **Permit Fee Schedule** — department page, "a user-friendly recreation of the City of Cleveland Department of Building and Housing Plan Examination and Permit Fee Schedule" | `https://www.clevelandohio.gov/city-hall/departments/building-housing/divisions/construction-permitting/permit-fee-schedule` | municipal_website | states "effective January 2, 2014" |
| 3 | Department of Building & Housing — overview, contractor/licensing notes | `https://www.clevelandohio.gov/city-hall/departments/building-housing` | municipal_website | read 2026-09-25 |
| 4 | Department contact list (phones, emails, City Hall address) | `https://www.clevelandohio.gov/city-hall/departments/building-housing/contact-list` | municipal_website | read 2026-09-25 |
| 5 | Ohio Rev. Code § 3781.10 (the state construction-permit surcharge statute § 3105.25 is written around) | `https://codes.ohio.gov/ohio-revised-code/section-3781.10` | state_agency | **unreachable** — see access notes |

**Access notes.**
- The codifier (`codelibrary.amlegal.com`) renders in the browser but 403s plain fetchers; the section was read through the browser session.
- RC 3781.10 could not be retrieved by any path tried: `codes.ohio.gov` (direct — connection failure), `www.legislature.ohio.gov` (timeout), Justia (403), FindLaw (404 slug), `ohio.public.law` (DNS), and the Wayback Machine snapshot `20260613154450` (host unreachable from this environment). The ordinance itself quotes the statute's operative rule, and that quotation is what the city's own schedule implements, so the surcharge reading below rests on § 3105.25's own text; the statute's division (E) item list is the one thing left unread.
- Permit portal: `https://coc-prod-publicportal.accela.com` (Accela Citizen Access).

## What the two sources are

§ 3105.25 is the ordinance: the full fee schedule (a)–(m) with every rate and minimum, last amended by Ord. 708-10 (2010). The department page is a later **recreation** (it says so in its own first sentence) that adds fees the codified section does not contain — plan examination, zoning, site development, SWPPP, certificate of occupancy, late fees, special inspections, festival permits — and repeats a surcharge block that does not match the ordinance. Both are primary city publications; where they disagree the ordinance governs and the conflict is recorded rather than averaged.

## The mechanism, by page

### Building page

**Valuation ladder, two classes × two scopes, each split at $1,000,000** (§ 3105.25):

| Class | Scope | Rate | Minimum |
| --- | --- | --- | --- |
| 1–3 family | new / additions | $10.00 per $1,000 or fraction of estimated cost | $150 |
| 1–3 family | alterations / repairs | $5.00 per $1,000 or fraction | $30 |
| OBC | new / additions / first tenant build-outs, under $1,000,000 | $12.00 per $1,000 or fraction | $300 |
| OBC | same, from $1,000,001 up | $12,000 + $7.00 per $1,000 **above $1,000,000** | — |
| OBC | alterations / repairs, under $1,000,000 | $15.00 per $1,000 or fraction | $150 |
| OBC | same, from $1,000,001 up | $15,000 + $11.00 per $1,000 **above $1,000,000** | — |

"or fraction" → `incrementCents: 1_000` (round valuation up to whole thousands). The upper tier is a second rule gated `valuation gt 1_000_000_000`, with the lower tier gated `lte` the same figure so both sides are explicit — the seam at $1,000,000 pays exactly $12,000 (new) / $15,000 (alteration) from either side.

Valuation definition (§ 3105.25 preamble): includes all structural, electrical, plumbing, HVAC, interior finish, normal site preparation incl. excavation and backfill, overhead and profit; architectural/engineering fees, land and off-site costs need not be included; may be determined per BOCA or R.S. Means.

**Miscellaneous rows** (all in the schedule, selected by a `custom.line_item` fact):
private garages/tool sheds/residential antennas/accessory structures $50; fences/guardrails for 1–3 family $50; fences/guardrails commercial $15 per $1,000 or fraction, min $150; private/residential pools $50; effective boarding pending rehabilitation $50; moving 1–3 family $300; moving other $600; outdoor signs/display structures $12 per $1,000 or fraction, min $50; marquees/awnings/canopies same; temporary tents **120 sq ft or less: no charge**, over 120 sq ft $75 (funeral/religious ≤2 weeks free — prose, no rule).

**Demolition** (§ 3105.25(d)): priced per **floor area excluding basement/cellar** — 1–3 family or accessories $10.00 per 1,000 sq ft or fraction, min $50; OBC buildings $15.00 per 1,000 sq ft or fraction, min $300. Basis is `square_footage`; the class switch picks the row. The caller enters floor area above grade (the exclusion is recorded in the page prose).

**Zoning fees** (§ 3105.25(i), "shall be added to applicable building permits"): commercial/multifamily/parking lots $150; temporary uses $30; signs/fences/appurtenant structures $20. The **department page adds a fourth row — "Residential … $20.00" — that the ordinance does not contain**; modelled with the page as its source, conflict recorded.

**Plan examination** (department page only): $20.00 per 1,000 sq ft or fraction thereof per area examined, $20 minimum — under 1,000 sq ft or projects without floor area (parking lots, signs, roofs, fences) pay the $20 floor. Upfront and non-refundable, paid on submission; revisions after permit issuance incur an additional P.E. fee (amount unstated). Modelled as `plan_review`, `per_thousand` with `incrementCents: 1_000` and `minimumCents: 2_000`.

**Other page-only fees:** site development review $200; SWPPP review $500 (page cites § 3116.04); SWPPP inspection $150/month of construction duration (no month-count basis in the engine — recorded, not modelled); certificate of occupancy $60; late fee for work started before permit issuance — $100 + 25% of the required permit fee if notified within 72 hours, $200 + 25% if after; special inspections — $40 when work is not ready or the address is faulty, $100 outside regular working hours; festival/carnival permits for charitable organizations (≤5 consecutive days, ≤2 carnivals/year) — plan examination $20 + use permit $20 + temporary tent $25 (page notes tents cap per § 3105.25; § 3105.29 is the ordinance home of these and was not separately read).

**State surcharge — the reading that matters.** § 3105.25, second and third paragraphs:

> Except for permit fees for work performed on one (1), two (2), three (3) family dwellings, their accessory structures and other miscellaneous items listed in division (E) of RC 3781.10, the permit fees herein include the required surcharge pursuant to division (E) of RC 3781.10.
>
> For permit and plan examination fees for work performed on one (1), two (2), or three (3) family dwellings or their accessory structures, the permit fees do not include the required one percent (1%) surcharge. For permits issued for that work, the required surcharge shall be calculated on the final cost of each permit issued and shall be separately itemized.

So: **OBC-class fees already contain the state surcharge — no separate line. Residential-class permit and plan-examination fees do not — a 1% surcharge is itemised on the final cost.** Modelled as one `state_surcharge` rule, percent `rate {1, 100}`, basis `fee_subtotal` (permit + plan examination — exactly the two fee kinds the ordinance names), gated `custom.one_two_family eq true`. The surcharge runs in the `state_surcharge` component slot, which the engine evaluates after `base` and `plan_review` but before `other`, so zoning/CO/late amounts are outside its base — consistent with "the final cost of each permit [and plan examination]".

**Conflict, unreconciled:** the department page repeats, under every trade section, "1, 2, and 3 family dwelling units — 1% … OBC regulated buildings — **3%** State of Ohio surcharge **added to** the permit fee." That contradicts the ordinance's "the permit fees herein include the required surcharge" for OBC work. The ordinance is the enactment; the page calls itself a recreation. Recorded as an open question — if RC 3781.10's division (E) is ever read, the first thing to check is whether the OBC rate is a 3% built into these 2010 figures or a 3% that is meant to be added.

**Late fees** are modelled as two `surcharge`-component percent rules on `permit_fee` (25% + the $100/$200 base), gated by `custom.work_started` = `within_72h` / `after_72h`.

### Electrical page (§ 3105.25(l), plus the page's restatement)

- Minimum fee for any permit: **$50**.
- (1) New construction, additions, alterations: **$50.00 for each 1,000 square feet or part** — `per_thousand` on `square_footage`, increment 1,000. Gated on `work_type in [new_construction, addition, alteration]` **and** the absence of an explicit line-item selection (the schedule says "Use (1) **or** (2)").
- (2) Item rows, selected by `custom.line_item`: temporary lighting/power or low-voltage wiring systems $50; first electrical sign $50 with each additional sign installed at the same time $30 (modelled as `per_unit` on `unit: signs` with `baseCents: 5_000, thresholdUnits: 1, centsPerUnit: 3_000` — the base covers the first sign); amusement rides and devices $30 each (no per-unit kind for rides — recorded, not modelled); repairs to existing electrical systems $50.
- (3) Blanket electrical permit, each year, each premises: $200.
- The department page narrows the (2) item text to "low voltage wiring systems **for building service equipment only; such as temperature control wiring of HVAC equipment, or fire alarm system**" while the ordinance lists "CATV cable, fire alarm devices, computer devices, data communication and other similar equipment". The ordinance's broader text is what the rule says; the narrowing is recorded.

### Plumbing page (§ 3105.25(k), plus the page's restatement)

- Minimum fee for any permit: **$50** — modelled as a `permit_minimum` rule (`basis: permit_fee`, `floorCents: 5_000`) sorted after the row rules so it reads the accumulated base.
- (1) Each plumbing fixture, appliance or device (water closets, urinals, tubs/showers, sinks, fountains, dishwashers, laundry trays, washers, floor/roof drains, water heating devices, interceptors, sump pumps, AC units, catch basins, area drains, manholes, similar): **$8.00 each**.
- (2) Piping per 100 lineal feet or fraction — gas $13, drains/waste $13, storm/foundation $13, sanitary $13, water distribution $13 (each a `linear_feet`-based row with increment 100).
- (2)F Connection to potable water line for non-potable uses (irrigation, fire suppression, etc.): ordinance says **$50.00**; the department page says **$13.00** (it appears to have copied the piping rows). **Modelled at the ordinance's $50**; conflict recorded.
- (3)A Repairs to existing plumbing fixtures/systems: $50.
- The page drops the "100" from one row ("for each lineal feet" instead of "for each 100 lineal feet") — transcription error, the ordinance governs.

### Not in scope of the three pages (recorded, no rules)

- HVAC schedule (§ 3105.25(j)) and the refrigeration rows — no HVAC page in this jurisdiction's set.
- Festival/carnival tent count and SWPPP monthly duration — no per-tent or per-month kind in the engine; the flat parts of the festival trio are modelled, the counts are not.
- Amusement rides $30 each — no per-unit kind for rides.
- The RC 3781.10 division (E) "miscellaneous items" list — statute unreachable, so the surcharge rule is gated on the residential class only and the extension to statute-listed misc items is left open.

## Effective dates and open questions

- Ordinance: Ord. 708-10, passed 8-18-10, effective 8-20-10. Page: "effective January 2, 2014". Both dates are carried in the source records; the schedule figures agree wherever they overlap, so the difference is a publication date, not a rate change.
- Open: RC 3781.10(E) content (which miscellaneous items share the residential 1% itemisation; whether the 3% the page advertises for OBC work is built in or additive).
- Open: plan-examination "additional P.E. fee" for revisions after permit issuance (amount never published on the page).
- Open: the department page's $13 potable-connection figure vs the ordinance's $50.

## Verification status

Filled in at build time: see the Ohio row of `research/index.md`.
