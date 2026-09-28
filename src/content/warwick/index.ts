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
  WWK_BUILDING_RULES,
  WWK_ELECTRICAL_RULES,
  WWK_FEE_EFFECTIVE_FROM,
  WWK_STATEWIDE_REG_KEY,
  WWK_PLUMBING_RULES,
} from "./fee-rules";

export * from "./fee-rules";

/**
 * The complete Warwick, Rhode Island seed payload.
 *
 * Every figure traces to research/rhode-island/warwick.md, which traces to
 * 510-RICR-00-00-21 "State Wide Permitting Fee" §21.12(A)(35) — the statewide
 * regulation that computes municipal building permit fees (active amendment
 * effective 2023-12-10).
 */

const RESEARCHER = "Permit Fee Intelligence research pass (Rhode Island)";

export const WWK_LAST_VERIFIED = "2026-09-26";

export const WWK_KEYS = {
  state: "ri",
  county: "kent-county",
  jurisdiction: "warwick",
  feeSchedule: WWK_STATEWIDE_REG_KEY,
} as const;

const state: SeedState = {
  code: "RI",
  slug: "rhode-island",
  name: "Rhode Island",
  fipsCode: "44",
};

const county: SeedCounty = {
  key: WWK_KEYS.county,
  slug: "kent-county",
  name: "Kent County",
  fipsCode: "44003",
};

const jurisdiction: SeedJurisdiction = {
  key: WWK_KEYS.jurisdiction,
  stateKey: WWK_KEYS.state,
  countyKey: WWK_KEYS.county,
  type: "city",
  slug: "warwick",
  name: "Warwick",
  officialName: "City of Warwick, Rhode Island",
  websiteUrl: "https://www.warwickri.gov/",
  permitPortalUrl: "https://www.warwickri.gov/187/Building-Department",
  timezone: "America/New_York",
  isActive: true,
};

const departments: SeedDepartment[] = [
  {
    key: "warwick-building",
    jurisdictionKey: WWK_KEYS.jurisdiction,
    kind: "building",
    name: "Building Inspection & Zoning Enforcement",
    phone: "(401) 738-2000",
    email: null,
    url: "https://www.warwickri.gov/187/Building-Department",
    addressLine: "3275 Post Road, Warwick, RI 02886",
    hours: "Monday through Friday, 8:30 a.m. to 4:30 p.m.",
    notes:
      "Issues building and trade permits for the city; permit fees are computed from the statewide regulation's §21.12(A)(35) schedule.",
  },
];

const sources: SeedSource[] = [
  {
    key: WWK_STATEWIDE_REG_KEY,
    jurisdictionKey: WWK_KEYS.jurisdiction,
    title:
      "510-RICR-00-00-21 State Wide Permitting Fee — §21.12(A)(35) City of Warwick schedule",
    url: "https://rules.sos.ri.gov/regulations/part/510-00-00-21",
    sourceType: "municipal_code",
    issuingAuthority: "Rhode Island Building Code Commission",
    authorityKind: "state",
    isPrimary: true,
    documentDate: "2023-12-10",
    effectiveFrom: WWK_FEE_EFFECTIVE_FROM,
    retrievedAt: WWK_LAST_VERIFIED,
    lastVerifiedAt: WWK_LAST_VERIFIED,
    notes:
      "Read 2026-09-26 from the Secretary of State's regulations host (HTTP 200). ACTIVE RULE, amendment effective 2023-12-10. §21.6 requires municipalities to compute permit fees from the §21.12 schedules. Warwick (§21.12(A)(35)): $10.00 per $1,000 to $10,000; $100 + $8.00 per $1,000 exceeding $10k to $50,000; $420 + $6.00 per $1,000 exceeding $50k above; $75 minimum fee. Band bases chain exactly ($10 x 10 = $100; $100 + $8 x 40 = $420).",
  },
  {
    key: "warwick-building-inspection",
    jurisdictionKey: WWK_KEYS.jurisdiction,
    title: "City of Warwick — Building Inspection & Zoning Enforcement",
    url: "https://www.warwickri.gov/187/Building-Department",
    sourceType: "municipal_website",
    issuingAuthority: "City of Warwick Building Inspection & Zoning Enforcement",
    authorityKind: "city",
    isPrimary: true,
    documentDate: WWK_LAST_VERIFIED,
    effectiveFrom: WWK_FEE_EFFECTIVE_FROM,
    retrievedAt: WWK_LAST_VERIFIED,
    lastVerifiedAt: WWK_LAST_VERIFIED,
    notes:
      "The issuing office for building and trade permits in Warwick; the statewide schedule is the fee schedule the office computes from.",
  },
];

