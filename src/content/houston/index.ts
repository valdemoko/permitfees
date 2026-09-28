import type {
  JurisdictionSeed,
  SeedCounty,
  SeedDepartment,
  SeedFeeRule,
  SeedJurisdiction,
  SeedJurisdictionPermitType,
  SeedPermitPage,
  SeedPermitType,
  SeedProfile,
  SeedProjectType,
  SeedRequirement,
  SeedSource,
  SeedState,
  SeedVerification,
} from "@/content/seed-types";
import type { FeeRuleRecord } from "@/lib/calc/types";

import {
  HOUSTON_FEE_SCHEDULE_SOURCE_KEY,
  HOUSTON_ADMINISTRATIVE_FEE,
  HOUSTON_DEMOLITION_ADDITIONAL_STORY,
  HOUSTON_DEMOLITION_FIRST_STORY,
  HOUSTON_ELECTRICAL_LIGHTING_FIXTURE,
  HOUSTON_ELECTRICAL_METER_LOOP_UP_TO_50KW,
  HOUSTON_ELECTRICAL_OUTLET,
  HOUSTON_ELECTRICAL_PANEL,
  HOUSTON_HVAC_BASE_CHARGE,
  HOUSTON_HVAC_SELF_CONTAINED,
  HOUSTON_HVAC_VENTILATION_FANS,
  HOUSTON_MINIMUM_PERMIT_FEE,
  HOUSTON_PLUMBING_FIXTURE,
  HOUSTON_PLUMBING_FURNACE,
  HOUSTON_PLUMBING_MINIMUM_FEE,
  HOUSTON_PLUMBING_SEPTIC,
  HOUSTON_PLUMBING_SEWER_CONNECTION,
  HOUSTON_PLUMBING_WALL_HEATER,
  HOUSTON_PLUMBING_YARD_LIGHT,
  HOUSTON_STRUCTURAL_BRACKETS,
} from "./fee-rules";

export * from "./fee-rules";

/**
 * The complete Houston seed payload.
 *
 * Every field here traces to `research/texas/houston.md`, which traces to the City of
 * Houston's own published documents. Nothing in this file is estimated.
 *
 * The payload uses **stable string keys**, never database UUIDs. The seed script
 * resolves keys to IDs, which is what makes the seed idempotent: running it twice
 * updates the same rows instead of creating a second Houston.
 */

/** The date every amount in the City-Wide Fee Schedule shows in its `As Of` column. */
export const HOUSTON_FEE_EFFECTIVE_FROM = "2026-01-01";

/** The date a human last read the city's published schedule. */
export const HOUSTON_LAST_VERIFIED = "2026-09-23";

export const HOUSTON_KEYS = {
  state: "tx",
  county: "harris-county",
  jurisdiction: "houston",
  /** Shared by the source row and the fee schedule row that cites it. */
  feeSchedule: HOUSTON_FEE_SCHEDULE_SOURCE_KEY,
} as const;

/**
 * The payload's shape is shared with every other jurisdiction — see
 * `@/content/seed-types`, which is where it lives now that Dallas is the second
 * one. The local aliases below are kept short at their use sites.
 */
/** The complete Houston payload, structurally checked against the shared shape. */
export type HoustonSeed = JurisdictionSeed;

/* -------------------------------------------------------------------------- */
/* Geography                                                                  */
/* -------------------------------------------------------------------------- */

const state: SeedState = {
  code: "TX",
  slug: "texas",
  name: "Texas",
  fipsCode: "48",
};

const county: SeedCounty = {
  key: HOUSTON_KEYS.county,
  slug: "harris-county",
  name: "Harris County",
  // Harris County, Texas. Recorded so a later Harris County jurisdiction can be
  // linked to the same county row rather than creating a second one.
  fipsCode: "48201",
};

const jurisdiction: SeedJurisdiction = {
  key: HOUSTON_KEYS.jurisdiction,
  stateKey: HOUSTON_KEYS.state,
  countyKey: HOUSTON_KEYS.county,
  type: "city",
  slug: "houston",
  name: "Houston",
  officialName: "City of Houston",
  websiteUrl: "https://www.houstontx.gov/",
  permitPortalUrl: "https://www.houstonpermittingcenter.org/",
  timezone: "America/Chicago",
  isActive: true,
};

/* -------------------------------------------------------------------------- */
/* Departments                                                                */
/* -------------------------------------------------------------------------- */

