import type { JurisdictionSeed } from "@/content/seed-types";
import {
  NOLA_BUILDING_RULES,
  NOLA_BUILDING_SOURCE_KEY,
  NOLA_ELECTRICAL_RULES,
  NOLA_ELECTRICAL_SOURCE_KEY,
  NOLA_FEE_EFFECTIVE_FROM,
  NOLA_PLUMBING_RULES,
  NOLA_PLUMBING_SOURCE_KEY,
} from "@/content/neworleans/fee-rules";

export const NOLA_LAST_VERIFIED = "2026-09-26";

export const NOLA_KEYS = {
  state: "la",
  county: "orleans-parish",
  jurisdiction: "new-orleans",
} as const;

const state = {
  code: "LA",
  slug: "louisiana",
  name: "Louisiana",
  fipsCode: "22",
};

const county = {
  key: NOLA_KEYS.county,
  slug: "orleans-parish",
  name: "Orleans Parish",
  fipsCode: "22071",
};

const CITY_URL = "https://nola.gov";
const SAFETY_PERMITS_URL = "https://nola.gov/department-of-safety-and-permits/";
const FEE_SCHEDULE_URL =
  "https://nola.gov/nola/media/One-Stop-Shop/Safety%20and%20Permits/SP-Building-Permit-Fee-Schedule.pdf";
const GUIDE_URL = "https://nola.gov/guide-to-building-permits/";
const ELECTRICAL_URL = "https://nola.gov/electrical-permit/";
const ESTIMATOR_URL = "https://nola.gov/building-permit-fee-estimator/";
const SWBNO_URL = "https://www.swbno.org/CustomerService/PlumbingInfo";
const ONE_STOP_URL = "https://onestopapp.nola.gov";

