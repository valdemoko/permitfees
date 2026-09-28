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
  MADISON_BUILDING_BASE_RULES,
  MADISON_CONTACT_SOURCE_KEY,
  MADISON_ELECTRICAL_BASE_RULES,
  MADISON_FEES_PAGE_SOURCE_KEY,
  MADISON_FEE_EFFECTIVE_FROM,
  MADISON_MGO_18_09_SOURCE_KEY,
  MADISON_MGO_19_11_SOURCE_KEY,
  MADISON_MGO_29_09_SOURCE_KEY,
  MADISON_ONLINE_PERMITS_SOURCE_KEY,
  MADISON_ONE_TWO_FAMILY_SOURCE_KEY,
  MADISON_PERMITS_PAGE_SOURCE_KEY,
  MADISON_PLUMBING_BASE_RULES,
} from "./fee-rules";

export * from "./fee-rules";

/**
 * The complete Madison, Wisconsin seed payload.
 *
 * Every figure traces to research/wisconsin/madison.md, which traces to three
 * enacted Madison General Ordinances — 29.09 for the building fee, 18.09 for
 * plumbing and 19.11 for electric, all effective 2021-03-27 — and to the
 * Building Inspection Division's own fee page, which restates all three as one
 * four-column table. Nothing is estimated, and the one place the two City
 * sources disagree is charged at the enacted figure with the page's figure
 * named beside it.
 *
 * Three pages, all published, and they are three *different* schedules rather
 * than one schedule cited three times: the same square footage is multiplied by
 * a different group rate for each permit, and each trade has its own Group IV
 * row for work on an existing structure.
 */

const RESEARCHER = "Permit Fee Intelligence research pass 11 (Wisconsin)";

export const MADISON_LAST_VERIFIED = "2026-09-25";

export const MADISON_KEYS = {
  state: "wi",
  county: "dane-county",
  jurisdiction: "madison",
  feeSchedule: "madison-building-inspection-fees",
} as const;

const state: SeedState = {
  code: "WI",
  slug: "wisconsin",
  name: "Wisconsin",
  fipsCode: "55",
};

const county: SeedCounty = {
  key: MADISON_KEYS.county,
  slug: "dane-county",
  name: "Dane County",
  fipsCode: "55025",
};

const jurisdiction: SeedJurisdiction = {
  key: MADISON_KEYS.jurisdiction,
  stateKey: MADISON_KEYS.state,
  countyKey: MADISON_KEYS.county,
  type: "city",
  slug: "madison",
  name: "Madison",
  officialName: "City of Madison",
  websiteUrl: "https://www.cityofmadison.com/",
  permitPortalUrl:
    "https://www.cityofmadison.com/development-services-center/1-2-family-residential/online-permits",
  timezone: "America/Chicago",
  isActive: true,
};

const departments: SeedDepartment[] = [
  {
    key: "madison-building-inspection",
    jurisdictionKey: MADISON_KEYS.jurisdiction,
    kind: "building",
    name: "Building Inspection — Development Services Center",
    phone: "608-266-4551",
    email: "binspection@cityofmadison.com",
    url: "https://www.cityofmadison.com/dpced/building-inspection/contact",
    addressLine: "Madison Municipal Building, 215 Martin Luther King Jr. Blvd. Suite 017, Madison, WI 53703",
    hours: "Monday to Friday, 7:30 a.m. to 4:30 p.m. The permit counter is by appointment only.",
    notes:
      "One division, four codes: Building Inspection reviews plans, issues building, electrical, plumbing, mechanical and demolition permits, and collects every fee in this schedule — MGO 29.09(1) says the fees \"shall be assessed and collected by the Building Inspection Division\". Mailing address is P.O. Box 2984, Madison, WI 53701-2984. Plan review is extension 2, zoning is extension 3, and the Licenses and Permits portal the City sends applicants to is an ELAM/Accela instance: staff enter new buildings, additions and first-time buildouts by hand because those cannot be filed online.",
  },
];

