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
  OMAHA_BUILDING_CODE_SOURCE_KEY,
  OMAHA_ELECTRICAL_BRANCH_CIRCUITS,
  OMAHA_ELECTRICAL_CODE_SOURCE_KEY,
  OMAHA_ELECTRICAL_EXISTING_SERVICE,
  OMAHA_ELECTRICAL_MINIMUM,
  OMAHA_ELECTRICAL_NEW_SERVICE_ROWS,
  OMAHA_ELECTRICAL_RESIDENTIAL_SQFT,
  OMAHA_ELECTRICAL_TEMPORARY_POLE,
  OMAHA_FEE_EFFECTIVE_FROM,
  OMAHA_PLANNING_FEES_SOURCE_KEY,
  OMAHA_PLAN_REVIEW,
  OMAHA_PLUMBING_BACKFLOW_PVB,
  OMAHA_PLUMBING_CODE_SOURCE_KEY,
  OMAHA_PLUMBING_FIXTURE,
  OMAHA_PLUMBING_MINIMUM,
  OMAHA_PLUMBING_WATER_HEATER_RESIDENTIAL,
  OMAHA_STRUCTURAL_BRACKETS,
  OMAHA_TECHNOLOGY_FEE_ROWS,
} from "./fee-rules";

export * from "./fee-rules";

/**
 * The complete Omaha, Nebraska seed payload.
 *
 * Every figure traces to research/nebraska/omaha.md, which traces to the Omaha
 * Municipal Code and the Planning Department's own fee page. Nothing is estimated.
 *
 * Omaha opens a new state and a **cleaner version of an existing mechanism**: a
 * valuation ladder whose every band handover closes to the cent, which is the opposite
 * of Houston's separately-rounded brackets and Denver's one-dollar seam. It also
 * carries a real third component — the Planning Department's Technology and Training
 * fee under Ordinance #39121 — whose own published example ($126.62 for a $10,000
 * deck) is what proves the surcharge belongs on the permit fee.
 */

const RESEARCHER = "Permit Fee Intelligence research pass 8 (Nebraska)";

export const OMAHA_LAST_VERIFIED = "2026-09-25";

export const OMAHA_KEYS = {
  state: "ne",
  county: "douglas-county",
  jurisdiction: "omaha",
  buildingSchedule: "omaha-building-schedule",
  electricalSchedule: "omaha-electrical-schedule",
  plumbingSchedule: "omaha-plumbing-schedule",
} as const;

const state: SeedState = {
  code: "NE",
  slug: "nebraska",
  name: "Nebraska",
  fipsCode: "31",
};

const county: SeedCounty = {
  key: OMAHA_KEYS.county,
  slug: "douglas-county",
  name: "Douglas County",
  fipsCode: "31055",
};

const jurisdiction: SeedJurisdiction = {
  key: OMAHA_KEYS.jurisdiction,
  stateKey: OMAHA_KEYS.state,
  countyKey: OMAHA_KEYS.county,
  type: "city",
  slug: "omaha",
  name: "Omaha",
  officialName: "City of Omaha",
  websiteUrl: "https://www.cityofomaha.org/",
  permitPortalUrl: "https://permits.cityofomaha.org/",
  timezone: "America/Chicago",
  isActive: true,
};

const departments: SeedDepartment[] = [
  {
    key: "omaha-planning-permits",
    jurisdictionKey: OMAHA_KEYS.jurisdiction,
    kind: "building",
    name: "Planning Department — Permits and Inspections Division",
    phone: "(402) 444-5150",
    email: null,
    url: "https://planning.omaha.gov/",
    addressLine: "1819 Farnam Street, Suite 1100, Omaha, NE 68183-1100",
    hours: null,
    notes:
      "Issues and inspects building, electrical and plumbing permits for property inside the Omaha city limits. Contact details are the Planning Department's own, published on its fee page.",
  },
];

