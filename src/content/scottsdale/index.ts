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

import {
  SCOTTSDALE_BUILDING_RULES,
  SCOTTSDALE_ELECTRICAL_RULES,
  SCOTTSDALE_FEE_EFFECTIVE_FROM,
  SCOTTSDALE_MISC_SOURCE_KEY,
  SCOTTSDALE_PERMIT_SOURCE_KEY,
  SCOTTSDALE_PLAN_REVIEW_SOURCE_KEY,
  SCOTTSDALE_PLUMBING_RULES,
} from "./fee-rules";

export * from "./fee-rules";

/**
 * The complete Scottsdale seed payload.
 *
 * Every field traces to `research/arizona/scottsdale.md`, which traces to documents
 * published by the City of Scottsdale. Nothing here is estimated.
 *
 * Scottsdale is Arizona's second jurisdiction and the third city in this project.
 * It is the first whose permit fee is driven by **two different areas** of the same
 * building, and the first whose plan review is **not** a percentage of anything —
 * it is a second, cheaper set of area rates that simply adds to the total.
 *
 * Arizona and Maricopa County are not defined here: Phoenix's payload defines both,
 * and Scottsdale links to those rows. So do the permit types, which are the global
 * ones Houston defines.
 */

/** The date a human last read the City's own published schedules. */
export const SCOTTSDALE_LAST_VERIFIED = "2026-09-24";

export const SCOTTSDALE_KEYS = {
  state: "az",
  county: "maricopa-county",
  jurisdiction: "scottsdale",
  permitSchedule: SCOTTSDALE_PERMIT_SOURCE_KEY,
  planReviewSchedule: SCOTTSDALE_PLAN_REVIEW_SOURCE_KEY,
  miscSchedule: SCOTTSDALE_MISC_SOURCE_KEY,
} as const;



/**
 * The Exhibit A pages this jurisdiction cites. The two the rules point at come from
 * `./fee-rules`, so a rule's `sourceId` and the source row it means cannot drift
 * apart; the rest are named here and cited by requirements and the ledger.
 */
const PERMIT_SCHEDULE_RESIDENTIAL = SCOTTSDALE_PERMIT_SOURCE_KEY;
const PLAN_REVIEW_SCHEDULE_RESIDENTIAL = SCOTTSDALE_PLAN_REVIEW_SOURCE_KEY;
const PERMIT_SCHEDULE_COMMERCIAL = "scottsdale-permit-fee-schedule-commercial";
const PLAN_REVIEW_SCHEDULE_COMMERCIAL = "scottsdale-plan-review-fee-schedule-commercial";
const MISC_SCHEDULE = SCOTTSDALE_MISC_SOURCE_KEY;
const FEES_PAGE = "scottsdale-fees-page";
const ONE_STOP_SHOP_PAGE = "scottsdale-one-stop-shop";

/* -------------------------------------------------------------------------- */
/* Geography                                                                  */
/* -------------------------------------------------------------------------- */

const state = {
  code: "AZ",
  slug: "arizona",
  name: "Arizona",
  fipsCode: "04",
};

const county = {
  key: SCOTTSDALE_KEYS.county,
  slug: "maricopa-county",
  name: "Maricopa County",
  fipsCode: "04013",
};

const jurisdiction = {
  key: SCOTTSDALE_KEYS.jurisdiction,
  stateKey: SCOTTSDALE_KEYS.state,
  countyKey: SCOTTSDALE_KEYS.county,
  type: "city" as const,
  slug: "scottsdale",
  name: "Scottsdale",
  officialName: "City of Scottsdale",
  websiteUrl: "https://www.scottsdaleaz.gov/",
  /**
   * SPUR is the City's permitting system, named on the Planning & Development
   * navigation and reachable at this address (verified by request on 2026-09-24).
   * The separate eservices.scottsdaleaz.gov/bldgresources/PermitFee calculator the
   * fees page links to answered 403 to this environment, so it is recorded in the
   * research and not used as a portal URL.
   */
  permitPortalUrl: "https://www.scottsdaleaz.gov/planning-development/scottsdale-spur",
  // Arizona does not observe daylight saving time.
  timezone: "America/Phoenix",
  isActive: true,
};

/* -------------------------------------------------------------------------- */
/* Department                                                                 */
/* -------------------------------------------------------------------------- */

const departments: SeedDepartment[] = [
  {
    key: "scottsdale-one-stop-shop",
    jurisdictionKey: SCOTTSDALE_KEYS.jurisdiction,
    kind: "building",
    name: "One Stop Shop, Planning & Development Services, City of Scottsdale",
    phone: "480-312-2500",
    email: "OneStopShopStaff@ScottsdaleAZ.gov",
    url: "https://www.scottsdaleaz.gov/planning-development/one-stop-shop",
    addressLine: "7447 E. Indian School Road, Scottsdale, AZ 85251",
    hours:
      "Monday, Tuesday, Thursday and Friday 8 a.m.–5 p.m.; Wednesday 9 a.m.–5 p.m.; closed Saturday and Sunday. No transactions after 4 p.m., and on Wednesdays permit services run 1–5 p.m.",
    notes:
      "Issues and inspects building, electrical, plumbing and mechanical permits for property inside the Scottsdale city limits. The address is printed on every page of the City's fee schedules; the phone number, email and hours are published on the department's own One Stop Shop page, read on 2026-09-24. Inspection Services, which handles permit extensions, publishes a separate number, 480-312-5750.",
  },
];

/* -------------------------------------------------------------------------- */
/* Sources                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * The City's fee documents are PDFs whose URLs carry a sitefinity `sfvrsn` query
 * string. It is kept verbatim: stripping it does not always resolve.
 */
const FEE_DIR =
  "https://www.scottsdaleaz.gov/docs/default-source/scottsdaleaz/planning---develpment/fees-fy26-27";

