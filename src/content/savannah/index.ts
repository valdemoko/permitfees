import type { JurisdictionSeed } from "@/content/seed-types";
import {
  SAV_BUILDING_RULES,
  SAV_CODE_KEY,
  SAV_ELECTRICAL_RULES,
  SAV_FEE_EFFECTIVE_FROM,
  SAV_PLUMBING_RULES,
  SAV_REVENUE_ORDINANCE_KEY,
} from "@/content/savannah/fee-rules";

export const SAV_LAST_VERIFIED = "2026-09-26";

export const SAV_KEYS = {
  state: "ga",
  county: "chatham-county",
  jurisdiction: "savannah",
  ordinance: SAV_REVENUE_ORDINANCE_KEY,
  code: SAV_CODE_KEY,
} as const;

const state = {
  code: "GA",
  slug: "georgia",
  name: "Georgia",
  fipsCode: "13",
};

const county = {
  key: SAV_KEYS.county,
  slug: "chatham-county",
  name: "Chatham County",
  fipsCode: "13051",
};

const ORDINANCE_URL =
  "https://online.encodeplus.com/regs/savannah-ga/doclibrary.aspx?id=6c9013ee-e3c6-4847-b66d-c0d730e114a8";
const CODE_URL = "https://online.encodeplus.com/regs/savannah-ga/doc-viewer.aspx?secid=1493";
const CITY_URL = "https://www.savannahga.gov";

