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
  MISS_BUILDING_RULES,
  MISS_ELECTRICAL_RULES,
  MISS_FY2026_EFFECTIVE_FROM,
  MISS_FY2026_EFFECTIVE_TO,
  MISS_FY2027_EFFECTIVE_FROM,
  MISS_PLUMBING_RULES,
  MISS_RES_8887_SOURCE_KEY,
  MISS_RES_8970_SOURCE_KEY,
  MISS_PACKET_SOURCE_KEY,
} from "./fee-rules";

export * from "./fee-rules";

/**
 * The complete Missoula, Montana seed payload.
 *
 * Every figure traces to research/montana/missoula.md, which traces to the
 * FY2026 Building (MEC, PLM, ELC, RFG) Permit Fee Schedule (Resolution 8887,
 * in force January 1 – December 31, 2026 — operative on this pass's date) and
 * the City's Valuation & Plan Review Packet. Resolution 8970 (adopted
 * 2026-08-17, effective 2026-10-01) is recorded as the successor instrument.
 *
 * Three pages, all published: building, electrical, plumbing.
 */

const RESEARCHER = "Permit Fee Intelligence — Montana pass (Missoula)";

export const MISSOULA_LAST_VERIFIED = "2026-09-26";

export const MISSOULA_KEYS = {
  state: "mt",
  county: "missoula-county",
  jurisdiction: "missoula",
  schedule: "missoula-fy26-schedule",
  scheduleFy27: "missoula-fy27-schedule",
} as const;

const state: SeedState = {
  code: "MT",
  slug: "montana",
  name: "Montana",
  fipsCode: "30",
};

const county: SeedCounty = {
  key: MISSOULA_KEYS.county,
  slug: "missoula-county",
  name: "Missoula County",
  fipsCode: "30063",
};

const jurisdiction: SeedJurisdiction = {
  key: MISSOULA_KEYS.jurisdiction,
  stateKey: MISSOULA_KEYS.state,
  countyKey: MISSOULA_KEYS.county,
  type: "city",
  slug: "missoula",
  name: "Missoula",
  officialName: "City of Missoula — Development Services / Building Division (CPDI)",
  websiteUrl: "http://www.ci.missoula.mt.us/2966/Fee-Schedules",
  permitPortalUrl: "https://aca-prod.accela.com/MISSOULA/Default.aspx",
  timezone: "America/Denver",
  isActive: true,
};

const departments: SeedDepartment[] = [
  {
    key: "missoula-development-services",
    jurisdictionKey: MISSOULA_KEYS.jurisdiction,
    kind: "building",
    name: "Development Services, Community Planning, Development & Innovation (CPDI)",
    phone: "(406) 552-6630",
    email: "coordinators@ci.missoula.mt.us",
    url: "http://www.ci.missoula.mt.us/2966/Fee-Schedules",
    addressLine: "435 Ryman Street, Missoula, MT 59802",
    hours: "Monday – Friday, 8:00 a.m. – 5:00 p.m. MT",
    notes:
      "Development Services issues building, electrical, plumbing and mechanical permits through the City's Accela portal. Fees are set by Council resolution with attached exhibits; the FY2026 schedule (Resolution 8887) is in force through September 30, 2026, and Resolution 8970 takes over October 1, 2026 with roughly 18–19% increases on the trade rows (the building ladder's grid itself unchanged) and a commercial plan-review jump to 65%.",
  },
];

