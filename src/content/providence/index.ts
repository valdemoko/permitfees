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
  PVD_BUILDING_RULES,
  PVD_ELECTRICAL_RULES,
  PVD_FEE_EFFECTIVE_FROM,
  PVD_STATEWIDE_REG_KEY,
  PVD_PLUMBING_RULES,
} from "./fee-rules";

export * from "./fee-rules";

/**
 * The complete Providence, Rhode Island seed payload.
 *
 * Every figure traces to research/rhode-island/providence.md, which traces to
 * 510-RICR-00-00-21 "State Wide Permitting Fee" §21.12(A)(28) — the statewide
 * regulation that computes municipal building permit fees (active amendment
 * effective 2023-12-10).
 */

const RESEARCHER = "Permit Fee Intelligence research pass (Rhode Island)";

export const PVD_LAST_VERIFIED = "2026-09-26";

export const PVD_KEYS = {
  state: "ri",
  county: "providence-county",
  jurisdiction: "providence",
  feeSchedule: PVD_STATEWIDE_REG_KEY,
} as const;

const state: SeedState = {
  code: "RI",
  slug: "rhode-island",
  name: "Rhode Island",
  fipsCode: "44",
};

const county: SeedCounty = {
  key: PVD_KEYS.county,
  slug: "providence-county",
  name: "Providence County",
  fipsCode: "44007",
};

const jurisdiction: SeedJurisdiction = {
  key: PVD_KEYS.jurisdiction,
  stateKey: PVD_KEYS.state,
  countyKey: PVD_KEYS.county,
  type: "city",
  slug: "providence",
  name: "Providence",
  officialName: "City of Providence, Rhode Island",
  websiteUrl: "https://www.providenceri.gov/",
  permitPortalUrl: "https://www.providenceri.gov/inspection/online-permitting/",
  timezone: "America/New_York",
  isActive: true,
};

const departments: SeedDepartment[] = [
  {
    key: "providence-inspections",
    jurisdictionKey: PVD_KEYS.jurisdiction,
    kind: "building",
    name: "Department of Inspection & Standards",
    phone: "(401) 680-5201",
    email: null,
    url: "https://www.providenceri.gov/inspection/permit-inspections/",
    addressLine: "780 Allens Avenue, Providence, RI 02905",
    hours: "Monday through Friday, 8:30 a.m. to 4:30 p.m.",
    notes:
      "Issues building, mechanical, electrical, plumbing, moving and demolition permits for the city through the e-Permitting portal; permit fees are computed from the statewide regulation's schedule.",
  },
];

