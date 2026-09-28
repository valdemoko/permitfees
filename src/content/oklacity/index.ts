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
  OKC_BUILDING_RULES,
  OKC_ELECTRICAL_RULES,
  OKC_FY2026_DATE,
  OKC_IMPACT_EFFECTIVE_FROM,
  OKC_IMPACT_RULES,
  OKC_IMPACT_SOURCE_KEY,
  OKC_ORD_27978_DATE,
  OKC_PERMIT_PAGE_SOURCE_KEY,
  OKC_PLUMBING_RULES,
  OKC_T12_SOURCE_KEY,
  OKC_T18_SOURCE_KEY,
  OKC_T42_SOURCE_KEY,
} from "./fee-rules";

export * from "./fee-rules";

/**
 * The complete Oklahoma City, Oklahoma seed payload.
 *
 * Every figure traces to research/oklahoma/oklahoma-city.md, which traces to the
 * City's own two publications: Chapter 60 of the Code of Ordinances — one
 * ordinance-book chapter holding the fee schedules of all four trades, read
 * through the codifier on 2026-09-26 — and the Development Impact Fees page,
 * a separate instrument (streets and parks, assessed by land use, assessment
 * area and square footage when a building permit is issued).
 *
 * Ordinance 27978 (11-18-25) printed its fee tables in two columns, one for
 * FY2025-26 and one for "July 1, 2026 and thereafter". The later column is in
 * force on this pass's date and is the one every rule carries; the FY2025-26
 * figures are recorded in the research record and charged nowhere. Plan review
 * is a credit rather than a charge — 50% of the permit fee paid on submission
 * and credited toward the total — so it is named on every page and summed
 * nowhere, the reading Pittsburgh's 40% share established.
 *
 * Three pages, all published: building, electrical and plumbing. Title 29
 * (Mechanical) is read and recorded without a page in this pass.
 *
 * The worked examples reproduce cent for cent: building $13,860.50 (a 49,500 sq
 * ft office at $0.28 plus the state's $0.50), electrical $476.50 (commercial new
 * construction, 5,000 sq ft, 400 amps — $221 + 2 × $103.50 + $22.50 + $25.50 +
 * $0.50), plumbing $170.50 (a one-/two-family dwelling with three bathrooms and
 * both service connections).
 */

const RESEARCHER = "Permit Fee Intelligence research pass 15 (Oklahoma)";

export const OKLAHOMA_CITY_LAST_VERIFIED = "2026-09-26";

export const OKLAHOMA_CITY_KEYS = {
  state: "ok",
  county: "oklahoma-county",
  jurisdiction: "oklahoma-city",
  buildingSchedule: "okc-ch60-title-12-building",
  electricalSchedule: "okc-ch60-title-18-electrical",
  plumbingSchedule: "okc-ch60-title-42-plumbing",
  impactSchedule: "okc-development-impact-fees",
} as const;

const state: SeedState = {
  code: "OK",
  slug: "oklahoma",
  name: "Oklahoma",
  fipsCode: "40",
};

const county: SeedCounty = {
  key: OKLAHOMA_CITY_KEYS.county,
  slug: "oklahoma-county",
  name: "Oklahoma County",
  fipsCode: "40109",
};

const jurisdiction: SeedJurisdiction = {
  key: OKLAHOMA_CITY_KEYS.jurisdiction,
  stateKey: OKLAHOMA_CITY_KEYS.state,
  countyKey: OKLAHOMA_CITY_KEYS.county,
  type: "city",
  slug: "oklahoma-city",
  name: "Oklahoma City",
  officialName: "City of Oklahoma City",
  websiteUrl: "https://www.okc.gov/",
  permitPortalUrl:
    "https://aca-prod.accela.com/OKC/Cap/CapHome.aspx?module=Permits&TabName=HOME",
  timezone: "America/Chicago",
  isActive: true,
};

const departments: SeedDepartment[] = [
  {
    key: "oklahoma-city-development-services",
    jurisdictionKey: OKLAHOMA_CITY_KEYS.jurisdiction,
    kind: "building",
    name: "City of Oklahoma City — Development Services (Business Center)",
    phone: "(405) 297-2525",
    email: null,
    url: "https://www.okc.gov/Services/Permits/Building-Trade-Permits/Permit-Fees",
    addressLine: "420 West Main Street, Oklahoma City, OK 73102",
    hours: null,
    notes:
      "The Permit Fees page's own Contact Us block splits the lines: building permit questions (residential or commercial) go to (405) 297-2525, trade permit questions (electrical, plumbing, mechanical) to (405) 297-2948, and both direct visitors to the in-person business center at 420 W. Main St. City Hall is 200 North Walker, (405) 297-2535, action.center@okc.gov. Permits are filed through the City's Accela Citizen Access portal.",
  },
];

