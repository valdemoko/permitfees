import type {
  JurisdictionSeed,
  SeedCounty,
  SeedDepartment,
  SeedFeeRule,
  SeedFeeSchedule,
  SeedJurisdiction,
  SeedPermitPage,
  SeedProfile,
  SeedSource,
  SeedState,
  SeedVerification,
} from "@/content/seed-types";

import {
  BTV_BUILDING_RULES,
  BTV_FEE_EFFECTIVE_FROM,
  BTV_FEE_SCHEDULE_KEY,
} from "./fee-rules";

export * from "./fee-rules";

/**
 * The complete Burlington, Vermont seed payload.
 *
 * Every figure traces to research/vermont/burlington.md, which traces to
 * BCO Chapter 8-28(a) as quoted on the City's own pages and the City's
 * printed fee examples.
 */

const RESEARCHER = "Permit Fee Intelligence research pass (Vermont)";

export const BTV_LAST_VERIFIED = "2026-09-26";

export const BTV_KEYS = {
  state: "vt",
  county: "chittenden-county",
  jurisdiction: "burlington",
  feeSchedule: BTV_FEE_SCHEDULE_KEY,
} as const;

const state: SeedState = {
  code: "VT",
  slug: "vermont",
  name: "Vermont",
  fipsCode: "50",
};

const county: SeedCounty = {
  key: BTV_KEYS.county,
  slug: "chittenden-county",
  name: "Chittenden County",
  fipsCode: "50007",
};

const jurisdiction: SeedJurisdiction = {
  key: BTV_KEYS.jurisdiction,
  stateKey: BTV_KEYS.state,
  countyKey: BTV_KEYS.county,
  type: "city",
  slug: "burlington",
  name: "Burlington",
  officialName: "City of Burlington, Vermont",
  websiteUrl: "https://www.burlingtonvt.gov/",
  permitPortalUrl: "https://burlingtonvt.portal.opengov.com/",
  timezone: "America/New_York",
  isActive: true,
};

const departments: SeedDepartment[] = [
  {
    key: "btv-permitting-inspections",
    jurisdictionKey: BTV_KEYS.jurisdiction,
    kind: "building",
    name: "Department of Permitting & Inspections — Building & Trades Division",
    phone: "(802) 863-9094",
    email: "PermittingInspections@burlingtonvt.gov",
    url: "https://www.burlingtonvt.gov/276/Permitting-Inspections",
    addressLine: "645 Pine Street, Burlington, VT 05401",
    hours: "Monday through Friday, 8:00 a.m. to 4:30 p.m.",
    notes:
      "The Zoning Division and the Building & Trades Division issue zoning, building, electrical, plumbing and mechanical permits; building permit fees are set by BCO Chapter 8-28(a).",
  },
];

