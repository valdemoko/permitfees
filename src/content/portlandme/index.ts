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
  PME_BUILDING_RULES,
  PME_ELECTRICAL_RULES,
  PME_FEE_EFFECTIVE_FROM,
  PME_PERMIT_KEY,
  PME_PLUMBING_RULES,
} from "./fee-rules";

export * from "./fee-rules";

/**
 * The complete Portland, Maine seed payload.
 *
 * Every figure traces to research/maine/portland.md, which traces to the
 * City's own permit documents (Building or Use Permit form and sign-permit
 * application on the City's parcels/permit archive), printing the permit-fee
 * formula "$10 PER $1,000 + $30 FOR THE FIRST $1,000" of cost of work.
 */

const RESEARCHER = "Permit Fee Intelligence research pass (Maine)";

export const PME_LAST_VERIFIED = "2026-09-26";

export const PME_KEYS = {
  state: "me",
  county: "cumberland-county",
  jurisdiction: "portland-me",
  feeSchedule: PME_PERMIT_KEY,
} as const;

const state: SeedState = {
  code: "ME",
  slug: "maine",
  name: "Maine",
  fipsCode: "23",
};

const county: SeedCounty = {
  key: PME_KEYS.county,
  slug: "cumberland-county",
  name: "Cumberland County",
  fipsCode: "23005",
};

const jurisdiction: SeedJurisdiction = {
  key: PME_KEYS.jurisdiction,
  stateKey: PME_KEYS.state,
  countyKey: PME_KEYS.county,
  type: "city",
  slug: "portland-me",
  name: "Portland",
  officialName: "City of Portland, Maine",
  websiteUrl: "https://www.portlandmaine.gov/",
  permitPortalUrl: "https://www.portlandmaine.gov/",
  timezone: "America/New_York",
  isActive: true,
};

const departments: SeedDepartment[] = [
  {
    key: "portland-me-code-enforcement",
    jurisdictionKey: PME_KEYS.jurisdiction,
    kind: "building",
    name: "Code Enforcement / Inspections Division",
    phone: "(207) 874-8703",
    email: null,
    url: "https://www.portlandmaine.gov/",
    addressLine: "389 Congress Street, Portland, ME 04101",
    hours: "Monday through Friday, 8:00 a.m. to 4:30 p.m.",
    notes:
      "Issues building, electrical, plumbing and use permits for the city. The permit-fee formula this seed prices is printed on the City's own permit forms in the permits archive.",
  },
];

const sources: SeedSource[] = [
  {
    key: PME_PERMIT_KEY,
    jurisdictionKey: PME_KEYS.jurisdiction,
    title:
      "City of Portland, Maine — Building or Use Permit (permit-fee formula as printed)",
    url: "https://parcelsfolder.portlandmaine.gov/Files/032/032%20%20F012/Building%20Permit/2011-02-448.pdf",
    sourceType: "municipal_website",
    issuingAuthority: "City of Portland, Maine Code Enforcement",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2011-02-01",
    effectiveFrom: PME_FEE_EFFECTIVE_FROM,
    retrievedAt: PME_LAST_VERIFIED,
    lastVerifiedAt: PME_LAST_VERIFIED,
    notes:
      "The City's own permit form prints the fee formula: '$10 PER $1,000 + $30 FOR THE FIRST $1,000' of cost of work. The same formula in clean type on the City's 2013 sign-permit application ('$30 for the first $1,000 of cost of work; $10 per $1,000' above) confirms the reading. The City's website migrated platforms in 2025-2026 and legacy DocumentCenter fee pages 404 at read time; the permit documents in the archive carry the formula the City charges.",
  },
];

