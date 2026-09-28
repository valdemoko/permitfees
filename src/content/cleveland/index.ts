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
  CLEVELAND_BUILDING_CODE_RULES,
  CLEVELAND_BUILDING_PAGE_RULES,
  CLEVELAND_BUILDING_SURCHARGE_RULES,
  CLEVELAND_CODE_EFFECTIVE_FROM,
  CLEVELAND_CODE_SOURCE_KEY,
  CLEVELAND_DEPARTMENT_SOURCE_KEY,
  CLEVELAND_ELECTRICAL_RULES,
  CLEVELAND_FEE_PAGE_SOURCE_KEY,
  CLEVELAND_PAGE_EFFECTIVE_FROM,
  CLEVELAND_PLUMBING_RULES,
} from "./fee-rules";

export * from "./fee-rules";

/**
 * The complete Cleveland, Ohio seed payload.
 *
 * Every figure traces to research/ohio/cleveland.md, which traces to the City's own
 * two publications: the codified schedule at § 3105.25 (Ord. 708-10) and the
 * department's Permit Fee Schedule page — a self-described "user-friendly recreation"
 * that adds the fees the ordinance section does not carry. The two disagree in three
 * places (the potable-connection row, the OBC surcharge boilerplate, and a zoning row
 * the ordinance omits), and every disagreement is published as a reading rather than
 * smoothed over. Ohio Rev. Code § 3781.10 could not be fetched from this environment
 * by any path, so the surcharge is modelled exactly as the city's ordinance words it.
 *
 * Three pages, all published: building, electrical and plumbing. Cleveland is the
 * first jurisdiction here whose state surcharge is *inside* the published rates for
 * one class and *itemised* for the other — the ordinance says both things in
 * consecutive paragraphs, and the rules say them too.
 */

const RESEARCHER = "Permit Fee Intelligence research pass 14 (Ohio)";

export const CLEVELAND_LAST_VERIFIED = "2026-09-25";

export const CLEVELAND_KEYS = {
  state: "oh",
  county: "cuyahoga-county",
  jurisdiction: "cleveland",
  codeSchedule: "cleveland-3105-25-schedule",
  pageSchedule: "cleveland-fee-schedule-recreation",
} as const;

const state: SeedState = {
  code: "OH",
  slug: "ohio",
  name: "Ohio",
  fipsCode: "39",
};

const county: SeedCounty = {
  key: CLEVELAND_KEYS.county,
  slug: "cuyahoga-county",
  name: "Cuyahoga County",
  fipsCode: "39035",
};

const jurisdiction: SeedJurisdiction = {
  key: CLEVELAND_KEYS.jurisdiction,
  stateKey: CLEVELAND_KEYS.state,
  countyKey: CLEVELAND_KEYS.county,
  type: "city",
  slug: "cleveland",
  name: "Cleveland",
  officialName: "City of Cleveland",
  websiteUrl: "https://www.clevelandohio.gov/",
  permitPortalUrl: "https://coc-prod-publicportal.accela.com",
  timezone: "America/New_York",
  isActive: true,
};

const departments: SeedDepartment[] = [
  {
    key: "cleveland-department-building-housing",
    jurisdictionKey: CLEVELAND_KEYS.jurisdiction,
    kind: "building",
    name: "City of Cleveland — Department of Building & Housing",
    phone: "216.664.3451",
    email: null,
    url: "https://www.clevelandohio.gov/city-hall/departments/building-housing",
    addressLine: "601 Lakeside Avenue, Cleveland, OH 44114",
    hours: null,
    notes:
      "The department's own contact list names the lines behind this site: Construction Permitting 216.664.3451, the Chief Building Official 216.420.8402, Demolition Bureau 216.664.2473 (demolitions@clevelandohio.gov), Certificate of Occupancy 216.664.3095, Contractor Registration 216.664.2910 (BHpermits@clevelandohio.gov), Plans 216.664.2085. Appeals go to the Board of Building Standards, Room 516 at City Hall, 216.664.2418. Electrical, plumbing and HVAC contractor registration runs through the State of Ohio's Industry Licensing Board first (614.644.3493), then the department's packet. City Hall is 601 Lakeside Ave; the main line is 216.664.2000.",
  },
];

const sources: SeedSource[] = [
  {
    key: CLEVELAND_CODE_SOURCE_KEY,
    jurisdictionKey: CLEVELAND_KEYS.jurisdiction,
    title:
      "Cleveland Code of Ordinances § 3105.25 — Schedule of Permit Fees (Land Use Code, Ch. 3105)",
    url: "https://codelibrary.amlegal.com/codes/cleveland/latest/cleveland_oh/0-0-0-19698",
    sourceType: "municipal_code",
    issuingAuthority: "City of Cleveland",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2010-08-18",
    effectiveFrom: CLEVELAND_CODE_EFFECTIVE_FROM,
    retrievedAt: CLEVELAND_LAST_VERIFIED,
    lastVerifiedAt: CLEVELAND_LAST_VERIFIED,
    notes:
      "Read 2026-09-25 in full through the codifier (which 403s plain fetchers): the valuation preamble, the NOTE that electrical, plumbing, HVAC, elevators and plan processing are separate, the two RC 3781.10(E) surcharge paragraphs, and divisions (a) through (m) with every rate and minimum — the four-row ladder with its $1,000,000 tier split, the misc and demolition rows, moving, signs, marquees, tents with the funeral/religious exemption, zoning fees, HVAC, plumbing, electrical and elevators. Ord. No. 708-10, passed 8-18-10, eff. 8-20-10. The referenced state statute (RC 3781.10) could not be fetched by any path tried — codes.ohio.gov, legislature.ohio.gov, Justia, FindLaw, public.law and the Wayback Machine all failed from this environment — so the surcharge reading rests on the ordinance's own words, which state it twice.",
  },
  {
    key: CLEVELAND_FEE_PAGE_SOURCE_KEY,
    jurisdictionKey: CLEVELAND_KEYS.jurisdiction,
    title: "City of Cleveland — Permit Fee Schedule (Plan Examination and Permit Fee Schedule)",
    url: "https://www.clevelandohio.gov/city-hall/departments/building-housing/divisions/construction-permitting/permit-fee-schedule",
    sourceType: "municipal_website",
    issuingAuthority: "City of Cleveland Department of Building & Housing",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: CLEVELAND_PAGE_EFFECTIVE_FROM,
    retrievedAt: CLEVELAND_LAST_VERIFIED,
    lastVerifiedAt: CLEVELAND_LAST_VERIFIED,
    notes:
      "Read 2026-09-25. The page describes itself as \"a user-friendly recreation of the City of Cleveland Department of Building and Housing Plan Examination and Permit Fee Schedule, effective January 2, 2014\" — a later publication than the ordinance's 2010 date, and the source of every fee the codified section does not carry: the $20-per-1,000 plan examination with its $20 floor, site development review $200, SWPPP review $500 and its $150/month inspection, the certificate of occupancy at $60, the two late-fee tiers ($100 or $200 plus 25%), the $40/$100 special inspection fees, the charitable festival trio, and a fourth residential zoning row the ordinance's list omits. Two figures disagree with the ordinance — its $13 potable-connection copy against § 3105.25(k)(2)F's $50, and its boilerplate \"3% OBC surcharge added to the permit fee\" against the ordinance's \"the permit fees herein include the required surcharge\". The ordinance governs both; the disagreements are recorded in the research record and quoted on the pages.",
  },
  {
    key: CLEVELAND_DEPARTMENT_SOURCE_KEY,
    jurisdictionKey: CLEVELAND_KEYS.jurisdiction,
    title: "City of Cleveland — Department of Building & Housing (overview and contact list)",
    url: "https://www.clevelandohio.gov/city-hall/departments/building-housing",
    sourceType: "municipal_website",
    issuingAuthority: "City of Cleveland",
    authorityKind: "city",
    isPrimary: false,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: CLEVELAND_LAST_VERIFIED,
    lastVerifiedAt: CLEVELAND_LAST_VERIFIED,
    notes:
      "Read 2026-09-25 together with the department's contact-list page. The overview is where the state-licensing-before-city-registration sequence is stated (\"To register as an electrical, plumbing, or HVAC contractor, you must first be licensed by the State of Ohio … Then complete and submit the contractor packet\"), where the Accela permit portal is linked (coc-prod-publicportal.accela.com), and where the Board of Building Standards appeal path and its 30-day violation window live. The contact list supplies every phone number in this jurisdiction's department row.",
  },
];

