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
  DET_BSEED_DEPT_SOURCE_KEY,
  DET_BUILDING_PERMITS_SOURCE_KEY,
  DET_BUILDING_RULES,
  DET_CONSTRUCTION_SOURCE_KEY,
  DET_ELECTRICAL_RULES,
  DET_FEE_EFFECTIVE_FROM,
  DET_FEE_SCHEDULE_SOURCE_KEY,
  DET_FEES_DOC_PAGE_SOURCE_KEY,
  DET_INSPECTION_SOURCE_KEY,
  DET_PLAN_REVIEW_SOURCE_KEY,
  DET_PLUMBING_RULES,
  DET_TRADE_PERMITS_SOURCE_KEY,
} from "./fee-rules";

export * from "./fee-rules";

/**
 * The complete Detroit, Michigan seed payload.
 *
 * Every figure traces to research/michigan/detroit.md, which traces to BSEED's
 * 51-page fee schedule (effective January 1, 2024, modified July 18, 2025),
 * read in three pdftotext modes because the first two mis-pair labels with
 * amounts in this document, and to the City's service pages for everything
 * that is process rather than price.
 *
 * Three pages: building, electrical and plumbing — three readings of one
 * document rather than one formula three times. Building is a nine-band ladder
 * on project cost whose every rate row prints "or fraction thereof" (so the
 * step above each threshold rounds up, the opposite of Pittsburgh's prorated
 * block). Electrical is a $66 Part A base fee plus itemised counts and eight
 * service bands gated by two declared facts. Plumbing is a non-refundable $73
 * application fee that is credited nowhere, plus per-item rows. Plan review
 * exists in three published forms in the same document — 7% per trade, a 35%
 * deposit that a later sentence calls 30%, and $158 + $53 a sheet — and none
 * of the three is charged on any page here, each for its own stated reason.
 */

const RESEARCHER = "Permit Fee Intelligence research pass 15 (Michigan)";

export const DET_LAST_VERIFIED = "2026-09-25";

export const DET_KEYS = {
  state: "mi",
  county: "wayne-county",
  jurisdiction: "detroit",
  feeSchedule: "detroit-bseed-permit-fees",
} as const;

const state: SeedState = {
  code: "MI",
  slug: "michigan",
  name: "Michigan",
  fipsCode: "26",
};

const county: SeedCounty = {
  key: DET_KEYS.county,
  slug: "wayne-county",
  name: "Wayne County",
  fipsCode: "26163",
};

const jurisdiction: SeedJurisdiction = {
  key: DET_KEYS.jurisdiction,
  stateKey: DET_KEYS.state,
  countyKey: DET_KEYS.county,
  type: "city",
  slug: "detroit",
  name: "Detroit",
  officialName: "City of Detroit",
  websiteUrl: "https://detroitmi.gov/",
  permitPortalUrl: "https://permits.detroitmi.gov",
  timezone: "America/Detroit",
  isActive: true,
};

const departments: SeedDepartment[] = [
  {
    key: "detroit-bseed",
    jurisdictionKey: DET_KEYS.jurisdiction,
    kind: "building",
    name: "Buildings, Safety Engineering, and Environmental Department (BSEED)",
    phone: "(313) 224-3202",
    email: null,
    url: "https://detroitmi.gov/departments/buildings-safety-engineering-and-environmental-department-bseed",
    addressLine: "Coleman A. Young Municipal Center, 2 Woodward Ave, Suite 408, Detroit, MI 48226",
    hours: null,
    notes:
      "BSEED issues building permits, demolition/wrecking permits and the trade permits — mechanical, electrical, plumbing, elevator, fire alarm, generators and boilers — and its Construction Inspection Division runs six trade teams (boilers, buildings, electrical, elevators, mechanical, plumbing). Applications run through Accela at https://permits.detroitmi.gov with plans uploaded to ProjectDox (the City's \"ePLANS\" workflow); inspections are scheduled in Accela or at the Construction Division office. Phones, all read 2026-09-25: application help (313) 224-3179, general customer service (313) 224-3202, Electrical 313-224-3228, Mechanical 313-224-0113, Plumbing 313-224-3118.",
  },
];

