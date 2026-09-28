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
  PHILLY_BUILDING_BASE_RULES,
  PHILLY_BUILDING_PAGE_SOURCE_KEY,
  PHILLY_ELECTRICAL_BASE_RULES,
  PHILLY_ELECTRICAL_PAGE_SOURCE_KEY,
  PHILLY_FEE_EFFECTIVE_FROM,
  PHILLY_FEE_REGULATION_2022_SOURCE_KEY,
  PHILLY_FEE_REGULATION_SOURCE_KEY,
  PHILLY_FEE_SCHEDULE_2026_SOURCE_KEY,
  PHILLY_FEE_SCHEDULE_SOURCE_KEY,
  PHILLY_FEES_DOCUMENTS_SOURCE_KEY,
  PHILLY_FOUNDATION_PAGE_SOURCE_KEY,
  PHILLY_PLUMBING_BASE_RULES,
  PHILLY_PLUMBING_PAGE_SOURCE_KEY,
} from "./fee-rules";

export * from "./fee-rules";

/**
 * The complete Philadelphia, Pennsylvania seed payload.
 *
 * Every figure traces to research/pennsylvania/philadelphia.md, which traces to
 * the four-page fee table L&I publishes (PG_012, effective January 1, 2025) and
 * to the regulation that promulgated it under Philadelphia Code §§6-301, 9-102
 * and 4-A-901.15 with a CPI multiplier of 26.5%, plus the City's own service
 * pages — building, electrical, plumbing and foundation-only — whose Cost blocks
 * publish the parts of the stack the table does not: the filing fee credited
 * toward the permit fee, the $3 City and $4.50 State surcharges, record
 * retention and the optional accelerated review.
 *
 * Three pages, all published, and they are three *mechanisms* rather than one
 * schedule read three times: building is priced in square-footage bands with a
 * flat residential column, electrical from $25 per $1,000 or fraction of
 * estimated cost between a published $63 floor and a published $18,975 ceiling,
 * and plumbing from blocks of fixtures — each with its own filing-fee floor
 * that is the same construction in three permits.
 */

const RESEARCHER = "Permit Fee Intelligence research pass 13 (Pennsylvania)";

export const PHILLY_LAST_VERIFIED = "2026-09-25";

export const PHILLY_KEYS = {
  state: "pa",
  county: "philadelphia-county",
  jurisdiction: "philadelphia",
  feeSchedule: "philadelphia-construction-permit-fees",
} as const;

const state: SeedState = {
  code: "PA",
  slug: "pennsylvania",
  name: "Pennsylvania",
  fipsCode: "42",
};

/** Philadelphia is a consolidated city–county, so the City is also the County. */
const county: SeedCounty = {
  key: PHILLY_KEYS.county,
  slug: "philadelphia-county",
  name: "Philadelphia County",
  fipsCode: "42101",
};

const jurisdiction: SeedJurisdiction = {
  key: PHILLY_KEYS.jurisdiction,
  stateKey: PHILLY_KEYS.state,
  countyKey: PHILLY_KEYS.county,
  type: "city",
  slug: "philadelphia",
  name: "Philadelphia",
  officialName: "City of Philadelphia",
  websiteUrl: "https://www.phila.gov/",
  permitPortalUrl: "https://eclipse.phila.gov/",
  timezone: "America/New_York",
  isActive: true,
};

const departments: SeedDepartment[] = [
  {
    key: "philadelphia-licenses-and-inspections",
    jurisdictionKey: PHILLY_KEYS.jurisdiction,
    kind: "building",
    name: "Department of Licenses and Inspections (L&I)",
    phone: "215-686-8686",
    email: null,
    url: "https://www.phila.gov/services/permits-violations-licenses/apply-for-a-permit/building-and-repair-permits/",
    addressLine:
      "Permit and License Center, Municipal Services Building (MSB), Public Service Concourse, 1401 John F. Kennedy Blvd., Philadelphia, PA 19102",
    hours:
      "Monday to Friday, 8 a.m. to 3:30 p.m., by appointment. Offices close at noon on the last Wednesday of each month.",
    notes:
      "One department issues building, electrical, plumbing, mechanical, fire-suppression and zoning permits, and because Philadelphia is a consolidated city–county there is no second authority whose fees would sit beside these. Every service page routes applications and payment through the eCLIPSE portal (https://eclipse.phila.gov/). General questions go to 311 or (215) 686-8686; inspections are requested through eCLIPSE or (215) 255-4040. The Permit and License Center takes appointments only, and the same building also houses the Historical Commission and Department of Streets pre-approvals a building permit can require.",
  },
];

