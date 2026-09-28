import type { FeeCondition, FeeRuleRecord } from "@/lib/calc/types";

/**
 * Bismarck fee rules — the Community Development Department's own fee sheets.
 *
 * Every figure below is transcribed from the documents named in
 * research/north-dakota/bismarck.md:
 *
 *  - **One ladder, printed on both building sheets.** The residential sheet ("Last
 *    Revised 1/01/25") and the commercial sheet ("Last Revised 1/10/2018") print eight
 *    bands that are numerically identical — same bases, same rates — so the ladder is
 *    modelled once (reading a), sourced to the later revision. The sheets differ in
 *    exactly one printed price: the commercial sheet's unconditional "Review Fee of 20%
 *    of the permit fee … added to all Commercial Building Permits", which the
 *    residential sheet does not print (reading d).
 *  - **Neither sheet prints "or fraction thereof"**, so every band prorates (reading b)
 *    — the opposite of Fargo's sheets, which print the phrase in every band. $2,500 of
 *    job cost is $67.75 + $4.20 here, where a round-up reading would be $76.15.
 *  - **The trade sheet** (same 2018 revision) carries the plumbing four-band ladder, the
 *    $25 electrical permit, septic at $75, and the building-shaped flat rows: demolition
 *    $75, moving $25, manufactured homes $150, home occupation $25, temporary use $50.
 *  - **Electrical's second source is the state board.** NDSEB's job-cost bands
 *    (Effective July 1, 2024) ride every installation as state fees — Bismarck publishes
 *    no other electrical figure than its own $25 permit.
 */

/* -------------------------------------------------------------------------- */
/* Source, schedule and date keys                                             */
/* -------------------------------------------------------------------------- */

export const BISMARCK_RESIDENTIAL_SCHEDULE_SOURCE_KEY = "bismarck-residential-permit-fees";
export const BISMARCK_COMMERCIAL_SCHEDULE_SOURCE_KEY = "bismarck-commercial-permit-fees";
export const BISMARCK_TRADE_SCHEDULE_SOURCE_KEY = "bismarck-trade-permit-fees";
export const BISMARCK_HUB_SOURCE_KEY = "bismarck-permit-fees-hub";
export const BISMARCK_TITLE4_SOURCE_KEY = "bismarck-title-4";
export const BISMARCK_NDSEB_SOURCE_KEY = "bismarck-ndseb-inspection-fees";

/** The residential sheet: "Last Revised 1/01/25". */
export const BISMARCK_RESIDENTIAL_EFFECTIVE_FROM = "2025-01-01";
/** The commercial and trade sheets both print "Last Revised 1/10/2018". */
export const BISMARCK_TRADE_EFFECTIVE_FROM = "2018-01-10";
/** NDSEB's Inspection Fees page: "Effective July 1, 2024". */
export const BISMARCK_NDSEB_EFFECTIVE_FROM = "2024-07-01";

/* -------------------------------------------------------------------------- */
/* Rule helper                                                                */
/* -------------------------------------------------------------------------- */

function bismarckRule(
  sourceId: string,
  effectiveFrom: string,
  overrides: Pick<FeeRuleRecord, "id" | "code" | "label" | "feeType" | "config"> &
    Partial<FeeRuleRecord>,
): FeeRuleRecord {
  return {
    description: null,
    componentType: "base",
    conditions: null,
    minimumCents: null,
    maximumCents: null,
    priority: 100,
    effectiveFrom,
    effectiveTo: null,
    status: "active",
    sourceId,
    ...overrides,
  };
}

const RES_SHEET = BISMARCK_RESIDENTIAL_SCHEDULE_SOURCE_KEY;
const COM_SHEET = BISMARCK_COMMERCIAL_SCHEDULE_SOURCE_KEY;
const TRADE_SHEET = BISMARCK_TRADE_SCHEDULE_SOURCE_KEY;
const NDSEB = BISMARCK_NDSEB_SOURCE_KEY;
const RES_EFF = BISMARCK_RESIDENTIAL_EFFECTIVE_FROM;
const TRADE_EFF = BISMARCK_TRADE_EFFECTIVE_FROM;
const NDSEB_EFF = BISMARCK_NDSEB_EFFECTIVE_FROM;

/* -------------------------------------------------------------------------- */
/* The shared building ladder — one table, both sheets (reading a)            */
/* -------------------------------------------------------------------------- */

