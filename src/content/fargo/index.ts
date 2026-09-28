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
  FARGO_BUILDING_EFFECTIVE_FROM,
  FARGO_COMMERCIAL_PAGE_SOURCE_KEY,
  FARGO_COMMERCIAL_SCHEDULE_SOURCE_KEY,
  FARGO_COMMERCIAL_BUILDING_RULES,
  FARGO_COMMERCIAL_PLAN_REVIEW,
  FARGO_ELECTRICAL_PAGE_SOURCE_KEY,
  FARGO_ELECTRICAL_RULES,
  FARGO_FEE_INDEX_SOURCE_KEY,
  FARGO_NDSEB_EFFECTIVE_FROM,
  FARGO_NDSEB_SOURCE_KEY,
  FARGO_PLUMBING_EFFECTIVE_FROM,
  FARGO_PLUMBING_PAGE_SOURCE_KEY,
  FARGO_PLUMBING_RULES,
  FARGO_PLUMBING_SCHEDULE_SOURCE_KEY,
  FARGO_RESIDENTIAL_PAGE_SOURCE_KEY,
  FARGO_RESIDENTIAL_BUILDING_RULES,
  FARGO_RESIDENTIAL_SCHEDULE_SOURCE_KEY,
  FARGO_SHARED_FLAT_RULES,
  FARGO_UNPERMITTED_COMMERCIAL_RULES,
  FARGO_UNPERMITTED_RESIDENTIAL_RULES,
  FARGO_UNPERMITTED_SHARED_RULES,
} from "./fee-rules";

export * from "./fee-rules";

/**
 * The complete Fargo, North Dakota seed payload.
 *
 * Every figure traces to research/north-dakota/fargo.md, which traces to the Inspections
 * Department's own three fee PDFs on download.fargond.gov (two printed Effective January
 * 1, 2026, one Effective January 1, 2025), the Department's pages on fargond.gov, and the
 * North Dakota State Electrical Board's Inspection Fees page — the source that exists
 * because Fargo publishes no electrical schedule of its own, an absence the City's own
 * fee-schedule index proves. Nothing is estimated.
 *
 * Three pages, all published: building, electrical and plumbing. The two building sheets
 * are separate schedules split by one fact (the sheet's own "(one- and two-family
 * dwellings)" scope line), every ladder band after the first rounds up because the sheets
 * print "or fraction thereof" in every one of them, and the commercial sheet's own
 * 25-cent discontinuity at $50,000 is charged as printed and asserted from both sides.
 */

const RESEARCHER = "Permit Fee Intelligence research pass 14 (North Dakota)";

export const FARGO_LAST_VERIFIED = "2026-09-25";

export const FARGO_KEYS = {
  state: "nd",
  county: "cass-county",
  jurisdiction: "fargo",
  residentialSchedule: "fargo-residential-building-fees",
  commercialSchedule: "fargo-commercial-building-fees",
  plumbingSchedule: "fargo-plumbing-permit-fees",
  electricalSchedule: "fargo-ndseb-inspection-fees",
} as const;

const state: SeedState = {
  code: "ND",
  slug: "north-dakota",
  name: "North Dakota",
  fipsCode: "38",
};

const county: SeedCounty = {
  key: FARGO_KEYS.county,
  slug: "cass-county",
  name: "Cass County",
  fipsCode: "38017",
};

const jurisdiction: SeedJurisdiction = {
  key: FARGO_KEYS.jurisdiction,
  stateKey: FARGO_KEYS.state,
  countyKey: FARGO_KEYS.county,
  type: "city",
  slug: "fargo",
  name: "Fargo",
  officialName: "City of Fargo",
  websiteUrl: "https://fargond.gov/",
  permitPortalUrl: "https://fargond.gov/city-government/departments/inspections/residential-permits-fees",
  timezone: "America/Chicago",
  isActive: true,
};

const departments: SeedDepartment[] = [
  {
    key: "fargo-inspections-department",
    jurisdictionKey: FARGO_KEYS.jurisdiction,
    kind: "building",
    name: "City of Fargo — Inspections Department",
    phone: null,
    email: null,
    url: "https://fargond.gov/city-government/departments/inspections",
    addressLine: null,
    hours: null,
    notes:
      "The Department issues every permit this site prices and publishes its own fee documents: two building sheets on download.fargond.gov, a plumbing schedule, a Building Permit Fee Calculator beside both building pages, and — on the City Code page — the Department's own fee-schedule index. That index is where the electrical answer lives: it lists residential building fees, heating, plumbing, sign and code-enforcement schedules, and no electrical entry at all, because the North Dakota State Electrical Board bills the installer instead. Contact facts are the Department's pages rather than a letterhead line, which is why no phone number is recorded here.",
  },
];