const sources: SeedSource[] = [
  {
    key: OMAHA_BUILDING_CODE_SOURCE_KEY,
    jurisdictionKey: OMAHA_KEYS.jurisdiction,
    title: "Omaha Municipal Code — Chapter 43 (Building), Sec. 43-91 Permit fees and Table 43-91",
    url: "https://library.municode.com/ne/omaha/codes/code_of_ordinances?nodeId=OMMUCOCHGEORVOII_CH43BU_ARTIADEN_DIV7FE_S43-91PEFE",
    sourceType: "municipal_code",
    issuingAuthority: "City of Omaha",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: OMAHA_FEE_EFFECTIVE_FROM,
    retrievedAt: OMAHA_LAST_VERIFIED,
    lastVerifiedAt: OMAHA_LAST_VERIFIED,
    notes:
      "Read 2026-09-25 through the Municode Library, whose code version is dated August 31, 2026 (current). Sec. 43-91 sets the building permit fee in Table 43-91 and Sec. 43-92 sets plan review at 25 percent of that fee. The section's own citation block shows the base ordinance (Ord. No. 33582, 1995); Table 43-91 was amended in 2025 by Ord. No. 44525, published by the City Clerk as a scanned PDF with no text layer.",
  },
  {
    key: OMAHA_ELECTRICAL_CODE_SOURCE_KEY,
    jurisdictionKey: OMAHA_KEYS.jurisdiction,
    title: "Omaha Municipal Code — Chapter 44 (Electricity), Sec. 44-130 Fee schedule",
    url: "https://library.municode.com/ne/omaha/codes/code_of_ordinances?nodeId=OMMUCOCHGEORVOII_CH44EL_ARTIVPEIN",
    sourceType: "municipal_code",
    issuingAuthority: "City of Omaha",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: OMAHA_FEE_EFFECTIVE_FROM,
    retrievedAt: OMAHA_LAST_VERIFIED,
    lastVerifiedAt: OMAHA_LAST_VERIFIED,
    notes:
      "Read 2026-09-25. Sec. 44-130 prices electrical work as a list of items — a minimum of $25.00, six cents per square foot for new residential, $2.00 per branch circuit or feeder, service fees by amperage, and flat rows for temporary poles, pre-connects and low voltage.",
  },
  {
    key: OMAHA_PLUMBING_CODE_SOURCE_KEY,
    jurisdictionKey: OMAHA_KEYS.jurisdiction,
    title: "Omaha Municipal Code — Chapter 49 (Plumbing), Sec. 49-304 Permit fees and Table 49-304",
    url: "https://library.municode.com/ne/omaha/codes/code_of_ordinances?nodeId=OMMUCOCHGEORVOII_CH49PL_ARTIIIPEINFE_DIV1PE_S49-304PEFE",
    sourceType: "municipal_code",
    issuingAuthority: "City of Omaha",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: OMAHA_FEE_EFFECTIVE_FROM,
    retrievedAt: OMAHA_LAST_VERIFIED,
    lastVerifiedAt: OMAHA_LAST_VERIFIED,
    notes:
      "Read 2026-09-25. Sec. 49-304 sets a minimum permit fee of $22.70 and then prices each item on Table 49-304: fixtures, water heaters, backflow assemblies, water and sewer services, swimming pools, solar collectors, interceptors and more.",
  },
  {
    key: OMAHA_PLANNING_FEES_SOURCE_KEY,
    jurisdictionKey: OMAHA_KEYS.jurisdiction,
    title: "City of Omaha Planning Department — Application Fees (Technology and Training Fee Schedule, Ordinance #39121)",
    url: "https://planning.omaha.gov/application-fees/",
    sourceType: "municipal_website",
    issuingAuthority: "City of Omaha Planning Department",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: "2011-11-14",
    retrievedAt: OMAHA_LAST_VERIFIED,
    lastVerifiedAt: OMAHA_LAST_VERIFIED,
    notes:
      "The page publishes the Technology and Training Fee Schedule (Ordinance #39121, effective 11/14/2011) and states it is added to \"all fees paid to the Planning Department\": 8% up to $624.99, $50.00 from $625.00 to $2,499.99, $100.00 above that. It is the only place the surcharge's three bands are published.",
  },
];

/** Empty on purpose: the permit types Omaha uses already exist as shared rows. */
const permitTypes: JurisdictionSeed["permitTypes"] = [];
const projectTypes: JurisdictionSeed["projectTypes"] = [];

const jurisdictionPermitTypes: SeedJurisdictionPermitType[] = [
  {
    jurisdictionKey: OMAHA_KEYS.jurisdiction,
    permitTypeKey: "building",
    isAvailable: true,
    localName: "Building permit",
    officialUrl: "https://permits.cityofomaha.org/",
    notes:
      "Priced from valuation under Sec. 43-91, Table 43-91, with plan review at 25% of the permit fee under Sec. 43-92.",
  },
  {
    jurisdictionKey: OMAHA_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    isAvailable: true,
    localName: "Electrical permit",
    officialUrl: "https://permits.cityofomaha.org/",
    notes:
      "Issued separately under Sec. 44-130, priced per item: per square foot for new residential, per circuit for commercial work, and by amperage for a new service.",
  },
  {
    jurisdictionKey: OMAHA_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    isAvailable: true,
    localName: "Plumbing permit",
    officialUrl: "https://permits.cityofomaha.org/",
    notes:
      "Issued separately under Sec. 49-304, priced per item from Table 49-304 with a $22.70 minimum.",
  },
];

