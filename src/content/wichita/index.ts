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
  ICT_BUILDING_RULES,
  ICT_ELECTRICAL_RULES,
  ICT_FEE_EFFECTIVE_FROM,
  ICT_PLUMBING_RULES,
  ICT_SOURCE_KEY,
  ICT_UBTC_SOURCE_KEY,
} from "./fee-rules";

export * from "./fee-rules";

/**
 * The complete Wichita, Kansas seed payload.
 *
 * Every figure traces to research/kansas/wichita.md, which traces to the MABCD
 * fee tables (Table B building, Table I electrical, Table H plumbing — each a
 * one-page form revised May 2019, still operative on the MABCD Fees page) and
 * to the Wichita-Sedgwick County Unified Building and Trade Code's plan-review
 * section (60% of the building permit fee), as amended by Ordinance No. 52-564.
 *
 * Wichita has no building department of its own: MABCD, the joint City/County
 * Metropolitan Area Building and Construction Department, issues every permit.
 *
 * Three pages, all published: building, electrical, plumbing.
 */

const RESEARCHER = "Permit Fee Intelligence — Kansas pass (Wichita)";

export const WICHITA_LAST_VERIFIED = "2026-09-26";

export const WICHITA_KEYS = {
  state: "ks",
  county: "sedgwick-county",
  jurisdiction: "wichita",
  schedule: "mabcd-fee-tables",
} as const;

const state: SeedState = {
  code: "KS",
  slug: "kansas",
  name: "Kansas",
  fipsCode: "20",
};

const county: SeedCounty = {
  key: WICHITA_KEYS.county,
  slug: "sedgwick-county",
  name: "Sedgwick County",
  fipsCode: "20173",
};

const jurisdiction: SeedJurisdiction = {
  key: WICHITA_KEYS.jurisdiction,
  stateKey: WICHITA_KEYS.state,
  countyKey: WICHITA_KEYS.county,
  type: "city",
  slug: "wichita",
  name: "Wichita",
  officialName: "City of Wichita — MABCD (Metropolitan Area Building and Construction Department)",
  websiteUrl: "https://www.sedgwickcounty.org/mabcd/",
  permitPortalUrl: "https://mabcdportal.sedgwickcounty.org/",
  timezone: "America/Chicago",
  isActive: true,
};

const departments: SeedDepartment[] = [
  {
    key: "wichita-mabcd",
    jurisdictionKey: WICHITA_KEYS.jurisdiction,
    kind: "building",
    name: "Metropolitan Area Building and Construction Department (MABCD)",
    phone: "(316) 660-9050",
    email: "mabcd@sedgwickcounty.org",
    url: "https://www.sedgwickcounty.org/mabcd/",
    addressLine: "271 W 3rd Street N, Suite 208, Wichita, KS 67202",
    hours: "Monday – Friday, 8:00 a.m. – 5:00 p.m. CT",
    notes:
      "MABCD is the joint City of Wichita / Sedgwick County building department operating under the Wichita-Sedgwick County Unified Building and Trade Code. It is self-supported by permit fees, and its Director holds a published authority to cut Table B fees temporarily by up to 20% (never exercised into a published schedule this site models).",
  },
];

