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
  HNL_BUILDING_RULES,
  HNL_FEE_EFFECTIVE_FROM,
  HNL_ROH_KEY,
} from "./fee-rules";

export * from "./fee-rules";

/**
 * The complete Honolulu, Hawaii seed payload.
 *
 * Every figure traces to research/hawaii/honolulu.md, which traces to the
 * Revised Ordinances of Honolulu Chapter 18, Table No. 18-A and §§ 18-6.1/
 * 18-6.2, read on the American Legal Publishing code host through a real
 * browser session. The permit is consolidated: electrical, plumbing,
 * heating and air-conditioning work rides the building permit's valuation
 * (ROH § 18-6.2(b)), so the seed publishes one page.
 */

const RESEARCHER = "Permit Fee Intelligence research pass (Hawaii)";

export const HNL_LAST_VERIFIED = "2026-09-26";

export const HNL_KEYS = {
  state: "hi",
  county: "honolulu-county",
  jurisdiction: "honolulu",
  feeSchedule: HNL_ROH_KEY,
} as const;

const state: SeedState = {
  code: "HI",
  slug: "hawaii",
  name: "Hawaii",
  fipsCode: "15",
};

const county: SeedCounty = {
  key: HNL_KEYS.county,
  slug: "honolulu-county",
  name: "Honolulu County",
  fipsCode: "15003",
};

const jurisdiction: SeedJurisdiction = {
  key: HNL_KEYS.jurisdiction,
  stateKey: HNL_KEYS.state,
  countyKey: HNL_KEYS.county,
  type: "city",
  slug: "honolulu",
  name: "Honolulu",
  officialName: "City and County of Honolulu, Hawaii",
  websiteUrl: "https://www.honolulu.gov/",
  permitPortalUrl: "https://www.honolulu.gov/dpp/permitting/building-permits-home/building-permit-requriements/",
  timezone: "Pacific/Honolulu",
  isActive: true,
};

const departments: SeedDepartment[] = [
  {
    key: "honolulu-dpp",
    jurisdictionKey: HNL_KEYS.jurisdiction,
    kind: "building",
    name: "Department of Planning & Permitting (DPP)",
    phone: "(808) 768-8220",
    email: "eplans@honolulu.gov",
    url: "https://www.honolulu.gov/dpp/permitting/building-permits-home/building-permit-requriements/",
    addressLine: "650 South King Street, Honolulu, HI 96813",
    hours: "Monday through Friday, 7:45 a.m. to 4:30 p.m.",
    notes:
      "DPP's Permit Center issues building permits for the City and County of Honolulu and publishes the fee calculator and the Table 18-A schedule this seed prices from.",
  },
];

const sources: SeedSource[] = [
  {
    key: HNL_ROH_KEY,
    jurisdictionKey: HNL_KEYS.jurisdiction,
    title:
      "Revised Ordinances of Honolulu, Chapter 18 — Table No. 18-A and §§ 18-6.1/18-6.2",
    url: "https://codelibrary.amlegal.com/codes/honolulu/latest/honolulu/0-0-0-17450",
    sourceType: "municipal_code",
    issuingAuthority: "City and County of Honolulu",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2024-05-31",
    effectiveFrom: HNL_FEE_EFFECTIVE_FROM,
    retrievedAt: HNL_LAST_VERIFIED,
    lastVerifiedAt: HNL_LAST_VERIFIED,
    notes:
      "Read 2026-09-26 on the American Legal Publishing code host through a real browser session (the host serves HTTP 403 to scripts). Table 18-A: eight bands, $20 flat to $500, then per-$100/per-$1,000 rates on the TOTAL estimated valuation ($8+$2.50/$100 to $1,000; $12+$2.20/$100 to $20,000; $82+$18/k to $50,000; $286+$14/k to $100,000; $700+$10/k to $500,000; $3,200+$5/k to $2,000,000; $4,300+$4.50/k above). § 18-6.2(b) fixes the valuation as the total value of all construction work including electrical, plumbing, heating and air conditioning. § 18-6.1: plan review 20% of the tentative permit fee, capped at $25,000. Amendment list ends Ords. 92-74 through 19-21, 20-18.",
  },
  {
    key: "honolulu-dpp-fee-calculator",
    jurisdictionKey: HNL_KEYS.jurisdiction,
    title: "DPP Building Permit Fee Calculator",
    url: "https://www.honolulu.gov/dpp/permitting/building-permits-home/bp-fee-calc/",
    sourceType: "official_calculator",
    issuingAuthority: "City and County of Honolulu DPP",
    authorityKind: "city",
    isPrimary: true,
    documentDate: HNL_LAST_VERIFIED,
    effectiveFrom: HNL_FEE_EFFECTIVE_FROM,
    retrievedAt: HNL_LAST_VERIFIED,
    lastVerifiedAt: HNL_LAST_VERIFIED,
    notes:
      "The City's own estimator: 'Use this calculator to estimate plans review and permit fees associated with obtaining a building permit. Enter the project valuation in the box.' Confirms one consolidated permit priced from a single valuation.",
  },
];

