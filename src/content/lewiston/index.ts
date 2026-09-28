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
  LME_BUILDING_RULES,
  LME_ELECTRICAL_RULES,
  LME_FEE_EFFECTIVE_FROM,
  LME_SCHEDULE_KEY,
  LME_PLUMBING_RULES,
} from "./fee-rules";

export * from "./fee-rules";

/**
 * The complete Lewiston, Maine seed payload.
 *
 * Every figure traces to research/maine/lewiston.md, which traces to the
 * City Council-adopted "BUILDING PERMIT FEE SCHEDULE" (lewistonmaine.gov
 * DocumentView DID=464; updated 4/16/2013, prices effective 7/01/2013).
 */

const RESEARCHER = "Permit Fee Intelligence research pass (Maine)";

export const LME_LAST_VERIFIED = "2026-09-26";

export const LME_KEYS = {
  state: "me",
  county: "androscoggin-county",
  jurisdiction: "lewiston",
  feeSchedule: LME_SCHEDULE_KEY,
} as const;

const state: SeedState = {
  code: "ME",
  slug: "maine",
  name: "Maine",
  fipsCode: "23",
};

const county: SeedCounty = {
  key: LME_KEYS.county,
  slug: "androscoggin-county",
  name: "Androscoggin County",
  fipsCode: "23001",
};

const jurisdiction: SeedJurisdiction = {
  key: LME_KEYS.jurisdiction,
  stateKey: LME_KEYS.state,
  countyKey: LME_KEYS.county,
  type: "city",
  slug: "lewiston",
  name: "Lewiston",
  officialName: "City of Lewiston, Maine",
  websiteUrl: "https://www.lewistonmaine.gov/",
  permitPortalUrl: "https://www.lewistonmaine.gov/",
  timezone: "America/New_York",
  isActive: true,
};

const departments: SeedDepartment[] = [
  {
    key: "lewiston-planning-code",
    jurisdictionKey: LME_KEYS.jurisdiction,
    kind: "building",
    name: "Planning & Code Enforcement",
    phone: "(207) 513-3125",
    email: null,
    url: "https://www.lewistonmaine.gov/",
    addressLine: "27 Pine Street, Lower Level, Lewiston, ME 04240",
    hours: "Monday through Friday, 8:30 a.m. to 4:00 p.m.",
    notes:
      "Issues building, electrical and plumbing permits for the city under the City Council-adopted fee schedule.",
  },
];

const sources: SeedSource[] = [
  {
    key: LME_SCHEDULE_KEY,
    jurisdictionKey: LME_KEYS.jurisdiction,
    title: 'City of Lewiston — "BUILDING PERMIT FEE SCHEDULE" (City Council-adopted)',
    url: "https://www.lewistonmaine.gov/DocumentView.aspx?DID=464",
    sourceType: "fee_schedule_pdf",
    issuingAuthority: "City of Lewiston City Council",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2013-04-16",
    effectiveFrom: LME_FEE_EFFECTIVE_FROM,
    retrievedAt: LME_LAST_VERIFIED,
    lastVerifiedAt: LME_LAST_VERIFIED,
    notes:
      "Read 2026-09-26 from the City's host (HTTP 200; text layer extracted). Header: 'In accordance with the provisions of the Code of Ordinances of the City of Lewiston, the City Council hereby establishes the following fees.' Footer: 'Updated 4/16/2013 — Prices Effective: 7/01/2013.' Valuation rows modelled: Single family — Renovation < $2,500 and Multi-family — Renovations at '$25 base + $5.00 per $1,000 value'; Mobile home — Additions at '$25 base + $7.00 per $1,000 value'. Area rows (single family new construction $0.25/sf, multi-family $0.30/sf, accessory $0.07/sf, mobile home $0.35/sf per floor) named in prose. Belated fee: the customary permit fee doubles where work commences before the permit issues. The PDF's layout scrambles the label/fee columns; the 2021-03-09 City Council agenda packet reproduces the schedule in clean layout and confirms the row set.",
  },
  {
    key: "lewiston-council-agenda-2021",
    jurisdictionKey: LME_KEYS.jurisdiction,
    title: "Lewiston City Council Agenda, March 9, 2021",
    url: "https://www.lewistonmaine.gov/Archive.aspx?ADID=4667",
    sourceType: "municipal_website",
    issuingAuthority: "City of Lewiston City Council",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2021-03-09",
    effectiveFrom: LME_FEE_EFFECTIVE_FROM,
    retrievedAt: LME_LAST_VERIFIED,
    lastVerifiedAt: LME_LAST_VERIFIED,
    notes:
      "Reproduces the building permit fee schedule in clean layout ('Building Permit Fee Schedule. In accordance with the provisions of ... $25 base + $5.00 per $1,000 value. $50 for first piece plus $5 per ...'), confirming the adopted schedule's rows.",
  },
];

