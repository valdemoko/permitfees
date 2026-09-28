import type { JurisdictionSeed } from "@/content/seed-types";
import {
  HU_BUILDING_RULES,
  HU_ELECTRICAL_RULES,
  HU_FEE_EFFECTIVE_FROM,
  HU_PLUMBING_RULES,
  HU_SOURCE_KEY,
} from "@/content/huntington/fee-rules";

export const HU_LAST_VERIFIED = "2026-09-27";

export const HU_KEYS = {
  state: "wv",
  county: "cabell-county-wv",
  jurisdiction: "huntington-wv",
} as const;

const state = {
  code: "WV",
  slug: "west-virginia",
  name: "West Virginia",
  fipsCode: "54",
};

const county = {
  key: HU_KEYS.county,
  slug: "cabell-county-wv",
  name: "Cabell County",
  fipsCode: "54011",
};

const CITY_URL = "https://www.cityofhuntington.com";
const BUILDING_PERMIT_URL = `${CITY_URL}/business/building-permit/`;
const FEES_URL = `${CITY_URL}/business/building-permit/building-permit-fees/`;
const INSPECTIONS_URL = `${CITY_URL}/city-government/city-departments/inspections-permits/`;

const BUILDING_SCHEDULE_KEY = "huntington-building-fee-schedule";