const sources: SeedSource[] = [
  {
    key: FARGO_RESIDENTIAL_SCHEDULE_SOURCE_KEY,
    jurisdictionKey: FARGO_KEYS.jurisdiction,
    title: "City of Fargo — Residential Building Permit Fees (one- and two-family dwellings)",
    url: "https://download.fargond.gov/0/2026_residential_fees.pdf",
    sourceType: "fee_schedule_pdf",
    issuingAuthority: "City of Fargo — Inspections Department",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: FARGO_BUILDING_EFFECTIVE_FROM,
    retrievedAt: FARGO_LAST_VERIFIED,
    lastVerifiedAt: FARGO_LAST_VERIFIED,
    notes:
      "Read 2026-09-25 as the Department's own one-page PDF, printed \"Effective January 1, 2026\" on its face. Transcribed in full: the three-band ladder ($50.00 flat to $1,000; $5.56 for each additional $1,000 \"or fraction thereof\" to $100,000; $600.44 then $3.06 above it), the flat rows (demolition $100/$50, house moving $300/$50/$150, Board of Appeals $150), the hourly items, and the work-begin-without-a-permit table with this sheet's own floors ($550 and $2,000). Extracted with pdftotext -table, which pairs each valuation with its fee cleanly.",
  },
  {
    key: FARGO_COMMERCIAL_SCHEDULE_SOURCE_KEY,
    jurisdictionKey: FARGO_KEYS.jurisdiction,
    title: "City of Fargo — Commercial Building Permit and Plan Review Fees",
    url: "https://download.fargond.gov/0/2026_commercial_fees.pdf",
    sourceType: "fee_schedule_pdf",
    issuingAuthority: "City of Fargo — Inspections Department",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: FARGO_BUILDING_EFFECTIVE_FROM,
    retrievedAt: FARGO_LAST_VERIFIED,
    lastVerifiedAt: FARGO_LAST_VERIFIED,
    notes:
      "Read 2026-09-25 as the Department's own one-page PDF, printed \"Effective January 1, 2026\". Transcribed in full: the seven-band ladder ($55.00 flat; then $12.75, $8.70, $6.14, $4.99, $4.87 and $4.64 per additional $1,000 \"or fraction thereof\" with printed bases $55.00, $361.00, $578.75, $885.75, $2,881.75 and $5,316.75), the plan-review line (20% of the attributable building permit fee, $50 minimum, \"when a plan review is required\"), the same flat rows as the residential sheet, and the same unpermitted table with this sheet's floors ($980 and $2,500). The sheet's own arithmetic is discontinuous by 25 cents at $50,000 — band 3 computes $578.50 there while band 4 prints $578.75 — and both figures are kept.",
  },
  {
    key: FARGO_PLUMBING_SCHEDULE_SOURCE_KEY,
    jurisdictionKey: FARGO_KEYS.jurisdiction,
    title: "City of Fargo — Schedule for Plumbing & Sanitary or Storm Sewer Permits",
    url: "https://download.fargond.gov/0/plumbing_permit_fees_-_effective_january_1_2025.pdf",
    sourceType: "fee_schedule_pdf",
    issuingAuthority: "City of Fargo — Inspections Department",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: FARGO_PLUMBING_EFFECTIVE_FROM,
    retrievedAt: FARGO_LAST_VERIFIED,
    lastVerifiedAt: FARGO_LAST_VERIFIED,
    notes:
      "Read 2026-09-25 as the Department's own two-page PDF, printed \"Effective January 1, 2025\". Transcribed in full: Water Heating Permits $35.00; Inside Plumbing Permits \"Minimum Fee $50.00 (includes up to 5 fixtures or traps) (each fixture or trap over 5 is $10.00 each)\"; the four sewer rows ($125.00 original, $70.00 disconnect, $30.00 additional line, $75.00 repair); Lawn Sprinkler System $40.00; the hourly other-inspection list; and the closing pair — \"Permit fees will be charged for all government projects\" and \"Double fees for all work commenced without a permit. In case of an emergency, a permit must be taken out within 48 hours after commencement of work.\"",
  },
  {
    key: FARGO_RESIDENTIAL_PAGE_SOURCE_KEY,
    jurisdictionKey: FARGO_KEYS.jurisdiction,
    title: "City of Fargo — Residential Permit & Fees",
    url: "https://fargond.gov/city-government/departments/inspections/residential-permits-fees",
    sourceType: "municipal_website",
    issuingAuthority: "City of Fargo — Inspections Department",
    authorityKind: "city",
    isPrimary: false,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: FARGO_LAST_VERIFIED,
    lastVerifiedAt: FARGO_LAST_VERIFIED,
    notes:
      "Read 2026-09-25 as the Department's own page, carrying \"Effective January 1, 2026\" and linking the two building PDFs, the Building Permit Fee Calculator and the trade subpages (plumbing, electrical self-wire). The page is this jurisdiction's index to the residential side of the split, and the calculator beside it takes project type and estimated value only — the fee tables are what it computes from.",
  },
  {
    key: FARGO_COMMERCIAL_PAGE_SOURCE_KEY,
    jurisdictionKey: FARGO_KEYS.jurisdiction,
    title: "City of Fargo — Commercial Building Permits & Fees (the valuation rules)",
    url: "https://fargond.gov/city-government/departments/inspections/commercial-building-permits-fees",
    sourceType: "municipal_website",
    issuingAuthority: "City of Fargo — Inspections Department",
    authorityKind: "city",
    isPrimary: false,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: FARGO_LAST_VERIFIED,
    lastVerifiedAt: FARGO_LAST_VERIFIED,
    notes:
      'Read 2026-09-25, stamped "Effective January 1, 2026" and "Content Updated January 2026". The source for this site\'s valuation section: applicants provide the valuation split into Building Valuation and Parking Lot Valuation; "The Inspections Department uses the current International Code Council (ICC) building valuation data as a guide for calculating permit valuations, less 15% for local area considerations"; valuations are reviewed at submission and before issuance, and "The Building Official makes the final valuation determination as required in the building code."',
  },
  {
    key: FARGO_PLUMBING_PAGE_SOURCE_KEY,
    jurisdictionKey: FARGO_KEYS.jurisdiction,
    title: "City of Fargo — Plumbing permits",
    url: "https://fargond.gov/city-government/departments/inspections/residential-permits-fees/plumbing",
    sourceType: "municipal_website",
    issuingAuthority: "City of Fargo — Inspections Department",
    authorityKind: "city",
    isPrimary: false,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: FARGO_LAST_VERIFIED,
    lastVerifiedAt: FARGO_LAST_VERIFIED,
    notes:
      'Read 2026-09-25, undated. The process page behind the plumbing schedule: the ND State Plumbing Code, a licensed contractor for the street-to-building sewer and water, all underground work inspected and tested before cover, a final inspection after fixtures are set — and the sentence that keeps the trades apart, "Any building, electrical or mechanical work requires permits separate from plumbing permits."',
  },
  {
    key: FARGO_ELECTRICAL_PAGE_SOURCE_KEY,
    jurisdictionKey: FARGO_KEYS.jurisdiction,
    title: "City of Fargo — Electrical Self-Wire (the City takes the application; NDSEB bills the fee)",
    url: "https://fargond.gov/city-government/departments/inspections/residential-permits-fees/electrical-self-wire",
    sourceType: "municipal_website",
    issuingAuthority: "City of Fargo — Inspections Department",
    authorityKind: "city",
    isPrimary: false,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: FARGO_LAST_VERIFIED,
    lastVerifiedAt: FARGO_LAST_VERIFIED,
    notes:
      'Read 2026-09-25, undated — and the page that explains why this jurisdiction\'s electrical page is priced by the state: only the owner-occupant of a single-family home may self-wire (not rentals, day cares or mobile homes; everything else by a licensed contractor), the inspector determines "the value of the work done" at rough-in, and "the North Dakota State Electrical Board (NDSEB) will be notified of the value of work done and NDSEB will bill applicable fees to the homeowner."',
  },
  {
    key: FARGO_FEE_INDEX_SOURCE_KEY,
    jurisdictionKey: FARGO_KEYS.jurisdiction,
    title: "City of Fargo — City Code page: the Department's own fee-schedule index",
    url: "https://fargond.gov/work/doing-business/city-code",
    sourceType: "municipal_website",
    issuingAuthority: "City of Fargo",
    authorityKind: "city",
    isPrimary: false,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: FARGO_LAST_VERIFIED,
    lastVerifiedAt: FARGO_LAST_VERIFIED,
    notes:
      'Read 2026-09-25 as the index that answers the electrical question by not answering it: it links Residential Building Fees, the Heating Permit Fee Schedule, the Plumbing Permit Fee Schedule, the Sign Permit Fee Schedule and the Code Enforcement Fee Schedule — and there is no electrical entry. An absence proved from the City\'s own listing is why the electrical page is built on the state board\'s table instead of an invented city fee.',
  },
  {
    key: FARGO_NDSEB_SOURCE_KEY,
    jurisdictionKey: FARGO_KEYS.jurisdiction,
    title: "North Dakota State Electrical Board — Inspection Fees",
    url: "https://www.ndseb.com/inspections/inspection-fees/",
    sourceType: "state_agency",
    issuingAuthority: "North Dakota State Electrical Board",
    authorityKind: "state",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: FARGO_NDSEB_EFFECTIVE_FROM,
    retrievedAt: FARGO_LAST_VERIFIED,
    lastVerifiedAt: FARGO_LAST_VERIFIED,
    notes:
      'Read 2026-09-25 as the board\'s own page, printing "Effective July 1, 2024" above the current table and the superseded table beneath it — the rare source that dates its own change. Both job-cost bands are transcribed from it (up to $500.00 → $50.00 minimum; $500.00 to $20,000.00 → $50.00 plus 2% on the balance; over $20,000.00 → $440.00 plus 1/10 of 1% on the balance), with the basis sentence ("the total amount of the contract or total cost to the owner, including extras"), the four exclusions (appliances, HVAC units, electric motors/PLC/generators, industrial machines), the $50.00 late-certificate increase, the $50.00 correction-order administration charge and the $50.00-per-hour special services.',
  },
];

/** Empty on purpose: the permit types Fargo uses already exist as shared rows. */
const permitTypes: JurisdictionSeed["permitTypes"] = [];
const projectTypes: JurisdictionSeed["projectTypes"] = [];

const jurisdictionPermitTypes: SeedJurisdictionPermitType[] = [
  {
    jurisdictionKey: FARGO_KEYS.jurisdiction,
    permitTypeKey: "building",
    isAvailable: true,
    localName: "Building permit — residential sheet or commercial sheet, by construction class",
    officialUrl:
      "https://fargond.gov/city-government/departments/inspections/commercial-building-permits-fees",
    notes:
      'Two sheets, decided by the sheet\'s own scope line: the residential one is titled "(one- and two-family dwellings)" and the commercial one covers everything else, so one fact — whether the job is on a one- or two-family dwelling — picks the schedule. Both are ladders on total valuation that round the cost up in whole $1,000 steps; only the commercial sheet prints a plan-review line.',
  },
  {
    jurisdictionKey: FARGO_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    isAvailable: true,
    localName: "Electrical permit — priced by the state board; the City publishes no fee",
    officialUrl:
      "https://fargond.gov/city-government/departments/inspections/residential-permits-fees/electrical-self-wire",
    notes:
      "Fargo's own fee-schedule index links no electrical schedule, and the self-wire page says where the money goes: the inspector sets the value of the work at rough-in and NDSEB bills the homeowner. The figures here are the board's two job-cost bands and its $50 late-certificate increase, all as state fees with the board as the source.",
  },
  {
    jurisdictionKey: FARGO_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    isAvailable: true,
    localName: "Plumbing permit — itemized schedule, fixtures and sewer lines",
    officialUrl: "https://fargond.gov/city-government/departments/inspections/residential-permits-fees/plumbing",
    notes:
      'A price list rather than a valuation ladder: the inside-permit\'s $50 base including five fixtures with $10 each after, the four sewer-line rows at $125/$70/$30/$75, water heating at $35 and lawn sprinklers at $40 — and "Double fees for all work commenced without a permit" as the schedule\'s own penalty line. No plumbing rule on this site reads a cost.',
  },
];

