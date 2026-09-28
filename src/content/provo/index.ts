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
  PRV_BUILDING_RULES,
  PRV_ELECTRICAL_RULES,
  PRV_FEE_EFFECTIVE_FROM,
  PRV_FEE_SCHEDULE_KEY,
  PRV_PLUMBING_RULES,
} from "./fee-rules";

export * from "./fee-rules";

/**
 * The complete Provo, Utah seed payload.
 *
 * Every figure traces to research/utah/provo.md, which traces to the Provo
 * City Consolidated Fee Schedule (Inspection Fees) and the unamended 1997 UBC
 * Table 1-A it adopts as the building permit fee chart.
 */

const RESEARCHER = "Permit Fee Intelligence research pass (Utah)";

export const PRV_LAST_VERIFIED = "2026-09-26";

export const PRV_KEYS = {
  state: "ut",
  county: "utah-county",
  jurisdiction: "provo",
  feeSchedule: PRV_FEE_SCHEDULE_KEY,
} as const;

const state: SeedState = {
  code: "UT",
  slug: "utah",
  name: "Utah",
  fipsCode: "49",
};

const county: SeedCounty = {
  key: PRV_KEYS.county,
  slug: "utah-county",
  name: "Utah County",
  fipsCode: "49049",
};

const jurisdiction: SeedJurisdiction = {
  key: PRV_KEYS.jurisdiction,
  stateKey: PRV_KEYS.state,
  countyKey: PRV_KEYS.county,
  type: "city",
  slug: "provo",
  name: "Provo",
  officialName: "Provo City Corporation, Utah",
  websiteUrl: "https://www.provo.gov/",
  permitPortalUrl: "https://www.provo.gov/200/Building",
  timezone: "America/Denver",
  isActive: true,
};

const departments: SeedDepartment[] = [
  {
    key: "provo-building-inspection",
    jurisdictionKey: PRV_KEYS.jurisdiction,
    kind: "building",
    name: "Building Inspection Division",
    phone: "(801) 852-6410",
    email: null,
    url: "https://www.provo.gov/200/Building",
    addressLine: "351 West Center Street, Provo, UT 84601",
    hours: "Monday through Friday, 7:00 a.m. to 6:00 p.m.",
    notes:
      "Issues building, electrical, plumbing and mechanical permits for the city; building permit fees come from the 1997 UBC fee chart the Consolidated Fee Schedule adopts, with plan review at 65%.",
  },
];

