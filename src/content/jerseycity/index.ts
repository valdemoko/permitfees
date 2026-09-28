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
  JERSEY_CITY_BUILDING_BASE_RULES,
  JERSEY_CITY_CODE_SOURCE_KEY,
  JERSEY_CITY_ELECTRICAL_BASE_RULES,
  JERSEY_CITY_FEE_EFFECTIVE_FROM,
  JERSEY_CITY_ORDINANCE_SOURCE_KEY,
  JERSEY_CITY_PLUMBING_BASE_RULES,
  JERSEY_CITY_STATE_UCC_SOURCE_KEY,
} from "./fee-rules";

export * from "./fee-rules";

/**
 * The complete Jersey City, New Jersey seed payload.
 *
 * Every figure traces to research/new-jersey/jersey-city.md, which traces to §160-1 M of the
 * Jersey City Municipal Code — the Uniform Construction Code fee block in Chapter 160 "Fees and
 * Charges" — and to N.J.A.C. 5:23-4.18 and 5:23-4.19 for the State's share of the bill. Nothing
 * is estimated.
 *
 * Three pages, all published: building, electrical and plumbing. The two New Jersey cities in
 * this dataset are the first pair whose fee *shape* is set by a State rule rather than only by
 * the city — N.J.A.C. 5:23-4.18 fixes the bases and leaves the rates to the municipality — and
 * they price them very differently: Newark charges $0.02 or $0.03 a cubic foot and graduates its
 * alteration table, Jersey City charges $0.027 a cubic foot with a $0.15 exception and one
 * alteration rate.
 */

const RESEARCHER = "Permit Fee Intelligence research pass 11 (New Jersey)";

export const JERSEY_CITY_LAST_VERIFIED = "2026-09-25";

export const JERSEY_CITY_KEYS = {
  state: "nj",
  county: "hudson-county",
  jurisdiction: "jersey-city",
  feeSchedule: "jersey-city-chapter-160-ucc-fee-schedule",
} as const;

const state: SeedState = {
  code: "NJ",
  slug: "new-jersey",
  name: "New Jersey",
  fipsCode: "34",
};

const county: SeedCounty = {
  key: JERSEY_CITY_KEYS.county,
  slug: "hudson-county",
  name: "Hudson County",
  fipsCode: "34017",
};

const jurisdiction: SeedJurisdiction = {
  key: JERSEY_CITY_KEYS.jurisdiction,
  stateKey: JERSEY_CITY_KEYS.state,
  countyKey: JERSEY_CITY_KEYS.county,
  type: "city",
  slug: "jersey-city",
  name: "Jersey City",
  officialName: "City of Jersey City",
  websiteUrl: "https://www.jerseycitynj.gov/",
  permitPortalUrl:
    "https://www.jerseycitynj.gov/cityhall/HousingAndDevelopment/onlinepermittinglicensing",
  timezone: "America/New_York",
  isActive: true,
};

const departments: SeedDepartment[] = [
  {
    key: "jersey-city-construction-code",
    jurisdictionKey: JERSEY_CITY_KEYS.jurisdiction,
    kind: "building",
    name: "Department of Housing, Economic Development and Commerce — Construction Code",
    phone: null,
    email: null,
    url: "https://www.jerseycitynj.gov/cityhall/HousingAndDevelopment/constructioncode",
    addressLine: null,
    hours: null,
    notes:
      "The Construction Code office issues the subcode permits and keeps the City's Uniform Construction Code chapter, and the City takes applications through its online permitting and licensing portal. The department's telephone number, street address and office hours were not published in any document this pass could read, so they are left empty rather than guessed at; both the construction code page and the portal are linked from the City's own site.",
  },
];

const sources: SeedSource[] = [
  {
    key: JERSEY_CITY_CODE_SOURCE_KEY,
    jurisdictionKey: JERSEY_CITY_KEYS.jurisdiction,
    title:
      'Jersey City Municipal Code, Chapter 160 "Fees and Charges", §160-1 M — "Chapter 131, Uniform Construction Code fees established pursuant to N.J.S.A. 52:27D-126a"',
    url: "https://library.municode.com/nj/jersey_city/codes/code_of_ordinances?nodeId=CH160FECH_S160-1FESCES",
    sourceType: "municipal_code",
    issuingAuthority: "City of Jersey City",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: JERSEY_CITY_FEE_EFFECTIVE_FROM,
    retrievedAt: JERSEY_CITY_LAST_VERIFIED,
    lastVerifiedAt: JERSEY_CITY_LAST_VERIFIED,
    notes:
      "Read 2026-09-25 through the City's codifier, whose consolidation is Supplement No. 52. §160-1 M carries the whole construction fee schedule: the building subcode in (1), plumbing in (2), electrical in (3), fire in (4), elevators in (5) and miscellaneous fees in (6), with the amendment history of the block — 4-13-2005 by Ord. 04-154 and 9-11-2013 by Ord. 13-081 — attached to the rows those ordinances changed. The row that decides most of the arithmetic, M(1)(a), is the one that prints A-2 twice.",
  },
  {
    key: JERSEY_CITY_ORDINANCE_SOURCE_KEY,
    jurisdictionKey: JERSEY_CITY_KEYS.jurisdiction,
    title:
      'Ordinance 26-051 — "An Ordinance of the Municipal Council of Jersey City amending Chapter 160 — Fees and Charges with any Associated Chapters for Fees", adopted 15 July 2026',
    url: "https://cityofjerseycity.civicweb.net/document/455677",
    sourceType: "ordinance",
    issuingAuthority: "Municipal Council of the City of Jersey City",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2026-07-15",
    effectiveFrom: null,
    retrievedAt: JERSEY_CITY_LAST_VERIFIED,
    lastVerifiedAt: JERSEY_CITY_LAST_VERIFIED,
    notes:
      "Read 2026-09-25 as a 71-page PDF: the ordinance, its record of council vote (9-0 on introduction 24 June 2026 and on final passage 15 July 2026), its fact sheet and its attachment reproducing Chapter 160 with the old and the new figure printed for every fee it changes — for example a marriage-record correction moving from $20 to $30, and a franchise petition from $3,500 to $10,000. The attachment's Uniform Construction Code block carries one figure per row, so this comprehensive revision left the construction fees alone. Read to date the schedule rather than to source any amount; New Jersey ordinances take effect 20 days after adoption unless they state otherwise.",
  },
  {
    key: JERSEY_CITY_STATE_UCC_SOURCE_KEY,
    jurisdictionKey: JERSEY_CITY_KEYS.jurisdiction,
    title:
      "N.J.A.C. 5:23-4, Uniform Construction Code — §5:23-4.18 (standards for municipal fees) and §5:23-4.19 (New Jersey State permit surcharge fees)",
    url: "https://www.nj.gov/dca/codes/codreg/pdf_regs/njac_5_23_4.pdf",
    sourceType: "state_agency",
    issuingAuthority: "New Jersey Department of Community Affairs, Division of Codes and Standards",
    authorityKind: "state",
    isPrimary: true,
    documentDate: "2026-08-17",
    effectiveFrom: null,
    retrievedAt: JERSEY_CITY_LAST_VERIFIED,
    lastVerifiedAt: JERSEY_CITY_LAST_VERIFIED,
    notes:
      "Read 2026-09-25 as the Department's consolidated PDF of Subchapter 4, current through New Jersey Register Volume 58 No. 16. §5:23-4.18(a)1 is the rule that makes Jersey City's 25% plan review a prepayment rather than a surcharge — the plan review fee \"shall then be deducted from the amount of the fee due for a construction permit, when the permit is issued\" — and §5:23-4.19(b) sets the State permit surcharge at $0.00371 a cubic foot of new construction and $1.90 per $1,000 of other construction, minimum $1.00. The code's own note that State-set fees \"will be incorporated herein by reference\" is what the City's older printed figures are measured against.",
  },
];

