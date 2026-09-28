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
  SLC_BUILDING_RULES,
  SLC_ELECTRICAL_RULES,
  SLC_FEE_EFFECTIVE_FROM,
  SLC_FEE_SCHEDULE_KEY,
  SLC_PLUMBING_RULES,
} from "./fee-rules";

export * from "./fee-rules";

/**
 * The complete Salt Lake City, Utah seed payload.
 *
 * Every figure traces to research/utah/salt-lake-city.md, which traces to the
 * City's Consolidated Fee Schedule (amended 2026-06-16 by Ord. 2026-29),
 * read from the official tools.slc.gov fee schedule viewer.
 */

const RESEARCHER = "Permit Fee Intelligence research pass (Utah)";

export const SLC_LAST_VERIFIED = "2026-09-26";

export const SLC_KEYS = {
  state: "ut",
  county: "salt-lake-county",
  jurisdiction: "saltlakecity",
  feeSchedule: SLC_FEE_SCHEDULE_KEY,
} as const;

const state: SeedState = {
  code: "UT",
  slug: "utah",
  name: "Utah",
  fipsCode: "49",
};

const county: SeedCounty = {
  key: SLC_KEYS.county,
  slug: "salt-lake-county",
  name: "Salt Lake County",
  fipsCode: "49035",
};

const jurisdiction: SeedJurisdiction = {
  key: SLC_KEYS.jurisdiction,
  stateKey: SLC_KEYS.state,
  countyKey: SLC_KEYS.county,
  type: "city",
  slug: "salt-lake-city",
  name: "Salt Lake City",
  officialName: "Salt Lake City Corporation, Utah",
  websiteUrl: "https://www.slc.gov/",
  permitPortalUrl: "https://www.slc.gov/buildingservices/building-permits/",
  timezone: "America/Denver",
  isActive: true,
};

const departments: SeedDepartment[] = [
  {
    key: "slc-building-services",
    jurisdictionKey: SLC_KEYS.jurisdiction,
    kind: "building",
    name: "Building Services & Civil Enforcement",
    phone: "(801) 535-6000",
    email: "building@slcgov.com",
    url: "https://www.slc.gov/buildingservices/",
    addressLine: "451 South State Street, Room 215, Salt Lake City, UT 84111",
    hours: "Monday through Friday, 8:00 a.m. to 5:00 p.m.",
    notes:
      "Issues building, electrical, plumbing and mechanical permits for the city; permit fees come from the Consolidated Fee Schedule (building fees codified at SLC Code 18.32.035).",
  },
];

