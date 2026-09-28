import type { JurisdictionSeed } from "@/content/seed-types";
import {
  ANC_BUILDING_RULES,
  ANC_BUILDING_SOURCE_KEY,
  ANC_ELECTRICAL_RULES,
  ANC_FEE_EFFECTIVE_FROM,
  ANC_PLAN_REVIEW_SOURCE_KEY,
  ANC_PLUMBING_RULES,
  ANC_TRADE_SOURCE_KEY,
} from "@/content/anchorage/fee-rules";

export const ANC_LAST_VERIFIED = "2026-09-25";

export const ANC_KEYS = {
  state: "ak",
  county: "anchorage-municipality",
  jurisdiction: "anchorage",
  building: ANC_BUILDING_SOURCE_KEY,
  planReview: ANC_PLAN_REVIEW_SOURCE_KEY,
  trade: ANC_TRADE_SOURCE_KEY,
} as const;

const state = {
  code: "AK",
  slug: "alaska",
  name: "Alaska",
  fipsCode: "02",
};

const county = {
  key: ANC_KEYS.county,
  slug: "anchorage-municipality",
  name: "Municipality of Anchorage",
  fipsCode: "02020",
};

const MUNI_URL = "https://www.muni.org";
const MUNICODE_URL =
  "https://library.municode.com/ak/anchorage/codes/code_of_ordinances?nodeId=TIT23BUCO_CH23.10ANCHADCO_23.10.TABLE_3-ATONCOFE";

