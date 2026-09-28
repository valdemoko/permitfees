import type { JurisdictionSeed } from "@/content/seed-types";
import {
  BOI_BUILDING_EFF,
  BOI_BUILDING_RULES,
  BOI_BUILDING_SOURCE_KEY,
  BOI_ELECTRICAL_EFF,
  BOI_ELECTRICAL_RULES,
  BOI_ELECTRICAL_SOURCE_KEY,
  BOI_MECHANICAL_EFF,
  BOI_MECHANICAL_RULES,
  BOI_MECHANICAL_SOURCE_KEY,
  BOI_PLUMBING_EFF,
  BOI_PLUMBING_RULES,
  BOI_PLUMBING_SOURCE_KEY,
} from "@/content/boise/fee-rules";

export const BOI_LAST_VERIFIED = "2026-09-26";

export const BOI_KEYS = {
  state: "id",
  county: "ada-county-id",
  jurisdiction: "boise",
} as const;

const state = {
  code: "ID",
  slug: "idaho",
  name: "Idaho",
  fipsCode: "16",
};

const county = {
  key: BOI_KEYS.county,
  slug: "ada-county-id",
  name: "Ada County",
  fipsCode: "16001",
};

const CITY_URL = "https://www.cityofboise.org";
const PDS_URL = `${CITY_URL}/departments/planning-and-development-services/`;
const BUILDING_URL = `${CITY_URL}/departments/planning-and-development-services/building/`;
const FEES_URL = `${CITY_URL}/departments/planning-and-development-services/fees/`;
const BLDG_PDF_URL = `${CITY_URL}/media/17652/final-boise-city-building-code-fee-schedule-10-1-23.pdf`;
const ELEC_PDF_URL = `${CITY_URL}/media/8322/final-electrical-code-fee-schedule-7-17-19.pdf`;
const PLUMB_PDF_URL = `${CITY_URL}/media/8324/final-plumbing-code-fee-schedule-10-1-21.pdf`;
const MECH_PDF_URL = `${CITY_URL}/media/8323/final-mechanical-code-and-fuel-gas-code-fee-schedule-10-1-21.pdf`;

function buildingPageFeeRuleCount(): number {
  return BOI_BUILDING_RULES.length;
}
void buildingPageFeeRuleCount;

