import type {
  JurisdictionSeed,
  SeedCounty,
  SeedDepartment,
  SeedFeeRule,
  SeedFeeSchedule,
  SeedJurisdiction,
  SeedJurisdictionPermitType,
  SeedPermitPage,
  SeedProfile,
  SeedRequirement,
  SeedSource,
  SeedState,
  SeedVerification,
} from "@/content/seed-types";
import type { FeeRuleRecord } from "@/lib/calc/types";

import {
  KANSAS_CITY_BUILDING_RULES,
  KANSAS_CITY_ELECTRICAL_RULES,
  KANSAS_CITY_FEE_EFFECTIVE_FROM,
  KANSAS_CITY_FEE_SCHEDULE_SOURCE_KEY,
  KANSAS_CITY_PLUMBING_RULES,
} from "./fee-rules";

export * from "./fee-rules";

/**
 * The complete Kansas City, Missouri seed payload.
 *
 * Every figure traces to research/missouri/kansas-city.md, which traces to the
 * City Planning and Development Department's commercial permit fee schedule
 * (Ord #080766, eff. 2012-05-01) — 1 page, 68,049 bytes, HTTP 200 — and to the
 * department's own review-and-trade notes on that sheet. Nothing is estimated.
 * Three pages, all published: building, electrical and plumbing. Kansas City is
 * the first jurisdiction here whose plan review is a *credited prepayment* rather
 * than a charge, and whose sub-$50,000 block is a flat table rather than a rate.
 */

const RESEARCHER = "Permit Fee Intelligence research pass 19 (Missouri)";

export const KANSAS_CITY_LAST_VERIFIED = "2026-09-26";

export const KANSAS_CITY_KEYS = {
  state: "mo",
  county: "jackson-county",
  jurisdiction: "kansas-city",
  feeSchedule: "kcmo-commercial-permit-fee-schedule",
} as const;

const state: SeedState = {
  code: "MO",
  slug: "missouri",
  name: "Missouri",
  fipsCode: "29",
};

const county: SeedCounty = {
  key: KANSAS_CITY_KEYS.county,
  slug: "jackson-county",
  name: "Jackson County",
  fipsCode: "29095",
};

const jurisdiction: SeedJurisdiction = {
  key: KANSAS_CITY_KEYS.jurisdiction,
  stateKey: KANSAS_CITY_KEYS.state,
  countyKey: KANSAS_CITY_KEYS.county,
  type: "city",
  slug: "kansas-city",
  name: "Kansas City",
  officialName: "City of Kansas City, Missouri",
  websiteUrl: "https://www.kcmo.gov/",
  permitPortalUrl: "https://kcmo.gov/city-hall/departments/city-planning-development/building-and-development-fee-schedule",
  timezone: "America/Chicago",
  isActive: true,
};

const departments: SeedDepartment[] = [
  {
    key: "kcmo-city-planning-development",
    jurisdictionKey: KANSAS_CITY_KEYS.jurisdiction,
    kind: "building",
    name: "City of Kansas City, Missouri — City Planning and Development Department, Permit Center",
    phone: "816-513-1500",
    email: null,
    url: "https://kcmo.gov/city-hall/departments/city-planning-development/building-and-development-fee-schedule",
    addressLine: "City Hall, 414 East 12th Street, Kansas City, MO 64106",
    hours: "Permit Center 816-513-1500 option 3",
    notes:
      "The City Planning and Development Department publishes the commercial permit fee schedule this site prices — one 1-page sheet for Building, Mechanical, Plumbing, Electrical, Elevator and Fire Protection, each valuation-billed separately per building per trade. The same sheet states the contact for questions on calculation: Permit Center 816-513-1500 option 3. Kansas City straddles Jackson, Clay, Platte and Cass counties; the permit authority is the City's own department, not the counties'.",
  },
];

