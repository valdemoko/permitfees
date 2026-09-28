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
  GREEN_BAY_COMMERCIAL_SOURCE_KEY,
  GREEN_BAY_ELEC_APPLICATION_SOURCE_KEY,
  GREEN_BAY_ELECTRICAL_BASE_RULES,
  GREEN_BAY_FEE_EFFECTIVE_FROM,
  GREEN_BAY_FEE_SCHEDULE_SOURCE_KEY,
  GREEN_BAY_GUIDES_SOURCE_KEY,
  GREEN_BAY_PLUMBING_BASE_RULES,
  GREEN_BAY_PROCESS_SOURCE_KEY,
  GREEN_BAY_RESIDENTIAL_SOURCE_KEY,
  GREEN_BAY_BUILDING_BASE_RULES,
  GREEN_BAY_MECHANICAL_BASE_RULES,
} from "./fee-rules";

export * from "./fee-rules";

/**
 * The complete Green Bay, Wisconsin seed payload.
 *
 * Every figure traces to research/wisconsin/green-bay.md, which traces to the City's
 * consolidated ordinance-keyed Fee Schedule PDF — column headed "2026 Fee", dated
 * January 1, 2026 by the City's own permit-guides page — and to the permit pages and
 * application form that restate its rules. Nothing is estimated.
 *
 * Three pages, all published: building, electrical and plumbing. Green Bay is the
 * dataset's **matrix jurisdiction**: one schedule, four trades, every trade split three
 * ways by what the building is and then by scope, so the same question ("what does a
 * permit cost?") has three right answers before any scope is named. It contributes the
 * first per-unit row in the dataset with both a floor and a ceiling (the fire sprinkler
 * clamp), and the first schedule that offers two alternative ways to price one trade
 * (commercial electrical: area rates or a project-cost ladder) and lets the applicant's
 * basis choose.
 *
 * The county row records **Brown County**. The Inspection Division issues permits
 * citywide, so the county is a locator rather than an authority.
 */

const RESEARCHER = "Permit Fee Intelligence research pass 15 (Wisconsin)";

export const GREEN_BAY_LAST_VERIFIED = "2026-09-25";

export const GREEN_BAY_KEYS = {
  state: "wi",
  county: "brown-county",
  jurisdiction: "green-bay",
  feeSchedule: "green-bay-fee-schedule-2026",
} as const;

const state: SeedState = {
  code: "WI",
  slug: "wisconsin",
  name: "Wisconsin",
  fipsCode: "55",
};

const county: SeedCounty = {
  key: GREEN_BAY_KEYS.county,
  slug: "brown-county",
  name: "Brown County",
  fipsCode: "55009",
};

const jurisdiction: SeedJurisdiction = {
  key: GREEN_BAY_KEYS.jurisdiction,
  stateKey: GREEN_BAY_KEYS.state,
  countyKey: GREEN_BAY_KEYS.county,
  type: "city",
  slug: "green-bay",
  name: "Green Bay",
  officialName: "City of Green Bay",
  websiteUrl: "https://www.greenbaywi.gov/",
  permitPortalUrl: "https://www.greenbaywi.gov/312/Building-Permits-Inspections",
  timezone: "America/Chicago",
  isActive: true,
};

const departments: SeedDepartment[] = [
  {
    key: "green-bay-inspection-division",
    jurisdictionKey: GREEN_BAY_KEYS.jurisdiction,
    kind: "building",
    name: "Green Bay Building Permits & Inspections (Community & Economic Development)",
    phone: "(920) 448-3300",
    email: null,
    url: "https://www.greenbaywi.gov/312/Building-Permits-Inspections",
    addressLine: "100 North Jefferson Street, Green Bay, WI 54301",
    hours: null,
    notes:
      "The Inspection Division issues every permit this site prices for Green Bay — building, electrical, HVAC and plumbing — and its consolidated fee schedule is the single instrument behind all three pages. Inspections are scheduled by online request form or by phone; the pages repeat, trade by trade, that no inspection can be scheduled until the permit and fee are received. The division also verifies State of Wisconsin dwelling contractor credentials before issuing a one- or two-family permit, which the State requires cities to check.",
  },
];

const sources: SeedSource[] = [
  {
    key: GREEN_BAY_FEE_SCHEDULE_SOURCE_KEY,
    jurisdictionKey: GREEN_BAY_KEYS.jurisdiction,
    title: "City of Green Bay Fee Schedule (PDF) — Chapter 8, Buildings and construction",
    url: "https://www.greenbaywi.gov/DocumentCenter/View/944/City-of-Green-Bay-Fee-Schedule-PDF",
    sourceType: "fee_schedule_pdf",
    issuingAuthority: "City of Green Bay",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: GREEN_BAY_FEE_EFFECTIVE_FROM,
    retrievedAt: GREEN_BAY_LAST_VERIFIED,
    lastVerifiedAt: GREEN_BAY_LAST_VERIFIED,
    notes:
      'Read 2026-09-25 as a 309,782-byte PDF with three columns — "Code Section", "Description", "2026 Fee" — and ordinance sections keyed in the margin (8-47 plan approval, 8-360 building and plumbing permits, 8-369 private wells, 8-449 electrical reinspections, 8-451 electrical permits, 8-478 mechanical permits). Extracted three ways: -layout mispairs columns exactly as Boston\'s sheet did (water heater handed the lawn sprinkler amount, the commercial section offset by a row), -raw scrambles the same tail, and -table pairs every row cleanly — that transcription is the one this site uses. The fee column is headed "2026 Fee"; the permit-guides page dates it to January 1, 2026.',
  },
  {
    key: GREEN_BAY_GUIDES_SOURCE_KEY,
    jurisdictionKey: GREEN_BAY_KEYS.jurisdiction,
    title: "Permit Guides, Forms & Fees — the page that dates the schedule",
    url: "https://www.greenbaywi.gov/313/Permit-Guides-Forms-Fees",
    sourceType: "municipal_website",
    issuingAuthority: "City of Green Bay — Building Permits & Inspections",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: GREEN_BAY_LAST_VERIFIED,
    lastVerifiedAt: GREEN_BAY_LAST_VERIFIED,
    notes:
      'Read 2026-09-25 for the effective date — "Permit fees listed in the guides go into effect January 1, 2026" — and for the fee schedule link under "Fees and Payments", which is how the schedule was tied to this division. The page also carries the permit guides (deck, garage, new home UDC, raze, tent, generator), the homeowner and contractor application PDFs for each trade, and the note that permit processing takes about a week once a complete application is received.',
  },
  {
    key: GREEN_BAY_RESIDENTIAL_SOURCE_KEY,
    jurisdictionKey: GREEN_BAY_KEYS.jurisdiction,
    title: "Residential Permits — contractor rules trade by trade",
    url: "https://www.greenbaywi.gov/322/Residential-Permits",
    sourceType: "municipal_website",
    issuingAuthority: "City of Green Bay — Building Permits & Inspections",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: GREEN_BAY_LAST_VERIFIED,
    lastVerifiedAt: GREEN_BAY_LAST_VERIFIED,
    notes:
      'Read 2026-09-25 for the owner-occupant rules the schedule does not carry: the owner of an existing single-family dwelling where they reside may pull each trade\'s permit for that dwelling; rental work is licensed-contractor-only; a contractor needs the State\'s Dwelling Contractor Certification and Qualifier Certification, which the City must verify before issuing; electrical services and all other wiring must be done by a Green Bay-licensed electrical contractor; a DIY electrician must meet an inspector with a floor plan and answer basic wiring questions; plumbing contractors must be Wisconsin master plumbers; and water heater replacement is named on the plumbing page as permitted work.',
  },
  {
    key: GREEN_BAY_COMMERCIAL_SOURCE_KEY,
    jurisdictionKey: GREEN_BAY_KEYS.jurisdiction,
    title: "Commercial Permits — who may apply, and the SPS 382.21 witnessing rule",
    url: "https://www.greenbaywi.gov/321/Commercial-Permits",
    sourceType: "municipal_website",
    issuingAuthority: "City of Green Bay — Building Permits & Inspections",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: GREEN_BAY_LAST_VERIFIED,
    lastVerifiedAt: GREEN_BAY_LAST_VERIFIED,
    notes:
      'Read 2026-09-25: building permits may be taken by contractor, tenant or owner; electrical work requires a State-licensed firm; and "In the past, the City of Green Bay had required HVAC contractors to obtain licensing through the City, but that requirement is no longer in effect" — state licence only. The page\'s "PLUMBING INSPECTION UPDATE EFFECTIVE OCTOBER 1, 2021" dates the SPS 382.21 test-and-witness procedure for sanitary sewers and interior DWV, a procedure rather than a fee.',
  },
  {
    key: GREEN_BAY_PROCESS_SOURCE_KEY,
    jurisdictionKey: GREEN_BAY_KEYS.jurisdiction,
    title: "Permitting Process — the penalty, the two application forms, and the queue",
    url: "https://www.greenbaywi.gov/315/Permitting-Process",
    sourceType: "municipal_website",
    issuingAuthority: "City of Green Bay — Community & Economic Development",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: GREEN_BAY_LAST_VERIFIED,
    lastVerifiedAt: GREEN_BAY_LAST_VERIFIED,
    notes:
      'Read 2026-09-25 for the penalty — "Failure to obtain a building permit may result in the doubling of permit fees, a municipal citation of over $500, and the work ordered redone or removed if in non-compliance" — and for the application structure: a short form for driveway expansions, yard sheds, fences and patios, a long form for everything else, all commercial projects on the long form, all trades\' permits submitted with the building permit application, estimated project cost and all contractors\' state credential numbers required, and a Certificate of Appropriateness from the Landmarks Commission for listed historic properties.',
  },
  {
    key: GREEN_BAY_ELEC_APPLICATION_SOURCE_KEY,
    jurisdictionKey: GREEN_BAY_KEYS.jurisdiction,
    title: "Licensed Contractor Electrical Permit Application (PDF) — occupancy boxes and the generator fee",
    url: "https://www.greenbaywi.gov/DocumentCenter/View/946/Licensed-Contractor-Electrical-Permit-Application-PDF",
    sourceType: "permit_portal",
    issuingAuthority: "City of Green Bay — Building Permits & Inspections",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: GREEN_BAY_LAST_VERIFIED,
    lastVerifiedAt: GREEN_BAY_LAST_VERIFIED,
    notes:
      'Read 2026-09-25 as a 1,014,525-byte PDF. Two facts come from this form and nowhere else: the occupancy boxes — "Single-Family / Two-Family / Multi-Family / Commercial / Educational / Manufacturing / Other" plus "Number of Units" — which are what make the schedule\'s three property classes a reader\'s choice, and the generator fee — "JOB DESCRIPTION: *$150 permit fee", asterisked against the "Generator *see below" checkbox — the only generator price the City publishes. The form also carries the "Value of work" field the commercial cost ladder reads, and the contractor statement requiring State electrical contractor and master certifications.',
  },
];

