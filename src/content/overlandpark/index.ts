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

import {
  OP_BUILDING_RULES,
  OP_ELECTRICAL_RULES,
  OP_FEE_EFFECTIVE_FROM,
  OP_PLUMBING_RULES,
  OP_SOURCE_KEY,
} from "./fee-rules";

export * from "./fee-rules";

/**
 * The complete Overland Park, Kansas seed payload.
 *
 * Every figure traces to research/kansas/overland-park.md, which traces to one
 * City instrument: the Development Approval and Permit Fees schedule, effective
 * 08/01/2025, read beside the Common Permit Fees explainer page.
 *
 * The structural fact this seed is honest about: Overland Park publishes no
 * separate electrical or plumbing permit. The building permit prices the whole
 * project — valuation includes the trades. The electrical and plumbing pages
 * therefore model the schedule's own price for small stand-alone trade-scale
 * work (the flat tiers + flat plan review) and explain the bundling.
 *
 * Three pages, all published: building, electrical, plumbing.
 */

const RESEARCHER = "Permit Fee Intelligence — Kansas pass (Overland Park)";

export const OVERLAND_PARK_LAST_VERIFIED = "2026-09-26";

export const OVERLAND_PARK_KEYS = {
  state: "ks",
  county: "johnson-county-ks",
  jurisdiction: "overland-park",
  schedule: "op-development-fees-2025",
} as const;

const state: SeedState = {
  code: "KS",
  slug: "kansas",
  name: "Kansas",
  fipsCode: "20",
};

const county: SeedCounty = {
  key: OVERLAND_PARK_KEYS.county,
  slug: "johnson-county-ks",
  name: "Johnson County",
  fipsCode: "20091",
};

const jurisdiction: SeedJurisdiction = {
  key: OVERLAND_PARK_KEYS.jurisdiction,
  stateKey: OVERLAND_PARK_KEYS.state,
  countyKey: OVERLAND_PARK_KEYS.county,
  type: "city",
  slug: "overland-park",
  name: "Overland Park",
  officialName: "City of Overland Park — Planning and Development Services (Building Safety)",
  websiteUrl: "https://www.opkansas.gov/",
  permitPortalUrl: "https://www.opkansas.gov/city-services/permits-inspections/",
  timezone: "America/Chicago",
  isActive: true,
};

const departments: SeedDepartment[] = [
  {
    key: "overland-park-pds",
    jurisdictionKey: OVERLAND_PARK_KEYS.jurisdiction,
    kind: "building",
    name: "Planning and Development Services — Building Safety Division",
    phone: "(913) 895-6000",
    email: "pds@opkansas.gov",
    url: "https://www.opkansas.gov/city-services/permits-inspections/",
    addressLine: "City Hall, 8500 Santa Fe Drive, Overland Park, KS 66212",
    hours: "Monday – Friday, 8 a.m. – 5 p.m. CT",
    notes:
      "Building Safety issues building, land-disturbance, site-development, public-improvement and moving permits. The Building Official reviews the Permit Fee Multiplier and the ICC Building Valuation Data Tables annually with the City Manager's Office and may adopt the latest ICC edition. Contractor licensing is a separate Johnson County program (913-715-2233).",
  },
];

const sources: SeedSource[] = [
  {
    key: OP_SOURCE_KEY,
    jurisdictionKey: OVERLAND_PARK_KEYS.jurisdiction,
    title: "Development Approval and Permit Fees — effective 08/01/2025",
    url: "https://content.civicplus.com/api/assets/15915d6f-9ea5-42fe-a39a-229df92b2faa?scope=all",
    sourceType: "fee_schedule_pdf",
    issuingAuthority: "City of Overland Park — Planning and Development Services",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2025-08-01",
    effectiveFrom: OP_FEE_EFFECTIVE_FROM,
    retrievedAt: OVERLAND_PARK_LAST_VERIFIED,
    lastVerifiedAt: OVERLAND_PARK_LAST_VERIFIED,
    notes:
      "Read 2026-09-26 (7-pp. PDF, HTTP 200 from the City's CivicPlus asset host; the HTML explainer at opkansas.gov/common-permit-fees is JS-rendered and read in a browser, and it agrees with the PDF on every amount). Carries: the 0.0035 ICC-path new-construction multiplier and the 0.0050 applicant-submitted-value multiplier at the $19,000 seam; the $30/$50 flat building-permit tiers for work of $19,000 or less with the $30 flat plan review (printed totals $60/$80); the 50%-at-submission payment split for plan review on larger projects; Portfolio Homes (0.0035, plan review waived); land disturbance at 0.0050; moving $500; floodplain $15; reinspection $50/$140; after-hours $75/hr (2-hr min); sign permits $60 + $1.25/sq ft; and the EV/Solar fee reductions that sunset 12-31-2027. No separate electrical, plumbing or mechanical permit exists anywhere in the schedule — the valuation definition includes the trades.",
  },
];

