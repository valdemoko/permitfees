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
  NASHVILLE_BUILDING_BASE_RULES,
  NASHVILLE_BUILDING_PLAN_REVIEW_RULES,
  NASHVILLE_ELECTRICAL_BASE_RULES,
  NASHVILLE_FEE_EFFECTIVE_FROM,
  NASHVILLE_FEE_ORDINANCE_SOURCE_KEY,
  NASHVILLE_FEE_SCHEDULE_SOURCE_KEY,
  NASHVILLE_PLUMBING_BASE_RULES,
  NASHVILLE_PUBLICATIONS_SOURCE_KEY,
  NASHVILLE_TECH_FEE_ORDINANCE_SOURCE_KEY,
} from "./fee-rules";

export * from "./fee-rules";

/**
 * The complete Nashville / Davidson County, Tennessee seed payload.
 *
 * Every figure traces to research/tennessee/nashville.md, which traces to Metro Nashville's own
 * Codes Fee Schedule — the Metro Code's fee sections, 16.28.110 through 16.20.250, published as
 * one PDF — and to the two ordinances that adopted it. Nothing is estimated.
 *
 * Three pages, all published: building, electrical and plumbing. Tennessee opens with the
 * dataset's first **four-component building permit**: a $25 zoning examination fee, the
 * valuation fee, a codes tech fee of 10% of the valuation fee, and a plan review that is half
 * the permit fee below $275,000 and a printed ladder above it — the only plan review in the
 * dataset that turns over that sharply. The commercial ladder's printed bases are not its own
 * arithmetic in three of four bands, which is by now this dataset's oldest recurring finding.
 *
 * The county row records **Davidson County**. Nashville and Davidson County are one consolidated
 * government, so the county is the jurisdiction's own name rather than a separate authority.
 */

const RESEARCHER = "Permit Fee Intelligence research pass 17 (Tennessee)";

export const NASHVILLE_LAST_VERIFIED = "2026-09-25";

export const NASHVILLE_KEYS = {
  state: "tn",
  county: "davidson-county",
  jurisdiction: "nashville",
  feeSchedule: "nashville-fee-schedules",
} as const;

const state: SeedState = {
  code: "TN",
  slug: "tennessee",
  name: "Tennessee",
  fipsCode: "47",
};

const county: SeedCounty = {
  key: NASHVILLE_KEYS.county,
  slug: "davidson-county",
  name: "Davidson County",
  fipsCode: "47037",
};

const jurisdiction: SeedJurisdiction = {
  key: NASHVILLE_KEYS.jurisdiction,
  stateKey: NASHVILLE_KEYS.state,
  countyKey: NASHVILLE_KEYS.county,
  type: "city",
  slug: "nashville",
  name: "Nashville",
  officialName: "Metropolitan Government of Nashville and Davidson County",
  websiteUrl: "https://www.nashville.gov/",
  permitPortalUrl:
    "https://www.nashville.gov/departments/codes/construction-and-permits",
  timezone: "America/Chicago",
  isActive: true,
};

const departments: SeedDepartment[] = [
  {
    key: "nashville-metro-codes",
    jurisdictionKey: NASHVILLE_KEYS.jurisdiction,
    kind: "building",
    name: "Metro Nashville Department of Codes and Building Safety (Metro Codes)",
    phone: "(615) 862-6500",
    email: null,
    url: "https://www.nashville.gov/departments/codes",
    addressLine: "Metro Southeast, 800 2nd Avenue South, Nashville, TN 37210",
    hours: "Permit desk weekdays; inspections are scheduled through the e-permits system.",
    notes:
      "Metro Codes issues building, electrical, plumbing and gas/mechanical permits for the consolidated city-county government and publishes the fee schedule — one PDF carrying the Metro Code's own fee sections — on its publications list. Applications are filed in the e-permits system, whose training guides and permit-history lookup are linked from the same department pages. Metro Water Services handles water and sewer taps, which are not in the codes fee schedule.",
  },
];

const sources: SeedSource[] = [
  {
    key: NASHVILLE_FEE_SCHEDULE_SOURCE_KEY,
    jurisdictionKey: NASHVILLE_KEYS.jurisdiction,
    title: "Metro Nashville Codes Fee Schedule (Metro Code 16.28.110 – 16.20.250, with ICC valuation data)",
    url: "https://www.nashville.gov/sites/default/files/2025-12/Building-Permit-Fee-Scheudle-2025.pdf",
    sourceType: "fee_schedule_pdf",
    issuingAuthority: "Metropolitan Government of Nashville and Davidson County — Metro Codes",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: NASHVILLE_FEE_EFFECTIVE_FROM,
    retrievedAt: NASHVILLE_LAST_VERIFIED,
    lastVerifiedAt: NASHVILLE_LAST_VERIFIED,
    notes:
      'Read 2026-09-25 with pdftotext in -layout mode (the text is single-column and reads cleanly). The first four lines are the whole building mechanism: "The total permit cost for a building permit includes: Zoning Examination Fee of $25 / Building Valuation Fee: See below (Valuation Table is on last page) / Codes Tech Fee: 10% of the Building Valuation Fee / Building Plan Review Fee: See below". Then the Metro Code itself: 16.28.110 (building permits — residential $5.00 per $1,000; the commercial ladder; moving $252; signs; trailers; use and occupancy $55; re-inspection $50; plans examination with its $275,000 seam and its exemptions), 16.12.220 (plumbing — $75 minimum, $11 fixtures, the thirty-two-item fixture classification list), 16.16.400 (gas/mechanical — $75 minimum, appliance rows, $32 per 100,000 Btuh), 16.20.250 (electrical — outlets, motors, ranges, water heaters, heat by kilowatts, dryers, signs, services per meter, panels by amperage, the $75 minimum, service releases and emergency reconnection), and the ICC Building Valuation Data (February 2025) with its per-square-foot construction costs and worked permit-fee multiplier example. The sheet cites its own legislation: BL2022-1215 (fee schedule) and BL2022-1254 (codes tech fee).',
  },
  {
    key: NASHVILLE_PUBLICATIONS_SOURCE_KEY,
    jurisdictionKey: NASHVILLE_KEYS.jurisdiction,
    title: "Codes publications list — the page that links the fee schedule and the permit publications",
    url: "https://www.nashville.gov/departments/codes/construction-and-permits/publications-list",
    sourceType: "municipal_website",
    issuingAuthority: "Metropolitan Government of Nashville and Davidson County — Metro Codes",
    authorityKind: "city",
    isPrimary: false,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: NASHVILLE_LAST_VERIFIED,
    lastVerifiedAt: NASHVILLE_LAST_VERIFIED,
    notes:
      'Read 2026-09-25. The publications list is the department\'s index of instruments: the Permit Fee Schedule, the Building Valuation Table, the group definitions, the contractor licensing and e-permits guides, and the drawing requirements PDF. It is the page that makes the fee schedule the *primary* source rather than a stray file — the City links it as its own fee schedule, and the schedule prints the ordinances behind it.',
  },
  {
    key: NASHVILLE_FEE_ORDINANCE_SOURCE_KEY,
    jurisdictionKey: NASHVILLE_KEYS.jurisdiction,
    title: "BL2022-1215 — the ordinance adopting the current Codes fee schedule",
    url: "https://nashville.legistar.com/LegislationDetail.aspx?ID=5553814&GUID=B8892967-CC8C-439F-9D62-1C03A257D18A&Options=&Search=",
    sourceType: "ordinance",
    issuingAuthority: "Metropolitan Council of Nashville and Davidson County",
    authorityKind: "city",
    isPrimary: false,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: NASHVILLE_LAST_VERIFIED,
    lastVerifiedAt: NASHVILLE_LAST_VERIFIED,
    notes:
      'Cited on the fee schedule itself as "The Fee Schedule Legislation", with its Legistar link. The ordinance is the schedule\'s enactment: it is what makes the Metro Code sections in the PDF the operative fee text rather than a codifier\'s republication, and its passage date would replace the URL-derived effective date if a reader needs the fees\' exact start.',
  },
  {
    key: NASHVILLE_TECH_FEE_ORDINANCE_SOURCE_KEY,
    jurisdictionKey: NASHVILLE_KEYS.jurisdiction,
    title: "BL2022-1254 — the ordinance adopting the Codes Tech Fee",
    url: "https://nashville.legistar.com/LegislationDetail.aspx?ID=5647904&GUID=AA53FE0E-947A-463B-A9C9-E1A2CBDA9AAB&Options=&Search=",
    sourceType: "ordinance",
    issuingAuthority: "Metropolitan Council of Nashville and Davidson County",
    authorityKind: "city",
    isPrimary: false,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: NASHVILLE_LAST_VERIFIED,
    lastVerifiedAt: NASHVILLE_LAST_VERIFIED,
    notes:
      'Cited beside the fee legislation as "The Codes Tech Fee legislation". The technology fee is the only component of a Nashville building permit with its own ordinance: 10% of the building valuation fee, which is the base this site charges it on — 10% of the ladder\'s output, not of the whole permit bill.',
  },
];