const sources: SeedSource[] = [
  {
    key: DET_FEE_SCHEDULE_SOURCE_KEY,
    jurisdictionKey: DET_KEYS.jurisdiction,
    title:
      "BSEED Fee Schedule, effective January 1, 2024, modified July 18, 2025 (51 pages)",
    url: "https://detroitmi.gov/sites/detroitmi.localhost/files/2025-12/Fee%20Schedule.Effective_January_1_2024_Modified%20July%2018%2C%202025.pdf",
    sourceType: "fee_schedule_pdf",
    issuingAuthority:
      "City of Detroit, Buildings, Safety Engineering, and Environmental Department",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2025-07-18",
    effectiveFrom: DET_FEE_EFFECTIVE_FROM,
    retrievedAt: DET_LAST_VERIFIED,
    lastVerifiedAt: DET_LAST_VERIFIED,
    notes:
      "Read 2026-09-25 in three pdftotext modes: -layout pushes the fee-amount column into its own stream of numbers with no row to belong to, plain mode separates every label from every amount, and -table pairs them correctly — every figure this site charges is the -table pairing. Parts A–C (licences, certificates, service fees), the building/residential block with the nine-band ladder and the REFUNDS deduction, F: PLAN REVIEW, then the ELECTRICAL, PLUMBING and mechanical trade sections, then property maintenance and the administrative tail. The document page (S2) links this file as the current download; a 2009 \"GENERAL FEE SCHEDULE\" still on the domain was read only to confirm it is not the linked document — its refund sentence still says 30% where the current one says 35%.",
  },
  {
    key: DET_FEES_DOC_PAGE_SOURCE_KEY,
    jurisdictionKey: DET_KEYS.jurisdiction,
    title: "Building Permit Fees — City of Detroit",
    url: "https://detroitmi.gov/document/building-permit-fees",
    sourceType: "municipal_website",
    issuingAuthority:
      "City of Detroit, Buildings, Safety Engineering, and Environmental Department",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: DET_LAST_VERIFIED,
    lastVerifiedAt: DET_LAST_VERIFIED,
    notes:
      "Read 2026-09-25 (HTTP 200). The document page that links the fee schedule as \"Download the latest list of fees for permits\", which is how the schedule in force was told from the older schedules still on the domain. Publishes no amount of its own.",
  },
  {
    key: DET_BUILDING_PERMITS_SOURCE_KEY,
    jurisdictionKey: DET_KEYS.jurisdiction,
    title: "Building Permits — City of Detroit",
    url: "https://detroitmi.gov/departments/buildings-safety-engineering-and-environmental-department-bseed/building-permits",
    sourceType: "municipal_website",
    issuingAuthority:
      "City of Detroit, Buildings, Safety Engineering, and Environmental Department",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: DET_LAST_VERIFIED,
    lastVerifiedAt: DET_LAST_VERIFIED,
    notes:
      "Read 2026-09-25 (HTTP 200). The seven-step process, the Accela/ProjectDox submission rules, the licence rule per permit type (residential contractors need a Builder's License and City registration; the page states \"No license required\" for commercial building permits), sealed plans, and the published turnaround times: 5 days residential, 20 days commercial. Also where the City points readers at the Water & Sewerage Department and the Department of Public Works for the permits BSEED does not issue.",
  },
  {
    key: DET_TRADE_PERMITS_SOURCE_KEY,
    jurisdictionKey: DET_KEYS.jurisdiction,
    title: "Trade Permits — City of Detroit",
    url: "https://detroitmi.gov/departments/buildings-safety-engineering-and-environmental-department-bseed/trade-permits",
    sourceType: "municipal_website",
    issuingAuthority:
      "City of Detroit, Buildings, Safety Engineering, and Environmental Department",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: DET_LAST_VERIFIED,
    lastVerifiedAt: DET_LAST_VERIFIED,
    notes:
      "Read 2026-09-25 (HTTP 200). The permit-type matrix for mechanical, electrical, plumbing, elevator, fire alarm, generators and boilers: when a trade permit is needed, the licence each one requires (\"City of Detroit licensed Electrician/Plumbing Contractor/Mechanical Contractor\"), what an owner must bring to file (deed plus photo ID), and the published turnarounds — 1 day mechanical, 2 days electrical, 1 day plumbing.",
  },
  {
    key: DET_CONSTRUCTION_SOURCE_KEY,
    jurisdictionKey: DET_KEYS.jurisdiction,
    title: "Construction — City of Detroit",
    url: "https://detroitmi.gov/how-do-i/apply-or-renew-permit-or-certification/construction",
    sourceType: "municipal_website",
    issuingAuthority:
      "City of Detroit, Buildings, Safety Engineering, and Environmental Department",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: DET_LAST_VERIFIED,
    lastVerifiedAt: DET_LAST_VERIFIED,
    notes:
      "Read 2026-09-25 (HTTP 200). Submittal requirements in the City's own words — sealed drawings by a Michigan-registered architect or engineer, three sets plus calculations and specifications, site plan, geotechnical report — the codes in force, the trade division phone numbers, and the ten facts about certificates of occupancy. No amount on this site comes from this page.",
  },
  {
    key: DET_PLAN_REVIEW_SOURCE_KEY,
    jurisdictionKey: DET_KEYS.jurisdiction,
    title: "Permits & Plan Review — BSEED",
    url: "https://detroitmi.gov/departments/buildings-safety-engineering-and-environmental-department-bseed/bseed-divisions/permits-plan-review",
    sourceType: "municipal_website",
    issuingAuthority:
      "City of Detroit, Buildings, Safety Engineering, and Environmental Department",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: DET_LAST_VERIFIED,
    lastVerifiedAt: DET_LAST_VERIFIED,
    notes:
      "Read 2026-09-25 (HTTP 200). What plan review is here — \"verification of compliance to City of Detroit Zoning Ordinance, Michigan Building Code, Michigan Residential Code, Michigan Rehabilitation Code, Michigan Electrical Code, Michigan Mechanical Code, Michigan Plumbing Code, International Fuel Gas Code, City Elevator Code and Boiler Code\" — plus the ePLANS workflow, the plan checklists and the Pre-Plan Consultation. Defines the scope of the percentage charges this site names but does not sum.",
  },
  {
    key: DET_INSPECTION_SOURCE_KEY,
    jurisdictionKey: DET_KEYS.jurisdiction,
    title: "Construction Inspection — BSEED",
    url: "https://detroitmi.gov/departments/buildings-safety-engineering-and-environmental-department-bseed/bseed-divisions/construction-inspection",
    sourceType: "municipal_website",
    issuingAuthority:
      "City of Detroit, Buildings, Safety Engineering, and Environmental Department",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: DET_LAST_VERIFIED,
    lastVerifiedAt: DET_LAST_VERIFIED,
    notes:
      "Read 2026-09-25 (HTTP 200). The six trade teams with their supervisors and phone numbers, the Certificate of Occupancy / Certificate of Acceptance procedure (72-hour turnaround), inspection scheduling, and the fire-alarm permitting update quoted on this site's electrical page: \"No separate building permit is required solely for fire alarm systems when a Fire Marshal permit has been issued … Trade permits (electrical, mechanical, etc.) are still required for applicable installation work.\"",
  },
  {
    key: DET_BSEED_DEPT_SOURCE_KEY,
    jurisdictionKey: DET_KEYS.jurisdiction,
    title: "Buildings, Safety Engineering, and Environmental Department — City of Detroit",
    url: "https://detroitmi.gov/departments/buildings-safety-engineering-and-environmental-department-bseed",
    sourceType: "municipal_website",
    issuingAuthority:
      "City of Detroit, Buildings, Safety Engineering, and Environmental Department",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: DET_LAST_VERIFIED,
    lastVerifiedAt: DET_LAST_VERIFIED,
    notes:
      "Read 2026-09-25 (HTTP 200). The department's own description of what it issues (\"Apply for a Building Permit / Apply for a Electrical, Plumbing or Mechanical Permit\"), the division map, and the links to the permit portal (https://permits.detroitmi.gov) and the fee schedule this site charges from.",
  },
];

/** Empty on purpose: the permit types Detroit uses already exist as shared rows. */
const permitTypes: JurisdictionSeed["permitTypes"] = [];
const projectTypes: JurisdictionSeed["projectTypes"] = [];

const jurisdictionPermitTypes: SeedJurisdictionPermitType[] = [
  {
    jurisdictionKey: DET_KEYS.jurisdiction,
    permitTypeKey: "building",
    isAvailable: true,
    localName: "Building permit",
    officialUrl:
      "https://detroitmi.gov/departments/buildings-safety-engineering-and-environmental-department-bseed/building-permits",
    notes:
      "Nine bands on project cost (design and construction cost): $271.43 flat at $2,000 or less, then each band's printed Base plus its own rate per $1,000 \"or fraction thereof\" over the threshold. The ladder excludes demolition, which the schedule prices by cubic volume on its own page. Plan review rides on top at 7% per trade and a 35% deposit (called 30% in the next sentence) and is named, never summed.",
  },
  {
    jurisdictionKey: DET_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    isAvailable: true,
    localName: "Electrical permit",
    officialUrl:
      "https://detroitmi.gov/departments/buildings-safety-engineering-and-environmental-department-bseed/trade-permits",
    notes:
      "PART A opens with a flat $66 base fee — the schedule's note says it does not apply to a permit containing only Part B items — then $20 per circuit, fixtures at $1.17 residential / $1.46 commercial, and one of eight service bands chosen by custom.amperage within a voltage class selected by custom.over_1000_volts. Requires a City of Detroit licensed Electrician; published turnaround 2 days.",
  },
  {
    jurisdictionKey: DET_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    isAvailable: true,
    localName: "Plumbing permit",
    officialUrl:
      "https://detroitmi.gov/departments/buildings-safety-engineering-and-environmental-department-bseed/trade-permits",
    notes:
      "$73 application fee marked \"Non-Refundable\" and credited nowhere in the schedule, then $44 per listed item on the schedule's own catch-all row, $146 per building drain or sewer, and $176 per re-inspection behind custom.re_inspection. Requires a City of Detroit licensed Plumbing Contractor; published turnaround 1 day.",
  },
];

const feeSchedules: SeedFeeSchedule[] = [
  {
    key: DET_KEYS.feeSchedule,
    jurisdictionKey: DET_KEYS.jurisdiction,
    sourceKey: DET_FEE_SCHEDULE_SOURCE_KEY,
    title:
      "City of Detroit BSEED Fee Schedule (effective January 1, 2024, modified July 18, 2025)",
    officialUrl:
      "https://detroitmi.gov/sites/detroitmi.localhost/files/2025-12/Fee%20Schedule.Effective_January_1_2024_Modified%20July%2018%2C%202025.pdf",
    effectiveFrom: DET_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: DET_LAST_VERIFIED,
    notes:
      "The document the Building Permit Fees page links as the current download, headed \"EFFECTIVE, JANUARY 1, 2024\" and \"Modified 7/18/2025\" on all 51 pages. Read 2026-09-25 in three pdftotext modes; -table is the pairing these figures come from, because -layout and plain both mis-pair labels with amounts in this document.",
  },
];

