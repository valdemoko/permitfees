import type {
  JurisdictionSeed,
  SeedCounty,
  SeedDepartment,
  SeedFeeRule,
  SeedFeeSchedule,
  SeedJurisdiction,
  SeedJurisdictionPermitType,
  SeedPermitPage,
  SeedProfile,
  SeedRequirement,
  SeedSource,
  SeedState,
  SeedVerification,
} from "@/content/seed-types";

import {
  BALTIMORE_BUILDING_RULES,
  BALTIMORE_CODE_109_KEY,
  BALTIMORE_ELECTRICAL_RULES,
  BALTIMORE_FEE_EFFECTIVE_FROM,
  BALTIMORE_PERMIT_CENTER_KEY,
  BALTIMORE_PLUMBING_RULES,
} from "./fee-rules";

export * from "./fee-rules";

/**
 * The complete Baltimore, Maryland seed payload.
 *
 * Every figure traces to research/maryland/baltimore.md, which traces to
 * Baltimore City Building Code Article 27 §109 — the City's own Law Library
 * codification. Nothing is estimated. The building fee is volumetric, one of
 * the few cities in this dataset that does not price new construction from
 * valuation at all.
 */

const RESEARCHER = "Permit Fee Intelligence research pass (Maryland)";

export const BALTIMORE_LAST_VERIFIED = "2026-09-26";

export const BALTIMORE_KEYS = {
  state: "md",
  county: "baltimore-city",
  jurisdiction: "baltimore",
  feeSchedule: "baltimore-building-code-109-fee-schedule",
} as const;

const state: SeedState = {
  code: "MD",
  slug: "maryland",
  name: "Maryland",
  fipsCode: "24",
};

const county: SeedCounty = {
  key: BALTIMORE_KEYS.county,
  slug: "baltimore-city",
  name: "Baltimore City",
  fipsCode: "24510",
};

const jurisdiction: SeedJurisdiction = {
  key: BALTIMORE_KEYS.jurisdiction,
  stateKey: BALTIMORE_KEYS.state,
  countyKey: BALTIMORE_KEYS.county,
  type: "city",
  slug: "baltimore",
  name: "Baltimore",
  officialName: "Mayor and City Council of Baltimore",
  websiteUrl: "https://www.baltimorecity.gov/",
  permitPortalUrl: "https://www.baltimorecity.gov/dhcd/our-work/permits-and-inspections",
  timezone: "America/New_York",
  isActive: true,
};

const departments: SeedDepartment[] = [
  {
    key: "baltimore-dhcd",
    jurisdictionKey: BALTIMORE_KEYS.jurisdiction,
    kind: "building",
    name: "Department of Housing & Community Development — Office of the Building Official",
    phone: null,
    email: null,
    url: "https://www.baltimorecity.gov/dhcd/our-work/permits-and-inspections",
    addressLine: "417 E. Fayette Street, Baltimore, MD 21202",
    hours: null,
    notes:
      "DHCD's One-Stop Permit Center receives building, electrical and plumbing permit applications and schedules inspections citywide. The office publishes its application forms and its ePermits portal at the URL recorded here; office hours were not published in any document this pass could read, so they are left empty rather than guessed at.",
  },
];

const sources: SeedSource[] = [
  {
    key: BALTIMORE_CODE_109_KEY,
    jurisdictionKey: BALTIMORE_KEYS.jurisdiction,
    title:
      'Baltimore City Building Code, Article 27, §109 "Fees" — §109.6 Fee schedules (building, electrical, mechanical and plumbing permit fees)',
    url: "https://codes.baltimorecity.gov/us/md/cities/baltimore/code/building-codes/II/109",
    sourceType: "municipal_code",
    issuingAuthority: "City of Baltimore",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: BALTIMORE_FEE_EFFECTIVE_FROM,
    retrievedAt: BALTIMORE_LAST_VERIFIED,
    lastVerifiedAt: BALTIMORE_LAST_VERIFIED,
    notes:
      "Read 2026-09-26 from the City's own Law Library codification (American Legal Publishing platform, City-controlled host), HTTP 200. §109.6.1 prices construction work — volumetric new-construction rows, per-square-foot alteration rows with their exception clauses, and the accessory-structure, chimney, retaining-wall, fence, grading, paving, sign, demolition, temporary-structure, moving, pool and occupancy-permit rows. §109.6.2 prices electrical work by service amperage, circuit count and fixture blocks. §109.6.3 prices mechanical work and, in subsection (j), plumbing and on-site utilities fixture by fixture. §109.3 fixes the default $25 minimum and rounds every fee to the nearest dollar; §109.5.7 fixes the nonrefundable application fee; §109.5.9 fixes the no-permit surcharge at the greater of $1,000 or 50% of the permit fee.",
  },
  {
    key: BALTIMORE_PERMIT_CENTER_KEY,
    jurisdictionKey: BALTIMORE_KEYS.jurisdiction,
    title:
      "Baltimore City Department of Housing & Community Development — Permits (One-Stop Permit Center)",
    url: "https://www.baltimorecity.gov/dhcd/our-work/permits-and-inspections",
    sourceType: "permit_portal",
    issuingAuthority: "Baltimore City Department of Housing & Community Development",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: BALTIMORE_LAST_VERIFIED,
    lastVerifiedAt: BALTIMORE_LAST_VERIFIED,
    notes:
      "Read 2026-09-26. The City's permit page identifies the One-Stop Permit Center as the intake point for building and trade permit applications and links the ePermits portal. Used to name the issuing department and the application route; no fee amount is sourced here that §109 does not itself state.",
  },
];