/** Empty on purpose: the permit types Jersey City uses already exist as shared rows. */
const permitTypes: JurisdictionSeed["permitTypes"] = [];
const projectTypes: JurisdictionSeed["projectTypes"] = [];

const jurisdictionPermitTypes: SeedJurisdictionPermitType[] = [
  {
    jurisdictionKey: JERSEY_CITY_KEYS.jurisdiction,
    permitTypeKey: "building",
    isAvailable: true,
    localName: "Construction permit — building subcode",
    officialUrl:
      "https://www.jerseycitynj.gov/cityhall/HousingAndDevelopment/constructioncode",
    notes:
      "New construction is priced on the volume of the structure at $0.027 a cubic foot, except for use groups A-1, A-2, A-4, A-5, F-1, F-2, S-1 and S-2 at $0.15. Renovations, alterations and repairs are priced at $15 per $1,000 of estimated cost, with a $50 floor for a short permit and a $100 floor for a plan permit. A permit combining new construction, an addition and alterations is the sum of the fees computed separately.",
  },
  {
    jurisdictionKey: JERSEY_CITY_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    isAvailable: true,
    localName: "Construction permit — electrical subcode",
    officialUrl:
      "https://www.jerseycitynj.gov/cityhall/HousingAndDevelopment/constructioncode",
    notes:
      "Receptacles, fixtures and devices are charged in blocks — $25 for the first ten and $25 for each additional twenty-five — with separate flat charges for a private pool, spa, hot tub or fountain ($46) and for a leak detection system ($100), and $23 a dwelling unit for detectors and alarm systems in a one- or two-family dwelling. Devices rated above those blocks are priced individually in the schedule and are named on the page rather than charged here.",
  },
  {
    jurisdictionKey: JERSEY_CITY_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    isAvailable: true,
    localName: "Construction permit — plumbing subcode",
    officialUrl:
      "https://www.jerseycitynj.gov/cityhall/HousingAndDevelopment/constructioncode",
    notes:
      "$10 for each plumbing fixture, with the schedule's own list running from a water closet to a yard drain, and $300 for a back flow cross connection, which includes three external and one internal inspection. Two dozen further devices carry prices of their own — a water heater at $30, most of the drainage and special devices at $40, a fire sprinkler main at $60 — all named on the page and not charged here.",
  },
  {
    jurisdictionKey: JERSEY_CITY_KEYS.jurisdiction,
    permitTypeKey: "demolition",
    isAvailable: true,
    localName: "Demolition permit",
    officialUrl:
      "https://www.jerseycitynj.gov/cityhall/HousingAndDevelopment/constructioncode",
    notes:
      "§160-1 M(6)(a): $200 for use groups R-3 and R-5 and $250 for all other use groups. Published and named on the building page; not priced here, because the calculator's building permit takes no demolition input.",
  },
];

const feeSchedules: SeedFeeSchedule[] = [
  {
    key: JERSEY_CITY_KEYS.feeSchedule,
    jurisdictionKey: JERSEY_CITY_KEYS.jurisdiction,
    sourceKey: JERSEY_CITY_CODE_SOURCE_KEY,
    title:
      "Jersey City Municipal Code, Chapter 160 — Fees and Charges, §160-1 M (Uniform Construction Code fees)",
    officialUrl:
      "https://library.municode.com/nj/jersey_city/codes/code_of_ordinances?nodeId=CH160FECH_S160-1FESCES",
    effectiveFrom: JERSEY_CITY_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: JERSEY_CITY_LAST_VERIFIED,
    notes:
      "The construction permit fees are one block of Chapter 160, not a document of their own: §160-1 M gathers the building, plumbing, electrical, fire, elevator and miscellaneous subcode fees into a single schedule \"established pursuant to N.J.S.A. 52:27D-126a\". The date recorded here is the last date the block changed — 11 September 2013, when Ord. 13-081 reset the Department of Public Safety connection fee — and not the date the base rates were written, which the codifier's consolidation does not date row by row. Ord. 26-051, adopted 15 July 2026, revised Chapter 160 comprehensively and left this block alone.",
  },
];

function attach(permitTypeKey: string, rules: SeedFeeRule["rule"][]): SeedFeeRule[] {
  return rules.map((rule) => ({
    jurisdictionKey: JERSEY_CITY_KEYS.jurisdiction,
    permitTypeKey,
    scheduleKey: JERSEY_CITY_KEYS.feeSchedule,
    rule,
  }));
}

const feeRules: SeedFeeRule[] = [
  ...attach("building", JERSEY_CITY_BUILDING_BASE_RULES),
  ...attach("electrical", JERSEY_CITY_ELECTRICAL_BASE_RULES),
  ...attach("plumbing", JERSEY_CITY_PLUMBING_BASE_RULES),
];