const sources: SeedSource[] = [
  {
    key: PERMIT_SCHEDULE_RESIDENTIAL,
    jurisdictionKey: SCOTTSDALE_KEYS.jurisdiction,
    title: "Permit Fee Schedule — Residential (Exhibit A)",
    url: `${FEE_DIR}/permit-fee-schedule---residential.pdf?sfvrsn=3330d226_1`,
    sourceType: "fee_schedule_pdf",
    issuingAuthority: "City of Scottsdale Planning & Development Services",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2026-07-01",
    effectiveFrom: SCOTTSDALE_FEE_EFFECTIVE_FROM,
    retrievedAt: SCOTTSDALE_LAST_VERIFIED,
    lastVerifiedAt: SCOTTSDALE_LAST_VERIFIED,
    notes:
      "Two pages, pages 10 and 11 of the City's 23-page Exhibit A, effective 1 July 2026 under Resolution No. 13661. Fetched from scottsdaleaz.gov on 2026-09-24 (sha256 6f43f6738e12f1258a92cf6c7bc82a4c7c9b27bed94bd612100d9072a8d9cb08, 123,060 bytes) and read locally with pdftotext -table, which is the mode that pairs each fee with its own row; -layout interleaves the label and amount columns on these pages and would misassign them. A later capture can be compared against that hash.",
  },
  {
    key: PERMIT_SCHEDULE_COMMERCIAL,
    jurisdictionKey: SCOTTSDALE_KEYS.jurisdiction,
    title: "Permit Fee Schedule — Commercial (Exhibit A)",
    url: `${FEE_DIR}/permit-fee-schedule---commercial.pdf?sfvrsn=913d3970_1`,
    sourceType: "fee_schedule_pdf",
    issuingAuthority: "City of Scottsdale Planning & Development Services",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2026-07-01",
    effectiveFrom: SCOTTSDALE_FEE_EFFECTIVE_FROM,
    retrievedAt: SCOTTSDALE_LAST_VERIFIED,
    lastVerifiedAt: SCOTTSDALE_LAST_VERIFIED,
    notes:
      "Two pages, pages 8 and 9 of Exhibit A, same resolution. Fetched 2026-09-24 (sha256 e6910aecc536134b6ec6d04266381bfbd5f328f35c297645d0a214b8ac4594e4, 110,675 bytes). It publishes the same $237 base, the same $0.94 and $0.54 area rates and the same 30% remodel percentage as the residential schedule, which is why the rules here carry no occupancy condition. Its own rows add commercial definitions: remodel (existing), T.I. (new) and multi-family build out, vanilla shell T.I., shell only at 95% of the area-with-A/C rate, and foundation only at 25%.",
  },
  {
    key: PLAN_REVIEW_SCHEDULE_RESIDENTIAL,
    jurisdictionKey: SCOTTSDALE_KEYS.jurisdiction,
    title: "Plan Review Fee Schedule — Residential (Exhibit A)",
    url: `${FEE_DIR}/plan-review-fee-schedule---residential.pdf?sfvrsn=6e283610_1`,
    sourceType: "fee_schedule_pdf",
    issuingAuthority: "City of Scottsdale Planning & Development Services",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2026-07-01",
    effectiveFrom: SCOTTSDALE_FEE_EFFECTIVE_FROM,
    retrievedAt: SCOTTSDALE_LAST_VERIFIED,
    lastVerifiedAt: SCOTTSDALE_LAST_VERIFIED,
    notes:
      "One page, page 5 of Exhibit A. Fetched 2026-09-24 (sha256 b952eed35cff264a6a607b110a57b650c79cef9f6ebf13518ad320d4b5a4939d, 104,226 bytes). Single family custom homes and single family additions carry $0.54 per sq ft of livable area with A/C plus $0.34 per sq ft of covered area, with no base fee of any kind — plan review here is only the area rates. The same page prices fences and retaining walls at $0.18 per linear foot in plan review, additional elevations at $121 each, engineering review per sheet at $1,057 and $363, and every miscellaneous review at $121 an hour.",
  },
  {
    key: PLAN_REVIEW_SCHEDULE_COMMERCIAL,
    jurisdictionKey: SCOTTSDALE_KEYS.jurisdiction,
    title: "Plan Review Fee Schedule — Commercial (Exhibit A)",
    url: `${FEE_DIR}/plan-review-fee-schedule---commercial.pdf?sfvrsn=111251c6_1`,
    sourceType: "fee_schedule_pdf",
    issuingAuthority: "City of Scottsdale Planning & Development Services",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2026-07-01",
    effectiveFrom: SCOTTSDALE_FEE_EFFECTIVE_FROM,
    retrievedAt: SCOTTSDALE_LAST_VERIFIED,
    lastVerifiedAt: SCOTTSDALE_LAST_VERIFIED,
    notes:
      "One page, page 4 of Exhibit A. Fetched 2026-09-24 (sha256 6ac4debe2a812e27004e1bee5672a1db8fc5083544ab098fdddb77e340a37918, 103,989 bytes). Commercial, commercial addition, apartments and condos all take the same $0.54 and $0.34 area rates as residential, which is the second reason the rules here need no occupancy condition. It also prices foundation only at 25% of the $0.54 rate plus $270, shell only at 95%, commercial remodel and tenant improvement at 30% on the area with A/C alone, and a green compliance review at $0.10 per sq ft capped at $600.",
  },
  {
    key: MISC_SCHEDULE,
    jurisdictionKey: SCOTTSDALE_KEYS.jurisdiction,
    title: "Permit Fee Schedule — Miscellaneous (Exhibit A)",
    url: `${FEE_DIR}/permit-fee-schedule---miscellaneous.pdf?sfvrsn=bcebac04_1`,
    sourceType: "fee_schedule_pdf",
    issuingAuthority: "City of Scottsdale Planning & Development Services",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2026-07-01",
    effectiveFrom: SCOTTSDALE_FEE_EFFECTIVE_FROM,
    retrievedAt: SCOTTSDALE_LAST_VERIFIED,
    lastVerifiedAt: SCOTTSDALE_LAST_VERIFIED,
    notes:
      "Two pages, pages 12 and 13 of Exhibit A. Fetched 2026-09-24 (sha256 489d15a21aa3713a4aaca378c771db79398d51fa0d4c45fedef66b688c98da57, 126,332 bytes). Cited for the fees this site names and does not compute: certificate of occupancy $195, demolition $379 ($121 for a pool), water heaters $63, residential solar $168 and commercial solar $331, solar water heaters $90, temporary power pole $121, re-inspection $121, pools and attached spas $0.61 per sq ft plus the $237 base and a $195 planning inspection fee, stand-alone spas $142, signs from $26 to $363 per sign behind a $237 base charged once per application, and the two minimum permit fees. It also publishes the departmental-structure evidence for trade work: 'Minimum Permit (one discipline) $121' and 'Minimum Combination (all disciplines) $379'.",
  },
  {
    key: FEES_PAGE,
    jurisdictionKey: SCOTTSDALE_KEYS.jurisdiction,
    title: "Fees, City of Scottsdale Planning & Development Services",
    url: "https://www.scottsdaleaz.gov/planning-development/fees",
    sourceType: "municipal_website",
    issuingAuthority: "City of Scottsdale Planning & Development Services",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: SCOTTSDALE_LAST_VERIFIED,
    lastVerifiedAt: SCOTTSDALE_LAST_VERIFIED,
    notes:
      "The department's fee landing page, read on 2026-09-24 and last updated by the City on 2 July 2026. It publishes the schedules under the heading 'FY 26/27 - Effective July 1, 2026', which is where the effective date is stated on the web as well as in the documents, and it lists the other charges that sit beside the fee schedules: application fees, right-of-way annual fees, the customized expedited plan review programme, in-lieu parking, records, and stormwater management. It also links a 'Permit Fee Calculator Quick Reference: Calculates Building Permits Fees Only' at eservices.scottsdaleaz.gov, which answered 403 to this environment and from which no figure was taken.",
  },
  {
    key: ONE_STOP_SHOP_PAGE,
    jurisdictionKey: SCOTTSDALE_KEYS.jurisdiction,
    title: "One Stop Shop, City of Scottsdale Planning & Development Services",
    url: "https://www.scottsdaleaz.gov/planning-development/one-stop-shop",
    sourceType: "municipal_website",
    issuingAuthority: "City of Scottsdale Planning & Development Services",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: SCOTTSDALE_LAST_VERIFIED,
    lastVerifiedAt: SCOTTSDALE_LAST_VERIFIED,
    notes:
      "Read 2026-09-24; the City last updated it 13 August 2026. The only source for the department's contact details on this site: address 7447 E. Indian School Road, Scottsdale, AZ 85251, phone 480-312-2500 and email OneStopShopStaff@ScottsdaleAZ.gov, with published hours of 8 a.m. to 5 p.m. Monday, Tuesday, Thursday and Friday and 9 a.m. to 5 p.m. Wednesday, no transactions after 4 p.m. Every other department page repeats the address, which is also printed on the footer of each schedule page.",
  },
];

/* -------------------------------------------------------------------------- */
/* Which permits Scottsdale issues                                             */
/* -------------------------------------------------------------------------- */

/**
 * Scottsdale issues building, electrical, plumbing and mechanical permits, and prices
 * each of them differently from the way the last three cities in this project do.
 *
 * There is no per-outlet, per-fixture, per-circuit, per-ton or per-trade row anywhere
 * in Exhibit A, and the electrical, plumbing and mechanical work of a building project
 * is paid for through the area rate on that project's permit — the same fee whether it
 * has one circuit or forty.
 *
 * **What the City does price flat is a short list of specific items**, in the
 * Miscellaneous permit schedule, and that list is what the electrical and plumbing
 * pages are built on: a water heater $63, a solar water heater $90, a temporary power
 * pole $121, residential solar $168, a re-inspection $121, and a $121 minimum for a
 * permit covering a single discipline. Those are the figures the pages compute.
 *
 * **Mechanical gets no page, and the reason is not the same as the trades'. ** Nothing
 * in the Miscellaneous schedule is mechanical — no furnace, no air conditioner, no
 * refrigeration row — and the Building Safety section prices no mechanical work at all.
 * A page here would have the area rates and a statement of absence, which is exactly
 * the page this project refuses to publish.
 */
const jurisdictionPermitTypes: SeedJurisdictionPermitType[] = [
  {
    jurisdictionKey: SCOTTSDALE_KEYS.jurisdiction,
    permitTypeKey: "building",
    isAvailable: true,
    localName: "Building Permit",
    officialUrl: "https://www.scottsdaleaz.gov/planning-development/permit-services",
    notes:
      "Priced from two area rates plus a base fee: $237, then $0.94 per square foot of area with A/C and $0.54 per square foot of covered area without it. Plan review is a second, cheaper pair of area rates.",
  },
  {
    jurisdictionKey: SCOTTSDALE_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    isAvailable: true,
    localName: "Electrical Permit",
    officialUrl: "https://www.scottsdaleaz.gov/planning-development/permit-services",
    notes:
      "Issued by the same department, and not separately priced per outlet, circuit or panel. Electrical work carried on a building permit is paid for through that permit's area rate; the figures the City publishes for electrical work on its own are a $121 temporary power pole, a $168 residential solar permit, a $121 re-inspection, and the $121 minimum for a permit covering one discipline.",
  },
  {
    jurisdictionKey: SCOTTSDALE_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    isAvailable: true,
    localName: "Plumbing Permit",
    officialUrl: "https://www.scottsdaleaz.gov/planning-development/permit-services",
    notes:
      "Issued, and not separately priced per fixture or per gas outlet. The plumbing figures the City publishes are flat and few: a water heater at $63, a solar water heater at $90, a re-inspection at $121, and the $121 minimum for a permit covering one discipline.",
  },
  {
    jurisdictionKey: SCOTTSDALE_KEYS.jurisdiction,
    permitTypeKey: "mechanical",
    isAvailable: true,
    localName: "Mechanical Permit",
    officialUrl: "https://www.scottsdaleaz.gov/planning-development/permit-services",
    notes:
      "Issued, and not separately priced by tonnage, unit count or trade. Air-conditioned area is what the City charges for, at $0.94 a square foot on the building permit. No page is published for it.",
  },
  {
    jurisdictionKey: SCOTTSDALE_KEYS.jurisdiction,
    permitTypeKey: "demolition",
    isAvailable: true,
    localName: "Demolition Permit",
    officialUrl: "https://www.scottsdaleaz.gov/planning-development/permit-services",
    notes:
      "Priced flat in the Miscellaneous schedule: $379 for a demolition permit, $121 for a pool. Real and verified, but there is no second component, no case, and nothing else the City publishes about it — one number and one exception are not a page. Recorded here and in research/arizona/scottsdale.md rather than published.",
  },
];

