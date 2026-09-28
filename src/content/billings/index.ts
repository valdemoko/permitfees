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
  BILL_BUILDING_RULES,
  BILL_ELECTRICAL_RULES,
  BILL_PLUMBING_RULES,
  BILL_RES_EFFECTIVE_FROM,
  BILL_RES_SOURCE_KEY,
} from "./fee-rules";

export * from "./fee-rules";

/**
 * The complete Billings, Montana seed payload.
 *
 * Every figure traces to research/montana/billings.md, which traces to City
 * Council Resolution 26-11315 (adopted February 23, 2026, effective on
 * passage) — a fee *reduction* repealing the 2011 schedule. The adopted PDF is
 * a scan; its page 1 was read visually in the browser and matches the
 * Gazette's published text-layer draft of the same instrument, which is the
 * amount source.
 *
 * Three pages, all published: building, electrical, plumbing.
 */

const RESEARCHER = "Permit Fee Intelligence — Montana pass (Billings)";

export const BILLINGS_LAST_VERIFIED = "2026-09-26";

export const BILLINGS_KEYS = {
  state: "mt",
  county: "yellowstone-county",
  jurisdiction: "billings",
  schedule: "billings-res-26-11315",
} as const;

const state: SeedState = {
  code: "MT",
  slug: "montana",
  name: "Montana",
  fipsCode: "30",
};

const county: SeedCounty = {
  key: BILLINGS_KEYS.county,
  slug: "yellowstone-county",
  name: "Yellowstone County",
  fipsCode: "30111",
};

const jurisdiction: SeedJurisdiction = {
  key: BILLINGS_KEYS.jurisdiction,
  stateKey: BILLINGS_KEYS.state,
  countyKey: BILLINGS_KEYS.county,
  type: "city",
  slug: "billings",
  name: "Billings",
  officialName: "City of Billings — Building Division (Community Development)",
  websiteUrl: "https://www.billingsmt.gov/",
  permitPortalUrl: "https://www.billingsmt.gov/3273/2026-Resolutions",
  timezone: "America/Denver",
  isActive: true,
};

const departments: SeedDepartment[] = [
  {
    key: "billings-building-division",
    jurisdictionKey: BILLINGS_KEYS.jurisdiction,
    kind: "building",
    name: "Building Division (Community Development)",
    phone: "(406) 657-8231",
    email: null,
    url: "https://www.billingsmt.gov/",
    addressLine: "2224 Montana Avenue, Billings, MT 59101",
    hours: "Monday – Friday, 8:00 a.m. – 5:00 p.m. MT",
    notes:
      "The Building Division issues building, electrical, plumbing, mechanical and fire system permits. Its amounts are set by stand-alone Council resolution — the 2011 Resolution 11-19068 was repealed and replaced by Resolution 26-11315 in February 2026, a 23–31% fee reduction the council adopted to draw Building Division reserves down toward 12 months of operating revenue.",
  },
];

const sources: SeedSource[] = [
  {
    key: BILL_RES_SOURCE_KEY,
    jurisdictionKey: BILLINGS_KEYS.jurisdiction,
    title: "City of Billings Resolution 26-11315 — Setting Building, Electrical, Plumbing, Mechanical, and Fire System Permit Fees (adopted 2026-02-23, effective on passage)",
    url: "https://www.billingsmt.gov/DocumentCenter/View/54705/RES-26-11315-Setting-Building-Electrical-Plumbing-Mechanical-and-Fire-System-Permit-Fees",
    sourceType: "ordinance",
    issuingAuthority: "City of Billings — City Council",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2026-02-23",
    effectiveFrom: BILL_RES_EFFECTIVE_FROM,
    retrievedAt: BILLINGS_LAST_VERIFIED,
    lastVerifiedAt: BILLINGS_LAST_VERIFIED,
    notes:
      "Read 2026-09-26. The adopted PDF (7 pp.) is an image-only scan; its page 1 was read visually in the browser and matches the Gazette's published text-layer draft of the same resolution word for word (identical whereas clauses, building bands, and the 60% commercial plan-review line). The draft's text layer is the amount source: § 1's consolidated eight-band building ladder (chaining exactly at every seam from $45.00 to a $9,529.00 base), the 60% commercial plan review, § 2's residential electrical flats and five-band commercial project-cost ladder, § 3's $20.00 plumbing issuance plus unit rows (read out of the scan by word coordinates), § 4's mechanical rows and § 5's fire-system bands. Adoption (APPROVED 11-0) verified on the February 23, 2026 council agenda; the Gazette reports the operational go-live 'on or after March 2'.",
  },
];