function attach(permitTypeKey: string, rules: SeedFeeRule["rule"][]): SeedFeeRule[] {
  return rules.map((rule) => ({
    jurisdictionKey: DET_KEYS.jurisdiction,
    permitTypeKey,
    scheduleKey: DET_KEYS.feeSchedule,
    rule,
  }));
}

const feeRules: SeedFeeRule[] = [
  ...attach("building", DET_BUILDING_RULES),
  ...attach("electrical", DET_ELECTRICAL_RULES),
  ...attach("plumbing", DET_PLUMBING_RULES),
];

const requirements: SeedRequirement[] = [
  {
    jurisdictionKey: DET_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "document",
    title: "One application through the Accela portal, with plans in ProjectDox",
    description:
      "Applications run through the City's permit portal at https://permits.detroitmi.gov across the seven-step process the building permits page publishes, with plans uploaded to ProjectDox — the City's \"ePLANS\" workflow. The published turnaround times are 5 days for residential and 20 days for commercial permits, and the application help line is (313) 224-3179.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: DET_BUILDING_PERMITS_SOURCE_KEY,
    lastVerifiedAt: DET_LAST_VERIFIED,
  },
  {
    jurisdictionKey: DET_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "document",
    title: "Sealed drawings by a Michigan-registered architect or engineer, three sets",
    description:
      "The construction page's own submittal list: sealed drawings by a professional registered in Michigan, three sets plus calculations and specifications, a site plan, and a geotechnical report where one applies — alongside the codes in force (Michigan Building/Residential/Rehabilitation Codes and the rest). This changes what must be submitted, not what the permit costs.",
    isMandatory: true,
    sortOrder: 20,
    sourceKey: DET_CONSTRUCTION_SOURCE_KEY,
    lastVerifiedAt: DET_LAST_VERIFIED,
  },
  {
    jurisdictionKey: DET_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "license",
    title: "A licensed contractor for residential work, or an owner filing with deed and ID",
    description:
      "The building permits page states the rule per permit type: residential contractors need a Builder's License and City registration, while for commercial building permits the page states \"No license required\". Trade work is different — it always needs the trade's own City licence (see the electrical and plumbing requirements), and an owner filing for their own property brings the deed and a photo ID.",
    isMandatory: false,
    sortOrder: 30,
    sourceKey: DET_BUILDING_PERMITS_SOURCE_KEY,
    lastVerifiedAt: DET_LAST_VERIFIED,
  },
  {
    jurisdictionKey: DET_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "zoning_review",
    title: "Plan review covers zoning and every Michigan code the division lists",
    description:
      "BSEED's plan review page defines the review as \"verification of compliance to City of Detroit Zoning Ordinance, Michigan Building Code, Michigan Residential Code, Michigan Rehabilitation Code, Michigan Electrical Code, Michigan Mechanical Code, Michigan Plumbing Code, International Fuel Gas Code, City Elevator Code and Boiler Code\", done through ePLANS against the published checklists, with a Pre-Plan Consultation available before filing. The schedule charges for this review three ways — 7% per trade, a 35% building/structural/zoning deposit, and $158 + $53 a sheet for revised plans — none of which this site sums.",
    isMandatory: true,
    sortOrder: 40,
    sourceKey: DET_PLAN_REVIEW_SOURCE_KEY,
    lastVerifiedAt: DET_LAST_VERIFIED,
  },
  {
    jurisdictionKey: DET_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "license",
    title: "A City of Detroit licensed Electrician",
    description:
      "The trade permits page's own words: a trade permit requires a \"City of Detroit licensed Electrician\". An owner may file for their own property with the deed and a photo ID in hand. The published turnaround for electrical trade permits is 2 days, and the trade's inspection team can be reached at 313-224-3228.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: DET_TRADE_PERMITS_SOURCE_KEY,
    lastVerifiedAt: DET_LAST_VERIFIED,
  },
  {
    jurisdictionKey: DET_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "other",
    title: "Fire alarm work rides the Fire Marshal's permit, but the trade permit still applies",
    description:
      "The construction inspection division's own update: \"No separate building permit is required solely for fire alarm systems when a Fire Marshal permit has been issued for the building, structure or premises … Trade permits (electrical, mechanical, etc.) are still required for applicable installation work.\" So the fire alarm system is permitted under the Fire Marshal while the electrical trade permit covers the installation work — a carve-out from the building permit, not from this one.",
    isMandatory: false,
    sortOrder: 20,
    sourceKey: DET_INSPECTION_SOURCE_KEY,
    lastVerifiedAt: DET_LAST_VERIFIED,
  },
  {
    jurisdictionKey: DET_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    requirementType: "license",
    title: "A City of Detroit licensed Plumbing Contractor",
    description:
      "The trade permits page requires a \"City of Detroit licensed Plumbing Contractor\" for the permit; an owner filing for their own property brings the deed and a photo ID instead. The published turnaround for plumbing trade permits is 1 day, and the plumbing desk is 313-224-3118.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: DET_TRADE_PERMITS_SOURCE_KEY,
    lastVerifiedAt: DET_LAST_VERIFIED,
  },
  {
    jurisdictionKey: DET_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    requirementType: "inspection",
    title: "Inspections scheduled in Accela, and a re-inspection costs $176 when the visit fails",
    description:
      "Inspections are scheduled through the portal or at the Construction Division office, and the division's page describes the Certificate of Occupancy / Certificate of Acceptance procedure with a 72-hour turnaround. The schedule prices the failed visit itself: \"Re-inspection Fee (Work not ready, no access, etc.) — Per re-inspection — $176\", which this site charges only when custom.re_inspection says one is being counted.",
    isMandatory: true,
    sortOrder: 20,
    sourceKey: DET_INSPECTION_SOURCE_KEY,
    lastVerifiedAt: DET_LAST_VERIFIED,
  },
];