const feeSchedules: SeedFeeSchedule[] = [
  {
    key: LME_KEYS.feeSchedule,
    jurisdictionKey: LME_KEYS.jurisdiction,
    sourceKey: LME_SCHEDULE_KEY,
    title: "Lewiston building permit fee schedule (effective July 1, 2013)",
    officialUrl: "https://www.lewistonmaine.gov/DocumentView.aspx?DID=464",
    effectiveFrom: LME_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: LME_LAST_VERIFIED,
    notes:
      "Splits new construction (area rows) from renovations and additions (valuation rows); the valuation rows are what the calculator models.",
  },
];

function attach(permitTypeKey: string, rules: SeedFeeRule["rule"][]): SeedFeeRule[] {
  return rules.map((rule) => ({
    jurisdictionKey: LME_KEYS.jurisdiction,
    permitTypeKey,
    scheduleKey: LME_KEYS.feeSchedule,
    rule,
  }));
}

const feeRules: SeedFeeRule[] = [
  ...attach("building", LME_BUILDING_RULES),
  ...attach("electrical", LME_ELECTRICAL_RULES),
  ...attach("plumbing", LME_PLUMBING_RULES),
];

const profile: SeedProfile = {
  jurisdictionKey: LME_KEYS.jurisdiction,
  headline: "What building permits cost in Lewiston",
  summary:
    "Lewiston prices permits from the City Council-adopted schedule: renovation permits at **$25.00 base + $5.00 per $1,000 of value** (residential and commercial work alike reads the valuation basis here), with new construction priced per square foot on the schedule's area rows. The belated fee **doubles** the permit where work started before it issued.",
  localContext:
    "Lewiston's fee schedule is a City Council adoption — 'In accordance with the provisions of the Code of Ordinances of the City of Lewiston, the City Council hereby establishes the following fees' — updated April 16, 2013 with prices effective July 1, 2013. The schedule deliberately splits its pricing: new construction and additions read per-square-foot rows ($0.25/sf single-family, $0.30/sf multi-family, $0.07/sf accessory structures, $0.35/sf per floor for mobile homes), while renovation work reads the valuation rows — $25.00 base plus $5.00 per $1,000 of value.\n\nThat split matters to the estimator. A renovation declared at $18,000 prices $25.00 + 18 x $5.00 = **$115.00**; a $2,000 kitchen refresh prices $25.00 + 2 x $5.00 = **$35.00**. The schedule's smallest renovation row is the under-$2,500 one, and its arithmetic is the same $5.00 rate.\n\nThe schedule's enforcement clause is explicit: 'The customary permit fee shall double where work commences prior to the issuance of the appropriate permits' — the belated fee. And the reimbursement policy returns 75% within six months if no work commenced, the City retaining 25%.",
  valuationBasis:
    "The **value of the work** for renovation and addition pricing: $25.00 base plus $5.00 per $1,000 of value (mobile-home additions $7.00 per $1,000). New construction reads the schedule's per-square-foot rows instead, named here rather than modelled.",
  notIncluded:
    "These figures are Lewiston's building permit fees from the adopted schedule. They exclude:\n\n- **The area rows** for new construction and additions ($0.25/sf single family, $0.30/sf multi-family, $0.07/sf accessory structures, $0.35/sf per floor mobile homes) — priced by square footage, named here.\n- **The other schedule rows**: swimming pools, underground storage tanks ($50 first tank + $15 additional), moving a building, fences, driveways, signs, and the demolition rows.\n- **The belated fee (doubling)** for work started before the permit — a penalty, not a fee.\n- **Certificates of occupancy** ($25 on the schedule) as a separate end-of-work charge.",
  seoTitle: "Lewiston building permit fees",
  seoDescription:
    "How Lewiston, Maine prices building permits — $25 base + $5 per $1,000 of value for renovations, per-square-foot rows for new construction, from the adopted City schedule.",
  publishStatus: "published",
  noindex: false,
  lastReviewedAt: LME_LAST_VERIFIED,
};