/** Empty on purpose: the permit types Cleveland uses already exist as shared rows. */
const permitTypes: JurisdictionSeed["permitTypes"] = [];
const projectTypes: JurisdictionSeed["projectTypes"] = [];

const jurisdictionPermitTypes: SeedJurisdictionPermitType[] = [
  {
    jurisdictionKey: CLEVELAND_KEYS.jurisdiction,
    permitTypeKey: "building",
    isAvailable: true,
    localName: "Building permit — valuation ladder by class, plus plan examination and zoning",
    officialUrl:
      "https://www.clevelandohio.gov/city-hall/departments/building-housing/divisions/construction-permitting",
    notes:
      "One ordinance section (§ 3105.25) prices four rows — residential and OBC, each split at $1,000,000 — and the department page adds plan examination, zoning, site development, SWPPP, the certificate of occupancy and the late-fee tiers. Which residential row answers is a single fact (one-, two- or three-family), and so is which side of the $1,000,000 seam. Residential permit and plan-examination fees carry a separately itemised 1% state surcharge; OBC fees include it already, in the ordinance's own words.",
  },
  {
    jurisdictionKey: CLEVELAND_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    isAvailable: true,
    localName: "Electrical permit — area charge or item rows, $50 minimum",
    officialUrl:
      "https://www.clevelandohio.gov/city-hall/departments/building-housing/divisions/construction-permitting",
    notes:
      '§ 3105.25(l) offers two calculation paths and says so: "Use (1) or (2) below to calculate fee". (1) prices new construction, additions and alterations at $50 per 1,000 square feet or part; (2) prices item rows — temporary/low-voltage $50, first sign $50 with $30 each additional, repairs $50, blanket annual permit $200 — with the $50 permit floor riding under both. The department page narrows the low-voltage description to building-service equipment; the ordinance\'s broader list is what the rules quote.',
  },
  {
    jurisdictionKey: CLEVELAND_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    isAvailable: true,
    localName: "Plumbing permit — fixtures and pipe runs, $50 minimum",
    officialUrl:
      "https://www.clevelandohio.gov/city-hall/departments/building-housing/divisions/construction-permitting",
    notes:
      "§ 3105.25(k) sums three groups: each fixture at $8, piping at $13 per 100 lineal feet or fraction by pipe type, and repairs at $50 — all under a $50 permit floor charged as a shortfall. The potable-connection row is $50 in the ordinance and $13 on the department page; the ordinance's figure is the one charged here, and the copy is recorded rather than reconciled.",
  },
];

const feeSchedules: SeedFeeSchedule[] = [
  {
    key: CLEVELAND_KEYS.codeSchedule,
    jurisdictionKey: CLEVELAND_KEYS.jurisdiction,
    sourceKey: CLEVELAND_CODE_SOURCE_KEY,
    title: "Cleveland Code of Ordinances § 3105.25 — Schedule of Permit Fees",
    officialUrl:
      "https://codelibrary.amlegal.com/codes/cleveland/latest/cleveland_oh/0-0-0-19698",
    effectiveFrom: CLEVELAND_CODE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: CLEVELAND_LAST_VERIFIED,
    notes:
      "The enactment: Ord. 708-10, effective 8-20-10. Every valuation row, misc row, demolition row, zoning row, electrical row, plumbing row and the two surcharge paragraphs come from it. Where the department page disagrees, this schedule's wording is what the rules carry.",
  },
  {
    key: CLEVELAND_KEYS.pageSchedule,
    jurisdictionKey: CLEVELAND_KEYS.jurisdiction,
    sourceKey: CLEVELAND_FEE_PAGE_SOURCE_KEY,
    title: "City of Cleveland — Plan Examination and Permit Fee Schedule (department page)",
    officialUrl:
      "https://www.clevelandohio.gov/city-hall/departments/building-housing/divisions/construction-permitting/permit-fee-schedule",
    effectiveFrom: CLEVELAND_PAGE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: CLEVELAND_LAST_VERIFIED,
    notes:
      "The later publication (\"effective January 2, 2014\", in the page's own first sentence): plan examination, the fourth zoning row, site development, SWPPP, certificate of occupancy, late-fee tiers, special inspections and the festival trio. Its figures are modelled where they add to the ordinance and recorded where they contradict it.",
  },
];

function attach(permitTypeKey: string, rules: SeedFeeRule["rule"][], scheduleKey: string): SeedFeeRule[] {
  return rules.map((rule) => ({
    jurisdictionKey: CLEVELAND_KEYS.jurisdiction,
    permitTypeKey,
    scheduleKey,
    rule,
  }));
}

