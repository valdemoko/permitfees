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
import type { FeeRuleRecord } from "@/lib/calc/types";

import {
  SPRINGFIELD_BUILDING_FEE_RULES,
  SPRINGFIELD_COMMERCIAL_SOURCE_KEY,
  SPRINGFIELD_ELECTRICAL_BASE_RULES,
  SPRINGFIELD_IBC_SOURCE_KEY,
  SPRINGFIELD_PLUMBING_BASE_RULES,
  SPRINGFIELD_RESIDENTIAL_SOURCE_KEY,
  SPRINGFIELD_RESIDENTIAL_TRADE_FLATS,
} from "./fee-rules";

export * from "./fee-rules";

/**
 * The complete Springfield, Missouri seed payload.
 *
 * Every figure traces to research/missouri/springfield.md, which traces to
 * Building Development Services' own Commercial and Residential Construction fee
 * schedules (each Effective 07/01/2025) and to the 2009 IBC Fee Calculation Data
 * matrix (Effective July 1, 2009) that both schedules cite for the Type of
 * Construction Factor. Nothing is estimated.
 *
 * Three pages, all published: building, electrical and plumbing. Springfield is
 * this dataset's first jurisdiction whose **construction-factor marginal table**
 * prices a permit at **half cents** per factor — commercial 0.005 / 0.004 /
 * 0.003 / 0.0015 ($171 minimum), residential 0.004 / 0.003 / 0.002 / 0.001
 * ($151 minimum) at the fixed R-3/IRC factor 0.3876 — and whose dependent
 * technology and plan-review rows read `permit_fee` at 18.5% and 75%.
 */

const RESEARCHER = "Permit Fee Intelligence research pass 19 (Missouri)";

export const SPRINGFIELD_LAST_VERIFIED = "2026-09-26";

export const SPRINGFIELD_KEYS = {
  state: "mo",
  county: "greene-county",
  jurisdiction: "springfield",
  feeSchedule: "springfield-bds-fee-schedules",
  ibcSchedule: "springfield-ibc-fee-calculation-data",
} as const;

const state: SeedState = {
  code: "MO",
  slug: "missouri",
  name: "Missouri",
  fipsCode: "29",
};

const county: SeedCounty = {
  key: SPRINGFIELD_KEYS.county,
  slug: "greene-county",
  name: "Greene County",
  fipsCode: "29077",
};

const jurisdiction: SeedJurisdiction = {
  key: SPRINGFIELD_KEYS.jurisdiction,
  stateKey: SPRINGFIELD_KEYS.state,
  countyKey: SPRINGFIELD_KEYS.county,
  type: "city",
  slug: "springfield",
  name: "Springfield",
  officialName: "City of Springfield, Missouri",
  websiteUrl: "https://www.springfieldmo.gov/",
  permitPortalUrl: "https://www.springfieldmo.gov/DocumentCenter/View/910",
  timezone: "America/Chicago",
  isActive: true,
};

const departments: SeedDepartment[] = [
  {
    key: "springfield-building-development-services",
    jurisdictionKey: SPRINGFIELD_KEYS.jurisdiction,
    kind: "building",
    name: "City of Springfield, Missouri — Building Development Services (BDS)",
    phone: "(417) 864-1032",
    email: null,
    url: "https://www.springfieldmo.gov/DocumentCenter/View/910",
    addressLine: "840 Boonville Avenue, Springfield, MO 65802",
    hours: null,
    notes:
      "Building Development Services publishes the two fee schedules this site prices — Commercial Construction (9 pages, 07/01/2025) and Residential Construction (6 pages, 07/01/2025) — and cites the 2009 IBC Fee Calculation Data matrix (1 page, 07/01/2009) for the Type of Construction Factor. Construction Factor = Gross Area × 85 × Type Factor (commercial matrix) or Finished Living Area × 85 × 0.3876 (residential R-3/IRC, 1.02 × 0.38). Infills/renovations use Type Factor 0.30 with the commercial marginal table; shell buildings use S-1-like Open-Shell factors.",
  },
];

