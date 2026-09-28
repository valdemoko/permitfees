import type { JurisdictionSeed } from "@/content/seed-types";
import {
  BHM_BUILDING_RULES,
  BHM_BUILDING_SOURCE_KEY,
  BHM_CRAFT_TRAINING_SOURCE_KEY,
  BHM_ELECTRICAL_RULES,
  BHM_FEE_EFFECTIVE_FROM,
  BHM_PLUMBING_RULES,
  BHM_TRADE_SOURCE_KEY,
} from "@/content/birmingham/fee-rules";

export const BHM_LAST_VERIFIED = "2026-09-25";

export const BHM_KEYS = {
  state: "al",
  county: "jefferson-county",
  jurisdiction: "birmingham",
  building: BHM_BUILDING_SOURCE_KEY,
  craftTraining: BHM_CRAFT_TRAINING_SOURCE_KEY,
  trade: BHM_TRADE_SOURCE_KEY,
} as const;

const state = {
  code: "AL",
  slug: "alabama",
  name: "Alabama",
  fipsCode: "01",
};

const county = {
  key: BHM_KEYS.county,
  slug: "jefferson-county",
  name: "Jefferson County",
  fipsCode: "01073",
};

const PEP_URL = "https://www.birminghamal.gov/pep";
const ACCELA_PORTAL_URL = "https://aca.accela.com/BIRMINGHAM/";
const CRAFT_TRAINING_URL = "https://finance.alabama.gov/";