const sources: SeedSource[] = [
  {
    key: MISS_RES_8887_SOURCE_KEY,
    jurisdictionKey: MISSOULA_KEYS.jurisdiction,
    title: "City of Missoula Building (MEC, PLM, ELC, RFG) Permit Fee Schedule — FY2026 (Resolution 8887, effective January 1 – December 31, 2026)",
    url: "https://www.ci.missoula.mt.us/DocumentCenter/View/23902/Permit-Fee-Schedule-Building-Electrical-Mechanical-Demolition--Moving",
    sourceType: "fee_schedule_pdf",
    issuingAuthority: "City of Missoula — Development Services (CPDI)",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2026-01-01",
    effectiveFrom: MISS_FY2026_EFFECTIVE_FROM,
    retrievedAt: MISSOULA_LAST_VERIFIED,
    lastVerifiedAt: MISSOULA_LAST_VERIFIED,
    notes:
      "Read 2026-09-26 via reader proxy (5 pp.). Carries the building project-cost ladder (a $1,000-wide row grid from $1 to $100,000, then four wide marginal bands: $1,869 + $11.73 per $1,000 to $500,000; $6,563 + $7.82 to $1,000,000; $10,474 + $5.87 above), plan review at 30% of the building permit fee (§ 15.32.020(A), $62/hour for changes), the electrical residential flats and five-band commercial ladder, the plumbing issuance and unit rows, and the administrative/penalty apparatus (double fee for unpermitted work, stop work $255, reactivation $275, technology fee 5%). Adoption line: 'Passed and adopted Resolution 8887.'",
  },
  {
    key: MISS_RES_8970_SOURCE_KEY,
    jurisdictionKey: MISSOULA_KEYS.jurisdiction,
    title: "City of Missoula Resolution 8970 (adopted 2026-08-17, effective 2026-10-01) — Exhibits C (Building MEP) and D (Building Permits and Plan Review)",
    url: "https://www.ci.missoula.mt.us/DocumentCenter/View/82561/Resolution-8970",
    sourceType: "ordinance",
    issuingAuthority: "City of Missoula — City Council",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2026-08-17",
    effectiveFrom: "2026-10-01",
    retrievedAt: MISSOULA_LAST_VERIFIED,
    lastVerifiedAt: MISSOULA_LAST_VERIFIED,
    notes:
      "Read 2026-09-26 via reader proxy (10 pp.); every fee row re-read line by line from the exhibit text on 2026-09-27. The successor instrument, six days after this pass's date: the MEP trade rows rise roughly 18–19% (issuance $43→$51, fixtures and water heaters $16→$19, medical gas $140→$166, gray water $100→$119, commercial electrical bases $84/$167/$667/$1,229→$100/$198/$788/$1,452), the building ladder's grid prints numerically unchanged ($43 … $1,869 with the same three wide-band rates), solar goes $100→$250 and re-roof $281→$332, and the plan review splits — 'b. Residential Plan Review Fee: 30% of the building permit fee (round up to nearest dollar)' unchanged; 'c. Commercial Plan Review Fee: 65% of the building permit fee' raised from the existing 30%. Modelled as FY2027 rules on this source with effectiveFrom 2026-10-01; the FY2026 rules close their window the day before.",
  },
  {
    key: MISS_PACKET_SOURCE_KEY,
    jurisdictionKey: MISSOULA_KEYS.jurisdiction,
    title: "City of Missoula Building Permit Valuation & Plan Review Packet (V.01.0126)",
    url: "https://www.ci.missoula.mt.us/DocumentCenter/View/598/Building-Permit-Valuation--Plan-Review-Packet",
    sourceType: "municipal_website",
    issuingAuthority: "City of Missoula — Development Services",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2026-01-26",
    effectiveFrom: MISS_FY2026_EFFECTIVE_FROM,
    retrievedAt: MISSOULA_LAST_VERIFIED,
    lastVerifiedAt: MISSOULA_LAST_VERIFIED,
    notes:
      "Read 2026-09-26 via reader proxy (4 pp.). The City's own teaching document for the plan-review arithmetic: 'the plan review fee charged is 30% of the building permit fee.' Seven steps derive an artificial valuation from the 1998 Building Standards per-square-foot data (residential factors: dwelling $46.85, unfinished basement $10.11, attached garage $16.99, carport $11.53, detached garage $16.99, pole building $9.85), convert IBC construction types to the 1997 UBC terms, add sprinkler and air-conditioning multipliers, then apply the ladder and take 30%. Publicly bid projects over $50,000 may use bid value; remodels always use estimated job cost; combined addition/remodel uses the prevailing work.",
  },
];

/** Empty on purpose: the permit types Missoula uses already exist as shared rows. */
const permitTypes: JurisdictionSeed["permitTypes"] = [];
const projectTypes: JurisdictionSeed["projectTypes"] = [];

const jurisdictionPermitTypes: SeedJurisdictionPermitType[] = [
  {
    jurisdictionKey: MISSOULA_KEYS.jurisdiction,
    permitTypeKey: "building",
    isAvailable: true,
    localName: "Building permit — project-cost ladder with derived artificial valuations",
    officialUrl: "https://www.ci.missoula.mt.us/DocumentCenter/View/23902/Permit-Fee-Schedule-Building-Electrical-Mechanical-Demolition--Moving",
    notes:
      "The ladder prices on project cost in $1,000-wide printed rows from $1 to $100,000 (a ~100-row grid), then four wide marginal bands: $1,869 + $11.73 per $1,000 to $500,000, $6,563 + $7.82 to $1,000,000, $10,474 + $5.87 above. The project cost itself is usually artificial — derived from 1998 Building Standards per-square-foot factors ($46.85 dwelling, $10.11 unfinished basement, $16.99 garages) — with bid value allowed on publicly bid projects over $50,000. Plan review is 30% of the building permit fee, paid before review proceeds (65% commercial from October 1, 2026).",
  },
  {
    jurisdictionKey: MISSOULA_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    isAvailable: true,
    localName: "Electrical permit — residential flats by dwelling type, commercial five-band project-cost ladder",
    officialUrl: "https://www.ci.missoula.mt.us/DocumentCenter/View/23902/Permit-Fee-Schedule-Building-Electrical-Mechanical-Demolition--Moving",
    notes:
      "Residential: single-family $361 (100–300 A) or $560 (301+ A); addition/remodel/rewire $110; service upgrade $69; duplex $501; multi-family $278 plus $58 per unit up to 12 (over 12 units or other installations use the commercial ladder). Commercial (row 7) prices by project cost rounded to the nearest hundred: $84 to $500, then $84 + 9%, $167 + 3.5%, $667 + 1%, $1,229 + 0.5% — printed bases that do NOT chain at the seams, modelled as printed.",
  },
  {
    jurisdictionKey: MISSOULA_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    isAvailable: true,
    localName: "Plumbing permit — $43.00 issuance plus a unit-price list",
    officialUrl: "https://www.ci.missoula.mt.us/DocumentCenter/View/23902/Permit-Fee-Schedule-Building-Electrical-Mechanical-Demolition--Moving",
    notes:
      "Issuance $43, then unit rows: fixture/trap/stub-out $16, water heater $16, water piping $15, drainage repairs $16, lawn sprinkler/fire system $16 per meter, unprotected fixtures $16 each (1–4) or $8 each (5+), industrial pretreatment $21, medical gas $140 per system (1–5 outlets, $15 per additional), gray water $100. Resolution 8970 raises issuance to $51 and most rows by roughly 19% effective October 1, 2026.",
  },
];

