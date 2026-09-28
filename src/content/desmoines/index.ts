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
  DSM_BLDG_SOURCE_KEY,
  DSM_BUILDING_RULES,
  DSM_ELECTRICAL_RULES,
  DSM_FEE_EFFECTIVE_FROM,
  DSM_PDC_SOURCE_KEY,
  DSM_PLUMBING_RULES,
} from "./fee-rules";

export * from "./fee-rules";

/**
 * The complete Des Moines, Iowa seed payload.
 *
 * Every figure traces to research/iowa/des-moines.md, which traces to the City's
 * own publications: the Permit and Development Center fee schedule ("New Fees
 * 2-1-25", effective 2025-02-01) — the consolidated instrument for the office
 * that issues every permit — and the Building Division schedule effective
 * 2025-01-02 (DMMC 14.01.090), kept as a dated secondary source. The two conflict
 * on the building ladder; the PDC document is the newer one and is what these
 * pages charge (research/iowa/des-moines.md §3.1).
 *
 * Three pages, all published: building, electrical, plumbing. Mechanical is read
 * and recorded in the research file without a page in this pass.
 */

const RESEARCHER = "Permit Fee Intelligence — Iowa pass (Des Moines)";

export const DES_MOINES_LAST_VERIFIED = "2026-09-26";

export const DES_MOINES_KEYS = {
  state: "ia",
  county: "polk-county",
  jurisdiction: "des-moines",
  buildingSchedule: "dsm-pdc-fee-schedule",
  electricalSchedule: "dsm-pdc-fee-schedule",
  plumbingSchedule: "dsm-pdc-fee-schedule",
} as const;

const state: SeedState = {
  code: "IA",
  slug: "iowa",
  name: "Iowa",
  fipsCode: "19",
};

const county: SeedCounty = {
  key: DES_MOINES_KEYS.county,
  slug: "polk-county",
  name: "Polk County",
  fipsCode: "19153",
};

const jurisdiction: SeedJurisdiction = {
  key: DES_MOINES_KEYS.jurisdiction,
  stateKey: DES_MOINES_KEYS.state,
  countyKey: DES_MOINES_KEYS.county,
  type: "city",
  slug: "des-moines",
  name: "Des Moines",
  officialName: "City of Des Moines — Permit and Development Center",
  websiteUrl: "https://www.dmgov.org/",
  permitPortalUrl: "https://www.dmgov.org/Departments/Pages/Permit-Development-Center.aspx",
  timezone: "America/Chicago",
  isActive: true,
};

const departments: SeedDepartment[] = [
  {
    key: "des-moines-pdc",
    jurisdictionKey: DES_MOINES_KEYS.jurisdiction,
    kind: "building",
    name: "Permit and Development Center (PDC)",
    phone: "(515) 283-4200",
    email: "pdc@dmgov.org",
    url: "https://www.dmgov.org/Departments/Pages/Permit-Development-Center.aspx",
    addressLine: "400 Robert D. Ray Drive, Des Moines, IA 50309",
    hours: "Monday – Friday, 8:00 a.m. – 5:00 p.m. CT",
    notes:
      "The PDC is the consolidated permit office serving the Building, Engineering, Fire and Planning functions; it issues building, electrical, mechanical and plumbing permits and collects the fees printed on its consolidated fee schedule.",
  },
];