const feeSchedules: SeedFeeSchedule[] = [
  {
    key: OMAHA_KEYS.buildingSchedule,
    jurisdictionKey: OMAHA_KEYS.jurisdiction,
    sourceKey: OMAHA_BUILDING_CODE_SOURCE_KEY,
    title: "Omaha Municipal Code Sec. 43-91 and Table 43-91 — Building permit fees",
    officialUrl:
      "https://library.municode.com/ne/omaha/codes/code_of_ordinances?nodeId=OMMUCOCHGEORVOII_CH43BU_ARTIADEN_DIV7FE_S43-91PEFE",
    effectiveFrom: OMAHA_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: OMAHA_LAST_VERIFIED,
    notes:
      "Omaha has no single effective date for its fees; each section carries the ordinance that last amended it. The code version read was dated August 31, 2026.",
  },
  {
    key: OMAHA_KEYS.electricalSchedule,
    jurisdictionKey: OMAHA_KEYS.jurisdiction,
    sourceKey: OMAHA_ELECTRICAL_CODE_SOURCE_KEY,
    title: "Omaha Municipal Code Sec. 44-130 — Electrical permit fees",
    officialUrl:
      "https://library.municode.com/ne/omaha/codes/code_of_ordinances?nodeId=OMMUCOCHGEORVOII_CH44EL_ARTIVPEIN",
    effectiveFrom: OMAHA_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: OMAHA_LAST_VERIFIED,
    notes: "A per-item schedule, not a valuation table. The minimum fee on all electrical work is $25.00.",
  },
  {
    key: OMAHA_KEYS.plumbingSchedule,
    jurisdictionKey: OMAHA_KEYS.jurisdiction,
    sourceKey: OMAHA_PLUMBING_CODE_SOURCE_KEY,
    title: "Omaha Municipal Code Sec. 49-304 and Table 49-304 — Plumbing permit fees",
    officialUrl:
      "https://library.municode.com/ne/omaha/codes/code_of_ordinances?nodeId=OMMUCOCHGEORVOII_CH49PL_ARTIIIPEINFE_DIV1PE_S49-304PEFE",
    effectiveFrom: OMAHA_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: OMAHA_LAST_VERIFIED,
    notes: "A per-item schedule with a $22.70 minimum permit fee.",
  },
];

/* -------------------------------------------------------------------------- */
/* Fee rules                                                                  */
/* -------------------------------------------------------------------------- */

function attach(
  permitTypeKey: string,
  scheduleKey: string,
  rules: SeedFeeRule["rule"][],
): SeedFeeRule[] {
  return rules.map((rule) => ({
    jurisdictionKey: OMAHA_KEYS.jurisdiction,
    permitTypeKey,
    scheduleKey,
    rule,
  }));
}

const feeRules: SeedFeeRule[] = [
  ...attach("building", OMAHA_KEYS.buildingSchedule, [
    ...OMAHA_STRUCTURAL_BRACKETS,
    OMAHA_PLAN_REVIEW,
    ...OMAHA_TECHNOLOGY_FEE_ROWS,
  ]),
  ...attach("electrical", OMAHA_KEYS.electricalSchedule, [
    OMAHA_ELECTRICAL_MINIMUM,
    OMAHA_ELECTRICAL_RESIDENTIAL_SQFT,
    OMAHA_ELECTRICAL_BRANCH_CIRCUITS,
    OMAHA_ELECTRICAL_EXISTING_SERVICE,
    ...OMAHA_ELECTRICAL_NEW_SERVICE_ROWS,
    OMAHA_ELECTRICAL_TEMPORARY_POLE,
  ]),
  ...attach("plumbing", OMAHA_KEYS.plumbingSchedule, [
    OMAHA_PLUMBING_MINIMUM,
    OMAHA_PLUMBING_FIXTURE,
    OMAHA_PLUMBING_WATER_HEATER_RESIDENTIAL,
    OMAHA_PLUMBING_BACKFLOW_PVB,
  ]),
];

/* -------------------------------------------------------------------------- */
/* Requirements                                                               */
/* -------------------------------------------------------------------------- */

const requirements: SeedRequirement[] = [
  {
    jurisdictionKey: OMAHA_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "document",
    title: "A construction valuation the Building Official accepts",
    description:
      "\"The determination of value or valuation for the purpose of assessing the permit fee shall be made by the building official. The value to be used ... shall be the total value of all construction work for which the permit is issued.\" The applicant states a figure, and the official decides whether it is the one used.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: OMAHA_BUILDING_CODE_SOURCE_KEY,
    lastVerifiedAt: OMAHA_LAST_VERIFIED,
  },
  {
    jurisdictionKey: OMAHA_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "A permit before work begins, or the fee quadruples",
    description:
      "\"When construction begins before the permit has been issued, the applicant shall pay a penalty fee. Said fee shall be quadruple the amount of the regular fee.\" The penalty is waived only for genuinely emergency work where a permit is applied for within 48 hours of the start.",
    isMandatory: true,
    sortOrder: 20,
    sourceKey: OMAHA_BUILDING_CODE_SOURCE_KEY,
    lastVerifiedAt: OMAHA_LAST_VERIFIED,
  },
  {
    jurisdictionKey: OMAHA_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "license",
    title: "A registered electrical contractor draws the permit",
    description:
      "Sec. 44-130 prices electrical work \"for registered electrical contractors\", and the chapter's registration fee rows sit in the same article. The permit is not an owner-builder instrument the way a single-family building permit can be.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: OMAHA_ELECTRICAL_CODE_SOURCE_KEY,
    lastVerifiedAt: OMAHA_LAST_VERIFIED,
  },
  {
    jurisdictionKey: OMAHA_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    requirementType: "license",
    title: "A supervising master plumber signs the application",
    description:
      "Sec. 49-303 requires the permit application to state \"the name, address and signature of the supervising master plumber\", alongside the scope of work and a \"listing and number of plumbing fixtures to be installed\" — which is the count Table 49-304 charges.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: OMAHA_PLUMBING_CODE_SOURCE_KEY,
    lastVerifiedAt: OMAHA_LAST_VERIFIED,
  },
];