const sources: SeedSource[] = [
  {
    key: SPRINGFIELD_COMMERCIAL_SOURCE_KEY,
    jurisdictionKey: SPRINGFIELD_KEYS.jurisdiction,
    title: "City of Springfield, Missouri — Building Development Services — Commercial Construction Fee Schedule (Effective 07/01/2025)",
    url: "https://www.springfieldmo.gov/DocumentCenter/View/910",
    sourceType: "fee_schedule_pdf",
    issuingAuthority: "City of Springfield, Missouri — Building Development Services",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: "2025-07-01",
    retrievedAt: SPRINGFIELD_LAST_VERIFIED,
    lastVerifiedAt: SPRINGFIELD_LAST_VERIFIED,
    notes:
      "Read 2026-09-26 as a 29,975-byte docx (SHA-256 db5512282d15cdfdae65564a4d72e6be2ee55b9fef726bd1e63319e2aed070cb, HTTP 200) in pymupdf docx extraction (9 pages). Carries the construction-factor marginal table (0.005/0.004/0.003/0.0015, $171 min), infill/renovation 0.30 factor, shell sub-category, plan review 75% ($257 BDS+CU / $492 multi-dept floors), provisional 30%, post-permit $50, technology 18.5% ($50 floor), certificates $30, MEP-associated 40% ($171), gas $171, fire FIS $171 + plan $257 + tech $50, signs $249+$100+$46 / $69+$50+$13, and every flat/percentage re-inspection, re-submittal and penalty row. S1 for commercial rates. The 30% provisional fee is a second payment schedule (in addition to the permit fee), named rather than charged.",
  },
  {
    key: SPRINGFIELD_RESIDENTIAL_SOURCE_KEY,
    jurisdictionKey: SPRINGFIELD_KEYS.jurisdiction,
    title: "City of Springfield, Missouri — Building Development Services — Residential Construction Fee Schedule (Effective 07/01/2025)",
    url: "https://www.springfieldmo.gov/DocumentCenter/View/926",
    sourceType: "fee_schedule_pdf",
    issuingAuthority: "City of Springfield, Missouri — Building Development Services",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: "2025-07-01",
    retrievedAt: SPRINGFIELD_LAST_VERIFIED,
    lastVerifiedAt: SPRINGFIELD_LAST_VERIFIED,
    notes:
      "Read 2026-09-26 as a 23,556-byte docx (SHA-256 4965997b259f86f666ac9f8ee0c0c3de8942836ec6db4bd1bcb77132f447cba0, HTTP 200) in 6 docx pages. Carries the residential marginal table (0.004/0.003/0.002/0.001, $151 min) at factor 0.3876, garage/addition same formula, MEP 40% ($110), gas $110, air-test $49, stand-alone MEP $110, furnace/AC $49, water-heater $49, service-repair $49, lawn-sprinkler/backflow $110, wrecking $151, pool $151, and the residential re-inspection/penalty slate.",
  },
  {
    key: SPRINGFIELD_IBC_SOURCE_KEY,
    jurisdictionKey: SPRINGFIELD_KEYS.jurisdiction,
    title: "City of Springfield, Missouri — 2009 IBC Fee Calculation Data (Effective July 1, 2009)",
    url: "https://www.springfieldmo.gov/DocumentCenter/View/902",
    sourceType: "fee_schedule_pdf",
    issuingAuthority: "City of Springfield, Missouri — Building Development Services (IBC reference)",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: "2009-07-01",
    retrievedAt: SPRINGFIELD_LAST_VERIFIED,
    lastVerifiedAt: SPRINGFIELD_LAST_VERIFIED,
    notes:
      "Read 2026-09-26 as a 25,597-byte PDF (SHA-256 9763689a735154ef4f99a1086eeb573e962c8d9f5479cc824c8b3ac99fa37b0a, HTTP 200) in 1 pymupdf page. The 31 use groups × 9 construction types matrix (Gross Area Modifier 85 constant; Business I/II/III = 1.61/1.55/1.50/1.43/1.30/1.25/1.38/1.14/1.09; S-1 = 0.91/0.86/0.81/0.78/0.69/0.66/0.74/0.56/0.52; Open Shells = 0.84/… etc., with two N.P. cells) — the Type Factor commercial work multiplies against. Cited by both construction schedules as 'IBC FEE CALCULATION DATA, and as amended by adoption of this Fee Ordinance. Copies are available from Building Development Services.' The 279 distinct factors are named on every Springfield page rather than carried as 279 rateTable rows inside one rule.",
  },
];

const permitTypes: JurisdictionSeed["permitTypes"] = [];
const projectTypes: JurisdictionSeed["projectTypes"] = [];

const jurisdictionPermitTypes: SeedJurisdictionPermitType[] = [
  {
    jurisdictionKey: SPRINGFIELD_KEYS.jurisdiction,
    permitTypeKey: "building",
    isAvailable: true,
    localName: "Building permit — construction factor at 0.005/0.004/0.003/0.0015 commercial, 0.004/0.003/0.002/0.001 residential (plan review 75%, tech 18.5%)",
    officialUrl: "https://www.springfieldmo.gov/DocumentCenter/View/910",
    notes:
      "Commercial construction-factor marginal table: 0.005/0.004/0.003/0.0015 per factor ($171 min); residential 0.004/0.003/0.002/0.001 ($151 min) at 0.3876 (R-3/IRC, finished living area × 85 × 0.3876). Infill/renovation uses Type Factor 0.30 with the commercial table; shell ~S-1. Construction Factor = Gross Area × 85 × Type Factor (matrix S3). Dependent: plan review 75% ($257 BDS+CU / $492 multi-dept floors), technology 18.5% ($50 floor, n/a if plan review n/a). The IBC matrix's 279 factors are named, not modelled as extra rules on this page.",
  },
  {
    jurisdictionKey: SPRINGFIELD_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    isAvailable: true,
    localName: "Electrical permit — stand-alone $110 / service-repair $49, commercial MEP-associated 40%",
    officialUrl: "https://www.springfieldmo.gov/DocumentCenter/View/926",
    notes:
      "Residential electrical not associated with a building permit $110.00; furnace and/or AC change-out $49.00; electrical service repair $49.00. Commercial not-associated MEP flat $171.00 (S1 p.3). The 40%-when-associated commercial MEP row is named on the pages (40% of building permit fee, $171 floor) rather than charged inside a self-issuing electrical permit — it rides a building permit where one exists.",
  },
  {
    jurisdictionKey: SPRINGFIELD_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    isAvailable: true,
    localName: "Plumbing permit — water-heater $49 / gas $110, lawn sprinkler $110, commercial gas $171 / air-test $171",
    officialUrl: "https://www.springfieldmo.gov/DocumentCenter/View/926",
    notes:
      "Residential water-heater change-out $49.00; lawn sprinkler/backflow $110.00; gas $110.00 (commercial gas $171.00); residential air-test-only gas $49.00 / commercial $171.00. Commercial MEP-associated plumbing is the same 40%/$171 association as electrical/mechanical — named on the pages, not duplicated. The $110/$171/$49 tiers are the schedule's own flat/gated rows, each as a base rule rather than a percentage of the building fee.",
  },
];

const feeSchedules: SeedFeeSchedule[] = [
  {
    key: SPRINGFIELD_KEYS.feeSchedule,
    jurisdictionKey: SPRINGFIELD_KEYS.jurisdiction,
    sourceKey: SPRINGFIELD_COMMERCIAL_SOURCE_KEY,
    title: "City of Springfield — BDS Commercial Construction Fee Schedule (Effective 07/01/2025)",
    officialUrl: "https://www.springfieldmo.gov/DocumentCenter/View/910",
    effectiveFrom: "2025-07-01",
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: SPRINGFIELD_LAST_VERIFIED,
    notes: "S1: 9 docx pages, 29,975 bytes, HTTP 200 — commercial construction-factor table and every associated/stand-alone trade flat beside it.",
  },
  {
    key: SPRINGFIELD_KEYS.ibcSchedule,
    jurisdictionKey: SPRINGFIELD_KEYS.jurisdiction,
    sourceKey: SPRINGFIELD_IBC_SOURCE_KEY,
    title: "City of Springfield — 2009 IBC Fee Calculation Data (Effective July 1, 2009)",
    officialUrl: "https://www.springfieldmo.gov/DocumentCenter/View/902",
    effectiveFrom: "2009-07-01",
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: SPRINGFIELD_LAST_VERIFIED,
    notes: "S3: 1 PDF page, 25,597 bytes, HTTP 200 — the Type Factor matrix commercial work multiplies against (Gross Area Modifier 85 constant).",
  },
];

