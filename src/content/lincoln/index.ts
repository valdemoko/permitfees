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
  LINCOLN_BUILDING_FEE_EFFECTIVE_FROM,
  LINCOLN_BUILDING_SOURCE_KEY,
  LINCOLN_ELECTRICAL_BASE_FEE,
  LINCOLN_ELECTRICAL_BRANCH_CIRCUIT,
  LINCOLN_ELECTRICAL_DORMANT_SERVICE,
  LINCOLN_ELECTRICAL_FEE_EFFECTIVE_FROM,
  LINCOLN_ELECTRICAL_REINSPECTION,
  LINCOLN_ELECTRICAL_SERVICE_ROWS,
  LINCOLN_ELECTRICAL_SOURCE_KEY,
  LINCOLN_GAS_PIPING_APPLICATION_SOURCE_KEY,
  LINCOLN_GAS_PIPING_FEE_EFFECTIVE_FROM,
  LINCOLN_GAS_PIPING_FEE_SOURCE_KEY,
  LINCOLN_GAS_PIPING_REGISTRATION_SOURCE_KEY,
  LINCOLN_GAS_PIPING_RULES,
  LINCOLN_GAS_PIPING_SCOPE_SOURCE_KEY,
  LINCOLN_MECHANICAL_SOURCE_KEY,
  LINCOLN_PLAN_REVIEW,
  LINCOLN_PLUMBING_SOURCE_KEY,
  LINCOLN_REINSPECTION_FEE,
  LINCOLN_STRUCTURAL_BRACKETS,
} from "./fee-rules";

export * from "./fee-rules";

/**
 * The complete Lincoln, Nebraska seed payload.
 *
 * Every figure traces to research/nebraska/lincoln.md, which traces to the Lincoln
 * Municipal Code. Nothing is estimated.
 *
 * Lincoln is published with **three** permit pages: building, electrical, and mechanical.
 * The mechanical page is possible because Lincoln's code publishes one trade-permit fee
 * table after all — the Lincoln Gas Piping Systems Code, Ch. 24.05, whose Sec. 24.05.380
 * prices a fuel-gas permit by outlet count. Sec. 25.12.180 makes it operative by deleting
 * the International Fuel Gas Code's own Chapter 4 and sending gas piping installations to
 * that code.
 *
 * What is still absent is stated rather than filled in: Lincoln publishes no plumbing
 * permit fee and no general mechanical (HVAC) fee. Sec. 24.12.095 and Sec. 25.06.090 each
 * defer the amount to a City Council schedule "provided to the applicant by the Authority
 * Having Jurisdiction". No plumbing page is published, and the mechanical page says which
 * half of its subject the code does not price.
 */

const RESEARCHER = "Permit Fee Intelligence research pass 8 (Nebraska)";

export const LINCOLN_LAST_VERIFIED = "2026-09-25";

export const LINCOLN_KEYS = {
  state: "ne",
  county: "lancaster-county",
  jurisdiction: "lincoln",
  buildingSchedule: "lincoln-building-schedule",
  electricalSchedule: "lincoln-electrical-schedule",
  gasPipingSchedule: "lincoln-gas-piping-schedule",
} as const;

const state: SeedState = {
  code: "NE",
  slug: "nebraska",
  name: "Nebraska",
  fipsCode: "31",
};

const county: SeedCounty = {
  key: LINCOLN_KEYS.county,
  slug: "lancaster-county",
  name: "Lancaster County",
  fipsCode: "31109",
};

const jurisdiction: SeedJurisdiction = {
  key: LINCOLN_KEYS.jurisdiction,
  stateKey: LINCOLN_KEYS.state,
  countyKey: LINCOLN_KEYS.county,
  type: "city",
  slug: "lincoln",
  name: "Lincoln",
  officialName: "City of Lincoln",
  websiteUrl: "https://www.lincoln.ne.gov/",
  permitPortalUrl: "https://aca-prod.accela.com/LINCOLN/Cap/CapHome.aspx?module=Building",
  timezone: "America/Chicago",
  isActive: true,
};

const departments: SeedDepartment[] = [
  {
    key: "lincoln-building-safety",
    jurisdictionKey: LINCOLN_KEYS.jurisdiction,
    kind: "building",
    name: "Planning Department — Building and Safety",
    phone: "(402) 441-7521",
    email: null,
    url: "https://www.lincoln.ne.gov/City/Departments/PDS/Building-Safety",
    addressLine: null,
    hours: null,
    notes:
      "Issues and inspects building, electrical, plumbing and mechanical permits for property inside the Lincoln city limits. The telephone number is the one Building and Safety publishes for permit questions.",
  },
];

