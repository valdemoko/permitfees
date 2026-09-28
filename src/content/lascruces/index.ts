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
  LC_BUILDING_BASE_RULES,
  LC_ELECTRICAL_BASE_RULES,
  LC_FEE_EFFECTIVE_FROM,
  LC_PLUMBING_BASE_RULES,
  LC_RESOLUTION_SOURCE_KEY,
} from "./fee-rules";

export * from "./fee-rules";

/**
 * The complete Las Cruces, New Mexico seed payload.
 *
 * Every figure traces to research/new-mexico/las-cruces.md, which traces to City of Las
 * Cruces Resolution 21-019 (adopted August 17, 2020), Exhibit "A" — the unified Community
 * Development fee schedule effective September 1, 2020, the document that repealed seven
 * earlier fee resolutions and replaced them with one. Nothing is estimated.
 *
 * Three pages, all published: building, electrical and plumbing. Mechanical, roofing,
 * grading, signs and the rest of the schedule are named on the pages rather than priced.
 */

const RESEARCHER = "Permit Fee Intelligence research pass 12 (New Mexico)";

export const LC_LAST_VERIFIED = "2026-09-25";

export const LC_KEYS = {
  state: "nm",
  county: "dona-ana-county",
  jurisdiction: "las-cruces",
  feeSchedule: "las-cruces-2020-schedule-of-fees",
} as const;

const state: SeedState = {
  code: "NM",
  slug: "new-mexico",
  name: "New Mexico",
  fipsCode: "35",
};

const county: SeedCounty = {
  key: LC_KEYS.county,
  slug: "dona-ana-county",
  name: "Doña Ana County",
  fipsCode: "35013",
};

const jurisdiction: SeedJurisdiction = {
  key: LC_KEYS.jurisdiction,
  stateKey: LC_KEYS.state,
  countyKey: LC_KEYS.county,
  type: "city",
  slug: "las-cruces",
  name: "Las Cruces",
  officialName: "City of Las Cruces",
  websiteUrl: "https://lascruces.gov/",
  permitPortalUrl: "https://lascruces.civicweb.net/",
  timezone: "America/Denver",
  isActive: true,
};

const departments: SeedDepartment[] = [
  {
    key: "las-cruces-one-stop-shop",
    jurisdictionKey: LC_KEYS.jurisdiction,
    kind: "building",
    name: "Community Development Department — One Stop Shop",
    phone: "575-528-3059",
    email: null,
    url: "https://lascruces.civicweb.net/",
    addressLine: "700 N. Main St., Suite 1100, P.O. Box 20000, Las Cruces, NM 88001",
    hours: "Monday to Thursday, 7 a.m. to 6 p.m.; Friday, 7 a.m. to 11 a.m.",
    notes:
      "The schedule itself carries the office's contact block: project specialists take consultations by appointment at 575-528-3059, and there is a walk-in Pre-Application Conference in City Hall Room 1158 from 1:30 to 2:30 p.m. every Wednesday. Payment is cash or check in the office, with cards and ACH accepted on the website. The address and the service-centre hours are the schedule's own. The City's general website (lascruces.gov) answers plain clients with a bot challenge, so the URLs recorded here are the City's document portal, which serves the resolution itself, rather than pages this pass could not read.",
  },
];

const sources: SeedSource[] = [
  {
    key: LC_RESOLUTION_SOURCE_KEY,
    jurisdictionKey: LC_KEYS.jurisdiction,
    title:
      'City of Las Cruces Resolution 21-019 — repealing seven earlier fee resolutions and replacing them with a unified Community Development fee schedule, effective September 1, 2020 (Exhibit "A", 2020 Schedule of Fees)',
    url: "https://lascruces.civicweb.net/document/7542",
    sourceType: "ordinance",
    issuingAuthority: "City of Las Cruces",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2020-08-17",
    effectiveFrom: LC_FEE_EFFECTIVE_FROM,
    retrievedAt: LC_LAST_VERIFIED,
    lastVerifiedAt: LC_LAST_VERIFIED,
    notes:
      "Read 2026-09-25 from the City's own document portal, which serves the resolution as a text-extractable PDF. Adopted August 17, 2020; the resolution's title states it is \"to be effective September 1, 2020\" and its enactment clause repeats the date. The whole fee schedule is Exhibit \"A\": general information and contact block, administrative fees (technology fees, expedited review, revision fees), building permit fees (the $0.20 residential rate, the commercial valuation process, plan check, the Fee Table and the scope and local-area modifiers), the ICC-derived valuation tables, electrical, mechanical, plumbing, roofing, demolition and other building permit fees, site permit and grading fees, floodplain, rock walls, signs, fire systems, mobile home installation, inspection fees, right-of-way, traffic, land-use and administrative review application fees, the unpermitted-work variance fees, and a historic preservation section marked \"to be developed\". Every rate modelled on this site comes from this one document.",
  },
];

/** Empty on purpose: the permit types Las Cruces uses already exist as shared rows. */
const permitTypes: JurisdictionSeed["permitTypes"] = [];
const projectTypes: JurisdictionSeed["projectTypes"] = [];

const jurisdictionPermitTypes: SeedJurisdictionPermitType[] = [
  {
    jurisdictionKey: LC_KEYS.jurisdiction,
    permitTypeKey: "building",
    isAvailable: true,
    localName: "Building permit (plan check charged as the first 25% of the fee)",
    officialUrl: "https://lascruces.civicweb.net/document/7542",
    notes:
      "Two paths. A new single-family dwelling, townhouse or duplex is $0.20 per square foot of gross floor area measured to the outside walls; \"Remodels and additions follow the commercial process\", which is the Fee Table — seven bands from a flat $50 under $2,000 to $5,830 plus $4 per $1,000 above $1,000,000, on the value of the work covered. Plan check is the first 25% of the building permit fee, due at application and non-refundable. Technology fee $20 residential or the greater of $100 / 5% commercial. Fees are tripled for work started without a permit.",
  },
  {
    jurisdictionKey: LC_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    isAvailable: true,
    localName: "Electrical permit",
    officialUrl: "https://lascruces.civicweb.net/document/7542",
    notes:
      "Residential work on a one- or two-unit dwelling or townhome is priced on enclosed living area: $35 under 1,000 sq ft, $65 to 1,499, then $110 plus $5.00 per 100 sq ft over 2,000. Commercial new services are priced in amps: $130 / $200 / $300 through 400 amps, then $300 plus $50 per 100 amps over 401. Miscellaneous rows at $45 and $90/$180 for pools; residential solar photovoltaic $250 including plan review and inspections; plan review $45 unless part of the building permit; trade technology fee $10. The commercial \"Service Change\" row is printed with no amount, and the schedule says so by omission.",
  },
  {
    jurisdictionKey: LC_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    isAvailable: true,
    localName: "Plumbing permit",
    officialUrl: "https://lascruces.civicweb.net/document/7542",
    notes:
      "New construction is priced by bathrooms and dwelling units — $100 for one unit at 1½ baths or less, $150 for one or two units at 2–3½ baths, $200 for one or two units at 4+ baths, and $200 plus $30 a unit above two units for larger structures, with a rough-in counted as a bathroom. Everything else follows the plumbing valuation: $50 at $500 or less, $100 to $1,000, then $100 plus $5 per $1,000 or fraction above. Trade technology fee $10; fees tripled without a permit.",
  },
  {
    jurisdictionKey: LC_KEYS.jurisdiction,
    permitTypeKey: "mechanical",
    isAvailable: true,
    localName: "Mechanical permit (named, not priced on this site)",
    officialUrl: "https://lascruces.civicweb.net/document/7542",
    notes:
      "Published on the same schedule as three bands on the value of the mechanical materials and labor: $50 at $500 or less, $100 from $500.01 to $1,000, then $100 for the first $1,000 plus $5.00 for each additional $1,000 or fraction thereof — the same ladder shape as the plumbing valuation rows, round-up phrase included. Transcribed in the research record and named on the plumbing page; not priced here, because this release's three pages follow the building, electrical and plumbing pattern.",
  },
];