const sources: SeedSource[] = [
  {
    key: PHILLY_FEE_SCHEDULE_SOURCE_KEY,
    jurisdictionKey: PHILLY_KEYS.jurisdiction,
    title: "Construction Permit Fees, effective January 1, 2025 (PG_012, Rev 2.2026)",
    url: "https://www.phila.gov/media/20260209092722/PG_012_INF_Summary-of-construction-permit-fees-Eff-1.1.2025-Rev-2.2026.pdf",
    sourceType: "fee_schedule_pdf",
    issuingAuthority: "City of Philadelphia, Department of Licenses and Inspections",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: PHILLY_FEE_EFFECTIVE_FROM,
    retrievedAt: PHILLY_LAST_VERIFIED,
    lastVerifiedAt: PHILLY_LAST_VERIFIED,
    notes:
      "Read 2026-09-25 in both pdftotext -layout and plain modes, because layout mode mispairs labels with amounts in this document (its \"Foundation Only\" row appears to sit beside \"$16.40 per 100 sq. ft.\"). Four pages, two columns — Residential (1 or 2 family) and Other Occupancies — covering building, electrical, plumbing, mechanical, fire suppression and administration. Every figure this site charges comes from this table; the pairings recorded in the research file are the ones both extraction modes and the City's service pages agree on.",
  },
  {
    key: PHILLY_FEE_SCHEDULE_2026_SOURCE_KEY,
    jurisdictionKey: PHILLY_KEYS.jurisdiction,
    title: "Construction Permit Fees, effective October 1, 2026 (PG_012, Rev 7.2026)",
    url: "https://www.phila.gov/media/20260729134349/PG_012_INF_Summary-of-construction-permit-fees-Eff-1.1.2025-Rev-7.2026.pdf",
    sourceType: "fee_schedule_pdf",
    issuingAuthority: "City of Philadelphia, Department of Licenses and Inspections",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: "2026-10-01",
    retrievedAt: PHILLY_LAST_VERIFIED,
    lastVerifiedAt: PHILLY_LAST_VERIFIED,
    notes:
      "Read and diffed against the in-force document on 2026-09-25, six days before it takes effect: the whole four-page document changes its header dates and its revision number, and exactly one administrative row changes, $75 → $300. Every row this site models — every area band, the electrical ladder, every plumbing block, every surcharge — is byte-identical between the two documents. Recorded as its own source with its own effectiveFrom rather than as a second rule set, because there is no rate in it to re-price. The row the $300 hangs on is not resolvable from the extraction (see the research file's open questions).",
  },
  {
    key: PHILLY_FEE_REGULATION_SOURCE_KEY,
    jurisdictionKey: PHILLY_KEYS.jurisdiction,
    title:
      "L&I regulation, Regulations Governing Fee Increases for Permits and Licenses (Philadelphia Code §§6-301, 9-102, 4-A-901.15)",
    url: "https://www.phila.gov/media/20240903113807/li-regs-permit-license-fee-increase-schedule-amendment-2024-09-20.pdf",
    sourceType: "ordinance",
    issuingAuthority: "City of Philadelphia, Department of Licenses and Inspections",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: PHILLY_FEE_EFFECTIVE_FROM,
    retrievedAt: PHILLY_LAST_VERIFIED,
    lastVerifiedAt: PHILLY_LAST_VERIFIED,
    notes:
      "The operative legal instrument, read 2026-09-25 in both pdftotext modes. It states the mechanism — fees set at \"the fee as it existed on July 1, 2017, multiplied by the CPI Multiplier (26.5%)\" — the effective date (January 1, 2025), and that it \"replaces and supersedes the fee schedule promulgated on August 8, 2022\". It pairs each fee row with its Philadelphia Code citation (A-902.2.1, A-903.2, A-905.3.1…), which is how the code sections in every rule description here were sourced. Its three-column table drifts by one row — the citation column puts A-902.2.4 on the tenant fit-out line — recorded rather than smoothed over.",
  },
  {
    key: PHILLY_FEE_REGULATION_2022_SOURCE_KEY,
    jurisdictionKey: PHILLY_KEYS.jurisdiction,
    title: "L&I regulation of August 8, 2022, fee schedule effective January 1, 2023 (CPI 16.1%)",
    url: "https://www.phila.gov/media/20220908100105/li-regs-permit-license-fee-schedule-20220908.pdf",
    sourceType: "ordinance",
    issuingAuthority: "City of Philadelphia, Department of Licenses and Inspections",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2022-08-08",
    effectiveFrom: "2023-01-01",
    retrievedAt: PHILLY_LAST_VERIFIED,
    lastVerifiedAt: PHILLY_LAST_VERIFIED,
    notes:
      "Superseded, read 2026-09-25 for the chain of authority and to check the arithmetic: it set the 2023 schedule at a CPI multiplier of 16.1% on the same July 1, 2017 base, became law September 8, 2022 and took effect January 1, 2023. Every 2025 figure equals its 2023 figure × 1.0896 (1.265 ÷ 1.161): $232 → $253, $67 → $73, $1,219 → $1,328, $23 → $25.30, $15 → $16.40. The chain closing is the independent check that the schedule in force is the one this site models.",
  },
  {
    key: PHILLY_BUILDING_PAGE_SOURCE_KEY,
    jurisdictionKey: PHILLY_KEYS.jurisdiction,
    title: "Get a Building Permit — City of Philadelphia",
    url: "https://www.phila.gov/services/permits-violations-licenses/apply-for-a-permit/building-and-repair-permits/get-a-building-permit/",
    sourceType: "municipal_website",
    issuingAuthority: "City of Philadelphia",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: PHILLY_LAST_VERIFIED,
    lastVerifiedAt: PHILLY_LAST_VERIFIED,
    notes:
      "Read 2026-09-25. Its Cost block publishes what PG_012 does not: the filing fee (\"For one-or-two-family dwellings: $25. For any other occupancy: $100. This fee is nonrefundable and is applied towards the final permit fee\"), City surcharge $3, State surcharge $4.50, record retention $4 per plan, Accelerated Plan Review at $2,000 (\"Accelerated review fees will not be credited toward your final permit fee\"), the development impact tax, and the payment surcharges. It also establishes the workflow (eCLIPSE, appointment-only counter), the zoning order (\"In most cases, you must get a Zoning Permit before you can apply for a Building Permit\"), the contractor rules, and the executed-contract requirement for the 2% alteration fee option.",
  },
  {
    key: PHILLY_ELECTRICAL_PAGE_SOURCE_KEY,
    jurisdictionKey: PHILLY_KEYS.jurisdiction,
    title: "Get an Electrical Permit — City of Philadelphia",
    url: "https://www.phila.gov/services/permits-violations-licenses/apply-for-a-permit/building-and-repair-permits/get-an-electrical-permit/",
    sourceType: "municipal_website",
    issuingAuthority: "City of Philadelphia",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: PHILLY_LAST_VERIFIED,
    lastVerifiedAt: PHILLY_LAST_VERIFIED,
    notes:
      "Read 2026-09-25. Publishes the electrical fee in words — \"The permit fee for electrical work is $25 for each $1000 or fraction thereof of estimated electrical construction cost. Minimum fee: $63. Maximum fee: $18,975\" — the $100 filing fee (\"nonrefundable … counted toward the final permit fee\"), the $150 rough-in as its own application valid 60 days while the work is not concealed, the exemption list of Title 4-A-301.2.3, the third-party inspection rule (\"The owner or the owner's agent must hire a licensed electrical inspection agency to perform all inspections\"), the $1,050 accelerated review, and the rule that no electrical permit issues until the paired building permit has issued.",
  },
  {
    key: PHILLY_PLUMBING_PAGE_SOURCE_KEY,
    jurisdictionKey: PHILLY_KEYS.jurisdiction,
    title: "Get a Plumbing Permit — City of Philadelphia",
    url: "https://www.phila.gov/services/permits-violations-licenses/apply-for-a-permit/building-and-repair-permits/get-a-plumbing-permit/",
    sourceType: "municipal_website",
    issuingAuthority: "City of Philadelphia",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: PHILLY_LAST_VERIFIED,
    lastVerifiedAt: PHILLY_LAST_VERIFIED,
    notes:
      "Read 2026-09-25. States the three plumbing categories as the City states them — new construction and additions / alterations / repairs and replacements — each row with its residential exception, the $100 filing fee, both surcharges, record retention, the $150 rough-in (one-or-two-family dwellings are not eligible) and the $1,050 accelerated review. Under its Alterations heading the row labels are pasted from the table above (\"All new construction and additions\" / \"Additions to one-or-two-family homes\") while the amounts are the alteration figures — a copy-paste error on the page, recorded as a needs_review verification against that rule rather than smoothed over. It also lists what needs no permit and what routes to a Site Work / Utility Permit.",
  },
  {
    key: PHILLY_FOUNDATION_PAGE_SOURCE_KEY,
    jurisdictionKey: PHILLY_KEYS.jurisdiction,
    title: "Get a Foundation-only Building Permit — City of Philadelphia",
    url: "https://www.phila.gov/services/permits-violations-licenses/apply-for-a-permit/building-and-repair-permits/get-a-foundation-only-building-permit/",
    sourceType: "municipal_website",
    issuingAuthority: "City of Philadelphia",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: PHILLY_LAST_VERIFIED,
    lastVerifiedAt: PHILLY_LAST_VERIFIED,
    notes:
      "Read 2026-09-25. States the three foundation tiers without the table's column drift — \"For foundations 500 sq. ft. or less: $253\", $442 for 501 to 2,500, $759 above — and with no occupancy split at all, which is why one tier table prices both of PG_012's columns. This page is the sourceId of the foundation rule itself.",
  },
  {
    key: PHILLY_FEES_DOCUMENTS_SOURCE_KEY,
    jurisdictionKey: PHILLY_KEYS.jurisdiction,
    title: "Fees for L&I permits and licenses — City of Philadelphia",
    url: "https://www.phila.gov/documents/fees-for-li-permits-and-licenses/",
    sourceType: "municipal_website",
    issuingAuthority: "City of Philadelphia",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: PHILLY_LAST_VERIFIED,
    lastVerifiedAt: PHILLY_LAST_VERIFIED,
    notes:
      "Read 2026-09-25. The index that lists every L&I schedule with its release date, which is how the document in force on the verification date was told from the revision effective 2026-10-01, and it carries the separate zoning fee schedule (PZ_008) that this site names rather than prices.",
  },
];

/** Empty on purpose: the permit types Philadelphia uses already exist as shared rows. */
const permitTypes: JurisdictionSeed["permitTypes"] = [];
const projectTypes: JurisdictionSeed["projectTypes"] = [];

const jurisdictionPermitTypes: SeedJurisdictionPermitType[] = [
  {
    jurisdictionKey: PHILLY_KEYS.jurisdiction,
    permitTypeKey: "building",
    isAvailable: true,
    localName: "Building permit",
    officialUrl:
      "https://www.phila.gov/services/permits-violations-licenses/apply-for-a-permit/building-and-repair-permits/get-a-building-permit/",
    notes:
      "Priced from square footage in two columns: $1,328 flat for a new one-or-two-family dwelling, $253 for the first 500 sq. ft. plus $73 per additional 100 sq. ft. or fraction for every other occupancy, with separate rows for additions, alterations (or the applicant's 2%-of-cost option), the three-tier foundation-only permit and complete demolition. The filing fee ($25 residential, $100 otherwise) is credited toward this fee, and $7.50 of City and State surcharges ride on top.",
  },
  {
    jurisdictionKey: PHILLY_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    isAvailable: true,
    localName: "Electrical permit",
    officialUrl:
      "https://www.phila.gov/services/permits-violations-licenses/apply-for-a-permit/building-and-repair-permits/get-an-electrical-permit/",
    notes:
      "One row for every occupancy: $25 for each $1,000 or fraction of estimated electrical construction cost, minimum $63, maximum $18,975 (Philadelphia Code §4-A-903.2). The $100 filing fee is credited toward it, the $150 rough-in is an optional separate application held outside the permit fee, and inspections are third-party — the owner or agent hires a licensed electrical inspection agency.",
  },
  {
    jurisdictionKey: PHILLY_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    isAvailable: true,
    localName: "Plumbing permit",
    officialUrl:
      "https://www.phila.gov/services/permits-violations-licenses/apply-for-a-permit/building-and-repair-permits/get-a-plumbing-permit/",
    notes:
      "Three categories, each with a residential exception: new construction and additions at $284 for the first 7 fixtures plus $25 each ($50 / $22.50 for additions to one-or-two-family homes), alterations at $189 plus $22.50 ($50 / $22.50 residential), and repairs priced row by row — water heater $37 each ($31 flat for a house) and fixture replacement $75 for seven plus $6.30 ($31 flat for a house). The $100 filing fee is credited toward the permit fee.",
  },
  {
    jurisdictionKey: PHILLY_KEYS.jurisdiction,
    permitTypeKey: "mechanical",
    isAvailable: true,
    localName: "Mechanical permit",
    officialUrl:
      "https://www.phila.gov/services/permits-violations-licenses/apply-for-a-permit/building-and-repair-permits/",
    notes:
      "Required for mechanical work and issued by the same department. PG_012 prices it at 2% of the value of construction with a $189 minimum, and fire suppression on the same table at $15.10 per sprinkler head with a $189 minimum — both transcribed in the research record and named on this site's pages, not modelled, because this release's third page is plumbing.",
  },
];