const sources: SeedSource[] = [
  {
    key: ICT_SOURCE_KEY,
    jurisdictionKey: WICHITA_KEYS.jurisdiction,
    title: "MABCD Fee Tables — Table B (Building, Rev. 5/8/2019), Table I (Electrical, Rev. 5/9/2019), Table H (Plumbing, Rev. 5/9/2019)",
    url: "https://www.sedgwickcounty.org/mabcd/fees/",
    sourceType: "fee_schedule_pdf",
    issuingAuthority: "Metropolitan Area Building and Construction Department (City of Wichita / Sedgwick County)",
    authorityKind: "county",
    isPrimary: true,
    documentDate: "2019-05-09",
    effectiveFrom: ICT_FEE_EFFECTIVE_FROM,
    retrievedAt: WICHITA_LAST_VERIFIED,
    lastVerifiedAt: WICHITA_LAST_VERIFIED,
    notes:
      "Read 2026-09-26. Three one-page PDFs linked from the MABCD Fees page: fee-table-b.pdf (Table B: residential new build at 38¢/30¢ per sq ft finished/unfinished, accessory rates, and the eight-band §2 commercial ladder that also prices remodels of both classes by §3; the bands chain exactly at every seam — $40+10×$3=$70, $70+38×$11=$488, $488+60×$9=$1,028, $1,028+400×$7=$3,828, $3,828+500×$5=$6,328, $6,328+4,000×$3=$18,328); fee-table-i.pdf (Table I electrical item list with the $25.00 permit issuance fee and the one/two-family bundling note); fee-table-h.pdf (Table H plumbing item list, same shape). Table K (mechanical), Tables A/C/F/G/J (licensing, inspections, sprinkler, miscellaneous, elevator) are on the same page and recorded in the research file, not modelled.",
  },
  {
    key: ICT_UBTC_SOURCE_KEY,
    jurisdictionKey: WICHITA_KEYS.jurisdiction,
    title: "Wichita-Sedgwick County Unified Building and Trade Code, §109.5.1 (plan review fees) — Ordinance No. 52-564 amendment text",
    url: "https://www.wichita.gov/Archive/ViewFile/Item/11044",
    sourceType: "ordinance",
    issuingAuthority: "City of Wichita",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2024-10-25",
    effectiveFrom: ICT_FEE_EFFECTIVE_FROM,
    retrievedAt: WICHITA_LAST_VERIFIED,
    lastVerifiedAt: WICHITA_LAST_VERIFIED,
    notes:
      "Read 2026-09-26. The UBTC amendment text carries §109.5.1 verbatim: 'said plan review fee shall be 60 percent of the building permit fee as shown in Tables B and C … in addition to the building permit fees', with additional plan review for changed plans at Table D's hourly rate. Also carries the refund section (80% cap, 180 days) and the 180-day expiration with reinstatement at half the new-permit fee.",
  },
];

/** Empty on purpose: the permit types MABCD uses already exist as shared rows. */
const permitTypes: JurisdictionSeed["permitTypes"] = [];
const projectTypes: JurisdictionSeed["projectTypes"] = [];

const jurisdictionPermitTypes: SeedJurisdictionPermitType[] = [
  {
    jurisdictionKey: WICHITA_KEYS.jurisdiction,
    permitTypeKey: "building",
    isAvailable: true,
    localName: "Building permit — Table B area rates for new dwellings, eight-band valuation ladder otherwise",
    officialUrl: "https://www.sedgwickcounty.org/media/55339/fee-table-b.pdf",
    notes:
      "Residential new build pays 38¢ per finished square foot plus 30¢ per unfinished square foot (basements, attached garages, covered porches, decks). Accessory structures on residential property pay 25¢/20¢, dropping to 10¢ beyond 5,000 unfinished sq ft — recorded, not modelled. Everything else — commercial new build, and by §3 every remodel or rebuild of either class — prices on the §2 valuation ladder from $40 to $18,328 base, with the excess rounding up to the band's own increment. Plan review adds 60% of the permit fee (UBTC §109.5.1).",
  },
  {
    jurisdictionKey: WICHITA_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    isAvailable: true,
    localName: "Electrical permit — Table I item price list plus $25.00 issuance fee",
    officialUrl: "https://www.sedgwickcounty.org/media/55335/fee-table-i.pdf",
    notes:
      "Each Table I row is a count × price: circuits $2.00, outlets added to existing circuits $0.75, light fixtures $0.75, service meters $11.00, generators $29.00, PV $29.00, feeders $9.00, special power circuits $9.00, heating appliances $3–$8, signs $7 per circuit, smoke detectors $0.75, motors $5/$7, services over 480 V $71, construction services $14/$28, transformer $11, miscellaneous $14 — on top of the $25.00 permit issuance fee. One- and two-family dwelling work inside a building permit is covered by the building permit and needs no separate electrical permit.",
  },
  {
    jurisdictionKey: WICHITA_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    isAvailable: true,
    localName: "Plumbing permit — Table H item price list plus $25.00 issuance fee",
    officialUrl: "https://www.sedgwickcounty.org/media/55343/fee-table-h.pdf",
    notes:
      "Each Table H row is a count × price: waste openings $4.50, water services $5.00, water heaters $9.00, backflow devices $5.00, medical gas openings $5.00, gas loops/openings $9.00, reconnect moved building $11, interior rainwater drains $4.00, mobile home water services $5.00, lawn sprinklers $10.00, water conditioning $4.50, standpipes $36.00 per riser, miscellaneous $9.00 — on top of the $25.00 permit issuance fee. The same one/two-family bundling note as electrical applies.",
  },
];

