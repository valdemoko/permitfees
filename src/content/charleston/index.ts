import type { JurisdictionSeed } from "@/content/seed-types";
import {
  CHAS_BUILDING_RULES as CHS_BUILDING_RULES,
  CHAS_ELECTRICAL_RULES as CHS_ELECTRICAL_RULES,
  CHAS_FEE_EFFECTIVE_FROM as CHS_FEE_EFFECTIVE_FROM,
  CHAS_BUILDING_SOURCE_KEY as CHS_FEE_SCHEDULE_KEY,
  CHAS_PLUMBING_RULES as CHS_PLUMBING_RULES,
} from "@/content/charleston/fee-rules";

export const CHS_LAST_VERIFIED = "2026-09-26";

export const CHS_KEYS = {
  state: "sc",
  county: "charleston-county",
  jurisdiction: "charleston",
  schedule: CHS_FEE_SCHEDULE_KEY,
} as const;

const state = {
  code: "SC",
  slug: "south-carolina",
  name: "South Carolina",
  fipsCode: "45",
};

const county = {
  key: CHS_KEYS.county,
  slug: "charleston-county",
  name: "Charleston County",
  fipsCode: "45019",
};

const SCHEDULE_URL = "https://www.charleston-sc.gov/DocumentCenter/View/39116";
const APPS_URL = "https://www.charleston-sc.gov/2483/Applications-Guidelines";
const PERMIT_CENTER_URL = "https://www.charleston-sc.gov/856/Permit-Center";

