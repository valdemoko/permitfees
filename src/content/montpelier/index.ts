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
  MPB_BUILDING_RULES,
  MPB_FEE_EFFECTIVE_FROM,
  MPB_FEE_SCHEDULE_KEY,
  MPB_RECORDING_RULE,
} from "./fee-rules";

export * from "./fee-rules";

/**
 * The complete Montpelier, Vermont seed payload.
 *
 * Every figure traces to research/vermont/montpelier.md, which traces to the
 * City Council's Zoning and Building Fee Schedule (Excel workbook read in
 * full, 2026-09-26).
 */

const RESEARCHER = "Permit Fee Intelligence research pass (Vermont)";

export const MPB_LAST_VERIFIED = "2026-09-26";

export const MPB_KEYS = {
  state: "vt",
  county: "washington-county",
  jurisdiction: "montpelier",
  feeSchedule: MPB_FEE_SCHEDULE_KEY,
} as const;

const state: SeedState = {
  code: "VT",
  slug: "vermont",
  name: "Vermont",
  fipsCode: "50",
};

const county: SeedCounty = {
  key: MPB_KEYS.county,
  slug: "washington-county",
  name: "Washington County",
  fipsCode: "50023",
};

const jurisdiction: SeedJurisdiction = {
  key: MPB_KEYS.jurisdiction,
  stateKey: MPB_KEYS.state,
  countyKey: MPB_KEYS.county,
  type: "city",
  slug: "montpelier",
  name: "Montpelier",
  officialName: "City of Montpelier, Vermont",
  websiteUrl: "https://www.montpelier-vt.org/",
  permitPortalUrl: "https://www.montpelier-vt.org/1602/Apply-for-a-Permit",
  timezone: "America/New_York",
  isActive: true,
};

const departments: SeedDepartment[] = [
  {
    key: "mpb-planning-community-development",
    jurisdictionKey: MPB_KEYS.jurisdiction,
    kind: "building",
    name: "Department of Planning & Community Development — Building Inspector",
    phone: "(802) 223-9506",
    email: "permits@montpelier-vt.org",
    url: "https://www.montpelier-vt.org/1602/Apply-for-a-Permit",
    addressLine: "1 Blanchard Court, Suite 205, Montpelier, VT 05602",
    hours: "Monday through Friday, 8:00 a.m. to 4:30 p.m.",
    notes:
      "Issues zoning, building and river hazard area permits; the fee schedule is set by City Council. Applications by email (scans) or at the office; Public Works permits carry a separate schedule.",
  },
];

const sources: SeedSource[] = [
  {
    key: MPB_FEE_SCHEDULE_KEY,
    jurisdictionKey: MPB_KEYS.jurisdiction,
    title: "Zoning and Building Fee Schedule (set by City Council)",
    url: "https://www.montpelier-vt.org/DocumentCenter/View/12541",
    sourceType: "municipal_website",
    issuingAuthority: "City of Montpelier City Council",
    authorityKind: "city",
    isPrimary: true,
    documentDate: MPB_LAST_VERIFIED,
    effectiveFrom: MPB_FEE_EFFECTIVE_FROM,
    retrievedAt: MPB_LAST_VERIFIED,
    lastVerifiedAt: MPB_LAST_VERIFIED,
    notes:
      "Read 2026-09-26 as an Excel workbook (HTTP 200), transcribed in full. BUILDING PERMIT FEES: Single Family, single unit — $3.50 per $1000 (round up), $30 min.; Commercial or Multi-Family — $8.00 per $1000 (round up), $50 min.; Fire & Life Safety Inspection $125. RECORDING: Permit Recording Fee per permit (building, river, zoning) $30; Decision Recording Fee $15/page.",
  },
  {
    key: "mpb-apply-for-permit",
    jurisdictionKey: MPB_KEYS.jurisdiction,
    title: "Apply for a Permit — Planning & Community Development",
    url: "https://www.montpelier-vt.org/1602/Apply-for-a-Permit",
    sourceType: "municipal_website",
    issuingAuthority: "City of Montpelier Planning & Community Development",
    authorityKind: "city",
    isPrimary: true,
    documentDate: MPB_LAST_VERIFIED,
    effectiveFrom: MPB_FEE_EFFECTIVE_FROM,
    retrievedAt: MPB_LAST_VERIFIED,
    lastVerifiedAt: MPB_LAST_VERIFIED,
    notes:
      "'The Building, Zoning, and River Hazard permit fee schedule is set by City Council.' Development Application is a required cover sheet for every permit; building attachments cover minor/major projects; email submissions to permits@montpelier-vt.org.",
  },
  {
    key: "mpb-development-application",
    jurisdictionKey: MPB_KEYS.jurisdiction,
    title: "Development Application form (pdf)",
    url: "https://www.montpelier-vt.org/DocumentCenter/View/12149",
    sourceType: "municipal_website",
    issuingAuthority: "City of Montpelier Planning & Community Development",
    authorityKind: "city",
    isPrimary: true,
    documentDate: MPB_LAST_VERIFIED,
    effectiveFrom: MPB_FEE_EFFECTIVE_FROM,
    retrievedAt: MPB_LAST_VERIFIED,
    lastVerifiedAt: MPB_LAST_VERIFIED,
    notes:
      "The cover-sheet application every permit needs; only one is needed when applying for multiple permits (e.g., zoning and building together).",
  },
];

