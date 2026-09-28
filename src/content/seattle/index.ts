import type { JurisdictionSeed } from "@/content/seed-types";

import {
  KING_COUNTY_FEE_EFFECTIVE_FROM,
  KING_COUNTY_PLUMBING_RULES,
  KING_COUNTY_PLUMBING_SOURCE_KEY,
} from "@/content/kingcounty/fee-rules";

import {
  SEATTLE_BCC_SOURCE_KEY,
  SEATTLE_BUILDING_RULES,
  SEATTLE_ELECTRICAL_RULES,
  SEATTLE_ELECTRICAL_SOURCE_KEY,
  SEATTLE_FEE_EFFECTIVE_FROM,
  SEATTLE_SUBTITLE_SOURCE_KEY,
} from "./fee-rules";

/**
 * Seattle, Washington — the City of Seattle, which issues its own building and
 * electrical permits and does not issue plumbing permits at all.
 *
 * Seattle is in King County, so the two jurisdictions in this state share a boundary and
 * a source: the county's public health department prices plumbing permits **in the city
 * too**, because Seattle's own fee subtitle says so (SMC 22.900G.030). That is why this
 * payload imports `KING_COUNTY_PLUMBING_RULES` rather than defining a second copy — a
 * figure quoted here as Seattle's would come from a document that does not exist.
 *
 * Research record: research/washington/seattle.md.
 */

export const SEATTLE_LAST_VERIFIED = "2026-09-24";

export const SEATTLE_KEYS = {
  state: "wa",
  county: "king-county",
  jurisdiction: "seattle",
  feeSchedule: SEATTLE_SUBTITLE_SOURCE_KEY,
} as const;

const RESEARCHER = "Permit Fee Intelligence research pass 9 (Washington, second jurisdiction)";

const state = {
  code: "WA",
  slug: "washington",
  name: "Washington",
  fipsCode: "53",
};

const county = {
  key: SEATTLE_KEYS.county,
  slug: "king-county",
  name: "King County",
  fipsCode: "53033",
};