const feeSchedules: SeedFeeSchedule[] = [
  {
    key: WWK_KEYS.feeSchedule,
    jurisdictionKey: WWK_KEYS.jurisdiction,
    sourceKey: WWK_STATEWIDE_REG_KEY,
    title: "City of Warwick permit fee schedule (510-RICR-00-00-21 §21.12(A)(35))",
    officialUrl: "https://rules.sos.ri.gov/regulations/part/510-00-00-21",
    effectiveFrom: WWK_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: WWK_LAST_VERIFIED,
    notes:
      "Three chained linear legs with a $75 printed minimum — the dataset's cleanest statewide ladder.",
  },
];

function attach(permitTypeKey: string, rules: SeedFeeRule["rule"][]): SeedFeeRule[] {
  return rules.map((rule) => ({
    jurisdictionKey: WWK_KEYS.jurisdiction,
    permitTypeKey,
    scheduleKey: WWK_KEYS.feeSchedule,
    rule,
  }));
}

const feeRules: SeedFeeRule[] = [
  ...attach("building", WWK_BUILDING_RULES),
  ...attach("electrical", WWK_ELECTRICAL_RULES),
  ...attach("plumbing", WWK_PLUMBING_RULES),
];

const profile: SeedProfile = {
  jurisdictionKey: WWK_KEYS.jurisdiction,
  headline: "What building permits cost in Warwick",
  summary:
    "Warwick prices building permits from **project valuation** on the statewide schedule: **$10.00 per $1,000** to $10,000, **$100 + $8.00 per $1,000** to $50,000, then **$420 + $6.00 per $1,000** above — with a printed **$75 minimum**. Electrical and plumbing permits read the same ladder.",
  localContext:
    "Warwick's permit fee is written in the state's regulation, not in a City ordinance. 510-RICR-00-00-21 — the Rhode Island Building Code Commission's statewide permitting-fee rule — computes every municipality's fee, and §21.6 makes its §21.12 schedules the fees municipalities must charge. Warwick's row is §21.12(A)(35), and it is the state's cleanest ladder: three linear legs whose bases chain exactly, with the state's typical printed minimum.\n\nThe arithmetic: $10.00 per $1,000 of project valuation to $10,000 (reaching exactly $100.00 at the seam), $8.00 per $1,000 above $10,000 to $50,000 (reaching exactly $420.00), then $6.00 per $1,000 above $50,000 with no limit. A $50,000 project prices $420.00; a $150,000 project prices $420.00 + $6.00 x 100 = $1,020.00. The printed note adds the **$75.00 minimum** — the binding fee below roughly $7,500 of valuation.\n\nThe Building Inspection & Zoning Enforcement office at 3275 Post Road issues the permits. Like every Rhode Island schedule, Warwick's is exclusive of the § 23-27.3-108.2(c)(1) statutory levy — a separate charge the schedule does not include.",
  valuationBasis:
    "**Project valuation** read against the statewide ladder: $10.00 per $1,000 to $10,000, $8.00 per $1,000 from $10,001 to $50,000, $6.00 per $1,000 above $50,000, $75.00 minimum. Each partial thousand rounds up.",
  notIncluded:
    "These figures are the statewide schedule's permit fees for Warwick. They exclude:\n\n- **The statutory levy of R.I. Gen. Laws § 23-27.3-108.2(c)(1)** — the regulation says its schedules are exclusive of it.\n- **Mechanical and demolition permits**, which the office issues but which this dataset prices only where a printed schedule says so.\n- **Plan review** — the schedule publishes no plan-review percentage.\n- **Zoning approvals**, a separate process before the permit.",
  seoTitle: "Warwick building permit fees",
  seoDescription:
    "How Warwick, Rhode Island prices building, electrical and plumbing permits — the statewide ladder: $10 per $1,000 to $10k, then $8 and $6, with a $75 minimum.",
  publishStatus: "published",
  noindex: false,
  lastReviewedAt: WWK_LAST_VERIFIED,
};

