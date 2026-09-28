import type {
  JurisdictionSeed,
  SeedDepartment,
  SeedFeeRule,
  SeedJurisdictionPermitType,
  SeedPermitPage,
  SeedProfile,
  SeedRequirement,
  SeedSource,
  SeedVerification,
} from "@/content/seed-types";
import type { FeeRuleRecord } from "@/lib/calc/types";

import {
  DALLAS_A1_BRACKETS,
  DALLAS_A2_RULES,
  DALLAS_A3_BRACKETS,
  DALLAS_FEE_SCHEDULE_SOURCE_KEY,
  DALLAS_INSPECTION_TRADES,
  DALLAS_ORDINANCE_SOURCE_KEY,
  DALLAS_PLAN_REVIEW_DISPUTED,
  DALLAS_TECHNOLOGY_FEE,
  DALLAS_WORKSHEET_SOURCE_KEY,
} from "./fee-rules";

export * from "./fee-rules";

/**
 * The complete Dallas seed payload.
 *
 * Every field traces to `research/texas/dallas.md`, which traces to documents published
 * by the City of Dallas. Nothing here is estimated, and the two places where the
 * City's own documents disagree with each other are `draft` rules that can never
 * reach a total.
 *
 * Dallas is the second jurisdiction in Texas, so it defines **no** state, county,
 * permit type or project type that Houston already defines: it links to them. That
 * is what keeps "the building permit" one concept across two cities, and it is why
 * `permitTypes` below is empty.
 */

/** The date the City of Dallas's permit fee schedule took effect (Ordinance 32676). */
export const DALLAS_FEE_EFFECTIVE_FROM = "2024-05-01";

/** The date a human last read the City's published documents. */
export const DALLAS_LAST_VERIFIED = "2026-09-24";

export const DALLAS_KEYS = {
  state: "tx",
  county: "dallas-county",
  jurisdiction: "dallas",
  feeSchedule: DALLAS_FEE_SCHEDULE_SOURCE_KEY,
} as const;

/* -------------------------------------------------------------------------- */
/* Geography                                                                  */
/* -------------------------------------------------------------------------- */

const state = {
  code: "TX",
  slug: "texas",
  name: "Texas",
  fipsCode: "48",
};

const county = {
  key: DALLAS_KEYS.county,
  slug: "dallas-county",
  name: "Dallas County",
  // Dallas County, Texas. Recorded so a later city inside the county (Irving,
  // Garland, Mesquite) links to this row rather than creating a second one.
  fipsCode: "48113",
};

const jurisdiction = {
  key: DALLAS_KEYS.jurisdiction,
  stateKey: DALLAS_KEYS.state,
  countyKey: DALLAS_KEYS.county,
  type: "city" as const,
  slug: "dallas",
  name: "Dallas",
  officialName: "City of Dallas",
  websiteUrl: "https://dallascityhall.com/",
  /**
   * The department's own permitting and inspections page. It is the URL the fee
   * schedule is published from, so it is a real, citable page — but it is NOT a
   * verified permit portal, and no separate portal URL is recorded because the
   * City's site could not be reached from this environment to confirm one. See
   * research/texas/dallas.md section 7.6.
   */
  permitPortalUrl:
    "https://dallascityhall.com/departments/sustainabledevelopment/buildinginspection/pages/fees.aspx",
  timezone: "America/Chicago",
  isActive: true,
};

/* -------------------------------------------------------------------------- */
/* Department                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Deliberately carries no phone number, email address or street address.
 *
 * An earlier research pass recorded a phone and an address from a search result,
 * not from the department's own page, and the department has been renamed at least
 * once since (older material says "Development Services"). A page that tells a
 * reader who to call has to be right about it, so the contact fields stay empty
 * until they can be read from the City's own site.
 */
const departments: SeedDepartment[] = [
  {
    key: "dallas-building-inspection",
    jurisdictionKey: DALLAS_KEYS.jurisdiction,
    kind: "building",
    name: "Building Inspection, Department of Sustainable Development",
    phone: null,
    email: null,
    url: "https://dallascityhall.com/departments/sustainabledevelopment/buildinginspection/pages/fees.aspx",
    addressLine: null,
    hours: null,
    notes:
      "Name taken from the City's own URL path for the permitting and inspections pages (/departments/sustainabledevelopment/buildinginspection). Contact details are deliberately not recorded: the department's page did not load from this environment, and a wrong phone number on a page that tells someone who to call is a real error. See research/texas/dallas.md section 7.6.",
  },
];

/* -------------------------------------------------------------------------- */
/* Sources                                                                    */
/* -------------------------------------------------------------------------- */

