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
  MANCHESTER_BUILDING_BASE_RULES,
  MANCHESTER_BUILDING_CODE_SOURCE_KEY,
  MANCHESTER_ELECTRICAL_BASE_RULES,
  MANCHESTER_ELECTRICAL_FORM_SOURCE_KEY,
  MANCHESTER_FEE_EFFECTIVE_FROM,
  MANCHESTER_FEES_PAGE_SOURCE_KEY,
  MANCHESTER_FORM_EFFECTIVE_FROM,
  MANCHESTER_HEATING_FORM_SOURCE_KEY,
  MANCHESTER_PERMIT_APPS_SOURCE_KEY,
  MANCHESTER_PLUMBING_BASE_RULES,
  MANCHESTER_PLUMBING_FORM_SOURCE_KEY,
} from "./fee-rules";

export * from "./fee-rules";

/**
 * The complete Manchester, New Hampshire seed payload.
 *
 * Every figure traces to research/new-hampshire/manchester.md, which traces to the City's
 * own Building Code and its permit forms. Nothing is estimated.
 *
 * Three pages, all published, and all three rest on the same schedule: Manchester's fees
 * are in Section 109.8 of the Building Code of the City of Manchester adopted July 6, 2021,
 * not in a separate fee document — Sec. 151.10.4 sends every permit fee there — so the
 * building, electrical and plumbing pages cite the same ordinance section for their own
 * rows.
 */

const RESEARCHER = "Permit Fee Intelligence research pass 10 (New Hampshire)";

export const MANCHESTER_LAST_VERIFIED = "2026-09-25";

export const MANCHESTER_KEYS = {
  state: "nh",
  county: "hillsborough-county",
  jurisdiction: "manchester",
  feeSchedule: "manchester-building-code-1098-schedule",
} as const;

const state: SeedState = {
  code: "NH",
  slug: "new-hampshire",
  name: "New Hampshire",
  fipsCode: "33",
};

const county: SeedCounty = {
  key: MANCHESTER_KEYS.county,
  slug: "hillsborough-county",
  name: "Hillsborough County",
  fipsCode: "33011",
};

const jurisdiction: SeedJurisdiction = {
  key: MANCHESTER_KEYS.jurisdiction,
  stateKey: MANCHESTER_KEYS.state,
  countyKey: MANCHESTER_KEYS.county,
  type: "city",
  slug: "manchester",
  name: "Manchester",
  officialName: "City of Manchester",
  websiteUrl: "https://www.manchesternh.gov/",
  permitPortalUrl: "https://www.manchesternh.gov/Departments/Planning-and-Comm-Dev/Building",
  timezone: "America/New_York",
  isActive: true,
};

const departments: SeedDepartment[] = [
  {
    key: "manchester-pcd-building",
    jurisdictionKey: MANCHESTER_KEYS.jurisdiction,
    kind: "building",
    name: "Planning and Community Development — Building Regulations Division",
    phone: "(603) 624-6475",
    email: "pcd@manchesternh.gov",
    url: "https://www.manchesternh.gov/Departments/Planning-and-Comm-Dev/Building",
    addressLine: "One City Hall Plaza, Manchester, NH 03101",
    hours: "Monday to Friday, 7:30 AM to 5:00 PM",
    notes:
      "Issues and inspects building, electrical, plumbing and heating permits for the City, and is the department the fee schedule is administered by. Trade permit applications are printed, signed and mailed or emailed rather than filed through a portal.",
  },
];

