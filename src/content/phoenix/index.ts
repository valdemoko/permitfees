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
  PHOENIX_BUILDING_RULES,
  PHOENIX_ELECTRICAL_RULES,
  PHOENIX_FEE_EFFECTIVE_FROM,
  PHOENIX_FEE_SCHEDULE_SOURCE_KEY,
  PHOENIX_FEES_PAGE_SOURCE_KEY,
  PHOENIX_PLUMBING_RULES,
  PHOENIX_VALUATION_TABLE_SOURCE_KEY,
} from "./fee-rules";

export * from "./fee-rules";

/**
 * The complete Phoenix seed payload.
 *
 * Every field traces to `research/arizona/phoenix.md`, which traces to documents
 * published by the City of Phoenix. Nothing here is estimated.
 *
 * Phoenix is the first jurisdiction outside Texas and the first whose *plan review*
 * is a function of its own permit fee. It is also the first city in this project
 * whose fee schedule was reachable live: every document below was fetched from
 * phoenix.gov directly, on the date recorded, and hashed.
 *
 * Arizona and Maricopa County are new rows here, so this payload defines them. The
 * permit types are NOT redefined — "the building permit" is one concept across
 * every city, so Phoenix links to the rows Houston defines rather than creating a
 * second set.
 */

/** The date a human last read the City's own published schedule. */
export const PHOENIX_LAST_VERIFIED = "2026-09-24";

export const PHOENIX_KEYS = {
  state: "az",
  county: "maricopa-county",
  jurisdiction: "phoenix",
  feeSchedule: PHOENIX_FEE_SCHEDULE_SOURCE_KEY,
} as const;

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
  key: PHOENIX_KEYS.county,
  slug: "maricopa-county",
  name: "Maricopa County",
  // Maricopa County, Arizona. Recorded so a later city in the county (Mesa,
  // Chandler, Glendale) links to this row rather than creating a second one.
  fipsCode: "04013",
};

const jurisdiction = {
  key: PHOENIX_KEYS.jurisdiction,
  stateKey: PHOENIX_KEYS.state,
  countyKey: PHOENIX_KEYS.county,
  type: "city" as const,
  slug: "phoenix",
  name: "Phoenix",
  officialName: "City of Phoenix",
  websiteUrl: "https://www.phoenix.gov/",
  /**
   * The PDD Online permit portal, verified by request on 2026-09-24: it answers on
   * the city's own host and redirects an unauthenticated visit to its logon page,
   * which is what a portal does. SHAPE PHX, named on the department's fees page, is
   * the newer front end for the same department and is not recorded separately
   * because no stable public URL for it was confirmed.
   */
  permitPortalUrl: "https://apps-secure.phoenix.gov/PDD/Permits/",
  // Arizona does not observe daylight saving time, so the zone is fixed.
  timezone: "America/Phoenix",
  isActive: true,
};

/* -------------------------------------------------------------------------- */
/* Department                                                                 */
/* -------------------------------------------------------------------------- */

const departments: SeedDepartment[] = [
  {
    key: "phoenix-pdd",
    jurisdictionKey: PHOENIX_KEYS.jurisdiction,
    kind: "building",
    name: "Planning & Development Department (PDD), City of Phoenix",
    // Both numbers come from the City: the schedule's own cover page prints
    // (602) 262-7811, and the department's fees page lists (602) 495-0243 for fee
    // questions. Neither is taken from a third party.
    phone: "602-262-7811",
    email: null,
    url: "https://www.phoenix.gov/administration/departments/pdd.html",
    addressLine: "200 W Washington St., 3rd Floor, Phoenix, AZ 85003",
    hours: null,
    notes:
      "Issues and inspects construction, electrical, plumbing and mechanical permits for property inside the Phoenix city limits. The street address and the 602-262-7811 number are printed on the cover of the City's own fee schedule; the department's fees page adds (602) 495-0243 for questions about the proposed fee increase.",
  },
];

/* -------------------------------------------------------------------------- */
/* Sources                                                                    */
/* -------------------------------------------------------------------------- */

const sources: SeedSource[] = [
  {
    key: PHOENIX_FEE_SCHEDULE_SOURCE_KEY,
    jurisdictionKey: PHOENIX_KEYS.jurisdiction,
    title: "PDD Fee Schedule (Chapter 9, Appendix A.2)",
    url: "https://www.phoenix.gov/content/dam/phoenix/pddsite/documents/impact-fees/fee-schedule.pdf",
    sourceType: "fee_schedule_pdf",
    issuingAuthority: "City of Phoenix Planning & Development Department",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2025-12-17",
    effectiveFrom: PHOENIX_FEE_EFFECTIVE_FROM,
    retrievedAt: PHOENIX_LAST_VERIFIED,
    lastVerifiedAt: PHOENIX_LAST_VERIFIED,
    notes:
      "Approved 17 December 2025, effective 20 January 2026, adopted by Ordinance G-7465. Fifty pages, fetched live from phoenix.gov on 2026-09-24 (sha256 4193e742000369ae3b6814e56c7eb2563cf18075240aeb894f335d684ff9436d, 616,766 bytes) and read locally with pdftotext -layout and -raw. A later capture can be compared against that hash. Unlike Dallas, no archive copy was needed: the City's host answered from this environment.",
  },
  {
    key: PHOENIX_FEES_PAGE_SOURCE_KEY,
    jurisdictionKey: PHOENIX_KEYS.jurisdiction,
    title: "Fees, Valuations and Assurances",
    url: "https://www.phoenix.gov/administration/departments/pdd/tools-resources/fees.html",
    sourceType: "municipal_website",
    issuingAuthority: "City of Phoenix Planning & Development Department",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: PHOENIX_LAST_VERIFIED,
    lastVerifiedAt: PHOENIX_LAST_VERIFIED,
    notes:
      "The department's own fee landing page. Used for four things: it publishes the fee schedule as the current one and dates it 20 January 2026; it names the other fee schedules that are NOT part of it (Zoning; Impact Fees; Fire Permit and Plan Review Fees; Water and Sewer Fees); it lists the counters that collect fees and their contact addresses; and it is the source for the Building Valuation Table being revised on the same date as the schedule.",
  },
  {
    key: PHOENIX_VALUATION_TABLE_SOURCE_KEY,
    jurisdictionKey: PHOENIX_KEYS.jurisdiction,
    title: "Building Valuation Table",
    url: "https://www.phoenix.gov/content/dam/phoenix/pddsite/documents/impact-fees/building-valuation-table.pdf",
    sourceType: "fee_schedule_pdf",
    issuingAuthority: "City of Phoenix Planning & Development Department",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2026-01-20",
    effectiveFrom: PHOENIX_FEE_EFFECTIVE_FROM,
    retrievedAt: PHOENIX_LAST_VERIFIED,
    // NOT READ. The file downloaded (sha256 2949f758e5d318c758388a23d63f88a8d46c0641c5ed75d4afe4afbdac3519fe)
    // but has no text layer at all, and this environment has no OCR. Recorded so
    // the gap is visible rather than papered over. lastVerifiedAt carries the date
    // the document's existence, URL and hash were confirmed — no rate was read from it.
    lastVerifiedAt: PHOENIX_LAST_VERIFIED,
    notes:
      "Published, downloaded and hashed on 2026-09-24 (sha256 2949f758e5d318c758388a23d63f88a8d46c0641c5ed75d4afe4afbdac3519fe) but NOT read: it has no text layer — pdftotext returns nothing — and this environment has no OCR. It is the table behind the schedule's statement that valuation is 'building square footage times standard rate for occupancy', so the valuation basis is described on the pages without transcribing a rate from it.",
  },
];