const feeSchedules: SeedFeeSchedule[] = [
  {
    key: PHILLY_KEYS.feeSchedule,
    jurisdictionKey: PHILLY_KEYS.jurisdiction,
    sourceKey: PHILLY_FEE_SCHEDULE_SOURCE_KEY,
    title: "City of Philadelphia Construction Permit Fees (PG_012, effective January 1, 2025)",
    officialUrl:
      "https://www.phila.gov/media/20260209092722/PG_012_INF_Summary-of-construction-permit-fees-Eff-1.1.2025-Rev-2.2026.pdf",
    effectiveFrom: PHILLY_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: PHILLY_LAST_VERIFIED,
    notes:
      "Promulgated by L&I under Philadelphia Code §§6-301, 9-102 and 4-A-901.15 as the July 1, 2017 fee multiplied by a CPI multiplier of 26.5%, effective January 1, 2025, replacing and superseding the schedule of August 8, 2022 (CPI 16.1%, effective January 1, 2023) — the chain checks at ×1.0896. L&I's regulation and PG_012 carry the same amounts row for row. The next revision, PG_012 Rev 7.2026, takes effect 2026-10-01 and changes exactly one administrative row ($75 → $300); every modelled rate is identical, so it is recorded as a source rather than a second rule set.",
  },
];

function attach(permitTypeKey: string, rules: SeedFeeRule["rule"][]): SeedFeeRule[] {
  return rules.map((rule) => ({
    jurisdictionKey: PHILLY_KEYS.jurisdiction,
    permitTypeKey,
    scheduleKey: PHILLY_KEYS.feeSchedule,
    rule,
  }));
}

const feeRules: SeedFeeRule[] = [
  ...attach("building", PHILLY_BUILDING_BASE_RULES),
  ...attach("electrical", PHILLY_ELECTRICAL_BASE_RULES),
  ...attach("plumbing", PHILLY_PLUMBING_BASE_RULES),
];

const requirements: SeedRequirement[] = [
  {
    jurisdictionKey: PHILLY_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "document",
    title: "An application with the full scope of work, filed in eCLIPSE with the filing fee",
    description:
      "The building permit page: any property owner or their authorized agent — design professional, attorney, contractor or licensed expediter — applies, and \"The permit application must include the complete scope of work and current owner information.\" You must apply under the legal address established by the Office of Property Assessment; if the property was recently sold, submit the settlement sheet or deed; if the owner is not a natural person or a publicly-traded company, name the qualifying owners. And \"No permits will be released for new construction unless the property is current on all City of Philadelphia taxes.\" The filing fee — $25 for a one-or-two-family dwelling, $100 otherwise — is paid with the application, is nonrefundable, and is applied toward the final permit fee.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: PHILLY_BUILDING_PAGE_SOURCE_KEY,
    lastVerifiedAt: PHILLY_LAST_VERIFIED,
  },
  {
    jurisdictionKey: PHILLY_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "license",
    title: "A licensed Philadelphia contractor, with every contractor named before final payment",
    description:
      "\"A licensed Philadelphia contractor must perform the work, except for projects on an existing one-or-two-family home that don't require an electrical or plumbing permit\" — in which case the work may also be done by an owner who resides in the building or a registered PA Home Improvement Contractor holding a Philadelphia Commercial Activity License. Where the project requires contractors, \"all contractors must be named before final payment for the permit can be accepted\", and each must hold an active license, be current on City taxes, and have current insurance on file with L&I.",
    isMandatory: true,
    sortOrder: 20,
    sourceKey: PHILLY_BUILDING_PAGE_SOURCE_KEY,
    lastVerifiedAt: PHILLY_LAST_VERIFIED,
  },
  {
    jurisdictionKey: PHILLY_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "zoning_review",
    title: "A Zoning Permit first, and a stamped zoning site plan with the application",
    description:
      "\"In most cases, you must get a Zoning Permit before you can apply for a Building Permit.\" The requirements list then asks for the \"Zoning Permit & Approved Zoning Site Plan — Stamped by Licenses and Inspections for respective permit numbers\" on new construction, addition and alteration projects that require submission of plans. Zoning fees themselves are a separate schedule (PZ_008) and are never inside a building total on this site.",
    isMandatory: true,
    sortOrder: 30,
    sourceKey: PHILLY_BUILDING_PAGE_SOURCE_KEY,
    lastVerifiedAt: PHILLY_LAST_VERIFIED,
  },
  {
    jurisdictionKey: PHILLY_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "document",
    title: "An executed contract or itemized cost estimate when the 2% alteration fee option is used",
    description:
      "PG_012 lets the applicant elect to price an alteration at 2% of the cost of construction (minimum $253), and the building permit page's forms list makes the documentation that election requires explicit: \"Executed contract or itemized cost estimate — For alteration projects using the option for 2 percent permit fee calculation.\" The choice is a published option rather than a default — without it the square-footage row applies, and with it the area row stops applying.",
    isMandatory: true,
    sortOrder: 40,
    sourceKey: PHILLY_BUILDING_PAGE_SOURCE_KEY,
    lastVerifiedAt: PHILLY_LAST_VERIFIED,
  },
  {
    jurisdictionKey: PHILLY_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "license",
    title: "A licensed electrical contractor, and a licensed agency for every inspection",
    description:
      "\"A licensed electrical contractor must perform all electrical work\" — active license, current on City taxes, current insurance on file with L&I — and where someone other than the electrical contractor files, the application must carry a signed statement on the contractor's letterhead affirming association with the project. Inspections are third-party by rule: \"The owner or the owner's agent must hire a licensed electrical inspection agency to perform all inspections.\" From July 1, 2026 a permit application including an electric vehicle charger also requires the named contractor to hold a valid EVITP certification on file with the license.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: PHILLY_ELECTRICAL_PAGE_SOURCE_KEY,
    lastVerifiedAt: PHILLY_LAST_VERIFIED,
  },
  {
    jurisdictionKey: PHILLY_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "other",
    title: "Work that needs no electrical permit at all — Title 4-A-301.2.3",
    description:
      "\"In accordance with Title 4-A-301.2.3, you may not even need an Electrical Permit for the following work\": repairs related to regular maintenance — \"the replacement of lamps, circuit breakers and fuses; repairing or replacing switches, lamp sockets, ballasts, drop cords, receptacles and bulbs; taping bare joints; and replacing lighting fixtures to existing conditions\" — connection of approved portable equipment to permanently installed receptacles, work on regulated public utility equipment, removal of wiring in a demolition, temporary systems for testing or servicing, electrical componentry in partition systems, low-voltage wiring in one-and-two-family and Group U occupancies, railway cars and automotive equipment, and conductors or equipment of public utilities under Commonwealth or federal jurisdiction.",
    isMandatory: false,
    sortOrder: 20,
    sourceKey: PHILLY_ELECTRICAL_PAGE_SOURCE_KEY,
    lastVerifiedAt: PHILLY_LAST_VERIFIED,
  },
  {
    jurisdictionKey: PHILLY_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    requirementType: "license",
    title: "A licensed master plumber overseeing the work",
    description:
      "\"A licensed master plumber must oversee plumbing work\" — with an active license, current on City taxes and current insurance on file with L&I. If anyone other than the master plumber applies, \"the application must be accompanied by a signed statement on the master plumber's letterhead confirming their association with the project\", and backflow devices must be installed by an approved technician. Any property owner or their authorized agent (licensed master plumber, PA-licensed design professional, attorney or licensed expeditor) may be the applicant.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: PHILLY_PLUMBING_PAGE_SOURCE_KEY,
    lastVerifiedAt: PHILLY_LAST_VERIFIED,
  },
  {
    jurisdictionKey: PHILLY_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    requirementType: "other",
    title: "What needs no plumbing permit, and what is filed as a Site Work / Utility Permit",
    description:
      "\"A Plumbing Permit is not required for: Minor repairs with the same material. This includes replacing faucets, valves, and parts. Removing and re-installing toilets, if no pipes or fixtures will be replaced or moved. Stopping leaks and clearing stoppages.\" Private water or sewer services are the opposite case — \"Private water or sewer services must be filed through a Site Work / Utility Permit\", with trade contractor details, and separate permits for each trade are generated on approval.",
    isMandatory: false,
    sortOrder: 20,
    sourceKey: PHILLY_PLUMBING_PAGE_SOURCE_KEY,
    lastVerifiedAt: PHILLY_LAST_VERIFIED,
  },
];