const sources: SeedSource[] = [
  {
    key: BTV_FEE_SCHEDULE_KEY,
    jurisdictionKey: BTV_KEYS.jurisdiction,
    title: "Burlington Code of Ordinances Chapter 8-28(a) — building permit fees",
    url: "https://www.burlingtonvt.gov/548/Permit-Applications-and-Forms",
    sourceType: "municipal_code",
    issuingAuthority: "City of Burlington",
    authorityKind: "city",
    isPrimary: true,
    documentDate: BTV_LAST_VERIFIED,
    effectiveFrom: BTV_FEE_EFFECTIVE_FROM,
    retrievedAt: BTV_LAST_VERIFIED,
    lastVerifiedAt: BTV_LAST_VERIFIED,
    notes:
      "Quoted verbatim on the City's Permit Applications and Forms page: 'Building Permit Application Fees are set by Burlington Code of Ordinances (BCO) Chapter 8-28(a) Fees. Fees are based on the Estimated Cost of Construction (design/labor/material costs) at the rate of $8.50 per $1,000.00 with a minimum permit fee of thirty ($30.00) dollars.' Work-without-permit penalty at BCO 8-28(f).",
  },
  {
    key: "btv-permit-fees-page",
    jurisdictionKey: BTV_KEYS.jurisdiction,
    title: "Permit Fees — City of Burlington fee examples",
    url: "https://www.burlingtonvt.gov/558/Permit-Fees",
    sourceType: "municipal_website",
    issuingAuthority: "City of Burlington Zoning Division",
    authorityKind: "city",
    isPrimary: true,
    documentDate: BTV_LAST_VERIFIED,
    effectiveFrom: BTV_FEE_EFFECTIVE_FROM,
    retrievedAt: BTV_LAST_VERIFIED,
    lastVerifiedAt: BTV_LAST_VERIFIED,
    notes:
      "COA Level I example: $30 Construction Permit Fee ('any project up to $2858 construction cost') on a $1,500 deck. COA Level II example: $440 Construction Permit Fee on a $50,000 deck — '$8.50 per $1,000 of construction cost plus $15 recording fee' ($425 + $15). Zoning fees and impact fees listed separately.",
  },
  {
    key: "btv-construction-permits",
    jurisdictionKey: BTV_KEYS.jurisdiction,
    title: "Construction Permits — Building & Trades Division scope",
    url: "https://www.burlingtonvt.gov/701/Construction-Permits",
    sourceType: "municipal_website",
    issuingAuthority: "City of Burlington Building & Trades Division",
    authorityKind: "city",
    isPrimary: true,
    documentDate: BTV_LAST_VERIFIED,
    effectiveFrom: BTV_FEE_EFFECTIVE_FROM,
    retrievedAt: BTV_LAST_VERIFIED,
    lastVerifiedAt: BTV_LAST_VERIFIED,
    notes:
      "'Most applications that require a zoning permit also require a Building, Electrical, Plumbing and/or Mechanical permit.' Trades Division contact 802-863-9094; all permits applied for together in the online system; zoning approval comes first.",
  },
  {
    key: "btv-plumbing-mechanical",
    jurisdictionKey: BTV_KEYS.jurisdiction,
    title: "Plumbing / Mechanical — state rules adoption and inspection process",
    url: "https://www.burlingtonvt.gov/550/Plumbing-Mechanical",
    sourceType: "municipal_website",
    issuingAuthority: "City of Burlington Building & Trades Division",
    authorityKind: "city",
    isPrimary: true,
    documentDate: BTV_LAST_VERIFIED,
    effectiveFrom: BTV_FEE_EFFECTIVE_FROM,
    retrievedAt: BTV_LAST_VERIFIED,
    lastVerifiedAt: BTV_LAST_VERIFIED,
    notes:
      "Burlington adopts the State of Vermont Plumbing Rules 'without exception'; Vermont master licensed plumbers must secure permits in the City; owner-occupied single-family plumbing work allowed. Underground, rough and final inspections described.",
  },
];

const feeSchedules: SeedFeeSchedule[] = [
  {
    key: BTV_KEYS.feeSchedule,
    jurisdictionKey: BTV_KEYS.jurisdiction,
    sourceKey: BTV_FEE_SCHEDULE_KEY,
    title: "Burlington building permit fees (BCO 8-28(a): $8.50 per $1,000, $30 minimum)",
    officialUrl: "https://www.burlingtonvt.gov/548/Permit-Applications-and-Forms",
    effectiveFrom: BTV_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: BTV_LAST_VERIFIED,
    notes:
      "One linear rate on estimated construction cost plus a $15 recording fee and the ordinance's $30 minimum; the City's own $50,000-deck example ($440) reproduces the arithmetic exactly.",
  },
];

function attach(permitTypeKey: string, rules: SeedFeeRule["rule"][]): SeedFeeRule[] {
  return rules.map((rule) => ({
    jurisdictionKey: BTV_KEYS.jurisdiction,
    permitTypeKey,
    scheduleKey: BTV_KEYS.feeSchedule,
    rule,
  }));
}

