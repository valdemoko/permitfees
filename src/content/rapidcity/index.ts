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
  RC_BUILDING_RULES,
  RC_CODE_SOURCE_KEY,
  RC_ELECTRICAL_RULES,
  RC_PLUMBING_RULES,
  RC_TABLES_EFFECTIVE_FROM,
  RC_TABLES_SOURCE_KEY,
} from "./fee-rules";

export * from "./fee-rules";

/**
 * The complete Rapid City, South Dakota seed payload.
 *
 * Every figure traces to research/south-dakota/rapid-city.md, which traces to
 * the two Table PDFs Building Services publishes (Table 100-A residential and
 * Table 100-C commercial, read from the Wayback captures of the city's own
 * URLs after the live host's Cloudflare challenge blocked scripted retrieval)
 * and to RCMC § 15.04.320, which delegates the amounts to "resolution of the
 * Common Council".
 *
 * Three pages, all published: building, electrical, plumbing.
 */

const RESEARCHER = "Permit Fee Intelligence — South Dakota pass (Rapid City)";

export const RAPID_CITY_LAST_VERIFIED = "2026-09-26";

export const RAPID_CITY_KEYS = {
  state: "sd",
  county: "pennington-county",
  jurisdiction: "rapid-city",
  schedule: "rapid-city-fee-tables",
} as const;

const state: SeedState = {
  code: "SD",
  slug: "south-dakota",
  name: "South Dakota",
  fipsCode: "46",
};

const county: SeedCounty = {
  key: RAPID_CITY_KEYS.county,
  slug: "pennington-county",
  name: "Pennington County",
  fipsCode: "46103",
};

const jurisdiction: SeedJurisdiction = {
  key: RAPID_CITY_KEYS.jurisdiction,
  stateKey: RAPID_CITY_KEYS.state,
  countyKey: RAPID_CITY_KEYS.county,
  type: "city",
  slug: "rapid-city",
  name: "Rapid City",
  officialName: "City of Rapid City — Building Services Division (Community Development)",
  websiteUrl:
    "https://www.rcgov.org/departments/community-planning-development/building-services/building-permits-fee-information-364.html",
  permitPortalUrl: "https://www.rcgov.org/departments/community-planning-development/building-services",
  timezone: "America/Denver",
  isActive: true,
};

const departments: SeedDepartment[] = [
  {
    key: "rapid-city-building-services",
    jurisdictionKey: RAPID_CITY_KEYS.jurisdiction,
    kind: "building",
    name: "Building Services Division (Community Development Department)",
    phone: "(605) 394-4120",
    email: "building@rcgov.org",
    url: "https://www.rcgov.org/departments/community-planning-development/building-services",
    addressLine: "300 6th Street, Rapid City, SD 57701",
    hours: "Monday – Friday, 8:00 a.m. – 5:00 p.m. MT",
    notes:
      "Building Services issues permits under RCMC Title 15 (IBC 2021, IRC 2021, state-adopted NEC and 2015 UPC, with city amendments in Chapters 15.04, 15.16, 15.20, 15.24 and 15.26). Fee amounts are set by Common Council resolution — § 15.04.320 prints none — and the operative tables are the two PDFs on the Building Permits Fee Information page.",
  },
];