const sources: SeedSource[] = [
  {
    key: PRV_FEE_SCHEDULE_KEY,
    jurisdictionKey: PRV_KEYS.jurisdiction,
    title: "Provo City Consolidated Fee Schedule — Inspection Fees",
    url: "https://provo.municipal.codes/Code/FS_Inspection",
    sourceType: "municipal_code",
    issuingAuthority: "Provo City Corporation",
    authorityKind: "city",
    isPrimary: true,
    documentDate: PRV_LAST_VERIFIED,
    effectiveFrom: PRV_FEE_EFFECTIVE_FROM,
    retrievedAt: PRV_LAST_VERIFIED,
    lastVerifiedAt: PRV_LAST_VERIFIED,
    notes:
      "Read 2026-09-26 via text extraction proxy (direct fetch 403). Inspection Fees: 'Building permit — Based on the 1997 UBC Fee Chart. Building Valuation — Based upon International Code Council Building Valuation Data. Plan review — 65% of the Building Permit Fee.' Trade rows: Electrical Inspection $75, Commercial Electrical $175, Mechanical minimum $75, Commercial Mechanical $175, Plumbing minimum $75 with first fixture $20 / additional $6 / water heater $6. 'For residential structures with not more than 4 units the building permit fee includes the plumbing, electrical, and mechanical permit fees.'",
  },
  {
    key: "provo-faq-building-codes",
    jurisdictionKey: PRV_KEYS.jurisdiction,
    title: "provo.gov FAQ — building codes and permit cost basis",
    url: "https://www.provo.gov/FAQ.aspx?QID=91",
    sourceType: "municipal_website",
    issuingAuthority: "Provo City Corporation",
    authorityKind: "city",
    isPrimary: true,
    documentDate: PRV_LAST_VERIFIED,
    effectiveFrom: PRV_FEE_EFFECTIVE_FROM,
    retrievedAt: PRV_LAST_VERIFIED,
    lastVerifiedAt: PRV_LAST_VERIFIED,
    notes:
      "'The permit cost is based on the cost (valuation) of the construction. We use a table found in the 1997 UBC to assess the permit fees. A plan check fee of 65% of the building permit fee is charged. A state fee of 1% of the building permit fee is charged and sent to the state for training of inspectors and contractors.'",
  },
  {
    key: "ubc-1997-table-1a",
    jurisdictionKey: PRV_KEYS.jurisdiction,
    title: "1997 UBC Table 1-A Building Permit Fee Schedule (verbatim adoption)",
    url: "https://municode.northglenn.org/ch10/content_10-2.html",
    sourceType: "municipal_code",
    issuingAuthority: "International Conference of Building Officials (ICBO)",
    authorityKind: "other",
    isPrimary: true,
    documentDate: "1997-01-01",
    effectiveFrom: PRV_FEE_EFFECTIVE_FROM,
    retrievedAt: PRV_LAST_VERIFIED,
    lastVerifiedAt: PRV_LAST_VERIFIED,
    notes:
      "The 1997 UBC Table 1-A ladder Provo's schedule adopts: $23.50 to $500; $23.50 + $3.05/$100 to $2,000; $69.25 + $14.00/$1,000 to $25,000; $391.25 + $10.10/$1,000 to $50,000; $643.75 + $7.00/$1,000 to $100,000; $993.75 + $5.60/$1,000 to $500,000; $3,233.75 + $4.75/$1,000 to $1,000,000; $5,608.75 + $3.15/$1,000 above. Transcribed verbatim from a municipal code adopting the table; band bases chain exactly.",
  },
  {
    key: "provo-building-division",
    jurisdictionKey: PRV_KEYS.jurisdiction,
    title: "Provo Building Division",
    url: "https://www.provo.gov/200/Building",
    sourceType: "municipal_website",
    issuingAuthority: "Provo City Building Inspection Division",
    authorityKind: "city",
    isPrimary: true,
    documentDate: PRV_LAST_VERIFIED,
    effectiveFrom: PRV_FEE_EFFECTIVE_FROM,
    retrievedAt: PRV_LAST_VERIFIED,
    lastVerifiedAt: PRV_LAST_VERIFIED,
    notes:
      "The issuing office (351 West Center Street, 801-852-6410): permit applications, inspections and contractor resources.",
  },
];

const feeSchedules: SeedFeeSchedule[] = [
  {
    key: PRV_KEYS.feeSchedule,
    jurisdictionKey: PRV_KEYS.jurisdiction,
    sourceKey: PRV_FEE_SCHEDULE_KEY,
    title: "Provo Consolidated Fee Schedule — building permit fees on the 1997 UBC chart",
    officialUrl: "https://provo.municipal.codes/Code/FS_Inspection",
    effectiveFrom: PRV_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: PRV_LAST_VERIFIED,
    notes:
      "Eight 1997 UBC Table 1-A valuation bands with chained bases plus a 65% plan-review rate; each partial increment rounds up under the chart's 'or fraction thereof' wording.",
  },
];

function attach(permitTypeKey: string, rules: SeedFeeRule["rule"][]): SeedFeeRule[] {
  return rules.map((rule) => ({
    jurisdictionKey: PRV_KEYS.jurisdiction,
    permitTypeKey,
    scheduleKey: PRV_KEYS.feeSchedule,
    rule,
  }));
}

const feeRules: SeedFeeRule[] = [
  ...attach("building", PRV_BUILDING_RULES),
  ...attach("electrical", PRV_ELECTRICAL_RULES),
  ...attach("plumbing", PRV_PLUMBING_RULES),
];