const feeRules: SeedFeeRule[] = [...attach("building", BTV_BUILDING_RULES)];

const profile: SeedProfile = {
  jurisdictionKey: BTV_KEYS.jurisdiction,
  headline: "What building permits cost in Burlington",
  summary:
    "Burlington prices building permits from the **estimated cost of construction** at **$8.50 per $1,000** with a **$30.00 minimum** (BCO Chapter 8-28(a)), plus a **$15.00 recording fee** — the City's own example prices a $50,000 deck at **$440.00**.",
  localContext:
    "Burlington's building fee is one of the simplest in the dataset: a single linear rate written into the Code of Ordinances. Chapter 8-28(a) prices building permit fees from the estimated cost of construction — design, labor and materials — at $8.50 per $1,000.00, with a $30.00 minimum. The City's Permit Fees page shows the arithmetic twice: a $1,500 deck carries the $30.00 minimum, and a $50,000 deck carries $440.00 — $8.50 × 50 = $425.00 plus the $15.00 recording fee the page adds to every construction permit.\n\nPermitting runs through two divisions at 645 Pine Street. The Zoning Division issues the land-use permit first — zoning approval 'always comes first,' and zoning fees ($122 on the small-deck example, $475 in two halves on the large one) are separate from the construction permit. The Building & Trades Division (802-863-9094) then issues the Building, Electrical, Plumbing and Mechanical permits, which can all be applied for together in the City's OpenGov portal.\n\nVermont's statewide plumbing rules apply in Burlington 'without exception,' and state-licensed master plumbers and electricians pull their own trade permits. The City publishes no stand-alone trade fee schedule online — trade fees are set at application by the Trades Division — so this dataset prices the building permit the ordinance fixes and documents the trade process.",
  valuationBasis:
    "**Estimated cost of construction** — design, labor and materials — at $8.50 per $1,000, $30.00 minimum, plus the $15.00 recording fee. Partial thousands round up.",
  notIncluded:
    "These figures are the BCO 8-28(a) construction permit fee. They exclude:\n\n- **Zoning permit application fees** — $122 on the City's small-deck example, $250 + $225 (in two halves) on the large one — which are separate land-use charges.\n- **Electrical, plumbing and mechanical trade permit fees**, which the Building & Trades Division sets at application; no stand-alone trade schedule is published online.\n- **Impact fees** and **Certificate of Occupancy fees** (an additional $10.00 where a Building COA is required).\n- **The work-without-permit penalty** under BCO 8-28(f).",
  seoTitle: "Burlington building permit fees",
  seoDescription:
    "How Burlington, Vermont prices building permits — $8.50 per $1,000 of construction cost, $30 minimum, plus the $15 recording fee.",
  publishStatus: "published",
  noindex: false,
  lastReviewedAt: BTV_LAST_VERIFIED,
};