export const neworleansSeed: JurisdictionSeed = {
  state,
  county,

  jurisdiction: {
    key: NOLA_KEYS.jurisdiction,
    stateKey: NOLA_KEYS.state,
    countyKey: NOLA_KEYS.county,
    type: "city",
    slug: "new-orleans",
    name: "New Orleans",
    officialName:
      "City of New Orleans — Department of Safety & Permits (plumbing: Sewerage & Water Board of New Orleans)",
    websiteUrl: CITY_URL,
    permitPortalUrl: ONE_STOP_URL,
    timezone: "America/Chicago",
    isActive: true,
  },

  departments: [
    {
      key: "nola-safety-permits",
      jurisdictionKey: NOLA_KEYS.jurisdiction,
      kind: "building",
      name: "Department of Safety & Permits",
      phone: "(504) 658-7200",
      email: null,
      url: SAFETY_PERMITS_URL,
      addressLine: "1340 Poydras Street, Suite 800, New Orleans, LA 70112",
      hours: "Monday – Friday, 9:00 a.m. – 5:00 p.m. CT",
      notes:
        "Issues building and electrical permits through the One Stop portal, runs plan review, and sets the fee schedule read here. Electrical inspections: (504) 658-7145; permit intake: (504) 658-7299.",
    },
    {
      key: "swbno-plumbing",
      jurisdictionKey: NOLA_KEYS.jurisdiction,
      kind: "other",
      name: "Sewerage & Water Board of New Orleans — Plumbing Department",
      phone: "(504) 529-2837",
      email: null,
      url: SWBNO_URL,
      addressLine: "625 St. Joseph Street, Room 255, New Orleans, LA 70165",
      hours: "Monday – Friday, 8:00 a.m. – 6:00 p.m. CT (customer service)",
      notes:
        "A separate political corporation that permits and inspects all plumbing connected to the public sewers and water mains under the S&WB Plumbing Code. A Licensed Master Plumber registered with the Board must file; permits are issued through the City's One Stop portal.",
    },
  ],

  sources: [
    {
      key: NOLA_BUILDING_SOURCE_KEY,
      jurisdictionKey: NOLA_KEYS.jurisdiction,
      title: "City of New Orleans — Building Permit Fee Schedule (Department of Safety & Permits)",
      url: FEE_SCHEDULE_URL,
      sourceType: "fee_schedule_pdf",
      issuingAuthority: "City of New Orleans, Department of Safety & Permits",
      authorityKind: "city",
      isPrimary: true,
      documentDate: null,
      effectiveFrom: NOLA_FEE_EFFECTIVE_FROM,
      retrievedAt: "2026-09-26",
      lastVerifiedAt: NOLA_LAST_VERIFIED,
      notes:
        "Building permits (not demolition): $60 base + $5 per $1,000 of construction value; plan review $1 per $1,000 with a $60 minimum and re-review at $0.50 per $1,000 (minimum $45); demolition $95 base + $5 per $1,000 of demolition cost; NCD application fees $250/$500; 50% surcharge for HDLC/Vieux Carré work; 200% penalty for unpermitted work. Read from the PDF directly (two extractions agree).",
    },
    {
      key: "nola-building-guide",
      jurisdictionKey: NOLA_KEYS.jurisdiction,
      title: "City of New Orleans — Guide to Building Permits (fees section)",
      url: GUIDE_URL,
      sourceType: "municipal_website",
      issuingAuthority: "City of New Orleans, Department of Safety & Permits",
      authorityKind: "city",
      isPrimary: true,
      documentDate: "2026-01-22",
      effectiveFrom: NOLA_FEE_EFFECTIVE_FROM,
      retrievedAt: "2026-09-26",
      lastVerifiedAt: NOLA_LAST_VERIFIED,
      notes:
        "States the permit formula (job value × .005 + $60), the plan review fee and $60 minimum, the historic-district surcharge on the permit fee, the 2× penalty for ordinary construction and 5× (or 10% of assessed value) for unpermitted demolition — and the sentence that separates the plumbing authority: 'There is also a separate fee for plumbing permits from the Sewerage & Water Board.' Page dated by its own 'Last updated: 1/22/2026'.",
    },
    {
      key: "nola-estimator",
      jurisdictionKey: NOLA_KEYS.jurisdiction,
      title: "City of New Orleans — Building Permit Fee Estimator page",
      url: ESTIMATOR_URL,
      sourceType: "municipal_website",
      issuingAuthority: "City of New Orleans, Department of Safety & Permits",
      authorityKind: "city",
      isPrimary: true,
      documentDate: "2026-08-14",
      effectiveFrom: null,
      retrievedAt: "2026-09-26",
      lastVerifiedAt: NOLA_LAST_VERIFIED,
      notes:
        "Prints 'a plan review fee of $120 or $1 per $1000 of work' against the schedule's $60 minimum — a City-internal conflict recorded on the page, charged at the schedule's figure.",
    },
    {
      key: NOLA_ELECTRICAL_SOURCE_KEY,
      jurisdictionKey: NOLA_KEYS.jurisdiction,
      title: "City of New Orleans — Electrical Permit page",
      url: ELECTRICAL_URL,
      sourceType: "municipal_website",
      issuingAuthority: "City of New Orleans, Department of Safety & Permits",
      authorityKind: "city",
      isPrimary: true,
      documentDate: "2026-05-11",
      effectiveFrom: null,
      retrievedAt: "2026-09-26",
      lastVerifiedAt: NOLA_LAST_VERIFIED,
      notes:
        "Fees: $40 application + $3 per new circuit + $0.30 per service amperage; $40 per construction loop; $60 per elevator/moving stair/dumbwaiter/man lift; $40 per sign. Class 'A' Electrical License required. Page dated by its own 'Last updated: 5/11/2026'.",
    },
    {
      key: NOLA_PLUMBING_SOURCE_KEY,
      jurisdictionKey: NOLA_KEYS.jurisdiction,
      title:
        "Sewerage & Water Board of New Orleans — Plumbing Information (Plumbing Department)",
      url: SWBNO_URL,
      sourceType: "municipal_website",
      issuingAuthority: "Sewerage & Water Board of New Orleans",
      authorityKind: "other",
      isPrimary: true,
      documentDate: "2025-01-06",
      effectiveFrom: null,
      retrievedAt: "2026-09-26",
      lastVerifiedAt: NOLA_LAST_VERIFIED,
      notes:
        "Establishes the plumbing authority: permits under the S&WB Plumbing Code (§§2.2.1, 2.2.4, 3.2), filed by a Licensed Master Plumber registered with the Board, inspected by the Board's Plumbing Department. Page dated by its own 'last modified on Jan 6, 2025'. The Board publishes no complete public schedule of plumbing permit/inspection fees; the $50.00 filing fee is read from the City's One Stop permit records (line item 'SWB Filing Fee').",
    },
    {
      key: "nola-onestop-records",
      jurisdictionKey: NOLA_KEYS.jurisdiction,
      title: "City of New Orleans — One Stop App (permit records, fee line items)",
      url: ONE_STOP_URL,
      sourceType: "permit_portal",
      issuingAuthority: "City of New Orleans",
      authorityKind: "city",
      isPrimary: true,
      documentDate: null,
      effectiveFrom: null,
      retrievedAt: "2026-09-26",
      lastVerifiedAt: NOLA_LAST_VERIFIED,
      notes:
        "Public permit records show plumbing permits' fee line items, including 'SWB Filing Fee, $50.00' — the source for the one SWBNO amount modelled here.",
    },
  ],

  permitTypes: [],
  projectTypes: [],

  jurisdictionPermitTypes: [
    {
      jurisdictionKey: NOLA_KEYS.jurisdiction,
      permitTypeKey: "building",
      isAvailable: true,
      localName: "Building Permit",
      officialUrl: FEE_SCHEDULE_URL,
      notes:
        "$60 base + $5 per $1,000 of construction value; plan review $1 per $1,000 (minimum $60); 50% HDLC/VCC surcharge; demolition $95 + $5 per $1,000.",
    },
    {
      jurisdictionKey: NOLA_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      isAvailable: true,
      localName: "Electrical Permit",
      officialUrl: ELECTRICAL_URL,
      notes:
        "$40 application + $3 per new circuit + $0.30 per service ampere; construction loops $40; elevator installations $60; signs $40.",
    },
    {
      jurisdictionKey: NOLA_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      isAvailable: true,
      localName: "Plumbing Permit (S&WB)",
      officialUrl: SWBNO_URL,
      notes:
        "Set by the Sewerage & Water Board, not the City: $50 filing fee via One Stop (Board's inspection fees not published as a schedule). Filed by an SWBNO-registered Licensed Master Plumber.",
    },
  ],

  feeSchedules: [
    {
      key: "nola-building-schedule",
      jurisdictionKey: NOLA_KEYS.jurisdiction,
      sourceKey: NOLA_BUILDING_SOURCE_KEY,
      title: "New Orleans Building Permit Fee Schedule (Safety & Permits)",
      officialUrl: FEE_SCHEDULE_URL,
      effectiveFrom: NOLA_FEE_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: NOLA_LAST_VERIFIED,
      notes:
        "The City's published building fee schedule PDF, cross-checked against the Guide to Building Permits and the fee estimator page.",
    },
    {
      key: "nola-electrical-schedule",
      jurisdictionKey: NOLA_KEYS.jurisdiction,
      sourceKey: NOLA_ELECTRICAL_SOURCE_KEY,
      title: "New Orleans Electrical Permit Fees (Safety & Permits)",
      officialUrl: ELECTRICAL_URL,
      effectiveFrom: NOLA_FEE_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: NOLA_LAST_VERIFIED,
      notes: "Application + per-circuit + per-ampere structure from the Electrical Permit page.",
    },
    {
      key: "nola-plumbing-schedule",
      jurisdictionKey: NOLA_KEYS.jurisdiction,
      sourceKey: NOLA_PLUMBING_SOURCE_KEY,
      title: "New Orleans Plumbing Permit Fees (Sewerage & Water Board)",
      officialUrl: SWBNO_URL,
      effectiveFrom: NOLA_FEE_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: NOLA_LAST_VERIFIED,
      notes:
        "Only the $50 filing fee is published; the Board's remaining inspection fees are unpublished and named as such.",
    },
  ],

  feeRules: [
    ...NOLA_BUILDING_RULES.map((rule) => ({
      jurisdictionKey: NOLA_KEYS.jurisdiction,
      permitTypeKey: "building",
      scheduleKey: "nola-building-schedule",
      rule,
    })),
    ...NOLA_ELECTRICAL_RULES.map((rule) => ({
      jurisdictionKey: NOLA_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      scheduleKey: "nola-electrical-schedule",
      rule,
    })),
    ...NOLA_PLUMBING_RULES.map((rule) => ({
      jurisdictionKey: NOLA_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      scheduleKey: "nola-plumbing-schedule",
      rule,
    })),
  ],

  requirements: [
    {
      jurisdictionKey: NOLA_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "document",
      title: "Plans for reviewable projects",
      description:
        "Projects that require plan review submit plans with the application; fees are due at application time and are non-refundable once application is made. Fees include normal inspections and the Certificate of Use and Occupancy.",
      isMandatory: true,
      sortOrder: 1,
      sourceKey: "nola-building-guide",
      lastVerifiedAt: NOLA_LAST_VERIFIED,
    },
    {
      jurisdictionKey: NOLA_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "other",
      title: "Historic-district review where applicable",
      description:
        "Work in HDLC or Vieux Carré Commission jurisdictions carries the 50% surcharge and the commissions' own architectural review. Properties in Neighborhood Conservation Districts pay additional application fees on demolition.",
      isMandatory: false,
      sortOrder: 2,
      sourceKey: NOLA_BUILDING_SOURCE_KEY,
      lastVerifiedAt: NOLA_LAST_VERIFIED,
    },
    {
      jurisdictionKey: NOLA_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      requirementType: "license",
      title: "Class 'A' Electrical License (City of New Orleans)",
      description:
        "Electrical permits can only be obtained by an electrical contractor holding a Class 'A' Electrical License from the City of New Orleans.",
      isMandatory: true,
      sortOrder: 3,
      sourceKey: NOLA_ELECTRICAL_SOURCE_KEY,
      lastVerifiedAt: NOLA_LAST_VERIFIED,
    },
    {
      jurisdictionKey: NOLA_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      requirementType: "license",
      title: "Licensed Master Plumber registered with SWBNO",
      description:
        "A Licensed Master Plumber registered with the Sewerage & Water Board must file the plumbing permit for any work connected to the public sewers and water mains. Unpermitted plumbing risks water-service interruption under the Board's code.",
      isMandatory: true,
      sortOrder: 4,
      sourceKey: NOLA_PLUMBING_SOURCE_KEY,
      lastVerifiedAt: NOLA_LAST_VERIFIED,
    },
  ],

  profile: {
    jurisdictionKey: NOLA_KEYS.jurisdiction,
    headline: "New Orleans, Louisiana Permit Fees — City & Sewerage & Water Board",
    summary:
      "New Orleans splits its permit fees between two governments. The Department of Safety & Permits prices building permits at $60 plus $5 per $1,000 of construction value, with plan review at $1 per $1,000 (minimum $60) and a 50% surcharge inside the Historic District Landmarks and Vieux Carré districts; demolition runs $95 plus $5 per $1,000. Electrical permits are $40 plus $3 per new circuit and $0.30 per ampere of service. Plumbing is the Sewerage & Water Board's regime entirely: an SWBNO-registered master plumber files through the City's One Stop portal, where the published line item is a $50 filing fee.",
    localContext:
      "New Orleans is the rare city whose plumbing permits are issued by a separate political corporation: the Sewerage & Water Board of New Orleans has inspected plumbing under its own S&WB Plumbing Code for over a century, because the Board — not the City — owns the water and sewer mains every fixture connects to. The City's own guide says plainly that plumbing permit fees go to the Board.\n\nThe other New Orleans particular is the historic fabric: half the city's permit volume sits inside the HDLC and Vieux Carré districts, where the 50% surcharge funds the architectural review that protects it, and where unpermitted work draws the 200% penalty on top.",
    valuationBasis:
      "Construction value is the value of work to be performed — the City's own formula multiplies job value by .005 and adds $60. Documentation supporting the stated job value should accompany the application.",
    notIncluded:
      "These figures cover the City of New Orleans building and electrical permit fees and the one published Sewerage & Water Board filing fee. They exclude:\n\n- **SWBNO's inspection fees beyond the filing fee**, which the Board publishes no schedule for.\n- **Water and sewer tap, meter and connection charges** from the Board.\n- **Mechanical (HVAC) permits**, priced separately by Safety & Permits.\n- **Zoning review fees** ($125 for sign work, and use/occupancy separations).\n- **Neighborhood Conservation District application fees** ($250/$500 on demolition) and **sign permits**.\n- **Louisiana State Uniform Construction Code Council** state-level administration.",
    seoTitle: "New Orleans LA Permit Fees | City & SWBNO Fee Schedules",
    seoDescription:
      "New Orleans building permits: $60 + $5/$1,000, plan review $1/$1,000, 50% historic surcharge. Electrical $40 + $3/circuit + $0.30/amp. Plumbing via SWBNO.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: NOLA_LAST_VERIFIED,
  },

  permitPages: [
    {
      jurisdictionKey: NOLA_KEYS.jurisdiction,
      permitTypeKey: "building",
      slug: "building-permit-cost",
      title: "New Orleans Building Permit Cost",
      intro:
        "A New Orleans building permit is priced by the Department of Safety & Permits at **$60 plus $5 per $1,000 of construction value** — the City's own formula is *job value × .005 + $60*. When plans are required, **plan review adds $1 per $1,000 with a $60.00 minimum**. Inside the **Historic District Landmarks Commission or Vieux Carré** jurisdictions a **50% surcharge** rides the permit fee. Demolition is priced separately: **$95 plus $5 per $1,000 of demolition cost**.",
      localSummary:
        "Permits are applied for through the One Stop portal and fees are due at application, nonrefundable once filed. Every per-$1,000 rate here prorates — the City's formula multiplies straight through. New Orleans levies the region's sharpest unpermitted-work penalty: 200% of all fees on top of the permit for ordinary construction, and for unpermitted demolition five times the fee or 10% of the building's assessed value, whichever is greater. Fees include normal inspections and the Certificate of Use and Occupancy.",
      notIncluded:
        "This estimate covers the City of New Orleans building permit, plan review and the historic-district surcharge only. It excludes:\n\n- **Electrical and mechanical permits**, which Safety & Permits issues separately.\n- **Plumbing permits**, which belong to the Sewerage & Water Board of New Orleans.\n- **Neighborhood Conservation District application fees** ($250 residential / $500 commercial on demolition).\n- **Zoning review fees and Certificates of Use** for changes of use ($190 where no work is required).\n- **SWBNO water and sewer tap charges** for new connections.",
      workedExample: {
        scenario:
          "A $220,000 commercial renovation in New Orleans requiring plan review, on a property outside the historic districts.",
        inputs: {
          valuationCents: 22_000_000,
          squareFootage: 4_000,
          occupancy: "commercial",
          workType: "alteration",
        },
        notes:
          "Permit: $60 + $5 × 220 = **$1,160.00**. Plan review: $1 × 220 = **$220.00** (above the $60 minimum). No historic surcharge. Total: **$1,380.00**.",
      },
      faqs: [
        {
          question: "How is a New Orleans building permit fee calculated?",
          answer:
            "The City's formula is job value × .005 + $60 — that is, $60 base plus $5 per $1,000 of construction value. A $220,000 project pays $1,160.00.",
          sourceId: NOLA_BUILDING_SOURCE_KEY,
          attribution: "City of New Orleans Building Permit Fee Schedule",
        },
        {
          question: "How much is plan review in New Orleans?",
          answer:
            "When plans are required, plan review adds $1 per $1,000 of construction value with a $60.00 minimum. A re-review of resubmitted plans is $0.50 per $1,000 with a $45 minimum.",
          sourceId: NOLA_BUILDING_SOURCE_KEY,
          attribution: "City of New Orleans Building Permit Fee Schedule",
        },
        {
          question: "What is the 50% historic district surcharge?",
          answer:
            "Work in locations under the Historic District Landmarks Commission or the Vieux Carré Commission carries a 50% surcharge on the building permit fee (the schedule also applies it to plan review, demolition and sign fees). Roughly half the city's historic core sits in these districts.",
          sourceId: NOLA_BUILDING_SOURCE_KEY,
          attribution: "City of New Orleans Building Permit Fee Schedule",
        },
        {
          question: "How much is a demolition permit in New Orleans?",
          answer:
            "$95 base plus $5 per $1,000 of demolition cost. If the property is in a Neighborhood Conservation District, add a $250 residential or $500 commercial application fee.",
          sourceId: NOLA_BUILDING_SOURCE_KEY,
          attribution: "City of New Orleans Building Permit Fee Schedule",
        },
        {
          question: "What is the penalty for building without a permit in New Orleans?",
          answer:
            "200% of all fees in addition to the permit fee for ordinary construction — effectively triple. Unpermitted demolition is assessed at five times the permit price or 10% of the building's assessed value, whichever is greater.",
          sourceId: "nola-building-guide",
          attribution: "City of New Orleans Guide to Building Permits",
        },
        {
          question: "Does the permit fee include inspections?",
          answer:
            "Yes. Fees include normal inspections and the Certificate of Use and Occupancy. Once application is made, fees are non-refundable.",
          sourceId: "nola-building-guide",
          attribution: "City of New Orleans Guide to Building Permits",
        },
        {
          question: "Why does the fee estimator page say the plan review minimum is $120?",
          answer:
            "The City's Building Permit Fee Estimator page prints '$120 or $1 per $1,000 of work', while the published fee schedule and the permit guide both state a $60.00 minimum. The schedule's $60 minimum is the figure charged; the $120 sentence is recorded as a conflict between the City's own pages.",
          sourceId: "nola-estimator",
          attribution: "City of New Orleans Building Permit Fee Estimator",
        },
        {
          question: "How long is a New Orleans building permit valid?",
          answer:
            "Permits run with the codes adopted by the City; an issued permit must be posted visibly on site. Work beginning before the permit issues triggers the 200% penalty, so timing matters more than duration.",
          sourceId: "nola-building-guide",
          attribution: "City of New Orleans Guide to Building Permits",
        },
      ],
      seoTitle: "New Orleans LA Building Permit Cost (Fee Schedule & Historic Surcharge)",
      seoDescription:
        "New Orleans building permit fees: $60 + $5 per $1,000 of construction value, plan review $1/$1,000 (min $60), 50% HDLC/Vieux Carré surcharge, demolition $95+.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: NOLA_LAST_VERIFIED,
    },
    {
      jurisdictionKey: NOLA_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      slug: "electrical-permit-cost",
      title: "New Orleans Electrical Permit Cost",
      intro:
        "A New Orleans electrical permit is priced from three factors the Department of Safety & Permits names itself — **service amperage, new service connections, and the number of circuits**: **$40 application fee + $3 per new circuit + $0.30 per ampere** of service. Construction loops add **$40 each**, elevator and lift installations **$60 each**, and signs **$40 each**. Only a contractor with a Class 'A' Electrical License from the City may obtain the permit.",
      localSummary:
        "Electrical permits are issued through the One Stop portal by the Electrical Inspections Division. The permit replaces the amperage-based schedules most cities publish with a straight rate per ampere of service — 30 cents — which makes a 200-amp service carry $60 of the fee before any circuit is counted. A building permit may also be required for some electrical work. Permits lapse after six months of inactivity and must be reapplied for.",
      notIncluded:
        "This estimate covers the City of New Orleans electrical permit fees only. It excludes:\n\n- **Building permits** where the electrical work is part of a larger project.\n- **Entergy New Orleans** service, meter and connection charges.\n- **Sign permits** issued separately by Safety & Permits (the $40 here is the electrical sign circuit fee).\n- **Elevator inspection certificates** and state licensing fees.\n- **Low-voltage and communications wiring**, regulated separately.",
      workedExample: {
        scenario:
          "A commercial interior fit-out in New Orleans adding 12 new circuits on a 200-ampere service.",
        inputs: {
          occupancy: "commercial",
          workType: "alteration",
          custom: { amperage: 200, circuits: 12 },
        },
        notes:
          "Application: **$40.00**. Circuits: 12 × $3.00 = **$36.00**. Service amperage: 200 × $0.30 = **$60.00**. Total: **$136.00**.",
      },
      faqs: [
        {
          question: "How is a New Orleans electrical permit fee calculated?",
          answer:
            "$40 application fee plus $3 per new circuit plus $0.30 per service ampere. A job adding 12 circuits on a 200-amp service pays $40 + $36 + $60 = $136.00.",
          sourceId: NOLA_ELECTRICAL_SOURCE_KEY,
          attribution: "City of New Orleans Electrical Permit page",
        },
        {
          question: "Who can pull an electrical permit in New Orleans?",
          answer:
            "Only an electrical contractor holding a Class 'A' Electrical License from the City of New Orleans. Homeowners cannot self-permit electrical work.",
          sourceId: NOLA_ELECTRICAL_SOURCE_KEY,
          attribution: "City of New Orleans Electrical Permit page",
        },
        {
          question: "What counts as a new circuit for the $3 fee?",
          answer:
            "The fee is charged per new circuit the permit installs. The Department bases fees on service amperage, new service connections and the number of circuits, as its own fee statement reads.",
          sourceId: NOLA_ELECTRICAL_SOURCE_KEY,
          attribution: "City of New Orleans Electrical Permit page",
        },
        {
          question: "How is the amperage charge computed?",
          answer:
            "At $0.30 per ampere of the service. A 200-amp residential service carries $60.00; a 400-amp commercial service $120.00 — charged on the service the permit covers.",
          sourceId: NOLA_ELECTRICAL_SOURCE_KEY,
          attribution: "City of New Orleans Electrical Permit page",
        },
        {
          question: "How much is a construction loop permit?",
          answer:
            "$40 per construction loop — the temporary wiring arrangement used on sites where power must loop through unfinished spaces.",
          sourceId: NOLA_ELECTRICAL_SOURCE_KEY,
          attribution: "City of New Orleans Electrical Permit page",
        },
        {
          question: "Do elevators and signs carry their own electrical fees?",
          answer:
            "Yes: $60 per elevator, moving stair, dumbwaiter or man lift installation or modification, and $40 per sign, indoors or outdoors.",
          sourceId: NOLA_ELECTRICAL_SOURCE_KEY,
          attribution: "City of New Orleans Electrical Permit page",
        },
        {
          question: "How long does an electrical permit last in New Orleans?",
          answer:
            "Six months of inactivity. After six months without activity, the contractor must reapply for the permit.",
          sourceId: NOLA_ELECTRICAL_SOURCE_KEY,
          attribution: "City of New Orleans Electrical Permit page",
        },
      ],
      seoTitle: "New Orleans LA Electrical Permit Cost & Requirements",
      seoDescription:
        "New Orleans electrical permit fees: $40 application + $3 per new circuit + $0.30 per service ampere. Class 'A' license required. Full fee breakdown.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: NOLA_LAST_VERIFIED,
    },
    {
      jurisdictionKey: NOLA_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      slug: "plumbing-permit-cost",
      title: "New Orleans Plumbing Permit Cost (Sewerage & Water Board)",
      intro:
        "New Orleans plumbing permits are not the City's. The **Sewerage & Water Board of New Orleans** — a separate political corporation that owns the water and sewer mains — permits and inspects all plumbing under its own **S&WB Plumbing Code**. A **Licensed Master Plumber registered with the Board** files through the City's One Stop portal, where the published fee line item is the **$50.00 SWB filing fee**. The Board publishes no complete public schedule of its inspection fees, so no further amount is stated here.",
      localSummary:
        "The Board's Plumbing Department, at 625 St. Joseph Street, inspects all new plumbing work and any portion of an existing system the new work touches. Work covered before inspection must be uncovered — and non-compliance can end in water-service interruption, the Board's own enforcement lever. Property owners are responsible for hiring the master plumber; whoever violates the Board's rules faces fines up to $1,000 or thirty days per offense. The Board also requires its own permit on demolition projects, where sewer and water services must be excavated, capped and inspected within five feet of the property line.",
      notIncluded:
        "This estimate covers the one published Sewerage & Water Board fee — the $50 filing fee. It excludes:\n\n- **The Board's inspection and reinspection fees**, which appear on permit records but are not published as a schedule.\n- **Water and sewer tap, meter and connection charges** for new or upsized services.\n- **The City's building, electrical and mechanical permits** for the same project.\n- **Backflow device registration and testing** through the Board's Environmental Affairs Department.\n- **Louisiana State Plumbing Board** licensing fees.",
      workedExample: {
        scenario:
          "A bathroom remodel in a New Orleans shotgun double, filed by an SWBNO-registered master plumber through the One Stop portal.",
        inputs: {
          valuationCents: 1_200_000,
          occupancy: "residential",
          workType: "alteration",
          fixtures: 4,
        },
        notes:
          "SWB filing fee (the one published amount): **$50.00**. Total from published figures: **$50.00**. The Board's inspection fees ride the same permit but are not published as a schedule — the page states this rather than estimating them.",
      },
      faqs: [
        {
          question: "Who issues plumbing permits in New Orleans?",
          answer:
            "The Sewerage & Water Board of New Orleans — not City Hall. The Board's Plumbing Department permits and inspects all plumbing connected to the public sewers and water mains under the S&WB Plumbing Code, though the permit itself is filed through the City's One Stop portal.",
          sourceId: NOLA_PLUMBING_SOURCE_KEY,
          attribution: "Sewerage & Water Board of New Orleans, Plumbing Information",
        },
        {
          question: "How much does a plumbing permit cost in New Orleans?",
          answer:
            "The published line item is the $50.00 SWB filing fee, shown on One Stop permit records. The Board does not publish a complete schedule of its inspection fees, so the total for a specific job is set by the Board at filing.",
          sourceId: "nola-onestop-records",
          attribution: "City of New Orleans One Stop App permit records",
        },
        {
          question: "Who can file a plumbing permit with the SWBNO?",
          answer:
            "A Licensed Master Plumber registered with the Sewerage & Water Board must file. Property owners hire the plumber; the Board keeps a searchable list of licensed plumbers in Orleans Parish.",
          sourceId: NOLA_PLUMBING_SOURCE_KEY,
          attribution: "Sewerage & Water Board of New Orleans, Plumbing Information",
        },
        {
          question: "Does replacing a water heater need an SWBNO permit?",
          answer:
            "Any addition or alteration to water piping connected to the Board's mains requires a permit first issued by the Board's Plumbing Department — and fixtures reset to existing systems are covered by the same rule.",
          sourceId: NOLA_PLUMBING_SOURCE_KEY,
          attribution: "Sewerage & Water Board of New Orleans, Plumbing Information",
        },
        {
          question: "What happens if plumbing work is covered before inspection?",
          answer:
            "It must be uncovered for inspection. The Board's code requires inspection and approval before covering, and failure to comply can result in water service interruption.",
          sourceId: NOLA_PLUMBING_SOURCE_KEY,
          attribution: "Sewerage & Water Board of New Orleans, Plumbing Information",
        },
        {
          question: "Do demolition projects need a plumbing permit from the Board?",
          answer:
            "Yes. Underground sewer mains and water service supply mains must be excavated and properly capped inside the property line (within five feet), and the Board's Plumbing Department inspects the capped services before they are covered.",
          sourceId: NOLA_PLUMBING_SOURCE_KEY,
          attribution: "Sewerage & Water Board of New Orleans, Plumbing Information",
        },
        {
          question: "What is the penalty for unpermitted plumbing in New Orleans?",
          answer:
            "Whoever violates the Board's rules faces a fine of up to $1,000 per offense, imprisonment up to thirty days, or both — and the Board can interrupt water service for non-compliant work.",
          sourceId: NOLA_PLUMBING_SOURCE_KEY,
          attribution: "Sewerage & Water Board of New Orleans, Plumbing Information",
        },
        {
          question: "Does the City charge anything for plumbing work?",
          answer:
            "The City's guide is explicit that plumbing permit fees go to the Sewerage & Water Board; the City's Safety & Permits charges for building, electrical and mechanical permits, not plumbing. On irrigation meters the Board collects a fee equal to 20% of the permit cost, a separate program.",
          sourceId: "nola-building-guide",
          attribution: "City of New Orleans Guide to Building Permits",
        },
      ],
      seoTitle: "New Orleans LA Plumbing Permit Cost (Sewerage & Water Board)",
      seoDescription:
        "New Orleans plumbing permits come from the Sewerage & Water Board, not the City: $50 filing fee via One Stop, filed by an SWBNO-registered master plumber.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: NOLA_LAST_VERIFIED,
    },
  ],

  verifications: [
    {
      entityType: "jurisdiction_profile",
      entityKey: NOLA_KEYS.jurisdiction,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: NOLA_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Louisiana Expansion",
      sourceKey: NOLA_BUILDING_SOURCE_KEY,
      notes:
        "Verified against the City's fee-schedule PDF, guide, estimator and electrical pages, and the SWBNO Plumbing Information page.",
    },
    {
      entityType: "fee_schedule",
      entityKey: "nola-building-schedule",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: NOLA_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Louisiana Expansion",
      sourceKey: NOLA_BUILDING_SOURCE_KEY,
      notes:
        "Verified the $60 + $5/$1,000 permit, $1/$1,000 plan review with $60 minimum, 50% historic surcharge and $95 demolition base. The estimator's $120 plan-review sentence recorded as a conflict.",
    },
    {
      entityType: "fee_schedule",
      entityKey: "nola-electrical-schedule",
      status: "verified",
      method: "official_portal_check",
      verifiedAt: NOLA_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Louisiana Expansion",
      sourceKey: NOLA_ELECTRICAL_SOURCE_KEY,
      notes: "Verified the $40 + $3/circuit + $0.30/ampere structure and flat rows.",
    },
    {
      entityType: "fee_schedule",
      entityKey: "nola-plumbing-schedule",
      status: "needs_review",
      method: "official_portal_check",
      verifiedAt: NOLA_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Louisiana Expansion",
      sourceKey: NOLA_PLUMBING_SOURCE_KEY,
      notes:
        "Only the $50 filing fee is published (via One Stop records). The Board's remaining inspection fees are unpublished; the page states the gap rather than modelling guesses.",
    },
    {
      entityType: "permit_page",
      entityKey: "building-permit-cost",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: NOLA_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Louisiana Expansion",
      sourceKey: NOLA_BUILDING_SOURCE_KEY,
      notes: "Passed editorial gate checks for New Orleans building permit page.",
    },
    {
      entityType: "permit_page",
      entityKey: "electrical-permit-cost",
      permitTypeKey: "electrical",
      status: "verified",
      method: "official_portal_check",
      verifiedAt: NOLA_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Louisiana Expansion",
      sourceKey: NOLA_ELECTRICAL_SOURCE_KEY,
      notes: "Passed editorial gate checks for New Orleans electrical permit page.",
    },
    {
      entityType: "permit_page",
      entityKey: "plumbing-permit-cost",
      permitTypeKey: "plumbing",
      status: "verified",
      method: "official_portal_check",
      verifiedAt: NOLA_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Louisiana Expansion",
      sourceKey: NOLA_PLUMBING_SOURCE_KEY,
      notes: "Passed editorial gate checks for New Orleans plumbing (SWBNO) permit page.",
    },
  ],
};