/* -------------------------------------------------------------------------- */
/* Fee schedule                                                               */
/* -------------------------------------------------------------------------- */

const feeSchedules: JurisdictionSeed["feeSchedules"] = [
  {
    key: SCOTTSDALE_KEYS.permitSchedule,
    jurisdictionKey: SCOTTSDALE_KEYS.jurisdiction,
    sourceKey: PERMIT_SCHEDULE_RESIDENTIAL,
    title: "City of Scottsdale Permit Fee Schedule, FY 26/27 (Exhibit A)",
    officialUrl: `${FEE_DIR}/permit-fee-schedule---residential.pdf?sfvrsn=3330d226_1`,
    effectiveFrom: SCOTTSDALE_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: SCOTTSDALE_LAST_VERIFIED,
    notes:
      "Effective 1 July 2026 under Resolution No. 13661, and one of four permit schedules the City publishes for the same year: residential, commercial, miscellaneous and right-of-way improvements. The rules here cite the residential and commercial documents, which publish the same rates; the miscellaneous document prices the fees that sit beside them. All four carry the same effective date, so this row covers the permit fee apart from plan review, which has its own schedule row.",
  },
  {
    key: SCOTTSDALE_KEYS.planReviewSchedule,
    jurisdictionKey: SCOTTSDALE_KEYS.jurisdiction,
    sourceKey: PLAN_REVIEW_SCHEDULE_RESIDENTIAL,
    title: "City of Scottsdale Plan Review Fee Schedule, FY 26/27 (Exhibit A)",
    officialUrl: `${FEE_DIR}/plan-review-fee-schedule---residential.pdf?sfvrsn=6e283610_1`,
    effectiveFrom: SCOTTSDALE_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: SCOTTSDALE_LAST_VERIFIED,
    notes:
      "Same resolution and effective date. Separate from the permit schedule because it is a separate document with its own rates: $0.54 and $0.34 per square foot against the permit schedule's $0.94 and $0.54, and no base fee at all.",
  },
];

/* -------------------------------------------------------------------------- */
/* Fee rules                                                                  */
/* -------------------------------------------------------------------------- */

function rulesFor(permitTypeKey: string, rules: SeedFeeRule["rule"][]): SeedFeeRule[] {
  return rules.map((rule) => ({
    jurisdictionKey: SCOTTSDALE_KEYS.jurisdiction,
    permitTypeKey,
    scheduleKey: SCOTTSDALE_KEYS.permitSchedule,
    rule,
  }));
}

const feeRules: SeedFeeRule[] = [
  ...rulesFor("building", SCOTTSDALE_BUILDING_RULES),
  ...rulesFor("electrical", SCOTTSDALE_ELECTRICAL_RULES),
  ...rulesFor("plumbing", SCOTTSDALE_PLUMBING_RULES),
];

/* -------------------------------------------------------------------------- */
/* Requirements                                                               */
/* -------------------------------------------------------------------------- */

const requirements: SeedRequirement[] = [
  {
    jurisdictionKey: SCOTTSDALE_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "document",
    title: "Two different areas, and the City means both",
    description:
      "The schedule charges for the area with A/C at $0.94 a square foot and for the covered area without A/C at $0.54 a square foot, and they are two separate areas rather than two names for the total. The residential schedule calls the first the 'livable area with A/C' and the second the 'covered area (non A/C)'; the commercial schedule calls them 'area with A/C' and 'covered area (non A/C)'. A 2,500 square foot house of which 400 square feet is a roofed patio with no air conditioning is charged 2,500 square feet at one rate and 400 square feet at the other, not 2,500 at both.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: PERMIT_SCHEDULE_RESIDENTIAL,
    lastVerifiedAt: SCOTTSDALE_LAST_VERIFIED,
  },
  {
    jurisdictionKey: SCOTTSDALE_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "Remodels and tenant improvements are charged 30% of the area rate",
    description:
      "A remodel keeps the full $237 base fee and the full $0.54 covered-area rate, but the area with A/C is charged at $0.94 x 30%, which is $0.282 a square foot. The same 30% appears beside every remodel and tenant-improvement row in both the residential and the commercial schedule, so one rule covers a single family remodel, a commercial remodel of an existing building, a new tenant improvement, a multi-family build out and a vanilla shell T.I. The City's shell-only row is a different figure, 95% of the area rate, and its foundation-only row is 25%.",
    isMandatory: true,
    sortOrder: 20,
    sourceKey: PERMIT_SCHEDULE_COMMERCIAL,
    lastVerifiedAt: SCOTTSDALE_LAST_VERIFIED,
  },
  {
    jurisdictionKey: SCOTTSDALE_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "document",
    title: "Whether a plan review is required",
    description:
      "The plan review schedule prices the review of a building; it does not decide whether one is required, and it publishes no case in which a review is waived. Whether your project is reviewed over the counter, at a review meeting or through the standard submittal is the department's call. The estimate on this site assumes a review, because the fee schedule publishes a plan review fee for the work it prices.",
    isMandatory: true,
    sortOrder: 30,
    sourceKey: PLAN_REVIEW_SCHEDULE_RESIDENTIAL,
    lastVerifiedAt: SCOTTSDALE_LAST_VERIFIED,
  },
  {
    jurisdictionKey: SCOTTSDALE_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "Fees charged beside the permit",
    description:
      "Exhibit A publishes a large number of fees that run alongside the permit fee rather than inside it: certificate of occupancy and certificate of shell $195, GIS fee $379, lowest floor certificate review $363, plan review extension request $379, re-inspection $121, off-hours inspections $379, building permit extension request $379, demolition $379, water heaters $63, residential solar $168 and commercial solar $331, temporary power pole $121, pools and attached spas $0.61 per square foot plus a $195 planning inspection fee and the $237 base, and every miscellaneous review or revision at $121 an hour. None of them is included in the figures on this site, and none is estimated.",
    isMandatory: false,
    sortOrder: 40,
    sourceKey: MISC_SCHEDULE,
    lastVerifiedAt: SCOTTSDALE_LAST_VERIFIED,
  },
  {
    jurisdictionKey: SCOTTSDALE_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "The two minimum permit fees",
    description:
      "The Miscellaneous schedule publishes 'Minimum Permit (one discipline) $121' and 'Minimum Combination (all disciplines) $379'. They read as floors on a permit rather than additions to one, and the schedule does not say whether they floor the $237 base or replace it, so they are named on this site and left out of the arithmetic rather than guessed at.",
    isMandatory: false,
    sortOrder: 50,
    sourceKey: MISC_SCHEDULE,
    lastVerifiedAt: SCOTTSDALE_LAST_VERIFIED,
  },
  {
    jurisdictionKey: SCOTTSDALE_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "The schedules are one exhibit of a larger set",
    description:
      "The permit and plan review schedules are pages of a single 23-page Exhibit A for fiscal year 2026/27, adopted by Resolution No. 13661 and effective 1 July 2026. The department publishes other charges separately from it — application fees, right-of-way annual fees, the customized expedited plan review programme, in-lieu parking, records and stormwater management — and those are not part of the figures here.",
    isMandatory: false,
    sortOrder: 60,
    sourceKey: FEES_PAGE,
    lastVerifiedAt: SCOTTSDALE_LAST_VERIFIED,
  },
  {
    jurisdictionKey: SCOTTSDALE_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "document",
    title: "Electrical work on a project is paid for by area, not by trade",
    description:
      "The City publishes no electrical rate: no per-outlet, per-circuit, per-panel or per-device figure appears in Exhibit A. Electrical work carried out on a construction or remodelling project is covered by that project's building permit, whose fee is driven by two areas — $0.94 per square foot of area with A/C and $0.54 per square foot of covered area, behind a $237 base. Two projects of the same size pay the same permit fee whatever electrical work they contain, which is the opposite of Houston, where an electrical permit is priced per outlet and per circuit.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: PERMIT_SCHEDULE_RESIDENTIAL,
    lastVerifiedAt: SCOTTSDALE_LAST_VERIFIED,
  },
  {
    jurisdictionKey: SCOTTSDALE_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "other",
    title: "The three electrical figures the City does publish",
    description:
      "A temporary power pole is $121 and a residential solar permit is $168, both flat fees in the Miscellaneous permit schedule, and a re-inspection is $121. The same schedule publishes a minimum permit fee of $121 for a permit covering one discipline and $379 for one covering all disciplines; the $121 is a floor rather than a rate, and where the City prices an item flat that flat figure applies instead. The temporary power pole and the one-discipline minimum are therefore alternatives here, never a sum: the schedule does not say the one-discipline permit is the pole permit, and charging both would decide a question the City left open.",
    isMandatory: true,
    sortOrder: 20,
    sourceKey: MISC_SCHEDULE,
    lastVerifiedAt: SCOTTSDALE_LAST_VERIFIED,
  },
  {
    jurisdictionKey: SCOTTSDALE_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    requirementType: "document",
    title: "Plumbing work on a project is paid for by area, not by fixture",
    description:
      "There is no per-fixture, per-water-closet or per-gas-outlet rate in Exhibit A. Plumbing on a construction or remodelling project is inside the building permit, priced by area at $0.94 per square foot of area with A/C plus $0.54 per square foot covered, behind a $237 base, so a house with one bathroom and a house with five of the same size are charged the same. Houston charges a plumbing permit per fixture and Dallas charges a trade inspection by trade count; Scottsdale charges neither.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: PERMIT_SCHEDULE_RESIDENTIAL,
    lastVerifiedAt: SCOTTSDALE_LAST_VERIFIED,
  },
  {
    jurisdictionKey: SCOTTSDALE_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    requirementType: "other",
    title: "Water heater fees are alternatives to the minimum, not additions to it",
    description:
      "The Miscellaneous permit schedule prices a water heater at $63, 'except solar', and a solar water heater at $90 — its own carve-out, which is why the two are separate rules rather than one with a condition. It also publishes the $121 minimum for a permit covering one discipline. These are listed as separate fees and the schedule does not say the minimum floors the flat item fees, so this site charges one published figure at a time and never sums them: $184 for a water heater permit is not a fee the City publishes.",
    isMandatory: true,
    sortOrder: 20,
    sourceKey: MISC_SCHEDULE,
    lastVerifiedAt: SCOTTSDALE_LAST_VERIFIED,
  },
];

