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
  BPT_BUILDING_RULES,
  BPT_ELECTRICAL_RULES,
  BPT_FEE_EFFECTIVE_FROM,
  BPT_FEE_SCHEDULE_KEY,
  BPT_PLUMBING_RULES,
} from "./fee-rules";

export * from "./fee-rules";

/**
 * The complete Bridgeport, Connecticut seed payload.
 *
 * Every figure traces to research/connecticut/bridgeport.md, which traces to
 * the City's own "PERMIT FEES - BUILDING DEPARTMENT - Effective 5/18/16" PDF
 * on bridgeportct.gov (HTTP 200, text layer read with pdftotext).
 */

const RESEARCHER = "Permit Fee Intelligence research pass (Connecticut)";

export const BPT_LAST_VERIFIED = "2026-09-26";

export const BPT_KEYS = {
  state: "ct",
  county: "fairfield",
  jurisdiction: "bridgeport",
  feeSchedule: BPT_FEE_SCHEDULE_KEY,
} as const;

const state: SeedState = {
  code: "CT",
  slug: "connecticut",
  name: "Connecticut",
  fipsCode: "09",
};

const county: SeedCounty = {
  key: BPT_KEYS.county,
  slug: "fairfield",
  name: "Fairfield County",
  fipsCode: "09001",
};

const jurisdiction: SeedJurisdiction = {
  key: BPT_KEYS.jurisdiction,
  stateKey: BPT_KEYS.state,
  countyKey: BPT_KEYS.county,
  type: "city",
  slug: "bridgeport",
  name: "Bridgeport",
  officialName: "City of Bridgeport, Connecticut",
  websiteUrl: "https://www.bridgeportct.gov/",
  permitPortalUrl:
    "https://www.bridgeportct.gov/government/departments/building-department/building-permit",
  timezone: "America/New_York",
  isActive: true,
};

const departments: SeedDepartment[] = [
  {
    key: "bridgeport-building",
    jurisdictionKey: BPT_KEYS.jurisdiction,
    kind: "building",
    name: "Building Department",
    phone: "(203) 576-7233",
    email: null,
    url:
      "https://www.bridgeportct.gov/government/departments/building-department/building-permit",
    addressLine: "999 Broad Street, Bridgeport, CT 06604",
    hours: "Monday through Friday, 8:30 a.m. to 4:30 p.m.",
    notes:
      "The Building Department issues building, electrical, plumbing and mechanical permits for the city through the Park City Portal, and publishes the fee schedule this seed prices from.",
  },
];

const sources: SeedSource[] = [
  {
    key: BPT_FEE_SCHEDULE_KEY,
    jurisdictionKey: BPT_KEYS.jurisdiction,
    title:
      'City of Bridgeport — "PERMIT FEES - BUILDING DEPARTMENT - Effective 5/18/16"',
    url: "https://www.bridgeportct.gov/sites/default/files/2023-03/Bldg_2016_05_18_Fee_Schedule.pdf",
    sourceType: "fee_schedule_pdf",
    issuingAuthority: "City of Bridgeport Building Department",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2016-05-18",
    effectiveFrom: BPT_FEE_EFFECTIVE_FROM,
    retrievedAt: BPT_LAST_VERIFIED,
    lastVerifiedAt: BPT_LAST_VERIFIED,
    notes:
      "Read 2026-09-26 from the City's own host (HTTP 200; text layer extracted with pdftotext). The schedule states the formula outright — '$60.00 for the 1st $1,000 in Value of Work, plus $30.00 per thousand or part of, after first thousand' — and prints the matching linear table from $40.00 (value to $500) to roughly $1.49M of value. Flat rows on the same sheet: ALL BUILDING PERMITS ADD $125 for C/O Fee, Certificate of Occupancy $125.00, Replacement Water Heater Only $40.00 (building and electrical), new sign licence $150.00, renewal $85.00. No plan-review percentage is printed anywhere on the schedule.",
  },
  {
    key: "bridgeport-building-permit-page",
    jurisdictionKey: BPT_KEYS.jurisdiction,
    title: "Building Permit (Building Department)",
    url: "https://www.bridgeportct.gov/government/departments/building-department/building-permit",
    sourceType: "municipal_website",
    issuingAuthority: "City of Bridgeport Building Department",
    authorityKind: "city",
    isPrimary: true,
    documentDate: BPT_LAST_VERIFIED,
    effectiveFrom: BPT_FEE_EFFECTIVE_FROM,
    retrievedAt: BPT_LAST_VERIFIED,
    lastVerifiedAt: BPT_LAST_VERIFIED,
    notes:
      "Names the Park City Portal as the application route and the Building Department as the issuing office for building permits and trade permits alike.",
  },
  {
    key: "ct-das-permit-fees",
    jurisdictionKey: BPT_KEYS.jurisdiction,
    title: "Fees Assessed on Building Permits (Connecticut DAS)",
    url: "https://portal.ct.gov/das/services/licensing-certification-permitting-and-codes/fees-assessed-on-building-permits",
    sourceType: "state_agency",
    issuingAuthority: "Connecticut Department of Administrative Services",
    authorityKind: "state",
    isPrimary: true,
    documentDate: BPT_LAST_VERIFIED,
    effectiveFrom: BPT_FEE_EFFECTIVE_FROM,
    retrievedAt: BPT_LAST_VERIFIED,
    lastVerifiedAt: BPT_LAST_VERIFIED,
    notes:
      "The state's code-education fee assessed on municipal building permits (the $0.26-per-$1,000 rider familiar from Connecticut schedules that itemize it). Bridgeport's printed rows are round dollars and its formula line carries no rider, so the surcharge is named here and not modelled as a separate component.",
  },
];