export const boiseSeed: JurisdictionSeed = {
  state,
  county,

  jurisdiction: {
    key: BOI_KEYS.jurisdiction,
    stateKey: BOI_KEYS.state,
    countyKey: BOI_KEYS.county,
    type: "city",
    slug: "boise",
    name: "Boise",
    officialName:
      "City of Boise — Planning & Development Services, Building Division",
    websiteUrl: CITY_URL,
    permitPortalUrl: PDS_URL,
    timezone: "America/Boise",
    isActive: true,
  },

  departments: [
    {
      key: "boise-pds-building",
      jurisdictionKey: BOI_KEYS.jurisdiction,
      kind: "building",
      name: "Planning & Development Services — Building Division",
      phone: "(208) 608-7070",
      email: "permits@cityofboise.org",
      url: BUILDING_URL,
      addressLine: "150 North Capitol Blvd, Boise, ID 83702",
      hours: "Monday – Friday, 8:00 a.m. – 4:30 p.m. MT",
      notes:
        "Issues building, electrical, plumbing and mechanical permits under the four Boise City code fee schedules (building, electrical, plumbing, mechanical & fuel gas).",
    },
  ],

  sources: [
    {
      key: BOI_BUILDING_SOURCE_KEY,
      jurisdictionKey: BOI_KEYS.jurisdiction,
      title: "Boise City Building Code Fee Schedule (effective October 1, 2023)",
      url: BLDG_PDF_URL,
      sourceType: "fee_schedule_pdf",
      issuingAuthority: "City of Boise, Planning & Development Services",
      authorityKind: "city",
      isPrimary: true,
      documentDate: "2023-10-01",
      effectiveFrom: BOI_BUILDING_EFF,
      retrievedAt: "2026-09-26",
      lastVerifiedAt: BOI_LAST_VERIFIED,
      notes:
        "Table 1-A building permit fee schedule on total valuation (five bands, $26.37 first $500 + $2.95/$100 through $913.09 first $100,000 + $5.17/$1,000), commercial plan review 65% (item 8), residential 1-2 family plan review 20% (item 9), reinspection $55, solar PV $165 flat. Text-layer PDF read with pdftotext. The FY27 proposed redline (10-1-26) shows Table 1-A unchanged.",
    },
    {
      key: BOI_ELECTRICAL_SOURCE_KEY,
      jurisdictionKey: BOI_KEYS.jurisdiction,
      title: "Boise City Electrical Code Fee Schedule (current edition, 7-17-2019)",
      url: ELEC_PDF_URL,
      sourceType: "fee_schedule_pdf",
      issuingAuthority: "City of Boise, Planning & Development Services",
      authorityKind: "city",
      isPrimary: true,
      documentDate: "2019-07-17",
      effectiveFrom: BOI_ELECTRICAL_EFF,
      retrievedAt: "2026-09-26",
      lastVerifiedAt: BOI_LAST_VERIFIED,
      notes:
        "Tables 1-a (new residential per dwelling unit by square footage: $135/$155/$175/$210 + $65 per 1,000 over 4,501), 2-b (single branch circuit $55), 3-a (other residential flat rows $110/$165), 5-a (service equipment $55/$65/$40 temporary), 6-b (commercial $14 base + $22.83 + 2.28% over $100 / $84.32 + 1.14% over $2,000 / $197.18 + 0.57% over $10,000).",
    },
    {
      key: BOI_PLUMBING_SOURCE_KEY,
      jurisdictionKey: BOI_KEYS.jurisdiction,
      title: "Boise City Plumbing Code Fee Schedule (current edition, 10-1-2021)",
      url: PLUMB_PDF_URL,
      sourceType: "fee_schedule_pdf",
      issuingAuthority: "City of Boise, Planning & Development Services",
      authorityKind: "city",
      isPrimary: true,
      documentDate: "2021-10-01",
      effectiveFrom: BOI_PLUMBING_EFF,
      retrievedAt: "2026-09-26",
      lastVerifiedAt: BOI_LAST_VERIFIED,
      notes:
        "Tables B(1) (new SFD/duplex per dwelling unit $130-$325 + $65 per 1,000 over 4,501), B(1.a) (add-ons: 13D sprinkler $12, lawn sprinkler $44, sewer/water service $55), B(2) ($32 base + $12 per fixture), B(3) (misc $55-$110), C(1) (commercial $32 base + 2.28% / $11,410.88 + 1.71% / $19,969.04 + 1.14%).",
    },
    {
      key: BOI_MECHANICAL_SOURCE_KEY,
      jurisdictionKey: BOI_KEYS.jurisdiction,
      title:
        "Boise City Mechanical Code and Fuel Gas Code Fee Schedule (current edition, 10-1-2021)",
      url: MECH_PDF_URL,
      sourceType: "fee_schedule_pdf",
      issuingAuthority: "City of Boise, Planning & Development Services",
      authorityKind: "city",
      isPrimary: true,
      documentDate: "2021-10-01",
      effectiveFrom: BOI_MECHANICAL_EFF,
      retrievedAt: "2026-09-26",
      lastVerifiedAt: BOI_LAST_VERIFIED,
      notes:
        "Table B(1) (new SFD/duplex per dwelling unit, same ladder as plumbing), B(2) ($32 base + $12 per appliance/test/duct), B(3) (single fixture $55), C(1) (commercial value ladder $32 base + 2.28% / $11,400 + 1.71% / $19,950 + 1.14%).",
    },
  ],

  permitTypes: [],
  projectTypes: [],

  jurisdictionPermitTypes: [
    {
      jurisdictionKey: BOI_KEYS.jurisdiction,
      permitTypeKey: "building",
      isAvailable: true,
      localName: "Building Permit",
      officialUrl: BLDG_PDF_URL,
      notes:
        "Priced from total valuation on Table 1-A (five per-thousand bands); commercial plan review 65% and residential 1-2 family review 20% of the permit fee.",
    },
    {
      jurisdictionKey: BOI_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      isAvailable: true,
      localName: "Electrical Permit",
      officialUrl: ELEC_PDF_URL,
      notes:
        "Priced from the Electrical Code Fee Schedule: new residential per dwelling unit by square footage, flat rows for branch circuits and equipment, commercial $14 base plus a wiring-cost percentage ladder.",
    },
    {
      jurisdictionKey: BOI_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      isAvailable: true,
      localName: "Plumbing Permit",
      officialUrl: PLUMB_PDF_URL,
      notes:
        "Priced from the Plumbing Code Fee Schedule: new SFD/duplex per dwelling unit by square footage, $32 + $12/fixture for multi-fixture residential, $32 + value ladder for commercial.",
    },
  ],

  feeSchedules: [
    {
      key: BOI_BUILDING_SOURCE_KEY,
      jurisdictionKey: BOI_KEYS.jurisdiction,
      sourceKey: BOI_BUILDING_SOURCE_KEY,
      title: "Boise City Building Code Fee Schedule",
      officialUrl: BLDG_PDF_URL,
      effectiveFrom: BOI_BUILDING_EFF,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: BOI_LAST_VERIFIED,
      notes:
        "Effective 10-1-2023; the FY27 proposed edition leaves Table 1-A unchanged.",
    },
    {
      key: BOI_ELECTRICAL_SOURCE_KEY,
      jurisdictionKey: BOI_KEYS.jurisdiction,
      sourceKey: BOI_ELECTRICAL_SOURCE_KEY,
      title: "Boise City Electrical Code Fee Schedule",
      officialUrl: ELEC_PDF_URL,
      effectiveFrom: BOI_ELECTRICAL_EFF,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: BOI_LAST_VERIFIED,
      notes:
        "Current adopted edition; the FY27 redline proposes uplifts (e.g. $55 → $57 branch circuit) not yet in force.",
    },
    {
      key: BOI_PLUMBING_SOURCE_KEY,
      jurisdictionKey: BOI_KEYS.jurisdiction,
      sourceKey: BOI_PLUMBING_SOURCE_KEY,
      title: "Boise City Plumbing Code Fee Schedule",
      officialUrl: PLUMB_PDF_URL,
      effectiveFrom: BOI_PLUMBING_EFF,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: BOI_LAST_VERIFIED,
      notes: "Current adopted edition (10-1-2021).",
    },
    {
      key: BOI_MECHANICAL_SOURCE_KEY,
      jurisdictionKey: BOI_KEYS.jurisdiction,
      sourceKey: BOI_MECHANICAL_SOURCE_KEY,
      title: "Boise City Mechanical Code and Fuel Gas Code Fee Schedule",
      officialUrl: MECH_PDF_URL,
      effectiveFrom: BOI_MECHANICAL_EFF,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: BOI_LAST_VERIFIED,
      notes: "Current adopted edition (10-1-2021).",
    },
  ],

  feeRules: [
    ...BOI_BUILDING_RULES.map((rule) => ({
      jurisdictionKey: BOI_KEYS.jurisdiction,
      permitTypeKey: "building",
      scheduleKey: BOI_BUILDING_SOURCE_KEY,
      rule,
    })),
    ...BOI_ELECTRICAL_RULES.map((rule) => ({
      jurisdictionKey: BOI_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      scheduleKey: BOI_ELECTRICAL_SOURCE_KEY,
      rule,
    })),
    ...BOI_PLUMBING_RULES.map((rule) => ({
      jurisdictionKey: BOI_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      scheduleKey: BOI_PLUMBING_SOURCE_KEY,
      rule,
    })),
  ],

  requirements: [
    {
      jurisdictionKey: BOI_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "document",
      title: "Construction documents for plan review",
      description:
        "Permit applications go in with construction documents for plan review; additional plan review after the third review or after permit issuance is billed hourly (residential $55/hour, commercial/multi-family/fire $65/hour, one-hour minimum).",
      isMandatory: true,
      sortOrder: 1,
      sourceKey: BOI_BUILDING_SOURCE_KEY,
      lastVerifiedAt: BOI_LAST_VERIFIED,
    },
    {
      jurisdictionKey: BOI_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "other",
      title: "Special investigation for work before the permit",
      description:
        "A fee equivalent to 100% of the building permit fee is charged in addition to the original permit fee to investigate work commencing before a building permit is issued.",
      isMandatory: false,
      sortOrder: 2,
      sourceKey: BOI_BUILDING_SOURCE_KEY,
      lastVerifiedAt: BOI_LAST_VERIFIED,
    },
    {
      jurisdictionKey: BOI_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      requirementType: "other",
      title: "Separate permits for pools and exterior features",
      description:
        "Pools and other exterior features must be permitted separately using section 3 and Table 3-a of the Electrical Code Fee Schedule; standalone new electrical services price from Table 5-a.",
      isMandatory: false,
      sortOrder: 3,
      sourceKey: BOI_ELECTRICAL_SOURCE_KEY,
      lastVerifiedAt: BOI_LAST_VERIFIED,
    },
  ],

  profile: {
    jurisdictionKey: BOI_KEYS.jurisdiction,
    headline: "Boise, Idaho Permit Fees & Municipal Building Code",
    summary:
      "Boise's Planning & Development Services prices permits under four adopted fee schedules: a building ladder from $26.37 for the first $500 of valuation rising to $913.09 + $5.17 per $1,000 above $100,000, with plan review at 65% commercial and 20% for one- and two-family residential; an electrical schedule that charges new homes per dwelling unit by square footage; and plumbing/mechanical schedules combining per-unit ladders, $12 fixture fees and a 2.28%-of-value commercial ladder.",
    localContext:
      "Boise's four fee schedules are read as separate adopted documents (building Oct. 2023; electrical July 2019; plumbing and mechanical Oct. 2021). The city posts FY27 'proposed' redline editions whose uplifts — a $57 branch-circuit fee, a $32.33 plumbing base — are not yet adopted; this estimate prices the current adopted schedules.\n\nAffordable housing developments owned or financed by the City of Boise are exempt from building permit, plan review and grading fees, and privately developed affordable housing may apply for deferral or exemption. Reinspection is $55 across all four schedules, and a special investigation fee equal to 100% of the permit fee applies to work started without one.",
    valuationBasis:
      "Building permit fees read Table 1-A on total structure valuation. Electrical commercial fees read the total wiring cost (all labor and material; owner-supplied equipment included, used material at 50% of new retail or actual cost, whichever is greater). Plumbing and mechanical commercial fees read the project value — the selling price of the completed installation.",
    notIncluded:
      "These municipal figures cover the permit and plan-review fees. They exclude:\n\n- **Impact fees** (police, parks, fire, Ada County Highway District) billed separately by the City's Finance and ACHD programs.\n- **Grading and erosion-control permits** under IBC Appendix J (separate tables).\n- **Fire sprinkler and fire alarm permit fees** ($175 base + $4.85 per sprinkler head / $4.60 per alarm device, $4,000 cap).\n- **Energy Code Inspection ($55)** and after-hours inspection charges.\n- **Water, sewer and street-cut fees** from Boise's utilities and Public Works.",
    seoTitle: "Boise ID Permit Fees | Building Code Fee Schedule & Calculator",
    seoDescription:
      "Calculate Boise permit costs: Table 1-A valuation ladder, 65%/20% plan review, electrical per-dwelling-unit rates, plumbing $12 fixture fees.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: BOI_LAST_VERIFIED,
  },

  permitPages: [
    {
      jurisdictionKey: BOI_KEYS.jurisdiction,
      permitTypeKey: "building",
      slug: "building-permit-cost",
      title: "Boise Building Permit Cost",
      intro:
        "A Boise building permit prices from **total valuation** on Table 1-A of the Building Code Fee Schedule: **$26.37 for the first $500 plus $2.95 per additional $100** through $2,000, then $12.71, $9.30, $6.35 and finally **$5.17 per additional $1,000 or fraction** above $100,000. Plan review adds **65% of the permit fee** for commercial work and **20%** for one- and two-family homes.",
      localSummary:
        "The Building Division, at 150 N Capitol Blvd, reviews and issues permits under the 2023 fee schedule. The ladder chains exactly at every seam — $70.76 at $2,000, $362.80 at $25,000, $595.30 at $50,000 and $913.09 at $100,000 are each the previous band's own product. Affordable housing owned or financed by the city pays nothing, and privately built affordable projects can apply for deferral. Work started without a permit adds a special investigation fee equal to 100% of the permit fee.",
      notIncluded:
        "This estimate covers the building permit and its plan review. It excludes:\n\n- **Impact fees** (police, parks, fire, ACHD).\n- **Fire sprinkler and fire alarm permits** ($175 + per-head/device fees).\n- **Grading and erosion control** (Appendix J tables).\n- **Energy Code Inspection ($55)** and after-hours inspections ($83/hour, two-hour minimum).\n- **Utility connection and street fees**.",
      workedExample: {
        scenario:
          "A new single-family home in Boise with a total valuation of $300,000.",
        inputs: {
          valuationCents: 30_000_000,
          occupancy: "residential",
          workType: "new_construction",
        },
        notes:
          "Table 1-A top band: $913.09 for the first $100,000 + ($300,000 − $100,000) ÷ $1,000 = 200 steps × $5.17 = **$1,034.00**. Permit = **$1,947.09**. Residential plan review at 20% adds **$389.42**. Total: **$2,336.51**.",
      },
      faqs: [
        {
          question: "How is a Boise building permit fee calculated?",
          answer:
            "From total valuation on Table 1-A: $26.37 for the first $500 plus $2.95 per additional $100 or fraction to $2,000; $70.76 for the first $2,000 plus $12.71 per $1,000 to $25,000; $362.80 to $50,000 at $9.30; $595.30 to $100,000 at $6.35; then $913.09 plus $5.17 per $1,000 or fraction above $100,000.",
          sourceId: BOI_BUILDING_SOURCE_KEY,
          attribution: "Boise City Building Code Fee Schedule, Table 1-A (eff. 10-1-2023)",
        },
        {
          question: "How much is plan review in Boise?",
          answer:
            "Commercial building plan review is 65% of the building permit fee (item 8). Residential plan review for one- and two-family dwellings, townhouses and their accessory structures is 20% of the permit fee (item 9). Additional reviews after the third round bill at $55/hour residential and $65/hour commercial.",
          sourceId: BOI_BUILDING_SOURCE_KEY,
          attribution: "Boise City Building Code Fee Schedule, items 8-9 and 6",
        },
        {
          question: "What does a permit cost for a $300,000 home in Boise?",
          answer:
            "The top band applies: $913.09 for the first $100,000 plus 200 × $5.17 = $1,034.00, so the permit alone is $1,947.09; with 20% residential plan review the total reaches $2,336.51.",
          sourceId: BOI_BUILDING_SOURCE_KEY,
          attribution: "Boise City Building Code Fee Schedule, Table 1-A and item 9",
        },
        {
          question: "Is there a minimum or maximum permit fee in Boise?",
          answer:
            "Table 1-A has no stated minimum or maximum — the first band's $26.37 is the smallest charge a valuation can produce. Fire sprinkler and alarm permits cap at $4,000, but the building ladder itself is unbounded above.",
          sourceId: BOI_BUILDING_SOURCE_KEY,
          attribution: "Boise City Building Code Fee Schedule, Table 1-A",
        },
        {
          question: "Does Boise offer fee waivers for affordable housing?",
          answer:
            "Yes. Affordable housing developments owned or financed by the City of Boise are not subject to building permit, plan review, or grading & drainage fees; privately owned affordable developments may apply for a deferral or exemption, evaluated case by case.",
          sourceId: BOI_BUILDING_SOURCE_KEY,
          attribution: "Boise City Building Code Fee Schedule, Deferrals and Exemptions",
        },
        {
          question: "What happens if I build without a permit in Boise?",
          answer:
            "A special investigation fee equivalent to 100% of the building permit fee is charged in addition to the original permit fee, to investigate and document work that commenced before the permit was issued.",
          sourceId: BOI_BUILDING_SOURCE_KEY,
          attribution: "Boise City Building Code Fee Schedule, item 5",
        },
        {
          question: "How much is a reinspection in Boise?",
          answer:
            "$55 per reinspection on all four schedules. Inspections for which no fee is specifically indicated bill at $55 per hour with a one-hour minimum, and after-hours inspections run $83 per hour with a two-hour minimum.",
          sourceId: BOI_BUILDING_SOURCE_KEY,
          attribution: "Boise City Building Code Fee Schedule, items 1-3",
        },
        {
          question: "How does Boise charge for solar?",
          answer:
            "Residential solar photovoltaic systems pay a flat $165 plan-review/inspection permit fee. Commercial solar reduces the total project valuation in half and then calculates the permit and plan review fees from Table 1-A.",
          sourceId: BOI_BUILDING_SOURCE_KEY,
          attribution: "Boise City Building Code Fee Schedule, items 11-12",
        },
      ],
      seoTitle: "Boise ID Building Permit Cost (Table 1-A Ladder & Plan Review)",
      seoDescription:
        "Boise building permits: $26.37 + $2.95/$100 ladder to $913.09 + $5.17/$1,000, plan review 65% commercial / 20% residential.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: BOI_LAST_VERIFIED,
    },

    {
      jurisdictionKey: BOI_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      slug: "electrical-permit-cost",
      title: "Boise Electrical Permit Cost",
      intro:
        "Boise electrical permits price from the **Electrical Code Fee Schedule**: a **new single-family home pays $135-$210 per dwelling unit** by square footage (plus $65 per extra 1,000 sq ft over 4,501), a **single branch circuit is $55**, service equipment changes are **$55-$65**, and commercial work pays a **$14 base plus 2.28% of wiring cost over $100**, stepping down to 0.57% above $10,000.",
      localSummary:
        "Electrical permits are issued by Planning & Development Services under the 2023 NEC. The new-home rows cover everything wired at the same time inside the structure and attached garage; pools and other exterior features permit separately at $110-$165. Standalone service-entrance and panel changes price from Table 5-a without a base fee, and a temporary service is $40. Commercial wiring cost includes all labor and material, with owner-supplied equipment counted at market value.",
      notIncluded:
        "This estimate covers the electrical permit only. It excludes:\n\n- **Idaho Power** meter, transformer and service-drop charges.\n- **Fire alarm permits** ($175 base + $4.60 per initiating device).\n- **Building, plumbing and mechanical permits** for the same project.\n- **Reinspections ($55)** and after-hours inspections.\n- **The special investigation fee** (100% of the permit fee) for work started without a permit.",
      workedExample: {
        scenario:
          "A new 2,000-square-foot single-family home in Boise, wired complete, with a 200-amp service included in the same permit.",
        inputs: {
          squareFootage: 2_000,
          units: 1,
          occupancy: "residential",
          workType: "new_construction",
          custom: { new_residential_wiring: true },
        },
        notes:
          "Table 1-a, up to 2,500 sq ft: **$135.00 per dwelling unit** × 1 = $135.00. The service is inside the new-home permit's scope, so no Table 5-a row adds. Total: **$135.00**.",
      },
      faqs: [
        {
          question: "How much is an electrical permit for a new house in Boise?",
          answer:
            "$135 per dwelling unit up to 2,500 sq ft, $155 for 2,501-3,500 sq ft, $175 for 3,501-4,500 sq ft, and $210 plus $65 per additional 1,000 sq ft or portion over 4,501 sq ft — per dwelling unit, covering all wiring in the structure and attached garage done at the same time.",
          sourceId: BOI_ELECTRICAL_SOURCE_KEY,
          attribution: "Boise City Electrical Code Fee Schedule, Table 1-a",
        },
        {
          question: "What does a panel upgrade or service change cost to permit in Boise?",
          answer:
            "Table 5-a: $55 for service entrance equipment or panel/sub-panel/main-disconnect changes up to 200 amperes, $65 over 200 amperes, and $40 for a temporary service. No additional base fee applies.",
          sourceId: BOI_ELECTRICAL_SOURCE_KEY,
          attribution: "Boise City Electrical Code Fee Schedule, Table 5-a",
        },
        {
          question: "How are commercial electrical permits priced in Boise?",
          answer:
            "A $14 base fee plus Table 6-b on total wiring cost: $22.83 plus 2.28% of wiring cost over $100 up to $2,000; $84.32 plus 1.14% over $2,000 up to $10,000; $197.18 plus 0.57% of the portion over $10,000. Commercial temporary power poles are $80 each.",
          sourceId: BOI_ELECTRICAL_SOURCE_KEY,
          attribution: "Boise City Electrical Code Fee Schedule, section 6 and Table 6-b",
        },
        {
          question: "What counts as wiring cost for the commercial fee?",
          answer:
            "The cost to the owner of all labor, material and other costs to install the wiring system, including light fixtures and factory-installed motor control equipment. Owner-supplied equipment is included, and used material values at 50% of new retail or actual cost, whichever is greater.",
          sourceId: BOI_ELECTRICAL_SOURCE_KEY,
          attribution: "Boise City Electrical Code Fee Schedule, section 6(d)-(f)",
        },
        {
          question: "How much is a single branch circuit permit in Boise?",
          answer:
            "$55 for the installation or alteration of a single branch circuit supplying fixtures or appliances — EV outlets, water heaters, exhaust fans, ceiling fans, exterior lighting, A/C condensers, space heating and similar. No base fee is added.",
          sourceId: BOI_ELECTRICAL_SOURCE_KEY,
          attribution: "Boise City Electrical Code Fee Schedule, Table 2-b",
        },
        {
          question: "How much is a solar permit in Boise?",
          answer:
            "Residential photovoltaic systems are $110 flat (up to two inspections) under Table 3-a; the Building Code Fee Schedule's residential solar plan-review/inspection fee is $165. Commercial solar values the project at half and prices from Table 1-A.",
          sourceId: BOI_ELECTRICAL_SOURCE_KEY,
          attribution: "Electrical Table 3-a; Building Code Fee Schedule items 11-12",
        },
        {
          question: "Does Boise require a separate permit for pools and hot tubs?",
          answer:
            "Yes. Pools and other exterior features must be permitted separately using section 3 and Table 3-a: swimming pools $165 (up to three inspections), hot tubs and spas $110 (up to two inspections).",
          sourceId: BOI_ELECTRICAL_SOURCE_KEY,
          attribution: "Boise City Electrical Code Fee Schedule, section 1(b) and Table 3-a",
        },
        {
          question: "What happens on a reinspection in Boise?",
          answer:
            "The first reinspection is $55. Under the proposed FY27 schedule the second would rise to $150 and the third to $225, but the adopted schedule charges $55 per reinspection today.",
          sourceId: BOI_ELECTRICAL_SOURCE_KEY,
          attribution: "Boise City Electrical Code Fee Schedule, Table 7-a",
        },
      ],
      seoTitle: "Boise ID Electrical Permit Cost (Per-Unit & Wiring-Cost Fees)",
      seoDescription:
        "Boise electrical permits: $135-$210 per dwelling unit new residential, $55 branch circuit, $14 base + 2.28% commercial wiring cost.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: BOI_LAST_VERIFIED,
    },

    {
      jurisdictionKey: BOI_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      slug: "plumbing-permit-cost",
      title: "Boise Plumbing Permit Cost",
      intro:
        "Boise plumbing permits price from the **Plumbing Code Fee Schedule**: a **new single-family home or duplex pays $130-$325 per dwelling unit** by square footage, multi-fixture residential work pays a **$32 base plus $12 per fixture**, and commercial work pays a **$32 base plus 2.28% of project value**, stepping to 1.71% and 1.14% on large projects. Sewer and water service lines are **$55 each**.",
      localSummary:
        "Plumbing permits are issued by Planning & Development Services; boilers, gas piping, hydronic heating and solar thermal ride on the mechanical permit instead. The new-home ladder covers everything in the unit; additions and remodels price per fixture at $12 each from a $32 base. Table B(1.a) add-ons — lawn sprinkler supply $44, NFPA 13D sprinkler service $12, steam shower $12 — join the base permit when the same contractor does the work.",
      notIncluded:
        "This estimate covers the plumbing permit only. It excludes:\n\n- **Boilers, gas piping, hydronic and solar thermal** work, which permits under the mechanical schedule.\n- **Sewer, water and storm main extensions** and connection fees from the utilities.\n- **Commercial plan review** and multi-discipline reviews.\n- **Reinspections ($55)** and after-hours inspection charges.\n- **The special investigation fee** for unpermitted work.",
      workedExample: {
        scenario:
          "A remodel adding a bathroom in an existing Boise home: a $32-base multi-fixture permit covering 6 fixtures (toilet, sink, tub/shower, floor drain, dishwasher, water heater).",
        inputs: {
          occupancy: "residential",
          workType: "alteration",
          fixtures: 6,
          custom: { residential_fixtures: true },
        },
        notes:
          "Section B(2)(a): base permit **$32.00**. Table B(2): 6 fixtures × $12.00 = **$72.00**. Total: **$104.00**.",
      },
      faqs: [
        {
          question: "How much is a plumbing permit for a new house in Boise?",
          answer:
            "$130 per dwelling unit up to 1,500 sq ft, $180 for 1,501-2,500, $250 for 2,501-3,500, $290 for 3,501-4,500, and $325 plus $65 per additional 1,000 sq ft or portion over 4,501 sq ft.",
          sourceId: BOI_PLUMBING_SOURCE_KEY,
          attribution: "Boise City Plumbing Code Fee Schedule, Table B(1)",
        },
        {
          question: "How are plumbing fixtures charged in Boise?",
          answer:
            "For residential projects with three or more units and any addition, alteration, repair or fixture replacement: a $32 base permit plus $12 per fixture or appliance — water closets, sinks, tubs and showers, water heaters, dishwashers, floor drains, disposals, wash basins, softeners and similar.",
          sourceId: BOI_PLUMBING_SOURCE_KEY,
          attribution: "Boise City Plumbing Code Fee Schedule, B(2)(a-b) and Table B(2)",
        },
        {
          question: "What does a water heater replacement permit cost in Boise?",
          answer:
            "A single fixture or appliance installation prices $55 under Table B(3); if the replacement is part of a multi-fixture permit the fixture charge is $12 with the $32 base. Residential tank-style water-heater replacement permits in Casper-style schedules do not apply here — Boise prices from its own tables.",
          sourceId: BOI_PLUMBING_SOURCE_KEY,
          attribution: "Boise City Plumbing Code Fee Schedule, Table B(3)",
        },
        {
          question: "How is commercial plumbing priced in Boise?",
          answer:
            "A $32 base plus a percentage of the project value (selling price of the completed installation): 2.28% under $500,000; $11,410.88 plus 1.71% of the value over $500,000 up to $1,000,000; $19,969.04 plus 1.14% of the value over $1,000,000.",
          sourceId: BOI_PLUMBING_SOURCE_KEY,
          attribution: "Boise City Plumbing Code Fee Schedule, C(1)(a-b) and Table C(1)",
        },
        {
          question: "What do sewer and water service line permits cost?",
          answer:
            "$55 each, or $55 for a sewer-and-water combination when only one inspection is required and the same contractor or homeowner performs the work (Table B(1.a) and the Table B(2) service rows).",
          sourceId: BOI_PLUMBING_SOURCE_KEY,
          attribution: "Boise City Plumbing Code Fee Schedule, Table B(1.a)",
        },
        {
          question: "How much is a lawn sprinkler permit in Boise?",
          answer:
            "Lawn sprinkler supply through the backflow is $44 within the base single-family permit (Table B(1.a)), and the per-fixture residential rate for sprinkler work under a multi-fixture permit is $12 per head or zone device with the $32 base.",
          sourceId: BOI_PLUMBING_SOURCE_KEY,
          attribution: "Boise City Plumbing Code Fee Schedule, Table B(1.a)",
        },
        {
          question: "What is re-plumbing an entire house in Boise?",
          answer:
            "$110 under Table B(3); water or waste re-piping alone is $80, and single fixture or single-line work is $55 each.",
          sourceId: BOI_PLUMBING_SOURCE_KEY,
          attribution: "Boise City Plumbing Code Fee Schedule, Table B(3)",
        },
        {
          question: "Do backflow devices cost extra in Boise?",
          answer:
            "A backflow assembly with an NFPA 13D fire sprinkler service is $12 within the base permit, and each backflow preventer in a multi-fixture scope prices at the $12 fixture rate with the $32 base.",
          sourceId: BOI_PLUMBING_SOURCE_KEY,
          attribution: "Boise City Plumbing Code Fee Schedule, Table B(1.a) and Table B(2)",
        },
      ],
      seoTitle: "Boise ID Plumbing Permit Cost (Per-Unit & Fixture Fees)",
      seoDescription:
        "Boise plumbing permits: $130-$325 per dwelling unit new residential, $32 + $12/fixture remodels, $32 + 2.28% commercial value ladder.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: BOI_LAST_VERIFIED,
    },
  ],

  verifications: [
    {
      entityType: "jurisdiction_profile",
      entityKey: BOI_KEYS.jurisdiction,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: BOI_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Idaho Expansion",
      sourceKey: BOI_BUILDING_SOURCE_KEY,
      notes:
        "All four adopted fee-schedule PDFs downloaded and read with pdftotext; FY27 proposed redlines identified and deliberately excluded.",
    },
    {
      entityType: "fee_schedule",
      entityKey: BOI_BUILDING_SOURCE_KEY,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: BOI_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Idaho Expansion",
      sourceKey: BOI_BUILDING_SOURCE_KEY,
      notes:
        "Table 1-A bands and plan-review percentages verified from the effective 10-1-2023 PDF; the FY27 redline shows the table unchanged.",
    },
    {
      entityType: "fee_schedule",
      entityKey: BOI_ELECTRICAL_SOURCE_KEY,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: BOI_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Idaho Expansion",
      sourceKey: BOI_ELECTRICAL_SOURCE_KEY,
      notes:
        "Tables 1-a/2-b/3-a/5-a/6-b/7-a read from the current 7-17-2019 edition.",
    },
    {
      entityType: "fee_schedule",
      entityKey: BOI_PLUMBING_SOURCE_KEY,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: BOI_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Idaho Expansion",
      sourceKey: BOI_PLUMBING_SOURCE_KEY,
      notes:
        "Tables B(1)/B(1.a)/B(2)/B(3)/C(1)/D(1) read from the current 10-1-2021 edition.",
    },
    {
      entityType: "permit_page",
      entityKey: "building-permit-cost",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: BOI_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Idaho Expansion",
      sourceKey: BOI_BUILDING_SOURCE_KEY,
      notes: "Editorial gate checks passed for the building page.",
    },
    {
      entityType: "permit_page",
      entityKey: "electrical-permit-cost",
      permitTypeKey: "electrical",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: BOI_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Idaho Expansion",
      sourceKey: BOI_ELECTRICAL_SOURCE_KEY,
      notes: "Editorial gate checks passed for the electrical page.",
    },
    {
      entityType: "permit_page",
      entityKey: "plumbing-permit-cost",
      permitTypeKey: "plumbing",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: BOI_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Idaho Expansion",
      sourceKey: BOI_PLUMBING_SOURCE_KEY,
      notes: "Editorial gate checks passed for the plumbing page.",
    },
  ],
};