/** Empty on purpose: the permit types Billings uses already exist as shared rows. */
const permitTypes: JurisdictionSeed["permitTypes"] = [];
const projectTypes: JurisdictionSeed["projectTypes"] = [];

const jurisdictionPermitTypes: SeedJurisdictionPermitType[] = [
  {
    jurisdictionKey: BILLINGS_KEYS.jurisdiction,
    permitTypeKey: "building",
    isAvailable: true,
    localName: "Building permit — one consolidated valuation ladder for both occupancies",
    officialUrl:
      "https://www.billingsmt.gov/DocumentCenter/View/54705/RES-26-11315-Setting-Building-Electrical-Plumbing-Mechanical-and-Fire-System-Permit-Fees",
    notes:
      "§ 1 charges residential and commercial building permits on the higher of total bid price or the ICC Building Safety Journal valuation table, through ONE schedule: $45.00 flat to $2,000, then bands chaining exactly ($229.00, $354.00, $529.00, $1,529.00, $2,529.00, $9,529.00) to a $1.50 per-$1,000 top rate. Commercial plan review is 60% of the permit fee — reduced from 65% — and the residential plan-review fee was eliminated outright in the 2026 consolidation.",
  },
  {
    jurisdictionKey: BILLINGS_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    isAvailable: true,
    localName: "Electrical permit — residential flats by service size, commercial five-band project-cost ladder",
    officialUrl:
      "https://www.billingsmt.gov/DocumentCenter/View/54705/RES-26-11315-Setting-Building-Electrical-Plumbing-Mechanical-and-Fire-System-Permit-Fees",
    notes:
      "§ 2 prices residential work as flats: single-family $130.00 (100–300 A) or $200.00 (301+ A, garage included either way), rewire/addition $40.00, service change $25.00, multi-family $100.00 per building plus $40.00 per unit capped at 12 (over 12 units under one roof uses the commercial ladder). Commercial work prices by project cost: $30.00 to $500, then $30 + 6% to $1,000, $60 + 2% to $10,000, $240 + 0.5% to $50,000, $440 + 0.3% above — a ladder whose seams chain exactly.",
  },
  {
    jurisdictionKey: BILLINGS_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    isAvailable: true,
    localName: "Plumbing permit — $20.00 issuance plus a unit-price list",
    officialUrl:
      "https://www.billingsmt.gov/DocumentCenter/View/54705/RES-26-11315-Setting-Building-Electrical-Plumbing-Mechanical-and-Fire-System-Permit-Fees",
    notes:
      "§ 3 charges $20.00 for issuance plus a unit schedule read by word coordinates out of the scanned resolution: fixtures $15.00 (water, drainage and backflow included per fixture), building/trailer-park sewers $7.00, rainwater drains $25.00, cesspools $40.00, private sewage systems $7.00, water heaters $5.00, gas systems of one to five outlets $1.00 (+$7.00 per additional outlet), water piping repairs $7.00, lawn sprinklers $7.00, atmospheric vacuum breakers $5.00/$1.00, backflow devices $7.00 (≤2 in.) / $15.00 (>2 in.).",
  },
];

const feeSchedules: SeedFeeSchedule[] = [
  {
    key: BILLINGS_KEYS.schedule,
    jurisdictionKey: BILLINGS_KEYS.jurisdiction,
    sourceKey: BILL_RES_SOURCE_KEY,
    title: "Billings Resolution 26-11315 fee schedule (all five permit families)",
    officialUrl:
      "https://www.billingsmt.gov/DocumentCenter/View/54705/RES-26-11315-Setting-Building-Electrical-Plumbing-Mechanical-and-Fire-System-Permit-Fees",
    effectiveFrom: BILL_RES_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: BILLINGS_LAST_VERIFIED,
    notes:
      "One resolution carries every construction permit family: building, electrical, plumbing, mechanical and fire systems. § 7 makes it effective on passage (February 23, 2026); the Gazette reports staff rolled it out operationally on or after March 2, and staff will review the fees each fiscal year against Building Division reserves.",
  },
];