/** Empty on purpose: the permit types Green Bay uses already exist as shared rows. */
const permitTypes: JurisdictionSeed["permitTypes"] = [];
const projectTypes: JurisdictionSeed["projectTypes"] = [];

const jurisdictionPermitTypes: SeedJurisdictionPermitType[] = [
  {
    jurisdictionKey: GREEN_BAY_KEYS.jurisdiction,
    permitTypeKey: "building",
    isAvailable: true,
    localName: "Building permit — new construction per square foot by property class and group",
    officialUrl: "https://www.greenbaywi.gov/312/Building-Permits-Inspections",
    notes:
      "The schedule prices new construction per square foot — $0.01 in a one- or two-family dwelling, $0.14 in multi-family, $0.07 or $0.14 in commercial by building group — with flat rows beside it: windows/doors $75.00 residential-only, raze/demolish $75/$100/$100 by class. The plan-approval fees of §8-47 ($75/$125 principal-use) are application-stage charges on the same sheet, separate from the permit fees. Failure to obtain a permit doubles the fee, per the City's permitting-process page.",
  },
  {
    jurisdictionKey: GREEN_BAY_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    isAvailable: true,
    localName: "Electrical permit — area rates by class, or a project-cost ladder for commercial work",
    officialUrl: "https://www.greenbaywi.gov/321/Commercial-Permits",
    notes:
      "The general electrical system is priced per square foot — $0.05 residential, $0.09 multi-family, $0.05/$0.09 commercial by group — with a service row ($50.00 residential; $100.00 initial plus $50.00 each additional, multi-family) and an air conditioning addition at $75.00/$100.00 per unit. The commercial section offers a second way to price a job: a project-cost ladder, $100.00 to $600.00 over six bands plus $100.00 per $100,000 above $300,000, which replaces the area rates wherever the application prices from value. The generator's $150.00 is published on the City's own application form, not in the schedule. Reinspections of electrical wiring are $75.00.",
  },
  {
    jurisdictionKey: GREEN_BAY_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    isAvailable: true,
    localName: "Plumbing permit — per fixture by class, with the clamped sprinkler row",
    officialUrl: "https://www.greenbaywi.gov/322/Residential-Permits",
    notes:
      "General plumbing is $7.00 per fixture in a one- or two-family dwelling and $8.00 in multi-family and commercial, charged from the first fixture with no allowance. Water heater replacement is $50.00 residential and $100.00 above it. The fire suppression row is the dataset's first per-unit fee with both a floor and a ceiling: $2.50 per head, $70.00 minimum, up to $200.00 — the schedule's own parenthetical, charged as the rule's own bounds. Connection rows (water, sanitary, storm at $50.00), Palmer valve, back water valve and lawn sprinkler RPV are external-work permits named on the page rather than charged.",
  },
  {
    jurisdictionKey: GREEN_BAY_KEYS.jurisdiction,
    permitTypeKey: "mechanical",
    isAvailable: true,
    localName: "Mechanical (HVAC) permit — area rates by class, with the commercial split by system kind",
    officialUrl: "https://www.greenbaywi.gov/322/Residential-Permits",
    notes:
      "The general HVAC system is priced per square foot — $0.05 in a one- or two-family dwelling, $0.09 in multi-family, and commercially $0.05 for ductless unit-heater systems against $0.09 for ducted or hydronic work, the one area rate the schedule splits by what the system is rather than by what the building is. Beside it: heating unit replacement $75.00 residential and $100.00 above it, and air conditioning additions at $75.00/$100.00 per unit rather than per ton. The municipal HVAC licence requirement 'is no longer in effect' — the one trade the City relaxed — leaving the State of Wisconsin licence only.",
  },
];

const feeSchedules: SeedFeeSchedule[] = [
  {
    key: GREEN_BAY_KEYS.feeSchedule,
    jurisdictionKey: GREEN_BAY_KEYS.jurisdiction,
    sourceKey: GREEN_BAY_FEE_SCHEDULE_SOURCE_KEY,
    title: "City of Green Bay Fee Schedule — Chapter 8 (2026 fee column)",
    officialUrl:
      "https://www.greenbaywi.gov/DocumentCenter/View/944/City-of-Green-Bay-Fee-Schedule-PDF",
    effectiveFrom: GREEN_BAY_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: GREEN_BAY_LAST_VERIFIED,
    notes:
      "One schedule covers all four trades, split three ways by property class. Its fee column is headed '2026 Fee' and the City's permit-guides page dates it: 'Permit fees listed in the guides go into effect January 1, 2026' — a real enactment date carried as the schedule's effectiveFrom rather than a read date. No later revision was found on this pass.",
  },
];