const sources: SeedSource[] = [
  {
    key: LINCOLN_BUILDING_SOURCE_KEY,
    jurisdictionKey: LINCOLN_KEYS.jurisdiction,
    title:
      "Lincoln Municipal Code Sec. 20.06.130, Sec. 109.2 — Schedule of Permit Fees (Tables 1A and 1B)",
    url: "https://online.encodeplus.com/regs/lincoln-ne/doc-view.aspx?ajax=0&secid=10138",
    sourceType: "municipal_code",
    issuingAuthority: "City of Lincoln",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: LINCOLN_BUILDING_FEE_EFFECTIVE_FROM,
    retrievedAt: LINCOLN_LAST_VERIFIED,
    lastVerifiedAt: LINCOLN_LAST_VERIFIED,
    notes:
      "Read 2026-09-25 from the enCodePlus-hosted municipal code. Amended by Ord. 21786 §42, September 29, 2025. Table 1A is the building permit table; Sec. 109.2.1, read on the same page, sets plan review at 65% of the permit fee with a $100 floor.",
  },
  {
    key: LINCOLN_ELECTRICAL_SOURCE_KEY,
    jurisdictionKey: LINCOLN_KEYS.jurisdiction,
    title: "Lincoln Municipal Code Sec. 23.10.520 — Permit Fees (Electrical Contractor Fee Schedule)",
    url: "https://online.encodeplus.com/regs/lincoln-ne/doc-view.aspx?ajax=0&secid=10608",
    sourceType: "municipal_code",
    issuingAuthority: "City of Lincoln",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: LINCOLN_ELECTRICAL_FEE_EFFECTIVE_FROM,
    retrievedAt: LINCOLN_LAST_VERIFIED,
    lastVerifiedAt: LINCOLN_LAST_VERIFIED,
    notes:
      "Read 2026-09-25. Amended by Ord. 21875 §1, June 01, 2026. A $30.00 base fee added to everything else, $6.00 per branch circuit or feeder, service equipment priced by amperage, and a $50.00 re-inspection fee.",
  },
  {
    key: LINCOLN_PLUMBING_SOURCE_KEY,
    jurisdictionKey: LINCOLN_KEYS.jurisdiction,
    title: "Lincoln Municipal Code Sec. 24.12.095 — Uniform Plumbing Code Sec. 104.5 Amended; Fees",
    url: "https://online.encodeplus.com/regs/lincoln-ne/doc-view.aspx?ajax=0&secid=10745",
    sourceType: "municipal_code",
    issuingAuthority: "City of Lincoln",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: LINCOLN_LAST_VERIFIED,
    lastVerifiedAt: LINCOLN_LAST_VERIFIED,
    notes:
      "Read 2026-09-25. The section states that a plumbing permit fee shall be paid but that \"the fees shall be set by the City Council and shall be provided to the applicant by the Authority Having Jurisdiction\" — the amount is not published in the code. The doubling rule for work started before a permit and the two-thirds refund limit are the only figures it carries.",
  },
  {
    key: LINCOLN_MECHANICAL_SOURCE_KEY,
    jurisdictionKey: LINCOLN_KEYS.jurisdiction,
    title: "Lincoln Municipal Code Sec. 25.06.090 — Mechanical Code Sec. 109.2 Amended; Fee Schedule",
    url: "https://online.encodeplus.com/regs/lincoln-ne/doc-view.aspx?ajax=0&secid=10956",
    sourceType: "municipal_code",
    issuingAuthority: "City of Lincoln",
    authorityKind: "city",
    isPrimary: false,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: LINCOLN_LAST_VERIFIED,
    lastVerifiedAt: LINCOLN_LAST_VERIFIED,
    notes:
      "Read 2026-09-25. The general mechanical fee is \"approved by the City Council\" and \"provided by the Code Official\" rather than published in the code. Cited on the mechanical page for exactly that: the fuel-gas rows are published, the HVAC rows are not.",
  },
  {
    key: LINCOLN_GAS_PIPING_FEE_SOURCE_KEY,
    jurisdictionKey: LINCOLN_KEYS.jurisdiction,
    title:
      "Lincoln Municipal Code Sec. 24.05.380 — Lincoln Gas Piping Systems Code: Permit Fee",
    url: "https://online.encodeplus.com/regs/lincoln-ne/doc-view.aspx?ajax=0&secid=10712",
    sourceType: "municipal_code",
    issuingAuthority: "City of Lincoln",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: LINCOLN_GAS_PIPING_FEE_EFFECTIVE_FROM,
    retrievedAt: LINCOLN_LAST_VERIFIED,
    lastVerifiedAt: LINCOLN_LAST_VERIFIED,
    notes:
      "Read 2026-09-25. The only trade-permit fee table in Titles 20 through 25: \"New construction (1-5 outlets) $25.00, Each additional outlet $1.00, Replacement with another permit (heating or plumbing) $6.00, Replacement alone (with no other permit) $35.00, Gas piping alteration $15.00\". Amended by Ord. 19822 §4, January 28, 2013, and unchanged since.",
  },
  {
    key: LINCOLN_GAS_PIPING_SCOPE_SOURCE_KEY,
    jurisdictionKey: LINCOLN_KEYS.jurisdiction,
    title:
      "Lincoln Municipal Code Sec. 25.12.180 — International Fuel Gas Code Chapter 4 Deleted; Gas Piping Installations",
    url: "https://online.encodeplus.com/regs/lincoln-ne/doc-view.aspx?ajax=0&secid=11082",
    sourceType: "municipal_code",
    issuingAuthority: "City of Lincoln",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: LINCOLN_LAST_VERIFIED,
    lastVerifiedAt: LINCOLN_LAST_VERIFIED,
    notes:
      "Read 2026-09-25. \"Chapter 4 of the International Fuel Gas Code is hereby deleted. Gas piping installations are governed by the Lincoln Fuel Gas Code.\" This is why Sec. 24.05.380 is the operative gas-piping fee table rather than a superseded one. Amended by Ord. 21816 §22, December 15, 2025.",
  },
  {
    key: LINCOLN_GAS_PIPING_APPLICATION_SOURCE_KEY,
    jurisdictionKey: LINCOLN_KEYS.jurisdiction,
    title: "Lincoln Municipal Code Sec. 24.05.030 — Application for Permit",
    url: "https://online.encodeplus.com/regs/lincoln-ne/doc-view.aspx?ajax=0&secid=10677",
    sourceType: "municipal_code",
    issuingAuthority: "City of Lincoln",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: LINCOLN_LAST_VERIFIED,
    lastVerifiedAt: LINCOLN_LAST_VERIFIED,
    notes:
      "Read 2026-09-25. A written application to the Administrative Authority for any gas piping installation, alteration or removal, with \"plans, engineering calculations, diagrams and other data ... in triplicate\", waivable where \"the nature of the work applied for is such that reviewing of plans is not necessary\".",
  },
  {
    key: LINCOLN_GAS_PIPING_REGISTRATION_SOURCE_KEY,
    jurisdictionKey: LINCOLN_KEYS.jurisdiction,
    title: "Lincoln Municipal Code Sec. 24.05.220 — Registration Required (gas piping work)",
    url: "https://online.encodeplus.com/regs/lincoln-ne/doc-view.aspx?ajax=0&secid=10696",
    sourceType: "municipal_code",
    issuingAuthority: "City of Lincoln",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: LINCOLN_LAST_VERIFIED,
    lastVerifiedAt: LINCOLN_LAST_VERIFIED,
    notes:
      "Read 2026-09-25. Gas piping work requires registration as a master plumber under Ch. 24.12, an HVAC contractor under Ch. 25.01, or a master gas fitter under Ch. 24.05. The chapter's own examination and annual registration fees sit in Sec. 24.05.350.",
  },
];