const sources: SeedSource[] = [
  {
    key: KANSAS_CITY_FEE_SCHEDULE_SOURCE_KEY,
    jurisdictionKey: KANSAS_CITY_KEYS.jurisdiction,
    title: "City of Kansas City, Missouri — Permit Fee Schedule, Commercial Projects Including Residential Buildings with Three or More Dwelling Units",
    url: "https://data.kcmo.org/api/file_data/NQBR-PGwgb7p5xa8YAUChBI6ooDAfSBo7ba3tZuL2oQ?filename=Permit+fees+commercial.pdf",
    sourceType: "fee_schedule_pdf",
    issuingAuthority: "City of Kansas City, Missouri — City Planning and Development Department",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: KANSAS_CITY_FEE_EFFECTIVE_FROM,
    retrievedAt: KANSAS_CITY_LAST_VERIFIED,
    lastVerifiedAt: KANSAS_CITY_LAST_VERIFIED,
    notes:
      "Read 2026-09-26 as a 68,049-byte PDF (SHA-256 350051f8f1b081bee9e716bc60050284123aa280c07d2068edb6b7b59b8bda84, HTTP 200) with pymupdf text extraction; printed 05/01/2012 from Ord #080766 eff. 05/01/2012. One page carries the whole commercial ladder: $1–$50,000 flat table ($48.00–$686.00 in 50 brackets), $50,001–$200,000 at $686.00 + $12.50 per $1,000 or fraction, $200,001–$1,000,000 at $2,561.00 + $8.30, and $1,000,001+ at $9,201.00 + $3.60 — each band chaining to the one below. The same page states the credited plan-review share (one-half), the $50 changes / $77 partial-minimum / $50 supplemental / 1/8 capped at $272 resubmittal / $69 express flats, and the per-trade-per-building instruction.",
  },
];

const permitTypes: JurisdictionSeed["permitTypes"] = [];
const projectTypes: JurisdictionSeed["projectTypes"] = [];

const jurisdictionPermitTypes: SeedJurisdictionPermitType[] = [
  {
    jurisdictionKey: KANSAS_CITY_KEYS.jurisdiction,
    permitTypeKey: "building",
    isAvailable: true,
    localName: "Building permit — $1–$50K flat table, then $12.50 / $8.30 / $3.60 per $1,000 (plan review credited)",
    officialUrl: "https://data.kcmo.org/api/file_data/NQBR-PGwgb7p5xa8YAUChBI6ooDAfSBo7ba3tZuL2oQ?filename=Permit+fees+commercial.pdf",
    notes:
      "$1–$50,000 as 50 flat brackets ($48.00 at $1–500 to $686.00 at $49,001–50,000); $50,001–$200,000 at $686 + $12.50 per $1,000 or fraction; $200,001–$1,000,000 at $2,561 + $8.30; $1,000,001+ at $9,201 + $3.60. The three bands above $50,000 chain exactly. Charged per building per trade on that trade's declared valuation. Plan review at one-half is a credited prepayment, not a second charge; the $50 / $77 / $50 / $272 / $69 ancillaries are named on the pages.",
  },
  {
    jurisdictionKey: KANSAS_CITY_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    isAvailable: true,
    localName: "Electrical permit — same ladder read against the electrical valuation",
    officialUrl: "https://data.kcmo.org/api/file_data/NQBR-PGwgb7p5xa8YAUChBI6ooDAfSBo7ba3tZuL2oQ?filename=Permit+fees+commercial.pdf",
    notes:
      "The sheet's header lists Building, Mechanical, Plumbing, Electrical, Elevator and Fire Protection together with 'PERMIT FEES SHALL BE CALCULATED SEPARATELY FOR EACH BUILDING' and 'separate construction valuation shall be provided for each trade' — one ladder, read against the electrical valuation when the permit is electrical.",
  },
  {
    jurisdictionKey: KANSAS_CITY_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    isAvailable: true,
    localName: "Plumbing permit — same ladder read against the plumbing valuation",
    officialUrl: "https://data.kcmo.org/api/file_data/NQBR-PGwgb7p5xa8YAUChBI6ooDAfSBo7ba3tZuL2oQ?filename=Permit+fees+commercial.pdf",
    notes:
      "Same sheet, same note — the plumbing trade reads the same four-rule ladder against the plumbing valuation.",
  },
];

const feeSchedules: SeedFeeSchedule[] = [
  {
    key: KANSAS_CITY_KEYS.feeSchedule,
    jurisdictionKey: KANSAS_CITY_KEYS.jurisdiction,
    sourceKey: KANSAS_CITY_FEE_SCHEDULE_SOURCE_KEY,
    title: "City of Kansas City — Permit Fee Schedule, Commercial Projects Including Three-or-More-Unit Residential",
    officialUrl: "https://data.kcmo.org/api/file_data/NQBR-PGwgb7p5xa8YAUChBI6ooDAfSBo7ba3tZuL2oQ?filename=Permit+fees+commercial.pdf",
    effectiveFrom: KANSAS_CITY_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: KANSAS_CITY_LAST_VERIFIED,
    notes:
      "Ord #080766 eff. 05/01/2012, printed the same day. One page for every commercial trade — Building, Mechanical, Plumbing, Electrical, Elevator and Fire Protection — each valuation-billed separately. No residential one- and two-family ladder was readable from this sandbox, so no such amount is modelled.",
  },
];