function attach(permitTypeKey: string, rules: FeeRuleRecord[]): SeedFeeRule[] {
  return rules.map((rule) => ({
    jurisdictionKey: SPRINGFIELD_KEYS.jurisdiction,
    permitTypeKey,
    scheduleKey: SPRINGFIELD_KEYS.feeSchedule,
    rule,
  }));
}

const feeRules: SeedFeeRule[] = [
  ...attach("building", SPRINGFIELD_BUILDING_FEE_RULES),
  ...attach("electrical", [
    ...SPRINGFIELD_ELECTRICAL_BASE_RULES,
    // The $49 residential furnace/AC change-out flat. The electrical page's intro
    // and its worked example both advertise this row (S2 p.2), so it must be
    // attached here or the example computes $0 and the rule is unreachable.
    SPRINGFIELD_RESIDENTIAL_TRADE_FLATS[2]!,
  ]),
  ...attach("plumbing", SPRINGFIELD_PLUMBING_BASE_RULES),
];

const requirements: SeedRequirement[] = [
  {
    jurisdictionKey: SPRINGFIELD_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "Construction Factor = Gross Area × 85 × Type of Construction Factor (S3 matrix; residential 0.3876)",
    description:
      "The schedules' own arithmetic: S1 'Gross area (Sq Ft) × Gross area Modifier (85) × Type of Construction Factor = Construction Factor used to calculate the building permit fee' — Type Factor from the 2009 IBC Fee Calculation Data matrix, 31 use groups × 9 construction types (Business I/II/III = 1.61/1.55/1.50/1.43/1.30/1.25/1.38/1.14/1.09; S-1 = 0.91/0.86/0.81/0.78/0.69/0.66/0.74/0.56/0.52; Open Shells = 0.84/…; two N.P. cells). S2 Residential: 'Type of Construction Factor = 1.02 multiplied by 0.38' — 0.3876, Use Group R-3/IRC, Finished Living Area (excludes garage and unfinished basement) × 85 × 0.3876 = Construction Factor. Infill/renovation Gross Area (renovation only) × 85 × 0.30. Shell Building is the Business Use Group sub-category at S-1-like factors.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: SPRINGFIELD_IBC_SOURCE_KEY,
    lastVerifiedAt: SPRINGFIELD_LAST_VERIFIED,
  },
  {
    jurisdictionKey: SPRINGFIELD_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "Plan review 75% and technology 18.5% are percentages of the building permit fee, with floors",
    description:
      "S1 p.2: 'COMMERCIAL PLAN REVIEW FEE 75% of Building Permit Fee, or minimum of $492.00 for Projects which Require Review by Multiple City Departments. Minimum $257.00 for Projects which require review by BDS and City Utilities only. No Plan Review Fee shall be required for work that is minor in nature in accordance with Section 36.1234.' And: 'TECHNOLOGY FEE 18.5% of the calculated Building Permit Fee, or minimum of $50.00, whichever is greater. (Not applicable if Plan Review is not Applicable).' Both are non-refundable. The provisional (phase approval) 30% fee is a different payment schedule — in addition to the normal permit fee, minimum $171 — named on this page and not summed into total, and post-permit plan review is $50 per occurrence. The $492 multi-department floor is the higher of two named minima; the engine's own minimum is the $257 BDS+CU figure, and the higher is stated on the pages and in the notIncluded where the project requires multiple departments.",
    isMandatory: true,
    sortOrder: 20,
    sourceKey: SPRINGFIELD_COMMERCIAL_SOURCE_KEY,
    lastVerifiedAt: SPRINGFIELD_LAST_VERIFIED,
  },
];