const feeSchedules: SeedFeeSchedule[] = [
  {
    key: HNL_KEYS.feeSchedule,
    jurisdictionKey: HNL_KEYS.jurisdiction,
    sourceKey: HNL_ROH_KEY,
    title: "Honolulu building permit fees — ROH Table No. 18-A",
    officialUrl: "https://codelibrary.amlegal.com/codes/honolulu/latest/honolulu/0-0-0-17450",
    effectiveFrom: HNL_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: HNL_LAST_VERIFIED,
    notes:
      "Eight bands reading the total valuation, with the printed dollar amounts as band floors; plan review at 20% capped at $25,000.",
  },
];

const feeRules: SeedFeeRule[] = HNL_BUILDING_RULES.map((rule) => ({
  jurisdictionKey: HNL_KEYS.jurisdiction,
  permitTypeKey: "building",
  scheduleKey: HNL_KEYS.feeSchedule,
  rule,
}));

const profile: SeedProfile = {
  jurisdictionKey: HNL_KEYS.jurisdiction,
  headline: "What building permits cost in Honolulu",
  summary:
    "Honolulu prices its building permit from the **total estimated valuation of work** on ROH Table 18-A: **$20.00** to $500 of valuation, then rates from **$2.50 per $100** down to **$4.50 per $1,000** across eight bands — read on the whole valuation, with the printed dollar amounts as floors. Plan review adds **20% of the permit fee, capped at $25,000**. The permit is consolidated: electrical, plumbing and mechanical work ride the same valuation.",
  localContext:
    "Honolulu's permit is one permit. Chapter 18 of the Revised Ordinances covers the building, electrical, plumbing and sidewalk codes together, and § 18-6.2(b) defines the valuation as 'the total value of all construction work ... as well as all finish work, painting, roofing, electrical, plumbing, heating, air conditioning, elevators, fire extinguishing systems, and any other permanent work or permanent equipment.' There are no separate trade permits to price — the trades are inside the number.\n\nThe fee table itself, Table 18-A, rewards careful reading. Every band after the first phrases its rate as '$8 + $2.50 per $100 ... of the total estimated valuation of work' — of the *total*, not of the excess. That reading is the only one that makes sense: a marginal reading would price a $50,000 project at $622 under the fourth band and then drop to $286 under the fifth, a fee that falls as the project grows. Read on the whole valuation, the ladder climbs smoothly — $20 at the floor, $232 at $10,000, $982 at $50,000, $5,700 at $500,000 — with the printed dollar amounts acting as the band's floor rather than its chained base.\n\n'Or fraction thereof' appears in every band, so each partial $100 or $1,000 buys a whole block. Plan review rides on top at 20% of the permit fee, capped by the ordinance at $25,000, and is not required for fences, retaining walls, pools and driveways. The DPP's own online calculator prices exactly this: one valuation in, plans review plus permit fees out.",
  valuationBasis:
    "The **total estimated valuation of work** — including all electrical, plumbing, mechanical and permanent equipment — read against Table 18-A's eight bands, with each band's rate applied to the whole valuation and the printed amount as the band's floor. 'Or fraction thereof' rounds every partial block up.",
  notIncluded:
    "These figures are Honolulu's consolidated building permit fees from ROH Table 18-A. They exclude:\n\n- **Other-fee rows on the same table**: plan review of revisions ($200 or 10% of the original permit fee, whichever is greater), temporary C/O ($200), change of contractor ($50), material-methods applications ($300), special assignment inspection ($1,000), master tract model review ($500), third-party certification ($500 initial, $1,000 renewal).\n- **Trade permits** — there are none: electrical, plumbing, heating and air-conditioning work is part of the building permit's valuation by § 18-6.2(b).\n- **After-hours inspections**, priced under Chapter 6, Article 12.\n- **Impact, zoning and wastewater fees**, which are separate DPP and BFS processes.",
  seoTitle: "Honolulu building permit fees",
  seoDescription:
    "How Honolulu, Hawaii prices building permits — ROH Table 18-A: $20 flat to $500, then per-$100/per-$1,000 rates on the total valuation, with plan review at 20% capped at $25,000.",
  publishStatus: "published",
  noindex: false,
  lastReviewedAt: HNL_LAST_VERIFIED,
};

