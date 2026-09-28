import type { JurisdictionSeed } from "@/content/seed-types";

import {
  SC_BUILDING_RULES,
  SC_ELECTRICAL_RULES,
  SC_FEE_EFFECTIVE_FROM,
  SC_FEE_LISTING_SOURCE_KEY,
  SC_PLUMBING_RULES,
  SC_TABLE_A_SOURCE_KEY,
} from "./fee-rules";

/**
 * City of Sacramento, California — **the city whose building permit is a hundred-bracket
 * valuation ladder that hands over to a printed formula above $100,000.**
 *
 * San Diego, the first California jurisdiction here, prices a building permit from area
 * and its trade permits per unit of work. Sacramento is the opposite on both counts: its
 * building permit is priced from **valuation** — $999 of value or less pays $75, and the
 * brackets climb every $1,000 of valuation to $99,999 — and past $99,999 the schedule
 * stops printing brackets and prints three formulas instead. That hand-over is the reason
 * this city is in the dataset: a ladder alone would have no answer for a $450,000 house,
 * and a formula alone would over-charge a $40,000 job, so both are modelled and each is
 * gated to the valuations the document prints it for, which makes them meet exactly.
 *
 * Its trade permits are the third distinct shape in the state: Sacramento prices
 * residential electrical and plumbing work as **flat named scopes** — one $105 permit
 * covers a panel change-out, a whole-or-partial re-wire **or** new branch circuits — with
 * no per-circuit, per-outlet or per-fixture table at all.
 *
 * Research record: research/california/sacramento.md.
 */

export const SC_LAST_VERIFIED = "2026-09-24";

export const SC_KEYS = {
  state: "ca",
  county: "sacramento-county",
  jurisdiction: "sacramento",
  tables: SC_TABLE_A_SOURCE_KEY,
  feeListing: SC_FEE_LISTING_SOURCE_KEY,
} as const;

const RESEARCHER =
  "Permit Fee Intelligence research pass 13 (California, second jurisdiction)";

const state = {
  code: "CA",
  slug: "california",
  name: "California",
  fipsCode: "06",
};

const county = {
  key: SC_KEYS.county,
  slug: "sacramento-county",
  name: "Sacramento County",
  fipsCode: "06067",
};