const profile: SeedProfile = {
  jurisdictionKey: PRV_KEYS.jurisdiction,
  headline: "What building permits cost in Provo",
  summary:
    "Provo prices building permits from **project valuation** on the **1997 UBC Table 1-A** chart: **$23.50** to $500, then per-$100 and per-$1,000 rates stepping from **$14.00 per $1,000** down to **$3.15 per $1,000** — with **plan review at 65%** of the permit fee and a 1% state fee.",
  localContext:
    "Provo's own fee prose is short and stable: the Consolidated Fee Schedule's Inspection Fees section says the building permit is 'based on the 1997 UBC Fee Chart,' and the City's FAQ repeats the mechanism — permit cost based on construction valuation, read from a table found in the 1997 UBC, plan check at 65%, plus a 1% state fee sent to the state for training. That makes the 1997 Uniform Building Code's Table 1-A the operative chart, and its rows chain exactly: $23.50 flat to $500; $23.50 + $3.05 per $100 to $2,000 ($69.25 at the seam); $69.25 + $14.00 per $1,000 to $25,000 ($391.25); $10.10 per $1,000 to $50,000 ($643.75); $7.00 per $1,000 to $100,000 ($993.75); $5.60 per $1,000 to $500,000 ($3,233.75); $4.75 per $1,000 to $1,000,000 ($5,608.75); then $3.15 per $1,000 above.\n\nOne bundling rule matters for houses: for residential structures with not more than 4 units, the building permit fee **includes** the plumbing, electrical and mechanical permit fees. Stand-alone trade permits file at the printed minimums — $75.00 for electrical and plumbing inspection (Commercial Electrical $175.00), with plumbing fixtures priced $20.00 for the first and $6.00 each after.\n\nBuilding Inspection sits at 351 West Center Street and runs plan review at 65% of the permit fee; valuation itself follows International Code Council Building Valuation Data, which the schedule names directly.",
  valuationBasis:
    "**Project valuation** (per ICC Building Valuation Data) read against the 1997 UBC Table 1-A chart: $23.50 flat to $500, $3.05 per $100 to $2,000, $14.00 per $1,000 to $25,000, $10.10 per $1,000 to $50,000, $7.00 per $1,000 to $100,000, $5.60 per $1,000 to $500,000, $4.75 per $1,000 to $1,000,000, then $3.15 per $1,000. Each partial increment rounds up.",
  notIncluded:
    "These figures are the permit fees the City's schedule and the 1997 UBC chart print. They exclude:\n\n- **The 1% state fee** on the building permit fee, which the FAQ documents as a state assessment for inspector and contractor training.\n- **Impact fees** (transportation, water, sewer, stormwater, public safety, parks), which Provo charges from separate schedules.\n- **Mechanical permits** ($75.00 minimum, $175.00 commercial) beyond the summary here.\n- **Development-review and engineering fees** from other sections of the Consolidated Fee Schedule.",
  seoTitle: "Provo building permit fees",
  seoDescription:
    "How Provo, Utah prices building, electrical and plumbing permits — the 1997 UBC chart from $23.50, rates $14 to $3.15 per $1,000, plan review at 65%.",
  publishStatus: "published",
  noindex: false,
  lastReviewedAt: PRV_LAST_VERIFIED,
};