const profile: SeedProfile = {
  jurisdictionKey: PHILLY_KEYS.jurisdiction,
  headline: "What construction permits cost in Philadelphia",
  summary:
    "Philadelphia stacks four things on every L&I permit. First a filing fee, paid when you apply — $25 for a one-or-two-family dwelling, $100 for any other occupancy, $100 flat for electrical and plumbing — which is nonrefundable but credited toward the permit fee, so it acts as a floor on that fee rather than a fifth charge. Second the permit fee itself, priced three different ways by trade: building from square-footage bands with a flat residential column, electrical from $25 for each $1,000 or fraction of estimated cost between a published $63 minimum and a published $18,975 maximum, plumbing from blocks of fixtures. Third a City surcharge of $3.00 and a State surcharge of $4.50 on every permit. Fourth a record retention fee of $4 per plan, which this site names but does not price. There is no separate plan review line anywhere: plan review is inside the permit fee, and the only line that prices it is the optional Accelerated Plan Review, which L&I says will not be credited.",
  localContext:
    "One department, one portal, one set of fees. The **Department of Licenses and Inspections (L&I)** issues building, electrical, plumbing, mechanical, fire-suppression and zoning permits through **eCLIPSE**, and Philadelphia being a consolidated city–county, the City is also **Philadelphia County** (state FIPS 42, county FIPS 42101) — there is no second authority whose charges would sit beside these. Applications and payment run through eCLIPSE; the Permit and License Center in the Municipal Services Building at 1401 John F. Kennedy Blvd. takes appointment-only visits, 8 a.m. to 3:30 p.m. Monday through Friday, closing at noon on the last Wednesday of the month; questions go to 311 or (215) 686-8686.\n\n**How the schedule is made.** The amounts are not set row by row by City Council. L&I promulgates them under Philadelphia Code §§6-301, 9-102 and 4-A-901.15 as \"the fee as it existed on July 1, 2017, multiplied by the CPI Multiplier\". A multiplier of 16.1% produced the schedule effective January 1, 2023; 26.5% produced the one in force, effective January 1, 2025, which \"replaces and supersedes\" it. The chain checks arithmetically — every current figure is its 2023 predecessor × 1.0896 ($232 → $253, $67 → $73, $1,219 → $1,328) — which is the independent confirmation that this site models the schedule actually in force.\n\n**Two columns, and they are not occupancy classes.** PG_012's headers are \"Residential (1 or 2 family)\" and \"Other Occupancies\": a building-type question, not a use class. A two-family house and a twenty-unit apartment building are both in the other column unless the reader says otherwise, and no `occupancy` value derives the split — so every rule here reads `custom.single_or_two_family`, and absent the flag the other column applies, which is the larger figure.\n\nThe revision after this one is already published. **PG_012 Rev 7.2026 takes effect October 1, 2026** (released 2026-07-29); it was diffed against the document in force on the verification date, and the only change to its four pages is one administrative row moving from $75 to $300. Every area band, every fixture block, the electrical ladder and both surcharges are identical — so it is recorded as a source with its own effectiveFrom rather than as a second rule set.\n\n**Zoning is a separate schedule.** Zoning permits are priced under PZ_008 and, as the City puts it, \"In most cases, you must get a Zoning Permit before you can apply for a Building Permit\" — so a zoning fee is never inside a building total on this site.",
  valuationBasis:
    "Philadelphia has **three** bases, one per trade, and the schedule says which is which.\n\n**Square footage, in bands, for building permits.** The band is the shape of the whole building side: a published base for the first 500 square feet, then a rate per additional 100 square feet *or fraction of one* — \"$253 for the first 500 sq. ft.; plus $73 for each additional 100 sq. ft. or fraction thereof above 500\" for other occupancies, $76 + $56 for a residential alteration, $75 + $56 for a residential addition. The \"or fraction thereof\" is what makes partial hundreds round up: 1,000 square feet is five steps above the threshold, 1,050 is six. A new one-or-two-family dwelling is the exception that proves the shape — $1,328 flat, whatever its size — and the foundation-only permit is the one table in the schedule: $253 up to 500 square feet, $442 from 501 to 2,500, $759 above.\n\n**Valuation, for electrical permits and one building election.** The electrical fee is \"$25 for each $1,000 or fraction thereof of estimated electrical construction cost; minimum fee of $63 and maximum fee of $18,975\" — an estimate of electrical construction cost, rounded up to the next thousand, floored and capped at figures the schedule prints. The building side has one valuation row too: the applicant's published option to price any alteration at **2% of the cost of construction** (minimum $253) instead of by area, which the City documents require an executed contract or itemized cost estimate to claim.\n\n**Counts of things, for plumbing.** Fixtures select the block — $284 for the first seven on new construction, then $25 each; $189 then $22.50 for alterations — and the repair rows are priced per activity: a water heater at $37 each ($31 flat in a one-or-two-family home), fixture replacement at $75 for seven then $6.30 ($31 flat). There is no dollar figure in this schedule whose basis is not named here.",
  notIncluded:
    "These figures are Philadelphia's building, electrical and plumbing permit fees from PG_012, plus the filing fee credited toward them and the $7.50 of surcharges every service page publishes. They are not a total project cost, and they exclude:\n\n- **The record retention fee** — \"$4 per plan\" / per page larger than 8.5 by 14 inches. A count of sheets this calculator does not collect. Named with its amount on every page.\n- **The development impact tax**, published only as \"Fixed values based on construction and use classification for new construction\" and \"1% of total improvement costs for alterations and additions\", and only for residential projects \"eligible for a real estate tax abatement\". Neither the fixed values nor the eligibility test is on the page; named, never priced.\n- **Accelerated Plan Review** — $2,000 for building and foundation permits, $1,050 for electrical and plumbing — an optional five-business-day service that \"will not be credited toward your final permit fee\".\n- **Zoning permit fees**, a separate schedule (PZ_008) that in most cases must be bought before the building permit.\n- **Mechanical and fire suppression**, priced on the same PG_012 table — 2% of the value of construction with a $189 minimum; $15.10 per sprinkler head with a $189 minimum — transcribed in the research record and named on the pages, not modelled, because this release's third page is plumbing.\n- **The plumbing repair rows this calculator has no input for**: waste or water lines and stacks at \"$126 each pipe\" ($37 flat for one-or-two-family), house drain, trap and fresh air inlet at $75 ($31), area/roof/storm drains at $75 ($31), and water distribution line replacement at $126. Also unmodelled on the same table: new plumbing systems without structures ($284) and a new water distribution and drainage system filed separately ($253). Naming only the residential halves would publish half a schedule, so all of them are named with their amounts instead.\n- **Interior (non-load-bearing) demolition** — $76 for the first 4,000 square feet, $5 each additional 100 — a different row from complete demolition, selected by a choice the reader has not stated.\n- **The tenant fit-out row** ($16.40 per 100 square feet or fraction, minimum $189) and **manufactured / industrialized housing** ($569 or $1,138 per building), both published, neither modelled.\n- **The Administrative Services rows** — amended permits, copies, certificates of occupancy, preliminary review, extensions, reinstatements. PG_012's layout mode and L&I's regulation's drifting columns disagree about which amount belongs to which label, and none of them prices work; recorded, not paired by guess.\n- **Payment surcharges** — credit card +2.10%, debit +$3.45 — payment methods rather than permit fees.\n- **Everything another authority charges**: Philadelphia Water Department connections, meters and utility plan review; the Streets footway permit, which is issued automatically with a plumbing permit; Historical Commission approval for historic properties; dust-control and site permits; PECO service and meter applications; and any fee L&I collects for a permit this site does not model.",
  seoTitle: "Philadelphia PA construction permit fees",
  seoDescription:
    "How Philadelphia prices building, electrical and plumbing permits — $253 for the first 500 sq. ft. then $73 per 100 (a house is $1,328 flat), $25 per $1,000 of electrical cost capped at $18,975, $284 per seven plumbing fixtures — with the filing fee credited as a floor and $7.50 of surcharges.",
  publishStatus: "published",
  noindex: false,
  lastReviewedAt: PHILLY_LAST_VERIFIED,
};

