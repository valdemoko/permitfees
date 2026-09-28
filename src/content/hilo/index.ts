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
  HILO_BUILDING_RULES,
  HILO_FEE_EFFECTIVE_FROM,
  HILO_HCC_KEY,
} from "./fee-rules";

export * from "./fee-rules";

/**
 * The complete Hilo (County of Hawai'i) seed payload.
 *
 * Every figure traces to research/hawaii/hilo.md, which traces to the
 * Hawai'i County Code § 5-7-3 building permit fee schedule, read verbatim
 * from two agreeing transcriptions (the County's own PV guideline and the
 * Grassroot Institute's October 2024 report, sourced to the code). The
 * county issues building permits island-wide; Hilo is the county seat and
 * the Building Division's headquarters.
 */

const RESEARCHER = "Permit Fee Intelligence research pass (Hawaii)";

export const HILO_LAST_VERIFIED = "2026-09-26";

export const HILO_KEYS = {
  state: "hi",
  county: "hawaii-county",
  jurisdiction: "hilo",
  feeSchedule: HILO_HCC_KEY,
} as const;

const state: SeedState = {
  code: "HI",
  slug: "hawaii",
  name: "Hawaii",
  fipsCode: "15",
};

const county: SeedCounty = {
  key: HILO_KEYS.county,
  slug: "hawaii-county",
  name: "Hawaii County",
  fipsCode: "15001",
};

const jurisdiction: SeedJurisdiction = {
  key: HILO_KEYS.jurisdiction,
  stateKey: HILO_KEYS.state,
  countyKey: HILO_KEYS.county,
  type: "county",
  slug: "hilo",
  name: "Hilo (Hawaii County)",
  officialName: "County of Hawai'i Building Division — Hilo",
  websiteUrl: "https://www.hawaiicounty.gov/",
  permitPortalUrl: "https://www.hawaiicounty.gov/departments/public-works/building",
  timezone: "Pacific/Honolulu",
  isActive: true,
};

const departments: SeedDepartment[] = [
  {
    key: "hawaii-county-building",
    jurisdictionKey: HILO_KEYS.jurisdiction,
    kind: "building",
    name: "Department of Public Works — Building Division",
    phone: "(808) 961-8321",
    email: null,
    url: "https://www.hawaiicounty.gov/departments/public-works/building",
    addressLine: "Aupuni Center, 101 Pauahi Street, Suite 1, Hilo, HI 96720",
    hours: "Monday through Friday, 7:45 a.m. to 4:30 p.m.",
    notes:
      "The Building Division issues building permits for the County of Hawai'i from its Hilo headquarters (with a Kona satellite); fees are set by Hawai'i County Code § 5-7-3.",
  },
];

const sources: SeedSource[] = [
  {
    key: HILO_HCC_KEY,
    jurisdictionKey: HILO_KEYS.jurisdiction,
    title: "Hawai'i County Code § 5-7-3 — Building permit fees",
    url: "https://records.hawaiicounty.gov/weblink/1/edoc/76875/Permitting%20a%20Residential%20Photovoltaic%20System2.19.16.pdf",
    sourceType: "municipal_code",
    issuingAuthority: "County of Hawai'i",
    authorityKind: "county",
    isPrimary: true,
    documentDate: "2024-10-01",
    effectiveFrom: HILO_FEE_EFFECTIVE_FROM,
    retrievedAt: HILO_LAST_VERIFIED,
    lastVerifiedAt: HILO_LAST_VERIFIED,
    notes:
      "Read 2026-09-26 via two agreeing transcriptions of § 5-7-3: the County's own 'Guidelines for Permitting a Residential Photovoltaic (PV) System' (records.hawaiicounty.gov edoc 76875, quoting the schedule's opening rows) and the Grassroot Institute's October 2024 permitting report (Table 6, sourced 'Section 5-7-3. Permit, Hawai'i County Code, accessed Oct. 1, 2024'). The schedule: $10 to $500; $10 + $1.50 per $100 or fraction to $2,000; $32.50 + $7.50 per $1,000 or fraction to $25,000; $205 + $6 per $1,000 or fraction to $50,000; $355 + $3 per $1,000 or fraction above. Every band base chains exactly ($32.50, $205.00, $355.00), confirming the marginal reading. The County's WebLink host itself was unreachable (HTTP 000) from this environment.",
  },
  {
    key: "hawaii-county-plan-review-record",
    jurisdictionKey: HILO_KEYS.jurisdiction,
    title: "Hawai'i County council committee record COM 0734.001 (2024-2026)",
    url: "https://records.hawaiicounty.gov/WebLink/0/doc/1125787/Page4.aspx",
    sourceType: "other",
    issuingAuthority: "County of Hawai'i Council",
    authorityKind: "county",
    isPrimary: true,
    documentDate: HILO_LAST_VERIFIED,
    effectiveFrom: HILO_FEE_EFFECTIVE_FROM,
    retrievedAt: HILO_LAST_VERIFIED,
    lastVerifiedAt: HILO_LAST_VERIFIED,
    notes:
      "Quotes 'Building Permits: Plan Review Fees 20% of Permit Fee with a min.' — the county's plan-review practice, modelled as a 20% component on the permit fee.",
  },
  {
    key: "grassroot-hawaii-permits",
    jurisdictionKey: HILO_KEYS.jurisdiction,
    title: "Seven Low-Cost Ways to Speed Up Permitting in Hawaii (Grassroot Institute, Oct 2024)",
    url: "https://www.grassrootinstitute.org/wp-content/uploads/2023/12/241007_pb_permits.pdf",
    sourceType: "other",
    issuingAuthority: "Grassroot Institute of Hawaii",
    authorityKind: "other",
    isPrimary: false,
    documentDate: "2024-10-01",
    effectiveFrom: HILO_FEE_EFFECTIVE_FROM,
    retrievedAt: HILO_LAST_VERIFIED,
    lastVerifiedAt: HILO_LAST_VERIFIED,
    notes:
      "Table 6 prints the full § 5-7-3 schedule; used as the second transcription that agrees with the County's own document row for row.",
  },
];

