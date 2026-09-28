import type { JurisdictionSeed } from "@/content/seed-types";
import {
  FB_BUILDING_RULES,
  FB_BUILDING_SOURCE_KEY,
  FB_ELECTRICAL_RULES,
  FB_ELECTRICAL_SOURCE_KEY,
  FB_FEE_EFFECTIVE_FROM,
  FB_PLUMBING_RULES,
  FB_PLUMBING_SOURCE_KEY,
} from "@/content/fairbanks/fee-rules";

export const FB_LAST_VERIFIED = "2026-09-25";

export const FB_KEYS = {
  state: "ak",
  county: "fairbanks-north-star-borough",
  jurisdiction: "fairbanks",
  building: FB_BUILDING_SOURCE_KEY,
  electrical: FB_ELECTRICAL_SOURCE_KEY,
  plumbing: FB_PLUMBING_SOURCE_KEY,
} as const;

const state = {
  code: "AK",
  slug: "alaska",
  name: "Alaska",
  fipsCode: "02",
};

const county = {
  key: FB_KEYS.county,
  slug: "fairbanks-north-star-borough",
  name: "Fairbanks North Star Borough",
  fipsCode: "02090",
};

const CITY_URL = "https://www.fairbanksalaska.us";
const BUILDING_DEPT_URL =
  "https://www.fairbanksalaska.us/community-development/building-department";
const BUILDING_FEE_URL =
  "https://files.aptuitivcdn.com/K9gxWNkmZ2-1856/docs/Building/building_permit_fees.pdf";
const ELECTRICAL_FEE_URL =
  "https://files.aptuitivcdn.com/K9gxWNkmZ2-1856/docs/Building/electrical_permit_fees.pdf";
const PLUMBING_FEE_URL =
  "https://files.aptuitivcdn.com/K9gxWNkmZ2-1856/docs/Building/plumbing_permit_fees.pdf";