const feeSchedules: SeedFeeSchedule[] = [
  {
    key: FARGO_KEYS.residentialSchedule,
    jurisdictionKey: FARGO_KEYS.jurisdiction,
    sourceKey: FARGO_RESIDENTIAL_SCHEDULE_SOURCE_KEY,
    title: "City of Fargo — Residential Building Permit Fees (one- and two-family dwellings)",
    officialUrl: "https://download.fargond.gov/0/2026_residential_fees.pdf",
    effectiveFrom: FARGO_BUILDING_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: FARGO_LAST_VERIFIED,
    notes:
      'The dated instrument: "Effective January 1, 2026" printed on the sheet. Three bands, every band after the first printing "or fraction thereof" — the phrase this schedule rounds up on — plus the flat rows and the unpermitted-work table with the residential floors.',
  },
  {
    key: FARGO_KEYS.commercialSchedule,
    jurisdictionKey: FARGO_KEYS.jurisdiction,
    sourceKey: FARGO_COMMERCIAL_SCHEDULE_SOURCE_KEY,
    title: "City of Fargo — Commercial Building Permit and Plan Review Fees",
    officialUrl: "https://download.fargond.gov/0/2026_commercial_fees.pdf",
    effectiveFrom: FARGO_BUILDING_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: FARGO_LAST_VERIFIED,
    notes:
      'Also "Effective January 1, 2026". Seven bands with the same round-up phrase, the plan-review line (20% with $50 minimum), and the 25-cent discontinuity at $50,000 that the sheet computes into its own printed bases.',
  },
  {
    key: FARGO_KEYS.plumbingSchedule,
    jurisdictionKey: FARGO_KEYS.jurisdiction,
    sourceKey: FARGO_PLUMBING_SCHEDULE_SOURCE_KEY,
    title: "City of Fargo — Schedule for Plumbing & Sanitary or Storm Sewer Permits",
    officialUrl: "https://download.fargond.gov/0/plumbing_permit_fees_-_effective_january_1_2025.pdf",
    effectiveFrom: FARGO_PLUMBING_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: FARGO_LAST_VERIFIED,
    notes:
      'Printed "Effective January 1, 2025". Itemized rows rather than bands — fixtures, sewer lines, sprinklers, water heating — with the fixture allowance stated as a base that "includes up to 5 fixtures or traps", and the doubling line at the foot of the schedule.',
  },
  {
    key: FARGO_KEYS.electricalSchedule,
    jurisdictionKey: FARGO_KEYS.jurisdiction,
    sourceKey: FARGO_NDSEB_SOURCE_KEY,
    title: "North Dakota State Electrical Board — Inspection Fees (the only published electrical dollars)",
    officialUrl: "https://www.ndseb.com/inspections/inspection-fees/",
    effectiveFrom: FARGO_NDSEB_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: FARGO_LAST_VERIFIED,
    notes:
      "Not a City schedule — there is none, and the City's own fee-schedule index proves it. This row carries the board's \"Effective July 1, 2024\" date and holds the two job-cost bands and the late-certificate increase that an electrical permit in Fargo is actually billed against.",
  },
];

function attach(permitTypeKey: string, rules: SeedFeeRule["rule"][], scheduleKey: string): SeedFeeRule[] {
  return rules.map((rule) => ({
    jurisdictionKey: FARGO_KEYS.jurisdiction,
    permitTypeKey,
    scheduleKey,
    rule,
  }));
}

const feeRules: SeedFeeRule[] = [
  // The residential sheet: three ladder bands, the flat rows both sheets print (sourced
  // to this sheet), the doubled band, and this sheet's two unpermitted floors.
  ...attach("building", FARGO_RESIDENTIAL_BUILDING_RULES, FARGO_KEYS.residentialSchedule),
  ...attach("building", FARGO_SHARED_FLAT_RULES, FARGO_KEYS.residentialSchedule),
  ...attach("building", FARGO_UNPERMITTED_SHARED_RULES, FARGO_KEYS.residentialSchedule),
  ...attach("building", FARGO_UNPERMITTED_RESIDENTIAL_RULES, FARGO_KEYS.residentialSchedule),
  // The commercial sheet: seven ladder bands, its plan-review line, its two floors.
  ...attach("building", FARGO_COMMERCIAL_BUILDING_RULES, FARGO_KEYS.commercialSchedule),
  ...attach("building", [FARGO_COMMERCIAL_PLAN_REVIEW], FARGO_KEYS.commercialSchedule),
  ...attach("building", FARGO_UNPERMITTED_COMMERCIAL_RULES, FARGO_KEYS.commercialSchedule),
  // The trades.
  ...attach("electrical", FARGO_ELECTRICAL_RULES, FARGO_KEYS.electricalSchedule),
  ...attach("plumbing", FARGO_PLUMBING_RULES, FARGO_KEYS.plumbingSchedule),
];