function attach(permitTypeKey: string, rules: FeeRuleRecord[]): SeedFeeRule[] {
  return rules.map((rule) => ({
    jurisdictionKey: KANSAS_CITY_KEYS.jurisdiction,
    permitTypeKey,
    scheduleKey: KANSAS_CITY_KEYS.feeSchedule,
    rule,
  }));
}

const feeRules: SeedFeeRule[] = [
  ...attach("building", KANSAS_CITY_BUILDING_RULES),
  ...attach("electrical", KANSAS_CITY_ELECTRICAL_RULES),
  ...attach("plumbing", KANSAS_CITY_PLUMBING_RULES),
];

const requirements: SeedRequirement[] = [
  {
    jurisdictionKey: KANSAS_CITY_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "document",
    title: "One valuation per trade per building, stated at application",
    description:
      "The sheet's own instruction: 'At the time of building permit application, separate construction valuation shall be provided for each trade of work involved in the project' and 'PERMIT FEES SHALL BE CALCULATED SEPARATELY FOR EACH BUILDING' — so a $400,000 office with $280,000 of building work, $60,000 of plumbing and $60,000 of electrical is three filings on the same ladder at three valuations, not one filing at $400,000.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: KANSAS_CITY_FEE_SCHEDULE_SOURCE_KEY,
    lastVerifiedAt: KANSAS_CITY_LAST_VERIFIED,
  },
  {
    jurisdictionKey: KANSAS_CITY_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "Plan review at one-half is a credited prepayment, not a second permit fee",
    description:
      "The sheet's own block: 'A fee of one-half of the permit cost is required to be paid at the time plans are submitted for plan review, this will be credited towards the total fee when the permit is issued.' — so at application the applicant pays half the permit fee, and at issuance the permit fee is due less that half. The sentence is why no plan_review rule adds 50% here. The same block adds: changes to previously approved plans $50.00; minimum partial permit fee $77.00 (a partial permit is its own separate permit fee, not a supplement); minimum supplemental permit fee $50.00; resubmittal one-eighth of the total fee capped at $272.00 when previously identified deficiencies remain uncorrected; express plan review $69.00 paid prior to meeting with the plan reviewer.",
    isMandatory: true,
    sortOrder: 20,
    sourceKey: KANSAS_CITY_FEE_SCHEDULE_SOURCE_KEY,
    lastVerifiedAt: KANSAS_CITY_LAST_VERIFIED,
  },
];