const sources: SeedSource[] = [
  {
    key: RC_TABLES_SOURCE_KEY,
    jurisdictionKey: RAPID_CITY_KEYS.jurisdiction,
    title: "City of Rapid City fee tables — Table 100-A (Residential Permit Fees) and Table 100-C (Commercial Permit Fees)",
    url: "https://www.rcgov.org/index.php?option=com_docman&view=download&alias=452-bilding-permits-residential-permit-fees&category_slug=building-permits-inspections-information&Itemid=149",
    sourceType: "fee_schedule_pdf",
    issuingAuthority: "City of Rapid City — Building Services",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2016-01-01",
    effectiveFrom: RC_TABLES_EFFECTIVE_FROM,
    retrievedAt: RAPID_CITY_LAST_VERIFIED,
    lastVerifiedAt: RAPID_CITY_LAST_VERIFIED,
    notes:
      "Read 2026-09-26 from the Internet Archive captures of the city's own URLs (Wayback 2024-11-26 and 2025-04-30) after rcgov.org's Cloudflare challenge blocked scripted retrieval; the live Building Permits Fee Information page confirms both PDFs are the tables the city publishes today. Table 100-A: eight residential bands from a $37.00 flat to $3,539.50 base above $1,000,000, plus the 10% dwelling plan-review row and $42.00/hr event rows. Table 100-C: eight commercial bands from the same $37.00 flat to $5,608.75 base above $1,000,000, plus the 50% plan-review row and $47.00/hr event rows. Printed typos ('$500,00.00', '$100,000.000') resolved by the ladders' own chaining.",
  },
  {
    key: RC_CODE_SOURCE_KEY,
    jurisdictionKey: RAPID_CITY_KEYS.jurisdiction,
    title: "Rapid City Municipal Code, Title 15 — §§ 15.04.320 (permit fees by council resolution), 15.16 (Electrical), 15.24 (Plumbing)",
    url: "https://rapidcity.municipal.codes/RCMC/15.04.320",
    sourceType: "municipal_code",
    issuingAuthority: "City of Rapid City",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2024-01-01",
    effectiveFrom: RC_TABLES_EFFECTIVE_FROM,
    retrievedAt: RAPID_CITY_LAST_VERIFIED,
    lastVerifiedAt: RAPID_CITY_LAST_VERIFIED,
    notes:
      "Read 2026-09-26. § 15.04.320 prints no amounts: fees 'shall be determined by resolution of the Common Council', and work commenced before permit issuance pays double (emergency exception). Chapter 15.16 states the electrical permit floor ('a permit is required for fees equal to or greater than $10') and the homeowner-permit regime; Chapter 15.24 adopts the 2015 UPC; Chapter 15.28 is repealed. No trade chapter prints a fee table — the council resolution documents behind the two Table PDFs price everything, MEP work included inside the building permit's § 15.04.170 valuation definition.",
  },
];

/** Empty on purpose: the permit types Rapid City uses already exist as shared rows. */
const permitTypes: JurisdictionSeed["permitTypes"] = [];
const projectTypes: JurisdictionSeed["projectTypes"] = [];

const jurisdictionPermitTypes: SeedJurisdictionPermitType[] = [
  {
    jurisdictionKey: RAPID_CITY_KEYS.jurisdiction,
    permitTypeKey: "building",
    isAvailable: true,
    localName: "Building permit — Table 100-A/100-C valuation ladders by occupancy",
    officialUrl:
      "https://www.rcgov.org/departments/community-planning-development/building-services/building-permits-fee-information-364.html",
    notes:
      "Declared valuation climbs the occupancy's table: residential Table 100-A from a $37.00 flat band ($1–$1,600) through a one-dollar-wide $1,601–$2,000 sliver to a $3,539.50 base above $1,000,000; commercial Table 100-C from the same flat to a $5,608.75 base. Every excess rounds up to whole $1,000 ('or fraction thereof'), and every seam above $2,000 chains exactly on both tables. Plan review: 10% of the permit fee for 1–2 family dwellings and accessory structures, 50% for all other occupancies — printed identically on both tables.",
  },
  {
    jurisdictionKey: RAPID_CITY_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    isAvailable: true,
    localName: "Electrical-scale permits — priced through the building permit's Table 100-C by declared valuation",
    officialUrl: "https://rapidcity.municipal.codes/RCMC/15.16",
    notes:
      "Rapid City's adopted electrical chapter (NEC amendments, permit floor $10) prints no fee table — § 15.04.320 delegates every amount to Common Council resolution, and the only published permit-fee tables are the building ladders. A stand-alone trade-scale job on an existing building prices as a building permit application by declared valuation on Table 100-C. The homeowner-permit regime (owner-performed wiring, demonstrated competency, 6-month validity) and the sub-$10 exemption are administrative rules outside the ladder.",
  },
  {
    jurisdictionKey: RAPID_CITY_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    isAvailable: true,
    localName: "Plumbing-scale permits — priced through the building permit's Table 100-C by declared valuation",
    officialUrl: "https://rapidcity.municipal.codes/RCMC/15.24",
    notes:
      "The 2015 UPC adoption (Chapter 15.24) likewise prints no fee table. The same council-resolution mechanism prices plumbing work through the building permit's Table 100-C ladder by declared valuation, with the 50% plan review attaching on building-permit submittals.",
  },
];