const departments: SeedDepartment[] = [
  {
    key: "houston-hpw",
    jurisdictionKey: HOUSTON_KEYS.jurisdiction,
    kind: "building",
    name: "Houston Public Works — Houston Permitting Center",
    phone: "832.394.9000",
    email: null,
    url: "https://www.houstonpublicworks.org/houston-permitting-center",
    addressLine: "1002 Washington Ave., Houston, TX 77002",
    hours: null,
    notes:
      "Issues and inspects building, electrical, plumbing and mechanical permits for property inside the Houston city limits. Recorded from the department's own published contact details.",
  },
];

/* -------------------------------------------------------------------------- */
/* Sources                                                                    */
/* -------------------------------------------------------------------------- */

const sources: SeedSource[] = [
  {
    key: HOUSTON_KEYS.feeSchedule,
    jurisdictionKey: HOUSTON_KEYS.jurisdiction,
    title: "City-Wide Fee Schedule",
    url: "https://cohweb.houstontx.gov/fin_feeschedule/default.aspx",
    sourceType: "municipal_website",
    issuingAuthority: "City of Houston",
    authorityKind: "city",
    isPrimary: true,
    // The schedule has no single document date: dates are per fee row, which is
    // recorded on each rule's `effectiveFrom` instead of being invented here.
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: HOUSTON_LAST_VERIFIED,
    lastVerifiedAt: HOUSTON_LAST_VERIFIED,
    notes:
      "Authoritative current fee schedule for all City departments. Each row carries a statutory authority (for example 'Bldg. Code Sec. 118.2.1'), the amount or a 'Calculation' note, and an 'As Of' date. The HPW department section was read in a browser; the page renders its tables client-side, so it cannot be fetched as plain HTML.",
  },
  {
    key: "houston-municode",
    jurisdictionKey: HOUSTON_KEYS.jurisdiction,
    title: "Houston Code of Ordinances — Houston Amendments to the Building Code, Section 118",
    url: "https://library.municode.com/tx/houston/codes/code_of_ordinances",
    sourceType: "municipal_code",
    issuingAuthority: "City of Houston",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: HOUSTON_LAST_VERIFIED,
    // Still NOT READ (see the needs_review verification below); lastVerifiedAt is
    // the date the source's existence, URL and citation were audited, not the date
    // its text was read.
    lastVerifiedAt: HOUSTON_LAST_VERIFIED,
    notes:
      "The ordinance text behind the fee schedule. Identified but NOT YET READ. Needed for the definition of 'unit valuation' used by Bldg. Code Sec. 118.3.1, which is why the HVAC percentage-of-valuation component is not modelled.",
  },
  {
    key: "houston-fee-estimators",
    jurisdictionKey: HOUSTON_KEYS.jurisdiction,
    title: "Building Permit Fee Estimator (Residential and Commercial)",
    url: "https://hpwoltest.houstontx.gov/BuildingPermitFee/index.html",
    sourceType: "official_calculator",
    issuingAuthority: "City of Houston Public Works",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: HOUSTON_LAST_VERIFIED,
    lastVerifiedAt: HOUSTON_LAST_VERIFIED,
    notes:
      "Used for two published statements only: the city's own definition of 'valuation', and its list of which other departments may charge separate fees. The estimator's own outputs are not used as a source; we calculate from the schedule so the arithmetic is inspectable.",
  },
];

/* -------------------------------------------------------------------------- */
/* Permit catalogue                                                           */
/* -------------------------------------------------------------------------- */

const permitTypes: SeedPermitType[] = [
  {
    key: "building",
    slug: "building-permit-cost",
    name: "Building permit",
    category: "structural",
    appliesTo: "both",
    summary:
      "Structural construction, additions and alterations. In Houston the fee is set by building valuation under Bldg. Code Sec. 118.2.1.",
    sortOrder: 10,
  },
  {
    key: "electrical",
    slug: "electrical-permit-cost",
    name: "Electrical permit",
    category: "electrical",
    appliesTo: "both",
    summary:
      "Meter loops, panels, outlets and fixtures, priced per item under Bldg. Code Sec. 118.6.",
    sortOrder: 20,
  },
  {
    key: "plumbing",
    slug: "plumbing-permit-cost",
    name: "Plumbing permit",
    category: "plumbing",
    appliesTo: "both",
    summary:
      "Fixtures, water heaters, gas outlets and sewer connections, priced per item under Bldg. Code Sec. 118.5.",
    sortOrder: 30,
  },
  {
    key: "mechanical",
    slug: "mechanical-permit-cost",
    name: "Mechanical (HVAC) permit",
    category: "mechanical",
    appliesTo: "both",
    summary:
      "Heating, ventilation and air conditioning work under Bldg. Code Sec. 118.3.",
    sortOrder: 40,
  },
  {
    key: "demolition",
    slug: "demolition-permit-cost",
    name: "Demolition permit",
    category: "structural",
    appliesTo: "both",
    summary: "Building demolition, priced per story under Bldg. Code Sec. 118.2.1.",
    sortOrder: 50,
  },
];