export const seattleSeed: JurisdictionSeed = {
  state,
  county,

  jurisdiction: {
    key: SEATTLE_KEYS.jurisdiction,
    stateKey: SEATTLE_KEYS.state,
    countyKey: SEATTLE_KEYS.county,
    type: "city",
    slug: "seattle",
    name: "Seattle",
    officialName: "City of Seattle",
    websiteUrl: "https://www.seattle.gov/sdci",
    permitPortalUrl: "https://www.seattle.gov/sdci/permits",
    timezone: "America/Los_Angeles",
    isActive: true,
  },

  departments: [
    {
      key: "seattle-sdci",
      jurisdictionKey: SEATTLE_KEYS.jurisdiction,
      kind: "building",
      name: "Seattle Department of Construction and Inspections (SDCI)",
      phone: null,
      email: null,
      url: "https://www.seattle.gov/sdci",
      addressLine: null,
      hours: null,
      notes:
        "The department whose fees these are, and the one that adopts them: the 2026 Fee Subtitle amends Seattle Municipal Code Chapter 22.900 and sets every building and electrical figure published here. No telephone number is asserted, because the fee subtitle prints none — it names only the Director and the department.",
    },
    {
      key: "seattle-city-light",
      jurisdictionKey: SEATTLE_KEYS.jurisdiction,
      kind: "utilities",
      name: "Seattle City Light",
      phone: null,
      email: null,
      url: "https://www.seattle.gov/city-light",
      addressLine: null,
      hours: null,
      notes:
        "Seattle's municipal utility, and a fee authority on one electrical row: Table D-15's item 3.f is \"SCL request for safety inspection — $146.00, no Administrative Fee\". It is the only item in the table that escapes the $55.48 administrative fee, and the reason the administrative-fee rule is written to exclude it.",
    },
    {
      key: "seattle-plumbing-authority",
      jurisdictionKey: SEATTLE_KEYS.jurisdiction,
      kind: "health",
      name: "Public Health — Seattle & King County, Plumbing and Gas Piping Program",
      phone: null,
      email: "planreviewinfo@kingcounty.gov",
      url: "https://kingcounty.gov/en/dept/dph/health-safety/environmental-health/plumbing-gas",
      addressLine: null,
      hours: null,
      notes:
        "Not a City department, and the plumbing authority for the City: SMC 22.900G.030 directs plumbing, medical gas and fuel gas piping fees to \"the Director of King County Public Health\". The same program prices plumbing permits in unincorporated King County, so both jurisdictions' plumbing pages quote one schedule.",
    },
  ],

  sources: [
    {
      key: SEATTLE_SUBTITLE_SOURCE_KEY,
      jurisdictionKey: SEATTLE_KEYS.jurisdiction,
      title:
        "2026 Fee Subtitle (Seattle Municipal Code Chapter 22.900), adopted as Ordinance 119255",
      url: "https://www.seattle.gov/documents/Departments/SDCI/Codes/FeeSubtitleFinal.pdf",
      sourceType: "municipal_code",
      issuingAuthority: "City of Seattle, Department of Construction and Inspections",
      authorityKind: "city",
      isPrimary: true,
      documentDate: null,
      effectiveFrom: SEATTLE_FEE_EFFECTIVE_FROM,
      retrievedAt: SEATTLE_LAST_VERIFIED,
      lastVerifiedAt: SEATTLE_LAST_VERIFIED,
      notes:
        "The whole subtitle, sha256 beginning d7c6bc15590c7052, read 2026-09-24 in three pdftotext modes. Its own title page describes it as \"including changes becoming effective January 1, 2026\", which is where the effective date comes from. Every building and electrical figure published for Seattle is a row of this document: Table D-1 for the Development Fee Index, Table D-2 for what a permit and a plan review are as percentages of that index, Table D-15 for electrical work without plans, and SMC 22.900A.100 for the technology fee that applies to all of them.",
    },
    {
      key: SEATTLE_ELECTRICAL_SOURCE_KEY,
      jurisdictionKey: SEATTLE_KEYS.jurisdiction,
      title: "2026 Fee Subtitle — Table D-15, electrical permit fees when plans are not required",
      url: "https://www.seattle.gov/documents/Departments/SDCI/Codes/FeeSubtitleFinal.pdf",
      sourceType: "municipal_code",
      issuingAuthority: "City of Seattle, Department of Construction and Inspections",
      authorityKind: "city",
      isPrimary: true,
      documentDate: null,
      effectiveFrom: SEATTLE_FEE_EFFECTIVE_FROM,
      retrievedAt: SEATTLE_LAST_VERIFIED,
      lastVerifiedAt: SEATTLE_LAST_VERIFIED,
      notes:
        "The same document as the row above — the same URL, because a fee subtitle is one document — recorded under a second key so that every electrical rule cites the table it actually came from. Table D-15 is the schedule for work where plans are not required; Table D-14, which prices electrical work by valuation where plans are reviewed, is named in prose and not modelled, because the two tables charge the same job differently ($292.00 for a 200-ampere service under D-15 against a percentage of valuation under D-14) and choosing between them is the department's judgement rather than a rule.",
    },
    {
      key: SEATTLE_BCC_SOURCE_KEY,
      jurisdictionKey: SEATTLE_KEYS.jurisdiction,
      title: "RCW 19.27.085 — Building code council fees",
      url: "https://app.leg.wa.gov/rcw/default.aspx?cite=19.27.085",
      sourceType: "state_agency",
      issuingAuthority: "Washington State Legislature",
      authorityKind: "state",
      isPrimary: true,
      documentDate: null,
      effectiveFrom: null,
      retrievedAt: SEATTLE_LAST_VERIFIED,
      lastVerifiedAt: SEATTLE_LAST_VERIFIED,
      notes:
        "\"There is imposed a fee of six dollars and fifty cents on each residential building permit and a fee of twenty-five dollars for each commercial building permit, issued by a county or a city\", plus \"an additional surcharge of two dollars for each residential unit, but not including the first unit\". The City collects it and remits it, and it sits outside the fee chapters the technology fee applies to. Read 2026-09-24 from the official citation. It is the second source in this dataset set by a state statute rather than a local ordinance, after Texas's — and the first where the two rates are split by occupancy rather than by size.",
    },
    {
      key: KING_COUNTY_PLUMBING_SOURCE_KEY,
      jurisdictionKey: SEATTLE_KEYS.jurisdiction,
      title: "Plumbing and Gas Piping Program service fees (effective January 1, 2026)",
      url: "https://cdn.kingcounty.gov/-/media/king-county/depts/dph/documents/health-safety/environmental-health/fees/plumbing-gas-piping-service-fees-through-2026.pdf",
      sourceType: "fee_schedule_pdf",
      issuingAuthority: "Public Health — Seattle & King County, Community Environmental Health",
      authorityKind: "county",
      isPrimary: true,
      documentDate: null,
      effectiveFrom: KING_COUNTY_FEE_EFFECTIVE_FROM,
      retrievedAt: SEATTLE_LAST_VERIFIED,
      lastVerifiedAt: SEATTLE_LAST_VERIFIED,
      notes:
        "A county document that prices City permits, which is why it is recorded against Seattle as well as against King County. SMC 22.900G.030 is the City's own instruction: \"Fees for plumbing, medical or dental gas, lab gas, and fuel gas piping shall be collected by the Director of King County Public Health in accordance with the fee schedule as set forth in Seattle Municipal Code Section 504.\" The figures are $137.00 plus $27.00 per fixture. The same PDF appears in the King County payload under the same key, because it is the same document and the same fee.",
    },
  ],

  /** Empty on purpose: the permit types this jurisdiction uses already exist. */
  permitTypes: [],
  projectTypes: [],

  jurisdictionPermitTypes: [
    {
      jurisdictionKey: SEATTLE_KEYS.jurisdiction,
      permitTypeKey: "building",
      isAvailable: true,
      localName: "Building permit",
      officialUrl: null,
      notes:
        "Priced in two steps rather than from a table of fees. Table D-1 returns a **Development Fee Index** for the valuation, and Table D-2 then says the permit fee is 100% of that index and the plan review fee is 100% of the same index — so a project pays the index twice. A project processed as subject to field inspection pays 100% for the permit and 40% for review. On top of both sit the 5% technology fee and the state's $6.50 or $25.00 building code council fee.",
    },
    {
      jurisdictionKey: SEATTLE_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      isAvailable: true,
      localName: "Electrical permit",
      officialUrl: null,
      notes:
        "Two tables, and which one applies is the department's decision rather than the applicant's: Table D-15 for work where plans are not required, and Table D-14 for work where they are. D-15 charges by service size at $146.00 to $365.00, by branch circuit or feeder at $26.28 to $292.00 each, and by control unit at $17.52 plus $2.92 per device, with a $55.48 administrative fee added to every item except a City Light safety inspection and a $105.12 minimum on a standard self-issued online permit.",
    },
    {
      jurisdictionKey: SEATTLE_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      isAvailable: true,
      localName: "Plumbing permit (King County Public Health)",
      officialUrl:
        "https://kingcounty.gov/en/dept/dph/health-safety/environmental-health/plumbing-gas",
      notes:
        "Not issued by the City. SMC 22.900G.030 sends plumbing, medical gas and fuel gas piping fees to the Director of King County Public Health, and that program's schedule charges $137.00 plus $27.00 per fixture, with plan review at $273.00 per hour. The City's fee subtitle says so in the same chapter that sets its own building fees, which makes this the only permit in the dataset whose authority is named by the jurisdiction it is *not* charged by.",
    },
    {
      jurisdictionKey: SEATTLE_KEYS.jurisdiction,
      permitTypeKey: "mechanical",
      isAvailable: true,
      localName: "Mechanical permit",
      officialUrl: null,
      notes:
        "Priced as 100% of its own Development Fee Index when filed separately (Table D-2, item 4b), plus gas piping and refrigeration equipment fees in Table D-8, and the 5% technology fee on top. A mechanical permit that is part of a building permit is priced inside that permit's index instead. No mechanical page is published in this release.",
    },
  ],

  feeSchedules: [
    {
      key: SEATTLE_SUBTITLE_SOURCE_KEY,
      jurisdictionKey: SEATTLE_KEYS.jurisdiction,
      sourceKey: SEATTLE_SUBTITLE_SOURCE_KEY,
      title: "2026 Fee Subtitle (SMC Chapter 22.900), effective January 1, 2026",
      officialUrl: "https://www.seattle.gov/documents/Departments/SDCI/Codes/FeeSubtitleFinal.pdf",
      effectiveFrom: SEATTLE_FEE_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: SEATTLE_LAST_VERIFIED,
      notes:
        "One document, one effective moment, and the subtitle states it on its face: \"including changes becoming effective January 1, 2026\". It also lists the ordinances that amended it, so a reader can see which edition they are holding rather than inferring it from when the page was fetched.",
    },
    {
      key: KING_COUNTY_PLUMBING_SOURCE_KEY,
      jurisdictionKey: SEATTLE_KEYS.jurisdiction,
      sourceKey: KING_COUNTY_PLUMBING_SOURCE_KEY,
      title: "Plumbing and Gas Piping Program service fees, effective January 1, 2026",
      officialUrl:
        "https://cdn.kingcounty.gov/-/media/king-county/depts/dph/documents/health-safety/environmental-health/fees/plumbing-gas-piping-service-fees-through-2026.pdf",
      effectiveFrom: KING_COUNTY_FEE_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: SEATTLE_LAST_VERIFIED,
      notes:
        "Recorded as a schedule against Seattle because the City's own code makes it the plumbing schedule for Seattle addresses. Its effective date is its own heading, not an inference from the City's subtitle.",
    },
  ],

  feeRules: [
    ...SEATTLE_BUILDING_RULES.map((rule) => ({
      jurisdictionKey: SEATTLE_KEYS.jurisdiction,
      permitTypeKey: "building",
      scheduleKey: SEATTLE_SUBTITLE_SOURCE_KEY,
      rule,
    })),
    ...SEATTLE_ELECTRICAL_RULES.map((rule) => ({
      jurisdictionKey: SEATTLE_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      scheduleKey: SEATTLE_SUBTITLE_SOURCE_KEY,
      rule,
    })),
    ...KING_COUNTY_PLUMBING_RULES.map((rule) => ({
      jurisdictionKey: SEATTLE_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      scheduleKey: KING_COUNTY_PLUMBING_SOURCE_KEY,
      rule,
    })),
  ],

  requirements: [
    {
      jurisdictionKey: SEATTLE_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "document",
      title: "The fee is read off an index, not off a fee table",
      description:
        "Table D-1 for 22.900D.010 returns a Development Fee Index for the project valuation, in 26 bands from $325 for the first $1,000 of value to a rate of $4.50 per $1,000 at the top. Table D-2 then sets the permit fee at 100% of that index and the plan review fee at 100% of the same index, or 40% for a project processed as subject to field inspection. The practical consequence is that the index is the only published dollar figure: everything else is a percentage of it, and the index itself is never the fee.",
      isMandatory: true,
      sortOrder: 10,
      sourceKey: SEATTLE_SUBTITLE_SOURCE_KEY,
      lastVerifiedAt: SEATTLE_LAST_VERIFIED,
    },
    {
      jurisdictionKey: SEATTLE_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "other",
      title: "A 5% technology fee is charged on all of it",
      description:
        "SMC 22.900A.100: \"A technology fee will be applied in addition to all listed fees in Chapters 22.900B, 22.900C, 22.900D, 22.900E, 22.900F and 22.900H in the amount of five percent of all fees or charges required under the above chapters.\" It is charged on the permit fee and the plan review fee together, and on the building code council fee as well when that fee is added inside those chapters — but not on the state fee itself where the statute sits outside them.",
      isMandatory: true,
      sortOrder: 20,
      sourceKey: SEATTLE_SUBTITLE_SOURCE_KEY,
      lastVerifiedAt: SEATTLE_LAST_VERIFIED,
    },
    {
      jurisdictionKey: SEATTLE_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "other",
      title: "The state's building code council fee is $6.50 or $25.00",
      description:
        "RCW 19.27.085: \"a fee of six dollars and fifty cents on each residential building permit and a fee of twenty-five dollars for each commercial building permit\", plus \"two dollars for each residential unit, but not including the first unit\" on a building with more than one unit. The City collects it and remits it. A project that does not name an occupancy is priced as residential here, which is the common case for a single building permit.",
      isMandatory: true,
      sortOrder: 30,
      sourceKey: SEATTLE_BCC_SOURCE_KEY,
      lastVerifiedAt: SEATTLE_LAST_VERIFIED,
    },
    {
      jurisdictionKey: SEATTLE_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      requirementType: "other",
      title: "Which electrical table applies is not the applicant's choice",
      description:
        "Table D-15 applies where plans are not required and Table D-14 where they are reviewed, and the subtitle's own notes say D-14 applies when \"the base fee and SDCI hourly rate are used to calculate the fee\". The same job can therefore be priced two ways: a 200-ampere service is a flat $292.00 under D-15 and a function of valuation under D-14. The figures on this site are D-15's, and which table a project falls under is a departmental determination.",
      isMandatory: true,
      sortOrder: 10,
      sourceKey: SEATTLE_ELECTRICAL_SOURCE_KEY,
      lastVerifiedAt: SEATTLE_LAST_VERIFIED,
    },
    {
      jurisdictionKey: SEATTLE_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      requirementType: "other",
      title: "A $55.48 administrative fee is added to every item",
      description:
        "Table D-15, item 1a: \"An administrative fee of $55.48 will be charged in addition to the other fees specified in this table for all items except subsection 3.f\". That exception is the Seattle City Light safety inspection, which carries no administrative fee. There is also a $55.48 change fee where work is added to an issued permit.",
      isMandatory: true,
      sortOrder: 20,
      sourceKey: SEATTLE_ELECTRICAL_SOURCE_KEY,
      lastVerifiedAt: SEATTLE_LAST_VERIFIED,
    },
    {
      jurisdictionKey: SEATTLE_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      requirementType: "other",
      title: "The plumbing permit is issued by the county health department",
      description:
        "SMC 22.900G.030: \"Fees for plumbing, medical or dental gas, lab gas, and fuel gas piping shall be collected by the Director of King County Public Health in accordance with the fee schedule as set forth in Seattle Municipal Code Section 504.\" The schedule charges $137.00 plus $27.00 per fixture, and plan review at $273.00 per hour. Seattle does not publish a plumbing fee of its own.",
      isMandatory: true,
      sortOrder: 10,
      sourceKey: KING_COUNTY_PLUMBING_SOURCE_KEY,
      lastVerifiedAt: SEATTLE_LAST_VERIFIED,
    },
  ],

  profile: {
    jurisdictionKey: SEATTLE_KEYS.jurisdiction,
    headline: "What construction permits cost in Seattle",
    summary:
      "Seattle does not publish a table of permit fees. It publishes a table of **index values** and then a table of percentages of that index: a $2,000,000 building pays $14,984.00 for its permit and the same $14,984.00 again for plan review, plus a 5% technology fee and the state's $25.00 building code council fee — $31,491.40 in all. Electrical work is priced per service size and per circuit, and plumbing permits are not Seattle's at all: the county health department issues them.",
    localContext:
      "Seattle's schedule is the first in this dataset that separates the *index* from the *fee*, and that separation is the whole mechanism. Table D-1 returns a Development Fee Index — 26 bands, from $325 for the first $1,000 of value to $4.50 per $1,000 at the top — and Table D-2 then says what a permit and a plan review are as percentages of it. A building permit is 100% of the index and its plan review is **another** 100%, so a project pays the index twice; a project processed as subject to field inspection pays 100% for the permit and 40% for the review. Because the fee is a reading of one number, the permit fee and the review fee can never disagree about which band a valuation fell in, and a second review mode is a percentage change rather than a second table.\n\nThe index is also **exact across its bands**. The band opening at $1,500,001 starts at $11,734.00, which is what the band below produces at $1,500,000, and the band opening at $2,000,001 starts at $14,984.00, which is what *its* band below produces at $2,000,000. A $2,000,000 project therefore costs the same whether it is read as the top of one band or the bottom of the next, and those handovers are asserted in this site's tests.\n\nTwo charges sit on top and neither is a Seattle invention. The **technology fee** is 5% of \"all fees or charges required\" under the fee chapters — the first surcharge in this dataset that is a percentage of the whole bill rather than of one component, which is why the engine gained a `fee_subtotal` basis to express it. And the **state building code council fee** is $6.50 on a residential building permit and $25.00 on a commercial one, plus $2.00 for each residential unit after the first, set by RCW 19.27.085 rather than by any City ordinance.\n\nElectrical work stands on its own two tables. Table D-15 prices work where plans are not required, by service size ($146.00 up to 125 amperes, $292.00 at 150 to 200, $365.00 at 225 to 350, and \"Plan Review Only\" above that), by branch circuit or feeder ($26.28 at up to 25 amperes, $43.80 at 30 to 50, $146.00 at 60 to 200, $292.00 at 225 to 350), and by control unit ($17.52 plus $2.92 per device). Table D-14 prices the same work by valuation where plans are reviewed. A **$55.48 administrative fee is added to every item** except a City Light safety inspection, and there is a **$105.12 minimum** on a standard self-issued online permit — which matters, because one 20-ampere circuit at $26.28 plus the administrative fee is $85.85, below the minimum.\n\nThe plumbing permit is the one Seattle does not price. SMC 22.900G.030 sends plumbing, medical gas and fuel gas piping fees to the Director of King County Public Health, and that program's schedule — the same document that prices plumbing in unincorporated King County — charges $137.00 plus $27.00 per fixture. It is the only case in this dataset where a jurisdiction's own code names another body as the authority for one of its permits, and it means the two Washington jurisdictions on this site share a plumbing schedule while their building fees are set 20 miles apart by different governments.",
    valuationBasis:
      "Seattle takes a **total valuation of the work** and reads it against Table D-1 for the Development Fee Index. The subtitle does not require the applicant's figure to be accepted as given; where a project's value is in question the department determines it, and the base fee and SDCI hourly rate exist for work that is charged by time instead.\n\nThe pages here compute from the valuation you enter and never substitute a rate for it. What they cannot tell you is whether the department would accept that figure for a given project, because the subtitle prices the consequence of a disagreement — a plan re-submittal, an hourly review charge — rather than the valuation itself.\n\nThe electrical permit often does not involve a valuation at all: Table D-15 charges by amperage, by circuit and by device, and the rows on this site's electrical page are those.",
    notIncluded:
      "These figures are what Seattle's own 2026 Fee Subtitle publishes, computed by this site's engine. They are not a total project cost. In particular they exclude:\n\n- **Every hourly charge**, including additional plan review beyond what a permit includes, at the SDCI base fee and hourly rate of $292.00 each.\n- **The $105.12 minimum on a standard self-issued online permit**, which is a floor on a channel rather than a component, and therefore is not added by the engine.\n- **Land use, design review, environmental and shoreline review fees**, which are Chapters 22.900B and 22.900C rather than the building chapter, and which run from a $5,510 minimum for administrative design review to $11,020 for full design review.\n- **Equipment permits priced on their own tables**: elevators under Table D-13, refrigeration under D-10, boilers under D-12, and fire and hazardous materials permits, which are not building, electrical or plumbing permits.\n- **Tenant alteration charges** of so much per 100 square feet, blanket permits, and the phased-permit charges where work is divided across permits.\n- **Electrical work priced under Table D-14** where plans are reviewed, which is a valuation-based schedule and not the one modelled here, and **the rows of Table D-15 not modelled**: the $146.00 specialty permits (service repair, temporary construction power, underground work, City Light safety inspection), Ufer tests at $292.00, the per-kilowatt heater rows, transformer rows at $20.44 to $219.00, car charger rows from $26.28 to $146.00 and \"Plan Review Only\" above them, and the $55.48 change fee.\n- **Plumbing, medical gas, lab gas and fuel gas piping**, which are priced by Public Health — Seattle & King County at $137.00 plus $27.00 per fixture, with plan review at $273.00 per hour.\n- **Water, drainage and solid waste utility charges**, which are utility accounts rather than permit fees, and Seattle City Light's service connection charges for actual supply work.\n- **Anything charged by another authority for the same project**: a site outside the city limits is not a Seattle permit, and a site in Tacoma or in Tacoma Power's service area is not the state's electrical territory either.",
    seoTitle: "Seattle permit fees: building index, electrical and plumbing",
    seoDescription:
      "How Seattle prices permits — a Development Fee Index charged twice for permit and plan review, a 5% technology fee, the $6.50 or $25.00 state fee, and plumbing issued by King County.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: SEATTLE_LAST_VERIFIED,
  },

  permitPages: [
    {
      jurisdictionKey: SEATTLE_KEYS.jurisdiction,
      permitTypeKey: "building",
      slug: "building-permit-cost",
      title: "Seattle building permit cost",
      intro:
        "A Seattle building permit is priced in two steps. Table D-1 of the fee subtitle returns a **Development Fee Index** for the valuation, and Table D-2 then sets the permit fee at 100% of that index and the plan review fee at 100% of the same index — so a $2,000,000 building pays $14,984.00 twice. The 5% technology fee is charged on both, and the state's building code council fee adds $25.00 on a commercial permit or $6.50 on a residential one: $31,491.40 in total.",
      localSummary:
        "The mechanism is what makes Seattle different from every other jurisdiction here: **there is no fee table**. There is an index table, and then a table of percentages of it. Table D-1 returns a Development Fee Index — 26 bands, from \"$325 for the first $1,000 of value or fraction thereof\" to a rate that eases to $4.50 per $1,000 at the top — and Table D-2 says a building permit is 100% of that index, a plan review is 100% of the same index, and a project processed as subject to field inspection pays 100% for the permit and **40%** for the review. A project therefore pays the index twice, and the two charges can never disagree about which band the valuation fell in, because they are the same number.\n\nThe index is exact across its bands, and the handovers are worth checking because a split fee doubles the cost of any error in them. The band opening at $1,500,001 starts at $11,734.00, which is exactly what the band below produces at $1,500,000; the band opening at $2,000,001 starts at $14,984.00, which is exactly what its own band below produces at $2,000,000. A $2,000,000 project lands on the same index either way, and this site asserts those handovers in its tests rather than trusting them.\n\nTwo charges sit on top of the index. The **technology fee** is the more interesting one: SMC 22.900A.100 imposes five percent of \"all fees or charges required\" under the fee chapters, so it is charged on the permit fee and the review fee together rather than on either alone. It is the first surcharge in this dataset that reads the whole bill rather than one component, and it is why the calculation engine carries a fee-subtotal basis. The second is the **state building code council fee** under RCW 19.27.085: $6.50 on a residential building permit, $25.00 on a commercial one, and $2.00 for each residential unit after the first. Seattle collects it and remits it, and it is a statute rather than an ordinance — the City could not change it if it wanted to.\n\nWhat the valuation is matters as much as the rates. The fee is read against the **total value of the work**, and where a project's value is disputed the department determines it; the subtitle also prices the consequence of a disagreement, which is a plan re-submittal charged as additional review at the base fee and hourly rate of $292.00 each.\n\nFinally, a project processed as **subject to field inspection** pays 40% of the index for review instead of 100% — the same job for a little more than two-thirds of the fee. That is a real discount published in the table, and it is a decision about how the project is processed rather than about what is built.",
      notIncluded:
        "This estimate is Table D-1's Development Fee Index for the valuation, charged once as the permit fee and once as the plan review fee, plus the 5% technology fee and the state building code council fee. It excludes:\n\n- **Land use, design review, environmental and shoreline fees**, which are set elsewhere in the subtitle: administrative design review, master planned community design review and streamlined design review carry a $5,510 minimum, full design review $11,020, and land use review is otherwise charged at an hourly rate against a minimum that covers a set number of review hours.\n- **All hourly work**: additional plan review beyond what a permit includes, and every other charge calculated at the SDCI base fee and hourly rate, each of which is $292.00.\n- **Equipment permits priced on their own tables** — elevators under Table D-13, refrigeration under D-10, boilers under D-12 — and fire, hazardous materials and tenant improvement permits that are not building, electrical or plumbing permits.\n- **The tenant alteration rows**, which are charged per 100 square feet, and blanket permits, which are charged a minimum share of the index.\n- **Phased permits**, where a project is divided into separate applications: the subtitle charges an additional one times the base fee for each resulting application.\n- **The mechanical share of the project**, which is inside the building index where it is part of one permit and 100% of its own index where it is filed separately.\n- **Plumbing and gas piping**, priced by Public Health — Seattle & King County rather than by the City.\n- **Utility and connection charges** from Seattle Public Utilities and Seattle City Light, which are utility accounts rather than permit fees.\n- **The cost of the work itself, and any tax on it.** No sales or use tax line appears in this subtitle and none is added here.",
      workedExample: {
        scenario:
          "A new commercial building in Seattle with a construction valuation of $2,000,000, permitted with plans rather than processed as subject to field inspection.",
        inputs: {
          valuationCents: 200_000_000,
          custom: { building_class: "commercial" },
        },
        notes:
          "The valuation falls at the top of the fourth band ($1,500,001 to $2,000,000), whose published figure is $11,734.00 for the first $1,500,000 plus $6.50 for each additional $1,000: 500 more thousands is $3,250.00, so the index is $14,984.00. That is the same figure the next band opens with, which is why $2,000,000 is a clean place to demonstrate the mechanism. The permit fee is 100% of the index, $14,984.00, and plan review is another 100% of the same index, $14,984.00. The technology fee is 5% of those two together, $1,498.40. The state building code council fee is $25.00 on a commercial permit. Total: $31,491.40. Processed as subject to field inspection, the review fee would be 40% of the index instead — $5,993.60 — and the same building would come to $22,051.48.",
      },
      faqs: [
        {
          question: "How much is a building permit in Seattle?",
          answer:
            "It is an index charged twice. Table D-1 returns a Development Fee Index for the valuation — $325 at the bottom, $2,984.00 at $250,000, $11,734.00 at $1,500,000, $14,984.00 at $2,000,000 — and the permit fee is 100% of that index and the plan review fee another 100%. Add the 5% technology fee on both and the state's building code council fee: $6.50 residential, $25.00 commercial. A $2,000,000 commercial building comes to $31,491.40.",
        },
        {
          question: "Why is the permit fee charged twice?",
          answer:
            "Because the fee is defined as a percentage of an index rather than as a table of fees: \"a building permit fee is 100% of the Development Fee Index\" and the plan review fee is 100% of the same index. Both are charged. A project processed as subject to field inspection pays 100% for the permit and 40% for the review, which is the only published variation.",
        },
        {
          question: "What is the technology fee?",
          answer:
            "5% of all fees charged under the fee chapters, imposed by SMC 22.900A.100: \"a technology fee will be applied in addition to all listed fees... in the amount of five percent of all fees or charges required under the above chapters.\" It applies to the permit fee and the plan review fee together, so on a $2,000,000 project it is $1,498.40 — the largest line after the two index charges.",
        },
        {
          question: "Is there a state fee on a Seattle permit?",
          answer:
            "Yes. RCW 19.27.085 imposes $6.50 on each residential building permit and $25.00 on each commercial one, plus $2.00 for each residential unit after the first. The City collects it and remits it to the state, and it is set by statute rather than by ordinance. It is also the reason two identical buildings can differ by $18.50: one is classed residential and one commercial.",
        },
        {
          question: "Do the index bands agree with each other?",
          answer:
            "Yes, at every handover that has been checked. The band opening at $1,500,001 starts at $11,734.00 and the band below produces exactly that at $1,500,000; the band opening at $2,000,001 starts at $14,984.00 and its band below produces exactly that at $2,000,000. Because the fee is that index charged twice, an error at a seam would be paid twice, which is why this site checks them.",
        },
        {
          question: "What does Seattle not include in the permit fee?",
          answer:
            "Land use, design review, environmental and shoreline fees; all hourly charges at the $292.00 base and hourly rate; elevator, refrigeration and boiler permits on their own tables; tenant alteration charges per 100 square feet; phased-permit charges of one times the base fee per additional application; and the plumbing permit, which the county health department issues. Utility connection charges are separate accounts entirely.",
        },
      ],
      seoTitle: "Seattle building permit cost: the Development Fee Index",
      seoDescription:
        "Seattle building permit fees explained from the 2026 Fee Subtitle — a Development Fee Index charged for the permit and again for plan review, the 5% technology fee and the state fee, with a $2,000,000 example.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: SEATTLE_LAST_VERIFIED,
    },
    {
      jurisdictionKey: SEATTLE_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      slug: "electrical-permit-cost",
      title: "Seattle electrical permit cost",
      intro:
        "Seattle prices electrical work from Table D-15 when plans are not required: by service size — $146.00 up to 125 amperes, $292.00 at 150 to 200, $365.00 at 225 to 350 — by branch circuit or feeder at $26.28 to $292.00 each, and by control unit at $17.52 plus $2.92 per device. A **$55.48 administrative fee** is added to every item except a City Light safety inspection, the 5% technology fee follows everything, and a standard self-issued online permit has a **$105.12 minimum**.",
      localSummary:
        "Table D-15 is a schedule of *items* rather than of valuations, and the items overlap, which is the first thing to understand about it. A 200-ampere electrical service is $292.00 under item 6; a 200-ampere feeder installed as a branch-circuit job is $146.00 under item 7. The same amperage, two rows, two prices — which is why the rules here are keyed on the kind of work as well as on the size of it, and why no figure on this page can be read from an amperage alone.\n\nOn top of the item sits a **$55.48 administrative fee**, charged \"in addition to the other fees specified in this table for all items except subsection 3.f\". That exception is the Seattle City Light safety inspection at $146.00, the only item in the table that escapes the administrative charge. There is also a $55.48 change fee where work is added to an issued permit.\n\nThen there is the **$105.12 minimum** on \"a standard Online Trade-Construction (OTC) self-issued electrical permit\", and it is not a formality. One 20-ampere branch circuit is $26.28, the administrative fee is $55.48, and 5% of the two is $4.09 — $85.85, which is $19.27 short of the minimum, so $105.12 is what a permit bought that way costs. The same arithmetic makes the second and third circuit nearly free at the bottom of the range and expensive above it: six 20-ampere circuits come to $223.82, because six times $26.28 is $157.68 and the administrative fee and technology fee are charged once.\n\nAbove the ordinary rows sit ones worth knowing about even when they are not what you are building. Service repair of a mast and meter base only is $146.00. Temporary construction power is $146.00 for services under 400 amperes, with the Ufer included if inspected at the same time. An underground-work-only inspection is $146.00. A Ufer test, where the Ufer was covered before inspection, is $292.00. Heaters are $8.76 to $146.00 by kilowatt, transformers $20.44 to $219.00 by kVA, and car chargers $26.28 to $146.00 by level and amperage.\n\nWhat is not here is the other electrical table. **Table D-14 prices electrical work by valuation** where plans are reviewed, and the subtitle's own note says it applies when \"the base fee and SDCI hourly rate are used to calculate the fee\". A 200-ampere service is a flat $292.00 under D-15 and a percentage of a valuation under D-14, and which one applies to your project is a determination the department makes rather than a choice the fee schedule offers.",
      notIncluded:
        "This estimate is Table D-15's item fee, the $55.48 administrative fee and the 5% technology fee. It excludes:\n\n- **The $105.12 minimum** on a standard self-issued online permit, which is a floor on a permit purchased that way rather than a component, and therefore is not added by the engine. Where the items come to less than that, the minimum is what is charged.\n- **Table D-14 in its entirety**: electrical permits where plans are reviewed are priced by valuation and by base fee and hourly rate rather than by these items, and the choice between the two tables is the department's.\n- **The rows of Table D-15 not modelled**: the $146.00 specialty permits (service repair, temporary construction power, underground work only, City Light safety inspection), the Ufer test at $292.00, heaters at $8.76 to $146.00 by kilowatt, transformers at $20.44 to $219.00 by kVA, car chargers at $26.28 to $146.00 by level and amperage, and the $55.48 change fee for adding work to an issued permit.\n- **Anything above 350 amperes on the service row or the branch-circuit row**, where the table says \"Plan Review Only\" and no flat fee is published.\n- **The maximum fee on communications systems**, which the table caps at $636.56 and which is stated here rather than modelled, because it applies to one of the two systems that row covers.\n- **Temporary electrical installations**, which the subtitle charges for services only at the same Table D-15 rates, and electrical work under a phased permit, where each initial permit is priced on its own estimated value.\n- **Permit renewals and reestablishment**, charged at one quarter of the SDCI base fee if renewed within the window and one half beyond it.\n- **Contractor licensing and registration**, which the state requires and which is separate from any permit fee.",
      workedExample: {
        scenario:
          "A 200-ampere service upgrade at a house in Seattle, permitted without plans under Table D-15.",
        inputs: {
          custom: { electrical_item: "service", service_amps: 200 },
        },
        notes:
          "Table D-15, item 6 puts a new or altered service of 150 to 200 amperes at $292.00, and item 1a adds the $55.48 administrative fee to every item except the City Light safety inspection. The technology fee is 5% of those two together, $17.37, giving $364.85. The same work under Table D-14, where plans are reviewed, would be a function of valuation rather than this flat figure. And the table's own minimum is worth comparing: a single 20-ampere branch circuit under item 7 is $26.28 plus the $55.48 administrative fee plus $4.09 of technology fee — $85.85 — which is below the $105.12 minimum for a standard self-issued online permit, so that permit costs $105.12.",
      },
      faqs: [
        {
          question: "How much is an electrical permit in Seattle?",
          answer:
            "It depends on the item. A new or altered service is $146.00 up to 125 amperes, $292.00 at 150 to 200 and $365.00 at 225 to 350. A branch circuit or feeder is $26.28 up to 25 amperes, $43.80 at 30 to 50, $146.00 at 60 to 200 and $292.00 at 225 to 350, each. A low-voltage or communications system is $17.52 per control unit plus $2.92 per device. Every item except a City Light safety inspection adds a $55.48 administrative fee, and 5% is added on top.",
        },
        {
          question: "Is there a minimum electrical permit fee?",
          answer:
            "Yes, $105.12 on a standard Online Trade-Construction self-issued electrical permit, and it bites more often than people expect. One 20-ampere circuit is $26.28 plus the $55.48 administrative fee plus $4.09 of technology fee — $85.85 — so the minimum is what that permit costs. Six circuits on the same permit come to $223.82, above the floor.",
        },
        {
          question: "What is the $55.48 administrative fee?",
          answer:
            "Table D-15 item 1a: \"An administrative fee of $55.48 will be charged in addition to the other fees specified in this table for all items except subsection 3.f\". Subsection 3.f is a Seattle City Light safety inspection at $146.00, the only item exempt from it. There is also a $55.48 change fee if work is added to an issued permit.",
        },
        {
          question: "Which table applies to my electrical work?",
          answer:
            "Table D-15 when plans are not required, Table D-14 when they are reviewed. The same job can be priced differently under each — a 200-ampere service is a flat $292.00 under D-15 and a function of valuation under D-14 — and the subtitle's notes treat the choice as a determination rather than an applicant's option. The figures on this page are D-15's.",
        },
        {
          question: "How much is a car charger permit?",
          answer:
            "Table D-15 prices them by level: a Level 1 charger at 120 volts is $26.28 each; a Level 2 charger is $26.28 at 15 to 25 amperes, $52.56 at 30 to 50 and $108.04 at 60 to 225; a Level 3 DC charger is $73.00 at 15 to 50 amperes and $146.00 at 60 to 125. Above 250 amperes on a Level 2 charger the table says \"Plan Review Only\". The $55.48 administrative fee and 5% technology fee apply on top.",
        },
        {
          question: "Does Seattle price electrical work by valuation?",
          answer:
            "Only where plans are reviewed, under Table D-14, which runs from $260 for the first $1,000 of value with rates of $6 to $1.50 per additional $100 and $8 to $4.50 per additional $1,000 as the value rises. Table D-15, which this page models, charges per item instead. Both are in the same subtitle, and which one applies follows from how the project is processed.",
        },
      ],
      seoTitle: "Seattle electrical permit cost: Table D-15 fees",
      seoDescription:
        "Seattle electrical permits from Table D-15 — $292 for a 200-amp service, $26.28 to $292 per branch circuit, $17.52 per low-voltage control unit, a $55.48 administrative fee and the $105.12 minimum.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: SEATTLE_LAST_VERIFIED,
    },
    {
      jurisdictionKey: SEATTLE_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      slug: "plumbing-permit-cost",
      title: "Seattle plumbing permit cost",
      intro:
        "Seattle does not issue plumbing permits. Its own fee subtitle sends them to **Public Health — Seattle & King County**, whose schedule charges $137.00 for a plumbing or backflow permit plus $27.00 for each fixture — $245.00 for four fixtures — with plan review at $273.00 per hour, a $137.00 re-inspection and a $41.00 administrative fee. A gas piping permit uses the same base plus $27.00 per outlet.",
      localSummary:
        "This is the only permit in this dataset whose authority is named by the jurisdiction that does **not** charge it. SMC 22.900G.030, inside Seattle's own fee subtitle, says: \"Fees for plumbing, medical or dental gas, lab gas, and fuel gas piping shall be collected by the Director of King County Public Health in accordance with the fee schedule as set forth in Seattle Municipal Code Section 504.\" The City therefore publishes no plumbing fee of its own — and a reader who looks for one in the subtitle finds the instruction instead.\n\nThe schedule that instruction points to is short. A plumbing or backflow permit is $137.00 plus $27.00 per fixture. A gas piping or medical gas permit is the same $137.00 plus $27.00 per **outlet**. Plan review is $273.00 per hour, for either. A re-inspection is $137.00. An Already Built Construction permit, for work done without one, is $273.00 plus $55.00 per fixture or outlet, with fees already paid deducted from it. An inspection outside regular hours is $410.00 per hour, a requested site visit where no permit exists is $273.00, a permit renewal is $68.00 and an administrative fee for a modification, a correction or refund processing is $41.00.\n\nThe reading that matters most is the first one: **the $137.00 is a base charge, not a first fixture**. One fixture costs $164.00 rather than $137.00, because the row states the base without attaching an allowance to it. That single decision changes the price of every small permit, and it is the answer to the question people actually ask, which is what a water heater or a single fixture costs.\n\nThere is one more thing worth knowing, and it is why this page exists at all in a city whose own subtitle prices everything else. Because the plumbing authority is the county's, **the same schedule prices plumbing permits in unincorporated King County**, so Seattle and the unincorporated county share a plumbing fee while their building permits are priced by completely different governments — the City's index on one side, the county's two valuation tables on the other. A plumber working across the line pays the same plumbing permit either way and a very different building permit.",
      notIncluded:
        "This estimate is the Plumbing and Gas Piping Program's permit fee for the fixtures or outlets entered. It excludes:\n\n- **Plan review**, which this program charges at $273.00 per hour rather than as a percentage of the permit, for both plumbing/backflow and gas piping.\n- **The $137.00 re-inspection**, the $68.00 permit renewal, the $41.00 administrative fee, the $273.00 site visit where no permit exists, and $410.00 per hour for an inspection outside regular hours.\n- **The re-pipe supplemental fee**, which the schedule calculates from the number of anticipated inspections times the program's hourly operating rate, using a worksheet it publishes.\n- **Gas piping priced per outlet**, which is the same base with $27.00 per outlet rather than per fixture, and medical or lab gas, which is priced on the same rows.\n- **The Already Built Construction premium** unless it is selected: $273.00 plus $55.00 per fixture or outlet, less any permit fees already paid.\n- **Everything Seattle itself charges for the same project** — the building permit and its Development Fee Index, the plan review fee, the 5% technology fee and the state building code council fee — which are separate permits and separate authorities.\n- **Side sewer and drainage connection charges**, which Seattle Public Utilities bills on its own accounts, and on-site septic work, which the same health department reviews under a different program.\n- **The cost of the fixtures and their installation**, which is the work rather than the permit.",
      workedExample: {
        scenario:
          "A bathroom remodel in Seattle replacing four plumbing fixtures, filed as one plumbing permit with the county health department.",
        inputs: {
          fixtures: 4,
        },
        notes:
          "Four fixtures at $27.00 is $108.00, and the permit's $137.00 base is added to it rather than covering the first fixture: $245.00. A single-fixture permit is $164.00, not $137.00. Nothing Seattle charges is added, because the City does not issue this permit — the building permit, its plan review fee, the 5% technology fee and the state fee are separate charges from a different authority. A gas piping permit for the same job would be $137.00 plus $27.00 for each outlet.",
      },
      faqs: [
        {
          question: "Who issues a plumbing permit in Seattle?",
          answer:
            "Public Health — Seattle & King County, not the City. Seattle's own fee subtitle says so at SMC 22.900G.030: \"Fees for plumbing, medical or dental gas, lab gas, and fuel gas piping shall be collected by the Director of King County Public Health in accordance with the fee schedule as set forth in Seattle Municipal Code Section 504.\" The City publishes no plumbing fee of its own.",
        },
        {
          question: "How much is a plumbing permit in Seattle?",
          answer:
            "$137.00 plus $27.00 per fixture, so four fixtures is $245.00 and one fixture is $164.00. The $137.00 is a base charge rather than a first fixture, which is why a single-fixture permit is not $137.00. Plan review is charged separately at $273.00 per hour.",
        },
        {
          question: "How much is a water heater permit?",
          answer:
            "A replaced water heater is a fixture on the same schedule: $137.00 plus $27.00 for it, which is $164.00 if it is the only fixture on the permit. There is no separate flat water heater row in this program's schedule, so the per-fixture arithmetic is the published price rather than an estimate.",
        },
        {
          question: "What is the difference between a fixture and an outlet?",
          answer:
            "Both are charged at $27.00, on different permits. A plumbing or backflow permit is $137.00 plus $27.00 per fixture; a gas piping or medical gas permit is $137.00 plus $27.00 per outlet. The base is the same, and the two are separate permits rather than two rows on one.",
        },
        {
          question: "What if the work was done without a permit?",
          answer:
            "The Already Built Construction permit applies: $273.00 plus $55.00 per fixture or outlet for work \"done without having paid any permit fees\", with the schedule's own note that fees already paid are subtracted from the total. Four fixtures would be $493.00 before any such deduction.",
        },
        {
          question: "Is this the same fee as in unincorporated King County?",
          answer:
            "Yes — the same schedule, because the same program prices both. A plumber working in Seattle and in unincorporated King County pays the same plumbing permit fee on either side of the line, while the building permit for the same job comes from the City's index in one case and the county's valuation tables in the other.",
        },
      ],
      seoTitle: "Seattle plumbing permit cost: King County Public Health fees",
      seoDescription:
        "Seattle plumbing permits come from Public Health — Seattle & King County, not the City: $137.00 plus $27.00 per fixture, $273.00 per hour for plan review and $137.00 for a re-inspection.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: SEATTLE_LAST_VERIFIED,
    },
  ],

  verifications: [
    {
      entityType: "source",
      entityKey: SEATTLE_SUBTITLE_SOURCE_KEY,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: SEATTLE_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: SEATTLE_SUBTITLE_SOURCE_KEY,
      notes:
        "Read 2026-09-24 in three pdftotext modes from the SDCI document library. The index table and the D-2 percentages are identical across the modes. Table D-1's handovers were then recomputed from the printed bases and rates: $11,734.00 is what the band ending at $1,500,000 produces at its top and $14,984.00 is what the band ending at $2,000,000 produces at its top, which is why a $2,000,000 project sits on the same index from either side. Both are asserted in tests/content/seattle-seed.test.ts.",
    },
    {
      entityType: "source",
      entityKey: SEATTLE_ELECTRICAL_SOURCE_KEY,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: SEATTLE_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: SEATTLE_ELECTRICAL_SOURCE_KEY,
      notes:
        "Table D-15 read in three modes on 2026-09-24, item by item. Every figure on the electrical page comes from it: the service rows ($146.00, $292.00, $365.00), the branch-circuit rows ($26.28, $43.80, $146.00, $292.00), the control-unit and device rates ($17.52 and $2.92), the administrative fee ($55.48) and its exception, the $105.12 minimum, and the specialty rows at $146.00. The same reading was used to establish what is *not* modelled — Table D-14's valuation rows, the heater, transformer and car charger tables, and \u201cPlan Review Only\u201d above 350 amperes.",
    },
    {
      entityType: "source",
      entityKey: SEATTLE_BCC_SOURCE_KEY,
      status: "verified",
      method: "official_portal_check",
      verifiedAt: SEATTLE_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: SEATTLE_BCC_SOURCE_KEY,
      notes:
        "RCW 19.27.085 read 2026-09-24 from the Legislature's citation page. The two rates and the additional-unit charge are quoted rather than paraphrased on the pages, because the split by occupancy is the whole point of the rule: $6.50 residential, $25.00 commercial, $2.00 per unit after the first on a building with more than one unit.",
    },
    {
      entityType: "source",
      entityKey: KING_COUNTY_PLUMBING_SOURCE_KEY,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: SEATTLE_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: KING_COUNTY_PLUMBING_SOURCE_KEY,
      notes:
        "The county's plumbing schedule, read in three modes. It is recorded against Seattle as well as against King County because SMC 22.900G.030 makes it Seattle's plumbing schedule; the two jurisdictions' plumbing rules are literally the same records rather than two transcriptions, so the figures cannot drift apart.",
    },
    {
      entityType: "fee_rule",
      entityKey: "PLAN-REVIEW-100",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: SEATTLE_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: SEATTLE_SUBTITLE_SOURCE_KEY,
      notes:
        "Table D-2's building permit and plan review rows: the permit fee is 100% of the Development Fee Index and the plan review fee is 100% of the same index, with subject-to-field-inspection review at 40%. Modelled on the `permit_fee` basis so both are readings of the same computed index rather than two table lookups that could disagree. The tests assert that a $2,000,000 valuation produces two equal components of $14,984.00.",
    },
    {
      entityType: "fee_rule",
      entityKey: "TECHNOLOGY-FEE-5",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: SEATTLE_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: SEATTLE_SUBTITLE_SOURCE_KEY,
      notes:
        "SMC 22.900A.100: five percent of \"all fees or charges required\" under Chapters 22.900B, C, D, E, F and H. This is why the engine gained a `fee_subtotal` basis — a percentage of each component separately is not a percentage of the total, and on a $2,000,000 project the difference is visible in the third decimal. Read on `fee_subtotal`, so it captures the index and the review together, and asserted in tests/calc/fee-subtotal.test.ts.",
    },
    {
      entityType: "fee_rule",
      entityKey: "BCC-FEE-RESIDENTIAL",
      permitTypeKey: "building",
      status: "verified",
      method: "official_portal_check",
      verifiedAt: SEATTLE_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: SEATTLE_BCC_SOURCE_KEY,
      notes:
        "RCW 19.27.085(3): \"a fee of six dollars and fifty cents on each residential building permit and a fee of twenty-five dollars for each commercial building permit\". Charged when `custom.building_class` is absent or residential, with the $25.00 rule for an explicit commercial class; the same fact convention is used in the King County payload, where the county's two fee guides print the same two amounts.",
    },
    {
      entityType: "fee_rule",
      entityKey: "ELEC-BRANCH-CIRCUIT-1",
      permitTypeKey: "electrical",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: SEATTLE_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: SEATTLE_ELECTRICAL_SOURCE_KEY,
      notes:
        "Table D-15 item 7: a branch circuit or feeder, \"new or altered\", is $26.28 at up to 25 amperes, $43.80 at 30 to 50, $146.00 at 60 to 200 and $292.00 at 225 to 350, each. Modelled per circuit and banded by the circuit's own amperage, which is why the rules are gated on `custom.electrical_item`: a 200-ampere branch-circuit job at $146.00 and a 200-ampere service at $292.00 are different rows of the same table. The tests assert both, and assert that one 20-ampere circuit comes to $85.85 before the $105.12 minimum.",
    },
    {
      entityType: "fee_rule",
      entityKey: "ELEC-ADMIN-FEE",
      permitTypeKey: "electrical",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: SEATTLE_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: SEATTLE_ELECTRICAL_SOURCE_KEY,
      notes:
        "Table D-15 item 1a: \"An administrative fee of $55.48 will be charged in addition to the other fees specified in this table for all items except subsection 3.f of this Table D-15\". 3.f is the Seattle City Light safety inspection at $146.00, so the rule is written for the items that carry the fee rather than for every permit — a permit made only of the City Light item pays none.",
    },
    {
      entityType: "fee_rule",
      entityKey: "PLUMBING-PER-FIXTURE",
      permitTypeKey: "plumbing",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: SEATTLE_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: KING_COUNTY_PLUMBING_SOURCE_KEY,
      notes:
        "The same record King County's page uses, because SMC 22.900G.030 makes the county health department the plumbing authority inside the City. The record is imported rather than restated: two transcriptions of one schedule is exactly how a pair of pages ends up disagreeing about a fee.",
    },
    {
      entityType: "jurisdiction_profile",
      entityKey: SEATTLE_KEYS.jurisdiction,
      status: "verified",
      method: "manual_review",
      verifiedAt: SEATTLE_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: SEATTLE_SUBTITLE_SOURCE_KEY,
      notes:
        "The profile's claims are each traceable: the index mechanism to Tables D-1 and D-2, the technology fee to SMC 22.900A.100, the state fee to RCW 19.27.085, and the plumbing authority to SMC 22.900G.030. The headline figure on the building page is computed by the engine and asserted in the tests rather than written into the profile.",
    },
    {
      entityType: "permit_page",
      entityKey: "building-permit-cost",
      permitTypeKey: "building",
      status: "verified",
      method: "manual_review",
      verifiedAt: SEATTLE_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: SEATTLE_SUBTITLE_SOURCE_KEY,
      notes:
        "The worked example was computed by the engine before the prose was written: $14,984.00 of index, $14,984.00 of plan review, $1,498.40 of technology fee and $25.00 of state fee, $31,491.40 in all. The test recomputes the same inputs and asserts each component and the total, and a second case asserts the 40% subject-to-field-inspection variant.",
    },
    {
      entityType: "permit_page",
      entityKey: "electrical-permit-cost",
      permitTypeKey: "electrical",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: SEATTLE_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: SEATTLE_ELECTRICAL_SOURCE_KEY,
      notes:
        "Every figure on the page is a row of Table D-15, checked item by item against the subtitle. The page states two things that are readings rather than printed sentences — that the overlapping rows mean an amperage alone cannot choose a fee, and that Table D-14 rather than D-15 may apply — and both are attributed to the document's own notes rather than presented as settled.",
    },
    {
      entityType: "permit_page",
      entityKey: "plumbing-permit-cost",
      permitTypeKey: "plumbing",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: SEATTLE_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: KING_COUNTY_PLUMBING_SOURCE_KEY,
      notes:
        "The page's central claim — that this permit is not Seattle's — is sourced to Seattle's own code (SMC 22.900G.030) rather than to the county schedule, because it is the City that assigns the authority. The worked example (four fixtures, $245.00) is computed by the engine and asserted in the tests.",
    },
  ],
};

/**
 * The pages this jurisdiction publishes: three, derived from the payload rather than
 * written out again.
 */
export const SEATTLE_PUBLISHED_PERMIT_PAGES = seattleSeed.permitPages.filter(
  (page) => page.publishStatus === "published" && !page.noindex,
);
