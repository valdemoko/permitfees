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
  TOLEDO_ALTERATION_PAGE_SOURCE_KEY,
  TOLEDO_APPLICATION_EFFECTIVE_FROM,
  TOLEDO_APPLICATION_SOURCE_KEY,
  TOLEDO_BUILDING_RULES,
  TOLEDO_BUILDING_SURCHARGE_RULES,
  TOLEDO_CODE_EFFECTIVE_FROM,
  TOLEDO_CODE_SOURCE_KEY,
  TOLEDO_DEPARTMENT_SOURCE_KEY,
  TOLEDO_ELECTRICAL_RULES,
  TOLEDO_PLUMBING_RULES,
} from "./fee-rules";

export * from "./fee-rules";

/**
 * The complete Toledo, Ohio seed payload.
 *
 * Every figure traces to research/ohio/toledo.md, which traces to Chapter 1307 of
 * the Toledo Municipal Code (Ord. 476-18), the City's building-permit application
 * worksheet, and the Commercial Building Alteration page whose worked example —
 * $1,414.00 for a 5,000 sq ft alteration — this jurisdiction reproduces to the cent.
 *
 * Three pages, all published: building, electrical and plumbing. Toledo is the
 * jurisdiction where the website's own fee prose prints two rates swapped (plan
 * review at $.20, building permit at $.03) while its table, the code and the
 * application form all say the reverse — the swap is documented, the code's figures
 * are charged, and the surcharge base (plan review + permit, certificate outside) is
 * asserted from the City's own table arithmetic.
 */

const RESEARCHER = "Permit Fee Intelligence research pass 14 (Ohio)";

export const TOLEDO_LAST_VERIFIED = "2026-09-25";

export const TOLEDO_KEYS = {
  state: "oh",
  county: "lucas-county",
  jurisdiction: "toledo",
  codeSchedule: "toledo-chapter-1307-fees",
  formSchedule: "toledo-permit-application-worksheet",
} as const;

const state: SeedState = {
  code: "OH",
  slug: "ohio",
  name: "Ohio",
  fipsCode: "39",
};

const county: SeedCounty = {
  key: TOLEDO_KEYS.county,
  slug: "lucas-county",
  name: "Lucas County",
  fipsCode: "39095",
};

const jurisdiction: SeedJurisdiction = {
  key: TOLEDO_KEYS.jurisdiction,
  stateKey: TOLEDO_KEYS.state,
  countyKey: TOLEDO_KEYS.county,
  type: "city",
  slug: "toledo",
  name: "Toledo",
  officialName: "City of Toledo",
  websiteUrl: "https://toledo.oh.gov/",
  permitPortalUrl: "https://applyforpermits.toledo.oh.gov/portal",
  timezone: "America/New_York",
  isActive: true,
};

const departments: SeedDepartment[] = [
  {
    key: "toledo-division-building-inspection",
    jurisdictionKey: TOLEDO_KEYS.jurisdiction,
    kind: "building",
    name: "City of Toledo — Division of Building Inspection",
    phone: "(419) 245-1220",
    email: null,
    url: "https://toledo.oh.gov/business/how-to-build-in-the-city/permits",
    addressLine: "One Government Center, 640 Jackson St. Suite 1600, Toledo, OH 43604",
    hours: "8 a.m. to 3 p.m., Monday – Friday",
    notes:
      "The department page prints the counter hours and address above; its contact block carries 419-245-1220 as the main line and 419-245-1326 as a second. Chapter 1307 is the Division's fee chapter, and the application form names the Division as the body that accepts the filing. Commercial plans are \"reviewed by City staff or an approved third-party review agency\" with reviews \"usually completed within 30 days\", per the alteration page. The online portal (applyforpermits.toledo.oh.gov) is where applications are filed; the Division still accepts complete applications in person at the counter.",
  },
];

const sources: SeedSource[] = [
  {
    key: TOLEDO_CODE_SOURCE_KEY,
    jurisdictionKey: TOLEDO_KEYS.jurisdiction,
    title: "Toledo Municipal Code Chapter 1307 — Fees (1307.01 through 1307.14)",
    url: "https://codelibrary.amlegal.com/codes/toledo/latest/toledo_oh/0-0-0-108691",
    sourceType: "municipal_code",
    issuingAuthority: "City of Toledo",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2018-12-04",
    effectiveFrom: TOLEDO_CODE_EFFECTIVE_FROM,
    retrievedAt: TOLEDO_LAST_VERIFIED,
    lastVerifiedAt: TOLEDO_LAST_VERIFIED,
    notes:
      "Read 2026-09-25 in full through the rendered codifier (the host 403s plain fetchers, so every section was read in a browser session and the list taken from the chapter's own table of contents): 1307.01 general, 1307.02 permit fees (a)–(k), 1307.03 plan review and ESPP, 1307.04 electrical, 1307.05 plumbing, 1307.06–07 HVAC and refrigeration, 1307.08 refunds, 1307.09 → Chapter 1319, 1307.10 reinspection, 1307.11 special services, 1307.12 pools, 1307.13 state fees, 1307.14 copying. Every section carries (Ord. 476-18. Passed 12-4-18.). Two internal cross-reference errors are recorded as found: 1307.03(a)(2) cites \"section 1307.08(a)\" for plan-review fees while 1307.08(a) is the refund clause, and 1307.12(c) cites \"Section 1307.03(C)(11)\" for pool bonding while that fee is 1307.04(c)(11).",
  },
  {
    key: TOLEDO_APPLICATION_SOURCE_KEY,
    jurisdictionKey: TOLEDO_KEYS.jurisdiction,
    title: "City of Toledo — Building Permit application (fee worksheet and valuation definition)",
    url: "https://toledo.oh.gov/business/how-to-build-in-the-city/permits/building-permits",
    sourceType: "fee_schedule_pdf",
    issuingAuthority: "City of Toledo — Division of Building Inspection",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: TOLEDO_APPLICATION_EFFECTIVE_FROM,
    retrievedAt: TOLEDO_LAST_VERIFIED,
    lastVerifiedAt: TOLEDO_LAST_VERIFIED,
    notes:
      "Read 2026-09-25 from the application PDF the City's permits pages link. It carries the valuation definition this jurisdiction quotes (\"Valuation is the total cost of general contract, or the appraised market value of the project, including material and labor. Exclude cost of mechanical and electrical work for which separate permits are required\"), the fee worksheet in payment order (Building Permit, Plan Review, Subtotal, State of Ohio Surcharge 1% or 3%, Certificate of Occupancy / Partial / Completion $75 each, Other Fees, Total), and both base-plus-area rows for residential and commercial — plus the one figure Chapter 1307 does not print: the exterior non-structural row's \"($60 Residential $95 Commercial each)\". The worksheet's ordering is what fixes the surcharge base used in this jurisdiction's model.",
  },
  {
    key: TOLEDO_ALTERATION_PAGE_SOURCE_KEY,
    jurisdictionKey: TOLEDO_KEYS.jurisdiction,
    title: "City of Toledo — Commercial Building Alteration permit page (fee prose and worked example)",
    url: "https://toledo.oh.gov/business/how-to-build-in-the-city/permits/building-permits/commercial-building-alteration",
    sourceType: "municipal_website",
    issuingAuthority: "City of Toledo",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: TOLEDO_APPLICATION_EFFECTIVE_FROM,
    retrievedAt: TOLEDO_LAST_VERIFIED,
    lastVerifiedAt: TOLEDO_LAST_VERIFIED,
    notes:
      "Read 2026-09-25. The page's worked example — plan review $75 + $.03 × 5,000 = $225; building permit $75 + $.20 × 5,000 = $1,075; state surcharge $1,300 × .03 = $39; certificate of occupancy $75; estimated total $1,414 — is reproduced cent for cent by this jurisdiction's building worked example, and it settles what \"3% of total\" means: the base is plan review + permit, with the certificate listed after the surcharge. The page's fee prose, however, prints the two rates swapped (\"The Plan Review fee is $75 + $.20 per sq. ft. The Commercial Building Permit fee is $75 + $.03 per sq. ft\") — contradicted by the table directly below it, by § 1307.03(a)(1) and § 1307.02(b), and by the application form. The code's figures are charged; the swap is documented. Two smaller conflicts: the page's \"$103 Amendment fee\" against the code's $100, and its \"standard inspection fee is $75 / expedited inspection fee is $150\" which appears nowhere in Chapter 1307 (the page-only pair is recorded, not modelled).",
  },
  {
    key: TOLEDO_DEPARTMENT_SOURCE_KEY,
    jurisdictionKey: TOLEDO_KEYS.jurisdiction,
    title: "City of Toledo — permits index and Division of Building Inspection pages",
    url: "https://toledo.oh.gov/business/how-to-build-in-the-city/permits",
    sourceType: "municipal_website",
    issuingAuthority: "City of Toledo",
    authorityKind: "city",
    isPrimary: false,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: TOLEDO_LAST_VERIFIED,
    lastVerifiedAt: TOLEDO_LAST_VERIFIED,
    notes:
      "Read 2026-09-25 with the demolition, certificate-of-occupancy, building-permits and department pages. The department page supplies the counter address, hours and the 419-245-1220 line; the permits index supplies the portal URL and the \"when a permit is not required\" anchor; the alteration page (separately sourced) supplies the in-person filing note. The site carries no electrical or plumbing fee page at all — those fees exist only in the code and on the application form, which the research record states explicitly.",
  },
];