const sources: SeedSource[] = [
  {
    key: SLC_FEE_SCHEDULE_KEY,
    jurisdictionKey: SLC_KEYS.jurisdiction,
    title:
      "Salt Lake City Consolidated Fee Schedule (amended 06/16/2026 by Ord. 2026-29)",
    url: "https://tools.slc.gov/feeschedule/",
    sourceType: "municipal_website",
    issuingAuthority: "Salt Lake City Corporation",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2026-06-16",
    effectiveFrom: SLC_FEE_EFFECTIVE_FROM,
    retrievedAt: SLC_LAST_VERIFIED,
    lastVerifiedAt: SLC_LAST_VERIFIED,
    notes:
      "Read 2026-09-26 from the City's official fee schedule viewer. Building Permits (18.32.035): $55.97 to $500; $55.97 + $4.00/$100 to $2,000; $115.97 + $20.00/$1,000 to $25,000; $575.97 + $14.00/$1,000 to $50,000; $925.97 + $10.00/$1,000 to $100,000; $1,425.97 + $8.00/$1,000 to $500,000; $4,625.97 + $7.00/$1,000 to $1,000,000; $8,125.97 + $5.00/$1,000 above. Plan review fee 65% of building permit fee; hourly plan review $146. Electrical base fee $59 (18.36.100); plumbing base fee $59 (18.56.040). Band bases chain exactly at every seam.",
  },
  {
    key: "slc-building-services-permits",
    jurisdictionKey: SLC_KEYS.jurisdiction,
    title: "Building Services — Building Permit Applications",
    url: "https://www.slc.gov/buildingservices/building-permits/",
    sourceType: "municipal_website",
    issuingAuthority: "Salt Lake City Building Services & Civil Enforcement",
    authorityKind: "city",
    isPrimary: true,
    documentDate: SLC_LAST_VERIFIED,
    effectiveFrom: SLC_FEE_EFFECTIVE_FROM,
    retrievedAt: SLC_LAST_VERIFIED,
    lastVerifiedAt: SLC_LAST_VERIFIED,
    notes:
      "The issuing office's application page: links the Consolidated Fee Schedule, fee calculation forms and the OpenCounter fee estimator; room 215 at 451 South State Street.",
  },
  {
    key: "slc-code-18-20-020",
    jurisdictionKey: SLC_KEYS.jurisdiction,
    title: "Salt Lake City Code 18.20.020 — Fees",
    url: "https://codelibrary.amlegal.com/codes/saltlakecityut/latest/saltlakecity_ut/0-0-0-59987",
    sourceType: "municipal_code",
    issuingAuthority: "Salt Lake City Corporation",
    authorityKind: "city",
    isPrimary: true,
    documentDate: SLC_LAST_VERIFIED,
    effectiveFrom: SLC_FEE_EFFECTIVE_FROM,
    retrievedAt: SLC_LAST_VERIFIED,
    lastVerifiedAt: SLC_LAST_VERIFIED,
    notes:
      "\"Building permit fees shall be based on the total valuation of the proposed project as shown on the Salt Lake City consolidated fee schedule.\" Codifies the valuation basis this dataset encodes.",
  },
];

const feeSchedules: SeedFeeSchedule[] = [
  {
    key: SLC_KEYS.feeSchedule,
    jurisdictionKey: SLC_KEYS.jurisdiction,
    sourceKey: SLC_FEE_SCHEDULE_KEY,
    title: "Salt Lake City Consolidated Fee Schedule — building and trade permit fees",
    officialUrl: "https://tools.slc.gov/feeschedule/",
    effectiveFrom: SLC_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: SLC_LAST_VERIFIED,
    notes:
      "Eight valuation bands with chained bases plus a 65% plan-review rate; each partial increment rounds up under the schedule's 'or fraction thereof' wording.",
  },
];

function attach(permitTypeKey: string, rules: SeedFeeRule["rule"][]): SeedFeeRule[] {
  return rules.map((rule) => ({
    jurisdictionKey: SLC_KEYS.jurisdiction,
    permitTypeKey,
    scheduleKey: SLC_KEYS.feeSchedule,
    rule,
  }));
}

const feeRules: SeedFeeRule[] = [
  ...attach("building", SLC_BUILDING_RULES),
  ...attach("electrical", SLC_ELECTRICAL_RULES),
  ...attach("plumbing", SLC_PLUMBING_RULES),
];