const feeSchedules: SeedFeeSchedule[] = [
  {
    key: MISSOULA_KEYS.schedule,
    jurisdictionKey: MISSOULA_KEYS.jurisdiction,
    sourceKey: MISS_RES_8887_SOURCE_KEY,
    title: "Missoula FY2026 Building (MEC, PLM, ELC, RFG) Permit Fee Schedule",
    officialUrl: "https://www.ci.missoula.mt.us/DocumentCenter/View/23902/Permit-Fee-Schedule-Building-Electrical-Mechanical-Demolition--Moving",
    effectiveFrom: MISS_FY2026_EFFECTIVE_FROM,
    effectiveTo: MISS_FY2026_EFFECTIVE_TO,
    status: "active",
    lastVerifiedAt: MISSOULA_LAST_VERIFIED,
    notes:
      "This schedule's rules run through 2026-09-30 (the half-open window closes 2026-10-01), the day before Resolution 8970's successor rules take over — roughly 18–19% increases on the trade rows, an unchanged building ladder, and the commercial plan-review jump to 65%. The wide building bands' printed bases carry one-to-two-dollar rounding relative to the bands below run to their ceilings ($1,869 + 400 × $11.73 = $6,561 vs the printed $6,563) — modelled as printed.",
  },
  {
    key: MISSOULA_KEYS.scheduleFy27,
    jurisdictionKey: MISSOULA_KEYS.jurisdiction,
    sourceKey: MISS_RES_8970_SOURCE_KEY,
    title: "City of Missoula Building (MEC, PLM, ELC, RFG) Permit Fee Schedule — FY2027 (Resolution 8970, effective October 1, 2026)",
    officialUrl: "https://www.ci.missoula.mt.us/DocumentCenter/View/82561/Resolution-8970",
    effectiveFrom: MISS_FY2027_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: MISSOULA_LAST_VERIFIED,
    notes:
      "The successor schedule: same codes as FY2026 under new effective windows. Trade rows up roughly 18–19% (issuance $51, fixtures $19, water heaters $19, medical gas $166, gray water $119, commercial electrical bases $100/$198/$788/$1,452), building ladder grid unchanged, plan review 30% residential / 65% commercial, solar $250, re-roof $332. Every amount read from the exhibit's 'Existing $ Proposed $' pair columns on 2026-09-27.",
  },
];

function attach(
  permitTypeKey: string,
  rules: SeedFeeRule["rule"][],
  scheduleKey: string,
): SeedFeeRule[] {
  return rules.map((rule) => ({
    jurisdictionKey: MISSOULA_KEYS.jurisdiction,
    permitTypeKey,
    // Successor rules belong to the FY2027 schedule record, not the FY2026 one
    // they were modelled alongside: the schedule a rule hangs off is chosen by
    // the source instrument the rule cites.
    scheduleKey:
      rule.sourceId === MISS_RES_8970_SOURCE_KEY ? MISSOULA_KEYS.scheduleFy27 : scheduleKey,
    rule,
  }));
}

const feeRules: SeedFeeRule[] = [
  ...attach("building", MISS_BUILDING_RULES, MISSOULA_KEYS.schedule),
  ...attach("electrical", MISS_ELECTRICAL_RULES, MISSOULA_KEYS.schedule),
  ...attach("plumbing", MISS_PLUMBING_RULES, MISSOULA_KEYS.schedule),
];

