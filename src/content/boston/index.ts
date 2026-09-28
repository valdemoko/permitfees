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
  BOSTON_BUILDING_BASE_RULES,
  BOSTON_ELECTRICAL_BASE_RULES,
  BOSTON_ELECTRICAL_PERMIT_SOURCE_KEY,
  BOSTON_FEE_EFFECTIVE_FROM,
  BOSTON_ISD_DEPARTMENT_SOURCE_KEY,
  BOSTON_ISD_FEES_SOURCE_KEY,
  BOSTON_LONG_FORM_SOURCE_KEY,
  BOSTON_PERMITTING_HUB_SOURCE_KEY,
  BOSTON_PLUMBING_BASE_RULES,
  BOSTON_PLUMBING_PERMIT_SOURCE_KEY,
  BOSTON_SHORT_FORM_SOURCE_KEY,
} from "./fee-rules";

export * from "./fee-rules";

/**
 * The complete Boston, Massachusetts seed payload.
 *
 * Every figure traces to research/massachusetts/boston.md, which traces to ISD's own
 * two-page Building Division Permit Fees sheet (Rev. 2021) and to the four boston.gov
 * permit pages that restate its rows. Nothing is estimated.
 *
 * Three pages, all published: building, electrical and plumbing. Boston is the first
 * jurisdiction in this dataset whose schedule is a *handout* rather than a code table —
 * two pages, a department address at the foot of both, a revision year and no effective
 * date — and whose live pages confirm the handout line for line: the sheet and the City's
 * web text print the same two numbers for every row they share. It is also the first whose
 * per-$1,000 rate prorates, because the sheet never prints "or fraction thereof"; Cambridge,
 * the next city in this state, prints the phrase four times and rounds up, and both readings
 * are asserted in their own tests.
 *
 * The county row records **Suffolk County**. ISD issues permits citywide, so the county is a
 * locator rather than an authority: 1010 Massachusetts Avenue, the address printed on the
 * fee sheet itself, sits in it.
 */

const RESEARCHER = "Permit Fee Intelligence research pass 14 (Massachusetts)";

export const BOSTON_LAST_VERIFIED = "2026-09-25";

export const BOSTON_KEYS = {
  state: "ma",
  county: "suffolk-county",
  jurisdiction: "boston",
  feeSchedule: "boston-isd-building-division-fees",
} as const;

const state: SeedState = {
  code: "MA",
  slug: "massachusetts",
  name: "Massachusetts",
  fipsCode: "25",
};

const county: SeedCounty = {
  key: BOSTON_KEYS.county,
  slug: "suffolk-county",
  name: "Suffolk County",
  fipsCode: "25025",
};

const jurisdiction: SeedJurisdiction = {
  key: BOSTON_KEYS.jurisdiction,
  stateKey: BOSTON_KEYS.state,
  countyKey: BOSTON_KEYS.county,
  type: "city",
  slug: "boston",
  name: "Boston",
  officialName: "City of Boston",
  websiteUrl: "https://www.boston.gov/",
  permitPortalUrl: "https://onlinepermitsandlicenses.boston.gov/isdpermits/",
  timezone: "America/New_York",
  isActive: true,
};

const departments: SeedDepartment[] = [
  {
    key: "boston-inspectional-services-department",
    jurisdictionKey: BOSTON_KEYS.jurisdiction,
    kind: "building",
    name: "Boston Inspectional Services Department (ISD)",
    phone: "(617) 635-5300",
    email: "isd@boston.gov",
    url: "https://www.boston.gov/departments/inspectional-services",
    addressLine: "1010 Massachusetts Avenue, 5th Floor, Boston, MA 02118",
    hours: "Monday through Friday, 8 a.m. - 4 p.m.",
    notes:
      "ISD issues every permit this site prices for Boston — building, electrical and plumbing — from one counter and one online portal, and its own fee sheet is the schedule behind all three pages. Permit questions go to isdpermits@boston.gov; the main line and the department address here are the ones printed at the foot of the fee sheet on both pages, which is how the sheet's contact block and the department page were matched. Fire Prevention, not ISD, carries the fire alarm and sprinkler permits the permitting hub links to, and the Zoning Board of Appeal — which a nominal fee letter is written for — is linked from the same department page.",
  },
];