type BismarckBand = {
  code: string;
  baseCents: number;
  /** 0 on the flat first band. */
  centsPerThousand: number;
  lowExclusive: number;
  highInclusive: number | null;
  printed: string;
};

/**
 * The eight bands, transcribed from the residential sheet's "permit fee multiplier"
 * table — whose eight rows are numerically identical to the commercial sheet's own.
 * Every band after the first is a per-thousand rate with a threshold and **no**
 * increment: neither sheet prints "or fraction thereof", so the fraction of a step is
 * charged as the fraction it is (reading b).
 */
const BISMARCK_BUILDING_BANDS: BismarckBand[] = [
  {
    code: "BLD-LADDER-UP-TO-500",
    baseCents: 4_000,
    centsPerThousand: 0,
    lowExclusive: 0,
    highInclusive: 50_000,
    printed: "$0.00 to $500.00 — $40.00",
  },
  {
    code: "BLD-LADDER-501-2000",
    baseCents: 4_000,
    centsPerThousand: 1_850,
    lowExclusive: 50_000,
    highInclusive: 200_000,
    printed:
      "$501.00 to $2,000.00 — $40.00 for first $500.00 PLUS $1.85 for each additional $100.00",
  },
  {
    code: "BLD-LADDER-2001-25000",
    baseCents: 6_775,
    centsPerThousand: 840,
    lowExclusive: 200_000,
    highInclusive: 2_500_000,
    printed:
      "$2,001 to $25,000.00 — $67.75 for first $2,000.00 PLUS $8.40 for each additional $1000.00",
  },
  {
    code: "BLD-LADDER-25001-50000",
    baseCents: 26_095,
    centsPerThousand: 610,
    lowExclusive: 2_500_000,
    highInclusive: 5_000_000,
    printed:
      "$25,001.00 to $50,000.00 — $260.95 for first $25,000.00 PLUS $6.10 for each additional $1000.00",
  },
  {
    code: "BLD-LADDER-50001-100000",
    baseCents: 41_345,
    centsPerThousand: 420,
    lowExclusive: 5_000_000,
    highInclusive: 10_000_000,
    printed:
      "$50,001.00 to $100,000.00 — $413.45 for first $50,000.00 PLUS $4.20 for each additional $1000.00",
  },
  {
    code: "BLD-LADDER-100001-500000",
    baseCents: 62_345,
    centsPerThousand: 340,
    lowExclusive: 10_000_000,
    highInclusive: 50_000_000,
    printed:
      "$100,001.00 to $500,000.00 — $623.45 for first $100,000 PLUS $3.40 for each additional $1,000.00",
  },
  {
    code: "BLD-LADDER-500001-1000000",
    baseCents: 198_345,
    centsPerThousand: 285,
    lowExclusive: 50_000_000,
    highInclusive: 100_000_000,
    printed:
      "$500,001.00 to $1,000,000.00 — $1,983.45 for first $500,000.00 PLUS $2.85 for each additional $1,000.00",
  },
  {
    code: "BLD-LADDER-1000001-AND-UP",
    baseCents: 340_845,
    centsPerThousand: 220,
    lowExclusive: 100_000_000,
    highInclusive: null,
    printed:
      "$1,000,001.00 and Higher — $3,408.45 for first $1,000,000.00 PLUS $2.20 for each additional $1,000.00",
  },
];

/**
 * One band of the shared ladder.
 *
 * The bands carry no construction-class gate — both sheets print the same table, so
 * one rule set answers both classes and a test charges each class at several valuations
 * to keep them identical (reading a). The one extra gate is `not(work_type
 * demolition)`: the trade sheet prices demolition at its own flat $75 row, and the
 * ladder prices construction, so a demolition with a valuation attached must not pay
 * both — the same exclusion Fargo's sheets get.
 */
