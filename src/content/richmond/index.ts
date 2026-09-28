import type { JurisdictionSeed } from "@/content/seed-types";
import {
  RVA_BUILDING_RULES,
  RVA_DEPARTMENT_PAGE_KEY,
  RVA_ELECTRICAL_RULES,
  RVA_FEE_EFFECTIVE_FROM,
  RVA_FEE_SCHEDULE_KEY,
  RVA_PLUMBING_RULES,
} from "@/content/richmond/fee-rules";

export const RVA_LAST_VERIFIED = "2026-09-26";

export const RVA_KEYS = {
  state: "va",
  county: "richmond-city",
  jurisdiction: "richmond",
  schedule: RVA_FEE_SCHEDULE_KEY,
  department: RVA_DEPARTMENT_PAGE_KEY,
} as const;

const state = {
  code: "VA",
  slug: "virginia",
  name: "Virginia",
  fipsCode: "51",
};

const county = {
  key: RVA_KEYS.county,
  slug: "richmond-city",
  name: "City of Richmond",
  fipsCode: "51760",
};

const FEES_URL = "https://www.rva.gov/sites/default/files/2024-08/PermitsFeeSchedule.pdf";
const DEPT_URL = "https://www.rva.gov/planning-development-review/permits-and-inspections";
const PLAN_REQ_URL =
  "https://www.rva.gov/sites/default/files/2025-02/Building%20Plan%20Requirements%20Residential%202021%20VRC%20_Updated.pdf";

