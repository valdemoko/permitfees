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
  MINNESOTA_326B148_SOURCE_KEY,
  SAINT_PAUL_BUILDING_BASE_RULES,
  SAINT_PAUL_BUILDING_FEE_EFFECTIVE_FROM,
  SAINT_PAUL_BUILDING_SCHEDULE_SOURCE_KEY,
  SAINT_PAUL_ELECTRICAL_BASE_RULES,
  SAINT_PAUL_ELECTRICAL_PAGES_SOURCE_KEY,
  SAINT_PAUL_PLUMBING_BASE_RULES,
  SAINT_PAUL_PLUMBING_PAGES_SOURCE_KEY,
  SAINT_PAUL_TRADE_FEE_EFFECTIVE_FROM,
} from "./fee-rules";

export * from "./fee-rules";

/**
 * The complete Saint Paul, Minnesota seed payload.
 *
 * Every figure traces to research/minnesota/saint-paul.md, which traces to the City's own
 * building permit fee schedule (a three-page PDF stamped "Effective: 2/25/2023"), the DSI
 * electrical fee pages, the plumbing fee table, and Minnesota Statutes § 326B.148 for the
 * state surcharge the building schedule names. Nothing is estimated.
 *
 * Three pages, all published: building, electrical and plumbing. Saint Paul is Minnesota's
 * second jurisdiction and the state's counterpoint in the dataset: Minneapolis's electrical
 * permit is the State's under 326B.37, while Saint Paul — the state capital, on the other
 * bank of the same river — prices its own electrical permits through DSI's Electrical
 * Inspection Department, one table per sub-permit. Its building table is also the dataset's
 * first long *closed* table, 103 printed valuation rows that resolve to one continuous
 * arithmetic, with the State's banded surcharge standing above it.
 *
 * The county row records **Ramsey County**. Saint Paul's Department of Safety and
 * Inspections issues permits citywide, so the county is a locator rather than an authority.
 */

const RESEARCHER = "Permit Fee Intelligence research pass 16 (Minnesota)";

export const SAINT_PAUL_LAST_VERIFIED = "2026-09-25";

export const SAINT_PAUL_KEYS = {
  state: "mn",
  county: "ramsey-county",
  jurisdiction: "saint-paul",
  feeSchedule: "saint-paul-fee-schedules",
} as const;

const state: SeedState = {
  code: "MN",
  slug: "minnesota",
  name: "Minnesota",
  fipsCode: "27",
};

const county: SeedCounty = {
  key: SAINT_PAUL_KEYS.county,
  slug: "ramsey-county",
  name: "Ramsey County",
  fipsCode: "27123",
};

const jurisdiction: SeedJurisdiction = {
  key: SAINT_PAUL_KEYS.jurisdiction,
  stateKey: SAINT_PAUL_KEYS.state,
  countyKey: SAINT_PAUL_KEYS.county,
  type: "city",
  slug: "saint-paul",
  name: "Saint Paul",
  officialName: "City of Saint Paul",
  websiteUrl: "https://www.stpaul.gov/",
  permitPortalUrl:
    "https://www.stpaul.gov/departments/safety-inspections/building-and-construction/construction-permits-and-inspections",
  timezone: "America/Chicago",
  isActive: true,
};

const departments: SeedDepartment[] = [
  {
    key: "saint-paul-dsi",
    jurisdictionKey: SAINT_PAUL_KEYS.jurisdiction,
    kind: "building",
    name: "Department of Safety and Inspections (DSI)",
    phone: "(651) 266-8989",
    email: null,
    url: "https://www.stpaul.gov/departments/safety-inspections",
    addressLine: "375 Jackson Street, Suite 220, Saint Paul, MN 55101",
    hours:
      "Permit desk 8:00 a.m. - 4:00 p.m. Monday - Friday; building inspectors 7:30 a.m. - 9:00 a.m.; electrical inspectors 7:30 a.m. - 9:00 a.m.",
    notes:
      "DSI issues building, plumbing and electrical permits and publishes all three fee instruments: the building permit fee schedule PDF (effective 2/25/2023), the electrical fee tables on the trade's own pages, and the plumbing fee table on the plumbing application page. Since September 17, 2025 applications are filed in PAULIE, the City's permitting platform; the pages' contact blocks (building 651-266-8989, inspectors 651-266-9002, electrical 651-266-9003) and the Inspector Areas maps are unchanged by the move.",
  },
];