const sources: SeedSource[] = [
  {
    key: OKC_T12_SOURCE_KEY,
    jurisdictionKey: OKLAHOMA_CITY_KEYS.jurisdiction,
    title:
      "OKC Code of Ordinances, Chapter 60 — General Schedule of Fees, Title 12 (Building Code)",
    url: "https://library.municode.com/ok/oklahoma_city/codes/code_of_ordinances?nodeId=OKMUCO2020_CH60GESCFE_TIT12BUCO",
    sourceType: "municipal_code",
    issuingAuthority: "City of Oklahoma City",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2025-11-18",
    effectiveFrom: OKC_ORD_27978_DATE,
    retrievedAt: OKLAHOMA_CITY_LAST_VERIFIED,
    lastVerifiedAt: OKLAHOMA_CITY_LAST_VERIFIED,
    notes:
      "Read 2026-09-26 section by section through the codifier (an SPA that returns only its title to text extractors, and okc.gov 403s plain fetchers — every page of this jurisdiction was read through the browser session). The section histories all end with Ord. No. 27978, § …, 11-18-25, the ordinance that printed the two-column tables: a column for July 1, 2025 through June 30, 2026 and a column for July 1, 2026 and thereafter. §§ 60-12-1, 60-12-6, 60-12-7, 60-12-8, 60-12-9 and the misc rows were read in full, along with the NOTE that electrical, plumbing and mechanical permits are separate schedules under their own titles.",
  },
  {
    key: OKC_T18_SOURCE_KEY,
    jurisdictionKey: OKLAHOMA_CITY_KEYS.jurisdiction,
    title:
      "OKC Code of Ordinances, Chapter 60 — General Schedule of Fees, Title 18 (Electrical Code)",
    url: "https://library.municode.com/ok/oklahoma_city/codes/code_of_ordinances?nodeId=OKMUCO2020_CH60GESCFE_TIT18ELCO",
    sourceType: "municipal_code",
    issuingAuthority: "City of Oklahoma City",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2025-11-18",
    effectiveFrom: OKC_ORD_27978_DATE,
    retrievedAt: OKLAHOMA_CITY_LAST_VERIFIED,
    lastVerifiedAt: OKLAHOMA_CITY_LAST_VERIFIED,
    notes:
      "Read 2026-09-26 through the codifier. Five regimes with their own scope words: § 60-18-14 residential new construction (2026 column base $175.00), § 60-18-16 residential add-on/remodel/service, §§ 60-18-20 and 60-18-22 commercial new construction split at 4,000 square feet, § 60-18-24 commercial add-on/service change, § 60-18-26 miscellaneous rows (all 2026 column), and § 60-18-12's standalone five-outlet permit. § 60-18-27 repeats the $0.50 OUBCC line.",
  },
  {
    key: OKC_T42_SOURCE_KEY,
    jurisdictionKey: OKLAHOMA_CITY_KEYS.jurisdiction,
    title:
      "OKC Code of Ordinances, Chapter 60 — General Schedule of Fees, Title 42 (Plumbing Code)",
    url: "https://library.municode.com/ok/oklahoma_city/codes/code_of_ordinances?nodeId=OKMUCO2020_CH60GESCFE_TIT42PLCO",
    sourceType: "municipal_code",
    issuingAuthority: "City of Oklahoma City",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2025-11-18",
    effectiveFrom: OKC_ORD_27978_DATE,
    retrievedAt: OKLAHOMA_CITY_LAST_VERIFIED,
    lastVerifiedAt: OKLAHOMA_CITY_LAST_VERIFIED,
    notes:
      "Read 2026-09-26 through the codifier. Three schedules split by scope: § 60-42-6 residential new construction for one- and two-family dwellings and condominiums (base $83 with the fixtures inside it), § 60-42-7 residential addition or replacement (2026 column base $84), § 60-42-9 for everything the first section excludes (2026 column base $120) — which is how multifamily prices — plus § 60-42-10's special fees and § 60-42-11's $0.50 OUBCC line.",
  },
  {
    key: OKC_PERMIT_PAGE_SOURCE_KEY,
    jurisdictionKey: OKLAHOMA_CITY_KEYS.jurisdiction,
    title: "City of Oklahoma City — Permit Fees (department hub page)",
    url: "https://www.okc.gov/Services/Permits/Building-Trade-Permits/Permit-Fees",
    sourceType: "municipal_website",
    issuingAuthority: "City of Oklahoma City Development Services",
    authorityKind: "city",
    isPrimary: false,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: OKLAHOMA_CITY_LAST_VERIFIED,
    lastVerifiedAt: OKLAHOMA_CITY_LAST_VERIFIED,
    notes:
      "Read 2026-09-26. The City's own index of the four trade schedules (links into Municode), the July 2025 fee-changes PDF, and the impact-fee timing sentence: development impact fees for streets and parks \"went into effect in January 2017 and will be updated July 1st of each subsequent year\", and \"In addition to the Building Permit Fees*, Development impact fees will be assessed based on new or additional square footage\". The page also carries this jurisdiction's contact numbers and the 420 W. Main St. business center. It publishes no fee figures of its own — the code carries the operative numbers — which is why this source is not marked primary.",
  },
  {
    key: OKC_IMPACT_SOURCE_KEY,
    jurisdictionKey: OKLAHOMA_CITY_KEYS.jurisdiction,
    title: "City of Oklahoma City — Development Impact Fees (streets and parks rate tables)",
    url: "https://www.okc.gov/Services/Permits/Building-Trade-Permits/Development-Impact-Fees",
    sourceType: "municipal_website",
    issuingAuthority: "City of Oklahoma City",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: OKC_IMPACT_EFFECTIVE_FROM,
    retrievedAt: OKLAHOMA_CITY_LAST_VERIFIED,
    lastVerifiedAt: OKLAHOMA_CITY_LAST_VERIFIED,
    notes:
      "Read 2026-09-26. The streets fee table is a six-by-four matrix — land use (Residential, Industrial, Office/Institutional/Lodging, Customer-Oriented Low/Moderate/High) by streets assessment area (Rural, New Growth, Infill, Core) — dollars per square foot of development excluding porches and garages, collected when a building permit is issued with deferral available until the certificate of occupancy. Parks: 53 cents per square foot, residential development only, excluding porches, garages and patios. The page dates both to January 2017 with annual July 1 updates; whether the 2026-07-01 update moved the amounts is an open question — no dated instrument checks it. The 38% local-park waiver and the private-park exemption (Ord. 25374) are credits with their own application process, named rather than modelled.",
  },
];

/** Empty on purpose: the permit types Oklahoma City uses already exist as shared rows. */
const permitTypes: JurisdictionSeed["permitTypes"] = [];
const projectTypes: JurisdictionSeed["projectTypes"] = [];

const jurisdictionPermitTypes: SeedJurisdictionPermitType[] = [
  {
    jurisdictionKey: OKLAHOMA_CITY_KEYS.jurisdiction,
    permitTypeKey: "building",
    isAvailable: true,
    localName: "Building permit — valuation ladder or class rate by square foot, plus impact fees",
    officialUrl: "https://www.okc.gov/Services/Permits/Building-Trade-Permits/Permit-Fees",
    notes:
      "Two sections price two different jobs: § 60-12-7 takes alterations, removal and repair at $6.00 per $1,000 of valuation with a $75 minimum, and § 60-12-9 takes new construction at a per-square-foot class rate with the same floor. Demolition is priced by stories, plan review is 50% credited rather than added, and the permit's own land-use category and assessment area decide the streets and parks impact fees.",
  },
  {
    jurisdictionKey: OKLAHOMA_CITY_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    isAvailable: true,
    localName: "Electrical permit — five regimes by occupancy, area and scope, no permit minimum",
    officialUrl: "https://www.okc.gov/Services/Permits/Building-Trade-Permits/Permit-Fees",
    notes:
      "§ 60-18-14 prices residential new construction at $175 base plus $50 per additional 100 amps or portion over 200 with the required rough/final pair; §§ 60-18-20/22 split commercial new construction at 4,000 square feet ($67/$221 bases, $40.50/$103.50 amp rows); § 60-18-16 and § 60-18-24 take add-on and service-change rows; § 60-18-26 carries the miscellaneous rows. Title 18 states no permit floor — the $75 minimums live in Title 12 and do not reach across titles.",
  },
  {
    jurisdictionKey: OKLAHOMA_CITY_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    isAvailable: true,
    localName: "Plumbing permit — three schedules by scope, fixtures and service connections, no valuation",
    officialUrl: "https://www.okc.gov/Services/Permits/Building-Trade-Permits/Permit-Fees",
    notes:
      "§ 60-42-6 takes one-/two-family new construction at $83 with the fixtures already inside, adding $28.50 for each bathroom more than one and $15 per water and per sewer service; § 60-42-7 takes residential alterations at $84 plus $7 per fixture and $25.50 per connection (2026 column); § 60-42-9 takes everything the first section excludes — multifamily among them — at $120 plus the same rows. Nothing on this page reads a valuation.",
  },
];