/** Empty on purpose: the permit types Baltimore uses already exist as shared rows. */
const permitTypes: JurisdictionSeed["permitTypes"] = [];
const projectTypes: JurisdictionSeed["projectTypes"] = [];

const jurisdictionPermitTypes: SeedJurisdictionPermitType[] = [
  {
    jurisdictionKey: BALTIMORE_KEYS.jurisdiction,
    permitTypeKey: "building",
    isAvailable: true,
    localName: "Building permit (construction work)",
    officialUrl: "https://codes.baltimorecity.gov/us/md/cities/baltimore/code/building-codes/II/109",
    notes:
      "New buildings and additions are priced on volume — $10 per 1,000 cubic feet or fraction in 1- and 2-family dwellings, $20 per 1,000 cubic feet or fraction of adjusted volume for everything else — with minimums of $150/$75 residential and $250/$150 other. Alterations and repairs are $0.30 or $0.35 per square foot of affected area with $50 and $150 minimums, and exterior-only or door-only work is priced per $1,000 of cost instead. A nonrefundable application fee of $25 to $150 is due before processing.",
  },
  {
    jurisdictionKey: BALTIMORE_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    isAvailable: true,
    localName: "Electrical permit",
    officialUrl: "https://codes.baltimorecity.gov/us/md/cities/baltimore/code/building-codes/II/109",
    notes:
      "Service wiring is priced by ampere rating from $25 (0-100 A) to $200 (over 2,000 A), with $100 added for services over 600 volts. New branch circuits are $6 each, and permits for fixtures or devices only are $25 for the first 25 plus $5 for each additional 25 or fraction. Conduits, duct banks and sub feeders carry their own rows.",
  },
  {
    jurisdictionKey: BALTIMORE_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    isAvailable: true,
    localName: "Plumbing permit",
    officialUrl: "https://codes.baltimorecity.gov/us/md/cities/baltimore/code/building-codes/II/109",
    notes:
      "Installing, replacing or reconstructing plumbing fixtures is $5 each. Water service, sanitary and storm connections are $25 in 1- and 2-family dwellings and $50 for all other work. Backflow prevention devices are $25 installed (under 2 inches) or $100 (2 inches and over), with a $30 annual testing inspection. Gas piping sits in the mechanical schedule, not here.",
  },
];

const feeSchedules: SeedFeeSchedule[] = [
  {
    key: BALTIMORE_KEYS.feeSchedule,
    jurisdictionKey: BALTIMORE_KEYS.jurisdiction,
    sourceKey: BALTIMORE_CODE_109_KEY,
    title: "Baltimore City Building Code §109.6 — Fee schedules for construction and trade work",
    officialUrl:
      "https://codes.baltimorecity.gov/us/md/cities/baltimore/code/building-codes/II/109",
    effectiveFrom: BALTIMORE_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: BALTIMORE_LAST_VERIFIED,
    notes:
      "The effective date recorded is the modelled date of the codified text this pass read, not a date the codification states row by row; §109 as codified carries no per-row amendment dates. The Law Library consolidates the Building Code as amended, and the section itself states the two rules that govern every row: the $25 default minimum 'unless otherwise specified' and the round-to-nearest-dollar requirement.",
  },
];

function attach(permitTypeKey: string, rules: SeedFeeRule["rule"][]): SeedFeeRule[] {
  return rules.map((rule) => ({
    jurisdictionKey: BALTIMORE_KEYS.jurisdiction,
    permitTypeKey,
    scheduleKey: BALTIMORE_KEYS.feeSchedule,
    rule,
  }));
}

const feeRules: SeedFeeRule[] = [
  ...attach("building", BALTIMORE_BUILDING_RULES),
  ...attach("electrical", BALTIMORE_ELECTRICAL_RULES),
  ...attach("plumbing", BALTIMORE_PLUMBING_RULES),
];

