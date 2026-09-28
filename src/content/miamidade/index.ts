import type { JurisdictionSeed } from "@/content/seed-types";

import {
  MD_BUILDING_MINIMUM_CENTS,
  MD_BUILDING_RULES,
  MD_BUILDING_SOURCE_KEY,
  MD_CPBC_UPFRONT_FEE_CENTS,
  MD_ELECTRICAL_RULES,
  MD_ELECTRICAL_SHEET_SOURCE_KEY,
  MD_FEE_EFFECTIVE_FROM,
  MD_PLUMBING_RULES,
  MD_PLUMBING_SHEET_SOURCE_KEY,
  MD_RER_SURCHARGE_BPS,
  MD_STATE_SURCHARGE_MINIMUM_CENTS,
  MD_TRADE_MINIMUM_CENTS,
} from "./fee-rules";

/**
 * Miami-Dade County, Florida — **the county that prices a permit by area and sends the
 * applicant's own fee sheet back with the bill.**
 *
 * Almost every jurisdiction in this dataset prices a building permit from a valuation. This
 * one prices it per square foot — $0.96 for a new detached single-family house, $0.40 for a
 * townhome, $0.40 for the first 100,000 square feet of anything else and $0.15 above that,
 * $0.50 per square foot to alter a house up to a stated maximum of $847.95 — and then states
 * its minimums per item, its up-front fee separately, and its own 7.5% surcharge beside the
 * state's 1% and 1.5%. Three surcharges, two of them the state's and one of them the
 * department's own, which is the kind of thing a reader only sees when the rows are listed.
 *
 * Its trade permits are priced from **forms the applicant fills in**. The electrical,
 * plumbing and mechanical fee sheets break a permit into categories and lines — a permanent
 * service per 100 amperes, an outlet box, a fixture, a ton of air conditioning, a sewer
 * connection, a gas outlet — and the County's own page says they "must be submitted as part
 * of a permit application". So a trade permit here is a *sum over rows*, which is why those
 * pages price several at once rather than one.
 *
 * And the two trade sheets state a floor the schedule never repeats: "Minimum fee for
 * electrical permits is $227.90" — a figure that only makes sense as ($147.00 + $65.00) x
 * 1.075, i.e. the County's own minimum, its up-front fee, and the 7.5% surcharge on both.
 * Reproducing that number exactly is the test that the rules and the arithmetic are wired
 * the way the County wired them.
 *
 * Research record: research/florida/miami-dade-county.md.
 */

export const MD_LAST_VERIFIED = "2026-09-24";

export const MD_KEYS = {
  state: "fl",
  county: "miami-dade",
  jurisdiction: "miami-dade",
  implementingOrder: MD_BUILDING_SOURCE_KEY,
  electricalSheet: MD_ELECTRICAL_SHEET_SOURCE_KEY,
  plumbingSheet: MD_PLUMBING_SHEET_SOURCE_KEY,
  mechanicalSheet: "miami-dade-mechanical-fee-sheet-2026",
  feesPage: "miami-dade-building-permit-fees-page",
  planReviewPage: "miami-dade-plan-review-page",
} as const;

const RESEARCHER = "Permit Fee Intelligence research pass 11 (Florida, second jurisdiction)";

const state = {
  code: "FL",
  slug: "florida",
  name: "Florida",
  fipsCode: "12",
};

const county = {
  key: MD_KEYS.county,
  slug: "miami-dade",
  name: "Miami-Dade County",
  fipsCode: "12086",
};