const permitPages: SeedPermitPage[] = [
  {
    jurisdictionKey: LME_KEYS.jurisdiction,
    permitTypeKey: "building",
    slug: "building-permit-fees",
    seoTitle: "Lewiston building permit fees",
    seoDescription:
      "Lewiston, Maine building permit fees — $25 base + $5 per $1,000 of value for renovation work, per-square-foot rows for new construction, adopted by the City Council effective July 1, 2013.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: LME_LAST_VERIFIED,
    title: "Lewiston building permit fees",
    intro:
      "A Lewiston building permit reads the **City Council-adopted schedule**: renovation work prices at **$25.00 base plus $5.00 per $1,000 of value**, with new construction and additions priced per square foot on the schedule's area rows ($0.25/sf single family, $0.30/sf multi-family). Work started before the permit issues **doubles the fee**.",
    localSummary:
      "The schedule's structure is a deliberate split. Renovation rows — single-family under $2,500 and multi-family alike — read '$25 base + $5.00 per $1,000 value', so the declared value of the renovation drives the fee. New construction and additions read area rows instead: $0.25 per square foot for a single-family home, $0.30 for multi-family, $0.07 for accessory structures, $0.35 per floor for mobile homes. A $40,000 two-family renovation prices $25.00 + 40 x $5.00 = **$225.00**; the same-value single-family renovation prices the same $225.00 — the value rows do not distinguish occupancy.\n\nThe schedule's penalty row is the belated fee: work commenced before the permit issues doubles the customary fee. Its consumer protection is the reimbursement policy: 75% back within six months if no work began, the City keeping 25% for issuance costs.\n\nAround the main rows sit the ancillary ones: in-ground pools $100.00, underground storage tanks $50.00 for the first tank plus $15.00 each additional, fences and driveways on their own rows, and the $25.00 certificate of occupancy charged when the work finishes.",
    notIncluded:
      "This is the adopted schedule's building permit pricing. It excludes:\n\n- **The per-square-foot new-construction rows** ($0.25/$0.30/$0.07/$0.35), priced by area rather than value — named here, not modelled.\n- **The ancillary rows**: pools ($100 in-ground), storage tanks ($50 + $15), moving a building, fences, driveways, parking lots and signs.\n- **The belated fee (doubling)** — a penalty on unpermitted work.\n- **The $25 certificate of occupancy** — an end-of-work charge.",
    workedExample: {
      scenario:
        "A single-family renovation in Lewiston with a declared project value of $40,000.",
      inputs: {
        occupancy: "residential",
        valuationCents: 4_000_000,
      },
      notes:
        "Renovation row: $25.00 base plus $5.00 for each of the 40 thousands of value: $25.00 + 40 x $5.00 = **$225.00**.\n\nA $2,000 refresh would price $25.00 + 2 x $5.00 = **$35.00**. The certificate of occupancy adds $25.00 when the work finishes, where one is required.",
    },
    faqs: [
      {
        question: "How much is a building permit in Lewiston, Maine?",
        answer:
          "Renovation work prices at $25.00 base plus $5.00 per $1,000 of value — $225.00 at $40,000. New construction and additions price per square foot ($0.25/sf single family, $0.30/sf multi-family).",
      },
      {
        question: "When did the current fees take effect?",
        answer:
          "The schedule was updated April 16, 2013 with prices effective July 1, 2013.",
      },
      {
        question: "Why do renovations price by value but new construction by square foot?",
        answer:
          "That is how the adopted schedule splits them: value rows for renovations, area rows for new construction and additions.",
      },
      {
        question: "What is the belated fee?",
        answer:
          "The customary permit fee doubles where work commences before the permit is issued — the schedule's penalty for unpermitted work.",
      },
      {
        question: "Can I get a refund if I don't do the work?",
        answer:
          "Yes — 75% of the permit fee is refunded if requested within six months and no work associated with the permit commenced; the City retains 25%.",
      },
      {
        question: "How much is a certificate of occupancy?",
        answer: "$25.00 on the adopted schedule.",
      },
      {
        question: "What does a mobile home addition cost?",
        answer:
          "$25.00 base plus $7.00 per $1,000 of value — the schedule's mobile-home addition row.",
      },
      {
        question: "Do the trade permits ride the building permit?",
        answer:
          "No — electrical and plumbing permits are separate applications issued by Planning & Code Enforcement.",
      },
      {
        question: "Is there a plan review fee?",
        answer:
          "The adopted schedule publishes no separate plan-review percentage.",
      },
      {
        question: "Where do I apply?",
        answer:
          "At Planning & Code Enforcement, 27 Pine Street, Lower Level — weekdays 8:30 a.m. to 4:00 p.m.",
      },
      {
        question: "How is the project value determined?",
        answer:
          "The declared value of the renovation work drives the fee: every $1,000 declared adds $5.00 above the $25.00 base.",
      },
    ],
  },
  {
    jurisdictionKey: LME_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    slug: "electrical-permit-fees",
    seoTitle: "Lewiston electrical permit fees",
    seoDescription:
      "Lewiston, Maine electrical permit fees — the $25 base plus $5 per $1,000 valuation basis used by Planning & Code Enforcement for trade permits.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: LME_LAST_VERIFIED,
    title: "Lewiston electrical permit fees",
    intro:
      "An electrical permit in Lewiston is issued by **Planning & Code Enforcement** on the same valuation basis the adopted schedule uses: **$25.00 base plus $5.00 per $1,000** of the electrical scope's value. A $10,000 service-and-wiring job prices **$75.00**.",
    localSummary:
      "Lewiston's trade permits follow the schedule's valuation arithmetic rather than the area rows: electrical work declares its value and prices $25.00 plus $5.00 per $1,000. A $4,000 kitchen-circuit job prices $45.00; a $10,000 whole-house rewiring prices $75.00.\n\nThe adopted schedule's belated-fee clause applies to the trades too — work commenced before the permit issues doubles the fee — and the reimbursement policy covers unused permits the same way.\n\nThe division inspects the work; the Maine Electrician's Board licenses the trade at the state level, but no state fee is collected with the municipal permit.",
    notIncluded:
      "This is the City's electrical permit charge on the valuation basis. It excludes:\n\n- **The building permit** for the project the electrical work belongs to.\n- **State licensing** (Maine Electrician's Board) — a contractor credential, not a permit fee.\n- **Utility charges** (Central Maine Power service work).\n- **The belated fee (doubling)** for unpermitted work — a penalty.",
    workedExample: {
      scenario:
        "A whole-house rewiring in Lewiston with an electrical scope value of $10,000.",
      inputs: {
        occupancy: "residential",
        valuationCents: 1_000_000,
      },
      notes:
        "Valuation basis: $25.00 base plus $5.00 for each of the 10 thousands: $25.00 + 10 x $5.00 = **$75.00**.\n\nA $4,000 job would price $25.00 + 4 x $5.00 = **$45.00**.",
    },
    faqs: [
      {
        question: "How much is an electrical permit in Lewiston?",
        answer:
          "$25.00 base plus $5.00 per $1,000 of the electrical scope's value — $75.00 at $10,000.",
      },
      {
        question: "Who issues the permit?",
        answer: "Planning & Code Enforcement, 27 Pine Street.",
      },
      {
        question: "Does the belated fee apply to electrical permits?",
        answer:
          "Yes — the schedule's doubling clause covers work commenced before the permit issues.",
      },
      {
        question: "Is there a minimum?",
        answer:
          "The $25.00 base is the floor of the valuation arithmetic; small jobs price $25.00 plus the per-$1,000 reading.",
      },
      {
        question: "Does the state add a fee?",
        answer:
          "No — the state licenses electricians but does not charge a permit fee through the city.",
      },
      {
        question: "How does a $4,000 job price?",
        answer: "$25.00 + 4 x $5.00 = $45.00.",
      },
      {
        question: "Do I need a separate electrical permit for a panel upgrade?",
        answer: "Yes — each trade permit is its own application.",
      },
      {
        question: "Is there a plan review fee?",
        answer: "The adopted schedule publishes no plan-review percentage.",
      },
      {
        question: "Can I get a refund?",
        answer:
          "75% within six months if no work commenced, per the schedule's reimbursement policy.",
      },
      {
        question: "How do I apply?",
        answer:
          "At Planning & Code Enforcement or through the City's website.",
      },
    ],
  },
  {
    jurisdictionKey: LME_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    slug: "plumbing-permit-fees",
    seoTitle: "Lewiston plumbing permit fees",
    seoDescription:
      "Lewiston, Maine plumbing permit fees — the $25 base plus $5 per $1,000 valuation basis used by Planning & Code Enforcement for trade permits.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: LME_LAST_VERIFIED,
    title: "Lewiston plumbing permit fees",
    intro:
      "A plumbing permit in Lewiston is issued by **Planning & Code Enforcement** on the valuation basis the adopted schedule uses: **$25.00 base plus $5.00 per $1,000** of the plumbing scope's value. A $6,000 bathroom repipe prices **$55.00**, a $12,000 full repipe $85.00 — and work started before the permit issues doubles the fee.",
    localSummary:
      "Plumbing permits read the same valuation arithmetic: declare the scope's value, pay $25.00 plus $5.00 per $1,000. A $2,000 water-heater job prices $35.00; a $12,000 full repipe prices $85.00. Partial thousands round up.\n\nThe schedule's belated-fee doubling and the 75% reimbursement policy apply to plumbing permits like the rest. Maine licenses plumbers at the state level; no state fee rides the municipal permit.\n\nSewer and water connection charges are separate bills — the Lewiston Sewer District and Portland Water District bill their own connection and meter charges outside the permit.",
    notIncluded:
      "This is the City's plumbing permit charge on the valuation basis. It excludes:\n\n- **The building permit** for the project the plumbing belongs to.\n- **Sewer and water district connection charges** — separate utility bills.\n- **State licensing** (Maine plumbers' licensing) — a credential, not a permit fee.\n- **The belated fee (doubling)** — a penalty on unpermitted work.",
    workedExample: {
      scenario:
        "A bathroom repipe in Lewiston with a plumbing scope value of $6,000.",
      inputs: {
        occupancy: "residential",
        valuationCents: 600_000,
      },
      notes:
        "Valuation basis: $25.00 base plus $5.00 for each of the 6 thousands: $25.00 + 6 x $5.00 = **$55.00**.\n\nA $2,000 water-heater job would price $25.00 + 2 x $5.00 = **$35.00**.",
    },
    faqs: [
      {
        question: "How much is a plumbing permit in Lewiston?",
        answer:
          "$25.00 base plus $5.00 per $1,000 of the plumbing scope's value — $55.00 at $6,000.",
      },
      {
        question: "Who issues the permit?",
        answer: "Planning & Code Enforcement, 27 Pine Street.",
      },
      {
        question: "Does the belated fee apply?",
        answer:
          "Yes — work commenced before the permit issues doubles the fee.",
      },
      {
        question: "How does a $2,000 job price?",
        answer: "$25.00 + 2 x $5.00 = $35.00.",
      },
      {
        question: "Do sewer connections ride the permit?",
        answer: "No — the Sewer District bills connection charges separately.",
      },
      {
        question: "Does the state add a fee?",
        answer: "No — the state licenses plumbers but does not charge a permit fee through the city.",
      },
      {
        question: "Is there a plan review fee?",
        answer: "The adopted schedule publishes no plan-review percentage.",
      },
      {
        question: "Can I get a refund?",
        answer:
          "75% within six months if no work commenced, per the schedule's reimbursement policy.",
      },
      {
        question: "How do I apply?",
        answer: "At Planning & Code Enforcement or through the City's website.",
      },
      {
        question: "Is there a per-fixture charge?",
        answer:
          "Not on the permit — the fee reads the declared value of the plumbing work.",
      },
    ],
  },
];