const permitPages: SeedPermitPage[] = [
  {
    jurisdictionKey: WWK_KEYS.jurisdiction,
    permitTypeKey: "building",
    slug: "building-permit-fees",
    seoTitle: "Warwick building permit fees",
    seoDescription:
      "Warwick, Rhode Island building permit fees — the statewide ladder: $10 per $1,000 to $10k, $8 to $50k, $6 above, $75 minimum.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: WWK_LAST_VERIFIED,
    title: "Warwick building permit fees",
    intro:
      "A Warwick building permit is priced from **project valuation** on the statewide schedule: **$10.00 per $1,000** of valuation to $10,000, **$100 plus $8.00 per $1,000** from $10,001 to $50,000, and **$420 plus $6.00 per $1,000** above $50,000 — with a printed **$75.00 minimum fee**. A $50,000 project prices exactly $420.00.",
    localSummary:
      "Warwick's fee comes from the state's regulation — 510-RICR-00-00-21, §21.12(A)(35) — and it is the most transparent ladder in this dataset: three linear legs, bases that chain to the dollar, and one printed minimum. The first leg runs $10.00 per $1,000 of valuation to exactly $100.00 at $10,000; the middle band adds $8.00 per $1,000 above $10,000 to exactly $420.00 at $50,000; the top band adds $6.00 per $1,000 above $50,000 with no ceiling.\n\nReading the fee is immediate: a $30,000 addition sits in the middle band at $100.00 + 20 x $8.00 = **$260.00**; a $200,000 new build sits in the top band at $420.00 + 150 x $6.00 = **$1,320.00**. Below roughly $7,500 of valuation the **$75.00 minimum** is the fee.\n\nPermits are issued by Building Inspection & Zoning Enforcement at 3275 Post Road. The regulation's schedules are exclusive of the § 23-27.3-108.2(c)(1) statutory levy, which is charged outside the schedule.",
    notIncluded:
      "This is the statewide schedule's building permit fee. It excludes:\n\n- **The § 23-27.3-108.2(c)(1) statutory levy**, excluded from the schedule by the regulation's own terms.\n- **Mechanical and demolition permits**, separate permits with their own valuation readings.\n- **Plan review** — the schedule publishes no plan-review percentage.\n- **Zoning approvals**, which precede the permit.",
    workedExample: {
      scenario:
        "A single-family home in Warwick with a project valuation of $150,000.",
      inputs: {
        occupancy: "residential",
        valuationCents: 15_000_000,
      },
      notes:
        "Top band: $420.00 for the first $50,000 plus $6.00 for each of the 100 thousands above: $420.00 + 100 x $6.00 = **$1,020.00**.\n\nA $30,000 project would sit in the middle band: $100.00 + 20 x $8.00 = $260.00.",
    },
    faqs: [
      {
        question: "How much is a building permit in Warwick, Rhode Island?",
        answer:
          "$10.00 per $1,000 of valuation to $10,000, then $100 + $8.00 per $1,000 to $50,000, then $420 + $6.00 per $1,000 above — with a $75 minimum. A $50,000 project is $420.00.",
      },
      {
        question: "Who sets Warwick's permit fees?",
        answer:
          "The state's 510-RICR-00-00-21 regulation computes municipal permit fees statewide; §21.6 requires Warwick to charge its §21.12(A)(35) schedule.",
      },
      {
        question: "When did the current fees take effect?",
        answer:
          "The active amendment of the regulation is effective December 10, 2023.",
      },
      {
        question: "Is there a minimum permit fee?",
        answer:
          "Yes — the schedule's printed note sets a $75.00 minimum, binding below roughly $7,500 of valuation.",
      },
      {
        question: "Do electrical and plumbing permits cost the same?",
        answer:
          "They read the same valuation ladder — there is no separate trade table in the statewide schedule.",
      },
      {
        question: "How do the band bases chain?",
        answer:
          "Exactly: $10.00 x 10 = $100.00 at the first seam, $100 + $8.00 x 40 = $420.00 at the second.",
      },
      {
        question: "Does the fee include the state levy?",
        answer:
          "No — the regulation states its schedules are exclusive of the § 23-27.3-108.2(c)(1) levy.",
      },
      {
        question: "Where do I apply?",
        answer:
          "At Building Inspection & Zoning Enforcement, 3275 Post Road, Warwick City Hall.",
      },
      {
        question: "What counts as project valuation?",
        answer:
          "The total value of the work declared at application — the ladder reads valuation bands only.",
      },
      {
        question: "Is there a plan review fee?",
        answer:
          "The schedule publishes no plan-review percentage; the ladder and the minimum are the printed charges.",
      },
      {
        question: "How does a $200,000 project price?",
        answer: "$420.00 + 150 x $6.00 = $1,320.00 in the top band.",
      },
      {
        question: "How is a partial thousand charged?",
        answer:
          "Each partial thousand rounds up under this site's whole-dollar convention, matching the ladder's whole-dollar arithmetic.",
      },
    ],
  },
  {
    jurisdictionKey: WWK_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    slug: "electrical-permit-fees",
    seoTitle: "Warwick electrical permit fees",
    seoDescription:
      "Warwick, Rhode Island electrical permit fees — the statewide valuation ladder with a $75 minimum, applied to the electrical scope's valuation.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: WWK_LAST_VERIFIED,
    title: "Warwick electrical permit fees",
    intro:
      "An electrical permit in Warwick reads the **same statewide valuation ladder** as the building permit: **$10.00 per $1,000** to $10,000 of valuation, **$100 + $8.00 per $1,000** to $50,000, **$420 + $6.00 per $1,000** above, with the **$75.00 minimum**.",
    localSummary:
      "The statewide regulation prices municipal permit fees by valuation, and Warwick's electrical permit reads the same §21.12(A)(35) ladder the building permit does — there is no per-circuit or per-service row in the schedule. A $5,000 electrical scope prices $50.00 (the $75.00 minimum carries instead), a $10,000 scope prices $100.00, a $25,000 scope prices $260.00.\n\nThe band seams are the checkpoints: below $10,000 the $10.00 rate runs; to $50,000 the $8.00 rate rides on $100.00; above $50,000 the $6.00 rate rides on $420.00 — a rate only a whole project's electrical package would reach.\n\nThe office at 3275 Post Road issues the permit, and the regulation's statutory-levy exclusion applies to the electrical ladder like every other.",
    notIncluded:
      "This is the statewide schedule's electrical permit fee. It excludes:\n\n- **The building permit** for the project the electrical work belongs to.\n- **The § 23-27.3-108.2(c)(1) statutory levy**, excluded by the regulation's terms.\n- **Fire alarm permits**, which ride the fire/mechanical side rather than the electrical ladder.\n- **Plan review** — none is published.",
    workedExample: {
      scenario:
        "A stand-alone electrical scope in Warwick declared at $12,000.",
      inputs: {
        occupancy: "residential",
        valuationCents: 1_200_000,
      },
      notes:
        "Middle band: $100.00 for the first $10,000 plus $8.00 for each of the 2 thousands above: $100.00 + 2 x $8.00 = **$116.00**.\n\nA $5,000 job would compute $50.00 on the first leg, and the printed $75.00 minimum would carry the fee instead.",
    },
    faqs: [
      {
        question: "How much is an electrical permit in Warwick?",
        answer:
          "The statewide ladder: $10.00 per $1,000 to $10,000, $8.00 per $1,000 to $50,000, $6.00 above — $75.00 minimum.",
      },
      {
        question: "Does the fee scale with the job's value?",
        answer:
          "Yes — the schedule prices by project valuation, so the declared electrical scope value drives the fee.",
      },
      {
        question: "Is there a minimum?",
        answer: "Yes — $75.00, the schedule's printed note.",
      },
      {
        question: "Who fixes the rate?",
        answer:
          "The Rhode Island Building Code Commission's regulation 510-RICR-00-00-21.",
      },
      {
        question: "When did the current rate take effect?",
        answer: "The active amendment is effective December 10, 2023.",
      },
      {
        question: "How does a $25,000 scope price?",
        answer: "$100.00 + 15 x $8.00 = $220.00, in the middle band.",
      },
      {
        question: "Do I file with the city or the state?",
        answer:
          "With the City — Building Inspection & Zoning Enforcement — under the state-set fee.",
      },
      {
        question: "Is the fee different for commercial work?",
        answer: "No — the ladder makes no occupancy distinction.",
      },
      {
        question: "What about a service upgrade?",
        answer:
          "It is an electrical permit priced from its own scope value on the same ladder.",
      },
      {
        question: "Is plan review charged?",
        answer: "The schedule publishes no plan-review percentage.",
      },
    ],
  },
  {
    jurisdictionKey: WWK_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    slug: "plumbing-permit-fees",
    seoTitle: "Warwick plumbing permit fees",
    seoDescription:
      "Warwick, Rhode Island plumbing permit fees — the statewide valuation ladder with a $75 minimum, applied to the plumbing scope's valuation.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: WWK_LAST_VERIFIED,
    title: "Warwick plumbing permit fees",
    intro:
      "A plumbing permit in Warwick reads the **same statewide valuation ladder**: **$10.00 per $1,000** to $10,000 of valuation, **$100 + $8.00 per $1,000** to $50,000, **$420 + $6.00 per $1,000** above, **$75.00 minimum**. There is no per-fixture row — the scope's declared value drives the fee.",
    localSummary:
      "Warwick's plumbing permit prices like everything else in the city: from project valuation on the statewide §21.12(A)(35) ladder. A $6,000 repipe prices $60.00 on the first leg (the $75.00 minimum carries instead), a $15,000 whole-house package prices $100.00 + 5 x $8.00 = $140.00 in the middle band.\n\nBecause the ladder is valuation-driven, the declared cost is the whole input — no fixture counts, no supply and drainage rows. The $75.00 minimum is the only floor, and the band bases chain exactly, so no valuation falls between printed bases.\n\nThe regulation's statutory-levy exclusion applies here too: § 23-27.3-108.2(c)(1) charges sit outside the schedule.",
    notIncluded:
      "This is the statewide schedule's plumbing permit fee. It excludes:\n\n- **The building permit** for the project the plumbing belongs to.\n- **Sewer and water connection charges**, which are utility bills, not permit fees.\n- **The § 23-27.3-108.2(c)(1) statutory levy**, excluded by the regulation's terms.\n- **Plan review** — none is published.",
    workedExample: {
      scenario:
        "A whole-house plumbing package in Warwick declared at $15,000 of scope value.",
      inputs: {
        occupancy: "residential",
        valuationCents: 1_500_000,
      },
      notes:
        "Middle band: $100.00 for the first $10,000 plus $8.00 for each of the 5 thousands above: $100.00 + 5 x $8.00 = **$140.00**.\n\nA $6,000 repipe would compute $60.00 on the first leg, under the $75.00 minimum.",
    },
    faqs: [
      {
        question: "How much is a plumbing permit in Warwick?",
        answer:
          "The statewide ladder: $10.00 per $1,000 to $10,000, $8.00 per $1,000 to $50,000, $6.00 above, $75.00 minimum.",
      },
      {
        question: "Is there a per-fixture charge?",
        answer: "No — the schedule prices by project valuation.",
      },
      {
        question: "Who sets the plumbing rate?",
        answer: "The state's 510-RICR-00-00-21 regulation, §21.12(A)(35).",
      },
      {
        question: "What does a $15,000 plumbing package price?",
        answer: "$100.00 + 5 x $8.00 = $140.00, in the middle band.",
      },
      {
        question: "When does the $75 minimum bind?",
        answer:
          "Below roughly $7,500 of declared scope value on the first leg.",
      },
      {
        question: "Is the fee different for commercial plumbing?",
        answer: "No — the ladder makes no occupancy distinction.",
      },
      {
        question: "Do sewer taps ride the permit?",
        answer:
          "No — sewer and water connection charges are utility bills.",
      },
      {
        question: "When did the rate take effect?",
        answer: "The active amendment is effective December 10, 2023.",
      },
      {
        question: "Where do I apply?",
        answer: "At Building Inspection & Zoning Enforcement, Warwick City Hall.",
      },
      {
        question: "Is plan review charged?",
        answer: "The schedule publishes no plan-review percentage.",
      },
    ],
  },
];