const sources: SeedSource[] = [
  {
    key: MADISON_FEES_PAGE_SOURCE_KEY,
    jurisdictionKey: MADISON_KEYS.jurisdiction,
    title: "Building Inspection Fees — City of Madison",
    url: "https://www.cityofmadison.com/development-services-center/fees/building-inspection-fees",
    sourceType: "municipal_website",
    issuingAuthority: "City of Madison, Building Inspection Division",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: MADISON_LAST_VERIFIED,
    lastVerifiedAt: MADISON_LAST_VERIFIED,
    notes:
      "Read 2026-09-25, and again through the Internet Archive's 2022-01-23 snapshot to date its edits. Collapses MGO 29.09, 18.09 and 19.11 into one four-column table (Building / Electricity / Plumbing / HVAC / Total) with a $25.00 minimum in every column, adds the MGO 28.206 zoning review fee, and carries the State charges the ordinances also name. Every cell matches its ordinance except Group II plumbing, where the page prints $.11 and MGO 18.09 enacts $.10. Its State citation is corrupted — \"SPS 3031(1)(g) in Table 3031-3\" against the ordinance's \"SPS 302.31(1)(g) in Table 302.31-3\" — which is why the ordinances are cited for rates and the page for context.",
  },
  {
    key: MADISON_MGO_29_09_SOURCE_KEY,
    jurisdictionKey: MADISON_KEYS.jurisdiction,
    title:
      "Madison General Ordinances Ch. 29 \"Building Code\", §29.09 Fee Schedule (ORD-21-00024)",
    url: "https://mcclibraryfunctions.azurewebsites.us/api/ordinanceDownload/50000/1074843/pdf",
    sourceType: "ordinance",
    issuingAuthority: "City of Madison Common Council",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2021-03-16",
    effectiveFrom: MADISON_FEE_EFFECTIVE_FROM,
    retrievedAt: MADISON_LAST_VERIFIED,
    lastVerifiedAt: MADISON_LAST_VERIFIED,
    notes:
      "Read 2026-09-25 as a PDF in both pdftotext -layout and plain modes; the fee tables pair correctly only in -layout. File 63535, final action 2021-03-16, mayor approval 2021-03-22, published 2021-03-26, effective 2021-03-27. §29.09(1) sets who collects, §29.09(2)(b) how area is measured, §29.09(2)(c) what an alteration's value includes and the cap on it, §29.09(3) the penalty for unpermitted work, §29.09(3)(a) the inspection-fee table and §29.09(3)(b) the plan-review table. The fiscal note records that the 2021 increases were \"intended to primarily impact large commercial type construction\" and were the first in over a decade.",
  },
  {
    key: MADISON_MGO_18_09_SOURCE_KEY,
    jurisdictionKey: MADISON_KEYS.jurisdiction,
    title:
      "Madison General Ordinances Ch. 18 \"Plumbing Code\", §18.09 Plumbing Permit Fee Schedule (ORD-21-00025)",
    url: "https://mcclibraryfunctions.azurewebsites.us/api/ordinanceDownload/50000/1074844/pdf",
    sourceType: "ordinance",
    issuingAuthority: "City of Madison Common Council",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2021-03-16",
    effectiveFrom: MADISON_FEE_EFFECTIVE_FROM,
    retrievedAt: MADISON_LAST_VERIFIED,
    lastVerifiedAt: MADISON_LAST_VERIFIED,
    notes:
      "Read 2026-09-25 as a PDF, twice. File 63536, effective 2021-03-27. §18.09 enacts Group I $.09, Group II $.10 and Group III $.06 per sq. ft. with a $25.00 minimum, and Group IV at $8.00 per fixture with its fixture-counting note. Also carries §18.06 (plumber's licence, and the owner exception for an occupied single-family residence), §18.07(3)(b) (plan examination by SPS 302.64, Table 302.64-1), §18.07(1)(d) (the City as agent municipality) and §18.08 (application, signed by a licensed plumber registered with DSPS, filed within three working days).",
  },
  {
    key: MADISON_MGO_19_11_SOURCE_KEY,
    jurisdictionKey: MADISON_KEYS.jurisdiction,
    title:
      "Madison General Ordinances Ch. 19 \"Electrical Code\", §19.11 Electric Permit Fee Schedule (ORD-21-00026)",
    url: "https://mcclibraryfunctions.azurewebsites.us/api/ordinanceDownload/50000/1074846/pdf",
    sourceType: "ordinance",
    issuingAuthority: "City of Madison Common Council",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2021-03-16",
    effectiveFrom: MADISON_FEE_EFFECTIVE_FROM,
    retrievedAt: MADISON_LAST_VERIFIED,
    lastVerifiedAt: MADISON_LAST_VERIFIED,
    notes:
      "Read 2026-09-25 as a PDF, twice. File 63538, effective 2021-03-27. §19.11 enacts Group I $.09, Group II $.11 and Group III $.06 per sq. ft. with a $25.00 minimum, Group IV at $25.00 for the first ten openings plus $1.00 each additional with the schedule's own definition of an opening, and Electric Service Replacement at $50.00 per service panel. §19.08 requires a State licence and grants the residential property owner exception; §19.09 requires the permit, requires proof of employment and the licence holder's signature, and defines the minor repair work that needs none.",
  },
  {
    key: MADISON_PERMITS_PAGE_SOURCE_KEY,
    jurisdictionKey: MADISON_KEYS.jurisdiction,
    title: "Permits — \"Do I need a permit?\" chart, City of Madison",
    url: "https://www.cityofmadison.com/development-services-center/permits",
    sourceType: "municipal_website",
    issuingAuthority: "City of Madison, Development Services Center",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: MADISON_LAST_VERIFIED,
    lastVerifiedAt: MADISON_LAST_VERIFIED,
    notes:
      "Read 2026-09-25. The chart is what establishes that electrical and plumbing are their own permits in Madison — \"Electrical Work, All — Yes\" and \"Plumbing - Yes\", both routed to Building Inspection at 608-266-4551 ext 2 — and it separates the City's permits from the ones it hands to Fire, Engineering, Traffic Engineering, the Water Utility or the State of Wisconsin Department of Commerce.",
  },
  {
    key: MADISON_ONLINE_PERMITS_SOURCE_KEY,
    jurisdictionKey: MADISON_KEYS.jurisdiction,
    title: "Online permits — City of Madison",
    url: "https://www.cityofmadison.com/development-services-center/1-2-family-residential/online-permits",
    sourceType: "municipal_website",
    issuingAuthority: "City of Madison, Development Services Center",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: MADISON_LAST_VERIFIED,
    lastVerifiedAt: MADISON_LAST_VERIFIED,
    notes:
      "Read 2026-09-25. Corroborates all three mechanisms in the division's own words: fees for building repair and replace are calculated \"by the cost of construction\" and the filer is told to \"exclude plumbing, heating, electrical, as well as cabinetry, paint, countertops, flooring, and trim\"; electrical fees are calculated \"by the number of openings (outlets, switches, and fixtures) and/or the number of new or replaced service entrances\"; plumbing fees are calculated \"by the number of new or replaced fixtures\"; and new buildings, additions and first-time buildouts of shell spaces are calculated \"by square footage of the space\" and must be entered by permit counter staff because they cannot be filed online.",
  },
  {
    key: MADISON_ONE_TWO_FAMILY_SOURCE_KEY,
    jurisdictionKey: MADISON_KEYS.jurisdiction,
    title: "1 & 2 Family Residential — City of Madison",
    url: "https://www.cityofmadison.com/development-services-center/1-2-family-residential",
    sourceType: "municipal_website",
    issuingAuthority: "City of Madison, Development Services Center",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: MADISON_LAST_VERIFIED,
    lastVerifiedAt: MADISON_LAST_VERIFIED,
    notes:
      "Read 2026-09-25. Defines the line the plan review table draws: \"If a dwelling unit is in a building with more than two units, it is not a 1 & 2 family dwelling. Any building with three or more attached units follows the commercial building code.\" It also says who may apply — owner occupants of a one- or two-family home may take building permits for alterations, additions and new houses, while mechanical permits need a licensed professional — and footnotes Wis. Stat. s. 101.654(1)(b), which exempts an owner who resides or will reside in the dwelling from the dwelling contractor financial responsibility certification.",
  },
  {
    key: MADISON_CONTACT_SOURCE_KEY,
    jurisdictionKey: MADISON_KEYS.jurisdiction,
    title: "Contact — Building Inspection, City of Madison",
    url: "https://www.cityofmadison.com/dpced/building-inspection/contact",
    sourceType: "municipal_website",
    issuingAuthority: "City of Madison, Building Inspection Division",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: MADISON_LAST_VERIFIED,
    lastVerifiedAt: MADISON_LAST_VERIFIED,
    notes:
      "Read 2026-09-25. Phone 608-266-4551, fax 608-266-6377, binspection@cityofmadison.com, 215 Martin Luther King Jr. Blvd. Suite 017, Madison, WI 53703, hours Monday to Friday 7:30 a.m. to 4:30 p.m., by appointment only, mailing address P.O. Box 2984.",
  },
];

/** Empty on purpose: the permit types Madison uses already exist as shared rows. */
const permitTypes: JurisdictionSeed["permitTypes"] = [];
const projectTypes: JurisdictionSeed["projectTypes"] = [];

const jurisdictionPermitTypes: SeedJurisdictionPermitType[] = [
  {
    jurisdictionKey: MADISON_KEYS.jurisdiction,
    permitTypeKey: "building",
    isAvailable: true,
    localName: "Building permit",
    officialUrl:
      "https://www.cityofmadison.com/development-services-center/fees/building-inspection-fees",
    notes:
      "Priced from the building's square footage in one of three use groups for new construction and additions — $.10, $.18 or $.12 per sq. ft. with a $25.00 minimum — and, for alterations and repairs to existing structures, from $11.00 for each $1,000 of value or fraction of it. Plan review is a separate table and the MGO 28.206 zoning review fee is collected when the permit is issued.",
  },
  {
    jurisdictionKey: MADISON_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    isAvailable: true,
    localName: "Electric permit",
    officialUrl:
      "https://www.cityofmadison.com/development-services-center/fees/building-inspection-fees",
    notes:
      "Its own permit under MGO Ch. 19, priced from the same square footage and the same three groups at $.09, $.11 or $.06 per sq. ft. on new work, and by the count of openings — switches, convenience outlets, fixtures and fixed appliance connections — on existing structures: $25.00 for the first ten and $1.00 each one after. An electric service replacement is $50.00 a panel.",
  },
  {
    jurisdictionKey: MADISON_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    isAvailable: true,
    localName: "Plumbing permit",
    officialUrl:
      "https://www.cityofmadison.com/development-services-center/fees/building-inspection-fees",
    notes:
      "Its own permit under MGO Ch. 18, priced from the same square footage at $.09, $.10 or $.06 per sq. ft. on new work, and at $8.00 per fixture with a $25.00 minimum on alterations and repairs — where a fixture is the chapter's own count, folding in water heaters, softeners, capped future openings and every altered drain run.",
  },
  {
    jurisdictionKey: MADISON_KEYS.jurisdiction,
    permitTypeKey: "mechanical",
    isAvailable: true,
    localName: "HVAC permit",
    officialUrl: "https://www.cityofmadison.com/development-services-center/permits",
    notes:
      "Required for heating, cooling and ventilation work and issued by the same division. The City's fee page publishes its column — $.09, $.11 or $.06 per sq. ft. on new work, plus replacement heating equipment at $25.00 up to 100,000 BTU, $50.00 to 165,000 BTU and $75.00 above that, an air-conditioning unit at $25.00 and a ductless split or wall pack at $25.00 — and this site's third page is plumbing, so those rows are documented here and in the profile rather than modelled.",
  },
];

