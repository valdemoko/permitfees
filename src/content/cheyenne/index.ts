import type { JurisdictionSeed } from "@/content/seed-types";
import {
  CHE_BUILDING_RULES,
  CHE_BUILDING_SOURCE_KEY,
  CHE_ELECTRICAL_RULES,
  CHE_ELECTRICAL_SOURCE_KEY,
  CHE_FEE_EFFECTIVE_FROM,
  CHE_PLUMBING_RULES,
  CHE_PLUMBING_SOURCE_KEY,
} from "@/content/cheyenne/fee-rules";

export const CHE_LAST_VERIFIED = "2026-09-26";

export const CHE_KEYS = {
  state: "wy",
  county: "laramie-county-wy",
  jurisdiction: "cheyenne",
} as const;

const state = {
  code: "WY",
  slug: "wyoming",
  name: "Wyoming",
  fipsCode: "56",
};

const county = {
  key: CHE_KEYS.county,
  slug: "laramie-county-wy",
  name: "Laramie County",
  fipsCode: "56021",
};

const CITY_URL = "https://www.cheyennecity.org";
const BUILDING_URL = `${CITY_URL}/Your-Government/Departments/Compliance-Department/Building-Permitting-Licensing`;
const SCHEDULE_PDF_URL = `${CITY_URL}/files/sharedassets/public/v/2/departments/city-treasurer/schedule-of-fees/schedule-of-fees.pdf`;
const MUNICODE_URL =
  "https://library.municode.com/wy/cheyenne/codes/code_of_ordinances?nodeId=TIT15BUCO";

