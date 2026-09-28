import type { JurisdictionSeed } from "@/content/seed-types";
import {
  BRLA_BUILDING_RULES,
  BRLA_BUILDING_SOURCE_KEY,
  BRLA_ELECTRICAL_RULES,
  BRLA_FEE_EFFECTIVE_FROM,
  BRLA_PLUMBING_RULES,
} from "@/content/batonrouge/fee-rules";

export const BRLA_LAST_VERIFIED = "2026-09-26";

export const BRLA_KEYS = {
  state: "la",
  county: "east-baton-rouge-parish",
  jurisdiction: "baton-rouge",
} as const;

const state = {
  code: "LA",
  slug: "louisiana",
  name: "Louisiana",
  fipsCode: "22",
};

const county = {
  key: BRLA_KEYS.county,
  slug: "east-baton-rouge-parish",
  name: "East Baton Rouge Parish",
  fipsCode: "22033",
};

const CITY_URL = "https://www.brla.gov";
const FEES_URL = "https://www.brla.gov/2694/Permit-Inspection-Fees";
const DEV_URL = "https://www.brla.gov/160/Development";
const CODE_URL =
  "https://library.municode.com/la/baton_rouge,_east_baton_rouge_parish/codes/code_of_ordinances";

export const batonrougeSeed: JurisdictionSeed = {
  state,
  county,

  jurisdiction: {
    key: BRLA_KEYS.jurisdiction,
    stateKey: BRLA_KEYS.state,
    countyKey: BRLA_KEYS.county,
    type: "city",
    slug: "baton-rouge",
    name: "Baton Rouge",
    officialName:
      "City of Baton Rouge & Parish of East Baton Rouge — Department of Development, Inspection & Permits",
    websiteUrl: CITY_URL,
    permitPortalUrl: DEV_URL,
    timezone: "America/Chicago",
    isActive: true,
  },

  departments: [
    {
      key: "brla-inspection-permits",
      jurisdictionKey: BRLA_KEYS.jurisdiction,
      kind: "building",
      name: "Inspection & Permits Division (Department of Development)",
      phone: "225-389-3000",
      email: null,
      url: DEV_URL,
      addressLine: "P.O. Box 1471, Baton Rouge, LA 70821",
      hours: "Monday – Friday, 8:00 a.m. – 5:00 p.m. CT",
      notes:
        "The consolidated city-parish Inspection & Permits division issues building, trade, occupancy and demolition permits across East Baton Rouge Parish and publishes the fee schedule read here. The Baton Rouge Fire Department charges its own fire prevention fees on the same schedule.",
    },
  ],

  sources: [
    {
      key: BRLA_BUILDING_SOURCE_KEY,
      jurisdictionKey: BRLA_KEYS.jurisdiction,
      title:
        "City-Parish of Baton Rouge — Permit & Inspection Fees (Department of Development)",
      url: FEES_URL,
      sourceType: "municipal_website",
      issuingAuthority:
        "City of Baton Rouge & Parish of East Baton Rouge — Department of Development",
      authorityKind: "city",
      isPrimary: true,
      documentDate: null,
      effectiveFrom: BRLA_FEE_EFFECTIVE_FROM,
      retrievedAt: "2026-09-26",
      lastVerifiedAt: BRLA_LAST_VERIFIED,
      notes:
        "The operative fee schedule. Residential: $0.80/sq ft + $125 ($125 min new, $250 min remodel/addition/accessory), trade permits $125 flat. Commercial: valuation bands $5/$4/$1.50 per $1,000 chaining at $100,000 and $500,000, $100 minimum; plan review $3/$1,000 to $500k then $1,500 + $0.50/$1,000, $100 minimum; MEP trades flat by valuation band ($125/$300/$400/$600). Technology fee $25 on every permit; reinspection $75; credit cards +5%. The page prints no effective date — the read date is carried.",
    },
    {
      key: "brla-code",
      jurisdictionKey: BRLA_KEYS.jurisdiction,
      title:
        "Baton Rouge, East Baton Rouge Parish — Consolidated Code of Ordinances (Municode)",
      url: CODE_URL,
      sourceType: "municipal_code",
      issuingAuthority: "City-Parish Council of East Baton Rouge",
      authorityKind: "city",
      isPrimary: true,
      documentDate: null,
      effectiveFrom: null,
      retrievedAt: "2026-09-26",
      lastVerifiedAt: BRLA_LAST_VERIFIED,
      notes:
        "The consolidated code references the adopted technical codes and the permit fee provisions of the city-parish; the fee amounts themselves are published on the Department's schedule page, which is the citation of record for each figure.",
    },
  ],

  permitTypes: [],
  projectTypes: [],

  jurisdictionPermitTypes: [
    {
      jurisdictionKey: BRLA_KEYS.jurisdiction,
      permitTypeKey: "building",
      isAvailable: true,
      localName: "Building Permit",
      officialUrl: FEES_URL,
      notes:
        "Residential: $0.80/sq ft + $125 by work type. Commercial: valuation bands $5/$4/$1.50 per $1,000 (chained, prorating) plus plan review at $3 or $1,500 + $0.50 per $1,000. Technology fee $25.",
    },
    {
      jurisdictionKey: BRLA_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      isAvailable: true,
      localName: "Electrical Trade Permit",
      officialUrl: FEES_URL,
      notes:
        "Residential flat $125; commercial MEP flat by valuation ($125/$300/$400/$600). Technology fee $25.",
    },
    {
      jurisdictionKey: BRLA_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      isAvailable: true,
      localName: "Plumbing Trade Permit",
      officialUrl: FEES_URL,
      notes:
        "Residential flat $125; commercial MEP flat by valuation ($125/$300/$400/$600). Technology fee $25.",
    },
  ],

  feeSchedules: [
    {
      key: "brla-building-schedule",
      jurisdictionKey: BRLA_KEYS.jurisdiction,
      sourceKey: BRLA_BUILDING_SOURCE_KEY,
      title: "Baton Rouge Building Permit Fees (Permit & Inspection Fees)",
      officialUrl: FEES_URL,
      effectiveFrom: BRLA_FEE_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: BRLA_LAST_VERIFIED,
      notes:
        "Residential area-priced rows and the commercial valuation ladder plus plan review table, as one page.",
    },
    {
      key: "brla-trade-schedule",
      jurisdictionKey: BRLA_KEYS.jurisdiction,
      sourceKey: BRLA_BUILDING_SOURCE_KEY,
      title: "Baton Rouge Trade Permit Fees (MEP + residential flat rows)",
      officialUrl: FEES_URL,
      effectiveFrom: BRLA_FEE_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: BRLA_LAST_VERIFIED,
      notes:
        "Residential MEP trade permits at $125 flat; commercial MEP trade permits flat by construction-valuation band.",
    },
  ],

  feeRules: [
    ...BRLA_BUILDING_RULES.map((rule) => ({
      jurisdictionKey: BRLA_KEYS.jurisdiction,
      permitTypeKey: "building",
      scheduleKey: "brla-building-schedule",
      rule,
    })),
    ...BRLA_ELECTRICAL_RULES.map((rule) => ({
      jurisdictionKey: BRLA_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      scheduleKey: "brla-trade-schedule",
      rule,
    })),
    ...BRLA_PLUMBING_RULES.map((rule) => ({
      jurisdictionKey: BRLA_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      scheduleKey: "brla-trade-schedule",
      rule,
    })),
  ],

  requirements: [
    {
      jurisdictionKey: BRLA_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "document",
      title: "Construction valuation documentation",
      description:
        "Commercial permit and plan review fees are computed from the construction valuation, which the applicant states and the Department may verify. Flood zone determination ($25) runs on every application.",
      isMandatory: true,
      sortOrder: 1,
      sourceKey: BRLA_BUILDING_SOURCE_KEY,
      lastVerifiedAt: BRLA_LAST_VERIFIED,
    },
    {
      jurisdictionKey: BRLA_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "other",
      title: "Payment terms",
      description:
        "Credit-card payment carries a 5% fee. Reinspection is $75, after-hours inspection $150, and Board of Appeals/Adjustment filings $100 each.",
      isMandatory: false,
      sortOrder: 2,
      sourceKey: BRLA_BUILDING_SOURCE_KEY,
      lastVerifiedAt: BRLA_LAST_VERIFIED,
    },
    {
      jurisdictionKey: BRLA_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      requirementType: "license",
      title: "State and city-parish trade licensing",
      description:
        "Trade permits are issued to licensed contractors in good standing with the city-parish; residential trade permits (mechanical, electrical, plumbing, gas) are a flat $125 each.",
      isMandatory: true,
      sortOrder: 3,
      sourceKey: BRLA_BUILDING_SOURCE_KEY,
      lastVerifiedAt: BRLA_LAST_VERIFIED,
    },
    {
      jurisdictionKey: BRLA_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      requirementType: "license",
      title: "State plumbing license",
      description:
        "Plumbing work requires a state-licensed plumber pulling the trade permit; the residential plumbing trade permit is a flat $125 and the commercial permit is priced by valuation band.",
      isMandatory: true,
      sortOrder: 4,
      sourceKey: BRLA_BUILDING_SOURCE_KEY,
      lastVerifiedAt: BRLA_LAST_VERIFIED,
    },
  ],

  profile: {
    jurisdictionKey: BRLA_KEYS.jurisdiction,
    headline: "Baton Rouge, Louisiana Permit Fees & Inspection Costs",
    summary:
      "Baton Rouge's consolidated city-parish Inspection & Permits division prices residential permits by area — $0.80 per square foot plus $125, with $125 minimums for new homes and $250 for remodels and additions — and commercial permits by valuation on a chained ladder: $5 per $1,000 to $100,000, $500 + $4 per $1,000 to $500,000, then $2,100 + $1.50 per $1,000. Commercial plan review is a second valuation table ($3 per $1,000, then $1,500 + $0.50). Trade permits are a flat $125 residential and $125–$600 commercial by valuation, and a $25 technology fee rides every permit.",
    localContext:
      "Baton Rouge and East Baton Rouge Parish operate as one government — the City-Parish — so one fee schedule covers everything inside the parish except the parishes' newer municipalities (Central, Zachary, and the city of St. George incorporated in 2024 with its own permit office). The Department of Development's Inspection & Permits division runs permitting from downtown; the Baton Rouge Fire Department keeps its own fee lines (fire alarm acceptance, sprinkler acceptance, hood suppression) on the same schedule at $150 each.\n\nEvery per-$1,000 rate on the schedule prorates — none prints 'or fraction thereof' — so a $150,000 commercial permit is exactly $700.00, not a rounded band.",
    valuationBasis:
      "Construction valuation for commercial permits and plan review — all labor, materials and equipment of the work. Residential permits read the area of the work (square footage) rather than a valuation.",
    notIncluded:
      "These figures cover the City-Parish of Baton Rouge permit fees published by Inspection & Permits. They exclude:\n\n- **Baton Rouge Fire Department fees** (fire alarm/sprinkler acceptance, hood suppression, $150 each).\n- **Sewer impact and traffic impact fees**, published as separate schedules.\n- **Occupancy permits** ($125 residential / $125 commercial) and registration fees.\n- **Parish municipalities** — Central, Zachary and St. George issue their own permits.\n- **State licensing fees** for contractors and trades.",
    seoTitle: "Baton Rouge LA Permit Fees | City-Parish Fee Schedule & Calculator",
    seoDescription:
      "Baton Rouge permits: residential $0.80/sq ft + $125; commercial $5/$4/$1.50 per $1,000 valuation; plan review $3/$1,000; trades $125–$600; $25 tech fee.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: BRLA_LAST_VERIFIED,
  },

  permitPages: [
    {
      jurisdictionKey: BRLA_KEYS.jurisdiction,
      permitTypeKey: "building",
      slug: "building-permit-cost",
      title: "Baton Rouge Building Permit Cost",
      intro:
        "Baton Rouge prices building permits two ways. **Residential** work reads the area: **$0.80 per square foot + $125**, with a **$125 minimum** for a new home and **$250** for remodels, additions and accessory structures. **Commercial** work reads the construction valuation on a chained ladder: **$5 per $1,000** to $100,000, **$500 + $4 per $1,000** to $500,000, then **$2,100 + $1.50 per $1,000** — with **plan review** charged from its own table (**$3 per $1,000**, then **$1,500 + $0.50** above $500,000) and a **$100 minimum** on both commercial tables. A **$25 technology fee** rides every permit.",
      localSummary:
        "Permits are issued by the city-parish's Inspection & Permits division, which serves all of East Baton Rouge Parish from downtown Baton Rouge. Every per-$1,000 rate prorates — the schedule prints no 'or fraction thereof' anywhere, so a $150,000 commercial permit is exactly $700.00. The commercial bands chain to the dollar: 100 × $5 = $500, and $500 + 400 × $4 = $2,100. Credit-card payment adds 5%; reinspections run $75; after-hours inspections $150. The Baton Rouge Fire Department's acceptance fees ($150 each for alarms, sprinklers and hood suppression) are separate lines on the same schedule.",
      notIncluded:
        "This estimate covers the City-Parish building permit, commercial plan review and technology fee only. It excludes:\n\n- **Trade permits** (mechanical, electrical, plumbing, gas), priced separately.\n- **Baton Rouge Fire Department fees** — $150 per acceptance on alarms, sprinklers and hood suppression.\n- **Sewer impact and traffic impact fees**, published as separate schedules.\n- **Occupancy permits** ($125) and registrations.\n- **Permits in Central, Zachary and St. George**, which issue their own.",
      workedExample: {
        scenario:
          "A new 2,500-square-foot single-family home in Baton Rouge, plus the technology fee.",
        inputs: {
          squareFootage: 2_500,
          valuationCents: 30_000_000,
          occupancy: "residential",
          workType: "new_construction",
        },
        notes:
          "Residential new building: 2,500 sq ft × $0.80 = $2,000.00 + $125 = **$2,125.00** (above the $125 minimum). Technology fee: **$25.00**. Total: **$2,150.00**.",
      },
      faqs: [
        {
          question: "How is a Baton Rouge building permit fee calculated?",
          answer:
            "Residential work pays $0.80 per square foot of the work plus $125. Commercial work pays by construction valuation: $5 per $1,000 up to $100,000, then $500 plus $4 per $1,000 to $500,000, then $2,100 plus $1.50 per $1,000 above that.",
          sourceId: BRLA_BUILDING_SOURCE_KEY,
          attribution: "Baton Rouge Permit & Inspection Fees",
        },
        {
          question: "What are the minimum permit fees in Baton Rouge?",
          answer:
            "Residential new building carries a $125 minimum; residential remodels, additions and accessory structures $250. The commercial permit and commercial plan review tables both state a $100 minimum.",
          sourceId: BRLA_BUILDING_SOURCE_KEY,
          attribution: "Baton Rouge Permit & Inspection Fees",
        },
        {
          question: "How much is a commercial plan review in Baton Rouge?",
          answer:
            "Charged from its own valuation table: $3 per $1,000 up to $500,000 (minimum $100), then $1,500 plus $0.50 per $1,000 above $500,000. It is charged in addition to the permit fee.",
          sourceId: BRLA_BUILDING_SOURCE_KEY,
          attribution: "Baton Rouge Permit & Inspection Fees",
        },
        {
          question: "Do partial thousands round up in Baton Rouge?",
          answer:
            "No. None of the schedule's per-$1,000 rates prints 'or fraction thereof', so every band prorates exactly — $150,000 pays $500 + 50 × $4 = $700.00.",
          sourceId: BRLA_BUILDING_SOURCE_KEY,
          attribution: "Baton Rouge Permit & Inspection Fees",
        },
        {
          question: "What is the technology fee?",
          answer:
            "A flat $25.00 charged on every permit the Department issues, listed under 'All Permits' on the schedule. It rides building, trade, occupancy and demolition permits alike.",
          sourceId: BRLA_BUILDING_SOURCE_KEY,
          attribution: "Baton Rouge Permit & Inspection Fees",
        },
        {
          question: "How much is a demolition permit in Baton Rouge?",
          answer:
            "Residential demolition is a flat $125.00 (plus the $25 technology fee). Commercial demolition follows the commercial valuation ladder.",
          sourceId: BRLA_BUILDING_SOURCE_KEY,
          attribution: "Baton Rouge Permit & Inspection Fees",
        },
        {
          question: "What other fees ride a Baton Rouge permit?",
          answer:
            "Flood zone determination $25, reinspection $75, Board of Appeals $100, Board of Adjustment $100, and after-hours inspection $150. Paying by credit card adds a 5% fee.",
          sourceId: BRLA_BUILDING_SOURCE_KEY,
          attribution: "Baton Rouge Permit & Inspection Fees",
        },
        {
          question: "Does the Fire Department charge its own permit fees?",
          answer:
            "Yes. The Baton Rouge Fire Department keeps separate lines on the same schedule: commercial new construction $300, fire alarm acceptance $150, fire sprinkler acceptance $150, hood suppression $150, and fire prevention reinspection $150.",
          sourceId: BRLA_BUILDING_SOURCE_KEY,
          attribution: "Baton Rouge Permit & Inspection Fees",
        },
      ],
      seoTitle: "Baton Rouge LA Building Permit Cost (Residential & Commercial Tables)",
      seoDescription:
        "Baton Rouge building permit fees: residential $0.80/sq ft + $125; commercial valuation ladder $5/$4/$1.50 per $1,000 with plan review $3/$1,000; $25 tech fee.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: BRLA_LAST_VERIFIED,
    },
    {
      jurisdictionKey: BRLA_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      slug: "electrical-permit-cost",
      title: "Baton Rouge Electrical Permit Cost",
      intro:
        "Baton Rouge prices electrical trade permits by the size of the job: **residential electrical permits are a flat $125.00**, while **commercial electrical permits are flat by construction valuation** — **$125** up to $100,000, **$300** to $500,000, **$400** to $2,000,000, and **$600** above it. A **$25.00 technology fee** rides every permit.",
      localSummary:
        "The trade permit is pulled by the licensed electrical contractor under the city-parish's Inspection & Permits division. Residential MEP trades — mechanical, electrical, plumbing and gas — share the same $125 flat row, which the schedule notes are 'not included' in the residential building permit's area price. The commercial MEP table prices from the construction valuation the contractor states, in four flat bands with no per-circuit or per-fixture counts anywhere.",
      notIncluded:
        "This estimate covers the City-Parish electrical trade permit and technology fee only. It excludes:\n\n- **The building permit** for the same project (residential trade fees are expressly not included in it).\n- **Entergy Louisiana** service and metering charges.\n- **Fire alarm acceptance** — the Baton Rouge Fire Department's $150 line.\n- **State electrical licensing** and city-parish occupational license fees.\n- **Occupancy permits** for new commercial spaces.",
      workedExample: {
        scenario:
          "A commercial electrical fit-out in Baton Rouge with a $220,000 construction valuation.",
        inputs: {
          valuationCents: 22_000_000,
          occupancy: "commercial",
          workType: "alteration",
        },
        notes:
          "Commercial MEP band ($100,001–$500,000): flat **$300.00**. Technology fee: **$25.00**. Total: **$325.00**.",
      },
      faqs: [
        {
          question: "How much is a residential electrical permit in Baton Rouge?",
          answer:
            "A flat $125.00, plus the $25 technology fee. The residential mechanical, electrical, plumbing and gas trade permits all share the same $125 row.",
          sourceId: BRLA_BUILDING_SOURCE_KEY,
          attribution: "Baton Rouge Permit & Inspection Fees",
        },
        {
          question: "How much is a commercial electrical permit in Baton Rouge?",
          answer:
            "Flat by construction valuation: $125 up to $100,000, $300 from $100,001 to $500,000, $400 to $2,000,000, and $600 above that — plus the $25 technology fee.",
          sourceId: BRLA_BUILDING_SOURCE_KEY,
          attribution: "Baton Rouge Permit & Inspection Fees",
        },
        {
          question: "Is the electrical permit included in the building permit?",
          answer:
            "No. The residential building permit rows expressly note that EMP's (electrical, mechanical, plumbing trade permits) are not included — each trade permit is pulled and paid separately.",
          sourceId: BRLA_BUILDING_SOURCE_KEY,
          attribution: "Baton Rouge Permit & Inspection Fees",
        },
        {
          question: "What determines the commercial trade permit's band?",
          answer:
            "The construction valuation of the work — the same figure the commercial building permit and plan review are computed from, stated by the contractor and verified by the Department.",
          sourceId: BRLA_BUILDING_SOURCE_KEY,
          attribution: "Baton Rouge Permit & Inspection Fees",
        },
        {
          question: "Are there per-circuit or per-fixture electrical fees in Baton Rouge?",
          answer:
            "No. Unlike many cities, the schedule prices electrical work in flat bands by valuation rather than counting circuits, outlets or amperage.",
          sourceId: BRLA_BUILDING_SOURCE_KEY,
          attribution: "Baton Rouge Permit & Inspection Fees",
        },
        {
          question: "What happens if an inspection fails in Baton Rouge?",
          answer:
            "A reinspection fee of $75.00 applies, and after-hours inspections carry a $150 fee.",
          sourceId: BRLA_BUILDING_SOURCE_KEY,
          attribution: "Baton Rouge Permit & Inspection Fees",
        },
        {
          question: "Does Baton Rouge charge extra for card payments?",
          answer:
            "Yes. Payment of permits with a credit card is charged a 5% fee — on the total permit bill.",
          sourceId: BRLA_BUILDING_SOURCE_KEY,
          attribution: "Baton Rouge Permit & Inspection Fees",
        },
      ],
      seoTitle: "Baton Rouge LA Electrical Permit Cost & Requirements",
      seoDescription:
        "Baton Rouge electrical permit fees: residential flat $125; commercial flat by valuation $125/$300/$400/$600; $25 technology fee on every permit.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: BRLA_LAST_VERIFIED,
    },
    {
      jurisdictionKey: BRLA_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      slug: "plumbing-permit-cost",
      title: "Baton Rouge Plumbing Permit Cost",
      intro:
        "Baton Rouge prices plumbing trade permits the way it prices electrical: **residential plumbing permits are a flat $125.00**, and **commercial plumbing permits are flat by construction valuation** — **$125** up to $100,000, **$300** to $500,000, **$400** to $2,000,000, and **$600** above it. The **$25.00 technology fee** rides every permit.",
      localSummary:
        "Plumbing trade permits are pulled by the licensed plumber under the Inspection & Permits division. East Baton Rouge Parish runs its own sewer system inside the Sewer Impact Fee regime, so new connections also trigger the separate impact-fee schedule; the trade permit here covers the inspection of the piping work itself. Residential gas piping shares the same flat $125 trade row.",
      notIncluded:
        "This estimate covers the City-Parish plumbing trade permit and technology fee only. It excludes:\n\n- **Sewer impact fees** and **traffic impact fees**, published as separate schedules.\n- **Sewerage tap and connection charges** for new or upsized services.\n- **The building permit** for the same project.\n- **State plumbing licensing** and city-parish occupational licenses.\n- **Septic system permits** outside the sewer service area.",
      workedExample: {
        scenario:
          "A residential plumbing trade permit in Baton Rouge for a bathroom remodel (no building permit required for the trade scope).",
        inputs: {
          valuationCents: 1_500_000,
          occupancy: "residential",
          workType: "alteration",
          fixtures: 5,
        },
        notes:
          "Residential trade permit: flat **$125.00**. Technology fee: **$25.00**. Total: **$150.00**.",
      },
      faqs: [
        {
          question: "How much is a residential plumbing permit in Baton Rouge?",
          answer:
            "A flat $125.00, plus the $25 technology fee — the same flat row covers residential mechanical, electrical, plumbing and gas trade permits.",
          sourceId: BRLA_BUILDING_SOURCE_KEY,
          attribution: "Baton Rouge Permit & Inspection Fees",
        },
        {
          question: "How much is a commercial plumbing permit in Baton Rouge?",
          answer:
            "Flat by construction valuation: $125 up to $100,000, $300 from $100,001 to $500,000, $400 to $2,000,000, and $600 above that, plus the $25 technology fee.",
          sourceId: BRLA_BUILDING_SOURCE_KEY,
          attribution: "Baton Rouge Permit & Inspection Fees",
        },
        {
          question: "Are plumbing fixtures counted for the fee in Baton Rouge?",
          answer:
            "No. The schedule prices plumbing work flat by job size — there is no per-fixture or per-outlet rate anywhere on the city-parish schedule.",
          sourceId: BRLA_BUILDING_SOURCE_KEY,
          attribution: "Baton Rouge Permit & Inspection Fees",
        },
        {
          question: "Does Baton Rouge charge sewer impact fees?",
          answer:
            "Yes, but separately: the Sewer Impact Fee Schedule is its own document, charged on connections to the parish sewer system rather than on the plumbing trade permit.",
          sourceId: BRLA_BUILDING_SOURCE_KEY,
          attribution: "Baton Rouge Permit & Inspection Fees",
        },
        {
          question: "Is gas piping permitted on the same plumbing permit?",
          answer:
            "Yes. The residential 'Mechanical, Electrical or Plumbing, Gas Trade Permits' row is one $125 line covering each trade, so gas piping is permitted at the same flat amount.",
          sourceId: BRLA_BUILDING_SOURCE_KEY,
          attribution: "Baton Rouge Permit & Inspection Fees",
        },
        {
          question: "What is the technology fee on my permit?",
          answer:
            "A $25.00 flat fee charged on every permit — building, trade, occupancy and demolition alike — listed under 'All Permits' on the schedule.",
          sourceId: BRLA_BUILDING_SOURCE_KEY,
          attribution: "Baton Rouge Permit & Inspection Fees",
        },
        {
          question: "How much is a reinspection in Baton Rouge?",
          answer:
            "$75.00 per reinspection, and $150.00 for after-hours inspections.",
          sourceId: BRLA_BUILDING_SOURCE_KEY,
          attribution: "Baton Rouge Permit & Inspection Fees",
        },
      ],
      seoTitle: "Baton Rouge LA Plumbing Permit Cost & Requirements",
      seoDescription:
        "Baton Rouge plumbing permit fees: residential flat $125; commercial flat by valuation $125/$300/$400/$600; $25 technology fee. Full city-parish schedule.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: BRLA_LAST_VERIFIED,
    },
  ],

  verifications: [
    {
      entityType: "jurisdiction_profile",
      entityKey: BRLA_KEYS.jurisdiction,
      status: "verified",
      method: "official_portal_check",
      verifiedAt: BRLA_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Louisiana Expansion",
      sourceKey: BRLA_BUILDING_SOURCE_KEY,
      notes:
        "Verified against the Department of Development's Permit & Inspection Fees page read in full.",
    },
    {
      entityType: "fee_schedule",
      entityKey: "brla-building-schedule",
      status: "verified",
      method: "official_portal_check",
      verifiedAt: BRLA_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Louisiana Expansion",
      sourceKey: BRLA_BUILDING_SOURCE_KEY,
      notes:
        "Verified the residential area rows, the chained commercial ladder, the plan review table and the $25 technology fee. Band chaining checked at $100,000 and $500,000.",
    },
    {
      entityType: "fee_schedule",
      entityKey: "brla-trade-schedule",
      status: "verified",
      method: "official_portal_check",
      verifiedAt: BRLA_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Louisiana Expansion",
      sourceKey: BRLA_BUILDING_SOURCE_KEY,
      notes: "Verified the $125 residential flat row and the four commercial MEP bands.",
    },
    {
      entityType: "permit_page",
      entityKey: "building-permit-cost",
      permitTypeKey: "building",
      status: "verified",
      method: "official_portal_check",
      verifiedAt: BRLA_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Louisiana Expansion",
      sourceKey: BRLA_BUILDING_SOURCE_KEY,
      notes: "Passed editorial gate checks for Baton Rouge building permit page.",
    },
    {
      entityType: "permit_page",
      entityKey: "electrical-permit-cost",
      permitTypeKey: "electrical",
      status: "verified",
      method: "official_portal_check",
      verifiedAt: BRLA_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Louisiana Expansion",
      sourceKey: BRLA_BUILDING_SOURCE_KEY,
      notes: "Passed editorial gate checks for Baton Rouge electrical permit page.",
    },
    {
      entityType: "permit_page",
      entityKey: "plumbing-permit-cost",
      permitTypeKey: "plumbing",
      status: "verified",
      method: "official_portal_check",
      verifiedAt: BRLA_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Louisiana Expansion",
      sourceKey: BRLA_BUILDING_SOURCE_KEY,
      notes: "Passed editorial gate checks for Baton Rouge plumbing permit page.",
    },
  ],
};