const sources: SeedSource[] = [
  {
    key: BOSTON_ISD_FEES_SOURCE_KEY,
    jurisdictionKey: BOSTON_KEYS.jurisdiction,
    title:
      "ISD — Building Division Permit Fees (Rev. 2021), the two-page sheet every figure here comes from",
    url: "https://www.boston.gov/sites/default/files/file/2021/10/Building%20Division%20Fees.pdf",
    sourceType: "fee_schedule_pdf",
    issuingAuthority: "City of Boston — Inspectional Services Department",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: BOSTON_FEE_EFFECTIVE_FROM,
    retrievedAt: BOSTON_LAST_VERIFIED,
    lastVerifiedAt: BOSTON_LAST_VERIFIED,
    notes:
      "Read 2026-09-25 as a two-page PDF of 263,477 bytes served from boston.gov's own file store, footed on both pages with the department's block: Inspectional Services Department, 1010 Massachusetts Ave. (5th Floor) Boston, MA 02118, www.boston.gov/ISD, (617) 635-5300, Rev. 2021. The two columns were extracted twice, because they are laid out as separate text blocks: pdftotext's table-preserving mode mispairs them — Plumbing picks up the Off Hour Inspection amount and Use of Premises picks up Sprinkler's rate — while the reading-order mode emits each row's cells together and pairs them correctly, and that is the transcription this site uses. Four rows are independently confirmed by the City's live permit pages, where each prints the same two numbers.",
  },
  {
    key: BOSTON_SHORT_FORM_SOURCE_KEY,
    jurisdictionKey: BOSTON_KEYS.jurisdiction,
    title: "ISD — Short-Form Permit (minor alterations)",
    url: "https://www.boston.gov/permitting/permits/short-form-permit",
    sourceType: "municipal_website",
    issuingAuthority: "City of Boston — Inspectional Services Department",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: BOSTON_LAST_VERIFIED,
    lastVerifiedAt: BOSTON_LAST_VERIFIED,
    notes:
      "Read 2026-09-25 for the City's definition and its restatement of the fee: \"A Short-Form Permit covers minor alterations that don't change a building's structure or use\", with Fees as \"$20, plus $10 per $1,000 of estimated cost\" and again in prose as \"There is a $20 application fee and $10 per every $1,000 of the work estimate\". The page also lists what an application carries — a scope of work naming materials, floors and rooms, an estimated total project cost entered without special characters, design plans stamped by a Massachusetts registered engineer or architect, and a nominal fee letter where the work does not follow the intended zoning — and states that all fees are due upfront and that starting work early may mean ISD charges double the permit cost.",
  },
  {
    key: BOSTON_LONG_FORM_SOURCE_KEY,
    jurisdictionKey: BOSTON_KEYS.jurisdiction,
    title: "ISD — Long-Form Permit (major alterations and renovations)",
    url: "https://www.boston.gov/permitting/permits/long-form-permit",
    sourceType: "municipal_website",
    issuingAuthority: "City of Boston — Inspectional Services Department",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: BOSTON_LAST_VERIFIED,
    lastVerifiedAt: BOSTON_LAST_VERIFIED,
    notes:
      "Read 2026-09-25 for the other half of the building schedule and for the taxonomy the model depends on: \"A Long-Form Permit covers major alterations or renovations that change a building's structure or use\", Fees as \"$50, plus $10 per $1,000 of estimated work cost\" and again as \"$50 application fee / Plus $10 for every $1,000 of the estimated cost of work\". The page's subcategory list is what ties the sheet's rows to filing types — \"Amendment: Only for changes to existing Long-Form permit applications\" and \"Use of Premise: Only for Use of Premise permit filings\" — and it notes that an owner of a unit in a building with three or more dwellings must hire a licensed contractor.",
  },
  {
    key: BOSTON_PLUMBING_PERMIT_SOURCE_KEY,
    jurisdictionKey: BOSTON_KEYS.jurisdiction,
    title: "ISD — Plumbing Permit",
    url: "https://www.boston.gov/permitting/permits/plumbing-permit",
    sourceType: "municipal_website",
    issuingAuthority: "City of Boston — Inspectional Services Department",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: BOSTON_LAST_VERIFIED,
    lastVerifiedAt: BOSTON_LAST_VERIFIED,
    notes:
      "Read 2026-09-25: Fees as \"$20, plus $5 per fixture\", stated again as \"There is a $20 application fee plus $5 for each fixture, such as toilets and sinks\" — the sheet's plumbing row in the City's own web words, with a worked pair of numbers to check it against. The page also carries the licence rule the sheet does not: \"Plumbing permits are available to licensed contractors only\", \"The permit applicant must be the contractor performing the work\", and a homeowner \"must hire a licensed contractor to apply for the permit and complete the work\".",
  },
  {
    key: BOSTON_ELECTRICAL_PERMIT_SOURCE_KEY,
    jurisdictionKey: BOSTON_KEYS.jurisdiction,
    title: "ISD — Electrical Permit (the three usage branches, spelled out)",
    url: "https://www.boston.gov/permitting/permits/electrical-permit",
    sourceType: "municipal_website",
    issuingAuthority: "City of Boston — Inspectional Services Department",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: BOSTON_LAST_VERIFIED,
    lastVerifiedAt: BOSTON_LAST_VERIFIED,
    notes:
      "Read 2026-09-25 for the schedule's three branches in the City's own words: \"When upgrading service or installing new service: $20 application fee, plus $0.25/amp up to 240 volts, or $0.75/amp over 480 volts. When there's no change in service: $20 application fee, plus $1 for each fixture, plug, or outlet, and $5 for each approved meter. When neither of the above applies (including all Massachusetts state buildings): $20 application fee, plus $10 per $1,000 of the estimated cost\", under the heading \"$20 + usage-based rate\". This page is where the sheet's voltage wording differs from the web's — \"up to 480 Volts\" against \"over 480 volts\" — and both readings are quoted on the electrical page rather than reconciled in silence.",
  },
  {
    key: BOSTON_PERMITTING_HUB_SOURCE_KEY,
    jurisdictionKey: BOSTON_KEYS.jurisdiction,
    title: "Welcome to Boston Permitting — the City's permitting hub",
    url: "https://www.boston.gov/boston-permitting",
    sourceType: "municipal_website",
    issuingAuthority: "City of Boston",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: BOSTON_LAST_VERIFIED,
    lastVerifiedAt: BOSTON_LAST_VERIFIED,
    notes:
      "Read 2026-09-25 for what the City says its permitting site covers — \"this website covers home improvement and building projects. We are working to include information on other projects and permits in the future\" — and for the routes it points at: the Inspectional Services online portal, Permit Finder for status, the ISD and Fire permit status check, and Fire Prevention's own forms, permits, applications and fees. That last link is the boundary of this dataset's Boston pages: fire alarm and sprinkler permitting is largely Fire Prevention's, and the hub says so by linking there rather than pricing it here.",
  },
  {
    key: BOSTON_ISD_DEPARTMENT_SOURCE_KEY,
    jurisdictionKey: BOSTON_KEYS.jurisdiction,
    title: "Inspectional Services Department — department page (contact block and hours)",
    url: "https://www.boston.gov/departments/inspectional-services",
    sourceType: "municipal_website",
    issuingAuthority: "City of Boston",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: BOSTON_LAST_VERIFIED,
    lastVerifiedAt: BOSTON_LAST_VERIFIED,
    notes:
      "Read 2026-09-25 for the contact facts the fee sheet prints in short form: 617-635-5300, isd@boston.gov, and hours of Monday through Friday, 8 a.m. - 4 p.m. The page is also where the department links its records request, its notice of accommodation and the Zoning Board of Appeal — the board a nominal fee letter is written for, and the reason the $300.00 Nominal Fee row is understood as an ISD fee rather than a Board fee.",
  },
];

/** Empty on purpose: the permit types Boston uses already exist as shared rows. */
const permitTypes: JurisdictionSeed["permitTypes"] = [];
const projectTypes: JurisdictionSeed["projectTypes"] = [];

const jurisdictionPermitTypes: SeedJurisdictionPermitType[] = [
  {
    jurisdictionKey: BOSTON_KEYS.jurisdiction,
    permitTypeKey: "building",
    isAvailable: true,
    localName: "Building permit — Short Form, Long Form, Amendment, Change of Occupancy or Nominal Fee",
    officialUrl: "https://www.boston.gov/permitting/permits/short-form-permit",
    notes:
      "One row of ISD's fee sheet prices each kind of filing, and the row is chosen by what the application is rather than by what it costs: $20.00 plus $10.00 per $1,000 of estimated cost for a Short Form or an Amendment, $50.00 plus the same $10.00 for a Long Form, $20.00 or $50.00 flat for a Change of Occupancy by building category, and $300.00 plus a $50.00 application fee for the Nominal Fee route. The $10.00 rate prorates — the sheet never prints \"or fraction thereof\" — and no plan review percentage, technology fee or state surcharge exists to add to it.",
  },
  {
    jurisdictionKey: BOSTON_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    isAvailable: true,
    localName: "Electrical permit — priced by the schedule's three usage branches",
    officialUrl: "https://www.boston.gov/permitting/permits/electrical-permit",
    notes:
      "The sheet's electrical section branches three ways in its own words: a service change is priced on amperage ($0.25 an ampere at 240 volts or less, $0.75 above), no service change is priced on devices ($1.00 each fixture, plug or outlet and $5.00 for the meters approved), and where neither applies the fee is $10.00 per $1,000 of estimated cost. Each branch carries the same $20.00 application fee, which is charged once; Fire Alarm and Low Voltage are their own $20.00-plus-$10.00 rows, and Temporary Service replaces the application fee with $25.00.",
  },
  {
    jurisdictionKey: BOSTON_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    isAvailable: true,
    localName: "Plumbing permit — $20.00 plus $5.00 a fixture",
    officialUrl: "https://www.boston.gov/permitting/permits/plumbing-permit",
    notes:
      "The whole plumbing row is two numbers: a $20.00 primary fee and $5.00 for each fixture, with no allowance, no ceiling and no cost ladder behind it. Five fixtures are $45.00 in all and eight are $60.00. Only a licensed contractor may apply, and the permit applicant must be the contractor doing the work — a homeowner has to hire one.",
  },
];

