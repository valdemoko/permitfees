import type { JurisdictionSeed } from "@/content/seed-types";

import {
  KING_COUNTY_BUILDING_GUIDE_SOURCE_KEY,
  KING_COUNTY_BUILDING_RULES,
  KING_COUNTY_FEE_EFFECTIVE_FROM,
  KING_COUNTY_PLUMBING_RULES,
  KING_COUNTY_PLUMBING_SOURCE_KEY,
  KING_COUNTY_SFR_GUIDE_SOURCE_KEY,
  WA_LNI_ELECTRICAL_RULES,
  WA_LNI_ELECTRICAL_SOURCE_KEY,
} from "./fee-rules";

/**
 * King County, Washington — the county's unincorporated territory.
 *
 * Every other jurisdiction in this dataset is a city or a county that issues all of the
 * permits it publishes. King County does not. Its building fee is the county's, its
 * plumbing fee is the county health department's, and **its electrical permit is not
 * the county's at all**: an electrical permit in unincorporated King County is bought
 * from the Washington State Department of Labor & Industries. The county's own Guide 02
 * says so in its margin — "Electrical permits are issued by the WA State Department of
 * Labor & Industries" — and so does the state: "All other jobsites in Washington are
 * permitted and inspected by L&I."
 *
 * That is why this jurisdiction has three permit types from three authorities, and why
 * the electrical page quotes a state regulation rather than a county schedule.
 *
 * Research record: research/washington/king-county.md.
 */

export const KING_COUNTY_LAST_VERIFIED = "2026-09-24";

export const KING_COUNTY_KEYS = {
  state: "wa",
  county: "king-county",
  jurisdiction: "king-county",
  feeSchedule: KING_COUNTY_BUILDING_GUIDE_SOURCE_KEY,
} as const;

const RESEARCHER = "Permit Fee Intelligence research pass 9 (Washington, first jurisdiction)";

const state = {
  code: "WA",
  slug: "washington",
  name: "Washington",
  fipsCode: "53",
};

const county = {
  key: KING_COUNTY_KEYS.county,
  slug: "king-county",
  name: "King County",
  fipsCode: "53033",
};