const feeSchedules: SeedFeeSchedule[] = [
  {
    key: MADISON_KEYS.feeSchedule,
    jurisdictionKey: MADISON_KEYS.jurisdiction,
    sourceKey: MADISON_FEES_PAGE_SOURCE_KEY,
    title: "City of Madison Building Inspection fee schedule (MGO 29.09, 18.09 and 19.11)",
    officialUrl:
      "https://www.cityofmadison.com/development-services-center/fees/building-inspection-fees",
    effectiveFrom: MADISON_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: MADISON_LAST_VERIFIED,
    notes:
      "Three enacted schedules that the division publishes as one table: MGO 29.09 for the building permit, MGO 18.09 for plumbing and MGO 19.11 for electric, all created together by ORD-21-00024/25/26 and all effective 2021-03-27. They share the same three use groups, the same $25.00 minimum, the same 50% shell and interior reduction and the same Group IV definition, and they differ only in their rates and in the row each trade charges for existing work.",
  },
];

function attach(permitTypeKey: string, rules: SeedFeeRule["rule"][]): SeedFeeRule[] {
  return rules.map((rule) => ({
    jurisdictionKey: MADISON_KEYS.jurisdiction,
    permitTypeKey,
    scheduleKey: MADISON_KEYS.feeSchedule,
    rule,
  }));
}

const feeRules: SeedFeeRule[] = [
  ...attach("building", MADISON_BUILDING_BASE_RULES),
  ...attach("electrical", MADISON_ELECTRICAL_BASE_RULES),
  ...attach("plumbing", MADISON_PLUMBING_BASE_RULES),
];

const requirements: SeedRequirement[] = [
  {
    jurisdictionKey: MADISON_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "document",
    title: "Plans, specifications and a lot plan, filed in duplicate",
    description:
      "MGO 29.07(3): \"Plans and specifications and a lot plan showing the location of the proposed building thereon and of every existing building thereon, shall accompany every application for a permit, and shall be filed in duplicate with the Director of the Building Inspection Division\" — though the Director may authorise a permit without plans \"for small or unimportant work\". Plans must be drawn to scale on substantial paper or prepared cloth, at not less than one-eighth of an inch to a foot, clear enough to show that the code will be complied with, and must bear the name of the architect, engineer or other person who prepared them. MGO 29.07(4) then lists what the plans must show: street, alley and lot-line locations, the owner's name, the intended use of every room, the floor area of every room, window sizes against the eight percent floor-area requirement, and any computations or stress diagrams the Director asks for.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: MADISON_MGO_29_09_SOURCE_KEY,
    lastVerifiedAt: MADISON_LAST_VERIFIED,
  },
  {
    jurisdictionKey: MADISON_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "document",
    title: "Every subcontractor who will need a supplemental permit, named at the first application",
    description:
      "MGO 29.07(5): at the initial application the applicant must \"provide the names and addresses of all subcontractors who will require supplemental permits over the course of the project\", and the Director mails each subcontractor a supplemental permit which must be returned completed within seven days of its postmark. Failing to return it before work starts is treated as working without a permit, which MGO 29.09(3) prices at double the fees plus $100.00 a day.",
    isMandatory: true,
    sortOrder: 20,
    sourceKey: MADISON_MGO_29_09_SOURCE_KEY,
    lastVerifiedAt: MADISON_LAST_VERIFIED,
  },
  {
    jurisdictionKey: MADISON_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "license",
    title: "Owner occupants may take building permits; mechanical work needs a licensed professional",
    description:
      "The City's 1 & 2 Family Residential page: owner occupants working on an alteration or addition in a single-family home can get building and mechanical permits, an owner occupant building a new house can get a building permit, but \"Only licensed professionals can apply for mechanical permits\". An owner non-occupant of a one- or two-family rental needs licences to get a permit, and licensed professionals must apply for both building and mechanical permits on it. The page footnotes Wis. Stat. s. 101.654(1)(b), which exempts an owner who resides or will reside in the dwelling from the dwelling contractor financial responsibility certification, and warns under s. 101.65(1r) that an owner who hires someone not insured as s. 101.654(2)(a) requires is responsible for the work and any injury or damage.",
    isMandatory: true,
    sortOrder: 30,
    sourceKey: MADISON_ONE_TWO_FAMILY_SOURCE_KEY,
    lastVerifiedAt: MADISON_LAST_VERIFIED,
  },
  {
    jurisdictionKey: MADISON_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "license",
    title: "A State electrical licence on the application, signed by the licence holder",
    description:
      "MGO 19.08: \"No person may work as an electrician or as an electrical contractor unless the person is licensed by or registered with the State of Wisconsin\", and no person may install, repair or maintain electrical wiring unless licensed as an electrician or registered as a beginning electrician, with a master electrician responsible for the work at all times. MGO 19.09(1) then requires the permit to be obtained \"by a person properly licensed for the category of work\", proof that the applicant \"has been employed to perform the work\", fees \"paid in full at the time of submitting the permit application\", and that \"All applications for permits shall be signed by the license holder.\" MGO 19.08(4)(a) exempts a residential property owner installing, repairing or maintaining wiring on premises they own and occupy as a single-family residence — and says the Division may issue such a permit only if the owner shows they are competent to do the work, and that they pay \"the same fee as required of electrical contractors under Section 19.11\".",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: MADISON_MGO_19_11_SOURCE_KEY,
    lastVerifiedAt: MADISON_LAST_VERIFIED,
  },
  {
    jurisdictionKey: MADISON_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "inspection",
    title: "Minor repair work is the only wiring that needs no permit",
    description:
      "MGO 19.09(2): \"Minor repair work shall be construed to mean the replacement of broken or defective sockets, snap, push or toggle switches, convenience outlets, lighting fixtures and portable electric appliances.\" Everything else needs the permit first, and MGO 19.10 forbids connecting the wiring to a supply — or turning the current on — until an Electrical Inspector has issued a certificate of service inspection, which the utility must see before supplying service. In an emergency MGO 19.09(4) lets the work start without a permit number provided one is obtained the next business day and the application and fees follow within ten days.",
    isMandatory: true,
    sortOrder: 20,
    sourceKey: MADISON_MGO_19_11_SOURCE_KEY,
    lastVerifiedAt: MADISON_LAST_VERIFIED,
  },
  {
    jurisdictionKey: MADISON_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    requirementType: "license",
    title: "A State plumbing licence, or the owner of an occupied single-family home",
    description:
      "MGO 18.06(1): \"It shall be unlawful for any person, firm or corporation to perform any plumbing in the City of Madison without holding a qualified license with the State of Wisconsin, except that repairs and stoppages as defined do not require license status.\" MGO 18.06(3) adds that an application \"will not be approved unless such individual is qualified as required by State law, except that an application may be approved for plumbing work to be done by the owner in a single-family residence which is occupied by the owner\", and the section points at Wis. Stat. ch. 145 for the definitions of master plumber, journeyman, restricted plumber licensee, apprentice and registered learner.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: MADISON_MGO_18_09_SOURCE_KEY,
    lastVerifiedAt: MADISON_LAST_VERIFIED,
  },
  {
    jurisdictionKey: MADISON_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    requirementType: "document",
    title: "The application, signed and filed within three working days of starting work",
    description:
      "MGO 18.08: the application is on forms furnished by the Division, \"properly filled out\" and \"signed by a person qualified as a licensed plumber registered with the Wisconsin Department of Safety and Professional Services\", and it is filed \"as soon as possible after work has started, but no later than three (3) working days from the commencement of work\". It must carry the business name and address, the plumber's licence number and a telephone number. MGO 18.08 also exempts minor repairs to part of an existing plumbing system from the application, and MGO 18.07(3)(b) sets the plan examination fee by SPS 302.64, Table 302.64-1 wherever plans are required.",
    isMandatory: true,
    sortOrder: 20,
    sourceKey: MADISON_MGO_18_09_SOURCE_KEY,
    lastVerifiedAt: MADISON_LAST_VERIFIED,
  },
];