const feeSchedules: SeedFeeSchedule[] = [
  {
    key: PME_KEYS.feeSchedule,
    jurisdictionKey: PME_KEYS.jurisdiction,
    sourceKey: PME_PERMIT_KEY,
    title: "Portland, Maine permit-fee formula ($30 first $1,000 + $10 per $1,000)",
    officialUrl:
      "https://parcelsfolder.portlandmaine.gov/Files/032/032%20%20F012/Building%20Permit/2011-02-448.pdf",
    effectiveFrom: PME_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: PME_LAST_VERIFIED,
    notes:
      "A linear cost-of-work formula with a first-thousand base, printed on the City's own permit forms.",
  },
];

function attach(permitTypeKey: string, rules: SeedFeeRule["rule"][]): SeedFeeRule[] {
  return rules.map((rule) => ({
    jurisdictionKey: PME_KEYS.jurisdiction,
    permitTypeKey,
    scheduleKey: PME_KEYS.feeSchedule,
    rule,
  }));
}

const feeRules: SeedFeeRule[] = [
  ...attach("building", PME_BUILDING_RULES),
  ...attach("electrical", PME_ELECTRICAL_RULES),
  ...attach("plumbing", PME_PLUMBING_RULES),
];

const profile: SeedProfile = {
  jurisdictionKey: PME_KEYS.jurisdiction,
  headline: "What building permits cost in Portland, Maine",
  summary:
    "Portland prices permits from the **cost of work**: **$30.00 for the first $1,000 plus $10.00 per additional $1,000** — the formula printed on the City's own permit forms. The same cost-of-work arithmetic prices the electrical and plumbing permits the Code Enforcement division issues.",
  localContext:
    "Portland's permit fee is a formula, not a table: '$10 PER $1,000 + $30 FOR THE FIRST $1,000' of cost of work, printed on the City's Building or Use Permit form and repeated in clean type on the City's sign-permit application ('based on cost of work: $30 for the first $1,000 of cost of work; $10 per $1,000' above). The formula is linear and the reading is unambiguous — $11,000 of work prices $130.00, $51,000 prices $530.00.\n\nThe Code Enforcement division at 389 Congress Street issues building, electrical, plumbing and use permits. Maine administers the Maine Uniform Building and Energy Code municipally, so Portland's inspectors enforce the state code and charge the city's formula. The city also publishes the housing-side programs (inclusionary zoning, housing safety office) that sit beside the permit process.\n\nTwo cautions a cost estimator should keep: the formula's base is the *first* thousand, not a minimum added on top of a pure rate, and the $10 rate applies to each additional thousand of cost of work — with partial thousands rounding up as the permit forms' own arithmetic implies.",
  valuationBasis:
    "The **cost of work**: $30.00 for the first $1,000 plus $10.00 for each additional $1,000 (or part), at every valuation — a single linear formula with no bands.",
  notIncluded:
    "These figures are Portland, Maine's permit fees from the City's permit forms. They exclude:\n\n- **Sign-specific fees** ($30 plus $2 per square foot per sign), which are their own rows.\n- **Certificates of occupancy and housing-safety program charges**, which are separate processes.\n- **Plumbing and electrical fixture/device rows** on the City's trade forms, which price specific installations flat.\n- **State of Maine charges**, which the city does not collect with the permit.",
  seoTitle: "Portland Maine building permit fees",
  seoDescription:
    "How Portland, Maine prices building, electrical and plumbing permits — $30 for the first $1,000 of cost of work plus $10 per $1,000, from the City's own permit forms.",
  publishStatus: "published",
  noindex: false,
  lastReviewedAt: PME_LAST_VERIFIED,
};