function bismarckLadderRule(band: BismarckBand): FeeRuleRecord {
  const range: FeeCondition[] = [];
  if (band.lowExclusive > 0) {
    range.push({ field: "valuation", op: "gt", value: band.lowExclusive });
  }
  if (band.highInclusive !== null) {
    range.push({ field: "valuation", op: "lte", value: band.highInclusive });
  }
  const notDemolition: FeeCondition = {
    not: { field: "work_type", op: "eq", value: "demolition" },
  };

  const sharedNote =
    "Printed identically on the residential sheet and the commercial sheet — same base, same rate — so this is one rule answering both classes rather than two rules that must agree.";

  if (band.centsPerThousand === 0) {
    return bismarckRule(RES_SHEET, RES_EFF, {
      id: `bismarck-bld-${band.code.toLowerCase()}`,
      code: band.code,
      label: `Building permit — ${band.printed.split(" — ")[0]} ($${(band.baseCents / 100).toFixed(2)})`,
      feeType: "flat",
      config: { amountCents: band.baseCents },
      conditions: { all: [notDemolition, ...range] },
      description: `${sharedNote} "${band.printed}" — a flat fee for the smallest jobs, the ladder's floor.`,
    });
  }

  return bismarckRule(RES_SHEET, RES_EFF, {
    id: `bismarck-bld-${band.code.toLowerCase()}`,
    code: band.code,
    label: `Building permit — ${band.printed.split(" — ")[0]}`,
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      centsPerThousand: band.centsPerThousand,
      thresholdCents: band.lowExclusive,
      baseCents: band.baseCents,
    },
    conditions: { all: [notDemolition, ...range] },
    description: `${sharedNote} "${band.printed}". Neither sheet prints "or fraction thereof" — the phrase Fargo's sheets print in every band and Bismarck never prints — so the cost above the threshold is charged as the fraction it is: $2,500 of job cost is $67.75 plus $500's share of the $8.40 rate, or $4.20, for $71.95 where a whole-thousand reading would be $76.15. The ladder closes at every seam — ${band.highInclusive === 2_500_000 ? "$40.00 + 15 × $1.85 is exactly $67.75 at $2,000, the base this band prints" : band.highInclusive === 5_000_000 ? "$67.75 + 23 × $8.40 is exactly $260.95 at $25,000, the base this band prints" : band.highInclusive === 10_000_000 ? "$260.95 + 25 × $6.10 is exactly $413.45 at $50,000, the base this band prints" : band.highInclusive === 50_000_000 ? "$413.45 + 50 × $4.20 is exactly $623.45 at $100,000, the base this band prints" : band.highInclusive === 100_000_000 ? "$623.45 + 400 × $3.40 is exactly $1,983.45 at $500,000, the base this band prints" : band.lowExclusive === 100_000_000 ? "$1,983.45 + 500 × $2.85 is exactly $3,408.45 at $1,000,000, this band's own base" : "each band's endpoint is the printed base of the band above it"}${band.code === "BLD-LADDER-50001-100000" ? '. Both sheets\' own typography is read as the figure the arithmetic confirms: the residential copy prints this band\'s range as "$50,0001.00" (a typo for $50,001.00, since $260.95 + 25 × $6.10 is exactly $413.45 at $50,000) and the commercial copy prints its rate as "$$4.20" (a doubled dollar sign, since $413.45 + 50 × $4.20 closes the next seam at $623.45)' : ""}.`,
  });
}

export const BISMARCK_BUILDING_LADDER_RULES: FeeRuleRecord[] =
  BISMARCK_BUILDING_BANDS.map(bismarckLadderRule);

/**
 * "A Review Fee of 20% of the permit fee will be added to **all** Commercial Building
 * Permits" — unconditional, because the sheet does not condition it (reading d).
 *
 * No plan-review fact gates it: the class is the only gate the sentence leaves open,
 * and the residential sheet prints no such line, so no residential twin exists. The
 * percentage reads `permit_fee`, and Bismarck prints no application fee for it to have
 * swallowed — the sheets carry no application fee at all.
 */
export const BISMARCK_COMMERCIAL_REVIEW_FEE = bismarckRule(COM_SHEET, TRADE_EFF, {
  id: "bismarck-bld-review-20",
  code: "BLD-REVIEW-20",
  label: "Commercial building permit — review fee, 20% of the permit fee",
  feeType: "percent",
  componentType: "plan_review",
  priority: 200,
  config: { basis: "permit_fee", rateBps: 2_000 },
  conditions: { not: { field: "custom.one_two_family", op: "eq", value: true } },
  description:
    'Commercial sheet (Last Revised 1/10/2018): "A Review Fee of 20% of the permit fee will be added to all Commercial Building Permits." The word the sentence turns on is "all": there is no condition about plans, so no plan-review fact gates this rule — the class is the only switch the sheet leaves, and the residential sheet, which prints no review line, charges no twin of it. The percentage reads the permit fee the ladder computed, and nothing else sits between them: Bismarck prints no application fee on either sheet.',
});

/* -------------------------------------------------------------------------- */
/* The trade sheet's building-shaped flat rows (reading f)                    */
/* -------------------------------------------------------------------------- */

