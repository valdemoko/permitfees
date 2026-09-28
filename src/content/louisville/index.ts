import type { JurisdictionSeed } from "@/content/seed-types";
import {
  KY_STATE_PLUMBING_EFFECTIVE_FROM,
  LOU_BUILDING_RULES,
  LOU_BUILDING_SOURCE_KEY,
  LOU_ELECTRICAL_RULES,
  LOU_ELECTRICAL_SOURCE_KEY,
  LOU_FEE_EFFECTIVE_FROM,
  LOU_PLUMBING_RULES,
  LOU_PLUMBING_SOURCE_KEY,
} from "@/content/louisville/fee-rules";

export const LOU_LAST_VERIFIED = "2026-09-26";

export const LOU_KEYS = {
  state: "ky",
  county: "jefferson-county-ky",
  jurisdiction: "louisville",
} as const;

const state = {
  code: "KY",
  slug: "kentucky",
  name: "Kentucky",
  fipsCode: "21",
};

const county = {
  key: LOU_KEYS.county,
  slug: "jefferson-county-ky",
  name: "Jefferson County",
  fipsCode: "21111",
};

const CITY_URL = "https://louisvilleky.gov";
const CR_URL = `${CITY_URL}/government/construction-review`;
const FEES_URL = `${CITY_URL}/government/construction-review/permit-fees`;
const FEES_PDF_URL = `${CITY_URL}/sites/default/files/2025-05/promulgated-permit-fees-february-20240pdf.pdf`;
const KY_DHBC_PLUMBING_URL = "https://dhbc.ky.gov/newstatic_info.aspx?static_id=337";
const KY_KAR_PLUMBING_URL = "https://apps.legislature.ky.gov/law/kar/titles/815/020/050/";