const permitPages: SeedPermitPage[] = [
  {
    jurisdictionKey: PRV_KEYS.jurisdiction,
    permitTypeKey: "building",
    slug: "building-permit-fees",
    seoTitle: "Provo building permit fees",
    seoDescription:
      "Provo, Utah building permit fees — the 1997 UBC Table 1-A chart: $23.50 to $500, rates stepping $14 to $3.15 per $1,000, plan review at 65%.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: PRV_LAST_VERIFIED,
    title: "Provo building permit fees",
    intro:
      "A Provo building permit is priced from **project valuation** on the 1997 UBC Table 1-A chart: a flat **$23.50** up to $500, then rates stepping from **$3.05 per $100** through **$14.00 per $1,000** down to **$3.15 per $1,000** above $1,000,000 — each partial increment rounding up, with **plan review adding 65%** of the permit fee. A $150,000 project prices $1,273.75 in permit fees.",
    localSummary:
      "Provo points its fee schedule at a chart older than most of its building stock: the 1997 Uniform Building Code's Table 1-A, adopted as the 'Building permit — Based on the 1997 UBC Fee Chart' line of the Consolidated Fee Schedule and confirmed by the City's own FAQ. The chart's bands chain with no gaps — $23.50 + 15 x $3.05 is exactly $69.25, and every later base follows the same arithmetic — so no valuation falls between printed bases.\n\nReading the fee is one band lookup: a $12,000 shed sits in the third band at $69.25 + 10 x $14.00 = **$209.25**; a $150,000 addition sits in the sixth at $993.75 + 50 x $5.60 = **$1,273.75**; a $2,000,000 build reaches the top band at $5,608.75 + 1,000 x $3.15 = **$8,758.75**. Each partial $1,000 rounds up.\n\nPlan review is 65% of the permit fee — the $150,000 example becomes $1,273.75 + $827.94 = **$2,101.69** with plans reviewed — and the FAQ adds a 1% state fee on the permit fee that is remitted to the state for inspector and contractor training. For residential structures of up to 4 units, the building permit fee **includes** the plumbing, electrical and mechanical permits, so a house typically files one permit rather than four.\n\nBuilding Inspection issues the permits at 351 West Center Street.",
    notIncluded:
      "This is the 1997 UBC chart's building permit fee as Provo applies it. It excludes:\n\n- **The 1% state fee** on the permit fee, documented by the City's FAQ as a separate state assessment.\n- **Impact fees** — transportation, water, sewer, stormwater and public safety are separate schedules.\n- **Mechanical permits** for commercial work (residential mechanical bundles into the building permit).\n- **Development-review fees** (conditional use permits, plan reviews, subdivisions) from other sections.",
    workedExample: {
      scenario:
        "A commercial tenant improvement in Provo with a project valuation of $150,000.",
      inputs: {
        occupancy: "commercial",
        valuationCents: 15_000_000,
      },
      notes:
        "Sixth band: $993.75 for the first $100,000 plus $5.60 for each of the 50 thousands above: $993.75 + 50 x $5.60 = **$1,273.75**.\n\nPlan review adds 65%: $1,273.75 x 0.65 = $827.94, for **$2,101.69** total where plans are reviewed (plus the 1% state fee).",
    },
    faqs: [
      {
        question: "How much is a building permit in Provo, Utah?",
        answer:
          "It follows the 1997 UBC chart: $23.50 flat to $500, then $3.05 per $100 to $2,000, $14.00 per $1,000 to $25,000, stepping down to $3.15 per $1,000 above $1,000,000. A $150,000 project prices $1,273.75.",
      },
      {
        question: "What is the plan review fee?",
        answer:
          "65% of the building permit fee, charged to check plans before issuance.",
      },
      {
        question: "Is there a state fee on top?",
        answer:
          "Yes — 1% of the building permit fee, sent to the state for training of inspectors and contractors, per the City's FAQ.",
      },
      {
        question: "Are trade permits included in a house permit?",
        answer:
          "Yes — for residential structures with not more than 4 units, the building permit fee includes the plumbing, electrical and mechanical permit fees.",
      },
      {
        question: "Where do these numbers come from?",
        answer:
          "The 1997 UBC Table 1-A chart, which Provo's Consolidated Fee Schedule adopts as the building permit fee basis and which the City's FAQ confirms.",
      },
      {
        question: "How is a partial $1,000 charged?",
        answer:
          "Up — the chart's 'or fraction thereof' wording rounds every partial increment to the next full $1,000 (or $100 in the second band).",
      },
      {
        question: "Do the band bases chain?",
        answer:
          "Exactly: $23.50 + 15 x $3.05 = $69.25, and each later base follows the same arithmetic — no valuation falls between printed bases.",
      },
      {
        question: "What valuation does the chart read?",
        answer:
          "Construction valuation based on International Code Council Building Valuation Data, as the Consolidated Fee Schedule states.",
      },
      {
        question: "Is there a minimum fee?",
        answer: "Yes — $23.50, the chart's first row, for projects valued at $500 or less.",
      },
      {
        question: "How do I apply?",
        answer:
          "Through Provo Building Inspection, 351 West Center Street, 801-852-6410.",
      },
      {
        question: "Does the fee differ for residential and commercial work?",
        answer:
          "The chart reads valuation regardless of occupancy; the bundling rule is the residential distinction.",
      },
      {
        question: "When did Provo last update these fees?",
        answer:
          "The City keeps the 1997 UBC chart as its basis; the current codes adoption (2021 I-codes) took effect July 1, 2021, and the fee basis has remained the UBC chart.",
      },
    ],
  },
  {
    jurisdictionKey: PRV_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    slug: "electrical-permit-fees",
    seoTitle: "Provo electrical permit fees",
    seoDescription:
      "Provo, Utah electrical permit fees — $75.00 electrical inspection minimum, $175.00 commercial electrical, bundled into building permits for small residential.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: PRV_LAST_VERIFIED,
    title: "Provo electrical permit fees",
    intro:
      "A stand-alone electrical permit in Provo prices at the **$75.00 electrical inspection** minimum (with a $0.02/sq ft service charge above the minimum), and **$175.00 for Commercial Electrical** permits. For residential structures with not more than 4 units, the electrical permit is **included in the building permit fee**.",
    localSummary:
      "Provo's electrical fees live in the Inspection Fees section of the Consolidated Fee Schedule: Electrical Inspection $75.00, service charge $75.00 with a $0.02-per-square-foot inspection fee above it, and Commercial Electrical $175.00. The Building Inspection Board of Appeals fee ($600.00) and reinspection ($100.00 per system) sit alongside.\n\nThe bundling rule is the one that changes most projects' arithmetic: for residential structures with not more than 4 units, the building permit fee **includes** the plumbing, electrical and mechanical permit fees. A single-family home or fourplex therefore files one permit; a commercial tenant improvement or larger multifamily project files stand-alone electrical at the $175.00 commercial rate or the $75.00 minimum for smaller scopes.\n\nPermits file through Building Inspection at 351 West Center Street.",
    notIncluded:
      "This is the Inspection Fees section's electrical permit fee. It excludes:\n\n- **The building permit** for projects where no stand-alone electrical permit files.\n- **The 1% state fee** on building permits (it attaches to the building permit fee).\n- **Impact fees**, including the power impact fees Provo charges by amperage table.\n- **Fast-track and after-hours surcharges** listed elsewhere in the schedule.",
    workedExample: {
      scenario:
        "A stand-alone commercial electrical permit in Provo for a small tenant-improvement scope.",
      inputs: {
        occupancy: "commercial",
        valuationCents: 500_000,
      },
      notes:
        "Commercial Electrical prices **$175.00** flat — the printed row for stand-alone commercial electrical permits.\n\nA smaller residential scope filed separately would meet the $75.00 electrical-inspection minimum instead.",
    },
    faqs: [
      {
        question: "How much is an electrical permit in Provo?",
        answer:
          "$75.00 for the electrical inspection minimum (service charge $75, $0.02/sq ft above) and $175.00 for Commercial Electrical permits.",
      },
      {
        question: "Is the electrical permit included in a house permit?",
        answer:
          "Yes — for residential structures with not more than 4 units, the building permit fee includes the plumbing, electrical and mechanical permit fees.",
      },
      {
        question: "When does the $175 rate apply?",
        answer: "The Commercial Electrical row applies to commercial electrical permits.",
      },
      {
        question: "Is there a per-square-foot charge?",
        answer:
          "Yes — the electrical inspection service charge is $75.00 plus $0.02 per square foot, with a $75.00 minimum.",
      },
      {
        question: "Where do these fees come from?",
        answer:
          "The Provo City Consolidated Fee Schedule's Inspection Fees section.",
      },
      {
        question: "What about reinspection?",
        answer: "$100.00 per system.",
      },
      {
        question: "How do I apply?",
        answer:
          "Through Provo Building Inspection, 351 West Center Street, 801-852-6410.",
      },
      {
        question: "Is plan review charged on electrical permits?",
        answer:
          "The 65% plan-review rate attaches to the building permit fee; stand-alone trade permits file without it.",
      },
    ],
  },
  {
    jurisdictionKey: PRV_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    slug: "plumbing-permit-fees",
    seoTitle: "Provo plumbing permit fees",
    seoDescription:
      "Provo, Utah plumbing permit fees — $75.00 minimum including permit issuance, $20.00 first fixture, $6.00 each additional, bundled for small residential.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: PRV_LAST_VERIFIED,
    title: "Provo plumbing permit fees",
    intro:
      "A stand-alone plumbing permit in Provo carries a **$75.00 minimum fee, including issuance of the permit**, with **$20.00 for the first fixture**, **$6.00 for each additional fixture** and **$6.00 per water heater**. For residential structures with not more than 4 units, plumbing is **included in the building permit fee**.",
    localSummary:
      "The Inspection Fees section prices plumbing by fixture rather than by valuation: the $75.00 minimum covers permit issuance, the first fixture costs $20.00, each additional fixture $6.00, and each water heater $6.00. A two-fixture bathroom remodel filed stand-alone therefore prices $75.00 + $20.00 + $6.00 = $101.00; a water-heater swap prices $75.00 + $6.00 = $81.00.\n\nThe bundling rule does most of the work in Provo: for residential structures with not more than 4 units, the building permit fee **includes** the plumbing, electrical and mechanical permit fees, so the fixture arithmetic applies mostly to commercial scopes and larger multifamily.\n\nPlumbing permits file through Building Inspection at 351 West Center Street, alongside the electrical and mechanical counters.",
    notIncluded:
      "This is the Inspection Fees section's plumbing permit fee. It excludes:\n\n- **Sewer and water impact fees**, which Provo charges from separate schedules.\n- **Sewer lateral and water service inspection fees**, which are Engineering charges.\n- **The building permit** for projects where plumbing bundles in.\n- **After-hours emergency inspections** ($240.00 minimum, $120.00 per hour after).",
    workedExample: {
      scenario:
        "A commercial plumbing permit in Provo for a break-room buildout with three fixtures and a water heater.",
      inputs: {
        occupancy: "commercial",
        valuationCents: 300_000,
      },
      notes:
        "The $75.00 minimum includes permit issuance; fixtures price $20.00 for the first and $6.00 each after, plus $6.00 for the water heater: $75.00 + $20.00 + 2 x $6.00 + $6.00 = **$113.00**.\n\nThe per-fixture rows ride on top of the printed $75.00 minimum.",
    },
    faqs: [
      {
        question: "How much is a plumbing permit in Provo?",
        answer:
          "$75.00 minimum including permit issuance, plus $20.00 for the first fixture, $6.00 per additional fixture and $6.00 per water heater.",
      },
      {
        question: "Is plumbing included in a house permit?",
        answer:
          "Yes — for residential structures with not more than 4 units, the building permit fee includes the plumbing, electrical and mechanical permit fees.",
      },
      {
        question: "What does a water heater replacement cost?",
        answer:
          "$75.00 minimum plus the $6.00 water-heater row: $81.00 filed stand-alone.",
      },
      {
        question: "Does the fee scale with project value?",
        answer:
          "No — plumbing prices by fixture count, not by valuation.",
      },
      {
        question: "Where do these fees come from?",
        answer:
          "The Provo City Consolidated Fee Schedule's Inspection Fees section.",
      },
      {
        question: "What about reinspection?",
        answer: "$100.00 per system.",
      },
      {
        question: "How do I apply?",
        answer:
          "Through Provo Building Inspection, 351 West Center Street, 801-852-6410.",
      },
      {
        question: "Are sewer connections part of the permit?",
        answer:
          "No — sewer laterals and water services carry separate Engineering inspection fees, and sewer impact fees are their own schedule.",
      },
    ],
  },
];

