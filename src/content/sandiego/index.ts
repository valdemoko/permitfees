import type { JurisdictionSeed } from "@/content/seed-types";

import {
  SD_BUILDING_RULES,
  SD_BUILDING_SOURCE_KEY,
  SD_ELECTRICAL_RULES,
  SD_FEE_EFFECTIVE_FROM,
  SD_MEP_FEE_EFFECTIVE_FROM,
  SD_MEP_SOURCE_KEY,
  SD_PLUMBING_RULES,
  SD_VALUATION_SOURCE_KEY,
} from "./fee-rules";

/**
 * City of San Diego, California — **the city whose building permit is plan check plus
 * inspection, and whose trade permits are priced per unit of work.**
 *
 * Every other building schedule in this dataset prices a permit from a valuation band
 * or from a single area rate. San Diego prices it from **area in one direction only**:
 * Table 501A prints a base rate that covers a stated number of square feet and an
 * increment per square foot above it, and it prints that pair *twice* — once for plan
 * check and once for inspection. A 5,000 square foot single dwelling unit therefore
 * pays $8,085.26 + 2,000 × $4.10 of plan check and $8,401.90 + 2,000 × $4.21 of
 * inspection, and the two are separate charges rather than one fee with a label.
 *
 * Its electrical and plumbing permits come from a second bulletin and are priced **per
 * unit of work** — a dwelling unit, a water heater, a backflow device — each with a
 * First Unit amount and an Each Additional Unit amount, which is the `per_unit`
 * primitive with a base charge and an allowance.
 *
 * Two of California's own fees ride on the building permit and are modelled here: the
 * State/Seismic fee at 13¢ or 28¢ per $1,000 of valuation depending on height and
 * occupancy, and the Building Standards fee at $4 per $100,000, whose \"appropriate
 * fractions\" the City interprets as $1.00 per $25,000.
 *
 * Research record: research/california/san-diego.md.
 */

export const SD_LAST_VERIFIED = "2026-09-24";

export const SD_KEYS = {
  state: "ca",
  county: "san-diego-county",
  jurisdiction: "san-diego",
  buildingBulletin: SD_BUILDING_SOURCE_KEY,
  mepBulletin: SD_MEP_SOURCE_KEY,
  valuationSchedule: SD_VALUATION_SOURCE_KEY,
} as const;

const RESEARCHER = "Permit Fee Intelligence research pass 12 (California, first jurisdiction)";

const state = {
  code: "CA",
  slug: "california",
  name: "California",
  fipsCode: "06",
};

const county = {
  key: SD_KEYS.county,
  slug: "san-diego-county",
  name: "San Diego County",
  fipsCode: "06073",
};

