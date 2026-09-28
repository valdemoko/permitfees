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
  SFS_BUILDING_RULES,
  SFS_CODE_CH150_SOURCE_KEY,
  SFS_ELECTRICAL_RULES,
  SFS_FEE_SCHEDULE_SOURCE_KEY,
  SFS_MEP_EFFECTIVE_FROM,
  SFS_MEP_SOURCE_KEY,
  SFS_PLUMBING_RULES,
  SFS_SCHEDULE_EFFECTIVE_FROM,
} from "./fee-rules";

export * from "./fee-rules";

/**
 * The complete Sioux Falls, South Dakota seed payload.
 *
 * Every figure traces to research/south-dakota/sioux-falls.md, which traces to
 * the City's annual Building Permit Valuation/Fee Schedule (2026 edition) and
 * the Code of Ordinances Chapter 150 — § 150.017's Tables 1-A/1-B building
 * ladders and Table 1-C row 11's 25% plan review, plus § 150.213 and the City's
 * 2026 MEP Permit Fees one-pager for the common trade ladder in force since
 * January 1, 2022.
 *
 * Three pages, all published: building, electrical, plumbing.
 */

const RESEARCHER = "Permit Fee Intelligence — South Dakota pass (Sioux Falls)";

export const SIOUX_FALLS_LAST_VERIFIED = "2026-09-26";

export const SIOUX_FALLS_KEYS = {
  state: "sd",
  county: "minnehaha-county",
  jurisdiction: "sioux-falls",
  schedule: "sioux-falls-fee-schedule",
} as const;

const state: SeedState = {
  code: "SD",
  slug: "south-dakota",
  name: "South Dakota",
  fipsCode: "46",
};

const county: SeedCounty = {
  key: SIOUX_FALLS_KEYS.county,
  slug: "minnehaha-county",
  name: "Minnehaha County",
  fipsCode: "46099",
};

const jurisdiction: SeedJurisdiction = {
  key: SIOUX_FALLS_KEYS.jurisdiction,
  stateKey: SIOUX_FALLS_KEYS.state,
  countyKey: SIOUX_FALLS_KEYS.county,
  type: "city",
  slug: "sioux-falls",
  name: "Sioux Falls",
  officialName: "City of Sioux Falls — Building Services Division",
  websiteUrl: "https://www.siouxfalls.gov/business-permits/permits-licenses-inspections/permits/building-permits",
  permitPortalUrl: "https://www.siouxfalls.gov/business-permits",
  timezone: "America/Chicago",
  isActive: true,
};

const departments: SeedDepartment[] = [
  {
    key: "sioux-falls-building-services",
    jurisdictionKey: SIOUX_FALLS_KEYS.jurisdiction,
    kind: "building",
    name: "Building Services Division",
    phone: "(605) 367-8670",
    email: "buildinginspections@siouxfalls.gov",
    url: "https://www.siouxfalls.gov/business-permits/permits-licenses-inspections/permits/building-permits",
    addressLine: "City Center, 231 N. Dakota Ave., Sioux Falls, SD 57104",
    hours: "Monday – Friday, 8:00 a.m. – 5:00 p.m. CT",
    notes:
      "Building Services issues building, electrical, mechanical and plumbing permits under Code of Ordinances Chapter 150 (adopted IBC/IRC/IMC/UPC/NEC amendments). The City's fee schedule has been reviewed and re-adopted annually since 1985 (residential valuation) and 1992 (commercial).",
  },
];