const sources: SeedSource[] = [
  {
    key: SAINT_PAUL_BUILDING_SCHEDULE_SOURCE_KEY,
    jurisdictionKey: SAINT_PAUL_KEYS.jurisdiction,
    title: "DSI Building Permit Fee Schedule (effective 2/25/2023)",
    url: "https://www.stpaul.gov/sites/default/files/2023-02/DSI.BldgPermitFeeSchedule.2023_0_3.pdf",
    sourceType: "fee_schedule_pdf",
    issuingAuthority: "City of Saint Paul — Department of Safety and Inspections",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2023-02-25",
    effectiveFrom: SAINT_PAUL_BUILDING_FEE_EFFECTIVE_FROM,
    retrievedAt: SAINT_PAUL_LAST_VERIFIED,
    lastVerifiedAt: SAINT_PAUL_LAST_VERIFIED,
    notes:
      'Three pages, read 2026-09-25 with pdftotext. The header: "DEPARTMENT OF SAFETY & INSPECTIONS (DSI) BUILDING PERMIT FEE SCHEDULE ... Section 33.04 of the Saint Paul Legislative Code ... Effective: 2/25/2023". Pages 1 and 2 are the closed valuation table — "$0 to 500 = 36" then $100-wide rows to $2,000 and $1,000-wide rows to "$99,001 to 100,000 = 1,522" — and page 3 prints the three open bands ($100,001-$500,000, $500,001-$1,000,000, $1,000,000 & Up), the state surcharge block under "Minnesota Statute 326B.148", the plan check block ("Valuations ≤ $1,000 = no fee; Valuations > $1,000 = 65% of permit fee from table above"), and the closing note: "This calculation is for the building permit fee only and does not include other fees that may be included to obtain your building permit. An example would be SAC, Parkland Dedication, Zoning and other miscellaneous required fees)." The table omits its $81,001–$82,000 and $83,001–$84,000 rows and prints $1,369 for $85,001–$86,000 where its own arithmetic gives $1,368 — three defects recorded in the research record and named on the page.',
  },
  {
    key: SAINT_PAUL_ELECTRICAL_PAGES_SOURCE_KEY,
    jurisdictionKey: SAINT_PAUL_KEYS.jurisdiction,
    title: "Electrical permit pages — service/circuits, appliance, power equipment, low voltage, fire alarm and solar tables",
    url: "https://www.stpaul.gov/departments/safety-inspections/building-and-construction/construction-permits-and-inspections/electrical-permits-inspections",
    sourceType: "municipal_website",
    issuingAuthority: "City of Saint Paul — DSI Electrical Inspection Department",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: SAINT_PAUL_TRADE_FEE_EFFECTIVE_FROM,
    retrievedAt: SAINT_PAUL_LAST_VERIFIED,
    lastVerifiedAt: SAINT_PAUL_LAST_VERIFIED,
    notes:
      'Read 2026-09-25 as HTML. Saint Paul prices electrical itself: the trade hub links six fee-bearing subpages, each with its own table — "Per Service; New, Altered, or Repaired $85.00" and "Per Circuit ... $15.00" with an $85.00 minimum; the appliance table ("Per Unit Installed, Per Circuit $15", "Per Unit Installed, With Other Electrical Work, No New Circuit $0"); "Per unit installed $54.00" and "$1.00 for KVA or KVAR; or fraction thereof" for capacitors, generators and transformers; "Per Control Panel $85.00" and "Per Device $2.00" for low voltage; "Per Control Panel $78.00", "Per Device (Horn, Strobe, Pull Station, Etc.) $1.88" for fire alarm, beside a second Fire Engineering table; and the solar PV table ("0-20 kW System $138.00", "21-40 kW System $332.00", "Above 40 kW $315, plus $3.00 for every kW above 40 kW"). Every table ends with a "$1.00 minimum" state surcharge, and the pages carry no date of their own — they sit inside the PAULIE platform that launched September 17, 2025.',
  },
  {
    key: SAINT_PAUL_PLUMBING_PAGES_SOURCE_KEY,
    jurisdictionKey: SAINT_PAUL_KEYS.jurisdiction,
    title: "Plumbing application and inspection fees — the plumbing fee table",
    url: "https://www.stpaul.gov/departments/safety-inspections/building-and-construction/construction-permits-and-inspections/plumbing-gas/plumbing-application-inspection-fees",
    sourceType: "municipal_website",
    issuingAuthority: "City of Saint Paul — DSI Plumbing Inspection",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: SAINT_PAUL_TRADE_FEE_EFFECTIVE_FROM,
    retrievedAt: SAINT_PAUL_LAST_VERIFIED,
    lastVerifiedAt: SAINT_PAUL_LAST_VERIFIED,
    notes:
      'Read 2026-09-25 as HTML. The page is a single six-row table: "Initial permit fee $92", "Per unit - Plumbing $36", "Per unit - Water $6", "Per unit - Gas $34", "If unit BTU\'s greater than 100,000, additional fee for each 100,000 BTU\'s or fraction thereof $15", "State Surcharge $1". Beside it the plumbing trade\'s requirement pages: "When a Plumbing Plan Review is Required", the plumbing plan review guidelines PDF (which states when review is required — five or fewer fixture-types for a minor remodel — and no fee of its own), the Homeowner Affidavit, the inspectors\' area map, and the categories the permit covers (Plumbing, Sewer, Gas Fitting, Radon Mitigation Systems).',
  },
  {
    key: MINNESOTA_326B148_SOURCE_KEY,
    jurisdictionKey: SAINT_PAUL_KEYS.jurisdiction,
    title: "Minnesota Statutes § 326B.148 — Surcharge (the state surcharge the building schedule defers to)",
    url: "https://www.revisor.mn.gov/statutes/cite/326B.148",
    sourceType: "municipal_code",
    issuingAuthority: "State of Minnesota — Office of the Revisor of Statutes",
    authorityKind: "state",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: SAINT_PAUL_LAST_VERIFIED,
    lastVerifiedAt: SAINT_PAUL_LAST_VERIFIED,
    notes:
      'Read 2026-09-25 (2025 Minnesota Statutes). Subdivision 1: "a surcharge is imposed on all permits issued by municipalities in connection with the construction of or addition or alteration to buildings"; if the permit fee is fixed in amount the surcharge is "one-half mill (.0005) of the fee or $1, whichever amount is greater"; otherwise "(1) if the valuation ... is $1,000,000 or less, the surcharge is equivalent to one-half mill (.0005) of the valuation"; then four bands — $500 plus .0004 above $1,000,000, $900 plus .0003 above $2,000,000, $1,200 plus .0002 above $3,000,000, $1,400 plus .0001 above $4,000,000 — and "(6) if the valuation exceeds $5,000,000, the surcharge is $1,500 plus one-twentieth mill (.00005) of the value that exceeds $5,000,000". The City\'s schedule prints the first of those rows ($0.50 for $1.00-$1,000), the second (0.0005 × job value to $1,000,000) and the deferral ("> $1,000,000 = see statute").',
  },
];

/** Empty on purpose: the permit types Saint Paul uses already exist as shared rows. */
const permitTypes: JurisdictionSeed["permitTypes"] = [];
const projectTypes: JurisdictionSeed["projectTypes"] = [];

const jurisdictionPermitTypes: SeedJurisdictionPermitType[] = [
  {
    jurisdictionKey: SAINT_PAUL_KEYS.jurisdiction,
    permitTypeKey: "building",
    isAvailable: true,
    localName: "Building permit — valuation table to $1,522 at $100,000, then three open bands",
    officialUrl:
      "https://www.stpaul.gov/departments/safety-inspections/building-and-construction/construction-permits-and-inspections/building-permits-inspections",
    notes:
      "Priced from the City's own fee schedule (effective 2/25/2023), Section 33.04 of the Legislative Code. One continuous arithmetic: $36.00 for the first $500 plus $5.00 per $100 to $2,000, then $106.00 plus $21.00 per $1,000 to $25,000, $591.00 plus $15.00 to $50,000, and $972.00 plus $11.00 to $100,000; above that the sheet prints its own bases of $1,499, $4,899 and $8,463. The plan check is 65% of the permit fee above $1,000 of valuation, and the state surcharge is § 326B.148's bands with the sheet's $0.50 floor.",
  },
  {
    jurisdictionKey: SAINT_PAUL_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    isAvailable: true,
    localName: "Electrical permit — the City's own, one table per sub-permit",
    officialUrl:
      "https://www.stpaul.gov/departments/safety-inspections/building-and-construction/construction-permits-and-inspections/electrical-permits-inspections",
    notes:
      "DSI's Electrical Inspection Department prices Saint Paul's electrical permits, which is where the city parts company with Minneapolis, where the same trade is the State's under 326B.37. Services at $85 each and circuits at $15 each (with an $85 minimum), appliances at $15 a unit, capacitors/generators/transformers at $54 a unit plus $1 a KVA, low voltage at $85 a panel and $2 a device, fire alarm at $78 a panel and $1.88 a device (with a $78 minimum of its own), and solar PV at $138 to 20 kW, $332 to 40 kW and $315 plus $3 a kW above that. Every table carries the $1.00 minimum state surcharge.",
  },
  {
    jurisdictionKey: SAINT_PAUL_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    isAvailable: true,
    localName: "Plumbing permit — $92 base plus per-unit rows for plumbing, water and gas",
    officialUrl:
      "https://www.stpaul.gov/departments/safety-inspections/building-and-construction/construction-permits-and-inspections/plumbing-gas/plumbing-application-inspection-fees",
    notes:
      "The whole permit is a base and four counts: $92 initial permit fee, $36 per plumbing unit, $6 per water unit, $34 per gas unit, and $15 for each 100,000 BTU a unit is rated above the first 100,000, plus a flat $1.00 state surcharge. The table prints no minimum row — the $92 base is the permit's floor, and a permit with counts adds to it.",
  },
];