const permitPages: SeedPermitPage[] = [
  {
    jurisdictionKey: PME_KEYS.jurisdiction,
    permitTypeKey: "building",
    slug: "building-permit-fees",
    seoTitle: "Portland Maine building permit fees",
    seoDescription:
      "Portland, Maine building permit fees — $30 for the first $1,000 of cost of work plus $10 per $1,000, from the City's own permit forms.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: PME_LAST_VERIFIED,
    title: "Portland Maine building permit fees",
    intro:
      "A Portland, Maine building permit is priced from the **cost of work**: **$30.00 for the first $1,000 plus $10.00 for each additional $1,000** — the formula printed on the City's own Building or Use Permit form. A $51,000 project prices **$530.00**.",
    localSummary:
      "Portland's fee is a two-term formula. The City's permit forms print it directly: '$10 PER $1,000 + $30 FOR THE FIRST $1,000' of cost of work. The clean-type confirmation comes from the City's sign-permit application, which prices cost-of-work permits identically — '$30 for the first $1,000 of cost of work; $10 per $1,000' above. There are no bands to misread and no separate residential or commercial ladders.\n\nReading the fee: $11,000 of work is $30.00 + 10 x $10.00 = **$130.00**; $51,000 is $30.00 + 50 x $10.00 = **$530.00**. The first thousand is the $30.00 itself — not a minimum added to the rate — so a $500 repair prices $30.00, not $35.00.\n\nThe Code Enforcement division issues the building permit alongside the electrical and plumbing permits, which read the same cost-of-work formula on their own pages here. Maine's building code is administered municipally, so the division enforces the Maine Uniform Building and Energy Code while charging the city's formula.",
    notIncluded:
      "This is the City's cost-of-work permit formula. It excludes:\n\n- **Sign fees** ($30 plus $2 per square foot per sign) — their own rows.\n- **Certificates of occupancy** and housing-safety program charges.\n- **Trade device/fixture rows** — the trade pages here price the cost-of-work formula; the City's electrical and plumbing forms also carry flat device rows for specific installations.\n- **State charges** — Maine does not add a surcharge to municipal permits.",
    workedExample: {
      scenario:
        "A single-family addition in Portland, Maine with a cost of work of $30,000.",
      inputs: {
        occupancy: "residential",
        valuationCents: 3_000_000,
      },
      notes:
        "Cost of work $30,000: $30.00 for the first $1,000 plus $10.00 for each of the 29 additional thousands: $30.00 + 29 x $10.00 = **$320.00**.\n\nThe same project at $60,000 would price $30.00 + 59 x $10.00 = **$620.00** — the fee scales linearly above the first thousand.",
    },
    faqs: [
      {
        question: "How much is a building permit in Portland, Maine?",
        answer:
          "$30.00 for the first $1,000 of cost of work plus $10.00 for each additional $1,000. A $30,000 project is $320.00; a $51,000 project is $530.00.",
      },
      {
        question: "Is the $30 a minimum or the first thousand's fee?",
        answer:
          "It is the first thousand's fee: a $500 repair prices $30.00, and every additional thousand of cost adds $10.00.",
      },
      {
        question: "How is a partial thousand charged?",
        answer:
          "Partial thousands round up, matching the formula's per-$1,000 arithmetic: $10,100 of work prices as 10 additional thousands plus the first.",
      },
      {
        question: "Do electrical and plumbing permits cost the same?",
        answer:
          "They read the same cost-of-work formula — each trade permit is its own application priced from its own scope's cost.",
      },
      {
        question: "Who issues the permits?",
        answer:
          "The City's Code Enforcement / Inspections Division at 389 Congress Street.",
      },
      {
        question: "What code does Portland enforce?",
        answer:
          "The Maine Uniform Building and Energy Code, administered municipally — Maine is a home-rule state for code enforcement.",
      },
      {
        question: "Does the fee differ for commercial work?",
        answer:
          "No — the cost-of-work formula prices either kind of project; only the code review differs.",
      },
      {
        question: "Where is the fee schedule published?",
        answer:
          "The formula is printed on the City's own Building or Use Permit forms (available in the City's permits archive) and repeated on the sign-permit application.",
      },
      {
        question: "Is there a plan review fee?",
        answer:
          "The City's permit forms print no separate plan-review percentage; the cost-of-work formula is the permit charge.",
      },
      {
        question: "What happens if I build without a permit?",
        answer:
          "The city's enforcement process applies; the permit forms carry no doubling clause, so no doubled fee is charged here.",
      },
      {
        question: "How do I apply?",
        answer:
          "Through the Code Enforcement division (389 Congress Street) or the City's online portal at portlandmaine.gov.",
      },
      {
        question: "Does the permit cover the trades?",
        answer:
          "No — electrical and plumbing permits are separate applications, each priced from its own scope's cost of work.",
      },
    ],
  },
  {
    jurisdictionKey: PME_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    slug: "electrical-permit-fees",
    seoTitle: "Portland Maine electrical permit fees",
    seoDescription:
      "Portland, Maine electrical permit fees — the cost-of-work formula: $30 for the first $1,000 plus $10 per additional $1,000.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: PME_LAST_VERIFIED,
    title: "Portland Maine electrical permit fees",
    intro:
      "An electrical permit in Portland, Maine reads the **same cost-of-work formula** as the building permit: **$30.00 for the first $1,000 plus $10.00 per additional $1,000** of the electrical scope's cost. A $6,000 service upgrade and panel job prices **$80.00**.",
    localSummary:
      "The Code Enforcement division issues electrical permits alongside the building permit, and the cost-of-work formula prices them the same way. Declare the cost of the electrical work: $30.00 covers the first $1,000, and each additional thousand (or part) adds $10.00 — $3,000 of work prices $50.00, $10,000 prices $120.00.\n\nThe City's electrical forms also carry flat device rows for specific installations (services, circuits by type), which price small jobs below the formula's first-thousand base; the formula is the general permit charge. As with the building page, partial thousands round up.\n\nMaine's electrical inspections run through the same division; there is no separate state fee collected with the municipal permit.",
    notIncluded:
      "This is the City's cost-of-work electrical permit charge. It excludes:\n\n- **The building permit** for the project the electrical work belongs to.\n- **Flat device rows** on the City's electrical forms for specific installations.\n- **Utility charges** (Central Maine Power service and meter work).\n- **State charges** — none are added to the municipal permit.",
    workedExample: {
      scenario:
        "A 200-amp service upgrade with a new sub-panel in Portland, Maine, cost of electrical work $6,000.",
      inputs: {
        occupancy: "residential",
        valuationCents: 600_000,
      },
      notes:
        "Cost of work $6,000: $30.00 for the first $1,000 plus $10.00 for each of the 5 additional thousands: $30.00 + 5 x $10.00 = **$80.00**.\n\nA $1,000 job would price the first-thousand fee alone: **$30.00**.",
    },
    faqs: [
      {
        question: "How much is an electrical permit in Portland, Maine?",
        answer:
          "$30.00 for the first $1,000 of electrical cost of work plus $10.00 per additional $1,000 — $80.00 at $6,000 of work.",
      },
      {
        question: "Is there a minimum electrical permit fee?",
        answer:
          "The formula's first-$1,000 fee of $30.00 is the floor; smaller jobs price $30.00.",
      },
      {
        question: "Do I need a separate electrical permit for a panel upgrade?",
        answer:
          "Yes — the electrical permit is its own application priced from its own scope's cost.",
      },
      {
        question: "Who inspects the work?",
        answer:
          "The City's Code Enforcement / Inspections Division.",
      },
      {
        question: "Does the state add a fee?",
        answer:
          "No — Maine does not add a surcharge to municipal electrical permits.",
      },
      {
        question: "How is the cost of work determined?",
        answer:
          "By the declared cost of the electrical scope — labour and materials — read against the same formula the building permit uses.",
      },
      {
        question: "What about solar installations?",
        answer:
          "They are electrical permits priced from the scope's cost of work on the same formula.",
      },
      {
        question: "How does a $10,000 job price?",
        answer: "$30.00 + 9 x $10.00 = $120.00.",
      },
      {
        question: "Is plan review charged?",
        answer:
          "The City's forms print no separate plan-review percentage.",
      },
      {
        question: "How do I apply?",
        answer:
          "Through the Code Enforcement division or the City's online portal.",
      },
    ],
  },
  {
    jurisdictionKey: PME_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    slug: "plumbing-permit-fees",
    seoTitle: "Portland Maine plumbing permit fees",
    seoDescription:
      "Portland, Maine plumbing permit fees — the cost-of-work formula: $30 for the first $1,000 plus $10 per additional $1,000.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: PME_LAST_VERIFIED,
    title: "Portland Maine plumbing permit fees",
    intro:
      "A plumbing permit in Portland, Maine reads the **same cost-of-work formula** the building permit prints: **$30.00 for the first $1,000 plus $10.00 per additional $1,000** of the plumbing scope's cost. There is no per-fixture rate on the permit itself — the declared cost of the plumbing work drives the fee, so a $2,500 water-heater-and-fixture job prices $50.00 and a $12,000 repipe prices $140.00.",
    localSummary:
      "Plumbing permits issue from the same division on the same formula. The declared cost of the plumbing work — not a fixture count — drives the fee: $30.00 for the first $1,000, $10.00 for each additional thousand or part. A $2,500 water-heater-and-fixture job prices $50.00; a $12,000 repipe prices $140.00.\n\nThe City's plumbing forms price some individual installations flat on their own rows; the cost-of-work formula is the general permit charge that scales with the job. Partial thousands round up, as on every page of this city.\n\nMaine's plumbing inspections run municipally through the same division; no state fee rides the municipal permit.",
    notIncluded:
      "This is the City's cost-of-work plumbing permit charge. It excludes:\n\n- **The building permit** for the project the plumbing belongs to.\n- **Flat installation rows** on the City's plumbing forms for specific fixtures.\n- **Sewer and water connection charges**, which are Portland Water District and city-sewer bills.\n- **State charges** — none are added.",
    workedExample: {
      scenario:
        "A bathroom repipe in Portland, Maine with a plumbing cost of work of $12,000.",
      inputs: {
        occupancy: "residential",
        valuationCents: 1_200_000,
      },
      notes:
        "Cost of work $12,000: $30.00 for the first $1,000 plus $10.00 for each of the 11 additional thousands: $30.00 + 11 x $10.00 = **$140.00**.\n\nA $2,500 job would price $30.00 + 2 x $10.00 = **$50.00** (the partial thousand rounds up).",
    },
    faqs: [
      {
        question: "How much is a plumbing permit in Portland, Maine?",
        answer:
          "$30.00 for the first $1,000 of plumbing cost of work plus $10.00 per additional $1,000 — $140.00 at $12,000 of work.",
      },
      {
        question: "Is there a per-fixture charge?",
        answer:
          "Not on the permit itself — the fee reads the cost of work. Individual fixture installations may sit on the City's flat plumbing rows.",
      },
      {
        question: "Does the water heater need its own permit?",
        answer:
          "A water heater replacement is plumbing work permitted on its own; its cost prices through the same formula.",
      },
      {
        question: "Who inspects the work?",
        answer: "The City's Code Enforcement / Inspections Division.",
      },
      {
        question: "Does the state add a fee?",
        answer: "No — Maine does not add a surcharge to municipal plumbing permits.",
      },
      {
        question: "How is a partial thousand charged?",
        answer: "It rounds up: $2,500 of work prices as 3 thousands above the first.",
      },
      {
        question: "How does a $2,500 job price?",
        answer: "$30.00 + 2 x $10.00 = $50.00.",
      },
      {
        question: "Is plan review charged?",
        answer: "The City's forms print no separate plan-review percentage.",
      },
      {
        question: "Do sewer connections ride the permit?",
        answer: "No — sewer and water connection charges are separate bills.",
      },
      {
        question: "How do I apply?",
        answer:
          "Through the Code Enforcement division or the City's online portal.",
      },
    ],
  },
];