const feeRules: SeedFeeRule[] = [
  ...attach("building", CLEVELAND_BUILDING_CODE_RULES, CLEVELAND_KEYS.codeSchedule),
  ...attach("building", CLEVELAND_BUILDING_SURCHARGE_RULES, CLEVELAND_KEYS.codeSchedule),
  ...attach("building", CLEVELAND_BUILDING_PAGE_RULES, CLEVELAND_KEYS.pageSchedule),
  ...attach("electrical", CLEVELAND_ELECTRICAL_RULES, CLEVELAND_KEYS.codeSchedule),
  ...attach("plumbing", CLEVELAND_PLUMBING_RULES, CLEVELAND_KEYS.codeSchedule),
];

const requirements: SeedRequirement[] = [
  {
    jurisdictionKey: CLEVELAND_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "The estimated cost is everything but land and professional fees",
    description:
      "§ 3105.25's preamble: \"the value of work shall include all structural, electrical, plumbing and HVAC, interior finish, normal site preparation including excavation and backfill, overhead and profit. Architectural/Engineering fees, costs of land and off-site costs need not be included.\" The Department may determine the estimate \"in accordance with generally accepted methods of estimating as prescribed by BOCA or the R.S. Means Cost Data Service that is effective on the date application is made\" — so the number the ladder reads is the Department's estimate as much as the applicant's.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: CLEVELAND_CODE_SOURCE_KEY,
    lastVerifiedAt: CLEVELAND_LAST_VERIFIED,
  },
  {
    jurisdictionKey: CLEVELAND_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "document",
    title: "Plan examination is paid on submission and is not refundable",
    description:
      "The department page: \"The plan examination fee is an upfront, non-refundable charge paid upon submission of plans… It is payable at the time the plans are submitted and is generally based on the floor area in square feet (sf). If plans are revised after the permit is issued, an additional P.E. fee will be charged\" — the amount of that later P.E. fee is published nowhere, and is recorded as an open question rather than guessed.",
    isMandatory: false,
    sortOrder: 20,
    sourceKey: CLEVELAND_FEE_PAGE_SOURCE_KEY,
    lastVerifiedAt: CLEVELAND_LAST_VERIFIED,
  },
  {
    jurisdictionKey: CLEVELAND_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "zoning_review",
    title: "Zoning fees are added to the building permit, by the ordinance's own instruction",
    description:
      '"(i) Zoning Fees (Shall Be Added to Applicable Building Permits as Follows)" — commercial/multifamily/parking lots $150, temporary uses $30, signs/fences/appurtenant structures $20, and the department page\'s fourth row (residential $20) that the ordinance\'s list does not print. Added, not folded: the surcharge paragraph names "permit and plan examination fees" as the state-surcharged base, so the zoning line sits outside it.',
    isMandatory: false,
    sortOrder: 30,
    sourceKey: CLEVELAND_CODE_SOURCE_KEY,
    lastVerifiedAt: CLEVELAND_LAST_VERIFIED,
  },
  {
    jurisdictionKey: CLEVELAND_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "The state surcharge is inside OBC rates and itemised on residential permits",
    description:
      "§ 3105.25, two consecutive paragraphs: except for 1–3 family dwellings, their accessories and the miscellaneous items RC 3781.10(E) lists, \"the permit fees herein include the required surcharge pursuant to division (E) of RC 3781.10\"; for 1–3 family permit and plan-examination fees the 1% \"shall be calculated on the final cost of each permit issued and shall be separately itemized\". This site therefore shows one state-surcharge line on residential work and none on OBC work — where the department page's boilerplate \"3% OBC surcharge added\" says otherwise, the ordinance text wins and the disagreement is on the page.",
    isMandatory: true,
    sortOrder: 40,
    sourceKey: CLEVELAND_CODE_SOURCE_KEY,
    lastVerifiedAt: CLEVELAND_LAST_VERIFIED,
  },
  {
    jurisdictionKey: CLEVELAND_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "other",
    title: "One calculation path per permit: the area row or the item rows",
    description:
      '"(l) Note: Use (1) or (2) below to calculate fee; the minimum fee for any permit shall be: $50.00" — the area row for new construction, additions and alterations ($50 per 1,000 sq ft or part), the item rows for temporary/low-voltage work, signs, repairs and the annual blanket permit. The rules stand down on one side whenever the other is selected, and the $50 floor applies under either.',
    isMandatory: true,
    sortOrder: 10,
    sourceKey: CLEVELAND_CODE_SOURCE_KEY,
    lastVerifiedAt: CLEVELAND_LAST_VERIFIED,
  },
  {
    jurisdictionKey: CLEVELAND_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "license",
    title: "State electrical licence first, then the city's contractor packet",
    description:
      "The department's overview: \"To register as an electrical, plumbing, or HVAC contractor, you must first be licensed by the State of Ohio. For information, call the Industry Licensing Board at 614.644.3493. Then complete and submit the contractor packet that can be found on our Resources Page.\" The registration itself is a licence fee, not a permit fee, and is not in any total here.",
    isMandatory: true,
    sortOrder: 20,
    sourceKey: CLEVELAND_DEPARTMENT_SOURCE_KEY,
    lastVerifiedAt: CLEVELAND_LAST_VERIFIED,
  },
  {
    jurisdictionKey: CLEVELAND_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    requirementType: "document",
    title: "Three groups, summed: fixtures, pipe runs, repairs",
    description:
      '"Note: Use (1), (2), and (3) below to calculate fee; the minimum fee for any permit shall be: $50.00" — fixtures at $8 each (the schedule lists which fixtures count), piping at $13 per 100 lineal feet or fraction for each of five pipe types, and repair work at $50. The groups add; the $50 floor is charged as the shortfall when they do not reach it.',
    isMandatory: true,
    sortOrder: 10,
    sourceKey: CLEVELAND_CODE_SOURCE_KEY,
    lastVerifiedAt: CLEVELAND_LAST_VERIFIED,
  },
  {
    jurisdictionKey: CLEVELAND_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    requirementType: "license",
    title: "State plumbing licence first, then the city's contractor packet",
    description:
      "The same sequence as electrical, from the department's overview page: state licence through the Industry Licensing Board, then the contractor packet. A plumbing permit on this site prices the permit, not the licence.",
    isMandatory: true,
    sortOrder: 20,
    sourceKey: CLEVELAND_DEPARTMENT_SOURCE_KEY,
    lastVerifiedAt: CLEVELAND_LAST_VERIFIED,
  },
];

