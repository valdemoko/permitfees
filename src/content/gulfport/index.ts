import type { JurisdictionSeed } from "@/content/seed-types";
import {
  GP_BUILDING_RULES,
  GP_BUILDING_SOURCE_KEY,
  GP_ELECTRICAL_RULES,
  GP_ELECTRICAL_SOURCE_KEY,
  GP_FEE_EFFECTIVE_FROM,
  GP_PLUMBING_RULES,
  GP_PLUMBING_SOURCE_KEY,
} from "@/content/gulfport/fee-rules";

export const GP_LAST_VERIFIED = "2026-09-26";

export const GP_KEYS = {
  state: "ms",
  county: "harrison-county-ms",
  jurisdiction: "gulfport",
} as const;

const state = {
  code: "MS",
  slug: "mississippi",
  name: "Mississippi",
  fipsCode: "28",
};

const county = {
  key: GP_KEYS.county,
  slug: "harrison-county-ms",
  name: "Harrison County",
  fipsCode: "28047",
};

const CITY_URL = "https://www.gulfport-ms.gov";
const BCS_URL =
  "https://www.gulfport-ms.gov/departments/urban_development/building_code_services/index.php";
const BUILDING_FEES_URL = `${CITY_URL}/Documents/Departments/Urban%20Development/Building%20Code%20Services/BUILDING-PERMIT-FEES.pdf`;
const ELECTRICAL_FEES_URL = `${CITY_URL}/Documents/Departments/Urban%20Development/Building%20Code%20Services/ElecPermitFeeSchedule2002.pdf`;
const PLUMBING_FEES_URL = `${CITY_URL}/Documents/Departments/Urban%20Development/Building%20Code%20Services/PlumbingPermitFeeSchedule2002.pdf`;