const feeSchedules: SeedFeeSchedule[] = [
  {
    key: SAINT_PAUL_KEYS.feeSchedule,
    jurisdictionKey: SAINT_PAUL_KEYS.jurisdiction,
    sourceKey: SAINT_PAUL_BUILDING_SCHEDULE_SOURCE_KEY,
    title: "Saint Paul fee schedules — building (2023), electrical and plumbing (PAULIE era)",
    officialUrl:
      "https://www.stpaul.gov/sites/default/files/2023-02/DSI.BldgPermitFeeSchedule.2023_0_3.pdf",
    effectiveFrom: SAINT_PAUL_BUILDING_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: SAINT_PAUL_LAST_VERIFIED,
    notes:
      "Three instruments, one per trade. The building schedule is a dated PDF ('Effective: 2/25/2023', under Section 33.04 of the Legislative Code) and carries its own effectiveFrom; the electrical and plumbing tables are printed on undated City pages inside the PAULIE platform that launched September 17, 2025, which is the date they carry. The electrical trade is the City's own here — DSI's Electrical Inspection Department — while Minneapolis's is the State's.",
  },
];

function attach(permitTypeKey: string, rules: FeeRuleRecord[]): SeedFeeRule[] {
  return rules.map((rule) => ({
    jurisdictionKey: SAINT_PAUL_KEYS.jurisdiction,
    permitTypeKey,
    scheduleKey: SAINT_PAUL_KEYS.feeSchedule,
    rule,
  }));
}

const feeRules: SeedFeeRule[] = [
  ...attach("building", SAINT_PAUL_BUILDING_BASE_RULES),
  ...attach("electrical", SAINT_PAUL_ELECTRICAL_BASE_RULES),
  ...attach("plumbing", SAINT_PAUL_PLUMBING_BASE_RULES),
];

const requirements: SeedRequirement[] = [
  {
    jurisdictionKey: SAINT_PAUL_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "document",
    title: "The valuation basis is fixed by the Legislative Code, not by the applicant's estimate",
    description:
      'The schedule is issued "Section 33.04 of the Saint Paul Legislative Code", and Chapter 33.04 also sets what a permit valuation must include. The City\'s other fee rows state the same discipline in words — the stucco/plaster page: "The value of the work must include the cost of installation, alteration, addition and repairs ... and all labor and materials necessary for installation. In addition, it shall include all material and equipment supplied by other sources when those materials are normally supplied by the contractor." The table reads a valuation the code defines; it does not derive one.',
    isMandatory: true,
    sortOrder: 10,
    sourceKey: SAINT_PAUL_BUILDING_SCHEDULE_SOURCE_KEY,
    lastVerifiedAt: SAINT_PAUL_LAST_VERIFIED,
  },
  {
    jurisdictionKey: SAINT_PAUL_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "The schedule is the building permit fee only — SAC, parkland dedication and zoning are separate",
    description:
      'The schedule\'s closing note, in full: "This calculation is for the building permit fee only and does not include other fees that may be included to obtain your building permit. An example would be SAC, Parkland Dedication, Zoning and other miscellaneous required fees)." A Sewer Availability Charge determination from the Metropolitan Council, parkland dedication, and the zoning review rows on the demolition and fence pages are all charged beside the permit, and none of them is in the table.',
    isMandatory: true,
    sortOrder: 20,
    sourceKey: SAINT_PAUL_BUILDING_SCHEDULE_SOURCE_KEY,
    lastVerifiedAt: SAINT_PAUL_LAST_VERIFIED,
  },
  {
    jurisdictionKey: SAINT_PAUL_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "other",
    title: "Electrical permits are the City's, and the applicants are licensed contractors or homesteading homeowners",
    description:
      'The electrical pages price the work through DSI\'s Electrical Inspection Department and state the applicants: contractor information for commercial work, and homeowner information for residential work with a "Homeowners Affidavit (required)" beside it. The pages also carry the code and licensing boundary — "All work must be performed to the standards of the latest edition of the National Electrical Code adopted by the State of Minnesota" and, from 2026, "The 2026 National Electrical Code will be enforced on all permits obtained on or after August 17th, 2026" — while the fee itself is the City\'s own table.',
    isMandatory: true,
    sortOrder: 10,
    sourceKey: SAINT_PAUL_ELECTRICAL_PAGES_SOURCE_KEY,
    lastVerifiedAt: SAINT_PAUL_LAST_VERIFIED,
  },
  {
    jurisdictionKey: SAINT_PAUL_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "document",
    title: "Fire alarm systems need two permits: the electrical one and the Fire Engineering one",
    description:
      'The fire alarm page lists both: "Submit your Electrical Commercial Fire Alarm Permit application in PAULIE" and, under Fire Engineering, a "Fire Alarm Permit for 100 or fewer devices" or "Fire Alarm Permit for over 100 devices" — "You may also apply for both permits in PAULIE." Each has its own table (the electrical one at $78 a panel and $1.88 a device, the Fire Engineering one at $78 flat plus $22 a panel, $2 a device and 65% plan review over 100 devices). This page prices the electrical permit; the Fire Engineering permit is a Fire Department instrument priced beside it.',
    isMandatory: true,
    sortOrder: 20,
    sourceKey: SAINT_PAUL_ELECTRICAL_PAGES_SOURCE_KEY,
    lastVerifiedAt: SAINT_PAUL_LAST_VERIFIED,
  },
  {
    jurisdictionKey: SAINT_PAUL_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    requirementType: "other",
    title: "A plumbing plan review is required for commercial work, and it is not a fee row",
    description:
      'The plumbing plan review guidelines split the work in two: SECTION A, single-family owner/occupant projects and "minor remodel" work — "Plumbing Plan Review is not required for single family dwelling owner/occupant or contractor plumbing permits for a \'minor remodel\'", defined as work "limited to standard plumbing installations consisting of five or fewer fixture-types in non-licensed facilities" — and SECTION B, "Commercial projects and all other projects not covered under SECTION A". The guidelines say when a review is required and how to file it; the fee is the plumbing table\'s, whichever section applies.',
    isMandatory: false,
    sortOrder: 10,
    sourceKey: SAINT_PAUL_PLUMBING_PAGES_SOURCE_KEY,
    lastVerifiedAt: SAINT_PAUL_LAST_VERIFIED,
  },
];