const sources: SeedSource[] = [
  {
    key: DSM_PDC_SOURCE_KEY,
    jurisdictionKey: DES_MOINES_KEYS.jurisdiction,
    title:
      "Des Moines Permit and Development Center Permit Fees — New Fees 2-1-25 (4 pp.)",
    url: "https://cms2.revize.com/revize/desmoines/PDC%20Permit%20Fee%20Schedule.pdf",
    sourceType: "fee_schedule_pdf",
    issuingAuthority: "City of Des Moines — Permit and Development Center",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2025-02-01",
    effectiveFrom: DSM_FEE_EFFECTIVE_FROM,
    retrievedAt: DES_MOINES_LAST_VERIFIED,
    lastVerifiedAt: DES_MOINES_LAST_VERIFIED,
    notes:
      "Read 2026-09-26 from the City's CMS host (cms2.revize.com serves the PDF unguarded; HEAD-verified HTTP 200 application/pdf). Contains the residential flat building rows by finished floor area, the six-band commercial valuation ladder (every band printing 'or fraction thereof'), plan check 65% of the building permit fee, energy review 2% with a $21 minimum, demolition, residential trade flats ($225/$75 electrical, $200/$75 plumbing, $125/$75 mechanical) and the commercial trade base-plus-unit price lists.",
  },
  {
    key: DSM_BLDG_SOURCE_KEY,
    jurisdictionKey: DES_MOINES_KEYS.jurisdiction,
    title:
      "City of Des Moines — Building Division Permit Fee Schedule, effective 01-02-2025 (DMMC 14.01.090)",
    url:
      "https://cdnsm5-hosted.civiclive.com/UserFiles/Servers/Server_17385004/File/Departments/Planning%20and%20Building/Building%20Division/Permit%20Applications%20%26%20Information/CITY%20OF%20DES%20MOINES%20-%20BUILDING%20DIVISION%20PERMIT%20FEE%20SCHEDULE.2025.pdf",
    sourceType: "fee_schedule_pdf",
    issuingAuthority: "City of Des Moines — Building Division",
    authorityKind: "city",
    isPrimary: false,
    documentDate: "2025-01-02",
    effectiveFrom: "2025-01-02",
    retrievedAt: DES_MOINES_LAST_VERIFIED,
    lastVerifiedAt: DES_MOINES_LAST_VERIFIED,
    notes:
      "Read 2026-09-26. Prints a DIFFERENT, older valuation ladder ($121.00 to $2,000; then $24.26/$18.15/$13.55/$11.13/$9.02/$5.93 per $1,000 or fraction) plus review-fee factors (plan check 65%, Engineering 35% commercial / 20% residential, Fire 15%). Superseded by the PDC consolidated schedule for the permit amounts; kept as a dated secondary source. No figure from this document enters any total — see research/iowa/des-moines.md §3.1.",
  },
];

/** Empty on purpose: the permit types Des Moines uses already exist as shared rows. */
const permitTypes: JurisdictionSeed["permitTypes"] = [];
const projectTypes: JurisdictionSeed["projectTypes"] = [];

const jurisdictionPermitTypes: SeedJurisdictionPermitType[] = [
  {
    jurisdictionKey: DES_MOINES_KEYS.jurisdiction,
    permitTypeKey: "building",
    isAvailable: true,
    localName: "Building permit — flat area rows for dwellings, valuation ladder for commercial",
    officialUrl: "https://cms2.revize.com/revize/desmoines/PDC%20Permit%20Fee%20Schedule.pdf",
    notes:
      "Residential new construction pays flat fees by finished floor area ($1,050 / $1,350 / $1,750 for single-family; $1,300–$1,900 per unit for townhouse and two-family), with additions at $250 and renovations at $150. Commercial construction pays the six-band valuation ladder with 'or fraction thereof' round-ups, plus plan check at 65% of the permit fee for values over $1,000.",
  },
  {
    jurisdictionKey: DES_MOINES_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    isAvailable: true,
    localName: "Electrical permit — flat residential rows, base-plus-unit commercial price list",
    officialUrl: "https://cms2.revize.com/revize/desmoines/PDC%20Permit%20Fee%20Schedule.pdf",
    notes:
      "New dwellings pay $225.00 including the temporary power pole; alterations and additions pay $75.00. Commercial permits pay a $75.00 base plus unit fees — circuits at $4.00 each of the first ten then $2.00 each, openings $1.20, fixed appliances $6.50, fixtures $0.50, motors by class.",
  },
  {
    jurisdictionKey: DES_MOINES_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    isAvailable: true,
    localName: "Plumbing permit — flat residential rows, base-plus-unit commercial price list",
    officialUrl: "https://cms2.revize.com/revize/desmoines/PDC%20Permit%20Fee%20Schedule.pdf",
    notes:
      "New dwellings pay $200.00 ($75.00 for sewer and water services only), alterations $75.00. Commercial permits pay a $75.00 base plus unit fees — $7.50 per fixture, $7.50 per building sewer or domestic water service, $10.00 per 100 lineal feet or fraction of private sewer, $20.00 per grease interceptor, $50.00 per septic tank.",
  },
];

const feeSchedules: SeedFeeSchedule[] = [
  {
    key: DES_MOINES_KEYS.buildingSchedule,
    jurisdictionKey: DES_MOINES_KEYS.jurisdiction,
    sourceKey: DSM_PDC_SOURCE_KEY,
    title: "Des Moines PDC Permit Fee Schedule — building, electrical, mechanical, plumbing",
    officialUrl: "https://cms2.revize.com/revize/desmoines/PDC%20Permit%20Fee%20Schedule.pdf",
    effectiveFrom: DSM_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: DES_MOINES_LAST_VERIFIED,
    notes:
      "One consolidated schedule for all four trades, effective 2025-02-01. The Building Division's 2025-01-02 sheet is superseded for permit amounts and kept as a secondary source.",
  },
];