/* -------------------------------------------------------------------------- */
/* Which permits Phoenix issues                                                */
/* -------------------------------------------------------------------------- */

/**
 * Phoenix issues building, electrical, plumbing and mechanical permits, and the fee
 * schedule prices all four the same way: from the valuation of the work, through
 * Table A. There is no per-outlet, per-fixture, per-circuit or trade-count row
 * anywhere in its fifty pages, and no trade permit fee at all.
 *
 * Three of the four get pages anyway, and the reason is what the Building Safety
 * section publishes **beside** Table A. It prices things a trade owns and nothing else
 * owns — additional utility meters at $98 each, a temporary power inspection at $195,
 * backflow prevention devices at $195 then $98, and the re-inspection of any
 * construction permit at $195 — and it states twice, in terms, that installation,
 * repair or replacement work is looked up in Table A. That is enough for an electrical
 * page and a plumbing page to compute something real and specific.
 *
 * Mechanical is the one that does not clear that bar: nothing in the schedule is
 * mechanical except periodic inspection rates for refrigeration systems and elevators,
 * and a periodic inspection is not a permit. A mechanical page would carry the area
 * mechanism and a statement of absence, so it is not published.
 */
const jurisdictionPermitTypes: SeedJurisdictionPermitType[] = [
  {
    jurisdictionKey: PHOENIX_KEYS.jurisdiction,
    permitTypeKey: "building",
    isAvailable: true,
    localName: "Building Permit",
    officialUrl: "https://www.phoenix.gov/administration/departments/pdd.html",
    notes:
      "Required for construction, additions and remodels. Priced from Table A on the valuation of the work, plus a plan review fee that is a percentage of that permit fee.",
  },
  {
    jurisdictionKey: PHOENIX_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    isAvailable: true,
    localName: "Electrical Permit",
    officialUrl: "https://www.phoenix.gov/administration/departments/pdd.html",
    notes:
      "Issued by the same department. No per-outlet, per-circuit or per-panel rate appears anywhere in the fee schedule; electrical work is priced from Table A on the valuation of the work, and the schedule publishes three electrical figures of its own — each additional electric meter $98, a temporary power inspection $195, and five fixed-fee options for a residential solar photovoltaic system.",
  },
  {
    jurisdictionKey: PHOENIX_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    isAvailable: true,
    localName: "Plumbing Permit",
    officialUrl: "https://www.phoenix.gov/administration/departments/pdd.html",
    notes:
      "Issued, and priced from Table A on valuation like every other construction permit. The plumbing figures the schedule publishes on their own are each additional gas or water meter at $98, backflow prevention devices at $195 for the first and $98 each after it, and a $98 minimum for a residential water heater.",
  },
  {
    jurisdictionKey: PHOENIX_KEYS.jurisdiction,
    permitTypeKey: "mechanical",
    isAvailable: true,
    localName: "Mechanical Permit",
    officialUrl: "https://www.phoenix.gov/administration/departments/pdd.html",
    notes:
      "Issued, and priced from Table A on valuation. Refrigeration installation, repair and replacement is directed to Permit Fee Table A in the schedule's own words; the only mechanical-specific fees published are periodic inspection rates, and a periodic inspection is not a permit. No page is published for it: see research/arizona/phoenix.md.",
  },
];

/* -------------------------------------------------------------------------- */
/* Fee schedule                                                               */
/* -------------------------------------------------------------------------- */

const feeSchedules: JurisdictionSeed["feeSchedules"] = [
  {
    key: PHOENIX_KEYS.feeSchedule,
    jurisdictionKey: PHOENIX_KEYS.jurisdiction,
    sourceKey: PHOENIX_FEE_SCHEDULE_SOURCE_KEY,
    title: "City of Phoenix PDD Fee Schedule — Chapter 9, Appendix A.2",
    officialUrl:
      "https://www.phoenix.gov/content/dam/phoenix/pddsite/documents/impact-fees/fee-schedule.pdf",
    effectiveFrom: PHOENIX_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: PHOENIX_LAST_VERIFIED,
    notes:
      "Effective 20 January 2026 under Ordinance G-7465, replacing the schedule it amends. The document has one effective date for the whole schedule, unlike Houston's per-row 'As Of' column. It covers site planning, environmental, subdivision, sign, civil engineering and building safety fees; only the building safety section is transcribed here.",
  },
];

/* -------------------------------------------------------------------------- */
/* Fee rules                                                                  */
/* -------------------------------------------------------------------------- */

function rulesFor(permitTypeKey: string, rules: SeedFeeRule["rule"][]): SeedFeeRule[] {
  return rules.map((rule) => ({
    jurisdictionKey: PHOENIX_KEYS.jurisdiction,
    permitTypeKey,
    scheduleKey: PHOENIX_KEYS.feeSchedule,
    rule,
  }));
}

const feeRules: SeedFeeRule[] = [
  ...rulesFor("building", PHOENIX_BUILDING_RULES),
  ...rulesFor("electrical", PHOENIX_ELECTRICAL_RULES),
  ...rulesFor("plumbing", PHOENIX_PLUMBING_RULES),
];

/* -------------------------------------------------------------------------- */
/* Requirements                                                               */
/* -------------------------------------------------------------------------- */