const profile: SeedProfile = {
  jurisdictionKey: MADISON_KEYS.jurisdiction,
  headline: "What construction permits cost in Madison",
  summary:
    "Madison prices a new building three times over — once for the building permit, once for the electrical permit and once for the plumbing permit — and all three are the building's square footage multiplied by a use-group rate: $.10, $.09 and $.09 a square foot for a house, $.18, $.11 and $.10 for an office block, $.12, $.06 and $.06 for a warehouse, each floored at $25.00. Work on an existing structure leaves the groups behind and is priced by what it is: $11.00 for each $1,000 of value, $25.00 for the first ten electrical openings and $1.00 each one after, $8.00 a plumbing fixture. Plan review and the zoning review fee are charged on top, from tables of their own.",
  localContext:
    "Madison does not have one fee schedule. It has three, one in each of the codes the City enforces: **MGO 29.09** for the building permit, **MGO 18.09** for plumbing and **MGO 19.11** for electric. All three chapters were repealed and recreated together by one set of ordinances in March 2021 — ORD-21-00024, ORD-21-00025 and ORD-21-00026, all effective 2021-03-27 — and they were written to match: identical use groups, an identical $25.00 minimum, the identical 50% shell reduction and the identical Group IV definition. The Building Inspection Division then publishes all three as a single table with four columns and a Total, which is why Madison looks like one schedule from the outside and is not one on the inside.\n\nThe group is a use group, not a building type, and it is the fact the whole schedule turns on. **Group I** is new construction and additions to all single or two family residential buildings and to all commercial space classified R-2, R-3 or R-4. **Group II** is A-1 through A-5, B, E, H-1 through H-5, I-1 through I-4, M and R-1 — the City's own examples are arenas, banks, churches, clinics, gyms, hotels, libraries, offices, retail and theatres. **Group III** is F-1, F-2, S-1, S-2, U and anything not in Groups I, II or IV. A hotel is Group II, an apartment building is Group I, a warehouse is Group III, and because that crossing does not follow from any occupancy label, this site asks for the group rather than guessing it.\n\n**Group IV** is where work on an existing structure goes, and there the schedule stops measuring area and starts counting what you did: $11.00 for each $1,000 of value or fraction of it on the building side, $25.00 for the first ten electrical openings plus $1.00 each one after, and $8.00 a plumbing fixture. The City's own online-permits page says the same thing in plain words — electrical fees are calculated \"by the number of openings\", plumbing \"by the number of new or replaced fixtures\", and new buildings, additions and first-time shell buildouts \"by square footage of the space\".\n\nOn top of the permit sits plan review, from a different table in the same section: $100.00 for a new one- or two-family building, $25.00 to alter or remodel one, and $.04 per square foot with a $100.00 minimum for everything else — which is the row an apartment building takes. Then the zoning review fee, $0.03 a square foot with a $25.00 minimum under MGO 28.206, collected when the building permit is issued. And then the State, which is the part this site names rather than charges: the division also collects the DSPS State Seal fee and the plan review fee set by SPS 302.31(1)(g), Table 302.31-3, and sends plumbing plan examination to SPS 302.64, Table 302.64-1. Wisconsin's code server answered no request from this environment on 2026-09-25, so no figure from those tables appears in any total here.",
  valuationBasis:
    "Madison has **two** bases and the schedule says which one a job is on.\n\nNew construction and additions are measured in **square footage**, and both the ordinance and the City define the area. MGO 29.09(2)(b): \"For the purpose of determining the fee on the basis of square foot, floor area measurements shall be taken from outside of building at each floor level, including basement.\" The fee page puts it as \"the total square footage of the building including all floor levels, attached garages, porches, balconies and decks\". One number feeds all three permits, so a reader who knows their floor area can price the building, electrical and plumbing permits without a valuation at all.\n\nAlterations and repairs to existing structures are measured in **valuation**, and MGO 29.09(2)(c) defines what that means: \"the actual cost for alterations and repairs to existing buildings, including all labor and material less the cost of real estate and installation of electrical, heating, and plumbing equipment and services\". It is a construction cost with the land and the installed equipment taken out, not a contract sum. The fee is $11.00 for each $1,000 of it \"or fraction thereof\", so $12,400 is thirteen increments rather than twelve and a half.\n\nTwo things about the measurement are worth knowing before comparing. The same subsection caps the result — \"In no case shall the fee exceed those as calculated for new buildings ... Groups I, II and III\" — and that cap compares the alteration fee against a fee this calculation has not run, so it is not modelled and a very large alteration is overstated here. And every Madison table says \"Round up all fees to the next highest dollar\", which this engine does not do: each component is rounded once, to the cent, and the difference is always under a dollar. Plan review measures a third area for commercial alterations — \"floor, roof and exterior wall area being altered or remodeled\" — and because the schedule publishes no second measurement for a reader to give, it is read from the same square footage.",
  notIncluded:
    "These figures are Madison's building, electrical and plumbing permit fees as enacted in MGO 29.09, 18.09 and 19.11, with the plan review and zoning review fees that ride alongside them. They are not a total project cost, and they exclude:\n\n- **The State's money.** The division collects a **State Seal fee as charged by DSPS** and **plan review fees as prescribed by SPS 302.31(1)(g) in Table 302.31-3** with every plan review, and plumbing plan examination is set by **SPS 302.64, Table 302.64-1**. `docs.legis.wisconsin.gov` returned no response from this environment on 2026-09-25, so no figure from those tables is transcribed anywhere on this site — they are named, not estimated. The City's fee page prints the first citation corrupted, as \"SPS 3031(1)(g) in Table 3031-3\"; the ordinance prints it correctly.\n- **The mechanical column.** The HVAC permit on new work ($.09 / $.11 / $.06 a square foot) and the existing-building rows — replacement heating equipment at $25.00 up to 100,000 BTU, $50.00 from 100,001 to 165,000 and $75.00 above, an air-conditioning unit at $25.00, a ductless split or wall pack at $25.00 — are published and not modelled, because this site's third Madison page is plumbing.\n- **The alteration cap.** MGO 29.09(2)(c) holds an alteration fee to what the same building would pay as new construction. That cap is a function of a fee this calculation has not run, so a large alteration is overstated here by up to the difference.\n- **The round-up to the whole dollar.** Every Madison table rounds up; this site rounds to the cent.\n- **The rest of Group IV**: accessory buildings and detached garages at $.06 a square foot (minimum $25.00), awnings $20.00, tents $50.00, in-ground pools $25.00, moving a structure at $0.125 a cubic foot between $250.00 and $450.00, razing an accessory building $20.00, a one-family dwelling $150.00, a two-family dwelling $250.00 and a commercial building by volume, solar panels $21.00, certificates of occupancy at $10.00 and $150.00 ($75.00 for a change of use), mobile-home occupancy $15.00, and the erosion control fee at $0.01 a square foot of lot area.\n- **The plan review rows this site does not price**: structural review at $50.00 an element, fire escapes at $100.00, stadium seating at $0.05 a seat, the $100.00 miscellaneous and $100.00 revision rows, HVAC plan review at $.03 a square foot, Priority Review at double the plan review fee, and the Early Start permit at $50.00 plus $0.01 a square foot.\n- **The penalty for work without a permit** — double the fees, plus $100.00 a day from the stop-work notice until a permit is obtained — and the extension fee of half the original inspection fee.\n- **Everything another authority charges**: DSPS licence and examination fees, the State's own plan review for the work it retains, water and sewer connection charges from the Water Utility, excavation and street permits from Engineering, and the Fire Department's permits, all of which the City's own permit chart routes to a different phone number.",
  seoTitle: "Madison WI construction permit fees",
  seoDescription:
    "How Madison, Wisconsin prices building, electrical and plumbing permits — $.10 a square foot for a house across all three, $11.00 per $1,000 of alteration value, $8.00 a plumbing fixture, cited to MGO 29.09, 18.09 and 19.11.",
  publishStatus: "published",
  noindex: false,
  lastReviewedAt: MADISON_LAST_VERIFIED,
};