const requirements: SeedRequirement[] = [
  {
    jurisdictionKey: BALTIMORE_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "Gross volume, including basements and cellars",
    description:
      '§109.6.1(a)1: the fee for a new 1- or 2-family dwelling is charged on "1,000 cubic feet or fraction of 1,000 cubic feet of gross volume, including all basements and cellars." Volume is the measurement the fee lives on, so the applicant computes it from the plans before applying; for all other structures the gross volume is adjusted to exclude, per story, the volume more than 20 feet above that story\'s floor.',
    isMandatory: true,
    sortOrder: 10,
    sourceKey: BALTIMORE_CODE_109_KEY,
    lastVerifiedAt: BALTIMORE_LAST_VERIFIED,
  },
  {
    jurisdictionKey: BALTIMORE_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "Nonrefundable application fee before processing",
    description:
      "§109.5.7: before an application for any permit or certificate is processed the applicant pays a nonrefundable application fee — $25 for 1- and 2-family dwellings and $50 for all others where no construction documents are submitted for plan review, and $125 and $150 where they are.",
    isMandatory: true,
    sortOrder: 20,
    sourceKey: BALTIMORE_CODE_109_KEY,
    lastVerifiedAt: BALTIMORE_LAST_VERIFIED,
  },
  {
    jurisdictionKey: BALTIMORE_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "Work started without a permit carries a surcharge",
    description:
      "§109.5.9: a surcharge is imposed on any permit issued for work begun without a permit, beyond a permit's scope, or during suspension or after revocation — the greater of $1,000 or 50% of the permit fee in general, and $0.50 per cubic foot of the structure for unpermitted demolition, in addition to any other fine.",
    isMandatory: true,
    sortOrder: 30,
    sourceKey: BALTIMORE_CODE_109_KEY,
    lastVerifiedAt: BALTIMORE_LAST_VERIFIED,
  },
  {
    jurisdictionKey: BALTIMORE_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "other",
    title: "Branch-circuit counting conventions",
    description:
      "§109.6.2(b): a 3-wire or 4-wire branch circuit serving single-phase loads counts as 2 or 3 branch circuits respectively; a 3-wire branch circuit serving only three-phase loads, or serving a single appliance, counts as 1. The count the applicant declares is charged at $6 per circuit under those conventions.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: BALTIMORE_CODE_109_KEY,
    lastVerifiedAt: BALTIMORE_LAST_VERIFIED,
  },
  {
    jurisdictionKey: BALTIMORE_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    requirementType: "other",
    title: "Fixture count with the schedule's own prices",
    description:
      "§109.6.3(j) prices installing, replacing or reconstructing fixtures at $5 each, and names the amounts for the work around them — removal only at $20, electric water heaters at $20 each, grease interceptors at $25. The fixture count is what the fee lives on; the surrounding amounts are named on the page rather than folded into the fixture row.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: BALTIMORE_CODE_109_KEY,
    lastVerifiedAt: BALTIMORE_LAST_VERIFIED,
  },
];

const profile: SeedProfile = {
  jurisdictionKey: BALTIMORE_KEYS.jurisdiction,
  headline: "What building permits cost in Baltimore",
  summary:
    "Baltimore prices a new building on its **volume**, not its value: **$10 per 1,000 cubic feet or fraction** for a 1- or 2-family house — basement included — and **$20 per 1,000 cubic feet or fraction** for every other structure. Alterations and repairs are **$0.30 or $0.35 per square foot** of affected area, with $50 and $150 minimums. Electrical permits are priced by the service's amperage ($25-$200) plus $6 per branch circuit, and plumbing fixtures at **$5 each**. A nonrefundable application fee of $25 to $150 is due before the application is processed, and the default minimum fee is $25.",
  localContext:
    "Baltimore's whole fee schedule for construction and trade work lives in one codified section: Building Code §109, maintained by the City's own Law Library. The building side is unusual in this dataset in charging new construction by cubic feet rather than by contract value, which means two houses with the same footprint can pay different fees if their ceiling heights differ, and a valuation number alone cannot price a permit.\n\nThe schedule's small print does real work. §109.3 sets a $25 default minimum 'unless otherwise specified' and rounds every fee to the nearest dollar; the volumetric rows and the alteration rows each specify their own minimums, which override the default. The alteration rows carry exception clauses that push exterior-only work, interior-door-only work, new-tenant demising walls and shell space onto per-$1,000 pricing instead of per-square-foot pricing.\n\nThe enforcement side is unusually explicit. §109.5.9 charges the greater of $1,000 or 50% of the permit fee as a surcharge on work begun without a permit, and unpermitted demolition is surcharged at $0.50 per cubic foot of the structure — measurable, and large. §109.4 limits refunds to 50% and only on charges of $1,000 or more. None of those amounts ride the calculator, but all of them shape when an application is worth filing and when a permit is worth amending.",
  valuationBasis:
    "Three bases, none of them contract value for new work. A **new building or addition** is charged on **gross volume in cubic feet** — $10 per 1,000 cubic feet or fraction for a dwelling, $20 for everything else, the volume including basements and cellars and, above two stories, adjusted downward for space more than 20 feet above a floor. **Alterations and repairs** are charged on **affected gross floor area** at $0.30 or $0.35 per square foot or fraction, with their exception rows switching to **estimated cost** at $10 or $12 per $1,000. **Trade work** is charged on counts: service amperage, branch circuits, fixtures and devices. Nothing here derives a price from a declared project valuation.",
  notIncluded:
    "These figures are Baltimore's building, electrical and plumbing permit fees and the application fee. They are not a total project cost, and they exclude:\n\n- **Mechanical work** (§109.6.3(a)-(i)): fuel-burning equipment from $30 to $300 per unit, air conditioning at $5 per ton with a $30 minimum and $300 maximum per unit, hydronic and steam heating rows, distribution systems at $5 per 1,000 CFM, exhaust systems, pressure vessels, tanks, pumps and fire extinguishing systems — sprinklers at $35 for 1 to 25 heads and $50 per 100 heads above that.\n- **The other building rows** (§109.6.1(b)-(p)): accessory structures at $25 and $50, chimneys and towers $35-$75, retaining walls $10 per 100 square feet, fences $10 per 100 linear feet, grading $35-$75, paving $25-$85, signs $25-$250 and $1 per square foot for consolidated signage, demolition at $0.03 or $0.075 per cubic foot with $300 and $600 minimums, temporary structures $20 per year per 500 square feet, swimming pools $50 residential and $250 all others, occupancy permits $45.\n- **Service charges** (§109.5): partial permits at $10 per $1,000 of work, permit extensions, amendments at $25-$500 by scope, overtime inspections at $50 per hour with a $200 minimum, reinspections at $50, $100 and then $125, violation reports at $30.\n- **The electrical rows the calculator names but does not charge**: conduit and duct banks at $25-$100, sub feeders for additional meters $30-$200, photovoltaic systems at $25 for 1 to 25 panels plus $5 per additional 10, temporary wiring for events, and the $100 add for services over 600 volts.\n- **The plumbing rows around the fixture count**: fixture removal only at $20, electric water heaters at $20 each, grease interceptors at $25, on-site utilities at $50 per utility, private disposal systems at $100 plus $5 per fixture, lawn irrigation at $25, and the $30 annual backflow testing inspection.\n- **Water and sewer charges** set by the Department of Public Works, and DPW/DoT plan review at $100 per review, which are separate bills from the permit.\n- **Anything charged by another authority** — Maryland state licences and Baltimore County's separate jurisdiction.",
  seoTitle: "Baltimore building permit fees",
  seoDescription:
    "How Baltimore, Maryland prices building, electrical and plumbing permits — $10 or $20 per 1,000 cubic feet of volume, $0.30 or $0.35 per square foot of alterations, electrical service by amperage, and $5 per plumbing fixture.",
  publishStatus: "published",
  noindex: false,
  lastReviewedAt: BALTIMORE_LAST_VERIFIED,
};