function attach(
  permitTypeKey: string,
  rules: SeedFeeRule["rule"][],
  scheduleKey: string,
): SeedFeeRule[] {
  return rules.map((rule) => ({
    jurisdictionKey: BILLINGS_KEYS.jurisdiction,
    permitTypeKey,
    scheduleKey,
    rule,
  }));
}

const feeRules: SeedFeeRule[] = [
  ...attach("building", BILL_BUILDING_RULES, BILLINGS_KEYS.schedule),
  ...attach("electrical", BILL_ELECTRICAL_RULES, BILLINGS_KEYS.schedule),
  ...attach("plumbing", BILL_PLUMBING_RULES, BILLINGS_KEYS.schedule),
];

const requirements: SeedRequirement[] = [
  {
    jurisdictionKey: BILLINGS_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "The fee reads the HIGHER of bid price or ICC-derived valuation",
    description:
      "§ 1: fees 'are to be charged on the higher of total bid price values or based on the most recent valuation table established in the International Code Council Building Safety Journal.' An applicant with a low bid on a large project does not escape the valuation table — the higher number walks the ladder.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: BILL_RES_SOURCE_KEY,
    lastVerifiedAt: BILLINGS_LAST_VERIFIED,
  },
  {
    jurisdictionKey: BILLINGS_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "Residential projects carry no plan-review fee",
    description:
      "The 2026 consolidation eliminated the residential plan-review fee outright (council coverage: 'residential projects will no longer have a plan review fee'); only the commercial 60% line survives in the resolution. Changed plans trigger additional review at § 6's $75.00/hour with a half-hour minimum.",
    isMandatory: false,
    sortOrder: 20,
    sourceKey: BILL_RES_SOURCE_KEY,
    lastVerifiedAt: BILLINGS_LAST_VERIFIED,
  },
  {
    jurisdictionKey: BILLINGS_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "other",
    title: "Multi-family electrical caps the per-unit count at 12",
    description:
      "§ 2.K: $100.00 per building plus $40.00 per unit 'up to and including 12 units'; over 12 units under one roof uses the commercial project-cost ladder instead — the per-unit row carries that cap as a condition, and a 12-unit building prices $100 + 12 × $40 = $580.00.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: BILL_RES_SOURCE_KEY,
    lastVerifiedAt: BILLINGS_LAST_VERIFIED,
  },
  {
    jurisdictionKey: BILLINGS_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    requirementType: "other",
    title: "The unit rows include their piping",
    description:
      "§ 3.A's fixture row prices 'each plumbing fixture or trap or set of fixtures on one trap (including water, drainage piping, and backflow protection)' — the $15.00 covers the fixture's supply, waste and backflow in one line, which is why the schedule's separate backflow row addresses only devices NOT included in a fixture set.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: BILL_RES_SOURCE_KEY,
    lastVerifiedAt: BILLINGS_LAST_VERIFIED,
  },
];

