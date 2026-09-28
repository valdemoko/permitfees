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
  INDIANAPOLIS_ADMIN_FEE_FORM_SOURCE_KEY,
  INDIANAPOLIS_BUILDING_BASE_RULES,
  INDIANAPOLIS_ELECTRICAL_BASE_RULES,
  INDIANAPOLIS_FEE_EFFECTIVE_FROM,
  INDIANAPOLIS_FEE_PAGE_SOURCE_KEY,
  INDIANAPOLIS_PLUMBING_BASE_RULES,
  INDIANAPOLIS_PROPOSAL_239_SOURCE_KEY,
  INDIANAPOLIS_RESIDENTIAL_PAGE_SOURCE_KEY,
  INDIANAPOLIS_SCHEDULE_SOURCE_KEY,
} from "./fee-rules";

export * from "./fee-rules";

/**
 * The complete Indianapolis, Indiana seed payload.
 *
 * Every figure traces to research/indiana/indianapolis.md, which traces to the Department of
 * Business and Neighborhood Services' own fee schedule workbook ("As of 1.5.2026"), the page
 * that publishes it, the adopted ordinance behind it (Proposal No. 239, 2025), the residential
 * permit page, and the administrative fee appeal form. Nothing is estimated.
 *
 * Three pages, all published: building, electrical and plumbing. Indianapolis is Indiana's
 * second jurisdiction and the dataset's first instrument published as a **workbook rather than
 * a PDF** — five worksheets, read cell by cell, which is how its three-column permit structure
 * was settled. A structural permit is application + review + issuance, each printed in its own
 * column; the craft permits are one figure per subtype with the other two columns empty.
 *
 * The county row records **Marion County**. Indianapolis and Marion County are a consolidated
 * city-county — the ordinance quotes call it "the Consolidated City and County of
 * Indianapolis-Marion County" — and the Department of Business and Neighborhood Services is
 * its permitting authority, so the county is the second half of one jurisdiction rather than a
 * separate one.
 */

const RESEARCHER = "Permit Fee Intelligence research pass 17 (Indiana)";

export const INDIANAPOLIS_LAST_VERIFIED = "2026-09-26";

export const INDIANAPOLIS_KEYS = {
  state: "in",
  county: "marion-county",
  jurisdiction: "indianapolis",
  feeSchedule: "indianapolis-fee-schedules",
} as const;

const state: SeedState = {
  code: "IN",
  slug: "indiana",
  name: "Indiana",
  fipsCode: "18",
};

const county: SeedCounty = {
  key: INDIANAPOLIS_KEYS.county,
  slug: "marion-county",
  name: "Marion County",
  fipsCode: "18097",
};

const jurisdiction: SeedJurisdiction = {
  key: INDIANAPOLIS_KEYS.jurisdiction,
  stateKey: INDIANAPOLIS_KEYS.state,
  countyKey: INDIANAPOLIS_KEYS.county,
  type: "city",
  slug: "indianapolis",
  name: "Indianapolis",
  officialName: "City of Indianapolis",
  websiteUrl: "https://www.indy.gov/",
  permitPortalUrl: "https://www.indy.gov/activity/license-and-permit-fees",
  timezone: "America/Indiana/Indianapolis",
  isActive: true,
};

const departments: SeedDepartment[] = [
  {
    key: "indianapolis-dbns",
    jurisdictionKey: INDIANAPOLIS_KEYS.jurisdiction,
    kind: "building",
    name: "Department of Business and Neighborhood Services (DBNS)",
    phone: "(317) 327-8700",
    email: "permitquestions@indy.gov",
    url: "https://www.indy.gov/agency/department-of-business-and-neighborhood-services",
    addressLine: "1200 Madison Avenue, Suite 100, Indianapolis, IN 46225",
    hours: null,
    notes:
      "The consolidated city-county's permitting and inspection authority, and a self-funded department: its own fee page states that it \"does not receive a property tax distribution, so all DBNS operations are funded by the fees assessed by the department\", that its last large round of permitting fee updates was split between 2010 and 2011, and that the 2025 cost-of-service review behind the current schedule found zoning-violation penalties \"established at $50.00 each in 1988 and had not been updated since\". Applications are filed in Accela Citizen Access. The department also licenses and registers contractors, and its fees for that are on the same schedule and outside this page.",
  },
];

