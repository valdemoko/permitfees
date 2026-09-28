import type { JurisdictionSeed } from "@/content/seed-types";
import {
  CAS_BUILDING_RULES,
  CAS_BUILDING_SOURCE_KEY,
  CAS_ELECTRICAL_RULES,
  CAS_ELECTRICAL_SOURCE_KEY,
  CAS_FEE_EFFECTIVE_FROM,
  CAS_PLUMBING_RULES,
  CAS_PLUMBING_SOURCE_KEY,
} from "@/content/casper/fee-rules";

export const CAS_LAST_VERIFIED = "2026-09-26";

export const CAS_KEYS = {
  state: "wy",
  county: "natrona-county-wy",
  jurisdiction: "casper",
} as const;

const state = {
  code: "WY",
  slug: "wyoming",
  name: "Wyoming",
  fipsCode: "56",
};

const county = {
  key: CAS_KEYS.county,
  slug: "natrona-county-wy",
  name: "Natrona County",
  fipsCode: "56025",
};

const CITY_URL = "https://www.casperwy.gov";
const BUILDING_URL = `${CITY_URL}/services/building_and_inspections/`;
const FEES_URL = `${CITY_URL}/business/fee_schedules.php`;

export const casperSeed: JurisdictionSeed = {
  state,
  county,

  jurisdiction: {
    key: CAS_KEYS.jurisdiction,
    stateKey: CAS_KEYS.state,
    countyKey: CAS_KEYS.county,
    type: "city",
    slug: "casper",
    name: "Casper",
    officialName:
      "City of Casper — Community Development Department, Building Inspection Division",
    websiteUrl: CITY_URL,
    permitPortalUrl: BUILDING_URL,
    timezone: "America/Denver",
    isActive: true,
  },

  departments: [
    {
      key: "casper-building-inspection",
      jurisdictionKey: CAS_KEYS.jurisdiction,
      kind: "building",
      name: "Building Inspection Division",
      phone: "(307) 235-8254",
      email: "buildingpermits@casperwy.gov",
      url: BUILDING_URL,
      addressLine: "200 North David Street, Casper, WY 82601-1862",
      hours: "Monday – Friday; permit line (307) 235-8264",
      notes:
        "Issues building, electrical, plumbing and mechanical permits under the combined Community Development fee schedule; permits are good for 180 days once issued.",
    },
  ],

  sources: [
    {
      key: CAS_BUILDING_SOURCE_KEY,
      jurisdictionKey: CAS_KEYS.jurisdiction,
      title:
        "City of Casper — Community Development Building Permit Fee Schedule (combined Building, Electrical, Plumbing and Mechanical), 2026 edition",
      url: FEES_URL,
      sourceType: "fee_schedule_pdf",
      issuingAuthority: "City of Casper Community Development Department",
      authorityKind: "city",
      isPrimary: true,
      documentDate: "2026-09-11",
      effectiveFrom: CAS_FEE_EFFECTIVE_FROM,
      retrievedAt: "2026-09-26",
      lastVerifiedAt: CAS_LAST_VERIFIED,
      notes:
        "One valuation table serves all four permit types: $60/$65 opening rows, +$5 per $100 band from $1,001 to $2,000, +$10 per $1,000 band to $100,000 ($1,090.00 at the seam), then the printed tail $1,090.00 + $5.60 per $1,000 or fraction. Plan check 25% residential / 35% multi-family-commercial-industrial over $25,000; $50 residential solar plan check; after-the-fact permits double, capped at $750. The casperwy.gov server 403s non-browser agents; the handout was captured from the City's Title 15 ordinance packet copy and both editions in the packet were reconciled (the superseded edition was rejected).",
    },
  ],

  permitTypes: [],
  projectTypes: [],

  jurisdictionPermitTypes: [
    {
      jurisdictionKey: CAS_KEYS.jurisdiction,
      permitTypeKey: "building",
      isAvailable: true,
      localName: "Building Permit",
      officialUrl: BUILDING_URL,
      notes:
        "Priced from the combined valuation table; plan check 25% residential / 35% commercial over $25,000 valuation.",
    },
    {
      jurisdictionKey: CAS_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      isAvailable: true,
      localName: "Electrical Permit",
      officialUrl: BUILDING_URL,
      notes:
        "Priced from the same combined table — the schedule's header names Building, Plumbing, Mechanical and Electrical together.",
    },
    {
      jurisdictionKey: CAS_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      isAvailable: true,
      localName: "Plumbing Permit",
      officialUrl: BUILDING_URL,
      notes:
        "Priced from the same combined table; flat $40 rows cover tank-style water heater and furnace replacement permits.",
    },
  ],

  feeSchedules: [
    {
      key: CAS_BUILDING_SOURCE_KEY,
      jurisdictionKey: CAS_KEYS.jurisdiction,
      sourceKey: CAS_BUILDING_SOURCE_KEY,
      title:
        "Community Development Building Permit Fee Schedule (combined trades)",
      officialUrl: FEES_URL,
      effectiveFrom: CAS_FEE_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: CAS_LAST_VERIFIED,
      notes:
        "2026 edition; fee schedule changes ride with the Title 15 repeal-and-replace ordinance (contact: Chief Building Official Justin Scott).",
    },
  ],

  feeRules: [
    ...CAS_BUILDING_RULES.map((rule) => ({
      jurisdictionKey: CAS_KEYS.jurisdiction,
      permitTypeKey: "building",
      scheduleKey: CAS_BUILDING_SOURCE_KEY,
      rule,
    })),
    ...CAS_ELECTRICAL_RULES.map((rule) => ({
      jurisdictionKey: CAS_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      scheduleKey: CAS_ELECTRICAL_SOURCE_KEY,
      rule,
    })),
    ...CAS_PLUMBING_RULES.map((rule) => ({
      jurisdictionKey: CAS_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      scheduleKey: CAS_PLUMBING_SOURCE_KEY,
      rule,
    })),
  ],

  requirements: [
    {
      jurisdictionKey: CAS_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "document",
      title: "Complete building permit application with valuation",
      description:
        "Permit fees base off the Community Development fee schedule against project valuation (all materials and labor); after-the-fact applications — construction started before review and approval — are assessed at double the building permit fee, not to exceed $750.00.",
      isMandatory: true,
      sortOrder: 1,
      sourceKey: CAS_BUILDING_SOURCE_KEY,
      lastVerifiedAt: CAS_LAST_VERIFIED,
    },
    {
      jurisdictionKey: CAS_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "other",
      title: "180-day permit validity and renewal",
      description:
        "Once issued, a permit is good for 180 days; permits exceeding 180 days since the last inspection renew at $60 or 10% of the original permit fee, whichever is higher.",
      isMandatory: false,
      sortOrder: 2,
      sourceKey: CAS_BUILDING_SOURCE_KEY,
      lastVerifiedAt: CAS_LAST_VERIFIED,
    },
  ],

  profile: {
    jurisdictionKey: CAS_KEYS.jurisdiction,
    headline: "Casper, Wyoming Permit Fees & Municipal Building Code",
    summary:
      "Casper's Community Development Department prices building, electrical, plumbing and mechanical permits from one combined valuation table: $60.00 at the smallest scope, $5.00 per $100 band through $2,000, $10.00 per $1,000 band to $100,000, and $1,090.00 plus $5.60 per $1,000 or fraction above. Plan check adds 25% of the permit fee for residential projects and 35% for multi-family and commercial projects over $25,000 valuation.",
    localContext:
      "The Building Inspection Division, at 200 North David Street, issues permits under the combined Community Development fee schedule — one table whose header names Building, Plumbing, Mechanical and Electrical together. Permits run 180 days, renewing at $60 or 10% of the original fee. Flat rows cover the common replacements: $40 for a tank-style water heater or furnace swap and $70 for a mobile home set. After-the-fact permits double the fee, capped at $750.\n\nCasper is updating Title 15 of its municipal code to adopt the current I-codes, with the fee schedule changes riding the same ordinance.",
    valuationBasis:
      "Project valuation — all materials and labor associated with the permit type — as stated on the application; the same combined table prices all four trade and building permits.",
    notIncluded:
      "These municipal figures cover the permit and plan-check fees. They exclude:\n\n- **Erosion control permits and bonds** ($50 per acre where applicable).\n- **Sewer and water permit connection charges** ($35 initial permit rows).\n- **Planning and engineering review fees** (plats, zone changes, site plans).\n- **Contractor licensing fees** and state licensing.\n- **Re-inspections beyond the second** ($75 each).",
    seoTitle: "Casper WY Permit Fees | Combined Building & Trade Fee Schedule",
    seoDescription:
      "Calculate Casper, Wyoming permit costs: combined valuation table from $60, +$10 per $1,000 to $100k, $1,090 + $5.60 above, 25%/35% plan check.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: CAS_LAST_VERIFIED,
  },

  permitPages: [
    {
      jurisdictionKey: CAS_KEYS.jurisdiction,
      permitTypeKey: "building",
      slug: "building-permit-cost",
      title: "Casper Building Permit Cost",
      intro:
        "Casper prices building permits from the **combined Community Development valuation table**: **$60.00** for $1-$500, **$65.00** to $1,000, **+$5.00 per $100 band** to $2,000, **+$10.00 per $1,000 band** to $100,000, then the printed tail — **$1,090.00 plus $5.60 per additional $1,000 or fraction**. Plan check adds **25% of the permit fee** residential / **35%** multi-family and commercial over $25,000 valuation.",
      localSummary:
        "The Building Inspection Division, at 200 North David Street, issues building, electrical, plumbing and mechanical permits from one combined schedule — the valuation (all materials and labor) drives every trade. Permits run 180 days and renew at $60 or 10% of the original fee. Common replacements carry flat rows: $40 for a tank-style water heater or furnace swap, $70 for a mobile home set. After-the-fact permits double the fee, capped at $750. Demolitions run $200 residential / $300 commercial.",
      notIncluded:
        "This estimate covers the permit and, over $25,000 valuation, the plan check. It excludes:\n\n- **Erosion control permits** ($50/acre plus bond) where applicable.\n- **Sewer and water connection permits** ($35 initial rows).\n- **Planning/engineering reviews** (plats, zone changes, site plans $600-$2,300).\n- **Contractor licensing**.\n- **Re-inspections beyond two** ($75 each).",
      workedExample: {
        scenario:
          "A new single-family home in Casper with a valuation of $150,000.",
        inputs: {
          valuationCents: 15_000_000,
          occupancy: "residential",
          workType: "new_construction",
        },
        notes:
          "Printed tail: $1,090.00 for the first $100,000 + ($150,000 − $100,000) ÷ $1,000 = 50 steps × $5.60 = **$280.00**. Permit = **$1,370.00**. Total: **$1,370.00**.",
      },
      faqs: [
        {
          question: "How is a Casper building permit fee calculated?",
          answer:
            "From project valuation on the combined Community Development table: $60 to $500; $65 to $1,000; then $5.00 per $100 band to $2,000; $10.00 per $1,000 band to $100,000; and $1,090.00 plus $5.60 per additional $1,000 or fraction above — with all materials and labor in the valuation.",
          sourceId: CAS_BUILDING_SOURCE_KEY,
          attribution: "Casper Community Development Building Permit Fee Schedule (2026 edition)",
        },
        {
          question: "What does a $150,000 home permit cost in Casper?",
          answer:
            "$1,090.00 for the first $100,000 plus 50 × $5.60 = $280.00, so $1,370.00 for the permit; residential plan check at 25% would add $342.50 since the valuation exceeds $25,000.",
          sourceId: CAS_BUILDING_SOURCE_KEY,
          attribution: "Casper Community Development Building Permit Fee Schedule (2026 edition)",
        },
        {
          question: "How much is plan review in Casper?",
          answer:
            "25% of the building permit fee on residential projects and 35% on multi-family, commercial and industrial projects — both applying when valuation exceeds $25,000.00. Residential solar plan check is a flat $50.00; commercial solar pays 35% of the solar permit fee.",
          sourceId: CAS_BUILDING_SOURCE_KEY,
          attribution: "Casper Community Development Building Permit Fee Schedule (2026 edition)",
        },
        {
          question: "How long is a Casper permit good for?",
          answer:
            "180 days once issued. Permits exceeding 180 days since the last inspection renew at $60.00 or 10% of the original permit fee, whichever is higher.",
          sourceId: CAS_BUILDING_SOURCE_KEY,
          attribution: "Casper Building & Inspections; combined fee schedule",
        },
        {
          question: "What does a water heater or furnace replacement permit cost in Casper?",
          answer:
            "$40.00 each — the schedule's flat rows for a residential tank-style water heater replacement permit and a residential furnace replacement permit.",
          sourceId: CAS_BUILDING_SOURCE_KEY,
          attribution: "Casper Community Development Building Permit Fee Schedule (2026 edition)",
        },
        {
          question: "What happens if I build without a permit in Casper?",
          answer:
            "After-the-fact permits — construction initiated before submittal, review and approval of a complete application — are assessed at double the building permit fee, not to exceed $750.00.",
          sourceId: CAS_BUILDING_SOURCE_KEY,
          attribution: "Casper Community Development Building Permit Fee Schedule (2026 edition)",
        },
        {
          question: "How much is a demolition permit in Casper?",
          answer:
            "$200.00 residential and $300.00 commercial, each plus an Erosion Control Permit if applicable ($50 per acre plus bond/surety).",
          sourceId: CAS_BUILDING_SOURCE_KEY,
          attribution: "Casper Community Development Building Permit Fee Schedule (2026 edition)",
        },
        {
          question: "What are Casper's inspection fees?",
          answer:
            "Re-inspections are $75.00 each once an inspection fails more than twice; code compliance inspections run $75.00 residential and $150.00 commercial, and permit or code research bills at $50.00 per hour.",
          sourceId: CAS_BUILDING_SOURCE_KEY,
          attribution: "Casper Community Development Building Permit Fee Schedule (2026 edition)",
        },
      ],
      seoTitle: "Casper WY Building Permit Cost (Combined Fee Schedule & Plan Check)",
      seoDescription:
        "Casper building permits: $60 opening, +$10/$1,000 to $100k, $1,090 + $5.60 above; 25%/35% plan check over $25,000; $40 flat replacements.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: CAS_LAST_VERIFIED,
    },

    {
      jurisdictionKey: CAS_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      slug: "electrical-permit-cost",
      title: "Casper Electrical Permit Cost",
      intro:
        "Casper prices electrical permits from the **combined Community Development valuation table** — the schedule's own header names Building, Plumbing, Mechanical and Electrical together. **$60.00** at the smallest scope, **$10.00 per $1,000 band** through $100,000, then **$1,090.00 + $5.60 per additional $1,000 or fraction**.",
      localSummary:
        "Electrical work in Casper files with the Building Inspection Division at (307) 235-8264 or buildingpermits@casperwy.gov, with the valuation of the electrical scope (all materials and labor) driving the fee from the same table as building work. The 25%/35% plan check applies over $25,000 when review is required, and the $75 re-inspection row covers failed inspections. Permits run 180 days from issuance.",
      notIncluded:
        "This estimate covers the electrical permit only. It excludes:\n\n- **Rocky Mountain Power** service, meter and transformer charges.\n- **Plan check at 25%/35%** where review applies.\n- **Fire alarm and suppression permits** under the fire code.\n- **Contractor licensing fees**.\n- **Re-inspections beyond two** ($75 each).",
      workedExample: {
        scenario:
          "A Casper electrician permits a commercial lighting remodel valued at $12,000.",
        inputs: {
          valuationCents: 1_200_000,
          occupancy: "commercial",
          workType: "alteration",
        },
        notes:
          "Band $2,001-$100,000: $150.00 for the first $2,000 + ($12,000 − $2,000) ÷ $1,000 = 10 steps × $10.00 = **$100.00**. Permit = **$250.00**. Total: **$250.00**.",
      },
      faqs: [
        {
          question: "How is an electrical permit fee calculated in Casper?",
          answer:
            "From the electrical scope's valuation on the combined Community Development table — the same table as building, plumbing and mechanical: $60 to $500, rising $10 per $1,000 band to $100,000, then $1,090.00 plus $5.60 per $1,000 or fraction above.",
          sourceId: CAS_ELECTRICAL_SOURCE_KEY,
          attribution: "Casper Community Development Building Permit Fee Schedule (2026 edition)",
        },
        {
          question: "What would a $12,000 electrical job cost to permit in Casper?",
          answer:
            "$150.00 for the first $2,000 plus 10 × $10.00 = $100.00, so $250.00 — each part of a $1,000 buys a full band ('or fraction thereof').",
          sourceId: CAS_ELECTRICAL_SOURCE_KEY,
          attribution: "Casper Community Development Building Permit Fee Schedule (2026 edition)",
        },
        {
          question: "Does Casper require a plan check for electrical work?",
          answer:
            "When valuation exceeds $25,000, the plan check is 25% of the permit fee for residential projects and 35% for multi-family, commercial and industrial projects.",
          sourceId: CAS_ELECTRICAL_SOURCE_KEY,
          attribution: "Casper Community Development Building Permit Fee Schedule (2026 edition)",
        },
        {
          question: "Who do I contact for a Casper electrical permit?",
          answer:
            "The Building Inspection Division at (307) 235-8264 or buildingpermits@casperwy.gov, Community Development Department, 200 North David Street.",
          sourceId: CAS_ELECTRICAL_SOURCE_KEY,
          attribution: "City of Casper Building & Inspections Division",
        },
        {
          question: "How long is an electrical permit valid in Casper?",
          answer:
            "180 days once issued; permits exceeding 180 days since the last inspection renew at $60.00 or 10% of the original fee, whichever is higher.",
          sourceId: CAS_ELECTRICAL_SOURCE_KEY,
          attribution: "City of Casper Building & Inspections Division",
        },
        {
          question: "What happens on a failed electrical inspection in Casper?",
          answer:
            "Re-inspections are $75.00 each once an inspection has failed more than twice — the schedule's re-inspection row covers 'more than 2 inspections for the same inspection'.",
          sourceId: CAS_ELECTRICAL_SOURCE_KEY,
          attribution: "Casper Community Development Building Permit Fee Schedule (2026 edition)",
        },
      ],
      seoTitle: "Casper WY Electrical Permit Cost (Combined Schedule, Valuation-Based)",
      seoDescription:
        "Casper electrical permits: same combined valuation table as building — $60 opening, +$10/$1,000 to $100k, $1,090 + $5.60 above.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: CAS_LAST_VERIFIED,
    },

    {
      jurisdictionKey: CAS_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      slug: "plumbing-permit-cost",
      title: "Casper Plumbing Permit Cost",
      intro:
        "Casper prices plumbing permits from the **combined valuation table**: **$60.00** for $1-$500 of valuation, **+$10.00 per $1,000 band** through $100,000, then **$1,090.00 plus $5.60 per additional $1,000 or fraction** — with a **$40.00 flat permit** for a tank-style water heater replacement.",
      localSummary:
        "Plumbing work files with the Building Inspection Division under the combined Community Development schedule — the same valuation table as building, electrical and mechanical, driven by the scope's materials-and-labor value. Water heater and furnace replacements carry their $40 flat rows instead of the ladder. Sewer and water connection permits price at $35 initially. Re-inspections are $75 once an inspection has failed more than twice.",
      notIncluded:
        "This estimate covers the plumbing permit only. It excludes:\n\n- **City of Casper water and sewer connection charges** beyond the $35 permit rows.\n- **Plan check at 25%/35%** over $25,000 valuation.\n- **Backflow and cross-connection program fees**.\n- **Contractor licensing**.\n- **Re-inspections beyond two** ($75 each).",
      workedExample: {
        scenario:
          "A Casper plumber permits a residential repipe valued at $30,000.",
        inputs: {
          valuationCents: 3_000_000,
          occupancy: "residential",
          workType: "alteration",
        },
        notes:
          "Band $2,001-$100,000: $150.00 for the first $2,000 + ($30,000 − $2,000) ÷ $1,000 = 28 steps × $10.00 = **$280.00**. Permit = **$430.00**. Total: **$430.00**.",
      },
      faqs: [
        {
          question: "How is a plumbing permit fee calculated in Casper?",
          answer:
            "From the plumbing scope's valuation on the combined Community Development table — $60 to $500, then $10.00 per $1,000 band to $100,000, and $1,090.00 plus $5.60 per $1,000 or fraction above, with all materials and labor counted.",
          sourceId: CAS_PLUMBING_SOURCE_KEY,
          attribution: "Casper Community Development Building Permit Fee Schedule (2026 edition)",
        },
        {
          question: "What would a $30,000 repipe cost to permit in Casper?",
          answer:
            "$150.00 for the first $2,000 plus 28 × $10.00 = $280.00, so $430.00 for the permit; residential plan check at 25% would add $107.50 since the valuation exceeds $25,000.",
          sourceId: CAS_PLUMBING_SOURCE_KEY,
          attribution: "Casper Community Development Building Permit Fee Schedule (2026 edition)",
        },
        {
          question: "How much is a water heater replacement permit in Casper?",
          answer:
            "$40.00 flat for a residential tank-style water heater replacement permit; a residential furnace replacement permit is also $40.00.",
          sourceId: CAS_PLUMBING_SOURCE_KEY,
          attribution: "Casper Community Development Building Permit Fee Schedule (2026 edition)",
        },
        {
          question: "What do sewer and water connection permits cost in Casper?",
          answer:
            "$35.00 for the initial sewer permit and $35.00 for the initial water permit, per the combined schedule's additional permit rows.",
          sourceId: CAS_PLUMBING_SOURCE_KEY,
          attribution: "Casper Community Development Building Permit Fee Schedule (2026 edition)",
        },
        {
          question: "Does Casper require plan review for plumbing work?",
          answer:
            "When valuation exceeds $25,000, the plan check is 25% of the permit fee on residential projects and 35% on multi-family, commercial and industrial projects.",
          sourceId: CAS_PLUMBING_SOURCE_KEY,
          attribution: "Casper Community Development Building Permit Fee Schedule (2026 edition)",
        },
        {
          question: "What are Casper's plumbing inspection fees?",
          answer:
            "Re-inspections are $75.00 each once an inspection fails more than twice; permit and code research bills at $50.00 per hour.",
          sourceId: CAS_PLUMBING_SOURCE_KEY,
          attribution: "Casper Community Development Building Permit Fee Schedule (2026 edition)",
        },
      ],
      seoTitle: "Casper WY Plumbing Permit Cost (Combined Schedule & $40 Replacements)",
      seoDescription:
        "Casper plumbing permits: combined valuation table from $60, +$10/$1,000 to $100k, $1,090 + $5.60 above, $40 water heater replacement.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: CAS_LAST_VERIFIED,
    },
  ],

  verifications: [
    {
      entityType: "jurisdiction_profile",
      entityKey: CAS_KEYS.jurisdiction,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: CAS_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Wyoming Expansion",
      sourceKey: CAS_BUILDING_SOURCE_KEY,
      notes:
        "The combined fee-schedule handout (2026 edition) was read in full via pdftotext from the City's Title 15 ordinance packet copy; both editions in the packet were reconciled and the superseded edition rejected.",
    },
    {
      entityType: "fee_schedule",
      entityKey: CAS_BUILDING_SOURCE_KEY,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: CAS_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Wyoming Expansion",
      sourceKey: CAS_BUILDING_SOURCE_KEY,
      notes:
        "Valuation bands, the printed $1,090.00 + $5.60 tail, plan-check percentages, after-the-fact doubling (capped $750) and flat replacement rows verified against the printed rows.",
    },
    {
      entityType: "permit_page",
      entityKey: "building-permit-cost",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: CAS_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Wyoming Expansion",
      sourceKey: CAS_BUILDING_SOURCE_KEY,
      notes: "Editorial gate checks passed for the building page.",
    },
    {
      entityType: "permit_page",
      entityKey: "electrical-permit-cost",
      permitTypeKey: "electrical",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: CAS_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Wyoming Expansion",
      sourceKey: CAS_ELECTRICAL_SOURCE_KEY,
      notes: "Editorial gate checks passed for the electrical page.",
    },
    {
      entityType: "permit_page",
      entityKey: "plumbing-permit-cost",
      permitTypeKey: "plumbing",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: CAS_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Wyoming Expansion",
      sourceKey: CAS_PLUMBING_SOURCE_KEY,
      notes: "Editorial gate checks passed for the plumbing page.",
    },
  ],
};