const profile: SeedProfile = {
  jurisdictionKey: BILLINGS_KEYS.jurisdiction,
  headline: "What construction permits cost in Billings",
  summary:
    "Billings sets every permit amount in **one Council resolution — 26-11315**, adopted February 23, 2026 as a **23–31% fee reduction** of the 2011 schedule. The building permit climbs **one consolidated ladder for both occupancies** — $45.00 flat to $2,000, chaining exactly to a **$9,529.00 base above $5,000,000** — with **commercial plan review at 60%** and **no residential plan-review fee at all**. Electrical splits residential flats from a five-band commercial project-cost ladder; plumbing is a **$20.00 issuance plus a unit-price list**.",
  localContext:
    "The February 2026 vote is the story here: Billings' Building Division had been collecting more than it spent, and the council voted 11-0 to give the money back — cutting every schedule 23–31%, consolidating the residential and commercial building ladders into one table, dropping commercial plan review from 65% to 60%, and eliminating the residential plan-review fee outright. A $2.5 million commercial project dropped from about $11,010 to $8,246. The department is deliberately drawing reserves down to roughly 12 months of operating revenue, and staff review the fees each fiscal year.\n\nThe consolidated ladder is also the cleanest in this dataset's Montana set: one table for houses and hospitals alike, and every band's printed base equals the band below run to its ceiling — $229.00, $354.00, $529.00, $1,529.00, $2,529.00, $9,529.00 — an arithmetic check that passes at all six seams.\n\nThe trades price like parts lists with a twist: residential electrical is a handful of flats keyed on service size ($130.00 for a 100–300 A single-family service, garage included), while commercial electrical climbs a five-band project-cost ladder whose marginal rates (6%, 2%, 0.5%, 0.3%) chain exactly. Plumbing charges $20.00 to issue the permit and then $5.00–$40.00 per item, down to $1.00 for a one-to-five-outlet gas piping system.",
  valuationBasis:
    "The building ladder reads **the higher of total bid price or the ICC Building Safety Journal valuation table** — the resolution's own words — so a low bid never dodges the table. Commercial electrical reads **project cost** (labor plus material) in five marginal bands. The plumbing and residential-electrical rows read **counts**: fixtures, sewers, water heaters, gas systems, backflow devices, buildings and units.",
  notIncluded:
    "These figures are the City's own permit amounts from Resolution 26-11315. They are not a project cost, and they exclude:\n\n- **Fire system permits** — § 5's own seven-band project-cost table ($45 to $2,000 per system), a separate permit family.\n- **Mechanical permits** — § 4's $20.00 minimum plus $5–$30 per piece of equipment, recorded row by row in the research file.\n- **Electrical flats outside the three pages** — accessory buildings, modular and mobile homes, irrigation wells, temporary services (each $25–$130).\n- **Event and penalty fees** — $75.00/hr inspections outside business hours, reinspection, and additional plan review (½-hour minimum).\n- **Impact and development fees** — none appear in the resolution; system development fees are on separate instruments.",
  seoTitle: "Billings permit fees — Resolution 26-11315 schedules",
  seoDescription:
    "How Billings prices construction permits under the 2026 fee-reduction resolution: the consolidated $45-to-$9,529 building ladder, 60% commercial plan review with no residential review, and flat-plus-unit trade schedules.",
  publishStatus: "published",
  noindex: false,
  lastReviewedAt: BILLINGS_LAST_VERIFIED,
};