const sources: SeedSource[] = [
  {
    key: INDIANAPOLIS_SCHEDULE_SOURCE_KEY,
    jurisdictionKey: INDIANAPOLIS_KEYS.jurisdiction,
    title: "DBNS Fee Schedule — Permits, Inspections, Code Enforcement, Licenses, Misc. (as of 1.5.2026)",
    url: "https://us-east-1-indy.graphassets.com/ActDBC5rvRWeCZlNNnLrDz/cmk5m819t0az807k8xug0dwuw?dl=true",
    sourceType: "fee_schedule_pdf",
    issuingAuthority: "City of Indianapolis — Department of Business and Neighborhood Services",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2026-01-05",
    effectiveFrom: INDIANAPOLIS_FEE_EFFECTIVE_FROM,
    retrievedAt: INDIANAPOLIS_LAST_VERIFIED,
    lastVerifiedAt: INDIANAPOLIS_LAST_VERIFIED,
    notes:
      'The department\'s fee schedule is a spreadsheet, not a PDF: a workbook with five worksheets headed "Permits", "Inspections", "Code Enforcement", "Licenses" and "Misc.", each stamped "As of 1.5.2026", fetched 2026-09-26 from the asset host behind the fee page. It was read cell by cell with the cell reference printed for every value, because the Permits sheet\'s three fee columns are the whole mechanism: the header row is "Permit Type | Subtype/Description | Application Fee | Review Fee | Issuance Fee", every Structural Permit row carries "$40 per application" in column C with a review figure in D and an issuance figure in E, and every Plumbing, Electrical and Heating/Cooling row carries its whole figure in column C with D and E empty. Reading the workbook as a spreadsheet rather than as extracted text is what settled that structure; the research file records the cell references. The workbook also carries a header row on the Permits, Inspections, Code Enforcement and Misc. sheets reading "Admin Fees 250", which is the 536-609 administrative fee and not a per-permit charge.',
  },
  {
    key: INDIANAPOLIS_FEE_PAGE_SOURCE_KEY,
    jurisdictionKey: INDIANAPOLIS_KEYS.jurisdiction,
    title: "License and Permit Fees — the department's fee page",
    url: "https://www.indy.gov/activity/license-and-permit-fees",
    sourceType: "municipal_website",
    issuingAuthority: "City of Indianapolis — Department of Business and Neighborhood Services",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: INDIANAPOLIS_FEE_EFFECTIVE_FROM,
    retrievedAt: INDIANAPOLIS_LAST_VERIFIED,
    lastVerifiedAt: INDIANAPOLIS_LAST_VERIFIED,
    notes:
      'Read 2026-09-26 by rendering it in a browser rather than by fetching it: indy.gov serves an application shell to any scripted request ("<div id="app" activity_id="license-and-permit-fees">" and no content), and the page\'s own text appears only once its JavaScript runs, so it was read from the rendered page and its download link was taken from the rendered DOM. The page states the effective date and the mechanism: "PLEASE NOTE: As of January 5, 2026, the Department of Business and Neighborhood Services has updated many of its service fees. Below, you will find a complete list of fees assessed by our department." It explains the cost-of-service review, records the two public hearings and the October 2025 approvals, answers the transition question ("Only permit applications received on or after new fees took effect will be subject to the new fee schedule"), and states which fees did not move: "Craft permits, such as electrical, HVAC, and plumbing, did not change. Business license fees, zoning permits, and wrecking permits also remained the same." It also links the Administrative Fee Appeal Form.',
  },
  {
    key: INDIANAPOLIS_PROPOSAL_239_SOURCE_KEY,
    jurisdictionKey: INDIANAPOLIS_KEYS.jurisdiction,
    title: "City-County Council Proposal No. 239, 2025 — the ordinance amending the fee sections",
    url: "https://us-east-1-indy.graphassets.com/ActDBC5rvRWeCZlNNnLrDz/cme31mtvm1fbp07k64bi1va4o",
    sourceType: "ordinance",
    issuingAuthority: "City-County Council of the City of Indianapolis and Marion County",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2025-08-07",
    effectiveFrom: INDIANAPOLIS_FEE_EFFECTIVE_FROM,
    retrievedAt: INDIANAPOLIS_LAST_VERIFIED,
    lastVerifiedAt: INDIANAPOLIS_LAST_VERIFIED,
    notes:
      'Read 2026-09-26 as a fourteen-page PDF. It is the adopted ordinance behind the 1/5/2026 schedule and it prints every amended section\'s old figure beside its new one, which is how three readings on this page were settled rather than inferred: "536-609 Administrative fee $215.00 $250.00" (the workbook\'s "Admin Fees 250"), "536-619 Additional service fee for applying for all demolition, master, sign, structural, and infrastructure related permits $32.00 $40.00" (the $40 per application on every Structural Permit row), and "536-620 Plan review of a new primary or accessory Class 2 structure ... one hundred and seventy-five dollars ($175.00) for structures less than 2,000 square feet. For each additional 500 square feet an additional fee of twenty-one dollars ($21.00) twenty-five dollars ($25.00)" — the review column\'s own rows. The plumbing, electrical and heating/cooling sections do not appear in the ordinance at all, which is the page\'s "did not change" statement in documentary form.',
  },
  {
    key: INDIANAPOLIS_RESIDENTIAL_PAGE_SOURCE_KEY,
    jurisdictionKey: INDIANAPOLIS_KEYS.jurisdiction,
    title: "Residential Development Permits — Class 2 requirements, applications and exemptions",
    url: "https://www.indy.gov/activity/residential-development-permits",
    sourceType: "municipal_website",
    issuingAuthority: "City of Indianapolis — Department of Business and Neighborhood Services",
    authorityKind: "city",
    isPrimary: false,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: INDIANAPOLIS_LAST_VERIFIED,
    lastVerifiedAt: INDIANAPOLIS_LAST_VERIFIED,
    notes:
      'Read 2026-09-26 from the rendered page, like the fee page. It names the permitting sequence — infrastructure review (a drainage permit), then the improvement location permit, then the structural permit — and it carries the exemption lists this page states as requirements: the four electrical exceptions ("Replacement of an attic fan, bathroom exhaust fan, range hood exhaust fan, or whole house fan"; a single-phase circuit not exceeding 60 amperes serving specified equipment for which a building permit has been issued; household appliances installed without a new circuit; and temporary power for on-site construction) and the four plumbing ones ("Replacement in kind of piping ... It must not be more than 20 percent of all piping in the structure being replaced"; the initial connection of plumbing to a mobile home not on a permanent foundation in a state-licensed park; "Replacement of appliances, fixtures, traps, and valves in a plumbing system"; and a water heater replaced identically). It also states the structural application\'s document list and the point of the sequence: "You may be required to secure permits for sewer connection, flood, drainage, wrecking, and improvement location before the structural permit can be released."',
  },
  {
    key: INDIANAPOLIS_ADMIN_FEE_FORM_SOURCE_KEY,
    jurisdictionKey: INDIANAPOLIS_KEYS.jurisdiction,
    title: "Administrative Fee Appeal Form — the 536-609 administrative fee and its appeal",
    url: "https://citybase-cms-prod.s3.amazonaws.com/2ec73be1277c4ea1b2e822861ec160e3.pdf",
    sourceType: "other",
    issuingAuthority: "City of Indianapolis — Department of Business and Neighborhood Services",
    authorityKind: "city",
    isPrimary: false,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: INDIANAPOLIS_LAST_VERIFIED,
    lastVerifiedAt: INDIANAPOLIS_LAST_VERIFIED,
    notes:
      'Read 2026-09-26 as a one-page PDF, last revised 8/18/2016. It states what the administrative fee is for and when it attaches: "In order to file an Administrative Fee Appeal, you must either submit a Certificate of Completion, or renew the permit. If work on the project is complete, please submit a Certificate of Completion along with the Administrative Fee Appeal Form. If there is still work that needs to be completed, please renew the permit before submitting an appeal form. Renewed permits will still require a Certificate of Completion once the project is complete in order to avoid future fees." It names the section and the forum: "Any person, partnership or corporation shall have the right to appeal an administrative fee assessed in accordance with Section 536-609 of the Building Standards and Procedures of the Consolidated City of Indianapolis. The appeal shall be considered, and shall be ruled upon, by the Administrator of the Department of Code Enforcement, or the Administrator\'s authorized designee." This is why the $250.00 the schedule\'s header block prints is stated as a requirement rather than charged on every permit: it is assessed on a permit that has not been closed.',
  },
];

/** Empty on purpose: the permit types Indianapolis uses already exist as shared rows. */
const permitTypes: JurisdictionSeed["permitTypes"] = [];
const projectTypes: JurisdictionSeed["projectTypes"] = [];