/* -------------------------------------------------------------------------- */
/* Jurisdiction profile                                                       */
/* -------------------------------------------------------------------------- */

const profile: SeedProfile = {
  jurisdictionKey: OMAHA_KEYS.jurisdiction,
  headline: "What construction permits cost in Omaha",
  summary:
    "Omaha prices a building permit from valuation using Table 43-91 of the Omaha Municipal Code: $41.00 up to $2,000, then $41.00 plus $9.53 for each additional $1,000, easing to $1.96 per $1,000 above $1,000,000. Plan review is a separate 25% of the permit fee, and the Planning Department's Technology and Training fee is added on top of every fee it collects.",
  localContext:
    "Three things decide an Omaha permit fee, and the first is that the table chains cleanly — which is worth saying out loud, because the two states next door to it in this dataset do not.\n\nTable 43-91 is written the same way Houston's and Denver's are: an amount \"for the first $N, plus $Y for each additional $1,000 or fraction thereof\". The difference is what happens at the seam. Omaha's six handovers each close to the cent — the band below produces, at its own top, exactly the figure the band above opens with — so a reader can check any bracket against the one before it and find it correct. Denver's does not (one seam is a dollar short), and Houston's Base Charges drift apart by design. That is not to say Omaha's arithmetic is better; it is to say it is checkable, and checking it is the point.\n\nThe second is that \"or fraction thereof\" is charged in Omaha too. One cent past a thousand buys a whole additional thousand, at that band's rate. At $100,000 exactly the table gives $580.69; at $100,001 it gives $580.69 plus $2.78.\n\nThe third is the Technology and Training fee, and it is the reason this site's Omaha figures will look slightly higher than a bare reading of Table 43-91 suggests. Under Ordinance #39121 the Planning Department adds 8% to every fee it collects up to $624.99, then a flat $50 up to $2,499.99, then a flat $100 above that. The City's own published example is the proof that it lands on the permit fee: \"a permit fee of $126.62 would be charged for a $10,000 deck\", and $117.24 — Table 43-91 at $10,000 — times 1.08 is $126.62 to the cent.",
  valuationBasis:
    "Omaha takes a construction valuation from the applicant and lets the Building Official determine it: \"The determination of value or valuation for the purpose of assessing the permit fee shall be made by the building official. The value to be used in computing the building permit and plan review fees shall be the total value of all construction work for which the permit is issued.\"\n\nThe valuation is the total value of all construction work — not the contract price of one trade and not a land value. Omaha publishes no square-foot cost table for deriving it, and this site never substitutes one: where a figure is needed, you supply it, and you supply it as the total value of the work.",
  notIncluded:
    "These figures are the City of Omaha's building, electrical and plumbing permit fees as published in the Omaha Municipal Code, plus the Planning Department's Technology and Training fee. They are not a total project cost. They exclude:\n\n- **The quadruple penalty fee** for construction begun before the permit is issued, which multiplies the regular fee by four unless the work was an emergency and a permit was applied for within 48 hours.\n- **Shoring, insulation and every other flat row of Table 43-91** beyond the seven valuation bands: shoring at $41.00 plus $4.12 per $1,000 over $10,000, commercial/industrial insulation at $51.50, residential insulation at $25.75, and residential additions at $10.30.\n- **The certificate-of-occupancy family** — $125.00 for a first, subsequent or temporary certificate, $950.00 for pre-occupancy without one, $50.00 per inspector per reinspection — and the $170.00 building analysis fee.\n- **Every hourly and event fee**: inspections outside normal business hours at $55.00 per hour with a two-hour minimum, additional plan-review submittals at $50.00 each, and the $50.00 second re-inspection trip.\n- **The electrical and plumbing rows not modelled**: Sec. 44-130's pre-connect, re-connect, low-voltage, outage and multiple-pre-connect items, and Table 49-304's water services, sewer connections, swimming pools, solar collectors, interceptors, water-conditioning devices and lawn sprinklers.\n- **Planning Department fees that are not permit fees** — rezoning, platting and the planning application schedule — even though the same Technology and Training fee is added to them.\n- **Anything charged by another authority.** Omaha is a city inside Douglas County; Douglas County and the neighbouring cities of Bennington, Elkhorn and Ralston issue their own permits under their own schedules.",
  seoTitle: "Omaha construction permit fees",
  seoDescription:
    "How Omaha prices building, electrical and plumbing permits — Table 43-91 valuation bands, plan review at 25%, and the Planning Department's Technology and Training fee, with the code section behind every figure.",
  publishStatus: "published",
  noindex: false,
  lastReviewedAt: OMAHA_LAST_VERIFIED,
};