export const charlestonSeed: JurisdictionSeed = {
  state,
  county,

  jurisdiction: {
    key: CHS_KEYS.jurisdiction,
    stateKey: CHS_KEYS.state,
    countyKey: CHS_KEYS.county,
    type: "city",
    slug: "charleston",
    name: "Charleston",
    officialName: "City of Charleston — Building Inspections Division",
    websiteUrl: "https://www.charleston-sc.gov",
    permitPortalUrl: PERMIT_CENTER_URL,
    timezone: "America/New_York",
    isActive: true,
  },

  departments: [
    {
      key: "charleston-building-inspections",
      jurisdictionKey: CHS_KEYS.jurisdiction,
      kind: "building",
      name: "Building Inspections Division",
      phone: "(843) 724-7311",
      email: "permits@charleston-sc.gov",
      url: PERMIT_CENTER_URL,
      addressLine: "2 George Street, Charleston, SC 29401",
      hours: "Monday – Friday, 7:30 a.m. – 5:00 p.m. ET",
      notes:
        "The Building Inspections Division of the Department of Public Service issues building and trade permits, performs plan review, and inspects construction throughout the City of Charleston under the Building and Trade Permit Fee Schedule.",
    },
  ],

  sources: [
    {
      key: CHS_FEE_SCHEDULE_KEY,
      jurisdictionKey: CHS_KEYS.jurisdiction,
      title: "City of Charleston Building and Trade Permit Fee Schedule",
      url: SCHEDULE_URL,
      sourceType: "fee_schedule_pdf",
      issuingAuthority: "Charleston City Council",
      authorityKind: "city",
      isPrimary: true,
      documentDate: "2019-10-01",
      effectiveFrom: CHS_FEE_EFFECTIVE_FROM,
      retrievedAt: "2026-09-26",
      lastVerifiedAt: CHS_LAST_VERIFIED,
      notes:
        "Approved by Ordinance Nos. 2017-131, 2019-064 & 2019-072, effective October 1, 2019. $40 non-refundable application fee on all building and trade permits; plan review 50% of the building permit fee; residential valuation ladder $35.00 + $5.50 per $1,000 or fraction to $50,000, $290.00 + $4.64 to $100,000, $522.00 + $3.00 to $500,000, $1,600.00 + $2.00 above; valuation from ICC Building Valuation Data ($116.15/sq ft finished structures in the schedule's example).",
    },
    {
      key: "charleston-apps-guidelines",
      jurisdictionKey: CHS_KEYS.jurisdiction,
      title: "Applications & Guidelines (Permit Center)",
      url: APPS_URL,
      sourceType: "municipal_website",
      issuingAuthority: "City of Charleston Development Services",
      authorityKind: "city",
      isPrimary: true,
      documentDate: "2026-09-26",
      effectiveFrom: CHS_FEE_EFFECTIVE_FROM,
      retrievedAt: "2026-09-26",
      lastVerifiedAt: CHS_LAST_VERIFIED,
      notes:
        "Names the Building Inspections Fee Schedule as the document of record and links the fee-schedule PDF used as this seed's primary source.",
    },
  ],

  permitTypes: [],
  projectTypes: [],

  jurisdictionPermitTypes: [
    {
      jurisdictionKey: CHS_KEYS.jurisdiction,
      permitTypeKey: "building",
      isAvailable: true,
      localName: "Building Permit",
      officialUrl: SCHEDULE_URL,
      notes:
        "Priced from construction valuation on a five-row ladder ($35 + $5.50/$1,000 or fraction in the lowest charged band, chaining to $1,600 + $2.00 above $500,000), with a 50% plan review when plans are required and the $40 application fee.",
    },
    {
      jurisdictionKey: CHS_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      isAvailable: true,
      localName: "Electrical Trade Permit",
      officialUrl: SCHEDULE_URL,
      notes:
        "Trade permits carry the $40 application fee; plan review at 50% applies when plans are required. Work inside a master building permit's scope files under the master permit.",
    },
    {
      jurisdictionKey: CHS_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      isAvailable: true,
      localName: "Plumbing Trade Permit",
      officialUrl: SCHEDULE_URL,
      notes:
        "Trade permits carry the $40 application fee; plan review at 50% applies when plans are required. Work inside a master building permit's scope files under the master permit.",
    },
  ],

  feeSchedules: [
    {
      key: CHS_FEE_SCHEDULE_KEY,
      jurisdictionKey: CHS_KEYS.jurisdiction,
      sourceKey: CHS_FEE_SCHEDULE_KEY,
      title: "Charleston Building and Trade Permit Fee Schedule (Ord. 2017-131, 2019-064, 2019-072)",
      officialUrl: SCHEDULE_URL,
      effectiveFrom: CHS_FEE_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: CHS_LAST_VERIFIED,
      notes:
        "One ordinance-approved schedule covers building, trade, re-inspection and plan-revision fees for the City of Charleston.",
    },
  ],

  feeRules: [
    ...CHS_BUILDING_RULES.map((rule) => ({
      jurisdictionKey: CHS_KEYS.jurisdiction,
      permitTypeKey: "building",
      scheduleKey: CHS_FEE_SCHEDULE_KEY,
      rule,
    })),
    ...CHS_ELECTRICAL_RULES.map((rule) => ({
      jurisdictionKey: CHS_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      scheduleKey: CHS_FEE_SCHEDULE_KEY,
      rule,
    })),
    ...CHS_PLUMBING_RULES.map((rule) => ({
      jurisdictionKey: CHS_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      scheduleKey: CHS_FEE_SCHEDULE_KEY,
      rule,
    })),
  ],

  requirements: [
    {
      jurisdictionKey: CHS_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "document",
      title: "Construction Cost Declaration",
      description:
        "Construction cost includes the total value of work — all labor and material at current retail value plus overhead and profit (total contract price). A copy of the executed contract is provided when the project involves a contractor.",
      isMandatory: true,
      sortOrder: 1,
      sourceKey: CHS_FEE_SCHEDULE_KEY,
      lastVerifiedAt: CHS_LAST_VERIFIED,
    },
    {
      jurisdictionKey: CHS_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "document",
      title: "ICC-Based Valuation for New Residential Construction",
      description:
        "Single-family new construction permits are calculated using the per-square-foot construction valuations from the most recently published ICC Building Valuation Data adopted by City Council.",
      isMandatory: true,
      sortOrder: 2,
      sourceKey: CHS_FEE_SCHEDULE_KEY,
      lastVerifiedAt: CHS_LAST_VERIFIED,
    },
    {
      jurisdictionKey: CHS_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      requirementType: "license",
      title: "South Carolina Electrical Contractor License",
      description:
        "Trade permits are issued to contractors licensed by South Carolina LLR; the Board of Architectural Review and Technical Review Committee reviews may apply in the historic districts before issuance.",
      isMandatory: true,
      sortOrder: 3,
      sourceKey: CHS_FEE_SCHEDULE_KEY,
      lastVerifiedAt: CHS_LAST_VERIFIED,
    },
    {
      jurisdictionKey: CHS_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      requirementType: "license",
      title: "South Carolina Plumbing Contractor License",
      description:
        "Plumbing trade permits are issued to state-licensed plumbing contractors; work in the historic districts may require BAR review before the permit is issued.",
      isMandatory: true,
      sortOrder: 4,
      sourceKey: CHS_FEE_SCHEDULE_KEY,
      lastVerifiedAt: CHS_LAST_VERIFIED,
    },
  ],

  profile: {
    jurisdictionKey: CHS_KEYS.jurisdiction,
    headline: "Charleston, South Carolina Permit Fees & Municipal Building Code",
    summary:
      "Charleston's Building Inspections Division prices permits under one ordinance-approved schedule: a non-refundable $40 application fee on every building and trade permit, plan review at 50% of the building permit fee, and a residential valuation ladder that opens at $35.00 plus $5.50 per $1,000 or fraction thereof and chains to $1,600 plus $2.00 per $1,000 above $500,000 — with valuations for new single-family homes set from ICC Building Valuation Data.",
    localContext:
      "Charleston enforces the South Carolina Building Codes with the City's Board of Architectural Review (BAR-L and BAR-S) and Design Review Board reviews layered over permits in the historic and design districts. The schedule's applicability section names BAR, DRB, Board of Zoning Appeals and Technical Review Committee fees as belonging to the same fee family.\n\nWhat distinguishes Charleston's ladder is that it chains exactly at every seam: the $290.00 base of the $50,001–$100,000 band is precisely what the $35.00 + $5.50/$1,000 arithmetic produces at $50,000, and the same is true at $100,000 and $500,000. Affordable housing as defined in Chapter 54 of the City Code receives a 100% waiver of building permit fees, and work valued at $1,000 or less pays the application fee alone. The City cut its permit backlog through 2025, issuing more than 16,000 permits in the year.",
    valuationBasis:
      "Construction cost is the total value of work — labor and material at current retail value plus overhead and profit (the total contract price). For single-family new construction the City derives valuation from ICC Building Valuation Data per square foot, adopted by Council.",
    notIncluded:
      "These municipal figures cover the building permit, plan review, trade permits and the application fee. They exclude:\n\n- **Board of Architectural Review and Design Review Board filing fees** for work in the historic districts.\n- **Re-inspection fees** ($100.00 per failed re-inspection) and plan-revision review fees ($100 commercial / $50 residential per discipline).\n- **Zoning, floodplain and site development review** fees outside the building permit.\n- **Water and sewer tap fees** billed by the City's utilities.",
    seoTitle: "Charleston SC Permit Fees | Official Fee Schedule & Cost Calculator",
    seoDescription:
      "Calculate Charleston, SC permit costs: $40 application fee, plan review at 50% of the permit, valuation ladder from $35 + $5.50 per $1,000 or fraction.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: CHS_LAST_VERIFIED,
  },

  permitPages: [
    {
      jurisdictionKey: CHS_KEYS.jurisdiction,
      permitTypeKey: "building",
      slug: "building-permit-cost",
      title: "Charleston, SC Building Permit Cost",
      intro:
        "A Charleston building permit is priced from **construction valuation** on an ordinance-approved ladder: **$35.00 for the first $1,000 plus $5.50 per additional $1,000 or fraction thereof** up to $50,000, chaining through $4.64, $3.00 and finally **$2.00 per $1,000 above $500,000**. Plans required over $1,000 of valuation add a plan review at **50% of the building permit fee**, and every permit carries the **$40.00 non-refundable application fee**. New single-family valuation comes from the City's ICC Building Valuation Data — $116.15 per sq ft for finished structures in the schedule's own example.",
      localSummary:
        "Building permits are issued by the Building Inspections Division at 2 George Street and reviewed against the South Carolina Building Codes, with Board of Architectural Review sign-off layered on in the historic districts. The ladder chains exactly at every seam — the $290.00 base at $50,001 is what the $5.50 rate produces at $50,000 — so there is no discontinuity when a project crosses a band. Work inside the City's affordability definitions (Chapter 54) receives a 100% waiver of building permit fees, and permits valued at $1,000 or less pay the application fee alone.",
      notIncluded:
        "This estimate covers the building permit, its plan review and the application fee. It excludes:\n\n- **BAR/DRB filing fees** for historic and design district work.\n- **Re-inspections** at $100.00 each when work fails inspection.\n- **Plan-revision reviews** ($100 commercial / $50 residential per trade discipline) when revisions increase construction cost.\n- **Water, sewer and site development fees** outside the building permit.",
      workedExample: {
        scenario:
          "A new single-family home in Charleston with 1,800 sq ft of finished area (valuation $209,070 at the schedule's ICC example rate).",
        inputs: {
          valuationCents: 20_907_000, // 1,800 sq ft x $116.15/sq ft
          squareFootage: 1800,
          occupancy: "residential",
        },
        notes:
          "Valuation is 1,800 sq ft × $116.15 = **$209,070**. The ladder band $100,001–$500,000 applies: $522.00 base + ($209,070 − $100,000 rounds up to 110 thousand steps) × $3.00 = $522.00 + **$330.00** = $852.00. Plan review at 50% adds **$426.00**, and the application fee **$40.00**. Total: $852.00 + $426.00 + $40.00 = **$1,318.00**.",
      },
      faqs: [
        {
          question: "How is a Charleston building permit fee calculated?",
          answer:
            "The Residential Valuation Permit Fee Table prices from construction valuation: $35.00 for the first $1,000 plus $5.50 per additional thousand or fraction thereof to $50,000, then $290.00 + $4.64 per $1,000 to $100,000, $522.00 + $3.00 to $500,000, and $1,600.00 + $2.00 above.",
          sourceId: CHS_FEE_SCHEDULE_KEY,
          attribution: "Charleston Building and Trade Permit Fee Schedule (Ord. 2017-131)",
        },
        {
          question: "How much is the plan review fee in Charleston?",
          answer:
            "When the proposed construction exceeds $1,000 in valuation and plans are required, the plan review fee equals one half (50%) of the building permit fee.",
          sourceId: CHS_FEE_SCHEDULE_KEY,
          attribution: "Charleston Building and Trade Permit Fee Schedule",
        },
        {
          question: "What is the application fee for a Charleston permit?",
          answer:
            "$40.00, non-refundable, required for all building and trade permits and in addition to any applicable permit fees.",
          sourceId: CHS_FEE_SCHEDULE_KEY,
          attribution: "Charleston Building and Trade Permit Fee Schedule",
        },
        {
          question: "How is the valuation of a new home determined?",
          answer:
            "The fee for single-family residential new construction is based on valuation of construction determined by the Building Official using the most recently published ICC Building Valuation Data adopted by City Council — the schedule's example prints $116.15 per square foot for finished building structures.",
          sourceId: CHS_FEE_SCHEDULE_KEY,
          attribution: "Charleston Building and Trade Permit Fee Schedule",
        },
        {
          question: "Are any permits fee-waived in Charleston?",
          answer:
            "Yes. There is a waiver of 100% for all building permit fees required for construction of single-family detached residences qualifying as affordable housing as defined in Chapter 54 of the City Code.",
          sourceId: CHS_FEE_SCHEDULE_KEY,
          attribution: "Charleston Building and Trade Permit Fee Schedule",
        },
        {
          question: "What happens when work fails inspection?",
          answer:
            "A re-inspection fee of $100.00 is charged when a re-inspection is required as a result of the permit holder failing to comply with code; if more than one is required, only one $100.00 charge is applied to any element of construction for the same violation found in the initial inspection.",
          sourceId: CHS_FEE_SCHEDULE_KEY,
          attribution: "Charleston Building and Trade Permit Fee Schedule",
        },
      ],
      seoTitle: "Charleston SC Building Permit Cost (Valuation Ladder & Plan Review)",
      seoDescription:
        "Charleston building permits: $35 + $5.50 per $1,000 or fraction ladder, plan review at 50%, $40 application fee, ICC-based new-home valuation.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: CHS_LAST_VERIFIED,
    },
    {
      jurisdictionKey: CHS_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      slug: "electrical-permit-cost",
      title: "Charleston, SC Electrical Permit Cost",
      intro:
        "An electrical trade permit in Charleston carries the **$40.00 non-refundable application fee**, with the schedule's trade row pricing the permit itself at a **flat $75.00**; when plans are required for the scope, plan review adds **50% of the permit fee**, and plan revisions that increase cost run **$100.00 per trade discipline** (commercial) or $50.00 (residential).",
      localSummary:
        "Electrical trade permits file through the Permit Center with the contractor's South Carolina LLR license. Work already inside a master building permit's scope files under the master permit rather than as a separate trade permit. Inspections follow rough-in and final; failed re-inspections are $100.00. Historic-district work may need Board of Architectural Review approval before the trade permit is issued.",
      notIncluded:
        "Utility meter and service charges, re-inspection fees, plan-revision fees, and BAR/DRB filing fees for historic-district work are outside the trade permit fee.",
      workedExample: {
        scenario:
          "A licensed electrician pulls a trade permit for a residential service upgrade and kitchen circuits in Charleston.",
        inputs: {
          valuationCents: 550_000,
        },
        notes:
          "The electrical trade row prices the permit at **$75.00**. The application fee adds **$40.00**. Total: $75.00 + $40.00 = **$115.00**. (A plan review at 50% applies only when plans are required for the scope.)",
      },
      faqs: [
        {
          question: "What does an electrical permit cost in Charleston?",
          answer:
            "The trade row prices the electrical permit at a flat $75.00, and the $40.00 non-refundable application fee applies to every trade permit — $115.00 before any plan review.",
          sourceId: CHS_FEE_SCHEDULE_KEY,
          attribution: "Charleston Building and Trade Permit Fee Schedule",
        },
        {
          question: "Do I need a separate electrical permit if I have a building permit?",
          answer:
            "Work included in the scope of a building permit files under the master permit. Standalone trade permits are for electrical work pursued on its own — service changes, rewiring, or work with no building permit in place.",
          sourceId: CHS_FEE_SCHEDULE_KEY,
          attribution: "Charleston Building and Trade Permit Fee Schedule",
        },
        {
          question: "How much is a plan revision review for electrical work?",
          answer:
            "$100.00 per trade discipline for commercial construction and $50.00 per discipline for residential, charged when plan revisions or an updated scope of work result in an increase in construction cost.",
          sourceId: CHS_FEE_SCHEDULE_KEY,
          attribution: "Charleston Building and Trade Permit Fee Schedule",
        },
        {
          question: "Who can pull an electrical permit in Charleston?",
          answer:
            "Trade permits are issued to contractors licensed by South Carolina's Department of Labor, Licensing and Regulation; historic-district work may also require Board of Architectural Review approval first.",
          sourceId: CHS_FEE_SCHEDULE_KEY,
          attribution: "Charleston Building Inspections Division",
        },
      ],
      seoTitle: "Charleston SC Electrical Permit Cost & Requirements",
      seoDescription:
        "Charleston electrical trade permits: $75 trade row plus the $40 application fee, plan review at 50% when plans are required.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: CHS_LAST_VERIFIED,
    },
    {
      jurisdictionKey: CHS_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      slug: "plumbing-permit-cost",
      title: "Charleston, SC Plumbing Permit Cost",
      intro:
        "A plumbing trade permit in Charleston carries the **$40.00 non-refundable application fee** with the trade row pricing the permit at a **flat $75.00**; plan review at **50% of the permit fee** applies when plans are required, re-inspections run **$100.00**, and plan revisions that increase cost are **$100.00 per trade discipline** commercial / $50.00 residential.",
      localSummary:
        "Plumbing trade permits file through the Permit Center under South Carolina-licensed plumbing contractors, with inspections at rough-in and final. Coastal flooding rules make elevation certificates and floodplain review relevant for ground-floor work in much of the city, and BAR approval may precede the permit in the historic districts. Work inside a building permit's scope files under the master permit.",
      notIncluded:
        "Water and sewer tap and capacity fees, floodplain review fees, re-inspections, and BAR filing fees are outside the trade permit fee.",
      workedExample: {
        scenario:
          "A plumbing contractor pulls a trade permit for a bathroom repipe and water heater replacement in Charleston.",
        inputs: {
          valuationCents: 400_000,
        },
        notes:
          "The plumbing trade row prices the permit at **$75.00**, and the application fee adds **$40.00**. Total: $75.00 + $40.00 = **$115.00**.",
      },
      faqs: [
        {
          question: "What does a plumbing permit cost in Charleston?",
          answer:
            "The trade row prices the plumbing permit at a flat $75.00 plus the $40.00 non-refundable application fee — $115.00 before any plan review.",
          sourceId: CHS_FEE_SCHEDULE_KEY,
          attribution: "Charleston Building and Trade Permit Fee Schedule",
        },
        {
          question: "When does plumbing work need plan review?",
          answer:
            "When the proposed construction exceeds $1,000 in valuation and plans are required, the plan review fee is 50% of the permit fee, which includes the initial review and a follow-up review verifying corrections.",
          sourceId: CHS_FEE_SCHEDULE_KEY,
          attribution: "Charleston Building and Trade Permit Fee Schedule",
        },
        {
          question: "Does Charleston have a working-without-a-permit penalty?",
          answer:
            "Yes. Where work for which a permit is required is started without obtaining one, the fee is doubled but the total shall not remain less than the standard fee — the schedule's penalty section governs permits obtained after the fact.",
          sourceId: CHS_FEE_SCHEDULE_KEY,
          attribution: "Charleston Building and Trade Permit Fee Schedule",
        },
        {
          question: "Are fee refunds available if I cancel a permit?",
          answer:
            "Refunds are only applicable to those services not yet rendered by the City. Requests go to the Chief Building Official by letter with the permit number and reason; no refund is authorized after work has begun.",
          sourceId: CHS_FEE_SCHEDULE_KEY,
          attribution: "Charleston Building and Trade Permit Fee Schedule",
        },
      ],
      seoTitle: "Charleston SC Plumbing Permit Cost & Regulations",
      seoDescription:
        "Charleston plumbing trade permits: $75 trade row plus the $40 application fee, plan review at 50%, $100 re-inspections.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: CHS_LAST_VERIFIED,
    },
  ],

  verifications: [
    {
      entityType: "jurisdiction_profile",
      entityKey: CHS_KEYS.jurisdiction,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: CHS_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence South Carolina Expansion",
      sourceKey: CHS_FEE_SCHEDULE_KEY,
      notes:
        "The seven-page schedule was read page-by-page from the rendered PDF (the document has no text layer); ordinance numbers, effective date, application fee, plan-review percentage and the valuation ladder verified from the page images.",
    },
    {
      entityType: "fee_schedule",
      entityKey: CHS_FEE_SCHEDULE_KEY,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: CHS_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence South Carolina Expansion",
      sourceKey: CHS_FEE_SCHEDULE_KEY,
      notes:
        "Verified the four charged ladder bands with their printed bases and per-$1,000 rates, the 50% plan review, the $40 application fee and the ICC valuation example.",
    },
    {
      entityType: "permit_page",
      entityKey: "building-permit-cost",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: CHS_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence South Carolina Expansion",
      sourceKey: CHS_FEE_SCHEDULE_KEY,
      notes: "Passed editorial gate checks for building permit page.",
    },
    {
      entityType: "permit_page",
      entityKey: "electrical-permit-cost",
      permitTypeKey: "electrical",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: CHS_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence South Carolina Expansion",
      sourceKey: CHS_FEE_SCHEDULE_KEY,
      notes: "Passed editorial gate checks for electrical permit page.",
    },
    {
      entityType: "permit_page",
      entityKey: "plumbing-permit-cost",
      permitTypeKey: "plumbing",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: CHS_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence South Carolina Expansion",
      sourceKey: CHS_FEE_SCHEDULE_KEY,
      notes: "Passed editorial gate checks for plumbing permit page.",
    },
  ],
};