const profile: SeedProfile = {
  jurisdictionKey: CLEVELAND_KEYS.jurisdiction,
  headline: "What construction permits cost in Cleveland",
  summary:
    "Cleveland prices construction on **one ordinance section read against one department page**: a four-row valuation ladder split by construction class and by a $1,000,000 seam, plan examination at $20 per 1,000 square feet, and a state surcharge that is *already inside* OBC rates but must be itemised at 1% on residential work. A residential alteration is $5 per $1,000 of cost (floor $30); a commercial one is $15 per $1,000 below $1,000,000 and $15,000 plus $11 per $1,000 above it.",
  localContext:
    "Two documents price Cleveland, and the City says so itself. The codified schedule — § 3105.25, last amended by Ordinance 708-10 in 2010 — carries the enactment. The department's Permit Fee Schedule page opens by calling itself \"a user-friendly recreation\" of that schedule and dated January 2, 2014, and it is where the fees the ordinance section never printed live: plan examination, zoning's fourth row, site development, SWPPP, the certificate of occupancy, the two late-fee tiers, and the charitable festival trio. Both are the City's own publications, so both are quoted; where they disagree, the ordinance governs and the disagreement stays on the page.\n\nThree disagreements are worth knowing before you pay. The page prices a potable-water connection at $13 where the ordinance says $50 — apparently a copy from the piping rows above it. The page repeats \"3% State of Ohio surcharge added to the permit fee\" under every trade section while the ordinance says the opposite for OBC work (\"the permit fees herein include the required surcharge\"). And the page adds a residential zoning fee the ordinance's list omits. None of the three is reconciled by inventing a middle figure: the ordinance's rows are what the ladder charges, the page's rows are what the extras charge, and each conflict is recorded.\n\nWhat could not be read is one statute. RC 3781.10 — the state law the ordinance's surcharge paragraphs are written around — answers to no fetch from this environment: codes.ohio.gov, the General Assembly's site, Justia, FindLaw and the Wayback Machine all failed on the day of this pass. The ordinance quotes the statute's operative rule twice, and that quotation is the reading modelled here; the statute's list of \"miscellaneous items\" sharing the residential 1% treatment is the one thing left open.",
  valuationBasis:
    "The ladder reads an estimated construction cost, and the ordinance defines it precisely — and unusually, by what to leave out.\n\n**What is in:** \"all structural, electrical, plumbing and HVAC, interior finish, normal site preparation including excavation and backfill, overhead and profit.\" **What is out:** \"Architectural/Engineering fees, costs of land and off-site costs need not be included.\" The Department may determine the estimate under BOCA or the R.S. Means method \"effective on the date application is made\", so a stale cost table cannot price a new application.\n\n**What is not valuation at all.** Demolition is priced on floor area — square feet above the basement, since the schedule excludes \"basement floor or cellar floor areas\". Plan examination is priced on floor area too, per 1,000 square feet of what is examined. Electrical's area row is square footage; its item rows are facts of the job (how many signs, whether it is a repair). Plumbing reads counts only — fixtures installed, linear feet of pipe — so a plumbing total never moves because the job got more expensive.\n\n**The state surcharge** is not a percentage of everything: the ordinance names \"permit and plan examination fees\" as the residential base, which is why the 1% here is a percentage of exactly those two lines and not of zoning or late fees added beside them.",
  notIncluded:
    "These figures are Cleveland's own permit, plan-examination and surcharge amounts for building, electrical and plumbing work. They are not a project cost, and they exclude:\n\n- **HVAC and elevator permits.** § 3105.25(j) and (m) price heating, ventilation, air conditioning, refrigeration and elevators in full — no HVAC or elevator page is published in this jurisdiction set, so those rows are read, recorded and charged nowhere here.\n- **The count rows this engine has no unit for.** Amusement rides at $30 each and the SWPPP inspection at $150/month of construction duration are published figures with no per-ride or per-month basis to charge them on; neither is faked as a flat fee.\n- **The RC 3781.10(E) miscellaneous-items list.** The statute could not be fetched, so only the ordinance's explicit residential class is state-surcharged here; items the statute lists alongside dwellings may also owe the itemised 1% and are recorded as open.\n- **The post-issuance P.E. fee for revised plans.** The page says revisions after permit issuance incur \"an additional P.E. fee\" and publishes no amount.\n- **Contractor registration, state licences and appeal fees.** Registration runs through the State's Industry Licensing Board and the department's packet — licensing, not permitting, and not in any total.\n- **The permit portal's payment fees.** Accela's convenience charges are the payment channel's, not the schedule's.",
  seoTitle: "Cleveland construction permit fees",
  seoDescription:
    "How Cleveland prices construction permits — § 3105.25's four-row ladder with its $1,000,000 seam ($5/$10 residential, $12/$15 and $7/$11 commercial per $1,000), $20-per-1,000 plan examination, and the % state surcharge that is built into OBC rates but itemised on residential work.",
  publishStatus: "published",
  noindex: false,
  lastReviewedAt: CLEVELAND_LAST_VERIFIED,
};