function attach(
  permitTypeKey: string,
  rules: SeedFeeRule["rule"][],
  scheduleKey: string,
): SeedFeeRule[] {
  return rules.map((rule) => ({
    jurisdictionKey: DES_MOINES_KEYS.jurisdiction,
    permitTypeKey,
    scheduleKey,
    rule,
  }));
}

const feeRules: SeedFeeRule[] = [
  ...attach("building", DSM_BUILDING_RULES, DES_MOINES_KEYS.buildingSchedule),
  ...attach("electrical", DSM_ELECTRICAL_RULES, DES_MOINES_KEYS.electricalSchedule),
  ...attach("plumbing", DSM_PLUMBING_RULES, DES_MOINES_KEYS.plumbingSchedule),
];

const requirements: SeedRequirement[] = [
  {
    jurisdictionKey: DES_MOINES_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "document",
    title: "Commercial permits are priced on declared total valuation",
    description:
      "The commercial ladder reads 'Total valuation of building' through six bands, each band's excess rounded up to the whole $1,000 ('or fraction thereof'). Valuation is fair market value of materials and labor as declared on the application and subject to the Building Official's review.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: DSM_PDC_SOURCE_KEY,
    lastVerifiedAt: DES_MOINES_LAST_VERIFIED,
  },
  {
    jurisdictionKey: DES_MOINES_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "Residential area excludes basement and garage",
    description:
      "The flat residential rows key on 'Total finished floor area' — 'Basement and garage areas do not contribute to this calculation.' Enter habitable above-grade area only.",
    isMandatory: true,
    sortOrder: 20,
    sourceKey: DSM_PDC_SOURCE_KEY,
    lastVerifiedAt: DES_MOINES_LAST_VERIFIED,
  },
  {
    jurisdictionKey: DES_MOINES_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "other",
    title: "The commercial base fee is only the start of the calculation",
    description:
      "The schedule's own parenthetical says the commercial electrical permit 'requires base fee plus any unit fees listed below' — circuits, openings, appliances, fixtures, motors — so a commercial permit is the $75 base plus every row the job triggers.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: DSM_PDC_SOURCE_KEY,
    lastVerifiedAt: DES_MOINES_LAST_VERIFIED,
  },
  {
    jurisdictionKey: DES_MOINES_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    requirementType: "other",
    title: "Fixture list is the schedule's own, and it is long",
    description:
      "The $7.50 fixture row's own definition runs from sink and water closet through dishwasher, ice machine, water heater, backflow preventer, water softener, grease trap, sewage ejector, roof drain and indirect waste line — count devices, not just fixtures.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: DSM_PDC_SOURCE_KEY,
    lastVerifiedAt: DES_MOINES_LAST_VERIFIED,
  },
];