const feeSchedules: SeedFeeSchedule[] = [
  {
    key: BOSTON_KEYS.feeSchedule,
    jurisdictionKey: BOSTON_KEYS.jurisdiction,
    sourceKey: BOSTON_ISD_FEES_SOURCE_KEY,
    title: "ISD Building Division Permit Fees (Rev. 2021)",
    officialUrl:
      "https://www.boston.gov/sites/default/files/file/2021/10/Building%20Division%20Fees.pdf",
    effectiveFrom: BOSTON_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: BOSTON_LAST_VERIFIED,
    notes:
      "One schedule covers all three pages, because one sheet prints all three trades. It carries no effective date — only the stamp \"Rev. 2021\" and the /2021/10/ path boston.gov serves it from, which is what the effectiveFrom above records: the month the City published the file, not an enactment it never printed. The four live permit pages carry no date of their own and are read as the City's restatement of the same schedule; no later revision was found on this pass.",
  },
];

function attach(permitTypeKey: string, rules: FeeRuleRecord[]): SeedFeeRule[] {
  return rules.map((rule) => ({
    jurisdictionKey: BOSTON_KEYS.jurisdiction,
    permitTypeKey,
    scheduleKey: BOSTON_KEYS.feeSchedule,
    rule,
  }));
}

const feeRules: SeedFeeRule[] = [
  ...attach("building", BOSTON_BUILDING_BASE_RULES),
  ...attach("electrical", BOSTON_ELECTRICAL_BASE_RULES),
  ...attach("plumbing", BOSTON_PLUMBING_BASE_RULES),
];

const requirements: SeedRequirement[] = [
  {
    jurisdictionKey: BOSTON_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "document",
    title: "An application carrying a scope, a cost and stamped design plans",
    description:
      "The Short-Form and Long-Form pages list the same attachments: a short description of the work including scope of work, materials, floors and rooms involved and any related permit numbers; the estimated total project cost, entered in the online portal without special characters such as $ or commas; and design plans stamped by a Massachusetts registered engineer or architect. Where the work needs another agency's sign-off — fire protection, or work within 100 feet of a park or parkway — the approvals are uploaded to the portal, and the City states that the permit cannot be issued until ISD receives and reviews them.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: BOSTON_SHORT_FORM_SOURCE_KEY,
    lastVerifiedAt: BOSTON_LAST_VERIFIED,
  },
  {
    jurisdictionKey: BOSTON_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "zoning_review",
    title: "A nominal fee letter where the work does not follow the intended zoning",
    description:
      "Both permit pages list it among the attachments: \"A nominal fee letter if your work does not follow the intended Zoning of the property and you know you're going to engage the Zoning Board of Appeal\". The letter is the ISD side of that route and carries the sheet's own price — the $300.00 Nominal Fee plus its $50.00 application fee, which this site charges as two rules under one form type. The Zoning Board of Appeal's own charges are separate and are not modelled.",
    isMandatory: true,
    sortOrder: 20,
    sourceKey: BOSTON_LONG_FORM_SOURCE_KEY,
    lastVerifiedAt: BOSTON_LAST_VERIFIED,
  },
  {
    jurisdictionKey: BOSTON_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "Fees are due upfront, and work must start within six months",
    description:
      "Both permit pages state that all fees are due upfront — payable online in the portal or in person at the Inspectional Services Department, 1010 Massachusetts Avenue, 5th Floor — and that work must start within six months after the permit is issued, with a possible 180-day extension for some project types. Starting before the permit issues is the DOUBLE FEE: the sheet prints it in capitals and the pages repeat it as ISD \"may: charge double the permit cost\". Timing is when the money moves and what the permit allows, not an extra charge, so no rule is written for either.",
    isMandatory: true,
    sortOrder: 30,
    sourceKey: BOSTON_SHORT_FORM_SOURCE_KEY,
    lastVerifiedAt: BOSTON_LAST_VERIFIED,
  },
  {
    jurisdictionKey: BOSTON_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "license",
    title: "A licensed contractor files the electrical permit and does the work",
    description:
      "The electrical page is unambiguous: \"You must be a licensed contractor to apply for this permit\", \"The permit applicant must be the contractor performing the work\", and a homeowner \"must hire a licensed contractor to apply for the permit and complete the work\". The same rule appears on the plumbing page, which is why neither trade can be permitted by an owner on their own behalf in this model.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: BOSTON_ELECTRICAL_PERMIT_SOURCE_KEY,
    lastVerifiedAt: BOSTON_LAST_VERIFIED,
  },
  {
    jurisdictionKey: BOSTON_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "other",
    title: "The fee's inputs are the service's size and voltage, or a device count",
    description:
      "The schedule prices electrical work from facts the applicant supplies rather than from a valuation in the ordinary case: the amperage of the service (and its voltage, which decides $0.25 against $0.75 an ampere) where the service changes, or a count of fixtures, plugs and outlets plus the meters approved where it does not. Only the third branch reads an estimated cost, and that branch applies when neither of the other two can. The permit page heads all of it \"$20 + usage-based rate\".",
    isMandatory: true,
    sortOrder: 20,
    sourceKey: BOSTON_ELECTRICAL_PERMIT_SOURCE_KEY,
    lastVerifiedAt: BOSTON_LAST_VERIFIED,
  },
  {
    jurisdictionKey: BOSTON_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    requirementType: "license",
    title: "Plumbing permits are available to licensed contractors only",
    description:
      "The plumbing page states it three ways: \"Plumbing permits are available to licensed contractors only\", \"The permit applicant must be the contractor performing the work\", and \"If you're a homeowner, you must hire a licensed contractor to apply for the permit and complete the work\". The fixture count that sets the fee is therefore always filed by the trade that does the work.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: BOSTON_PLUMBING_PERMIT_SOURCE_KEY,
    lastVerifiedAt: BOSTON_LAST_VERIFIED,
  },
  {
    jurisdictionKey: BOSTON_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    requirementType: "inspection",
    title: "A final inspection is called for, and other agencies' approvals ride along",
    description:
      "The permit pages describe the loop an application runs — review by planning and zoning, any documentation or sign-off from other agencies uploaded to the portal, issuance, then inspection — and the City recommends verifying that the permit record shows closed once the inspection passes with no further work required. A fire protection plan and narrative are required where the project has fire protection, and Parks and Recreation approval is required for work within 100 feet of a park or parkway. The only inspection price on ISD's sheet is the Off Hour Inspection at $250.00, which is after-hours attendance rather than a re-inspection, so no re-inspection fee is charged here.",
    isMandatory: true,
    sortOrder: 20,
    sourceKey: BOSTON_SHORT_FORM_SOURCE_KEY,
    lastVerifiedAt: BOSTON_LAST_VERIFIED,
  },
];