const feeSchedules: SeedFeeSchedule[] = [
  {
    key: OKLAHOMA_CITY_KEYS.buildingSchedule,
    jurisdictionKey: OKLAHOMA_CITY_KEYS.jurisdiction,
    sourceKey: OKC_T12_SOURCE_KEY,
    title: "OKC Code of Ordinances Ch. 60, Title 12 — Building Code fee schedule",
    officialUrl:
      "https://library.municode.com/ok/oklahoma_city/codes/code_of_ordinances?nodeId=OKMUCO2020_CH60GESCFE_TIT12BUCO",
    effectiveFrom: OKC_ORD_27978_DATE,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: OKLAHOMA_CITY_LAST_VERIFIED,
    notes:
      "The enactment for the building page: the $6.00-per-$1,000 alteration ladder, § 60-12-9's five class rates, demolition by story, § 60-12-1's misc rows and the $0.50 OUBCC line. Two-column figures from Ord. 27978 carry 2026-07-01 as their effective date; single-amount sections carry the ordinance date.",
  },
  {
    key: OKLAHOMA_CITY_KEYS.electricalSchedule,
    jurisdictionKey: OKLAHOMA_CITY_KEYS.jurisdiction,
    sourceKey: OKC_T18_SOURCE_KEY,
    title: "OKC Code of Ordinances Ch. 60, Title 18 — Electrical Code fee schedule",
    officialUrl:
      "https://library.municode.com/ok/oklahoma_city/codes/code_of_ordinances?nodeId=OKMUCO2020_CH60GESCFE_TIT18ELCO",
    effectiveFrom: OKC_ORD_27978_DATE,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: OKLAHOMA_CITY_LAST_VERIFIED,
    notes:
      "Five regimes and the standalone five-outlet permit, every amperage add-on measuring from 200 and rounding the excess up to whole hundreds. No minimum applies under this title.",
  },
  {
    key: OKLAHOMA_CITY_KEYS.plumbingSchedule,
    jurisdictionKey: OKLAHOMA_CITY_KEYS.jurisdiction,
    sourceKey: OKC_T42_SOURCE_KEY,
    title: "OKC Code of Ordinances Ch. 60, Title 42 — Plumbing Code fee schedule",
    officialUrl:
      "https://library.municode.com/ok/oklahoma_city/codes/code_of_ordinances?nodeId=OKMUCO2020_CH60GESCFE_TIT42PLCO",
    effectiveFrom: OKC_ORD_27978_DATE,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: OKLAHOMA_CITY_LAST_VERIFIED,
    notes:
      "Three schedules split by the sections' own scope words, plus § 60-42-10's special fees. Counts only — fixtures, bathrooms, service connections — no valuation anywhere in the title.",
  },
  {
    key: OKLAHOMA_CITY_KEYS.impactSchedule,
    jurisdictionKey: OKLAHOMA_CITY_KEYS.jurisdiction,
    sourceKey: OKC_IMPACT_SOURCE_KEY,
    title: "City of Oklahoma City — Development Impact Fees (streets and parks)",
    officialUrl:
      "https://www.okc.gov/Services/Permits/Building-Trade-Permits/Development-Impact-Fees",
    effectiveFrom: OKC_IMPACT_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: OKLAHOMA_CITY_LAST_VERIFIED,
    notes:
      "A second, separate instrument assessed when a building permit is issued: streets at the published six-by-four matrix, parks at 53 cents per square foot for residential development only. The page dates both to January 2017 with annual July 1 updates; the amounts read on 2026-09-26 are carried as current.",
  },
];

function attach(
  permitTypeKey: string,
  rules: SeedFeeRule["rule"][],
  scheduleKey: string,
): SeedFeeRule[] {
  return rules.map((rule) => ({
    jurisdictionKey: OKLAHOMA_CITY_KEYS.jurisdiction,
    permitTypeKey,
    scheduleKey,
    rule,
  }));
}

const feeRules: SeedFeeRule[] = [
  ...attach("building", OKC_BUILDING_RULES, OKLAHOMA_CITY_KEYS.buildingSchedule),
  ...attach("building", OKC_IMPACT_RULES, OKLAHOMA_CITY_KEYS.impactSchedule),
  ...attach("electrical", OKC_ELECTRICAL_RULES, OKLAHOMA_CITY_KEYS.electricalSchedule),
  ...attach("plumbing", OKC_PLUMBING_RULES, OKLAHOMA_CITY_KEYS.plumbingSchedule),
];

const requirements: SeedRequirement[] = [
  {
    jurisdictionKey: OKLAHOMA_CITY_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "Plan review is 50% of the permit fee, paid on submission and credited against the total",
    description:
      "§ 60-12-6(b): plan review submitted with the application is \"50.0% of total building permit fee, not to exceed $2,750.00\", and \"This fee is not refundable, but will be credited towards the total permit fee, the remainder of which is due upon issuance of the permit.\" A credit does not change the total — the applicant pays half at submission and the rest at issuance — so this site names the payment schedule and never sums it. Subsections (a) (pre-application review, $150.00) and (c) (pre-construction meeting, $500.00) are optional services with their own triggers and are recorded, not charged.",
    isMandatory: false,
    sortOrder: 10,
    sourceKey: OKC_T12_SOURCE_KEY,
    lastVerifiedAt: OKLAHOMA_CITY_LAST_VERIFIED,
  },
  {
    jurisdictionKey: OKLAHOMA_CITY_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "document",
    title: "New construction must name its building class",
    description:
      "§ 60-12-9 prices new construction by five class rates — warehouse $0.19, commercial/office $0.28, industrial $0.28, residential $0.16, agricultural accessory with electrical connection only $0.05 per square foot — and the class is not derivable from a general occupancy label: \"commercial\" does not say whether the building is a warehouse or an office. The permit carries custom.building_class (warehouse, commercial, office, industrial, residential, agricultural_accessory) for exactly that reason, and withholding it produces no charge rather than a guessed one. The City directs applicants to the Plan Review Office to confirm classifications.",
    isMandatory: true,
    sortOrder: 20,
    sourceKey: OKC_T12_SOURCE_KEY,
    lastVerifiedAt: OKLAHOMA_CITY_LAST_VERIFIED,
  },
  {
    jurisdictionKey: OKLAHOMA_CITY_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "Development impact fees are assessed on new or additional square footage when the permit is issued",
    description:
      "\"In addition to the Building Permit Fees*, Development impact fees will be assessed based on new or additional square footage\" (the Permit Fees page). Streets: total building square footage excluding porches and garages, multiplied by the land-use row's rate in the six-by-four table for the project's streets assessment area. Parks: the same area excluding porches, garages and patios, at 53 cents per square foot, for residential development only. Fees are collected when the building permit is issued (deferral to certificate of occupancy is available on request); benefit areas bind where the money is spent. The City's own estimator exists, and the Plan Review Office confirms the category.",
    isMandatory: true,
    sortOrder: 30,
    sourceKey: OKC_IMPACT_SOURCE_KEY,
    lastVerifiedAt: OKLAHOMA_CITY_LAST_VERIFIED,
  },
  {
    jurisdictionKey: OKLAHOMA_CITY_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "license",
    title: "Contractor registration and the card surcharge are outside these totals",
    description:
      "Building contractor registration is $100/year — licensing rather than permitting. Sections 60-12-1 and 60-18-27 also impose a \"2.7 percent\" card service fee \"if payment is made with a credit or debit card\": a property of the payment channel, named here and charged nowhere.",
    isMandatory: false,
    sortOrder: 40,
    sourceKey: OKC_T12_SOURCE_KEY,
    lastVerifiedAt: OKLAHOMA_CITY_LAST_VERIFIED,
  },
  {
    jurisdictionKey: OKLAHOMA_CITY_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "other",
    title: "Amperage is what the add-on rows measure, and they measure it from 200",
    description:
      "Every branch that prints a base covering 200 amps measures its add-on from 200: residential $50.00 per each additional 100 amps or portion thereof over 200, commercial under 4,000 sq ft $40.50, commercial 4,000 sq ft or more $103.50. The excess rounds up to whole hundreds — 350 amps is two additional hundreds on the residential row. The service rows of § 60-18-16 read the same fact, and a permit that does not state an amperage is charged none of them rather than a guessed service size.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: OKC_T18_SOURCE_KEY,
    lastVerifiedAt: OKLAHOMA_CITY_LAST_VERIFIED,
  },
  {
    jurisdictionKey: OKLAHOMA_CITY_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "other",
    title: "Title 18 states no permit minimum",
    description:
      "The $75 minimums live in Title 12 § 60-12-7 and § 60-12-9 and do not reach across titles: an electrical permit under this chapter pays what its rows compute, with no floor, and the same is true of plumbing under Title 42. Registrations ($100 electrical contractor, annually) are licensing rather than permitting.",
    isMandatory: false,
    sortOrder: 20,
    sourceKey: OKC_T18_SOURCE_KEY,
    lastVerifiedAt: OKLAHOMA_CITY_LAST_VERIFIED,
  },
  {
    jurisdictionKey: OKLAHOMA_CITY_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    requirementType: "other",
    title: "One- and two-family is a fact, not an occupancy label",
    description:
      "§ 60-42-6's scope is \"one- and two-family dwellings and condominiums\" and § 60-42-9 excludes exactly that class — \"all structures except one-and-two-family dwellings and condominiums\" — so the exclusion is what defines the other side, and multifamily prices in the commercial section. The rules read custom.one_two_family for that switch, and the fixtures integral to a new dwelling are already inside its $83 base, which is why the $7 fixture row exists only on the other two schedules.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: OKC_T42_SOURCE_KEY,
    lastVerifiedAt: OKLAHOMA_CITY_LAST_VERIFIED,
  },
];