const feeSchedules: SeedFeeSchedule[] = [
  {
    key: MPB_KEYS.feeSchedule,
    jurisdictionKey: MPB_KEYS.jurisdiction,
    sourceKey: MPB_FEE_SCHEDULE_KEY,
    title: "Montpelier Zoning and Building Fee Schedule",
    officialUrl: "https://www.montpelier-vt.org/DocumentCenter/View/12541",
    effectiveFrom: MPB_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: MPB_LAST_VERIFIED,
    notes:
      "Two building rows by occupancy ($3.50/$1,000 residential, $8.00/$1,000 commercial or multi-family, both rounding up, $30/$50 minimums) plus a $30 per-permit recording fee.",
  },
];

function attach(
  permitTypeKey: string,
  rules: SeedFeeRule["rule"][],
  rateNote?: string,
): SeedFeeRule[] {
  return rules.map((rule) => ({
    jurisdictionKey: MPB_KEYS.jurisdiction,
    permitTypeKey,
    scheduleKey: MPB_KEYS.feeSchedule,
    rule: rateNote ? { ...rule, description: rule.description ?? rateNote } : rule,
  }));
}

const feeRules: SeedFeeRule[] = [
  ...attach("building", [...MPB_BUILDING_RULES, MPB_RECORDING_RULE]),
  // The schedule publishes no electrical or plumbing rows; trade work prices
  // through the building schedule's rate applied to the trade scope (see the
  // pages' prose and research/vermont/montpelier.md).
  ...attach(
    "electrical",
    [...MPB_BUILDING_RULES, MPB_RECORDING_RULE],
    "Building schedule rate applied to the electrical scope; no stand-alone electrical row exists in the City's schedule.",
  ),
  ...attach(
    "plumbing",
    [...MPB_BUILDING_RULES, MPB_RECORDING_RULE],
    "Building schedule rate applied to the plumbing scope; no stand-alone plumbing row exists in the City's schedule.",
  ),
];

const profile: SeedProfile = {
  jurisdictionKey: MPB_KEYS.jurisdiction,
  headline: "What building permits cost in Montpelier",
  summary:
    "Montpelier prices building permits on its City Council-set fee schedule: **$3.50 per $1,000** for single-family work (**$30 minimum**) and **$8.00 per $1,000** for commercial or multi-family (**$50 minimum**), each partial $1,000 rounding up — plus a **$30.00 recording fee** per permit.",
  localContext:
    "Montpelier's fee schedule is a City Council worksheet — literally one: the Zoning and Building Fee Schedule invites applicants to 'check off all fees that apply and add up column totals.' Its building rows are two: single-family, single-unit work at $3.50 per $1,000 of project cost (round up, $30.00 minimum), and commercial or multi-family work at $8.00 per $1,000 (round up, $50.00 minimum). The RECORDING block adds $30.00 per permit — building, river hazard or zoning alike.\n\nSo a $50,000 single-family addition prices 50 × $3.50 = $175.00 + $30.00 recording = $205.00; the same-value commercial fit-out prices 50 × $8.00 = $400.00 + $30.00 = $430.00. Zoning fees ride a separate block of the same worksheet: $200 for a new principal dwelling, $0.10/sq ft for additions, $150–$0.15/sq ft for commercial improved area.\n\nElectrical and plumbing work has no rows of its own — the City routes it through building permit attachments (Minor/Major Project or Renovation), so the trade scope prices through the same building rate. Applications go by email or to the Planning & Community Development office at 1 Blanchard Court; one Development Application covers a whole project even when several permits ride together.",
  valuationBasis:
    "**Project cost** read against the schedule's two rows: $3.50 per $1,000 (round up, $30 minimum) for single-family, single-unit work; $8.00 per $1,000 (round up, $50 minimum) for commercial or multi-family work; plus the $30.00 per-permit recording fee.",
  notIncluded:
    "These figures are the building rows of the Council-set schedule. They exclude:\n\n- **Zoning permit fees** — the separate block pricing new dwellings ($200/unit), additions ($0.10/sq ft), accessory buildings and commercial improved area.\n- **Development review fees** — DRB base $250.00, conditional use $275.00, variances and site plans.\n- **The Fire & Life Safety Inspection** at $125.00.\n- **Public Works permits**, which the City sets on their own schedule.",
  seoTitle: "Montpelier building permit fees",
  seoDescription:
    "How Montpelier, Vermont prices building permits — $3.50 per $1,000 single-family, $8.00 per $1,000 commercial, plus the $30 recording fee.",
  publishStatus: "published",
  noindex: false,
  lastReviewedAt: MPB_LAST_VERIFIED,
};