/* -------------------------------------------------------------------------- */
/* Permit pages                                                               */
/* -------------------------------------------------------------------------- */

const permitPages: SeedPermitPage[] = [
  {
    jurisdictionKey: OMAHA_KEYS.jurisdiction,
    permitTypeKey: "building",
    slug: "building-permit-cost",
    title: "Omaha building permit cost",
    intro:
      "Omaha charges a building permit fee from the construction valuation, using seven bands in Table 43-91 of the Omaha Municipal Code. Below $2,000 the fee is a flat $41.00. Above that each band adds a published rate for every additional $1,000 of valuation, or fraction of one, easing from $9.53 down to $1.96. Plan review is a separate 25% of the permit fee, and the Planning Department adds a Technology and Training fee on top.",
    localSummary:
      "The bands run from a flat $41.00 up to $2,000, then $41.00 plus $9.53 per additional $1,000 to $25,000, and onward through seven rows ending at $2,877.69 plus $1.96 per additional $1,000 above $1,000,000.\n\nTwo features of the table are worth knowing. Each band's opening figure is exactly what the band below produces at its own top, so the table can be checked by hand at every handover — $41 at $2,000, $260.19 at $25,000, $421.19 at $50,000, $580.69 at $100,000, $1,692.69 at $500,000 and $2,877.69 at $1,000,000. And \"or fraction thereof\" applies, so one cent past a band boundary buys a whole additional $1,000 of increment.",
    notIncluded:
      "This is the Table 43-91 valuation fee, plus plan review at 25% when plans are submitted and the Planning Department's Technology and Training fee. It excludes:\n\n- The quadruple penalty for construction begun without a permit, waived only for emergency work permitted within 48 hours.\n- Table 43-91's other rows: shoring ($41.00 plus $4.12 per $1,000 over $10,000), commercial/industrial insulation ($51.50), residential insulation ($25.75) and residential-addition insulation ($10.30).\n- Certificate-of-occupancy fees ($125.00 each, $950.00 for pre-occupancy), the $170.00 building analysis fee and the $50.00 duplicate-plan fees.\n- After-hours inspections at $55.00 per hour with a two-hour minimum, and $50.00 for each additional review submittal.\n- All electrical, plumbing and fire-suppression permit fees, which are separate permits priced under Sec. 44-130 and Sec. 49-304.\n- Planning Department charges that are not permit fees, and anything charged by Douglas County or a neighbouring city.",
    workedExample: {
      scenario:
        "A commercial tenant finish with a declared construction valuation of $250,000 and plans submitted for review.",
      inputs: { valuationCents: 25_000_000, custom: { plan_review: true } },
      notes:
        "Table 43-91's fifth band: $580.69 for the first $100,000 plus $2.78 for each of the 150 additional thousands, which is $997.69. Plan review is 25% of that, $249.42, and the Technology and Training fee is a flat $50.00 at that size of underlying fee. The valuation is the example's, not the City's.",
    },
    faqs: [
      {
        question: "Is the Omaha building permit fee a percentage of construction cost?",
        answer:
          "No. Table 43-91 is written as an amount for the first so many thousand, plus a dollar rate for each additional $1,000 or fraction of one. The rate is 0.953% at the second band, but the published unit is used as written, because a percentage rounded to two decimals does not reproduce the City's own figures.",
        sourceId: OMAHA_BUILDING_CODE_SOURCE_KEY,
      },
      {
        question: "Does Omaha round the valuation up before charging the rate?",
        answer:
          "Yes. Each band charges per additional $1,000 \"or fraction thereof\", so a valuation one cent above a band boundary buys a whole additional $1,000 of increment.",
        sourceId: OMAHA_BUILDING_CODE_SOURCE_KEY,
      },
      {
        question: "Is plan review included in the permit fee?",
        answer:
          "No. Sec. 43-92 sets plan review at 25 percent of the building permit fee shown in Table 43-91, charged in addition to it. This page includes it only when the 25% review applies, which is why the worked example shows it and a deck permit does not.",
        sourceId: OMAHA_BUILDING_CODE_SOURCE_KEY,
      },
      {
        question: "What is the Technology and Training fee?",
        answer:
          "A fee the Planning Department adds to every fee it collects under Ordinance #39121: 8% of the underlying fee up to $624.99, a flat $50.00 from $625.00 to $2,499.99, and a flat $100.00 above that. The City's own example — $126.62 for a $10,000 deck — is Table 43-91's $117.24 plus 8%.",
        sourceId: OMAHA_PLANNING_FEES_SOURCE_KEY,
      },
      {
        question: "What happens if I start work before the permit is issued?",
        answer:
          "The penalty fee is quadruple the regular fee. It is not charged only where the work was a genuine emergency and a permit was applied for within 48 hours of the start.",
        sourceId: OMAHA_BUILDING_CODE_SOURCE_KEY,
      },
      {
        question: "How do I know which valuation Omaha will use?",
        answer:
          "The Building Official decides: \"The determination of value or valuation for the purpose of assessing the permit fee shall be made by the building official.\" You state the total value of all construction work, and the official may adjust it.",
        sourceId: OMAHA_BUILDING_CODE_SOURCE_KEY,
      },
    ],
    seoTitle: "Omaha building permit cost: Table 43-91 and plan review",
    seoDescription:
      "Omaha building permit fees from Table 43-91 — $41.00 plus $9.53 per additional $1,000 at $25,000 — with plan review at 25% and the Technology and Training fee, each cited to the code.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: OMAHA_LAST_VERIFIED,
  },
  {
    jurisdictionKey: OMAHA_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    slug: "electrical-permit-cost",
    title: "Omaha electrical permit cost",
    intro:
      "Omaha does not price electrical permits off the value of the building. Sec. 44-130 sets a fee for each item of work: six cents per square foot for new residential wiring, $2.00 per branch circuit or feeder on commercial work, a service fee that rises with amperage, and flat rows for temporary poles and other items. The minimum fee on all electrical work is $25.00.",
    localSummary:
      "The schedule has two shapes and the job picks which one applies. New single-family, two-family and town home wiring is priced by area at six cents per square foot, which the code says covers all wiring, the electrical service, major appliances and electric heat. Everything else — commercial work, apartments and existing residential — is priced per item: $2.00 for each branch circuit and feeder, $20.00 for work on an existing service, and a new-service fee that runs from $25.00 up to $185.00 and then $20.00 for every additional 100 amperes.\n\nThe service fees are the part that surprises people, because a new service is charged by its amperage and not by the size of the job. A 200-ampere service is $25.00; a 400-ampere service is $65.00; a 1,200-ampere service is $185.00 for the first 1,000 amperes plus $20.00 for each additional 100.",
    notIncluded:
      "This covers the electrical rows transcribed: the $25.00 minimum, residential square-foot pricing, branch circuits and feeders, existing services, new services by amperage and temporary poles. It excludes:\n\n- Sec. 44-130's pre-connect ($25.00 each), re-connect ($25.00 each), low-voltage ($25.00 each) and outage ($25.00 each) rows, and multiple pre-connects at one building (1 to 10 at $25.00 each, then $10.00 each).\n- The second and subsequent re-inspection trips, charged at $50.00 each with the first additional trip free.\n- Electrical contractor, master electrician and apprentice registration and examination fees, which are licences rather than permits.\n- The Planning Department's Technology and Training fee, which the City adds to the fees it collects; the building page shows it, and this page does not charge it.\n- Any utility connection or service-installation charge, which is made by the utility rather than by the City.",
    workedExample: {
      scenario:
        "A commercial electrical permit covering a new 200-ampere service, thirty branch circuits and one temporary pole.",
      inputs: {
        custom: {
          electrical_scope: "commercial",
          service_type: "new",
          amperage: 200,
          circuits: 30,
          temporary_pole: true,
        },
      },
      notes:
        "Three base rows apply: the new 200-ampere service at $25.00, thirty branch circuits at $2.00 each ($60.00), and the temporary pole at $25.00, for $110.00. The $25.00 minimum does not bite, because the subtotal is already above it. The counts are the example's, not the City's.",
    },
    faqs: [
      {
        question: "How much is an electrical permit in Omaha?",
        answer:
          "It depends on the work. New residential wiring is six cents per square foot. Commercial work is $2.00 per branch circuit or feeder. A new service is $25.00 up to 200 amperes, rising to $185.00 at 801 to 1,000 amperes and $20.00 per additional 100 amperes above that.",
        sourceId: OMAHA_ELECTRICAL_CODE_SOURCE_KEY,
      },
      {
        question: "Is there a minimum electrical permit fee?",
        answer:
          "Yes. Sec. 44-130 states that \"the minimum fee on all electrical work shall be $25.00\", and Omaha charges it as the shortfall against the calculated subtotal rather than as a separate line.",
        sourceId: OMAHA_ELECTRICAL_CODE_SOURCE_KEY,
      },
      {
        question: "How is new residential electrical work priced?",
        answer:
          "By area, at six cents per square foot, and the code says the fee \"covers installation of all electrical wiring, electrical service, all major appliances, and electric heat\". Square footage is the total area including each level, hallways, stairways and attached garages, excluding unattached garages.",
        sourceId: OMAHA_ELECTRICAL_CODE_SOURCE_KEY,
      },
      {
        question: "Do branch circuits count during a service panel replacement?",
        answer:
          "No. The code adds an exception: the $2.00 branch circuit and feeder fee \"does not apply to existing circuits on a service panel replacement\".",
        sourceId: OMAHA_ELECTRICAL_CODE_SOURCE_KEY,
      },
      {
        question: "Can I pull the electrical permit myself?",
        answer:
          "Sec. 44-130's schedule is written for registered electrical contractors, and the chapter registers contractors and master electricians. Unlike a single-family building permit, an electrical permit is not framed as an owner-builder instrument.",
        sourceId: OMAHA_ELECTRICAL_CODE_SOURCE_KEY,
      },
    ],
    seoTitle: "Omaha electrical permit cost: per-item fees and service rates",
    seoDescription:
      "Omaha electrical permits under Sec. 44-130 — six cents per square foot for new residential, $2.00 per branch circuit, service fees from $25.00 to $185.00 plus $20.00 per additional 100 amperes.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: OMAHA_LAST_VERIFIED,
  },
  {
    jurisdictionKey: OMAHA_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    slug: "plumbing-permit-cost",
    title: "Omaha plumbing permit cost",
    intro:
      "Omaha prices a plumbing permit per item from Table 49-304 in Sec. 49-304 of the Municipal Code, with a minimum permit fee of $22.70. A fixture, a roughed-in opening or a roof drain is $7.95; a residential water heater is $7.95; a pressure vacuum breaker assembly is $11.35. The permit fee is the sum of the items the application lists.",
    localSummary:
      "The section sets a floor first — \"the minimum permit fee shall be $22.70 payable to the city prior to issuance of the permit\" — and then prices the work. Most residential and light-commercial items land at $7.95 each: fixtures, roughed-in openings, roof drains, fixture relocations, water-heater replacements and storage tanks. Bigger items carry their own figures: a commercial water heater is $34.00, a residential water service over one inch is $50.00, a commercial fire-protection water service is $75.00, and a master water service is $150.00.\n\nBecause the schedule is written per item, the number that decides the fee is how many items your application lists. The plumbing permit is a separate permit from the building permit and is priced on its own.",
    notIncluded:
      "This covers the plumbing rows transcribed from Table 49-304: fixtures and openings, residential water heaters and pressure vacuum breaker assemblies, against the $22.70 minimum. It excludes:\n\n- The rest of Table 49-304, which is long: below-ground swimming pools ($58.90), hot tubs and above-ground pools ($17.00), solar collector arrays ($11.35), commercial water heaters ($34.00), the atmospheric vacuum breaker ($7.95) and reduced pressure principle / double check valve assemblies ($28.85), indirect wastes, water services from $7.95 to $150.00, residential and commercial sewer connections ($45.30 and $61.80), building sewer repairs, manhole taps, lawn sprinkler heads ($11.30 per 50) and grease interceptors ($50.00).\n- Water and sewer connection charges, which are utility charges rather than permit fees.\n- The Planning Department's Technology and Training fee, which the City adds to the fees it collects; the building page shows it and this page does not charge it.\n- The doubling of the fee when plumbing work starts before a permit is issued, which the code applies where the work was not an emergency.",
    workedExample: {
      scenario:
        "A residential remodel plumbing permit listing twelve fixtures, one residential water heater and two pressure vacuum breaker assemblies.",
      inputs: {
        fixtures: 12,
        custom: { heaters: 1, backflow_devices: 2 },
      },
      notes:
        "Twelve fixtures at $7.95 is $95.40, the water heater at $7.95 is $7.95, and two pressure vacuum breaker assemblies at $11.35 is $22.70, for $126.05. The $22.70 minimum does not bite, because the subtotal is already above it. The counts are the example's, not the City's.",
    },
    faqs: [
      {
        question: "How much is a plumbing permit in Omaha?",
        answer:
          "A fixture, roughed-in opening or roof drain is $7.95, and the minimum permit fee is $22.70. Larger items are priced separately: a commercial water heater is $34.00, a sewer connection is $45.30 residential or $61.80 commercial, and a master water service is $150.00.",
        sourceId: OMAHA_PLUMBING_CODE_SOURCE_KEY,
      },
      {
        question: "Is there a minimum plumbing permit fee?",
        answer:
          "Yes. Sec. 49-304 sets \"the minimum permit fee ... $22.70 payable to the city prior to issuance of the permit\", and any amount above it is determined by Table 49-304.",
        sourceId: OMAHA_PLUMBING_CODE_SOURCE_KEY,
      },
      {
        question: "Is a water heater replacement a fixture?",
        answer:
          "No. Table 49-304 prices water heaters on their own rows — $7.95 for each residential water heater, $11.35 as the maximum for a residential replacement, and $34.00 for each commercial one — rather than counting them as fixtures.",
        sourceId: OMAHA_PLUMBING_CODE_SOURCE_KEY,
      },
      {
        question: "What does the permit application have to list?",
        answer:
          "Sec. 49-303 requires the owner's details, the supervising master plumber's name and signature, a description of the scope, and a \"listing and number of plumbing fixtures to be installed\" — which is the count Table 49-304 charges.",
        sourceId: OMAHA_PLUMBING_CODE_SOURCE_KEY,
      },
      {
        question: "What happens if plumbing work starts before the permit?",
        answer:
          "The fee is doubled. The code waives the doubling only for emergency work that had to be done immediately, and then only if a permit is secured at the earliest possible time afterwards.",
        sourceId: OMAHA_PLUMBING_CODE_SOURCE_KEY,
      },
    ],
    seoTitle: "Omaha plumbing permit cost: per-item fees from Table 49-304",
    seoDescription:
      "Omaha plumbing permits cost a $22.70 minimum plus $7.95 per fixture, $7.95 per residential water heater and $11.35 per pressure vacuum breaker, under Municipal Code Sec. 49-304.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: OMAHA_LAST_VERIFIED,
  },
];