const permitPages: SeedPermitPage[] = [
  {
    jurisdictionKey: BALTIMORE_KEYS.jurisdiction,
    permitTypeKey: "building",
    slug: "building-permit-fees",
    seoTitle: "Baltimore building permit fees",
    seoDescription:
      "Baltimore, Maryland building, electrical and plumbing permit fees — $10 or $20 per 1,000 cubic feet of volume, $0.30 or $0.35 per square foot of alterations, and $5 per plumbing fixture.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: BALTIMORE_LAST_VERIFIED,
    title: "Baltimore building permit fees",
    intro:
      "A Baltimore building permit is priced on the **volume of the structure** for new construction: **$10 per 1,000 cubic feet or fraction** for a 1- or 2-family dwelling and **$20 per 1,000 cubic feet or fraction** of adjusted volume for every other building, with minimums of $150 and $250 for new work. Alterations and repairs are priced per square foot of affected area — **$0.30** in a dwelling (minimum $50) and **$0.35** otherwise (minimum $150). A nonrefundable application fee is due before the application is processed.",
    localSummary:
      "Volume, not valuation, decides the fee on new work. The dwelling row charges each 1,000 cubic feet or fraction — so a 23,400-cubic-foot house pays for 24 thousands — and the volume includes basements and cellars. For taller structures the code adjusts the volume downward, excluding each story's space more than 20 feet above that story's floor, which is how the schedule avoids charging a decorative spire at full rate.\n\nThe alteration rows are the other half of the section. They charge the affected gross floor area, at $0.30 per square foot in a dwelling and $0.35 elsewhere, each with its own minimum. The exception clauses matter for small commercial jobs: exterior-only work, interior-door-only work, new-tenant demising walls and new-tenant shell space are priced at $12 per $1,000 of estimated cost instead, with a $150 minimum — a cheaper route for a big, low-cost fit-out.\n\nBefore any of it, §109.5.7 requires the nonrefundable application fee: $25 for a dwelling without plan review and $125 with construction documents, $50 and $150 for everything else. And §109.3 fixes the housekeeping rules every row shares — a $25 default minimum where a row specifies none, and every fee rounded to the nearest dollar.",
    notIncluded:
      "This is §109.6.1's construction-work fee and §109.5.7's application fee. It excludes:\n\n- **Mechanical, electrical and plumbing fees**, which §109.6.2 and §109.6.3 price separately and which have their own pages here.\n- **The other construction rows**: accessory structures, chimneys, retaining walls, fences, grading, paving, signs, demolition, temporary structures, moving buildings, swimming pools and occupancy permits, all of which carry flat or measured fees of their own.\n- **Service charges**: partial permits at $10 per $1,000 of work, amendments at $25-$500, extensions, overtime inspections, reinsepections and violation reports.\n- **DPW and DoT review charges** at $100 per review plus $50 per half hour of consultation, and sediment and erosion control fees set by the Department of Public Works.\n- **The no-permit surcharge** (§109.5.9) — the greater of $1,000 or 50% of the permit fee, or $0.50 per cubic foot for unpermitted demolition — which applies only when work has started without one.",
    workedExample: {
      scenario:
        "A new 1- and 2-family dwelling of 1,800 square feet per floor, two stories with 9-foot ceilings, plus an unfinished 800-square-foot basement: 1,800 x 9 x 2 = 32,400 cubic feet above grade plus 7,200 cubic feet of basement = 39,600 cubic feet of gross volume.",
      inputs: {
        occupancy: "residential",
        workType: "new_construction",
        custom: { cubic_footage: 39_600 },
      },
      notes:
        "The dwelling row charges $10 for each 1,000 cubic feet or fraction: 39.6 thousands rounds up to 40, so the permit fee is 40 x $10.00 = $400.00, which is above the $150.00 new-building minimum, so the minimum does not bite.\n\nThe application fee adds $125.00 — §109.5.7's plan-review amount for a 1- and 2-family dwelling — for a total of $525.00.\n\nRead the same house at a 10-foot ceiling and the volume rises to 44,000 cubic feet and the fee to $440.00: ceiling height, not contract price, is what moves a Baltimore new-home permit.",
    },
    faqs: [
      {
        question: "How much is a building permit for a new house in Baltimore?",
        answer:
          "$10 for each 1,000 cubic feet or fraction of gross volume, including basements and cellars, with a $150 minimum for a new building. A two-story, 1,800-square-foot house with 9-foot ceilings and an 800-square-foot basement is 39,600 cubic feet, which charges as 40 thousands — $400.00.",
      },
      {
        question: "How is volume computed, and is the basement counted?",
        answer:
          "For 1- and 2-family dwellings the fee is charged on gross volume including all basements and cellars. For all other structures the code adjusts the gross volume to exclude, for each story, the volume more than 20 feet above that story's floor.",
      },
      {
        question: "How much is an alteration or repair permit?",
        answer:
          "$0.30 per square foot or fraction of affected gross floor area in a 1- or 2-family dwelling, minimum $50, and $0.35 per square foot for all other work, minimum $150. Exterior-only alterations and interior-door-only work are priced at $10 or $12 per $1,000 of estimated cost instead.",
      },
      {
        question: "Is there an application fee before the permit fee?",
        answer:
          "Yes. §109.5.7 requires a nonrefundable application fee before the application is processed: $25 for 1- and 2-family dwellings and $50 for all others without construction documents for plan review, and $125 and $150 with them. It is separate from, and additional to, the permit fee.",
      },
      {
        question: "What is the minimum fee for any Baltimore permit?",
        answer:
          "§109.3 sets the default at $25 unless a row specifies otherwise — and most rows do specify: $150 for a new dwelling, $250 for a new other structure, $50 and $150 for alterations. Every fee is rounded to the nearest dollar.",
      },
      {
        question: "What happens if I start work without a permit?",
        answer:
          "§109.5.9 imposes a surcharge of the greater of $1,000 or 50% of the permit fee for work begun or completed without a permit, beyond a permit's scope, or during suspension or after revocation. Unpermitted demolition is surcharged at $0.50 per cubic foot of the structure. The surcharge is in addition to any other fine, and an unpaid one becomes a lien.",
      },
      {
        question: "Can I get a refund if I cancel a permit?",
        answer:
          "Only within limits: if no work has been done and no privilege enjoyed, a refund of not more than 50% of the fee may be granted, and no refund at all is granted on any fee or charge of less than $1,000. A full refund applies only where the Building Official revoked a permit for the City's own administrative error.",
      },
      {
        question: "How much does an addition to a house cost to permit?",
        answer:
          "The same $10 per 1,000 cubic feet or fraction as a new house, with a $75 minimum for additions rather than the $150 new-building minimum. A 12,000-cubic-foot addition charges as 12 thousands, or $120.00, which is above the $75 floor.",
      },
      {
        question: "Do I pay separately for electrical and plumbing work?",
        answer:
          "Yes. §109.2 provides that the building permit fee does not relieve the applicant of the fees for electrical permits, plumbing and other appurtenant work — each trade permit is its own fee under §109.6.2 and §109.6.3.",
      },
      {
        question: "What if my project needs a partial permit?",
        answer:
          "A partial permit is charged at $10 per $1,000 worth of work up to $1,000,000 and $5 per $1,000 above that, with a $100 minimum for 1- and 2-family dwellings and $250 for all other structures — a separate rate schedule from the volumetric building row.",
      },
      {
        question: "Are commercial and residential fees different?",
        answer:
          "Yes, in two ways. The volumetric rate doubles — $20 versus $10 per 1,000 cubic feet — and the minimums rise from $150/$75 to $250/$150. Alterations are $0.35 versus $0.30 per square foot with a $150 versus $50 minimum. The application fee is $50 or $150 for non-dwellings against $25 or $125 for dwellings.",
      },
      {
        question: "How fast does a permit expire, and what does an extension cost?",
        answer:
          "An application for extension made within 90 days after expiry costs $25. Between 31 and 90 days after expiry the extension costs 50% of the original permit fee, or the applicant may apply for a new permit priced on the remaining work.",
      },
    ],
  },
  {
    jurisdictionKey: BALTIMORE_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    slug: "electrical-permit-fees",
    seoTitle: "Baltimore electrical permit fees",
    seoDescription:
      "Baltimore electrical permit fees by service amperage ($25-$200), $6 per branch circuit, and $25 blocks of fixtures or devices.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: BALTIMORE_LAST_VERIFIED,
    title: "Baltimore electrical permit fees",
    intro:
      "Baltimore prices electrical permits from the **service's amperage**: **$25** for a service up to 100 amperes, climbing through the schedule to **$200** above 2,000 amperes, with **$100 added** for services over 600 volts. New branch circuits are **$6 each**, and permits for fixtures or devices only are **$25 for the first 25** plus **$5 per additional 25 or fraction**. The default minimum fee is $25.",
    localSummary:
      "The amperage table is the row most residential permits land on: 0-100 A $25, over 100-200 $30, over 200-400 $40, over 400-800 $60, over 800-1,000 $100, over 1,000-2,000 $150, over 2,000 $200. It includes the meter connection, and sub feeders for additional meters carry a similar table starting $5 higher at the bottom. The 600-volt add-on catches the commercial services that sit above the ordinary 120/208 and 120/240 systems.\n\nThe circuit row is where a wiring job adds up: $6 per branch circuit, with counting conventions printed in the code — a 3-wire or 4-wire circuit serving single-phase loads counts as two or three circuits respectively, which prevents a multiwire run from being declared as one. A fixtures-or-devices-only permit is block-priced: $25 for the first 25, then $5 for each additional block of 25 or fraction.\n\nThe small rows matter on niche jobs: conduit and duct banks at $25-$100 by length, photovoltaic systems at $25 for 1 to 25 panels plus $5 per additional 10, and temporary wiring for events at $20 or $25 per 5 kilowatts of feeder capacity — with the fee waived entirely for nonprofit events that document their status.",
    notIncluded:
      "This is §109.6.2's electrical fee and the §109.3 default minimum. It excludes:\n\n- **Service ratings the calculator names but does not band**: the model charges the $30.00 row that covers a 200-ampere dwelling service; a 400-ampere service is $40.00, an 800-ampere service $60.00, and the larger ratings sit above them in the same table.\n- **Conduit and duct bank installation** at $25, $50 or $100 by length, and **sub feeders for additional meters** at $30-$200 by amperage.\n- **Photovoltaic systems** at $25 for 1 to 25 panels plus $5 per additional 10 or fraction, and the $100 add for services over 600 volts.\n- **Temporary electrical wiring** for events at $20 or $25 per 5 kilowatts, waived for qualifying nonprofit events.\n- **Reinspection fees** at $50, $100 and $125, and **overtime inspections** at $50 per hour with a $200 minimum per inspector.\n- **The application fee** under §109.5.7, which attaches to the construction permit application the electrical work rides on where one exists, and is charged on the building page here.",
    workedExample: {
      scenario:
        "A 200-ampere residential service upgrade plus 6 new branch circuits on the same permit.",
      inputs: {
        occupancy: "residential",
        custom: { circuits: 6, amperage: 200 },
      },
      notes:
        "The service row charges $30.00 — §109.6.2(a)1's 'over 100 to 200' amperage band, which includes the meter connection.\n\nThe circuit row charges 6 circuits x $6.00 = $36.00.\n\nThe total is $66.00, which is above the $25.00 default minimum, so no floor applies. A fixtures-only rewire of up to 25 devices would have been $25.00 flat; a service-only swap with no new circuits would have been $30.00.",
    },
    faqs: [
      {
        question: "How much is an electrical permit for a 200-amp service upgrade?",
        answer:
          "$30.00 — the 'over 100 to 200 amperes' row of the service table, which covers installing, replacing or relocating the service wiring and equipment including the meter connection.",
      },
      {
        question: "How much is each new branch circuit?",
        answer:
          "$6.00 per circuit. A 3-wire or 4-wire branch circuit serving single-phase loads counts as 2 or 3 circuits respectively; a 3-wire circuit serving only three-phase loads or a single appliance counts as 1.",
      },
      {
        question: "What does a fixtures-only electrical permit cost?",
        answer:
          "$25.00 for 1 to 25 fixtures or devices, plus $5.00 for each additional 25 or fraction of 25. Sixty devices would be $25.00 plus two $5.00 blocks — $35.00.",
      },
      {
        question: "Is there a minimum electrical permit fee?",
        answer:
          "Yes — §109.3's default $25.00 minimum applies unless a row specifies otherwise, and the lowest electrical rows already sit at or above it.",
      },
      {
        question: "How much is a large commercial service permit?",
        answer:
          "$40.00 up to 400 amperes, $60.00 to 800, $100.00 to 1,000, $150.00 to 2,000 and $200.00 above that, with $100.00 added for services over 600 volts.",
      },
      {
        question: "What about solar panels?",
        answer:
          "A photovoltaic system of 1 to 25 panels is $25.00, plus $5.00 for each additional 10 panels or fraction of 10 — a separate row from the service table.",
      },
      {
        question: "Do I need a separate permit for conduit-only work?",
        answer:
          "Yes — installing conduits and duct banks only is $25.00 up to 200 feet, $50.00 to 1,000 feet and $100.00 above that, independent of the service and circuit rows.",
      },
      {
        question: "Is the electrical fee included in the building permit?",
        answer:
          "No. §109.2 provides that paying the building fee does not relieve the applicant of electrical permit fees — a permit for the building work and a permit for the electrical work are charged separately.",
      },
      {
        question: "What does a failed inspection cost?",
        answer:
          "A first reinspection is $50.00, a second $100.00 and a third or subsequent $125.00, payable in advance. An inspection scheduled outside normal working hours is $50.00 per hour per inspector with a $200.00 minimum.",
      },
      {
        question: "Are event permits for temporary wiring available?",
        answer:
          "Yes — temporary wiring for bazaars, fairs, displays and similar assemblies is $20.00 per 5 kilowatts or fraction of feeder capacity, and the fee is waived entirely where the net proceeds benefit a qualifying tax-exempt nonprofit that documents its status.",
      },
    ],
  },
  {
    jurisdictionKey: BALTIMORE_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    slug: "plumbing-permit-fees",
    seoTitle: "Baltimore plumbing permit fees",
    seoDescription:
      "Baltimore plumbing permit fees at $5 per fixture, $25 or $50 service connections, and $25 or $100 backflow devices.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: BALTIMORE_LAST_VERIFIED,
    title: "Baltimore plumbing permit fees",
    intro:
      "Baltimore prices plumbing permits at **$5 per fixture** installed, replaced or reconstructed, with the service and connection rows alongside: water service, sanitary and storm connections at **$25** in 1- and 2-family dwellings and **$50** for all other work. Backflow prevention devices are **$25** installed below 2 inches and **$100** at 2 inches or larger. The default minimum fee is $25.",
    localSummary:
      "The fixture row is the section's spine: $5 each to install, replace or reconstruct a plumbing fixture, so a two-bathroom remodel with ten fixtures is $50.00 on the fixture row alone. The rows around it are flat: removing fixtures only is $20, electric water heaters are $20 each, grease interceptors are $25, and lawn irrigation systems are $25.\n\nThe utility connections are where dwelling and non-dwelling rates split — water service pipe, sanitary connection and storm water connection each at $25 in 1- and 2-family dwellings and $50 for all other work, with on-site utilities at $50 per utility and line reconstruction at $20 per utility. Private disposal systems — septic tanks, dry wells, drain fields — are $100 plus $5 per fixture.\n\nBackflow protection has its own economics: $25 to install a device under 2 inches, $100 at 2 inches or more, and a $30 annual testing inspection that recurs for the life of the device. Gas piping is not here — it sits in the mechanical schedule at $25 residential and $50 otherwise.",
    notIncluded:
      "This is §109.6.3(j)'s plumbing and on-site utilities fee and the §109.3 default minimum. It excludes:\n\n- **Fixture removal only** at $20.00 and **electric water heaters** at $20.00 each, which the calculator names but does not add to the fixture count.\n- **Grease interceptors** at $25.00, **private disposal systems** at $100 plus $5 per fixture, **lawn irrigation** at $25.00 and the **$30.00 annual backflow testing inspection**.\n- **On-site utilities** at $50.00 per utility new or reconstructed, line reconstruction at $20.00 per utility, and capping off lines at $50.00 per utility.\n- **Storm water and sanitary connections for non-dwelling work** at $50.00 each — the model charges the $25.00 dwelling rows.\n- **Gas piping**, which §109.6.3(a) prices under mechanical work at $25.00 in a dwelling and $50.00 otherwise.\n- **Reinspection fees** at $50, $100 and $125, and the **application fee** under §109.5.7 charged on the building page here.",
    workedExample: {
      scenario:
        "A residential bathroom addition on a 1- and 2-family dwelling: 5 new plumbing fixtures plus a new water service pipe to the addition.",
      inputs: {
        occupancy: "residential",
        fixtures: 5,
      },
      notes:
        "The fixture row charges 5 fixtures x $5.00 = $25.00 — §109.6.3(j)'s 'install, replace, or reconstruct plumbing fixtures' row.\n\nThe water service row adds $25.00, the 1- and 2-family amount for a new or replacement water service pipe.\n\nThe total is $50.00, above the $25.00 default minimum. The same five fixtures with no water service would be $25.00; the same job in a non-dwelling would carry a $50.00 water service row instead.",
    },
    faqs: [
      {
        question: "How much is a plumbing permit in Baltimore?",
        answer:
          "The fixture row is $5.00 per plumbing fixture installed, replaced or reconstructed. A one-bathroom remodel of three fixtures is $15.00; a full two-bathroom job of ten fixtures is $50.00 — plus the service and connection rows the job actually needs.",
      },
      {
        question: "How much is a new water service pipe?",
        answer:
          "$25.00 in a 1- or 2-family dwelling and $50.00 for all other work, new or replacement. The sanitary and storm water connections carry the same amounts.",
      },
      {
        question: "What does a water heater permit cost?",
        answer:
          "An electric water heater, new or replacement, is $20.00 per heater. A gas water heater connection sits in the mechanical schedule instead, at $25.00 residential.",
      },
      {
        question: "How much is a backflow prevention device?",
        answer:
          "$25.00 to install a device less than 2 inches in diameter and $100.00 for 2 inches or more. Annual testing inspections are $30.00 and recur for the life of the device.",
      },
      {
        question: "Is there a minimum plumbing permit fee?",
        answer:
          "Yes — §109.3's $25.00 default minimum applies unless a row specifies otherwise, which floors the smallest fixture-only permits.",
      },
      {
        question: "Do repairs to a sewer line cost more?",
        answer:
          "Reconstructing water, sanitary or storm lines on premises is $20.00 per utility, and capping off lines is $50.00 per utility. A city-installed connection is a DPW charge, not a permit fee.",
      },
      {
        question: "What about a septic system?",
        answer:
          "Private disposal systems — septic tanks, dry wells and drain fields — are $100.00 plus $5.00 per plumbing fixture served.",
      },
      {
        question: "Is gas piping on the plumbing permit?",
        answer:
          "No. Fuel oil or natural gas piping, new or replacement, is priced under mechanical work at $25.00 for 1- and 2-family dwellings and $50.00 for all other work.",
      },
      {
        question: "How much for a grease trap in a restaurant?",
        answer:
          "$25.00 per grease interceptor. Oil interceptors and water conditioning units are named on the same subsection's rows.",
      },
      {
        question: "Do subcontractors pull their own permits?",
        answer:
          "The trade fees are per permit, and §109.2 keeps them separate from the building fee — a plumbing contractor files the plumbing permit and pays the plumbing fee rather than riding the general contractor's building permit.",
      },
    ],
  },
];