const feeSchedules: SeedFeeSchedule[] = [
  {
    key: RAPID_CITY_KEYS.schedule,
    jurisdictionKey: RAPID_CITY_KEYS.jurisdiction,
    sourceKey: RC_TABLES_SOURCE_KEY,
    title: "Rapid City fee Tables 100-A / 100-C (published 2016, operative on the Building Services fee page)",
    officialUrl:
      "https://www.rcgov.org/index.php?option=com_docman&view=download&alias=452-bilding-permits-residential-permit-fees&category_slug=building-permits-inspections-information&Itemid=149",
    effectiveFrom: RC_TABLES_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: RAPID_CITY_LAST_VERIFIED,
    notes:
      "The tables carry a 2016 publication date and remain the operative schedule the Building Permits Fee Information page links today; § 15.04.320 is the enabling authority. The residential table's $2,000 seam does not chain ($39.00 at band 2's ceiling vs band 3's $45.00 base at $2,001) — modelled as printed; every other seam on both tables chains to the cent.",
  },
];

function attach(
  permitTypeKey: string,
  rules: SeedFeeRule["rule"][],
  scheduleKey: string,
): SeedFeeRule[] {
  return rules.map((rule) => ({
    jurisdictionKey: RAPID_CITY_KEYS.jurisdiction,
    permitTypeKey,
    scheduleKey,
    rule,
  }));
}

const feeRules: SeedFeeRule[] = [
  ...attach("building", RC_BUILDING_RULES, RAPID_CITY_KEYS.schedule),
  ...attach("electrical", RC_ELECTRICAL_RULES, RAPID_CITY_KEYS.schedule),
  ...attach("plumbing", RC_PLUMBING_RULES, RAPID_CITY_KEYS.schedule),
];

const requirements: SeedRequirement[] = [
  {
    jurisdictionKey: RAPID_CITY_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "document",
    title: "The valuation is declared, and it includes the trades",
    description:
      "§ 15.04.170: the application must 'state the construction valuation of any new building, structure, addition, remodeling or alteration' — finish work, roofing, electrical, plumbing, heating, elevators and permanent equipment in; site improvements out. The declared figure walks the occupancy's table.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: RC_CODE_SOURCE_KEY,
    lastVerifiedAt: RAPID_CITY_LAST_VERIFIED,
  },
  {
    jurisdictionKey: RAPID_CITY_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "Work begun before the permit pays double",
    description:
      "§ 15.04.300: any person who commences work requiring a permit before obtaining one must 'pay double the permit fee fixed by this section for the work', with an emergency exception the building official administers.",
    isMandatory: true,
    sortOrder: 20,
    sourceKey: RC_CODE_SOURCE_KEY,
    lastVerifiedAt: RAPID_CITY_LAST_VERIFIED,
  },
  {
    jurisdictionKey: RAPID_CITY_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "other",
    title: "Trade-scale stand-alone work prices through the building permit",
    description:
      "Chapter 15.16 prints no fee table and sets the floor: 'a permit is required for fees equal to or greater than $10.' Amounts come from the Common Council resolution the two Table PDFs publish; a stand-alone electrical job prices by declared valuation on Table 100-C. Owner-performed wiring uses the homeowner-permit regime (demonstrated competency, 6-month validity).",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: RC_TABLES_SOURCE_KEY,
    lastVerifiedAt: RAPID_CITY_LAST_VERIFIED,
  },
  {
    jurisdictionKey: RAPID_CITY_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    requirementType: "other",
    title: "The plumbing chapter adopts the state code; the tables price the work",
    description:
      "Chapter 15.24 adopts the 2015 UPC with city amendments and, like the electrical chapter, prints no fee amounts — the Table 100-C ladder prices declared plumbing valuations. Permits expire if work is not commenced within 180 days, and the refund section caps refunds at 80% within 180 days.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: RC_TABLES_SOURCE_KEY,
    lastVerifiedAt: RAPID_CITY_LAST_VERIFIED,
  },
];