/** Empty on purpose: the permit types Overland Park uses already exist as shared rows. */
const permitTypes: JurisdictionSeed["permitTypes"] = [];
const projectTypes: JurisdictionSeed["projectTypes"] = [];

const jurisdictionPermitTypes: SeedJurisdictionPermitType[] = [
  {
    jurisdictionKey: OVERLAND_PARK_KEYS.jurisdiction,
    permitTypeKey: "building",
    isAvailable: true,
    localName:
      "Building permit — 0.0035 ICC-path multiplier, 0.0050 submitted-value multiplier, $30/$50 flats to $19,000",
    officialUrl:
      "https://content.civicplus.com/api/assets/15915d6f-9ea5-42fe-a39a-229df92b2faa?scope=all",
    notes:
      "New construction derives its valuation from the ICC Building Valuation Data Tables and pays 0.0035 × valuation (Portfolio Homes: same multiplier, plan review waived). Remodels and repairs at $19,000+ pay 0.0050 × the applicant-submitted value. Work of $19,000 or less pays flats: $30 to $5,000, $50 to $19,000, each plus the $30 flat plan review ($60/$80 printed totals). Larger projects' plan review is a payment split — 50% of the permit fee at submission — not an added fee.",
  },
  {
    jurisdictionKey: OVERLAND_PARK_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    isAvailable: true,
    localName:
      "No separate electrical permit — trade work prices inside the building permit; stand-alone small jobs pay the flat tiers",
    officialUrl:
      "https://www.opkansas.gov/common-permit-fees",
    notes:
      "The schedule publishes no electrical permit row: the valuation definition includes electrical, and the construction block names no trade permits. A stand-alone electrical-scale job ($1–$19,000 of work value) pays the building-permit flat tier plus the $30 flat plan review — the printed $60/$80 totals. Electrical work inside a larger project is carried by that project's building permit.",
  },
  {
    jurisdictionKey: OVERLAND_PARK_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    isAvailable: true,
    localName:
      "No separate plumbing permit — trade work prices inside the building permit; stand-alone small jobs pay the flat tiers",
    officialUrl:
      "https://www.opkansas.gov/common-permit-fees",
    notes:
      "Same structure as electrical: no plumbing permit row exists. Stand-alone plumbing-scale jobs pay the flat tiers plus the $30 flat plan review; bundled plumbing rides the building permit. Water and sewer tap fees belong to other jurisdictions (WaterOne; Johnson County Wastewater).",
  },
];

const feeSchedules: SeedFeeSchedule[] = [
  {
    key: OVERLAND_PARK_KEYS.schedule,
    jurisdictionKey: OVERLAND_PARK_KEYS.jurisdiction,
    sourceKey: OP_SOURCE_KEY,
    title: "Overland Park Development Approval and Permit Fees (eff. 2025-08-01)",
    officialUrl:
      "https://content.civicplus.com/api/assets/15915d6f-9ea5-42fe-a39a-229df92b2faa?scope=all",
    effectiveFrom: OP_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: OVERLAND_PARK_LAST_VERIFIED,
    notes:
      "The consolidated schedule the Common Permit Fees page links. All fees round to the nearest dollar (schedule footnote 4); the ICC tables are adopted annually by the Building Official. The EV/Solar fee reductions carry their own 2027-12-31 sunset.",
  },
];

function attach(
  permitTypeKey: string,
  rules: SeedFeeRule["rule"][],
  scheduleKey: string,
): SeedFeeRule[] {
  return rules.map((rule) => ({
    jurisdictionKey: OVERLAND_PARK_KEYS.jurisdiction,
    permitTypeKey,
    scheduleKey,
    rule,
  }));
}