const feeSchedules: SeedFeeSchedule[] = [
  {
    key: BPT_KEYS.feeSchedule,
    jurisdictionKey: BPT_KEYS.jurisdiction,
    sourceKey: BPT_FEE_SCHEDULE_KEY,
    title: "Bridgeport Building Department permit fees — effective May 18, 2016",
    officialUrl:
      "https://www.bridgeportct.gov/sites/default/files/2023-03/Bldg_2016_05_18_Fee_Schedule.pdf",
    effectiveFrom: BPT_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: BPT_LAST_VERIFIED,
    notes:
      "One schedule covers building and the trade permits the department issues; the Value-of-Work table is the fee mechanism for all of them, with the $40.00 water-heater-only row the one discounted carve-out.",
  },
];

function attach(permitTypeKey: string, rules: SeedFeeRule["rule"][]): SeedFeeRule[] {
  return rules.map((rule) => ({
    jurisdictionKey: BPT_KEYS.jurisdiction,
    permitTypeKey,
    scheduleKey: BPT_KEYS.feeSchedule,
    rule,
  }));
}

const feeRules: SeedFeeRule[] = [
  ...attach("building", BPT_BUILDING_RULES),
  ...attach("electrical", BPT_ELECTRICAL_RULES),
  ...attach("plumbing", BPT_PLUMBING_RULES),
];

const profile: SeedProfile = {
  jurisdictionKey: BPT_KEYS.jurisdiction,
  headline: "What building permits cost in Bridgeport",
  summary:
    "Bridgeport prices a building permit from the **value of the work**: **$40.00** up to $500 of value, **$60.00** to $1,000, then **$60.00 plus $30.00 per $1,000 or part of** above the first thousand — the City's own printed formula. The same Building Department issues electrical and plumbing permits against the same value table, and every building permit adds the **$125.00** certificate-of-occupancy fee.",
  localContext:
    "Bridgeport's fee schedule is one page, printed by the Building Department with an effective date of May 18, 2016, and it states its own arithmetic in a single line: '$60.00 for the 1st $1,000 in Value of Work, plus $30.00 per thousand or part of, after first thousand.' The table beside the line agrees with it at every row — $50,000 of value prices $1,530.00, $100,000 prices $3,030.00 — which makes Bridgeport one of the few cities in this dataset whose fee is exactly predictable from two numbers.\n\nThe 'or part of' matters: a $10,100 project rounds its excess above the first thousand up to a full $10,000 block, pricing $60.00 + 10 x $30.00 = $360.00. The table's first two rows are the exceptions to the formula — value to $500 is a flat $40.00, and $501 to $1,000 is $60.00 — and the seed prices the printed rows as printed.\n\nThe schedule carries its own flat rows beside the table: every building permit adds $125.00 for the certificate of occupancy, a standalone C/O is $125.00, a replacement water heater alone is $40.00 on either the building or the electrical side, and sign licences run $150.00 new and $85.00 to renew. Electrical and plumbing permits are issued by the same department against the same value table — the water-heater row's 'ELECTRICAL WORK' heading is the schedule's own proof that the trade side reads the same mechanism.\n\nConnecticut municipalities also collect a small state code-education fee on building permits ($0.26 per $1,000). Bridgeport's printed rows are round dollars and the printed formula carries no rider, so the amounts here are the City's own printed figures.",
  valuationBasis:
    "The **value of the work** — total construction value including labour and materials — read against the Building Department's printed table: $40.00 to $500, $60.00 to $1,000, then $30.00 per $1,000 or part of above the first thousand, on the $60.00 base.",
  notIncluded:
    "These figures are the Bridgeport Building Department's permit fees from the 2016 schedule. They exclude:\n\n- **The $125.00 certificate-of-occupancy fee** the schedule adds to every building permit, and the standalone $125.00 C/O row — charged at the end of the work rather than at permit time.\n- **Sign licences**: $150.00 for a new sign licence and $85.00 to renew one, printed as their own rows.\n- **The water-heater carve-out** on the electrical page here is modelled as its own scope; any other electrical scope prices from the value table.\n- **Plan review**: the schedule publishes no plan-review percentage, and none is charged here.\n- **Zoning permits** (a separate zoning fee schedule on the City's site) and any Park City Portal processing fees, which are not Building Department amounts.",
  seoTitle: "Bridgeport building permit fees",
  seoDescription:
    "How Bridgeport, Connecticut prices building, electrical and plumbing permits — $60 for the first $1,000 plus $30 per $1,000 or part of, from the Building Department's own schedule.",
  publishStatus: "published",
  noindex: false,
  lastReviewedAt: BPT_LAST_VERIFIED,
};