const sources: SeedSource[] = [
  {
    key: DALLAS_FEE_SCHEDULE_SOURCE_KEY,
    jurisdictionKey: DALLAS_KEYS.jurisdiction,
    title: "Permit Fee Schedule",
    url: "https://dallascityhall.com/departments/sustainabledevelopment/DCH%20documents/DSD%20Fees.pdf",
    sourceType: "fee_schedule_pdf",
    issuingAuthority: "City of Dallas",
    authorityKind: "city",
    isPrimary: true,
    documentDate: DALLAS_FEE_EFFECTIVE_FROM,
    effectiveFrom: DALLAS_FEE_EFFECTIVE_FROM,
    retrievedAt: DALLAS_LAST_VERIFIED,
    lastVerifiedAt: DALLAS_LAST_VERIFIED,
    notes:
      'Ten pages, effective 1 May 2024, adopted by Ordinance 32676. Carries the City\'s own disclaimer: "the fees listed in this schedule are for informational purposes only and are subject to change. Final permit fees will be calculated at the time of submittal". Retrieved from the Internet Archive raw snapshot of 2025-11-29 (sha256 90cb9d4a7087803fd5034146611a968caa28dd8ce71d9e4fa7bcda99a492b117) because dallascityhall.com did not respond from this environment; text extracted with pdftotext -layout and -raw. A later capture can be compared against that hash.',
  },
  {
    key: DALLAS_WORKSHEET_SOURCE_KEY,
    jurisdictionKey: DALLAS_KEYS.jurisdiction,
    title: "PDV Fee Estimate Worksheet Examples",
    url: "https://dallascityhall.com/departments/sustainabledevelopment/buildinginspection/DCH%20documents/pdf/PDV_Fee%20Estimate%20Worksheet%20Examples.pdf",
    sourceType: "official_calculator",
    issuingAuthority: "City of Dallas, Building Inspection",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: DALLAS_LAST_VERIFIED,
    lastVerifiedAt: DALLAS_LAST_VERIFIED,
    notes:
      "The department's own estimator, with five worked examples (new single-family dwelling, residential remodel, new commercial office building, commercial tenant finish-out, multi-family complex). Its arithmetic is what resolves the commercial table's upper brackets, which the printed schedule omits, and it is the source of the plan-review discrepancy: it computes $0.046 per sq ft where the schedule prints $0.46. Earliest capture 2025-10-16. Used arithmetically, never copied: the estimate on every page is computed by this site's engine from the published rates.",
  },
  {
    key: DALLAS_ORDINANCE_SOURCE_KEY,
    jurisdictionKey: DALLAS_KEYS.jurisdiction,
    title: "Ordinance 25-0638, amending Chapter 52 Section 303",
    url: "https://dallascityhall.com/departments/sustainabledevelopment/buildinginspection/DCH%20documents/25-0638.pdf",
    sourceType: "ordinance",
    issuingAuthority: "City of Dallas City Council",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2025-04-15",
    effectiveFrom: "2025-04-15",
    retrievedAt: DALLAS_LAST_VERIFIED,
    lastVerifiedAt: DALLAS_LAST_VERIFIED,
    notes:
      "Effective 15 April 2025. Amends Table B-I (alterations or repairs), the technology permit fee (restated unchanged at $15), the Q-Team review caps, the mover's licence and non-premise sign fees, and REMOVES the postage and handling fee and the inspection scheduling fee that the May 2024 schedule still prints. Read from the scanned document's text layer; the table itself is legible enough to confirm that the row the schedule misprints as \"$500,000,001 - 10,000,000\" is \"$5,000,001 - 10,000,000\".",
  },
];

/* -------------------------------------------------------------------------- */
/* Which permits Dallas issues                                                */
/* -------------------------------------------------------------------------- */

/**
 * Dallas issues all three permits. Two of them, however, are not *priced* by the
 * schedule: it prints no electrical, plumbing or mechanical fee anywhere (zero
 * matches across all ten pages). What the trade pages can honestly publish is the
 * mechanism — the Minimum Inspection Fee Schedule, which prices trade inspections
 * by how many trades a job involves — and they say so.
 */
const jurisdictionPermitTypes: SeedJurisdictionPermitType[] = [
  {
    jurisdictionKey: DALLAS_KEYS.jurisdiction,
    permitTypeKey: "building",
    isAvailable: true,
    localName: "Building Permit",
    officialUrl:
      "https://dallascityhall.com/departments/sustainabledevelopment/buildinginspection/pages/fees.aspx",
    notes:
      "Required for construction, additions and alterations. Priced from Table A-I (new single-family and duplex, per square foot), Table A-II (new multi-family, per dwelling unit) or Table A-III (commercial and accessory structures, from the value of the proposed work).",
  },
  {
    jurisdictionKey: DALLAS_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    isAvailable: true,
    localName: "Electrical Permit",
    officialUrl:
      "https://dallascityhall.com/departments/sustainabledevelopment/buildinginspection/pages/fees.aspx",
    notes:
      "Issued, but not priced as its own line item: the published fee schedule contains no electrical permit fee. Trade inspections are priced by the Minimum Inspection Fee Schedule according to the number of trades on the permit.",
  },
  {
    jurisdictionKey: DALLAS_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    isAvailable: true,
    localName: "Plumbing Permit",
    officialUrl:
      "https://dallascityhall.com/departments/sustainabledevelopment/buildinginspection/pages/fees.aspx",
    notes:
      "Issued, and handled as its own document — the schedule charges a $25 document handling fee for a stand-alone trade review — but the schedule publishes no plumbing permit fee. Priced through the Minimum Inspection Fee Schedule by trade count, like every other trade.",
  },
];

/* -------------------------------------------------------------------------- */
/* Fee schedule                                                               */
/* -------------------------------------------------------------------------- */

const feeSchedules: JurisdictionSeed["feeSchedules"] = [
  {
    key: DALLAS_KEYS.feeSchedule,
    jurisdictionKey: DALLAS_KEYS.jurisdiction,
    sourceKey: DALLAS_KEYS.feeSchedule,
    title: "City of Dallas Permit Fee Schedule",
    officialUrl:
      "https://dallascityhall.com/departments/sustainabledevelopment/DCH%20documents/DSD%20Fees.pdf",
    effectiveFrom: DALLAS_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: DALLAS_LAST_VERIFIED,
    notes:
      "Effective 1 May 2024 under Ordinance 32676. Not wholly current: Ordinance 25-0638 amended Table B-I and the technology, Q-Team, mover's licence and sign fees on 15 April 2025, and removed two other fees. Rows affected by the amendment are dated individually on the rules.",
  },
];