const profile: SeedProfile = {
  jurisdictionKey: OKLAHOMA_CITY_KEYS.jurisdiction,
  headline: "What construction permits cost in Oklahoma City",
  summary:
    "Oklahoma City prices construction out of **one ordinance chapter read against one impact-fee page**: alterations pay $6.00 per $1,000 of valuation (floor $75), new construction pays a per-square-foot class rate ($0.19 warehouse, $0.28 commercial/office/industrial, $0.16 residential, $0.05 agricultural accessory) under the same floor, demolition is priced by stories, and every permit carries the state's $0.50 OUBCC line. Plan review is 50% of the permit fee — paid on submission, credited against the total, never added.",
  localContext:
    "Two documents price Oklahoma City. Chapter 60 of the Code of Ordinances is one ordinance-book chapter holding all four trades' schedules; every section's history ends with Ordinance 27978, adopted November 18, 2025, which printed each fee table in two columns — one for July 1, 2025 through June 30, 2026 and one for July 1, 2026 and thereafter. The later column is in force now, and it is what these pages charge; the FY2025-26 figures ($164.90 residential electrical base, $78.40 residential alteration base, $74 first demolition story, $434 mobile home park, and the rest) are recorded in the research record and appear in no total. Sections that print a single amount carry the ordinance's own date.\n\nThe second document is the Development Impact Fees page — a separate instrument entirely. Streets fees are a six-by-four matrix: six land-use categories (Residential, Industrial, Office/Institutional/Lodging, and three Customer-Oriented bands) by four streets assessment areas (Rural, New Growth, Infill, Core), dollars per square foot of building excluding porches and garages. Parks fees are flat: 53 cents per square foot, residential development only. Both are collected when the building permit is issued, and the City dates them to January 2017 with an update every July 1 — whether the most recent update moved them is an open question, because no dated instrument checks it.\n\nOne reading decides how plan review appears on this site: § 60-12-6(b) says the 50% review fee \"will be credited towards the total permit fee, the remainder of which is due upon issuance of the permit\". A credit does not raise the total, so this site shows the payment schedule and never sums it — the same call Pittsburgh's 40% share required. The optional pre-application review and pre-construction meeting are named for the same reason: they are services you choose, not lines you owe.",
  valuationBasis:
    "Two bases, on two pages, and never both on one permit.\n\n**The alteration ladder reads valuation** — $6.00 per $1,000 under § 60-12-7 — and the rate prints no \"or fraction thereof\", so the per-thousand amount prorates: $1,500 of valuation computes $9.00 before the $75 floor. **New construction reads square footage** at the class rate of § 60-12-9, where the floor is stated as a rule minimum. **Demolition reads stories** — a count of them, $78.00 for the first and $12.00 for each additional story. **Electrical reads amperage and area**: the add-on rows measure from the 200 amps the base covers and round the excess up to whole hundreds, while the commercial schedules switch at 4,000 square feet. **Plumbing reads counts only** — bathrooms, fixtures, water and sewer service connections — so a plumbing total never moves because the job got more expensive.\n\n**The impact fees read area a third time**, from the square footage the applicant declares (porches, garages and patios excluded), multiplied by the land-use row and assessment area the reader supplies.",
  notIncluded:
    "These figures are Oklahoma City's own permit, inspection and impact-fee amounts for building, electrical and plumbing work. They are not a project cost, and they exclude:\n\n- **Mechanical permits (Title 29).** The forced-air tonnage bands ($31–$454), boiler bands, gasfitting rows and the gas service rows are read and recorded without a page in this pass.\n- **Plan review, as a charge.** § 60-12-6(b)'s 50% is credited against the permit total — a payment schedule, not an addition — and the optional pre-application ($150) and pre-construction meeting ($500) services are named rather than charged.\n- **Event-driven fees.** Reinspection/trip fee $50, address-change administration $43, temporary certificate of occupancy $250, after-hours inspection $175 and consultation $100 all attach to events this calculator does not model.\n- **The elevator and house-moving regimes.** § 60-12-11 prices elevators by device and test type; § 60-12-12 prices house moving by area with an advance inspection. Both are full regimes with their own tables, recorded without rules.\n- **Water and wastewater impact fees.** The page says the City charges them and publishes no table on the page read; streets and parks are the only two modelled.\n- **The parks credits and exemptions.** The 38% local-park waiver and the private-park exemption (Ord. 25374) each carry their own application process.\n- **The 2.7% card fee and contractor registration.** The card surcharge belongs to the payment channel; registration ($100/year) is licensing.",
  seoTitle: "Oklahoma City construction permit fees",
  seoDescription:
    "How Oklahoma City prices construction permits — $6.00 per $1,000 for alterations, per-square-foot class rates for new construction ($0.19–$0.28), demolition by story, the $0.50 state line, and streets and parks impact fees by land-use table.",
  publishStatus: "published",
  noindex: false,
  lastReviewedAt: OKLAHOMA_CITY_LAST_VERIFIED,
};