/** Empty on purpose: the permit types Nashville uses already exist as shared rows. */
const permitTypes: JurisdictionSeed["permitTypes"] = [];
const projectTypes: JurisdictionSeed["projectTypes"] = [];

const jurisdictionPermitTypes: SeedJurisdictionPermitType[] = [
  {
    jurisdictionKey: NASHVILLE_KEYS.jurisdiction,
    permitTypeKey: "building",
    isAvailable: true,
    localName: "Building permit — four components: zoning examination, valuation fee, 10% tech fee, plan review",
    officialUrl:
      "https://www.nashville.gov/departments/codes/construction-and-permits/publications-list",
    notes:
      "Metro Code 16.28.110. One- and two-family dwellings and townhouses pay $5.00 per $1,000 of valuation and no plan review (subsection G.2 exempts them); everything else — including multifamily — runs a four-band commercial ladder whose printed bases sit above the previous band's arithmetic in three of four bands. The codes tech fee is 10% of the valuation fee alone, and the plan review is half the permit fee to $275,000, then $1,338.54 plus $0.18 a thousand to $5,000,000, then $2,181.82 plus $0.07 a thousand. The zoning examination fee of $25 is charged on every building permit.",
  },
  {
    jurisdictionKey: NASHVILLE_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    isAvailable: true,
    localName: "Electrical permit — Metro Code 16.20.250 price list, $75 minimum",
    officialUrl:
      "https://www.nashville.gov/departments/codes/construction-and-permits/electrical-permits",
    notes:
      "A price list rather than a valuation table: $6.00 for ten or fewer outlets and $1.00 each beyond, $12.00 per meter for a new, enlarged or relocated service, motors and generators by horsepower, ranges, water heaters, electric heat by kilowatts, dryers, signs at $20.00, distribution panels by amperage class, service releases at $75.00 residential and $102.00 commercial, emergency reconnection at $102.00, and a $75.00 minimum on every permit — with subsection B's penalty for unpermitted work: \"the permit fees shall be tripled\".",
  },
  {
    jurisdictionKey: NASHVILLE_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    isAvailable: true,
    localName: "Plumbing permit — Metro Code 16.12.220 price list, $75 minimum",
    officialUrl:
      "https://www.nashville.gov/departments/codes/construction-and-permits/plumbing-permits",
    notes:
      "Minimum $75.00 per permit, $11.00 a fixture with an outlet counted as a fixture whether or not it is set, $32.00 for each additional building drain, $80.00 each for a sewer connection, a water service connection and a septic tank and disposal field, $43.00 for a hot water heater, and a $50.00 reinspection fee. Subsection C lists the thirty-two classifications that count as one fixture, from area drains to water tanks.",
  },
];

const feeSchedules: SeedFeeSchedule[] = [
  {
    key: NASHVILLE_KEYS.feeSchedule,
    jurisdictionKey: NASHVILLE_KEYS.jurisdiction,
    sourceKey: NASHVILLE_FEE_SCHEDULE_SOURCE_KEY,
    title: "Metro Nashville Codes Fee Schedule (building, plumbing, gas/mechanical and electrical)",
    officialUrl:
      "https://www.nashville.gov/sites/default/files/2025-12/Building-Permit-Fee-Scheudle-2025.pdf",
    effectiveFrom: NASHVILLE_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: NASHVILLE_LAST_VERIFIED,
    notes:
      "One PDF carrying four Metro Code fee sections and the ICC valuation data behind the valuation, published from the City's own December 2025 folder and linked as the City's fee schedule from the Codes publications list. It prints no effective date of its own; the ordinances it cites (BL2022-1215 and BL2022-1254) are its enactment, and the file's own publication month is the date carried here.",
  },
];

function attach(permitTypeKey: string, rules: FeeRuleRecord[]): SeedFeeRule[] {
  return rules.map((rule) => ({
    jurisdictionKey: NASHVILLE_KEYS.jurisdiction,
    permitTypeKey,
    scheduleKey: NASHVILLE_KEYS.feeSchedule,
    rule,
  }));
}