export const gulfportSeed: JurisdictionSeed = {
  state,
  county,

  jurisdiction: {
    key: GP_KEYS.jurisdiction,
    stateKey: GP_KEYS.state,
    countyKey: GP_KEYS.county,
    type: "city",
    slug: "gulfport",
    name: "Gulfport",
    officialName:
      "City of Gulfport — Urban Development Department, Building Code Services",
    websiteUrl: CITY_URL,
    permitPortalUrl: BCS_URL,
    timezone: "America/Chicago",
    isActive: true,
  },

  departments: [
    {
      key: "gulfport-building-code-services",
      jurisdictionKey: GP_KEYS.jurisdiction,
      kind: "building",
      name: "Gulfport Building Code Services",
      phone: "(228) 868-5790",
      email: "rsheriff@gulfport-ms.gov",
      url: BCS_URL,
      addressLine: "1410 24th Avenue, Gulfport, MS 39501",
      hours: "Monday – Friday, 8:00 a.m. – 5:00 p.m. CT",
      notes:
        "Building Code Services within the Urban Development Department issues building, electrical, plumbing, mechanical/HVAC, gas and sign permits for the City and performs all trade inspections. Assistant Director: Roy Sheriff.",
    },
  ],

  sources: [
    {
      key: GP_BUILDING_SOURCE_KEY,
      jurisdictionKey: GP_KEYS.jurisdiction,
      title: "City of Gulfport — Building Permit Fee Schedule (BUILDING-PERMIT-FEES.pdf)",
      url: BUILDING_FEES_URL,
      sourceType: "fee_schedule_pdf",
      issuingAuthority: "City of Gulfport Urban Development — Building Code Services",
      authorityKind: "city",
      isPrimary: true,
      documentDate: null,
      effectiveFrom: GP_FEE_EFFECTIVE_FROM,
      retrievedAt: "2026-09-26",
      lastVerifiedAt: GP_LAST_VERIFIED,
      notes:
        "Undated schedule: $30.00 base fee plus a ~100-row valuation ladder ($24 for the first $1,000, +$4 per additional $1,000 or fraction to $500,001) and a closing prose rule for the top band ($2,020 for the first $500,000 + $3.20 per additional $1,000 or fraction). Table and prose agree arithmetically; read with pdftotext -layout from the department's own document center.",
    },
    {
      key: GP_ELECTRICAL_SOURCE_KEY,
      jurisdictionKey: GP_KEYS.jurisdiction,
      title:
        "City of Gulfport — Electrical Permit Fee Schedule, FY 2002 (ElecPermitFeeSchedule2002.pdf)",
      url: ELECTRICAL_FEES_URL,
      sourceType: "fee_schedule_pdf",
      issuingAuthority: "City of Gulfport Urban Development — Building Code Services",
      authorityKind: "city",
      isPrimary: true,
      documentDate: "2002-10-01",
      effectiveFrom: GP_FEE_EFFECTIVE_FROM,
      retrievedAt: "2026-09-26",
      lastVerifiedAt: GP_LAST_VERIFIED,
      notes:
        "Column headed 'Type of Permit FY 2002 Permit Fee': $30.00 base fee; service-entrance ladder by amperage; feeder-circuit ladder; distribution/sub-panel at $0.25 per ampere (banded ranges that are the same rate expressed as endpoints); $6.00 per branch circuit; appliance-circuit price list; motor, generator/transformer, sign and miscellaneous rows. Dated honestly — the department's page links it as its current electrical fee schedule.",
    },
    {
      key: GP_PLUMBING_SOURCE_KEY,
      jurisdictionKey: GP_KEYS.jurisdiction,
      title:
        "City of Gulfport — Plumbing Permit Fee Schedule, FY 2002 (PlumbingPermitFeeSchedule2002.pdf)",
      url: PLUMBING_FEES_URL,
      sourceType: "fee_schedule_pdf",
      issuingAuthority: "City of Gulfport Urban Development — Building Code Services",
      authorityKind: "city",
      isPrimary: true,
      documentDate: "2002-10-01",
      effectiveFrom: GP_FEE_EFFECTIVE_FROM,
      retrievedAt: "2026-09-26",
      lastVerifiedAt: GP_LAST_VERIFIED,
      notes:
        "Column headed 'Type of Permit FY 2002 Permit Fee': $30.00 base fee plus a fixture price list — $5.00 generic fixtures, $7.00 lavatories and floor drains ($10.00 with trap primer), $10.00 water heaters and heating appliances, $50.00 water connection, $25.00 other connections, $15.00 backflow preventer, sprinkler heads $10.00 for 1–5 + $2.00 each additional. Layout garbles a few row/column pairs in extraction; each pair was re-checked against the PDF structure before transcription.",
    },
    {
      key: "gulfport-bcs-page",
      jurisdictionKey: GP_KEYS.jurisdiction,
      title: "Urban Development — Building Code Services department page",
      url: BCS_URL,
      sourceType: "municipal_website",
      issuingAuthority: "City of Gulfport",
      authorityKind: "city",
      isPrimary: true,
      documentDate: null,
      effectiveFrom: null,
      retrievedAt: "2026-09-26",
      lastVerifiedAt: GP_LAST_VERIFIED,
      notes:
        "Department page linking the three fee-schedule PDFs and the trade permit applications; names the department, address, phone and contact. Note: mygulfport.us is Gulfport, Florida — all Gulfport MS material lives on gulfport-ms.gov.",
    },
  ],

  permitTypes: [],
  projectTypes: [],

  jurisdictionPermitTypes: [
    {
      jurisdictionKey: GP_KEYS.jurisdiction,
      permitTypeKey: "building",
      isAvailable: true,
      localName: "Building Permit",
      officialUrl: BUILDING_FEES_URL,
      notes:
        "$30.00 base fee plus the valuation ladder ($24 first $1,000 + $4 per additional $1,000 or fraction to $500,001; $2,020 + $3.20 above).",
    },
    {
      jurisdictionKey: GP_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      isAvailable: true,
      localName: "Electrical Permit",
      officialUrl: ELECTRICAL_FEES_URL,
      notes:
        "$30.00 base fee plus the FY 2002 equipment table: service and feeder ladders by amperage, $6.00 per branch circuit, appliance rows, signs and miscellaneous charges.",
    },
    {
      jurisdictionKey: GP_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      isAvailable: true,
      localName: "Plumbing Permit",
      officialUrl: PLUMBING_FEES_URL,
      notes:
        "$30.00 base fee plus the FY 2002 fixture price list: $5.00 generic fixtures, $7.00 lavatories and floor drains, $10.00 water heaters, $50.00 water connection, $25.00 other connections, $15.00 backflow preventer.",
    },
  ],

  feeSchedules: [
    {
      key: "gulfport-building-fee-schedule",
      jurisdictionKey: GP_KEYS.jurisdiction,
      sourceKey: GP_BUILDING_SOURCE_KEY,
      title: "Gulfport Building Permit Fee Schedule",
      officialUrl: BUILDING_FEES_URL,
      effectiveFrom: GP_FEE_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: GP_LAST_VERIFIED,
      notes:
        "Undated on its face; the department links it as its current building fee schedule.",
    },
    {
      key: "gulfport-electrical-fee-schedule",
      jurisdictionKey: GP_KEYS.jurisdiction,
      sourceKey: GP_ELECTRICAL_SOURCE_KEY,
      title: "Gulfport Electrical Permit Fee Schedule (FY 2002)",
      officialUrl: ELECTRICAL_FEES_URL,
      effectiveFrom: GP_FEE_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: GP_LAST_VERIFIED,
      notes:
        "FY 2002 document, carried with its date. The department's page links it as its current electrical fee schedule; the vintage is stated in the page prose.",
    },
    {
      key: "gulfport-plumbing-fee-schedule",
      jurisdictionKey: GP_KEYS.jurisdiction,
      sourceKey: GP_PLUMBING_SOURCE_KEY,
      title: "Gulfport Plumbing Permit Fee Schedule (FY 2002)",
      officialUrl: PLUMBING_FEES_URL,
      effectiveFrom: GP_FEE_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: GP_LAST_VERIFIED,
      notes:
        "FY 2002 document, carried with its date. The department's page links it as its current plumbing fee schedule; the vintage is stated in the page prose.",
    },
  ],

  feeRules: [
    ...GP_BUILDING_RULES.map((rule) => ({
      jurisdictionKey: GP_KEYS.jurisdiction,
      permitTypeKey: "building",
      scheduleKey: "gulfport-building-fee-schedule",
      rule,
    })),
    ...GP_ELECTRICAL_RULES.map((rule) => ({
      jurisdictionKey: GP_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      scheduleKey: "gulfport-electrical-fee-schedule",
      rule,
    })),
    ...GP_PLUMBING_RULES.map((rule) => ({
      jurisdictionKey: GP_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      scheduleKey: "gulfport-plumbing-fee-schedule",
      rule,
    })),
  ],

  requirements: [
    {
      jurisdictionKey: GP_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "document",
      title: "Two sets of construction drawings",
      description:
        "Applications are accompanied by two complete sets of drawings (plans, details, riser diagrams, fixture and equipment schedules) unless the work is minor and needs no plan review. The seal of an architect or engineer registered in Mississippi is required for Group A, E, H and I occupancies, buildings three stories or more, and gross areas of 5,000 square feet or more.",
      isMandatory: true,
      sortOrder: 1,
      sourceKey: "gulfport-bcs-page",
      lastVerifiedAt: GP_LAST_VERIFIED,
    },
    {
      jurisdictionKey: GP_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "license",
      title: "Bonded, licensed contractor",
      description:
        "Permits are issued only to master technicians who are bonded contractors; any contractor performing construction work in Gulfport must have a bond on file with the department as required by ordinance.",
      isMandatory: true,
      sortOrder: 2,
      sourceKey: "gulfport-bcs-page",
      lastVerifiedAt: GP_LAST_VERIFIED,
    },
    {
      jurisdictionKey: GP_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      requirementType: "license",
      title: "State electrical license and City bond",
      description:
        "Electrical permits are issued to licensed, bonded electrical contractors through Building Code Services; the permit is issued only for the work shown on the approved drawings.",
      isMandatory: true,
      sortOrder: 3,
      sourceKey: "gulfport-bcs-page",
      lastVerifiedAt: GP_LAST_VERIFIED,
    },
    {
      jurisdictionKey: GP_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      requirementType: "license",
      title: "Licensed, bonded plumbing contractor",
      description:
        "Plumbing permits are issued to bonded master plumbers; advertising as a licensed contractor without the proper City license is unlawful under the ordinance the department administers.",
      isMandatory: true,
      sortOrder: 4,
      sourceKey: "gulfport-bcs-page",
      lastVerifiedAt: GP_LAST_VERIFIED,
    },
  ],

  profile: {
    jurisdictionKey: GP_KEYS.jurisdiction,
    headline: "Gulfport, Mississippi Permit Fees & Building Code Services",
    summary:
      "Gulfport's Urban Development Department — Building Code Services, at 1410 24th Avenue, issues building, electrical, plumbing and mechanical permits. Every schedule opens with a **$30.00 base permit fee**. Building permits then follow a valuation ladder: **$24.00 for the first $1,000 plus $4.00 per additional $1,000 or fraction thereof** to $500,001, and **$2,020.00 plus $3.20 per additional $1,000 or fraction** above that. Electrical permits price the service by amperage ($10.00 up to 100 A through $50.00 at 700–800 A, then $2.00 per additional ampere), feeder circuits by their own ladder, and **$6.00 per branch circuit**, plus an appliance price list. Plumbing permits follow the fixture list: **$5.00 per standard fixture**, **$7.00** lavatories and floor drains, **$10.00** water heaters, the **$50.00 water connection** and **$15.00** backflow preventers. The two trade schedules carry FY 2002 dates, which the pages state plainly.",
    localContext:
      "Gulfport is the largest city on the Mississippi Gulf Coast and anchors Harrison County's permitting landscape: Building Code Services permits everything inside city limits, while Harrison County and neighboring cities (Biloxi, Long Beach, D'Iberville) run their own offices for work outside it. Coastal work here carries floodplain obligations — the department publishes flood-protection guidance alongside its permit applications, and substantial-improvement rules can apply to repairs in the special flood hazard area.\n\nThe department's document center hosts the fee schedules as PDFs linked from its own Building Code Services page, which is where this site's figures come from. The electrical and plumbing schedules are FY 2002 documents; the building schedule is undated but carries the same $30.00 base-fee structure.",
    valuationBasis:
      "Building permit fees are computed from total project valuation on the schedule's ladder. The valuation is the declared cost of the work; the printed table runs from $0 to beyond $500,001 in $1,000 bands, each band's fee rising $4.00.",
    notIncluded:
      "These figures cover City of Gulfport building, electrical and plumbing permit fees only. They exclude:\n\n- **Mechanical (HVAC) and gas permits**, priced on the department's separate mechanical schedule.\n- **Water and sewer tap and impact fees** charged by the City's Water Services and other utilities.\n- **Harrison County and state permits** — septic systems, driveways and state-right-of-way work.\n- **Floodplain development permits** and elevation certificates where coastal flood rules apply.\n- **Sign permits** issued under the department's separate sign application.",
    seoTitle: "Gulfport MS Permit Fees | Building Code Services Fee Schedule",
    seoDescription:
      "Calculate Gulfport, MS permit costs: $30 base fee, building valuation ladder at $4 per $1,000, electrical by amperage and $6 per circuit, plumbing from $5 per fixture.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: GP_LAST_VERIFIED,
  },

  permitPages: [
    {
      jurisdictionKey: GP_KEYS.jurisdiction,
      permitTypeKey: "building",
      slug: "building-permit-cost",
      title: "Gulfport Building Permit Cost",
      intro:
        "A Gulfport building permit is priced by the Urban Development Department's Building Code Services division from **project valuation**. Every permit pays the **$30.00 base fee**, then the ladder: **$24.00 for the first $1,000 plus $4.00 for each additional $1,000 or fraction thereof** up to and including $500,001 — about **$930 on a $220,000 project** — and **$2,020.00 for the first $500,000 plus $3.20 per additional $1,000 or fraction** above that. The schedule's roughly one hundred printed rows are the same $4.00-per-band arithmetic; the closing prose states the rule the table instantiates.",
      localSummary:
        "Building Code Services, at 1410 24th Avenue, issues building permits for everything from a roof-over to new commercial construction; applications go in with two sets of drawings, and Mississippi-registered architect or engineer seals are required on larger projects. Gulfport sits squarely in the coastal flood zone, so substantial improvements in the special flood hazard area can trigger elevation requirements on top of the permit. The permit is issued only for the work exactly as shown on the approved drawings — changes after issuance go back to the Building Official.",
      notIncluded:
        "This estimate covers the City of Gulfport building permit fee only. It excludes:\n\n- **Electrical, plumbing and mechanical (HVAC) permits**, each priced on its own schedule.\n- **Water and sewer tap, impact and capacity fees** charged by utility billing.\n- **Floodplain development permits** and elevation review in the special flood hazard area.\n- **Harrison County and Mississippi DOT** permits for work outside the city or in state rights-of-way.\n- **Fire suppression plan review** by the fire marshal.",
      workedExample: {
        scenario:
          "A commercial tenant build-out in Gulfport with a declared project valuation of $220,000.",
        inputs: {
          valuationCents: 22_000_000,
          squareFootage: 4_000,
          occupancy: "commercial",
          workType: "alteration",
        },
        notes:
          "Base fee: **$30.00**. Ladder to $500,001: $24.00 for the first $1,000, then $4.00 × 219 additional $1,000-or-fraction bands (220,000 − 1,000 = 219) = **$876.00**. Total: **$930.00** — exactly the printed table's arithmetic (the $89,002–$90,001 row prints $380.00 = $24 + 89 × $4, the same rule carried up).",
      },
      faqs: [
        {
          question: "How is a Gulfport building permit fee calculated?",
          answer:
            "From project valuation on the department's printed ladder. Every permit pays the $30.00 base fee, then $24.00 for the first $1,000 of valuation plus $4.00 for each additional $1,000 or fraction thereof. A $220,000 project pays $30.00 + $24.00 + 219 × $4.00 = $930.00.",
          sourceId: GP_BUILDING_SOURCE_KEY,
          attribution: "Gulfport Building Permit Fee Schedule (BUILDING-PERMIT-FEES.pdf)",
        },
        {
          question: "What is the minimum building permit fee in Gulfport?",
          answer:
            "The smallest possible permit is the $30.00 base fee plus the $24.00 first-band fee — $54.00 — because the base fee applies to every permit and the ladder starts at $24.00 for any valuation up to $1,001.",
          sourceId: GP_BUILDING_SOURCE_KEY,
          attribution: "Gulfport Building Permit Fee Schedule (BUILDING-PERMIT-FEES.pdf)",
        },
        {
          question: "How much is a building permit for a $500,000 project in Gulfport?",
          answer:
            "At $500,001 the ladder tops out at $30.00 + $24.00 + 499 × $4.00 = $2,050.00. Above $500,001 the schedule switches to its top band: $2,020.00 for the first $500,000 plus $3.20 per additional $1,000 or fraction.",
          sourceId: GP_BUILDING_SOURCE_KEY,
          attribution: "Gulfport Building Permit Fee Schedule (BUILDING-PERMIT-FEES.pdf)",
        },
        {
          question: "Does Gulfport round up partial thousand-dollar bands?",
          answer:
            "Yes. The schedule's own prose says '$4.00 for each additional thousand or fraction thereof', so any valuation into a new $1,000 band pays the full $4.00 for it — $10,500 of valuation buys ten full bands plus the fraction, not a prorated share.",
          sourceId: GP_BUILDING_SOURCE_KEY,
          attribution: "Gulfport Building Permit Fee Schedule (BUILDING-PERMIT-FEES.pdf)",
        },
        {
          question: "Are Gulfport's fee schedules current?",
          answer:
            "The building schedule is undated and is the one the department links for building fees today. The electrical and plumbing schedules carry FY 2002 column headings; the pages state that vintage plainly rather than presenting the amounts as freshly adopted.",
          sourceId: "gulfport-bcs-page",
          attribution: "Building Code Services department page",
        },
        {
          question: "Do I need drawings with my Gulfport permit application?",
          answer:
            "Two complete sets of construction documents — plans, details, riser diagrams, fixture, pipe-size and equipment schedules — accompany most applications. Minor work that needs no plan review is the exception. An architect's or engineer's Mississippi seal is required for Group A, E, H and I occupancies, buildings three stories or taller, and gross areas of 5,000 square feet or more.",
          sourceId: "gulfport-bcs-page",
          attribution: "Building Code Services department page",
        },
        {
          question: "Does coastal floodplain status change the permit?",
          answer:
            "It can. Gulfport publishes flood-protection guidance citywide, and work in the special flood hazard area may require a floodplain development review and elevation documentation before Building Code Services issues the permit. That review is separate from the fee ladder on this page.",
          sourceId: "gulfport-bcs-page",
          attribution: "Building Code Services flood information page",
        },
        {
          question: "Who can pull a building permit in Gulfport?",
          answer:
            "Permits are issued only to master technicians who are bonded contractors, and any contractor performing construction work in the city must have a bond on file with the department as required by ordinance.",
          sourceId: "gulfport-bcs-page",
          attribution: "Building Code Services department page",
        },
      ],
      seoTitle: "Gulfport MS Building Permit Cost (Valuation Ladder & $30 Base Fee)",
      seoDescription:
        "Gulfport building permit fees: $30 base fee plus $24 for the first $1,000 and $4 per additional $1,000 or fraction to $500,001; $2,020 + $3.20 above.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: GP_LAST_VERIFIED,
    },
    {
      jurisdictionKey: GP_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      slug: "electrical-permit-cost",
      title: "Gulfport Electrical Permit Cost",
      intro:
        "Gulfport electrical permits are priced by Building Code Services from the department's electrical fee schedule. Every permit pays the **$30.00 base fee**, then the equipment table: a **service-entrance ladder** ($10.00 at 100 A or less through $50.00 at 700–800 A, then $2.00 per additional ampere), **feeder circuits** at $6.00–$35.00 by size, **$6.00 per branch circuit**, distribution and sub-panels at **$0.25 per ampere**, and an appliance price list from $6.00 to $12.00 per circuit. The schedule carries an FY 2002 column heading, which the page states plainly.",
      localSummary:
        "Electrical permits cover service changes, panel work, new circuits, temporary power poles ($30.00), signs and outline lighting ($10.00 per light and per transformer or ballast) and mobile-home or travel-trailer connections ($30.00). Permits are issued to licensed, bonded electrical contractors, and Gulfport's coastal salt air makes service-equipment corrosion a common reason for the panel and service rows. The permit is issued only for the work exactly as shown on approved drawings.",
      notIncluded:
        "This estimate covers the City of Gulfport electrical permit fees only. It excludes:\n\n- **Coast Electric Power Association or Mississippi Power** connection, metering and transformer charges.\n- **Building, plumbing and mechanical permits** for the same project.\n- **Fire alarm plan review** by the fire marshal.\n- **Sign permits** for zoning clearance (the schedule's sign-lighting rows price the electrical work itself).\n- **State licensing fees** for electrical contractors.",
      workedExample: {
        scenario:
          "A Gulfport home upgrade: 200-amp service entrance replacement, four new branch circuits, one window air-conditioning unit.",
        inputs: {
          valuationCents: 1_200_000,
          occupancy: "residential",
          workType: "alteration",
          custom: { amperage: 200, circuits: 4, ac_units: 1 },
        },
        notes:
          "Base fee: **$30.00**. Service entrance, 125–200 A band: **$20.00**. Branch circuits: 4 × $6.00 = **$24.00**. Window A/C: **$12.00**. Total: **$86.00**.",
      },
      faqs: [
        {
          question: "How much is an electrical permit for a service upgrade in Gulfport?",
          answer:
            "The $30.00 base fee plus the service-entrance row for the new size: $10.00 at 100 A or less, $20.00 at 125–200 A, $30.00 at 225–400 A, $40.00 at 450–600 A, $50.00 at 700–800 A, and $2.00 per additional ampere above. A typical 200-amp residential upgrade is $50.00 all-in.",
          sourceId: GP_ELECTRICAL_SOURCE_KEY,
          attribution: "Gulfport Electrical Permit Fee Schedule (FY 2002)",
        },
        {
          question: "What does a branch circuit permit cost in Gulfport?",
          answer:
            "$6.00 per circuit, on top of the $30.00 base fee. Four new circuits add $24.00; the permit totals $54.00.",
          sourceId: GP_ELECTRICAL_SOURCE_KEY,
          attribution: "Gulfport Electrical Permit Fee Schedule (FY 2002)",
        },
        {
          question: "How are sub-panels priced in Gulfport?",
          answer:
            "At $0.25 per ampere of panel size. The printed bands show dollar ranges — $15.00–$25.00 at 70–100 A, $31.25–$50.00 at 125–200 A, and so on — which are the same 25¢ rate expressed as each band's endpoints. A 100-amp sub-panel is $25.00.",
          sourceId: GP_ELECTRICAL_SOURCE_KEY,
          attribution: "Gulfport Electrical Permit Fee Schedule (FY 2002)",
        },
        {
          question: "How much is a temporary power pole in Gulfport?",
          answer:
            "$30.00, under the schedule's miscellaneous charges, which also cover correct-wiring-for-occupancy inspections, X-ray equipment per system and transformer-type welders at the same amount. The $30.00 base fee applies as well.",
          sourceId: GP_ELECTRICAL_SOURCE_KEY,
          attribution: "Gulfport Electrical Permit Fee Schedule (FY 2002)",
        },
        {
          question: "What are the fees for signs and outline lighting?",
          answer:
            "$10.00 per light — for the first ten and each additional ten or fraction — plus $10.00 per transformer or ballast, with the $30.00 base fee on the permit.",
          sourceId: GP_ELECTRICAL_SOURCE_KEY,
          attribution: "Gulfport Electrical Permit Fee Schedule (FY 2002)",
        },
        {
          question: "Do appliances each carry a fee on a Gulfport electrical permit?",
          answer:
            "Yes — the schedule's major-appliance-circuit block prices each circuit: $6.00 for ranges, ovens, dryers, dishwashers, electric water heaters and bathroom space heaters; $10.00 for refrigerators, freezers, washers, disposals, compactors, attic fans and the self-contained commercial units; $12.00 for a window A/C. Central A/C prices under the motor rows.",
          sourceId: GP_ELECTRICAL_SOURCE_KEY,
          attribution: "Gulfport Electrical Permit Fee Schedule (FY 2002)",
        },
        {
          question: "Is the Gulfport electrical fee schedule current?",
          answer:
            "The document's column is headed 'FY 2002 Permit Fee' and the department links it as its electrical fee schedule today. This page charges the printed amounts and states the vintage rather than adjusting them.",
          sourceId: GP_ELECTRICAL_SOURCE_KEY,
          attribution: "Gulfport Electrical Permit Fee Schedule (FY 2002)",
        },
        {
          question: "How much is a mobile-home electrical permit in Gulfport?",
          answer:
            "$30.00 plus the $30.00 base fee — $60.00 — with the schedule's major-appliance charges applying to any circuits the home adds.",
          sourceId: GP_ELECTRICAL_SOURCE_KEY,
          attribution: "Gulfport Electrical Permit Fee Schedule (FY 2002)",
        },
      ],
      seoTitle: "Gulfport MS Electrical Permit Cost (Service Ladder & $6 Per Circuit)",
      seoDescription:
        "Gulfport electrical permit fees: $30 base fee, service entrance $10–$50 by amperage, feeders $6–$35, $6 per branch circuit, $0.25/amp sub-panels. FY 2002 schedule.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: GP_LAST_VERIFIED,
    },
    {
      jurisdictionKey: GP_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      slug: "plumbing-permit-cost",
      title: "Gulfport Plumbing Permit Cost",
      intro:
        "Gulfport plumbing permits are priced by Building Code Services from the department's plumbing fee schedule. Every permit pays the **$30.00 base fee**, then the fixture list: **$5.00 per standard fixture** (water closets, sinks, tubs, showers, disposals, dishwashers, washing machines and more), **$7.00** for lavatories and floor drains, **$10.00** for water heaters and heating appliances, **$50.00 for a water connection** — the list's largest row — and **$15.00** for a backflow preventer. Sprinkler heads price at $10.00 for the first five and $2.00 each after. The schedule carries an FY 2002 column heading, which the page states plainly.",
      localSummary:
        "Plumbing permits cover fixture installations and replacements, water and sewer connections, water heaters, gas service lines ($10.00), sprinkler systems and backflow prevention. Permits go to bonded master plumbers, and inspections are performed by Building Code Services; work covered before inspection must be uncovered. On the Mississippi Gulf Coast, backflow prevention and proper drain priming matter — the schedule prices trap-primed floor drains at $10.00 against $7.00 unprimed.",
      notIncluded:
        "This estimate covers the City of Gulfport plumbing permit fees only. It excludes:\n\n- **Water and sewer tap and connection charges** billed by Gulfport's water utility — the $50.00 schedule row is the permit fee for the connection work, not the utility's tap charge.\n- **Building, electrical and mechanical permits** for the same project.\n- **Gas company** meter and service charges (the $10.00 row prices the gas line permit itself).\n- **Harrison County septic permits** for property outside the sewer service area.\n- **State plumbing licensing** fees.",
      workedExample: {
        scenario:
          "A Gulfport bathroom remodel: three standard fixtures (water closet, tub/shower, disposal), one lavatory, one floor drain, a water-heater replacement, and a new water connection.",
        inputs: {
          valuationCents: 1_000_000,
          occupancy: "residential",
          workType: "alteration",
          fixtures: 3,
          custom: {
            lavatories: 1,
            floor_drains: 1,
            water_heaters: 1,
            water_service_connections: 1,
          },
        },
        notes:
          "Base fee: **$30.00**. Standard fixtures: 3 × $5.00 = **$15.00**. Lavatory: **$7.00**. Floor drain: **$7.00**. Water heater: **$10.00**. Water connection: **$50.00**. Total: **$119.00**.",
      },
      faqs: [
        {
          question: "How is a Gulfport plumbing permit fee calculated?",
          answer:
            "The $30.00 base fee plus a per-item charge from the fixture list: $5.00 for each standard fixture or appliance, $7.00 for lavatories and floor drains, $10.00 for water heaters and heating appliances, and specific amounts for connections and devices. A bathroom remodel with a toilet, tub, disposal, lavatory and water heater runs $30.00 + $15.00 + $7.00 + $10.00 = $62.00.",
          sourceId: GP_PLUMBING_SOURCE_KEY,
          attribution: "Gulfport Plumbing Permit Fee Schedule (FY 2002)",
        },
        {
          question: "What counts as a $5.00 fixture in Gulfport?",
          answer:
            "The schedule's five-dollar rows: fixtures generally, water closets, sinks, bath tubs, grease traps, urinals, laundry tubs, sewer connections, showers, water fountains, dishwashers, disposals, washing machines, swimming pools, kitchen ranges, hot plates and boilers.",
          sourceId: GP_PLUMBING_SOURCE_KEY,
          attribution: "Gulfport Plumbing Permit Fee Schedule (FY 2002)",
        },
        {
          question: "How much is a water heater permit in Gulfport?",
          answer:
            "$10.00 — the schedule prices both 'Water Heater/full auto' and 'Water Heater/Instant' at that amount — plus the $30.00 base fee, so a water heater alone is a $40.00 permit.",
          sourceId: GP_PLUMBING_SOURCE_KEY,
          attribution: "Gulfport Plumbing Permit Fee Schedule (FY 2002)",
        },
        {
          question: "Why is the water connection row $50.00?",
          answer:
            "The water connection is the schedule's largest plumbing row — five times a standard fixture — because it covers tying a building into the city's water system. It prices the permit for the connection work; the water utility's own tap and meter charges are billed separately.",
          sourceId: GP_PLUMBING_SOURCE_KEY,
          attribution: "Gulfport Plumbing Permit Fee Schedule (FY 2002)",
        },
        {
          question: "How are sprinkler heads priced on a Gulfport plumbing permit?",
          answer:
            "$10.00 covers sprinkler heads one through five, and each additional head is $2.00 — so a ten-head system is $10.00 + 5 × $2.00 = $20.00, on top of the $30.00 base fee.",
          sourceId: GP_PLUMBING_SOURCE_KEY,
          attribution: "Gulfport Plumbing Permit Fee Schedule (FY 2002)",
        },
        {
          question: "What does a floor drain cost to permit in Gulfport?",
          answer:
            "$7.00, or $10.00 with a trap primer. The schedule prices the primed version $3.00 higher because the primer device is additional equipment the inspector verifies.",
          sourceId: GP_PLUMBING_SOURCE_KEY,
          attribution: "Gulfport Plumbing Permit Fee Schedule (FY 2002)",
        },
        {
          question: "How much is a gas line permit in Gulfport?",
          answer:
            "$10.00 per gas service line, plus the $30.00 base fee. The same plumbing sheet carries the row — Gulfport permits gas piping through Building Code Services rather than through a separate gas board.",
          sourceId: GP_PLUMBING_SOURCE_KEY,
          attribution: "Gulfport Plumbing Permit Fee Schedule (FY 2002)",
        },
        {
          question: "Is the Gulfport plumbing fee schedule current?",
          answer:
            "The document's column is headed 'FY 2002 Permit Fee' and the department links it as its plumbing fee schedule today. This page charges the printed amounts and states the vintage rather than adjusting them.",
          sourceId: GP_PLUMBING_SOURCE_KEY,
          attribution: "Gulfport Plumbing Permit Fee Schedule (FY 2002)",
        },
      ],
      seoTitle: "Gulfport MS Plumbing Permit Cost ($5 Fixtures, $50 Water Connection)",
      seoDescription:
        "Gulfport plumbing permit fees: $30 base fee, $5 per fixture, $7 lavatories and floor drains, $10 water heaters, $50 water connection, $15 backflow preventer. FY 2002 schedule.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: GP_LAST_VERIFIED,
    },
  ],

  verifications: [
    {
      entityType: "jurisdiction_profile",
      entityKey: GP_KEYS.jurisdiction,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: GP_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Mississippi Expansion",
      sourceKey: "gulfport-bcs-page",
      notes:
        "Department identity, address, phone and document-center links verified from the Building Code Services page; mygulfport.us (Florida) ruled out.",
    },
    {
      entityType: "fee_schedule",
      entityKey: "gulfport-building-fee-schedule",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: GP_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Mississippi Expansion",
      sourceKey: GP_BUILDING_SOURCE_KEY,
      notes:
        "$30.00 base fee and both ladder bands verified against the PDF's table and closing prose; the prose rule and the printed rows agree arithmetically.",
    },
    {
      entityType: "fee_schedule",
      entityKey: "gulfport-electrical-fee-schedule",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: GP_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Mississippi Expansion",
      sourceKey: GP_ELECTRICAL_SOURCE_KEY,
      notes:
        "FY 2002 column heading recorded; service, feeder, sub-panel, branch-circuit, appliance, sign and miscellaneous rows transcribed from the layout-mode extraction.",
    },
    {
      entityType: "fee_schedule",
      entityKey: "gulfport-plumbing-fee-schedule",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: GP_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Mississippi Expansion",
      sourceKey: GP_PLUMBING_SOURCE_KEY,
      notes:
        "FY 2002 column heading recorded; fixture price list transcribed with garbled row/column pairs re-checked against the PDF structure before adoption.",
    },
    {
      entityType: "permit_page",
      entityKey: "building-permit-cost",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: GP_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Mississippi Expansion",
      sourceKey: GP_BUILDING_SOURCE_KEY,
      notes: "Passed editorial gate checks for the Gulfport building permit page.",
    },
    {
      entityType: "permit_page",
      entityKey: "electrical-permit-cost",
      permitTypeKey: "electrical",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: GP_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Mississippi Expansion",
      sourceKey: GP_ELECTRICAL_SOURCE_KEY,
      notes: "Passed editorial gate checks for the Gulfport electrical permit page.",
    },
    {
      entityType: "permit_page",
      entityKey: "plumbing-permit-cost",
      permitTypeKey: "plumbing",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: GP_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Mississippi Expansion",
      sourceKey: GP_PLUMBING_SOURCE_KEY,
      notes: "Passed editorial gate checks for the Gulfport plumbing permit page.",
    },
  ],
};