const feeSchedules: SeedFeeSchedule[] = [
  {
    key: WICHITA_KEYS.schedule,
    jurisdictionKey: WICHITA_KEYS.jurisdiction,
    sourceKey: ICT_SOURCE_KEY,
    title: "MABCD Fee Tables B / I / H (2019 revisions, operative)",
    officialUrl: "https://www.sedgwickcounty.org/media/55339/fee-table-b.pdf",
    effectiveFrom: ICT_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: WICHITA_LAST_VERIFIED,
    notes:
      "The 2019-revised tables are the operative schedule the MABCD Fees page links today; the plan-review percentage lives in the UBTC code text rather than in any table. The Director's temporary 20% reduction authority (Table B ¶4, per City Resolution R-95-560) has not produced a published alternate schedule.",
  },
];

function attach(
  permitTypeKey: string,
  rules: SeedFeeRule["rule"][],
  scheduleKey: string,
): SeedFeeRule[] {
  return rules.map((rule) => ({
    jurisdictionKey: WICHITA_KEYS.jurisdiction,
    permitTypeKey,
    scheduleKey,
    rule,
  }));
}

const feeRules: SeedFeeRule[] = [
  ...attach("building", ICT_BUILDING_RULES, WICHITA_KEYS.schedule),
  ...attach("electrical", ICT_ELECTRICAL_RULES, WICHITA_KEYS.schedule),
  ...attach("plumbing", ICT_PLUMBING_RULES, WICHITA_KEYS.schedule),
];

const requirements: SeedRequirement[] = [
  {
    jurisdictionKey: WICHITA_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "document",
    title: "Residential new build is measured in two areas",
    description:
      "Table B §1 prices finished space at 38¢/sq ft and unfinished space at 30¢/sq ft. The MABCD Permits page names the unfinished space: unfinished basements, attached garages, covered porches and decks. The two areas are entered separately — the rules read the project area and the covered-area fact — so a 2,000 sq ft house with an 800 sq ft unfinished basement prices both rows.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: ICT_SOURCE_KEY,
    lastVerifiedAt: WICHITA_LAST_VERIFIED,
  },
  {
    jurisdictionKey: WICHITA_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "Remodels and rebuilds price on the commercial ladder at any occupancy",
    description:
      "Table B §3: 'For all remodels or rebuilds for both residential and commercial, the building permit shall be based upon the amounts specified in paragraph 2 above.' The ladder is therefore not gated to commercial occupancy — a $30,000 residential kitchen remodel prices in the same $2,000.01–$40,000 band as a commercial build-out.",
    isMandatory: true,
    sortOrder: 20,
    sourceKey: ICT_SOURCE_KEY,
    lastVerifiedAt: WICHITA_LAST_VERIFIED,
  },
  {
    jurisdictionKey: WICHITA_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "other",
    title: "One- and two-family dwelling work rides the building permit",
    description:
      "Table I's own provision: electrical work in conjunction with a building permit for one- or two-family dwelling new construction, repair, remodel or addition 'is covered and permitted under the authority granted by the building permit and does not require a separate electrical permit.' Exceptions the table names: water-well motors, and work begun more than 180 days after the building permit issued.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: ICT_SOURCE_KEY,
    lastVerifiedAt: WICHITA_LAST_VERIFIED,
  },
  {
    jurisdictionKey: WICHITA_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    requirementType: "other",
    title: "The same bundling note covers dwelling plumbing",
    description:
      "Table H carries the same provision as Table I: plumbing work inside a one- or two-family dwelling building permit needs no separate plumbing permit. Permits expire if work is not commenced within 180 days, and refunds are capped at 80% within 180 days by the code's refund section.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: ICT_SOURCE_KEY,
    lastVerifiedAt: WICHITA_LAST_VERIFIED,
  },
];