const profile: SeedProfile = {
  jurisdictionKey: SLC_KEYS.jurisdiction,
  headline: "What building permits cost in Salt Lake City",
  summary:
    "Salt Lake City prices building permits from **total project valuation**: a **$55.97** floor to $500, then per-$100 and per-$1,000 rates that step down from **$20.00 per $1,000** to **$5.00 per $1,000** — with **plan review at 65%** of the permit fee. Trade permits carry a **$59 base fee**.",
  localContext:
    "Salt Lake City sets every regulatory fee it charges in one document: the Consolidated Fee Schedule, adopted by Ordinance 2011-25 and kept current by Council amendment — most recently 06/16/2026 by Ord. 2026-29. Building permit fees live in its 18.32.035 rows, and the City Code confirms the basis: building permit fees are based on the total valuation of the proposed project as shown on the consolidated fee schedule.\n\nThe building ladder runs eight valuation bands whose bases chain exactly: $55.97 flat to $500; $55.97 + $4.00 per $100 to $2,000 ($115.97 at the seam); $115.97 + $20.00 per $1,000 to $25,000 ($575.97); $14.00 per $1,000 to $50,000 ($925.97); $10.00 per $1,000 to $100,000 ($1,425.97); $8.00 per $1,000 to $500,000 ($4,625.97); $7.00 per $1,000 to $1,000,000 ($8,125.97); then $5.00 per $1,000 above. Each partial increment rounds up under the schedule's 'or fraction thereof' wording.\n\nPlan review is 65% of the building permit fee (a $146 hourly rate covers deferred items, post-issuance changes, and non-building permits; expedited review costs twice the standard fee). Trade permits open at a $59 base fee — the electrical and plumbing sections share it — with itemized rows for service changes, fixtures and appliances. Building Services & Civil Enforcement, room 215 at 451 South State Street, issues the permits, and its application page links the fee schedule and a fee-calculation worksheet.",
  valuationBasis:
    "**Total project valuation** — read against the 18.32.035 bands: $55.97 flat to $500, $4.00 per $100 to $2,000, $20.00 per $1,000 to $25,000, $14.00 per $1,000 to $50,000, $10.00 per $1,000 to $100,000, $8.00 per $1,000 to $500,000, $7.00 per $1,000 to $1,000,000, then $5.00 per $1,000. Each partial increment rounds up.",
  notIncluded:
    "These figures are the Consolidated Fee Schedule's permit fees. They exclude:\n\n- **Impact fees**, which Salt Lake City charges separately by utility and service area.\n- **Expedited plan review** (twice the standard 65% fee) and the $146 hourly rate for deferred items.\n- **Mechanical permits**, which read the 18.52.050 itemized rows this dataset does not seed.\n- **Re-inspection and after-hours fees** listed elsewhere in the schedule.",
  seoTitle: "Salt Lake City building permit fees",
  seoDescription:
    "How Salt Lake City prices building, electrical and plumbing permits — valuation bands from $55.97, rates $20 to $5 per $1,000, plan review at 65%.",
  publishStatus: "published",
  noindex: false,
  lastReviewedAt: SLC_LAST_VERIFIED,
};