const feeSchedules: SeedFeeSchedule[] = [
  {
    key: LC_KEYS.feeSchedule,
    jurisdictionKey: LC_KEYS.jurisdiction,
    sourceKey: LC_RESOLUTION_SOURCE_KEY,
    title: "City of Las Cruces — 2020 Schedule of Fees (Resolution 21-019, Exhibit A)",
    officialUrl: "https://lascruces.civicweb.net/document/7542",
    effectiveFrom: LC_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: LC_LAST_VERIFIED,
    notes:
      "One document for every Community Development fee, effective September 1, 2020, repealing Resolutions 90-235, 00-360, 03-361, 03-009, 11-221, 14-026 and 19-131. No amendment to it was published on the City's portal as of this pass; the schedule's rates in effect at permit issuance — \"The rates in effect at the time of permit issuance apply unless otherwise noted\" — are these.",
  },
];

function attach(permitTypeKey: string, rules: SeedFeeRule["rule"][]): SeedFeeRule[] {
  return rules.map((rule) => ({
    jurisdictionKey: LC_KEYS.jurisdiction,
    permitTypeKey,
    scheduleKey: LC_KEYS.feeSchedule,
    rule,
  }));
}

const feeRules: SeedFeeRule[] = [
  ...attach("building", LC_BUILDING_BASE_RULES),
  ...attach("electrical", LC_ELECTRICAL_BASE_RULES),
  ...attach("plumbing", LC_PLUMBING_BASE_RULES),
];

const requirements: SeedRequirement[] = [
  {
    jurisdictionKey: LC_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "document",
    title: "The valuation of the work covered, with the schedule's two modifiers built into it",
    description:
      'Resolution 21-019, Commercial Building Permit Fee: "This fee is based on the value of the work covered by the permit. It shall be determined using the City of Las Cruces Valuation Table (pp. 8-9) as adjusted by the scope modifier and the local area modifier (p. 7)." The valuation table\'s own footnote makes the order explicit: "*Local area modifier and scope modifier will be applied to the table values above." The scope modifier is a percentage of value by work type — 100% for new and additions, 75% shell, 50% remodel, repair, tenant finish and tenant remodel — and the local area modifier is 88%, the ICC\'s national cost data adjusted to Las Cruces. The determination itself belongs to the building official: "The determination of the valuation of any construction shall be made by the building official based on the adopted Building Valuation Data Table."',
    isMandatory: true,
    sortOrder: 10,
    sourceKey: LC_RESOLUTION_SOURCE_KEY,
    lastVerifiedAt: LC_LAST_VERIFIED,
  },
  {
    jurisdictionKey: LC_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "document",
    title: "Plan check is paid with the application — the first 25% of the fee",
    description:
      'Resolution 21-019, PLAN CHECK FEE: "Plan check fee is the first 25% of the building permit fee for residential and commercial applications. This fee applies to building and sitework permits to assure that the design complies with all city codes. Fee is due at the time of application and is non-refundable. The rate in effect at the time of application applies." The first quarter of the fee, at application, on the rate in effect that day — not a separate charge added to the total.',
    isMandatory: true,
    sortOrder: 20,
    sourceKey: LC_RESOLUTION_SOURCE_KEY,
    lastVerifiedAt: LC_LAST_VERIFIED,
  },
  {
    jurisdictionKey: LC_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "Work that starts without a permit triples the fee — and asks for a variance first",
    description:
      'The standing sentence above the building, electrical, mechanical, plumbing, roofing, demolition, grading, sign and right-of-way schedules: "This fee is tripled on permits for work started or completed without an approved permit." The schedule also carries an UNAPPROVED OR NON-PERMITTED FEES table for the variance process that such work requires — $100 under $500 of valuation, $250 to $2,500, $500 to $10,000, $1,000 to $20,000 and $2,000 above — assessed before a variance request will be heard, and charged by the board rather than by the permit.',
    isMandatory: true,
    sortOrder: 30,
    sourceKey: LC_RESOLUTION_SOURCE_KEY,
    lastVerifiedAt: LC_LAST_VERIFIED,
  },
  {
    jurisdictionKey: LC_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    requirementType: "document",
    title: "A rough-in counts as a bathroom",
    description:
      'Resolution 21-019, Residential Plumbing Permit Fees: "For new construction, the fee is based on the number of bathrooms and/or dwelling units. Please note that a roughed-in bathroom constitutes a bathroom." The three residential bands are pairs of facts — dwelling units and bathrooms — so both numbers are asked for, and a structure between 3½ and 4 baths falls in no printed band.',
    isMandatory: true,
    sortOrder: 10,
    sourceKey: LC_RESOLUTION_SOURCE_KEY,
    lastVerifiedAt: LC_LAST_VERIFIED,
  },
];

