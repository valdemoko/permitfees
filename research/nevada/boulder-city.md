# Boulder City, Nevada — research record

**Status: published.** Three permit pages (building, electrical, plumbing), 10 rules, two
sources, fourteen verification rows, live at `/nevada/boulder-city/`.

---

## 1. Why Boulder City is Nevada's second jurisdiction, and what is blocked

The obvious picks are Las Vegas, Henderson and North Las Vegas. All three are blocked on a
readable source, and each for a different reason:

| Jurisdiction | What was tried | What stopped it |
|---|---|---|
| **City of Las Vegas** | `lasvegasnevada.gov/…/Permit-Fee-Estimator` answers 200 | The extracted page text is the calculator's title and nothing else: the figures are rendered client-side, so there is no table in the HTML. No City fee-schedule PDF was located. |
| **Henderson** | The City's permit-fee page | Same class of blocker: a calculator rather than a published table. |
| **North Las Vegas** | Its permit application centre, and its code host | **403** to this environment. Its code is reported to price fees in §15.72.270 Table 3-E, which could not be read from here. |

**Boulder City** publishes a two-page PDF, with a working text layer and its own effective date,
hosted on its own website. By this project's order of precedence — verifiability first, market
size as a tie-breaker — that settles it.

It also earns its place on mechanism, which is the second reason the next jurisdiction is chosen:
it prices by **valuation bracket**, like Clark County next door, and its table **chains without any
rounding at all**, because every rate it publishes is whole cents. Two valuation tables in one
state, one convention each, is a better test than a fourth city with a calculator.

---

## 2. Sources

| Key | Document | URL | Retrieved | Pages | sha256 |
|---|---|---|---|---|---|
| `boulder-fee-schedule` | City of Boulder City, *Permit Fee Schedule and Valuation Table*, Building and Safety Division — "Effective as of August 3, 2020" | `bcnv.org/DocumentCenter/View/68/2020-Fee-Schedule-PDF` | 2026-09-24 | 2 | `e7500fcdecfeff7ee972630c03a6fdd384d42fb6ebd68b431c7732a384c0a748` |
| `boulder-permit-guidelines` | Building Permit Guidelines and Forms — the Division's own landing page, and the URL the schedule prints for itself | `bcnv.org/171/Building-Permit-Guidelines-and-Forms` | 2026-09-24 | — | not a source of rates; no figure is taken from it |

**Read twice, and the second read earned its keep.** `pdftotext -layout` printed the Valuation
Table with the fee column **one row out of step** with the range column: `$1.00 to $500.00` was
paired with the *next* row's amount. `pdftotext -table` pairs the columns correctly. The
mis-pairing was caught before it became a published rate — the same class of error Scottsdale's
schedule produced, and the reason the two-mode rule exists.

---

## 3. What the document contains

**Page 1** — the common permit fees, in five blocks, each trade block headed *"Price Includes
Issuance Fee"*:

| Block | Rows |
|---|---|
| PLUMBING | Gas Line / Pressure Test $70.00 · Water Heater $50.00 *(Replacement only, per each unit/tank)* |
| MECHANICAL (HVAC UNITS) | 1 - 3 Ton Unit $75.00 · 3.5 - 5 Ton Unit $100.00 · *more than one unit on a permit: +$35 for 1-3 ton, +$60 for 3.5-5 ton* |
| ELECTRICAL | Service Change up to 200 AMP $80.00 · 200 - 1,000 AMP $100.00 · Over 1,000 AMP $125.00 · Temporary Power $290.00 |
| MISCELLANEOUS | Demolition up to 1,000 sf $85.00 · 1,001 sf or more $115.00 · Move Structure $200.00 · Parking Modular Building $90.00 (+$50 per additional building) |
| PRIVILEGE TAX & TRANSPORTATION | Commercial Development $1.00/S.F. · Residential Development $1,000/house · Residential Tax $1,000/house *(noted as Clark County rates effective 1 July 2020)* |
| INSPECTIONS & PLAN REVIEW | Plan Review (revisions) $45.00 per ½ hour · Expedited $90.00 per ½ hour · Re-Inspection $90.00/hour · Same-day/After Hours $90.00/hour · Overtime $180.00 (2-hour minimum) · **Non-Refundable Plan Review Deposit:** *"Equal to full plan review fees for the project, based on project valuation. This can be calculated using the Valuation Table on page 2"* |
| METER INSTALLATION & CONNECTION (Per Resolution 6570) | Water ¾"–2": $7,450 / $13,332 / $25,698 / $74,088 · Sewer 4"–6"+: $1,800 / $10,000 / $15,000 · Electric up to 200 A–over 1200: $2,500 / $3,500 / $5,000 / $6,500 / $7,500, then $6.25/AMP |

