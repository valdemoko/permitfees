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
  SOUTH_BEND_BUILDING_BASE_RULES,
  SOUTH_BEND_DEPARTMENT_PAGE_SOURCE_KEY,
  SOUTH_BEND_ELECTRICAL_BASE_RULES,
  SOUTH_BEND_FEE_EFFECTIVE_FROM,
  SOUTH_BEND_PLUMBING_BASE_RULES,
  SOUTH_BEND_SCHEDULE_SOURCE_KEY,
} from "./fee-rules";

export * from "./fee-rules";

/**
 * The complete South Bend, Indiana seed payload.
 *
 * Every figure traces to research/indiana/south-bend.md, which traces to the St. Joseph
 * County / City of South Bend Building Department's own seventeen-page "Permit Fee Schedule
 * 2026", read in two `pdftotext` modes because the layout pass mis-pairs the plumbing page's
 * labels with its amounts and the plain pass does not. Nothing is estimated.
 *
 * Three pages, all published: building, electrical and plumbing. South Bend is Indiana's
 * first jurisdiction, and its building section is the second instrument in the dataset whose
 * new-construction fee is a direct percentage of the job — "Cost per Square Foot (CSF) times
 * the Total Square Footage (TSF) times the Local Variable Factor (LVF) of $.00098" — set
 * beside a printed alteration ladder that its own arithmetic reproduces to the cent. Its
 * electrical and plumbing sections are the opposite shape: price lists of item rows stacked
 * on a single permit, each trade with its own "$60.00 minimum permit fee".
 *
 * The county row records **St. Joseph County**. The department is a joint county/city one —
 * its own jurisdiction note names the City of South Bend, the unincorporated county
 * (including Wyatt, Granger, Terre Coupe and Crumstown) and the five towns that hand it their
 * building, electrical, plumbing and mechanical inspections — so the city is the permit
 * authority's home and the county is the second half of it.
 */

const RESEARCHER = "Permit Fee Intelligence research pass 17 (Indiana)";

export const SOUTH_BEND_LAST_VERIFIED = "2026-09-26";

export const SOUTH_BEND_KEYS = {
  state: "in",
  county: "st-joseph-county",
  jurisdiction: "south-bend",
  feeSchedule: "south-bend-fee-schedules",
} as const;

const state: SeedState = {
  code: "IN",
  slug: "indiana",
  name: "Indiana",
  fipsCode: "18",
};

const county: SeedCounty = {
  key: SOUTH_BEND_KEYS.county,
  slug: "st-joseph-county",
  name: "St. Joseph County",
  fipsCode: "18141",
};

const jurisdiction: SeedJurisdiction = {
  key: SOUTH_BEND_KEYS.jurisdiction,
  stateKey: SOUTH_BEND_KEYS.state,
  countyKey: SOUTH_BEND_KEYS.county,
  type: "city",
  slug: "south-bend",
  name: "South Bend",
  officialName: "City of South Bend",
  websiteUrl: "https://www.southbendin.gov/",
  permitPortalUrl: "https://www.southbendin.gov/departments/building",
  timezone: "America/Indiana/Indianapolis",
  isActive: true,
};

const departments: SeedDepartment[] = [
  {
    key: "south-bend-building-department",
    jurisdictionKey: SOUTH_BEND_KEYS.jurisdiction,
    kind: "building",
    name: "St. Joseph County / City of South Bend Building Department",
    phone: "(574) 235-9554",
    email: null,
    url: "https://www.southbendin.gov/departments/building",
    addressLine: "227 West Jefferson Boulevard, South Bend, IN 46601",
    hours:
      "Office hours Monday through Friday 7:30 a.m. to 4:30 p.m.; inspectors are in the office 7:30 a.m. to 9:00 a.m. and 3:30 p.m. to 4:00 p.m.",
    notes:
      "A joint department: its jurisdiction note lists the City of South Bend, the unincorporated areas of St. Joseph County (including Wyatt, Granger, Terre Coupe and Crumstown), and the towns of Indian Village, Lakeville, North Liberty, Osceola and Roseland, which have turned their building, electrical, plumbing and HVAC inspections over to it. Mishawaka, New Carlisle and Walkerton keep their own departments and are outside it. The means of address is the department's own: five-digit addresses are in the unincorporated county, three- or four-digit South Bend addresses are in the city. The schedule was published in January 2026 and is the department's only fee instrument — there is no separate trade schedule.",
  },
];

const sources: SeedSource[] = [
  {
    key: SOUTH_BEND_SCHEDULE_SOURCE_KEY,
    jurisdictionKey: SOUTH_BEND_KEYS.jurisdiction,
    title: "St. Joseph County / City of South Bend Building Department Permit Fee Schedule 2026",
    url: "https://southbendin.gov/wp-content/uploads/2026/01/FeeSchedule-2026-1.pdf",
    sourceType: "fee_schedule_pdf",
    issuingAuthority: "St. Joseph County / City of South Bend Building Department",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2026-01-01",
    effectiveFrom: SOUTH_BEND_FEE_EFFECTIVE_FROM,
    retrievedAt: SOUTH_BEND_LAST_VERIFIED,
    lastVerifiedAt: SOUTH_BEND_LAST_VERIFIED,
    notes:
      'Seventeen pages, read 2026-09-26 in two modes. The title page: "ST. JOSEPH COUNTY / CITY OF SOUTH BEND BUILDING DEPARTMENT PERMIT FEE SCHEDULE 2026". The jurisdiction page names the city, the unincorporated county and the five towns served. Page 3 opens the building section with the new-construction formula ("Cost per Square Foot (CSF) times the Total Square Footage (TSF) times the Local Variable Factor (LVF) of $.00098", with the ICC Building Valuation Table as CSF and "d Minimum Fee - $60.00") and begins the 100-row alteration ladder; pages 4 to 6 finish the ladder and print "100,000 and up ... $550.00*" with the two open rates ($0.90 per $1,000 to $1,000,000, then $0.60 per $1,000) and the two inspection rows; page 8 is the Northeast Neighborhood Development Area design review block; page 9 is electrical; page 10 is plumbing; pages 11 and 12 are heating and air conditioning; pages 13 to 15 are the miscellaneous, licensing and registration rows; and page 17 is the residential application checklist. **The plumbing page is the reason two modes were used:** `pdftotext -layout` shifts its amount column by one row from "Backflow Protection" onward (reading the lawn sprinkler row as $60.00 and the building-water rows as $7.00 and $10.00), while both `-raw` and `-simple` agree on the pairing the sheet prints ($6.00 for the sprinkler row, $12.00 and $25.00 for building water). Both readings are recorded in the research file and the disagreements are named on the page.',
  },
  {
    key: SOUTH_BEND_DEPARTMENT_PAGE_SOURCE_KEY,
    jurisdictionKey: SOUTH_BEND_KEYS.jurisdiction,
    title: "Building Department — Permits and the 2026 fee schedule",
    url: "https://www.southbendin.gov/departments/building",
    sourceType: "municipal_website",
    issuingAuthority: "City of South Bend",
    authorityKind: "city",
    isPrimary: false,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: SOUTH_BEND_LAST_VERIFIED,
    lastVerifiedAt: SOUTH_BEND_LAST_VERIFIED,
    notes:
      'Read 2026-09-26 as HTML. The page publishes the schedule on a single link — "FEE SCHEDULE 2026" at https://southbendin.gov/wp-content/uploads/2026/01/FeeSchedule-2026-1.pdf — and carries the department\'s contact block and the permit applications. It is the route by which the fee instrument was found, and it is recorded because a rate must be traceable to the authority that publishes it: the page is the authority\'s own index, the PDF is its instrument.',
  },
];