const profile: SeedProfile = {
  jurisdictionKey: WICHITA_KEYS.jurisdiction,
  headline: "What construction permits cost in Wichita",
  summary:
    "Wichita permits are issued by **MABCD**, the joint city/county building department, out of three fee tables carried into code by the **Wichita-Sedgwick County Unified Building and Trade Code**. New houses pay **per square foot — $0.38 finished, $0.30 unfinished**; everything else climbs an **eight-band valuation ladder from $40 to $18,328 base** with every excess rounded up to the band's own increment ('or fraction thereof'). Plan review adds **60% of the building permit fee**. Both trades are item price lists — each row a count times a price — plus a **$25.00 permit issuance fee** per trade permit.",
  localContext:
    "MABCD — the Metropolitan Area Building and Construction Department — is one of the oldest joint building departments in the country: the City of Wichita and Sedgwick County run it together under the Unified Building and Trade Code, and smaller contracted cities ride it too. It is self-supported by its fees, and its Table B carries the history in writing: the ladder's amounts reflect the agreement between the City and the Wichita Area Builders Association, and the Director can cut fees temporarily by up to 20% without returning to either governing body.\n\nThe residential new-build rate is the simplest big-city schedule in this dataset: two numbers per square foot, finished and unfinished, nothing else. The Permits page names what 'unfinished' means locally — unfinished basements, attached garages, covered porches and decks — so a 2,000 sq ft two-story with an 800 sq ft basement pays 2,000 × $0.38 plus 800 × $0.30.\n\nEverything else — commercial new build and, by the table's own §3, every remodel or rebuild of either class — walks the §2 ladder: $40 to $1,000, then bands whose bases chain exactly ($70, $488, $1,028, $3,828, $6,328, $18,328) with 'or fraction thereof' round-ups on each band's own increment. Plan review is a code section, not a table row: UBTC §109.5.1 adds 60% of the building permit fee, and MABCD sequences commercial work through a plan-review application first.\n\nThe trades price like parts lists. Table I (electrical) and Table H (plumbing) are grids of items — circuits $2.00, outlets $0.75, fixtures $0.75, meters $11.00; waste openings $4.50, water heaters $9.00, backflow devices $5.00 — and each permit adds its $25.00 issuance fee. Both tables carry the same bundling note: a one- or two-family dwelling's trade work is inside the building permit.",
  valuationBasis:
    "Three bases across MABCD's tables. **Residential new build reads area** — finished square footage at 38¢ and unfinished at 30¢, two separate measurements. **The §2 ladder reads total valuation** — for remodels and rebuilds of both classes by its own §3 — in bands whose excess rounds up to the band's own increment ($100 steps at the bottom, $1,000 steps above). **The trade tables read counts** — each row is the number of items of one kind times its price, plus the $25.00 issuance fee.",
  notIncluded:
    "These figures are MABCD's own permit amounts. They are not a project cost, and they exclude:\n\n- **Mechanical permits** (Table K) — the same item-list shape, recorded in the research file without its own page.\n- **Unmodelled trade rows** — electrical heating appliances, signs, smoke detectors, motors, services over 480 V, construction services, transformers, generators and PV (each $5–$71); plumbing gas loops and openings, reconnects, rainwater drains, mobile-home services, lawn sprinklers, conditioning, standpipes and miscellaneous. Every price is in the research file; the modelled set is the rows that map one-to-one onto engine inputs.\n- **Accessory-structure rates** (25¢/20¢/10¢) and **roofing** ($0.05/sq ft, $50–$1,500) — recorded, not modelled.\n- **Event and administrative fees** — reinspection ($11 meter reset; $50/$140 schedule rows), after-hours inspections, the $25 Block/ICC application fee, floodplain $50, wastewater $100/$200, contractor licensing (Table A).\n- **The Director's temporary 20% fee-reduction authority** — a standing legal power, not a published schedule.",
  seoTitle: "Wichita permit fees — MABCD Table B, I and H",
  seoDescription:
    "How Wichita prices construction permits under MABCD: $0.38/$0.30 per sq ft for new houses, the eight-band Table B valuation ladder, 60% plan review, and $25-plus-item electrical and plumbing price lists.",
  publishStatus: "published",
  noindex: false,
  lastReviewedAt: WICHITA_LAST_VERIFIED,
};