export const savannahSeed: JurisdictionSeed = {
  state,
  county,

  jurisdiction: {
    key: SAV_KEYS.jurisdiction,
    stateKey: SAV_KEYS.state,
    countyKey: SAV_KEYS.county,
    type: "city",
    slug: "savannah",
    name: "Savannah",
    officialName: "City of Savannah — Development Services Department",
    websiteUrl: CITY_URL,
    permitPortalUrl: CITY_URL,
    timezone: "America/New_York",
    isActive: true,
  },

  departments: [
    {
      key: "savannah-dev-services",
      jurisdictionKey: SAV_KEYS.jurisdiction,
      kind: "building",
      name: "Development Services Department",
      phone: "(912) 651-6530",
      email: null,
      url: CITY_URL,
      addressLine: "55 Broughton Street, Savannah, GA 31401",
      hours: "Monday – Friday, 8:00 a.m. – 5:00 p.m. ET",
      notes:
        "The Development Services Department issues building, electrical, mechanical and plumbing permits, performs plan review, and inspects construction throughout the City of Savannah under the Revenue Ordinance's Article P fee schedule.",
    },
  ],

  sources: [
    {
      key: SAV_REVENUE_ORDINANCE_KEY,
      jurisdictionKey: SAV_KEYS.jurisdiction,
      title: "City of Savannah Revenue Ordinance, Article P — Inspection Fees",
      url: ORDINANCE_URL,
      sourceType: "ordinance",
      issuingAuthority: "Savannah Mayor and Aldermen",
      authorityKind: "city",
      isPrimary: true,
      documentDate: "2022-01-01",
      effectiveFrom: SAV_FEE_EFFECTIVE_FROM,
      retrievedAt: "2026-09-26",
      lastVerifiedAt: SAV_LAST_VERIFIED,
      notes:
        "Article P §1: $8 per $1,000 of Cost of Construction to $5M, $4 per $1,000 to $10M, $2 per $1,000 above; $40 minimum; cost of construction = floor area x $80/sq ft residential or $125/sq ft commercial. §1(B)(1) plan review bands $40–$2,000. §2 and §4: electrical and plumbing $8 per $1,000 and any fraction thereof, $40 minimum. §19: $5 technology fee per permit.",
    },
    {
      key: SAV_CODE_KEY,
      jurisdictionKey: SAV_KEYS.jurisdiction,
      title: "City of Savannah Code of Ordinances (Part 9, Building and Housing)",
      url: CODE_URL,
      sourceType: "municipal_code",
      issuingAuthority: "Savannah Mayor and Aldermen",
      authorityKind: "city",
      isPrimary: true,
      documentDate: null,
      effectiveFrom: SAV_FEE_EFFECTIVE_FROM,
      retrievedAt: "2026-09-26",
      lastVerifiedAt: SAV_LAST_VERIFIED,
      notes:
        "The Code names the annual Revenue Ordinance as the instrument that sets permit fees; Article P of that ordinance carries the Inspection Fee schedule quoted throughout the seed.",
    },
  ],

  permitTypes: [],
  projectTypes: [],

  jurisdictionPermitTypes: [
    {
      jurisdictionKey: SAV_KEYS.jurisdiction,
      permitTypeKey: "building",
      isAvailable: true,
      localName: "All-Inclusive Building Permit",
      officialUrl: ORDINANCE_URL,
      notes:
        "Marginal valuation ladder: $8 per $1,000 of cost of construction to $5M, $4 per $1,000 to $10M, $2 per $1,000 above, with a $40 minimum, a valuation-banded plan review fee, and a $5 technology fee. Cost of construction is derived from floor area at $80/sq ft residential or $125/sq ft commercial.",
    },
    {
      jurisdictionKey: SAV_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      isAvailable: true,
      localName: "Standalone Electrical Permit",
      officialUrl: ORDINANCE_URL,
      notes:
        "$8 per $1,000 of total work cost, any fraction thereof, with a $40 minimum and a $5 technology fee. No electrical fee is charged for work already inside a building permit's scope.",
    },
    {
      jurisdictionKey: SAV_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      isAvailable: true,
      localName: "Standalone Plumbing Permit",
      officialUrl: ORDINANCE_URL,
      notes:
        "$8 per $1,000 of total work cost, any fraction thereof, with a $40 minimum and a $5 technology fee. No plumbing fee is charged for work already inside a building permit's scope.",
    },
  ],

  feeSchedules: [
    {
      key: SAV_REVENUE_ORDINANCE_KEY,
      jurisdictionKey: SAV_KEYS.jurisdiction,
      sourceKey: SAV_REVENUE_ORDINANCE_KEY,
      title: "Savannah Revenue Ordinance — Article P Inspection Fees",
      officialUrl: ORDINANCE_URL,
      effectiveFrom: SAV_FEE_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: SAV_LAST_VERIFIED,
      notes:
        "The annual Revenue Ordinance is the single instrument behind building, electrical, mechanical, plumbing and sign fees in Savannah.",
    },
  ],

  feeRules: [
    ...SAV_BUILDING_RULES.map((rule) => ({
      jurisdictionKey: SAV_KEYS.jurisdiction,
      permitTypeKey: "building",
      scheduleKey: SAV_REVENUE_ORDINANCE_KEY,
      rule,
    })),
    ...SAV_ELECTRICAL_RULES.map((rule) => ({
      jurisdictionKey: SAV_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      scheduleKey: SAV_REVENUE_ORDINANCE_KEY,
      rule,
    })),
    ...SAV_PLUMBING_RULES.map((rule) => ({
      jurisdictionKey: SAV_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      scheduleKey: SAV_REVENUE_ORDINANCE_KEY,
      rule,
    })),
  ],

  requirements: [
    {
      jurisdictionKey: SAV_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "document",
      title: "Construction Documents and Cost Calculation",
      description:
        "Plans are reviewed against the Revenue Ordinance's cost-of-construction definition: floor area multiplied by $80/sq ft for residential or $125/sq ft for commercial construction; renovation costs may be approved at staff level.",
      isMandatory: true,
      sortOrder: 1,
      sourceKey: SAV_REVENUE_ORDINANCE_KEY,
      lastVerifiedAt: SAV_LAST_VERIFIED,
    },
    {
      jurisdictionKey: SAV_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "license",
      title: "Georgia Contractor License and City Registration",
      description:
        "General contractors must hold the appropriate Georgia professional license (residential-light commercial or general contractor) and register with the City before pulling permits.",
      isMandatory: true,
      sortOrder: 2,
      sourceKey: SAV_REVENUE_ORDINANCE_KEY,
      lastVerifiedAt: SAV_LAST_VERIFIED,
    },
    {
      jurisdictionKey: SAV_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      requirementType: "license",
      title: "Georgia Electrical Contractor License (Class I/II)",
      description:
        "Standalone electrical permits are issued to contractors holding a Georgia electrical contractor license; low-voltage work follows the same Article P rate.",
      isMandatory: true,
      sortOrder: 3,
      sourceKey: SAV_REVENUE_ORDINANCE_KEY,
      lastVerifiedAt: SAV_LAST_VERIFIED,
    },
    {
      jurisdictionKey: SAV_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      requirementType: "license",
      title: "Georgia Class I Plumbing Contractor License",
      description:
        "Standalone plumbing permits are issued to contractors holding a Georgia Class I plumbing contractor license registered with the City.",
      isMandatory: true,
      sortOrder: 4,
      sourceKey: SAV_REVENUE_ORDINANCE_KEY,
      lastVerifiedAt: SAV_LAST_VERIFIED,
    },
  ],

  profile: {
    jurisdictionKey: SAV_KEYS.jurisdiction,
    headline: "Savannah, Georgia Permit Fees & Municipal Building Code",
    summary:
      "The City of Savannah Development Services Department regulates construction under the Revenue Ordinance's Article P fee schedule. The all-inclusive building permit is a marginal valuation ladder — $8 per $1,000 of cost of construction to $5 million, $4 to $10 million, $2 above — with a $40 minimum, banded plan review, and a $5 technology fee on every permit. Standalone electrical and plumbing permits are $8 per $1,000 of work cost with a $40 minimum.",
    localContext:
      "Savannah enforces the Georgia State Minimum Standard Codes with local amendments, including the historic-district review work of the Board of Architectural Review. The Development Services Department serves the city from Broughton Street.\n\nWhat makes Savannah distinctive is the cost-of-construction definition itself: the Revenue Ordinance derives it from floor area — $80.00 per square foot of residential floor area and $125.00 per square foot of commercial floor area — rather than from a contractor's declaration. Renovation costs may be approved at staff level. Work inside a building permit's scope pays no separate trade fee: Sections 2 and 4 charge electrical and plumbing fees only 'for work not covered by a building permit.' A $5.00 technology fee rides every all-inclusive building and standalone trade permit, and extra inspection trips run $50 for the first re-inspection and $100 after that.",
    valuationBasis:
      "Cost of construction is floor area in square feet multiplied by the Revenue Ordinance's construction cost multiplier — $80.00/sq ft residential, $125.00/sq ft commercial. Renovations may be costed on a staff-approved basis.",
    notIncluded:
      "These municipal figures cover the building permit, plan review, trade permits and the technology fee. They exclude:\n\n- **Water and sewer connection charges** billed by the City's Water and Sewer enterprise.\n- **Board of Architectural Review filing fees** for work in the historic districts.\n- **Impact fees** adopted under the City's Development Impact Fee program.\n- **Right-of-way permits** for work in the public way.",
    seoTitle: "Savannah GA Permit Fees | Official Fee Schedule & Cost Calculator",
    seoDescription:
      "Calculate official Savannah building permit costs: $8 per $1,000 marginal ladder on cost of construction, banded plan review, $5 technology fee, $40 minimum.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: SAV_LAST_VERIFIED,
  },

  permitPages: [
    {
      jurisdictionKey: SAV_KEYS.jurisdiction,
      permitTypeKey: "building",
      slug: "building-permit-cost",
      title: "Savannah Building Permit Cost",
      intro:
        "A Savannah building permit is the Revenue Ordinance's **all-inclusive fee**: **$8.00 per $1,000 of Cost of Construction** up to $5 million, **plus $4.00 per $1,000** between $5 and $10 million, **plus $2.00 per $1,000** above that, with a **$40.00 minimum**, a **valuation-banded plan review fee** ($40 to $2,000), and a **$5.00 technology fee** on every permit. The cost side is the City's own formula — floor area × **$80.00/sq ft residential** or × **$125.00/sq ft commercial** — not a contractor's declaration.",
      localSummary:
        "Building permits are issued by the Development Services Department and reviewed against the Revenue Ordinance's Article P schedule. Savannah's ladder is marginal: each band's rate applies only to the cost inside that band, so a $6 million project pays $40,000 on the first $5 million and $4 per $1,000 on the next million. Renovation costs may be approved at staff level, and working without a permit adds a $500 penalty or doubles the fee, whichever is greater. Inspections run from footing to final, and re-inspection trips caused by failed work are $50 for the first visit and $100 for each visit after.",
      notIncluded:
        "This estimate covers the all-inclusive building permit, its plan review, the minimum and the technology fee. It excludes:\n\n- **Water and sewer connection charges** billed by the City's utilities.\n- **Board of Architectural Review fees** for work inside the historic districts.\n- **Impact fees** under the City's Development Impact Fee program.\n- **Trade permits** for electrical, plumbing or mechanical work filed outside the building permit's scope.",
      workedExample: {
        scenario:
          "A new single-family home in Savannah with 1,800 sq ft of residential floor area.",
        inputs: {
          valuationCents: 14_400_000, // 1,800 sq ft x $80.00/sq ft = $144,000
          squareFootage: 1800,
          occupancy: "residential",
        },
        notes:
          "Cost of construction is 1,800 sq ft × $80.00 = **$144,000**. The permit fee is $8.00 per $1,000 × 144 = **$1,152.00**, above the $40.00 minimum. Plan review falls in the $100,001–$500,000 band, **$200.00**. The technology fee adds **$5.00**. Total: $1,152.00 + $200.00 + $5.00 = **$1,357.00**.",
      },
      faqs: [
        {
          question: "How is a Savannah building permit fee calculated?",
          answer:
            "The Revenue Ordinance sets an all-inclusive fee on cost of construction: $8.00 per $1,000 up to $5,000,000, plus $4.00 per $1,000 from $5 to $10 million, plus $2.00 per $1,000 above $10 million, with a $40.00 minimum. Cost of construction is floor area × $80.00/sq ft residential or $125.00/sq ft commercial.",
          sourceId: SAV_REVENUE_ORDINANCE_KEY,
          attribution: "Savannah Revenue Ordinance, Art. P §1(A)",
        },
        {
          question: "How much is the plan review fee in Savannah?",
          answer:
            "Plan review is a flat table on cost of construction: $40 to $6,000; $50 to $25,000; $100 to $50,000; $150 to $100,000; $200 to $500,000; $300 to $1,000,000; $500 to $5 million; $1,000 to $10 million; $2,000 above.",
          sourceId: SAV_REVENUE_ORDINANCE_KEY,
          attribution: "Savannah Revenue Ordinance, Art. P §1(B)(1)",
        },
        {
          question: "Can I pay for an expedited plan review in Savannah?",
          answer:
            "Yes, for commercial building permit applications: an expedited review is an additional 50% of the regular all-inclusive building permit fee with a $1,000 minimum, paid at submittal. It is optional; the standard path has no percentage surcharge.",
          sourceId: SAV_REVENUE_ORDINANCE_KEY,
          attribution: "Savannah Revenue Ordinance, Art. P §1(B)(3)",
        },
        {
          question: "What happens if I start work without a permit in Savannah?",
          answer:
            "A penalty fee of $500.00 is added to the permit fee, or the permit fee is doubled — whichever is greater (Art. P §1(C)). Re-inspection trips caused by failed or unready work are $50 for the first and $100 for the second and each subsequent visit.",
          sourceId: SAV_REVENUE_ORDINANCE_KEY,
          attribution: "Savannah Revenue Ordinance, Art. P §1(C), §8",
        },
        {
          question: "What is the technology fee on a Savannah permit?",
          answer:
            "$5.00 per permit, added to all all-inclusive building permits, standalone trade permits, sign permits, site development permits and similar permits issued by Development Services. It may be collected with the plan review fee or at issuance.",
          sourceId: SAV_REVENUE_ORDINANCE_KEY,
          attribution: "Savannah Revenue Ordinance, Art. P §19",
        },
      ],
      seoTitle: "Savannah GA Building Permit Cost (Marginal Valuation Ladder)",
      seoDescription:
        "Calculate Savannah building permit costs: $8/$4/$2 per $1,000 marginal ladder on cost of construction ($80/sq ft residential), banded plan review, $5 tech fee.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: SAV_LAST_VERIFIED,
    },
    {
      jurisdictionKey: SAV_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      slug: "electrical-permit-cost",
      title: "Savannah Electrical Permit Cost",
      intro:
        "A standalone Savannah electrical permit is priced by Revenue Ordinance Art. P §2 at **$8.00 per $1,000 of total work cost, and any fraction thereof**, with a **$40.00 minimum** and the **$5.00 technology fee**. The fraction phrase matters: $9,500 of work is charged at ten whole $1,000 steps ($80.00), not nine and a half. No electrical fee is charged at all for work already inside a building permit's scope.",
      localSummary:
        "Electrical permits in Savannah are issued by Development Services to Georgia-licensed electrical contractors for service changes, new circuits, rewiring and temporary installations such as carnivals and tent meetings (temporary events carry their own ride/booth schedule from $30 to $50 plus $2.50 per exhibit above 40). Rough wiring is inspected before concealment and a final inspection follows; failed re-inspections are $50 for the first trip.",
      notIncluded:
        "Georgia Power meter and service charges, temporary-event electrical permits with the ride/booth schedule, and after-hours inspections ($50/hour with a three-hour minimum) are outside the standalone permit fee.",
      workedExample: {
        scenario:
          "A licensed electrician pulls a standalone permit for a service upgrade and shop wiring with a total work cost of $9,500.",
        inputs: {
          valuationCents: 950_000,
        },
        notes:
          'The rate is $8.00 per $1,000 "and any fraction thereof", so $9,500 rounds up to ten whole steps: $8.00 × 10 = **$80.00**, above the $40.00 minimum. The technology fee adds **$5.00**. Total: $80.00 + $5.00 = **$85.00**.',
      },
      faqs: [
        {
          question: "What is the fee for a standalone electrical permit in Savannah?",
          answer:
            "$8.00 per $1,000 of total work cost, and any fraction thereof, with a $40.00 minimum fee, plus the $5.00 technology fee per permit.",
          sourceId: SAV_REVENUE_ORDINANCE_KEY,
          attribution: "Savannah Revenue Ordinance, Art. P §2",
        },
        {
          question: "Do I need a separate electrical permit if I have a building permit?",
          answer:
            "No. Article P §2 states that no electrical permit fees are charged for work included in the scope of a building permit; the trade fee applies only to work not covered by one.",
          sourceId: SAV_REVENUE_ORDINANCE_KEY,
          attribution: "Savannah Revenue Ordinance, Art. P §2",
        },
        {
          question: "How does the 'any fraction thereof' rounding work?",
          answer:
            "The work cost is rounded up to the next whole $1,000 before the $8.00 rate is applied. A $9,500 job pays ten steps ($80.00); a $9,001 job also pays ten. The rounding is the ordinance's own phrase, not an interpretation.",
          sourceId: SAV_REVENUE_ORDINANCE_KEY,
          attribution: "Savannah Revenue Ordinance, Art. P §2",
        },
        {
          question: "Are temporary event electrical permits priced differently?",
          answer:
            "Yes. Carnivals, circuses, road shows and tent meetings carry a ride/booth schedule: $30 for 1–5 rides or exhibits, $35 for 6–10, $40 for 11–20, $50 for 21–40, and $50 plus $2.50 for each additional exhibit above 40.",
          sourceId: SAV_REVENUE_ORDINANCE_KEY,
          attribution: "Savannah Revenue Ordinance, Art. P §2",
        },
      ],
      seoTitle: "Savannah GA Electrical Permit Cost & Requirements",
      seoDescription:
        "Savannah standalone electrical permit fees: $8 per $1,000 of work cost with any fraction rounded up, $40 minimum, $5 technology fee.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: SAV_LAST_VERIFIED,
    },
    {
      jurisdictionKey: SAV_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      slug: "plumbing-permit-cost",
      title: "Savannah Plumbing Permit Cost",
      intro:
        "A standalone Savannah plumbing permit is priced by Revenue Ordinance Art. P §4 at **$8.00 per $1,000 of total work cost, and any fraction thereof**, with a **$40.00 minimum** and the **$5.00 technology fee** — the identical shape to the electrical section, and like it, free of charge when the plumbing is already inside a building permit's scope.",
      localSummary:
        "Plumbing permits cover water heater replacements, fixture rough-ins, repiping, sewer laterals and backflow devices, filed by Georgia-licensed Class I plumbing contractors with the Development Services Department. Inspectors verify pressure tests, venting and backflow protection before concealment; failed re-inspections are $50 for the first trip and $100 after. Savannah's flat $8/$1,000 trade rate makes small jobs inexpensive — most residential service work lands at the $40 minimum.",
      notIncluded:
        "City water and sewer connection charges and capacity fees, grease-trap review for food service, private well and septic approvals in unsewered areas, and after-hours inspection fees ($50/hour, three-hour minimum).",
      workedExample: {
        scenario:
          "A plumbing contractor pulls a standalone permit for a whole-house repipe and three-fixture rough-in with a work cost of $3,200.",
        inputs: {
          valuationCents: 320_000,
        },
        notes:
          'The rate is $8.00 per $1,000 "and any fraction thereof", so $3,200 rounds up to four whole steps: $8.00 × 4 = **$32.00**, below the $40.00 minimum. The permit-minimum shortfall raises the fee to **$40.00**. The technology fee adds **$5.00**. Total: $40.00 + $5.00 = **$45.00**.',
      },
      faqs: [
        {
          question: "What is the fee for a standalone plumbing permit in Savannah?",
          answer:
            "$8.00 per $1,000 of total work cost, and any fraction thereof, with a $40.00 minimum fee, plus the $5.00 technology fee per permit.",
          sourceId: SAV_REVENUE_ORDINANCE_KEY,
          attribution: "Savannah Revenue Ordinance, Art. P §4",
        },
        {
          question: "Do I need a separate plumbing permit if I have a building permit?",
          answer:
            "No. Article P §4 charges plumbing fees only for work not covered by a building permit; fixtures roughed in under the building permit pay no additional plumbing fee.",
          sourceId: SAV_REVENUE_ORDINANCE_KEY,
          attribution: "Savannah Revenue Ordinance, Art. P §4",
        },
        {
          question: "Why did my small job pay the minimum instead of the rate?",
          answer:
            "Because $8.00 per $1,000 of a job under $5,000 computes to less than $40.00 — a $3,200 job is $32.00 by rate — the ordinance's minimum fee of $40.00 applies instead. The minimum is a floor on the permit fee.",
          sourceId: SAV_REVENUE_ORDINANCE_KEY,
          attribution: "Savannah Revenue Ordinance, Art. P §4",
        },
        {
          question: "What are the re-inspection fees in Savannah?",
          answer:
            "$50.00 for the first re-inspection and $100.00 for the second and each subsequent one when work fails inspection, is not ready, or the corrections were not made as scheduled.",
          sourceId: SAV_REVENUE_ORDINANCE_KEY,
          attribution: "Savannah Revenue Ordinance, Art. P §8",
        },
      ],
      seoTitle: "Savannah GA Plumbing Permit Cost & Regulations",
      seoDescription:
        "Savannah standalone plumbing permit fees: $8 per $1,000 of work cost with any fraction rounded up, $40 minimum, $5 technology fee.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: SAV_LAST_VERIFIED,
    },
  ],

  verifications: [
    {
      entityType: "jurisdiction_profile",
      entityKey: SAV_KEYS.jurisdiction,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: SAV_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Georgia Expansion",
      sourceKey: SAV_REVENUE_ORDINANCE_KEY,
      notes:
        "Article P read directly from the City's codification PDF; figures cross-checked between the 2021 and 2022 Revenue Ordinance editions.",
    },
    {
      entityType: "fee_schedule",
      entityKey: SAV_REVENUE_ORDINANCE_KEY,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: SAV_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Georgia Expansion",
      sourceKey: SAV_REVENUE_ORDINANCE_KEY,
      notes:
        "Verified the three-band marginal building ladder, the nine-band plan review table, the $8/$1,000 trade rates with 'any fraction thereof', the $40 minimum and the $5 technology fee.",
    },
    {
      entityType: "permit_page",
      entityKey: "building-permit-cost",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: SAV_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Georgia Expansion",
      sourceKey: SAV_REVENUE_ORDINANCE_KEY,
      notes: "Passed editorial gate checks for building permit page.",
    },
    {
      entityType: "permit_page",
      entityKey: "electrical-permit-cost",
      permitTypeKey: "electrical",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: SAV_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Georgia Expansion",
      sourceKey: SAV_REVENUE_ORDINANCE_KEY,
      notes: "Passed editorial gate checks for electrical permit page.",
    },
    {
      entityType: "permit_page",
      entityKey: "plumbing-permit-cost",
      permitTypeKey: "plumbing",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: SAV_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Georgia Expansion",
      sourceKey: SAV_REVENUE_ORDINANCE_KEY,
      notes: "Passed editorial gate checks for plumbing permit page.",
    },
  ],
};