/** Empty on purpose: the permit types South Bend uses already exist as shared rows. */
const permitTypes: JurisdictionSeed["permitTypes"] = [];
const projectTypes: JurisdictionSeed["projectTypes"] = [];

const jurisdictionPermitTypes: SeedJurisdictionPermitType[] = [
  {
    jurisdictionKey: SOUTH_BEND_KEYS.jurisdiction,
    permitTypeKey: "building",
    isAvailable: true,
    localName: "Building permit — a percentage of the valuation, or the printed alteration ladder",
    officialUrl: "https://www.southbendin.gov/departments/building",
    notes:
      "Two mechanisms in one section. New construction and additions are `CSF × TSF × .00098` — 0.00098 of the building's construction valuation, with the ICC Building Valuation Table supplying the cost per square foot and paragraph (c) amending three occupancy groupings onto it — under a published $60.00 minimum. Remodeling, alterations and repairs over $500, fences, in-ground pools, communication towers and utilities run down a 100-row table: $60.00 at $1 to $3,000, $5.00 per $1,000 band to $545.00 at $100,000, then printed bases of $550.00, $0.90 per $1,000 to $1,000,000 and $0.60 per $1,000 above it. Work without a permit is tripled as a penalty.",
  },
  {
    jurisdictionKey: SOUTH_BEND_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    isAvailable: true,
    localName: "Electrical permit — a price list of item rows with a $60.00 minimum",
    officialUrl: "https://www.southbendin.gov/departments/building",
    notes:
      "The department prices electrical itself, item by item, on one page: temporary services at $7.00 each, switchboards and panel boards by amperage ($7.00 at 60 amp through $50.00 over 2,000 amp), circuits at $5.00 each, machinery at $7.00 for the first horsepower and $0.25 for each additional, back-up generators at $60.00 or $70.00, pool wiring and bonding, wiring repair, reconnects, solar arrays and electric vehicle devices at $60.00 each, and reinspections at $60.00. The page states its own floor in its opening line: \"with a minimum permit fee being $60.00\".",
  },
  {
    jurisdictionKey: SOUTH_BEND_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    isAvailable: true,
    localName: "Plumbing permit — the longest price list in the schedule, with a $60.00 minimum",
    officialUrl: "https://www.southbendin.gov/departments/building",
    notes:
      "Twenty price rows on one permit under a $60.00 minimum: $6.00 a fixture, $6.00 a backflow device, $12.00 or $25.00 a building sewer and the same for a building water service by length, $7.00 a water softener, $10.00 a trailer park sewer, $6.00 a rainwater drain, $7.00 a water heater and vent, $60.00 a gas reconnection, $3.00 a gas outlet, $8.00 an industrial waste pretreatment interceptor, $6.00 for water piping work and for drain or vent repair, $12.00 a drywell, $6.00 a lawn sprinkler system per meter, $60.00 for the first 30 fire-protection sprinkler heads plus $8.00 per additional 10, $12.00 for gas tanks and pumps, $60.00 or $70.00 for a back-up generator's gas line, $60.00 a reinspection and $75.00 an additional final inspection.",
  },
];

const feeSchedules: SeedFeeSchedule[] = [
  {
    key: SOUTH_BEND_KEYS.feeSchedule,
    jurisdictionKey: SOUTH_BEND_KEYS.jurisdiction,
    sourceKey: SOUTH_BEND_SCHEDULE_SOURCE_KEY,
    title: "St. Joseph County / City of South Bend Building Department Permit Fee Schedule 2026",
    officialUrl: "https://southbendin.gov/wp-content/uploads/2026/01/FeeSchedule-2026-1.pdf",
    effectiveFrom: SOUTH_BEND_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: SOUTH_BEND_LAST_VERIFIED,
    notes:
      "One instrument for every trade — unlike Saint Paul, Minneapolis or Nashville, where each trade has its own page or PDF. Building, electrical, plumbing and heating/air conditioning are four sections of the same seventeen-page document, all carrying the 2026 edition. The calculator models the first three; the heating and air conditioning section is transcribed in the research file and named on the profile as unmodelled.",
  },
];

function attach(permitTypeKey: string, rules: FeeRuleRecord[]): SeedFeeRule[] {
  return rules.map((rule) => ({
    jurisdictionKey: SOUTH_BEND_KEYS.jurisdiction,
    permitTypeKey,
    scheduleKey: SOUTH_BEND_KEYS.feeSchedule,
    rule,
  }));
}

const feeRules: SeedFeeRule[] = [
  ...attach("building", SOUTH_BEND_BUILDING_BASE_RULES),
  ...attach("electrical", SOUTH_BEND_ELECTRICAL_BASE_RULES),
  ...attach("plumbing", SOUTH_BEND_PLUMBING_BASE_RULES),
];