const profile: SeedProfile = {
  jurisdictionKey: SPRINGFIELD_KEYS.jurisdiction,
  headline: "What construction permits cost in Springfield, Missouri",
  summary:
    "Springfield prices a building permit from a **construction factor** — Gross Area × 85 × the Type of Construction Factor (S3's IBC matrix, 31 groups × 9 types) — on a **four-band marginal table**: commercial **0.005 / 0.004 / 0.003 / 0.0015** dollars per factor ($171 minimum), residential **0.004 / 0.003 / 0.002 / 0.001** at **0.3876** (R-3/IRC, 1.02 × 0.38, $151 minimum). **Plan review is 75% and technology 18.5% of the permit fee**, with floors.",
  localContext:
    "Two fee schedules and one matrix. Building Development Services publishes a commercial schedule and a residential schedule — each on its first line as 'Effective 07/01/2025' — and both cite the same third instrument for the multiplier that feeds the fee: the **2009 IBC Fee Calculation Data** (Effective July 1, 2009), whose 279 published Type of Construction Factors (Business IIA at 1.50, S-1 IIA at 0.81, Open Shells 0.75, I-2 hospital IA at 2.71, R-3/IRC VB at 1.02, etc.) S1 describes as 'as established by the IBC FEE CALCULATION DATA, and as amended by adoption of this Fee Ordinance. Copies are available from Building Development Services.' Springfield is Green Bay's complement rather than Kansas City's: Kansas City prices a valuation ladder, Springfield prices a factor — Gross Area × 85 × that multiplier — so two different numbers of the building are taxed in the same state.\n\nThe marginal arithmetic is the new shape this pass adds to the engine. Every commercial rate is a **half cent** (0.5¢, 0.4¢, 0.3¢) except the last (0.15¢), and no whole-cent field can hold half a cent without hiding a factor of 100 in the basis; it is why the `tiered_marginal` band carries an exact `{numerator, denominator}` of cents per factor. The residential table is the same shape at a different scale — 0.4¢ through 0.1¢ — and the only matrix it reads is one constant: R-3/IRC at 0.3876, so Finished Living Area × 85 × 0.3876 is the factor. The matrix itself is not modelled as rules here — one marginal row with 279 `rateTable` entries would triple-count every fee with the matrix's own denominators — its 279 figures are named on every page so a reader with the matrix reproduces the same factor, and its two N.P. (Not permitted) cells are exactly that.\n\nThe dependent percentages are the other reason the pass adds a basis. Plan review at 75% and technology at 18.5% are charged as `permit_fee` — the sum of base components already computed — so a $400 commercial permit pays $300 of plan review and $74 of technology (each at its floor where the base is small). The same two figures are Missouri's answer to the 'what rides a permit?' question: Kansas City credits half at intake; Springfield charges 75% and 18.5% beside the permit, each non-refundable, each with its own floor and the technology fee unavailable when plan review is.\n\nWhat is named rather than summed: the 30% provisional phase-approval fee (in addition to the normal permit fee), the $50 post-permit plan review, stormwater $171, certificates $30, boarded-up $200/180 days, the no-cost wheel-chair and sub-6-ft fence instruments, communication-tower/pool/floodplain/parking fixtures, signs, coolers, hoods, fire-sprinkler overhead vs calcs-free modifications, and every re-inspection, re-submittal and ×2+penalty row — each transcribed and left off the permit total.",
  valuationBasis:
    "Neither Springfield table reads a valuation in cents — a `construction_factor` basis feeds both.\n\n**Commercial:** Construction Factor = Gross Area of the building or addition (sq ft) × 85 (Gross Area Modifier, constant) × Type of Construction Factor (S3 matrix, selected by Use Group and Construction Type). The permit fee on that factor is a marginal table:\n- first 50,000 at 0.005 (0.50¢ per factor),\n- next 50,000 at 0.004 (0.40¢),\n- next 50,000 at 0.003 (0.30¢),\n- remainder at 0.0015 (0.15¢),\nminimum $171.00. Infills and renovations use Type Factor 0.30 with the same table; Shell Buildings use S-1-like Open-Shell factors within the Business Use Group.\n\n**Residential:** Construction Factor = Finished Living Area (sq ft, excludes garage and unfinished basement) × 85 × 0.3876 (Type Factor 1.02 × 0.38, R-3 / IRC 2012). The permit fee on that factor is the same four-band shape at lower rates: 0.004 / 0.003 / 0.002 / 0.001 (0.40¢–0.10¢), minimum $151.00. Garage/home additions and accessory structures use Square Feet × 85 × 0.3876 as the same factor. The reader with the finished area reproduces the same factor a city reviewer does.\n\n**Plan review and technology** — the only percentages on the building page — read the building fee itself: plan review 75% (`permit_fee` at 7,500 bps, $257 floor — $492 multi-department floor named beside it), technology 18.5% (1,850 bps, $50 floor, inapplicable when plan review is). Commercial MEP-**associated** plumbing/electrical/mechanical is the same sheet's 40% of the building fee ($171 floor) — named on the building page where a building permit exists rather than duplicated inside a trade permit that issues with no building permit at all (there the trade flat is the commercial MEP-not-associated $171 / residential $110 / $49 change-outs).",
  notIncluded:
    "These are Springfield's own building, electrical and plumbing permit, plan-review and technology fees. They are not a project cost, and they exclude:\n\n- **The IBC matrix itself as rules** — 279 published factors that the construction-factor basis selects by, named on every Springfield page (the matrix is S3, Effective 2009-07-01, Gross Area Modifier 85) rather than carried as 279 rateTable entries inside one rule — which would make every building permit pay the matrix row twice.\n- **The 30% provisional (phase approval) permit fee** — 30% of the building permit fee, minimum $171, *in addition to* the normal permit fee; a second payment schedule when phased approval is requested, not inside a total.\n- **The $50 post-permit plan review fee** — per occurrence for change orders, addenda and revisions.\n- **Stormwater detention $171, certificates $30, boarded-up $200/180 days, no-cost wheel-chair ramp and sub-6-ft fence site-plan reviews** — city instruments beside the permit fee.\n- **Commercial signs** — detached $249.00 (+ plan $100 + tech $46) vs wall $69.00 (+ $50 + $13), and temporary signs $25 per 30 days — flat permits of their own, not per-trade rates on a building permit.\n- **Fire sprinkler distinctions** — new overhead FIS $171 + plan review $257 + tech $50 when not associated with a building permit; underground $171; modifications with no calcs required (modifications $25, hood suppression $25) — flat permits beside the 40% association.\n- **Coolers, hoods, and the $171 commercial / $110 residential MEP-not-associated flats** beside the trades.\n- **Every re-inspection, re-submittal and penalty** — $100 after the 1st, $200 after the 2nd/3rd, $500 after the 4th+; $250/$500 re-submittal counts; work done without permit at required fee × 2 + $200; dangerous-building multipliers; after-hours $45/hour — all transcribed and left off the permit total.\n- **Missouri has no state surcharge** of its own on a local permit — the 18.5% technology figure is the City's, named here, and no state fee is invented beside it.",
  seoTitle: "Springfield, Missouri construction permit fees",
  seoDescription:
    "How Springfield, Missouri prices construction permits — construction factor × 85 × Type Factor, commercial 0.005/0.004/0.003/0.0015 ($171 min), residential 0.004/0.003/0.002/0.001 ($151 min), plan review 75% and technology 18.5%.",
  publishStatus: "published",
  noindex: false,
  lastReviewedAt: SPRINGFIELD_LAST_VERIFIED,
};