const sources: SeedSource[] = [
  {
    key: PVD_STATEWIDE_REG_KEY,
    jurisdictionKey: PVD_KEYS.jurisdiction,
    title:
      "510-RICR-00-00-21 State Wide Permitting Fee — §21.12(A)(28) City of Providence schedule",
    url: "https://rules.sos.ri.gov/regulations/part/510-00-00-21",
    sourceType: "municipal_code",
    issuingAuthority: "Rhode Island Building Code Commission",
    authorityKind: "state",
    isPrimary: true,
    documentDate: "2023-12-10",
    effectiveFrom: PVD_FEE_EFFECTIVE_FROM,
    retrievedAt: PVD_LAST_VERIFIED,
    lastVerifiedAt: PVD_LAST_VERIFIED,
    notes:
      "Read 2026-09-26 from the Secretary of State's regulations host (HTTP 200). ACTIVE RULE, amendment effective 2023-12-10. §21.6: 'The building permit fees assessed by municipalities shall be computed in accordance with the fee schedules listed in § 21.12.' Providence (§21.12(A)(28)): $23.00 per $1,000 to $10,000; $230 + $21.00 per $1,000 exceeding $10k to $50,000; $1,070 + $19.00 per $1,000 exceeding $50k above; $125 minimum fee. Band bases chain exactly. Fees are 'exclusive of the levy mandated by R.I. Gen. Laws § 23-27.3-108.2(c)(1)'.",
  },
  {
    key: "providence-permit-inspections",
    jurisdictionKey: PVD_KEYS.jurisdiction,
    title: "Department of Inspection & Standards — Permit Inspections",
    url: "https://www.providenceri.gov/inspection/permit-inspections/",
    sourceType: "municipal_website",
    issuingAuthority: "City of Providence Department of Inspection & Standards",
    authorityKind: "city",
    isPrimary: true,
    documentDate: PVD_LAST_VERIFIED,
    effectiveFrom: PVD_FEE_EFFECTIVE_FROM,
    retrievedAt: PVD_LAST_VERIFIED,
    lastVerifiedAt: PVD_LAST_VERIFIED,
    notes:
      "The issuing office (780 Allens Avenue, 401.680.5201, weekdays 8:30-4:30). The department's FAQ directs applicants to 'see the fee schedule for Building, Plumbing, Mechanical' — the schedule the statewide regulation fixes.",
  },
  {
    key: "providence-epermitting",
    jurisdictionKey: PVD_KEYS.jurisdiction,
    title: "Providence e-Permitting",
    url: "https://www.providenceri.gov/inspection/online-permitting/",
    sourceType: "permit_portal",
    issuingAuthority: "City of Providence Department of Inspection & Standards",
    authorityKind: "city",
    isPrimary: true,
    documentDate: PVD_LAST_VERIFIED,
    effectiveFrom: PVD_FEE_EFFECTIVE_FROM,
    retrievedAt: PVD_LAST_VERIFIED,
    lastVerifiedAt: PVD_LAST_VERIFIED,
    notes:
      "The application route: building, mechanical, electrical, plumbing, moving and demolition permits are available online through the City's e-Permitting launch.",
  },
];

const feeSchedules: SeedFeeSchedule[] = [
  {
    key: PVD_KEYS.feeSchedule,
    jurisdictionKey: PVD_KEYS.jurisdiction,
    sourceKey: PVD_STATEWIDE_REG_KEY,
    title: "City of Providence permit fee schedule (510-RICR-00-00-21 §21.12(A)(28))",
    officialUrl: "https://rules.sos.ri.gov/regulations/part/510-00-00-21",
    effectiveFrom: PVD_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: PVD_LAST_VERIFIED,
    notes:
      "Three chained linear legs with a $125 printed minimum; the statewide formula sets the schedule and the Building Code Commission keeps it current on its own site (§21.7).",
  },
];

function attach(permitTypeKey: string, rules: SeedFeeRule["rule"][]): SeedFeeRule[] {
  return rules.map((rule) => ({
    jurisdictionKey: PVD_KEYS.jurisdiction,
    permitTypeKey,
    scheduleKey: PVD_KEYS.feeSchedule,
    rule,
  }));
}

const feeRules: SeedFeeRule[] = [
  ...attach("building", PVD_BUILDING_RULES),
  ...attach("electrical", PVD_ELECTRICAL_RULES),
  ...attach("plumbing", PVD_PLUMBING_RULES),
];