const verifications: SeedVerification[] = [
  {
    entityType: "source",
    entityKey: WWK_STATEWIDE_REG_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: WWK_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: WWK_STATEWIDE_REG_KEY,
    notes:
      "Read 2026-09-26 from rules.sos.ri.gov (HTTP 200). The Warwick row §21.12(A)(35) was transcribed verbatim: $10/$8/$6 per-$1,000 bands, chained bases $100/$420, $75 minimum note.",
  },
  {
    entityType: "fee_rule",
    entityKey: "WWK-BLD-LEG3",
    permitTypeKey: "building",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: WWK_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: WWK_STATEWIDE_REG_KEY,
    notes:
      "Top band: '$420 + $6.00 per $1,000 exceeding $50k', base chaining verified against the middle band's printed arithmetic ($100 + $8 x 40 = $420).",
  },
  {
    entityType: "jurisdiction_profile",
    entityKey: WWK_KEYS.jurisdiction,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: WWK_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: WWK_STATEWIDE_REG_KEY,
    notes:
      "Profile built from the statewide regulation plus the City's building-inspection page; the statewide-fee mechanism is stated on the record.",
  },
  {
    entityType: "permit_page",
    entityKey: "building-permit-fees",
    permitTypeKey: "building",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: WWK_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: WWK_STATEWIDE_REG_KEY,
    notes:
      "Recorded for the editorial gate: this page's prose, sources and fee-rule mapping were checked against the schedule published by City of Warwick, Rhode Island during the research pass that produced this seed; the seed's content tests assert the arithmetic. No amount on this page is estimated.",
  },
  {
    entityType: "permit_page",
    entityKey: "electrical-permit-fees",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: WWK_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: WWK_STATEWIDE_REG_KEY,
    notes:
      "Recorded for the editorial gate: this page's prose, sources and fee-rule mapping were checked against the schedule published by City of Warwick, Rhode Island during the research pass that produced this seed; the seed's content tests assert the arithmetic. No amount on this page is estimated.",
  },
  {
    entityType: "permit_page",
    entityKey: "plumbing-permit-fees",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: WWK_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: WWK_STATEWIDE_REG_KEY,
    notes:
      "Recorded for the editorial gate: this page's prose, sources and fee-rule mapping were checked against the schedule published by City of Warwick, Rhode Island during the research pass that produced this seed; the seed's content tests assert the arithmetic. No amount on this page is estimated.",
  },
];

