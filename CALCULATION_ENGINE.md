# Calculation Engine

The fee engine is the part of this product that must never be wrong, and never
be mysterious. It is a pure TypeScript module: rules in, breakdown out.

## 1. Non-negotiable properties

| Property | How we guarantee it |
| --- | --- |
| Deterministic | Pure function. No clock, no randomness, no I/O. Time is an explicit input (`asOf`). |
| Reproducible | Result carries the rule IDs and schedule versions used. |
| Explorable | Every component is returned with its formula and intermediate values. |
| Testable | Rules are plain objects; tests use fixtures, no database. |
| Extensible | Adding a fee shape means adding one primitive + its tests. |

## 2. Numeric representation

This is financial code, so floating point is banned where it matters:

- **Money** is an integer count of **cents**. `$150.00` is `15000`.
- **Rates** are **basis points**. `1.5%` is `150`. `0.25%` is `25`.
- Integer arithmetic up to 2^53 is exact in JavaScript, so `valuationCents *
  rateBps / 10_000` stays exact until the final rounding step.
- **Rates that are not whole basis points** are exact rationals: `{ numerator,
  denominator }`, multiplied through BigInt (see §13.1). Basis points can only hold
  two decimals, and Dallas publishes `0.027665` and `0.005095` — 2,766.5 and 509.5
  basis points. Rounding those *before* multiplying moves published money by tens of
  dollars, which is why the primitive exists rather than a tolerance for it.

**Rounding rule:** round half up, at the end of each component, to the cent.
Never round intermediate values, because that is how jurisdictions end up with
penny drift that breaks reconciliation against the official schedule. The rule
is documented in the UI: an estimate that cannot be reconciled with the official
document is worse than no estimate.

## 3. Fee primitives

Five primitives cover the overwhelming majority of published US schedules. Each
is validated by a Zod schema, so a malformed rule is rejected at the boundary
instead of producing a wrong number.

### `flat`
```jsonc
{ "amountCents": 15000 }                       // $150
```

### `percent`

`basis × rate`, plus the schedule's own add factor when it publishes one
(`× 0.009285 + $110`). The rate is either `rateBps` or an exact rational `rate`, and
`rateUnit` says which unit it is in — see §13.1. `incrementCents` rounds the basis UP
first, for schedules written "or fraction thereof", and `thresholdCents` subtracts a
fixed first block of the basis before any of that — for schedules written "$408.00 for
the first 1,000 square feet, plus $93.00 per additional 500 or portion thereof". See
§19.1.
```jsonc
{ "basis": "valuation",   "rateBps": 150 }     // 1.5% of project valuation
{ "basis": "permit_fee",  "rateBps": 8000 }    // 80% of the calculated permit fee
{ "basis": "square_footage", "rate": { "numerator": 186, "denominator": 10 },
  "rateUnit": "currency_per_unit", "thresholdCents": 1000, "incrementCents": 500,
  "baseCents": 40800 }                          // the first 1,000 sq ft, then $93/500
```
A `permit_fee` basis is the one basis that is not an input: it resolves to the sum of
the `base` components computed in the same run. See §14.1.

### `tiered_marginal`
Base amount plus marginal rates per band. This is the shape of "1.5% of the
first $100,000, plus 1.0% of anything above".
```jsonc
{
  "basis": "valuation",
  "baseCents": 0,
  "tiers": [
    { "upToCents": 10000000, "rateBps": 150 },  // up to $100,000 @ 1.5%
    { "upToCents": null,     "rateBps": 100 }   // above $100,000 @ 1.0%
  ]
}
```
Phoenix's Table A is the same primitive with `incrementCents` set, because it bands
by whole thousands and charges "or fraction thereof" in every band — see §14.2. A
zero-rate band is legitimate and is described as "no charge" rather than "0%", since
it usually means a base amount covers that band.

### `tiered_table`
A fixed amount per bracket, the "valuation range → fee" table.
```jsonc
{
  "basis": "valuation",
  "tiers": [
    { "upToCents": 500000,  "amountCents": 5000 },
    { "upToCents": 2000000, "amountCents": 12500 },
    { "upToCents": null,    "amountCents": 24000 }
  ]
}
```
Brackets are **inclusive of the upper bound** and must be contiguous and
ascending; the validator rejects gaps and overlaps.

### `per_unit`
A rate applied per countable thing: dwelling units, fixtures, circuits, signs.
```jsonc
{ "unit": "dwelling_units", "centsPerUnit": 3500 }
```

## 4. Composing a real fee

A real permit fee is rarely one number. It is a set of components, each its own
row, matched by conditions and summed:

```
base            → flat $150
plan_review     → 35% of the base component        (see: "relative" follow-up)
technology      → flat $12
state_surcharge → per_unit $4 × dwelling_units
────────────────────────────────────────────────────
total           → breakdown returned to the page
```

Phase 1 summed independent components only. The `plan_review` row above — a
component defined *as a percentage of another component* — was the first item on
this project's list of engine work that would be needed, and it is now implemented
as the `permit_fee` basis, driven by a real schedule (Phoenix) rather than guessed
at. See §14.1 for what it resolves to and the two rules that keep it from misfiring.

## 5. Modifiers

Applied per component, in this order:

1. Evaluate the primitive.
2. Apply `minimumCents` if the result is below it.
3. Apply `maximumCents` if the result is above it.
4. Round half up to the cent.

Order matters and is asserted by tests, because `min` applied after rounding and
`min` applied before rounding give different answers at the margin.

## 6. Conditions

Conditions are declarative JSON, matched against the calculation *facts*. They
are not code — a jurisdiction-specific quirk must be expressible without a
deploy.

```jsonc
{
  "all": [
    { "field": "occupancy", "op": "eq",  "value": "residential" },
    { "field": "valuation", "op": "gte", "value": 5000000 },
    { "field": "work_type", "op": "in",  "value": ["new_construction", "addition"] }
  ]
}
```

- Operators: `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `in`, `not_in`, `exists`, `absent`.
- Combinators: `all`, `any`, `not`.
- Fields: the typed input facts (`valuation`, `squareFootage`, `units`,
  `fixtures`, `occupancy`, `workType`, `constructionType`, booleans) plus
  `custom.<key>` for jurisdiction-specific facts, so a local quirk does not
  require a schema change.
- Comparison is **strict on units**: `valuation` conditions are in cents, and
  the validator rejects a rule that compares a cents field to an obviously
  dollar-shaped number. Silent unit mismatches are the most expensive class of
  bug in this domain.

## 7. Resolution and precedence

```
1. Collect rules where jurisdiction + permit type match, status = active,
   and effective window contains asOf.
2. Filter by conditions.
3. Sort by priority, then by component type for stable output.
4. Evaluate each remaining rule.
5. Sum components; record excluded rules and the reason for exclusion.
```

Rules that fail their conditions are reported as **excluded with a reason**, not
discarded. This is what makes the page able to say "this fee applies to
commercial projects only" instead of silently omitting a line item.

## 8. Result shape

```ts
type CalculationResult = {
  currency: "USD";
  totalCents: number;
  components: Array<{
    ruleId: string;
    code: string;
    label: string;
    componentType: FeeComponentType;
    amountCents: number;
    formula: string;             // human-readable, from the rule
    steps: Array<{ label: string; value: string }>;   // transparency
  }>;
  excluded: Array<{ ruleId: string; code: string; reason: string }>;
  assumptions: string[];
  warnings: string[];
  appliedRuleIds: string[];
  asOf: string;                  // ISO date supplied by the caller
};
```

`assumptions` and `warnings` are product features, not debug output. They are
what let the interface distinguish "estimated permit cost" from "official fee".

## 9. What the engine deliberately does not do yet

- **State surcharges priced as a percentage of the local fee.** Needs the
  relative-component primitive (Phase 2).
- **ICC-style valuation derivation.** Many jurisdictions compute valuation from
  square footage × construction-type factor rather than accepting a
  contractor's figure. This belongs in a separate `valuation` module feeding the
  engine, not inside the engine. Planned, and a genuinely valuable differentiator.
- **Refunds, credits and expedite multipliers.** Real, but only after the core
  paths are covered.
- **Multi-jurisdiction combined permits.** Requires modelling which authority
  issues which slice. Phase 3+.

## 10. Testing policy

- Money and rate arithmetic: boundary cases at each bracket edge, exact-bound
  behaviour on both sides, min/max interaction with rounding.
- Conditions: every operator, nested `all`/`any`/`not`, missing facts.
- Regression: every real jurisdiction rule added to the dataset gets a test
  asserting the number against the official document. When a schedule changes,
  the test changes in the same commit as the rule.
- Fixtures are explicitly synthetic (`tests/calc/fixtures.ts`, labelled
  "SYNTHETIC"). No invented jurisdiction data ever enters the app or the
  database.

## 11. Phase 1 additions, driven by real data

Three changes were made after applying the engine to a real schedule for the first
time. Each was forced by a published figure the engine could not reproduce, and
none would have been found by reasoning about the design.

### 11.1 `per_thousand` — a rate in the unit schedules actually publish

`$5.36 per additional $1,000 of valuation` is `0.536%`, i.e. **53.6 basis points**.
Basis points are integers, so this rate is not representable, and rounding it to 54
would make every structural fee in Houston wrong (a $150,000 valuation would come
out $1.44 high, before compounding through the brackets).

```ts
{ feeType: "per_thousand",
  config: { basis: "valuation", centsPerThousand: 536,
            thresholdCents: 700_000, incrementCents: 100_000, baseCents: 4_700 } }