const permitPages: SeedPermitPage[] = [
  {
    jurisdictionKey: WICHITA_KEYS.jurisdiction,
    permitTypeKey: "building",
    slug: "building-permit-cost",
    title: "Wichita building permit cost",
    intro:
      "A Wichita building permit splits on **one question: is it a new house?** New dwellings pay **per square foot — $0.38 for finished space, $0.30 for unfinished** (basements, attached garages, covered porches, decks). Everything else — commercial new build and, by Table B §3, **every remodel or rebuild of either class** — climbs the **eight-band valuation ladder**, from $40.00 at $1,000 of valuation to an $18,328.00 base above $5,000,000, with every band's excess rounded up ('or fraction thereof'). Plan review adds **60% of the permit fee** under the Unified Building and Trade Code.",
    localSummary:
      "The per-square-foot rows are the whole residential-new-build regime: there is no valuation question for a new house, and the two areas are measured separately, so an unfinished basement is its own line at its own rate.\n\nThe ladder is where Wichita's seam discipline shows. Each band's printed base equals the band below run to its ceiling — $40 + 10 × $3.00 is $70.00; $70 + 38 × $11.00 is $488.00 — and each band's 'or fraction thereof' rounds the excess up to that band's own increment: $100 steps in the two smallest bands, $1,000 steps everywhere above. A $650,000 build-out lands in band 5: $1,028.00 plus 550 whole $1,000 steps at $7.00 — $3,850.00 — totaling $4,878.00.\n\nPlan review is a code section rather than a table row: §109.5.1 of the Unified Building and Trade Code charges 60 percent of the building permit fee 'in addition to the building permit fees', and MABCD's commercial path starts with a plan-review application for exactly that reason.",
    notIncluded:
      "This is Table B's building permit fee. It excludes:\n\n- **Accessory structures** on residential property (25¢/20¢ per sq ft, 10¢ beyond 5,000 unfinished sq ft) — recorded, not modelled.\n- **Roofing and siding** ($0.05/sq ft, $50 minimum, $1,500 maximum) — its own scope row.\n- **Trade permits** — electrical and plumbing price their own item lists on their own pages; one- and two-family dwelling trade work rides the building permit.\n- **Event fees** — reinspection, after-hours inspections, floodplain ($50), the Director's temporary reduction authority.",
    workedExample: {
      scenario:
        "A commercial build-out with a declared valuation of $650,000, submitted through MABCD's plan-review path.",
      inputs: {
        valuationCents: 65_000_000,
        occupancy: "commercial",
        custom: {
          plan_review: true,
        },
      },
      notes:
        "Two lines — **$7,324.80**.\n\nTable B §2, band 6: $650,000 sits in the '$500,000.01 to $1,000,000.00' band, base $3,828.00. The excess is $150,000 — 150 whole $1,000 steps at $5.00 = $750.00. Band total: $3,828.00 + $750.00 = $4,578.00.\n\nPlan review: 60% of the computed permit fee under UBTC §109.5.1 — 0.60 × $4,578.00 = $2,746.80.\n\nTotal: $4,578.00 + $2,746.80 = **$7,324.80**. The band seam matters: at $500,000 exactly the fee is $3,828.00 flat (band 5's predecessor ends there); one dollar more starts band 6's $750.00 of steps — the 'or fraction thereof' round-up means $500,000.01 pays $3,828.00 + $5.00, not a prorated cent.",
    },
    faqs: [
      {
        question: "How much is a building permit for a new house in Wichita?",
        answer:
          "$0.38 per finished square foot plus $0.30 per unfinished square foot — the unfinished space being unfinished basements, attached garages, covered porches and decks. A 2,000 sq ft house with an 800 sq ft unfinished basement pays $760.00 + $240.00 = $1,000.00. There is no valuation component for a new dwelling.",
        sourceId: ICT_SOURCE_KEY,
      },
      {
        question: "How is a commercial building permit calculated in Wichita?",
        answer:
          "By Table B §2's valuation ladder: $40 to $1,000, then bands from '$70 for the first $2,000 plus $11.00 per additional $1,000 or fraction' up to '$18,328 for the first $5,000,000 plus $2.25 per additional $1,000 or fraction.' Every excess rounds up to a whole increment.",
        sourceId: ICT_SOURCE_KEY,
      },
      {
        question: "Does a residential remodel pay the same ladder?",
        answer:
          "Yes. Table B §3: 'For all remodels or rebuilds for both residential and commercial, the building permit shall be based upon the amounts specified in paragraph 2 above' — the ladder is class-blind for remodels.",
        sourceId: ICT_SOURCE_KEY,
      },
      {
        question: "What is the plan review fee in Wichita?",
        answer:
          "60 percent of the building permit fee, charged in addition to it, under §109.5.1 of the Wichita-Sedgwick County Unified Building and Trade Code. Changed or incomplete plans trigger additional plan review at Table D's hourly rate.",
        sourceId: ICT_UBTC_SOURCE_KEY,
      },
      {
        question: "Do I need a separate electrical permit for a new house?",
        answer:
          "No — Table I's own provision covers one- and two-family dwelling electrical work inside the building permit. Exceptions: water-well motors, and work begun more than 180 days after the building permit was issued.",
        sourceId: ICT_SOURCE_KEY,
      },
      {
        question: "Who issues permits in Wichita — the city or the county?",
        answer:
          "Both, through MABCD: the Metropolitan Area Building and Construction Department is a joint City of Wichita / Sedgwick County department under the Unified Building and Trade Code, serving Wichita, the county and contracted smaller cities from 271 W 3rd Street N.",
        sourceId: ICT_SOURCE_KEY,
      },
    ],
    seoTitle: "Wichita building permit cost: square-footage rates and the Table B ladder",
    seoDescription:
      "Wichita building permit fees — $0.38/$0.30 per sq ft for new houses, the eight-band valuation ladder for commercial and remodels, and the 60% plan review under UBTC §109.5.1.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: WICHITA_LAST_VERIFIED,
  },
  {
    jurisdictionKey: WICHITA_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    slug: "electrical-permit-cost",
    title: "Wichita electrical permit cost",
    intro:
      "A Wichita electrical permit is **Table I — a parts list**. Every row is a count times a price: **circuits $2.00 each, outlets added to existing circuits $0.75, light fixtures $0.75, service meters $11.00**, generators and photovoltaic systems $29.00, feeders and special power circuits $9.00 — and every permit adds the **$25.00 permit issuance fee**. One- and two-family dwelling work is different: **it rides the building permit** and needs no separate electrical permit at all.",
    localSummary:
      "Table I is the oldest kind of fee schedule — a grid of items and prices, no valuation, no area. The permit costs what the count of items says: a fit-out with 25 circuits, 40 new outlets and 60 fixtures prices 25 × $2.00 + 40 × $0.75 + 60 × $0.75 plus the $25.00 issuance fee.\n\nThe bundling note is the schedule's own and it is broad: electrical work 'in conjunction with a building project covered by a building permit for a one- or two-family dwelling new construction, repair, remodel or addition is covered and permitted under the authority granted by the building permit.' Only three things pull a separate permit inside that world — a water-well motor, work begun more than 180 days after the building permit, and each building or tenant space with its own meter.\n\nThe rows this site models are the ones a permit actually counts: circuits, outlets, fixtures, meters. The rest of Table I — heating appliances, signs, smoke detectors, motors, services — is priced in the research file, row by row, at the same item prices.",
    notIncluded:
      "This is Table I's electrical permit fee. It excludes:\n\n- **The building permit** and its 60% plan review — on the building page.\n- **Unmodelled Table I rows** — heating appliances ($3.00–$8.00), pools and spas ($14.00), signs ($7.00 per circuit), smoke detectors ($0.75), motors ($5.00/$7.00), well motors ($7.00), services over 480 V ($71.00), construction services ($14.00/$28.00), transformers ($11.00), miscellaneous ($14.00) — every price in the research file.\n- **Event fees** — the $11.00 reinspection (meter reset) row and the schedule's $50/$140 inspection-penalty rows.",
    workedExample: {
      scenario:
        "A commercial electrical fit-out: 25 circuits, 40 outlets added to existing circuits, 60 light fixtures and 2 service meters — not part of a bundled one/two-family dwelling permit.",
      inputs: {
        occupancy: "commercial",
        custom: {
          circuits: 25,
          outlets: 40,
          lighting_fixtures: 60,
          meters: 2,
        },
      },
      notes:
        "Five lines — **$172.00**.\n\nCircuits: 25 × $2.00 = $50.00. Outlets added to existing circuits: 40 × $0.75 = $30.00. Light fixtures: 60 × $0.75 = $45.00. Service meters: 2 × $11.00 = $22.00. Permit issuance fee: $25.00.\n\nTotal: $50 + $30 + $45 + $22 + $25 = **$172.00**.\n\nWhat moves it: the same scope inside a one- or two-family dwelling building permit is $0.00 here — the bundling provision covers it; and the modelled set is the rows a permit counts item-by-item, with the rest of Table I's prices in the research file.",
    },
    faqs: [
      {
        question: "How much is an electrical permit in Wichita?",
        answer:
          "Table I prices each item: circuits $2.00 each, outlets added to existing circuits $0.75, light fixtures $0.75, service meters $11.00, feeders and special power circuits $9.00, generators and solar $29.00 — plus the $25.00 permit issuance fee on every electrical permit.",
        sourceId: ICT_SOURCE_KEY,
      },
      {
        question: "Does replacing a water heater need a Wichita plumbing permit?",
        answer:
          "Yes — Table H item 9 prices a new or replacement water heater at $9.00, on top of the $25.00 permit issuance fee, unless the work rides a one- or two-family dwelling building permit.",
        sourceId: ICT_SOURCE_KEY,
      },
      {
        question: "Do I need an electrical permit for work on my own house?",
        answer:
          "If the work is part of a project under a one- or two-family dwelling building permit — new construction, repair, remodel or addition — no: Table I covers it under the building permit's authority. Stand-alone electrical work outside such a permit needs its own permit and the $25.00 issuance fee.",
        sourceId: ICT_SOURCE_KEY,
      },
      {
        question: "How are electrical services priced?",
        answer:
          "By meters: $11.00 per meter for 480 V or less at 100 A or less (item 17a), with each additional amp at $0.06 (item 17b). Services over 480 V pay $71.00 per service entrance, and construction services $14.00 ($28.00 over 480 V).",
        sourceId: ICT_SOURCE_KEY,
      },
      {
        question: "Is there a minimum electrical permit fee?",
        answer:
          "Effectively yes: the $25.00 permit issuance fee applies to every electrical permit, so the smallest permit — one circuit at $2.00 — costs $27.00.",
        sourceId: ICT_SOURCE_KEY,
      },
      {
        question: "Where do Wichita electrical permits come from?",
        answer:
          "From MABCD — the joint city/county department — through the MABCD Portal or in person at 271 W 3rd Street N. The permit expires if work does not commence within 180 days.",
        sourceId: ICT_SOURCE_KEY,
      },
    ],
    seoTitle: "Wichita electrical permit cost: the Table I item price list",
    seoDescription:
      "Wichita electrical permit fees under MABCD Table I — $2.00 circuits, $0.75 outlets and fixtures, $11.00 meters, $29.00 solar, plus the $25.00 issuance fee; dwelling work rides the building permit.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: WICHITA_LAST_VERIFIED,
  },
  {
    jurisdictionKey: WICHITA_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    slug: "plumbing-permit-cost",
    title: "Wichita plumbing permit cost",
    intro:
      "A Wichita plumbing permit is **Table H — the same parts-list shape as electrical**. Every row is a count times a price: **waste openings $4.50, water services $5.00, water heaters $9.00, backflow devices $5.00**, medical gas openings $5.00, standpipes $36.00 per riser, lawn sprinklers $10.00 — and every permit adds the **$25.00 permit issuance fee**. As with electrical, **one- and two-family dwelling plumbing rides the building permit**.",
    localSummary:
      "Table H's rows are named for the piece of the system they touch, and none of them reads valuation: a bathroom rough-in with six waste openings prices six times $4.50 whether the house is modest or expensive.\n\nThe $25.00 issuance fee is the permit's floor — the cheapest possible plumbing permit, a single waste opening, is $29.50 — and the item rows stack on top of it in whatever combination the scope names. Water heaters are their own row at $9.00, separate from waste openings, separate from the $5.00 water-service row that prices the line into the building.\n\nThe bundling provision matches Table I's word for word: plumbing work in conjunction with a one- or two-family dwelling building permit 'is covered and permitted under the authority granted by the building permit.' The permit itself expires 180 days after issuance if work has not commenced — the code's own limitation, restated on the table.",
    notIncluded:
      "This is Table H's plumbing permit fee. It excludes:\n\n- **The building permit** and its 60% plan review — on the building page.\n- **Unmodelled Table H rows** — reconnect moved building ($11.00), interior rainwater drains ($4.00), gas meter loops and openings ($9.00 each), mobile home water services ($5.00), lawn sprinklers ($10.00), water conditioning ($4.50), standpipes ($36.00 per riser), miscellaneous ($9.00) — every price in the research file.\n- **Event fees** — reinspection and the investigation-fee row (both 'per inspection' events).",
    workedExample: {
      scenario:
        "A commercial plumbing build-out: 12 waste openings, 2 new water services, 3 water heaters and 2 backflow devices — not part of a bundled one/two-family dwelling permit.",
      inputs: {
        occupancy: "commercial",
        custom: {
          openings: 12,
          water_service_connections: 2,
          special_devices: 3,
          backflow_devices: 2,
        },
      },
      notes:
        "Five lines — **$126.00**.\n\nWaste openings: 12 × $4.50 = $54.00. Water services: 2 × $5.00 = $10.00. Water heaters: 3 × $9.00 = $27.00 (the special-device count, Table H item 9). Backflow devices: 2 × $5.00 = $10.00. Permit issuance fee: $25.00.\n\nTotal: $54 + $10 + $27 + $10 + $25 = **$126.00**.\n\nWhat moves it: the same scope inside a one- or two-family dwelling building permit is $0.00 here — Table H's bundling provision covers it; and each row is its own count, so three water heaters never bill as three fixtures.",
    },
    faqs: [
      {
        question: "How much is a plumbing permit in Wichita?",
        answer:
          "Table H prices each item: waste openings $4.50, water services $5.00, water heaters $9.00, backflow devices $5.00, medical gas openings $5.00, standpipes $36.00 per riser — plus the $25.00 permit issuance fee on every plumbing permit.",
        sourceId: ICT_SOURCE_KEY,
      },
      {
        question: "Does the plumbing permit read the project's value?",
        answer:
          "No — Table H is a pure parts list. The permit costs what the counts say, plus $25.00, regardless of project valuation.",
        sourceId: ICT_SOURCE_KEY,
      },
      {
        question: "What does a water heater replacement permit cost?",
        answer:
          "$9.00 for the water heater row plus the $25.00 issuance fee — $34.00 — on a stand-alone permit. Inside a one- or two-family dwelling building permit it needs no separate permit.",
        sourceId: ICT_SOURCE_KEY,
      },
      {
        question: "How are gas lines permitted?",
        answer:
          "Table H items 4–5: $9.00 per gas meter loop / pressure test and $9.00 per gas opening / pressure test; medical gas openings are $5.00 each (item 6).",
        sourceId: ICT_SOURCE_KEY,
      },
      {
        question: "Is there a minimum plumbing permit fee?",
        answer:
          "Yes, in effect: the $25.00 issuance fee applies to every permit, so the smallest permit — one waste opening at $4.50 — costs $29.50.",
        sourceId: ICT_SOURCE_KEY,
      },
      {
        question: "How long does a Wichita plumbing permit last?",
        answer:
          "180 days: every MABCD permit becomes null if the work has not commenced within 180 days of issuance, and refunds are capped at 80 percent within 180 days by the code's refund section.",
        sourceId: ICT_SOURCE_KEY,
      },
    ],
    seoTitle: "Wichita plumbing permit cost: the Table H item price list",
    seoDescription:
      "Wichita plumbing permit fees under MABCD Table H — $4.50 waste openings, $5.00 water services, $9.00 water heaters, $5.00 backflow devices, plus the $25.00 issuance fee; dwelling work rides the building permit.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: WICHITA_LAST_VERIFIED,
  },
];