const sources: SeedSource[] = [
  {
    key: MANCHESTER_BUILDING_CODE_SOURCE_KEY,
    jurisdictionKey: MANCHESTER_KEYS.jurisdiction,
    title:
      'Building Code of the City of Manchester, Section 109 "Fees", including the Fee Schedule at IBC Sec. 109.8',
    url: "https://www.manchesternh.gov/pcd/Regulations/BuildingCode.pdf",
    sourceType: "municipal_code",
    issuingAuthority: "City of Manchester",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2021-07-06",
    effectiveFrom: MANCHESTER_FEE_EFFECTIVE_FROM,
    retrievedAt: MANCHESTER_LAST_VERIFIED,
    lastVerifiedAt: MANCHESTER_LAST_VERIFIED,
    notes:
      "Read 2026-09-25 as a PDF. Adopted July 6, 2021, and the operative ordinance: Sec. 151.10.4 states that \"fees for any and all permits issued under the Building Code are defined in the Fee Table inserted as an amendment to the International Building Code at Section 109.8\". Carries the building, plan-review, demolition, sign, storage-tank, heating, gas-piping, electrical and plumbing rows, the $25.00 application fee, the $30.00 minimum permit fee, the re-inspection minimum and the refund rule.",
  },
  {
    key: MANCHESTER_FEES_PAGE_SOURCE_KEY,
    jurisdictionKey: MANCHESTER_KEYS.jurisdiction,
    title: "Building Fees — City of Manchester",
    url: "https://www.manchesternh.gov/Departments/Planning-and-Comm-Dev/Building/Fees",
    sourceType: "municipal_website",
    issuingAuthority: "City of Manchester, Planning and Community Development",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: MANCHESTER_LAST_VERIFIED,
    lastVerifiedAt: MANCHESTER_LAST_VERIFIED,
    notes:
      "Read 2026-09-25. Restates the building rows — \".006\" for a new one- or two-family dwelling, \".01\" for all other new construction, additions, alterations, renovations and repairs — and adds the plan review rate of \".02 per square foot ... for all multi-family and commercial building permit applications\". Corroborates the Building Code rather than replacing it.",
  },
  {
    key: MANCHESTER_PERMIT_APPS_SOURCE_KEY,
    jurisdictionKey: MANCHESTER_KEYS.jurisdiction,
    title: "Permit Applications — City of Manchester",
    url: "https://www.manchesternh.gov/Departments/Planning-and-Comm-Dev/Building/Permit-Applications",
    sourceType: "municipal_website",
    issuingAuthority: "City of Manchester, Planning and Community Development",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: MANCHESTER_LAST_VERIFIED,
    lastVerifiedAt: MANCHESTER_LAST_VERIFIED,
    notes:
      "Read 2026-09-25. The trade applications and the licensing requirement behind them: \"all multi-family dwellings, non owner-occupied single family dwellings and commercial projects require a licensed NH Master electrician\", and a licensed New Hampshire plumber for plumbing. States that trade applications \"must be printed, signed and submitted to the Planning and Community Development Department by mail along with the appropriate fees\".",
  },
  {
    key: MANCHESTER_ELECTRICAL_FORM_SOURCE_KEY,
    jurisdictionKey: MANCHESTER_KEYS.jurisdiction,
    title: "Application for Electrical Permit, City of Manchester (form effective 09/02/14)",
    url: "https://www.manchesternh.gov/pcd/Forms/ElectricalPermit.pdf",
    sourceType: "other",
    issuingAuthority: "City of Manchester, Building Regulations Division",
    authorityKind: "city",
    isPrimary: true,
    documentDate: MANCHESTER_FORM_EFFECTIVE_FROM,
    effectiveFrom: MANCHESTER_FORM_EFFECTIVE_FROM,
    retrievedAt: MANCHESTER_LAST_VERIFIED,
    lastVerifiedAt: MANCHESTER_LAST_VERIFIED,
    notes:
      "Read 2026-09-25 as a PDF. Its arithmetic column reproduces Sec. 109.8 item 11 line for line and prints the minimum as \"$30 MINIMUM FEE + $25 APPLICATION FEE: $55.00\" — the sentence this site's model reproduces exactly.",
  },
  {
    key: MANCHESTER_PLUMBING_FORM_SOURCE_KEY,
    jurisdictionKey: MANCHESTER_KEYS.jurisdiction,
    title: "Application for Plumbing Permit, City of Manchester (form effective 09/02/14)",
    url: "https://www.manchesternh.gov/pcd/Forms/PlumbingPermit.pdf",
    sourceType: "other",
    issuingAuthority: "City of Manchester, Building Regulations Division",
    authorityKind: "city",
    isPrimary: true,
    documentDate: MANCHESTER_FORM_EFFECTIVE_FROM,
    effectiveFrom: MANCHESTER_FORM_EFFECTIVE_FROM,
    retrievedAt: MANCHESTER_LAST_VERIFIED,
    lastVerifiedAt: MANCHESTER_LAST_VERIFIED,
    notes:
      "Read 2026-09-25 as a PDF. Prints \"ESTIMATED COST OF JOB $____ X .015\" above its itemised plumbing list, which is Sec. 109.8 item 9(B); the itemised column itself carries no rates, and the current code does not publish one either.",
  },
  {
    key: MANCHESTER_HEATING_FORM_SOURCE_KEY,
    jurisdictionKey: MANCHESTER_KEYS.jurisdiction,
    title: "Application for Heating Permit, City of Manchester (form effective 09/02/14)",
    url: "https://www.manchesternh.gov/pcd/Forms/HeatingPermit.pdf",
    sourceType: "other",
    issuingAuthority: "City of Manchester, Building Regulations Division",
    authorityKind: "city",
    isPrimary: true,
    documentDate: MANCHESTER_FORM_EFFECTIVE_FROM,
    effectiveFrom: MANCHESTER_FORM_EFFECTIVE_FROM,
    retrievedAt: MANCHESTER_LAST_VERIFIED,
    lastVerifiedAt: MANCHESTER_LAST_VERIFIED,
    notes:
      "Read 2026-09-25 as a PDF and again through its text coordinates, because its two-column table renders with the rate column shifted by one row. Its heating, gas piping, ductwork and storage-tank rows agree item for item with Sec. 109.8 item 8, which is what settled the pairing: the form's own order gives $75.00 for a commercial installation up to 100,000 BTU and $30.00 for a burner replacement alone, both of which the code prints. Heating is transcribed and not attached to a page, because Manchester's third page is plumbing.",
  },
];

/** Empty on purpose: the permit types Manchester uses already exist as shared rows. */
const permitTypes: JurisdictionSeed["permitTypes"] = [];
const projectTypes: JurisdictionSeed["projectTypes"] = [];

const jurisdictionPermitTypes: SeedJurisdictionPermitType[] = [
  {
    jurisdictionKey: MANCHESTER_KEYS.jurisdiction,
    permitTypeKey: "building",
    isAvailable: true,
    localName: "Building permit",
    officialUrl: "https://www.manchesternh.gov/Departments/Planning-and-Comm-Dev/Building/Permit-Applications",
    notes:
      "Priced from the certified estimated cost of the work: .006 for a new one- or two-family dwelling, .010 for every other new building, addition, alteration, renovation or repair, plus a $25.00 application fee, a $30.00 minimum permit fee and, for everything except one- and two-family dwellings and accessory structures, plan review at $0.02 per square foot.",
  },
  {
    jurisdictionKey: MANCHESTER_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    isAvailable: true,
    localName: "Electrical permit",
    officialUrl: "https://www.manchesternh.gov/pcd/Forms/ElectricalPermit.pdf",
    notes:
      "Separate application, and a separate rate from the building permit: $100.00 for a new one-unit residential installation plus $75.00 per additional unit, .01 of calculated cost for residential alterations, .015 for commercial work, and a three-band schedule for low voltage and control wiring.",
  },
  {
    jurisdictionKey: MANCHESTER_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    isAvailable: true,
    localName: "Plumbing permit",
    officialUrl: "https://www.manchesternh.gov/pcd/Forms/PlumbingPermit.pdf",
    notes:
      "Issued under the same schedule: $150.00 for a new one-unit residential dwelling plus $100.00 per additional unit, and .015 of the calculated cost of the work for everything else.",
  },
  {
    jurisdictionKey: MANCHESTER_KEYS.jurisdiction,
    permitTypeKey: "mechanical",
    isAvailable: true,
    localName: "Heating permit",
    officialUrl: "https://www.manchesternh.gov/pcd/Forms/HeatingPermit.pdf",
    notes:
      "Required for heating, cooling, ventilation, gas piping and burner work, and priced row by row in Sec. 109.8 item 8 — $40.00 for a residential system serving one dwelling unit, $75.00 for a commercial installation up to 100,000 BTU plus $0.20 per additional 1,000 BTU, $4.00 per gas outlet and $20.00 for the first fifty lineal feet of gas piping. Published, transcribed in the research record, and not attached to a page on this site.",
  },
];