```

`incrementCents` models the schedule's "or fraction thereof": the chargeable
portion is rounded **up** to the next increment before the rate is applied. That is
not cosmetic. For a valuation of $150,000.01, the chargeable amount above $7,000 is
$143,000.01, which rounds up to 144 increments and costs a full $5.03 more than
the exact basis would.

`applyCentsPerThousand` divides by 100,000 (cents → dollars → thousands of
dollars) as a single integer operation with one half-up rounding at the end.

### 11.2 `per_unit` gained a free allowance, and it is not a money primitive

A schedule that says *"$34.24 for the first 3 fixtures, plus $11.41 for each
additional fixture"* looks like a base plus a rate above a threshold, which is the
shape of `per_thousand`. It is not, and treating it as one was wrong by a factor of
1,000: `per_thousand` means cents per 1,000 *units of basis*, so a fixture rate
entered there charges 1.141 cents per fixture.

The real distinction is the **nature of the basis unit**. A valuation is money, so
"per $1,000" is a legitimate scale factor. A fixture is a countable object, and
nothing is priced per thousand fixtures. `per_unit` now carries `baseCents` and
`thresholdUnits`, counted in whole units.

Validation rejects `baseCents` without `thresholdUnits`, because that combination
would charge the base amount *and* the per-unit rate for the first unit.

### 11.3 Every per-unit kind gets its own input

Two schedules that both say "per fixture" are two different inputs if they count
different things. Pointing a sewer connection, a wall heater and furnace tonnage at
a single shared `fixtures` input means one number typed by a user is consumed by
three unrelated rules, and the total is silently too high.

`PER_UNIT_KINDS` therefore enumerates each thing a schedule can count
(`furnaces`, `heaters`, `openings`, `connections`, `tons`, `lighting_fixtures`, …),
and each kind maps to its own fact key under the `custom.*` namespace. Adding a kind
is additive and needs no migration, because a rule's `config` is JSONB.

### 11.4 What this section is evidence for

The engine's shape survived contact with real data: no primitive changed, and both
additions are new cases rather than modifications. What did *not* survive is the
assumption that similar-looking formulas are the same primitive. The regression
suite caught that within minutes, because it asserts the city's own published
figures rather than re-deriving them.

## 12. The engine runs on the page, not only in tests

For a while the engine was exercised only by tests, and the published pages showed
worked examples whose breakdown and total were written into the content. That is
the one arrangement this project cannot accept: a stored amount is an amount that
can drift from the fee schedule it claims to come from.

The published example now carries **inputs and prose only** (`WorkedExample` in
`src/lib/content/types.ts`). Its `asOf` is absent from the stored shape on purpose
— the example is computed as of the date the page is rendered, so it cannot show a
superseded rule. The page passes those inputs and the rules read from PostgreSQL to
`calculatePermitFees` and renders the result, including the rules it left out and
the reason for each.

The consequence is worth stating plainly: editing a rate changes every example that
uses it, and a figure moving is a signal rather than a bug.

### 12.1 Two labels the engine now owns

Putting the output in front of readers exposed two things the engine was quietly
getting wrong, both of which are now the engine's responsibility:

- **`describeApplicability(rule)`** replaces a fallback of "Always applies". That
  was false of a per-item row: Houston's outlet fee applies to each outlet on the
  permit, and a permit with no outlets does not incur it. The engine knows which
  fact a rule reads, so it says that.
- **`describeCalculationInput(input)`** turns the inputs into display rows, using
  the same label maps the calculation uses. A reader sees `Number of outlets: 40`
  rather than `fixtures: 40`, because the two are different facts.

### 12.2 Two `PerUnitKind`s added after the first Houston transcription

Both were the same mistake — reusing a kind that reads another row's input — and
neither was a fee-amount error:

| Rule | Was reading | Now reads | Why it mattered |
| --- | --- | --- | --- |
| `ELEC-118.6.1-OUTLET` | `fixtures` | `outlets` | The amount was right, but the breakdown described 40 outlets as 40 plumbing fixtures, and an electrical rule shared an input with a plumbing rule. |
| `PLUMB-118.5.4-SEPTIC` | `openings` | `septic_tanks` | A septic tank is not an opening, and `openings` is the count §118.5.3 reads. Neither rule was charged in fact — §118.5.3 was attached to no permit type — so this was latent, and became live the moment §118.5.3 was linked. |

The general rule, now enforced by a test: **within one permit type, no two
per-unit rules may read the same count.** Two rules reading one number charge the
same items twice.

## 13. Phase 2 additions, driven by Dallas

Dallas's schedule is unlike Houston's in three ways, and each one cost a small,
specific extension rather than a redesign. No new fee type was needed, and no
migration: a rule's `config` is JSONB, and the only new enum value (`trades`) lives
in TypeScript.

### 13.1 Exact rational rates, and what unit a rate is in

Dallas publishes `× 0.027665 + $350` and `× 0.005095 + $1,100`. As basis points
those are 2,766.5 and 509.5 — not integers — so a basis-point rule would have to
round *before* multiplying, and the City's own worked example for a $6,000,500
valuation would come out $30.55 short. The rate is therefore stored as a fraction
(`{ numerator: 5095, denominator: 1_000_000 }`) and applied through BigInt, which is
the one place in the engine where 2^53 is genuinely reachable: `$100,000,000` of
valuation is 10^10 cents, and a denominator of 10^8 pushes the product past it.

The same fraction means different things against different bases, which is what
`rateUnit` records:

| Schedule | Basis | Rate | Said as |
| --- | --- | --- | --- |
| `× 0.027665 + $350` | valuation | `{27665, 1_000_000}` | `2.7665%` |
| `× 0.34569 + 300` | square feet | `{34569, 1_000}` | `$0.34569 per sq ft` |

The arithmetic is identical; only the sentence changes. Without it, Table A-I would
read "3456.9% of project area", which is true and useless.

A third detail came with it: Dallas's brackets charge the rate against the **whole**
basis, not the part above the bracket floor. `2,500 × 0.077 + 800 = $992.50` is the
City's own figure; a marginal reading would give $811.55. That is the `tiered_marginal`
primitive's opposite, and it is expressed by giving each bracket a `percent` rule with
mutually exclusive conditions, so the brackets sum to exactly one component.

### 13.2 `whichever is greater`: a rate with a floor

`max(area × $0.046, $577)` needs no new primitive — `minimumCents` on a rule clamps
the component, and the clamp is reported as a step so the breakdown shows why the
number is what it is.

What the engine still cannot express is a maximum of two **functions** — Dallas's
alteration fee is `max(valuation table, trade-count table)`, and that is why Table B-I
is not modelled. Recording it here so the next jurisdiction does not rediscover it: a
composed rule (one component defined as the max of two others) is the missing shape,
and it should be added when a second jurisdiction needs it, not for one.

### 13.3 `trades` is a count, and counts are not money

Dallas prices a permit's trade inspections by *how many trades* the job involves.
That is a `per_unit` rule on a new kind, `trades`, with `maximumCents: 112_500`
reproducing the schedule's nine published rows exactly (nine or more is the last row).
It is its own kind rather than a reuse of `inspections` for the reason §12.2 gives:
two rows reading one input charge the same thing twice.

### 13.4 Rule configs are strict, and that is a correctness property

Every config object is now `z.strictObject`. Zod strips unknown keys by default, and
this cost a real error during Dallas's transcription: the plan review floor was
written inside `config` instead of beside it, validated cleanly, lost the field, and
published $115 where the schedule's floor is $577. No error was raised anywhere.

With strict configs the same mistake fails validation, the seed refuses to write the
rule, and the engine reports it as `invalid_rule` on any row that slipped through. A
field in the wrong place is now a loud failure instead of a quiet wrong number — which
is the whole of this document's premise, applied to the config shape itself.

### 13.5 What this section is evidence for

For the third jurisdiction, the expected cost is: a per-square-foot table is now
`percent` + `rateUnit` + mutually exclusive brackets; a per-trade table is `per_unit`
with a ceiling; a table that steps down as the value rises is already handled; and the
only shapes still missing are a composed max, and whatever a jurisdiction publishes
that nobody has seen yet. Dallas cost three small extensions. That number should fall,
and if it does not, the primitives are wrong rather than the jurisdictions being hard.

## 14. Phase 3 additions, driven by Phoenix

Phoenix was the third jurisdiction, the first outside Texas, and the first whose plan
review is a function of its permit fee. Two things were added, and the prediction
above held: fewer extensions than Dallas, and both of them shapes that had already
been identified as missing.

### 14.1 `permit_fee` — a component defined as a percentage of another

```jsonc
{ "basis": "permit_fee", "rateBps": 8000 }   // 80% of the permit fee
```

The basis resolves to **the sum of the `base` components computed in the same run**.
That is the same quantity schedules call "the permit fee" when they price plan review
against it, and it is why this is a *basis* rather than a new fee type: a basis lives
inside a rule's JSONB `config`, so nothing in the PostgreSQL schema changed and no
migration was needed.

It is not an input, and the engine does not treat it as one. Two decisions make it
safe:

1. **Evaluation order is separate from display order.** Base components are evaluated
   first whatever priorities the jurisdiction assigned, and the breakdown is restored
   to the schedule's own order before it is returned. Priorities therefore cannot
   silently zero a percentage — the mistake would be invisible otherwise, since $0 of
   plan review looks like a plausible number until you compare it with the schedule.
2. **No base fee means no percentage.** The fact is injected only once a non-zero base
   subtotal exists. A `permit_fee` rule with nothing to price is reported as a
   **missing input** — an excluded component and a warning — rather than as a confident
   0%, or as its published minimum applied to a fee that has no base.

What `permit_fee` deliberately does **not** do is model a maximum of two functions
(the obstacle in §13.2) or a percentage of a *non-base* component such as a
surcharge. Both remain unbuilt.

### 14.2 A marginal band description that states its rounding

Phoenix's Table A bands by whole thousands and charges "or fraction thereof" in every
band. The evaluator already supported that through `incrementCents`; the **description**
did not mention it. A formula reading "1.2% above $1,000" is wrong by up to a whole band's
rate whenever the valuation is not a round thousand, and the page's formula column and
worked-example breakdown both come from that description.

So `describeFeeRule` now appends the rounding for `tiered_marginal`, and a zero-rate
band — legitimate, and how a base amount covering the first band is expressed — reads as
"no charge on the first $1,000" instead of "0% of the first $1,000". The evaluator is
unchanged; only what it says about itself is.

### 14.3 What this section is evidence for

The third jurisdiction cost two extensions to one already-closed primitive plus one
description fix, and no new fee type, no new column and no migration. The pattern from
Dallas repeating here — a jurisdiction's fee *shape* needs a small generic addition,
while its fee *rates* need none — is the strongest evidence so far that the primitive
set is the right one and that the cost per jurisdiction is falling.

## 15. Phase 4 additions, driven by Scottsdale

### 15.1 `covered_square_footage` — a second area, not a second name for the first

The City of Scottsdale prices a building permit by area rather than by valuation, and it
prices **two different areas of the same building**: `$0.94` per square foot of "area with
A/C" plus `$0.54` per square foot of "covered area (non A/C)", then plan review at `$0.54`
and `$0.34` on the same pair. A 2,500 sq ft house that includes 400 sq ft of roofed patio
without air conditioning is charged 2,500 feet at one rate *and* 400 feet at the other.

Before this, `square_footage` was the only area the engine could read, so the shape was not
expressible at all. Reusing `square_footage` for both rows would have been worse than
inexpressible: it would charge one entered number twice, at two different rates, and the
result would look like a plausible fee.

So `FEE_BASES` gained `covered_square_footage`, which reads the fact
`custom.covered_square_footage`. Two properties of that choice are deliberate:

* **The two areas can never be confused for one another.** A basis maps to exactly one
  fact key (`BASIS_FACT_KEYS`), and the per-unit kinds already established the convention
  that a distinct input gets a distinct key. A rule reading the wrong area is not
  expressible by accident — it takes writing `square_footage` where you meant the other
  one, which is what happened once during this jurisdiction's transcription and was caught
  by the test that asserts which basis each stored rule reads.
* **It is a `custom.*` fact, so nothing migrated.** No column, no enum, no constraint.
  That also means nothing in the database *enforces* the distinction, which is why the
  guard is a test over stored rules rather than a schema constraint.

What the engine shows a reader follows from the same map: the inputs table calls the fact
"Covered area" and the breakdown calls the rule's basis the same thing, because
`describeCalculationInput` resolves a `custom.*` fact through `basisForFactKey` before it
falls back to a humanised key.

#### The area noun is part of the rule, not the formatter

`rateUnit: "currency_per_unit"` (§13.1) says a rate is money per unit of the basis. Which
unit that is comes from the basis, so `$0.94 per sq ft` and `$0.54 per sq ft` are produced
by the basis-keyed noun map in `engine.ts`, and the same fraction quoted against
`valuation` still reads as a percentage. Adding the second area therefore needed no formatting change at
all.

### 15.2 The 30% remodel rate, and why it is stored as a fraction

Every remodel and tenant-improvement row in Scottsdale's residential and commercial
schedules prints `$0.94 sq. ft. x 30%`, which is **$0.282** a square foot — and plan review
repeats it as `$0.54 sq. ft. x 30%` = **$0.162**. Neither is a whole number of cents, and
neither is a whole number of basis points of anything. They are stored as the exact
fractions `282/10` and `162/10` cents per square foot (§13.1), so the arithmetic is exact
and the published rate is reproduced rather than approximated.

Two scope decisions are worth recording because they are about the *model*, not the rates:

* **A remodel pays the full covered-area rate and no covered-area plan review.** The
  residential remodel row scales the area-with-A/C rate and leaves `$0.54` unscaled, and
  neither the residential nor the commercial remodel row prices a covered area in plan
  review at all. That asymmetry is the City's, so it is expressed as rule scope rather
  than smoothed into a single percentage per row.
* **The rows this site does not model produce no fee.** The 70% roof-modification, 95%
  shell-only and 25% foundation-only rows are published and not transcribed, so every rule
  is scoped to new construction, additions and remodels and nothing else matches. The
  alternative — unscopped rules — would charge a shell-or-foundation project the
  new-construction rate, which is the failure mode a fee engine exists to prevent.

### 15.3 What this section is evidence for

The fourth jurisdiction needed one new basis and no new fee type, no new modifier, no new
column and no migration. The cost is still falling, and this is now three jurisdictions in
a row where the *shape* of the fee was the only thing that required an engine change: a
second area here, a self-referential percentage in Phoenix, a trade count in Dallas.

The other thing this jurisdiction demonstrated is where the risk has moved. Nothing about
Scottsdale's rates was hard to read; the danger was in mapping four rules onto two
same-typed numbers, which no type checker and no schema can catch. The guards that did
catch it are over stored rows — `tests/content/scottsdale-seed.test.ts` and
`tests/integration/scottsdale-database.test.ts` both assert *which basis each rule reads*,
not only what the total comes to. As the primitive set grows, that is the class of test
that keeps paying.

## 16. Phase 5 additions, driven by the Arizona trade pages

Phoenix and Scottsdale each gained an electrical and a plumbing page in the same release, and
between them they needed one new primitive class and one description fix. No new fee type, no
new modifier, no column, no migration.

### 16.1 Two more per-unit kinds, because a count is not a kind of money

`per_unit` had fourteen kinds. Two more arrived together, and the reason both needed their own
is the same reason `outlets` and `septic_tanks` did (§12.2): a distinct thing that gets counted
must not be able to read another thing's count.

* **`meters`** — Phoenix prices "each additional meter per utility" at $98. The obvious
  shortcut is `connections`, which already existed for Houston's sewer connections. It is
  wrong twice over: a project adding three water meters has three meters and no new sewer
  connection, and a project adding a sewer connection has no meter. Two rules addressing one
  input is how a reader gets charged for something they did not order.
* **`backflow_devices`** — Phoenix charges $195 for the first and $98 for each one after it.
  This is a *base amount plus an allowance*, which `per_unit` already had, so nothing new was
  needed structurally; only the kind. Sharing `fixtures` would have described six backflow
  devices as six fixtures on a plumbing page, and would have let the two rules read one another.

### 16.2 An allowance is not a zero charge

Phoenix's meter row is *"First Gas, Electric, or Water Meter — No additional fee (included with
the permit fee for one meter of each type); Each Additional Meter per Utility — $98 each"*. That
is an allowance: one meter is paid for by the permit fee already.

The first transcription modelled it as `per_unit` with an allowance of one and no base amount,
which computes correctly and described itself as:

```
$0.00 for the first 1 meters, plus $98.00 for each additional meter
```

Three defects in one sentence. "1 meters" is ungrammatical; "$0.00 for the first meter" states a
charge of nothing for something that is included; and a reader comparing that line with the
schedule's own wording would not recognise it. The formula string is not decorative — it is
printed in the fee-structure table and in every worked-example breakdown — so it was fixed at
the source, in one shared `describePerUnit` used by both the evaluator and the rule description
(previously the two built the sentence separately, which is how a formula and its description
drift).

Two shapes now, and the difference is the difference between "this costs nothing" and "this is
included":

```
the first meter is included in the permit fee, then $98.00 for each additional meter
$195.00 for the first backflow device, plus $98.00 for each additional backflow device
```

A count of one is also said as "the first backflow device" rather than "the first 1 backflow
devices". Houston's pinned description — `$34.24 for the first 3 fixtures, plus $11.41 for each
additional fixture` — is byte-identical before and after, which the existing test asserts.

### 16.3 The two shapes the trade pages needed, and neither was new

What is worth recording is what did **not** change. The Phoenix pages are Table A plus a
per-unit fee plus two conditional flat fees; the Scottsdale pages are flat fees made mutually
exclusive by a condition on a `custom.*` fact. Every one of those was expressible already:

| Need | Primitive used | Already existed from |
|---|---|---|
| A permit fee priced from valuation on a trade permit | `tiered_marginal` on `valuation` | Houston |
| $98 per additional meter, first included | `per_unit` with `thresholdUnits` | Houston's fixtures |
| $195 for the first device, $98 after | `per_unit` with `baseCents` + `thresholdUnits` | Houston's fixtures |
| A $195 inspection only where one was requested | `flat` + a boolean `custom.*` condition | Dallas's conditions |
| Five published permit fees that must never sum | `flat` rules conditioned on one `custom.*` fact | new *use*, no new primitive |

The last row is the interesting one, and it is a modelling pattern rather than an engine
feature. Scottsdale's Miscellaneous schedule lists a minimum for a one-discipline permit *and*
flat fees for individual items, and never says the minimum floors them. Two rules that both
fired would charge **$184 for a water heater the City prices at $63**. The fix is a single
`custom.schedule_item` fact that the item rules match *by value* and the minimum rule matches by
**absence** — so exactly one of them can fire, and the ones that do not are reported as
excluded with a reason rather than silently skipped. The engine needed nothing; the content
needed to be arranged so that the wrong answer is unrepresentable.

### 16.4 What this section is evidence for

The fifth release cost two per-unit kinds and a sentence. Five fee shapes across four
jurisdictions — per-$1,000 valuation, marginal bands, two areas, a self-referential percentage,
and a flat fee per item — have now been modelled without a new fee type since Dallas.

---

## 17. Phase 6 additions, driven by the Nevada valuation tables

Two jurisdictions in one state, both pricing by valuation, and the pair is instructive precisely
because their conventions differ. One of them needed an engine change; the other needed nothing
at all.

### 17.1 `per_thousand` grows an exact rational rate, and why the field name is a trap

`per_thousand` stored **whole cents per $1,000**: `$5.36 per $1,000` is `centsPerThousand: 536`.
That holds for every rate published by Houston, Dallas, Phoenix and Scottsdale, and it does not
hold for Clark County, whose Table 3-A publishes:

| Published rate | In cents per $1,000 | Representable as `centsPerThousand`? |
|---|---|---|
| $1.683 per additional $100 | 1,683 | yes — the step is $100, so the per-$1,000 rate is whole |
| $7.371 per additional $1,000 | **737.1** | no |
| $4.725 per additional $1,000 | **472.5** | no |
| $3.402 per additional $1,000 | **340.2** | no |
| $2.934 per additional $1,000 | **293.4** | no |

This is the same problem Dallas's `0.027665` created for `percent`, in a different primitive, so
it is solved the same way: `rateCentsPerThousand?: { numerator, denominator }`, mutually
exclusive with `centsPerThousand`, with the schema requiring **exactly one** of the two. Nothing
about the existing seven jurisdictions changes — a rule that writes `centsPerThousand` keeps
meaning what it always meant.

**What it defends, with the actual numbers.** The first version of the $7.371 band stored
`centsPerThousand: 7_371` — "7.371 dollars per $1,000" read as 7,371 cents. The schema accepted
it. The type accepted it. The description, the page prose and the code review all agreed with it,
because all of them were reading the same natural-language phrase. It charged a **$25,000**
valuation **$1,774.62** where the table says **$248.82** — ten times the published fee, in cents,
in a stored rule.

The thing that caught it was a boundary-value arithmetic test: run the rules at $25,000 and
compare against the figure the band's own opening line publishes. That is now asserted twice —
in the payload's own test file, and in `npm run db:verify`, which reads the stored JSON back out
of PostgreSQL and checks both the storage (`rateCentsPerThousand {7371, 10}`, no
`centsPerThousand`) and the arithmetic it produces. A rate field named in cents is a trap for
anyone reading a schedule printed in dollars, and the only defence that worked was computing with
it at a boundary.

### 17.2 `low_voltage_points`: a count is a kind, not a synonym

Clark County's electrical table charges `$0.45 — for signals, alarms, or television outlets,
control panels, telephones, switchboards, each`. Houston already had an `outlets` count, and one
of those words is *outlets*, so the shortcut was available: read it as `outlets`.

It would have been wrong twice over. Half the list is not an outlet — a switchboard is not a
sink or a receptacle, and a control panel is not on the wall of a bedroom — and the two
jurisdictions would then be charged from a single number, so a project with 40 outlets and a
switchboard would answer one count of 41 for two different published rows. The rule from §15.1
applies unchanged: **a per-unit kind is a distinct countable thing, and sharing one between two
schedules is a claim that they count the same thing.** `panels` was reused for the $4.35 subpanel
row, because an electrical panel is exactly what that row prices.

### 17.3 The shape that needed nothing: a bracket table with rate rows above it

Boulder City's Valuation Table is a `tiered_table` of 51 published ranges, and above $50,000 the
schedule stops publishing brackets and publishes two `per_thousand` rows instead. Two things
follow, and both were expressible already:

* **The table is capped by a condition** (`valuation lte $50,000`), because the last bracket and
the first rate row are the same money at the same valuation. Range-bounded `tiered_table` plus an
open-ended `per_thousand` row above it would have charged a large project both. The cap is the
mechanism, and a boundary test at $50,000 and $50,001 pins it.
* **The $40 issuance fee is attached to one permit type only.** The schedule's header says it
  applies *"unless indicated"*, and each trade block indicates otherwise in print with *"Price
  Includes Issuance Fee"*. So the rule exists once, linked to the building permit, and the two
trade pages are correct by construction rather than by remembering to subtract it. This is the
same discipline as Scottsdale's mutual exclusion: arrange the model so the wrong answer is
unrepresentable rather than writing prose that warns against it.

Neither was a new primitive. That is worth recording alongside the additions above: the sixth
release needed one rate field and one count, and half of it needed nothing, which is evidence
about the primitives rather than about the schedule.

### 17.4 What this section is evidence for

The engine's job is to make the printed rate **representable**, and then to make the boundary
checkable. Both failures this phase produced were representational: a rate that fitted in no
existing field, and a rate that fitted in a field whose name said ten times the value. Neither
was a subtle arithmetic error; both were the model quietly disagreeing with the document.

So the guards that mattered were the ones that compare the model to the document *at a boundary*:
the value at each band's top against the opening figure of the band above. That check produced
the opposite result in Clark County from the one it was written for — it found no error in the
seams, and instead documented that **four of five close and the fifth is four cents apart in the
County's own table**, which is now stated on the page rather than smoothed over. A fee schedule
is a document, and a document can disagree with itself; the site's job is to say so, not to
reconcile it.

The risk has moved decisively into the *content*, and the guards have moved with it. Every
number on these four pages is asserted twice: once against the published figure in a content
test, and once against the same figure read back out of PostgreSQL. And the assertions that
turned out to matter most were the negative ones — that the one-discipline minimum is
`conditions_not_met` when a water heater is selected, that no trade rule is a rate, that Table A
is read by exactly the bases it claims. A test that a number equals 63 has caught nothing; a
test that the *other* number is absent caught this release's only real modelling risk.

## 18. Phase 7 additions, driven by Washington

Colorado's two jurisdictions needed nothing, and Washington's first needed nothing either,
which is worth stating before the addition that follows: **the fifth and sixth jurisdictions in a
row were expressible with the primitives that already existed.** King County's contribution to
`src/lib/calc` is a component type it already had, and the value of recording that is that the
primitives are holding under schedules that look nothing like the ones that produced them.

### 18.1 `fee_subtotal`: a surcharge on the bill rather than on a component

Seattle's technology fee is not a fee. SMC 22.900A.100 reads:

> "A technology fee will be applied in addition to all listed fees in Chapters 22.900B, 22.900C,
> 22.900D, 22.900E, 22.900F and 22.900H in the amount of five percent of all fees or charges
> required under the above chapters."

Every other percentage in this dataset is a percentage of **one** thing: a valuation, an area, a
unit count, or the permit fee. This one is a percentage of **the whole bill**, which is a
different object. A percentage of each component separately is not a percentage of the total —
on a $2,000,000 Seattle project the components sum to $29,968.00 and the difference between the
two readings is a few cents, but they are different readings and one of them is wrong.

The addition is a sixth `FeeBasis`:

* `permit_fee` sums the run's **base** components — what a schedule means by "the calculated
  permit fee". Phoenix, Denver and Westminster are read on it.
* `fee_subtotal` sums **every** component computed so far in the same run, of any type: the
  index, its plan review, any other charge already applied.

The distinction is not cosmetic. A campaign of rules can have several base components (Seattle's
index plus a review percentage of it), and a surcharge that reads "all fees or charges required"
must see all of them and nothing that comes after it.

### 18.2 Ordering became a property of the model, not a detail of the code

Because `fee_subtotal` depends on what has already been computed, the engine now has to
**order** components, and that ordering is a claim about the documents. It is stated in
`priority`: lower runs first, and the technology fee sits at 900 with the state fee at 999 —
the technology fee applies to the fees the subtitle sets, and the Building Code Council fee is
imposed by a statute outside those chapters.

The same shape appears on King County's electrical page for a different reason: the over-600-volt
surcharge is a `surcharge` whose base is a permit, not a fee, and it is modelled as its own rule
that depends on nothing but a boolean feature of the work. Two jurisdictions, two reasons, one
mechanism — which is the test of whether the mechanism was the right one.

### 18.3 What this section is evidence for

Two things, and the second is the more interesting.

**The first is about adequacy.** Four of Seattle's rows fitted existing primitives exactly
(index table, review percentages, per-unit and per-amperage rows), and one did not. That ratio
is not an accident of this schedule: every phase has added one or two shapes and then published
several jurisdictions that needed none. The engine is converging, and the way that shows up is
that new phases cost a field instead of a design.

**The second is that the interesting new information was in the *conditions*, not the
primitives.** Seattle's Table D-15 publishes overlapping rows — a 200-ampere service is $292.00
under one item and a 200-ampere feeder is $146.00 under another — so an amperage alone cannot
choose a fee, and every rule had to be gated on the **kind of work** as well as its size. The
model had the vocabulary for that already (`custom.*` conditions); what it did not have was any
reason to use it, because no schedule published before this one priced two different things by
the same measurement. The test that pins it is negative: an electrical calc with an amperage and
no named item must return **zero**, not the first band. A rule that can be reached by accident is
a rule that will charge the wrong price eventually.

## 19. Phase 8 additions, driven by Oregon

Oregon's two jurisdictions needed two additions, and both are of the same kind: the document
prices something by a *measurement that is not a plain multiple of a rate*, and the model had no
way to say so.

### 19.1 `thresholdCents` on `percent`: a fixed amount for the first block, then a rate on the
rest

Portland's electrical schedule prices a residential rewiring job in one row:

> "Residential Square Foot Wiring Packages for New and Remodel: Single or multi-family, per
dwelling unit. Include garage. Service included. The first 1,000 square feet — $408.00; each
additional 500 square feet or portion thereof — $93.00."

Every primitive in the engine could express one of those halves and none could express both.
`flat` would have charged $408.00 for a 10,000-square-foot house; a plain `percent` on
`square_footage` would have charged the first 1,000 square feet at the per-block rate as well,
producing $408.00 **+** 1,000 sq ft of rate rather than $408.00 **for** the first 1,000. The
published row is an amount *followed by* a rate over the excess, and `per_thousand` already had
exactly that shape in `thresholdCents` — a basis threshold subtracted before the rate is
applied, with `incrementCents` rounding the excess up to whole blocks afterwards.

So `percent` grew the same field, under the same name:

```jsonc
{
  "basis": "square_footage",
  "baseCents": 40_800,                                   // $408.00 for the first …
  "thresholdCents": 1_000,                               // … 1,000 sq ft (measured in the basis's unit)
  "rate": { "numerator": 186, "denominator": 10 },      // $18.60 per square foot …
  "rateUnit": "currency_per_unit",
  "incrementCents": 500                                  // … per 500 sq ft or portion thereof
}
```

The arithmetic is `baseCents + rate × ceil((basis − thresholdCents) / incrementCents)`, with the
subtraction floored at zero so a measurement under the threshold pays the base only. The rate is
an exact rational because $93.00 per 500 square feet is $18.60 per square foot, and 18.6 is not a
whole number of cents — the same extension Dallas needed for `0.027665`.

The reason this is worth a field rather than a special case is the **boundary**, and the boundary
is the whole reason the row exists in the schedule. At 1,000 square feet the fee is $408.00; at
1,001 it is **$501.00**, not $408.19, because one square foot past the allowance buys a whole
500-square-foot portion. At 1,700 it is $594.00, and at 2,001 it is $687.00. Those four figures are
asserted in the payload's test and again from PostgreSQL, because a threshold applied to the wrong
basis — square feet against thousands of dollars, say — is a silent factor-of-a-thousand error of
exactly the class §17.1 was written about.

### 19.2 `bathrooms`: the same rule as §17.2, from the other direction

§17.2 records that a per-unit kind is a **distinct countable thing**, and that reusing one kind
between two schedules is a claim that they count the same thing. Oregon is that rule applied
inside a *single* schedule. Portland's plumbing document prices a new one- or two-family dwelling
by **baths and kitchens** — $792.00, $1,187.00, $1,388.00, plus $334.00 for each additional bath
or kitchen — and prices **everything else** at $63.00 per **fixture or item**. Two counts, one
document, and the state rule (OAR 918-050-0100) is what makes the first one a count of baths
rather than of fixtures.

Charging both from one number would be wrong in both directions: a two-bath house with six
fixtures would be billed as either two fixtures or six baths. So `bathrooms` is its own
`PerUnitKind` with its own fact key, and the tests pin the exclusivity negatively — **a two-bath
house with six fixtures entered pays the bath row and no fixture line at all** — because the
failure mode here is a double charge, not a missing figure. The general shape is the one the
Boulder City pass produced: make the wrong answer unrepresentable (the bath rows and the fixture
rows are gated on mutually exclusive conditions) rather than writing prose that warns against it.

### 19.3 Four corrections this pass made to output already published

The additions above are two fields. The more useful record is the four things Oregon's pages
*exposed* as already wrong, because none of them was caught by a type, a schema or a test that
existed at the time:

* **`fee_subtotal` was not formatted as money.** `isMoneyBasis` covered `valuation` and
  `permit_fee` but not `fee_subtotal`, so Seattle's 5% technology fee displayed as `149840` on a
  published page where every other component rendered `$1,498.40`. The predicate now names all
  three bases, which is the correct list: they are the bases whose value is a number of cents.
* **`describePerUnit` mis-described an included allowance of zero.** Where a schedule charges a
  base amount and *no* included units — King County's and Seattle's `$137.00 plus $27.00 per
  fixture` — the description read *"the first 0 fixtures is included in the permit fee, then $27.00
  for each additional fixture"*. Three published pages said that. The fix is one branch: when the
  allowance is zero and there is a base charge, say "$137.00 plus $27.00 per fixture". A description
  is output too, and it is read by the same people who read the number.
* **Prose stored with escaped separators rendered as escapes.** This one is not in `src/lib/calc`
  at all, and it is included here because it is the same failure mode as the other two: the model
  was fine and the *rendering* was wrong. Three published payloads (Westminster, King County,
  Seattle) held `\n\n` as two literal characters rather than a paragraph break, so the browser
  showed the escape and each page's prose as one block. The prose test that should have caught it
  listed six seeds by hand; Westminster, King County and Seattle were not among them, which is
  precisely why it was not caught. It now iterates `ALL_SEEDS` and forbids escaped separators
  anywhere in the prose, so adding a jurisdiction adds it to the check.
* **The lead was the one block of prose that never went through the parser.** A page's lead is
  set as a standfirst rather than as body copy, so the page header renders it itself — and it was
  rendering the stored string directly. Every lead written with `**emphasis**` in it therefore
  put literal asterisks in the first sentence of the page, on **fifteen** lead blocks across
  twelve jurisdictions: the whole of Washington's, Oregon's, King County's and Portland's permit
  intros, and three hub summaries. The data-level guards had nothing to say about it, because the
  stored string was correct; what was wrong was that a component never called `parseInline`. The
  fix is two lines in `ui/lead-text.tsx`, and the guard is a test that **renders** the component
  — a React component is a function and its return value is a tree of plain objects, so the
  question "did any marker reach the reader" can be asserted without a DOM. It walks every lead
  the site publishes and fails if a `**` survives, or if any emphasis is lost across the split.

### 19.4 What this section is evidence for

The engine additions are two fields and one enum member, in the eighth release, and the pattern is
now stable enough to state plainly: **new phases cost a field, not a design.** The additions were
also both *narrowings* of existing primitives rather than new ones — `thresholdCents` already
existed one primitive over, and `bathrooms` is the §17.2 rule applied within one document.

The evidence that moved is about **where correctness lives**. All four of 19.3's defects were in
output or in prose, and none was reachable by a type or a schema check. What caught the money
formatting was comparing a rendered figure against the surveyor's own arithmetic; what caught the
zero allowance was reading the description a rule produces instead of only its amount; what caught
the escaped prose was a test that iterates the *set of jurisdictions* instead of a hand-kept list;
and what caught the lead was rendering the component rather than the data it is given. Every one of
them was a path a string travels on its way to a reader, and there is now exactly one such path per
kind: prose goes through `EditorialText`, a lead goes through `LeadText`, and both of them end in
the same parser.

So the guards worth adding are increasingly the ones that check the whole dataset, or the whole
route, rather than the rule just written: a test parameterised over `ALL_SEEDS` cannot be forgottenwhen the next state is added, and a test that lists its subjects by hand is a test that will
silently stop covering the twelfth jurisdiction. The lead bug is the sharper version of that
lesson, because no data-level test could ever have seen it — **the thing to test is the thing
the reader receives**, which is the rendered element and not the stored field.

### 19.5 Florida: the first state of counties

The two Florida jurisdictions are both counties, the first pair of counties the site has
covered that are not in the same pair, and Florida is the first state where the jurisdiction's
fee model is not a single document. Miami-Dade prices a building permit by area and by named
item and states its trade sheet's $227.90 minimum as a permit-level `permit_minimum` rule;
Orange County prices by total valuation in two bands that break at $2,000,000 and publishes the
average cost per square foot table it derives that valuation from. The source of the revenue is
the same pair of statutes, and the pages are the argument: Miami-Dade states § 553.721 as a 1%
row and § 468.631 as a 1.5% row, each with a $2.00 floor, so at a $147.00 permit fee it collects
$2.00 + $2.21 = $4.21; Orange County adds the two statutes up first and states one 2.5% row
with a single $4.00 floor, so the same permit pays $4.00. The 21 cents is asserted in both
jurisdictions' tests and in the database, because the two rows are the same two statutes read
the same way, and the difference is exactly the evidence that the two rows are not equivalent.

Two engine requirements came out of Florida. **A building permit is priced by area rather than
valuation** is what Florida's two schedules demonstrate most concretely: Miami-Dade's fees are
per square foot of structure or per named item, and Orange County's are per *total
valuation*, and the engine's `square_footage` and `valuation` primitives are the two ends
of that same axis. **And the same document carries three fee schedules** — the Building
Safety section of the Fee Directory holds the building, electrical and plumbing tables, with
gas on pages 38-39 — so a jurisdiction can be a family of schedules rather than one schedule,
and the payload cites the same source key to all three.

Neither county prices mechanical, and both name the **Plan Submittal Fee** and the private
provider reduction as excluded items rather than modelling them. The pages say so explicitly,
because a reader who wants the total has to know which body will not quote it.

### 19.6 California: two opposite jurisdictions, and a phase that cost no field

California is the first state added with **two jurisdictions whose fee models are
inverses of each other**, which is what makes it a test of the engine rather than of
transcription.

**San Diego prices a building permit from area, as plan check plus inspection.** Table
501A prints one row per project type carrying *two* base-and-increment pairs — "Base
Sq. Ft. 3,000 … Plan Check Base Rate $8,085.26, Increment Rate $4.10 … Inspection Base
Rate $8,401.90, Increment Rate $4.21" — and each pair is a `percent` rule read against
`square_footage` with `rateUnit: "currency_per_unit"`, a `thresholdCents` for the base
square footage and a `baseCents` for the printed base rate. The $4.10 is stored as
`{ numerator: 410, denominator: 1 }`, because `applyExactRate` returns **cents**: a
rate of `$0.143` per square foot is `{ numerator: 143, denominator: 10 }`, and writing
`denominator: 100` is a factor-of-a-hundred error of exactly the class §17.1 is about.
San Diego's contribution is therefore **two components from one printed row**, which
the engine already supported; nothing new was needed.

**Sacramento prices a building permit from valuation, as a ladder that hands over to a
formula.** Table A prints a hundred $1,000 brackets from $999 ($75) to $99,999
($1,078), and then stops printing brackets and prints:

```text
$1078 + $0.006787 each $1 > $100,000
$20,761 + $0.005133 each $1 >$3 mil
$56,692 + $0.004620 each $1 >$10 mil
```

The ladder is a `tiered_table` over `valuation`, generated from two arrays (one per
column) rather than transcribed a hundred times. The formulas are three `percent`
rules, each gated to the band it covers, with a `thresholdCents` and a `baseCents` and
an **exact-fraction rate** — `0.006787` is 67.87 basis points, so `rateBps` would round
before multiplying and every Sacramento permit over $100,000 would be wrong by cents.
This is the `rate` extension §11 gave `percent` for Dallas, used for the reason it
exists.

Two details are load-bearing:

- **The ladder's final bracket is left open-ended.** The City's ladder stops at
  $99,999 and the schedule is gated to valuations at or below $100,000, so an
  open top bracket covers only the $100,000 row itself — which is the $1,078 the
  schedule prints there. Closing it would have made the engine report every $100,000
  permit as "above the highest published bracket" and attach a warning to a number
  that is right.
- **The boundary is asserted in both directions.** $100,000 computes $1,078.00 and
  $100,001 computes $1,078.01; $2,999,999.99 computes $20,760.30 and $3,000,000
  computes $20,761.00; $10,000,000 computes $56,692.00. The three gaps of $0.70,
  $0.70 and $0.00 are the schedule's own rounding, printed into it, not an artefact of
  the model — and if a threshold were on the wrong basis, or a rate stored as dollars
  rather than cents, the first of them would not land.

**What the two are evidence for.** Between them the two jurisdictions covered a state
with **zero engine changes**: no new primitive, no new field, no new enum member. That
is a stronger result than any of §17 through §19 established, because those phases each
had to extend something. The pattern the document has been describing — *new phases cost
a field, not a design* — now has its limiting case: a whole state of genuinely different
shapes, priced by the primitives already there, and the only things that needed writing
were the rules and the sentences explaining them.

The one thing Sacramento proved is that a schedule can be **absent from the document
that publishes the fee**. Its four add-ons are not in Table A at all; they live in the
City's searchable fee listing, which is a second source with no effective date of its
own. A payload therefore needs two sources when a city publishes a fee sheet *and* a
fee listing, and citing only the first would have produced a permit fee with no
explanation of the $1,170.00 and $3,600.00 beside it.

### 19.7 Raleigh: composing a published share instead of nesting it

Raleigh's Development Fee Guide prints the electrical permit for a new house as
**"49% of the calculated building permit"** — a percentage of a number the same
document computes somewhere else. The engine already has a basis for that
relationship, `permit_fee` (§14), which Phoenix's plan review rules read. But attaching
the building permit to the *electrical* rule set so the basis could read it would make
the electrical page's total 149% of the building permit: the breakdown would print a
building permit the reader never applied for, and the page's headline figure would be
wrong by construction.

So the rule charges the share against `valuation` at a rate that is the **exact product
of the two rates the guide publishes**, formed in code from two named constants
rather than typed in:

```text
residential electrical  49/100   x 38/10,000  = 1,862/1,000,000  = 0.1862%
residential plumbing    34/100   x 38/10,000  = 1,292/1,000,000  = 0.1292%
commercial plumbing     56/100   x band rate, with 56/100 of the band's base fee
```

The composition is exact because both rates are printed as single flat percentages for
new construction, and scaling the base fee by the same share is what "56% of the
calculated building permit" means when the permit fee itself contains a base. Two
constants move together or not at all; a City rate change is one edit.

**The invariant is asserted across rule sets, not inside one.**
`tests/content/raleigh-seed.test.ts` runs the building rules and the trade rules over
the *same* input and requires the trade component to equal the published share of the
building component — 49% of $1,520.00 = $744.80, 56% of $2,250.00 = $1,260.00. That
test fails if either rate moves without the other, if a rule starts reading the wrong
band, or if the composition is "simplified" back into `permit_fee` on a page that must
not charge a building permit.

Raleigh's other two mechanisms were already in the engine: `permit_fee` for plan
review (§14, Phoenix) and `fee_subtotal` for the **4% technology surcharge** (§18.1,
Seattle and Miami-Dade). The result is a second state in a row — after California —
that needed **no engine change**: everything above is a composition of primitives
already there, and the only new thing was the sentence explaining which of them a
published share requires.

### 19.8 Durham: floors that stack, and a surcharge that is already inside the amounts

Durham's four schedules (building, electrical, plumbing, mechanical, all stamped
*Effective 7/1/18*) need **no engine change either** — the third state in a row — but
they exercise two properties of the engine that no previous jurisdiction had pressed
at once, and one deliberate *absence*.

**1. Stacked `permit_minimum` floors, each measuring the subtotal the last one
raised.** Schedule G publishes three floors on one electrical permit: a $65.00
permit floor, then $100.00 residential / $150.00 for a permit requiring a rough-in
inspection. All three are `permit_minimum` rules on `basis: "permit_fee"`, in
ascending priority (500, 510, 510), each gated on `permit_fee < floor`. Because
`permit_fee` is re-injected before every rule (§14.1), the second floor measures
what the first floor *raised the subtotal to* — so 18 outlets and six fixtures
($65.00 of charges exactly) stop at the first floor, while a rough-in with the same
charges tops up to $100.00. That ordering is not code, it is `priority`, and the
seam tests pin both sides: one cent below a floor tops up, the floor itself does not.

**2. The surcharge rule is absent, on purpose.** Raleigh reaches its technology
surcharge with three `fee_subtotal` rules (§18.1). Durham's schedules state on their
face that **every amount already includes it**, so the payload contains no surcharge
rule at all — and `tests/content/durham-seed.test.ts` asserts that absence by name,
the same way Raleigh's asserts its three presences. An engine with a surcharge basis
can still be right by shipping no rule: what the schedule charges is the whole model.
The $5.00 paper-application surcharge *is* modelled — it is a real added line — and
it sits at priority 800 as a `surcharge` component so it reads the fee subtotal after
the floors have run and is not itself part of what a floor measures.

**3. A plan-review column that is flat while the permit column bands, and bands that
carry their own increment rate.** Schedule A's eight brackets each print $146.00 of
plan review beside a rising permit fee — a flat rule per bracket, not a percentage of
the permit (Raleigh's 57% / 65%). Schedule E prices commercial valuation in five
bands where each band is *flat permit + flat plan review + its own per-thousand
increment* ($780 above $500,000; $660 above $5,000,000; $432 above $10,000,000;
$125 above $50,000,000). That is four `per_thousand` rules gated to mutually
exclusive valuation bands — the Dallas §13.1 pattern — and the seam tests assert
every break from both sides ($500,000 → $500,001 steps $760 at the components
level, $10,000,000 meets exactly at $786.00, the top band opens at $2,514.25).

What Durham is evidence for is the same sentence §19.6 and §19.7 end on, with a new
case: **the primitives hold, and correctness can live in the absence of a rule.**
Two jurisdictions in one state, two opposite treatments of one surcharge, and the
guards that matter are the negative ones — no `fee_subtotal` rule exists in the
Durham payload, no floor fires above its own amount, no band overlaps its neighbour.

### 19.9 Illinois: a fee that is the product of two published tables

Chicago is the first jurisdiction in which **the fee is not any one rule's number**.
§14A-4-412.2.2.1 prices a building permit as `CF × RF × A`: a construction factor
read from Table 14A-12-1204.3(1) by occupancy class and construction type, a
scope-of-review factor read from Table (3) for new construction or Table (4) for
rehabilitation, and the gross floor area. Neither factor is a fee of its own, and
the two are selected by different pairs of facts. This pass added two fields rather
than a thousand rules.

**1. `rateTables`: a rate selected from published matrices.** A `percent` config may
now state its rate as a list of `RateTable`s instead of a `rateBps` or an exact
`rate`. Each table carries its own `keys` (custom facts allowed), its own optional
`rateUnit`, and `entries` of `{ values, rate }`. Exactly one entry matches; the
rule's rate is the **product of the matched rates as exact fractions**, reduced by
their greatest common divisor before it is applied, and each matched row is echoed
into the working as its own step so a reader who wants to reproduce the product can
see both factors. The schema refuses a rule that states its rate twice (`rateBps`,
`rate` and `rateTables` are mutually exclusive), a row whose `values` are the wrong
length for the keys, and two rows for the same combination — the last because a
duplicate would make the match order-dependent, which is a wrong number rather than
an error. A combination the schedule does not publish excludes the rule with
`no_published_rate`, which the breakdown shows as "the schedule publishes no rate"
rather than as a missing input: the reader gave everything, the document is silent.

**2. `floorTable`: the Minimum Fee column, per row of the same table.** A schedule
can print a minimum beside every row of a scope table, and some of those minima are
*per unit* ("$900 per story", "$250 per unit served", "$300 per unit"). `floorTable`
is keyed by the same kind of facts and each entry states a flat `minimumCents`, a
`perUnit` of `{ factKey, centsPerUnit }`, or both — in which case the engine takes
the larger, because both are printed minimums. It is combined with the rule's own
`minimumCents` by the same larger-wins rule, so a schedule's city-wide floor and its
per-row floor can both hold. That is exactly Chicago's footnote c: the tables print
$600 on a row and the footnote puts $602 under every permit, and the row therefore
carries `max($600, $602)`. The temporary-structure row is the case that proves the
field is per-row rather than rule-level: it takes footnote c's **$302**, and a
rule-level $602 floor would have overwritten it.

**3. Three fixes the first user of the fields forced.** `currency_per_unit` reads its
numerator as **cents**, so a published "$0.78 per sq ft" factor is
`{ numerator: 78, denominator: 1 }` and not `78/100`; the first version of the tests
said the latter and produced a fee a hundred times too small, which the row minimum
happily covered up — a wrong number that looks like a floor. A dimensionless table
factor is a **multiplier, not a percentage** (`formatMultiplier`), because printing
Chicago's 0.75 as "75%" invites reading it as a rate against the wrong base. And
`Number of ${label}s` had been the per-unit label for every kind, which is fine until
a kind whose plural is irregular is used — Chicago's per-story floor is the first, and
"Number of storys" reached a warning that a reader sees.

**4. The exclusion is data, and so is the disjointness it depends on.** The two
formula rules carry **no scope condition at all**: a project in one table finds no
row in the other, so the other rule is excluded for publishing no rate. That keeps
`describeApplicability` readable ("Where the schedule publishes a rate for Occupancy
group, Construction type and Scope") instead of printing thirty-nine scope slugs into
the fee-structure table, and it makes the exclusion honest about which document is
silent. It also means a scope slug appearing in both tables would charge a building
twice, silently, so `tests/content/chicago-seed.test.ts` asserts the two slug sets are
disjoint.

What Chicago is evidence for is that the engine's unit of extension is the field, not
the jurisdiction: two config fields carried a schedule whose building fee has 361
selectable combinations, whose trade fees are a different mechanism entirely (flat
stand-alone fees that *stack*, per §14A-4-412.1), and whose demolition sits outside
the formula by footnote. The same pass also derived `scripts/verify-db.ts`'s sitemap
expectations from `ALL_SEEDS` instead of the hand-written list that had silently
stopped at Oregon three states earlier — a check about "the site contains what it
says" that had itself stopped being true.

## 20. Phase 9 additions, driven by New Jersey

New Jersey is the first state in this dataset where the fee's *shape* is not the city's to
choose. N.J.A.C. 5:23-4.18 requires the basic construction fee to be "computed on the basis of
the volume of the building or, in the case of alterations, the estimated construction cost",
plus "a unit rate per fixture or per kilowatt, horsepower or ampere rating of the device", and
leaves the rates to the municipality. Both of this pass's cities therefore price new
construction **per cubic foot**, and both price electrical devices **in blocks**. Those were two
additions, and both are of the additive kind this document has recorded since Dallas: no
primitive changed and no migration was needed.

### 20.1 `cubic_footage`: a third measurement, next to the two areas

The engine had `square_footage` and `covered_square_footage` and no volume. Newark charges
`$0.02` or `$0.03` a cubic foot by use group and Jersey City `$0.027`, with `$0.15` for assembly
and storage-and-factory groups — figures that no existing basis could produce, because a
building's volume is not its area and a rule that read the area would charge a plausible number
for the wrong measurement.

`cubic_footage` is a `FeeBasis` that resolves to the fact key `custom.cubic_footage`, exactly as
the second area and amperage do. That choice is deliberate and it is the same one §15.1
recorded: a basis maps to exactly one fact key through `BASIS_FACT_KEYS`, so a volume can never
be read where an area was meant — the mistake is not expressible by accident, only by writing
one basis where the other was intended. The volume also arrives in the reader's own unit
("Building volume — 60,000 cu ft") rather than as a bare number, because the inputs table and
the breakdown resolve both through the same map.

The rates needed no new field. `$0.027` a cubic foot is `27/10` cents and the State's
`$0.00371` is `371/1000` of a cent, both expressible as the exact rational `rate` that Dallas
introduced in §13.1, quoted against `rateUnit: "currency_per_unit"`. Rounding either of them to
a whole cent first would have moved every building permit in the state: `27/10` read as `3` cents
is 11% high on a 100,000 cubic foot building, and `371/1000` read as `0` cents is a surcharge of
nothing at all.

### 20.2 `incrementUnits` on `per_unit`: blocks of countable things

Newark writes "Receptacles and Fixtures: First 50 — $58; Each additional 20 — $12". Jersey City
writes "for the first block consisting of one to ten (10) receptacles, fixtures, or devices, the
fee shall be twenty-five dollars ($25.00); for each additional block consisting of up to
twenty-five (25) receptacles, fixtures, or devices, the fee shall be twenty-five dollars
($25.00)". Both rows are priced for a **block**, and a count that spills past one buys the whole
next block: Newark's fifty-first device costs $12.00, not the 60 cents a straight per-unit rate
would charge, and Jersey City's eleventh receptacle costs $25.00, not $1.00.

`per_unit` already had `baseCents` and `thresholdUnits` — a base amount covering the first *n*
units — and no way to round what came after. It now has `incrementUnits`, which rounds the count
above the allowance **up** to a whole number of blocks before the rate is applied. It is the
countable analogue of `incrementCents` on `percent`, and it is stored in the count's own unit
rather than in money for the same reason §19.1's threshold is stored on the basis it applies to:
rounding dollars and rounding devices are different operations, and only the second reproduces
the row. The stored rate stays the rate *per single unit* — `$12.00` a block of twenty is 60
cents a device with `incrementUnits: 20` — so the rounding, not the rate, is what makes the
block cost what the document says.

`describePerUnit` grew the matching sentence, and it is a sentence about the document rather
than about the arithmetic: the row now reads "$58.00 for the first 50 outlets, plus $12.00 for
each additional 20 outlets or part thereof", where printing the stored rate would have said
"$0.60 for each additional outlet" — true of the multiplication and false of the schedule. The
rounding is also a step in the working whenever it changes the number, so a permit at 50 devices
shows no rounding and one at 51 shows the block it bought. Houston's pinned sentence
("$34.24 for the first 3 fixtures, plus $11.41 for each additional fixture") is asserted
byte-for-byte in the new tests, because a rule with no `incrementUnits` must not acquire a block
description — which is the reason the branch is written rather than the sentence templated.

### 20.3 `special_devices`: a kind named by the document, not by the engine

Newark's plumbing subcode charges "$75 per special device for the following: Grease traps, oil
separators, refrigeration units, utility service connections, backflow preventers equipped with
test ports …, steam boilers, hot water boilers (excluding those for domestic water heating),
active solar systems, sewer pumps, and interceptors."

Every other per-unit kind in this dataset exists because two things that look alike are not
alike — a meter is not a connection, a bath is not a fixture. This one exists for the opposite
reason: the schedule groups eleven unrelated devices into one row at one price and calls them a
"special device", so one kind with the document's own name is the faithful model. Splitting the
row into eleven kinds would invent eleven prices the City does not publish. It is the same
judgement as §16.1's, read from the other end: the question is not what the devices are but
whether the document prices them apart, and here it does not.

### 20.4 What this section is evidence for

Two fields and one kind, and the interesting part is *why* the fields were needed. Neither was
a gap the engine's users found in the engine; both were gaps a **state** created in every city
inside it. A state-level standard is a different kind of driver from a single schedule's quirk,
and it is the one that makes a new basis worth adding: `cubic_footage` is not Newark's
convention, it is New Jersey's, and the second city in the state needed it on the day it was
added — which is the test this document has been applying since §15.3, applied this time to a
rule rather than to a schedule.

The other thing worth recording is where the risk moved. Nothing here was hard to read: both
cities publish their rates in a codified chapter, and both were transcribed in one pass. The
danger was in three *readings* — whether Newark's alteration table graduates (it does, and
Northfield's sentence saying "an additional fee" is the evidence), whether Jersey City's 25%
plan review is a prepayment (it is, N.J.A.C. 5:23-4.18(a)1 makes it one) and whether a
state-mandated surcharge is charged at the amount the city prints or the amount the state sets
(the state's, because both codes cite the regulation and the city merely collects it). Those are
not arithmetic and no schema can catch them; the guards are the boundary assertions and the
paragraphs on the pages that state each reading in plain words.