/** Empty on purpose: the permit types Toledo uses already exist as shared rows. */
const permitTypes: JurisdictionSeed["permitTypes"] = [];
const projectTypes: JurisdictionSeed["projectTypes"] = [];

const jurisdictionPermitTypes: SeedJurisdictionPermitType[] = [
  {
    jurisdictionKey: TOLEDO_KEYS.jurisdiction,
    permitTypeKey: "building",
    isAvailable: true,
    localName: "Building permit — base + $0.20 per gross square foot, plan review at $0.03",
    officialUrl: "https://toledo.oh.gov/business/how-to-build-in-the-city/permits/building-permits",
    notes:
      "§ 1307.02 prices building work on area, not cost: $60 base (residential 1–3) or $75 base (commercial and 4+ family) plus $0.20 per gross square foot, with a 100 sq ft minimum per alteration. Plan review under § 1307.03 is its own line — $50 or $75 base plus $0.03 per square foot — and the City's own worked example shows the two rates in that pairing (its prose prints them swapped; its table, the code and the application form agree with each other). Demolition is priced on cubic feet in three bands, and every permit subject to the OBC or RCO adds the state surcharge: 1% residential, 3% commercial.",
  },
  {
    jurisdictionKey: TOLEDO_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    isAvailable: true,
    localName: "Electrical permit — per-unit bases with amperage additions, $75 minimum",
    officialUrl: "https://toledo.oh.gov/business/how-to-build-in-the-city/permits",
    notes:
      "§ 1307.04(c): $90 per unit new residential, $60 base per unit existing residential, $100 base per unit commercial — each with the chapter's parenthetical additions, of which the service row ($0.50 per amp, all occupancies) is the one this engine charges from the filing's amperage. The $75 minimum applies to any permit. Motors by horsepower, generators by kilowatt and the registration fees are printed in the chapter and recorded; none is charged (no horsepower or kilowatt basis exists, and registrations are licensing).",
  },
  {
    jurisdictionKey: TOLEDO_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    isAvailable: true,
    localName: "Plumbing permit — base + $6 per additional fixture, $75 minimum",
    officialUrl: "https://toledo.oh.gov/business/how-to-build-in-the-city/permits",
    notes:
      "§ 1307.05(c): commercial $100 base + $6.00 each fixture; residential new $90 base + $6.00 each additional fixture; residential existing $65 base + $6.00 each additional fixture — the residential rows include the first fixture in their base, the commercial row does not, because the chapter's own words differ. Backflow surveys are priced by category (I $100 annual, II $75 per two years), and the $75 minimum applies to any permit. Hydronic rows are denominated in BTU and recorded unmodelled.",
  },
];

const feeSchedules: SeedFeeSchedule[] = [
  {
    key: TOLEDO_KEYS.codeSchedule,
    jurisdictionKey: TOLEDO_KEYS.jurisdiction,
    sourceKey: TOLEDO_CODE_SOURCE_KEY,
    title: "Toledo Municipal Code Chapter 1307 — Fees",
    officialUrl: "https://codelibrary.amlegal.com/codes/toledo/latest/toledo_oh/0-0-0-108691",
    effectiveFrom: TOLEDO_CODE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: TOLEDO_LAST_VERIFIED,
    notes:
      "Ord. 476-18, passed 12-4-18 — every section of the chapter carries it, and every code-sourced rule validates against this row. The chapter is where all three of this jurisdiction's permit pages get their rates.",
  },
  {
    key: TOLEDO_KEYS.formSchedule,
    jurisdictionKey: TOLEDO_KEYS.jurisdiction,
    sourceKey: TOLEDO_APPLICATION_SOURCE_KEY,
    title: "City of Toledo — Building Permit application fee worksheet",
    officialUrl:
      "https://toledo.oh.gov/business/how-to-build-in-the-city/permits/building-permits",
    effectiveFrom: TOLEDO_APPLICATION_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: TOLEDO_LAST_VERIFIED,
    notes:
      "Undated on its face, so effective from the day it was read. The form carries the valuation definition, the payment ordering this jurisdiction's surcharge base follows, and the $95 commercial exterior rate the chapter does not print — the one rule sourced to it.",
  },
];

function attach(permitTypeKey: string, rules: SeedFeeRule["rule"][], scheduleKey: string): SeedFeeRule[] {
  return rules.map((rule) => ({
    jurisdictionKey: TOLEDO_KEYS.jurisdiction,
    permitTypeKey,
    scheduleKey,
    rule,
  }));
}

const feeRules: SeedFeeRule[] = [
  ...attach("building", TOLEDO_BUILDING_RULES, TOLEDO_KEYS.codeSchedule),
  ...attach("building", TOLEDO_BUILDING_SURCHARGE_RULES, TOLEDO_KEYS.codeSchedule),
  ...attach("electrical", TOLEDO_ELECTRICAL_RULES, TOLEDO_KEYS.codeSchedule),
  ...attach("plumbing", TOLEDO_PLUMBING_RULES, TOLEDO_KEYS.codeSchedule),
];