const requirements: SeedRequirement[] = [
  {
    jurisdictionKey: MISSOULA_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "document",
    title: "The valuation is usually artificial — derived from square-foot factors",
    description:
      "The City's packet derives the project cost: dwelling area × $46.85, unfinished basements × $10.11, attached garage × $16.99, carport × $11.53, detached garage × $16.99, pole building × $9.85 (areas measured inside exterior walls). Publicly bid projects over $50,000 may use the bid value; remodels always use the estimated job cost; combined addition/remodel prices on the prevailing work.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: MISS_PACKET_SOURCE_KEY,
    lastVerifiedAt: MISSOULA_LAST_VERIFIED,
  },
  {
    jurisdictionKey: MISSOULA_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "Plan review is paid before review proceeds and is non-refundable",
    description:
      "The 30% plan review must be paid before the application is reviewed beyond initial screening; changed plans bill at $62.00/hour (half-hour minimum), and a third or later review cycle adds 10% of the original plan review each. From October 1, 2026, commercial review rises to 65% under Resolution 8970.",
    isMandatory: true,
    sortOrder: 20,
    sourceKey: MISS_RES_8887_SOURCE_KEY,
    lastVerifiedAt: MISSOULA_LAST_VERIFIED,
  },
  {
    jurisdictionKey: MISSOULA_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "other",
    title: "Commercial project cost rounds to the nearest hundred before the ladder",
    description:
      "§ D.7's own instruction: 'Please round project cost to the nearest hundred prior to using fee schedule' — the cost is all labor and material to the owner. A declared $5,140 job prices as $5,100, inside the $1,001–$10,000 band at $167 + 3.5% of the balance.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: MISS_RES_8887_SOURCE_KEY,
    lastVerifiedAt: MISSOULA_LAST_VERIFIED,
  },
  {
    jurisdictionKey: MISSOULA_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    requirementType: "other",
    title: "Unprotected fixtures step down at five",
    description:
      "§ C.2.f–g: unprotected fixtures, tanks, vats or backflow devices price $16 each for the first one to four, then $8 each from five — the per-unit schedule's own volume discount (a 12-fixture unprotected row prices 4 × $16 + 8 × $8 = $128).",
    isMandatory: false,
    sortOrder: 10,
    sourceKey: MISS_RES_8887_SOURCE_KEY,
    lastVerifiedAt: MISSOULA_LAST_VERIFIED,
  },
];

const profile: SeedProfile = {
  jurisdictionKey: MISSOULA_KEYS.jurisdiction,
  headline: "What construction permits cost in Missoula",
  summary:
    "Missoula prices construction permits from **Council resolutions with attached exhibits**. The FY2026 schedule (Resolution 8887) governs through September 30, 2026: the building permit climbs a **project-cost ladder** — a $1,000-wide printed grid from $43 to $1,869, then marginal bands of **$11.73, $7.82 and $5.87 per $1,000** above $100,000 — with **plan review at 30%** of the permit fee. Electrical splits **residential flats** ($361 single-family, $501 duplex, $278 + $58/unit multi-family) from a **five-band commercial ladder**; plumbing is a **$43.00 issuance plus a unit list**.",
  localContext:
    "Missoula's fee story on this pass's date is a changeover. Resolution 8887's schedule runs through September 30, 2026; Resolution 8970, adopted August 17 after two advertised hearings, takes over October 1 with roughly 18–19% increases on the electrical, plumbing and mechanical rows — the building ladder's grid itself unchanged — and one structural change: commercial plan review jumps from 30% to 65% of the building permit fee while residential stays at 30%. Every figure quoted here is the FY2026 amount; the successor amounts are modelled as rules that open that day.\n\nThe building ladder's most distinctive feature is upstream of the table: the project cost is usually **artificial**. The City's own packet derives it from 1998-era per-square-foot factors — $46.85 for dwelling area, $10.11 for unfinished basements, $16.99 for garages — rather than accepting the applicant's number, with bid value admitted only on publicly bid projects over $50,000. The ladder then prices that derived number in a fine printed grid, stepping roughly $22–$33 per $1,000 in the middle ranges before the wide marginal bands take over.\n\nThe trades follow the flat-plus-list pattern: electrical keys its residential rows on dwelling type and service amperage, and its commercial ladder is one of the few printed schedules whose band bases deliberately do not chain — each row's 'Fee Value shown for the first $X' stands alone, and the gaps are the printed schedule's own arithmetic.",
  valuationBasis:
    "The building ladder reads **project cost — usually the artificial valuation** derived from the packet's square-foot factors, with actual bid value allowed on publicly bid projects over $50,000 and remodels always at estimated job cost. Commercial electrical reads **project cost rounded to the nearest hundred** (all labor and material). Plumbing and residential-electrical rows read **counts**: fixtures, water heaters, units, medical-gas systems.",
  notIncluded:
    "These figures are the City's own permit amounts under the FY2026 schedule. They are not a project cost, and they exclude:\n\n- **The October 1, 2026 changes** — Resolution 8970's roughly 18–19% trade-row increases (solar $100→$250) and the 65% commercial plan review take effect six days after this data's verification date; this page quotes the FY2026 amounts in force through September 30, and the successors are priced by rules that open October 1.\n- **Mechanical permits** — issuance $43 plus $12–$159 per piece of equipment by BTU/horsepower class, recorded row by row in the research file.\n- **Demolition, solar and re-roof flats** — $356 whole-structure demolition, $100 solar (rising to $250 in October), $281 residential re-roof.\n- **Administrative and penalty rows** — double fee for unpermitted work, stop work $255, skipped inspection $156, reactivation $275, occupancy without a C.O. $500/day, the 5% technology fee and 3% card fee.\n- **Moving permits and the fire schedule** (Resolution 8971) — separate instruments.",
  seoTitle: "Missoula permit fees — the FY2026 schedule and its October 1 successor",
  seoDescription:
    "How Missoula prices construction permits: the artificial-valuation project-cost ladder, 30% plan review (65% commercial from October 1, 2026), residential-flat electrical, and the $43-plus-units plumbing list.",
  publishStatus: "published",
  noindex: false,
  lastReviewedAt: MISSOULA_LAST_VERIFIED,
};