const profile: SeedProfile = {
  jurisdictionKey: DET_KEYS.jurisdiction,
  headline: "What construction permits cost in Detroit",
  summary:
    "Detroit prices construction permits three different ways inside one 51-page fee schedule. The building permit is a nine-band ladder on the project's own cost — $271.43 flat at $2,000 or less, then each band's printed Base plus a rate per $1,000 \"or fraction thereof\" over the threshold. The electrical permit is a $66 Part A base fee plus $20 a circuit, $1.17 or $1.46 a fixture, and one of eight service bands chosen by amperage and voltage class. The plumbing permit is a $73 non-refundable application fee plus $44 per listed item and $146 per building drain or sewer. Plan review is charged as a percentage on top and is named on every page, never summed into a total.",
  localContext:
    "**One department, one portal, a very long document.** The **Buildings, Safety Engineering, and Environmental Department (BSEED)** issues building permits, demolition permits and every trade permit from the Coleman A. Young Municipal Center, 2 Woodward Ave, Suite 408 (general customer service (313) 224-3202; application help (313) 224-3179). Applications run through **Accela at permits.detroitmi.gov**, with plans uploaded to ProjectDox — the City's \"ePLANS\" workflow — across a seven-step process. The City publishes its turnaround times: 5 days for residential building permits, 20 for commercial, and 1, 2 and 1 days for the mechanical, electrical and plumbing trade permits.\n\n**The fee schedule is one 51-page PDF, and extraction is the hard part.** Its header reads \"EFFECTIVE, JANUARY 1, 2024\" and \"Modified 7/18/2025\", and every figure on this site comes from that document read in `pdftotext -table` mode — the first two modes mis-pair labels with amounts in this file, pushing the fee column away from the rows it belongs to. The Building Permit Fees page links it as the current download, which is how it was told from the older schedules still sitting on the domain: a 2009 general fee schedule still prints a 30% refund deduction where the current document says 35%.\n\n**Plan review is charged three ways and none of the three is in a total here.** \"A fee is charged for Electrical, Mechanical and Plumbing plan review. This fee must be prepaid when a plan review is required\" — each trade is **7% \"of Bldg. Permit Fee\"**. Building, structural and zoning review is a **deposit of 35%** of the building permit fee, and two sentences later the same paragraph calls it \"The deposit of 30% Building Permit fee is adjustable towards the full fee when a final building permit is procured\". Revised plans are $158 for the first three sheets and $53 each after, per discipline. A cross-permit percentage whose base a stand-alone trade permit does not have, a deposit stated two ways, and a sheet count this site does not collect: named with their amounts, charged as none of them.",
  valuationBasis:
    "**Project cost, in the schedule's own words.** \"The following general building permit fees are based on the project cost (design and construction cost) estimated using the square foot cost table copy attached\" — so the basis is money the reader declares, and the band is chosen by it. That square-foot cost table is named as attached and appears in no page of the PDF, nor linked from any City page read on 2026-09-25: the basis is unambiguous, the City's own estimator is unpublished, and this site says so rather than reproducing a table it has not seen.\n\n**Every rate row rounds up.** \"Per $1,000 or fraction thereof over $N\" prints on all eight rate rows, so the cost above a band's threshold is rounded up to a whole $1,000 before the rate applies: $2,000.01 pays the $271.43 base plus one full $34.09 step — $305.52 — not 34 cents of a step. The first band is the floor stated as a row (\"$2,000 or less — Flat — $271.43\"), so a $500 repair permit is $271.43 with no minimum applied to any other row.\n\n**The bands do not chain, so they are not chained here.** Each band's printed Base is close to what the band below produces at its top, minus a seam: $271.43 + 23 × $34.09 = $1,055.50 against the printed $1,055.57 (7¢), widening to $26.67 at $50,000,000. Every band is modelled with its own printed Base and its own printed rate.\n\n**Demolition is a different basis entirely** — cubic volume, not money: $143 without a basement and $249 with one up to 30,000 cubic feet, then the Detroit Demolition Wrecking Fee's ladder and $8,858 with explosives. The ladder refuses work_type = demolition for that reason rather than pricing a wrecking job from a construction valuation.",
  notIncluded:
    "These figures are Detroit's building, electrical and plumbing permit fees from the schedule in force. They are not a total project cost, and they exclude:\n\n- **Plan review, all three of its published forms** — 7% of the building permit fee per trade (electrical, mechanical, plumbing, prepaid), the building/structural/zoning deposit at 35% (called 30% two sentences later), and $158 for the first three sheets plus $53 per sheet for revised plans. Each is named with its amount and the reason it is not summed.\n- **Refunds and their deductions** — 35% of the building permit fee, 25% of any permit capped at $100 — plus the 10% delinquent service charge and the $35 returned-check fee.\n- **Demolition and wrecking**, priced on cubic volume in its own section of the schedule.\n- **The rest of the electrical section**: rough inspections ($59), electrical units by nameplate HP/kW ($29–$254), interruptible service, panel boards and transfer switches, hardwired cooking equipment, feeders, underfloor headers, motion picture apparatus, sign connections, neon tubing and residential smoke alarms — and all of Part B, the $176/hour repairs and special inspections, service reconnects, fire alarm systems, EV charging, telecommunications cabling and renewable energy.\n- **The rest of the plumbing section**: the $53 \"Manhole, Catch Basin\" row whose relationship to the $146 row is not stated, medical gas ($176/hour), water distribution ($66) and water service ($88), and the hourly inspection and survey rows.\n- **The whole mechanical block** — pressure vessels, power and process piping, hazardous gases, boilers, gas-fired equipment, fire suppression, refrigeration.\n- **Change of Use** ($249), revised permits ($187 minimum plus the difference between the new and old fee), sign permits, zoning and site plan review ($210 / $466), certificates of occupancy ($147), temporary certificates ($520), permit extensions ($227), \"fail to obtain permit\" and \"fail to gain access\" charges, property maintenance, dangerous buildings and vacant property, and Parts A–C of the schedule (the licence and examination catalogue).\n- **Water and sewer permits** (Water & Sewerage Department) and **right-of-way permits** (Department of Public Works) — other authorities' charges.\n- **The square-foot cost table** the City estimates project cost from: named as attached, published nowhere this pass could reach.",
  seoTitle: "Detroit MI construction permit fees",
  seoDescription:
    "How Detroit prices building, electrical and plumbing permits — a nine-band ladder on project cost from $271.43, a $66 electrical base fee with $20 circuits and amperage-banded services, and a $73 non-refundable plumbing application fee plus per-item rates.",
  publishStatus: "published",
  noindex: false,
  lastReviewedAt: DET_LAST_VERIFIED,
};