const profile: SeedProfile = {
  jurisdictionKey: RAPID_CITY_KEYS.jurisdiction,
  headline: "What construction permits cost in Rapid City",
  summary:
    "Rapid City permits are issued by **Building Services** under RCMC Title 15, and the amounts live in two one-page tables the division publishes — **Table 100-A** for residential work, **Table 100-C** for everything else. Both start at a **$37.00 flat band** ($1–$1,600) and climb eight bands to a **$3,539.50** (residential) or **$5,608.75** (commercial) base above $1,000,000, with every excess rounded up to whole $1,000. Plan review adds **10% of the permit fee** for 1–2 family dwellings and **50% for all other occupancies**. The adopted trade codes print no fee tables — § 15.04.320 delegates every amount to **Common Council resolution**.",
  localContext:
    "Rapid City is a resolution-priced city: the municipal code never prints a fee. § 15.04.320 says every fee 'shall be determined by resolution of the Common Council', and the operative resolution documents are the two Table PDFs on Building Services' fee page — published in 2016 and still linked today. Their quality control is their own chaining: every band's printed base equals the band below run to its ceiling, so a misread digit shows up immediately as a broken seam. One real seam breaks — residential band 2's $39.00 at $2,000 against band 3's $45.00 at $2,001 — and the tables print it that way.\n\nThe plan-review pair is printed identically on both tables: 10% for 1–2 family dwellings and accessory structures, 50% for everything else. On a $320,000 house that is $140.95; on a $60,000 commercial build-out it is $356.88 — plan review at half the permit fee is the sharpest percentage in this dataset.\n\nThe trades ride the building permit too. The adopted electrical (NEC), plumbing (2015 UPC), mechanical and gas chapters amend technical provisions but price nothing; a stand-alone trade-scale job on an existing building is a building-permit application priced by declared valuation on Table 100-C. Chapter 15.16's floor — permits required for fees of $10 or more — and its homeowner-permit regime are the only trade-specific fee rules in the code.",
  valuationBasis:
    "One basis: **declared construction valuation** under § 15.04.170 — all construction work plus finish work, roofing, electrical, plumbing, heating, elevators and permanent equipment, excluding site improvements and parking lots. The declared figure walks Table 100-A (residential occupancy) or Table 100-C (everything else), each band's excess rounding up to whole $1,000. Plan review computes on the computed permit fee.",
  notIncluded:
    "These figures are the City's own permit amounts. They are not a project cost, and they exclude:\n\n- **Event and hourly fees** — inspections outside business hours, reinspection, and additional plan review at $42.00/hr (residential, 2-hour minimums) or $47.00/hr (commercial, 1-hour minimums), plus outside consultants at actual cost.\n- **The doubling rule** — work commenced before permit issuance pays double the permit fee (§ 15.04.300, emergency exception).\n- **Development-application and air-quality fees** — $250 conditional use / variance / plat final, $2,500 TIF, air-quality construction permits $75–$100.\n- **Permit-renewal fees** — also 'determined by resolution of the Common Council', not in the published tables.\n- **The electrical homeowner-permit regime's administrative terms** and the sub-$10 electrical permit exemption.",
  seoTitle: "Rapid City permit fees — Table 100-A and 100-C valuation ladders",
  seoDescription:
    "How Rapid City prices construction permits: the $37-to-$5,608.75 Table 100-A/100-C ladders by occupancy, 'or fraction thereof' round-ups, and the 10%/50% plan-review pair.",
  publishStatus: "published",
  noindex: false,
  lastReviewedAt: RAPID_CITY_LAST_VERIFIED,
};