const permitPages: SeedPermitPage[] = [
  {
    jurisdictionKey: BPT_KEYS.jurisdiction,
    permitTypeKey: "building",
    slug: "building-permit-fees",
    seoTitle: "Bridgeport building permit fees",
    seoDescription:
      "Bridgeport, Connecticut building permit fees — $40/$60 first brackets, then $60 + $30 per $1,000 or part of value, from the Building Department's 2016 schedule.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: BPT_LAST_VERIFIED,
    title: "Bridgeport building permit fees",
    intro:
      "A Bridgeport building permit is priced from the **value of the work**: **$40.00** up to $500 of value, **$60.00** from $501 to $1,000, then **$60.00 plus $30.00 for each additional $1,000 or part of** — the City's own formula, printed on the schedule. A $50,000 project prices $1,530.00 and a $100,000 project prices $3,030.00, exactly as the table says, and every building permit adds the **$125.00** certificate-of-occupancy fee.",
    localSummary:
      "The formula is the finding. Where most Connecticut cities publish a table you must look up, Bridgeport's Building Department prints the arithmetic itself — '$60.00 for the 1st $1,000 in Value of Work, plus $30.00 per thousand or part of, after first thousand' — and the table beside it agrees at every printed row, from $90.00 at $2,000 of value to the schedule's last printed rows near $1.49M.\n\nReading the fee is then a two-step exercise. Take the value above the first thousand, round any fraction up to a whole thousand ('or part of'), multiply by $30.00, and add the $60.00 base: a $10,100 project is $60.00 + 10 x $30.00 = **$360.00**. Below $1,000 the printed rows take over — $40.00 to $500, $60.00 from $501 to $1,000 — because a table row is more specific than a formula line.\n\nThe flat rows on the same page are part of every budget: the $125.00 certificate-of-occupancy fee added to all building permits, the standalone $125.00 C/O, the $40.00 water-heater-only row, and sign licences at $150.00 new / $85.00 renewed. What the schedule does not print is any plan-review percentage — there is none to charge.",
    notIncluded:
      "This is the Building Department's building-permit table and its flat rows. It excludes:\n\n- **The $125.00 C/O fee** added to every building permit and the standalone $125.00 certificate of occupancy — end-of-work charges, not part of the permit calculation.\n- **Sign licences** ($150.00 new, $85.00 renewal), printed as their own rows on the same schedule.\n- **Trade permits** — electrical and plumbing price from the same value table and have their own pages here.\n- **Zoning permits** on the City's separate zoning fee schedule, and any Park City Portal processing fees.\n- **A plan-review fee** — the schedule publishes no plan-review percentage, so none is charged.",
    workedExample: {
      scenario:
        "A single-family renovation in Bridgeport with a declared value of the work of $10,000.",
      inputs: {
        occupancy: "residential",
        valuationCents: 1_000_000,
      },
      notes:
        "Value of work $10,000: the formula charges $60.00 for the first $1,000 plus $30.00 for each of the 9 additional thousands: $60.00 + 9 x $30.00 = **$330.00**.\n\nA $10,100 project would round the excess up ('or part of'): $60.00 + 10 x $30.00 = **$360.00**. The certificate-of-occupancy fee of $125.00 is added to the permit when the work finishes.",
    },
    faqs: [
      {
        question: "How much is a building permit in Bridgeport, Connecticut?",
        answer:
          "$40.00 up to $500 of value, $60.00 from $501 to $1,000, then $60.00 plus $30.00 per $1,000 or part of above the first thousand. A $50,000 project is $1,530.00 and a $100,000 project is $3,030.00.",
      },
      {
        question: "What does 'or part of' mean for the fee?",
        answer:
          "Any fraction of a $1,000 above the first thousand is charged as a full $1,000 block. A $10,100 project pays for 10 blocks above the first thousand — $360.00 — not 9.1.",
      },
      {
        question: "Is there a plan review fee?",
        answer:
          "The Building Department's schedule publishes no plan-review percentage. The permit table and its flat rows are the whole schedule; no review fee is charged here.",
      },
      {
        question: "How much is the certificate of occupancy?",
        answer:
          "$125.00 — the schedule adds it to every building permit ('ALL BUILDING PERMITS ADD $125 for C/O Fee') and also prints it as the standalone C/O amount.",
      },
      {
        question: "Does the same table price electrical and plumbing permits?",
        answer:
          "Yes — the Building Department issues trade permits against the same value-of-work table. The schedule's own 'ELECTRICAL WORK, WATER HEATER ONLY: $40.00' row shows the electrical side reading the same mechanism.",
      },
      {
        question: "What does a water heater replacement cost to permit?",
        answer:
          "$40.00 — the schedule prints 'REPLACEMENT WATER HEATER ONLY: $40.00' for the building side and the same $40.00 under electrical work.",
      },
      {
        question: "When did these fees take effect?",
        answer:
          "The schedule is printed 'Effective 5/18/16' — May 18, 2016 — and it is the fee document the City serves from its own site today.",
      },
      {
        question: "Is there a state fee on top of the city fee?",
        answer:
          "Connecticut municipalities collect a small state code-education fee on building permits ($0.26 per $1,000). Bridgeport's printed rows are round dollars and its formula carries no rider, so the amounts here are the City's printed figures.",
      },
      {
        question: "How do I apply?",
        answer:
          "Through the Park City Portal — the Building Department's page directs all building-permit applicants to create an account there and submit documents in PDF form.",
      },
      {
        question: "How is the value of the work determined?",
        answer:
          "It is the total value of the construction — labour and materials — declared at application. The fee scales linearly above the first thousand, so the declared value drives the whole fee.",
      },
      {
        question: "What does a sign permit cost?",
        answer:
          "A new sign licence is $150.00 and a renewal is $85.00, printed as their own rows on the Building Department schedule.",
      },
      {
        question: "Is the fee different for commercial work?",
        answer:
          "No — the value-of-work table makes no residential or commercial distinction; the same $40/$60/$30-per-thousand arithmetic prices either kind of project.",
      },
    ],
  },
  {
    jurisdictionKey: BPT_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    slug: "electrical-permit-fees",
    seoTitle: "Bridgeport electrical permit fees",
    seoDescription:
      "Bridgeport, Connecticut electrical permit fees — priced from the Building Department's value-of-work table, with a $40 water-heater-only row.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: BPT_LAST_VERIFIED,
    title: "Bridgeport electrical permit fees",
    intro:
      "An electrical permit in Bridgeport is issued by the Building Department against the same **value-of-work table** the building permit reads: **$60.00** from $501 to $1,000 of value, then **$60.00 plus $30.00 per $1,000 or part of** above the first thousand. The schedule's one electrical carve-out is a **$40.00** flat row for a water heater replacement only.",
    localSummary:
      "The schedule proves its own scope. On the same printed page as the building table sits the row 'ELECTRICAL WORK, WATER HEATER ONLY: $40.00' — which only makes sense if the Building Department prices electrical work from the same value-of-work table, with the water heater the one discounted scope. The local electrical trade's published walkthrough reads the table the same way: $40 for the smallest jobs, $60 at $1,000, $90 at $2,000.\n\nFor the calculator this means an electrical permit behaves exactly like the building permit it usually accompanies: declare the value of the electrical work, and the same $60-plus-$30-per-thousand arithmetic prices it. A $5,000 electrical scope is $60.00 + 4 x $30.00 = **$180.00**; a $1,000 scope is **$60.00**.\n\nTwo flat rows bracket the table. The $40.00 water-heater-only row is the schedule's own discount for that single, repeatable scope — the calculator charges it only when you mark the job as a water heater replacement. And sign licences ($150.00 new / $85.00 renewed) sit on the same sheet but are separate permits entirely.",
    notIncluded:
      "This is the Building Department's electrical permit pricing. It excludes:\n\n- **The building permit** for the project the electrical work belongs to, priced separately on the building page here.\n- **The $125.00 certificate-of-occupancy fee**, which attaches to building permits rather than trade permits.\n- **Sign licences** ($150.00 new, $85.00 renewal) on the same schedule.\n- **Zoning permits** and any Park City Portal processing fees.\n- **A plan-review fee** — the schedule publishes none.",
    workedExample: {
      scenario:
        "A water heater replacement in Bridgeport, permitted as electrical work only.",
      inputs: {
        occupancy: "residential",
        custom: { water_heater_only: true },
      },
      notes:
        "The schedule prints 'ELECTRICAL WORK, WATER HEATER ONLY: $40.00' — a flat **$40.00** for that single scope, regardless of the water heater's cost.\n\nFor any other electrical scope the value table prices the permit: $60.00 at $1,000 of value, $180.00 at $5,000, $330.00 at $10,000.",
    },
    faqs: [
      {
        question: "How much is an electrical permit in Bridgeport?",
        answer:
          "It follows the Building Department's value-of-work table: $60.00 at $1,000 of value, then $30.00 per $1,000 or part of above the first thousand — the same arithmetic as the building permit.",
      },
      {
        question: "What does a water heater replacement permit cost?",
        answer:
          "$40.00 flat — the schedule's 'ELECTRICAL WORK, WATER HEATER ONLY' row, the one discounted scope on the sheet.",
      },
      {
        question: "Who issues electrical permits in Bridgeport?",
        answer:
          "The Building Department, the same office that issues building permits — the schedule covering both sits on the City's Building Department pages.",
      },
      {
        question: "How is the electrical fee calculated for a $5,000 job?",
        answer:
          "$60.00 for the first $1,000 plus $30.00 for each of the 4 additional thousands: $180.00. A $5,100 job rounds up to 5 blocks: $210.00.",
      },
      {
        question: "Is there a minimum electrical permit fee?",
        answer:
          "The printed table's lowest row is $40.00 (the water-heater-only carve-out); the value table itself starts at $40.00 for value to $500 and $60.00 to $1,000. Those printed rows are the floor the schedule publishes.",
      },
      {
        question: "When did these fees take effect?",
        answer:
          "The schedule is printed 'Effective 5/18/16' — May 18, 2016.",
      },
      {
        question: "Do I need a separate electrical permit for a panel upgrade?",
        answer:
          "Yes — a service or panel upgrade is its own electrical permit priced from the value of that work, not a line item on the building permit.",
      },
      {
        question: "Is the fee different for commercial electrical work?",
        answer:
          "No — the value-of-work table makes no residential or commercial distinction on the electrical side.",
      },
      {
        question: "What about a sign licence?",
        answer:
          "Signs are their own rows: $150.00 for a new sign licence, $85.00 to renew — separate from any electrical permit.",
      },
      {
        question: "How do I apply for an electrical permit?",
        answer:
          "Through the Park City Portal, the Building Department's online application route, with documents submitted in PDF form.",
      },
    ],
  },
  {
    jurisdictionKey: BPT_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    slug: "plumbing-permit-fees",
    seoTitle: "Bridgeport plumbing permit fees",
    seoDescription:
      "Bridgeport, Connecticut plumbing permit fees — the Building Department's value-of-work table: $60 for the first $1,000 plus $30 per $1,000 or part of.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: BPT_LAST_VERIFIED,
    title: "Bridgeport plumbing permit fees",
    intro:
      "A plumbing permit in Bridgeport is priced from the Building Department's **value-of-work table**: **$60.00** from $501 to $1,000 of value, then **$60.00 plus $30.00 per $1,000 or part of** above the first thousand. The department issues plumbing permits on the same schedule as building and electrical work, so one table prices the whole trade side of the city.",
    localSummary:
      "Bridgeport is unusual in publishing no separate plumbing table — and unusual in not needing one. The Building Department's single 2016 schedule prices building, electrical and plumbing permits alike from the value of the work, which is why the same page can carry a building ladder, the electrical water-heater row, and the sign licences without a plumbing section: the value table *is* the plumbing section.\n\nThe fee arithmetic is the schedule's printed line. A $4,000 plumbing job is $60.00 + 3 x $30.00 = **$150.00**; a $12,000 repipe is $60.00 + 11 x $30.00 = **$390.00**. 'Or part of' rounds any fraction of a thousand up to a whole block, so a $4,100 job prices $180.00.\n\nThe schedule's flat rows still matter to plumbing budgets: the building-side $40.00 water-heater-only row gives a cheap route for that single replacement, and the $125.00 certificate-of-occupancy fee rides on building permits rather than on the plumbing permit itself.",
    notIncluded:
      "This is the Building Department's plumbing permit pricing from the value-of-work table. It excludes:\n\n- **The building permit** for the project the plumbing belongs to, priced separately on the building page here.\n- **The $125.00 certificate-of-occupancy fee**, which attaches to building permits.\n- **Sewer and water connection charges**, which are WPCA/utility bills rather than Building Department permit fees.\n- **Zoning permits** and any Park City Portal processing fees.\n- **A plan-review fee** — the schedule publishes none.",
    workedExample: {
      scenario:
        "A bathroom repipe in Bridgeport with a declared value of the plumbing work of $10,000.",
      inputs: {
        occupancy: "residential",
        valuationCents: 1_000_000,
      },
      notes:
        "Value of work $10,000: $60.00 for the first $1,000 plus $30.00 for each of the 9 additional thousands: $60.00 + 9 x $30.00 = **$330.00**.\n\nA water heater replacement alone would sit on the schedule's $40.00 flat row instead — the one discounted scope the City prints.",
    },
    faqs: [
      {
        question: "How much is a plumbing permit in Bridgeport?",
        answer:
          "It follows the value-of-work table: $60.00 at $1,000 of value, then $30.00 per $1,000 or part of above the first thousand — $330.00 at $10,000 of value.",
      },
      {
        question: "Is there a separate plumbing fee table?",
        answer:
          "No. The Building Department's one schedule prices building, electrical and plumbing permits from the same value-of-work table.",
      },
      {
        question: "Is there a per-fixture plumbing charge?",
        answer:
          "No — the schedule prices from the value of the work, not from fixture counts. No fixture row appears anywhere on the printed sheet.",
      },
      {
        question: "What does a water heater replacement cost to permit?",
        answer:
          "$40.00 flat — 'REPLACEMENT WATER HEATER ONLY: $40.00' is printed on the building side of the schedule, and the electrical side carries the same row.",
      },
      {
        question: "How is the fee calculated for a $12,000 repipe?",
        answer:
          "$60.00 for the first $1,000 plus $30.00 for each of the 11 additional thousands: $390.00.",
      },
      {
        question: "Does 'or part of' affect plumbing fees?",
        answer:
          "Yes — any fraction of a $1,000 above the first thousand is charged as a full block, so a $4,100 job prices as 4 blocks ($180.00), not 4.1.",
      },
      {
        question: "When did these fees take effect?",
        answer:
          "The schedule is printed 'Effective 5/18/16' — May 18, 2016.",
      },
      {
        question: "Is the fee different for commercial plumbing?",
        answer:
          "No — the value table makes no residential or commercial distinction.",
      },
      {
        question: "Do sewer connections ride the plumbing permit?",
        answer:
          "No — sewer and water connection charges are WPCA and utility bills, separate from the Building Department's permit fee.",
      },
      {
        question: "How do I apply for a plumbing permit?",
        answer:
          "Through the Park City Portal, the Building Department's online application route.",
      },
    ],
  },
];