/** Empty on purpose: the permit types Lincoln uses already exist as shared rows. */
const permitTypes: JurisdictionSeed["permitTypes"] = [];
const projectTypes: JurisdictionSeed["projectTypes"] = [];

const jurisdictionPermitTypes: SeedJurisdictionPermitType[] = [
  {
    jurisdictionKey: LINCOLN_KEYS.jurisdiction,
    permitTypeKey: "building",
    isAvailable: true,
    localName: "Building permit",
    officialUrl: "https://www.lincoln.ne.gov/City/Departments/PDS/Building-Safety",
    notes:
      "Priced from total valuation under Table 1A, with plan review at 65% of the permit fee and a $100 floor under Sec. 109.2.1.",
  },
  {
    jurisdictionKey: LINCOLN_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    isAvailable: true,
    localName: "Electrical permit",
    officialUrl: null,
    notes:
      "Issued separately under Sec. 23.10.520: a $30.00 base fee, $6.00 per branch circuit or feeder, and service equipment priced by amperage.",
  },
  {
    jurisdictionKey: LINCOLN_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    isAvailable: true,
    localName: "Plumbing permit",
    officialUrl: null,
    notes:
      "Required, and issued under Title 24 — but the fee is set by the City Council and provided by the Authority Having Jurisdiction rather than published in the code, so it is not modelled here.",
  },
  {
    jurisdictionKey: LINCOLN_KEYS.jurisdiction,
    permitTypeKey: "mechanical",
    isAvailable: true,
    localName: "Mechanical and fuel-gas permit",
    officialUrl: null,
    notes:
      "Issued under Title 25. Fuel-gas piping permits are priced by the published table at Sec. 24.05.380; the general mechanical (HVAC) fee is set by the City Council and provided by the Code Official, and the code does not print it.",
  },
];

const feeSchedules: SeedFeeSchedule[] = [
  {
    key: LINCOLN_KEYS.buildingSchedule,
    jurisdictionKey: LINCOLN_KEYS.jurisdiction,
    sourceKey: LINCOLN_BUILDING_SOURCE_KEY,
    title: "Lincoln Municipal Code Table 1A — Building permit fees",
    officialUrl: "https://online.encodeplus.com/regs/lincoln-ne/doc-view.aspx?ajax=0&secid=10138",
    effectiveFrom: LINCOLN_BUILDING_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: LINCOLN_LAST_VERIFIED,
    notes: "Amended by Ord. 21786 §42, September 29, 2025.",
  },
  {
    key: LINCOLN_KEYS.electricalSchedule,
    jurisdictionKey: LINCOLN_KEYS.jurisdiction,
    sourceKey: LINCOLN_ELECTRICAL_SOURCE_KEY,
    title: "Lincoln Municipal Code Sec. 23.10.520 — Electrical Contractor Fee Schedule",
    officialUrl: "https://online.encodeplus.com/regs/lincoln-ne/doc-view.aspx?ajax=0&secid=10608",
    effectiveFrom: LINCOLN_ELECTRICAL_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: LINCOLN_LAST_VERIFIED,
    notes: "Amended by Ord. 21875 §1, June 01, 2026.",
  },
  {
    key: LINCOLN_KEYS.gasPipingSchedule,
    jurisdictionKey: LINCOLN_KEYS.jurisdiction,
    sourceKey: LINCOLN_GAS_PIPING_FEE_SOURCE_KEY,
    title: "Lincoln Municipal Code Sec. 24.05.380 — Lincoln Gas Piping Systems Code permit fees",
    officialUrl: "https://online.encodeplus.com/regs/lincoln-ne/doc-view.aspx?ajax=0&secid=10712",
    effectiveFrom: LINCOLN_GAS_PIPING_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: LINCOLN_LAST_VERIFIED,
    notes:
      "Amended by Ord. 19822 §4, January 28, 2013 and unchanged since. Operative for gas piping because Sec. 25.12.180 deletes the International Fuel Gas Code's own Chapter 4.",
  },
];

function attach(
  permitTypeKey: string,
  scheduleKey: string,
  rules: SeedFeeRule["rule"][],
): SeedFeeRule[] {
  return rules.map((rule) => ({
    jurisdictionKey: LINCOLN_KEYS.jurisdiction,
    permitTypeKey,
    scheduleKey,
    rule,
  }));
}

const feeRules: SeedFeeRule[] = [
  ...attach("building", LINCOLN_KEYS.buildingSchedule, [
    ...LINCOLN_STRUCTURAL_BRACKETS,
    LINCOLN_PLAN_REVIEW,
    LINCOLN_REINSPECTION_FEE,
  ]),
  ...attach("electrical", LINCOLN_KEYS.electricalSchedule, [
    LINCOLN_ELECTRICAL_BASE_FEE,
    LINCOLN_ELECTRICAL_BRANCH_CIRCUIT,
    ...LINCOLN_ELECTRICAL_SERVICE_ROWS,
    LINCOLN_ELECTRICAL_DORMANT_SERVICE,
    LINCOLN_ELECTRICAL_REINSPECTION,
  ]),
  ...attach("mechanical", LINCOLN_KEYS.gasPipingSchedule, LINCOLN_GAS_PIPING_RULES),
];