/**
 * Project types are deliberately few. They exist only where the permit page for
 * that scope carries content Houston-specific enough to justify its own URL.
 */
const projectTypes: SeedProjectType[] = [
  {
    key: "new-home",
    slug: "new-home",
    name: "New single-family home",
    description: "New residential construction from the ground up.",
    sortOrder: 10,
  },
  {
    key: "kitchen-remodel",
    slug: "kitchen-remodel",
    name: "Kitchen or bathroom remodel",
    description: "Interior alteration affecting plumbing, electrical or mechanical systems.",
    sortOrder: 20,
  },
];

/* -------------------------------------------------------------------------- */
/* Which permits Houston actually issues                                      */
/* -------------------------------------------------------------------------- */

const jurisdictionPermitTypes: SeedJurisdictionPermitType[] = [
  {
    jurisdictionKey: HOUSTON_KEYS.jurisdiction,
    permitTypeKey: "building",
    isAvailable: true,
    localName: "Building Permit",
    officialUrl: "https://www.houstonpublicworks.org/houston-permitting-center",
    notes: "Required for structural construction, additions and alterations inside the city limits.",
  },
  {
    jurisdictionKey: HOUSTON_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    isAvailable: true,
    localName: "Electrical Permit",
    officialUrl: "https://www.houstonpublicworks.org/houston-permitting-center",
    notes: "Issued as a separate permit from the building permit, under Bldg. Code Sec. 118.6.",
  },
  {
    jurisdictionKey: HOUSTON_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    isAvailable: true,
    localName: "Plumbing Permit",
    officialUrl: "https://www.houstonpublicworks.org/houston-permitting-center",
    notes:
      "Issued separately. Houston sets a higher minimum permit fee for plumbing than for other trades: $97.56 against $91.06.",
  },
  {
    jurisdictionKey: HOUSTON_KEYS.jurisdiction,
    permitTypeKey: "mechanical",
    isAvailable: true,
    localName: "Mechanical Permit",
    officialUrl: "https://www.houstonpublicworks.org/houston-permitting-center",
    notes: "Covers heating, ventilation and air conditioning work under Bldg. Code Sec. 118.3.",
  },
  {
    jurisdictionKey: HOUSTON_KEYS.jurisdiction,
    permitTypeKey: "demolition",
    isAvailable: true,
    localName: "Demolition Permit",
    officialUrl: "https://www.houstonpublicworks.org/houston-permitting-center",
    notes:
      "Priced per story under Bldg. Code Sec. 118.2.1. Demolition inside the city limits may also require permits from other City departments.",
  },
];

/* -------------------------------------------------------------------------- */
/* Fee schedule                                                               */
/* -------------------------------------------------------------------------- */

const feeSchedules: HoustonSeed["feeSchedules"] = [
  {
    key: HOUSTON_KEYS.feeSchedule,
    jurisdictionKey: HOUSTON_KEYS.jurisdiction,
    sourceKey: HOUSTON_KEYS.feeSchedule,
    title: "City of Houston City-Wide Fee Schedule — Bldg. Code Sec. 118 series",
    officialUrl: "https://cohweb.houstontx.gov/fin_feeschedule/default.aspx",
    effectiveFrom: HOUSTON_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: HOUSTON_LAST_VERIFIED,
    notes:
      "Every rule below shows 'As Of 01/01/2026' in the city's own schedule. Houston has no single effective date for the schedule as a whole; dates are per fee row.",
  },
];

/* -------------------------------------------------------------------------- */
/* Fee rules, grouped by the permit each belongs to                           */
/* -------------------------------------------------------------------------- */

/**
 * The disputed minimum fee pair.
 *
 * Bldg. Code Sec. 118.1.3 publishes a minimum permit fee ($91.06, or $97.56 for
 * plumbing) for "all permits except Plumbing". Bldg. Code Sec. 118.2.1 publishes
 * a $47.00 flat fee for structural valuations up to $7,000. For a $5,000
 * valuation the two published rules disagree, and the schedule does not say which
 * one prevails.
 *
 * They therefore ship as `draft`, so they are never silently added to a
 * calculated total. The engine reports them as excluded with a reason, and the
 * pages state the ambiguity in prose. See research/texas/houston.md Ambiguity A8.
 */
const disputedMinimums: FeeRuleRecord[] = [
  { ...HOUSTON_MINIMUM_PERMIT_FEE, status: "draft" },
  { ...HOUSTON_PLUMBING_MINIMUM_FEE, status: "draft" },
];