const profile: SeedProfile = {
  jurisdictionKey: SAINT_PAUL_KEYS.jurisdiction,
  headline: "What construction permits cost in Saint Paul",
  summary:
    "Saint Paul prices a building permit from a **103-row valuation table** that resolves to one continuous arithmetic — $36.00 for the first $500 plus $5.00 per $100, then $21.00, $15.00 and $11.00 per $1,000 through $1,522 at $100,000 — with three printed open bands above it, a **65% plan check** on valuations over $1,000, and the state surcharge **§ 326B.148** states. Plumbing is the shortest table in the dataset: **$92** plus $36 a plumbing unit, $6 a water unit, $34 a gas unit and $15 per 100,000 BTU above the first. Electrical is the City's own — $85 a service, $15 a circuit, and a table per sub-permit.",
  localContext:
    "The building table is where Saint Paul is most like a spreadsheet and least like a fee schedule. Pages 1 and 2 print 103 rows — $100 wide up to $2,000, $1,000 wide from there to $100,000 — and every one of them is the same shape: a base plus a rate per step of the table's own width, with the step doubling as the \"or fraction thereof\" boundary the open bands state in words. Read as four segments ($36 + $5/$100 to $2,000; $106 + $21/$1,000 to $25,000; $591 + $15/$1,000 to $50,000; $972 + $11/$1,000 to $100,000) the arithmetic reproduces 102 of the 103 rows exactly, and the one it does not is the sheet's own $1,369 for $85,001–$86,000, which all its neighbours say should be $1,368. The sheet also drops its $81,001–$82,000 and $83,001–$84,000 rows entirely. Those three defects are named on the page rather than smoothed over, because a reader who opens the PDF should see why the calculator says $1,368.\n\nAbove $100,000 the sheet stops tabulating and starts printing bases, and the bases step **down**: $1,499 at $100,001 against the $1,522 the table reaches at $100,000, then $4,899 and $8,463. It is the same seam Minneapolis's schedule contains at $25,000 — a printed figure that its own arithmetic does not reach — and it is charged as printed. The plan check is 65% of the permit fee on valuations above $1,000, and the surcharge is the statute's: one-half mill to $1,000,000, then $500 plus two-fifths mill to $2,000,000 and four more bands after that, with the sheet's own $0.50 floor for the smallest jobs.\n\nPlumbing is the opposite kind of instrument: six rows, no brackets, no minimum. `$92 to begin, then $36, $6 and $34 per unit depending on whether the unit is plumbing, water or gas, and $15 for every 100,000 BTU a unit is rated above the first 100,000. The schedule's own division of a plumbing job into three counts is why the dataset counts them three ways: a water heater is a water unit and not a fixture, and a gas range is a gas unit and not either. The state surcharge is a flat $1.00 here — the same dollar the electrical pages call a minimum.\n\nAnd electrical is where the two Minnesotan cities in this dataset face opposite ways. Minneapolis publishes no electrical schedule at all, because the State's Electrical Act gives the permit to DLI; Saint Paul's DSI Electrical Inspection Department prices six sub-permits itself — services and circuits, appliances, capacitor/generator/transformer, low voltage, fire alarm, and solar PV — each on its own page with its own table, its own minimum ($85, except fire alarm's $78) and the same $1.00 minimum state surcharge. Same statute, same state, same river, two different authorities.",
  valuationBasis:
    "The basis for building work is **the total valuation of the work**, and the table reads it in 103 rows that are one arithmetic. Below $2,000 the step is $100 ($36.00 for the first $500, then $5.00 per $100); above it the step is $1,000, with $21.00, $15.00 and $11.00 per step in turn. Every row is a band, so a valuation inside a step buys the whole step — $1,501 of work is priced as $1,600 — and the open bands above $100,000 say the same thing in words: \"plus $Z for each additional $1,000 or fraction thereof\".\n\nThe plan check reads a **different basis**: 65% of the permit fee, not of the job, and only where the valuation exceeds $1,000. The state surcharge reads the valuation again but not the permit fee, and its rate falls as the job grows — one-half mill to $1,000,000, two-fifths above it, down to one-twentieth mill above $5,000,000 — which is the statute's own design and the reason the surcharge cannot be stated as one percentage.\n\nNeither the electrical tables nor the plumbing table reads a valuation at all. Electrical reads counts and capacities — services, circuits, appliances, panels, devices, KVA and kilowatts — and plumbing reads counts of units and blocks of BTU. Nothing in Saint Paul derives a fee from square footage.",
  notIncluded:
    "These figures are Saint Paul's building, electrical and plumbing permit fees. They are not a project cost, and they exclude:\n\n- **SAC, parkland dedication, zoning and other miscellaneous fees** — the building schedule's own closing note: \"This calculation is for the building permit fee only and does not include other fees that may be included to obtain your building permit.\"\n- **The demolition, fence, grading and stucco/plaster rows on the same site** — other permits with other bases: demolition at \"$5.00 per one thousand (1,000) cubic feet or fraction thereof\" with an $85.00 minimum and a $90.00 zoning review; fences at \"$45 for the first 200 lineal feet or fraction thereof and $15 for each additional 100 lineal feet\"; stucco and plastering at \"1% of the estimated job cost, with a minimum fee of $85\".\n- **The Fire Engineering fire-alarm permit** — the second table on the fire alarm page ($78 flat, $22 a control panel, $2 a device, 65% plan review over 100 devices), a Fire Department instrument filed beside the electrical permit rather than in place of it.\n- **The elevator, warm-air/ventilation and mechanical schedules** — their own trade pages, priced on their own bases (the warm-air table at \"1% of the total valuation\" for commercial work and $85 per 100,000 input BTU for residential).\n- **The three table defects** — the unprinted $81,001–$82,000 and $83,001–$84,000 rows and the printed $1,369 at $85,001–$86,000: the calculator charges the sheet's own arithmetic, and the page says so.\n- **The plumbing plan review requirement** — the guidelines state when a review is required (commercial work, and residential work beyond five fixture-types in a minor remodel); no fee of its own appears on the plumbing table.",
  seoTitle: "Saint Paul construction permit fees",
  seoDescription:
    "How Saint Paul prices construction permits — a 103-row building valuation table with a 65% plan check and the § 326B.148 surcharge, a $92 plumbing base with per-unit rows, and the City's own electrical tables.",
  publishStatus: "published",
  noindex: false,
  lastReviewedAt: SAINT_PAUL_LAST_VERIFIED,
};