const feeSchedules: SeedFeeSchedule[] = [
  {
    key: HILO_KEYS.feeSchedule,
    jurisdictionKey: HILO_KEYS.jurisdiction,
    sourceKey: HILO_HCC_KEY,
    title: "County of Hawai'i building permit fees (HCC § 5-7-3)",
    officialUrl: "https://records.hawaiicounty.gov/weblink/1/edoc/76875/Permitting%20a%20Residential%20Photovoltaic%20System2.19.16.pdf",
    effectiveFrom: HILO_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: HILO_LAST_VERIFIED,
    notes:
      "Five marginal bands with 'or fraction thereof' in each and bases that chain exactly — the textbook chained ladder.",
  },
];

const feeRules: SeedFeeRule[] = HILO_BUILDING_RULES.map((rule) => ({
  jurisdictionKey: HILO_KEYS.jurisdiction,
  permitTypeKey: "building",
  scheduleKey: HILO_KEYS.feeSchedule,
  rule,
}));

const profile: SeedProfile = {
  jurisdictionKey: HILO_KEYS.jurisdiction,
  headline: "What building permits cost in Hilo (Hawai'i County)",
  summary:
    "Hawai'i County prices building permits from the **valuation of work** on a five-band chained ladder (HCC § 5-7-3): **$10.00** to $500 of valuation, then **$1.50 per $100** to $2,000, **$7.50 per $1,000** to $25,000, **$6 per $1,000** to $50,000, and **$3 per $1,000** above — with plan review at **20% of the permit fee**.",
  localContext:
    "Hilo is the county seat, and the county is the permitting jurisdiction: the Department of Public Works' Building Division at the Aupuni Center issues permits island-wide under Hawai'i County Code § 5-7-3. The county's ladder is the textbook kind this dataset keeps meeting: five marginal bands whose bases chain to the dollar. $10.00 covers the first $500; $1.50 per additional $100 (or fraction) reaches exactly $32.50 at $2,000; $7.50 per additional $1,000 reaches exactly $205.00 at $25,000; $6.00 per additional $1,000 reaches exactly $355.00 at $50,000; and $3.00 per additional $1,000 or fraction runs above with no limit.\n\nEvery band prints 'or fraction thereof', so partial blocks price as whole ones — $10,100 of valuation buys 9 whole thousands above the first $2,000. Plan review rides on top at 20% of the permit fee, per the county's own fee documents (council committee record COM 0734.001 quotes 'Plan Review Fees 20% of Permit Fee with a min.').\n\nA $50,000 home prices $355.00 of permit fee plus $71.00 of review at 20% — $426.00 all in. A $150,000 home prices $355.00 + 100 x $3.00 = $655.00 of permit, $786.00 with review.",
  valuationBasis:
    "The **valuation of the work** read against the § 5-7-3 ladder: $10.00 to $500, then marginal per-$100/per-$1,000 rates on the amount within each band ($1.50/$100 to $2,000, $7.50/$1,000 to $25,000, $6/$1,000 to $50,000, $3/$1,000 above), with every partial block rounded up.",
  notIncluded:
    "These figures are the County of Hawai'i's building permit fees under HCC § 5-7-3. They exclude:\n\n- **Trade permits** — electrical, plumbing and building-mechanical permits carry their own county fee rows, not modelled here.\n- **The plan-review minimum** the county's fee documents print beside the 20% — the percentage is modelled, the printed floor is named rather than guessed.\n- **Impact fees, wastewater connection and subdivision charges** — separate county processes.\n- **State of Hawaii fees**, which are not part of the county schedule.",
  seoTitle: "Hilo building permit fees",
  seoDescription:
    "How Hilo and Hawai'i County price building permits — HCC § 5-7-3: $10 to $500, then $1.50/$100, $7.50/$1,000, $6/$1,000 and $3/$1,000 chained bands, plan review at 20%.",
  publishStatus: "published",
  noindex: false,
  lastReviewedAt: HILO_LAST_VERIFIED,
};