const permitPages: SeedPermitPage[] = [
  {
    jurisdictionKey: OKLAHOMA_CITY_KEYS.jurisdiction,
    permitTypeKey: "building",
    slug: "building-permit-cost",
    title: "Oklahoma City building permit cost",
    intro:
      "An Oklahoma City building permit is priced by **which of two sections answers the job**. Alterations, removal and repair pay $6.00 for each $1,000 of valuation under a $75 minimum (§ 60-12-7); new construction pays a per-square-foot class rate — $0.19 warehouse, $0.28 commercial/office/industrial, $0.16 residential, $0.05 agricultural accessory with electrical connection only — with the same $75 floor (§ 60-12-9). Demolition is priced by stories: $78.00 for the first, $12.00 for each additional story. Every permit adds the state's $0.50 OUBCC collection line, plan review is 50% of the permit fee credited against it rather than added, and development impact fees for streets and parks are assessed on the project's square footage when the permit is issued.",
    localSummary:
      "The class a building belongs to is asked directly, because \"commercial\" does not say whether the building is a warehouse or an office; with no class supplied, the new-construction rule answers nothing rather than guessing a rate. The alteration ladder's rate prints no \"or fraction thereof\", so the per-thousand amount prorates — $1,500 of valuation computes $9.00 before the $75 floor binds.\n\nTwo columns of figures have existed since Ordinance 27978 (November 18, 2025), and these pages charge the later one, in force since July 1, 2026: $78 instead of $74 for a first demolition story, $478 instead of $434 for a mobile home park. The FY2025-26 column is recorded and charged nowhere.\n\nDevelopment impact fees are the second instrument: streets at a six-by-four land-use-by-assessment-area table (for example, $0.47 per square foot for Residential in Rural or New Growth, $1.08 for Office/Institutional/Lodging in the Core) and parks at 53 cents per square foot for residential development only — both collected when the permit is issued, both excluding porches and garages from the square footage.",
    notIncluded:
      "This is Oklahoma City's building permit fee — the ladder or class-rate row that answers the job, the state's $0.50 line, and the streets and parks impact fees when the project's category is supplied. It excludes:\n\n- **Plan review, as an addition.** The 50% review fee is credited toward the total (§ 60-12-6(b)), so this total shows what is owed, not the schedule of payments; the optional pre-application review and pre-construction meeting are named.\n- **Mechanical, elevator and house-moving permits.** Title 29's tonnage and boiler bands, § 60-12-11's elevator regime and § 60-12-12's house-moving table are recorded without pages in this pass.\n- **Event fees.** Reinspection $50, address change $43, temporary CO $250, after-hours inspection $175, consultation $100 — attached to events, not to the permit calculation.\n- **Water and wastewater impact fees.** The City charges them and publishes no table on the page read.\n- **The parks waivers.** The 38% local-park area waiver and the private-park exemption each require their own application.\n- **The 2.7% card fee and contractor registration.** One belongs to the payment channel; the other is licensing.",
    workedExample: {
      scenario:
        "A new office building: 49,500 square feet, commercial occupancy, class office — with no land-use category supplied for impact fees.",
      inputs: {
        squareFootage: 49_500,
        occupancy: "commercial",
        workType: "new_construction",
        custom: { building_class: "office" },
      },
      notes:
        "One rate line and one state line — and the fifth line a reader expects is absent by design.\n\nThe class rate: § 60-12-9 prices office buildings at $0.28 per square foot, so 49,500 × $0.28 = $13,860.00, well above the $75.00 floor. The lookup is the schedule's own five-row table; \"office\" and \"commercial\" both land on the $0.28 row because the section prints them as one class.\n\nThe state line: $0.50 OUBCC under § 60-12-1, on every permit of every trade.\n\nPlan review: nothing — the 50% is a credit, not a charge, and crediting it cannot raise the total this page shows.\n\nImpact fees: nothing, because no land-use category or assessment area was supplied. Had it been supplied, streets would be the category's rate times the same 49,500 square feet (Office/Institutional/Lodging in the Core is $1.08, so $53,460.00) and parks would add 53 cents per square foot only for a Residential category.\n\nTotal: $13,860.00 + $0.50 = $13,860.50. What moves it: the same building as a warehouse pays $0.19 ($9,405.00); as a residential building $0.16 ($7,920.00); an alteration on an existing building instead of new construction switches sections entirely to $6.00 per $1,000 of valuation with the $75 floor; and a project under 75 square feet of new-construction area would be floored at $75.00.",
    },
    faqs: [
      {
        question: "How much is a building permit in Oklahoma City?",
        answer:
          "It depends on the section that answers the job. Alterations, removal and repair: $6.00 for each $1,000 of valuation, minimum $75.00. New construction: $0.19 per square foot for warehouses, $0.28 for commercial/office/industrial buildings, $0.16 for residential, $0.05 for agricultural accessory buildings with electrical connection only — minimum $75.00. Demolition: $78.00 for the first story plus $12.00 for each additional story. Every permit adds $0.50 for the state's Uniform Building Code Commission.",
        sourceId: OKC_T12_SOURCE_KEY,
      },
      {
        question: "Does plan review cost extra?",
        answer:
          "It changes when you pay, not what you pay. § 60-12-6(b) sets plan review at 50.0% of the total building permit fee (capped at $2,750.00), paid when the application is submitted — but the ordinance says it \"will be credited towards the total permit fee\", so the total is unchanged: half up front, the rest at issuance. The optional pre-application review ($150.00) and pre-construction meeting ($500.00) are separate services you choose to buy.",
        sourceId: OKC_T12_SOURCE_KEY,
      },
      {
        question: "What are development impact fees?",
        answer:
          "Streets and parks fees assessed on new or additional square footage when the building permit is issued. Streets: your square footage (excluding porches and garages) times the rate for your land-use category in your streets assessment area — six land-use rows by four areas, from $0.34 to $3.12 per square foot. Parks: 53 cents per square foot, residential development only. Both date to January 2017 with an annual July 1 update; the City's own estimator is linked from the Permit Fees page.",
        sourceId: OKC_IMPACT_SOURCE_KEY,
      },
      {
        question: "Which figures does this page charge — the 2025 or the 2026 column?",
        answer:
          "The 2026 column. Ordinance 27978 (adopted November 18, 2025) printed every affected table twice: fees effective July 1, 2025 through June 30, 2026, and fees effective July 1, 2026 and thereafter. The later column is in force, so demolition's first story is $78.00 (not $74.00) and the mobile home park minimum is $478.00 (not $434.00); the FY2025-26 figures are recorded in the research record and charged nowhere.",
        sourceId: OKC_T12_SOURCE_KEY,
      },
      {
        question: "Is there a minimum on the permit?",
        answer:
          "Yes, on the building page: both § 60-12-7's alteration ladder and § 60-12-9's class rates carry a $75.00 minimum. A tiny alteration that computes $9.00 pays $75.00. Title 12's floor does not reach across titles — electrical and plumbing permits state no minimum of their own.",
        sourceId: OKC_T12_SOURCE_KEY,
      },
      {
        question: "How is a demolition permit priced?",
        answer:
          "By stories, not by cost or area: $78.00 for the first story and $12.00 for each additional story (§ 60-12-8). A three-story teardown is $78.00 + $12.00 + $12.00 = $102.00, plus the $0.50 state line.",
        sourceId: OKC_T12_SOURCE_KEY,
      },
    ],
    seoTitle: "Oklahoma City building permit cost: $6 per $1,000 or class rates",
    seoDescription:
      "Oklahoma City building permit fees — $6.00 per $1,000 for alterations (floor $75), per-square-foot class rates for new construction ($0.19–$0.28), demolition by story, the $0.50 state line, and streets/parks impact fees.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: OKLAHOMA_CITY_LAST_VERIFIED,
  },
  {
    jurisdictionKey: OKLAHOMA_CITY_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    slug: "electrical-permit-cost",
    title: "Oklahoma City electrical permit cost",
    intro:
      "An Oklahoma City electrical permit is priced by **one of five regimes, chosen by occupancy, area and scope** — and Title 18 states no permit minimum. Residential new construction (§ 60-18-14) is a $175.00 base for a 240-volt single-phase service up to 200 amps, plus $50.00 for each additional 100 amps or portion, plus the required rough ($50) and final ($50) inspections. Commercial new construction splits at 4,000 square feet: $67.00 base with $40.50 amp rows below, $221.00 base with $103.50 amp rows at or above. Add-on and service-change rows take remodels, § 60-18-26 carries the miscellaneous rows (pool wiring, generator, photovoltaic, low-voltage, sign service), and every permit adds the state's $0.50 OUBCC line.",
    localSummary:
      "The amperage add-ons all measure from the same place — the 200 amps the base fee covers — and round the excess up to whole hundreds, \"or portion thereof\": a 350-amp residential service is two additional hundreds, $100.00. The 4,000-square-foot seam on the commercial side is a condition on the project's own area, and a project whose area is not stated falls to the smaller base so the permit is never silently free.\n\n§ 60-18-12's five-outlet permit is the one row that excludes the others: its own scope words — \"unrelated to building permits and requiring no change in service\" — make it standalone, and while it is selected the branch regimes stand down. Both occupancy classes print the same $100 figure.\n\nNo minimum applies. The $75 floors live in Title 12 (§ 60-12-7 and § 60-12-9) and do not reach across titles, so an electrical permit here pays exactly what its rows compute — which is why a small service change can cost less than a building permit's floor.",
    notIncluded:
      "This is Title 18's electrical permit fee — the regime rows, the amperage add-ons, the inspection pair and the state's $0.50 line. It excludes:\n\n- **The permit floor that does not exist.** Title 18 states no minimum; the $75 minimums are Title 12's and reach only building permits.\n- **The service-size add-on on commercial service changes.** § 60-18-24(c) prices the size *added*, which is not an input this engine has — that piece is named rather than priced against total amperage.\n- **Partial-rough inspections.** The \"slab, wall, service, etc.\" row is conditional on a stage the input does not know; reinspection and after-hours fees are event-driven.\n- **Miscellaneous rows without their triggers.** Water-well service $50, temporary heat $29.50, carnival service $84, booth spaces $75, after-hours inspection $175 and consultation $100 are named in the research record.\n- **Contractor registration and the card fee.** The $100/year electrical contractor registration is licensing; the 2.7% card surcharge belongs to the payment channel.\n- **Mechanical permits.** Title 29 is read and recorded without a page in this pass.",
    workedExample: {
      scenario:
        "A commercial new-construction electrical permit: 5,000 square feet, 400-amp service, no standalone rows selected.",
      inputs: {
        squareFootage: 5_000,
        occupancy: "commercial",
        workType: "new_construction",
        custom: { amperage: 400 },
      },
      notes:
        "Four lines from § 60-18-22 and the state line — $476.50.\n\nBase: 5,000 square feet is at or above the 4,000-square-foot seam, so the large branch answers: $221.00.\n\nAmperage: \"each additional 100 amperes or portion over 200 — $103.50\". 400 amps is 200 amps over the base's 200, exactly two hundreds — $207.00. (350 amps would round 150 up to 200 and also pay $207.00; 200 amps or fewer pays nothing here.)\n\nInspections: the schedule lists them as lines of the fee — rough $22.50 and final $25.50 — because § 60-18-22 prints \"plus, for required inspection\" beside them.\n\nState: $0.50 OUBCC under § 60-18-27.\n\nTotal: $221.00 + $207.00 + $22.50 + $25.50 + $0.50 = $476.50. What moves it: the same job at 3,999 square feet switches to the small branch ($67 base, $40.50 amp rows, $20.50/$27 inspections — $246.50 total); at 200 amps the amp row disappears entirely; a residential version of the same job would price under § 60-18-14 at $175 + amps + $100 of inspections; and nothing here is floored, because Title 18 states no minimum.",
    },
    faqs: [
      {
        question: "How much is an electrical permit in Oklahoma City?",
        answer:
          "By regime. Residential new construction: $175.00 base (service up to 200 amps) plus $50.00 per each additional 100 amps or portion, plus $50 rough and $50 final. Commercial new construction: $67.00 under 4,000 sq ft or $221.00 at/above it, plus $40.50 or $103.50 per additional 100 amps over 200, plus the rough/final pair ($20.50/$27 or $22.50/$25.50). Add-ons and service changes run $93–$201 by area or $100 residential; miscellaneous rows (pool, generator, photovoltaic, low-voltage, sign) are $93–$120. Every permit adds $0.50 for the state.",
        sourceId: OKC_T18_SOURCE_KEY,
      },
      {
        question: "Is there a minimum on the electrical permit?",
        answer:
          "No. Title 18 states no permit floor — the $75 minimums live in Title 12 § 60-12-7 and § 60-12-9 and apply to building permits only. An electrical permit pays exactly what its rows compute.",
        sourceId: OKC_T18_SOURCE_KEY,
      },
      {
        question: "How are amps charged?",
        answer:
          "Every add-on row measures from 200 — the amount the base fee already covers — and rounds the excess up to whole hundreds: residential and service rows are $50.00 per additional 100 amps or portion, commercial under 4,000 sq ft is $40.50, commercial 4,000 sq ft and up is $103.50. A 400-amp commercial service is two additional hundreds, $207.00; a 350-amp one rounds 150 up to 200 and also pays $207.00.",
        sourceId: OKC_T18_SOURCE_KEY,
      },
      {
        question: "Why does the price jump at 4,000 square feet?",
        answer:
          "Because §§ 60-18-20 and 60-18-22 are two schedules, not one: under 4,000 sq ft the base is $67.00 with $40.50 amp rows and $20.50/$27 inspections; at 4,000 sq ft or more the base is $221.00 with $103.50 amp rows and $22.50/$25.50 inspections. The seam is a condition on the project's own area, so an unstated area falls to the smaller base rather than to a free permit.",
        sourceId: OKC_T18_SOURCE_KEY,
      },
      {
        question: "Do I need a permit for five outlets?",
        answer:
          "§ 60-18-12 prices \"Five outlets or less, unrelated to building permits and requiring no change in service\" at $100.00 — and its scope makes it standalone: while that row is selected, the branch regimes stand down. If the work touches a building permit or changes service, the branch schedule prices it instead.",
        sourceId: OKC_T18_SOURCE_KEY,
      },
    ],
    seoTitle: "Oklahoma City electrical permit cost: no minimum, $175 base",
    seoDescription:
      "Oklahoma City electrical permit fees — $175 residential new-construction base with $50 per additional 100 amps, commercial split at 4,000 sq ft ($67/$221), rough/final inspections, and the $0.50 state line. Title 18 states no minimum.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: OKLAHOMA_CITY_LAST_VERIFIED,
  },
  {
    jurisdictionKey: OKLAHOMA_CITY_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    slug: "plumbing-permit-cost",
    title: "Oklahoma City plumbing permit cost",
    intro:
      "An Oklahoma City plumbing permit is **three schedules split by the sections' own scope words, under no minimum, and no valuation anywhere**. A one- or two-family dwelling's new construction (§ 60-42-6) is an $83.00 base with all fixtures already inside it, plus $28.50 for each bathroom more than one and $15.00 per water and per sewer service. Residential alterations and additions (§ 60-42-7) are an $84.00 base plus $7.00 per fixture and $25.50 per connection (2026 column). Everything the first section excludes — multifamily and commercial among them (§ 60-42-9) — is a $120.00 base plus the same $7 and $25.50 rows. Special fees (§ 60-42-10) hang off their own facts, and every permit adds the state's $0.50 OUBCC line.",
    localSummary:
      "The scope words do the switching: § 60-42-6's class is \"one- and two-family dwellings and condominiums\", § 60-42-9 excludes exactly that class — so the exclusion defines the other side, and multifamily prices at the commercial base. The rules read a single fact, custom.one_two_family, for that switch.\n\nNothing here reads a price of work. Bathrooms, fixtures and service connections are counts, so a plumbing total never moves because the job got more expensive: three bathrooms on a new dwelling are two chargeable bathrooms at $28.50 (the first is inside the $83 base), and a house with both a water and a sewer lateral pays the $15 pair.\n\nThe 2026 column shows on this page in one place — the alteration base is $84.00 rather than FY2025-26's $78.40 — and the state line is the same $0.50 the other two titles repeat. Title 42 states no permit minimum: the $75 floors are Title 12's and stop at the building page.",
    notIncluded:
      "This is Title 42's plumbing permit fee — the schedule rows for fixtures, bathrooms and service connections, the special fees the job's facts select, and the state's $0.50 line. It excludes:\n\n- **A permit floor that does not exist here.** Title 42 states no minimum; the $75 minimums are Title 12's.\n- **Line extensions over ten feet.** § 60-42-7 prices them at $100 each (2026 column) — a count of lines this engine has no kind for, recorded rather than flattened.\n- **The washing-machine tiers, carwash and slaughterhouse traps.** One machine $15, two to seven $25.50, seven to fifteen $116 — tiered on counts the row does not share with fixtures; carwash, slaughterhouse traps and building-move alteration are $28.50 rows without input triggers.\n- **Event rows.** Consultation $100 and after-hours inspection $175 (both 2026 column) attach to events, not to the permit calculation.\n- **Contractor registration and travel.** The $100/year registration and the outside-of-city travel fee are licensing and event rows.\n- **The 2.7% card fee.** It belongs to the payment channel.",
    workedExample: {
      scenario:
        "A new one- and two-family dwelling with three bathrooms, one water service and one sewer service.",
      inputs: {
        occupancy: "residential",
        workType: "new_construction",
        custom: {
          one_two_family: true,
          bathrooms: 3,
          water_service_connections: 1,
          connections: 1,
        },
      },
      notes:
        "Four lines from § 60-42-6 and the state line — $170.50.\n\nBase: $83.00, \"all fixtures integral to the structure\" already inside it — which is why no fixture row appears on this schedule.\n\nBathrooms: \"each bathroom more than one (or part thereof) — $28.50\". Three bathrooms are two beyond the first: $57.00.\n\nServices: \"$15 per water and sewer service\" — one water lateral and one sewer lateral, $30.00 together, priced as two counts so a sewer-only or water-only job pays only its half.\n\nState: $0.50 OUBCC.\n\nTotal: $83.00 + $57.00 + $30.00 + $0.50 = $170.50. What moves it: one bathroom and one service would be $83 + $0.50 = $83.50; a fourth bathroom adds another $28.50 (the row counts whole bathrooms after the first, and \"or part thereof\" keeps a half-finished bath in the count); the same job as an alteration switches to § 60-42-7's $84 base with $7 fixture and $25.50 connection rows; and a multifamily version would price in § 60-42-9 at $120 — the exclusion is what moves it. Nothing here is floored, because Title 42 states no minimum.",
    },
    faqs: [
      {
        question: "How much is a plumbing permit in Oklahoma City?",
        answer:
          "By schedule. One-/two-family new construction: $83.00 base (fixtures included), plus $28.50 for each bathroom more than one, plus $15.00 per water and per sewer service. Residential alteration or addition: $84.00 base plus $7.00 per fixture plus $25.50 per connection. Commercial and multifamily: $120.00 base plus the same $7 and $25.50 rows. Special rows: dishwasher/garbage disposal/interceptor $15, yard sprinkler $30, fire protection yard line $100. Every permit adds $0.50 for the state.",
        sourceId: OKC_T42_SOURCE_KEY,
      },
      {
        question: "Is the fee based on the value of the work?",
        answer:
          "No. Title 42 reads counts only — bathrooms, fixtures, water and sewer service connections — plus its flat rows. Nothing on this page changes because the job got more expensive; only the building ladder (Title 12) reads a valuation.",
        sourceId: OKC_T42_SOURCE_KEY,
      },
      {
        question: "Does a multifamily building pay the residential rate?",
        answer:
          "No. § 60-42-6's scope is one- and two-family dwellings and condominiums, and § 60-42-9 prices \"all structures except one-and-two-family dwellings and condominiums\" — the exclusion is what moves multifamily to the $120 commercial base, even though the building is residential in every other sense.",
        sourceId: OKC_T42_SOURCE_KEY,
      },
      {
        question: "Are the fixtures charged separately on a new dwelling?",
        answer:
          "No — they are inside the $83.00 base: the section says \"all fixtures integral to the structure\". The $7.00-per-fixture row lives on the alteration schedule (§ 60-42-7) and the commercial schedule (§ 60-42-9), where the base does not include them.",
        sourceId: OKC_T42_SOURCE_KEY,
      },
      {
        question: "Is there a minimum on the plumbing permit?",
        answer:
          "No. Title 42 states no permit floor. The $75 minimums belong to Title 12's building ladder (§ 60-12-7 and § 60-12-9) and do not reach across titles — so a plumbing permit pays exactly its rows plus the state's $0.50.",
        sourceId: OKC_T42_SOURCE_KEY,
      },
    ],
    seoTitle: "Oklahoma City plumbing permit cost: $83–$120 bases",
    seoDescription:
      "Oklahoma City plumbing permit fees — $83 one-/two-family new-construction base with $28.50 bathrooms and $15 services, $84 alterations, $120 commercial/multifamily, $7 per fixture, and the $0.50 state line. No valuation, no minimum.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: OKLAHOMA_CITY_LAST_VERIFIED,
  },
];