const permitPages: SeedPermitPage[] = [
  {
    jurisdictionKey: SAINT_PAUL_KEYS.jurisdiction,
    permitTypeKey: "building",
    slug: "building-permit-cost",
    title: "Saint Paul building permit cost",
    intro:
      "A Saint Paul building permit is priced from **the City's own 103-row valuation table** — \"$0 to 500 = 36\" at the bottom, stepping per $100 to $2,000 and per $1,000 from there to **$1,522 at $100,000** — with three printed open bands above it ($1,499 + $8 per $1,000 to $500,000, $4,899 + $7 to $1,000,000, $8,463 + $5 beyond). On top: a **plan check of 65% of the permit fee** where the valuation exceeds $1,000, and the **state surcharge** Minnesota Statutes § 326B.148 states.",
    localSummary:
      "Read as arithmetic rather than as rows, the table is four segments: $36.00 for the first $500 plus $5.00 per $100 to $2,000; $106.00 plus $21.00 per $1,000 to $25,000; $591.00 plus $15.00 to $50,000; and $972.00 plus $11.00 to $100,000. A $38,000 job lands in the third: $591.00 plus thirteen $15.00 steps, $786.00 — one of the 102 printed rows the arithmetic reproduces exactly.\n\nThree rows it does not, and the page names them: the sheet omits its $81,001–$82,000 and $83,001–$84,000 rows entirely (the arithmetic gives $1,324 and $1,346), and prints $1,369 for $85,001–$86,000 where every neighbouring row says $1,368. The calculator charges the arithmetic, because the table states one rate across that band and the three rows are transcription noise rather than printed bases.\n\nAbove $100,000 the sheet prints bases instead of rows, and they step down at the seam: $1,499 for the first $100,000 against the $1,522 the closed table reaches at $100,000. Then the plan check at 65% of the permit fee — of the table's output, not of the job — and the state surcharge, one-half mill of the valuation with the sheet's own $0.50 floor, banded above $1,000,000 exactly as the statute bands it: $900 at $2,000,000, $1,500 at $5,000,000 and one-twentieth mill above.",
    notIncluded:
      "This is the building permit fee the schedule charges. It excludes:\n\n- **SAC, parkland dedication, zoning and other miscellaneous fees** — the schedule's closing note says the calculation \"does not include other fees that may be included to obtain your building permit\".\n- **The demolition, fence, grading, stucco and moving rows on the same site** — separate permits with their own bases (cubic feet, lineal feet, 1% of job cost).\n- **The valuation rules as a calculation** — what Chapter 33.04 requires a valuation to include is quoted on the page; the calculator reads the valuation, it does not derive it.\n- **Plan review as a separate instrument** — there is no plan-review table: the sheet states the relationship, 65% of the permit fee above $1,000 of valuation.\n- **Technology fees — none exist**; the only levy above the City's own is the state surcharge, and the sheet prints it in the same table.",
    workedExample: {
      scenario:
        "A $150,000 addition — a valuation inside the first open band of the table, the ordinary mid-size commercial or multi-family job.",
      inputs: { valuationCents: 15_000_000 },
      notes:
        "The band's own words: \"$100,001 TO $500,000 $1,499 for the first $100,000 plus $8 for each additional $1,000 or fraction thereof\". $50,000 above the first $100,000 is fifty steps, so the permit fee is $1,499.00 + $400.00 = $1,899.00.\n\nThe plan check is 65% of that — $1,234.35 — because the sheet says \"65% of permit fee from table above\". The state surcharge is one-half mill of the valuation, $75.00. Total: $3,208.35.\n\nTwo seams are worth seeing from here. At $100,000 exactly the closed table pays $1,522.00 and the plan check is $989.30; one dollar more pays $1,507.00 and $979.55, because the printed open band's $1,499 base sits $23 below where the table stops. And at $500 or less the small end holds: $36.00 of permit fee, no plan check on a valuation at or under $1,000, and the surcharge's own $0.50 floor.",
    },
    faqs: [
      {
        question: "How much is a building permit in Saint Paul?",
        answer:
          "The City's fee schedule prices it from total valuation: $36.00 for the first $500 plus $5.00 per additional $100 to $2,000, then $21.00 per $1,000 to $25,000, $15.00 to $50,000 and $11.00 to $100,000 — $1,522.00 at $100,000 — followed by three open bands at $1,499 + $8, $4,899 + $7 and $8,463 + $5 per $1,000. A $150,000 job is $1,899.00 of permit fee before the plan check and surcharge.",
        sourceId: SAINT_PAUL_BUILDING_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "How is the plan check calculated?",
        answer:
          "The schedule's own two rows answer it: \"Valuations ≤ $1,000 = no fee\" and \"Valuations > $1,000 = 65% of permit fee from table above\". The share is of the permit fee rather than of the job — $1,234.35 on a $1,899.00 permit fee — and a valuation of $1,000 or less pays no plan check at all.",
        sourceId: SAINT_PAUL_BUILDING_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "What is the Minnesota state surcharge on a Saint Paul permit?",
        answer:
          "The schedule prints the first rows and defers for the rest: $0.50 for a valuation of $1.00 to $1,000, one-half mill (0.0005) of the job value up to $1,000,000, and \"see statute\" above it. Minnesota Statutes § 326B.148 then bands it — $500 plus two-fifths mill above $1,000,000, $900 plus three-tenths above $2,000,000, and so on to $1,500 plus one-twentieth mill above $5,000,000. A $2,000,000 job pays $900.00.",
        sourceId: MINNESOTA_326B148_SOURCE_KEY,
      },
      {
        question: "Why does the fee drop between $100,000 and $100,001?",
        answer:
          "Because the sheet prints it that way. The closed table reaches $1,522.00 at $100,000, and the open band above it starts at \"$1,499 for the first $100,000 plus $8 for each additional $1,000 or fraction thereof\" — $23 lower at the seam. The calculator charges each row as printed, exactly as it does at Minneapolis's $25,000 seam; it does not smooth a step the document contains.",
        sourceId: SAINT_PAUL_BUILDING_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "Does the schedule's table have missing or wrong rows?",
        answer:
          "Three, and the page names them: the sheet omits its $81,001–$82,000 and $83,001–$84,000 rows entirely, and prints $1,369 for $85,001–$86,000 where its own $11.00-per-$1,000 arithmetic gives $1,368. The calculator charges the arithmetic — the two omitted rows at $1,324 and $1,346 — because the table states one continuous rate across that band and the print defects are not printed bases. The unprinted rows are the only fees on the page that appear in no document.",
        sourceId: SAINT_PAUL_BUILDING_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "Is the permit fee the whole cost of a Saint Paul building permit?",
        answer:
          "No, and the schedule says so in its closing note: \"This calculation is for the building permit fee only and does not include other fees that may be included to obtain your building permit. An example would be SAC, Parkland Dedication, Zoning and other miscellaneous required fees).\" A Sewer Availability Charge determination, parkland dedication, the $90.00 zoning review row on other permit types, and any contractor's plan review costs sit outside the table.",
        sourceId: SAINT_PAUL_BUILDING_SCHEDULE_SOURCE_KEY,
      },
    ],
    seoTitle: "Saint Paul building permit cost: the City's valuation table",
    seoDescription:
      "Saint Paul building permit fees — the 103-row valuation table from $36 to $1,522 with three open bands above it, the 65% plan check, and the § 326B.148 state surcharge with the sheet's $0.50 floor.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: SAINT_PAUL_LAST_VERIFIED,
  },
  {
    jurisdictionKey: SAINT_PAUL_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    slug: "electrical-permit-cost",
    title: "Saint Paul electrical permit cost",
    intro:
      "Saint Paul prices its own electrical permits — unlike Minneapolis, where the State's Electrical Act gives the trade to DLI. DSI's Electrical Inspection Department publishes **a table per sub-permit**: $85.00 per service and $15.00 per circuit with an $85.00 minimum, $15.00 per appliance installed, $54.00 per capacitor/generator/transformer plus $1.00 per KVA, $85.00 per low-voltage panel and $2.00 per device, $78.00 per fire alarm panel and $1.88 per device, and solar PV at $138.00 to 20 kW, $332.00 to 40 kW and $315.00 plus $3.00 a kW above that.",
    localSummary:
      "The main permit is two rows and a floor: $85.00 per service, new, altered or repaired, and $15.00 per circuit, new, altered or repaired — so a service with four circuits is $145.00 — with a \"Minimum Fee $85.00\" that catches a one-circuit job at $85.00 rather than $15.00. The appliance table beside it prices an air conditioner, furnace or boiler installed on its own circuit at $15.00 each, and states the zero that keeps the two from stacking: \"Per Unit Installed, With Other Electrical Work, No New Circuit | $0\" — an appliance covered by another electrical permit is not charged again.\n\nThree more tables round out the trade. Low voltage is $85.00 for the control panel plus $2.00 a device; the capacitor/generator/transformer table is $54.00 a machine plus $1.00 for each KVA or KVAR; fire alarm is $78.00 for the control panel and $1.88 for each horn, strobe or pull station, against a $78.00 minimum rather than the $85.00 the rest of the trade carries. Solar PV is priced by capacity instead: $138.00 for a system up to 20 kW, $332.00 for 21 to 40 kW — more than twice as much one kilowatt later — and $315.00 plus $3.00 for every kW above 40, which is $17.00 *below* the band beneath it at 40 kW.\n\nEvery one of the tables ends with the same row, and the word in it is the point: \"Minimum State Surcharge | $1.00\". A minimum on a surcharge is Minnesota Statutes § 326B.148's own shape — one-half mill of the fee or $1, whichever is greater — so the calculator charges 0.0005 of the permit fee with a $1.00 floor.",
    notIncluded:
      "This is the electrical permit DSI's Electrical Inspection Department issues. It excludes:\n\n- **The Fire Engineering fire-alarm permit** — the second table on the same page ($78.00 flat, $22.00 a control panel, $2.00 a device, 65% plan review over 100 devices): a Fire Department permit the City files beside the electrical one, and the page says \"You may also apply for both permits\".\n- **The electrical inspection requirements and checklists** — the dwelling-unit rough-in and final checklists, the service-upgrade and garage wiring bulletins, AFCIs, multi-family wiring and temporary construction trailers: requirements, not fees.\n- **Plan review beyond the fire alarm row** — the electrical tables print no plan review percentage; the building schedule's 65% belongs to building permits.\n- **The State's own electrical fees** — Minnesota's § 326B.37 worksheets price state-issued permits where DLI is the authority; in Saint Paul the City is, and its tables are these.",
    workedExample: {
      scenario:
        "A commercial service upgrade with four new circuits — the ordinary electrical permit, one service and one circuit count.",
      inputs: { custom: { electrical_scope: "service_circuit", electrical_services: 1, circuits: 4 } },
      notes:
        "\"Per Service; New, Altered, or Repaired $85.00\" once and \"Per Circuit ... $15.00\" four times: $85.00 + $60.00 = $145.00, above the $85.00 minimum, so the floor charges nothing. The state surcharge is one-half mill of the $145.00 fee with a $1.00 floor — 7.25 cents, trued up to $1.00 — so the permit is $146.00.\n\nA single circuit with no service would compute $15.00 and pay the $85.00 minimum instead: the floor is a *minimum fee*, charged as the shortfall. And an air conditioner installed under this permit, with the circuits already counted, is $0: the appliance table's own row, \"Per Unit Installed, With Other Electrical Work, No New Circuit\".\n\nA fire alarm permit is priced separately, under its own scope and its own floor: $78.00 for the control panel plus $1.88 for each device, with the $78.00 minimum behind it and the same $1.00 surcharge. Its devices are not the low-voltage table's devices — the scope is what keeps one count from being charged on two tables.",
    },
    faqs: [
      {
        question: "How much is an electrical permit in Saint Paul?",
        answer:
          "It depends which table the permit falls under: $85.00 per service and $15.00 per circuit with an $85.00 minimum; $15.00 for each appliance installed on its own circuit; $54.00 per capacitor, generator or transformer plus $1.00 per KVA; $85.00 a low-voltage panel and $2.00 a device; $78.00 a fire alarm panel and $1.88 a device; and solar PV at $138.00 (to 20 kW), $332.00 (21-40 kW) or $315.00 plus $3.00 a kW above 40. Every permit adds the $1.00 minimum state surcharge.",
        sourceId: SAINT_PAUL_ELECTRICAL_PAGES_SOURCE_KEY,
      },
      {
        question: "Does Saint Paul or the State of Minnesota issue the electrical permit?",
        answer:
          "Saint Paul does. DSI's Electrical Inspection Department publishes its own fee tables for six sub-permits and its own inspectors work the area maps. It is the opposite of Minneapolis, where Minnesota's Electrical Act gives the inspection to the Department of Labor and Industry and the City publishes no electrical fee schedule at all — the same trade, priced by the City on one bank of the river and by the State on the other.",
        sourceId: SAINT_PAUL_ELECTRICAL_PAGES_SOURCE_KEY,
      },
      {
        question: "What does the electrical minimum fee do?",
        answer:
          "It is a floor on the permit fee, charged as the shortfall: one circuit computes $15.00 and pays $85.00, while a service with four circuits computes $145.00 and pays it as computed. The tables state \"Minimum Fee $85.00\" for services, appliances, low voltage and power equipment, and $78.00 for fire alarm — which is why the calculator keeps two minimum rules rather than one.",
        sourceId: SAINT_PAUL_ELECTRICAL_PAGES_SOURCE_KEY,
      },
      {
        question: "Why is the state surcharge $1.00 rather than 0.05% of the fee?",
        answer:
          "Because that is the statute's own shape, and the City's word for it is \"minimum\": \"Minimum State Surcharge $1.00\" on four tables and \"State Surcharge (minimum)\" on the solar one. Minnesota Statutes § 326B.148 charges one-half mill of the fee or $1, whichever is greater. On every fee these tables produce the $1.00 wins, and on a permit fee above $2,000 the millage takes over — which is what a minimum on a surcharge means.",
        sourceId: MINNESOTA_326B148_SOURCE_KEY,
      },
      {
        question: "Do I need a second permit for a fire alarm system?",
        answer:
          "Yes. The fire alarm page lists the electrical permit and, under Fire Engineering, a fire alarm permit for 100 or fewer devices or for over 100 devices — \"You may also apply for both permits in PAULIE\". Each has its own table; this page prices the electrical one at $78.00 a control panel and $1.88 a device with a $78.00 minimum.",
        sourceId: SAINT_PAUL_ELECTRICAL_PAGES_SOURCE_KEY,
      },
      {
        question: "How is a solar permit priced in Saint Paul?",
        answer:
          "By the system's capacity: $138.00 for 0 to 20 kW, $332.00 for 21 to 40 kW, and above 40 kW $315.00 plus $3.00 for every kW over 40. The bands are flat — a 5 kW and a 20 kW system pay the same $138.00 — and the table's own curious step is that the top band's base is $17.00 below the band beneath it at 40 kW, charged as printed.",
        sourceId: SAINT_PAUL_ELECTRICAL_PAGES_SOURCE_KEY,
      },
    ],
    seoTitle: "Saint Paul electrical permit cost: the City's tables",
    seoDescription:
      "Saint Paul electrical permit fees — $85 a service, $15 a circuit, $15 an appliance, $54 a power device, low voltage at $85/$2, fire alarm at $78/$1.88, solar by kW, and the $1.00 minimum state surcharge.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: SAINT_PAUL_LAST_VERIFIED,
  },
  {
    jurisdictionKey: SAINT_PAUL_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    slug: "plumbing-permit-cost",
    title: "Saint Paul plumbing permit cost",
    intro:
      "A Saint Paul plumbing permit is **the shortest table in this dataset: one base and four counts.** The initial permit fee is **$92**, then **$36 per plumbing unit**, **$6 per water unit**, **$34 per gas unit**, and **$15 for each 100,000 BTU a unit is rated above the first 100,000** — plus a flat **$1.00 state surcharge**. No brackets, no valuation, no minimum row: the counts are the price.",
    localSummary:
      "A gas water heater and two fixtures is $92.00 + $36.00 + $36.00 + $34.00 = $198.00, plus $1.00 of surcharge. The schedule divides a plumbing job three ways because the City inspects it three ways — plumbing work, water work and gas work each have their own count — and the BTU row is the only one that looks past the count to what the unit is: \"If unit BTU's greater than 100,000, additional fee for each 100,000 BTU's or fraction thereof | $15\". A 250,000 BTU boiler is three blocks with the first included, so two chargeable blocks, $30.00.\n\nThe table prints no minimum, which is worth naming because Saint Paul's other trades have one: the $92 base *is* the floor, and a permit with no counts beyond it is $92.00 + $1.00. The flat $1.00 is also a different animal from the electrical pages' \"$1.00 minimum\" state surcharge — same statute, printed a different way on a different table, each read as it prints.\n\nAnd the plumbing plan review is a requirement, not a fee: the guidelines PDF splits the work into owner/occupant and \"minor remodel\" projects of five or fewer fixture-types, which need no review, and commercial work, which does — with no separate fee row on the table for either.",
    notIncluded:
      "This is the plumbing permit DSI prices on its plumbing application page. It excludes:\n\n- **The plan review requirement** — the plumbing plan review guidelines say when a review is required (commercial projects and anything beyond a five-fixture-type minor remodel) and how to file it; no fee of its own appears on the plumbing table.\n- **The other permit categories on the same trade page** — Sewer (storm or sanitary), Gas Fitting and Radon Mitigation Systems are their own applications in PAULIE, priced by their own rows where the City publishes them; the plumbing table's \"Per unit - Gas\" row is what it charges for gas units on a plumbing permit.\n- **The right-of-way and water-service side** — Saint Paul Regional Water Services receives plans and fees for the water service, water meter and water distribution on new buildings, as the plumbing plan review guidelines state; nothing in those fees is on the plumbing table.\n- **Technology fees — none exist**; the $1.00 state surcharge is the only levy above the City's own.",
    workedExample: {
      scenario:
        "A water heater replacement in a house — one water unit on a plumbing permit, the smallest ordinary job the table prices.",
      inputs: { custom: { water_units: 1 } },
      notes:
        "The table read straight down: \"Initial permit fee $92\", then \"Per unit - Water $6\" for the one water unit, then the flat \"State Surcharge $1\". Total $99.00 — and, because the table prints no minimum, no floor has to be consulted: $92.00 is the base a permit starts from.\n\nTwo fixtures and a gas range would add the other two counts: $92.00 + 2 × $36.00 + $34.00 = $198.00 + $1.00. And a 250,000 BTU boiler adds the capacity row: three blocks of 100,000 BTU with the first included, two chargeable, $30.00 — the only row on the table that prices what a unit *is* rather than how many there are.\n\nThe plan review question is separate from all of it. Replacing a water heater in an owner-occupied single-family home is the guidelines' Section A — no review for a minor remodel of five or fewer fixture-types; commercial plumbing is Section B, which requires one, and the fee is still the table's.",
    },
    faqs: [
      {
        question: "How much is a plumbing permit in Saint Paul?",
        answer:
          "$92.00 initial permit fee, plus $36.00 for each plumbing unit, $6.00 for each water unit, $34.00 for each gas unit, and $15.00 for each 100,000 BTU a unit is rated above the first 100,000 — plus the flat $1.00 state surcharge. There is no minimum row and no valuation: a one-water-unit permit is $99.00.",
        sourceId: SAINT_PAUL_PLUMBING_PAGES_SOURCE_KEY,
      },
      {
        question: "What is a \"water unit\" and how is it different from a plumbing unit?",
        answer:
          "The City's table counts a plumbing job three ways — \"Per unit - Plumbing $36\", \"Per unit - Water $6\", \"Per unit - Gas $34\" — because plumbing, water and gas work are each inspected and each carry their own count. They are separate facts in the calculator for the same reason: a water heater is a water unit and not a fixture, and charging its count on the plumbing row would bill it twice and the water row not at all.",
        sourceId: SAINT_PAUL_PLUMBING_PAGES_SOURCE_KEY,
      },
      {
        question: "How does the BTU row work?",
        answer:
          "The table's own words: \"If unit BTU's greater than 100,000, additional fee for each 100,000 BTU's or fraction thereof | $15\". The first 100,000 BTU is included, and every 100,000 above it — or part of one — is $15.00, counted per unit. A 250,000 BTU boiler is three blocks, two of them chargeable, $30.00; a 100,000 BTU unit adds nothing.",
        sourceId: SAINT_PAUL_PLUMBING_PAGES_SOURCE_KEY,
      },
      {
        question: "Do I need a plumbing plan review?",
        answer:
          "It depends on the work. The City's plumbing plan review guidelines put single-family owner/occupant projects and \"minor remodel\" work — standard installations of five or fewer fixture-types in non-licensed facilities — in Section A, which needs no review, and commercial projects and everything else in Section B, which does. The review is a requirement; the plumbing fee table prices the permit either way.",
        sourceId: SAINT_PAUL_PLUMBING_PAGES_SOURCE_KEY,
      },
      {
        question: "Is the state surcharge the same $1.00 as on the electrical permits?",
        answer:
          "The dollar is the same and the wording is not. The electrical tables print \"Minimum State Surcharge | $1.00\"; the plumbing table prints a flat \"State Surcharge | $1\". Both come from Minnesota Statutes § 326B.148 — one-half mill of the fee or $1, whichever is greater — and each is charged as its own table states it: the electrical surcharge floats with the fee above $2,000, the plumbing one stays a dollar.",
        sourceId: MINNESOTA_326B148_SOURCE_KEY,
      },
      {
        question: "Does a plumbing permit cover gas work?",
        answer:
          'Gas units are a row of the plumbing table — "Per unit - Gas $34" — while gas fitting is also its own permit category in PAULIE, beside plumbing, sewer and radon mitigation. The plumbing table prices the gas units on a plumbing permit; a separate gas fitting permit is its own application.',
        sourceId: SAINT_PAUL_PLUMBING_PAGES_SOURCE_KEY,
      },
    ],
    seoTitle: "Saint Paul plumbing permit cost: $92 plus per-unit rows",
    seoDescription:
      "Saint Paul plumbing permit fees — a $92 initial permit fee plus $36 per plumbing unit, $6 per water unit, $34 per gas unit and $15 per 100,000 BTU above the first, with a flat $1.00 state surcharge.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: SAINT_PAUL_LAST_VERIFIED,
  },
];