const permitPages: SeedPermitPage[] = [
  {
    jurisdictionKey: HNL_KEYS.jurisdiction,
    permitTypeKey: "building",
    slug: "building-permit-fees",
    seoTitle: "Honolulu building permit fees",
    seoDescription:
      "Honolulu, Hawaii building permit fees — ROH Table 18-A: $20 flat to $500, rates from $2.50 per $100 down to $4.50 per $1,000 on the total valuation, plan review at 20% (max $25,000).",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: HNL_LAST_VERIFIED,
    title: "Honolulu building permit fees",
    intro:
      "A Honolulu building permit is priced from the **total estimated valuation of work** on ROH Table 18-A: **$20.00** up to $500 of valuation, then rates that step down as projects grow — **$2.50 per $100** around $1,000, **$2.20 per $100** through $20,000, **$18 per $1,000** through $50,000, down to **$4.50 per $1,000** above $2,000,000. Plan review adds **20% of the permit fee**, capped at **$25,000**, and the permit is consolidated — electrical, plumbing and mechanical work are inside the valuation.",
    localSummary:
      "One permit, one valuation, eight bands — that is the whole structure. Chapter 18 of the Revised Ordinances covers the building, electrical, plumbing and sidewalk codes together, and § 18-6.2(b) includes electrical, plumbing, heating and air-conditioning work in the valuation the fee is read from. A kitchen remodel's plumbing, a panel upgrade's electrical work and the air conditioning all sit inside the single number DPP prices.\n\nThe bands read the total valuation. Each band's phrase is 'per $100 (or $1,000) ... of the total estimated valuation of work', with the printed dollar amount — $8, $12, $82, $286, $700, $3,200, $4,300 — as the band's floor. On that reading the fee is monotone: $232.00 at $10,000 of valuation, $982.00 at $50,000, $1,686.00 at $100,000, $5,700.00 at $500,000. (Reading the rates as marginal would make the fee drop $336 at the $50,000 seam — arithmetic impossibility, and the reason the total reading is the honest one.)\n\n'Or fraction thereof' buys a whole $100 or $1,000 block for any fraction, so $10,100 of valuation prices one block above $10,000. Plan review adds 20% of the permit fee whenever plans are required (§ 18-4.2), capped by the ordinance at $25,000 — $46.40 on a $232 permit, $196.40 on a $982 permit. Fences, retaining walls, pools, driveways and similar city-agency work are exempt from plan review by § 18-6.1(b).",
    notIncluded:
      "This is the consolidated building permit under ROH Table 18-A. It excludes:\n\n- **Other-fee rows on the same table** — plan review of revisions ($200 or 10% of the original permit fee, whichever is greater), temporary C/O $200, change of contractor $50, material-methods applications $300, special assignment inspection $1,000, master tract model review $500, third-party certification $500/$1,000, renewal of material-methods approvals $100.\n- **Trade permits** — there are none: § 18-6.2(b) puts electrical, plumbing, heating and air conditioning inside the building permit's valuation.\n- **After-hours inspections** (Chapter 6, Article 12 rates).\n- **Impact fees, wastewater and zoning charges** — separate DPP processes.",
    workedExample: {
      scenario:
        "A single-family home addition in Honolulu with a total estimated valuation of $50,000, plans included.",
      inputs: {
        occupancy: "residential",
        valuationCents: 5_000_000,
      },
      notes:
        "Band 4 ($20,000.01-$50,000) reads the total valuation: $82.00 + 50 x $18.00 = $82.00 + $900.00 = **$982.00**.\n\nPlan review adds 20% of the permit fee: $982.00 x 0.20 = **$196.40**. Total with review: **$1,178.40**.\n\nA $10,000 valuation would price $12.00 + 100 x $2.20 = $232.00, with $46.40 of plan review.",
    },
    faqs: [
      {
        question: "How much is a building permit in Honolulu?",
        answer:
          "$20.00 up to $500 of valuation, then Table 18-A's per-$100 and per-$1,000 rates applied to the total valuation: $232.00 at $10,000, $982.00 at $50,000, $5,700.00 at $500,000.",
      },
      {
        question: "Do I need separate electrical and plumbing permits?",
        answer:
          "No — Honolulu's building permit is consolidated. ROH § 18-6.2(b) includes electrical, plumbing, heating and air-conditioning work in the valuation the fee is read from.",
      },
      {
        question: "How does the fee work — is the rate on the whole valuation?",
        answer:
          "Yes. Each band's rate reads the total estimated valuation of work, with the printed dollar amount as the band's floor. That is the only reading that makes the fee rise smoothly from band to band.",
      },
      {
        question: "What does 'or fraction thereof' mean?",
        answer:
          "Any partial $100 (or $1,000, in the upper bands) is charged as a whole block. $10,100 of valuation prices one block above $10,000.",
      },
      {
        question: "How much is plan review?",
        answer:
          "20% of the building permit fee, capped at $25,000 by ROH § 18-6.1. It is required when plans are submitted, except for fences, retaining walls, pools, driveways and similar city-agency work.",
      },
      {
        question: "What does a temporary certificate of occupancy cost?",
        answer:
          "$200.00 — one of the other-fee rows on Table 18-A.",
      },
      {
        question: "What happens if I start work without a permit?",
        answer:
          "ROH § 18-6.2(d) triples the fees for work that starts or proceeds before the permit is obtained, and the payment does not relieve anyone from complying with the code.",
      },
      {
        question: "How is the valuation determined?",
        answer:
          "By the building official under § 18-6.2(b): the total value of all construction work including finish work, painting, roofing, electrical, plumbing, heating, air conditioning, elevators, fire extinguishing systems and any other permanent work or equipment.",
      },
      {
        question: "Is there a fee calculator?",
        answer:
          "Yes — DPP publishes an official fee calculator (enter the project valuation) that estimates plans review and permit fees.",
      },
      {
        question: "When did the current fees take effect?",
        answer:
          "Table 18-A's amendment list ends with Ordinances 19-21 and 20-18; the table as amended is the version the City's code host publishes today.",
      },
      {
        question: "Does the permit cover the sidewalk too?",
        answer:
          "Chapter 18 covers the building, electrical, plumbing and sidewalk codes together; sidewalk-related charges follow the same chapter's framework.",
      },
      {
        question: "How do I apply?",
        answer:
          "Through DPP's Permit Center (808-768-8220, eplans@honolulu.gov), 650 South King Street, with ePlans for electronic submittal.",
      },
    ],
  },
];