const permitPages: SeedPermitPage[] = [
  {
    jurisdictionKey: MADISON_KEYS.jurisdiction,
    permitTypeKey: "building",
    slug: "building-permit-cost",
    title: "Madison building permit cost",
    intro:
      "A Madison building permit is priced from the building's square footage in one of three use groups: $.10 a square foot for Group I, which is new one- and two-family housing and R-2, R-3 or R-4 space; $.18 for Group II, the A, B, E, H, I, M and R-1 occupancies; and $.12 for Group III, factories, warehouses and everything the schedule does not classify — each subject to a $25.00 minimum. Work on an existing structure leaves the groups behind and pays $11.00 for each $1,000 of value or fraction of it, again with a $25.00 minimum. Plan review is a separate charge from its own table in MGO 29.09(3)(b), and the zoning review fee of $0.03 a square foot is collected when the permit is issued.",
    localSummary:
      "Three groups, three rates, one measurement — and the number that decides which is a use group rather than a building type. A new 2,400 square foot house is Group I and a $240.00 permit fee; the same house built as a 12-unit apartment building is still Group I, because Group I folds in R-2, R-3 and R-4 space; a clinic, hotel or office block of any size is Group II at $.18, and a self-storage building is Group III at $.12. Getting the group wrong moves the fee by half.\n\nTwo charges sit outside that table. Plan review is flat for one- and two-family work — $100.00 for a new house, $25.00 to alter one — and $.04 a square foot with a $100.00 minimum for everything else, so a first-time tenant fit-out of 3,000 square feet pays $120.00 to have its plans read. The zoning review fee is $.03 a square foot with a $25.00 minimum under MGO 28.206, collected at issuance rather than at review.\n\nAnd the schedule is kinder to shell buildings than it looks: a permit for a property where only the shell is completed, or for the first interior fit-out in a shell already permitted, is charged at 50% of the group fee.",
    notIncluded:
      "This is MGO 29.09's inspection fee, the plan review rows, the MGO 28.206 zoning review fee and the $25.00 minimum. It excludes:\n\n- **The State's money.** The DSPS State Seal fee and the plan review fee set by SPS 302.31(1)(g), Table 302.31-3 are collected with every plan review and are not in any figure here — Wisconsin's code server answered no request from this environment on 2026-09-25, so no amount from those tables is published rather than guessed.\n- **The alteration cap.** MGO 29.09(2)(c) holds an alteration fee to what the same building would pay as new construction; that comparison is not modelled, so a large alteration is overstated here.\n- **The round-up.** Madison rounds every fee up to the next highest dollar; this site rounds to the cent, so a figure can be up to $0.99 below what the counter charges.\n- **The mechanical and HVAC plan review rows**, priced at $.03 a square foot with a $100.00 minimum, and the rest of the plan review table: structural review at $50.00 an element, fire escapes at $100.00, stadium seating at $0.05 a seat, the $100.00 miscellaneous and revision rows, Priority Review at double, and Early Start at $50.00 plus $0.01 a square foot.\n- **The rest of Group IV** on the same schedule: accessory buildings at $.06 a square foot, awnings $20.00, tents $50.00, pools $25.00, moving a structure between $250.00 and $450.00, the four razing rows, solar panels $21.00, certificates of occupancy, mobile homes and the erosion control fee.\n- **The penalty for unpermitted work** — double the fee plus $100.00 a day — and the electrical, plumbing and mechanical permits, which are separate applications under separate chapters of the same code.",
    workedExample: {
      scenario:
        "A new single family house of 2,400 square feet, built by a contractor on a lot the owner already owns.",
      inputs: {
        squareFootage: 2400,
        occupancy: "residential",
        workType: "new_construction",
        custom: { fee_group: 1, single_or_two_family: true },
      },
      notes:
        "The building fee is Group I at $.10 a square foot: 2,400 × $0.10 = $240.00, comfortably above the $25.00 minimum. Plan review is the flat row for a new single family or two family building, $100.00, rather than the $.04 a square foot a commercial building of the same size would pay — $96.00, so the flat row is the larger of the two here, which is exactly why the schedule states it as a flat fee. The zoning review fee is 2,400 × $0.03 = $72.00, collected when the permit is issued.\n\nTwo things to carry away. The same 2,400 square feet buys the electrical and plumbing permits too — at Group I they are $.09 a square foot each, $216.00 apiece — so the three permits together are most of what this project pays the City before plan review. And the group is doing the work: build the same footprint as a two-storey four-unit building and it is still Group I, but as a small office it becomes Group II, where $.18 a square foot is $432.00 on its own.",
    },
    faqs: [
      {
        question: "How much is a building permit for a new house in Madison?",
        answer:
          "Ten cents a square foot. MGO 29.09(3)(a) puts new one- and two-family residential buildings — and commercial space classed R-2, R-3 or R-4 — in Group I at $.10 per sq. ft. with a $25.00 minimum, so a 2,400 square foot house is a $240.00 permit fee before plan review and the zoning review fee.",
        sourceId: MADISON_MGO_29_09_SOURCE_KEY,
        attribution: "MGO 29.09(3)(a), enacted by ORD-21-00024, effective 2021-03-27.",
      },
      {
        question: "What are Madison's three permit fee groups?",
        answer:
          "Group I is new construction and additions to all single or two family residential buildings and to all commercial space classified R-2, R-3 or R-4. Group II is A-1 to A-5, B, E, H-1 to H-5, I-1 to I-4, M and R-1 — offices, hotels, clinics, banks, schools, retail. Group III is F-1, F-2, S-1, S-2, U and anything not classified elsewhere. The same three groups decide the building, electrical and plumbing rates.",
        sourceId: MADISON_MGO_29_09_SOURCE_KEY,
        attribution: "Group definitions as printed in MGO 29.09(3)(a), 18.09 and 19.11.",
      },
      {
        question: "How much is a permit to alter an existing building?",
        answer:
          "$11.00 for each $1,000 of value or fraction of it, with a $25.00 minimum. MGO 29.09(2)(c) says the value is the actual cost of the alterations and repairs including all labor and material, less the cost of real estate and less the installation of electrical, heating and plumbing equipment and services.",
        sourceId: MADISON_MGO_29_09_SOURCE_KEY,
        attribution: "MGO 29.09(3)(a) Group IV with MGO 29.09(2)(c).",
      },
      {
        question: "Does Madison cap what an alteration permit can cost?",
        answer:
          "Yes, in the ordinance — and no, not on this site. MGO 29.09(2)(c) says the alteration fee shall never exceed what the same building would pay as new construction under Groups I, II and III. That cap compares this fee against a fee this calculation has not run, so it is not modelled and a very large alteration is shown as higher than the City would charge.",
        sourceId: MADISON_MGO_29_09_SOURCE_KEY,
        attribution: "MGO 29.09(2)(c); the modelling gap is stated on this page and in the research record.",
      },
      {
        question: "How much is plan review in Madison?",
        answer:
          "$100.00 for a new single family or two family building, $25.00 to alter or remodel one, and $.04 per sq. ft. with a $100.00 minimum for commercial buildings new or altered — a figure the City rounds up to the next dollar. The division also collects the State's DSPS State Seal fee and the plan review fee set by SPS 302.31(1)(g), Table 302.31-3, neither of which is in any total here.",
        sourceId: MADISON_MGO_29_09_SOURCE_KEY,
        attribution: "MGO 29.09(3)(b); the State charges are named as the section names them.",
      },
      {
        question: "What happens if work starts before the permit is issued?",
        answer:
          "The fee is doubled, and $100.00 a day is assessed from the day a stop-work notification is delivered until a permit is obtained. MGO 29.09(3) prints that penalty at the head of the fee schedule, and MGO 18.09 and 19.11 print the identical sentence.",
        sourceId: MADISON_MGO_29_09_SOURCE_KEY,
        attribution: "MGO 29.09(3).",
      },
    ],
    seoTitle: "Madison WI building permit cost: $0.10 a sq ft",
    seoDescription:
      "Madison, Wisconsin building permit fees — $.10, $.18 or $.12 per square foot by use group, $11.00 per $1,000 of alteration value, $100 plan review and a $0.03 per sq ft zoning fee, cited to MGO 29.09.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: MADISON_LAST_VERIFIED,
  },
  {
    jurisdictionKey: MADISON_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    slug: "electrical-permit-cost",
    title: "Madison electrical permit cost",
    intro:
      "Madison's electric permit is an area fee on new work and a count of openings on existing work. A new building or addition pays $.09 a square foot in Group I, $.11 in Group II and $.06 in Group III, each with a $25.00 minimum — the same square footage and the same groups as the building permit. Alterations and repairs to existing structures instead pay $25.00 for the first ten openings and $1.00 for each one after, where an opening is the ordinance's own list: switches, convenience outlets, fixtures and fixed appliance connections. Replacing or relocating the electric service on the same premises is $50.00 per service panel.",
    localSummary:
      "The openings block is the row people get wrong. It is not ten dollars each: the first ten openings are a single $25.00 block, and only the eleventh costs anything. Five outlets in a kitchen remodel is $25.00; fifteen is $30.00; forty is $55.00. Madison counts switches, convenience outlets, fixtures and fixed appliance connections as openings, so a new bath with a vanity light, an exhaust fan, a GFCI and two switches is five of them.\n\nOn new construction the count disappears entirely. The electrical permit is $.09 a square foot for a house, $.11 for an office block, $.06 for a warehouse — a 2,400 square foot house is $216.00 of electrical permit however many outlets it has — and the City's own online-permits page says plainly that new buildings, additions and first-time shell buildouts are calculated \"by square footage of the space\" and cannot be filed online at all.\n\nTwo rules around the edges are worth knowing. MGO 19.09(2) defines minor repair work — replacing broken or defective sockets, snap, push or toggle switches, convenience outlets, lighting fixtures and portable electric appliances — as the one thing that needs no permit; and a residential property owner doing their own wiring on a single-family home they own and occupy is exempt from the licence requirement, but pays \"the same fee as required of electrical contractors\".",
    notIncluded:
      "This is MGO 19.11's fee schedule — the three group rates, the Group IV opening ladder, the service-panel row and the $25.00 minimum. It excludes:\n\n- **The State's money.** DSPS licence and examination fees are not permit fees and are not here; so is the State's plan review, which is collected only where plans are required.\n- **The mechanical column** on the same table — an HVAC permit on new work is $.09, $.11 or $.06 a square foot — and the heating and air-conditioning rows of the City's existing-building list: replacement heating equipment at $25.00 up to 100,000 BTU, $50.00 from 100,001 to 165,000 BTU and $75.00 above that, an air-conditioning unit at $25.00, a ductless split or wall pack at $25.00.\n- **The round-up.** Madison rounds every fee up to the next highest dollar; this site rounds to the cent.\n- **The 50% shell reduction on the electrical column is modelled** — set shell_only or interior_build_out — but the plan review that goes with such a permit is not, because that row belongs to the building page.\n- **Priority Review** at double the plan review fee, **Early Start** at $50.00 plus $0.01 a square foot, and the plan review table as a whole.\n- **The penalty for unpermitted work** — double the fee plus $100.00 a day — the **certificate of service inspection** MGO 19.10 requires before a utility will energise the work, and the **extension fee** of half the original inspection fee.",
    workedExample: {
      scenario:
        "An electrical remodel of an existing single family house: fourteen new or altered openings, and the service entrance relocated and replaced on the same premises.",
      inputs: {
        squareFootage: 1800,
        valuationCents: 8_000_00,
        workType: "alteration",
        custom: { openings: 14, panels: 1 },
      },
      notes:
        "Fourteen openings is the first ten as one $25.00 block plus four at $1.00, which is $29.00. The service replacement is priced by the panel count the calculation gives — one panel at $50.00 — and MGO 19.11 says a change of location is priced the same as a replacement. There is no $25.00 minimum to reach because the block already is $25.00, and no area fee, because the calculation states an alteration and no fee group.\n\nRead the same job as new construction and the mechanism changes completely: 1,800 square feet at Group I is $.09 a square foot, $162.00, whatever the electrician actually wires. That is the whole difference between Madison's two electrical rows — one prices the building, the other prices the work.",
    },
    faqs: [
      {
        question: "How much is an electrical permit for a new building in Madison?",
        answer:
          "Nine, eleven or six cents a square foot, by use group: $.09 in Group I, $.11 in Group II and $.06 in Group III, each with a $25.00 minimum. It is the same square footage and the same groups as the building permit, and the City's online-permits page confirms new buildings are calculated \"by square footage of the space\".",
        sourceId: MADISON_MGO_19_11_SOURCE_KEY,
        attribution: "MGO 19.11, enacted by ORD-21-00026, effective 2021-03-27.",
      },
      {
        question: "How much is an electrical permit for alterations?",
        answer:
          "$25.00 for the first ten openings and $1.00 for each additional one. The schedule defines openings as switches, convenience outlets, fixtures and fixed appliance connections, so the count is of devices and connection points rather than of rooms or circuits.",
        sourceId: MADISON_MGO_19_11_SOURCE_KEY,
        attribution: "MGO 19.11 Group IV, including the schedule's own definition of an opening.",
      },
      {
        question: "How much is it to replace an electric service panel?",
        answer:
          "$50.00 per service panel. The same section adds that the fees for a change of location or replacement of equipment on the same premises are the same as for a new installation, so relocating the service costs what replacing it costs.",
        sourceId: MADISON_MGO_19_11_SOURCE_KEY,
        attribution: "MGO 19.11, Electric Service Replacement.",
      },
      {
        question: "Who is allowed to pull an electrical permit in Madison?",
        answer:
          "Somebody licensed or registered with the State of Wisconsin. MGO 19.09 requires the permit of a person properly licensed for the category of work, proof that the applicant is employed to do it, fees paid in full at submission, and the licence holder's signature. A residential property owner wiring a single-family home they own and occupy is exempt from the licence rule under MGO 19.08(4)(a) — and pays the same fee as a contractor.",
        sourceId: MADISON_MGO_19_11_SOURCE_KEY,
        attribution: "MGO 19.08 and 19.09(1).",
      },
      {
        question: "Does replacing a light switch need a permit?",
        answer:
          "Not if it is the replacement of a broken or defective item. MGO 19.09(2) defines minor repair work as the replacement of broken or defective sockets, snap, push or toggle switches, convenience outlets, lighting fixtures and portable electric appliances. Anything beyond that needs the permit first.",
        sourceId: MADISON_MGO_19_11_SOURCE_KEY,
        attribution: "MGO 19.09(2).",
      },
    ],
    seoTitle: "Madison WI electrical permit cost",
    seoDescription:
      "Madison, Wisconsin electrical permit fees — $.09 per square foot on new work, $25.00 for the first ten openings and $1.00 each after on alterations, and $50.00 per service panel, cited to MGO 19.11.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: MADISON_LAST_VERIFIED,
  },
  {
    jurisdictionKey: MADISON_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    slug: "plumbing-permit-cost",
    title: "Madison plumbing permit cost",
    intro:
      "Madison's plumbing permit is priced from square footage on new construction and from the fixture count on everything else. A new building or addition pays $.09 a square foot in Group I, $.10 in Group II and $.06 in Group III, each with a $25.00 minimum. Alterations and repairs to existing structures pay $8.00 per fixture, again with a $25.00 minimum — and a fixture in Madison is a wider idea than a toilet: the chapter counts water heaters, water softeners, capped openings left for future fixtures and every altered drain run inside the count, so a like-for-like water heater replacement is a one-fixture permit.",
    localSummary:
      "The fixture count is where a small job and a large one part company, and where the City's own definition matters more than the rate. MGO 18.09's note says a two-bowl laundry tray, two-bowl kitchen sink, multi-bowl soda fountain or bar fixture counts as a single fixture, and then folds in \"each replacement or alteration to a fixture or appliances ... the replacement of water heaters, water softeners, each plugged or capped openings left for future installation of fixtures, each altered or repaired building sewer, building drain, soil, waste or vent pipes within an existing building\". Replacing a water heater and a dishwasher in the same week is two fixtures and $16.00; three fixtures is $24.00 of fee, which is below the $25.00 minimum, so the City charges $25.00; four is $32.00.\n\nNew construction has no fixture count at all. The plumbing permit is $.09 a square foot for a house — the same area, the same group and the same $25.00 minimum as the building and electrical permits — which is why the City's fee page can print a per-square-foot Total column across all four trades.\n\nOne number is genuinely in dispute, and this page states it rather than hiding it. MGO 18.09 enacts **$.10** per square foot for Group II, while the Building Inspection fee page currently prints **$.11** for that cell and builds its Total column from .11. This site charges the enacted figure.",
    notIncluded:
      "This is MGO 18.09's fee schedule — the three group rates, the Group IV fixture rate and the $25.00 minimum. It excludes:\n\n- **The State's money.** Plumbing plan examination is set by SPS 302.64, Table 302.64-1 wherever plans are required, and the DSPS State Seal fee is collected with plan review. Wisconsin's code server answered no request from this environment on 2026-09-25, so no figure from that table is published rather than guessed.\n- **The mechanical column**, whose new-work rates on the City's table are $.09, $.11 and $.06 a square foot and whose existing-work rows price replacement heating equipment by BTU and air-conditioning units at $25.00.\n- **The round-up.** Madison rounds every fee up to the next highest dollar; this site rounds to the cent.\n- **Gas piping**, which the City's permit chart routes through the HVAC permit rather than plumbing.\n- **Water and sewer connection charges** from the Water Utility, excavation and street permits from Engineering, and any fee another authority charges — none of these is a plumbing permit fee under MGO 18.09.\n- **The penalty for unpermitted work** — double the fee plus $100.00 a day — and the extension fee of half the original inspection fee.",
    workedExample: {
      scenario:
        "An alteration to an existing single family house that replaces six plumbing fixtures — two toilets, two lavatories, a kitchen sink and a dishwasher connection.",
      inputs: { valuationCents: 6_000_00, workType: "alteration", fixtures: 6 },
      notes:
        "Six fixtures at $8.00 is $48.00, above the $25.00 minimum, so the minimum contributes nothing. The $6,000 of fixture and labor cost in the inputs is deliberate and does not enter the calculation: Madison does not price a plumbing alteration by value — that is the building permit's row at $11.00 for each $1,000.\n\nTwo neighbouring cases show what the floor does. Three fixtures is $24.00 of fee and pays $25.00 instead, because the minimum is stated on the same line as the rate. And the same job as new construction is not a fixture count at all: 1,800 square feet in Group I is $.09 a square foot, $162.00, however many fixtures the house ends up with.",
    },
    faqs: [
      {
        question: "How much is a plumbing permit for a new building in Madison?",
        answer:
          "Nine, ten or six cents a square foot, by use group: $.09 in Group I, $.10 in Group II and $.06 in Group III, each with a $25.00 minimum. It is the same square footage and the same three groups as the building and electrical permits, and it is charged once for the building rather than once for the fixtures.",
        sourceId: MADISON_MGO_18_09_SOURCE_KEY,
        attribution: "MGO 18.09, enacted by ORD-21-00025, effective 2021-03-27.",
      },
      {
        question: "How much is a plumbing permit for an alteration?",
        answer:
          "$8.00 per fixture with a $25.00 minimum, for all alterations and repairs to existing structures. The count is the chapter's own: a combined multi-bowl sink is one fixture, and so is each replacement of a water heater, water softener or appliance, each capped opening left for a future fixture, and each altered building sewer, drain, soil, waste or vent run.",
        sourceId: MADISON_MGO_18_09_SOURCE_KEY,
        attribution: "MGO 18.09 Group IV and the note printed beneath it.",
      },
      {
        question: "Does Madison price new construction plumbing by the fixture?",
        answer:
          "No. On a new building or an addition the plumbing permit is a rate on square footage — $.09, $.10 or $.06 by group — and the fixture ladder is Group IV's row for alterations and repairs to existing structures. The City's own online-permits page puts the same division in its own words: plumbing fees for repair and replace are calculated \"by the number of new or replaced fixtures\".",
        sourceId: MADISON_MGO_18_09_SOURCE_KEY,
        attribution: "MGO 18.09; corroborated by the City's Online permits page read 2026-09-25.",
      },
      {
        question: "Why does the City's fee page show a different Group II rate?",
        answer:
          "Because the two City sources disagree. MGO 18.09 as enacted prints $.10 per sq. ft. for Group II, while the Building Inspection fee page prints $.11 for that cell and builds its Total column from .11. Every other cell of that table matches its ordinance exactly, including electrical Group II at .11 next door, and no amending file for §18.09 was reachable — so this site charges the enacted $.10 and prints the page's $.11 beside it. The division at 608-266-4551 can settle which it charges.",
        sourceId: MADISON_MGO_18_09_SOURCE_KEY,
        attribution:
          "Both figures read on 2026-09-25: the ordinance PDF and the City's fee page. Recorded as an open question in research/wisconsin/madison.md.",
      },
      {
        question: "Who can pull a plumbing permit in Madison?",
        answer:
          "A plumber licensed with the State of Wisconsin, or the owner of an occupied single-family home. MGO 18.06(1) makes it unlawful to do plumbing without a State licence — repairs and stoppages excepted — and MGO 18.06(3) allows an application \"for plumbing work to be done by the owner in a single-family residence which is occupied by the owner\". MGO 18.08 requires the application to be signed by a licensed plumber registered with DSPS and filed within three working days of starting work.",
        sourceId: MADISON_MGO_18_09_SOURCE_KEY,
        attribution: "MGO 18.06 and 18.08.",
      },
    ],
    seoTitle: "Madison WI plumbing permit cost",
    seoDescription:
      "Madison, Wisconsin plumbing permit fees — $.09 per square foot on new construction and $8.00 per fixture with a $25.00 minimum on alterations, cited to MGO 18.09.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: MADISON_LAST_VERIFIED,
  },
];