Above the schedule: *"Unless indicated a $40 Issuance Fee will be applied to every permit."*

**Page 2** — the **Valuation Table**, 51 published ranges from `$1.00 to $500.00 = $27.00` to
`$49,001.00 to $50,000.00 = $414.50`, plus two published rows above it:

* `$50,001.00 to $100,000.00` = **$414.50 for the first $50,000 + $4.50 for each additional $1,000 or fraction thereof**
* `$100,001.00 and up` = **$639.50 for the first $100,000 + $3.50 for each additional $1,000 or fraction thereof**

Under the banner *"VALUATION SHALL INCLUDE LABOR & MATERIALS FOR WORK BEING PERMITTED EVEN IF
WORK IS COMPLETED AS OWNER/BUILDER"*, the same page publishes **Common Unit Costs Used to
Calculate Valuation** — the figures an applicant multiplies by to *derive* the valuation:

| | Per S.F. | | Per S.F. |
|---|---|---|---|
| Dwellings, wood/framed w/AC (R-3, VB) | $112.65 | Fences: chain-link / ornamental iron | $5.00 |
| Dwellings, masonry w/AC (R-3, VA) | $119.73 | Fences: CMU block wall | $6.50 |
| Finished basement | $50.00 | Fences: retaining wall | $15.00 |
| Garage (attached/detached) (U, VB) | $44.63 | Fences: wood / vinyl | $4.00 |
| Porch/patio/carport (wood) | $20.00 | Conversions: garage to living | $35.00 |
| Porch/patio/carport (metal) | $10.00 | Conversions: carport to living | $45.00 |
| Storage sheds (detached) | $20.00 | Conversions: covered patio to living | $45.00 |
| Additions: room | $65.00 | Conversions: carport to garage | $15.00 |
| Additions: unfinished basement | $15.00 | Pools & spas: surface area | $90.00 |
| | | Pools & spas: utility fee (flat) | $100.00 |

The Division notes that a fuller list — all fees, fee tables and square foot construction costs —
is in its 2020 Administrative Division Administrative Code on its website. **That document was not
retrieved in this pass, and no figure is claimed from it.**

Contact details come from the Division's own header on page 1: 401 California Avenue, Boulder
City, NV 89005 · Main Line (702) 293-9282 · buildingpermits@bcnv.org. Counter hours are not
printed and are therefore not recorded.

---

## 4. The mechanism

**A bracket table, then two rate rows, and a $40 that is charged once.** The bracket table prices
the valuation as a whole — `$252.00` at $25,000, `$414.50` at $50,000 — and is capped there by a
condition, because the two published rows above it are `per_thousand` rows that would otherwise
be charged *as well*. The last bracket and the first rate row are the same money at $50,000, which
is exactly why the cap has to be explicit.

**It chains with no rounding at all.** Every handover closes on the cent:

| Handover | The row below at its top | The row above opens at |
|---|---|---|
| $50,000 | $414.50 | $414.50 *(the rate row's base)* |
| $100,000 | $414.50 + 50 × $4.50 = $639.50 | $639.50 *(the rate row's base)* |

That is the opposite of Clark County, whose four closing seams need their half-cent increments
rounded and whose fifth seam is four cents apart. Same state, same word "valuation table",
different convention — and the model states each from its own document rather than reusing the
last one's.

**The trade fees step on hardware, not on money.** Electrical steps on amperage (200 / 1,000 /
over), plumbing on unit count, mechanical on tonnage. No trade fee here reads a valuation, and
this schedule has no fallback sentence routing unspecified trade work to the building table —
which is why the trade pages state where they have no rate instead of borrowing Clark County's.

**The one reading taken, stated as a reading.** The schedule opens *"Unless indicated a $40
Issuance Fee will be applied to every permit"*, and each trade block indicates the opposite in
print: *"Price Includes Issuance Fee"*. The Valuation Table indicates nothing, so a building
permit is modelled as the table's amount **plus $40**, and a trade permit as its flat figure with
the $40 already inside. If the City means the table's figures to include it, every building figure
published here is $40 high, and the building page says so in those words.

---

## 5. What the engine needed

**Nothing new.** This is the first jurisdiction since Houston that required no engine change, and
that is worth recording rather than passing over: the bracket table is `tiered_table`, the two
rows above it are `per_thousand`, the trade items are `flat`, the water heater is `per_unit`
(reusing the existing `heaters` count, because a water heater is a heater), and the mutual
exclusion of the three service-change bands and the two plumbing items is `custom.schedule_item`
— now on its third jurisdiction.

The one thing this jurisdiction added is a **kind of content, not of code**: the City publishes
the unit costs to derive a valuation, so the building page's worked example multiplies 1,000 sq ft
by the schedule's own $112.65 and runs the result through the fee table. Every input on that page
comes from one document, and a reader can follow the whole chain by hand.

---

## 6. What was modelled, and what was not

| | Boulder City |
|---|---|
| Fee rules | 10 (3 valuation + 1 issuance + 4 electrical + 2 plumbing) |
| Permit pages | 3 — building, electrical, plumbing |
| Requirements | 6 |
| Sources | 2 |
| Verification rows | 14 |
| Worked examples | building 1,000 sq ft at $112.65/sf → $112,650 → **$725.00**; electrical 400-amp service change → **$100.00**; plumbing two water heaters → **$100.00** |

**Named and charged by nobody:** plan review (a deposit equal to the full review fee, computed
from the same table — adding it to the permit fee would charge that table's money twice; plus
hourly revision reviews); privilege tax and transportation ($1.00/sf commercial, $1,000/house
residential) and the separate $1,000/house residential tax; meter installation and connection
fees under Resolution 6570; the event fees (re-inspection, same-day, after-hours, overtime,
expedited review); the $100 flat pool and spa utility fee; demolition and moving a structure.

**Mechanical is published and not published as a page.** $75.00 for a 1-3 ton unit, $100.00 for
3.5-5 ton, plus $35.00 and $60.00 for each additional unit on a permit — a real permit fee with a
genuine base-plus-per-unit shape, transcribed here, absent from this release, and stated in the
payload's own notes rather than left as a silence.

---

## 7. Open questions

1. **Does the $40 apply to the Valuation Table?** See §4. The reading is recorded, the
   consequence is stated on the page, and the document does not settle it.
2. **Can one permit carry two of the five flat items?** The schedule lists them separately and
   never adds two, so this site prices one at a time. That is a decision, not a finding.
3. **Plan review on a stand-alone trade permit.** Not priced on any page, for the same reason
   Clark County's is not: the document does not separate it.
4. **The Valuation Table's bracket steps were transcribed as published**, 51 rows, and the two
   stepped regions ($9 per $1,000 up to $25,000, then $6.50) are reproduced exactly. The
   document's arithmetic was not reconstructed to check for a formula behind it, because no
   formula is published.

---

## 8. Verification

| Check | Method | Result |
|---|---|---|
| Source retrieved | live fetch, 2026-09-24 | read; sha256 `e7500fcdecfeff7ee972630c03a6fdd384d42fb6ebd68b431c7732a384c0a748`; the schedule states its own effective date |
| Valuation Table | `pdftotext -layout` **and** `-table` | the two modes disagreed on the pairing; `-table` is correct and the mis-pairing is recorded above |
| Brackets | engine over the rules read from PostgreSQL | $67.00 at $1, $292.00 at $25,000, $454.50 at $50,000 — each including the $40 |
| Handovers | value at each row's top vs the row above's base | both close on the cent |
| Issuance fee | SQL over `fee_rules` | one `ISSUANCE-40` row, attached to the building permit only |
| Water heater | SQL plus engine | stored `per_unit`, not flat: one tank $50.00, two tanks $100.00 |
| Trade valuation routes | SQL over `fee_rules` | 0 trade rules with a valuation basis |
| Worked examples | engine over the stored rules | $725.00, $100.00, $100.00 |
| Tests | `npx vitest run`, `npm run typecheck` | green, with the chaining, the per-unit row and the issuance-fee reading asserted rather than described |