export const kingCountySeed: JurisdictionSeed = {
  state,
  county,

  jurisdiction: {
    key: KING_COUNTY_KEYS.jurisdiction,
    stateKey: KING_COUNTY_KEYS.state,
    countyKey: KING_COUNTY_KEYS.county,
    type: "county",
    slug: "king-county",
    name: "King County",
    officialName: "King County Department of Local Services, Permitting Division",
    websiteUrl: "https://kingcounty.gov/en/dept/dls/permits",
    permitPortalUrl: "https://kingcounty.gov/en/dept/dls/permits",
    timezone: "America/Los_Angeles",
    isActive: true,
  },

  departments: [
    {
      key: "king-county-permitting",
      jurisdictionKey: KING_COUNTY_KEYS.jurisdiction,
      kind: "building",
      name: "Department of Local Services, Permitting Division",
      phone: "206-296-6600",
      email: "DPERWebInquiries@kingcounty.gov",
      url: "https://kingcounty.gov/en/dept/dls/permits",
      addressLine: null,
      hours: null,
      notes:
        "The division publishes its fees as a series of guides rather than as one schedule, and each guide covers a different kind of work: Guide 02 for single-family residential, Guide 04 for commercial and multifamily building construction, Guide 03 for school impact mitigation. Both ends of the guide pair print the same telephone number and email address, and the phone number and email here are taken from those pages rather than from a directory.",
    },
    {
      key: "king-county-public-health",
      jurisdictionKey: KING_COUNTY_KEYS.jurisdiction,
      kind: "health",
      name: "Public Health — Seattle & King County, Plumbing and Gas Piping Program",
      phone: null,
      email: "planreviewinfo@kingcounty.gov",
      url: "https://kingcounty.gov/en/dept/dph/health-safety/environmental-health/plumbing-gas",
      addressLine: null,
      hours: null,
      notes:
        "The plumbing authority for unincorporated King County **and** for the City of Seattle: SMC 22.900G.030 directs plumbing fees to \"the Director of King County Public Health\". The fee schedule prints no telephone number, so none is asserted here; the email address is the one its own note gives for plan review questions.",
    },
    {
      key: "wa-lni-electrical",
      jurisdictionKey: KING_COUNTY_KEYS.jurisdiction,
      kind: "other",
      name: "Washington State Department of Labor & Industries, Electrical Program",
      phone: null,
      email: null,
      url: "https://www.lni.wa.gov/licensing-permits/electrical",
      addressLine: null,
      hours: null,
      notes:
        "The electrical authority for every job site in the state outside Seattle, Tacoma and Tacoma Power's service area. Its fees are set by regulation — WAC 296-46B-906 — rather than by a local schedule, which is what makes them identical in every county it covers.",
    },
  ],

  sources: [
    {
      key: KING_COUNTY_BUILDING_GUIDE_SOURCE_KEY,
      jurisdictionKey: KING_COUNTY_KEYS.jurisdiction,
      title:
        "2026 Fee Guide 04 — Commercial or Multifamily Residential Building Construction (December 2025)",
      url: "https://cdn.kingcounty.gov/-/media/king-county/depts/local-services/permits/fee-guides/04-fee-2026-commercial-multifamily-building-construction.pdf",
      sourceType: "fee_schedule_pdf",
      issuingAuthority: "King County Department of Local Services, Permitting Division",
      authorityKind: "county",
      isPrimary: true,
      documentDate: "2025-12-01",
      effectiveFrom: KING_COUNTY_FEE_EFFECTIVE_FROM,
      retrievedAt: KING_COUNTY_LAST_VERIFIED,
      lastVerifiedAt: KING_COUNTY_LAST_VERIFIED,
      notes:
        "Three pages, dated \"December 2025\" in the footer and titled \"2026 Fee Guide 04\", sha256 beginning 72ef257d6aab25d1. Read 2026-09-24 in three pdftotext modes. This is the document behind every building figure published here: the two valuation tables on its last page, the state surcharge row and its WAC 51-05-200 footnote on its second, and the flat minimum-fee table on its first. The guide's own method paragraph is what makes the two tables a fee rather than two options — the County valuation \"is then applied to the fee tables below to determine the required plan review and inspection fees\".",
    },
    {
      key: KING_COUNTY_SFR_GUIDE_SOURCE_KEY,
      jurisdictionKey: KING_COUNTY_KEYS.jurisdiction,
      title: "2026 Fee Guide 02 — Single Family Residential Construction (December 2025)",
      url: "https://cdn.kingcounty.gov/-/media/king-county/depts/local-services/permits/fee-guides/02-fee-2026-single-family-residential-construction.pdf",
      sourceType: "fee_schedule_pdf",
      issuingAuthority: "King County Department of Local Services, Permitting Division",
      authorityKind: "county",
      isPrimary: true,
      documentDate: "2025-12-01",
      effectiveFrom: KING_COUNTY_FEE_EFFECTIVE_FROM,
      retrievedAt: KING_COUNTY_LAST_VERIFIED,
      lastVerifiedAt: KING_COUNTY_LAST_VERIFIED,
      notes:
        "Three pages, sha256 beginning 2a1e0f0f0a2b4e5b. Read in three pdftotext modes. Two things are taken from it and nothing else. The first is **the residential state surcharge of $6.50**, which is a different figure from Guide 04's $25 and is the reason the surcharge is modelled as two rules rather than one. The second is its statement of which authority issues what — \"Electrical permits are issued by the WA State Department of Labor & Industries. On-site septic design and installation, plumbing, and gas-piping permits are issued by Seattle-King County Public Health\" — which is the corroboration for a jurisdiction having three permit types from three bodies. Its own fee rows are quoted in prose and not modelled; they are priced per square foot or per named job rather than by valuation.",
    },
    {
      key: KING_COUNTY_PLUMBING_SOURCE_KEY,
      jurisdictionKey: KING_COUNTY_KEYS.jurisdiction,
      title: "Plumbing and Gas Piping Program service fees (effective January 1, 2026)",
      url: "https://cdn.kingcounty.gov/-/media/king-county/depts/dph/documents/health-safety/environmental-health/fees/plumbing-gas-piping-service-fees-through-2026.pdf",
      sourceType: "fee_schedule_pdf",
      issuingAuthority: "Public Health — Seattle & King County, Community Environmental Health",
      authorityKind: "county",
      isPrimary: true,
      documentDate: null,
      effectiveFrom: KING_COUNTY_FEE_EFFECTIVE_FROM,
      retrievedAt: KING_COUNTY_LAST_VERIFIED,
      lastVerifiedAt: KING_COUNTY_LAST_VERIFIED,
      notes:
        "One page headed \"Plumbing and Gas Piping Program — Community Environmental Health — Effective January 1, 2026\", sha256 beginning 8c320351a45027d9. Read 2026-09-24 in three pdftotext modes. The two modes disagree about alignment — the `-layout` reading puts the values in a column beside the wrong labels — and the `-table` reading pairs them correctly; the figures here are the ones both readings agree on once the two-mode rule is applied. The same document supplies Seattle's plumbing page, because the City's own subtitle says this program collects those fees.",
    },
    {
      key: WA_LNI_ELECTRICAL_SOURCE_KEY,
      jurisdictionKey: KING_COUNTY_KEYS.jurisdiction,
      title: "WAC 296-46B-906 — Electrical inspection fees (Washington State Legislature)",
      url: "https://app.leg.wa.gov/wac/default.aspx?cite=296-46B-906",
      sourceType: "state_agency",
      issuingAuthority: "Washington State Department of Labor & Industries",
      authorityKind: "state",
      isPrimary: true,
      documentDate: null,
      effectiveFrom: null,
      retrievedAt: KING_COUNTY_LAST_VERIFIED,
      lastVerifiedAt: KING_COUNTY_LAST_VERIFIED,
      notes:
        "The complete fee schedule for electrical work in every part of Washington outside Seattle, Tacoma and Tacoma Power's service area, published by the Legislature as a regulation rather than as a municipal document. Read 2026-09-24 from the official citation. The section states its own method in one sentence — \"To calculate inspection fees, the amperage is based on the conductor ampacity or the overcurrent device rating\" — which is why every rule taken from it is banded by amperage. Its most recent filing is WSR 26-10-060, effective July 1, 2026; no effective date is asserted for the version read here, because the citation page does not date the text it serves.",
    },
  ],

  /** Empty on purpose: the permit types this jurisdiction uses already exist. */
  permitTypes: [],
  projectTypes: [],

  jurisdictionPermitTypes: [
    {
      jurisdictionKey: KING_COUNTY_KEYS.jurisdiction,
      permitTypeKey: "building",
      isAvailable: true,
      localName: "Building permit",
      officialUrl: null,
      notes:
        "Priced from one of two documents depending on what is being built. Commercial and multifamily work is priced by Guide 04's two valuation tables — a plan review fee and an inspection fee, charged at application and at issuance. Single-family work is priced by Guide 02's named rows, which are flat or per square foot rather than valuation-based: a basic new home is $1,936 of application review plus $2.46 per square foot of inspection. Both routes add the state building code surcharge, at $25.00 on the commercial route and $6.50 on the residential one.",
    },
    {
      jurisdictionKey: KING_COUNTY_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      isAvailable: true,
      localName: "Electrical permit (Washington State L&I)",
      officialUrl: "https://www.lni.wa.gov/licensing-permits/electrical",
      notes:
        "Not a county permit. Guide 02 states it in its own margin — \"Electrical permits are issued by the WA State Department of Labor & Industries\" — and WAC 296-46B-906 prices them everywhere except Seattle, Tacoma and Tacoma Power's service area. The fee is a function of amperage, of the number of circuits, and of the number of devices, and it is identical in every county the state covers, which is the opposite of how a municipal building fee behaves.",
    },
    {
      jurisdictionKey: KING_COUNTY_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      isAvailable: true,
      localName: "Plumbing permit (King County Public Health)",
      officialUrl:
        "https://kingcounty.gov/en/dept/dph/health-safety/environmental-health/plumbing-gas",
      notes:
        "Issued and priced by Public Health — Seattle & King County rather than by the Permitting Division: $137.00 plus $27.00 per fixture on a plumbing or backflow permit, and the same base plus $27.00 per outlet on a gas piping permit. The program's schedule also prices the review that accompanies a larger job at $273.00 per hour, and an Already Built Construction permit at $273.00 plus $55.00 per fixture where work was done without one.",
    },
    {
      jurisdictionKey: KING_COUNTY_KEYS.jurisdiction,
      permitTypeKey: "mechanical",
      isAvailable: true,
      localName: "Mechanical permit",
      officialUrl: null,
      notes:
        "Priced by the same two valuation tables as a building permit — they are published as \"Building **or Mechanical** Plan Review Fee\" and \"Building **or Mechanical** Inspection Fee\" — and it is the one permit type that does **not** carry the state surcharge, because the guide's footnote excludes mechanical, sprinkler and tank permits under WAC 51-05-200. Guide 02 adds one flat row for a single-family home: a mechanical installation only is $183.00 of inspection. No mechanical page is published in this release; the mechanism it would describe is the one the building page already carries.",
    },
  ],

  feeSchedules: [
    {
      key: KING_COUNTY_BUILDING_GUIDE_SOURCE_KEY,
      jurisdictionKey: KING_COUNTY_KEYS.jurisdiction,
      sourceKey: KING_COUNTY_BUILDING_GUIDE_SOURCE_KEY,
      title: "2026 Fee Guide 04, effective January 1, 2026",
      officialUrl:
        "https://cdn.kingcounty.gov/-/media/king-county/depts/local-services/permits/fee-guides/04-fee-2026-commercial-multifamily-building-construction.pdf",
      effectiveFrom: KING_COUNTY_FEE_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: KING_COUNTY_LAST_VERIFIED,
      notes:
        "Dated \"December 2025\" and titled for 2026, so the year in the title and the date at the foot agree: these are the fees in force from January 1, 2026. Guide 02 is dated to the same edition and carries the same effective year.",
    },
    {
      key: KING_COUNTY_PLUMBING_SOURCE_KEY,
      jurisdictionKey: KING_COUNTY_KEYS.jurisdiction,
      sourceKey: KING_COUNTY_PLUMBING_SOURCE_KEY,
      title: "Plumbing and Gas Piping Program service fees, effective January 1, 2026",
      officialUrl:
        "https://cdn.kingcounty.gov/-/media/king-county/depts/dph/documents/health-safety/environmental-health/fees/plumbing-gas-piping-service-fees-through-2026.pdf",
      effectiveFrom: KING_COUNTY_FEE_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: KING_COUNTY_LAST_VERIFIED,
      notes:
        "Its own heading carries the effective date, and its file name says \"through 2026\", so the period it covers is stated by the document rather than inferred from when it was read. A separate schedule from the county's own guides, from a different department, which is the point of recording it as its own row.",
    },
  ],

  feeRules: [
    ...KING_COUNTY_BUILDING_RULES.map((rule) => ({
      jurisdictionKey: KING_COUNTY_KEYS.jurisdiction,
      permitTypeKey: "building",
      scheduleKey: KING_COUNTY_BUILDING_GUIDE_SOURCE_KEY,
      rule,
    })),
    ...WA_LNI_ELECTRICAL_RULES.map((rule) => ({
      jurisdictionKey: KING_COUNTY_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      scheduleKey: KING_COUNTY_BUILDING_GUIDE_SOURCE_KEY,
      rule,
    })),
    ...KING_COUNTY_PLUMBING_RULES.map((rule) => ({
      jurisdictionKey: KING_COUNTY_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      scheduleKey: KING_COUNTY_PLUMBING_SOURCE_KEY,
      rule,
    })),
  ],

  requirements: [
    {
      jurisdictionKey: KING_COUNTY_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "document",
      title: "The County determines the valuation, and you can supply it",
      description:
        "\"The permit technician or plans examiner determines the County valuation of the building construction or mechanical installation of a project, using data tables that list the standard construction cost per square foot, by type of construction and occupancy, or other data provided by the permit applicant. The County generally uses data tables published by nationally recognized code organizations but may use other means to estimate valuation as needed.\" The valuation is therefore not simply what the applicant declares — the County may substitute its own cost per square foot — and the same paragraph says the number the County lands on is what both fee tables are read against.",
      isMandatory: true,
      sortOrder: 10,
      sourceKey: KING_COUNTY_BUILDING_GUIDE_SOURCE_KEY,
      lastVerifiedAt: KING_COUNTY_LAST_VERIFIED,
    },
    {
      jurisdictionKey: KING_COUNTY_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "other",
      title: "Two valuation tables are charged, not one chosen from two",
      description:
        "The guide publishes a \"Building or Mechanical Plan Review Fee\" table and a \"Building or Mechanical Inspection Fee\" table, and its method paragraph applies the County valuation to both: \"The County valuation is then applied to the fee tables below to determine the required plan review and inspection fees.\" They are paid at different moments — review at application, inspection at permit issuance, which is what the guide's own column headings \"Application\" and \"Permit\" say — and the inspection table's figures are roughly 1.5 to 1.7 times the review table's at every band.",
      isMandatory: true,
      sortOrder: 20,
      sourceKey: KING_COUNTY_BUILDING_GUIDE_SOURCE_KEY,
      lastVerifiedAt: KING_COUNTY_LAST_VERIFIED,
    },
    {
      jurisdictionKey: KING_COUNTY_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "other",
      title: "The state surcharge is $25.00 or $6.50 depending on the guide",
      description:
        "Guide 04 prints \"State building code surcharge: minimum fee per building permit $25.00; fee per additional dwelling unit permitted $2.00\". Guide 02, for single-family work, prints \"State building code surcharge (b) $6.50\". RCW 19.27.085 sets the same two figures — $6.50 on each residential building permit, $25.00 on each commercial one — so the pair is consistent once each guide is read for the occupancy it covers, and a project that names no occupancy is priced as commercial here because that is the guide these pages quote.",
      isMandatory: true,
      sortOrder: 30,
      sourceKey: KING_COUNTY_BUILDING_GUIDE_SOURCE_KEY,
      lastVerifiedAt: KING_COUNTY_LAST_VERIFIED,
    },
    {
      jurisdictionKey: KING_COUNTY_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "other",
      title: "The surcharge does not follow a mechanical permit",
      description:
        "Guide 04's footnote (d): \"Per WAC 51-05-200, the State surcharge is not applicable to mechanical or fire protection systems, or tank permits, but is applicable to permits for the demolition of buildings.\" A mechanical permit is priced by the same two tables as a building permit and differs from it in exactly this line.",
      isMandatory: false,
      sortOrder: 40,
      sourceKey: KING_COUNTY_BUILDING_GUIDE_SOURCE_KEY,
      lastVerifiedAt: KING_COUNTY_LAST_VERIFIED,
    },
    {
      jurisdictionKey: KING_COUNTY_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      requirementType: "other",
      title: "The state prices electrical work, not the county",
      description:
        "Guide 02's own margin: \"Electrical permits are issued by the WA State Department of Labor & Industries.\" WAC 296-46B-906 then fixes the amounts, and its opening sentence fixes the unit: \"To calculate inspection fees, the amperage is based on the conductor ampacity or the overcurrent device rating.\" Plan review, where plans are submitted, is 35% of the electrical permit fee under subsection (9)(a).",
      isMandatory: true,
      sortOrder: 10,
      sourceKey: WA_LNI_ELECTRICAL_SOURCE_KEY,
      lastVerifiedAt: KING_COUNTY_LAST_VERIFIED,
    },
    {
      jurisdictionKey: KING_COUNTY_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      requirementType: "other",
      title: "The plumbing permit comes from the health department",
      description:
        "Guide 02: \"On-site septic design and installation, plumbing, and gas-piping permits are issued by Seattle-King County Public Health.\" The program's schedule charges $137.00 plus $27.00 per fixture, and the $137.00 is a base charge rather than a first fixture — one fixture costs $164.00, not $137.00.",
      isMandatory: true,
      sortOrder: 10,
      sourceKey: KING_COUNTY_PLUMBING_SOURCE_KEY,
      lastVerifiedAt: KING_COUNTY_LAST_VERIFIED,
    },
  ],

  profile: {
    jurisdictionKey: KING_COUNTY_KEYS.jurisdiction,
    headline: "What construction permits cost in unincorporated King County",
    summary:
      "King County prices a commercial building permit from two valuation tables — a plan review fee and an inspection fee, charged at application and at issuance — so a $1,200,000 project pays $11,918.00 for review and $18,903.00 for inspection, plus a $25.00 state surcharge, rather than one permit fee. Its plumbing permit is priced by the county's public health department at $137.00 plus $27.00 per fixture, and its electrical permit is not a county permit at all: it comes from the Washington State Department of Labor & Industries, which prices every job outside Seattle by amperage.",
    localContext:
      "Unincorporated King County is the first jurisdiction on this site whose three permits come from three different authorities, and that is a fact about the place rather than a filing convention. The Permitting Division prices building work, Public Health — Seattle & King County prices plumbing and gas piping, and the electrical permit is bought from the state. The county's own Guide 02 says so in its margin, and the three schedules it points to are written by three bodies that never sat down together.\n\nThe building fee is where the county differs most from every jurisdiction published before it. There is **no single permit fee**. The guide publishes a plan review table and an inspection table and applies the same County valuation to both, so a project pays each one: on $1,200,000 that is $11,918.00 at application and $18,903.00 at issuance. The county's own column headings are \"Application\" and \"Permit\", which is the clearest statement available that these are moments rather than alternatives. Both tables close at every seam — $788, $1,303, $1,988, $6,548, $10,548, $37,948 for review and $1,298, $2,068, $3,153, $9,993, $16,843, $58,043 for inspection — and this site asserts each one in its tests, because a split fee is exactly the shape in which a transcription error survives unnoticed.\n\nWhat the fee is read against is also different. The county does **not** simply take the applicant's number: \"The permit technician or plans examiner determines the County valuation... using data tables that list the standard construction cost per square foot, by type of construction and occupancy, or other data provided by the permit applicant.\" A declared construction cost is one acceptable input, not the whole answer, and a project can therefore be priced above what it cost. Denver and Westminster both take what you declare; King County may replace it.\n\nThen there is the residential route, which uses neither table. Guide 02 prices single-family work by named job and by square foot — a basic new home is $1,936.00 of application review plus $2.46 per square foot of inspection, a deck or accessory building of 500 square feet or less is $772.00 of review, a mechanical installation alone is $183.00 of inspection. A homeowner and a commercial tenant in the same county are priced by arithmetic that shares nothing but the state surcharge, and the surcharge itself differs: **$25.00 on the commercial guide's permits and $6.50 on the residential guide's**, mirroring RCW 19.27.085's two rates.\n\nThe state's share does not stop at the surcharge. An electrical permit here is issued under WAC 296-46B-906, which prices work by amperage — a 200-ampere altered service is $109.90, a 400-ampere commercial altered service is $303.60 — and charges $8.20 for each circuit beyond the first four on a residential panel and beyond the first five on a commercial one, with a published ceiling: the cost of the alterations in a panel should not exceed the cost of a complete service of the same rating, which is the only place in this dataset where a schedule caps the sum rather than the line.",
    valuationBasis:
      "King County determines the valuation itself, from published cost data, and accepts the applicant's own figures as one input among others: \"The permit technician or plans examiner determines the County valuation of the building construction or mechanical installation of a project, using data tables that list the standard construction cost per square foot, by type of construction and occupancy, or other data provided by the permit applicant. The County generally uses data tables published by nationally recognized code organizations but may use other means to estimate valuation as needed.\"\n\nThe pages here compute from the figure you give them and never substitute a rate for it. What they cannot tell you is whether the county would accept that figure, because the cost tables the county uses are published by code organizations rather than by the county.\n\nTwo routes do not use a valuation at all. Single-family work is priced by Guide 02's named rows and by square foot, and the plumbing permit is priced per fixture by the public health department's own schedule. Neither has a valuation to declare.",
    notIncluded:
      "These figures are what King County's own published schedules say, computed by this site's engine. They are not a total project cost. In particular they exclude:\n\n- **The flat minimum fees for named structures**, which sit above the valuation tables on Guide 04's own page: a building change of use at $970.00 application and $419.00 permit, a communication antenna at $3,364.00 and $1,514.00, a pole or tower at $6,272.00 and $4,280.00, a sign at $1,597.00 and $737.00, a school portable at $5,269.00 and $4,225.00, a trail bridge at $42.00 and $65.00 per lineal foot, and demolition or relocation at $796.00.\n- **Every accessory system and equipment row**, including alarm systems at $1,160.00 plus $24 per device, sprinkler systems at $1,160.00 plus $24 per head, emergency generators and high-piled storage at $1,711.00 each, and tanks or underground fuel piping at $970.00 each.\n- **Guide 02's single-family rows**, which price named residential jobs by job or by square foot: a new home at $1,936.00 to $8,128.00 of application review plus $2.46 per square foot of inspection, an accessory building over 500 square feet at $1,627.00 of review, a garage addition at $3,109.00, a remodel at $362.00 to $2,392.00 depending on how many structural modifications it makes, a fuel tank at $970.00, an exempt domestic well at $150.00 to $350.00, and site condition inspections at $726.00 per trip.\n- **Certificate of occupancy and operating permit fees**: $442.00 for an individual townhouse, $970.00 for more than one building per permit, $970.00 for a temporary certificate, $419.00 per building per site visit for an occupancy inspection, $171.00 for an operating permit and $114.00 for its renewal, per item.\n- **Plan re-submittals after the second, and revisions to an issued permit**, which the guide prices by how much of the project the changes represent rather than at a published figure.\n- **School impact mitigation fees**, which are on a separate guide, and site, road, storm water and environmental review fees, which are on four more.\n- **The county's own hourly and hourly-equivalent charges** in the plumbing program — plan review at $273.00 per hour, an inspection outside regular hours at $410.00 per hour, a requested site visit with no permit at $273.00, a permit renewal at $68.00 and an administrative fee at $41.00 — and, in the re-pipe note, a supplemental fee based on anticipated inspections.\n- **The state's other electrical charges**: plan review at 35% of the permit fee and a $100.50 submission fee, progress inspections at $59.50 per half hour, after-hours inspections at $151.10, plan review handling at $27.90, annual permits from $2,913.90, and every trip fee.\n- **Anything charged by another authority for the same project**: a site in an incorporated city is not in this county's territory, and a site in Seattle, Tacoma or Tacoma Power's service area is not in the state's electrical territory either.",
    seoTitle: "King County permit fees: building, electrical and plumbing",
    seoDescription:
      "How unincorporated King County prices permits — a building fee split into a plan review and an inspection table, plumbing at $137 plus $27 per fixture, and an electrical permit from Washington State L&I.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: KING_COUNTY_LAST_VERIFIED,
  },

  permitPages: [
    {
      jurisdictionKey: KING_COUNTY_KEYS.jurisdiction,
      permitTypeKey: "building",
      slug: "building-permit-cost",
      title: "King County building permit cost",
      intro:
        "A building permit in unincorporated King County carries **two** fees from one valuation, because the county publishes two tables and applies the same number to both: a plan review fee, paid at application, and an inspection fee, paid at permit issuance. On a $1,200,000 project that is $11,918.00 for review and $18,903.00 for inspection — $30,846.00 with the $25.00 state surcharge. Both tables close at every seam, and the county's own method paragraph says the valuation \"is then applied to the fee tables below to determine the required plan review and inspection fees\".",
      localSummary:
        "Every other jurisdiction on this site publishes one schedule that returns one permit fee. King County publishes **two tables and charges both**, and the guide's column headings say why: \"Application\" and \"Permit\". Plan review is what is paid when the application is filed; inspection is what is paid when the permit is issued. A reader who finds only one of the two tables will halve the cost of their permit, and the mistake runs in a consistent direction, because the inspection table is the larger of the pair at every band — $183 against $103 at the bottom, $58,043 against $37,948 at the top.\n\nBoth tables are banded the same way, in seven ranges that meet at $25,000, $50,000, $100,000, $500,000, $1,000,000 and $5,000,000, and **both close at all six seams**. Review: $788, $1,303, $1,988, $6,548, $10,548, $37,948. Inspection: $1,298, $2,068, $3,153, $9,993, $16,843, $58,043. Each figure is exactly what the band below produces at its own top, so a reader can check any row against the one beneath it. Denver's table is a dollar short at one handover, Clark County's four cents short at another and Houston's brackets deliberately do not chain; these two are exact, and this site asserts every seam in its tests rather than assuming the arithmetic.\n\nWhat the fee is read against is the second thing to know, and it differs from every other jurisdiction here. The county does not simply take your number: \"The permit technician or plans examiner determines the County valuation... using data tables that list the standard construction cost per square foot, by type of construction and occupancy, or other data provided by the permit applicant.\" A declared construction cost is one acceptable input rather than the whole answer, so a project can be priced at more than it cost. These pages compute from the figure you give them and say so.\n\nThen there is the route that does not use either table. **Single-family work is priced by Guide 02**, which prices named residential jobs flat or by square foot: a new home on a pre-registered basic plan is $1,936.00 of application review plus $2.46 per square foot of inspection, a deck or accessory building of 500 square feet or less is $772.00 of review, a carport is $1,627.00, a garage addition is $3,109.00, and a repair with one structural modification is $796.00 of review plus $1,229.00 of inspection. That guide's review column also has its own site-review row, priced by the quantity and complexity of review at $2,033.00, $3,618.00 or $483.00.\n\nThe state surcharge follows the same split. Guide 04 prints \"$25.00 minimum fee per building permit\" and \"$2.00 per additional dwelling unit permitted\". Guide 02 prints \"$6.50\". RCW 19.27.085 sets exactly those two rates for commercial and residential permits, so the county's two guides and the statute agree once each is read for the occupancy it covers — and the surcharge is excluded from mechanical, sprinkler and tank permits by the footnote the guide itself prints.\n\nFinally, above the tables sits a list of flat minimum fees for structures the county does not price by value at all: a change of use at $970.00 and $419.00, a sign at $1,597.00 and $737.00, an antenna at $3,364.00 and $1,514.00, demolition or relocation at $796.00, a tank at $970.00 each. Those rows replace the valuation route for the structure they name.\n\nOne reading of the tables is worth stating outright, because it is where this schedule differs from every other one on this site. The rates are published \"per $1,000 of Value\" and the words **\"or fraction thereof\" never appear** — not in one band, not in one guide. Boulder City's table, Clark County's table and Denver's table all print that phrase exactly where they mean a valuation is rounded up to the next step, and Houston's brackets are built on it. Read the county's words as written, the rate is charged on the exact number of thousands: a $12,500 valuation pays for 12.5 of them — $103.00 plus $342.50 of review, and $183.00 plus $557.50 of inspection — rather than being rounded up to thirteen and paying $459.20 and $762.80. The pages here use the reading the document supports, and the alternative is stated with its size, because the guides are silent rather than explicit and a reader deserves to know which one produced the figure they are looking at.",
      notIncluded:
        "This estimate is Guide 04's two valuation tables for the permit's plan review fee and its inspection fee, plus the state building code surcharge. It excludes:\n\n- **The flat minimum fees** above the tables: change of use at $970.00 and $419.00, communication antenna at $3,364.00 and $1,514.00, pole or tower at $6,272.00 and $4,280.00, sign at $1,597.00 and $737.00, school portable at $5,269.00 and $4,225.00, high-piled storage at $1,587.00 and $1,711.00, emergency generator at $1,587.00 and $1,711.00, tank or underground fuel piping at $970.00, alarm system at $970.00 plus $1,160.00 and $24 per device, sprinkler system at $970.00 plus $1,160.00 and $24 per head, other fire suppression at $1,587.00 and $1,711.00, trail bridge at $42.00 and $65.00 per lineal foot, and demolition at $796.00.\n- **Guide 02's single-family rows**, which are the price of a residential permit rather than a version of this one: $1,936.00 to $8,128.00 of review plus $2.46 per square foot of inspection for a new home, $772.00 for a deck or small accessory building, $1,627.00 for a carport, $3,109.00 for a garage addition or conversion into living space, $362.00 to $2,392.00 for a remodel by number of modifications, $183.00 for a mechanical installation only, $560.00 for a demolition or relocation only, and the site-review rows at $2,033.00, $3,618.00 or $483.00.\n- **Certificate of occupancy and operating permit fees**: $442.00 for an individual townhouse or a partly constructed building, $970.00 for more than one building per permit, $970.00 for a temporary certificate, $970.00 for a letter of completion on shell construction, $419.00 per building per site visit for an occupancy inspection, $171.00 for an operating permit and $114.00 for its renewal, per item.\n- **Plan re-submittals after the second and revisions to an issued permit**, which the guide prices as \"the plan changes as a portion of the total project, as determined by the department\" rather than at a published figure.\n- **School impact mitigation**, priced on Fee Guide 03, and site, road, storm water and environmental review fees, priced on Guides 05 to 08.\n- **Anything the county decides the valuation should be.** These figures use the valuation you enter; if the plans examiner substitutes a figure from the county's cost tables, both tables are read against that number instead.\n- **The cost of the work itself, and any tax on it.** No sales or use tax line is published in these guides and none is added here.",
      workedExample: {
        scenario:
          "A commercial tenant improvement in unincorporated King County with a declared construction valuation of $1,200,000, filed as one building permit.",
        inputs: {
          valuationCents: 120_000_000,
        },
        notes:
          "Both tables land in their sixth band. Plan review is the sixth band's $10,548.00 plus $6.85 for each of the 200 additional thousands, which is $1,370.00, giving $11,918.00 — payable at application. Inspection is the same band's $16,843.00 plus $10.30 for each of the 200 additional thousands, which is $2,060.00, giving $18,903.00 — payable at issuance. The state building code surcharge adds $25.00 as a commercial permit. The total is $30,846.00, and the inspection fee alone is 61% of it. The same project completed as a single-family home would pay $6.50 of surcharge instead of $25.00, and would be priced by Guide 02's residential rows rather than by either table.",
      },
      faqs: [
        {
          question: "How much is a building permit in King County?",
          answer:
            "It depends on the valuation, and it is two fees rather than one. At $25,000 the plan review table gives $788.00 and the inspection table $1,298.00; at $100,000, $1,988.00 and $3,153.00; at $1,000,000, $10,548.00 and $16,843.00; at $5,000,000, $37,948.00 and $58,043.00. Add the state surcharge — $25.00 on a commercial permit, $6.50 on a residential one. A $1,200,000 project comes to $30,846.00.",
        },
        {
          question: "Why are there two permit fees?",
          answer:
            "Because the county publishes two tables and applies the same valuation to both. The guide's own method paragraph says the valuation \"is then applied to the fee tables below to determine the required plan review and inspection fees\", and the column headings on its first page are \"Application\" and \"Permit\" — review is paid when you file, inspection when the permit is issued. Single-family work does not use either table; it is priced by a separate residential guide.",
        },
        {
          question: "Who decides the valuation?",
          answer:
            "The county, from its own cost data, with your figures as one input: \"The permit technician or plans examiner determines the County valuation of the building construction or mechanical installation of a project, using data tables that list the standard construction cost per square foot, by type of construction and occupancy, or other data provided by the permit applicant.\" The tables this site computes from use the valuation you enter, and the county may substitute a different one.",
        },
        {
          question: "Is the state surcharge $25 or $6.50?",
          answer:
            "Both, on different permits. The commercial guide prints a $25.00 minimum fee per building permit and $2.00 per additional dwelling unit; the single-family guide prints $6.50. RCW 19.27.085 sets the same two rates — $6.50 on a residential building permit and $25.00 on a commercial one. A mechanical, sprinkler or tank permit pays neither, because the guide's footnote excludes them under WAC 51-05-200.",
        },
        {
          question: "Does a valuation get rounded up to the next $1,000?",
          answer:
            "The county's guides do not say so. Their rates are published \"per $1,000 of Value\" and neither guide contains the phrase \"or fraction thereof\" anywhere, where Boulder City's, Clark County's and Denver's schedules all print it. This site therefore charges the exact number of thousands: a $12,500 valuation pays $445.50 of plan review and $740.50 of inspection, where rounding up to thirteen would give $459.20 and $762.80. The difference is at most one increment, and it is stated here rather than buried because the guides are silent.",
        },
        {
          question: "Do the fee tables agree with themselves?",
          answer:
            "Yes, at all six seams in both tables. The review table opens its bands at $788.00, $1,303.00, $1,988.00, $6,548.00, $10,548.00 and $37,948.00, and each of those is exactly what the band below produces at its own top; the inspection table does the same with $1,298.00, $2,068.00, $3,153.00, $9,993.00, $16,843.00 and $58,043.00. This site checks every one of them against the arithmetic rather than trusting it.",
        },
        {
          question: "What does a new single-family home cost?",
          answer:
            "Guide 02 prices it by plan and by square foot rather than by valuation. A pre-registered basic plan is $1,936.00 of application review plus $2.46 per square foot of inspection; a custom design is $8,128.00 plus $4,639.00 of site review plus the same $2.46 per square foot; a modular home is $2,419.00 plus $4,639.00; an accessory dwelling unit is $4,556.00 plus $3,618.00. Sprinklers add $1,119.00 of review and $1,997.00 of inspection, and the state surcharge is $6.50.",
        },
      ],
      seoTitle: "King County building permit cost: two valuation tables",
      seoDescription:
        "King County building permit fees from the county's own 2026 guides — a plan review table and an inspection table charged on one valuation, the state surcharge, and a worked $1,200,000 example.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: KING_COUNTY_LAST_VERIFIED,
    },
    {
      jurisdictionKey: KING_COUNTY_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      slug: "electrical-permit-cost",
      title: "King County electrical permit cost",
      intro:
        "There is no such thing as a King County electrical permit: in unincorporated King County, electrical work is permitted by the **Washington State Department of Labor & Industries**, and the county's own residential fee guide says so in its margin. The fee comes from WAC 296-46B-906 and is charged by amperage, circuits and devices — a 200-ampere altered service in a home is $109.90, an eight-circuit residential panel is $95.20, and adding permanent transfer equipment for a portable generator is another $109.90.",
      localSummary:
        "Three schedules in this dataset price electrical work three different ways, and King County's is the one that is not local at all. Houston charges per device, Clark County charges per device with a fallback to its valuation table, Denver charges on the value of the electrical work — and here the price is set by a **state regulation** that applies identically in every county outside Seattle, Tacoma and Tacoma Power's service area. WAC 296-46B-906 opens by naming its own unit: \"To calculate inspection fees, the amperage is based on the conductor ampacity or the overcurrent device rating.\"\n\nThat single sentence explains the shape of the whole schedule. Altered residential services are banded at 0–200, 201–600 and 601 amperes and over, at $109.90, $161.00 and $242.70. Altered commercial services are banded four ways at $129.40, $303.60, $457.90 and $508.60. Temporary services are banded six ways from $69.10 to $182.60. And where the work is circuits rather than a service, the schedule counts circuits: $78.80 for the first four on a residential panel and $8.20 for each one after, or $100.50 for the first five on a commercial panel and the same $8.20 each after.\n\nTwo features of this schedule are unusual enough to be worth stating plainly. The first is that **the residential circuit row carries a published ceiling**. Its note says: \"Total cost of the alterations in an individual panel should not exceed the cost of a complete altered service or feeder of the same rating.\" That is the only place in this dataset where a schedule caps a sum rather than a line, and it is modelled here as a $109.90 maximum on the residential circuits rule — the 0–200 ampere altered service rate, which is the common case.\n\nThe second is that **plan review is charged as a percentage**, 35% of the electrical permit fee under subsection (9)(a), with a separate $100.50 submission fee and a $27.90 handling fee. It applies where plans are submitted, so it is quoted here rather than modelled.\n\nThen there is the list of rows that make up an ordinary job, each with its own footing: $109.90 for permanently installed transfer equipment for a portable generator, a note above it sending a permanently installed generator to the service rows instead; $69.10 for a low-voltage or telecommunications system covering the first 2,500 square feet and $18.30 for each additional 2,500; $59.50 for the first sign and $27.90 for each additional one inspected at the same time; $59.40 to repair a meter or mast with no alteration to the service; $49.80 to inspect a hot tub alongside the service, $78.80 to inspect it separately.\n\nOne consequence of the county's split of authorities is worth a line of its own: because the same regulation prices electrical work in every county it covers, **a permit that costs $109.90 here costs $109.90 in Spokane**, while the building permit for the same project is priced by each county's own schedule and can differ by thousands.",
      notIncluded:
        "This estimate is the electrical inspection fees set by WAC 296-46B-906 for the item selected. It excludes:\n\n- **Plan review**, which is 35% of the electrical permit fee under subsection (9)(a) wherever plans are submitted, plus its own $100.50 submission fee per submission and a $27.90 handling fee.\n- **The minimum the section imposes on progress inspections**: the total fee \"must not be less than the number of progress inspection (one-half hour) units times the progress inspection fee rate\", which is $59.50 per half hour.\n- **Every hourly and per-trip charge**: other inspections at $119.90 portal to portal, out-of-normal-hours inspections at a $151.10 surcharge, a requested inspection of an existing installation at $119.90, a trip for work that is not ready at $59.50, removal of a noncompliance notice at $59.50, and covered or concealed work at $59.50.\n- **The residential new-construction rows**, which are charged by area and by item rather than by amperage: $119.90 for the first 1,300 square feet and $38.20 for each additional 500, $49.80 or $78.80 per outbuilding, $78.80 or $119.90 per swimming pool, $49.80 or $78.80 per hot tub depending on whether it is inspected with the service, $129.40 for a multifamily service at 0–200 amperes with $38.20 for each additional feeder.\n- **The remaining panel and circuit rows** beyond the ones modelled: the commercial circuits rule here prices one branch-circuit panel, because the section charges per panelboard, and the residential rule is capped at a 0–200 ampere service.\n- **Annual permits and Class B labels**: annual electrical permits from $2,913.90 for a plant with up to three electricians to $14,581.10 for more than 25, a block of 20 Class B basic work labels at $329.80, and provisional labels at the same price. Annual telecommunications permits are $240.70 for the first two hours and $119.90 per additional hour.\n- **Carnival, irrigation and marina rows**, and the $100.50 surcharge for a permit over 600 volts, which is modelled as a surcharge rather than included in the item fee.\n- **The county's or the city's own charges**, if any: an electrical permit in King County is not bought from the county, and an electrical inspection has no county fee attached to it.\n- **Illegal-work consequences**, such as the notice of correction or penalty that follows work done without a permit. Those are not fees and are not modelled.",
      workedExample: {
        scenario:
          "A 200-ampere service change at a single-family home in unincorporated King County, with permanent transfer equipment for a portable generator installed at the same time.",
        inputs: {
          custom: {
            schedule_item: "altered_service",
            service_amps: 200,
            generator_transfer: true,
          },
        },
        notes:
          "The altered service is in the schedule's 0 to 200 ampere band at $109.90, and the transfer equipment is its own published row at another $109.90: \"Portable generators: Permanently installed transfer equipment for portable generators — $109.90\". The total is $219.80. A permanently installed (not portable) generator would instead be priced as a service or feeder for its own rating. Note what is not added: no plan review, because plan review is 35% of the permit fee only where plans are submitted, and no county fee, because the county does not issue or price this permit.",
      },
      faqs: [
        {
          question: "Who issues an electrical permit in unincorporated King County?",
          answer:
            "The Washington State Department of Labor & Industries, not the county. King County's own residential fee guide says so in its margin: \"Electrical permits are issued by the WA State Department of Labor & Industries.\" The amounts are set by WAC 296-46B-906, and the same schedule applies in every county outside Seattle, Tacoma and Tacoma Power's service area.",
        },
        {
          question: "How much is a service change?",
          answer:
            "On a single-family or multifamily home, $109.90 for a service or feeder of 0 to 200 amperes, $161.00 for 201 to 600, and $242.70 for 601 and over. On a commercial job the altered-service row is higher: $129.40 for 0 to 200 amperes, $303.60 for 201 to 600, $457.90 for 601 to 1000 and $508.60 above that.",
        },
        {
          question: "How does the state charge for adding circuits?",
          answer:
            "By the circuit, and per panel. A residential panel is $78.80 for the first four circuits and $8.20 for each additional one; a commercial panel is $100.50 for the first five and $8.20 each after. The residential row carries the schedule's own ceiling — the total for a panel should not exceed the cost of a complete altered service of the same rating — which this site models as a $109.90 maximum.",
        },
        {
          question: "Is there plan review on an electrical permit?",
          answer:
            "Only where plans are submitted. Subsection (9)(a) makes plan review 35% of the electrical permit fee, with a separate $100.50 submission fee, $119.90 per hour for supplemental submissions and a $27.90 handling fee. The inspection fees on this page are the ones that apply to work permitted without plans.",
        },
        {
          question: "Does the county add anything to the state's fee?",
          answer:
            "No. The county prices building, mechanical, plumbing and gas piping work, and the electrical permit is bought from the state at the state's rates. That is why the electrical figures here are identical in every county the state covers, while a building permit for the same project varies by county.",
        },
        {
          question: "What does a generator cost to permit?",
          answer:
            "$109.90 for permanently installed transfer equipment for a portable generator, as its own row. A permanently installed generator is different: the note above that row sends it to the appropriate residential or commercial new or altered service section, so it is priced by amperage like a service. A permit for work over 600 volts carries a further $100.50 surcharge.",
        },
      ],
      seoTitle: "King County electrical permit cost: Washington State L&I fees",
      seoDescription:
        "Electrical permits in unincorporated King County come from Washington State L&I, not the county. Amperage-based fees from WAC 296-46B-906 — $109.90 for an altered 200-amp service, $8.20 per additional circuit.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: KING_COUNTY_LAST_VERIFIED,
    },
    {
      jurisdictionKey: KING_COUNTY_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      slug: "plumbing-permit-cost",
      title: "King County plumbing permit cost",
      intro:
        "A plumbing permit in unincorporated King County is issued by **Public Health — Seattle & King County**, and the schedule is short: $137.00 for the permit plus $27.00 for each fixture. One fixture is $164.00, a water heater with two other fixtures is $218.00, and a gas piping permit uses the same arithmetic with outlets in place of fixtures. An Already Built Construction permit, for work done without one, is $273.00 plus $55.00 per fixture.",
      localSummary:
        "The plumbing answer here is the shortest schedule in this dataset and one of the most misread, because of a single question: **is the $137.00 a base charge or the first fixture?** It is a base charge. The schedule's row reads \"Plumbing/Backflow Permit — $137 plus $27 per Fixture\", the base has no allowance attached to it, and a one-fixture permit therefore costs $164.00 rather than $137.00. The same reading applies to gas piping, where the row is $137.00 plus $27.00 per outlet.\n\nThere are two other permit rows on the same page. The **Already Built Construction** permit, for work \"done without having paid any permit fees\", is $273.00 plus $55.00 per fixture or outlet, with the schedule's own note that fees already paid are subtracted from the total. A **re-inspection** is $137.00 — a charge for a second visit rather than part of the permit.\n\nThe page also prices the things around the permit rather than the permit itself: plan review at $273.00 per hour, an inspection outside regular hours at $410.00 per hour, a requested site visit where no permit exists at $273.00, a permit renewal at $68.00, and an administrative fee of $41.00 for a permit modification, a correction or refund processing. Re-pipe projects carry a supplemental fee based on the number of anticipated inspections multiplied by the program's hourly operating rate, calculated on a worksheet the program publishes.\n\nTwo things make this jurisdiction different from the other jurisdictions' plumbing pages. The first is **who issues it**: the county's permitting division prices building work, and this permit comes from a health department with its own schedule, its own effective date and its own hourly rates. The second is that **the same schedule also prices Seattle's plumbing permits**, because Seattle's own fee subtitle sends them to the same program — so the two jurisdictions' plumbing pages quote the same document, which is the only instance of that in this dataset.\n\nWhat this page cannot do is price a plumbing job that is part of a larger building project. Denver prices a plumbing permit from the value of the plumbing work; Westminster adds 15% of the building permit fee; King County's health department charges per fixture and would charge plan review by the hour where plans are submitted, which is a different question from \"how much is the permit\". The per-fixture answer is the published one and it is the one shown here.",
      notIncluded:
        "This estimate is the Plumbing and Gas Piping Program's permit fee for the fixtures or outlets entered. It excludes:\n\n- **Plan review**, which this program charges at $273.00 per hour rather than as a percentage, and which is not part of the permit fee.\n- **The $137.00 re-inspection**, the $68.00 permit renewal, the $41.00 administrative fee for a modification, correction or refund, the $273.00 site visit where no permit exists, and $410.00 per hour for an inspection outside regular hours.\n- **The re-pipe supplemental fee**, which the schedule calculates from the number of anticipated inspections times the program's hourly operating rate, on a worksheet it publishes.\n- **Gas piping work priced per outlet**, which uses the same $137.00 plus $27.00 arithmetic as fixtures but is a separate permit row: $27.00 per outlet rather than per fixture.\n- **The Already Built Construction premium** unless it is selected: that permit is $273.00 plus $55.00 per fixture, for work done without a permit, with fees already paid deducted from the total.\n- **Anything charged by the county's Permitting Division** — the building permit, its two valuation tables, the state building code surcharge, and any mechanical work, which are separate permits from this one.\n- **Sewer and water connection charges**, which are utility charges rather than permit fees, and on-site septic design and installation, which the same health department reviews under a different program.\n- **The cost of the fixtures and their installation**, which is the work itself rather than the permit.",
      workedExample: {
        scenario:
          "A water heater replacement plus two other plumbing fixtures in a single-family home in unincorporated King County, filed as one plumbing permit.",
        inputs: {
          fixtures: 3,
        },
        notes:
          "Three fixtures at $27.00 is $81.00, and the permit's $137.00 base is added to that rather than covering the first fixture, so the total is $218.00. A one-fixture permit is $164.00, not $137.00 — the base is a charge, not an allowance. If the same work had been done before a permit was taken out, the Already Built Construction row would apply instead at $273.00 plus $55.00 per fixture, which for three fixtures is $438.00, with any permit fees already paid deducted from it.",
      },
      faqs: [
        {
          question: "How much is a plumbing permit in King County?",
          answer:
            "$137.00 plus $27.00 per fixture. Three fixtures is $218.00; one fixture is $164.00, because the $137.00 is a base charge rather than a first fixture. A gas piping permit uses the same base with $27.00 per outlet instead of per fixture.",
        },
        {
          question: "Who issues a plumbing permit in unincorporated King County?",
          answer:
            "Public Health — Seattle & King County, through its Plumbing and Gas Piping Program, not the county's Permitting Division. The county's own fee guide says so: \"On-site septic design and installation, plumbing, and gas-piping permits are issued by Seattle-King County Public Health.\" The program's schedule is dated effective January 1, 2026.",
        },
        {
          question: "Is plan review included in the fixture fee?",
          answer:
            "No. Plan review is charged at $273.00 per hour by this program, separately from the permit, and the schedule lists it as its own row for both plumbing/backflow and gas piping. The per-fixture figure on this page is the permit fee only.",
        },
        {
          question: "What if the work was already done without a permit?",
          answer:
            "The Already Built Construction permit applies: $273.00 plus $55.00 per fixture or outlet, for work \"done without having paid any permit fees\". The schedule's own note says fees already paid are subtracted from that total. Three fixtures would be $438.00.",
        },
        {
          question: "How much is a re-inspection?",
          answer:
            "$137.00, charged when a second visit is needed. The same page also prices an inspection outside regular hours at $410.00 per hour, a requested site visit where no permit exists at $273.00, a permit renewal at $68.00, and an administrative fee of $41.00 for a permit modification, a correction or refund processing.",
        },
        {
          question: "Is this the same fee Seattle charges?",
          answer:
            "Yes — the same document. Seattle's fee subtitle, at SMC 22.900G.030, directs plumbing, medical gas and fuel gas piping fees to \"the Director of King County Public Health\", so a plumbing permit in Seattle is priced by this county program rather than by the City. It is the only schedule in this dataset that prices permits in two jurisdictions.",
        },
      ],
      seoTitle: "King County plumbing permit cost: $137 plus $27 per fixture",
      seoDescription:
        "Plumbing permits in unincorporated King County come from Public Health — Seattle & King County: $137.00 plus $27.00 per fixture, $273.00 per hour for plan review, and $137.00 for a re-inspection.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: KING_COUNTY_LAST_VERIFIED,
    },
  ],

  verifications: [
    {
      entityType: "source",
      entityKey: KING_COUNTY_BUILDING_GUIDE_SOURCE_KEY,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: KING_COUNTY_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: KING_COUNTY_BUILDING_GUIDE_SOURCE_KEY,
      notes:
        "Read 2026-09-24 in three pdftotext modes. The two valuation tables, the state surcharge row and its WAC 51-05-200 footnote are identical in all three readings. Both tables' seams were then recomputed from the printed rates rather than read off: review closes at $788, $1,303, $1,988, $6,548, $10,548 and $37,948 and inspection at $1,298, $2,068, $3,153, $9,993, $16,843 and $58,043, and every one is what the band below produces at its own top. The model asserts all twelve in tests/content/kingcounty-seed.test.ts and recomputes them from PostgreSQL in npm run db:verify.",
    },
    {
      entityType: "source",
      entityKey: KING_COUNTY_SFR_GUIDE_SOURCE_KEY,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: KING_COUNTY_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: KING_COUNTY_SFR_GUIDE_SOURCE_KEY,
      notes:
        "Read 2026-09-24 in three pdftotext modes. Two facts are taken from it: the residential state surcharge of $6.50, which differs from Guide 04's $25, and its statement of which authority issues electrical, plumbing and gas piping permits. Its own fee rows are quoted in prose only — they are priced per square foot and per named job, so they have no valuation to compute from and no rule was written for them.",
    },
    {
      entityType: "source",
      entityKey: KING_COUNTY_PLUMBING_SOURCE_KEY,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: KING_COUNTY_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: KING_COUNTY_PLUMBING_SOURCE_KEY,
      notes:
        "One page, read 2026-09-24 in three pdftotext modes. The modes disagree in a way worth recording: `-layout` puts the value column beside the wrong labels (the $137-plus-$27 pair appears against the page header rather than the fixture rows), while `-table` pairs each label with its own value and the two agree once that shift is accounted for. The values here are from the reading that pairs them correctly, cross-checked against the `-raw` reading. The schedule's own heading carries the effective date, January 1, 2026, so the version read is dated by the document.",
    },
    {
      entityType: "source",
      entityKey: WA_LNI_ELECTRICAL_SOURCE_KEY,
      status: "verified",
      method: "official_portal_check",
      verifiedAt: KING_COUNTY_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: WA_LNI_ELECTRICAL_SOURCE_KEY,
      notes:
        "Read 2026-09-24 from the Legislature's official citation page for WAC 296-46B-906, which serves the whole section including every table. Every amount modelled here was checked against that text: the residential altered-service rows ($109.90, $161.00, $242.70), the commercial altered-service rows ($129.40, $303.60, $457.90, $508.60), the circuit rows ($78.80 for four and $8.20 each after, $100.50 for five and $8.20 each after), the temporary-service bands ($69.10 to $182.60), the generator row at $109.90, the low-voltage row at $69.10, the signs row at $59.50 and $27.90, and the over-600-volt surcharge at $100.50. No effective date is asserted for the version read, because the citation page does not date the text it serves; the section's most recent filing is WSR 26-10-060, effective July 1, 2026.",
    },
    {
      entityType: "fee_rule",
      entityKey: "PR-1",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: KING_COUNTY_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: KING_COUNTY_BUILDING_GUIDE_SOURCE_KEY,
      notes:
        "The first band of both tables, quoted as printed: \"$1 - $25,000.00 — $103, plus $27.40 per $1,000 of Value\" for review and \"$183, plus $44.60 per $1,000 of Value\" for inspection. The first band is the only one with no threshold, so the rate applies to the whole valuation rather than to the excess — a shape that inverts the usual convention and that the tests assert at both ends of the band.",
    },
    {
      entityType: "fee_rule",
      entityKey: "PR-1",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: KING_COUNTY_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: KING_COUNTY_BUILDING_GUIDE_SOURCE_KEY,
      notes:
        "The rounding reading, recorded as a finding rather than hidden in a config: neither guide contains the string \"fraction\" at all, where Boulder City's, Clark County's and Denver's schedules print \"or fraction thereof\" in every valuation band. Every band here is therefore stored without a rounding increment and the fee is prorated across thousands, which leaves the seam figures identical at exact thousands and charges proportionally between them. The tests assert both a prorated case ($12,500) and a seam case, and the building page states the alternative reading and its size.",
    },
    {
      entityType: "fee_rule",
      entityKey: "PR-7",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: KING_COUNTY_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: KING_COUNTY_BUILDING_GUIDE_SOURCE_KEY,
      notes:
        "The open band, where the seam check matters most: \"Over $5,000,000.00 — $37,948, plus $5.70 per $1,000 of Value > $5,000,000\" for review, and \"$58,043, plus $7.40\" for inspection. Both are exact at the handover from the band below, which is why a $5,000,001 valuation costs $37,948.01 and not something a cent or a dollar away.",
    },
    {
      entityType: "fee_rule",
      entityKey: "STATE-SURCHARGE-COMMERCIAL",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: KING_COUNTY_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: KING_COUNTY_BUILDING_GUIDE_SOURCE_KEY,
      notes:
        "Guide 04 prints \"State building code surcharge: minimum fee per building permit $25.00\" and Guide 02 prints \"$6.50\", so the two guides carry different amounts for the same statutory charge. RCW 19.27.085 settles which applies where — $6.50 on a residential building permit and $25.00 on a commercial one — and the model follows the statute with the county's own two rows as corroboration. The word \"minimum\" in Guide 04's row is not modelled as a floor on anything else, because no other row is published as its base.",
    },
    {
      entityType: "fee_rule",
      entityKey: "STATE-SURCHARGE-ADDITIONAL-UNITS",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: KING_COUNTY_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: KING_COUNTY_BUILDING_GUIDE_SOURCE_KEY,
      notes:
        "Guide 04: \"fee per additional dwelling unit permitted $2.00\". Modelled as a per-unit rule with an allowance of one unit, which is RCW 19.27.085(3)'s \"two dollars for each residential unit, but not including the first unit\", and conditioned on more than one unit so that a single-dwelling permit does not show a zero line.",
    },
    {
      entityType: "fee_rule",
      entityKey: "PLUMBING-PER-FIXTURE",
      permitTypeKey: "plumbing",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: KING_COUNTY_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: KING_COUNTY_PLUMBING_SOURCE_KEY,
      notes:
        "The schedule's own row: \"Plumbing/Backflow Permit — $137 plus $27 per Fixture\". Read as a base charge rather than a first fixture, because the row states the $137 without an allowance; the consequence is stated on the page ($164.00 for one fixture, not $137.00). The same document's gas piping row uses $27 per outlet with the same base, and the Already Built Construction row $273 plus $55 per fixture or outlet.",
    },
    {
      entityType: "fee_rule",
      entityKey: "LNI-ALTERED-SERVICE-1",
      permitTypeKey: "electrical",
      status: "verified",
      method: "official_portal_check",
      verifiedAt: KING_COUNTY_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: WA_LNI_ELECTRICAL_SOURCE_KEY,
      notes:
        "WAC 296-46B-906(1)(c)(i): \"Each altered service and/or altered feeder — 0 to 200 — $109.90\". This is the row the worked example on the electrical page uses, and the band boundaries are asserted at 200, 201, 600 and 601 amperes in tests/content/kingcounty-seed.test.ts so that the three rows cannot silently overlap or leave a gap.",
    },
    {
      entityType: "fee_rule",
      entityKey: "LNI-CIRCUITS-RESIDENTIAL",
      permitTypeKey: "electrical",
      status: "verified",
      method: "official_portal_check",
      verifiedAt: KING_COUNTY_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: WA_LNI_ELECTRICAL_SOURCE_KEY,
      notes:
        "WAC 296-46B-906(1)(d): \"1 to 4 circuits — $78.80\", \"Each additional circuit — $8.20\", with the note \"Total cost of the alterations in an individual panel should not exceed the cost of a complete altered service or feeder of the same rating\". Modelled with a $109.90 maximum — the 0–200 ampere altered-service rate — and the test asserts that an unbounded number of circuits stops at that figure rather than growing past it. This is the only ceiling on a sum in the dataset.",
    },
    {
      entityType: "jurisdiction_profile",
      entityKey: KING_COUNTY_KEYS.jurisdiction,
      status: "verified",
      method: "manual_review",
      verifiedAt: KING_COUNTY_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: KING_COUNTY_BUILDING_GUIDE_SOURCE_KEY,
      notes:
        "The profile's three claims are each traceable to a document: three authorities from Guide 02's margin and the three schedules themselves; the split fee from Guide 04's method paragraph and its Application/Permit column headings; the two surcharge rates from the two guides and RCW 19.27.085. The headline figure on the building page — $30,846.00 — is computed by the engine from the rules and asserted in the tests rather than written into the profile.",
    },
    {
      entityType: "permit_page",
      entityKey: "building-permit-cost",
      permitTypeKey: "building",
      status: "verified",
      method: "manual_review",
      verifiedAt: KING_COUNTY_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: KING_COUNTY_BUILDING_GUIDE_SOURCE_KEY,
      notes:
        "The worked example was recomputed by the engine before the prose was written, and the page's figures are the engine's output: $11,918.00 of review, $18,903.00 of inspection and $25.00 of surcharge on a $1,200,000 valuation. The test recomputes the same inputs and asserts the components, so the prose and the calculation cannot drift apart unnoticed.",
    },
    {
      entityType: "permit_page",
      entityKey: "electrical-permit-cost",
      permitTypeKey: "electrical",
      status: "verified",
      method: "official_portal_check",
      verifiedAt: KING_COUNTY_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: WA_LNI_ELECTRICAL_SOURCE_KEY,
      notes:
        "Every figure on the page is a row of WAC 296-46B-906, checked against the citation text. The page's opening claim — that there is no county electrical permit — is sourced to Guide 02's margin rather than to the regulation, because it is the county's own document that assigns the authority to the state.",
    },
    {
      entityType: "permit_page",
      entityKey: "plumbing-permit-cost",
      permitTypeKey: "plumbing",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: KING_COUNTY_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: KING_COUNTY_PLUMBING_SOURCE_KEY,
      notes:
        "The page states one reading outright — that the $137.00 is a base charge and not an allowance — and gives its consequence in the same sentence, so a reader who disagrees can see what would change. The worked example (three fixtures, $218.00) is computed by the engine and asserted in the tests.",
    },
  ],
};

/**
 * The pages this jurisdiction publishes: three, derived from the payload rather than
 * written out again, so the tests and the sitemap cannot disagree with it.
 */
export const KING_COUNTY_PUBLISHED_PERMIT_PAGES = kingCountySeed.permitPages.filter(
  (page) => page.publishStatus === "published" && !page.noindex,
);