function attach(permitTypeKey: string, rules: FeeRuleRecord[]): SeedFeeRule[] {
  return rules.map((rule) => ({
    jurisdictionKey: GREEN_BAY_KEYS.jurisdiction,
    permitTypeKey,
    scheduleKey: GREEN_BAY_KEYS.feeSchedule,
    rule,
  }));
}

const feeRules: SeedFeeRule[] = [
  ...attach("building", GREEN_BAY_BUILDING_BASE_RULES),
  ...attach("electrical", GREEN_BAY_ELECTRICAL_BASE_RULES),
  ...attach("plumbing", GREEN_BAY_PLUMBING_BASE_RULES),
  ...attach("mechanical", GREEN_BAY_MECHANICAL_BASE_RULES),
];

const requirements: SeedRequirement[] = [
  {
    jurisdictionKey: GREEN_BAY_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "document",
    title: "A complete application: site plan, building plan, cost estimate and every contractor's credential",
    description:
      'The permitting-process page lists what a permit needs: a site plan drawn to scale showing property lines and buildings, a building plan with framing for anything structural (often available from the lumber supplier), the estimated project cost, and the names of all contractors including plumbers and electricians with their state credential numbers, addresses and phone numbers. All trades\' permits must be submitted with the Building Permit Application, and everything must be submitted together — applications are reviewed in the order received, about a week for sheds, driveways and fences.',
    isMandatory: true,
    sortOrder: 10,
    sourceKey: GREEN_BAY_PROCESS_SOURCE_KEY,
    lastVerifiedAt: GREEN_BAY_LAST_VERIFIED,
  },
  {
    jurisdictionKey: GREEN_BAY_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "Historic properties need a Certificate of Appropriateness before the permit",
    description:
      'Any property listed as a historic property within the City must submit a Certificate of Appropriateness (COA) application to the Landmarks Commission, reviewed by staff or the Commission, which meets the third Wednesday of every month. COA review is required prior to the issuance of a building permit. An erosion control permit and plan are likewise required before permitting and before any land-disturbing construction.',
    isMandatory: true,
    sortOrder: 20,
    sourceKey: GREEN_BAY_PROCESS_SOURCE_KEY,
    lastVerifiedAt: GREEN_BAY_LAST_VERIFIED,
  },
  {
    jurisdictionKey: GREEN_BAY_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "license",
    title: "State-certified contractor, or a homeowner who passes the inspector's questions",
    description:
      'The residential page draws the line: an electrical contractor must be licensed in Green Bay (state firm licence for commercial work), a homeowner may wire their own existing single-family residence — but must first meet an electrical inspector at City Hall with a floor plan of every receptacle, light and switch, and answer the inspector\'s wiring questions (wire type and size, overcurrent protection, grounding, ground-fault protection) before a permit issues. More than three standalone outlets added triggers a permit even where no building permit is needed.',
    isMandatory: true,
    sortOrder: 10,
    sourceKey: GREEN_BAY_RESIDENTIAL_SOURCE_KEY,
    lastVerifiedAt: GREEN_BAY_LAST_VERIFIED,
  },
  {
    jurisdictionKey: GREEN_BAY_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "inspection",
    title: "The permit and fee must be received before work begins, and a final inspection closes it",
    description:
      'Repeated on every trade page: "Before any electrical work can begin, the permit and fee needs to be received by the Inspection Division. No inspections can be scheduled until this happens." An inspection is required upon completion of work; scheduling is by the City\'s online request form or by phone. Reinspections of electrical wiring are the schedule\'s own $75.00 row (§8-449).',
    isMandatory: true,
    sortOrder: 20,
    sourceKey: GREEN_BAY_COMMERCIAL_SOURCE_KEY,
    lastVerifiedAt: GREEN_BAY_LAST_VERIFIED,
  },
  {
    jurisdictionKey: GREEN_BAY_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    requirementType: "license",
    title: "Wisconsin master plumbers do the work; owner-occupants may do their own",
    description:
      'The residential page requires plumbing contractors to be master plumbers licensed with the State of Wisconsin to work within the city limits; rental-property work must be done by a licensed contractor. The owner of an existing single-family dwelling where they reside may do the work themselves but must still pull the permit. Permits are required for turf watering systems, sanitary sewers, storm sewers and water heater replacement, among the rest — and commercial installations of sanitary sewers and interior drain, waste and vent must be tested and witnessed by the plumbing inspector per SPS 382.21 (effective 2021-10-01).',
    isMandatory: true,
    sortOrder: 10,
    sourceKey: GREEN_BAY_RESIDENTIAL_SOURCE_KEY,
    lastVerifiedAt: GREEN_BAY_LAST_VERIFIED,
  },
];

