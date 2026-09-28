import type { JurisdictionSeed } from "@/content/seed-types";

import {
  BOULDER_BUILDING_RULES,
  BOULDER_ELECTRICAL_RULES,
  BOULDER_FEE_EFFECTIVE_FROM,
  BOULDER_FEE_SCHEDULE_SOURCE_KEY,
  BOULDER_PERMIT_PAGE_SOURCE_KEY,
  BOULDER_PLUMBING_RULES,
} from "./fee-rules";

/**
 * Boulder City, Nevada — a city inside Clark County, issuing its own permits.
 *
 * Chosen as Nevada's second jurisdiction for one reason that outranks size: it
 * publishes its figures in a two-page PDF with a working text layer, while Las
 * Vegas, Henderson and North Las Vegas all publish through client-rendered
 * calculators. See research/index.md for the three that are blocked and on what.
 *
 * It also does something no other jurisdiction on this site does: it publishes the
 * *unit costs* an applicant is meant to use to derive a valuation. A reader with
 * square footage and no contract price can follow the City's own arithmetic from
 * $112.65 per square foot to a permit fee, and the worked example on the building
 * page does exactly that.
 *
 * Research record: research/nevada/boulder-city.md.
 */

export const BOULDER_LAST_VERIFIED = "2026-09-24";

export const BOULDER_KEYS = {
  state: "nv",
  county: "clark-county",
  jurisdiction: "boulder-city",
  feeSchedule: BOULDER_FEE_SCHEDULE_SOURCE_KEY,
} as const;

const RESEARCHER = "Permit Fee Intelligence research pass 6 (Nevada)";

const state = {
  code: "NV",
  slug: "nevada",
  name: "Nevada",
  fipsCode: "32",
};

const county = {
  key: BOULDER_KEYS.county,
  slug: "clark-county",
  name: "Clark County",
  fipsCode: "32003",
};