const permitPages: SeedPermitPage[] = [
  {
    jurisdictionKey: MISSOULA_KEYS.jurisdiction,
    permitTypeKey: "building",
    slug: "building-permit-cost",
    title: "Missoula building permit cost",
    intro:
      "A Missoula building permit prices on **project cost — and the City usually derives that number itself**. The Building Permit Valuation & Plan Review Packet builds an **artificial valuation** from per-square-foot factors ($46.85 dwelling area, $10.11 unfinished basements, $16.99 garages), then the ladder prices it: a **$1,000-wide printed grid** from $43.00 to $1,869.00, then **$11.73 per $1,000** to $500,000, **$7.82** to $1,000,000, **$5.87** above. Plan review adds **30%** of the permit fee — paid before review proceeds.",
    localSummary:
      "The artificial valuation is the schedule's signature. A 2,000 sq ft house with a 1,000 sq ft unfinished basement and a 600 sq ft attached garage derives to 2,000 × $46.85 + 1,000 × $10.11 + 600 × $16.99 = $111,254 — and that derived number, not a contractor's estimate, walks the ladder. Bid value is admitted only on publicly bid projects over $50,000, and remodels always use the estimated job cost.\n\nThe ladder itself is a fine grid: $1,000-wide printed rows from $43.00 at $500 of cost to $1,869 at $100,000, stepping $22–$33 per row through the middle ranges. Above $100,000 the schedule prints four marginal bands — $1,869 + $11.73 per $1,000 to $500,000, then $6,563 + $7.82, then $10,474 + $5.87 — and their printed bases carry one-to-two dollars of rounding against the bands below, which the schedule owns and this page models as printed.\n\nPlan review is 30% of the computed fee for every class under Resolution 8887's FY2026 schedule — but from October 1, 2026, Resolution 8970 raises commercial review to 65% while residential stays at 30%. Changed plans bill at $62.00 an hour after the first review.",
    notIncluded:
      "This is the building permit fee under the FY2026 schedule. It excludes:\n\n- **The October 1, 2026 successor amounts** — Resolution 8970's roughly 18–19% trade-row increases and the 65% commercial plan review, priced by rules that open October 1, 2026 (not charged on this data's date).\n- **Trade permits** — electrical and plumbing price their own rows on their own pages.\n- **Mechanical, demolition, solar and re-roof permits** — flat rows on the same schedule, recorded in the research file.\n- **Administrative fees** — the 5% technology fee, reactivation $275, stop work $255, and the double fee for unpermitted work.",
    workedExample: {
      scenario:
        "A commercial build-out with a project cost of $650,000 (derived valuation), submitted through plan review.",
      inputs: {
        valuationCents: 65_000_000,
        occupancy: "commercial",
        workType: "new_construction",
        custom: {
          plan_review: true,
        },
      },
      notes:
        "Two lines — **$10,056.80**.\n\nBuilding ladder, second wide band ('$500,001 to $1,000,000'): base $6,563.00. The excess is $150,000 — 150 whole $1,000 steps at $7.82 = $1,173.00. Band total: $6,563.00 + $1,173.00 = $7,736.00.\n\nPlan review: 30% of the building permit fee — 0.30 × $7,736.00 = $2,320.80.\n\nTotal: $7,736.00 + $2,320.80 = **$10,056.80**.\n\nWhat moves it: from October 1, 2026 the commercial plan review is 65%, not 30% — the same project would pay $5,028.40 of review, $10,588.40 more than a dollar-for-dollar FY2026 comparison suggests; and 'or fraction thereof' rounds each $1,000 step up.",
    },
    faqs: [
      {
        question: "How is a building permit's project cost determined in Missoula?",
        answer:
          "Usually artificially: the City's packet multiplies your areas by per-square-foot factors — $46.85 dwelling, $10.11 unfinished basement, $16.99 attached or detached garage, $11.53 carport, $9.85 pole building — and the total walks the ladder. Publicly bid projects over $50,000 may use the bid value; remodels always use the estimated job cost.",
        sourceId: MISS_PACKET_SOURCE_KEY,
      },
      {
        question: "How much is a building permit for a $400,000 house in Missoula?",
        answer:
          "Band 1 of the wide bands: $1,869.00 for the first $100,000 plus 300 whole $1,000 steps at $11.73 = $3,519.00 — $5,388.00, plus 30% plan review ($1,616.40) if plans are reviewed.",
        sourceId: MISS_RES_8887_SOURCE_KEY,
      },
      {
        question: "What is the plan review fee in Missoula?",
        answer:
          "30 percent of the building permit fee under the FY2026 schedule, for every occupancy, paid before review proceeds and non-refundable. From October 1, 2026, commercial review rises to 65% under Resolution 8970 while residential stays at 30%.",
        sourceId: MISS_RES_8887_SOURCE_KEY,
      },
      {
        question: "What happens if my plans need several review cycles?",
        answer:
          "Changes bill at $62.00 per hour with a half-hour minimum; once a project needs three or more review cycles, each additional cycle adds 10% of the original plan-review fee (a resubmittal fee Resolution 8970 carries forward).",
        sourceId: MISS_RES_8887_SOURCE_KEY,
      },
      {
        question: "Are Missoula's permit fees changing?",
        answer:
          "Yes — Resolution 8970 (adopted August 17, 2026) raises nearly every fee about 5% effective October 1, 2026, and splits plan review: residential 30%, commercial 65%. Every amount on this page is the FY2026 figure in force through September 30.",
        sourceId: MISS_RES_8970_SOURCE_KEY,
      },
      {
        question: "What if I build without a permit in Missoula?",
        answer:
          "Double the permit fee — and where the doubled fee is less than the Stop Work Order fee, the $255.00 stop-work fee is charged instead. Emergencies may proceed, with the permit application due the next business day.",
        sourceId: MISS_RES_8887_SOURCE_KEY,
      },
    ],
    seoTitle: "Missoula building permit cost: artificial valuations and the project-cost ladder",
    seoDescription:
      "Missoula building permit fees — the $46.85/sq ft derived valuation, the $1,000-wide project-cost grid to $1,869, marginal bands above $100,000, and the 30% plan review (65% commercial from October 2026).",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: MISSOULA_LAST_VERIFIED,
  },
  {
    jurisdictionKey: MISSOULA_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    slug: "electrical-permit-cost",
    title: "Missoula electrical permit cost",
    intro:
      "A Missoula electrical permit keys on **dwelling type**. A single-family new build is **$361.00** (100–300 A) or **$560.00** (301+ A); a duplex $501.00; multi-family $278.00 plus **$58.00 per unit** to 12 units. Commercial and everything else climbs a **five-band project-cost ladder** — $84.00 to $500, then **$84 + 9%**, **$167 + 3.5%**, **$667 + 1%**, **$1,229 + 0.5%** — with printed bases that deliberately stand alone.",
    localSummary:
      "The residential rows are named for the job: one flat covers a single-family service of 100 to 300 amps, another everything above; the $69.00 service-upgrade row includes alternative-energy connections. Multi-family prices twice — $278.00 for the building (3–12 units) plus $58.00 per unit — and § 7 takes over past 12 units or for any other installation.\n\nThe commercial ladder has an honest quirk: its band bases do not chain. $84.00 plus 9% of the $500 balance is $129.00 at $1,000, but the next band's printed base is $167.00 — the schedule's rows stand alone, and this page prices them as printed. Also note the rounding rule: commercial project cost rounds to the nearest hundred before the ladder reads it.\n\nResolution 8970 raises every base about 18% effective October 1, 2026 ($100/$198/$788/$1,452) — the FY2026 amounts here are what applies through September 30.",
    notIncluded:
      "This is the electrical permit fee under the FY2026 schedule. It excludes:\n\n- **The building permit** and its 30% plan review — on the building page.\n- **Accessory, mobile-home and special-installation flats** — $43–$110 (detached buildings by amperage, courts, irrigation wells, pumps, temporary services, STEP systems), recorded in the research file.\n- **The October 1, 2026 successor amounts** — modelled as rules that open October 1, 2026; not charged on this data's date.\n- **Miscellaneous residential wiring rows** — $43.00 under $50 of labor and materials, $80.00 above — recorded.",
    workedExample: {
      scenario:
        "A commercial electrical scope with a project cost of $60,000 (labor plus material, rounded to the nearest hundred).",
      inputs: {
        valuationCents: 6_000_000,
        occupancy: "commercial",
        workType: "new_construction",
      },
      notes:
        "One line — **$1,279.00**.\n\n§ D.7, band e ('$50,001 or more'): base $1,229.00. The excess is $10,000 — 0.5% = $50.00.\n\nTotal: $1,229.00 + $50.00 = **$1,279.00**.\n\nWhat moves it: the rounding rule — a declared $60,040 rounds to $60,000, no change; and the printed bases stand alone, so a $50,000 job (band d) prices $667 + 1% of $40,000 = $1,067.00, not band e's $1,229.00 base.",
    },
    faqs: [
      {
        question: "How much is an electrical permit for a new house in Missoula?",
        answer:
          "$361.00 for a 100–300 amp service, $560.00 for 301+ amps. A duplex is $501.00 at any capacity; an addition, remodel or interior rewire is $110.00; a service upgrade including alternative-energy connections is $69.00.",
        sourceId: MISS_RES_8887_SOURCE_KEY,
      },
      {
        question: "How is a commercial electrical permit calculated?",
        answer:
          "By project cost rounded to the nearest hundred: $84.00 to $500, then $84 + 9% of the balance to $1,000, $167 + 3.5% to $10,000, $667 + 1% to $50,000, $1,229 + 0.5% above — each band's printed base stands alone rather than chaining.",
        sourceId: MISS_RES_8887_SOURCE_KEY,
      },
      {
        question: "What does a multi-family electrical permit cost?",
        answer:
          "$278.00 for the building (3–12 units) plus $58.00 per unit of new construction — a 12-unit building prices $278 + 12 × $58 = $974.00. Over 12 units, the commercial project-cost ladder applies instead.",
        sourceId: MISS_RES_8887_SOURCE_KEY,
      },
      {
        question: "Are Missoula electrical fees going up?",
        answer:
          "Yes — Resolution 8970 raises the commercial bases to $100/$198/$788/$1,452 and most residential rows about 19% effective October 1, 2026. The FY2026 amounts apply through September 30.",
        sourceId: MISS_RES_8970_SOURCE_KEY,
      },
      {
        question: "Does the electrical permit read the whole project's value?",
        answer:
          "No — the commercial ladder reads the electrical project cost (all labor and material to the owner), not the building's value; and the residential rows are flats keyed on dwelling type and amperage, reading no valuation at all.",
        sourceId: MISS_RES_8887_SOURCE_KEY,
      },
      {
        question: "Where do Missoula electrical permits come from?",
        answer:
          "Development Services (CPDI) at 435 Ryman Street, through the City's Accela portal. The fee schedule is Resolution 8887's Exhibit C in force through September 30, 2026, succeeded by Resolution 8970's amounts on October 1.",
        sourceId: MISS_RES_8887_SOURCE_KEY,
      },
    ],
    seoTitle: "Missoula electrical permit cost: residential flats and the commercial ladder",
    seoDescription:
      "Missoula electrical permit fees — $361/$560 single-family, $278 + $58/unit multi-family, and the five-band commercial project-cost ladder whose printed bases stand alone.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: MISSOULA_LAST_VERIFIED,
  },
  {
    jurisdictionKey: MISSOULA_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    slug: "plumbing-permit-cost",
    title: "Missoula plumbing permit cost",
    intro:
      "A Missoula plumbing permit is a **$43.00 issuance fee plus a unit list**. Every row is a count times a price: **fixtures, traps or stub-outs $16.00**, water heaters $16.00, water piping $15.00, unprotected fixtures $16.00 each dropping to **$8.00 from the fifth**, medical gas $140.00 per system, gray water $100.00.",
    localSummary:
      "The issuance fee is the permit's floor and the unit rows stack on it: a bathroom rough-in with six fixtures prices 6 × $16.00 plus $43.00 — $139.00 — whether the house is modest or expensive. The fixture row is a pure count with no valuation input.\n\nTwo rows carry their own structure. The unprotected-fixture row steps down at five ($16.00 each for one to four, $8.00 each from the fifth — the schedule's own volume discount), and medical gas prices per system rather than per outlet: $140.00 covers one to five outlets, with $15.00 per additional outlet beyond.\n\nResolution 8970 raises issuance to $51.00 and most unit rows to $19.00 effective October 1, 2026 — the FY2026 amounts here apply through September 30.",
    notIncluded:
      "This is the plumbing permit fee under the FY2026 schedule. It excludes:\n\n- **The building permit** and its 30% plan review — on the building page.\n- **Unmodelled unit rows** — water piping $15.00, drainage/vent repairs $16.00, lawn sprinkler or fire protection systems $16.00 per meter, industrial pretreatment $21.00.\n- **The October 1, 2026 successor amounts** — issuance $51, fixtures $19, medical gas $166, gray water $119 — modelled as rules that open October 1, 2026.\n- **Mechanical permits** — the equipment rows on the same schedule, recorded without their own page.",
    workedExample: {
      scenario:
        "A commercial tenant-finish plumbing scope: 12 fixtures, 1 water heater and 1 gray-water system.",
      inputs: {
        occupancy: "commercial",
        workType: "new_construction",
        fixtures: 12,
        custom: {
          water_heaters: 1,
          graywater_system: true,
        },
      },
      notes:
        "Four lines — **$351.00**.\n\nPermit issuance: $43.00. Fixtures: 12 × $16.00 = $192.00. Water heater: 1 × $16.00 = $16.00. Gray water system: $100.00.\n\nTotal: $43 + $192 + $16 + $100 = **$351.00**.\n\nWhat moves it: the fixture count drives the fee — the $16.00 row is a pure count; and from October 1, 2026 the same scope prices $51 + 12 × $19 + $19 + $119 = $417.00 under Resolution 8970.",
    },
    faqs: [
      {
        question: "How much is a plumbing permit in Missoula?",
        answer:
          "$43.00 for issuance plus the unit rows: $16.00 per fixture, trap or stub-out; $16.00 per water heater; $15.00 water piping; $16.00 per meter for sprinkler or fire systems; $140.00 per medical-gas system; $100.00 per gray-water installation.",
        sourceId: MISS_RES_8887_SOURCE_KEY,
      },
      {
        question: "Do fixture fees drop at volume?",
        answer:
          "On the unprotected-fixture row: $16.00 each for the first one to four, then $8.00 each from five — a 12-fixture unprotected line prices 4 × $16 + 8 × $8 = $128.00.",
        sourceId: MISS_RES_8887_SOURCE_KEY,
      },
      {
        question: "What does a water heater replacement permit cost?",
        answer:
          "$16.00 for the water-heater row plus the $43.00 issuance — $59.00 on a stand-alone permit. From October 1, 2026 the same permit is $70.00 under Resolution 8970.",
        sourceId: MISS_RES_8887_SOURCE_KEY,
      },
      {
        question: "How is medical gas permitted?",
        answer:
          "Per system: $140.00 covers one medical-gas or vacuum piping system of one to five outlets, plus $15.00 for each additional outlet over five — a system charge, not an outlet count.",
        sourceId: MISS_RES_8887_SOURCE_KEY,
      },
      {
        question: "Is the plumbing fee valuation-based?",
        answer:
          "No — the plumbing rows are counts and flats. The only valuation ladder on the schedule is the building permit's, and stand-alone plumbing permits never read it.",
        sourceId: MISS_RES_8887_SOURCE_KEY,
      },
      {
        question: "When do Missoula plumbing fees change?",
        answer:
          "October 1, 2026: Resolution 8970 raises issuance to $51.00 and most rows about 19% (fixtures $19.00, gray water $119.00). The FY2026 amounts apply to applications through September 30 — 'based on application date', as the schedule's own line puts it.",
        sourceId: MISS_RES_8970_SOURCE_KEY,
      },
    ],
    seoTitle: "Missoula plumbing permit cost: $43 issuance plus the unit list",
    seoDescription:
      "Missoula plumbing permit fees — $43.00 issuance, $16.00 fixtures and water heaters, the 5-fixture volume step to $8.00, $140.00 medical gas, and the October 2026 increase recorded.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: MISSOULA_LAST_VERIFIED,
  },
];