const jurisdictionPermitTypes: SeedJurisdictionPermitType[] = [
  {
    jurisdictionKey: INDIANAPOLIS_KEYS.jurisdiction,
    permitTypeKey: "building",
    isAvailable: true,
    localName: "Structural Permit (STR) — application, review and issuance, priced by subtype",
    officialUrl: "https://www.indy.gov/activity/license-and-permit-plans-review",
    notes:
      "A Class 2 (residential) and Class 1 (commercial) permit with three separately stated components: a $40.00 additional service fee for applying (536-619), a plan review, and the permit fee itself. Residential subtypes run from a new primary structure at $1,000.00 + $150 per additional 1,000 square feet of issuance down to a miscellaneous residential permit at $150.00 flat, each with its own review figure; commercial subtypes are a new Class 1 structure at $1,000.00 to 2,500 square feet plus $150 per additional 1,000, a remodel at $350.00 or $750.00 below 2,500 square feet and $150 per additional 1,000 above it, and a miscellaneous commercial permit at $175.00 — all three with a flat $200.00 plan review. Nothing reads a valuation.",
  },
  {
    jurisdictionKey: INDIANAPOLIS_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    isAvailable: true,
    localName: "Electrical Permit (ELE) — one fee per subtype",
    officialUrl: "https://www.indy.gov/activity/residential-development-permits",
    notes:
      "Nine subtypes, each one figure: $202.00 to 2,500 square feet plus $23.00 per additional 1,000 for a new structure or commercial addition; $169.00 to 1,000 square feet plus $23.00 per additional 500 for a repair or residential addition; $146.00 (space heating) or $146.00 (space cooling) or $178.00 (both) to 10,000 square feet plus $23.00 per additional 2,500; $89.00 for a reconnection; $498.00 for manufactured-home work; $89.00 for general service activity; and $22.00 for self-certification tags. The department's fee page states that craft permits did not change in the 2026 update.",
  },
  {
    jurisdictionKey: INDIANAPOLIS_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    isAvailable: true,
    localName: "Plumbing Permit (PLM) — one fee per subtype, and one row read by fixture",
    officialUrl: "https://www.indy.gov/activity/residential-development-permits",
    notes:
      "Five subtypes: a new residential structure at $185.00 to 2,500 square feet plus $23.00 per additional 500; a residential repair, alteration or remodel at $153.00 to 1,000 square feet plus $23.00 per additional 500; commercial work at $182.00 for up to 10 fixtures plus $23.00 per additional 5; a reconnection to a relocated structure at $134.00; and general service activity at $89.00. The commercial row is the only plumbing row this jurisdiction prices by a count rather than by area.",
  },
];

const feeSchedules: SeedFeeSchedule[] = [
  {
    key: INDIANAPOLIS_KEYS.feeSchedule,
    jurisdictionKey: INDIANAPOLIS_KEYS.jurisdiction,
    sourceKey: INDIANAPOLIS_SCHEDULE_SOURCE_KEY,
    title: "DBNS fee schedule, as of 1.5.2026",
    officialUrl:
      "https://us-east-1-indy.graphassets.com/ActDBC5rvRWeCZlNNnLrDz/cmk5m819t0az807k8xug0dwuw?dl=true",
    effectiveFrom: INDIANAPOLIS_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: INDIANAPOLIS_LAST_VERIFIED,
    notes:
      "One workbook for the whole department, effective January 5, 2026 and approved in October 2025 after a 2024 cost-of-service analysis and two public hearings. The building, electrical and plumbing rows are modelled; the improvement location, sign, right-of-way, driveway, wrecking, floodplain, drainage and private-provider rows, the inspection table, the code-enforcement penalties and the licensing tables are transcribed in the research file and named as unmodelled.",
  },
];

function attach(permitTypeKey: string, rules: FeeRuleRecord[]): SeedFeeRule[] {
  return rules.map((rule) => ({
    jurisdictionKey: INDIANAPOLIS_KEYS.jurisdiction,
    permitTypeKey,
    scheduleKey: INDIANAPOLIS_KEYS.feeSchedule,
    rule,
  }));
}

const feeRules: SeedFeeRule[] = [
  ...attach("building", INDIANAPOLIS_BUILDING_BASE_RULES),
  ...attach("electrical", INDIANAPOLIS_ELECTRICAL_BASE_RULES),
  ...attach("plumbing", INDIANAPOLIS_PLUMBING_BASE_RULES),
];

const requirements: SeedRequirement[] = [
  {
    jurisdictionKey: INDIANAPOLIS_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "A structural permit is application + review + issuance, and the subtype is what selects the last two",
    description:
      'The schedule\'s Permits sheet states the three columns and every Structural Permit row fills all three: "$40 per application" for applying, a review figure, and an issuance figure. The subtype is what selects the arithmetic — nine of them, six residential (Class 2) and three commercial (Class 1) — and the square footage then prices it inside that subtype. A residential new primary structure of 3,000 square feet is $40.00 + $225.00 + $950.00; the same 3,000 square feet as an accessory structure is $40.00 + $175.00 + $325.00. Nothing in the row reads a valuation, which is where this schedule parts company with Minneapolis, Saint Paul and South Bend: the fee is a function of what is being built and how big it is, not of what it is worth.',
    isMandatory: true,
    sortOrder: 10,
    sourceKey: INDIANAPOLIS_SCHEDULE_SOURCE_KEY,
    lastVerifiedAt: INDIANAPOLIS_LAST_VERIFIED,
  },
  {
    jurisdictionKey: INDIANAPOLIS_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "The $250 administrative fee is assessed on a permit that has not been closed, not on every applicant",
    description:
      'Every worksheet\'s header block carries a row reading "Admin Fees 250", and the adopted ordinance places it: "536-609 Administrative fee $215.00 $250.00". The appeal form beside the schedule states when it attaches — "In order to file an Administrative Fee Appeal, you must either submit a Certificate of Completion, or renew the permit ... Renewed permits will still require a Certificate of Completion once the project is complete in order to avoid future fees" — and names its forum and its section. It is therefore stated here rather than charged in a rule: adding $250.00 to every permit would charge the applicants who close theirs on time, and the department\'s own fee page offers the appeal precisely because it is not automatic.',
    isMandatory: false,
    sortOrder: 20,
    sourceKey: INDIANAPOLIS_PROPOSAL_239_SOURCE_KEY,
    lastVerifiedAt: INDIANAPOLIS_LAST_VERIFIED,
  },
  {
    jurisdictionKey: INDIANAPOLIS_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "document",
    title: "The structural permit is third in a sequence, and the ones before it are other permits",
    description:
      'The residential page states the order: permitting "typically begins with the infrastructure review process and drainage permit", then the improvement location permit — "Once the improvement location permit has been approved and issued, the structural permit can be obtained" — and only then the structural permit. It adds the caveat that makes the sequence conditional: "You may be required to secure permits for sewer connection, flood, drainage, wrecking, and improvement location before the structural permit can be released." None of those permits is in this page\'s arithmetic; each has its own rows on the same schedule.',
    isMandatory: true,
    sortOrder: 30,
    sourceKey: INDIANAPOLIS_RESIDENTIAL_PAGE_SOURCE_KEY,
    lastVerifiedAt: INDIANAPOLIS_LAST_VERIFIED,
  },
  {
    jurisdictionKey: INDIANAPOLIS_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "other",
    title: "Four kinds of electrical work need no permit at all",
    description:
      'The residential page lists them in full: "Replacement of an attic fan, bathroom exhaust fan, range hood exhaust fan, or whole house fan"; "Installation of a single-phase electric circuit not exceeding 60 amperes at a nominal 120/240 volts which involves the installation, modernization, replacement, service, or repair of a heating system, space heating equipment, cooling system, space cooling equipment, a water heater, or a food waste disposer for which a building permit has been issued"; "Installation of household appliances such as window air conditioners, refrigerators, refrigerators with automatic icemakers, ranges, microwave ovens, clothes washers, clothes dryers, dishwashers, food waste disposers, and trash compactors when such installation does not include the installation of an electrical circuit"; and "Connection, provision, or use of temporary electrical power for on-site construction". They are stated as requirements because they are what the fee table does not price — the calculator prices the permit, and the page says which work has none.',
    isMandatory: false,
    sortOrder: 10,
    sourceKey: INDIANAPOLIS_RESIDENTIAL_PAGE_SOURCE_KEY,
    lastVerifiedAt: INDIANAPOLIS_LAST_VERIFIED,
  },
  {
    jurisdictionKey: INDIANAPOLIS_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    requirementType: "other",
    title: "Four kinds of plumbing work need no permit",
    description:
      'Also from the residential page: "Replacement in kind of piping in a plumbing system when the replacement piping meets the same performance specifications and has the same capacity as the piping being replaced. It must not be more than 20 percent of all piping in the structure being replaced"; "Initial connection or reconnection of plumbing to a mobile home not placed on a permanent foundation located in a mobile home park licensed by the Indiana State Department of Health"; "Replacement of appliances, fixtures, traps, and valves in a plumbing system"; and "Replacement of a water heater with one that is identical as to venting arrangement and type of fuel or energy input". The 20-per-cent limit on replacement in kind is the only quantitative bound in any of the two trades\' exemption lists, and it is the reason an identical replacement is free while a like-for-like one over that share is not.',
    isMandatory: false,
    sortOrder: 10,
    sourceKey: INDIANAPOLIS_RESIDENTIAL_PAGE_SOURCE_KEY,
    lastVerifiedAt: INDIANAPOLIS_LAST_VERIFIED,
  },
];