const feeSchedules: SeedFeeSchedule[] = [
  {
    key: MANCHESTER_KEYS.feeSchedule,
    jurisdictionKey: MANCHESTER_KEYS.jurisdiction,
    sourceKey: MANCHESTER_BUILDING_CODE_SOURCE_KEY,
    title: "Building Code of the City of Manchester, Sec. 109.8 — Fee Schedule",
    officialUrl: "https://www.manchesternh.gov/pcd/Regulations/BuildingCode.pdf",
    effectiveFrom: MANCHESTER_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: MANCHESTER_LAST_VERIFIED,
    notes:
      "One schedule for every permit the City issues, adopted July 6, 2021 with the Building Code. The trade forms dated 09/02/14 are the same rows in application form, and the two agree.",
  },
];

function attach(permitTypeKey: string, rules: SeedFeeRule["rule"][]): SeedFeeRule[] {
  return rules.map((rule) => ({
    jurisdictionKey: MANCHESTER_KEYS.jurisdiction,
    permitTypeKey,
    scheduleKey: MANCHESTER_KEYS.feeSchedule,
    rule,
  }));
}

const feeRules: SeedFeeRule[] = [
  ...attach("building", MANCHESTER_BUILDING_BASE_RULES),
  ...attach("electrical", MANCHESTER_ELECTRICAL_BASE_RULES),
  ...attach("plumbing", MANCHESTER_PLUMBING_BASE_RULES),
];

const requirements: SeedRequirement[] = [
  {
    jurisdictionKey: MANCHESTER_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "document",
    title: "A certified estimated cost of the work",
    description:
      "Sec. 109.3(A): where the fee is based on the cost of the work, \"such costs shall be the estimated cost as certified by the owner or by the authorized representative of the owner, and as approved by the building official\". Sec. 109.3(B) defines what that cost includes — gross square footage of the building, \"all permanent structural, electrical, plumbing and mechanical systems, interior and exterior finish, site work, overhead and profit\" — and lets the building official substitute a Type of Construction Method if the figure is underestimated.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: MANCHESTER_BUILDING_CODE_SOURCE_KEY,
    lastVerifiedAt: MANCHESTER_LAST_VERIFIED,
  },
  {
    jurisdictionKey: MANCHESTER_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "document",
    title: "A site or plot plan, drawn to scale",
    description:
      "The Building Regulations Division asks for a site or plot plan for the permitting of outdoor projects, \"drawn to scale with all setback information noted\", and publishes a sample residential plan. Sec. 110.7 of the Building Code requires new work to be located strictly in accordance with the approved site plan and, for foundations and footings, certification by a New Hampshire Registered Land Surveyor.",
    isMandatory: true,
    sortOrder: 20,
    sourceKey: MANCHESTER_PERMIT_APPS_SOURCE_KEY,
    lastVerifiedAt: MANCHESTER_LAST_VERIFIED,
  },
  {
    jurisdictionKey: MANCHESTER_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "license",
    title: "A licensed New Hampshire master electrician on multi-family, commercial and non-owner-occupied work",
    description:
      "The application page: \"all multi-family dwellings, non owner-occupied single family dwellings and commercial projects require a licensed NH Master electrician\". An owner-occupant of a single-family dwelling may apply for their own electrical permit.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: MANCHESTER_PERMIT_APPS_SOURCE_KEY,
    lastVerifiedAt: MANCHESTER_LAST_VERIFIED,
  },
  {
    jurisdictionKey: MANCHESTER_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    requirementType: "license",
    title: "A licensed New Hampshire plumber on multi-family, commercial and non-owner-occupied work",
    description:
      "\"When submitting an application, please note that all multi-family dwellings, non owner-occupied single family dwellings and commercial projects require a licensed NH plumber.\" The plumbing application carries a Licence No. and expiry field beside the signature.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: MANCHESTER_PLUMBING_FORM_SOURCE_KEY,
    lastVerifiedAt: MANCHESTER_LAST_VERIFIED,
  },
  {
    jurisdictionKey: MANCHESTER_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    requirementType: "other",
    title: "The application is filed on paper, and the fee is charged with it",
    description:
      "Trade permit applications \"must be printed, signed and submitted to the Planning and Community Development Department by mail along with the appropriate fees\", and the City does not accept them electronically. The forms warn that \"any fees calculated are subject to change upon review of the application\", which is what the $25.00 non-refundable application fee pays for.",
    isMandatory: true,
    sortOrder: 20,
    sourceKey: MANCHESTER_PERMIT_APPS_SOURCE_KEY,
    lastVerifiedAt: MANCHESTER_LAST_VERIFIED,
  },
];