export const richmondSeed: JurisdictionSeed = {
  state,
  county,

  jurisdiction: {
    key: RVA_KEYS.jurisdiction,
    stateKey: RVA_KEYS.state,
    countyKey: RVA_KEYS.county,
    type: "city",
    slug: "richmond",
    name: "Richmond",
    officialName:
      "City of Richmond — Department of Planning & Development Review, Bureau of Permits and Inspections",
    websiteUrl: "https://www.rva.gov",
    permitPortalUrl: "https://aca-prod.accela.com/richmond/default.aspx",
    timezone: "America/New_York",
    isActive: true,
  },

  departments: [
    {
      key: "richmond-pdr-bpi",
      jurisdictionKey: RVA_KEYS.jurisdiction,
      kind: "building",
      name: "Bureau of Permits and Inspections",
      phone: "(804) 646-4169",
      email: null,
      url: DEPT_URL,
      addressLine: "900 East Broad Street, Room 108, Richmond, VA 23219",
      hours: "Monday – Friday, 8:00 a.m. – 5:00 p.m. ET",
      notes:
        "The Bureau of Permits and Inspections issues building, trade and demolition permits for the City of Richmond, reviews plans for code compliance, and conducts inspections under the Virginia Uniform Statewide Building Code.",
    },
  ],

  sources: [
    {
      key: RVA_FEE_SCHEDULE_KEY,
      jurisdictionKey: RVA_KEYS.jurisdiction,
      title: "City of Richmond Fee Schedule (effective 07/01/2024)",
      url: FEES_URL,
      sourceType: "fee_schedule_pdf",
      issuingAuthority:
        "City of Richmond Department of Planning & Development Review, Bureau of Permits and Inspections",
      authorityKind: "city",
      isPrimary: true,
      documentDate: "2024-07-01",
      effectiveFrom: RVA_FEE_EFFECTIVE_FROM,
      retrievedAt: "2026-09-26",
      lastVerifiedAt: RVA_LAST_VERIFIED,
      notes:
        "Residential 1 & 2 family: $63.00 for the first $2,000 plus $6.07 per $1,000 or fraction thereof. Commercial: $131.00 plus $8.50 per $1,000 or fraction. A 2.0% state surcharge is added to the final calculated fee of every permit. Value of work equals the higher of the contractor estimate or RS Means price.",
    },
    {
      key: RVA_DEPARTMENT_PAGE_KEY,
      jurisdictionKey: RVA_KEYS.jurisdiction,
      title: "Permits and Inspections — Department of Planning & Development Review",
      url: DEPT_URL,
      sourceType: "municipal_website",
      issuingAuthority: "City of Richmond",
      authorityKind: "city",
      isPrimary: true,
      documentDate: "2026-09-26",
      effectiveFrom: RVA_FEE_EFFECTIVE_FROM,
      retrievedAt: "2026-09-26",
      lastVerifiedAt: RVA_LAST_VERIFIED,
      notes:
        "Confirms the trade-permit split: a building permit covers only the building and structural portion; electrical, mechanical and plumbing work files under separate trade permits reviewed when submitted.",
    },
    {
      key: "richmond-plan-requirements",
      jurisdictionKey: RVA_KEYS.jurisdiction,
      title: "Residential Building Plan Review Requirements (links the fee schedule)",
      url: PLAN_REQ_URL,
      sourceType: "municipal_website",
      issuingAuthority: "City of Richmond",
      authorityKind: "city",
      isPrimary: true,
      documentDate: "2025-02-04",
      effectiveFrom: RVA_FEE_EFFECTIVE_FROM,
      retrievedAt: "2026-09-26",
      lastVerifiedAt: RVA_LAST_VERIFIED,
      notes:
        "States that Richmond permit fees are based on provided construction costs and square footage, and names the fee schedule URL used as this seed's primary source.",
    },
  ],

  permitTypes: [],
  projectTypes: [],

  jurisdictionPermitTypes: [
    {
      jurisdictionKey: RVA_KEYS.jurisdiction,
      permitTypeKey: "building",
      isAvailable: true,
      localName: "Building Permit",
      officialUrl: FEES_URL,
      notes:
        "Residential 1 & 2 family: $63.00 for the first $2,000 of value of work plus $6.07 per $1,000 or fraction thereof above; commercial: $131.00 plus $8.50 per $1,000 or fraction. 2% state surcharge on the final fee.",
    },
    {
      jurisdictionKey: RVA_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      isAvailable: true,
      localName: "Electrical Trade Permit",
      officialUrl: FEES_URL,
      notes:
        "Electrical work files under a separate trade permit priced by the same value-of-work formulas as the building permit, with the 2% state surcharge.",
    },
    {
      jurisdictionKey: RVA_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      isAvailable: true,
      localName: "Plumbing Trade Permit",
      officialUrl: FEES_URL,
      notes:
        "Plumbing work files under a separate trade permit priced by the same value-of-work formulas as the building permit, with the 2% state surcharge.",
    },
  ],

  feeSchedules: [
    {
      key: RVA_FEE_SCHEDULE_KEY,
      jurisdictionKey: RVA_KEYS.jurisdiction,
      sourceKey: RVA_FEE_SCHEDULE_KEY,
      title: "City of Richmond Fee Schedule — Permits",
      officialUrl: FEES_URL,
      effectiveFrom: RVA_FEE_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: RVA_LAST_VERIFIED,
      notes:
        "One schedule prices building and the named trade permits alike on the value of work; the 2% state surcharge rides every permit.",
    },
  ],

  feeRules: [
    ...RVA_BUILDING_RULES.map((rule) => ({
      jurisdictionKey: RVA_KEYS.jurisdiction,
      permitTypeKey: "building",
      scheduleKey: RVA_FEE_SCHEDULE_KEY,
      rule,
    })),
    ...RVA_ELECTRICAL_RULES.map((rule) => ({
      jurisdictionKey: RVA_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      scheduleKey: RVA_FEE_SCHEDULE_KEY,
      rule,
    })),
    ...RVA_PLUMBING_RULES.map((rule) => ({
      jurisdictionKey: RVA_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      scheduleKey: RVA_FEE_SCHEDULE_KEY,
      rule,
    })),
  ],

  requirements: [
    {
      jurisdictionKey: RVA_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "document",
      title: "Construction Documents and Value of Work",
      description:
        "Plans filed under the 2021 VUSBC with the declared value of work; the City prices the permit on the higher of the contractor estimate or the RS Means valuation.",
      isMandatory: true,
      sortOrder: 1,
      sourceKey: RVA_FEE_SCHEDULE_KEY,
      lastVerifiedAt: RVA_LAST_VERIFIED,
    },
    {
      jurisdictionKey: RVA_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "zoning_review",
      title: "Multi-Agency Review",
      description:
        "Building permits are forwarded to Zoning, Planning and Preservation, Land Use Administration, the Commission of Architectural Review, Public Works, Public Utilities, Water Resources and Code Enforcement as applicable.",
      isMandatory: true,
      sortOrder: 2,
      sourceKey: RVA_DEPARTMENT_PAGE_KEY,
      lastVerifiedAt: RVA_LAST_VERIFIED,
    },
    {
      jurisdictionKey: RVA_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      requirementType: "license",
      title: "Virginia Electrical Contractor License",
      description:
        "Electrical trade permits are issued to contractors licensed under Virginia's tradesman program; the City's page notes the separate trade permit is reviewed for code compliance when submitted.",
      isMandatory: true,
      sortOrder: 3,
      sourceKey: RVA_DEPARTMENT_PAGE_KEY,
      lastVerifiedAt: RVA_LAST_VERIFIED,
    },
    {
      jurisdictionKey: RVA_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      requirementType: "license",
      title: "Virginia Plumbing Contractor License",
      description:
        "Plumbing trade permits are issued to licensed plumbing contractors; adding fixtures that create new kitchen or bathing facilities may also trigger zoning review.",
      isMandatory: true,
      sortOrder: 4,
      sourceKey: RVA_DEPARTMENT_PAGE_KEY,
      lastVerifiedAt: RVA_LAST_VERIFIED,
    },
  ],

  profile: {
    jurisdictionKey: RVA_KEYS.jurisdiction,
    headline: "Richmond, Virginia Permit Fees & Municipal Building Code",
    summary:
      "Richmond's Bureau of Permits and Inspections — Department of Planning & Development Review, at 900 East Broad Street — prices building and trade permits alike on the value of work from one two-page fee schedule effective 07/01/2024: $63.00 for the first $2,000 plus $6.07 per $1,000 or fraction thereof for one- and two-family residential, $131.00 plus $8.50 per $1,000 or fraction for commercial — with a 2% Virginia state surcharge added to every permit's final calculated fee, per the schedule's own NOTE.",
    localContext:
      "Richmond enforces the 2021 Virginia Uniform Statewide Building Code, including the Virginia Residential Code for one- and two-family dwellings, through the Department of Planning & Development Review at 900 East Broad Street (Room 108). A Richmond building permit covers only the building and structural portion of a project — electrical, mechanical and plumbing work files under separate trade permits, each reviewed for code compliance when submitted and priced by the same value-of-work formulas: the schedule's opening sentence lists electrical and plumbing among the permits 'calculated as follows'.\n\nTwo features make Richmond's schedule distinctive. The value of work is not taken from the applicant alone: it is the higher of the contractor's estimate or the RS Means valuation, so understating a bid only moves the fee to the City's number. And the schedule prices withdrawn or rejected applications at 5% of the initial permit fee (minimum $25) with plan-review minimums at 10%, so abandoning a submittal is not free.\n\nBoth formulas print 'or fraction thereof', so the value of work rounds up to the whole $1,000 above the $2,000 threshold — a $12,300 residential job pays $63 + $6.07 × 11 = $129.77 before the surcharge. Other schedule rows a project may touch: demolition at $184 residential / $368 commercial (plus $.01/sq ft above 10,000 sq ft, capped at $1,000), certificates of occupancy at $263, re-inspections at $32/$63, and after-hours inspections at $110/hour.",
    valuationBasis:
      "Value of work equals the higher of either the contractor estimate or the RS Means price, per the fee schedule's own NOTE.",
    notIncluded:
      "These municipal figures cover the permit fee and the state surcharge. They exclude:\n\n- **Certificates of Occupancy** ($263.00, including temporary and partial).\n- **Demolition permits** ($184.00 residential / $368.00 commercial plus $.01/sq ft above 10,000 sq ft, capped at $1,000).\n- **After-hours inspections** ($110.00/hour) and re-inspections ($32/$63).\n- **Public Utilities and Department of Public Works review charges** for site work.",
    seoTitle: "Richmond VA Permit Fees | Official Fee Schedule & Cost Calculator",
    seoDescription:
      "Calculate Richmond, VA permit costs: $63 + $6.07 per $1,000 residential, $131 + $8.50 commercial, or fraction thereof, plus the 2% state surcharge.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: RVA_LAST_VERIFIED,
  },

  permitPages: [
    {
      jurisdictionKey: RVA_KEYS.jurisdiction,
      permitTypeKey: "building",
      slug: "building-permit-cost",
      title: "Richmond Building Permit Cost",
      intro:
        "A Richmond building permit is priced from the **value of work** — the higher of your contractor estimate or the City's RS Means valuation. One- and two-family residential permits are **$63.00 for the first $2,000**, then **$6.07 per $1,000 or fraction thereof**; commercial permits are **$131.00 plus $8.50 per $1,000 or fraction**. Every permit then carries the schedule's **2% Virginia state surcharge** on the final calculated fee.",
      localSummary:
        "Building permits are issued by the Bureau of Permits and Inspections at 900 East Broad Street and reviewed against the 2021 Virginia Uniform Statewide Building Code. A Richmond building permit covers only the building and structural portion of a project; electrical, mechanical and plumbing file separately. Permits route through Zoning, Planning and Preservation, the Commission of Architectural Review and other agencies as applicable, and withdrawn or rejected applications still owe a minimum of 5% of the initial fee (plan review minimums 10%, $25).",
      notIncluded:
        "This estimate covers the permit fee and the 2% state surcharge. It excludes:\n\n- **Certificate of Occupancy** at $263.00 (temporary and partial included).\n- **Demolition permits** — $184.00 residential / $368.00 commercial, plus $.01 per sq ft above 10,000 sq ft capped at $1,000.\n- **Re-inspections** ($32 residential / $63 commercial) and after-hours inspections ($110/hour).\n- **Trade permits** — electrical, mechanical and plumbing file separately.",
      workedExample: {
        scenario:
          "A single-family home addition in Richmond with a declared value of work of $12,300 (residential).",
        inputs: {
          valuationCents: 1_230_000,
          occupancy: "residential",
        },
        notes:
          "Above the first $2,000 there is $10,300 of value, which rounds up to eleven whole $1,000 steps ('or fraction thereof'): 11 × $6.07 = **$66.77**, plus the **$63.00** base = $129.77. The 2% state surcharge adds **$2.60**. Total: $129.77 + $2.60 = **$132.37**.",
      },
      faqs: [
        {
          question: "How is a Richmond building permit fee calculated?",
          answer:
            "Residential 1 & 2 family permits are $63.00 for the first $2,000 of value of work plus $6.07 per $1,000 or fraction thereof above $2,000; commercial permits are $131.00 plus $8.50 per $1,000 or fraction. A 2% state surcharge is added to the final calculated fee.",
          sourceId: RVA_FEE_SCHEDULE_KEY,
          attribution: "City of Richmond Fee Schedule, effective 07/01/2024",
        },
        {
          question: "What value does Richmond use to calculate the fee?",
          answer:
            "The schedule states that the value of work equals the higher of either the contractor estimate or the RS Means price — the City checks your declaration against its own valuation data.",
          sourceId: RVA_FEE_SCHEDULE_KEY,
          attribution: "City of Richmond Fee Schedule NOTE",
        },
        {
          question: "Does a Richmond building permit cover electrical and plumbing work?",
          answer:
            "No. The City states that a building permit covers only the building and structural portion of a project; electrical, mechanical and plumbing work is done under separate trade permits reviewed when submitted.",
          sourceId: RVA_DEPARTMENT_PAGE_KEY,
          attribution: "Richmond Permits and Inspections page",
        },
        {
          question: "What happens if I withdraw or abandon a permit application?",
          answer:
            "Withdrawn or rejected applications owe a minimum administrative fee of 5% of the initial permit fee (never less than $25), and withdrawn plan reviews owe at least 10% of the initial fee ($25 minimum).",
          sourceId: RVA_FEE_SCHEDULE_KEY,
          attribution: "City of Richmond Fee Schedule",
        },
        {
          question: "How does the 'or fraction thereof' rounding work?",
          answer:
            "The value above $2,000 rounds up to the next whole $1,000 before the rate applies: $10,300 of residential work above the threshold pays eleven $6.07 steps ($66.77), not ten and a fraction ($62.52).",
          sourceId: RVA_FEE_SCHEDULE_KEY,
          attribution: "City of Richmond Fee Schedule",
        },
      ],
      seoTitle: "Richmond VA Building Permit Cost (Value of Work Formulas)",
      seoDescription:
        "Richmond building permits: $63 + $6.07 per $1,000 or fraction residential, $131 + $8.50 commercial, plus the 2% state surcharge.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: RVA_LAST_VERIFIED,
    },
    {
      jurisdictionKey: RVA_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      slug: "electrical-permit-cost",
      title: "Richmond Electrical Permit Cost",
      intro:
        "Richmond prices electrical work on the same ladder as the building permit: the schedule's opening paragraph lists the **electrical permit** among those 'calculated as follows' — **$63.00 for the first $2,000** of the value of work plus **$6.07 per $1,000 or fraction thereof** for residential (1 & 2 family), **$131.00 plus $8.50 per $1,000 or fraction** for commercial, with the **2% state surcharge** on the final fee.",
      localSummary:
        "Electrical work files under its own trade permit, reviewed for code compliance when submitted under the 2021 VUSBC and the NEC (NFPA 70, 2020). The trade permit reads the same value of work — the higher of the contractor estimate or RS Means — so a small panel service or circuit extension prices at the $63.00 base, and larger fit-outs climb the ladder. Zoning review may be required for exterior parking-area lighting and additional meters in main or accessory buildings.",
      notIncluded:
        "Dominion Energy meter and service charges, electrical certification for change in use ($60/hour inspection and report), after-hours inspections ($90/hour for electrical), and re-inspection charges are outside the trade permit fee.",
      workedExample: {
        scenario:
          "A licensed electrician pulls a residential trade permit for a heat-pump circuit and panel work valued at $3,500.",
        inputs: {
          valuationCents: 350_000,
          occupancy: "residential",
        },
        notes:
          "Above the first $2,000 there is $1,500 of value, which rounds up to two whole $1,000 steps: 2 × $6.07 = **$12.14**, plus the **$63.00** base = $75.14. The 2% state surcharge adds **$1.50**. Total: $75.14 + $1.50 = **$76.64**.",
      },
      faqs: [
        {
          question: "What does an electrical permit cost in Richmond?",
          answer:
            "The same value-of-work ladder as the building permit: $63.00 for the first $2,000 plus $6.07 per $1,000 or fraction thereof for residential, $131.00 plus $8.50 for commercial, plus the 2% state surcharge.",
          sourceId: RVA_FEE_SCHEDULE_KEY,
          attribution: "City of Richmond Fee Schedule",
        },
        {
          question: "Does electrical work need its own permit if I have a building permit?",
          answer:
            "Yes. The City states that any electrical, mechanical and plumbing work for a project is done under a separate trade permit, reviewed for code compliance when that permit is submitted.",
          sourceId: RVA_DEPARTMENT_PAGE_KEY,
          attribution: "Richmond Permits and Inspections page",
        },
        {
          question: "When does an electrical permit trigger zoning review in Richmond?",
          answer:
            "Zoning Division staff may review electrical permit applications for exterior parking-area lighting and additional meters in main or accessory buildings.",
          sourceId: RVA_DEPARTMENT_PAGE_KEY,
          attribution: "Richmond Permits and Inspections FAQ",
        },
        {
          question: "What code governs electrical inspections in Richmond?",
          answer:
            "The 2021 Virginia Uniform Statewide Building Code with the National Electrical Code, NFPA 70 (2020 edition), as adopted by the City.",
          sourceId: RVA_DEPARTMENT_PAGE_KEY,
          attribution: "Richmond Building Codes for Richmond, Virginia",
        },
      ],
      seoTitle: "Richmond VA Electrical Permit Cost & Requirements",
      seoDescription:
        "Richmond electrical trade permits: $63 + $6.07 per $1,000 or fraction residential, $131 + $8.50 commercial, plus the 2% state surcharge.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: RVA_LAST_VERIFIED,
    },
    {
      jurisdictionKey: RVA_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      slug: "plumbing-permit-cost",
      title: "Richmond Plumbing Permit Cost",
      intro:
        "A Richmond plumbing trade permit reads the same value-of-work ladder: **$63.00 for the first $2,000** plus **$6.07 per $1,000 or fraction thereof** for residential, **$131.00 plus $8.50 per $1,000 or fraction** for commercial — the schedule lists the **plumbing permit** among those 'calculated as follows' — with the **2% state surcharge** added to the final fee.",
      localSummary:
        "Plumbing work files under its own trade permit under the 2021 Virginia Plumbing Code, reviewed when submitted. Adding plumbing fixtures in main or accessory buildings that might create additional kitchen or bathing facilities can trigger zoning review as well. Gas-piping work files under its own named permit on the same schedule. The City's plan-review checklists set the minimum standards designs must meet before a plumbing permit is issued.",
      notIncluded:
        "Department of Public Utilities water and sewer connection charges, grease-trap sizing review for food service, re-inspections ($32 residential / $63 commercial), and after-hours inspections are outside the trade permit fee.",
      workedExample: {
        scenario:
          "A commercial tenant fit-out adds a break-room sink and water heater, with plumbing work valued at $6,800.",
        inputs: {
          valuationCents: 680_000,
          occupancy: "commercial",
        },
        notes:
          "Above the first $2,000 there is $4,800 of value, which rounds up to five whole $1,000 steps: 5 × $8.50 = **$42.50**, plus the **$131.00** base = $173.50. The 2% state surcharge adds **$3.47**. Total: $173.50 + $3.47 = **$176.97**.",
      },
      faqs: [
        {
          question: "What does a plumbing permit cost in Richmond?",
          answer:
            "The value-of-work ladder applies: $63.00 plus $6.07 per $1,000 or fraction thereof for residential 1 & 2 family, $131.00 plus $8.50 per $1,000 or fraction for commercial, plus the 2% state surcharge.",
          sourceId: RVA_FEE_SCHEDULE_KEY,
          attribution: "City of Richmond Fee Schedule",
        },
        {
          question: "Does adding fixtures ever trigger zoning review?",
          answer:
            "Yes. Plumbing permit applications for adding fixtures in main or accessory buildings that might create additional kitchen or bathing facilities may be reviewed by Zoning Division staff.",
          sourceId: RVA_DEPARTMENT_PAGE_KEY,
          attribution: "Richmond Permits and Inspections FAQ",
        },
        {
          question: "Is gas piping covered by the plumbing permit?",
          answer:
            "No. The schedule names gas-piping permits separately from plumbing permits; both are priced by the same value-of-work formulas, but they file as their own permits.",
          sourceId: RVA_FEE_SCHEDULE_KEY,
          attribution: "City of Richmond Fee Schedule",
        },
        {
          question: "How much is a plumbing re-inspection in Richmond?",
          answer:
            "$32.00 residential and $63.00 commercial for a re-inspection or failure to appear for an on-site inspection other than a required one.",
          sourceId: RVA_FEE_SCHEDULE_KEY,
          attribution: "City of Richmond Fee Schedule",
        },
      ],
      seoTitle: "Richmond VA Plumbing Permit Cost & Regulations",
      seoDescription:
        "Richmond plumbing trade permits: $63 + $6.07 per $1,000 or fraction residential, $131 + $8.50 commercial, plus the 2% state surcharge.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: RVA_LAST_VERIFIED,
    },
  ],

  verifications: [
    {
      entityType: "jurisdiction_profile",
      entityKey: RVA_KEYS.jurisdiction,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: RVA_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Virginia Expansion",
      sourceKey: RVA_FEE_SCHEDULE_KEY,
      notes:
        "The two-page fee schedule was read with pdftotext; formulas, thresholds, rounding language and the 2% state surcharge verified against the 07/01/2024 revision.",
    },
    {
      entityType: "fee_schedule",
      entityKey: RVA_FEE_SCHEDULE_KEY,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: RVA_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Virginia Expansion",
      sourceKey: RVA_FEE_SCHEDULE_KEY,
      notes:
        "Verified the residential ($63 + $6.07/$1,000 or fraction) and commercial ($131 + $8.50/$1,000 or fraction) formulas above the $2,000 threshold.",
    },
    {
      entityType: "permit_page",
      entityKey: "building-permit-cost",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: RVA_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Virginia Expansion",
      sourceKey: RVA_FEE_SCHEDULE_KEY,
      notes: "Passed editorial gate checks for building permit page.",
    },
    {
      entityType: "permit_page",
      entityKey: "electrical-permit-cost",
      permitTypeKey: "electrical",
      status: "verified",
      method: "official_portal_check",
      verifiedAt: RVA_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Virginia Expansion",
      sourceKey: RVA_FEE_SCHEDULE_KEY,
      notes: "Passed editorial gate checks for electrical permit page.",
    },
    {
      entityType: "permit_page",
      entityKey: "plumbing-permit-cost",
      permitTypeKey: "plumbing",
      status: "verified",
      method: "official_portal_check",
      verifiedAt: RVA_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Virginia Expansion",
      sourceKey: RVA_FEE_SCHEDULE_KEY,
      notes: "Passed editorial gate checks for plumbing permit page.",
    },
  ],
};