const verifications: SeedVerification[] = [
  {
    entityType: "source",
    entityKey: PRV_FEE_SCHEDULE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: PRV_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PRV_FEE_SCHEDULE_KEY,
    notes:
      "Read 2026-09-26 via text extraction proxy (direct fetch blocked). The Inspection Fees section's building-permit, plan-review (65%), bundling and trade-minimum lines were transcribed verbatim.",
  },
  {
    entityType: "fee_rule",
    entityKey: "PRV-BLD-500K",
    permitTypeKey: "building",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: PRV_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: "ubc-1997-table-1a",
    notes:
      "1997 UBC Table 1-A sixth row: '$100,000.01 to $500,000.00: $993.75 for the first $100,000.00 plus $5.60 for each additional $1,000.00 or fraction thereof' — base chaining verified ($643.75 + 50 x $7.00 = $993.75).",
  },
  {
    entityType: "jurisdiction_profile",
    entityKey: PRV_KEYS.jurisdiction,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: PRV_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PRV_FEE_SCHEDULE_KEY,
    notes:
      "Profile built from the Consolidated Fee Schedule plus the provo.gov FAQ (1997 UBC basis, 65% plan check, 1% state fee) and the Building Division page.",
  },
  {
    entityType: "permit_page",
    entityKey: "building-permit-fees",
    permitTypeKey: "building",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: PRV_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PRV_FEE_SCHEDULE_KEY,
    notes:
      "Recorded for the editorial gate: this page's prose, sources and fee-rule mapping were checked against the schedule published by Provo City Corporation, Utah during the research pass that produced this seed; the seed's content tests assert the arithmetic. No amount on this page is estimated.",
  },
  {
    entityType: "permit_page",
    entityKey: "electrical-permit-fees",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: PRV_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PRV_FEE_SCHEDULE_KEY,
    notes:
      "Recorded for the editorial gate: this page's prose, sources and fee-rule mapping were checked against the schedule published by Provo City Corporation, Utah during the research pass that produced this seed; the seed's content tests assert the arithmetic. No amount on this page is estimated.",
  },
  {
    entityType: "permit_page",
    entityKey: "plumbing-permit-fees",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: PRV_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PRV_FEE_SCHEDULE_KEY,
    notes:
      "Recorded for the editorial gate: this page's prose, sources and fee-rule mapping were checked against the schedule published by Provo City Corporation, Utah during the research pass that produced this seed; the seed's content tests assert the arithmetic. No amount on this page is estimated.",
  },
];