export const huntingtonSeed: JurisdictionSeed = {
  state,
  county,

  jurisdiction: {
    key: HU_KEYS.jurisdiction,
    stateKey: HU_KEYS.state,
    countyKey: HU_KEYS.county,
    type: "city",
    slug: "huntington",
    name: "Huntington",
    officialName: "City of Huntington — Inspections & Permits Division",
    websiteUrl: CITY_URL,
    permitPortalUrl: FEES_URL,
    timezone: "America/New_York",
    isActive: true,
  },

  departments: [
    {
      key: "huntington-inspections-permits",
      jurisdictionKey: HU_KEYS.jurisdiction,
      kind: "building",
      name: "City of Huntington Inspections & Permits Division",
      phone: "(304) 696-5540 ext. 2003",
      email: "permits@huntingtonwv.gov",
      url: INSPECTIONS_URL,
      addressLine: "Room 100, City Hall, 800 Fifth Avenue, Huntington, WV 25701",
      hours: "Monday – Friday, 8:00 a.m. – 4:30 p.m. ET",
      notes:
        "The division issues building, electrical and plumbing permits and staffs inspectors for each of the three; permit technician Kim Estep handles intake.",
    },
  ],

  sources: [
    {
      key: HU_SOURCE_KEY,
      jurisdictionKey: HU_KEYS.jurisdiction,
      title: "City of Huntington — Building Permit Fee Schedule (IBC 2000 §108.2 valuation ladder)",
      url: FEES_URL,
      sourceType: "fee_schedule_pdf",
      issuingAuthority: "City of Huntington Inspections & Permits Division",
      authorityKind: "city",
      isPrimary: true,
      documentDate: null,
      effectiveFrom: HU_FEE_EFFECTIVE_FROM,
      retrievedAt: HU_LAST_VERIFIED,
      lastVerifiedAt: HU_LAST_VERIFIED,
      notes:
        "Undated. Header: 'The fee schedule is outlined in Section 108.2 of the International Building Code 2000 and requires a fee for each plan examination, building permit, and inspection ... The permit fee is calculated based on the total project cost (labor and materials). An additional $20 application fee is required per building permit.' Text layer present; the ~100 printed rows reproduce the segmented ladder in fee-rules.ts to the cent. Dated here at the read date because the document prints none.",
    },
    {
      key: "huntington-building-permit-page",
      jurisdictionKey: HU_KEYS.jurisdiction,
      title: "City of Huntington — Building Permit",
      url: BUILDING_PERMIT_URL,
      sourceType: "municipal_website",
      issuingAuthority: "City of Huntington",
      authorityKind: "city",
      isPrimary: true,
      documentDate: null,
      effectiveFrom: null,
      retrievedAt: HU_LAST_VERIFIED,
      lastVerifiedAt: HU_LAST_VERIFIED,
      notes:
        "States the codes in force (IBC 2018, IPC 2018, NEC 2020, NFPA 1 21st ed.), that 'Building Permit Fee is determined by the cost of labor and materials for the project', and the $20.00 application fee per building permit.",
    },
    {
      key: "huntington-inspections-page",
      jurisdictionKey: HU_KEYS.jurisdiction,
      title: "City of Huntington — Inspections & Permits Division",
      url: INSPECTIONS_URL,
      sourceType: "municipal_website",
      issuingAuthority: "City of Huntington",
      authorityKind: "city",
      isPrimary: true,
      documentDate: null,
      effectiveFrom: null,
      retrievedAt: HU_LAST_VERIFIED,
      lastVerifiedAt: HU_LAST_VERIFIED,
      notes:
        "Names the division, its address (Room 100, City Hall), its contact details and its three inspectors — building, electrical and plumbing — which is the basis for treating the division's single published schedule as the schedule for all three trades.",
    },
  ],

  permitTypes: [],
  projectTypes: [],

  jurisdictionPermitTypes: [
    {
      jurisdictionKey: HU_KEYS.jurisdiction,
      permitTypeKey: "building",
      isAvailable: true,
      localName: "Building Permit",
      officialUrl: FEES_URL,
      notes:
        "Priced on total project cost by the IBC 2000 §108.2 ladder, plus a $20.00 application fee on every building permit.",
    },
    {
      jurisdictionKey: HU_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      isAvailable: true,
      localName: "Electrical Permit",
      officialUrl: INSPECTIONS_URL,
      notes:
        "Issued and inspected by the same division, which publishes one combined schedule for permits and inspections; priced on the same project-cost ladder plus the $20.00 application fee. The City posts no electrical-specific table.",
    },
    {
      jurisdictionKey: HU_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      isAvailable: true,
      localName: "Plumbing Permit",
      officialUrl: INSPECTIONS_URL,
      notes:
        "Issued and inspected by the same division; priced on the same project-cost ladder plus the $20.00 application fee. The City posts no plumbing-specific table.",
    },
  ],

  feeSchedules: [
    {
      key: BUILDING_SCHEDULE_KEY,
      jurisdictionKey: HU_KEYS.jurisdiction,
      sourceKey: HU_SOURCE_KEY,
      title: "Huntington Building Permit Fee Schedule (IBC 2000 §108.2)",
      officialUrl: FEES_URL,
      effectiveFrom: HU_FEE_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: HU_LAST_VERIFIED,
      notes:
        "Undated on its face; carried at the read date. It is the only fee schedule the division publishes and it covers plan examination, permits and inspections generally.",
    },
  ],

  feeRules: [
    ...HU_BUILDING_RULES.map((rule) => ({
      jurisdictionKey: HU_KEYS.jurisdiction,
      permitTypeKey: "building",
      scheduleKey: BUILDING_SCHEDULE_KEY,
      rule,
    })),
    ...HU_ELECTRICAL_RULES.map((rule) => ({
      jurisdictionKey: HU_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      scheduleKey: BUILDING_SCHEDULE_KEY,
      rule,
    })),
    ...HU_PLUMBING_RULES.map((rule) => ({
      jurisdictionKey: HU_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      scheduleKey: BUILDING_SCHEDULE_KEY,
      rule,
    })),
  ],

  requirements: [
    {
      jurisdictionKey: HU_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "document",
      title: "Project cost stated as labour and materials",
      description:
        "The fee is determined by 'the cost of labor and materials for the project', and the schedule prices total project cost — so the declared contract cost is what the ladder reads.",
      isMandatory: true,
      sortOrder: 1,
      sourceKey: "huntington-building-permit-page",
      lastVerifiedAt: HU_LAST_VERIFIED,
    },
    {
      jurisdictionKey: HU_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "license",
      title: "Licensed contractor",
      description:
        "Permits are pulled by licensed contractors through the Inspections & Permits Division; the division's inspectors cover building, electrical and plumbing work.",
      isMandatory: true,
      sortOrder: 2,
      sourceKey: "huntington-inspections-page",
      lastVerifiedAt: HU_LAST_VERIFIED,
    },
    {
      jurisdictionKey: HU_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "other",
      title: "Permit required for construction and alterations",
      description:
        "The Building Permit page quotes Article 1711.05 of the City code (permit required) and the current adopted codes — IBC 2018, IPC 2018, NEC 2020 and NFPA 1, 21st edition.",
      isMandatory: true,
      sortOrder: 3,
      sourceKey: "huntington-building-permit-page",
      lastVerifiedAt: HU_LAST_VERIFIED,
    },
  ],

  profile: {
    jurisdictionKey: HU_KEYS.jurisdiction,
    headline: "Huntington, West Virginia Permit Fees & Inspections",
    summary:
      "Huntington's Inspections & Permits Division, in Room 100 of City Hall at 800 Fifth Avenue, issues building, electrical and plumbing permits and performs all three inspections. Its only published fee schedule is the **IBC 2000 §108.2 valuation ladder**, which prices **total project cost (labour and materials)** and adds a **$20.00 application fee to every permit**. The ladder charges nothing to $499, a flat **$20.00 to $1,100**, then rises in printed bands: **$32.50 plus $6.00 per $1,000** to $25,000, **$4.50 per $1,000** to $44,000, four printed bands to $50,000, **$283.00 plus $3.00 per $1,000** to $100,000, and **$433.00 plus $2.50 per $1,000 and each part thereof** above that. A $60,000 project pays **$333.00** in all.",
    localContext:
      "Huntington is the seat of Cabell County on the Ohio River, and the division that permits it is small enough to publish one schedule for everything it does: its page names three inspectors — building, electrical and plumbing — and its fee document says the schedule covers 'each plan examination, building permit, and inspection'. That single instrument has been in place long enough that it still cites the International Building Code 2000's §108.2 even though the City now enforces the 2018 IBC.\n\nThe practical consequence is that electrical and plumbing work is priced on the same project-cost ladder as the building permit, because the division publishes no trade-specific table. The pages say so, and a reader who needs a figure the division quotes at the counter can call it.",
    valuationBasis:
      "Every permit is computed from total project cost — labour and materials — as the fee page's own sentence states. The printed ladder is $1,000 wide from $2,001 upward, with the closing note 'each part thereof' above $100,000, so a partial thousand pays the whole step in that band.",
    notIncluded:
      "These figures cover City of Huntington permit fees only. They exclude:\n\n- **Plan examination and inspection fees** that are separate line items where the division charges them at the counter.\n- **Zoning and Board of Zoning Appeals** approvals for use changes and variances.\n- **Ohio River flood-plain development permits** and elevation documentation where they apply.\n- **Cabell County and West Virginia state permits** — septic systems, roads and rights-of-way.\n- **Utility connection charges** from Huntington's water and sewer systems.\n- **Fire-suppression plan review** by the fire marshal.",
    seoTitle: "Huntington WV Permit Fees | Inspections & Permits Division Schedule",
    seoDescription:
      "Huntington, WV permit fees: the IBC §108.2 project-cost ladder from $0 to $499, $20 flat to $1,100, then marginal bands to $2.50 per $1,000 above $100,000, plus a $20 application fee.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: HU_LAST_VERIFIED,
  },

  permitPages: [
    {
      jurisdictionKey: HU_KEYS.jurisdiction,
      permitTypeKey: "building",
      slug: "building-permit-cost",
      title: "Huntington Building Permit Cost",
      intro:
        "A Huntington building permit is priced by the Inspections & Permits Division from **total project cost (labour and materials)** on the division's IBC 2000 §108.2 schedule, plus a **$20.00 application fee on every permit**. The ladder charges nothing up to $499; a flat **$20.00** from $500 to $1,100; **$20.00 plus $1.50 per $100 band** to $2,000; **$32.50 plus $6.00 per $1,000** to $25,000; **$4.50 per $1,000** to $44,000; four printed bands to $50,000; **$283.00 plus $3.00 per $1,000** to $100,000; and **$433.00 plus $2.50 per $1,000 and each part thereof** above $100,000. A $60,000 project pays **$313.00** of fee plus the $20.00 application fee — **$333.00**.",
      localSummary:
        "Huntington enforces the 2018 International Building Code, the 2018 IPC, the 2020 NEC and NFPA 1 under City code Article 1711.05, but its fee ladder still cites IBC 2000 §108.2 and applies to plan examination, the permit and inspections alike. Applications go to Room 100 of City Hall at 800 Fifth Avenue; the division's three inspectors cover building, electrical and plumbing.",
      notIncluded:
        "This estimate covers the City of Huntington building permit fee and its $20.00 application fee. It excludes:\n\n- **Separate plan-examination or inspection charges** where the division assesses them.\n- **Electrical and plumbing permits**, priced on the division's same schedule on their own pages.\n- **Zoning approval** and any flood-plain development permit.\n- **Cabell County and state permits** for septic, driveway and right-of-way work.\n- **Utility taps and capacity charges.**",
      workedExample: {
        scenario:
          "A commercial renovation in Huntington with a total project cost of $60,000.",
        inputs: {
          valuationCents: 6_000_000,
          squareFootage: 3_500,
          occupancy: "commercial",
          workType: "alteration",
        },
        notes:
          "Ladder: **$283.00** (the $50,000 base) **+ $3.00 × 10** whole $1,000 bands = **$313.00**. Application fee: **$20.00**. Total: **$333.00**. The printed row for $59,001–$60,000 also reads $313.00.",
      },
      faqs: [
        {
          question: "How is a Huntington building permit fee calculated?",
          answer:
            "From total project cost — labour and materials — on the division's IBC 2000 §108.2 ladder, plus a $20.00 application fee. Small jobs pay nothing to $499 and a flat $20.00 to $1,100; larger jobs move through marginal bands from $1.50 per $100 up to $2.50 per $1,000 above $100,000.",
          sourceId: HU_SOURCE_KEY,
          attribution: "City of Huntington Building Permit Fee Schedule",
        },
        {
          question: "What is the minimum building permit fee in Huntington?",
          answer:
            "Nothing at all up to $499.00 of project cost. From $500.00 to $1,100.00 the fee is a flat $20.00, and the $20.00 application fee is required on every building permit.",
          sourceId: HU_SOURCE_KEY,
          attribution: "City of Huntington Building Permit Fee Schedule",
        },
        {
          question: "How much is a building permit for a $500,000 project in Huntington?",
          answer:
            "Above $100,000 the schedule adds $2.50 for each $1,000 and each part thereof to the $433.00 it reaches at $100,000. At $500,000 that is $433.00 + 400 × $2.50 = $1,433.00, plus the $20.00 application fee.",
          sourceId: HU_SOURCE_KEY,
          attribution: "City of Huntington Building Permit Fee Schedule",
        },
        {
          question: "Does the City round project cost up to a whole $1,000?",
          answer:
            "In the upper bands, yes. The closing note says to add $2.50 per $1,000 'and each part thereof', so a partial thousand pays a whole step above $100,000. The middle bands are printed $1,000 ranges, which have the same effect.",
          sourceId: HU_SOURCE_KEY,
          attribution: "City of Huntington Building Permit Fee Schedule",
        },
        {
          question: "Which building code does Huntington enforce?",
          answer:
            "The Building Permit page lists IBC 2018, IPC 2018, NEC 2020 and NFPA 1, 21st edition, under City code Article 1711.05 — even though the fee schedule's own text still cites IBC 2000 §108.2.",
          sourceId: "huntington-building-permit-page",
          attribution: "City of Huntington — Building Permit",
        },
        {
          question: "Is there an application fee on top of the permit fee?",
          answer:
            "Yes — the fees page and the permit page both state that an additional $20.00 application fee is required per building permit.",
          sourceId: HU_SOURCE_KEY,
          attribution: "City of Huntington Building Permit Fee Schedule",
        },
      ],
      seoTitle: "Huntington WV Building Permit Cost (IBC §108.2 Valuation Ladder)",
      seoDescription:
        "Huntington WV building permit fees: free to $499, $20 flat to $1,100, marginal bands to $433 + $2.50 per $1,000 above $100,000, plus a $20 application fee.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: HU_LAST_VERIFIED,
    },
    {
      jurisdictionKey: HU_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      slug: "electrical-permit-cost",
      title: "Huntington Electrical Permit Cost",
      intro:
        "Huntington electrical permits are issued and inspected by the same Inspections & Permits Division that issues building permits, and the division publishes **one combined fee schedule** — IBC 2000 §108.2 — for 'each plan examination, building permit, and inspection'. Electrical work is therefore priced on **total project cost** through the same ladder: nothing to $499, a flat **$20.00** to $1,100, then bands rising from $1.50 per $100 to **$6.00 per $1,000** to $25,000, **$4.50 per $1,000** to $50,000 and **$3.00 per $1,000** to $100,000, and **$2.50 per $1,000 and each part thereof** above — with the **$20.00 application fee** on every permit. The City publishes no electrical-specific table, and this page says so rather than presenting one.",
      localSummary:
        "The division's three inspectors cover building, electrical and plumbing, and its page is the only public description of the electrical permit. The fee document's own sentence — 'a fee for each plan examination, building permit, and inspection' — is why electrical work is priced on the same ladder: there is no separate trade schedule to read. A $150,000 electrical job pays $558.00 of fee plus $20.00.",
      notIncluded:
        "This estimate covers the City of Huntington fee for electrical permits on the division's combined schedule. It excludes:\n\n- **A separate electrical trade table** — the City publishes none, so this page prices what the division's one schedule states.\n- **Building and plumbing permits** for the same project.\n- **Appalachian Power** service connection, metering and transformer charges.\n- **State electrical licensing** fees.\n- **Plan review or inspection charges** the division assesses as their own line at the counter.",
      workedExample: {
        scenario:
          "An electrical-only project in Huntington with a total job cost of $150,000.",
        inputs: {
          valuationCents: 15_000_000,
          occupancy: "commercial",
          workType: "alteration",
        },
        notes:
          "Above $100,000: **$433.00 + $2.50 × 50** whole-or-part $1,000 bands = **$558.00**. Application fee: **$20.00**. Total: **$578.00**.",
      },
      faqs: [
        {
          question: "Does Huntington have an electrical permit fee table?",
          answer:
            "No. The City publishes one combined schedule (IBC 2000 §108.2) for plan examination, permits and inspections, and its inspectors cover electrical work, so electrical permits are priced on the same project-cost ladder. This page states that rather than inventing a separate table.",
          sourceId: "huntington-inspections-page",
          attribution: "City of Huntington — Inspections & Permits Division",
        },
        {
          question: "How much is an electrical permit for a $50,000 job in Huntington?",
          answer:
            "The ladder charges $283.00 at $50,000 — $283.00 being the base the schedule prints for $50,001–$51,000 — plus the $20.00 application fee, so $303.00 in all.",
          sourceId: HU_SOURCE_KEY,
          attribution: "City of Huntington Building Permit Fee Schedule",
        },
        {
          question: "Is the $20.00 application fee charged on electrical permits too?",
          answer:
            "Yes. It is required per permit on the division's single schedule, which covers electrical permits as well as building ones.",
          sourceId: HU_SOURCE_KEY,
          attribution: "City of Huntington Building Permit Fee Schedule",
        },
        {
          question: "How much is an electrical permit on a small project?",
          answer:
            "Nothing at all for total project cost up to $499.00; a flat $20.00 from $500.00 to $1,100.00 — plus the $20.00 application fee either way.",
          sourceId: HU_SOURCE_KEY,
          attribution: "City of Huntington Building Permit Fee Schedule",
        },
      ],
      seoTitle: "Huntington WV Electrical Permit Cost (Combined Division Schedule)",
      seoDescription:
        "Huntington WV electrical permits are priced on the division's single IBC §108.2 project-cost ladder plus a $20 application fee; the City publishes no separate trade table.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: HU_LAST_VERIFIED,
    },
    {
      jurisdictionKey: HU_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      slug: "plumbing-permit-cost",
      title: "Huntington Plumbing Permit Cost",
      intro:
        "Huntington plumbing permits are issued and inspected by the Inspections & Permits Division, which publishes **one combined fee schedule** for permits and inspections rather than per-trade tables. Plumbing work is therefore priced on **total project cost** through the same IBC 2000 §108.2 ladder: nothing to $499, a flat **$20.00** to $1,100, then **$1.50 per $100 band** to $2,000, **$6.00 per $1,000** to $25,000, **$4.50 per $1,000** to $50,000, **$3.00 per $1,000** to $100,000 and **$2.50 per $1,000 and each part thereof** above — with the **$20.00 application fee** on every permit. A $15,000 plumbing job pays $110.50 of fee plus $20.00.",
      localSummary:
        "Plumbing permits cover fixture work, water and drain lines and sewer connections inside city limits, inspected by the division's own plumbing inspector. The City posts no plumbing-specific schedule, so this page prices the division's published ladder for the cost of the work and names that fact plainly rather than presenting an invented trade table.",
      notIncluded:
        "This estimate covers the City of Huntington fee for plumbing permits on the division's combined schedule. It excludes:\n\n- **A separate plumbing trade table** — the City publishes none.\n- **Building and electrical permits** for the same project.\n- **Sewer and water tap charges** billed by the City's utilities.\n- **Cabell County septic and well permits** outside the sewer service area.\n- **State plumbing licensing** fees.",
      workedExample: {
        scenario:
          "A plumbing-only project in Huntington with a total job cost of $15,000.",
        inputs: {
          valuationCents: 1_500_000,
          occupancy: "residential",
          workType: "alteration",
        },
        notes:
          "Band $2,001–$25,000: **$32.50 + $6.00 × 13** whole $1,000 bands = **$110.50**. Application fee: **$20.00**. Total: **$130.50**.",
      },
      faqs: [
        {
          question: "How much is a plumbing permit in Huntington, West Virginia?",
          answer:
            "It is priced on the division's one combined schedule at total project cost, plus a $20.00 application fee: $110.50 of fee on a $15,000 job, for example. The City publishes no plumbing-only fee table.",
          sourceId: HU_SOURCE_KEY,
          attribution: "City of Huntington Building Permit Fee Schedule",
        },
        {
          question: "Why does this page use the building ladder for plumbing?",
          answer:
            "Because the division's fee document states it covers 'each plan examination, building permit, and inspection', its inspectors include a plumbing inspector, and no plumbing-specific schedule exists on the City's site. Pricing the published schedule and saying so is the honest treatment.",
          sourceId: "huntington-inspections-page",
          attribution: "City of Huntington — Inspections & Permits Division",
        },
        {
          question: "How much is a small plumbing permit in Huntington?",
          answer:
            "Nothing for project cost up to $499.00 and a flat $20.00 from $500.00 to $1,100.00 — plus the $20.00 application fee on the permit.",
          sourceId: HU_SOURCE_KEY,
          attribution: "City of Huntington Building Permit Fee Schedule",
        },
        {
          question: "Is a water heater replacement priced by this ladder?",
          answer:
            "It is priced on the cost of the labour and materials for the work, which is what the schedule reads. Where a replacement is small enough to fall under $499.00, no permit fee is charged, though the application fee still applies.",
          sourceId: HU_SOURCE_KEY,
          attribution: "City of Huntington Building Permit Fee Schedule",
        },
      ],
      seoTitle: "Huntington WV Plumbing Permit Cost (Combined Division Schedule)",
      seoDescription:
        "Huntington WV plumbing permits are priced on the division's single IBC §108.2 project-cost ladder plus a $20 application fee; the City publishes no separate plumbing table.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: HU_LAST_VERIFIED,
    },
  ],

  verifications: [
    {
      entityType: "source",
      entityKey: HU_SOURCE_KEY,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: HU_LAST_VERIFIED,
      verifiedBy: null,
      sourceKey: HU_SOURCE_KEY,
      notes:
        "Text-layer PDF read with pdftotext; every printed band reproduced by the segmented ladder, including the printed $60,000 ($313.00), $150,000 ($558.00) and $15,000 ($110.50) checkpoints.",
    },
    {
      entityType: "fee_rule",
      entityKey: "HU-BLD-2001-25000",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: HU_LAST_VERIFIED,
      verifiedBy: null,
      sourceKey: HU_SOURCE_KEY,
      notes: "$32.50 + $6.00 per $1,000 reproduces every printed row from $38.50 at $2,001 to $170.50 at $25,000.",
    },
    {
      entityType: "fee_rule",
      entityKey: "HU-BLD-OVER-100K",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: HU_LAST_VERIFIED,
      verifiedBy: null,
      sourceKey: HU_SOURCE_KEY,
      notes: "The schedule's closing note; $433.00 + $2.50 per $1,000 gives $558.00 at $150,000 as the research doc records.",
    },
    {
      entityType: "fee_rule",
      entityKey: "HU-ELEC-OVER-100K",
      permitTypeKey: "electrical",
      status: "needs_review",
      method: "official_pdf_review",
      verifiedAt: HU_LAST_VERIFIED,
      verifiedBy: null,
      sourceKey: HU_SOURCE_KEY,
      notes:
        "The ladder itself is verified; applying it to the electrical trade is the documented reading of the division's one combined schedule (no electrical table is published), recorded rather than treated as certain.",
    },
    {
      entityType: "fee_rule",
      entityKey: "HU-PLUMB-OVER-100K",
      permitTypeKey: "plumbing",
      status: "needs_review",
      method: "official_pdf_review",
      verifiedAt: HU_LAST_VERIFIED,
      verifiedBy: null,
      sourceKey: HU_SOURCE_KEY,
      notes:
        "Same as the electrical note: the ladder is verified, its application to plumbing rests on the division's combined schedule and its plumbing inspector.",
    },
    {
      entityType: "permit_page",
      entityKey: "building-permit-cost",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: HU_LAST_VERIFIED,
      verifiedBy: null,
      sourceKey: HU_SOURCE_KEY,
      notes: null,
    },
    {
      entityType: "permit_page",
      entityKey: "electrical-permit-cost",
      permitTypeKey: "electrical",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: HU_LAST_VERIFIED,
      verifiedBy: null,
      sourceKey: "huntington-inspections-page",
      notes: null,
    },
    {
      entityType: "permit_page",
      entityKey: "plumbing-permit-cost",
      permitTypeKey: "plumbing",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: HU_LAST_VERIFIED,
      verifiedBy: null,
      sourceKey: "huntington-inspections-page",
      notes: null,
    },
    {
      entityType: "jurisdiction_profile",
      entityKey: HU_KEYS.jurisdiction,
      status: "verified",
      method: "manual_review",
      verifiedAt: HU_LAST_VERIFIED,
      verifiedBy: null,
      sourceKey: "huntington-inspections-page",
      notes: null,
    },
  ],
};