const permitPages: SeedPermitPage[] = [
  {
    jurisdictionKey: RAPID_CITY_KEYS.jurisdiction,
    permitTypeKey: "building",
    slug: "building-permit-cost",
    title: "Rapid City building permit cost",
    intro:
      "A Rapid City building permit climbs **one of two tables by occupancy**. Residential work walks **Table 100-A**: a **$37.00 flat band to $1,600**, then bands chaining to a **$3,539.50 base above $1,000,000**. Commercial work walks **Table 100-C** to a **$5,608.75 base**. Every band's excess rounds up to whole $1,000 ('or fraction thereof'). Plan review adds **10% of the permit fee for 1–2 family dwellings** — and **50% for all other occupancies**, the sharpest review percentage in the region.",
    localSummary:
      "The valuation is declared on the application — § 15.04.170's construction-valuation definition sweeps in finish work, roofing, all three trades, elevators and permanent equipment, and excludes only site improvements and parking lots. What the applicant declares is what walks the table.\n\nThe ladders' discipline is their chaining. Commercial: $69.25 + 23 × $14.00 is $391.25, $391.25 + 25 × $10.10 is $643.75, and so on to $5,608.75 — every seam exact. Residential chains the same way above $2,000; its one broken seam is printed that way: band 2 tops out at $39.00 at $2,000 exactly, and band 3's base at $2,001 is $45.00.\n\nPlan review is a pair of rows printed on both tables: 10% of the building permit fee for 1–2 family dwellings and accessory structures, 50% for all occupancies except those. Changed plans trigger additional review at the hourly event rates — $42.00 residential, $47.00 commercial.",
    notIncluded:
      "This is the building permit fee. It excludes:\n\n- **Event and hourly fees** — after-hours inspections, reinspection, and additional plan review at $42.00/$47.00 per hour.\n- **The doubling rule** — starting work before the permit issues doubles the permit fee (§ 15.04.300).\n- **Development-application and air-quality fees** — planning fees and the $75–$100 air-quality construction permits, on other schedules.\n- **Trade-scale stand-alone work** — priced through the same tables; see the electrical and plumbing pages.",
    workedExample: {
      scenario:
        "A new 1–2 family dwelling with a declared construction valuation of $320,000, submitted through the plan-review path.",
      inputs: {
        valuationCents: 32_000_000,
        occupancy: "residential",
      },
      notes:
        "Two lines — **$1,550.45**.\n\nTable 100-A, band 6 ('\$100,001 to \$500,000'): base \$639.50. The excess is \$220,000 — 220 whole \$1,000 steps at \$3.50 = \$770.00. Band total: \$639.50 + \$770.00 = \$1,409.50.\n\nPlan review: 10% of the building permit fee for 1–2 family dwellings — 0.10 × \$1,409.50 = \$140.95.\n\nTotal: \$1,409.50 + \$140.95 = **\$1,550.45**. The same valuation in commercial occupancy would pay band 6 at \$5.60 steps — \$993.75 + 220 × \$5.60 = \$2,225.75 — plus 50% plan review, \$1,112.88, for \$3,338.63: the two tables diverge fast above the flat band.",
    },
    faqs: [
      {
        question: "How much is a building permit for a house in Rapid City?",
        answer:
          "By declared valuation on Table 100-A: $37.00 flat to $1,600, then bands — $45.00 plus $9.00 per additional $1,000 to $25,000, $252.00 plus $6.50 to $50,000, $639.50 plus $3.50 to $500,000 — up to a $3,539.50 base above $1,000,000. Plan review adds 10% for 1–2 family dwellings.",
        sourceId: RC_TABLES_SOURCE_KEY,
      },
      {
        question: "How much is a commercial building permit in Rapid City?",
        answer:
          "By declared valuation on Table 100-C: $37.00 flat to $1,600, $69.25 to $2,000, then $69.25 plus $14.00 per additional $1,000 to $25,000 and up to a $5,608.75 base above $1,000,000 — with plan review at 50% of the permit fee.",
        sourceId: RC_TABLES_SOURCE_KEY,
      },
      {
        question: "Why is commercial plan review 50% of the permit fee?",
        answer:
          "That is the printed row on Table 100-C: 'Plan review fees for all occupancies except 1 and 2 family dwellings shall be 50% of the building permit fee.' Dwellings and accessory structures pay 10% on the mirror row of Table 100-A.",
        sourceId: RC_TABLES_SOURCE_KEY,
      },
      {
        question: "Where are the fee amounts in Rapid City's code?",
        answer:
          "They are not in the code. § 15.04.320 delegates every amount to 'resolution of the Common Council'; the operative documents are the two Table PDFs Building Services publishes on its fee page.",
        sourceId: RC_CODE_SOURCE_KEY,
      },
      {
        question: "What happens if I start work before getting the permit?",
        answer:
          "§ 15.04.300: double the permit fee for the work, with an emergency exception the building official administers. Permit renewal fees are likewise set by council resolution.",
        sourceId: RC_CODE_SOURCE_KEY,
      },
      {
        question: "Do electrical or plumbing permits have their own fee tables?",
        answer:
          "No. The adopted trade chapters (15.16 electrical, 15.24 plumbing, plus mechanical and gas) amend technical provisions but print no fees — everything prices through the council-resolution tables, i.e. the building ladders, by declared valuation.",
        sourceId: RC_CODE_SOURCE_KEY,
      },
    ],
    seoTitle: "Rapid City building permit cost: the Table 100-A/100-C ladders",
    seoDescription:
      "Rapid City building permit fees — the $37-to-$3,539.50 residential and $5,608.75 commercial valuation ladders, 'or fraction thereof' round-ups, and 10%/50% plan review.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: RAPID_CITY_LAST_VERIFIED,
  },
  {
    jurisdictionKey: RAPID_CITY_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    slug: "electrical-permit-cost",
    title: "Rapid City electrical permit cost",
    intro:
      "Rapid City has **no separate electrical fee table**. The adopted electrical chapter (NEC amendments in RCMC 15.16) prices nothing — § 15.04.320 delegates every fee to **Common Council resolution**, and the only published permit-fee tables are the building ladders. A stand-alone electrical job therefore prices as a **building permit application by declared valuation on Table 100-C**, from the **$37.00 flat band to $1,600** up through bands that chain exactly to a **$5,608.75 base above $1,000,000**.",
    localSummary:
      "The regime is unusual enough to state plainly: Chapter 15.16 amends the NEC's technical provisions and sets two fee rules — the $10 floor ('a permit is required for fees equal to or greater than $10') and the homeowner-permit regime for owner-performed wiring (demonstrated competency, 6-month validity). Every amount comes from the council resolution behind the two Table PDFs.\n\nSo an $18,000 electrical scope on an existing commercial building prices in Table 100-C band 3: $69.25 plus 16 whole $1,000 steps at $14.00 — $293.25. The same scope on a dwelling prices on Table 100-A, and either way the 50%/10% plan-review rows attach on building-permit submittals, not on stand-alone trade applications.\n\nThe § 15.04.170 valuation definition does the bundling that other cities' trade-permit tables do: electrical work is inside the declared construction valuation, so a whole project prices once on the building ladder rather than in trade pieces.",
    notIncluded:
      "This page models the building permit's own price for trade-scale stand-alone work. It excludes:\n\n- **The 50% plan review** — it attaches on building-permit submittals (the building page); a stand-alone trade application pays the ladder only.\n- **The homeowner-permit regime's administrative terms** — demonstrated competency, 6-month validity — and the sub-$10 exemption.\n- **Event fees** — the $47.00/hr inspection and additional-plan-review rows.\n- **The doubling rule** for work begun before the permit issues.",
    workedExample: {
      scenario:
        "A stand-alone electrical scope on an existing commercial building with a declared valuation of $18,000.",
      inputs: {
        valuationCents: 1_800_000,
        occupancy: "commercial",
      },
      notes:
        "One line — **$293.25**.\n\nTable 100-C, band 3 ('\$2,001 to \$25,000'): base \$69.25. The excess is \$16,000 — 16 whole \$1,000 steps at \$14.00 = \$224.00.\n\nTotal: \$69.25 + \$224.00 = **\$293.25**.\n\nWhat moves it: 'or fraction thereof' — \$18,000.01 rounds to 17 steps; and the same scope inside a building-permit application prices inside that permit's declared valuation instead, with the 50% plan review attaching there.",
    },
    faqs: [
      {
        question: "How much is an electrical permit in Rapid City?",
        answer:
          "There is no separate electrical fee table: the permit prices by declared valuation on the building tables. An $18,000 scope on a commercial building pays $293.25 ($69.25 plus 16 × $14.00 on Table 100-C band 3); smaller scopes start at the $37.00 flat band.",
        sourceId: RC_TABLES_SOURCE_KEY,
      },
      {
        question: "Is there a minimum electrical permit fee?",
        answer:
          "Chapter 15.16 sets the floor in the other direction: 'a permit is required for fees equal to or greater than $10' — work pricing below $10 needs no permit at all.",
        sourceId: RC_CODE_SOURCE_KEY,
      },
      {
        question: "Can I wire my own house in Rapid City?",
        answer:
          "Yes, under the homeowner-permit regime: owner-performed wiring on the owner's residence requires demonstrating competency to the building official, and the permit is valid 6 months. The same valuation ladder prices it.",
        sourceId: RC_CODE_SOURCE_KEY,
      },
      {
        question: "Why does the electrical permit read the building tables?",
        answer:
          "Because the code prices nothing itself: § 15.04.320 delegates every fee to Common Council resolution, and the published resolution documents are the residential and commercial building ladders. The § 15.04.170 valuation definition already includes electrical work in the declared value.",
        sourceId: RC_CODE_SOURCE_KEY,
      },
      {
        question: "What electrical code does Rapid City use?",
        answer:
          "The state-adopted NEC with Rapid City amendments in RCMC Chapter 15.16. The chapter is technical amendments and administrative rules — the $10 permit floor and the homeowner regime — not fee amounts.",
        sourceId: RC_CODE_SOURCE_KEY,
      },
      {
        question: "How long does a Rapid City permit last?",
        answer:
          "180 days: permits become null if work has not commenced within 180 days of issuance, and refunds are capped at 80 percent within that window by the code's refund section.",
        sourceId: RC_CODE_SOURCE_KEY,
      },
    ],
    seoTitle: "Rapid City electrical permit cost: priced through the building tables",
    seoDescription:
      "Rapid City electrical permit fees — no separate trade table; § 15.04.320's council-resolution mechanism prices declared electrical valuations on the Table 100-C ladder.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: RAPID_CITY_LAST_VERIFIED,
  },
  {
    jurisdictionKey: RAPID_CITY_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    slug: "plumbing-permit-cost",
    title: "Rapid City plumbing permit cost",
    intro:
      "Rapid City's plumbing chapter adopts the **2015 UPC** with city amendments — and prices nothing. Like the electrical chapter, RCMC 15.24 defers to **§ 15.04.320's council-resolution mechanism**, so a stand-alone plumbing job prices as a **building permit application by declared valuation on Table 100-C**: the **$37.00 flat band to $1,600**, then bands chaining exactly to a **$5,608.75 base above $1,000,000**, every excess rounded up to whole $1,000.",
    localSummary:
      "The 2015 UPC adoption covers the technical code — materials, fixtures, drainage. The money is elsewhere: the Common Council resolution behind the two Table PDFs, which price the whole construction valuation once on the building ladder rather than in trade pieces. § 15.04.170's definition already includes plumbing inside the declared value.\n\nA stand-alone scope prices the same way as any commercial application: an $18,000 plumbing job lands in Table 100-C band 3 at $293.25 — $69.25 plus 16 whole $1,000 steps at $14.00. On a dwelling, Table 100-A applies and the plan-review row is 10% instead of 50%; on building-permit submittals those reviews attach there, not to stand-alone trade applications.\n\nThe plumbing chapter's own administrative contribution is the 180-day commencement rule and the refund cap — 80 percent within 180 days — which the code restates for every permit type.",
    notIncluded:
      "This page models the building permit's own price for trade-scale stand-alone work. It excludes:\n\n- **The 50% plan review** — it attaches on building-permit submittals (the building page); a stand-alone trade application pays the ladder only.\n- **Event fees** — the $47.00/hr inspection and additional-plan-review rows.\n- **The doubling rule** for work begun before the permit issues.\n- **Development-application and air-quality fees** on other schedules.",
    workedExample: {
      scenario:
        "A stand-alone plumbing scope on an existing commercial building with a declared valuation of $18,000.",
      inputs: {
        valuationCents: 1_800_000,
        occupancy: "commercial",
      },
      notes:
        "One line — **$293.25**.\n\nTable 100-C, band 3 ('\$2,001 to \$25,000'): base \$69.25. The excess is \$16,000 — 16 whole \$1,000 steps at \$14.00 = \$224.00.\n\nTotal: \$69.25 + \$224.00 = **\$293.25**.\n\nWhat moves it: 'or fraction thereof' — one cent of valuation rounds to one more step; and inside a building-permit application the plumbing work prices inside the declared construction valuation, with the plan review attaching on that page.",
    },
    faqs: [
      {
        question: "How much is a plumbing permit in Rapid City?",
        answer:
          "By declared valuation on the building tables — there is no separate plumbing fee table. An $18,000 scope on a commercial building pays $293.25 on Table 100-C band 3; scopes under $1,600 pay the $37.00 flat band.",
        sourceId: RC_TABLES_SOURCE_KEY,
      },
      {
        question: "What plumbing code does Rapid City use?",
        answer:
          "The state-adopted 2015 Uniform Plumbing Code with Rapid City amendments in RCMC Chapter 15.24. The chapter is technical adoption — the fee amounts live in the Common Council resolutions behind the Table 100-A/100-C PDFs.",
        sourceId: RC_CODE_SOURCE_KEY,
      },
      {
        question: "Does the plumbing permit need plan review?",
        answer:
          "Plan review attaches on building-permit submittals — 50% of the permit fee for all occupancies except 1–2 family dwellings, 10% for dwellings. A stand-alone trade application pays the valuation ladder only.",
        sourceId: RC_TABLES_SOURCE_KEY,
      },
      {
        question: "How is the plumbing valuation determined?",
        answer:
          "By § 15.04.170's definition: the declared construction valuation includes plumbing, heating, finish work, roofing, elevators and permanent equipment — site improvements and parking lots out. The applicant declares it; the table prices it.",
        sourceId: RC_CODE_SOURCE_KEY,
      },
      {
        question: "What if work starts before the plumbing permit issues?",
        answer:
          "§ 15.04.300 doubles the permit fee for work commenced before issuance, emergency exception aside — the same rule that applies to every permit type in Title 15.",
        sourceId: RC_CODE_SOURCE_KEY,
      },
      {
        question: "How long do I have to start work?",
        answer:
          "180 days from issuance, or the permit becomes null. Refunds are capped at 80 percent within the same 180-day window by the code's refund section.",
        sourceId: RC_CODE_SOURCE_KEY,
      },
    ],
    seoTitle: "Rapid City plumbing permit cost: priced through the building tables",
    seoDescription:
      "Rapid City plumbing permit fees — the 2015 UPC adoption prices nothing; declared plumbing valuations walk the Table 100-C ladder under § 15.04.320's resolution mechanism.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: RAPID_CITY_LAST_VERIFIED,
  },
];