const requirements: SeedRequirement[] = [
  {
    jurisdictionKey: LINCOLN_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "document",
    title: "A total valuation of all construction work",
    description:
      "Sec. 109.2 defines the value: \"the total value of all construction work for which the permit is issued, as well as all finish work, painting, roofing, electrical, plumbing, heating, air conditioning, elevators, fire extinguishing systems, and any other permanent equipment.\" The building official may determine it \"by applying the ICC valuation or other recognized method of estimating building construction project cost\".",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: LINCOLN_BUILDING_SOURCE_KEY,
    lastVerifiedAt: LINCOLN_LAST_VERIFIED,
  },
  {
    jurisdictionKey: LINCOLN_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "Plan review is paid when plans are submitted",
    description:
      "Sec. 109.2.1: \"a plan review fee shall be paid at the time of submitting plans and specifications for review\", and the fees \"are separate from and in addition to the permit fees\". There is no refund for plan review after any review has been completed, even if the application is withdrawn.",
    isMandatory: true,
    sortOrder: 20,
    sourceKey: LINCOLN_BUILDING_SOURCE_KEY,
    lastVerifiedAt: LINCOLN_LAST_VERIFIED,
  },
  {
    jurisdictionKey: LINCOLN_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "license",
    title: "A licensed electrical contractor draws the permit",
    description:
      "Sec. 23.10.520's schedule is written \"for registered electrical contractors\", and the section's own rules on expired permits require a new permit to be obtained by a licensed electrical contractor (or, for a completed residential job, the owner). The electrical schedule is priced on that basis.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: LINCOLN_ELECTRICAL_SOURCE_KEY,
    lastVerifiedAt: LINCOLN_LAST_VERIFIED,
  },
  {
    jurisdictionKey: LINCOLN_KEYS.jurisdiction,
    permitTypeKey: "mechanical",
    requirementType: "license",
    title: "A registered master gas fitter, master plumber or HVAC contractor draws the permit",
    description:
      "Sec. 24.05.220: no person may install, alter, modify or repair a gas piping system \"without first having been registered as a master plumber under the provisions of Chapter 24.12, as a heating, ventilating, and cooling contractor under the provisions of Chapter 25.01 or as a master gas fitter under the provisions of this chapter\". The chapter's own examination and annual registration fees are licences rather than permits and are not part of the figures on this site.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: LINCOLN_GAS_PIPING_REGISTRATION_SOURCE_KEY,
    lastVerifiedAt: LINCOLN_LAST_VERIFIED,
  },
  {
    jurisdictionKey: LINCOLN_KEYS.jurisdiction,
    permitTypeKey: "mechanical",
    requirementType: "document",
    title: "Gas piping plans, submitted in triplicate",
    description:
      "Sec. 24.05.030 requires a written application on a City form with \"plans, engineering calculations, diagrams and other data ... in triplicate\". The Administrative Authority may require them to be prepared by a licensed engineer or architect, and may waive the submission entirely \"if he finds that the nature of the work applied for is such that reviewing of plans is not necessary\". Sec. 24.05.060 requires notice when the piping is ready for inspection, and Sec. 24.05.080 makes it unlawful to turn gas on before the outlets are approved.",
    isMandatory: true,
    sortOrder: 20,
    sourceKey: LINCOLN_GAS_PIPING_APPLICATION_SOURCE_KEY,
    lastVerifiedAt: LINCOLN_LAST_VERIFIED,
  },
  {
    jurisdictionKey: LINCOLN_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    requirementType: "other",
    title: "The plumbing fee is set by the City Council, not published in the code",
    description:
      "Sec. 24.12.095 amends the Uniform Plumbing Code to state that \"the fees shall be set by the City Council and shall be provided to the applicant by the Authority Having Jurisdiction\". This site does not estimate that fee; ask Building and Safety for the current figure. What the code does publish is that work started before a permit doubles the fee, and that an unused permit returned before expiry is refunded at most two-thirds.",
    isMandatory: true,
    sortOrder: 20,
    sourceKey: LINCOLN_PLUMBING_SOURCE_KEY,
    lastVerifiedAt: LINCOLN_LAST_VERIFIED,
  },
];

const profile: SeedProfile = {
  jurisdictionKey: LINCOLN_KEYS.jurisdiction,
  headline: "What construction permits cost in Lincoln",
  summary:
    "Lincoln prices a building permit from total valuation using Table 1A of its Building Code: a flat $55.00 up to $1,000, then $55.00 plus $8.00 per additional $1,000 to $10,000, easing through two more rows to $202.00 plus $2.00 per $1,000 above $25,000. Plan review is a separate 65% of the permit fee with a $100 floor. Electrical is priced per item — a $30.00 base, $6.00 a circuit, service equipment by amperage — and a fuel-gas permit is priced by outlet at $25.00 for the first five and $1.00 each after that.",
  localContext:
    "Three things about Lincoln are worth reading before any number here, and one of them is an absence.\n\nThe first is that the building table is checkable. Table 1A is written the same way Omaha's and Houston's are — an amount for the first so many thousand, plus a rate for each additional $1,000 or fraction of one — and both of its handovers close exactly: the row for $1,001 to $10,000 produces precisely $127.00 at its top, which is what the next row opens with, and the row for $10,001 to $25,000 produces precisely $202.00. That matters because a reader can verify any Lincoln figure against the row before it, and because Houston's table does not behave that way.\n\nThe second is that the three trades are priced by three different mechanisms, which is why this site does not reuse one form for all of them. A building permit is a valuation table; an electrical permit is a base fee plus an item count plus a service size; and a fuel-gas permit is a flat $25.00 per job covering the first five outlets, then $1.00 for each one after that, with flat rows of $6.00 and $35.00 for a replacement and $15.00 for an alteration. Lincoln's gas table is also the one place in its code where a trade permit carries an amount instead of a reference to a schedule the City Council sets later — which is exactly why the fuel-gas page can be published and the plumbing page cannot.\n\nThe third is the absence. Lincoln's code requires a plumbing permit and does not publish what it costs. Sec. 24.12.095 amends the Uniform Plumbing Code to say the plumbing fee \"shall be set by the City Council and shall be provided to the applicant by the Authority Having Jurisdiction\", and the Mechanical Code's Sec. 109.2 says the same of the HVAC rows. There is nothing to transcribe for those, so this site publishes no plumbing page and prices no HVAC equipment: an amount that is not published cannot be quoted honestly. What the code does fix is what happens around a fee — work started before the permit doubles it, and an unused permit returned before it expires is refunded at most two-thirds, with the remainder capped at $25.00 and a $25.00 processing fee once a refund exceeds $75.00.",
  valuationBasis:
    "Lincoln uses \"the total value of all construction work for which the permit is issued, as well as all finish work, painting, roofing, electrical, plumbing, heating, air conditioning, elevators, fire extinguishing systems, and any other permanent equipment\".\n\nThe building official may determine that value \"by applying the ICC valuation or other recognized method of estimating building construction project cost\", and Sec. 109.2 adds that the figure used to compute the fee \"is only an estimate and is not intended to be used as conclusive evidence of the actual value\" of the work. This site never substitutes a square-foot rate for a valuation: where a figure is needed, you supply the total value of the work.",
  notIncluded:
    "These figures are Lincoln's building, electrical and fuel-gas permit fees as published in the Municipal Code. They are not a total project cost. They exclude:\n\n- **The plumbing permit fee and the general mechanical (HVAC) fee**, which Lincoln's code requires but does not publish — they are set by the City Council and provided by the Authority Having Jurisdiction. No page on this site quotes them, because there is no published figure to quote. The fuel-gas rows are the exception, and they are the whole of what the mechanical page prices.\n- **Everything else in Table 1B**: demolition at $200.00 residential, $250.00 plus $0.01 per square foot commercial and $30.00 for garages; the $100.00 fire-damage and building-damage investigation fees; expedited plan review at 100% of the plan-review fee with a $300.00 minimum and a $6,000.00 maximum; a 10% extension fee; and a 100% reinstatement fee for an expired permit.\n- **The development-permit and flood-plain fees** that follow Table 1B in the same section, including flood-plain fill at $250.00 plus $50.00 per acre and the $50.00 mobile-home and accessory-building rows.\n- **The doubling of any fee where work starts before a permit is issued**, which the code applies unless the work was an emergency.\n- **The $55.00 reinspection fee** when a job is not ready or does not pass, and the electrical re-inspection fee of $50.00 each.\n- **Registration, examination and licence fees** for electrical, mechanical and plumbing contractors, which are licences rather than permits.\n- **Anything charged by another authority.** Lincoln is a city inside Lancaster County; Lancaster County and the neighbouring cities of Waverly, Hickman and Bennet issue their own permits under their own schedules.",
  seoTitle: "Lincoln construction permit fees",
  seoDescription:
    "How Lincoln, Nebraska prices building, electrical and fuel-gas permits — Table 1A valuation bands, plan review at 65% with a $100 floor, the electrical fee schedule, and gas piping at $25.00 for the first five outlets, with the code section behind every figure.",
  publishStatus: "published",
  noindex: false,
  lastReviewedAt: LINCOLN_LAST_VERIFIED,
};

