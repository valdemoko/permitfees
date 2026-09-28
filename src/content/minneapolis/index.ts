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
  MINNEAPOLIS_BUILDING_BASE_RULES,
  MINNEAPOLIS_BUILDING_SHEET_SOURCE_KEY,
  MINNEAPOLIS_ELECTRICAL_BASE_RULES,
  MINNEAPOLIS_FEE_EFFECTIVE_FROM,
  MINNEAPOLIS_FEE_PAGES_SOURCE_KEY,
  MINNEAPOLIS_PLUMBING_BASE_RULES,
  MINNEAPOLIS_PLUMBING_SHEET_SOURCE_KEY,
  MINNESOTA_DLI_SOURCE_KEY,
} from "./fee-rules";

export * from "./fee-rules";

/**
 * The complete Minneapolis, Minnesota seed payload.
 *
 * Every figure traces to research/minnesota/minneapolis.md, which traces to the City's
 * two published Smartsheet fee schedules (building and plumbing), the City pages that
 * embed them, and the State of Minnesota's own electrical fee worksheets under 326B.37.
 * Nothing is estimated.
 *
 * Three pages, all published: building, electrical and plumbing. Minneapolis contributes
 * the dataset's first schedule that prints its own three-component formula — permit fee,
 * 65% plan review, state surcharge — a nine-band marginal ladder whose per-band bases are
 * the schedule's own printed numbers, and the authority boundary Minnesota shares with
 * North Dakota: the electrical permit is the State's (326B.37), priced from DLI's own
 * worksheets, while building and plumbing are the City's.
 *
 * The county row records **Hennepin County**. Minneapolis Development Review issues
 * permits citywide, so the county is a locator rather than an authority.
 */

const RESEARCHER = "Permit Fee Intelligence research pass 16 (Minnesota)";

export const MINNEAPOLIS_LAST_VERIFIED = "2026-09-25";

export const MINNEAPOLIS_KEYS = {
  state: "mn",
  county: "hennepin-county",
  jurisdiction: "minneapolis",
  feeSchedule: "minneapolis-fee-schedules",
} as const;

const state: SeedState = {
  code: "MN",
  slug: "minnesota",
  name: "Minnesota",
  fipsCode: "27",
};

const county: SeedCounty = {
  key: MINNEAPOLIS_KEYS.county,
  slug: "hennepin-county",
  name: "Hennepin County",
  fipsCode: "27053",
};

const jurisdiction: SeedJurisdiction = {
  key: MINNEAPOLIS_KEYS.jurisdiction,
  stateKey: MINNEAPOLIS_KEYS.state,
  countyKey: MINNEAPOLIS_KEYS.county,
  type: "city",
  slug: "minneapolis",
  name: "Minneapolis",
  officialName: "City of Minneapolis",
  websiteUrl: "https://www.minneapolismn.gov/",
  permitPortalUrl:
    "https://www.minneapolismn.gov/business-services/licenses-permits-inspections/construction-permits/",
  timezone: "America/Chicago",
  isActive: true,
};

const departments: SeedDepartment[] = [
  {
    key: "minneapolis-development-review",
    jurisdictionKey: MINNEAPOLIS_KEYS.jurisdiction,
    kind: "building",
    name: "Minneapolis Development Review (Community Planning & Economic Development)",
    phone: "(612) 673-3000",
    email: "311@minneapolismn.gov",
    url: "https://www.minneapolismn.gov/business-services/licenses-permits-inspections/construction-permits/",
    addressLine: "Public Service Building, 505 Fourth Ave. S., Room 220, Minneapolis, MN 55415",
    hours: "Service center: Monday through Thursday 8 a.m. - 4 p.m.; Friday 9 a.m. - 4 p.m.",
    notes:
      "Minneapolis Development Review issues the City's building and plumbing permits and publishes the fee schedules both pages embed. The contact block is printed at the foot of each fee page. Electrical permitting is not the City's: Minnesota's Electrical Act gives the inspection to the Department of Labor and Industry or its contract inspectors, and the Authority Having Jurisdiction directory decides who issues where — the electrical page is priced from the State's own worksheets.",
  },
];