export const sanDiegoSeed: JurisdictionSeed = {
  state,
  county,

  jurisdiction: {
    key: SD_KEYS.jurisdiction,
    stateKey: SD_KEYS.state,
    countyKey: SD_KEYS.county,
    type: "city",
    slug: "san-diego",
    name: "San Diego",
    officialName: "City of San Diego Development Services Department",
    websiteUrl: "https://www.sandiego.gov/development-services",
    permitPortalUrl: "https://aca-prod.accela.com/SANDIEGO",
    timezone: "America/Los_Angeles",
    isActive: true,
  },

  departments: [
    {
      key: "san-diego-development-services",
      jurisdictionKey: SD_KEYS.jurisdiction,
      kind: "building",
      name: "Development Services Department (DSD)",
      phone: "619-446-5000",
      email: null,
      url: "https://www.sandiego.gov/development-services",
      addressLine: "Development Services Center, 1222 First Avenue, San Diego, CA 92101",
      hours: null,
      notes:
        "The department that issues building, electrical, mechanical, plumbing and gas permits, publishes Information Bulletins 501 and 103, and operates the Accela and OpenDSD portals. Its phone number is the Development Services Center's general line as the City publishes it; no direct inspector line is recorded, because a schedule's rates are the part this dataset verifies and a stale telephone number is the one piece of context that can send someone to the wrong place.",
    },
    {
      key: "san-diego-planning",
      jurisdictionKey: SD_KEYS.jurisdiction,
      kind: "planning",
      name: "City Planning Department",
      phone: null,
      email: null,
      url: "https://www.sandiego.gov/planning",
      addressLine: null,
      hours: null,
      notes:
        "Collects the General Plan Maintenance Fee through DSD and publishes the separate City Planning Department fee and deposit schedule and the Citywide Development Impact Fee calculator. Named because two charges a reader will see on a real invoice — the General Plan Maintenance Fee, which is modelled here, and the Development Impact Fees, which are not — belong to this department rather than to DSD.",
    },
  ],

  sources: [
    {
      key: SD_BUILDING_SOURCE_KEY,
      jurisdictionKey: SD_KEYS.jurisdiction,
      title: "Information Bulletin 501, \u201cFee Schedule for Construction Permits-Structures\u201d",
      url: "https://www.sandiego.gov/development-services/forms-publications/information-bulletins/501",
      sourceType: "municipal_website",
      issuingAuthority: "City of San Diego Development Services Department",
      authorityKind: "city",
      isPrimary: true,
      documentDate: null,
      effectiveFrom: SD_FEE_EFFECTIVE_FROM,
      retrievedAt: SD_LAST_VERIFIED,
      lastVerifiedAt: SD_LAST_VERIFIED,
      notes:
        "Read 2026-09-24. The bulletin is a web page, and its own PDF (`/sites/default/files/2026-08/dsdib501.pdf`, 3,717,650 bytes, sha256 beginning 356a4dbda0bbe683) carries **no text layer** — `pdftotext` returns nothing because it is a rendered image — so the page's text is the source and this row is recorded as a website rather than a PDF. The header reads \"INFORMATION BULLETIN 501 August 2026\", and its Previous Versions list ends on 2026-08-06, which is why the schedule is effective from 2026-08-07. Table 501A prints the plan-check and inspection base rates and per-square-foot increments; Tables 501B, 501C and 501D the partial permits, miscellaneous items and water/sewer plan check.",
    },
    {
      key: SD_MEP_SOURCE_KEY,
      jurisdictionKey: SD_KEYS.jurisdiction,
      title:
        "Information Bulletin 103, \u201cFee Schedule for Mechanical, Electrical, Plumbing/Gas Permits\u201d",
      url: "https://www.sandiego.gov/development-services/forms-publications/information-bulletins/103",
      sourceType: "municipal_website",
      issuingAuthority: "City of San Diego Development Services Department",
      authorityKind: "city",
      isPrimary: true,
      documentDate: null,
      effectiveFrom: SD_MEP_FEE_EFFECTIVE_FROM,
      retrievedAt: SD_LAST_VERIFIED,
      lastVerifiedAt: SD_LAST_VERIFIED,
      notes:
        "Read 2026-09-24. Header: \"INFORMATION BULLETIN 103 May 2026\", previous version last effective 2026-05-03, so effective from 2026-05-04. Its Table 1A and 1B price mechanical work per building use and per item, Table 2 the electrical work, and Tables 3A and 3B the plumbing work — each printing a **First Unit** and an **Each Add'l Unit** amount. This site models Table 2 and Tables 3A/3B and does not model mechanical work anywhere. One thing the bulletin states plainly and this site repeats: \"Separate building and MEP permits are required for all non-residential and Multi-Dwelling Unit (MDU) construction. Each building must have its own MEP permit.\"",
    },
    {
      key: SD_VALUATION_SOURCE_KEY,
      jurisdictionKey: SD_KEYS.jurisdiction,
      title: "Information Bulletin 101, \u201cBuilding Valuation Schedule\u201d",
      url: "https://www.sandiego.gov/sites/default/files/dsdib101.pdf",
      sourceType: "municipal_website",
      issuingAuthority: "City of San Diego Development Services Department",
      authorityKind: "city",
      isPrimary: false,
      documentDate: null,
      effectiveFrom: null,
      retrievedAt: SD_LAST_VERIFIED,
      lastVerifiedAt: SD_LAST_VERIFIED,
      notes:
        "Cited, not modelled. IB-501 names it for \"valuation determination\", which is what the two state fees are assessed on: the State/Seismic fee at 13¢ or 28¢ per $1,000 and the Building Standards fee at $4 per $100,000. This site does not compute a valuation from a schedule — it takes the applicant's own figure — so the bulletin is recorded because it is the document a reader would need to reproduce the City's number, and the pages say the valuation is theirs to supply.",
    },
  ],

  /** Empty on purpose: the permit types this jurisdiction uses already exist. */
  permitTypes: [],
  projectTypes: [],

  jurisdictionPermitTypes: [
    {
      jurisdictionKey: SD_KEYS.jurisdiction,
      permitTypeKey: "building",
      isAvailable: true,
      localName: "Building permit",
      officialUrl: null,
      notes:
        "Priced as **plan check plus inspection**, each a base rate covering a stated number of square feet plus an increment per square foot above it (Table 501A), with California's State/Seismic fee at 13¢ or 28¢ per $1,000 of valuation and its Building Standards fee at $4 per $100,000 added, plus the City's flat Mapping, Lead Hazard, General Plan Maintenance and fee-collection charges. Separate building and MEP permits are required for all non-residential and multi-dwelling unit construction.",
    },
    {
      jurisdictionKey: SD_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      isAvailable: true,
      localName: "Electrical permit",
      officialUrl: null,
      notes:
        "Priced from Table 2 of Information Bulletin 103: a new MDU service at $1,412.54 for the first dwelling unit and $87.68 for each additional one, a panel replace or upgrade up to 200 A at $176.57, and per-item rows for a conduit-and-j-box-only permit, a generator, a temporary construction pole and a specialised occupancy. The circuit bands — 15–45 A, 50–200 A, 225–400 A, 450–1,000 A and 1,200 A or larger — each price a group of circuits and are named here rather than modelled.",
    },
    {
      jurisdictionKey: SD_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      isAvailable: true,
      localName: "Plumbing permit",
      officialUrl: null,
      notes:
        "Priced from Tables 3A and 3B: new plumbing in a multiple dwelling unit building at $264.25 for the first dwelling unit and $176.57 for each additional one, a remodel at $264.25 and $52.39, a water heater at $122.97, a domestic backflow preventer at $87.68, and per-item rows for a water softener, a sewage ejector, a gas system or meter and a residential pipe repair. Gas work is on the same form. The five-fixture groups — restrooms, kitchens, laboratories — are named rather than modelled.",
    },
  ],

  feeSchedules: [
    {
      key: SD_BUILDING_SOURCE_KEY,
      jurisdictionKey: SD_KEYS.jurisdiction,
      sourceKey: SD_BUILDING_SOURCE_KEY,
      title: "Information Bulletin 501 — Fee Schedule for Construction Permits-Structures",
      officialUrl:
        "https://www.sandiego.gov/development-services/forms-publications/information-bulletins/501",
      effectiveFrom: SD_FEE_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: SD_LAST_VERIFIED,
      notes:
        "Table 501A is the plan-check and inspection table this site prices; the two state fees are printed in the bulletin's Section III beside the City's own flat charges. The bulletin publishes its own history, which is how a fee change can be dated from the document rather than guessed: the version before this one was last effective 2026-08-06.",
    },
    {
      key: SD_MEP_SOURCE_KEY,
      jurisdictionKey: SD_KEYS.jurisdiction,
      sourceKey: SD_MEP_SOURCE_KEY,
      title:
        "Information Bulletin 103 — Fee Schedule for Mechanical, Electrical, Plumbing/Gas Permits",
      officialUrl:
        "https://www.sandiego.gov/development-services/forms-publications/information-bulletins/103",
      effectiveFrom: SD_MEP_FEE_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: SD_LAST_VERIFIED,
      notes:
        "One bulletin for three trades, with the mechanical tables (1A and 1B) that this site does not model and the electrical (2) and plumbing (3A and 3B) tables that it does. Every row prints a First Unit and an Each Add'l Unit amount rather than a single flat rate, which is the shape the pages describe.",
    },
  ],

  feeRules: [
    ...SD_BUILDING_RULES.map((rule) => ({
      jurisdictionKey: SD_KEYS.jurisdiction,
      permitTypeKey: "building",
      scheduleKey: SD_BUILDING_SOURCE_KEY,
      rule,
    })),
    ...SD_ELECTRICAL_RULES.map((rule) => ({
      jurisdictionKey: SD_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      scheduleKey: SD_MEP_SOURCE_KEY,
      rule,
    })),
    ...SD_PLUMBING_RULES.map((rule) => ({
      jurisdictionKey: SD_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      scheduleKey: SD_MEP_SOURCE_KEY,
      rule,
    })),
  ],

  requirements: [
    {
      jurisdictionKey: SD_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "other",
      title: "The building permit is priced as plan check plus inspection, not on a valuation",
      description:
        'Table 501A prints a base rate and an increment for plan check and again for inspection — "New Commercial … Base Sq. Ft. 3,000 … Plan Check Base Rate $4,566.31, Increment Rate $1.57 … Inspection Base Rate $1,570.80, Increment Rate $0.48". The base rate is charged whatever the size of the building and the increment only on area above the row\'s base square footage, so the area is the fact that decides the fee. A valuation is still needed, but only for the two state fees.',
      isMandatory: true,
      sortOrder: 10,
      sourceKey: SD_BUILDING_SOURCE_KEY,
      lastVerifiedAt: SD_LAST_VERIFIED,
    },
    {
      jurisdictionKey: SD_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "other",
      title: "Two State of California fees are charged with every building permit",
      description:
        '"State of California State/Seismic Fee — Public Resources Code Section 2705 … assessed at 13 cents per $1,000 estimated valuation on all permits for construction of single or multifamily structures one or two stories high. The charge is 28 cents per $1,000 … for multifamily construction three stories or higher and for permits on nonresidential construction." And the Building Standards Fee, "assessed at the rate of four dollars ($4) per one hundred thousand dollars ($100,000) in valuation, with appropriate fractions thereof, but not less than one dollar ($1.00)", where "appropriate fractions thereof" is "$1.00 per every twenty-five thousand ($25,000) in valuation".',
      isMandatory: true,
      sortOrder: 20,
      sourceKey: SD_BUILDING_SOURCE_KEY,
      lastVerifiedAt: SD_LAST_VERIFIED,
    },
    {
      jurisdictionKey: SD_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      requirementType: "other",
      title: "A separate MEP permit is required for non-residential and multi-dwelling unit work",
      description:
        '"Separate building and MEP permits are required for all non-residential and Multi-Dwelling Unit (MDU) construction. Each building must have its own MEP permit." That is why the electrical and plumbing pages are their own permits rather than lines on the building page, and why the building page says the two trade permits for the same project are separate applications.',
      isMandatory: true,
      sortOrder: 10,
      sourceKey: SD_MEP_SOURCE_KEY,
      lastVerifiedAt: SD_LAST_VERIFIED,
    },
    {
      jurisdictionKey: SD_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      requirementType: "other",
      title: "Most plumbing items print a First Unit and an Each Additional Unit amount",
      description:
        'Tables 3A and 3B price almost every row as two numbers: "Multiple Dwelling Unit Building (MDU - New), Each Dwelling Unit, First Unit $264.25, Each Add\'l Unit $176.57", "Water Softener — Each $87.68, Each Add\'l Unit $52.39", "Backflow Preventer-Domestic — Each $87.68, Each Add\'l Unit $52.39". A permit is the first-unit amount plus the additional-unit amount for every unit after the first.',
      isMandatory: true,
      sortOrder: 10,
      sourceKey: SD_MEP_SOURCE_KEY,
      lastVerifiedAt: SD_LAST_VERIFIED,
    },
  ],

  profile: {
    jurisdictionKey: SD_KEYS.jurisdiction,
    headline: "Permit fees for the City of San Diego, from two of its own information bulletins",
    summary:
      "San Diego prices a building permit as **plan check plus inspection** — a base rate that covers a stated number of square feet and an increment per square foot above it — and prices electrical and plumbing permits per unit of work, with a First Unit and an Each Additional Unit amount on nearly every row. Two State of California fees are charged with every building permit, and the City adds four flat charges of its own.",
    localContext:
      "Two documents carry the whole schedule, and both are Development Services Department information bulletins the City publishes as web pages. **IB-501** is the construction permit fee schedule: its Table 501A prints the plan-check and inspection pair project type by project type, and its Section III prints the state's State/Seismic and Building Standards fees beside the City's own Mapping, Lead Hazard, General Plan Maintenance and fee-collection charges. **IB-103** is the MEP fee schedule, whose Table 2 is electrical and Tables 3A and 3B are plumbing.\n\nThe City is candid about what a permit is not. IB-103 states that \"Separate building and MEP permits are required for all non-residential and Multi-Dwelling Unit (MDU) construction. Each building must have its own MEP permit\" — so a commercial or apartment project pays the building permit and then each trade permit, and the pages here are written as separate applications for that reason. It also marks each MEP row with whether it qualifies for a \"Simple Permit\", which is a permit that needs no plan review; the fee on the row is the same either way, and what changes is the route the application takes.\n\nA valuation is used for exactly two of the charges. The State/Seismic fee and the Building Standards fee are both assessed on it, and the City publishes a separate Building Valuation Schedule (IB-101) as the document a number would be checked against — this site takes the applicant's own figure rather than computing one from it, and says so on the page. Everything else is priced from the project's area or from a count of units, devices or outlets.",
    valuationBasis:
      "For the building permit, **area decides the fee and valuation does not**. The plan-check and inspection pair is built from the project's square footage: a base rate covering the first 3,000 or 5,000 or 20,000 square feet, depending on the project type, plus an increment for every square foot above it. A valuation is used for exactly two things — the state's State/Seismic fee at 13¢ or 28¢ per $1,000 and its Building Standards fee at $4 per $100,000 — and the electrical and plumbing permits are priced per dwelling unit, per device or per five-fixture group rather than on any value at all.",
    notIncluded:
      "These pages price the fee rows of one bulletin each, the two State of California fees, and the City's flat charges of its own. They exclude:\n\n- **The mechanical permit.** IB-103 Tables 1A and 1B price mechanical work per building use and per item, and no page of this site prices a mechanical permit in any jurisdiction.\n- **The electrical circuit bands.** Table 2 prices 15–45 A circuits as a group with a stepped ladder (\"First 5 Circuits $176.57 … 6-10 Circuits $52.39 … each additional 50 circuits over 50 $141.28\"), and the 50–200 A and 225–400 A rows as $353.13 per 3 circuits. Each prices a group rather than one circuit, so they are named rather than modelled.\n- **The five-fixture plumbing groups** — non-residential restrooms and kitchens, hotels and laboratories — and the per-lineal-foot private water and sewer utilities row.\n- **Table 501B partial permits and Table 501C miscellaneous items**: foundations, frames, shells, partial high-rise work, and antennas, awnings, carports, decks, fences, pools, retaining walls, signs and skylights.\n- **The enhanced and hourly services**: the Development Project Manager at $176.84 per hour, Express Plan Check at $793.95 plus 1.5 times the regular fee, plan changes, overtime inspections, and the address fee of $529.71.\n- **Every other agency's charge** collected with the permit: water and sewer capacity and installation fees, San Diego County Water Authority meter capacity fees, the school district's fees, Lead-Safe and Healthy Homes charges beyond the modelled $58.00, and the Development Impact Fees and Housing Trust Fund fees the City Planning Department collects.\n- **Photovoltaic, electric-vehicle charging and some residential remodel work**, which the bulletins route to their own publications (IB-301, IB-187, IB-203).",
    seoTitle: "San Diego Permit Fees (Building, Electrical, Plumbing)",
    seoDescription:
      "What a City of San Diego building, electrical or plumbing permit costs: building plan check and inspection from a base rate plus a per-square-foot increment, trade permits per unit of work, and the State/Seismic and Building Standards fees.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: SD_LAST_VERIFIED,
  },

  permitPages: [
    {
      jurisdictionKey: SD_KEYS.jurisdiction,
      permitTypeKey: "building",
      slug: "building-permit-cost",
      title: "San Diego building permit cost",
      intro:
        "A City of San Diego building permit is priced as **plan check plus inspection**, and neither is a percentage of anything: Table 501A prints a base rate that covers a stated number of square feet and an increment per square foot above it, once for plan check and once for inspection. A 5,000 square foot single dwelling unit pays $8,085.26 plus 2,000 × $4.10 of plan check and $8,401.90 plus 2,000 × $4.21 of inspection, and California adds its State/Seismic fee at 13¢ per $1,000 of valuation and its Building Standards fee at $4 per $100,000.",
      localSummary:
        "The table is read in one direction only, and that is the thing to know before comparing it to any other city on this site. The base rate is charged **whatever the size of the building** — a 1,500 square foot house pays the full $8,085.26 of plan check — and the increment applies only to the area **above** the row's base square footage. So a 2,500 square foot single dwelling unit pays the base rates alone, and a 6,000 square foot one pays them plus 3,000 square feet at $4.10 and $4.21. That is the opposite of a valuation band, where a bigger building pays a bigger rate on everything; here the rate on the first 3,000 square feet is effectively infinite and then drops to a few dollars a foot.\n\nThe project type decides which row applies, and the rows are built for very different buildings. A new commercial building's plan check base is $4,566.31 covering its first 3,000 square feet with a $1.57 increment; a high-rise's is $11,567.82 covering its first 50,000 square feet with a $0.24 increment; a tenant improvement's is $2,532.77 covering its first 2,000 square feet with a $1.33 increment. The same area can therefore produce three different fees, which is why the pages ask which project type applies rather than only how large it is.\n\nThe two state fees are the only place a valuation enters. The State/Seismic fee is charged at 13¢ per $1,000 for a single-family or multifamily structure one or two storeys high and 28¢ per $1,000 for multifamily work three storeys or higher and for non-residential work; on a $1,200,000 house that is $156.00. The Building Standards fee is $4 per $100,000 with a $1.00 floor, its \"appropriate fractions\" being $1.00 per $25,000, so the same house pays $48.00. Four City charges close the permit: the $737.00 General Plan Maintenance Fee at application, and the $12.16 Mapping, $58.00 Lead Hazard and $17.11 fee-collection charges. On the 5,000 square foot house above those come to $34,135.43 all in.\n\nTwo limits belong with the number. The **mechanical permit** is a separate application this site does not price, and a **valuation** for the two state fees is the applicant's own figure — the City publishes a Building Valuation Schedule in IB-101, and the site does not compute one from it.",
      notIncluded:
        "This estimate is the Table 501A plan-check and inspection pair for the project type named, the two State of California fees, and the City's own flat charges. It excludes:\n\n- **The electrical, plumbing and mechanical permits** on the same project, which are separate applications with their own schedules. This site prices two of the three.\n- **Table 501B partial permits** — foundation, frame, shell and partial high-rise work.\n- **Table 501C miscellaneous items**: antennas, awnings and canopies, carports, decks, doors and windows, equipment pads, fences and retaining walls, fireplaces, garages, greenhouses, patio covers, pools and spas, roof structures and skirtings, siding, skylights, storage racks and sidewalks.\n- **The address fee** at $529.71, the traffic study fee at $2,473.03, the storm water inspection fee at $1,466.11, the Express Plan Check administration fee and the Development Project Manager's hourly rate.\n- **Fees from other agencies and departments** collected with the permit: water and sewer capacity and installation fees, the County Water Authority's meter capacity fee, school district fees, the City Planning Department's impact fees and in-lieu housing fees, and the refundable construction and demolition debris deposit.\n- **Photovoltaic and electric-vehicle charging permits**, which their own bulletins (IB-301 and IB-187) price separately.",
      workedExample: {
        scenario:
          "A new 5,000 square foot detached single dwelling unit in the City of San Diego, two storeys high, valued by the applicant at $1,200,000 for the two state fees — permitted as a building permit.",
        inputs: {
          squareFootage: 5_000,
          valuationCents: 120_000_000,
          occupancy: "residential",
          workType: "new_construction",
          custom: { project_type: "sdu_duplex", stories: 2 },
        },
        notes:
          "The plan check and the inspection are two charges on one table. Table 501A's Res-SDU/DUP row gives a plan-check base of $8,085.26 covering the first 3,000 square feet and a $4.10 increment above it, and an inspection base of $8,401.90 with a $4.21 increment: 2,000 square feet above the base is $8,200.00 of plan check and $8,420.00 of inspection, so the pair is $16,285.26 and $16,821.90. The State/Seismic fee is 13¢ per $1,000 because the structure is residential and two storeys high, which on $1,200,000 is $156.00, and the Building Standards fee is $4 per $100,000 — $48.00. The City's own four charges are the $737.00 General Plan Maintenance Fee, $12.16 of mapping, the $58.00 Lead Hazard fee and $17.11 for collecting other agencies' fees. Total: $34,135.43.\n\nTwo variations show what moves. As a 5,000 square foot **new commercial** building the row changes entirely: $4,566.31 plus 2,000 × $1.57 of plan check and $1,570.80 plus 2,000 × $0.48 of inspection, and the State/Seismic fee doubles to 28¢ per $1,000 because the work is non-residential. As a **1,000 square foot** single dwelling unit, below the row's 3,000 square foot base, the increments do not apply at all and the permit is the two base rates plus the state and City charges — which is the clearest way to see that the base rate is a floor on the whole project type rather than a charge for the first few thousand feet.\n\nOne caution belongs with the number: the valuation is the applicant's own, taken as the basis for the two state fees, and the City's Building Valuation Schedule (IB-101) is the document it would be checked against.",
      },
      faqs: [
        {
          question: "Is the fee a percentage of my project's value?",
          answer:
            "Not for the permit itself. Table 501A builds the plan-check and inspection charges from the project's **square footage** — a base rate covering a stated area plus an increment above it — and a valuation is used only for the State/Seismic and Building Standards fees. A $1,200,000 house and a $2,400,000 house of the same size and type pay the same plan check and inspection, and differ only in the two state fees.",
          sourceId: SD_BUILDING_SOURCE_KEY,
          attribution: "Information Bulletin 501, Table 501A and Section III",
        },
        {
          question: "What does the base square footage mean?",
          answer:
            "It is the area the row's base rates already cover. For Res-SDU/DUP that is 3,000 square feet, so a 2,500 square foot house pays the base rates and no increment, and a 5,000 square foot house pays them plus 2,000 square feet at each of the two increments. The base rate is therefore charged at any size — it is a floor for the project type, not a charge for the first few thousand feet.",
          sourceId: SD_BUILDING_SOURCE_KEY,
          attribution: "Information Bulletin 501, Table 501A",
        },
        {
          question: "Why are there separate plan check and inspection charges?",
          answer:
            "Because the City prints them as two rates and collects them at different points. Table 501A gives each project type a plan-check base and increment and an inspection base and increment, and the bulletin describes when each is collected — plan check at review and inspection at issuance, with the inspection fee refundable in part and plan check not. A 5,000 square foot single dwelling unit pays $16,285.26 of plan check and $16,821.90 of inspection.",
          sourceId: SD_BUILDING_SOURCE_KEY,
          attribution: "Information Bulletin 501, Sections I and III",
        },
        {
          question: "What is the State/Seismic fee and why does the rate change?",
          answer:
            "\"State of California State/Seismic Fee — Public Resources Code Section 2705 … assessed at 13 cents per $1,000 estimated valuation on all permits for construction of single or multifamily structures one or two stories high.\" The rate rises to 28 cents per $1,000 for \"multifamily construction three stories or higher and for permits on nonresidential construction\". So a two-storey house pays 13¢ and the same building as non-residential work pays 28¢, which is why the page asks both the occupancy and the height.",
          sourceId: SD_BUILDING_SOURCE_KEY,
          attribution: "Information Bulletin 501, Section III",
        },
        {
          question: "How is the Building Standards fee calculated?",
          answer:
            "\"Assessed at the rate of four dollars ($4) per one hundred thousand dollars ($100,000) in valuation, with appropriate fractions thereof, but not less than one dollar ($1.00).\" The bulletin interprets the fractions itself — \"\\\"Appropriate fractions thereof\\\" is interpreted to be $1.00 per every twenty-five thousand ($25,000) in valuation\" — so the charge is $1.00 for each $25,000 of value or part of one. A $1,200,000 project pays $48.00.",
          sourceId: SD_BUILDING_SOURCE_KEY,
          attribution: "Information Bulletin 501, Section III",
        },
        {
          question: "Are the electrical and plumbing permits included?",
          answer:
            "They are not. \"Separate building and MEP permits are required for all non-residential and Multi-Dwelling Unit (MDU) construction. Each building must have its own MEP permit.\" The electrical and plumbing permits are priced from Information Bulletin 103 on their own pages, and the mechanical permit is a third application this site does not price.",
          sourceId: SD_MEP_SOURCE_KEY,
          attribution: "Information Bulletin 103",
        },
      ],
      seoTitle: "San Diego Building Permit Cost (plan check + inspection)",
      seoDescription:
        "A City of San Diego building permit is priced as plan check plus inspection — a base rate covering the first few thousand square feet plus an increment per square foot — with California's State/Seismic and Building Standards fees.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: SD_LAST_VERIFIED,
    },

    {
      jurisdictionKey: SD_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      slug: "electrical-permit-cost",
      title: "San Diego electrical permit cost",
      intro:
        "A City of San Diego electrical permit is priced from **Table 2 of Information Bulletin 103**, and most of its rows print two amounts rather than one: a **new MDU service** is $1,412.54 for the first dwelling unit and $87.68 for each one after it, a **panel replace or upgrade** up to 200 amperes is $176.57, and a permit for conduit and junction boxes only, a generator, a temporary construction pole or a specialised occupancy is a flat $176.57 to $529.71. The circuit bands price a *group* of circuits rather than one and are named rather than modelled.",
      localSummary:
        "The service charge is the row most permits turn on, and it is measured in dwelling units rather than in amperes. \"Electrical Service New MDU, 1 Dwelling Unit — First Unit $1,412.54, Each Add'l Unit $87.68\": so the first unit carries the whole base and each additional one adds $87.68, which a twelve-unit building turns into $1,412.54 plus eleven times $87.68. That is a different question from the amperage basis used in Florida, where a service is priced by how much current it carries; here it is priced by how many dwellings it serves.\n\nThe flat rows are deliberately small and specific. Conduit and junction boxes only is $176.57, a generator only is $176.57, a temporary construction power pole is $176.57 and a specialised occupancy — healthcare or a hazardous location, as Chapter 5 of the California Electrical Code identifies them — is $529.71. Each is one charge for the permit rather than a rate on anything, and each is gated on the item the applicant is permitting so that two of them can never apply to one job by accident.\n\nThe bands left out are the ones to ask about. Table 2 prices 15–45 ampere circuits as \"First 5 Circuits $176.57 … 6-10 Circuits $52.39 … each additional 10 circuits over 10, up to 50 $52.39 … each additional 50 circuits over 50 $141.28\", and the 50–200 A and 225–400 A rows at $353.13 for each **three** circuits. Every one of those prices a group, so this site names the row instead of inventing a per-circuit rate the bulletin does not print — which matters, because the difference between reading \"6-10 Circuits $52.39\" as $52.39 for the band and as $52.39 for each circuit is more than the permit.",
      notIncluded:
        "This estimate is the Table 2 electrical rows this site models: the new MDU service charge and the flat per-item permits. It excludes:\n\n- **The circuit bands** — 15–45 A, 50–200 A, 225–400 A, 450–1,000 A and 1,200 A or larger — each of which prices a group of circuits rather than one.\n- **The building permit** on the same project, which is a separate application, and the **plumbing** and **mechanical** permits, the last of which this site does not price anywhere.\n- **Solar photovoltaic and electric-vehicle charging systems**, which Information Bulletins 301 and 187 price separately.\n- **The specialised-occupancy hazardous materials permit** from San Diego Fire-Rescue that may accompany the $529.71 electrical row.\n- **The mapping fee** of $12.16 and other charges that IA-501 and IB-103 both reference.\n- **The plan review fee** where a project does not qualify for a Simple Permit and is not submitted with a building permit; in that case IB-103 says a plan review fee is charged per Information Bulletin 501.",
      workedExample: {
        scenario:
          "An eight-unit multiple dwelling unit building in the City of San Diego, permitted for its electrical service as a standalone MEP permit.",
        inputs: {
          units: 8,
          occupancy: "residential",
          workType: "new_construction",
          custom: { electrical_item: "mdu_service" },
        },
        notes:
          "Table 2's electrical service row is a First Unit and an Each Add'l Unit amount, and Table 2 counts it in **dwelling units**: $1,412.54 for the first unit and $87.68 for each of the seven that follow, which is $613.76, so the permit is $2,026.30. Nothing else on the permit applies, because the flat rows are gated on the item being permitted and a service permit is not a conduit-only, generator, temporary-pole or specialised-occupancy permit.\n\nOne caution belongs with the number. This is the **electrical service** charge alone; the branch circuits, the panel and any specialised-occupancy work are separate lines on the same Table 2, and the circuit bands in particular are not modelled here because each prices a group of circuits rather than one.",
      },
      faqs: [
        {
          question: "How is the electrical service charged?",
          answer:
            "\"Table 2: Electrical Service New MDU, 1 Dwelling Unit — First Unit $1,412.54, Each Add'l Unit $87.68.\" The first dwelling unit carries the base charge and every unit after it adds $87.68, so the row is counted in dwelling units rather than in amperes. An eight-unit building is $1,412.54 plus seven times $87.68.",
          sourceId: SD_MEP_SOURCE_KEY,
          attribution: "Information Bulletin 103, Table 2",
        },
        {
          question: "Why are the circuit rows not priced here?",
          answer:
            "Because each prices a group. Table 2 reads \"Circuits 15-45 Amps — First 5 Circuits $176.57 … 6-10 Circuits $52.39 … Each additional 10 circuits over 10, up to 50 $52.39 … Each additional 50 circuits over 50 $141.28\", and prices 50–200 A and 225–400 A at $353.13 for each three circuits. The bulletin does not print a single per-circuit rate for any band, so this site names them rather than guessing one.",
          sourceId: SD_MEP_SOURCE_KEY,
          attribution: "Information Bulletin 103, Table 2",
        },
        {
          question: "Do I need a separate building permit for electrical work?",
          answer:
            "\"Separate building and MEP permits are required for all non-residential and Multi-Dwelling Unit (MDU) construction. Each building must have its own MEP permit.\" The bulletin also flags the reverse: a separate building permit is required when the electrical scope includes drywall, wood framing or new finishes in an MDU or non-residential building.",
          sourceId: SD_MEP_SOURCE_KEY,
          attribution: "Information Bulletin 103",
        },
        {
          question: "What is a Simple Permit, and does it change the fee?",
          answer:
            "IB-103 marks each row \"Qualifies for Simple Permit—MEP\". A Simple Permit is one that does not require plan review and can be applied for online; the fee on the row is the same either way. What changes is the route: if a project includes items needing plan review alongside Simple Permit items, \"the project does not qualify for Simple Permits–MEP and all items must be included in the permit scope to be plan reviewed\", and a plan review fee is charged per IB-501.",
          sourceId: SD_MEP_SOURCE_KEY,
          attribution: "Information Bulletin 103, Section II",
        },
        {
          question: "Is solar priced on this table?",
          answer:
            "No. Table 2 marks \"Solar Photovoltaic\" with a note to see Information Bulletin 301, and electric-vehicle charging in private garages with a note to see IB-187. Both are priced by their own bulletins, and this site models neither.",
          sourceId: SD_MEP_SOURCE_KEY,
          attribution: "Information Bulletin 103, Table 2",
        },
      ],
      seoTitle: "San Diego Electrical Permit Cost (IB-103 Table 2)",
      seoDescription:
        "A City of San Diego electrical permit is priced from Information Bulletin 103 Table 2 — $1,412.54 for the first dwelling unit of a new MDU service plus $87.68 each, $176.57 for a panel upgrade or a generator, $529.71 for a specialised occupancy.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: SD_LAST_VERIFIED,
    },

    {
      jurisdictionKey: SD_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      slug: "plumbing-permit-cost",
      title: "San Diego plumbing permit cost",
      intro:
        "A City of San Diego plumbing permit is priced from **Tables 3A and 3B of Information Bulletin 103**, and nearly every row prints two amounts: new plumbing in a multiple dwelling unit building is **$264.25 for the first dwelling unit and $176.57 for each additional one**, a remodel is $264.25 and $52.39, a **water heater** is $122.97, and a domestic **backflow preventer** is $87.68 for the first and $52.39 for each one after it. Gas work is on the same form, and the five-fixture groups are named rather than modelled.",
      localSummary:
        "The row that decides a new building is the MDU charge, and it is counted in dwelling units. \"Multiple Dwelling Unit Building (MDU - New), Each Dwelling Unit — First Unit $264.25, Each Add'l Unit $176.57\": the first unit carries the base and each one after it adds $176.57, so a twelve-unit building is $264.25 plus eleven times $176.57. A remodel of the same building is charged on its own row at $264.25 for the first unit and $52.39 for each additional one, which is a little over a quarter of the new-work rate — the bulletin prices new and remodel work as different questions rather than applying a discount to one.\n\nTable 3B carries the single-item permits, and they are the ones an ordinary job uses. A water heater is $122.97, a domestic backflow preventer is $87.68 for the first and $52.39 after it, a water softener and a sewage ejector are their own rows, and a gas system or meter is $264.25 for each five outlets with $87.68 for each additional group. Each is gated on the item being permitted, so a water-heater permit cannot be charged the backflow rate as well.\n\nWhat is left out is grouped, and it is grouped in the bulletin's own way. Non-residential restrooms and kitchens, hotels and laboratories are priced **per five fixtures** — \"Non-Residential Restrooms, Each 5 Fixtures, First Unit $264.25, Each Add'l Unit $70.58\" — and the private water and sewer utilities row is priced per 100 lineal feet. This site does not collect a fixture group or a pipe length, so it names those rows rather than assembling a number from them.",
      notIncluded:
        "This estimate is the Table 3A and 3B plumbing rows this site models: the MDU new and remodel charges and the per-item permits. It excludes:\n\n- **The five-fixture groups** — non-residential restrooms at $264.25 and kitchens at $353.13 for each five fixtures, hotels and laboratories — and the per-dwelling-unit kitchen and bathroom remodel row of Table 3A.\n- **The per-lineal-foot row** — private water and sewer utilities at $264.25 for the first 100 feet and $52.39 for each additional 10 feet — because this site does not collect a pipe length.\n- **The reclaim water and gray water rows**, and the building drain charge by floor.\n- **The building, electrical and mechanical permits** on the same project, each a separate application.\n- **Fees from other agencies** collected with the permit, including the Water and Sewer capacity and installation charges and the County Water Authority's meter capacity fee.\n- **The food establishment wastewater discharge review** of a grease trap or interceptor, which requires approval from the Public Utilities Department and is not a fee on this table.",
      workedExample: {
        scenario:
          "A new twelve-unit multiple dwelling unit building in the City of San Diego, permitted for its plumbing as a standalone MEP permit.",
        inputs: {
          units: 12,
          occupancy: "residential",
          workType: "new_construction",
          custom: { plumbing_item: "mdu_new" },
        },
        notes:
          "Table 3A's MDU row is a First Unit and an Each Add'l Unit amount counted in dwelling units: $264.25 for the first and $176.57 for each of the eleven that follow, which is $1,942.27, so the permit is $2,206.52. The remodel row would answer the same question differently — $264.25 plus eleven times $52.39 — which is the cleanest way to see that the bulletin prices new work and remodel work as separate rows rather than one rate with a discount.\n\nA second example shows the per-item rows. A single water heater replacement is one row of Table 3B at $122.97 and nothing else, because the tables are gated on the item being permitted; adding a backflow preventer to the same job would be its own $87.68. And a caution belongs with the number: this is the plumbing charge alone, and the building, electrical and mechanical permits for the same building are separate applications, the last of which this site does not price.",
      },
      faqs: [
        {
          question: "How is plumbing priced for a new apartment building?",
          answer:
            "\"Multiple Dwelling Unit Building (MDU - New), Each Dwelling Unit — First Unit $264.25, Each Add'l Unit $176.57.\" The first dwelling unit carries the base charge and every unit after it adds $176.57. A twelve-unit building is $264.25 plus eleven times $176.57, which is $2,206.52.",
          sourceId: SD_MEP_SOURCE_KEY,
          attribution: "Information Bulletin 103, Table 3A",
        },
        {
          question: "Is a remodel charged the same as new work?",
          answer:
            "It has its own row. \"MDU Building - Remodel, Each Dwelling Unit — First Unit $264.25, Each Add'l Unit $52.39\", against $176.57 for each additional unit of new work. The first unit costs the same and every unit after it costs a little over a quarter as much, so the tables price new and remodel work as separate questions.",
          sourceId: SD_MEP_SOURCE_KEY,
          attribution: "Information Bulletin 103, Table 3A",
        },
        {
          question: "What does a water heater cost?",
          answer:
            "\"Table 3B: Water Heater — Each $122.97\", one charge for the permit. The bulletin adds a limit worth knowing: \"For non-residential or MDU buildings, replacing a water heater with a tankless water heater requires plans and plan review.\"",
          sourceId: SD_MEP_SOURCE_KEY,
          attribution: "Information Bulletin 103, Table 3B",
        },
        {
          question: "Why are some rows priced per five fixtures?",
          answer:
            "Because the bulletin prices a group rather than a single fixture for non-residential work: \"Non-Residential Restrooms — Each 5 Fixtures, First Unit $264.25, Each Add'l Unit $70.58\", and \"Non-Residential Kitchen — Each 5 Fixtures, First Unit $353.13, Each Add'l Unit $122.97\". This site does not collect a fixture group, so it names those rows instead of assembling a number from them.",
          sourceId: SD_MEP_SOURCE_KEY,
          attribution: "Information Bulletin 103, Table 3A",
        },
        {
          question: "Is the gas permit separate?",
          answer:
            "It is a row on the same plumbing table rather than a separate bulletin: \"Gas System/Meter — Each 5 Outlets $264.25, Each Add'l Unit $87.68\", with a gas system leak repair row at the same amounts. Gas work is therefore part of the plumbing permit here, and the site names the gas rows rather than including them in the MDU example.",
          sourceId: SD_MEP_SOURCE_KEY,
          attribution: "Information Bulletin 103, Table 3B",
        },
      ],
      seoTitle: "San Diego Plumbing Permit Cost (IB-103 Tables 3A and 3B)",
      seoDescription:
        "A City of San Diego plumbing permit is priced from Information Bulletin 103 — $264.25 for the first dwelling unit of a new MDU plus $176.57 each, $122.97 for a water heater, $87.68 for a backflow preventer — with gas on the same form.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: SD_LAST_VERIFIED,
    },
  ],

  verifications: [
    {
      entityType: "source",
      entityKey: SD_BUILDING_SOURCE_KEY,
      status: "verified",
      method: "manual_review",
      verifiedAt: SD_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: SD_BUILDING_SOURCE_KEY,
      notes:
        "Read in full on 2026-09-24. The bulletin is a web page; its PDF was fetched and found to carry no text layer, which is recorded as the reason the page is the source. Its header, its Previous Versions list and Tables 501A to 501D were read, and the two state fees and the four flat City charges were taken from Section III.",
    },
    {
      entityType: "source",
      entityKey: SD_MEP_SOURCE_KEY,
      status: "verified",
      method: "manual_review",
      verifiedAt: SD_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: SD_MEP_SOURCE_KEY,
      notes:
        "Read in full on 2026-09-24. Tables 1A, 1B, 2, 3A and 3B were transcribed; Table 2 and Tables 3A and 3B are modelled and the mechanical tables are not. The bulletin's own sentence requiring a separate MEP permit for non-residential and multi-dwelling unit work is quoted on the electrical and plumbing pages.",
    },
    {
      entityType: "source",
      entityKey: SD_VALUATION_SOURCE_KEY,
      status: "verified",
      method: "manual_review",
      verifiedAt: SD_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: SD_VALUATION_SOURCE_KEY,
      notes:
        "Cited rather than modelled: IB-501 names it for valuation determination, and this site takes the applicant's valuation as an input instead of computing one from it.",
    },
    {
      entityType: "fee_schedule",
      entityKey: SD_BUILDING_SOURCE_KEY,
      status: "verified",
      method: "manual_review",
      verifiedAt: SD_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: SD_BUILDING_SOURCE_KEY,
      notes:
        "Table 501A is modelled for ten project types as a plan-check and inspection pair; the state's two fees and the City's four flat charges are modelled from Section III. Tables 501B and 501C are named and not modelled.",
    },
    {
      entityType: "fee_schedule",
      entityKey: SD_MEP_SOURCE_KEY,
      status: "verified",
      method: "manual_review",
      verifiedAt: SD_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: SD_MEP_SOURCE_KEY,
      notes:
        "Table 2's per-item and new-MDU rows and Tables 3A and 3B's dwelling-unit and per-item rows are modelled; the electrical circuit bands and the plumbing five-fixture groups are named because each prices a group rather than a unit.",
    },
    {
      entityType: "fee_rule",
      entityKey: "BUILD-PLAN-CHECK-SDU-DUPLEX",
      permitTypeKey: "building",
      status: "verified",
      method: "manual_review",
      verifiedAt: SD_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: SD_BUILDING_SOURCE_KEY,
      notes:
        '"Table 501A: Res-SDU/DUP … Base Sq. Ft. 3,000 … Plan Check Base Rate $8,085.26, Increment Rate $4.10." The rule carries the base as `baseCents` and the 3,000 square feet as `thresholdCents`, so the increment is charged only above the base area. Verified end to end: a 5,000 square foot house computes $8,085.26 + 2,000 × $4.10 = $16,285.26, and a 2,500 square foot house computes the base rate alone.',
    },
    {
      entityType: "fee_rule",
      entityKey: "BUILD-INSPECTION-SDU-DUPLEX",
      permitTypeKey: "building",
      status: "verified",
      method: "manual_review",
      verifiedAt: SD_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: SD_BUILDING_SOURCE_KEY,
      notes:
        '"Table 501A: Res-SDU/DUP … Inspection Base Rate $8,401.90, Increment Rate $4.21." Same shape as the plan-check rule, and the test asserts the pair on one permit: $16,285.26 and $16,821.90 at 5,000 square feet.',
    },
    {
      entityType: "fee_rule",
      entityKey: "BUILD-STATE-SEISMIC-NONRESIDENTIAL",
      permitTypeKey: "building",
      status: "verified",
      method: "manual_review",
      verifiedAt: SD_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: SD_BUILDING_SOURCE_KEY,
      notes:
        '"The charge is 28 cents per $1,000 estimated valuation for multifamily construction three stories or higher and for permits on nonresidential construction." The rule and its 13-cent sibling are gated so exactly one applies to a permit: the 13-cent rule requires residential occupancy and the absence of three or more storeys, and this one applies otherwise. A residential permit that names no height is charged the lower rate.',
    },
    {
      entityType: "fee_rule",
      entityKey: "BUILD-BUILDING-STANDARDS",
      permitTypeKey: "building",
      status: "verified",
      method: "manual_review",
      verifiedAt: SD_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: SD_BUILDING_SOURCE_KEY,
      notes:
        '"Four dollars ($4) per one hundred thousand dollars ($100,000) in valuation, with appropriate fractions thereof, but not less than one dollar ($1.00)", the fractions being "$1.00 per every twenty-five thousand ($25,000)". Verified: $1,200,000 computes $48.00; $30,000 computes $2.00; $10,000 computes $1.00 at the floor.',
    },
    {
      entityType: "fee_rule",
      entityKey: "ELEC-MDU-SERVICE",
      permitTypeKey: "electrical",
      status: "verified",
      method: "manual_review",
      verifiedAt: SD_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: SD_MEP_SOURCE_KEY,
      notes:
        '"Table 2: Electrical Service New MDU, 1 Dwelling Unit — First Unit $1,412.54, Each Add\'l Unit $87.68." Modelled as a per-unit rule on dwelling units with a base charge and an allowance of one; verified against eight units, $1,412.54 + 7 × $87.68 = $2,026.30.',
    },
    {
      entityType: "fee_rule",
      entityKey: "PLUMB-MDU-NEW",
      permitTypeKey: "plumbing",
      status: "verified",
      method: "manual_review",
      verifiedAt: SD_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: SD_MEP_SOURCE_KEY,
      notes:
        "\"Table 3A: Multiple Dwelling Unit Building (MDU - New), Each Dwelling Unit — First Unit $264.25, Each Add'l Unit $176.57.\" Verified against twelve units, $264.25 + 11 × $176.57 = $2,206.52, and checked against the remodel row on the same table, which computes $264.25 + 11 × $52.39.",
    },
    {
      entityType: "permit_page",
      entityKey: "building-permit-cost",
      permitTypeKey: "building",
      status: "verified",
      method: "manual_review",
      verifiedAt: SD_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: SD_BUILDING_SOURCE_KEY,
      notes:
        "The worked example was recomputed with the engine: $16,285.26 of plan check, $16,821.90 of inspection, $156.00 of State/Seismic, $48.00 of Building Standards, $737.00 of General Plan, $12.16 of mapping, $58.00 of lead hazard and $17.11 of fee collection, $34,135.43.",
    },
    {
      entityType: "permit_page",
      entityKey: "electrical-permit-cost",
      permitTypeKey: "electrical",
      status: "verified",
      method: "manual_review",
      verifiedAt: SD_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: SD_MEP_SOURCE_KEY,
      notes:
        "Recomputed with the engine for an eight-unit MDU service: $2,026.30.",
    },
    {
      entityType: "permit_page",
      entityKey: "plumbing-permit-cost",
      permitTypeKey: "plumbing",
      status: "verified",
      method: "manual_review",
      verifiedAt: SD_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: SD_MEP_SOURCE_KEY,
      notes:
        "Recomputed with the engine for a twelve-unit MDU: $2,206.52.",
    },
    {
      entityType: "jurisdiction_profile",
      entityKey: SD_KEYS.jurisdiction,
      status: "verified",
      method: "manual_review",
      verifiedAt: SD_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: SD_BUILDING_SOURCE_KEY,
      notes:
        "The profile's claims about what decides a fee, and about which of the City's and the state's charges are modelled, are read off the two bulletins' own sections rather than inferred; the address, telephone number and portal are taken from the City's own pages.",
    },
  ],
};

/** Permit pages that clear the editorial gate for this jurisdiction. */
export const SD_PUBLISHED_PERMIT_PAGES = sanDiegoSeed.permitPages.filter(
  (page) => page.publishStatus === "published" && !page.noindex,
);