const permitPages: SeedPermitPage[] = [
  {
    jurisdictionKey: CLEVELAND_KEYS.jurisdiction,
    permitTypeKey: "building",
    slug: "building-permit-cost",
    title: "Cleveland building permit cost",
    intro:
      "A Cleveland building permit is priced on **one of four valuation rows, chosen by two facts**: whether the job is on a one-, two- or three-family dwelling, and whether the estimated cost is below or above $1,000,000. Residential new work is $10.00 for each $1,000 of cost (floor $150), residential alterations $5.00 (floor $30); OBC buildings are $12.00 per $1,000 under $1,000,000 (floor $300) and $12,000 plus $7.00 per $1,000 above it, alterations $15.00 with a $150 floor rising to $15,000 plus $11.00 per $1,000. Plan examination rides alongside at $20.00 per 1,000 square feet, and a residential permit carries a separately itemised 1% state surcharge that OBC fees already include.",
    localSummary:
      "The ladder rounds the cost up to a whole $1,000 before multiplying — every row prints \"or fraction\" — and both sides of the $1,000,000 seam are explicit rules that meet at the same figure: exactly $1,000,000 pays $12,000 (or $15,000 on an alteration) from the lower rule, and $1,000,001 pays $12,007 from the upper one. Floors bind where the arithmetic falls short: a $2,000 residential alteration computes $10.00 and pays $30.00.\n\nDemolition is the one row measured in area rather than cost — $10.00 per 1,000 square feet of floor area residential (floor $50), $15.00 OBC (floor $300), with basements and cellars excluded by the schedule's own words. Plan examination is $20 per 1,000 square feet or fraction of what is examined, floored at $20, and projects without floor area (parking lots, signs, roofs, fences) pay the $20 as the fee itself.\n\nThe state surcharge is the reading that surprises people: § 3105.25 says OBC-class fees \"include the required surcharge\" under RC 3781.10(E), while 1–3 family permit and plan-examination fees do not — that 1% \"shall be calculated on the final cost of each permit issued and shall be separately itemized\". So this page shows one surcharge line on residential work and none on commercial, and quotes the department page's contrary \"3% added\" boilerplate as the recorded conflict it is.",
    notIncluded:
      "This is Cleveland's building permit fee — the ladder row that answers the job, plan examination when plans are under review, and the zoning or site lines the job triggers. It excludes:\n\n- **HVAC, elevator and trade permits.** § 3105.25(j) and (m) price them in full; no HVAC or elevator page is published in this set, and electrical and plumbing are separate permits on their own pages — the ordinance's own NOTE says those fees \"are separate\".\n- **Ride counts and SWPPP months.** Amusement rides are $30 each and the SWPPP inspection $150 per month of construction duration — published prices with no per-ride or per-month basis in this engine, recorded rather than flattened.\n- **The post-issuance P.E. fee.** The department page charges \"an additional P.E. fee\" for plans revised after permit issuance and publishes no amount.\n- **The RC 3781.10(E) miscellaneous-items list.** The statute could not be fetched from this environment, so the itemised 1% is gated on the ordinance's explicit residential class only.\n- **Contractor registration and state licences.** Licensing, not permitting — the state Industry Licensing Board issues those before the department's packet.\n- **The exemption list itself.** Zoning, fire and other department approvals may attach; this total is the Building & Housing schedule's own lines.",
    workedExample: {
      scenario:
        "A commercial alteration to an existing building: estimated cost $500,000, 8,000 sq ft under review, plans submitted, commercial zoning fee attached.",
      inputs: {
        valuationCents: 50_000_000,
        squareFootage: 8_000,
        occupancy: "commercial",
        workType: "alteration",
        custom: {
          one_two_family: false,
          plan_review: true,
          zoning_commercial: true,
        },
      },
      notes:
        "Four lines, and the fifth one a reader expects is absent by design.\n\nThe ladder: § 3105.25(b)(2) prices OBC alterations under $1,000,000 at $15.00 per $1,000 \"or fraction thereof\", so $500,000 is 500 whole thousands — $7,500.00, above the $150 floor.\n\nPlan examination: $20.00 per 1,000 sq ft or fraction of the 8,000 sq ft examined — 8 × $20.00 = $160.00, above the $20 floor.\n\nZoning: $150.00 for commercial and multi-family work, added to the permit by the ordinance's (i) instruction rather than folded into it.\n\nState surcharge: none. The ordinance's first surcharge paragraph says \"the permit fees herein include the required surcharge\" for everything outside the 1–3 family class, so a commercial permit carries no itemised line — and the zoning fee sits outside the residential 1% base anyway, because that paragraph names \"permit and plan examination fees\".\n\nTotal: $7,500.00 + $160.00 + $150.00 = $7,810.00. What moves it: the same job at $1,000,000 is $12,000 of ladder plus the same two extras; at $1,000,001 the upper tier takes over at $12,007.00; a residential version of this job would add 1% of the permit and plan-examination lines; and a $2,000 residential repair would floor at $30.00 instead of the $10.00 its own arithmetic gives.",
    },
    faqs: [
      {
        question: "How much is a building permit in Cleveland?",
        answer:
          "It depends on two facts. A one-, two- or three-family dwelling pays $10.00 per $1,000 of estimated cost for new work (minimum $150) or $5.00 for alterations and repairs (minimum $30). An Ohio Building Code building pays $12.00 per $1,000 up to $1,000,000 (minimum $300) then $12,000 plus $7.00 per $1,000 above that, or $15.00 per $1,000 for alterations (minimum $150) then $15,000 plus $11.00 per $1,000. Every row rounds the cost up to a whole $1,000 first.",
        sourceId: CLEVELAND_CODE_SOURCE_KEY,
      },
      {
        question: "Does the permit include plan review?",
        answer:
          "No — plan examination is its own upfront line: $20.00 per 1,000 square feet or fraction of the area examined, with a $20.00 minimum, \"an upfront, non-refundable charge paid upon submission of plans\". Projects without floor area (parking lots, signs, roofs, fences) pay the $20.00 as the fee. The ordinance's NOTE also keeps trade plan processing separate.",
        sourceId: CLEVELAND_FEE_PAGE_SOURCE_KEY,
      },
      {
        question: "Is there a state surcharge on the permit?",
        answer:
          "For one-, two- and three-family dwellings: yes, 1%, and the ordinance requires it to be \"calculated on the final cost of each permit issued and shall be separately itemized\" — it is the 1% line on this site's residential totals, applied to the permit and plan-examination fees. For OBC work: no separate line, because § 3105.25 says its fees \"include the required surcharge pursuant to division (E) of RC 3781.10\". The department page's \"3% OBC surcharge added\" boilerplate contradicts that and is recorded as a conflict.",
        sourceId: CLEVELAND_CODE_SOURCE_KEY,
      },
      {
        question: "Why does the cost jump at $1,000,000?",
        answer:
          "Because the ordinance splits both OBC rows there: under a million it is a single rate ($12 or $15 per $1,000), and from $1,000,001 it becomes a fixed first tier ($12,000 or $15,000) plus a lower marginal rate ($7 or $11 per $1,000) on only what sits above the million. Exactly $1,000,000 pays the lower tier in full — $12,000 — and one dollar more pays $12,007.",
        sourceId: CLEVELAND_CODE_SOURCE_KEY,
      },
      {
        question: "What does a demolition permit cost?",
        answer:
          "It is the one building row measured in area instead of cost: $10.00 for each 1,000 square feet or fraction of floor area for a 1–3 family house or its accessories (minimum $50), or $15.00 per 1,000 square feet for an OBC building (minimum $300) — and the schedule excludes basement and cellar floor areas from the square footage you count.",
        sourceId: CLEVELAND_CODE_SOURCE_KEY,
      },
      {
        question: "What is added to the permit besides the ladder?",
        answer:
          "Whatever the job triggers, all as separate lines: zoning ($150 commercial/multifamily/parking, $30 temporary uses, $20 signs and fences, and the page's $20 residential row), site development review $200, SWPPP review $500, the $60 certificate of occupancy, late fees of $100 or $200 plus 25% of the permit when work started without it, and — on residential work only — the itemised 1% state surcharge.",
        sourceId: CLEVELAND_FEE_PAGE_SOURCE_KEY,
      },
    ],
    seoTitle: "Cleveland building permit cost: $5–$15 per $1,000",
    seoDescription:
      "Cleveland building permit fees — § 3105.25's four valuation rows ($10/$5 residential, $12/$15 commercial per $1,000 with the $1,000,000 tier split), $20 per 1,000 sq ft plan examination, demolition by floor area, and the residential 1% state surcharge.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: CLEVELAND_LAST_VERIFIED,
  },
  {
    jurisdictionKey: CLEVELAND_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    slug: "electrical-permit-cost",
    title: "Cleveland electrical permit cost",
    intro:
      "A Cleveland electrical permit is **either an area charge or item rows, never both** — the schedule says \"Use (1) or (2) below to calculate fee\". New construction, additions and alterations pay $50.00 for each 1,000 square feet or part; item work pays $50 for temporary or low-voltage installations, $50 for the first electrical sign with $30 each additional sign installed at the same time, $50 for repairs, and $200 for an annual blanket permit per premises. A $50 minimum floor sits under either path, and a residential permit adds the 1% state surcharge line.",
    localSummary:
      "The area row prices by the job's footprint — $50 per 1,000 square feet or part, so 6,000 sq ft is six units of $50 — and stands down whenever an item row is selected, which is the schedule's own either/or. The sign row is one formula with the first sign inside its base: $50 for the first, $30 for each additional sign installed at the same time, counted from the number of signs on the filing.\n\nThe $50 minimum is a floor on the whole permit rather than on any row, charged as the shortfall after the rows have spoken: a three-fixture repair's item math can sit under it, and the permit still pays $50. The department page narrows the low-voltage description to \"building service equipment only; such as temperature control wiring of HVAC equipment, or fire alarm system\" while the ordinance lists \"CATV cable, fire alarm devices, computer devices, data communication and other similar equipment\" — the broader ordinance text is what this page quotes, and the narrowing is recorded.\n\nRegistrations — contractor $200, journeyman $100, apprentice $25 at the state level — are licensing rather than permitting and appear in no total here. The 1% state surcharge applies to residential permits the same way it does on the building page: itemised on the final cost, and already inside OBC-class figures.",
    notIncluded:
      "This is the § 3105.25(l) electrical fee — one calculation path, the $50 permit floor, and the residential state surcharge. It excludes:\n\n- **Amusement rides and devices — $30 each.** The schedule prices them per ride, and this engine has no per-ride count to price them on; the row is recorded, not flattened into a single fee.\n- **Contractor and journeyman registrations.** The state licensing board and the department's registration packet are licensing, not permitting.\n- **The regime the schedule did not choose.** Item rows answer only when the area row does not, per \"Use (1) or (2)\" — a permit cannot be priced by both paths at once.\n- **HVAC control wiring as a separate permit.** The page's narrowed description treats temperature-control wiring inside the low-voltage row; mechanical permits are § 3105.25(j)'s, and no HVAC page is published in this set.\n- **Surcharge on non-residential work.** OBC-class fees already include the RC 3781.10(E) surcharge in the ordinance's words, so no second line appears.",
    workedExample: {
      scenario:
        "A residential electrical alteration covering 6,000 sq ft of floor area, with no item rows selected.",
      inputs: {
        squareFootage: 6_000,
        occupancy: "residential",
        workType: "alteration",
        custom: { one_two_family: true },
      },
      notes:
        "The area path, in the schedule's own order.\n\nArea row: \"For each 1,000 square feet or part — $50.00\". 6,000 sq ft is exactly six thousands — $300.00. (A partial thousand rounds up: 6,400 sq ft would be seven units, $350.00.)\n\nMinimum: the $50.00 permit floor does not bind — $300.00 is already above it.\n\nState surcharge: this is a one-, two- or three-family dwelling, so the 1% the ordinance requires to be \"separately itemized\" is charged on the permit — $3.00.\n\nTotal: $300.00 + $3.00 = $303.00. What moves it: the same job with an item selected (say repairs) takes the $50 flat row instead of the area math and the area row stands down; three signs at once would be $50 + $30 + $30 instead; a 6,400 sq ft area rounds up a unit; and an OBC-class version carries no surcharge line because those fees include the state's already.",
    },
    faqs: [
      {
        question: "How much is an electrical permit in Cleveland?",
        answer:
          "Two paths, one per permit. New construction, additions and alterations: $50.00 for each 1,000 square feet or part of the work area. Item work: $50 for temporary lighting/power or low-voltage systems, $50 for the first electrical sign plus $30 each additional sign installed at the same time, $50 for repairs to existing systems, or $200 for an annual blanket permit per premises. Either way the permit is at least $50.00.",
        sourceId: CLEVELAND_CODE_SOURCE_KEY,
      },
      {
        question: "Can I combine the area fee and an item fee?",
        answer:
          "The schedule says no: \"Note: Use (1) or (2) below to calculate fee\". The area row answers for new construction, additions and alterations and stands down when an item row is selected — one calculation path per permit, with the $50 minimum under both.",
        sourceId: CLEVELAND_CODE_SOURCE_KEY,
      },
      {
        question: "How are multiple signs charged?",
        answer:
          "As one row with the first sign inside it: \"For the first electrical sign — $50.00\" and \"Add for each additional electric sign installed at the same time — $30.00\". Three signs on one permit are $50 + $30 + $30 = $110.",
        sourceId: CLEVELAND_CODE_SOURCE_KEY,
      },
      {
        question: "Does the electrical permit carry the state surcharge?",
        answer:
          "On a one-, two- or three-family dwelling: yes — the ordinance requires the 1% to be calculated on the final cost of each permit issued and separately itemised, and § 3105.25's schedule covers the electrical rows too. On OBC work: no separate line, because those fees already include the RC 3781.10(E) surcharge.",
        sourceId: CLEVELAND_CODE_SOURCE_KEY,
      },
      {
        question: "What does a blanket electrical permit cover?",
        answer:
          "\"(3) Blanket electrical permit for each year for each premises — $200.00\" — an annual, per-premises permit rather than a per-job one. It is selected on its own and replaces the per-job calculation path for that year.",
        sourceId: CLEVELAND_CODE_SOURCE_KEY,
      },
    ],
    seoTitle: "Cleveland electrical permit cost: $50 per 1,000 sq ft",
    seoDescription:
      "Cleveland electrical permit fees — § 3105.25(l)'s area row at $50 per 1,000 sq ft or item rows ($50 temporary, $50+$30 signs, $50 repairs, $200 blanket), the $50 permit minimum and the residential 1% surcharge.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: CLEVELAND_LAST_VERIFIED,
  },
  {
    jurisdictionKey: CLEVELAND_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    slug: "plumbing-permit-cost",
    title: "Cleveland plumbing permit cost",
    intro:
      "A Cleveland plumbing permit is **three groups summed, under a $50 floor**: each plumbing fixture or device at $8.00 (the schedule's own list — water closets, urinals, tubs, sinks, dishwashers, water heating devices, interceptors, sump pumps and the rest), piping at $13.00 for each 100 lineal feet or fraction for each of five pipe types, and repairs to existing plumbing at $50.00. A connection to a potable water line for non-potable uses is $50.00 by ordinance. When the groups fall short of $50.00, the permit pays the difference — and a residential permit adds the itemised 1% state surcharge.",
    localSummary:
      "The fixture row counts what the schedule lists and nothing else — $8.00 each, no base, no threshold. The piping rows price whole 100-foot segments: gas, drains, storm/foundation, sanitary and water distribution are each $13.00 per 100 lineal feet \"or fraction\", so 250 feet of water distribution is three rounded-up segments, $39.00. Each pipe type has its own switch, and the groups add the way the schedule's own instruction says they should — \"Use (1), (2), and (3) below to calculate fee\".\n\nThe $50 minimum is charged as a shortfall against the whole permit: six fixtures compute $48.00 and pay $50.00, then the residential 1% takes the permit to $50.50. The potable-connection row is where the two city documents part company — the ordinance says $50.00, the department page says $13.00 — and this page charges the ordinance's figure while quoting the page's, because a rule must charge one number and the enactment is the one that carries the force.\n\nNo valuation is read anywhere on this page: plumbing fees are made of fixture counts and pipe lengths, so a plumbing total never changes because the job got more expensive.",
    notIncluded:
      "This is the § 3105.25(k) plumbing fee — fixtures, one pipe type's run, repair work, the $50 floor and the residential state surcharge. It excludes:\n\n- **The department page's $13 potable-connection figure.** The ordinance's $50.00 for that row is charged; the page's conflicting copy is quoted and recorded, not averaged into something neither document says.\n- **HVAC and mechanical work.** § 3105.25(j) prices it and no HVAC page is published in this set.\n- **Contractor registration and the state licence.** Plumbing contractors register with the State of Ohio's Industry Licensing Board first, then the department's packet — licensing rather than permitting.\n- **Several pipe runs on one filing.** Each pipe type is its own switch and the linear-feet figure is one number, so a permit with gas *and* water runs adds each run's fee as the counter would; the engine prices the run selected here.\n- **Backflow certifications and inspections as separate services.** The fixture list includes backflow protection devices as fixtures; certification programs price elsewhere and are not in this total.",
    workedExample: {
      scenario:
        "A residential bathroom remodel in a one-, two- or three-family dwelling: six fixtures replaced, no piping rows selected.",
      inputs: {
        fixtures: 6,
        occupancy: "residential",
        workType: "alteration",
        custom: { one_two_family: true },
      },
      notes:
        "The floor is the story here.\n\nFixtures: six at $8.00 each — $48.00. The schedule's fixture list is what counts: water closets, urinals, bathtubs, showers, sinks and the rest of the (k)(1) enumeration.\n\nMinimum: \"the minimum fee for any permit shall be: $50.00\" — a floor on the whole permit, not on the row, so the $2.00 shortfall is charged and the permit's fee before surcharge is $50.00.\n\nState surcharge: one-, two- or three-family dwelling, so the 1% is itemised on the final cost — $0.50.\n\nTotal: $48.00 → floored to $50.00 → + $0.50 = $50.50. What moves it: seven fixtures compute $56.00 and the floor stops binding; an eighth adds another $8.00; selecting 250 feet of water distribution piping adds three whole 100-foot segments at $13.00 ($39.00); a potable-water connection for irrigation adds the ordinance's $50.00; and an OBC-class version of this permit carries no surcharge line at all.",
    },
    faqs: [
      {
        question: "How much is a plumbing permit in Cleveland?",
        answer:
          "Three groups under a $50 minimum: $8.00 for each plumbing fixture, appliance or device the schedule lists; $13.00 for each 100 lineal feet or fraction of gas piping, drains, storm/foundation drains, sanitary sewers or water distribution piping (whichever types the job has); and $50.00 for repairs to existing plumbing. A potable-water connection for non-potable uses is $50.00. If the total is under $50.00, the permit pays $50.00.",
        sourceId: CLEVELAND_CODE_SOURCE_KEY,
      },
      {
        question: "Is the fee based on the value of the work?",
        answer:
          "No. The plumbing schedule reads counts only — fixtures installed and linear feet of pipe — plus its flat rows. Nothing on this page changes because the job got more expensive.",
        sourceId: CLEVELAND_CODE_SOURCE_KEY,
      },
      {
        question: "How is pipe charged?",
        answer:
          "In whole 100-foot segments: \"$13.00 for each 100 lineal feet or fraction\" for each of five pipe types — gas, drains and waste, storm and foundation, sanitary, and water distribution. 250 feet rounds up to three segments and costs $39.00. Each pipe type is selected separately, so a gas run and a water run each price their own footage.",
        sourceId: CLEVELAND_CODE_SOURCE_KEY,
      },
      {
        question: "Why does my six-fixture permit cost $50 and not $48?",
        answer:
          "Because the schedule sets a floor under the whole permit: \"the minimum fee for any permit shall be: $50.00\". Six fixtures compute $48.00, so the $2.00 difference is added as the shortfall — and on a residential dwelling the itemised 1% state surcharge then brings the total to $50.50.",
        sourceId: CLEVELAND_CODE_SOURCE_KEY,
      },
      {
        question: "Is a potable-water connection $13 or $50?",
        answer:
          "$50.00. The ordinance's (k)(2)F row — connection to a potable water line for non-potable uses such as irrigation or fire suppression — says $50.00, while the department page prints $13.00 for the same row, apparently copied from the piping rows above it. This site charges the ordinance's figure and records the conflict rather than splitting the difference.",
        sourceId: CLEVELAND_CODE_SOURCE_KEY,
      },
    ],
    seoTitle: "Cleveland plumbing permit cost: $8 per fixture",
    seoDescription:
      "Cleveland plumbing permit fees — $8.00 per fixture, $13.00 per 100 lineal feet of pipe by type, $50 repairs, a $50 permit minimum charged as the shortfall, and the residential 1% state surcharge.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: CLEVELAND_LAST_VERIFIED,
  },
];