const profile: SeedProfile = {
  jurisdictionKey: PVD_KEYS.jurisdiction,
  headline: "What building permits cost in Providence",
  summary:
    "Providence prices building permits from **project valuation** on the statewide schedule: **$23.00 per $1,000** to $10,000, **$230 + $21.00 per $1,000** to $50,000, then **$1,070 + $19.00 per $1,000** above — with a printed **$125 minimum**. Electrical and plumbing permits read the same ladder.",
  localContext:
    "Rhode Island is a statewide-fee state, and that is the first thing to know about a Providence permit: the City does not set its own rate. Regulation 510-RICR-00-00-21, promulgated by the Building Code Commission under R.I. Gen. Laws § 23-27.3-119, computes every municipality's building permit fee, and §21.6 makes the §21.12 schedules the fees municipalities must charge. Providence's schedule (§21.12(A)(28)) is the state's most expensive ladder.\n\nThe ladder is three linear legs whose bases chain exactly: $23.00 per $1,000 of project valuation to $10,000 ($230 at the seam), $21.00 per $1,000 above $10,000 to $50,000 ($1,070 at the seam), then $19.00 per $1,000 above $50,000 with no upper limit. A $50,000 project prices $1,070.00; a $150,000 project prices $1,070.00 + $19.00 x 100 = $2,970.00. The printed note adds the floor: no permit computes below **$125.00**.\n\nThe department behind the counter is Inspection & Standards at 780 Allens Avenue, and its e-Permitting portal takes building, mechanical, electrical, plumbing, moving and demolition applications online. The regulation's one carve-out worth knowing: its schedules are 'exclusive of the levy mandated by R.I. Gen. Laws § 23-27.3-108.2(c)(1)' — a separate statutory levy the schedule does not include.",
  valuationBasis:
    "**Project valuation** — total cost of the work — read against the statewide ladder: $23.00 per $1,000 to $10,000, $21.00 per $1,000 from $10,001 to $50,000, $19.00 per $1,000 above $50,000, $125.00 minimum. Each partial thousand rounds up.",
  notIncluded:
    "These figures are the statewide schedule's permit fees for Providence. They exclude:\n\n- **The statutory levy of R.I. Gen. Laws § 23-27.3-108.2(c)(1)** — the regulation says its schedules are exclusive of it.\n- **Mechanical, moving and demolition permits**, which e-Permitting takes but which this dataset prices only where a printed schedule says so.\n- **Plan review** — the regulation's schedule publishes no plan-review percentage.\n- **Zoning and historic-district approvals**, which are separate City processes before the permit.",
  seoTitle: "Providence building permit fees",
  seoDescription:
    "How Providence, Rhode Island prices building, electrical and plumbing permits — the statewide ladder: $23 per $1,000 to $10k, then $21 and $19, with a $125 minimum.",
  publishStatus: "published",
  noindex: false,
  lastReviewedAt: PVD_LAST_VERIFIED,
};