/* -------------------------------------------------------------------------- */
/* Jurisdiction profile                                                       */
/* -------------------------------------------------------------------------- */

const profile: SeedProfile = {
  jurisdictionKey: SCOTTSDALE_KEYS.jurisdiction,
  headline: "What construction permits cost in Scottsdale",
  summary:
    "Scottsdale charges a building permit fee from two areas rather than from a valuation: a $237 base fee, then $0.94 per square foot of area with air conditioning and $0.54 per square foot of covered area without it. Plan review is added on top from a separate schedule at $0.54 and $0.34 per square foot — cheaper than the permit fee, and with no base fee at all — so the reviewed total is the base fee plus about one and a half times the two area charges. Remodels and tenant improvements keep the base fee and the covered-area rate but pay 30% of the area-with-A/C rate. All of it is Exhibit A of the City's fiscal year 2026/27 fee schedule, adopted by Resolution No. 13661 and effective 1 July 2026.",
  localContext:
    "Three things make Scottsdale's fee different from most cities', and all three are visible on the first line of the schedule.\n\nThe first is that there is no valuation anywhere. Nobody estimates what the building is worth. The City measures it instead: the area with A/C at $0.94 a square foot and the covered area without it at $0.54. A building full of expensive finishes and a building full of cheap ones of the same size pay the same permit fee. That makes an estimate easy to check — you need two numbers off the plans, not a cost opinion — and it makes the fee insensitive to everything except size.\n\nThe second is that the **covered area is a second area, not a second name for the total**. A 2,500 square foot house that includes 400 square feet of roofed patio without air conditioning is charged 2,500 square feet at $0.94 and 400 square feet at $0.54. Reading the two rows as two rates on one total — which is what the column layout invites — overstates the fee by more than $1,600 on that house.\n\nThe third is that plan review is not a percentage of anything. In Phoenix it is 100% or 80% of the permit fee; in Houston it is a separate per-$1,000 rate on valuation. Scottsdale publishes a second schedule with its own two area rates, $0.54 and $0.34, and no base fee at all. So the review is roughly 57% of the permit fee's area component — and it never carries the $237. A project whose plans are reviewed pays the base fee once, not twice.\n\nWhat the City does not publish is a rate for electrical, plumbing or mechanical work. All three are issued permits, and the Miscellaneous schedule says the least thing about them that any document in this project has said: a one-discipline permit has a $121 minimum and a permit covering all disciplines a $379 minimum. Beyond those two floors, the trades are paid for by the building permit's area rate — the same amount for one circuit as for forty. That is a real difference from Texas, where a Houston electrical permit is priced per outlet and a Dallas one by how many trades the job involves.",
  valuationBasis:
    "There is no valuation. The schedule builds a permit fee from three figures: a base fee of $237, the area with air conditioning at $0.94 a square foot, and the covered area without air conditioning at $0.54 a square foot. The residential schedule calls those 'livable area with A/C' and 'covered area (non A/C)'; the commercial schedule uses 'area with A/C' and 'covered area (non A/C)'. Plan review repeats the structure from its own schedule at $0.54 and $0.34.\n\nBecause the fee is driven by area, the areas are the estimate. Measure the air-conditioned floor area of the building and, separately, the area that is roofed but not air-conditioned — a covered patio, a carport, an enclosed storage bay. If the second is zero, say so: it is a real input and leaving it out is not the same as entering zero only in the sense that neither is charged.\n\nOne consequence is worth stating plainly. The City's shell-only row prices work at $0.94 x 95% against a line the schedule itself labels 'Area with A/C', even though a shell building has no air conditioning by definition. The schedule's own wording is followed here rather than reinterpreted; no shell-only fee is calculated.",
  notIncluded:
    "These figures are the City of Scottsdale's building permit fee and plan review fee as published in Exhibit A for fiscal year 2026/27 (Resolution No. 13661, effective 1 July 2026), computed by this site's engine. They are not a total project cost, and they do not include:\n\n- **The 70% roof-modification remodel, the 95% shell-only row, the 25% foundation-only row and the addition under 500 square feet.** Each scales the same two area rates by a percentage the schedule prints, and each is a different roof of work with its own treatment of the base fee. Named here, not estimated.\n- **The two minimum permit fees**, $121 for one discipline and $379 for a combination, which the schedule publishes without saying whether they floor the $237 base or replace it.\n- **Certificate of occupancy and certificate of shell ($195 each), GIS fee ($379), lowest floor certificate review ($363)**, and the $363 lowest-floor figure the residential schedule marks 'special flood hazards area only'.\n- **Pools and spas**: attached pools and spas at $0.61 per square foot plus the $237 base fee plus a $195 planning inspection fee, and stand-alone spas at $142.\n- **Fences and retaining walls**, which are charged $0.27 and $2.49 per linear foot behind their own $237 base fee, with plan review at $0.18 per linear foot for either.\n- **Signs**, from $26 per sign for ten square feet or less to $363 per sign at thirty-one square feet and over, behind a $237 base charged once per application rather than per sign.\n- **Demolition** at $379, and $121 for a pool.\n- **Trades on their own**: water heaters $63, residential solar $168, commercial solar $331, solar water heaters $90, temporary power pole $121, and the published $121 one-discipline minimum for anything these schedules do not price separately.\n- **Every hourly service and event fee**: miscellaneous, miscellaneous-revision, fence-only, retaining-wall-only, native plant, benchmark revision, barricade, dry utility and pool reviews at $121 an hour; engineering review per sheet at $1,057 and $363; additional elevations at $121 each; re-inspection $121; off-hours inspections $379; permit extension request $379; plan review extension request $379; review after the third review at 50% of the original fee; and the standard-plan administrative site review at 15% of the square-footage fee.\n- **The green compliance review** for commercial and multi-family work, $0.10 per square foot capped at $600, and the $270 add factor on foundation-only plan review.\n- **Charges on the City's other schedules** — application fees, right-of-way annual fees, the customized expedited plan review programme, in-lieu parking, records and stormwater management — and anything for property outside the Scottsdale city limits. Whether Maricopa County issues construction permits for unincorporated areas, and for which functions, has not been verified against the county's own site, so it is not described here.",
  seoTitle: "Scottsdale, Arizona construction permit fees",
  seoDescription:
    "How Scottsdale prices building permits by area — $237 plus $0.94 per square foot with A/C and $0.54 without it, and plan review at $0.54 and $0.34 — with the published rates and a worked example.",
  publishStatus: "published",
  noindex: false,
  lastReviewedAt: SCOTTSDALE_LAST_VERIFIED,
};

/* -------------------------------------------------------------------------- */
/* Permit pages                                                               */
/* -------------------------------------------------------------------------- */