export const boulderCitySeed: JurisdictionSeed = {
  state,
  county,

  jurisdiction: {
    key: BOULDER_KEYS.jurisdiction,
    stateKey: BOULDER_KEYS.state,
    countyKey: BOULDER_KEYS.county,
    type: "city",
    slug: "boulder-city",
    name: "Boulder City",
    officialName: "City of Boulder City",
    websiteUrl: "https://bcnv.org/171/Building-Permit-Guidelines-and-Forms",
    permitPortalUrl: "https://www.bcnv.org/DocumentCenter/View/68/2020-Fee-Schedule-PDF",
    timezone: "America/Los_Angeles",
    isActive: true,
  },

  departments: [
    {
      key: "boulder-building-safety",
      jurisdictionKey: BOULDER_KEYS.jurisdiction,
      kind: "building",
      name: "Community Development Department, Building and Safety Division",
      /*
        Everything in this row — the address, the main line, the permit mailbox —
        is printed on the fee schedule itself, in the Division's own header. That is
        the difference between this record and Clark County's: there the document
        printed an address and no number, and no number was written down.
      */
      phone: "(702) 293-9282",
      email: "buildingpermits@bcnv.org",
      url: "https://bcnv.org/171/Building-Permit-Guidelines-and-Forms",
      addressLine: "401 California Avenue, Boulder City, NV 89005",
      hours: null,
      notes:
        "Address, main line and permit mailbox are printed in the Division's own header on the fee schedule read for this page. Counter hours are not printed there and are not recorded; the Division's page was not opened for them in this pass.",
    },
  ],

  sources: [
    {
      key: BOULDER_FEE_SCHEDULE_SOURCE_KEY,
      jurisdictionKey: BOULDER_KEYS.jurisdiction,
      title: "Permit Fee Schedule and Valuation Table — Building and Safety Division",
      url: "https://www.bcnv.org/DocumentCenter/View/68/2020-Fee-Schedule-PDF",
      sourceType: "fee_schedule_pdf",
      issuingAuthority: "City of Boulder City, Building and Safety Division",
      authorityKind: "city",
      isPrimary: true,
      documentDate: "2020-08-03",
      effectiveFrom: BOULDER_FEE_EFFECTIVE_FROM,
      retrievedAt: "2026-09-24",
      lastVerifiedAt: BOULDER_LAST_VERIFIED,
      notes:
        "Two pages, sha256 e7500fcdecfeff7ee972630c03a6fdd384d42fb6ebd68b431c7732a384c0a748. Page 1 carries the trade and miscellaneous fees, page 2 the Valuation Table and the unit costs. It states its own effective date: \"Effective as of August 3, 2020\". Both pages were read twice: the Valuation Table was mis-paired by `pdftotext -layout`, which printed the fee column one row out of step with the range column, and the `-table` read caught it — the same class of error the project's two-mode rule exists to catch.",
    },
    {
      key: BOULDER_PERMIT_PAGE_SOURCE_KEY,
      jurisdictionKey: BOULDER_KEYS.jurisdiction,
      title: "Building Permit Guidelines and Forms — Building and Safety Division",
      url: "https://bcnv.org/171/Building-Permit-Guidelines-and-Forms",
      sourceType: "municipal_website",
      issuingAuthority: "City of Boulder City, Building and Safety Division",
      authorityKind: "city",
      isPrimary: false,
      documentDate: null,
      effectiveFrom: null,
      retrievedAt: "2026-09-24",
      lastVerifiedAt: BOULDER_LAST_VERIFIED,
      notes:
        "The Division's own landing page and the address the schedule prints for itself. It is recorded as the authority behind the schedule rather than as a source of rates: no figure on this site is taken from it.",
    },
  ],

  /*
    Empty on purpose. Building, electrical and plumbing are global rows already
    defined by the Texas and Arizona seeds, and the seed resolves them by key.
  */
  permitTypes: [],
  projectTypes: [],

  jurisdictionPermitTypes: [
    {
      jurisdictionKey: BOULDER_KEYS.jurisdiction,
      permitTypeKey: "building",
      isAvailable: true,
      localName: "Building permit",
      officialUrl: "https://bcnv.org/171/Building-Permit-Guidelines-and-Forms",
      notes:
        "Priced from the Valuation Table on page 2, plus the $40 issuance fee the schedule's own header says applies unless a block indicates otherwise. The table's banner sets whose number it is: \"VALUATION SHALL INCLUDE LABOR & MATERIALS FOR WORK BEING PERMITTED EVEN IF WORK IS COMPLETED AS OWNER/BUILDER\".",
    },
    {
      jurisdictionKey: BOULDER_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      isAvailable: true,
      localName: "Electrical permit",
      officialUrl: "https://bcnv.org/171/Building-Permit-Guidelines-and-Forms",
      notes:
        "Four published items on page 1 — service change by amperage at $80.00, $100.00 and $125.00, and temporary power at $290.00 — under the block heading \"Price Includes Issuance Fee\". Electrical work that is none of those four is not priced by this schedule, and the page says so rather than reaching for the building table, which this document never routes to.",
    },
    {
      jurisdictionKey: BOULDER_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      isAvailable: true,
      localName: "Plumbing permit",
      officialUrl: "https://bcnv.org/171/Building-Permit-Guidelines-and-Forms",
      notes:
        "Two published items on page 1: a gas line or pressure test at $70.00, and a water heater at $50.00 \"(Replacement only, per each unit/tank)\" — per unit, which is why it is modelled per unit rather than flat. Both under \"Price Includes Issuance Fee\".",
    },
    {
      jurisdictionKey: BOULDER_KEYS.jurisdiction,
      permitTypeKey: "mechanical",
      isAvailable: true,
      localName: "Mechanical permit (HVAC units)",
      officialUrl: "https://bcnv.org/171/Building-Permit-Guidelines-and-Forms",
      notes:
        "Published on page 1 as a real permit fee: $75.00 for a 1-3 ton unit, $100.00 for 3.5-5 ton, plus $35 and $60 respectively for each additional unit on one permit — a base-plus-per-unit shape. No mechanical page is published in this release, and that is a scope decision rather than a gap: the rows are transcribed in research/nevada/boulder-city.md.",
    },
  ],

  feeSchedules: [
    {
      key: BOULDER_FEE_SCHEDULE_SOURCE_KEY,
      jurisdictionKey: BOULDER_KEYS.jurisdiction,
      sourceKey: BOULDER_FEE_SCHEDULE_SOURCE_KEY,
      title: "Permit Fee Schedule and Valuation Table",
      officialUrl: "https://www.bcnv.org/DocumentCenter/View/68/2020-Fee-Schedule-PDF",
      effectiveFrom: BOULDER_FEE_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: BOULDER_LAST_VERIFIED,
      notes:
        "The whole schedule is one document and one effective date, stated on its face. The privilege tax rows carry their own note — \"Clark County rate effective as of July 1, 2020\" — and are not permit fees, so they are named on every page and charged by none of them.",
    },
  ],

  feeRules: [
    ...BOULDER_BUILDING_RULES.map((rule) => ({
      jurisdictionKey: BOULDER_KEYS.jurisdiction,
      permitTypeKey: "building",
      scheduleKey: BOULDER_FEE_SCHEDULE_SOURCE_KEY,
      rule,
    })),
    ...BOULDER_ELECTRICAL_RULES.map((rule) => ({
      jurisdictionKey: BOULDER_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      scheduleKey: BOULDER_FEE_SCHEDULE_SOURCE_KEY,
      rule,
    })),
    ...BOULDER_PLUMBING_RULES.map((rule) => ({
      jurisdictionKey: BOULDER_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      scheduleKey: BOULDER_FEE_SCHEDULE_SOURCE_KEY,
      rule,
    })),
  ],

  requirements: [
    {
      jurisdictionKey: BOULDER_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "document",
      title: "A valuation of labor and materials for the work being permitted",
      description:
        "The Valuation Table carries a banner in capitals, which is how the City wanted it read: \"VALUATION SHALL INCLUDE LABOR & MATERIALS FOR WORK BEING PERMITTED EVEN IF WORK IS COMPLETED AS OWNER/BUILDER\". Two things follow. The figure is the value of the work rather than of the land or the existing building, and doing the work yourself does not remove it from the calculation.",
      isMandatory: true,
      sortOrder: 10,
      sourceKey: BOULDER_FEE_SCHEDULE_SOURCE_KEY,
      lastVerifiedAt: BOULDER_LAST_VERIFIED,
    },
    {
      jurisdictionKey: BOULDER_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "document",
      title: "The valuation, when there is no contract price",
      description:
        "The schedule publishes the answer to \"what is this work worth\" for the common cases: Common Unit Costs Used to Calculate Valuation, on the same page as the fee table. A wood-framed dwelling with air conditioning is $112.65 per square foot, masonry with air conditioning $119.73, a room addition $65.00, a finished basement $50.00, a chain-link fence $5.00, a garage converted to living space $35.00. Multiply, and you have the valuation the fee table is applied to. The Division also states that a fuller list — fees, fee tables and square foot construction costs — is in its 2020 Administrative Code on its website; that document was not retrieved in this pass and no figure on this site is claimed from it.",
      isMandatory: false,
      sortOrder: 20,
      sourceKey: BOULDER_FEE_SCHEDULE_SOURCE_KEY,
      lastVerifiedAt: BOULDER_LAST_VERIFIED,
    },
    {
      jurisdictionKey: BOULDER_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "other",
      title: "Property inside Boulder City's limits",
      description:
        "Boulder City is a city inside Clark County, and it issues construction permits under its own schedule — this one. Clark County's Building Administrative Code does not price a Boulder City permit. Which authority covers a given address follows from the city limits, and that is a question for the county's and the city's records rather than for a fee table.",
      isMandatory: true,
      sortOrder: 30,
      sourceKey: BOULDER_FEE_SCHEDULE_SOURCE_KEY,
      lastVerifiedAt: BOULDER_LAST_VERIFIED,
    },
    {
      jurisdictionKey: BOULDER_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      requirementType: "other",
      title: "Which of the four published electrical items the work is",
      description:
        "The schedule prices exactly four electrical jobs: a service change in three amperage bands and temporary power. It publishes no rate for anything else electrical, so a job that is none of them has no fee on this schedule — the page states that instead of inventing a valuation route the document does not take.",
      isMandatory: true,
      sortOrder: 10,
      sourceKey: BOULDER_FEE_SCHEDULE_SOURCE_KEY,
      lastVerifiedAt: BOULDER_LAST_VERIFIED,
    },
    {
      jurisdictionKey: BOULDER_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      requirementType: "other",
      title: "The amperage of the service change, or the tonnage of the unit",
      description:
        "Both trade tables step on a physical characteristic of the installation rather than on money: electrical service change in amps, water heater replacement in units or tanks. The step is what selects the fee, and it has to be declared before a figure means anything.",
      isMandatory: false,
      sortOrder: 20,
      sourceKey: BOULDER_FEE_SCHEDULE_SOURCE_KEY,
      lastVerifiedAt: BOULDER_LAST_VERIFIED,
    },
    {
      jurisdictionKey: BOULDER_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      requirementType: "other",
      title: "Whether the water heater is a replacement",
      description:
        "The $50.00 row is qualified in the schedule's own parentheses: \"(Replacement only, per each unit/tank)\". A replacement of an existing tank is $50.00 each; a water heater that is part of new plumbing is a different job and this schedule does not price it.",
      isMandatory: true,
      sortOrder: 30,
      sourceKey: BOULDER_FEE_SCHEDULE_SOURCE_KEY,
      lastVerifiedAt: BOULDER_LAST_VERIFIED,
    },
  ],

  profile: {
    jurisdictionKey: BOULDER_KEYS.jurisdiction,
    headline: "What construction permits cost in Boulder City",
    summary:
      "Boulder City prices a building permit from a bracket table of 51 published ranges — $27.00 up to $500 of valuation, $414.50 at $50,000 — plus a $40 issuance fee, and publishes the per-square-foot unit costs an applicant should use to derive that valuation when there is no contract price. Electrical and plumbing permits are four flat items and two flat items, priced by amperage, tonnage or unit count rather than by money.",
    localContext:
      "Four things about this schedule are worth knowing before you read any figure from it.\n\nThe first is that it chains to the cent, and it is worth saying so because its neighbour does not. Every bracket of the Valuation Table is a fixed amount for a $1,000 range, and the two rows that continue above $50,000 start where the bracket below left off: $414.50 is exactly what the table produces at $50,000, and $639.50 at $100,000 is exactly what the $4.50 band produces there. Two valuation tables in one state, one that chains without a seam and one with a four-and-a-half-cent seam. A schedule is a document, not a convention, and each is modelled as printed.\n\nThe second is that the schedule tells you how to value the work. \"Common Unit Costs Used to Calculate Valuation\" sits on the same page as the fee table: $112.65 per square foot for a wood-framed dwelling with air conditioning, $119.73 for masonry, $65.00 for a room, $44.63 for a garage, $4.00 per foot for a wood or vinyl fence. That is unusual and it is useful — it means a reader who knows square footage but has no contract price can still arrive at the City's own figure rather than guessing, and the worked example on this site's building page follows that chain end to end.\n\nThe third is the issuance fee, and it is a reading rather than a certainty. The schedule opens \"Unless indicated a $40 Issuance Fee will be applied to every permit\", and each trade block on the same page indicates the opposite in print: \"Price Includes Issuance Fee\". The Valuation Table is not a trade block and does not indicate anything, so a building permit is modelled as the table's amount plus $40 and a trade permit as its flat amount. If the City means the table to include it, every building figure here is $40 high, and the building page says so in plain words.\n\nThe fourth is what is deliberately outside these figures. Plan review is published as a deposit — \"Equal to full plan review fees for the project, based on project valuation. This can be calculated using the Valuation Table on page 2\" — and a deposit equal to the review fee, computed from the same table as the permit, would double every published figure if added unconditionally. Privilege tax and transportation ($1.00 per square foot commercial, $1,000 per house residential, plus a separate $1,000 per house tax), meter installation and connection fees under Resolution 6570 (water $7,450 to $74,088, sewer $1,800 to $15,000, electric $2,500 to $7,500 by amperage, then $6.25 per amp above 1,200) and the event fees — re-inspection, same-day, after-hours, overtime, expedited review — are all real, all published, and all charged by nobody on this site. Each page names them.",
    valuationBasis:
      "The valuation is the value of the work being permitted, including labor and materials, and it applies even when you do the work yourself. The schedule states it on the Valuation Table in capitals: \"VALUATION SHALL INCLUDE LABOR & MATERIALS FOR WORK BEING PERMITTED EVEN IF WORK IS COMPLETED AS OWNER/BUILDER\".\n\nWhen there is a contract price, that price is the valuation. When there is not — an owner doing the work, a scope priced by the hour, a repair — the City publishes the unit costs to derive one: $112.65 per square foot for a wood-framed dwelling with air conditioning (R-3, VB), $119.73 for masonry (R-3, VA), $65.00 per square foot for a room, $50.00 for a finished basement, $15.00 unfinished, $90.00 for pool surface area, $44.63 for a garage, $20.00 for a wood or metal storage shed, $15.00 per foot for a retaining wall, $6.50 for a CMU block wall, $35.00 for a garage converted to living space.\n\nThat is a rate for computing an input, not a fee, and this site applies it as such: the building page's worked example multiplies a square foot figure by the City's own dwelling rate and then runs the result through the fee table. No cost per square foot is ever applied to a fee directly, because no such fee exists in this schedule.",
    notIncluded:
      "These figures are the permit fees published on the Permit Fee Schedule and Valuation Table of the City of Boulder City's Building and Safety Division, computed by this site's engine. They are not a total project cost. In particular they exclude:\n\n- **Plan review**, which the schedule publishes only as a non-refundable deposit — \"Equal to full plan review fees for the project, based on project valuation. This can be calculated using the Valuation Table on page 2\" — plus hourly revision reviews at $45.00 per half hour and $90.00 per half hour expedited. Adding a deposit that equals the review fee to the permit fee would charge the same money twice.\n- **Privilege tax and transportation**: $1.00 per square foot of commercial development, $1,000 per house residential (both noted as Clark County rates effective 1 July 2020), plus a separate $1,000 per house residential tax. Charged on development rather than on a permit, and charged here by nobody.\n- **Meter installation and connection fees** under Resolution 6570 — water from $7,450 at three-quarter inch to $74,088 at two inches, sewer from $1,800 to $15,000, electric $2,500 to $7,500 by amperage and $6.25 per amp above 1,200. Real, published, and utility charges rather than permit fees.\n- **Inspection and event fees**: re-inspection $90.00 per hour with a one-hour minimum, same-day and after-hours inspection $90.00 per hour, overtime inspection $180.00 with a two-hour minimum on Friday and Saturday, expedited plan review $90.00 per half hour.\n- **Mechanical (HVAC) permits**, published at $75.00 for a 1-3 ton unit and $100.00 for 3.5-5 ton plus $35 and $60 for each additional unit on a permit — transcribed, not modelled in this release.\n- **Miscellaneous and demolition**: demolition $85.00 up to 1,000 square feet and $115.00 above, moving a structure $200.00, parking a modular building $90.00 plus $50.00 per additional building.\n- **Anything charged by Clark County or by another city.** Boulder City sits inside Clark County and issues its own permits; a county estimate does not describe them.",
    seoTitle: "Boulder City, Nevada building permit fees",
    seoDescription:
      "How Boulder City prices building, electrical and plumbing permits — a 51-range valuation table that chains to the cent, the City's own per-square-foot unit costs, and every flat trade item.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: BOULDER_LAST_VERIFIED,
  },

  permitPages: [
    {
      jurisdictionKey: BOULDER_KEYS.jurisdiction,
      permitTypeKey: "building",
      slug: "building-permit-cost",
      title: "Boulder City building permit cost",
      intro:
        "A Boulder City building permit comes from a bracket table of 51 published ranges — $27.00 for a valuation up to $500, rising by $9 per $1,000 through the middle of the table to $414.50 at $50,000 — plus a $40 issuance fee the schedule says applies unless a block indicates otherwise. Above $50,000 the table hands over to two rate rows: $414.50 for the first $50,000 plus $4.50 for each additional $1,000, then $639.50 for the first $100,000 plus $3.50. There is no occupancy column and no construction-type column: a house and a warehouse of the same valuation pay the same fee.",
      localSummary:
        "The whole table chains, and that is what makes it checkable. $414.50, where the bracket table stops, is exactly what the $4.50 row produces at $50,000. $639.50, where that row stops, is exactly what the $3.50 row produces at $100,000. There is no seam anywhere — both handovers between the three rows land on the cent. Compare that with Clark County, whose bands are four cents apart at one joint, and the point becomes general: each schedule states its own convention and is modelled as printed rather than given the last jurisdiction's.\n\nThe steps change twice, which is where the table's shape comes from. From $1 to $500 it is flat at $27.00. From $501 to $1,000 it steps $9 per $500. From $1,001 to $25,000 it steps $9 per $1,000 — $36, $45, $54 … $252 — and from $25,001 to $50,000 it steps $6.50 per $1,000 instead, which is why the last twenty-four brackets climb more gently than the twenty-five before them. \"Or fraction thereof\" appears on both rate rows, so one cent past a $1,000 boundary buys a whole $1,000 of increment.\n\nAbove $50,000 the two rate rows are open-ended and mutually exclusive by valuation, and only one can be in effect. A $60,000 project is $414.50 plus ten thousands at $4.50; a $120,000 project is $639.50 plus twenty at $3.50, plus the $40 issuance fee.\n\nThe $40 itself is a reading, stated rather than hidden: the schedule opens \"Unless indicated a $40 Issuance Fee will be applied to every permit\", and the trade blocks on page 1 each indicate otherwise with \"Price Includes Issuance Fee\". The Valuation Table does not indicate anything, so it is charged here. If the City means the table's figures to include it, every building figure on this page is $40 high.",
      notIncluded:
        "This estimate is the Valuation Table's amount plus the $40 issuance fee. It excludes:\n\n- **Plan review**, published only as a non-refundable deposit — \"Equal to full plan review fees for the project, based on project valuation. This can be calculated using the Valuation Table on page 2\" — plus revision reviews at $45.00 per half hour and $90.00 expedited. A deposit computed from the same table as the permit would charge that table's money twice.\n- **Privilege tax and transportation** ($1.00 per square foot commercial, $1,000 per house residential, both noted as Clark County rates effective 1 July 2020) and the separate **residential tax** of $1,000 per house. Charged on development, not on a permit.\n- **Meter installation and connection fees** under Resolution 6570: water $7,450 to $74,088 by line size, sewer $1,800 to $15,000, electric $2,500 to $7,500 by amperage and $6.25 per amp above 1,200.\n- **Inspection and event fees**: re-inspection, same-day, after-hours and overtime at $90.00 or $180.00 an hour, and expedited plan review.\n- **Mechanical (HVAC) permits**, published at $75.00 for a 1-3 ton unit and $100.00 for 3.5-5 ton, plus $35.00 and $60.00 for each additional unit on one permit — transcribed, not modelled in this release.\n- **Trade and miscellaneous permits**: electrical and plumbing, each priced on its own page here; demolition ($85.00 up to 1,000 square feet, $115.00 above); moving a structure ($200.00); modular buildings ($90.00 plus $50.00 each).\n- **Any figure for property outside the city limits.** Clark County issues its own permits for the rest of the county.",
      workedExample: {
        scenario:
          "A new wood-framed dwelling with air conditioning, 1,000 square feet, priced the way the City says to price it: multiply the square footage by the schedule's own published unit cost of $112.65 per square foot for that construction type, which gives a valuation of $112,650, and apply the fee table to it.",
        inputs: {
          valuationCents: 11_265_000,
        },
        notes:
          "$112,650 falls in the final row: $639.50 for the first $100,000, plus $3.50 for each of the thirteen additional thousands the valuation reaches (one cent past $100,000 already buys a full thousand), and then the $40 issuance fee. The square foot figure, the $112.65 rate and the fee table are all printed on the schedule, so every step here can be checked against page 1 and page 2 of one document. A $10,000 repair on the same property would sit in the bracket table instead, at $117.00 plus $40.",
      },
      faqs: [
        {
          question: "How much is a building permit in Boulder City?",
          answer:
            "It is the Valuation Table's amount for your valuation, plus $40. The table runs from $27.00 for a valuation up to $500 to $414.50 at $50,000, in 51 published ranges; above that it charges $414.50 for the first $50,000 plus $4.50 per additional $1,000, then $639.50 for the first $100,000 plus $3.50, each with the $40 on top.",
        },
        {
          question: "How do I know the valuation if I do not have a contract?",
          answer:
            "The City publishes the unit costs to derive one, next to the fee table: $112.65 per square foot for a wood-framed dwelling with air conditioning, $119.73 for masonry, $65.00 for a room, $50.00 for a finished basement, $44.63 for a garage, $4.00 per foot for a wood or vinyl fence. Multiply, and you have the figure the table is applied to. The schedule also says the valuation includes labor and materials even if you are doing the work yourself.",
        },
        {
          question: "Does the valuation include the land?",
          answer:
            "The schedule says what it includes: labor and materials for the work being permitted. It does not mention land, and the table's unit costs are all per square foot of construction. A valuation that carried land value would be charging a fee on money no permit touched.",
        },
        {
          question: "Is the $40 issuance fee added to the building permit fee?",
          answer:
            "On this site, yes — and that is a stated reading. The schedule opens \"Unless indicated a $40 Issuance Fee will be applied to every permit\", and each trade block on page 1 indicates otherwise with \"Price Includes Issuance Fee\". The Valuation Table does not, so it is charged. If the City means the table's figures to include it, every building figure on this page is $40 high.",
        },
        {
          question: "Is plan review included?",
          answer:
            "No. The schedule publishes a non-refundable plan review deposit — equal to the full plan review fees for the project, based on project valuation, and calculable from the same Valuation Table — plus revision reviews at $45.00 per half hour. Adding a deposit that equals the review fee on top of the permit fee would charge the same money twice, so no plan review figure is in this estimate.",
        },
        {
          question: "Does Boulder City use Clark County's fee schedule?",
          answer:
            "No, and that is the point of a city inside a county issuing its own permits. Boulder City publishes its own schedule with its own effective date, and Clark County's Building Administrative Code prices Clark County permits. Two published fees — the privilege tax and transportation rates — are noted on Boulder City's schedule as Clark County rates effective 1 July 2020, which is a real link between the two documents and not a shared fee table.",
        },
      ],
      seoTitle: "Boulder City, Nevada building permit cost",
      seoDescription:
        "Boulder City building permit fees from the City's own Valuation Table: 51 ranges from $27.00 to $414.50, the rate rows above $50,000, the $40 issuance fee and a worked example from the City's unit costs.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: BOULDER_LAST_VERIFIED,
    },
    {
      jurisdictionKey: BOULDER_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      slug: "electrical-permit-cost",
      title: "Boulder City electrical permit cost",
      intro:
        "Boulder City prices four electrical jobs and no others: a service change at $80.00 up to 200 amps, $100.00 from 200 to 1,000 amps and $125.00 above 1,000 amps, and temporary power at $290.00. Each is a flat figure that already includes the $40 issuance fee, because the electrical block on the schedule says so in print. Nothing else electrical is priced by this document — no rate for a remodel's circuits, a new build's wiring or an upgrade to a panel that is not a like-for-like service change.",
      localSummary:
        "Two features of this schedule decide every electrical figure, and both are printed rather than inferred.\n\nThe first is that the fee steps on amperage, not on money. Service change is the job, and the only thing that changes the price is the capacity of the service being changed: $80.00 for up to 200 amps, $100.00 for 200 to 1,000, $125.00 over 1,000. Those are the three published bands, each open at the bottom and closed at the top, and a service change outside the amperage question — a panel that is being replaced at the same size, a subpanel added — is none of the four rows the schedule publishes.\n\nThe second is the issuance fee, and it is the one place Boulder City tells you in writing that the $40 is already inside the number. Each of the three trade blocks carries the line \"Price Includes Issuance Fee\" under its heading. So an electrical permit is its flat figure, full stop: adding $40 to a service change would charge the fee twice, and the schedule rules that out in its own words. That is the opposite of the reading the building page has to make, where the Valuation Table carries no such indication and the $40 is added.\n\nTemporary power at $290.00 is the outlier — more than three times the largest service change — and it is a permit of its own rather than an addition to another electrical permit. The schedule publishes it as its own row, so the model treats it as its own row: select it and the service change is not charged, because two electrical permits on one project are two permits, not one.\n\nWhat the schedule does not price is stated plainly on the page: there is no valuation route here. Unlike Clark County, whose electrical table ends by sending unspecified work to its building table, Boulder City's schedule sends nothing anywhere, and a job that is not one of the four has no fee on this document.",
      notIncluded:
        "This estimate is the electrical item fee published on the schedule, with the $40 issuance fee already inside it as the block states. It excludes:\n\n- **Electrical work that is not one of the four published items.** There is no valuation row for electrical work in this schedule and none is invented here; a job outside the four is priced by the Division, and the Division's number is the one that would govern.\n- **The building permit fee**, if the electrical work belongs to a construction or remodelling project.\n- **Plan review**, published only as a non-refundable deposit equal to the full plan review fees for the project, plus revision reviews at $45.00 per half hour.\n- **Privilege tax and transportation** ($1.00 per square foot commercial, $1,000 per house residential) and the separate $1,000 per house residential tax.\n- **Meter installation and connection fees** under Resolution 6570 — electric service connections run $2,500 up to 200 amps to $7,500 at 801-1,200 amps, then $6.25 per amp. A service change permit and a new service connection are different charges.\n- **Inspection and event fees**: re-inspection $90.00 per hour, same-day and after-hours $90.00 per hour, overtime $180.00 with a two-hour minimum.\n- **Mechanical (HVAC) permits** — $75.00 for a 1-3 ton unit, $100.00 for 3.5-5 ton, plus $35.00 and $60.00 for each additional unit on one permit — together with **plumbing** and **miscellaneous permits**, including demolition and moving a structure.\n- **Anything for property outside the city limits.** Clark County issues its own permits.",
      workedExample: {
        scenario:
          "A service change on a residence where the existing 100-amp service is replaced with a 400-amp service. The amperage of the new service is the only thing the schedule asks for, and it falls in the middle band.",
        inputs: {
          custom: { schedule_item: "service_change_1000" },
        },
        notes:
          "Page 1, ELECTRICAL: \"Service Change (200 - 1,000 AMP) — $100.00\", under the block heading \"Price Includes Issuance Fee\". No valuation is used and none is asked for: this schedule prices the capacity of the service, not the money of the project. A 125-amp change would be $80.00, one over 1,000 amps $125.00, and temporary power — a separate permit — $290.00.",
      },
      faqs: [
        {
          question: "How much is an electrical permit in Boulder City?",
          answer:
            "$80.00 for a service change up to 200 amps, $100.00 for 200 to 1,000 amps, $125.00 above 1,000 amps, and $290.00 for temporary power. Each figure already includes the schedule's $40 issuance fee, which the electrical block states under its heading.",
        },
        {
          question: "Is the $40 issuance fee added to an electrical permit?",
          answer:
            "No. The electrical block carries the line \"Price Includes Issuance Fee\", which is the schedule indicating the fee is inside the figure — exactly the indication the Valuation Table does not carry. Adding $40 to a service change would charge the same fee twice.",
        },
        {
          question: "Is the fee based on the cost of the work?",
          answer:
            "No. Boulder City's electrical rows step on amperage only: the same 400-amp service change costs $100.00 whether the house is worth $300,000 or $3,000,000. The schedule publishes no valuation row for electrical work, so there is no money input to give it.",
        },
        {
          question: "What if my electrical work is not a service change?",
          answer:
            "Then this schedule does not price it, and no figure is invented here. The four published items are three service-change bands and temporary power; a remodel's circuits, a new build's wiring and a subpanel addition are outside them, and the Division sets the fee for work it does not list.",
        },
        {
          question: "Does temporary power cost more than a service change?",
          answer:
            "Yes — $290.00 against $125.00 at the top of the service-change bands, and it is its own permit rather than an addition to one. The schedule publishes it as a separate row, so it is modelled as a separate row: selecting temporary power does not also charge a service change.",
        },
        {
          question: "Are meter or connection fees included?",
          answer:
            "No. Electric meter installation is a separate schedule under Resolution 6570 — $2,500 up to 200 amps, $3,500 at 201-400, up to $7,500 at 801-1,200, then $6.25 per amp — and it charges for a new service connection, not for the permit to change one. It is a utility charge and is named on this page rather than folded into the permit figure.",
        },
      ],
      seoTitle: "Boulder City, Nevada electrical permit cost",
      seoDescription:
        "Boulder City electrical permit fees: $80.00, $100.00 or $125.00 for a service change by amperage and $290.00 for temporary power — flat figures that already include the $40 issuance fee.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: BOULDER_LAST_VERIFIED,
    },
    {
      jurisdictionKey: BOULDER_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      slug: "plumbing-permit-cost",
      title: "Boulder City plumbing permit cost",
      intro:
        "Boulder City publishes two plumbing fees. A water heater replacement is $50.00 per unit or tank, and a gas line or pressure test is $70.00. Both are flat, both already include the $40 issuance fee, and neither changes with the size of the tank, the age of the house or the value of the work. Two water heaters on one permit are $100.00, because the schedule says so in the row itself: \"(Replacement only, per each unit/tank)\".",
      localSummary:
        "The water heater row is doing three jobs in one line of print, and all three matter.\n\nIt is scoped: \"Replacement only\". Replacing an existing tank with another tank is this fee. A water heater that arrives as part of new plumbing — a room addition, a ground-up build — is a different job, and the schedule does not price it. That qualifier is the difference between a published figure and a wrong one, and it is quoted in full on this site rather than trimmed to the dollar amount.\n\nIt is per unit: \"per each unit/tank\". Two tanks on one permit is $100.00, three is $150.00. That is why this site models it per unit rather than flat — a rule that said $50.00, full stop, would answer a two-tank job at half what the schedule charges, and nothing on the page would show the reader why.\n\nAnd it is inside the price: the plumbing block carries \"Price Includes Issuance Fee\", so the $40 the schedule's header threatens is already in the figure. Adding it would charge the same fee twice. The building page has the opposite reading because the Valuation Table carries no such indication, and the two pages state each reading in the same words so the difference is visible rather than accidental.\n\nThe gas line or pressure test at $70.00 is the second and last published plumbing row. Beyond these two, this schedule has no plumbing figures at all — no rate for a re-pipe, a repipe of a whole house, a sewer line or a remodel's rough-in — and no valuation route is offered the way Clark County's plumbing table offers one. Those jobs are priced by the Division, and this page says that instead of borrowing a mechanism the document does not contain.",
      notIncluded:
        "This estimate is the plumbing item fee published on the schedule, with the $40 issuance fee already inside it as the block states. It excludes:\n\n- **Plumbing work outside the two published rows.** There is no rate for a re-pipe, a sewer line or a remodel's rough-in, and no valuation route for plumbing in this schedule; none is invented here.\n- **The building permit fee**, if the plumbing work belongs to a construction or remodelling project.\n- **Plan review**, published only as a non-refundable deposit equal to the full plan review fees for the project, plus revision reviews at $45.00 per half hour.\n- **Privilege tax and transportation** ($1.00 per square foot commercial, $1,000 per house residential) and the separate $1,000 per house residential tax.\n- **Meter installation and connection fees** under Resolution 6570 — water $7,450 at three-quarter inch to $74,088 at two inches, sewer $1,800 to $15,000. Connecting to the water or sewer system is a utility charge, and on a new building it dwarfs the permit fee.\n- **Inspection and event fees**: re-inspection $90.00 per hour with a one-hour minimum, same-day and after-hours $90.00 per hour, overtime $180.00 with a two-hour minimum.\n- **The pool and spa utility fee** of $100.00 flat, which the schedule lists under its unit costs rather than as a plumbing permit.\n- **Mechanical (HVAC) permits**, published at $75.00 for a 1-3 ton unit and $100.00 for 3.5-5 ton, plus $35.00 and $60.00 for each additional unit on one permit — transcribed, not modelled in this release.\n- **Anything for property outside the city limits.** Clark County issues its own permits.",
      workedExample: {
        scenario:
          "Two water heaters replaced at the same time on one permit. The schedule prices each unit or tank at $50.00, so the count is the only input that matters.",
        inputs: {
          custom: { schedule_item: "water_heater", heaters: 2 },
        },
        notes:
          "Page 1, PLUMBING: \"Water Heater — $50.00 (Replacement only, per each unit/tank)\", under the block heading \"Price Includes Issuance Fee\". The per-unit row is what makes two tanks $100.00 rather than a flat $50.00, and no valuation, tank size or age enters the calculation. One tank is $50.00; a gas line or pressure test instead is $70.00.",
      },
      faqs: [
        {
          question: "How much is a water heater permit in Boulder City?",
          answer:
            "$50.00 for a replacement, per unit or tank, and it already includes the $40 issuance fee. Two tanks on one permit is $100.00. The schedule's row reads \"Water Heater — $50.00 (Replacement only, per each unit/tank)\".",
        },
        {
          question: "Does the fee depend on the size of the tank?",
          answer:
            "No. The row is flat per unit, so a 40-gallon and an 80-gallon replacement are $50.00 each. Nothing about gallons, age or manufacturer appears anywhere in this schedule's plumbing block.",
        },
        {
          question: "Is the $40 issuance fee added to a plumbing permit?",
          answer:
            "No. The plumbing block carries \"Price Includes Issuance Fee\" under its heading, which is the schedule's own indication that the $40 is inside the figure. Adding it would charge the same fee twice.",
        },
        {
          question: "What if the water heater is part of new construction?",
          answer:
            "Then this fee does not apply, because the row is qualified \"Replacement only\". The schedule publishes no rate for a water heater that is not a replacement and offers no valuation route for plumbing, so the Division sets it. This page states that rather than quoting the $50.00 for a job it covers.",
        },
        {
          question: "How much is a gas line permit?",
          answer:
            "$70.00, published as \"Gas Line / Pressure Test\". It is the second and last plumbing row on the schedule, and like the water heater it includes the issuance fee.",
        },
        {
          question: "Are water and sewer connection fees included?",
          answer:
            "No. They are a separate schedule under Resolution 6570: water connections run $7,450 at three-quarter inch to $74,088 at two inches, and sewer connections $1,800 to $15,000 by size and use. On a new building those charges are far larger than the permit fee, which is exactly why they are named on this page instead of left out.",
        },
      ],
      seoTitle: "Boulder City, Nevada plumbing permit cost",
      seoDescription:
        "Boulder City plumbing permit fees: $50.00 per unit for a water heater replacement and $70.00 for a gas line or pressure test, flat and already including the $40 issuance fee.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: BOULDER_LAST_VERIFIED,
    },
  ],

  verifications: [
    {
      entityType: "source",
      entityKey: BOULDER_FEE_SCHEDULE_SOURCE_KEY,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: BOULDER_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: BOULDER_FEE_SCHEDULE_SOURCE_KEY,
      notes:
        "Read twice on 2026-09-24, `pdftotext -layout` and `pdftotext -table`. The two modes disagreed on the Valuation Table: -layout printed the fee column one row out of step with the range column, and -table paired them correctly. The mis-pairing was caught before it became a published rate, which is the project's two-mode rule doing its job. The schedule states its own effective date, \"Effective as of August 3, 2020\".",
    },
    {
      entityType: "source",
      entityKey: BOULDER_PERMIT_PAGE_SOURCE_KEY,
      status: "verified",
      method: "official_portal_check",
      verifiedAt: BOULDER_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: BOULDER_PERMIT_PAGE_SOURCE_KEY,
      notes:
        "Read on 2026-09-24. It is the URL the fee schedule prints for itself in the Division's header, so it is recorded as the authority behind the schedule. No rate is taken from it.",
    },
    {
      entityType: "fee_rule",
      entityKey: "VALUATION-TABLE-1-50000",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: BOULDER_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: BOULDER_FEE_SCHEDULE_SOURCE_KEY,
      notes:
        "Page 2, all 51 published ranges, transcribed in the dollars the document prints so a reviewer can check the list against page 2 line by line: [500, 27], [1000, 36], [2000, 45] … [50000, 414.50]. Spot-checked against both pdftotext modes at the 15,001-16,000 / $171.00, 32,001-33,000 / $304.00 and 49,001-50,000 / $414.50 rows, where -layout and -table agree. Capped at $50,000 by a condition, because two published rate rows take over above it and a final open bracket would have charged both.",
    },
    {
      entityType: "fee_rule",
      entityKey: "VALUATION-50001-100000",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: BOULDER_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: BOULDER_FEE_SCHEDULE_SOURCE_KEY,
      notes:
        "Page 2: \"$414.50 for the first $50,000 + $4.50 for each additional $1,000 or fraction thereof\", for a valuation of $50,001 to $100,000. $414.50 is exactly what the bracket table produces at $50,000, and this row produces exactly $639.50 at $100,000 — both seams asserted in tests/content/bouldercity-seed.test.ts as chains that close to the cent.",
    },
    {
      entityType: "fee_rule",
      entityKey: "VALUATION-100001-UP",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: BOULDER_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: BOULDER_FEE_SCHEDULE_SOURCE_KEY,
      notes:
        "Page 2: \"$639.50 for the first $100,000 + $3.50 for each additional $1,000 or fraction thereof\". Open-ended. Verified in both pdftotext modes; the building page's worked example is in this band.",
    },
    {
      entityType: "fee_rule",
      entityKey: "ISSUANCE-40",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: BOULDER_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: BOULDER_FEE_SCHEDULE_SOURCE_KEY,
      notes:
        "Page 1: \"Unless indicated a $40 Issuance Fee will be applied to every permit\", charged on the building permit only. The three trade blocks each print \"Price Includes Issuance Fee\", which is the schedule indicating otherwise for them and the reason this rule is attached to no trade permit type. Recorded as a stated reading, not as the document's plain meaning: if the City means the Valuation Table to include it, every building figure is $40 high, and the building page says so.",
    },
    {
      entityType: "fee_rule",
      entityKey: "ELEC-SERVICE-200-1000",
      permitTypeKey: "electrical",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: BOULDER_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: BOULDER_FEE_SCHEDULE_SOURCE_KEY,
      notes:
        "Page 1, ELECTRICAL: \"Service Change (200 - 1,000 AMP) — $100.00\". The electrical page's worked example. Conditional on the schedule item being selected, which is what keeps the three amperage bands mutually exclusive instead of charging all three.",
    },
    {
      entityType: "fee_rule",
      entityKey: "ELEC-TEMPORARY-POWER",
      permitTypeKey: "electrical",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: BOULDER_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: BOULDER_FEE_SCHEDULE_SOURCE_KEY,
      notes:
        "Page 1, ELECTRICAL: \"Temporary Power — $290.00\", a row of its own rather than an addition to a service change. Its condition is the same exclusivity mechanism as the service-change bands, so a project selecting temporary power is charged this row and not a service change as well.",
    },
    {
      entityType: "fee_rule",
      entityKey: "PLUMB-WATER-HEATER",
      permitTypeKey: "plumbing",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: BOULDER_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: BOULDER_FEE_SCHEDULE_SOURCE_KEY,
      notes:
        "Page 1, PLUMBING: \"Water Heater — $50.00 (Replacement only, per each unit/tank)\". Modelled per unit rather than flat, which is the difference between $50.00 and $100.00 on a two-tank permit; the count reads `custom.heaters`, an existing kind, because a water heater is a heater. The \"Replacement only\" qualifier is quoted in full on the page.",
    },
    {
      entityType: "permit_page",
      entityKey: "building-permit-cost",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: BOULDER_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: BOULDER_FEE_SCHEDULE_SOURCE_KEY,
      notes:
        "The 51 brackets, both rate rows and the issuance fee, with the chaining asserted rather than asserted in prose only. The worked example derives its valuation from the schedule's own published unit cost of $112.65 per square foot for a wood-framed dwelling with air conditioning, so every input on the page comes from one document.",
    },
    {
      entityType: "permit_page",
      entityKey: "electrical-permit-cost",
      permitTypeKey: "electrical",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: BOULDER_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: BOULDER_FEE_SCHEDULE_SOURCE_KEY,
      notes:
        "All four published rows transcribed, with the absence of a valuation route for electrical work stated on the page rather than filled in from Clark County's schedule — a neighbouring county's fallback sentence is not this city's.",
    },
    {
      entityType: "permit_page",
      entityKey: "plumbing-permit-cost",
      permitTypeKey: "plumbing",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: BOULDER_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: BOULDER_FEE_SCHEDULE_SOURCE_KEY,
      notes:
        "Both published rows, with \"Replacement only\" quoted in full and the count priced per unit. The worked example is two tanks, which is where a flat rule and a per-unit rule give different answers.",
    },
    {
      entityType: "jurisdiction_profile",
      entityKey: BOULDER_KEYS.jurisdiction,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: BOULDER_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: BOULDER_FEE_SCHEDULE_SOURCE_KEY,
      notes:
        "Hub content built from the schedule itself. Department address, main line and permit mailbox are printed in the Division's header on page 1; counter hours are not printed and are not recorded. The two requirement rows are quoted in full where they are used — the Valuation Table's banner, \"VALUATION SHALL INCLUDE LABOR & MATERIALS FOR WORK BEING PERMITTED EVEN IF WORK IS COMPLETED AS OWNER/BUILDER\", and the published unit costs of $112.65/sf for a wood-framed dwelling with air conditioning and $119.73/sf masonry — each verified against page 1. A rate for deriving an input, never applied to a fee. Mechanical, plan review, privilege tax, meter connections and event fees are each named in the coverage notes with their figures, and none is charged.",
    },
  ],
};

/** Permit pages that clear the editorial gate, for use in tests without a database. */
export const BOULDER_PUBLISHED_PERMIT_PAGES = boulderCitySeed.permitPages.filter(
  (page) => page.publishStatus === "published" && !page.noindex,
);
