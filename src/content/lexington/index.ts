import type { JurisdictionSeed } from "@/content/seed-types";
import {
  KY_STATE_PLUMBING_EFFECTIVE_FROM,
  LEX_BUILDING_RULES,
  LEX_BUILDING_SOURCE_KEY,
  LEX_ELECTRICAL_RULES,
  LEX_ELECTRICAL_SOURCE_KEY,
  LEX_FEE_EFFECTIVE_FROM,
  LEX_PLUMBING_RULES,
  LEX_PLUMBING_SOURCE_KEY,
} from "@/content/lexington/fee-rules";

export const LEX_LAST_VERIFIED = "2026-09-26";

export const LEX_KEYS = {
  state: "ky",
  county: "fayette-county-ky",
  jurisdiction: "lexington",
} as const;

const state = {
  code: "KY",
  slug: "kentucky",
  name: "Kentucky",
  fipsCode: "21",
};

const county = {
  key: LEX_KEYS.county,
  slug: "fayette-county-ky",
  name: "Fayette County",
  fipsCode: "21067",
};

const GOV_URL = "https://www.lexingtonky.gov";
const BI_URL = `${GOV_URL}/government/departments-programs/environmental-quality-public-works/building-inspection`;
const FEES_PDF_URL =
  "https://content.lexingtonky.gov/sites/default/files/2024-11/2021%20Fee%20Schedule.pdf";
const ELEC_URL = `${GOV_URL}/working/building-permits/electrical-permits-licensing-inspections`;
const COMM_URL = `${GOV_URL}/working/building-permits/commercial-construction`;
const KY_DHBC_PLUMBING_URL = "https://dhbc.ky.gov/newstatic_info.aspx?static_id=337";
const KY_KAR_PLUMBING_URL = "https://apps.legislature.ky.gov/law/kar/titles/815/020/050/";