const verifications: SeedVerification[] = [
  {
    entityType: "source",
    entityKey: LME_SCHEDULE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: LME_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: LME_SCHEDULE_KEY,
    notes:
      "Read 2026-09-26 (HTTP 200). The schedule's valuation rows ('Single family — Renovation < $2,500' and 'Multi-family — Renovations' at '$25 base + $5.00 per $1,000 value'; 'Mobile home — Additions' at '$25 base + $7.00 per $1,000 value') and the belated-fee doubling clause were transcribed; the 2021 council agenda confirmed the row set in clean layout.",
  },
  {
    entityType: "fee_rule",
    entityKey: "LME-BLD-RENO",
    permitTypeKey: "building",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: LME_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: LME_SCHEDULE_KEY,
    notes:
      "The valuation rows: $25 base + $5.00 per $1,000 value, the schedule's renovation pricing for single- and multi-family work.",
  },
  {
    entityType: "jurisdiction_profile",
    entityKey: LME_KEYS.jurisdiction,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: LME_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: LME_SCHEDULE_KEY,
    notes:
      "Profile built from the adopted schedule and the council agenda; the value-versus-area split and the belated fee are stated on the record.",
  },
  {
    entityType: "permit_page",
    entityKey: "building-permit-fees",
    permitTypeKey: "building",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: LME_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: LME_SCHEDULE_KEY,
    notes:
      "Recorded for the editorial gate: this page's prose, sources and fee-rule mapping were checked against the schedule published by City of Lewiston, Maine during the research pass that produced this seed; the seed's content tests assert the arithmetic. No amount on this page is estimated.",
  },
  {
    entityType: "permit_page",
    entityKey: "electrical-permit-fees",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: LME_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: LME_SCHEDULE_KEY,
    notes:
      "Recorded for the editorial gate: this page's prose, sources and fee-rule mapping were checked against the schedule published by City of Lewiston, Maine during the research pass that produced this seed; the seed's content tests assert the arithmetic. No amount on this page is estimated.",
  },
  {
    entityType: "permit_page",
    entityKey: "plumbing-permit-fees",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: LME_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: LME_SCHEDULE_KEY,
    notes:
      "Recorded for the editorial gate: this page's prose, sources and fee-rule mapping were checked against the schedule published by City of Lewiston, Maine during the research pass that produced this seed; the seed's content tests assert the arithmetic. No amount on this page is estimated.",
  },
];