const verifications: SeedVerification[] = [
  {
    entityType: "source",
    entityKey: CLEVELAND_CODE_SOURCE_KEY,
    status: "verified",
    method: "manual_review",
    verifiedAt: CLEVELAND_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: CLEVELAND_CODE_SOURCE_KEY,
    notes:
      "Read 2026-09-25 through the rendered codifier (plain fetchers are 403'd): § 3105.25 in full — the valuation preamble, the NOTE that trade fees are separate, both RC 3781.10(E) paragraphs, and divisions (a)–(m) with every rate, floor and tier. Ord. 708-10's dates carried into the schedule row. RC 3781.10 itself was attempted on six hosts and is recorded unreachable; the ordinance quotes its operative rule twice.",
  },
  {
    entityType: "source",
    entityKey: CLEVELAND_FEE_PAGE_SOURCE_KEY,
    status: "verified",
    method: "manual_review",
    verifiedAt: CLEVELAND_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: CLEVELAND_FEE_PAGE_SOURCE_KEY,
    notes:
      "Read 2026-09-25 in full: the recreation's self-description and 2014 date, plan examination with its floor, zoning's four rows, site development, SWPPP, certificate of occupancy, both late-fee tiers, the $40/$100 special inspections, the festival trio, and its trade restatements. Three conflicts with the ordinance captured verbatim — $13 vs $50 potable, the 3% OBC boilerplate, and the residential zoning row the ordinance omits.",
  },
  {
    entityType: "source",
    entityKey: CLEVELAND_DEPARTMENT_SOURCE_KEY,
    status: "verified",
    method: "manual_review",
    verifiedAt: CLEVELAND_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: CLEVELAND_DEPARTMENT_SOURCE_KEY,
    notes:
      "Read 2026-09-25 with the contact-list page: every phone number in the department row, the state-licensing-then-packet sequence, the Accela portal URL, and the Board of Building Standards appeal path.",
  },
  {
    entityType: "fee_schedule",
    entityKey: CLEVELAND_KEYS.codeSchedule,
    status: "verified",
    method: "manual_review",
    verifiedAt: CLEVELAND_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: CLEVELAND_CODE_SOURCE_KEY,
    notes:
      "The schedule row carries the ordinance's own effective date (2010-08-20) and points at the codified section; all code-sourced rules validate against it.",
  },
  {
    entityType: "fee_schedule",
    entityKey: CLEVELAND_KEYS.pageSchedule,
    status: "verified",
    method: "manual_review",
    verifiedAt: CLEVELAND_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: CLEVELAND_FEE_PAGE_SOURCE_KEY,
    notes:
      "The schedule row carries the page's stated 2014-01-02 effective date; every page-sourced rule (plan examination, zoning, site, SWPPP, CO, late fees, festival) validates against it.",
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-RES-NEW",
    permitTypeKey: "building",
    status: "verified",
    method: "manual_review",
    verifiedAt: CLEVELAND_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: CLEVELAND_CODE_SOURCE_KEY,
    notes:
      '"(a)(1) New buildings and additions … $10.00 for each $1,000.00 or fraction of estimated cost — $150.00" — the round-up asserted beside the alterations row ($5.00, floor $30) and against the OBC tiers; the class switch is the schedule\'s own scope words.',
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-OBC-NEW-ABOVE",
    permitTypeKey: "building",
    status: "verified",
    method: "manual_review",
    verifiedAt: CLEVELAND_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: CLEVELAND_CODE_SOURCE_KEY,
    notes:
      '"From $1,000,001.00 up, $12,000.00 plus $7.00 for each $1,000.00 or fraction of estimated cost above $1,000,000.00" — threshold, base and round-up all on the ordinance\'s own figures, with the seam asserted from both sides: $1,000,000 pays $12,000 from the lower rule, $1,000,001 pays $12,007 from this one.',
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-STATE-SURCHARGE-1PCT",
    permitTypeKey: "building",
    status: "verified",
    method: "manual_review",
    verifiedAt: CLEVELAND_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: CLEVELAND_CODE_SOURCE_KEY,
    notes:
      '"…the required surcharge shall be calculated on the final cost of each permit issued and shall be separately itemized" — 1% on fee_subtotal so permit and plan examination are inside the base while zoning and late fees sit outside, gated on the residential class; the OBC side of the same paragraphs produces no rule at all, which is the reading asserted by the worked example\'s absent fifth line.',
  },
  {
    entityType: "fee_rule",
    entityKey: "ELEC-SIGNS",
    permitTypeKey: "electrical",
    status: "verified",
    method: "manual_review",
    verifiedAt: CLEVELAND_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: CLEVELAND_CODE_SOURCE_KEY,
    notes:
      '"For the first electrical sign — $50.00; Add for each additional electric sign installed at the same time — $30.00" — one row with the first sign inside its base (baseCents + thresholdUnits 1); three signs are $110.00, asserted in the tests.',
  },
  {
    entityType: "fee_rule",
    entityKey: "PLUMB-MIN",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "manual_review",
    verifiedAt: CLEVELAND_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: CLEVELAND_CODE_SOURCE_KEY,
    notes:
      '"the minimum fee for any permit shall be: $50.00" — a permit_minimum on permit_fee sorted after the rows (priority 200) so it reads the accumulated base; six fixtures at $8 compute $48.00 and pay the $2.00 shortfall, asserted beside a seven-fixture permit where the floor does not bind.',
  },
  {
    entityType: "permit_page",
    entityKey: "building-permit-cost",
    permitTypeKey: "building",
    status: "verified",
    method: "manual_review",
    verifiedAt: CLEVELAND_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: CLEVELAND_CODE_SOURCE_KEY,
    notes:
      "Gate-checked 2026-09-25: the ordinance read in full beside the department page; the worked example reproduces a $7,810.00 commercial alteration (ladder $7,500 + plan exam $160 + zoning $150) with the state surcharge correctly absent on OBC work, and every conflict the profile quotes is verbatim from one of the two documents.",
  },
  {
    entityType: "permit_page",
    entityKey: "electrical-permit-cost",
    permitTypeKey: "electrical",
    status: "verified",
    method: "manual_review",
    verifiedAt: CLEVELAND_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: CLEVELAND_CODE_SOURCE_KEY,
    notes:
      "Gate-checked 2026-09-25 against § 3105.25(l): the either/or instruction wired as mutual exclusion between the area row and the item rows, the $50 floor as a permit_minimum, and the worked example's $303.00 (area $300 + itemised 1%).",
  },
  {
    entityType: "permit_page",
    entityKey: "plumbing-permit-cost",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "manual_review",
    verifiedAt: CLEVELAND_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: CLEVELAND_CODE_SOURCE_KEY,
    notes:
      "Gate-checked 2026-09-25 against § 3105.25(k): three groups summed, the $50 floor asserted from both sides (six fixtures pay $50, seven pay $56), the $13-per-100 segment round-up, and the potable row charged at the ordinance's $50 against the page's $13.",
  },
  {
    entityType: "jurisdiction_profile",
    entityKey: CLEVELAND_KEYS.jurisdiction,
    status: "verified",
    method: "manual_review",
    verifiedAt: CLEVELAND_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: CLEVELAND_FEE_PAGE_SOURCE_KEY,
    notes:
      "The profile states the readings the model depends on — ordinance governs the conflicts, surcharge built in for OBC and itemised for residential, counts where the schedule counts — and keeps every document fact a reader would trip on: the page's 2014 self-date against the 2010 ordinance, its three contradictions, and RC 3781.10's unreachability.",
  },
];

export const clevelandSeed: JurisdictionSeed = {
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
export const CLEVELAND_PUBLISHED_PERMIT_PAGES = clevelandSeed.permitPages.filter(
  (page) => page.publishStatus === "published" && !page.noindex,
);