export const fairbanksSeed: JurisdictionSeed = {
  state,
  county,

  jurisdiction: {
    key: FB_KEYS.jurisdiction,
    stateKey: FB_KEYS.state,
    countyKey: FB_KEYS.county,
    type: "city",
    slug: "fairbanks",
    name: "Fairbanks",
    officialName: "City of Fairbanks — Community Development Department",
    websiteUrl: CITY_URL,
    permitPortalUrl: BUILDING_DEPT_URL,
    timezone: "America/Anchorage",
    isActive: true,
  },

  departments: [
    {
      key: "fairbanks-building-dept",
      jurisdictionKey: FB_KEYS.jurisdiction,
      kind: "building",
      name: "City of Fairbanks Building Department",
      phone: "(907) 459-6713",
      email: null,
      url: BUILDING_DEPT_URL,
      addressLine: "800 Cushman Street, Fairbanks, AK 99701",
      hours: "Monday – Friday, 8:00 a.m. – 4:30 p.m. AKDT",
      notes:
        "The Building Department within the Community Development Department administers the Fairbanks Administrative Code Chapter 10 building codes, issues building, electrical, and plumbing permits, and conducts inspections within the City of Fairbanks.",
    },
  ],

  sources: [
    {
      key: FB_BUILDING_SOURCE_KEY,
      jurisdictionKey: FB_KEYS.jurisdiction,
      title:
        "City of Fairbanks Administrative Code Chapter 10, Table 3-A (Building Permit Fees)",
      url: BUILDING_FEE_URL,
      sourceType: "fee_schedule_pdf",
      issuingAuthority: "City of Fairbanks Building Department",
      authorityKind: "city",
      isPrimary: true,
      documentDate: "2020-04-17",
      effectiveFrom: FB_FEE_EFFECTIVE_FROM,
      retrievedAt: "2026-09-25",
      lastVerifiedAt: FB_LAST_VERIFIED,
      notes:
        "Table 3-A establishes building permit fees on a valuation ladder from $17.00 flat (up to $500) to $5,305 + $4.60/$1,000 (over $1,000,000). A plan review fee of 75% of the building permit fee applies per Section 304.2. Adopted under Ordinance No. 5800 and updated by Ordinance No. 6099/6162.",
    },
    {
      key: FB_ELECTRICAL_SOURCE_KEY,
      jurisdictionKey: FB_KEYS.jurisdiction,
      title:
        "City of Fairbanks Administrative Code Chapter 10, Table 3-B (Electrical Permit Fees)",
      url: ELECTRICAL_FEE_URL,
      sourceType: "fee_schedule_pdf",
      issuingAuthority: "City of Fairbanks Building Department",
      authorityKind: "city",
      isPrimary: true,
      documentDate: "2020-04-17",
      effectiveFrom: FB_FEE_EFFECTIVE_FROM,
      retrievedAt: "2026-09-25",
      lastVerifiedAt: FB_LAST_VERIFIED,
      notes:
        "Table 3-B establishes electrical permit fees: $35.00 issuance fee plus unit fees (e.g., $255.00 flat fee for new single-family dwelling wiring, service equipment, and attached garages).",
    },
    {
      key: FB_PLUMBING_SOURCE_KEY,
      jurisdictionKey: FB_KEYS.jurisdiction,
      title:
        "City of Fairbanks Administrative Code Chapter 10, Table 3-D (Plumbing Permit Fees)",
      url: PLUMBING_FEE_URL,
      sourceType: "fee_schedule_pdf",
      issuingAuthority: "City of Fairbanks Building Department",
      authorityKind: "city",
      isPrimary: true,
      documentDate: "2020-04-17",
      effectiveFrom: FB_FEE_EFFECTIVE_FROM,
      retrievedAt: "2026-09-25",
      lastVerifiedAt: FB_LAST_VERIFIED,
      notes:
        "Table 3-D establishes plumbing permit fees: $35.00 issuance fee plus $15.00 per fixture or trap installed.",
    },
  ],

  permitTypes: [],
  projectTypes: [],

  jurisdictionPermitTypes: [
    {
      jurisdictionKey: FB_KEYS.jurisdiction,
      permitTypeKey: "building",
      isAvailable: true,
      localName: "Building Permit",
      officialUrl: BUILDING_FEE_URL,
      notes:
        "Assessed on construction valuation using a tiered ladder (Table 3-A). Plan review fee is 75% of the building permit fee. Minimum fee is $17.00 for work valued up to $500.00.",
    },
    {
      jurisdictionKey: FB_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      isAvailable: true,
      localName: "Electrical Permit",
      officialUrl: ELECTRICAL_FEE_URL,
      notes:
        "Standalone electrical permit assessed under Table 3-B: $35.00 issuance fee plus unit fees. New single-family dwellings pay a flat $255.00 unit fee covering all wiring and service.",
    },
    {
      jurisdictionKey: FB_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      isAvailable: true,
      localName: "Plumbing Permit",
      officialUrl: PLUMBING_FEE_URL,
      notes:
        "Standalone plumbing permit assessed under Table 3-D: $35.00 issuance fee plus $15.00 per plumbing fixture or trap.",
    },
  ],

  feeSchedules: [
    {
      key: FB_BUILDING_SOURCE_KEY,
      jurisdictionKey: FB_KEYS.jurisdiction,
      sourceKey: FB_BUILDING_SOURCE_KEY,
      title: "City of Fairbanks Official Building Permit Fee Schedule (Table 3-A)",
      officialUrl: BUILDING_FEE_URL,
      effectiveFrom: FB_FEE_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: FB_LAST_VERIFIED,
      notes:
        "Tiered valuation-based building permit fee schedule effective April 17, 2020 per City of Fairbanks Administrative Code Chapter 10.",
    },
    {
      key: FB_ELECTRICAL_SOURCE_KEY,
      jurisdictionKey: FB_KEYS.jurisdiction,
      sourceKey: FB_ELECTRICAL_SOURCE_KEY,
      title: "City of Fairbanks Official Electrical Permit Fee Schedule (Table 3-B)",
      officialUrl: ELECTRICAL_FEE_URL,
      effectiveFrom: FB_FEE_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: FB_LAST_VERIFIED,
      notes:
        "Electrical permit fee schedule: $35.00 permit issuance fee plus per-unit fees for specific electrical installations.",
    },
    {
      key: FB_PLUMBING_SOURCE_KEY,
      jurisdictionKey: FB_KEYS.jurisdiction,
      sourceKey: FB_PLUMBING_SOURCE_KEY,
      title: "City of Fairbanks Official Plumbing Permit Fee Schedule (Table 3-D)",
      officialUrl: PLUMBING_FEE_URL,
      effectiveFrom: FB_FEE_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: FB_LAST_VERIFIED,
      notes:
        "Plumbing permit fee schedule: $35.00 permit issuance fee plus $15.00 per fixture or trap.",
    },
  ],

  feeRules: [
    ...FB_BUILDING_RULES.map((rule) => ({
      jurisdictionKey: FB_KEYS.jurisdiction,
      permitTypeKey: "building",
      scheduleKey: FB_BUILDING_SOURCE_KEY,
      rule,
    })),
    ...FB_ELECTRICAL_RULES.map((rule) => ({
      jurisdictionKey: FB_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      scheduleKey: FB_ELECTRICAL_SOURCE_KEY,
      rule,
    })),
    ...FB_PLUMBING_RULES.map((rule) => ({
      jurisdictionKey: FB_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      scheduleKey: FB_PLUMBING_SOURCE_KEY,
      rule,
    })),
  ],

  requirements: [
    {
      jurisdictionKey: FB_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "document",
      title: "Construction Plans & Energy Compliance Documentation",
      description:
        "Complete architectural and structural plans drawn to scale, site plan showing property lines and setbacks, and Alaska Building Energy Efficiency Standards (BEES) compliance documentation.",
      isMandatory: true,
      sortOrder: 1,
      sourceKey: FB_BUILDING_SOURCE_KEY,
      lastVerifiedAt: FB_LAST_VERIFIED,
    },
    {
      jurisdictionKey: FB_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "license",
      title: "Alaska Contractor Registration",
      description:
        "General contractors must hold a current Alaska Contractor License and be registered with the City of Fairbanks. Owner-builders may apply for a permit on their primary single-family residence.",
      isMandatory: true,
      sortOrder: 2,
      sourceKey: FB_BUILDING_SOURCE_KEY,
      lastVerifiedAt: FB_LAST_VERIFIED,
    },
    {
      jurisdictionKey: FB_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "energy_code",
      title: "Alaska BEES Cold-Climate Compliance",
      description:
        "Construction must satisfy the Alaska Building Energy Efficiency Standards (BEES) addressing sub-arctic thermal envelope requirements, vapor retarders, and foundation frost protection for Interior Alaska climate zone.",
      isMandatory: true,
      sortOrder: 3,
      sourceKey: FB_BUILDING_SOURCE_KEY,
      lastVerifiedAt: FB_LAST_VERIFIED,
    },
    {
      jurisdictionKey: FB_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      requirementType: "license",
      title: "Alaska Electrical Administrator License",
      description:
        "Electrical permits must be applied for by a contractor with an assigned Alaska licensed electrical administrator. The administrator's license number is required on the permit application.",
      isMandatory: true,
      sortOrder: 4,
      sourceKey: FB_ELECTRICAL_SOURCE_KEY,
      lastVerifiedAt: FB_LAST_VERIFIED,
    },
    {
      jurisdictionKey: FB_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      requirementType: "license",
      title: "Alaska Licensed Plumbing / Mechanical Administrator",
      description:
        "Plumbing permits must be pulled by a contractor employing a state-licensed journeyman or master plumber as the designated administrator. License number is required on the application.",
      isMandatory: true,
      sortOrder: 5,
      sourceKey: FB_PLUMBING_SOURCE_KEY,
      lastVerifiedAt: FB_LAST_VERIFIED,
    },
  ],

  profile: {
    jurisdictionKey: FB_KEYS.jurisdiction,
    headline: "Fairbanks, Alaska Permit Fees & Building Code",
    summary:
      "The City of Fairbanks Building Department administers permits under Administrative Code Chapter 10. Building permit fees follow a tiered valuation ladder (Table 3-A) starting at $17.00 for work up to $500 and scaling to $5,305 + $4.60 per $1,000 over $1,000,000. A mandatory plan review fee equal to 75% of the building permit fee applies. Electrical permits carry a $35.00 issuance fee plus unit fees, and plumbing permits charge $35.00 plus $15.00 per fixture.",
    localContext:
      "Fairbanks is Interior Alaska's largest city, located in Fairbanks North Star Borough at 64°N latitude, well within the subarctic climate zone. Construction here must address permafrost conditions, extreme temperature swings (from −50°F winters to 90°F summers), and mandatory frost-depth foundation design per the Alaska Building Energy Efficiency Standards (BEES).\n\nThe City of Fairbanks Building Department reviews and inspects all construction within city limits. Fairbanks North Star Borough (FNSB) separately regulates unincorporated borough areas; only city-permit projects are covered here. Electrical and plumbing contractors must hold Alaska state licenses and assign a licensed administrator to each project.",
    valuationBasis:
      "Valuation is the total estimated fair-market cost of the construction work, including all labor, materials, and permanently installed equipment. The Building Official may adjust submitted valuations to reflect current regional building cost data.",
    notIncluded:
      "These municipal fees cover the core building permit and trade permit fees issued by the City of Fairbanks Building Department. They exclude:\n\n- **Fairbanks North Star Borough permits** for work in unincorporated borough areas.\n- **State of Alaska DEC permits** for on-site wastewater systems and private wells.\n- **Alaska DOT right-of-way permits** for work in state-managed road corridors.\n- **Fire suppression system plan reviews** from the Fairbanks Fire Department.\n- **Zoning variance and conditional use applications** from the Planning Department.",
    seoTitle: "Fairbanks AK Permit Fees | Official Fee Schedule & Cost Calculator",
    seoDescription:
      "Calculate City of Fairbanks building permit costs. Tiered valuation fee table + 75% plan review. Electrical: $35 + unit fees. Plumbing: $35 + $15/fixture.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: FB_LAST_VERIFIED,
  },

  permitPages: [
    {
      jurisdictionKey: FB_KEYS.jurisdiction,
      permitTypeKey: "building",
      slug: "building-permit-cost",
      title: "Fairbanks Building Permit Cost",
      intro:
        "A City of Fairbanks building permit is calculated from **construction valuation** using Table 3-A's tiered fee schedule. Fees start at **$17.00 flat** for work valued up to $500.00 and scale to **$5,305.00 + $4.60 per $1,000** for projects over $1,000,000. In addition, a mandatory **plan review fee equal to 75% of the building permit fee** is assessed for all projects requiring plan examination.",
      localSummary:
        "Building permits in Fairbanks are processed at the Community Development Department on Cushman Street. Permits are required for new construction, additions, structural alterations, accessory structures over 200 sq ft, and major mechanical or roofing work. All plans must account for Interior Alaska's extreme subarctic climate, permafrost conditions, and the heavy snow load requirements of ASCE 7 for the Fairbanks area.",
      notIncluded:
        "This estimate covers the City of Fairbanks building permit and plan review fees only. It excludes:\n\n- **Electrical, plumbing, and mechanical permits**, which are issued separately.\n- **Fairbanks North Star Borough permits** for projects outside city limits.\n- **State DEC and ADEC wastewater permits** for on-site septic systems.\n- **Fire Department plan review fees** for commercial fire suppression systems.\n- **Zoning and land use review fees** from the Planning Department.",
      workedExample: {
        scenario:
          "A new detached residential garage in Fairbanks, AK with an estimated construction valuation of $45,000.",
        inputs: {
          valuationCents: 4_500_000,
          squareFootage: 576,
        },
        notes:
          "For a $45,000 valuation, Table 3-A bracket $25,000.01–$50,000 applies: **$280.00** for the first $25,000 plus $7.00 per $1,000 for the remaining $20,000 ($140.00) = **$420.00** building permit fee. The plan review fee is 75% of $420.00 = **$315.00**. Total municipal permit cost: **$735.00**.",
      },
      faqs: [
        {
          question: "How is a Fairbanks building permit fee calculated?",
          answer:
            "The City of Fairbanks uses a tiered valuation table (Table 3-A). You locate the bracket that contains your total project construction valuation, pay the bracket's base amount, and add the incremental rate for the value above the bracket floor. A plan review fee equal to 75% of the building permit fee is added for all projects requiring plan examination.",
          sourceId: FB_BUILDING_SOURCE_KEY,
          attribution: "City of Fairbanks Administrative Code Chapter 10, Table 3-A",
        },
        {
          question: "What is the minimum building permit fee in Fairbanks?",
          answer:
            "The minimum building permit fee for work valued from $1.00 to $500.00 is $17.00 (flat fee per Table 3-A).",
          sourceId: FB_BUILDING_SOURCE_KEY,
          attribution: "City of Fairbanks Table 3-A",
        },
        {
          question: "How much is the plan review fee in Fairbanks?",
          answer:
            "The plan review fee is 75% of the building permit fee, as established by Administrative Code Section 304.2. This fee is collected when plans are submitted and is separate from the permit issuance fee.",
          sourceId: FB_BUILDING_SOURCE_KEY,
          attribution: "City of Fairbanks Administrative Code Section 304.2",
        },
        {
          question: "Do I need a permit to build a garage in Fairbanks?",
          answer:
            "Yes. Detached accessory structures exceeding 200 square feet of floor area require a building permit. The permit fee is based on the construction valuation of the garage per Table 3-A.",
          sourceId: FB_BUILDING_SOURCE_KEY,
          attribution: "City of Fairbanks Building Department",
        },
      ],
      seoTitle: "Fairbanks AK Building Permit Cost (Valuation Table & Plan Review)",
      seoDescription:
        "Calculate City of Fairbanks building permit fees using the official Table 3-A valuation ladder plus 75% plan review fee. Rates start at $17 for work under $500.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: FB_LAST_VERIFIED,
    },
    {
      jurisdictionKey: FB_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      slug: "electrical-permit-cost",
      title: "Fairbanks Electrical Permit Cost",
      intro:
        "Electrical permits in Fairbanks are issued under Administrative Code Chapter 10, Table 3-B. Every electrical permit carries a **$35.00 permit issuance fee**. Unit fees are then charged based on the type of installation: new **single-family dwelling wiring** (including all circuits, service equipment, and attached garage wiring) is assessed a **flat $255.00** unit fee. Other installation types are priced per unit per the full Table 3-B unit fee schedule.",
      localSummary:
        "An electrical permit is required for new service entrances and panel upgrades, rewiring, new branch circuits, sub-panel installations, standby generator transfer switches, and temporary power. Permits must be applied for by a licensed electrical contractor. Inspections are typically required at rough-in and at final completion.",
      notIncluded:
        "Golden Valley Electric Association (GVEA) utility service hookup and metering charges, low-voltage data and communications wiring permits (separate), and after-hours or emergency inspection surcharges.",
      workedExample: {
        scenario:
          "New single-family residential dwelling electrical permit — complete wiring, 200A service, and attached garage in Fairbanks.",
        inputs: {
          valuationCents: 800_000,
        },
        notes:
          "Table 3-B Item 1 (issuance): **$35.00**. Table 3-B Unit Fee Schedule Item 1 (new SFD, all wiring and service): **$255.00**. Total electrical permit fee: **$290.00**.",
      },
      faqs: [
        {
          question: "Who can pull an electrical permit in Fairbanks?",
          answer:
            "Electrical permits must be pulled by an electrical contractor licensed by the State of Alaska with an assigned licensed electrical administrator. The administrator's license number must appear on the permit application.",
          sourceId: FB_ELECTRICAL_SOURCE_KEY,
          attribution: "City of Fairbanks Building Department",
        },
        {
          question: "What is the electrical permit fee for a new house in Fairbanks?",
          answer:
            "A new single-family dwelling pays a $35.00 permit issuance fee plus a flat $255.00 unit fee (Table 3-B, Unit Fee Schedule Item 1) covering all residential wiring, service equipment, and attached garage circuits. Total: $290.00.",
          sourceId: FB_ELECTRICAL_SOURCE_KEY,
          attribution: "City of Fairbanks Table 3-B",
        },
        {
          question: "Does a panel upgrade require an electrical permit in Fairbanks?",
          answer:
            "Yes. Service entrance equipment upgrades and sub-panel replacements require an electrical permit. The fee is the $35.00 issuance fee plus the applicable unit fee from Table 3-B.",
          sourceId: FB_ELECTRICAL_SOURCE_KEY,
          attribution: "City of Fairbanks Building Department",
        },
      ],
      seoTitle: "Fairbanks AK Electrical Permit Cost & Requirements",
      seoDescription:
        "Fairbanks electrical permit fees: $35 issuance + unit fees. New single-family dwelling flat rate $255. Licensed electrical contractor required.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: FB_LAST_VERIFIED,
    },
    {
      jurisdictionKey: FB_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      slug: "plumbing-permit-cost",
      title: "Fairbanks Plumbing Permit Cost",
      intro:
        "Plumbing permits in Fairbanks are issued under Administrative Code Chapter 10, Table 3-D. Every plumbing permit carries a **$35.00 permit issuance fee**. Beyond issuance, a **$15.00 per fixture or trap** unit fee is charged for each plumbing fixture, floor drain, floor sink, or trap installed. Permits must be pulled by a state-licensed plumbing contractor.",
      localSummary:
        "A plumbing permit is required for new fixture rough-ins, water heater replacements, whole-home repiping, sewer lateral repairs, and any work on drain-waste-vent or supply systems within the City of Fairbanks. Interior Alaska's extreme cold requires all supply and drain lines to meet frost-depth and heat-trace requirements. Inspections are required at rough-in and final completion.",
      notIncluded:
        "Fairbanks Utilities (water and sewer utility connection fees and meter charges), State of Alaska DEC on-site wastewater system permits, private well permits, and grease interceptor health department reviews.",
      workedExample: {
        scenario:
          "Bathroom addition with 5 new fixtures (toilet, sink, tub/shower, floor drain, laundry tray) in a Fairbanks residence.",
        inputs: {
          valuationCents: 1_200_000,
          // Table 3-B's unit fee prices the permit's fixture count. Without the
          // count the unit-fee rule is excluded as missing input and the example
          // computes the $35.00 issuance alone instead of the announced $110.00.
          fixtures: 5,
        },
        notes:
          "Permit issuance fee: **$35.00**. Unit fee: 5 fixtures × $15.00 = **$75.00**. Total plumbing permit fee: **$110.00**.",
      },
      faqs: [
        {
          question: "How is a Fairbanks plumbing permit fee calculated?",
          answer:
            "The permit issuance fee is $35.00 (Table 3-D, Item 1). A unit fee of $15.00 per plumbing fixture or trap is added for each fixture installed (Table 3-D, Unit Fee Schedule Item 1). Total = $35 + ($15 × number of fixtures).",
          sourceId: FB_PLUMBING_SOURCE_KEY,
          attribution: "City of Fairbanks Administrative Code Chapter 10, Table 3-D",
        },
        {
          question: "Does replacing a water heater require a permit in Fairbanks?",
          answer:
            "Yes. Water heater replacements require a plumbing permit in Fairbanks. The fee is the $35.00 issuance fee; the water heater itself counts as one fixture connection ($15.00) on applicable installations.",
          sourceId: FB_PLUMBING_SOURCE_KEY,
          attribution: "City of Fairbanks Building Department",
        },
        {
          question: "Who can pull a plumbing permit in Fairbanks?",
          answer:
            "Plumbing permits must be applied for by a contractor employing a State of Alaska licensed journeyman or master plumber as the designated administrator. The plumber's license number is required on the application.",
          sourceId: FB_PLUMBING_SOURCE_KEY,
          attribution: "City of Fairbanks Building Department",
        },
      ],
      seoTitle: "Fairbanks AK Plumbing Permit Cost & Code Requirements",
      seoDescription:
        "Fairbanks plumbing permit fees: $35 issuance + $15 per fixture. Licensed plumbing contractor required. Rules for water heaters, repiping, and fixture rough-ins.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: FB_LAST_VERIFIED,
    },
  ],

  verifications: [
    {
      entityType: "jurisdiction_profile",
      entityKey: FB_KEYS.jurisdiction,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: FB_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Alaska Expansion",
      sourceKey: FB_BUILDING_SOURCE_KEY,
      notes:
        "Verified against City of Fairbanks Building Department official fee schedule PDFs (Table 3-A, 3-B, 3-D) published from fairbanks.gov.",
    },
    {
      entityType: "fee_schedule",
      entityKey: FB_BUILDING_SOURCE_KEY,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: FB_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Alaska Expansion",
      sourceKey: FB_BUILDING_SOURCE_KEY,
      notes:
        "Verified tiered valuation ladder (Table 3-A) and 75% plan review fee (Section 304.2) against official building permit fee PDF.",
    },
    {
      entityType: "fee_schedule",
      entityKey: FB_ELECTRICAL_SOURCE_KEY,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: FB_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Alaska Expansion",
      sourceKey: FB_ELECTRICAL_SOURCE_KEY,
      notes:
        "Verified $35.00 issuance fee and $255.00 SFD unit fee against official electrical permit fee PDF (Table 3-B).",
    },
    {
      entityType: "fee_schedule",
      entityKey: FB_PLUMBING_SOURCE_KEY,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: FB_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Alaska Expansion",
      sourceKey: FB_PLUMBING_SOURCE_KEY,
      notes:
        "Verified $35.00 issuance fee and $15.00 per fixture fee against official plumbing permit fee PDF (Table 3-D).",
    },
    {
      entityType: "permit_page",
      entityKey: "building-permit-cost",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: FB_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Alaska Expansion",
      sourceKey: FB_BUILDING_SOURCE_KEY,
      notes: "Passed editorial gate checks for Fairbanks building permit page.",
    },
    {
      entityType: "permit_page",
      entityKey: "electrical-permit-cost",
      permitTypeKey: "electrical",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: FB_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Alaska Expansion",
      sourceKey: FB_ELECTRICAL_SOURCE_KEY,
      notes: "Passed editorial gate checks for Fairbanks electrical permit page.",
    },
    {
      entityType: "permit_page",
      entityKey: "plumbing-permit-cost",
      permitTypeKey: "plumbing",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: FB_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Alaska Expansion",
      sourceKey: FB_PLUMBING_SOURCE_KEY,
      notes: "Passed editorial gate checks for Fairbanks plumbing permit page.",
    },
  ],
};