const profile: SeedProfile = {
  jurisdictionKey: INDIANAPOLIS_KEYS.jurisdiction,
  headline: "What construction permits cost in Indianapolis",
  summary:
    "Indianapolis prices a **structural permit as three components**: a **$40.00** additional service fee for applying, a **plan review**, and the permit fee itself — selected by one of nine subtypes and priced by the square footage inside it, never by a valuation. A new Class 2 primary structure is $40.00 + $175.00 + $750.00 up to 2,000 square feet plus $25.00 and $100.00 per additional 500; a new Class 1 structure is $40.00 + $200.00 + $1,000.00 up to 2,500 square feet plus $150.00 per additional 1,000. **Electrical and plumbing are one figure per subtype** — $202.00 for a new electrical installation, $169.00 for a residential electrical repair, $185.00 for new residential plumbing, $153.00 for a residential plumbing repair, and **$182.00 for up to 10 commercial fixtures plus $23.00 per additional 5**.",
  localContext:
    "This is the first schedule in the dataset delivered as a spreadsheet, and the format turns out to be the mechanism. Read as a workbook, the Permits sheet\'s header row says what the PDFs elsewhere only imply: \"Permit Type | Subtype/Description | Application Fee | Review Fee | Issuance Fee\". Every Structural Permit row fills all three — $40.00 for applying, a review figure, an issuance figure — and every Plumbing, Electrical and Heating/Cooling row fills only the first, with the two cells beside it empty. That is not a formatting accident: it is the department saying that a structural permit has three components and a craft permit has one.\n\nThe $40.00 has a section number, and the adopted ordinance is where it is legible. Proposal No. 239, 2025 amends \"536-619 Additional service fee for applying for all demolition, master, sign, structural, and infrastructure related permits\" from $32.00 to $40.00 — which is why the improvement location and floodplain rows on the same sheet still carry $32.00, and why this schedule cannot be read as a single rate card. The same ordinance places the plan review (\"536-620 Plan review of a new primary or accessory Class 2 structure ... one hundred and seventy-five dollars ($175.00) for structures less than 2,000 square feet\") and the $250.00 administrative fee (\"536-609 Administrative fee $215.00 $250.00\").\n\nWhat the ordinance does not mention is the interesting part: the plumbing, electrical and heating/cooling rows appear in no amendment, which is the fee page\'s \"Craft permits, such as electrical, HVAC, and plumbing, did not change\" in documentary form. Those three trades were priced when they were priced and left alone through a cost-of-service review that raised almost everything else — including penalties set in 1988. Their rows still read as the older generation of the schedule does: one flat figure per subtype, or a figure plus a block, with no components to decompose.\n\nTwo readings are worth naming because they look like errors and are not. The residential new-structure Issuance Fee cell reads \"$750 (≤2,000 sqft) 2,000 sqft; $100 per additional 500 sqft\" — the stray \"2,000 sqft\" is a typo in the workbook, and the figure is the one the sentence beside it states. And the last row of the electrical section prints \"Self-Certification Tags ... 22\" with no unit: no \"each\", no \"/tag\". It is charged once under its own subtype, and the page says so rather than multiplying a count the schedule never names.",
  valuationBasis:
    "**None of the three pages reads a valuation.** That is the single most distinctive thing about Indianapolis in this dataset: Minneapolis, Saint Paul, South Bend and Nashville all price at least one component against a job value, and this schedule prices none. A structural permit reads a **subtype and a square footage**; the nine subtypes fix the arithmetic and the square footage prices it. Electrical and plumbing read a subtype, and the plumbing commercial row reads a **fixture count** — the only count in either trade.\n\nThe square footage is defined by the sheet rather than by the applicant, at least on the one row where it matters most: \"Sqft calculations include the area of an attached garage or carport, and the area of a finished basement or attic, but excludes the area of an unfinished basement or attic.\" A building\'s paperwork footprint is therefore not what is charged; the row says which area counts.\n\nTwo block sizes are used behind the same $23.00 rate, which is easy to miss: the electrical new-structure and plumbing new-residential rows step per 1,000 square feet and the repair rows per 500, so a repair steps at $46.00 per 1,000 where a new installation steps at $23.00. And the allowances differ too — 2,500 square feet inside the base on the new rows, 1,000 on the repair rows, 10,000 on the heating and cooling rows, 2,500 on the commercial new-structure row.",
  notIncluded:
    "These figures are Indianapolis's building, electrical and plumbing permit fees under the schedule effective January 5, 2026. They are not a project cost, and they exclude:\n\n- **The improvement location permit (ILP)** — the zoning-side permit that precedes the structural one, with a $32.00 application fee of its own and a table of its own (residential new single-family construction at $199.00 metes-and-bounds or $156.00 platted; multi-family at $682.00 plus $29.00 a unit; commercial new construction at $380.00 up to 1,000 square feet plus $122.00 per additional 1,000).\n- **The sign, encroachment, right-of-way, street, driveway, wrecking, floodplain, drainage and private-provider rows** — separate permits with their own bases (a sign from $142.00 to $838.00, right-of-way closures per day, wrecking by ground-floor area, a drainage permit at $650.00 for the first three hours and $200.00 an hour after).\n- **The inspection table** — the sheet's own note is \"Unless otherwise noted below, inspection fees are included in the issuance fee\", and the rows that are noted are the extras: a reinspection at $175.00, a general construction inspection at $154.00, and the accelerated-inspection options from $187.00 to $750.00.\n- **The $250.00 administrative fee** — 536-609, assessed on a permit for which a Certificate of Completion and Compliance has not been filed, and appealable under the form the fee page links. Stated as a requirement rather than charged on every permit.\n- **The heating, ventilating and air-conditioning permit (HTG)** — a fourth trade on the same schedule with the same one-figure-per-subtype shape ($153.00 for heating or cooling systems to 2,500 square feet plus $23.00 per additional 1,000, $185.00 combined, $156.00 for refrigeration equipment).\n- **The code-enforcement penalties** — the Code Enforcement sheet\'s violations and administrative fees, which are penalties rather than permit fees.\n- **The contractor licensing and business licensing tables** — general, electrical, HVAC, plumbing and wrecking licences at $247.00 or $142.00 a year, and the business licences beside them.\n- **The plan-review rows as separate instruments** — a Class 1 plan review is $200.00 flat and a Class 2 one is priced by area, and both are components of the permit rather than separate filings.",
  seoTitle: "Indianapolis construction permit fees",
  seoDescription:
    "How Indianapolis prices construction permits — a structural permit as application, plan review and issuance by subtype, and one figure per subtype for electrical and plumbing under the 1/5/2026 schedule.",
  publishStatus: "published",
  noindex: false,
  lastReviewedAt: INDIANAPOLIS_LAST_VERIFIED,
};