const verifications: SeedVerification[] = [
  {
    entityType: "source",
    entityKey: OKC_T12_SOURCE_KEY,
    status: "verified",
    method: "manual_review",
    verifiedAt: OKLAHOMA_CITY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: OKC_T12_SOURCE_KEY,
    notes:
      "Read 2026-09-26 through the codifier, section by section: § 60-12-1's misc rows and the OUBCC line, § 60-12-6's credited plan review, the § 60-12-7 ladder, demolition by story and § 60-12-9's five class rates — with Ord. 27978's two column headers read as the dates they are.",
  },
  {
    entityType: "source",
    entityKey: OKC_T18_SOURCE_KEY,
    status: "verified",
    method: "manual_review",
    verifiedAt: OKLAHOMA_CITY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: OKC_T18_SOURCE_KEY,
    notes:
      "Read 2026-09-26: all five regimes and § 60-18-12's standalone row, every amperage add-on traced to the base's own 200-amp parenthetical, the 4,000 sq ft seam read from both sections, and the absence of any minimum confirmed by the title's own text.",
  },
  {
    entityType: "source",
    entityKey: OKC_T42_SOURCE_KEY,
    status: "verified",
    method: "manual_review",
    verifiedAt: OKLAHOMA_CITY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: OKC_T42_SOURCE_KEY,
    notes:
      "Read 2026-09-26: the three schedules' scope words read against each other so the one-/two-family exclusion defines the commercial side, § 60-42-10's special rows, and § 60-42-11's state line.",
  },
  {
    entityType: "source",
    entityKey: OKC_IMPACT_SOURCE_KEY,
    status: "verified",
    method: "manual_review",
    verifiedAt: OKLAHOMA_CITY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: OKC_IMPACT_SOURCE_KEY,
    notes:
      "Read 2026-09-26: the six-by-four streets table transcribed cell by cell, the parks rate and its residential-only scope, the January 2017 origin with annual July 1 updates, and the square-footage exclusions (porches, garages, patios) recorded on both rules.",
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-NEW-CLASS",
    permitTypeKey: "building",
    status: "verified",
    method: "manual_review",
    verifiedAt: OKLAHOMA_CITY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: OKC_T12_SOURCE_KEY,
    notes:
      "§ 60-12-9's five class rates as one published lookup over custom.building_class, the $75 floor on the rule, and the honest exclusion when the class is unknown — asserted by the worked example's $13,860.00 office line.",
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-ALTER",
    permitTypeKey: "building",
    status: "verified",
    method: "manual_review",
    verifiedAt: OKLAHOMA_CITY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: OKC_T12_SOURCE_KEY,
    notes:
      "§ 60-12-7's $6.00 per $1,000 with no \"or fraction thereof\" — the prorating reading asserted from both sides: $1,500 computes $9.00 and pays the $75 floor, $2,000,000 computes $12,000.00 and does not.",
  },
  {
    entityType: "fee_rule",
    entityKey: "ELEC-COMM-NEW-LARGE-AMPS",
    permitTypeKey: "electrical",
    status: "verified",
    method: "manual_review",
    verifiedAt: OKLAHOMA_CITY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: OKC_T18_SOURCE_KEY,
    notes:
      "$103.50 per each additional 100 amperes or portion over 200 — threshold 200, increment 100 — so 400 amps pays exactly $207.00 and 350 rounds to the same two hundreds; asserted by the worked example's $476.50 total.",
  },
  {
    entityType: "fee_rule",
    entityKey: "IMPACT-STREETS",
    permitTypeKey: "building",
    status: "verified",
    method: "manual_review",
    verifiedAt: OKLAHOMA_CITY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: OKC_IMPACT_SOURCE_KEY,
    notes:
      "The six-by-four table stored as the schedule's own rateTables product — land use × assessment area — both facts required for the lookup to answer, and the profile's example cells ($0.47 Residential/Rural, $1.08 Office/Core) transcribed from the page read on 2026-09-26.",
  },
  {
    entityType: "fee_rule",
    entityKey: "PL-RES-NEW-BATHROOMS",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "manual_review",
    verifiedAt: OKLAHOMA_CITY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: OKC_T42_SOURCE_KEY,
    notes:
      "\"Each bathroom more than one (or part thereof) — $28.50\" as a per-unit row with the first bathroom in the allowance (thresholdUnits 1); three bathrooms pay two, asserted by the worked example's $170.50.",
  },
  {
    entityType: "permit_page",
    entityKey: "building-permit-cost",
    permitTypeKey: "building",
    status: "verified",
    method: "manual_review",
    verifiedAt: OKLAHOMA_CITY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: OKC_T12_SOURCE_KEY,
    notes:
      "Gate-checked 2026-09-26: Chapter 60's Title 12 read in full beside the impact-fee page; the worked example reproduces $13,860.50 (class rate $13,860.00 + state $0.50) with plan review correctly absent as a credit and impact fees correctly absent without a category; both Ord. 27978 column headers quoted as the dates they are.",
  },
  {
    entityType: "permit_page",
    entityKey: "electrical-permit-cost",
    permitTypeKey: "electrical",
    status: "verified",
    method: "manual_review",
    verifiedAt: OKLAHOMA_CITY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: OKC_T18_SOURCE_KEY,
    notes:
      "Gate-checked 2026-09-26 against Title 18: the five regimes gated by the schedule's own scope words, the 200-amp thresholds and whole-hundred round-ups on all three amp rows, no minimum anywhere in the title, and the worked example's $476.50 ($221 + $207 + $22.50 + $25.50 + $0.50) reproduced cent for cent.",
  },
  {
    entityType: "permit_page",
    entityKey: "plumbing-permit-cost",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "manual_review",
    verifiedAt: OKLAHOMA_CITY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: OKC_T42_SOURCE_KEY,
    notes:
      "Gate-checked 2026-09-26 against Title 42: the three schedules split on custom.one_two_family so the first section's exclusion defines the commercial side, no valuation read anywhere, no floor in the title, and the worked example's $170.50 ($83 + $57 + $30 + $0.50) reproduced cent for cent.",
  },
  {
    entityType: "jurisdiction_profile",
    entityKey: OKLAHOMA_CITY_KEYS.jurisdiction,
    status: "verified",
    method: "manual_review",
    verifiedAt: OKLAHOMA_CITY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: OKC_PERMIT_PAGE_SOURCE_KEY,
    notes:
      "The profile states the readings the model depends on — two-column figures charged at the 2026 column, plan review as a credit, impact fees as a second instrument keyed on the reader's category — and keeps every document fact a reader would trip on: the January 2017 impact-fee origin with no dated instrument for the last update, and the mechanical title read without a page.",
  },
];

export const oklahomaCitySeed: JurisdictionSeed = {
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
export const OKLAHOMA_CITY_PUBLISHED_PERMIT_PAGES = oklahomaCitySeed.permitPages.filter(
  (page) => page.publishStatus === "published" && !page.noindex,
);