const profile: SeedProfile = {
  jurisdictionKey: LC_KEYS.jurisdiction,
  headline: "What construction permits cost in Las Cruces",
  summary:
    "Las Cruces prices a building permit by **two paths drawn in one sentence**: a new single-family dwelling, townhouse or duplex is **$0.20 per square foot** of gross floor area measured to the outside walls, and \"Remodels and additions follow the commercial process\" — the **Fee Table**, seven bands running from a flat $50 under $2,000 to $5,830 plus $4 for each additional $1,000 above $1,000,000 of valuation. Plan check is **the first 25% of the building permit fee**, paid with the application and non-refundable — part of the fee rather than a charge on it. Every permit also carries a **technology fee** ($20 residential building, the greater of $100 or 5% commercial, $10 a trade permit), and every schedule on the document ends with the same line: fees are **tripled** for work started without an approved permit. Electrical is priced by enclosed living area on a dwelling and by amperage on a commercial service; plumbing by bathroom count when new and by plumbing valuation otherwise.",
  localContext:
    "Las Cruces consolidated its fee schedules into one document on September 1, 2020, and the consolidation is visible in the result: Resolution 21-019 repealed seven earlier resolutions — 90-235, 00-360, 03-361, 03-009, 11-221, 14-026 and 19-131 — and replaced them with a single \"2020 Schedule of Fees\" that carries everything from building permits to land-use application fees. The schedule's own background note records what the consolidation was for: costs had risen \"approximately 41% since the last fee schedule was approved in July 2002\", the single-family rate had already been raised from $0.14 to $0.20 a square foot by Resolution 19-131 in 2019, and the commercial side was rebuilt on \"the International Building Code (IBC) fee modeling\" with a cost-recovery target of 80% of the One Stop Shop's expenses. Reading the schedule as one document rather than as seven is what makes its cross-references legible.\n\nThe commercial side's machinery has three layers, and they happen in order. First the **valuation**: the building official determines it \"based on the adopted Building Valuation Data Table\", and the schedule's own square-foot costs — the ICC's February 2020 Valuation Table — are adjusted by two published multipliers before anything is charged: the **scope modifier** (100% of value for new work and additions, 75% for a shell, 50% for remodels, repairs and tenant work) and the **local area modifier** of 88%, which is the ICC's national cost data scaled to Las Cruces. The table's footnote is blunt about it: \"Local area modifier and scope modifier will be applied to the table values above.\" Second the **Fee Table** reads that determined valuation in seven bands. Third the **plan check** takes the first 25% of the result as the application payment.\n\nTwo details of the Fee Table are worth knowing before any number on it is trusted. The first is that the bands **prorate**: they say \"$10 for each additional $1000\" with no \"or fraction thereof\", while the mechanical and plumbing ladders in the same document print that phrase and mean it — so a $2,001 valuation is $50.01, not $60, and the table closes each band at exactly the next band's printed base ($280, $480, $830, $5,830). The second is that the table **disagrees with itself once**: the $500,001–$1,000,000 band opens at $3,330, while the band below computes $3,230 at $500,000 — a $100 jump that is the document's own. This site charges each band's printed formula and states the jump on the page rather than smoothing it.\n\nThe last thing running through every schedule is the tripling. \"This fee is tripled on permits for work started or completed without an approved permit\" sits above the building, electrical, mechanical, plumbing, roofing, demolition, grading, sign and right-of-way fees alike, and it multiplies the *permit fee* — not the technology fee beside it, and not the plan check, which was already inside the fee. A separate variance table ($100 to $2,000 by valuation) is what the unpermitted work pays to be heard before the appropriate board, and it is a hearing fee rather than a permit fee, so it is named on the pages and charged by none of them.",
  valuationBasis:
    "Two bases, and the schedule says which permit uses which. The residential-new path is **square footage**: \"$0.20 per square ft of gross floor area measured to the outside walls\" — the one price in the document that never sees a valuation, set by Resolution 19-131 when it replaced $0.14. Everything else on the building side is **valuation**: \"the value of the work covered by the permit\", without land cost, as determined by the building official against the adopted Building Valuation Data Table and built from the ICC cost table adjusted by the scope and local-area modifiers. The Fee Table's left column is headed \"Total Project Valuation (without land cost)\", and that is the number the seven bands read.\n\nThe trades use two more. Electrical, when it is not a flat miscellaneous row, is **enclosed living area** on a one- or two-unit dwelling or townhome and **amperage** on a commercial service — the schedule never prices electrical work by its value, which is why a service upgrade costs the same whether the building behind it is worth $300,000 or $3,000,000. Plumbing is **bathroom and dwelling-unit counts** for new construction and a third valuation — \"the total dollar value of the complete plumbing installation including materials, fixtures, and all installation costs\" — for everything else, a plumbing figure separate from the building valuation the same job also carries.",
  notIncluded:
    "These figures are Las Cruces's building, electrical and plumbing permit fees from the 2020 Schedule of Fees, with the technology fees, the plan-check split, the expedited option and the tripling for unpermitted work. They are not a total project cost, and they exclude:\n\n- **Mechanical** — the schedule's own three bands on material value ($50 / $100 / $100 plus $5 per $1,000 or fraction), named on the plumbing page as the ladder it shares, and **roofing** (the building schedule applies \"per the applicant's valuation\") and **demolition** ($0 with the building permit, $50 interior non-load bearing, $175 all other).\n- **Site work**: grading ($100 under an acre, $250 to three acres, then $250 plus $25 an acre, and $425 plus $10 an acre above ten), floodplain review ($150), the site cleanup fee ($1,000 plus cost), rock retaining walls (5% of construction value), right-of-way permits (5% of construction value), traffic review ($50 control review, $175–$350 for occupied lanes, $85 an hour for impact analysis), and the erosion, storage and temporary-equipment rows that carry no fee \"at this time\".\n- **Signs** ($45 attached, $70 pole, $100 monument, $250 site-plan groups, billboards and real-estate signs, face changes free), **fire systems** (head-count ladders from $120 to $640 plus $200 per hundred, alarm devices $160–$320, hoods $80, after-hours at $60 an hour) and the **mobile home installation** permit ($75, zoning and floodplain only).\n- **Certificates and other building fees**: change of occupancy ($45 without inspection, $100 with), permit reinstatement (25% of the building permit fee), a temporary certificate of occupancy (the greater of $100 or 25% of the fee) and a same-day certificate ($100).\n- **Inspection charges beyond reinspection**: after-hours at $60 an hour with a two-hour minimum, partial inspections at $45, the $150 charged for a second or more reinspection on the same team, and fire after-hours the same $60 an hour. The $45 reinspection is the one modelled here.\n- **The revision/addendum fee** ($45 per reviewer) and every land-use and administrative review application fee — rezonings, plats, subdivisions, variances, street names, addressing — which are charged for reviews rather than for permits.\n- **The UNAPPROVED OR NON-PERMITTED variance fees** ($100 to $2,000), assessed before a variance request will be heard — a board's fee, not a permit's.\n- **Fee waivers and the infill incentive**: fees are not waived except where the Municipal Code allows it, and qualifying infill projects may be reimbursed the cost of permit fees on a certificate of occupancy, with reimbursements above $5,000 needing City Council approval.\n- **Anything charged by another authority** — Doña Ana County, the State of New Mexico, the utility's own service charges, and the \"Utility Fees\" section the plumbing fee's cross-reference points at, which this resolution does not contain.",
  seoTitle: "Las Cruces construction permit fees",
  seoDescription:
    "How Las Cruces prices construction permits — $0.20 per square foot for a new dwelling, the seven-band Fee Table from $50 to $5,830 plus $4 per $1,000, plan check at 25% of the fee, and tripled fees for unpermitted work.",
  publishStatus: "published",
  noindex: false,
  lastReviewedAt: LC_LAST_VERIFIED,
};