const permitPages: SeedPermitPage[] = [
  {
    jurisdictionKey: LINCOLN_KEYS.jurisdiction,
    permitTypeKey: "building",
    slug: "building-permit-cost",
    title: "Lincoln building permit cost",
    intro:
      "Lincoln charges a building permit fee from the total valuation of the work, using Table 1A of its Building Code. Up to $1,000 of valuation the fee is a flat $55.00. Above that each row adds a published rate for each additional $1,000, or fraction of one — $8.00 up to $10,000, then $5.00 up to $25,000, then $2.00 — and plan review is a separate 65% of the permit fee with a $100 floor.",
    localSummary:
      "Table 1A has four rows, and its arithmetic is checkable at both handovers. The row covering $1,001 to $10,000 is $55.00 for the first $1,000 plus $8.00 for each additional $1,000, which comes to exactly $127.00 at $10,000 — the figure the next row opens with. That row runs to $25,000 at $5.00 per additional $1,000 and lands on exactly $202.00, which is the last row's opening figure.\n\nPlan review is the part people miss. Sec. 109.2.1 sets it at 65% of the permit fee, or $100.00 whichever is greater, and says it is \"separate from and in addition to the permit fees\". It applies to commercial buildings, accessory buildings and apartments — not to a one- or two-family house.",
    notIncluded:
      "This is the Table 1A valuation fee plus plan review at 65% where it applies. It excludes:\n\n- Table 1B's demolition fees ($200.00 residential, $250.00 plus $0.01 per square foot commercial, $30.00 garages), the $100.00 fire- and building-damage investigation fees, and the expedited-review rate with its $300.00 floor and $6,000.00 ceiling.\n- The 10% application-extension fee and the 100% reinstatement fee for an expired permit.\n- The $55.00 reinspection fee when work is not ready or does not pass.\n- The doubling of the fee where work starts before a permit is issued, unless the work was an emergency.\n- Lincoln's electrical, plumbing and mechanical permits, which are separate permits under their own titles — and, for plumbing and mechanical, priced from figures the code does not publish.\n- Development and flood-plain permits, and anything charged by Lancaster County or a neighbouring city.",
    workedExample: {
      scenario:
        "A commercial building project with a total construction valuation of $250,000 and plans submitted for review.",
      inputs: { valuationCents: 25_000_000, custom: { plan_review: true } },
      notes:
        "Table 1A's last row: $202.00 for the first $25,000 plus $2.00 for each of the 225 additional thousands, which is $652.00. Plan review is 65% of that, $423.80, and it is charged in addition to the permit fee. The valuation is the example's, not the City's.",
    },
    faqs: [
      {
        question: "Is the Lincoln building permit fee based on square footage?",
        answer:
          "No. It is based on the total valuation of the work. The building official may derive that valuation from ICC cost data, but Table 1A charges a rate per $1,000 of value rather than per square foot.",
        sourceId: LINCOLN_BUILDING_SOURCE_KEY,
      },
      {
        question: "How much is a building permit for a $10,000 job in Lincoln?",
        answer:
          "$127.00. Table 1A charges $55.00 for the first $1,000 plus $8.00 for each of the nine additional thousands. At $10,001 the next row takes over, opening at exactly $127.00 plus $5.00 for the fraction of a thousand.",
        sourceId: LINCOLN_BUILDING_SOURCE_KEY,
      },
      {
        question: "Is plan review included in the permit fee?",
        answer:
          "No. Sec. 109.2.1 makes it 65% of the building permit fee, or $100.00 whichever is greater, and says it is \"separate from and in addition to the permit fees\" and is not credited against the permit fee if the permit is issued.",
        sourceId: LINCOLN_BUILDING_SOURCE_KEY,
      },
      {
        question: "Does a house pay plan review?",
        answer:
          "Not under Sec. 109.2.1, which applies the 65% review fee to \"commercial buildings, accessory buildings, and apartments\". A one- or two-family dwelling is not in that list.",
        sourceId: LINCOLN_BUILDING_SOURCE_KEY,
      },
      {
        question: "What happens if I start before the permit is issued?",
        answer:
          "The fee is doubled. The code applies the doubling to work that \"is started or proceeded with prior to obtaining said permit\", and does not waive it for residential work the way the electrical schedule does for a completed owner job.",
        sourceId: LINCOLN_BUILDING_SOURCE_KEY,
      },
      {
        question: "Does Lincoln publish its plumbing permit fee?",
        answer:
          "No. Sec. 24.12.095 says the plumbing fee \"shall be set by the City Council and shall be provided to the applicant by the Authority Having Jurisdiction\". This site does not estimate it; ask Building and Safety for the current figure.",
        sourceId: LINCOLN_PLUMBING_SOURCE_KEY,
      },
    ],
    seoTitle: "Lincoln building permit cost: Table 1A and plan review",
    seoDescription:
      "Lincoln, Nebraska building permit fees from Table 1A — $55.00 plus $8.00 per additional $1,000 up to $10,000 — with plan review at 65% and a $100 floor, cited to the municipal code.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: LINCOLN_LAST_VERIFIED,
  },
  {
    jurisdictionKey: LINCOLN_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    slug: "electrical-permit-cost",
    title: "Lincoln electrical permit cost",
    intro:
      "Lincoln prices an electrical permit per item under Sec. 23.10.520. Every permit carries a $30.00 base fee that is \"added to all other fees that apply to the application\", then $6.00 for each branch circuit and feeder, plus a service fee that runs from $30.00 for service equipment up to 200 amperes to $400.00 above 2,000 amperes.",
    localSummary:
      "The base fee is the feature that decides most small permits. Lincoln charges $30.00 on every electrical application and then charges the work on top, so a permit for a single new circuit is $30.00 plus $6.00 — not $6.00. This site deliberately does not credit the base fee against the first circuit, because the code says the base fee is added to all other fees rather than included with them.\n\nService equipment is priced by amperage rather than by the size of the building: 0 to 200 amperes is $30.00, 201 to 400 is $45.00, 401 to 800 is $90.00, 801 to 2,000 is $200.00, and anything above 2,000 is $400.00. A dormant service inspected to restore power is $30.00, and a re-inspection is $50.00 each.",
    notIncluded:
      "This covers Sec. 23.10.520's base fee, its per-circuit and feeder rate, its five service-equipment bands, the dormant-service inspection and the re-inspection fee. It excludes:\n\n- Any work priced by another title of the code — Lincoln's building permit is Table 1A, and the plumbing and mechanical fees are set by the City Council rather than published.\n- Electrical contractor, master electrician, journeyman and apprentice registration and examination fees, which are licences rather than permits.\n- The refund processing fee of $35.00, which the section applies to any refund request.\n- Any utility connection or service-installation charge, which the utility makes rather than the City.\n- The doubling of a fee where work starts before a permit is issued.",
    workedExample: {
      scenario:
        "An electrical permit for a commercial job: new 200-ampere service equipment and thirty branch circuits.",
      inputs: { custom: { service_work: true, amperage: 200, circuits: 30 } },
      notes:
        "The $30.00 base fee, plus the 0-to-200-ampere service band at $30.00, plus thirty branch circuits at $6.00 each, which is $180.00 — a total of $240.00. The counts are the example's, not the City's.",
    },
    faqs: [
      {
        question: "How much is an electrical permit in Lincoln?",
        answer:
          "Every electrical application carries a $30.00 base fee. On top of that, each branch circuit or feeder is $6.00, and new or replacement service equipment is $30.00 up to 200 amperes, rising to $400.00 above 2,000 amperes.",
        sourceId: LINCOLN_ELECTRICAL_SOURCE_KEY,
      },
      {
        question: "Does the base fee cover my first circuit?",
        answer:
          "No. The code describes the $30.00 as a \"Base Permit Fee (To be added to all other fees that apply to the application.)\", so the branch circuits are charged in addition to it. A one-circuit permit is $36.00.",
        sourceId: LINCOLN_ELECTRICAL_SOURCE_KEY,
      },
      {
        question: "How is a service upgrade priced?",
        answer:
          "By amperage: $30.00 for 0 to 200 amperes, $45.00 for 201 to 400, $90.00 for 401 to 800, $200.00 for 801 to 2,000, and $400.00 above 2,000. The band is chosen by the service size, not by the value of the work.",
        sourceId: LINCOLN_ELECTRICAL_SOURCE_KEY,
      },
      {
        question: "What does a dormant-service inspection cost?",
        answer:
          "$30.00. Sec. 23.10.520 lists a separate \"Fee for inspection of dormant services for the purpose of restoring power\" at that amount.",
        sourceId: LINCOLN_ELECTRICAL_SOURCE_KEY,
      },
      {
        question: "What happens if the inspector has to come back?",
        answer:
          "A re-inspection fee of $50.00 each applies. It is separate from the electrical permit fee and is charged per re-inspection.",
        sourceId: LINCOLN_ELECTRICAL_SOURCE_KEY,
      },
    ],
    seoTitle: "Lincoln electrical permit cost: base fee and per-circuit rates",
    seoDescription:
      "Lincoln, Nebraska electrical permits under Sec. 23.10.520 — a $30.00 base fee, $6.00 per branch circuit, and service fees from $30.00 to $400.00 by amperage.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: LINCOLN_LAST_VERIFIED,
  },
  {
    jurisdictionKey: LINCOLN_KEYS.jurisdiction,
    permitTypeKey: "mechanical",
    slug: "mechanical-permit-cost",
    title: "Lincoln mechanical and fuel-gas permit cost",
    intro:
      "Lincoln prices a fuel-gas permit itself rather than leaving it to a schedule you have to ask for. The Lincoln Gas Piping Systems Code — Ch. 24.05 — charges $25.00 for new construction of one to five outlets and $1.00 for each outlet after that; an appliance replacement is $35.00 on its own or $6.00 when a heating or plumbing permit is taken out for the same job; and altering existing gas piping is $15.00. The table has not changed since January 2013.",
    localSummary:
      "Two distinctions in Lincoln's gas table decide most real permits. The first is that $25.00 is not a rate per outlet: it covers the first five, and only the sixth and later outlets cost a dollar each. A house with eight outlets is a $28.00 permit, not $33.00.\n\nThe second is the replacement split. Replacing a furnace or water heater costs $6.00 if a heating or plumbing permit is being taken out for the same job, and $35.00 if the gas permit stands alone — the City charges the extra $29.00 for the gas work being the only thing on the application. An alteration to existing piping is a third row at $15.00.\n\nWorth knowing before you file: an HVAC equipment permit is a different thing, and Lincoln does not publish its fee — the Mechanical Code's Sec. 109.2 leaves it to a City Council schedule provided by the Code Official. Sec. 25.12.180 is what makes the gas table operative in the first place: it deletes Chapter 4 of the International Fuel Gas Code and sends gas piping installations to the Lincoln Fuel Gas Code.",
    notIncluded:
      "This covers Sec. 24.05.380's four rows — new construction by outlet, both replacement rates, and an alteration. It excludes:\n\n- **The general mechanical (HVAC) permit fee** for equipment, ductwork and ventilation, which the Mechanical Code at Sec. 25.06.090 leaves to a schedule set by the City Council and provided by the Code Official. It is not published and this site does not estimate it.\n- **The plumbing permit fee**, which Sec. 24.12.095 defers in the same way.\n- **Gas fitter, master plumber and HVAC contractor licence fees** — examination fees for a master and a journeyman gas fitter, and the annual registration fees, are licences in Sec. 24.05.350 rather than permits.\n- **The doubling of the fee where work starts before the permit is issued**, unless the work was an emergency such as nights, weekends or a holiday on which a permit is secured at the earliest possible time.\n- **Liquefied petroleum gas facilities**, which the code prices separately under its own permit, and the decorative fireplace and gas log permit, which is issued to a registered contractor under the Mechanical Code.\n- **Inspection and plan review charges on the building permit**, which are separate permits under Title 20, and anything charged by Lancaster County or a neighbouring city.",
    workedExample: {
      scenario:
        "Gas piping for a new house: eight outlets — furnace, water heater, range, dryer, two fireplaces, a patio grill and one spare stub — with no other permit on the same application.",
      inputs: { custom: { outlets: 8 } },
      notes:
        "Sec. 24.05.380 reads as a base with an allowance: $25.00 for the first five outlets and $1.00 for each additional one. Eight outlets is $25.00 plus three dollars, so $28.00. Reading the row as a flat $1.00 per outlet would say $33.00 and charge three dollars too much.\n\nThe outlet count is the example's, not the City's. The alternative rows are worth pricing against it: if the same eight outlets were installed alongside a heating permit, the gas permit would be $6.00 rather than $25.00, and if the work were an alteration to existing piping instead of new construction it would be $15.00.",
    },
    faqs: [
      {
        question: "Does Lincoln publish a mechanical permit fee?",
        answer:
          "Not for HVAC equipment. The Mechanical Code's Sec. 109.2 says the fee is charged \"as set forth in the schedule for mechanical permit fees as set by the City Council\" — the amount is not printed in the code. Lincoln does publish its fuel-gas permit fees, in the Gas Piping Systems Code at Sec. 24.05.380, and those are what this page prices.",
        sourceId: LINCOLN_MECHANICAL_SOURCE_KEY,
      },
      {
        question: "How much is a gas permit for a new house in Lincoln?",
        answer:
          "$25.00 for one to five outlets, and $1.00 for each outlet after that. Eight outlets is $28.00. The $25.00 is not a per-outlet rate: the first five are included in it.",
        sourceId: LINCOLN_GAS_PIPING_FEE_SOURCE_KEY,
      },
      {
        question: "What does it cost to replace a furnace or water heater?",
        answer:
          "$6.00 if a heating or plumbing permit is being taken out for the same job, and $35.00 if the gas permit is the only permit. Sec. 24.05.380 prices \"Replacement with another permit (heating or plumbing)\" and \"Replacement alone (with no other permit)\" as separate rows.",
        sourceId: LINCOLN_GAS_PIPING_FEE_SOURCE_KEY,
      },
      {
        question: "Why is Lincoln's gas code the operative one and not the fuel gas code?",
        answer:
          "Because Sec. 25.12.180 says so: \"Chapter 4 of the International Fuel Gas Code is hereby deleted. Gas piping installations are governed by the Lincoln Fuel Gas Code.\" The International Fuel Gas Code's own gas piping chapter is switched off, which is what leaves the Lincoln Gas Piping Systems Code's published fee table in force.",
        sourceId: LINCOLN_GAS_PIPING_SCOPE_SOURCE_KEY,
      },
      {
        question: "Do I need a licensed contractor for gas piping work?",
        answer:
          "Yes. Sec. 24.05.220 requires registration as a master plumber under Ch. 24.12, an HVAC contractor under Ch. 25.01, or a master gas fitter under Ch. 24.05 before anyone may install, alter, modify or repair a gas piping system.",
        sourceId: LINCOLN_GAS_PIPING_REGISTRATION_SOURCE_KEY,
      },
      {
        question: "When can the gas be turned on?",
        answer:
          "After inspection. Sec. 24.05.060 requires the City to be notified that the piping is ready, and Sec. 24.05.080 makes it unlawful to turn on or reconnect gas unless the piping outlets are properly approved.",
        sourceId: LINCOLN_GAS_PIPING_APPLICATION_SOURCE_KEY,
      },
    ],
    seoTitle: "Lincoln gas piping permit cost: $25.00 for the first five outlets",
    seoDescription:
      "Lincoln, Nebraska fuel-gas permit fees from the Gas Piping Systems Code — $25.00 for one to five outlets plus $1.00 each, $6.00 or $35.00 for a replacement, $15.00 for an alteration — and why the HVAC fee is not published.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: LINCOLN_LAST_VERIFIED,
  },
];