const permitPages: SeedPermitPage[] = [
  {
    jurisdictionKey: BTV_KEYS.jurisdiction,
    permitTypeKey: "building",
    slug: "building-permit-fees",
    seoTitle: "Burlington building permit fees",
    seoDescription:
      "Burlington, Vermont building permit fees — $8.50 per $1,000 of estimated construction cost, $30 minimum, plus the $15 recording fee.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: BTV_LAST_VERIFIED,
    title: "Burlington building permit fees",
    intro:
      "A Burlington building permit is priced from the **estimated cost of construction** at **$8.50 per $1,000.00**, with a **$30.00 minimum** under BCO Chapter 8-28(a) — plus the **$15.00 recording fee** the City adds to every construction permit. The City's own example prices a $50,000 deck at exactly **$440.00**.",
    localSummary:
      "Burlington's building fee is a single linear rate written into the Code of Ordinances, and the City quotes it on its own application page: fees are based on the estimated cost of construction — design, labor and materials — at $8.50 per $1,000.00, minimum $30.00 (BCO 8-28(a)). There are no valuation bands, no occupancy splits and no plan-review percentage to layer on top.\n\nThe arithmetic is one multiplication. A $12,000 shed prices $8.50 × 12 = $102.00 plus the $15.00 recording fee. A $50,000 deck — the City's printed COA Level II example — prices $8.50 × 50 = $425.00 plus $15.00 = **$440.00**, exactly as the Permit Fees page states. Small projects meet the minimum: the City's Level I example says a $1,500 deck carries a $30.00 construction permit fee.\n\nTwo process facts matter. First, zoning approval 'always comes first': the Zoning Division's land-use permit (with its own fee schedule — $122 on the small example, $475 in two halves on the large one) precedes every construction permit. Second, the Building & Trades Division issues the Building, Electrical, Plumbing and Mechanical permits, which can all be applied for together in the City's OpenGov portal. Work without an issued permit triggers the additional fees of BCO 8-28(f).",
    notIncluded:
      "This is the BCO 8-28(a) construction permit fee. It excludes:\n\n- **Zoning permit fees** — the land-use permit that precedes construction, with its own application, filing and COA fees.\n- **Electrical, plumbing and mechanical trade permits**, which the Trades Division issues separately and prices at application.\n- **Impact fees** and the **$10.00 Building Certificate of Occupancy** addition.\n- **The work-without-permit penalty** under BCO 8-28(f).",
    workedExample: {
      scenario:
        "A new $50,000 deck in Burlington — the City's own COA Level II fee example.",
      inputs: {
        occupancy: "residential",
        valuationCents: 5_000_000,
      },
      notes:
        "Permit fee: $8.50 × 50 = $425.00. Recording fee: $15.00. Total: **$440.00** — matching the City's Permit Fees page digit for digit ('$8.50 per $1,000 of construction cost plus $15 recording fee').\n\nThe zoning permit for the same deck carries separate fees ($250 at application + $225 at pickup in the City's example), which this calculation does not include.",
    },
    faqs: [
      {
        question: "How much is a building permit in Burlington, Vermont?",
        answer:
          "$8.50 per $1,000 of estimated construction cost, with a $30.00 minimum (BCO Chapter 8-28(a)), plus a $15.00 recording fee. A $50,000 project prices $440.00.",
      },
      {
        question: "Where is the fee set?",
        answer:
          "In the Burlington Code of Ordinances, Chapter 8-28(a); the City's Permit Applications and Forms page quotes the rate and minimum directly.",
      },
      {
        question: "What counts as estimated cost of construction?",
        answer:
          "Design, labor and material costs — the City's application page says to arrive with the project's estimated construction cost dollar figure.",
      },
      {
        question: "Is there a minimum fee?",
        answer:
          "Yes — $30.00. The City's example applies it to any project up to $2,858 of construction cost.",
      },
      {
        question: "What is the $15 recording fee?",
        answer:
          "A per-permit recording charge the City adds to construction permits — its $50,000-deck example prices $425.00 at the rate 'plus $15 recording fee' for $440.00 total.",
      },
      {
        question: "Do I need a zoning permit too?",
        answer:
          "Yes — zoning approval always comes first, and zoning fees are separate: $122 on the City's small-deck example, $475 in two halves on the large one.",
      },
      {
        question: "Are electrical and plumbing permits extra?",
        answer:
          "Yes — the Trades Division issues them as separate permits and prices them at application; the City publishes no stand-alone trade fee schedule online.",
      },
      {
        question: "How do I apply?",
        answer:
          "Through the City's OpenGov portal or at Permitting & Inspections, 645 Pine Street; the Zoning Division (802-865-7188) and Building & Trades Division (802-863-9094) handle their respective permits.",
      },
      {
        question: "What happens if I start work without a permit?",
        answer:
          "Additional work-without-permit fees under BCO 8-28(f) — the City's application page warns work must not begin without an issued permit.",
      },
      {
        question: "Is plan review charged separately?",
        answer:
          "No — the ordinance's fee is the whole construction permit charge; no plan-review percentage appears in Chapter 8-28(a) or on the City's fee pages.",
      },
    ],
  },
  {
    jurisdictionKey: BTV_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    slug: "electrical-permit-fees",
    seoTitle: "Burlington electrical permit fees",
    seoDescription:
      "How Burlington, Vermont issues electrical permits — separate Trades Division permits under state rules, priced at application.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: BTV_LAST_VERIFIED,
    title: "Burlington electrical permit fees",
    intro:
      "Burlington issues electrical permits as **separate permits through the Building & Trades Division** — 'most applications that require a zoning permit also require a Building, Electrical, Plumbing and/or Mechanical permit' — with the fee set by the Division at application. The City publishes no stand-alone trade fee schedule online.",
    localSummary:
      "Electrical work in Burlington files its own permit. The City's Construction Permits page is explicit: most projects need the Building, Electrical, Plumbing and/or Mechanical permits alongside the zoning permit, all of which can be applied for together in the City's OpenGov portal, with zoning approval first.\n\nWhat the City does not publish is a trade fee schedule. The building permit's rate ($8.50 per $1,000 of estimated construction cost, BCO 8-28(a)) is the only fee the City's pages print; trade permits are priced by the Building & Trades Division at application, and the Division's number — 802-863-9094 — is the quoted route for 'what will be required for your construction permit(s).'\n\nTwo Burlington specifics shape the electrical work itself: the City's charter reaches every structure including owner-occupied single-family homes, and the State of Vermont's licensing and rule adoptions apply. Contact the Trades Division before filing to get the fee for your scope.",
    notIncluded:
      "This page documents the electrical permitting process. It excludes:\n\n- **A priced electrical fee table** — the City publishes none online; fees are set at application by the Trades Division.\n- **The building permit fee**, which the electrical permit accompanies on most projects.\n- **State of Vermont electrical licensing fees**, which are state charges.\n- **Impact and zoning fees**, which are separate City processes.",
    workedExample: {
      scenario:
        "The building permit for the same project an electrical permit rides on — priced at the BCO 8-28(a) rate the ordinance fixes.",
      inputs: {
        occupancy: "residential",
        valuationCents: 2_000_000,
      },
      notes:
        "A $20,000 project whose electrical work files its own trade permit carries a building permit of $8.50 x 20 = $170.00 + $15.00 recording = **$185.00**.\n\nThe electrical permit's own fee is set by the Trades Division at application and is not published online — this worked example prices the building permit it accompanies, which the ordinance does fix.",
    },
    faqs: [
      {
        question: "How much is an electrical permit in Burlington?",
        answer:
          "The Building & Trades Division sets electrical permit fees at application; the City publishes no stand-alone trade fee schedule online. Call 802-863-9094 for your scope.",
      },
      {
        question: "Is the electrical permit included in the building permit?",
        answer:
          "No — it is a separate permit, though both can be applied for together in the City's OpenGov portal.",
      },
      {
        question: "Who can pull the electrical permit?",
        answer:
          "Vermont-licensed electricians; the City's charter reaches all structures, including owner-occupied single-family homes.",
      },
      {
        question: "Do I need a zoning permit first?",
        answer:
          "Yes — zoning approval always comes before construction permits in Burlington.",
      },
      {
        question: "What does the building permit cost while I wait?",
        answer:
          "$8.50 per $1,000 of estimated construction cost with a $30.00 minimum, plus $15.00 recording — see the building permit page.",
      },
      {
        question: "How do I apply?",
        answer:
          "Through the City's OpenGov portal with the other project permits, or at Permitting & Inspections, 645 Pine Street.",
      },
      {
        question: "What inspections are required?",
        answer:
          "The Trades Division schedules the inspections your scope requires; contact it as early as possible to learn the requirements.",
      },
      {
        question: "Are state rules different in Burlington?",
        answer:
          "The City adopts state electrical rules without exception, and its charter extends permitting to every structure in the City.",
      },
    ],
  },
  {
    jurisdictionKey: BTV_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    slug: "plumbing-permit-fees",
    seoTitle: "Burlington plumbing permit fees",
    seoDescription:
      "How Burlington, Vermont issues plumbing permits — state plumbing rules adopted without exception, separate Trades Division permits.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: BTV_LAST_VERIFIED,
    title: "Burlington plumbing permit fees",
    intro:
      "Burlington issues plumbing permits as **separate permits through the Building & Trades Division**, under the **State of Vermont Plumbing Rules adopted 'without exception'** — with the fee set by the Division at application. Owner-occupants may pull the permit for their own single-family home.",
    localSummary:
      "The City's Plumbing/Mechanical page states the legal frame: Burlington adopts the State of Vermont Plumbing Rules, and its adoption 'are no different and the same as the State of Vermont without exception.' Vermont master licensed plumbers must secure permits before working in the City; the one owner exception is the single-family home you occupy, where you may perform your own plumbing work including securing the permit.\n\nThe permit process runs through the Building & Trades Division alongside the building, electrical and mechanical permits, with the City's characteristic inspection ladder: underground inspection before covering, rough inspection before walls close in, and a final inspection confirming the system's operation.\n\nAs with the other trades, the City publishes no stand-alone plumbing fee schedule online — fees are set at application (802-863-9094). The building permit's printed rate remains the one fee the City's pages fix.",
    notIncluded:
      "This page documents the plumbing permitting process. It excludes:\n\n- **A priced plumbing fee table** — the City publishes none online; fees are set at application by the Trades Division.\n- **The building permit fee**, which the plumbing permit accompanies on most projects.\n- **Sewer and water connection charges**, which are utility matters.\n- **Zoning and impact fees**, which are separate City processes.",
    workedExample: {
      scenario:
        "The building permit for a plumbing-heavy renovation — priced at the BCO 8-28(a) rate the ordinance fixes.",
      inputs: {
        occupancy: "residential",
        valuationCents: 3_500_000,
      },
      notes:
        "A $35,000 bathroom-and-kitchen renovation whose plumbing files its own trade permit carries a building permit of $8.50 x 35 = $297.50 + $15.00 recording = **$312.50**.\n\nThe plumbing permit's own fee is set by the Trades Division at application and is not published online — this worked example prices the building permit it accompanies.",
    },
    faqs: [
      {
        question: "How much is a plumbing permit in Burlington?",
        answer:
          "The Building & Trades Division sets plumbing permit fees at application; no stand-alone trade fee schedule is published online. Call 802-863-9094.",
      },
      {
        question: "Can I do my own plumbing work?",
        answer:
          "In the single-family home you occupy, yes — including securing the permit. Rental and public buildings require a Vermont master licensed plumber.",
      },
      {
        question: "What code applies?",
        answer:
          "The State of Vermont Plumbing Rules, which Burlington adopts without exception.",
      },
      {
        question: "What inspections will I need?",
        answer:
          "Underground before covering, rough before walls close in, and final to confirm operation — scheduled with the Plumbing Inspector.",
      },
      {
        question: "Is the plumbing permit part of the building permit?",
        answer:
          "No — it is a separate permit filed alongside the others in the City's OpenGov portal.",
      },
      {
        question: "What about sump pumps?",
        answer:
          "They must discharge to the exterior on your own property — never to public sewer, a neighbor's lot or the City right-of-way.",
      },
      {
        question: "Are bathroom fans required?",
        answer:
          "Yes, in every bathroom without exterior windows of at least 3 square feet, under the City's plumbing ordinances.",
      },
      {
        question: "What does the building permit cost?",
        answer:
          "$8.50 per $1,000 of estimated construction cost with a $30.00 minimum, plus $15.00 recording — see the building permit page.",
      },
    ],
  },
];