/**
 * §118.1.1 / Code Sec. 1-14. The schedule says fees "may be subject to" this
 * administrative fee and tells the reader to ask the department. Shipping it as
 * `draft` keeps it out of the total while still publishing its existence.
 */
const disputedAdministrative: FeeRuleRecord = { ...HOUSTON_ADMINISTRATIVE_FEE, status: "draft" };

function rulesFor(
  permitTypeKey: string,
  rules: FeeRuleRecord[],
): SeedFeeRule[] {
  return rules.map((rule) => ({
    jurisdictionKey: HOUSTON_KEYS.jurisdiction,
    permitTypeKey,
    scheduleKey: HOUSTON_KEYS.feeSchedule,
    rule,
  }));
}

const feeRules: SeedFeeRule[] = [
  ...rulesFor("building", [...HOUSTON_STRUCTURAL_BRACKETS, ...disputedMinimums, disputedAdministrative]),

  ...rulesFor("electrical", [
    HOUSTON_ELECTRICAL_METER_LOOP_UP_TO_50KW,
    HOUSTON_ELECTRICAL_PANEL,
    HOUSTON_ELECTRICAL_OUTLET,
    HOUSTON_ELECTRICAL_LIGHTING_FIXTURE,
    ...disputedMinimums,
    disputedAdministrative,
  ]),

  ...rulesFor("plumbing", [
    HOUSTON_PLUMBING_FIXTURE,
    HOUSTON_PLUMBING_FURNACE,
    HOUSTON_PLUMBING_WALL_HEATER,
    // Transcribed in the first research pass but never attached to a permit type,
    // which left the plumbing page describing a row its own table did not list.
    // The rate is §118.5.3 from the same schedule as everything else here.
    HOUSTON_PLUMBING_YARD_LIGHT,
    HOUSTON_PLUMBING_SEWER_CONNECTION,
    HOUSTON_PLUMBING_SEPTIC,
    ...disputedMinimums,
  ]),

  ...rulesFor("mechanical", [
    HOUSTON_HVAC_BASE_CHARGE,
    HOUSTON_HVAC_VENTILATION_FANS,
    HOUSTON_HVAC_SELF_CONTAINED,
    ...disputedMinimums,
  ]),

  ...rulesFor("demolition", [
    HOUSTON_DEMOLITION_FIRST_STORY,
    HOUSTON_DEMOLITION_ADDITIONAL_STORY,
    ...disputedMinimums,
  ]),
];

/* -------------------------------------------------------------------------- */
/* Requirements                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Only requirements stated by a source we have actually read. Houston-specific
 * document lists are published in the permitting center's own guides, which this
 * pass did not read, so nothing is invented here to fill the section out.
 */
const requirements: SeedRequirement[] = [
  {
    jurisdictionKey: HOUSTON_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "document",
    title: "Project valuation",
    description:
      "The permit fee is driven by valuation, which the City defines as the total cost of construction to the end user, excluding land purchase costs and the overhead attributed to land purchase. The value of donated goods and services is included.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: "houston-fee-estimators",
    lastVerifiedAt: HOUSTON_LAST_VERIFIED,
  },
  {
    jurisdictionKey: HOUSTON_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "Property inside the Houston city limits",
    description:
      "The City of Houston issues permits and charges these fees for property inside the city limits. A Houston mailing address does not by itself establish that. Unincorporated Harris County issues its own permits under its own fee order.",
    isMandatory: true,
    sortOrder: 20,
    sourceKey: HOUSTON_KEYS.feeSchedule,
    lastVerifiedAt: HOUSTON_LAST_VERIFIED,
  },
];

/* -------------------------------------------------------------------------- */
/* Jurisdiction profile                                                       */
/* -------------------------------------------------------------------------- */