const verifications: SeedVerification[] = [
  {
    entityType: "source",
    entityKey: SAINT_PAUL_BUILDING_SCHEDULE_SOURCE_KEY,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: SAINT_PAUL_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: SAINT_PAUL_BUILDING_SCHEDULE_SOURCE_KEY,
    notes:
      "Read 2026-09-25: the three-page PDF extracted with pdftotext in both -layout and -table modes, all 112 printed valuation rows parsed, and every one checked against the modeled arithmetic — 111 exact, the one exception the sheet's own $1,369 at $85,001–$86,000.",
  },
  {
    entityType: "source",
    entityKey: SAINT_PAUL_ELECTRICAL_PAGES_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: SAINT_PAUL_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: SAINT_PAUL_ELECTRICAL_PAGES_SOURCE_KEY,
    notes:
      "Read 2026-09-25: the electrical trade hub and its six fee-bearing subpages, every table captured with its minimum row and the $1.00 minimum state surcharge, plus the two fire alarm tables (electrical and Fire Engineering) and the 2026 NEC enforcement note.",
  },
  {
    entityType: "source",
    entityKey: SAINT_PAUL_PLUMBING_PAGES_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: SAINT_PAUL_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: SAINT_PAUL_PLUMBING_PAGES_SOURCE_KEY,
    notes:
      "Read 2026-09-25: the plumbing fee table's six rows captured verbatim, plus the plumbing plan review guidelines PDF (Section A and Section B, the five-fixture-type minor remodel boundary) and the permit categories the page lists.",
  },
  {
    entityType: "source",
    entityKey: MINNESOTA_326B148_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: SAINT_PAUL_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MINNESOTA_326B148_SOURCE_KEY,
    notes:
      "Read 2026-09-25 from the Revisor's site (2025 Minnesota Statutes): subdivision 1's fixed-fee branch (one-half mill or $1, whichever greater) and all six valuation bands, which the modeled marginal rates reproduce exactly at every seam.",
  },
  {
    entityType: "fee_schedule",
    entityKey: SAINT_PAUL_KEYS.feeSchedule,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: SAINT_PAUL_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: SAINT_PAUL_BUILDING_SCHEDULE_SOURCE_KEY,
    notes:
      "Three instruments, dated two ways: the building schedule prints \"Effective: 2/25/2023\"; the electrical and plumbing tables are undated City pages inside the PAULIE platform that launched September 17, 2025, the date they carry.",
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-BAND-4",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: SAINT_PAUL_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: SAINT_PAUL_BUILDING_SCHEDULE_SOURCE_KEY,
    notes:
      "The table's $50,001–$100,000 segment: $972.00 plus $11.00 per $1,000. Its 50 rows include the two the sheet omits and the one it misprints; asserted at $100,000 ($1,522.00), at the omitted $81,500 ($1,324.00) and at $85,500 ($1,368.00) in the content test.",
  },
  {
    entityType: "fee_rule",
    entityKey: "MN-SURCHARGE",
    permitTypeKey: "building",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: SAINT_PAUL_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MINNESOTA_326B148_SOURCE_KEY,
    notes:
      "§ 326B.148's banded surcharge as marginal rates: $500 at $1,000,000, $900 at $2,000,000 and $1,500 at $5,000,000 — each seam asserted in the content test — with the schedule's own $0.50 row as the floor.",
  },
  {
    entityType: "fee_rule",
    entityKey: "ELEC-MINIMUM",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: SAINT_PAUL_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: SAINT_PAUL_ELECTRICAL_PAGES_SOURCE_KEY,
    notes:
      "\"Minimum Fee | $85.00\" on four of the six electrical tables, carried as one floor selected by scope; the fire alarm table's own $78.00 floor is a separate rule. Asserted against a one-circuit permit in the content test.",
  },
  {
    entityType: "fee_rule",
    entityKey: "PLUMB-BTU",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: SAINT_PAUL_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: SAINT_PAUL_PLUMBING_PAGES_SOURCE_KEY,
    notes:
      "\"If unit BTU's greater than 100,000, additional fee for each 100,000 BTU's or fraction thereof | $15\" — the first block included, so a 250,000 BTU unit is three blocks and two charges; asserted in the content test.",
  },
  {
    entityType: "permit_page",
    entityKey: "building-permit-cost",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: SAINT_PAUL_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: SAINT_PAUL_BUILDING_SCHEDULE_SOURCE_KEY,
    notes:
      "The four segments stated as arithmetic, the three table defects named rather than smoothed, the $1,499 seam printed, the 65% plan check's above-$1,000 gate quoted, and the § 326B.148 bands carried into the FAQs.",
  },
  {
    entityType: "permit_page",
    entityKey: "electrical-permit-cost",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: SAINT_PAUL_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: SAINT_PAUL_ELECTRICAL_PAGES_SOURCE_KEY,
    notes:
      "The City-versus-State boundary stated against Minneapolis, all six tables priced, the two minimums distinguished, the Fire Engineering permit named as a second instrument, and the $1.00 minimum surcharge explained from the statute.",
  },
  {
    entityType: "permit_page",
    entityKey: "plumbing-permit-cost",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: SAINT_PAUL_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: SAINT_PAUL_PLUMBING_PAGES_SOURCE_KEY,
    notes:
      "The one base and four counts priced in prose, the three-way split of a plumbing job explained, the absent minimum named, and the plan review stated as a requirement rather than a fee.",
  },
  {
    entityType: "jurisdiction_profile",
    entityKey: SAINT_PAUL_KEYS.jurisdiction,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: SAINT_PAUL_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: SAINT_PAUL_BUILDING_SCHEDULE_SOURCE_KEY,
    notes:
      "Profile built from the building schedule PDF, the electrical fee pages, the plumbing fee table and § 326B.148. States the readings the model depends on — the table as one arithmetic, the printed step-down seams, the 65% plan check, the statute's bands and the sheet's $0.50 floor, and the City's own electrical authority — and names every row it does not charge.",
  },
];

export const saintPaulSeed: JurisdictionSeed = {
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
export const SAINT_PAUL_PUBLISHED_PERMIT_PAGES = saintPaulSeed.permitPages.filter(
  (page) => page.publishStatus === "published" && !page.noindex,
);
