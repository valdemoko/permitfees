import type { JurisdictionSeed } from "@/content/seed-types";
import {
  HSV_BUILDING_RULES,
  HSV_BUILDING_SOURCE_KEY,
  HSV_ELECTRICAL_RULES,
  HSV_FEE_EFFECTIVE_FROM,
  HSV_PLUMBING_RULES,
  HSV_TRADE_SOURCE_KEY,
} from "@/content/huntsville/fee-rules";

export const HSV_LAST_VERIFIED = "2026-09-25";

export const HSV_KEYS = {
  state: "al",
  county: "madison-county",
  jurisdiction: "huntsville",
  building: HSV_BUILDING_SOURCE_KEY,
  trade: HSV_TRADE_SOURCE_KEY,
} as const;

const state = {
  code: "AL",
  slug: "alabama",
  name: "Alabama",
  fipsCode: "01",
};

const county = {
  key: HSV_KEYS.county,
  slug: "madison-county",
  name: "Madison County",
  fipsCode: "01089",
};

const INSPECTION_URL =
  "https://www.huntsvilleal.gov/development/building-construction/building-license-permits/";
const PERMIT_PORTAL_URL =
  "https://www.huntsvilleal.gov/development/building-construction/building-license-permits/";
/**
 * Where trade permits are actually bought online. A different document from the
 * department page above, so the two sources stay two sources: the seeder keys a
 * source on its URL, and two keys sharing one URL would silently collapse into a
 * single row.
 */
const TRADE_PORTAL_URL = "https://inspection.huntsvilleal.gov/inspection/Online/ListPermits.aspx";