const permitPages: SeedPermitPage[] = [
  {
    jurisdictionKey: INDIANAPOLIS_KEYS.jurisdiction,
    permitTypeKey: "building",
    slug: "building-permit-cost",
    title: "Indianapolis building permit cost",
    intro:
      "An Indianapolis structural permit is **three separately stated components**: a **$40.00** additional service fee for applying under 536-619, a **plan review**, and the **permit fee** itself. One of nine subtypes selects the arithmetic and the square footage prices it — never a valuation. A **new Class 2 primary structure** is $40.00 + $175.00 + $750.00 up to 2,000 square feet, then $25.00 and $100.00 per additional 500; a **new Class 1 structure** is $40.00 + $200.00 + $1,000.00 up to 2,500 square feet, then $150.00 per additional 1,000. A residential remodel is $40.00 + $150.00 + $200.00 to 1,000 square feet.",
    localSummary:
      "The subtype is what makes the same square footage cost different amounts. Three thousand square feet of new Class 2 house is $40.00 + $225.00 of plan review + $950.00 of permit fee, $1,215.00; three thousand square feet of accessory structure is $40.00 + $175.00 + $350.00, $565.00. A residential remodel is $200.00 of issuance up to 1,000 square feet and $50.00 per additional 500 above it — twice the new-structure row's $100.00 per 1,000 — while a residential addition is $400.00 plus $50.00 per additional 500, the most expensive per-square-foot row in the section.\n\nThe commercial side is flatter by design. All three Class 1 subtypes carry the same $200.00 plan review, and the ordinance says why: \"Plan review of Class 1 structures. Review includes appropriate structural and mechanical plan review ... Included in fees for Sections 536-602 and 536-603 $200.00.\" Issuance is where they differ: a new Class 1 structure is $1,000.00 up to 2,500 square feet plus $150.00 per additional 1,000; a remodel is the section's only bracketed fee, $350.00 for 1 to 999 square feet or $750.00 for 1,000 to 2,500, then $150.00 per additional 1,000; and a miscellaneous commercial permit is $175.00 flat.\n\nOne cell on the sheet is worth reading carefully because it looks broken and is not: the new Class 2 structure's issuance fee reads \"$750 (≤2,000 sqft) 2,000 sqft; $100 per additional 500 sqft\". The stray \"2,000 sqft\" is a typo; the figure is $750.00 to 2,000 square feet and $100.00 per additional 500, and the sentence after it defines the area the row reads — \"Sqft calculations include the area of an attached garage or carport, and the area of a finished basement or attic, but excludes the area of an unfinished basement or attic.\"",
    notIncluded:
      "This is the structural permit's three components. It excludes:\n\n- **The improvement location permit** — the zoning-side permit that precedes the structural one, with its own $32.00 application fee (not $40.00, because 536-619's raise applies to \"demolition, master, sign, structural, and infrastructure related permits\") and its own table.\n- **The permits before it in the sequence** — infrastructure review and a drainage permit, and any sewer connection, flood or wrecking permit the building official requires before the structural permit is released. The residential page states the sequence and says the structural permit is third in it.\n- **The heating, ventilating and air-conditioning permit** — a separate trade on the same schedule, and a separate trade permit on a real job.\n- **The accelerated-inspection and reinspection options** — the inspection table's own note is that inspections are included in the issuance fee \"unless otherwise noted\", and the noted rows are extras: $175.00 for a reinspection and $187.00 to $750.00 to accelerate one.\n- **The $250.00 administrative fee** — 536-609, assessed on a permit that has not been closed, and stated here rather than charged on every permit.\n- **The plan review as a separate filing** — it is a column of the permit, not a document a reader files twice.",
    workedExample: {
      scenario:
        "A 3,000-square-foot new single-family house — a Class 2 primary structure, the ordinary residential job the first subtype prices.",
      inputs: { squareFootage: 3_000, custom: { structural_scope: "residential_primary_new" } },
      notes:
        "The row's three components, in the order the sheet prints its columns. The application fee is $40.00 — 536-619's additional service fee, which Proposal 239 shows rising from $32.00. The plan review is \"$175 (≤2,000 sqft) $25 per additional 500 sqft\": 1,000 square feet above the allowance is two 500-square-foot blocks, so $175.00 + $50.00 = $225.00. The permit fee is \"$750 (≤2,000 sqft) $100 per additional 500 sqft\": the same two blocks at $100.00 each, $950.00. Total: $1,215.00.\n\nThe same 3,000 square feet as an accessory structure is $40.00 + $175.00 + $350.00 = $565.00, because the accessory rows price their issuance at $25.00 per block rather than $100.00 — a difference of $700.00 from one subtype choice.\n\nAnd the area itself is the sheet's, not the drawing's: the issuance row says the count \"include[s] the area of an attached garage or carport, and the area of a finished basement or attic, but excludes the area of an unfinished basement or attic\". Two identical houses, one with a finished basement and one without, are different permits here.",
    },
    faqs: [
      {
        question: "How much is a building permit in Indianapolis?",
        answer:
          "It is three components and they depend on the subtype. A new single-family house (Class 2 primary structure) is a $40.00 application fee plus $175.00 of plan review plus $750.00 of permit fee up to 2,000 square feet, then $25.00 and $100.00 per additional 500 — $1,215.00 at 3,000 square feet. A new commercial building (Class 1) is $40.00 plus $200.00 plus $1,000.00 up to 2,500 square feet, then $150.00 per additional 1,000. A miscellaneous commercial permit is $40.00 + $200.00 + $175.00.",
        sourceId: INDIANAPOLIS_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "What is the $40 application fee and why is it not $32?",
        answer:
          "It is 536-619, the \"Additional service fee for applying for all demolition, master, sign, structural, and infrastructure related permits\", which Proposal No. 239, 2025 raised from $32.00 to $40.00 effective January 5, 2026. The improvement location and floodplain rows on the same sheet still carry $32.00 because the section's raise does not reach them, and that difference is why the schedule cannot be read as one rate card.",
        sourceId: INDIANAPOLIS_PROPOSAL_239_SOURCE_KEY,
      },
      {
        question: "Is there a plan review fee on top of the permit?",
        answer:
          "It is a component of the permit rather than a separate filing, and it is stated in its own column of the schedule. Class 2 subtypes are priced by area — $175.00 up to 2,000 square feet and $25.00 per additional 500 for a new primary structure, $150.00 up to 1,000 and $25.00 per additional 500 for additions and remodels, $100.00 up to 1,000 for an accessory addition. All three Class 1 subtypes carry a flat $200.00, which the ordinance describes as \"Plan review of Class 1 structures. Review includes appropriate structural and mechanical plan review ... Included in fees for Sections 536-602 and 536-603\".",
        sourceId: INDIANAPOLIS_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "What counts as the square footage?",
        answer:
          "The schedule defines it on the new-structure issuance row: \"Sqft calculations include the area of an attached garage or carport, and the area of a finished basement or attic, but excludes the area of an unfinished basement or attic.\" The calculator reads the number the sheet would read; it does not convert a building's footprint, and it does not read a valuation, because no structural row does.",
        sourceId: INDIANAPOLIS_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "What is the $250 administrative fee on the schedule?",
        answer:
          "It is 536-609 and it is not a per-permit charge. Proposal No. 239 shows it rising from $215.00 to $250.00, and the department's Administrative Fee Appeal Form states when it attaches: a permit for which a Certificate of Completion and Compliance has not been filed, with the applicant either closing the permit or renewing it before appealing. Charging it to every applicant would charge the ones who close their permits on time, so it is stated as a requirement rather than added to the arithmetic.",
        sourceId: INDIANAPOLIS_ADMIN_FEE_FORM_SOURCE_KEY,
      },
      {
        question: "Do I need an improvement location permit as well?",
        answer:
          "Usually, and it is a separate permit with its own fee. The department's residential page sets the sequence: infrastructure review and a drainage permit first, then the improvement location permit, and only then the structural permit — \"Once the improvement location permit has been approved and issued, the structural permit can be obtained.\" A residential new single-family improvement location permit is $32.00 for applying plus $199.00 or $156.00 depending on whether the lot is platted, and it is not part of this page's arithmetic.",
        sourceId: INDIANAPOLIS_RESIDENTIAL_PAGE_SOURCE_KEY,
      },
    ],
    seoTitle: "Indianapolis building permit cost: application, review and issuance",
    seoDescription:
      "Indianapolis structural permit fees — a $40 application fee, a plan review and the permit fee, selected by subtype and priced by square footage, with Class 1 and Class 2 tables.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: INDIANAPOLIS_LAST_VERIFIED,
  },
  {
    jurisdictionKey: INDIANAPOLIS_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    slug: "electrical-permit-cost",
    title: "Indianapolis electrical permit cost",
    intro:
      "An Indianapolis electrical permit is **one figure per subtype**, with nothing beside it in the schedule's review or issuance columns. A new structure or commercial addition is **$202.00** up to 2,500 square feet plus **$23.00 per additional 1,000**; a repair to an existing structure or a residential addition is **$169.00** up to 1,000 square feet plus **$23.00 per additional 500**; an appliance change is **$146.00** for heating, $146.00 for cooling or **$178.00** for both, up to 10,000 square feet plus **$23.00 per additional 2,500**; a reconnection is **$89.00**, and manufactured-home work is **$498.00**.",
    localSummary:
      "The two block rates are the trap in this table. The new-structure row allows 2,500 square feet and then steps $23.00 per additional 1,000; the repair row allows 1,000 square feet and steps $23.00 per additional 500. The same $23.00 is therefore $23.00 per 1,000 on one row and $46.00 per 1,000 on the next, and a reader comparing the two cells has to notice the different block sizes rather than the identical rate.\n\nThe appliance row is three figures in one cell: \"Space Heating--$146 (≤ 10,000 sf) Space Cooling--$146 (≤ 10,000 sf) Combined Htg/Clg--$178 (≤ 10,000 sf) $23 (per additional 2,500 sf over 10,000 sf)\". Heating and cooling are priced the same and counted apart, and the pair installed together is $32.00 more than either alone — not twice $146.00 — which is the sheet pricing one piece of equipment that does both. The allowance is the widest in the section (10,000 square feet) and the block the largest (2,500), which together make it $9.20 per 1,000 above the allowance, a fifth of the new-structure row's rate.\n\nAnd the schedule says the trade has not moved: the department's fee page states that \"Craft permits, such as electrical, HVAC, and plumbing, did not change\" in the January 2026 update, and the ordinance behind that update amends no electrical section at all. This page is the older generation of the schedule — one figure per subtype, no components to decompose.",
    notIncluded:
      "This is the electrical permit fee the schedule charges. It excludes:\n\n- **The heating, ventilating and air-conditioning permit (HTG)** — a separate trade on the same schedule and a separate permit on a real job. Its rows are the appliance row's cousins at the whole-building scale: $153.00 for a heating or cooling system up to 2,500 square feet plus $23.00 per additional 1,000, $185.00 for a combined system, $156.00 for refrigeration equipment.\n- **The four kinds of electrical work that need no permit** — an attic, bathroom, range-hood or whole-house fan replacement; a single-phase circuit not exceeding 60 amperes serving specified equipment for which a building permit has already been issued; household appliances installed without a new circuit; and temporary power for on-site construction. The department's residential page lists all four.\n- **The accelerated-inspection and reinspection options** — inspections are included in the permit's own figure unless the table notes otherwise, and the noted extras run from $175.00 for a reinspection to $750.00 to accelerate one.\n- **The contractor licence** — an electrical contractor's new business licence is $247.00 and an individual's new licence $377.00, renewed annually, with $63.00 per eligible employee beyond five. A licence is not a permit.\n- **The temporary power requirements** — the schedule prices an electrical permit and has no temporary-service row; temporary power for construction is exempt from permitting altogether under the same list.\n- **The self-certification tags' unit** — the row prints \"$22\" with no unit beside it, so the calculator charges it once under its own subtype rather than inventing a count.",
    workedExample: {
      scenario:
        "A 3,500-square-foot new commercial addition — the ordinary row the electrical section prices, one block above its allowance.",
      inputs: { squareFootage: 3_500, custom: { electrical_scope: "installation_new" } },
      notes:
        "The row is \"$202 (≤ 2,500 sf) $23 (per additional 1,000 sf over 2,500 sf)\". The allowance is 2,500 square feet and the chargeable excess is 1,000, which is exactly one block at $23.00, so the permit is $202.00 + $23.00 = $225.00.\n\nA repair in the same building is a different row: \"$169 (≤ 1,000 sf) $23 (per additional 500 sf over 1,000 sf)\". The allowance is smaller and the block is half the size, so 2,000 square feet of repair is 1,000 square feet over the allowance — two 500-square-foot blocks — and $169.00 + $46.00 = $215.00. At 3,500 square feet the repair row would be 2,500 over, five blocks, $284.00, while the new-installation row is still $225.00.\n\nThe appliance row is the cheapest way into the section: replacing a furnace in a 10,000-square-foot building is $146.00 flat, because the whole 10,000 square feet is inside the allowance. Replacing both the furnace and the air conditioner is $178.00, not $292.00.",
    },
    faqs: [
      {
        question: "How much is an electrical permit in Indianapolis?",
        answer:
          "One figure per subtype: $202.00 up to 2,500 square feet plus $23.00 per additional 1,000 for a new structure or commercial addition; $169.00 up to 1,000 square feet plus $23.00 per additional 500 for a repair or residential addition; $146.00 for space heating, $146.00 for space cooling or $178.00 for both, up to 10,000 square feet plus $23.00 per additional 2,500; $89.00 for a reconnection; $498.00 for manufactured-home work; $89.00 for general service activity; and $22.00 for self-certification tags.",
        sourceId: INDIANAPOLIS_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "Why does the same $23 rate cost more on the repair row?",
        answer:
          "Because the block is half the size. The new-structure row charges \"$23 (per additional 1,000 sf over 2,500 sf)\" and the repair row \"$23 (per additional 500 sf over 1,000 sf)\", so a repair steps at $46.00 per 1,000 square feet where a new installation steps at $23.00 — and the repair row's allowance is 1,000 square feet against the new-structure row's 2,500. Reading the rates without the blocks makes the two rows look identical.",
        sourceId: INDIANAPOLIS_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "Is heating and cooling one permit or two?",
        answer:
          "The electrical schedule prices the equipment as one row with three figures — space heating at $146.00, space cooling at $146.00, and \"Combined Htg/Clg\" at $178.00, all up to 10,000 square feet with $23.00 per additional 2,500. Installing one piece of equipment that both heats and cools is $178.00, not two permits at $292.00. A heating, ventilating and air-conditioning permit (HTG) is a separate trade permit on the same schedule if the work is the ductwork or the mechanical system rather than its circuit.",
        sourceId: INDIANAPOLIS_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "Does electrical work on a new house need its own permit?",
        answer:
          "Yes. Electrical, plumbing and heating/cooling are craft permits with one figure each, separate from the structural permit that prices the building. The department's residential page lists the four things that need no electrical permit — fan replacements, a single-phase circuit not exceeding 60 amperes serving specified equipment for which a building permit has been issued, household appliances installed without a new circuit, and temporary construction power.",
        sourceId: INDIANAPOLIS_RESIDENTIAL_PAGE_SOURCE_KEY,
      },
      {
        question: "Why is the electrical section not in the 2026 ordinance?",
        answer:
          "Because it did not change. The department's own fee page says so in words — \"Craft permits, such as electrical, HVAC, and plumbing, did not change\" — and Proposal No. 239, 2025, which amends the building sections, contains no electrical section at all. The department ran a cost-of-service review in 2024 and raised many fees for the first time since 1988 or 2011; the craft permits were left where they were.",
        sourceId: INDIANAPOLIS_FEE_PAGE_SOURCE_KEY,
      },
    ],
    seoTitle: "Indianapolis electrical permit cost: one figure per subtype",
    seoDescription:
      "Indianapolis electrical permit fees — $202 for a new installation, $169 for a repair, $146/$146/$178 for appliances, $89 reconnections and $498 manufactured homes, with the two block sizes explained.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: INDIANAPOLIS_LAST_VERIFIED,
  },
  {
    jurisdictionKey: INDIANAPOLIS_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    slug: "plumbing-permit-cost",
    title: "Indianapolis plumbing permit cost",
    intro:
      "An Indianapolis plumbing permit is **five subtypes, one figure each.** A new residential structure is **$185.00** up to 2,500 square feet plus **$23.00 per additional 500**; a residential repair, alteration or remodel is **$153.00** up to 1,000 square feet plus **$23.00 per additional 500**; commercial work is **$182.00 for up to 10 fixtures plus $23.00 per additional 5**; a reconnection to a relocated structure is **$134.00**; and general service activity is **$89.00**. The commercial row is the only one priced by a count rather than by a building.",
    localSummary:
      "The commercial row is where this schedule stops resembling its neighbours. Every other plumbing row in this dataset prices a fixture — Denver per fixture, Saint Paul per unit, South Bend at $6.00 each — and this one prices the first ten fixtures as a group: \"$182 (0-10 fixtures) $23 (per additional 5 fixtures)\". Ten fixtures is $182.00, eleven is $205.00, sixteen is $228.00, and a hundred and six would be $642.00. The block is five, so the fee moves in $23.00 steps and a job with one fixture over a block boundary pays for the whole block.\n\nResidential work is priced by the building instead, and by two different buildings. A new house is $185.00 up to 2,500 square feet plus $23.00 per additional 500; a repair, alteration or remodel is $153.00 up to 1,000 square feet plus $23.00 per additional 500. The rate is the same and the allowances are not: the repair row allows less than half the area and starts $32.00 lower, so a 3,000-square-foot new house is $185.00 + one block, $208.00, while a 3,000-square-foot remodel is $153.00 plus four blocks, $245.00. A remodel can cost more than a new installation of the same size, and both numbers are on the sheet.\n\nTwo figures are shared with the electrical page, which is worth knowing because a moved house needs both permits: the reconnection row is $134.00 here against the electrical sheet's $89.00 — the $45.00 difference is what the sewer and water connection costs over the service reconnect — and general service activity is $89.00 on both.",
    notIncluded:
      "This is the plumbing permit fee the schedule charges. It excludes:\n\n- **The four kinds of plumbing work that need no permit** — replacement in kind of up to 20 per cent of the piping in a structure, the connection of plumbing to a mobile home not on a permanent foundation in a state-licensed park, replacement of appliances, fixtures, traps or valves, and a like-for-like water heater replacement.\n- **The structural and electrical permits on the same job** — each is a separate trade permit on the same schedule, and the electrical sheet prices the same moved-house reconnect at $89.00.\n- **The sewer connection and its charges** — the department's residential page says a sewer connection permit may be required before the structural permit is released, and it has its own rows on the same schedule rather than being part of the plumbing permit.\n- **The heating, ventilating and air-conditioning permit (HTG)** — a separate trade at $153.00 for a heating or cooling system up to 2,500 square feet plus $23.00 per additional 1,000, and $185.00 for a combined system.\n- **The reinspection and accelerated-inspection options** — inspections are included in the permit unless the table notes otherwise, and the noted extras run from $175.00 to $750.00.\n- **The plumbing contractor licence** — $142.00 a year for a business entity or an individual, with $63.00 per eligible employee beyond five. A licence is not a permit.",
    workedExample: {
      scenario:
        "A commercial fit-out with sixteen fixtures — one block over a block boundary, the ordinary way the commercial row is read.",
      inputs: { fixtures: 16, custom: { plumbing_scope: "commercial" } },
      notes:
        "The row is \"$182 (0-10 fixtures) $23 (per additional 5 fixtures)\". Ten fixtures are inside the base, so the chargeable count is six, which buys two whole five-fixture blocks: $23.00 × 2 = $46.00. Total $228.00.\n\nFifteen fixtures would be one block, $205.00, and sixteen fixtures is two, $228.00 — one fixture over the boundary costs $23.00, which is what a five-fixture block means. A ten-fixture job is exactly $182.00 and pays no blocks at all.\n\nResidential work is priced by the building instead. A new 3,000-square-foot house is $185.00 plus one 500-square-foot block above the 2,500 allowance, $208.00. A 3,000-square-foot remodel is $153.00 plus four blocks above the 1,000 allowance, $245.00 — $37.00 more than the new house of the same size, because the remodel's allowance is smaller and both rows use the same block. And moving a house needs two permits rather than one: the plumbing reconnection is $134.00 and the electrical one $89.00.",
    },
    faqs: [
      {
        question: "How much is a plumbing permit in Indianapolis?",
        answer:
          "Five subtypes: $185.00 up to 2,500 square feet plus $23.00 per additional 500 for a new residential structure; $153.00 up to 1,000 square feet plus $23.00 per additional 500 for a residential repair, alteration or remodel; $182.00 for up to 10 commercial fixtures plus $23.00 per additional 5; $134.00 for a reconnection to a relocated structure; and $89.00 for general service activity.",
        sourceId: INDIANAPOLIS_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "How is commercial plumbing priced?",
        answer:
          "By the fixture count rather than by the building: \"$182 (0-10 fixtures) $23 (per additional 5 fixtures)\". Ten fixtures is $182.00, eleven is $205.00 and sixteen is $228.00 — the block is five, so the fee moves in $23.00 steps and one fixture over a boundary buys the whole block. It is the only row in Indianapolis's plumbing section priced by a count.",
        sourceId: INDIANAPOLIS_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "Which plumbing work needs no permit?",
        answer:
          "The department's residential page lists four: replacement in kind of piping that meets the same performance specifications and capacity, \"must not be more than 20 percent of all piping in the structure being replaced\"; the initial connection of plumbing to a mobile home not on a permanent foundation in a state-licensed park; replacement of appliances, fixtures, traps and valves; and a water heater replaced with one identical as to venting arrangement and fuel type.",
        sourceId: INDIANAPOLIS_RESIDENTIAL_PAGE_SOURCE_KEY,
      },
      {
        question: "Why does a remodel sometimes cost more than a new installation?",
        answer:
          "Because the two rows have different allowances on the same rate. A new residential structure allows 2,500 square feet inside its $185.00 base and a remodel allows 1,000 inside its $153.00 base, and both then charge $23.00 per additional 500 square feet. A 3,000-square-foot new house is $208.00 and a 3,000-square-foot remodel is $245.00: $37.00 more for the same area, because four of the remodel's blocks are chargeable against one of the new house's.",
        sourceId: INDIANAPOLIS_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "Does moving a house need two plumbing permits?",
        answer:
          "No, but it needs two permits. The plumbing schedule prices an \"Initial Connection or Reconnection to Relocated Structure\" at $134.00 and the electrical schedule prices the same act at $89.00. They are separate permits on the same workbook, and the $45.00 difference is what a sewer and water connection costs over a service reconnect in this schedule.",
        sourceId: INDIANAPOLIS_SCHEDULE_SOURCE_KEY,
      },
    ],
    seoTitle: "Indianapolis plumbing permit cost: five subtypes and one fixture row",
    seoDescription:
      "Indianapolis plumbing permit fees — $185 for a new residential structure, $153 for a repair, $182 plus $23 per 5 fixtures commercial, $134 reconnections and $89 general service.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: INDIANAPOLIS_LAST_VERIFIED,
  },
];