const requirements: SeedRequirement[] = [
  {
    jurisdictionKey: SOUTH_BEND_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "document",
    title: "The construction valuation comes from the ICC table, not from the applicant's estimate",
    description:
      'The schedule does not let an applicant name a number: "Cost per Square Foot (CSF) shall be determined by the International Code Council Building Valuation Table in effect in January of each year", and paragraph (c) amends three occupancy groupings onto that table ("Groups F-1, F-2, H-1, H-2, H-3, H-4, and M shall have the same rate As A-3", "Groups I-4, R-2, and R-4 shall have the same rate as I-1", "Groups S-1, S-2, and U shall have the same rate as R-3"). The alteration table below it reads a different figure — "Estimated Construction Costs" — which the sheet leaves to the application. The calculator reads whichever basis the scope selects; it does not derive either.',
    isMandatory: true,
    sortOrder: 10,
    sourceKey: SOUTH_BEND_SCHEDULE_SOURCE_KEY,
    lastVerifiedAt: SOUTH_BEND_LAST_VERIFIED,
  },
  {
    jurisdictionKey: SOUTH_BEND_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "Work without a permit is charged at triple the fee",
    description:
      'The schedule\'s own warning, in full: "WHERE A PERSON SHALL UNLAWFULLY PROCEED TO DO ANY WORK OR CONSTRUCTION WITHOUT A REQUIRED PERMIT, THE PERMIT FEES SHALL BE TRIPLED AS A PENALTY. THE PAYMENT OF SUCH PENALTY SHALL NOT RELEASE THE PERSON IN DEFAULT FROM ANY OTHER PENALTIES HEREAFTER PROVIDED." A penalty is not a fee row, so the calculator charges the schedule and the penalty is stated here rather than multiplied into a rule: no reader should discover a triple charge by typing a value into a fee field.',
    isMandatory: true,
    sortOrder: 20,
    sourceKey: SOUTH_BEND_SCHEDULE_SOURCE_KEY,
    lastVerifiedAt: SOUTH_BEND_LAST_VERIFIED,
  },
  {
    jurisdictionKey: SOUTH_BEND_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "The department's jurisdiction is the city, the unincorporated county and five towns",
    description:
      'The schedule\'s second page states it: the department covers the City of South Bend and "the unincorporated areas of St. Joseph County (including Wyatt, Granger, Terre Coupe, and Crumstown)", plus the towns of Indian Village, Lakeville, North Liberty, Osceola and Roseland, which "have turned their inspection requirements over to our Department" while still issuing their own improvement location permits — and it names Mishawaka, New Carlisle and Walkerton as having their own departments. The department\'s own means of telling them apart is the address: five digits is the unincorporated county, three or four digits with a South Bend mailing is the city. The calculator prices the department\'s permit; which department issues it follows from the address.',
    isMandatory: true,
    sortOrder: 30,
    sourceKey: SOUTH_BEND_SCHEDULE_SOURCE_KEY,
    lastVerifiedAt: SOUTH_BEND_LAST_VERIFIED,
  },
  {
    jurisdictionKey: SOUTH_BEND_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    requirementType: "other",
    title: "Contractors must be registered or licensed with the department before they may pull a permit",
    description:
      'The schedule\'s last page states it: "All contractors, including sub-contractors, must be registered or licensed with our Department in order to perform work in St. Joseph County and the City of South Bend; with the exception that an owner-occupant of the residential dwelling may perform their own work." The licensing rows themselves are not permit fees — a general contractor registration is $125.00 against a $5,000 bond, an electrical or HVAC contractor $125.00, a plumbing contractor, excavator or sewer cleaner $125.00, and a Class B industrial electrical licence $125.00 — and the calculator does not charge them, because a licence is not a permit.',
    isMandatory: true,
    sortOrder: 10,
    sourceKey: SOUTH_BEND_SCHEDULE_SOURCE_KEY,
    lastVerifiedAt: SOUTH_BEND_LAST_VERIFIED,
  },
  {
    jurisdictionKey: SOUTH_BEND_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "document",
    title: "An application may be taken for the minimum known, with the count settled as the work proceeds",
    description:
      'The electrical page closes with a rule about applying rather than about paying: "If the exact number of circuits or horsepower is unknown at the time of application for a permit, a permit may be taken for the minimum amount known with new permits issued as the intent of the work known." It is why the electrical rules read a count the application may raise later, and why a permit with almost nothing on it pays the $60.00 floor rather than nothing.',
    isMandatory: false,
    sortOrder: 10,
    sourceKey: SOUTH_BEND_SCHEDULE_SOURCE_KEY,
    lastVerifiedAt: SOUTH_BEND_LAST_VERIFIED,
  },
];