const profile: SeedProfile = {
  jurisdictionKey: MANCHESTER_KEYS.jurisdiction,
  headline: "What construction permits cost in Manchester",
  summary:
    "Manchester prices most permits as a percentage of the certified estimated cost of the work: .006 for a new one- or two-family dwelling, .010 for every other new building, addition, alteration or repair, .015 for commercial electrical and for plumbing that is not a new house, and .01 for residential electrical modifications. Low-voltage wiring, demolition and residential new construction are priced by the item instead. Every permit carries a $25.00 non-refundable application fee and a $30.00 minimum, which together are the $55.00 the City's own forms print.",
  localContext:
    "Three things about Manchester are worth reading before any number here.\n\nThe first is that the fees are in the Building Code itself. There is no separate fee schedule document to hunt for: Sec. 151.10.4 of the Building Code of the City of Manchester says that \"fees for any and all permits issued under the Building Code are defined in the Fee Table inserted as an amendment to the International Building Code at Section 109.8\", and Section 109.8 is a ten-page schedule covering building, demolition, signs, storage tanks, heating, gas piping, electrical wiring, plumbing and elevators. Since 2021 Manchester enforces the State Building Code adopted under RSA 155-A with local amendments, and the fee table is one of those amendments.\n\nThe second is the minimum, and the way it composes. The schedule says there \"shall be a $25.00 non-refundable application fee for all permits\" and \"a minimum permit fee of $30.00 for all permits requiring inspections\", and the City's Electrical and Plumbing applications print the arithmetic as one line: \\\"$30 MINIMUM FEE + $25 APPLICATION FEE: $55.00\\\". The two add rather than net, which matters for a small job and is why the calculator here treats the application fee as a charge on top of the permit fee rather than part of it. It also means a $400 job and a $2,000 job can cost the same $55.00.\n\nThe third is that the trades are not symmetric, and the pages here do not pretend they are. New residential electrical work is priced by the dwelling unit — $100.00 for the first, $75.00 for each additional — while new residential plumbing is a different flat pair, $150.00 and $100.00. Alterations run the other way: residential electrical work is .01 of cost, plumbing is .015 of cost, and commercial electrical work is .015. The one shape all three share is the application fee, the $30.00 minimum, and a re-inspection fee of at least $30.00 when an inspector has to come back.",
  valuationBasis:
    "Manchester prices from the **estimated cost of the work**, which Sec. 109.3(A) defines as \"the estimated cost as certified by the owner or by the authorized representative of the owner, and as approved by the building official\". Sec. 109.3(B) says that cost applies to the gross square footage of the building and \"shall include all permanent structural, electrical, plumbing and mechanical systems, interior and exterior finish, site work, overhead and profit\" — so it is a project cost, not a construction contract price. If the building official thinks the figure is low, the same section lets them use \"a Type of Construction Method based on aggregate floor area or any other reasonable method based on industry standards\".\n\nThis site never substitutes a square-foot rate for a valuation, and Manchester does not publish one. Plan review is the exception in form rather than in kind: it is charged at $0.02 per square foot of building area rather than per dollar of cost, and it is a separate fee that is not counted toward the $30.00 minimum.",
  notIncluded:
    "These figures are Manchester's building, electrical and plumbing permit fees as published in the City's Building Code, with the application fee and the minimum that attach to every permit. They are not a total project cost, and they exclude:\n\n- **Heating, ventilation and gas piping permits**, which Sec. 109.8 item 8 prices row by row — $40.00 for a residential system serving one dwelling unit, $50.00 for two, $75.00 for three to six, $125.00 for seven to twelve and $15.00 for each unit over twelve, $75.00 for a commercial installation up to 100,000 BTU plus $0.20 per additional 1,000 BTU, $30.00 for a burner replacement alone, $15.00 for other minor heating alterations, $20.00 for the first fifty lineal feet of gas piping plus $0.05 per foot after that, $4.00 per outlet, and $15.00 for ventilation ductwork up to 400 CFM plus $10.00 per additional 400 CFM. This site's third Manchester page is plumbing, not mechanical, so these are documented rather than modelled.\n- **Storage tanks** ($15.00 to $150.00 by gallonage), **signs** ($50.00 up to 50 square feet plus $1.50 per square foot over, $35.00 for a temporary sign), **foundation permits issued in advance** ($75.00 for a one- or two-family dwelling, $300.00 for anything else), **yard sale permits** ($5.00) and **bazaars** ($10.00).\n- **The elevator, escalator, dumbwaiter, conveyor and amusement-device table** in item 12, which runs from $20.00 for an amusement device to $150.00 for an initial compliance inspection on a device the State does not permit.\n- **The 100% surcharge for work started without a permit**, the **$300.00 appeal fee**, and the **$35.00 the City keeps** when an unstarted permit is returned for cancellation.\n- **The deferral for affordable housing** in Sec. 109.9, under which building permit fees, including subtrade permits, may be deferred to project completion.\n- **Plan review at $0.02 per square foot** is shown on the building page but not folded into the electrical or plumbing pages, because each was measured on its own application.\n- **Anything charged by another authority.** Manchester is a city inside Hillsborough County, and the State of New Hampshire licenses the trades, charges its own fees, and runs the building permit programme for projects it covers rather than the City.",
  seoTitle: "Manchester construction permit fees",
  seoDescription:
    "How Manchester, New Hampshire prices building, electrical and plumbing permits — .006 and .010 of estimated cost, $0.02 per square foot of plan review, a $25.00 application fee and a $30.00 minimum, cited to the City's Building Code.",
  publishStatus: "published",
  noindex: false,
  lastReviewedAt: MANCHESTER_LAST_VERIFIED,
};