export const lexingtonSeed: JurisdictionSeed = {
  state,
  county,

  jurisdiction: {
    key: LEX_KEYS.jurisdiction,
    stateKey: LEX_KEYS.state,
    countyKey: LEX_KEYS.county,
    type: "city",
    slug: "lexington",
    name: "Lexington",
    officialName:
      "Lexington-Fayette Urban County Government — Division of Building Inspection, Department of Environmental Quality and Public Works",
    websiteUrl: GOV_URL,
    permitPortalUrl: "https://aca-prod.accela.com/LEXKY/Default.aspx",
    timezone: "America/New_York",
    isActive: true,
  },

  departments: [
    {
      key: "lexington-building-inspection",
      jurisdictionKey: LEX_KEYS.jurisdiction,
      kind: "building",
      name: "Lexington Division of Building Inspection",
      phone: "(859) 258-3770",
      email: "buildinginspection@lexingtonky.gov",
      url: BI_URL,
      addressLine: "101 E. Vine St., Lexington, KY 40507",
      hours: "Monday – Friday, 8:00 a.m. – 5:00 p.m. ET",
      notes:
        "Building Inspection enforces the Kentucky Building Code across Fayette County's merged government, issues building and electrical permits, and prices its fees from the division's published fee schedule (effective July 1, 2019).",
    },
  ],

  sources: [
    {
      key: LEX_BUILDING_SOURCE_KEY,
      jurisdictionKey: LEX_KEYS.jurisdiction,
      title:
        "LFUCG Division of Building Inspection — Commercial and Residential Schedule of Fees (2021 Fee Schedule, rev. 10/27/21)",
      url: FEES_PDF_URL,
      sourceType: "fee_schedule_pdf",
      issuingAuthority:
        "Lexington-Fayette Urban County Government, Division of Building Inspection",
      authorityKind: "city",
      isPrimary: true,
      documentDate: "2021-10-27",
      effectiveFrom: LEX_FEE_EFFECTIVE_FROM,
      retrievedAt: "2026-09-26",
      lastVerifiedAt: LEX_LAST_VERIFIED,
      notes:
        "Fees effective July 1, 2019 (FY20 budget restructure); the document was revised 10/27/21. Commercial section prices by occupancy phrase per square foot ($.28 warehouse to $.90 educational/restaurant) with printed second adders; residential section prices $.10 per square foot with a $150 minimum plus a $180/$100-per-unit adder; plan review is $.06 per square foot commercial (min $50) and $25 residential. Plumbing is absent from the schedule; HVAC and fire sections documented but not calculator pages.",
    },
    {
      key: LEX_ELECTRICAL_SOURCE_KEY,
      jurisdictionKey: LEX_KEYS.jurisdiction,
      title: "City of Lexington — Electrical permits, licensing and inspections page",
      url: ELEC_URL,
      sourceType: "municipal_website",
      issuingAuthority: "Lexington-Fayette Urban County Government",
      authorityKind: "city",
      isPrimary: true,
      documentDate: null,
      effectiveFrom: null,
      retrievedAt: "2026-09-26",
      lastVerifiedAt: LEX_LAST_VERIFIED,
      notes:
        "States plainly: 'Electrical permits cost $10 each.' Permits are issued by LFUCG Building Inspection to master electricians (state-licensed through Kentucky DHBC) with an LFUCG business license; inspections are performed by the Commonwealth Inspection Bureau ((859) 263-7800) separately from the permit.",
    },
    {
      key: LEX_PLUMBING_SOURCE_KEY,
      jurisdictionKey: LEX_KEYS.jurisdiction,
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
      lastVerifiedAt: LEX_LAST_VERIFIED,
      notes:
        "Kentucky administrative regulation fixing plumbing permit fees statewide: $50 base plus $14 per opening (residential 1-2 family) or $20 per opening (all other buildings), a single water heater replacement at $50 flat, five inspections included and $50 per additional inspection. Last amended by 48 Ky.R. 629, effective 3-1-2022. Regulation text read from the Legislature's page via an Internet Archive snapshot (2024-09-27); cross-checked against dhbc.ky.gov.",
    },
    {
      key: "lexington-comm-page",
      jurisdictionKey: LEX_KEYS.jurisdiction,
      title: "City of Lexington — Commercial construction page",
      url: COMM_URL,
      sourceType: "municipal_website",
      issuingAuthority: "Lexington-Fayette Urban County Government",
      authorityKind: "city",
      isPrimary: true,
      documentDate: null,
      effectiveFrom: null,
      retrievedAt: "2026-09-26",
      lastVerifiedAt: LEX_LAST_VERIFIED,
      notes:
        "Documents the trade split inside Lexington: 'Plumbing — Application, review and permit by State Inspector (859) 899-3244' and 'Electrical — Permit by LFUCG; inspections by Commonwealth Inspections Bureau (859) 263-7800'. Also names the Division of Building Inspection, 101 E. Vine St.",
    },
    {
      key: "ky-dhbc-plumbing-page",
      jurisdictionKey: LEX_KEYS.jurisdiction,
      title: "Kentucky DHBC — Division of Plumbing (statewide plumbing permitting)",
      url: KY_DHBC_PLUMBING_URL,
      sourceType: "state_agency",
      issuingAuthority: "Kentucky Department of Housing, Buildings and Construction",
      authorityKind: "state",
      isPrimary: true,
      documentDate: null,
      effectiveFrom: null,
      retrievedAt: "2026-09-26",
      lastVerifiedAt: LEX_LAST_VERIFIED,
      notes:
        "Confirms the Division of Plumbing issues plumbing construction permits statewide — 'No person, firm or corporation shall construct, install or alter any plumbing without first having procured a plumbing construction permit from the Division of Plumbing' — and summarizes the fee schedule: $50 base, $14 per opening residential, $20 commercial.",
    },
  ],

  permitTypes: [],
  projectTypes: [],

  jurisdictionPermitTypes: [
    {
      jurisdictionKey: LEX_KEYS.jurisdiction,
      permitTypeKey: "building",
      isAvailable: true,
      localName: "Building Permit",
      officialUrl: FEES_PDF_URL,
      notes:
        "Residential $.10/sq ft (min $150) + $180 or $100/unit adder; commercial $.28-$.90/sq ft by use (min $250) with printed second adders; plan review $.06/sq ft commercial or $25 residential.",
    },
    {
      jurisdictionKey: LEX_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      isAvailable: true,
      localName: "Electrical Permit",
      officialUrl: ELEC_URL,
      notes:
        "$10.00 per electrical permit (page-stated). Inspections are performed by the Commonwealth Inspection Bureau, priced separately.",
    },
    {
      jurisdictionKey: LEX_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      isAvailable: true,
      localName: "State Plumbing Permit",
      officialUrl: KY_KAR_PLUMBING_URL,
      notes:
        "Plumbing permits in Lexington are issued by Kentucky's Division of Plumbing under 815 KAR 20:050 — $50 base plus $14/$20 per opening; the LFUCG schedule has no plumbing section.",
    },
  ],

  feeSchedules: [
    {
      key: "lexington-fee-schedule",
      jurisdictionKey: LEX_KEYS.jurisdiction,
      sourceKey: LEX_BUILDING_SOURCE_KEY,
      title: "LFUCG Building Inspection Fee Schedule (effective July 1, 2019)",
      officialUrl: FEES_PDF_URL,
      effectiveFrom: LEX_FEE_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: LEX_LAST_VERIFIED,
      notes:
        "The division's current published fee schedule, revised 10/27/21; the department page confirms the July 1, 2019 effective date from the FY20 budget restructure.",
    },
    {
      key: "ky-state-plumbing-fees",
      jurisdictionKey: LEX_KEYS.jurisdiction,
      sourceKey: LEX_PLUMBING_SOURCE_KEY,
      title: "Kentucky State Plumbing Permit Fees (815 KAR 20:050)",
      officialUrl: KY_KAR_PLUMBING_URL,
      effectiveFrom: KY_STATE_PLUMBING_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: LEX_LAST_VERIFIED,
      notes:
        "Statewide regulation, effective in its current form since 2022-03-01, charged on plumbing work inside Fayette County because the state Division of Plumbing — not LFUCG — permits and inspects plumbing.",
    },
  ],

  feeRules: [
    ...LEX_BUILDING_RULES.map((rule) => ({
      jurisdictionKey: LEX_KEYS.jurisdiction,
      permitTypeKey: "building",
      scheduleKey: "lexington-fee-schedule",
      rule,
    })),
    ...LEX_ELECTRICAL_RULES.map((rule) => ({
      jurisdictionKey: LEX_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      scheduleKey: "lexington-fee-schedule",
      rule,
    })),
    ...LEX_PLUMBING_RULES.map((rule) => ({
      jurisdictionKey: LEX_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      scheduleKey: "ky-state-plumbing-fees",
      rule,
    })),
  ],

  requirements: [
    {
      jurisdictionKey: LEX_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "document",
      title: "Dimensioned plans for plan review",
      description:
        "Residential plan review requires a dimensioned site plan, foundation plan, floor plan, wall section, elevations, framing details and a floor-elevation callout relative to the closest downstream manhole; commercial applications go through the One-Stop Shop and may go before the Tuesday Morning Plan Review Board.",
      isMandatory: true,
      sortOrder: 1,
      sourceKey: LEX_BUILDING_SOURCE_KEY,
      lastVerifiedAt: LEX_LAST_VERIFIED,
    },
    {
      jurisdictionKey: LEX_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "license",
      title: "Contractor registration with Building Inspection",
      description:
        "Under the Contractors Registration Ordinance, all contractors must register with Building Inspection before pulling permits — over 1,600 registered — and unregistered contractors cannot obtain building permits.",
      isMandatory: true,
      sortOrder: 2,
      sourceKey: LEX_BUILDING_SOURCE_KEY,
      lastVerifiedAt: LEX_LAST_VERIFIED,
    },
    {
      jurisdictionKey: LEX_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      requirementType: "license",
      title: "State master electrician license and LFUCG business license",
      description:
        "Electrical contractors may obtain permits if they hold a Kentucky Master Electrician license (issued through the Office of Housing, Buildings and Construction) or employ one, plus an LFUCG business license. Homeowners may pull permits for their own current residence — not vacant property, rentals, duplexes or mobile homes.",
      isMandatory: true,
      sortOrder: 3,
      sourceKey: LEX_ELECTRICAL_SOURCE_KEY,
      lastVerifiedAt: LEX_LAST_VERIFIED,
    },
    {
      jurisdictionKey: LEX_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      requirementType: "license",
      title: "State-licensed master plumber",
      description:
        "Plumbing work is permitted through Kentucky's Division of Plumbing and must be performed under a licensed master plumber holding the state permit; LFUCG's plumbing role is limited to health-department plan review for public buildings.",
      isMandatory: true,
      sortOrder: 4,
      sourceKey: "ky-dhbc-plumbing-page",
      lastVerifiedAt: LEX_LAST_VERIFIED,
    },
  ],

  profile: {
    jurisdictionKey: LEX_KEYS.jurisdiction,
    headline: "Lexington, Kentucky Permit Fees — Division of Building Inspection",
    summary:
      "Lexington-Fayette Urban County Government prices construction through the **Division of Building Inspection fee schedule**, effective **July 1, 2019**. Residential permits charge **$0.10 per square foot (min $150)** plus **$180.00 for a single-family home** or **$100.00 per dwelling unit** on duplexes, townhouses and apartments — about **$580 on a 2,500-square-foot house**. Commercial permits price by use, from **$0.28/sq ft (warehouse)** to **$0.90/sq ft (educational, restaurant)**, each with a $250 minimum and a printed second adder, plus **$0.06/sq ft plan review** ($25 residential). Electrical permits are a **flat $10.00 each**. Plumbing is the state's: Kentucky's **Division of Plumbing** permits it at **$50.00 plus $14.00 per opening** under 815 KAR 20:050, five inspections included.",
    localContext:
      "Building Inspection, at 101 E. Vine St. inside the merged Lexington-Fayette Urban County Government, enforces the Kentucky Building Code across Fayette County and operates the One-Stop Shop for development permitting. The FY20 budget restructured the fees — primarily residential — and the schedule has carried the $0.10/sq ft residential rate since July 1, 2019. Contractors must register with the division before pulling permits, and large commercial projects can go before the Tuesday Morning Plan Review Board before approval.\n\nTwo trades are split away from the local schedule: electrical permits cost a flat $10 (with inspections performed by the Commonwealth Inspection Bureau, priced separately), and plumbing is permitted entirely by Kentucky's state Division of Plumbing — LFUCG's fee schedule has no plumbing section, and the city's commercial-construction page routes plumbing permits to the State Inspector.",
    valuationBasis:
      "Building permit fees are computed from square footage of the work at the occupancy's per-square-foot rate, with each row's printed minimum applying to the area portion before the adder. Lexington's schedule prices by area, not by project valuation; wrecking and moving permits (0.002 × assessed valuation, min $100) sit outside the building calculator.",
    notIncluded:
      "These figures cover LFUCG Building Inspection permit fees and the state plumbing permit that applies inside Lexington. They exclude:\n\n- **Mechanical (HVAC) permit fees** — priced by construction cost on the same schedule ($125 to $3,965+, $105 first residential system) but outside this calculator.\n- **Fire detection and sprinkler system fees** ($275/$150-$375 on the schedule's fire sections).\n- **Commonwealth Inspection Bureau electrical inspection fees**, separate from the $10 LFUCG permit.\n- **Zoning, planning and impact fees** handled through the One-Stop Shop.\n- **Reinspection fees** ($50/$100/$200) and standalone Certificates of Occupancy ($25).",
    seoTitle: "Lexington KY Permit Fees | Building Inspection Fee Schedule",
    seoDescription:
      "Lexington permit costs: $0.10/sq ft residential + $180 adder, commercial $0.28-$0.90/sq ft by use, $10 electrical permit, state plumbing $50 + $14/opening.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: LEX_LAST_VERIFIED,
  },

  permitPages: [
    {
      jurisdictionKey: LEX_KEYS.jurisdiction,
      permitTypeKey: "building",
      slug: "building-permit-cost",
      title: "Lexington Building Permit Cost",
      intro:
        "Lexington building permits are priced by the Division of Building Inspection's published **fee schedule**, effective July 1, 2019. Residential work charges **$0.10 per square foot with a $150 minimum**, plus **$180.00 for a new single-family home** — about **$580 on a 2,500-square-foot house** — or **$100.00 per dwelling unit** on duplexes, townhouses, apartments and condos. Commercial work prices **by occupancy**: **$0.28/sq ft** warehouse through **$0.90/sq ft** educational and restaurant (min $250), with printed second adders, plus **plan review at $0.06/sq ft** commercial ($25.00 residential).",
      localSummary:
        "Building Inspection, at 101 E. Vine St., issues building permits across Fayette County's merged government and enforces the Kentucky Building Code. Applications go through Lexington's One-Stop Shop; residential plan review needs a full drawing set (site plan, floor plan, wall section, elevations, framing details) and commercial projects can go before the Tuesday Morning Plan Review Board. All contractors must register with the division before pulling a permit. Work started without a permit doubles the fee, per the schedule's own warning.",
      notIncluded:
        "This estimate covers the LFUCG building permit fee and plan review. It excludes:\n\n- **Mechanical (HVAC) permits** — priced by construction cost on the same schedule but permitted separately.\n- **Fire detection and sprinkler permits** reviewed with the Lexington Fire Department.\n- **Zoning approvals, Certificates of Appropriateness and impact fees** handled through the One-Stop Shop.\n- **Sign, paving, fence and pool permits** priced as their own schedule rows.\n- **Reinspection fees** ($50.00, $100.00, $200.00 by occurrence).",
      workedExample: {
        scenario:
          "A new 2,500-square-foot single-family home in Lexington-Fayette County.",
        inputs: {
          squareFootage: 2_500,
          occupancy: "residential",
          workType: "new_construction",
        },
        notes:
          "Area: $0.10 × 2,500 sq ft = $250.00 (above the $150.00 minimum). Single-family adder: **$180.00**. Residential plan review: **$25.00**. Total: **$455.00**.",
      },
      faqs: [
        {
          question: "How is a Lexington building permit fee calculated?",
          answer:
            "From square footage on the Division of Building Inspection's published schedule. Residential work — new homes, remodels, additions, accessory buildings alike — is $0.10 per square foot with a $150 minimum, and new dwellings add $180.00 (single family) or $100.00 per dwelling unit (duplex/townhouse/apartment/condo).",
          sourceId: LEX_BUILDING_SOURCE_KEY,
          attribution: "LFUCG Building Inspection Fee Schedule (rev. 10/27/21)",
        },
        {
          question: "How much is a permit for a new house in Lexington?",
          answer:
            "A 2,500-square-foot single-family home pays $0.10 × 2,500 = $250.00 for the area, plus the $180.00 new-dwelling adder, plus the $25.00 residential plan review — $455.00 total.",
          sourceId: LEX_BUILDING_SOURCE_KEY,
          attribution: "LFUCG Building Inspection Fee Schedule (rev. 10/27/21)",
        },
        {
          question: "What do commercial building permits cost in Lexington?",
          answer:
            "By use, per square foot: $0.90 educational and restaurant, $0.68 hotel/motel, $0.62 office, $0.42 retail/canopies/all-other (including churches and nursing homes), $0.28 warehouse — each with a $250 minimum — plus the schedule's printed second adder ($.119-.252/sq ft depending on use). Commercial remodeling is its own row: $0.10 per square foot, $250 minimum.",
          sourceId: LEX_BUILDING_SOURCE_KEY,
          attribution: "LFUCG Building Inspection Fee Schedule (rev. 10/27/21)",
        },
        {
          question: "How much is plan review in Lexington?",
          answer:
            "Commercial plan review is $0.06 per square foot with a $50 minimum. Residential plan review is a flat $25.00, required at the time of plan submittal.",
          sourceId: LEX_BUILDING_SOURCE_KEY,
          attribution: "LFUCG Building Inspection Fee Schedule (rev. 10/27/21)",
        },
        {
          question: "Does the residential rate differ for remodels and decks?",
          answer:
            "No — the schedule prices remodeling (including finishing basements), additions (attached garages, decks, dormers) and accessory buildings (detached garages, sheds) at the same $0.10 per square foot, $150 minimum. The $180/$100-per-unit adders apply only to new dwellings.",
          sourceId: LEX_BUILDING_SOURCE_KEY,
          attribution: "LFUCG Building Inspection Fee Schedule (rev. 10/27/21)",
        },
        {
          question: "When did Lexington's current permit fees take effect?",
          answer:
            "July 1, 2019. A comprehensive review and restructuring of building permit fees was part of the FY20 city budget, with changes primarily in the residential sector; the published document was last revised October 27, 2021.",
          sourceId: "lexington-bi-page",
          attribution: "Division of Building Inspection department page",
        },
        {
          question: "What happens if I build without a permit in Lexington?",
          answer:
            "The schedule's header states it directly: double permit fees will be imposed for work started without a permit. Reinspections carry their own ladder — $50.00 first, $100.00 second, $200.00 third.",
          sourceId: LEX_BUILDING_SOURCE_KEY,
          attribution: "LFUCG Building Inspection Fee Schedule (rev. 10/27/21)",
        },
        {
          question: "Do contractors need to register before pulling a permit?",
          answer:
            "Yes. Under the Contractors Registration Ordinance, every contractor must register with Building Inspection — unregistered contractors cannot obtain building permits — and electrical contractors additionally need a state Master Electrician license (or employ one) plus an LFUCG business license.",
          sourceId: LEX_ELECTRICAL_SOURCE_KEY,
          attribution: "Electrical permits, licensing and inspections page",
        },
      ],
      seoTitle: "Lexington KY Building Permit Cost ($0.10/Sq Ft + $180 Adder)",
      seoDescription:
        "Lexington building permit fees: $0.10/sq ft residential (min $150) + $180 single-family adder, commercial $0.28-$0.90/sq ft by use, plan review $0.06/sq ft or $25.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: LEX_LAST_VERIFIED,
    },

    {
      jurisdictionKey: LEX_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      slug: "electrical-permit-cost",
      title: "Lexington Electrical Permit Cost",
      intro:
        "Lexington electrical permits are unusually simple: **$10.00 each**, as the city's electrical-permits page states plainly. The permit is issued by **LFUCG Building Inspection**; the **inspections** are performed — and priced — separately by the **Commonwealth Inspection Bureau**. Every electrical contractor pulling a permit must hold a **Kentucky Master Electrician license** (or employ one) and an **LFUCG business license**; homeowners may pull a permit for their own current residence.",
      localSummary:
        "Electrical permits are required for all electrical work in Fayette County, and one $10.00 permit covers the job regardless of service size or circuit count — Lexington prices the permit, not the work. The state licenses electrical contractors, master electricians and electricians through the Office of Housing, Buildings and Construction in Frankfort. Homeowner permits cannot be issued for vacant property, rental property, duplexes or mobile homes, and scheduling an inspection means calling the Commonwealth Inspection Bureau at (859) 263-7800, whose fees are its own.",
      notIncluded:
        "This estimate covers the LFUCG electrical permit only. It excludes:\n\n- **Commonwealth Inspection Bureau inspection fees** — the permit and the inspection are separate transactions in Lexington.\n- **Kentucky state electrical licensing** fees.\n- **Building, plumbing and mechanical permits** for the same project.\n- **LG&E and KU** meter and service charges.\n- **Fire alarm permits** reviewed with the fire marshal.",
      workedExample: {
        scenario:
          "A licensed electrical contractor pulling one permit for a panel change and new circuits in a Lexington residence.",
        inputs: {
          occupancy: "residential",
          workType: "alteration",
        },
        notes: "Electrical permit: **$10.00**. Total: **$10.00**.",
      },
      faqs: [
        {
          question: "How much is an electrical permit in Lexington?",
          answer:
            "$10.00 each, per the city's electrical-permits page. The fee is flat — Lexington prices the permit itself, not the amperage or circuit count of the work.",
          sourceId: LEX_ELECTRICAL_SOURCE_KEY,
          attribution: "Electrical permits, licensing and inspections page",
        },
        {
          question: "Who issues electrical permits in Lexington?",
          answer:
            "LFUCG's Division of Building Inspection issues the permits; electrical inspections, however, are performed by the Commonwealth Inspection Bureau, which schedules and prices its own inspections ((859) 263-7800).",
          sourceId: LEX_ELECTRICAL_SOURCE_KEY,
          attribution: "Electrical permits, licensing and inspections page",
        },
        {
          question: "Who can pull an electrical permit in Lexington?",
          answer:
            "Electrical contractors holding a Kentucky Master Electrician license — or employing one — with an LFUCG business license. Homeowners may pull permits for work on property they own and currently reside in; homeowner permits are not available for vacant property, rentals, duplexes or mobile homes.",
          sourceId: LEX_ELECTRICAL_SOURCE_KEY,
          attribution: "Electrical permits, licensing and inspections page",
        },
        {
          question: "Why is the electrical permit so cheap compared to other cities?",
          answer:
            "Because Lexington separates the permit from the inspection: the $10.00 fee covers issuance and record-keeping by Building Inspection, while the Commonwealth Inspection Bureau — a separate entity — performs and charges for the required inspections.",
          sourceId: LEX_ELECTRICAL_SOURCE_KEY,
          attribution: "Electrical permits, licensing and inspections page",
        },
        {
          question: "Does the $10 permit cover service upgrades and new circuits alike?",
          answer:
            "Yes. The page requires a permit for all electrical work in Fayette County and prices every permit at $10.00, whether the job is a service change, new circuits or a full install.",
          sourceId: LEX_ELECTRICAL_SOURCE_KEY,
          attribution: "Electrical permits, licensing and inspections page",
        },
        {
          question: "Are electrical inspections included in the $10?",
          answer:
            "No. Unlike Louisville's permits, which bundle a set number of inspections, Lexington's $10.00 permit excludes inspection fees — all electrical work must be inspected, and those inspections are arranged and priced through the Commonwealth Inspection Bureau.",
          sourceId: LEX_ELECTRICAL_SOURCE_KEY,
          attribution: "Electrical permits, licensing and inspections page",
        },
        {
          question: "Is the electrical permit fee in the Building Inspection fee schedule PDF?",
          answer:
            "No — the fee schedule PDF covers building, plan review, HVAC and fire fees. The $10.00 electrical permit fee is published on the city's electrical-permits page, which is the source cited here.",
          sourceId: LEX_ELECTRICAL_SOURCE_KEY,
          attribution: "Electrical permits, licensing and inspections page",
        },
        {
          question: "What licenses does Kentucky require for electrical contractors?",
          answer:
            "The Commonwealth issues three classes through the Office of Housing, Buildings and Construction in Frankfort: Electrical Contractor, Master Electrician and Electrician. Lexington permit-pullers need the Master Electrician class (or an employee holding it) plus the local business license.",
          sourceId: LEX_ELECTRICAL_SOURCE_KEY,
          attribution: "Electrical permits, licensing and inspections page",
        },
      ],
      seoTitle: "Lexington KY Electrical Permit Cost ($10 Flat Permit)",
      seoDescription:
        "Lexington electrical permits cost $10 each from LFUCG Building Inspection; inspections are separate through the Commonwealth Inspection Bureau.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: LEX_LAST_VERIFIED,
    },

    {
      jurisdictionKey: LEX_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      slug: "plumbing-permit-cost",
      title: "Lexington Plumbing Permit Cost",
      intro:
        "Plumbing in Lexington is permitted by the **State of Kentucky**: LFUCG's fee schedule has **no plumbing section**, and the city's commercial-construction page routes plumbing permits to the **State Inspector**. The **Division of Plumbing** inside the Kentucky Department of Housing, Buildings and Construction issues plumbing construction permits statewide under **815 KAR 20:050**: **$50.00 plus $14.00 per opening** for one- and two-family homes ($20.00 for all other buildings), with **five inspections included**. A single water-heater replacement is **$50.00 flat** — the permit's only fee.",
      localSummary:
        "An 'opening' is each plumbing fixture or appliance, each opening left for one in the soil or waste pipe system, each domestic water heater, and each separately metered water or sewer service beyond the first (commercial permits also count conductor openings). The state permit carries five inspections at no additional cost; additional inspections are $50.00 each, and the charge disappears entirely once the permit fee exceeds $250.00. LFUCG's own plumbing role is health plan review for public buildings through the Lexington Health Department — the permit itself is Frankfort's.",
      notIncluded:
        "This estimate covers the Kentucky state plumbing permit that applies inside Lexington. It excludes:\n\n- **Lexington Fayette County Health Department** plumbing plan review for public buildings.\n- **Kentucky American Water and sanitary sewer tap-on charges** (LFUCG's Sanitary Sewer Tap-On Desk bills separately).\n- **Building, electrical and mechanical permits** from Building Inspection.\n- **State plumbing plan submission** review for new construction (815 KAR 20:050 Section 3).\n- **State licensing** fees for master plumbers.",
      workedExample: {
        scenario:
          "A Lexington kitchen and bath remodel in a one-family home adding five openings in all — four fixtures and a water heater replacement.",
        inputs: {
          occupancy: "residential",
          workType: "remodel",
          custom: { openings: 5 },
        },
        notes:
          "State base fee: **$50.00**. Openings: 5 × $14.00 = **$70.00**. Total: **$120.00**.",
      },
      faqs: [
        {
          question: "Who issues plumbing permits in Lexington?",
          answer:
            "Kentucky's Division of Plumbing in Frankfort. LFUCG's commercial-construction page routes plumbing applications to the State Inspector, and the LFUCG fee schedule contains no plumbing section — the permit, its fees and its inspections are all state functions.",
          sourceId: "lexington-comm-page",
          attribution: "City of Lexington — Commercial construction page",
        },
        {
          question: "How much is a state plumbing permit in Lexington?",
          answer:
            "$50.00 base plus $14.00 per opening for one- and two-family residences, or $20.00 per opening for all other buildings. Openings are fixtures, appliances, openings left in the soil or waste system, water heaters and, beyond the first, separately metered water and sewer services (plus conductor openings on commercial).",
          sourceId: LEX_PLUMBING_SOURCE_KEY,
          attribution: "815 KAR 20:050, Section 4",
        },
        {
          question: "How much is a permit to replace a water heater?",
          answer:
            "$50.00 — when only one new domestic water heater is installed or replaced within a single building, that is the only fee for the permit. Replacing two or more heaters in one building switches back to the per-opening calculation.",
          sourceId: LEX_PLUMBING_SOURCE_KEY,
          attribution: "815 KAR 20:050, Sections 3(a) and 4(3)",
        },
        {
          question: "How many plumbing inspections are included?",
          answer:
            "Five plumbing inspections at no additional cost. Each additional inspection is $50.00, paid before the final inspection — but additional inspection fees do not apply at all once the cost of the plumbing permit exceeds $250.00.",
          sourceId: LEX_PLUMBING_SOURCE_KEY,
          attribution: "815 KAR 20:050, Section 5",
        },
        {
          question: "How much is a typical whole-house plumbing permit in Lexington?",
          answer:
            "A one-family home with twelve openings pays $50.00 + 12 × $14.00 = $218.00. The count covers every fixture and appliance, plus the water heater and any extra metered services.",
          sourceId: LEX_PLUMBING_SOURCE_KEY,
          attribution: "815 KAR 20:050, Section 4(1)",
        },
        {
          question: "Does LFUCG review plumbing plans?",
          answer:
            "Only for health compliance: the Plumbing Program staff at the Lexington Health Department review plans for renovating and constructing public buildings against local health regulations. The construction permit itself and code plan submission under 815 KAR 20:050 Section 3 remain with the state division.",
          sourceId: "lexington-plumbing-page",
          attribution: "City of Lexington — Plumbing permits page",
        },
        {
          question: "Why doesn't LFUCG charge its own plumbing fee?",
          answer:
            "Kentucky permits plumbing at the state level — the Division of Plumbing issues construction permits and inspects installations under the Kentucky State Plumbing Code. LFUCG prices building, plan review and HVAC locally, but the plumbing permit lives with the state, which is why the amounts here come from 815 KAR 20:050.",
          sourceId: "ky-dhbc-plumbing-page",
          attribution: "Kentucky DHBC — Division of Plumbing",
        },
        {
          question: "Do state plumbing permits expire?",
          answer:
            "Yes — they expire one year after issuance unless construction is ongoing, and become void if the plumbing work ceases for more than twelve months.",
          sourceId: LEX_PLUMBING_SOURCE_KEY,
          attribution: "815 KAR 20:050, Section 6",
        },
      ],
      seoTitle: "Lexington KY Plumbing Permit Cost (State Permit: $50 + $14/Opening)",
      seoDescription:
        "Plumbing permits in Lexington are Kentucky state permits: $50 base + $14 per opening residential, $20 commercial, single water heater $50 flat, 5 inspections included.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: LEX_LAST_VERIFIED,
    },
  ],

  verifications: [
    {
      entityType: "jurisdiction_profile",
      entityKey: LEX_KEYS.jurisdiction,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: LEX_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Kentucky Expansion",
      sourceKey: LEX_BUILDING_SOURCE_KEY,
      notes:
        "Division identity, address and phone verified from the Building Inspection page; the fee-schedule PDF and the electrical-permits page fetched directly from lexingtonky.gov/content.lexingtonky.gov.",
    },
    {
      entityType: "fee_schedule",
      entityKey: "lexington-fee-schedule",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: LEX_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Kentucky Expansion",
      sourceKey: LEX_BUILDING_SOURCE_KEY,
      notes:
        "Commercial and residential sections transcribed from the layout-mode extraction; the July 1, 2019 effective date cross-checked against the department page's FY20 note; the '090'/'062' rate notation read as dollars per square foot and re-verified against the residential section's '.10 X Sq. Ft.' notation.",
    },
    {
      entityType: "fee_schedule",
      entityKey: "ky-state-plumbing-fees",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: LEX_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Kentucky Expansion",
      sourceKey: LEX_PLUMBING_SOURCE_KEY,
      notes:
        "815 KAR 20:050 Sections 3-6 read from the Kentucky Legislature's regulation text (via Internet Archive snapshot 2024-09-27) and cross-checked against dhbc.ky.gov's Division of Plumbing fee summary; amendment history (48 Ky.R. 629, eff. 3-1-2022) recorded.",
    },
    {
      entityType: "permit_page",
      entityKey: "building-permit-cost",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: LEX_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Kentucky Expansion",
      sourceKey: LEX_BUILDING_SOURCE_KEY,
      notes: "Passed editorial gate checks for the Lexington building permit page.",
    },
    {
      entityType: "permit_page",
      entityKey: "electrical-permit-cost",
      permitTypeKey: "electrical",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: LEX_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Kentucky Expansion",
      sourceKey: LEX_ELECTRICAL_SOURCE_KEY,
      notes: "Passed editorial gate checks for the Lexington electrical permit page.",
    },
    {
      entityType: "permit_page",
      entityKey: "plumbing-permit-cost",
      permitTypeKey: "plumbing",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: LEX_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Kentucky Expansion",
      sourceKey: LEX_PLUMBING_SOURCE_KEY,
      notes: "Passed editorial gate checks for the Lexington plumbing (state) permit page.",
    },
  ],
};