const sources: SeedSource[] = [
  {
    key: SFS_FEE_SCHEDULE_SOURCE_KEY,
    jurisdictionKey: SIOUX_FALLS_KEYS.jurisdiction,
    title: "City of Sioux Falls Building Permit Valuation/Fee Schedule (2026 edition)",
    url: "https://www.siouxfalls.gov/files/assets/public/v/2/2025-fee-schedule.pdf",
    sourceType: "fee_schedule_pdf",
    issuingAuthority: "City of Sioux Falls — Building Services",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2026-01-01",
    effectiveFrom: SFS_SCHEDULE_EFFECTIVE_FROM,
    retrievedAt: SIOUX_FALLS_LAST_VERIFIED,
    lastVerifiedAt: SIOUX_FALLS_LAST_VERIFIED,
    notes:
      "Read 2026-09-26 via reader proxy (siouxfalls.gov 403s plain scripted fetches). Six pages: the square-foot valuation factors for new residential construction ($128 finished habitable, $79 finished basement, $41 unfinished, $42 attached garage, $38 detached garage; apartments $127 Type V / $149 Type III), the residential and commercial building ladders (identical to code Tables 1-A/1-B), and the flat scope rows. The file at /v/2/2025-fee-schedule.pdf carries the internal title '2026 Fee Schedule Clean' and is superseded by /v/3/2026-fee-schedule-01012026.pdf with the same amounts — the Building Permits page links both.",
  },
  {
    key: SFS_CODE_CH150_SOURCE_KEY,
    jurisdictionKey: SIOUX_FALLS_KEYS.jurisdiction,
    title: "Sioux Falls Code of Ordinances, Chapter 150 — Building (§§ 150.017, 150.213, 150.215, 150.302)",
    url: "https://codelibrary.amlegal.com/codes/siouxfalls/latest/siouxfalls_sd/0-0-0-60648",
    sourceType: "municipal_code",
    issuingAuthority: "City of Sioux Falls",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2024-01-01",
    effectiveFrom: SFS_SCHEDULE_EFFECTIVE_FROM,
    retrievedAt: SIOUX_FALLS_LAST_VERIFIED,
    lastVerifiedAt: SIOUX_FALLS_LAST_VERIFIED,
    notes:
      "Read 2026-09-26 across the amlegal codelibrary nodes. § 150.017 carries Tables 1-A/1-B (the building ladders, agreeing with the schedule PDF to the cent) and Table 1-C row 11 (plan review '25 percent of the building permit fee as specified on Table 1-B … in addition to the building permit fee'). § 150.213 carries the electrical fee table as amended effective 2022 (the valuation ladder) and preserves the pre-2022 item-priced regime in subsection (a); § 150.215 prices electrical plan review hourly; § 150.302 (2024 UPC adoption) carries Table 104.5 whose bases run $31.75–$32 above the electrical and mechanical ladders above $50,000 of trade valuation — an inconsistency inside the ordinance itself, resolved in favor of the common ladder the City's own MEP form publishes.",
  },
  {
    key: SFS_MEP_SOURCE_KEY,
    jurisdictionKey: SIOUX_FALLS_KEYS.jurisdiction,
    title: "City of Sioux Falls — MEP Permit Fees (2026 one-page form: electrical, mechanical, plumbing)",
    url: "https://www.siouxfalls.gov/files/assets/public/v/3/files/assets/public/zbusiness-and-permits/2026-mep-permit-fees.pdf",
    sourceType: "fee_schedule_pdf",
    issuingAuthority: "City of Sioux Falls — Building Services",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2026-01-01",
    effectiveFrom: SFS_MEP_EFFECTIVE_FROM,
    retrievedAt: SIOUX_FALLS_LAST_VERIFIED,
    lastVerifiedAt: SIOUX_FALLS_LAST_VERIFIED,
    notes:
      "Read 2026-09-26 via reader proxy. One page publishing the common eight-band trade ladder ('Electrical/Mechanical/Plumbing Valuation' from $40 at $5,000 to $3,903.75 base above $1,000,000), the $25.00 homeowner's permit and $5.00 state wiring permit administrative rows, and the collection order: 'PLAN REVIEW FEE ONLY: Building permit fees will be collected at the time of permit issuance.' This is the form a contractor actually files with, and it is the resolution of Table 104.5's higher plumbing bases.",
  },
];

/** Empty on purpose: the permit types Sioux Falls uses already exist as shared rows. */
const permitTypes: JurisdictionSeed["permitTypes"] = [];
const projectTypes: JurisdictionSeed["projectTypes"] = [];