const feeRules: SeedFeeRule[] = [
  ...attach("building", [...NASHVILLE_BUILDING_BASE_RULES, ...NASHVILLE_BUILDING_PLAN_REVIEW_RULES]),
  ...attach("electrical", NASHVILLE_ELECTRICAL_BASE_RULES),
  ...attach("plumbing", NASHVILLE_PLUMBING_BASE_RULES),
];

const requirements: SeedRequirement[] = [
  {
    jurisdictionKey: NASHVILLE_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "document",
    title: "The valuation is the contract amount, and the City may demand the contract",
    description:
      'Metro Code 16.28.110\'s valuation paragraph: "Valuation is defined as the cost of construction including structural, electrical, plumbing, mechanical, gas, interior finish, site preparation and development, architectural and design fees, overhead, and profit. The valuation is based on the contract amount. The City reserves the right to require a copy of the contract should the valuation be less than seventy-five percent (75%) of the national average for the type of construction appearing in the Building Valuation Data -- February 2024, or the most recent edition, published by the International Code Council." The last page of the fee schedule is that BVD table, with its per-square-foot costs by occupancy group and construction type and a worked permit-fee multiplier example.',
    isMandatory: true,
    sortOrder: 10,
    sourceKey: NASHVILLE_FEE_SCHEDULE_SOURCE_KEY,
    lastVerifiedAt: NASHVILLE_LAST_VERIFIED,
  },
  {
    jurisdictionKey: NASHVILLE_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "The plans examination fee is never refunded, even when no permit issues",
    description:
      'Metro Code 16.28.110 G.1: "Such plan-examination fee is in addition to the building permit fee and in no case shall this be refunded even if there is not a subsequent building permit issued. If an issued building permit is due a refund as per Section 16.28.140, in no case shall the plans examination fee be refunded." The plan review is charged for the examination of the plans, not for the permit, and it survives the permit\'s cancellation.',
    isMandatory: true,
    sortOrder: 20,
    sourceKey: NASHVILLE_FEE_SCHEDULE_SOURCE_KEY,
    lastVerifiedAt: NASHVILLE_LAST_VERIFIED,
  },
  {
    jurisdictionKey: NASHVILLE_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "other",
    title: "Unpermitted electrical work triples the fee",
    description:
      'Metro Code 16.20.250 B, in full: "In addition to any other penalty imposed for failure to obtain a permit where electrical work of any type, for which a permit is required, is commenced before a permit is issued, the permit fees shall be tripled." The tripled amount is the fee the schedule would have charged, multiplied — a penalty on the price rather than a separate price, and it is named on the page rather than modelled.',
    isMandatory: true,
    sortOrder: 10,
    sourceKey: NASHVILLE_FEE_SCHEDULE_SOURCE_KEY,
    lastVerifiedAt: NASHVILLE_LAST_VERIFIED,
  },
  {
    jurisdictionKey: NASHVILLE_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    requirementType: "document",
    title: "A fixture outlet counts as a fixture whether or not it is set",
    description:
      'Metro Code 16.12.220 B\'s footnote: "Each fixture outlet shall be counted as one fixture in figuring the total permit fee, whether or not the fixture is actually set at the time the plumbing system is installed." Subsection C lists what counts — thirty-two classifications, including area drains, backflow preventers, bath tubs, boiler blowoff tanks, commercial icemakers, dental units, dishwasher fixed units, drinking fountains, floor drains, grease traps, kitchen sinks, lavatories, roof drains, shower drains, slop sinks, "solar panels when connected to plumbing system", sump pumps, swimming pools, urinals, water closets and water tanks. The count is of outlets, not of installed fixtures.',
    isMandatory: true,
    sortOrder: 10,
    sourceKey: NASHVILLE_FEE_SCHEDULE_SOURCE_KEY,
    lastVerifiedAt: NASHVILLE_LAST_VERIFIED,
  },
  {
    jurisdictionKey: NASHVILLE_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "Multifamily is commercial construction on this schedule",
    description:
      'Subsection A.1 defines residential as covering "one-family and two-family residential construction and townhouses as defined by the 2018 Edition of the International Residential Code, but not multi-family construction", and A.2 sends everything else down the commercial ladder. A Nashville apartment building therefore pays the four-band ladder, the 10% tech fee and the plan review, while the townhouses beside it pay $5.00 per $1,000 and nothing else.',
    isMandatory: true,
    sortOrder: 30,
    sourceKey: NASHVILLE_FEE_SCHEDULE_SOURCE_KEY,
    lastVerifiedAt: NASHVILLE_LAST_VERIFIED,
  },
];