const permitPages: SeedPermitPage[] = [
  {
    jurisdictionKey: LC_KEYS.jurisdiction,
    permitTypeKey: "building",
    slug: "building-permit-cost",
    title: "Las Cruces building permit cost",
    intro:
      "Las Cruces draws the line between its two building-permit prices in a single sentence: a **new single-family dwelling, townhouse or duplex** is **$0.20 per square foot** of gross floor area measured to the outside walls, and \"Remodels and additions follow the commercial process\" — which is the **Fee Table**, seven bands from a flat $50 under $2,000 up to $5,830 plus $4 for each additional $1,000 above $1,000,000 of total project valuation without land. Plan check is **the first 25% of the building permit fee**, due with the application and non-refundable — the first quarter of the fee, not a charge on it. A **technology fee** rides every permit ($20 residential, the greater of $100 or 5% commercial), and fees are **tripled** for work started without an approved permit.",
    localSummary:
      "The two paths meet at the same house. A new 1,600-square-foot duplex is $320.00 — 1,600 × $0.20 — plus the $20 technology fee. The same 1,600 square feet remodelled is a commercial-process job: if the value of the covered work is $120,000, the Fee Table charges the $100,001–$500,000 band, $830 for the first $100,000 plus $6 per $1,000 above it — $950.00 — and the commercial technology fee is the greater of $100 or 5% of the $950, which is $100. The rate you pay follows the work, not the wall.\n\nPlan check is the second thing to settle, and it behaves unlike the plan-review charges in most cities: \"Plan check fee is the first 25% of the building permit fee\" — part of the fee, paid at application, non-refundable, with the rest at issuance. On that $950 permit the application takes $237.50 and issuance takes the remaining $712.50. This site shows the split as a payment schedule and does not add 25% to any total.\n\nThe Fee Table has two seams worth knowing about. Its bands prorate — \"$10 for each additional $1000\" with no \"or fraction thereof\" — so $2,001 costs $50.01 rather than $60.00, and each band closes at exactly the next band's printed base ($280, $480, $830, $5,830). And it disagrees with itself once: the $500,001 band opens at $3,330 while the band below computes $3,230 at $500,000 — a $100 jump the document prints and this page charges, rather than reconciling.",
    notIncluded:
      "This is the building permit fee — the $0.20 residential-new rate or the Fee Table — with the technology fee, the plan-check payment split, the expedited option and the tripling for unpermitted work. It excludes:\n\n- **Plan check is not an extra fee**: it is the first 25% of this fee, shown as the application payment rather than added to the total. The Administrative Fees table's separate **Revision/Addendum Fee** ($45 per reviewer) is a charge this site does not model, because the number of reviews is not knowable at application.\n- **Mechanical, roofing and demolition**: mechanical has its own three-band ladder on material value ($50 / $100 / $100 plus $5 per $1,000 or fraction); roofing is priced by \"the Building Permit Fee schedule ... per the applicant's valuation\"; demolition is $0 with a building permit, $50 for interior non-load bearing work and $175 for all other. Named on the plumbing and building pages, not priced.\n- **Site work**: grading ($100 under an acre, $250 to three acres, $250 plus $25 an acre to ten, $425 plus $10 an acre above), floodplain review ($150), the site cleanup fee ($1,000 plus cost), rock retaining walls (5% of construction value), right-of-way permits (5% of construction value), and traffic review ($50 control review, $175–$350 per week or month for occupied lanes, $85 an hour for impact analysis).\n- **Signs** ($45–$250 by type), **fire systems** (head-count ladders from $120 to $640 plus $200 per hundred, alarm devices, hoods, after-hours at $60 an hour), and the **mobile home installation** permit ($75).\n- **Certificates and other building fees**: change of occupancy ($45 without inspection, $100 with), permit reinstatement (25% of the building permit fee), a temporary certificate of occupancy (the greater of $100 or 25% of the fee) and a same-day certificate ($100).\n- **The expedited option itself**: modelled and gated — it is charged only when expedited review is requested — but a reader should know it exists before assuming a normal timeline: the greater of $1,000 or an additional permit fee.\n- **The UNAPPROVED OR NON-PERMITTED variance fees** ($100 to $2,000 by valuation), which a board charges before it will hear a variance for work done without a permit — separate from the tripling this page charges.\n- **Fee waivers and the infill incentive**: fees are waived only where the Municipal Code allows it and then credited from a city account, and qualifying infill projects may be reimbursed permit fees on a certificate of occupancy, above $5,000 only with City Council approval.\n- **Anything charged by another authority** — Doña Ana County, the State, the utility, and the land-use and administrative review application fees ($150–$1,000) that run alongside a permit rather than as one.",
    workedExample: {
      scenario:
        "A commercial remodel whose covered work is valued at $120,000 without land — the commercial process, not the residential-new rate — with a normal (non-expedited) review.",
      inputs: {
        valuationCents: 12_000_000,
        occupancy: "commercial",
        workType: "remodel",
        custom: { one_two_family: false },
      },
      notes:
        "The valuation sits in the $100,001–$500,000 band: $830.00 for the first $100,000, plus $6.00 for each of the twenty additional thousands — $950.00. The commercial technology fee is then the greater of $100.00 or 5% of that $950.00, and 5% is $47.50, so the $100.00 floor binds and the total is $1,050.00.\n\nPlan check is already inside those numbers. \"Plan check fee is the first 25% of the building permit fee\" — $237.50 of this $950.00 is due with the application and non-refundable, and the remaining $712.50 comes due at issuance. The $100 technology fee is a separate administrative charge and is not part of the 25%.\n\nTwo things are absent because this job answered the questions. Expedited review would add the greater of $1,000 or another $950.00 — $1,000.00 — on request; and had this work started without a permit, the schedule's standing sentence would triple the permit fee, adding $1,900.00 to it while leaving the technology fee and the plan-check split alone. The $20 residential technology fee never applies here because the schedule prices commercial building permits differently, and the answer of \"commercial\" is what selects it.",
    },
    faqs: [
      {
        question: "How does Las Cruces calculate a building permit fee?",
        answer:
          "Two ways, selected by one sentence. A new single-family dwelling, townhouse or duplex is $0.20 per square foot of gross floor area measured to the outside walls. Everything else — remodels, additions, and all commercial work — follows the commercial process: the Fee Table, seven bands on the total project valuation without land cost, from a flat $50 under $2,000 to $5,830 plus $4 per $1,000 above $1,000,000. A technology fee and the plan-check payment ride along.",
        sourceId: LC_RESOLUTION_SOURCE_KEY,
      },
      {
        question: "What is the plan check fee — is it extra?",
        answer:
          "It is not extra. The schedule says \"Plan check fee is the first 25% of the building permit fee for residential and commercial applications ... Fee is due at the time of application and is non-refundable.\" It is the first quarter of the fee itself, paid when the plans go in, with the rest due at issuance — a payment schedule rather than a surcharge, so this site does not add 25% to any total.",
        sourceId: LC_RESOLUTION_SOURCE_KEY,
      },
      {
        question: "What are the scope and local area modifiers?",
        answer:
          "Two published multipliers that build the valuation the Fee Table reads: the scope modifier, which is a percentage of value by work type (100% for new and additions, 75% for a shell, 50% for remodels, repairs, tenant finishes and tenant remodels), and the local area modifier of 88%, which scales the ICC's national square-foot construction costs to Las Cruces. The valuation table's footnote states both: \"Local area modifier and scope modifier will be applied to the table values above.\" The building official determines the resulting valuation against the adopted Building Valuation Data Table.",
        sourceId: LC_RESOLUTION_SOURCE_KEY,
      },
      {
        question: "Does the Fee Table round partial thousands up?",
        answer:
          "No — and the schedule's own wording is the reason. The fee table's bands say \"$10 for each additional $1000\" with no \"or fraction thereof\", while the mechanical and plumbing ladders in the same document print that phrase and charge a whole increment for a fraction. So $2,001 of valuation is $50.01 on the fee table, not $60.00, and each band closes at exactly the next band's printed base.",
        sourceId: LC_RESOLUTION_SOURCE_KEY,
      },
      {
        question: "What is the technology fee?",
        answer:
          "An administrative charge on every permit of the One Stop Shop: $20 for residential new, alteration and addition permits; the greater of $100 or 5% of the permit fee for commercial ones; $10 a trade permit; $10 other permits. On the building side it is a flat $20 residential and a 5%-with-a-$100-floor commercial, charged with the permit and not tripled by the unpermitted-work sentence.",
        sourceId: LC_RESOLUTION_SOURCE_KEY,
      },
      {
        question: "What happens if work started without a permit?",
        answer:
          "The fee is tripled. Every schedule in the resolution carries the same sentence: \"This fee is tripled on permits for work started or completed without an approved permit\" — so the permit fee itself is charged three times, while the technology fee and plan check are not the permit fee and do not multiply. A variance for the unpermitted work is a separate charge, $100 to $2,000 by valuation, assessed by the board that hears it.",
        sourceId: LC_RESOLUTION_SOURCE_KEY,
      },
    ],
    seoTitle: "Las Cruces NM building permit cost: $0.20 a square foot or the Fee Table",
    seoDescription:
      "Las Cruces, New Mexico building permit fees — $0.20 per square foot for a new dwelling, the seven-band Fee Table ($50 to $5,830 plus $4 per $1,000), plan check as the first 25% of the fee, and tripled fees for unpermitted work.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: LC_LAST_VERIFIED,
  },
  {
    jurisdictionKey: LC_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    slug: "electrical-permit-cost",
    title: "Las Cruces electrical permit cost",
    intro:
      "Las Cruces prices electrical work **by measurement rather than by worth**, and the measurement depends on the building. On a **one- or two-unit dwelling or townhome** the fee is on enclosed living area: **$35.00** under 1,000 sq ft, **$65.00** from 1,000 to 1,499, and **$110.00 plus $5.00 for each 100 sq ft over 2,000** above that — for new work, additions and remodels alike. A **commercial new service** is priced in amps instead: **$130 / $200 / $300** through 400 amps, then **$300 plus $50.00 per 100 amps over 401**. Plan review is **$45.00** when the electrical plans are reviewed on their own (\"unless part of bldg. permit\"), every trade permit carries a **$10 technology fee**, and fees are **tripled** for work started without a permit.",
    localSummary:
      "The residential ladder has a step at 1,000 square feet and a slope above 2,000, with a flat run between them: 999 sq ft is $35.00, 1,000 is $65.00, and 1,500 through 2,000 are all $110.00. Above 2,000 the $5-per-100 rate joins — and the schedule prints no \"or fraction thereof\" beside it, so 2,400 sq ft adds $20.00 rather than $25.00, and the total residential fee on that remodel is $130.00. The phrase matters because the mechanical and plumbing ladders in the same document do print it and do round up.\n\nThe commercial ladder is four rows of amperage with a slope of its own: $130.00 to 150 amps, $200.00 to 200, $300.00 to 400, and 401 or more at $300.00 plus $50.00 per 100 amps over 401 — again prorated, so 451 amps is $325.00 and 401 and 400 cost the same $300.00. What is absent speaks louder: the schedule prints a \"Service Change (Calculated service capacity using cost X 75%)\" row with **no amount beside it**, and this site does not invent one.\n\nSolar is the third thing worth knowing, because it is bundled: a \"Residential solar photo voltaic system (including plan review, building inspection, and electrical inspection)\" is $250.00 flat, and the area rows stand down when it applies rather than charging a second time. The $45 alternative-energy row is explicitly \"does not include solar photo voltaic\" — the schedule keeps the two apart with a parenthesis, and so does this page.",
    notIncluded:
      "This is the electrical permit fee — the residential area ladder, the commercial amperage ladder, the published flat rows, plan review and the $10 technology fee, with tripling for unpermitted work. It excludes:\n\n- **The commercial Service Change row**, printed as \"Service Change (Calculated service capacity using cost X 75%)\" with no fee beside it — the schedule publishes the row and not its price, and no figure is invented for it here. A service change on a one- or two-unit dwelling has no residential row either; both are named rather than priced.\n- **The commercial solar photovoltaic process**: \"Commercial solar photo voltaic system fees are calculated using the commercial building process\" — a building-permit figure, not an electrical one, and this page does not convert it.\n- **The building permit and its plan check**, which a solar installation, a remodel or a new service usually needs alongside: plan review here is $45.00 only when it is not part of the building permit, and the building page's 25% plan check is a different fee for a different review.\n- **The mobile home installation permit** ($75.00, which \"applies to zoning and flood plain management\" — the electrical connection permit is additional and is this page's $45.00 mobile home service row).\n- **Inspection charges beyond reinspection**: after-hours at $60.00 an hour with a two-hour minimum, partial inspections at $45.00, and the $150.00 charged for a \"second or more reinspection fee on same team\" — the $45.00 per-occurrence reinspection is the one modelled.\n- **Fire systems**, which have their own head-count, alarm, hood and pump ladders on the schedule, and the **sign permit** fees ($45–$250) that a lighted sign needs beside its electrical permit.\n- **The expedited option** (the greater of $1,000 or an additional permit fee) and the **UNAPPROVED OR NON-PERMITTED variance fees** ($100–$2,000), both named rather than charged: the first belongs to the building process and the second to a board.\n- **Anything charged by another authority** — the utility's service and connection charges, State licensing, and Doña Ana County.",
    workedExample: {
      scenario:
        "A remodel of a one- or two-family dwelling with 2,400 square feet of enclosed living area, ordinary review, no unpermitted work.",
      inputs: {
        squareFootage: 2_400,
        occupancy: "residential",
        workType: "remodel",
        custom: { one_two_family: true },
      },
      notes:
        "The area ladder answers this job: $110.00 is the base for 1,500 sq ft and above, plus $5.00 for each 100 sq ft over 2,000 — 400 square feet over, prorated, is $20.00. The permit fee is $130.00, and the $10.00 trade technology fee brings the total to $140.00.\n\nThe commercial amperage rows are not charged, and the answer of \"one- and two-family dwelling\" is what excludes them — a service upgrade on this same house would have no residential row to price it with either, because the schedule's amperage ladder is in the commercial section and its commercial \"Service Change\" row is printed without an amount. That gap is the schedule's, and the page states it instead of filling it.\n\nAt 2,000 square feet exactly the fee is $110.00 with no per-100 addition, and at 1,999 it is too — the slope only exists above 2,000. Had this been new construction rather than a remodel, the same area would price the same way: the residential ladder reads \"new, remodels, and additions\" alike.",
    },
    faqs: [
      {
        question: "How does Las Cruces calculate an electrical permit fee?",
        answer:
          "By measurement. On a one- or two-unit dwelling or townhome, the fee is on enclosed living area — $35.00 under 1,000 sq ft, $65.00 to 1,499, $110.00 from 1,500, plus $5.00 per 100 sq ft over 2,000. On a commercial new service it is on amperage — $130.00, $200.00 or $300.00 through 400 amps, then $300.00 plus $50.00 per 100 amps over 401. Every trade permit also carries a $10 technology fee.",
        sourceId: LC_RESOLUTION_SOURCE_KEY,
      },
      {
        question: "Does the electrical fee round up partial hundreds?",
        answer:
          "No. Both sloped rows — $5.00 per 100 sq ft over 2,000, and $50.00 per 100 amps over 401 — print no \"or fraction thereof\", and this schedule uses that phrase where it means it: the mechanical and plumbing ladders carry it and do round up. So 2,400 sq ft adds $20.00 rather than $25.00, and 451 amps adds $25.00 rather than $50.00.",
        sourceId: LC_RESOLUTION_SOURCE_KEY,
      },
      {
        question: "Is electrical plan review an extra $45?",
        answer:
          "Only when the electrical plans are reviewed on their own. The row reads \"Plan Review (unless part of bldg. permit) — $45.00\": when the review happens inside the building permit's plan check, the parenthesis says so and this charge does not apply. It is a flat fee, not a percentage — the 25% plan check belongs to the building fee, not to this page.",
        sourceId: LC_RESOLUTION_SOURCE_KEY,
      },
      {
        question: "How much is a residential solar photovoltaic permit?",
        answer:
          "$250.00, and it is bundled: \"Residential solar photo voltaic system (including plan review, building inspection, and electrical inspection): $250.00.\" The area ladder stands down when it applies, so the three reviews it names are not charged again. The separate $45.00 alternative energy row states \"does not include solar photo voltaic\", which is how the schedule keeps the two apart.",
        sourceId: LC_RESOLUTION_SOURCE_KEY,
      },
      {
        question: "How is a service change or upgrade priced?",
        answer:
          "For a commercial service, by amperage: the \"New (in Amps)\" ladder runs $130.00, $200.00 and $300.00 to 400 amps, then $300.00 plus $50.00 per 100 amps over 401. Beyond that, the schedule prints a \"Service Change (Calculated service capacity using cost X 75%)\" row with no amount beside it, and no residential service-change row at all — the document publishes the row and not its price, so this site names it rather than inventing one.",
        sourceId: LC_RESOLUTION_SOURCE_KEY,
      },
    ],
    seoTitle: "Las Cruces NM electrical permit cost: $35–$110+ by area, $130+ by amps",
    seoDescription:
      "Las Cruces, New Mexico electrical permit fees — $35/$65/$110 plus $5 per 100 sq ft over 2,000 on a dwelling, $130/$200/$300 plus $50 per 100 amps on a commercial service, $250 bundled solar, and a $10 technology fee.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: LC_LAST_VERIFIED,
  },
  {
    jurisdictionKey: LC_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    slug: "plumbing-permit-cost",
    title: "Las Cruces plumbing permit cost",
    intro:
      "Las Cruces prices plumbing by **what the job is built of**. New construction is on **bathrooms and dwelling units**: **$100.00** for a one-dwelling-unit structure at 1½ baths or less, **$150.00** for one or two units at 2–3½ baths, **$200.00** for one or two units at 4 or more, and **$200.00 plus $30.00 per unit above two** for larger structures — with the schedule's own note that \"a roughed-in bathroom constitutes a bathroom\". Everything else — remodels, additions and commercial work — follows **the plumbing valuation**: $50.00 at $500 or less, $100.00 to $1,000, then **$100.00 for the first $1,000 plus $5.00 for each additional $1,000 or fraction thereof**. Every trade permit carries a **$10 technology fee**, and fees are **tripled** for work started without a permit.",
    localSummary:
      "The residential bands are pairs of facts, and the pairing is the first thing to get right: a one-unit structure at 1½ baths is $100.00, the same structure at 2 or 3½ baths is $150.00, and at 4 baths $200.00 — while a three-unit building is $260.00 whatever its bathrooms, because units above two switch to the per-unit ladder. A structure whose bathroom count lands between 3½ and 4 is in no printed band, and this site leaves it unpriced rather than moving it into one.\n\nRemodels do not use the bathroom counts at all: \"Remodel and/or Addition — Based on plumbing valuation (see commercial)\" sends them to three valuation bands on \"the total dollar value of the complete plumbing installation including materials, fixtures, and all installation costs\" — a plumbing figure separate from the building valuation the same job carries. This ladder **does** print \"or fraction thereof\", so $1,100 of plumbing is charged as two thousands: $105.00, not $100.50. That is the direct contrast with the building Fee Table, which omits the phrase and prorates.\n\nThe third thing to know is what the schedule points at but does not contain: the plumbing fee's own line says \"Additional fees may apply. Refer to the Utility Fees section\" — and the resolution has no Utility Fees section. Whatever those additional fees are, they are in another document, and this page says so instead of guessing at them.",
    notIncluded:
      "This is the plumbing permit fee — the bathroom-count bands for new construction, the plumbing-valuation bands for everything else, the $10 technology fee, and tripling for unpermitted work. It excludes:\n\n- **The \"Utility Fees\" the schedule's cross-reference promises**: the plumbing fee line reads \"Additional fees may apply. Refer to the Utility Fees section for additional information\" — a section this resolution does not contain. Whatever it holds is not visible in the source of record, so nothing is charged for it here.\n- **Water and sewer connection charges made by the utility**, which are service charges rather than permit fees and do not appear as rows in the plumbing table.\n- **Mechanical** — the same three-band shape on material value ($50 / $100 / $100 plus $5 per $1,000 or fraction) — and **gas piping** work priced under it rather than here, plus the roofing and demolition permits that share the building page.\n- **Inspection charges beyond reinspection**: after-hours at $60.00 an hour with a two-hour minimum, partial inspections at $45.00, and the $150.00 for a \"second or more reinspection fee on same team\" — the $45.00 per-occurrence reinspection is the one modelled, and \"Reinspection Fees are due before any other inspections may be performed.\"\n- **Fire sprinkler and suppression work**, which the schedule prices from its own head-count ladders ($120–$640 by head band plus $200 per hundred), and backflow or cross-connection testing, which is not a row of this table.\n- **The building and site work** this plumbing permit sits beside: the building fee and its 25% plan check, grading, floodplain review and right-of-way, all named on the building page.\n- **The expedited option** (the greater of $1,000 or an additional permit fee) and the **UNAPPROVED OR NON-PERMITTED variance fees** ($100–$2,000), both charged elsewhere than on this permit.\n- **Anything charged by another authority** — Doña Ana County, the State's plumbing licensing, and the utility's own fees.",
    workedExample: {
      scenario:
        "New construction of a one-dwelling-unit structure with 1½ bathrooms (a rough-in counts), ordinary review, no unpermitted work.",
      inputs: {
        occupancy: "residential",
        workType: "new_construction",
        units: 1,
        custom: { one_two_family: true, bathrooms: 1.5 },
      },
      notes:
        "The first residential band answers exactly: \"One dwelling unit structures (1½ baths or less) — $100.00\". One dwelling unit, 1½ baths — $100.00 of plumbing permit fee, and the $10.00 trade technology fee brings the total to $110.00. The rough-in note is what makes 1½ the edge of the band rather than an estimate: a roughed-in bathroom is a bathroom.\n\nThe valuation bands are not charged, and the answer of \"new construction on a one- and two-family dwelling\" is what excludes them: \"Remodel and/or Addition — Based on plumbing valuation\" points the other direction, at a table for everything that is not new dwelling work. Had this been a remodel instead, the same inputs would need the plumbing valuation — the dollar value of the complete installation — and would price from the $50 / $100 / $100-plus-$5 ladder.\n\nThe schedule's cross-reference sits over this whole calculation: \"Additional fees may apply. Refer to the Utility Fees section\" — and the resolution contains no such section. This example therefore totals what the document actually publishes and says, on the page, where the rest of the money would be looked for.",
    },
    faqs: [
      {
        question: "How does Las Cruces calculate a plumbing permit fee?",
        answer:
          "For new construction, by bathrooms and dwelling units: $100.00 for a one-unit structure at 1½ baths or less, $150.00 for one or two units at 2–3½ baths, $200.00 for one or two units at 4 or more baths, and $200.00 plus $30.00 per unit above two for larger structures. For remodels, additions and commercial work, by the plumbing valuation: $50.00 at $500 or less, $100.00 to $1,000, then $100.00 plus $5.00 per $1,000 or fraction thereof.",
        sourceId: LC_RESOLUTION_SOURCE_KEY,
      },
      {
        question: "Does a rough-in bathroom count?",
        answer:
          "Yes. The schedule states it plainly: \"Please note that a roughed-in bathroom constitutes a bathroom.\" A one-unit house roughed for a second bath is in the 2-to-3½ band at $150.00, not the 1½-or-less band at $100.00.",
        sourceId: LC_RESOLUTION_SOURCE_KEY,
      },
      {
        question: "What is the plumbing valuation?",
        answer:
          "\"The total dollar value of the complete plumbing installation including materials, fixtures, and all installation costs\" — the commercial table's own definition, which the residential rows point at for remodels and additions. It is a plumbing figure, separate from the building valuation the same project also carries on the building page.",
        sourceId: LC_RESOLUTION_SOURCE_KEY,
      },
      {
        question: "Does the plumbing ladder round partial thousands up?",
        answer:
          "Yes — unlike the building Fee Table. This row prints the phrase: \"$100.00 for the first $1000.00 plus 5.00 for each additional $1000.00 or fraction thereof.\" A $1,100 plumbing installation is charged as two thousands, $105.00 rather than $100.50. The building table omits that phrase and prorates, which is a real difference between two ladders in the same document.",
        sourceId: LC_RESOLUTION_SOURCE_KEY,
      },
      {
        question: "What happens if plumbing work started without a permit?",
        answer:
          "The fee is tripled: \"This fee is tripled on permits for work started or completed without an approved permit.\" The $100.00 band becomes $300.00. The technology fee and the separate UNAPPROVED OR NON-PERMITTED variance fee ($100–$2,000 by valuation, assessed by the board) are not the permit fee and do not triple with it.",
        sourceId: LC_RESOLUTION_SOURCE_KEY,
      },
    ],
    seoTitle: "Las Cruces NM plumbing permit cost: $100–$260 by baths and units",
    seoDescription:
      "Las Cruces, New Mexico plumbing permit fees — $100/$150/$200 by bathroom and dwelling-unit count for new construction, $50/$100/$100-plus-$5-per-$1,000 by plumbing valuation otherwise, a $10 technology fee, and tripled fees without a permit.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: LC_LAST_VERIFIED,
  },
];