const profile: SeedProfile = {
  jurisdictionKey: BOSTON_KEYS.jurisdiction,
  headline: "What construction permits cost in Boston",
  summary:
    "Boston prices a building permit on **the estimated cost of the work**, one row of a two-page fee sheet at a time: $20.00 plus $10.00 for each $1,000 of cost on a Short Form, $50.00 plus the same $10.00 on a Long Form, $20.00 plus $10.00 to amend one, $20.00 or $50.00 flat to change a building's use, and $300.00 for the Nominal Fee route zoning appeals take. Plumbing is $20.00 to apply plus $5.00 a fixture. Electrical is $20.00 to apply plus a rate that follows what the job does: $0.25 an ampere when the service changes, a dollar a device when it does not, $10.00 per $1,000 of cost when neither applies.",
  localContext:
    "One department, one sheet, one portal. The Inspectional Services Department issues all three permits this site prices, takes applications through its own online portal, and publishes its schedule as a two-page handout — BUILDING DIVISION PERMIT FEES, Rev. 2021 — whose foot carries the department's address, phone number and web address on both pages. Four live pages on boston.gov then restate its rows in the City's own web words: the Short Form at \"$20, plus $10 per $1,000 of estimated cost\", the Long Form at \"$50, plus $10 per $1,000 of estimated work cost\", plumbing at \"$20, plus $5 per fixture\", and electrical as \"$20 + usage-based rate\". Where a figure appears in both places it appears twice with the same two numbers, which is the check this jurisdiction can make and most cannot.\n\nThe sheet's structure is what to understand before any number. It prices applications rather than projects: five building rows — Short Form, Long Form, Amendment, Changes of Occupancy, Nominal Fee — that are types of filing, and an electrical section built as branches: by amperage when the service changes, by device count when it does not, by cost where neither applies, with Fire Alarm, Low Voltage and Temporary Service as rows of their own. The document was extracted twice, because its two columns are laid out as separate text blocks and the table-preserving mode mispairs them — it hands Plumbing the Off Hour Inspection amount and Use of Premises Sprinkler's rate — while the reading-order mode pairs each row correctly and the four live pages confirm every row they share.\n\nWhat is absent is itself a fact about Boston. No plan review percentage, no technology fee and no state surcharge appears anywhere in the sheet or the pages: searches for those phrases come back empty, and Massachusetts, unlike the states before this one in this dataset, adds no levy of its own to a local permit. What the City prints instead is a penalty. Work started without a permit, or started on an undervalued estimate, is charged DOUBLE FEE — the sheet says so in capitals, and the permit pages repeat it as ISD \"may: charge double the permit cost\".",
  valuationBasis:
    "The basis for building work is **the estimated cost of the work**, entered in the portal as an estimated total project cost with no special characters. The sheet charges $10.00 for each $1,000 of it — and it does not print \"or fraction thereof\", anywhere, so the rate is charged on the exact cost rather than on a cost rounded to the next thousand. A $47,550 renovation pays $475.50 of rate, not the $480.00 a rounded-up schedule would charge; Cambridge, three miles west, prints that phrase on four rows of its own schedule and rounds up, and both readings are asserted against the engine in their cities' tests.\n\nElectrical work is priced from facts the schedule names rather than from cost in the ordinary case: the service's amperage where the service changes, with the voltage deciding $0.25 or $0.75 an ampere; a count of fixtures, plugs and outlets where it does not; and the cost of the work only where neither of those applies — the sheet's own third branch, \"When none of the above apply\". Plumbing is priced from the fixture count alone, and its $20.00 application fee stands whether or not a count is supplied.\n\nNothing here derives a cost from square footage or an area from a valuation: the sheet publishes no conversion and the pages ask for a dollar figure instead. The City can also reject the figure it is given — an estimate that undervalues the work is charged the DOUBLE FEE — so the basis is the applicant's number as accepted by ISD rather than a number this site could check.",
  notIncluded:
    "These figures are Boston's own building, electrical and plumbing permit fees, as printed on ISD's Rev. 2021 sheet and restated on boston.gov. They are not a project cost, and they exclude:\n\n- **The DOUBLE FEE.** Work started without a required permit, or started on an undervalued estimate, is charged twice the fee — a multiplier on a fee that has not been computed, which no rule here expresses. The sheet prints it in capitals and the City's pages repeat it.\n- **The sheet's event and specialty rows.** Off Hour Application at $100.00 an event, Off Hour Inspection at $250.00, Board of Appeal at $150.00 (and $150.00 for each violation cited for four-family and commercial work), Microfilming at $3.00 a sheet, Use of Premises at $50.00, Trench at $60.00, Subdivision or Combining Lots at $50.00 and $100.00, and Sheet Metal at $20.00 plus $25.00 for the first 200 linear or square feet and $25.00 for each 200 after them.\n- **The other trades on the same sheet.** Sprinkler at $20.00 plus $1.00 a head, and Gasfitting at $20.00 plus $5.00 an appliance meter with $.09 per 1,000 BTU for boilers and furnaces and the stored-gas and propane rows — ISD rows for trades these three pages do not price, and fire alarm and sprinkler permits are largely Fire Prevention's.\n- **Temporary Service's monthly element** — $10.00 for each month up to six months, priced in months, a unit no per-unit kind here counts; the $25.00 primary fee is charged and the months are named.\n- **Plan review, technology and state surcharges — none of them exist.** The sheet prints no percentage, the pages print none, and Massachusetts adds no levy of its own; the absence is stated rather than filled with an assumed rate.\n- **Every other board's and agency's fees**: the Zoning Board of Appeal's own charges (the $300.00 Nominal Fee is ISD's row, not the Board's), Fire Prevention's permits, Boston Landmarks Commission review, bostonplans.org zoning approvals, Parks and Recreation approval for work within 100 feet of a park or parkway, and contractor licence and examination fees.",
  seoTitle: "Boston construction permit fees",
  seoDescription:
    "How Boston prices construction permits — ISD's two-page sheet of $20.00 plus $10.00 per $1,000 Short Forms, $50.00 Long Forms, $5.00 a plumbing fixture, and electrical's $0.25-to-$0.75 an ampere, with no plan review or technology surcharge.",
  publishStatus: "published",
  noindex: false,
  lastReviewedAt: BOSTON_LAST_VERIFIED,
};