const profile: SeedProfile = {
  jurisdictionKey: NASHVILLE_KEYS.jurisdiction,
  headline: "What construction permits cost in Nashville",
  summary:
    "A Nashville building permit is **four fees added together**, and the schedule says so in its first four lines: a **$25 zoning examination fee**, the **building valuation fee** ($5.00 per $1,000 for one- and two-family dwellings and townhouses, a four-band ladder for everything else), a **codes tech fee of 10% of the valuation fee**, and a **plan review that is half the permit fee** to $275,000 and a printed ladder above it. Plumbing and electrical are price lists with a **$75 minimum** each — $11 a fixture, $80 a connection, $6.00 for ten or fewer outlets and $1.00 each beyond, $12.00 per meter, $75.00 or $102.00 a service release.",
  localContext:
    "Nashville's schedule is the first in this dataset whose building permit is assembled from four separately stated components, and it states them itself: \"The total permit cost for a building permit includes: Zoning Examination Fee of $25 / Building Valuation Fee: See below / Codes Tech Fee: 10% of the Building Valuation Fee / Building Plan Review Fee: See below\". Each component reads a different thing. The zoning fee is charged on every permit; the valuation fee reads the job; the tech fee reads the valuation fee and not the job; the plan review reads the permit fee. Which is why the calculator keeps the zoning fee out of the base subtotal entirely — the tech fee is 10% of the valuation fee, and a $25 that sat inside the base would be taxed by 10% of itself.\n\nThe commercial ladder is the dataset's recurring seam story three times over. Band 2's printed base is $372.71 where band 1's own rate lands at $372.55. Band 3's is $651.38 where band 2's lands at $651.21. Band 4's printed $2,326.84 is fifty-four cents *below* where band 3's arithmetic reaches $2,327.38. None of the three is derivable; all three are printed; all three are charged as printed, exactly as Minneapolis's two cents, Saint Paul's $23 and the plan review's own $7.22 are.\n\nAnd the plan review is the sharpest edge in the dataset: to $275,000 it is one-half of the building permit fee, which at that valuation is about $692.32 — and at $275,000.01 it is $1,338.54 plus $0.18 a thousand. That is a 93% step for one dollar of work, printed in the ordinance, and it is charged. Subsection G.2 is where the exemption lives: one- and two-family dwelling permits and townhouse permits pay no plans examination fee at all, so the residential rate of $5.00 per $1,000 is the whole building permit fee, while a multifamily building beside it pays the commercial ladder, the tech fee and the plan review.\n\nPlumbing and electrical are the other shape: price lists with a $75 floor. Plumbing counts fixtures — and counts a fixture *outlet* as a fixture \"whether or not the fixture is actually set\" — with separate rows for building drains, sewer and water service connections, septic systems and hot water heaters. Electrical prices outlets ($6.00 for ten, $1.00 each beyond), meters, service risers by occupancy ($75.00 residential, $102.00 commercial), signs and a $75.00 minimum, and it carries the dataset's only tripling rule in the text: unpermitted electrical work means \"the permit fees shall be tripled\".",
  valuationBasis:
    "The basis is **the total valuation of the work**, defined by the code as \"the cost of construction including structural, electrical, plumbing, mechanical, gas, interior finish, site preparation and development, architectural and design fees, overhead, and profit ... based on the contract amount\", with the City reserving the right to demand the contract when the stated valuation falls below 75% of ICC's national average for that construction type. The fee schedule reprints that ICC Building Valuation Data, so a reader who does not know their valuation can compute one.\n\nTwo rates read that valuation: **$5.00 per $1,000** for one- and two-family dwellings and townhouses, and the **commercial ladder** — $40.39 to $2,000; $40.39 plus $6.92 a thousand to $50,000; $372.71 plus $5.57 to $100,000; $651.38 plus $4.19 to $500,000; $2,326.84 plus $2.79 beyond — with every band's chargeable part rounded up to whole $1,000s because each row says \"or fraction thereof\". The three printed bases that do not match the band below's arithmetic are the schedule's own numbers and are charged as printed.\n\nThe other two components read the *fee*, not the job: the codes tech fee is 10% of the building valuation fee, and the plan review is one-half of the building permit fee below $275,000 and then a ladder of its own. Neither is a percentage of the valuation, which is why the four components cannot be collapsed into one rate. Plumbing and electrical read counts rather than cost, and neither touches the valuation at all.",
  notIncluded:
    "These are Nashville's building, electrical and plumbing permit fees. They are not a project cost, and they exclude:\n\n- **The gas/mechanical permit's rows** — Metro Code 16.16.400's own permit: a $75 minimum, $11 an appliance beyond the first residential and $16 commercial, $11 a gas meter connection, $21 a hot water heater, $50 for underground fuel lines, and $32 per 100,000 Btuh of connected heating, ventilating, air-conditioning and refrigeration capacity — transcribed in the research record, a trade this site's three pages do not price.\n- **The class-based electrical rows** — motors and generators by horsepower ($2/$8/$14/$20), electric ranges and water heaters by occupancy, electric heat and appliances by kilowatts, dryers, the catch-all row for \"any wiring, device, apparatus, appliance or equipment not specifically covered herein\" at $9.00, and the distribution/lighting/switch panel ladder by amperage class ($10 to $145, plus $3.00 per additional 100 amperes) — all priced per item **by the item's rating class**, a shape this dataset's per-unit facts do not yet price, and all transcribed in the research record.\n- **The moving, sign, trailer and use-and-occupancy rows** — $252.00 to move a building, the commercial schedule with a $55 minimum for signs, $55.00 per trailer or mobile home, $55.00 for a use-and-occupancy permit or certificate of compliance where no building permit was issued, $50.00 for a use verification letter and $40.00 for a beer and liquor distance letter.\n- **The re-inspection fees** — $50.00 on each trade, charged when an inspection is repeated rather than as part of a permit's price; the electrical one is carried as an inspection component, the plumbing one is named.\n- **The unpermitted-work penalty** — \"the permit fees shall be tripled\" for electrical work begun before a permit issued: a multiplier on the fee, not a fee.\n- **Metro Water Services taps and sewer availability** — the water and sewer utility's own charges, not rows in the codes fee schedule.",
  seoTitle: "Nashville construction permit fees",
  seoDescription:
    "How Nashville prices construction permits — a four-component building permit with a 10% tech fee and a plan review that halves then turns over at $275,000, plus plumbing and electrical price lists with a $75 minimum.",
  publishStatus: "published",
  noindex: false,
  lastReviewedAt: NASHVILLE_LAST_VERIFIED,
};