const verifications: SeedVerification[] = [
  {
    entityType: "fee_schedule",
    entityKey: WICHITA_KEYS.schedule,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: WICHITA_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: ICT_SOURCE_KEY,
    notes:
      "Tables B, I and H read from the City/County PDFs; the Table B ladder's seam chaining ($40→$70→$488→$1,028→$3,828→$6,328→$18,328) is the internal check on the read. The plan-review percentage verified against the UBTC §109.5.1 amendment text (wichita.gov Ordinance 52-564 archive item).",
  },
  {
    entityType: "jurisdiction_profile",
    entityKey: WICHITA_KEYS.jurisdiction,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: WICHITA_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: ICT_SOURCE_KEY,
    notes:
      "Authority confirmed: MABCD is the joint City of Wichita / Sedgwick County department under the UBTC; the Fees page links the operative 2019-revised tables; the Permits page carries the residential sq-ft rates and roofing row.",
  },
  {
    entityType: "permit_page",
    entityKey: "building-permit-cost",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: WICHITA_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: ICT_SOURCE_KEY,
    notes: "Worked example reproduces Table B band 6 ($4,578.00) and the 60% plan review.",
  },
  {
    entityType: "permit_page",
    entityKey: "electrical-permit-cost",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: WICHITA_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: ICT_SOURCE_KEY,
    notes: "Worked example reproduces the Table I circuit, outlet, fixture and meter rows plus the $25.00 issuance fee.",
  },
  {
    entityType: "permit_page",
    entityKey: "plumbing-permit-cost",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: WICHITA_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: ICT_SOURCE_KEY,
    notes: "Worked example reproduces the Table H waste-opening, water-service, water-heater and backflow rows plus the $25.00 issuance fee.",
  },
];

export const wichitaSeed: JurisdictionSeed = {
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