/* -------------------------------------------------------------------------- */
/* Fee rules, grouped by permit                                               */
/* -------------------------------------------------------------------------- */

/**
 * The plan review rule ships as `draft`, so it never enters a total, and it is
 * listed on the page with the reason. Same treatment Houston gives its disputed
 * minimum fee: publishing the contradiction is the point, hiding it is the failure.
 */
const disputedPlanReview: FeeRuleRecord = DALLAS_PLAN_REVIEW_DISPUTED;

function rulesFor(permitTypeKey: string, rules: FeeRuleRecord[]): SeedFeeRule[] {
  return rules.map((rule) => ({
    jurisdictionKey: DALLAS_KEYS.jurisdiction,
    permitTypeKey,
    scheduleKey: DALLAS_KEYS.feeSchedule,
    rule,
  }));
}

const feeRules: SeedFeeRule[] = [
  ...rulesFor("building", [
    ...DALLAS_A1_BRACKETS,
    ...DALLAS_A2_RULES,
    ...DALLAS_A3_BRACKETS,
    DALLAS_INSPECTION_TRADES,
    DALLAS_TECHNOLOGY_FEE,
    disputedPlanReview,
  ]),

  ...rulesFor("electrical", [
    DALLAS_INSPECTION_TRADES,
    DALLAS_TECHNOLOGY_FEE,
    disputedPlanReview,
  ]),

  ...rulesFor("plumbing", [
    DALLAS_INSPECTION_TRADES,
    DALLAS_TECHNOLOGY_FEE,
    disputedPlanReview,
  ]),
];

/* -------------------------------------------------------------------------- */
/* Requirements                                                               */
/* -------------------------------------------------------------------------- */

const requirements: SeedRequirement[] = [
  {
    jurisdictionKey: DALLAS_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "What is being built",
    description:
      "Dallas has three construction tables and picks between them by building type, not by cost: Table A-I for a new single-family house or duplex, Table A-II for a new multi-family building, Table A-III for commercial work and for accessory structures such as a parking garage, gym or leasing office. Two projects of the same value can pay very different fees.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: DALLAS_FEE_SCHEDULE_SOURCE_KEY,
    lastVerifiedAt: DALLAS_LAST_VERIFIED,
  },
  {
    jurisdictionKey: DALLAS_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "document",
    title: "Project area, or valuation, depending on the table",
    description:
      "Table A-I is applied to building area in square feet, and its rate is charged on the whole area rather than on the part above a bracket floor. Table A-III is applied to the value of the proposed work. The schedule does not itself define 'value of proposed work' in the pages read here, and the City's estimate worksheet simply says 'Enter Valuation', so the figure is the applicant's declared value of the work.",
    isMandatory: true,
    sortOrder: 20,
    sourceKey: DALLAS_WORKSHEET_SOURCE_KEY,
    lastVerifiedAt: DALLAS_LAST_VERIFIED,
  },
  {
    jurisdictionKey: DALLAS_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "inspection",
    title: "Number of trades",
    description:
      "Every construction permit carries an inspection fee that is a function of how many trades the job involves — $125 for one, up to $1,125 at nine or more — added to the table fee. The schedule states the fee per trade count; it does not list which work counts as a trade.",
    isMandatory: true,
    sortOrder: 30,
    sourceKey: DALLAS_FEE_SCHEDULE_SOURCE_KEY,
    lastVerifiedAt: DALLAS_LAST_VERIFIED,
  },
  {
    jurisdictionKey: DALLAS_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "inspection",
    title: "Number of trades on the job",
    description:
      "The electrical work is what a Dallas permit describes; the number that sets the inspection fee is how many trades are inspected on the job. Adding plumbing or mechanical work to the same job changes the inspection fee; adding outlets or circuits to the electrical work does not, because the schedule publishes no per-outlet or per-circuit rate for Dallas.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: DALLAS_FEE_SCHEDULE_SOURCE_KEY,
    lastVerifiedAt: DALLAS_LAST_VERIFIED,
  },
  {
    jurisdictionKey: DALLAS_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    requirementType: "document",
    title: "Stand-alone trade review",
    description:
      "The schedule prices a $25 document handling fee for a stand-alone trade review, which is how a trade permit filed on its own is handled. It is the closest thing the schedule has to a line item for a trade permit, and it is a document fee rather than a permit fee.",
    isMandatory: false,
    sortOrder: 10,
    sourceKey: DALLAS_FEE_SCHEDULE_SOURCE_KEY,
    lastVerifiedAt: DALLAS_LAST_VERIFIED,
  },
];

/* -------------------------------------------------------------------------- */
/* Jurisdiction profile                                                       */
/* -------------------------------------------------------------------------- */