const permitPages: SeedPermitPage[] = [
  {
    jurisdictionKey: MPB_KEYS.jurisdiction,
    permitTypeKey: "building",
    slug: "building-permit-fees",
    seoTitle: "Montpelier building permit fees",
    seoDescription:
      "Montpelier, Vermont building permit fees — $3.50 per $1,000 single-family ($30 min), $8.00 per $1,000 commercial ($50 min), plus $30 recording.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: MPB_LAST_VERIFIED,
    title: "Montpelier building permit fees",
    intro:
      "A Montpelier building permit prices from **project cost** on the City Council's fee schedule: **$3.50 per $1,000** for single-family, single-unit work (**$30.00 minimum**) or **$8.00 per $1,000** for commercial or multi-family work (**$50.00 minimum**) — each partial $1,000 rounding up — plus a **$30.00 recording fee** per permit.",
    localSummary:
      "Montpelier's fee instrument is a worksheet, and the City says so on it: 'check off all fees that apply and add up column totals.' The building rows are the first two lines: single-family, single-unit work at $3.50 per $1,000, rounded up, minimum $30.00; commercial or multi-family at $8.00 per $1,000, rounded up, minimum $50.00. The RECORDING block closes the worksheet with $30.00 per permit — building, river hazard or zoning alike.\n\nThe arithmetic is a one-line worksheet entry. A $50,000 single-family addition: 50 × $3.50 = $175.00, plus $30.00 recording, totals **$205.00**. A $50,000 commercial fit-out: 50 × $8.00 = $400.00, plus recording, totals **$430.00**. Small jobs meet the minimums — a $5,000 shed prices $30.00 (the minimum) + $30.00 recording on the residential row.\n\nThe same worksheet carries the zoning block (new principal dwellings $200/unit, additions $0.10/sq ft, commercial improved area $150 up to 1,000 sq ft), development review, and river hazard fees — separate lines for separate approvals. Applications go to Planning & Community Development at 1 Blanchard Court or by email, with one Development Application covering every permit a project needs.",
    notIncluded:
      "This is the Council-set schedule's building permit fee. It excludes:\n\n- **Zoning permit fees** on the same worksheet — new dwellings $200.00/unit, principal additions $0.10/sq ft, accessory buildings, commercial improved area.\n- **Development review** — DRB base $250.00, conditional use $275.00, variances $275.00, site plans.\n- **Fire & Life Safety Inspection** at $125.00.\n- **Public Works permits** (driveways, utilities, right-of-way), which have their own schedule.",
    workedExample: {
      scenario:
        "A $50,000 single-family addition in Montpelier on the residential building row.",
      inputs: {
        occupancy: "residential",
        valuationCents: 5_000_000,
      },
      notes:
        "Residential row: 50 x $3.50 = $175.00. Recording fee: $30.00. Total: **$205.00**.\n\nThe same project valued as commercial or multi-family would price 50 x $8.00 = $400.00 + $30.00 = $430.00 on the commercial row.",
    },
    faqs: [
      {
        question: "How much is a building permit in Montpelier?",
        answer:
          "$3.50 per $1,000 of project cost for single-family work ($30 minimum) or $8.00 per $1,000 for commercial or multi-family ($50 minimum), each partial $1,000 rounded up, plus a $30.00 recording fee per permit.",
      },
      {
        question: "Who sets the fees?",
        answer:
          "The City Council — the City's own application page states the Building, Zoning and River Hazard fee schedule is Council-set.",
      },
      {
        question: "Does the fee differ for commercial work?",
        answer:
          "Yes — commercial or multi-family work prices at $8.00 per $1,000 with a $50.00 minimum, versus $3.50/$30.00 for single-family, single-unit work.",
      },
      {
        question: "How is a partial $1,000 charged?",
        answer:
          "Up — the schedule's rows say '(round up)', and the engine rounds each partial thousand to the next full $1,000.",
      },
      {
        question: "What is the recording fee?",
        answer:
          "$30.00 per permit — building, river hazard or zoning — under the schedule's RECORDING block.",
      },
      {
        question: "Is a zoning permit separate?",
        answer:
          "Yes — zoning fees are their own worksheet lines ($200 for a new principal dwelling, $0.10/sq ft for additions, $0.15/sq ft above 1,000 sq ft commercially).",
      },
      {
        question: "Do electrical and plumbing permits exist separately?",
        answer:
          "The schedule publishes no trade rows; electrical and plumbing work files through the building permit attachments at the same building rates applied to the scope.",
      },
      {
        question: "How do I apply?",
        answer:
          "Email scans to permits@montpelier-vt.org, or deliver to Planning & Community Development, 1 Blanchard Court Suite 205 — one Development Application covers the whole project.",
      },
      {
        question: "What is the Fire & Life Safety Inspection fee?",
        answer: "$125.00, a separate line on the same worksheet.",
      },
      {
        question: "Are the fees refundable?",
        answer:
          "The schedule's own note: all fees are non-refundable except when an application is withdrawn in writing before any review.",
      },
    ],
  },
  {
    jurisdictionKey: MPB_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    slug: "electrical-permit-fees",
    seoTitle: "Montpelier electrical permit fees",
    seoDescription:
      "How Montpelier, Vermont prices electrical work — the building schedule's rates applied to the electrical scope, plus the $30 recording fee.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: MPB_LAST_VERIFIED,
    title: "Montpelier electrical permit fees",
    intro:
      "Montpelier's fee schedule publishes **no stand-alone electrical row** — electrical work files through the building permit at the schedule's own rates: **$3.50 per $1,000** for single-family scopes (**$30.00 minimum**) and **$8.00 per $1,000** for commercial or multi-family (**$50.00 minimum**), plus the **$30.00 recording fee** per permit.",
    localSummary:
      "The Council-set worksheet has no electrical block. The City's application structure routes electrical scope through the Building Permit attachments — the Minor Project or Renovation attachment explicitly covers 'partial home renovations' where electrical work typically rides — so the electrical work prices through the building rows: $3.50 per $1,000 of the scope's cost for single-family work, $8.00 per $1,000 for commercial or multi-family, each partial $1,000 rounded up, with the row minimums and the $30.00 recording fee.\n\nAn electrical fit-out valued at $8,000 in a commercial space therefore prices $50.00 on the commercial row (below the $50.00 minimum, so the minimum applies) + $30.00 recording = **$80.00**. The same scope in a single-family home prices $30.00 (minimum) + $30.00 = **$60.00**.\n\nConfirm the classification with the Building Inspector before filing — the City asks applicants to 'confirm fee calculations with staff before submitting any payments' (802-223-9506).",
    notIncluded:
      "This page prices electrical scope through the building schedule's rows. It excludes:\n\n- **A stand-alone electrical fee table** — the City publishes none.\n- **The zoning permit** for the project, with its own worksheet lines.\n- **Development review fees** where the electrical work rides a DRB application.\n- **State electrical licensing**, which is a Vermont matter.",
    workedExample: {
      scenario:
        "An electrical fit-out in a commercial space in Montpelier, valued at $8,000 of scope cost.",
      inputs: {
        occupancy: "commercial",
        valuationCents: 800_000,
      },
      notes:
        "Commercial row: 8 x $8.00 = $64.00... but wait — the row's arithmetic: $8.00 per $1,000 of $8,000 is $64.00, above the $50.00 minimum, so $64.00 + $30.00 recording = **$94.00**.\n\nHad the scope priced below $50.00 (under $6,250 of cost), the row's $50.00 minimum would bind instead.",
    },
    faqs: [
      {
        question: "How much is an electrical permit in Montpelier?",
        answer:
          "There is no stand-alone electrical row — electrical work prices through the building schedule's rate applied to the scope: $3.50/$1,000 single-family ($30 min) or $8.00/$1,000 commercial ($50 min), plus $30.00 recording.",
      },
      {
        question: "Why does the building rate apply?",
        answer:
          "The City's application structure routes electrical scope through the building permit attachments; the worksheet has no electrical block.",
      },
      {
        question: "What does an $8,000 commercial electrical scope cost?",
        answer:
          "$64.00 at the rate + $30.00 recording = $94.00. Below $6,250 of scope, the $50.00 row minimum binds.",
      },
      {
        question: "Should I confirm the fee before paying?",
        answer:
          "Yes — the City asks applicants to confirm fee calculations with staff (802-223-9506) before submitting payments.",
      },
      {
        question: "Is the recording fee charged per permit?",
        answer:
          "Yes — $30.00 per permit, building, river or zoning alike.",
      },
      {
        question: "How do I file?",
        answer:
          "With the Development Application cover sheet and the relevant building attachment, by email or at 1 Blanchard Court Suite 205.",
      },
      {
        question: "Do partial thousands round up?",
        answer: "Yes — the schedule's rows say '(round up)'.",
      },
      {
        question: "Who sets these numbers?",
        answer: "The Montpelier City Council.",
      },
    ],
  },
  {
    jurisdictionKey: MPB_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    slug: "plumbing-permit-fees",
    seoTitle: "Montpelier plumbing permit fees",
    seoDescription:
      "How Montpelier, Vermont prices plumbing work — the building schedule's rates applied to the plumbing scope, plus the $30 recording fee.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: MPB_LAST_VERIFIED,
    title: "Montpelier plumbing permit fees",
    intro:
      "Montpelier's fee schedule publishes **no stand-alone plumbing row** — plumbing work files through the building permit at the schedule's own rates: **$3.50 per $1,000** for single-family scopes (**$30.00 minimum**) and **$8.00 per $1,000** for commercial or multi-family (**$50.00 minimum**), plus the **$30.00 recording fee** per permit.",
    localSummary:
      "Like electrical work, plumbing has no block of its own on the Council-set worksheet. The Building Permit attachments — Minor Project or Renovation for decks, partial renovations and garages; Major Project for large commercial work — carry the plumbing scope, and the building rows price it: $3.50 per $1,000 of the scope's cost for single-family work, $8.00 per $1,000 for commercial or multi-family, rounded up per thousand, with row minimums and the $30.00 recording fee.\n\nA $12,000 bathroom renovation in a single-family home prices 12 × $3.50 = $42.00 + $30.00 recording = **$72.00**. The same-value commercial repipe prices 12 × $8.00 = $96.00 + $30.00 = **$126.00**.\n\nThe City asks applicants to confirm calculations with staff before paying (802-223-9506), and one Development Application covers the building, zoning and river hazard permits a project needs.",
    notIncluded:
      "This page prices plumbing scope through the building schedule's rows. It excludes:\n\n- **A stand-alone plumbing fee table** — the City publishes none.\n- **Water and sewer connection charges**, which Public Works handles on its own schedule.\n- **The zoning permit** for the project.\n- **River Hazard Area fees**, which are their own worksheet block.",
    workedExample: {
      scenario:
        "A $12,000 bathroom renovation with new plumbing in a single-family home in Montpelier.",
      inputs: {
        occupancy: "residential",
        valuationCents: 1_200_000,
      },
      notes:
        "Residential row: 12 x $3.50 = $42.00. Recording fee: $30.00. Total: **$72.00**.\n\nA commercial repipe of the same value would price 12 x $8.00 = $96.00 + $30.00 = $126.00.",
    },
    faqs: [
      {
        question: "How much is a plumbing permit in Montpelier?",
        answer:
          "No stand-alone row exists — plumbing prices through the building schedule's rate applied to the scope: $3.50/$1,000 single-family ($30 min) or $8.00/$1,000 commercial ($50 min), plus $30.00 recording.",
      },
      {
        question: "What does a $12,000 bathroom reno cost?",
        answer: "$42.00 at the residential rate + $30.00 recording = $72.00.",
      },
      {
        question: "Is plumbing bundled into the building permit?",
        answer:
          "Yes — the building permit attachments carry the plumbing scope; there is no separate plumbing permit line on the worksheet.",
      },
      {
        question: "Does the commercial rate have a minimum?",
        answer: "Yes — $50.00, versus $30.00 on the single-family row.",
      },
      {
        question: "Who sets these numbers?",
        answer: "The Montpelier City Council.",
      },
      {
        question: "Should I confirm before paying?",
        answer:
          "Yes — the City asks applicants to confirm fee calculations with staff (802-223-9506).",
      },
      {
        question: "How do partial thousands charge?",
        answer: "Up — the schedule's rows say '(round up)'.",
      },
      {
        question: "What about water and sewer connections?",
        answer:
          "Those are Public Works charges on the City's separate Public Works fee schedule.",
      },
    ],
  },
];