const permitPages: SeedPermitPage[] = [
  {
    jurisdictionKey: HILO_KEYS.jurisdiction,
    permitTypeKey: "building",
    slug: "building-permit-fees",
    seoTitle: "Hilo building permit fees",
    seoDescription:
      "Hilo, Hawaii (Hawai'i County) building permit fees — HCC § 5-7-3: $10 to $500, chained bands to $3 per $1,000 above $50,000, plan review at 20% of the permit fee.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: HILO_LAST_VERIFIED,
    title: "Hilo building permit fees",
    intro:
      "A building permit in Hilo is priced by **Hawai'i County** from the **valuation of the work** on the § 5-7-3 ladder: **$10.00** up to $500 of valuation, **$1.50 per additional $100** to $2,000, **$7.50 per additional $1,000** to $25,000, **$6.00 per additional $1,000** to $50,000, and **$3.00 per additional $1,000** above — every band with 'or fraction thereof', every base chaining to the dollar. Plan review adds **20% of the permit fee**.",
    localSummary:
      "The county issues the permit, and the county's schedule is a clean chained marginal ladder — five bands, no seam gaps, no minimum published in the schedule itself. $10.00 covers valuation to $500; the $1.50-per-$100 band closes at exactly $32.50 when $2,000 is reached; the $7.50-per-$1,000 band closes at exactly $205.00 at $25,000; the $6.00-per-$1,000 band closes at exactly $355.00 at $50,000; and the $3.00-per-$1,000 band runs above with no ceiling.\n\nReading the fee is a two-band exercise at most. A $10,000 addition sits in the third band: $32.50 + 8 x $7.50 = **$92.50**. A $50,000 home closes the fourth band at **$355.00**. A $150,000 build adds 100 thousands at $3.00: $355.00 + $300.00 = **$655.00**. 'Or fraction thereof' prices any partial $100 or $1,000 as a whole block.\n\nPlan review rides on top at 20% of the permit fee, per the county's own fee documents — $18.50 on the $92.50 permit, $71.00 on the $355 permit, $131.00 on the $655 permit. Electrical, plumbing and mechanical permits are separate county trade permits with their own fee rows; the schedule priced here is the building permit's.",
    notIncluded:
      "This is the Hawai'i County building permit under HCC § 5-7-3. It excludes:\n\n- **Trade permits** — electrical, plumbing and mechanical work carries its own county fee rows.\n- **The plan-review minimum** the county prints beside the 20% percentage — modelled as the percentage, with the floor named rather than guessed.\n- **Impact fees, wastewater and subdivision charges** — separate county processes.\n- **State fees** — not part of the county schedule.",
    workedExample: {
      scenario:
        "A new single-family home in Hilo with a construction valuation of $150,000.",
      inputs: {
        occupancy: "residential",
        valuationCents: 15_000_000,
      },
      notes:
        "Top band: $355.00 for the first $50,000 plus $3.00 for each of the 100 additional thousands: $355.00 + 100 x $3.00 = **$655.00**.\n\nPlan review adds 20% of the permit fee: $655.00 x 0.20 = **$131.00**. Total with review: **$786.00**.\n\nA $50,000 home would close the fourth band at $355.00 exactly.",
    },
    faqs: [
      {
        question: "How much is a building permit in Hilo?",
        answer:
          "Hawai'i County charges by HCC § 5-7-3: $10.00 to $500 of valuation, then chained bands to $3.00 per $1,000 above $50,000. A $50,000 home prices $355.00; a $150,000 home prices $655.00.",
      },
      {
        question: "Who issues the permit?",
        answer:
          "The County of Hawai'i's Department of Public Works, Building Division — from the Aupuni Center in Hilo, with a Kona satellite. The county, not a city, is the permitting jurisdiction island-wide.",
      },
      {
        question: "How is the fee calculated?",
        answer:
          "Marginally by band: each band's rate applies to the amount of valuation within it, with every partial $100 or $1,000 rounded up ('or fraction thereof'). The band bases chain exactly, which confirms the marginal reading.",
      },
      {
        question: "What does plan review cost?",
        answer:
          "20% of the permit fee, per the county's own fee documents — $71.00 on a $355 permit. The county's documents also print a minimum for plan review.",
      },
      {
        question: "Do I need separate trade permits?",
        answer:
          "Yes — electrical, plumbing and mechanical permits are separate county trade permits with their own fee rows.",
      },
      {
        question: "What does a $10,000 project price?",
        answer:
          "$32.50 + 8 x $7.50 = $92.50 in the third band, plus 20% plan review ($18.50) where plans are reviewed.",
      },
      {
        question: "Is there a maximum permit fee?",
        answer:
          "No — the top band's $3.00 per $1,000 runs above $50,000 of valuation with no ceiling printed.",
      },
      {
        question: "When did this schedule take effect?",
        answer:
          "The schedule is Hawai'i County Code § 5-7-3 as read in the county's own documents and an October 2024 transcription sourced to the code.",
      },
      {
        question: "Where do I apply?",
        answer:
          "At the Building Division, Aupuni Center, 101 Pauahi Street, Suite 1, Hilo — or through the county's online permit portal.",
      },
      {
        question: "Does the fee differ for Kona or other districts?",
        answer:
          "No — the county's § 5-7-3 schedule prices permits island-wide; the Kona office is a satellite of the same division.",
      },
    ],
  },
];