const verifications: SeedVerification[] = [
  {
    entityType: "source",
    entityKey: BALTIMORE_CODE_109_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: BALTIMORE_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BALTIMORE_CODE_109_KEY,
    notes:
      "Read 2026-09-26 from the City's Law Library codification, HTTP 200. §109.6.1's volumetric and per-square-foot rows transcribed with their minimums and exception clauses; §109.6.2's service, circuit and fixture rows transcribed with their counting conventions; §109.6.3(j)'s plumbing and utility rows transcribed fixture by fixture; §109.3, §109.4, §109.5.7 and §109.5.9 read for the minimum, refund, application-fee and surcharge rules.",
  },
  {
    entityType: "source",
    entityKey: BALTIMORE_PERMIT_CENTER_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: BALTIMORE_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BALTIMORE_PERMIT_CENTER_KEY,
    notes:
      "Read 2026-09-26. Used to identify the issuing department (DHCD, Office of the Building Official) and the application route through the One-Stop Permit Center; no fee amount sourced here.",
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-NEW-RES",
    permitTypeKey: "building",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: BALTIMORE_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BALTIMORE_CODE_109_KEY,
    notes:
      "§109.6.1(a)1: $10 per 1,000 cubic feet or fraction of gross volume including basements and cellars, $150 new-building minimum. Charged as one cent per tenth of a cubic foot so the fraction-of-a-thousand rounding is exact without a compensating factor.",
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-NEW-OTHER",
    permitTypeKey: "building",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: BALTIMORE_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BALTIMORE_CODE_109_KEY,
    notes:
      "§109.6.1(a)2: $20 per 1,000 cubic feet or fraction of adjusted gross volume, $250 new-building minimum. The 20-feet-above-floor adjustment is described as a requirement the applicant applies before entering the volume.",
  },
  {
    entityType: "fee_rule",
    entityKey: "ELEC-SERVICE",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: BALTIMORE_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BALTIMORE_CODE_109_KEY,
    notes:
      "§109.6.2(a)1: the model charges the $30.00 'over 100 to 200 amperes' row, the one a 200-ampere dwelling service lands on; the other six ratings of the table are named in the rule's description rather than folded into a band the schedule does not print as a formula.",
  },
  {
    entityType: "fee_rule",
    entityKey: "PLUMB-FIXTURES",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: BALTIMORE_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BALTIMORE_CODE_109_KEY,
    notes:
      "§109.6.3(j): $5 each to install, replace or reconstruct plumbing fixtures, charged per fixture with the surrounding flat rows named rather than modelled.",
  },
  {
    entityType: "jurisdiction_profile",
    entityKey: BALTIMORE_KEYS.jurisdiction,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: BALTIMORE_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BALTIMORE_CODE_109_KEY,
    notes:
      "Hub content built from Building Code §109 in full. The profile states the reading the model depends on — volume, not valuation, for new construction — and names the mechanical schedule, the unmodelled building rows, the service charges, the DPW review charges and the state-level charges as published and out of scope.",
  },
  {
    entityType: "permit_page",
    entityKey: "building-permit-fees",
    permitTypeKey: "building",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: BALTIMORE_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BALTIMORE_CODE_109_KEY,
    notes:
      "Recorded for the editorial gate: this page's prose, sources and fee-rule mapping were checked against the schedule published by Mayor and City Council of Baltimore during the research pass that produced this seed; the seed's content tests assert the arithmetic. No amount on this page is estimated.",
  },
  {
    entityType: "permit_page",
    entityKey: "electrical-permit-fees",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: BALTIMORE_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BALTIMORE_CODE_109_KEY,
    notes:
      "Recorded for the editorial gate: this page's prose, sources and fee-rule mapping were checked against the schedule published by Mayor and City Council of Baltimore during the research pass that produced this seed; the seed's content tests assert the arithmetic. No amount on this page is estimated.",
  },
  {
    entityType: "permit_page",
    entityKey: "plumbing-permit-fees",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: BALTIMORE_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BALTIMORE_CODE_109_KEY,
    notes:
      "Recorded for the editorial gate: this page's prose, sources and fee-rule mapping were checked against the schedule published by Mayor and City Council of Baltimore during the research pass that produced this seed; the seed's content tests assert the arithmetic. No amount on this page is estimated.",
  },
];

export const baltimoreSeed: JurisdictionSeed = {
  state,
  county,
  jurisdiction,
  departments,
  sources,
  permitTypes,
  projectTypes,
  jurisdictionPermitTypes,
  feeSchedules,
  feeRules,
  requirements,
  profile,
  permitPages,
  verifications,
};

/** Permit pages that clear the editorial gate, for use in tests without a database. */
export const BALTIMORE_PUBLISHED_PERMIT_PAGES = baltimoreSeed.permitPages.filter(
  (page) => page.publishStatus === "published" && !page.noindex,
);