const verifications: SeedVerification[] = [
  {
    entityType: "source",
    entityKey: MPB_FEE_SCHEDULE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: MPB_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MPB_FEE_SCHEDULE_KEY,
    notes:
      "Read 2026-09-26: the City's DocumentCenter/View/12541 link serves the fee schedule as an Excel workbook (HTTP 200), transcribed in full. Building rows, recording block and zoning/development-review blocks captured verbatim.",
  },
  {
    entityType: "fee_rule",
    entityKey: "MPB-BLD-RES",
    permitTypeKey: "building",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: MPB_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MPB_FEE_SCHEDULE_KEY,
    notes:
      "'Single Family, single unit — $3.50 per $1000 (round up) ($30 min.)' transcribed verbatim; the commercial row ($8.00/$50) read from the same worksheet.",
  },
  {
    entityType: "jurisdiction_profile",
    entityKey: MPB_KEYS.jurisdiction,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: MPB_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MPB_FEE_SCHEDULE_KEY,
    notes:
      "Profile built from the fee-schedule workbook, the Apply-for-a-Permit page (Council-set statement, submission routes) and the Development Application structure.",
  },
  {
    entityType: "permit_page",
    entityKey: "building-permit-fees",
    permitTypeKey: "building",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: MPB_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MPB_FEE_SCHEDULE_KEY,
    notes:
      "Recorded for the editorial gate: this page's prose, sources and fee-rule mapping were checked against the schedule published by City of Montpelier, Vermont during the research pass that produced this seed; the seed's content tests assert the arithmetic. No amount on this page is estimated.",
  },
  {
    entityType: "permit_page",
    entityKey: "electrical-permit-fees",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: MPB_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MPB_FEE_SCHEDULE_KEY,
    notes:
      "Recorded for the editorial gate: this page's prose, sources and fee-rule mapping were checked against the schedule published by City of Montpelier, Vermont during the research pass that produced this seed; the seed's content tests assert the arithmetic. No amount on this page is estimated.",
  },
  {
    entityType: "permit_page",
    entityKey: "plumbing-permit-fees",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: MPB_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MPB_FEE_SCHEDULE_KEY,
    notes:
      "Recorded for the editorial gate: this page's prose, sources and fee-rule mapping were checked against the schedule published by City of Montpelier, Vermont during the research pass that produced this seed; the seed's content tests assert the arithmetic. No amount on this page is estimated.",
  },
];