const requirements: SeedRequirement[] = [
  {
    jurisdictionKey: TOLEDO_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "The building fee is area-based; valuation feeds only the ESPP",
    description:
      "Chapter 1307's building rows read gross square footage, not cost: $60 or $75 base plus $0.20 per gross square foot. Valuation appears once in the chapter's own fee text — the Early Start Phased Permit's \"one half of one percent (.005) of the building permit valuation\" — and the application form defines that valuation as \"the total cost of general contract, or the appraised market value of the project, including material and labor\", excluding mechanical and electrical work permitted separately. A permit's total here therefore never changes because the job got more expensive; only its area moves it.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: TOLEDO_APPLICATION_SOURCE_KEY,
    lastVerifiedAt: TOLEDO_LAST_VERIFIED,
  },
  {
    jurisdictionKey: TOLEDO_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "zoning_review",
    title: "A Certificate of Zoning Compliance is its own prerequisite — and its own $50 line",
    description:
      "§ 1307.02's opening: a Certificate of Zoning Compliance \"shall be required for all new construction of buildings or structures and/or new additions… for all residential and commercial accessory structures, ramps, decks, regardless of size, for all fences regardless of height, and all pools greater than 24\\\" in depth\" — priced at $50 under (k). The certificate lines (CZC, Certificate of Occupancy $75) sit outside the state surcharge's base, which is exactly how the application worksheet orders its rows: Subtotal, Surcharge, Certificate, Total.",
    isMandatory: true,
    sortOrder: 20,
    sourceKey: TOLEDO_CODE_SOURCE_KEY,
    lastVerifiedAt: TOLEDO_LAST_VERIFIED,
  },
  {
    jurisdictionKey: TOLEDO_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "document",
    title: "Plans must be approved before the permit issues; ESPP is the early-start exception",
    description:
      "The City's own pages: \"Plans must be approved before a building permit can be issued and construction may begin\", with most projects requiring architectural, structural and MEP drawings. § 1307.03(c) offers the Early Start Phased Permit instead — interior alterations at the rough-in stage while plans review, at 0.5% of the building permit valuation (minimum $100) or $100 for a trade permit, \"performed at the applicant's risk\", expiring on permit issuance or after ninety days.",
    isMandatory: false,
    sortOrder: 30,
    sourceKey: TOLEDO_CODE_SOURCE_KEY,
    lastVerifiedAt: TOLEDO_LAST_VERIFIED,
  },
  {
    jurisdictionKey: TOLEDO_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "Every OBC- or RCO-subject permit adds the state surcharge — 1% or 3%",
    description:
      "§ 1307.13: \"In addition to the fees stated in this chapter, when a permit is subject to Ohio Building Code or the Residential Code of Ohio requirements, each permit applicant shall also be charged an additional surcharge fee imposed by the State of Ohio\" — residential (1–3 family and accessories) plus 1%, commercial plus 3%. What the percentage reads is settled by the City's own worked example: plan review plus permit ($1,300 → $39), with the certificate of occupancy listed after the surcharge rather than inside it.",
    isMandatory: true,
    sortOrder: 40,
    sourceKey: TOLEDO_CODE_SOURCE_KEY,
    lastVerifiedAt: TOLEDO_LAST_VERIFIED,
  },
  {
    jurisdictionKey: TOLEDO_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "other",
    title: "Base per unit, additions by parenthetical, $75 floor under all of it",
    description:
      "§ 1307.04(c) writes each base row with the items that ride along it: residential new is \"$90.00 per unit (Additional fees for items #7, 9, & 11)\"; commercial \"$100.00 per unit (Additional fees for items #4, 7, 8, 9, 10, & 11)\". Of those numbered additions this site charges #4 (fixtures and circuits at $2 each), #7 (services at $0.50 per amp, in all occupancies), #10 (mobile homes at $0.50 per amp) and #11 (pool bonding $75); #8 motors by horsepower and #9 generators by kilowatt are recorded unmodelled because no such basis exists. The whole page sits under \"the established minimum fee of seventy-five dollars ($75.00) for any permit\".",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: TOLEDO_CODE_SOURCE_KEY,
    lastVerifiedAt: TOLEDO_LAST_VERIFIED,
  },
  {
    jurisdictionKey: TOLEDO_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "license",
    title: "Contractor and journeyman registrations are licensing, not permit fees",
    description:
      "§ 1307.04(a)–(b): electrical contractor registration $200 with $140 annual renewal, journeyman $100/$50, apprentice $25/$25, traveler $100. These are registrations under the chapter's own heading rather than permit fees, and no total on this site includes them.",
    isMandatory: false,
    sortOrder: 20,
    sourceKey: TOLEDO_CODE_SOURCE_KEY,
    lastVerifiedAt: TOLEDO_LAST_VERIFIED,
  },
  {
    jurisdictionKey: TOLEDO_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    requirementType: "document",
    title: "One fixture definition covers every fixture row; the first is in the residential base",
    description:
      "§ 1307.05(c)'s own list: \"Plumbing fixtures, all occupancies (new or replacement) includes all plumbing fixtures, water heater, water line, water service, sanitary pipe, backflow protection device, interceptors, floor drains, tempering valves, etc.\" The residential rows say \"each additional fixture\" — the first sits inside the $90 or $65 base — while the commercial row says \"each fixture\", charging all of them beside its $100 base. The $75 minimum is a floor on the whole permit, not on any row.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: TOLEDO_CODE_SOURCE_KEY,
    lastVerifiedAt: TOLEDO_LAST_VERIFIED,
  },
  {
    jurisdictionKey: TOLEDO_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    requirementType: "other",
    title: "Backflow surveys are priced by hazard category on their own period",
    description:
      "§ 1307.05(c)(1)B: \"Water distribution system backflow and cross-connection control building survey. Category I - high hazard occupancy (annual fee) $100.00; Category II - intermediate or low hazard occupancy (fee for two years) $75.00\". The chapter's own periods are quoted rather than annualised — a Category II survey is a two-year fee, and this site says so instead of dividing it.",
    isMandatory: false,
    sortOrder: 20,
    sourceKey: TOLEDO_CODE_SOURCE_KEY,
    lastVerifiedAt: TOLEDO_LAST_VERIFIED,
  },
];