const jurisdictionPermitTypes: SeedJurisdictionPermitType[] = [
  {
    jurisdictionKey: SIOUX_FALLS_KEYS.jurisdiction,
    permitTypeKey: "building",
    isAvailable: true,
    localName: "Building permit — Table 1-A/1-B valuation ladders with derived residential valuations",
    officialUrl: "https://www.siouxfalls.gov/business-permits/permits-licenses-inspections/permits/building-permits",
    notes:
      "New residential construction does not declare a value: the schedule's square-foot factors derive it ($128/sq ft finished habitable, $79 finished basement, $41 unfinished, $42 attached garage, $38 detached). Remodels and renovations always use the actual bid price. Both classes then climb their own ladder — residential Table 1-A from the $40 flat band to $433.00 base above $100,000, commercial Table 1-B from the $40 flat band to $2,039.50 base above $500,000 — each band's excess rounding up to whole $1,000 ('or fraction thereof'). Plan review adds 25% of the Table 1-B fee.",
  },
  {
    jurisdictionKey: SIOUX_FALLS_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    isAvailable: true,
    localName: "Electrical permit — the common MEP valuation ladder (2022+)",
    officialUrl: "https://www.siouxfalls.gov/files/assets/public/v/3/files/assets/public/zbusiness-and-permits/2026-mep-permit-fees.pdf",
    notes:
      "Since January 1, 2022 electrical, mechanical and plumbing price identically on the trade's own declared valuation: $40 flat to $5,000, then seven bands whose bases chain exactly ($160.00, $291.25, $516.25, $1,153.75, $2,153.75, $3,903.75) with 'or fraction thereof' round-ups. The pre-2022 item-priced regime ($100/$200/$250 services by amperage, $6/$12/$15 circuits, $1 openings) survives in § 150.213(a) as history. A $25.00 homeowner's permit and $5.00 state wiring permit are administrative flats.",
  },
  {
    jurisdictionKey: SIOUX_FALLS_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    isAvailable: true,
    localName: "Plumbing permit — the common MEP valuation ladder (2022+)",
    officialUrl: "https://www.siouxfalls.gov/files/assets/public/v/3/files/assets/public/zbusiness-and-permits/2026-mep-permit-fees.pdf",
    notes:
      "The same eight-band common ladder as electrical, on the plumbing valuation. Table 104.5 of the 2024 UPC ordinance prints bases $31.75–$32 higher in the three bands above $50,000 — an inconsistency inside the ordinance itself; the seed charges the common ladder the City's own 2026 MEP form publishes, and the divergence is documented in the research file.",
  },
];

const feeSchedules: SeedFeeSchedule[] = [
  {
    key: SIOUX_FALLS_KEYS.schedule,
    jurisdictionKey: SIOUX_FALLS_KEYS.jurisdiction,
    sourceKey: SFS_FEE_SCHEDULE_SOURCE_KEY,
    title: "Sioux Falls Building Permit Valuation/Fee Schedule (2026) with Chapter 150 code tables",
    officialUrl: "https://www.siouxfalls.gov/files/assets/public/v/2/2025-fee-schedule.pdf",
    effectiveFrom: SFS_SCHEDULE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: SIOUX_FALLS_LAST_VERIFIED,
    notes:
      "The building ladders re-verified annually since 1985 (residential valuation factors) and 1992 (commercial). The MEP trade ladder has been effective since 2022-01-01 and is published both in § 150.213 and on the City's 2026 MEP one-pager.",
  },
];

function attach(
  permitTypeKey: string,
  rules: SeedFeeRule["rule"][],
  scheduleKey: string,
): SeedFeeRule[] {
  return rules.map((rule) => ({
    jurisdictionKey: SIOUX_FALLS_KEYS.jurisdiction,
    permitTypeKey,
    scheduleKey,
    rule,
  }));
}

const feeRules: SeedFeeRule[] = [
  ...attach("building", SFS_BUILDING_RULES, SIOUX_FALLS_KEYS.schedule),
  ...attach("electrical", SFS_ELECTRICAL_RULES, SIOUX_FALLS_KEYS.schedule),
  ...attach("plumbing", SFS_PLUMBING_RULES, SIOUX_FALLS_KEYS.schedule),
];

const requirements: SeedRequirement[] = [
  {
    jurisdictionKey: SIOUX_FALLS_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "document",
    title: "New residential valuations are derived from square-foot factors, not declared",
    description:
      "The schedule sets the factors: $128.00/sq ft finished habitable space, $79.00 finished basements, $41.00 unfinished space, $42.00 attached garages, $38.00 detached garages. The derived total is what the ladder reads. Remodels and renovations never use the factors — 'the valuation … for remodels and renovations remains as the actual bid price.'",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: SFS_FEE_SCHEDULE_SOURCE_KEY,
    lastVerifiedAt: SIOUX_FALLS_LAST_VERIFIED,
  },
  {
    jurisdictionKey: SIOUX_FALLS_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "Commercial valuation includes all permanent building work",
    description:
      "Table 1-B's valuation sentence: 'the total value of all construction work … as well as all finish work, painting, roofing, electrical, plumbing, heating, air-conditioning, elevators, fire-extinguishing system, and other permanent equipment exclusive of site improvements and parking lots costs.' Site improvements and parking lots are out.",
    isMandatory: true,
    sortOrder: 20,
    sourceKey: SFS_CODE_CH150_SOURCE_KEY,
    lastVerifiedAt: SIOUX_FALLS_LAST_VERIFIED,
  },
  {
    jurisdictionKey: SIOUX_FALLS_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "other",
    title: "A stand-alone MEP permit reads the trade's own valuation",
    description:
      "The common ladder prices 'Electrical/Mechanical/Plumbing Valuation'; the Total Project Valuation is substituted only when a building permit covers the same work. A stand-alone electrical permit never reads the building's value — and electrical plan review on a building project is '25% of the electrical portion of the building permit fee as shown on Table No. 1-B' (§ 150.213 fee 6), the same amount the building page's 25% rule charges once.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: SFS_MEP_SOURCE_KEY,
    lastVerifiedAt: SIOUX_FALLS_LAST_VERIFIED,
  },
  {
    jurisdictionKey: SIOUX_FALLS_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    requirementType: "other",
    title: "Plan review is collected before the permit fee on commercial submittals",
    description:
      "The MEP form states the order: 'PLAN REVIEW FEE ONLY: Building permit fees will be collected at the time of permit issuance.' The plumbing trade's plan review mirrors § 150.213's phrasing — 25% of the Table 1-B fee — charged once on the building page.",
    isMandatory: false,
    sortOrder: 10,
    sourceKey: SFS_MEP_SOURCE_KEY,
    lastVerifiedAt: SIOUX_FALLS_LAST_VERIFIED,
  },
];