const permitPages: SeedPermitPage[] = [
  {
    jurisdictionKey: BILLINGS_KEYS.jurisdiction,
    permitTypeKey: "building",
    slug: "building-permit-cost",
    title: "Billings building permit cost",
    intro:
      "A Billings building permit climbs **one ladder — the same table for a house and a hospital**. Resolution 26-11315 (February 2026) consolidated the residential and commercial schedules into **one eight-band valuation ladder**: **$45.00 flat to $2,000**, then bands chaining exactly to a **$9,529.00 base above $5,000,000**. Commercial plan review adds **60% of the permit fee**; **residential projects pay no plan-review fee at all** — the 2026 consolidation eliminated it.",
    localSummary:
      "The fee reads the **higher of total bid price or the ICC Building Safety Journal valuation table** — the resolution's own device for keeping a low bid from dodging the table.\n\nThe ladder's discipline is its chaining: $45.00 + 23 × $8.00 is $229.00, $229.00 + 25 × $5.00 is $354.00, $354.00 + 50 × $3.50 is $529.00, and so on to $9,529.00 — all six seams exact. A $650,000 commercial build-out lands in band 6: $1,529.00 plus 150 whole $1,000 steps at $2.00, or $1,829.00, with the 60% plan review adding $1,097.40.\n\nThe February 2026 vote cut all of this by roughly a quarter: the same project paid about $4,000 more under the old 65%-review regime, and residential builders now pay the ladder alone — no review percentage on top. Staff estimated 23–31% reductions across the board and plan to revisit the numbers every fiscal year.",
    notIncluded:
      "This is the building permit fee under Resolution 26-11315. It excludes:\n\n- **Fire system permits** — § 5's separate project-cost table ($45–$2,000 per system).\n- **Mechanical permits** — the $20.00-minimum equipment list on the same resolution, recorded in the research file.\n- **Trade permits** — electrical and plumbing price their own rows on their own pages.\n- **Event fees** — $75.00/hr after-hours inspections, reinspection, and additional plan review for changed plans (½-hour minimum).",
    workedExample: {
      scenario:
        "A commercial build-out with a declared valuation of $650,000, submitted through commercial plan review.",
      inputs: {
        valuationCents: 65_000_000,
        occupancy: "commercial",
        custom: {
          plan_review: true,
        },
      },
      notes:
        "Two lines — **$2,926.40**.\n\n§ 1, band 6 ('$500,001 to $1,000,000'): base $1,529.00. The excess is $150,000 — 150 whole $1,000 steps at $2.00 = $300.00. Band total: $1,529.00 + $300.00 = $1,829.00.\n\nCommercial plan review: 60% of the permit fee — 0.60 × $1,829.00 = $1,097.40.\n\nTotal: $1,829.00 + $1,097.40 = **$2,926.40**. Under the pre-2026 schedule the same project paid roughly $11,010 — the February 2026 reduction cut it by more than a quarter, and 'or fraction thereof' means $650,000.01 would round to 151 steps.",
    },
    faqs: [
      {
        question: "How much is a building permit in Billings?",
        answer:
          "One ladder for both occupancies: $45.00 flat to $2,000 of valuation, then $8.00 per additional $1,000 to $25,000, $5.00 to $50,000, $3.50 to $100,000, $2.50 to $500,000 — up to a $9,529.00 base above $5,000,000 plus $1.50 per $1,000.",
        sourceId: BILL_RES_SOURCE_KEY,
      },
      {
        question: "Does Billings charge a plan review fee on houses?",
        answer:
          "No. The February 2026 fee reduction eliminated the residential plan-review fee outright; only the commercial 60% line remains in the resolution.",
        sourceId: BILL_RES_SOURCE_KEY,
      },
      {
        question: "What is the commercial plan review fee in Billings?",
        answer:
          "60 percent of the building permit fee, reduced from 65% by the 2026 consolidation. Additional review for changed plans bills at $75.00 per hour with a half-hour minimum.",
        sourceId: BILL_RES_SOURCE_KEY,
      },
      {
        question: "How did the 2026 fee reduction change Billings permit costs?",
        answer:
          "City Council Resolution 26-11315 (adopted February 23, 2026, effective on passage) cut every schedule an estimated 23–31%: a $2.5M commercial project dropped from about $11,010 to $8,246, residential plan review disappeared, and the two building ladders merged into one table.",
        sourceId: BILL_RES_SOURCE_KEY,
      },
      {
        question: "Which valuation does Billings use if my bid is low?",
        answer:
          "The higher one: the resolution charges 'on the higher of total bid price values or based on the most recent valuation table established in the International Code Council Building Safety Journal.'",
        sourceId: BILL_RES_SOURCE_KEY,
      },
      {
        question: "Where do Billings' permit fees come from?",
        answer:
          "From a stand-alone Council resolution rather than the municipal code: Resolution 26-11315 repealed the 2011 schedule (Resolution 11-19068) and carries every permit family — building, electrical, plumbing, mechanical and fire systems — in one document.",
        sourceId: BILL_RES_SOURCE_KEY,
      },
    ],
    seoTitle: "Billings building permit cost: the consolidated 26-11315 ladder",
    seoDescription:
      "Billings building permit fees — one $45-to-$9,529 ladder for both occupancies, 60% commercial plan review, and no residential plan-review fee under the 2026 fee-reduction resolution.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: BILLINGS_LAST_VERIFIED,
  },
  {
    jurisdictionKey: BILLINGS_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    slug: "electrical-permit-cost",
    title: "Billings electrical permit cost",
    intro:
      "A Billings electrical permit splits on **occupancy**. Residential work prices as **flats keyed on service size** — a single-family dwelling with a 100–300 A service is **$130.00** (garage included), 301+ A is $200.00, a rewire or addition $40.00. Commercial work climbs a **five-band project-cost ladder**: $30.00 to $500, then **$30 + 6%**, **$60 + 2%**, **$240 + 0.5%**, **$440 + 0.3%** — a ladder whose seams chain exactly.",
    localSummary:
      "The residential flats are named for the job, not the count: one number covers a single-family service including the garage wired at the same time; a multi-family building pays $100.00 plus $40.00 per unit up to 12 units, and beyond 12 units under one roof the commercial ladder takes over.\n\nThe commercial ladder is the rare printed schedule whose marginal rates verify: $30.00 + 6% of the $500 balance is $60.00 at $1,000 — the next band's base; $60.00 + 2% of $9,000 is $240.00 — the next base; $240.00 + 0.5% of $40,000 is $440.00 — the top base. A $60,000 commercial job pays $440.00 plus 0.3% of $10,000, or $470.00.\n\nThe 2026 resolution cut these amounts along with everything else; the schedule below is the reduced one, effective on the resolution's passage.",
    notIncluded:
      "This is § 2's electrical permit fee. It excludes:\n\n- **The building permit** and its 60% commercial plan review — on the building page.\n- **Accessory, modular and mobile-home flats** — $25.00–$130.00 by service size and placement, recorded in the research file.\n- **Special installations** — irrigation wells ($40.00), pumps ($35.00 per unit), temporary construction services ($25.00).\n- **Multi-family beyond 12 units** — priced on the commercial project-cost ladder by § 2.K's own instruction.",
    workedExample: {
      scenario:
        "A commercial electrical scope with a project cost of $60,000 (labor plus material).",
      inputs: {
        valuationCents: 6_000_000,
        occupancy: "commercial",
        workType: "new_construction",
      },
      notes:
        "One line — **$470.00**.\n\nCommercial ladder, top band ('$50,001 or more'): base $440.00. The excess is $10,000 — 0.3% = $30.00.\n\nTotal: $440.00 + $30.00 = **$470.00**.\n\nWhat moves it: the same $60,000 of work inside a 12-unit-or-less multi-family building would price as $100.00 per building + $40.00 per unit instead — the schedule's own instruction sends over-12-unit buildings to this ladder; and the ladder's 0.3% is open-ended, so a $500,000 commercial job pays $1,640.00.",
    },
    faqs: [
      {
        question: "How much is an electrical permit for a new house in Billings?",
        answer:
          "$130.00 for a 100–300 amp service or $200.00 for 301+ amps — the single-family row includes the garage wired at the same time. A rewire or new addition alone is $40.00; a service change $25.00.",
        sourceId: BILL_RES_SOURCE_KEY,
      },
      {
        question: "How is a commercial electrical permit calculated?",
        answer:
          "By project cost: $30.00 to $500, then $30 + 6% of the balance to $1,000, $60 + 2% to $10,000, $240 + 0.5% to $50,000, and $440 + 0.3% above — the marginal rates chain exactly at every band edge.",
        sourceId: BILL_RES_SOURCE_KEY,
      },
      {
        question: "What does a multi-family electrical permit cost?",
        answer:
          "$100.00 per building plus $40.00 per unit up to and including 12 units — $580.00 for a 12-plex. Over 12 units under one roof, § 2.K sends the project to the commercial project-cost ladder.",
        sourceId: BILL_RES_SOURCE_KEY,
      },
      {
        question: "Is there a minimum electrical permit fee?",
        answer:
          "Yes, in effect: the smallest commercial row is $30.00 ($0–$500 project cost) and the smallest residential row is $25.00 (a service change), so no electrical permit prices below those.",
        sourceId: BILL_RES_SOURCE_KEY,
      },
      {
        question: "Did the 2026 fee reduction lower electrical permits too?",
        answer:
          "Yes — Resolution 26-11315 cut the electrical schedules with everything else (staff estimated 23–31% across all families) and made the reduced amounts effective on passage, February 23, 2026.",
        sourceId: BILL_RES_SOURCE_KEY,
      },
      {
        question: "Who issues Billings electrical permits?",
        answer:
          "The Building Division (Community Development) — the same resolution that sets the building ladder sets the electrical one, and the division is the contact at (406) 657-8231 for application questions.",
        sourceId: BILL_RES_SOURCE_KEY,
      },
    ],
    seoTitle: "Billings electrical permit cost: residential flats and the commercial ladder",
    seoDescription:
      "Billings electrical permit fees — $130/$200 single-family flats, $100 + $40/unit multi-family, and the $30-to-$440 commercial project-cost ladder under Resolution 26-11315.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: BILLINGS_LAST_VERIFIED,
  },
  {
    jurisdictionKey: BILLINGS_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    slug: "plumbing-permit-cost",
    title: "Billings plumbing permit cost",
    intro:
      "A Billings plumbing permit is a **$20.00 issuance fee plus a parts list**. Every row is a count times a price: **fixtures $15.00** (water, drainage piping and backflow protection included per fixture), building sewers $7.00, water heaters **$5.00**, gas piping systems of one to five outlets just **$1.00** (+$7.00 per additional outlet), backflow devices $7.00–$15.00 by diameter.",
    localSummary:
      "The $20.00 issuance is the permit's floor — the cheapest possible plumbing job, one water heater, is $25.00 — and the unit rows stack on it in whatever combination the scope names. The fixture row is deliberately broad: $15.00 covers the fixture's water piping, drainage piping and backflow protection in one line, so the schedule's separate backflow row addresses only free-standing devices not part of a fixture set.\n\nThe gas-piping row is the oddity worth knowing: $1.00 covers a whole one-to-five-outlet system, with the $7.00 per-additional-outlet row only engaging beyond five. The 2026 resolution cut these amounts with everything else — the schedule below is the reduced one.\n\nOne reading note: the adopted resolution is a scanned PDF whose amount column interleaves in text extraction; each row was matched to its printed amount by word coordinates, and the coordinate dump is in the research file — the prices above are the positional read, not a guess.",
    notIncluded:
      "This is § 3's plumbing permit fee. It excludes:\n\n- **The building permit** and its 60% commercial plan review — on the building page.\n- **Unmodelled unit rows** — rainwater drains ($25.00 each), cesspools ($40.00), private sewage disposal systems ($7.00), industrial pretreatment interceptors ($7.00), lawn sprinklers ($7.00 per meter), atmospheric vacuum breakers ($5.00 for 1–5, $1.00 each over 5).\n- **Additional gas outlets beyond five** — $7.00 each, recorded in the research file.\n- **Mechanical permits** — the $20.00-minimum equipment list, recorded without their own page.",
    workedExample: {
      scenario:
        "A commercial tenant-finish plumbing scope: 12 fixtures, 1 building sewer, 3 water heaters and 2 backflow devices (2 inch and smaller).",
      inputs: {
        occupancy: "commercial",
        workType: "new_construction",
        fixtures: 12,
        custom: {
          connections: 1,
          water_heaters: 3,
          backflow_devices: 2,
        },
      },
      notes:
        "Six lines — **$236.00**.\n\nPermit issuance: $20.00. Fixtures: 12 × $15.00 = $180.00. Building sewer: 1 × $7.00 = $7.00. Water heaters: 3 × $5.00 = $15.00. Backflow devices: 2 × $7.00 = $14.00.\n\nTotal: $20 + $180 + $7 + $15 + $14 = **$236.00**.\n\nWhat moves it: each fixture's $15.00 already carries its supply, waste and backflow piping — the separate $7.00 backflow row bills only free-standing devices; and a gas-piping system for the break room would add just $1.00 (one-to-five outlets).",
    },
    faqs: [
      {
        question: "How much is a plumbing permit in Billings?",
        answer:
          "$20.00 for issuance plus the unit rows your scope names: $15.00 per fixture, $7.00 per building sewer, $5.00 per water heater, $1.00 per gas system of one to five outlets, $7.00–$15.00 per free-standing backflow device.",
        sourceId: BILL_RES_SOURCE_KEY,
      },
      {
        question: "Does the fixture fee include piping?",
        answer:
          "Yes — § 3.A prices each fixture or trap 'including water, drainage piping, and backflow protection,' so one $15.00 line covers the fixture's whole rough-in.",
        sourceId: BILL_RES_SOURCE_KEY,
      },
      {
        question: "What does a water heater replacement permit cost?",
        answer:
          "$5.00 for the water heater row plus the $20.00 issuance — $25.00 on a stand-alone permit, the schedule's cheapest realistic job.",
        sourceId: BILL_RES_SOURCE_KEY,
      },
      {
        question: "How are gas lines permitted?",
        answer:
          "§ 3.G–H: $1.00 per gas-piping system of one to five outlets, plus $7.00 for each additional outlet beyond five. A typical residential system with four drops is one dollar.",
        sourceId: BILL_RES_SOURCE_KEY,
      },
      {
        question: "Is there a minimum plumbing permit fee?",
        answer:
          "Yes — the $20.00 issuance applies to every permit, so the smallest permit (a single water heater) is $25.00 and the floor is $20.00 for any scope with no unit rows at all.",
        sourceId: BILL_RES_SOURCE_KEY,
      },
      {
        question: "How long is a Billings plumbing permit good for?",
        answer:
          "The resolution's inspection apparatus applies: inspections are scheduled through the Building Division, and reinspection bills at the $75.00/hour rate of § 6 when work is called before it is ready.",
        sourceId: BILL_RES_SOURCE_KEY,
      },
    ],
    seoTitle: "Billings plumbing permit cost: $20 issuance plus the unit list",
    seoDescription:
      "Billings plumbing permit fees — $20.00 issuance, $15.00 fixtures with piping included, $5.00 water heaters, $1.00 gas systems, and $7.00–$15.00 backflow devices under Resolution 26-11315.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: BILLINGS_LAST_VERIFIED,
  },
];