const verifications: SeedVerification[] = [
  {
    entityType: "source",
    entityKey: MADISON_FEES_PAGE_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: MADISON_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MADISON_FEES_PAGE_SOURCE_KEY,
    notes:
      "Read 2026-09-25 and compared cell by cell against the three ordinance PDFs, then checked against the Internet Archive's 2022-01-23 snapshot to establish which of its differences from the ordinances are edits rather than errors. One cell disagrees with its ordinance (Group II plumbing) and one citation is corrupted (SPS 302.31); both are recorded rather than reconciled.",
  },
  {
    entityType: "source",
    entityKey: MADISON_MGO_29_09_SOURCE_KEY,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: MADISON_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MADISON_MGO_29_09_SOURCE_KEY,
    notes:
      "Read 2026-09-25 in pdftotext -layout and plain modes; the layout mode is the one quoted, because the plain mode mispairs labels and amounts in the two- and three-column fee tables. Cover sheet, fiscal note, drafter's analysis and §29.09 transcribed: the three group rates, the Group IV list, the 50% shell note, §29.09(2)(b), §29.09(2)(c) and its cap, the penalty, and the whole plan review table.",
  },
  {
    entityType: "source",
    entityKey: MADISON_MGO_18_09_SOURCE_KEY,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: MADISON_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MADISON_MGO_18_09_SOURCE_KEY,
    notes:
      "Read 2026-09-25 in both modes. §18.09 transcribed in full: Group I $.09, Group II $.10, Group III $.06, Group IV $8.00 per fixture with the $25.00 minimum and the fixture-counting note, the 50% shell reduction and the penalty. §18.06, §18.07(1)(d), §18.07(3)(b) and §18.08 read for requirements. Group II at $.10 is the figure this site charges against the fee page's $.11.",
  },
  {
    entityType: "source",
    entityKey: MADISON_MGO_19_11_SOURCE_KEY,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: MADISON_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MADISON_MGO_19_11_SOURCE_KEY,
    notes:
      "Read 2026-09-25 in both modes. §19.11 transcribed in full: Group I $.09, Group II $.11, Group III $.06, Group IV's $25.00 for the first ten openings plus $1.00 each additional, the definition of an opening, Electric Service Replacement at $50.00 per panel, the 50% shell reduction and the penalty. §19.08 and §19.09 read for the licence and permit requirements.",
  },
  {
    entityType: "fee_schedule",
    entityKey: MADISON_KEYS.feeSchedule,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: MADISON_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MADISON_FEES_PAGE_SOURCE_KEY,
    notes:
      "The schedule is three enacted sections rather than one document, and all three were read on 2026-09-25 and set against the division's consolidated page. Effective 2021-03-27 for all three chapters. The one disagreement between the sources (Group II plumbing) is recorded in the rule that carries it.",
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-NEW-GROUP",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: MADISON_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MADISON_MGO_29_09_SOURCE_KEY,
    notes:
      "MGO 29.09(3)(a) — $.10, $.18 and $.12 per sq. ft. with a $25.00 minimum — and the same three rows restated as the Building column of the City's fee page. Modelled as one published table keyed on fee_group because the three chapters print the identical structure.",
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-EXISTING-ALTERATIONS",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: MADISON_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MADISON_MGO_29_09_SOURCE_KEY,
    notes:
      "MGO 29.09(3)(a) Group IV — $11.00 for each $1,000 value or fraction thereof, minimum $25.00 — with the value defined by MGO 29.09(2)(c). Modelled as per_thousand with a $1,000 increment so that a part-thousand counts as a whole one, and with the subsection's cap named as not modelled.",
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-PLAN-REVIEW-RES-NEW",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: MADISON_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MADISON_MGO_29_09_SOURCE_KEY,
    notes:
      "MGO 29.09(3)(b) — \"New single family or two family residential buildings — $100.00\" — printed identically on the City's fee page. The row is flat and the commercial alternative is $.04 per sq. ft., so the flat row is the larger of the two below 2,500 square feet and the smaller above it.",
  },
  {
    entityType: "fee_rule",
    entityKey: "ELEC-OPENINGS",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: MADISON_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MADISON_MGO_19_11_SOURCE_KEY,
    notes:
      "MGO 19.11 Group IV — $25.00 first ten openings, $1.00 each additional — corroborated twice: by the schedule's own definition of an opening, and by the City's online-permits page, which says electrical fees are calculated \"by the number of openings (outlets, switches, and fixtures) and/or the number of new or replaced service entrances\".",
  },
  {
    entityType: "fee_rule",
    entityKey: "PLUMB-FIXTURES",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: MADISON_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MADISON_MGO_18_09_SOURCE_KEY,
    notes:
      "MGO 18.09 Group IV — $8.00 per fixture, minimum $25.00 — with the chapter's fixture-counting note, and corroborated by the City's online-permits page: plumbing repair and replace fees are calculated \"by the number of new or replaced fixtures\".",
  },
  {
    entityType: "fee_rule",
    entityKey: "PLUMB-NEW-GROUP",
    permitTypeKey: "plumbing",
    status: "disputed",
    method: "official_pdf_review",
    verifiedAt: MADISON_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MADISON_MGO_18_09_SOURCE_KEY,
    notes:
      "The rates themselves are verified: MGO 18.09 prints $.09, $.10 and $.06 per sq. ft. with a $25.00 minimum, and the City's fee page prints $.09, $.11 and $.06. Group II is the disagreement — $.10 enacted against $.11 published — so the rule carries the enacted figure and the status is disputed rather than verified until the division answers.",
  },
  {
    entityType: "permit_page",
    entityKey: "building-permit-cost",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: MADISON_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MADISON_MGO_29_09_SOURCE_KEY,
    notes:
      "The three group rates, the Group IV valuation row, the four plan review rows and the zoning review fee. The worked example is arithmetic on the schedule: 2,400 sq ft at $.10 is $240.00, the flat residential plan review is $100.00, and 2,400 sq ft at $0.03 is $72.00. The alteration cap and the round-up are named as not modelled rather than silently dropped.",
  },
  {
    entityType: "permit_page",
    entityKey: "electrical-permit-cost",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: MADISON_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MADISON_MGO_19_11_SOURCE_KEY,
    notes:
      "The three group rates, the opening ladder with the schedule's own definition, and the service-panel row. The worked example is arithmetic on the schedule: fourteen openings is one $25.00 block plus four at $1.00, and one service panel is $50.00.",
  },
  {
    entityType: "permit_page",
    entityKey: "plumbing-permit-cost",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: MADISON_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MADISON_MGO_18_09_SOURCE_KEY,
    notes:
      "The three group rates and the fixture ladder with the chapter's counting note. The page states the Group II disagreement between the ordinance and the City's fee page as an FAQ rather than resolving it, and the worked example shows the $25.00 minimum binding on small counts.",
  },
  {
    entityType: "jurisdiction_profile",
    entityKey: MADISON_KEYS.jurisdiction,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: MADISON_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MADISON_FEES_PAGE_SOURCE_KEY,
    notes:
      "Hub content built from three enacted fee schedules and the division's own page, corroborated by the permits chart, the online-permits page, the 1 & 2 Family page and the contact record. The State's SPS tables are named as unread rather than quoted, which is the only honest treatment available for a server that answers no request from this environment.",
  },
];

export const madisonSeed: JurisdictionSeed = {
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
export const MADISON_PUBLISHED_PERMIT_PAGES = madisonSeed.permitPages.filter(
  (page) => page.publishStatus === "published" && !page.noindex,
);