export const louisvilleSeed: JurisdictionSeed = {
  state,
  county,

  jurisdiction: {
    key: LOU_KEYS.jurisdiction,
    stateKey: LOU_KEYS.state,
    countyKey: LOU_KEYS.county,
    type: "city",
    slug: "louisville",
    name: "Louisville",
    officialName:
      "Louisville-Jefferson County Metro Government — Office of Construction Review, Division of Codes and Regulations",
    websiteUrl: CITY_URL,
    permitPortalUrl: CR_URL,
    timezone: "America/New_York",
    isActive: true,
  },

  departments: [
    {
      key: "louisville-construction-review",
      jurisdictionKey: LOU_KEYS.jurisdiction,
      kind: "building",
      name: "Louisville Metro Construction Review",
      phone: "(502) 574-3321",
      email: null,
      url: CR_URL,
      addressLine: "444 S. 5th Street, Louisville, KY 40202",
      hours:
        "Customer Service 8:00 a.m. – 5:00 p.m. ET, Monday – Friday; Cashier 8:00 a.m. – 4:30 p.m.; Plan Review 8:00 a.m. – 5:00 p.m.",
      notes:
        "The Office of Construction Review, a Division of Codes and Regulations, issues construction permits and performs inspections under LMCO Chapter 150.096 promulgated fees.",
    },
  ],

  sources: [
    {
      key: LOU_BUILDING_SOURCE_KEY,
      jurisdictionKey: LOU_KEYS.jurisdiction,
      title:
        "Louisville Metro — Promulgated Permit Fees & Regulations (LMCO Ch. 150.096), revised February 6, 2024",
      url: FEES_PDF_URL,
      sourceType: "fee_schedule_pdf",
      issuingAuthority:
        "Louisville-Jefferson County Metro Government, Office of Construction Review",
      authorityKind: "city",
      isPrimary: true,
      documentDate: "2024-02-06",
      effectiveFrom: LOU_FEE_EFFECTIVE_FROM,
      retrievedAt: "2026-09-26",
      lastVerifiedAt: LOU_LAST_VERIFIED,
      notes:
        "Promulgated fee schedule under LMCO 150.096: Building & Tent per-square-foot table by KBC occupancy with the $75 permit minimum (item 10), the $50 + $2.50/$1,000 estimated-cost ladder (item 3), plan review at the greater of $30 or one third the permit fee (item 5), foundation-only fees (item 7), and the electrical schedule (items 1-8). Table and prose cross-checked in the layout-mode extraction.",
    },
    {
      key: LOU_PLUMBING_SOURCE_KEY,
      jurisdictionKey: LOU_KEYS.jurisdiction,
      title:
        "Kentucky 815 KAR 20:050 — State Plumbing Permit Fees (Division of Plumbing, DHBC)",
      url: KY_KAR_PLUMBING_URL,
      sourceType: "ordinance",
      issuingAuthority:
        "Kentucky Department of Housing, Buildings and Construction — Division of Plumbing",
      authorityKind: "state",
      isPrimary: true,
      documentDate: "2021-07-06",
      effectiveFrom: KY_STATE_PLUMBING_EFFECTIVE_FROM,
      retrievedAt: "2026-09-26",
      lastVerifiedAt: LOU_LAST_VERIFIED,
      notes:
        "Kentucky administrative regulation fixing plumbing permit fees statewide: $50 base plus $14 per opening (residential 1-2 family) or $20 per opening (all other buildings), a single water heater replacement at $50 flat, five inspections included and $50 per additional inspection. Last amended by 48 Ky.R. 629, effective 3-1-2022. Regulation text read from the Legislature's page via an Internet Archive snapshot (2024-09-27); cross-checked against dhbc.ky.gov's Division of Plumbing summary.",
    },
    {
      key: "louisville-cr-page",
      jurisdictionKey: LOU_KEYS.jurisdiction,
      title: "Louisville Metro Construction Review — Permit Fees page",
      url: FEES_URL,
      sourceType: "municipal_website",
      issuingAuthority: "Louisville-Jefferson County Metro Government",
      authorityKind: "city",
      isPrimary: true,
      documentDate: null,
      effectiveFrom: null,
      retrievedAt: "2026-09-26",
      lastVerifiedAt: LOU_LAST_VERIFIED,
      notes:
        "Construction Review's Permit Fees page, restating the promulgated rows in prose (per-sq-ft occupancy table, $50 + $2.50 per $1,000 estimated cost, wrecking, signs, parking lots) and linking the promulgated-fees PDF; the department's address (444 S. 5th Street) and phone are verified from the Construction Review contact block.",
    },
    {
      key: "ky-dhbc-plumbing-page",
      jurisdictionKey: LOU_KEYS.jurisdiction,
      title: "Kentucky DHBC — Division of Plumbing (statewide plumbing permitting)",
      url: KY_DHBC_PLUMBING_URL,
      sourceType: "state_agency",
      issuingAuthority: "Kentucky Department of Housing, Buildings and Construction",
      authorityKind: "state",
      isPrimary: true,
      documentDate: null,
      effectiveFrom: null,
      retrievedAt: "2026-09-26",
      lastVerifiedAt: LOU_LAST_VERIFIED,
      notes:
        "Confirms the Division of Plumbing issues plumbing construction permits statewide — 'No person, firm or corporation shall construct, install or alter any plumbing without first having procured a plumbing construction permit from the Division of Plumbing' — and summarizes the fee schedule: $50 base, $14 per opening residential, $20 commercial.",
    },
  ],

  permitTypes: [],
  projectTypes: [],

  jurisdictionPermitTypes: [
    {
      jurisdictionKey: LOU_KEYS.jurisdiction,
      permitTypeKey: "building",
      isAvailable: true,
      localName: "Construction Permit (Building)",
      officialUrl: FEES_PDF_URL,
      notes:
        "Priced per square foot by KBC occupancy type ($.105 for 1-2 family residential through $.16), or by the $50 + $2.50/$1,000 estimated-cost ladder where area cannot be calculated; $75 permit minimum.",
    },
    {
      jurisdictionKey: LOU_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      isAvailable: true,
      localName: "Electrical Permit",
      officialUrl: FEES_PDF_URL,
      notes:
        "Electrical items 1-8 of the promulgated schedule: $200 initial 1-2 family installation, $150 condo/patio-home base, $100 other-than-residence base, service amperes at $.25/amp to 600 and $.50 over, $85 temporary pole, $50 additional inspections.",
    },
    {
      jurisdictionKey: LOU_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      isAvailable: true,
      localName: "State Plumbing Permit",
      officialUrl: KY_KAR_PLUMBING_URL,
      notes:
        "Plumbing permits in Louisville are issued by Kentucky's Division of Plumbing under 815 KAR 20:050 — $50 base plus $14/$20 per opening; the promulgated local schedule has no plumbing section.",
    },
  ],

  feeSchedules: [
    {
      key: "louisville-promulgated-fees",
      jurisdictionKey: LOU_KEYS.jurisdiction,
      sourceKey: LOU_BUILDING_SOURCE_KEY,
      title: "Louisville Promulgated Permit Fees & Regulations (LMCO 150.096)",
      officialUrl: FEES_PDF_URL,
      effectiveFrom: LOU_FEE_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: LOU_LAST_VERIFIED,
      notes:
        "Revised 2/6/2024. Covers building and electrical permit fees for Construction Review; the $75 minimum dates to the 2018-07-01 fee change.",
    },
    {
      key: "ky-state-plumbing-fees",
      jurisdictionKey: LOU_KEYS.jurisdiction,
      sourceKey: LOU_PLUMBING_SOURCE_KEY,
      title: "Kentucky State Plumbing Permit Fees (815 KAR 20:050)",
      officialUrl: KY_KAR_PLUMBING_URL,
      effectiveFrom: KY_STATE_PLUMBING_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: LOU_LAST_VERIFIED,
      notes:
        "Statewide regulation, effective in its current form since 2022-03-01, charged on plumbing work inside Louisville Metro because the state Division of Plumbing — not Metro government — permits and inspects plumbing.",
    },
  ],

  feeRules: [
    ...LOU_BUILDING_RULES.map((rule) => ({
      jurisdictionKey: LOU_KEYS.jurisdiction,
      permitTypeKey: "building",
      scheduleKey: "louisville-promulgated-fees",
      rule,
    })),
    ...LOU_ELECTRICAL_RULES.map((rule) => ({
      jurisdictionKey: LOU_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      scheduleKey: "louisville-promulgated-fees",
      rule,
    })),
    ...LOU_PLUMBING_RULES.map((rule) => ({
      jurisdictionKey: LOU_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      scheduleKey: "ky-state-plumbing-fees",
      rule,
    })),
  ],

  requirements: [
    {
      jurisdictionKey: LOU_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "document",
      title: "Construction documents for plan review",
      description:
        "Applications for permits that require review go in with complete construction documents; Construction Review conducts a plan review before issuance, and a fast-track elective allows early site/foundation, shell and phased approvals (foundation-only fees apply to the foundation stage).",
      isMandatory: true,
      sortOrder: 1,
      sourceKey: LOU_BUILDING_SOURCE_KEY,
      lastVerifiedAt: LOU_LAST_VERIFIED,
    },
    {
      jurisdictionKey: LOU_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "other",
      title: "Outstanding-code-violation search before issuance (residential)",
      description:
        "Before a building permit issues for a one/two-family or multi-family residential project, the Department searches its records for unresolved or uncured Building Code violations against the applicant and withholds issuance until they are removed, cured or corrected (item 11, revised 6/8/2023).",
      isMandatory: true,
      sortOrder: 2,
      sourceKey: LOU_BUILDING_SOURCE_KEY,
      lastVerifiedAt: LOU_LAST_VERIFIED,
    },
    {
      jurisdictionKey: LOU_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      requirementType: "license",
      title: "Kentucky electrical license",
      description:
        "Electrical permits are issued through Construction Review against licensed electrical work; the Commonwealth of Kentucky (Office of Housing, Buildings and Construction) licenses Electrical Contractors, Master Electricians and Electricians statewide.",
      isMandatory: true,
      sortOrder: 3,
      sourceKey: "louisville-cr-page",
      lastVerifiedAt: LOU_LAST_VERIFIED,
    },
    {
      jurisdictionKey: LOU_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      requirementType: "license",
      title: "State-licensed master plumber",
      description:
        "Plumbing work is permitted through Kentucky's Division of Plumbing and must be performed under a licensed master plumber holding the state permit; Louisville Metro has no local plumbing permitting role.",
      isMandatory: true,
      sortOrder: 4,
      sourceKey: "ky-dhbc-plumbing-page",
      lastVerifiedAt: LOU_LAST_VERIFIED,
    },
  ],

  profile: {
    jurisdictionKey: LOU_KEYS.jurisdiction,
    headline: "Louisville, Kentucky Permit Fees — Construction Review",
    summary:
      "Louisville Metro prices construction permits through the Office of Construction Review under **LMCO Chapter 150.096 promulgated fees**, revised February 6, 2024. Building permits for new construction charge **by occupancy type per square foot** — **$0.105 for one- and two-family residential**, $0.14–$0.16 for most commercial uses — with **no permit below $75.00**. Work without a calculable area follows the estimated-cost ladder, **$50.00 plus $2.50 per $1,000**. Electrical permits run from a **flat $200.00** initial one/two-family installation to **$0.25 per service ampere** (to 600 A) and **$0.50 per ampere over**, plus $25.00 subpanels and $85.00 temporary poles. Plumbing is the one trade Louisville does not price: Kentucky's **Division of Plumbing** permits it statewide at **$50.00 plus $14.00 per opening** (residential) under 815 KAR 20:050, with five inspections included.",
    localContext:
      "Construction Review, at 444 S. 5th Street, is Louisville Metro's permit office: it issues construction permits, performs plan review and schedules inspections across all of Jefferson County's merged government. The fee schedule is 'promulgated' — set administratively under LMCO 150.096 rather than re-enacted row by row — and the 2024 revision carries the $75 minimum adopted in 2018. A fast-track elective lets builders pull foundation-only permits ($75 single-family, $125 other uses) before the full plan review finishes. Plan review itself prices at the greater of $30 or one third of the permit fee where an application is reviewed without a permit being issued.\n\nKentucky is a state-permitting state for plumbing: the Division of Plumbing inside the Department of Housing, Buildings and Construction issues plumbing construction permits and inspects the work under the Kentucky State Plumbing Code, so the amounts on the plumbing page here are the state's, not Metro's.",
    valuationBasis:
      "New-construction building fees are computed from square footage (every floor, including finished basements, to the outside of exterior walls) at the occupancy's per-square-foot rate. Where square feet cannot be calculated — partial alterations, structures other than buildings — the fee uses the estimated cost of construction instead: $50.00 plus $2.50 per $1,000 or fraction thereof.",
    notIncluded:
      "These figures cover Louisville Metro Construction Review permit fees and the state plumbing permit that applies inside Louisville. They exclude:\n\n- **Plan review fees** where an application is reviewed without a building permit being issued — the greater of $30.00 or one third the normal permit fee.\n- **Mechanical (HVAC), fire detection and suppression, wrecking, moving, sign and parking-lot permits**, each priced on its own section of the promulgated schedule.\n- **Electrical inspections beyond those included** with each permit type ($50.00 each).\n- **Metro sewer, MSD and water company** tap, impact and connection charges.\n- **Penalty fees for work started without a permit** — the same fee plus, for electrical work, a $1,000 minimum penalty.",
    seoTitle: "Louisville KY Permit Fees | Construction Review Fee Schedule",
    seoDescription:
      "Louisville permit costs: building from $0.105/sq ft by occupancy with a $75 minimum, electrical from $200 with $0.25/amp service, state plumbing at $50 + $14/opening.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: LOU_LAST_VERIFIED,
  },

  permitPages: [
    {
      jurisdictionKey: LOU_KEYS.jurisdiction,
      permitTypeKey: "building",
      slug: "building-permit-cost",
      title: "Louisville Building Permit Cost",
      intro:
        "Louisville building permits are priced by Construction Review from the **promulgated fee schedule** under LMCO Chapter 150.096 (revised February 6, 2024). New construction charges **by occupancy type per square foot**: **$0.105 for one- and two-family residential** — about **$420 on a 4,000-square-foot home** — and $0.13 to $0.16 for commercial, storage and institutional uses. Work whose square footage cannot be calculated pays the estimated-cost ladder instead: **$50.00 plus $2.50 per $1,000** of cost, or fraction thereof. Whatever the path, **no building permit fee is less than $75.00**.",
      localSummary:
        "Construction Review, at 444 S. 5th Street, issues building permits for all of Louisville Metro and Jefferson County. Square footage counts every floor, including finished basements, to the outside of the exterior walls. A fast-track elective allows early foundation-only permits — $75.00 for single-family dwellings and accessory structures, $125.00 for other uses — before full plan review completes. Before a residential permit issues, the department searches its records for unresolved Building Code violations against the applicant and holds issuance until they are cured.",
      notIncluded:
        "This estimate covers the Louisville building permit fee only. It excludes:\n\n- **Plan review charged when an application is reviewed without permit issuance** — the greater of $30.00 or one third the normal permit fee.\n- **Electrical, plumbing, mechanical and fire** permits, each priced separately.\n- **Wrecking/demolition, moving, sign and parking-lot permits** on the same promulgated schedule but outside this calculator.\n- **MSD sewer and Louisville Water Company** tap and impact fees.\n- **Penalties** for starting work without a permit (double the fee).",
      workedExample: {
        scenario:
          "A new single-family home in Louisville with 4,000 square feet of finished area across two floors.",
        inputs: {
          squareFootage: 4_000,
          occupancy: "residential",
          workType: "new_construction",
        },
        notes:
          "Residential 1 & 2 Family rate: $0.105 × 4,000 sq ft = **$420.00**, which clears the $75.00 minimum, so no shortfall is charged. Total: **$420.00**.",
      },
      faqs: [
        {
          question: "How is a Louisville building permit fee calculated?",
          answer:
            "By occupancy type, per square foot, under the promulgated fee schedule: $0.16 Assembly and High hazard, $0.15 Business/Factory/Institutional/Mercantile/Residential-other, $0.14 Storage, $0.13 Utility/miscellaneous, and $0.105 for one- and two-family residential. A 4,000 sq ft single-family home pays $0.105 × 4,000 = $420.00.",
          sourceId: LOU_BUILDING_SOURCE_KEY,
          attribution: "Promulgated Permit Fees, LMCO Ch. 150.096 (rev. 2/6/2024)",
        },
        {
          question: "What is the minimum building permit fee in Louisville?",
          answer:
            "$75.00 — the schedule's item 10 states that no building permit fee calculated under the section shall be less than $75. The minimum was raised from $50.00 to $75.00 effective July 1, 2018, and the 2024 revision carries it.",
          sourceId: LOU_BUILDING_SOURCE_KEY,
          attribution: "Promulgated Permit Fees, LMCO Ch. 150.096 (rev. 2/6/2024)",
        },
        {
          question: "How does Louisville charge for remodels or work without measurable square footage?",
          answer:
            "By estimated cost: the fee is $50.00 plus $2.50 for every $1,000 of the estimated cost, or fraction thereof, as submitted by the applicant and verified by the Department. A $20,000 remodel pays $50.00 + 20 × $2.50 = $100.00.",
          sourceId: LOU_BUILDING_SOURCE_KEY,
          attribution: "Promulgated Permit Fees, LMCO Ch. 150.096 (rev. 2/6/2024)",
        },
        {
          question: "What square footage counts toward the fee?",
          answer:
            "The number of square feet on every floor, including all finished portions of basements, calculated to the outside of the exterior walls. Unfinished basements do not add finished square feet; every other floor does.",
          sourceId: LOU_BUILDING_SOURCE_KEY,
          attribution: "Promulgated Permit Fees, LMCO Ch. 150.096 (rev. 2/6/2024)",
        },
        {
          question: "How much is a foundation-only permit in Louisville?",
          answer:
            "$75.00 for single-family dwellings and their accessory structures, $125.00 for all other uses. Foundation-only permits are part of the fast-track elective, which lets construction start on the foundation while the full plan review proceeds.",
          sourceId: LOU_BUILDING_SOURCE_KEY,
          attribution: "Promulgated Permit Fees, LMCO Ch. 150.096 (rev. 2/6/2024)",
        },
        {
          question: "Is there a separate plan review fee in Louisville?",
          answer:
            "For applications that are reviewed without the issuance of a building permit — and for refunds on issued permits — the plan review fee is the greater of $30.00 or one third of the normal permit fee. Permits that are issued after review carry their review inside the permit fee; charging both would double-count, which is why the calculator prices the permit itself.",
          sourceId: LOU_BUILDING_SOURCE_KEY,
          attribution: "Promulgated Permit Fees, LMCO Ch. 150.096 (rev. 2/6/2024)",
        },
        {
          question: "What happens if I start work without a permit in Louisville?",
          answer:
            "A penalty fee equal to the standard fee is assessed — and for electrical work the penalty carries a $1,000.00 minimum — paid in addition to the standard fee itself. Metro-owned property projects may be waived by the Director of Codes & Regulations.",
          sourceId: LOU_BUILDING_SOURCE_KEY,
          attribution: "Promulgated Permit Fees, LMCO Ch. 150.096 (rev. 2/6/2024)",
        },
        {
          question: "Can code violations stop my Louisville building permit?",
          answer:
            "Yes, on residential work. Before issuing a one/two-family or multi-family residential permit, the Department searches its records for unresolved or uncured Building Code violations against the applicant and may not issue until all outstanding violations are removed, cured or corrected.",
          sourceId: LOU_BUILDING_SOURCE_KEY,
          attribution: "Promulgated Permit Fees, LMCO Ch. 150.096 (rev. 6/8/2023 item 11)",
        },
        {
          question: "How much is a Certificate of Use and Occupancy without a building permit?",
          answer:
            "$75.00 — the schedule's item 9 sets the administrative fee for a Certificate of Use and Occupancy issued without an associated building permit at that amount.",
          sourceId: LOU_BUILDING_SOURCE_KEY,
          attribution: "Promulgated Permit Fees, LMCO Ch. 150.096 (rev. 2/6/2024)",
        },
      ],
      seoTitle: "Louisville KY Building Permit Cost (Per-Sq-Ft Rates & $75 Minimum)",
      seoDescription:
        "Louisville building permit fees: $0.105/sq ft for 1-2 family residential, $0.13-$0.16 commercial, $50 + $2.50/$1,000 estimated-cost ladder, $75 minimum.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: LOU_LAST_VERIFIED,
    },

    {
      jurisdictionKey: LOU_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      slug: "electrical-permit-cost",
      title: "Louisville Electrical Permit Cost",
      intro:
        "Louisville electrical permits are priced by items 1–8 of the promulgated fee schedule. A first-time installation in a one- or two-family residence is a **flat $200.00** including three inspections; a **condominium or patio home** pays **$150.00 plus $0.25 per service ampere** to 600 A (**$0.50 per ampere over**); other-than-residence new wiring pays a **$100.00 base**, **$25.00 per subpanel**, **$25.00 per dwelling unit** on multi-family, and the same amperage charges. Service upgrades and repairs run **$75.00–$100.00** by work cost, and a **temporary pole is $85.00**. The **$75.00 permit minimum** applies here too.",
      localSummary:
        "Electrical permits are issued by Construction Review, with the number of inspections included varying by permit type (three for residence installations, two for other new wiring, one for upgrades and temporary poles); anything beyond the included count is $50.00 per inspection. Commonwealth of Kentucky licenses electrical contractors, master electricians and electricians, and Construction Review verifies licensing when permits are pulled. A burnout repair on a service prices at the same $75.00/$100.00 work-cost ladder as other repairs.",
      notIncluded:
        "This estimate covers the Louisville electrical permit fee only. It excludes:\n\n- **Additional inspections beyond those included** with the permit — $50.00 each, payable before further permits issue.\n- **Louisville Gas & Electric (LG&E) and KU** meter, service-drop and transformer charges.\n- **Building, plumbing, mechanical and fire** permits for the same project.\n- **Fire alarm plan review** by the fire marshal.\n- **The $1,000 minimum penalty** for electrical work started without a permit (charged in addition to the standard fee).",
      workedExample: {
        scenario:
          "A new commercial tenant space in Louisville: new wiring with a 400-amp service entrance and two subpanels.",
        inputs: {
          occupancy: "commercial",
          workType: "new_construction",
          custom: { amperage: 400, panels: 2 },
        },
        notes:
          "Base permit (other-than-residence new wiring): **$100.00**. Subpanels: 2 × $25.00 = **$50.00**. Service amperes: 400 × $0.25 = **$100.00** (all within the first 600 A). Total: **$250.00** — above the $75.00 minimum, so no shortfall applies.",
      },
      faqs: [
        {
          question: "How much is an electrical permit for a new house in Louisville?",
          answer:
            "$200.00 flat for the initial installation of electrical wiring in a one- or two-family residence, including three inspections. Larger service sizes do not change the residence row — amperage pricing begins with the condo/patio-home and other-than-residence permits.",
          sourceId: LOU_ELECTRICAL_SOURCE_KEY,
          attribution: "Promulgated Permit Fees, Electrical item 1",
        },
        {
          question: "How are service amperes priced on Louisville electrical permits?",
          answer:
            "$0.25 for each ampere at the service entrance up to and including 600 amperes, then $0.50 for each ampere over 600. A 400-amp service adds $100.00; a 700-amp service adds $150.00 + $50.00 = $175.00 (600 × $0.25 + 100 × $0.50).",
          sourceId: LOU_ELECTRICAL_SOURCE_KEY,
          attribution: "Promulgated Permit Fees, Electrical items 2 and 4",
        },
        {
          question: "What does a service upgrade cost to permit in Louisville?",
          answer:
            "$75.00 when the work costs $750.00 or less, $100.00 over that — covering service upgrades, new service, repairs and additional wiring on one/two-family, condominium and patio-home residences, one inspection included.",
          sourceId: LOU_ELECTRICAL_SOURCE_KEY,
          attribution: "Promulgated Permit Fees, Electrical item 3",
        },
        {
          question: "How much is a subpanel on a Louisville electrical permit?",
          answer:
            "$25.00 per subpanel on other-than-residence new wiring and on commercial rewiring or repairs. Multi-family residential structures add $25.00 per dwelling unit instead.",
          sourceId: LOU_ELECTRICAL_SOURCE_KEY,
          attribution: "Promulgated Permit Fees, Electrical items 4 and 5",
        },
        {
          question: "How much is a temporary pole permit in Louisville?",
          answer:
            "$85.00, including one inspection. Temporary poles are common on new construction sites before permanent service is energized.",
          sourceId: LOU_ELECTRICAL_SOURCE_KEY,
          attribution: "Promulgated Permit Fees, Electrical item 6",
        },
        {
          question: "What happens if my electrical permit needs more inspections?",
          answer:
            "Each additional inspection beyond the permit's included count is $50.00, and the Department may decline to issue further permits to the applicant until additional inspection fees are paid in full.",
          sourceId: LOU_ELECTRICAL_SOURCE_KEY,
          attribution: "Promulgated Permit Fees, Electrical item 7",
        },
        {
          question: "Does the $75 permit minimum apply to electrical permits?",
          answer:
            "Yes — the schedule's item 10 minimum applies to fees calculated under the section, and the electrical rows sit in it. Small permits under $75.00 of computed fees (rare, since the base rows start at $75.00–$100.00) would be topped up to $75.00.",
          sourceId: LOU_ELECTRICAL_SOURCE_KEY,
          attribution: "Promulgated Permit Fees, Electrical item 10",
        },
        {
          question: "Is there an electrical penalty for working without a permit?",
          answer:
            "Yes — electrical work carries a minimum $1,000.00 penalty fee, in addition to the standard fee, when work starts without a permit. Other trades' penalties are the same amount as the standard fee.",
          sourceId: LOU_ELECTRICAL_SOURCE_KEY,
          attribution: "Promulgated Permit Fees, Penalty section",
        },
      ],
      seoTitle: "Louisville KY Electrical Permit Cost ($200 Residential, $0.25/Amp Service)",
      seoDescription:
        "Louisville electrical permit fees: $200 for a 1-2 family installation, $150 condo base, $100 commercial base + $0.25/amp to 600A, $85 temp pole, $75 minimum.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: LOU_LAST_VERIFIED,
    },

    {
      jurisdictionKey: LOU_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      slug: "plumbing-permit-cost",
      title: "Louisville Plumbing Permit Cost",
      intro:
        "Plumbing in Louisville is permitted by the **State of Kentucky**, not Metro government: Louisville's promulgated fee schedule has **no plumbing section**, and the **Division of Plumbing** inside the Kentucky Department of Housing, Buildings and Construction issues plumbing construction permits statewide. Under **815 KAR 20:050**, the permit costs **$50.00 plus $14.00 per opening** for one- and two-family homes ($20.00 per opening for all other buildings), with **five inspections included**. A single water-heater replacement in a building is **$50.00 flat** — the permit's only fee.",
      localSummary:
        "An 'opening' is each plumbing fixture or appliance, each opening left for one in the soil or waste pipe system, each domestic water heater, and each separately metered water or sewer service beyond the first (commercial permits also count conductor openings). The state permit covers the required inspections — five at no additional cost, $50.00 per additional inspection, waived entirely once the permit fee exceeds $250.00. Metro's Construction Review office has no plumbing permitting or inspection role; all plumbing work inside Louisville Metro goes through the Frankfort-based division.",
      notIncluded:
        "This estimate covers the Kentucky state plumbing permit that applies inside Louisville. It excludes:\n\n- **MSD (Metropolitan Sewer District) sewer tap, lateral and connection charges**, billed separately by the district.\n- **Louisville Water Company** meter and tap fees.\n- **Building, electrical and mechanical permits** from Construction Review.\n- **Plumbing plan review** for larger projects (state plan submission under 815 KAR 20:050 Section 3).\n- **State licensing** fees for master plumbers.",
      workedExample: {
        scenario:
          "A Louisville bathroom remodel in a one-family home: four openings in all — three new fixtures (water closet, lavatory, tub/shower) and a water heater replacement.",
        inputs: {
          occupancy: "residential",
          workType: "remodel",
          custom: { openings: 4 },
        },
        notes:
          "State base fee: **$50.00**. Openings: 4 × $14.00 = **$56.00** (three fixtures plus the water heater; a single heater alone would be the $50.00 flat permit). Total: **$106.00**.",
      },
      faqs: [
        {
          question: "Who issues plumbing permits in Louisville?",
          answer:
            "Kentucky's Division of Plumbing, part of the Department of Housing, Buildings and Construction in Frankfort. State law directs that no one construct, install or alter plumbing without first procuring a plumbing construction permit from the Division, and Louisville Metro's own promulgated schedule has no plumbing section to charge.",
          sourceId: "ky-dhbc-plumbing-page",
          attribution: "Kentucky DHBC — Division of Plumbing",
        },
        {
          question: "How much is a state plumbing permit in Louisville?",
          answer:
            "$50.00 base plus $14.00 per opening for one- and two-family residences, or $20.00 per opening for all other buildings. Openings are fixtures, appliances, openings left in the soil or waste system, water heaters and, beyond the first, separately metered water and sewer services (plus conductor openings on commercial).",
          sourceId: LOU_PLUMBING_SOURCE_KEY,
          attribution: "815 KAR 20:050, Section 4",
        },
        {
          question: "How much is a permit to replace a water heater?",
          answer:
            "$50.00 — when only one new domestic water heater is installed or replaced within a single building, that is the only fee for the permit, with no per-opening charges. Replacing two or more heaters in one building switches back to the per-opening calculation.",
          sourceId: LOU_PLUMBING_SOURCE_KEY,
          attribution: "815 KAR 20:050, Sections 3(a) and 4(3)",
        },
        {
          question: "How many plumbing inspections are included with the state permit?",
          answer:
            "Five plumbing inspections at no additional cost. Each additional inspection is $50.00, paid before the final inspection — but additional inspection fees do not apply at all once the cost of the plumbing permit exceeds $250.00.",
          sourceId: LOU_PLUMBING_SOURCE_KEY,
          attribution: "815 KAR 20:050, Section 5",
        },
        {
          question: "How much is a typical whole-house plumbing permit in Louisville?",
          answer:
            "A one-family home with ten openings pays $50.00 + 10 × $14.00 = $190.00. The count covers every fixture and appliance, plus the water heater and any extra metered services.",
          sourceId: LOU_PLUMBING_SOURCE_KEY,
          attribution: "815 KAR 20:050, Section 4(1)",
        },
        {
          question: "Do Louisville homeowners need a licensed plumber for the permit?",
          answer:
            "Plumbing work must be performed under a licensed master plumber holding the state permit; homeowners may perform their own work only under the regulation's homeowner-affidavit conditions (work personally performed, compliance with 815 KAR Chapter 20, and no new-home homeowner permit in the last five years).",
          sourceId: LOU_PLUMBING_SOURCE_KEY,
          attribution: "815 KAR 20:050, Sections 1 and 2",
        },
        {
          question: "Why doesn't Louisville Metro charge its own plumbing fee?",
          answer:
            "Kentucky permits plumbing at the state level — the Division of Plumbing issues construction permits and inspects installations under the Kentucky State Plumbing Code. Cities price other trades locally, but the plumbing permit, its fees and its inspections all live with the state, which is why the amounts here come from 815 KAR 20:050 rather than a Metro schedule.",
          sourceId: "ky-dhbc-plumbing-page",
          attribution: "Kentucky DHBC — Division of Plumbing",
        },
        {
          question: "Do plumbing permits expire?",
          answer:
            "Yes — state plumbing permits expire one year after issuance unless construction is ongoing, and become void if the plumbing work ceases for more than twelve months.",
          sourceId: LOU_PLUMBING_SOURCE_KEY,
          attribution: "815 KAR 20:050, Section 6",
        },
      ],
      seoTitle: "Louisville KY Plumbing Permit Cost (State Permit: $50 + $14/Opening)",
      seoDescription:
        "Plumbing permits in Louisville are Kentucky state permits: $50 base + $14 per opening residential, $20 commercial, single water heater $50 flat, 5 inspections included.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: LOU_LAST_VERIFIED,
    },
  ],

  verifications: [
    {
      entityType: "jurisdiction_profile",
      entityKey: LOU_KEYS.jurisdiction,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: LOU_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Kentucky Expansion",
      sourceKey: "louisville-cr-page",
      notes:
        "Construction Review identity, address (444 S. 5th Street) and phone verified from the department's own pages; the promulgated-fees PDF retrieved from louisvilleky.gov (Cloudflare required browser-mimicking headers).",
    },
    {
      entityType: "fee_schedule",
      entityKey: "louisville-promulgated-fees",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: LOU_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Kentucky Expansion",
      sourceKey: LOU_BUILDING_SOURCE_KEY,
      notes:
        "Per-sq-ft occupancy table, estimated-cost ladder, $75 minimum, foundation-only amounts and all eight electrical items transcribed from the layout-mode extraction of the promulgated PDF (rev. 2/6/2024); minimum cross-checked against the 2018 news change ($50 to $75).",
    },
    {
      entityType: "fee_schedule",
      entityKey: "ky-state-plumbing-fees",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: LOU_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Kentucky Expansion",
      sourceKey: LOU_PLUMBING_SOURCE_KEY,
      notes:
        "815 KAR 20:050 Sections 3-6 read from the Kentucky Legislature's regulation text (via Internet Archive snapshot 2024-09-27) and cross-checked against dhbc.ky.gov's Division of Plumbing fee summary; amendment history (48 Ky.R. 629, eff. 3-1-2022) recorded.",
    },
    {
      entityType: "permit_page",
      entityKey: "building-permit-cost",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: LOU_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Kentucky Expansion",
      sourceKey: LOU_BUILDING_SOURCE_KEY,
      notes: "Passed editorial gate checks for the Louisville building permit page.",
    },
    {
      entityType: "permit_page",
      entityKey: "electrical-permit-cost",
      permitTypeKey: "electrical",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: LOU_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Kentucky Expansion",
      sourceKey: LOU_ELECTRICAL_SOURCE_KEY,
      notes: "Passed editorial gate checks for the Louisville electrical permit page.",
    },
    {
      entityType: "permit_page",
      entityKey: "plumbing-permit-cost",
      permitTypeKey: "plumbing",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: LOU_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Kentucky Expansion",
      sourceKey: LOU_PLUMBING_SOURCE_KEY,
      notes: "Passed editorial gate checks for the Louisville plumbing (state) permit page.",
    },
  ],
};