const profile: SeedProfile = {
  jurisdictionKey: DALLAS_KEYS.jurisdiction,
  headline: "What construction permits cost in Dallas",
  summary:
    "Dallas prices construction permits from three tables in one schedule, and the table that applies is chosen by what you are building rather than by what it costs: new single-family and duplex work is charged per square foot, new multi-family work per dwelling unit, and commercial work from the value of the proposed work. Every permit also carries an inspection fee set by the number of trades on the job, and a $15 technology fee. Dallas publishes no electrical, plumbing or mechanical permit fee at all — trade work is priced through that trade-count inspection fee instead.",
  localContext:
    "Three things are worth knowing before you read any number here.\n\nThe first is that the residential table is charged on the whole building area, not on the part above a bracket floor. That produces a step at 700 square feet where the fee falls by $206.67 as the building gets one square foot larger — 700 sq ft pays $749.00 and 701 sq ft pays $542.33. It is a real property of the published schedule, not a transcription error, and the City's own worked example computes the same way. We reproduce it rather than smoothing it.\n\nThe second is that Dallas's three construction paths are not interchangeable. A $400,000 house and a $400,000 tenant finish-out are priced by different tables, in different units, and neither figure can be derived from the other.\n\nThe third is that two of the City's own documents contradict each other. The permit fee schedule prints a plan review fee of \"$0.46 per sq. ft. or $577 (whichever is greater)\"; the department's permit fee estimate worksheet computes $0.046 a square foot in all five of its worked examples, whose totals balance to the cent at that rate. We do not charge either figure. Plan review is stated on each page, held out of every total, and marked as disputed until one of the two documents is corrected.",
  valuationBasis:
    "For a new single-family house or duplex, Dallas charges per square foot of building area — not from cost. Table A-I's rates apply to the whole area.\n\nFor new multi-family construction, the fee is $652 per dwelling unit, and the schedule states that it does not apply to accessory structures such as parking garages, gyms or leasing offices; those are priced from the commercial table instead.\n\nFor commercial work, the fee is a rate applied to \"the value of the proposed work\", plus the table's own add factor. The pages of the schedule read for this work do not define that phrase, and the City's estimate worksheet asks only for \"Enter Valuation\", so the figure is the applicant's declared value of the work rather than a value the City computes.",
  notIncluded:
    "These figures are the fees published in the City of Dallas Permit Fee Schedule (effective 1 May 2024, Ordinance 32676) and Ordinance 25-0638, computed by this site's engine. They are not a total project cost. In particular they exclude:\n\n- **Plan review.** The schedule and the City's own worksheet disagree about the rate by a factor of ten, so no plan review figure is charged. See the note on each page.\n- **The zoning surcharge.** The schedule charges an extra 10% of the permit fee for planned development, specific-use permit and deed-restricted areas. The City's worksheets show it applied to the base permit fee, not to the whole invoice.\n- **Alterations and repairs.** Those are priced from Table B-I, which Ordinance 25-0638 replaced on 15 April 2025, and from Table B-II for single-family and duplex structures. Neither table is estimated here.\n- **Fees that attach to events rather than to permits:** permit extension $200, reinspection $75, additional inspection service $125 per trade inspection, after-hours inspection $125 an hour with a $300 minimum, same-day inspection $250, unauthorized concealment $200 per trade, and work without a permit investigation $100 an hour per trade. Certificate of occupancy is $375 general, $104 partial and $250 for a residential temporary certificate.\n- **The technology fee is per document submitted.** One is charged in these estimates.\n- **Postage and handling, and the inspection scheduling fee, no longer exist.** The 2024 schedule still prints them; Ordinance 25-0638 removed them on 15 April 2025.\n- Demolition, fire, health and utility fees, and any fee charged by a department other than the one that issues the permit.\n- Anything for property outside the Dallas city limits. Whether Dallas County issues construction permits for unincorporated areas, and for which functions, has not been verified against the county's own site, so it is not described here.",
  seoTitle: "Dallas, Texas construction permit fees",
  seoDescription:
    "How Dallas prices building permits — per square foot for houses, per dwelling unit for multi-family, from value for commercial work — plus the trade-count inspection fee, from the City's own fee schedule.",
  publishStatus: "published",
  noindex: false,
  lastReviewedAt: DALLAS_LAST_VERIFIED,
};

/* -------------------------------------------------------------------------- */
/* Permit pages                                                               */
/* -------------------------------------------------------------------------- */