const BISMARCK_TRADE_BUILDING_ROWS: Array<{
  code: string;
  amountCents: number;
  row: string;
  conditions: FeeCondition | null;
}> = [
  {
    code: "BLD-DEMOLITION",
    amountCents: 7_500,
    row: "Demolition",
    conditions: { field: "work_type", op: "eq", value: "demolition" },
  },
  {
    code: "BLD-MOVING",
    amountCents: 2_500,
    row: "Moving",
    conditions: { field: "custom.house_moving", op: "eq", value: true },
  },
  {
    code: "BLD-MANUFACTURED-HOME",
    amountCents: 15_000,
    row: "Manufactured Homes",
    conditions: { field: "custom.manufactured_home", op: "eq", value: true },
  },
  {
    code: "BLD-HOME-OCCUPATION",
    amountCents: 2_500,
    row: "Home Occupation",
    conditions: { field: "custom.home_occupation", op: "eq", value: true },
  },
  {
    code: "BLD-TEMPORARY-USE",
    amountCents: 5_000,
    row: "Temporary Use",
    conditions: { field: "custom.temporary_use", op: "eq", value: true },
  },
];

export const BISMARCK_TRADE_BUILDING_RULES: FeeRuleRecord[] =
  BISMARCK_TRADE_BUILDING_ROWS.map((entry) =>
    bismarckRule(TRADE_SHEET, TRADE_EFF, {
      id: `bismarck-bld-${entry.code.toLowerCase()}`,
      code: entry.code,
      label: `Building permit — ${entry.row.toLowerCase()}, $${(entry.amountCents / 100).toFixed(2)}`,
      feeType: "flat",
      config: { amountCents: entry.amountCents },
      conditions: entry.conditions,
      description: `Additional Permit Fees sheet (Last Revised 1/10/2018), the trade permit this row prices: "${entry.row} — $${(entry.amountCents / 100).toFixed(2)}". A flat price for a permit the building ladder does not measure — these rows answer their own facts beside the ladder, never through it, and the ladder bands exclude demolition work so the two never answer the same job.`,
    }),
  );

export const BISMARCK_BUILDING_RULES: FeeRuleRecord[] = [
  ...BISMARCK_BUILDING_LADDER_RULES,
  BISMARCK_COMMERCIAL_REVIEW_FEE,
  ...BISMARCK_TRADE_BUILDING_RULES,
];

/* -------------------------------------------------------------------------- */
/* Electrical — the City's $25 permit plus the state board's fees             */
/* -------------------------------------------------------------------------- */

/** "Electrical permits $25.00" — the only electrical figure the City prints. */
export const BISMARCK_ELECTRICAL_PERMIT = bismarckRule(TRADE_SHEET, TRADE_EFF, {
  id: "bismarck-elec-city-permit",
  code: "ELEC-CITY-PERMIT",
  label: "Electrical permit — City of Bismarck, $25.00",
  feeType: "flat",
  config: { amountCents: 2_500 },
  description:
    'Additional Permit Fees sheet (Last Revised 1/10/2018): "Electrical permits — $25.00". The City\'s whole published price for an electrical permit — flat, unconditional, and the base of every electrical total on this page. The rest of the money is the state board\'s, and the rules below say so by their component type.',
});

/**
 * NDSEB's two job-cost bands (Effective July 1, 2024) — prorated, because the state
 * table prints no round-up phrase anywhere (reading g).
 *
 * The first band is written as `not(valuation gt $20,000)` rather than `lte` so a
 * calculation with no valuation still reaches it: the rule then fails on its missing
 * basis and asks for the input, where `lte` on a missing fact would have excluded it
 * silently.
 */