const requirements: SeedRequirement[] = [
  {
    jurisdictionKey: PHOENIX_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "document",
    title: "Project valuation",
    description:
      "Table A is applied to the valuation of the work, and the schedule defines valuation as building square footage multiplied by the standard rate for the occupancy — the Building Valuation Table. The schedule adds that the valuation used is the higher of the minimum the department calculates and the figure the applicant provides, and that the minimum valuation of the work is set by the Building Official from nationally recognised standards including the value of materials, labour, overhead and profit.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: PHOENIX_FEE_SCHEDULE_SOURCE_KEY,
    lastVerifiedAt: PHOENIX_LAST_VERIFIED,
  },
  {
    jurisdictionKey: PHOENIX_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "inspection",
    title: "The valuation is rounded up before the table is applied",
    description:
      "Every row of Table A charges its rate for each additional $1,000 of valuation, or fraction thereof. The schedule's own worked example shows the consequence: a $250,500 valuation is charged 51 whole $9 increments, not 50.5 of them.",
    isMandatory: true,
    sortOrder: 20,
    sourceKey: PHOENIX_FEE_SCHEDULE_SOURCE_KEY,
    lastVerifiedAt: PHOENIX_LAST_VERIFIED,
  },
  {
    jurisdictionKey: PHOENIX_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "document",
    title: "Whether the project needs a plan review",
    description:
      "Plan review is charged only where a plan review is required and the valuation exceeds $5,000. The schedule gives no fee at all for a valuation under $5,000 reviewed at the counter in 15 minutes or less, and it prices several other review routes separately — over-the-counter options for residential solar, for example, which carry their own flat fees. Whether your project needs a full review is the department's call, not the schedule's.",
    isMandatory: true,
    sortOrder: 30,
    sourceKey: PHOENIX_FEE_SCHEDULE_SOURCE_KEY,
    lastVerifiedAt: PHOENIX_LAST_VERIFIED,
  },
  {
    jurisdictionKey: PHOENIX_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "Fees the City charges on other schedules",
    description:
      "The department's own fees page publishes the zoning, impact, fire permit and plan review, and water and sewer fee schedules separately from the development fee schedule. None of them is part of the figures calculated on this site.",
    isMandatory: false,
    sortOrder: 40,
    sourceKey: PHOENIX_FEES_PAGE_SOURCE_KEY,
    lastVerifiedAt: PHOENIX_LAST_VERIFIED,
  },
  {
    jurisdictionKey: PHOENIX_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "document",
    title: "Electrical work is priced from the valuation of the work",
    description:
      "The schedule publishes no electrical permit fee and no per-outlet, per-circuit or per-panel rate. Its Building Safety section prices permits from the valuation of each building or addition, and two of its items say in terms how trade work is priced: under both Temporary Power and Refrigeration System Periodic Inspections it prints 'For installation, repair, or replacement work, see Permit Fee Table A.' Electrical installation work is therefore looked up in the same table as construction, and the trade does not change the fee.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: PHOENIX_FEE_SCHEDULE_SOURCE_KEY,
    lastVerifiedAt: PHOENIX_LAST_VERIFIED,
  },
  {
    jurisdictionKey: PHOENIX_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "other",
    title: "One electric meter is included; each one after it is $98",
    description:
      "Building Safety permit fees item 3, Additional Utility Meter Fees: the first meter of each type carries no additional fee because it is included in the permit fee, and each additional meter per utility is $98. Three electric meters are therefore two chargeable meters. The charge is per utility, so an electric meter and a gas meter added to the same project are two separate $98 charges rather than one.",
    isMandatory: true,
    sortOrder: 20,
    sourceKey: PHOENIX_FEE_SCHEDULE_SOURCE_KEY,
    lastVerifiedAt: PHOENIX_LAST_VERIFIED,
  },
  {
    jurisdictionKey: PHOENIX_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "other",
    title: "Temporary power is $195 and plan review is unresolved",
    description:
      "A temporary power inspection is $195 each, published under Building Safety inspection fees. Beyond that the schedule gives no electrical figure of its own. In particular it does not say whether a permit taken out for electrical work alone attracts the plan review percentage — 100% of a building permit fee at or below $50,000 of valuation and 80% above it — because that item is scoped in its own words to new construction, additions and remodels of a building. No plan review is added to the figures on this page for that reason.",
    isMandatory: true,
    sortOrder: 30,
    sourceKey: PHOENIX_FEE_SCHEDULE_SOURCE_KEY,
    lastVerifiedAt: PHOENIX_LAST_VERIFIED,
  },
  {
    jurisdictionKey: PHOENIX_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    requirementType: "document",
    title: "Plumbing work is priced from the valuation of the work",
    description:
      "The schedule contains no plumbing permit fee, no per-fixture rate and no per-gas-outlet rate. Plumbing work is priced from the valuation of the building or addition through Table A, exactly as construction is, which is why a plumbing permit for a project of a given value costs what a construction permit of that value costs.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: PHOENIX_FEE_SCHEDULE_SOURCE_KEY,
    lastVerifiedAt: PHOENIX_LAST_VERIFIED,
  },
  {
    jurisdictionKey: PHOENIX_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    requirementType: "other",
    title: "Backflow prevention devices are the one plumbing fee charged per device",
    description:
      "Miscellaneous inspection services, paragraph c: $195 for the first backflow prevention device and $98 for each additional device. It is a charge in addition to the permit fee, not a replacement for it, and it is the only plumbing item in the schedule whose price moves with a count rather than with a valuation.",
    isMandatory: true,
    sortOrder: 20,
    sourceKey: PHOENIX_FEE_SCHEDULE_SOURCE_KEY,
    lastVerifiedAt: PHOENIX_LAST_VERIFIED,
  },
  {
    jurisdictionKey: PHOENIX_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    requirementType: "other",
    title: "The water heater minimum is published, and is not added to any total here",
    description:
      "Table A's first row prints '$98 Minimum for Residential Water Heaters and Fences' for permits with a work valuation between $1 and $1,000, against a $195 base fee for everything else in the same bracket. It is published as a minimum, and the schedule does not say whether it replaces that $195 base or floors it. Charging both would double-count and charging either alone would be a guess, so the figure is stated on the page and left out of the calculation. The same applies to the $234 swimming pool minimum and its $30 aquatics program surcharge under Ordinance G-3114.",
    isMandatory: true,
    sortOrder: 30,
    sourceKey: PHOENIX_FEE_SCHEDULE_SOURCE_KEY,
    lastVerifiedAt: PHOENIX_LAST_VERIFIED,
  },
];

/* -------------------------------------------------------------------------- */
/* Jurisdiction profile                                                       */
/* -------------------------------------------------------------------------- */