const permitPages: SeedPermitPage[] = [
  {
    jurisdictionKey: PHILLY_KEYS.jurisdiction,
    permitTypeKey: "building",
    slug: "building-permit-cost",
    title: "Philadelphia building permit cost",
    intro:
      "Philadelphia prices a building permit off the building's square footage in one of two columns. A new one-or-two-family dwelling is $1,328 flat — the same price for a 1,600 square foot house and a 3,600 square foot one — while every other occupancy pays $253 for the first 500 square feet and $73 for each additional 100 square feet or fraction of one. Additions to a house are their own banded row ($75 plus $56 per additional 100), alterations another ($76 plus $56 residential, $253 plus $60 otherwise), and the schedule publishes an election to price an alteration at 2% of construction cost instead, with a $253 minimum. Two charges ride on every one of these: a filing fee that is credited toward the permit fee rather than added to it, and $7.50 of City and State surcharges.",
    localSummary:
      "The band is the shape of the schedule, and the \"or fraction thereof\" is what makes it bite: 1,000 square feet of other-occupancy new construction is $253 + 5 × $73 = $618, and 1,050 square feet pays for six steps rather than five. Three switches move the calculation to a different regime entirely. The one-or-two-family flag picks the residential column, where new construction is flat rather than banded. The foundation-only flag replaces every area row with the three-tier table — $253 up to 500 square feet, $442 from 501 to 2,500, $759 above — which the City's foundation page states with no occupancy split at all. And the alteration-by-cost flag takes the applicant's published 2% option and excludes the area row, because the two are alternatives the applicant chooses between, not a stack. Complete demolition sits apart from all of it at $25.30 per 100 square feet with a floor the schedule prints ($253) and a ceiling it prints too ($50,600).",
    notIncluded:
      "This is PG_012's building side — the area bands, the flat residential row, the foundation tiers, the demolition row — plus the filing fee credited toward it and the $7.50 of surcharges. It excludes:\n\n- **The record retention fee** of $4 per plan, a count of sheets this calculator does not collect.\n- **The development impact tax** — fixed values for new construction, 1% of improvement costs for alterations and additions, only for abatement-eligible residential projects — published without its values or its eligibility test.\n- **Accelerated Plan Review**, $2,000 for this permit, an optional service L&I says \"will not be credited toward your final permit fee\".\n- **Zoning fees**, a separate schedule (PZ_008) that in most cases is bought before the building permit.\n- **Mechanical and fire suppression permits** — 2% of construction value with a $189 minimum, and $15.10 per sprinkler head with a $189 minimum — priced on the same table, named on this site, not modelled here.\n- **Interior (non-load-bearing) demolition** ($76 for the first 4,000 square feet, $5 each additional 100), the **tenant fit-out row** ($16.40 per 100 square feet, minimum $189) and **manufactured housing** ($569 / $1,138 per building), each its own row this page does not price.\n- **The Administrative Services rows** — amended permits, copies, certificates of occupancy, preliminary review, extensions, reinstatements — whose labels PG_012's layout and L&I's regulation pair differently.\n- **Payment surcharges** (credit +2.10%, debit +$3.45) and **every other authority's charge**: the Historical Commission, the Department of Streets, the Philadelphia Water Department, dust control.",
    workedExample: {
      scenario:
        "A new warehouse of one thousand square feet, built by a contractor on a site the owner already holds — an other occupancy, with no one-or-two-family flag set.",
      inputs: {
        squareFootage: 1_000,
        occupancy: "commercial",
        workType: "new_construction",
      },
      notes:
        "The other-occupancy band: $253 for the first 500 square feet, then five completed hundreds at $73 — 253 + 365 = $618.00. The filing fee does not appear as a charge: $100 of filing fee against a $618 permit fee leaves no shortfall, so the floor has nothing to add, which is exactly how the credited filing fee should behave. The two surcharges are the only additions, $3.00 and $4.50, for $625.50 in total.\n\nRead the same job with custom.single_or_two_family set and the regime changes rather than the rate: the flat residential row applies, and a house of any size is $1,328.00 plus the same $7.50. Set custom.foundation_only instead and the area bands disappear entirely in favour of the three-tier table — 1,000 square feet falls in the middle tier at $442.00.",
    },
    faqs: [
      {
        question: "How much is a building permit for a new house in Philadelphia?",
        answer:
          "$1,328 flat, whatever the house's size. PG_012 prints \"If one-or-two-family dwelling, then $1,328 flat fee\" in the Residential (1 or 2 family) column of Additions and New Construction — so a 1,600 square foot house and a 3,600 square foot house pay the same permit fee. Set the one-or-two-family flag to reach this row; without it the other-occupancy bands apply.",
        sourceId: PHILLY_FEE_SCHEDULE_SOURCE_KEY,
        attribution: "PG_012, Additions and New Construction (Philadelphia Code §4-A-902.2.1), effective January 1, 2025.",
      },
      {
        question: "How is a building permit priced for an office, warehouse or apartment building?",
        answer:
          "$253 for the first 500 square feet, plus $73 for each additional 100 square feet or fraction of one. So 1,000 square feet is $253 + 5 × $73 = $618, and 1,050 square feet rounds up to six steps at $691. One row covers both a new building and an addition in the other-occupancy column; alterations take a slightly smaller increment of $60 above the same $253 base.",
        sourceId: PHILLY_FEE_SCHEDULE_SOURCE_KEY,
        attribution: "PG_012, Additions and New Construction and Alterations and Repairs (§4-A-902.2.1).",
      },
      {
        question: "What is the filing fee, and does it cost extra?",
        answer:
          "$25 for a one-or-two-family dwelling, $100 for any other occupancy — paid when you apply, nonrefundable, and \"applied towards the final permit fee\". Because it is credited, it behaves as a floor rather than an extra charge: this site models it as a rule that adds only the shortfall when the calculated permit fee comes in below the filing fee, and adds nothing once the permit fee is above it. The $7.50 of City and State surcharges are separate and always apply.",
        sourceId: PHILLY_BUILDING_PAGE_SOURCE_KEY,
        attribution: "Building permit page, Cost block, read 2026-09-25.",
      },
      {
        question: "Can an alteration be priced by cost instead of by square footage?",
        answer:
          "Yes, at the applicant's request: \"Alteration fees may be based on 2% of the cost of construction at request of the applicant (minimum $253).\" It is a published election rather than an add-on — with it, the area row does not fire, and the City requires an executed contract or itemized cost estimate with the application. Below $12,650 of construction cost the $253 minimum governs, because 2% of $12,650 is $253.",
        sourceId: PHILLY_FEE_SCHEDULE_SOURCE_KEY,
        attribution:
          "PG_012, Alterations and Repairs (§4-A-902.2.1); the executed-contract requirement is on the building permit page.",
      },
      {
        question: "How much is a demolition permit in Philadelphia?",
        answer:
          "$25.30 per 100 square feet or fraction, with a $253 minimum and a $50,600 maximum — one row spanning both columns of PG_012, which also prints the condition beside it: \"Separate permit by licensed Demolition Contractor required for complete demolition.\" Interior, non-load-bearing demolition is a different row ($76 for the first 4,000 square feet, $5 each additional 100) and is not modelled on this site.",
        sourceId: PHILLY_FEE_SCHEDULE_SOURCE_KEY,
        attribution: "PG_012, Demolition (Philadelphia Code §4-A-902.2.x as cited in L&I's fee regulation).",
      },
      {
        question: "Is there a separate plan review fee?",
        answer:
          "No separate plan review fee is published. Each service page's Cost block lists the filing fee, the permit fee, the two surcharges, record retention and one optional Accelerated Plan Review — $2,000 for building and foundation permits — and nothing else, so plan review sits inside the permit fee. Accelerated review is the only line that prices it, it is optional, and L&I says it \"will not be credited toward your final permit fee\".",
        sourceId: PHILLY_BUILDING_PAGE_SOURCE_KEY,
        attribution: "Building permit page, Cost block (\"Fee types that may apply\"), read 2026-09-25.",
      },
    ],
    seoTitle: "Philadelphia PA building permit cost",
    seoDescription:
      "Philadelphia building permit fees — $253 for the first 500 sq. ft. then $73 per 100 or fraction for other occupancies, $1,328 flat for a new one-or-two-family house, foundation tiers $253/$442/$759, filing fee credited as a floor.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: PHILLY_LAST_VERIFIED,
  },
  {
    jurisdictionKey: PHILLY_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    slug: "electrical-permit-cost",
    title: "Philadelphia electrical permit cost",
    intro:
      "Philadelphia charges one electrical permit fee for every occupancy: $25 for each $1,000 or fraction thereof of estimated electrical construction cost, with a published minimum of $63 and a published maximum of $18,975. The \"or fraction\" means the estimate rounds up to the next thousand — $12,400 of cost is thirteen increments, not twelve and a fraction — and above $759,000 of estimated cost the fee stops climbing at the ceiling the schedule prints. A $100 filing fee is paid when you apply, is nonrefundable, and is counted toward this permit fee; the City's $3.00 and the State's $4.50 surcharges ride on top, and an optional $150 rough-in permit is its own separate application.",
    localSummary:
      "Two published numbers deserve to be read together, because one of them is quietly unreachable. The $63 minimum never governs on its own: the $100 filing fee is credited against the permit fee, so a job whose permit fee would be $25 or $63 is topped up to $100 — the shortfall between the permit fee and the filing fee, not a second charge. The maximum, on the other hand, does bind: an electrical scope estimated at $800,000 would price at $2,000 of fee and is held to $18,975, which is the first published ceiling this site has modeled on a permit fee itself.\n\nThe rough-in is held outside the permit fee deliberately. L&I treats it as its own application — submitted after the main application is accepted for review, valid 60 days, only while the work is still visible, and impossible to obtain once the full permit has approved — so charging it as a separate component keeps the filing-fee floor measuring the permit rather than the two together.\n\nAnd the exemptions are real and listed: Title 4-A-301.2.3 says a permit may not be needed at all for regular-maintenance repairs — replacing lamps, breakers, fuses, switches, sockets, receptacles and bulbs, and replacing lighting fixtures to existing conditions among them.",
    notIncluded:
      "This is PG_012's electrical fee as L&I's regulation quotes it (§4-A-903.2), the $100 filing fee credited toward it, and the $7.50 of surcharges. It excludes:\n\n- **The record retention fee** of $4 per plan.\n- **Accelerated Plan Review**, $1,050 for this permit, optional and not credited — \"$350 is due when you apply. You must pay the remainder once approved.\"\n- **The rough-in permit's timing rules**, which are modelled as a component but not as a deadline: 60 days, work not concealed, no approval once the full permit has issued.\n- **Payment surcharges** — credit +2.10% (minimum $1.50), debit +$3.45 — and the $500,000 limit on online eCLIPSE payments.\n- **A separate PECO service and meter application**, which the City notes may be required.\n- **The paired building permit**: \"A separate Building Permit is required for all interior and exterior renovations… no Electrical Permit will be issued until the Building Permit is issued\" — a sequencing rule, not a fee.\n- **Every other authority's charge**, including Philadelphia Department of Public Health permits for emergency generators and fire pumps.",
    workedExample: {
      scenario:
        "An electrical remodel of an existing commercial space whose estimated electrical construction cost is twelve thousand four hundred dollars.",
      inputs: {
        valuationCents: 1_240_000,
        occupancy: "commercial",
        workType: "alteration",
      },
      notes:
        "$12,400 is thirteen thousands once the \"or fraction thereof\" rounds it up, and thirteen × $25 is $325.00 — comfortably above the published $63 minimum, so the minimum contributes nothing, and comfortably below the $18,975 maximum, so neither does that. The $100 filing fee again has nothing to add: a $325 permit fee is already above it. The two surcharges complete the stack at $332.50.\n\nThe neighbouring cases show each boundary doing its job. The same scope estimated at $1,000 prices at $25, the $63 minimum lifts it to $63, and the filing-fee floor then adds the $37 shortfall — the permit fee the filer actually owes is $100, the filing fee already paid. And a scope estimated at $800,000 prices at $2,000 of fee before the schedule's own ceiling holds it at $18,975.",
    },
    faqs: [
      {
        question: "How much is an electrical permit in Philadelphia?",
        answer:
          "$25 for each $1,000 or fraction thereof of estimated electrical construction cost, with a minimum fee of $63 and a maximum of $18,975. One row for every occupancy — PG_012 prints it as a single cell spanning both columns, so a house and a warehouse are priced identically. $12,400 of estimated cost is thirteen increments and $325 of fee.",
        sourceId: PHILLY_ELECTRICAL_PAGE_SOURCE_KEY,
        attribution: "Electrical permit page, Cost block; Philadelphia Code §4-A-903.2 as quoted in L&I's fee regulation.",
      },
      {
        question: "What is the filing fee for an electrical permit?",
        answer:
          "$100, nonrefundable, \"counted toward the final permit fee\". Because it is credited it works as a floor: if the calculated permit fee comes in below $100, this site adds only the difference — a $63 permit fee picks up a $37 shortfall — and above $100 nothing is added at all. The $3 City and $4.50 State surcharges are separate and apply to every permit.",
        sourceId: PHILLY_ELECTRICAL_PAGE_SOURCE_KEY,
        attribution: "Electrical permit page, Cost block, read 2026-09-25.",
      },
      {
        question: "Does the $63 minimum ever apply?",
        answer:
          "It is applied, but the filing fee usually supersedes it. The $63 minimum is the schedule's floor on the permit fee itself; the $100 filing fee, credited against that same fee, sits above it — so a small job lands at a $100 permit fee: the $63 minimum, then the $37 shortfall to the filing fee. The $63 figure is visible in the breakdown; it just never survives as the final number.",
        sourceId: PHILLY_ELECTRICAL_PAGE_SOURCE_KEY,
        attribution: "Electrical permit page (\"Minimum fee: $63\") with its filing-fee sentence; both read 2026-09-25.",
      },
      {
        question: "Do I need a permit to replace a light switch or a receptacle?",
        answer:
          "Usually not. \"In accordance with Title 4-A-301.2.3, you may not even need an Electrical Permit\" for repairs related to regular maintenance — the City's list includes \"the replacement of lamps, circuit breakers and fuses; repairing or replacing switches, lamp sockets, ballasts, drop cords, receptacles and bulbs; taping bare joints; and replacing lighting fixtures to existing conditions.\" New wiring, relocated devices and anything beyond like-for-like replacement are permitted work.",
        sourceId: PHILLY_ELECTRICAL_PAGE_SOURCE_KEY,
        attribution: "Electrical permit page, \"Projects that may not need permits\", citing Title 4-A-301.2.3.",
      },
      {
        question: "What is an electrical rough-in permit?",
        answer:
          "A $150 permit to install cables and conduit before the full permit is issued. You apply for the electrical permit first — including plans and fees, requesting the rough-in on that application — and once it is accepted for review you \"must submit a separate application for the rough-in approval\". Approval lasts 60 days, the work must not be concealed, and it cannot be granted once the full permit has been approved.",
        sourceId: PHILLY_ELECTRICAL_PAGE_SOURCE_KEY,
        attribution: "Electrical permit page, \"Rough-in Permits\" and Cost block, read 2026-09-25.",
      },
      {
        question: "Who performs the electrical inspections?",
        answer:
          "A third party you hire. \"The owner or the owner's agent must hire a licensed electrical inspection agency to perform all inspections.\" The permit itself also needs a licensed electrical contractor — active license, current City taxes, insurance on file with L&I — and from July 1, 2026 any application naming an electric vehicle charger needs EVITP certification on the contractor's license.",
        sourceId: PHILLY_ELECTRICAL_PAGE_SOURCE_KEY,
        attribution: "Electrical permit page, \"Third-party inspection\" and \"Contractor\", read 2026-09-25.",
      },
    ],
    seoTitle: "Philadelphia PA electrical permit cost",
    seoDescription:
      "Philadelphia electrical permit fees — $25 per $1,000 or fraction of estimated electrical construction cost, $63 minimum, $18,975 maximum, a $100 filing fee credited as a floor, and $7.50 of surcharges.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: PHILLY_LAST_VERIFIED,
  },
  {
    jurisdictionKey: PHILLY_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    slug: "plumbing-permit-cost",
    title: "Philadelphia plumbing permit cost",
    intro:
      "Philadelphia prices plumbing permits in three categories, each with its own residential exception. New construction and additions: $284 for the first seven fixtures and $25 for each additional one — one row for every occupancy — with additions to one-or-two-family homes at $50 and $22.50 instead. Alterations to existing buildings: $189 for the first seven fixtures, $22.50 each after, or $50 and $22.50 in a one-or-two-family home. Repairs and replacements are priced row by row: a water heater is $37 each ($31 flat for a house) and fixture replacement with no piping is $75 for seven fixtures plus $6.30 each ($31 flat for a house). The $100 filing fee is credited toward the permit fee, and $7.50 of City and State surcharges ride on top.",
    localSummary:
      "The fixture count is the whole mechanism, and the seven-fixture block is where small jobs and large ones part company. A new house with ten fixtures is $284 + 3 × $25 = $359 — the $50 exception on the page is written for *additions* to one-or-two-family homes, not for new ones, so a new house takes the general row whatever occupancy column it sits in. An addition to a house with five fixtures is $50 flat against the $284 the same five fixtures would cost in a new commercial build.\n\nThe repair rows are the part readers underestimate. A like-for-like water heater swap in a house is a $31 permit on the schedule — and because the $100 filing fee is credited against it, the filer's permit fee lands at $100: the $31 schedule figure, a $69 shortfall to the filing fee, and neither is a duplicate charge. Nine fixture replacements in an office are $75 + 2 × $6.30 = $87.60, topped up the same way to $100.\n\nOne label on the City's own page is wrong, and this site says so rather than smoothing it: under the Alterations heading the rows are labelled \"All new construction and additions\" and \"Additions to one-or-two-family homes\" — the headings of the table above — while carrying the alteration amounts ($189 / $22.50 and $50 / $22.50) that PG_012 and L&I's regulation both print on the alteration row. The amounts are certain; the page's labels are a copy-paste error, recorded as a needs-review note.",
    notIncluded:
      "This is PG_012's plumbing side — the new-construction and addition blocks, the alteration blocks, the two repair rows this site prices — plus the filing fee credited toward them and the $7.50 of surcharges. It excludes:\n\n- **The record retention fee** of $4 per plan.\n- **Accelerated Plan Review**, $1,050 for this permit, optional and not credited.\n- **The repair rows this calculator has no input for**: \"Repair or replace waste or water lines and stacks — $126 each pipe ($37 for one-or-two-family homes)\", \"Repair or replace house drain, trap, and fresh air inlet — $75 ($31)\", \"Repair or replace area drain, roof drain, and storm drain — $75 ($31)\", and \"Water distribution line replacement from curb stop into building — $126\". Amounts named, never estimated — modelling only their residential halves would publish half a schedule.\n- **Two more rows on the new-work table**: new plumbing systems without structures ($284) and a new water distribution and drainage system filed as a separate application ($253).\n- **The rough-in permit** ($150) as a component — one-or-two-family dwellings and site permits are not eligible for it at all, and this page does not model the timing rule (60 days, work not concealed).\n- **Private water and sewer services**, which \"must be filed through a Site Work / Utility Permit\", and the Philadelphia Water Department's own permits for connections to the main and for water meters.\n- **The Streets footway permit**, which is issued automatically alongside a plumbing permit, and Department of Public Health approvals for food-preparation fixtures and large hot water heaters.\n- **Payment surcharges** — credit +2.10%, debit +$3.45.",
    workedExample: {
      scenario:
        "A bathroom remodel in a one-or-two-family home that replaces twelve plumbing fixtures, piping included, with the one-or-two-family flag set.",
      inputs: {
        valuationCents: 600_000,
        workType: "alteration",
        fixtures: 12,
        custom: { single_or_two_family: true },
      },
      notes:
        "Twelve fixtures is the seven-fixture block of $50 plus five at $22.50 — $50 + $112.50 = $162.50 — which is the alteration row for a one-or-two-family dwelling. The $6,000 of cost in the inputs is deliberate and does not enter the calculation: Philadelphia does not price a plumbing alteration by value, and the only valuation row on this schedule's building side is the 2% election. The filing fee adds nothing, because $162.50 is already above the $100 credited against it, and the two surcharges bring the total to $170.00.\n\nThe neighbouring cases show each switch moving the figure. The same twelve fixtures in an office take the other column — $189 + 5 × $22.50 = $301.50. As an *addition* to the same house the row changes again, $50 + $22.50's, matching the addition table rather than the alteration table. And the same scope read as new construction is not a repair at all: the general new-work block applies at $284 for the first seven.",
    },
    faqs: [
      {
        question: "How much is a plumbing permit for new construction?",
        answer:
          "$284 for the first seven fixtures and $25 for each additional fixture — one row for every occupancy, and it covers additions too, so a new house with ten fixtures is $284 + 3 × $25 = $359. The $50 residential row on the page is written for *additions* to one-or-two-family homes, not for new ones.",
        sourceId: PHILLY_PLUMBING_PAGE_SOURCE_KEY,
        attribution: "Plumbing permit page, \"New construction and additions\"; Philadelphia Code §4-A-905.3.1.",
      },
      {
        question: "How much is a plumbing permit for an addition to a house?",
        answer:
          "$50 for the first seven fixtures and $22.50 for each one after — the schedule's residential exception, which exists because a home addition does not carry a whole building's worth of plumbing. Five fixtures in an addition to a house are $50; the same five in other occupancies are inside the $284 base of the general row.",
        sourceId: PHILLY_PLUMBING_PAGE_SOURCE_KEY,
        attribution: "Plumbing permit page, Exception row under \"New construction and additions\" (§4-A-905.3.1).",
      },
      {
        question: "How much does it cost to replace a water heater?",
        answer:
          "$37 per water heater for other occupancies, and $31 flat for a one-or-two-family dwelling — L&I's own regulation prints \" $37 per water heater; $31 flat fee if one- or two-family dwelling\", so two water heaters in a house are one $31 permit row, not $62. Set the plumbing activity to water heater and the occupancy flag as appropriate.",
        sourceId: PHILLY_PLUMBING_PAGE_SOURCE_KEY,
        attribution: "Plumbing permit page, \"Repairs and replacements\"; §4-A-905.3.4 as quoted in L&I's fee regulation.",
      },
      {
        question: "Why does a small plumbing repair cost $100?",
        answer:
          "Because of the filing fee, not the schedule. The plumbing filing fee is $100, nonrefundable and \"applied toward the final permit fee\" — so when the schedule's figure comes in below $100, the permit fee is topped up to the filing fee: a $31 water-heater permit picks up a $69 shortfall, and the filer owes $100 of permit fee (the $31 plus the $69, not $131) plus $7.50 of surcharges. Above $100 the floor adds nothing.",
        sourceId: PHILLY_PLUMBING_PAGE_SOURCE_KEY,
        attribution: "Plumbing permit page, Cost block: filing fee sentence and both surcharges, read 2026-09-25.",
      },
      {
        question: "Is there a separate plan review fee for plumbing?",
        answer:
          "No separate plan review fee is published. The Cost block lists the filing fee, the permit fee, the two surcharges, record retention, an optional $150 rough-in and an optional $1,050 Accelerated Plan Review — and nothing else. Plan review sits inside the permit fee; and for scopes that fit the EZ permit categories — including replacement of any number of fixtures with fixtures of the same kind — plans are not required at all.",
        sourceId: PHILLY_PLUMBING_PAGE_SOURCE_KEY,
        attribution: "Plumbing permit page, \"Fee types that may apply\", \"EZ permits\" and Cost block.",
      },
      {
        question: "Which plumbing work needs no permit?",
        answer:
          "\"A Plumbing Permit is not required for: Minor repairs with the same material. This includes replacing faucets, valves, and parts. Removing and re-installing toilets, if no pipes or fixtures will be replaced or moved. Stopping leaks and clearing stoppages.\" Private water or sewer services are the case that needs a different permit rather than none — they \"must be filed through a Site Work / Utility Permit\", which generates separate permits per trade on approval.",
        sourceId: PHILLY_PLUMBING_PAGE_SOURCE_KEY,
        attribution: "Plumbing permit page, \"Service overview\", read 2026-09-25.",
      },
    ],
    seoTitle: "Philadelphia PA plumbing permit cost",
    seoDescription:
      "Philadelphia plumbing permit fees — $284 per seven fixtures then $25, $50/$22.50 additions to one-or-two-family homes, $189 alterations, water heaters $37 ($31 residential), filing fee credited as a floor.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: PHILLY_LAST_VERIFIED,
  },
];