const permitPages: SeedPermitPage[] = [
  {
    jurisdictionKey: BOSTON_KEYS.jurisdiction,
    permitTypeKey: "building",
    slug: "building-permit-cost",
    title: "Boston building permit cost",
    intro:
      "A Boston building permit is priced on **the estimated cost of the work**, row by row from the Inspectional Services Department's own two-page fee sheet: $20.00 plus $10.00 for each $1,000 of cost on a Short Form for minor alterations, $50.00 plus the same $10.00 on a Long Form for major ones, $20.00 plus $10.00 to amend an application, $20.00 or $50.00 flat to change a building's use, and $300.00 for the Nominal Fee route. None of those rows rounds the cost up — the sheet never prints \"or fraction thereof\" — so a partial thousand costs a partial rate.",
    localSummary:
      "Which row applies is decided by what the filing is, not by what it costs: the Short Form covers \"minor alterations that don't change a building's structure or use\" and the Long Form \"major alterations or renovations that change a building's structure or use\", in the City's own definitions. A $47,500 renovation on a Short Form is $20.00 primary fee plus $475.00 of rate — $495.00 — and the same job filed as a Long Form is $525.00. An amendment to an existing Long Form is $495.00 again, because the Amendment row carries the Short Form's arithmetic.\n\nThe rounding question is where Boston differs from its neighbours. $47,550 of cost pays $475.50 of rate and $495.50 in all, because \"$10.00 per $1,000.00 of the estimated cost of work\" has no \"or fraction thereof\" behind it; Cambridge, three miles west, prints that phrase four times on its own schedule and charges a rounded-up step instead. Both readings are asserted against the engine in their cities' tests, so neither can drift into the other.\n\nTwo charges a reader expects are absent here, and the absence is documented rather than assumed: no plan review percentage, no technology fee and no state surcharge appears in the sheet or in any of the four permit pages, and searches for those phrases come back empty. What the City does charge is upfront — all fees are due when you file — gives you six months to start, and doubles if you start early: the sheet's DOUBLE FEE, which the permit pages repeat as ISD \"may: charge double the permit cost\".",
    notIncluded:
      "This is one row of ISD's Building Division Permit Fees sheet, priced on the estimated cost of the work. It excludes:\n\n- **The DOUBLE FEE.** Starting work before the permit issues, or filing an estimate that undervalues the work, doubles the fee — a multiplier on a charge no rule type here can express, printed in capitals on the sheet.\n- **The sheet's other rows.** Off Hour Application at $100.00 an event, Off Hour Inspection at $250.00, Board of Appeal at $150.00, Microfilming at $3.00 a sheet, Use of Premises at $50.00, Trench at $60.00, Subdivision or Combining Lots at $50.00 and $100.00, and Sheet Metal at $20.00 plus $25.00 per 200 linear or square feet — each read off the sheet and transcribed in the research record, none attached to this page.\n- **Trade permits.** Plumbing and electrical are priced on their own pages; Sprinkler ($20.00 plus $1.00 a head) and Gasfitting are named here and priced nowhere on these three pages.\n- **Plan review, energy review, technology and state surcharges — none exist.** No percentage appears in the sheet or the pages, and Massachusetts adds no levy of its own to a Boston permit.\n- **Other agencies' approvals and their fees**: Fire Prevention, the Zoning Board of Appeal's own charges, bostonplans.org zoning review, Boston Landmarks Commission review, and Parks and Recreation approval for work within 100 feet of a park or parkway.\n- **Contractor licensing and examination fees**, and the stamped design plans an application has to carry — requirements rather than fees for this permit.",
    workedExample: {
      scenario:
        "A kitchen and bath renovation estimated at $47,500 — a minor alteration that changes neither the structure nor the use of the home — filed on the Short Form.",
      inputs: {
        valuationCents: 4_750_000,
        custom: { form_type: "short_form" },
      },
      notes:
        "The Short Form's own ladder: a $20.00 primary fee plus $10.00 for each $1,000 of the $47,500 estimate. Forty-seven and a half thousands at $10.00 is $475.00 — the sheet's rate has no \"or fraction thereof\" behind it, so the half thousand is charged as half a rate rather than bought as a whole step — and the permit is $495.00.\n\nFiling the same job as a Long Form raises the primary fee to $50.00 and the total to $525.00; filing it as an amendment to an existing Long Form brings it back to $495.00, because the Amendment row carries the Short Form's arithmetic. A Change of Occupancy does not read the cost at all: $20.00 in a building of three dwellings or fewer, $50.00 above that or in a commercial building.\n\nWhat moves it by pennies: add $50 to the estimate and the fee moves fifty cents — $47,550 pays $495.50 — which is the proration in one number. The total here is ISD's fee alone. No plan review, technology or state line exists to add, and starting work before the permit issues doubles all of it.",
    },
    faqs: [
      {
        question: "How much is a building permit in Boston?",
        answer:
          "It depends on which of the sheet's rows the filing is. A Short Form for minor work is $20.00 plus $10.00 for each $1,000 of the estimated cost; a Long Form for major alterations is $50.00 plus the same $10.00; an amendment is $20.00 plus the same $10.00. A change of occupancy is flat at $20.00 for three dwellings or fewer and $50.00 above that or commercial, and the Nominal Fee route is $300.00 plus a $50.00 application fee. There is no plan review percentage or technology fee to add.",
        sourceId: BOSTON_ISD_FEES_SOURCE_KEY,
      },
      {
        question: "Which form do I need — Short Form or Long Form?",
        answer:
          "The City defines both: a Short-Form Permit \"covers minor alterations that don't change a building's structure or use\" — opening up a wall, repairs and replacements — while a Long-Form Permit \"covers major alterations or renovations that change a building's structure or use\". The two differ only in the primary fee, $20.00 against $50.00, because the $10.00-per-$1,000 rate is the same on both rows; ISD says to contact it when you are not sure which one applies.",
        sourceId: BOSTON_SHORT_FORM_SOURCE_KEY,
      },
      {
        question: "Does Boston round the estimate up to the next $1,000?",
        answer:
          "No. The sheet prints \"$10.00 per $1,000.00 of the estimated cost of work\" with no \"or fraction thereof\" behind it, so a partial thousand is charged at a partial rate: $47,550 of cost pays $475.50 of rate, and the permit is $495.50. Cambridge, a few miles west, prints the rounding phrase on its own schedule and charges a whole step instead — the two cities are a mile apart and round differently.",
        sourceId: BOSTON_ISD_FEES_SOURCE_KEY,
      },
      {
        question: "Is there a plan review fee or a technology fee in Boston?",
        answer:
          "Not on this schedule. The fee sheet prints no plan review percentage, no technology fee and no state surcharge, and none appears on the four permit pages either — searches for those phrases come back empty. What the sheet does print besides the rates is a penalty: DOUBLE FEE for work started without a permit or on an undervalued estimate.",
        sourceId: BOSTON_ISD_FEES_SOURCE_KEY,
      },
      {
        question: "What does a change of occupancy cost?",
        answer:
          "$20.00 flat where the building has three dwelling units or fewer, and $50.00 for four family and up or for commercial buildings — the sheet's own categories, charged on the change rather than on a cost. Where the filing is instead a nominal fee letter for work that does not follow the intended zoning, the fee is $300.00 plus a $50.00 application fee, and the Zoning Board of Appeal's own charges are separate.",
        sourceId: BOSTON_ISD_FEES_SOURCE_KEY,
      },
      {
        question: "What happens if work starts before the permit is issued?",
        answer:
          "The sheet's last line: \"DOUBLE FEE: When work has been started without a required permit or undervalued in the estimated cost.\" The City's permit pages repeat it in plain words — ISD \"may: charge double the permit cost\" — and add that a permit holder must start work within six months of issuance or let it lapse, with a possible 180-day extension for some project types.",
        sourceId: BOSTON_SHORT_FORM_SOURCE_KEY,
      },
    ],
    seoTitle: "Boston building permit cost: $20 + $10 per $1,000",
    seoDescription:
      "Boston building permit fees from ISD's own sheet — $20.00 plus $10.00 per $1,000 on a Short Form, $50.00 plus the same rate on a Long Form, $20/$50 flat changes of occupancy, the $300 Nominal Fee, and no plan review or technology surcharge.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: BOSTON_LAST_VERIFIED,
  },
  {
    jurisdictionKey: BOSTON_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    slug: "electrical-permit-cost",
    title: "Boston electrical permit cost",
    intro:
      "A Boston electrical permit is **$20.00 to apply plus a usage rate that follows what the job does**: $0.25 an ampere where the service is new or upgraded at 240 volts or less and $0.75 above that voltage, a dollar for each fixture, plug or outlet plus $5.00 for the meters where the service does not change, and $10.00 for each $1,000 of estimated cost where neither applies. Fire Alarm and Low Voltage are their own $20.00-plus-$10.00 rows, and Temporary Service replaces the application fee with $25.00.",
    localSummary:
      "The three branches are the sheet's own words — \"When upgrading service or installing new service\", \"When there is no change in service\", \"When none of the above apply\" — and exactly one can price an application. A 200-ampere service at 240 volts is $20.00 to apply plus $50.00 of rate: $70.00. The same service above 240 volts is $170.00, and a 400-ampere service there is $320.00.\n\nWith no service change the schedule counts devices instead: twelve fixtures, plugs and outlets are $12.00 and two approved meters $5.00, so the permit is $37.00. Give it neither a service nor a count and it falls back to cost — $10.00 for each $1,000, so a $3,000 job is $50.00 in all — which is the row that also covers all Massachusetts state buildings.\n\nOne sentence disagrees with itself across the City's two texts: the sheet reads \"$.75 amp up to 480 Volts\" in a numbered two-tier list while boston.gov reads \"$0.75/amp over 480 volts\", which leaves 241 to 480 volts unpriced on either text alone. This page charges $0.75 above 240 volts — the union of both readings — and prints both wordings so a reader can see the disagreement rather than inherit it.",
    notIncluded:
      "This is the electrical row of ISD's fee sheet — the $20.00 application fee plus whichever branch the job falls in. It excludes:\n\n- **Temporary Service's monthly element**: \"$10.00 for each month up to six months then apply again\", priced in months, a unit no per-unit kind here counts. The $25.00 primary fee is charged and the months are named.\n- **Electrical Yearly Maintenance at $320.00**, and the Off Hour Application at $100.00 an event and Off Hour Inspection at $250.00 — rows on the same sheet for later acts rather than for the permit being priced.\n- **The DOUBLE FEE** for work started without a permit or on an undervalued estimate, which doubles a fee rather than adding one.\n- **Fire alarm, sprinkler and gas work's other permits.** The Fire Alarm row here is ISD's electrical price for the work; Fire Prevention runs its own permitting for alarms and sprinklers, and the permitting hub links there.\n- **Plan review, technology and state surcharges — none exist** in this jurisdiction's text; no percentage appears on the sheet or the pages, and Massachusetts adds no levy of its own.\n- **Contractor licensing**, which is a requirement rather than a fee: only a licensed contractor may apply, and must be the contractor doing the work.",
    workedExample: {
      scenario:
        "A service upgrade to 200 amperes at 120/240 volts — the ordinary residential service change — with no other branch on the application.",
      inputs: {
        custom: { service_change: true, service_voltage: 240, amperage: 200 },
      },
      notes:
        "The first branch, priced on the service: a $20.00 application fee plus $0.25 for each of the 200 amperes, which is $50.00 of rate. The permit is $70.00.\n\nVoltage is what moves it. The same 200-ampere service above 240 volts is $0.75 an ampere — $150.00 of rate and $170.00 in all — and a 400-ampere service there is $300.00 of rate and $320.00. The sheet reads that tier as \"up to 480 Volts\" and boston.gov reads it as \"over 480 volts\"; this page charges it above 240 volts, the union of the two texts, and prints both.\n\nThe other branches price the same application differently: with no service change, twelve devices and two meters are $20.00 plus $12.00 plus $5.00 — $37.00 — and with neither a service nor a count, a $3,000 estimate is $20.00 plus $30.00, or $50.00. Temporary Service swaps the $20.00 application for its own $25.00 and adds nothing else here.",
    },
    faqs: [
      {
        question: "How much is an electrical permit in Boston?",
        answer:
          "$20.00 to apply, plus whatever the job's branch costs: $0.25 an ampere for a new or upgraded service at 240 volts or less, $0.75 an ampere above that voltage, $1.00 for each fixture, plug or outlet plus $5.00 for the meters approved where the service does not change, or $10.00 for each $1,000 of estimated cost where neither applies. Fire Alarm and Low Voltage filings are $20.00 plus $10.00 per $1,000, and Temporary Service is $25.00 flat plus its monthly element.",
        sourceId: BOSTON_ELECTRICAL_PERMIT_SOURCE_KEY,
      },
      {
        question: "What decides which rate applies — the service or the devices?",
        answer:
          "The schedule branches on facts rather than on price: \"When upgrading service or installing new service\" prices the permit from the service's amperage, \"When there is no change in service\" prices it from a count of fixtures, plugs and outlets plus the meters, and \"When none of the above apply\" falls back to $10.00 per $1,000 of estimated cost. Exactly one branch charges on an application, which is what the City's three-headed structure says and what this calculator enforces.",
        sourceId: BOSTON_ISD_FEES_SOURCE_KEY,
      },
      {
        question: "Why does the voltage matter?",
        answer:
          "Because the schedule prints two tiers of service rate and the City's two texts place the boundary differently: the fee sheet reads \"$.75 amp up to 480 Volts\" as the second entry of a numbered list, while boston.gov reads \"$0.75/amp over 480 volts\". This page charges $0.25 an ampere at 240 volts or less and $0.75 above it, the union of both readings, so that no voltage is left unpriced — and a 200-ampere service moves from $70.00 to $170.00 across that line.",
        sourceId: BOSTON_ELECTRICAL_PERMIT_SOURCE_KEY,
      },
      {
        question: "Can I permit electrical work myself as a homeowner?",
        answer:
          "No. The electrical page states \"You must be a licensed contractor to apply for this permit\" and \"The permit applicant must be the contractor performing the work\", and tells a homeowner to hire a licensed contractor to apply and complete the work. The same rule applies to plumbing.",
        sourceId: BOSTON_ELECTRICAL_PERMIT_SOURCE_KEY,
      },
      {
        question: "What does temporary service cost?",
        answer:
          "The sheet's own row: \"Electrical Temporary Service: $25.00 primary fee; $10.00 for each month up to six months then apply again.\" The $25.00 replaces the ordinary $20.00 application fee rather than adding to it; the monthly element is priced in months, which this calculator does not count, so it is named on the page instead of charged.",
        sourceId: BOSTON_ISD_FEES_SOURCE_KEY,
      },
      {
        question: "Is there a plan review fee on an electrical permit?",
        answer:
          "Not in Boston's text. No plan review percentage, technology fee or state surcharge appears on ISD's fee sheet or on the electrical permit page, and searches for those phrases come back empty. What the sheet does charge beside the rates is the DOUBLE FEE for work started without a permit, and the City's pages add that all fees are due upfront.",
        sourceId: BOSTON_ELECTRICAL_PERMIT_SOURCE_KEY,
      },
    ],
    seoTitle: "Boston electrical permit cost: $20 + a usage-based rate",
    seoDescription:
      "Boston electrical permit fees — $20.00 to apply, $0.25 or $0.75 an ampere on a service change by voltage, $1.00 a device plus $5.00 a meter with no service change, $10.00 per $1,000 where neither applies, and the $25.00 temporary service row.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: BOSTON_LAST_VERIFIED,
  },
  {
    jurisdictionKey: BOSTON_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    slug: "plumbing-permit-cost",
    title: "Boston plumbing permit cost",
    intro:
      "A Boston plumbing permit is **$20.00 plus $5.00 for each fixture** — the sheet's entire plumbing row, and the City's page restates it as \"$20, plus $5 per fixture\". There is no allowance, no ceiling and no cost ladder behind it: five fixtures come to $45.00, eight to $60.00, and a permit whose fixture count has not been supplied still carries the $20.00 application fee. Only a licensed contractor may apply, and the contractor must be the one doing the work.",
    localSummary:
      "The count is the whole fee. ISD's sheet prints one line — \"Plumbing: $20.00 primary fee plus $5.00 each fixture\" — and boston.gov gives it examples, \"such as toilets and sinks\": a five-fixture bathroom is $20.00 plus $25.00, or $45.00, and an eight-fixture rough-in is $20.00 plus $40.00, or $60.00. Every fixture is charged individually from the first one, which is the opposite of the block a neighbouring city prices — Cambridge charges $50.00 for up to five fixtures and $5.00 for each one after them — and both are asserted in their own tests.\n\nNothing else rides on this row. Sprinkler work is a separate line on the same sheet at $20.00 plus $1.00 a head, gasfitting another at $20.00 plus $5.00 an appliance meter, and the only inspection price the sheet prints is the Off Hour Inspection at $250.00, which is after-hours attendance rather than a re-inspection — so no re-inspection fee and no sprinkler head is charged on this page.\n\nAs with the rest of Boston's schedule, no plan review percentage, no technology fee and no state surcharge exists to add: searches of the sheet and the permit pages come back empty, and Massachusetts levies nothing of its own on a local permit. Fees are due upfront, work must start within six months, and starting early doubles the fee under the sheet's DOUBLE FEE.",
    notIncluded:
      "This is ISD's plumbing row — a $20.00 application fee and $5.00 a fixture. It excludes:\n\n- **Sprinkler and gasfitting work**, which the same sheet prices on their own rows: sprinkler at $20.00 plus $1.00 a head, and gasfitting at $20.00 plus $5.00 an appliance meter with $.09 per 1,000 BTU for boilers and furnaces, $50.00 for each furnace, and the stored-gas and propane rows. Fire alarm and sprinkler permitting is largely Fire Prevention's, and the permitting hub links there.\n- **Re-inspection and after-hours fees.** The sheet's only inspection price is the Off Hour Inspection at $250.00 (with the Off Hour Application at $100.00 an event); it prints no plumbing re-inspection fee at all, so none is invented here.\n- **The DOUBLE FEE** for work started without a permit or on an undervalued estimate — a doubling rather than a charge, printed in capitals on the sheet.\n- **Plan review, technology and state surcharges — none exist** in this jurisdiction's text, on the sheet or on the permit page.\n- **Water and sewer charges from the City**, which are utility charges rather than permit fees, and **other agencies' approvals** — fire protection plans, and Parks and Recreation for work within 100 feet of a park or parkway.\n- **Contractor licensing**, which is a requirement rather than a fee: plumbing permits are available to licensed contractors only.",
    workedExample: {
      scenario:
        "Re-plumbing a first-floor bathroom on one permit — tub, lavatory, toilet, dishwasher and kitchen sink, five fixtures in all.",
      inputs: { fixtures: 5 },
      notes:
        "The sheet's plumbing row is two numbers: a $20.00 primary fee and $5.00 for each fixture. Five fixtures are $25.00 of rate, so the permit is $45.00.\n\nThere is no allowance and no ceiling to read: the sixth fixture costs another $5.00, so eight fixtures are $20.00 plus $40.00, or $60.00, and a permit with no count supplied carries the $20.00 alone. The fee does not touch a valuation at all — plumbing is the one of these three pages where the cost of the work is never an input.\n\nCambridge, a few miles west, prices the same five fixtures differently: $50.00 for up to five and $5.00 for each one after them, which is $50.00 for this job against Boston's $45.00. Both readings are asserted in their cities' tests.",
    },
    faqs: [
      {
        question: "How much is a plumbing permit in Boston?",
        answer:
          "$20.00 plus $5.00 for each fixture — that is the whole row. Five fixtures are $45.00, eight are $60.00, and a permit with no fixture count supplied still carries the $20.00 application fee. There is no cost ladder, no allowance and no ceiling, and no plan review or technology fee to add.",
        sourceId: BOSTON_PLUMBING_PERMIT_SOURCE_KEY,
      },
      {
        question: "What counts as a fixture?",
        answer:
          "The fixtures the plumbing work installs — the City's own examples are \"toilets and sinks\", and the sheet charges each one at $5.00 from the first. The count is the entire variable part of the fee, which is why the page asks for fixtures rather than for a valuation: plumbing is the one of Boston's three permits where the cost of the work is never an input.",
        sourceId: BOSTON_ISD_FEES_SOURCE_KEY,
      },
      {
        question: "Do I need a licensed contractor for a plumbing permit?",
        answer:
          "Yes. The permit page states \"Plumbing permits are available to licensed contractors only\" and \"The permit applicant must be the contractor performing the work\"; a homeowner \"must hire a licensed contractor to apply for the permit and complete the work\". The same rule applies to electrical permits.",
        sourceId: BOSTON_PLUMBING_PERMIT_SOURCE_KEY,
      },
      {
        question: "Does this fee cover sprinklers or gas work?",
        answer:
          "No. ISD's sheet prices those on their own rows — sprinkler at $20.00 plus $1.00 a head, and gasfitting at $20.00 plus $5.00 an appliance meter, $.09 per 1,000 BTU for boilers and furnaces, $50.00 for each furnace and the stored-gas and propane rows — and fire alarm and sprinkler permitting is largely Fire Prevention's, whose forms the permitting hub links to. This page prices the plumbing row only.",
        sourceId: BOSTON_ISD_FEES_SOURCE_KEY,
      },
      {
        question: "When is the fee paid, and how long do I have to start?",
        answer:
          "Upfront: both permit pages say all fees are due when you file, online in the portal or in person at 1010 Massachusetts Avenue, 5th Floor. Work must start within six months of issuance, with a possible 180-day extension for some project types, and starting before the permit issues is the sheet's DOUBLE FEE — ISD \"may: charge double the permit cost\".",
        sourceId: BOSTON_PLUMBING_PERMIT_SOURCE_KEY,
      },
    ],
    seoTitle: "Boston plumbing permit cost: $20 + $5 per fixture",
    seoDescription:
      "Boston plumbing permit fees — ISD's $20.00 application fee plus $5.00 for each fixture, $45.00 for five and $60.00 for eight, licensed-contractor-only filings, and no plan review or technology surcharge.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: BOSTON_LAST_VERIFIED,
  },
];