const permitPages: SeedPermitPage[] = [
  {
    jurisdictionKey: SLC_KEYS.jurisdiction,
    permitTypeKey: "building",
    slug: "building-permit-fees",
    seoTitle: "Salt Lake City building permit fees",
    seoDescription:
      "Salt Lake City building permit fees — eight valuation bands from $55.97, rates stepping $20 to $5 per $1,000, plan review at 65% of the permit fee.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: SLC_LAST_VERIFIED,
    title: "Salt Lake City building permit fees",
    intro:
      "A Salt Lake City building permit is priced from **total project valuation** on the Consolidated Fee Schedule: a flat **$55.97** up to $500, then rates that step from **$4.00 per $100** through **$20.00 per $1,000** down to **$5.00 per $1,000** above $1,000,000 — each partial increment rounding up, and **plan review adding 65%** of the permit fee. A $150,000 project prices $1,825.97 in permit fees.",
    localSummary:
      "The City's fee law is one consolidated document — the Consolidated Fee Schedule, amended 06/16/2026 by Ord. 2026-29 — and the building ladder inside it (18.32.035) is where a Salt Lake City permit is priced. The bands chain with no gaps: the $4-per-$100 row reaches exactly $115.97 at $2,000, and every later base follows from the arithmetic of the row before it, so no valuation falls between printed bases.\n\nReading the fee is a matter of finding the band: a $12,000 garage sits in the third band at $115.97 + 10 x $20.00 = **$315.97**; a $150,000 addition sits in the sixth at $1,425.97 + 50 x $8.00 = **$1,825.97**; a $2,000,000 build reaches the top band at $8,125.97 + 1,000 x $5.00 = **$13,125.97**. Each partial $1,000 rounds up — a $26,100 job pays the full 26 thousands' worth of $14.00 increments.\n\nPlan review is the second charge on most projects: 65% of the permit fee. That takes the $150,000 example from $1,825.97 to $1,825.97 + $1,186.88 = **$3,012.85** with plan review included. The schedule also prints a $146 hourly plan-review rate for deferred items and post-issuance changes, and expedited review at twice the standard fee (18.20.050).\n\nApplications run through Building Services & Civil Enforcement (451 South State Street, room 215), whose permit page links the fee schedule, fee-calculation forms and the City's OpenCounter estimator.",
    notIncluded:
      "This is the Consolidated Fee Schedule's building permit fee. It excludes:\n\n- **Impact fees** for water, sewer, transportation and parks, charged separately by service area.\n- **Expedited plan review** (2x standard) and the **$146 hourly plan-review rate** for deferred or changed plans.\n- **Mechanical (HVAC) permits** — separate 18.52.050 rows not priced here.\n- **Re-inspection, after-hours and working-without-permit penalties**.",
    workedExample: {
      scenario:
        "A commercial tenant improvement in Salt Lake City with a total project valuation of $150,000.",
      inputs: {
        occupancy: "commercial",
        valuationCents: 15_000_000,
      },
      notes:
        "Sixth band: $1,425.97 for the first $100,000 plus $8.00 for each of the 50 thousands above: $1,425.97 + 50 x $8.00 = **$1,825.97**.\n\nPlan review adds 65%: $1,825.97 x 0.65 = $1,186.88, for **$3,012.85** total where plans are reviewed.",
    },
    faqs: [
      {
        question: "How much is a building permit in Salt Lake City?",
        answer:
          "It depends on project valuation: $55.97 flat to $500, then $4.00 per $100 to $2,000, $20.00 per $1,000 to $25,000, stepping down to $5.00 per $1,000 above $1,000,000. A $150,000 project prices $1,825.97.",
      },
      {
        question: "What is the plan review fee?",
        answer:
          "65% of the building permit fee. Deferred items, post-issuance changes and non-building permits use a $146 hourly rate instead; expedited review costs twice the standard fee.",
      },
      {
        question: "Where do Salt Lake City's permit fees come from?",
        answer:
          "The Consolidated Fee Schedule, adopted by Ordinance 2011-25 and amended by Council — currently the 06/16/2026 amendment (Ord. 2026-29). Building fees are codified at SLC Code 18.32.035.",
      },
      {
        question: "How is a partial $1,000 charged?",
        answer:
          "Up — the schedule's 'or fraction thereof' wording rounds every partial increment to the next full $1,000 (or $100 in the second band).",
      },
      {
        question: "Do the band bases line up with each other?",
        answer:
          "Exactly: $55.97 + 15 x $4.00 = $115.97, and each later base follows the same arithmetic, so no valuation falls between the printed bases.",
      },
      {
        question: "Is there a minimum permit fee?",
        answer:
          "Yes — $55.97, the schedule's first row, covers all projects valued at $500 or less.",
      },
      {
        question: "Does the fee differ for residential and commercial work?",
        answer:
          "No — the 18.32.035 ladder reads total project valuation regardless of occupancy.",
      },
      {
        question: "Are trade permits included in the building permit?",
        answer:
          "No — unlike some Utah cities, Salt Lake City issues separate electrical, plumbing and mechanical permits, each opening at a $59 base fee.",
      },
      {
        question: "What counts as total project valuation?",
        answer:
          "The total value of the proposed project as shown on the consolidated fee schedule — the declared construction cost, which the plan-review desk can adjust.",
      },
      {
        question: "How do I apply?",
        answer:
          "Through Building Services & Civil Enforcement — 451 South State Street, room 215 — whose application page links the fee schedule and fee-calculation forms.",
      },
      {
        question: "When did the current fees take effect?",
        answer:
          "June 16, 2026, by Ordinance 2026-29; the schedule was originally adopted by Ordinance 2011-25 and has been amended periodically since.",
      },
      {
        question: "Is there an expedited option?",
        answer:
          "Yes — expedited building plan review costs twice the standard plan-review fee under 18.20.050.",
      },
    ],
  },
  {
    jurisdictionKey: SLC_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    slug: "electrical-permit-fees",
    seoTitle: "Salt Lake City electrical permit fees",
    seoDescription:
      "Salt Lake City electrical permit fees — $59 base fee under 18.36.100, with $40 minor-work rows and commercial minimums under 18.36.120.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: SLC_LAST_VERIFIED,
    title: "Salt Lake City electrical permit fees",
    intro:
      "An electrical permit in Salt Lake City opens at a **$59.00 base fee** (Consolidated Fee Schedule 18.36.100), with **$40.00** rows for minor remodels, additional circuits and service changes, a **$48.00** homeowner remodel permit, and commercial minimums under 18.36.120. Larger commercial work prices from a separate valuation schedule.",
    localSummary:
      "Salt Lake City prices electrical work outside the building ladder. The schedule's electrical section opens every permit at a $59.00 base fee (18.36.100), then prices rows by what the work is: $40.00 for a minor remodel or additional circuits, $40.00 for a service change, $48.00 for the homeowner electrical remodel permit.\n\nCommercial and industrial work reads its own rows (18.36.120): a $40.00 minimum covers work up to $1,600 of value, service-entrance work prices by amperage, and larger projects use an alternate schedule — 1.66% of total valuation to $10,000, then $136 plus 0.39% of the excess to $100,000 — or the section's percentage rows above $100,000.\n\nUnlike neighboring Provo, the City does not bundle trade permits into residential building permits: an electrical permit files separately at Building Services (451 South State Street, room 215), alongside the building and plumbing applications.",
    notIncluded:
      "This is the Consolidated Fee Schedule's electrical permit fee. It excludes:\n\n- **The building permit** for the project the electrical work belongs to.\n- **Fire alarm and fire suppression permits**, priced in the fire sections of the schedule.\n- **Plan review** — the 65% rate attaches to building permits; non-building permits use the $146 hourly rate.\n- **Impact fees** and after-hours inspection charges.",
    workedExample: {
      scenario:
        "A stand-alone electrical permit in Salt Lake City covering a service change with two new circuits.",
      inputs: {
        occupancy: "residential",
        valuationCents: 1_000_000,
      },
      notes:
        "The $59.00 base fee governs the permit's opening charge; the service-change row ($40.00) covers the work itself under 18.36.100's itemized list.\n\nSalt Lake City files trade permits separately from the building permit — there is no residential bundling.",
    },
    faqs: [
      {
        question: "How much is an electrical permit in Salt Lake City?",
        answer:
          "$59.00 base fee, with $40.00 rows for minor remodels, additional circuits and service changes, and a $48.00 homeowner remodel permit — commercial minimums run under 18.36.120.",
      },
      {
        question: "Is the electrical permit included in the building permit?",
        answer:
          "No — Salt Lake City issues trade permits separately; there is no residential bundling.",
      },
      {
        question: "How is commercial electrical work priced?",
        answer:
          "By itemized rows up to $1,600 ($40 minimum), then by valuation: 1.66% to $10,000, $136 plus 0.39% of the excess to $100,000, and percentage rows above that.",
      },
      {
        question: "Where do these fees come from?",
        answer:
          "The Consolidated Fee Schedule (amended June 16, 2026), electrical sections 18.36.100 and 18.36.120.",
      },
      {
        question: "Is plan review charged on electrical permits?",
        answer:
          "Not at the 65% building rate — non-building permits use the schedule's $146 hourly plan-review rate when review is needed.",
      },
      {
        question: "What does a service change cost?",
        answer:
          "The $59 base fee covers the permit opening; the $40 service-change row covers the work under 18.36.100.",
      },
      {
        question: "Do I file with the building department?",
        answer:
          "Yes — Building Services & Civil Enforcement, 451 South State Street, room 215, or through the City's online application page.",
      },
      {
        question: "When did the current fees take effect?",
        answer: "June 16, 2026, by Ordinance 2026-29.",
      },
    ],
  },
  {
    jurisdictionKey: SLC_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    slug: "plumbing-permit-fees",
    seoTitle: "Salt Lake City plumbing permit fees",
    seoDescription:
      "Salt Lake City plumbing permit fees — $59 base fee under 18.56.040, with itemized fixture and appliance rows.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: SLC_LAST_VERIFIED,
    title: "Salt Lake City plumbing permit fees",
    intro:
      "A plumbing permit in Salt Lake City opens at a **$59.00 base fee** (Consolidated Fee Schedule 18.56.040), with the schedule's itemized rows pricing fixtures, appliances and gas piping on top. There is no valuation ladder and no residential bundling — trade permits file separately.",
    localSummary:
      "The schedule's Plumbing Permits section (18.56.040) opens at the same $59.00 base fee the electrical section uses, then prices work by itemized rows: fixtures, appliances, water heaters and gas piping each carry their own charge, and inspection of a gas line or meter for utility clearance prices separately.\n\nBecause plumbing fees are row-driven rather than valuation-driven, the declared job value does not move the fee the way it does on the building ladder — what matters is what is being installed. Larger plumbing packages usually file alongside a building permit on the same project, and each permit opens its own $59.00 base.\n\nApplications file at Building Services & Civil Enforcement, room 215 at 451 South State Street, which also handles the City's mechanical permits on the same counter.",
    notIncluded:
      "This is the Consolidated Fee Schedule's plumbing permit fee. It excludes:\n\n- **The building permit** for the project the plumbing belongs to.\n- **Sewer and water connection charges**, which are utility fees, not permit fees.\n- **Irrigation and fire-line permits**, priced in their own schedule sections.\n- **Plan review** — non-building permits use the $146 hourly rate where review applies.",
    workedExample: {
      scenario:
        "A residential plumbing permit in Salt Lake City for a bathroom remodel with a water heater replacement.",
      inputs: {
        occupancy: "residential",
        valuationCents: 500_000,
      },
      notes:
        "The $59.00 base fee opens the permit; the schedule's fixture rows (18.56.040) price each fixture and the water heater on top.\n\nThe base fee is the floor every plumbing permit pays regardless of scope.",
    },
    faqs: [
      {
        question: "How much is a plumbing permit in Salt Lake City?",
        answer:
          "$59.00 base fee under 18.56.040, plus the schedule's itemized rows for each fixture, appliance or water heater installed.",
      },
      {
        question: "Is plumbing bundled into the building permit?",
        answer:
          "No — Salt Lake City issues trade permits separately from building permits.",
      },
      {
        question: "Does the fee scale with job value?",
        answer:
          "No — plumbing permits price by itemized rows, not by project valuation.",
      },
      {
        question: "What about a water heater swap?",
        answer:
          "Its own permit at the $59.00 base fee, with the water-heater row pricing the work.",
      },
      {
        question: "Where do these fees come from?",
        answer:
          "The Consolidated Fee Schedule (amended June 16, 2026), Plumbing Permits section 18.56.040.",
      },
      {
        question: "Is gas piping part of the plumbing permit?",
        answer:
          "Yes — gas piping rows sit in the plumbing/mechanical sections, with gas-line inspection for utility clearance priced separately.",
      },
      {
        question: "Is plan review charged?",
        answer:
          "Non-building permits use the schedule's $146 hourly plan-review rate where review applies, not the 65% building rate.",
      },
      {
        question: "When did the current fees take effect?",
        answer: "June 16, 2026, by Ordinance 2026-29.",
      },
    ],
  },
];