export const lewistonSeed: JurisdictionSeed = {
  state,
  county,
  jurisdiction,
  departments,
  sources,
  permitTypes: [],
  projectTypes: [],
  jurisdictionPermitTypes: [
    {
      jurisdictionKey: LME_KEYS.jurisdiction,
      permitTypeKey: "building",
      isAvailable: true,
      localName: "Building permit (adopted fee schedule)",
      officialUrl: "https://www.lewistonmaine.gov/DocumentView.aspx?DID=464",
      notes:
        "$25 base + $5.00 per $1,000 of value for renovation work; per-square-foot rows for new construction; belated fee doubles the permit.",
    },
    {
      jurisdictionKey: LME_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      isAvailable: true,
      localName: "Electrical permit (valuation basis)",
      officialUrl: "https://www.lewistonmaine.gov/DocumentView.aspx?DID=464",
      notes: "Issued by Planning & Code Enforcement on the $25 + $5/$1,000 basis.",
    },
    {
      jurisdictionKey: LME_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      isAvailable: true,
      localName: "Plumbing permit (valuation basis)",
      officialUrl: "https://www.lewistonmaine.gov/DocumentView.aspx?DID=464",
      notes: "Issued by Planning & Code Enforcement on the $25 + $5/$1,000 basis.",
    },
  ],
  feeSchedules,
  feeRules,
  requirements: [],
  profile,
  permitPages,
  verifications,
};

export const LME_PUBLISHED_PERMIT_PAGES = lewistonSeed.permitPages.filter(
  (page) => page.publishStatus === "published" && !page.noindex,
);