const profile: SeedProfile = {
  jurisdictionKey: GREEN_BAY_KEYS.jurisdiction,
  headline: "What construction permits cost in Green Bay",
  summary:
    "Green Bay prices every trade by **what the building is**: a one- or two-family house, a multi-family building, or commercial work — and then by what the job is. New construction is $0.01 per square foot in a house and $0.14 in multi-family; plumbing is $7.00 a fixture in a house and $8.00 above it; electrical wiring is $0.05 a foot in a house and $0.09 in multi-family, with commercial work priced either by area or, at the applicant's choice, by a project-cost ladder from $100.00 to $600.00; mechanical (HVAC) work prices the same footage at $0.05 and $0.09, with the commercial rate split by system kind — ductless unit heaters $0.05, ducted or hydronic $0.09 — and a furnace replacement a flat $75.00 or $100.00. The fire sprinkler row is per head with the schedule's own floor and ceiling: $2.50 a head, at least $70.00, never above $200.00.",
  localContext:
    "One schedule, four trades, three property classes. The City of Green Bay Fee Schedule is a single ordinance-keyed PDF — §8-47 plan approval, §8-360 building and plumbing permits, §8-451 electrical, §8-478 mechanical — whose fee column is headed **2026 Fee**, dated to January 1, 2026 by the City's own permit-guides page. Every trade section is split the same way the applications ask it: the licensed-contractor electrical form prints the occupancy boxes (Single-Family, Two-Family, Multi-Family, Commercial, Educational, Manufacturing, Other), and the schedule prices the same scope at two or three rates across them, so the class is a fact the reader supplies rather than a determination the City makes.\n\nTwo rows here are firsts for this dataset. The fire suppression row publishes **both** a floor and a ceiling in its own parenthetical — $2.50 per head, $70.00 minimum, up to $200.00 — and the calculator clamps the rule by exactly those bounds. And the commercial electrical section offers **two ways to price one job**: area rates at $0.05 or $0.09 a foot, or a project-cost ladder from $100.00 to $600.00 plus $100.00 per $100,000 above $300,000. The ladder reads the application's Value of work field and replaces the area rates; it never adds to them.\n\nThe document itself was read the hard way. The schedule's columns mispair under a layout-mode extraction exactly as Boston's sheet did — water heater handed the lawn sprinkler amount, the commercial section offset by a row — and only the table-mode extraction pairs every row cleanly; all three were run, and the amounts the City's own pages restate agree across all of them. What the pages add beyond prices is the licensing map: state dwelling-contractor credentials verified by the City before a one- or two-family permit issues, Green Bay-licensed electricians for all services and wiring, Wisconsin master plumbers for the plumbing work, and — the one trade the City relaxed — HVAC contractors no longer city-licensed, state licence only.\n\nWhat is absent: no plan review percentage anywhere on the schedule (the §8-47 plan-approval fees are flat application-stage charges, and the residential plan rows are printed at $0.00 — energy calculations and the fixture list are filed, not priced), and Wisconsin levies no state surcharge of its own on a local permit. The penalty the City does publish is a doubling: failure to obtain a building permit may double the fees, add a municipal citation of over $500, and see the work ordered redone or removed.",
  valuationBasis:
    "The basis for building, electrical and mechanical work is **the building's square footage**, charged exactly as the reader gives it — every area row is marked \"(per sq. foot)\" and no row prints a minimum, a rounding rule or a band, so 1,500 square feet at $0.05 is $75.00 and not a stepped table. The rate on that area is decided by the property class: a penny a foot to build a house, fourteen cents in multi-family, seven or fourteen in commercial depending on the building group the Inspection Division assigns.\n\nThe one exception to area is commercial electrical, where the schedule offers a second basis: the **project cost** ladder, reading the application's \"Value of work\" field, six bands from $100.00 to $600.00 plus $100.00 for each $100,000 above $300,000. Area and cost are alternatives — the ladder is priced from value and the area rates from the floor plan, and the calculator charges one or the other, never both. The ladder's per-$100,000 line prices no fraction of a step, so a project $50,000 over the threshold pays nothing on that line.\n\nPlumbing never reads an area or a cost: the fee is the fixture count at $7.00 or $8.00, with the device rows (water heater, sprinkler heads) beside it. The sprinkler row is the one per-unit fee in the schedule with published bounds — $2.50 a head, $70.00 minimum, $200.00 maximum — so a ten-head system charges its $70.00 floor and an eighty-head system its $200.00 ceiling.",
  notIncluded:
    "These figures are Green Bay's own building, electrical, plumbing and mechanical (HVAC) permit fees, as printed on the City's 2026 fee schedule. They are not a project cost, and they exclude:\n\n- **The §8-47 plan-approval fees** — $75.00 or $125.00 for a principal-use building plan, $50.00 or $125.00 accessory, $125.00 for the HVAC and plumbing system plans, $75.00 for a sign structural plan — application-stage charges on the same sheet, separate from the permit fees these pages price. The residential plan rows are printed at $0.00 (energy calculations and the fixture list are filed, not priced).\n- **The permit doubling and the citation.** Failure to obtain a building permit may double the fees, add a municipal citation of over $500, and see work ordered redone or removed — a multiplier on a fee that has not been computed, named rather than modelled.\n- **The roofing, siding and move rows** — roofing replacement and siding at $100.00 plus $0.01/sq ft, and move building at $75.00/$100.00 plus a $0.14/sq ft foundation-area fee: mixed flat-plus-area shapes for scopes these four pages do not carry.\n- **The accessory-structure grid** — curb cut, culvert, driveway, landscape structures, fencing, hot tub, swimming pool, pond, satellite receiver and tower structure at $75.00 or $100.00 each, and subdivision signage at $50.00 plus $0.50/sq ft.\n- **The external plumbing rows** — water service connection, sanitary sewer connection and storm sewer connection at $50.00 each, Palmer valve $75.00, back water valve $50.00, lawn sprinkler RPV $75.00/$100.00, sewer cap $100.00, private well operation $125.00.\n- **The illuminated-sign and rooming-house rows** — $100.00 for an internally or externally illuminated sign (commercial electrical), and §8-629's $50.00 plus $10.00 per dwelling or rooming unit for roominghouses and shelters.\n- **Plan review percentages, technology fees and state surcharges — none exist** on the schedule, and Wisconsin levies nothing of its own on a local permit.",
  seoTitle: "Green Bay construction permit fees",
  seoDescription:
    "How Green Bay prices construction permits — $0.01 to $0.14 per square foot by property class, $7.00 to $8.00 a plumbing fixture, electrical by area or by the $100-$600 project ladder, mechanical (HVAC) by area with the ducted/ductless split, and the $2.50-a-head sprinkler clamp.",
  publishStatus: "published",
  noindex: false,
  lastReviewedAt: GREEN_BAY_LAST_VERIFIED,
};