const permitPages: SeedPermitPage[] = [
  {
    jurisdictionKey: SPRINGFIELD_KEYS.jurisdiction,
    permitTypeKey: "building",
    slug: "building-permit-cost",
    title: "Springfield, Missouri building permit cost",
    intro:
      "A Springfield building permit is priced on a **construction factor** — **Gross Area × 85 × the Type of Construction Factor** (S3's IBC matrix, 31 use groups × 9 types) — on a **four-band marginal table**: commercial **0.005 / 0.004 / 0.003 / 0.0015** dollars per factor ($171 minimum), residential **0.004 / 0.003 / 0.002 / 0.001** at **0.3876** (R-3/IRC, $151 minimum). **Plan review is 75% and technology 18.5% of the permit fee**, each with its own floor.",
    localSummary:
      "Commercial and residential use the same construction-factor shape at different rates and with different minima — Springfield is Dallas turned inside-out rather than Kansas City duplicated. Commercial: Business (IA) at 1.61 and S-1 (IIA) at 0.81 are each a Gross Area × 85 × that factor calculation, so 10,000 sq ft of Business IIA (1.50) is 10,000 × 85 × 1.50 = 1,275,000 of factor; 10,000 sq ft of Office IIA office at the same type is 1,275,000 at that row, and a 10,000 sq ft storage unit (S-1 IIA 0.81) is 688,500. The marginal table then charges 0.005 of the first 50,000, 0.004 of the next 50,000, 0.003 of the next 50,000 and 0.0015 beyond — $250 + $200 + $150 + (remaining × 0.0015) — floored at $171. A factor of 60,000 is $250 + $40 = $290; a factor of 175,000 is $250 + $200 + $150 + (25,000 × 0.0015 = $37.50) = $637.50.\n\nResidential is the same four bands at lower rates: 0.004 / 0.003 / 0.002 / 0.001 on the residential factor. The only Use Group the residential sheet names is R-3 and IRC at the single fixed factor 0.3876 (1.02 × 0.38), so 2,000 sq ft of finished living area is 2,000 × 85 × 0.3876 = 65,892 of factor, and the table charges 0.004 of the first 50,000 ($200) plus 0.003 of the next 15,892 ($47.68) = $247.68, floored at $151. Infill and renovation commercial work uses Type Factor 0.30 with the commercial table — so a renovation factor of 25,500 (1,000 sq ft × 85 × 0.30) lands in the first commercial band at $127.50 — while shell buildings use the S-1-like Open Shells factors within the Business group.\n\nAnd underneath the building fee, two plan-review-adjacent components that no other Missouri city charges this way: plan review at **75% of the building permit fee** — minimum $257 when BDS and City Utilities review, $492 when multiple city departments do — and technology at **18.5% of the building permit fee** — minimum $50, not applicable when plan review itself is not applicable (the §36.1234 minor-work exemption). Both are non-refundable. A $500 commercial building fee with a two-department review is $375.00 of plan review and $92.50 of technology (each at its floor for fees below $340 and $270 respectively).",
    notIncluded:
      "This is the Springfield building permit fee — the construction-factor marginal table plus plan review and technology when they apply. It excludes:\n\n- **The IBC matrix itself** — 279 published factors beside this page, cited as the Type Factor rather than carried as 279 rules.\n- **The 30% provisional phase-approval fee** — a second payment schedule (minimum $171) when phased approval is requested, not inside a total.\n- **Post-permit plan review $50 per occurrence**, stormwater $171, certificates $30, boarded-up $200/180 days, the no-cost instruments and every external stand-alone trade flat.\n- **The residential-vs-commercial rate misread** — residential is not read off the commercial IBC matrix; the residential sheet's own Type Factor (0.3876 only) decides that ladder.",
    workedExample: {
      scenario: "A new 10,000 sq ft Business IIA commercial building (Type Factor 1.50) — the ordinary Business new-building case that exercises the IBC matrix and both dependent percentages.",
      inputs: { custom: { building_class: "commercial", construction_factor: 1_275_000 } },
      notes:
        "Construction Factor: 10,000 sq ft × 85 × 1.50 = 1,275,000.\n\nBuilding permit fee (marginal table, commercial 0.005/0.004/0.003/0.0015): first 50,000 × 0.005 = $250; second 50,000 × 0.004 = $200; third 50,000 × 0.003 = $150; remaining 1,125,000 × 0.0015 = $1,687.50 — total $2,287.50, above the $171 floor.\n\nPlan review: 75% of $2,287.50 = $1,715.63, above the $257 floor ($492 multi-department floor named beside it). Technology: 18.5% of $2,287.50 = $423.19, above the $50 floor.\n\nTotal building plan-review-plus-permit-plus-tech = $4,426.32 — three components, each on its own base, the two percentages riding the building permit fee. A 1,000 sq ft infill/renovation at Type Factor 0.30 instead is 1,000 × 85 × 0.30 = 25,500 of factor and $127.50 commercial; the same 2,000 sq ft finished residential area instead is 65,892 of residential factor and $247.68.",
    },
    faqs: [
      {
        question: "How much is a building permit in Springfield, Missouri?",
        answer:
          "A marginal table on the construction factor — commercial: $0.005 per factor for the first 50,000, $0.004 for the next 50,000, $0.003 for the next 50,000 and $0.0015 beyond ($171 minimum); residential: $0.004 / $0.003 / $0.002 / $0.001 at the fixed R-3/IRC factor 0.3876 ($151 minimum). Construction Factor = Gross Area × 85 × Type Factor (30+ IBC use groups × 9 construction types; infill/renovation at 0.30; shell ~S-1). Plan review is 75% and technology 18.5% of the permit fee, with $257/$492 and $50 floors.",
        sourceId: SPRINGFIELD_COMMERCIAL_SOURCE_KEY,
      },
      {
        question: "How is the construction factor built?",
        answer:
          "Gross Area — the building's square footage, or the finished living area (excludes garage and unfinished basement) on the residential sheet — times 85 (the Gross Area Modifier), times the Type of Construction Factor. For commercial work the factor is read off the 2009 IBC Fee Calculation Data matrix S3 (e.g. Business IIA 1.50, S-1 IIA 0.81, Open Shells 0.75); for residential work it is 1.02 × 0.38 = 0.3876 (R-3 / IRC 2012) with no matrix lookup.",
        sourceId: SPRINGFIELD_IBC_SOURCE_KEY,
      },
      {
        question: "Why does Springfield publish at half cents?",
        answer:
          "Because the marginal table charges half a cent per construction factor — 0.5¢, 0.4¢, 0.3¢ and 0.15¢ (0.005 dollars per factor is 0.5 cents). No whole-cent field can hold half a cent without hiding a factor of 100 in the basis; the marginal tier carries an exact cents-per-factor rate (1/2, 2/5, 3/10, 3/20) rather than a rounded whole cent.",
        sourceId: SPRINGFIELD_COMMERCIAL_SOURCE_KEY,
      },
      {
        question: "What is the 75% plan review and the 18.5% technology fee?",
        answer:
          "Percentages of the building permit fee, not flat rows: plan review 75% with a $257 minimum (BDS + CU; $492 multi-department) and technology 18.5% with a $50 minimum, not applicable when plan review itself is not applicable (minor work under §36.1234). Both are non-refundable. On a $500 permit, plan review is $375.00 and technology $92.50 — each beside the permit rather than inside its base.",
        sourceId: SPRINGFIELD_COMMERCIAL_SOURCE_KEY,
      },
      {
        question: "Does infill or renovation use a different ladder?",
        answer:
          "No — the same commercial marginal table, fed by a Construction Factor built with Type Factor 0.30: Gross area (renovation only) × 85 × 0.30 = Construction Factor. 1,000 sq ft of infill is 25,500 of factor and $127.50 commercial. Shell buildings are the Business-use-group sub-category at S-1-like factors (Open Shells V 0.49 vs S-1 0.52), reducing the fee relative to a full Business interior.",
        sourceId: SPRINGFIELD_COMMERCIAL_SOURCE_KEY,
      },
      {
        question: "Is there an IBC table with all 279 Type Factors?",
        answer:
          "Yes — the 2009 IBC Fee Calculation Data (View/902, Effective July 1, 2009), 1 PDF page, 25,597 bytes — cited by both construction schedules as 'IBC FEE CALCULATION DATA, and as amended by adoption of this Fee Ordinance. Copies are available from Building Development Services.' Use groups A-1 through U by IBC definition, construction types IA through VB, two N.P. (not permitted) cells. Springfield's pages name the matrix and its date; the matrix is not carried as 279 rules.",
        sourceId: SPRINGFIELD_IBC_SOURCE_KEY,
      },
    ],
    seoTitle: "Springfield, Missouri building permit cost: construction factor at 0.005–0.0015",
    seoDescription:
      "Springfield building permit fees — construction factor × 85 × Type Factor, commercial 0.005/0.004/0.003/0.0015 ($171 min), residential 0.004/0.003/0.002/0.001 ($151 min), plan 75% + tech 18.5%.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: SPRINGFIELD_LAST_VERIFIED,
  },
  {
    jurisdictionKey: SPRINGFIELD_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    slug: "electrical-permit-cost",
    title: "Springfield, Missouri electrical permit cost",
    intro:
      "A Springfield electrical permit is **a flat amount at the trade's own line**: residential **$110.00** stand-alone, **$49.00** for furnace/AC change-outs and electrical service repairs; commercial **$171.00** stand-alone and associated MEP — **40% of the building permit fee ($171 floor)** — when the electrical work rides a building permit.",
    localSummary:
      "Springfield does not split an electrical permit by area or by circuits — it splits it by **association**. For electrical work **not associated** with a building permit — a service-repair that issues on its own, a mechanical furnace and/or air conditioner change-out, or a stand-alone MEP trade permit whose own building page does not exist — the schedule names a flat: residential MEP not associated $110.00 (the same $110.00 that also covers residential lawn sprinkler plumbing and residential gas), residential furnace and/or AC change-out $49.00, residential electrical service repair $49.00; commercial mechanical/electrical/plumbing not associated $171.00. Each pays its flat once and stops — no plan review or technology surcharge rides a not-associated flat.\n\nFor electrical work **associated** with a building permit — a new house, an addition, or a commercial building whose BDS building permit already exists — the schedule on the building page states the associated price: 40% of the building permit fee, minimum $171.00. 40% of a $400 building permit is $171.00 (the $171 floor); 40% of a $2,000 building permit is $800.00. The $171 floor is the same figure as the stand-alone flat because the commercial not-associated row *is* $171.00, not because an amount was collapsed.\n\nResidential 40% is the same pairing at $110.00 — S2 prices residential MEP associated with a building permit at 40% ($110 minimum) using the 2009 IBC residential construction factor — but the residential association is named on the building page likewise and not charged inside the not-associated flats, which issue with no building permit at all. The not-associated MEP flat at $110 (residential) and $171 (commercial) is what Springfield trades pay when they issue alone; the association percentage is what they pay when they ride the building permit.",
    notIncluded:
      "This is Springfield's electrical permit fee read from S1/S2 flat rows and the 40% building-permit association. It excludes the building permit fee itself (charged on the construction factor), commercial gas/air-test/refigeration/cooler/hood/fire/FIS/sign flat rows that are not electrical, and the per-trade re-inspection/re-submittal ladder and ×2+$200 no-permit penalty — all transcribed and left off the electrical permit total.",
    workedExample: {
      scenario: "Residential furnace and/or air conditioner change-out — the $49 flat that is the small-electrical shape.",
      inputs: { custom: { trade_scope: "furnace_ac" } },
      notes:
        "Furnace and/or AC change-out (residential, S2 p.2): $49.00 flat — stand-alone, no building permit, no 40% association. Same figure as residential plumbing water-heater change-out ($49) and residential electrical service repair ($49), each a different `trade_scope` with the same $49 amount.\n\nMEP not associated with a building permit (residential): $110.00 flat — the row that also covers plumbing lawn-sprinkler/backflow at $110. Commercial MEP not associated: $171.00. And MEP *associated* with a building permit — the same sheet's 40% rows: 40% of a $400 building permit is $171.00 (the $171 floor); 40% of a $2,000 building permit is $800.00 — named on the building-permit pages, never as part of the $49/$110 stand-alone.",
    },
    faqs: [
      {
        question: "How much is an electrical permit in Springfield, Missouri?",
        answer:
          "Not associated with a building permit: residential MEP $110.00; furnace and/or air conditioner change-out $49.00; electrical service repair $49.00. Commercial MEP not associated $171.00. Associated with a building permit (new house, addition, commercial building with a BDS building permit): 40% of the building permit fee, minimum $171.00 commercial and $110.00 residential — 40% of a $400 permit is $171, 40% of a $2,000 permit is $800.",
        sourceId: SPRINGFIELD_RESIDENTIAL_SOURCE_KEY,
      },
      {
        question: "Is residential MEP the same 40% as commercial?",
        answer:
          "Mechanically yes — both are 40% of the building permit fee where the MEP permit is associated with a building permit — but the floors differ ($110 residential, $171 commercial) and where the trade permit issues with no building permit at all, the flat ($110 / $171) is owed instead. The association row is named on the building-permit pages rather than duplicated inside each stand-alone trade permit.",
        sourceId: SPRINGFIELD_COMMERCIAL_SOURCE_KEY,
      },
      {
        question: "What does $49.00 buy?",
        answer:
          "A trade-residential change-out: furnace and/or air conditioner change-out $49.00; water heater change-out $49.00; electrical service repair $49.00; residential gas air-test-only $49.00 — four rows of S2's, each the same $49.00 as a different scope.",
        sourceId: SPRINGFIELD_RESIDENTIAL_SOURCE_KEY,
      },
      {
        question: "Does technology or plan review ride a small electrical permit?",
        answer:
          "No — the S2 $49 change-outs and the not-associated $110 / $171 MEP flats carry no plan-review or technology percentage. The building-permit siblings do — commercial plan 75% and technology 18.5% each with their own floor — but those read `permit_fee` and attach to the building permit, not to a $49 service repair.",
        sourceId: SPRINGFIELD_RESIDENTIAL_SOURCE_KEY,
      },
    ],
    seoTitle: "Springfield, Missouri electrical permit cost: $49–$171 + 40% when associated",
    seoDescription:
      "Springfield electrical permit fees — $49 stand-alone change-outs, $110 residential / $171 commercial flat MEP, and 40% of the building permit fee ($171/$110 floor) when the electrical work rides a building permit.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: SPRINGFIELD_LAST_VERIFIED,
  },
  {
    jurisdictionKey: SPRINGFIELD_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    slug: "plumbing-permit-cost",
    title: "Springfield, Missouri plumbing permit cost",
    intro:
      "A Springfield plumbing permit is **a flat amount at the trade's own line**: residential **$49.00** for a water heater change-out, **$110.00** for a lawn sprinkler/backflow and for gas; commercial **$171.00** for gas, **$171.00** air-test-only, and ─ when the plumbing work rides a building permit ─ **40% of the building permit fee ($171 floor)**.",
    localSummary:
      "Residential plumbing stand-alone rows are the $49/$110 pair: water heater change-out $49.00, lawn sprinkler system with backflow preventer installation $110.00, and gas $110.00 (plus residential gas air-test-only $49.00 — the same $49 as furnace/AC and service-repair but a plumbing-gas scope). Each is a flat `base` rule gated on its `trade_scope`, carrying the residential effective date. Commercial plumbing stand-alone rows are $171.00: gas $171.00 and air-test-only gas $171.00 — the same commercial flat that also covers not-associated MEP and overhead FIS (issuers on the commercial sheet at the same $171 but with their own scope values).\n\nWhen the plumbing work is **associated** with a building permit — a new house's plumbing rough-in, a commercial addition's plumbing — the price moves to the building page: commercial 40% of the building permit fee ($171 floor). The $171 floor is the same figure as the stand-alone commercial gas flat because the schedule prices both at $171.00, not because an amount was folded. The associated row is named on the building-permit pages where a building permit exists and not charged inside a not-associated $49 stand-alone that issues with no building permit at all; Springfield is where the request for a building-permit 40% inside a plumbing permit is refused because the 40% rides a building permit, not a trade one.\n\nPlumbing with an associated building permit inside a $400 building is therefore the $171 floor; inside a $2,000 building at 40% it is $800.00; stand-alone it is $49.00 or $110.00 or $171.00 by scope, each as a flat with no plan review or technology rider. No plumbing row here is priced on count of fixtures or on valuation — the building permit's construction factor is the only count the plumbing permit reads indirectly, through the 40% association where it applies.",
    notIncluded:
      "This is Springfield's plumbing permit fee read from S1/S2 flat and associated rows. It excludes the building permit fee itself (construction factor), commercial fire/FIS/flat rows that are not plumbing (overhead FIS $171 + plan $257 + tech $50, no-calcs $25, underground $171), signs, towers, pools, parking-lot/floodplain fixtures, cooler/hood rows, the MEP-not-associated flats that are not plumbing, and the re-inspection/re-submittal ladder and ×2+$200 no-permit penalty.",
    workedExample: {
      scenario: "Residential plumbing — water heater change-out ($49) and gas ($110) as separate stand-alone permits, plus the associated-plumbing shape.",
      inputs: { custom: { trade_scope: "water_heater" } },
      notes:
        "Water heater change-out (residential, S2 p.2): $49.00 flat — trade stand-alone, no building permit. Gas (residential): $110.00; lawn sprinkler/backflow: $110.00 — each a different `trade_scope` with its own flat. Commercial gas: $171.00; commercial air-test-only gas: $171.00 — the commercial pair at $171.00.\n\nAssociated with a building permit: 40% of the building permit fee, $171 floor commercial ($110 residential). 40% of a $400 building permit is $171.00 at the floor; 40% of a $2,000 building permit is $800.00; associated-plumbing rows are named on the building-permit pages, never as part of the $49/$110/$171 stand-alone — a building permit is required for the 40% to attach.\n\nNo plumbing row here reads a valuation — plumbing is priced entirely by scope and association. The building permit's construction factor is the only plumbing price that reads a non-money basis, and it is the associated 40%'s own base — the building permit fee — that does the reading.\n\nThe calculator reads `trade_scope` for one permit at a time — `water_heater` is $49.00, `lawn_sprinkler` is $110.00, `gas` is $110.00/$171.00, `air_test` is $49/$171.",
    },
    faqs: [
      {
        question: "How much is a plumbing permit in Springfield, Missouri?",
        answer:
          "Stand-alone (no building permit): residential water heater change-out $49.00, lawn sprinkler/backflow $110.00, gas $110.00, gas air-test-only $49.00; commercial gas $171.00, commercial air-test-only gas $171.00. Associated with a building permit (new house, addition, commercial building with a BDS building permit): 40% of the building permit fee — minimum $171.00 commercial ($110 residential) — so $400 of building is $171 and $2,000 of building is $800 of plumbing.",
        sourceId: SPRINGFIELD_RESIDENTIAL_SOURCE_KEY,
      },
      {
        question: "Why is residential lawn sprinkler gas the same $110 as gas?",
        answer:
          "Because the schedule prices them that way: S2 reads 'RESIDENTIAL LAWN SPRINKLER SYSTEM, BACKFLOW PREVENTER INSTALLATION PLUMBING PERMIT FEE $110.00' where it also reads gas $110.00 — one permit scope, two counts sharing one price, each as a different `trade_scope` so the flat is the same $110.00 in both filings.",
        sourceId: SPRINGFIELD_RESIDENTIAL_SOURCE_KEY,
      },
      {
        question: "What does air-test-only gas mean?",
        answer:
          "A gas permit required only for an air test and nothing else (S1 p.3 / S2 p.2) — commercial $171.00 and residential $49.00 — a different scope from the $110/$171 gas permit that includes the work itself. The schedule prints both; the engine requires the same `air_test` scope for either.",
        sourceId: SPRINGFIELD_COMMERCIAL_SOURCE_KEY,
      },
      {
        question: "Does the 40% association make a $49 water-heater more expensive?",
        answer:
          "No — the 40% rows are `associated with a building permit`. A water-heater change-out that issues with no building permit at all pays its flat $49.00 and the 40% does not attach. The association lives on the building permit where a building permit exists; the stand-alone flats are what Springfield plumbing pays when it issues alone.",
        sourceId: SPRINGFIELD_RESIDENTIAL_SOURCE_KEY,
      },
      {
        question: "Is plumbing priced by fixture count or valuation?",
        answer:
          "Neither. Springfield plumbing on these pages is priced by scope — $49 for a water heater, $110 for a lawn sprinkler, $110/$171 for gas, and 40% of the building permit fee when the plumbing work rides a building permit that already has a construction-factor building fee. Fixture and valuation rows exist elsewhere but not on these pages.",
        sourceId: SPRINGFIELD_RESIDENTIAL_SOURCE_KEY,
      },
    ],
    seoTitle: "Springfield, Missouri plumbing permit cost: $49–$171 + 40% when associated",
    seoDescription:
      "Springfield plumbing permit fees — stand-alone $49 water heater, $110 lawn sprinkler/gas, commercial gas $171 / air-test $171, and 40% of the building permit fee ($171/$110 floor) when the plumbing work rides a building permit.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: SPRINGFIELD_LAST_VERIFIED,
  },
];