const verifications: SeedVerification[] = [
  {
    entityType: "source",
    entityKey: LC_RESOLUTION_SOURCE_KEY,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: LC_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: LC_RESOLUTION_SOURCE_KEY,
    notes:
      "Read 2026-09-25 as the City's own PDF of Resolution 21-019, adopted August 17, 2020, with Exhibit A in full. Transcribed: the administrative fee tables (technology, expedited, revision, copies), the building fees (the $0.20 residential rate, the commercial valuation paragraph with the scope and local-area modifiers, plan check, expedited permitting, the seven-band Fee Table), the ICC February 2020 valuation tables and their footnote, the electrical, mechanical, plumbing, roofing, demolition and other building fees, site and grading fees, floodplain, rock walls, signs, fire systems, mobile home, inspection fees, right-of-way, traffic, land-use and administrative review application fees, the unpermitted-work variance fees, and the fee-waiver and infill-incentive rules.",
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-RES-NEW-SF",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: LC_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: LC_RESOLUTION_SOURCE_KEY,
    notes:
      '\"New single-family dwellings, townhouses, and duplexes: $0.20 per square ft of gross floor area measured to the outside walls.\" Charged on square footage with no valuation and no modifiers, because the sentence that separates it from the commercial process — \"Remodels and additions follow the commercial process\" — puts both the work type and the construction class in the condition.',
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-TABLE-500001-1000000",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: LC_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: LC_RESOLUTION_SOURCE_KEY,
    notes:
      '\"$500,001 through $1,000,000 — $3330 for the first $500,000 plus $5 for each additional $1000.\" This band opens $100 above what the band below computes at $500,000 ($830 + 400 × $6 = $3,230) — the table\'s own discontinuity. Modelled with the printed base, and the $100 jump is asserted in the content test at both sides of the boundary and stated on the page rather than reconciled. The same row prints its range as \"$101,001\" while its base reads \"the first $100,000\"; the range is modelled as $100,001, matching the base.',
  },
  {
    entityType: "fee_rule",
    entityKey: "ELEC-RES-AREA-OVER-2000",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: LC_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: LC_RESOLUTION_SOURCE_KEY,
    notes:
      '\"1,500 sf or more — $110.00 plus $5.00 per 100 sf over 2,000 sf\", for \"new, remodels, and additions to one-and two-unit dwellings and townhomes\" on enclosed living area. The row prints no \"or fraction thereof\" — the phrase appears three times elsewhere in this document — so the per-100 rate is prorated: 2,400 sq ft adds $20.00. The flat $110.00 covers 1,500 through 2,000 because the $5.00 rate only reaches above 2,000.',
  },
  {
    entityType: "fee_rule",
    entityKey: "ELEC-COMM-AMPS-OVER-400",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: LC_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: LC_RESOLUTION_SOURCE_KEY,
    notes:
      '\"401 or more — $300.00 plus $50.00 per 100 amps over 401 amps.\" Prorated for the same reason as the area row, so 451 amps is $325.00; the band opens at exactly what 201–400 amps charges, so 401 and 400 both cost $300.00. The adjacent \"Service Change (Calculated service capacity using cost X 75%)\" row carries no amount in the printed schedule and is modelled by nothing — quoted on the page instead.',
  },
  {
    entityType: "fee_rule",
    entityKey: "PLUMB-VAL-OVER-1000",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: LC_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: LC_RESOLUTION_SOURCE_KEY,
    notes:
      '\"$1000.01 and above — $100.00 for the first $1000.00 plus 5.00 for each additional $1000.00 or fraction thereof.\" One of the three rows in the document that print the round-up phrase, so this rule carries an increment of $1,000 and rounds up — the direct contrast with the building Fee Table, which omits the phrase and prorates. Both readings are asserted in the content tests.',
  },
  {
    entityType: "fee_rule",
    entityKey: "PLUMB-NEW-1OR2DU-4PLUS",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: LC_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: LC_RESOLUTION_SOURCE_KEY,
    notes:
      '\"One or two dwelling unit structures (4 or more baths) — $200.00\", beside \"One dwelling unit structures (1½ baths or less) — $100.00\" and \"One or two dwelling unit structures (2 to 3½ baths) — $150.00\", under the header note \"a roughed-in bathroom constitutes a bathroom\". The bands are pairs of facts — units and bathrooms — and the gap between 3½ and 4 baths is in no printed band; the page says so rather than closing it.',
  },
  {
    entityType: "permit_page",
    entityKey: "building-permit-cost",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: LC_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: LC_RESOLUTION_SOURCE_KEY,
    notes:
      "Gate-checked 2026-09-25: the $0.20-per-square-foot residential rate for new one- and two-family dwellings and the seven-band commercial Fee Table with the scope and local-area modifiers, all from Exhibit A of Resolution 21-019 — with the table's own $100 discontinuity at $500,000 asserted on both sides of the boundary rather than reconciled.",
  },
  {
    entityType: "permit_page",
    entityKey: "electrical-permit-cost",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: LC_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: LC_RESOLUTION_SOURCE_KEY,
    notes:
      "Gate-checked 2026-09-25: the residential enclosed-area ladder, the commercial amperage ladder over 401 amps, and the $10 trade technology fee — read from Exhibit A of Resolution 21-019, with the Service Change row that prints no amount quoted on the page rather than modelled.",
  },
  {
    entityType: "permit_page",
    entityKey: "plumbing-permit-cost",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: LC_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: LC_RESOLUTION_SOURCE_KEY,
    notes:
      "Gate-checked 2026-09-25: the bathroom-and-dwelling-unit bands for new construction, the three valuation bands that round up to the next $1,000, and the fee tripled for work started without a permit — all from Exhibit A of Resolution 21-019.",
  },
  {
    entityType: "jurisdiction_profile",
    entityKey: LC_KEYS.jurisdiction,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: LC_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: LC_RESOLUTION_SOURCE_KEY,
    notes:
      "Hub content built entirely from Resolution 21-019. The profile states the readings the model depends on — the fee table prorates where the trade ladders round up, the entered valuation is the one the schedule's modifiers build, and plan check is the first 25% of the fee rather than a charge on it — and records what is not charged: mechanical, roofing, site, sign, fire, certificate, review and variance fees, and the Utility Fees section the plumbing cross-reference points at but the resolution does not contain.",
  },
];

export const lasCrucesSeed: JurisdictionSeed = {
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
export const LAS_CRUCES_PUBLISHED_PERMIT_PAGES = lasCrucesSeed.permitPages.filter(
  (page) => page.publishStatus === "published" && !page.noindex,
);