const verifications: SeedVerification[] = [
  {
    entityType: "source",
    entityKey: BPT_FEE_SCHEDULE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: BPT_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BPT_FEE_SCHEDULE_KEY,
    notes:
      "Read 2026-09-26 from the City's own host (HTTP 200). The formula line, the printed table rows ($40 at $0-500, $60 at $501-1,000, $90 at $1,001-2,000 ... $1,530 at $50,000, $3,030 at $100,000) and the flat rows ($125 C/O, $40 water heater, $150/$85 sign licences) were transcribed from the PDF's text layer.",
  },
  {
    entityType: "fee_rule",
    entityKey: "BPT-BLD-VOW",
    permitTypeKey: "building",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: BPT_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BPT_FEE_SCHEDULE_KEY,
    notes:
      "The schedule's formula: '$60.00 for the 1st $1,000 in Value of Work, plus $30.00 per thousand or part of, after first thousand.' Verified against printed rows at $50,000 ($1,530.00) and $100,000 ($3,030.00).",
  },
  {
    entityType: "fee_rule",
    entityKey: "BPT-ELEC-WH",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: BPT_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BPT_FEE_SCHEDULE_KEY,
    notes:
      "Printed row: 'ELECTRICAL WORK, WATER HEATER ONLY: $40.00.' Modelled as a flat condition-gated row; other electrical scopes price from the value table.",
  },
  {
    entityType: "jurisdiction_profile",
    entityKey: BPT_KEYS.jurisdiction,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: BPT_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BPT_FEE_SCHEDULE_KEY,
    notes:
      "Profile built from the 2016 Building Department schedule in full: the value ladder, the flat rows, the C/O fee and the sign licences, with the state education surcharge named from the CT DAS page and not modelled.",
  },
  {
    entityType: "permit_page",
    entityKey: "building-permit-fees",
    permitTypeKey: "building",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: BPT_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BPT_FEE_SCHEDULE_KEY,
    notes:
      "Recorded for the editorial gate: this page's prose, sources and fee-rule mapping were checked against the schedule published by City of Bridgeport, Connecticut during the research pass that produced this seed; the seed's content tests assert the arithmetic. No amount on this page is estimated.",
  },
  {
    entityType: "permit_page",
    entityKey: "electrical-permit-fees",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: BPT_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BPT_FEE_SCHEDULE_KEY,
    notes:
      "Recorded for the editorial gate: this page's prose, sources and fee-rule mapping were checked against the schedule published by City of Bridgeport, Connecticut during the research pass that produced this seed; the seed's content tests assert the arithmetic. No amount on this page is estimated.",
  },
  {
    entityType: "permit_page",
    entityKey: "plumbing-permit-fees",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: BPT_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BPT_FEE_SCHEDULE_KEY,
    notes:
      "Recorded for the editorial gate: this page's prose, sources and fee-rule mapping were checked against the schedule published by City of Bridgeport, Connecticut during the research pass that produced this seed; the seed's content tests assert the arithmetic. No amount on this page is estimated.",
  },
];

