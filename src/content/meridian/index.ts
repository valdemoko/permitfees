import type { JurisdictionSeed } from "@/content/seed-types";
import {
  MER_BUILDING_RULES,
  MER_BUILDING_SOURCE_KEY,
  MER_ELECTRICAL_RULES,
  MER_ELECTRICAL_SOURCE_KEY,
  MER_FEE_EFFECTIVE_FROM,
  MER_PLUMBING_RULES,
  MER_PLUMBING_SOURCE_KEY,
} from "@/content/meridian/fee-rules";

export const MER_LAST_VERIFIED = "2026-09-26";

export const MER_KEYS = {
  state: "id",
  county: "ada-county-id",
  jurisdiction: "meridian",
} as const;

const state = {
  code: "ID",
  slug: "idaho",
  name: "Idaho",
  fipsCode: "16",
};

const county = {
  key: MER_KEYS.county,
  slug: "ada-county-id",
  name: "Ada County",
  fipsCode: "16001",
};

const CITY_URL = "https://www.meridiancity.org";
const BUILDING_URL = `${CITY_URL}/community-development/building/`;
const FEES_URL = `${CITY_URL}/community-development/building/fee-schedules-calculators-estimating/`;
const FEE_PORTAL_URL = "https://apps.meridiancity.org/CITYFEEWEB/";
const RES_WORKSHEET_URL = `${CITY_URL}/media/1o3dqvgg/residential-fee-calculation-worksheet-6-1-2026.xlsx`;
const COMM_WORKSHEET_URL = `${CITY_URL}/media/jbopem3k/new-commercial-fee-calculation-worksheet-6-1-2026.xlsx`;