const verifications: SeedVerification[] = [
  {
    entityType: "source",
    entityKey: SPRINGFIELD_COMMERCIAL_SOURCE_KEY,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: SPRINGFIELD_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: SPRINGFIELD_COMMERCIAL_SOURCE_KEY,
    notes: "Primary (Commercial Construction schedule, 9 docx pages, HTTP 200; construction-factor table, infill 0.30, shell ~S-1, plan 75%, tech 18.5% with floors, flats and percentage rows cited above; pays for building, electrical and plumbing trade associations at 40%/$171).",
  },
  {
    entityType: "source",
    entityKey: SPRINGFIELD_RESIDENTIAL_SOURCE_KEY,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: SPRINGFIELD_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: SPRINGFIELD_RESIDENTIAL_SOURCE_KEY,
    notes: "Primary (Residential Construction schedule, 6 docx pages, HTTP 200; residential marginal table 0.004/0.003/0.002/0.001, $151 min; garage/accessory same factor, 40%/$110 associated, $49/$110/$151/$25 stand-alone trade flats, gas/air-test/sign flats).",
  },
  {
    entityType: "source",
    entityKey: SPRINGFIELD_IBC_SOURCE_KEY,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: SPRINGFIELD_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: SPRINGFIELD_IBC_SOURCE_KEY,
    notes: "Primary (2009 IBC Fee Calculation Data, 1 PDF page, 25,597 bytes, HTTP 200; 31 use groups × 9 construction types, Gross Modifier 85, Business/S-1/Open-Shell rows cited, two N.P. cells).",
  },
  {
    entityType: "fee_schedule",
    entityKey: SPRINGFIELD_KEYS.feeSchedule,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: SPRINGFIELD_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: SPRINGFIELD_COMMERCIAL_SOURCE_KEY,
    notes: "One fee-schedule row for both construction schedules (07/01/2025), cited as S1/S2 together on every permit type; the IBC matrix's own row covers the Type Factor.",
  },
  {
    entityType: "fee_schedule",
    entityKey: SPRINGFIELD_KEYS.ibcSchedule,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: SPRINGFIELD_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: SPRINGFIELD_IBC_SOURCE_KEY,
    notes: "One fee-schedule row for the IBC data (2009-07-01), cited as the Type Factor source for every commercial construction-factor lookup.",
  },
  {
    entityType: "permit_page",
    entityKey: `${SPRINGFIELD_KEYS.jurisdiction}:building:building-permit-cost`,
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: SPRINGFIELD_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: SPRINGFIELD_COMMERCIAL_SOURCE_KEY,
    notes: "Three published pages, each with intro ≥240, localSummary ≥120 and four to six FAQs — building (commercial + residential construction-factor marginal tables, plan 75% + tech 18.5% alongside), electrical and plumbing verified together.",
  },
  {
    entityType: "permit_page",
    entityKey: `${SPRINGFIELD_KEYS.jurisdiction}:electrical:electrical-permit-cost`,
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: SPRINGFIELD_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: SPRINGFIELD_RESIDENTIAL_SOURCE_KEY,
    notes: "Electrical — $110/$171 stand-alone MEP flats and $49 change-outs; 40% ($110/$171) association named where a building permit exists.",
  },
  {
    entityType: "permit_page",
    entityKey: `${SPRINGFIELD_KEYS.jurisdiction}:plumbing:plumbing-permit-cost`,
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: SPRINGFIELD_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: SPRINGFIELD_RESIDENTIAL_SOURCE_KEY,
    notes: "Plumbing — $49 water-heater, $110 lawn-sprinkler/gas, commercial gas $171 / air-test $171; 40% ($171/$110) association named; gas/air-test/new-home shapes.",
  },
  {
    entityType: "jurisdiction_profile",
    entityKey: SPRINGFIELD_KEYS.jurisdiction,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: SPRINGFIELD_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: SPRINGFIELD_IBC_SOURCE_KEY,
    notes: "Springfield profile and BDS context (two schedules cited, IBC matrix dated, association rows named, provisional as second payment schedule distinguished).",
  },
];

export const springfieldSeed: JurisdictionSeed = {
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