const permitPages: SeedPermitPage[] = [
  {
    jurisdictionKey: MANCHESTER_KEYS.jurisdiction,
    permitTypeKey: "building",
    slug: "building-permit-cost",
    title: "Manchester building permit cost",
    intro:
      "Manchester charges a building permit as a percentage of the estimated cost of the work: .006 — six tenths of one percent — for a new one- or two-family dwelling, and .010 for every other new building, every addition, and every alteration, renovation or repair. A $25.00 non-refundable application fee is added to all permits, a $30.00 minimum permit fee applies to any permit requiring inspections, and buildings other than one- and two-family dwellings and accessory structures also pay plan review at $0.02 per square foot.",
    localSummary:
      "Manchester has two building rates and a wide gap between them, so the first question on any permit is which one applies. A new house is .006 of the certified cost; everything else — a commercial build-out, a two-family addition, a new roof, a kitchen remodel — is .010. On a $250,000 house that difference is $1,500.00 against $2,500.00, and the City's own fees page states both rates the same way.\n\nPlan review is the second thing people miss. It is $0.02 per square foot of building area, charged as a fee of its own rather than folded into the permit, and it applies to everything except one- and two-family dwellings and accessory structures. On a 20,000 square foot commercial building it is $400.00.\n\nThe application fee and the minimum are the third. Every permit pays the $25.00 application fee, and every permit requiring inspections is floored at $30.00 — which is why the City's own electrical and plumbing forms print a minimum of $55.00 for the smallest possible job.",
    notIncluded:
      "This is the Sec. 109.8 building rate, plus plan review where it applies, the application fee, the $30.00 minimum and the re-inspection fee if you ask for one. It excludes:\n\n- **Heating, gas piping and ventilation permits**, which are priced row by row in item 8 of the same schedule and are documented on this site rather than charged here.\n- **Demolition** as a priced option on the calculator's face: it is a published band ladder — $20.00 up to 1,000 square feet, $75.00 over 1,000 up to 5,000, $150.00 over 5,000 — and it is included in the rules, so a demolition permit priced here shows the band plus the application fee and the minimum.\n- **Signs** ($50.00 up to 50 sq ft plus $1.50 per square foot over, $35.00 temporary), **storage tanks** ($15.00 to $150.00 by gallonage), **foundation permits issued in advance** ($75.00 and $300.00), and **yard sales** ($5.00).\n- **Elevators, escalators, dumbwaiters, conveyors and amusement devices** — item 12, from $20.00 to $150.00 a device.\n- **The 100% surcharge where work started without a permit**, the **$300.00 appeal fee**, and the **$35.00 retention** on a refund under Sec. 109.6.\n- **Trade permits taken out separately** — electrical and plumbing are their own applications under the same schedule, and the fees of another authority, including the State of New Hampshire's, are not here.",
    workedExample: {
      scenario:
        "A commercial building project with a certified estimated construction cost of $750,000 and 20,000 square feet of building area.",
      inputs: { valuationCents: 75_000_000, squareFootage: 20_000 },
      notes:
        "The work is not a one- or two-family dwelling, so the rate is .010: $750,000 × 0.010 = $7,500.00. Plan review is $0.02 per square foot on 20,000 square feet, which is $400.00, and it is a separate fee rather than part of the permit. The $25.00 application fee is added, and the $30.00 minimum never comes into it because the permit fee is far above it.\n\nTwo things to carry away. The first is that the estimated cost is the City's basis, not a contract sum or a square-foot rate: Sec. 109.3 has the owner certify it and the building official approve it, and includes the trades, the finishes, site work, overhead and profit inside it. The second is that the same $750,000 spent on a new one- or two-family dwelling would be a $4,500.00 permit fee instead — the .006 rate is 40% lower, and it is the reason a reader should check which rate their project is under before comparing quotes.",
    },
    faqs: [
      {
        question: "What percentage does Manchester charge for a building permit?",
        answer:
          "It depends on the project. A new one- or two-family dwelling is the estimated cost of the work multiplied by .006. Every other new building or structure, every addition, and every alteration, renovation or repair is multiplied by .010.",
        sourceId: MANCHESTER_BUILDING_CODE_SOURCE_KEY,
      },
      {
        question: "Is there a minimum building permit fee in Manchester?",
        answer:
          "Yes — $30.00, described in the fee schedule as \"a minimum permit fee of $30.00 for all permits requiring inspections\". It is charged on top of the $25.00 non-refundable application fee, which is why the City's own trade forms print $55.00 as the smallest possible total.",
        sourceId: MANCHESTER_BUILDING_CODE_SOURCE_KEY,
      },
      {
        question: "How much is plan review?",
        answer:
          "$0.02 per square foot, for all buildings and structures other than one- and two-family dwellings and accessory structures. On a 20,000 square foot commercial building that is $400.00, and it is charged as a fee in addition to the permit rather than credited against it.",
        sourceId: MANCHESTER_BUILDING_CODE_SOURCE_KEY,
      },
      {
        question: "What is the estimated cost the fee is based on?",
        answer:
          "Sec. 109.3 defines it as the cost certified by the owner or their authorised representative and approved by the building official, covering the gross square footage of the building and including permanent structural, electrical, plumbing and mechanical systems, interior and exterior finish, site work, overhead and profit. If the building official thinks it is underestimated, they may calculate the cost themselves.",
        sourceId: MANCHESTER_BUILDING_CODE_SOURCE_KEY,
      },
      {
        question: "What happens if I start work before the permit is issued?",
        answer:
          "A surcharge of 100 percent of the permit fee is added to the permit, under Sec. 109.5(B) and again at Sec. 151.10.7. It is not a fine that replaces the permit — the permit is still required.",
        sourceId: MANCHESTER_BUILDING_CODE_SOURCE_KEY,
      },
      {
        question: "How much is a demolition permit?",
        answer:
          "$20.00 up to 1,000 square feet, $75.00 over 1,000 up to 5,000 square feet, and $150.00 over 5,000 square feet. The permit is subject to the same $25.00 application fee and $30.00 minimum as every other permit.",
        sourceId: MANCHESTER_BUILDING_CODE_SOURCE_KEY,
      },
    ],
    seoTitle: "Manchester NH building permit cost: .006 and .010 of estimated cost",
    seoDescription:
      "Manchester, New Hampshire building permit fees — .006 of estimated cost for a new one- or two-family dwelling, .010 for all other work, plan review at $0.02 per sq ft, a $25.00 application fee and a $30.00 minimum.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: MANCHESTER_LAST_VERIFIED,
  },
  {
    jurisdictionKey: MANCHESTER_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    slug: "electrical-permit-cost",
    title: "Manchester electrical permit cost",
    intro:
      "A Manchester electrical permit is priced by what the work is, not by one rate. A new one-unit residential installation is $100.00 with $75.00 for each additional unit; residential additions, renovations, alterations, repairs and replacements are the calculated cost of the work multiplied by .01; commercial work is multiplied by .015; and low voltage and control wiring — phone, TV, data, alarm, carbon monoxide detectors — has its own three-band schedule from $10.00 up to $2,000 of cost to .005 of anything above $25,000. Every electrical permit also carries the $25.00 non-refundable application fee and the $30.00 minimum, which the City's own form prints as $55.00.",
    localSummary:
      "Low-voltage wiring is the row most people get wrong, and it is the one that saves money. Where commercial electrical work is .015 of cost, a data and alarm installation of the same value is $10.00 up to $2,000, $75.00 from $2,001 to $25,000, and only .005 above $25,000. A $40,000 structured-cabling job is a $200.00 electrical permit rather than a $600.00 one.\n\nThe residential rows turn on whether the work is new or a modification. A brand new dwelling is priced per unit — $100.00 for the first, $75.00 for each one after — so a three-unit building is $250.00 no matter what it costs to wire. An alteration or replacement in the same building is .01 of the calculated cost instead, which on a $30,000 rewire is $300.00.\n\nCommercial work pays .015 of calculated cost. Manchester also requires a licensed New Hampshire master electrician on all multi-family, non-owner-occupied single-family and commercial work, and takes trade applications on paper: the forms are printed, signed and mailed with the fee rather than filed through a portal.",
    notIncluded:
      "This is Sec. 109.8 item 11 plus the application fee, the $30.00 minimum and the re-inspection fee. It excludes:\n\n- **Signs.** The application form prints a row for electrical signs at $10.00 each, but the current Building Code does not, and the code prices signs on the building side instead — $50.00 up to 50 square feet plus $1.50 per square foot over it. This page does not charge a sign fee, because the City's operative schedule does not.\n- **Heating and gas piping permits** — item 8 of the same schedule, including gas piping at $20.00 for the first fifty lineal feet and $4.00 an outlet.\n- **Elevators, escalators, amusement devices and special equipment** — item 12, which covers the power side of those installations as its own permit.\n- **The 100% surcharge where work started without a permit**, the **$300.00 appeal fee**, and the **$35.00 retention** on a refunded permit under Sec. 109.6.\n- **Re-inspection above the published minimum.** Sec. 109.5(A) sets the re-inspection fee at \"a minimum of $30.00\", so a second visit for a job that was not ready can cost more than the figure charged here.\n- **Licensing.** A New Hampshire master electrician's licence is a State charge, not a City permit fee, and the State's own permits and inspections for the work it covers are not part of this number.",
    workedExample: {
      scenario:
        "A commercial tenant fit-out: $180,000 of calculated electrical cost, with $25,000 of it low voltage and control wiring, and no other permit on the job.",
      inputs: { valuationCents: 18_000_000, custom: { commercial_work: true, low_voltage: true } },
      notes:
        "Both rates apply, because the low-voltage exclusion in item 11(B) only removes low-voltage work from the .015 rate — it does not remove it from the permit. The City's own convention is that the schedules are read together, so this site charges .015 on the commercial cost and lets the low-voltage band price the low-voltage portion; the figures below are the example's, and a filer whose form separates the two lines should confirm the split with the department.\n\n- Commercial electrical work: $180,000 × 0.015 = $2,700.00.\n- Low voltage: $25,000 of cost is in the second band, $2,001 to $25,000, which is $75.00.\n- Application fee: $25.00, added rather than netted, and the $30.00 minimum never applies because the permit fee is far above it.\n\nRead the other way — if the filer's form states the low-voltage work separately and the City charges .015 on the balance only — the same job is $155,000 × 0.015 = $2,325.00 plus $75.00 plus $25.00. That is a question about how a form is filled in rather than about the schedule, and it is worth asking the Building Regulations Division rather than assuming.",
    },
    faqs: [
      {
        question: "How much is an electrical permit for a new house in Manchester?",
        answer:
          "$100.00 for a new one-unit residential dwelling, plus $75.00 for each additional unit over one. The fee is priced by the dwelling unit rather than by the cost of the wiring, and the $25.00 application fee is added to it.",
        sourceId: MANCHESTER_ELECTRICAL_FORM_SOURCE_KEY,
      },
      {
        question: "What rate applies to a commercial electrical permit?",
        answer:
          "The calculated cost of the work multiplied by .015, for all new commercial buildings and their additions, renovations, alterations, repairs and replacements — except low voltage and control wiring, which has its own schedule.",
        sourceId: MANCHESTER_BUILDING_CODE_SOURCE_KEY,
      },
      {
        question: "How is low-voltage wiring priced?",
        answer:
          "In three bands: up to $2,000 of calculated cost is $10.00, over $2,000 to $25,000 is $75.00, and calculated cost above $25,000 is multiplied by .005. Phone, TV, data, alarm and carbon monoxide detector wiring are all in this row.",
        sourceId: MANCHESTER_ELECTRICAL_FORM_SOURCE_KEY,
      },
      {
        question: "What is the smallest electrical permit fee?",
        answer:
          "$55.00 — the $30.00 minimum permit fee plus the $25.00 application fee, which is the total the City's own electrical application prints at the foot of its fee column.",
        sourceId: MANCHESTER_ELECTRICAL_FORM_SOURCE_KEY,
      },
      {
        question: "Do I need a licensed electrician?",
        answer:
          "On multi-family dwellings, non-owner-occupied single-family dwellings and commercial projects, yes — the City requires a licensed New Hampshire Master electrician. An owner-occupant of a single-family dwelling applying for their own work is not in that list.",
        sourceId: MANCHESTER_PERMIT_APPS_SOURCE_KEY,
      },
    ],
    seoTitle: "Manchester NH electrical permit cost: per unit, per cost and per band",
    seoDescription:
      "Manchester, New Hampshire electrical permit fees — $100.00 per new residential unit, .01 and .015 of calculated cost, and low-voltage wiring from $10.00, with the $25.00 application fee and $30.00 minimum.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: MANCHESTER_LAST_VERIFIED,
  },
  {
    jurisdictionKey: MANCHESTER_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    slug: "plumbing-permit-cost",
    title: "Manchester plumbing permit cost",
    intro:
      "Manchester's plumbing permit is the simplest of its three trade fees and the one with the widest spread. A new residential dwelling of one unit costs a flat $150.00, with $100.00 for each additional unit. Everything else — other new buildings, additions, renovations, alterations, repairs and replacements — costs the calculated cost of the work multiplied by .015, which is the highest rate in the City's schedule. Both carry the $25.00 non-refundable application fee and the $30.00 minimum permit fee the City's plumbing application prints as a $55.00 floor.",
    localSummary:
      "The plumbing fee is the only one in Manchester that is flat for new residential work and proportional for everything else, and the flat part is generous by comparison. A new house pays $150.00 whatever its plumbing costs; the same house's plumbing alteration at a $30,000 calculated cost pays $450.00 at .015. The City's own plumbing application prints the rate above its itemised list — \\\"ESTIMATED COST OF JOB $____ X .015\\\" — and carries the same application and minimum lines as the electrical form.\n\nTwo things about the form are worth knowing. The itemised column lists fixtures and pipe runs by name but prints no rates for them, so there is no fixture-by-fixture price to quote and this site does not invent one: the fee is the calculated cost of the job at .015, and the column is there so the department can see the scope. And the application is filed on paper — printed, signed and mailed with the fee. Manchester does not accept trade applications electronically, and warns that \\\"any fees calculated are subject to change upon review of the application\\\".",
    notIncluded:
      "This is Sec. 109.8 item 9 plus the application fee, the $30.00 minimum and the re-inspection fee. It excludes:\n\n- **A fixture-by-fixture price.** Manchester's plumbing application itemises bathroom fixtures, backflow preventers, dishwashers, grease traps, sump pumps, waste and vent runs and water tanks — and prints no rate against any of them. The fee is the calculated cost of the work at .015. This site does not publish a per-fixture figure because the City does not.\n- **Gas piping**, which is priced in the heating rows of the same schedule: $20.00 for the first fifty lineal feet plus $0.05 per additional foot, and $4.00 for each outlet. A gas range or water heater installation usually carries a heating permit as well as a plumbing one.\n- **Heating and ventilation permits** — item 8, from $40.00 for a residential system serving one unit to $75.00 plus $0.20 per 1,000 BTU over 100,000 for a commercial installation.\n- **Sewer and water connection charges** made by the utility or by another City department, which are not permit fees under this schedule.\n- **The 100% surcharge where work started without a permit**, the **$300.00 appeal fee**, and the **$35.00 retention** on a refund.\n- **Re-inspection above the published minimum.** Sec. 109.5(A) sets it at \"a minimum of $30.00\".\n- **New Hampshire plumber licensing**, which is a State charge and not part of a permit fee.",
    workedExample: {
      scenario:
        "A plumbing permit for a new one-unit residential dwelling — the flat row, and the one most homeowners ask about.",
      inputs: { valuationCents: 3_500_000, custom: { new_residential_dwelling: true } },
      notes:
        "The dwelling is new and has one unit, so item 9(A) applies and the permit fee is the flat $150.00 — the $35,000 of estimated plumbing cost in the inputs does not change it, and that is the point of the row. The $150.00 is well above the $30.00 minimum, so the minimum contributes nothing, and the $25.00 application fee is added to make the total $175.00.\n\nCompare the two other ways the same job could be priced. A second unit in the same building would add $100.00. And if the work were instead an alteration to an existing house at a calculated cost of $35,000, item 9(B) would charge .015 of it, which is $525.00 — three and a half times the new-construction figure, which is why the schedule's own words matter more than the headline number.",
    },
    faqs: [
      {
        question: "How much is a plumbing permit for a new house in Manchester?",
        answer:
          "$150.00 for a new residential dwelling of one unit, plus $100.00 for each additional unit over one. It is a flat fee and does not depend on the cost of the plumbing work.",
        sourceId: MANCHESTER_PLUMBING_FORM_SOURCE_KEY,
      },
      {
        question: "What rate applies to plumbing alterations?",
        answer:
          "For all other new buildings, additions, renovations, alterations, repairs and replacements, the permit fee is the calculated cost of the work multiplied by 0.015. The City's plumbing application prints the same statement as \"ESTIMATED COST OF JOB × .015\".",
        sourceId: MANCHESTER_BUILDING_CODE_SOURCE_KEY,
      },
      {
        question: "Does Manchester charge per fixture?",
        answer:
          "No. The plumbing application itemises the fixtures and pipe runs so the department can see the scope, but prints no rate against them, and the fee schedule prices the permit by the calculated cost of the work instead. This site does not publish a per-fixture figure because the City does not.",
        sourceId: MANCHESTER_PLUMBING_FORM_SOURCE_KEY,
      },
      {
        question: "Is the application fee included in the permit fee?",
        answer:
          "No — it is charged in addition. The form prints the two lines as \"$30 MINIMUM FEE + $25 APPLICATION FEE: $55.00\", so a small plumbing permit is $30.00 of permit fee plus $25.00, not $30.00 in total.",
        sourceId: MANCHESTER_PLUMBING_FORM_SOURCE_KEY,
      },
      {
        question: "How do I submit a plumbing permit application?",
        answer:
          "On paper. Trade applications must be printed, signed and mailed or emailed to the Planning and Community Development Department along with the appropriate fees, because the City does not accept them electronically. The application notes that any fees calculated are subject to change on review.",
        sourceId: MANCHESTER_PERMIT_APPS_SOURCE_KEY,
      },
    ],
    seoTitle: "Manchester NH plumbing permit cost: $150 flat or .015 of cost",
    seoDescription:
      "Manchester, New Hampshire plumbing permit fees — $150.00 for a new one-unit dwelling plus $100.00 per additional unit, or .015 of the calculated cost of other work, with a $25.00 application fee and a $30.00 minimum.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: MANCHESTER_LAST_VERIFIED,
  },
];