const profile: SeedProfile = {
  jurisdictionKey: SOUTH_BEND_KEYS.jurisdiction,
  headline: "What construction permits cost in South Bend",
  summary:
    "South Bend prices a building permit two ways: new construction and additions are **0.00098 of the construction valuation** (`CSF × TSF × .00098`, with the ICC Building Valuation Table supplying the cost per square foot) under a **$60.00 minimum**, while remodeling, alterations and repairs over $500 run down a **100-row ladder** — $60.00 at $1 to $3,000, $5.00 per $1,000 band to **$545.00 at $100,000**, then printed bases of $550.00, $0.90 per $1,000 and $0.60 per $1,000. Electrical and plumbing are the opposite shape: **price lists of item rows stacked on one permit, each with its own $60.00 minimum** — a circuit $5.00, a panel board by amperage, a fixture $6.00, a fire-protection system $60.00 for its first 30 heads plus $8.00 per additional 10.",
  localContext:
    "The building section is two instruments that meet at one number. The first is a formula so short it is easy to mistake for a typo: `CSF × TSF × .00098`. It is not a typo and it is not a rate on area — `CSF × TSF` is the building's construction valuation, taken from the International Code Council's building valuation table for the occupancy, and the local variable factor is what turns that valuation into a fee. A $200,000 building pays $196.00. So the calculator reads a valuation, exactly as it reads one for Minneapolis or Saint Paul, even though the sheet never uses the word.\n\nThe second is the table beneath it, and it is the most regular thing in the document: one hundred printed rows, $60.00 at the bottom, $5.00 added for every $1,000 band, and every row from \"$1.00 to 3,000.00 ... 60.00\" to \"99,001.00 to 100,000.00 ... 545.00\" exactly what $60.00 plus $5.00 per $1,000 above $3,000 gives. All one hundred reproduce. Then the sheet does something neither Minneapolis nor Saint Paul does at their seams: it prints \"100,000 and up ... $550.00\", which is $5.00 **above** the row beneath it, and adds two open rates on top — \"$0.90 per thousand ... up to $1,000,000 total estimated construction cost\" and \"$0.60 per one thousand ... thereafter\". The step up is charged as printed, for the same reason Minneapolis's two-cent step down is: the document states it as a base.\n\nElectrical and plumbing could hardly be more different. Both are price lists, both say \"with a minimum permit fee being $60.00\" in their opening line, and both ask the reader to count things — circuits, panel boards, horsepower, reconnections, fixtures, backflow devices, water heaters, gas outlets, drywells, sprinkler heads, inspections. Nothing in either is a bracket, a valuation or a percentage, with one exception the sheet declines to publish: the solar row is \"$60.00 plus percentage of the construction cost as established by the Departments fee schedule\", and the percentage lives on an instrument the department does not publish, so the page prices the $60.00 and names the percentage as unmodelled.\n\nTwo details are worth keeping because they are where a reader would otherwise think the calculator had slipped. Panel boards are priced by their amperage — seven classes from $7.00 at 60 amp to $50.00 over 2,000 amp — and the calculator asks for the amperage and the count, which is exact for an ordinary one-board service change and is named as a limitation for a permit carrying boards of several different sizes. And the fire-protection row is a block rate: \"Up to 30 heads $60.00; Plus each additional 10 heads thereafter $8.00\" is charged as $0.80 a head inside a ten-head increment, so 30 heads is $60.00, 31 heads is $68.00 and 41 heads is $76.00 — a partial block buys the whole block, which is what \"each additional 10 heads\" means.",
  valuationBasis:
    "The basis for **new construction and additions** is the building's construction valuation, and the sheet says how it is built: \"Cost per Square Foot (CSF) times the Total Square Footage (TSF) times the Local Variable Factor (LVF) of $.00098\", where CSF \"shall be determined by the International Code Council Building Valuation Table in effect in January of each year\", amended for three occupancy groupings. The rate the calculator applies is 0.00098 of that valuation — stated as the exact fraction 98/100,000 — under the sheet's published $60.00 minimum. No square footage is read, because the schedule itself converts area into cost before the fee is computed; entering both would price the building twice.\n\nThe basis for **remodeling, alterations and repairs over $500, fences, in-ground pools, communication towers and utilities** is \"Estimated Construction Costs\", which the sheet leaves to the application. It runs down the 100-row table: $60.00 at $1 to $3,000 and $5.00 per $1,000 band to $545.00 at $100,000, then the printed $550.00 base with $0.90 per $1,000 to $1,000,000 and $0.60 per $1,000 above it. Every band is bought whole, which is what the table's own $1,000-wide rows say.\n\n**Neither trade permit reads an area or a valuation at all.** Electrical reads counts and capacities — temporary services, panel boards by amperage, circuits, horsepower, generator kilowatts — and plumbing reads counts of fixtures, devices, connections, appliances and heads. Two rows read a length (a building sewer or water service under 100 feet against 100 feet or over) and two read a capacity (a generator's kilowatts; a sprinkler system's heads).",
  notIncluded:
    "These figures are South Bend's building, electrical and plumbing permit fees as the department's 2026 schedule publishes them. They are not a project cost, and they exclude:\n\n- **The heating, ventilating and air-conditioning schedule** — pages 11 and 12 of the same document, a fourth trade with its own $60.00 minimum and its own price list (heating units and warm-air furnaces at $60.00, central electric air conditioning at $60.00 under 10 tons and $70.00 over, ventilating systems by CFM, commercial hoods at $120.00, refrigeration at $60.00 or $75.00 by horsepower, rooftop units, heat pumps, mini-splits and ductwork by openings).\n- **The Fire Department commercial plan review table** — the sheet heads it \"CITY PROJECTS ONLY\", so it prices the City's own projects ($348.00 sprinkled, $205.00 non-sprinkled, $253.00 addition, and a remodel ladder to $253.00 above $58,000) rather than a permit a reader buys.\n- **The solar array's percentage of construction cost** — the row is \"$60.00 plus percentage of the construction cost as established by the Departments fee schedule\", and the percentage is on an instrument the department does not publish. The $60.00 is charged; the percentage is named rather than guessed.\n- **Licensing and registration fees** — general, demolition, electrical, heating and air conditioning, plumbing and sign contractors at $125.00 each against bonds, and the $50.00 examination filing fee: a licence is not a permit.\n- **The moving, wrecking, sign, tent, temporary structure and document-processing rows** — separate permits with their own bases ($125.00 to $175.00 a move, $0.02 or $0.015 a square foot for wrecking with a $60.00 minimum, sign permits from $40.00 to $120.00 by area, and $70.00 for a verification document).\n- **The triple-fee penalty for work without a permit** — stated as a requirement rather than multiplied into a rule, so no fee field can silently triple a charge.\n- **The panel board limitation** — a permit carrying boards of several different amperages is priced at the amperage entered, because the sheet prices the board rather than the class total.",
  seoTitle: "South Bend construction permit fees",
  seoDescription:
    "How South Bend and St. Joseph County price construction permits — a building fee of .00098 of the valuation or a 100-row alteration ladder, and electrical and plumbing price lists under a $60 minimum.",
  publishStatus: "published",
  noindex: false,
  lastReviewedAt: SOUTH_BEND_LAST_VERIFIED,
};