const requirements: SeedRequirement[] = [
  {
    jurisdictionKey: FARGO_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "Which sheet answers is one fact: the residential sheet is titled \"(one- and two-family dwellings)\"",
    description:
      'The two fee sheets are different documents rather than one schedule split into columns, and each says who it covers on its face — the residential sheet\'s parenthetical scope line and the commercial sheet\'s title do the splitting. The Department publishes both, both stamped Effective January 1, 2026, and the calculator beside them takes project type and estimated value as its two inputs. This site keeps the same discipline: one fact picks the sheet, and the two ladders never answer the same input together.',
    isMandatory: true,
    sortOrder: 10,
    sourceKey: FARGO_RESIDENTIAL_PAGE_SOURCE_KEY,
    lastVerifiedAt: FARGO_LAST_VERIFIED,
  },
  {
    jurisdictionKey: FARGO_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "The valuation is the applicant's, taken from the ICC table less 15% and finalized by the Building Official",
    description:
      'The commercial page prints the process: applicants provide the valuation split into Building Valuation and Parking Lot Valuation; "The Inspections Department uses the current International Code Council (ICC) building valuation data as a guide for calculating permit valuations, less 15% for local area considerations"; valuations are reviewed at submission and before issuance, and "The Building Official makes the final valuation determination as required in the building code." This site takes the resulting number as its input — the ICC-minus-15% derivation is the Department\'s, named on the pages rather than re-run here. No fee sheet read prices the Parking Lot Valuation separately, which the record keeps as an open question.',
    isMandatory: true,
    sortOrder: 20,
    sourceKey: FARGO_COMMERCIAL_PAGE_SOURCE_KEY,
    lastVerifiedAt: FARGO_LAST_VERIFIED,
  },
  {
    jurisdictionKey: FARGO_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "document",
    title: "Plan review is charged when a plan review is required — and only the commercial sheet prices it",
    description:
      'The commercial sheet\'s own line: "Plan Review: All projects when a plan review is required. Twenty (20) percent of the attributable building permit fee. Minimum fee $50." The condition is the sheet\'s, so the fact that plans are required is the rule\'s gate; the percentage reads the permit fee, and the $50 floor binds below a $250 permit. The residential sheet prints no plan-review line at all — an absence this site records as an absence rather than assuming a residential charge nobody printed.',
    isMandatory: false,
    sortOrder: 30,
    sourceKey: FARGO_COMMERCIAL_SCHEDULE_SOURCE_KEY,
    lastVerifiedAt: FARGO_LAST_VERIFIED,
  },
  {
    jurisdictionKey: FARGO_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "license",
    title: "Electrical work is by a licensed contractor — or by the owner-occupant of a single-family home, under the self-wire rules",
    description:
      'The self-wire page states the eligibility precisely: only the owner-occupant of a single-family home may do the work themselves — not rentals, day cares or mobile homes — and all other work goes to a licensed contractor, with electricians licensed by the North Dakota State Electrical Board (the City\'s own "Selecting a Contractor" page repeats the point). The application is taken by the City either way.',
    isMandatory: true,
    sortOrder: 10,
    sourceKey: FARGO_ELECTRICAL_PAGE_SOURCE_KEY,
    lastVerifiedAt: FARGO_LAST_VERIFIED,
  },
  {
    jurisdictionKey: FARGO_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "other",
    title: "The inspector sets the value of the work at rough-in, and NDSEB bills the fee to the homeowner",
    description:
      'The self-wire page describes the flow this jurisdiction is built on: the inspector determines "the value of the work done" at rough-in, and "the North Dakota State Electrical Board (NDSEB) will be notified of the value of work done and NDSEB will bill applicable fees to the homeowner." That value — the contract or owner cost — is the basis of the state board\'s two bands on this site, with the four exclusions the board lists taken out of it first.',
    isMandatory: true,
    sortOrder: 20,
    sourceKey: FARGO_ELECTRICAL_PAGE_SOURCE_KEY,
    lastVerifiedAt: FARGO_LAST_VERIFIED,
  },
  {
    jurisdictionKey: FARGO_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    requirementType: "license",
    title: "A licensed contractor for the street-to-building sewer and water, under the ND State Plumbing Code",
    description:
      'The plumbing page\'s checklist: the work follows the ND State Plumbing Code, a licensed contractor is required for the street-to-building sewer and water runs, all underground work is inspected and tested before it is covered, and a final inspection follows once fixtures are set. The page\'s closing sentence keeps the permits apart — "Any building, electrical or mechanical work requires permits separate from plumbing permits" — so a plumbing permit on this site never stands in for the building permit beside it.',
    isMandatory: true,
    sortOrder: 10,
    sourceKey: FARGO_PLUMBING_PAGE_SOURCE_KEY,
    lastVerifiedAt: FARGO_LAST_VERIFIED,
  },
  {
    jurisdictionKey: FARGO_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    requirementType: "inspection",
    title: "Underground inspected and tested before cover, final after fixtures are set",
    description:
      'Two inspections the plumbing page requires: the underground work is inspected and tested before it is covered, and a final inspection comes after fixtures are set. The schedule prices neither inspection — its hourly "other inspection" items ($75.00 per hour with their minimums) are named on the page rather than charged, because this calculator does not collect hours.',
    isMandatory: true,
    sortOrder: 20,
    sourceKey: FARGO_PLUMBING_PAGE_SOURCE_KEY,
    lastVerifiedAt: FARGO_LAST_VERIFIED,
  },
  {
    jurisdictionKey: FARGO_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "Work begun before the permit is issued is priced by the sheet's own table — and the repeat-offence lines are quoted, not charged",
    description:
      'Both building sheets print the table under "Should work begin prior the issuance of necessary permits, the following fees will apply": the permit fee is doubled for $0–$50,000, 50% of the permit fee for $50,001–$500,000 (minimum $550 residential, $980 commercial), 25% above $500,000 (minimum $2,000 residential, $2,500 commercial). The first three are charged as they print. The fourth line — "Second offence within 180 days - $200 minimum; $100 for each additional violation subsequent" — needs a violation history this site does not collect, so it is quoted beside the charges rather than computed.',
    isMandatory: true,
    sortOrder: 40,
    sourceKey: FARGO_RESIDENTIAL_SCHEDULE_SOURCE_KEY,
    lastVerifiedAt: FARGO_LAST_VERIFIED,
  },
];

const profile: SeedProfile = {
  jurisdictionKey: FARGO_KEYS.jurisdiction,
  headline: "What construction permits cost in Fargo",
  summary:
    "Fargo prices construction on **two building sheets split by the sheet's own scope line** — one- and two-family dwellings on one, everything else on the other — an itemized plumbing schedule where no valuation is ever a fee basis, and electrical work whose dollars belong to the North Dakota State Electrical Board, because the City publishes no electrical schedule of its own. Both building ladders round the cost up in whole $1,000 steps; the commercial sheet's ladder carries a plan review at 20% with a $50 floor, and the residential sheet prints no plan review line at all.",
  localContext:
    'One department, three published schedules, and one honest absence. The Inspections Department serves its own fee PDFs — residential and commercial building sheets both stamped Effective January 1, 2026, a plumbing schedule stamped Effective January 1, 2025 — and beside them a Building Permit Fee Calculator whose inputs are project type and estimated value, because the tables are what it computes from. The City Code page carries the Department\'s fee-schedule index, and that index is the answer to the electrical question: it links residential building fees, heating, plumbing, sign and code-enforcement schedules, and no electrical entry. The self-wire page completes it — the inspector values the work at rough-in and "NDSEB will bill applicable fees to the homeowner".\n\nEvery band after the first on both building sheets prints "or fraction thereof", and that phrase is what this jurisdiction rounds on: $1,001 of residential valuation pays the $50.00 first thousand and a whole $5.56 step for the $1 fraction, not $0.0056 of it. The seams between bands close to the cent — $50.00 + 99 × $5.56 is exactly $600.44, the printed base of the sheet\'s third band — everywhere except one place, where the document disagrees with itself: the commercial sheet\'s band 3 computes $578.50 at $50,000 of valuation while band 4 prints its base as $578.75. Both numbers are charged as printed and both are asserted in the tests, the same way Las Cruces\'s own $100 discontinuity is kept rather than smoothed.\n\nThe valuation comes to this site from outside: the Department takes the applicant\'s figure, guides it by the ICC building valuation data "less 15% for local area considerations", reviews it twice, and lets the Building Official make the final determination. That derivation is named on the pages, not re-run here — and the commercial page\'s request for two valuation totals, building and parking lot, is kept as the open question it is, because no fee sheet read prices parking lots separately.',
  valuationBasis:
    "Three permits, three different measures — and one that measures nothing.\n\n**Building: total valuation, in whole-thousand steps.** Both sheets charge a ladder on the job's valuation, and both round the cost above each band's floor up to a whole $1,000 — the phrase \"or fraction thereof\" printed in every band after the first. The residential ladder runs $50.00 flat to $1,000, then $5.56 a thousand to $100,000, then $3.06 a thousand from a $600.44 base; the commercial ladder runs seven bands from $12.75 down to $4.64 a thousand over bases of $55.00 through $5,316.75. The valuation itself is the applicant's, guided by the ICC table less 15% and finalized by the Building Official — this site takes it as given.\n\n**Electrical: the contract or owner cost of the work.** NDSEB's basis sentence is \"the total amount of the contract or total cost to the owner, including extras\", less the four exclusions the board lists (appliances, HVAC units, electric motors/PLC/generators and industrial machines). The first band charges $50.00 and 2% of the balance above $500 to $20,000; above that, $440.00 and one tenth of one percent. The board's table prints no round-up phrase, so both rates are prorated.\n\n**Plumbing: no valuation at all.** The schedule prices counts and rows — fixtures over an allowance of five, sewer lines by what is being done, sprinklers and water heating flat — and no plumbing rule on this site reads a cost, so a plumbing total never changes because a job got more expensive.",
  notIncluded:
    "These figures are Fargo's own building, electrical and plumbing permit fees. They are not a project cost, and they exclude:\n\n- **The hourly items.** Both building sheets and the plumbing schedule price after-hours inspections at $75.00 per hour with their minimums, unspecified inspections and additional plan review at a half-hour minimum, and outside consultants at actual cost — priced by hours this calculator does not collect, quoted on the pages instead.\n- **The repeat-offence increments.** \"Second offence within 180 days - $200 minimum; $100 for each additional violation subsequent\" needs a violation history this site does not collect; the three valuation bands of the same table are charged, and this line is quoted.\n- **The heating, sign and code-enforcement schedules.** Separate fee schedules linked from the City's own index and named as separate permits; this pass publishes building, electrical and plumbing, and no figure from those schedules appears in any total here.\n- **The ICC-minus-15% valuation derivation.** The Department's calculation against the ICC table, taken as an input; producing the valuation from a construction type and a scope is the applicant's side of the exchange.\n- **NDSEB's exclusions, hourly special services and $50 correction-order charge.** The four cost exclusions belong to the job-cost figure the board bills against, and the $50.00-per-hour special services and $50.00 correction-order administration charge are quoted beside the two bands rather than charged by them.\n- **Water Permit to Connect and Tapping Fees.** A utility connection schedule linked from the plumbing page — tap charges are utility charges rather than permit fees.\n- **License fees and returned-check charges.** None of them is permitting, and none is charged.",
  seoTitle: "Fargo construction permit fees",
  seoDescription:
    "How Fargo prices construction permits — two building sheets split by the sheet's own scope line (rounding up in whole $1,000 steps), the itemized plumbing schedule, and electrical work billed by the North Dakota State Electrical Board because the City publishes no fee of its own.",
  publishStatus: "published",
  noindex: false,
  lastReviewedAt: FARGO_LAST_VERIFIED,
};