export const meridianSeed: JurisdictionSeed = {
  state,
  county,

  jurisdiction: {
    key: MER_KEYS.jurisdiction,
    stateKey: MER_KEYS.state,
    countyKey: MER_KEYS.county,
    type: "city",
    slug: "meridian",
    name: "Meridian",
    officialName:
      "City of Meridian — Community Development, Building Services Division",
    websiteUrl: CITY_URL,
    permitPortalUrl: BUILDING_URL,
    timezone: "America/Boise",
    isActive: true,
  },

  departments: [
    {
      key: "meridian-building-services",
      jurisdictionKey: MER_KEYS.jurisdiction,
      kind: "building",
      name: "Building Services Division",
      phone: "(208) 884-5534",
      email: null,
      url: BUILDING_URL,
      addressLine: "33 E. Broadway Ave, Suite 102, Meridian, ID 83642",
      hours: "Monday – Friday, 8:00 a.m. – 5:00 p.m. MT",
      notes:
        "Responsible for all activities associated with structural, fire, electrical, mechanical and plumbing permits within the City of Meridian; publishes the City Fees Schedule portal and fee-calculation worksheets.",
    },
  ],

  sources: [
    {
      key: MER_BUILDING_SOURCE_KEY,
      jurisdictionKey: MER_KEYS.jurisdiction,
      title:
        "City of Meridian — City Fees Schedule (Building sections 1.1-1.4, Resolutions 18-2110, 20-2230, 20-2234)",
      url: FEE_PORTAL_URL,
      sourceType: "municipal_website",
      issuingAuthority: "City of Meridian",
      authorityKind: "city",
      isPrimary: true,
      documentDate: null,
      effectiveFrom: MER_FEE_EFFECTIVE_FROM,
      retrievedAt: "2026-09-26",
      lastVerifiedAt: MER_LAST_VERIFIED,
      notes:
        "The city's official fee database; each row carries its adopting resolution number. Building Structural (1.1), Electrical (1.2), Mechanical (1.3) and Plumbing (1.4) rows read in full from the portal. Retrieval required a browser session (the portal serves a Cloudflare challenge to plain HTTP agents).",
    },
    {
      key: "meridian-residential-worksheet",
      jurisdictionKey: MER_KEYS.jurisdiction,
      title:
        "Residential Fee Calculation Worksheet (6-1-2026) — City of Meridian Building Services",
      url: RES_WORKSHEET_URL,
      sourceType: "municipal_website",
      issuingAuthority: "City of Meridian, Building Services Division",
      authorityKind: "city",
      isPrimary: true,
      documentDate: "2026-06-01",
      effectiveFrom: MER_FEE_EFFECTIVE_FROM,
      retrievedAt: "2026-09-26",
      lastVerifiedAt: MER_LAST_VERIFIED,
      notes:
        "Official calculator whose cell formulas print the exact arithmetic: building fee = $50 + (project value ÷ 1,000) × $5.50, with project value from $94.06/sq ft living area (per BVD), $36.91/sq ft garages and $16/sq ft sheds and patio covers.",
    },
    {
      key: "meridian-commercial-worksheet",
      jurisdictionKey: MER_KEYS.jurisdiction,
      title:
        "New Commercial Fee Calculation Worksheet (6-1-2026) — City of Meridian Building Services",
      url: COMM_WORKSHEET_URL,
      sourceType: "municipal_website",
      issuingAuthority: "City of Meridian, Building Services Division",
      authorityKind: "city",
      isPrimary: true,
      documentDate: "2026-06-01",
      effectiveFrom: MER_FEE_EFFECTIVE_FROM,
      retrievedAt: "2026-09-26",
      lastVerifiedAt: MER_LAST_VERIFIED,
      notes:
        "Official calculator confirming the building formula ($50 + $5.50 per $1,000), the 65% commercial building plan review, the 30% fire plan review, and the per-square-foot police ($1.23/$0.19) and fire ($1.29/$0.96) impact fees.",
    },
  ],

  permitTypes: [],
  projectTypes: [],

  jurisdictionPermitTypes: [
    {
      jurisdictionKey: MER_KEYS.jurisdiction,
      permitTypeKey: "building",
      isAvailable: true,
      localName: "Building Permit",
      officialUrl: FEE_PORTAL_URL,
      notes:
        "One formula for all project types: $50 base + $5.50 per $1,000 of project value or fraction; commercial plan check adds 65% of the permit fee.",
    },
    {
      jurisdictionKey: MER_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      isAvailable: true,
      localName: "Electrical Permit",
      officialUrl: FEE_PORTAL_URL,
      notes:
        "New residential by service size ($120 to 200 A, $210 to 400 A), existing residential $40 + $10/circuit, multi-family $120/building + $60/unit, commercial by wiring cost ($40 + 2.5% / $100 + 1% / $180 + ½%).",
    },
    {
      jurisdictionKey: MER_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      isAvailable: true,
      localName: "Plumbing Permit",
      officialUrl: FEE_PORTAL_URL,
      notes:
        "$30 per living unit, $8 per fixture and backflow device, flat service rows ($30-$50), and a project-valuation percentage ladder for commercial-scale work (3%/$30 rising to ½% + $3,230).",
    },
  ],

  feeSchedules: [
    {
      key: MER_BUILDING_SOURCE_KEY,
      jurisdictionKey: MER_KEYS.jurisdiction,
      sourceKey: MER_BUILDING_SOURCE_KEY,
      title: "City of Meridian City Fees Schedule — Building sections",
      officialUrl: FEE_PORTAL_URL,
      effectiveFrom: MER_FEE_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: MER_LAST_VERIFIED,
      notes:
        "Sections 1.1-1.4 under Resolution 18-2110, amended by 20-2230 (temporary poles) and 20-2234 (after-hours rates); served from the CITYFEEWEB portal.",
    },
  ],

  feeRules: [
    ...MER_BUILDING_RULES.map((rule) => ({
      jurisdictionKey: MER_KEYS.jurisdiction,
      permitTypeKey: "building",
      scheduleKey: MER_BUILDING_SOURCE_KEY,
      rule,
    })),
    ...MER_ELECTRICAL_RULES.map((rule) => ({
      jurisdictionKey: MER_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      scheduleKey: MER_ELECTRICAL_SOURCE_KEY,
      rule,
    })),
    ...MER_PLUMBING_RULES.map((rule) => ({
      jurisdictionKey: MER_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      scheduleKey: MER_PLUMBING_SOURCE_KEY,
      rule,
    })),
  ],

  requirements: [
    {
      jurisdictionKey: MER_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "document",
      title: "Fee-calculation worksheet with the application",
      description:
        "Building Services publishes official fee-calculation worksheets (residential, multi-family, new commercial, tenant improvement) that applicants use to derive project value from livable area, garage and shed square footage before the permit fee is computed.",
      isMandatory: false,
      sortOrder: 1,
      sourceKey: "meridian-residential-worksheet",
      lastVerifiedAt: MER_LAST_VERIFIED,
    },
    {
      jurisdictionKey: MER_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "other",
      title: "Application fees credited to the permit",
      description:
        "Plan-review application fees ($50 residential additions/remodels/garages/sheds and projects under $20,000; $150 new residential and projects over $20,000) are non-refundable but applied to the building permit.",
      isMandatory: true,
      sortOrder: 2,
      sourceKey: MER_BUILDING_SOURCE_KEY,
      lastVerifiedAt: MER_LAST_VERIFIED,
    },
  ],

  profile: {
    jurisdictionKey: MER_KEYS.jurisdiction,
    headline: "Meridian, Idaho Permit Fees & Municipal Building Code",
    summary:
      "Meridian prices every building permit from one formula — $50.00 base plus $5.50 per $1,000 of project value or fraction thereof — with project value derived from the city's own per-square-foot valuation guidance ($94.06 per square foot of living area for new homes). Electrical permits step by service size for new homes ($120-$210) and by wiring cost for commercial work; plumbing charges $30 per living unit and $8 per fixture with a percentage ladder for large projects.",
    localContext:
      "Meridian's Building Services Division, under Community Development, serves its fee data through the City Fees Schedule portal where every row cites its adopting resolution — the structural, electrical and plumbing rows trace to Resolution 18-2110, with temporary-power and after-hours rates amended by Resolutions 20-2230 and 20-2234. The city also publishes fee-calculation worksheets whose formulas make the arithmetic explicit: the commercial sheet computes the building fee as 50 + 5.5 × (value/1,000), adds a 65% building plan check and a 30% fire plan review, and prices police and fire impact fees per square foot by building type.\n\nMeridian sits in Ada County, so Ada County Highway District impact fees ($5,803 per single-family dwelling on the residential worksheet) and the city's water and sewer assessments ($1,696 and $5,807 flats) ride alongside the permit fees — those are not part of the permit itself.",
    valuationBasis:
      "The building formula reads project value: livable area × $94.06 per sq ft for new ground-up homes and complete rebuilds (per the ICC Building Valuation Data the worksheet cites), additions at $72.00/sq ft, garages at $36.91/sq ft, and covered patios or storage sheds at $16.00/sq ft. Electrical commercial fees read total wiring cost (labor and material); plumbing's percentage ladder reads job value.",
    notIncluded:
      "These municipal figures cover the permit and plan-check fees. They exclude:\n\n- **Meridian police, parks and fire impact fees** (per-square-foot tables, $190-$5,544 residential).\n- **Water and sewer assessment flats** ($1,696 / $5,807) and meter fees ($323.92 for the standard ¾-inch meter).\n- **Ada County Highway District impact fees** ($5,803 single-family).\n- **Fire plan review** (30% of the building permit fee, charged by the Fire Department).\n- **After-hours inspections** ($52.93-$57.41 per hour by trade).",
    seoTitle: "Meridian ID Permit Fees | Building Cost Calculator & Fee Schedule",
    seoDescription:
      "Calculate Meridian, Idaho permit costs: $50 + $5.50 per $1,000 building formula, electrical by service size, plumbing per fixture, impact fees excluded.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: MER_LAST_VERIFIED,
  },

  permitPages: [
    {
      jurisdictionKey: MER_KEYS.jurisdiction,
      permitTypeKey: "building",
      slug: "building-permit-cost",
      title: "Meridian Building Permit Cost",
      intro:
        "Meridian prices every building permit from **one formula**: **$50.00 base plus $5.50 per $1,000 of project value, or fraction thereof**. The city's own worksheet derives project value at **$94.06 per square foot** of living area for a new home (per the ICC Building Valuation Data) — so a 2,000-square-foot house values $188,120 and pays **$1,089.50**. Commercial plan check adds **65% of the permit fee**.",
      localSummary:
        "Building Services, at 33 E. Broadway Ave, issues structural permits under Resolution 18-2110 and publishes fee-calculation worksheets that make the arithmetic explicit: livable area, garage (at $36.91/sq ft) and shed or patio (at $16/sq ft) square footage multiply into project value, then the $50 + $5.50/$1,000 formula applies. Application fees ($50 or $150 by project size) are non-refundable but credited to the permit. Demolitions pay a flat $50, and work started without a permit doubles the fee.",
      notIncluded:
        "This estimate covers the building permit and its commercial plan check. It excludes:\n\n- **Police, parks and fire impact fees** (per-square-foot tables by building type).\n- **Water/sewer assessments and meter fees** ($1,696, $5,807, $323.92).\n- **ACHD impact fees** ($5,803 per single-family dwelling).\n- **Fire plan review** (30% of the building fee).\n- **After-hours inspections** ($52.93/hour).",
      workedExample: {
        scenario:
          "A new single-family home in Meridian with 2,000 square feet of livable area (project value $188,120 at the worksheet's $94.06/sq ft).",
        inputs: {
          valuationCents: 18_812_000,
          squareFootage: 2_000,
          occupancy: "residential",
          workType: "new_construction",
        },
        notes:
          "Project value: 2,000 sq ft × $94.06 = **$188,120**. Formula: $50.00 base + ($188,120 ÷ $1,000 rounds up to 189 bands) × $5.50 = $50.00 + **$1,039.50** = **$1,089.50**. Total: **$1,089.50**.",
      },
      faqs: [
        {
          question: "How is a Meridian building permit fee calculated?",
          answer:
            "One formula covers residential and commercial work alike: $50.00 base plus $5.50 for each $1,000 of project value or fraction thereof, under Resolution 18-2110's Residential/Commercial Permit Fee Calculation Formula.",
          sourceId: MER_BUILDING_SOURCE_KEY,
          attribution: "City of Meridian City Fees Schedule, Building sec. 1.1 (Res. 18-2110)",
        },
        {
          question: "How does Meridian determine project value?",
          answer:
            "The city's fee-calculation worksheet values new ground-up homes and complete rebuilds at $94.06 per square foot of livable area (per the BVD table), additions at $72.00, garages at $36.91, and covered patios or storage sheds at $16.00 per square foot. Garages and sheds multiply separately from living area.",
          sourceId: "meridian-residential-worksheet",
          attribution: "Residential Fee Calculation Worksheet (6-1-2026)",
        },
        {
          question: "What would a 2,000 sq ft new home pay in Meridian?",
          answer:
            "2,000 sq ft × $94.06 = $188,120 project value; the formula charges $50.00 plus 189 × $5.50 = $1,039.50, for $1,089.50 total (the last $120 of value still buys a full $5.50 band — 'or fraction thereof').",
          sourceId: "meridian-residential-worksheet",
          attribution: "Residential Fee Calculation Worksheet (6-1-2026)",
        },
        {
          question: "Is there a plan review fee in Meridian?",
          answer:
            "Commercial projects pay a plan check fee of 65% of the building permit fee (non-refundable, applied to the permit). The residential structural schedule publishes no plan-check line — the residential worksheet charges none beyond the permit formula.",
          sourceId: MER_BUILDING_SOURCE_KEY,
          attribution: "City of Meridian City Fees Schedule, Commercial Plan Check fee",
        },
        {
          question: "What are Meridian's application fees?",
          answer:
            "$50 for residential additions, remodels, garages, sheds and other misc projects and for commercial or multi-family projects valued under $20,000; $150 for new residential projects and commercial or multi-family projects over $20,000. All are non-refundable but applied to the building permit.",
          sourceId: MER_BUILDING_SOURCE_KEY,
          attribution: "City of Meridian City Fees Schedule, Application Fees",
        },
        {
          question: "How much is a demolition permit in Meridian?",
          answer:
            "A flat $50.00 for residential and commercial accounts. Work commencing without a permit is charged double permit fees as the minimum.",
          sourceId: MER_BUILDING_SOURCE_KEY,
          attribution: "City of Meridian City Fees Schedule, Demo Fee",
        },
        {
          question: "Are impact fees part of the building permit in Meridian?",
          answer:
            "No. Police, parks and fire impact fees (per-square-foot tables), water and sewer assessments, meter fees, and Ada County Highway District impact fees are collected alongside the permit but are separate charges — the commercial worksheet prices police impact at $1.23/sq ft for restaurant/retail or $0.19 for other building types, and fire at $1.29/$0.96.",
          sourceId: "meridian-commercial-worksheet",
          attribution: "New Commercial Fee Calculation Worksheet (6-1-2026)",
        },
        {
          question: "What happens on a Meridian re-inspection?",
          answer:
            "$45.00 per re-inspection for residential and commercial accounts. After-hours and overtime inspections bill at $52.93 per hour (building).",
          sourceId: MER_BUILDING_SOURCE_KEY,
          attribution: "City of Meridian City Fees Schedule, Re-Inspection Fees",
        },
      ],
      seoTitle: "Meridian ID Building Permit Cost ($50 + $5.50 per $1,000 Formula)",
      seoDescription:
        "Meridian building permits: one formula, $50 base + $5.50 per $1,000 of project value; 65% commercial plan check; $94.06/sq ft valuation guidance.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: MER_LAST_VERIFIED,
    },

    {
      jurisdictionKey: MER_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      slug: "electrical-permit-cost",
      title: "Meridian Electrical Permit Cost",
      intro:
        "Meridian electrical permits price by scope: a **new single-family home pays $120.00** (up to and including 200-amp service) or **$210.00** (201-400 amps), an **existing-home permit is $40.00 plus $10 per branch circuit**, multi-family runs **$120 per building plus $60 per unit** at three or more units, and commercial work pays **by wiring cost — $40 plus 2.5%, $100 plus 1%, or $180 plus ½%** by bracket.",
      localSummary:
        "Electrical permits issue under Building Electrical Fees sec. 1.2 (Res. 18-2110). The new-home rows include everything wired at the same time inside the structure and attached garage; hot tubs, pools and spas permit separately at $40, as do ground grids. Temporary power poles for construction are $40 for residential service at or under 200 amps (Res. 20-2230) — Idaho Power will not set the meter until the pole passes city inspection. Work without a permit doubles the fee.",
      notIncluded:
        "This estimate covers the electrical permit only. It excludes:\n\n- **Idaho Power** meter, service-drop and transformer charges.\n- **Fire alarm and sprinkler inspections** ($125 for limited-license fire alarm work under Res. 22-2306).\n- **Building, plumbing and mechanical permits** for the same project.\n- **After-hours inspections** ($57.41/hour) and re-inspections ($45).\n- **Temporary poles over 200 amps and commercial temp power**, which price from the commercial schedule.",
      workedExample: {
        scenario:
          "A homeowner adds four new branch circuits in an existing Meridian single-family home.",
        inputs: {
          occupancy: "residential",
          workType: "alteration",
          custom: {
            existing_residential_wiring: true,
            circuits: 4,
          },
        },
        notes:
          "Existing residential: $40.00 permit fee + 4 branch circuits × $10.00 = $40.00. Total: **$80.00**.",
      },
      faqs: [
        {
          question: "How much is an electrical permit for a new house in Meridian?",
          answer:
            "$120.00 for a single-family dwelling with service up to and including 200 amps, $210.00 for 201-400 amps. The row covers everything contained within the residential structure and attached garage, all wired at the same time. Service above 400 amps prices from the commercial schedule.",
          sourceId: MER_ELECTRICAL_SOURCE_KEY,
          attribution: "City of Meridian City Fees Schedule, Building Electrical (Res. 18-2110)",
        },
        {
          question: "What does electrical work on an existing home cost to permit?",
          answer:
            "$40.00 permit fee plus $10.00 for each branch circuit — a four-circuit job totals $80.00.",
          sourceId: MER_ELECTRICAL_SOURCE_KEY,
          attribution: "City of Meridian City Fees Schedule, Existing Residential",
        },
        {
          question: "How are Meridian multi-family electrical permits priced?",
          answer:
            "Duplexes pay a flat $210.00. Buildings with three or more multi-family units pay $120.00 per building plus $60.00 per unit.",
          sourceId: MER_ELECTRICAL_SOURCE_KEY,
          attribution: "City of Meridian City Fees Schedule, Multi-family Dwellings",
        },
        {
          question: "How is a commercial electrical permit priced in Meridian?",
          answer:
            "By total wiring cost (all labor and material to install the wiring system): $40 plus 2.5% up to $2,000 of wiring cost; $100 plus 1% from $2,001 to $10,000; $180 plus ½ of 1% of the portion over $10,000. The same rows cover lawn sprinkler systems, limited energy wiring, escalators and moving walks.",
          sourceId: MER_ELECTRICAL_SOURCE_KEY,
          attribution: "City of Meridian City Fees Schedule, Commercial, Industrial and other",
        },
        {
          question: "How much is a hot tub or pool electrical permit in Meridian?",
          answer:
            "$40.00 for hot tubs, swimming pools and other spas; a ground grid is also $40.00.",
          sourceId: MER_ELECTRICAL_SOURCE_KEY,
          attribution: "City of Meridian City Fees Schedule, Hot Tubs/Pools/Spas",
        },
        {
          question: "What does a temporary construction power pole cost in Meridian?",
          answer:
            "$40.00 for residential service of 200 amps or less at one location (Res. 20-2230). Every pole must be called in for inspection, and Idaho Power will not set the meter until the pole passes. Residential over 200 amps and all commercial construction price from the commercial fee schedule.",
          sourceId: MER_ELECTRICAL_SOURCE_KEY,
          attribution: "City of Meridian City Fees Schedule (Res. 20-2230)",
        },
        {
          question: "What is the mobile home electrical service fee in Meridian?",
          answer:
            "$50.00 permit fee plus $10.00 per each additional branch circuit.",
          sourceId: MER_ELECTRICAL_SOURCE_KEY,
          attribution: "City of Meridian City Fees Schedule, Mobile Home Service Fee",
        },
        {
          question: "What are Meridian's electrical inspection fees?",
          answer:
            "Re-inspection $45.00; after-hours inspection $57.41 per hour. Work constructed without a permit is charged double permit fees as the minimum.",
          sourceId: MER_ELECTRICAL_SOURCE_KEY,
          attribution: "City of Meridian City Fees Schedule, Re-Inspection (Res. 20-2234)",
        },
      ],
      seoTitle: "Meridian ID Electrical Permit Cost (Service Size & Wiring-Cost Fees)",
      seoDescription:
        "Meridian electrical permits: $120-$210 new residential by amps, $40 + $10/circuit existing homes, $40 + 2.5% commercial wiring cost.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: MER_LAST_VERIFIED,
    },

    {
      jurisdictionKey: MER_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      slug: "plumbing-permit-cost",
      title: "Meridian Plumbing Permit Cost",
      intro:
        "Meridian plumbing permits price **$30.00 per living unit** with **$8.00 per fixture** and **$8.00 per backflow device**, plus flat rows for specific work — water conditioner $30, fixture replacement $30, lawn sprinkler $30, mobile-home connection $40, sewer line $38, and a sewer/water combination $50. Large projects switch to a **project-value ladder from 3% + $30 to ½% + $3,230**.",
      localSummary:
        "Plumbing permits issue under Building Plumbing Fees sec. 1.4 (Res. 18-2110). Each single-family dwelling or living unit in a multi-unit building pays $30; fixtures and their replacements price $8 each, and backflow devices $8. The project-valuation table covers commercial-scale work in four steps (3% of job value and $30 to $20,000; 2% over $20,000 plus $630; 1% over $100,000 plus $2,230; ½% over $200,000 plus $3,230). Re-inspections are $45 and unpermitted work doubles the fee.",
      notIncluded:
        "This estimate covers the plumbing permit only. It excludes:\n\n- **Water and sewer district connection and capacity fees**.\n- **Irrigation main-line work** beyond the lawn sprinkler permit.\n- **Building, electrical and mechanical permits** for the same project.\n- **Re-inspections ($45)** and after-hours charges.\n- **Impact fees** collected with the building permit.",
      workedExample: {
        scenario:
          "A Meridian landlord permits a two-unit duplex plumbing rough-in with five fixtures per unit and one backflow device.",
        inputs: {
          occupancy: "residential",
          workType: "new_construction",
          units: 2,
          fixtures: 10,
          custom: { backflow_devices: 1 },
        },
        notes:
          "Living units: 2 × $30.00 = **$60.00**. Fixtures: 10 × $8.00 = **$80.00**. Backflow device: 1 × $8.00 = **$8.00**. Total: **$148.00**.",
      },
      faqs: [
        {
          question: "How much is a plumbing permit per living unit in Meridian?",
          answer:
            "$30.00 for each single-family dwelling or living unit in an apartment, condominium, townhouse or other multiple unit.",
          sourceId: MER_PLUMBING_SOURCE_KEY,
          attribution: "City of Meridian City Fees Schedule, Building Plumbing (Res. 18-2110)",
        },
        {
          question: "How are plumbing fixtures charged in Meridian?",
          answer:
            "$8.00 per fixture and $8.00 per fixture replacement. Backflow devices are $8.00 each as well.",
          sourceId: MER_PLUMBING_SOURCE_KEY,
          attribution: "City of Meridian City Fees Schedule, Permit fee (each living unit)",
        },
        {
          question: "What do sewer and water service permits cost in Meridian?",
          answer:
            "A residential sewer line or replacement is $38.00; the residential sewer/water combination (one inspection) is $50.00; a mobile home connect or reconnect to existing stub outs is $40.00.",
          sourceId: MER_PLUMBING_SOURCE_KEY,
          attribution: "City of Meridian City Fees Schedule, Permit fee rows",
        },
        {
          question: "How is large-project plumbing priced in Meridian?",
          answer:
            "By the Project Valuation Table: 3% of job value and $30 up to $20,000; $630 plus 2% of job value over $20,000 through $100,000; $2,230 plus 1% over $100,000 through $200,000; and $3,230 plus ½% of job value over $200,000.",
          sourceId: MER_PLUMBING_SOURCE_KEY,
          attribution: "City of Meridian City Fees Schedule, Project Valuation Table",
        },
        {
          question: "How much is a lawn sprinkler permit in Meridian?",
          answer:
            "$30.00 flat for the lawn sprinkler permit; water conditioners are $30.00 with an $8.00 additional per-unit fee.",
          sourceId: MER_PLUMBING_SOURCE_KEY,
          attribution: "City of Meridian City Fees Schedule, Permit fee rows",
        },
        {
          question: "What does a fixture replacement permit cost?",
          answer:
            "$30.00 for the fixture replacement permit (individual fixture replacements otherwise price $8.00 each under the per-fixture row).",
          sourceId: MER_PLUMBING_SOURCE_KEY,
          attribution: "City of Meridian City Fees Schedule, Fixture replacement permit fee",
        },
        {
          question: "What are Meridian's plumbing inspection fees?",
          answer:
            "Re-inspections $45.00. Work commencing without a permit is charged double permit fees as the minimum.",
          sourceId: MER_PLUMBING_SOURCE_KEY,
          attribution: "City of Meridian City Fees Schedule, Other Plumbing fees",
        },
        {
          question: "Does Meridian require a separate permit for a water heater swap?",
          answer:
            "A single water heater prices $8.00 as a fixture replacement under the per-fixture row, or the $30.00 fixture-replacement permit covers the swap as its own permit — the calculator charges the row that matches how the work is filed.",
          sourceId: MER_PLUMBING_SOURCE_KEY,
          attribution: "City of Meridian City Fees Schedule, Permit fee rows",
        },
      ],
      seoTitle: "Meridian ID Plumbing Permit Cost ($30/Unit & $8/Fixture Fees)",
      seoDescription:
        "Meridian plumbing permits: $30 per living unit, $8 per fixture and backflow device, flat service rows $30-$50, value ladder to ½% + $3,230.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: MER_LAST_VERIFIED,
    },
  ],

  verifications: [
    {
      entityType: "jurisdiction_profile",
      entityKey: MER_KEYS.jurisdiction,
      status: "verified",
      method: "official_portal_check",
      verifiedAt: MER_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Idaho Expansion",
      sourceKey: MER_BUILDING_SOURCE_KEY,
      notes:
        "CITYFEEWEB portal read in full through a browser session (Cloudflare-blocked to plain HTTP agents); Building sections 1.1-1.4 rows captured with resolution numbers.",
    },
    {
      entityType: "fee_schedule",
      entityKey: MER_BUILDING_SOURCE_KEY,
      status: "verified",
      method: "official_portal_check",
      verifiedAt: MER_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Idaho Expansion",
      sourceKey: MER_BUILDING_SOURCE_KEY,
      notes:
        "Structural, electrical, mechanical and plumbing fee rows verified against the portal and against the formulas embedded in the city's own 6-1-2026 fee-calculation worksheets.",
    },
    {
      entityType: "permit_page",
      entityKey: "building-permit-cost",
      permitTypeKey: "building",
      status: "verified",
      method: "official_portal_check",
      verifiedAt: MER_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Idaho Expansion",
      sourceKey: MER_BUILDING_SOURCE_KEY,
      notes: "Editorial gate checks passed for the building page.",
    },
    {
      entityType: "permit_page",
      entityKey: "electrical-permit-cost",
      permitTypeKey: "electrical",
      status: "verified",
      method: "official_portal_check",
      verifiedAt: MER_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Idaho Expansion",
      sourceKey: MER_ELECTRICAL_SOURCE_KEY,
      notes: "Editorial gate checks passed for the electrical page.",
    },
    {
      entityType: "permit_page",
      entityKey: "plumbing-permit-cost",
      permitTypeKey: "plumbing",
      status: "verified",
      method: "official_portal_check",
      verifiedAt: MER_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Idaho Expansion",
      sourceKey: MER_PLUMBING_SOURCE_KEY,
      notes: "Editorial gate checks passed for the plumbing page.",
    },
  ],
};