const permitPages: SeedPermitPage[] = [
  {
    jurisdictionKey: GREEN_BAY_KEYS.jurisdiction,
    permitTypeKey: "building",
    slug: "building-permit-cost",
    title: "Green Bay building permit cost",
    intro:
      "A Green Bay building permit is priced on **the building's square footage, at a rate the property class sets**: $0.01 per square foot for new construction in a one- or two-family dwelling, $0.14 in multi-family, and $0.07 or $0.14 for commercial work depending on the building group the Inspection Division assigns. Flat rows sit beside the ladder — windows and doors at $75.00, demolition at $75.00 to $100.00 by class — and no area row carries a minimum or a rounding rule.",
    localSummary:
      "The class is asked, not derived: the City's own application forms print the occupancy boxes (Single-Family, Two-Family, Multi-Family, Commercial, Educational, Manufacturing, Other), and the schedule prices the same scope at a different rate across them. A 1,500-square-foot house is $15.00 of fee at a penny a foot; the same footprint as a multi-family building is $210.00 at fourteen cents; the same footprint as a commercial group 1 building is $105.00.\n\nThe area is charged exactly — no minimum, no rounding, no bands — because no row of the schedule prints any. What the schedule prints instead of a floor is a penalty on skipping the permit: the City's permitting-process page says failure to obtain a building permit may result in **the doubling of permit fees**, a municipal citation of over $500, and the work ordered redone or removed.\n\nTwo things sit on the same sheet but outside this page. The §8-47 plan-approval fees — $75.00 to $125.00 for a principal-use plan, with the residential energy calculations and fixture list printed at $0.00 — are application-stage charges, paid before the permit fee exists. And the commercial building groups are not defined anywhere the City publishes: the model asks which group the Division assigned, and an application that states none charges nothing rather than guessing.",
    notIncluded:
      "This is the building-permit section of the City's 2026 fee schedule. It excludes:\n\n- **The §8-47 plan-approval fees** — $75.00/$125.00 principal-use, $50.00/$125.00 accessory-use, $125.00 HVAC and plumbing system plans, $75.00 sign structural plan — paid at application, before any permit fee. The two residential rows printed at $0.00 (energy calculations, fixture list) are filed, not priced.\n- **The doubling penalty** for work started without a permit, plus the municipal citation of over $500 — multipliers and citations rather than charges.\n- **Roofing replacement and siding** — $100.00 plus $0.01 per square foot for built-up/membrane roofing or brick veneer siding, multi-family and commercial sections only.\n- **Move building** — $75.00/$100.00 plus a $0.14 per-square-foot foundation-area fee, which needs a second area figure.\n- **The accessory-structure grid** — curb cut, culvert, driveway, fencing, hot tub, swimming pool, pond, satellite receiver, tower structure at $75.00/$100.00 each; subdivision signage at $50.00 plus $0.50/sq ft; temporary or mobile sign $50.00.\n- **Plan review percentages, technology fees and state surcharges — none exist** on the schedule, and Wisconsin adds no levy of its own.",
    workedExample: {
      scenario:
        "A new 2,000-square-foot single-family house — one- and two-family residential, new construction under the schedule's first building row.",
      inputs: {
        squareFootage: 2000,
        custom: { property_class: "one_two_family" },
      },
      notes:
        "The residential row: $0.01 per square foot of new construction, charged exactly — 2,000 × $0.01 is $20.00, and that is the whole building permit fee. No minimum applies, because the schedule prints none.\n\nThe same 2,000 square feet priced as a multi-family building is 2,000 × $0.14, or $280.00; as a commercial group 1 building, $140.00; as commercial group 2, $280.00. The property class moves the fee by a factor of fourteen, which is why the application's occupancy boxes matter more than anything else on the form.\n\nThe fee does not include the §8-47 plan approval ($75.00 for a principal-use one- and two-family plan, paid at application) or the State of Wisconsin's own UDC seal requirements. Windows/doors-only permits are the $75.00 flat row; demolition is $75.00 here and $100.00 in the multi-family and commercial sections.",
    },
    faqs: [
      {
        question: "How much is a building permit in Green Bay?",
        answer:
          "For new construction, $0.01 per square foot in a one- or two-family dwelling, $0.14 per square foot in multi-family, and $0.07 or $0.14 per square foot for commercial work depending on building group — charged on the exact area with no minimum. Flat rows sit beside it: windows/doors $75.00 (residential), demolition $75.00 to $100.00 by class.",
        sourceId: GREEN_BAY_FEE_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "Why does the property class matter so much?",
        answer:
          "Because the schedule prices the same scope at different rates across three classes — one- and two-family residential, multi-family residential, and commercial/educational/institutional/industrial — and the City's application forms ask you to check the box. A 2,000-square-foot build is $20.00 in a house and $280.00 in multi-family. The class is a fact you supply; the calculator's residential rate is the default when none is stated.",
        sourceId: GREEN_BAY_ELEC_APPLICATION_SOURCE_KEY,
      },
      {
        question: "Is there a minimum building permit fee?",
        answer:
          "No. Every area row on the schedule charges the exact square footage — '(per sq. foot)' with no minimum, no rounding and no bands printed anywhere in the building section. A small addition pays pennies a foot and nothing else. What the City publishes instead of a floor is a penalty: work without a permit can double the fees.",
        sourceId: GREEN_BAY_FEE_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "What are the commercial building groups?",
        answer:
          "The commercial section splits general construction into 'building group 1' at $0.07 per square foot and 'building group 2' at $0.14 — but neither the schedule nor the City's pages define what assigns a building to a group. That determination belongs to the Inspection Division at application. The calculator asks which group you were given and charges only the stated group.",
        sourceId: GREEN_BAY_FEE_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "Does the building permit include plan review?",
        answer:
          "Not as a percentage. The schedule's §8-47 plan-approval fees are flat application-stage charges — $75.00 or $125.00 for a principal-use plan — and the two residential plan rows are printed at $0.00: energy calculations and the plumbing fixture list are filed, not priced. There is no technology fee and no Wisconsin state surcharge to add.",
        sourceId: GREEN_BAY_FEE_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "What happens if I build without a permit?",
        answer:
          "The City's permitting-process page is specific: failure to obtain a building permit may result in the doubling of permit fees, a municipal citation of over $500, and the work ordered redone or removed if in non-compliance. The doubling is a multiplier on a fee that has not been computed, so it is stated here rather than charged as a rule.",
        sourceId: GREEN_BAY_PROCESS_SOURCE_KEY,
      },
    ],
    seoTitle: "Green Bay building permit cost: $0.01-$0.14 per square foot",
    seoDescription:
      "Green Bay building permit fees from the City's 2026 schedule — new construction at $0.01 to $0.14 per square foot by property class, flat windows/doors and demolition rows, no minimum, and the permit-doubling penalty.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: GREEN_BAY_LAST_VERIFIED,
  },
  {
    jurisdictionKey: GREEN_BAY_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    slug: "electrical-permit-cost",
    title: "Green Bay electrical permit cost",
    intro:
      "A Green Bay electrical permit is priced on **the area the wiring serves, at a rate the property class sets**: $0.05 per square foot in a one- or two-family dwelling, $0.09 in multi-family, and $0.05 or $0.09 for commercial work by building group — or, for commercial work only, a **project-cost ladder** from $100.00 to $600.00 that replaces the area rates. Rows beside the rates cover services ($50.00 to $100.00), air conditioning additions ($75.00 to $100.00 per unit) and a generator ($150.00).",
    localSummary:
      "The wiring of an ordinary house prices like its ductwork: 1,500 square feet at $0.05 is $75.00, the same rate the mechanical section prints for HVAC. Services are their own row — $50.00 in a house; in multi-family, $100.00 for the initial service and $50.00 for each additional, so three services are $200.00. An air conditioning addition is $75.00 per unit residentially and $100.00 above it — per unit, not per ton, so a 3-ton and a 5-ton replacement are one unit each.\n\nThe commercial section offers two ways to price one job. The area rates read the floor plan; the ladder reads the application's 'Value of work' field — $100.00 to $10,000, $240.00 to $50,000, $310.00 to $100,000, $400.00 to $200,000, $500.00 to $300,000, $600.00 above — plus $100.00 for each $100,000 over $300,000. Choose by value and the ladder replaces the area rates; the calculator never charges both.\n\nThe generator's $150.00 appears on the City's own application form — 'JOB DESCRIPTION: *$150 permit fee', footnoted to the generator checkbox — and nowhere in the fee schedule. The form is the City's instrument, so the figure is charged from it. Reinspections of electrical wiring are $75.00, the schedule's own §8-449 row, charged only when one actually happens.",
    notIncluded:
      "This is the electrical section of the City's 2026 fee schedule, plus the generator row from the City's own application form. It excludes:\n\n- **The illuminated-sign row** — $100.00 for an internally or externally illuminated sign, a sign permit rather than wiring.\n- **The rooming-house rows** (§8-629) — $50.00 plus $10.00 per dwelling or rooming unit.\n- **The commercial building groups' definition** — the schedule prints no rule that assigns a building to group 1 or 2; the Inspection Division determines it at application, and the calculator asks which you were given.\n- **Reinspection as part of the first permit** — the $75.00 reinspection is charged when a reinspection actually happens, not as part of the permit fee.\n- **The generator's gas line** — the application requires an HVAC permit for the gas line and capacity calculations; those are requirements and another trade's permit, not part of the $150.00.\n- **Plan review percentages, technology fees and state surcharges — none exist**, and Wisconsin levies nothing of its own.",
    workedExample: {
      scenario:
        "A 2,400-square-foot one- and two-family electrical rough-in with a new service — the general electrical system row plus the service row at the residential rate.",
      inputs: {
        squareFootage: 2400,
        custom: { property_class: "one_two_family", electrical_service: 1 },
      },
      notes:
        "Two rows charge: the general electrical system at $0.05 per square foot — 2,400 × $0.05 is $120.00 — and the electrical service at the residential $50.00. The permit is $170.00.\n\nThe same wiring priced as multi-family is 2,400 × $0.09, or $216.00, with its services at $100.00 initial plus $50.00 each additional — two services are $150.00 there, against the house's flat $50.00. As commercial group 1 by area it is $120.00 again at $0.05, but a commercial application may instead price from value: $8,000 of work on the ladder is $100.00, $40,000 is $240.00, and $350,000 is $600.00 plus $100.00 for the first $50,000 band above $300,000.\n\nWhat moves nothing: the ladder and the area rates never add — one or the other prices the job, never both.",
    },
    faqs: [
      {
        question: "How much is an electrical permit in Green Bay?",
        answer:
          "The general electrical system is $0.05 per square foot in a one- or two-family dwelling, $0.09 in multi-family, and $0.05 or $0.09 commercially by building group — charged on the exact area. Beside it: electrical service $50.00 residential ($100.00 initial plus $50.00 each additional in multi-family), air conditioning addition $75.00 to $100.00 per unit, generator $150.00, and reinspection $75.00.",
        sourceId: GREEN_BAY_FEE_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "What is the commercial project-cost ladder?",
        answer:
          "The commercial electrical section's second way to price a job: $100.00 for project cost to $10,000, $240.00 to $50,000, $310.00 to $100,000, $400.00 to $200,000, $500.00 to $300,000, and $600.00 above, plus $100.00 for each $100,000 over $300,000. It reads the application's Value of work field and **replaces** the area rates — the calculator charges one or the other, never both.",
        sourceId: GREEN_BAY_FEE_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "Why is air conditioning priced per unit and not per ton?",
        answer:
          "Because the schedule's row is 'Air conditioning addition (per unit)' — a flat amount per machine, $75.00 residentially and $100.00 in multi-family. Tonnage is not asked: a 3-ton and a 5-ton replacement are one unit each. The same row appears in the mechanical section at the same prices, because the same job pulls both permits.",
        sourceId: GREEN_BAY_FEE_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "Where does the $150.00 generator fee come from?",
        answer:
          "From the City's own licensed-contractor electrical permit application — 'JOB DESCRIPTION: *$150 permit fee', asterisked against the generator checkbox. It is the only generator price the City publishes and it is not in the fee schedule. The application also requires electrical and gas capacity calculations and an HVAC permit for the gas line, which are requirements rather than fees.",
        sourceId: GREEN_BAY_ELEC_APPLICATION_SOURCE_KEY,
      },
      {
        question: "Do I need a permit to add a few outlets?",
        answer:
          "The residential page's rule: an electrical permit is required for any electrical work in conjunction with a building permit, and standalone when more than three outlets — receptacles, lights, switches — are added, which usually excludes minor repairs. An owner-occupant may wire their own existing single-family residence, but must first meet an electrical inspector with a floor plan and answer basic wiring questions before a permit issues.",
        sourceId: GREEN_BAY_RESIDENTIAL_SOURCE_KEY,
      },
      {
        question: "Who can pull an electrical permit?",
        answer:
          "Electrical services and all other wiring in the City must be done by a Green Bay-licensed electrical contractor, who submits the permit; commercial firms need a State of Wisconsin licence. The homeowner exception is the owner-occupant of an existing single-family dwelling doing their own wiring after the inspector interview. Rental property work is licensed-contractor-only.",
        sourceId: GREEN_BAY_RESIDENTIAL_SOURCE_KEY,
      },
    ],
    seoTitle: "Green Bay electrical permit cost: $0.05-$0.09 per square foot",
    seoDescription:
      "Green Bay electrical permit fees from the City's 2026 schedule — wiring by the square foot by property class, services and A/C additions by unit, the $100-$600 commercial project ladder, and the $150.00 generator row.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: GREEN_BAY_LAST_VERIFIED,
  },
  {
    jurisdictionKey: GREEN_BAY_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    slug: "plumbing-permit-cost",
    title: "Green Bay plumbing permit cost",
    intro:
      "A Green Bay plumbing permit is priced on **the fixture count at a rate the property class sets**: $7.00 per fixture in a one- or two-family dwelling and $8.00 in multi-family and commercial, charged from the first fixture with no allowance. Beside it: water heater replacement at $50.00 to $100.00, and the fire sprinkler row the schedule clamps in its own words — **$2.50 per head, $70.00 minimum, up to $200.00**.",
    localSummary:
      "The fixture rate is the whole variable fee for ordinary plumbing: five fixtures in a house are $35.00, eight are $56.00, and there is no minimum and no allowance — every fixture counts from the first. Multi-family and commercial pay a dollar more per fixture at $8.00. Water heater replacement is a permit row of its own — the City's residential page names it as permitted work — at $50.00 in a house and $100.00 in multi-family and commercial.\n\nThe fire suppression row is the schedule's own clamp: '$2.50 per head ($70.00 minimum, increased per head, up to $200.00)', printed identically in all three property-class sections. Ten heads are $25.00 of rate charged at the $70.00 floor; thirty-two heads are $80.00; eighty heads would be $200.00 charged at the ceiling. It is the first per-unit row in this dataset that publishes both bounds, and the calculator carries them as the rule's own.\n\nThe external-work rows sit beside the sections rather than in them: water service, sanitary sewer and storm sewer connections at $50.00 each (the sewer connection has its own application), Palmer valve $75.00, back water valve $50.00, lawn sprinkler RPV $75.00 to $100.00, sewer cap $100.00, private well operation $125.00. And the commercial page carries a procedure, not a fee: sanitary sewer and interior drain-waste-vent installations must be tested and witnessed by the plumbing inspector per SPS 382.21, effective October 1, 2021.",
    notIncluded:
      "This is the plumbing section of the City's 2026 fee schedule. It excludes:\n\n- **The external-work and connection rows** — water service connection, sanitary sewer connection and storm sewer connection at $50.00 each; Palmer valve $75.00; back water valve $50.00; lawn sprinkler system RPV $75.00/$100.00; sewer cap $100.00; private well operation permit $125.00.\n- **The plumbing plan approval** — $0.00 for a one- and two-family fixture list (filed, not priced) and $125.00 for the multi-family and commercial plumbing system plan, an application-stage charge on the same sheet.\n- **The SPS 382.21 witnessing requirement** — a test-and-witness procedure for sanitary sewers and interior DWV, effective 2021-10-01, which is an inspection step rather than a fee.\n- **The reinspection rows** — the schedule's $75.00 reinspection is electrical (§8-449); the plumbing section prints none of its own.\n- **Plan review percentages, technology fees and state surcharges — none exist**, and Wisconsin levies nothing of its own on a local permit.",
    workedExample: {
      scenario:
        "A bathroom and kitchen remodel on one residential permit — tub, lavatory, toilet, kitchen sink, dishwasher and washing machine connection: six fixtures, plus a water heater replacement.",
      inputs: {
        fixtures: 6,
        custom: { property_class: "one_two_family", water_heater: true },
      },
      notes:
        "Two rows charge: six fixtures at the residential $7.00 — $42.00 — and the water heater replacement at the residential $50.00. The permit is $92.00.\n\nThe fixture rate is charged from the first fixture with no allowance: three fixtures are $21.00, eight are $56.00. The same six fixtures in a multi-family building are $48.00 at $8.00, and the water heater there is $100.00 — $148.00 in all. The property class moves both rows.\n\nThe sprinkler row, had the job included fire suppression, would clamp: twenty heads at $2.50 is $50.00 charged at the $70.00 floor, while forty heads is $100.00, inside the bounds. Nothing here reads a valuation — plumbing is priced entirely by count and class.",
    },
    faqs: [
      {
        question: "How much is a plumbing permit in Green Bay?",
        answer:
          "$7.00 per fixture in a one- or two-family dwelling and $8.00 in multi-family and commercial, charged from the first fixture with no allowance. Water heater replacement is $50.00 residentially and $100.00 above it. The fire suppression row is $2.50 per head with a $70.00 minimum and a $200.00 ceiling.",
        sourceId: GREEN_BAY_FEE_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "How does the fire sprinkler clamp work?",
        answer:
          "The schedule's own parenthetical: '$2.50 per head ($70.00 minimum, increased per head, up to $200.00)'. Ten heads are $25.00 of rate charged at $70.00; thirty-two heads are $80.00; eighty heads would be $200.00 charged at the ceiling. The floor and ceiling are printed on the row itself, so the calculator carries them as the rule's own bounds.",
        sourceId: GREEN_BAY_FEE_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "Who can pull a plumbing permit?",
        answer:
          "Plumbing contractors must be master plumbers licensed with the State of Wisconsin to work within the city limits, and rental-property work must be done by a licensed contractor. The owner of an existing single-family dwelling where they reside may do the work themselves but must still obtain the permit.",
        sourceId: GREEN_BAY_RESIDENTIAL_SOURCE_KEY,
      },
      {
        question: "Does a water heater replacement need a permit?",
        answer:
          "Yes — the City's residential page names it: 'Permits are required for turf watering systems, sanitary sewers, storm sewers, and water heater replacement, etc.' The schedule prices the replacement at $50.00 in a one- or two-family dwelling and $100.00 in multi-family and commercial, as a row of its own beside the fixture count.",
        sourceId: GREEN_BAY_RESIDENTIAL_SOURCE_KEY,
      },
      {
        question: "What are the connection fees?",
        answer:
          "The external-work rows — water service connection, sanitary sewer connection and storm sewer connection at $50.00 each, plus Palmer valve, back water valve, lawn sprinkler RPV, sewer cap and private well rows — sit beside the plumbing sections on the same schedule. They are connection and external-work permits with their own applications (the sewer connection's is its own form), so they are named on this page rather than charged with the fixture count.",
        sourceId: GREEN_BAY_FEE_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "Is there a plan review fee for plumbing?",
        answer:
          "Not as a percentage. The §8-47 plumbing plan row is printed at $0.00 for one- and two-family work — the fixture list is filed, not priced — and at $125.00 for the multi-family and commercial plumbing system plan, an application-stage charge rather than part of the permit fee. No technology fee and no state surcharge exists.",
        sourceId: GREEN_BAY_FEE_SCHEDULE_SOURCE_KEY,
      },
    ],
    seoTitle: "Green Bay plumbing permit cost: $7-$8 per fixture",
    seoDescription:
      "Green Bay plumbing permit fees from the City's 2026 schedule — $7.00 to $8.00 per fixture by property class, water heater replacement $50-$100, and the $2.50-per-head fire sprinkler row clamped between $70 and $200.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: GREEN_BAY_LAST_VERIFIED,
  },
  {
    jurisdictionKey: GREEN_BAY_KEYS.jurisdiction,
    permitTypeKey: "mechanical",
    slug: "mechanical-permit-cost",
    title: "Green Bay mechanical (HVAC) permit cost",
    intro:
      "A Green Bay mechanical permit is priced on **the area the HVAC system serves, at a rate the property class sets**: $0.05 per square foot in a one- or two-family dwelling, $0.09 in multi-family, and for commercial work $0.05 for ductless unit-heater systems against $0.09 for ducted or hydronic ones — the §8-478 row the schedule splits by what the system is. Beside the area rate sit two flat rows: heating unit replacement at $75.00 or $100.00, and air conditioning additions at $75.00 or $100.00 **per unit**.",
    localSummary:
      "Ductwork prices like the wiring that runs beside it: 1,500 square feet of house is $75.00 at $0.05 — the exact figure the electrical section charges for the same area — and the same 1,500 square feet in a multi-family building is $135.00 at $0.09. The class is the property class the City's own application forms ask for, the same three boxes the building and electrical sections price against.\n\nCommercial work is the one place the schedule splits an area rate by the kind of system rather than the kind of building: 'General HVAC: ductless unit-heater systems only (per sq. foot) $0.05' against ducted or hydronic at $0.09. That wording is the only definition the City publishes, so the calculator asks which system is being installed instead of guessing at it. Heating unit replacement is a flat row — $75.00 in a house, $100.00 in multi-family and commercial — and an air conditioning addition is '$75.00 per unit', a price per machine: a 3-ton and a 5-ton replacement are one unit each. Both rows appear in the electrical section at the same prices, because one job usually pulls both permits.\n\nThe licence behind the permit changed. The City's commercial page records that the municipal HVAC licence requirement 'is no longer in effect', leaving the State of Wisconsin licence only — the one trade Green Bay relaxed. The owner-occupant of an existing single-family dwelling where they live may still pull the permit and do the work themselves.",
    notIncluded:
      "This is the mechanical (HVAC) section of the City's 2026 fee schedule, §8-478. It excludes:\n\n- **The §8-47 mechanical systems plan** — $125.00 for the multi-family and commercial mechanical systems plan, an application-stage charge on the same sheet rather than part of the permit fee. The one- and two-family row is printed at $0.00: energy (heat loss) calculations are filed, not priced.\n- **The electrical permit the same job pulls** — an air conditioning addition is priced in the electrical section too, at the same $75.00/$100.00 per unit, and a generator or service change is that section's permit entirely.\n- **The gas line and its capacity calculations** — the City's electrical application requires gas line capacity calculations and an HVAC permit for the gas line. That permit is this section's; the calculations are a submission requirement and print no fee.\n- **The building permit the work rides with** — new construction prices the building on its own permit, by the same square footage at a different rate.\n- **Rows §8-478 does not print** — the mechanical section carries three rows (general HVAC system, heating unit replacement, air conditioning addition). Boiler, refrigeration and process-cooling work has no row here, so nothing on this page is charged for it.\n- **Plan review percentages, technology fees and state surcharges — none exist** on the schedule, and Wisconsin levies nothing of its own on a local permit.",
    workedExample: {
      scenario:
        "A new 1,500-square-foot single-family house with a forced-air furnace and one condensing unit — the general HVAC system row plus a single air conditioning addition, charged on one mechanical permit.",
      inputs: {
        squareFootage: 1500,
        custom: { property_class: "one_two_family", ac_units: 1 },
      },
      notes:
        "Two rows charge: the general HVAC system at $0.05 per square foot — 1,500 × $0.05 is $75.00 — and the air conditioning addition at $75.00 per unit. The permit is $150.00.\n\nThe same 1,500 square feet priced as multi-family is $135.00 at $0.09, with its air conditioning unit at $100.00: $235.00 in all. Commercial work splits by system instead of by class — a ducted or hydronic system is $135.00 on the same area and a ductless unit-heater system $75.00, with the air conditioning unit at $100.00 either way.\n\nA furnace replacement is not the area row. 'Heating unit replacement' is a flat $75.00 in a house and $100.00 above it, which is the row a homeowner replacing a furnace actually pays; the area rate belongs to a system being installed, not swapped. Enter a different square footage and the rate follows it exactly, because no mechanical row prints a minimum, a rounding rule or a band.",
    },
    faqs: [
      {
        question: "How much is a mechanical (HVAC) permit in Green Bay?",
        answer:
          "The general HVAC system is $0.05 per square foot in a one- or two-family dwelling and $0.09 in multi-family, charged on the exact area. Commercially the schedule splits the rate by system: $0.05 for ductless unit-heater systems and $0.09 for ducted or hydronic. Beside the area rate: heating unit replacement $75.00 to $100.00, and air conditioning additions $75.00 to $100.00 per unit.",
        sourceId: GREEN_BAY_FEE_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "What is the commercial ducted-versus-ductless split?",
        answer:
          "It is the schedule's own wording: 'General HVAC: ducted or hydronic (per sq. foot) $0.09' against 'General HVAC: ductless unit-heater systems only (per sq. foot) $0.05'. Commercial HVAC is the only area rate on the sheet split by what the system is rather than by what the building is, and that wording is the only definition the City publishes — so the calculator asks which system is going in.",
        sourceId: GREEN_BAY_FEE_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "Why is air conditioning priced per unit and not per ton?",
        answer:
          "Because the mechanical row reads 'Air conditioning addition (per unit)' — a flat amount per machine, $75.00 residentially and $100.00 in multi-family and commercial. Tonnage is never asked: a 3-ton and a 5-ton replacement are one unit each. The identical row appears in the electrical section at the same prices, because one job usually pulls both permits.",
        sourceId: GREEN_BAY_FEE_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "What licence do I need to pull a mechanical permit?",
        answer:
          "A State of Wisconsin HVAC licence. The City's own commercial page records that its municipal HVAC licence requirement 'is no longer in effect' — the one trade Green Bay relaxed — leaving state licensing only. The owner-occupant of an existing single-family dwelling where they reside may still pull the permit and do the work themselves; rental-property work is licensed-contractor-only.",
        sourceId: GREEN_BAY_COMMERCIAL_SOURCE_KEY,
      },
      {
        question: "Is there a plan review fee for mechanical work?",
        answer:
          "Not a percentage. The §8-47 mechanical systems plan is $125.00 for multi-family and commercial work — an application-stage charge on the same sheet rather than part of the permit fee — and the one- and two-family row is printed at $0.00, because energy (heat loss) calculations are filed rather than priced. No technology fee and no state surcharge applies.",
        sourceId: GREEN_BAY_FEE_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "Does the mechanical permit cover the gas line?",
        answer:
          "The City's electrical application requires gas line capacity calculations and an HVAC permit for the gas line, so the gas line's permit is a mechanical permit — this section's. The capacity calculations and the connection itself print no fee anywhere; they are submission requirements rather than chargeable rows.",
        sourceId: GREEN_BAY_ELEC_APPLICATION_SOURCE_KEY,
      },
    ],
    seoTitle: "Green Bay mechanical permit cost: $0.05-$0.09 per square foot",
    seoDescription:
      "Green Bay mechanical (HVAC) permit fees from the City's 2026 schedule — area rates by class, the ducted/ductless commercial split, and furnace rows.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: GREEN_BAY_LAST_VERIFIED,
  },
];