const permitPages: SeedPermitPage[] = [
  {
    jurisdictionKey: SCOTTSDALE_KEYS.jurisdiction,
    permitTypeKey: "building",
    slug: "building-permit-cost",
    title: "Scottsdale building permit cost",
    intro:
      "Scottsdale does not price a building permit from a valuation. It prices it from area. A permit costs $237, plus $0.94 for every square foot that is air-conditioned, plus $0.54 for every square foot that is roofed but is not. Plan review is added on top from a separate schedule at $0.54 and $0.34 a square foot, with no base fee of its own, so the reviewed total is the $237 plus roughly one and a half times the two area charges. Remodels and tenant improvements pay the same $237 and the same $0.54 covered-area rate, but 30% of the area-with-A/C rate — $0.282 a square foot.",
    localSummary:
      "The 30% on remodels is the figure most people miss, and it is the City's, not a discount this site invented: it is printed as '$0.94 sq. ft. x 30%' beside every remodel and tenant-improvement row in both the residential and the commercial schedule. The base fee is not reduced with it, and the covered-area rate is not reduced either — a remodel pays the full $0.54 on any roofed, un-air-conditioned area.\n\nPlan review is the other half of the shape, and it works in the opposite direction from Phoenix, where plan review is a percentage of the permit fee. Here it is a second pair of area rates that are cheaper than the first, and there is no base fee in it at all: $0.54 for the area with A/C and $0.34 for the covered area. On a straightforward house the review therefore comes to about 57% of the permit fee's area component, and reviewing the plans never costs another $237.\n\nThe two areas are the part worth being careful about. They are not the same area charged twice. The $0.94 rate is for the air-conditioned area and the $0.54 rate is for the roofed area that is not air-conditioned — a covered patio, a carport, an enclosed bay. Entering the full floor area against both rows is the one mistake this schedule invites, and it is expensive: on a 2,500 square foot house with 400 square feet of covered patio it adds $1,610 to the permit fee alone.\n\nWhat the City does not publish is a fee for electrical, plumbing or mechanical work as such. There is no per-outlet, per-fixture or per-circuit rate anywhere in the schedule. Trade work is paid for through the building permit's area rate, and a permit taken out for a single trade on its own is subject to the $121 one-discipline minimum the Miscellaneous schedule publishes. A water heater is the one exception with a flat price of its own, $63.",
    notIncluded:
      "This estimate is the building permit fee plus the plan review fee published in the same Exhibit A for fiscal year 2026/27. It excludes:\n\n- **The 70% roof-modification remodel, the 95% shell-only row, the 25% foundation-only row and the addition under 500 square feet** — each scales the same area rates by a percentage the City prints.\n- **The published minimum permit fees**: $121 for one discipline, $379 for all disciplines, which the schedule does not say how to apply against the $237 base.\n- **Certificate of occupancy and certificate of shell $195, GIS fee $379, lowest floor certificate review $363.**\n- **Pools and attached spas** at $0.61 per square foot plus the $237 base and a $195 planning inspection fee, and stand-alone spas at $142.\n- **Fences and retaining walls** at $0.27 and $2.49 per linear foot behind their own $237 base, with plan review at $0.18 per linear foot.\n- **Signs**, from $26 to $363 per sign behind a $237 base charged once per application, and **demolition** at $379 ($121 for a pool).\n- **Trade work priced on its own**: water heaters $63, residential solar $168, commercial solar $331, solar water heaters $90, temporary power pole $121.\n- **Hourly and event fees**: every miscellaneous or revision review at $121 an hour, engineering review per sheet at $1,057 and $363, additional elevations at $121 each, re-inspection $121, off-hours inspections $379, permit and plan review extension requests $379 each, review after the third review at 50% of the original fee, and the 15% standard-plan administrative site review fee.\n- **The green compliance review** at $0.10 per square foot capped at $600, and the $270 add factor on foundation-only plan review.\n- Fees charged on the City's other schedules — application fees, right-of-way annual fees, expedited plan review, in-lieu parking, records and stormwater management — and anything for property outside the Scottsdale city limits.",
    workedExample: {
      scenario:
        "A new single family custom home of 2,500 square feet with air conditioning, which also has 400 square feet of covered patio that is roofed but not air-conditioned. Both areas are entered, because the schedule charges them at different rates.",
      inputs: {
        squareFootage: 2_500,
        workType: "new_construction",
        occupancy: "residential",
        custom: { covered_square_footage: 400 },
      },
      notes:
        "The permit fee is the published $237 base, 2,500 square feet at $0.94 ($2,350) and 400 square feet at $0.54 ($216): $2,803. Plan review from the separate schedule is 2,500 square feet at $0.54 ($1,350) and 400 square feet at $0.34 ($136): $1,486, with no base fee in it, giving $4,289 in all.\n\nTwo things about this example are assumptions rather than City figures. It assumes a plan review is required, which the schedule prices but does not decide. And the areas are a plausible house, not a City example — Scottsdale publishes no worked example of its own, so nothing here is being reproduced from the City as it was for Phoenix. Change the two areas and the fee changes with them, linearly and to the cent.\n\nHad this been a remodel rather than a new home, the same $237 base and the same $216 of covered-area permit fee would apply, but the area with A/C would be charged at $0.282 rather than $0.94 — $705 instead of $2,350 — and plan review would be charged on the conditioned area only, at $0.162 rather than $0.54, which is $405. The pattern is the same in each case: 30% of the area rate, and no covered-area line in the plan review.",
    },
    faqs: [
      {
        question: "How much is a building permit in Scottsdale?",
        answer:
          "It depends on area, not on construction cost. The permit fee is $237, plus $0.94 per square foot of air-conditioned area, plus $0.54 per square foot of covered area that is not air-conditioned. Add plan review from the City's separate schedule at $0.54 and $0.34 per square foot with no base fee. A 2,500 square foot new home with 400 square feet of covered patio comes to $4,289 including plan review.",
      },
      {
        question: "Does Scottsdale charge permits on construction valuation?",
        answer:
          "No. There is no valuation anywhere in the permit or plan review schedule. The City measures the building instead — the area with A/C at $0.94 a square foot and the covered area without it at $0.54 — so two buildings of the same size pay the same permit fee whatever they cost to build.",
      },
      {
        question: "What is the difference between 'area with A/C' and 'covered area'?",
        answer:
          "They are two different areas of the same building, charged at two different rates. The area with A/C is the air-conditioned floor area at $0.94 a square foot. The covered area is what is roofed but not air-conditioned — a covered patio, a carport, an enclosed bay — at $0.54. They are not the same measurement counted twice, and entering your full floor area against both rows overstates the fee.",
      },
      {
        question: "How much does a remodel permit cost in Scottsdale?",
        answer:
          "A remodel keeps the full $237 base fee and pays the full $0.54 a square foot on any covered area without A/C, but the area with A/C is charged at 30% of the rate — $0.282 a square foot, which the schedule prints as '$0.94 sq. ft. x 30%'. Plan review is 30% of its rate too, $0.162 a square foot, and the remodel rows price the conditioned area only, with no covered-area line.",
      },
      {
        question: "Does Scottsdale charge separately for electrical, plumbing or mechanical permits?",
        answer:
          "The City issues all three, and publishes no rate for any of them. There is no per-outlet, per-fixture, per-circuit or per-ton row in the fee schedule, so the trades are paid for through the building permit's area rate. The one figure the City does publish for trade work on its own is a minimum: $121 for a permit covering one discipline and $379 for one covering all disciplines. A water heater is priced flat at $63.",
      },
      {
        question: "Is plan review included in the Scottsdale permit fee?",
        answer:
          "No, it is a separate schedule with its own rates: $0.54 per square foot of area with A/C and $0.34 per square foot of covered area, with no base fee. That makes it cheaper than the permit fee rather than a percentage of it, and it never adds a second $237.",
      },
    ],
    seoTitle: "Scottsdale building permit cost: area-based fees and plan review",
    seoDescription:
      "Scottsdale charges $237 plus $0.94 per square foot with A/C and $0.54 per square foot covered, with plan review at $0.54 and $0.34. Every published rate, including the 30% remodel rate.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: SCOTTSDALE_LAST_VERIFIED,
  },
  {
    jurisdictionKey: SCOTTSDALE_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    slug: "electrical-permit-cost",
    title: "Scottsdale electrical permit cost",
    intro:
      "Scottsdale publishes no electrical rate. There is no per-outlet, per-circuit or per-panel figure anywhere in Exhibit A, and no electrical permit fee. Electrical work on a building project is paid for by that project's permit, which the City prices by area — $0.94 per square foot of air-conditioned area and $0.54 per square foot of covered area. For electrical permits taken out on their own the City publishes three flat figures: a temporary power pole is $121, a residential solar permit is $168, and a permit covering a single discipline carries a minimum permit fee of $121.",
    localSummary:
      "Start with the floor, because it is the number most people are actually asking about and it is the one that needs the most care. Scottsdale's Miscellaneous schedule publishes **'Minimum Permit (one discipline) $121'** and **'Minimum Combination (all disciplines) $379'**. Those are the only figures in the whole of Exhibit A that speak to how a permit for one trade is priced. They are minimums, published as floors rather than as rates: the City does not say what area a one-discipline permit is measured against, so $121 is what the City publishes as a floor and not an estimate of what a given job will cost. Anything the City does price flat — the items below — is charged at that flat figure instead.\n\nThe electrical items it prices flat are short and specific. A **temporary power pole** is $121, which is one of the few things in Exhibit A priced per permit rather than per square foot. A **residential solar permit** is $168 — the electrified side of solar; the thermal side, a solar water heater, is a plumbing permit at $90 on the plumbing page. A **re-inspection** is $121.\n\nThen there is what the City does not publish, and this is the part that matters when the numbers above look small. Electrical work carried out as part of constructing or remodelling a building is not charged on its own at all: it is inside the building permit, whose fee is driven by two areas — $0.94 a square foot with air conditioning and $0.54 covered — and which is the same amount whether the project contains one circuit or forty. A 2,500 square foot house is charged the same permit fee whatever electrical work it contains. If your question is what the electrical work adds to a project, the answer is nothing: the project's area sets the fee, and the electrical page you are reading is about permits taken out for electrical work on their own.\n\nFinally, the temporary power pole and the $121 minimum do not add up here, and that is deliberate rather than an oversight. The schedule lists the pole as a fee of its own and never says whether it is also the one-discipline permit, so charging $242 for a permit the City prices at $121 would be inventing a sum the document does not contain. The rules on this page price one published item at a time.",
    notIncluded:
      "This estimate is a single fee published by the City of Scottsdale for the item selected, computed by this site's engine. It is not a total project cost, and it does not include:\n\n- **The building permit fee** that carries electrical work on a construction or remodelling project. That fee is priced by area — $237 plus $0.94 per square foot with A/C and $0.54 covered — and is on the building permit page, not this one.\n- **The $379 minimum for a permit covering all disciplines.** Published in the same row as the $121 minimum and not computed here, because it is a floor on the permit that covers every discipline, which is the building permit, whose fee is published in full.\n- **Plan review**, which for a building project is a second pair of area rates, $0.54 and $0.34 per square foot, with no base fee. It is computed on the building permit page. Where a project needs the review, that fee in the review schedule prices the review of the building, and the schedule does not price the review of a stand-alone electrical permit separately.\n- **Commercial solar**, which is $331 rather than $168. This page prices the residential figure because that is the one in the schedule; the commercial figure is listed here and not offered as an option.\n- **Every other electrical-adjacent fee** published in Exhibit A: off-hours inspections $379, plan review extension requests $379, permit extension requests $379, the annual facilities permit, industrial racking $379, and every miscellaneous or revision review at $121 an hour.\n- **Electric vehicle chargers, generators, fire alarm and low-voltage work**, none of which the schedule prices by item.\n- **Fees on the City's other schedules** — application fees, right-of-way annual fees, expedited plan review, in-lieu parking, records and stormwater management — and anything for property outside the Scottsdale city limits.\n- Anything charged by Maricopa County, which is not described here because whether the county issues construction permits for unincorporated areas has not been verified against the county's own site.",
    workedExample: {
      scenario:
        "A temporary power pole permit on its own — the one electrical permit the City prices flat and in full, with no minimum and no area measurement behind it.",
      inputs: { occupancy: "residential", custom: { schedule_item: "temporary_power_pole" } },
      notes:
        "$121, published as 'Temporary Power Pole $121' in the Miscellaneous permit schedule. Nothing else applies: the one-discipline minimum is an alternative to this fee rather than an addition to it, and it is shown as excluded rather than added.\n\nTwo things to carry away from the arithmetic. The first is that this is a permit fee and not a project's total — a temporary power pole on a construction site usually sits alongside the building permit, which is priced by area on the building page. The second is that the schedule prices only the pole. Hiring a pole is not part of it, setting it is not part of it, and the Customer's own electric utility has charges of its own that are not in Exhibit A at all.",
    },
    faqs: [
      {
        question: "How much is an electrical permit in Scottsdale?",
        answer:
          "Scottsdale publishes a minimum permit fee of $121 for a permit covering a single discipline, and no electrical rate of any kind beyond that. Electrical work on a building project is paid for by the project's permit, which the City prices by area instead of by trade. A temporary power pole is a flat $121, and a residential solar permit is $168.",
      },
      {
        question: "Does Scottsdale charge per outlet or per circuit?",
        answer:
          "No. There is no per-outlet, per-circuit, per-panel or per-lighting-fixture rate anywhere in the City's fee schedules. What the City charges for is area: $0.94 per square foot of air-conditioned space and $0.54 per square foot of covered space on the building permit. A project with ten outlets and a project with a hundred of the same size pay the same permit fee.",
      },
      {
        question: "Is the $121 minimum the whole permit fee?",
        answer:
          "It is published as a minimum, not as a rate, so it is a floor rather than an estimate. Where the City prices an item flat — a temporary power pole, a water heater, a residential solar system — that figure applies instead. Where the work is part of a building project, the building permit's area-based fee applies. $121 is what the City publishes as its floor for a one-discipline permit, and the City does not say what area a trade permit is measured against.",
      },
      {
        question: "Are electrical permits separate from the building permit?",
        answer:
          "Scottsdale issues them and does not price them separately for construction work. The area rate on the building permit covers the electrical work in the project — the same amount whether the job has one circuit or forty — and the schedule's one-discipline minimum is the figure it publishes for a permit taken out for a single trade on its own.",
      },
      {
        question: "What does a solar permit cost in Scottsdale?",
        answer:
          "A residential solar permit is $168 and a commercial one is $331, both flat fees in the Miscellaneous permit schedule that replace the area-based permit fee rather than adding to it. Solar water heaters are a plumbing permit at $90.",
      },
      {
        question: "What does a re-inspection cost?",
        answer:
          "$121, published as a single line in the Miscellaneous permit schedule. It is charged when a re-inspection happens, which is why no estimate on this site includes it by default.",
      },
    ],
    seoTitle: "Scottsdale electrical permit cost: what the City actually publishes",
    seoDescription:
      "Scottsdale publishes no electrical rate: a $121 minimum for a one-discipline permit, a $121 temporary power pole, a $168 residential solar permit, and area-based fees on the building permit that carry the work.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: SCOTTSDALE_LAST_VERIFIED,
  },
  {
    jurisdictionKey: SCOTTSDALE_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    slug: "plumbing-permit-cost",
    title: "Scottsdale plumbing permit cost",
    intro:
      "Scottsdale publishes no plumbing rate. There is no per-fixture, per-water-heater or per-gas-outlet figure in Exhibit A. The one plumbing item the City prices flat is the most common plumbing job there is: a water heater permit is $63. A solar water heater is $90. For a permit covering a single discipline on its own the City publishes a minimum permit fee of $121, and plumbing work on a building project is paid for by that project's permit, priced by area at $0.94 per square foot with air conditioning and $0.54 covered.",
    localSummary:
      "$63 is the headline, and it is a real published fee rather than a minimum: the Miscellaneous permit schedule prints **'Water Heaters (except solar) $63'** as its own line. That 'except solar' is the City's carve-out and it matters, because the same schedule prices a **solar water heater at $90** — a different permit at a different price, not a discount on this one. Both are flat, and neither is measured against anything.\n\nEverything else about plumbing in Scottsdale runs the other way. The City does not price fixtures, does not price gas outlets, and does not price a plumbing permit separately from the building it serves. On a new home or a remodel, the plumbing is inside the building permit, and that permit is priced by area: $237, plus $0.94 per square foot of air-conditioned area, plus $0.54 per square foot of covered area. A house with one bathroom and a house with five of the same size are charged identically. That is a real difference from Houston, where a plumbing permit is $34.24 for the first three fixtures plus $11.41 for each additional fixture, and from Dallas, where a trade inspection is priced by how many trades the job involves.\n\nThe remaining figure to know is the floor: **'Minimum Permit (one discipline) $121'**, the only thing the City publishes about a permit taken out for a single trade on its own. It is published as a minimum and not as a rate; where the schedule prices an item flat — a water heater, a solar water heater — that figure applies instead. The $121 and the $63 are alternatives here for exactly that reason, and adding them would invent a $184 permit the document does not contain.\n\nWhat is not published is worth stating plainly, because it is the most common plumbing fee people go looking for. There is no fee for a water heater replacement beyond the $63 permit, no separate gas line charge, no sewer or water connection charge, and no per-fixture rate. The connection charges a project pays to the utilities are not in Exhibit A at all.",
    notIncluded:
      "This estimate is a single fee published by the City of Scottsdale for the item selected, computed by this site's engine. It is not a total project cost, and it does not include:\n\n- **The building permit fee** that carries plumbing work on a construction or remodelling project: $237 plus the two area rates, on the building permit page rather than this one.\n- **The $379 minimum for a permit covering all disciplines**, published beside the $121 minimum and not computed here.\n- **Plan review**, a second pair of area rates in a schedule of its own at $0.54 and $0.34 per square foot with no base fee, computed on the building permit page.\n- **Water and sewer connection charges**, which are charged by the utility and are not in Exhibit A.\n- **Every other plumbing-adjacent fee** the schedules publish: off-hours inspections $379, on-site grading $121, pools and attached spas at $0.61 per square foot plus the $237 base and a $195 planning inspection fee, stand-alone spas $142, refuse enclosure permits at $305 and $410, and every miscellaneous or revision review at $121 an hour.\n- **Backflow prevention testing and devices**, which Scottsdale does not price by device in this schedule.\n- **Gas piping and medical gas**, which have no separate rate.\n- **Fees on the City's other schedules** — application fees, right-of-way annual fees, expedited plan review, in-lieu parking, records and stormwater management — and anything for property outside the Scottsdale city limits.\n- Anything charged by Maricopa County, which is not described here because whether the county issues construction permits for unincorporated areas has not been verified against the county's own site.",
    workedExample: {
      scenario:
        "A water heater permit on its own — the one plumbing item the City prices flat, and the most common plumbing permit there is.",
      inputs: { occupancy: "residential", custom: { schedule_item: "water_heater" } },
      notes:
        "$63, published as 'Water Heaters (except solar) $63' in the Miscellaneous permit schedule. The one-discipline minimum is shown as excluded rather than added to it: the two are alternatives, and the schedule does not say the $121 floors the $63.\n\nThe practical reading is that a like-for-like water heater replacement in Scottsdale is a $63 permit with no plan review and no area measurement attached to it, and that a solar water heater is a $90 permit instead. Everything else about the job — the labour, the unit, the disposal of the old one — is not a permit fee and is not in this figure.",
    },
    faqs: [
      {
        question: "How much is a plumbing permit in Scottsdale?",
        answer:
          "Scottsdale prices one plumbing item flat: a water heater permit is $63, or $90 if it is a solar water heater. Everything else is priced through the building permit by area rather than by fixture or by trade, and a permit taken out for a single discipline on its own carries a published minimum of $121.",
      },
      {
        question: "Does Scottsdale charge per plumbing fixture?",
        answer:
          "No. There is no per-fixture, per-water-closet or per-gas-outlet rate in Exhibit A. Plumbing on a construction project is inside the building permit, which is priced by area — $0.94 per square foot of air-conditioned space and $0.54 covered — so fixtures do not change the fee. Houston, by contrast, charges $34.24 for the first three fixtures and $11.41 for each additional one.",
      },
      {
        question: "Do I need a permit to replace a water heater in Scottsdale?",
        answer:
          "The City publishes a $63 permit fee for a water heater, which is the fee it charges when a permit is taken out. Whether a straight replacement needs one is the department's call rather than a fee schedule's, and nothing on this site decides it. The published fee is $63, and $90 for a solar water heater.",
      },
      {
        question: "How much is a solar water heater permit?",
        answer:
          "$90. It is published separately from the $63 an ordinary water heater costs, which is why the water heater row says 'except solar'. That is a permit fee for the plumbing side of a solar thermal system; the electrified side, a residential solar photovoltaic system, is a $168 permit.",
      },
      {
        question: "Are water and sewer connections included?",
        answer:
          "No. Connection charges are the utility's and are not part of the City's fee schedules, and there is no sewer or water connection rate in Exhibit A. The permit fee covers the plumbing work in the building; what a project pays to connect is a separate matter.",
      },
      {
        question: "Is the $121 minimum charged on top of the $63 water heater fee?",
        answer:
          "No, and this site does not add them. The $121 is published as a minimum for a permit covering one discipline, and the $63 is published as the fee for a water heater permit. The schedule lists them as separate fees and does not say the minimum floors the $63, so charging $184 for a permit the City prices at $63 would be inventing a total.",
      },
    ],
    seoTitle: "Scottsdale plumbing permit cost: the published water heater fee",
    seoDescription:
      "Scottsdale prices a water heater permit at $63 and a solar water heater at $90, with no per-fixture rate: plumbing on a building project is carried by the area-based building permit.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: SCOTTSDALE_LAST_VERIFIED,
  },
];