const verifications: SeedVerification[] = [
  {
    entityType: "fee_schedule",
    entityKey: BILLINGS_KEYS.schedule,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: BILLINGS_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BILL_RES_SOURCE_KEY,
    notes:
      "Resolution 26-11315 verified at two instruments: the adopted scan (page 1 read visually in the browser) and the Gazette's text-layer draft of the same resolution (word-identical page 1). Building ladder seams verified to the cent at all six edges ($229.00→$354.00→$529.00→$1,529.00→$2,529.00→$9,529.00); commercial electrical ladder seams verified the same way ($60.00→$240.00→$440.00). The plumbing schedule's interleaved scan text was resolved by word-coordinate matching (pymupdf dump in the research file).",
  },
  {
    entityType: "jurisdiction_profile",
    entityKey: BILLINGS_KEYS.jurisdiction,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: BILLINGS_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BILL_RES_SOURCE_KEY,
    notes:
      "Authority confirmed: the 2026 Resolutions index lists RES 26-11315 dated 02/23/2026; the February 23 council agenda records the public hearing and 'APPROVED 11-0'; the resolution's § 7 sets effectiveness on passage and § 8 repeals Resolution 11-19068.",
  },
  {
    entityType: "permit_page",
    entityKey: "building-permit-cost",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: BILLINGS_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BILL_RES_SOURCE_KEY,
    notes: "Worked example reproduces § 1 band 6 ($1,829.00) and the 60% commercial plan review ($1,097.40).",
  },
  {
    entityType: "permit_page",
    entityKey: "electrical-permit-cost",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: BILLINGS_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BILL_RES_SOURCE_KEY,
    notes: "Worked example reproduces the commercial ladder's top band at $60,000 of project cost ($470.00).",
  },
  {
    entityType: "permit_page",
    entityKey: "plumbing-permit-cost",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: BILLINGS_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BILL_RES_SOURCE_KEY,
    notes: "Worked example reproduces the issuance plus fixture, sewer, water-heater and backflow rows ($236.00).",
  },
];

export const billingsSeed: JurisdictionSeed = {
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