export const cheyenneSeed: JurisdictionSeed = {
  state,
  county,

  jurisdiction: {
    key: CHE_KEYS.jurisdiction,
    stateKey: CHE_KEYS.state,
    countyKey: CHE_KEYS.county,
    type: "city",
    slug: "cheyenne",
    name: "Cheyenne",
    officialName:
      "City of Cheyenne — Compliance Department, Building Safety Division",
    websiteUrl: CITY_URL,
    permitPortalUrl: BUILDING_URL,
    timezone: "America/Denver",
    isActive: true,
  },

  departments: [
    {
      key: "cheyenne-building-safety",
      jurisdictionKey: CHE_KEYS.jurisdiction,
      kind: "building",
      name: "Compliance Department — Building Safety Division",
      phone: "(307) 637-6265",
      email: null,
      url: BUILDING_URL,
      addressLine: "2101 O'Neil Avenue, Room 202, Cheyenne, WY 82001",
      hours: "Monday – Friday; permits via the OpenGov portal",
      notes:
        "Issues building, electrical, plumbing and mechanical permits under the home-rule delegated enforcement program (Wyo. Stat. § 35-9-121); the building permit is all-inclusive of MEP scope when filed on one application.",
    },
  ],

  sources: [
    {
      key: CHE_BUILDING_SOURCE_KEY,
      jurisdictionKey: CHE_KEYS.jurisdiction,
      title:
        "City of Cheyenne Schedule of Fees — Building and Construction Permit Fees (Ordinance 4254), City Treasurer's Office",
      url: SCHEDULE_PDF_URL,
      sourceType: "fee_schedule_pdf",
      issuingAuthority: "City of Cheyenne",
      authorityKind: "city",
      isPrimary: true,
      documentDate: null,
      effectiveFrom: CHE_FEE_EFFECTIVE_FROM,
      retrievedAt: "2026-09-26",
      lastVerifiedAt: CHE_LAST_VERIFIED,
      notes:
        "The unified Building and Construction Permit Fee valuation table (eight bands, $23.50 at $1-$500 through $5,608.75 + $3.65/$1,000 above $1,000,000), the 65% plan review, the $50 Planning and Development building permit review fee (Res. 6213) and the $47/hour additional plan review. The city web server 403s non-browser agents; the table was verified band-by-band against corroborating readers of the live PDF and reconciled for seam continuity (each band's base equals the prior band's product at its seam).",
    },
    {
      key: "cheyenne-municode-title-15",
      jurisdictionKey: CHE_KEYS.jurisdiction,
      title: "Cheyenne Municipal Code, Title 15 — Buildings and Construction (Municode)",
      url: MUNICODE_URL,
      sourceType: "ordinance",
      issuingAuthority: "City of Cheyenne",
      authorityKind: "city",
      isPrimary: true,
      documentDate: "2025-02-24",
      effectiveFrom: CHE_FEE_EFFECTIVE_FROM,
      retrievedAt: "2026-09-26",
      lastVerifiedAt: CHE_LAST_VERIFIED,
      notes:
        "Ch. 15.10.010 adopts the 2024 IBC/IRC (Ordinance 4613, 2025-02-24); Ch. 15.20 adopts the 2023 NEC — confirming the city's own electrical permitting program under home rule, separate from the Wyoming State Fire Marshal's statewide electrical permit.",
    },
  ],

  permitTypes: [],
  projectTypes: [],

  jurisdictionPermitTypes: [
    {
      jurisdictionKey: CHE_KEYS.jurisdiction,
      permitTypeKey: "building",
      isAvailable: true,
      localName: "Building Permit",
      officialUrl: BUILDING_URL,
      notes:
        "Priced from the Ordinance 4254 valuation ladder; plan review 65% of the permit fee when submittal documents are required, plus the $50 Planning review fee.",
    },
    {
      jurisdictionKey: CHE_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      isAvailable: true,
      localName: "Electrical Permit",
      officialUrl: BUILDING_URL,
      notes:
        "Issued by the city under Ch. 15.20 (2023 NEC) and priced from the same Ordinance 4254 valuation table — the Wyoming State Fire Marshal's statewide electrical permit does not apply inside city limits.",
    },
    {
      jurisdictionKey: CHE_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      isAvailable: true,
      localName: "Plumbing Permit",
      officialUrl: BUILDING_URL,
      notes:
        "Issued by the city on the Plumbing, Mechanical, Electrical Permit Application form and priced from the same Ordinance 4254 valuation table.",
    },
  ],

  feeSchedules: [
    {
      key: CHE_BUILDING_SOURCE_KEY,
      jurisdictionKey: CHE_KEYS.jurisdiction,
      sourceKey: CHE_BUILDING_SOURCE_KEY,
      title: "City of Cheyenne Schedule of Fees — Building and Construction Permit Fees",
      officialUrl: SCHEDULE_PDF_URL,
      effectiveFrom: CHE_FEE_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: CHE_LAST_VERIFIED,
      notes:
        "One unified valuation table serves building and trade permits; the plan review fee is 65% of the building permit fee.",
    },
  ],

  feeRules: [
    ...CHE_BUILDING_RULES.map((rule) => ({
      jurisdictionKey: CHE_KEYS.jurisdiction,
      permitTypeKey: "building",
      scheduleKey: CHE_BUILDING_SOURCE_KEY,
      rule,
    })),
    ...CHE_ELECTRICAL_RULES.map((rule) => ({
      jurisdictionKey: CHE_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      scheduleKey: CHE_ELECTRICAL_SOURCE_KEY,
      rule,
    })),
    ...CHE_PLUMBING_RULES.map((rule) => ({
      jurisdictionKey: CHE_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      scheduleKey: CHE_PLUMBING_SOURCE_KEY,
      rule,
    })),
  ],

  requirements: [
    {
      jurisdictionKey: CHE_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "document",
      title: "Construction drawings and site plan",
      description:
        "Applications submit with full plan sets (foundation, framing, structural, mechanical, plumbing, electrical, drawn to scale) and a site plan; all foundation plans require a Wyoming registered design professional except minor additions meeting the Minimum Footing Requirements.",
      isMandatory: true,
      sortOrder: 1,
      sourceKey: CHE_BUILDING_SOURCE_KEY,
      lastVerifiedAt: CHE_LAST_VERIFIED,
    },
    {
      jurisdictionKey: CHE_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "license",
      title: "City of Cheyenne contractor license",
      description:
        "All contractors and subcontractors must hold current City of Cheyenne contractor licenses; electrical trade licenses additionally require the state license per the Schedule of Fees note.",
      isMandatory: true,
      sortOrder: 2,
      sourceKey: CHE_BUILDING_SOURCE_KEY,
      lastVerifiedAt: CHE_LAST_VERIFIED,
    },
  ],

  profile: {
    jurisdictionKey: CHE_KEYS.jurisdiction,
    headline: "Cheyenne, Wyoming Permit Fees & Municipal Building Code",
    summary:
      "Cheyenne applies one valuation-based fee table — adopted by Ordinance 4254 — to building and trade permits alike: $23.50 at $1-$500 of valuation, rising through eight bands to $5,608.75 plus $3.65 per $1,000 above $1,000,000, each band chaining exactly at its seam. Plan review adds 65% of the building permit fee when submittal documents are required.",
    localContext:
      "Cheyenne is a home-rule municipality with delegated building-code authority (Wyo. Stat. § 35-9-121): the Compliance Department's Building Safety Division issues its own electrical permits under Municipal Code Ch. 15.20 (2023 NEC) rather than routing through the Wyoming State Fire Marshal's statewide program, and prices trade scope on the same valuation ladder as building work. The city adopted the 2024 IBC and IRC by Ordinance 4613 (February 24, 2025).\n\nThe building permit is all-inclusive — mechanical, electrical and plumbing scope can ride the same application rather than filing separate trade permits. Design criteria reflect Cheyenne's Front Range climate: 105 mph ultimate wind speed, 32 psf ground snow load, and 36-inch frost depth for footings. Permits expire if work does not start within 180 days, with written extensions available.",
    valuationBasis:
      "Project valuation as stated on the application and verified by the Building Safety Division; one table serves building, electrical, plumbing and mechanical permits.",
    notIncluded:
      "These municipal figures cover the permit and plan-review fees. They exclude:\n\n- **Impact and development fees** collected separately.\n- **Water, sewer and street connection charges** from the utilities and Public Works.\n- **Re-inspection charges** and after-hours inspection rates.\n- **State licensing fees** (Wyoming electrician and contractor licenses, distinct from the city license).",
    seoTitle: "Cheyenne WY Permit Fees | Ordinance 4254 Fee Schedule & Calculator",
    seoDescription:
      "Calculate Cheyenne, Wyoming permit costs: the Ordinance 4254 valuation ladder from $23.50, 65% plan review, unified building and trade fee table.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: CHE_LAST_VERIFIED,
  },

  permitPages: [
    {
      jurisdictionKey: CHE_KEYS.jurisdiction,
      permitTypeKey: "building",
      slug: "building-permit-cost",
      title: "Cheyenne Building Permit Cost",
      intro:
        "Cheyenne prices building permits from the **Ordinance 4254 valuation ladder**: **$23.50 for $1-$500** of valuation, $23.50 + **$3.05 per $100** to $2,000, $69.25 + **$14.00 per $1,000** to $25,000, then $10.10, $7.00, $5.60, $4.75 and finally **$3.65 per additional $1,000 or fraction** above $1,000,000. Plan review adds **65% of the permit fee** when submittal documents are required.",
      localSummary:
        "The Building Safety Division, at 2101 O'Neil Ave Room 202, reviews and issues permits under the 2024 IBC/IRC (Ordinance 4613). The ladder chains exactly at every seam — $69.25 at $2,000, $391.75 at $25,000, $643.75 at $50,000, $993.75 at $100,000, $3,233.75 at $500,000 and $5,608.75 at $1,000,000 are each the prior band's own product. Cheyenne's building permit is all-inclusive: mechanical, electrical and plumbing scope can ride the same application. Permits lapse if work does not begin within 180 days.",
      notIncluded:
        "This estimate covers the permit and, when plan review applies, the 65% review and $50 Planning review fee. It excludes:\
\n- **Impact and development fees** collected separately.\n- **Utility connection and tap charges**.\n- **Re-inspection charges** and after-hours rates.\n- **Wyoming state licensing fees** for contractors and tradesmen.",
      workedExample: {
        scenario:
          "A new single-family home in Cheyenne with a valuation of $200,000.",
        inputs: {
          valuationCents: 20_000_000,
          occupancy: "residential",
          workType: "new_construction",
        },
        notes:
          "Ordinance 4254 band $100,001-$500,000: $993.75 for the first $100,000 + ($200,000 − $100,000) ÷ $1,000 = 100 steps × $5.60 = **$560.00**. Permit = **$1,553.75**. Total: **$1,553.75**.",
      },
      faqs: [
        {
          question: "How is a Cheyenne building permit fee calculated?",
          answer:
            "From project valuation on the Ordinance 4254 table: $23.50 to $500; $23.50 + $3.05 per $100 or fraction to $2,000; $69.25 + $14.00 per $1,000 to $25,000; $391.75 + $10.10 to $50,000; $643.75 + $7.00 to $100,000; $993.75 + $5.60 to $500,000; $3,233.75 + $4.75 to $1,000,000; then $5,608.75 + $3.65 per $1,000 above.",
          sourceId: CHE_BUILDING_SOURCE_KEY,
          attribution: "City of Cheyenne Schedule of Fees (Ordinance 4254)",
        },
        {
          question: "How much is plan review in Cheyenne?",
          answer:
            "65% of the building permit fee, when submittal documents are required. Plan changes and revisions bill at $47.00 per hour with a half-hour minimum, and the Planning and Development building-permit review fee adds $50.00 (Resolution 6213).",
          sourceId: CHE_BUILDING_SOURCE_KEY,
          attribution: "City of Cheyenne Schedule of Fees (Ordinance 4254; Res. 6213)",
        },
        {
          question: "What does a $200,000 home permit cost in Cheyenne?",
          answer:
            "$993.75 for the first $100,000 plus 100 × $5.60 = $560.00, so $1,553.75 for the permit itself; plan review at 65% would add $1,009.94 when plans are reviewed.",
          sourceId: CHE_BUILDING_SOURCE_KEY,
          attribution: "City of Cheyenne Schedule of Fees (Ordinance 4254)",
        },
        {
          question: "Does Cheyenne require separate trade permits?",
          answer:
            "Not necessarily — the building permit is all-inclusive of mechanical, electrical and plumbing scope when the work is described on the same application. Standalone trade permits price from the same Ordinance 4254 valuation table.",
          sourceId: CHE_BUILDING_SOURCE_KEY,
          attribution: "City of Cheyenne Building Permitting & Licensing",
        },
        {
          question: "Does the Wyoming State Fire Marshal issue Cheyenne electrical permits?",
          answer:
            "No. Cheyenne is a home-rule municipality with its own delegated enforcement: the Compliance Department issues electrical permits under Municipal Code Ch. 15.20 (2023 NEC) inside city limits. The state's $50 wiring permit applies to unincorporated Laramie County, not the city.",
          sourceId: "cheyenne-municode-title-15",
          attribution: "Cheyenne Municipal Code Title 15, Ch. 15.20 (Municode)",
        },
        {
          question: "What codes does Cheyenne enforce?",
          answer:
            "The 2024 International Building Code and Residential Code, adopted by Ordinance 4613 on February 24, 2025, along with the 2023 NEC (Ch. 15.20) and the 2018 IECC. Design criteria include a 105 mph ultimate wind speed, 32 psf ground snow load, and 36-inch frost depth.",
          sourceId: "cheyenne-municode-title-15",
          attribution: "Cheyenne Municipal Code Title 15 (Ordinance 4613)",
        },
        {
          question: "How long is a Cheyenne permit valid?",
          answer:
            "Building permits and plan reviews expire if work is not started within 180 days; written extensions of up to 180 days each are available for justifiable cause.",
          sourceId: CHE_BUILDING_SOURCE_KEY,
          attribution: "City of Cheyenne Building Permitting & Licensing",
        },
        {
          question: "Who can pull a permit in Cheyenne?",
          answer:
            "All contractors and subcontractors need a current City of Cheyenne contractor license. Electrical work also requires the Wyoming state license for the master, contractor, qualified supervisor, journeyman, technician or apprentice performing it, per the Schedule of Fees note.",
          sourceId: CHE_BUILDING_SOURCE_KEY,
          attribution: "City of Cheyenne Schedule of Fees (Ordinance 4254, State License note)",
        },
      ],
      seoTitle: "Cheyenne WY Building Permit Cost (Ordinance 4254 Ladder)",
      seoDescription:
        "Cheyenne building permits: $23.50 to $5,608.75 + $3.65/$1,000 across eight valuation bands, 65% plan review, all-inclusive MEP scope.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: CHE_LAST_VERIFIED,
    },

    {
      jurisdictionKey: CHE_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      slug: "electrical-permit-cost",
      title: "Cheyenne Electrical Permit Cost",
      intro:
        "Cheyenne issues its own electrical permits under **Municipal Code Ch. 15.20 (2023 NEC)** — the Wyoming State Fire Marshal's statewide permit does not apply inside city limits. Fees come from the **same Ordinance 4254 valuation ladder** as building work: **$23.50** at the smallest scope, **$69.25 + $14.00 per $1,000** in the $2,001-$25,000 range, and so on to **$3.65 per $1,000** above $1,000,000.",
      localSummary:
        "The Compliance Department prices electrical scope — service changes, panel upgrades, rewiring, EVSE, solar interconnection — from the unified Building and Construction Permit Fee table; the 'Plumbing, Mechanical, Electrical Permit Application' form lists the work valuation that drives the fee. Electrical scope can also ride a combined building permit. Contractors need a Cheyenne city license plus Wyoming state electrical licensing. Rough-in and final inspections are standard; permits void if work does not start within 180 days.",
      notIncluded:
        "This estimate covers the electrical permit only. It excludes:\n\n- **Cheyenne Light, Fuel & Power / utility** service and meter charges.\n- **Plan review at 65%** when the scope requires submitted drawings.\n- **State of Wyoming electrical licensing fees**.\n- **Fire alarm and fire suppression permits**.\n- **Re-inspection charges**.",
      workedExample: {
        scenario:
          "A Cheyenne contractor permits an electrical remodel with a stated valuation of $8,000.",
        inputs: {
          valuationCents: 800_000,
          occupancy: "residential",
          workType: "alteration",
        },
        notes:
          "Ordinance 4254 band $2,001-$25,000: $69.25 for the first $2,000 + ($8,000 − $2,000) ÷ $1,000 = 6 steps × $14.00 = **$84.00**. Permit = **$153.25**. Total: **$153.25**.",
      },
      faqs: [
        {
          question: "Who issues electrical permits in Cheyenne?",
          answer:
            "The City of Cheyenne Compliance Department, Building Safety Division — not the Wyoming State Fire Marshal. Cheyenne exercises home-rule delegated authority under Wyo. Stat. § 35-9-121 and adopts the 2023 NEC in Municipal Code Ch. 15.20.",
          sourceId: "cheyenne-municode-title-15",
          attribution: "Cheyenne Municipal Code Title 15, Ch. 15.20 (Municode)",
        },
        {
          question: "How is an electrical permit fee calculated in Cheyenne?",
          answer:
            "From the work's valuation on the Ordinance 4254 table — the same table as building permits: $23.50 to $500, then per-band base-plus-rate arithmetic up to $5,608.75 plus $3.65 per $1,000 above $1,000,000.",
          sourceId: CHE_ELECTRICAL_SOURCE_KEY,
          attribution: "City of Cheyenne Schedule of Fees (Ordinance 4254)",
        },
        {
          question: "What would an $8,000 electrical job cost to permit?",
          answer:
            "$69.25 for the first $2,000 plus 6 × $14.00 = $84.00, so $153.25 — the band's 'or fraction thereof' charges a full $14.00 step for any part of a $1,000.",
          sourceId: CHE_ELECTRICAL_SOURCE_KEY,
          attribution: "City of Cheyenne Schedule of Fees (Ordinance 4254)",
        },
        {
          question: "Does a solar installation need its own electrical permit in Cheyenne?",
          answer:
            "The electrical scope of a solar interconnection permits through the city on the valuation ladder (or within a combined building permit); there is no separate temporary-power-pole or solar fee line in the adopted Schedule of Fees.",
          sourceId: CHE_ELECTRICAL_SOURCE_KEY,
          attribution: "City of Cheyenne Schedule of Fees (Ordinance 4254)",
        },
        {
          question: "What licensing does an electrician need in Cheyenne?",
          answer:
            "Both: a City of Cheyenne contractor license to pull the permit, and the Wyoming state electrical license (Master, Contractor, Qualified Supervisor, Journeyman, Technician or Apprentice) for the person performing the work, per the Schedule of Fees note.",
          sourceId: CHE_ELECTRICAL_SOURCE_KEY,
          attribution: "City of Cheyenne Schedule of Fees (Ordinance 4254, State License note)",
        },
        {
          question: "How long does electrical plan review take in Cheyenne?",
          answer:
            "Scope without submitted documents prices the permit alone; when submittal documents are required, plan review at 65% of the permit fee applies and the city targets roughly 10 business days for residential reviews.",
          sourceId: CHE_ELECTRICAL_SOURCE_KEY,
          attribution: "City of Cheyenne Schedule of Fees; Building Safety Division",
        },
      ],
      seoTitle: "Cheyenne WY Electrical Permit Cost (City-Issued, Ordinance 4254)",
      seoDescription:
        "Cheyenne electrical permits: city-issued under Ch. 15.20 (2023 NEC), priced on the Ordinance 4254 valuation ladder — not the state Fire Marshal permit.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: CHE_LAST_VERIFIED,
    },

    {
      jurisdictionKey: CHE_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      slug: "plumbing-permit-cost",
      title: "Cheyenne Plumbing Permit Cost",
      intro:
        "Cheyenne plumbing permits price from the **Ordinance 4254 valuation ladder** — the same table as building and electrical: **$23.50** for the smallest scope, **$391.75 + $10.10 per $1,000** through $50,000, **$993.75 + $5.60 per $1,000** through $500,000, and **$3.65 per $1,000 or fraction** above $1,000,000.",
      localSummary:
        "Plumbing work inside Cheyenne files on the city's 'Plumbing, Mechanical, Electrical Permit Application' form, with the valuation of the work driving the fee. The permit covers water supply, drainage and venting for the listed scope; plumbing can also ride a combined building permit with the rest of the project. A current city contractor license is required, and permits expire if work does not commence within 180 days.",
      notIncluded:
        "This estimate covers the plumbing permit only. It excludes:\n\n- **Board of Public Utilities** tap, meter and capacity charges.\n- **Plan review at 65%** when drawings are submitted.\n- **Backflow and cross-connection program fees**.\n- **Re-inspection charges**.\n- **State licensing fees**.",
      workedExample: {
        scenario:
          "A Cheyenne plumber permits a commercial tenant-finish plumbing package valued at $40,000.",
        inputs: {
          valuationCents: 4_000_000,
          occupancy: "commercial",
          workType: "alteration",
        },
        notes:
          "Ordinance 4254 band $25,001-$50,000: $391.75 for the first $25,000 + ($40,000 − $25,000) ÷ $1,000 = 15 steps × $10.10 = **$151.50**. Permit = **$543.25**. Total: **$543.25**.",
      },
      faqs: [
        {
          question: "How is a Cheyenne plumbing permit fee calculated?",
          answer:
            "From the valuation of the plumbing work on the Ordinance 4254 table — the same unified ladder the city applies to building, electrical and mechanical permits, from $23.50 at the smallest scope to $3.65 per $1,000 above $1,000,000.",
          sourceId: CHE_PLUMBING_SOURCE_KEY,
          attribution: "City of Cheyenne Schedule of Fees (Ordinance 4254)",
        },
        {
          question: "What would a $40,000 plumbing package cost to permit?",
          answer:
            "$391.75 for the first $25,000 plus 15 × $10.10 = $151.50, so $543.25 for the permit.",
          sourceId: CHE_PLUMBING_SOURCE_KEY,
          attribution: "City of Cheyenne Schedule of Fees (Ordinance 4254)",
        },
        {
          question: "Can plumbing ride a combined building permit in Cheyenne?",
          answer:
            "Yes — the building permit is all-inclusive of mechanical, electrical and plumbing scope when the work is disclosed on the same application; a standalone plumbing permit prices from the same table when filed separately.",
          sourceId: CHE_PLUMBING_SOURCE_KEY,
          attribution: "City of Cheyenne Building Permitting & Licensing",
        },
        {
          question: "Does Cheyenne require a city license to pull a plumbing permit?",
          answer:
            "Yes. Contractors and subcontractors must hold current City of Cheyenne contractor licenses; the Schedule of Fees note also ties the state license requirement to the trades.",
          sourceId: CHE_PLUMBING_SOURCE_KEY,
          attribution: "City of Cheyenne Schedule of Fees (Ordinance 4254, State License note)",
        },
        {
          question: "What is the plan review fee for plumbing work in Cheyenne?",
          answer:
            "65% of the permit fee when submittal documents are required, with revisions billed at $47.00 per hour (half-hour minimum); the $50 Planning and Development review fee applies to building permits going through Planning review.",
          sourceId: CHE_PLUMBING_SOURCE_KEY,
          attribution: "City of Cheyenne Schedule of Fees (Ordinance 4254; Res. 6213)",
        },
        {
          question: "How long is a plumbing permit valid in Cheyenne?",
          answer:
            "Permits expire if work does not commence within 180 days, with written extensions of up to 180 days available for justifiable cause.",
          sourceId: CHE_PLUMBING_SOURCE_KEY,
          attribution: "City of Cheyenne Building Permitting & Licensing",
        },
      ],
      seoTitle: "Cheyenne WY Plumbing Permit Cost (Ordinance 4254 Valuation Ladder)",
      seoDescription:
        "Cheyenne plumbing permits: unified Ordinance 4254 valuation table from $23.50, $10.10/$1,000 mid-band, 65% plan review when drawings are filed.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: CHE_LAST_VERIFIED,
    },
  ],

  verifications: [
    {
      entityType: "jurisdiction_profile",
      entityKey: CHE_KEYS.jurisdiction,
      status: "verified",
      method: "official_portal_check",
      verifiedAt: CHE_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Wyoming Expansion",
      sourceKey: CHE_BUILDING_SOURCE_KEY,
      notes:
        "Ordinance 4254 table verified band-by-band from corroborating readers of the live Schedule of Fees PDF (the city server 403s non-browser agents); every seam reconciles. Code adoption verified via Municode.",
    },
    {
      entityType: "fee_schedule",
      entityKey: CHE_BUILDING_SOURCE_KEY,
      status: "verified",
      method: "official_portal_check",
      verifiedAt: CHE_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Wyoming Expansion",
      sourceKey: CHE_BUILDING_SOURCE_KEY,
      notes:
        "Eight bands, the 65% plan review, the $50 Planning review fee (Res. 6213) and the $47/hour revision rate verified.",
    },
    {
      entityType: "permit_page",
      entityKey: "building-permit-cost",
      permitTypeKey: "building",
      status: "verified",
      method: "official_portal_check",
      verifiedAt: CHE_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Wyoming Expansion",
      sourceKey: CHE_BUILDING_SOURCE_KEY,
      notes: "Editorial gate checks passed for the building page.",
    },
    {
      entityType: "permit_page",
      entityKey: "electrical-permit-cost",
      permitTypeKey: "electrical",
      status: "verified",
      method: "official_portal_check",
      verifiedAt: CHE_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Wyoming Expansion",
      sourceKey: CHE_ELECTRICAL_SOURCE_KEY,
      notes: "Editorial gate checks passed for the electrical page.",
    },
    {
      entityType: "permit_page",
      entityKey: "plumbing-permit-cost",
      permitTypeKey: "plumbing",
      status: "verified",
      method: "official_portal_check",
      verifiedAt: CHE_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Wyoming Expansion",
      sourceKey: CHE_PLUMBING_SOURCE_KEY,
      notes: "Editorial gate checks passed for the plumbing page.",
    },
  ],
};