/* -------------------------------------------------------------------------- */
/* Verification ledger                                                        */
/* -------------------------------------------------------------------------- */

const RESEARCHER = "Permit Fee Intelligence research pass 4";

/** The second read of the same Exhibit A, for the flat trade fees in the Miscellaneous schedule. */
const RESEARCHER_TRADES = "Permit Fee Intelligence research pass 5 (trade permits)";

const verifications: SeedVerification[] = [
  {
    entityType: "source",
    entityKey: PERMIT_SCHEDULE_RESIDENTIAL,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: SCOTTSDALE_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PERMIT_SCHEDULE_RESIDENTIAL,
    notes:
      "Both pages fetched live from scottsdaleaz.gov and read, with the table extracted three ways to settle which amount belongs to which row: -raw (content-stream order), -layout and -table. -layout interleaves the label column with the amount column on this document and produces pairings that are wrong, so -table was used to read the fees and -layout only to see that the mispairing was a layout artefact rather than a second fee. Hash of the file read: 6f43f6738e12f1258a92cf6c7bc82a4c7c9b27bed94bd612100d9072a8d9cb08.",
  },
  {
    entityType: "source",
    entityKey: PERMIT_SCHEDULE_COMMERCIAL,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: SCOTTSDALE_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PERMIT_SCHEDULE_COMMERCIAL,
    notes:
      "Both pages fetched live and read with -table. Cross-checked against the residential schedule row by row: base fee, area-with-A/C rate and covered-area rate are identical, and the 30% remodel percentage is identical. That comparison is what removed the need for an occupancy condition on any rule. Hash: e6910aecc536134b6ec6d04266381bfbd5f328f35c297645d0a214b8ac4594e4.",
  },
  {
    entityType: "source",
    entityKey: PLAN_REVIEW_SCHEDULE_RESIDENTIAL,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: SCOTTSDALE_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PLAN_REVIEW_SCHEDULE_RESIDENTIAL,
    notes:
      "Fetched live and read with -table. No base fee appears anywhere on the page, which is the distinction that makes Scottsdale's plan review structurally different from Phoenix's and from Houston's. Hash: b952eed35cff264a6a607b110a57b650c79cef9f6ebf13518ad320d4b5a4939d.",
  },
  {
    entityType: "source",
    entityKey: PLAN_REVIEW_SCHEDULE_COMMERCIAL,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: SCOTTSDALE_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PLAN_REVIEW_SCHEDULE_COMMERCIAL,
    notes:
      "Fetched live and read with -table. Confirms the same $0.54 and $0.34 area rates for commercial, commercial additions, apartments and condos, and confirms that the commercial remodel and tenant-improvement row prices the area with A/C alone at 30% with no covered-area line — the same asymmetry the residential remodel row has. Hash: 6ac4debe2a812e27004e1bee5672a1db8fc5083544ab098fdddb77e340a37918.",
  },
  {
    entityType: "source",
    entityKey: MISC_SCHEDULE,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: SCOTTSDALE_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MISC_SCHEDULE,
    notes:
      "Both pages fetched live and read with -table. The source of every fee this site names and does not compute, and of the only evidence in the project about how a single-trade permit is priced: 'Minimum Permit (one discipline) $121' and 'Minimum Combination (all disciplines) $379'. Hash: 489d15a21aa3713a and following; see research/arizona/scottsdale.md.",
  },
  {
    entityType: "source",
    entityKey: FEES_PAGE,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: SCOTTSDALE_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: FEES_PAGE,
    notes:
      "Read on 2026-09-24; the City's own 'Last Updated' on the page is 2 July 2026. It is where the fiscal-year heading and the 1 July 2026 effective date are stated on the web, and where the four permit schedules and the accompanying application, right-of-way and stormwater schedules are listed. Its link to the City's permit fee calculator at eservices.scottsdaleaz.gov answered 403 to this environment; no figure was taken from it.",
  },
  {
    entityType: "source",
    entityKey: ONE_STOP_SHOP_PAGE,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: SCOTTSDALE_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: ONE_STOP_SHOP_PAGE,
    notes:
      "Read on 2026-09-24; the City's own 'Last Updated' is 13 August 2026. Supplies the department's address, phone, email and opening hours. The same address is printed in the footer of every fee schedule page, which is an independent confirmation of it inside the fee documents themselves.",
  },
  {
    entityType: "fee_rule",
    entityKey: "PERMIT-BASE",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: SCOTTSDALE_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PERMIT_SCHEDULE_RESIDENTIAL,
    notes:
      "'Base fee $237', printed identically under single family custom, single family addition, single family remodel, single family remodel with roof modification, single family detached structure, commercial building permit, commercial addition, commercial remodel (existing), shell only, T.I. (new) and vanilla shell T.I. — and printed for fence walls and retaining walls as well. The rule is scoped to new construction, additions and remodels here, which are the rows whose area treatment this site models.",
  },
  {
    entityType: "fee_rule",
    entityKey: "PERMIT-AC-AREA",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: SCOTTSDALE_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PERMIT_SCHEDULE_RESIDENTIAL,
    notes:
      "'Livable area with A/C $0.94 sq. ft.' on the residential single family custom and single family addition rows, and 'Area with A/C $0.94 sq. ft.' on the commercial building permit and commercial addition rows. Identical figure under two labels; both read from -table extraction, and checked in -raw to confirm the 0.94 the -layout pass showed belonged to the same row.",
  },
  {
    entityType: "fee_rule",
    entityKey: "PERMIT-AC-REMODEL",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: SCOTTSDALE_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PERMIT_SCHEDULE_RESIDENTIAL,
    notes:
      "'Livable area with A/C $0.94 sq. ft. x 30%' on the single family remodel row, and 'Area with A/C $0.94 sq. ft. x 30%' on the commercial remodel (existing), T.I. (new) and multi-family build out, and vanilla shell T.I. rows. Stored as the exact fraction 282/10 cents per square foot rather than as a rounded percentage, so $0.94 x 30% is charged as published. The base fee is unchanged at $237 and the covered-area rate is unscaled at $0.54 on every one of those rows.",
  },
  {
    entityType: "fee_rule",
    entityKey: "PERMIT-COVERED-AREA",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: SCOTTSDALE_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PERMIT_SCHEDULE_RESIDENTIAL,
    notes:
      "'Covered area (non A/C) $0.54 sq. ft.' on all three residential rows modelled and on the commercial building permit, addition, remodel, shell-only, T.I. and vanilla-shell rows — the one rate in the schedule that never changes, in either direction, including under a remodel. It is a second area rather than a discount on the first, which is why the engine gained a distinct basis for it.",
  },
  {
    entityType: "fee_rule",
    entityKey: "REVIEW-AC-AREA",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: SCOTTSDALE_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PLAN_REVIEW_SCHEDULE_RESIDENTIAL,
    notes:
      "'Livable area with A/C $0.54 sq. ft.' on single family custom homes, single family additions and single family standard plan; 'Livable area with A/C $0.54 sq. ft.' again on commercial, commercial addition and apartments/condos. No base fee accompanies it anywhere on either page.",
  },
  {
    entityType: "fee_rule",
    entityKey: "REVIEW-AC-REMODEL",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: SCOTTSDALE_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PLAN_REVIEW_SCHEDULE_RESIDENTIAL,
    notes:
      "'Livable area with A/C $0.54 sq. ft. x 30%' on the residential single family remodel row and on the commercial remodel and tenant-improvement row. Neither row prints a covered-area line, so a remodel is reviewed on its conditioned area only — recorded as a rule scope, not as a missing component. Stored as the exact fraction 162/10 cents per square foot.",
  },
  {
    entityType: "fee_rule",
    entityKey: "REVIEW-COVERED-AREA",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: SCOTTSDALE_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PLAN_REVIEW_SCHEDULE_RESIDENTIAL,
    notes:
      "'Covered area (non A/C) $0.34 sq. ft.' on single family custom homes, single family additions, single family standard plan (printed there as 'covered area (non-A/C)'), commercial, commercial addition and apartments/condos. Its absence from the remodel rows is reproduced by this rule's scope.",
  },
  {
    entityType: "fee_schedule",
    entityKey: SCOTTSDALE_KEYS.planReviewSchedule,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: SCOTTSDALE_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PLAN_REVIEW_SCHEDULE_RESIDENTIAL,
    notes:
      "The schedule row behind the plan review fee, paired with the residential document and confirmed against the commercial one. Both carry the same effective date, resolution number and area rates. Recorded as a fee_schedule verification rather than a source one, because it is the schedule row being asserted independent of the PDF it was read from.",
  },
  {
    entityType: "permit_page",
    entityKey: "building-permit-cost",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: SCOTTSDALE_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PERMIT_SCHEDULE_RESIDENTIAL,
    notes:
      "Seven rules transcribed from the permit and plan review schedules, with the household-and-areas example computed by the engine. The fees named and not modelled — the 70% roof modification, the 95% shell row, the 25% foundation row, the sub-500 sq ft addition, both minimum permit fees, certificate of occupancy and shell, GIS fee, pools and spas, fences and retaining walls, signs, demolition and the hourly services — are listed in full on the page and in research/arizona/scottsdale.md.",
  },
  {
    entityType: "jurisdiction_profile",
    entityKey: SCOTTSDALE_KEYS.jurisdiction,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: SCOTTSDALE_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: FEES_PAGE,
    notes:
      "Hub content built from the four permit and plan review schedules and the department's own fees and One Stop Shop pages, including the department's published address, phone, email and hours. The City's permit fee calculator was reachable as a link but answered 403 to this environment, and is described as unread rather than used.",
  },
  {
    entityType: "fee_rule",
    entityKey: "TRADE-MINIMUM-ONE-DISCIPLINE",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: SCOTTSDALE_LAST_VERIFIED,
    verifiedBy: RESEARCHER_TRADES,
    sourceKey: MISC_SCHEDULE,
    notes:
      "Miscellaneous Permit Fees: 'Minimum Permit (one discipline) $121'. Modelled as the fee for a permit covering one discipline where no flat item fee prices it, and named on both trade pages as a floor rather than a rate — the City never says what area a trade permit is measured against, so the floor is the only published figure and the page says so in those words. The $379 combination minimum is deliberately not computed; see research/arizona/scottsdale.md § 5.5.",
  },
  {
    entityType: "fee_rule",
    entityKey: "TRADE-MINIMUM-ONE-DISCIPLINE",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: SCOTTSDALE_LAST_VERIFIED,
    verifiedBy: RESEARCHER_TRADES,
    sourceKey: MISC_SCHEDULE,
    notes:
      "The same published row, on the plumbing permit. Recorded separately because the ledger's natural key for a fee rule is its code within a permit type.",
  },
  {
    entityType: "fee_rule",
    entityKey: "TEMP-POWER-POLE",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: SCOTTSDALE_LAST_VERIFIED,
    verifiedBy: RESEARCHER_TRADES,
    sourceKey: MISC_SCHEDULE,
    notes:
      "Miscellaneous Permit Fees: 'Temporary Power Pole $121'. The one electrical permit the City prices flat, and the electrical page's worked example. Conditional on the item being selected so that it never adds to the one-discipline minimum: the schedule does not say the two are the same permit, and it does not say they are different ones either.",
  },
  {
    entityType: "fee_rule",
    entityKey: "SOLAR-RESIDENTIAL",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: SCOTTSDALE_LAST_VERIFIED,
    verifiedBy: RESEARCHER_TRADES,
    sourceKey: MISC_SCHEDULE,
    notes:
      "Miscellaneous Permit Fees: 'Solar Residential $168', against 'Solar Commercial $331'. The commercial figure is named on the page and not modelled, so the rule cannot be picked up by a commercial job without an explicit decision to model it.",
  },
  {
    entityType: "fee_rule",
    entityKey: "WATER-HEATER",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: SCOTTSDALE_LAST_VERIFIED,
    verifiedBy: RESEARCHER_TRADES,
    sourceKey: MISC_SCHEDULE,
    notes:
      "Miscellaneous Permit Fees: 'Water Heaters (except solar) $63'. A flat published fee rather than a minimum, unlike Phoenix's $98 water heater row, which is why this one is computed and that one is not. The plumbing page's worked example.",
  },
  {
    entityType: "fee_rule",
    entityKey: "SOLAR-WATER-HEATER",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: SCOTTSDALE_LAST_VERIFIED,
    verifiedBy: RESEARCHER_TRADES,
    sourceKey: MISC_SCHEDULE,
    notes:
      "Miscellaneous Permit Fees: 'Solar Water Heaters $90'. A separate rule rather than a condition on the $63 water heater fee, because the City's own row carves solar out of the other one.",
  },
  {
    entityType: "fee_rule",
    entityKey: "REINSPECTION",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: SCOTTSDALE_LAST_VERIFIED,
    verifiedBy: RESEARCHER_TRADES,
    sourceKey: MISC_SCHEDULE,
    notes:
      "Miscellaneous Permit Fees: 'Reinspection $121'. Conditional, and in no worked example: it is a fee for an event rather than for a permit, and adding it by default would overstate every job that passes its inspections.",
  },
  {
    entityType: "permit_page",
    entityKey: "electrical-permit-cost",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: SCOTTSDALE_LAST_VERIFIED,
    verifiedBy: RESEARCHER_TRADES,
    sourceKey: MISC_SCHEDULE,
    notes:
      "Four rules, all from the Miscellaneous permit schedule: the temporary power pole, the residential solar permit, the one-discipline minimum and the re-inspection. The page states that the City publishes no electrical rate, that the area-based building permit carries electrical work on a project, and that the $121 is a floor rather than a rate. Worked example computed by the engine: a temporary power pole permit, $121.00.",
  },
  {
    entityType: "permit_page",
    entityKey: "plumbing-permit-cost",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: SCOTTSDALE_LAST_VERIFIED,
    verifiedBy: RESEARCHER_TRADES,
    sourceKey: MISC_SCHEDULE,
    notes:
      "Four rules: the water heater fee, the solar water heater fee, the one-discipline minimum and the re-inspection. The page states that no per-fixture rate exists, that the minimum and the flat item fees are alternatives rather than a sum, and links to the building page for work carried on a project. Worked example computed by the engine: a water heater permit, $63.00.",
  },
];