const permitPages: SeedPermitPage[] = [
  {
    jurisdictionKey: DALLAS_KEYS.jurisdiction,
    permitTypeKey: "building",
    slug: "building-permit-cost",
    title: "Dallas building permit cost",
    intro:
      "Dallas prices construction permits three ways, and what you are building decides which one applies. A new single-family house or duplex is charged per square foot from Table A-I. A new multi-family building is charged per dwelling unit from Table A-II, at $652 each. New commercial work — and accessory structures such as a parking garage or leasing office — is charged from the value of the proposed work from Table A-III, which runs to ten brackets. On every one of those paths the permit also carries an inspection fee set by the number of trades on the job, and a $15 technology fee.",
    localSummary:
      "The residential table is written in whole square feet, and its rate is charged on the whole area rather than on the part above a bracket floor. That produces a step at 700 sq ft that surprises people: 700 sq ft pays $749.00, while 701 sq ft pays $542.33 — the fee falls by $206.67 because the building got one square foot bigger. It is in the published schedule and the City's own worked example computes it the same way, so it is reproduced here rather than smoothed over.\n\nAbove 700 sq ft the arithmetic is a rate plus the bracket's own add factor: $0.34569 per sq ft plus $300 up to 2,350 sq ft, $0.077 plus $800 up to 10,500, and $0.0272 plus $1,000 beyond that.\n\nThe inspection fee is the part most estimates miss. It is charged from the number of trades on the permit — $125 for one, $250 for two, and so on to $1,125 at nine or more — and it is added to the table fee. A small commercial finish-out with five trades carries $625 of inspection fee before any valuation-based fee at all.",
    notIncluded:
      "This estimate covers the construction tables plus the trade-count inspection fee and one $15 technology fee. It excludes:\n\n- **Plan review**, which is disputed and therefore not charged. See the note on the result.\n- **The 10% zoning surcharge** for planned development, specific-use permit and deed-restricted areas.\n- **Alterations, repairs and remodels**, which Dallas prices from Table B-I (replaced by Ordinance 25-0638 on 15 April 2025) and Table B-II, not from the tables used here.\n- **Permit extension** ($200), **reinspection** ($75), **additional inspection service** ($125 per trade inspection), **after-hours inspection** ($125 an hour, $300 minimum), **same-day inspection** ($250) and **unauthorized concealment** ($200 per trade).\n- **Certificate of occupancy**: $375 general, $104 partial, $250 for a residential temporary certificate.\n- Fees charged by any department other than the one issuing the permit, and anything for property outside the Dallas city limits.",
    workedExample: {
      scenario:
        "A new single-family house of 2,500 sq ft with four trades on the permit. This is the City's own worked example, taken from its permit fee estimate worksheet, with the plan review line held back.",
      inputs: {
        squareFootage: 2_500,
        occupancy: "residential",
        workType: "new_construction",
        custom: { project_class: "one_and_two_family", trades: 4 },
      },
      notes:
        "The City's worksheet for this same house totals $2,084.50, because it includes a $577 plan review fee. That line is not in this total: the published schedule and the worksheet disagree about the plan review rate by a factor of ten, so neither figure is charged, and the difference between this total and the City's own is exactly that $577. Everything else here is the City's arithmetic — 2,500 sq ft at $0.077 plus $800 gives the $992.50 table fee, and four trades give the $500 inspection fee.",
    },
    faqs: [
      {
        question: "Does the permit fee really go down when a house gets bigger?",
        answer:
          "At 700 square feet, yes. Table A-I charges $1.07 per sq ft for buildings up to 700 sq ft, which is $749.00 at the top of that bracket, and then $0.34569 per sq ft plus $300 from 701 sq ft — $542.33 at 701. The step is in the City's published schedule, and the City's own worksheet reproduces it, so it is what a permit issued at that size would cost.",
      },
      {
        question: "Is the Dallas building permit fee a percentage of construction cost?",
        answer:
          "Only for commercial work. A house or duplex is charged per square foot of area, and a multi-family building per dwelling unit. Commercial work, and accessory structures, are charged as a rate applied to the value of the proposed work plus the table's add factor. Residential cost does not enter the calculation at all.",
      },
      {
        question: "What counts as a trade for the inspection fee?",
        answer:
          "The schedule charges $125 per trade up to eight trades, and $1,125 for nine or more, but it does not list which work counts as a trade — so the count is the number of trades inspected on the job. What is published is the price of each count, and that is what this page charges.",
      },
      {
        question: "Why is plan review missing from the total?",
        answer:
          "Because the City's two documents disagree about it. The schedule prints \"$0.46 per sq. ft. or $577 (whichever is greater)\". The department's permit fee estimate worksheet computes $0.046 per sq ft, and all five of its worked examples balance to the cent at that rate — including one that would differ by $74,520 from the printed figure. Rather than pick one, the plan review line is stated with both readings and left out of the estimate.",
      },
    ],
    seoTitle: "Dallas building permit cost: how the fee is calculated",
    seoDescription:
      "Dallas building permit fees: per square foot for a new house or duplex, $652 per dwelling unit for multi-family, and a rate on value for commercial work, plus the trade-count inspection fee. With the City's own source.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: DALLAS_LAST_VERIFIED,
  },
  {
    jurisdictionKey: DALLAS_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    slug: "electrical-permit-cost",
    title: "Dallas electrical permit cost",
    intro:
      "Dallas publishes no electrical permit fee. Not a rate per outlet, not a rate per circuit, not a percentage of the job: across all ten pages of the City's permit fee schedule, the word \"electrical\" does not appear. What Dallas prices instead is the inspection of a trade, through the Minimum Inspection Fee Schedule, and its amount is a function of how many trades the job involves — $125 for one trade, $250 for two, rising to $1,125 at nine or more. That trade-count fee is the number an electrical permit actually moves.",
    localSummary:
      "The practical consequence is that there is no figure to quote for \"a Dallas electrical permit\", and any site quoting one is quoting something the City does not publish. What changes the fee is the number of trades on the job: a service change on an existing house is one trade; so is a service change with a panel swap and new circuits in the same permit, because the count is of trades rather than of items. Adding plumbing, mechanical or fire sprinkler work to the same job is what moves the number, because it adds a trade.\n\nTwo line items in the schedule attach directly to trade inspections. The additional inspection service fee is $125 per trade inspection, charged when an inspection beyond those included is needed. The after-hours inspection fee is $125 an hour with a $300 minimum. A failed inspection that has to be repeated is $75.",
    notIncluded:
      "There is no electrical permit fee to include, because Dallas does not publish one. What is calculated here is the inspection fee the schedule attaches to a permit's number of trades, plus the technology fee, which the City charges per document submitted.\n\nNot included, and not estimable from the documents read:\n\n- Whether a permit filed for electrical work alone carries the trade-count minimum, or whether that minimum is charged once on the construction permit covering the job. Neither the fee schedule nor the City's estimate worksheet states it, so it is recorded as an open question and this page is marked for review.\n- Per-item charges of any kind. Dallas publishes no outlet, circuit, panel, fixture or appliance rate, unlike cities that price electrical permits per item.\n- Reinspection ($75), additional inspection service ($125 per trade inspection), after-hours inspection ($125 an hour, $300 minimum) and same-day inspection ($250), which attach to events rather than to permits.\n- Work without a permit investigation ($100 an hour per trade) and unauthorized concealment ($200 per trade).\n- Fire alarm, fire sprinkler and fire protection review fees, which are separate line items in the schedule and, unlike the building trades, are priced.",
    workedExample: {
      scenario:
        "The smallest case the schedule prices: a permit covering a single trade. The amount is the minimum inspection fee for one trade plus the technology fee the City charges for the document submitted.",
      inputs: {
        occupancy: "residential",
        workType: "new_construction",
        custom: { trades: 1 },
      },
      notes:
        "The $125 is the City's Minimum Inspection Fee Schedule for a one-trade permit — it is not a separately published electrical permit fee, because Dallas publishes none. Whether a permit filed for electrical work alone attracts this minimum, rather than the job's construction permit carrying it once, is not stated in either official document; this page is marked for review until that is confirmed.",
    },
    faqs: [
      {
        question: "Does Dallas charge a separate fee for an electrical permit?",
        answer:
          "The City's published permit fee schedule contains no electrical permit fee, and the words electrical, plumbing and mechanical do not appear anywhere in its ten pages. Trade work is priced through the Minimum Inspection Fee Schedule instead. If a contractor quotes you a Dallas electrical permit fee, the number is coming from somewhere other than the City's published schedule.",
      },
      {
        question: "How many trades will my job have?",
        answer:
          "The schedule prices a count of trades but does not list which work counts as one, so the answer comes from the scope of the job and, in practice, from the permit office. What is published — and what is calculated here — is that one trade is $125, two are $250, and nine or more is $1,125.",
      },
      {
        question: "Is there any per-outlet or per-circuit price in Dallas?",
        answer:
          "No. A search of all ten pages of the schedule returns zero matches for electrical, and there are no outlet, circuit, panel or fixture rows. That is a real difference from Houston, where the same work is priced per item — and the reason a Dallas electrical question has to be answered with a mechanism rather than a rate.",
      },
      {
        question: "What do I pay if the inspector has to come back?",
        answer:
          "A reinspection is $75. If an inspection is needed outside the included service, the additional inspection service fee is $125 per trade inspection, and after-hours inspections are $125 an hour with a $300 minimum.",
      },
    ],
    seoTitle: "Dallas electrical permit cost: what the City actually charges",
    seoDescription:
      "Dallas publishes no electrical permit fee. Trade inspections are priced through the Minimum Inspection Fee Schedule by number of trades — $125 for one, $1,125 at nine or more — from the City's own fee schedule.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: DALLAS_LAST_VERIFIED,
  },
  {
    jurisdictionKey: DALLAS_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    slug: "plumbing-permit-cost",
    title: "Dallas plumbing permit cost",
    intro:
      "Like the other trades, plumbing in Dallas has no permit fee in the City's published schedule: no fixture rate, no water heater rate, no per-connection rate, and no occurrence of the word \"plumbing\" in its ten pages. What the schedule does contain is a $25 document handling fee for a stand-alone trade review — which tells us a plumbing permit is handled as its own document — and the Minimum Inspection Fee Schedule that prices a trade inspection from the number of trades on the job. A plumbing permit's costs are those, not a fixture count.",
    localSummary:
      "The mechanism is the same one that applies to every trade in Dallas, and the reason it matters for plumbing is that a plumbing job is usually where trades accumulate. A bathroom remodel is plumbing plus electrical, which is two trades: $250. Add mechanical work and it is three: $375. The fee tracks how many trades the job is inspected for, not how many fixtures, water heaters or gas connections are installed — the schedule publishes no rate for any of those.\n\nThe two figures that do attach to the work are document and event fees: $25 for handling a stand-alone trade review, and $75 for a reinspection if the work fails and has to be inspected again. Altering or concealing work without a permit is $200 per trade.",
    notIncluded:
      "There is no plumbing permit fee to include, because Dallas does not publish one. What is calculated here is the inspection fee the schedule attaches to a permit's number of trades, plus the technology fee, which the City charges per document submitted.\n\nNot included, and not estimable from the documents read:\n\n- Whether a permit filed for plumbing alone carries the trade-count minimum, or whether the minimum is charged once on the construction permit covering the job. Neither the fee schedule nor the City's estimate worksheet states it, so it is recorded as an open question and this page is marked for review.\n- Per-item charges of any kind. There are no fixture, water heater, gas connection, sewer or grease interceptor rates in the schedule.\n- Document handling fees other than the $25 stand-alone trade review, including $25 for a minor commercial plan review and $100 per trade added or substituted.\n- The $75 reinspection, the $125 per trade additional inspection service, $125 an hour with a $300 minimum after hours, and the $250 same-day inspection.\n- Work without a permit investigation ($100 an hour per trade) and unauthorized concealment ($200 per trade).\n- Backflow prevention tester registration, fire protection, health department and utility fees, which are separate line items in the same schedule.",
    workedExample: {
      scenario:
        "A bathroom remodel that is inspected as two trades — plumbing and electrical — which is the case the trade-count schedule is written for.",
      inputs: {
        occupancy: "residential",
        workType: "remodel",
        custom: { trades: 2 },
      },
      notes:
        "Two trades are $250 in the City's Minimum Inspection Fee Schedule. The fixture count is deliberately absent: Dallas publishes no per-fixture rate, so entering one would produce a figure the schedule does not support. Whether a plumbing permit filed on its own attracts this minimum, rather than the job's permit carrying it once, is not stated in either official document; this page is marked for review until that is confirmed.",
    },
    faqs: [
      {
        question: "How much is a Dallas plumbing permit?",
        answer:
          "The City's published fee schedule does not give plumbing a permit fee, so there is no published figure for one. What it does publish is a $25 document handling fee for a stand-alone trade review and a minimum inspection fee that is charged by the number of trades on the job: $125 for one trade, $250 for two, up to $1,125 at nine or more.",
      },
      {
        question: "Are plumbing fixtures charged individually?",
        answer:
          "Not in Dallas. The schedule has no fixture, water heater, gas or sewer rate — searching its ten pages for plumbing, sewer and water heater returns nothing. Cities that publish per-fixture plumbing schedules, such as Houston, work the opposite way, which is why the two cannot be compared line by line.",
      },
      {
        question: "Does a bathroom remodel cost more than a plumbing-only job?",
        answer:
          "If the remodel is inspected as plumbing plus electrical, it is more: the inspection fee is charged by trade count, so two trades are $250 against $125 for one. The schedule prices the number of trades, not the amount of pipe or the number of fixtures.",
      },
      {
        question: "Does a plumbing permit need to be filed separately?",
        answer:
          "The schedule prices a $25 document handling fee for a stand-alone trade review, so a trade permit filed on its own is handled as its own document. Whether filing it that way changes the inspection fee is exactly the question the City's documents do not answer, and this page does not guess at it.",
      },
    ],
    seoTitle: "Dallas plumbing permit cost: the trade-count mechanism",
    seoDescription:
      "Dallas publishes no plumbing permit fee or per-fixture rate. Plumbing work is priced through the Minimum Inspection Fee Schedule by number of trades, plus a $25 stand-alone trade review document fee.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: DALLAS_LAST_VERIFIED,
  },
];