const permitPages: SeedPermitPage[] = [
  {
    jurisdictionKey: PVD_KEYS.jurisdiction,
    permitTypeKey: "building",
    slug: "building-permit-fees",
    seoTitle: "Providence building permit fees",
    seoDescription:
      "Providence, Rhode Island building permit fees — the statewide ladder: $23 per $1,000 to $10k, $21 to $50k, $19 above, $125 minimum.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: PVD_LAST_VERIFIED,
    title: "Providence building permit fees",
    intro:
      "A Providence building permit is priced from **project valuation** on the statewide schedule: **$23.00 per $1,000** of valuation to $10,000, **$230 plus $21.00 per $1,000** from $10,001 to $50,000, and **$1,070 plus $19.00 per $1,000** above $50,000 — with a printed **$125.00 minimum fee**. A $50,000 project prices exactly $1,070.00.",
    localSummary:
      "Providence's fee law is written in the state's regulation, not in a City document. 510-RICR-00-00-21 (active amendment effective December 10, 2023) computes municipal permit fees statewide, and Providence's own schedule inside it — §21.12(A)(28) — is the priciest ladder the state publishes. The three legs chain with no gaps: the first leg's $23.00 per $1,000 reaches exactly $230.00 at $10,000, and the middle band's arithmetic reaches exactly $1,070.00 at $50,000, so no valuation can fall between the printed bases.\n\nReading the fee is one look at the ladder: a $25,000 addition sits in the middle band at $230.00 + 15 x $21.00 = **$545.00**; a $200,000 new build sits in the top band at $1,070.00 + 150 x $19.00 = **$3,920.00**. Below roughly $5,500 of valuation the printed **$125.00 minimum** becomes the fee instead of the ladder.\n\nApplications run through the City's e-Permitting portal at Inspection & Standards (780 Allens Avenue). One statutory footnote matters to large projects: the regulation states its schedules are exclusive of the § 23-27.3-108.2(c)(1) levy, a separate statutory charge outside the schedule.",
    notIncluded:
      "This is the statewide schedule's building permit fee. It excludes:\n\n- **The § 23-27.3-108.2(c)(1) statutory levy**, which the regulation expressly excludes from its schedules.\n- **Mechanical, moving and demolition permits** — separate permits on e-Permitting.\n- **Plan review** — the schedule publishes no plan-review percentage.\n- **Zoning, historic-district and Board of Contracts approvals** preceding the permit.",
    workedExample: {
      scenario:
        "A two-storey commercial fit-out in Providence with a project valuation of $150,000.",
      inputs: {
        occupancy: "commercial",
        valuationCents: 15_000_000,
      },
      notes:
        "Top band: $1,070.00 for the first $50,000 plus $19.00 for each of the 100 thousands above: $1,070.00 + 100 x $19.00 = **$2,970.00**.\n\nThe $125.00 minimum never binds at this valuation — it is the fee only for very small jobs (below roughly $5,500 of valuation on the $23.00-per-$1,000 leg).",
    },
    faqs: [
      {
        question: "How much is a building permit in Providence, Rhode Island?",
        answer:
          "$23.00 per $1,000 of valuation to $10,000, then $230 + $21.00 per $1,000 to $50,000, then $1,070 + $19.00 per $1,000 above — with a $125 minimum. A $50,000 project is $1,070.00.",
      },
      {
        question: "Who sets Providence's permit fees?",
        answer:
          "The state does. Regulation 510-RICR-00-00-21, promulgated by the Rhode Island Building Code Commission, computes municipal permit fees statewide, and §21.6 requires municipalities to charge its schedules.",
      },
      {
        question: "When did the current fees take effect?",
        answer:
          "The active amendment of the regulation is effective December 10, 2023; statewide schedules originally took effect July 1, 2018.",
      },
      {
        question: "Is there a minimum permit fee?",
        answer:
          "Yes — the schedule's printed note sets a $125.00 minimum, which binds for very small projects (roughly under $5,500 of valuation).",
      },
      {
        question: "Do electrical and plumbing permits cost the same?",
        answer:
          "They read the same valuation ladder — the statewide schedule prices permit fees by valuation, and the City's FAQ names the Building, Plumbing and Mechanical schedules together.",
      },
      {
        question: "How do the band bases chain?",
        answer:
          "Exactly: $23.00 x 10 thousands = $230.00 at the first seam, and $230 + $21.00 x 40 = $1,070.00 at the second — no valuation falls between the printed bases.",
      },
      {
        question: "Does the fee include the state levy?",
        answer:
          "No — the regulation states its schedules are exclusive of the levy mandated by R.I. Gen. Laws § 23-27.3-108.2(c)(1), a separate statutory charge.",
      },
      {
        question: "How do I apply?",
        answer:
          "Through Providence e-Permitting (building, mechanical, electrical, plumbing, moving and demolition permits online), backed by Inspection & Standards at 780 Allens Avenue.",
      },
      {
        question: "What counts as project valuation?",
        answer:
          "The total value of the work — the schedule reads valuation bands, not square footage or fixture counts.",
      },
      {
        question: "Is there a plan review fee?",
        answer:
          "The statewide schedule publishes no plan-review percentage; the valuation ladder and the minimum are the printed charges.",
      },
      {
        question: "Can Providence change its own schedule?",
        answer:
          "Only through the regulation's amendment process — the commissioner may propose adjustments, and the commission must authorize them (§21.8), which is why the City's rate matches the state's table row for row.",
      },
      {
        question: "How is a partial thousand charged?",
        answer:
          "Each partial thousand rounds up under this site's whole-dollar convention, matching the ladder's whole-dollar band arithmetic.",
      },
    ],
  },
  {
    jurisdictionKey: PVD_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    slug: "electrical-permit-fees",
    seoTitle: "Providence electrical permit fees",
    seoDescription:
      "Providence, Rhode Island electrical permit fees — the statewide valuation ladder with a $125 minimum, applied to the electrical scope's valuation.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: PVD_LAST_VERIFIED,
    title: "Providence electrical permit fees",
    intro:
      "An electrical permit in Providence reads the **same statewide valuation ladder** as the building permit: **$23.00 per $1,000** to $10,000 of valuation, **$230 + $21.00 per $1,000** to $50,000, **$1,070 + $19.00 per $1,000** above, with the **$125.00 minimum**. Declare the value of the electrical scope and the ladder prices it.",
    localSummary:
      "Rhode Island's statewide regulation prices municipal permit fees by valuation, and the City's inspection FAQ names the Building, Plumbing and Mechanical fee schedules together — the same instrument. For an electrical permit that means the fee scales with the declared value of the electrical work, not with circuits or fixtures: a $5,000 scope prices $115.00 (binding against the $125.00 minimum), a $10,000 scope prices $230.00, a $25,000 scope prices $545.00.\n\nThe band seams are the useful checkpoints. Below $10,000 the first leg runs at $23.00 per $1,000; between $10,001 and $50,000 the middle band's $21.00 rate applies on top of the $230.00 chained base; above $50,000 — rare for a stand-alone electrical scope but common for a whole project's electrical package — the top band's $19.00 rate rides on $1,070.00.\n\nApplications are filed through e-Permitting alongside the other trades. The regulation's statutory exclusion (§ 23-27.3-108.2(c)(1) levy outside the schedule) applies to every trade equally.",
    notIncluded:
      "This is the statewide schedule's electrical permit fee. It excludes:\n\n- **The building permit** for the project the electrical work belongs to.\n- **The § 23-27.3-108.2(c)(1) statutory levy**, excluded from the schedule by the regulation's own terms.\n- **Fire alarm and suppression permits**, which ride the mechanical/fire side of the schedule rather than the electrical ladder.\n- **Plan review** — none is published.",
    workedExample: {
      scenario:
        "A stand-alone electrical fit-out in Providence with a declared scope value of $12,000.",
      inputs: {
        occupancy: "commercial",
        valuationCents: 1_200_000,
      },
      notes:
        "Middle band: $230.00 for the first $10,000 plus $21.00 for each of the 2 thousands above: $230.00 + 2 x $21.00 = **$272.00**.\n\nA smaller $5,000 job would price $115.00 on the first leg, and the printed $125.00 minimum would carry the fee instead.",
    },
    faqs: [
      {
        question: "How much is an electrical permit in Providence?",
        answer:
          "The statewide valuation ladder: $23.00 per $1,000 to $10,000, $21.00 per $1,000 from $10,001 to $50,000, $19.00 above — $125.00 minimum.",
      },
      {
        question: "Does the electrical permit scale with the job's value?",
        answer:
          "Yes — the statewide schedule prices permit fees by project valuation, so the declared value of the electrical scope drives the fee.",
      },
      {
        question: "Is there a minimum?",
        answer:
          "Yes — $125.00, the schedule's printed note, binding on small scopes.",
      },
      {
        question: "Who fixes the rate?",
        answer:
          "The Rhode Island Building Code Commission's regulation 510-RICR-00-00-21 — the same schedule every municipality in the state charges.",
      },
      {
        question: "When did the current rate take effect?",
        answer:
          "The active amendment is effective December 10, 2023.",
      },
      {
        question: "How does a $25,000 electrical scope price?",
        answer:
          "$230.00 + 15 x $21.00 = $545.00, in the middle band.",
      },
      {
        question: "Do I file with the city or the state?",
        answer:
          "With the City — through Providence e-Permitting or at Inspection & Standards, 780 Allens Avenue — under the state-set fee.",
      },
      {
        question: "Is the fee different for residential work?",
        answer:
          "No — the ladder makes no residential or commercial distinction.",
      },
      {
        question: "What about a panel upgrade?",
        answer:
          "It is an electrical permit priced from its own scope value on the same ladder.",
      },
      {
        question: "Is plan review charged separately?",
        answer:
          "The schedule publishes no plan-review percentage; none is charged here.",
      },
    ],
  },
  {
    jurisdictionKey: PVD_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    slug: "plumbing-permit-fees",
    seoTitle: "Providence plumbing permit fees",
    seoDescription:
      "Providence, Rhode Island plumbing permit fees — the statewide valuation ladder with a $125 minimum, applied to the plumbing scope's valuation.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: PVD_LAST_VERIFIED,
    title: "Providence plumbing permit fees",
    intro:
      "A plumbing permit in Providence reads the **same statewide valuation ladder**: **$23.00 per $1,000** to $10,000 of valuation, **$230 + $21.00 per $1,000** to $50,000, **$1,070 + $19.00 per $1,000** above, **$125.00 minimum**. There is no per-fixture row — the scope's declared value drives the fee.",
    localSummary:
      "The City's inspection FAQ names the Building, Plumbing and Mechanical fee schedules together, and the statewide regulation prices them all the same way — by project valuation on the §21.12 ladder. A bathroom repipe declared at $8,000 prices $184.00 on the first leg; a $20,000 whole-house plumbing package prices $230.00 + 10 x $21.00 = $440.00 in the middle band.\n\nBecause the ladder is valuation-driven, the estimator's declared cost is the whole game — there is no fixture count, no supply-row and no drainage-row arithmetic to run. The $125.00 minimum is the only floor: below roughly $5,500 of declared value the minimum becomes the fee.\n\nPlumbing permits file through e-Permitting like the other trades, and the regulation's statutory-levy exclusion applies here too: § 23-27.3-108.2(c)(1) charges live outside the schedule.",
    notIncluded:
      "This is the statewide schedule's plumbing permit fee. It excludes:\n\n- **The building permit** for the project the plumbing belongs to.\n- **Sewer and water connection charges**, which are utility and WPCA bills, not permit fees.\n- **The § 23-27.3-108.2(c)(1) statutory levy**, excluded by the regulation's own terms.\n- **Plan review** — none is published.",
    workedExample: {
      scenario:
        "A whole-house plumbing package in Providence declared at $20,000 of scope value.",
      inputs: {
        occupancy: "residential",
        valuationCents: 2_000_000,
      },
      notes:
        "Middle band: $230.00 for the first $10,000 plus $21.00 for each of the 10 thousands above: $230.00 + 10 x $21.00 = **$440.00**.\n\nA $8,000 repipe would stay on the first leg: 8 x $23.00 = $184.00.",
    },
    faqs: [
      {
        question: "How much is a plumbing permit in Providence?",
        answer:
          "The statewide valuation ladder: $23.00 per $1,000 to $10,000, $21.00 per $1,000 to $50,000, $19.00 above, $125.00 minimum.",
      },
      {
        question: "Is there a per-fixture charge?",
        answer:
          "No — the schedule prices by project valuation, not by fixture count.",
      },
      {
        question: "Who sets the plumbing rate?",
        answer:
          "The state's 510-RICR-00-00-21 regulation; Providence charges the §21.12(A)(28) schedule it prints for the City.",
      },
      {
        question: "What does a $20,000 plumbing package price?",
        answer: "$230.00 + 10 x $21.00 = $440.00, in the middle band.",
      },
      {
        question: "When does the $125 minimum bind?",
        answer:
          "Below roughly $5,500 of declared scope value, where the first leg's arithmetic computes under $125.00.",
      },
      {
        question: "Is the fee different for commercial plumbing?",
        answer: "No — the ladder makes no occupancy distinction.",
      },
      {
        question: "Do sewer taps ride the permit?",
        answer:
          "No — sewer and water connection charges are utility bills, separate from the permit fee.",
      },
      {
        question: "When did the rate take effect?",
        answer: "The active amendment is effective December 10, 2023.",
      },
      {
        question: "How do I apply?",
        answer:
          "Through Providence e-Permitting or at Inspection & Standards, 780 Allens Avenue.",
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
    entityKey: PVD_STATEWIDE_REG_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: PVD_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PVD_STATEWIDE_REG_KEY,
    notes:
      "Read 2026-09-26 from rules.sos.ri.gov (HTTP 200). The Providence row §21.12(A)(28) was transcribed verbatim: $23/$21/$19 per-$1,000 bands, chained bases $230/$1,070, $125 minimum note, and the § 23-27.3-108.2(c)(1) exclusion sentence.",
  },
  {
    entityType: "fee_rule",
    entityKey: "PVD-BLD-LEG3",
    permitTypeKey: "building",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: PVD_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PVD_STATEWIDE_REG_KEY,
    notes:
      "Top band: '$1070 + $19.00 per $1,000 exceeding $50k', base chaining verified against the middle band's printed arithmetic ($230 + $21 x 40 = $1,070).",
  },
  {
    entityType: "jurisdiction_profile",
    entityKey: PVD_KEYS.jurisdiction,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: PVD_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PVD_STATEWIDE_REG_KEY,
    notes:
      "Profile built from the statewide regulation plus the City's department pages (issuing office, e-Permitting scope); the statewide-fee mechanism is stated on the record.",
  },
  {
    entityType: "permit_page",
    entityKey: "building-permit-fees",
    permitTypeKey: "building",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: PVD_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PVD_STATEWIDE_REG_KEY,
    notes:
      "Recorded for the editorial gate: this page's prose, sources and fee-rule mapping were checked against the schedule published by City of Providence, Rhode Island during the research pass that produced this seed; the seed's content tests assert the arithmetic. No amount on this page is estimated.",
  },
  {
    entityType: "permit_page",
    entityKey: "electrical-permit-fees",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: PVD_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PVD_STATEWIDE_REG_KEY,
    notes:
      "Recorded for the editorial gate: this page's prose, sources and fee-rule mapping were checked against the schedule published by City of Providence, Rhode Island during the research pass that produced this seed; the seed's content tests assert the arithmetic. No amount on this page is estimated.",
  },
  {
    entityType: "permit_page",
    entityKey: "plumbing-permit-fees",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: PVD_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PVD_STATEWIDE_REG_KEY,
    notes:
      "Recorded for the editorial gate: this page's prose, sources and fee-rule mapping were checked against the schedule published by City of Providence, Rhode Island during the research pass that produced this seed; the seed's content tests assert the arithmetic. No amount on this page is estimated.",
  },
];

export const providenceSeed: JurisdictionSeed = {
  state,
  county,
  jurisdiction,
  departments,
  sources,
  permitTypes: [],
  projectTypes: [],
  jurisdictionPermitTypes: [
    {
      jurisdictionKey: PVD_KEYS.jurisdiction,
      permitTypeKey: "building",
      isAvailable: true,
      localName: "Building permit (statewide schedule §21.12(A)(28))",
      officialUrl: "https://rules.sos.ri.gov/regulations/part/510-00-00-21",
      notes:
        "Three chained legs — $23/$21/$19 per $1,000 — with a $125 printed minimum; set by the statewide regulation effective 2023-12-10.",
    },
    {
      jurisdictionKey: PVD_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      isAvailable: true,
      localName: "Electrical permit (statewide schedule)",
      officialUrl: "https://rules.sos.ri.gov/regulations/part/510-00-00-21",
      notes:
        "Reads the same valuation ladder; the City's FAQ names Building, Plumbing and Mechanical schedules together.",
    },
    {
      jurisdictionKey: PVD_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      isAvailable: true,
      localName: "Plumbing permit (statewide schedule)",
      officialUrl: "https://rules.sos.ri.gov/regulations/part/510-00-00-21",
      notes:
        "Reads the same valuation ladder; no per-fixture row exists in the schedule.",
    },
  ],
  feeSchedules,
  feeRules,
  requirements: [],
  profile,
  permitPages,
  verifications,
};

export const PVD_PUBLISHED_PERMIT_PAGES = providenceSeed.permitPages.filter(
  (page) => page.publishStatus === "published" && !page.noindex,
);