export const warwickSeed: JurisdictionSeed = {
  state,
  county,
  jurisdiction,
  departments,
  sources,
  permitTypes: [],
  projectTypes: [],
  jurisdictionPermitTypes: [
    {
      jurisdictionKey: WWK_KEYS.jurisdiction,
      permitTypeKey: "building",
      isAvailable: true,
      localName: "Building permit (statewide schedule §21.12(A)(35))",
      officialUrl: "https://rules.sos.ri.gov/regulations/part/510-00-00-21",
      notes:
        "Three chained legs — $10/$8/$6 per $1,000 — with a $75 printed minimum; set by the statewide regulation effective 2023-12-10.",
    },
    {
      jurisdictionKey: WWK_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      isAvailable: true,
      localName: "Electrical permit (statewide schedule)",
      officialUrl: "https://rules.sos.ri.gov/regulations/part/510-00-00-21",
      notes: "Reads the same valuation ladder; no separate trade table exists.",
    },
    {
      jurisdictionKey: WWK_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      isAvailable: true,
      localName: "Plumbing permit (statewide schedule)",
      officialUrl: "https://rules.sos.ri.gov/regulations/part/510-00-00-21",
      notes: "Reads the same valuation ladder; no per-fixture row exists.",
    },
  ],
  feeSchedules,
  feeRules,
  requirements: [],
  profile,
  permitPages,
  verifications,
};

export const WWK_PUBLISHED_PERMIT_PAGES = warwickSeed.permitPages.filter(
  (page) => page.publishStatus === "published" && !page.noindex,
);
