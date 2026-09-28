import type { JurisdictionSeed } from "@/content/seed-types";
import {
  COL_APP_SOURCE_KEY,
  COL_BUILDING_RULES,
  COL_COMM_SOURCE_KEY,
  COL_ELECTRICAL_RULES,
  COL_FEE_EFFECTIVE_FROM,
  COL_PLUMBING_RULES,
  COL_RES_SOURCE_KEY,
} from "@/content/columbia/fee-rules";

export const COL_LAST_VERIFIED = "2026-09-26";

export const COL_KEYS = {
  state: "sc",
  county: "richland-county",
  jurisdiction: "columbia",
  residential: COL_RES_SOURCE_KEY,
  commercial: COL_COMM_SOURCE_KEY,
  application: COL_APP_SOURCE_KEY,
} as const;

const state = {
  code: "SC",
  slug: "south-carolina",
  name: "South Carolina",
  fipsCode: "45",
};

const county = {
  key: COL_KEYS.county,
  slug: "richland-county",
  name: "Richland County",
  fipsCode: "45079",
};

const RES_FEES_URL =
  "https://planninganddevelopment.columbiasc.gov/wp-content/uploads/2021/01/residential_fees.pdf";
const COMM_FEES_URL =
  "https://planninganddevelopment.columbiasc.gov/wp-content/uploads/2021/01/commercial_fees_revised2014_07_01.pdf";
const APP_URL =
  "https://planninganddevelopment.columbiasc.gov/wp-content/uploads/2024/02/dc_commercial_apprev.2.8.24.pdf";
const ELEC_APP_URL =
  "https://planninganddevelopment.columbiasc.gov/wp-content/uploads/2026/07/Electrical20262.pdf";
const DEPT_URL = "https://planninganddevelopment.columbiasc.gov/";