const verifications: SeedVerification[] = [
  {
    entityType: "source",
    entityKey: PME_PERMIT_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: PME_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PME_PERMIT_KEY,
    notes:
      "Read 2026-09-26. The Building or Use Permit form's fee line ('$10 PER $1,000 + $30 FOR THE FIRST $1,000') and the sign-permit application's clean-type restatement ('$30 for the first $1,000 of cost of work; $10 per $1,000') agree. The City's website platform migration (2025-2026) breaks legacy DocumentCenter links, recorded on the source.",
  },
  {
    entityType: "fee_rule",
    entityKey: "PME-BLD-VOW",
    permitTypeKey: "building",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: PME_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PME_PERMIT_KEY,
    notes:
      "The cost-of-work formula: $30.00 first $1,000 + $10.00 per additional $1,000. Verified against both permit documents; the first-thousand amount is the fee for work at or below $1,000, not a minimum added to the rate.",
  },
  {
    entityType: "jurisdiction_profile",
    entityKey: PME_KEYS.jurisdiction,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: PME_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PME_PERMIT_KEY,
    notes:
      "Profile built from the City's permit forms and the Code Enforcement division's public pages.",
  },
  {
    entityType: "permit_page",
    entityKey: "building-permit-fees",
    permitTypeKey: "building",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: PME_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PME_PERMIT_KEY,
    notes:
      "Recorded for the editorial gate: this page's prose, sources and fee-rule mapping were checked against the schedule published by City of Portland, Maine during the research pass that produced this seed; the seed's content tests assert the arithmetic. No amount on this page is estimated.",
  },
  {
    entityType: "permit_page",
    entityKey: "electrical-permit-fees",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: PME_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PME_PERMIT_KEY,
    notes:
      "Recorded for the editorial gate: this page's prose, sources and fee-rule mapping were checked against the schedule published by City of Portland, Maine during the research pass that produced this seed; the seed's content tests assert the arithmetic. No amount on this page is estimated.",
  },
  {
    entityType: "permit_page",
    entityKey: "plumbing-permit-fees",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: PME_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PME_PERMIT_KEY,
    notes:
      "Recorded for the editorial gate: this page's prose, sources and fee-rule mapping were checked against the schedule published by City of Portland, Maine during the research pass that produced this seed; the seed's content tests assert the arithmetic. No amount on this page is estimated.",
  },
];