const verifications: SeedVerification[] = [
  {
    entityType: "source",
    entityKey: LINCOLN_BUILDING_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: LINCOLN_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: LINCOLN_BUILDING_SOURCE_KEY,
    notes:
      "Read 2026-09-25. Table 1A's four rows transcribed and both handovers checked: $127.00 at $10,000 and $202.00 at $25,000, each exactly what the row below produces at its top.",
  },
  {
    entityType: "source",
    entityKey: LINCOLN_ELECTRICAL_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: LINCOLN_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: LINCOLN_ELECTRICAL_SOURCE_KEY,
    notes:
      "Read 2026-09-25. The base fee, the per-circuit rate and the five service bands transcribed; the section's amendment block dates the schedule to Ord. 21875 §1, June 01, 2026.",
  },
  {
    entityType: "source",
    entityKey: LINCOLN_PLUMBING_SOURCE_KEY,
    status: "needs_review",
    method: "official_portal_check",
    verifiedAt: LINCOLN_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: LINCOLN_PLUMBING_SOURCE_KEY,
    notes:
      "Read 2026-09-25 and found to carry no published amount: the fee \"shall be set by the City Council and shall be provided to the applicant by the Authority Having Jurisdiction\". Recorded so the omission is a fact in the data, not an oversight.",
  },
  {
    entityType: "fee_rule",
    entityKey: "T1A-10000",
    permitTypeKey: "building",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: LINCOLN_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: LINCOLN_BUILDING_SOURCE_KEY,
    notes:
      "Table 1A: \"$55.00 for the first $1,000, plus $8.00 for each additional $1,000 value and fraction thereof, to and including $10,000\". Produces $127.00 at its top, which the next row opens with.",
  },
  {
    entityType: "fee_rule",
    entityKey: "PLAN-REVIEW-65",
    permitTypeKey: "building",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: LINCOLN_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: LINCOLN_BUILDING_SOURCE_KEY,
    notes:
      "Sec. 109.2.1: 65% of the permit fee, or $100.00 whichever is greater, for commercial buildings, accessory buildings and apartments. Modelled on the `permit_fee` basis with the $100 floor as the rule's `minimumCents`.",
  },
  {
    entityType: "permit_page",
    entityKey: "building-permit-cost",
    permitTypeKey: "building",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: LINCOLN_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: LINCOLN_BUILDING_SOURCE_KEY,
    notes:
      "All four rows and the plan-review rule. The worked example is arithmetic on the table: $250,000 gives $652.00 of permit fee and $423.80 of review.",
  },
  {
    entityType: "permit_page",
    entityKey: "electrical-permit-cost",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: LINCOLN_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: LINCOLN_ELECTRICAL_SOURCE_KEY,
    notes:
      "The base fee, per-circuit rate and five service bands. The base fee is charged in addition to every other row and is not credited against the first circuit, on the code's own wording.",
  },
  {
    entityType: "source",
    entityKey: LINCOLN_GAS_PIPING_FEE_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: LINCOLN_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: LINCOLN_GAS_PIPING_FEE_SOURCE_KEY,
    notes:
      "Read 2026-09-25. All five lines of Sec. 24.05.380 transcribed. Found by reading the whole of Titles 24 and 25 for published amounts after the plumbing and mechanical fee sections turned out to defer their figures — this is the only trade-permit fee table either title contains.",
  },
  {
    entityType: "source",
    entityKey: LINCOLN_GAS_PIPING_SCOPE_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: LINCOLN_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: LINCOLN_GAS_PIPING_SCOPE_SOURCE_KEY,
    notes:
      "Read 2026-09-25. Cited for the delegation itself: the International Fuel Gas Code's Chapter 4 is deleted and gas piping installations go to the Lincoln Fuel Gas Code. Without this section the 2013 fee table could have been transcribed as superseded.",
  },
  {
    entityType: "fee_rule",
    entityKey: "GAS-NEW-CONSTRUCTION",
    permitTypeKey: "mechanical",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: LINCOLN_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: LINCOLN_GAS_PIPING_FEE_SOURCE_KEY,
    notes:
      "Sec. 24.05.380 — \"New construction (1-5 outlets) $25.00\" and \"Each additional outlet $1.00\". Modelled with the `per_unit` base-and-allowance form: baseCents $25.00, thresholdUnits 5, centsPerUnit $1.00, so eight outlets is $28.00.",
  },
  {
    entityType: "fee_rule",
    entityKey: "GAS-REPLACEMENT-WITH-PERMIT",
    permitTypeKey: "mechanical",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: LINCOLN_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: LINCOLN_GAS_PIPING_FEE_SOURCE_KEY,
    notes:
      "Sec. 24.05.380 — \"Replacement with another permit (heating or plumbing) $6.00\". A row in its own right rather than a discount, and mutually exclusive with the row below it through `custom.gas_work`.",
  },
  {
    entityType: "fee_rule",
    entityKey: "GAS-REPLACEMENT-ALONE",
    permitTypeKey: "mechanical",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: LINCOLN_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: LINCOLN_GAS_PIPING_FEE_SOURCE_KEY,
    notes:
      "Sec. 24.05.380 — \"Replacement alone (with no other permit) $35.00\". The $29.00 difference from the row above is the fee for the gas work being the only permit on the application.",
  },
  {
    entityType: "fee_rule",
    entityKey: "GAS-ALTERATION",
    permitTypeKey: "mechanical",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: LINCOLN_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: LINCOLN_GAS_PIPING_FEE_SOURCE_KEY,
    notes: "Sec. 24.05.380 — \"Gas piping alteration $15.00\".",
  },
  {
    entityType: "permit_page",
    entityKey: "mechanical-permit-cost",
    permitTypeKey: "mechanical",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: LINCOLN_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: LINCOLN_GAS_PIPING_FEE_SOURCE_KEY,
    notes:
      "The four published rows, the outlet arithmetic ($25.00 + $1.00 per outlet after the fifth), and the scope bridge at Sec. 25.12.180. The page states that Lincoln's general mechanical fee is not published rather than leaving a reader to assume the gas table covers HVAC equipment.",
  },
  {
    entityType: "jurisdiction_profile",
    entityKey: LINCOLN_KEYS.jurisdiction,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: LINCOLN_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: LINCOLN_BUILDING_SOURCE_KEY,
    notes:
      "Hub content built from Titles 20, 23, 24 and 25 of the Municipal Code and now covering three pages: building (Table 1A), electrical (Sec. 23.10.520) and fuel gas (Sec. 24.05.380). The two unpublished trade fees are stated as an absence rather than filled in.",
  },
];

export const lincolnSeed: JurisdictionSeed = {
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

/**
 * Permit pages that clear the editorial gate, for use in tests without a database.
 *
 * All three are published. Nothing is held back, and the two fees Lincoln does not
 * publish — plumbing and HVAC mechanical — are stated on the pages that exist rather
 * than carried as a page that cannot.
 */
export const LINCOLN_PUBLISHED_PERMIT_PAGES = lincolnSeed.permitPages.filter(
  (page) => page.publishStatus === "published" && !page.noindex,
);