const profile: SeedProfile = {
  jurisdictionKey: DES_MOINES_KEYS.jurisdiction,
  headline: "What construction permits cost in Des Moines",
  summary:
    "Des Moines prices construction out of **one consolidated Permit and Development Center schedule** (effective February 1, 2025). New dwellings pay flat fees by finished floor area — $1,050 to $1,750 for single-family, $1,300 to $1,900 per unit for townhouse and two-family — while commercial construction pays a six-band valuation ladder that rounds each excess $1,000 up ('or fraction thereof') and adds plan check at 65% of the permit fee. Trade permits are flat for dwellings ($225 new-construction electrical, $200 plumbing) and base-plus-unit price lists for commercial work.",
  localContext:
    "The Permit and Development Center at 400 Robert D. Ray Drive is the single office that issues building, electrical, mechanical and plumbing permits in Des Moines, and its consolidated fee schedule — 'New Fees 2-1-25' — carries every amount this site charges. A second City document, the Building Division's schedule effective January 2, 2025 under DMMC 14.01.090, prints an older valuation ladder with different rates; the PDC schedule is the newer instrument and the Division sheet is recorded as a superseded secondary source (the conflict and the resolution are in the research record).\n\nThe residential rows do not read valuation at all: a new single-family dwelling is priced by total finished floor area, with basements and garages explicitly excluded from the measurement, and additions ($250) and renovations ($150) are flat regardless of cost. The commercial ladder is the opposite — valuation through six bands, the excess in each rounded up to the whole $1,000 — and plan check rides on top at 65% of the computed permit fee for buildings valued over $1,000, with a separate energy review of 2% (minimum $21) for heated or cooled enclosed space.\n\nTrade permits split the same way. A new dwelling's electrical permit is $225 including the temporary power pole and its plumbing permit is $200; alterations to existing dwellings are $75 per trade. Commercial trade permits are the schedule's price lists: a $75 base plus unit fees for circuits ($4 the first ten, $2 through the hundredth, $1.50 beyond), openings ($1.20), fixtures ($7.50 plumbing), and per-100-foot pipe runs ($10 or fraction).",
  valuationBasis:
    "Two bases, on two sides of the same schedule. **Residential building rows read area** — total finished floor area, basements and garages excluded — and pay flat amounts; additions and renovations are flat whatever they cost. **Commercial building rows read valuation** — total value of the building — through six bands whose excess thousands round up. **Plan check reads the permit fee** (65% of it, commercial, over $1,000 of value), and **energy review reads the permit fee again** at 2% with a $21 floor. **Commercial trade permits read counts**: circuits, openings, appliances, fixtures, service connections, grease interceptors, and 100-foot blocks of private sewer pipe — so a commercial trade total never moves because the job got more expensive, only because it got bigger.",
  notIncluded:
    "These figures are Des Moines PDC's own permit amounts for building, electrical and plumbing work. They are not a project cost, and they exclude:\n\n- **Mechanical permits.** The residential rows ($125 new dwellings, $75 fireplace-only, $75 alterations) and the commercial base-plus-unit list (furnaces $15, boiler $10 + $3 per 100,000 BTU/Hr or portion, cooling $15, dampers, hoods, gas outlets) are read and recorded in the research file without a page in this pass.\n- **Demolition permits.** $50 per dwelling or accessory building, $250 conventional, $500 with explosives, plus $75 sewer/water disconnects — flat rows without rules in this pass.\n- **Right-of-way obstruction permits** ($20/month plus per-100-square-foot tiers), wireless towers ($3,000 new / $500 alteration), permit extensions, reinstatements, overtime inspections and temporary certificates of occupancy — event or administrative fees outside the permit calculation.\n- **Engineering and Fire review factors.** The Building Division's superseded sheet factors Engineering at 35% commercial / 20% residential and Fire at 15%; the consolidated PDC schedule prints only the 65% plan check, which is what these pages charge.\n- **The 2.7%-style payment-channel and other utility fees** charged by other City offices.",
  seoTitle: "Des Moines construction permit fees — PDC schedule",
  seoDescription:
    "How Des Moines prices construction permits: flat area-based dwelling fees ($1,050–$1,750), a six-band commercial valuation ladder, 65% plan check, and flat vs unit-priced trade permits under the PDC schedule effective Feb 1, 2025.",
  publishStatus: "published",
  noindex: false,
  lastReviewedAt: DES_MOINES_LAST_VERIFIED,
};