const verifications: SeedVerification[] = [
  {
    entityType: "source",
    entityKey: BOSTON_ISD_FEES_SOURCE_KEY,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: BOSTON_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BOSTON_ISD_FEES_SOURCE_KEY,
    notes:
      "Read 2026-09-25 as ISD's own two-page PDF, 263,477 bytes, with its department block printed at the foot of both pages. Extracted twice — the table-preserving mode mispairs the two columns, the reading-order mode pairs them — and every row the four live permit pages share matches the transcription. The stamp is Rev. 2021; the document prints no effective date.",
  },
  {
    entityType: "source",
    entityKey: BOSTON_SHORT_FORM_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: BOSTON_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BOSTON_SHORT_FORM_SOURCE_KEY,
    notes:
      "Read 2026-09-25 for the definition of a minor alteration, the $20-plus-$10 fee line stated twice, the application attachments, the upfront payment rule and the double-fee warning — the page's own words against the sheet's row.",
  },
  {
    entityType: "source",
    entityKey: BOSTON_LONG_FORM_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: BOSTON_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BOSTON_LONG_FORM_SOURCE_KEY,
    notes:
      "Read 2026-09-25 for the major-alteration definition, the $50-plus-$10 fee line stated twice, and the subcategory list — Amendment and Use of Premise as Long-Form filing types — which is what ties the sheet's rows to one application type each.",
  },
  {
    entityType: "source",
    entityKey: BOSTON_PLUMBING_PERMIT_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: BOSTON_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BOSTON_PLUMBING_PERMIT_SOURCE_KEY,
    notes:
      "Read 2026-09-25 for \"$20, plus $5 per fixture\" and its prose restatement with examples, and for the licensed-contractor rule the sheet does not carry.",
  },
  {
    entityType: "source",
    entityKey: BOSTON_ELECTRICAL_PERMIT_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: BOSTON_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BOSTON_ELECTRICAL_PERMIT_SOURCE_KEY,
    notes:
      "Read 2026-09-25 for all three branches in the City's web words, including the voltage wording that differs from the PDF's — \"over 480 volts\" against \"up to 480 Volts\" — and the licensed-contractor rule.",
  },
  {
    entityType: "source",
    entityKey: BOSTON_PERMITTING_HUB_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: BOSTON_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BOSTON_PERMITTING_HUB_SOURCE_KEY,
    notes:
      "Read 2026-09-25 for the City's statement of what its permitting site covers and for the boundary it draws: ISD's portal and Permit Finder on one side, Fire Prevention's own forms and fees on the other.",
  },
  {
    entityType: "source",
    entityKey: BOSTON_ISD_DEPARTMENT_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: BOSTON_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BOSTON_ISD_DEPARTMENT_SOURCE_KEY,
    notes:
      "Read 2026-09-25 for the contact block the fee sheet prints in short form: 617-635-5300, isd@boston.gov, Monday through Friday 8 a.m. to 4 p.m., and the Zoning Board of Appeal link that frames the Nominal Fee row.",
  },
  {
    entityType: "fee_schedule",
    entityKey: BOSTON_KEYS.feeSchedule,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: BOSTON_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BOSTON_ISD_FEES_SOURCE_KEY,
    notes:
      "Dated to Rev. 2021 — the only date the document prints — with effectiveFrom recording the 2021-10 month boston.gov serves the file from, because no enactment date exists to record. The four live permit pages carry no date of their own and were read as the City's restatement of the same schedule; no later revision was found on this pass.",
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-SHORT-FORM",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: BOSTON_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BOSTON_ISD_FEES_SOURCE_KEY,
    notes:
      "\"Short Form Building: (Minor Alteration) — $20.00 primary fee plus $10.00 per $1,000.00 of the estimated cost of work\", confirmed twice on boston.gov as \"$20, plus $10 per $1,000 of estimated cost\" and \"$20 application fee and $10 per every $1,000 of the work estimate\". No \"or fraction thereof\" anywhere on the sheet, so the rate is charged on the exact cost — asserted at $47,550 in the content test.",
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-LONG-FORM",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: BOSTON_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BOSTON_ISD_FEES_SOURCE_KEY,
    notes:
      "\"Long Form Building: (1-3 family) (Major Alteration) — $50.00 primary fee plus $10.00 per $1,000.00 of the estimated cost of work\", confirmed on boston.gov as \"$50, plus $10 per $1,000 of estimated work cost\". Same ladder as the Short Form, $30.00 more at any cost.",
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-CHANGE-OF-OCCUPANCY-OTHER",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: BOSTON_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BOSTON_ISD_FEES_SOURCE_KEY,
    notes:
      "\"Changes of Occupancy: 3 Family and under $20.00 / 4 Family and up $50.00 / Commercial $50.00\" — the two larger categories are one amount, so they are one rule written as not_in the three-or-fewer category, which also matches an absent category at the schedule's larger figure.",
  },
  {
    entityType: "fee_rule",
    entityKey: "ELEC-SERVICE-240V",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: BOSTON_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BOSTON_ISD_FEES_SOURCE_KEY,
    notes:
      "\"1) $20.00 Application fee plus $.25 amp up to 240 Volts\", with boston.gov's \"$0.25/amp up to 240 volts\" beside it. Modelled as an exact rate of 25 cents on the amperage basis, gated so an absent voltage lands in this band — the common residential case — and paired with the $0.75 band above 240 volts, the union of the PDF's and the web's wording.",
  },
  {
    entityType: "fee_rule",
    entityKey: "ELEC-DEVICES",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: BOSTON_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BOSTON_ISD_FEES_SOURCE_KEY,
    notes:
      "\"$20.00 Application fee plus $1.00 each fixture, plug or outlet\" — three device types at one price, so one blended count rather than the plumbing fixtures namespace. Gated off a service change, because the branches are the sheet's own words.",
  },
  {
    entityType: "fee_rule",
    entityKey: "PLUMB-FIXTURES",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: BOSTON_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BOSTON_PLUMBING_PERMIT_SOURCE_KEY,
    notes:
      "\"$5.00 each fixture\" on the sheet and \"$5 for each fixture, such as toilets and sinks\" on boston.gov — no allowance, no ceiling, charged from the first fixture. Asserted at five and eight fixtures in the content test.",
  },
  {
    entityType: "permit_page",
    entityKey: "building-permit-cost",
    permitTypeKey: "building",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: BOSTON_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BOSTON_ISD_FEES_SOURCE_KEY,
    notes:
      "Five rows and one ladder, with the worked example as arithmetic on the sheet: $47,500 on a Short Form is $20.00 plus $475.00 — $495.00 — and the same job as a Long Form is $525.00. The page states the proration ($47,550 pays $495.50), the absence of plan review, technology and state lines, and the DOUBLE FEE.",
  },
  {
    entityType: "permit_page",
    entityKey: "electrical-permit-cost",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: BOSTON_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BOSTON_ELECTRICAL_PERMIT_SOURCE_KEY,
    notes:
      "The three branches in the City's own words, the worked example ($20.00 plus 200 amperes at $0.25 — $70.00), the device and cost fallbacks, and the voltage discrepancy printed rather than reconciled: PDF \"up to 480 Volts\" against web \"over 480 volts\", charged as one band above 240 volts.",
  },
  {
    entityType: "permit_page",
    entityKey: "plumbing-permit-cost",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: BOSTON_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BOSTON_PLUMBING_PERMIT_SOURCE_KEY,
    notes:
      "The two-number row with the worked example ($20.00 plus five fixtures at $5.00 — $45.00), the licensed-contractor rule, the named sprinkler and gasfitting rows it does not charge, and the contrast with Cambridge's $50-for-five block.",
  },
  {
    entityType: "jurisdiction_profile",
    entityKey: BOSTON_KEYS.jurisdiction,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: BOSTON_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BOSTON_ISD_FEES_SOURCE_KEY,
    notes:
      "Hub content built from ISD's Rev. 2021 sheet, the four permit pages, the permitting hub and the department page. The profile states the readings the model depends on — one row per application type, proration because \"or fraction thereof\" is never printed, the three electrical branches, and the absence of plan review, technology and state lines — and names every row of the sheet it does not charge.",
  },
];

export const bostonSeed: JurisdictionSeed = {
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
export const BOSTON_PUBLISHED_PERMIT_PAGES = bostonSeed.permitPages.filter(
  (page) => page.publishStatus === "published" && !page.noindex,
);