const verifications: SeedVerification[] = [
  {
    entityType: "source",
    entityKey: BTV_FEE_SCHEDULE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: BTV_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BTV_FEE_SCHEDULE_KEY,
    notes:
      "Read 2026-09-26 from burlingtonvt.gov (HTTP 200 via text extraction). The BCO 8-28(a) rate statement ('$8.50 per $1,000.00 with a minimum permit fee of thirty ($30.00) dollars') was quoted verbatim from the City's application page, and the $50,000-deck example ($425 + $15 = $440) from the Permit Fees page was checked against the encoded arithmetic.",
  },
  {
    entityType: "fee_rule",
    entityKey: "BTV-BLD-RATE",
    permitTypeKey: "building",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: BTV_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: "btv-permit-fees-page",
    notes:
      "City's COA Level II example reproduced exactly: $8.50 x 50 = $425.00 + $15.00 recording = $440.00 on a $50,000 deck. Level I example confirms the $30.00 minimum.",
  },
  {
    entityType: "jurisdiction_profile",
    entityKey: BTV_KEYS.jurisdiction,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: BTV_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BTV_FEE_SCHEDULE_KEY,
    notes:
      "Profile built from the City's application page (BCO 8-28(a) quote), Permit Fees examples, Construction Permits scope statement, and the Plumbing/Mechanical rules-adoption page.",
  },
  {
    entityType: "permit_page",
    entityKey: "building-permit-fees",
    permitTypeKey: "building",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: BTV_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BTV_FEE_SCHEDULE_KEY,
    notes:
      "Rate and both worked examples verified against the City's application and Permit Fees pages: BCO 8-28(a) at $8.50 per $1,000 with a $30.00 minimum, the $15.00 recording fee, and the City's own $50,000-deck example reproducing to $440.00.",
  },
  {
    entityType: "permit_page",
    entityKey: "electrical-permit-fees",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: BTV_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: "btv-construction-permits",
    notes:
      "The page states the honest absence rather than a fee: the City's Construction Permits page was read to confirm the electrical permit is a separate Trades Division permit whose fee is set at application and published nowhere online. No amount is carried.",
  },
  {
    entityType: "permit_page",
    entityKey: "plumbing-permit-fees",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: BTV_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: "btv-construction-permits",
    notes:
      "Same absence-of-schedule verification: the Plumbing/Mechanical page and the Construction Permits page confirm the trade permit is issued and priced at application, with no published fee table. No amount is carried.",
  },
];