export const anchorageSeed: JurisdictionSeed = {
  state,
  county,

  jurisdiction: {
    key: ANC_KEYS.jurisdiction,
    stateKey: ANC_KEYS.state,
    countyKey: ANC_KEYS.county,
    type: "city",
    slug: "anchorage",
    name: "Anchorage",
    officialName: "Municipality of Anchorage — Development Services Division",
    websiteUrl: MUNI_URL,
    permitPortalUrl: MUNI_URL,
    timezone: "America/Anchorage",
    isActive: true,
  },

  departments: [
    {
      key: "anchorage-dsd",
      jurisdictionKey: ANC_KEYS.jurisdiction,
      kind: "building",
      name: "Development Services Division",
      phone: "(907) 343-8301",
      email: "permits@muni.org",
      url: MUNI_URL,
      addressLine: "4700 Elmore Road, Anchorage, AK 99507",
      hours: "Monday – Friday, 8:00 a.m. – 4:30 p.m. AKDT",
      notes:
        "The Development Services Division (DSD) administers Title 23 building codes, issues permits, conducts plan reviews, and inspects construction within the Municipality of Anchorage.",
    },
  ],

  sources: [
    {
      key: ANC_BUILDING_SOURCE_KEY,
      jurisdictionKey: ANC_KEYS.jurisdiction,
      title: "Anchorage Municipal Code Title 23, Table 3-A (Building Permit Fees)",
      url: MUNICODE_URL,
      sourceType: "municipal_code",
      issuingAuthority: "Anchorage Assembly / Development Services Division",
      authorityKind: "city",
      isPrimary: true,
      documentDate: "2024-04-23",
      effectiveFrom: ANC_FEE_EFFECTIVE_FROM,
      retrievedAt: "2026-09-25",
      lastVerifiedAt: ANC_LAST_VERIFIED,
      notes:
        "AMC 23.10 Table 3-A sets building permit fees based on project valuation: 0.009 x valuation for residential IRC (min $360) and 0.015 x valuation up to $500,000 for commercial IBC (min $525).",
    },
    {
      key: ANC_PLAN_REVIEW_SOURCE_KEY,
      jurisdictionKey: ANC_KEYS.jurisdiction,
      title: "Anchorage Municipal Code Title 23, Table 3-B (Plan Review Fees)",
      url: MUNICODE_URL,
      sourceType: "municipal_code",
      issuingAuthority: "Anchorage Assembly / Development Services Division",
      authorityKind: "city",
      isPrimary: true,
      documentDate: "2024-04-23",
      effectiveFrom: ANC_FEE_EFFECTIVE_FROM,
      retrievedAt: "2026-09-25",
      lastVerifiedAt: ANC_LAST_VERIFIED,
      notes:
        "AMC 23.10 Table 3-B establishes plan examination fees: 50% of the building permit fee for residential (IRC <= 3 units) and 65% for commercial (IBC).",
    },
    {
      key: ANC_TRADE_SOURCE_KEY,
      jurisdictionKey: ANC_KEYS.jurisdiction,
      title: "Anchorage Municipal Code Title 23, Table 3-C / 3-D / 3-E (Inspection & Trade Fees)",
      url: MUNICODE_URL,
      sourceType: "municipal_code",
      issuingAuthority: "Anchorage Assembly / Development Services Division",
      authorityKind: "city",
      isPrimary: true,
      documentDate: "2024-04-23",
      effectiveFrom: ANC_FEE_EFFECTIVE_FROM,
      retrievedAt: "2026-09-25",
      lastVerifiedAt: ANC_LAST_VERIFIED,
      notes:
        "AMC 23.10 Tables 3-C, 3-D, and 3-E specify trade permit fees and standard inspection rates at $175.00 per hour with a one-hour minimum.",
    },
  ],

  permitTypes: [],
  projectTypes: [],

  jurisdictionPermitTypes: [
    {
      jurisdictionKey: ANC_KEYS.jurisdiction,
      permitTypeKey: "building",
      isAvailable: true,
      localName: "Building Permit",
      officialUrl: MUNICODE_URL,
      notes:
        "Assessed on total project valuation: 0.009 x valuation (min $360.00) for residential IRC 1-3 units; 0.015 x valuation up to $500,000 (min $525.00) for commercial IBC. Plan review is 50% for residential and 65% for commercial.",
    },
    {
      jurisdictionKey: ANC_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      isAvailable: true,
      localName: "Electrical Permit",
      officialUrl: MUNICODE_URL,
      notes:
        "Standalone trade permit pulled under AMC Chapter 23.10. Assessed per inspection at the standard $175.00 hourly rate (1-hour minimum).",
    },
    {
      jurisdictionKey: ANC_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      isAvailable: true,
      localName: "Plumbing Permit",
      officialUrl: MUNICODE_URL,
      notes:
        "Standalone trade permit pulled under AMC Chapter 23.10. Assessed per inspection at the standard $175.00 hourly rate (1-hour minimum).",
    },
  ],

  feeSchedules: [
    {
      key: ANC_BUILDING_SOURCE_KEY,
      jurisdictionKey: ANC_KEYS.jurisdiction,
      sourceKey: ANC_BUILDING_SOURCE_KEY,
      title: "Anchorage AMC 23.10 Official Building & Plan Review Fee Schedule",
      officialUrl: MUNICODE_URL,
      effectiveFrom: ANC_FEE_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: ANC_LAST_VERIFIED,
      notes:
        "Official fee schedule under Anchorage Municipal Code Title 23 for building and trade permits.",
    },
  ],

  feeRules: [
    ...ANC_BUILDING_RULES.map((rule) => ({
      jurisdictionKey: ANC_KEYS.jurisdiction,
      permitTypeKey: "building",
      scheduleKey: ANC_BUILDING_SOURCE_KEY,
      rule,
    })),
    ...ANC_ELECTRICAL_RULES.map((rule) => ({
      jurisdictionKey: ANC_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      scheduleKey: ANC_BUILDING_SOURCE_KEY,
      rule,
    })),
    ...ANC_PLUMBING_RULES.map((rule) => ({
      jurisdictionKey: ANC_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      scheduleKey: ANC_BUILDING_SOURCE_KEY,
      rule,
    })),
  ],

  requirements: [
    {
      jurisdictionKey: ANC_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "document",
      title: "Construction Plans & Energy Calculations",
      description:
        "Complete structural plans, architectural drawings, and Alaska BEES (Building Energy Efficiency Standards) compliance documentation.",
      isMandatory: true,
      sortOrder: 1,
      sourceKey: ANC_BUILDING_SOURCE_KEY,
      lastVerifiedAt: ANC_LAST_VERIFIED,
    },
    {
      jurisdictionKey: ANC_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "license",
      title: "Alaska Contractor License",
      description:
        "Contractors must hold a valid Alaska General Contractor or Residential Contractor Endorsement license and Municipality of Anchorage contractor registration.",
      isMandatory: true,
      sortOrder: 2,
      sourceKey: ANC_BUILDING_SOURCE_KEY,
      lastVerifiedAt: ANC_LAST_VERIFIED,
    },
    {
      jurisdictionKey: ANC_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      requirementType: "license",
      title: "Alaska Electrical Administrator License",
      description:
        "Electrical permits must be pulled by a contractor with an assigned Alaska licensed electrical administrator and municipal registration.",
      isMandatory: true,
      sortOrder: 3,
      sourceKey: ANC_TRADE_SOURCE_KEY,
      lastVerifiedAt: ANC_LAST_VERIFIED,
    },
    {
      jurisdictionKey: ANC_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      requirementType: "license",
      title: "Alaska Mechanical Administrator License",
      description:
        "Plumbing permits must be pulled by a licensed contractor registered with the Municipality of Anchorage and employing a certified administrator.",
      isMandatory: true,
      sortOrder: 4,
      sourceKey: ANC_TRADE_SOURCE_KEY,
      lastVerifiedAt: ANC_LAST_VERIFIED,
    },
  ],

  profile: {
    jurisdictionKey: ANC_KEYS.jurisdiction,
    headline: "Anchorage, Alaska Permit Fees & Municipal Building Code",
    summary:
      "The Municipality of Anchorage Development Services Division (DSD) regulates construction under AMC Title 23. Residential building permits are calculated at 0.009 x valuation ($360 minimum) plus 50% plan review, while commercial projects pay 0.015 x valuation up to $500,000 ($525 minimum) plus 65% plan review.",
    localContext:
      "Anchorage enforces the International Building Code (IBC) and International Residential Code (IRC) with local subarctic and high-seismic amendments adopted in Chapter 23.10 of the Anchorage Municipal Code. The Development Services Division serves the unified Municipality of Anchorage across the Anchorage Bowl, Eagle River, Chugiak, and Girdwood.\n\nAll construction must satisfy cold-climate thermal envelope rules and Alaska Building Energy Efficiency Standards (BEES). Standalone electrical and plumbing permits are pulled by state-licensed trade contractors through the municipal permitting portal.",
    valuationBasis:
      "Valuation is based on total fair market value of all construction work, including materials, labor, and permanent equipment, subject to verification against regional building valuation standards.",
    notIncluded:
      "These municipal fees cover core building permits and plan reviews. They exclude:\n\n- **Driveway and right-of-way permits** issued by the Municipal Right-of-Way Division.\n- **On-site septic and private well permits** issued by the Anchorage Health Department.\n- **Zoning conditional use and platting reviews** handled by the Planning Department.\n- **Fire alarm and sprinkler plan examinations** administered by the Anchorage Fire Department.",
    seoTitle: "Anchorage AK Permit Fees | Official Fee Schedule & Cost Calculator",
    seoDescription:
      "Calculate official Anchorage building permit costs. Residential rate is 0.009 x valuation ($360 minimum) plus 50% plan review. Commercial rate is 0.015 x valuation.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: ANC_LAST_VERIFIED,
  },

  permitPages: [
    {
      jurisdictionKey: ANC_KEYS.jurisdiction,
      permitTypeKey: "building",
      slug: "building-permit-cost",
      title: "Anchorage Building Permit Cost",
      intro:
        "A Municipality of Anchorage building permit is calculated directly from **project construction valuation**. For residential one-, two-, and three-family dwellings (Group R-3 / IRC), the base permit fee is **0.009 × valuation** ($9.00 per $1,000) with a **minimum permit fee of $360.00**, plus a **50% plan review fee**. Commercial construction (IBC) is assessed at **0.015 × valuation** ($15.00 per $1,000) up to $500,000 with a **$525.00 minimum fee**, plus a **65% plan review fee**.",
      localSummary:
        "Building permits in Anchorage are processed by the Development Services Division on Elmore Road. Permits are mandatory for new construction, additions, structural modifications, garage conversions, and decks over 30 inches above grade. Plans must account for Southcentral Alaska's Seismic Design Category D/E criteria and high snow load specifications.",
      notIncluded:
        "This estimate covers the municipal structural building permit and plan examination. It excludes:\n\n- **Trade permits** (electrical, plumbing, and mechanical permits must be secured separately).\n- **Right-of-way and curb cut permits** administered by Municipal Right-of-Way.\n- **On-site wastewater and private well approval fees** from the Anchorage Health Department.\n- **Anchorage Fire Department life-safety plan review** for commercial suppression systems.",
      workedExample: {
        scenario:
          "A single-family residential home addition in Anchorage, AK with an estimated construction valuation of $90,000.",
        inputs: {
          valuationCents: 9_000_000,
          squareFootage: 700,
          // AMC 23.10 Table 3-A keys the residential rate on the occupancy class.
          // Without it every building rule is excluded and the example computes $0.
          occupancy: "residential",
        },
        notes:
          "The residential building permit rate is 0.009 × $90,000 = **$810.00**, which exceeds the municipal minimum of $360.00. The residential plan review fee is 50% of the permit fee ($810.00 × 0.50) = **$405.00**. The total municipal permit and plan examination fee is **$1,215.00**.",
      },
      faqs: [
        {
          question: "How is an Anchorage building permit fee calculated?",
          answer:
            "Under AMC 23.10 Table 3-A, residential building permits are calculated at 0.009 times the construction valuation with a $360 minimum fee, plus a 50% plan review fee. Commercial building permits are calculated at 0.015 times the valuation up to $500,000 with a $525 minimum fee, plus a 65% plan review fee.",
          sourceId: ANC_BUILDING_SOURCE_KEY,
          attribution: "Anchorage Municipal Code Title 23, Chapter 23.10",
        },
        {
          question: "What is the minimum building permit fee in Anchorage?",
          answer:
            "The minimum fee for a residential building permit is $360.00, and the minimum fee for a commercial building permit is $525.00.",
          sourceId: ANC_BUILDING_SOURCE_KEY,
          attribution: "AMC 23.10 Table 3-A",
        },
        {
          question: "How much is the plan review fee in Anchorage?",
          answer:
            "Under AMC 23.10 Table 3-B, the plan review fee is 50% of the building permit fee for residential buildings (IRC 1-3 units) and 65% of the building permit fee for commercial buildings (IBC).",
          sourceId: ANC_PLAN_REVIEW_SOURCE_KEY,
          attribution: "AMC 23.10 Table 3-B",
        },
        {
          question: "Can homeowners pull their own permits in Anchorage?",
          answer:
            "Homeowners may obtain building permits for their primary single-family residence, provided they perform the work themselves and submit an owner-builder acknowledgment form.",
          sourceId: ANC_BUILDING_SOURCE_KEY,
          attribution: "Municipality of Anchorage Development Services Division",
        },
      ],
      seoTitle: "Anchorage AK Building Permit Cost (Valuation & Plan Review)",
      seoDescription:
        "Calculate Municipality of Anchorage building permit costs: 0.009 x valuation for residential ($360 min) + 50% plan review; 0.015 x valuation for commercial.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: ANC_LAST_VERIFIED,
    },
    {
      jurisdictionKey: ANC_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      slug: "electrical-permit-cost",
      title: "Anchorage Electrical Permit Cost",
      intro:
        "Electrical permits in the Municipality of Anchorage are issued as **standalone trade permits** to state-licensed electrical contractors. Under AMC Chapter 23.10 Tables 3-C and 3-D, standalone electrical trade permits and inspections are assessed at the municipal standard rate of **$175.00 per inspection or hour** (with a **1-hour minimum fee of $175.00**). Installations must conform to the National Electrical Code (NEC) as locally amended.",
      localSummary:
        "An electrical permit is required for service panel upgrades, new circuits, rewiring, standby generator transfers, and temporary power poles. Permits are processed through the Development Services portal. Rough-in wiring must be inspected and approved prior to thermal insulation and wall closure.",
      notIncluded:
        "Chugach Electric Association or Matanuska Electric Association utility hookup and metering charges, after-hours emergency inspections, and low-voltage network registrations.",
      workedExample: {
        scenario:
          "Residential electrical service panel upgrade to 200 amps with dedicated subpanel wiring in Anchorage.",
        inputs: {
          valuationCents: 550_000,
        },
        notes:
          "The electrical trade permit is assessed at the standard Table 3-C / Table 3-D base rate of **$175.00**, covering review and standard inspection.",
      },
      faqs: [
        {
          question: "Who can pull an electrical permit in Anchorage?",
          answer:
            "Electrical permits must be pulled by an electrical contractor licensed by the State of Alaska and registered with the Municipality of Anchorage.",
          sourceId: ANC_TRADE_SOURCE_KEY,
          attribution: "Anchorage Municipal Code AMC 23.10",
        },
        {
          question: "What is the fee for an electrical permit in Anchorage?",
          answer:
            "Standard electrical permits are assessed based on Table 3-C inspection rates at $175.00 per inspection (1-hour minimum).",
          sourceId: ANC_TRADE_SOURCE_KEY,
          attribution: "AMC 23.10 Table 3-C & Table 3-D",
        },
        {
          question: "When is an electrical inspection required?",
          answer:
            "Inspections are required at the rough-in stage before insulation/drywall concealment and at final completion when fixtures and panel trim are installed.",
          sourceId: ANC_TRADE_SOURCE_KEY,
          attribution: "Development Services Division Inspection Guide",
        },
      ],
      seoTitle: "Anchorage AK Electrical Permit Cost & Requirements",
      seoDescription:
        "Find electrical permit fees in Anchorage, AK: $175 standard inspection fee, licensed contractor rules, and National Electrical Code requirements.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: ANC_LAST_VERIFIED,
    },
    {
      jurisdictionKey: ANC_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      slug: "plumbing-permit-cost",
      title: "Anchorage Plumbing Permit Cost",
      intro:
        "Plumbing permits in Anchorage are regulated under AMC Chapter 23.10 and the Uniform Plumbing Code (UPC) with local amendments. Standalone plumbing permits and inspections are assessed under AMC Tables 3-C and 3-E at the standard rate of **$175.00 per inspection or hour** (with a **1-hour minimum fee of $175.00**). Permits must be pulled by certified plumbing and mechanical contractors.",
      localSummary:
        "Plumbing permits are required for water heater changeouts, whole-home repiping, fixture rough-ins, backflow preventers, and sewer lateral connections. Municipal plumbing inspectors check frost protection, pressure test gauges, venting, and seismic water heater strapping.",
      notIncluded:
        "Anchorage Water & Wastewater Utility (AWWU) water meter fees, main sewer tap assessments, private septic tank installation permits, and well drilling authorizations.",
      workedExample: {
        scenario:
          "Replacement of a residential water heater and installation of a whole-home pressure reducing valve in Anchorage.",
        inputs: {
          valuationCents: 400_000,
        },
        notes:
          "The plumbing trade permit is assessed at the standard municipal inspection rate of **$175.00** under AMC Table 3-C / Table 3-E.",
      },
      faqs: [
        {
          question: "Does replacing a water heater require a permit in Anchorage?",
          answer:
            "Yes, a plumbing permit is required for water heater installations and replacements to ensure proper venting, expansion tanks, and seismic strapping.",
          sourceId: ANC_TRADE_SOURCE_KEY,
          attribution: "Development Services Division Plumbing Guide",
        },
        {
          question: "How much is a plumbing permit in Anchorage?",
          answer:
            "Standard plumbing permits are assessed under AMC Table 3-C / Table 3-E at $175.00 per inspection with a one-hour minimum.",
          sourceId: ANC_TRADE_SOURCE_KEY,
          attribution: "AMC 23.10 Table 3-C & Table 3-E",
        },
        {
          question: "Who oversees public water and sewer connections in Anchorage?",
          answer:
            "While the Development Services Division inspects indoor plumbing and building sewers, utility service connections and meters are managed by the Anchorage Water and Wastewater Utility (AWWU).",
          sourceId: ANC_BUILDING_SOURCE_KEY,
          attribution: "Anchorage Water and Wastewater Utility (AWWU)",
        },
      ],
      seoTitle: "Anchorage AK Plumbing Permit Cost & Code Requirements",
      seoDescription:
        "Anchorage plumbing permit costs: $175 standard inspection fee. Learn rules for water heaters, repiping, and licensed plumbing contractor requirements.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: ANC_LAST_VERIFIED,
    },
  ],

  verifications: [
    {
      entityType: "jurisdiction_profile",
      entityKey: ANC_KEYS.jurisdiction,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: ANC_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Alaska Expansion",
      sourceKey: ANC_BUILDING_SOURCE_KEY,
      notes: "Verified against Anchorage Municipal Code Title 23 and Development Services Division fee schedules.",
    },
    {
      entityType: "fee_schedule",
      entityKey: ANC_BUILDING_SOURCE_KEY,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: ANC_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Alaska Expansion",
      sourceKey: ANC_BUILDING_SOURCE_KEY,
      notes: "Verified residential 0.009 x valuation ($360 min) and commercial 0.015 x valuation ($525 min) with 50%/65% plan review.",
    },
    {
      entityType: "permit_page",
      entityKey: "building-permit-cost",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: ANC_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Alaska Expansion",
      sourceKey: ANC_BUILDING_SOURCE_KEY,
      notes: "Passed editorial gate checks for building permit page.",
    },
    {
      entityType: "permit_page",
      entityKey: "electrical-permit-cost",
      permitTypeKey: "electrical",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: ANC_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Alaska Expansion",
      sourceKey: ANC_TRADE_SOURCE_KEY,
      notes: "Passed editorial gate checks for electrical permit page.",
    },
    {
      entityType: "permit_page",
      entityKey: "plumbing-permit-cost",
      permitTypeKey: "plumbing",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: ANC_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Alaska Expansion",
      sourceKey: ANC_TRADE_SOURCE_KEY,
      notes: "Passed editorial gate checks for plumbing permit page.",
    },
  ],
};
