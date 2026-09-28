import type { JurisdictionSeed } from "@/content/seed-types";
import {
  VB_BUILDING_RULES,
  VB_COMM_SOURCE_KEY,
  VB_ELECTRICAL_RULES,
  VB_FEE_EFFECTIVE_FROM,
  VB_PLUMBING_RULES,
  VB_RES_SOURCE_KEY,
  VB_TRADE_SOURCE_KEY,
} from "@/content/virginiabeach/fee-rules";

export const VB_LAST_VERIFIED = "2026-09-26";

export const VB_KEYS = {
  state: "va",
  county: "virginia-beach-city",
  jurisdiction: "virginia-beach",
  residential: VB_RES_SOURCE_KEY,
  commercial: VB_COMM_SOURCE_KEY,
  trade: VB_TRADE_SOURCE_KEY,
} as const;

const state = {
  code: "VA",
  slug: "virginia",
  name: "Virginia",
  fipsCode: "51",
};

const county = {
  key: VB_KEYS.county,
  slug: "virginia-beach-city",
  name: "City of Virginia Beach",
  fipsCode: "51810",
};

const DOCS_BASE =
  "https://s3.us-east-1.amazonaws.com/virginia-beach-departments-docs/planning/Divisions-Offices/Permits_Inspections/Documents";
const RES_FEES_URL = `${DOCS_BASE}/Residential-Permit-Fees.pdf`;
const COMM_FEES_URL = `${DOCS_BASE}/Commercial-Permit-Fees.pdf`;
const TRADE_URL = "https://planning.virginiabeach.gov/permits/trade";
const RES_PAGE_URL =
  "https://planning.virginiabeach.gov/permits/building/residential-building-permits";
const ACCELA_URL = "https://aca-prod.accela.com/cvb/default.aspx";