export const bridgeportSeed: JurisdictionSeed = {
  state,
  county,
  jurisdiction,
  departments,
  sources,
  permitTypes: [],
  projectTypes: [],
  jurisdictionPermitTypes: [
    {
      jurisdictionKey: BPT_KEYS.jurisdiction,
      permitTypeKey: "building",
      isAvailable: true,
      localName: "Building permit (value-of-work table)",
      officialUrl:
        "https://www.bridgeportct.gov/sites/default/files/2023-03/Bldg_2016_05_18_Fee_Schedule.pdf",
      notes:
        "$40.00 to $500 of value, $60.00 to $1,000, then $60.00 plus $30.00 per $1,000 or part of. Every building permit adds the $125.00 C/O fee.",
    },
    {
      jurisdictionKey: BPT_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      isAvailable: true,
      localName: "Electrical permit (value-of-work table)",
      officialUrl:
        "https://www.bridgeportct.gov/sites/default/files/2023-03/Bldg_2016_05_18_Fee_Schedule.pdf",
      notes:
        "Issued by the Building Department against the same value table; the $40.00 water-heater-only row is the printed carve-out.",
    },
    {
      jurisdictionKey: BPT_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      isAvailable: true,
      localName: "Plumbing permit (value-of-work table)",
      officialUrl:
        "https://www.bridgeportct.gov/sites/default/files/2023-03/Bldg_2016_05_18_Fee_Schedule.pdf",
      notes:
        "Issued by the Building Department against the same value table; no separate plumbing fee table exists.",
    },
  ],
  feeSchedules,
  feeRules,
  requirements: [],
  profile,
  permitPages,
  verifications,
};

export const BPT_PUBLISHED_PERMIT_PAGES = bridgeportSeed.permitPages.filter(
  (page) => page.publishStatus === "published" && !page.noindex,
);