const verifications: SeedVerification[] = [
  {
    entityType: "source",
    entityKey: GREEN_BAY_FEE_SCHEDULE_SOURCE_KEY,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: GREEN_BAY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: GREEN_BAY_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "Read 2026-09-25 as a 309,782-byte PDF. Extracted three ways — -layout mispairs columns (water heater handed the lawn sprinkler amount, commercial section offset), -raw scrambles the tail, -table pairs every row cleanly and is the transcription used. The fee column is headed '2026 Fee'.",
  },
  {
    entityType: "source",
    entityKey: GREEN_BAY_GUIDES_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: GREEN_BAY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: GREEN_BAY_GUIDES_SOURCE_KEY,
    notes:
      "Read 2026-09-25 for the effective date — 'Permit fees listed in the guides go into effect January 1, 2026' — and for the schedule link under 'Fees and Payments', which ties the PDF to this division.",
  },
  {
    entityType: "source",
    entityKey: GREEN_BAY_RESIDENTIAL_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: GREEN_BAY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: GREEN_BAY_RESIDENTIAL_SOURCE_KEY,
    notes:
      "Read 2026-09-25 for the owner-occupant rules, the state dwelling-contractor credential check, the Green Bay electrical contractor licence, the DIY electrician interview, and the master-plumber requirement.",
  },
  {
    entityType: "source",
    entityKey: GREEN_BAY_COMMERCIAL_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: GREEN_BAY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: GREEN_BAY_COMMERCIAL_SOURCE_KEY,
    notes:
      "Read 2026-09-25 for who may apply (contractor, tenant or owner for building), the state HVAC licence note, and the SPS 382.21 test-and-witness procedure dated 2021-10-01.",
  },
  {
    entityType: "source",
    entityKey: GREEN_BAY_PROCESS_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: GREEN_BAY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: GREEN_BAY_PROCESS_SOURCE_KEY,
    notes:
      "Read 2026-09-25 for the doubling penalty and citation, the two application forms, the trades-permits-submitted-with-building-permit rule, and the Landmarks Commission COA requirement.",
  },
  {
    entityType: "source",
    entityKey: GREEN_BAY_ELEC_APPLICATION_SOURCE_KEY,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: GREEN_BAY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: GREEN_BAY_ELEC_APPLICATION_SOURCE_KEY,
    notes:
      "Read 2026-09-25 as a 1,014,525-byte PDF for the occupancy boxes that make the property class a reader's choice, the Value of work field the ladder reads, and the $150.00 generator fee footnoted on the JOB DESCRIPTION line.",
  },
  {
    entityType: "fee_schedule",
    entityKey: GREEN_BAY_KEYS.feeSchedule,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: GREEN_BAY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: GREEN_BAY_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "Dated to 2026-01-01 by the City's own permit-guides page ('Permit fees listed in the guides go into effect January 1, 2026') reading the schedule's '2026 Fee' column — a real enactment date rather than a read date. No later revision was found on this pass.",
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-SF-NEW",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: GREEN_BAY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: GREEN_BAY_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "'One- and two-family residential construction permits — New construction (per sq. foot) $0.01', with the class written as the catch-all so an unstated property class charges the residential rate. Asserted at 1,500 and 2,000 square feet in the content test.",
  },
  {
    entityType: "fee_rule",
    entityKey: "PLUMB-SPRINKLER",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: GREEN_BAY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: GREEN_BAY_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "'Fire suppression system (per head) ($70.00 minimum, increased per head, up to $200.00) $2.50', printed identically in all three plumbing sections — the dataset's first per-unit row with both a floor and a ceiling, carried as the rule's own minimumCents and maximumCents. Asserted at 10, 32 and 80 heads.",
  },
  {
    entityType: "fee_rule",
    entityKey: "ELEC-COST-LADDER",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: GREEN_BAY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: GREEN_BAY_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "The commercial electrical ladder as six replacement bands ($100/$240/$310/$400/$500/$600), gated on electrical_fee_basis: project_cost so it never stacks with the area rates, with the '+$100 per $100,000 above $300,000' line as its own rule (ELEC-COST-LADDER-ADDITIONAL).",
  },
  {
    entityType: "permit_page",
    entityKey: "building-permit-cost",
    permitTypeKey: "building",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: GREEN_BAY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: GREEN_BAY_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "The class-driven matrix stated and asserted ($20.00 house vs $280.00 multi-family at 2,000 sq ft), the exact-area reading (no minimum, no rounding), the undefined commercial groups asked rather than guessed, and the doubling penalty named.",
  },
  {
    entityType: "permit_page",
    entityKey: "electrical-permit-cost",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: GREEN_BAY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: GREEN_BAY_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "The two-basis commercial section (area rates or project-cost ladder, never both), the per-unit A/C reading, the multi-family service split, and the generator's $150.00 traced to the City's application form rather than the schedule.",
  },
  {
    entityType: "permit_page",
    entityKey: "plumbing-permit-cost",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: GREEN_BAY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: GREEN_BAY_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "The straight per-fixture shape ($7/$8 by class, no allowance), the water heater rows, the sprinkler clamp worked at 10/32/80 heads, and the external-work rows named rather than charged.",
  },
  {
    entityType: "jurisdiction_profile",
    entityKey: GREEN_BAY_KEYS.jurisdiction,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: GREEN_BAY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: GREEN_BAY_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "Profile built from the 2026 fee schedule, the four permit pages and the electrical application. States the readings the model depends on — the asked property class, exact area, the ladder's replacement of the area rates, the sprinkler clamp — and names every row it does not charge.",
  },
  {
    entityType: "fee_rule",
    entityKey: "HVAC-SF-SYSTEM",
    permitTypeKey: "mechanical",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: GREEN_BAY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: GREEN_BAY_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "'One- and two-family residential mechanical (HVAC) permits — General HVAC system (per sq. foot) $0.05' — the same rate the residential electrical section prints, so the wiring and the ductwork of an ordinary house price alike. Asserted at 1,500 square feet in the content test.",
  },
  {
    entityType: "fee_rule",
    entityKey: "HVAC-C-DUCTED",
    permitTypeKey: "mechanical",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: GREEN_BAY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: GREEN_BAY_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "The commercial HVAC split as the schedule words it — 'General HVAC: ducted or hydronic (per sq. foot) $0.09' against 'General HVAC: ductless unit-heater systems only (per sq. foot) $0.05' — asked as custom.hvac_system, because the schedule defines the split by system kind and by nothing else.",
  },
  {
    entityType: "permit_page",
    entityKey: "mechanical-permit-cost",
    permitTypeKey: "mechanical",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: GREEN_BAY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: GREEN_BAY_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "The area rate by class ($75.00 a house against $135.00 multi-family and commercial ducted at 1,500 sq ft), the commercial ducted/ductless split, the per-unit A/C reading, the flat replacement rows, and the State-only HVAC licence traced to the City's own commercial page.",
  },
];

export const greenBaySeed: JurisdictionSeed = {
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
export const GREEN_BAY_PUBLISHED_PERMIT_PAGES = greenBaySeed.permitPages.filter(
  (page) => page.publishStatus === "published" && !page.noindex,
);