export const columbiaSeed: JurisdictionSeed = {
  state,
  county,

  jurisdiction: {
    key: COL_KEYS.jurisdiction,
    stateKey: COL_KEYS.state,
    countyKey: COL_KEYS.county,
    type: "city",
    slug: "columbia",
    name: "Columbia",
    officialName:
      "City of Columbia — Planning & Development Services, Development Center",
    websiteUrl: DEPT_URL,
    permitPortalUrl: DEPT_URL,
    timezone: "America/New_York",
    isActive: true,
  },

  departments: [
    {
      key: "columbia-development-center",
      jurisdictionKey: COL_KEYS.jurisdiction,
      kind: "building",
      name: "Development Center (Planning & Development Services)",
      phone: "(803) 545-3483",
      email: "developmentcenter@columbiasc.gov",
      url: DEPT_URL,
      addressLine: "1401 Main Street, 3rd Floor, Columbia, SC 29201",
      hours: "Monday – Friday, 8:30 a.m. – 5:00 p.m. ET",
      notes:
        "The Development Center receives permit applications, performs concurrent plan and zoning review, issues building and trade permits, and schedules inspections for the City of Columbia.",
    },
  ],

  sources: [
    {
      key: COL_RES_SOURCE_KEY,
      jurisdictionKey: COL_KEYS.jurisdiction,
      title: "Residential Development Review Fees (Development Center, LR-08.05)",
      url: RES_FEES_URL,
      sourceType: "fee_schedule_pdf",
      issuingAuthority: "City of Columbia Planning & Development Services",
      authorityKind: "city",
      isPrimary: true,
      documentDate: "2014-07-08",
      effectiveFrom: COL_FEE_EFFECTIVE_FROM,
      retrievedAt: "2026-09-26",
      lastVerifiedAt: COL_LAST_VERIFIED,
      notes:
        "Plan review $25.00; building permit $20.00 at $1–$5,000 of value then $4.00 per $1,000 or fraction thereof; valuation per the total contract price or ICC Building Safety Journal per-square-foot data (Average $45.00, Good $63.00, Best $70.00, Garage $25.00 for one- and two-family dwellings).",
    },
    {
      key: COL_COMM_SOURCE_KEY,
      jurisdictionKey: COL_KEYS.jurisdiction,
      title: "Commercial Development Review Fees (LR-06/20/14)",
      url: COMM_FEES_URL,
      sourceType: "fee_schedule_pdf",
      issuingAuthority: "City of Columbia Planning & Development Services",
      authorityKind: "city",
      isPrimary: true,
      documentDate: "2014-06-23",
      effectiveFrom: COL_FEE_EFFECTIVE_FROM,
      retrievedAt: "2026-09-26",
      lastVerifiedAt: COL_LAST_VERIFIED,
      notes:
        "Plan review 30% of the building permit fee; building and trade permits $50.00 at $1–$5,000, $50.00 + $9.00 per $1,000 or fraction to $100,000, $905.00 + $4.00 to $1,000,000, $4,505.00 + $3.00 to $5,000,000, $16,505.00 + $2.00 above.",
    },
    {
      key: COL_APP_SOURCE_KEY,
      jurisdictionKey: COL_KEYS.jurisdiction,
      title: "Commercial Building/Zoning Permit Application (rev. 2.8.24)",
      url: APP_URL,
      sourceType: "permit_portal",
      issuingAuthority: "City of Columbia Planning & Development Services",
      authorityKind: "city",
      isPrimary: true,
      documentDate: "2024-02-02",
      effectiveFrom: COL_FEE_EFFECTIVE_FROM,
      retrievedAt: "2026-09-26",
      lastVerifiedAt: COL_LAST_VERIFIED,
      notes:
        "NOTE: subcontractors must obtain individual trade permits for electrical, mechanical, plumbing & gas, and must provide the general contractor's permit number for a no-cost permit — otherwise the subcontractor pays the permit fees.",
    },
  ],

  permitTypes: [],
  projectTypes: [],

  jurisdictionPermitTypes: [
    {
      jurisdictionKey: COL_KEYS.jurisdiction,
      permitTypeKey: "building",
      isAvailable: true,
      localName: "Building Permit",
      officialUrl: RES_FEES_URL,
      notes:
        "Residential: $20.00 to $5,000 of value then $4.00 per $1,000 or fraction thereof, with $25.00 plan review. Commercial: $50.00 base with chained $9/$4/$3/$2 per-$1,000 bands and 30% plan review.",
    },
    {
      jurisdictionKey: COL_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      isAvailable: true,
      localName: "Electrical Trade Permit",
      officialUrl: ELEC_APP_URL,
      notes:
        "Standalone residential trades run the $20/$4-per-$1,000 residential ladder; commercial trades share the building ladder. No-cost when filed under the general contractor's permit number.",
    },
    {
      jurisdictionKey: COL_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      isAvailable: true,
      localName: "Plumbing Trade Permit",
      officialUrl: DEPT_URL,
      notes:
        "Standalone residential plumbing runs the $20/$4-per-$1,000 ladder; commercial plumbing shares the building ladder. No-cost when filed under the general contractor's permit number.",
    },
  ],

  feeSchedules: [
    {
      key: COL_RES_SOURCE_KEY,
      jurisdictionKey: COL_KEYS.jurisdiction,
      sourceKey: COL_RES_SOURCE_KEY,
      title: "City of Columbia Development Review Fee Schedules (Residential & Commercial)",
      officialUrl: RES_FEES_URL,
      effectiveFrom: COL_FEE_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: COL_LAST_VERIFIED,
      notes:
        "The residential and commercial fee sheets together cover building, trade, zoning and development review fees; the commercial application carries the trade-permit rule.",
    },
  ],

  feeRules: [
    ...COL_BUILDING_RULES.map((rule) => ({
      jurisdictionKey: COL_KEYS.jurisdiction,
      permitTypeKey: "building",
      scheduleKey: COL_RES_SOURCE_KEY,
      rule,
    })),
    ...COL_ELECTRICAL_RULES.map((rule) => ({
      jurisdictionKey: COL_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      scheduleKey: COL_RES_SOURCE_KEY,
      rule,
    })),
    ...COL_PLUMBING_RULES.map((rule) => ({
      jurisdictionKey: COL_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      scheduleKey: COL_RES_SOURCE_KEY,
      rule,
    })),
  ],

  requirements: [
    {
      jurisdictionKey: COL_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "document",
      title: "Executed Contract and Valuation",
      description:
        "Permit fees are calculated on the total contract price or total value of work, or per-square-foot ICC Building Safety Journal values for one- and two-family dwellings (Average $45.00, Good $63.00, Best $70.00, Garage $25.00).",
      isMandatory: true,
      sortOrder: 1,
      sourceKey: COL_RES_SOURCE_KEY,
      lastVerifiedAt: COL_LAST_VERIFIED,
    },
    {
      jurisdictionKey: COL_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "zoning_review",
      title: "Concurrent Zoning and Plan Review",
      description:
        "The Development Center routes submittals for concurrent review by permitting, zoning and other divisions; zoning permits are $5.00 under $10,000 of value and $10.00 over $10,000 and/or multi-family.",
      isMandatory: true,
      sortOrder: 2,
      sourceKey: COL_RES_SOURCE_KEY,
      lastVerifiedAt: COL_LAST_VERIFIED,
    },
    {
      jurisdictionKey: COL_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      requirementType: "license",
      title: "South Carolina LLR Electrical License",
      description:
        "Electrical permit applications require the applicant's SC-LLR license number and company information, the total contract value, and the master permit number where the trade sits under a general contractor's building permit.",
      isMandatory: true,
      sortOrder: 3,
      sourceKey: COL_APP_SOURCE_KEY,
      lastVerifiedAt: COL_LAST_VERIFIED,
    },
    {
      jurisdictionKey: COL_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      requirementType: "license",
      title: "South Carolina Plumbing Contractor License",
      description:
        "Plumbing trade permits are issued to SC-licensed plumbing contractors; subcontractors under a general contractor file with the GC's permit number for a no-cost permit.",
      isMandatory: true,
      sortOrder: 4,
      sourceKey: COL_APP_SOURCE_KEY,
      lastVerifiedAt: COL_LAST_VERIFIED,
    },
  ],

  profile: {
    jurisdictionKey: COL_KEYS.jurisdiction,
    headline: "Columbia, South Carolina Permit Fees & Municipal Building Code",
    summary:
      "Columbia's Development Center prices residential building permits at $20.00 up to $5,000 of value then $4.00 per $1,000 or fraction thereof, with a $25.00 flat plan review; commercial permits open at $50.00 and climb a chained ladder of $9, $4, $3 and $2 per $1,000 or fraction across four bands, with plan review at 30% of the permit fee. Trade permits mirror the building ladder and are no-cost when filed under the general contractor's permit number.",
    localContext:
      "Columbia enforces the South Carolina Building Codes adopted effective January 1, 2023 through the Development Center at 1401 Main Street, with concurrent permitting, zoning and utility review on a single submittal. The fee sheets' ICC note makes the valuation basis explicit for houses: per-square-foot values of $45.00 (average), $63.00 (good) and $70.00 (best), plus $25.00 for garages.\n\nThe commercial ladder chains exactly at every seam — $905.00 at $100,001 is what $50.00 + 95 × $9.00 produces, $4,505.00 at $1,000,001 what the $4.00 band produces, and $16,505.00 at $5,000,001 what the $3.00 band produces — so no valuation pays a discontinuous jump. Subcontractors must pull individual trade permits for electrical, mechanical, plumbing and gas, but the application's NOTE makes them free when filed under the general contractor's permit number; otherwise the subcontractor pays.",
    valuationBasis:
      "Total contract price or total value of work to be done, or per-square-foot ICC Building Safety Journal values for one- and two-family dwellings (Average $45.00; Good $63.00; Best $70.00; Garage $25.00).",
    notIncluded:
      "These municipal figures cover the building permit, plan review and trade permits. They exclude:\n\n- **Zoning permits** ($5.00 under $10,000; $10.00 over $10,000 and/or multi-family).\n- **Grading, flood plain and land disturbance review** fees.\n- **Driveway and curb cut permits** ($20.00 per driveway).\n- **Demolition permits** ($25–$75 residential; $150–$200+ commercial).",
    seoTitle: "Columbia SC Permit Fees | Official Fee Schedule & Cost Calculator",
    seoDescription:
      "Calculate Columbia, SC permit costs: $20 + $4 per $1,000 or fraction residential, $50 + chained $9/$4/$3/$2 bands commercial, plan review $25 / 30%.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: COL_LAST_VERIFIED,
  },

  permitPages: [
    {
      jurisdictionKey: COL_KEYS.jurisdiction,
      permitTypeKey: "building",
      slug: "building-permit-cost",
      title: "Columbia Building Permit Cost",
      intro:
        "A Columbia building permit is priced from the **value of work**: **$20.00 for the first $1–$5,000** then **$4.00 per $1,000 or fraction thereof** for one- and two-family residential, with a **$25.00 flat plan review**. Commercial permits open at **$50.00** and climb a chained ladder — **$9.00, $4.00, $3.00 and $2.00 per $1,000 or fraction** across four bands — with plan review at **30% of the building permit fee**.",
      localSummary:
        "Building permits are received at the Development Center, 1401 Main Street, and reviewed concurrently by permitting and zoning under the South Carolina Building Codes effective January 1, 2023. The residential valuation note makes the cost basis explicit: total contract price, or ICC per-square-foot values of $45.00 average / $63.00 good / $70.00 best for dwellings and $25.00 for garages. The commercial ladder chains exactly at every seam, so no project jumps when it crosses a band. Inspections are scheduled through the City's Access portal by 3 p.m. for next-day service.",
      notIncluded:
        "This estimate covers the building permit and plan review. It excludes:\n\n- **Zoning permits** ($5.00 / $10.00 by project value).\n- **Trade permits** — electrical, mechanical, plumbing and gas file individually.\n- **Grading, flood plain and land-disturbance review** fees.\n- **Driveway and curb cut permits** at $20.00 per driveway.",
      workedExample: {
        scenario:
          "A single-family home addition in Columbia with a contract value of $60,000 (residential).",
        inputs: {
          valuationCents: 6_000_000,
          occupancy: "residential",
        },
        notes:
          "Above the first $5,000 there is $55,000 of value, which rounds up to fifty-five whole $1,000 steps: 55 × $4.00 = **$220.00**, plus the **$20.00** base = $240.00. The residential plan review adds **$25.00**. Total: $240.00 + $25.00 = **$265.00**.",
      },
      faqs: [
        {
          question: "How is a Columbia building permit fee calculated?",
          answer:
            "Residential one- and two-family permits are $20.00 for the first $1–$5,000 of value and $4.00 per $1,000 or fraction thereof above $5,000, with a $25.00 plan review. Commercial permits are $50.00 at $1–$5,000, then $9.00 per $1,000 or fraction to $100,000, then the chained $4/$3/$2 bands.",
          sourceId: COL_RES_SOURCE_KEY,
          attribution: "Columbia Residential & Commercial Development Review Fees",
        },
        {
          question: "How is the value of a Columbia house determined?",
          answer:
            "The residential fee sheet's note bases fees on the total contract price or total value of work, or on ICC Building Safety Journal per-square-foot values: $45.00 average, $63.00 good, $70.00 best, and $25.00 for garages.",
          sourceId: COL_RES_SOURCE_KEY,
          attribution: "Columbia Residential Development Review Fees note",
        },
        {
          question: "How much is plan review in Columbia?",
          answer:
            "$25.00 flat for residential projects; 30% of the building permit fee for commercial, due when plans are submitted.",
          sourceId: COL_COMM_SOURCE_KEY,
          attribution: "Columbia Commercial Development Review Fees",
        },
        {
          question: "Does the fraction of a thousand cost extra?",
          answer:
            "Yes — every rate row reads 'or fraction thereof', so $55,000 above the residential threshold buys fifty-five whole $4.00 steps ($220.00), not fifty-four and a half.",
          sourceId: COL_RES_SOURCE_KEY,
          attribution: "Columbia Residential Development Review Fees",
        },
        {
          question: "When must inspections be scheduled in Columbia?",
          answer:
            "Inspections are scheduled through the City's Access portal by 3:00 p.m. for next-day service; there is no same-day inspection.",
          sourceId: COL_APP_SOURCE_KEY,
          attribution: "Columbia Development Center",
        },
      ],
      seoTitle: "Columbia SC Building Permit Cost (Value-of-Work Ladders)",
      seoDescription:
        "Columbia building permits: $20 + $4 per $1,000 or fraction residential ($25 plan review); commercial $50 + chained $9/$4/$3/$2 bands with 30% plan review.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: COL_LAST_VERIFIED,
    },
    {
      jurisdictionKey: COL_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      slug: "electrical-permit-cost",
      title: "Columbia Electrical Permit Cost",
      intro:
        "A standalone Columbia electrical permit prices at the same ladders as the building permit: **$20.00 up to $5,000 of value then $4.00 per $1,000 or fraction thereof** for one- and two-family residential, and the **$50.00 + $9.00-per-$1,000** commercial ladder (chaining through $4/$3/$2) for commercial work. Subcontractors filing under the general contractor's permit number pay **nothing** — the application's own no-cost rule.",
      localSummary:
        "Electrical trade permits file on the City's application (rev. 1/2026) with the contractor's SC-LLR license, the total contract value, and the master permit number where one exists. The commercial application's NOTE makes individual trade permits mandatory for electrical, mechanical, plumbing and gas, and no-cost when the GC's permit number is provided. Inspections are scheduled through the Access portal by 3 p.m. for next-day service.",
      notIncluded:
        "Dominion Energy / SCE&G meter and service charges, utility review checklist items, re-inspection fees, and after-hours inspection charges are outside the trade permit fee.",
      workedExample: {
        scenario:
          "A licensed electrician pulls a standalone residential permit for a heat-pump circuit and panel work valued at $8,400.",
        inputs: {
          valuationCents: 840_000,
          occupancy: "residential",
        },
        notes:
          "Above the first $5,000 there is $3,400 of value, which rounds up to four whole $1,000 steps: 4 × $4.00 = **$16.00**, plus the **$20.00** base = **$36.00**.",
      },
      faqs: [
        {
          question: "What does a standalone electrical permit cost in Columbia?",
          answer:
            "$20.00 for the first $1–$5,000 of value then $4.00 per $1,000 or fraction thereof for residential work; commercial electrical shares the building ladder from $50.00 plus $9.00 per $1,000 or fraction.",
          sourceId: COL_RES_SOURCE_KEY,
          attribution: "Columbia Residential & Commercial Development Review Fees",
        },
        {
          question: "Do subcontractors pay for trade permits in Columbia?",
          answer:
            "Not when they file under the general contractor's permit number — the commercial application states that providing the GC's permit number gets a no-cost permit; otherwise the subcontractor is responsible for the permit fees.",
          sourceId: COL_APP_SOURCE_KEY,
          attribution: "Columbia Commercial Building/Zoning Permit Application NOTE",
        },
        {
          question: "Is an electrical permit required for like-for-like fixture swaps?",
          answer:
            "Permits are required for system installations, service changes, rewiring and new work; minor like-for-like repairs may not require one — confirm with the Development Center at (803) 545-3483.",
          sourceId: COL_APP_SOURCE_KEY,
          attribution: "Columbia Development Center",
        },
        {
          question: "What license does an electrical permit application require?",
          answer:
            "The applicant's SC-LLR license number and classification, plus the total contract value and the master permit number where the trade sits under a general contractor's building permit.",
          sourceId: COL_APP_SOURCE_KEY,
          attribution: "Columbia Electrical Permit Application (rev. 1/2026)",
        },
      ],
      seoTitle: "Columbia SC Electrical Permit Cost & Requirements",
      seoDescription:
        "Columbia electrical trade permits: $20 + $4 per $1,000 or fraction residential, the commercial building ladder, no-cost under a GC permit.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: COL_LAST_VERIFIED,
    },
    {
      jurisdictionKey: COL_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      slug: "plumbing-permit-cost",
      title: "Columbia Plumbing Permit Cost",
      intro:
        "A standalone Columbia plumbing permit prices at **$20.00 up to $5,000 of value then $4.00 per $1,000 or fraction thereof** for one- and two-family residential, and the **$50.00 + $9.00-per-$1,000** commercial ladder for commercial work — with the City's **no-cost rule** for subcontractors filing under the general contractor's permit number.",
      localSummary:
        "Plumbing trade permits file with the SC-licensed plumbing contractor's information, the total contract value and the master permit number where applicable. The Development Center reviews the work concurrently with zoning, and inspections run at rough-in and final through the Access portal. Columbia's flat residential trade rate keeps most service jobs inexpensive — a $5,000-or-less job pays the $20.00 base alone.",
      notIncluded:
        "City of Columbia Water Works water and sewer tap and capacity fees, grease-trap review for food service, backflow device registration, and re-inspection charges are outside the trade permit fee.",
      workedExample: {
        scenario:
          "A plumbing contractor pulls a standalone residential permit for a whole-house repipe valued at $12,500.",
        inputs: {
          valuationCents: 1_250_000,
          occupancy: "residential",
        },
        notes:
          "Above the first $5,000 there is $7,500 of value, which rounds up to eight whole $1,000 steps: 8 × $4.00 = **$32.00**, plus the **$20.00** base = **$52.00**.",
      },
      faqs: [
        {
          question: "What does a standalone plumbing permit cost in Columbia?",
          answer:
            "$20.00 for the first $1–$5,000 of value then $4.00 per $1,000 or fraction thereof for residential; commercial plumbing shares the building ladder from $50.00 plus $9.00 per $1,000 or fraction.",
          sourceId: COL_RES_SOURCE_KEY,
          attribution: "Columbia Residential & Commercial Development Review Fees",
        },
        {
          question: "Is a plumbing permit free under a general contractor?",
          answer:
            "Yes, when the subcontractor provides the GC's permit number on the trade application — the no-cost rule in the commercial permit application's NOTE covers electrical, mechanical, plumbing and gas trades alike.",
          sourceId: COL_APP_SOURCE_KEY,
          attribution: "Columbia Commercial Building/Zoning Permit Application NOTE",
        },
        {
          question: "Does a water heater replacement need a permit in Columbia?",
          answer:
            "Yes — plumbing permits are required for system installations and fixture replacements beyond like-for-like swaps, including water heater changeouts.",
          sourceId: COL_APP_SOURCE_KEY,
          attribution: "Columbia Development Center",
        },
        {
          question: "How are plumbing inspections scheduled?",
          answer:
            "Through the City's Access portal, cut-off 3:00 p.m. for next-day inspection; building inspections can be reached at (803) 545-3422 or BuildingInspections@columbiasc.gov.",
          sourceId: COL_APP_SOURCE_KEY,
          attribution: "Columbia Development Center",
        },
      ],
      seoTitle: "Columbia SC Plumbing Permit Cost & Regulations",
      seoDescription:
        "Columbia plumbing trade permits: $20 + $4 per $1,000 or fraction residential, the commercial building ladder, no-cost under a GC permit.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: COL_LAST_VERIFIED,
    },
  ],

  verifications: [
    {
      entityType: "jurisdiction_profile",
      entityKey: COL_KEYS.jurisdiction,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: COL_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence South Carolina Expansion",
      sourceKey: COL_RES_SOURCE_KEY,
      notes:
        "Both fee sheets and the commercial application read directly from the City's document library; the ICC valuation note and the no-cost trade rule verified from the page text.",
    },
    {
      entityType: "fee_schedule",
      entityKey: COL_RES_SOURCE_KEY,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: COL_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence South Carolina Expansion",
      sourceKey: COL_RES_SOURCE_KEY,
      notes:
        "Verified the residential $20/$4 ladder and $25 plan review, the commercial $50 base with chained $9/$4/$3/$2 bands, and the 30% commercial plan review.",
    },
    {
      entityType: "permit_page",
      entityKey: "building-permit-cost",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: COL_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence South Carolina Expansion",
      sourceKey: COL_RES_SOURCE_KEY,
      notes: "Passed editorial gate checks for building permit page.",
    },
    {
      entityType: "permit_page",
      entityKey: "electrical-permit-cost",
      permitTypeKey: "electrical",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: COL_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence South Carolina Expansion",
      sourceKey: COL_RES_SOURCE_KEY,
      notes: "Passed editorial gate checks for electrical permit page.",
    },
    {
      entityType: "permit_page",
      entityKey: "plumbing-permit-cost",
      permitTypeKey: "plumbing",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: COL_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence South Carolina Expansion",
      sourceKey: COL_RES_SOURCE_KEY,
      notes: "Passed editorial gate checks for plumbing permit page.",
    },
  ],
};