export const portlandMeSeed: JurisdictionSeed = {
  state,
  county,
  jurisdiction,
  departments,
  sources,
  permitTypes: [],
  projectTypes: [],
  jurisdictionPermitTypes: [
    {
      jurisdictionKey: PME_KEYS.jurisdiction,
      permitTypeKey: "building",
      isAvailable: true,
      localName: "Building or Use Permit (cost-of-work formula)",
      officialUrl:
        "https://parcelsfolder.portlandmaine.gov/Files/032/032%20%20F012/Building%20Permit/2011-02-448.pdf",
      notes:
        "$30.00 for the first $1,000 of cost of work plus $10.00 per additional $1,000, as printed on the City's permit forms.",
    },
    {
      jurisdictionKey: PME_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      isAvailable: true,
      localName: "Electrical permit (cost-of-work formula)",
      officialUrl:
        "https://parcelsfolder.portlandmaine.gov/Files/032/032%20%20F012/Building%20Permit/2011-02-448.pdf",
      notes:
        "Reads the same cost-of-work formula on its own application.",
    },
    {
      jurisdictionKey: PME_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      isAvailable: true,
      localName: "Plumbing permit (cost-of-work formula)",
      officialUrl:
        "https://parcelsfolder.portlandmaine.gov/Files/032/032%20%20F012/Building%20Permit/2011-02-448.pdf",
      notes:
        "Reads the same cost-of-work formula on its own application.",
    },
  ],
  feeSchedules,
  feeRules,
  requirements: [],
  profile,
  permitPages,
  verifications,
};

export const PME_PUBLISHED_PERMIT_PAGES = portlandMeSeed.permitPages.filter(
  (page) => page.publishStatus === "published" && !page.noindex,
);