const feeRules: SeedFeeRule[] = [
  ...attach("building", OP_BUILDING_RULES, OVERLAND_PARK_KEYS.schedule),
  ...attach("electrical", OP_ELECTRICAL_RULES, OVERLAND_PARK_KEYS.schedule),
  ...attach("plumbing", OP_PLUMBING_RULES, OVERLAND_PARK_KEYS.schedule),
];

const requirements: SeedRequirement[] = [
  {
    jurisdictionKey: OVERLAND_PARK_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "The valuation path must be declared — ICC-derived or applicant-submitted",
    description:
      "The schedule runs two multipliers on two definitions of value. New construction derives valuation from the ICC Building Valuation Data Tables (square footage × the per-square-foot figure for construction type and occupancy) and pays 0.0035. Everything at $19,000 and above that is not ICC-derived pays 0.0050 × the applicant's submitted value, which 'shall be the total value of all construction work … building cost, all finish work, painting, paving, electrical, plumbing, heating, a/c, elevators, fire protection equipment.' The rules key on the declared path (custom.valuation_source) so the two multipliers are mutually exclusive by declaration.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: OP_SOURCE_KEY,
    lastVerifiedAt: OVERLAND_PARK_LAST_VERIFIED,
  },
  {
    jurisdictionKey: OVERLAND_PARK_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "50% of the permit fee is due at plan submission — a payment split, not a fee",
    description:
      "When construction documents are submitted, 50% of the permit fee is paid 'at such time for plan review services'; the other 50% is due when plans are approved. This never adds to the total — the other half is the same fee paid later. The $30 flat plan review of the sub-$19,000 tiers is the different thing: a real additional charge.",
    isMandatory: true,
    sortOrder: 20,
    sourceKey: OP_SOURCE_KEY,
    lastVerifiedAt: OVERLAND_PARK_LAST_VERIFIED,
  },
  {
    jurisdictionKey: OVERLAND_PARK_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "other",
    title: "There is no separate electrical permit in Overland Park",
    description:
      "The fee schedule's construction block prices whole projects — its valuation definition includes electrical, plumbing, heating and a/c — and names no trade permits. Electrical work inside a project is carried by the project's building permit. A stand-alone small electrical job (e.g. a $12,000 service upgrade on an existing building) prices through the small-project regime: the flat permit tier plus the $30 flat plan review.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: OP_SOURCE_KEY,
    lastVerifiedAt: OVERLAND_PARK_LAST_VERIFIED,
  },
  {
    jurisdictionKey: OVERLAND_PARK_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    requirementType: "other",
    title: "There is no separate plumbing permit — and the taps belong to other utilities",
    description:
      "Plumbing work inside a project rides the project's building permit. Water tap fees are WaterOne's (913-895-1800) and sewer connection fees are Johnson County Wastewater's (913-715-8590) — other jurisdictions' charges entirely. Stand-alone small plumbing jobs price through the flat tiers plus the $30 flat plan review.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: OP_SOURCE_KEY,
    lastVerifiedAt: OVERLAND_PARK_LAST_VERIFIED,
  },
];

