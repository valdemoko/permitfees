import type { JurisdictionSeed } from "@/content/seed-types";
import {
  CHI_BUILDING_RULES,
  CHI_BUILDING_SOURCE_KEY,
  CHI_CALCULATOR_SOURCE_KEY,
  CHI_CODE_EXCERPTS_SOURCE_KEY,
  CHI_ELECTRICAL_RULES,
  CHI_EXPRESS_PERMIT_SOURCE_KEY,
  CHI_FEE_EFFECTIVE_FROM,
  CHI_ORDINANCE_SOURCE_KEY,
  CHI_PLUMBING_RULES,
} from "@/content/chicago/fee-rules";

/**
 * Chicago, Illinois — the jurisdiction that prices a building permit **from area and two
 * published factor tables**, and the first jurisdiction on this site whose fee is the
 * product of two lookup tables rather than a single rate.
 *
 * Everything here comes from four documents the City publishes: DOB's 2026 Amended Building
 * Permit Fee Tables, the substitute ordinance (SO2025-0021719) that produced them, the 2022
 * code excerpts that carry §14A-4-412 and Table 14A-12-1204.2, and the Department's fee
 * calculator page. amlegal's Code Library — the City-Linked publisher of the Municipal Code
 * — answers 403 from this environment, so the ordinance was read from the City Clerk's own
 * Legislation API and the amounts cross-checked between the three documents rather than
 * against a handy HTML copy of the code.
 */

export const CHI_LAST_VERIFIED = "2026-09-25";

export const CHI_KEYS = {
  state: "il",
  county: "cook-county",
  jurisdiction: "chicago",
  building: CHI_BUILDING_SOURCE_KEY,
  ordinance: CHI_ORDINANCE_SOURCE_KEY,
  code: CHI_CODE_EXCERPTS_SOURCE_KEY,
  calculator: CHI_CALCULATOR_SOURCE_KEY,
  express: CHI_EXPRESS_PERMIT_SOURCE_KEY,
} as const;

const RESEARCHER = "Permit Fee Intelligence research pass 16 (Illinois)";

const state = {
  code: "IL",
  slug: "illinois",
  name: "Illinois",
  fipsCode: "17",
};

const county = {
  key: CHI_KEYS.county,
  slug: "cook-county",
  name: "Cook County",
  fipsCode: "17031",
};

const TABLES_URL =
  "https://www.chicago.gov/content/dam/city/depts/bldgs/general/Permitfees/2026%20Amended%20Permit%20Fee%20Tables.pdf";
const ORDINANCE_URL =
  "https://occprodstoragev1.blob.core.usgovcloudapi.net/matterattachmentspublic/27253856-496b-4f12-81be-4d69dddfcc7a.pdf";
const CODE_EXCERPTS_URL =
  "https://www.chicago.gov/content/dam/city/depts/bldgs/general/Permitfees/Permit%20Fee%20Excerpts%202022.pdf";
const CALCULATOR_URL =
  "https://www.chicago.gov/city/en/depts/bldgs/provdrs/permits/svcs/permit_fee_calculator.html";
const EXPRESS_URL =
  "https://www.chicago.gov/city/en/depts/bldgs/provdrs/permits/svcs/express-permits.html";