/* -------------------------------------------------------------------------- */
/* Verification ledger                                                        */
/* -------------------------------------------------------------------------- */

const verifications: SeedVerification[] = [
  {
    entityType: "source",
    entityKey: OMAHA_BUILDING_CODE_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: OMAHA_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: OMAHA_BUILDING_CODE_SOURCE_KEY,
    notes:
      "Read 2026-09-25 from the Municode Library, code version August 31, 2026. Table 43-91's seven bands were transcribed and each handover checked: $41 at $2,000, $260.19 at $25,000, $421.19 at $50,000, $580.69 at $100,000, $1,692.69 at $500,000 and $2,877.69 at $1,000,000 — all six close.",
  },
  {
    entityType: "source",
    entityKey: OMAHA_ELECTRICAL_CODE_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: OMAHA_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: OMAHA_ELECTRICAL_CODE_SOURCE_KEY,
    notes: "Sec. 44-130 read 2026-09-25. The per-item rows and the $25.00 minimum transcribed.",
  },
  {
    entityType: "source",
    entityKey: OMAHA_PLUMBING_CODE_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: OMAHA_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: OMAHA_PLUMBING_CODE_SOURCE_KEY,
    notes: "Sec. 49-304 and Table 49-304 read 2026-09-25.",
  },
  {
    entityType: "source",
    entityKey: OMAHA_PLANNING_FEES_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: OMAHA_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: OMAHA_PLANNING_FEES_SOURCE_KEY,
    notes:
      "The Technology and Training Fee Schedule read 2026-09-25. Corroborated by the City's own example on cityofomaha.org — $126.62 for a $10,000 deck — which equals Table 43-91's $117.24 plus 8%.",
  },
  {
    entityType: "fee_rule",
    entityKey: "T4391-B5",
    permitTypeKey: "building",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: OMAHA_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: OMAHA_BUILDING_CODE_SOURCE_KEY,
    notes:
      "Table 43-91: \"$580.69 for the first $100,000.00 plus $2.78 for each additional $1,000.00 or fraction thereof\". At $100,000 the band below produces $580.69 exactly, which is what this band opens with.",
  },
  {
    entityType: "fee_rule",
    entityKey: "PLAN-REVIEW-25",
    permitTypeKey: "building",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: OMAHA_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: OMAHA_BUILDING_CODE_SOURCE_KEY,
    notes:
      "Sec. 43-92: plan review is \"25 percent of the building permit fee as shown in table 43-91\". Modelled on the `permit_fee` basis behind a `custom.plan_review` fact.",
  },
  {
    entityType: "fee_rule",
    entityKey: "TECH-8PCT",
    permitTypeKey: "building",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: OMAHA_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: OMAHA_PLANNING_FEES_SOURCE_KEY,
    notes:
      "Ordinance #39121, the 8% / $50 / $100 bands. Confirmed to land on the building permit fee by the City's own $10,000-deck example ($117.24 x 1.08 = $126.62).",
  },
  {
    entityType: "permit_page",
    entityKey: "building-permit-cost",
    permitTypeKey: "building",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: OMAHA_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: OMAHA_BUILDING_CODE_SOURCE_KEY,
    notes:
      "All seven bands, plan review and the three Technology fee rows. The worked example is arithmetic on the table: $250,000 gives $997.69 of permit fee and $249.42 of review.",
  },
  {
    entityType: "permit_page",
    entityKey: "electrical-permit-cost",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: OMAHA_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: OMAHA_ELECTRICAL_CODE_SOURCE_KEY,
    notes:
      "Sec. 44-130's minimum, residential square-foot rate, per-circuit rate, existing service, the six new-service bands and the over-1,000-ampere rule.",
  },
  {
    entityType: "permit_page",
    entityKey: "plumbing-permit-cost",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: OMAHA_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: OMAHA_PLUMBING_CODE_SOURCE_KEY,
    notes:
      "Table 49-304's $22.70 minimum and the three per-item rows modelled, with the remainder of the table named in the exclusions rather than guessed.",
  },
  {
    entityType: "jurisdiction_profile",
    entityKey: OMAHA_KEYS.jurisdiction,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: OMAHA_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: OMAHA_BUILDING_CODE_SOURCE_KEY,
    notes: "Hub content built from the Municipal Code and the Planning Department's own fee page.",
  },
];

/* -------------------------------------------------------------------------- */
/* Export                                                                     */
/* -------------------------------------------------------------------------- */

export const omahaSeed: JurisdictionSeed = {
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
export const OMAHA_PUBLISHED_PERMIT_PAGES = omahaSeed.permitPages.filter(
  (page) => page.publishStatus === "published" && !page.noindex,
);