const profile: SeedProfile = {
  jurisdictionKey: HOUSTON_KEYS.jurisdiction,
  headline: "What construction permits cost in Houston",
  summary:
    "Houston prices building permits off project valuation, using a nine-bracket schedule in Bldg. Code Sec. 118.2.1. Electrical and plumbing permits work differently: they are priced per item — per meter loop, per outlet, per fixture. Both schedules are published in the City-Wide Fee Schedule, which is what every figure on these pages is read from.",
  localContext:
    "Three things about Houston are worth knowing before you read any number here.\n\nThe first is geography. Houston's fees apply to property inside the city limits. A Houston mailing address does not establish that, and unincorporated Harris County issues its own permits under its own fee order. If you are not certain which authority covers your property, ask the Permitting Center before you budget from these figures.\n\nThe second is the shape of the building schedule. It is not a simple percentage. Each bracket pairs a published Base Charge with a rate per additional $1,000 of valuation, rounded up to the next $1,000 — the schedule's own words are 'or fraction thereof'. That rounding is not decorative: one cent over a bracket boundary moves you into the next bracket and pays a whole $1,000 increment.\n\nThe third is that the Base Charges do not chain arithmetically. Houston adjusts fees periodically and rounds each bracket independently, so over time the brackets drift apart. For example, the arithmetic at the top of the $7,001–$150,000 bracket produces $813.48 for a $150,000 valuation, while the next bracket publishes a Base Charge of $815.07 for the same figure. We reproduce the city's published Base Charge rather than reconciling it, because those are the numbers the permit office will charge you.",
  valuationBasis:
    "Houston defines valuation as the total cost of construction to the end user, excluding land purchase costs and the overhead attributed to land purchase. Donated goods and services are included in the value.\n\nSeparately, Bldg. Code Sec. 118.2.1 references a construction-type valuation table (Table 601, adopted by Ord. No. 2023-907) that establishes valuation from building construction type and floor area. That table is published in the schedule and has not yet been transcribed here, so no page on this site derives a valuation from square footage. Where a figure is required, you supply it.",
  notIncluded:
    "These figures are the City of Houston's building, electrical, plumbing and mechanical permit fees as published in the City-Wide Fee Schedule. They are not a total project cost, and they do not include:\n\n- Fees administered by other City departments, which the City's own estimator lists as Planning & Development; Utility Planning & Analysis; Flood Plain Management; Engineering Services; the Health Department; and Administration & Regulatory Affairs (for commercial permits).\n- Sidewalk and alarm permit fees, which the City's estimator states are excluded from the building permit fee.\n- Plan review by the City Engineer, billed at $134.28 for administrative review plus $96.67 per plan sheet.\n- The administrative fee under Code Sec. 1-14, which the fee schedule says fees 'may be subject to'.\n- Re-inspection fees ($94.00) when a re-inspection is required.\n- Any Fire Department, health or utility fee.",
  seoTitle: "Houston, Texas construction permit fees",
  seoDescription:
    "How Houston prices building, electrical, plumbing and mechanical permits, from the City's own fee schedule, with the code section behind every figure.",
  publishStatus: "published",
  noindex: false,
  lastReviewedAt: HOUSTON_LAST_VERIFIED,
};

/* -------------------------------------------------------------------------- */
/* Permit pages                                                               */
/* -------------------------------------------------------------------------- */