export const birminghamSeed: JurisdictionSeed = {
  state,
  county,

  jurisdiction: {
    key: BHM_KEYS.jurisdiction,
    stateKey: BHM_KEYS.state,
    countyKey: BHM_KEYS.county,
    type: "city",
    slug: "birmingham",
    name: "Birmingham",
    officialName: "City of Birmingham — Department of Planning, Engineering & Permits",
    websiteUrl: PEP_URL,
    permitPortalUrl: ACCELA_PORTAL_URL,
    timezone: "America/Chicago",
    isActive: true,
  },

  departments: [
    {
      key: "birmingham-pep",
      jurisdictionKey: BHM_KEYS.jurisdiction,
      kind: "building",
      name: "Department of Planning, Engineering & Permits",
      phone: "(205) 254-2211",
      email: "pepinfo@birminghamal.gov",
      url: PEP_URL,
      addressLine: "710 20th Street North, Room 210, City Hall, Birmingham, AL 35203",
      hours: "Monday – Friday, 8:00 a.m. – 5:00 p.m. CT",
      notes:
        "Administers technical codes, reviews building plans, issues construction permits, and conducts municipal inspections within the City of Birmingham corporate limits.",
    },
  ],

  sources: [
    {
      key: BHM_BUILDING_SOURCE_KEY,
      jurisdictionKey: BHM_KEYS.jurisdiction,
      title: "City of Birmingham Building Permit Fee Schedule & Technical Code",
      url: PEP_URL,
      sourceType: "municipal_website",
      issuingAuthority: "City of Birmingham Department of Planning, Engineering & Permits",
      authorityKind: "city",
      isPrimary: true,
      documentDate: "2026-01-01",
      effectiveFrom: BHM_FEE_EFFECTIVE_FROM,
      retrievedAt: "2026-09-25",
      lastVerifiedAt: BHM_LAST_VERIFIED,
      notes:
        "Building permits are calculated at $9.50 per $1,000 of construction valuation with a standard $125.00 minimum permit fee.",
    },
    {
      key: BHM_CRAFT_TRAINING_SOURCE_KEY,
      jurisdictionKey: BHM_KEYS.jurisdiction,
      title: "Alabama Craft Training Fund Mandate (Code of Alabama Title 41)",
      url: CRAFT_TRAINING_URL,
      sourceType: "state_agency",
      issuingAuthority: "Alabama Department of Finance",
      authorityKind: "state",
      // The Department of Finance is the state agency that administers the Craft
      // Training Fund mandate (Code of Alabama Title 41) and is the authority the
      // $1.00 per $1,000 surcharge is remitted to. The AL-CRAFT-TRAINING fee rule
      // cites this source, and the schema's invariant is that a rule's source is
      // primary, so it is recorded as such.
      isPrimary: true,
      documentDate: "2024-01-01",
      effectiveFrom: "2024-01-01",
      retrievedAt: "2026-09-25",
      lastVerifiedAt: BHM_LAST_VERIFIED,
      notes:
        "State law requires municipalities to collect an additional $1.00 per $1,000 of construction valuation on commercial projects for the Alabama Craft Training Fund.",
    },
    {
      key: BHM_TRADE_SOURCE_KEY,
      jurisdictionKey: BHM_KEYS.jurisdiction,
      title: "Birmingham Citizen Access Portal — Trade Permit Fee Schedule",
      url: ACCELA_PORTAL_URL,
      sourceType: "permit_portal",
      issuingAuthority: "City of Birmingham Department of Planning, Engineering & Permits",
      authorityKind: "city",
      isPrimary: true,
      documentDate: "2026-01-01",
      effectiveFrom: BHM_FEE_EFFECTIVE_FROM,
      retrievedAt: "2026-09-25",
      lastVerifiedAt: BHM_LAST_VERIFIED,
      notes:
        "Electrical, plumbing, and mechanical permits are issued through the Birmingham Accela portal with a base minimum fee of $100.00.",
    },
  ],

  permitTypes: [],
  projectTypes: [],

  jurisdictionPermitTypes: [
    {
      jurisdictionKey: BHM_KEYS.jurisdiction,
      permitTypeKey: "building",
      isAvailable: true,
      localName: "Building Permit",
      officialUrl: PEP_URL,
      notes:
        "Assessed on total project valuation at $9.50 per $1,000. Plan review is assessed at 50% of the permit fee when plan review is required. Minimum fee is $125.00.",
    },
    {
      jurisdictionKey: BHM_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      isAvailable: true,
      localName: "Electrical Permit",
      officialUrl: ACCELA_PORTAL_URL,
      notes:
        "Standalone permit pulled by state-licensed electrical contractors. Minimum fee is $100.00, scaled with project valuation at $10.00 per $1,000.",
    },
    {
      jurisdictionKey: BHM_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      isAvailable: true,
      localName: "Plumbing Permit",
      officialUrl: ACCELA_PORTAL_URL,
      notes:
        "Standalone permit pulled by state-certified master plumbers. Minimum fee is $100.00, scaled with project valuation at $10.00 per $1,000.",
    },
  ],

  feeSchedules: [
    {
      key: BHM_BUILDING_SOURCE_KEY,
      jurisdictionKey: BHM_KEYS.jurisdiction,
      sourceKey: BHM_BUILDING_SOURCE_KEY,
      title: "Birmingham PEP Official Construction Fee Schedule (2026)",
      officialUrl: PEP_URL,
      effectiveFrom: BHM_FEE_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: BHM_LAST_VERIFIED,
      notes:
        "Published fee schedule for structural, alteration, and trade permits within the City of Birmingham.",
    },
  ],

  feeRules: [
    ...BHM_BUILDING_RULES.map((rule) => ({
      jurisdictionKey: BHM_KEYS.jurisdiction,
      permitTypeKey: "building",
      scheduleKey: BHM_BUILDING_SOURCE_KEY,
      rule,
    })),
    ...BHM_ELECTRICAL_RULES.map((rule) => ({
      jurisdictionKey: BHM_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      scheduleKey: BHM_BUILDING_SOURCE_KEY,
      rule,
    })),
    ...BHM_PLUMBING_RULES.map((rule) => ({
      jurisdictionKey: BHM_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      scheduleKey: BHM_BUILDING_SOURCE_KEY,
      rule,
    })),
  ],

  requirements: [
    {
      jurisdictionKey: BHM_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "document",
      title: "Architectural Construction Plans",
      description:
        "Two complete sets of architectural plans and structural calculations, drawn to scale and stamped by an Alabama-registered architect or professional engineer.",
      isMandatory: true,
      sortOrder: 1,
      sourceKey: BHM_BUILDING_SOURCE_KEY,
      lastVerifiedAt: BHM_LAST_VERIFIED,
    },
    {
      jurisdictionKey: BHM_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "license",
      title: "Alabama General Contractor License",
      description:
        "Commercial work exceeding $50,000 or residential work exceeding $10,000 requires verification of licensure with the Alabama Licensing Board for General Contractors.",
      isMandatory: true,
      sortOrder: 2,
      sourceKey: BHM_BUILDING_SOURCE_KEY,
      lastVerifiedAt: BHM_LAST_VERIFIED,
    },
    {
      jurisdictionKey: BHM_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      requirementType: "license",
      title: "Alabama Electrical Contractor License",
      description:
        "Electrical permits must be pulled by a contractor licensed with the Alabama Electrical Contractors Board.",
      isMandatory: true,
      sortOrder: 3,
      sourceKey: BHM_TRADE_SOURCE_KEY,
      lastVerifiedAt: BHM_LAST_VERIFIED,
    },
    {
      jurisdictionKey: BHM_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      requirementType: "license",
      title: "Alabama Master Plumber Certification",
      description:
        "Plumbing permits must be pulled by a certified master plumber licensed with the State of Alabama Plumbers and Gas Fitters Examining Board.",
      isMandatory: true,
      sortOrder: 4,
      sourceKey: BHM_TRADE_SOURCE_KEY,
      lastVerifiedAt: BHM_LAST_VERIFIED,
    },
  ],

  profile: {
    jurisdictionKey: BHM_KEYS.jurisdiction,
    headline: "Birmingham, Alabama Permit Fees & Municipal Building Code",
    summary:
      "The City of Birmingham Department of Planning, Engineering & Permits (PEP), in Room 210 of City Hall at 710 20th Street North, regulates building, structural, electrical, plumbing, and mechanical construction. Building permit fees are calculated on the declared valuation of construction at $9.50 per $1,000 of value with a $125.00 city-wide minimum, plan review adds 50% of the permit fee where architectural or engineering review applies — and on nonresidential work, Alabama state law adds a $1.00 per $1,000 Craft Training Fund collection, bringing the effective commercial rate to $10.50 per $1,000. Standalone trade permits carry a $100.00 minimum.",
    localContext:
      "Birmingham enforces the International Building Code (IBC) and International Residential Code (IRC) with local municipal amendments adopted under Title 4 of the General Code, alongside Code of Alabama 1975 Title 34 Chapter 8 at the state layer. The Department of Planning, Engineering & Permits (PEP) exercises jurisdiction within the municipal limits of the City of Birmingham, with digital plan review and inspection scheduling through the City's Accela portal.\n\nPermit applicants must secure individual standalone permits for electrical, plumbing, and mechanical scopes, which are pulled by state-licensed trade contractors — electrical contractors licensed by the state, plumbing by master plumbers certified with the Alabama Plumbers and Gas Fitters Examining Board. Unincorporated parts of Jefferson County and surrounding municipalities like Hoover or Vestavia Hills operate under their own separate permitting authorities, so addresses just outside city limits price very differently.\n\nThe Craft Training Fund line is the fee schedule's distinguishing feature: it is a state mandate (collected under Code of Alabama Title 41), not a City fee, and it applies only to nonresidential construction — a $500,000 commercial build pays $500 more than the same project priced as residential.",
    valuationBasis:
      "Valuation is defined as the total fair market value of all construction work, including materials, labor, overhead, and contractor profit, regardless of whether labor is contracted or provided by the property owner.",
    notIncluded:
      "These municipal figures cover the core building permit, plan examination, and the state Craft Training Fund collection on commercial work. They exclude:\n\n- **Right-of-way and street occupancy permits** administered by the City Engineering division.\n- **Grading and site development permits** issued under Title 4, Chapter 7 of the Birmingham General Code.\n- **Sewer impact fees and tap permits** assessed and collected directly by Jefferson County Environmental Services.\n- **Fire sprinkler and life-safety system engineering reviews** handled by Birmingham Fire and Rescue Service.",
    seoTitle: "Birmingham, AL Permit Fees | Official Fee Schedule & Cost Calculator",
    seoDescription:
      "Find official permit costs in Birmingham, AL: $9.50 per $1,000 valuation ($125 min), 50% plan review, +$1.00 per $1,000 state Craft Training Fund on commercial, $100 trade minimums.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: BHM_LAST_VERIFIED,
  },

  permitPages: [
    {
      jurisdictionKey: BHM_KEYS.jurisdiction,
      permitTypeKey: "building",
      slug: "building-permit-cost",
      title: "Birmingham Building Permit Cost",
      intro:
        "A City of Birmingham building permit is priced directly from the **valuation of the construction work**, established at **$9.50 per $1,000 of declared project value** with a city-wide **minimum fee of $125.00**. Projects requiring engineering or architectural plan examination also incur a **plan review fee calculated as 50% of the building permit fee**. On commercial construction, Alabama state law requires the collection of an additional **$1.00 per $1,000 valuation** for the Alabama Craft Training Fund.",
      localSummary:
        "Building permits in Birmingham are issued by the Department of Planning, Engineering & Permits located in Room 210 of City Hall. Residential remodeling, room additions, roofing, structural repairs, and new commercial developments all require building permits before construction begins. The city uses the Accela Citizen Access portal for digital plan review submissions and inspection scheduling.",
      notIncluded:
        "This estimate covers the municipal building permit and standard plan review. It excludes:\n\n- **Trade permits** (electrical, plumbing, and mechanical must be pulled separately by licensed contractors).\n- **Site development and grading permits** under Title 4, Chapter 7 of the General Code.\n- **Jefferson County Health Department food facility permits** for restaurant and hospitality buildouts.\n- **Fire sprinkler and alarm plan review fees** assessed by Birmingham Fire and Rescue Service.",
      workedExample: {
        scenario:
          "A residential single-family home addition with a total estimated construction valuation of $85,000 in Birmingham, AL.",
        inputs: {
          valuationCents: 8_500_000,
          squareFootage: 650,
        },
        notes:
          "The base building permit fee is calculated as $9.50 × 85 ($1,000 increments) = **$807.50**, exceeding the $125.00 city minimum. The plan review fee is 50% of the permit fee ($807.50 × 0.50) = **$403.75**. The total municipal fee for the building permit and plan examination is **$1,211.25**.",
      },
      faqs: [
        {
          question: "How is a Birmingham building permit fee calculated?",
          answer:
            "Building permit fees are calculated based on the total cost of construction (valuation) at a rate of $9.50 per $1,000. If plans require departmental examination, a plan review fee equal to 50% of the permit fee is added. The minimum permit fee is $125.00.",
          sourceId: BHM_BUILDING_SOURCE_KEY,
          attribution: "City of Birmingham Department of Planning, Engineering & Permits",
        },
        {
          question: "What is the Alabama Craft Training Fund fee?",
          answer:
            "Under the Code of Alabama 1975, all nonresidential (commercial) construction permits must pay an additional state surcharge of $1.00 per $1,000 of construction valuation, collected by the City of Birmingham and remitted to the Alabama Department of Finance.",
          sourceId: BHM_CRAFT_TRAINING_SOURCE_KEY,
          attribution: "Code of Alabama 1975 Title 41",
        },
        {
          question: "When is a general contractor license required in Birmingham?",
          answer:
            "According to Alabama state regulations and Birmingham PEP rules, any commercial construction exceeding $50,000 or residential home construction exceeding $10,000 requires a licensed general contractor registered with the State Licensing Board.",
          sourceId: BHM_BUILDING_SOURCE_KEY,
          attribution: "Alabama Licensing Board for General Contractors",
        },
        {
          question: "Can homeowners pull their own building permits in Birmingham?",
          answer:
            "Homeowners may pull a building permit for their own primary residential property, provided they sign an owner-builder affidavit confirming they will supervise the work and not rent, sell, or lease the property within one year.",
          sourceId: BHM_BUILDING_SOURCE_KEY,
          attribution: "City of Birmingham PEP Homeowner Permitting Policy",
        },
      ],
      seoTitle: "Birmingham AL Building Permit Cost (Valuation & Plan Review)",
      seoDescription:
        "Calculate City of Birmingham building permit costs: $9.50 per $1,000 valuation, $125 minimum fee, 50% plan review, and Alabama Craft Training fees.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: BHM_LAST_VERIFIED,
    },
    {
      jurisdictionKey: BHM_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      slug: "electrical-permit-cost",
      title: "Birmingham Electrical Permit Cost",
      intro:
        "Electrical permits in the City of Birmingham are issued as **standalone trade permits** to licensed electrical contractors. Permit fees are calculated on the declared electrical contract valuation at a rate of **$10.00 per $1,000 of work** for major works — the same schedule keeps flat itemized tiers for minor items — subject to a **minimum permit fee of $100.00**. Electrical work must comply with the National Electrical Code (NEC) as locally adopted.",
      localSummary:
        "All new electrical installations, service upgrades, rewiring, and subpanel installations in Birmingham require an electrical permit. Permits must be applied for through the Birmingham Accela portal, and Planning, Engineering & Permits handles applications and inspections from Room 210, City Hall, 710 20th Street North, at (205) 254-2211. Rough-in and final inspections must be passed before power authorization is issued to Alabama Power.",
      notIncluded:
        "Utility connection charges by Alabama Power, meter reconnection fees, low-voltage telecommunication permits under separate registration, and after-hours inspection fees.",
      workedExample: {
        scenario:
          "An electrical service upgrade to 200 amps with wiring for a home addition, valued at $6,500.",
        inputs: {
          valuationCents: 650_000,
        },
        notes:
          "The electrical permit valuation rate is $10.00 × 7 ($1,000 units rounded up) = **$70.00**. Because this is below the city's trade minimum of $100.00, the final permit fee charged is the **$100.00 minimum floor**.",
      },
      faqs: [
        {
          question: "Who can pull an electrical permit in Birmingham?",
          answer:
            "Electrical permits in Birmingham must be pulled by an electrical contractor licensed by the Alabama Electrical Contractors Board and registered with the City of Birmingham.",
          sourceId: BHM_TRADE_SOURCE_KEY,
          attribution: "Birmingham PEP Electrical Division",
        },
        {
          question: "What is the minimum electrical permit fee?",
          answer:
            "The minimum fee for an electrical permit in Birmingham is $100.00, which covers standard review and single inspection phases.",
          sourceId: BHM_TRADE_SOURCE_KEY,
          attribution: "City of Birmingham PEP Fee Schedule",
        },
        {
          question: "How are inspections scheduled for electrical work?",
          answer:
            "Inspections can be scheduled online via the Birmingham Citizen Access (Accela) portal or by calling the PEP inspection line with the permit tracking number.",
          sourceId: BHM_TRADE_SOURCE_KEY,
          attribution: "City of Birmingham Citizen Access Portal",
        },
      ],
      seoTitle: "Birmingham AL Electrical Permit Cost & Requirements",
      seoDescription:
        "Find electrical permit fees in Birmingham, AL: $10 per $1,000 valuation with a $100 minimum fee. Requirements for licensed Alabama contractors.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: BHM_LAST_VERIFIED,
    },
    {
      jurisdictionKey: BHM_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      slug: "plumbing-permit-cost",
      title: "Birmingham Plumbing Permit Cost",
      intro:
        "Plumbing permits in Birmingham are issued to state-certified master plumbers for water, drain, waste, and gas line installations. The fee is assessed based on the valuation of plumbing work at **$10.00 per $1,000 of job valuation**, anchored by a **minimum permit fee of $100.00**. Work must comply with the International Plumbing Code (IPC).",
      localSummary:
        "Plumbing permits are required for water heater replacements, repiping, fixture installations, and sewer lateral repairs. The City's schedule prices this work on the declared job valuation with the same $100.00 floor as other standalone trade permits. PEP plumbing inspectors verify proper venting, backflow prevention, and pressure testing prior to drywall concealment and final sign-off. Apply through the Birmingham Accela portal; PEP sits in Room 210, City Hall, 710 20th Street North, at (205) 254-2211.",
      notIncluded:
        "Sewer impact and tap fees charged by the Jefferson County Environmental Services Department (Sewer Department) and water meter connection fees charged by the Birmingham Water Works Board (BWWB).",
      workedExample: {
        scenario:
          "Plumbing repiping and new bathroom plumbing installation valued at $8,000.",
        inputs: {
          valuationCents: 800_000,
        },
        notes:
          "Calculated at $10.00 per $1,000 of valuation: 8 × $10.00 = **$80.00**. The permit fee is raised to the city's mandatory **$100.00 minimum permit floor**.",
      },
      faqs: [
        {
          question: "Does replacing a water heater require a permit in Birmingham?",
          answer:
            "Yes, water heater replacements require a plumbing permit and subsequent inspection by the Department of Planning, Engineering & Permits to verify temperature-pressure relief valve discharge and fuel/electrical connections.",
          sourceId: BHM_TRADE_SOURCE_KEY,
          attribution: "Birmingham PEP Plumbing Division",
        },
        {
          question: "What is the minimum plumbing permit fee in Birmingham?",
          answer:
            "The minimum fee for a standalone plumbing permit in the City of Birmingham is $100.00.",
          sourceId: BHM_TRADE_SOURCE_KEY,
          attribution: "Birmingham PEP Schedule of Fees",
        },
        {
          question: "Who regulates sewer connections in Birmingham?",
          answer:
            "While the City of Birmingham inspects the building drain and yard plumbing, the main sewer collection system and tap connection permits are administered by Jefferson County Environmental Services.",
          sourceId: BHM_BUILDING_SOURCE_KEY,
          attribution: "Jefferson County Environmental Services",
        },
      ],
      seoTitle: "Birmingham AL Plumbing Permit Cost & Regulations",
      seoDescription:
        "City of Birmingham plumbing permit fees: $10 per $1,000 valuation, $100 minimum. Learn requirements for master plumbers and water heater permits.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: BHM_LAST_VERIFIED,
    },
  ],

  verifications: [
    {
      entityType: "jurisdiction_profile",
      entityKey: BHM_KEYS.jurisdiction,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: BHM_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Alabama Expansion",
      sourceKey: BHM_BUILDING_SOURCE_KEY,
      notes: "Verified against Birmingham Department of Planning, Engineering & Permits fee schedules.",
    },
    {
      entityType: "fee_schedule",
      entityKey: BHM_BUILDING_SOURCE_KEY,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: BHM_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Alabama Expansion",
      sourceKey: BHM_BUILDING_SOURCE_KEY,
      notes: "Verified rate of $9.50/$1,000, $125 minimum, and 50% plan review fee.",
    },
    {
      entityType: "permit_page",
      entityKey: "building-permit-cost",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: BHM_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Alabama Expansion",
      sourceKey: BHM_BUILDING_SOURCE_KEY,
      notes: "Passed editorial gate checks for building permit page.",
    },
    {
      entityType: "permit_page",
      entityKey: "electrical-permit-cost",
      permitTypeKey: "electrical",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: BHM_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Alabama Expansion",
      sourceKey: BHM_TRADE_SOURCE_KEY,
      notes: "Passed editorial gate checks for electrical permit page.",
    },
    {
      entityType: "permit_page",
      entityKey: "plumbing-permit-cost",
      permitTypeKey: "plumbing",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: BHM_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Alabama Expansion",
      sourceKey: BHM_TRADE_SOURCE_KEY,
      notes: "Passed editorial gate checks for plumbing permit page.",
    },
  ],
};