export const provoSeed: JurisdictionSeed = {
  state,
  county,
  jurisdiction,
  departments,
  sources,
  permitTypes: [],
  projectTypes: [],
  jurisdictionPermitTypes: [
    {
      jurisdictionKey: PRV_KEYS.jurisdiction,
      permitTypeKey: "building",
      isAvailable: true,
      localName: "Building permit (1997 UBC Table 1-A chart)",
      officialUrl: "https://provo.municipal.codes/Code/FS_Inspection",
      notes:
        "Valuation-based on the 1997 UBC chart; plan review 65%; includes trade permits for residential structures of up to 4 units.",
    },
    {
      jurisdictionKey: PRV_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      isAvailable: true,
      localName: "Electrical permit (Inspection Fees section)",
      officialUrl: "https://provo.municipal.codes/Code/FS_Inspection",
      notes:
        "$75.00 inspection minimum, $175.00 commercial; bundled into building permits for residential structures of up to 4 units.",
    },
    {
      jurisdictionKey: PRV_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      isAvailable: true,
      localName: "Plumbing permit (Inspection Fees section)",
      officialUrl: "https://provo.municipal.codes/Code/FS_Inspection",
      notes:
        "$75.00 minimum including issuance, $20.00 first fixture, $6.00 additional fixtures and water heaters; bundled for small residential.",
    },
  ],
  feeSchedules,
  feeRules,
  requirements: [],
  profile,
  permitPages,
  verifications,
};

export const PRV_PUBLISHED_PERMIT_PAGES = provoSeed.permitPages.filter(
  (page) => page.publishStatus === "published" && !page.noindex,
);