const permitPages: SeedPermitPage[] = [
  {
    jurisdictionKey: DET_KEYS.jurisdiction,
    permitTypeKey: "building",
    slug: "building-permit-cost",
    title: "Detroit building permit cost",
    intro:
      "Detroit prices a building permit from the project's own cost — \"the project cost (design and construction cost)\" — across nine printed bands rather than one rate. A project of $2,000 or less is $271.43 flat: the ladder's floor. Above that, every band states a Base for the first slice of cost and a rate of so many dollars per $1,000 \"or fraction thereof\" over the band's threshold — $34.09 per $1,000 in the $2,000 to $25,000 band, $27.82 between $100,000 and $500,000, down to $1.81 above $50,000,000. Because \"or fraction thereof\" is printed on every rate row, the cost above each threshold rounds up to a whole $1,000 step: a $2,000.01 project pays for a full $1,000. Demolition is not on this ladder at all — the schedule prices wrecking by cubic volume — and plan review, which the schedule charges as a percentage on top, is named here rather than summed.",
    localSummary:
      "The ladder has seams, and they are the schedule's own. Each band's printed Base is close to — but not exactly — what the band below produces at its top: $271.43 plus 23 steps of $34.09 is $1,055.50 against the printed $1,055.57, a seven-cent gap that widens to $26.67 by the top band. This site charges the printed figure of whichever band the project falls in rather than chaining the arithmetic, because the document's numbers are the document's numbers.\n\nThree of the City's own charges sit outside this total and inside the same document: plan review at 7% per trade, the 35% (or, two sentences later, 30%) deposit on building, structural and zoning review, and $158 plus $53 a sheet for revised plans. BSEED issues the permit through the Accela portal with plans in ProjectDox, and publishes turnaround times of 5 days for residential permits and 20 for commercial.",
    notIncluded:
      "This is the schedule's nine-band building ladder only. It excludes:\n\n- **Plan review, all three of its published forms** — 7% \"of Bldg. Permit Fee\" for each trade plan review (prepaid), the building/structural/zoning deposit at 35% of the building permit fee (called \"The deposit of 30%\" two sentences later), and $158 for the first three sheets plus $53 per sheet for revised plans. The first needs a permit fee a building permit has but quotes a base the schedule never disambiguates, the second is stated two ways, and the third needs a sheet count this calculator does not collect — so none is summed and all three are named.\n- **Refunds and their deductions** — 35% of the building permit fee for a building-permit refund, 25% of any permit capped at $100, requests open for one year from issuance — plus the 10% delinquent service charge and the $35 returned-check fee.\n- **Demolition and wrecking**, priced on cubic volume: $143 without a basement and $249 with one up to 30,000 cubic feet, then the Detroit Demolition Wrecking Fee's own ladder, with explosives at $8,858.\n- **Change of Use** ($249), revised permits ($187 minimum plus the difference between the new and old permit fee), temporary permits for trailers, tents and retail sales, and the special-event inspection rows.\n- **Sign permits**, zoning fees and site plan review ($210 minor / $466 major), certificates of occupancy ($147), temporary certificates ($520), permit extensions ($227), consultation meetings ($190), and the $176 \"fail to obtain permit\" and \"fail to gain access\" charges.\n- **Water and sewer permits** (Water & Sewerage Department) and **right-of-way permits** (Department of Public Works) — other authorities' charges.\n- **The square-foot cost table** the City estimates project cost from — named as \"attached\" to the schedule and published nowhere this pass could reach on 2026-09-25.",
    workedExample: {
      scenario:
        "A gut renovation of a 1920s duplex with $180,000 of declared project cost — design plus construction — and no demolition involved.",
      inputs: {
        valuationCents: 18_000_000,
        workType: "remodel",
        occupancy: "residential",
      },
      notes:
        "$180,000 falls in the fourth band, \"Over $100,000 but not over $500,000\": $80,000 of project cost sits above the band's threshold, which is 80 whole $1,000 steps at the printed $27.82 — $2,225.60 — added to the band's printed Base of $2,895.29, for $5,120.89 of building permit fee. Nothing else on the ladder touches this figure: no clamp, no minimum, no add-on row.\n\nThe boundaries show why the bands are charged as printed rather than chained. At exactly $25,000 the second band computes $271.43 + 23 × $34.09 = $1,055.50; one cent later the third band takes over at its printed $1,055.57 base plus one rounded-up $24.53 step — $1,080.10. And a $500 permit is $271.43, because \"$2,000 or less — Flat — $271.43\" is the floor stated as a row. Set the work type to demolition and every band is excluded rather than repriced: wrecking is priced by cubic volume on a different page of the same schedule.",
    },
    faqs: [
      {
        question: "How much is a building permit in Detroit?",
        answer:
          "It depends on the project's cost, across nine printed bands. A project of $2,000 or less is $271.43 — the ladder's floor. Above that, each band adds a rate per $1,000 of project cost over the band's threshold to that band's printed Base: $271.43 plus $34.09 per $1,000 over $2,000 in the second band, $2,895.29 plus $27.82 per $1,000 over $100,000 in the fourth, and $271,433.32 plus $1.81 per $1,000 over $50,000,000 in the last. A $180,000 renovation is $5,120.89.",
        sourceId: DET_FEE_SCHEDULE_SOURCE_KEY,
        attribution:
          "BSEED Fee Schedule, \"A: BUILDING and RESIDENTIAL PERMITS\", effective 1/1/2024 as modified 7/18/2025.",
      },
      {
        question: "Does the fee round up to the next $1,000 of project cost?",
        answer:
          "Yes. Every rate row in the ladder prints \"or fraction thereof\", so the cost above a band's threshold is rounded up to a whole $1,000 before the rate is applied: a $2,000.01 project is the $271.43 base plus one full $34.09 step — $305.52 — not $271.46. The phrase is on all eight rate rows of the schedule, which is what makes this a rounding ladder rather than a multiplication.",
        sourceId: DET_FEE_SCHEDULE_SOURCE_KEY,
        attribution:
          "BSEED Fee Schedule, band rows each reading \"Per $1,000 or fraction thereof over $N\".",
      },
      {
        question: "What is the project cost based on?",
        answer:
          "The schedule's own words: \"the project cost (design and construction cost) estimated using the square foot cost table copy attached\". That table is named as attached to the printed schedule and appears in no page of the 51-page PDF, nor was it linked from any City page read on 2026-09-25 — so this site takes the basis (project cost) as published and does not reproduce an estimator the City has not published.",
        sourceId: DET_FEE_SCHEDULE_SOURCE_KEY,
        attribution:
          "BSEED Fee Schedule, sentence introducing the building permit table; the table itself was not reachable.",
      },
      {
        question: "How much is a demolition permit?",
        answer:
          "Not from this ladder. Detroit prices wrecking on cubic volume — $143 without a basement and $249 with one up to 30,000 cubic feet, then the Detroit Demolition Wrecking Fee's own ladder ($238; $319 plus $66 per 10,000 cubic feet; $425 plus $35 above 60,000), with explosives at $8,858 — so this site excludes demolition from the valuation bands rather than pricing a wrecking job from a construction value.",
        sourceId: DET_FEE_SCHEDULE_SOURCE_KEY,
        attribution: "BSEED Fee Schedule, demolition and wrecking section.",
      },
      {
        question: "Is plan review charged on top of the permit fee?",
        answer:
          "Yes, in three published forms, and none is included in this total. Electrical, mechanical and plumbing plan review are each 7% \"of Bldg. Permit Fee\", prepaid when review is required; building, structural and zoning review is a deposit of 35% of the building permit fee, described two sentences later as \"The deposit of 30% Building Permit fee is adjustable towards the full fee\"; revised plans are $158 for the first three sheets plus $53 each, per discipline. The schedule prints both 35% and 30% for the deposit, and this page charges neither figure.",
        sourceId: DET_FEE_SCHEDULE_SOURCE_KEY,
        attribution: "BSEED Fee Schedule, \"F: PLAN REVIEW\" and the deposit paragraph that follows it.",
      },
      {
        question: "How do I apply, and how long does review take?",
        answer:
          "Through the City's permit portal at permits.detroitmi.gov, with plans uploaded to ProjectDox — the City's \"ePLANS\" workflow — across the seven-step process the building permits page publishes. The published turnaround times are 5 days for residential permits and 20 days for commercial ones, and the application help line is (313) 224-3179. Residential contractors need a Builder's License and City registration; an owner may file for their own property with the deed and a photo ID.",
        sourceId: DET_BUILDING_PERMITS_SOURCE_KEY,
        attribution: "City of Detroit Building Permits page, read 2026-09-25.",
      },
    ],
    seoTitle: "Detroit MI building permit cost",
    seoDescription:
      "Detroit building permit fees — a nine-band ladder on project cost: $271.43 flat at $2,000 or less, then a printed base plus a rate per $1,000 or fraction thereof, rounding up at every threshold.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: DET_LAST_VERIFIED,
  },
  {
    jurisdictionKey: DET_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    slug: "electrical-permit-cost",
    title: "Detroit electrical permit cost",
    intro:
      "Detroit's electrical permit is a base fee plus an itemised price list. PART A opens with a flat $66 — the schedule's \"Base fee\", which its own note says does not apply to a permit containing only Part B items — and then prices what is on the permit: $20 for each circuit (new, extended, altered or removed), $1.17 per fixture on residential work or $1.46 on commercial work, and one of eight bands for the service itself. The service band is chosen by two facts the reader declares: the voltage class (six bands at 1,000 volts or less from $59 at 100 amps or under to $820 over 1,200 amps, and two bands above 1,000 volts at $281 and $422) and the amperage within it, so exactly one row can fire. A 200-amp service, four circuits and six fixtures under a $66 base fee is $270.02.",
    localSummary:
      "Two declared facts pick the service band and they gate each other: the amperage selects within a voltage class, and custom.over_1000_volts selects the class — the six low-voltage rows each require the flag absent or false, the two high-voltage rows require it true, so one permit can never pay two service rows. Fixture price follows occupancy: residential work is $1.17 a fixture, and everything else — including a permit that declares no occupancy at all — is $1.46, the larger figure being this site's default wherever a schedule splits a row without defining the split.\n\nWhat the section does not price is named rather than dropped: rough inspections ($59 for one- and two-family dwellings), electrical units by nameplate horsepower ($29 to $254), distribution panel boards and transfer switches, feeders, signs, neon tubing and smoke alarms, and all of Part B — the $176-per-hour repairs and special inspections, service reconnects, fire alarm systems, EV charging, cabling and renewables. Trade permits require a City-licensed electrician, and the published turnaround is 2 days.",
    notIncluded:
      "This is the schedule's PART A rows — base fee, circuits, fixtures and service bands. It excludes:\n\n- **Part A rows not modelled**: A2 rough inspections ($59 for one- and two-family dwellings), A4 electrical units and equipment replacements by nameplate HP/kW/kVA in seven bands ($29 to $254), A6 interruptible service ($53), A7 distribution panel boards, switchboards and transfer switches by amperage ($51 to $322), A8 hardwired cooking equipment, dryers and water heaters ($45), A9 feeders ($41 per 100 feet or fraction), A10 underfloor headers ($70), A11 motion picture apparatus ($70), A12 sign connections ($22), A13 outline neon ($59 per 25 feet) and A14 residential smoke alarms ($2.81).\n- **All of Part B** — general repairs and special inspections at $176 per hour, service reconnect inspections ($86 up to 200 A, $106 to 400 A, $190 above), multi-family and commercial rough inspections by the hour, the industrial/commercial annual permit, fire alarm systems, EV charging stations, telecommunications cabling and renewable energy installations. This is what the base fee's note carves out: \"Base Fee does not apply to a permit containing only Part B items.\"\n- **Plan review** — electrical plan review is 7% \"of Bldg. Permit Fee\", prepaid when a review is required, and is not part of any total here.\n- **The fire alarm carve-out**: \"No separate building permit is required solely for fire alarm systems when a Fire Marshal permit has been issued … Trade permits (electrical, mechanical, etc.) are still required\" — the Fire Marshal's permit is another authority's charge.\n- **Trade and business licences, certificates, temporary wiring's extra B2 fee, and Parts A–C** of the schedule.",
    workedExample: {
      scenario:
        "A service upgrade to 200 amps at 1,000 volts or less, plus four circuits and six fixtures for a residential remodel, all on one electrical permit.",
      inputs: {
        occupancy: "residential",
        fixtures: 6,
        custom: { circuits: 4, amperage: 200, over_1000_volts: false },
      },
      notes:
        "The stack is the section read top to bottom: the $66 PART A base fee, four circuits at $20 ($80.00), six residential fixtures at $1.17 ($7.02), and the service — 200 amps at 1,000 volts or less is the schedule's \"Over 100 to 200 amperes\" band, $117. Total: $270.02. Nothing is prorated or rounded anywhere in this section; every row is a flat published amount times a count.\n\nThe two switches move exactly one line each. Declare no occupancy and the six fixtures take the commercial $1.46 row instead — $8.76 rather than $7.02, for $271.76 in total. Set the service above 1,000 volts and the same 200 amps take the high-voltage table at $281 rather than $117. Remove the amperage and no service row fires at all — eight bands are gated and none defaults — while the base fee, circuits and fixtures still compute.",
    },
    faqs: [
      {
        question: "How much is an electrical permit in Detroit?",
        answer:
          "PART A starts with a flat $66 base fee, then the work is itemised: $20 per circuit (new, extended, altered or removed), $1.17 per fixture residential or $1.46 commercial, and one service band chosen by the service's voltage class and amperage. Four circuits, six fixtures and a 200-amp service on one permit is $270.02 including the base fee.",
        sourceId: DET_FEE_SCHEDULE_SOURCE_KEY,
        attribution: "BSEED Fee Schedule, ELECTRICAL section, PART A, read in -table mode 2026-09-25.",
      },
      {
        question: "How much is a 200-amp service upgrade?",
        answer:
          "$117 at 1,000 volts or less — the schedule's \"Over 100 to 200 amperes\" band. Above 1,000 volts the same service takes the high-voltage table instead: 200 amps or less is $281, and over 200 amps is $422. The six low-voltage bands run $59, $117, $176, $293, $527 and $820, so a 400-amp service is $176 and an 800-amp one is $293.",
        sourceId: DET_FEE_SCHEDULE_SOURCE_KEY,
        attribution: "BSEED Fee Schedule, \"A5: SERVICE\", both voltage tables.",
      },
      {
        question: "How much per circuit and per fixture?",
        answer:
          "$20 for each circuit — \"New or Extended, Altered or Removed\" — and $1.17 per fixture on residential work or $1.46 on commercial work. The fixture split is the schedule's own two rows (\"A3: FIXTURES - RESIDENTIAL\" and \"A3: FIXTURES - COMMERCIAL (Luminaires)\"), and when no occupancy is declared this site charges the commercial figure, which is the larger one. Floodlights or lamps of 1,000 watts or more are redirected by the schedule to its electrical-units row, which is named on this site's page and not modelled.",
        sourceId: DET_FEE_SCHEDULE_SOURCE_KEY,
        attribution: "BSEED Fee Schedule, rows A1 and A3.",
      },
      {
        question: "Does the $66 base fee apply to every electrical permit?",
        answer:
          "Every permit containing Part A items — which is what this page prices. The schedule's own note is precise: \"Base Fee does not apply to a permit containing only Part B items\", Part B being the hourly repairs, special inspections, reconnects, fire alarm, EV charging and cabling rows. The schedule never says whether $66 is charged per permit or per application, so this site charges it once per permit and says so rather than assuming.",
        sourceId: DET_FEE_SCHEDULE_SOURCE_KEY,
        attribution: "BSEED Fee Schedule, PART A base fee and the Part B note beneath it.",
      },
      {
        question: "Do I need a licensed electrician to get one?",
        answer:
          "A trade permit requires a \"City of Detroit licensed Electrician\", in the trade permits page's own words — and an owner filing for their own property brings the deed and a photo ID instead. The published turnaround for electrical trade permits is 2 days, and the electrical inspection team can be reached at 313-224-3228.",
        sourceId: DET_TRADE_PERMITS_SOURCE_KEY,
        attribution: "City of Detroit Trade Permits page, read 2026-09-25.",
      },
      {
        question: "Is a fire alarm system permitted with a separate building permit?",
        answer:
          "No — but it still needs this permit. The construction inspection division states: \"No separate building permit is required solely for fire alarm systems when a Fire Marshal permit has been issued for the building, structure or premises … Trade permits (electrical, mechanical, etc.) are still required for applicable installation work.\" The fire alarm work rides the Fire Marshal's permit; the electrical trade permit covers the installation.",
        sourceId: DET_INSPECTION_SOURCE_KEY,
        attribution: "BSEED Construction Inspection page, fire alarm permitting update.",
      },
    ],
    seoTitle: "Detroit MI electrical permit cost",
    seoDescription:
      "Detroit electrical permit fees — a $66 PART A base fee plus $20 per circuit, $1.17/$1.46 per fixture and service bands from $59 to $820 by amperage and voltage class.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: DET_LAST_VERIFIED,
  },
  {
    jurisdictionKey: DET_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    slug: "plumbing-permit-cost",
    title: "Detroit plumbing permit cost",
    intro:
      "Detroit prices a plumbing permit as an application fee plus a short list. The \"Application Fee (Non-Refundable)\" is $73 and is credited nowhere in the schedule, so it is its own line rather than a floor paid toward the permit. After that everything is a count: $44 for each item on the schedule's own catch-all row — stack, sump, interceptor, pump, fixture, appliance, \"plus any other … not specifically listed\" — and $146 for each building drain or sewer, sanitary, storm or combined. A re-inspection is $176 when the work is not ready or there is no access. Five items and one drain connection is $439.00 in total.",
    localSummary:
      "Two counts, two namespaces: the $44 catch-all row reads fixtures and the $146 drain-and-sewer row reads connections, so five fixtures and one drain is billed as five and one rather than six of either. The schedule's very next line prices \"Manhole, Catch Basin\" at $53 beneath the $146 row that already lists manhole and catch basin, and never states whether that is a separate scope or a restatement — so only the unambiguous $146 row is modelled, and the $53 question is recorded rather than guessed.\n\nThe application fee is the other thing worth saying out loud: \"Non-Refundable\" is printed on it, and nothing in the 51-page document credits it toward the permit fee, so a filer who abandons an application loses all of it. The re-inspection fee is $176 and appears only when one is actually being counted, and the published turnaround for plumbing trade permits is 1 day.",
    notIncluded:
      "This is the schedule's PLUMBING INSTALLATION PERMITS block — application fee, the $44 catch-all row, the $146 drain/sewer row and the re-inspection. It excludes:\n\n- **The $53 \"Manhole, Catch Basin\" row**, which sits directly beneath a $146 row that already lists manhole and catch basin; the schedule never states whether it is a separate scope or a partial restatement, so it is not added to a total this site publishes.\n- **Medical gas systems** ($176 for the first hour, $88 per half-hour after), **water distribution systems** ($66 each) and **water service from the curb stop** ($88 each).\n- **The hourly inspection and survey rows** — unlisted inspection services and the plumbing survey/cross-connection control inspection at $176 the first hour and $88 per half-hour after — and the special-inspection failure charge ($176).\n- **Plan review** — plumbing plan review is 7% \"of Bldg. Permit Fee\", prepaid when a review is required, and is not part of any total here; the building/structural/zoning deposit (35%, called 30% two sentences later) is a building-permit charge.\n- **The whole mechanical block** — unfired pressure vessels, power and process piping, hazardous gases, boilers, gas-fired equipment, fire suppression and refrigeration.\n- **Water and sewer permits** (Water & Sewerage Department) and **right-of-way permits** (Department of Public Works): other authorities' charges.",
    workedExample: {
      scenario:
        "A kitchen and bath remodel: five items on the catch-all row and one building drain connection, with no re-inspection.",
      inputs: {
        fixtures: 5,
        custom: { connections: 1 },
      },
      notes:
        "The schedule read top to bottom: the $73 non-refundable application fee, five items at $44 ($220.00), and one building drain or sewer at $146 — $439.00 in total. The application fee is charged as its own line because the schedule credits it nowhere: \"Non-Refundable\" is printed on it and no paragraph in the document applies it toward the permit fee.\n\nCount a re-inspection and the same permit is $615.00 — the $176 is the schedule's \"Work not ready, no access\" charge for the failed visit, not a price of the permit. The $53 \"Manhole, Catch Basin\" row is deliberately not added: it sits directly beneath the $146 row that already lists manhole and catch basin, and the schedule never says whether it is a separate scope or a restatement of the same work.",
    },
    faqs: [
      {
        question: "How much is a plumbing permit in Detroit?",
        answer:
          "$73 to apply, then the work itemised: $44 per listed item — stack, sump, interceptor, pump, fixture, appliance and the schedule's own catch-all \"any other … not specifically listed\" — and $146 per building drain or sewer. Five items and one drain connection is $439.00, and a re-inspection, if one is needed, is $176.",
        sourceId: DET_FEE_SCHEDULE_SOURCE_KEY,
        attribution: "BSEED Fee Schedule, PLUMBING / INSTALLATION PERMITS, effective 1/1/2024 as modified 7/18/2025.",
      },
      {
        question: "Is the $73 application fee refundable or credited toward the permit?",
        answer:
          "Neither. The schedule prints it as \"Application Fee (Non-Refundable)\" and credits it nowhere in 51 pages, so it is charged as its own line and stays at risk if the application is abandoned. Refunds elsewhere in the document deduct 35% of the building permit fee or 25% of other permits (capped at $100), and must be requested within a year of issuance — none of which turns the application fee into a payment toward the permit.",
        sourceId: DET_FEE_SCHEDULE_SOURCE_KEY,
        attribution: "BSEED Fee Schedule, plumbing application fee row and the REFUNDS block.",
      },
      {
        question: "What counts as one $44 item?",
        answer:
          "The row's own list: \"Stack, Stack Alteration (soil, waste, vent, conductor), Sump, Interceptor, Pump, Device, Plumbing Fixtures, Plumbing Appliance, Plumbing Appurtenance, Plus Any Other Fixture, Drain, Water Connected Appliance or Appurtenance Not specifically Listed\" — eight things named and then everything else of the kind, each at $44. Building drains and sewers are priced separately at $146 each.",
        sourceId: DET_FEE_SCHEDULE_SOURCE_KEY,
        attribution: "BSEED Fee Schedule, plumbing catch-all item row.",
      },
      {
        question: "How much is a re-inspection?",
        answer:
          "$176 per re-inspection — the schedule's \"Re-inspection Fee (Work not ready, no access, etc.)\" — charged when the inspector has to return because the work was not ready or there was no access. It is a fee for the failed visit rather than a price of the permit, so this site charges it only when a re-inspection is actually being counted.",
        sourceId: DET_FEE_SCHEDULE_SOURCE_KEY,
        attribution: "BSEED Fee Schedule, SPECIAL INSPECTION FEES, plumbing section.",
      },
      {
        question: "Do I need a licensed plumbing contractor to get one?",
        answer:
          "A trade permit requires a \"City of Detroit licensed Plumbing Contractor\", in the trade permits page's own words — and an owner filing for their own property brings the deed and a photo ID instead. The published turnaround for plumbing trade permits is 1 day, and the plumbing desk is 313-224-3118.",
        sourceId: DET_TRADE_PERMITS_SOURCE_KEY,
        attribution: "City of Detroit Trade Permits page, read 2026-09-25.",
      },
      {
        question: "Are the water and sewer permits in this total?",
        answer:
          "No. Water and sewer work is permitted by the City's Water & Sewerage Department and right-of-way work by the Department of Public Works — separate authorities with their own charges, which the City's building permits page points readers to. This page prices only the BSEED plumbing installation permit.",
        sourceId: DET_BUILDING_PERMITS_SOURCE_KEY,
        attribution: "City of Detroit Building Permits page, read 2026-09-25.",
      },
    ],
    seoTitle: "Detroit MI plumbing permit cost",
    seoDescription:
      "Detroit plumbing permit fees — a $73 non-refundable application fee, $44 per listed item, $146 per building drain or sewer and $176 per re-inspection.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: DET_LAST_VERIFIED,
  },
];