const verifications: SeedVerification[] = [
  {
    entityType: "fee_schedule",
    entityKey: MISSOULA_KEYS.schedule,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: MISSOULA_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MISS_RES_8887_SOURCE_KEY,
    notes:
      "The FY2026 schedule read in full via reader proxy; the building grid's ~100 printed row amounts dumped and reproduced by the block decomposition; the wide bands' printed bases ($1,869/$6,563/$10,474) verified with their one-to-two-dollar rounding documented; the commercial electrical ladder's non-chaining bases verified as printed ($84 + 9% × $500 = $129 vs the next base $167).",
  },
  {
    entityType: "jurisdiction_profile",
    entityKey: MISSOULA_KEYS.jurisdiction,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: MISSOULA_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MISS_RES_8970_SOURCE_KEY,
    notes:
      "Authority confirmed: the Fee Schedules hub links Resolution 8970 (adopted 8/17/2026, effective 10/1/2026, Exhibits A–D) above the FY2026 schedule; the 8887 schedule's own line reads 'Passed and adopted Resolution 8887' with 'Effective January 1, 2026 – December 31, 2026. Based on application date.'",
  },
  {
    entityType: "permit_page",
    entityKey: "building-permit-cost",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: MISSOULA_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MISS_RES_8887_SOURCE_KEY,
    notes: "Worked example reproduces the second wide band ($7,736.00) and the 30% plan review ($2,320.80).",
  },
  {
    entityType: "permit_page",
    entityKey: "electrical-permit-cost",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: MISSOULA_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MISS_RES_8887_SOURCE_KEY,
    notes: "Worked example reproduces § D.7.e at $60,000 of project cost ($1,279.00).",
  },
  {
    entityType: "permit_page",
    entityKey: "plumbing-permit-cost",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: MISSOULA_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MISS_RES_8887_SOURCE_KEY,
    notes: "Worked example reproduces issuance plus 12 fixtures, a water heater and gray water ($351.00).",
  },
];

export const missoulaSeed: JurisdictionSeed = {
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