/* -------------------------------------------------------------------------- */
/* Verification ledger                                                        */
/* -------------------------------------------------------------------------- */

const verifications: SeedVerification[] = [
  {
    entityType: "source",
    entityKey: DALLAS_FEE_SCHEDULE_SOURCE_KEY,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: DALLAS_LAST_VERIFIED,
    verifiedBy: "Permit Fee Intelligence research pass 2",
    sourceKey: DALLAS_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "All ten pages read from a raw archived copy of the City's own PDF, extracted twice (pdftotext -layout for table shape, -raw to resolve interleaved columns) and transcribed into research/texas/dallas.md. Hash of the file read: 90cb9d4a7087803fd5034146611a968caa28dd8ce71d9e4fa7bcda99a492b117. The live URL did not respond from this environment; the retrieval path and snapshot date are recorded on the source row so the copy can be re-taken and compared.",
  },
  {
    entityType: "source",
    entityKey: DALLAS_WORKSHEET_SOURCE_KEY,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: DALLAS_LAST_VERIFIED,
    verifiedBy: "Permit Fee Intelligence research pass 2",
    sourceKey: DALLAS_WORKSHEET_SOURCE_KEY,
    notes:
      "Five worked examples read and checked arithmetically. Each of their totals was reproduced to the cent from the tables they use, which is what makes this document decisive for the commercial brackets above $1,500,000 (missing from the printed schedule) and for the plan review discrepancy.",
  },
  {
    entityType: "source",
    entityKey: DALLAS_ORDINANCE_SOURCE_KEY,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: DALLAS_LAST_VERIFIED,
    verifiedBy: "Permit Fee Intelligence research pass 2",
    sourceKey: DALLAS_ORDINANCE_SOURCE_KEY,
    notes:
      "Read for four facts: the amendment to Table B-I, the technology permit fee, the removal of the postage and handling and inspection scheduling fees, and the corrected lower bound of the Table B-I row that the 2024 schedule misprints as $500,000,001. Its text layer is a poor scan, so only passages legible in more than one place were relied on.",
  },
  {
    entityType: "fee_schedule",
    entityKey: DALLAS_KEYS.feeSchedule,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: DALLAS_LAST_VERIFIED,
    verifiedBy: "Permit Fee Intelligence research pass 2",
    sourceKey: DALLAS_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "Effective 1 May 2024 under Ordinance 32676, and partially superseded on 15 April 2025 by Ordinance 25-0638. Rows affected by the amendment carry their own effective dates.",
  },
  {
    entityType: "fee_rule",
    entityKey: "PLAN-REVIEW-303",
    permitTypeKey: "building",
    status: "disputed",
    method: "manual_review",
    verifiedAt: DALLAS_LAST_VERIFIED,
    verifiedBy: "Permit Fee Intelligence research pass 2",
    sourceKey: DALLAS_WORKSHEET_SOURCE_KEY,
    notes:
      "DISPUTED BY TWO OFFICIAL DOCUMENTS. The permit fee schedule prints \"$0.46 per sq. ft. or $577 (whichever is greater)\" for residential, commercial and multi-family plan review. The department's permit fee estimate worksheet computes $0.046 per sq ft: 25,000 sq ft -> $1,150, 180,000 -> $8,280, 100,000 -> $4,600, 11,500 -> the $577 minimum, 2,500 -> the $577 minimum. All five of the worksheet's example totals balance to the cent at 0.046 and none balances at 0.46. Both readings are internally consistent, neither document is a misreading, and no third source resolves it. The rule is modelled at the worksheet's rate with the published minimum and ships as draft, so it is never added to a total. Needs confirmation from the City. See research/texas/dallas.md section 4.5.",
  },
  {
    entityType: "fee_rule",
    entityKey: "INSP-TRADES",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: DALLAS_LAST_VERIFIED,
    verifiedBy: "Permit Fee Intelligence research pass 2",
    sourceKey: DALLAS_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "The Minimum Inspection Fee Schedule's nine rows were transcribed, and the worksheet confirms how it combines with the table fee: its examples list Base Fee, then Inspection Fee by number of trades, then the technology fee, and add them (4 trades -> $500 on the residential example, 8 -> $1,000 on the commercial one, 6 -> $750 on multi-family, 10 -> $1,125 on the finish-out). Modelled as $125 per trade with a $1,125 ceiling, which reproduces all nine published rows.",
  },
  {
    entityType: "fee_rule",
    entityKey: "INSP-TRADES",
    permitTypeKey: "electrical",
    status: "needs_review",
    method: "manual_review",
    verifiedAt: DALLAS_LAST_VERIFIED,
    verifiedBy: "Permit Fee Intelligence research pass 2",
    sourceKey: DALLAS_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "The trade-count table is in the schedule and unambiguous; what is unverified is its application to a permit filed for one trade. The worksheet shows the inspection fee charged once per permit application, scaled by the job's trade count, and the schedule prices a $25 document handling fee for a stand-alone trade review — which is evidence that trade permits exist as documents, not that they carry this minimum. Recorded as an open question (research/texas/dallas.md section 7.2) and stated as such on the page.",
  },
  {
    entityType: "fee_rule",
    entityKey: "INSP-TRADES",
    permitTypeKey: "plumbing",
    status: "needs_review",
    method: "manual_review",
    verifiedAt: DALLAS_LAST_VERIFIED,
    verifiedBy: "Permit Fee Intelligence research pass 2",
    sourceKey: DALLAS_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "Same open question as the electrical page: the table is verified, its application to a stand-alone plumbing permit is not. The $25 stand-alone trade review document fee is the only line item the schedule has for a trade permit filed on its own, and it is a document fee.",
  },
  {
    entityType: "fee_rule",
    entityKey: "A-III-5000001-10000000",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: DALLAS_LAST_VERIFIED,
    verifiedBy: "Permit Fee Intelligence research pass 2",
    sourceKey: DALLAS_WORKSHEET_SOURCE_KEY,
    notes:
      "One of the four commercial brackets above $1,500,000 that the printed schedule does not contain. Independently checked against the worksheet's own example: a $6,000,500 valuation -> 0.5095% + $1,100 = $31,672.5475, which rounds to the $31,672.55 the worksheet shows, and the example's $33,837.55 total then follows exactly with plan review, the eight-trade inspection fee and the technology fee. The other three upper brackets are transcribed from the same table but not exercised by an example; they carry the worksheet's effective date rather than the schedule's.",
  },
  {
    entityType: "permit_page",
    entityKey: "building-permit-cost",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: DALLAS_LAST_VERIFIED,
    verifiedBy: "Permit Fee Intelligence research pass 2",
    sourceKey: DALLAS_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "Three construction tables, the trade-count inspection fee and the technology fee transcribed, and the worked example reproduces the worksheet's own residential scenario to the cent apart from the disputed plan review line it deliberately omits.",
  },
  {
    entityType: "permit_page",
    entityKey: "electrical-permit-cost",
    permitTypeKey: "electrical",
    status: "needs_review",
    method: "manual_review",
    verifiedAt: DALLAS_LAST_VERIFIED,
    verifiedBy: "Permit Fee Intelligence research pass 2",
    sourceKey: DALLAS_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "The absence of an electrical permit fee is a fact about the schedule that was verified directly (zero matches for 'electrical' across all ten pages, and none for any per-item electrical rate). The page is marked for review because the schedule's silence does not prove that no other mechanism prices an electrical-only permit; the page states that limit rather than smoothing it.",
  },
  {
    entityType: "permit_page",
    entityKey: "plumbing-permit-cost",
    permitTypeKey: "plumbing",
    status: "needs_review",
    method: "manual_review",
    verifiedAt: DALLAS_LAST_VERIFIED,
    verifiedBy: "Permit Fee Intelligence research pass 2",
    sourceKey: DALLAS_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "Same basis as the electrical page: zero matches for 'plumbing', 'sewer' and 'water heater' in the schedule, so no per-fixture fee exists to publish, and the $25 stand-alone trade review document fee is the only trade-permit line item. Marked for review for the same reason.",
  },
  {
    entityType: "jurisdiction_profile",
    entityKey: DALLAS_KEYS.jurisdiction,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: DALLAS_LAST_VERIFIED,
    verifiedBy: "Permit Fee Intelligence research pass 2",
    sourceKey: DALLAS_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "Hub content built from the fee schedule, the department's estimate worksheet and Ordinance 25-0638. Contact details are deliberately absent rather than copied from a secondary source. See research/texas/dallas.md section 7.6.",
  },
];

/* -------------------------------------------------------------------------- */
/* Export                                                                     */
/* -------------------------------------------------------------------------- */

export const dallasSeed: JurisdictionSeed = {
  state,
  county,
  jurisdiction,
  departments,
  sources,
  permitTypes: [],
  projectTypes: [],
  jurisdictionPermitTypes,
  feeSchedules,
  feeRules,
  requirements,
  profile,
  permitPages,
  verifications,
};

/** Permit pages that clear the editorial gate, for use in tests without a database. */
export const DALLAS_PUBLISHED_PERMIT_PAGES = dallasSeed.permitPages.filter(
  (page) => page.publishStatus === "published" && !page.noindex,
);

/** Permit pages deliberately held back, with the reason research/texas/dallas.md gives. */
export const DALLAS_WITHHELD_PERMIT_PAGES = dallasSeed.permitPages.filter(
  (page) => page.publishStatus !== "published" || page.noindex,
);