const permitPages: SeedPermitPage[] = [
  {
    jurisdictionKey: SOUTH_BEND_KEYS.jurisdiction,
    permitTypeKey: "building",
    slug: "building-permit-cost",
    title: "South Bend building permit cost",
    intro:
      "A South Bend building permit is priced **two ways, and the schedule says which applies**. New construction and additions are \"Cost per Square Foot (CSF) times the Total Square Footage (TSF) times the Local Variable Factor (LVF) of .00098\" — that is, **0.00098 of the building's construction valuation**, with the ICC Building Valuation Table supplying the cost per square foot and a published **$60.00 minimum**. Remodeling, alterations and repairs over $500, fences, in-ground pools, communication towers and utilities run down a **100-row ladder** that starts at **$60.00** and adds $5.00 per $1,000 band to **$545.00 at $100,000**, then prints its own bases of $550.00, $0.90 per $1,000 up to $1,000,000 and $0.60 per $1,000 above it.",
    localSummary:
      "The alteration ladder is the most regular thing in the document and it reproduces completely: one hundred printed rows, $60.00 at the bottom and $5.00 for every $1,000 band, every one of them exactly what $60.00 plus $5.00 per $1,000 above $3,000 gives — $95.00 at $10,000, $545.00 at $100,000. Then the sheet prints \"100,000 and up ... $550.00\", which is $5.00 **above** the row beneath it, and adds two open rates: \"$0.90 per thousand dollars ($1000.00) of estimated construction cost thereafter, up to $1,000,000.00 total estimated construction cost\" and \"$0.60 per one thousand dollars ... thereafter\". A $500,000 job is $550.00 plus 400 × $0.90, $910.00 — a rate that is less than a fifth of the ladder's own $5.00 per $1,000, which is how front-loaded these tables are.\n\nNew construction is the opposite: one formula, no rows. `CSF × TSF × .00098` reads as a rate on area but is not one — `CSF × TSF` is the construction valuation the International Code Council's table produces for the occupancy, and .00098 is what turns that valuation into a fee. A $200,000 building pays $196.00, and anything under about $61,000 of valuation pays the published $60.00 minimum.\n\nThe sheet's own warning sits above all of it: \"WHERE A PERSON SHALL UNLAWFULLY PROCEED TO DO ANY WORK OR CONSTRUCTION WITHOUT A REQUIRED PERMIT, THE PERMIT FEES SHALL BE TRIPLED AS A PENALTY.\" That is a penalty and not a fee row, so the calculator states it here rather than multiplying it into a rule.",
    notIncluded:
      "This is the building permit fee the 2026 schedule charges. It excludes:\n\n- **The Fire Department commercial plan review table** — headed \"CITY PROJECTS ONLY\" ($348.00 sprinkled, $205.00 non-sprinkled, $253.00 addition, and a remodel ladder to $253.00 above $58,000): it prices the City's own projects, not a permit a reader buys.\n- **The Northeast Neighborhood Development Area design review** — $160.00 for stand-alone residential or commercial new construction in that overlay district. It is modelled and it is `other`, charged in addition to the permit and only when the plan is in the district; a job anywhere else in the city does not pay it.\n- **The two inspection rows** — a commercial or industrial reinspection at $60.00 and an additional final inspection after a failure at $80.00. They are trips charged when they happen, not rows of a permit's arithmetic.\n- **The heating, ventilating and air-conditioning schedule** — pages 11 and 12 of the same document, a fourth trade with its own minimum.\n- **The moving, wrecking, sign and tent rows** — separate permits with their own bases (a move $125.00 to $175.00, wrecking $0.02 or $0.015 a square foot with a $60.00 minimum).\n- **The triple-fee penalty** — stated above as the sheet states it, and never multiplied into a calculation.",
    workedExample: {
      scenario:
        "A $150,000 commercial alteration — a valuation inside the alteration ladder's closed portion, and the ordinary mid-size job the table is built for.",
      inputs: { valuationCents: 15_000_000, custom: { building_scope: "alteration" } },
      notes:
        "The ladder: $60.00 for the first $3,000, then $5.00 for each $1,000 band above it. $150,000 is band 147 from that floor, so the fee is $60.00 + 147 × $5.00 = $795.00 — one of the hundred printed rows' own arithmetic, and the row the table prints for $149,001 to $150,000.\n\nTwo seams are worth seeing from here. At $100,000 exactly the ladder pays $545.00; one dollar more pays $550.90, because the printed \"100,000 and up\" base of $550.00 sits $5.00 above where the closed table stops and the $0.90 rate then applies to the $1 that crossed the seam. And at $1,000,000 the second band reaches $1,360.00, after which the sheet's own $0.60 per $1,000 takes over for a $1,000,001 job.\n\nThe new-construction side of the same page is a different calculation entirely: a $150,000 *new building* — valued at $150,000 through the ICC table — pays $147.00, because .00098 of the valuation is the whole fee. Nothing in the calculator picks between the two: the scope does, and the schedule's own heading is what defines it.",
    },
    faqs: [
      {
        question: "How much is a building permit in South Bend?",
        answer:
          "It depends which mechanism applies. New construction and additions pay .00098 of the building's construction valuation — `CSF × TSF × .00098`, with the ICC Building Valuation Table supplying the cost per square foot — under a $60.00 minimum, so a $200,000 building is $196.00. Remodeling, alterations and repairs over $500, fences, in-ground pools, communication towers and utilities pay $60.00 for the first $3,000 of estimated construction cost plus $5.00 for every $1,000 band above it, to $545.00 at $100,000, then $550.00 plus $0.90 per $1,000 to $1,000,000 and $0.60 per $1,000 above that.",
        sourceId: SOUTH_BEND_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "What is the local variable factor and what does it multiply?",
        answer:
          "The schedule writes the new-construction fee as \"Cost per Square Foot (CSF) times the Total Square Footage (TSF) times the Local Variable Factor (LVF) of $.00098\". CSF times TSF is the building's construction valuation — the ICC table supplies the cost per square foot for the occupancy — so the factor multiplies a valuation, not an area. That is why the calculator charges 0.00098 of the valuation rather than 0.00098 of the square footage.",
        sourceId: SOUTH_BEND_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "Why does the fee go up at $100,000 rather than down?",
        answer:
          "Because the sheet prints it that way. The closed ladder reaches $545.00 at $100,000, and the block above it opens with \"100,000 and up ... $550.00*\" — $5.00 higher — before applying $0.90 per $1,000 to the excess. Most schedules step down at a seam like this one (Minneapolis's $25,000 and Saint Paul's $100,000 do); this one steps up, and the calculator charges each printed base as printed rather than smoothing either direction.",
        sourceId: SOUTH_BEND_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "Does the fee include the plan review?",
        answer:
          "There is no separate plan review fee in the building section. The schedule's building section is two fee mechanisms and two inspection rows, and the only plan review it publishes is the Fire Department's commercial table, which it heads \"CITY PROJECTS ONLY\" and which therefore prices the City's own projects rather than a reader's permit.",
        sourceId: SOUTH_BEND_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "What happens if I build without a permit?",
        answer:
          "The schedule states it in capitals: \"WHERE A PERSON SHALL UNLAWFULLY PROCEED TO DO ANY WORK OR CONSTRUCTION WITHOUT A REQUIRED PERMIT, THE PERMIT FEES SHALL BE TRIPLED AS A PENALTY. THE PAYMENT OF SUCH PENALTY SHALL NOT RELEASE THE PERSON IN DEFAULT FROM ANY OTHER PENALTIES HEREAFTER PROVIDED.\" The calculator states that rule rather than applying it, so no fee field can silently triple a charge.",
        sourceId: SOUTH_BEND_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "Which areas does the South Bend Building Department serve?",
        answer:
          "The City of South Bend and the unincorporated areas of St. Joseph County, including Wyatt, Granger, Terre Coupe and Crumstown — plus Indian Village, Lakeville, North Liberty, Osceola and Roseland, which have handed the department their building, electrical, plumbing and HVAC inspections while keeping their own improvement location permits. Mishawaka, New Carlisle and Walkerton have their own departments. The department tells them apart by address: five digits is the unincorporated county, three or four digits with a South Bend mailing is the city.",
        sourceId: SOUTH_BEND_SCHEDULE_SOURCE_KEY,
      },
    ],
    seoTitle: "South Bend building permit cost: .00098 of value",
    seoDescription:
      "South Bend building permit fees — new construction at .00098 of the valuation with a $60 minimum, or the 100-row alteration ladder from $60 to $545 at $100,000 and the printed bases above it.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: SOUTH_BEND_LAST_VERIFIED,
  },
  {
    jurisdictionKey: SOUTH_BEND_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    slug: "electrical-permit-cost",
    title: "South Bend electrical permit cost",
    intro:
      "South Bend prices an electrical permit as **a price list, not a table**. One permit carries whatever applies: temporary services at **$7.00** each, switchboards and panel boards **by amperage** ($7.00 at 60 amp up to $50.00 over 2,000 amp), circuits at **$5.00** each, machinery at **$7.00 for the first horsepower plus $0.25 for each additional**, back-up generators at **$60.00 or $70.00**, pool wiring and bonding, wiring repair, reconnects, solar arrays and electric vehicle devices at **$60.00**, and reinspections at **$60.00** — all under the page's own opening line: \"with a minimum permit fee being $60.00\".",
    localSummary:
      "The floor is what shapes the permit. Almost every row on the page is smaller than $60.00 — a temporary service is $7.00, a circuit is $5.00, a 200-amp panel board is $12.00 — so the ordinary small job pays $60.00 and the breakdown shows the shortfall rather than a fee that quietly became a minimum. A service change with a 200-amp board and four circuits computes $12.00 + $20.00 = $32.00 and pays $60.00; the same permit with twenty circuits computes $112.00 and pays it.\n\nThe panel board row is seven printed classes — 60 amp $7.00, 100 amp $9.00, 200 amp $12.00, 400 amp $15.00, 600 amp $20.00, \"Over 600 to 2,000 amp\" $25.00 and \"Over 2,000 amp\" $50.00 — and the sheet prices a board rather than a class total. The calculator therefore asks for the amperage and the number of boards, which is exact for an ordinary one-board service change; a permit carrying boards of several different sizes is priced at the amperage entered, and the page says so rather than pretending otherwise.\n\nTwo rows are worth reading twice. \"Horsepower (machinery): First hp $7.00; Each additional hp $0.25\" prices motive equipment by its rating rather than its count, so one 20 hp motor is $11.75 and a panel of small motors is priced the same way. And the solar row is the only one on the page the sheet does not finish: \"Solar Array $60.00 plus percentage of the construction cost as established by the Departments fee schedule\" — the $60.00 is here, the percentage is on an instrument the department does not publish, and the calculator charges the $60.00 and names the percentage as unmodelled.",
    notIncluded:
      "This is the electrical permit the department prices on page 9 of its schedule. It excludes:\n\n- **The solar array's percentage of construction cost** — the row is \"$60.00 plus percentage of the construction cost as established by the Departments fee schedule\", and the percentage is not on this instrument. The $60.00 is charged; the percentage is named.\n- **The heating, ventilating and air-conditioning permit** — a separate trade on the same schedule with its own $60.00 minimum and its own price list, not part of an electrical permit.\n- **The contractor licensing rows** — a Class A electrical contractor's licence is $125.00 against a $5,000 bond, a Class B industrial electrical licence $125.00, and the examination filing fee $50.00. A licence is not a permit.\n- **The temporary-power requirements** — the page prices a temporary service and says nothing about how long it may stay energized; that belongs to the code the department enforces, not to the fee table.\n- **A permit carrying panel boards of several different amperages** — priced at the amperage entered, because the sheet prices the board and not a class total. Exact for a one-board service change; named here for a mixed permit.",
    workedExample: {
      scenario:
        "A service change with one 200-amp panel board and four circuits — the ordinary residential electrical permit.",
      inputs: {
        custom: { panel_board_amperage: 200, panels: 1, circuits: 4 },
      },
      notes:
        "Read down the page: \"200 amp ... $12.00\" once and \"Circuits, each (new or replaced) ... $5.00\" four times, $12.00 + $20.00 = $32.00. That is below the page's own opening line — \"with a minimum permit fee being $60.00\" — so the permit pays $60.00, and $28.00 of it is the shortfall rather than a fee.\n\nTwenty circuits instead of four computes $12.00 + $100.00 = $112.00 and pays it, because the floor no longer governs. And a 2,000-amp service — a board in the \"Over 600 to 2,000 amp\" class at $25.00 — is $25.00 plus four circuits, $45.00, still under the floor.\n\nTwo rows are not on this permit at all. A mechanical permit is a different trade; and the electrical inspector's reinspection visit, if one is needed, is $60.00 on its own, charged when it happens rather than when the permit is issued.",
    },
    faqs: [
      {
        question: "How much is an electrical permit in South Bend?",
        answer:
          "It is a price list with a $60.00 minimum: $7.00 a temporary service, panel boards by amperage ($7.00 at 60 amp, $9.00 at 100, $12.00 at 200, $15.00 at 400, $20.00 at 600, $25.00 over 600 to 2,000 and $50.00 over 2,000), $5.00 a circuit, $7.00 for the first horsepower of machinery plus $0.25 each additional, $60.00 or $70.00 for a back-up generator, $60.00 for pool wiring and bonding, wiring repair, a reconnect, a solar array or an electric vehicle device, and $60.00 a reinspection. The page's own opening line sets the floor: \"with a minimum permit fee being $60.00\".",
        sourceId: SOUTH_BEND_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "How are panel boards priced?",
        answer:
          "By the board's amperage, in seven printed classes: 60 amp $7.00, 100 amp $9.00, 200 amp $12.00, 400 amp $15.00, 600 amp $20.00, \"Over 600 to 2,000 amp\" $25.00 and \"Over 2,000 amp\" $50.00, each board counted once. The calculator asks for the amperage and the number of boards, which is exact for a one-board service change; a permit carrying boards of several different amperages is priced at the amperage entered.",
        sourceId: SOUTH_BEND_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "How is machinery charged?",
        answer:
          "By horsepower rather than by machine: \"Horsepower (machinery): First hp $7.00; Each additional hp $0.25\". The first horsepower is inside the $7.00, so a 20 hp motor is $11.75 whether it is one motor or four 5 hp motors. The page's closing note also allows the count to be settled later: \"If the exact number of circuits or horsepower is unknown at the time of application for a permit, a permit may be taken for the minimum amount known with new permits issued as the intent of the work known.\"",
        sourceId: SOUTH_BEND_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "Does the department inspect electrical work itself?",
        answer:
          "Yes. The St. Joseph County / City of South Bend Building Department's own inspectors cover the city, the unincorporated county and the five towns that handed it their inspections (Indian Village, Lakeville, North Liberty, Osceola and Roseland). There is no state electrical permit in this jurisdiction — the department publishes the fee, the code and the inspection, and a reinspection is $60.00.",
        sourceId: SOUTH_BEND_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "Is the solar percentage included?",
        answer:
          "No, and the sheet is why: the row reads \"Solar Array ... $60.00 plus percentage of the construction cost as established by the Departments fee schedule\". The $60.00 is on this page and is charged; the percentage is established elsewhere and is not published on this instrument, so the page names it as unmodelled rather than inventing a rate.",
        sourceId: SOUTH_BEND_SCHEDULE_SOURCE_KEY,
      },
    ],
    seoTitle: "South Bend electrical permit cost: the price list",
    seoDescription:
      "South Bend electrical permit fees — panel boards by amperage, $5 circuits, $7 plus $0.25 a horsepower, generators, reconnects, solar and EVSE, all under a $60 minimum.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: SOUTH_BEND_LAST_VERIFIED,
  },
  {
    jurisdictionKey: SOUTH_BEND_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    slug: "plumbing-permit-cost",
    title: "South Bend plumbing permit cost",
    intro:
      "A South Bend plumbing permit is **the longest price list in the schedule: twenty rows on one permit, under a $60.00 minimum.** A fixture is **$6.00**, a backflow device **$6.00**, a building sewer or water service **$12.00 under 100 feet and $25.00 at 100 feet or over**, a water softener **$7.00**, a water heater and vent **$7.00**, a gas outlet **$3.00**, a gas reconnection **$60.00**, a drywell **$12.00**, and a fire protection sprinkler system **$60.00 for its first 30 heads plus $8.00 for each additional 10**.",
    localSummary:
      "Nothing here is a bracket or a valuation — every row is a count, and the sheet's opening line says what that means: \"the following fees shall be levied, with a minimum permit fee being $60.00\". A permit with two fixtures and a water softener computes $6.00 + $6.00 + $7.00 = $19.00 and pays $60.00; a commercial fit-out with twenty fixtures, eight backflow devices, four water heaters and sixty gas outlets computes $120.00 + $48.00 + $28.00 + $180.00 = $376.00 and pays it.\n\nTwo rows read something other than a count. A building sewer and a building water service are each priced by length — \"Under 100' ... $12.00\" and \"100' or over ... $25.00\" — so the calculator asks for each length and prices each row separately, and a sewer whose length is not entered is charged at the under-100-foot row rather than dropped. A back-up generator's gas line is priced by the generator's capacity, on exactly the two rows the electrical sheet prices the generator itself on: $60.00 at 10 kW or less, $70.00 over it.\n\nThe fire protection row is a block rate and the block is ten heads: \"Up to 30 heads $60.00; Plus each additional 10 heads thereafter $8.00\". Thirty heads is $60.00, thirty-one heads is one block and $68.00, forty-one heads is two blocks and $76.00 — a partial block buys the whole block, which is what \"each additional 10 heads\" says.\n\nTwo extraction notes belong to this page and no other. The schedule's plumbing table is the one place where `pdftotext -layout` mis-pairs labels with amounts, shifting the column by a row from \"Backflow Protection\" onward; both other modes agree on the pairing printed above, and both readings are recorded in the research file. And the sheet prices its two inspection trips differently here — \"Reinspection $60.00\" and \"Additional final inspection, each $75.00\" — where the electrical page prices both at $60.00.",
    notIncluded:
      "This is the plumbing permit the department prices on page 10 of its schedule. It excludes:\n\n- **The building, electrical and heating/air-conditioning permits** — separate trades on the same document, each with its own minimum and its own rows; a plumbing permit does not carry them.\n- **The contractor registration rows** — plumbing contractors, excavators and sewer cleaners register for $125.00 a year. A registration is not a permit.\n- **The sewer and water connection charges levied by other departments** — the residential checklist requires \"Septic and well permits from the St. Joseph County Health Department or sewer and/or water permit from the South Bend Engineering Department\" and a driveway permit from the County Engineering Department, each issued and priced by its own office and none of them on this schedule.\n- **The lawn sprinkler row's included backflow devices** — the row is \"Lawn sprinkler system on any one meter, including backflow protection devices thereof, each ... $6.00\", and the calculator charges the $6.00 per meter without adding the backflow row on top, because the sheet says those devices are inside the price.\n- **The plumbing work the schedule does not price** — a trailer park sewer's own connection charges, grease interceptors that function as fixture traps (the sheet excepts them), and any work the department's inspector prices on site rather than in the table.",
    workedExample: {
      scenario:
        "A bathroom remodel: two fixtures and a water heater, the smallest ordinary plumbing permit.",
      inputs: { fixtures: 2, custom: { heaters: 1 } },
      notes:
        "Read down the table: \"Each plumbing fixture or trap or set of fixtures on one trap ... $ 6.00\" twice, \"Water heater and/or vent, each ... $ 7.00\" once — $19.00. That is under the page's opening line, \"with a minimum permit fee being $60.00\", so the permit pays $60.00 and $41.00 of it is the shortfall.\n\nA larger job crosses the floor quickly. Twenty fixtures, eight backflow devices, four water heaters and sixty gas outlets: $120.00 + $48.00 + $28.00 + $180.00 = $376.00, well above it.\n\nTwo rows sit beside counts and are worth pricing here. A building sewer and a building water service at 150 feet each are $25.00 apiece rather than $12.00, on their own length facts; and a fire protection sprinkler system at thirty-one heads is $68.00 — the $60.00 for the first thirty plus one whole ten-head block at $8.00 — while thirty heads exactly is still $60.00.",
    },
    faqs: [
      {
        question: "How much is a plumbing permit in South Bend?",
        answer:
          "It is a list of twenty rows with a $60.00 minimum: $6.00 a fixture or trap, $6.00 a backflow device, $12.00 or $25.00 a building sewer and the same for a building water service by length, $7.00 a water softener, $10.00 a trailer park sewer, $6.00 a rainwater drain, $7.00 a water heater and vent, $60.00 a gas reconnection, $3.00 a gas outlet, $8.00 an industrial waste pretreatment interceptor, $6.00 for water piping work and for drain or vent repair, $12.00 a drywell, $6.00 a lawn sprinkler system per meter, $60.00 plus $8.00 per additional 10 heads for fire protection sprinklers, $12.00 for gas tanks and pumps, $60.00 or $70.00 for a generator's gas line, $60.00 a reinspection and $75.00 an additional final inspection.",
        sourceId: SOUTH_BEND_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "Why did the same schedule read differently in two tools?",
        answer:
          "Because one text-extraction mode mis-pairs the plumbing page's two columns and the other two do not. `pdftotext -layout` shifts the amount column by one row from \"Backflow Protection\" onward — reading the lawn sprinkler row as $60.00 and the building-water rows as $7.00 and $10.00 — while both `-raw` and `-simple` agree on the pairing the sheet prints: $6.00 for the sprinkler row and $12.00/$25.00 for building water. Both readings are recorded in the research file, and the page states the figures the sheet prints.",
        sourceId: SOUTH_BEND_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "How is a fire protection sprinkler system charged?",
        answer:
          "\"Up to 30 heads ... $60.00; Plus each additional 10 heads thereafter ... $ 8.00\". The first thirty heads are inside the $60.00, and each whole or partial ten above them is $8.00 — charged as $0.80 a head inside a ten-head increment, so 30 heads is $60.00, 31 heads is $68.00 and 41 heads is $76.00.",
        sourceId: SOUTH_BEND_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "Does a lawn sprinkler system include its backflow devices?",
        answer:
          "Yes, and the sheet says so on the row: \"Lawn sprinkler system on any one meter, including backflow protection devices thereof, each ... $ 6.00\". The $6.00 is per meter and the backflow devices the system uses are inside that price, so the calculator does not add the $6.00 backflow row on top of it.",
        sourceId: SOUTH_BEND_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "Do contractors need a licence to pull a plumbing permit?",
        answer:
          "The schedule's last page says: \"All contractors, including sub-contractors, must be registered or licensed with our Department in order to perform work in St. Joseph County and the City of South Bend; with the exception that an owner-occupant of the residential dwelling may perform their own work.\" Plumbing contractors, excavators and sewer cleaners register at $125.00. The registration is not a permit fee and the calculator does not charge it.",
        sourceId: SOUTH_BEND_SCHEDULE_SOURCE_KEY,
      },
    ],
    seoTitle: "South Bend plumbing permit cost: twenty rows and a $60 minimum",
    seoDescription:
      "South Bend plumbing permit fees — $6 fixtures and backflow devices, building sewers and water services by length, sprinklers at $60 plus $8 per 10 heads, and a $60 minimum.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: SOUTH_BEND_LAST_VERIFIED,
  },
];