const permitPages: SeedPermitPage[] = [
  {
    jurisdictionKey: DES_MOINES_KEYS.jurisdiction,
    permitTypeKey: "building",
    slug: "building-permit-cost",
    title: "Des Moines building permit cost",
    intro:
      "A Des Moines building permit is priced by **which side of the Permit and Development Center's schedule answers the job**. New single-family dwellings pay a flat fee by finished floor area — **$1,050.00 up to 1,200 sq ft, $1,350.00 from 1,201 to 2,000, $1,750.00 above** — with basements and garages excluded from the measurement, and additions ($250.00) and renovations ($150.00) flat whatever they cost. Commercial construction pays a **six-band valuation ladder** that rounds the excess up to the whole $1,000 in every band ('or fraction thereof'), plus a **plan checking fee of 65% of the permit fee** for buildings valued over $1,000 and an **energy review of 2%** (minimum $21.00) for heated or cooled space.",
    localSummary:
      "The flat residential rows mean a bigger *budget* never changes a dwelling's building permit — only finished floor area does, and only in three bands. The commercial ladder is the opposite: every band's excess is rounded up to the whole $1,000, so $50,001 of valuation pays the $50,000 band's base plus a full $6.44 step for the single dollar.\n\nThe plan check's own words scope it to buildings 'with value greater than $1,000.00', and it sits in the commercial block of the schedule; the residential flat rows carry no plan-check percentage, so this site charges the 65% on commercial permits only.\n\nDes Moines publishes two City fee documents: the PDC's consolidated 'New Fees 2-1-25' and the Building Division's older 01-02-2025 sheet, whose valuation ladder differs. These pages charge the PDC schedule — the newer, consolidated instrument — and the older document is recorded as superseded in the research file.",
    notIncluded:
      "This is the PDC's building permit fee — the residential flat rows or the commercial ladder, plus the plan check and energy review when the schedule's own conditions apply. It excludes:\n\n- **Mechanical, electrical and plumbing trade permits**, priced separately on their own pages.\n- **Demolition** ($50 dwelling / $250 conventional / $500 explosives) and sewer/water disconnects ($75).\n- **Right-of-way obstruction permits, wireless towers, permit extensions and reinstatements, overtime inspections and temporary certificates of occupancy** — administrative or event fees.\n- **Engineering (35%/20%) and Fire (15%) review factors** from the superseded Building Division sheet — the consolidated schedule prints no such factors and neither does this total.",
    workedExample: {
      scenario:
        "A new commercial build-out in Des Moines with a declared total valuation of $52,500 — no energy review selected.",
      inputs: {
        valuationCents: 5_250_000,
        occupancy: "commercial",
      },
      notes:
        "Two lines — the band row and the plan check — total **$799.13**.\n\nBand 3: $52,500 falls in 'More than $50,000 but no more than $100,000'. The band base is $465.00 and the excess is $2,500 — three whole $1,000 steps ('or fraction thereof') at $6.44, $19.32. Band total: $465.00 + $19.32 = $484.32.\n\nPlan check: 65% of the building permit fee, charged in addition — 0.65 × $484.32 = $314.808, which rounds to $314.81.\n\nTotal: $484.32 + $314.81 = **$799.13**. The plan check is a charge, not a credit: the schedule lists it under 'Other associated fees' beside the permit fee, so both lines land in this total.\n\nWhat moves it: $50,000 of valuation exactly pays $465.00 with no steps; $50,001 already rounds up to a full step. A residential version of the same job would pay a flat $150 renovation or $250 addition row regardless of cost, and no plan check.",
    },
    faqs: [
      {
        question: "How much is a building permit for a new house in Des Moines?",
        answer:
          "It is a flat fee based on total finished floor area, with basements and garages excluded: $1,050.00 up to 1,200 sq ft, $1,350.00 from 1,201 to 2,000 sq ft, and $1,750.00 above 2,000 sq ft. New townhouses and two-family dwellings pay per unit — $1,300, $1,500 or $1,900 by the same three area bands.",
        sourceId: DSM_PDC_SOURCE_KEY,
      },
      {
        question: "How is a commercial building permit calculated?",
        answer:
          "From total valuation through six bands: $64.38 under $2,000; $64.38 + $9.06 per additional $1,000 or fraction to $25,000; $271.88 + $7.75 to $50,000; $465 + $6.44 to $100,000; $786.88 + $3.88 to $500,000; $2,331.25 + $2.63 above. Every band's excess rounds up to the whole $1,000.",
        sourceId: DSM_PDC_SOURCE_KEY,
      },
      {
        question: "Does Des Moines charge a plan review fee?",
        answer:
          "Yes — a Plan Checking Fee of 65% of the building permit fee applies to buildings with value greater than $1,000. It appears in the commercial block of the PDC schedule; the residential flat-fee rows print no plan-check percentage. There is also an energy review fee of 2% of the permit fee (minimum $21.00) for buildings with enclosed heated or cooled space.",
        sourceId: DSM_PDC_SOURCE_KEY,
      },
      {
        question: "Which fee schedule is in force — the PDC's or the Building Division's?",
        answer:
          "The Permit and Development Center's consolidated schedule ('New Fees 2-1-25', effective February 1, 2025). The Building Division's separate sheet effective January 2, 2025 (DMMC 14.01.090) prints an older valuation ladder with different rates; this site charges the PDC figures and records the Division document as superseded.",
        sourceId: DSM_PDC_SOURCE_KEY,
      },
      {
        question: "What does an addition or remodel cost to permit?",
        answer:
          "Additions to dwellings are $250.00 and renovations to dwellings are $150.00 — flat, regardless of project value. New detached sheds and garages are $175.00, and decks, fences, retaining walls, swimming pools, hot tubs and other accessory structures are $75.00.",
        sourceId: DSM_PDC_SOURCE_KEY,
      },
      {
        question: "What is the minimum commercial building permit fee?",
        answer:
          "The smallest printed amount is $64.38 for commercial work valued under $2,000 — the schedule states no other minimum for the ladder, and the first band's base is the floor the arithmetic lands on.",
        sourceId: DSM_PDC_SOURCE_KEY,
      },
    ],
    seoTitle: "Des Moines building permit cost: flat dwelling fees, valuation ladder",
    seoDescription:
      "Des Moines building permit fees — $1,050–$1,750 flat for new dwellings by area, $250 additions, commercial valuation ladder with round-ups, 65% plan check, and 2% energy review under the PDC schedule.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: DES_MOINES_LAST_VERIFIED,
  },
  {
    jurisdictionKey: DES_MOINES_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    slug: "electrical-permit-cost",
    title: "Des Moines electrical permit cost",
    intro:
      "A Des Moines electrical permit is **flat for dwellings and unit-priced for everything else**. New dwellings — temporary power pole included — pay **$225.00**; alterations and additions to existing dwellings and accessory structures pay **$75.00**. Commercial permits pay a **$75.00 base fee plus any unit fees the job triggers**: circuits at $4.00 each of the first ten (including feeders), $2.00 each from the eleventh through the hundredth, $1.50 beyond; openings added to existing circuits at $1.20; fixed appliances at $6.50; fixtures at $0.50; motors by class.",
    localSummary:
      "The schedule's own parenthetical does the work: the commercial base fee is only the start — the 'Electrical Permit requires base fee plus any unit fees listed below', so a 30-circuit fit-out is $75.00 base + $40.00 (first ten) + $40.00 (twenty more at $2.00), not a flat $75.00.\n\nThe residential rows are scope-priced, not size-priced: a $500 panel swap and a $50,000 rewiring of an existing dwelling are the same $75.00 alteration permit, and a new home's $225.00 covers the temporary construction power pole as well — the schedule says so in its own parenthesis.\n\nAll of this sits in the PDC's consolidated schedule effective February 1, 2025; the trade rows did not exist in the superseded Building Division sheet's form.",
    notIncluded:
      "This is the PDC's electrical permit fee. It excludes:\n\n- **The building permit and its plan check**, priced separately on the building page.\n- **Commercial motors and kilowatt rows** (baseboard heat $0.75/kW, motors by horsepower class, starting permit $50.00, deenergization $15.00) — unit rows recorded in the research file without rules in this pass.\n- **Meter settings** ($10.00 first, $5.00 each additional) — a unit row recorded but not charged by this calculator.\n- **Mechanical and plumbing permits**, priced on their own pages.",
    workedExample: {
      scenario:
        "A commercial tenant finish-out: 30 circuits including feeders, 12 openings added to existing circuits, 4 fixed appliances.",
      inputs: {
        occupancy: "commercial",
        valuationCents: 2_000_000,
        custom: {
          circuits: 30,
          openings: 12,
          special_devices: 4,
        },
      },
      notes:
        "Four lines — **$195.40**.\n\nBase: $75.00, on every commercial electrical permit.\n\nCircuits: the first ten are inside a $40.00 allowance at $4.00 each; circuits 11–30 are twenty more at $2.00 — $40.00. Circuit total $80.00.\n\nOpenings: 12 × $1.20 = $14.40.\n\nFixed appliances: 4 × $6.50 = $26.00.\n\nTotal: $75.00 + $80.00 + $14.40 + $26.00 = **$195.40**. The residential comparison: the same scope inside an existing dwelling is a flat $75.00 alteration permit — the flat-vs-unit-priced split is the schedule's own.",
    },
    faqs: [
      {
        question: "How much is an electrical permit for a new house in Des Moines?",
        answer:
          "$225.00 flat — and the schedule's own parenthesis includes the temporary power pole in that amount. The fee covers the electrical installations associated with the construction of the new dwelling.",
        sourceId: DSM_PDC_SOURCE_KEY,
      },
      {
        question: "What about electrical work on an existing home?",
        answer:
          "$75.00. 'Electrical permit for electrical installations associated with alterations and additions to existing dwellings and accessory structures: $75.00' — flat regardless of the project's value.",
        sourceId: DSM_PDC_SOURCE_KEY,
      },
      {
        question: "How are commercial electrical permits priced?",
        answer:
          "A $75.00 base fee 'plus any unit fees listed below': $4.00 per circuit for the first ten (including feeders), $2.00 for circuits 11–100 and $1.50 beyond 100; $1.20 per opening added to existing circuits; $6.50 per fixed appliance; $0.50 per fixture; motors, baseboard kilowatts and meter settings at their own unit rates.",
        sourceId: DSM_PDC_SOURCE_KEY,
      },
      {
        question: "Are feeders counted as circuits?",
        answer:
          "Yes — the schedule's own words: 'Circuits; First ten circuits, including feeders, each $4.00.' Feeders count in the circuit total, so a permit with six branch circuits and four feeders has used up its ten at the $4.00 rate.",
        sourceId: DSM_PDC_SOURCE_KEY,
      },
      {
        question: "Do I pay more if my electrical project costs more?",
        answer:
          "Only on the commercial side, and only indirectly: the base fee and unit fees are priced by counts (circuits, openings, appliances), not by declared value. A bigger commercial job costs more because it has more circuits and devices, not because it is worth more.",
        sourceId: DSM_PDC_SOURCE_KEY,
      },
      {
        question: "Who issues electrical permits in Des Moines?",
        answer:
          "The Permit and Development Center, the City's consolidated permit office at 400 Robert D. Ray Drive, which issues building, electrical, mechanical and plumbing permits under one schedule and one counter.",
        sourceId: DSM_PDC_SOURCE_KEY,
      },
    ],
    seoTitle: "Des Moines electrical permit cost: $225 new dwellings, unit-priced commercial",
    seoDescription:
      "Des Moines electrical permit fees — $225.00 flat for new dwellings (temp pole included), $75.00 alterations, and a $75 commercial base plus per-circuit, per-opening and per-appliance unit fees.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: DES_MOINES_LAST_VERIFIED,
  },
  {
    jurisdictionKey: DES_MOINES_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    slug: "plumbing-permit-cost",
    title: "Des Moines plumbing permit cost",
    intro:
      "A Des Moines plumbing permit is **flat for dwellings and base-plus-unit for commercial work**. New dwellings pay **$200.00**; sewer and water services only, for new dwellings, pay **$75.00**; alterations and additions to existing dwellings and accessory structures pay **$75.00**. Commercial permits pay a **$75.00 base plus any unit fees the job triggers** — $7.50 per plumbing fixture (the schedule's own list runs from water closets to grease traps), $7.50 per building sewer or domestic water service, $10.00 per 100 lineal feet or fraction of private sewer, $50.00 per septic tank and $20.00 per grease interceptor.",
    localSummary:
      "The fixture row's own definition is the widest in Iowa's schedules this site has read: it names sink, tub, urinal, drain, water closet, lavatory, dishwasher, vacuum breaker, condensate drain, ice machine, automatic water heater, automatic washer drain, drinking fountain, garbage disposal, backflow preventer, water softener, soda fountain, dental chair, sewage ejector, bar opening, grease trap, boiler blow tank, garage wash rack, settling basin, roof drain, catchbasin, wet standpipe outlet and indirect waste line — so a commercial permit's fixture count is devices, not just fixtures.\n\nThe 100-foot pipe rows carry 'or fraction thereof': a 210-foot private sewer run buys three whole 100-foot blocks at $10.00 — $30.00, not $21.00.\n\nThe residential 'services only' row exists as its own line: a new dwelling whose plumbing permit covers nothing but the sewer and water services pays $75.00 instead of $200.00 — the schedule's own scope split.",
    notIncluded:
      "This is the PDC's plumbing permit fee. It excludes:\n\n- **Interior water piping openings** ($1.50 per fixture served) and **water service (fire) / private water main runs** ($10.00 per 100 lf) — unit rows recorded in the research file without rules in this pass.\n- **Gas piping** ($4.00 per outlet for the first four, $2.00 after) — priced on the mechanical side of the schedule.\n- **Reconstruction of each drain, stack or vent line** ($7.50) — a unit row recorded but not charged by this calculator.\n- **Sewer/water disconnects for demolition** ($75.00) and the building permit itself.",
    workedExample: {
      scenario:
        "A restaurant build-out: 24 plumbing fixtures, one building sewer service, one domestic water service, one grease interceptor, and a 210-foot private sewer lateral.",
      inputs: {
        occupancy: "commercial",
        fixtures: 24,
        custom: {
          connections: 1,
          water_service_connections: 1,
          grease_interceptors: 1,
          linear_feet: 210,
        },
      },
      notes:
        "Six lines — **$320.00**.\n\nBase: $75.00, on every commercial plumbing permit.\n\nFixtures: 24 × $7.50 = $180.00 — and the schedule's fixture list includes the grease trap and the indirect waste line, so count devices when declaring.\n\nBuilding sewer service: $7.50. Domestic water service: $7.50.\n\nGrease interceptor: $20.00.\n\nPrivate sewer: 210 lineal feet is 'per 100 lineal feet or fraction thereof' — three whole blocks at $10.00 = $30.00.\n\nTotal: $75.00 + $180.00 + $7.50 + $7.50 + $20.00 + $30.00 = **$320.00**. The same restaurant would also pay the electrical permit's own rows on the electrical page.",
    },
    faqs: [
      {
        question: "How much is a plumbing permit for a new house in Des Moines?",
        answer:
          "$200.00 for the plumbing installations associated with the construction of the new dwelling. If the permit covers nothing but the sewer and water services, it is $75.00 — the schedule prices 'services only' as its own row.",
        sourceId: DSM_PDC_SOURCE_KEY,
      },
      {
        question: "What does a plumbing permit for a remodel cost?",
        answer:
          "$75.00 — 'Plumbing permit for plumbing installations associated with alterations and additions to existing dwellings and accessory structures: $75.00', flat regardless of the project's value.",
        sourceId: DSM_PDC_SOURCE_KEY,
      },
      {
        question: "How are commercial plumbing permits priced?",
        answer:
          "A $75.00 base fee plus unit fees: $7.50 per plumbing fixture (the schedule's own list runs from water closets and urinals to water heaters, backflow preventers, grease traps, sewage ejectors, roof drains and indirect waste lines), $7.50 per building sewer or domestic water service, $10.00 per 100 lineal feet or fraction of private sewer, $50.00 per septic tank, $20.00 per grease interceptor, and $4.00 per gas outlet for the first four.",
        sourceId: DSM_PDC_SOURCE_KEY,
      },
      {
        question: "Is a water heater a 'fixture' for the fee?",
        answer:
          "Yes on the commercial price list — the fixture row's own text includes 'automatic water heater', along with dishwashers, ice machines, water softeners and garbage disposals. Count each device the schedule names.",
        sourceId: DSM_PDC_SOURCE_KEY,
      },
      {
        question: "How is a long sewer lateral charged?",
        answer:
          "At $10.00 per 100 lineal feet or fraction thereof: 210 feet is three whole blocks, $30.00. The 'or fraction' phrase rounds a partial block up, so 101 feet and 200 feet cost the same $20.00.",
        sourceId: DSM_PDC_SOURCE_KEY,
      },
      {
        question: "Where do I apply for a plumbing permit in Des Moines?",
        answer:
          "The Permit and Development Center at 400 Robert D. Ray Drive — the consolidated office that issues building, electrical, mechanical and plumbing permits under the same fee schedule.",
        sourceId: DSM_PDC_SOURCE_KEY,
      },
    ],
    seoTitle: "Des Moines plumbing permit cost: $200 new dwellings, unit-priced commercial",
    seoDescription:
      "Des Moines plumbing permit fees — $200.00 flat for new dwellings ($75 services-only or alterations) and a $75 commercial base plus $7.50 fixtures, per-connection charges and $10 per 100 lf of private sewer.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: DES_MOINES_LAST_VERIFIED,
  },
];