const sources: SeedSource[] = [
  {
    key: MINNEAPOLIS_BUILDING_SHEET_SOURCE_KEY,
    jurisdictionKey: MINNEAPOLIS_KEYS.jurisdiction,
    title: "Minneapolis Building Permit Fee Schedule (published Smartsheet)",
    url: "https://publish.smartsheet.com/5bac769dc10f49f7a65d69b39243a54f",
    sourceType: "fee_schedule_pdf",
    issuingAuthority: "City of Minneapolis — Minneapolis Development Review",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: MINNEAPOLIS_FEE_EFFECTIVE_FROM,
    retrievedAt: MINNEAPOLIS_LAST_VERIFIED,
    lastVerifiedAt: MINNEAPOLIS_LAST_VERIFIED,
    notes:
      'Read 2026-09-25 as static HTML from the City\'s own "View full screen" link on the Building permit fees page — the sheet renders server-side, so every cell is readable without a browser. The first row is the formula the whole schedule implements: "Building Permit Fee + Plan Review Fee (65% x building permit fee) + MN State Surcharge (Value of Work x 0.0005) = Total Permit Fee". Nine value bands follow, each "first $X plus $Y each additional $1,000 and fraction thereof" (band 2 in $100 steps), with the $84.20 minimum marked "(does not include State Surcharge)" and a footnote citing 1300.0160 Subp 3, bulletin 058 and §91.220. Also on the sheet: "Detached garages — See Minneapolis detached garage fee schedule".',
  },
  {
    key: MINNEAPOLIS_PLUMBING_SHEET_SOURCE_KEY,
    jurisdictionKey: MINNEAPOLIS_KEYS.jurisdiction,
    title: "Minneapolis Plumbing Fee Schedule (published Smartsheet)",
    url: "https://publish.smartsheet.com/2fef8aaf1a294ca2a7b815ec6c2bf33b",
    sourceType: "fee_schedule_pdf",
    issuingAuthority: "City of Minneapolis — Minneapolis Development Review",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: MINNEAPOLIS_FEE_EFFECTIVE_FROM,
    retrievedAt: MINNEAPOLIS_LAST_VERIFIED,
    lastVerifiedAt: MINNEAPOLIS_LAST_VERIFIED,
    notes:
      'Read 2026-09-25 as static HTML from the plumbing fee page\'s own link. The plumbing rows are $41.40 each — full fixture, fixture set, waste and vent, rainwater leader per 10 stories or fraction, water distribution per 100 lineal feet or fraction, alterations per $500 or fraction — with the minimum "$85.20 (Includes $1.00 State Surcharge)" and "$1.00 per permit application". The sheet also carries the gas rows (non-heating gas burners $73.30/$291.00, gas piping only at 1.99% of value) and the pointer "See Chapter 91 for Complete Fee Schedule" — gas is a trade this site\'s plumbing page does not price, and the rows are transcribed in the research record.',
  },
  {
    key: MINNEAPOLIS_FEE_PAGES_SOURCE_KEY,
    jurisdictionKey: MINNEAPOLIS_KEYS.jurisdiction,
    title: "Permit fee pages — building and plumbing (the pages that embed the schedules)",
    url: "https://www.minneapolismn.gov/business-services/licenses-permits-inspections/construction-permits/permits-overview/fees/building/",
    sourceType: "municipal_website",
    issuingAuthority: "City of Minneapolis",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2026-02-27",
    effectiveFrom: null,
    retrievedAt: MINNEAPOLIS_LAST_VERIFIED,
    lastVerifiedAt: MINNEAPOLIS_LAST_VERIFIED,
    notes:
      'Read 2026-09-25. Both pages stamp "Last updated on February 27, 2026" — the date carried as the schedules\' effectiveFrom, because the sheets say "Fees are updated upon City Council directive (or action)" and print no date of their own. Both carry the Development Review contact block (612-673-3000, Public Service Building, 505 Fourth Ave. S., Room 220; Monday-Thursday 8 a.m.-4 p.m., Friday 9 a.m.-4 p.m.) and embed the schedules with a "View full screen" link.',
  },
  {
    key: MINNESOTA_DLI_SOURCE_KEY,
    jurisdictionKey: MINNEAPOLIS_KEYS.jurisdiction,
    title: "DLI — Electrical permits and the statutory fee worksheets (Minnesota Statute 326B.37)",
    url: "https://www.dli.mn.gov/business/electrical-contractors/electrical-permits-contractors",
    sourceType: "state_agency",
    issuingAuthority: "Minnesota Department of Labor and Industry",
    authorityKind: "state",
    isPrimary: true,
    documentDate: "2025-06-01",
    effectiveFrom: null,
    retrievedAt: MINNEAPOLIS_LAST_VERIFIED,
    lastVerifiedAt: MINNEAPOLIS_LAST_VERIFIED,
    notes:
      'Read 2026-09-25: the contractors page and its printable page, plus four fee worksheets (ele-fee-new, ele-fee-exist, ele-fee-non, ele-fee-multi-new — REV 6.2025, "Fees are determined by Minnesota Statute 326B.37"). Every worksheet: $55 per inspection trip minimum, services by amperage ($35/$60/$100, over 600 V $70/$120/$200), new dwelling units $165 up to 30 circuits ($12 each beyond), the "largest of line 13 or line 14" rule with the $200/$400 dwelling minimums, then the $25.00 required permit fee and $1.00 surcharge. The worksheets also true themselves: "Any fee discrepancies will be reviewed by the inspector, and you will be billed for the difference." The AHJ directory decides whether the State or a contract inspector issues — "If the AHJ column lists \'State,\', file the permit with us."',
  },
];

/** Empty on purpose: the permit types Minneapolis uses already exist as shared rows. */
const permitTypes: JurisdictionSeed["permitTypes"] = [];
const projectTypes: JurisdictionSeed["projectTypes"] = [];

const jurisdictionPermitTypes: SeedJurisdictionPermitType[] = [
  {
    jurisdictionKey: MINNEAPOLIS_KEYS.jurisdiction,
    permitTypeKey: "building",
    isAvailable: true,
    localName: "Building permit — nine-band ladder + 65% plan review + 0.0005 state surcharge",
    officialUrl:
      "https://www.minneapolismn.gov/business-services/licenses-permits-inspections/construction-permits/permits-overview/fees/building/",
    notes:
      'The schedule prints its own formula: "Building Permit Fee + Plan Review Fee (65% x building permit fee) + MN State Surcharge (Value of Work x 0.0005) = Total Permit Fee". The ladder is marginal — each band "first $X plus $Y each additional $1,000 and fraction thereof", band 2 in $100 steps — with the $84.20 minimum excluding the surcharge, so the formula adds everything on top. The $2,001 anchor ($104.20) shows the fraction phrase buys whole steps.',
  },
  {
    jurisdictionKey: MINNEAPOLIS_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    isAvailable: true,
    localName: "Electrical permit — the State's, under 326B.37 (DLI fee worksheets)",
    officialUrl: "https://www.dli.mn.gov/business/electrical-contractors/electrical-permits-contractors",
    notes:
      "Minnesota's Electrical Act gives the inspection to the State or its contract inspectors; the City publishes no electrical fee schedule. The page prices the State's own worksheet: $55 per inspection trip, services by amperage ($35/$60/$100), new dwelling units at $165 up to 30 circuits, the $200/$400 dwelling minimums chosen by the worksheet's largest-of rule, plus the $25.00 required permit fee and $1.00 surcharge. The AHJ directory decides who issues at permit time.",
  },
  {
    jurisdictionKey: MINNEAPOLIS_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    isAvailable: true,
    localName: "Plumbing permit — $41.40 rows with the $85.20 minimum (surcharge included)",
    officialUrl:
      "https://www.minneapolismn.gov/business-services/licenses-permits-inspections/construction-permits/permits-overview/fees/plumbing/",
    notes:
      "Full fixture, fixture set and waste-and-vent are $41.40 each; rainwater leaders are $41.40 per 10 stories or fraction, water distribution $41.40 per 100 lineal feet or fraction, alterations $41.40 per $500 or fraction. The $85.20 minimum includes the $1.00 state surcharge — the sheet's own parenthetical — so the floor holds the surcharge at the minimum and the $1.00 charges beside the rows above it.",
  },
];