const profile: SeedProfile = {
  jurisdictionKey: PHOENIX_KEYS.jurisdiction,
  headline: "What construction permits cost in Phoenix",
  summary:
    "Phoenix prices a building permit from one valuation table. Table A pairs a base amount with a dollar rate for each additional $1,000 of project valuation — $12 up to $10,000, then $10, $9 and $5 as the valuation rises — and rounds the valuation up to the next whole $1,000 before applying it. Plan review is added on top and is published as a percentage of that permit fee: 100% at or below $50,000 of valuation, 80% above it, with a $195 minimum. The City's fee schedule is a single 50-page document covering every department process, published under Ordinance G-7465 and effective 20 January 2026.",
  localContext:
    "Three things about Phoenix are worth knowing before you read any number here.\n\nThe first is that the table is marginal and chained. Each row's base amount is exactly what the rows below it produce — $303 at $10,000 is $195 plus nine $12 increments — so the whole table is one continuous calculation rather than a set of independent brackets. That chaining is the opposite of Houston's schedule, whose published base charges deliberately do not chain, and it is why a Phoenix estimate can be followed by hand in one pass.\n\nThe second is the rounding. Every row charges its rate for each additional $1,000, or fraction thereof. A valuation one cent over a boundary pays a whole increment.\n\nThe third is that plan review moves in the opposite direction to the permit fee. Because plan review is 100% of the permit fee at or below $50,000 of valuation and only 80% above it, crossing $50,000 makes the total fall: a $50,000 project pays a $703 permit fee and $703 of plan review, while a $50,001 project pays $712 and $569.60. The project got more expensive and the permit got cheaper. That is the published schedule, and the City's own example arithmetic follows the same rules.",
  valuationBasis:
    "The schedule does not ask for a cost estimate. It defines valuation as building square footage multiplied by the standard rate for the occupancy, published in a separate Building Valuation Table, and adds that the valuation used is the higher of the department's calculated minimum and the applicant's figure. Building square footage is defined in the schedule as the total area of all floors under roof and inside the outer enclosing walls or columns, including roofed patios, bay windows, basements and mezzanines, and excluding eaves and overhangs of three feet or less, open courts and unroofed patios. Each separate building is calculated on its own.\n\nThe Building Valuation Table itself is published and was downloaded, but it could not be read: the file has no text layer and this environment has no OCR, so no square-footage rate from it is reproduced on this site. Where a figure is needed, you supply the valuation.",
  notIncluded:
    "These figures are the City of Phoenix's building safety permit fee and plan review fee as published in Chapter 9, Appendix A.2 (Ordinance G-7465, effective 20 January 2026), computed by this site's engine. They are not a total project cost, and they do not include:\n\n- **The zoning, impact, fire permit and plan review, and water and sewer schedules**, which the department's own fees page publishes separately from this one.\n- **Plan review services other than the basic one.** The schedule prices plot plan review, single-family design review, engineering review of building components, fire life safety review, phased and deferred submittals, permits by appointment or inspection, expedited review, corrections after the second, self-certification, and every other hour-based service it lists at $195 an hour with its own minimum. None of them is charged here, and none of them is estimated.\n- **Every event fee**: re-inspection $195, after-hours inspection $195 an hour with a $390 or $585 minimum, conditional utility clearance, temporary power inspection $195, temporary or partial certificate of occupancy $780, and elevator, refrigeration and annual facilities permits.\n- **Fees that replace the base charge rather than adding to it.** Table A's first row prints a $98 minimum for residential water heaters and fences, and swimming pools carry a $234 minimum plus a $30 aquatics program surcharge under Ordinance G-3114. The schedule does not say whether those replace or floor the $195 base, so neither is modelled — charging both would double-count and charging either alone would be a guess.\n- **Solar energy permits.** Residential solar photovoltaic systems have five flat over-the-counter options of their own ($780, $585, $488, $390 and $293), and a non-standard system is priced from Table A. Solar water heaters are directed to the department fee schedule. None of it is modelled here.\n- **Investigation fees for work done without a permit**: $250 or the permit fee, whichever is greater, capped at $2,500 per day.\n- Fees charged by any department other than Planning & Development, and anything for property outside the Phoenix city limits. Whether Maricopa County issues construction permits for unincorporated areas, and for which functions, has not been verified against the county's own site, so it is not described here.",
  seoTitle: "Phoenix, Arizona construction permit fees",
  seoDescription:
    "How Phoenix prices building permits from project valuation in Table A, plus plan review at 100% or 80% of the permit fee — every rate, the rounding rule and the City's own worked example.",
  publishStatus: "published",
  noindex: false,
  lastReviewedAt: PHOENIX_LAST_VERIFIED,
};

/* -------------------------------------------------------------------------- */
/* Permit pages                                                               */
/* -------------------------------------------------------------------------- */