const requirements: SeedRequirement[] = [
  {
    jurisdictionKey: JERSEY_CITY_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "Volume measured under the State's own rule, for new construction",
    description:
      "§160-1 M(1)(a): \"Fees for new construction shall be based upon the volume of the structure. Volume shall be computed in accordance with N.J.A.C. 5:23-2.28.\" The ordinance does not restate the measurement, it adopts the State's: the volume of the building as the construction official computes it, which is the same measurement Newark's §7A:2-2 spells out in its own words.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: JERSEY_CITY_CODE_SOURCE_KEY,
    lastVerifiedAt: JERSEY_CITY_LAST_VERIFIED,
  },
  {
    jurisdictionKey: JERSEY_CITY_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "A permit that mixes new construction, an addition and alterations is charged for each",
    description:
      "§160-1 M(1)(e): \"Total fee for combination of new construction, additions to existing structures and repairs, renovations and alterations shall be the sum of the fees computed separately in accordance with Subsections M(1) through (5).\" It is the City's own statement of what the calculator does with a mixed application, and the reason a volumetric row and a cost row can both belong to one permit.",
    isMandatory: true,
    sortOrder: 20,
    sourceKey: JERSEY_CITY_CODE_SOURCE_KEY,
    lastVerifiedAt: JERSEY_CITY_LAST_VERIFIED,
  },
  {
    jurisdictionKey: JERSEY_CITY_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "Plan review is 25% of the permit fee, paid at submission",
    description:
      "§160-1 M(1)(o): \"Plan Review Fee shall be 25% of the estimated cost of permits which is nonrefundable.\" N.J.A.C. 5:23-4.18(a)1, which every New Jersey municipal fee ordinance has to meet, provides that the plan review fee is paid when the application is submitted and that the amount \"shall then be deducted from the amount of the fee due for a construction permit, when the permit is issued\" — so it is the first quarter of the permit fee rather than a further 25% on top of it.",
    isMandatory: true,
    sortOrder: 30,
    sourceKey: JERSEY_CITY_CODE_SOURCE_KEY,
    lastVerifiedAt: JERSEY_CITY_LAST_VERIFIED,
  },
  {
    jurisdictionKey: JERSEY_CITY_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "other",
    title: "Everything wired counts, except what is plugged in",
    description:
      "§160-1 M(3)(l): \"For the purpose of computing these fees, all electrical and communications devices, utilization equipment and motors which are part of premises wiring, except those which are portable plug-in type, shall be counted.\" The same subcode adds that a multi-meter stack is charged on the ampere rating of its main bus rather than on the number of meters, and that a motor with its own controls is charged once, on the rating of the motor.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: JERSEY_CITY_CODE_SOURCE_KEY,
    lastVerifiedAt: JERSEY_CITY_LAST_VERIFIED,
  },
  {
    jurisdictionKey: JERSEY_CITY_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    requirementType: "other",
    title: "The list of what counts as a plumbing fixture is the schedule's own",
    description:
      "§160-1 M(2)(a) names twenty-two things that are plumbing fixtures at $10.00 each — a water closet, urinal, bidet, bathtub, lavatory, shower, floor drain, sink, dishwasher, drinking fountain, washing machine hose bib, closet bend, coffee maker, gas appliance, gas service connection, ice maker, rain leader, roof drain, sprinkler head, sump pump, trap primer, washing machine tray and yard drain — and M(2)(c) adds another list at the same rate. Counting those items is what the plumbing fee is, so the list is the requirement rather than a description of one.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: JERSEY_CITY_CODE_SOURCE_KEY,
    lastVerifiedAt: JERSEY_CITY_LAST_VERIFIED,
  },
];

const profile: SeedProfile = {
  jurisdictionKey: JERSEY_CITY_KEYS.jurisdiction,
  headline: "What construction permits cost in Jersey City",
  summary:
    "Jersey City prices a new building on its **volume**: $0.027 a cubic foot for most use groups, and $0.15 for assembly and storage-and-factory groups — five and a half times as much for the same building. Renovations, alterations and repairs are priced at $15 per $1,000 of estimated cost, with a $50 floor for a short permit and $100 when a plan is filed. Electrical work is charged in blocks — $25 for the first ten receptacles and $25 for each additional twenty-five — and plumbing work at $10 a fixture, with $300 for a back flow cross connection. The State's permit surcharge of $0.00371 a cubic foot or $1.90 per $1,000 is added to all of it.",
  localContext:
    "Jersey City's construction fees are one block of a much larger fee chapter. Chapter 160 sets fees for everything the City charges for — the clerk's records, the fire prevention permits, the dumpster and roadway permits, the film permits, contractor registration — and §160-1 M is the part of it that implements Chapter 131, the City's Uniform Construction Code. The schedule inside M is the standard New Jersey shape: a building subcode, a plumbing subcode, an electrical subcode, a fire subcode and an elevator subcode, each with its own rows, because a New Jersey construction permit is \"the sum of the fees for each subcode permit\".\n\nThe most expensive thing in it is one word: use group. New construction is $0.027 a cubic foot for buildings and structures \"of all use groups\" except A-1, A-2, A-4, A-5, F-1, F-2, S-1 and S-2, which pay $0.15 — a 100,000 cubic foot assembly building is $15,000.00 against $2,700.00 for the same volume as a business, and nothing in the ordinance explains the gap. That list is also printed with A-2 in it twice and A-3 absent, which the building page states rather than quietly reading one of the two A-2s as an A-3.\n\nTwo charges that look like fees are not charged twice here. Plan review is 25% of the estimated cost of the permits, non-refundable, paid when the application is submitted — and N.J.A.C. 5:23-4.18(a)1, the State standard the ordinance implements, requires that amount to be deducted from the permit fee when the permit is issued, which makes it the first quarter of the permit fee rather than a surcharge on it. The State's permit surcharge is the other: the City prints $0.00265 a cubic foot and $0.00135 per $1,000, which were the State's amounts before the mid-1990s, and the same section of the code says that certain of its fees \"are set by the State of New Jersey\" and that changes to them \"will be incorporated herein by reference\". Both the City's figures and the State's current ones are printed on every page here, and the State's are what is charged, because the City collects this fee rather than setting it.\n\nOn the trade side the schedule is longer than it looks. Plumbing has a $10 fixture row and then a menu of two dozen devices with prices of their own, from a water heater at $30 to a fire sprinkler main at $60; electrical has a block rate, four rating bands for motors, transformers and switchgear, and separate charges for a private pool and for a leak detection system. The pages here price the rows a reader can count, and name every other amount in the list so that nothing is invisible.",
  valuationBasis:
    "Two bases, as everywhere in New Jersey. A new building is charged on its **volume in cubic feet**, computed under N.J.A.C. 5:23-2.28 rather than by the ordinance's own definition, and multiplied by the use group's rate — $0.027 a cubic foot, or $0.15 for the groups in M(1)(a)'s exception. A renovation, alteration or repair is charged on the **estimated cost of work** at $15 per $1,000, and where an application combines the two, M(1)(e) says the fees are computed separately and summed.\n\nThe trade subcodes work from counts rather than from measurements: plumbing is $10 a fixture with the schedule's own list of what a fixture is, electrical is $25 for the first ten devices and $25 for each additional twenty-five, and the State's surcharge on trade work is charged on the value of the work instead. Nothing here derives a volume from a floor area or a cost from a square-foot rate, because the City publishes neither.",
  notIncluded:
    "These figures are Jersey City's building, electrical and plumbing subcode fees and the State permit surcharge on them. They are not a total project cost, and they exclude:\n\n- **Plan review**, which is not a surcharge: M(1)(o) sets it at 25% of the estimated cost of the permits, non-refundable, and N.J.A.C. 5:23-4.18(a)1 requires it to be deducted from the permit fee when the permit issues. A permit that the City bills as 25% more than the figure here would be $1,000 more on a $400,000 building.\n- **The fire subcode** (M(4)): sprinkler heads at $75 up to 20, $125 to 100 and $125 plus $1 for each head over 100; suppression systems and valves at $150 a system with standpipes at $230 a riser; alarm devices at $25 for ten, $60 for twenty, $1 for each one after that and $100 per 10,000 square feet; pre-engineered systems at $100 and $150; kitchen exhaust at $100; gas or oil fired devices at $50; tank installation or removal at $100 to $300 by gallonage; a $75 minimum; a $125 Department of Public Safety connection; incinerators and crematoriums at $365. Published, transcribed in the research record, and not attached to a page.\n- **The plumbing device menu** in M(2)(b) and M(2)(c): water heaters, steam and hot water boilers, water service and ventilating equipment at $30, the sewer pump, interceptor, separator, grease trap, sewer connection, stack, catch basin, dental chair, cooling unit, fire hydrant, house sewer, soil line connection, sewage ejector, storm sewer, storm sewer connection, vent line and water riser line at $40, the fire sprinkler main at $60, an active solar system at $35, a tankless heater at $25, a garbage disposal at $15, the grease interceptor at $30 and a house drain at $20 or $30 by size. Named on the plumbing page; the model charges the $10 fixture row.\n- **The electrical rating bands**: the $10 row (motors of one to ten horsepower, transformers of one to ten kilowatts, a branch-circuit replacement, a storable pool, underwater lighting, cooking equipment up to ten kilowatts, an alarm control unit, receptacles of thirty to fifty amperes, a light standard over eight feet and a communications closet), the $45 row (motors above ten to fifty horsepower, equipment rated up to 225 amperes, transformers above ten to 45 kilowatts, signs above twenty to 200 amperes, receptacles above fifty amperes and utility load management devices), the $85 row and the $412 row above those. Named on the electrical page.\n- **The elevator subcode** (M(5)), both tables: $243 for a traction elevator to ten floors and $405 above, $216 for a hydraulic, $216 for an escalator, $54 for a dumbwaiter, $43 for oil buffers and $260 for plan review, plus the annual inspection schedule from $54 to $497.\n- **Everything else in M(1)**: asbestos removal at $50, lead paint abatement at $140, exterior hoistways at $260, above-ground pools at $50 and $100 and in-ground pools at $75 and $150 by size, tents over 900 square feet at $92, signs at $1.50 a square foot, prototype filing at 80% for each additional prototype, and emergency and exit lights at $25 for the first ten and $25 for each additional twenty-five.\n- **Demolition** ($200 for use groups R-3 and R-5, $250 otherwise), **variations** ($200 an application), **certificates of occupancy** ($100, and $200 for a certificate of continued occupancy), and the **annual construction permit** at $667 a worker for up to twenty-five workers and $232 for each one over that.\n- **Anything charged by another authority.** Hudson County, the Jersey City Municipal Utilities Authority and the State of New Jersey each charge their own fees, and the State permit surcharge shown here is the only State charge included.",
  seoTitle: "Jersey City construction permit fees",
  seoDescription:
    "How Jersey City, New Jersey prices construction permits — $0.027 a cubic foot or $0.15 for assembly and storage groups, $15 per $1,000 of alteration cost, $25 electrical blocks and $10 a plumbing fixture, plus the State surcharge.",
  publishStatus: "published",
  noindex: false,
  lastReviewedAt: JERSEY_CITY_LAST_VERIFIED,
};