const feeSchedules: SeedFeeSchedule[] = [
  {
    key: MINNEAPOLIS_KEYS.feeSchedule,
    jurisdictionKey: MINNEAPOLIS_KEYS.jurisdiction,
    sourceKey: MINNEAPOLIS_BUILDING_SHEET_SOURCE_KEY,
    title: "Minneapolis fee schedules — building and plumbing Smartsheets (2026)",
    officialUrl:
      "https://publish.smartsheet.com/5bac769dc10f49f7a65d69b39243a54f",
    effectiveFrom: MINNEAPOLIS_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: MINNEAPOLIS_LAST_VERIFIED,
    notes:
      "Two published Smartsheet schedules, one per trade, dated to the City pages' own stamp ('Last updated on February 27, 2026') because the sheets say 'Fees are updated upon City Council directive (or action)' and print no date of their own. The electrical trade has no City schedule to date: it is the State's under 326B.37, and the worksheets carry their own revision (REV 6.2025).",
  },
];

function attach(permitTypeKey: string, rules: FeeRuleRecord[]): SeedFeeRule[] {
  return rules.map((rule) => ({
    jurisdictionKey: MINNEAPOLIS_KEYS.jurisdiction,
    permitTypeKey,
    scheduleKey: MINNEAPOLIS_KEYS.feeSchedule,
    rule,
  }));
}

const feeRules: SeedFeeRule[] = [
  ...attach("building", MINNEAPOLIS_BUILDING_BASE_RULES),
  ...attach("electrical", MINNEAPOLIS_ELECTRICAL_BASE_RULES),
  ...attach("plumbing", MINNEAPOLIS_PLUMBING_BASE_RULES),
];

const requirements: SeedRequirement[] = [
  {
    jurisdictionKey: MINNEAPOLIS_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "document",
    title: "Construction value is determined by code language, not by the applicant's say-so",
    description:
      'The schedule\'s footnote: "Construction Value to be included in determining building permit valuation in accordance with building code language (1300.0160 Subp 3), bulletin 058 and Minneapolis Code of Ordinances (Title 5, Ch. 91, Article II, Section 91.220)". The valuation the ladder reads is the code\'s construction value — what must be included is fixed by ordinance and a state bulletin, which is what the whole fee ultimately scales from.',
    isMandatory: true,
    sortOrder: 10,
    sourceKey: MINNEAPOLIS_BUILDING_SHEET_SOURCE_KEY,
    lastVerifiedAt: MINNEAPOLIS_LAST_VERIFIED,
  },
  {
    jurisdictionKey: MINNEAPOLIS_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "Fees move only by City Council directive",
    description:
      'Both fee pages state it: "Fees are updated upon City Council directive (or action)." The schedules carry no date of their own; the pages stamp February 27, 2026 as their last update. A fee on this site is therefore dated to that stamp, and a reader checking a later date should confirm the Council has not acted since.',
    isMandatory: true,
    sortOrder: 20,
    sourceKey: MINNEAPOLIS_FEE_PAGES_SOURCE_KEY,
    lastVerifiedAt: MINNEAPOLIS_LAST_VERIFIED,
  },
  {
    jurisdictionKey: MINNEAPOLIS_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "other",
    title: "Who issues the electrical permit is decided by the AHJ directory",
    description:
      'DLI\'s contractors page: "Before filing a permit or calling for an inspection, verify the Authority Having Jurisdiction (AHJ) in the directory: If the AHJ column lists \'State,\' file the permit with us." Contract electrical inspection areas have their own inspector contacts; virtual inspections are limited to three circuits at the standard $35 fee. The fee is the State\'s wherever the State is the AHJ — the worksheets are its price list.',
    isMandatory: true,
    sortOrder: 10,
    sourceKey: MINNESOTA_DLI_SOURCE_KEY,
    lastVerifiedAt: MINNEAPOLIS_LAST_VERIFIED,
  },
  {
    jurisdictionKey: MINNEAPOLIS_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "other",
    title: "The worksheet fee is an estimate the inspector trues up",
    description:
      'Every worksheet states: "These calculated fees may not accurately represent all the required inspection fees. Any fee discrepancies will be reviewed by the inspector, and you will be billed for the difference." The fee the worksheet computes is a best estimate of the minimums; the inspector\'s review is the final word, and the difference is billed rather than refunded automatically.',
    isMandatory: true,
    sortOrder: 20,
    sourceKey: MINNESOTA_DLI_SOURCE_KEY,
    lastVerifiedAt: MINNEAPOLIS_LAST_VERIFIED,
  },
  {
    jurisdictionKey: MINNEAPOLIS_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    requirementType: "other",
    title: "Gas work is priced on the same sheet and permitted as its own trade",
    description:
      'The plumbing sheet carries the gas rows beside the plumbing ones — non-heating gas burners at $73.30/$291.00 with an $85.20 minimum, gas piping only at "1.99% of the value or the minimum fee, whichever is greater", and the combined-burner footnote — under the pointer "See Chapter 91 for Complete Fee Schedule". This site prices the plumbing rows; the gas rows are named on the page and transcribed in the research record.',
    isMandatory: false,
    sortOrder: 10,
    sourceKey: MINNEAPOLIS_PLUMBING_SHEET_SOURCE_KEY,
    lastVerifiedAt: MINNEAPOLIS_LAST_VERIFIED,
  },
];