const verifications: SeedVerification[] = [
  ...sources.map(
    (source): SeedVerification => ({
      entityType: "source",
      entityKey: source.key,
      status: "verified",
      method: "official_portal_check",
      verifiedAt: INDIANAPOLIS_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: source.key,
      notes:
        "Read 2026-09-26: the workbook cell by cell, the ordinance and the appeal form as PDFs, and the two indy.gov pages from the rendered browser because the site serves a scripted request an empty application shell.",
    }),
  ),
  {
    entityType: "fee_schedule",
    entityKey: INDIANAPOLIS_KEYS.feeSchedule,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: INDIANAPOLIS_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: INDIANAPOLIS_SCHEDULE_SOURCE_KEY,
    notes:
      "The workbook stamped \"As of 1.5.2026\", its three-column structure confirmed from the cell references, and its building rows cross-checked against Proposal No. 239's old-and-new figures for 536-603, 536-612, 536-619 and 536-620.",
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-ISSUE-NEW-PRIMARY",
    permitTypeKey: "building",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: INDIANAPOLIS_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: INDIANAPOLIS_SCHEDULE_SOURCE_KEY,
    notes:
      "\"$750 (≤2,000 sqft) 2,000 sqft; $100 per additional 500 sqft\" — the stray \"2,000 sqft\" named as a workbook typo on the page; the arithmetic asserted at 2,000 and 3,000 square feet in the content test.",
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-ISSUE-COMM-REMODEL-CLOSED",
    permitTypeKey: "building",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: INDIANAPOLIS_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: INDIANAPOLIS_SCHEDULE_SOURCE_KEY,
    notes:
      "\"$350 (1 - 999 sqft); $750 (1,000 - 2,500 sqft)\" as the sheet's only bracketed issuance fee, with the open rate above it a separate rule; both asserted at their seams in the content test.",
  },
  {
    entityType: "fee_rule",
    entityKey: "PLUMB-COMMERCIAL",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: INDIANAPOLIS_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: INDIANAPOLIS_SCHEDULE_SOURCE_KEY,
    notes:
      "\"$182 (0-10 fixtures) $23 (per additional 5 fixtures)\" — the allowance and the five-fixture block asserted at 10, 11, 15 and 16 fixtures in the content test.",
  },
  {
    entityType: "permit_page",
    entityKey: "building-permit-cost",
    permitTypeKey: "building",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: INDIANAPOLIS_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: INDIANAPOLIS_SCHEDULE_SOURCE_KEY,
    notes:
      "All nine subtypes' three components priced in prose, the $40.00 traced to 536-619 in the ordinance, the square-footage definition quoted, and the $250.00 administrative fee named as a requirement rather than charged.",
  },
  {
    entityType: "permit_page",
    entityKey: "electrical-permit-cost",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: INDIANAPOLIS_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: INDIANAPOLIS_SCHEDULE_SOURCE_KEY,
    notes:
      "The two block sizes distinguished (1,000 against 500 behind the same $23.00), the three-figure appliance cell priced, and the self-certification row's absent unit named rather than invented.",
  },
  {
    entityType: "permit_page",
    entityKey: "plumbing-permit-cost",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: INDIANAPOLIS_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: INDIANAPOLIS_SCHEDULE_SOURCE_KEY,
    notes:
      "The commercial fixture row's allowance and block explained against every other per-fixture row in the dataset, the two residential allowances compared, and the reconnection's $45.00 difference from the electrical sheet stated.",
  },
  {
    entityType: "jurisdiction_profile",
    entityKey: INDIANAPOLIS_KEYS.jurisdiction,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: INDIANAPOLIS_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: INDIANAPOLIS_SCHEDULE_SOURCE_KEY,
    notes:
      "Profile built from the workbook, the fee page, Proposal No. 239, the residential permit page and the administrative fee appeal form. States the readings the model depends on — the three columns, the $40.00's section, the craft permits' unchanged status, the $250.00's trigger — and names every row it does not charge.",
  },
];

export const indianapolisSeed: JurisdictionSeed = {
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
export const INDIANAPOLIS_PUBLISHED_PERMIT_PAGES = indianapolisSeed.permitPages.filter(
  (page) => page.publishStatus === "published" && !page.noindex,
);