const permitPages: SeedPermitPage[] = [
  {
    jurisdictionKey: JERSEY_CITY_KEYS.jurisdiction,
    permitTypeKey: "building",
    slug: "building-permit-cost",
    title: "Jersey City building permit cost",
    intro:
      "A Jersey City building permit is priced on the **volume of the structure** if the work is new construction: $0.027 a cubic foot for buildings of all use groups except A-1, A-2, A-4, A-5, F-1, F-2, S-1 and S-2, which pay $0.15. A renovation, alteration or repair is priced on the estimated cost of work instead, at $15 per $1,000, with a $50 minimum for a short permit and $100 when a plan is filed. A permit that mixes new construction with alterations is charged for each, and the State's permit surcharge is added to both.",
    localSummary:
      "The use group decides more here than in most cities. A 100,000 cubic foot building is $2,700.00 at the general rate and $15,000.00 if it is an assembly or storage-and-factory group — the same volume, five and a half times the fee — and the list of high-rate groups is printed with A-2 in it twice and A-3 absent. This site charges the list as printed, which means an A-3 building is at the general rate, and a reader with an A-3 project should confirm the point with the Construction Official before relying on the figure.\n\nAlteration work is a single rate, and that makes Jersey City simpler than its neighbour: $15 per $1,000 of estimated cost, with no band to read. The two floors are the part to watch — a short permit is floored at $50 and a permit filed with plans at $100 — because a small job pays the floor rather than the rate.\n\nM(1)(e) is worth knowing before adding anything up. Where an application covers new construction, an addition and alterations at once, the City computes the fees separately and sums them, which is why the calculator here can charge a volumetric row and a cost row on one permit rather than choosing between them.",
    notIncluded:
      "This is the building subcode's fee and the State permit surcharge. It excludes:\n\n- **Plan review**, which is not charged here: M(1)(o) sets it at 25% of the estimated cost of the permits and N.J.A.C. 5:23-4.18(a)1 requires it to be deducted from the permit fee when the permit is issued, so it is a prepayment of the first quarter of the fee. If the City reads its own row as an addition rather than a prepayment, every building permit is 25% higher than the figure shown.\n- **The State surcharge as the City prints it.** M(1)(g) reads \"$0.00265 per cubic foot volume of new construction\" and \"$0.00135 of cost of construction for alterations\"; the amount charged here is N.J.A.C. 5:23-4.19(b)'s current $0.00371 a cubic foot and $1.90 per $1,000, minimum $1.00. The code says State-set fees are incorporated by reference as the State changes them.\n- **The fire subcode**, which a project with sprinklers or alarms also carries: heads, suppression systems, standpipes, alarm devices, kitchen exhaust, gas and oil fired devices, tanks, and a $75 minimum with a $125 Public Safety connection.\n- **Asbestos removal** at $50, **lead paint abatement** at $140, **exterior hoistways** at $260, **above-ground pools** at $50 and $100 and **in-ground pools** at $75 and $150 by size, **tents** over 900 square feet at $92, and **signs** at $1.50 a square foot.\n- **Demolition** at $200 for use groups R-3 and R-5 and $250 otherwise, **variations** at $200 an application, and **certificates of occupancy** at $100, or $200 for a certificate of continued occupancy.\n- **Prototype filing**, where the master plan pays the full permit fees and each additional prototype is 80% of the permit value, and the **annual construction permit** at $667 a worker for up to twenty-five workers.\n- **Emergency and exit lights**, at $25 for the first ten and $25 for each additional twenty-five, which the schedule prices on its own row rather than with the other devices.\n- **Anything charged by another authority** — Hudson County, the Municipal Utilities Authority, or the State's own permits and licences.",
    workedExample: {
      scenario:
        "A new residential building of 40,000 cubic feet in use group R, no alterations and no addition, with no plan-review credit applied.",
      inputs: { custom: { use_group: "R", cubic_footage: 40_000 } },
      notes:
        "R is a general-rate use group, so the fee is 40,000 cubic feet at $0.027, which is $1,080.00. Reading the same building as an A-2 or an F-1 would put it on the $0.15 row instead and multiply the fee to $6,000.00 — the single largest variable in any Jersey City building permit.\n\nThe State permit surcharge is the second line, at $0.00371 a cubic foot: $148.40, collected by the City and forwarded to the Division of Codes and Standards. The City's own M(1)(g) prints that fee as $0.00265 a cubic foot, which would be $106.00; N.J.A.C. 5:23-4.19(b) sets it, and the code says State-set fees are incorporated by reference as they change, so the State's figure is the one charged.\n\nPlan review at 25% is not in the total. The City's row makes it non-refundable and payable with the application, and the State standard the ordinance implements has it deducted from the permit fee when the permit issues — so on this building it is $270.00 paid up front against the $1,080.00, not another $270.00 on top of it.",
    },
    faqs: [
      {
        question: "How much is a building permit in Jersey City?",
        answer:
          "New construction is $0.027 per cubic foot of the structure's volume for most use groups, and $0.15 per cubic foot for use groups A-1, A-2, A-4, A-5, F-1, F-2, S-1 and S-2. Renovations, alterations and repairs are $15 per $1,000 of estimated cost of work, with a $50 minimum for a short permit and $100 for a permit filed with plans.",
        sourceId: JERSEY_CITY_CODE_SOURCE_KEY,
      },
      {
        question: "Why does the fee jump so much for some use groups?",
        answer:
          "M(1)(a) charges $0.15 a cubic foot instead of $0.027 for assembly buildings and for the F-1, F-2, S-1 and S-2 storage and factory groups — about five and a half times the general rate, on the same volume. A 40,000 cubic foot residential building is $1,080.00; the same building as an A-2 is $6,000.00.",
        sourceId: JERSEY_CITY_CODE_SOURCE_KEY,
      },
      {
        question: "The list of use groups names A-2 twice — what applies to an A-3 building?",
        answer:
          "The ordinance prints \"A-1, A-2, A-2, A-4, A-5, F-1, F-2, S-1 and S-2\" — A-2 twice, A-3 not at all — and does not say which was meant. This site charges the list as printed, so an A-3 building is at the general $0.027 rate here. Given the gap between the two rates, an A-3 project should confirm the point with the Construction Official before relying on either figure.",
        sourceId: JERSEY_CITY_CODE_SOURCE_KEY,
      },
      {
        question: "Is plan review an extra 25%?",
        answer:
          "No. M(1)(o) makes the plan review fee 25% of the estimated cost of the permits and non-refundable, payable when the application is submitted. N.J.A.C. 5:23-4.18(a)1 — the State standard the ordinance implements — requires that amount to be deducted from the fee due for the construction permit when it is issued, so it is a prepayment of part of the permit fee.",
        sourceId: JERSEY_CITY_STATE_UCC_SOURCE_KEY,
      },
      {
        question: "What is the State surcharge on a Jersey City building permit?",
        answer:
          "$0.00371 per cubic foot of new construction and additions, or $1.90 per $1,000 of value for other construction, with a $1.00 minimum, collected by the City for the Division of Codes and Standards under N.J.A.C. 5:23-4.19(b). The City's own schedule prints the pre-1995 pair — $0.00265 a cubic foot and $0.00135 per $1,000 — and states that State-set fees are incorporated by reference as they change.",
        sourceId: JERSEY_CITY_STATE_UCC_SOURCE_KEY,
      },
      {
        question: "Does a permit that adds to a building and renovates it pay both fees?",
        answer:
          "Yes. M(1)(e) says the total fee for a combination of new construction, additions, repairs, renovations and alterations \"shall be the sum of the fees computed separately\", so the new volume is charged at the volumetric rate and the alteration work at $15 per $1,000 of its estimated cost.",
        sourceId: JERSEY_CITY_CODE_SOURCE_KEY,
      },
    ],
    seoTitle: "Jersey City NJ building permit cost: $0.027 or $0.15 per cubic foot",
    seoDescription:
      "Jersey City, New Jersey building permit fees — $0.027 per cubic foot and $0.15 for assembly and storage groups, $15 per $1,000 of alteration cost, $50 and $100 minimums, and the State permit surcharge.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: JERSEY_CITY_LAST_VERIFIED,
  },
  {
    jurisdictionKey: JERSEY_CITY_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    slug: "electrical-permit-cost",
    title: "Jersey City electrical permit cost",
    intro:
      "Jersey City charges electrical work in **blocks of devices**: $25 for the first ten receptacles, fixtures or devices, and $25 for each additional twenty-five. A private swimming pool, spa, hot tub or fountain is a flat $46 with its bonding and equipment included, a leak detection system is $100, and smoke or heat detectors and alarm systems in a one- or two-family dwelling are $23 per dwelling unit. Motors, transformers and switchgear are priced individually in the same schedule, by rating.",
    localSummary:
      "The block row is the schedule's main electrical charge, and it is generous at the bottom and steady above it: eleven devices cost $50.00 and thirty-five cost $50.00, while the thirty-sixth starts another $25.00 block. What counts as a device is unusually well defined — lighting fixtures, wall switches, convenience receptacles, sensors, dimmers, alarm devices, smoke and heat detectors, communications outlets, light standards eight feet or less, emergency lights, exit lights, and anything similar rated twenty amperes or less, including motors under one horsepower.\n\nAbove that row the schedule prices equipment by rating: a $10 group that includes motors of one to ten horsepower and transformers of one to ten kilowatts, a $45 group from there up to fifty horsepower and 225 amperes, an $85 group to a hundred horsepower and 1,000 amperes, and a $412 group above that. None of those four rows is priced by this calculator, because a horsepower, kilowatt or ampere rating per device is not an input it collects — the amounts are named here instead.\n\nTwo flat charges are easy to miss and both are common on residential work. A private pool, spa, hot tub or fountain is $46.00 no matter how much equipment comes with it, and the subcode says that charge covers the bonding, the filter pumps, the disconnecting means, the switches, the required receptacles and the heaters — everything except panel boards and underwater lighting. And in a one- or two-family dwelling, smoke and heat detectors and alarm systems are $23.00 per dwelling unit rather than a count of devices.",
    notIncluded:
      "This is the electrical subcode's block row, its three flat charges and the State permit surcharge. It excludes:\n\n- **The four device rating bands.** $10 each for motors of one to ten horsepower, transformers of one to ten kilowatts, a branch-circuit replacement, a storable pool or hydro-massage tub, underwater lighting, cooking equipment up to ten kilowatts, a fire, security or burglar alarm control unit, a receptacle of thirty to fifty amperes, a light standard over eight feet and a communications closet; $45 each for motors above ten to fifty horsepower, service equipment, panel boards, switchboards, switchgear, motor control centers and disconnecting means up to 225 amperes, transformers above ten to 45 kilowatts, signs above twenty to 200 amperes and utility load management devices; $85 each above those to a hundred horsepower, 1,000 amperes and 112.5 kilowatts; and $412 each above that.\n- **A public swimming pool's electrical work**, which is charged on the device and rating counts rather than the $46 flat row — that row is for a private pool.\n- **The certificate of compliance for pools, storage pools, spas and hot tubs**, at $25 a year, which is an annual certificate rather than a permit fee.\n- **The fire subcode's alarm and detection rows**, including $100 per 10,000 square feet on alarm systems and the $75 minimum, which are issued under a different subcode.\n- **The State surcharge as the City prints it** — M(1)(g) writes the State training fee at $0.00265 a cubic foot and $0.00135 per $1,000; the amount charged here is N.J.A.C. 5:23-4.19(b)'s current $1.90 per $1,000 of the value of the work, minimum $1.00.\n- **Plan review** at 25%, which is a prepayment under M(1)(o) and N.J.A.C. 5:23-4.18(a)1 rather than a charge on top of the permit.\n- **The annual construction permit** at $667 a worker and the contractor registration fee at $100, which are for firms maintaining premises rather than for a single job.",
    workedExample: {
      scenario:
        "A residential rewire with forty receptacles and devices on the permit and $12,000 of electrical work, with no pool, alarm system or leak detection.",
      inputs: {
        valuationCents: 1_200_000,
        custom: { outlets: 40 },
      },
      notes:
        "Forty devices are one first block of ten and thirty more, which is two blocks of twenty-five — so the fee is $25.00 for the first ten plus $25.00 for each of those two blocks, $75.00 in all. Thirty-nine devices would cost the same; forty-one would not.\n\nThe State permit surcharge is $1.90 per $1,000 of the $12,000 of work, which is $22.80 on its own line. Note what does not change it: the value of the work moves only that line, and the block fee is the same on a $12,000 rewire and a $120,000 one.\n\nTwo things are outside this figure. Motors, transformers and switchgear are priced by rating rather than by count — a single 50-horsepower motor is $85.00 on the $85 row, which is more than the entire block row here — and in a one- or two-family dwelling, detectors and alarm systems are charged at $23.00 a dwelling unit instead of as devices.",
    },
    faqs: [
      {
        question: "How are electrical permit fees calculated in Jersey City?",
        answer:
          "Receptacles, fixtures and devices are counted in blocks: $25 for the first ten, and $25 for each additional block of up to twenty-five. Above those counts, motors, transformers, service equipment, panel boards and switchgear are priced per device by horsepower, kilowatt or ampere rating, and there are separate flat charges for a private pool, a leak detection system and residential alarm systems.",
        sourceId: JERSEY_CITY_CODE_SOURCE_KEY,
      },
      {
        question: "What counts as a device on the block row?",
        answer:
          "Lighting fixtures, wall switches, convenience receptacles, sensors, dimmers, alarm devices, smoke and heat detectors, communications outlets, light standards eight feet or less in height, emergency lights, electric signs, exit lights and similar fixtures rated twenty amperes or less, including motors or equipment under one horsepower or one kilowatt. Anything portable and plug-in is not counted.",
        sourceId: JERSEY_CITY_CODE_SOURCE_KEY,
      },
      {
        question: "How much is a private pool's electrical permit?",
        answer:
          "$46.00 flat for a permanently installed private swimming pool, spa, hot tub or fountain, including any required bonding and the associated equipment — filter pumps, motors, disconnecting means, switches, required receptacles and heaters — except panel boards and underwater lighting fixtures, which are charged separately. A public pool is charged on the device and rating counts instead.",
        sourceId: JERSEY_CITY_CODE_SOURCE_KEY,
      },
      {
        question: "Is there a minimum electrical permit fee?",
        answer:
          "Not in the electrical subcode. The fire subcode publishes a $75 minimum permit fee and the building subcode floors alteration permits at $50 and $100, but M(3) sets no floor of its own — a permit with a small number of devices is charged at the block rate.",
        sourceId: JERSEY_CITY_CODE_SOURCE_KEY,
      },
      {
        question: "Do smoke detectors go on the block row?",
        answer:
          "In a one- or two-family dwelling they do not: M(3)(g) charges single and multiple station smoke or heat detectors and fire, burglar or security alarm systems at a flat $23.00 per dwelling unit. In any other building, detectors and alarm devices are counted on the block row like any other device.",
        sourceId: JERSEY_CITY_CODE_SOURCE_KEY,
      },
    ],
    seoTitle: "Jersey City NJ electrical permit cost: $25 a block of devices",
    seoDescription:
      "Jersey City, New Jersey electrical permit fees — $25 for the first ten receptacles and devices and $25 per additional twenty-five, a $46 private pool charge, $100 leak detection and $23 a unit for residential alarms.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: JERSEY_CITY_LAST_VERIFIED,
  },
  {
    jurisdictionKey: JERSEY_CITY_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    slug: "plumbing-permit-cost",
    title: "Jersey City plumbing permit cost",
    intro:
      "A Jersey City plumbing permit is **$10.00 a fixture**, and the schedule's own list of what a fixture is runs from a water closet, a urinal and a bathtub to a dishwasher, a gas appliance, a roof drain, an ice maker and a yard drain — twenty-two named items, with a second list at the same price behind it. Above that row sits a menu of devices with their own charges, from a tankless heater at $25 to a fire sprinkler main at $60, and a **$300 back flow cross connection**, which includes three external and one internal inspection.",
    localSummary:
      "Most plumbing work in Jersey City is the $10.00 row, and the list is long enough that this is usually the whole fee: a bathroom remodel of a water closet, a lavatory, a shower and a floor drain is $40.00, and a kitchen added to it with a sink and a dishwasher is $60.00. Gas appliances are on the same row rather than on a separate gas permit, so a new range is $10.00.\n\nThe devices with prices of their own are the part to look up rather than guess. A water heater is $30.00, and so are a steam or hot water boiler, a water service up to two inches and ventilating equipment. Most of the drainage side — a sewer pump, an interceptor, a separator, a grease trap, a sewer connection, a stack, a catch basin, a house sewer, a soil line connection, a sewage ejector, a storm sewer, a storm sewer connection, a vent line and a water riser line — is $40.00, with a fire sprinkler main at $60.00, a grease interceptor at $30.00 and a house drain at $20.00 or $30.00 by size. A back flow preventer is $10.00 for a domestic service and $75.00 for a fire service.\n\nThe back flow cross connection is the one charge that is not per item. It is $300.00 for the cross connection itself and includes three external and one internal inspection, so it is not a device count and it is not reduced by how many preventers are on the job.",
    notIncluded:
      "This is the plumbing subcode's $10.00 fixture row, the $300 back flow cross connection and the State permit surcharge. It excludes:\n\n- **The device menu** in M(2)(b) and M(2)(c): water heaters, steam and hot water boilers, water service up to two inches and ventilating equipment at $30.00; an A.C. unit at $30.00; the sewer pump, interceptor, separator, grease trap, sewer connection, stack, catch basin, dental chair, cooling equipment, fire hydrant, house sewer, soil line connection, sewage ejector, storm sewer, storm sewer connection, vent line and water riser line at $40.00; a fire sprinkler main and a water service above two inches at $60.00; an active solar system at $35.00; a tankless heater at $25.00; a garbage disposal at $15.00; a grease interceptor at $30.00; a house drain at $20.00 up to ten inches or $30.00 above; and a back flow preventer at $10.00 for a domestic service or $75.00 for a fire service. Each of those is priced by the schedule on its own row: the model charges the $10.00 fixture row, and these amounts are named rather than folded into it or left out.\n- **Water and sewer charges** made by the Jersey City Municipal Utilities Authority, which are utility charges rather than permit fees.\n- **The fire subcode's suppression rows**, including sprinkler heads, standpipes and the $75 minimum, which are issued under a different subcode even when the work is plumbing-adjacent.\n- **The State surcharge as the City prints it** — M(1)(g) writes the State training fee for alterations at $0.00135 per $1,000; the amount charged here is N.J.A.C. 5:23-4.19(b)'s current $1.90 per $1,000 of the value of the work, minimum $1.00.\n- **Plan review** at 25%, a prepayment under M(1)(o) and N.J.A.C. 5:23-4.18(a)1 rather than an addition to the permit.\n- **Certificates of occupancy** at $100 and certificates of continued occupancy at $200, which are issued at the end of the work.",
    workedExample: {
      scenario:
        "A fourteen-fixture plumbing permit in an existing building — a water closet, lavatories, sinks, a dishwasher, a gas appliance and the associated drains — with $7,500 of plumbing work and no cross-connection programme.",
      inputs: { valuationCents: 750_000, fixtures: 14 },
      notes:
        "The fixture row is the whole plumbing fee: fourteen items at $10.00 each is $140.00, and the list they come from is printed in the schedule rather than left to a reader's judgement. A water heater added to the same permit would not be on this row — it is $30.00 on the device menu — and that is the main way the total moves.\n\nThe State permit surcharge is $1.90 per $1,000 of the $7,500 of work, or $14.25, on its own line. If the work is a new building rather than an alteration the State figure is charged per cubic foot instead, and the City's own schedule prints both halves of it as the older pair of $0.00265 a cubic foot and $0.00135 per $1,000.\n\nOne charge is not here and is easy to underestimate: a back flow cross connection is $300.00 on its own row, which is more than twice this permit, and it carries three external and one internal inspection with it.",
    },
    faqs: [
      {
        question: "How much is a plumbing permit in Jersey City?",
        answer:
          "$10.00 for each plumbing fixture. The schedule names twenty-two things that are fixtures at that price, including a water closet, urinal, bidet, bathtub, lavatory, shower, floor drain, sink, dishwasher, drinking fountain, washing machine hose bib, coffee maker, gas appliance, ice maker, rain leader, roof drain, sprinkler head, sump pump, trap primer, washing machine tray and yard drain, and prices a further list of fittings the same way.",
        sourceId: JERSEY_CITY_CODE_SOURCE_KEY,
      },
      {
        question: "Is a water heater charged as a fixture?",
        answer:
          "No. A water heater is on the device menu in M(2)(b) at $30.00, and so are a steam boiler, a hot water boiler, a water service up to two inches and ventilating equipment. The $10.00 fixture row is for the items M(2)(a) and the second half of M(2)(c) name.",
        sourceId: JERSEY_CITY_CODE_SOURCE_KEY,
      },
      {
        question: "What is the $300 back flow cross connection charge?",
        answer:
          "It is M(2)(d)'s charge for a back flow cross connection, and it \"includes 3 external and 1 internal inspection\". It is charged for the cross connection rather than per device, and the back flow preventer itself is charged separately on the device menu — $10.00 for a domestic service and $75.00 for a fire service.",
        sourceId: JERSEY_CITY_CODE_SOURCE_KEY,
      },
      {
        question: "Are there different rates for residential and commercial plumbing work?",
        answer:
          "No. M(2) charges $10.00 a fixture for the listed items whoever the applicant is, and the devices with their own prices are priced the same way for both. What differs between a house and a commercial building in this chapter is the building subcode's use-group rate, not the plumbing row.",
        sourceId: JERSEY_CITY_CODE_SOURCE_KEY,
      },
      {
        question: "Does a permit for a new building pay the plumbing fee per fixture or by value?",
        answer:
          "Per fixture. The plumbing subcode has no volumetric rate — a new building's plumbing work is charged as so many $10.00 fixtures, and the building's volume is charged on the building subcode's own row. M(1)(e) is explicit that a combined application is the sum of the fees computed separately.",
        sourceId: JERSEY_CITY_CODE_SOURCE_KEY,
      },
    ],
    seoTitle: "Jersey City NJ plumbing permit cost: $10 a fixture",
    seoDescription:
      "Jersey City, New Jersey plumbing permit fees — $10 for each listed fixture, a $300 back flow cross connection including three external and one internal inspection, the device menu, and the State permit surcharge.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: JERSEY_CITY_LAST_VERIFIED,
  },
];