const profile: SeedProfile = {
  jurisdictionKey: MINNEAPOLIS_KEYS.jurisdiction,
  headline: "What construction permits cost in Minneapolis",
  summary:
    "Minneapolis is the city whose schedule **prints its own formula**: Building Permit Fee + Plan Review Fee (65% of the permit fee) + MN State Surcharge (Value of Work × 0.0005) = Total Permit Fee. The permit fee is a nine-band ladder — $36.70 at the bottom, each band \"first $X plus $Y each additional $1,000 and fraction thereof\" — so $25,001 of work rounds to a whole step at $578.00. Plumbing is $41.40 a row with an $85.20 minimum that already includes the $1.00 surcharge. And the electrical permit is not Minneapolis's at all: it is the State of Minnesota's, priced from the statute's own worksheets.",
  localContext:
    "The building schedule's first row is the formula, and the rest of the sheet is one of its terms. The nine-band ladder is marginal — every band after the first reads \"first $X plus $Y each additional $1,000 **and fraction thereof**\", so the fraction buys a whole step, and the schedule's own anchor proves it: $2,001 of value is $104.20, the printed base plus one full $20.60 step for the single dollar. Band 2 is the odd one out, denominated in $100 steps at $4.50. The bands' printed bases are the schedule's own numbers, not derivable arithmetic — at the $25,000 seam the sheet prints $578.00 where the previous band's formula computes $578.20, a two-cent rounding the schedule itself contains and this calculator charges as printed.\n\nThe plan review is 65% **of the permit fee** because the formula says so — no separate plan-review table exists, the relationship is the table — and the state surcharge is 0.0005 of the work, five cents per $1,000. The two components are charged on different bases, which is the formula's own design: one scales with the fee, the other with the job.\n\nThe plumbing sheet is a price list of $41.40 rows — full fixture, fixture set, waste and vent, and three block rates (per 10 stories, per 100 lineal feet, per $500 of alterations, each \"or fraction thereof\") — with the minimum \"$85.20 (Includes $1.00 State Surcharge)\". The parenthetical matters: the building minimum *excludes* its surcharge and the plumbing minimum *includes* its $1.00, and both sheets say so in their own words. The plumbing sheet also carries the gas trade's rows and the pointer to Chapter 91 — transcribed, not charged.\n\nThe electrical permit is where Minnesota repeats North Dakota's boundary: the State issues where the AHJ directory says \"State\", and its fee worksheets — REV 6.2025, \"Fees are determined by Minnesota Statute 326B.37\" — are the price list. Inspection trips at $55, services by amperage, dwelling units at $165 with $200/$400 minimums, the $25 permit fee and the $1.00 surcharge, and a trueing rule the worksheets print on every page: discrepancies are reviewed by the inspector and the difference billed.\n\nThe schedules themselves are Smartsheet documents the City embeds on its fee pages — served as static HTML, readable cell by cell — stamped \"Last updated on February 27, 2026\", with fees moving \"upon City Council directive (or action)\". No technology fee appears anywhere on the sheets; the state surcharge is the only levy above the City's own, and it is printed in the formula.",
  valuationBasis:
    "The basis for building work is **the construction value** as the code defines it — the sheet's footnote cites 1300.0160 Subp 3, bulletin 058 and §91.220 for what must be included — and the ladder reads it in nine bands. Every band after the first is \"plus $Y each additional $1,000 **and fraction thereof**\", so the chargeable value is rounded up to whole $1,000s inside the band: $25,001 buys a whole step, which is why the sheet's own $104.20 anchor at $2,001 is the printed base plus a full $20.60. The band bases are printed numbers, not derivable arithmetic — the $578.00 at the $25,000 seam is two cents below the prior band's formula, and the schedule wins.\n\nThe formula's other two terms read **different bases**: the plan review is 65% of the permit fee (a share of the ladder's output), and the state surcharge is 0.0005 of the work's value (five cents per $1,000 of the job). Neither is a percentage of the same number, which is why the sheet prints all three as one formula.\n\nPlumbing reads no valuation except the alterations row: $41.40 per $500 of value or fraction, beside the per-fixture, per-10-stories and per-100-feet rows. Electrical reads counts and amperages, not cost — trips, sources, dwelling units, circuits — because that is how the statute's worksheet is built. Nothing on any sheet derives a valuation from square footage.",
  notIncluded:
    "These figures are Minneapolis's own building and plumbing permit fees and the State of Minnesota's electrical permit fees. They are not a project cost, and they exclude:\n\n- **The detached-garage schedule** — the building sheet's own pointer, \"See Minneapolis detached garage fee schedule\": a separate instrument, named rather than read.\n- **The gas trade's rows on the plumbing sheet** — non-heating gas burners ($73.30 up to 399,999 Btu, $291.00 at 400,000 and over, $85.20 minimum, the combined-burner footnote) and \"Gas Piping Only — 1.99% of the value or the minimum fee, whichever is greater\": gas permits, transcribed in the research record, not charged here.\n- **The DLI worksheet rows outside the page's reach** — over-600-volt services ($70/$120/$200), non-dwelling circuits ($12/$15/$24/$30), reconnected circuits ($2), transformers ($15/$30), manufactured-home pedestals, RV circuits, sign power supplies, technology devices at 75¢, lighting retrofit at 25¢, and center-pivot irrigation: transcribed in the research record.\n- **The inspector's trueing rule** — \"Any fee discrepancies will be reviewed by the inspector, and you will be billed for the difference\": a correction on the estimate, stated on the page rather than modelled.\n- **Parkland dedication, signs, code compliance and refunds** — separate City fee pages in the same fee index, other instruments entirely.\n- **Technology fees — none exist** on any sheet; the state surcharge is the only levy above the City's own, and it is printed in the building formula and on the plumbing sheet.",
  seoTitle: "Minneapolis construction permit fees",
  seoDescription:
    "How Minneapolis prices construction permits — the printed formula of ladder + 65% plan review + 0.0005 surcharge, $41.40 plumbing rows with an $85.20 minimum, and the State's own electrical worksheets.",
  publishStatus: "published",
  noindex: false,
  lastReviewedAt: MINNEAPOLIS_LAST_VERIFIED,
};