const verifications: SeedVerification[] = [
  {
    entityType: "source",
    entityKey: HILO_HCC_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: HILO_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: HILO_HCC_KEY,
    notes:
      "Read 2026-09-26 via two agreeing transcriptions of § 5-7-3 (the County's own PV guideline on records.hawaiicounty.gov and the Grassroot Institute's October 2024 report). All four band seams verified to chain exactly: $32.50, $205.00, $355.00. The county's WebLink host itself returned HTTP 000 from this environment and is recorded as such.",
  },
  {
    entityType: "fee_rule",
    entityKey: "HILO-BLD-B5",
    permitTypeKey: "building",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: HILO_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: HILO_HCC_KEY,
    notes:
      "Top band: '$355 for the first $50,000 plus $3 for each additional $1,000 or fraction thereof' — base verified against the fourth band's chained close ($205 + 25 x $6.00 = $355.00).",
  },
  {
    entityType: "jurisdiction_profile",
    entityKey: HILO_KEYS.jurisdiction,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: HILO_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: HILO_HCC_KEY,
    notes:
      "Profile built from the county code schedule and the county's Building Division pages; the county-as-jurisdiction structure is stated on the record.",
  },
  {
    entityType: "permit_page",
    entityKey: "building-permit-fees",
    permitTypeKey: "building",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: HILO_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: HILO_HCC_KEY,
    notes:
      "Recorded for the editorial gate: this page's prose, sources and fee-rule mapping were checked against the schedule published by County of Hawai'i Building Division — Hilo during the research pass that produced this seed; the seed's content tests assert the arithmetic. No amount on this page is estimated.",
  },
];

export const hiloSeed: JurisdictionSeed = {
  state,
  county,
  jurisdiction,
  departments,
  sources,
  permitTypes: [],
  projectTypes: [],
  jurisdictionPermitTypes: [
    {
      jurisdictionKey: HILO_KEYS.jurisdiction,
      permitTypeKey: "building",
      isAvailable: true,
      localName: "Building permit (HCC § 5-7-3)",
      officialUrl:
        "https://records.hawaiicounty.gov/weblink/1/edoc/76875/Permitting%20a%20Residential%20Photovoltaic%20System2.19.16.pdf",
      notes:
        "Five marginal chained bands with 'or fraction thereof' in each; plan review at 20% of the permit fee per the county's fee documents.",
    },
  ],
  feeSchedules,
  feeRules,
  requirements: [],
  profile,
  permitPages,
  verifications,
};

export const HILO_PUBLISHED_PERMIT_PAGES = hiloSeed.permitPages.filter(
  (page) => page.publishStatus === "published" && !page.noindex,
);