const profile: SeedProfile = {
  jurisdictionKey: OVERLAND_PARK_KEYS.jurisdiction,
  headline: "What construction permits cost in Overland Park",
  summary:
    "Overland Park prices construction with **two multipliers on two definitions of value**: new construction derives its valuation from the **ICC Building Valuation Data Tables** and pays **0.0035 × valuation** (Portfolio Homes: same multiplier, plan review waived); work at **$19,000 and above** on the applicant's submitted value pays **0.0050 × valuation**. Work of **$19,000 or less** pays flats — **$30 to $5,000, $50 to $19,000 — each plus a $30 flat plan review** (printed totals $60/$80). Larger projects' plan review is not a fee at all but a **payment split: 50% at submission**. There is **no separate electrical or plumbing permit** — the trades price inside the building permit.",
  localContext:
    "Overland Park's fee schedule is one consolidated document, effective August 1, 2025, covering planning approvals, sign permits and construction permits together — and it is explicit about its own machinery. The Building Official reviews the Permit Fee Multiplier and the ICC Building Valuation Data Tables with the City Manager's Office every year, and the ICC tables' per-square-foot figures are what turn a building's area and construction type into the valuation the 0.0035 multiplies.\n\nThe two-multiplier design does real work: the ICC path prices a new building on what the code says it should cost to build, while the 0.0050 path prices a remodel on what the applicant actually declares — 'building cost, all finish work, painting, paving, electrical, plumbing, heating, a/c, elevators, fire protection equipment.' The $19,000 seam between the regimes is also where the flats end: below it, $30 or $50 plus the $30 flat plan review, with the printed totals $60 and $80.\n\nThe plan-review split confuses people, and the schedule is careful: on a large project, 50% of the permit fee is paid when plans are submitted — for plan review services — and the other half at approval. Nothing is added. The same schedule carries the city's incentive regime: EV Ready and Solar Ready fee reductions for new single-family homes, duplexes and townhouses ($500 and $600 per dwelling unit respectively, 100% for retrofit EV circuits, $1,300 per EV Ready space in multi-family), all sunsetting December 31, 2027.\n\nWhat the schedule does not contain is any trade permit. Overland Park prices buildings, not scopes: electrical, plumbing, heating and a/c ride inside the project's permit, and the utilities' own tap fees (WaterOne, Johnson County Wastewater) belong to other jurisdictions.",
  valuationBasis:
    "Two declared paths. **The ICC path reads derived valuation** — square footage × the ICC Building Valuation Data Tables' figure for construction type and occupancy, at 0.0035 — and is the new-construction regime. **The submitted path reads the applicant's declared total** — all construction work including the trades — at 0.0050, from $19,000 up. Below $19,000 neither applies: the flats ($30/$50 + $30) price the work directly.",
  notIncluded:
    "These figures are Overland Park's own permit amounts. They are not a project cost, and they exclude:\n\n- **Trade permits as separate charges.** None exists in the schedule; the trades price inside the building permit, and the electrical/plumbing pages here model the small-project flat tiers that stand-alone trade-scale work actually pays.\n- **Land disturbance / site development permits** (0.0050 × valuation, same flats below $19,000) — recorded, not modelled.\n- **The EV/Solar incentive regime** — $500–$1,300 per unit/space reductions, all sunsetting 2027-12-31 — recorded so the sunset is on the record.\n- **Event and administrative rows** — moving permits $500, floodplain $15, reinspection $50/$140, after-hours inspections $75/hr (2-hr min), sign permits $60 + $1.25/sq ft, Code Board of Appeals $250, rental licensing $120 biennially.\n- **Utility tap fees** — WaterOne and Johnson County Wastewater set their own.",
  seoTitle: "Overland Park permit fees — ICC and submitted-value multipliers",
  seoDescription:
    "How Overland Park prices construction permits: 0.0035 on ICC-derived new-construction value, 0.0050 on submitted value at $19,000+, $30/$50 flats with $30 plan review below, and no separate trade permits.",
  publishStatus: "published",
  noindex: false,
  lastReviewedAt: OVERLAND_PARK_LAST_VERIFIED,
};