export const virginiaBeachSeed: JurisdictionSeed = {
  state,
  county,

  jurisdiction: {
    key: VB_KEYS.jurisdiction,
    stateKey: VB_KEYS.state,
    countyKey: VB_KEYS.county,
    type: "city",
    slug: "virginia-beach",
    name: "Virginia Beach",
    officialName: "City of Virginia Beach — Permits & Inspections, Planning Department",
    websiteUrl: "https://virginiabeach.gov",
    permitPortalUrl: ACCELA_URL,
    timezone: "America/New_York",
    isActive: true,
  },

  departments: [
    {
      key: "vb-permits-inspections",
      jurisdictionKey: VB_KEYS.jurisdiction,
      kind: "building",
      name: "Permits & Inspections",
      phone: "(757) 385-4211",
      email: "perminsp@vbgov.com",
      url: TRADE_URL,
      addressLine: "2403 Courthouse Drive, Virginia Beach, VA 23456",
      hours: "Monday – Friday, 8:00 a.m. – 5:00 p.m. ET",
      notes:
        "Permits & Insissues building, trade and demolition permits for the City of Virginia Beach, reviews plans, and schedules inspections through the City's online permitting service.",
    },
  ],

  sources: [
    {
      key: VB_RES_SOURCE_KEY,
      jurisdictionKey: VB_KEYS.jurisdiction,
      title: "Residential Building Permit Fees (rev. Jul-2025)",
      url: RES_FEES_URL,
      sourceType: "fee_schedule_pdf",
      issuingAuthority: "City of Virginia Beach Permits & Inspections",
      authorityKind: "city",
      isPrimary: true,
      documentDate: "2025-07-01",
      effectiveFrom: VB_FEE_EFFECTIVE_FROM,
      retrievedAt: "2026-09-26",
      lastVerifiedAt: VB_LAST_VERIFIED,
      notes:
        "Heated living area new and additions: $50.00 plus $7.00 per 100 sq ft or fraction thereof. Non-heated: $50.00 plus $4.00 per 100 sq ft. Alterations: $50.00 plus $5.00 per $1,000 of construction value. Residential plan review $100.00. 2% state levy + $10.00 technology fee on all permits.",
    },
    {
      key: VB_COMM_SOURCE_KEY,
      jurisdictionKey: VB_KEYS.jurisdiction,
      title: "Commercial Building Permit Fees (rev. Jul-2025)",
      url: COMM_FEES_URL,
      sourceType: "fee_schedule_pdf",
      issuingAuthority: "City of Virginia Beach Permits & Inspections",
      authorityKind: "city",
      isPrimary: true,
      documentDate: "2025-07-01",
      effectiveFrom: VB_FEE_EFFECTIVE_FROM,
      retrievedAt: "2026-09-26",
      lastVerifiedAt: VB_LAST_VERIFIED,
      notes:
        "Commercial new and additions: $50.00 plus $8.00 per 100 sq ft or fraction thereof. Non-heated commercial storage: $50.00 plus $4.00 per 100 sq ft. Commercial plan review $200.00. 2% state levy + $10.00 technology fee.",
    },
    {
      key: VB_TRADE_SOURCE_KEY,
      jurisdictionKey: VB_KEYS.jurisdiction,
      title: "Trades Permits — Electrical, Plumbing, Mechanical (City web page)",
      url: TRADE_URL,
      sourceType: "municipal_website",
      issuingAuthority: "City of Virginia Beach Permits & Inspections",
      authorityKind: "city",
      isPrimary: true,
      documentDate: "2026-09-26",
      effectiveFrom: VB_FEE_EFFECTIVE_FROM,
      retrievedAt: "2026-09-26",
      lastVerifiedAt: VB_LAST_VERIFIED,
      notes:
        "Electrical: new service single phase $50.00 + $20.00 per 50 amps; change of service half the new-service fee; additions/repairs $50.00 + $5.00 per circuit; $50.00 each for named scopes; 2% state levy + $10.00 technology fee. Plumbing: $50.00 + $6.00 per fixture/drain.",
    },
  ],

  permitTypes: [],
  projectTypes: [],

  jurisdictionPermitTypes: [
    {
      jurisdictionKey: VB_KEYS.jurisdiction,
      permitTypeKey: "building",
      isAvailable: true,
      localName: "Building Permit",
      officialUrl: RES_FEES_URL,
      notes:
        "Priced by area: $50.00 plus $7.00 per 100 sq ft of heated residential area (or fraction) or $8.00 per 100 sq ft commercial, with plan review of $100 residential / $200 commercial, a 2% state levy and a $10 technology fee.",
    },
    {
      jurisdictionKey: VB_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      isAvailable: true,
      localName: "Electrical Permit",
      officialUrl: TRADE_URL,
      notes:
        "New service: $50.00 plus $20.00 per 50 amps (single phase; three phase $80.00 base). Additions or repairs: $50.00 plus $5.00 per circuit. 2% state levy and $10.00 technology fee.",
    },
    {
      jurisdictionKey: VB_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      isAvailable: true,
      localName: "Plumbing Permit",
      officialUrl: TRADE_URL,
      notes:
        "$50.00 plus $6.00 per fixture/drain; water/sewer line conversions or replacements $50.00; on-site collector or distribution lines $80.00 (one building). 2% state levy and $10.00 technology fee.",
    },
  ],

  feeSchedules: [
    {
      key: VB_RES_SOURCE_KEY,
      jurisdictionKey: VB_KEYS.jurisdiction,
      sourceKey: VB_RES_SOURCE_KEY,
      title: "Virginia Beach Building Permit Fee Schedules (Residential & Commercial)",
      officialUrl: RES_FEES_URL,
      effectiveFrom: VB_FEE_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: VB_LAST_VERIFIED,
      notes:
        "The two July 2025 fee sheets cover building permits. The city's electrical, plumbing and mechanical permits are published on the Trades Permits page instead, which carries its own schedule.",
    },
    {
      key: VB_TRADE_SOURCE_KEY,
      jurisdictionKey: VB_KEYS.jurisdiction,
      sourceKey: VB_TRADE_SOURCE_KEY,
      title: "Trades Permits — Electrical, Plumbing, Mechanical (City web page)",
      officialUrl: TRADE_URL,
      effectiveFrom: VB_FEE_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: VB_LAST_VERIFIED,
      notes:
        "A web page rather than a PDF, and a schedule of its own: the trade permits share the building sheets' $50.00 base and their 2% state levy, but every amount above that — $20.00 per 50 amps of service, $5.00 per circuit, $6.00 per fixture — is published only here.",
    },
  ],

  feeRules: [
    ...VB_BUILDING_RULES.map((rule) => ({
      jurisdictionKey: VB_KEYS.jurisdiction,
      permitTypeKey: "building",
      scheduleKey: VB_RES_SOURCE_KEY,
      rule,
    })),
    ...VB_ELECTRICAL_RULES.map((rule) => ({
      jurisdictionKey: VB_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      scheduleKey: VB_TRADE_SOURCE_KEY,
      rule,
    })),
    ...VB_PLUMBING_RULES.map((rule) => ({
      jurisdictionKey: VB_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      scheduleKey: VB_TRADE_SOURCE_KEY,
      rule,
    })),
  ],

  requirements: [
    {
      jurisdictionKey: VB_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "document",
      title: "Zoning-Approved Site Plan and Construction Plans",
      description:
        "Two sets of building construction plans built to the City's climate and geographic design criteria (130 mph ultimate wind speed, coastal exposure), plus a Zoning Office-approved site plan; waterfront work needs environmental review.",
      isMandatory: true,
      sortOrder: 1,
      sourceKey: VB_RES_SOURCE_KEY,
      lastVerifiedAt: VB_LAST_VERIFIED,
    },
    {
      jurisdictionKey: VB_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "other",
      title: "Public Utilities Receipt for Water and Sewer",
      description:
        "A Public Utilities receipt showing all water and sewer tap fees and drain fixture unit (DFU) fees are paid, or a Health Department approval where the property is served by well and septic.",
      isMandatory: true,
      sortOrder: 2,
      sourceKey: VB_RES_SOURCE_KEY,
      lastVerifiedAt: VB_LAST_VERIFIED,
    },
    {
      jurisdictionKey: VB_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      requirementType: "license",
      title: "Virginia Class A/B/C Contractor Registration",
      description:
        "Electrical permits are filed with the electrical contractor's Class A, B or C state registration number and a registered master tradesman's signature; owners may pull a permit with their own signature.",
      isMandatory: true,
      sortOrder: 3,
      sourceKey: VB_TRADE_SOURCE_KEY,
      lastVerifiedAt: VB_LAST_VERIFIED,
    },
    {
      jurisdictionKey: VB_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      requirementType: "license",
      title: "Master Tradesman Signature and Public Utilities Receipt",
      description:
        "Plumbing applications carry the contractor's state registration and master tradesman signature; all Public Utilities fees must be paid with a receipt provided before issuance, and grease traps or on-site lines require a plumbing inspector's review.",
      isMandatory: true,
      sortOrder: 4,
      sourceKey: VB_TRADE_SOURCE_KEY,
      lastVerifiedAt: VB_LAST_VERIFIED,
    },
  ],

  profile: {
    jurisdictionKey: VB_KEYS.jurisdiction,
    headline: "Virginia Beach, Virginia Permit Fees & Municipal Building Code",
    summary:
      "Virginia Beach Permits & Inspections prices building permits by area — $50.00 plus $7.00 per 100 sq ft of heated residential space or $8.00 per 100 sq ft commercial, always 'or fraction thereof' — with plan review at $100 residential / $200 commercial, a 2% Virginia state levy, and a $10 technology fee on every permit. Trade permits run $50 base: electrical services add $20 per 50 amps, circuits $5 each, and plumbing fixtures $6 each.",
    localContext:
      "Virginia Beach enforces the Virginia Uniform Statewide Building Code with the City's coastal design criteria — among the strictest wind requirements in the Chesapeake region — and requires waterfront projects in the Chesapeake Bay Preservation Area to clear environmental review before a building permit. Applications file through the City's Accela portal at 2403 Courthouse Drive.\n\nWhat sets the schedule apart is that the building side is priced by square footage rather than valuation, so a permit is knowable from the plans alone; only alterations read the construction value ($5.00 per $1,000, or fraction). Every permit — building or trade — carries the same two riders: Virginia's 2% state levy on the permit fees and the City's $10.00 technology fee. Inspections run from setback/footing through final and are scheduled online by 8 a.m. for same-day service, with failed re-inspections at $75.",
    valuationBasis:
      "New construction and additions are priced from gross area (100-sq-ft steps, or fraction thereof). Alterations and pools read the construction value at $5.00 per $1,000 or fraction thereof. Trade permits read the contract value entered on the application.",
    notIncluded:
      "These municipal figures cover building, plan review, trade permits, the state levy and the technology fee. They exclude:\n\n- **Water and sewer tap fees and drain fixture unit (DFU) fees**, collected by Public Utilities before issuance.\n- **Right-of-way permits** ($35 for in-ground pools; drive aprons) issued by the Development Services Center.\n- **Chesapeake Bay Preservation Area and waterfront environmental review** for work along the water.\n- **Fire suppression and alarm plan review** by the Fire Marshal.",
    seoTitle: "Virginia Beach VA Permit Fees | Official Fee Schedule & Cost Calculator",
    seoDescription:
      "Calculate Virginia Beach permit costs: $50 + $7 per 100 sq ft residential ($8 commercial), plan review $100/$200, 2% state levy, $10 technology fee.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: VB_LAST_VERIFIED,
  },

  permitPages: [
    {
      jurisdictionKey: VB_KEYS.jurisdiction,
      permitTypeKey: "building",
      slug: "building-permit-cost",
      title: "Virginia Beach Building Permit Cost",
      intro:
        "A Virginia Beach building permit is priced from the **plans**, not from a contractor's declaration: **$50.00 plus $7.00 per 100 square feet of heated residential area — or fraction thereof** — with commercial new construction at **$8.00 per 100 square feet**. Plan review is **$100.00 residential / $200.00 commercial**, and every permit carries Virginia's **2% state levy** plus the City's **$10.00 technology fee**. The fraction phrase is on every row, so 1,050 sq ft buys eleven 100-sq-ft steps, not ten and a half.",
      localSummary:
        "Building permits are issued by Permits & Inspections at 2403 Courthouse Drive and filed through the City's Accela portal. Because the fee is area-based, the number is knowable before the value of work is negotiated. Residential additions, garages and sheds over 256 sq ft, decks and screened porches all follow the same heated-area rate, while non-heated space (porches, decks, garages) uses $4.00 per 100 sq ft. Residential alterations instead read the construction value at $5.00 per $1,000 or fraction thereof. Inspections run setback/footing, slab/foundation, framing/insulation and final, schedulable online before 8 a.m. for same-day service.",
      notIncluded:
        "This estimate covers the building permit, plan review, the state levy and the technology fee. It excludes:\n\n- **Water and sewer tap fees and DFU fees** paid to Public Utilities before issuance.\n- **Right-of-way permits** ($35) for in-ground pools and drive aprons.\n- **CBPA and waterfront environmental review** for work along the water.\n- **Trade permits** — electrical, plumbing and mechanical file separately.",
      workedExample: {
        scenario:
          "A 2,400 sq ft heated single-family home in Virginia Beach (residential).",
        inputs: {
          squareFootage: 2400,
          valuationCents: 40_000_000,
          occupancy: "residential",
        },
        notes:
          "The area rate is $7.00 per 100 sq ft or fraction: 24 whole steps × $7.00 = **$168.00**, plus the **$50.00** base = $218.00. Residential plan review adds **$100.00**. The 2% state levy on the subtotal ($318.00) adds **$6.36**, and the technology fee **$10.00**. Total: $218.00 + $100.00 + $6.36 + $10.00 = **$334.36**.",
      },
      faqs: [
        {
          question: "How is a Virginia Beach building permit fee calculated?",
          answer:
            "The residential sheet prices heated new construction and additions at $50.00 plus $7.00 per 100 square feet of area or fraction thereof; commercial is $50.00 plus $8.00 per 100 sq ft. Plan review is $100 residential / $200 commercial, with a 2% state levy and $10 technology fee on top.",
          sourceId: VB_RES_SOURCE_KEY,
          attribution: "Residential & Commercial Building Permit Fees sheets (rev. Jul-2025)",
        },
        {
          question: "Does 'or fraction thereof' really change the fee?",
          answer:
            "Yes. 1,050 sq ft of heated area pays eleven 100-sq-ft steps ($77.00), not ten and a half ($73.50). The phrase appears on every area and value row of both sheets, so partial steps always round up to the whole step.",
          sourceId: VB_RES_SOURCE_KEY,
          attribution: "Residential Building Permit Fees sheet",
        },
        {
          question: "How are residential alterations priced?",
          answer:
            "Alterations leave the area rates and read the construction value: $50.00 plus $5.00 per $1,000 of construction value or fraction thereof — $55.00 at $1,000 of value through $110.00 at $12,000.",
          sourceId: VB_RES_SOURCE_KEY,
          attribution: "Residential Building Permit Fees sheet",
        },
        {
          question: "What is the 2% state levy in Virginia Beach?",
          answer:
            "Both fee sheets state: 'A 2% State Levy will be assessed on the permit fees listed above.' It is Virginia's statewide permit levy and applies to building and trade permits alike, on top of the $10.00 technology fee.",
          sourceId: VB_RES_SOURCE_KEY,
          attribution: "Residential & Commercial Building Permit Fees sheets",
        },
        {
          question: "Can homeowners pull their own permits in Virginia Beach?",
          answer:
            "Yes. Applications identify whether a licensed contractor (Class A, B or C state registration) or the property owner is applying; an owner files with their own name, address, approximate cost and signature.",
          sourceId: RES_PAGE_URL,
          attribution: "Virginia Beach Residential Building Permits page",
        },
      ],
      seoTitle: "Virginia Beach VA Building Permit Cost (Area-Based Rates)",
      seoDescription:
        "Virginia Beach building permits: $50 + $7 per 100 sq ft heated residential ($8 commercial), plan review $100/$200, 2% state levy, $10 tech fee.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: VB_LAST_VERIFIED,
    },
    {
      jurisdictionKey: VB_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      slug: "electrical-permit-cost",
      title: "Virginia Beach Electrical Permit Cost",
      intro:
        "An electrical permit in Virginia Beach is priced by what the job touches. A **new single-phase service is $50.00 plus $20.00 per 50 amps** — $130.00 at the 200-amp service most homes carry — while **additions or repairs are $50.00 plus $5.00 per circuit**. Named scopes (generator circuits, sub-fed panels, panel swaps, meter relocations, pool bonding, trailer services) are **$50.00 each**. Every permit adds the **2% state levy** and the **$10.00 technology fee**.",
      localSummary:
        "Electrical permits file through the City's Accela portal with the contractor's Class A/B/C registration and master tradesman signature; an owner may pull the permit with their own signature. Services over 800 amps require an electrical inspector's approval before issuance. Rough wiring is inspected before concealment and a final follows; failed re-inspections are $75, and the administrative fee for beginning work without a permit is $250.",
      notIncluded:
        "Dominion Energy's meter and service connection charges, utility reconnection fees, and low-voltage work under a separate registration are outside the permit fee. Change-of-service permits pay half the new-service fee for the same amperage.",
      workedExample: {
        scenario:
          "A 200-amp single-phase residential service upgrade in Virginia Beach.",
        inputs: {
          valuationCents: 550_000,
          custom: {
            amperage: 200,
          },
        },
        notes:
          "The service fee is $50.00 + $20.00 × (200 ÷ 50) = $50.00 + **$80.00** = $130.00. The 2% state levy on the base adds **$2.60**, and the technology fee **$10.00**. Total: $130.00 + $2.60 + $10.00 = **$142.60**.",
      },
      faqs: [
        {
          question: "What does a 200-amp service permit cost in Virginia Beach?",
          answer:
            "$50.00 plus $20.00 per 50 amps: four 50-amp steps at 200 A make the fee $130.00, plus the 2% state levy ($2.60) and the $10.00 technology fee — $142.60 in total.",
          sourceId: VB_TRADE_SOURCE_KEY,
          attribution: "Virginia Beach Trades Permits page",
        },
        {
          question: "How are electrical additions and repairs priced?",
          answer:
            "$50.00 plus $5.00 per circuit, feeder or piece of equipment connected. A three-circuit kitchen addition files at $65.00 before the levy and technology fee.",
          sourceId: VB_TRADE_SOURCE_KEY,
          attribution: "Virginia Beach Trades Permits page",
        },
        {
          question: "What is the fee for a change of electrical service?",
          answer:
            "Half of the new-service fee for the same amperage — a 200-amp change of service is $65.00 against the $130.00 new-service figure. Circuits added, repaired or extended during the change are charged separately.",
          sourceId: VB_TRADE_SOURCE_KEY,
          attribution: "Virginia Beach Trades Permits page",
        },
        {
          question: "Which electrical scopes pay a flat $50.00?",
          answer:
            "Generator circuits, temporary service poles, sub-fed panels, panel replacement or relocation, meter/meterbase replacement or relocation, pool bonding, trailer services and overhead-to-underground conversions are each $50.00, plus the levy and technology fee.",
          sourceId: VB_TRADE_SOURCE_KEY,
          attribution: "Virginia Beach Trades Permits page",
        },
      ],
      seoTitle: "Virginia Beach VA Electrical Permit Cost & Requirements",
      seoDescription:
        "Virginia Beach electrical permits: $50 + $20 per 50 amps for new service, $5 per circuit for additions, 2% state levy and $10 technology fee.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: VB_LAST_VERIFIED,
    },
    {
      jurisdictionKey: VB_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      slug: "plumbing-permit-cost",
      title: "Virginia Beach Plumbing Permit Cost",
      intro:
        "A Virginia Beach plumbing permit is **$50.00 plus $6.00 per fixture or drain**, with the **2% state levy** and the **$10.00 technology fee** on top. Water or sewer line conversions and replacements are a flat **$50.00**, on-site collector or distribution lines are **$80.00** for one building ($50.00 plus $50.00 per additional building), and demolition caps are $50.00 each.",
      localSummary:
        "Plumbing permits file through the Accela portal with the contractor's state registration, master tradesman signature and contract value; all Public Utilities fees must be paid with the receipt provided before issuance, and grease traps or on-site lines require a plumbing inspector's review. Gas inspections on residential new construction run with the plumbing inspection at rough-in and final. Failed re-inspections are $75 and the work-without-permit administrative fee is $250.",
      notIncluded:
        "Public Utilities water/sewer tap and DFU fees, grease-trap FOG review beyond the inspector's check, irrigation backflow testing, and after-hours inspections are separate from the permit fee.",
      workedExample: {
        scenario:
          "A bathroom remodel adding two fixtures and one drain to a Virginia Beach home.",
        inputs: {
          valuationCents: 800_000,
          fixtures: 3,
        },
        notes:
          "The permit is $50.00 + $6.00 × 3 fixtures/drains = $50.00 + **$18.00** = $68.00. The 2% state levy adds **$1.36**, and the technology fee **$10.00**. Total: $68.00 + $1.36 + $10.00 = **$79.36**.",
      },
      faqs: [
        {
          question: "What does a plumbing permit cost in Virginia Beach?",
          answer:
            "$50.00 plus $6.00 per fixture/drain, plus the 2% state levy and the $10.00 technology fee. A three-fixture job totals $79.36 with the riders.",
          sourceId: VB_TRADE_SOURCE_KEY,
          attribution: "Virginia Beach Trades Permits page",
        },
        {
          question: "How is a water or sewer line replacement priced?",
          answer:
            "Water line and sewer line conversions or replacements are a flat $50.00 each; on-site collector or distribution lines are $80.00 for one building and $50.00 plus $50.00 for each additional building served.",
          sourceId: VB_TRADE_SOURCE_KEY,
          attribution: "Virginia Beach Trades Permits page",
        },
        {
          question: "Do I need a receipt before my plumbing permit is issued?",
          answer:
            "Yes. All Public Utilities fees must be paid and the receipt provided to permitting staff before the permit is issued — the City will not release a plumbing permit with unpaid water/sewer charges.",
          sourceId: VB_TRADE_SOURCE_KEY,
          attribution: "Virginia Beach Trades Permits page",
        },
        {
          question: "When are plumbing inspections required?",
          answer:
            "New construction and additions require rough-in and final inspections. On residential jobs the gas pressure test and final are conducted at the same time as the plumbing inspection.",
          sourceId: VB_TRADE_SOURCE_KEY,
          attribution: "Virginia Beach Trades Permits page",
        },
      ],
      seoTitle: "Virginia Beach VA Plumbing Permit Cost & Regulations",
      seoDescription:
        "Virginia Beach plumbing permits: $50 + $6 per fixture/drain, flat $50 line replacements, 2% state levy and $10 technology fee.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: VB_LAST_VERIFIED,
    },
  ],

  verifications: [
    {
      entityType: "jurisdiction_profile",
      entityKey: VB_KEYS.jurisdiction,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: VB_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Virginia Expansion",
      sourceKey: VB_RES_SOURCE_KEY,
      notes:
        "Both fee sheets read with pdftotext; the trade page read live. Rates, plan review, the 2% state levy and the $10 technology fee all verified against the July 2025 revisions.",
    },
    {
      entityType: "fee_schedule",
      entityKey: VB_RES_SOURCE_KEY,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: VB_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Virginia Expansion",
      sourceKey: VB_RES_SOURCE_KEY,
      notes: "Verified the $50 + $7/100 sq ft residential rate, $100 plan review, and shared riders.",
    },
    {
      entityType: "permit_page",
      entityKey: "building-permit-cost",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: VB_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Virginia Expansion",
      sourceKey: VB_RES_SOURCE_KEY,
      notes: "Passed editorial gate checks for building permit page.",
    },
    {
      entityType: "permit_page",
      entityKey: "electrical-permit-cost",
      permitTypeKey: "electrical",
      status: "verified",
      method: "official_portal_check",
      verifiedAt: VB_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Virginia Expansion",
      sourceKey: VB_TRADE_SOURCE_KEY,
      notes: "Passed editorial gate checks for electrical permit page.",
    },
    {
      entityType: "permit_page",
      entityKey: "plumbing-permit-cost",
      permitTypeKey: "plumbing",
      status: "verified",
      method: "official_portal_check",
      verifiedAt: VB_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Virginia Expansion",
      sourceKey: VB_TRADE_SOURCE_KEY,
      notes: "Passed editorial gate checks for plumbing permit page.",
    },
  ],
};