const verifications: SeedVerification[] = [
  {
    entityType: "source",
    entityKey: SLC_FEE_SCHEDULE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: SLC_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: SLC_FEE_SCHEDULE_KEY,
    notes:
      "Read 2026-09-26 from tools.slc.gov/feeschedule (official Consolidated Fee Schedule viewer, amended 06/16/2026 by Ord. 2026-29). The eight 18.32.035 building rows were transcribed verbatim and the chained bases verified arithmetically at every seam; the 65% plan-review row, $146 hourly rate, and $59 electrical/plumbing base fees were transcribed from the same document.",
  },
  {
    entityType: "fee_rule",
    entityKey: "SLC-BLD-500K",
    permitTypeKey: "building",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: SLC_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: SLC_FEE_SCHEDULE_KEY,
    notes:
      "'$100,000.01 - $500,000.00: $1,425.97 for the first $100,000 plus $8 for each additional $1,000 or fraction thereof, to and including $500,000' — base chaining verified ($925.97 + 50 x $10.00 = $1,425.97).",
  },
  {
    entityType: "jurisdiction_profile",
    entityKey: SLC_KEYS.jurisdiction,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: SLC_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: SLC_FEE_SCHEDULE_KEY,
    notes:
      "Profile built from the Consolidated Fee Schedule plus the Building Services application page (issuing office, fee-form links) and SLC Code 18.20.020 (valuation basis).",
  },
  {
    entityType: "permit_page",
    entityKey: "building-permit-fees",
    permitTypeKey: "building",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: SLC_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: SLC_FEE_SCHEDULE_KEY,
    notes:
      "Recorded for the editorial gate: this page's prose, sources and fee-rule mapping were checked against the schedule published by Salt Lake City Corporation, Utah during the research pass that produced this seed; the seed's content tests assert the arithmetic. No amount on this page is estimated.",
  },
  {
    entityType: "permit_page",
    entityKey: "electrical-permit-fees",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: SLC_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: SLC_FEE_SCHEDULE_KEY,
    notes:
      "Recorded for the editorial gate: this page's prose, sources and fee-rule mapping were checked against the schedule published by Salt Lake City Corporation, Utah during the research pass that produced this seed; the seed's content tests assert the arithmetic. No amount on this page is estimated.",
  },
  {
    entityType: "permit_page",
    entityKey: "plumbing-permit-fees",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: SLC_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: SLC_FEE_SCHEDULE_KEY,
    notes:
      "Recorded for the editorial gate: this page's prose, sources and fee-rule mapping were checked against the schedule published by Salt Lake City Corporation, Utah during the research pass that produced this seed; the seed's content tests assert the arithmetic. No amount on this page is estimated.",
  },
];