const profile: SeedProfile = {
  jurisdictionKey: TOLEDO_KEYS.jurisdiction,
  headline: "What construction permits cost in Toledo",
  summary:
    "Toledo prices construction on **area, not cost**: a $60 or $75 base plus $0.20 per gross square foot, plan review at a base plus $0.03 per square foot, demolition by the building's cubic feet, and a state surcharge of 1% residential or 3% commercial that sits *on top of* plan review and permit together. A 5,000 sq ft commercial alteration is the City's own example: $1,075 permit + $225 plan review + $39 surcharge + $75 certificate = $1,414.",
  localContext:
    "Chapter 1307 is one ordinance chapter for all three trades — Ordinance 476-18, passed December 4, 2018, stamped on every section from the general fee clause to the copying charges. The building fees it sets are area-based end to end: base plus twenty cents a square foot for the permit, base plus three cents a square foot for plan review, and cubic feet for demolition. Only the Early Start Phased Permit reads a valuation, and the application form is explicit about what that valuation excludes: \"cost of mechanical and electrical work for which separate permits are required\".\n\nTwo document facts are worth knowing before you trust a quote. First, the City's Commercial Building Alteration page prints its fee prose backwards — \"The Plan Review fee is $75 + $.20 per sq. ft.\" and \"The Commercial Building Permit fee is $75 + $.03 per sq. ft\" — while the worked table immediately below, § 1307.03(a)(1) with § 1307.02(b), and the application worksheet all put $.03 on plan review and $.20 on the permit. This site charges the code's pairing and records the swap, because three of the City's own documents agree against one sentence of prose. Second, the same page's \"$103 Amendment fee\" and its \"standard inspection fee is $75 / expedited inspection fee is $150\" appear nowhere in the chapter — $100 is the amendment figure the code prints, and the inspection pair is recorded as page-only rather than invented into a rule.\n\nWhat could not be read is one state statute. RC 3781.10, behind § 1307.13's surcharge, answers to no fetch from this environment — codes.ohio.gov, the General Assembly, Justia, FindLaw and the Wayback Machine all failed on the day of this pass — but unlike Cleveland, Toledo's own chapter states the surcharge rates outright (1% and 3%) and the City's worked example shows exactly what they read, so nothing in this jurisdiction's model depends on the missing text.",
  valuationBasis:
    "Almost nothing here is priced on value, and the schedule says so by construction.\n\n**Building and plan review: gross square footage.** $60 (residential 1–3) or $75 (commercial and 4+ family) plus $0.20 per gross square foot for the permit; $50 or $75 plus $0.03 per square foot for plan review; both with the chapter's 100-square-foot minimum, which this model carries as a floor on the combined base-plus-area amount ($80, $95, $53, $78 respectively).\n\n**Demolition: cubic feet.** Three bands — up to 6,000 at $75, to 50,000 at $100, and above that $100 plus $3.00 per 1,000 cubic feet or fraction. The third band's rate is read on the building's whole volume (the amount line states no base to subtract), which puts $253 on a 50,001-cubic-foot building against the flat band's $100 — the cliff is the schedule's own and the alternative excess reading is recorded unresolved.\n\n**Valuation: one fee only.** The Early Start Phased Permit's half-percent of building permit valuation, minimum $100 — and the application form defines that valuation as total contract cost or appraised market value including material and labor, with mechanical and electrical work under separate permits excluded. Trade permits read units and amperes: $90/$60/$100 per dwelling unit on electrical, $0.50 per amp for services, fixtures at $6 each on plumbing.\n\n**The surcharge reads the subtotal, not the permit.** § 1307.13 says \"of total\", and the City's worked example shows the total it means: plan review plus permit. The certificate of occupancy line comes after the surcharge on both the application worksheet and the worked example, which is why this model runs it outside the base.",
  notIncluded:
    "These figures are Toledo's own permit, plan-review and surcharge amounts for building, electrical and plumbing work. They are not a project cost, and they exclude:\n\n- **Motors, generators and the hydronic BTU rows.** § 1307.04(c)(8)–(9) price motors by horsepower ($6 / $6 + $0.50 per hp / $60 + $0.25 per hp) and generators by kilowatt ($40 minimum or $0.30 per kw); § 1307.05(d) prices hydronic work per 30,000 BTU. No horsepower, kilowatt or BTU basis exists in this engine, so those rows are quoted on the pages and charged by no rule.\n\n- **Additional tents and additional in-ground tanks.** The chapter's first tent ($75) and first tank ($75) are charged; the \"$25 for each additional\" counts have no per-unit kind to charge them on.\n\n- **Resubmission counts.** Plan review includes the first resubmission; after that the chapter charges $150 then $300 (OBC) or $75 (RCO) per resubmission — a count with no basis here.\n\n- **Chapter 1319's investigation fees.** § 1307.09 points illegal-work investigations there, and that chapter was not read — no tripling or investigation fee is modelled.\n\n- **Registrations and renewals.** Contractor, journeyman and apprentice registration under § 1307.04/05/07 is licensing, not permitting.\n\n- **The alteration page's inspection pair.** Its \"standard inspection fee is $75 / expedited inspection fee is $150\" appears nowhere in Chapter 1307; recorded as page-only, not charged.\n\n- **Website payment and portal fees.** The online portal's charges are the payment channel's, not the chapter's.",
  seoTitle: "Toledo construction permit fees",
  seoDescription:
    "How Toledo prices construction permits — Chapter 1307's base-plus-area fees ($60/$75 + $0.20 per sq ft), plan review at $0.03 per sq ft, demolition by cubic feet, and the state surcharge of 1% residential or 3% commercial on plan review plus permit.",
  publishStatus: "published",
  noindex: false,
  lastReviewedAt: TOLEDO_LAST_VERIFIED,
};