const verifications: SeedVerification[] = [
  ...sources.map(
    (source): SeedVerification => ({
      entityType: "source",
      entityKey: source.key,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: SOUTH_BEND_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: source.key,
      notes:
        "The schedule was downloaded and read in two `pdftotext` modes on 2026-09-26; the department page was read as HTML the same day.",
    }),
  ),
  {
    entityType: "fee_schedule",
    entityKey: SOUTH_BEND_KEYS.feeSchedule,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: SOUTH_BEND_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: SOUTH_BEND_SCHEDULE_SOURCE_KEY,
    notes:
      "One instrument, seventeen pages, published January 2026 with 2026 in its title. Its building arithmetic reproduces all 100 printed alteration rows and the three open bases; its electrical and plumbing pages are price lists, read in two modes because the layout pass mis-pairs the plumbing page.",
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-ALT-1",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: SOUTH_BEND_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: SOUTH_BEND_SCHEDULE_SOURCE_KEY,
    notes:
      "The 100-row ladder as one arithmetic — $60.00 plus $5.00 per $1,000 above $3,000 — asserted against its own printed rows at $3,000, $4,000, $5,000, $10,000, $10,001 and $100,000 in the content test.",
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-NEW",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: SOUTH_BEND_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: SOUTH_BEND_SCHEDULE_SOURCE_KEY,
    notes:
      "`CSF × TSF × .00098` charged as 0.00098 of the valuation under the sheet's own $60.00 minimum; asserted at $200,000 ($196.00) and at a valuation under the floor in the content test.",
  },
  {
    entityType: "fee_rule",
    entityKey: "PLUMB-FIRE-SPRINKLER",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: SOUTH_BEND_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: SOUTH_BEND_SCHEDULE_SOURCE_KEY,
    notes:
      "\"Up to 30 heads $60.00; Plus each additional 10 heads thereafter $8.00\" charged as $0.80 a head inside a ten-head increment — 30/31/41 heads asserted at $60.00/$68.00/$76.00 in the content test.",
  },
  {
    entityType: "fee_rule",
    entityKey: "ELEC-MINIMUM",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: SOUTH_BEND_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: SOUTH_BEND_SCHEDULE_SOURCE_KEY,
    notes:
      "\"with a minimum permit fee being $60.00\" in the page's opening line, carried as one floor over the whole electrical permit rather than as a floor on a row; asserted against a one-temporary-service permit in the content test.",
  },
  {
    entityType: "permit_page",
    entityKey: "building-permit-cost",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: SOUTH_BEND_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: SOUTH_BEND_SCHEDULE_SOURCE_KEY,
    notes:
      "Both mechanisms priced in prose, the step-up seam at $100,000 named and explained, the ICC valuation rule quoted, and the triple-fee penalty stated as a requirement rather than multiplied into a rule.",
  },
  {
    entityType: "permit_page",
    entityKey: "electrical-permit-cost",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: SOUTH_BEND_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: SOUTH_BEND_SCHEDULE_SOURCE_KEY,
    notes:
      "The seven panel classes, the horsepower allowance, the generator bands, the $60.00 floor and the solar row's unpublished percentage all priced or named; the multi-amperage limitation stated on the page.",
  },
  {
    entityType: "permit_page",
    entityKey: "plumbing-permit-cost",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: SOUTH_BEND_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: SOUTH_BEND_SCHEDULE_SOURCE_KEY,
    notes:
      "The twenty rows priced, the block rate on sprinkler heads explained, the two-mode extraction disagreement recorded on the page, and the lawn sprinkler row's included backflow devices named rather than double-charged.",
  },
  {
    entityType: "jurisdiction_profile",
    entityKey: SOUTH_BEND_KEYS.jurisdiction,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: SOUTH_BEND_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: SOUTH_BEND_SCHEDULE_SOURCE_KEY,
    notes:
      "Profile built from the seventeen-page 2026 schedule and the department page. States the readings the model depends on — the valuation formula, the ladder as one arithmetic, the step-up seam, the block rate on sprinkler heads, the panel classes and the $60.00 floors — and names every row it does not charge.",
  },
];

export const southBendSeed: JurisdictionSeed = {
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
export const SOUTH_BEND_PUBLISHED_PERMIT_PAGES = southBendSeed.permitPages.filter(
  (page) => page.publishStatus === "published" && !page.noindex,
);