const permitPages: SeedPermitPage[] = [
  {
    jurisdictionKey: HOUSTON_KEYS.jurisdiction,
    permitTypeKey: "building",
    slug: "building-permit-cost",
    title: "Houston building permit cost",
    intro:
      "Houston charges a building permit fee from the valuation of the work, using nine brackets published in Bldg. Code Sec. 118.2.1. Below $7,000 of valuation the fee is a flat $47.00. Above that, each bracket pairs a Base Charge with a rate per additional $1,000 of valuation, rounded up to the next $1,000.",
    localSummary:
      "The published bands run from a flat $47.00 up to $7,000 of valuation, then $47.00 plus $5.36 per additional $1,000 up to $150,000, and onward through nine bands ending at $109,834.09 plus $1.34 per additional $1,000 above $50,000,000.\n\nTwo details change the answer more than people expect. The rate applies to fractions of $1,000 as if they were whole: a valuation of $150,000.01 pays a full $5.03 increment, not a hundredth of one. And the Base Charge in each bracket is the city's published figure, not a value chained from the bracket below it.",
    notIncluded:
      "This is the structural building permit fee only. It excludes the City Engineer plan review ($134.28 administrative plus $96.67 per plan sheet), the Code Sec. 1-14 administrative fee, re-inspection fees, and fees charged by other City departments such as Flood Plain Management, Engineering Services, the Health Department, and Administration & Regulatory Affairs for commercial permits. Houston's own estimator lists sidewalk and alarm permits as excluded from the building permit fee.",
    workedExample: {
      scenario:
        "A new single-family house, permitted on its construction valuation. Which bracket applies depends on that figure, and once it is picked the rate is charged for every whole $1,000 of valuation, including fractions of one.",
      inputs: { valuationCents: 40_000_000 },
      notes:
        "The valuation is the example's, not the City's — a round figure chosen so the arithmetic can be followed by hand. Enter a different figure and a different bracket row applies. Every rate behind this total was transcribed from the City-Wide Fee Schedule, As Of 01/01/2026.",
    },
    faqs: [
      {
        question: "Is the building permit fee a percentage of construction cost?",
        answer:
          "Not in Houston. The schedule is written as a Base Charge plus a dollar rate per additional $1,000 of valuation. Because $5.36 per $1,000 is 0.536%, a percentage calculation rounded to two decimal places would not reproduce the city's own figures, so the official unit is used as published.",
      },
      {
        question: "Does Houston round the valuation up before charging the rate?",
        answer:
          "Yes. Each bracket charges per additional $1,000 of valuation, or fraction thereof. A valuation $1 above a bracket floor is charged a whole $1,000 increment.",
      },
      {
        question: "Why does a valuation of $150,000 pay $813.48 when the next bracket starts at a base of $815.07?",
        answer:
          "Because Houston's published Base Charges do not chain arithmetically. The city adjusts fees periodically and rounds each bracket independently, so the brackets drift apart over time. The published figure for each bracket is what we use, because it is what the permit office charges.",
      },
      {
        question: "Is the fee the same for a renovation as for new construction?",
        answer:
          "The structural fee depends on valuation, not on whether the work is new or a remodel. Other permits a renovation may require — electrical, plumbing, mechanical — are priced separately and listed in the schedule under their own code sections.",
      },
    ],
    seoTitle: "Houston building permit cost: how the fee is calculated",
    seoDescription:
      "Houston building permit fees are set by project valuation across nine brackets in Bldg. Code Sec. 118.2.1. Every rate, base charge and rounding rule, with the official source.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: HOUSTON_LAST_VERIFIED,
  },
  {
    jurisdictionKey: HOUSTON_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    slug: "electrical-permit-cost",
    title: "Houston electrical permit cost",
    intro:
      "Houston does not price electrical permits off project valuation. Bldg. Code Sec. 118.6 sets a fee for each item of work: so much for the meter loop and service, so much per panel, so much per outlet. The permit fee is the sum of the items on the permit.",
    localSummary:
      "The main building blocks in the published schedule are a meter loop and service up to 50 kW at $94.00, each electrical panel with 8 or more circuits at $9.39, and each outlet at $1.34. Levels above 50 kW and 250 kW are priced separately at $100.71 and $107.42.\n\nBecause the schedule is written per item, the two numbers that matter most are how many items your project has and which of the schedule's rows describe them. A service change and a room addition can both be 'an electrical permit' and cost very different amounts.",
    notIncluded:
      "This covers the electrical rows we have transcribed: meter loops and service, panels, outlets, and lighting or appliance fixtures. Bldg. Code Sec. 118.6 also publishes separate rows for EV charging outlets by level, motors by horsepower, electrical signs, ball park and parking lot light poles, temporary saw poles, reconnection, and annual maintenance permits. Those are in the schedule and are not modelled here.\n\nService drops, fire alarm, and any work administered by other City departments are also outside this figure.",
    workedExample: {
      scenario:
        "A service upgrade: one meter loop and service up to 50 kW, plus the outlets being added on the same permit. Houston prices these as separate items, so more than one row appears in the total.",
      inputs: { custom: { outlets: 40 } },
      notes:
        "The outlet count is the example's, not the City's. Note what the total does not include: the panel row and the lighting or appliance row are in the schedule but absent from this example, because the work described has neither. Houston's $91.06 minimum permit fee is not added either — see the note on the minimum below.",
    },
    faqs: [
      {
        question: "How many outlets can I put on a permit?",
        answer:
          "The schedule gives no limit per permit; it charges $1.34 per outlet. The practical constraint is that the permit has to describe the work being inspected, so the count on the permit should match the work.",
      },
      {
        question: "Is a panel with fewer than 8 circuits charged?",
        answer:
          "Not under this row. Bldg. Code Sec. 118.6.1 prices an electrical panel with 8 or more circuits at $9.39 each. The schedule's row is scoped to panels of that size.",
      },
      {
        question: "Does Houston have a minimum electrical permit fee?",
        answer:
          "The schedule publishes a $91.06 minimum permit fee under Bldg. Code Sec. 118.1.3 for all permits except plumbing. That figure sits alongside the per-item rows, and the schedule does not state how the two interact for a small permit. We do not add it to the calculated total; expect the permit fee to be at least the minimum.",
      },
    ],
    seoTitle: "Houston electrical permit cost: per-item fees and rates",
    seoDescription:
      "Houston electrical permits are priced per item under Bldg. Code Sec. 118.6: $94.00 for a meter loop up to 50 kW, $9.39 per panel, $1.34 per outlet. Rates and source.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: HOUSTON_LAST_VERIFIED,
  },
  {
    jurisdictionKey: HOUSTON_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    slug: "plumbing-permit-cost",
    title: "Houston plumbing permit cost",
    intro:
      "Houston prices plumbing permits per fixture and per appliance under Bldg. Code Sec. 118.5. Most rows share the same shape: a base charge covering the first one to three items on the permit, then a flat amount for each additional item on the same permit.",
    localSummary:
      "The plumbing fixture row is the one most permits touch. Bldg. Code Sec. 118.5.4 charges $34.24 for 1 to 3 fixtures, then $11.41 for each additional fixture on the same permit. The same $34.24-then-$11.41 pattern applies to furnaces, wall heaters, yard lights and BBQ grill openings, and roof drains.\n\nSome items are priced flat instead: a sewer connection is $53.71, and so is a septic tank or individual sewage treatment plant. Tanks have their own size bands, running from $94.00 for up to 1,000 gallons to $228.28 above 30,000 gallons.",
    notIncluded:
      "This covers the plumbing rows we have transcribed from Bldg. Code Sec. 118.5: fixtures, furnaces, wall heaters, yard light or BBQ openings, sewer connections and septic tanks. The schedule also publishes a 16-row group under Bldg. Code Sec. 118.5.1 that has not yet been read, covering other plumbing permit types. Until it is, treat this figure as covering the items listed above and not as a complete plumbing schedule.\n\nGas piping beyond the fixtures listed, backflow prevention and grease interceptors are not modelled here.",
    workedExample: {
      scenario:
        "A remodel with every fixture on one plumbing permit. The shape of the row is what matters: the first three fixtures are covered by a single base charge, and each fixture after that is charged on its own.",
      inputs: { fixtures: 10 },
      notes:
        "The fixture count is the example's, not the City's. Houston's minimum permit fee for plumbing is $97.56 — the one trade whose minimum differs from the $91.06 charged on the others — and it is not added to this total; see the note on the minimum below.",
    },
    faqs: [
      {
        question: "Why is the plumbing minimum permit fee higher than other trades?",
        answer:
          "The City's own schedule separates it. Bldg. Code Sec. 118.1.3 lists a minimum permit fee of $97.56 for plumbing and $91.06 for everything else, naming structural, electrical, HVAC equipment and several other permit types explicitly in the $91.06 group.",
      },
      {
        question: "Do fixtures on separate permits each get the base charge?",
        answer:
          "Yes. The schedule's wording is per the same permit: $34.24 covers the first three fixtures on one permit, and $11.41 applies to each additional fixture on that permit.",
      },
      {
        question: "Is a water heater charged as a fixture?",
        answer:
          "Water heaters are not one of the rows transcribed here. The schedule prices furnaces, wall heaters and gas appliances as their own items under Bldg. Code Sec. 118.5.2 and 118.5.4, so a water heater is not simply counted as a plumbing fixture.",
      },
    ],
    seoTitle: "Houston plumbing permit cost: per-fixture fees explained",
    seoDescription:
      "Houston plumbing permits cost $34.24 for the first 3 fixtures plus $11.41 each additional, under Bldg. Code Sec. 118.5.4. Full rates, minimums and the official source.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: HOUSTON_LAST_VERIFIED,
  },
  {
    jurisdictionKey: HOUSTON_KEYS.jurisdiction,
    permitTypeKey: "mechanical",
    slug: "mechanical-permit-cost",
    title: "Houston mechanical (HVAC) permit cost",
    /**
     * HELD BACK. The flat rows are fully sourced, but Bldg. Code Sec. 118.3.1 also
     * publishes "Base Charge plus 2% of Unit Valuation" with an Amount of
     * `Calculation`, and "unit valuation" is defined only in the Building Code
     * text (source S2), which has not been read. A page whose headline figure is
     * the one component we cannot compute would be worse than no page.
     */
    intro:
      "Research in progress. This page is not published.",
    localSummary: "",
    notIncluded: "",
    workedExample: null,
    faqs: null,
    seoTitle: "",
    seoDescription: "",
    publishStatus: "draft",
    noindex: true,
    lastReviewedAt: null,
  },
  {
    jurisdictionKey: HOUSTON_KEYS.jurisdiction,
    permitTypeKey: "demolition",
    slug: "demolition-permit-cost",
    title: "Houston demolition permit cost",
    /**
     * HELD BACK. Only two fee rows exist, and the page has nothing to add beyond
     * restating them. See research/texas/houston.md section 6.
     */
    intro: "Research in progress. This page is not published.",
    localSummary: "",
    notIncluded: "",
    workedExample: null,
    faqs: null,
    seoTitle: "",
    seoDescription: "",
    publishStatus: "draft",
    noindex: true,
    lastReviewedAt: null,
  },
];