const permitPages: SeedPermitPage[] = [
  {
    jurisdictionKey: TOLEDO_KEYS.jurisdiction,
    permitTypeKey: "building",
    slug: "building-permit-cost",
    title: "Toledo building permit cost",
    intro:
      "A Toledo building permit is priced on **area, not cost**: a $60 base for residential 1–3 family work (or $75 for commercial and 4-family-or-larger) plus $0.20 for each gross square foot, with at least 100 square feet charged on alterations. Plan review rides alongside at its own base — $50 residential, $75 commercial — plus $0.03 per square foot, and every permit subject to the Ohio Building Code or Residential Code of Ohio adds the state surcharge: 1% residential, 3% commercial, calculated on plan review plus permit together. Demolition is the exception to the area rule, banded on the building's cubic feet at $75, $100, or $100 plus $3.00 per 1,000 cubic feet.",
    localSummary:
      "The City's own worked example is this page's proof: a 5,000 sq ft commercial alteration computes $1,075 of permit ($75 + $.20 × 5,000) and $225 of plan review ($75 + $.03 × 5,000), and the 3% surcharge reads their sum — $1,300 × .03 = $39 — with the $75 certificate of occupancy listed after the surcharge rather than inside it. The total, $1,414.00, is reproduced here to the cent.\n\nThe 100-square-foot minimum is a floor on the base-plus-area amount ($80 residential, $95 commercial), so a 40-square-foot alteration still prices as if it were 100. Work the schedule calls non-structural exterior — roofs, siding, doors, windows — leaves the area formula for a flat per-alteration fee ($60 residential, and $95 commercial from the application form, which is the only place that figure is printed).\n\nDemolition bands on volume: not exceeding 6,000 cubic feet is $75, to 50,000 is $100, and above that $100 plus $3.00 per 1,000 cubic feet or fraction on the building's whole volume — $280 at 60,000 cubic feet, and a jump to $253 the moment a building crosses 50,001. The chapter states no base to subtract, no worked example settles it, and the alternative reading is recorded rather than chosen quietly.",
    notIncluded:
      "This is the Toledo building permit fee — the base-plus-area permit, plan review when plans are under review, the state surcharge, and the certificate or zoning lines the job triggers. It excludes:\n\n- **The rates the website prints backwards.** The alteration page's prose swaps plan review and permit rates; its own table, § 1307.02/03 and the application form agree, and this page charges that pairing.\n\n- **HVAC, refrigeration and pressure-piping permits.** § 1307.06–07 price them in full; no HVAC page is published in this set, and electrical and plumbing are separate permits on their own pages.\n\n- **Sign permit base fees.** § 1307.02(f) points to § 1383.09, which this pass did not read — sign base fees are recorded, not charged.\n\n- **Chapter 1319's investigation fees.** § 1307.09 sends illegal-work investigations there; that chapter was not read, so no investigation or penalty fee is modelled.\n\n- **Resubmission counts and the phased-approval add-on.** The chapter prices them per resubmission and per phase ($150/$300, $75, $100 + $.03/sf); no count basis exists to charge them on.\n\n- **Registrations, renewals and copying fees.** Licensing and records charges under the chapter, not permit fees.\n\n- **The alteration page's inspection pair.** \"Standard inspection fee is $75 / expedited inspection fee is $150\" appears nowhere in Chapter 1307 and is recorded rather than charged.",
    workedExample: {
      scenario:
        "The City's own example: a 5,000 sq ft commercial building alteration with plans under review and the certificate of occupancy taken at the end.",
      inputs: {
        squareFootage: 5_000,
        occupancy: "commercial",
        workType: "alteration",
        custom: {
          one_two_family: false,
          plan_review: true,
          certificate_of_occupancy: true,
        },
      },
      notes:
        "Four lines, in the City's own worked order.\n\nBuilding permit: § 1307.02(b)'s $75.00 base plus $0.20 per gross square foot — 5,000 × $0.20 = $1,000.00, so $1,075.00. The 100 sq ft floor ($95.00) does not bind.\n\nPlan review: § 1307.03(a)(1)'s $75.00 base plus $0.03 per square foot — $150.00, so $225.00. This is the pairing the website's prose prints swapped; its table, the code and the application form all put $.03 here.\n\nState surcharge: § 1307.13(b), 3% \"of total\" — and the City's own example shows which total: $1,075.00 + $225.00 = $1,300.00, and 3% of $1,300.00 is $39.00. The surcharge runs after plan review has been added and before any \"other\" line, so the certificate below is outside its base.\n\nCertificate of Occupancy: § 1307.02(g), $75.00 — listed after the surcharge, exactly as the application worksheet orders its rows (Subtotal, Surcharge, Certificate, Total).\n\nTotal: $1,075.00 + $225.00 + $39.00 + $75.00 = $1,414.00 — the figure the City's table prints. What moves it: the residential version of this job takes the $60 base and the 1% rate ($13.00 instead of $39.00); at 1,500 sq ft the numbers scale while both floors stay below; without plans the $225 line disappears and the surcharge base shrinks with it; and a demolition in the same building — 60,000 cubic feet — is $100 + 60 × $3.00 = $280.00 before any surcharge.",
    },
    faqs: [
      {
        question: "How much is a building permit in Toledo?",
        answer:
          "A base plus an area charge: $60.00 base for residential 1–3 family new work, additions and alterations (and their accessory structures), $75.00 for commercial buildings and 4-family-or-larger residential — each plus $0.20 per gross square foot, with at least 100 square feet priced on alterations ($80 or $95 as the floor). Non-structural exterior work (roof, siding, doors, windows) is a flat $60 per alteration residential, $95 commercial per the application form.",
        sourceId: TOLEDO_CODE_SOURCE_KEY,
      },
      {
        question: "Is plan review included, and which rate applies?",
        answer:
          "Plan review is its own line: $50.00 base plus $0.03 per square foot under the Residential Code of Ohio, $75.00 base plus $0.03 under the Ohio Building Code, each with a 100-square-foot minimum (floors of $53 and $78). Watch the City's website, which prints these two rates swapped in its fee prose — its own worked table, the code and the application form all agree that plan review is the $.03 line.",
        sourceId: TOLEDO_CODE_SOURCE_KEY,
      },
      {
        question: "How is the state surcharge calculated?",
        answer:
          "§ 1307.13: residential permits (1–3 family and their accessories) add 1%, all other permits add 3%, \"in addition to the fees stated in this chapter\" — and the City's worked example shows the base is plan review plus permit together ($1,300 × 3% = $39 on a 5,000 sq ft alteration), with the certificate of occupancy listed after the surcharge rather than inside it.",
        sourceId: TOLEDO_CODE_SOURCE_KEY,
      },
      {
        question: "What does a demolition permit cost?",
        answer:
          "Three bands on the building's volume: $75.00 up to 6,000 cubic feet, $100.00 from 6,000 to 50,000, and above 50,000 — $100.00 plus $3.00 for each 1,000 cubic feet or fraction. This site reads that last rate on the whole volume, which is what the amount line says: 60,000 cubic feet is $280.00. In-ground tank removal is $75 for the first tank under the same division.",
        sourceId: TOLEDO_CODE_SOURCE_KEY,
      },
      {
        question: "Is a Certificate of Occupancy part of the permit fee?",
        answer:
          "No — it is its own $75.00 line (a Partial Certificate is also $75.00), and both the application worksheet and the City's worked example place it after the state surcharge, outside the surcharge's base. The Certificate of Zoning Compliance ($50.00) sits the same way.",
        sourceId: TOLEDO_APPLICATION_SOURCE_KEY,
      },
      {
        question: "Can plans start work before the permit issues?",
        answer:
          "Through the Early Start Phased Permit (§ 1307.03(c)): interior alterations may start at the rough-in stage while plans review, at one half of one percent of the building permit valuation with a $100 minimum ($100 flat for a trade permit). Work is \"performed at the applicant's risk\", nothing may be concealed, and the ESPP expires when the real permit issues or after ninety days.",
        sourceId: TOLEDO_CODE_SOURCE_KEY,
      },
    ],
    seoTitle: "Toledo building permit cost: $60/$75 + $0.20 per sq ft",
    seoDescription:
      "Toledo building permit fees — Chapter 1307's $60/$75 base plus $0.20 per gross sq ft, plan review at base + $0.03 per sq ft, demolition by cubic feet, and the state surcharge (1% residential / 3% commercial) on plan review plus permit.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: TOLEDO_LAST_VERIFIED,
  },
  {
    jurisdictionKey: TOLEDO_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    slug: "electrical-permit-cost",
    title: "Toledo electrical permit cost",
    intro:
      "A Toledo electrical permit is **a per-unit base with the chapter's own additions**: $90.00 per dwelling unit for new 1–3 family work, $60.00 base per unit for existing residential alterations and additions, $100.00 base per unit for commercial work — each with numbered items riding along, of which this page charges the service at **$0.50 per amp** (solar arrays, PV modules and wind turbines included, all occupancies), fixtures and circuits at $2.00 each, mobile homes at $0.50 per amp, and pool bonding at $75.00. The whole page sits under a $75.00 minimum for any permit, and every permit subject to the OBC or RCO adds the state surcharge — 1% residential or 3% commercial.",
    localSummary:
      "The additions are written into the base rows as parentheticals: residential new is \"$90.00 per unit (Additional fees for items #7, 9, & 11)\" and commercial \"$100.00 per unit (Additional fees for items #4, 7, 8, 9, 10, & 11)\". Item 7 — services at $0.50 per amp — applies \"in all occupancies\" and reads the filing's amperage directly, standing down when a temporary pole, service release or mobile-home row is selected because those rows carry their own $0.50-per-amp component and charging both would bill the same amperage twice.\n\nThe $75 minimum is a floor on the whole permit, charged as the shortfall after the rows: a commercial filing with one unit and a 400-amp service computes $100 + $200 = $300 and passes it easily, while a small item-only permit would be lifted to $75. The surcharge then reads the subtotal — 3% of that $300 is $9.00, which is how the City's own worked example computes its 3% on plan review plus permit.\n\nWhat the chapter prints but no engine basis can charge is on the page too: motors priced by horsepower in three bands ($6, $6 + $0.50/hp, $60 + $0.25/hp over 100), generators at $40 minimum or $0.30 per kilowatt, and the contractor/journeyman registration ladder ($200/$140, $100/$50, $25/$25). None is invented into a rule — the rows are quoted and recorded.",
    notIncluded:
      "This is the § 1307.04 electrical fee — per-unit bases, the amperage additions this engine can charge, the $75 floor and the state surcharge. It excludes:\n\n- **Motors by horsepower and generators by kilowatt.** The chapter's three motor bands and its \"$40 minimum or $0.30/kw\" generator row have no horsepower or kilowatt basis to charge them on; they are quoted, not modelled.\n\n- **Registrations and renewals.** Electrical contractor, journeyman, apprentice and traveler registration under § 1307.04(a)–(b) is licensing, not permitting.\n\n- **The ESPP's regular-permit counterpart.** The $100 Early Start fee is charged here when selected; the permit it expires into is priced by this page's own rows.\n\n- **HVAC, hydronic and refrigeration permits.** § 1307.06–07 price them; no HVAC page is published in this set.\n\n- **Double-counted amperage.** The service row stands down when a temporary pole, service release or mobile-home row is selected — each of those carries its own $0.50 per amp, and the schedule prices the amperage once.\n\n- **The state surcharge's missing statute.** RC 3781.10 could not be fetched; § 1307.13 states the rates outright (1%/3%) and the City's worked example shows the base, so nothing here depends on the unread text.",
    workedExample: {
      scenario:
        "A commercial electrical permit on new construction: one unit, 400-amp service, no item rows selected.",
      inputs: {
        units: 1,
        occupancy: "commercial",
        workType: "new_construction",
        custom: { one_two_family: false, amperage: 400 },
      },
      notes:
        "Two rows and a floor that does not bind.\n\nBase: § 1307.04(c)(3) commercial new/alterations/replacements/additions — \"$100.00 per unit\" × 1 unit = $100.00.\n\nService: item 7 — \"electrical services, including packaged: connected solar arrays, photovoltaic modules, and wind turbines in all occupancies, per amp. $0.50 per amp\" — 400 × $0.50 = $200.00. The row applies because no temporary pole, release or mobile-home selection is on the filing.\n\nMinimum: $100 + $200 = $300.00, above the $75.00 floor, so no shortfall is charged.\n\nState surcharge: commercial, so § 1307.13(b)'s 3% — $300.00 × .03 = $9.00.\n\nTotal: $100.00 + $200.00 + $9.00 = $309.00. What moves it: a residential new-construction filing takes the $90-per-unit row instead and the 1% rate; a 200-amp service halves the amperage line to $100.00; adding a pool bonding flag brings $75.00; two circuits in a commercial job add $4.00; and a permit whose rows total under $75 is lifted to exactly $75.00 by the floor.",
    },
    faqs: [
      {
        question: "How much is an electrical permit in Toledo?",
        answer:
          "A per-unit base: $90.00 per dwelling unit for new 1–3 family work, $60.00 base per unit for existing residential alterations or additions, $100.00 base per unit for commercial work — plus the numbered items the base rows call out (services at $0.50 per amp, fixtures and circuits at $2.00 each, mobile homes at $0.50 per amp, pool bonding at $75.00), under a $75.00 minimum for any permit.",
        sourceId: TOLEDO_CODE_SOURCE_KEY,
      },
      {
        question: "How is the electrical service charged?",
        answer:
          "By the amp: \"$0.50 per amp\" on electrical services in all occupancies — solar arrays, photovoltaic modules and wind turbines included — and the same rate on a commercial temporary pole, a commercial service release, or a mobile home. Multi-residential service is based on total amp capacity per unit. Enter the service size as the permit's amperage and the row computes it.",
        sourceId: TOLEDO_CODE_SOURCE_KEY,
      },
      {
        question: "What is the minimum electrical permit fee?",
        answer:
          "\"The cost of all permits will be on the basis of fees listed except when the total is less than the established minimum fee of seventy-five dollars ($75.00) for any permit\" — a floor on the whole permit, charged as the shortfall after every row, and before the state surcharge is calculated on the result.",
        sourceId: TOLEDO_CODE_SOURCE_KEY,
      },
      {
        question: "Does the electrical permit include the state surcharge?",
        answer:
          "Yes, when the permit is subject to the Ohio Building Code or Residential Code of Ohio: 1% for residential 1–3 family permits and accessories, 3% for everything else — \"in addition to the fees stated in this chapter\", read on the subtotal of what the permit has added so far.",
        sourceId: TOLEDO_CODE_SOURCE_KEY,
      },
      {
        question: "Why aren't motor and generator fees in the total?",
        answer:
          "Because the chapter prices them in units this engine has no basis for: motors by horsepower in three bands (\"Not exceeding 5 hp $6.00; Over 5 hp to 100 hp $6.00 plus $0.50/hp; Over 100 hp $60.00 plus $0.25/hp\") and generators at \"$40.00 minimum or $0.30/kw\". Those rows are quoted on this page and charged by no rule — a fee this site cannot compute is named rather than guessed.",
        sourceId: TOLEDO_CODE_SOURCE_KEY,
      },
    ],
    seoTitle: "Toledo electrical permit cost: $90/$60/$100 per unit",
    seoDescription:
      "Toledo electrical permit fees — § 1307.04's $90/$60/$100 per-unit bases, $0.50 per amp on services, $2 per circuit, pool bonding $75, the $75 permit minimum and the state surcharge.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: TOLEDO_LAST_VERIFIED,
  },
  {
    jurisdictionKey: TOLEDO_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    slug: "plumbing-permit-cost",
    title: "Toledo plumbing permit cost",
    intro:
      "A Toledo plumbing permit is **a base plus six dollars a fixture, with the first fixture already inside the residential base**: commercial work is $100.00 base plus $6.00 each fixture; a new 1–3 family dwelling is $90.00 base plus $6.00 each *additional* fixture; an existing dwelling is $65.00 base plus $6.00 each additional fixture. Backflow and cross-connection surveys are priced by hazard category ($100.00 annual for Category I, $75.00 every two years for Category II), the whole permit is floored at $75.00, and OBC/RCO permits add the state surcharge — 1% residential, 3% commercial.",
    localSummary:
      "The chapter's wording decides the arithmetic: the commercial row says \"$6.00 each fixture\" while both residential rows say \"$6.00 each additional fixture\" — so eight fixtures in a new house are $90 + 7 × $6 = $132.00, while eight fixtures in a store are $100 + 8 × $6 = $148.00. The fixture list is the chapter's own and covers everything from water closets and interceptors to tempering valves and backflow devices.\n\nThe $75 minimum is a floor on the whole permit, not on any row: an existing dwelling with one fixture computes $65 + $6 = $71.00 and pays $75.00, while the same permit at three fixtures ($77.00) passes it untouched. The state surcharge then reads the subtotal — 1% of $132.00 is $1.32 — on the same plan-review-plus-permit base the City's building example demonstrates, though a plumbing permit typically carries no plan-review line of its own.\n\nHydronic work is the one block the chapter prints that this page does not compute: commercial new systems at $75 per 30,000 BTU of connected load, replacements under 200,000 BTU at the same rate, and residential hydronic at $65 per unit are denominated in BTU and units-of-equipment that have no basis here, so they are quoted and recorded rather than charged.",
    notIncluded:
      "This is the § 1307.05 plumbing fee — bases with the per-fixture rates, the backflow survey rows, the $75 floor and the state surcharge. It excludes:\n\n- **Hydronic rows.** § 1307.05(d) prices commercial hydronic work per 30,000 BTU of connected load, fixture replacement at $75 each, and residential at $65 per unit — BTU denominations have no basis in this engine, and the per-unit readings are recorded rather than mapped onto the wrong count.\n\n- **Registrations and renewals.** Plumbing and hydronics contractor, journeyman and apprentice registration under § 1307.05(a)–(b) is licensing, not permitting.\n\n- **Several pipe or fixture categories as separate filings.** The rows read one fixture count and one class; a job mixing fixture work with a backflow survey adds both lines by selecting both, which the schedule's own \"use (1), (2) and (3) below\" instruction allows.\n\n- **Chapter 1319 investigation fees.** § 1307.09 points illegal-work work there; that chapter was not read.\n\n- **Certificate and zoning lines.** The $75 certificate and $50 CZC are building-page lines under § 1307.02; a plumbing permit does not carry them.\n\n- **The state surcharge's missing statute.** RC 3781.10 could not be fetched; § 1307.13 states 1% and 3% outright, so the rates do not depend on it.",
    workedExample: {
      scenario:
        "A new-construction bathroom and kitchen in a one-, two- or three-family dwelling: eight fixtures, no survey, no ESPP.",
      inputs: {
        fixtures: 8,
        occupancy: "residential",
        workType: "new_construction",
        custom: { one_two_family: true },
      },
      notes:
        "Three lines, and the residential word \"additional\" is the whole story.\n\nBase: § 1307.05(c)(2)A — \"New construction, $90.00 base fee\" = $90.00. This is the new-construction side of the residential split; an existing dwelling would take the $65.00 base instead.\n\nFixtures: \"plus $6.00 each additional fixture\" — the first sits inside the $90 base, so eight fixtures charge seven: 7 × $6.00 = $42.00.\n\nMinimum: $90.00 + $42.00 = $132.00, above the $75.00 floor — no shortfall. (One fixture would be $96.00 and still pass; an existing dwelling with one fixture computes $71.00 and pays the $75.00 floor instead.)\n\nState surcharge: residential, § 1307.13(a)'s 1% — $132.00 × .01 = $1.32.\n\nTotal: $90.00 + $42.00 + $1.32 = $133.32. What moves it: the same eight fixtures in a commercial job are $100 + 8 × $6 = $148.00 at the 3% rate; six fixtures in an existing house are $65 + $30 = $95.00; a Category I backflow survey adds $100.00; and the floor only bites below $75.00 of computed rows.",
    },
    faqs: [
      {
        question: "How much is a plumbing permit in Toledo?",
        answer:
          "Commercial: $100.00 base plus $6.00 each fixture. Residential new construction (1–3 family): $90.00 base plus $6.00 each additional fixture. Residential existing dwelling: $65.00 base plus $6.00 each additional fixture — the first fixture inside the residential bases. Any permit is at least $75.00, and OBC/RCO permits add the state surcharge (1% residential, 3% commercial).",
        sourceId: TOLEDO_CODE_SOURCE_KEY,
      },
      {
        question: "Which fixtures count?",
        answer:
          "The chapter's own list: \"all plumbing fixtures, water heater, water line, water service, sanitary pipe, backflow protection device, interceptors, floor drains, tempering valves, etc.\" — for new or replacement work in any occupancy. Count them on the filing and each is priced (or, residentially, all but the first, which sits in the base).",
        sourceId: TOLEDO_CODE_SOURCE_KEY,
      },
      {
        question: "What is the minimum plumbing fee?",
        answer:
          "\"The cost of all permits will be on the basis of fees listed except when the total is less than the established minimum fee of seventy-five dollars ($75.00) for any permit\" — a floor on the whole permit charged as the shortfall. An existing-dwelling permit with one fixture computes $71.00 and pays $75.00.",
        sourceId: TOLEDO_CODE_SOURCE_KEY,
      },
      {
        question: "How is a backflow survey charged?",
        answer:
          "By hazard category, on the survey row: Category I (high hazard occupancy) is $100.00 as an annual fee; Category II (intermediate or low hazard) is $75.00 for two years — the chapter's own periods, quoted rather than annualised.",
        sourceId: TOLEDO_CODE_SOURCE_KEY,
      },
      {
        question: "Are hydronic heating permits priced here?",
        answer:
          "No. § 1307.05(d) prices them — commercial new systems and sub-200,000-BTU replacements at $75 per 30,000 BTU of connected load, fixture replacement at $75 each, residential at $65 per unit — but BTU denominations have no basis in this engine, so those rows are quoted on this page and charged by no rule.",
        sourceId: TOLEDO_CODE_SOURCE_KEY,
      },
    ],
    seoTitle: "Toledo plumbing permit cost: $90/$65/$100 + $6 per fixture",
    seoDescription:
      "Toledo plumbing permit fees — § 1307.05's $100 commercial or $90/$65 residential base plus $6 per fixture, backflow surveys by category, the $75 permit minimum and the state surcharge.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: TOLEDO_LAST_VERIFIED,
  },
];