const verifications: SeedVerification[] = [
  {
    entityType: "fee_schedule",
    entityKey: DES_MOINES_KEYS.buildingSchedule,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: DES_MOINES_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: DSM_PDC_SOURCE_KEY,
    notes:
      "Read from the PDC PDF served by the City's CMS host; both residential flat rows and the commercial ladder transcribed and cross-checked against the plan-check and energy-review factors.",
  },
  {
    entityType: "jurisdiction_profile",
    entityKey: DES_MOINES_KEYS.jurisdiction,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: DES_MOINES_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: DSM_PDC_SOURCE_KEY,
    notes:
      "Authority confirmed as the Permit and Development Center; the Building Division's 2025-01-02 sheet recorded as superseded for permit amounts.",
  },
  {
    entityType: "permit_page",
    entityKey: "building-permit-cost",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: DES_MOINES_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: DSM_PDC_SOURCE_KEY,
    notes: "Worked example reproduces the band-3 arithmetic and the 65% plan check.",
  },
  {
    entityType: "permit_page",
    entityKey: "electrical-permit-cost",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: DES_MOINES_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: DSM_PDC_SOURCE_KEY,
    notes: "Worked example reproduces the base-plus-unit arithmetic for 30 circuits.",
  },
  {
    entityType: "permit_page",
    entityKey: "plumbing-permit-cost",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: DES_MOINES_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: DSM_PDC_SOURCE_KEY,
    notes: "Worked example reproduces fixture, connection, interceptor and pipe-run rows.",
  },
];

export const desMoinesSeed: JurisdictionSeed = {
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