const profile: SeedProfile = {
  jurisdictionKey: SIOUX_FALLS_KEYS.jurisdiction,
  headline: "What construction permits cost in Sioux Falls",
  summary:
    "Sioux Falls permits are issued by **Building Services** under Chapter 150 of the Code of Ordinances and an annually re-adopted fee schedule. New houses get their valuation **derived from square-foot factors — $128/sq ft of finished space** — then climb the **Table 1-A ladder**; commercial work declares its value and climbs **Table 1-B**. Every band's excess rounds up to whole $1,000 ('or fraction thereof'). Plan review adds **25% of the building permit fee**. Since January 1, 2022 the electrical, mechanical and plumbing trades have shared **one common valuation ladder**, from a $40 flat to a $3,903.75 base above $1,000,000.",
  localContext:
    "The fee schedule is a living document here: the City has reviewed the residential valuation method every year since 1985 and the commercial one since 1992, and the 2026 edition is the sixth re-adoption this dataset's window covers. That discipline shows in the ladders themselves — every seam above the flat bands chains to the cent, the internal check on a read of a forty-year-old document lineage.\n\nThe residential regime is unusual: the applicant never declares a value for a new house. The schedule's factors derive it — $128 per square foot of finished habitable space, $79 for finished basements, $41 for unfinished space, $42 attached and $38 detached garages — and the derived total walks the ladder. Remodels are the exception the schedule states in its own sentence: actual bid price, never the factors.\n\nThe trades were consolidated in 2022. Before that, electrical priced like a parts list — services by amperage, circuits at $6/$12/$15, openings at a dollar. Since January 1, 2022 all three trades price identically on the trade's own valuation, and the City's one-page MEP form publishes the common ladder the code's three articles describe. The 2024 UPC ordinance's plumbing table prints bases a few dollars higher above $50,000 — an inconsistency inside the ordinance itself; the form a contractor actually files with carries the common figures.",
  valuationBasis:
    "Three regimes. **New residential construction derives its valuation from area** at the schedule's factors, then walks the ladder; **remodels declare actual bid price**. **Commercial work declares total construction value** — finish work, MEP, elevators and permanent equipment in; site improvements and parking lots out. **The trades read the trade's own valuation** on the common MEP ladder, substituting the total project valuation only when a building permit covers the same work.",
  notIncluded:
    "These figures are the City's own permit amounts. They are not a project cost, and they exclude:\n\n- **Mechanical permits** — priced on the same common MEP ladder, recorded without their own page.\n- **The flat $40 scope rows** — re-shingling, residing, swimming-pool fence enclosures, razing permits, window replacements (sashes only) — named scope rows, not the ladder.\n- **Administrative flats** — the $25.00 homeowner's permit and $5.00 state wiring permit (electrical), wrecking $40, board of appeals $100, late-corrections $100, failure-to-inspect $250.\n- **Event and hourly fees** — the $100/$200 hourly inspection rates, electrical plan review's hourly rows (§ 150.215), additional plan review for changed plans (another 25%).\n- **The pre-2022 electrical item-price regime** and the **Table 104.5 plumbing-base divergence** — both recorded in the research file.",
  seoTitle: "Sioux Falls permit fees — Table 1-A/1-B ladders and the common MEP ladder",
  seoDescription:
    "How Sioux Falls prices construction permits: derived residential valuations at $128/sq ft finished, the Table 1-A/1-B ladders, 25% plan review, and the common electrical/plumbing valuation ladder since 2022.",
  publishStatus: "published",
  noindex: false,
  lastReviewedAt: SIOUX_FALLS_LAST_VERIFIED,
};