const permitPages: SeedPermitPage[] = [
  {
    jurisdictionKey: MINNEAPOLIS_KEYS.jurisdiction,
    permitTypeKey: "building",
    slug: "building-permit-cost",
    title: "Minneapolis building permit cost",
    intro:
      "A Minneapolis building permit is priced by **the formula the schedule itself prints**: Building Permit Fee + Plan Review Fee (65% × the permit fee) + MN State Surcharge (Value of Work × 0.0005) = Total Permit Fee. The permit fee is a nine-band ladder of \"first $X plus $Y each additional $1,000 and fraction thereof\" — $36.70 at the bottom, $84.20 minimum — and the fraction phrase buys a whole step, which the schedule's own anchor at $2,001 proves.",
    localSummary:
      "The ladder is marginal: each band's base is the schedule's own printed number and the rate inside it steps per $1,000 (band 2, alone, steps per $100 at $4.50). $25,000 of work sits in band 3: $104.20 plus 23 × $20.60 — $578.20 computed, $578.00 printed at the seam, and the schedule's printed figure wins. $100,000 of work: $950.50. $500,000: $4,840.50 plus $8.40 steps in band 6.\n\nThe formula's other two terms read different bases. The plan review is 65% **of the permit fee** — of the ladder's output, not of the job — so $578.00 of permit fee carries $375.70 of plan review. The state surcharge is 0.0005 **of the work**: five cents per $1,000, $12.50 on $25,000. One scales with the fee, the other with the job, which is why the sheet prints all three as one formula.\n\nThe minimum is $84.20 of permit fee \"does not include State Surcharge\" — the sheet's own parenthesis — so a job valued at $500 pays the $84.20 floor plus 65% ($54.73) plus the surcharge. And the two-cent seam is worth naming: the printed bases are the schedule's numbers, not arithmetic a calculator derives, and where the two disagree by pennies the schedule wins.",
    notIncluded:
      "This is the building-permit term of the schedule's formula — the ladder and the $84.20 minimum. It excludes:\n\n- **The detached-garage schedule** — \"See Minneapolis detached garage fee schedule\", a separate instrument the sheet names.\n- **The plan review and the surcharge as separate instruments** — they are terms of the same formula here, charged beside the ladder exactly as the sheet's first row prints them.\n- **The code's valuation rules as a calculation** — what counts toward construction value is fixed by 1300.0160 Subp 3, bulletin 058 and §91.220, quoted on the page; the calculator reads the value the code defines, it does not derive it.\n- **Technology fees — none exist** on the sheet, and the state surcharge is the only levy above the City's own.\n- **Parkland dedication, signs, code compliance and refunds** — separate City fee pages in the same fee index.",
    workedExample: {
      scenario:
        "A $150,000 addition — new construction valued inside band 5 of the ladder, the ordinary mid-size residential job.",
      inputs: { valuationCents: 15_000_000 },
      notes:
        "The ladder term, band 5: $950.50 for the first $50,000 plus $10.60 for each $1,000 of the $100,000 above it — one hundred steps, $1,060.00 — so the permit fee is $2,010.50.\n\nThe formula's other terms: plan review at 65% of the permit fee is $1,306.83, and the state surcharge at 0.0005 of $150,000 is $75.00. The total permit fee is $3,392.33 — the sheet's three components, each on its own basis.\n\nAt the seam below, $50,001 of value would buy one $10.60 step over the $950.50 base — $961.10 — because \"and fraction thereof\" rounds the single dollar up to a whole step. And at $500 exactly the minimum governs: $84.20 of permit fee, before the formula adds its other two terms.",
    },
    faqs: [
      {
        question: "How much is a building permit in Minneapolis?",
        answer:
          "The schedule prints the formula: Building Permit Fee + Plan Review Fee (65% × the permit fee) + MN State Surcharge (Value of Work × 0.0005). The permit fee is a nine-band ladder — $36.70 at $500 and below ($84.20 minimum), stepping per $1,000 and fraction thereof to $5.60 a step above $1,000,000. A $150,000 job is $2,010.50 of permit fee.",
        sourceId: MINNEAPOLIS_BUILDING_SHEET_SOURCE_KEY,
      },
      {
        question: "Does Minneapolis round the valuation up to the next $1,000?",
        answer:
          "Inside each band, yes — every band after the first reads 'plus $Y each additional $1,000 and fraction thereof', and the schedule's own anchor proves the reading: $2,001 of value is $104.20, the printed base plus one whole $20.60 step for the single dollar. The fraction buys the whole step.",
        sourceId: MINNEAPOLIS_BUILDING_SHEET_SOURCE_KEY,
      },
      {
        question: "How is the plan review fee calculated?",
        answer:
          "Exactly as the formula says: 65% of the building permit fee. There is no separate plan-review table — the relationship is the schedule's first row. The 65% scales with the fee, not with the job, which is why the formula's third term reads a different base.",
        sourceId: MINNEAPOLIS_BUILDING_SHEET_SOURCE_KEY,
      },
      {
        question: "What is the Minnesota state surcharge?",
        answer:
          "On the building sheet, 'Value of Work x 0.0005' — five cents for each $1,000 of the work's value, so $12.50 on a $25,000 job. The plumbing sheet's surcharge is different, a flat $1.00 per application, and each sheet is charged as it states. It is the only levy above the City's own; there is no technology fee.",
        sourceId: MINNEAPOLIS_BUILDING_SHEET_SOURCE_KEY,
      },
      {
        question: "Why does the calculator use $578.00 at $25,000 when the bands compute $578.20?",
        answer:
          "Because the printed base is the schedule's own number: each band's base is what the sheet prints at that band's start, and at the $25,000 seam the sheet prints $578.00 where the previous band's arithmetic lands at $578.20 — a two-cent rounding the schedule itself contains. The printed figure wins; the calculator does not smooth a seam the document holds.",
        sourceId: MINNEAPOLIS_BUILDING_SHEET_SOURCE_KEY,
      },
      {
        question: "Is the minimum fee different for residential and commercial?",
        answer:
          "No — the schedule's own row is 'Minimum Fee - Residential or Commercial $84.20', one floor for both, with the parenthetical '(does not include State Surcharge)'. The formula's plan review and surcharge add on top. The plumbing sheet's minimum is the one that includes its surcharge, and the two sheets say so in their own parentheses.",
        sourceId: MINNEAPOLIS_BUILDING_SHEET_SOURCE_KEY,
      },
    ],
    seoTitle: "Minneapolis building permit cost: the printed formula",
    seoDescription:
      "Minneapolis building permit fees — the schedule's own formula of nine-band ladder plus 65% plan review plus 0.0005 state surcharge, the $84.20 minimum, and the fraction round-up the sheet's own anchor proves.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: MINNEAPOLIS_LAST_VERIFIED,
  },
  {
    jurisdictionKey: MINNEAPOLIS_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    slug: "electrical-permit-cost",
    title: "Minneapolis electrical permit cost",
    intro:
      "The electrical permit in Minneapolis is **the State of Minnesota's, not the City's**: the Electrical Act (326B.37) gives the inspection to the Department of Labor and Industry or its contract inspectors, and the fee worksheets — REV 6.2025 — are the price list. Inspection trips at $55 each, services by amperage ($35/$60/$100), new dwelling units at $165 up to 30 circuits, dwelling minimums of $200/$400, plus the $25.00 required permit fee and the $1.00 surcharge.",
    localSummary:
      "The worksheet offers two ways to price a job and says to take the larger: the number of inspection trips at $55 each, or the itemised lines — services, dwelling units, circuits, bonding, grounding, technology devices. A new one-family dwelling with its service and up to 30 circuits is $165 + $35 + $25 + $1 = $226 computed, and the worksheet's own line 14 minimum ($200 one-family, $400 two-family) trues it to the larger.\n\nThe minimum's wording carries its scope: 'for each separate dwelling unit, this includes the service up to 400 A, up to 30 circuits, and a maximum of 4 inspections' — so the $200 is not a floor below the arithmetic but a package covering the ordinary house. Circuits beyond 30 are $12 each; sources over 400 A step to $60 and $100.\n\nWho issues is a lookup, not a guess: 'Before filing a permit or calling for an inspection, verify the Authority Having Jurisdiction (AHJ) in the directory: If the AHJ column lists State, file the permit with us.' And every worksheet trues itself: 'Any fee discrepancies will be reviewed by the inspector, and you will be billed for the difference.'",
    notIncluded:
      "This is the State of Minnesota's electrical permit, priced from DLI's own fee worksheets. It excludes:\n\n- **The worksheet rows outside the page's reach** — over-600-volt services ($70/$120/$200), non-dwelling circuits ($12/$15/$24/$30 by amperage and voltage), reconnected existing circuits ($2 for panelboard replacements), transformers ($15 up to 10 kVA, $30 above), manufactured-home park lot supplies ($35/pedestal), RV pedestals ($12/circuit), street and traffic standards ($5), sign power supplies ($5), technology circuits and low-voltage devices (75¢ each), lighting retrofit (25¢/fixture), and center-pivot irrigation ($35/$5) — transcribed in the research record.\n- **The inspector's trueing** — discrepancies are reviewed and the difference billed; the worksheet computes a best estimate.\n- **Virtual inspection's limits** — three circuits at the standard $35 fee, at the inspector's discretion.\n- **Plan review, technology and city surcharges — none exist**; the $1.00 surcharge is the State's own, printed on its worksheet.",
    workedExample: {
      scenario:
        "A new one-family dwelling on the state's own worksheet: the dwelling unit with its 30 circuits, one 400-ampere-or-less service, and the required permit fee and surcharge.",
      inputs: {
        custom: { new_dwelling_units: 1, power_sources: 1, elec_dwelling_minimum: true },
      },
      notes:
        "The itemised lines: $165.00 for the dwelling unit (up to 30 circuits), $35.00 for the service, then the worksheet's line 16 and 17 — the $25.00 required permit fee and the $1.00 surcharge. The inspection total is $226.00 computed.\n\nLine 14's minimum is the other candidate: 'The Minimum fee for a new one-family dwelling is $200', which includes the service up to 400 A, up to 30 circuits and up to four inspections. The worksheet says to enter the largest amount from line 13 or 14 — the computed $200.00 of inspection fees (before the permit fee and surcharge) and the $200.00 minimum are the same here, so the permit is $226.00 either way.\n\nA two-family dwelling doubles the unit line: two $165 units, a two-unit $400 minimum, and the same $25.00 + $1.00 — where the worksheet's largest-of rule does the choosing.",
    },
    faqs: [
      {
        question: "How much is an electrical permit in Minneapolis?",
        answer:
          "The electrical permit is the State of Minnesota's, priced by statute (326B.37) on DLI's fee worksheets: $55 per inspection trip, or the itemised lines — $165 per new dwelling unit (up to 30 circuits), $35/$60/$100 per power source by amperage — whichever is larger, plus the $25.00 required permit fee and the $1.00 surcharge. New-dwelling minimums are $200 one-family and $400 two-family.",
        sourceId: MINNESOTA_DLI_SOURCE_KEY,
      },
      {
        question: "Why doesn't the City of Minneapolis price electrical permits?",
        answer:
          "Because Minnesota's Electrical Act gives the inspection to the State. The City publishes no electrical fee schedule; DLI's contractors page says to verify the Authority Having Jurisdiction in the directory — 'If the AHJ column lists State, file the permit with us' — and in contract inspection areas a contract inspector issues. The fee is the statute's either way.",
        sourceId: MINNESOTA_DLI_SOURCE_KEY,
      },
      {
        question: "What does a new dwelling's electrical minimum include?",
        answer:
          "The worksheet's line 14, in full: 'The Minimum fee for a new one-family dwelling is $200, and a two-family dwelling is $400 (for each separate dwelling unit, this includes the service up to 400 A, up to 30 circuits, and a maximum of 4 inspections).' The minimum is a package covering the ordinary house, and the worksheet charges the largest of the computed subtotal or this minimum.",
        sourceId: MINNESOTA_DLI_SOURCE_KEY,
      },
      {
        question: "What if my project needs more than 30 circuits?",
        answer:
          "The $165 dwelling-unit line covers up to 30 circuits and/or feeders; each one beyond is $12 on the new-dwelling worksheet. Non-dwelling circuits are priced on their own worksheet at $12 to $30 by amperage and voltage class, and reconnected existing circuits at $2 — all transcribed in the research record.",
        sourceId: MINNESOTA_DLI_SOURCE_KEY,
      },
      {
        question: "Is the worksheet fee the final price?",
        answer:
          "No, and the worksheet says so: 'These calculated fees may not accurately represent all the required inspection fees. Any fee discrepancies will be reviewed by the inspector, and you will be billed for the difference.' The worksheet computes a best estimate of the minimums; the inspector's review is the final word.",
        sourceId: MINNESOTA_DLI_SOURCE_KEY,
      },
      {
        question: "Can I get a virtual inspection?",
        answer:
          "For eligible permits, yes — DLI's virtual electrical inspection program is limited to three circuits at the standard $35 fee, and at the inspector's discretion some inspections proceed virtually. Scheduling information is provided by email after the permit is submitted, and self-scheduling is available for eligible permits.",
        sourceId: MINNESOTA_DLI_SOURCE_KEY,
      },
    ],
    seoTitle: "Minneapolis electrical permit cost: the state fee",
    seoDescription:
      "Electrical permit fees in Minneapolis are Minnesota's, under 326B.37 — $55 inspection trips, $165 per dwelling unit, $200/$400 minimums, the $25 permit fee and $1 surcharge, from DLI's own worksheets.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: MINNEAPOLIS_LAST_VERIFIED,
  },
  {
    jurisdictionKey: MINNEAPOLIS_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    slug: "plumbing-permit-cost",
    title: "Minneapolis plumbing permit cost",
    intro:
      "A Minneapolis plumbing permit is **a price list of $41.40 rows with an $85.20 floor**: full fixture, fixture set, and waste-and-vent permits are $41.40 each at every occupancy, rainwater leaders are $41.40 per 10 stories or fraction, water distribution $41.40 per 100 lineal feet or fraction, and alterations $41.40 per $500 or fraction. The minimum — \"$85.20 (Includes $1.00 State Surcharge)\" — is the sheet's own parenthesis, and it matters.",
    localSummary:
      "The $41.40 rows stack by scope: a permit for one full fixture computes $41.40 + $1.00 = $42.40 and pays the $85.20 minimum; a permit with three block rates computes its own arithmetic. The three block rows all say 'or fraction thereof' — 25 stories of rainwater leader is three whole $41.40 blocks, $124.20; 150 feet of water distribution is two blocks, $82.80; a $2,000 alteration is four blocks of $500, $165.60.\n\nThe minimum's parenthetical is where Minneapolis differs from most: the building sheet's minimum *excludes* its surcharge and the plumbing sheet's *includes* it — '$85.20 (Includes $1.00 State Surcharge)' against '$84.20 (does not include State Surcharge)' — so the calculator holds the $1.00 inside the plumbing floor and beside the rows above it, never doubled.\n\nThe sheet also carries the gas trade beside the plumbing one — non-heating gas burners at $73.30/$291.00 and 'Gas Piping Only: 1.99% of the value or the minimum fee, whichever is greater', under the pointer 'See Chapter 91 for Complete Fee Schedule' — transcribed, not charged: gas is its own trade, and this page prices the plumbing rows.",
    notIncluded:
      "This is the plumbing section of the City's plumbing fee schedule. It excludes:\n\n- **The gas rows on the same sheet** — non-heating gas burners ($73.30 not exceeding 399,999 Btu, $291.00 at 400,000 and over, $85.20 minimum, with the combined-burner footnote) and gas piping only at 1.99% of value: gas permits, a trade this page does not price.\n- **The Chapter 91 pointer** — 'See Chapter 91 for Complete Fee Schedule': the ordinance behind the sheet, named rather than read as the source.\n- **Plan review percentages and technology fees — none exist** on the plumbing sheet; the $1.00 state surcharge is the only levy, and it is inside the minimum at the floor.\n- **Parkland dedication, signs, code compliance and refunds** — separate City fee pages, other instruments entirely.",
    workedExample: {
      scenario:
        "A basement finish's plumbing on one permit — a full fixture group and 120 feet of replacement water distribution piping, all occupancies.",
      inputs: {
        custom: { linear_feet: 120, plumbing_scope: "full_fixture" },
      },
      notes:
        "Two $41.40 rows: the full fixture ($41.40) and the water distribution at 'each 100 lineal feet or fraction thereof' — 120 feet is two blocks ($82.80), because the fraction phrase buys the second block for the 20 feet. The rows total $124.20, plus the $1.00 state surcharge: $125.20, above the minimum, paid as computed.\n\nA one-fixture permit would have computed $42.40 and paid the $85.20 minimum — the floor holds the $1.00 surcharge inside it, per the sheet's own parenthetical. And the same 120 feet at exactly 100 feet would be one block: $41.40, because the fraction rule only fires on a partial block.\n\nAlterations read value instead of feet: $41.40 per $500 or fraction — a $2,000 alteration is four blocks, $165.60, before the surcharge.",
    },
    faqs: [
      {
        question: "How much is a plumbing permit in Minneapolis?",
        answer:
          "$41.40 per row: full fixture, fixture set only, or waste and vent only at any occupancy; rainwater leaders $41.40 per 10 stories or fraction; water distribution piping $41.40 per 100 lineal feet or fraction; alterations $41.40 per $500 or fraction. The minimum is $85.20, and it already includes the $1.00 state surcharge.",
        sourceId: MINNEAPOLIS_PLUMBING_SHEET_SOURCE_KEY,
      },
      {
        question: "Why does the minimum say it includes the surcharge?",
        answer:
          "Because the sheet prints it that way: 'Minimum Fee - Residential & Commercial $85.20 (Includes $1.00 State Surcharge)'. The building sheet's minimum says the opposite — '$84.20 (does not include State Surcharge)'. The two sheets disagree about the surcharge on purpose, each in its own parenthesis, and the calculator follows each literally: at the plumbing floor the $1.00 is inside, never added twice.",
        sourceId: MINNEAPOLIS_PLUMBING_SHEET_SOURCE_KEY,
      },
      {
        question: "What counts as a full fixture versus a fixture set?",
        answer:
          "The sheet prices them the same — 'Full Fixture - All Occupancies $41.40' and 'Fixture Set Only - All Occupancies $41.40' — so the calculator offers them as scopes at one price, with 'Waste and Vent Only' as the third $41.40 row. The sheet prices no per-fixture count; the $41.40 is the permit row, whatever the occupancy.",
        sourceId: MINNEAPOLIS_PLUMBING_SHEET_SOURCE_KEY,
      },
      {
        question: "How do the block rates work?",
        answer:
          "All three say 'or fraction thereof': $41.40 for each whole block, and a partial block buys a whole one. 25 stories of rainwater leader is three blocks ($124.20); 150 feet of water distribution is two ($82.80); a $2,000 alteration is four ($165.60). Exactly 100 feet, 10 stories or $500 is one block.",
        sourceId: MINNEAPOLIS_PLUMBING_SHEET_SOURCE_KEY,
      },
      {
        question: "Does the plumbing permit cover gas piping?",
        answer:
          "No — the sheet prices gas beside plumbing but as its own trade: 'Gas Piping Only: 1.99% of the value or the minimum fee, whichever is greater', and non-heating gas burners at $73.30/$291.00, under the pointer 'See Chapter 91 for Complete Fee Schedule'. Those rows are transcribed in the research record, not charged with the plumbing permit.",
        sourceId: MINNEAPOLIS_PLUMBING_SHEET_SOURCE_KEY,
      },
      {
        question: "Where do the fees come from and when do they change?",
        answer:
          "From the City's published plumbing fee schedule — a Smartsheet embedded on the fee page — and they move 'upon City Council directive (or action)'. The pages stamp February 27, 2026 as their last update, which is the date this site's figures carry.",
        sourceId: MINNEAPOLIS_FEE_PAGES_SOURCE_KEY,
      },
    ],
    seoTitle: "Minneapolis plumbing permit cost: $41.40 rows, $85.20 minimum",
    seoDescription:
      "Minneapolis plumbing permit fees — $41.40 per fixture, set, waste-and-vent, 10-story, 100-foot or $500 block, the $85.20 minimum with the surcharge inside, and the gas rows named on the same sheet.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: MINNEAPOLIS_LAST_VERIFIED,
  },
];