export const sacramentoSeed: JurisdictionSeed = {
  state,
  county,

  jurisdiction: {
    key: SC_KEYS.jurisdiction,
    stateKey: SC_KEYS.state,
    countyKey: SC_KEYS.county,
    type: "city",
    slug: "sacramento",
    name: "Sacramento",
    officialName: "City of Sacramento Community Development Department",
    websiteUrl: "https://www.cityofsacramento.gov/community-development",
    permitPortalUrl: "https://aca-prod.accela.com/sacramento/Default.aspx",
    timezone: "America/Los_Angeles",
    isActive: true,
  },

  departments: [
    {
      key: "sacramento-building",
      jurisdictionKey: SC_KEYS.jurisdiction,
      kind: "building",
      name: "Building Division, Community Development Department",
      phone: null,
      email: "ezpermit@cityofsacramento.org",
      url: "https://www.cityofsacramento.gov/community-development/building",
      addressLine: "300 Richards Boulevard, 3rd Floor, Sacramento, CA 95811",
      hours: null,
      notes:
        "The division that issues building permits and the trade permits this site prices, publishes Tables A and B.1, and operates the Accela Citizen Access portal. The email address is the one the City's own building-fees page gives for permit questions; no telephone number is recorded, because the division publishes no single line and a stale switchboard number is the one piece of context that sends a reader to the wrong place.",
    },
    {
      key: "sacramento-planning",
      jurisdictionKey: SC_KEYS.jurisdiction,
      kind: "planning",
      name: "Planning Division, Community Development Department",
      phone: null,
      email: "planning@cityofsacramento.org",
      url: "https://www.cityofsacramento.gov/community-development/planning",
      addressLine: null,
      hours: null,
      notes:
        "Named because three charges a reader will see on a Sacramento invoice belong to this division rather than to the Building Division — its plan review at \"15% of Plan Review Fee (Building Division) with a minimum of one hour\", its inspection fees, and the General Plan Maintenance Fee that the Building Division collects on its behalf. Only the General Plan Maintenance Fee is modelled here.",
    },
  ],

  sources: [
    {
      key: SC_TABLE_A_SOURCE_KEY,
      jurisdictionKey: SC_KEYS.jurisdiction,
      title:
        "Building Division Fee Detail \u2014 Table A, \u201cBuilding Permit Fee Schedule (based on Valuation)\u201d, and Table B.1, \u201cFlat Fee Building Permits\u201d",
      url: "https://www.cityofsacramento.org/Online-Services/FeeChargeSearch.aspx?cu_fee_id=28",
      sourceType: "fee_schedule_pdf",
      issuingAuthority: "City of Sacramento Community Development Department, Building Division",
      authorityKind: "city",
      isPrimary: true,
      documentDate: "2025-07-19",
      effectiveFrom: SC_FEE_EFFECTIVE_FROM,
      retrievedAt: SC_LAST_VERIFIED,
      lastVerifiedAt: SC_LAST_VERIFIED,
      notes:
        'Read 2026-09-24. The document is the attachment the City\'s fee record for "Building Permit Fee" (fee 28 in its searchable listing) publishes: "Building-Permit-Fee-Tables-A-and-B.1_2025-0719.pdf", 1,341,269 bytes, sha256 beginning e1de2a29ae12011e. Table A carries the header "TABLE A — Effective July 20, 2020*" with a footer "Revised July 19, 2025", and Table B.1 is headed "Effective July 19, 2025"; the schedule is therefore recorded as effective 2025-07-19. **Extracted in three `pdftotext` modes**, because the first pass through Table A mis-paired the Commercial and Residential columns by one row for part of the page and produced a ladder in which the residential column ran ahead of the commercial one — the row-by-row mode is the one whose every bracket reproduces the document\'s own arithmetic, and it is the one modelled.',
    },
    {
      key: SC_FEE_LISTING_SOURCE_KEY,
      jurisdictionKey: SC_KEYS.jurisdiction,
      title: "City of Sacramento \u201cFees and Charges\u201d searchable fee listing",
      url: "https://www.cityofsacramento.org/Online-Services/FeeChargeSearch",
      sourceType: "municipal_website",
      issuingAuthority: "City of Sacramento",
      authorityKind: "city",
      isPrimary: true,
      documentDate: null,
      effectiveFrom: null,
      retrievedAt: SC_LAST_VERIFIED,
      lastVerifiedAt: SC_LAST_VERIFIED,
      notes:
        'Read 2026-09-24. The City\'s own searchable listing of every fee it charges, published both as a web application and as the "Fees and Charges" dataset on data.cityofsacramento.org. It is the source for the four charges that are not in the fee sheet: "General Plan Maintenance Fee — $2.60 per $1,000 of building valuation, not-to-exceed $38,200 on permits with a valuation over $14.85 million"; "Technology Surcharge Fee (Building) — 10% of the Plan Review Fee (if applicable) and Building Permit Fee (if applicable)"; "Construction Excise Tax — .008 x of the 2002 ICBO Valuation"; "City Business Operations Tax — $0.40 per $1,000 of project valuation (Maximum limit of $5,000.00 per calendar year per contractor)"; and "Residential Construction Tax (Building) — Mobile home lot constructed or one bedroom unit $250; Two bedroom units $315; 3+ bedroom units $385". No effective date is recorded because the listing prints none per row; each row is dated by the attachment or ordinance it cites, which is why the construction excise tax carries an explicit caveat on the page.',
    },
  ],

  /** Empty on purpose: the permit types this jurisdiction uses already exist. */
  permitTypes: [],
  projectTypes: [],

  jurisdictionPermitTypes: [
    {
      jurisdictionKey: SC_KEYS.jurisdiction,
      permitTypeKey: "building",
      isAvailable: true,
      localName: "Building permit",
      officialUrl: null,
      notes:
        "Priced from **estimated project valuation**. Table A prints a hundred brackets of $1,000 of valuation each from $999 ($75) to $99,999 ($1,078) in a Commercial and a Residential column, and above $100,000 it prints three formulas instead of more brackets. Four City charges are added: the General Plan Maintenance Fee at $2.60 per $1,000 (capped at $38,200), the Construction Excise Tax at 0.008 of the valuation, the City Business Operations Tax at $0.40 per $1,000 (capped at $5,000 and charged only when a licensed contractor holds the permit), and the Residential Construction Tax at $250, $315 or $385 per unit by bedroom count. Four flat scopes in Table B.1 — bathroom and kitchen remodels and two kinds of patio cover — replace the ladder rather than add to it.",
    },
    {
      jurisdictionKey: SC_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      isAvailable: true,
      localName: "Electrical permit",
      officialUrl: null,
      notes:
        "Priced as **flat named scopes**, not by circuit, outlet or ampere. One $105 residential minor electrical permit authorises one or more of \"replacement of a main electrical panel, installation of a new or replacement subpanel or both, and/or re-wiring of an entire house or accessory structure or a portion of a house or accessory structure, and/or installation of new branch circuits, reconfiguration of existing branch wiring or both\". A safety inspection of an electrical or gas piping system is $107, and the electrical work in a sign is $216. Solar photovoltaic and solar water heater systems are routed to the City's separate streamlined permit.",
    },
    {
      jurisdictionKey: SC_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      isAvailable: true,
      localName: "Plumbing permit",
      officialUrl: null,
      notes:
        "Priced as **flat named scopes**. One $105 residential minor plumbing permit authorises one or more of sewer service, water service, drain line, water supply, gas service, a single kitchen or bathroom fixture or a toilet replacement — and the sheet is explicit that more than one such fixture \"moves the job to the kitchen or bathroom remodel section above, or calculate based on value\", the single exception being that any number of toilets may be replaced alongside one other bathroom fixture. A water heater installed, replaced or moved is $75.",
    },
  ],

  feeSchedules: [
    {
      key: SC_TABLE_A_SOURCE_KEY,
      jurisdictionKey: SC_KEYS.jurisdiction,
      sourceKey: SC_TABLE_A_SOURCE_KEY,
      title: "Table A (building permit fees by valuation) and Table B.1 (flat fee building permits)",
      officialUrl:
        "https://www.cityofsacramento.org/Online-Services/FeeChargeSearch.aspx?cu_fee_id=28",
      effectiveFrom: SC_FEE_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: SC_LAST_VERIFIED,
      notes:
        "One document, two tables, and the second is not a continuation of the first: Table A prices a permit from valuation, Table B.1 prices named scopes at a flat amount and its own rows say so — \"Scopes which involve more than one item … but not a full remodel should be calculated from project value rather than as a flat fee.\" The sheet's Plan Review Fee column is printed beside each row; this site models the building permit fee and the flat scopes, and names the plan review fee as a separate charge it does not compute (see the page).",
    },
    {
      key: SC_FEE_LISTING_SOURCE_KEY,
      jurisdictionKey: SC_KEYS.jurisdiction,
      sourceKey: SC_FEE_LISTING_SOURCE_KEY,
      title: "City of Sacramento Fees and Charges listing",
      officialUrl: "https://www.cityofsacramento.org/Online-Services/FeeChargeSearch",
      effectiveFrom: SC_FEE_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: SC_LAST_VERIFIED,
      notes:
        "Recorded as effective from the same date as the fee sheet because the two are read together and the listing is the City's live record of both; the listing itself prints no per-row effective date, which the page states.",
    },
  ],

  feeRules: [
    ...SC_BUILDING_RULES.map((rule) => ({
      jurisdictionKey: SC_KEYS.jurisdiction,
      permitTypeKey: "building",
      scheduleKey: SC_TABLE_A_SOURCE_KEY,
      rule,
    })),
    ...SC_ELECTRICAL_RULES.map((rule) => ({
      jurisdictionKey: SC_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      scheduleKey: SC_TABLE_A_SOURCE_KEY,
      rule,
    })),
    ...SC_PLUMBING_RULES.map((rule) => ({
      jurisdictionKey: SC_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      scheduleKey: SC_TABLE_A_SOURCE_KEY,
      rule,
    })),
  ],

  requirements: [
    {
      jurisdictionKey: SC_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "other",
      title: "The building permit fee is a valuation bracket up to $99,999 and a printed formula above it",
      description:
        'Table A: "$999 $75 … $40,999 $622 … $99,999 $1,078", and then, in place of a hundred-and-first bracket, "$1078 + $0.006787 each $1 > $100,000" rising at $3 million to "$20,761 + $0.005133 each $1 >$3 mil" and at $10 million to "$56,692 + $0.004620 each $1 >$10 mil". Estimated project valuation decides which of the two applies and what the fee is; nothing else about the building is priced.',
      isMandatory: true,
      sortOrder: 10,
      sourceKey: SC_TABLE_A_SOURCE_KEY,
      lastVerifiedAt: SC_LAST_VERIFIED,
    },
    {
      jurisdictionKey: SC_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "other",
      title: "Four City charges are added to a building permit, and one of them depends on who holds the permit",
      description:
        'The General Plan Maintenance Fee is "$2.60 per $1,000 of building valuation, not-to-exceed $38,200"; the Construction Excise Tax is ".008 x of the 2002 ICBO Valuation"; the Residential Construction Tax is "$250 … $315 … $385" per unit by bedroom count; and the City Business Operations Tax is "$0.40 per $1,000 of project valuation (Maximum limit of $5,000.00 per calendar year per contractor)", charged, the listing says, "Only … if a California licensed contractor is the permit holder" — so an owner-builder permit does not pay it.',
      isMandatory: true,
      sortOrder: 20,
      sourceKey: SC_FEE_LISTING_SOURCE_KEY,
      lastVerifiedAt: SC_LAST_VERIFIED,
    },
    {
      jurisdictionKey: SC_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      requirementType: "other",
      title: "One flat permit covers a list of electrical scopes, however many of them the job involves",
      description:
        'Table B.1: "Residential Minor Electrical Work — $105. Permits issued under this category may authorize one or more of these scopes of work under one permit: replacement of a main electrical panel, installation of a new or replacement subpanel or both, and/or re-wiring of an entire house or accessory structure or a portion of a house or accessory structure, and/or installation of new branch circuits, reconfiguration of existing branch wiring or both." There is no per-circuit or per-outlet rate to add to it.',
      isMandatory: true,
      sortOrder: 10,
      sourceKey: SC_TABLE_A_SOURCE_KEY,
      lastVerifiedAt: SC_LAST_VERIFIED,
    },
    {
      jurisdictionKey: SC_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      requirementType: "other",
      title: "A second fixture moves a plumbing job out of the $105 minor scope",
      description:
        'Table B.1 prices "Residential Minor Plumbing Repair or Replacement Work — $105" and then states the limit on it: "If more than one bathroom or one kitchen appliance or fixture repair is needed, use the kitchen or bathroom remodel section above, or calculate based on value. The only exception is that one or more toilets may be replaced in addition to another bathroom fixture, such as a shower valve."',
      isMandatory: true,
      sortOrder: 10,
      sourceKey: SC_TABLE_A_SOURCE_KEY,
      lastVerifiedAt: SC_LAST_VERIFIED,
    },
  ],

  profile: {
    jurisdictionKey: SC_KEYS.jurisdiction,
    headline: "Permit fees for the City of Sacramento, from the Building Division's own fee sheet",
    summary:
      "Sacramento prices a building permit from **estimated project valuation** — a hundred $1,000 brackets up to $99,999, and three printed formulas above $100,000 — and adds four City charges, two of which are a rate on the valuation and one of which is charged only when a licensed contractor holds the permit. Electrical and plumbing permits are **flat named scopes** at $105, $107 and $75 rather than rates on a fixture, circuit or outlet.",
    localContext:
      "Two City documents carry the schedule, and they answer different questions. **Tables A and B.1** is the Building Division's fee sheet: Table A is the valuation schedule a building permit is priced from, and Table B.1 is the flat-fee list a reader whose job is a bathroom remodel, a minor electrical permit, a water heater or a patio cover should look at instead. **The City's searchable fee listing** is where the charges around a permit live — the General Plan Maintenance Fee, the Construction Excise Tax, the City Business Operations Tax and the Residential Construction Tax — none of which appears in Table A.\n\nThe most important thing about Table A is where it stops. It prints brackets to $99,999 and then prints formulas: \"$1078 + $0.006787 each $1 > $100,000\", \"$20,761 + $0.005133 each $1 >$3 mil\", \"$56,692 + $0.004620 each $1 >$10 mil\". Those are continuous with the ladder where they meet it — $1,078 at $100,000, $20,761 at $3,000,000, $56,692 at $10,000,000 — which is how a reader can tell that the formula is the same schedule continued rather than a different charge. Since a new house in Sacramento is almost never valued under $100,000, the formula is the part most permits are actually priced by.\n\nTable A also prints **two columns**, Commercial and Residential, and they are identical except on two rows: at $33,999 of valuation the Residential column prints $577 where the Commercial column prints $557, and at $36,999 it prints $586 where the Commercial column prints $585. This site carries both values as the document prints them. It is a small difference and it is deliberate: a homeowner looking at this page should see the number the City printed on the row that applies to them.",
    valuationBasis:
      "Two of the four add-on charges are a rate on the valuation and the permit fee itself is a bracket of it: the General Plan Maintenance Fee at $2.60 per $1,000 and the City Business Operations Tax at $0.40 per $1,000 (both with a published ceiling). The Construction Excise Tax is stated as a share of the valuation — \".008 x of the 2002 ICBO Valuation\" — so the same figure drives it too. The electrical and plumbing permits are priced on nothing at all: they are flat amounts for named scopes.",
    notIncluded:
      "These pages price Table A's valuation schedule, Table B.1's flat scopes and the four City charges the fee listing states. They exclude:\n\n- **The plan review fee.** The fee sheet prints a Plan Review Fee column beside every flat scope and its own record describes plan review as \"calculated in two possible ways\" — from a separate valuation table, or hourly at the staff rate. This site does not transcribe that table, so plan review is named rather than computed.\n- **The Technology Surcharge.** It is \"10% of the Plan Review Fee (if applicable) and Building Permit Fee (if applicable)\", so it cannot be stated correctly while the plan review fee is not modelled. The page says what the surcharge is and why the site leaves it out.\n- **The separate permits the City issues for solar.** Photovoltaic and solar water heater systems go to the City's streamlined permit for solar, and a commercial solar water heater is routed by the sheet to \"a standard commercial remodel permit\".\n- **Mechanical work**, which no page of this site prices in any jurisdiction, and the City's separate $175 HVAC cut-in or change-out permit, which is a mechanical permit.\n- **Re-roof and wrecking permits**, priced at $175 each in Table B.1, and the sign permit fee itself, which the listing prices \"based on the valuation of the sign\".\n- **The City's hourly and cost-recovery charges**: the $216 staff hourly rate, expedited plan review at 50% of the plan review fee, permit renewals, extensions, re-inspections and the work-without-permit penalty, which is three times the permit fee where that is under $250 and $500 where it is over.\n- **Every other agency's charge** collected with the permit — the utilities' water, sewer and drainage development fees and meter charges, Sacramento Regional County Sanitation District, the school district's impact fees, SAFCA flood control, the Sacramento Transportation Authority's fee, the fire department's plan review and inspection fees, and the City's own impact fees, park and housing charges.",
    seoTitle: "Sacramento Permit Fees (Building, Electrical, Plumbing)",
    seoDescription:
      "What a City of Sacramento building, electrical or plumbing permit costs: a valuation ladder to $99,999 and printed formulas above it, four City add-on charges, and flat trade permits at $105, $107 and $75.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: SC_LAST_VERIFIED,
  },

  permitPages: [
    {
      jurisdictionKey: SC_KEYS.jurisdiction,
      permitTypeKey: "building",
      slug: "building-permit-cost",
      title: "Sacramento building permit cost",
      intro:
        "A City of Sacramento building permit is priced from **estimated project valuation**. Table A prints a bracket for every $1,000 of valuation from $999 (which pays $75) to $99,999 (which pays $1,078), and then, instead of a hundred-and-first bracket, three formulas: $1,078 plus $0.006787 for every dollar above $100,000, rising at $3 million and again at $10 million. Four City charges are added on top of it.",
      localSummary:
        "The ladders is the part a reader can check by eye, and the formulas are the part that decides most real permits. A house valued at $450,000 pays $1,078 plus 350,000 × $0.006787, which is $3,453.45 — and the same arithmetic at $3,000,000 arrives at $20,761, which is exactly where the second formula starts, and at $10,000,000 at $56,692, where the third does. That continuity is why this site models the bracket table and the formulas as one schedule with a hand-over, rather than picking one of them.\n\nA reader with a small job should look at the top of the table instead. Nothing is valued under the first bracket, so a $20,000 project pays $447 and a $40,000 project $622, and both are the *whole* building permit fee. Table B.1 then takes a different kind of job out of the ladder entirely: a non-structural bathroom remodel is a flat $320 and a non-structural kitchen remodel a flat $425, whatever the sheet's valuation would have said.\n\nThe four City charges are where a Sacramento permit differs from the ladder a reader may have found elsewhere. The General Plan Maintenance Fee is $2.60 per $1,000 of valuation, capped at $38,200. The Construction Excise Tax is 0.008 of the valuation — the listing calls it \"0.008 x of the 2002 ICBO Valuation\". The City Business Operations Tax is $0.40 per $1,000, capped at $5,000, and is charged only \"if a California licensed contractor is the permit holder\", so an owner-builder permit does not pay it. The Residential Construction Tax is $250, $315 or $385 **per unit** by bedroom count. On a $450,000 house with four bedrooms and a licensed contractor those four come to $1,170.00, $3,600.00, $180.00 and $385.00, and the permit is $8,788.45 all in.\n\nTwo limits belong with the number. The **plan review fee** is a separate charge on a separate schedule the site does not transcribe, and the **Technology Surcharge** — 10% of the plan review fee and the building permit fee — cannot be stated without it. Both are named rather than guessed at.",
      notIncluded:
        "This estimate is Table A's valuation fee or Table B.1's flat scope for the job named, plus the four City charges the fee listing states. It excludes:\n\n- **The plan review fee** and the **Technology Surcharge** that is 10% of it plus the building permit fee, for the reason the summary gives: plan review is priced on a separate schedule this site does not carry.\n- **The electrical, plumbing and mechanical permits** on the same project. This site prices two of the three trades, and neither is included here.\n- **Solar photovoltaic and solar water heater permits**, which the City issues under its own streamlined solar permit.\n- **Table B.1's other flat scopes** — re-roof and wrecking permits at $175, site-built and pre-engineered patio covers at $288 and $250, which the site does model, and the plan review amounts printed beside them, which it does not.\n- **The sign permit fee**, priced by the City \"based on the valuation of the sign\" with its own valuation tables, and the $216 electrical fee for a sign, which the electrical page covers.\n- **Hourly and penalty charges**: the $216 staff hourly rate, expedited plan review, permit renewal at $216 per hour with a three-hour minimum, permit extension, re-inspection, emergency and overtime inspections, master plan review, and the work-without-permit penalty.\n- **The City's impact fees and other agencies' charges** collected with the permit: utilities' water, sewer, drainage and meter fees, the county sanitation district's charge, school impact fees, SAFCA flood control, the transportation authority's fee, and the fire department's plan review and inspection fees.",
      workedExample: {
        scenario:
          "A new single-family house in the City of Sacramento with a construction valuation of $450,000, four bedrooms, built by a licensed California contractor, permitted as a building permit.",
        inputs: {
          valuationCents: 45_000_000,
          occupancy: "residential",
          workType: "new_construction",
          units: 1,
          custom: { bedrooms: 4 },
        },
        notes:
          "The valuation of $450,000 is above $100,000, so the fee is Table A's first formula: $1,078 plus $0.006787 for each dollar above $100,000, which is $1,078 + 350,000 × $0.006787 = $3,453.45. Three of the City's charges are then a rate on the same figure — the General Plan Maintenance Fee at $2.60 per $1,000 is $1,170.00, the Construction Excise Tax at 0.008 is $3,600.00, and the City Business Operations Tax at $0.40 per $1,000 is $180.00, which is charged because a licensed contractor holds the permit. The fourth is per unit rather than on the valuation: the Residential Construction Tax for a four-bedroom unit is $385.00. Total: $8,788.45.\n\nTwo variations show what moves. **As an owner-builder permit** the same house pays $8,608.45, because the City Business Operations Tax is charged only when a licensed contractor is the permit holder — a $180.00 difference that has nothing to do with the building. **As a $250,000 commercial building** the ladder is replaced by the same formula and the Residential Construction Tax disappears, so a $250,000 commercial permit is $2,096.05 of permit fee, $650.00 of General Plan, $2,000.00 of excise tax and $100.00 of business operations tax, $4,846.05 in all.\n\nOne caution belongs with the number. A valuation is the applicant's own figure and it is the whole basis of the fee, so a difference of $100,000 of declared value moves this permit by rather more than the fee itself. The plan review fee, which the City's sheet prints beside every flat scope and prices on a separate table, is not in any of these totals.",
      },
      faqs: [
        {
          question: "Is the fee a percentage of my project's valuation?",
          answer:
            "Above $100,000 it is — but not a flat percentage, and below it, not at all. Table A prints a bracket for every $1,000 of valuation to $99,999, so a $40,000 project pays $622 and that is the end of it; above $100,000 the schedule prints $1,078 plus $0.006787 for every dollar over $100,000, which is a marginal rate rather than a percentage of the whole. The City's own four add-ons do include two genuine percentages: the General Plan Maintenance Fee at $2.60 per $1,000 and the excise tax at 0.008.",
          sourceId: SC_TABLE_A_SOURCE_KEY,
          attribution: "Table A, Building Permit Fee Schedule (based on Valuation)",
        },
        {
          question: "Why does the schedule stop printing brackets?",
          answer:
            "Because printing one per $1,000 of valuation stops being useful somewhere, and $99,999 is where the City stopped. From there the schedule prints three formulas instead: \"$1078 + $0.006787 each $1 > $100,000\", \"$20,761 + $0.005133 each $1 >$3 mil\" and \"$56,692 + $0.004620 each $1 >$10 mil\". They meet the ladder exactly — $1,078 at $100,000 is the last bracket's amount — so the formula is the same schedule continued, not a separate charge.",
          sourceId: SC_TABLE_A_SOURCE_KEY,
          attribution: "Table A, Building Permit Fee Schedule (based on Valuation)",
        },
        {
          question: "What is the difference between the Commercial and Residential columns?",
          answer:
            "On 98 of the table's 100 rows, nothing — the two columns print the same amount. On two rows they differ: at $33,999 of valuation the Residential column prints $577 where the Commercial column prints $557, and at $36,999 it prints $586 where the Commercial column prints $585. This site carries both as printed, and reads the column from the occupancy of the job.",
          sourceId: SC_TABLE_A_SOURCE_KEY,
          attribution: "Table A, Commercial and Residential columns",
        },
        {
          question: "What is the Construction Excise Tax charged on?",
          answer:
            'The listing says ".008 x of the 2002 ICBO Valuation", and that it is charged "on all new square footage constructed in the city", with patio covers as its own stated exception. This site charges 0.008 of the valuation a reader supplies. It says so plainly rather than implying the site reproduces the City\'s 2002 ICBO tables, which it does not.',
          sourceId: SC_FEE_LISTING_SOURCE_KEY,
          attribution: "City of Sacramento Fees and Charges, Construction Excise Tax",
        },
        {
          question: "Do I pay the City Business Operations Tax?",
          answer:
            'Only if a California licensed contractor is the permit holder. The listing states it three ways — "$0.40 per $1,000 of project valuation (Maximum limit of $5,000.00 per calendar year per contractor)", "Only charged if a California licensed contractor is the permit holder" — so an owner-builder permit does not pay it, and this site does not charge it to one. On a $450,000 house it is $180.00.',
          sourceId: SC_FEE_LISTING_SOURCE_KEY,
          attribution: "City of Sacramento Fees and Charges, City Business Operations Tax",
        },
        {
          question: "How much is the Residential Construction Tax?",
          answer:
            '"Per unit as applicable: Mobile home lot constructed or one bedroom unit $250; Two bedroom units $315; 3+ bedroom units $385." It is charged per dwelling unit rather than once, so two two-bedroom units pay $630.00 and not $315.00.',
          sourceId: SC_FEE_LISTING_SOURCE_KEY,
          attribution: "City of Sacramento Fees and Charges, Residential Construction Tax (Building)",
        },
        {
          question: "Is plan review included?",
          answer:
            "It is not. The fee sheet prints a Plan Review Fee column beside every flat scope — $164 against the $288 site-built patio cover — and the City's record for it describes the fee as calculated either from a separate valuation table or hourly at the current staff rate. This site does not transcribe that table, so plan review is named here rather than computed, and so is the Technology Surcharge, which is 10% of the plan review fee and the building permit fee together.",
          sourceId: SC_FEE_LISTING_SOURCE_KEY,
          attribution: "City of Sacramento Fees and Charges, Plan Review Fee and Technology Surcharge",
        },
      ],
      seoTitle: "Sacramento Building Permit Cost (valuation brackets to $99,999, formulas above)",
      seoDescription:
        "A City of Sacramento building permit is priced from valuation: $1,000 brackets to $99,999 and three printed formulas above $100,000, plus the General Plan, excise, business operations and residential construction charges.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: SC_LAST_VERIFIED,
    },

    {
      jurisdictionKey: SC_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      slug: "electrical-permit-cost",
      title: "Sacramento electrical permit cost",
      intro:
        "A City of Sacramento electrical permit is a **flat amount for a named scope**, and there is no per-circuit, per-outlet or per-ampere table to add to it. One $105 residential minor electrical permit covers a main panel change-out, a new or replacement subpanel, a whole-or-partial re-wire and new branch circuits — one or more of them under the same permit. A safety inspection of an electrical or gas piping system is $107, and the electrical work in a sign is $216.",
      localSummary:
        "The $105 permit is the row most jobs fall on, and what makes it unusual is how much it covers. Table B.1 lists the scopes a single permit under this category may authorise — \"replacement of a main electrical panel, installation of a new or replacement subpanel or both, and/or re-wiring of an entire house or accessory structure or a portion of a house or accessory structure, and/or installation of new branch circuits, reconfiguration of existing branch wiring or both\" — and it charges $105 for the permit rather than a rate per item. A panel change-out and a partial re-wire in the same house is one $105 permit here, not two charges.\n\nThat is the opposite of the shape the other California jurisdiction on this site uses. San Diego's electrical schedule prints a service charge per dwelling unit and per-item rows for a generator, a temporary pole or a specialised occupancy; Sacramento prints none of those, because the work they describe falls inside the flat scopes. It also means there is no rate to scale: a hundred new branch circuits and one new branch circuit cost the same $105, which is a fact a reader comparing quotes should know before assuming a big job is charged proportionally.\n\nTwo other rows complete the electrical schedule. A **safety inspection** is $107 and is the one electrical row that authorises no work at all — the sheet describes it as an \"inspection of an electrical system or gas piping system for compliance with California Building code prior to reactivation of SMUD connection or PG&E gas supply\", which is what a reader needs when a utility connection has been shut off. The electrical fee for a **sign** is $216, separate from the sign permit fee itself.\n\nOne thing the $105 row is easy to misread: it is a building permit. Sacramento's Building Division issues it, its plan review column prints N/A, and the sheet recommends the \"Web-Minor Electrical Record type\" for it — so it is applied for like any other permit rather than granted over the counter without paperwork.",
      notIncluded:
        "This estimate is Table B.1's residential electrical scopes and the listing's sign electrical fee. It excludes:\n\n- **Solar photovoltaic and solar water heater systems**, which the sheet routes to the City's Streamlined Permit for Residential & Commercial Solar PV and Solar Water Heater Systems rather than pricing in Table B.1.\n- **The building permit** on the same project and the **plumbing** and **mechanical** permits, none of which is included here; mechanical work is not priced anywhere on this site.\n- **Specialised occupancies and commercial electrical work** beyond the sign row. The flat scopes in Table B.1 are written for residential work, and a commercial project is priced from project value or under the commercial sections of the sheet.\n- **The $175 HVAC cut-in or change-out permit**, which the sheet lists among its residential rows but which is a mechanical permit.\n- **The electrical service itself**: Sacramento's sheet prices a permit for electrical work, and the utility service and meter charges belong to the utility.\n- **Plan review** where the City requires it, and the **Technology Surcharge** of 10% of the plan review and permit fees, for the same reason as on the building page.",
      workedExample: {
        scenario:
          "A house in the City of Sacramento having its main electrical panel changed out and a portion of its wiring re-wired, permitted as one residential minor electrical permit.",
        inputs: {
          occupancy: "residential",
          workType: "alteration",
          custom: { electrical_item: "minor_residential" },
        },
        notes:
          "One permit, $105.00. The two scopes are not charged separately: Table B.1 says a permit under the Residential Minor Electrical Work category \"may authorize one or more of these scopes of work under one permit\", and lists the panel change-out and the partial re-wire among them alongside new branch circuits and a new subpanel. The flat amount is the whole fee for the electrical work, and adding the branch circuits to the same job does not change it.\n\nTwo variations show the edges of the row. A **safety inspection** — an inspection of an electrical or gas piping system before a utility connection is reactivated, authorising no work — is $107.00, and the **electrical work in a sign** is $216.00, which is charged alongside the sign permit fee rather than in place of it. Solar photovoltaic and solar water heater systems are none of these: the sheet sends them to the City's separate streamlined solar permit, so they are not priced here.",
      },
      faqs: [
        {
          question: "How much does a residential electrical permit cost in Sacramento?",
          answer:
            'A flat $105 for the Residential Minor Electrical Work permit, which the sheet says "may authorize one or more of these scopes of work under one permit: replacement of a main electrical panel, installation of a new or replacement subpanel or both, and/or re-wiring of an entire house or accessory structure or a portion of a house or accessory structure, and/or installation of new branch circuits". Two other electrical rows exist: a safety inspection at $107 and a sign\'s electrical fee at $216.',
          sourceId: SC_TABLE_A_SOURCE_KEY,
          attribution: "Table B.1, Residential Minor Electrical Work",
        },
        {
          question: "Am I charged per circuit or per outlet?",
          answer:
            "No. Sacramento prints no per-circuit, per-outlet or per-ampere electrical table in Table B.1 — the permit is a flat amount for the named scope, and the listed scopes are covered by it however many of them the job involves. That is a real difference from the other California jurisdiction on this site, where most electrical rows are a rate per item or per dwelling unit.",
          sourceId: SC_TABLE_A_SOURCE_KEY,
          attribution: "Table B.1, Residential Minor Electrical Work",
        },
        {
          question: "Does a panel change-out and a re-wire need two permits?",
          answer:
            'No. Both are scopes within the same category, and the sheet says the permit "may authorize one or more of these scopes of work under one permit". One $105 permit covers the pair, along with a new subpanel and new branch circuits if the job includes them.',
          sourceId: SC_TABLE_A_SOURCE_KEY,
          attribution: "Table B.1, Residential Minor Electrical Work",
        },
        {
          question: "What is the $107 safety inspection for?",
          answer:
            'It is the row for "inspection of an electrical system or gas piping system for compliance with California Building code prior to reactivation of SMUD connection or PG&E gas supply. Authorizes no work only inspection." It is the permit to ask for when a utility connection has been shut off and an inspection is what stands between the owner and its restoration — and it authorises no electrical work, so any repair it uncovers is a separate permit.',
          sourceId: SC_TABLE_A_SOURCE_KEY,
          attribution: "Table B.1, Safety Inspection",
        },
        {
          question: "Are solar panels priced here?",
          answer:
            "No. The sheet routes residential photovoltaic and solar water heater systems to a separate row — \"Solar water heater systems (SWHS) 120 gallons or less refer to Streamlined Permit for Residential & Commercial Solar PV and Solar Water Heater Systems\" — whose fee is stated as a reference to its own detail rather than as an amount in Table B.1. Commercial solar water heaters are sent to \"a standard commercial remodel permit\" instead.",
          sourceId: SC_TABLE_A_SOURCE_KEY,
          attribution: "Table B.1, Streamlined Permit for Solar PV and Solar Water Heater Systems",
        },
      ],
      seoTitle: "Sacramento Electrical Permit Cost (flat scopes: $105, $107, $216)",
      seoDescription:
        "A City of Sacramento residential electrical permit is a flat $105 for a named scope — panel change-out, subpanel, re-wire or branch circuits — with a $107 safety inspection and a $216 sign electrical fee.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: SC_LAST_VERIFIED,
    },

    {
      jurisdictionKey: SC_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      slug: "plumbing-permit-cost",
      title: "Sacramento plumbing permit cost",
      intro:
        "A City of Sacramento plumbing permit is a **flat amount for a named scope**. One $105 residential minor plumbing permit covers one or more of a set of listed scopes — a sewer service, a water service, a drain line, a water supply line, a gas service, a single kitchen or bathroom fixture, or a toilet replacement. A water heater installed, replaced or moved is $75. The same permit covers the gas work, which is why no separate gas permit appears here.",
      localSummary:
        "The $105 row is generous, and its limit is the thing to read carefully. Table B.1 lists the scopes one permit under this category may authorise — \"replacement of portions of a residential sewer service from the city cleanout or the total replacement of a sewer service, and/or replacement or repair of a domestic water service line connecting the city valve to the structure, and/or replacement or repair of domestic water supply lines (re-pipe house), and/or replacement or repair of domestic drain line (re-pipe wastewater line), and/or replacement or repair of existing gas line service (or new leg), and/or single appliance or a plumbing fixture repair or replacement in the kitchen, and/or single appliance or a plumbing fixture repair or replacement in the bathroom, and/or toilet replacement (one or more).\"\n\nThe limit is printed in the sheet's own words: \"If more than one bathroom or one kitchen appliance or fixture repair is needed, use the kitchen or bathroom remodel section above, or calculate based on value. The only exception is that one or more toilets may be replaced in addition to another bathroom fixture, such as a shower valve.\" So a whole-house re-pipe with one bathroom fixture replaced is one $105 permit, while two bathroom fixtures on the same job are not this permit at all — they are a $320 non-structural bathroom remodel, or a fee calculated from the project's valuation. That is the single most expensive misreading available on this row, and it is why the page states it rather than only the price.\n\nThe **water heater** row is the other one most readers need. It is $75 for \"new installation, replacement or move\" — the last of which matters, because relocating a water heater is not a like-for-like swap. On the commercial side the sheet prices a like-for-like replacement at the same $75 and sends a commercial solar water heater to \"a standard commercial remodel permit\". A water heater is also the one plumbing row priced independently of the minor-plumbing scope, so a job doing both pays both.",
      notIncluded:
        "This estimate is Table B.1's residential minor plumbing scope and its water heater row. It excludes:\n\n- **The $320 non-structural bathroom remodel and the $425 non-structural kitchen remodel**, which is where the sheet sends a job with more than one fixture; the building page prices them.\n- **The building permit** on the same project, and the **electrical** and **mechanical** permits, none of which is included here; mechanical work is not priced anywhere on this site.\n- **Commercial plumbing work** beyond the like-for-like water heater row. The flat scopes in Table B.1 are the residential ones, and a commercial project is priced from project value or under the commercial sections of the sheet.\n- **Sewer, water and drainage development fees and meter charges**, which belong to the City's Utilities department and are impact and connection charges rather than plumbing permit fees. A reader will see them on the same invoice, which is the reason they are named.\n- **The City's water supply test, water meter and temporary construction water charges.**\n- **Plan review** where the City requires it, and the **Technology Surcharge** of 10% of the plan review and permit fees, for the same reason as on the building page.",
      workedExample: {
        scenario:
          "A house in the City of Sacramento replacing a portion of its sewer service, repairing the domestic water service line, and replacing a toilet — permitted as one residential minor plumbing permit.",
        inputs: {
          occupancy: "residential",
          workType: "replacement",
          custom: { plumbing_item: "minor_residential" },
        },
        notes:
          "One permit, $105.00. The sheet is explicit that a permit under this category may authorise one or more of its listed scopes, and all three of these are on the list — the sewer service, the water service line, and toilet replacement, which it states as \"one or more\". The flat amount is the whole fee, and the gas service on the same list would not have added anything either.\n\nTwo variations show what moves the number. **A water heater** on its own is $75.00, for a new installation, a replacement or a move, and it is a separate permit from the minor plumbing scope rather than an item inside it — so a job doing both the re-pipe and the water heater pays $180.00. **Two bathroom fixtures** on the same job is not this permit at all: the sheet sends it to the $320.00 non-structural bathroom remodel or to a fee calculated from the project's valuation, which is the difference between $105.00 and several hundred dollars.",
      },
      faqs: [
        {
          question: "How much does a plumbing permit cost in Sacramento?",
          answer:
            'A flat $105 for "Residential Minor Plumbing Repair or Replacement Work", and $75 for a water heater installed, replaced or moved. The $105 permit is not one item of work — the sheet prints a list of scopes it covers, from a sewer service and a water supply re-pipe through a gas line and a single kitchen or bathroom fixture to toilet replacement.',
          sourceId: SC_TABLE_A_SOURCE_KEY,
          attribution: "Table B.1, Residential Minor Plumbing Repair or Replacement Work",
        },
        {
          question: "Can I do several plumbing items on one $105 permit?",
          answer:
            'Yes, if they are on the sheet\'s list: "Permits issued under this category may authorize one or more of these scopes of work under one permit." A sewer service replacement, a domestic water service line repair, a whole-house re-pipe, a drain line, a gas line and a single bathroom fixture all sit inside the one amount.',
          sourceId: SC_TABLE_A_SOURCE_KEY,
          attribution: "Table B.1, Residential Minor Plumbing Repair or Replacement Work",
        },
        {
          question: "When does a plumbing job stop being a minor permit?",
          answer:
            'When more than one bathroom or kitchen fixture is repaired or replaced, in the sheet\'s own words: "If more than one bathroom or one kitchen appliance or fixture repair is needed, use the kitchen or bathroom remodel section above, or calculate based on value. The only exception is that one or more toilets may be replaced in addition to another bathroom fixture, such as a shower valve." So any number of toilets plus one other fixture stays at $105; two other fixtures do not.',
          sourceId: SC_TABLE_A_SOURCE_KEY,
          attribution: "Table B.1, Residential Minor Plumbing Repair or Replacement Work",
        },
        {
          question: "Does moving a water heater cost more than replacing one?",
          answer:
            'No — the sheet prices "Water heater (new installation, replacement or move)" at the same $75. It does mark it as a separate permit from the minor plumbing scope, so a job replacing a water heater and re-piping a house pays $180.00 rather than $105.00.',
          sourceId: SC_TABLE_A_SOURCE_KEY,
          attribution: "Table B.1, Water heater",
        },
        {
          question: "Is the gas work on a separate permit?",
          answer:
            'No. Gas service and a new gas line leg are both on the minor plumbing permit\'s list of scopes, and the sheet\'s $107 safety inspection row is explicitly for an "inspection of an electrical system or gas piping system … prior to reactivation of SMUD connection or PG&E gas supply" — so gas fittings appear on the plumbing side of the schedule rather than on a permit of their own.',
          sourceId: SC_TABLE_A_SOURCE_KEY,
          attribution: "Table B.1, Residential Minor Plumbing Repair or Replacement Work and Safety Inspection",
        },
      ],
      seoTitle: "Sacramento Plumbing Permit Cost (flat scopes: $105 and $75)",
      seoDescription:
        "A City of Sacramento residential plumbing permit is a flat $105 covering a listed set of scopes from a sewer service to a single fixture, and a water heater installed, replaced or moved is $75.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: SC_LAST_VERIFIED,
    },
  ],

  verifications: [
    {
      entityType: "source",
      entityKey: SC_TABLE_A_SOURCE_KEY,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: SC_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: SC_TABLE_A_SOURCE_KEY,
      notes:
        "Read twice from the City's own fee record and extracted in three `pdftotext` modes. The row-by-row mode is the one modelled, because the layout mode mis-paired Table A's Commercial and Residential columns by one row; the row-by-row read reproduces the document's arithmetic bracket by bracket.",
    },
    {
      entityType: "source",
      entityKey: SC_FEE_LISTING_SOURCE_KEY,
      status: "verified",
      method: "official_portal_check",
      verifiedAt: SC_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: SC_FEE_LISTING_SOURCE_KEY,
      notes:
        "Read from the City's searchable fee listing, which is the page its own building-fees page links to as \"Search a fee\". Each figure modelled from it was read on the row that states it, and the two ceilings — $38,200 on the General Plan Maintenance Fee and $5,000 on the City Business Operations Tax — were checked by computing a valuation above them.",
    },
    {
      entityType: "fee_rule",
      entityKey: "BUILD-PERMIT-COMMERCIAL",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: SC_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: SC_TABLE_A_SOURCE_KEY,
      notes:
        "Table A's Commercial column, brackets $999 to $99,999. Verified at the bottom of the ladder ($999 pays $75.00), in the middle ($40,000 falls in the $40,999 bracket and pays $622.00) and at the top ($99,999 pays $1,078.00).",
    },
    {
      entityType: "fee_rule",
      entityKey: "BUILD-PERMIT-RESIDENTIAL",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: SC_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: SC_TABLE_A_SOURCE_KEY,
      notes:
        "Table A's Residential column, with the two rows where it differs from the Commercial column carried as printed. Verified on both: $33,999 of valuation computes $577.00 residential against $557.00 commercial, and $36,999 computes $586.00 against $585.00.",
    },
    {
      entityType: "fee_rule",
      entityKey: "BUILD-PERMIT-BAND-100K-TO-3M",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: SC_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: SC_TABLE_A_SOURCE_KEY,
      notes:
        "Verified for continuity with the ladder it takes over from: $100,000 of valuation computes $1,078.00, the last bracket's amount, and $100,001 computes $1,078.01. At $450,000 it computes $3,453.45, and one cent below $3,000,000 it computes $20,760.30 against the second band's $20,761.00.",
    },
    {
      entityType: "fee_rule",
      entityKey: "BUILD-PERMIT-BAND-3M-TO-10M",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: SC_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: SC_TABLE_A_SOURCE_KEY,
      notes:
        "Verified at its own boundary: $3,000,000 of valuation computes exactly $20,761.00, which is the amount the band's add factor prints, and the band below reaches $20,760.30 one cent earlier. $4,000,000 computes $25,894.00.",
    },
    {
      entityType: "fee_rule",
      entityKey: "BUILD-PERMIT-BAND-10M-UP",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: SC_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: SC_TABLE_A_SOURCE_KEY,
      notes:
        "Verified at its boundary: $10,000,000 computes exactly $56,692.00, and $12,000,000 computes $65,932.00.",
    },
    {
      entityType: "fee_rule",
      entityKey: "BUILD-GENERAL-PLAN",
      permitTypeKey: "building",
      status: "verified",
      method: "official_portal_check",
      verifiedAt: SC_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: SC_FEE_LISTING_SOURCE_KEY,
      notes:
        "Verified against both ends of its own sentence: $450,000 of valuation computes $1,170.00 at $2.60 per $1,000, and $20,000,000 is held at the published ceiling of $38,200.00 rather than computing $52,000.00.",
    },
    {
      entityType: "fee_rule",
      entityKey: "BUILD-BUSINESS-OPERATIONS-TAX",
      permitTypeKey: "building",
      status: "verified",
      method: "official_portal_check",
      verifiedAt: SC_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: SC_FEE_LISTING_SOURCE_KEY,
      notes:
        "Verified on both of its conditions: a $450,000 house computes $180.00 with a licensed contractor and nothing at all as an owner-builder permit, and $20,000,000 is held at the published $5,000.00 ceiling.",
    },
    {
      entityType: "fee_rule",
      entityKey: "BUILD-RESIDENTIAL-CONSTRUCTION-TAX-2BR",
      permitTypeKey: "building",
      status: "verified",
      method: "official_portal_check",
      verifiedAt: SC_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: SC_FEE_LISTING_SOURCE_KEY,
      notes:
        "Verified as a per-unit charge rather than a per-permit one: one two-bedroom unit computes $315.00 and two compute $630.00, which is what \"Per unit as applicable\" means and what a per-permit floor would have got wrong.",
    },
    {
      entityType: "fee_rule",
      entityKey: "ELEC-MINOR-RESIDENTIAL",
      permitTypeKey: "electrical",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: SC_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: SC_TABLE_A_SOURCE_KEY,
      notes:
        "Read from Table B.1's row-by-row extraction, where the layout mode had appeared to pair $175 with the panel row and $107 with the re-wire row; the row-by-row read shows the $175 belongs to Re-Roof and the $107 to Safety Inspection, and $105 to the electrical work category. The $105 was then checked against the City's own fee listing, which repeats it on the same row.",
    },
    {
      entityType: "fee_rule",
      entityKey: "PLUMB-MINOR-RESIDENTIAL",
      permitTypeKey: "plumbing",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: SC_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: SC_TABLE_A_SOURCE_KEY,
      notes:
        "Read from the same row-by-row extraction and paired with the sheet's own list of the scopes the permit may authorise, which is what the page quotes rather than paraphrasing.",
    },
    {
      entityType: "permit_page",
      entityKey: "building-permit-cost",
      permitTypeKey: "building",
      status: "verified",
      method: "manual_review",
      verifiedAt: SC_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: SC_TABLE_A_SOURCE_KEY,
      notes:
        "The worked example was recomputed with the engine: $3,453.45 of permit fee, $1,170.00 of General Plan, $3,600.00 of excise tax, $180.00 of business operations tax and $385.00 of residential construction tax, $8,788.45 — and the owner-builder variation $8,608.45, which is the same figure less that $180.00 and nothing else.",
    },
    {
      entityType: "permit_page",
      entityKey: "electrical-permit-cost",
      permitTypeKey: "electrical",
      status: "verified",
      method: "manual_review",
      verifiedAt: SC_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: SC_TABLE_A_SOURCE_KEY,
      notes:
        "Recomputed with the engine: the minor electrical scope $105.00, the safety inspection $107.00, the sign electrical fee $216.00, and no per-item component on any of them.",
    },
    {
      entityType: "permit_page",
      entityKey: "plumbing-permit-cost",
      permitTypeKey: "plumbing",
      status: "verified",
      method: "manual_review",
      verifiedAt: SC_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: SC_TABLE_A_SOURCE_KEY,
      notes:
        "Recomputed with the engine: the minor plumbing scope $105.00 and the water heater $75.00, and the two together $180.00.",
    },
    {
      entityType: "jurisdiction_profile",
      entityKey: SC_KEYS.jurisdiction,
      status: "verified",
      method: "manual_review",
      verifiedAt: SC_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: SC_TABLE_A_SOURCE_KEY,
      notes:
        "The profile's claims about which document prices what, about the ladder handing over to a formula, and about the two rows where the columns differ, are read off the fee sheet and the fee listing rather than inferred; the portal address is the one the City's own online-services page links to.",
    },
  ],
};

/** Permit pages that clear the editorial gate for this jurisdiction. */
export const SC_PUBLISHED_PERMIT_PAGES = sacramentoSeed.permitPages.filter(
  (page) => page.publishStatus === "published" && !page.noindex,
);