const permitPages: SeedPermitPage[] = [
  {
    jurisdictionKey: SIOUX_FALLS_KEYS.jurisdiction,
    permitTypeKey: "building",
    slug: "building-permit-cost",
    title: "Sioux Falls building permit cost",
    intro:
      "A Sioux Falls building permit starts with **how the valuation is set**. New houses never declare one: the schedule's **square-foot factors derive it** — $128.00 per finished square foot, $79.00 finished basements, $41.00 unfinished space, $42.00 attached garages. Commercial work declares its total construction value. Either way the permit then climbs a **valuation ladder** — Table 1-A for dwellings, Table 1-B for commercial — from a **$40.00 flat band** to a $433.00 (residential) or $2,039.50 (commercial) base, with every excess rounded up to whole $1,000. Plan review adds **25% of the building permit fee**.",
    localSummary:
      "The derived-valuation step is what makes Sioux Falls different. A 2,000 sq ft house with a 1,000 sq ft finished basement and a 600 sq ft attached garage derives to 2,000 × $128 + 1,000 × $79 + 600 × $42 = $364,200 — and that number, not a contractor's guess, walks the ladder.\n\nThe ladders themselves chain exactly above their flat bands: residential $32.50 + 23 × $6.00 is $170.50, $170.50 + 25 × $4.50 is $283.00, $283.00 + 50 × $3.00 is $433.00; commercial $45.00 + 23 × $9.00 is $252.00 and so on to $2,039.50. Every 'or fraction thereof' rounds up to a whole $1,000 — a $450,000 build-out in commercial band 5 pays $639.50 plus 350 whole steps at $3.50.\n\nPlan review is Table 1-C row 11: 25 percent of the building permit fee 'in addition to the building permit fee.' The City's MEP form states the collection order — plan review up front on commercial submittals, the permit fee at issuance.",
    notIncluded:
      "This is the building permit fee. It excludes:\n\n- **Trade permits** — electrical and plumbing price the common MEP ladder on their own pages; inside a building project each trade's plan review is the same 25% of the Table 1-B fee, charged once here.\n- **The flat $40 scope rows** — re-shingling, residing, pool fences, razing, window sashes — named scope rows outside the ladder.\n- **Mechanical permits** and **development-application fees** ($250 conditional use, $250 variance, $2,500 TIF).\n- **Event fees** — the $100/$200 hourly inspection rates, late-corrections and failure-to-inspect administrative fees.",
    workedExample: {
      scenario:
        "A commercial build-out with a declared total construction valuation of $450,000, submitted through the plan-review path.",
      inputs: {
        valuationCents: 45_000_000,
        occupancy: "commercial",
        workType: "new_construction",
      },
      notes:
        "Two lines — **$2,330.63**.\n\nTable 1-B, band 5 ('\$100,001 to \$500,000'): base \$639.50. The excess is \$350,000 — 350 whole \$1,000 steps at \$3.50 = \$1,225.00. Band total: \$639.50 + \$1,225.00 = \$1,864.50.\n\nPlan review: 25% of the building permit fee under Table 1-C row 11 — 0.25 × \$1,864.50 = \$466.125, rounded to \$466.13.\n\nTotal: \$1,864.50 + \$466.13 = **\$2,330.63**. The 'or fraction thereof' matters: \$450,000.01 would round to 351 steps, one dollar more of fee for one cent of valuation.",
    },
    faqs: [
      {
        question: "How is a new home's permit valuation set in Sioux Falls?",
        answer:
          "It is derived, not declared: $128.00 per finished square foot of habitable space, $79.00 for finished basements, $41.00 for unfinished space, $42.00 for attached garages and $38.00 for detached garages. The derived total walks the Table 1-A ladder.",
        sourceId: SFS_FEE_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "How much is a building permit for a $300,000 house in Sioux Falls?",
        answer:
          "A $300,000 derived valuation lands in Table 1-A band 5: $433.00 for the first $100,000 plus 200 whole $1,000 steps at $2.50 = $500.00 — $933.00, plus 25% plan review ($233.25) if plans are reviewed, for $1,166.25.",
        sourceId: SFS_FEE_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "Do remodels use the square-foot factors?",
        answer:
          "No. The schedule's own sentence: the valuation 'for remodels and renovations remains as the actual bid price.' Only new residential construction derives its value from area.",
        sourceId: SFS_FEE_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "What is the plan review fee in Sioux Falls?",
        answer:
          "25 percent of the building permit fee (Table 1-C row 11), charged in addition to the permit fee and collected first on commercial submittals. Changed plans trigger another 25% review fee.",
        sourceId: SFS_CODE_CH150_SOURCE_KEY,
      },
      {
        question: "How much is a stand-alone electrical or plumbing permit?",
        answer:
          "Both trades price the same common ladder on the trade's own valuation: $40 flat to $5,000, then bands from '$160 for the first $25,000 plus $5.25 per additional $1,000' up to a $3,903.75 base above $1,000,000.",
        sourceId: SFS_MEP_SOURCE_KEY,
      },
      {
        question: "Who issues permits in Sioux Falls?",
        answer:
          "Building Services, at City Center, 231 N. Dakota Ave., under Code of Ordinances Chapter 150. The fee schedule has been reviewed and re-adopted annually since 1985 for residential valuation and 1992 for commercial.",
        sourceId: SFS_CODE_CH150_SOURCE_KEY,
      },
    ],
    seoTitle: "Sioux Falls building permit cost: derived valuations and the 1-A/1-B ladders",
    seoDescription:
      "Sioux Falls building permit fees — $128/sq ft derived residential valuations, the Table 1-A/1-B valuation ladders with round-up increments, and the 25% plan review under Table 1-C.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: SIOUX_FALLS_LAST_VERIFIED,
  },
  {
    jurisdictionKey: SIOUX_FALLS_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    slug: "electrical-permit-cost",
    title: "Sioux Falls electrical permit cost",
    intro:
      "A Sioux Falls electrical permit prices on **one number: the electrical valuation**. Since January 1, 2022 the electrical, mechanical and plumbing trades have shared **one common ladder** — a **$40.00 flat band to $5,000**, then seven bands whose bases chain exactly to a **$3,903.75 base above $1,000,000**, every excess rounded up to whole $1,000. A stand-alone electrical permit reads its own declared valuation, never the building's.",
    localSummary:
      "The 2022 consolidation replaced a parts-list regime — services by amperage at $100/$200/$250, circuits at $6/$12/$15, openings at a dollar — with a valuation ladder the three trades share word for word. The seams chain exactly: $40 + 20 × $6.00 is $160.00, $160.00 + 25 × $5.25 is $291.25, and so on to $3,903.75.\n\nA $60,000 electrical fit-out lands in band 4: $291.25 plus 10 whole $1,000 steps at $4.50 — $336.25. There is no separate plan-review charge on a stand-alone trade permit: the trade codes' '25% of the electrical portion of the building permit fee' phrasing points at the building permit's Table 1-B amount, which the building page's plan-review rule charges once when a building permit exists.\n\nThe old regime survives in § 150.213(a) as history, and two administrative flats — the $25.00 homeowner's permit and the $5.00 state wiring permit — sit outside the ladder entirely.",
    notIncluded:
      "This is the electrical permit fee on the common MEP ladder. It excludes:\n\n- **The building permit** and its 25% plan review — on the building page; a trade's 'portion' plan review is that same amount, not an additional one.\n- **The pre-2022 item-price regime** — services by amperage, circuits, openings, signs, pools — preserved in § 150.213(a) as history.\n- **Administrative flats** — the $25.00 homeowner's permit and $5.00 state wiring permit.\n- **Event fees** — the hourly inspection rates and § 150.215's hourly electrical plan-review rows for changed plans.",
    workedExample: {
      scenario:
        "A stand-alone commercial electrical fit-out with a declared electrical valuation of $60,000.",
      inputs: {
        valuationCents: 6_000_000,
        occupancy: "commercial",
        workType: "new_construction",
      },
      notes:
        "One line — **$336.25**.\n\nCommon MEP ladder, band 4 ('\$50,000.01 to \$100,000'): base \$291.25. The excess is \$10,000 — 10 whole \$1,000 steps at \$4.50 = \$45.00.\n\nTotal: \$291.25 + \$45.00 = **\$336.25**.\n\nWhat moves it: a \$60,000 electrical scope inside a building permit for the same project changes nothing here — the trade permit still reads the electrical valuation; but the building permit's own ladder would price the whole project once, and the 25% plan review would attach to it on the building page.",
    },
    faqs: [
      {
        question: "How much is an electrical permit in Sioux Falls?",
        answer:
          "It depends on the declared electrical valuation: $40.00 flat to $5,000, then bands — $40 plus $6 per additional $1,000 to $25,000, $160 plus $5.25 to $50,000, $291.25 plus $4.50 to $100,000 — up to a $3,903.75 base above $1,000,000.",
        sourceId: SFS_MEP_SOURCE_KEY,
      },
      {
        question: "Does the electrical permit read the whole project's value?",
        answer:
          "No — a stand-alone electrical permit reads the electrical valuation. The total project valuation substitutes only when a building permit covers the same work, in which case the electrical work prices inside that permit.",
        sourceId: SFS_MEP_SOURCE_KEY,
      },
      {
        question: "Is there a separate electrical plan review fee?",
        answer:
          "Not on a stand-alone permit. § 150.213's plan-review row is '25% of the electrical portion of the building permit fee as shown on Table No. 1-B' — the same amount the building page's plan-review rule charges once when a building permit exists.",
        sourceId: SFS_CODE_CH150_SOURCE_KEY,
      },
      {
        question: "What did electrical permits cost before 2022?",
        answer:
          "A parts list: new 1–2 family services by amperage ($100/$200/$250), service connections $45–$250, circuits $6/$12/$15, openings and fixtures $1 for the first 40 then $0.50, apartments $35 per unit. § 150.213(a) preserves the old table; the valuation ladder has governed since January 1, 2022.",
        sourceId: SFS_CODE_CH150_SOURCE_KEY,
      },
      {
        question: "What is the homeowner's electrical permit?",
        answer:
          "A $25.00 flat (plus the $5.00 state wiring permit) for owner-occupied work — an administrative row outside the valuation ladder, alongside the state's own $5.00 wiring permit.",
        sourceId: SFS_MEP_SOURCE_KEY,
      },
      {
        question: "Where do Sioux Falls electrical permits come from?",
        answer:
          "Building Services, at City Center, 231 N. Dakota Ave., under Chapter 150's electrical article (§§ 150.201–150.221). The common trade ladder took effect January 1, 2022.",
        sourceId: SFS_CODE_CH150_SOURCE_KEY,
      },
    ],
    seoTitle: "Sioux Falls electrical permit cost: the common MEP valuation ladder",
    seoDescription:
      "Sioux Falls electrical permit fees — the $40-to-$3,903.75 common trade ladder on the electrical valuation, in force since 2022, with the pre-2022 item-price regime as history.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: SIOUX_FALLS_LAST_VERIFIED,
  },
  {
    jurisdictionKey: SIOUX_FALLS_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    slug: "plumbing-permit-cost",
    title: "Sioux Falls plumbing permit cost",
    intro:
      "A Sioux Falls plumbing permit prices on **the same common ladder as electrical and mechanical** — a **$40.00 flat band to $5,000 of plumbing valuation**, then seven bands chaining exactly to a **$3,903.75 base above $1,000,000**, every excess rounded up to whole $1,000. The permit reads the **plumbing valuation** on a stand-alone application, never the building's.",
    localSummary:
      "The plumbing trade shares the electrical and mechanical ladder word for word — that is the City's own presentation, on the one-page MEP form a contractor files with. The seams chain: $40 + 20 × $6.00 is $160.00; $160.00 + 25 × $5.25 is $291.25; $291.25 + 50 × $4.50 is $516.25.\n\nAn $18,000 plumbing scope lands in band 2: $40 plus 13 whole $1,000 steps at $6.00 — $118.00. The 2024 UPC ordinance's own Table 104.5 prints bases a few dollars higher in the bands above $50,000 — an inconsistency inside the ordinance; the common figures the MEP form publishes are what this page charges, and the divergence is documented in the research file.\n\nPlan review follows the building project, not the trade permit: the trade codes' 25%-of-the-Table-1-B-fee phrasing is charged once on the building page, and the MEP form states the collection order — plan review up front, permit fees at issuance.",
    notIncluded:
      "This is the plumbing permit fee on the common MEP ladder. It excludes:\n\n- **The building permit** and its 25% plan review — on the building page.\n- **Table 104.5's higher plumbing bases** above $50,000 — the 2024 UPC ordinance's internal inconsistency; the common ladder the MEP form publishes is charged, and the divergence is recorded.\n- **Administrative flats** — the $25.00 homeowner's permit.\n- **Event fees** — the hourly inspection rates and additional plan review for changed plans.",
    workedExample: {
      scenario:
        "A stand-alone commercial plumbing scope with a declared plumbing valuation of $18,000.",
      inputs: {
        valuationCents: 1_800_000,
        occupancy: "commercial",
        workType: "new_construction",
      },
      notes:
        "One line — **$118.00**.\n\nCommon MEP ladder, band 2 ('\$5,000.01 to \$25,000'): base \$40.00. The excess is \$13,000 — 13 whole \$1,000 steps at \$6.00 = \$78.00.\n\nTotal: \$40.00 + \$78.00 = **\$118.00**.\n\nWhat moves it: 'or fraction thereof' — \$18,000.01 would round to 14 steps; and inside a building permit for the same project the plumbing work prices inside the building ladder instead, with the 25% plan review attaching there.",
    },
    faqs: [
      {
        question: "How much is a plumbing permit in Sioux Falls?",
        answer:
          "The common trade ladder on the declared plumbing valuation: $40.00 flat to $5,000, then $6 per additional $1,000 to $25,000, $5.25 to $50,000, $4.50 to $100,000 — up to a $3,903.75 base above $1,000,000.",
        sourceId: SFS_MEP_SOURCE_KEY,
      },
      {
        question: "Why do plumbing and electrical permits cost the same?",
        answer:
          "Since January 1, 2022 all three trades — electrical, mechanical, plumbing — price identically on the trade's own valuation. The City's one-page MEP form publishes the ladder once for all three.",
        sourceId: SFS_MEP_SOURCE_KEY,
      },
      {
        question: "Is the plumbing fee table different in the plumbing code?",
        answer:
          "Slightly, on paper: Table 104.5 of the 2024 UPC ordinance prints bases $31.75–$32 higher in the bands above $50,000 of trade valuation. The City's own MEP form publishes the common (lower) figures, which is what this page charges; the divergence is documented in the research file.",
        sourceId: SFS_CODE_CH150_SOURCE_KEY,
      },
      {
        question: "Does a water heater replacement need a valuation-based permit?",
        answer:
          "Any stand-alone plumbing permit prices on the declared plumbing valuation, so even a small scope reads the ladder — a $3,000 water-heater job pays the $40.00 flat band. The $25.00 homeowner's permit is the administrative alternative for owner-occupied work.",
        sourceId: SFS_MEP_SOURCE_KEY,
      },
      {
        question: "When is the plumbing plan review fee collected?",
        answer:
          "On commercial submittals, before the permit: the MEP form states 'PLAN REVIEW FEE ONLY: Building permit fees will be collected at the time of permit issuance.' The trade's 25% plan review is the building permit's Table 1-B amount, charged once on the building page.",
        sourceId: SFS_MEP_SOURCE_KEY,
      },
      {
        question: "Where do Sioux Falls plumbing permits come from?",
        answer:
          "Building Services, under Chapter 150's plumbing article (§§ 150.302–150.304, the 2024 UPC adoption). The common trade ladder took effect January 1, 2022.",
        sourceId: SFS_CODE_CH150_SOURCE_KEY,
      },
    ],
    seoTitle: "Sioux Falls plumbing permit cost: the common MEP valuation ladder",
    seoDescription:
      "Sioux Falls plumbing permit fees — the shared $40-to-$3,903.75 trade ladder on the plumbing valuation, the 2022 consolidation, and the Table 104.5 base divergence documented.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: SIOUX_FALLS_LAST_VERIFIED,
  },
];