const verifications: SeedVerification[] = [
  {
    entityType: "source",
    entityKey: PHILLY_FEE_SCHEDULE_SOURCE_KEY,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: PHILLY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PHILLY_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "Read 2026-09-25 in both pdftotext modes and reconciled against the City's four service pages. Layout mode mispairs labels with amounts in this document, so the pairings recorded in the research file are the ones both readings and the pages agree on. Every amount this site charges comes from these four pages.",
  },
  {
    entityType: "source",
    entityKey: PHILLY_FEE_SCHEDULE_2026_SOURCE_KEY,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: PHILLY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PHILLY_FEE_SCHEDULE_2026_SOURCE_KEY,
    notes:
      "Read and diffed against the in-force document on 2026-09-25: header dates, revision number, and one administrative row $75 → $300. Every modelled rate byte-identical, so this is a source with its own effectiveFrom rather than a second rule set.",
  },
  {
    entityType: "source",
    entityKey: PHILLY_FEE_REGULATION_SOURCE_KEY,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: PHILLY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PHILLY_FEE_REGULATION_SOURCE_KEY,
    notes:
      "Read 2026-09-25 in both modes. CPI multiplier 26.5%, effective January 1, 2025, \"replaces and supersedes\" the 2022 schedule. Its citation column supplies every Philadelphia Code section this site quotes; the column drifts by one row at the tenant fit-out line, recorded rather than repaired.",
  },
  {
    entityType: "source",
    entityKey: PHILLY_FEE_REGULATION_2022_SOURCE_KEY,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: PHILLY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PHILLY_FEE_REGULATION_2022_SOURCE_KEY,
    notes:
      "Read 2026-09-25 for the chain of authority. Superseded since January 1, 2023; its figures were used to check the arithmetic — every 2025 figure equals its 2023 figure × 1.0896.",
  },
  {
    entityType: "source",
    entityKey: PHILLY_BUILDING_PAGE_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: PHILLY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PHILLY_BUILDING_PAGE_SOURCE_KEY,
    notes:
      "Read 2026-09-25. Its Cost block is the source of the filing fee, both surcharges, record retention, accelerated review and the development impact tax; its Requirements section supplies four of this jurisdiction's requirement rows, including the executed-contract rule for the 2% alteration option.",
  },
  {
    entityType: "source",
    entityKey: PHILLY_ELECTRICAL_PAGE_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: PHILLY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PHILLY_ELECTRICAL_PAGE_SOURCE_KEY,
    notes:
      "Read 2026-09-25. Publishes the electrical fee in words with its $63 minimum and $18,975 maximum, the $100 filing fee, the $150 rough-in's separate-application rule, the Title 4-A-301.2.3 exemptions and the third-party inspection requirement.",
  },
  {
    entityType: "source",
    entityKey: PHILLY_PLUMBING_PAGE_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: PHILLY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PHILLY_PLUMBING_PAGE_SOURCE_KEY,
    notes:
      "Read 2026-09-25. The three categories and every repair row with both occupancy figures; the row labels under its Alterations heading are wrong (pasted from the table above) while the amounts match PG_012 and L&I's regulation exactly — recorded as a needs_review verification against the alteration rule.",
  },
  {
    entityType: "source",
    entityKey: PHILLY_FOUNDATION_PAGE_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: PHILLY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PHILLY_FOUNDATION_PAGE_SOURCE_KEY,
    notes:
      "Read 2026-09-25. States the three tiers ($253 / $442 / $759) with no occupancy split, which resolves the table's column drift in favour of one tier table for both columns. This page is the sourceId of the foundation rule.",
  },
  {
    entityType: "source",
    entityKey: PHILLY_FEES_DOCUMENTS_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: PHILLY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PHILLY_FEES_DOCUMENTS_SOURCE_KEY,
    notes:
      "Read 2026-09-25. The release dates on this index are how the document in force was told from the revision effective 2026-10-01, and it carries the separate zoning schedule PZ_008 that this site names rather than prices.",
  },
  {
    entityType: "fee_schedule",
    entityKey: PHILLY_KEYS.feeSchedule,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: PHILLY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PHILLY_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "Effective 2025-01-01 per L&I's own regulation, which states the date and supersedes the 2022 schedule. The regulation and the table were read row for row against each other on 2026-09-25 and agree; the next revision was diffed and changes no modelled rate.",
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-NEW-OTHER",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: PHILLY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PHILLY_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "PG_012: \"$253 for the first 500 sq. ft.; plus $73 for each additional 100 sq. ft. or fraction thereof above 500\" under Other Occupancies, restated with its code citation (§4-A-902.2.1) in L&I's regulation. Modelled as one band: threshold 500, increment 100, base $253, rate 73 cents per square foot of band. The CPI chain confirms both figures ($232 → $253, $67 → $73).",
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-NEW-1-2-FAMILY",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: PHILLY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PHILLY_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "PG_012: \"If one-or-two-family dwelling, then $1,328 flat fee\" (§4-A-902.2.1). Flat rather than banded, and the CPI chain checks ($1,219 × 1.0896 = $1,328). Excluded from the calculation whenever custom.single_or_two_family is absent, which is the column split the schedule's own headers state.",
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-ALTER-BY-COST",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: PHILLY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PHILLY_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "PG_012: \"Alteration fees may be based on 2% of the cost of construction at request of the applicant (minimum $253).\" Modelled as an election behind custom.alteration_by_cost that excludes the area rows, because the schedule offers the two as alternatives. The building permit page's forms list requires an executed contract or itemized cost estimate to use it.",
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-FOUNDATION-ONLY",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: PHILLY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PHILLY_FOUNDATION_PAGE_SOURCE_KEY,
    notes:
      "$253 up to 500 sq. ft., $442 from 501 to 2,500, $759 above — read twice: once in PG_012 (whose layout mode mispairs the row) and once on the foundation-only service page, which states the tiers with no occupancy split. One tier table therefore prices both columns, and the flag excludes every area row while it is set.",
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-DEMOLITION",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: PHILLY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PHILLY_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "PG_012: \"General Demolition — $25.30 per 100 sq. ft. or fraction thereof (maximum $50,600; minimum $253)\", one row spanning both columns, with the schedule's own condition printed beside it: \"Separate permit by licensed Demolition Contractor required for complete demolition.\" Floor and ceiling are the schedule's own figures and are modelled as the rule's minimum and maximum.",
  },
  {
    entityType: "fee_rule",
    entityKey: "ELEC-PERMIT-FEE",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: PHILLY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PHILLY_FEE_REGULATION_SOURCE_KEY,
    notes:
      "§4-A-903.2 as L&I's regulation quotes it — \"$25 for each $1,000 or fraction thereof of estimated electrical construction costs; minimum fee of $63 and maximum fee of $18,975\" — and the same three figures appear verbatim in the electrical permit page's Cost block, which is the independent second reading. PG_012 prints the cell spanning both columns: one row for every occupancy.",
  },
  {
    entityType: "fee_rule",
    entityKey: "ELEC-FILING-FLOOR",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: PHILLY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PHILLY_ELECTRICAL_PAGE_SOURCE_KEY,
    notes:
      "\"Filing fee $100. This fee is nonrefundable. It will be counted toward the final permit fee.\" Modelled as permit_minimum on permit_fee charged as the shortfall — the construction Manchester already uses — which also makes the schedule's own $63 minimum unreachable as a final figure, since the $100 floor already exceeds it.",
  },
  {
    entityType: "fee_rule",
    entityKey: "PLUMB-NEW-CONSTRUCTION",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: PHILLY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PHILLY_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "PG_012 and the plumbing permit page both print \"$284 for first 7 fixtures; $25 for each additional fixture\" for new construction (§4-A-905.3.1), one row spanning the columns. The residential $50 exception on the same page applies to additions, not new construction, which is what keeps a new house on this row.",
  },
  {
    entityType: "fee_rule",
    entityKey: "PLUMB-ALTERATION",
    permitTypeKey: "plumbing",
    status: "needs_review",
    method: "official_pdf_review",
    verifiedAt: PHILLY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PHILLY_PLUMBING_PAGE_SOURCE_KEY,
    notes:
      "The amounts are certain: $189 for the first 7 fixtures plus $22.50 each (other occupancies), $50 plus $22.50 (one-or-two-family), printed identically by PG_012 and by L&I's fee regulation (§4-A-905.3.2). What is wrong is the service page's labelling: under its Alterations heading the rows are captioned \"All new construction and additions\" and \"Additions to one-or-two-family homes\", the headings of the table above it — a copy-paste error. Flagged needs_review so the label mismatch stays visible instead of being smoothed over.",
  },
  {
    entityType: "fee_rule",
    entityKey: "PLUMB-WATER-HEATER",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: PHILLY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PHILLY_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "\"Water Heater — $37 per water heater\" in the repairs table, with the residential figure printed beside it in both PG_012 ($31) and L&I's regulation (\"$31 flat fee if one-or-two-family dwelling\", §4-A-905.3.4). The regulation's words \"flat fee\" are why the residential row is modelled as flat rather than per unit.",
  },
  {
    entityType: "permit_page",
    entityKey: "building-permit-cost",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: PHILLY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PHILLY_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "The area bands, the flat residential row, the 2% election, the foundation tiers and the demolition row, plus the filing fee and both surcharges from the service page's Cost block. The worked example is arithmetic on the schedule: $253 + 5 × $73 = $618, no floor shortfall at $100 filing, $3.00 + $4.50 of surcharges. The record retention fee, the development impact tax, accelerated review, zoning and the rows this page does not price are all named rather than dropped.",
  },
  {
    entityType: "permit_page",
    entityKey: "electrical-permit-cost",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: PHILLY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PHILLY_ELECTRICAL_PAGE_SOURCE_KEY,
    notes:
      "The $25-per-$1,000 ladder with its published minimum and maximum, the $100 filing floor, the $150 rough-in behind its flag, and both surcharges. The worked example is arithmetic on the schedule: thirteen increments × $25 = $325, no floor shortfall, $7.50 of surcharges. The page states that the $63 minimum is superseded by the filing-fee floor rather than hiding the interaction.",
  },
  {
    entityType: "permit_page",
    entityKey: "plumbing-permit-cost",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: PHILLY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PHILLY_PLUMBING_PAGE_SOURCE_KEY,
    notes:
      "The three categories, both occupancy sides of each priced row, the $100 filing floor and both surcharges. The worked example is arithmetic on the schedule: $50 + 5 × $22.50 = $162.50, no floor shortfall, $7.50 of surcharges. The service page's mislabelled alteration rows are reported on the page and carried as a needs_review verification against the rule.",
  },
  {
    entityType: "jurisdiction_profile",
    entityKey: PHILLY_KEYS.jurisdiction,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: PHILLY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PHILLY_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "Hub content built from PG_012, L&I's fee regulation (both the current and the superseded one, for the CPI chain) and the City's four service pages, with the documents index fixing which table is in force. The State surcharge's statutory origin and the October 2026 revision's $300 row are named as open questions in the research record rather than resolved by guess.",
  },
];

export const philadelphiaSeed: JurisdictionSeed = {
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
export const PHILLY_PUBLISHED_PERMIT_PAGES = philadelphiaSeed.permitPages.filter(
  (page) => page.publishStatus === "published" && !page.noindex,
);