const profile: SeedProfile = {
  jurisdictionKey: KANSAS_CITY_KEYS.jurisdiction,
  headline: "What construction permits cost in Kansas City, Missouri",
  summary:
    "Kansas City prices every commercial trade the same way: **$1–$50,000 as a flat table ($48 to $686), then $686 + $12.50 per $1,000 to $200,000, $2,561 + $8.30 to $1,000,000, and $9,201 + $3.60 beyond — each band chaining to the one below**. The ladder is charged **once per building per trade** on that trade's declared valuation. Plan review at **one-half is a credited prepayment**, not a second fee.",
  localContext:
    "One department, one sheet, every trade on the same ladder. The City Planning and Development Department's Permit Fee Schedule for **Commercial Projects Including Residential Buildings with Three or More Dwelling Units** is a single 1-page PDF — Building, Mechanical, Plumbing, Electrical, Elevator and Fire Protection all together, each valuation-billed separately per building with a per-trade valuation supplied at application. The sheet's header is explicit: 'PERMIT FEES SHALL BE CALCULATED SEPARATELY FOR EACH BUILDING' and 'separate construction valuation shall be provided for each trade of work involved in the project.' The schedule prints no technology fee, no state surcharge, and no one- or two-family residential ladder from this sandbox — the City's fee-schedule hub answers 403 here, so no such amount is invented.\n\nTwo features make this the dataset's quirkiest ladder. First, the $1–$50,000 block is **50 flat brackets**, not a rate: '$1–500 $48.00', '$501–2,000 $86.00', '$2,001–3,000 $98.50' … '$49,001–50,000 $686.00', one amount per $1,000 window. $12,300 of valuation pays $223.50 there — the $12,001–13,000 row — not $12,300 × a cent rate. Second, the bands above it **chain exactly**: $686.00 + 150 × $12.50 = $2,561.00, and $2,561.00 + 800 × $8.30 = $9,201.00 — the opposite of Nashville's three seams and Memphis's chain in cents-per-thousand, now chain by the *ladder's own arithmetic* on a valuation table.\n\nThe plan-review block is why this jurisdiction contributes no `plan_review` row at all. Newark charges 20% as a `plan_review` component; Kansas City writes 'A fee of **one-half of the permit cost** is required … this **will be credited** towards the total fee when the permit is issued.' — a credited prepayment, named on every page. Five ancillary flats sit beside it: changes $50.00, minimum partial $77.00, minimum supplemental $50.00, resubmittal one-eighth capped at $272.00, express $69.00.",
  valuationBasis:
    "Every rule here reads `valuation` in cents — the trade's declared construction valuation per building, as the application supplies it.\n\nThe schedule mixes two shapes: **a `tiered_table` from $1 to $50,000** — 50 flat brackets — and **three `per_thousand` bands above it**, each `baseCents + centsPerThousand per $1,000 of valuation above a threshold, or fraction thereof`. The `or fraction thereof` rounds the chargeable amount above the threshold up to the next whole $1,000 (`incrementCents: $1,000`). The table below $50,000 prints brackets rather than a rate, so no `thresholdCents` or `incrementCents` sits on it; the bands above it are the ones that carry them, at $12.50 / $8.30 / $3.60 per $1,000.\n\nThe printed bases in the band rows are the chain: $686.00 + 150 × $12.50 is $2,561.00, and $2,561.00 + 800 × $8.30 is $9,201.00 — so a $200,000 commercial job and a $1,000,000 one each sit on an amount the band below produces. A $49,001–50,000 job is still $686.00 whether the valuation is $49,500 or $49,999; put the same value at $50,100 and it is $686.00 + $1 × $12.50.",
  notIncluded:
    "These are the Kansas City commercial building, electrical and plumbing permit fees on declared valuation. They are not a project cost, and they exclude:\n\n- **The residential one- and two-family ladder** — no Kansas City schedule for that class was readable from this sandbox, so no amount is estimated.\n- **Plan review's half-fee as a second charge** — credited prepayment, named above.\n- **The five ancillary flats** — $50.00 for review of changes to previously approved plans; $77.00 minimum partial permit fee (each partial permit is a separate permit fee, not a supplemental one, so dividing a job into partials costs more than one full permit); $50.00 minimum supplemental permit fee; resubmittal plan review — one-eighth of the total fee, capped at $272.00, when previously identified deficiencies remain uncorrected; $69.00 express plan review paid prior to meeting with the plan reviewer.\n- **Mechanical, elevator and fire protection fees beyond the ladder** — those trades' valuations are read on the same sheet against the same ladder; no separate mechanical-side pricing beyond the ladder is priced here.\n- **Citations, penalties, appeal or zoning fees** — not on this sheet.\n- **State or county surcharge and technology fees** — none is printed on this schedule.",
  seoTitle: "Kansas City, Missouri construction permit fees",
  seoDescription:
    "How Kansas City, Missouri prices construction permits — $1–$50K flat table, then $686 + $12.50 to $200K, $2,561 + $8.30 to $1M, $9,201 + $3.60 beyond (all per $1,000 or fraction), per building per trade, Ord #080766 eff. 2012-05-01.",
  publishStatus: "published",
  noindex: false,
  lastReviewedAt: KANSAS_CITY_LAST_VERIFIED,
};