export const huntsvilleSeed: JurisdictionSeed = {
  state,
  county,

  jurisdiction: {
    key: HSV_KEYS.jurisdiction,
    stateKey: HSV_KEYS.state,
    countyKey: HSV_KEYS.county,
    type: "city",
    slug: "huntsville",
    name: "Huntsville",
    officialName: "City of Huntsville — Inspection Department",
    websiteUrl: INSPECTION_URL,
    permitPortalUrl: PERMIT_PORTAL_URL,
    timezone: "America/Chicago",
    isActive: true,
  },

  departments: [
    {
      key: "huntsville-inspection-dept",
      jurisdictionKey: HSV_KEYS.jurisdiction,
      kind: "building",
      name: "City of Huntsville Inspection Department",
      phone: "(256) 427-5331",
      email: "inspections@huntsvilleal.gov",
      url: INSPECTION_URL,
      addressLine: "305 Fountain Circle, Huntsville, AL 35801",
      hours: "Monday – Friday, 7:30 a.m. – 5:00 p.m. CT",
      notes:
        "The Inspection Department reviews residential and commercial building plans, administers contractor licensing, and conducts building, electrical, plumbing, gas, and mechanical inspections in Huntsville.",
    },
  ],

  sources: [
    {
      key: HSV_BUILDING_SOURCE_KEY,
      jurisdictionKey: HSV_KEYS.jurisdiction,
      title: "City of Huntsville Building Permit Fee Schedule & Calculation Guidelines",
      url: INSPECTION_URL,
      sourceType: "municipal_website",
      issuingAuthority: "City of Huntsville Inspection Department",
      authorityKind: "city",
      isPrimary: true,
      documentDate: "2026-01-01",
      effectiveFrom: HSV_FEE_EFFECTIVE_FROM,
      retrievedAt: "2026-09-25",
      lastVerifiedAt: HSV_LAST_VERIFIED,
      notes:
        "Official guidelines publishing the 0.0055 multiplier for valuation projects and the specific square footage formula for new single-family homes.",
    },
    {
      key: HSV_TRADE_SOURCE_KEY,
      jurisdictionKey: HSV_KEYS.jurisdiction,
      title: "City of Huntsville Trade Permits & Inspection Online Portal",
      url: TRADE_PORTAL_URL,
      sourceType: "permit_portal",
      issuingAuthority: "City of Huntsville Inspection Department",
      authorityKind: "city",
      isPrimary: true,
      documentDate: "2026-01-01",
      effectiveFrom: HSV_FEE_EFFECTIVE_FROM,
      retrievedAt: "2026-09-25",
      lastVerifiedAt: HSV_LAST_VERIFIED,
      notes:
        "Online portal for electrical, plumbing, gas, and mechanical trade permits with a baseline $50.00 minimum fee.",
    },
  ],

  permitTypes: [],
  projectTypes: [],

  jurisdictionPermitTypes: [
    {
      jurisdictionKey: HSV_KEYS.jurisdiction,
      permitTypeKey: "building",
      isAvailable: true,
      localName: "Building Permit",
      officialUrl: INSPECTION_URL,
      notes:
        "Priced using the 0.0055 multiplier on valuation or heated/unheated square footage formula for new single-family homes. Minimum permit fee is $50.00.",
    },
    {
      jurisdictionKey: HSV_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      isAvailable: true,
      localName: "Electrical Permit",
      officialUrl: PERMIT_PORTAL_URL,
      notes:
        "Standalone permit pulled by licensed electrical contractors. Priced at 0.0055 of electrical valuation, minimum fee $50.00.",
    },
    {
      jurisdictionKey: HSV_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      isAvailable: true,
      localName: "Plumbing Permit",
      officialUrl: PERMIT_PORTAL_URL,
      notes:
        "Standalone permit pulled by certified master plumbers. Priced at 0.0055 of plumbing valuation, minimum fee $50.00.",
    },
  ],

  feeSchedules: [
    {
      key: HSV_BUILDING_SOURCE_KEY,
      jurisdictionKey: HSV_KEYS.jurisdiction,
      sourceKey: HSV_BUILDING_SOURCE_KEY,
      title: "Huntsville Building & Inspection Fee Schedule (2026)",
      officialUrl: INSPECTION_URL,
      effectiveFrom: HSV_FEE_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: HSV_LAST_VERIFIED,
      notes:
        "Published fee schedule for construction and alteration work in Huntsville.",
    },
  ],

  feeRules: [
    ...HSV_BUILDING_RULES.map((rule) => ({
      jurisdictionKey: HSV_KEYS.jurisdiction,
      permitTypeKey: "building",
      scheduleKey: HSV_BUILDING_SOURCE_KEY,
      rule,
    })),
    ...HSV_ELECTRICAL_RULES.map((rule) => ({
      jurisdictionKey: HSV_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      scheduleKey: HSV_BUILDING_SOURCE_KEY,
      rule,
    })),
    ...HSV_PLUMBING_RULES.map((rule) => ({
      jurisdictionKey: HSV_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      scheduleKey: HSV_BUILDING_SOURCE_KEY,
      rule,
    })),
  ],

  requirements: [
    {
      jurisdictionKey: HSV_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "document",
      title: "ePlans Digital Submission",
      description:
        "Digital PDF plan sets must be uploaded to the City of Huntsville ePlans review system, including architectural, structural, civil, and life-safety drawings.",
      isMandatory: true,
      sortOrder: 1,
      sourceKey: HSV_BUILDING_SOURCE_KEY,
      lastVerifiedAt: HSV_LAST_VERIFIED,
    },
    {
      jurisdictionKey: HSV_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "license",
      title: "City of Huntsville Business License & State Contractor License",
      description:
        "General contractors must hold an active State of Alabama General Contractors License and a City of Huntsville municipal business license.",
      isMandatory: true,
      sortOrder: 2,
      sourceKey: HSV_BUILDING_SOURCE_KEY,
      lastVerifiedAt: HSV_LAST_VERIFIED,
    },
    {
      jurisdictionKey: HSV_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      requirementType: "license",
      title: "Alabama State Electrical License",
      description:
        "Electrical contractors must be state-licensed and registered with the Huntsville Inspection Department.",
      isMandatory: true,
      sortOrder: 3,
      sourceKey: HSV_TRADE_SOURCE_KEY,
      lastVerifiedAt: HSV_LAST_VERIFIED,
    },
    {
      jurisdictionKey: HSV_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      requirementType: "license",
      title: "Alabama Master Plumber License",
      description:
        "Plumbing contractors must maintain an active master plumber certificate from the State of Alabama Plumbers and Gas Fitters Examining Board.",
      isMandatory: true,
      sortOrder: 4,
      sourceKey: HSV_TRADE_SOURCE_KEY,
      lastVerifiedAt: HSV_LAST_VERIFIED,
    },
  ],

  profile: {
    jurisdictionKey: HSV_KEYS.jurisdiction,
    headline: "Huntsville, Alabama Permit Fees & Construction Regulations",
    summary:
      "The City of Huntsville Inspection Department oversees all building, electrical, plumbing, and mechanical permits within city limits. Permit fees are established by municipal ordinance: new single-family homes are priced using a square footage valuation formula ((Heated × $15.00 + Unheated × $7.50) × 0.0055), while renovations and commercial builds use a straight 0.0055 multiplier on contract valuation with a $50.00 minimum.",
    localContext:
      "As Alabama's most populous city and a major aerospace and technology hub, Huntsville maintains high standards of building code compliance under the International Code Council (ICC) framework. The city provides digital permitting through its ePlans review portal for residential and commercial developments.\n\nAll construction projects involving structural, electrical, plumbing, or mechanical work require permits issued by the Huntsville Inspection Department. The department coordinates with Huntsville Utilities for utility meter releases upon passing rough-in and final inspections.",
    valuationBasis:
      "For alterations, additions, and commercial construction, fees are based on total contract price including materials and labor. For new single-family residential construction, fees are computed directly from heated and unheated square footage values.",
    notIncluded:
      "These municipal figures represent the building inspection and permit fees. They exclude:\n\n- **Special flood hazard zone reviews** required in designated FEMA high-risk flood zones.\n- **Street cut, curb cut, and driveway permits** issued by the City of Huntsville Public Works division.\n- **Water tap and sewer connection charges** administered by Huntsville Utilities.\n- **State craft training fund surcharges** required under Alabama state law for nonresidential work.",
    seoTitle: "Huntsville, AL Permit Fees | Official Inspection Department Rates",
    seoDescription:
      "Official Huntsville, AL building permit fees: 0.0055 valuation multiplier ($5.50/$1,000), square-foot formula for new homes, and $50 minimum permit fee.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: HSV_LAST_VERIFIED,
  },

  permitPages: [
    {
      jurisdictionKey: HSV_KEYS.jurisdiction,
      permitTypeKey: "building",
      slug: "building-permit-cost",
      title: "Huntsville Building Permit Cost",
      intro:
        "A City of Huntsville building permit is calculated using one of two official municipal formulas: **new single-family dwellings** use a square-foot calculation `((Heated sq ft × $15.00) + (Unheated sq ft × $7.50)) × 0.0055`, while **remodels, additions, and commercial projects** multiply the total contract valuation by **0.0055** ($5.50 per $1,000 of value). The city enforces a **minimum permit fee of $50.00**.",
      localSummary:
        "Permits in Huntsville are required for any structural project where material and labor costs exceed $250.00. The Inspection Department operates out of Fountain Circle and utilizes the ePlans Review system for architectural plan submissions. Commercial projects may also require pre-application development conferences with planning and engineering.",
      notIncluded:
        "This estimate covers the standard municipal building permit. It excludes:\n\n- **Separate trade permits** for electrical, plumbing, gas, and mechanical (HVAC) systems.\n- **Huntsville Utilities connection fees** for electric, natural gas, and municipal water service.\n- **Zoning variance or Board of Adjustment fees** if setbacks or height limits are modified.\n- **Engineering right-of-way permits** for sidewalks or curb cut construction.",
      workedExample: {
        scenario:
          "Construction of a new single-family residential home in Huntsville with 2,400 sq ft of heated living space and 600 sq ft of unheated space (garage and covered porch).",
        inputs: {
          // Heated area is the first area and unheated the second, because the city's
          // formula charges the two at different rates. The $350,000 figure is the
          // equal-value renovation in the note below; it is not charged, because a
          // new home is priced by the square-foot formula rather than by valuation.
          squareFootage: 2_400,
          valuationCents: 35_000_000,
          custom: { covered_square_footage: 600 },
        },
        notes:
          "Heated space: 2,400 sq ft × $15.00 = $36,000. Unheated space: 600 sq ft × $7.50 = $4,500. Combined assessment base = $40,500. Multiplying by 0.0055 gives a total building permit fee of **$222.75**. For a renovation of equal value ($350,000), the fee would be $350,000 × 0.0055 = **$1,925.00**.",
      },
      faqs: [
        {
          question: "How is a building permit fee calculated for a new home in Huntsville?",
          answer:
            "The City of Huntsville uses a specific formula: (Heated sq ft × $15.00) + (Unheated sq ft × $7.50), and the resulting sum is multiplied by 0.0055. This ensures lower permit costs for new residential construction compared to general commercial valuation rates.",
          sourceId: HSV_BUILDING_SOURCE_KEY,
          attribution: "City of Huntsville Inspection Department",
        },
        {
          question: "When is a building permit required in Huntsville?",
          answer:
            "A building permit is mandatory for any project where the cost of labor and materials exceeds $250.00, or whenever any structural alterations, additions, or load-bearing changes are involved.",
          sourceId: HSV_BUILDING_SOURCE_KEY,
          attribution: "Huntsville Municipal Code",
        },
        {
          question: "What is the minimum permit fee in Huntsville?",
          answer:
            "The minimum fee for any permit issued by the Huntsville Inspection Department is $50.00.",
          sourceId: HSV_BUILDING_SOURCE_KEY,
          attribution: "Huntsville Inspection Fee Schedule",
        },
        {
          question: "How are building plans submitted in Huntsville?",
          answer:
            "Plans for both residential and commercial projects must be uploaded electronically via the City of Huntsville ePlans Review portal.",
          sourceId: HSV_BUILDING_SOURCE_KEY,
          attribution: "Huntsville Development Services",
        },
      ],
      seoTitle: "Huntsville AL Building Permit Cost (Official Formula & Multipliers)",
      seoDescription:
        "What a City of Huntsville building permit costs: 0.0055 valuation multiplier, square-foot formula for new homes, and $50 minimum fee.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: HSV_LAST_VERIFIED,
    },
    {
      jurisdictionKey: HSV_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      slug: "electrical-permit-cost",
      title: "Huntsville Electrical Permit Cost",
      intro:
        "Electrical permits in Huntsville are issued to licensed electrical contractors through the city's online permitting portal. The City publishes two calculation routes: a **base $50.00 plus tiered per-circuit and ampacity charges**, or **0.0055 of the electrical subcontract valuation ($5.50 per $1,000)** — this calculator prices the valuation route, anchored by a **minimum permit fee of $50.00**.",
      localSummary:
        "The City of Huntsville Inspection Department requires permits for new wiring, service panel upgrades, electric vehicle (EV) charging stations, and commercial equipment feeds. Electrical work must comply with the National Electrical Code (NEC). Inspectors conduct rough-in and final inspections before releasing meters to Huntsville Utilities. Applications are filed through the ePlans portal, and the Inspection Department receives visitors at 305 Fountain Circle, Huntsville, AL 35801 — (256) 427-5331.",
      notIncluded:
        "Electric meter connection charges by Huntsville Utilities, temporary construction pole deposits, and re-inspection fees for failed site visits.",
      workedExample: {
        scenario:
          "Residential electrical rewiring and 200-amp main service panel replacement valued at $5,200.",
        inputs: {
          valuationCents: 520_000,
        },
        notes:
          "Calculated using the municipal multiplier: $5,200 × 0.0055 = **$28.60**. Because this is below the city's mandatory minimum, the permit fee is floored at the **$50.00 minimum permit fee**.",
      },
      faqs: [
        {
          question: "Who can obtain an electrical permit in Huntsville?",
          answer:
            "Electrical permits must be pulled by a state-licensed electrical contractor who holds an active City of Huntsville business license.",
          sourceId: HSV_TRADE_SOURCE_KEY,
          attribution: "Huntsville Inspection Department Electrical Division",
        },
        {
          question: "Can trade permits be purchased online in Huntsville?",
          answer:
            "Yes, licensed electrical contractors can apply, pay, and schedule inspections directly through the City of Huntsville online permitting portal.",
          sourceId: HSV_TRADE_SOURCE_KEY,
          attribution: "Huntsville Permitting Portal",
        },
        {
          question: "What is the minimum electrical permit fee?",
          answer:
            "The minimum fee for an electrical permit in Huntsville is $50.00.",
          sourceId: HSV_TRADE_SOURCE_KEY,
          attribution: "Huntsville Fee Schedule",
        },
      ],
      seoTitle: "Huntsville AL Electrical Permit Cost & Inspection Guide",
      seoDescription:
        "City of Huntsville electrical permit costs: 0.0055 valuation multiplier with a $50 minimum fee. Online portal guidelines for Alabama contractors.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: HSV_LAST_VERIFIED,
    },
    {
      jurisdictionKey: HSV_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      slug: "plumbing-permit-cost",
      title: "Huntsville Plumbing Permit Cost",
      intro:
        "Plumbing permits in Huntsville are required for water lines, drainage systems, gas piping, and water heater replacements. The permit fee is assessed at **0.0055 times the plumbing valuation ($5.50 per $1,000)** with a standard **$50.00 minimum permit fee**.",
      localSummary:
        "The Inspection Department oversees plumbing and gas fitting code enforcement in accordance with the International Plumbing Code and International Fuel Gas Code. All work must be executed or supervised by a certified master plumber licensed in Alabama. Beyond the valuation formula, the City's trade schedule itemizes initial fixtures, additional fixtures, water heaters, and sewer lateral connections. Permits and inspections run through the ePlans portal; the department is at 305 Fountain Circle, Huntsville, AL 35801 — (256) 427-5331.",
      notIncluded:
        "Municipal water meter sets and sewer tap connection fees administered by Huntsville Utilities or Madison County water authorities.",
      workedExample: {
        scenario:
          "Complete bathroom addition plumbing rough-in and fixture installation valued at $7,500.",
        inputs: {
          valuationCents: 750_000,
        },
        notes:
          "Calculated at 0.0055 of project value: $7,500 × 0.0055 = **$41.25**. The permit fee defaults to the mandatory **$50.00 minimum permit floor**.",
      },
      faqs: [
        {
          question: "Is a plumbing permit required to replace a water heater in Huntsville?",
          answer:
            "Yes, a plumbing permit is required for water heater installations to ensure correct pressure relief valve piping, proper venting, and code-compliant electrical or gas connections.",
          sourceId: HSV_TRADE_SOURCE_KEY,
          attribution: "Huntsville Inspection Department Plumbing Division",
        },
        {
          question: "What is the fee for a plumbing permit in Huntsville?",
          answer:
            "The fee is calculated as 0.0055 times the contracting price, with a minimum fee of $50.00.",
          sourceId: HSV_TRADE_SOURCE_KEY,
          attribution: "Huntsville Inspection Fee Schedule",
        },
        {
          question: "Who can pull a plumbing permit in Huntsville?",
          answer:
            "Plumbing permits must be pulled by a master plumber certified by the State of Alabama Plumbers and Gas Fitters Examining Board.",
          sourceId: HSV_TRADE_SOURCE_KEY,
          attribution: "State of Alabama Plumbers and Gas Fitters Board",
        },
      ],
      seoTitle: "Huntsville AL Plumbing Permit Cost & Codes",
      seoDescription:
        "Calculate plumbing permit fees in Huntsville, AL: 0.0055 valuation multiplier with a $50 minimum fee. Requirements for Alabama master plumbers.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: HSV_LAST_VERIFIED,
    },
  ],

  verifications: [
    {
      entityType: "jurisdiction_profile",
      entityKey: HSV_KEYS.jurisdiction,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: HSV_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Alabama Expansion",
      sourceKey: HSV_BUILDING_SOURCE_KEY,
      notes: "Verified against Huntsville Inspection Department published fee guidelines.",
    },
    {
      entityType: "fee_schedule",
      entityKey: HSV_BUILDING_SOURCE_KEY,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: HSV_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Alabama Expansion",
      sourceKey: HSV_BUILDING_SOURCE_KEY,
      notes: "Verified 0.0055 multiplier, new single-family dwelling formula, and $50 minimum fee.",
    },
    {
      entityType: "permit_page",
      entityKey: "building-permit-cost",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: HSV_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Alabama Expansion",
      sourceKey: HSV_BUILDING_SOURCE_KEY,
      notes: "Passed editorial gate checks for Huntsville building permit page.",
    },
    {
      entityType: "permit_page",
      entityKey: "electrical-permit-cost",
      permitTypeKey: "electrical",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: HSV_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Alabama Expansion",
      sourceKey: HSV_TRADE_SOURCE_KEY,
      notes: "Passed editorial gate checks for Huntsville electrical permit page.",
    },
    {
      entityType: "permit_page",
      entityKey: "plumbing-permit-cost",
      permitTypeKey: "plumbing",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: HSV_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Alabama Expansion",
      sourceKey: HSV_TRADE_SOURCE_KEY,
      notes: "Passed editorial gate checks for Huntsville plumbing permit page.",
    },
  ],
};