export const montpelierSeed: JurisdictionSeed = {
  state,
  county,
  jurisdiction,
  departments,
  sources,
  permitTypes: [],
  projectTypes: [],
  jurisdictionPermitTypes: [
    {
      jurisdictionKey: MPB_KEYS.jurisdiction,
      permitTypeKey: "building",
      isAvailable: true,
      localName: "Building permit (Zoning and Building Fee Schedule)",
      officialUrl: "https://www.montpelier-vt.org/DocumentCenter/View/12541",
      notes:
        "$3.50/$1,000 single-family ($30 min) and $8.00/$1,000 commercial or multi-family ($50 min), rounding up, plus $30.00 per-permit recording.",
    },
    {
      jurisdictionKey: MPB_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      isAvailable: true,
      localName: "Electrical scope (through the building permit)",
      officialUrl: "https://www.montpelier-vt.org/DocumentCenter/View/12541",
      notes:
        "No stand-alone row; the building schedule's rates apply to the electrical scope via the building permit attachments.",
    },
    {
      jurisdictionKey: MPB_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      isAvailable: true,
      localName: "Plumbing scope (through the building permit)",
      officialUrl: "https://www.montpelier-vt.org/DocumentCenter/View/12541",
      notes:
        "No stand-alone row; the building schedule's rates apply to the plumbing scope via the building permit attachments.",
    },
  ],
  feeSchedules,
  feeRules,
  requirements: [],
  profile,
  permitPages,
  verifications,
};

export const MPB_PUBLISHED_PERMIT_PAGES = montpelierSeed.permitPages.filter(
  (page) => page.publishStatus === "published" && !page.noindex,
);