const permitPages: SeedPermitPage[] = [
  {
    jurisdictionKey: OVERLAND_PARK_KEYS.jurisdiction,
    permitTypeKey: "building",
    slug: "building-permit-cost",
    title: "Overland Park building permit cost",
    intro:
      "An Overland Park building permit runs on **two multipliers and one seam**. New construction derives its valuation from the **ICC Building Valuation Data Tables** and pays **0.0035 × valuation** — Portfolio Homes pay the same multiplier with **plan review waived**. Remodels and repairs at **$19,000 and above** pay **0.0050 × the applicant's submitted value**. Work of **$19,000 or less** pays flats: **$30 to $5,000, $50 to $19,000**, each **plus the $30 flat plan review** — printed totals of $60 and $80. On larger projects the plan review is a **payment split, not a fee**: 50% of the permit fee at submission, the rest at approval.",
    localSummary:
      "The seam does the sorting. Below $19,000 of work value there is no valuation arithmetic at all — the flats price the job, and the $30 plan review rides on top because the schedule prints it 'in addition'. At $19,000 and above the 0.0050 multiplier applies to everything the applicant declares, the trades included.\n\nNew construction never sees 0.0050: its valuation is not the applicant's number but the ICC tables' derivation — square footage times the per-square-foot figure for the construction type and occupancy — and the multiplier on that derivation is 0.0035. The Building Official adopts the ICC tables annually, so the derivation input moves with the market even while the multiplier stands still.\n\nThe plan-review split is the schedule's most-misread line. On a $400,000 ICC-path project, the fee is $1,400.00; half of it — $700.00 — is due when plans are submitted and the other half at approval. Nothing is added. The $30 flat plan review of the small tiers is the genuinely additional charge, and the schedule prints the combined totals ($60, $80) so nobody has to add.",
    notIncluded:
      "This is the Development Approval and Permit Fees schedule's building permit. It excludes:\n\n- **Land disturbance and site development permits** (0.0050 × valuation with the same flats below $19,000) — recorded, not modelled.\n- **The EV/Solar fee reductions** — $500 per EV Ready dwelling unit, $600 per Solar Ready unit, 100% for retrofit EV circuits, $1,300/$300 per multi-family space — all sunsetting 2027-12-31.\n- **Sign permits** ($60 + $1.25/sq ft), moving permits ($500), floodplain development ($15), reinspection ($50/$140), after-hours inspections ($75/hr, 2-hr minimum).\n- **Utility tap fees** — WaterOne and Johnson County Wastewater charges.",
    workedExample: {
      scenario:
        "A new retail shell on the ICC path, with a derived valuation of $400,000 — declared as the ICC-derived valuation the Building Safety staff compute from the building's area, construction type and occupancy.",
      inputs: {
        valuationCents: 40_000_000,
        occupancy: "commercial",
        custom: {
          valuation_source: "icc",
        },
      },
      notes:
        "One line — **$1,400.00**.\n\nBLD-ICC-0035: 0.0035 × $400,000 = $1,400.00 exactly — which is also the whole-dollar figure the schedule's rounding footnote asks for.\n\nThe plan-review payment split: 50% of the fee — $700.00 — is due when construction documents are submitted; the remaining $700.00 is due at approval. Nothing is added: the total is $1,400.00, not $2,100.00.\n\nWhat moves it: the same project on an applicant-submitted valuation at $19,000+ would pay 0.0050 × $400,000 = $2,000.00 — the 0.0035 path is the new-construction rate precisely because the ICC tables, not the applicant, set the value. A Portfolio Home pays the same $1,400.00 with no plan-review step at all.",
    },
    faqs: [
      {
        question: "How is an Overland Park building permit calculated for new construction?",
        answer:
          "From the ICC Building Valuation Data Tables: the building's square footage, construction type and occupancy give a valuation, and the permit fee is 0.0035 × that valuation. The Building Official adopts the ICC tables annually. Portfolio Homes pay the same multiplier with plan review waived.",
        sourceId: OP_SOURCE_KEY,
      },
      {
        question: "What multiplier applies to a remodel?",
        answer:
          "0.0050 × the applicant's submitted valuation, at $19,000 and above. The submitted value includes all construction work — building cost, finish work, painting, paving, electrical, plumbing, heating, a/c, elevators and fire protection equipment.",
        sourceId: OP_SOURCE_KEY,
      },
      {
        question: "How much is a permit for a small project or repair?",
        answer:
          "$30.00 for work valued at $1–$5,000 and $50.00 for $5,001–$19,000 — each plus the $30.00 flat plan review, for printed totals of $60 and $80. The plan review is due at application.",
        sourceId: OP_SOURCE_KEY,
      },
      {
        question: "Is the 50% plan review payment an extra fee?",
        answer:
          "No. On larger projects, 50% of the permit fee is paid when construction documents are submitted and the other 50% when plans are approved — a payment schedule, not an added charge. The $30 flat plan review of the small tiers is the genuinely additional fee.",
        sourceId: OP_SOURCE_KEY,
      },
      {
        question: "Does Overland Park have a separate electrical or plumbing permit?",
        answer:
          "No. The fee schedule prices whole projects — its valuation definition includes electrical, plumbing, heating and a/c — and names no trade permits. Trade work inside a project is carried by the project's building permit; utility tap fees belong to WaterOne and Johnson County Wastewater.",
        sourceId: OP_SOURCE_KEY,
      },
      {
        question: "What happens if work starts before the permit is issued?",
        answer:
          "A Late Permit fee applies: the applicable permit fee is doubled. Reinspections are $50.00 each ($140.00 where there is no progress to correct a violation after notice), and inspections outside normal business hours are $75.00 per hour with a two-hour minimum, prepaid.",
        sourceId: OP_SOURCE_KEY,
      },
    ],
    seoTitle: "Overland Park building permit cost: multipliers, flats and the $19,000 seam",
    seoDescription:
      "Overland Park building permit fees — 0.0035 × ICC-derived valuation for new construction, 0.0050 × submitted value at $19,000+, $30/$50 flats with $30 plan review below, and the 50%-at-submission payment split.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: OVERLAND_PARK_LAST_VERIFIED,
  },
  {
    jurisdictionKey: OVERLAND_PARK_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    slug: "electrical-permit-cost",
    title: "Overland Park electrical permit cost",
    intro:
      "Overland Park publishes **no separate electrical permit fee** — its schedule prices whole projects, with electrical inside the valuation. What a stand-alone electrical-scale job pays is the **small-project regime**: the **$30.00 flat permit** for $1–$5,000 of work value or the **$50.00 flat** for $5,001–$19,000, each **plus the $30.00 flat plan review** — the printed totals of **$60 and $80**. Electrical work inside a larger project is **carried by that project's building permit**.",
    localSummary:
      "The schedule's valuation definition does the bundling explicitly: it includes 'electrical, plumbing, heating' among the work the permit prices. The construction block names building, land disturbance, site development, public improvement, floodplain and moving permits — no trade permits anywhere. A panel upgrade inside a $60,000 remodel is not billed twice: it is inside the 0.0050 × $60,000 permit.\n\nWhat actually walks into Building Safety as an electrical-scale stand-alone job is a small one — a service upgrade, a generator circuit, a small tenant fit-out's wiring — and those land in the flat tiers. A $12,000 stand-alone electrical job pays the $50.00 permit plus the $30.00 plan review: $80.00, the schedule's own printed total.\n\nThe 0.0050 regime takes over at $19,001 of declared work value — a larger tenant finish prices there, at half a percent of everything declared, with the plan review as a payment split rather than the $30 flat.",
    notIncluded:
      "This page is the schedule's honest answer for electrical work. It excludes:\n\n- **The building permit on larger projects** — 0.0050 × submitted value at $19,000+ (on the building page).\n- **Johnson County contractor licensing** — a separate county program, not a city permit fee.\n- **Utility charges** — WaterOne and Johnson County Wastewater set their own tap and connection fees.\n- **Sign permits**, which are their own row ($60 + $1.25/sq ft of sign area) and carry their own electrical note.",
    workedExample: {
      scenario:
        "A stand-alone electrical job on an existing building — a service upgrade and panel work declared at $12,000 of work value, not part of a larger permitted project.",
      inputs: {
        valuationCents: 1_200_000,
        occupancy: "residential",
        custom: {
          trade_bundled: null,
        },
      },
      notes:
        "Two lines — **$80.00**.\n\nFlat permit tier: $12,000 of work value sits in the $5,001–$19,000 band — the $50.00 flat building permit.\n\nFlat plan review: $30.00, due at the time of application.\n\nTotal: $50.00 + $30.00 = **$80.00** — the schedule's printed total for this tier ('a Total Plan Review and Permit Fee of … $80 for work valued at $5,001 - $19,000').\n\nWhat moves it: the same electrical work inside a larger permitted project pays nothing here — the building permit's valuation already carries it; and at $19,000+ of declared value the job leaves the flats for the 0.0050 submitted-value regime on the building page.",
    },
    faqs: [
      {
        question: "How much is an electrical permit in Overland Park?",
        answer:
          "There is no separate electrical permit. A stand-alone electrical-scale job pays the building-permit flat tier — $30 for $1–$5,000 of work value, $50 for $5,001–$19,000 — plus the $30 flat plan review, for printed totals of $60 and $80. Larger work prices inside a building permit at 0.0050 × declared value.",
        sourceId: OP_SOURCE_KEY,
      },
      {
        question: "Why doesn't Overland Park price electrical work separately?",
        answer:
          "The schedule's valuation definition includes 'electrical, plumbing, heating' in the total value every building permit prices, and its construction block names no trade permits. The city prices buildings, not scopes.",
        sourceId: OP_SOURCE_KEY,
      },
      {
        question: "Do I need an electrician licensed specifically by Overland Park?",
        answer:
          "Contractors are licensed through Johnson County's contractor licensing program (913-715-2233), which Overland Park participates in — a county license, not a city one.",
        sourceId: OP_SOURCE_KEY,
      },
      {
        question: "What about solar panels or an EV charger circuit?",
        answer:
          "Retrofit EV Ready circuits in single-family homes, duplexes and townhomes qualify for a 100% building-permit fee reduction, and Solar Retrofit permits get 50% off — both provisions sunset December 31, 2027. The work itself prices through the same project permit.",
        sourceId: OP_SOURCE_KEY,
      },
      {
        question: "Is there a permit for a sign with electrical components?",
        answer:
          "Signs have their own permit row: $60.00 plus $1.25 per square foot of sign area, including neon window signs. Signs installed without a permit pay double.",
        sourceId: OP_SOURCE_KEY,
      },
      {
        question: "When are permit fees paid?",
        answer:
          "On small projects, the plan review is due at application. On larger projects, 50% of the permit fee is due when construction documents are submitted and the other half at approval. Fees round to the nearest dollar.",
        sourceId: OP_SOURCE_KEY,
      },
    ],
    seoTitle: "Overland Park electrical permit cost: bundled into the building permit",
    seoDescription:
      "Overland Park has no separate electrical permit — stand-alone small jobs pay the $30/$50 flat tiers plus $30 plan review ($60/$80 printed totals); larger electrical work rides the building permit at 0.0050 × value.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: OVERLAND_PARK_LAST_VERIFIED,
  },
  {
    jurisdictionKey: OVERLAND_PARK_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    slug: "plumbing-permit-cost",
    title: "Overland Park plumbing permit cost",
    intro:
      "Overland Park publishes **no separate plumbing permit fee** — the same whole-project pricing that covers electrical covers plumbing. A stand-alone plumbing-scale job pays the **small-project regime**: the **$30.00 flat permit** for $1–$5,000 of work value or the **$50.00 flat** for $5,001–$19,000, each **plus the $30.00 flat plan review** — printed totals of **$60 and $80**. Plumbing inside a larger project is **carried by that project's building permit**, and the water and sewer taps belong to **other utilities entirely**.",
    localSummary:
      "Plumbing is the clearest case of Overland Park's whole-project pricing: a bathroom addition inside a permitted remodel costs nothing extra here, because the remodel's valuation — which the schedule defines to include plumbing — already carries it.\n\nThe stand-alone jobs that do hit the flat tiers are water-heater swaps, repipes and small repairs on existing buildings — and the schedule prints their price as a total, $60 or $80, permit and plan review together, with the plan review due at application.\n\nThe taps are the part that surprises people: the water tap is WaterOne's charge and the sewer connection is Johnson County Wastewater's — neither is an Overland Park permit fee, and neither appears in the city's schedule. The city's own plumbing-related rows are the ones a project permit carries and the small-project flats here.",
    notIncluded:
      "This page is the schedule's honest answer for plumbing work. It excludes:\n\n- **The building permit on larger projects** — 0.0050 × submitted value at $19,000+ (on the building page).\n- **Water tap fees** — WaterOne's (913-895-1800), a separate utility charge.\n- **Sewer connection fees** — Johnson County Wastewater's (913-715-8590), a separate jurisdiction's charge.\n- **Land disturbance and site development permits**, which price at 0.0050 with the same flats below $19,000 — recorded, not modelled.",
    workedExample: {
      scenario:
        "A stand-alone plumbing job on an existing building — a repipe and water-heater replacement declared at $3,500 of work value, not part of a larger permitted project.",
      inputs: {
        valuationCents: 350_000,
        occupancy: "residential",
        custom: {
          trade_bundled: null,
        },
      },
      notes:
        "Two lines — **$60.00**.\n\nFlat permit tier: $3,500 of work value sits in the $1–$5,000 band — the $30.00 flat building permit.\n\nFlat plan review: $30.00, due at the time of application.\n\nTotal: $30.00 + $30.00 = **$60.00** — the schedule's printed total for this tier ('a Total Plan Review and Permit Fee of $60 for work valued at $1 - $5,000').\n\nWhat moves it: the same plumbing work inside a larger permitted project pays nothing here — the building permit's valuation already carries it; the water tap itself is WaterOne's fee and the sewer connection is Johnson County Wastewater's, neither of which is a city permit; and at $19,000+ the job prices on the building page's 0.0050 regime.",
    },
    faqs: [
      {
        question: "How much is a plumbing permit in Overland Park?",
        answer:
          "There is no separate plumbing permit. A stand-alone plumbing-scale job pays the building-permit flat tier — $30 for $1–$5,000 of work value, $50 for $5,001–$19,000 — plus the $30 flat plan review, for printed totals of $60 and $80.",
        sourceId: OP_SOURCE_KEY,
      },
      {
        question: "Who charges for the water tap and sewer connection?",
        answer:
          "Other jurisdictions: WaterOne for water taps (913-895-1800) and Johnson County Wastewater for sewer connections (913-715-8590). Neither fee is an Overland Park permit charge.",
        sourceId: OP_SOURCE_KEY,
      },
      {
        question: "Does a water heater replacement need a permit?",
        answer:
          "As a stand-alone job it prices in the small-project regime: at a typical work value under $5,000, the $30.00 flat permit plus the $30.00 flat plan review — $60.00. Inside a larger permitted project it rides the building permit.",
        sourceId: OP_SOURCE_KEY,
      },
      {
        question: "How does a bathroom addition get permitted?",
        answer:
          "Inside the project's building permit. The schedule's valuation definition includes plumbing among the work the permit prices, so the addition's plumbing is part of the 0.0050 × submitted value (or the ICC-derived valuation, for new construction) — never a second permit.",
        sourceId: OP_SOURCE_KEY,
      },
      {
        question: "When is the plumbing-related plan review paid?",
        answer:
          "On small projects the $30 flat plan review is due at application. On larger projects, 50% of the permit fee is due at plan submission and the rest at approval — the split is a payment schedule, not an added fee.",
        sourceId: OP_SOURCE_KEY,
      },
      {
        question: "Are there plumbing fee reductions for EV or solar equipment?",
        answer:
          "The city's incentive regime covers EV Ready and Solar Ready construction — $500/$600 per dwelling unit for new single-family homes, duplexes and townhouses, 100% for retrofit EV circuits, and multi-family space reductions — all sunsetting December 31, 2027. They reduce the building permit fee that carries the plumbing, not a separate plumbing fee.",
        sourceId: OP_SOURCE_KEY,
      },
    ],
    seoTitle: "Overland Park plumbing permit cost: bundled into the building permit",
    seoDescription:
      "Overland Park has no separate plumbing permit — stand-alone small jobs pay the $30/$50 flat tiers plus $30 plan review ($60/$80 printed totals); larger work rides the building permit, and taps belong to WaterOne and JoCo Wastewater.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: OVERLAND_PARK_LAST_VERIFIED,
  },
];