export const BISMARCK_NDSEB_BAND_RULES: FeeRuleRecord[] = [
  {
    id: "bismarck-elec-ndseb-to-20000",
    code: "ELEC-NDSEB-UP-TO-20000",
    label: "Electrical — NDSEB inspection fee, job cost to $20,000 ($50 minimum, 2% of the balance over $500)",
    config: { basis: "valuation", thresholdCents: 50_000, rateBps: 200, baseCents: 5_000 },
    conditions: { not: { field: "valuation", op: "gt", value: 2_000_000 } },
    printed:
      "Up to $500.00 — $50.00 (minimum fee); $500.00 to $20,000.00 — $50.00 for the first $500.00 plus 2% on balance up to $20,000.00",
    description:
      'NDSEB Inspection Fees, effective July 1, 2024: "Up to $500.00 — $50.00 (minimum fee)" and "$500.00 to $20,000.00 — $50.00 for the first $500.00 plus 2% on balance up to $20,000.00". One rule holds both printed rows: the $50 base *is* the minimum fee below $500 (the threshold charges nothing there), and 2% runs on the balance above $500 up to $20,000, where $50 + 2% of $19,500 closes at exactly $440.00 — the base of the band above. Prorated: the state table prints no round-up phrase. The basis is "the total amount of the contract or total cost to the owner, including extras", less the four exclusions the board names (appliances, HVAC units, electric motors/PLC/generators, industrial machines).',
  },
  {
    id: "bismarck-elec-ndseb-over-20000",
    code: "ELEC-NDSEB-OVER-20000",
    label: "Electrical — NDSEB inspection fee, job cost over $20,000 ($440 for the first $20,000, 1/10 of 1% after)",
    config: { basis: "valuation", thresholdCents: 2_000_000, rateBps: 10, baseCents: 44_000 },
    conditions: { field: "valuation", op: "gt", value: 2_000_000 },
    printed:
      "Over $20,000.00 — $440.00 for the first $20,000.00 plus 1/10 of 1% on balance over $20,000.00",
    description:
      'NDSEB Inspection Fees, effective July 1, 2024: "Over $20,000.00 — $440.00 for the first $20,000.00 plus 1/10 of 1% on balance over $20,000.00" — a tenth of a percent (rateBps 10) on the balance, prorated, with the $440.00 closing the band below it exactly. The board\'s page prints the superseded table beneath this one; the July 1, 2024 figures are the ones charged.',
  },
].map((entry) =>
  bismarckRule(NDSEB, NDSEB_EFF, {
    id: entry.id,
    code: entry.code,
    label: entry.label,
    feeType: "percent",
    componentType: "state_surcharge",
    conditions: entry.conditions,
    config: entry.config,
    description: entry.description,
  }),
);

/** "the normal inspection fee … is increased in the amount of fifty dollars" (late certificate). */
export const BISMARCK_NDSEB_LATE_CERTIFICATE = bismarckRule(NDSEB, NDSEB_EFF, {
  id: "bismarck-elec-ndseb-late-certificate",
  code: "ELEC-NDSEB-LATE-CERTIFICATE",
  label: "Electrical — NDSEB late wiring certificate, $50.00",
  feeType: "flat",
  componentType: "state_surcharge",
  priority: 500,
  config: { amountCents: 5_000 },
  conditions: { field: "custom.late_certificate", op: "eq", value: true },
  description:
    'NDSEB Inspection Fees: "Whenever an electrical installation … is commenced or in use without submitting an electrical wiring certificate the certificate may be considered late and the normal inspection fee, as required under this section, is increased in the amount of fifty dollars." Charged when the filing is late — a state board increase, and the page says whose it is.',
});

export const BISMARCK_ELECTRICAL_RULES: FeeRuleRecord[] = [
  BISMARCK_ELECTRICAL_PERMIT,
  ...BISMARCK_NDSEB_BAND_RULES,
  BISMARCK_NDSEB_LATE_CERTIFICATE,
];

/* -------------------------------------------------------------------------- */
/* Plumbing — the trade sheet's four-band ladder and septic                    */
/* -------------------------------------------------------------------------- */

type BismarckPlumbingBand = {
  code: string;
  baseCents: number;
  centsPerThousand: number;
  lowExclusive: number;
  highInclusive: number | null;
  printed: string;
};

/**
 * The plumbing ladder — the same shape as the building ladder, its own figures, and
 * the same proration: no band prints the round-up phrase. The sheet's own seams close
 * ($40.00 + 18 × $1.65 = $69.70 at $20,000; $69.70 + 80 × $1.10 = $157.70 at $100,000)
 * and the tests walk them (reading c).
 */