export const chicagoSeed: JurisdictionSeed = {
  state,
  county,

  jurisdiction: {
    key: CHI_KEYS.jurisdiction,
    stateKey: CHI_KEYS.state,
    countyKey: CHI_KEYS.county,
    type: "city",
    slug: "chicago",
    name: "Chicago",
    officialName: "City of Chicago — Department of Buildings",
    websiteUrl: "https://www.chicago.gov/city/en/depts/bldgs.html",
    permitPortalUrl: EXPRESS_URL,
    timezone: "America/Chicago",
    isActive: true,
  },

  departments: [
    {
      key: "chicago-department-of-buildings",
      jurisdictionKey: CHI_KEYS.jurisdiction,
      kind: "building",
      name: "Chicago Department of Buildings",
      phone: null,
      email: "dob-info@cityofchicago.org",
      url: CALCULATOR_URL,
      addressLine: null,
      hours: null,
      notes:
        'The Department publishes the fee tables under §14A-12-1204.3.1 and runs the Express Permit Program for the trade permits. Its own fee page names the 2026 tables as the schedule for permits issued 2026-01-01 or later and lists the superseded 2023–2025 tables beside them, which is what makes the effective date a published fact rather than an assumption. Fee questions go to the address printed on that page and repeated here.',
    },
  ],

  sources: [
    {
      key: CHI_BUILDING_SOURCE_KEY,
      jurisdictionKey: CHI_KEYS.jurisdiction,
      title: "2026 Amended Building Permit Fee Tables (effective January 6, 2026)",
      url: TABLES_URL,
      sourceType: "fee_schedule_pdf",
      issuingAuthority: "Chicago Department of Buildings",
      authorityKind: "city",
      isPrimary: true,
      documentDate: "2026-01-06",
      effectiveFrom: CHI_FEE_EFFECTIVE_FROM,
      retrievedAt: CHI_LAST_VERIFIED,
      lastVerifiedAt: CHI_LAST_VERIFIED,
      notes:
        "Read 2026-09-25, sha256 beginning `2e5f2a52b5ccfd48`. Issued under §14A-12-1204.3.1 and updated for Ordinance SO2025-0021719. Carries Tables 14A-12-1204.3(1), (3), (4), (5) and (6) — the construction factor, the two scope-of-review factors, exterior wall rehabilitation and phased permitting — with the Minimum Fee column and footnotes a to d. Extracted with `pdftotext -table`; `-layout` mis-pairs the amount column in the stand-alone tables and was not used for rates.",
    },
    {
      key: CHI_ORDINANCE_SOURCE_KEY,
      jurisdictionKey: CHI_KEYS.jurisdiction,
      title: "Substitute Ordinance SO2025-0021719 (2026 Municipal Code Revenue Ordinance)",
      url: ORDINANCE_URL,
      sourceType: "ordinance",
      issuingAuthority: "City Council of the City of Chicago",
      authorityKind: "city",
      isPrimary: true,
      documentDate: "2025-12-19",
      effectiveFrom: CHI_FEE_EFFECTIVE_FROM,
      retrievedAt: CHI_LAST_VERIFIED,
      lastVerifiedAt: CHI_LAST_VERIFIED,
      notes:
        "Passed 2025-12-19, sha256 beginning `37df4b6046141705`. Retrieved through the City Clerk's Legislation API (`api.chicityclerkelms.chicago.gov`) because amlegal's Code Library answers 403 from this environment. Its Article XXVI §3 sets the effective date: the new amounts apply no earlier than ten days after passage or 2026-01-01, whichever is later — which the Department published as 2026-01-06. §7 and §8 print exactly which process fees and which Table 14A-12-1204.2 rows changed.",
    },
    {
      key: CHI_CODE_EXCERPTS_SOURCE_KEY,
      jurisdictionKey: CHI_KEYS.jurisdiction,
      title: "Excerpts of the Chicago Construction Codes related to building permit fees (effective January 1, 2022)",
      url: CODE_EXCERPTS_URL,
      sourceType: "municipal_code",
      issuingAuthority: "City of Chicago",
      authorityKind: "city",
      isPrimary: true,
      documentDate: "2022-01-01",
      effectiveFrom: "2022-01-01",
      retrievedAt: CHI_LAST_VERIFIED,
      lastVerifiedAt: CHI_LAST_VERIFIED,
      notes:
        "Read 2026-09-25, sha256 beginning `2512a02138641748`. Carries §14A-4-412 in full — the formula `CF × RF × A`, the stand-alone-fee route of §14A-4-412.1, the process fees of Table 14A-12-1204.1 and the stand-alone fees of Table 14A-12-1204.2 — plus footnote d taking demolition out of the formula. The stand-alone table lives in the code rather than in the annual PDFs, so this document plus the 2026 ordinance is the current version of the trade fees; Table 14A-12-1204.2 gets its first automatic CPI adjustment on 2027-01-01 under the §14A-12-1204.2.1 the ordinance inserts.",
    },
    {
      key: CHI_CALCULATOR_SOURCE_KEY,
      jurisdictionKey: CHI_KEYS.jurisdiction,
      title: "City of Chicago — Calculate the Cost of a Building Permit",
      url: CALCULATOR_URL,
      sourceType: "official_calculator",
      issuingAuthority: "Chicago Department of Buildings",
      authorityKind: "city",
      isPrimary: true,
      documentDate: null,
      effectiveFrom: null,
      retrievedAt: CHI_LAST_VERIFIED,
      lastVerifiedAt: CHI_LAST_VERIFIED,
      notes:
        "Read 2026-09-25, HTTP 200. The Department's fee index. Its inputs are construction type, occupancy type, floor area and project scope — **no valuation** — which is the clearest statement anywhere that Chicago's building permit is priced from area. It names the 2026 tables as the schedule for permits issued from 2026-01-01 and lists the superseded tables beside them.",
    },
    {
      key: CHI_EXPRESS_PERMIT_SOURCE_KEY,
      jurisdictionKey: CHI_KEYS.jurisdiction,
      title: "City of Chicago — Express Permit Program",
      url: EXPRESS_URL,
      sourceType: "municipal_website",
      issuingAuthority: "Chicago Department of Buildings",
      authorityKind: "city",
      isPrimary: true,
      documentDate: null,
      effectiveFrom: null,
      retrievedAt: CHI_LAST_VERIFIED,
      lastVerifiedAt: CHI_LAST_VERIFIED,
      notes:
        "Read 2026-09-25, HTTP 200. Launched 2023-11-06, replacing the Easy Permit and Short Form processes, and expanded 2024-09-16. Confirms that electrical and plumbing permits are issued as stand-alone (express) permits — the route §14A-4-412.1 prices from Table 14A-12-1204.2 — including monthly electrical and plumbing maintenance worktypes.",
    },
  ],

  /** Empty on purpose: the permit types this jurisdiction uses already exist. */
  permitTypes: [],
  projectTypes: [],

  jurisdictionPermitTypes: [
    {
      jurisdictionKey: CHI_KEYS.jurisdiction,
      permitTypeKey: "building",
      isAvailable: true,
      localName: "Building permit",
      officialUrl: null,
      notes:
        "Priced from **gross floor area** as `CF × RF × A` (§14A-4-412.2.2.1): a construction factor from Table 14A-12-1204.3(1) by occupancy class and construction type, multiplied by a scope-of-review factor from Table (3) for new construction or Table (4) for rehabilitation, multiplied by the area. A Minimum Fee column floors each row and a city-wide **$602** floors every permit. Demolition is flat instead of formula-priced, and where more than one scope factor applies the **highest** one is used for all areas (footnote b).",
    },
    {
      jurisdictionKey: CHI_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      isAvailable: true,
      localName: "Electrical permit (Express Permit Program)",
      officialUrl: null,
      notes:
        "Priced from the **stand-alone fees** of Table 14A-12-1204.2. A permit covering only listed scopes pays the table's fee ($75, $300 or $750 for a service by size; $150 to $2,250 by how many new circuits; $75 per low-voltage system; generators, emergency lighting, solar, temporary service), and a permit covering more than one listed scope pays **each applicable fee**, because §14A-4-412.1 says the rows stack.",
    },
    {
      jurisdictionKey: CHI_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      isAvailable: true,
      localName: "Plumbing permit (Express Permit Program)",
      officialUrl: null,
      notes:
        "Priced from the same stand-alone table: $400.00 to install a private pool or hot tub, $75.00 per dwelling unit, toilet room or tenant space to replace a hot water heater or fixtures, $150.00 per dwelling unit, toilet room or tenant space to replace piping or a riser, $150.00 each for a heater serving more than one unit, and $75.00 per building per 30 days for maintenance.",
    },
  ],

  feeSchedules: [
    {
      key: CHI_BUILDING_SOURCE_KEY,
      jurisdictionKey: CHI_KEYS.jurisdiction,
      sourceKey: CHI_BUILDING_SOURCE_KEY,
      title: "2026 Amended Building Permit Fee Tables (effective 2026-01-06)",
      officialUrl: TABLES_URL,
      effectiveFrom: CHI_FEE_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: CHI_LAST_VERIFIED,
      notes:
        "Tables (1), (3) and (4) are priced here — the construction factor and both scope-of-review factors, with the Minimum Fee column and footnotes b, c and d. Table (5), exterior wall rehabilitation, is named on the page rather than computed, because the construction factor it needs comes from Table 14A-12-1204.3(2), which is printed `[Reserved]`. Table (6), phased permitting, is named for the two reasons the page gives.",
    },
    {
      key: CHI_CODE_EXCERPTS_SOURCE_KEY,
      jurisdictionKey: CHI_KEYS.jurisdiction,
      sourceKey: CHI_CODE_EXCERPTS_SOURCE_KEY,
      title: "Chicago Construction Codes §14A-4-412 and Table 14A-12-1204.2 (effective 2022-01-01, amended by SO2025-0021719)",
      officialUrl: CODE_EXCERPTS_URL,
      effectiveFrom: CHI_FEE_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: CHI_LAST_VERIFIED,
      notes:
        "The electrical and plumbing stand-alone fees are priced from this schedule as amended by the 2026 ordinance, which prints exactly which rows changed. Anyone can see the same reason the document is a fee schedule rather than a page of admin: §14A-4-412.1 says a permit covering more than one listed scope pays each applicable fee.",
    },
  ],

  feeRules: [
    ...CHI_BUILDING_RULES.map((rule) => ({
      jurisdictionKey: CHI_KEYS.jurisdiction,
      permitTypeKey: "building",
      scheduleKey: CHI_BUILDING_SOURCE_KEY,
      rule,
    })),
    ...CHI_ELECTRICAL_RULES.map((rule) => ({
      jurisdictionKey: CHI_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      scheduleKey: CHI_CODE_EXCERPTS_SOURCE_KEY,
      rule,
    })),
    ...CHI_PLUMBING_RULES.map((rule) => ({
      jurisdictionKey: CHI_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      scheduleKey: CHI_CODE_EXCERPTS_SOURCE_KEY,
      rule,
    })),
  ],

  requirements: [
    {
      jurisdictionKey: CHI_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "other",
      title: "The building permit is priced from area, not from the value of the work",
      description:
        '§14A-4-412.2.2.1 states the fee as `CF × RF × A` and nowhere mentions a valuation: CF is a construction factor in dollars per square foot, RF a scope-of-review factor, A the gross floor area of all construction work including basements excluded from building area. The Department\'s own calculator asks for construction type, occupancy type, floor area and project scope, and for nothing else. A reader coming from a valuation-priced city should not enter a contract value here; there is no field on the schedule for one.',
      isMandatory: true,
      sortOrder: 10,
      sourceKey: CHI_BUILDING_SOURCE_KEY,
      lastVerifiedAt: CHI_LAST_VERIFIED,
    },
    {
      jurisdictionKey: CHI_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "other",
      title: "Two tables decide the fee, and the row's minimum is a floor on it",
      description:
        'The construction factor comes from Table 14A-12-1204.3(1) by occupancy class and construction type — fourteen rows of factors from $0.23 to $1.06 per square foot — and the scope-of-review factor from Table (3) for new construction or Table (4) for rehabilitation. Every scope row prints a **Minimum Fee** beside its factor: $3,650, $2,450, $1,800, $1,200, $900 per story, $600, $300, $250 per unit served, $300 per unit. Footnote c adds a city-wide floor on top: "A minimum fee of $602 applies to all permits" ($302 for a temporary structure). Both are minimums, so the larger applies and a small job pays the floor rather than the product.',
      isMandatory: true,
      sortOrder: 20,
      sourceKey: CHI_BUILDING_SOURCE_KEY,
      lastVerifiedAt: CHI_LAST_VERIFIED,
    },
    {
      jurisdictionKey: CHI_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "other",
      title: "A mixed-scope project pays the highest scope factor, not a blend",
      description:
        'Footnote b of Tables (3), (4) and (6): where more than one scope of review factor applies, "the highest applicable multiplier applies to all areas". A project that is one part Level 2 alteration and one part addition is therefore charged the addition factor across the whole area rather than the two factors across their own areas, and the calculator asks for the scope that carries the highest factor.',
      isMandatory: true,
      sortOrder: 30,
      sourceKey: CHI_BUILDING_SOURCE_KEY,
      lastVerifiedAt: CHI_LAST_VERIFIED,
    },
    {
      jurisdictionKey: CHI_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      requirementType: "other",
      title: "Stand-alone fees stack when a permit covers more than one listed scope",
      description:
        '§14A-4-412.1: a permit that covers only scopes listed in Table 14A-12-1204.2 pays that table\'s fee, and a permit whose application includes more than one listed scope pays **each applicable fee**. So a permit for a 200-ampere service and eighteen new circuits pays $75.00 and $300.00 together, not the larger of the two. Several rows also carry footnote c, which puts that row in addition to a permit fee calculated under §14A-12-1204.3.',
      isMandatory: true,
      sortOrder: 10,
      sourceKey: CHI_CODE_EXCERPTS_SOURCE_KEY,
      lastVerifiedAt: CHI_LAST_VERIFIED,
    },
    {
      jurisdictionKey: CHI_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      requirementType: "other",
      title: "The plumbing rows are priced per dwelling unit, toilet room or tenant space",
      description:
        'Table 14A-12-1204.2 prices plumbing barely by fixture at all: replacing a hot water heater or fixtures without altering plumbing in walls is $75.00 **per dwelling unit, toilet room or tenant space**, and repairing piping or a riser is $150.00 on the same basis. Only installing a private swimming pool or hot tub is a plain $400.00, and a heater serving more than one unit is $150.00 each. The count that matters is the number of units the work reaches, which is why the calculator asks for it.',
      isMandatory: true,
      sortOrder: 10,
      sourceKey: CHI_CODE_EXCERPTS_SOURCE_KEY,
      lastVerifiedAt: CHI_LAST_VERIFIED,
    },
  ],

  profile: {
    jurisdictionKey: CHI_KEYS.jurisdiction,
    headline: "Permit fees for Chicago, from the Building Department's own fee tables",
    summary:
      "Chicago prices a building permit **from area and two published factor tables**, not from a valuation: `CF × RF × A`, where CF is a dollar rate per square foot read from Table 14A-12-1204.3(1) by occupancy class and construction type, RF a scope-of-review factor read from Table (3) for new construction or Table (4) for rehabilitation, and A the gross floor area in square feet. Every scope row prints a **Minimum Fee** beside its factor and footnote c puts a city-wide **$602 minimum** under all of it. Demolition is taken out of the formula by footnote d and priced flat at $600.00 ordinary or $2,450.00 complex. The trade permits are a different mechanism entirely: Table 14A-12-1204.2 lists **stand-alone fees** that **stack** when a permit covers more than one listed scope.",
    localContext:
      "Chicago is a city of two Departments' worth of process under one fee table. The Department of Buildings publishes the fee tables every year and runs the **Express Permit Program** for the trades — a guided route launched in 2023 that replaced the older Easy Permit and Short Form processes — while plan review for a full building permit goes through the standard intake. The fee does not depend on which route a permit takes, which is why this page can price both from the same two documents.\n\nThe formula is the first thing to understand, because it is unusual: §14A-4-412.2.2.1 prices a building permit as `CF × RF × A`, and **no valuation appears anywhere in it**. The Department's own calculator asks for construction type, occupancy type, floor area and project scope, and for nothing else. A reader coming from a valuation-priced city has been trained to enter a contract value; on this schedule there is no field for one.\n\nThe second is the fee's arithmetic shape. The construction factor alone runs from $0.23 to $1.06 per square foot across fourteen occupancy classifications and five construction types, and the scope factor from 0.25 to 1.25 — so the same square footage prices three or four times apart depending on the classification and on what is being done to the building. The schedule therefore prints a **Minimum Fee** beside every scope row, and the 2026 ordinance raised the city-wide floor that sits under all of them from $302 to **$602**. On small jobs the floor is what is collected far more often than the product is.\n\nThe trade permits are not a smaller version of the building permit; they are a different mechanism. §14A-4-412.1 sends a permit that covers **only** scopes listed in Table 14A-12-1204.2 to that table's flat fees, and says that a permit covering more than one listed scope pays **each applicable fee**. That is why a service upgrade and a bank of new circuits are added rather than compared, and why the electrical page here prices them separately.",
    valuationBasis:
      "**Chicago does not use a valuation for a building permit at all.** §14A-4-412.2.2.1 prices it as `CF × RF × A`: a construction factor in dollars per square foot from Table 14A-12-1204.3(1), a scope-of-review factor from Table (3) or (4), and the gross floor area of all construction work in square feet. The construction factor is published as a matrix — Group A at $0.97 per square foot for a Type I building down to Group U at $0.23 for a Type V — and the scope factor as a table of descriptions of work, from 0.25 for a repair to 1.25 for work including regulated equipment, each with its own minimum.\n\nTwo consequences follow that a reader should expect. The first is that **the area entered is the area of all the work**, not the footprint of a building or the area of a single room: A is defined as the gross floor area of all construction, demolition or rehabilitation work, including basements excluded from building area. The second is that where more than one scope factor applies, footnote b applies the **highest** applicable multiplier to all areas rather than blending them.\n\nThe trade permits are priced from a table rather than a formula: Table 14A-12-1204.2 is a list of named scopes with a fixed amount each, and §14A-4-412.1 stacks the ones a permit covers. Nothing in either route uses a project's value.",
    notIncluded:
      "These pages price the building formula and its row minimums, the flat demolition fees, and every stand-alone electrical and plumbing fee in the table that can be computed from a count the applicant gives. They exclude:\n\n- **Exterior wall rehabilitation (Table 14A-12-1204.3(5))**, which cannot be computed at all: §14A-4-412.2.2.2 sends its construction factor to Table 14A-12-1204.3(2), and both the 2022 excerpts and the 2026 tables print that table as `[Reserved]`. The scope factors exist — 0.05 for tuckpointing at $350, 0.1 for siding or window wall at $350 to $600, 0.5 for a lintel at $300, 1 for concrete repair, parapet or cornice at $300 to $600 — and there is no construction factor to multiply them by. The page names all seven amounts rather than inventing a rate.\n- **Phased permitting (Table 14A-12-1204.3(6))**: its first row prints no factor at all, and its 0.75 row's minimum is defined by reference to another table (\"per Table 14A-12-1204.3(4)\"). Both are facts about the document, not about this calculator, so the rows are named with their amounts — $7,300, $350, $3,650, $1,200, $3,650 — and not priced.\n- **Mixed-occupancy weighting.** Table (1) footnote a weights a mixed occupancy by the gross floor area of each class, which needs every class's area. Footnote a also states the rule a reader can use: where one class is 85% or more of the area, the whole fee uses that classification. The calculator therefore asks for one occupancy group, and the page says to enter the predominant one.\n- **Revision permits** (§14A-4-412.2.2.4), priced page-proportionally as the original fee times the ratio of pages, at the building official's discretion, and **the penalty** under §14A-4-412.2.2.3, up to the deposit. Both are determinations rather than schedules.\n- **The process fees** of Table 14A-12-1204.1: the permit fee **deposit** — $600 for ordinary work, $300 for a temporary structure — which is a prepayment credited against the permit fee rather than an extra charge, the $25.00 stand-alone permit review fee, $150.00 for the first hour and $100.00 for each further hour of accessibility pre-review, $30.00 for a pre-permit debt check, and 25% of the original fee per 180-day period for an extension of time or reinstatement.\n- **Electrical outdoor illumination**, priced at $75 per 1,000 square feet of parking lot or landscape area — a second area figure this calculator does not ask for — and **solar arrays of 13.44 kW or more**, priced at $250 per array with a $1,000 minimum, which needs an array count. Both amounts are named here.\n- **Repair or alteration of devices on existing circuits**, $75 per service, and **monthly maintenance permits** that can cover more than one building, which are priced per service or per building rather than per project; the flat single-service and single-building amounts are what the pages charge when those scopes are selected.\n- **Inspection and enforcement fees** (§14A-5-503), including re-inspection charges, **stop-work-order** penalties, and the zoning fee, sprinkler and standpipe review fees, fire fees and regulated-equipment fees that belong to other departments or other articles of the code.",
    seoTitle: "Chicago Permit Fees (Building, Electrical, Plumbing)",
    seoDescription:
      "What a Chicago building, electrical or plumbing permit costs: CF × RF × area from the 2026 fee tables with a $602 minimum, flat demolition, and trade permits that stack from $75.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: CHI_LAST_VERIFIED,
  },

  permitPages: [
    {
      jurisdictionKey: CHI_KEYS.jurisdiction,
      permitTypeKey: "building",
      slug: "building-permit-cost",
      title: "Chicago building permit cost",
      intro:
        "A Chicago building permit is priced from **the area of the work and two published factor tables, with no valuation anywhere in the formula**. §14A-4-412.2.2.1 states it as `CF × RF × A`: a construction factor read from Table 14A-12-1204.3(1) by occupancy class and construction type, multiplied by a scope-of-review factor read from Table 14A-12-1204.3(3) for new construction or Table 14A-12-1204.3(4) for rehabilitation, multiplied by the gross floor area in square feet. The construction factor runs from $0.23 to $1.06 per square foot and the scope factor from 0.25 to 1.25, so the same area prices several times apart by classification and by what is being done. A **Minimum Fee** column floors every scope row, footnote c puts a city-wide **$602 minimum** under all of it, and demolition is taken out of the formula altogether by footnote d at a flat $600.00 ordinary or $2,450.00 complex.",
      localSummary:
        "Three things decide whether the product or the floor is what you pay. **The classification first**: Group A at Type I is $0.97 a square foot and Group U at Type V is $0.23, so entering the wrong occupancy group moves a fee by a factor of four. **The scope second**: a Level 1 alteration carries 0.25 and a new multi-storey building 1.0, and where more than one scope applies footnote b says the **highest** multiplier applies to all areas rather than a blend. **The floor third, and it usually decides small jobs**: a 1,500-square-foot Level 1 alteration in Group B computes to $292.50, so the permit is the $602.00 minimum; a two-storey tenant buildout floors at $900 per storey; a residential project of one to three units floors at $2,450.00. Exterior wall rehabilitation is deliberately not priced here, because the construction factor it needs is printed `[Reserved]` in the code.",
      notIncluded:
        "This estimate is the building permit fee calculated under §14A-4-412.2, with the row minimum or the city-wide $602 floor applied where it is larger. It excludes:\n\n- **Exterior wall rehabilitation (Table 14A-12-1204.3(5))**, which cannot be computed from the published code: its construction factor comes from Table 14A-12-1204.3(2), printed `[Reserved]`. Its scope factors and amounts — 0.05 tuckpointing $350, 0.1 siding or window wall $350 to $600, 0.5 lintel $300, 1 concrete repair, parapet or cornice $300 to $600 — are named here instead.\n- **Phased permitting (Table 14A-12-1204.3(6))**, whose first row prints no factor and whose 0.75 row takes its minimum from another table: $7,300 for caissons, slurry wall or grade beams only, $350 for interior demolition without structural work, $1,200 with it, and $3,650 for the other phases.\n- **The permit fee deposit**, $600 or $300 for a temporary structure, which is paid at submission and credited against this fee rather than charged in addition; and the process fees around it — $25.00 stand-alone review, $150.00 plus $100.00 per hour of accessibility pre-review, $30.00 debt check, 25% per 180-day extension.\n- **Mixed-occupancy weighting by area** (Table (1) footnote a). Where one class is 85% or more of the area the whole fee uses that classification, which is the rule to apply; the weighted average needs every class's area and is not computed.\n- **Revision permits and penalties** (§14A-4-412.2.2.3 and .4), which are discretionary determinations by the building official.\n- **Inspection and enforcement fees** (§14A-5-503), and the zoning, sprinkler and standpipe review, fire and regulated-equipment fees that other departments and articles charge.",
      workedExample: {
        scenario:
          "A new multi-storey Group B building of Type II construction, 10,000 square feet — the four facts the schedule prices from: occupancy group, construction type, description of work and area.",
        inputs: {
          squareFootage: 10_000,
          custom: {
            occupancy_group: "B",
            construction_type: "II",
            scope: "new_multi_story",
          },
        },
        notes:
          "Table 14A-12-1204.3(1) prints Group B at Type II as **$0.78 per square foot**, and Table (3) prints 1.0 for the construction of a multi-storey building in Group B. The product is 0.78 × 1 × 10,000 square feet — **$7,800.00** — comfortably above that row's $3,650.00 minimum and above the city-wide $602.00 floor. The working on the page shows both factors and the row they came from, because neither factor is the formula on its own.\n\nFour variations show where the floor takes over. **A residential project of one to three units, up to four storeys, in Group R-2 Type III**, 2,400 square feet, is 0.78 × 0.75 × 2,400 = $1,404.00 and pays the row's **$2,450.00** minimum. **A 1,500-square-foot Level 1 alteration in Group B** is 0.78 × 0.25 × 1,500 = $292.50 and pays the city-wide **$602.00**. **A Group A Type I building of 42,000 square feet** is 0.97 × 1 × 42,000 = **$40,740.00**. **An ordinary demolition** is outside the formula altogether — footnote d leaves it a flat $600.00, raised by the same city-wide floor to **$602.00** — and complex demolition is $2,450.00.\n\nTwo cautions belong with the number. If more than one scope applies, footnote b charges the **highest** factor across all areas, so a project that is part Level 2 alteration and part addition pays the addition factor throughout. And the amount entered is the area of **all** the work, including basements excluded from building area, because that is what A is defined as.",
      },
      faqs: [
        {
          question: "Is a Chicago building permit based on the value of the work?",
          answer:
            "No — and this is the single most useful thing to know about it. §14A-4-412.2.2.1 states the fee as `CF × RF × A`: a construction factor in dollars per square foot, a scope-of-review factor, and the gross floor area of the work. The Department's own calculator asks for construction type, occupancy type, floor area and project scope. There is no valuation field on the schedule at all.",
          sourceId: CHI_CODE_EXCERPTS_SOURCE_KEY,
          attribution: "Chicago Construction Codes §14A-4-412.2.2.1",
        },
        {
          question: "What is the minimum building permit fee in Chicago?",
          answer:
            "Footnote c of the 2026 tables states that **a minimum fee of $602 applies to all permits** — $302 for a temporary structure, raised from the $302 of 2022 by Ordinance SO2025-0021719. Each scope row prints its own minimum as well ($3,650, $2,450, $1,800, $900 per story, $600, $300, $250 per unit served, $300 per unit), and both are minimums, so the larger one applies. A 1,500-square-foot Level 1 alteration in Group B is a good example: it computes to $292.50 and pays $602.00.",
          sourceId: CHI_BUILDING_SOURCE_KEY,
          attribution: "2026 Amended Building Permit Fee Tables, footnote c",
        },
        {
          question: "How is the construction factor chosen?",
          answer:
            "By occupancy class and construction type, from the matrix in Table 14A-12-1204.3(1). It runs from **$0.97 per square foot** for a Group A building of Type I construction to **$0.23** for a Group U building of Type V. R-1, R-2 and R-3 share one printed row, as do R-4 and R-5. Because the range is four to one, entering the wrong group or type moves the fee more than any other single input.",
          sourceId: CHI_BUILDING_SOURCE_KEY,
          attribution: "2026 Amended Building Permit Fee Tables, Table 14A-12-1204.3(1)",
        },
        {
          question: "What if my project is more than one kind of work?",
          answer:
            "Footnote b of Tables (3), (4) and (6) settles it: where more than one scope of review factor applies, **the highest applicable multiplier applies to all areas**. A project that is part Level 2 alteration and part addition pays the addition factor across the whole area, not the two factors across their own areas. The calculator asks for the scope carrying the highest factor rather than blending.",
          sourceId: CHI_BUILDING_SOURCE_KEY,
          attribution: "2026 Amended Building Permit Fee Tables, footnote b",
        },
        {
          question: "How is a demolition permit priced?",
          answer:
            "Outside the formula. Footnote d of Table (4) says demolition permits under §14A-4-407 \"are not subject to the area- and construction-factor-based fee formula and are only subject to the minimum fees in this table\": **$600.00 for ordinary demolition** and **$2,450.00 for complex demolition**. The ordinary amount is raised to $602.00 by the same city-wide minimum that applies to every permit.",
          sourceId: CHI_BUILDING_SOURCE_KEY,
          attribution: "2026 Amended Building Permit Fee Tables, footnote d",
        },
        {
          question: "Why can't this page price exterior wall rehabilitation?",
          answer:
            "Because the code itself cannot. §14A-4-412.2.2.2 prices that work from the scope-of-review factors of Table 14A-12-1204.3(5) multiplied by a construction factor from **Table 14A-12-1204.3(2)** — and both the 2022 excerpts and the 2026 tables print that table as `[Reserved]`. The scope factors and their amounts are published ($350 to $600 depending on the work); the construction factor is not. Any figure would be invented, so the amounts are named and the fee is not computed.",
          sourceId: CHI_BUILDING_SOURCE_KEY,
          attribution: "2026 Amended Building Permit Fee Tables, Table 14A-12-1204.3(2)",
        },
      ],
      seoTitle: "Chicago Building Permit Cost (area × two fee tables)",
      seoDescription:
        "What a City of Chicago building permit costs: CF × RF × area from the 2026 tables, $0.23–$1.06 per sq ft, row minimums, a city-wide $602 floor and flat demolition fees.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: CHI_LAST_VERIFIED,
    },
    {
      jurisdictionKey: CHI_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      slug: "electrical-permit-cost",
      title: "Chicago electrical permit cost",
      intro:
        "A Chicago electrical permit is priced from a list of **stand-alone fees**, not from a formula and not from a share of the building permit. Table 14A-12-1204.2 fixes an amount for each named scope: a service alone is **$75.00** below 400 amperes, **$300.00** from 400 to just under 1,000, and **$750.00** at 1,000 or more; new circuits on one service are **$150.00** up to ten, then **$300.00**, **$600.00**, **$1,500.00** and **$2,250.00** across the printed bands; a low-voltage system is **$75.00 per system per floor**; a permanent power generator is **$750.00**, or **$75.00** for a residential building of three or fewer units; emergency lighting is **$125.00**; solar under 13.44 kW is **$225.00**; temporary service is **$150.00**; and monthly maintenance is **$75.00** per building per thirty days. The electrical permits are issued through the Department's **Express Permit Program**.",
      localSummary:
        "The rule that makes this page different from a valuation-priced city is §14A-4-412.1: a permit that covers **more than one** listed scope pays **each applicable fee**. The rows are added, not compared. A 200-ampere service and eighteen new circuits on the same permit are $75.00 **plus** $300.00 — **$375.00** — and adding a residential generator makes it $450.00. The other thing to know is that the bands charge the whole band rather than a rate: eighteen circuits pay the 11-to-20 amount of $300.00, not a rate multiplied by eighteen. Where a row carries footnote c it is charged **in addition to** any permit fee computed under the building formula, which is what makes a generator next to a new building add to that building's permit fee rather than replace part of it.",
      notIncluded:
        "This estimate is the electrical stand-alone fees of Table 14A-12-1204.2 that can be computed from a count or a choice the applicant gives. It excludes:\n\n- **Outdoor illumination**, priced at **$75 per 1,000 square feet of parking lot or landscape area** — a second area figure this calculator does not ask for, distinct from the building's floor area. The rate is named here rather than applied to the wrong area.\n- **Solar arrays of 13.44 kW or more**, priced at **$250 per array with a $1,000 minimum**, which needs an array count. Below 13.44 kW the fee is the flat $225.00 this page computes.\n- **The zoning fee** that the solar rows note applies to them, and any **fire, sprinkler or regulated-equipment** review fees another department or article charges.\n- **The deposit and process fees** of Table 14A-12-1204.1 — the $600 permit fee deposit credited against the fee, the $25.00 stand-alone review fee, the $30.00 pre-permit debt check and the 25% extension charge — which are process steps rather than fees for the work.\n- **Re-inspection and enforcement charges** (§14A-5-503) and stop-work-order penalties, which are charged for a second visit or a violation rather than for the permit.",
      workedExample: {
        scenario:
          "A 200-ampere electrical service and eighteen new circuits on a single service, permitted together in Chicago — two listed scopes on one application.",
        inputs: {
          custom: { service_amperage: 200, new_circuits: 18 },
        },
        notes:
          "Both rows are stand-alone fees and both are charged, because §14A-4-412.1 says a permit covering more than one listed scope pays each applicable fee. A 200-ampere service is below 400 and so is the **$75.00** row; eighteen circuits fall in the 11-to-20 band, which is **$300.00** for the band rather than a rate per circuit. The permit is **$375.00**.\n\nThree variations show the parts that catch people out. **Adding a permanent power generator for a residential building of three or fewer dwelling units** is the $75.00 row rather than the $750.00 one, so the permit becomes **$450.00**; the general generator row is $750.00. **A 450-ampere service** is in the 400-to-under-1,000 band and costs $300.00 on its own. **Splitting the circuits across two permits** does not save money: two applications of ten circuits each pay $150.00 twice, which is the same $300.00 as one application of twenty, and each permit is a separate fee.\n\nA caution belongs with the number. The band an item falls in decides the whole amount it contributes, so the amounts are not smooth: ten circuits cost $150.00 and eleven cost $300.00, and that step is the schedule's, not this calculator's approximation of it.",
      },
      faqs: [
        {
          question: "How are Chicago electrical permits priced?",
          answer:
            "From the **stand-alone fees** of Table 14A-12-1204.2: a fixed amount for each named scope, with no formula and no valuation. A service alone is $75.00, $300.00 or $750.00 by size; new circuits are banded from $150.00 to $2,250.00; a low-voltage system is $75.00 per system per floor; generators, emergency lighting, solar and temporary service each have their own row.",
          sourceId: CHI_CODE_EXCERPTS_SOURCE_KEY,
          attribution: "Chicago Construction Codes, Table 14A-12-1204.2",
        },
        {
          question: "Do the electrical fees add together or does the largest apply?",
          answer:
            "They **add**. §14A-4-412.1: a permit covering only listed scopes pays the table's fee, and a permit whose application includes more than one listed scope pays **each applicable fee**. A 200-ampere service and eighteen circuits on one application are $75.00 plus $300.00 — $375.00 — not $300.00.",
          sourceId: CHI_CODE_EXCERPTS_SOURCE_KEY,
          attribution: "Chicago Construction Codes §14A-4-412.1",
        },
        {
          question: "How much is an electrical permit for new circuits?",
          answer:
            "It depends on the count on a single service: **$150.00** up to ten circuits, **$300.00** for 11 to 20, **$600.00** for 21 to 40, **$1,500.00** for 41 to 80 and **$2,250.00** for 81 or more. The band decides the whole amount — eighteen circuits cost $300.00, not a rate multiplied by eighteen — so the fee steps rather than grows smoothly with the count.",
          sourceId: CHI_CODE_EXCERPTS_SOURCE_KEY,
          attribution: "Chicago Construction Codes, Table 14A-12-1204.2",
        },
        {
          question: "How much is a generator permit?",
          answer:
            "**$750.00** for the installation of a permanent power generator, whether it is required or discretionary — but **$75.00** where it serves a residential building with three or fewer dwelling units and no mixed occupancy. The 2026 ordinance also gave both rows footnote c, which means the generator fee is charged in addition to a fee calculated under the building formula rather than instead of part of it.",
          sourceId: CHI_ORDINANCE_SOURCE_KEY,
          attribution: "Ordinance SO2025-0021719 §8, Table 14A-12-1204.2",
        },
        {
          question: "Where do I file an electrical permit in Chicago?",
          answer:
            "Through the Department of Buildings' **Express Permit Program**, launched in November 2023 and expanded in September 2024, which replaced the older Easy Permit and Short Form routes. It offers guided worktypes for electrical work and for monthly electrical maintenance — the latter at $75.00 per building per thirty days.",
          sourceId: CHI_EXPRESS_PERMIT_SOURCE_KEY,
          attribution: "Express Permit Program, chicago.gov",
        },
        {
          question: "Is the electrical permit part of the building permit fee?",
          answer:
            "No. It is a separate stand-alone permit under §14A-4-412.1, and its fee is not a share of the building permit. Several rows do carry footnote c, which puts them **in addition to** a permit fee calculated under the building formula — so those specific fees stack with a building permit rather than being included in it.",
          sourceId: CHI_CODE_EXCERPTS_SOURCE_KEY,
          attribution: "Chicago Construction Codes §14A-4-412.1 and Table 14A-12-1204.2",
        },
      ],
      seoTitle: "Chicago Electrical Permit Cost ($75 service, $150+ circuits)",
      seoDescription:
        "What a City of Chicago electrical permit costs: $75, $300 or $750 by service size, $150 to $2,250 by new circuits, $75 per low-voltage system, generators, solar and maintenance.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: CHI_LAST_VERIFIED,
    },
    {
      jurisdictionKey: CHI_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      slug: "plumbing-permit-cost",
      title: "Chicago plumbing permit cost",
      intro:
        "A Chicago plumbing permit is priced from the **stand-alone fees** of Table 14A-12-1204.2, and almost every row is charged **per dwelling unit, toilet room or tenant space** rather than per fixture. Installing a private swimming pool or hot tub is **$400.00**, with the electrical work as a separate permit. Repairing or replacing a hot water heater or plumbing fixtures without altering plumbing in walls is **$75.00 per dwelling unit, toilet room or tenant space**; the same basis applies to replacing plumbing piping and to replacing a riser within an existing chase at **$150.00** each; a hot water heater serving more than one dwelling unit or tenant space is **$150.00 each**; and a plumbing maintenance permit is **$75.00 per building per thirty days**. Like the electrical permits, these are filed through the Department's **Express Permit Program**.",
      localSummary:
        "The count that matters on this schedule is **how many units the work reaches**, not how many fixtures it touches. Replacing a water heater in six dwelling units is six times **$75.00** — $450.00 — where a fixture-priced city would count one heater or one fixture. Two rows at $150.00 use the same basis and the same wording, so a project replacing piping across six units is $900.00 rather than six fixture charges. The rows are stand-alone fees under §14A-4-412.1, which means a permit covering more than one listed scope pays each applicable fee — a water-heater replacement and a pool installation on one application are $450.00 **plus** $400.00, not the larger of the two.",
      notIncluded:
        "This estimate is the plumbing stand-alone fees of Table 14A-12-1204.2 that can be computed from a count the applicant gives. It excludes:\n\n- **Fixture-by-fixture pricing**, which this schedule does not use for these scopes: the amounts are per dwelling unit, toilet room or tenant space, and the page charges them that way.\n- **The other trades' rows of the same table** — the $175.00 minor repairs row, the roof rows at $175.00 and $450.00, fire escapes at $150.00 to $900.00, porch, deck and balcony rows at $75.00 to $300.00 per structure, and the $250.00 annual construction trailer permit — which belong to those permits rather than to plumbing.\n- **The electrical work of a pool or hot tub installation**, which the pool row itself says is a separate permit, and which the electrical page prices.\n- **The deposit and process fees** of Table 14A-12-1204.1 — the $600 permit fee deposit credited against the fee, the $25.00 review fee, the $30.00 debt check and the 25% extension charge — which are process steps rather than fees for the work.\n- **Re-inspection and enforcement charges** (§14A-5-503), including the trip charge for water or sewer work that needs more than the usual number of inspector visits.\n- **Water and sewer connection and meter charges**, which are the utility's fees rather than the Department's, and any zoning or fire review fees.",
      workedExample: {
        scenario:
          "Replacing hot water heaters in six dwelling units of a building, with a private hot tub installed on the same permit — two listed scopes on one plumbing application.",
        inputs: {
          units: 6,
          custom: { plumbing_scope: "water_heater_or_fixtures", pool_install: true },
        },
        notes:
          "The heater-or-fixtures row is $75.00 **per dwelling unit, toilet room or tenant space**, and the work reaches six dwelling units: **$450.00**. The pool-or-hot-tub row is a flat **$400.00**, and the schedule says in the row itself that the electrical work is a separate permit. Both are stand-alone fees under §14A-4-412.1, so a permit covering both scopes pays both — **$850.00** in total, with the electrical permit for the hot tub priced separately.\n\nThree variations show the basis. **The same six-unit job replacing piping** rather than heaters is on the $150.00 row and is **$900.00**, and replacing a riser reaches the same $150.00 per unit. **A single dwelling unit** replacing its water heater is **$75.00**. **A hot water heater serving more than one dwelling unit or tenant space** is priced $150.00 each rather than per unit served, which is the one row in this group that does not multiply by the unit count.\n\nA caution belongs with the number. The schedule charges by the unit the work reaches, so the count to enter is the number of dwelling units, toilet rooms or tenant spaces affected — not the number of fixtures removed or installed, and not the building's total unit count where only some are touched.",
      },
      faqs: [
        {
          question: "How much is a Chicago plumbing permit to replace a water heater?",
          answer:
            "**$75.00 per dwelling unit, toilet room or tenant space** when the heater is replaced in kind without altering plumbing in walls — six units are $450.00. A heater serving more than one dwelling unit or tenant space is priced differently: **$150.00 each**. That is the schedule's distinction, and it is why the calculator asks how many units the work reaches.",
          sourceId: CHI_CODE_EXCERPTS_SOURCE_KEY,
          attribution: "Chicago Construction Codes, Table 14A-12-1204.2",
        },
        {
          question: "Is a plumbing permit priced per fixture in Chicago?",
          answer:
            "For these scopes, no. The rows are priced **per dwelling unit, toilet room or tenant space**: $75.00 to replace a hot water heater or fixtures, $150.00 to replace piping or a riser within an existing chase. Only installing a private swimming pool or hot tub is a plain $400.00 flat, and a heater serving more than one unit is $150.00 each.",
          sourceId: CHI_CODE_EXCERPTS_SOURCE_KEY,
          attribution: "Chicago Construction Codes, Table 14A-12-1204.2",
        },
        {
          question: "How much is a permit to install a swimming pool or hot tub?",
          answer:
            "**$400.00** for the private pool or hot tub, and the schedule's own row adds that the electrical work is **a separate permit** — priced from the electrical table, not included in the $400.00. If the same application covers another listed plumbing scope, §14A-4-412.1 charges that scope's fee as well.",
          sourceId: CHI_CODE_EXCERPTS_SOURCE_KEY,
          attribution: "Chicago Construction Codes, Table 14A-12-1204.2",
        },
        {
          question: "Do plumbing stand-alone fees add to the building permit fee?",
          answer:
            "They are separate permits with separate fees. §14A-4-412.1 sends a permit covering only listed scopes to the table's stand-alone fee, and the building permit is calculated separately under §14A-4-412.2. The table's footnote c marks the rows that are charged **in addition to** a fee calculated under the building formula.",
          sourceId: CHI_CODE_EXCERPTS_SOURCE_KEY,
          attribution: "Chicago Construction Codes §14A-4-412.1",
        },
        {
          question: "How much is a monthly plumbing maintenance permit?",
          answer:
            "**$75.00 per building per thirty days**, filed as a monthly permit through the Express Permit Program. It is a recurring permit for maintenance work rather than a one-off fee for a project, so it is charged for each building it covers and each thirty-day period.",
          sourceId: CHI_EXPRESS_PERMIT_SOURCE_KEY,
          attribution: "Express Permit Program and Table 14A-12-1204.2",
        },
      ],
      seoTitle: "Chicago Plumbing Permit Cost ($75 per unit, $400 pool)",
      seoDescription:
        "What a City of Chicago plumbing permit costs: $75 per dwelling unit to replace a water heater or fixtures, $150 for piping or a riser, $150 each for a shared heater and $400 for a pool.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: CHI_LAST_VERIFIED,
    },
  ],

  verifications: [
    {
      entityType: "source",
      entityKey: CHI_BUILDING_SOURCE_KEY,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: CHI_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: CHI_BUILDING_SOURCE_KEY,
      notes:
        "Read with `pdftotext -table`, cross-checked against `-raw`, and re-read against the 2022 and 2019 printings of the same tables where a row exists in more than one year. `-layout` mis-pairs the amount column by up to two rows and was not used. The effective date on its face, 2026-01-06, is where `effectiveFrom` comes from.",
    },
    {
      entityType: "source",
      entityKey: CHI_ORDINANCE_SOURCE_KEY,
      status: "verified",
      method: "official_portal_check",
      verifiedAt: CHI_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: CHI_ORDINANCE_SOURCE_KEY,
      notes:
        "Retrieved through the City Clerk's Legislation API (`GET /matter/recordNumber/SO2025-0021719`), which returns the attachment URL on the City's own blob storage. §7 and §8 are the sections that changed the process fees and the stand-alone rows; Article XXVI §3 is the effective-date clause. Read because amlegal's Code Library answers 403 from this environment.",
    },
    {
      entityType: "source",
      entityKey: CHI_CODE_EXCERPTS_SOURCE_KEY,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: CHI_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: CHI_CODE_EXCERPTS_SOURCE_KEY,
      notes:
        "Read with `-table` and `-raw`. Used for §14A-4-412 in full — the formula, the stand-alone route, the process fees — and for footnotes b, c and d of the tables. Its Table 14A-12-1204.2 rows were checked against the 2019 excerpts (sha256 `e154fa66…`) to confirm the amount column pairs as the table-mode extraction says.",
    },
    {
      entityType: "source",
      entityKey: CHI_CALCULATOR_SOURCE_KEY,
      status: "verified",
      method: "official_portal_check",
      verifiedAt: CHI_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: CHI_CALCULATOR_SOURCE_KEY,
      notes:
        "Read 2026-09-25, HTTP 200. Names the 2026 tables as the schedule for permits issued from 2026-01-01 and lists the superseded tables. Its input list — construction type, occupancy type, floor area, project scope — is the evidence that no valuation is involved.",
    },
    {
      entityType: "source",
      entityKey: CHI_EXPRESS_PERMIT_SOURCE_KEY,
      status: "verified",
      method: "official_portal_check",
      verifiedAt: CHI_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: CHI_EXPRESS_PERMIT_SOURCE_KEY,
      notes:
        "Read 2026-09-25, HTTP 200. Confirms electrical and plumbing permits are issued as stand-alone permits, and records the programme's launch and expansion dates.",
    },
    {
      entityType: "fee_schedule",
      entityKey: CHI_BUILDING_SOURCE_KEY,
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: CHI_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: CHI_BUILDING_SOURCE_KEY,
      notes:
        "Every priced row recomputed with the engine: 70 construction-factor cells, 45 new-construction scope rows and 246 rehabilitation rows after Table (4)'s \"all occupancies\" block and the shared Group R row are expanded, with the row minimum and the $602 floor applied. The published figures ($7,800.00, $2,450.00, $40,740.00, $602.00, $2,450.00 complex demolition, $302.00 temporary structure) are asserted in `tests/content/chicago-seed.test.ts`.",
    },
    {
      entityType: "fee_schedule",
      entityKey: CHI_CODE_EXCERPTS_SOURCE_KEY,
      permitTypeKey: "electrical",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: CHI_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: CHI_CODE_EXCERPTS_SOURCE_KEY,
      notes:
        "The 2022 rows as amended by SO2025-0021719 §8, which prints exactly which rows changed — the two generator rows, solar, the monthly permits — and which did not. Several rows were cross-checked against the 2019 excerpts where they exist in both. Recomputed: a 200-ampere service with eighteen circuits at $375.00, and $450.00 with a residential generator.",
    },
    {
      entityType: "fee_schedule",
      entityKey: CHI_CODE_EXCERPTS_SOURCE_KEY,
      permitTypeKey: "plumbing",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: CHI_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: CHI_CODE_EXCERPTS_SOURCE_KEY,
      notes:
        "The plumbing rows of Table 14A-12-1204.2, priced per dwelling unit, toilet room or tenant space, cross-checked between the 2022 and 2019 printings. Recomputed: six units at $75.00 is $450.00, and $850.00 with the $400.00 pool row on the same permit.",
    },
    {
      entityType: "permit_page",
      entityKey: "building-permit-cost",
      permitTypeKey: "building",
      status: "verified",
      method: "manual_review",
      verifiedAt: CHI_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: CHI_BUILDING_SOURCE_KEY,
      notes:
        "Worked example recomputed with the engine: $7,800.00 for the 10,000-square-foot Group B Type II multi-storey building, and each variation quoted in the prose — $2,450.00 at the residential minimum, $602.00 at the city-wide floor, $40,740.00 for Group A Type I, $602.00 for ordinary demolition, $302.00 for a temporary structure — reproduced before publication.",
    },
    {
      entityType: "permit_page",
      entityKey: "electrical-permit-cost",
      permitTypeKey: "electrical",
      status: "verified",
      method: "manual_review",
      verifiedAt: CHI_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: CHI_CODE_EXCERPTS_SOURCE_KEY,
      notes:
        "Worked example recomputed: $375.00 for the service and eighteen circuits, $450.00 with the residential generator, and the band steps at eleven and twenty-one circuits checked against the table.",
    },
    {
      entityType: "permit_page",
      entityKey: "plumbing-permit-cost",
      permitTypeKey: "plumbing",
      status: "verified",
      method: "manual_review",
      verifiedAt: CHI_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: CHI_CODE_EXCERPTS_SOURCE_KEY,
      notes:
        "Worked example recomputed: $450.00 for six dwelling units on the heater row, $850.00 with the pool row, and the $900.00 six-unit piping variation.",
    },
    {
      entityType: "jurisdiction_profile",
      entityKey: CHI_KEYS.jurisdiction,
      status: "verified",
      method: "manual_review",
      verifiedAt: CHI_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: CHI_BUILDING_SOURCE_KEY,
      notes:
        "The profile's central claim — that the building fee is priced from area as `CF × RF × A`, with a $602 city-wide floor and flat demolition outside the formula — is read from §14A-4-412.2.2.1 and footnote d, and from the Department's own calculator asking for area rather than a valuation.",
    },
  ],
};

export const CHI_PUBLISHED_PERMIT_PAGES = chicagoSeed.permitPages.filter(
  (page) => page.publishStatus === "published" && !page.noindex,
);