const permitPages: SeedPermitPage[] = [
  {
    jurisdictionKey: PHOENIX_KEYS.jurisdiction,
    permitTypeKey: "building",
    slug: "building-permit-cost",
    title: "Phoenix building permit cost",
    intro:
      "Phoenix charges a building permit fee from the valuation of the work using one table, applied the same way to a house, a tenant improvement and a warehouse. Table A pairs a base amount with a dollar rate for each additional $1,000 of valuation — $12 up to $10,000, then $10 up to $50,000, then $9 up to $1,000,000, then $5 above it — and the valuation is rounded up to the next whole $1,000 before the rate is applied. Plan review is added on top as a percentage of that permit fee: 100% at or below $50,000 of valuation, 80% above it, with a published minimum of $195.",
    localSummary:
      "The table's rows chain, which is unusual and worth following once. $303 is what the previous row produces at $10,000 ($195 plus nine $12 increments), $703 is what the row below produces at $50,000, $2,053 at $200,000, $9,253 at $1,000,000 and $54,253 at $10,000,000. One rule describes the whole table, and the City's own worked example — a $250,500 valuation, which it charges as $2,053 plus 51 increments of $9 — comes out at $2,512, the same figure this site calculates.\n\nPlan review is the component that surprises people, in two ways. It is a percentage of the permit fee rather than of the valuation, so it grows with the fee automatically. And the percentage drops from 100% to 80% at $50,000 of valuation, which makes the total fall as the project gets bigger: $50,000 pays $703 plus $703, while $50,001 pays $712 plus $569.60.\n\nTwo published fees are deliberately not charged, because the table does not say how they interact with the base. Table A prints a $98 minimum for residential water heaters and fences, and swimming pools carry a $234 minimum plus a $30 aquatics surcharge under Ordinance G-3114. Both are named on the jurisdiction page and left out of the arithmetic rather than guessed at.",
    notIncluded:
      "This estimate is the Table A permit fee plus the plan review fee published in the same document. It excludes:\n\n- **The $98 water heater and fence minimum and the $234 pool minimum with its $30 aquatics surcharge** — published, but the schedule does not say whether they replace or floor the $195 base charge.\n- **Every other plan review route**: plot plan, single-family design, engineering components, fire life safety, phased and deferred submittals, permits by appointment or inspection, expedited review, plan corrections after the second, and self-certification, all priced at $195 an hour with their own minimums.\n- **Event fees**: re-inspection $195, after-hours inspection $195 an hour ($390 or $585 minimum), temporary power $195, temporary or partial certificate of occupancy $780, and annual facilities, elevator and refrigeration permits.\n- **The zoning, impact, fire, and water and sewer fee schedules**, which the department publishes separately.\n- **Solar permits**, which have five flat over-the-counter options of their own, and **investigation fees** for work done without a permit ($250 or the permit fee, whichever is greater, capped at $2,500 a day).",
    workedExample: {
      scenario:
        "The City's own worked example: a project with a total valuation of $250,500. It is used here unchanged, because the arithmetic is the City's and the permit fee it produces is published in the schedule.",
      inputs: { valuationCents: 25_050_000, workType: "new_construction" },
      notes:
        "The City's document states the permit fee for this valuation as $2,512 — $2,053 plus 51 increments of $9 — and this site calculates the same figure. Plan review is not part of the City's statement of that total, and it is added above because the same document publishes it: at a valuation over $50,000 it is 80% of the permit fee, which is $2,009.60. The estimate therefore assumes a plan review is required, which the schedule does not decide; a project reviewed over the counter pays none. The valuation is the City's example figure, not a typical project.",
    },
    faqs: [
      {
        question: "Is the Phoenix building permit fee a percentage of construction cost?",
        answer:
          "Not directly. Table A is written as a base amount plus a dollar rate for each additional $1,000 of valuation — $12, then $10, then $9, then $5 — so the percentage each band represents falls as the project grows. Only plan review is a percentage, and it is a percentage of the permit fee rather than of the valuation.",
      },
      {
        question: "Why does the total fall when my project gets bigger?",
        answer:
          "Because plan review drops from 100% of the permit fee to 80% of it once the valuation passes $50,000. A $50,000 project pays a $703 permit fee and $703 of plan review, $1,406 in all; at $50,001 the permit fee rises to $712 but plan review falls to $569.60, so the total is $1,281.60. Both figures come from the published schedule.",
      },
      {
        question: "Does a valuation just over a boundary really pay a whole extra $1,000 of fee?",
        answer:
          "It pays the next increment of the band's rate, not a whole $1,000. Every row charges its rate 'for each additional $1,000, or fraction thereof', so $10,001 is charged at the $10 rate for one additional thousand rather than at the $12 rate. The City's own example does the same thing with $250,500 and 51 increments of $9.",
      },
      {
        question: "Is plan review always charged?",
        answer:
          "No. The schedule gives no plan review fee at all where the valuation is under $5,000 and the counter review takes 15 minutes or less, and it prices other review routes separately. The estimate on this page assumes a plan review is required, which is the department's decision rather than something the valuation alone determines.",
      },
      {
        question: "Does Phoenix charge separately for electrical or plumbing permits?",
        answer:
          "The City issues them, but the published fee schedule does not price them: across its fifty pages there is no electrical, plumbing or mechanical permit fee, and no per-outlet, per-fixture or per-circuit rate. What the schedule prices is construction work, from valuation, in Table A. A trade permit should be expected to be priced the same way, but no Phoenix page for it is published here because the City does not publish a trade mechanism to compute from.",
      },
    ],
    seoTitle: "Phoenix building permit cost: how Table A and plan review work",
    seoDescription:
      "Phoenix building permit fees come from one valuation table — $195 plus $12 per additional $1,000 up to $10,000, then $10, $9 and $5 — with plan review at 100% or 80% of the permit fee. The City's own example, reproduced.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: PHOENIX_LAST_VERIFIED,
  },
  {
    jurisdictionKey: PHOENIX_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    slug: "electrical-permit-cost",
    title: "Phoenix electrical permit cost",
    intro:
      "Phoenix publishes no electrical permit fee as such. Across all fifty pages of its fee schedule there is no per-outlet, per-circuit or per-panel rate and no electrical permit line — but the same section states, twice, that the permit fee for installation, repair or replacement work is looked up in Table A. Electrical work is therefore priced from the valuation of the work, exactly as construction is: $195 for the first $1,000 of valuation, then $12 per additional $1,000 up to $10,000, then $10, $9 and $5. Three fees on top of that belong to electrical work alone: each electric meter after the first is $98, a temporary power inspection is $195, and a re-inspection is $195.",
    localSummary:
      "The first thing to know is that there is no trade discount and no separate trade permit to look up. A service upgrade that carries a project valuation of $18,000 is charged as an $18,000 project: $303 on the first $10,000 plus $10 for each of the eight additional thousands, so $383 — the same figure a wall of the same valuation would pay. Phoenix prices the work, not the trade.\n\nThe second is the meter allowance, which is easy to misread and expensive to get wrong. The schedule includes **one meter of each type** in the permit fee: \"First Gas, Electric, or Water Meter — No additional fee (included with the permit fee for one meter of each type)\". Every meter after that is $98. So three electric meters are two chargeable meters, $196, not $294 — the first is already paid for.\n\nThe third is temporary power. A temporary power inspection is $195, and the schedule's note under that item is the sentence that routes the rest of the page: \"For installation, repair, or replacement work, see Permit Fee Table A.\" The same note appears under refrigeration system inspections, which is the nearest thing the document offers to a mechanical fee and is why there is no mechanical page here.\n\nWhat is not on this page matters as much as what is. A re-inspection is $195 and is charged only if one is needed — a project whose inspections pass owes nothing for it, and no estimate here includes it by default. And plan review is deliberately absent: Phoenix publishes it as a percentage of a *building* permit fee, scoped by its own words to new construction, additions and remodels of a building, and the schedule does not say whether a permit taken out for electrical work alone carries it. Where the electrical work is part of a building project, that project's plan review applies at 100% or 80% of the permit fee, and the building permit page computes it.",
    notIncluded:
      "This estimate is the City of Phoenix's building safety permit fee from Table A plus the fees the same schedule publishes for electrical work on its own. It is not a total project cost, and it does not include:\n\n- **Plan review.** Published under Building Safety Plan Review Fees item 1.a, scoped there to new construction, additions and remodels of a building. Electrical work inside such a project carries that project's review at 100% of the permit fee at or below $50,000 of valuation and 80% above it, minimum $195 — computed on the building permit page, and not added here because the schedule does not state that a stand-alone electrical permit is reviewed the same way.\n- **The $195 re-inspection** unless one is selected. The initial inspection and the first visit to verify corrections are included in the permit fee; a re-inspection called before the work was ready, one that could not be made for lack of access, or one following a failure to correct deficiencies is $195 each.\n- **After-hours inspections**: $195 an hour, minimum $390 for a request within two hours of normal inspection hours and minimum $585 for anything later, at a weekend or on a holiday.\n- **The residential solar photovoltaic fixed fees**, which are $780, $585, $488, $390 and $293 for the five over-the-counter options, and take a permit out of Table A entirely. A non-standard residential system is priced from Table A. Commercial solar has its own arrangement.\n- **Electric sign inspection fees**, which attach to sign permits rather than to electrical permits.\n- **Generator inspections for temporary events** at $195 for the first generator and $98 for each additional one.\n- **Investigation fees for work done without a permit** — $250 or the permit fee, whichever is greater, capped at $2,500 per day — and the doubling of the permit fee the schedule applies to unpermitted work under Section 114.\n- **Fees on the department's other schedules**: zoning, impact, fire permit and plan review, and water and sewer.\n- Anything for property outside the Phoenix city limits.",
    workedExample: {
      scenario:
        "An electrical project carrying a project valuation of $18,000, with three electric meters and a temporary power inspection. The valuation is the input the City's own table takes; the three meters illustrate the allowance, since the first one is included in the permit fee.",
      inputs: {
        valuationCents: 1_800_000,
        workType: "new_construction",
        occupancy: "commercial",
        custom: { meters: 3, temporary_power: true },
      },
      notes:
        "The permit fee is the published Table A figure: $303 on the first $10,000 of valuation plus $10 for each of the eight additional thousands, which is $383. Three electric meters are two chargeable meters at $98, because one meter of each type is included in that permit fee: $196. The temporary power inspection is $195. The total is $774.\n\nOne assumption is worth naming because it is the department's to make, not this site's. The schedule defines valuation as building square footage multiplied by the standard rate for the occupancy, and separately says that the permit fee for installation, repair or replacement work is looked up in Table A. Where the work is a stand-alone electrical job with no building valuation behind it, the department determines the valuation of the work. This example uses a project valuation as though it were the work's, which is the arithmetic the table performs and not a figure the City published for this job.",
    },
    faqs: [
      {
        question: "How much does an electrical permit cost in Phoenix?",
        answer:
          "Phoenix has no electrical permit fee of its own. Electrical work is priced from Table A on the valuation of the work: $195 for the first $1,000, then $12 per additional $1,000 up to $10,000, then $10 per additional $1,000 up to $50,000, and so on down to $5 per additional $1,000 above $1,000,000. On top of that, each electric meter after the first is $98 and a temporary power inspection is $195.",
      },
      {
        question: "Does Phoenix charge by the outlet, the circuit or the panel?",
        answer:
          "No. There is no per-outlet, per-circuit, per-panel or per-fixture rate anywhere in the fifty-page fee schedule, and no trade permit fee at all. Houston prices an electrical permit per outlet and per circuit; Phoenix prices the valuation of the work, so a project with ten outlets and one with a hundred of the same value pay the same permit fee.",
      },
      {
        question: "Is the first electric meter really free?",
        answer:
          "The permit fee includes one meter of each type — the schedule's own words are 'First Gas, Electric, or Water Meter: No additional fee (included with the permit fee for one meter of each type)'. Each meter beyond that is $98, and the charge is per utility, so a project adding its first electric meter pays nothing extra while a project with three of them pays $196.",
      },
      {
        question: "What does a temporary power inspection cost?",
        answer:
          "$195. It is published as a fee of its own under Building Safety inspection fees, and the same item adds that installation, repair or replacement work is priced from Permit Fee Table A.",
      },
      {
        question: "Does an electrical permit need its own plan review?",
        answer:
          "The schedule does not say. Phoenix publishes plan review as a percentage of a building permit fee — 100% at or below $50,000 of valuation, 80% above it — under a heading scoped to new construction, additions and remodels of a building. Where the electrical work is part of such a project, that review applies to the project's permit fee. Where the permit is taken out for electrical work alone, the schedule is silent, and no plan review is added on this site because adding one would be a guess.",
      },
      {
        question: "What happens if an inspection fails?",
        answer:
          "The initial inspection and the first re-inspection to verify corrections are included in the permit fee. After that each re-inspection is $195, whether it was called before the work was ready, could not be made because nobody was on site to provide access, or followed a failure to correct deficiencies.",
      },
    ],
    seoTitle: "Phoenix electrical permit cost: valuation-based fees, meters",
    seoDescription:
      "Phoenix has no per-outlet electrical permit fee: electrical work is priced from Table A on valuation, plus $98 for each electric meter after the first and $195 for a temporary power inspection.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: PHOENIX_LAST_VERIFIED,
  },
  {
    jurisdictionKey: PHOENIX_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    slug: "plumbing-permit-cost",
    title: "Phoenix plumbing permit cost",
    intro:
      "Phoenix prices plumbing work the way it prices everything else: from the valuation of the work, through Table A — $195 for the first $1,000, then $12 per additional $1,000 up to $10,000, then $10, $9 and $5 as the valuation rises. There is no per-fixture rate anywhere in the fifty-page schedule. The plumbing fees the City does publish on their own are added to that: each gas or water meter after the first is $98, a backflow prevention device is $195 for the first and $98 for each one after it, and a residential water heater carries a published $98 minimum.",
    localSummary:
      "Three plumbing figures in this schedule are worth more than the rest, because they are the only ones that are not simply Table A applied to a valuation.\n\nThe first is the meter allowance. One gas meter and one water meter are inside the permit fee — 'First Gas, Electric, or Water Meter: No additional fee (included with the permit fee for one meter of each type)' — and every meter after that is $98, charged per utility. A project with three water meters pays for two.\n\nThe second is backflow prevention, the one plumbing device the City prices by count rather than by valuation: $195 for the first device and $98 for each additional one. That is a real, published, per-device fee, and it sits in the schedule's miscellaneous inspection services rather than in Table A.\n\nThe third is the residential water heater, whose row in Table A reads '$98 Minimum for Residential Water Heaters and Fences' for a work valuation of $1,000 or less. That is the cheapest permit in the document for the most common plumbing job there is. It is deliberately **not** added to any total on this site: the row prints the word 'Minimum', under a table whose first row is a $195 base fee, and the schedule never says whether the $98 replaces that base or floors it. Charging both would double-count and charging either alone would be a guess, so the figure is named here and left out of the arithmetic — the same call made for the $234 swimming pool minimum.\n\nBackflow devices and meters are different: both are stated as charges in addition to the permit fee, so both are computed. A commercial plumbing permit valued at $40,000 with three water meters and three backflow devices comes to $603 of permit fee plus $196 for the meters and $391 for the devices, which is $1,190.",
    notIncluded:
      "This estimate is the City of Phoenix's building safety permit fee from Table A plus the plumbing fees the same schedule publishes on their own. It is not a total project cost, and it does not include:\n\n- **The $98 residential water heater minimum**, published in Table A's first row and not added, because the schedule does not say whether it replaces the $195 base fee or floors it. A residential water heater permit is therefore not computed on this site, and the published figure is $98.\n- **The swimming pool minimum of $234** and the **$30 aquatics program surcharge** under Ordinance G-3114, left out for the same reason. Pool permits are not computed here.\n- **Plan review**, for the reason given on the electrical page: published as a percentage of a building permit fee and scoped by the schedule to new construction, additions and remodels of a building. Plumbing work inside such a project carries that project's review, computed on the building permit page.\n- **The $195 re-inspection** unless one is selected, and **after-hours inspections** at $195 an hour with $390 and $585 minimums.\n- **Investigation fees for work done without a permit** — $250 or the permit fee, whichever is greater, capped at $2,500 a day — and the doubling of the permit fee the schedule applies to unpermitted work under Section 114.\n- **Solar water heaters**, which the department prices on its own schedule rather than in this one.\n- **Fees on the department's other schedules**: zoning, impact, fire permit and plan review, and water and sewer. The water and sewer connection charges a project actually pays are on the last of those, not here.\n- Anything for property outside the Phoenix city limits.",
    workedExample: {
      scenario:
        "A commercial plumbing permit carrying a project valuation of $40,000, with three water meters and three backflow prevention devices. The valuation drives the permit fee; the devices and meters are charged on top of it, which is how the schedule states each of them.",
      inputs: {
        valuationCents: 4_000_000,
        workType: "new_construction",
        occupancy: "commercial",
        custom: { meters: 3, backflow_devices: 3 },
      },
      notes:
        "The permit fee is the published Table A figure: $303 on the first $10,000 of valuation plus $10 for each of the thirty additional thousands, which is $603. Three water meters are two chargeable meters at $98, because one meter of each type is included in that permit fee: $196. Three backflow prevention devices are $195 for the first and $98 for each of the other two: $391. The total is $1,190.\n\nThe assumption to be aware of is the one on the electrical page: Table A takes a valuation, the schedule defines valuation from the building's square footage and occupancy, and where plumbing work stands alone the department determines the valuation of the work. The device and meter fees do not depend on that at all.",
    },
    faqs: [
      {
        question: "How much does a plumbing permit cost in Phoenix?",
        answer:
          "Phoenix prices plumbing work from the valuation of the work through Table A: $195 for the first $1,000, $12 per additional $1,000 up to $10,000, then $10, $9 and $5. Each gas or water meter after the first is $98, and backflow prevention devices are $195 for the first and $98 each after that. A residential water heater carries a published $98 minimum for work valued at $1,000 or less.",
      },
      {
        question: "Does Phoenix charge per plumbing fixture?",
        answer:
          "No. There is no per-fixture, per-water-heater or per-gas-outlet rate in the fee schedule. Houston prices a plumbing permit at $34.24 for the first three fixtures plus $11.41 for each additional one; Phoenix prices the valuation of the work, so fixtures do not change the fee at all.",
      },
      {
        question: "What does a backflow prevention device cost?",
        answer:
          "$195 for the first device and $98 for each additional one. It is one of the few plumbing fees the City publishes by count rather than by valuation, and it is charged in addition to the permit fee rather than instead of it.",
      },
      {
        question: "How much is a water heater permit?",
        answer:
          "Table A prints '$98 Minimum for Residential Water Heaters and Fences' for permits with a work valuation between $1 and $1,000. It is published as a minimum, and the schedule does not say whether it replaces the $195 base fee or floors it, so this site quotes it and does not compute a water heater permit from it. Solar water heaters are priced on the department's own schedule.",
      },
      {
        question: "Do I pay extra for a second water meter?",
        answer:
          "The permit fee includes one meter of each type, so the first gas meter and the first water meter cost nothing extra. Each additional meter is $98 per utility: three water meters are two chargeable meters, $196.",
      },
      {
        question: "Are water and sewer connection charges part of the permit fee?",
        answer:
          "No. They are on the department's water and sewer fee schedule, which the department's own fees page publishes separately from the development fee schedule used here.",
      },
    ],
    seoTitle: "Phoenix plumbing permit cost: valuation-based fees and devices",
    seoDescription:
      "Phoenix prices plumbing work from valuation through Table A, plus $98 for each meter after the first and $195 for the first backflow prevention device, $98 each after — with the published water heater minimum.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: PHOENIX_LAST_VERIFIED,
  },
];