const verifications: SeedVerification[] = [
  {
    entityType: "source",
    entityKey: TOLEDO_CODE_SOURCE_KEY,
    status: "verified",
    method: "manual_review",
    verifiedAt: TOLEDO_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: TOLEDO_CODE_SOURCE_KEY,
    notes:
      "Read 2026-09-25 section by section in the rendered codifier (plain fetchers are 403'd): 1307.01 through 1307.14 with every rate, floor and parenthetical, Ord. 476-18's dates, and the two internal cross-reference errors recorded as found. The chapter's own table of contents supplied the section list.",
  },
  {
    entityType: "source",
    entityKey: TOLEDO_APPLICATION_SOURCE_KEY,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: TOLEDO_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: TOLEDO_APPLICATION_SOURCE_KEY,
    notes:
      "Read 2026-09-25 from the application PDF: the valuation definition with its mechanical/electrical exclusion, the payment-order worksheet (permit, plan review, subtotal, surcharge 1%/3%, certificate $75, other, total), both base-plus-area pairs, and the $95 commercial exterior row that exists nowhere in Chapter 1307.",
  },
  {
    entityType: "source",
    entityKey: TOLEDO_ALTERATION_PAGE_SOURCE_KEY,
    status: "verified",
    method: "manual_review",
    verifiedAt: TOLEDO_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: TOLEDO_ALTERATION_PAGE_SOURCE_KEY,
    notes:
      "Read 2026-09-25: the full worked example ($225 + $1,075 + $39 + $75 = $1,414, reproduced cent for cent by the building worked example), the fee prose's swapped rate labels against the page's own table, the $103 amendment figure against the code's $100, and the $75/$150 inspection pair that appears nowhere in the chapter.",
  },
  {
    entityType: "source",
    entityKey: TOLEDO_DEPARTMENT_SOURCE_KEY,
    status: "verified",
    method: "manual_review",
    verifiedAt: TOLEDO_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: TOLEDO_DEPARTMENT_SOURCE_KEY,
    notes:
      "Read 2026-09-25 with the permits, demolition, CO and department pages: counter address and hours, the 419-245-1220 line, the portal URL, and the confirmation that the site carries no electrical or plumbing fee page (those fees live only in the chapter and on the form).",
  },
  {
    entityType: "fee_schedule",
    entityKey: TOLEDO_KEYS.codeSchedule,
    status: "verified",
    method: "manual_review",
    verifiedAt: TOLEDO_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: TOLEDO_CODE_SOURCE_KEY,
    notes:
      "The schedule row carries Ord. 476-18's date (2018-12-04) — the date every section of the chapter prints — and all code-sourced rules validate against it.",
  },
  {
    entityType: "fee_schedule",
    entityKey: TOLEDO_KEYS.formSchedule,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: TOLEDO_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: TOLEDO_APPLICATION_SOURCE_KEY,
    notes:
      "The schedule row carries the read date (the form prints none) and points at the worksheet; its single modelled rule — the $95 commercial exterior rate — validates against it.",
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-COMM-BASE",
    permitTypeKey: "building",
    status: "verified",
    method: "manual_review",
    verifiedAt: TOLEDO_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: TOLEDO_CODE_SOURCE_KEY,
    notes:
      '"(b) Commercial buildings and 4 family or larger residential… Base fee $75.00; Additional fee of $0.20 per gross sq. ft. (100 sq. ft. minimum per alteration)" — base and rate split exactly as the chapter states them, floor carried as $75 + $0.20 × 100 = $95; the City\'s worked example reproduces this row at $1,075 on 5,000 sq ft.',
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-STATE-SURCHARGE-3PCT",
    permitTypeKey: "building",
    status: "verified",
    method: "manual_review",
    verifiedAt: TOLEDO_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: TOLEDO_CODE_SOURCE_KEY,
    notes:
      '"plus 3% of total" (§ 1307.13(b)) — read on fee_subtotal so plan review is inside the base and "other" lines are outside it, asserted by the City\'s own table ($1,300 = permit + plan review, $39 = 3%, certificate listed after). The residential 1% sibling is asserted the same way in the plumbing worked example.',
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-DEMO-LARGE",
    permitTypeKey: "building",
    status: "verified",
    method: "manual_review",
    verifiedAt: TOLEDO_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: TOLEDO_CODE_SOURCE_KEY,
    notes:
      '"Buildings in excess of 50,000 cu. ft. $100.00 plus $3.00/1,000 cu. ft. or fraction thereof" — read on whole volume with the increment rounding the volume up to whole thousands: 60,000 cu ft is $100 + 60 × $3 = $280, asserted in the tests beside both flat bands ($75 / $100) and the seam jump at 50,001 ($253). The excess-base alternative ($103 at the seam) is recorded unresolved rather than modelled.',
  },
  {
    entityType: "fee_rule",
    entityKey: "ELEC-SERVICE-AMPS",
    permitTypeKey: "electrical",
    status: "verified",
    method: "manual_review",
    verifiedAt: TOLEDO_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: TOLEDO_CODE_SOURCE_KEY,
    notes:
      '"(c) 7. Electrical services, including packaged: connected solar arrays, photovoltaic modules, and wind turbines in all occupancies, per amp. $0.50 per amp" — an exact half-dollar as the fraction 1/2 on the amperage basis, ungated so an entered service sizes it, and standing down when a temp-pole/release/mobile-home row carries its own amp component so the same amperage is never billed twice.',
  },
  {
    entityType: "fee_rule",
    entityKey: "PLUMB-RES-NEW-EXTRA",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "manual_review",
    verifiedAt: TOLEDO_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: TOLEDO_CODE_SOURCE_KEY,
    notes:
      '"$90.00 base fee plus $6.00 each additional fixture" — the first fixture inside the base (thresholdUnits 1), asserted against the commercial row\'s "each fixture" (no threshold): eight fixtures are $132 residential-new and $148 commercial, a difference the chapter\'s own wording makes and the tests hold.',
  },
  {
    entityType: "permit_page",
    entityKey: "building-permit-cost",
    permitTypeKey: "building",
    status: "verified",
    method: "manual_review",
    verifiedAt: TOLEDO_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: TOLEDO_CODE_SOURCE_KEY,
    notes:
      "Gate-checked 2026-09-25: the chapter read in full beside the form and the alteration page; the worked example reproduces the City's own $1,414.00 line for line; the website's swapped rate prose, the $103 amendment and the page-only inspection pair are quoted as conflicts rather than resolved.",
  },
  {
    entityType: "permit_page",
    entityKey: "electrical-permit-cost",
    permitTypeKey: "electrical",
    status: "verified",
    method: "manual_review",
    verifiedAt: TOLEDO_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: TOLEDO_CODE_SOURCE_KEY,
    notes:
      "Gate-checked 2026-09-25 against § 1307.04: the three per-unit bases, the parenthetical additions wired as their own rows, the amperage double-count guard, the $75 floor as a permit_minimum, and the worked example's $309.00.",
  },
  {
    entityType: "permit_page",
    entityKey: "plumbing-permit-cost",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "manual_review",
    verifiedAt: TOLEDO_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: TOLEDO_CODE_SOURCE_KEY,
    notes:
      "Gate-checked 2026-09-25 against § 1307.05: the \"each\"/\"each additional\" distinction between commercial and residential fixture rows, the $75 floor asserted from both sides, the backflow category split, and the worked example's $133.32.",
  },
  {
    entityType: "jurisdiction_profile",
    entityKey: TOLEDO_KEYS.jurisdiction,
    status: "verified",
    method: "manual_review",
    verifiedAt: TOLEDO_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: TOLEDO_ALTERATION_PAGE_SOURCE_KEY,
    notes:
      "The profile states the readings the model depends on — area not cost, the code against the website's swapped prose, the surcharge base from the City's own table — and keeps every document fact a reader would trip on, including RC 3781.10's unreachability and why this jurisdiction's model does not depend on it.",
  },
];

export const toledoSeed: JurisdictionSeed = {
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
export const TOLEDO_PUBLISHED_PERMIT_PAGES = toledoSeed.permitPages.filter(
  (page) => page.publishStatus === "published" && !page.noindex,
);