const verifications: SeedVerification[] = [
  {
    entityType: "source",
    entityKey: MANCHESTER_BUILDING_CODE_SOURCE_KEY,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: MANCHESTER_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MANCHESTER_BUILDING_CODE_SOURCE_KEY,
    notes:
      "Read 2026-09-25 as a PDF. Section 109 transcribed in full: the two building rates, plan review at $0.02 per square foot, demolition bands, signs, storage tanks, the heating and gas piping rows, the electrical ladder including the low-voltage bands, the plumbing rows, the $25.00 application fee, the $30.00 minimum, the re-inspection minimum, the 100% surcharge and the refund rule.",
  },
  {
    entityType: "source",
    entityKey: MANCHESTER_FEES_PAGE_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: MANCHESTER_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MANCHESTER_FEES_PAGE_SOURCE_KEY,
    notes:
      "Read 2026-09-25 through the City website. Corroborates the two building rates and states the plan review rate for multi-family and commercial applications.",
  },
  {
    entityType: "source",
    entityKey: MANCHESTER_ELECTRICAL_FORM_SOURCE_KEY,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: MANCHESTER_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MANCHESTER_ELECTRICAL_FORM_SOURCE_KEY,
    notes:
      "Read 2026-09-25 as a PDF. Its fee column matches Sec. 109.8 item 11 row for row, and its printed minimum — \"$30 MINIMUM FEE + $25 APPLICATION FEE: $55.00\" — is asserted in tests/content/manchester-seed.test.ts as the output of the model for a permit with no calculated fee.",
  },
  {
    entityType: "source",
    entityKey: MANCHESTER_HEATING_FORM_SOURCE_KEY,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: MANCHESTER_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MANCHESTER_HEATING_FORM_SOURCE_KEY,
    notes:
      "Read 2026-09-25 as a PDF. Its two-column rate table renders with the value column shifted by one row in a plain text extraction, so the pairing was established from the form's own text order and then checked against Sec. 109.8 item 8, which prints the same rows with their labels attached. Both readings agree; the form is cited rather than the code here because it is the document a filer sees.",
  },
  {
    entityType: "source",
    entityKey: MANCHESTER_PLUMBING_FORM_SOURCE_KEY,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: MANCHESTER_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MANCHESTER_PLUMBING_FORM_SOURCE_KEY,
    notes:
      "Read 2026-09-25 as a PDF. Carries \"ESTIMATED COST OF JOB × .015\", the $25.00 application fee, the $30.00 minimum and an itemised fixture list with no rates — all three facts are stated on the page that cites it.",
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-NEW-1-2-FAMILY",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: MANCHESTER_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MANCHESTER_BUILDING_CODE_SOURCE_KEY,
    notes:
      "Sec. 109.8 item 1(A) — \"the estimated cost of the work multiplied by .006\" — and restated on the City's fees page.",
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-OTHER-WORK",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: MANCHESTER_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MANCHESTER_BUILDING_CODE_SOURCE_KEY,
    notes:
      "Sec. 109.8 items 1(B) and 1(C), both .010. Modelled as one rule because the City charges one rate for both — the breakdown would otherwise print two identical rows.",
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-PLAN-REVIEW",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: MANCHESTER_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MANCHESTER_BUILDING_CODE_SOURCE_KEY,
    notes:
      "Sec. 109.8 item 2 — \"$.02 per square foot\" for everything but one- and two-family dwellings and accessory structures. Modelled as 2 cents per square foot of area, with both exclusions as conditions.",
  },
  {
    entityType: "fee_rule",
    entityKey: "ELEC-NEW-RESIDENTIAL",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: MANCHESTER_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MANCHESTER_ELECTRICAL_FORM_SOURCE_KEY,
    notes:
      "Item 11(A) — $100.00 for a one-unit new residential dwelling and $75.00 for each additional unit. Modelled with the `per_unit` base-and-allowance form so that three units are $250.00 rather than $300.00.",
  },
  {
    entityType: "fee_rule",
    entityKey: "ELEC-LV-2000",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: MANCHESTER_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MANCHESTER_BUILDING_CODE_SOURCE_KEY,
    notes:
      "Item 11(C)(1) — the first of the three low-voltage bands. Its two siblings are gated to the valuations they cover, which is what keeps the ladder mutually exclusive.",
  },
  {
    entityType: "fee_rule",
    entityKey: "PLUMB-NEW-RESIDENTIAL",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: MANCHESTER_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MANCHESTER_BUILDING_CODE_SOURCE_KEY,
    notes:
      "Sec. 109.8 item 9(A) — $150.00 for one unit and $100.00 for each additional unit, priced by the unit rather than by cost.",
  },
  {
    entityType: "fee_rule",
    entityKey: "PLUMB-OTHER-WORK",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: MANCHESTER_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MANCHESTER_BUILDING_CODE_SOURCE_KEY,
    notes:
      "Sec. 109.8 item 9(B) — .015 of the calculated cost, the highest rate in the schedule, and the same statement the plumbing application prints above its itemised column.",
  },
  {
    entityType: "permit_page",
    entityKey: "building-permit-cost",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: MANCHESTER_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MANCHESTER_BUILDING_CODE_SOURCE_KEY,
    notes:
      "The two rates, plan review and the application and minimum pair. The worked example is arithmetic on the schedule: $750,000 at .010 is $7,500.00 and 20,000 sq ft of plan review is $400.00.",
  },
  {
    entityType: "permit_page",
    entityKey: "electrical-permit-cost",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: MANCHESTER_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MANCHESTER_ELECTRICAL_FORM_SOURCE_KEY,
    notes:
      "The per-unit residential row, the two cost rates and the low-voltage ladder. The page records the one open question in the source — how the department splits low-voltage work from commercial work on a single application — rather than resolving it by assumption.",
  },
  {
    entityType: "permit_page",
    entityKey: "plumbing-permit-cost",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: MANCHESTER_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MANCHESTER_PLUMBING_FORM_SOURCE_KEY,
    notes:
      "The flat new-residential pair and the .015 rate for everything else. The page says plainly that the City publishes no per-fixture fee, which is the one thing a reader is most likely to expect here.",
  },
  {
    entityType: "jurisdiction_profile",
    entityKey: MANCHESTER_KEYS.jurisdiction,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: MANCHESTER_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MANCHESTER_BUILDING_CODE_SOURCE_KEY,
    notes:
      "Hub content built from the Building Code's Section 109 and the City's three trade applications, corroborated by the department's fees page. The heating and gas piping rows are documented as priced and unmodelled rather than left out silently.",
  },
];

export const manchesterSeed: JurisdictionSeed = {
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
export const MANCHESTER_PUBLISHED_PERMIT_PAGES = manchesterSeed.permitPages.filter(
  (page) => page.publishStatus === "published" && !page.noindex,
);