const verifications: SeedVerification[] = [
  {
    entityType: "source",
    entityKey: MINNEAPOLIS_BUILDING_SHEET_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: MINNEAPOLIS_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MINNEAPOLIS_BUILDING_SHEET_SOURCE_KEY,
    notes:
      "Read 2026-09-25 as static HTML served from the City's own View-full-screen link: the formula row, nine value bands, the minimum's parenthetical, the construction-value footnote, and the detached-garage pointer — every cell readable without a browser.",
  },
  {
    entityType: "source",
    entityKey: MINNEAPOLIS_PLUMBING_SHEET_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: MINNEAPOLIS_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MINNEAPOLIS_PLUMBING_SHEET_SOURCE_KEY,
    notes:
      "Read 2026-09-25 as static HTML: the $41.40 rows with their fraction phrases, the $85.20 minimum with its includes-surcharge parenthesis, the $1.00 row, and the gas rows beside them.",
  },
  {
    entityType: "source",
    entityKey: MINNEAPOLIS_FEE_PAGES_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: MINNEAPOLIS_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MINNEAPOLIS_FEE_PAGES_SOURCE_KEY,
    notes:
      "Read 2026-09-25 for the February 27, 2026 last-updated stamp — the schedules' effective date — the Council-directive fee-change mechanism, and the Development Review contact block.",
  },
  {
    entityType: "source",
    entityKey: MINNESOTA_DLI_SOURCE_KEY,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: MINNEAPOLIS_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MINNESOTA_DLI_SOURCE_KEY,
    notes:
      "Read 2026-09-25: the contractors page and four fee worksheets (REV 6.2025, fees under 326B.37) extracted with pdftotext — inspection trips, services, dwelling units, minimums, the $25 fee and $1 surcharge, and the trueing rule on every sheet.",
  },
  {
    entityType: "fee_schedule",
    entityKey: MINNEAPOLIS_KEYS.feeSchedule,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: MINNEAPOLIS_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MINNEAPOLIS_BUILDING_SHEET_SOURCE_KEY,
    notes:
      "Two Smartsheet schedules dated to the City pages' own February 27, 2026 stamp, because the sheets print no date and say fees move on Council directive. The electrical trade carries no City schedule — the State's worksheets (REV 6.2025) are its instrument.",
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-BAND-3",
    permitTypeKey: "building",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: MINNEAPOLIS_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MINNEAPOLIS_BUILDING_SHEET_SOURCE_KEY,
    notes:
      "'$2,001.00-$25,000.00 $104.20 - first $2,000 plus $20.60 each add'l $1000 and fraction thereof including $25,000' — the band whose own anchor ($104.20 at $2,001) proves the fraction round-up. Asserted at $2,001 and $25,000 in the content test.",
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-PLAN-REVIEW",
    permitTypeKey: "building",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: MINNEAPOLIS_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MINNEAPOLIS_BUILDING_SHEET_SOURCE_KEY,
    notes:
      "'Plan Review Fee (65% x building permit fee)' from the sheet's formula row — 65% of the ladder's output, charged as a plan-review component reading the permit-fee subtotal, never of the job's value.",
  },
  {
    entityType: "fee_rule",
    entityKey: "PLUMB-MINIMUM",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: MINNEAPOLIS_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MINNEAPOLIS_PLUMBING_SHEET_SOURCE_KEY,
    notes:
      "'Minimum Fee - Residential & Commercial $85.20 (Includes $1.00 State Surcharge)' — the floor held at $86.20 of total so the printed $85.20 plus the always-charged $1.00 makes the parenthetical true; asserted against a one-fixture permit in the content test.",
  },
  {
    entityType: "permit_page",
    entityKey: "building-permit-cost",
    permitTypeKey: "building",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: MINNEAPOLIS_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MINNEAPOLIS_BUILDING_SHEET_SOURCE_KEY,
    notes:
      "The formula stated in the intro, the $2,001 anchor and the $578.00-vs-$578.20 seam printed rather than smoothed, the two surcharge bases distinguished, and the minimum's parenthetical quoted.",
  },
  {
    entityType: "permit_page",
    entityKey: "electrical-permit-cost",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: MINNEAPOLIS_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MINNESOTA_DLI_SOURCE_KEY,
    notes:
      "The authority boundary stated (326B.37, AHJ directory), the worksheet's largest-of rule carried as the $165 rows beside the $200 minimum, the package scope of line 14 quoted, and the trueing rule named.",
  },
  {
    entityType: "permit_page",
    entityKey: "plumbing-permit-cost",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: MINNEAPOLIS_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MINNEAPOLIS_PLUMBING_SHEET_SOURCE_KEY,
    notes:
      "The $41.40 rows with their three block rates, the minimum's includes-surcharge parenthesis worked against the building sheet's opposite, and the gas rows named as another trade.",
  },
  {
    entityType: "jurisdiction_profile",
    entityKey: MINNEAPOLIS_KEYS.jurisdiction,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: MINNEAPOLIS_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MINNEAPOLIS_BUILDING_SHEET_SOURCE_KEY,
    notes:
      "Profile built from the two Smartsheet schedules, the City fee pages and the DLI worksheets. States the readings the model depends on — the formula, the marginal ladder with its printed bases, the two surcharge forms, the two minimums' opposite parentheticals, and the state electrical boundary — and names every row it does not charge.",
  },
];

export const minneapolisSeed: JurisdictionSeed = {
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
export const MINNEAPOLIS_PUBLISHED_PERMIT_PAGES = minneapolisSeed.permitPages.filter(
  (page) => page.publishStatus === "published" && !page.noindex,
);