export const burlingtonSeed: JurisdictionSeed = {
  state,
  county,
  jurisdiction,
  departments,
  sources,
  permitTypes: [],
  projectTypes: [],
  jurisdictionPermitTypes: [
    {
      jurisdictionKey: BTV_KEYS.jurisdiction,
      permitTypeKey: "building",
      isAvailable: true,
      localName: "Building permit (BCO 8-28(a))",
      officialUrl: "https://www.burlingtonvt.gov/548/Permit-Applications-and-Forms",
      notes:
        "$8.50 per $1,000 of estimated construction cost, $30.00 minimum, plus the $15.00 recording fee; set by ordinance.",
    },
    {
      jurisdictionKey: BTV_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      isAvailable: true,
      localName: "Electrical permit (Building & Trades Division)",
      officialUrl: "https://www.burlingtonvt.gov/701/Construction-Permits",
      notes:
        "Separate permit; fee set by the Trades Division at application — no stand-alone schedule published online.",
    },
    {
      jurisdictionKey: BTV_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      isAvailable: true,
      localName: "Plumbing permit (Building & Trades Division)",
      officialUrl: "https://www.burlingtonvt.gov/550/Plumbing-Mechanical",
      notes:
        "Separate permit under the state plumbing rules adopted without exception; fee set at application.",
    },
  ],
  feeSchedules,
  feeRules,
  requirements: [],
  profile,
  permitPages,
  verifications,
};

export const BTV_PUBLISHED_PERMIT_PAGES = burlingtonSeed.permitPages.filter(
  (page) => page.publishStatus === "published" && !page.noindex,
);