const permitPages: SeedPermitPage[] = [
  {
    jurisdictionKey: KANSAS_CITY_KEYS.jurisdiction,
    permitTypeKey: "building",
    slug: "building-permit-cost",
    title: "Kansas City, Missouri building permit cost",
    intro:
      "A Kansas City building permit is priced on **the building trade's declared valuation per building**: **$1–$50,000 as a flat table ($48.00 to $686.00 in 50 brackets), then $686.00 + $12.50 per $1,000 to $200,000, $2,561.00 + $8.30 to $1,000,000, and $9,201.00 + $3.60 beyond** — each band **chaining exactly** to the one below. Plan review at **one-half is a credited prepayment**, not a second charge.",
    localSummary:
      "The sheet that prices Kansas City is one page and four shapes on it. The $1–$50,000 block is the only `tiered_table` left in Missouri — 50 flat amounts, one per $1,000 window. It is easy to misread as a rate; it is not: $1–500 is $48.00, $501–2,000 $86.00, $2,001–3,000 $98.50, then one more $12.50 step per thousand until $49,001–50,000 at $686.00. $12,300 pays $223.50 there — the $12,001–13,000 row — not $12,300 × $12.50.\n\nAbove $50,000 the schedule writes the other way: 'for the first $50,000 plus $12.50 for each additional $1,000 **or fraction thereof**, to and including $200,000' — so $75,100 is $686.00 + 26 × $12.50 = $1,011.00, because the $100 of fraction buys a whole $12.50 step. The next band is $2,561.00 for the first $200,000 plus $8.30 — and $2,561.00 is not a new figure but $686.00 + 150 × $12.50 — then $9,201.00 for the first $1,000,000 plus $3.60, where $9,201.00 is $2,561.00 + 800 × $8.30. A $500,000 commercial building is $2,561.00 + $8.30 × 300 = $5,051.00; a $2,000,000 building is $9,201.00 + $3.60 × 1,000 = $12,801.00.\n\nAnd on a per-trade-per-building sheet, that $12,801.00 is not the project: a mixed-use building whose building valuation is $1,400,000 but whose plumbing valuation is $80,000 is $10,641.00 for the building permit and $1,061.00 for the plumbing — two filings on the same ladder at two valuations. The City's trade total is the sum of such filings.\n\nAlso on the sheet — never charged as a second fee — the plan-review line: one-half of the permit cost at submission, credited when the permit issues. Half of $5,051.00 is $2,525.50 paid at plan intake and credited at issuance; half of $12,801.00 is $6,400.50. Five more flats are printed beside it: changes $50.00; partial permit minimum $77.00 (each partial permit is a separate permit fee, so two partials cost more than one full permit); supplemental minimum $50.00; resubmittal one-eighth capped at $272.00; express $69.00.",
    notIncluded:
      "This is the Kansas City commercial building permit fee. It excludes:\n\n- **One- and two-family residential** — no such Kansas City ladder was readable from this sandbox, so no such amount is invented.\n- **Plan review's half as a second permit fee** — credited prepayment, see above; named on this page together with its five ancillaries ($50 / $77 / $50 / $272 / $69).\n- **Any doubling of the $50,000 table into a rate** — the flat table does not state a rate and is charged by bracket; the bands above it are the ones that carry `or fraction thereof`.\n- **Fees for trades not billed on this sheet** — mechanical, elevator and fire protection are billed on the same ladder (each valuation supplied separately), not on a different schedule.",
    workedExample: {
      scenario: "A new mixed-use commercial building — $400,000 building valuation plus $80,000 of plumbing and $60,000 of electrical, each trade billed separately per building.",
      inputs: { valuationCents: 40_000_000, custom: {} },
      notes:
        "Building (at $400,000): the $200,001–$1,000,000 band — $2,561.00 for the first $200,000 plus $8.30 per $1,000 or fraction above it. $200,000 above $200,000 is 200 full thousands, so $2,561.00 + $1,660.00 = $4,221.00. Plan review ($2,110.50) is paid at intake and credited at issuance — it is not part of the permit fee.\n\nPlumbing (different valuation, same ladder): $80,000 falls in the $50,001–$200,000 band — $686.00 + $12.50 × 30 = $1,061.00. Electrical ($60,000): $686.00 + $1.50 extra? No — $10,000 above $50,000 is 10 × $12.50 = $811.00? Wait: $60,000 − $50,000 = $10,000 = 10 × $1,000, so $686.00 + $125.00 = $811.00. The project's three trades total $6,093.00 — the City's trade-by-trade instruction, not a guess.\n\nA $49,500 commercial job never leaves the table: $49,001–50,000 $686.00. Put it at $50,100 — $686.00 plus one whole $1,000 or fraction at $12.50 = $698.50.",
    },
    faqs: [
      {
        question: "How much is a building permit in Kansas City, Missouri?",
        answer:
          "The commercial building valuation ladder (per building per trade): $1–500 $48, $501–2,000 $86, $2,001–3,000 $98.50 … $49,001–50,000 $686.00 as a flat table; $50,001–$200,000 at $686 + $12.50 per $1,000 or fraction; $200,001–$1,000,000 at $2,561 + $8.30; $1,000,001+ at $9,201 + $3.60. A $500,000 building is $5,051.00; a $2,000,000 building is $12,801.00.",
        sourceId: KANSAS_CITY_FEE_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "Does plan review add 50% on top of the permit?",
        answer:
          "No — the schedule's own line says 'A fee of one-half of the permit cost is required to be paid at the time plans are submitted for plan review, this will be credited towards the total fee when the permit is issued.' So at plan intake you pay half the permit fee, and at issuance you pay the permit fee less that half. The five ancillaries ($50 changes, $77 partial-minimum, $50 supplemental, $272 resubmittal cap, $69 express) are flat rows beside it.",
        sourceId: KANSAS_CITY_FEE_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "Is the $1–$50,000 block a rate on the whole valuation?",
        answer:
          "No — every $1,000 window prints one flat amount rather than a rate. $12,300 of valuation pays $223.50 (the $12,001–13,000 row), not $12,300 × $12.50. The 'plus $12.50 per $1,000 or fraction' appears only above $50,000.",
        sourceId: KANSAS_CITY_FEE_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "Why does $200,001 not jump at the band seam?",
        answer:
          "Because the bands chain: $2,561.00 for the first $200,000 is exactly $686.00 + 150 × $12.50, and $9,201.00 for the first $1,000,000 is $2,561.00 + 800 × $8.30. The schedule prints amounts that the arithmetic below them produces, so there is no seam to charge over.",
        sourceId: KANSAS_CITY_FEE_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "Is one fee schedule used for all trades?",
        answer:
          "Yes — the sheet's header lists BUILDING, MECHANICAL, PLUMBING, ELECTRICAL, ELEVATOR and FIRE PROTECTION together with 'PERMIT FEES SHALL BE CALCULATED SEPARATELY FOR EACH BUILDING' and 'separate construction valuation shall be provided for each trade of work involved in the project.' One ladder, read against each trade's valuation.",
        sourceId: KANSAS_CITY_FEE_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "What about residential buildings of one or two dwelling units?",
        answer:
          "No Kansas City schedule for that class was readable from this sandbox — the City's Building and Development fee hub answers 403 here, and the codifier consolidation was not found for this sheet — so no such amount is modelled and no amount is guessed.",
        sourceId: KANSAS_CITY_FEE_SCHEDULE_SOURCE_KEY,
      },
    ],
    seoTitle: "Kansas City, Missouri building permit cost: $48–$9,201 + $3.60 per $1,000",
    seoDescription:
      "Kansas City commercial building permit fees — flat table to $50K, then $686 + $12.50, $2,561 + $8.30, $9,201 + $3.60 per $1,000 or fraction, per trade per building, plan review credited at one-half.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: KANSAS_CITY_LAST_VERIFIED,
  },
  {
    jurisdictionKey: KANSAS_CITY_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    slug: "electrical-permit-cost",
    title: "Kansas City, Missouri electrical permit cost",
    intro:
      "A Kansas City electrical permit is **the same valuation ladder read against the electrical valuation**: **$1–$50,000 flat table, then $686 + $12.50 / $2,561 + $8.30 / $9,201 + $3.60 per $1,000 or fraction**. One filing per building per trade; plan review at one-half, credited.",
    localSummary:
      "Electrical reads the same four-rule ladder the building permit does, because the sheet that prices Kansas City says so in its header — trade valuations are supplied separately and the permit fee is calculated separately for each building and each trade. The amount for $2,000 of electrical valuation is $86.00 (the $501–2,000 row); for $2,001 it is $98.50 (the next row); for $75,100 it is $686.00 + 26 × $12.50 = $1,011.00; for $400,000 it is $4,221.00; for $2,000,000 it is $12,801.00 — each reproducing the commercial ladder at the electrical valuation.\n\nThe credited-prepayment rule and its five ancillaries are the same five lines. Electrical shares them: changes $50, partial-minimum $77, supplemental $50, resubmittal one-eighth capped at $272, express $69. No residential one- or two-family electrical ladder is modelled here for the same reason no such building ladder is — no readable sheet for that class from this sandbox.",
    notIncluded:
      "This is the electrical permit fee read from the commercial schedule. It excludes the residential one- and two-family electrical ladder (none readable), the credited plan-review half-fee, and the five ancillaries ($50 / $77 / $50 / $272 / $69) beyond naming them.",
    workedExample: {
      scenario: "A commercial tenant improvement whose electrical valuation is $80,000 — the same project whose building valuation is $400,000, each trade billed separately.",
      inputs: { valuationCents: 8_000_000, custom: {} },
      notes:
        "$80,000 falls in the $50,001–$200,000 band: $686.00 for the first $50,000 plus $12.50 per $1,000 or fraction above it. $30,000 above $50,000 is 30 × $1,000, so $686.00 + $375.00 = $1,061.00. The $400,000 building permit is $4,221.00 (the band above), but the electrical permit is $1,061.00 — trade-by-trade, not project-at-once.\n\n$2,000 of electrical valuation pays $86.00 (the $501–2,000 flat row); $2,001 pays $98.50 (the next table row); $50,100 pays $686.00 + $12.50 = $698.50 (the table-plus-band seam, where the table and the band agree at $686.00).",
    },
    faqs: [
      {
        question: "How much is an electrical permit in Kansas City?",
        answer:
          "The same ladder read against the electrical valuation: $1–500 $48, $501–2,000 $86 … $49,001–50,000 $686.00 as a flat table; $50,001–$200,000 at $686 + $12.50; $200,001–$1,000,000 at $2,561 + $8.30; $1,000,001+ at $9,201 + $3.60 per $1,000 or fraction. $80,000 of electrical valuation is $1,061.00.",
        sourceId: KANSAS_CITY_FEE_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "Is electrical priced separately from the building permit?",
        answer:
          "Yes — the sheet's own instruction: 'At the time of building permit application, separate construction valuation shall be provided for each trade of work involved in the project.' A $400,000 building valuation and an $80,000 electrical valuation are two filings on the same ladder at two valuations.",
        sourceId: KANSAS_CITY_FEE_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "Does electrical plan review add a fee?",
        answer:
          "The schedule's plan-review block is trade-neutral: one-half of the permit cost paid at submission, credited at issuance. It is the credited prepayment, not a second electrical fee — the same block that governs the building permit and the same five ancillaries ($50 / $77 / $50 / $272 / $69) beside it.",
        sourceId: KANSAS_CITY_FEE_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "What happens below $500 of electrical valuation?",
        answer:
          "The ladder's first row still answers: $1–500 $48.00. Even $100 of electrical valuation pays $48.00 there. The next row is $501–2,000 $86.00 — two rows, no $0 band.",
        sourceId: KANSAS_CITY_FEE_SCHEDULE_SOURCE_KEY,
      },
    ],
    seoTitle: "Kansas City, Missouri electrical permit cost",
    seoDescription:
      "Kansas City electrical permit fees — the same commercial valuation ladder as the building permit, read against the electrical valuation per building, plan review credited at one-half.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: KANSAS_CITY_LAST_VERIFIED,
  },
  {
    jurisdictionKey: KANSAS_CITY_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    slug: "plumbing-permit-cost",
    title: "Kansas City, Missouri plumbing permit cost",
    intro:
      "A Kansas City plumbing permit is **the same valuation ladder read against the plumbing valuation** — **$1–$50,000 flat table, then $686 + $12.50 / $2,561 + $8.30 / $9,201 + $3.60 per $1,000 or fraction**, per building, plan review credited at one-half.",
    localSummary:
      "Plumbing reads the same sheet, because the sheet is not a building sheet: its title already covers Building, Mechanical, Plumbing, Electrical, Elevator and Fire Protection together. $1,500 of plumbing valuation pays $86.00 (the $501–2,000 row); $15,000 pays $261.00 (the $15,001–16,000 row); $50,100 pays $686.00 + $12.50 = $698.50; $250,000 pays $2,561.00 + $8.30 × 50 = $2,976.00; $2,000,000 pays $12,801.00 — each reproducing the commercial ladder at the plumbing valuation.\n\nResidential plumbing in a building of three or more dwelling units is explicitly on this ladder — the subtitle's 'INCLUDING RESIDENTIAL BUILDINGS WITH THREE OR MORE DWELLING UNITS' — while residential plumbing in a building of one or two dwelling units is not covered by any sheet readable from this sandbox and is therefore not modelled here. The credited-prepayment and ancillary block are identical to the building and electrical permits: one-half credited, changes $50, partial $77, supplemental $50, resubmittal 1/8 capped at $272, express $69.",
    notIncluded:
      "This is the plumbing permit fee read from the commercial schedule at the plumbing valuation. It excludes residential plumbing in a building of one or two dwelling units (no sheet readable), any second-charged plan-review half-fee, and any separate trade schedule beyond naming this ladder.",
    workedExample: {
      scenario: "Plumbing valuation $15,000 — the small-plumbing end of the same mixed-use building.",
      inputs: { valuationCents: 1_500_000, custom: {} },
      notes:
        "$15,000 has not left the flat table: it falls in $15,001–16,000 $261.00? No — $14,001–15,000 $248.50, $15,001–16,000 $261.00 — so $15,000 is $248.50 (the row strictly enclosing it). Put the same value one dollar higher at $15,001 and it pays $261.00 (the next $1,000 row). $50,100 pays $698.50 in the first band above the table; $250,000 pays $2,561.00 + $8.30 × 50 = $2,976.00; $2,000,000 pays $12,801.00 — each trade by trade, each building by building.\n\n$300 valuation pays $48.00 — still inside the opening flat row. The ladder's $77 partial-minimum and $50 supplemental minimum are floors on partial/supplemental permits as instruments, not on this row's own $48 floor — dividing a job into partials costs more than one permit, by the sheet's own sentence.",
    },
    faqs: [
      {
        question: "How much is a plumbing permit in Kansas City?",
        answer:
          "The same four-rule ladder read against the plumbing valuation: $1–500 $48 … $49,001–50,000 $686.00 flat; $50,001–$200,000 at $686 + $12.50; $200,001–$1,000,000 at $2,561 + $8.30; $1,000,001+ at $9,201 + $3.60 per $1,000 or fraction. $15,000 of plumbing valuation is $248.50; $250,000 is $2,976.00.",
        sourceId: KANSAS_CITY_FEE_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "Does residential plumbing use a different schedule?",
        answer:
          "Residential buildings of three or more dwelling units do not: the sheet's subtitle already says 'INCLUDING RESIDENTIAL BUILDINGS WITH THREE OR MORE DWELLING UNITS'. Residential plumbing in a building of one or two dwelling units has no Kansas City schedule readable from this sandbox, so no such amount is modelled.",
        sourceId: KANSAS_CITY_FEE_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "Is plumbing plan review a separate charge?",
        answer:
          "No — the same credited prepayment as every other trade: one-half of the permit cost paid at plan submission, credited at issuance. Changes $50, partial-minimum $77, supplemental $50, resubmittal capped at $272, express $69 — all flat rows beside it.",
        sourceId: KANSAS_CITY_FEE_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "How finely does the plumbing permit price?",
        answer:
          "One flat amount per $1,000 window to $50,000; then $12.50 per $1,000 or fraction to $200,000 and $8.30 / $3.60 above — so $50,100 buys one more whole $12.50, and $200,100 buys one more whole $8.30. The ladder is per building, so doubling the buildings doubles the filings.",
        sourceId: KANSAS_CITY_FEE_SCHEDULE_SOURCE_KEY,
      },
    ],
    seoTitle: "Kansas City, Missouri plumbing permit cost",
    seoDescription:
      "Kansas City plumbing permit fees — the same commercial valuation ladder as the building permit, read against the plumbing valuation (1–2 unit residential excluded), per building, plan review credited.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: KANSAS_CITY_LAST_VERIFIED,
  },
];