/* -------------------------------------------------------------------------- */
/* Verification ledger                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Who verified the trade-permit additions.
 *
 * The building permit's rows were read in the first Phoenix pass; the trade rules were
 * found later, in the same document, by searching it for the words a trade fee would
 * have to contain. The two passes are recorded separately because they were separate
 * reads of the same PDF, and a later reviewer should be able to tell which rows came
 * from which.
 */
const RESEARCHER_TRADES = "Permit Fee Intelligence research pass 4 (trade permits)";

const verifications: SeedVerification[] = [
  {
    entityType: "source",
    entityKey: PHOENIX_FEE_SCHEDULE_SOURCE_KEY,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: PHOENIX_LAST_VERIFIED,
    verifiedBy: "Permit Fee Intelligence research pass 3",
    sourceKey: PHOENIX_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "All fifty pages fetched live from phoenix.gov and read, with the building safety section transcribed twice (pdftotext -layout for table shape, -raw to check it). Hash of the file read: 4193e742000369ae3b6814e56c7eb2563cf18075240aeb894f335d684ff9436d. Table A's seven rows were checked against each other before being collapsed into one marginal rule: each row's base amount is exactly what the rows below it produce.",
  },
  {
    entityType: "source",
    entityKey: PHOENIX_FEES_PAGE_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: PHOENIX_LAST_VERIFIED,
    verifiedBy: "Permit Fee Intelligence research pass 3",
    sourceKey: PHOENIX_FEES_PAGE_SOURCE_KEY,
    notes:
      "Read on 2026-09-24. Confirms the fee schedule is effective 20 January 2026, names the separate zoning, impact, fire and water/sewer schedules, and gives the department's counters and contacts. Its proposal notice about a fee increase is a proposal only and is not reflected in any figure here.",
  },
  {
    entityType: "source",
    entityKey: PHOENIX_VALUATION_TABLE_SOURCE_KEY,
    status: "needs_review",
    method: "official_pdf_review",
    verifiedAt: PHOENIX_LAST_VERIFIED,
    verifiedBy: "Permit Fee Intelligence research pass 3",
    sourceKey: PHOENIX_VALUATION_TABLE_SOURCE_KEY,
    notes:
      "RECORDED BUT NOT READ. The file downloads (sha256 2949f758e5d318c758388a23d63f88a8d46c0641c5ed75d4afe4afbdac3519fe) and has no text layer: pdftotext returns zero lines. This environment has no OCR, so the square-footage rates in it are unknown and none is published. The valuation basis is described on the pages without them.",
  },
  {
    entityType: "fee_rule",
    entityKey: "TABLE-A",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: PHOENIX_LAST_VERIFIED,
    verifiedBy: "Permit Fee Intelligence research pass 3",
    sourceKey: PHOENIX_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "Table A is one marginal table read as one rule. The City's own example is reproduced exactly: $250,500 -> $2,512, which is $2,053 plus 51 increments of $9. Every published row was checked as a boundary value: $1,000 -> $195; $10,000 -> $303; $50,000 -> $703; $200,000 -> $2,053; $1,000,000 -> $9,253; $10,000,000 -> $54,253. The 'or fraction thereof' rounding is modelled with incrementCents rather than left to the reader.",
  },
  {
    entityType: "fee_rule",
    entityKey: "PLAN-REVIEW-100",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: PHOENIX_LAST_VERIFIED,
    verifiedBy: "Permit Fee Intelligence research pass 3",
    sourceKey: PHOENIX_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "Building Safety Plan Review Fees, item 1.a.1 and 1.a.3: 100% of the permit fee, minimum $195, for residential and commercial valuations of $50,000 or less. Item 1.a's scope paragraph limits it to valuations over $5,000, and item 1.b confirms no plan review fee under $5,000 at the counter. The published $195 minimum cannot bind at these thresholds — 100% of the cheapest permit fee above $5,000 is $255 — and it is modelled anyway rather than edited out. See research/arizona/phoenix.md.",
  },
  {
    entityType: "fee_rule",
    entityKey: "PLAN-REVIEW-80",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: PHOENIX_LAST_VERIFIED,
    verifiedBy: "Permit Fee Intelligence research pass 3",
    sourceKey: PHOENIX_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "Building Safety Plan Review Fees, item 1.a.2 and 1.a.4: 80% of the permit fee, minimum $195, for residential and commercial valuations over $50,000. The step from 100% to 80% at $50,000 is real and makes the total fall across the boundary; both figures are stated on the page.",
  },
  {
    entityType: "permit_page",
    entityKey: "building-permit-cost",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: PHOENIX_LAST_VERIFIED,
    verifiedBy: "Permit Fee Intelligence research pass 3",
    sourceKey: PHOENIX_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "Table A and both plan review rules transcribed, with the worked example being the City's own. The fees that are named but not modelled — the $98 water heater and fence minimum, the $234 pool minimum and $30 surcharge, the hourly review services, the event fees and the solar flat fees — are listed on the page and in research/arizona/phoenix.md.",
  },
  {
    entityType: "jurisdiction_profile",
    entityKey: PHOENIX_KEYS.jurisdiction,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: PHOENIX_LAST_VERIFIED,
    verifiedBy: "Permit Fee Intelligence research pass 3",
    sourceKey: PHOENIX_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "Hub content built from the fee schedule and the department's own fees page, including the department's published address, phone number and portal. The Building Valuation Table is named as published but unread, and no square-footage rate is claimed.",
  },
  {
    entityType: "fee_rule",
    entityKey: "TABLE-A",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: PHOENIX_LAST_VERIFIED,
    verifiedBy: RESEARCHER_TRADES,
    sourceKey: PHOENIX_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "The same Table A rule as on the building permit, attached to the electrical permit because the schedule routes trade work to it twice in terms: 'For installation, repair, or replacement work, see Permit Fee Table A', printed under both Temporary Power and Refrigeration System Periodic Inspections in the Building Safety section. The rule is unchanged — a second row sharing the code, which is how a rule that two permit types share is recorded.",
  },
  {
    entityType: "fee_rule",
    entityKey: "METER-ELECTRIC-ADDITIONAL",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: PHOENIX_LAST_VERIFIED,
    verifiedBy: RESEARCHER_TRADES,
    sourceKey: PHOENIX_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "Building Safety permit fees item 3, Additional Utility Meter Fees: 'First Gas, Electric, or Water Meter: No additional fee (included with the permit fee for one meter of each type)' and 'Each Additional Meter per Utility: $98 each'. Modelled with an allowance of one so the first meter is not charged; a rule without it would have charged $294 for three meters instead of $196.",
  },
  {
    entityType: "fee_rule",
    entityKey: "TEMPORARY-POWER",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: PHOENIX_LAST_VERIFIED,
    verifiedBy: RESEARCHER_TRADES,
    sourceKey: PHOENIX_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "Building Safety inspection fees item 4, Temporary Power: 'Inspection Fee: $195 each'. Conditional on a temporary power inspection being selected, because it is a fee for an event rather than for a permit.",
  },
  {
    entityType: "fee_rule",
    entityKey: "TABLE-A",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: PHOENIX_LAST_VERIFIED,
    verifiedBy: RESEARCHER_TRADES,
    sourceKey: PHOENIX_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "The same Table A rule, attached to the plumbing permit for the same reason as on the electrical one. The published water heater row inside Table A is not modelled, and the reason is recorded on the plumbing page and in research/arizona/phoenix.md.",
  },
  {
    entityType: "fee_rule",
    entityKey: "METER-GAS-WATER-ADDITIONAL",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: PHOENIX_LAST_VERIFIED,
    verifiedBy: RESEARCHER_TRADES,
    sourceKey: PHOENIX_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "The same published row as the electric meter fee, on the plumbing side: a gas meter and a water meter are the other two utilities the row names. Same $98, same allowance of one.",
  },
  {
    entityType: "fee_rule",
    entityKey: "BACKFLOW-DEVICES",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: PHOENIX_LAST_VERIFIED,
    verifiedBy: RESEARCHER_TRADES,
    sourceKey: PHOENIX_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "Building Safety inspection fees item 6.c, Miscellaneous Inspection Services: 'Backflow Prevention Devices: $195 for the 1st backflow device and $98 for each additional backflow device'. Modelled as a base amount plus an allowance, the shape per_unit already had from Houston's fixtures.",
  },
  {
    entityType: "fee_rule",
    entityKey: "REINSPECTION",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: PHOENIX_LAST_VERIFIED,
    verifiedBy: RESEARCHER_TRADES,
    sourceKey: PHOENIX_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "Building Safety inspection fees item 1, Re-inspection Fee for All Construction Permits: $195 for each re-inspection whether it was called before the work was ready, could not be made for lack of access, or followed a failure to correct deficiencies. The same item states that the initial inspection and the first correction visit are included in the permit fee, which is why no worked example charges it.",
  },
  {
    entityType: "permit_page",
    entityKey: "electrical-permit-cost",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: PHOENIX_LAST_VERIFIED,
    verifiedBy: RESEARCHER_TRADES,
    sourceKey: PHOENIX_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "Four rules: Table A, the additional electric meter fee, the temporary power inspection and the re-inspection. The absence of a per-item electrical rate and the unresolved question of plan review on a stand-alone trade permit are both stated on the page rather than filled in. Worked example computed by the engine: a $18,000 valuation with three meters and a temporary power inspection, $774.00.",
  },
  {
    entityType: "permit_page",
    entityKey: "plumbing-permit-cost",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: PHOENIX_LAST_VERIFIED,
    verifiedBy: RESEARCHER_TRADES,
    sourceKey: PHOENIX_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "Four rules: Table A, the additional gas and water meter fee, backflow prevention devices and the re-inspection. The published $98 residential water heater minimum is named and not computed, with the reason given on the page. Worked example computed by the engine: a $40,000 valuation with three water meters and three backflow devices, $1,190.00.",
  },
];

/* -------------------------------------------------------------------------- */
/* Export                                                                     */
/* -------------------------------------------------------------------------- */

export const phoenixSeed: JurisdictionSeed = {
  state,
  county,
  jurisdiction,
  departments,
  sources,
  // Empty: "the building permit" and its trades are global rows Houston defines.
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
export const PHOENIX_PUBLISHED_PERMIT_PAGES = phoenixSeed.permitPages.filter(
  (page) => page.publishStatus === "published" && !page.noindex,
);

/** Permit pages deliberately held back, with the reason research/arizona/phoenix.md gives. */
export const PHOENIX_WITHHELD_PERMIT_PAGES = phoenixSeed.permitPages.filter(
  (page) => page.publishStatus !== "published" || page.noindex,
);