export const miamiDadeSeed: JurisdictionSeed = {
  state,
  county,

  jurisdiction: {
    key: MD_KEYS.jurisdiction,
    stateKey: MD_KEYS.state,
    countyKey: MD_KEYS.county,
    type: "county",
    slug: "miami-dade",
    name: "Miami-Dade County",
    officialName:
      "Miami-Dade County Department of Regulatory and Economic Resources, Building and Neighborhood Compliance",
    websiteUrl: "https://www.miamidade.gov/building",
    permitPortalUrl: "https://www.miamidade.gov/Apps/RER/ePermittingMenu/Home/Permits",
    timezone: "America/New_York",
    isActive: true,
  },

  departments: [
    {
      key: "miami-dade-building-neighborhood-compliance",
      jurisdictionKey: MD_KEYS.jurisdiction,
      kind: "building",
      name: "Department of Regulatory and Economic Resources, Building and Neighborhood Compliance",
      phone: "786-315-2000",
      email: "bldgdept@miamidade.gov",
      url: "https://www.miamidade.gov/building",
      addressLine: "11805 SW 26 Street, Miami, FL 33175",
      hours: null,
      notes:
        "The department whose implementing order and fee sheets these pages are. Its address, telephone number and email are the ones printed at the foot of the electrical and plumbing fee sheets — the forms an applicant actually files — rather than from a contact page that changes without any schedule changing with it. The order's own note is that the permit fee is only part of what the County collects: \"Permit fees include other fees assessed by other service areas, agencies and/or departments involved in the permitting process\".",
    },
    {
      key: "miami-dade-fire-rescue",
      jurisdictionKey: MD_KEYS.jurisdiction,
      kind: "fire",
      name: "Miami-Dade Fire Rescue Department",
      phone: null,
      email: null,
      url: null,
      addressLine: null,
      hours: null,
      notes:
        "Named on the County's fee page among the agencies whose charges are collected with a building permit, and the publisher of its own Fire Prevention Fee Schedule for fire and life safety inspections, new construction inspections, plan review and emergency vehicle zones. Nothing from it is priced on this site, which is the reason it is named: a reader comparing a permit estimate to an invoice will see a fire charge that no page here accounts for. No telephone number is recorded, because a fire department's number is the one piece of a fee schedule's context a stale figure can send someone to the wrong place with.",
    },
    {
      key: "miami-dade-der",
      jurisdictionKey: MD_KEYS.jurisdiction,
      kind: "other",
      name: "Division of Environmental Resources Management (DERM)",
      phone: null,
      email: null,
      url: null,
      addressLine: null,
      hours: null,
      notes:
        "The division that charges environmental fees, citations, tree removal and relocation permits, and its own plan reviews, all of which ride on the same permit application as the County's building fee. Listed for the same reason as Fire Rescue: the County's fee page names it as part of a permit's cost, and this site prices none of it. Development Services' impact fees and the Water and Sewer Department's connection charges sit in the same list.",
    },
  ],

  sources: [
    {
      key: MD_BUILDING_SOURCE_KEY,
      jurisdictionKey: MD_KEYS.jurisdiction,
      title:
        'Implementing Order No. 4-63, "Fee Schedule for Regulatory and Economic Resources Department (Building and Neighborhood Compliance)"',
      url: "https://documents.miamidade.gov/ao-io/IO/IO-04-63.pdf",
      sourceType: "ordinance",
      issuingAuthority: "Miami-Dade County Board of County Commissioners",
      authorityKind: "county",
      isPrimary: true,
      documentDate: "2026-06-16",
      effectiveFrom: MD_FEE_EFFECTIVE_FROM,
      retrievedAt: MD_LAST_VERIFIED,
      lastVerifiedAt: MD_LAST_VERIFIED,
      notes:
        "Thirty pages, sha256 beginning 7f23cd971ade46be, re-fetched on 2026-09-24 to confirm the URL still serves the file this site was built from, and read in three pdftotext modes. It is an **implementing order** rather than an ordinance — \"Ordered June 16, 2026, Effective June 26, 2026\", superseding the order of June 26, 2025 — which is why a fee schedule in this county can be re-ordered inside a year, and why the County's own fee page still carries the notice for the preceding change: \"Effective Oct. 1, 2025 the Building Division will be implementing a revised fee schedule adopted by the Board of County Commissioners on June 30, 2025. This is the first increase in more than 17 years.\" The URL is the one the County's fee page links.",
    },
    {
      key: MD_ELECTRICAL_SHEET_SOURCE_KEY,
      jurisdictionKey: MD_KEYS.jurisdiction,
      title: "Electrical Fee Sheet (form 123_01-57/26)",
      url: "https://www.miamidade.gov/resources/economy/building/documents/electrical-fee.pdf",
      sourceType: "fee_schedule_pdf",
      issuingAuthority:
        "Miami-Dade County Department of Regulatory and Economic Resources, Building and Neighborhood Compliance",
      authorityKind: "county",
      isPrimary: true,
      documentDate: null,
      effectiveFrom: MD_FEE_EFFECTIVE_FROM,
      retrievedAt: MD_LAST_VERIFIED,
      lastVerifiedAt: MD_LAST_VERIFIED,
      notes:
        "Sha256 beginning c52d753a6c00f281, re-fetched on 2026-09-24. It prints the same rates as the implementing order **with a fee code on every row** — `G034` for a permanent service, `G005` for an outlet box, `G045` for a panel board — and every electrical rule on this site quotes its code, which is how a reader can find the row on the form they submit. Its first line is the floor the order never states: \"Minimum fee for electrical permits is $227.90.\"",
    },
    {
      key: MD_PLUMBING_SHEET_SOURCE_KEY,
      jurisdictionKey: MD_KEYS.jurisdiction,
      title: "Plumbing and Gas Fee Sheet (form 123_01-708/26)",
      url: "https://www.miamidade.gov/resources/economy/building/documents/plumbing-gas-fee.pdf",
      sourceType: "fee_schedule_pdf",
      issuingAuthority:
        "Miami-Dade County Department of Regulatory and Economic Resources, Building and Neighborhood Compliance",
      authorityKind: "county",
      isPrimary: true,
      documentDate: null,
      effectiveFrom: MD_FEE_EFFECTIVE_FROM,
      retrievedAt: MD_LAST_VERIFIED,
      lastVerifiedAt: MD_LAST_VERIFIED,
      notes:
        "Sha256 beginning c4aec030fb2ff505, re-fetched on 2026-09-24. It carries the same floor in the same words — \"Minimum fee for plumbing permits is $227.90\" — and it is the source for the plumber's rows this site prices: `P051`/`P052` at \"0.14x per Sq ft\", `P001` at \"$9.66 per Outlet\", `P032` at \"$9.66 per Fixture\", `P003`/`P044` at \"$48.31 per Sewer\", `P010` at \"$12.88 per Meter\". Its second category is gas, which the County prices on this form rather than separately.",
    },
    {
      key: MD_KEYS.mechanicalSheet,
      jurisdictionKey: MD_KEYS.jurisdiction,
      title: "Mechanical Fee Sheet",
      url: "https://www.miamidade.gov/resources/economy/building/documents/mechanical-fee.pdf",
      sourceType: "fee_schedule_pdf",
      issuingAuthority:
        "Miami-Dade County Department of Regulatory and Economic Resources, Building and Neighborhood Compliance",
      authorityKind: "county",
      isPrimary: false,
      documentDate: null,
      effectiveFrom: MD_FEE_EFFECTIVE_FROM,
      retrievedAt: MD_LAST_VERIFIED,
      lastVerifiedAt: MD_LAST_VERIFIED,
      notes:
        "Sha256 beginning 921276a654826807, re-fetched on 2026-09-24 and read, not modelled. It is cited here so the gap is a named document rather than an absence: its rows are priced per ton, per horsepower, per unit of refrigeration and per duct run, and no page of this site prices a mechanical permit in any jurisdiction. The implementing order prices the same work separately in its own section, and where the two documents disagree the order is the one that says so explicitly.",
    },
    {
      key: MD_KEYS.feesPage,
      jurisdictionKey: MD_KEYS.jurisdiction,
      title: "Building Fee Schedules, Refunds & Cancelations",
      url: "https://www.miamidade.gov/global/economy/building/building-permit-fees.page",
      sourceType: "county_website",
      issuingAuthority: "Miami-Dade County",
      authorityKind: "county",
      isPrimary: false,
      documentDate: null,
      effectiveFrom: null,
      retrievedAt: MD_LAST_VERIFIED,
      lastVerifiedAt: MD_LAST_VERIFIED,
      notes:
        "Read 2026-09-24. It is the page that links the implementing order and all three fee sheets, and it states the two facts that organise these pages: that \"Permit Fee Sheets must be submitted as part of a permit application when applying for electrical, mechanical or plumbing permits\", so a trade permit is a sum over the rows an applicant claims, and that \"Permit fees include other fees assessed by other service areas, agencies and/or departments involved in the permitting process\" — naming the Department of Transportation and Public Works, Development Services, DERM, Fire Rescue, Water and Sewer, and the state for septic tanks. Neither of the county's two published increases is invisible on it: the October 1, 2025 notice is still at the top of the page, above the schedules the June 2026 order superseded.",
    },
    {
      key: MD_KEYS.planReviewPage,
      jurisdictionKey: MD_KEYS.jurisdiction,
      title: "Plan Review",
      url: "https://www.miamidade.gov/global/economy/building/plan-review.page",
      sourceType: "county_website",
      issuingAuthority: "Miami-Dade County",
      authorityKind: "county",
      isPrimary: false,
      documentDate: null,
      effectiveFrom: null,
      retrievedAt: MD_LAST_VERIFIED,
      lastVerifiedAt: MD_LAST_VERIFIED,
      notes:
        "Read 2026-09-24. It is where the County explains how the up-front fee these pages charge fits into the process — \"To initiate the plan review process, upfront fees will first need to be paid\" — and it lists the expedited routes this site does not price: Affordable and Workforce Housing, Concierge, Cookie Cutter, Green Building and Master. It also names a charge with no rate on any schedule: applicants who submit plans on paper \"will be assessed a conversion fee based on the current fee schedule\".",
    },
  ],

  /** Empty on purpose: the permit types this jurisdiction uses already exist. */
  permitTypes: [],
  projectTypes: [],

  jurisdictionPermitTypes: [
    {
      jurisdictionKey: MD_KEYS.jurisdiction,
      permitTypeKey: "building",
      isAvailable: true,
      localName: "Building permit",
      officialUrl: null,
      notes:
        "Priced **by area, not by valuation**, which is close to unique on this site: $0.96 per square foot for a new detached single-family house or duplex, $0.40 for a townhome, $0.40 for the first 100,000 square feet of every other occupancy and $0.15 above that, $0.50 per square foot to alter a house up to a stated maximum of $847.95, and $0.11 or $0.14 per square foot of roof. A minimum of $147.00 applies \"to all items in this section\", a $65.00 non-refundable up-front fee is added, and three surcharges close it out: the County's own 7.5% and the state's 1% and 1.5%, each of the last two with a $2.00 floor.",
    },
    {
      jurisdictionKey: MD_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      isAvailable: true,
      localName: "Electrical permit",
      officialUrl: null,
      notes:
        "Priced from the **fee sheet the applicant files**, a row at a time: a permanent service at $7.26 per 100 amperes, an outlet box at $2.59, a fixture at $2.59, a panel board at $32.21, a ton of air conditioning at $9.66, feeders at $19.33 each, and residential wiring at $0.113 per square foot of the master permit. The sheet's own floor is $227.90, which is the $147.00 minimum plus the $65.00 up-front fee plus 7.5% of both — and this site reproduces that figure exactly.",
    },
    {
      jurisdictionKey: MD_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      isAvailable: true,
      localName: "Plumbing permit",
      officialUrl: null,
      notes:
        "Priced from the **Plumbing and Gas Fee Sheet**: a new or altered single-family house or duplex at $0.143 per square foot, roughed-in outlets and fixtures at $9.66 each, a sewer connection at $48.31, a water service at $12.88 per meter, a backflow assembly at $56.36 or $88.55 by size, and a list of plant, tank, lift station, grease trap and mobile-home rows at fixed amounts. The same $227.90 floor applies, and gas is on the same form rather than a permit of its own.",
    },
    {
      jurisdictionKey: MD_KEYS.jurisdiction,
      permitTypeKey: "mechanical",
      isAvailable: true,
      localName: "Mechanical permit",
      officialUrl: null,
      notes:
        "Published as its own fee sheet and its own section of the implementing order, and not modelled anywhere on this site. Its rows are priced per ton, per horsepower and per unit of equipment, with a re-inspection row and a $38.00 floor for some exceptions; the air conditioning tonnage that the electrical sheet also charges for is one of the few rows the two documents share.",
    },
  ],

  feeSchedules: [
    {
      key: MD_BUILDING_SOURCE_KEY,
      jurisdictionKey: MD_KEYS.jurisdiction,
      sourceKey: MD_BUILDING_SOURCE_KEY,
      title: "Miami-Dade County Building Permit Fee Schedule (Implementing Order No. 4-63)",
      officialUrl: "https://documents.miamidade.gov/ao-io/IO/IO-04-63.pdf",
      effectiveFrom: MD_FEE_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: MD_LAST_VERIFIED,
      notes:
        "One document for all three trades and the building section. Its building rows run from B.1 to B.19 and are the only ones with an area-based rate; the plumbing and electrical sections that follow it are cross-referenced by the fee sheets.",
    },
    {
      key: MD_ELECTRICAL_SHEET_SOURCE_KEY,
      jurisdictionKey: MD_KEYS.jurisdiction,
      sourceKey: MD_ELECTRICAL_SHEET_SOURCE_KEY,
      title: "Electrical Fee Sheet (electrical permit fee schedule)",
      officialUrl: "https://www.miamidade.gov/resources/economy/building/documents/electrical-fee.pdf",
      effectiveFrom: MD_FEE_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: MD_LAST_VERIFIED,
      notes:
        "The same rates as Section I.D of the implementing order, with fee codes. Its first line states the permit floor of $227.90 that the order leaves to arithmetic.",
    },
    {
      key: MD_PLUMBING_SHEET_SOURCE_KEY,
      jurisdictionKey: MD_KEYS.jurisdiction,
      sourceKey: MD_PLUMBING_SHEET_SOURCE_KEY,
      title: "Plumbing and Gas Fee Sheet (plumbing permit fee schedule)",
      officialUrl:
        "https://www.miamidade.gov/resources/economy/building/documents/plumbing-gas-fee.pdf",
      effectiveFrom: MD_FEE_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: MD_LAST_VERIFIED,
      notes:
        "Categories 01 to 05 of one applicant-facing form: general plumbing, gas fitting, lawn sprinkler, chemical toilets, and the renewal rule that a renewal costs \"Original Permit Fee\".",
    },
  ],

  feeRules: [
    ...MD_BUILDING_RULES.map((rule) => ({
      jurisdictionKey: MD_KEYS.jurisdiction,
      permitTypeKey: "building",
      scheduleKey: MD_BUILDING_SOURCE_KEY,
      rule,
    })),
    ...MD_ELECTRICAL_RULES.map((rule) => ({
      jurisdictionKey: MD_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      scheduleKey: MD_ELECTRICAL_SHEET_SOURCE_KEY,
      rule,
    })),
    ...MD_PLUMBING_RULES.map((rule) => ({
      jurisdictionKey: MD_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      scheduleKey: MD_PLUMBING_SHEET_SOURCE_KEY,
      rule,
    })),
  ],

  requirements: [
    {
      jurisdictionKey: MD_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "other",
      title: "The building permit is priced on area, not on valuation",
      description:
        'Section I.B prices a one and two family dwelling "per square foot" — 0.96 for new construction of a detached single family or duplex, 0.40 for the units of a multi-unit townhome — and every other occupancy by gross area in two tiers: "For the first 100,000 square feet (per square foot) 0.40 — For each additional square foot over 100,000 square feet (per square foot) 0.15". A permit is therefore calculated from drawings rather than from a contract value, which is the opposite of the other Florida county on this site, and it is why the pages here ask for square footage and not for a valuation.',
      isMandatory: true,
      sortOrder: 10,
      sourceKey: MD_BUILDING_SOURCE_KEY,
      lastVerifiedAt: MD_LAST_VERIFIED,
    },
    {
      jurisdictionKey: MD_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "other",
      title: `A $${MD_BUILDING_MINIMUM_CENTS / 100} minimum applies to every item in the building section`,
      description:
        '"The minimum fee for all residential dwelling building permits (single family, duplex) is applicable to all items in this section, except as otherwise specified. 147.00", and "The minimum fee for all other uses 147.00". The sentence does the work of two: the floor applies to *each* item rather than once to the permit, so a $88.55 slab permit is $147.00, and a permit that combines two items pays it twice. The same section excepts add-on permits: "This minimum fee does not apply to add-on building permits issued as supplementary to current outstanding permits for the same job."',
      isMandatory: true,
      sortOrder: 20,
      sourceKey: MD_BUILDING_SOURCE_KEY,
      lastVerifiedAt: MD_LAST_VERIFIED,
    },
    {
      jurisdictionKey: MD_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "other",
      title: "Three surcharges, and one of them is the County's own",
      description: `The County's own: "A.15 RER SURCHARGE — A Building Permitting surcharge of seven and one half (${MD_RER_SURCHARGE_BPS / 100}%) percent on all Building Permitting fees listed in Section I except for Enforcement fees listed in Sub-section K", which funds the permitting activity itself. The state's two: 1% under Florida Statutes § 553.721 and 1.5% under § 468.631, both "of the permit fees associated with enforcement of the Florida Building Code" and both with a $${MD_STATE_SURCHARGE_MINIMUM_CENTS / 100}.00 minimum per permit, collected by the County and remitted quarterly with 10% retained for building department training. They are not alternatives and none of them is optional: a permit pays all three, and the two $2.00 floors are what a small permit actually pays.`,
      isMandatory: true,
      sortOrder: 30,
      sourceKey: MD_BUILDING_SOURCE_KEY,
      lastVerifiedAt: MD_LAST_VERIFIED,
    },
    {
      jurisdictionKey: MD_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "other",
      title: `A $${MD_CPBC_UPFRONT_FEE_CENTS / 100} up-front fee is paid before anything is reviewed`,
      description:
        '"A.8 UP-FRONT FEE FOR PERMIT SUPPORT FUNCTIONS PERFORMED BY CONSTRUCTION, PERMITTING, AND BUILDING CODE (CPBC) — A non-refundable up-front fee will be assessed for permit support functions, including acceptance of applications, distribution of plans, document storage, and technology support for applications accepted through CPBC for Unincorporated Municipal Service Area jurisdiction applications. 65.00", and a second row at $70.00 for applications in a municipality. The County\'s plan review page states when it is paid: "To initiate the plan review process, upfront fees will first need to be paid." A separate per-square-foot "up-front" processing fee at $0.60, $0.30 or $0.26 is charged at application and is **credited toward the final fee**, so it is a deposit rather than a cost and is not added to any total on this site.',
      isMandatory: true,
      sortOrder: 40,
      sourceKey: MD_KEYS.planReviewPage,
      lastVerifiedAt: MD_LAST_VERIFIED,
    },
    {
      jurisdictionKey: MD_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      requirementType: "other",
      title: `A trade permit has a $${MD_TRADE_MINIMUM_CENTS / 100} floor on its rows, charged once for the permit`,
      description:
        'Both trade fee sheets state the floor in the same words at the top of the form — "Minimum fee for electrical permits is $227.90" and "Minimum fee for plumbing permits is $227.90" — and that figure is the County\'s own arithmetic: $147.00 of fee rows, the $65.00 up-front fee, and 7.5% of both, because the RER surcharge is charged on the fee *and* the up-front fee. So the floor is $147.00, it is measured on the fee rows rather than the total, and it is charged once per permit rather than once per row. This site applies it as a `permit_minimum` rule that adds the shortfall, which is why an electrical permit consisting of one 400-ampere service ends at $232.11 — the sheet\'s $227.90 plus the two state surcharges on top of it.',
      isMandatory: true,
      sortOrder: 10,
      sourceKey: MD_ELECTRICAL_SHEET_SOURCE_KEY,
      lastVerifiedAt: MD_LAST_VERIFIED,
    },
    {
      jurisdictionKey: MD_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      requirementType: "other",
      title: "The applicant files a fee sheet, so a trade permit is a sum over rows",
      description:
        'The County\'s fee page is explicit: "Permit Fee Sheets must be submitted as part of a permit application when applying for electrical, mechanical or plumbing permits. Fee sheets break down the cost of permit by category." The electrical sheet gives every row a code — `G034` for a permanent service, `G005` for an outlet box, `G009` for a fixture, `G045` for a board, `G008` for a ton of cooling — and a real permit lists several of them at once. This site therefore prices a trade permit as the sum of the rows it is given: sixty outlets, one panel board, forty fixtures and five tons of air conditioning on one permit is $443.34 with the up-front fee and three surcharges, and the rows that are alternatives to one another — a permanent service, a temporary service, pool wiring, solar, a burglar alarm — are the only ones it treats as a choice.',
      isMandatory: true,
      sortOrder: 20,
      sourceKey: MD_KEYS.feesPage,
      lastVerifiedAt: MD_LAST_VERIFIED,
    },
    {
      jurisdictionKey: MD_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      requirementType: "other",
      title: "Roughing-in and fixtures are charged as counts, and a gas job is on the same form",
      description:
        'The implementing order lists what the fixture count includes — "bathtubs, closets, doctors, dentists, hospital sterilizers, autoclaves, autopsy tables and other fixtures, appurtenances, drinking fountains, fixtures discharging into traps or safe waste pipes, floor drains, laundry tubs, lavatories, showers, sinks, urinals, and heaters" — at $9.66 each, and the fee sheet prices the same figure twice, as `P001` per outlet and `P032` per fixture. Gas is Category 02 of the same form: gas outlets and appliances at $9.66 residential and $16.10 commercial, meters at $6.45, repairs to gas pipes at $56.36 per repair. Because it is one form, a plumbing permit and a gas permit are the same application here.',
      isMandatory: true,
      sortOrder: 10,
      sourceKey: MD_PLUMBING_SHEET_SOURCE_KEY,
      lastVerifiedAt: MD_LAST_VERIFIED,
    },
    {
      jurisdictionKey: MD_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      requirementType: "other",
      title: "Working without a permit is charged double",
      description:
        'The fee sheet states it on the signature block, above the signature line: "Refunds will not be given in case of error on your part and you will be charged a double fee for doing work without a permit." The same warning is on the electrical sheet in the same position, and it is one of the few penalties in this dataset that a builder signs to acknowledge before the permit exists.',
      isMandatory: true,
      sortOrder: 20,
      sourceKey: MD_PLUMBING_SHEET_SOURCE_KEY,
      lastVerifiedAt: MD_LAST_VERIFIED,
    },
  ],

  profile: {
    jurisdictionKey: MD_KEYS.jurisdiction,
    headline: "Miami-Dade County permit fees, priced by area and by the applicant's own fee sheet",
    summary:
      "Miami-Dade County prices a building permit **per square foot** rather than from a valuation: $0.96 for a new detached single-family house or duplex, $0.40 for a townhome, $0.40 for the first 100,000 square feet of anything else and $0.15 above that, and $0.50 per square foot to alter a house, capped at $847.95. Its trade permits are priced from forms the applicant files a row at a time — a service per 100 amperes, an outlet box, a fixture, a ton of cooling, a sewer connection, a water meter — with a $227.90 floor on the permit. A $65.00 up-front fee and three surcharges are added to everything: the County's own 7.5% and the state's 1% and 1.5%, the last two with $2.00 minimums.",
    localContext:
      "Two things make this county different from the rest of the dataset. The first is the basis: there is no valuation anywhere in the building section. A house is 2,500 square feet at $0.96 and the fee is $2,400.00 whether the contract says $400,000 or $4,000,000; the alternative rows are all named items — a pool, a screen enclosure, a slab, a shed, a sign, a tent, a temporary platform — each with its own flat or per-area price. That makes the fee a measurement rather than a negotiation.\n\nThe second is whose paperwork the fee comes from. For electrical, mechanical and plumbing permits the County requires the applicant to submit a **fee sheet**, and the sheet is a table of fee codes with a units column: `G034` permanent service, $7.26 per 100 amperes; `G005` outlet box, $2.59 per outlet; `G045` panel board, $32.21 per board; `P032` fixture, $9.66; `P003` sewer connection, $48.31. The permit is the sum of the lines the applicant claims, which is why the pages here price several rows at once and only treat genuinely alternative rows as a choice.\n\nBoth sheets state a floor in words rather than in arithmetic: \"Minimum fee for electrical permits is $227.90\". That number is the County's own minimum of $147.00, plus its $65.00 up-front fee, plus 7.5% of both — the one place on this site where the arrangement of a surcharge is checkable against a figure the County prints, and this site reproduces it exactly.\n\nNone of that is the whole cost of a permit, and the County says so on the page that links all of it: \"Permit fees include other fees assessed by other service areas, agencies and/or departments involved in the permitting process\" — the Department of Transportation and Public Works, Development Services' impact fees, DERM, Fire Rescue, Water and Sewer, and the state for septic tanks.",
    valuationBasis:
      "None. The building section charges by area in square feet, and the trade sections charge by count — amperes, outlets, fixtures, tons, connections, meters, gallons and horsepower. Nothing on any of the three pages is computed from a project's value.",
    notIncluded:
      "These pages price the fee rows of the building, electrical and plumbing schedules, the permits' own minimums, the $65.00 up-front fee and the three surcharges. They exclude:\n\n- **Everything the County collects for another agency**, in its own words: \"Permit fees include other fees assessed by other service areas, agencies and/or departments involved in the permitting process\" — Transportation and Public Works, Development Services impact fees for road, fire and emergency services, police, parks and education, DERM's environmental fees and tree removal permits, Fire Rescue's Fire Prevention Fee Schedule, Water and Sewer's connection charges, and the state's septic tank fee.\n- **The mechanical permit**, priced per ton, per horsepower and per unit of equipment on the County's own Mechanical Fee Sheet.\n- **The per-square-foot \"up-front\" processing fee** at $0.60 for a new house, $0.30 for alterations and $0.26 for commercial work, because the order states it \"is not refundable but shall be credited toward the final building permit fee\" — it is a deposit, not an additional cost.\n- **The expedited and programme routes**: Concierge permitting, the Cookie Cutter master model programme at $0.82 per square foot in place of $0.96, the owner-builder process, residential hardening permits under Subsection P, the after-hours optional plan review and the electronic concurrent plan processing fee.\n- **The hourly and per-document charges**: additional inspections, overtime inspections, reworked plans, the plan conversion fee for paper submittals, stamping additional sets, and interest on unpaid amounts.\n- **The increases and the private-provider discount**: the order reserves the right to adjust fees, the County's page records the preceding schedule's October 1, 2025 increase as \"the first increase in more than 17 years\", and private providers have their own arrangements under Florida law that this site does not compute.\n- **The penalty for unpermitted work**, which both trade sheets state on the signature line as \"a double fee\", and the refund rules, which return nothing on a submittal, licence or recording fee.\n- **Any permit on land inside a municipality.** Miami, Hialeah, Miami Beach, Coral Gables, Doral, Homestead, North Miami, Aventura and the other municipalities in the county issue their own permits; only the unincorporated area is priced here, and the implementing order's own up-front fee says so by naming the \"Unincorporated Municipal Service Area jurisdiction applications\" it applies to.",
    seoTitle: "Miami-Dade County Permit Fees (Building, Electrical, Plumbing)",
    seoDescription:
      "What a Miami-Dade County building, electrical or plumbing permit costs: building fees per square foot from $0.96, trade fees from the County's own fee sheet rows, a $227.90 trade minimum, a $65.00 up-front fee and 7.5% + 1% + 1.5% in surcharges.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: MD_LAST_VERIFIED,
  },

  permitPages: [
    {
      jurisdictionKey: MD_KEYS.jurisdiction,
      permitTypeKey: "building",
      slug: "building-permit-cost",
      title: "Miami-Dade County building permit cost",
      intro:
        "A Miami-Dade County building permit is charged **per square foot**, not on a valuation. A new detached single-family house or duplex is **$0.96 per square foot**, a townhome $0.40, every other occupancy $0.40 for the first 100,000 square feet and $0.15 above that, and altering a house is $0.50 per square foot of the structure up to a stated maximum of **$847.95**. A $147.00 minimum applies to each item, a $65.00 non-refundable up-front fee is added, and three surcharges follow: the County's own 7.5%, and the state's 1% and 1.5%. A 2,500 square foot house comes to **$2,709.88**.",
      localSummary:
        "The building section never asks what a project is worth. A 2,500 square foot detached house is 2,500 times $0.96, which is $2,400.00; the same house as the units of a multi-unit townhome is 2,500 times $0.40; a 30,000 square foot commercial building is 30,000 times $0.40 because it is under the 100,000 square foot tier, and a 260,000 square foot warehouse is 100,000 at $0.40 plus 160,000 at $0.15. Nothing about that changes when the contract price doubles, which is the one property of this schedule worth knowing before comparing it to any other jurisdiction on this site.\n\nThe named rows are alternatives to one another and each has its own basis. A swimming pool is flat — $225.41 for a residential pool or spa — a screen enclosure is $11.13 per 100 square feet, moving a building is $11.28 per 100 square feet, an unreinforced slab is $88.55 flat, a prefabricated shed over 100 square feet is $147.00, a demolition is a flat charge per structure, and roofing is $0.11 per square foot of coverage including overhangs, or $0.14 for tile. A re-roof whose covering has not been named is priced at the shingle rate, because the row names itself \"Roofing shingle and **other roof types not listed**\" — it is the residual category, not a guess.\n\nThen the minimum and the up-front fee. B.2 says the $147.00 floor \"is applicable to all items in this section\", which is the sentence that makes a $88.55 slab permit $147.00 and makes a permit combining two items pay the floor twice. B.1's per-square-foot \"up-front\" processing fee — $0.60, $0.30 or $0.26 — is a deposit rather than a cost, because the order states it \"shall be credited toward the final building permit fee\"; the $65.00 that *is* a cost is the A.8 up-front fee for permit support functions, which is non-refundable and applies to unincorporated-area applications.\n\nFinally the three surcharges, which is the part of this schedule that most rewards reading the section in order. A.15 is the County's own 7.5%, charged \"on all Building Permitting fees listed in Section I except for Enforcement fees listed in Sub-section K\", and it funds the permitting activity rather than the state. A.20 and A.21 are the state's 1% and 1.5%, each with a $2.00 minimum per permit. The RER surcharge is charged on everything charged before it — including the up-front fee — while the two state surcharges are charged on the permit fee. On the house above that is $184.88, $24.00 and $36.00 respectively, and the reason the first is larger than either state surcharge is that its rate is five times the 1.5% one.",
      notIncluded:
        "This estimate is the building permit row that applies, the $147.00 minimum on it, the $65.00 up-front fee and the three surcharges. It excludes:\n\n- **The electrical, plumbing and mechanical permits** on the same project, which are separate applications with their own fee sheets. This site prices two of the three.\n- **Other agencies' charges collected with the permit**: impact fees, DERM's environmental and tree removal fees, Fire Rescue's plan review and inspection fees, Water and Sewer connections and the septic tank fee.\n- **The per-square-foot up-front processing fee**, which is credited back toward the final fee, and the plan submittal and re-submittal tables that accompany it.\n- **The row-by-row alternatives this site prices on other pages**: a pool, a screen enclosure, a slab, a shed, a sign, a fence or wall, a tent, a temporary platform, a trailer tie-down or a moving permit can each be added to a permit, and each has its own line on the schedule.\n- **The hourly, per-page and programme charges**: additional inspections, overtime inspections, lost, revised and reworked plans, electronic concurrent plan processing, the Concierge process, the master model and owner-builder programmes, and the plan conversion fee for paper submittals.\n- **The penalty for unpermitted work** and the refund rules, which return nothing on a submittal, licence or recording fee.\n- **Any address inside a municipality.** The twenty-some cities in the county issue their own building permits, and the implementing order's up-front fee names the unincorporated area in its own title.",
      workedExample: {
        scenario:
          "A new detached single-family house in unincorporated Miami-Dade County: 2,500 square feet of floor area, permitted as a building permit.",
        inputs: {
          squareFootage: 2_500,
          occupancy: "residential",
          workType: "new_construction",
          custom: { dwelling_type: "single_family" },
        },
        notes:
          "The building fee is area times rate: \"New Construction of Detached Single Family and Duplex (per square feet) 0.96\", so 2,500 square feet is **$2,400.00**, which is above the $147.00 minimum and therefore not adjusted. The $65.00 A.8 up-front fee is added — non-refundable, and charged before plan review begins. Then the County's 7.5% RER surcharge on $2,465.00, which is $184.88, and the state's 1% and 1.5% on the $2,400.00 permit fee, $24.00 and $36.00. Total: **$2,709.88**.\n\nFour variations show what moves. As the units of a multi-unit townhome the same 2,500 square feet is $0.40 each and the permit fee is $640.00, so the total falls to $773.88. As an alteration to an existing house of the same size it is $0.50 per square foot of the structure, $1,250.00, which is over the row's $847.95 maximum and so is charged at the maximum — $1,002.62 all in. As a 30,000 square foot commercial building it is $12,000.00 and $13,269.88. And a 900 square foot slab, which the schedule prices at a flat $88.55, is raised to the $147.00 minimum and comes to $232.11.\n\nThe estimate is the building fee and its surcharges. The electrical, plumbing and mechanical permits for the same house are three more applications, and the impact, fire, environmental and utility charges the County collects alongside it are not here at all.",
      },
      faqs: [
        {
          question: "Why is the fee per square foot rather than a percentage of my project value?",
          answer:
            "Because that is how the section is written. \"New Construction of Detached Single Family and Duplex (per square feet) 0.96\" is the whole rule; there is no valuation tier anywhere in Section I.B. A 2,500 square foot house pays $2,400.00 whether the contract says $400,000 or $4,000,000, which makes the permit a fixed cost of the drawings rather than of the budget. The other Florida county on this site prices the same house on a valuation band table, and the difference is a good reason to compare a fee quote with the schedule it came from.",
          sourceId: MD_BUILDING_SOURCE_KEY,
          attribution: "Implementing Order No. 4-63, Section I.B.3",
        },
        {
          question: "What does the building minimum actually apply to?",
          answer:
            "\"The minimum fee for all residential dwelling building permits (single family, duplex) is applicable to all items in this section, except as otherwise specified. 147.00\", and \"The minimum fee for all other uses 147.00\". Read literally, the floor attaches to each item rather than to the permit: a $88.55 slab permit becomes $147.00, and a permit that combines a slab and a re-roof pays the floor once for each. Add-on permits issued as supplements to an outstanding permit for the same job are excepted from it.",
          sourceId: MD_BUILDING_SOURCE_KEY,
          attribution: "Implementing Order No. 4-63, Section I.B.2",
        },
        {
          question: "What are the three surcharges, and why are there three?",
          answer:
            "A.15 is the County's own: 7.5% \"on all Building Permitting fees listed in Section I except for Enforcement fees listed in Sub-section K\", funding the permitting activity. A.20 and A.21 are the state's: 1% for Building Construction Standards under Florida Statutes § 553.721 and 1.5% for Building Code Administrators and Inspectors under § 468.631, both charged \"of the permit fees associated with enforcement of the Florida Building Code\" and both with a $2.00 minimum on any permit. The County collects the state's two and remits them quarterly, keeping 10% for building department training.",
          sourceId: MD_BUILDING_SOURCE_KEY,
          attribution: "Implementing Order No. 4-63, Sections I.A.15, I.A.20 and I.A.21",
        },
        {
          question: "Is the $65.00 up-front fee part of the permit fee?",
          answer:
            "It is a separate non-refundable charge, and the County's plan review page explains when it falls due: \"To initiate the plan review process, upfront fees will first need to be paid.\" A.8 assesses it for permit support functions — accepting applications, distributing plans, storing documents and technology support — for applications in the unincorporated area, and there is a second row at $70.00 for municipal applications. A different, per-square-foot \"up-front\" processing fee at $0.60, $0.30 or $0.26 is also charged at application, but the order says it \"shall be credited toward the final building permit fee\", so it is a deposit and this site does not add it to any total.",
          sourceId: MD_KEYS.planReviewPage,
          attribution: "Miami-Dade County Plan Review; Implementing Order No. 4-63, Sections I.B.1 and I.A.8",
        },
        {
          question: "How is a re-roof priced?",
          answer:
            "By area: $0.11 per square foot of roof coverage including overhangs for \"Roofing shingle and other roof types not listed\", and $0.14 per square foot for clay and concrete tile. A 2,600 square foot roof is $286.00 with shingle and $364.00 with tile, plus the $65.00 up-front fee and the surcharges. The shingle row is the residual category rather than a description of the covering — it says \"and other roof types not listed\" — so a re-roof whose covering has not been named is priced there.",
          sourceId: MD_BUILDING_SOURCE_KEY,
          attribution: "Implementing Order No. 4-63, Section I.B.8",
        },
        {
          question: "Is the plan review included in this figure?",
          answer:
            "The up-front fee that initiates it is, and nothing else is. The County completes plan review electronically with several departments at once, and the review itself is charged inside the fee: there is no separate percentage on the building section. What is not included is the expedited work — Concierge permitting, the Cookie Cutter programme, the master model and owner-builder processes, green building and affordable housing expedited review — and the plan conversion fee that applies if plans are submitted on paper rather than through the portal.",
          sourceId: MD_KEYS.planReviewPage,
          attribution: "Miami-Dade County Plan Review",
        },
        {
          question: "What happens if work starts before the permit is issued?",
          answer:
            "The implementing order prices \"Work Without a Permit\" in its general section, and both trade fee sheets put the same warning above the signature line: \"Refunds will not be given in case of error on your part and you will be charged a double fee for doing work without a permit.\" Refunds are also restricted the other way: the section states that nothing is returned on a submittal, licence or recording fee, and that a refund of a permit fee is subject to its own charge.",
          sourceId: MD_PLUMBING_SHEET_SOURCE_KEY,
          attribution: "Plumbing and Gas Fee Sheet, applicant declaration",
        },
      ],
      seoTitle: "Miami-Dade County Building Permit Cost (per square foot)",
      seoDescription:
        "A Miami-Dade County building permit is charged per square foot — $0.96 for a new house, $0.40 for townhomes and commercial, $0.50 for alterations capped at $847.95 — plus a $65.00 up-front fee and 7.5% + 1% + 1.5% surcharges.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: MD_LAST_VERIFIED,
    },

    {
      jurisdictionKey: MD_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      slug: "electrical-permit-cost",
      title: "Miami-Dade County electrical permit cost",
      intro:
        "A Miami-Dade County electrical permit is priced from the **fee sheet the applicant submits**, a row at a time: a permanent service at $7.26 per 100 amperes, an outlet box at $2.59, a fixture at $2.59, a panel board at $32.21, a ton of air conditioning at $9.66, a feeder at $19.33, residential wiring at $0.113 per square foot of the master permit. The permit has a floor of **$227.90** — which the sheet states in words and which is the County's $147.00 minimum plus its $65.00 up-front fee plus 7.5% of both — and the state's 1% and 1.5% surcharges are charged on top of that.",
      localSummary:
        "The important thing about this schedule is that a permit is a **sum of lines**, not a choice between them. The County requires the electrical fee sheet to be submitted with the application, and the sheet is a table of codes with a units column; a real permit lists a service, its outlets, its fixtures, a panel board and the air conditioning. So the pages of this site price the rows it is given: sixty outlets, one panel board, forty fixtures and five tons of cooling on one permit is **$443.34** including the up-front fee and the three surcharges, while a permit that is only a 400-ampere service stops at the floor, **$232.11**.\n\nThat floor is worth dwelling on, because it is the one place in this dataset where a schedule's own arithmetic can be checked against a figure it prints. The sheet says \"Minimum fee for electrical permits is $227.90\". The County's building minimum is $147.00. The A.8 up-front fee is $65.00. And the RER surcharge is 7.5%. $147.00 plus $65.00 is $212.00, and $212.00 plus 7.5% is $227.90 exactly — which tells a reader two things the schedule never spells out: that the floor is measured on the fee rows and not on the total, and that the County's own 7.5% is charged on the up-front fee as well. This site's rules are arranged so that the sequence reproduces $227.90, and the test suite asserts it.\n\nThe per-row structure also decides which rows are alternatives. A permanent service, a temporary construction service, pool wiring, a solar photovoltaic system, a burglar alarm and an electrical demolition are one each — the sheet's categories make them mutually exclusive — while feeders, outlet boxes, special outlets, fixtures, panel boards, tonnage and stories of fire alarm are counts and add up. Two rows are shared with other sheets deliberately: the air conditioning tonnage is on the electrical sheet as `G008` at $9.66 per ton and on the mechanical sheet as well, and the meter reset and re-inspection rows are the division's own, priced at $38.00 and printed on the plumbing sheet too.\n\nOne row is a rate on papers rather than on hardware: residential wiring for new construction, additions, alterations and repairs is `G080` at $0.113 per square foot, and the fee sheet's own note says \"the fee will be calculated based on the square footage on the master permit\" — so a 2,500 square foot residence is $282.50 before anything is installed in it.",
      notIncluded:
        "This estimate is the electrical fee sheet rows given to it, the $227.90 permit floor when it applies, the $65.00 up-front fee and the three surcharges. It excludes:\n\n- **The mechanical permit** on the same job — the County's Mechanical Fee Sheet prices air conditioning, refrigeration and ductwork per ton and per unit — and the **plumbing and gas permit**, which is a separate form.\n- **The rows priced by length or by state grant**: plugmold track lighting at $5.01 per five feet, empty conduit ductbank at $2.91 per lineal foot, the per-10-KW transformer and heating rows, the smoke and carbon monoxide detector row at $1.92 per device, the 10-KW commercial equipment row, the time clock, the manhole and the motor replacement.\n- **The service conversion and re-energizing checks** where a repair to a commercial service requires a scope of work document or the upgrade requires commercial plans.\n- **The expedited and programme routes** — Concierge, master, Cookie Cutter, green building — and the optional after-hours plan review.\n- **The plan conversion fee** for paper submittals, the rework and re-submittal charges, and additional or overtime inspections.\n- **Other agencies' charges** collected with the permit: Fire Rescue's review and inspection fees, DERM's, Water and Sewer's, and the impact fees.\n- **The double fee** both trade sheets impose for work done without a permit.",
      workedExample: {
        scenario:
          "A commercial electrical permit in unincorporated Miami-Dade County carrying the rows a tenant fit-out needs: sixty general wiring outlet boxes, one panel board, forty fixtures and five tons of air conditioning tonnage — filed on the electrical fee sheet.",
        inputs: {
          custom: {
            electrical_item: "outlet",
            outlets: 60,
            panels: 1,
            lighting_fixtures: 40,
            tons: 5,
          },
        },
        notes:
          "Each row is charged on its own code and its own count: `G005` sixty outlet boxes at $2.59 is $155.40, `G045` one panel board at $32.21, `G009` forty fixtures at $2.59 is $103.60, and `G008` five tons at $9.66 is $48.30. The rows total **$339.51**, which is above the $147.00 floor, so no minimum adjustment applies. The $65.00 up-front fee is added, the County's 7.5% surcharge on the $404.51 charged so far is $30.34, and the state's 1% and 1.5% on the $339.51 permit fee are $3.40 and $5.09. Total: **$443.34**.\n\nThe floor is the reading worth checking against the sheet, and a permit consisting of nothing but a service demonstrates it. A permanent service of 400 amperes is `G034` at $7.26 per 100 amperes, $29.04. The floor raises the fee rows to $147.00 — a $117.96 shortfall, charged once — the $65.00 up-front fee brings it to $212.00, and 7.5% of that is $15.90. Those three are exactly the sheet's **$227.90** minimum, and the state's two surcharges add $2.00 and $2.21 above it for a total of $232.11.\n\nTwo rows in the same shape are worth knowing before filing. Residential wiring is priced on the master permit's square footage rather than on the installation — $0.113 per square foot — and it is a single row: a 2,500 square foot residence is $282.50, and it replaces the outlet and fixture counts rather than joining them. And a solar photovoltaic system is a flat amount that differs by mounting, $365.63 roof-mounted against $325.00 ground-mounted, so the mounting has to be named for either row to apply.",
      },
      faqs: [
        {
          question: "Why does an electrical permit here look like a list rather than a rate?",
          answer:
            "Because the County requires the applicant to file the electrical fee sheet with the application, and the sheet is a table: a fee code, a description, a calculation, a unit and a number of units for every row. \"Permit Fee Sheets must be submitted as part of a permit application when applying for electrical, mechanical or plumbing permits. Fee sheets break down the cost of permit by category.\" A permit is the sum of the lines on that form.",
          sourceId: MD_KEYS.feesPage,
          attribution: "Miami-Dade County, Building Fee Schedules",
        },
        {
          question: "What is the minimum an electrical permit can cost?",
          answer:
            "The sheet states it in words rather than as a formula: \"Minimum fee for electrical permits is $227.90.\" That figure is the County's $147.00 minimum on the fee rows, plus the $65.00 A.8 up-front fee, plus 7.5% of both. With the state's 1% and 1.5% surcharges charged over it, the least a permit ends up costing is $232.11. The floor is charged once per permit rather than once per row, so a permit whose lines already exceed $147.00 pays nothing extra for it.",
          sourceId: MD_ELECTRICAL_SHEET_SOURCE_KEY,
          attribution: "Electrical Fee Sheet, form 123_01-57/26",
        },
        {
          question: "How much is a 200-ampere service, or a 400-ampere one?",
          answer:
            "`G034` prices a permanent service at $7.26 per 100 amperes, and `G067` prices the repair or upgrade of an existing service at the same rate, with `G079` pricing a safety check for re-energizing one. So 200 amperes is $14.52 and 400 amperes is $29.04 — and on its own either lands on the permit's $227.90 floor rather than being charged as it stands. A 450-ampere service is charged as five hundreds, $36.30, because the schedule charges \"each 100 amp. or fractional part\".",
          sourceId: MD_ELECTRICAL_SHEET_SOURCE_KEY,
          attribution: "Electrical Fee Sheet, Category 01",
        },
        {
          question: "Is the air conditioning charged on the electrical permit as well as the mechanical one?",
          answer:
            "The electrical sheet prices it: `G008` \"Air-condition units, refrigeration units, or cooler system/structure — $9.66 per Ton\". The mechanical sheet and the implementing order price the same equipment on their own terms, so the tonnage appears twice in the County's paperwork — once as an electrical row and once as mechanical work. This site charges the electrical row on this page and does not price the mechanical permit at all.",
          sourceId: MD_ELECTRICAL_SHEET_SOURCE_KEY,
          attribution: "Electrical Fee Sheet, Category 01",
        },
        {
          question: "How is the wiring for a new house charged?",
          answer:
            "By the square footage of the master permit: `G080` \"Residential wiring-new construction, additions, alterations & repairs — 0.113 per Sq ft\", and the sheet's Category 01 note adds \"please note the fee will be calculated based on the square footage on the master permit\". It is a row in place of the outlet and fixture counts for a residence, and the order prints the same figure to three decimals, so a 2,500 square foot house is $282.50.",
          sourceId: MD_ELECTRICAL_SHEET_SOURCE_KEY,
          attribution: "Electrical Fee Sheet, Category 01",
        },
        {
          question: "What does the 7.5% cover, and is it charged on the state's surcharges too?",
          answer:
            "It is the County's own surcharge, and its scope is stated: \"A Building Permitting surcharge of seven and one half (7.5%) percent on all Building Permitting fees listed in Section I except for Enforcement fees listed in Sub-section K. This surcharge is to be used to fund incremental direct costs and reasonable indirect costs associated with the Building Permitting activity.\" It is charged on everything charged before it, including the $65.00 up-front fee — $212.00 becomes $227.90, which is the sheet's own minimum — while the state's 1% and 1.5% are charged on the permit fee alone.",
          sourceId: MD_BUILDING_SOURCE_KEY,
          attribution: "Implementing Order No. 4-63, Section I.A.15",
        },
        {
          question: "Are solar and pool permits priced the same way?",
          answer:
            "They are flat rows rather than counts: `G059` and the implementing order price a residential pool or spa electrical permit at $144.91, a roof-mounted solar photovoltaic system at $365.63 and a ground-mounted one at $325.00, a burglar alarm at $40.00 and an electrical demolition at $64.61. Each is one charge per permit, and each is below the $147.00 floor unless it is combined with other rows — which is why a pool wiring permit on its own comes to $232.11.",
          sourceId: MD_ELECTRICAL_SHEET_SOURCE_KEY,
          attribution: "Electrical Fee Sheet, Categories 07 to 12",
        },
      ],
      seoTitle: "Miami-Dade County Electrical Permit Cost (fee sheet rows)",
      seoDescription:
        "A Miami-Dade County electrical permit is priced from the County's electrical fee sheet — $7.26 per 100 amperes, $2.59 an outlet, $32.21 a panel board, $9.66 a ton — with a $227.90 minimum and three surcharges.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: MD_LAST_VERIFIED,
    },

    {
      jurisdictionKey: MD_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      slug: "plumbing-permit-cost",
      title: "Miami-Dade County plumbing permit cost",
      intro:
        "A Miami-Dade County plumbing permit is priced from the **Plumbing and Gas Fee Sheet** the applicant files: **$0.143 per square foot** for a new or altered one- or two-family house, $9.66 for each roughed-in outlet or fixture, $48.31 per sewer connection, $12.88 per water service meter, and $56.36 or $88.55 for a backflow assembly by size. The permit has a floor of **$227.90** — the County's $147.00 minimum plus its $65.00 up-front fee plus 7.5% of both — and gas work is on the same form rather than a separate permit.",
      localSummary:
        "A plumbing permit here is a sum of rows from one applicant-facing form, and gas is one of its categories. Category 01 is general plumbing: `P051` and `P052` price a new, altered or repaired one- or two-family house at \"0.14x per Sq ft\" — the implementing order prints the same rate as 0.143, which is the figure this site charges — `P001` prices a roughed-in or plugged outlet at $9.66 and `P032` a fixture at the same $9.66, `P003` and `P044` price a sewer connection to a public or a private system at $48.31, and `P010` prices a water service connection at $12.88 for each meter on each lot. Category 02 is gas: outlets and appliances at $9.66 residential and $16.10 commercial, meters at $6.45, repairs to gas pipes at $56.36 per repair, flue pipe at $9.66. Category 03 is a lawn sprinkler system at $27.06 per zone, and Category 05 is chemical toilets for special events, the first at $147.00 and each additional at $13.29.\n\nThe house is therefore priced twice over — once by its area and once by what is installed in it — and the two are separate lines on the same application rather than alternatives. A 2,500 square foot house with eighteen fixtures, one sewer connection and one water meter is $357.50 of area, $173.88 of fixture work, $48.31 of sewer and $12.88 of water service, and it is the sum and not the largest of them that the form adds up. That is a genuinely different shape from every other plumbing schedule on this site: Portland prices a new house by how many baths it has, Orange County by a flat fee plus a fixture count, and neither of them prices the area as well.\n\nThe floor behaves the way it does on the electrical page, and for the same stated reason. \"Minimum fee for plumbing permits is $227.90\" is $147.00 plus $65.00 plus 7.5% of both, so a permit of six fixtures at $57.96 has $89.04 added to reach $147.00, pays the $65.00 up-front fee, and contributes 7.5% of $212.00 — $15.90 — to the surcharge stack, landing at $232.11 after the state's two surcharges. A permit that already exceeds $147.00 of rows pays nothing for the floor.\n\nThe one row that is priced by length comes last on this page rather than first: `P028` building sewerline at $11.28 per 50 feet, with `P016` repairs to water piping at $2.59 per 50 feet and `P046` sanitary pipelines at $11.28 per 50 feet. This site does not collect a pipe length, so it names them instead of pricing them, which is also why the sewer *connection* is priced here and the sewer *line* is not.",
      notIncluded:
        "This estimate is the plumbing and gas fee sheet rows given to it, the $227.90 permit floor when it applies, the $65.00 up-front fee and the three surcharges. It excludes:\n\n- **The rows priced by length**: building sewerline and sanitary pipelines at $11.28 per 50 feet, repairs to water piping at $2.59 per 50 feet — a length this site does not collect.\n- **The gas fitting rows** beyond the meter: residential and commercial gas outlets and appliances, gas pipe repairs, flue pipe, and the water heater and ice maker connection rows.\n- **The remaining categories of the same form**: lawn sprinkler systems at $27.06 per zone and the chemical toilet rows for special events, plus the rule that a renewal is charged the original permit fee.\n- **The mechanical permit and the electrical permit** on the same job, each filed on its own sheet, one of which this site prices.\n- **Other agencies' charges** collected with the permit: Water and Sewer's connection and capacity charges, DERM's environmental fees, Fire Rescue's, and the impact fees.\n- **The additional inspection rows**: `P060` at $92.48 per inspection, and the re-inspection figure shared across the trades.\n- **The double fee** the sheet imposes for work done without a permit, and the refund restrictions on submittal, licence and recording fees.",
      workedExample: {
        scenario:
          "A new one-family house in unincorporated Miami-Dade County: 2,500 square feet of floor area with eighteen plumbing fixtures, one sewer connection to the public system and one water service meter — filed on the plumbing and gas fee sheet.",
        inputs: {
          squareFootage: 2_500,
          fixtures: 18,
          occupancy: "residential",
          workType: "new_construction",
          custom: { plumbing_item: "water_service", connections: 1, meters: 1 },
        },
        notes:
          "Four rows, each on its own code and its own unit: `P051` prices the house at $0.143 per square foot, which is **$357.50**; `P001`/`P032` price eighteen roughed-in outlets and fixtures at $9.66 each, **$173.88**; `P003` prices one sewer connection at $48.31; and `P010` prices one water service meter at $12.88. The rows total **$592.57**, comfortably above the $147.00 floor, so no minimum adjustment applies. The $65.00 up-front fee brings the charged subtotal to $657.57 and the County's 7.5% surcharge on it is $49.32; the state's 1% and 1.5% are charged on the $592.57 permit fee, $5.93 and $8.89. Total: **$721.71**.\n\nA permit that is one stand-alone job rather than a whole house shows the floor at work. Six fixtures with nothing else is $57.96 of rows, which the floor raises by $89.04 to $147.00; with the $65.00 up-front fee, $15.90 of RER surcharge and the state's $2.00 and $2.21, the total is $232.11 — the same figure a one-row electrical permit reaches, because both sheets state the same $227.90 minimum.\n\nTwo cautions belong with the numbers. The fixture count is what the schedule says it is — \"fixtures discharging into traps or safe waste pipes, floor drains, laundry tubs, lavatories, showers, sinks, urinals, and heaters\" among others — and the site charges $9.66 for each one reported rather than deciding which of a project's fittings count. And the gas rows are on this form but not in this total: a gas water heater set, an outlet or a flue pipe is charged on the same application and adds to it.",
      },
      faqs: [
        {
          question: "Why is a new house charged by area and by fixture?",
          answer:
            "Because they are two different lines on the same form. `P051` prices new single family residence or duplex work at $0.143 per square foot of the master permit, and `P001`/`P032` price each roughed-in outlet and each fixture at $9.66. Both are claimed on the plumbing and gas fee sheet, and the form adds the lines rather than picking one, so a house with eighteen fixtures pays for its area and for its fixtures.",
          sourceId: MD_PLUMBING_SHEET_SOURCE_KEY,
          attribution: "Plumbing and Gas Fee Sheet, form 123_01-708/26, Category 01",
        },
        {
          question: "What is the minimum a plumbing permit can cost?",
          answer:
            "\"Minimum fee for plumbing permits is $227.90\", stated at the top of the sheet. That is the County's $147.00 minimum on the fee rows, its $65.00 up-front fee, and 7.5% of both — the same construction as the electrical sheet's floor, which reinforces that this is how the County computes it. With the state's 1% and 1.5% surcharges the least a plumbing permit costs is $232.11, and the floor is charged once per permit rather than once per row.",
          sourceId: MD_PLUMBING_SHEET_SOURCE_KEY,
          attribution: "Plumbing and Gas Fee Sheet, form 123_01-708/26",
        },
        {
          question: "Is the gas permit separate?",
          answer:
            "It is a separate category of the same form rather than a separate application: Category 02, \"GAS FITTING (natural gas) (must be on separate application)\" — so it is a distinct permit that is applied for on the plumbing and gas sheet, and `P019` and `P062` price appliances at $9.66 residential and $16.10 commercial. The fixture and area rows are Category 01 and are not part of it.",
          sourceId: MD_PLUMBING_SHEET_SOURCE_KEY,
          attribution: "Plumbing and Gas Fee Sheet, Category 02",
        },
        {
          question: "How much is a sewer connection or a water service?",
          answer:
            "`P003` sewer connection to the public system and `P044` to a private system are both $48.31 per connection, and the implementing order prices \"each building storm sewer and each building sewer where connection is made to a septic tank, or a collector line or to an existing sewer\" at the same figure. `P010` prices the water service connection at $12.88 \"for each meter on each lot\". The piping between those connections is priced by length — `P028` at $11.28 per 50 feet — and is not included here because this site does not collect a pipe length.",
          sourceId: MD_PLUMBING_SHEET_SOURCE_KEY,
          attribution: "Plumbing and Gas Fee Sheet, Category 01",
        },
        {
          question: "What does a backflow assembly cost?",
          answer:
            "`P033` prices a water service backflow assembly of 2 inches or less at $56.36 each and `P034` one of 2 1/2 inches or larger at $88.55, which the implementing order prints as the same two figures. Both are per assembly, so a building with four devices pays four of them, and the size is what decides which of the two rows applies.",
          sourceId: MD_PLUMBING_SHEET_SOURCE_KEY,
          attribution: "Plumbing and Gas Fee Sheet, Category 01",
        },
        {
          question: "Is there a re-inspection fee?",
          answer:
            "There is, and it is shared across the trades: the division charges $38.00 for a re-inspection and $38.00 for a meter reset, printed on the same section by the electrical and plumbing schedules rather than inside either of them. The plumbing sheet's own additional-inspection row is different and larger — `P060` at $92.48 per inspection — and the re-inspection figure for a commercial or residential job is also stated in the implementing order's electrical minimum note.",
          sourceId: MD_BUILDING_SOURCE_KEY,
          attribution: "Implementing Order No. 4-63, Sections I.D and I.C",
        },
        {
          question: "What happens if the work is done without a permit?",
          answer:
            "The sheet says so above the signature line: \"Refunds will not be given in case of error on your part and you will be charged a double fee for doing work without a permit.\" The implementing order prices the same penalty in its own section, and the refund rules work the other way as well — nothing is returned on a submittal, licence or recording fee, and a permit refund carries its own charge.",
          sourceId: MD_PLUMBING_SHEET_SOURCE_KEY,
          attribution: "Plumbing and Gas Fee Sheet, applicant declaration",
        },
      ],
      seoTitle: "Miami-Dade County Plumbing Permit Cost (fee sheet rows)",
      seoDescription:
        "A Miami-Dade County plumbing permit is priced from the County's plumbing and gas fee sheet — $0.143 per square foot, $9.66 a fixture, $48.31 a sewer connection, $12.88 a water meter — with a $227.90 minimum.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: MD_LAST_VERIFIED,
    },
  ],

  verifications: [
    {
      entityType: "source",
      entityKey: MD_BUILDING_SOURCE_KEY,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: MD_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: MD_BUILDING_SOURCE_KEY,
      notes:
        "Read in full in three pdftotext modes and compared, then re-fetched on 2026-09-24 from the URL the County's own fee page links, which returned the same 509,495 bytes and the same sha256 beginning 7f23cd971ade46be. The order's dates were read from its first page: ordered June 16, 2026, effective June 26, 2026, superseding the order of June 26, 2025.",
    },
    {
      entityType: "source",
      entityKey: MD_ELECTRICAL_SHEET_SOURCE_KEY,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: MD_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: MD_ELECTRICAL_SHEET_SOURCE_KEY,
      notes:
        "Read in three modes and re-fetched on 2026-09-24 to confirm the URL still serves the file the rules were built from — same size, same sha256 beginning c52d753a6c00f281. Every rate on the sheet was compared with the matching section of the implementing order and no disagreement was found.",
    },
    {
      entityType: "source",
      entityKey: MD_PLUMBING_SHEET_SOURCE_KEY,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: MD_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: MD_PLUMBING_SHEET_SOURCE_KEY,
      notes:
        "Read in three modes and re-fetched on 2026-09-24, sha256 beginning c4aec030fb2ff505. Its categories were transcribed in full: general plumbing, gas fitting, lawn sprinkler, chemical toilets and renewals.",
    },
    {
      entityType: "fee_schedule",
      entityKey: MD_BUILDING_SOURCE_KEY,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: MD_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: MD_BUILDING_SOURCE_KEY,
      notes:
        "The building schedule is one section of the implementing order, and the fees the site charges on the building page are all from it: the area rows of B.3 to B.5, the named rows, the $147.00 minimum of B.2, the $65.00 up-front fee of A.8 and the three surcharges of A.15, A.20 and A.21.",
    },
    {
      entityType: "fee_rule",
      entityKey: "BUILD-SFD-NEW",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: MD_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: MD_BUILDING_SOURCE_KEY,
      notes:
        '"New Construction of Detached Single Family and Duplex (per square feet) 0.96" and "Single Family and Duplex - Additions (per square foot): 0.96". The same section prices multi-unit townhomes at 0.40, which is why the two are separate rules and why the townhome one is gated on the dwelling type rather than on the occupancy.',
    },
    {
      entityType: "fee_rule",
      entityKey: "BUILD-SFD-ALTERATION",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: MD_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: MD_BUILDING_SOURCE_KEY,
      notes:
        '"Alterations or repairs to Single Family Residence or Duplex (per total square footage of the structure) 0.500 — Maximum Fee 847.95". The maximum was checked to bind: at 2,000 square feet the rate would produce $1,000.00 and the rule charges $847.95.',
    },
    {
      entityType: "fee_rule",
      entityKey: "ELEC-TRADE-MINIMUM",
      permitTypeKey: "electrical",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: MD_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: MD_ELECTRICAL_SHEET_SOURCE_KEY,
      notes:
        "The sheet states the floor as a figure — \"Minimum fee for electrical permits is $227.90\" — and the rule reproduces it from three published parts: $147.00 of fee rows, the $65.00 up-front fee of A.8, and 7.5% of both. Verified end to end: a permit consisting of a 400-ampere service alone computes $29.04 of rows, a $117.96 shortfall, $65.00 of up-front fee and $15.90 of RER surcharge, which is $227.90 exactly, and $232.11 after the state's two surcharges. This is the assertion that proves the surcharge orderings in the engine match the County's.",
    },
    {
      entityType: "fee_rule",
      entityKey: "PLUMB-SFD",
      permitTypeKey: "plumbing",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: MD_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: MD_PLUMBING_SHEET_SOURCE_KEY,
      notes:
        "Section I.C.2 prints \"per square foot 0.143\" and the fee sheet prints the same row as `P051`/`P052` at \"0.14x per Sq ft\". The order's three-decimal figure is the one charged, which is why the rule carries 143/10 rather than a rounded 0.14.",
    },
    {
      entityType: "fee_rule",
      entityKey: "PLB-TRADE-MINIMUM",
      permitTypeKey: "plumbing",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: MD_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: MD_PLUMBING_SHEET_SOURCE_KEY,
      notes:
        "The plumbing sheet states the same $227.90 floor in the same words as the electrical sheet. It was checked against a permit of six fixtures: $57.96 of rows, an $89.04 shortfall, $65.00 of up-front fee and $15.90 of RER surcharge, again $227.90 before the state's two surcharges.",
    },
    {
      entityType: "permit_page",
      entityKey: "building-permit-cost",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: MD_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: MD_BUILDING_SOURCE_KEY,
      notes:
        "The worked example was recomputed with the engine: $2,400.00 + $65.00 + $184.88 + $24.00 + $36.00 = $2,709.88. The variants quoted on the page were each computed too — townhome $773.88, capped alteration $1,002.62, 30,000 square foot commercial $13,269.88, and a 900 square foot slab raised to the $147.00 minimum at $232.11.",
    },
    {
      entityType: "permit_page",
      entityKey: "electrical-permit-cost",
      permitTypeKey: "electrical",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: MD_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: MD_ELECTRICAL_SHEET_SOURCE_KEY,
      notes:
        "The five-row example was recomputed with the engine: $339.51 of rows, $65.00 of up-front fee, $30.34 of RER surcharge, $3.40 and $5.09 of state surcharge, $443.34. The service alone was computed separately to prove the floor: $232.11 against the sheet's published $227.90.",
    },
    {
      entityType: "permit_page",
      entityKey: "plumbing-permit-cost",
      permitTypeKey: "plumbing",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: MD_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: MD_PLUMBING_SHEET_SOURCE_KEY,
      notes:
        "The four-row example was recomputed with the engine: $357.50 of area, $173.88 of fixtures, $48.31 of sewer connection, $12.88 of water service, $65.00 of up-front fee, $49.32 of RER surcharge, $5.93 and $8.89 of state surcharge, $721.71.",
    },
    {
      entityType: "jurisdiction_profile",
      entityKey: MD_KEYS.jurisdiction,
      status: "verified",
      method: "manual_review",
      verifiedAt: MD_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: MD_KEYS.feesPage,
      notes:
        "The profile's claims about what a permit fee includes, and about which agencies collect alongside it, are quoted from the County's own fee page rather than inferred from the order; the municipalities named in the exclusions are read off the implementing order's distinction between unincorporated-area applications and municipal ones, which the A.8 up-front fee states explicitly.",
    },
  ],
};

/** Permit pages that clear the editorial gate for this jurisdiction. */
export const MD_PUBLISHED_PERMIT_PAGES = miamiDadeSeed.permitPages.filter(
  (page) => page.publishStatus === "published" && !page.noindex,
);