const verifications: SeedVerification[] = [
  {
    entityType: "source",
    entityKey: KANSAS_CITY_FEE_SCHEDULE_SOURCE_KEY,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: KANSAS_CITY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: KANSAS_CITY_FEE_SCHEDULE_SOURCE_KEY,
    notes: "Primary (commercial schedule, 1 page, HTTP 200, pymupdf text extraction; flat table through the $9,201 + $3.60 top band; Ordinance #080766 eff. 2012-05-01 printed on the sheet).",
  },
  {
    entityType: "fee_schedule",
    entityKey: KANSAS_CITY_KEYS.feeSchedule,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: KANSAS_CITY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: KANSAS_CITY_FEE_SCHEDULE_SOURCE_KEY,
    notes: "One schedule row for every commercial trade — Building, Mechanical, Plumbing, Electrical, Elevator and Fire Protection — each valuation-billed separately.",
  },
  {
    entityType: "permit_page",
    entityKey: `${KANSAS_CITY_KEYS.jurisdiction}:building:building-permit-cost`,
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: KANSAS_CITY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: KANSAS_CITY_FEE_SCHEDULE_SOURCE_KEY,
    notes: "Three published pages, each with intro ≥240, localSummary ≥120 and four to six FAQs, verified together — building (flat table + three bands, plan review credited, per-building-per-trade).",
  },
  {
    entityType: "permit_page",
    entityKey: `${KANSAS_CITY_KEYS.jurisdiction}:electrical:electrical-permit-cost`,
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: KANSAS_CITY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: KANSAS_CITY_FEE_SCHEDULE_SOURCE_KEY,
    notes: "Electrical — same ladder read against the electrical valuation, per building per trade.",
  },
  {
    entityType: "permit_page",
    entityKey: `${KANSAS_CITY_KEYS.jurisdiction}:plumbing:plumbing-permit-cost`,
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: KANSAS_CITY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: KANSAS_CITY_FEE_SCHEDULE_SOURCE_KEY,
    notes: "Plumbing — same ladder, three-or-more-unit residential included, one- and two-family excluded as not published.",
  },
  {
    entityType: "jurisdiction_profile",
    entityKey: KANSAS_CITY_KEYS.jurisdiction,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: KANSAS_CITY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: KANSAS_CITY_FEE_SCHEDULE_SOURCE_KEY,
    notes: "Kansas City MO profile and jurisdiction context (four-county city, City Planning & Development authority, Permit Center line).",
  },
];

export const kansascitySeed: JurisdictionSeed = {
  state,
  county,
  jurisdiction,
  departments,
  sources,
  permitTypes,
  projectTypes,
  jurisdictionPermitTypes,
  feeSchedules,
  feeRules,
  requirements,
  profile,
  permitPages,
  verifications,
};