export const saltLakeCitySeed: JurisdictionSeed = {
  state,
  county,
  jurisdiction,
  departments,
  sources,
  permitTypes: [],
  projectTypes: [],
  jurisdictionPermitTypes: [
    {
      jurisdictionKey: SLC_KEYS.jurisdiction,
      permitTypeKey: "building",
      isAvailable: true,
      localName: "Building permit (Consolidated Fee Schedule 18.32.035)",
      officialUrl: "https://tools.slc.gov/feeschedule/",
      notes:
        "Eight valuation bands with chained bases; plan review at 65% of the permit fee; effective 2026-06-16 (Ord. 2026-29).",
    },
    {
      jurisdictionKey: SLC_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      isAvailable: true,
      localName: "Electrical permit (18.36 base fee)",
      officialUrl: "https://tools.slc.gov/feeschedule/",
      notes:
        "$59.00 base fee with itemized and percentage rows for commercial work under 18.36.",
    },
    {
      jurisdictionKey: SLC_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      isAvailable: true,
      localName: "Plumbing permit (18.56.040 base fee)",
      officialUrl: "https://tools.slc.gov/feeschedule/",
      notes:
        "$59.00 base fee with itemized fixture and appliance rows; trade permits file separately from building permits.",
    },
  ],
  feeSchedules,
  feeRules,
  requirements: [],
  profile,
  permitPages,
  verifications,
};

export const SLC_PUBLISHED_PERMIT_PAGES = saltLakeCitySeed.permitPages.filter(
  (page) => page.publishStatus === "published" && !page.noindex,
);