const permitPages: SeedPermitPage[] = [
  {
    jurisdictionKey: NASHVILLE_KEYS.jurisdiction,
    permitTypeKey: "building",
    slug: "building-permit-cost",
    title: "Nashville building permit cost",
    intro:
      "A Nashville building permit is **four fees added together**, and the schedule's own first lines name them: a **$25 zoning examination fee**, the **building valuation fee** — $5.00 per $1,000 for one- and two-family dwellings and townhouses, a four-band ladder for everything else — a **codes tech fee of 10% of the valuation fee**, and a **plan review that is one-half of the permit fee** up to $275,000 and a printed ladder above it. Multifamily construction takes the commercial ladder, because the schedule's residential definition explicitly excludes it.",
    localSummary:
      "The commercial ladder is four bands with three printed seams: $40.39 to $2,000; $40.39 plus $6.92 a thousand to $50,000; $372.71 plus $5.57 to $100,000; $651.38 plus $4.19 to $500,000; $2,326.84 plus $2.79 beyond. The printed bases are not the arithmetic below them — $372.71 against $372.55, $651.38 against $651.21, and $2,326.84 against $2,327.38 — and each is charged as printed. Every band rounds its chargeable part up to whole $1,000s, because every row says \"or fraction thereof\".\n\nThe plan review is the sharp edge. To $275,000 it is **one-half of the building permit fee** — about $692.32 at the seam — and at $275,000.01 it is **$1,338.54 plus $0.18 a thousand**, a 93% step for one dollar of valuation, then $2,181.82 plus $0.07 a thousand above $5,000,000, whose base is $7.22 below where the band beneath it lands. Subsection G.2 exempts one- and two-family dwelling permits and townhouse permits from plans examination entirely, so the residential rate of $5.00 per $1,000 is a dwelling's whole building permit fee.\n\nThe fourth component prices the third: the codes tech fee is 10% of the **building valuation fee**, not of the whole bill, which is why the $25 zoning examination fee is charged outside the base — a fee that is 10% of the valuation fee cannot be 10% of itself. And the plan review is never refunded: \"in no case shall this be refunded even if there is not a subsequent building permit issued\".",
    notIncluded:
      "This is the building permit fee the Metro Code charges. It excludes:\n\n- **The gas/mechanical permit** — Metro Code 16.16.400's own permit, with its $75 minimum, appliance rows and $32 per 100,000 Btuh of connected heating and cooling capacity.\n- **The moving, sign, trailer and use-and-occupancy rows** — $252.00 to move a building, signs on the commercial schedule with a $55 minimum, $55.00 per trailer, and $55.00 for a use-and-occupancy permit where no building permit issued.\n- **The re-inspection fee** — $50.00 when an inspection is repeated; not part of a permit's price.\n- **Metro Water Services taps and sewer availability** — the utility's own charges.\n- **The valuation itself as an estimate** — the schedule reprints ICC's Building Valuation Data so a reader can compute one, but the code defines the valuation as the contract amount, and this site does not derive it.",
    workedExample: {
      scenario:
        "A $150,000 commercial renovation — a valuation inside the fourth band, the ordinary mid-size commercial job.",
      inputs: { valuationCents: 15_000_000, custom: { building_class: "commercial" } },
      notes:
        "The valuation fee, band 4: \"$100,000.01 to $500,000.00 $651.38 for the first $100,000.00 plus $4.19 for each additional thousand or fraction thereof\". $50,000 above the first $100,000 is fifty steps: $651.38 + $209.50 = $860.88.\n\nThe plan review, at one-half of the permit fee: $430.44. The codes tech fee at 10% of the valuation fee: $86.09. The zoning examination fee: $25.00. Total: $1,402.41 — the four components the schedule's first lines name, each on its own base.\n\nTwo seams are worth seeing from here. At $100,000 the valuation fee is $651.21 by the band below's arithmetic and $651.38 as band 3 prints its base — seventeen cents the City chose. And at $275,000 of work the plan review is half of a $1,384.63 permit fee, $692.32; one dollar later it is $1,338.72, because subsection G.1's second row starts at $1,338.54. A dwelling valued at $150,000 pays none of that: $5.00 per $1,000 is $750.00 of valuation fee, no plan review, plus the $25.00 zoning fee and the $75.00 tech fee.",
    },
    faqs: [
      {
        question: "How much is a building permit in Nashville?",
        answer:
          "Four fees: a $25 zoning examination fee, the building valuation fee ($5.00 per $1,000 for one- and two-family dwellings and townhouses; $40.39 plus $6.92 a thousand to $50,000, $372.71 plus $5.57 to $100,000, $651.38 plus $4.19 to $500,000 and $2,326.84 plus $2.79 beyond for everything else), a codes tech fee of 10% of the valuation fee, and a plan review that is half the permit fee to $275,000 and $1,338.54 plus $0.18 a thousand above it. A $150,000 commercial renovation is $1,402.41 in all.",
        sourceId: NASHVILLE_FEE_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "When is the plan review charged, and how much is it?",
        answer:
          "To $275,000 of valuation it is \"one-half of the building permit fee as set forth in subsection A\" — about $692.32 at the seam — and from $275,000.01 it is $1,338.54 plus $0.18 per $1,000 of valuation to $5,000,000, then $2,181.82 plus $0.07 per $1,000 above that. One- and two-family dwelling permits, townhouse permits, demolition permits and blasting permits are exempt from plans examination altogether (subsection G.2), and the fee is never refunded even if no permit is issued.",
        sourceId: NASHVILLE_FEE_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "Does multifamily construction pay the residential rate?",
        answer:
          "No. Subsection A.1 defines residential construction as one-family and two-family dwellings and townhouses \"but not multi-family construction\", and A.2 sends all other construction down the commercial ladder. A Nashville apartment building pays the commercial bands, the 10% codes tech fee and the plan review; the townhouses beside it pay $5.00 per $1,000 and no plan review at all.",
        sourceId: NASHVILLE_FEE_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "What is the codes tech fee and what is it charged on?",
        answer:
          "\"Codes Tech Fee: 10% of the Building Valuation Fee\" — the schedule's own third line, and its own ordinance, BL2022-1254. Its base is the valuation fee alone, not the whole permit bill: on a $860.88 valuation fee it is $86.09, and the $25 zoning examination fee charged beside it is not inside that base. It is a technology component, not part of the permit fee.",
        sourceId: NASHVILLE_TECH_FEE_ORDINANCE_SOURCE_KEY,
      },
      {
        question: "Why do the ladder's band bases not match the band below them?",
        answer:
          "Because the schedule prints bases rather than deriving them. Band 2's own rate reaches $372.55 at $50,000 and band 3's printed base is $372.71; band 2's reaches $651.21 at $100,000 and band 3's base is $651.38; band 3's reaches $2,327.38 at $500,000 and band 4's base is $2,326.84, twenty-four cents lower. All three are the City's printed numbers and all three are charged as printed — the same rule Minneapolis's two-cent seam and Saint Paul's $23 step-down required.",
        sourceId: NASHVILLE_FEE_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "How is the valuation determined?",
        answer:
          "As the cost of construction — structural, electrical, plumbing, mechanical, gas, interior finish, site preparation, architectural and design fees, overhead and profit — based on the contract amount. The City reserves the right to require a copy of the contract if the stated valuation falls below 75% of ICC's national average for that construction type, and the fee schedule's last pages reprint that ICC Building Valuation Data with per-square-foot costs by occupancy and construction type.",
        sourceId: NASHVILLE_FEE_SCHEDULE_SOURCE_KEY,
      },
    ],
    seoTitle: "Nashville building permit cost: four components, four bases",
    seoDescription:
      "Nashville building permit fees — the $25 zoning examination fee, the $5-per-$1,000 residential rate and four-band commercial ladder, the 10% codes tech fee, and the plan review that halves then turns over at $275,000.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: NASHVILLE_LAST_VERIFIED,
  },
  {
    jurisdictionKey: NASHVILLE_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    slug: "electrical-permit-cost",
    title: "Nashville electrical permit cost",
    intro:
      "A Nashville electrical permit is a **price list with a $75.00 minimum**. Outlets are **$6.00 for the first ten and $1.00 each beyond**, a service — new, enlarged or relocated — is **$12.00 per meter**, a service release is **$75.00 residential and $102.00 commercial**, an emergency reconnection is **$102.00**, electric signs are **$20.00 each**, and anything the list does not name is **$9.00**. Unpermitted work is not priced at all: the schedule triples the fee.",
    localSummary:
      "The list is written subsections, not a table, and each subsection is a count at a fixed price: outlets (ten for $6.00, then $1.00 each), motors and generators by horsepower, ranges at $20.00 residential and $25.00 commercial, water heaters at $15.00 and $20.00, electric heat and appliances by kilowatts, dryers at $10.00 and $14.00, signs at $20.00, services at $12.00 a meter, distribution panels by amperage class from $10.00 to $145.00 plus $3.00 per additional 100 amperes, and a catch-all $9.00 row for \"any wiring, device, apparatus, appliance or equipment not specifically covered herein\".\n\nThe minimum is the floor the whole permit stands on: ten outlets compute $6.00 and pay $75.00, because subsection C.11 says so — and its parenthesis is long enough to be the permit's definition: \"Including permit for the installation of any electrical system or part thereof ... temporary services, etc.\" The service rows are priced by occupancy rather than by amperage: $75.00 for each service riser at a one- or two-family dwelling or a condominium, $102.00 commercial or industrial, and $102.00 to reconnect a service in an emergency.\n\nTwo things on this page are deliberately not charged. The class-based rows — motors by horsepower, heat by kilowatts, panels by amperage class — price each item by its own rating, a count-by-class shape this site's per-unit facts do not yet express, so they are named rather than approximated. And subsection B's penalty is a multiplier on the fee, not a fee: \"the permit fees shall be tripled\" wherever electrical work began before a permit issued.",
    notIncluded:
      "This is the electrical permit fee Metro Code 16.20.250 charges. It excludes:\n\n- **The class-based rows** — motors and generators by horsepower ($2.00 one horsepower or less, $8.00 two to ten, $14.00 over ten, $20.00 motor generator sets), electric ranges and water heaters by occupancy, electric heat and electrically heated appliances by kilowatts ($8.00 to $20.00), electric dryers ($10.00 residential, $14.00 commercial), and the distribution, lighting and switch panel ladder by amperage class ($10.00 at 200 amperes or less to $145.00 at 3,001–6,000, plus $3.00 per additional 100 amperes or fraction thereof) — each priced per item by the item's own rating class, and all transcribed in the research record.\n- **The catch-all wiring row** — \"the installation of any wiring, device, apparatus, appliance or equipment not specifically covered herein, such as but not limited to disconnects, 220 volt receptacles, each ... $9.00\": a real row, named rather than charged, because a permit's count of it is not a fact the page asks for.\n- **The tripling penalty** — \"the permit fees shall be tripled\" for work begun before a permit issued: a multiplier on whatever was owed.\n- **The re-inspection fee** — $50.00 each when an inspection is repeated, carried as an inspection component rather than as part of a permit's price.\n- **The licence and registration requirements** — contractor licensing and the e-permits system's registration are requirements of their own, priced separately from the permit.",
    workedExample: {
      scenario:
        "A service upgrade with four new lighting circuits and twelve outlets at a one-family dwelling — the ordinary residential electrical permit.",
      inputs: {
        custom: { outlets: 12, meters: 1, electrical_scope: "outlets" },
      },
      notes:
        "Subsection C.1: twelve outlets are ten for $6.00 plus two at $1.00 — $8.00. The service, \"new installation, increasing size, or relocation, per meter\", is $12.00. The permit computes $20.00 and pays the $75.00 minimum: subsection C.11's floor is charged as the shortfall, so the permit is $75.00 rather than $20.00.\n\nA service release is a different permit on the same table: $75.00 for each service riser at a one- or two-family dwelling or a condominium, $102.00 commercial or industrial, and $102.00 for an emergency reconnection — priced by occupancy class, one riser at a time. And a job that needs the panel ladder is where this page stops: panels are priced per panel by the panel's amperage class, which is a count-by-class shape the fee rules here do not yet express. Those rows are transcribed in the research record and named on the page rather than approximated.",
    },
    faqs: [
      {
        question: "How much is an electrical permit in Nashville?",
        answer:
          "It is a price list with a $75.00 minimum: $6.00 for ten or fewer outlets and $1.00 each beyond, $12.00 per meter for a new, enlarged or relocated service, $75.00 or $102.00 per service riser depending on occupancy, $20.00 per electric sign, $9.00 for wiring and devices the list does not otherwise cover, and higher rates by class for motors, ranges, water heaters, dryers and panels. Most small permits pay the $75.00 minimum.",
        sourceId: NASHVILLE_FEE_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "How are outlets counted?",
        answer:
          "\"Lighting circuits or any circuit where outlets are intended to be installed for low-voltage holding devices or lamp-holding devices and receptacles for the attachment of small, portable electrical devices and appliances; 130 volts or less: for the installation of 10 or fewer such outlets ... $6.00; for additional outlets over 10, each ... $1.00.\" Ten outlets are $6.00, eleven are $7.00, and the permit's $75.00 minimum governs until the count reaches seventy-nine.",
        sourceId: NASHVILLE_FEE_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "What is a service release?",
        answer:
          "A permit issued when an existing service is released or re-energised rather than installed, priced per service riser by occupancy: $75.00 for a one- or two-family dwelling or a condominium unit, $102.00 for commercial or industrial premises, and $102.00 to reconnect a service in an emergency. It is priced on the same service count as an installation but is its own permit, which is why the calculator asks for the permit's scope.",
        sourceId: NASHVILLE_FEE_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "What happens if electrical work is done without a permit?",
        answer:
          "Subsection B: \"In addition to any other penalty imposed for failure to obtain a permit where electrical work of any type, for which a permit is required, is commenced before a permit is issued, the permit fees shall be tripled.\" The penalty is a multiplier on the fee the schedule would have charged, and it is named on this page rather than computed into a price.",
        sourceId: NASHVILLE_FEE_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "Why are the panel and motor rows not in the calculator?",
        answer:
          "Because they price each item by the item's own rating — a motor by horsepower, a panel by amperage class, electric heat by kilowatts — and a permit can carry items of several classes at once. That is a count-by-class shape the fee rules here do not yet express, and approximating it with one class would misprice the ordinary commercial permit. The rows are transcribed in the research record and named on the page.",
        sourceId: NASHVILLE_FEE_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "Is there a minimum fee on an electrical permit?",
        answer:
          "\"Minimum fee (each permit) ... $75.00 (Including permit for the installation of any electrical system or part thereof, including but not limited to the installation of both new electrical systems and additions, alterations and repairs to existing electrical systems, the installation of electrical fixtures, equipment and devices and appurtenances thereto, temporary services, etc.)\" — a floor, not a base: it is charged only when the permit's own rows compute less.",
        sourceId: NASHVILLE_FEE_SCHEDULE_SOURCE_KEY,
      },
    ],
    seoTitle: "Nashville electrical permit cost: the $75 minimum and the price list",
    seoDescription:
      "Nashville electrical permit fees — $6.00 for ten outlets and $1.00 each beyond, $12.00 per meter, service releases at $75.00 and $102.00, signs at $20.00, and the $75.00 minimum, with the class-based rows named.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: NASHVILLE_LAST_VERIFIED,
  },
  {
    jurisdictionKey: NASHVILLE_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    slug: "plumbing-permit-cost",
    title: "Nashville plumbing permit cost",
    intro:
      "A Nashville plumbing permit is **a price list with a $75.00 minimum**: **$11.00 per fixture**, **$32.00 for each additional building drain**, **$80.00 each** for a sewer connection, a water service connection and a septic tank with its disposal field, and **$43.00 for a hot water heater**. A fixture counts as a fixture \"whether or not the fixture is actually set at the time the plumbing system is installed\" — and subsection C lists thirty-two classifications, from area drains to water tanks, that count as one fixture each.",
    localSummary:
      "The table is seven rows and a footnote. The minimum is the first row — \"Minimum fee (each permit) ... $75.00\" — and it is a floor rather than a base: a hot water heater replacement computes $43.00 and pays $75.00. Fixtures are $11.00 each, and the schedule is unusually explicit about the count: \"Each fixture outlet shall be counted as one fixture in figuring the total permit fee, whether or not the fixture is actually set at the time the plumbing system is installed.\" Subsection C then lists what counts — area drains, backflow preventers, baptisteries, bath tubs, boiler blowoff tanks, combination sink and tray, commercial icemakers, dental lavatories and units, diluting tanks and interceptors, dishwasher fixed units, commercial disposal units, drinking fountains, floor drains, grease traps and interceptors, kitchen sinks, lavatories, pools and fountains and aquaria, roof drains, shower drains, slop sinks, \"solar panels when connected to plumbing system\", sump pumps, swimming pools, urinals, washers both domestic and commercial, water closets and water tanks.\n\nThree rows price infrastructure rather than fixtures, and each is its own count: **$32.00 for each additional building drain**, **$80.00 per sewer connection**, **$80.00 per water service connection**, and **$80.00 for a septic tank and disposal field** — one price for the tank and the field together. A hot water heater is its own row at $43.00, and the gas/mechanical table prices the same appliance at $21.00 under a different permit; they are not the same charge. The last row is a penalty rather than a price: $50.00 each time an inspection is repeated.",
    notIncluded:
      "This is the plumbing permit fee Metro Code 16.12.220 charges. It excludes:\n\n- **The gas/mechanical permit** — Metro Code 16.16.400's own permit, with a $75 minimum, gas and mechanical appliances at $11.00 residential and $16.00 commercial beyond the first, a $11.00 gas meter connection, $21.00 for a hot water heater on that permit, $50.00 for underground fuel lines, and $32.00 per 100,000 Btuh of connected heating and cooling capacity.\n- **The re-inspection fee** — $50.00 each when an inspection is repeated: a penalty on the permit rather than part of its price.\n- **Metro Water Services charges** — the water utility's tap, meter and availability fees are its own, charged beside the plumbing permit.\n- **The permit classifications list as a fee** — subsection C's thirty-two classifications decide what counts as one fixture; they are a counting rule, not a price list.\n- **The fixture count as an estimate** — the count is of fixture outlets on the application, and the calculator reads the number the applicant supplies.",
    workedExample: {
      scenario:
        "A bathroom remodel's plumbing at a one-family dwelling — a water closet, a lavatory, a bath tub and a hot water heater, on one permit.",
      inputs: { fixtures: 3, custom: { heaters: 1, building_drains: 0 } },
      notes:
        "Three fixtures at $11.00 are $33.00 — water closet, lavatory and bath tub, each of which subsection C names as one fixture whether or not it is set. The hot water heater is its own row at $43.00, so the permit computes $76.00 and clears the $75.00 minimum on its own.\n\nAdd a sewer connection and a water service connection and the permit grows the way the table does: $80.00 + $80.00 + $32.00 for a second building drain, each on its own count, with the minimum still doing nothing because the rows already exceed it.\n\nA hot water heater alone is the case the minimum exists for: $43.00 computes, $32.00 of shortfall is charged, and the permit is $75.00. And the gas line to that heater is a different permit at a different price — $21.00 on the gas/mechanical table, not $43.00 here.",
    },
    faqs: [
      {
        question: "How much is a plumbing permit in Nashville?",
        answer:
          "$75.00 minimum per permit, plus $11.00 for each fixture, $32.00 for each additional building drain, $80.00 each for a sewer connection, a water service connection and a septic tank with disposal field, and $43.00 for a hot water heater. A three-fixture bathroom with a water heater computes $76.00; a water heater alone pays the $75.00 minimum.",
        sourceId: NASHVILLE_FEE_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "What counts as a fixture?",
        answer:
          "Subsection C lists thirty-two classifications that each count as one fixture — area drains, backflow preventers, bath tubs, boiler blowoff tanks, commercial icemakers, dental units, dishwasher fixed units, drinking fountains, floor drains, grease traps, kitchen sinks, lavatories, roof drains, shower drains, slop sinks, solar panels connected to the plumbing system, sump pumps, swimming pools, urinals, water closets, water tanks and more — and the footnote says the count is of outlets: \"whether or not the fixture is actually set at the time the plumbing system is installed\".",
        sourceId: NASHVILLE_FEE_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "Is the water heater charged on the plumbing permit?",
        answer:
          "Yes, at $43.00 as its own row on this table. The gas/mechanical table prices a water heater at $21.00 as part of a different permit, and both are real: the plumbing permit prices the water and drain connections, the gas permit prices the gas connection. A replacement that only swaps the appliance and reconnects both may need both permits.",
        sourceId: NASHVILLE_FEE_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "What is an additional building drain, and how is it different from a sewer connection?",
        answer:
          "The table prints them as separate rows: \"Each additional building drain ... $32.00\" and \"Sewer connection ... $80.00\". The building drain is the horizontal run that carries the building's waste to the sewer; the sewer connection is the tie to the public main. A permit can carry both, and each is counted on its own row.",
        sourceId: NASHVILLE_FEE_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "Is there a minimum fee on a plumbing permit?",
        answer:
          "\"Minimum fee (each permit) ... $75.00\" — the table's first row. It is a floor, not a base: it is charged only when the permit's rows compute less than $75.00, which is what happens on a single water heater ($43.00) or a small fixture count.",
        sourceId: NASHVILLE_FEE_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "Does the plumbing permit include the gas piping?",
        answer:
          "No. Gas and mechanical work has its own permit under Metro Code 16.16.400, with its own $75.00 minimum, its own appliance rows and a rate of $32.00 per 100,000 Btuh of connected equipment. The plumbing permit prices the plumbing rows only, and the gas permit is filed beside it.",
        sourceId: NASHVILLE_FEE_SCHEDULE_SOURCE_KEY,
      },
    ],
    seoTitle: "Nashville plumbing permit cost: $11 fixtures and a $75 minimum",
    seoDescription:
      "Nashville plumbing permit fees — $11.00 per fixture with outlets counted as fixtures, $32.00 for each additional building drain, $80.00 connections and septic systems, $43.00 water heaters, and the $75.00 minimum.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: NASHVILLE_LAST_VERIFIED,
  },
];