const verifications: SeedVerification[] = [
  {
    entityType: "source",
    entityKey: JERSEY_CITY_CODE_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: JERSEY_CITY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: JERSEY_CITY_CODE_SOURCE_KEY,
    notes:
      "Read 2026-09-25 from the City's codifier, Supplement No. 52. §160-1 M transcribed in full: the building subcode's two volumetric rates, its alteration rate and its $50 and $100 floors, the plan review rule and the State training fee, the asbestos, lead, hoistway, pool, tent and sign rows, the emergency and exit light row, the plumbing fixture list with its device menu and the $300 cross connection, the electrical block row with its four rating bands and its four flat charges, the fire subcode's sprinkler, detection, suppression and tank rows, the two elevator tables, and the miscellaneous and non-construction fees in M(6) and M(7).",
  },
  {
    entityType: "source",
    entityKey: JERSEY_CITY_ORDINANCE_SOURCE_KEY,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: JERSEY_CITY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: JERSEY_CITY_ORDINANCE_SOURCE_KEY,
    notes:
      "Read 2026-09-25 as a 71-page PDF and used to date the schedule rather than to source an amount. Its attachment reproduces Chapter 160 with the existing and the amended figure printed for each fee it changes — the marriage-record correction from $20 to $30, the former Chapter 142 dance-hall note, the entertainment licences — and the Uniform Construction Code block carries one figure per row, which is the evidence that this revision did not move the construction fees.",
  },
  {
    entityType: "source",
    entityKey: JERSEY_CITY_STATE_UCC_SOURCE_KEY,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: JERSEY_CITY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: JERSEY_CITY_STATE_UCC_SOURCE_KEY,
    notes:
      "Read 2026-09-25 as the Department of Community Affairs' consolidated N.J.A.C. 5:23-4, current through New Jersey Register Volume 58 No. 16. §5:23-4.18(a)1 read for the plan-review deduction, (b) for the 5% to 25% range and the 20% reduction on a waived review, (c) for the volume and construction-cost bases, and §5:23-4.19(b) for the surcharge's amount, its $1.00 minimum and its exemptions, together with the regulation's amendment history showing the amount rising from $0.0016 to $0.00371 a cubic foot.",
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-NEW-PER-CF-0-027",
    permitTypeKey: "building",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: JERSEY_CITY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: JERSEY_CITY_CODE_SOURCE_KEY,
    notes:
      "M(1)(a): \"$.027 per cubic foot of volume for buildings and structures of all use groups\", except the eight listed above it. Stored as the exact fraction 27/10 cents, because $0.027 is not a whole number of cents and rounding it to three would put every building permit 11% high.",
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-NEW-PER-CF-0-15",
    permitTypeKey: "building",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: JERSEY_CITY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: JERSEY_CITY_CODE_SOURCE_KEY,
    notes:
      "M(1)(a)'s exception: \"$0.15 per cubic foot of volume for use groups A-1, A-2, A-2, A-4, A-5, F-1, F-2, S-1 and S-2\". Modelled as printed — A-2 twice — and the page states that A-3 does not appear in the list and is therefore charged the general rate here.",
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-ALTERATION",
    permitTypeKey: "building",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: JERSEY_CITY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: JERSEY_CITY_CODE_SOURCE_KEY,
    notes:
      "M(1)(b): \"$15\" for each $1,000 of estimated cost of work — 1,500 cents per thousand — with no band structure to misread, unlike Newark's three-band table.",
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-MINIMUM-SHORT-50",
    permitTypeKey: "building",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: JERSEY_CITY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: JERSEY_CITY_CODE_SOURCE_KEY,
    notes:
      "M(1)(c): \"Minimum fee for short permit for renovations, alterations or repairs: $50.\" Its sibling at $100 is gated to an application filed with plans, so exactly one of the two floors can apply.",
  },
  {
    entityType: "fee_rule",
    entityKey: "ELEC-RECEPTACLES-AND-DEVICES",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: JERSEY_CITY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: JERSEY_CITY_CODE_SOURCE_KEY,
    notes:
      "M(3)(a): $25 for the first block of one to ten receptacles, fixtures or devices, and $25 for each additional block of up to twenty-five. Stored as 100 cents a device with a ten-device allowance and a twenty-five-device block, which reproduces the published $25 at every boundary: 10 devices pay $25, 11 and 35 pay $50, 36 pays $75.",
  },
  {
    entityType: "fee_rule",
    entityKey: "PLUMB-FIXTURES",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: JERSEY_CITY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: JERSEY_CITY_CODE_SOURCE_KEY,
    notes:
      "M(2)(a): \"Plumbing fixtures: $10.00\", with its twenty-two named examples, and M(2)(c)'s second list at the same price. The device menu in M(2)(b) is priced separately by the schedule and named on the page rather than charged here.",
  },
  {
    entityType: "permit_page",
    entityKey: "building-permit-cost",
    permitTypeKey: "building",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: JERSEY_CITY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: JERSEY_CITY_CODE_SOURCE_KEY,
    notes:
      "The two volumetric rates, the single alteration rate, the two floors, the plan-review reading and the State surcharge. The worked example is arithmetic on the ordinance: 40,000 cubic feet at $0.027 is $1,080.00 and the State's $0.00371 a cubic foot is $148.40.",
  },
  {
    entityType: "permit_page",
    entityKey: "electrical-permit-cost",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: JERSEY_CITY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: JERSEY_CITY_CODE_SOURCE_KEY,
    notes:
      "The block row, the four rating bands it names and does not charge, and the four flat charges — pool, residential alarm, leak detection and the pool certificate — with the answering rule on what counts as a device.",
  },
  {
    entityType: "permit_page",
    entityKey: "plumbing-permit-cost",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: JERSEY_CITY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: JERSEY_CITY_CODE_SOURCE_KEY,
    notes:
      "The $10 fixture row and the $300 cross connection, with the device menu named amount by amount so that a reader pricing a water heater or a sewer connection can see what the schedule charges even though the calculator does not hold that row.",
  },
  {
    entityType: "jurisdiction_profile",
    entityKey: JERSEY_CITY_KEYS.jurisdiction,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: JERSEY_CITY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: JERSEY_CITY_CODE_SOURCE_KEY,
    notes:
      "Hub content built from §160-1 M and N.J.A.C. 5:23-4, recorded with Ord. 26-051 as the instrument that dates the schedule. The profile states the three readings the model depends on — plan review as a prepayment, the State surcharge at the State's amount, and the use-group list as printed — and names the fire subcode, the plumbing device menu, the electrical rating bands and the elevator tables as published and unmodelled.",
  },
];

export const jerseyCitySeed: JurisdictionSeed = {
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
export const JERSEY_CITY_PUBLISHED_PERMIT_PAGES = jerseyCitySeed.permitPages.filter(
  (page) => page.publishStatus === "published" && !page.noindex,
);