const permitPages: SeedPermitPage[] = [
  {
    jurisdictionKey: FARGO_KEYS.jurisdiction,
    permitTypeKey: "building",
    slug: "building-permit-cost",
    title: "Fargo building permit cost",
    intro:
      "A Fargo building permit is priced on **one of two sheets, chosen by the sheet's own title**: a one- or two-family dwelling pays a three-band ladder that starts at $50.00 and steps in whole $1,000 increments at $5.56 and then $3.06 a thousand — $600.44 buys the first $100,000 — while every other building pays a seven-band ladder from $12.75 down to $4.64 a thousand over bases that reach $5,316.75. Plan review rides beside the commercial ladder only: 20% of the permit fee when a plan review is required, with a $50 floor.",
    localSummary:
      'Which sheet answers is one fact, and the sheets are different documents rather than one schedule split into columns — the residential sheet says "(one- and two-family dwellings)" on its face and the commercial sheet covers everything else, both stamped Effective January 1, 2026.\n\nEvery band after the first on both sheets prints "or fraction thereof", so the cost above a band\'s floor is charged in whole $1,000 steps: $1,001 of residential valuation pays $50.00 plus a full $5.56 step, and $1,500 of commercial cost pays $55.00 plus one whole $12.75 step rather than a prorated $6.38. The bands close at every seam — $50.00 + 99 × $5.56 is exactly the $600.44 the third band prints, and $55.00 + 24 × $12.75 is exactly the $361.00 the third commercial band prints — with one deliberate exception the sheet itself contains: at $50,000 the commercial ladder computes $578.50 while the band above prints $578.75, and this site charges both figures as printed rather than reconciling them.\n\nPlan review is commercial-only and conditional: the sheet charges it "when a plan review is required", so the fact that plans are required gates it, the 20% reads the permit fee, and the $50 floor binds below a $250 permit fee. The residential sheet prints no plan-review line, and no residential rule charges one. Flat rows — demolition $100 (or $50 for buildings under 400 SF without utility services), house moving $300/$150/$50, Board of Appeals $150 — are added beside the permit as the sheets\' own totals add them, and work begun without a permit is priced by the table both sheets print.',
    notIncluded:
      "This is the Fargo building permit fee — the ladder the sheet answers with, the conditional plan review, the flat rows the job triggers, and the unpermitted-work surcharge when it applies. It excludes:\n\n- **The hourly items.** After-hours inspections at $75.00 per hour with a two-hour minimum, reinspection under IBC §§108–109, unspecified inspections and additional plan review at a half-hour minimum, and outside consultants at actual cost — hours this calculator does not collect.\n- **The repeat-offence line.** \"Second offence within 180 days - $200 minimum; $100 for each additional violation subsequent\" is printed beside the doubled band and needs a violation history; it is quoted, not computed.\n- **The other schedules on the City's index.** Heating, sign and code-enforcement permits have their own schedules and their own pages; nothing from them appears in a total here.\n- **The ICC-minus-15% valuation derivation.** The Department guides the applicant's valuation by the ICC table less 15% and the Building Official finalizes it; this site takes the resulting number as its input.\n- **Electrical, plumbing and mechanical permits.** Separate permits with separate schedules — the plumbing page says it plainly: \"Any building, electrical or mechanical work requires permits separate from plumbing permits.\"\n- **License fees and returned-check charges.** Not permitting, and not charged.",
    workedExample: {
      scenario:
        "A $40,000 commercial alteration with plans required for review — the commercial sheet's third band and its plan-review line.",
      inputs: {
        valuationCents: 4_000_000,
        occupancy: "commercial",
        workType: "alteration",
        custom: { one_two_family: false, plan_review: true },
      },
      notes:
        "The commercial sheet's third band prices this: \"$25,001.00 to $50,000.00 — $361.00 for the first $25,000.00 plus $8.70 for each additional $1,000.00, or fraction thereof, to and including $50,000.00\".\n\n$40,000 of valuation is $15,000 above the band's floor, and $15,000 is fifteen whole thousands: 15 × $8.70 = $130.50. Permit fee: $361.00 + $130.50 = $491.50.\n\nPlan review: twenty percent of that permit fee is $98.30 — above the sheet's $50 minimum, so the percentage is what is paid.\n\nTotal: $491.50 + $98.30 = $589.80. What moves it: the same $40,000 in a one- and two-family dwelling runs the residential ladder instead — $50.00 for the first $1,000 plus 39 whole thousands at $5.56 is $216.84, so $266.84 with no plan-review line at all, because the residential sheet prints none; without plans the review line disappears here too; and a job begun before the permit issued doubles the $491.50 below $50,000 of valuation.",
    },
    faqs: [
      {
        question: "How much is a building permit in Fargo?",
        answer:
          "It depends on the sheet. A one- or two-family dwelling pays $50.00 up to $1,000 of valuation, then $5.56 for each additional $1,000 or fraction of one to $100,000, then $3.06 a thousand above a $600.44 base. Any other building pays $55.00 up to $1,000, then $12.75, $8.70, $6.14, $4.99, $4.87 or $4.64 per $1,000 as the valuation rises through seven bands. Flat rows (demolition $100, house moving $300, a Board of Appeals filing $150) are added beside the permit when the job triggers them.",
        sourceId: FARGO_RESIDENTIAL_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "Why does the fee rise in whole $1,000 steps?",
        answer:
          "Because the sheets say so: every band after the first prints \"or fraction thereof\" after its per-$1,000 rate. The cost above each band's floor is rounded up to a whole $1,000 before it is multiplied — $1,001 of residential valuation pays one full $5.56 step for the $1 of fraction, and $1,500 of commercial cost pays one whole $12.75 step rather than a prorated $6.38.",
        sourceId: FARGO_COMMERCIAL_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "Is plan review included in the permit fee?",
        answer:
          "No — it is a separate line, and only on the commercial sheet: \"All projects when a plan review is required. Twenty (20) percent of the attributable building permit fee. Minimum fee $50.\" The percentage reads the permit fee the ladder computed, the $50 floor binds below a $250 permit fee, and the sheet's own condition means the line answers only when plans are required. The residential sheet prints no plan-review line.",
        sourceId: FARGO_COMMERCIAL_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "What does a demolition permit cost?",
        answer:
          "$100.00 — or $50.00 \"for buildings under 400 SF and buildings without utility services\", which the sheet requires both conditions for. House moving is its own row at $300.00 ($150.00 within the extraterritorial area, $50.00 on the same two-condition reduction), and a Board of Appeals filing is $150.00. These rows are added beside the ladder, never through it: the ladder bands exclude demolition work so the two never answer the same job.",
        sourceId: FARGO_RESIDENTIAL_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "What happens if work started before the permit was issued?",
        answer:
          "The sheet's own table applies: the permit fee is doubled for $0–$50,000 of valuation, 50% of the permit fee is added for $50,001–$500,000 (a $550 minimum on the residential sheet, $980 on the commercial), and 25% above $500,000 (minimums of $2,000 and $2,500 respectively). The repeat-offence line — $200 minimum for a second offence within 180 days, $100 for each violation after — is printed on the same row and quoted on this site rather than charged, because it needs a violation history.",
        sourceId: FARGO_RESIDENTIAL_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "Where does the valuation come from?",
        answer:
          "From the applicant, guided by the Department: \"The Inspections Department uses the current International Code Council (ICC) building valuation data as a guide for calculating permit valuations, less 15% for local area considerations.\" The valuation is reviewed at submission and again before issuance, and \"The Building Official makes the final valuation determination as required in the building code.\" This site takes that final number as its input.",
        sourceId: FARGO_COMMERCIAL_PAGE_SOURCE_KEY,
      },
    ],
    seoTitle: "Fargo building permit cost: two sheets, whole-$1,000 steps",
    seoDescription:
      "Fargo building permit fees — the residential ladder ($50 then $5.56 and $3.06 per $1,000, rounding up) and the commercial seven-band ladder ($12.75 down to $4.64 per $1,000), plan review at 20% with a $50 floor, and the flat rows each sheet prints.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: FARGO_LAST_VERIFIED,
  },
  {
    jurisdictionKey: FARGO_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    slug: "electrical-permit-cost",
    title: "Fargo electrical permit cost",
    intro:
      "A Fargo electrical permit has **no city fee at all** — the City's own fee-schedule index lists residential building, heating, plumbing, sign and code-enforcement schedules and no electrical entry, and the self-wire page says where the money goes instead: the inspector values the work at rough-in and \"the North Dakota State Electrical Board (NDSEB) will be notified of the value of work done and NDSEB will bill applicable fees to the homeowner.\" The published dollars are the board's, effective July 1, 2024: $50.00 minimum for a job cost to $500, 2% on the balance to $20,000, then $440.00 for the first $20,000 and one tenth of one percent after it.",
    localSummary:
      'The absence is documented rather than papered over: the Department\'s fee-schedule index — its own listing, on its own City Code page — links five schedules and none of them is electrical, so a city electrical fee would have to be invented to exist here. The self-wire page supplies the mechanism instead: the City takes the application, the inspector determines the value of the work at rough-in, and NDSEB bills the homeowner. Two bands of the board\'s table carry the whole calculation, prorated because the table prints no round-up phrase anywhere.\n\nThe bands close exactly: $50.00 plus 2% of the balance above $500 reaches $440.00 at a job cost of $20,000 — the figure the second band prints as its own base — and above that, one tenth of one percent runs on the balance. The board\'s basis is the total contract or owner cost including extras, less four exclusions it names: appliances, HVAC units, electric motors, PLCs, generators and industrial machines "need not be included in the cost". A wiring certificate filed late adds $50.00, a state board increase modelled beside the bands rather than folded into them.\n\nEverything electrical is therefore a state fee on this page, and the page says so in its first line — there is no City figure to misattribute, because none exists to read.',
    notIncluded:
      "This is the North Dakota State Electrical Board's inspection fee as an electrical permit in Fargo bills it. It excludes:\n\n- **The four exclusions the board lists.** Appliances, HVAC units, electric motors, PLCs, generators and industrial machines \"need not be included in the cost\" — they come out of the job cost before either band computes.\n- **The correction-order administration charge.** A correction order not completed in time is a $50.00 administration charge under the board's rules; it needs a correction order this calculator does not collect, and it is quoted beside the bands.\n- **Special services and mileage.** The board charges $50.00 per hour plus mileage for special services — priced by hours, quoted rather than charged.\n- **The City's application and process.** The City takes the self-wire application and runs the inspections; this total is the board's fee, which is the only published dollar figure either of them puts on the work.\n- **Heating, mechanical and plumbing permits.** Separate permits with separate schedules — the plumbing page states that building, electrical or mechanical work requires permits separate from plumbing permits, and each has its own page here.",
    workedExample: {
      scenario:
        "A kitchen remodel whose work the inspector values at $10,500 of contract cost — the board's first band.",
      inputs: {
        valuationCents: 1_050_000,
        custom: {},
      },
      notes:
        "The board's first band answers: \"$500.00 to $20,000.00 — $50.00 for the first $500.00 plus 2% on balance up to $20,000.00\".\n\nThe balance is $10,500 − $500 = $10,000, and 2% of $10,000 is $200.00. Total: $50.00 + $200.00 = $250.00.\n\nWhat moves it: at $500.00 and below, the balance is nothing and the $50.00 minimum is the whole fee — the printed \"Up to $500.00 — $50.00 (minimum fee)\" row; at $20,000.00 the same formula closes at exactly $440.00, the base the second band prints; and above that the balance is charged at one tenth of one percent, so a $40,000 job cost is $440.00 plus 0.1% of $20,000, or $460.00. A wiring certificate filed late adds $50.00. Before any of this computes, the four exclusions the board lists — appliances, HVAC units, electric motors/PLC/generators and industrial machines — come out of the job cost.",
    },
    faqs: [
      {
        question: "How much is an electrical permit in Fargo?",
        answer:
          "The fee is the state board's, not the City's: $50.00 for a job cost up to $500; above that, $50.00 plus 2% of the balance to $20,000 (closing at exactly $440.00); above $20,000, $440.00 for the first $20,000 plus one tenth of one percent of the balance. A wiring certificate filed late adds $50.00. The job cost is the total contract or owner cost including extras, less the four exclusions the board names.",
        sourceId: FARGO_NDSEB_SOURCE_KEY,
      },
      {
        question: "Why is there no City electrical permit fee?",
        answer:
          "Because Fargo publishes none — and the City proves it itself. The Department's fee-schedule index on the City Code page links the residential building, heating, plumbing, sign and code-enforcement schedules with no electrical entry, and the self-wire page explains the arrangement: the inspector values the work at rough-in, notifies NDSEB, and \"NDSEB will bill applicable fees to the homeowner.\" The board's table, effective July 1, 2024, is therefore what this page charges.",
        sourceId: FARGO_FEE_INDEX_SOURCE_KEY,
      },
      {
        question: "What is the job cost measured from?",
        answer:
          "The board's own basis: \"the total amount of the contract or total cost to the owner, including extras\" — which is also what the inspector sets at rough-in on the self-wire page. Four things are left out of it: appliances, HVAC units, electric motors, PLCs, generators and industrial machines \"need not be included in the cost\".",
        sourceId: FARGO_NDSEB_SOURCE_KEY,
      },
      {
        question: "Can a homeowner do their own electrical work?",
        answer:
          "Only in the self-wire case the City's page describes: the owner-occupant of a single-family home — not a rental, day care or mobile home — applies for the permit themselves. All other electrical work is by a licensed contractor, with electricians licensed by the North Dakota State Electrical Board.",
        sourceId: FARGO_ELECTRICAL_PAGE_SOURCE_KEY,
      },
      {
        question: "What does a late wiring certificate cost?",
        answer:
          "$50.00 more. The board's rules: whenever an electrical installation \"is commenced or in use without submitting an electrical wiring certificate the certificate may be considered late and the normal inspection fee … is increased in the amount of fifty dollars.\" It is charged as its own line beside the bands — a state board increase, which is what it is.",
        sourceId: FARGO_NDSEB_SOURCE_KEY,
      },
    ],
    seoTitle: "Fargo electrical permit cost: the state board's fee",
    seoDescription:
      "Fargo electrical permit fees — no City schedule exists, so the charge is NDSEB's: $50 minimum to $500 of job cost, 2% of the balance to $20,000 (closing at $440), then $440 plus 1/10 of 1%, with $50 for a late wiring certificate.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: FARGO_LAST_VERIFIED,
  },
  {
    jurisdictionKey: FARGO_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    slug: "plumbing-permit-cost",
    title: "Fargo plumbing permit cost",
    intro:
      "A Fargo plumbing permit is a **price list, not a valuation**: the inside-permit is $50.00 including up to five fixtures or traps with $10.00 each after, the four sewer-line rows run $125.00 for the original line into the building, $70.00 to disconnect, $30.00 for an additional line and $75.00 for a repair, water heating is $35.00 and a lawn sprinkler system $40.00. No row on the schedule reads a cost, and the schedule doubles every fee for work commenced without a permit.",
    localSummary:
      'The schedule prices lines, not valuations — each row answers the thing being done, and the inside-permit states its allowance in the base itself: "Minimum Fee $50.00 (includes up to 5 fixtures or traps) (each fixture or trap over 5 is $10.00 each)". Five fixtures are therefore $50.00, six are $60.00, and eight are $80.00 — the five are inside the base, not discounted after it.\n\nThe sewer rows are separate permits on separate facts: an original sanitary or storm sewer line into each building is $125.00, a disconnect is $70.00, an additional line into each building or to a manhole or catch basin is $30.00, and a repair or replacement is $75.00 — added beside the inside-permit as separate rows, never merged into it.\n\nThe foot of the schedule carries its own penalty and its own deadline: "Double fees for all work commenced without a permit. In case of an emergency, a permit must be taken out within 48 hours after commencement of work." The doubling is charged as a share of the plumbing permit fee this page computed; the 48-hour window is a deadline rather than a charge and is quoted here. The page beside the schedule also keeps the trades apart — "Any building, electrical or mechanical work requires permits separate from plumbing permits" — and lists the inspections the work needs: underground tested before cover, final after fixtures are set.',
    notIncluded:
      "This is the plumbing permit fee as the schedule prints it. It excludes:\n\n- **The hourly other-inspection items.** The same $75.00-per-hour list the building sheets print, with its minimums — hours this calculator does not collect.\n- **Water Permit to Connect and Tapping Fees.** A separate utility connection schedule linked from the plumbing page; tap charges are utility charges rather than permit fees.\n- **Building, electrical and mechanical permits.** The plumbing page's own sentence: \"Any building, electrical or mechanical work requires permits separate from plumbing permits.\" Each has its own page here.\n- **Any valuation-based charge.** No row on this schedule reads a cost, so a plumbing total here never changes because the job got more expensive.\n- **The repeat-offence increments.** The schedule doubles fees for work commenced without a permit — a straight doubling — and carries no second-offence ladder of its own; the building sheets' violation-history lines belong to their tables, not this one.\n- **License fees and returned-check charges.** Not permitting, and not charged.",
    workedExample: {
      scenario:
        "A new house plumbing rough-in: the inside-permit with eight fixtures or traps, plus the original sewer line into the building.",
      inputs: {
        fixtures: 8,
        custom: { inside_plumbing: true, sewer_original: true },
      },
      notes:
        "The inside-permit is a base with an allowance: \"$50.00 (includes up to 5 fixtures or traps) (each fixture or trap over 5 is $10.00 each)\".\n\nEight fixtures are three over the allowance: 3 × $10.00 = $30.00, and $50.00 + $30.00 = $80.00.\n\nThe original sanitary or storm sewer line into the building is its own row at $125.00.\n\nTotal: $80.00 + $125.00 = $205.00. What moves it: five fixtures or fewer pay the $50.00 base alone; a disconnect is $70.00, an additional line $30.00 and a repair $75.00 as their own rows; water heating adds $35.00 and a lawn sprinkler system $40.00; and the schedule doubles every permit fee for work commenced without a permit — the same job unpermitted would carry a $205.00 surcharge beside these fees, with the 48-hour emergency window quoted rather than charged.",
    },
    faqs: [
      {
        question: "How much is a plumbing permit in Fargo?",
        answer:
          "It is a price list: $50.00 for the inside-permit including up to five fixtures or traps with $10.00 each after; $125.00 for the original sewer line into the building; $70.00 to disconnect one; $30.00 for an additional line into a building or to a manhole or catch basin; $75.00 for a repair or replacement; $35.00 for water heating; and $40.00 for a lawn sprinkler system. The rows the job triggers are added together.",
        sourceId: FARGO_PLUMBING_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "How are fixtures charged?",
        answer:
          'As an allowance inside the base, in the schedule\'s own words: "Minimum Fee $50.00 (includes up to 5 fixtures or traps) (each fixture or trap over 5 is $10.00 each)". Five fixtures are $50.00, six are $60.00, eight are $80.00 — the first five are part of the minimum, not subtracted from it afterwards.',
        sourceId: FARGO_PLUMBING_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "Does the value of the plumbing work change the fee?",
        answer:
          "No. Every row on the schedule is a count or an action — fixtures over an allowance, sewer lines by what is being done, sprinklers and water heating flat — and no plumbing rule reads a cost, so a plumbing total never changes because the job got more expensive. The separate-permits sentence on the plumbing page keeps this permit in its own lane beside the building and electrical permits.",
        sourceId: FARGO_PLUMBING_PAGE_SOURCE_KEY,
      },
      {
        question: "What happens if work started without a permit?",
        answer:
          'The schedule\'s foot: "Double fees for all work commenced without a permit. In case of an emergency, a permit must be taken out within 48 hours after commencement of work." The doubling is charged as 100% of the plumbing permit fee — the Las Cruces pattern of doubling the fee rather than replacing it. The 48-hour window is a deadline for emergency work, quoted on the page rather than priced.',
        sourceId: FARGO_PLUMBING_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "Are the sewer line permits separate from the inside permit?",
        answer:
          "Yes — they are separate rows on separate facts. The original line into each building is $125.00, a disconnect is $70.00, an additional line into a building or to a manhole or catch basin is $30.00, and a repair or replacement is $75.00. A job that both runs fixtures and touches the sewer line carries the inside-permit and the sewer row together, because the schedule's total is the sum of all applicable fees.",
        sourceId: FARGO_PLUMBING_SCHEDULE_SOURCE_KEY,
      },
    ],
    seoTitle: "Fargo plumbing permit cost: fixtures and sewer rows",
    seoDescription:
      "Fargo plumbing permit fees — $50 inside-permit including five fixtures with $10 each after, sewer rows at $125/$70/$30/$75, water heating $35, sprinklers $40, and the schedule's own doubling for unpermitted work.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: FARGO_LAST_VERIFIED,
  },
];