/* -------------------------------------------------------------------------- */
/* Verification ledger                                                        */
/* -------------------------------------------------------------------------- */

const verifications: SeedVerification[] = [
  {
    entityType: "fee_schedule",
    entityKey: HOUSTON_KEYS.feeSchedule,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: HOUSTON_LAST_VERIFIED,
    verifiedBy: "Permit Fee Intelligence research pass 1",
    sourceKey: HOUSTON_KEYS.feeSchedule,
    notes:
      "Read directly from the City's interactive fee schedule in a browser on 2026-09-23. Every transcribed amount showed 'As Of 01/01/2026'.",
  },
  {
    entityType: "source",
    entityKey: "houston-municode",
    status: "needs_review",
    method: "manual_review",
    verifiedAt: HOUSTON_LAST_VERIFIED,
    verifiedBy: "Permit Fee Intelligence research pass 1",
    sourceKey: "houston-municode",
    notes:
      "Identified and recorded, not yet read. Blocks the HVAC percentage-of-valuation component and the construction-type valuation table.",
  },
  {
    entityType: "fee_rule",
    entityKey: "MIN-118.1.3",
    permitTypeKey: "building",
    status: "disputed",
    method: "manual_review",
    verifiedAt: HOUSTON_LAST_VERIFIED,
    verifiedBy: "Permit Fee Intelligence research pass 1",
    sourceKey: HOUSTON_KEYS.feeSchedule,
    notes:
      "DISPUTED. The schedule publishes both a $91.06 minimum permit fee (Bldg. Code Sec. 118.1.3) and a $47.00 flat fee for structural valuations up to $7,000 (Sec. 118.2.1). For a $5,000 valuation the two rules give different answers and the schedule does not say which prevails. The rule ships as draft and is never added to a calculated total. Needs confirmation with the Houston Permitting Center.",
  },
  {
    entityType: "fee_rule",
    entityKey: "ADMIN-118.1.1",
    permitTypeKey: "building",
    status: "needs_review",
    method: "manual_review",
    verifiedAt: HOUSTON_LAST_VERIFIED,
    verifiedBy: "Permit Fee Intelligence research pass 1",
    sourceKey: HOUSTON_KEYS.feeSchedule,
    notes:
      "The schedule states that fees 'may be subject to an administrative fee per Code Section 1-14' and instructs the reader to check with the department. Which transactions attract it is not published, so it is excluded from totals.",
  },
  {
    entityType: "permit_page",
    entityKey: "building-permit-cost",
    permitTypeKey: "building",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: HOUSTON_LAST_VERIFIED,
    verifiedBy: "Permit Fee Intelligence research pass 1",
    sourceKey: HOUSTON_KEYS.feeSchedule,
    notes: "All nine brackets transcribed from the City-Wide Fee Schedule and covered by regression tests.",
  },
  {
    entityType: "permit_page",
    entityKey: "electrical-permit-cost",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: HOUSTON_LAST_VERIFIED,
    verifiedBy: "Permit Fee Intelligence research pass 1",
    sourceKey: HOUSTON_KEYS.feeSchedule,
    notes: "Meter loop, panel, outlet and lighting rows transcribed. Other §118.6 rows are out of scope and stated as such.",
  },
  {
    entityType: "permit_page",
    entityKey: "plumbing-permit-cost",
    permitTypeKey: "plumbing",
    status: "needs_review",
    method: "official_portal_check",
    verifiedAt: HOUSTON_LAST_VERIFIED,
    verifiedBy: "Permit Fee Intelligence research pass 1",
    sourceKey: HOUSTON_KEYS.feeSchedule,
    notes:
      "§118.5.2, §118.5.3 and §118.5.4 transcribed. The 16-row group under §118.5.1 has not been read, and the page states that limit rather than implying a complete plumbing schedule.",
  },
  {
    entityType: "jurisdiction_profile",
    entityKey: HOUSTON_KEYS.jurisdiction,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: HOUSTON_LAST_VERIFIED,
    verifiedBy: "Permit Fee Intelligence research pass 1",
    sourceKey: HOUSTON_KEYS.feeSchedule,
    notes: "Hub content built from the City-Wide Fee Schedule and the City's own published fee estimator.",
  },
];

/* -------------------------------------------------------------------------- */
/* Export                                                                     */
/* -------------------------------------------------------------------------- */

export const houstonSeed: HoustonSeed = {
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

/** Permit pages that clear the editorial gate, for use in tests without a database. */
export const HOUSTON_PUBLISHED_PERMIT_PAGES = houstonSeed.permitPages.filter(
  (page) => page.publishStatus === "published" && !page.noindex,
);

/** Permit pages deliberately held back, with the reason research/texas/houston.md gives. */
export const HOUSTON_WITHHELD_PERMIT_PAGES = houstonSeed.permitPages.filter(
  (page) => page.publishStatus !== "published" || page.noindex,
);