const verifications: SeedVerification[] = [
  {
    entityType: "fee_schedule",
    entityKey: OVERLAND_PARK_KEYS.schedule,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: OVERLAND_PARK_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: OP_SOURCE_KEY,
    notes:
      "The 2025-08-01 schedule PDF read from the City's CivicPlus asset host; the Common Permit Fees explainer page (JS-rendered) read in a browser and cross-checked against the PDF — every amount agrees. The absence of trade permits verified against both the schedule's construction block and the explainer's permit families.",
  },
  {
    entityType: "jurisdiction_profile",
    entityKey: OVERLAND_PARK_KEYS.jurisdiction,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: OVERLAND_PARK_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: OP_SOURCE_KEY,
    notes:
      "Authority confirmed: Planning and Development Services / Building Safety at City Hall; the Building Official's annual ICC-tables adoption and the City Manager's Office review are stated in the schedule's own footnotes.",
  },
  {
    entityType: "permit_page",
    entityKey: "building-permit-cost",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: OVERLAND_PARK_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: OP_SOURCE_KEY,
    notes: "Worked example reproduces the 0.0035 ICC-path multiplier at an exact whole-dollar fee.",
  },
  {
    entityType: "permit_page",
    entityKey: "electrical-permit-cost",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: OVERLAND_PARK_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: OP_SOURCE_KEY,
    notes:
      "Worked example reproduces the $50 flat + $30 flat plan review = $80 printed total for $5,001–$19,000 stand-alone work.",
  },
  {
    entityType: "permit_page",
    entityKey: "plumbing-permit-cost",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: OVERLAND_PARK_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: OP_SOURCE_KEY,
    notes:
      "Worked example reproduces the $30 flat + $30 flat plan review = $60 printed total for $1–$5,000 stand-alone work.",
  },
];

export const overlandParkSeed: JurisdictionSeed = {
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