/* -------------------------------------------------------------------------- */
/* Export                                                                     */
/* -------------------------------------------------------------------------- */

export const scottsdaleSeed: JurisdictionSeed = {
  state,
  county,
  jurisdiction,
  departments,
  sources,
  // Empty: Arizona, Maricopa County, and the permit types are global rows that
  // Phoenix and Houston define.
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
export const SCOTTSDALE_PUBLISHED_PERMIT_PAGES = scottsdaleSeed.permitPages.filter(
  (page) => page.publishStatus === "published" && !page.noindex,
);

/** Permit pages deliberately held back, with the reason research/arizona/scottsdale.md gives. */
export const SCOTTSDALE_WITHHELD_PERMIT_PAGES = scottsdaleSeed.permitPages.filter(
  (page) => page.publishStatus !== "published" || page.noindex,
);

/**
 * Every source key a rule cites, so a test can assert each one is a source the
 * payload actually defines. A rule pointing at a key nothing defines inserts with a
 * null source, which is a page that cites nothing — a silent failure otherwise.
 */
export const SCOTTSDALE_RULE_SOURCE_KEYS = [
  SCOTTSDALE_PERMIT_SOURCE_KEY,
  SCOTTSDALE_PLAN_REVIEW_SOURCE_KEY,
] as const;

/** The document keys for the two Schedule A pages the rules do not cite. */
export { PERMIT_SCHEDULE_COMMERCIAL, PLAN_REVIEW_SCHEDULE_COMMERCIAL };