const BISMARCK_PLUMBING_BANDS: BismarckPlumbingBand[] = [
  {
    code: "PLUMB-LADDER-UP-TO-2000",
    baseCents: 4_000,
    centsPerThousand: 0,
    lowExclusive: 0,
    highInclusive: 200_000,
    printed: "$0.00 to $2,000.00 — $40.00",
  },
  {
    code: "PLUMB-LADDER-2001-20000",
    baseCents: 4_000,
    centsPerThousand: 165,
    lowExclusive: 200_000,
    highInclusive: 2_000_000,
    printed:
      "$2,001.00 to $20,000.00 — $40.00 for first $2,000.00 PLUS $1.65 for each additional $1,000.00",
  },
  {
    code: "PLUMB-LADDER-20001-100000",
    baseCents: 6_970,
    centsPerThousand: 110,
    lowExclusive: 2_000_000,
    highInclusive: 10_000_000,
    printed:
      "$20,001.00 to $100,000.00 — $69.70 for first $20,000.00 PLUS $1.10 for each additional $1,000.00",
  },
  {
    code: "PLUMB-LADDER-100001-AND-UP",
    baseCents: 15_770,
    centsPerThousand: 60,
    lowExclusive: 10_000_000,
    highInclusive: null,
    printed:
      "$100,001.00 and Higher — $157.70 for first $100,000.00 PLUS $0.60 for each additional $1,000.00",
  },
];

function bismarckPlumbingRule(band: BismarckPlumbingBand): FeeRuleRecord {
  const range: FeeCondition[] = [];
  if (band.lowExclusive > 0) {
    range.push({ field: "valuation", op: "gt", value: band.lowExclusive });
  }
  if (band.highInclusive !== null) {
    range.push({ field: "valuation", op: "lte", value: band.highInclusive });
  }

  if (band.centsPerThousand === 0) {
    return bismarckRule(TRADE_SHEET, TRADE_EFF, {
      id: `bismarck-plumb-${band.code.toLowerCase()}`,
      code: band.code,
      label: `Plumbing permit — ${band.printed.split(" — ")[0]} ($${(band.baseCents / 100).toFixed(2)})`,
      feeType: "flat",
      config: { amountCents: band.baseCents },
      conditions: { all: range },
      description: `Additional Permit Fees sheet (Last Revised 1/10/2018), plumbing's own ladder: "${band.printed}" — the flat floor for the smallest jobs, on the same total-cost-of-job basis the building ladder uses.`,
    });
  }

  return bismarckRule(TRADE_SHEET, TRADE_EFF, {
    id: `bismarck-plumb-${band.code.toLowerCase()}`,
    code: band.code,
    label: `Plumbing permit — ${band.printed.split(" — ")[0]}`,
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      centsPerThousand: band.centsPerThousand,
      thresholdCents: band.lowExclusive,
      baseCents: band.baseCents,
    },
    conditions: { all: range },
    description: `Additional Permit Fees sheet (Last Revised 1/10/2018), plumbing's own ladder: "${band.printed}". Prorated, like every band on this sheet — no band prints "or fraction thereof" — so $2,500 of plumbing cost is $40.00 plus $500's share of the $1.65 rate. The ladder closes at its seams: ${band.highInclusive === 2_000_000 ? "$40.00 + 18 × $1.65 is exactly $69.70 at $20,000, the base this band prints" : band.highInclusive === 10_000_000 ? "$69.70 + 80 × $1.10 is exactly $157.70 at $100,000, the base this band prints" : band.lowExclusive === 10_000_000 ? "$69.70 + 80 × $1.10 is exactly $157.70 at $100,000, this band's own base" : "each band's endpoint is the printed base of the band above it"} — and the trade sheet's mechanical ladder, printed with figures identical to this one, is quoted on the page as a separate permit rather than attached to a page this site does not publish.`,
  });
}

export const BISMARCK_PLUMBING_LADDER_RULES: FeeRuleRecord[] =
  BISMARCK_PLUMBING_BANDS.map(bismarckPlumbingRule);

/** "Septic/Drainfield $75.00" — its own row on the same sheet. */
export const BISMARCK_SEPTIC_RULE = bismarckRule(TRADE_SHEET, TRADE_EFF, {
  id: "bismarck-plumb-septic-drainfield",
  code: "PLUMB-SEPTIC-DRAINFIELD",
  label: "Plumbing permit — septic/drainfield, $75.00",
  feeType: "flat",
  config: { amountCents: 7_500 },
  conditions: { field: "custom.septic_drainfield", op: "eq", value: true },
  description:
    'Additional Permit Fees sheet (Last Revised 1/10/2018): "Septic/Drainfield — $75.00". A flat row beside the plumbing ladder rather than a band of it — the sheet prices the permit by what it is, not by what the job costs, and the row answers its own fact beside any ladder band the job also triggers.',
});

export const BISMARCK_PLUMBING_RULES: FeeRuleRecord[] = [
  ...BISMARCK_PLUMBING_LADDER_RULES,
  BISMARCK_SEPTIC_RULE,
];