const verifications: SeedVerification[] = [
  {
    entityType: "source",
    entityKey: NASHVILLE_FEE_SCHEDULE_SOURCE_KEY,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: NASHVILLE_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NASHVILLE_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "Read 2026-09-25: the whole PDF extracted with pdftotext -layout (393 lines) — the four building components, the residential rate, all four commercial bands with their printed bases, the plans examination table with its $275,000 seam and its exemptions, the plumbing table with its thirty-two-item fixture list, the gas/mechanical table, the electrical subsections C.1 through C.14, and the ICC valuation data with its worked example.",
  },
  {
    entityType: "source",
    entityKey: NASHVILLE_PUBLICATIONS_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: NASHVILLE_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NASHVILLE_PUBLICATIONS_SOURCE_KEY,
    notes:
      "Read 2026-09-25: the department's publications index, linking the Permit Fee Schedule, the Building Valuation Table and the drawings-requirements PDF — the page that makes the schedule the City's own published fee instrument.",
  },
  {
    entityType: "source",
    entityKey: NASHVILLE_FEE_ORDINANCE_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: NASHVILLE_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NASHVILLE_FEE_ORDINANCE_SOURCE_KEY,
    notes:
      "Located 2026-09-25 from the schedule's own citation (\"The Fee Schedule Legislation can be found at: BL2022-1215\") with its Legistar link. It is the enactment behind the fee text the PDF prints; its passage date would replace the URL-derived effective date.",
  },
  {
    entityType: "source",
    entityKey: NASHVILLE_TECH_FEE_ORDINANCE_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: NASHVILLE_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NASHVILLE_TECH_FEE_ORDINANCE_SOURCE_KEY,
    notes:
      "Located 2026-09-25 from the schedule's own citation (\"The Codes Tech Fee legislation can be found at: BL2022-1254\"), which is what makes the 10% a fee with its own ordinance rather than a row on a table.",
  },
  {
    entityType: "fee_schedule",
    entityKey: NASHVILLE_KEYS.feeSchedule,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: NASHVILLE_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NASHVILLE_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "One PDF, four Metro Code fee sections and the ICC valuation data. It prints no effective date; the date carried is its own publication month in the City's file path, and the ordinances it cites are its enactment.",
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-COMM-4",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: NASHVILLE_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NASHVILLE_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "The commercial ladder's $100,000.01–$500,000 band, whose printed base of $651.38 is seventeen cents above what the band below computes at $100,000 — asserted at $100,000 and $150,000 in the content test, with the seam charged as printed.",
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-PLAN-REVIEW-HALF",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: NASHVILLE_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NASHVILLE_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "\"$0.00 to $275,000.00 one-half of the building permit fee\" — half of the ladder's output, gated off for one- and two-family and townhouse permits by subsection G.2, and asserted against the $275,000.01 turnover in the content test.",
  },
  {
    entityType: "fee_rule",
    entityKey: "CODES-TECH-FEE",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: NASHVILLE_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NASHVILLE_TECH_FEE_ORDINANCE_SOURCE_KEY,
    notes:
      "\"Codes Tech Fee: 10% of the Building Valuation Fee\" — charged on the base subtotal, which is the valuation fee alone; the zoning examination fee is an `other` component precisely so it is not inside this percentage's base. Asserted in the content test.",
  },
  {
    entityType: "fee_rule",
    entityKey: "ELEC-OUTLETS",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: NASHVILLE_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NASHVILLE_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "Subsection C.1's two rows as one base-plus-allowance rate: ten outlets for $6.00 and $1.00 for each outlet over ten. Asserted at ten, eleven and twelve outlets in the content test.",
  },
  {
    entityType: "fee_rule",
    entityKey: "PLUMB-FIXTURE",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: NASHVILLE_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NASHVILLE_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "The $11.00 fixture row with its outlet-counting footnote, and the thirty-two-item classification list in subsection C that decides what one fixture is — asserted with the $75.00 minimum's shortfall in the content test.",
  },
  {
    entityType: "permit_page",
    entityKey: "building-permit-cost",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: NASHVILLE_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NASHVILLE_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "The four components named and priced in the intro, the three ladder seams printed rather than smoothed, the plan review's $275,000 turnover worked in the example, the residential exemption stated, and the valuation's contract-amount definition quoted.",
  },
  {
    entityType: "permit_page",
    entityKey: "electrical-permit-cost",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: NASHVILLE_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NASHVILLE_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "The price list's rows stated with their counts, the $75.00 minimum worked as a shortfall, the class-based rows named as not modelled with the reason, and subsection B's tripling named.",
  },
  {
    entityType: "permit_page",
    entityKey: "plumbing-permit-cost",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: NASHVILLE_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NASHVILLE_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "The seven rows priced, the outlet-counting footnote and the thirty-two-item fixture list quoted, the water heater's $43.00 against the gas permit's $21.00 distinguished, and the minimum worked against a single-appliance permit.",
  },
  {
    entityType: "jurisdiction_profile",
    entityKey: NASHVILLE_KEYS.jurisdiction,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: NASHVILLE_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NASHVILLE_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "Profile built from the Codes Fee Schedule PDF and the two ordinances it cites. States the readings the model depends on — the four components and their separate bases, the three printed ladder seams, the plan review's turnover and exemptions, the residential definition that excludes multifamily, and the outlet/fixture counting rules — and names every row it does not charge.",
  },
];

export const nashvilleSeed: JurisdictionSeed = {
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
export const NASHVILLE_PUBLISHED_PERMIT_PAGES = nashvilleSeed.permitPages.filter(
  (page) => page.publishStatus === "published" && !page.noindex,
);