const verifications: SeedVerification[] = [
  {
    entityType: "fee_schedule",
    entityKey: RAPID_CITY_KEYS.schedule,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: RAPID_CITY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: RC_TABLES_SOURCE_KEY,
    notes:
      "Tables 100-A and 100-C read from the Wayback captures of the city's own URLs (live host Cloudflare-challenges scripted retrieval; the live fee page confirms the same PDFs are operative). Both ladders' seams verified to the cent above $2,000 ($252.00→$414.50→$639.50→$2,039.50→$3,539.50 residential; $391.25→$643.75→$993.75→$3,233.75→$5,608.75 commercial); the residential $2,000 seam verified as printed ($39.00 vs $45.00, documented).",
  },
  {
    entityType: "jurisdiction_profile",
    entityKey: RAPID_CITY_KEYS.jurisdiction,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: RAPID_CITY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: RC_CODE_SOURCE_KEY,
    notes:
      "Authority confirmed: Building Services at 300 6th Street; the fee page links both Table PDFs; § 15.04.320 delegates amounts to council resolution and prints none; no trade chapter in Title 15 prints fee tables.",
  },
  {
    entityType: "permit_page",
    entityKey: "building-permit-cost",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: RAPID_CITY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: RC_TABLES_SOURCE_KEY,
    notes: "Worked example reproduces Table 100-A band 6 ($1,409.50) and the 10% dwelling plan review ($140.95).",
  },
  {
    entityType: "permit_page",
    entityKey: "electrical-permit-cost",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: RAPID_CITY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: RC_TABLES_SOURCE_KEY,
    notes: "Worked example reproduces Table 100-C band 3 at $18,000 of declared valuation ($293.25).",
  },
  {
    entityType: "permit_page",
    entityKey: "plumbing-permit-cost",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: RAPID_CITY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: RC_TABLES_SOURCE_KEY,
    notes: "Worked example reproduces Table 100-C band 3 at $18,000 of declared valuation ($293.25).",
  },
];

export const rapidCitySeed: JurisdictionSeed = {
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