const verifications: SeedVerification[] = [
  {
    entityType: "source",
    entityKey: FARGO_RESIDENTIAL_SCHEDULE_SOURCE_KEY,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: FARGO_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: FARGO_RESIDENTIAL_SCHEDULE_SOURCE_KEY,
    notes:
      'Read 2026-09-25 as the Department\'s PDF stamped "Effective January 1, 2026". Transcribed: the three ladder bands with "or fraction thereof" in the second and third, the demolition/moving/appeals rows with both reductions, the hourly items, and the unpermitted table with the residential floors $550 and $2,000.',
  },
  {
    entityType: "source",
    entityKey: FARGO_COMMERCIAL_SCHEDULE_SOURCE_KEY,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: FARGO_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: FARGO_COMMERCIAL_SCHEDULE_SOURCE_KEY,
    notes:
      'Read 2026-09-25 as the Department\'s PDF stamped "Effective January 1, 2026". Transcribed: all seven bands with their printed bases and rates, the plan-review line with its condition and $50 floor, the shared flat rows, the unpermitted table with the commercial floors $980 and $2,500 — and the 25-cent discontinuity at $50,000, verified from both sides ($578.50 computed, $578.75 printed).',
  },
  {
    entityType: "source",
    entityKey: FARGO_PLUMBING_SCHEDULE_SOURCE_KEY,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: FARGO_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: FARGO_PLUMBING_SCHEDULE_SOURCE_KEY,
    notes:
      'Read 2026-09-25 as the Department\'s PDF stamped "Effective January 1, 2025". Transcribed: every row of the schedule — water heating, the inside-permit allowance sentence, the four sewer rows, sprinklers — plus the hourly list, the government-projects sentence and the closing doubling and 48-hour lines.',
  },
  {
    entityType: "source",
    entityKey: FARGO_RESIDENTIAL_PAGE_SOURCE_KEY,
    status: "verified",
    method: "manual_review",
    verifiedAt: FARGO_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: FARGO_RESIDENTIAL_PAGE_SOURCE_KEY,
    notes:
      "Read 2026-09-25: the Department's own page carrying the effective date, linking both building PDFs, the fee calculator and the trade subpages — this jurisdiction's index to the residential side of the split.",
  },
  {
    entityType: "source",
    entityKey: FARGO_COMMERCIAL_PAGE_SOURCE_KEY,
    status: "verified",
    method: "manual_review",
    verifiedAt: FARGO_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: FARGO_COMMERCIAL_PAGE_SOURCE_KEY,
    notes:
      'Read 2026-09-25: the valuation rules behind this jurisdiction\'s valuation section — the two valuation totals, the ICC-less-15% guide sentence, the two review points, and "The Building Official makes the final valuation determination".',
  },
  {
    entityType: "source",
    entityKey: FARGO_PLUMBING_PAGE_SOURCE_KEY,
    status: "verified",
    method: "manual_review",
    verifiedAt: FARGO_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: FARGO_PLUMBING_PAGE_SOURCE_KEY,
    notes:
      'Read 2026-09-25: the process page — ND State Plumbing Code, licensed contractor for the street-to-building runs, underground tested before cover, final after fixtures — and the separate-permits sentence quoted on the plumbing page.',
  },
  {
    entityType: "source",
    entityKey: FARGO_ELECTRICAL_PAGE_SOURCE_KEY,
    status: "verified",
    method: "manual_review",
    verifiedAt: FARGO_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: FARGO_ELECTRICAL_PAGE_SOURCE_KEY,
    notes:
      'Read 2026-09-25: the self-wire eligibility rules and the billing sentence this electrical page is built on — the inspector values the work at rough-in and "NDSEB will bill applicable fees to the homeowner".',
  },
  {
    entityType: "source",
    entityKey: FARGO_FEE_INDEX_SOURCE_KEY,
    status: "verified",
    method: "manual_review",
    verifiedAt: FARGO_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: FARGO_FEE_INDEX_SOURCE_KEY,
    notes:
      'Read 2026-09-25: the Department\'s own fee-schedule index, read specifically for what it does not list — residential building, heating, plumbing, sign and code-enforcement schedules, and no electrical entry. The absence is the citation for the electrical page\'s first line.',
  },
  {
    entityType: "source",
    entityKey: FARGO_NDSEB_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: FARGO_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: FARGO_NDSEB_SOURCE_KEY,
    notes:
      'Read 2026-09-25: the board\'s Inspection Fees page printing "Effective July 1, 2024" above the current table with the superseded table beneath it. Both job-cost bands, the basis sentence, the four exclusions and the $50 late-certificate increase are transcribed from it; the superseded figures are ignored in favour of the dated ones the page leads with.',
  },
  {
    entityType: "fee_schedule",
    entityKey: FARGO_KEYS.residentialSchedule,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: FARGO_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: FARGO_RESIDENTIAL_SCHEDULE_SOURCE_KEY,
    notes:
      'The schedule row points at the sheet\'s own PDF and carries the printed effective date 2026-01-01 — the same date the commercial sheet carries, which is what makes the two sheets one generation of fees rather than two.',
  },
  {
    entityType: "fee_schedule",
    entityKey: FARGO_KEYS.commercialSchedule,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: FARGO_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: FARGO_COMMERCIAL_SCHEDULE_SOURCE_KEY,
    notes:
      'The schedule row carries 2026-01-01 as printed, and holds the seven bands whose seam arithmetic the tests walk — including the one seam the document itself breaks.',
  },
  {
    entityType: "fee_schedule",
    entityKey: FARGO_KEYS.plumbingSchedule,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: FARGO_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: FARGO_PLUMBING_SCHEDULE_SOURCE_KEY,
    notes:
      'The schedule row carries 2025-01-01 as printed — a year older than the building sheets, which the record notes rather than aligns.',
  },
  {
    entityType: "fee_schedule",
    entityKey: FARGO_KEYS.electricalSchedule,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: FARGO_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: FARGO_NDSEB_SOURCE_KEY,
    notes:
      "The schedule row holds the board's \"Effective July 1, 2024\" date — and is deliberately not a City schedule: its source is the state board because Fargo's own index publishes no electrical schedule to point at.",
  },
  {
    entityType: "fee_rule",
    entityKey: "FARGO-RES-1001-100000",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: FARGO_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: FARGO_RESIDENTIAL_SCHEDULE_SOURCE_KEY,
    notes:
      '"$1,001.00 to $100,000.00 — $50.00 for the first $1,000.00 plus $5.56 for each additional $1,000.00, or fraction thereof" — the round-up phrase on the rule\'s own line, so the rule carries an increment of $1,000: $1,500 of valuation pays one whole $5.56 step and the seam at $100,000 closes at exactly the $600.44 the band above prints. Both asserted in the content test.',
  },
  {
    entityType: "fee_rule",
    entityKey: "FARGO-COM-25001-50000",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: FARGO_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: FARGO_COMMERCIAL_SCHEDULE_SOURCE_KEY,
    notes:
      '"$25,001.00 to $50,000.00 — $361.00 for the first $25,000.00 plus $8.70 for each additional $1,000.00, or fraction thereof" — the band whose arithmetic the sheet itself breaks: it computes exactly $578.50 at $50,000 while the band above prints its base as $578.75. The test asserts both sides of the 25-cent jump rather than choosing one, the way Las Cruces\'s $100 discontinuity is kept.',
  },
  {
    entityType: "fee_rule",
    entityKey: "FARGO-COM-PLAN-REVIEW",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: FARGO_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: FARGO_COMMERCIAL_SCHEDULE_SOURCE_KEY,
    notes:
      '"Plan Review: All projects when a plan review is required. Twenty (20) percent of the attributable building permit fee. Minimum fee $50." The gate is the sheet\'s own condition (the plan-review fact), the basis is the permit fee the ladder computed, the $50 floor binds below a $250 permit — and the residential sheet\'s silence means no residential twin exists.',
  },
  {
    entityType: "fee_rule",
    entityKey: "ELEC-NDSEB-UP-TO-20000",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: FARGO_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: FARGO_NDSEB_SOURCE_KEY,
    notes:
      '"$500.00 to $20,000.00 — $50.00 for the first $500.00 plus 2% on balance up to $20,000.00", holding the printed minimum row ("Up to $500.00 — $50.00 (minimum fee)") in the same rule: below $500 the threshold charges nothing and the $50 base is the fee, and at $20,000 the formula closes at exactly $440.00 — the base the band above prints. The band is gated as a negated greater-than so a calculation with no valuation still reaches the rule and asks for the input instead of dropping out silently.',
  },
  {
    entityType: "fee_rule",
    entityKey: "PLUMB-INSIDE",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: FARGO_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: FARGO_PLUMBING_SCHEDULE_SOURCE_KEY,
    notes:
      '"Inside Plumbing Permits — Minimum Fee $50.00 (includes up to 5 fixtures or traps) (each fixture or trap over 5 is $10.00 each)" — one rule, because the allowance is exactly the per-unit shape with a base: five fixtures are $50.00, six are $60.00, eight are $80.00. The word "includes" is what puts the first five inside the base rather than discounting them after it.',
  },
  {
    entityType: "permit_page",
    entityKey: "building-permit-cost",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: FARGO_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: FARGO_COMMERCIAL_SCHEDULE_SOURCE_KEY,
    notes:
      "Gate-checked 2026-09-25: both sheets read in full — the two ladders with their round-up phrase, the shared flat rows with both reductions, the unpermitted table's three bands and four floors, the plan-review condition — and the page's worked example computes $589.80 from the sheet's own band arithmetic.",
  },
  {
    entityType: "permit_page",
    entityKey: "electrical-permit-cost",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: FARGO_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: FARGO_NDSEB_SOURCE_KEY,
    notes:
      "Gate-checked 2026-09-25: the City's fee-schedule index read for its missing electrical entry, the self-wire page's billing sentence, and both NDSEB bands with their basis and exclusions — the page states the absence in its first line rather than inventing a city fee beside the state one.",
  },
  {
    entityType: "permit_page",
    entityKey: "plumbing-permit-cost",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: FARGO_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: FARGO_PLUMBING_SCHEDULE_SOURCE_KEY,
    notes:
      'Gate-checked 2026-09-25 against the schedule: every priced row transcribed, the allowance sentence read as a base-with-threshold, the doubling line charged as 100% of the permit fee, and the 48-hour emergency window quoted rather than priced. The worked example computes $205.00 from eight fixtures and the original sewer row.',
  },
  {
    entityType: "jurisdiction_profile",
    entityKey: FARGO_KEYS.jurisdiction,
    status: "verified",
    method: "manual_review",
    verifiedAt: FARGO_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: FARGO_FEE_INDEX_SOURCE_KEY,
    notes:
      "The profile states the readings the model depends on — the two sheets are separate schedules split by the sheet's own scope line, every band rounds up on the printed phrase, and electrical is priced by the state because the City's own index proves the absence — and keeps both document facts a reader would trip on: the commercial sheet's 25-cent jump at $50,000, and the plumbing schedule's 2025 date against the building sheets' 2026.",
  },
];

export const fargoSeed: JurisdictionSeed = {
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
export const FARGO_PUBLISHED_PERMIT_PAGES = fargoSeed.permitPages.filter(
  (page) => page.publishStatus === "published" && !page.noindex,
);