const verifications: SeedVerification[] = [
  {
    entityType: "source",
    entityKey: HNL_ROH_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: HNL_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: HNL_ROH_KEY,
    notes:
      "Read 2026-09-26. Table 18-A's eight bands, the § 18-6.2(b) valuation definition and the § 18-6.1 plan-review percentage and cap were transcribed from the American Legal Publishing code host in a real browser session. The total-valuation reading was verified by monotonicity across all eight seams.",
  },
  {
    entityType: "fee_rule",
    entityKey: "HNL-BLD-B4",
    permitTypeKey: "building",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: HNL_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: HNL_ROH_KEY,
    notes:
      "Band 4: '$82 + $18 per $1,000 or fraction thereof of the total estimated valuation of work' — read on the whole valuation ($982.00 at $50,000), the only monotone reading.",
  },
  {
    entityType: "jurisdiction_profile",
    entityKey: HNL_KEYS.jurisdiction,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: HNL_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: HNL_ROH_KEY,
    notes:
      "Profile built from ROH Chapter 18 and DPP's calculator/requirements pages; the consolidated-permit structure is stated on the record with the ordinance citation.",
  },
  {
    entityType: "permit_page",
    entityKey: "building-permit-fees",
    permitTypeKey: "building",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: HNL_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: HNL_ROH_KEY,
    notes:
      "Recorded for the editorial gate: this page's prose, sources and fee-rule mapping were checked against the schedule published by City and County of Honolulu, Hawaii during the research pass that produced this seed; the seed's content tests assert the arithmetic. No amount on this page is estimated.",
  },
];

export const honoluluSeed: JurisdictionSeed = {
  state,
  county,
  jurisdiction,
  departments,
  sources,
  permitTypes: [],
  projectTypes: [],
  jurisdictionPermitTypes: [
    {
      jurisdictionKey: HNL_KEYS.jurisdiction,
      permitTypeKey: "building",
      isAvailable: true,
      localName: "Building permit (consolidated — ROH Table 18-A)",
      officialUrl: "https://codelibrary.amlegal.com/codes/honolulu/latest/honolulu/0-0-0-17450",
      notes:
        "One consolidated permit covering building, electrical, plumbing and sidewalk-code work; priced from the total estimated valuation of work on Table 18-A's eight bands, with plan review at 20% capped at $25,000.",
    },
  ],
  feeSchedules,
  feeRules,
  requirements: [],
  profile,
  permitPages,
  verifications,
};

export const HNL_PUBLISHED_PERMIT_PAGES = honoluluSeed.permitPages.filter(
  (page) => page.publishStatus === "published" && !page.noindex,
);