const verifications: SeedVerification[] = [
  {
    entityType: "source",
    entityKey: DET_FEE_SCHEDULE_SOURCE_KEY,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: DET_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: DET_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "Read 2026-09-25 in three pdftotext modes; -table is the pairing recorded, because -layout and plain both mis-pair labels with amounts in this document. Source of every figure this site charges: the nine-band ladder, the electrical PART A rows, the plumbing block, the plan-review percentages and the refunds deductions.",
  },
  {
    entityType: "source",
    entityKey: DET_FEES_DOC_PAGE_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: DET_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: DET_FEES_DOC_PAGE_SOURCE_KEY,
    notes:
      "Read 2026-09-25 (HTTP 200). The page that links the fee schedule as the current download, which is how the document in force was told from the older schedules still on the domain.",
  },
  {
    entityType: "source",
    entityKey: DET_BUILDING_PERMITS_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: DET_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: DET_BUILDING_PERMITS_SOURCE_KEY,
    notes:
      "Read 2026-09-25 (HTTP 200). Source of the seven-step process, the Accela/ProjectDox submission rules, the licence rule per permit type, the 5-day/20-day turnaround, and the hand-off to the Water & Sewerage Department and Public Works.",
  },
  {
    entityType: "source",
    entityKey: DET_TRADE_PERMITS_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: DET_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: DET_TRADE_PERMITS_SOURCE_KEY,
    notes:
      "Read 2026-09-25 (HTTP 200). Source of the licence sentence quoted on the electrical and plumbing pages, the owner deed-and-ID rule, and the 1/2/1-day trade turnarounds.",
  },
  {
    entityType: "source",
    entityKey: DET_CONSTRUCTION_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: DET_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: DET_CONSTRUCTION_SOURCE_KEY,
    notes:
      "Read 2026-09-25 (HTTP 200). Source of the submittal requirements — sealed drawings by a Michigan-registered professional, three sets, site plan, geotechnical report — and the codes in force. Publishes no amount.",
  },
  {
    entityType: "source",
    entityKey: DET_PLAN_REVIEW_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: DET_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: DET_PLAN_REVIEW_SOURCE_KEY,
    notes:
      "Read 2026-09-25 (HTTP 200). Source of the plan-review scope quoted on the building page — zoning ordinance plus every Michigan code the division lists — and of the ePLANS workflow behind the schedule's prepaid review fees.",
  },
  {
    entityType: "source",
    entityKey: DET_INSPECTION_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: DET_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: DET_INSPECTION_SOURCE_KEY,
    notes:
      "Read 2026-09-25 (HTTP 200). Source of the fire-alarm carve-out quoted on the electrical page and the CO/CoA procedure behind the plumbing inspection requirement.",
  },
  {
    entityType: "source",
    entityKey: DET_BSEED_DEPT_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: DET_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: DET_BSEED_DEPT_SOURCE_KEY,
    notes:
      "Read 2026-09-25 (HTTP 200). The department page that links the permit portal and the fee schedule, and states what BSEED issues.",
  },
  {
    entityType: "fee_schedule",
    entityKey: DET_KEYS.feeSchedule,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: DET_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: DET_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "Effective 2024-01-01 per the document's own header, \"EFFECTIVE, JANUARY 1, 2024\", as modified 7/18/2025 — both dates printed on all 51 pages. The Building Permit Fees page links this file as current on 2026-09-25; a 2009 schedule still on the domain was read only to confirm it is not the linked document (its refund sentence still says 30%).",
  },
  {
    entityType: "fee_rule",
    entityKey: "DET-BLD-BAND-4",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: DET_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: DET_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "\"Over $100,000 but not over $500,000 — First $100,000 Base $2,895.29; Per $1,000 or fraction thereof over $100,000 $27.82\", from the -table extraction where -layout mis-pairs the columns. Modelled with incrementCents = $1,000 because the phrase is printed, with threshold and base from this row alone rather than chained from the band below (the seam is 3¢ at this boundary). The demolition exclusion rides every band: wrecking is priced by cubic volume elsewhere in the same document.",
  },
  {
    entityType: "fee_rule",
    entityKey: "DET-ELEC-BASE",
    permitTypeKey: "electrical",
    status: "needs_review",
    method: "official_pdf_review",
    verifiedAt: DET_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: DET_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "The amount is certain — \"PART A / Base fee / Base / $66\" with \"NOTE: Base Fee does not apply to a permit containing only Part B items\" beneath it — and the exception is modelled by pricing Part A only and naming Part B. What the schedule never states is whether the $66 is per permit or per application: it prints no unit, so it is modelled as one charge per permit, which is what \"Base fee\" means everywhere else in this document. Flagged needs_review so the assumption stays visible rather than being read as the schedule's own words.",
  },
  {
    entityType: "fee_rule",
    entityKey: "DET-PLUMB-APPLICATION",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: DET_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: DET_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "\"Application Fee (Non-Refundable) — Flat — $73\", first row of PLUMBING / INSTALLATION PERMITS. Charged as its own line rather than as a floor because the schedule credits it nowhere in 51 pages — the opposite of a filing fee whose page says it applies toward the final fee. Unconditional: every plumbing installation permit pays it.",
  },
  {
    entityType: "fee_rule",
    entityKey: "DET-PLUMB-DRAIN",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: DET_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: DET_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "\"Building Drain, Building Sewer (sanitary, storm, manhole, catch basin, combined) each one — Each — $146\", read from custom.connections so it cannot collide with the fixtures count. The next line prices \"Manhole, Catch Basin\" at $53 beneath a row that already lists both, and the schedule never states the relationship (research §6) — so this row is modelled and the $53 one is named, not summed. The row itself is unambiguous.",
  },
  {
    entityType: "permit_page",
    entityKey: "building-permit-cost",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: DET_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: DET_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "The nine bands with their printed bases and rates, the round-up phrase, the demolition exclusion and the three plan-review charges named rather than summed. The worked example is arithmetic on the schedule: $80,000 above the threshold at 80 × $27.82 = $2,225.60 plus the printed $2,895.29 = $5,120.89 — and the page states both seam boundaries ($1,055.50 and $1,080.10) and the unpublished square-foot cost table rather than leaving them implicit.",
  },
  {
    entityType: "permit_page",
    entityKey: "electrical-permit-cost",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: DET_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: DET_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "The $66 base with its Part B note, circuits, both fixture rows and all eight service bands gated by amperage and voltage class. The worked example is arithmetic on the schedule: $66 + 4 × $20 + 6 × $1.17 + $117 = $270.02, with the commercial-default ($271.76) and high-voltage ($281) alternatives stated beside it. The per-permit-vs-per-application reading of the base fee is carried as the payload's needs_review record.",
  },
  {
    entityType: "permit_page",
    entityKey: "plumbing-permit-cost",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: DET_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: DET_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "The $73 non-refundable application fee, the $44 catch-all row, the $146 drain/sewer row and the $176 re-inspection. The worked example is arithmetic on the schedule: $73 + 5 × $44 + $146 = $439.00, with the re-inspection total ($615.00) and the unmodelled $53 manhole row both stated rather than folded in.",
  },
  {
    entityType: "jurisdiction_profile",
    entityKey: DET_KEYS.jurisdiction,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: DET_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: DET_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "Hub content built from the schedule in force, read in three pdftotext modes, and the seven service pages for process, licences and portal facts. The plan-review percentages, the deposit's contradictory 35%/30% pair, the $53 manhole row, the unpublished square-foot cost table and the base fee's per-permit reading are each named as open questions in the research record and on the pages rather than resolved by guess.",
  },
];

export const detroitSeed: JurisdictionSeed = {
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
export const DET_PUBLISHED_PERMIT_PAGES = detroitSeed.permitPages.filter(
  (page) => page.publishStatus === "published" && !page.noindex,
);