const verifications: SeedVerification[] = [
  {
    entityType: "fee_schedule",
    entityKey: SIOUX_FALLS_KEYS.schedule,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: SIOUX_FALLS_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: SFS_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "The 2026 schedule read via reader proxy; both building ladders' seams verified to the cent ($32.50→$170.50→$283.00→$433.00 residential; $45→$252→$414.50→$639.50→$2,039.50 commercial). The MEP ladder's seams verified the same way and cross-checked between § 150.213 and the 2026 MEP one-pager.",
  },
  {
    entityType: "jurisdiction_profile",
    entityKey: SIOUX_FALLS_KEYS.jurisdiction,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: SIOUX_FALLS_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: SFS_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "Authority confirmed: Building Services at City Center; the Building Permits page links the fee-schedule PDFs and states the $40 minimum; Chapter 150's tables agree with the schedule PDF.",
  },
  {
    entityType: "permit_page",
    entityKey: "building-permit-cost",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: SIOUX_FALLS_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: SFS_FEE_SCHEDULE_SOURCE_KEY,
    notes: "Worked example reproduces Table 1-B band 5 ($1,864.50) and the 25% plan review ($466.13).",
  },
  {
    entityType: "permit_page",
    entityKey: "electrical-permit-cost",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: SIOUX_FALLS_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: SFS_MEP_SOURCE_KEY,
    notes: "Worked example reproduces the common ladder band 4 at $60,000 of electrical valuation ($336.25).",
  },
  {
    entityType: "permit_page",
    entityKey: "plumbing-permit-cost",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: SIOUX_FALLS_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: SFS_MEP_SOURCE_KEY,
    notes: "Worked example reproduces the common ladder band 2 at $18,000 of plumbing valuation ($118.00).",
  },
];

export const siouxFallsSeed: JurisdictionSeed = {
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
