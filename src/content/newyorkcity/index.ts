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
  NEW_YORK_CITY_ADMIN_CODE_SOURCE_KEY,
  NEW_YORK_CITY_BUILDING_BASE_RULES,
  NEW_YORK_CITY_ELECTRICAL_BASE_RULES,
  NEW_YORK_CITY_ELECTRICAL_FAQ_SOURCE_KEY,
  NEW_YORK_CITY_ELECTRICAL_EFFECTIVE_FROM,
  NEW_YORK_CITY_FEE_EFFECTIVE_FROM,
  NEW_YORK_CITY_LAA_CHARTS_SOURCE_KEY,
  NEW_YORK_CITY_LAA_SOURCE_KEY,
  NEW_YORK_CITY_LOCAL_LAW_128_SOURCE_KEY,
  NEW_YORK_CITY_LOCAL_LAW_77_SOURCE_KEY,
  NEW_YORK_CITY_PLUMBING_BASE_RULES,
  NEW_YORK_CITY_RCNY_SOURCE_KEY,
} from "./fee-rules";

export * from "./fee-rules";

/**
 * The complete New York City, New York seed payload.
 *
 * Every figure traces to research/new-york/new-york-city.md, which traces to Table 28-112.2
 * of the NYC Administrative Code as amended by Local Law 77 of 2023 and Local Law 128 of
 * 2024, and to 1 RCNY §101-03 for the electrical schedule and the records management fee.
 * Nothing is estimated.
 *
 * Three pages, all published: building, electrical and plumbing. New York City is the first
 * jurisdiction in this dataset whose trade fees come from a *rule* rather than from the fee
 * table — §28-112.2.2 sends electrical work to "department rules" — and the first with no
 * percentage surcharge of any kind: no plan review, no technology fee, no state or county
 * levy, because searches for each of those phrases come back empty in the City's text.
 *
 * The county row records **New York County (Manhattan)**. The City spans five counties and
 * DOB's jurisdiction is citywide, so the county is a locator rather than an authority: 280
 * Broadway, the address on the Department's own notices, and City Hall are both in it.
 */

const RESEARCHER = "Permit Fee Intelligence research pass 12 (New York)";

export const NEW_YORK_CITY_LAST_VERIFIED = "2026-09-25";

export const NEW_YORK_CITY_KEYS = {
  state: "ny",
  county: "new-york-county",
  jurisdiction: "new-york-city",
  feeSchedule: "nyc-table-28-112-2",
  electricalSchedule: "nyc-1-rcny-101-03",
} as const;

const state: SeedState = {
  code: "NY",
  slug: "new-york",
  name: "New York",
  fipsCode: "36",
};

const county: SeedCounty = {
  key: NEW_YORK_CITY_KEYS.county,
  slug: "new-york-county",
  name: "New York County",
  fipsCode: "36061",
};

const jurisdiction: SeedJurisdiction = {
  key: NEW_YORK_CITY_KEYS.jurisdiction,
  stateKey: NEW_YORK_CITY_KEYS.state,
  countyKey: NEW_YORK_CITY_KEYS.county,
  type: "city",
  slug: "new-york-city",
  name: "New York City",
  officialName: "City of New York",
  websiteUrl: "https://www.nyc.gov/",
  permitPortalUrl: "https://www.nyc.gov/dobnow",
  timezone: "America/New_York",
  isActive: true,
};

const departments: SeedDepartment[] = [
  {
    key: "nyc-department-of-buildings",
    jurisdictionKey: NEW_YORK_CITY_KEYS.jurisdiction,
    kind: "building",
    name: "New York City Department of Buildings",
    phone: "(212) 566-5000",
    email: null,
    url: "https://www.nyc.gov/site/buildings/index.page",
    addressLine: "280 Broadway, 7th Floor, New York, NY 10007",
    hours:
      "In-person and drop-off customer service 8:30am to 4:00pm; phone lines 8:30am to 4:30pm, Monday through Friday",
    notes:
      "DOB issues all three permits this site prices — building, electrical and plumbing — and takes the filings through DOB NOW: Build. The Department keeps office locations in each of the five boroughs rather than one counter, and its contact page lists them; 280 Broadway is the headquarters address printed on the Department's own rulemaking notices, and the number above is the main line it publishes. Call 311 for complaints and for questions about any City agency. FDNY, not DOB, permits sprinklers, standpipes and alarm systems.",
  },
];

const sources: SeedSource[] = [
  {
    key: NEW_YORK_CITY_ADMIN_CODE_SOURCE_KEY,
    jurisdictionKey: NEW_YORK_CITY_KEYS.jurisdiction,
    title:
      "NYC Administrative Code §28-112.2 and Table 28-112.2 — Schedule of permit fees, in the City's official codification",
    url: "https://codelibrary.amlegal.com/codes/newyorkcity/latest/NYCadmin/0-0-0-156650",
    sourceType: "municipal_code",
    issuingAuthority: "City of New York — Administrative Code, codified by American Legal Publishing",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: NEW_YORK_CITY_FEE_EFFECTIVE_FROM,
    retrievedAt: NEW_YORK_CITY_LAST_VERIFIED,
    lastVerifiedAt: NEW_YORK_CITY_LAST_VERIFIED,
    notes:
      "Read 2026-09-25 as the codifier's consolidated text of the section and its 39-row table, with the amendment history it prints at the foot: \"Am. L.L. 2016/056, 5/10/2016, eff. 6/9/2016; Am. L.L. 2021/126, 11/7/2021, eff. 11/7/2022; Am. L.L. 2023/077, 6/11/2023, eff. 6/11/2023; Am. L.L. 2024/128, 12/21/2024, eff. 12/21/2025\". §28-112.2 sends permits for \"new buildings, structures, mechanical, and plumbing, and electrical systems or alterations\" to this table and to §§28-112.2.1 and 28-112.2.2; the table's alteration rows 11, 12, 13, 14 and 15 are where every building and plumbing figure on this site comes from, and row 15.1 sends electrical work to department rules.",
  },
  {
    key: NEW_YORK_CITY_LOCAL_LAW_77_SOURCE_KEY,
    jurisdictionKey: NEW_YORK_CITY_KEYS.jurisdiction,
    title:
      "Local Law 77 of 2023 of the City of New York — the law that printed the current Table 28-112.2 (Council Int. No. 875-B of 2023)",
    url: "https://www.nyc.gov/assets/buildings/local_laws/ll77of2023.pdf",
    sourceType: "ordinance",
    issuingAuthority: "New York City Council",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2023-05-11",
    effectiveFrom: NEW_YORK_CITY_FEE_EFFECTIVE_FROM,
    retrievedAt: NEW_YORK_CITY_LAST_VERIFIED,
    lastVerifiedAt: NEW_YORK_CITY_LAST_VERIFIED,
    notes:
      "Read 2026-09-25 as the City Clerk's own 184-page PDF: a local law \"passed by the Council on May 11, 2023 and returned unsigned by the Mayor on June 13, 2023\". Section 14 reprints Table 28-112.2 in full, and the table's own arithmetic was extracted twice — with pdftotext's -layout and -raw modes — because a page break splits a row's Alteration Types from their minimum fees and only one of the two extractions pairs them correctly. This is the instrument that put $2.60, $10.30 and $17.75 per $1,000 on the pages, and the codifier dates its effect to 11 June 2023.",
  },
  {
    key: NEW_YORK_CITY_LOCAL_LAW_128_SOURCE_KEY,
    jurisdictionKey: NEW_YORK_CITY_KEYS.jurisdiction,
    title:
      "Local Law 128 of 2024 of the City of New York — electrical code and permit fee amendments (Council Int. No. 436-A of 2024)",
    url: "https://www.nyc.gov/assets/buildings/local_laws/ll128of2024.pdf",
    sourceType: "ordinance",
    issuingAuthority: "New York City Council",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2024-11-21",
    effectiveFrom: "2025-12-21",
    retrievedAt: NEW_YORK_CITY_LAST_VERIFIED,
    lastVerifiedAt: NEW_YORK_CITY_LAST_VERIFIED,
    notes:
      "Read 2026-09-25 as the City Clerk's PDF: passed 21 November 2024, returned unsigned 23 December 2024, and by §29 effective one year after it became law — the codifier records that as 21 December 2025, so it is in force on this pass's verification date. It rewrote §28-112.2's payment paragraph, added §28-112.2.1 (non-electrical work: 50% and not less than $130 where a certificate of occupancy changes, 100% otherwise) and §28-112.2.2 (electrical work: fees \"in accordance with department rules\", 50% and not less than $130 at filing), and added row 15.1 to the table. It moved no amount in the table, and it repealed the chapter of Title 27 that carried the electrical fee cap the rule still prints.",
  },
  {
    key: NEW_YORK_CITY_RCNY_SOURCE_KEY,
    jurisdictionKey: NEW_YORK_CITY_KEYS.jurisdiction,
    title:
      "1 RCNY §101-03 — Fees Payable to the Department of Buildings (electrical permit fees, minor work, records management fee)",
    url: "https://codelibrary.amlegal.com/codes/newyorkcity/latest/NYCrules/0-0-0-2246",
    sourceType: "municipal_code",
    issuingAuthority: "New York City Department of Buildings — Rules of the City of New York, Title 1",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: NEW_YORK_CITY_ELECTRICAL_EFFECTIVE_FROM,
    retrievedAt: NEW_YORK_CITY_LAST_VERIFIED,
    lastVerifiedAt: NEW_YORK_CITY_LAST_VERIFIED,
    notes:
      "Read 2026-09-25 from the codifier's consolidated rule text. §28-112.2.2 of the Administrative Code sends electrical permit fees here, and this section prints them: $40 for the initial application, $0 for the first ten units and $.25 over, service switches at $8 to $375 by ampere band, service entrance cables at $15 to $75, panels at $15 to $75, signs at $40 to $115, elevators at $125 and $83, boiler controls at $12, minor work at $15 — and the records management fee of $45 or $165 for applications for new buildings and alterations. The section's promulgation details, downloaded from nyc.gov, show the electrical and records figures only in the original rule effective 1 July 2008; the section was last amended effective 13 August 2026 for sidewalk-shed provisions, and a pending DOB-219 rulemaking would amend the electrical rows.",
  },
  {
    key: NEW_YORK_CITY_LAA_CHARTS_SOURCE_KEY,
    jurisdictionKey: NEW_YORK_CITY_KEYS.jurisdiction,
    title:
      "DOB — Limited Alteration Application (LAA) Fees and Penalties Charts, for 1, 2, 3 Family and for all other buildings",
    url: "https://www.nyc.gov/site/buildings/industry/laa-fee-charts.page",
    sourceType: "fee_schedule_pdf",
    issuingAuthority: "New York City Department of Buildings",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2018-06-01",
    effectiveFrom: NEW_YORK_CITY_FEE_EFFECTIVE_FROM,
    retrievedAt: NEW_YORK_CITY_LAST_VERIFIED,
    lastVerifiedAt: NEW_YORK_CITY_LAST_VERIFIED,
    notes:
      "Read 2026-09-25: the page, and the two PDFs it links — /assets/buildings/pdf/laa_fee_chart_1-2-3_family.pdf and /assets/buildings/pdf/laa_fee_chart_other.pdf, both stamped JUNE 2018. The charts are a price list for rows 11 and 12 of Table 28-112.2 and they reproduce the table's own arithmetic line by line: $130.00 for a 1-2-3 family job to $5,000, then steps of exactly $2.60; $195.00 for any other building to $3,000, then steps of exactly $10.30. Four lines of each chart are asserted against the model's own output in the tests, which is the strongest check this jurisdiction has — the Department printing the table's formula as a list. The June 2018 stamp is when Local Law 56 of 2016's rates were programmed, not when the formula changed.",
  },
  {
    key: NEW_YORK_CITY_LAA_SOURCE_KEY,
    jurisdictionKey: NEW_YORK_CITY_KEYS.jurisdiction,
    title:
      "DOB — Limited Alteration Applications, and the Limited Plumbing Alterations categories an LAA has to fit",
    url: "https://www.nyc.gov/site/buildings/industry/limited-alteration-application.page",
    sourceType: "municipal_website",
    issuingAuthority: "New York City Department of Buildings",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: NEW_YORK_CITY_LAST_VERIFIED,
    lastVerifiedAt: NEW_YORK_CITY_LAST_VERIFIED,
    notes:
      "Read 2026-09-25 with its sibling page on limited plumbing alterations. The Department states that the LAA \"is used for plumbing work, fire suppression piping replacement and repairs, and oil burner installations that do not include construction work\", that Licensed Master Plumbers, Licensed Master Fire Suppression Piping Contractors and Licensed Oil Burner Installers file it in DOB NOW: Build, and that one category and one work type may be filed per application. The plumbing page carries the Category 1 limits — $35,000 per building including appliance and labour in any 12-month period, five or fewer new fixtures or connections — and Category 2's work list, which has no cost limit. This is what makes the plumbing page's claim checkable: DOB's own price list and the City's fee table are the same arithmetic.",
  },
  {
    key: NEW_YORK_CITY_ELECTRICAL_FAQ_SOURCE_KEY,
    jurisdictionKey: NEW_YORK_CITY_KEYS.jurisdiction,
    title: "DOB — Electrical Filings FAQs",
    url: "https://www.nyc.gov/site/buildings/industry/electrical-filings-buildfaqs.page",
    sourceType: "municipal_website",
    issuingAuthority: "New York City Department of Buildings",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: NEW_YORK_CITY_LAST_VERIFIED,
    lastVerifiedAt: NEW_YORK_CITY_LAST_VERIFIED,
    notes:
      "Read 2026-09-25 for the operational answers the rule does not give: electrical permits are valid for a maximum of 12 months and every renewal costs $130; a Post Approval Amendment costs $130; an After-Hours Variance is $130 to $650 plus $80 a day; the filing status moves to complete only when the job has passed inspection and \"all the fees (including parts fees) are paid\"; and Electrical Plan Review is required where the scope installs service equipment, transformers, UPS systems, generators, other power sources or energy-storage systems. It is also where the 50% payment rule is seen in practice — the Department says payments are made directly in DOB NOW: Build.",
  },
];

/** Empty on purpose: the permit types New York City uses already exist as shared rows. */
const permitTypes: JurisdictionSeed["permitTypes"] = [];
const projectTypes: JurisdictionSeed["projectTypes"] = [];

const jurisdictionPermitTypes: SeedJurisdictionPermitType[] = [
  {
    jurisdictionKey: NEW_YORK_CITY_KEYS.jurisdiction,
    permitTypeKey: "building",
    isAvailable: true,
    localName: "Construction permit — new building or alteration filing",
    officialUrl: "https://www.nyc.gov/site/buildings/property-or-business-owner/obtaining-a-permit.page",
    notes:
      "Priced on Table 28-112.2. An alteration is the cost of the work: a minimum filing fee for the first $5,000 (a house) or $3,000 (everything else), then $2.60, $10.30 or $17.75 for each further $1,000 or fraction, with the base set by Alteration Type 1, 2, 3 or the Limited Alteration Application and the rate set by the building's size. A new building that keeps no existing element is priced on floor area at $0.06, $0.26 or $0.45 a square foot with a per-structure minimum; one that keeps existing elements is priced on cost again.",
  },
  {
    jurisdictionKey: NEW_YORK_CITY_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    isAvailable: true,
    localName: "Electrical permit",
    officialUrl: "https://www.nyc.gov/site/buildings/industry/electrical-filings-buildfaqs.page",
    notes:
      "§28-112.2.2 sends electrical fees to department rules, and 1 RCNY §101-03 prints them: $40 for the initial application, then $0 for the first ten units and $0.25 for each outlet, fixture, horsepower, kilowatt or kilovolt-ampere after them, $8 to $375 for each service switch by ampere band, and $15 for a minor work permit. Parts fees for service entrance cables, panels, signs, elevators and boiler controls are named on the page and not charged here.",
  },
  {
    jurisdictionKey: NEW_YORK_CITY_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    isAvailable: true,
    localName: "Plumbing permit — filed as an alteration or as a Limited Alteration Application",
    officialUrl: "https://www.nyc.gov/site/buildings/industry/limited-alteration-application.page",
    notes:
      "There is no plumbing fee schedule: §28-112.2 charges a plumbing permit per Table 28-112.2, so a plumbing job pays the alteration row for its building and Alteration Type. Minor plumbing work filed by a Licensed Master Plumber is a Limited Alteration Application — $130 plus $2.60 per $1,000 above $5,000 in a one-, two- or three-family dwelling, $195 plus $10.30 per $1,000 above $3,000 elsewhere — which is DOB's own published LAA chart.",
  },
];

const feeSchedules: SeedFeeSchedule[] = [
  {
    key: NEW_YORK_CITY_KEYS.feeSchedule,
    jurisdictionKey: NEW_YORK_CITY_KEYS.jurisdiction,
    sourceKey: NEW_YORK_CITY_ADMIN_CODE_SOURCE_KEY,
    title: "NYC Administrative Code, Table 28-112.2 — Schedule of permit fees",
    officialUrl:
      "https://codelibrary.amlegal.com/codes/newyorkcity/latest/NYCadmin/0-0-0-156650",
    effectiveFrom: NEW_YORK_CITY_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: NEW_YORK_CITY_LAST_VERIFIED,
    notes:
      "The amounts modelled here were printed by Local Law 77 of 2023, which the codifier dates to 11 June 2023 — that is the effectiveFrom above. Local Law 128 of 2024 took effect 21 December 2025 and left every amount alone; it added row 15.1, which sends electrical work to department rules, and rewrote the payment sections. The table itself says its rates \"shall be subject to increases as provided by department rules\", and no such increase was found in any DOB rule this pass could read.",
  },
  {
    key: NEW_YORK_CITY_KEYS.electricalSchedule,
    jurisdictionKey: NEW_YORK_CITY_KEYS.jurisdiction,
    sourceKey: NEW_YORK_CITY_RCNY_SOURCE_KEY,
    title: "1 RCNY §101-03 — Fees Payable to the Department of Buildings",
    officialUrl: "https://codelibrary.amlegal.com/codes/newyorkcity/latest/NYCrules/0-0-0-2246",
    effectiveFrom: NEW_YORK_CITY_ELECTRICAL_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: NEW_YORK_CITY_LAST_VERIFIED,
    notes:
      "The rule §28-112.2.2 points at for electrical fees, and the rule that carries the records management fee. Its promulgation details show these figures only in the original text effective 1 July 2008 — no later amendment restates them — while the section around them was last amended effective 13 August 2026 for the sidewalk-shed provisions of Local Laws 48 and 51 of 2025. A DOB-219 rulemaking, with a comment date of 23 September 2026, would amend the electrical rows to track Local Law 128 of 2024: combining the $40 with the parts fees for the minimum payment, deleting the duplicate-copy fee, and deleting the $5,000 cap. Nothing in it is charged here.",
  },
];

function attach(permitTypeKey: string, rules: SeedFeeRule["rule"][], scheduleKey: string): SeedFeeRule[] {
  return rules.map((rule) => ({
    jurisdictionKey: NEW_YORK_CITY_KEYS.jurisdiction,
    permitTypeKey,
    scheduleKey,
    rule,
  }));
}

const feeRules: SeedFeeRule[] = [
  ...attach("building", NEW_YORK_CITY_BUILDING_BASE_RULES, NEW_YORK_CITY_KEYS.feeSchedule),
  ...attach("plumbing", NEW_YORK_CITY_PLUMBING_BASE_RULES, NEW_YORK_CITY_KEYS.feeSchedule),
  ...attach("electrical", NEW_YORK_CITY_ELECTRICAL_BASE_RULES, NEW_YORK_CITY_KEYS.electricalSchedule),
];

const requirements: SeedRequirement[] = [
  {
    jurisdictionKey: NEW_YORK_CITY_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "An estimate of the cost of construction, and the Department sets the valuation",
    description:
      "§28-112.3: an estimate of the cost of construction is provided with the application, and it \"shall include the total value of work proposed, including but not limited to materials, equipment and labor, with reasonable allowances for profit and overhead\". If DOB thinks the cost is understated the application is denied unless detailed estimates are shown; a final statement of the total actual cost is filed before sign-off, and \"the initial, amended and final building permit valuation shall be set by the department\". The cost of the work is the basis every alteration fee on this site is computed from.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: NEW_YORK_CITY_ADMIN_CODE_SOURCE_KEY,
    lastVerifiedAt: NEW_YORK_CITY_LAST_VERIFIED,
  },
  {
    jurisdictionKey: NEW_YORK_CITY_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "The Alteration Type is chosen at filing and it sets the base fee",
    description:
      "Table 28-112.2 publishes one minimum filing fee per Alteration Type on every alteration row — $170 and $130 in a one-, two- or three-family dwelling; $280, $225 and $195 in other buildings under seven stories; $290 and $225/$195 at seven stories or 100,000 square feet — and the type also decides how much review the filing needs. The type is a fact on this site (`alteration_type`), because two applications with the same cost and different types are two different fees.",
    isMandatory: true,
    sortOrder: 20,
    sourceKey: NEW_YORK_CITY_ADMIN_CODE_SOURCE_KEY,
    lastVerifiedAt: NEW_YORK_CITY_LAST_VERIFIED,
  },
  {
    jurisdictionKey: NEW_YORK_CITY_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "Half the fee with the application, or all of it",
    description:
      "§28-112.2.1, as added by Local Law 128 of 2024: where the work results in a new certificate of occupancy or a change to one, 50 percent of the total fee — but not less than $130, or the whole fee if the fee is under $130 — accompanies the first application for construction documents, and the remainder is paid before the work permit issues. Where the work does not change the certificate of occupancy, 100 percent of the fee is paid at filing. This is when the money moves, not an extra charge, so no rule is written for it.",
    isMandatory: true,
    sortOrder: 30,
    sourceKey: NEW_YORK_CITY_LOCAL_LAW_128_SOURCE_KEY,
    lastVerifiedAt: NEW_YORK_CITY_LAST_VERIFIED,
  },
  {
    jurisdictionKey: NEW_YORK_CITY_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "A records management fee rides on every alteration and new-building application",
    description:
      "1 RCNY §101-03 charges a \"Records management fee for applications for new buildings and alterations and associated documentation\" of $45 for one-, two- or three-family dwellings and $165 for all other types of buildings, with an exception for applications exempt under §28-112.1 — work for religious, charitable and educational owners using the property exclusively for that purpose, and emergency work for a City agency. It is charged once for the application rather than per trade, and this site adds it to the building and plumbing totals.",
    isMandatory: true,
    sortOrder: 40,
    sourceKey: NEW_YORK_CITY_RCNY_SOURCE_KEY,
    lastVerifiedAt: NEW_YORK_CITY_LAST_VERIFIED,
  },
  {
    jurisdictionKey: NEW_YORK_CITY_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "license",
    title: "A licensed electrician files the permit in DOB NOW: Build",
    description:
      "Electrical filings are made in DOB NOW: Build by the licensed electrician, who is the only person who can create the after-hours variance and the only one who can be superseded. DOB's FAQ states that an electrical permit is valid for a maximum of 12 months and that \"A renewal fee of $130 will be required for every renewal\", that the expiration date follows the earlier of the insurance and licence expiry dates, and that a permit expired for more than 12 months after issuance is abandoned.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: NEW_YORK_CITY_ELECTRICAL_FAQ_SOURCE_KEY,
    lastVerifiedAt: NEW_YORK_CITY_LAST_VERIFIED,
  },
  {
    jurisdictionKey: NEW_YORK_CITY_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "other",
    title: "Half the electrical fee at filing, the rest before any inspection",
    description:
      "§28-112.2.2, as added by Local Law 128 of 2024: fees for electrical work requiring a permit are set by department rules, and \"50 percent of the total fee for the work permit, but not less than $130, or the total fee for the work permit where such fee is less than $130, shall be paid at the time of filing, and the remainder of the total fee shall be paid before any department inspection\". The two halves always sum to the fee.",
    isMandatory: true,
    sortOrder: 20,
    sourceKey: NEW_YORK_CITY_LOCAL_LAW_128_SOURCE_KEY,
    lastVerifiedAt: NEW_YORK_CITY_LAST_VERIFIED,
  },
  {
    jurisdictionKey: NEW_YORK_CITY_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "other",
    title: "Everything counted is a unit, and the first ten are free",
    description:
      "1 RCNY §101-03 assigns one unit to each outlet, each fixture, each horsepower or fraction of a motor or generator, each kilowatt or fraction of a heater, each horsepower of an air conditioner and each kilovolt-ampere or fraction of a transformer installed, altered or repaired — then charges $0 for the first ten units and $.25 over ten. A service switch, a set of service entrance cables, a panel, a sign, an elevator and boiler controls are priced on their own rows by rating instead, and are named on the page.",
    isMandatory: true,
    sortOrder: 30,
    sourceKey: NEW_YORK_CITY_RCNY_SOURCE_KEY,
    lastVerifiedAt: NEW_YORK_CITY_LAST_VERIFIED,
  },
  {
    jurisdictionKey: NEW_YORK_CITY_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "document",
    title: "Electrical Plan Review where the scope touches the service",
    description:
      "DOB's FAQ: Electrical Plan Review is required where the filing answers yes to whether the scope installs service equipment, transformers, UPS systems, generators, other power sources or energy-storage systems — approved plans and an approval letter are uploaded, and the EPR number is entered. EPR filings are not submitted in DOB NOW. This is a review requirement rather than a fee, and nothing on this site charges for it.",
    isMandatory: true,
    sortOrder: 40,
    sourceKey: NEW_YORK_CITY_ELECTRICAL_FAQ_SOURCE_KEY,
    lastVerifiedAt: NEW_YORK_CITY_LAST_VERIFIED,
  },
  {
    jurisdictionKey: NEW_YORK_CITY_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    requirementType: "license",
    title: "Minor plumbing work is a Limited Alteration Application filed by a Licensed Master Plumber",
    description:
      "DOB: the LAA \"is used for plumbing work, fire suppression piping replacement and repairs, and oil burner installations that do not include construction work\", and is filed in DOB NOW: Build by Licensed Master Plumbers, Licensed Master Fire Suppression Piping Contractors and Licensed Oil Burner Installers. Category 1 work is limited to $35,000 per building including appliance and labour in any 12-month period and to five or fewer new fixtures or connections; Category 2 has no cost limit but a closed list of work. One category and one work type may be filed per application.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: NEW_YORK_CITY_LAA_SOURCE_KEY,
    lastVerifiedAt: NEW_YORK_CITY_LAST_VERIFIED,
  },
  {
    jurisdictionKey: NEW_YORK_CITY_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    requirementType: "other",
    title: "A plumbing permit has no schedule of its own — it is charged as an alteration",
    description:
      "§28-112.2 charges permits for \"new buildings, structures, mechanical, and plumbing, and electrical systems or alterations requiring a permit\" per Table 28-112.2, and the table's alteration rows are where a plumbing job's fee comes from. An older edition of the same table named plumbing inside those rows explicitly; the current text routes it through the Limited Alteration Application bullet. DOB's published LAA charts reprint rows 11 and 12 as a price list, which is how the reading is checked rather than assumed.",
    isMandatory: true,
    sortOrder: 20,
    sourceKey: NEW_YORK_CITY_ADMIN_CODE_SOURCE_KEY,
    lastVerifiedAt: NEW_YORK_CITY_LAST_VERIFIED,
  },
  {
    jurisdictionKey: NEW_YORK_CITY_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    requirementType: "other",
    title: "One application carries every work type, and the filing fee is charged once",
    description:
      "The table's renewal column reads \"$130 per work type\" — the filing fee belongs to the application and the renewal to each trade on it. A job that files building and plumbing together pays one filing fee, not two, so a reader who adds this site's building total to its plumbing total is pricing two separate applications. §28-112.5 adds that paying DOB's fee \"shall not relieve the applicant or holder of the permit from the payment of other fees that are prescribed by law\" — FDNY's permits among them.",
    isMandatory: true,
    sortOrder: 30,
    sourceKey: NEW_YORK_CITY_ADMIN_CODE_SOURCE_KEY,
    lastVerifiedAt: NEW_YORK_CITY_LAST_VERIFIED,
  },
];

const profile: SeedProfile = {
  jurisdictionKey: NEW_YORK_CITY_KEYS.jurisdiction,
  headline: "What construction permits cost in New York City",
  summary:
    "New York City prices an alteration on **the cost of the work**: a minimum filing fee that covers the first $5,000 of cost in a one-, two- or three-family dwelling or the first $3,000 anywhere else, then $2.60, $10.30 or $17.75 for each further $1,000 or fraction of it. The base is the Alteration Type you file — $170 for an ALT1 in a house, $130 for an ALT2, ALT3 or LAA — and the rate is the building's size. A new building that keeps nothing is priced on floor area instead, at $0.06, $0.26 or $0.45 a square foot. Electrical work is priced by the Department's own rule: $40 to file, $0 for the first ten units and $0.25 for each one after.",
  localContext:
    "One agency, one table, one portal. The Department of Buildings issues the building, electrical and plumbing permits this site prices, takes every filing through DOB NOW: Build, and prints its phone number and its five borough offices on its own contact page. What it does not print is a fee schedule of its own: the building and plumbing figures are a table inside the Administrative Code — Table 28-112.2, thirty-nine rows long — and the electrical figures are a rule the code hands them to, 1 RCNY §101-03, because §28-112.2.2 says electrical fees are \"in accordance with department rules\". Two instruments, two dates: the table's amounts were printed by Local Law 77 of 2023 and have not moved since, and the rule's electrical amounts have not moved since the rule itself took effect on 1 July 2008.\n\nThe table's most expensive word is not the rate, it is the *row*. An alteration is priced by where the building sits in three pairs of brackets — under seven stories and 100,000 square feet or not, an R-2 building where half the units are publicly affordable or not — and by which of four Alteration Types is filed, and a reader who has only a cost has not finished the question. The same $100,000 renovation is $377.00 in a row house filed as an ALT2 and $2,011.75 in a ten-storey building filed as an ALT1, because the second pair of brackets charges $17.75 per $1,000 where the first charges $2.60. Every number on this site therefore carries the row it came from.\n\nTwo things a New Yorker expects to find are not here, and their absence is a fact about the City rather than a gap in the research. There is no plan review percentage, no technology fee and no state or county surcharge anywhere in New York City's text — the searches for those phrases come back empty, which is the opposite of every other jurisdiction in this dataset. And plumbing has no fee schedule at all: a plumbing job is filed as an alteration, or — where a Licensed Master Plumber files minor work without plans — as a Limited Alteration Application, whose fee chart DOB publishes as a price list that reproduces the table's own rows line for line. That chart is the check this jurisdiction was able to make and no other one could: the Department and the code agreeing, in public, on arithmetic.",
  valuationBasis:
    "The basis is **the cost of the work**, as the City defines it rather than as a reader might: §28-112.3 requires an estimate of the cost of construction with the application, and says the cost \"shall include the total value of work proposed, including but not limited to materials, equipment and labor, with reasonable allowances for profit and overhead\". DOB can reject the estimate as understated, and it — not the applicant — sets \"the initial, amended and final building permit valuation\". A final statement of the actual cost is filed before sign-off.\n\nThat figure is then rounded by the table itself, in whole thousands: the fee is the minimum filing fee for the first $5,000 or $3,000 of cost, plus the row's rate for each further $1,000 **or fraction of one**, so a $5,001 job and a $6,000 job pay the same increment above the base. The two exceptions are both area-based: a new building that keeps no existing element is priced on total floor area with a per-structure minimum, and the table's earthwork, demolition and sign rows measure frontage, stories or surface instead. Nothing here derives a cost from a square-foot rate or a floor area from a valuation, because the City publishes neither conversion.",
  notIncluded:
    "These figures are New York City's own building, electrical and plumbing permit fees. They are not a project cost, and they exclude:\n\n- **Everything another agency charges.** FDNY permits sprinklers, standpipes and alarm systems; DEP, DOT and the Finance Department each charge for their own approvals. §28-112.5 says in terms that paying DOB's fee \"shall not relieve the applicant or holder of the permit from the payment of other fees that are prescribed by law\".\n- **The other 30-odd rows of Table 28-112.2**: renewal at $130 per work type, amendments at the greater of $130 or the added scope, reinstatement, the accessory garage at $130, foundation and earthwork at $10 for each 2,000 square feet (minimum $130), demolition at frontage x stories x $2.60 (minimum $260), curb cuts at $3 or $6 a linear foot, the sign rows, sidewalk sheds, scaffolds, construction fences and temporary structures. Published, transcribed in the research record, not attached to a page.\n- **Parts fees beyond the ones priced here.** 1 RCNY §101-03 also charges service entrance cables and feeder conductors at $15 to $75 a set, panels at $15 to $75, signs at $40 in shop and $65 to $115 on site, elevators at $125 plus $83 for each further ten floors, and $12 for wiring or rewiring boiler controls — each priced per item by a rating no input on this site collects.\n- **The $5,000 cap on electrical parts fees.** The adopted rule still prints that the total additional fee \"shall not exceed five thousand dollars\"; DOB's own pending rulemaking says Local Law 128 of 2024 repealed the cap and proposes to delete the wording. It is an aggregate cap on a permit, which a per-rule maximum cannot express, so this model applies none — a job whose parts fees pass $5,000 needs DOB's own calculation.\n- **Electrical renewals, Post Approval Amendments and after-hours variances** — $130, $130, and $130 to $650 plus $80 a day — which are fees for later acts rather than for the permit being priced.\n- **Plan review, energy code compliance review, licence and examination fees, special inspection and facade inspection schedules**, and every other line in 1 RCNY §101-03 that is not the electrical rows or the records management fee.\n- **The exemptions in §28-112.1** — a religious, charitable or educational owner using the property exclusively for that purpose, and emergency work for a City agency — which are not modelled as an input, so a permitted fee for such a project would be shown here even though the City waives it.",
  seoTitle: "New York City construction permit fees",
  seoDescription:
    "How New York City prices construction permits — Table 28-112.2's cost ladder of $2.60, $10.30 and $17.75 per $1,000 by Alteration Type, $0.06 to $0.45 a square foot for new buildings, and the electrical rule's $40 plus $0.25 a unit.",
  publishStatus: "published",
  noindex: false,
  lastReviewedAt: NEW_YORK_CITY_LAST_VERIFIED,
};

const permitPages: SeedPermitPage[] = [
  {
    jurisdictionKey: NEW_YORK_CITY_KEYS.jurisdiction,
    permitTypeKey: "building",
    slug: "building-permit-cost",
    title: "New York City building permit cost",
    intro:
      "A New York City building permit is priced on **the cost of the work**: a minimum filing fee that covers the first $5,000 of cost in a one-, two- or three-family dwelling — or the first $3,000 in any other building — plus $2.60, $10.30 or $17.75 for each further $1,000 or fraction of it. The base is the Alteration Type the applicant files, from $130.00 to $290.00, and the rate is set by the building's size. A new building that keeps no existing element is priced on floor area instead, at $0.06 to $0.45 a square foot.",
    localSummary:
      "Three facts decide the fee — the size of the building, which Alteration Type is filed, and whether the work is an alteration at all — and a cost on its own does not finish the question. A $40,000 alteration in a one-, two- or three-family dwelling filed as an ALT2 is $130.00 for the first $5,000 and thirty-five whole steps of $2.60 above it: $221.00, plus the $45.00 records management fee, for $266.00 in all. The same job filed as an ALT1 starts from $170.00 and comes to $306.00 with that fee.\n\nThe row is where the money moves. That $40,000 job in a building of seven stories or more filed as an ALT2 sits on row 15 — $225.00 plus thirty-seven steps of $10.30, or $606.10 — and its records fee is $165.00 there; filed as an ALT1 in the same building it passes to row 14, where each step costs $17.75. A new building that keeps existing elements is priced on cost by rows 2, 5 and 10; one that keeps nothing pays $0.06, $0.26 or $0.45 a square foot, floored at $130.00, $280.00 or $290.00 per structure.\n\nTwo charges readers expect elsewhere are absent here, and their absence is documented rather than assumed: no plan review percentage, no technology fee, and no state or county surcharge appears anywhere in the City's permit fee text.",
    notIncluded:
      "This is the building permit fee under Table 28-112.2 plus the records management fee. It excludes:\n\n- **The other rows of Table 28-112.2.** Renewal at $130 per work type, amendments at the greater of $130 or the added scope, reinstatement, the accessory garage at $130, foundation and earthwork at $10 for each 2,000 square feet (minimum $130), demolition at frontage x stories x $2.60 (minimum $260), curb cuts at $3 or $6 a linear foot, the sign rows, sidewalk sheds, scaffolds, construction fences and temporary structures.\n- **Plan review, energy code review and inspection fees.** The table charges none of them, and no DOB rule or local law read for this pass adds a percentage to the permit.\n- **The exemptions in §28-112.1.** The $45.00 and $165.00 records fees themselves are included above, but the City waives the permit fee for a religious, charitable or educational owner using the property exclusively for that purpose, and for emergency work for a City agency — neither is modelled as an input, so a permitted fee for such a project would be shown here even though the City does not collect it.\n- **Every other agency's fees.** FDNY permits sprinklers, standpipes and alarm systems; DEP, DOT and Finance charge for their own approvals. §28-112.5 says in terms that paying DOB's fee \"shall not relieve the applicant or holder of the permit from the payment of other fees that are prescribed by law\".\n- **Electrical and plumbing work on the same filing.** One application carries every work type and pays one filing fee, so this page prices a building application alone; the trade pages price their own permits separately.",
    workedExample: {
      scenario:
        "A $40,000 interior alteration in a one-, two- or three-family dwelling, filed as an ALT2, with no other work types on the application.",
      inputs: {
        valuationCents: 4_000_000,
        custom: { alteration: true, building_category: "one_two_three_family", alteration_type: "ALT2" },
      },
      notes:
        "The row is Table 28-112.2's row 11: the $130.00 minimum filing fee covers the first $5,000 of cost, and the $35,000 above it is charged in whole $1,000 steps at $2.60 — thirty-five of them, or $91.00. The alteration fee is therefore $221.00.\n\nThe records management fee is the second line: $45.00 for a one-, two- or three-family dwelling under 1 RCNY §101-03, charged once for the application rather than per trade. The total is $266.00.\n\nWhat moves it: filing the same job as an ALT1 raises the base to $170.00 and the total to $306.00; filing it in a building of seven stories or more moves it to row 15 — $225.00 plus thirty-seven steps of $10.30 — where the fee is $606.10 and the records fee $165.00. A job of $5,000 or less in this house is the $130.00 base plus the records fee, because the steps only start above the threshold.",
    },
    faqs: [
      {
        question: "How much is a building permit in New York City?",
        answer:
          "For an alteration, the cost of the work decides it: a minimum filing fee covers the first $5,000 in a one-, two- or three-family dwelling or the first $3,000 in any other building, and $2.60, $10.30 or $17.75 is charged for each further $1,000 or fraction of it. The minimum runs from $130.00 to $290.00 by Alteration Type and building size. A new building that keeps no existing element is priced on floor area at $0.06, $0.26 or $0.45 a square foot instead, with a per-structure minimum.",
        sourceId: NEW_YORK_CITY_ADMIN_CODE_SOURCE_KEY,
      },
      {
        question: "What decides which rate applies — the Alteration Type or the building?",
        answer:
          "Both. The building's size picks the row: under seven stories and 100,000 square feet or not, and whether it is an R-2 building where at least half the units are publicly affordable. The Alteration Type picks the minimum filing fee inside that row — $170.00 and $130.00 in a house, $280.00, $225.00 and $195.00 in other buildings under seven stories, and $290.00 with $225.00 or $195.00 at seven stories or more.",
        sourceId: NEW_YORK_CITY_ADMIN_CODE_SOURCE_KEY,
      },
      {
        question: "Is there a plan review fee or a technology fee?",
        answer:
          "Not in New York City's permit fee text. Table 28-112.2 charges no plan review percentage, no technology fee and no state or county surcharge, and searches for those phrases across the City's code and rules come back empty. What the table does charge — the minimum filing fee, the per-$1,000 steps and the records management fee — is what this page totals.",
        sourceId: NEW_YORK_CITY_ADMIN_CODE_SOURCE_KEY,
      },
      {
        question: "What is the records management fee?",
        answer:
          "1 RCNY §101-03 authorises $45 for one-, two- or three-family dwellings and $165 for all other types of buildings for applications for new buildings and alterations and associated documentation. It is charged once for the application rather than per trade, and this site applies it to the building and plumbing pages — an LAA is an alteration application — but not to the electrical page.",
        sourceId: NEW_YORK_CITY_RCNY_SOURCE_KEY,
      },
      {
        question: "When is the fee paid?",
        answer:
          "§28-112.2.1, as added by Local Law 128 of 2024: where the work results in a new certificate of occupancy or a change to one, 50 percent of the total fee — but not less than $130, or the whole fee if the fee is under $130 — accompanies the first application for construction documents, and the remainder is paid before the work permit issues. Where the work does not change the certificate of occupancy, 100 percent of the fee is paid at filing.",
        sourceId: NEW_YORK_CITY_LOCAL_LAW_128_SOURCE_KEY,
      },
      {
        question: "What does a new building cost if it keeps part of the old one?",
        answer:
          "Rows 2, 5 and 10 price a new building that retains existing elements on the cost of the work again, because any portion of an existing building kept in place — party walls, foundations, footings, piles and slabs on grade — makes it a cost-priced filing: $130.00 above $5,000 at $2.60 in a house, and $280.00 or $290.00 bases elsewhere. A new building that keeps nothing is the only one priced on floor area.",
        sourceId: NEW_YORK_CITY_ADMIN_CODE_SOURCE_KEY,
      },
    ],
    seoTitle: "New York City building permit cost: $2.60 to $17.75 per $1,000",
    seoDescription:
      "New York City building permit fees — Table 28-112.2's minimum filing fees of $130 to $290, $2.60 to $17.75 per $1,000 above the first $5,000 or $3,000 of cost, $0.06 to $0.45 a square foot for new buildings, plus the records management fee.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: NEW_YORK_CITY_LAST_VERIFIED,
  },
  {
    jurisdictionKey: NEW_YORK_CITY_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    slug: "electrical-permit-cost",
    title: "New York City electrical permit cost",
    intro:
      "A New York City electrical permit is priced by **the Department's own rule rather than the fee table**: $40.00 for the initial application, $0 for the first ten units and $0.25 for each outlet, fixture, horsepower, kilowatt or kilovolt-ampere after them. A service switch is priced on its own band — $8.00 at 100 amperes or less, $30.00 to 200, up to $375.00 above 1,200 — and minor work that needs no construction documents is a flat $15.00 instead.",
    localSummary:
      "§28-112.2.2 sends electrical fees to department rules, and the rule is 1 RCNY §101-03 — figures that have not moved since the rule took effect on 1 July 2008. A filing with 30 outlets and a 200-ampere service switch is $40.00 to apply, $5.00 for the twenty units above the free ten, and $30.00 for the switch: $75.00 in all.\n\nWhat counts as a unit is the rule's own list: each outlet, each fixture, each horsepower or fraction of a motor or generator, each kilowatt or fraction of a heater, each horsepower of air conditioning and each kilovolt-ampere or fraction of a transformer installed, altered or repaired. The first ten cost nothing, and every one after them costs a quarter — the allowance is ten units on the permit, not a block per room or per circuit.\n\nPayment follows §28-112.2.2: 50 percent of the total fee — but not less than $130, or the whole fee where it is under $130 — is paid at filing and the rest before any department inspection. DOB's FAQ adds that the permit is valid for a maximum of 12 months and every renewal costs $130. Parts fees for service entrance cables, panels, signs, elevators and boiler controls sit in the same rule and are named here rather than charged, because each is priced per item by a rating this calculator does not collect.",
    notIncluded:
      "This is 1 RCNY §101-03's electrical permit fee — the application, the unit row and one service switch band. It excludes:\n\n- **Parts fees by rating.** Service entrance cables and feeder conductors at $15 to $75 a set, panels at $15 to $75, signs at $40 in shop and $65 to $115 on site, elevators at $125 plus $83 for each further ten floors, and $12 for wiring or rewiring boiler controls — each priced per item by a rating no input on this site collects.\n- **The $5,000 aggregate cap.** The adopted rule still prints that the total additional fee \"shall not exceed five thousand dollars\", and DOB's pending DOB-219 rulemaking says Local Law 128 of 2024 repealed the cap and proposes to delete the wording. It caps a permit in aggregate, which a per-rule maximum cannot express, so this model applies none.\n- **Renewals, Post Approval Amendments and after-hours variances** — $130, $130, and $130 to $650 plus $80 a day — which are fees for later acts rather than for the permit being priced.\n- **Electrical Plan Review**, required where the filing answers yes to installing service equipment, transformers, UPS systems, generators, other power sources or energy-storage systems: a review requirement, not a fee this rule charges.\n- **The other agency's permits.** FDNY permits alarm and suppression systems, and §28-112.5 says paying DOB's fee \"shall not relieve the applicant or holder of the permit from the payment of other fees that are prescribed by law\".",
    workedExample: {
      scenario:
        "A service upgrade with a 200-ampere service switch and 30 outlets and fixtures on the filing — an initial application, not minor work.",
      inputs: { custom: { electrical_units: 30, service_switch_amperage: 200 } },
      notes:
        "The initial application is $40.00. The unit row counts 30 outlets and fixtures against a free allowance of ten, so twenty units are charged at $0.25 — $5.00. The service switch is on the 101–200 ampere band at $30.00, and only one band can apply to one switch. The total is $75.00.\n\nTwo changes move it: at 100 amperes or less the band is $8.00 and the permit is $53.00, and a thirty-first outlet would add another quarter to $75.25 — above the allowance every unit counts, one at a time. Filing the same scope as minor work replaces all of it: $15.00 flat, with no $40.00 application and no unit row.\n\nNone of this includes the parts fees the same rule publishes — service entrance cables, panels, signs, elevators and boiler controls — each priced per item by a rating this calculator does not ask for.",
    },
    faqs: [
      {
        question: "How much is an electrical permit in New York City?",
        answer:
          "$40.00 for the initial application, then $0 for the first ten units and $0.25 for each unit after them — each outlet, fixture, horsepower of motor or air conditioning, kilowatt of heater and kilovolt-ampere of transformer. A service switch is charged by its ampere band, from $8.00 to $375.00, and minor work that needs no construction documents is a flat $15.00 instead of the application.",
        sourceId: NEW_YORK_CITY_RCNY_SOURCE_KEY,
      },
      {
        question: "Why don't electrical permits pay the fee table's rates?",
        answer:
          "Because §28-112.2.2 says electrical fees are set \"in accordance with department rules\" — Local Law 128 of 2024 added row 15.1 to Table 28-112.2 for exactly this, and the rule it points to is 1 RCNY §101-03. The table's $2.60-to-$17.75 ladder therefore prices building and plumbing alterations, while the electrical page prices the rule's own figures.",
        sourceId: NEW_YORK_CITY_LOCAL_LAW_128_SOURCE_KEY,
      },
      {
        question: "Are the first ten units really free?",
        answer:
          "Yes: 1 RCNY §101-03 charges \"1 – 10 units, $0; Over 10 units, $.25\". An eleven-unit filing pays $2.75 on the unit row, the tenth unit costs nothing, and the counting starts above the allowance rather than restarting per room or per circuit — every unit past ten on the permit is $0.25.",
        sourceId: NEW_YORK_CITY_RCNY_SOURCE_KEY,
      },
      {
        question: "What does a service switch cost?",
        answer:
          "$8.00 from 0 to 100 amperes, $30.00 for 101–200, $105.00 for 201–600, $225.00 for 601–1,200 and $375.00 above 1,200 — charged for each service switch installed, altered or repaired, so a job with two switches pays the band twice. Only one band can apply to one switch.",
        sourceId: NEW_YORK_CITY_RCNY_SOURCE_KEY,
      },
      {
        question: "When is the electrical fee paid?",
        answer:
          "§28-112.2.2, as added by Local Law 128 of 2024: 50 percent of the total fee for the work permit — but not less than $130, or the total fee where such fee is less than $130 — is paid at the time of filing, and the remainder before any department inspection. The two halves always sum to the fee.",
        sourceId: NEW_YORK_CITY_LOCAL_LAW_128_SOURCE_KEY,
      },
      {
        question: "How long does an electrical permit last, and what does a renewal cost?",
        answer:
          "DOB's Electrical Filings FAQ: an electrical permit is valid for a maximum of 12 months, its expiration follows the earlier of the insurance and licence expiry dates, and \"A renewal fee of $130 will be required for every renewal\". A permit expired for more than 12 months after issuance is abandoned rather than renewed.",
        sourceId: NEW_YORK_CITY_ELECTRICAL_FAQ_SOURCE_KEY,
      },
    ],
    seoTitle: "New York City electrical permit cost: $40 plus $0.25 a unit",
    seoDescription:
      "New York City electrical permit fees under 1 RCNY §101-03 — $40.00 initial application, $0 for the first ten units and $0.25 each after, service switch bands of $8.00 to $375.00, and the $15.00 minor work permit.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: NEW_YORK_CITY_LAST_VERIFIED,
  },
  {
    jurisdictionKey: NEW_YORK_CITY_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    slug: "plumbing-permit-cost",
    title: "New York City plumbing permit cost",
    intro:
      "A New York City plumbing permit has **no fee schedule of its own**: §28-112.2 charges it per Table 28-112.2, exactly as a building alteration, so the fee comes from the cost of the work — $130.00 for the first $5,000 in a one-, two- or three-family dwelling with $2.60 per $1,000 above, $195.00 for the first $3,000 in other buildings with $10.30 above. Minor work filed by a Licensed Master Plumber without plans is a Limited Alteration Application, and DOB's fee chart for it is this same arithmetic printed as a price list.",
    localSummary:
      "The Limited Alteration Application is the common case, and its limits are DOB's own: Category 1 work is capped at $35,000 per building including appliance and labour in any 12-month period and at five or fewer new fixtures or connections, while Category 2 has no cost limit but a closed list of work — and one category and one work type may be filed per application. A $7,500 LAA in a house is $130.00 plus three whole steps of $2.60 — $137.80 — and the $45.00 records fee, for $182.80.\n\nDOB's published charts are the check on this reading: they reprint rows 11 and 12 as $130.00 to $5,000 then steps of exactly $2.60 for a one-, two- or three-family dwelling, and $195.00 to $3,000 then steps of exactly $10.30 for every other building — line for line the arithmetic this calculator computes. A plumbing job past the LAA's limits is filed as a full alteration on the same rows, with the Alteration Type's own base.\n\nOne application carries every work type, and the filing fee belongs to the application: the table's renewal column reads $130 per work type, so a reader adding this page's plumbing total to its building total is pricing two applications rather than one.",
    notIncluded:
      "This is DOB's plumbing permit fee under Table 28-112.2, plus the records management fee. It excludes:\n\n- **A plumbing-only schedule, because there is none.** §28-112.2 charges plumbing permits per the table, so this page names the row rather than inventing a per-fixture price — New York City's text publishes no fixture rate at all.\n- **The other rows of the table**: renewal at $130 per work type, amendments at the greater of $130 or the added scope, reinstatement, and the demolition, earthwork, curb cut, sign, sidewalk shed, scaffold, fence and temporary structure rows.\n- **Fire suppression and alarm work**, which FDNY permits under its own schedule. §28-112.5 says paying DOB's fee \"shall not relieve the applicant or holder of the permit from the payment of other fees that are prescribed by law\".\n- **The LAA's work-type limits, not its fees.** The $35,000 Category 1 cap and the five-fixture limit decide which application fits, not what it costs; a job past them is a full alteration and is priced on the same rows here.\n- **Water and sewer charges from DEP**, which are utility charges rather than permit fees, and **the exemptions in §28-112.1**, which are not modelled as an input.\n- **The chart's penalty column.** DOB's chart prints a second figure beside every fee — $780.00 at the foot of the 1, 2, 3 Family sheet and $6,000.00 at the foot of the others — labelled as penalties for Category 1 & 2 filing. What makes a filing a penalty rather than a fee is not stated on the chart, and no penalty is modelled here.",
    workedExample: {
      scenario:
        "A Limited Alteration Application for $7,500 of plumbing work in a one-, two- or three-family dwelling, filed by a Licensed Master Plumber.",
      inputs: {
        valuationCents: 750_000,
        custom: { alteration: true, building_category: "one_two_three_family", alteration_type: "LAA" },
      },
      notes:
        "The LAA sits on row 11 of Table 28-112.2: $130.00 for the first $5,000 of cost, and the $2,500 above it rounds up to three whole $1,000 steps at $2.60 — $7.80. The alteration fee is $137.80.\n\nThe records management fee follows at $45.00 for a one-, two- or three-family dwelling, charged once for the application rather than per work type, and the total is $182.80.\n\nIn any other building the same job sits on row 12 — $195.00 for the first $3,000, then four and a half thousand rounds up to five steps of $10.30, or $51.50 — for a $246.50 fee and a $165.00 records fee. DOB's own LAA chart prints this row's arithmetic as a price list, which is how the reading was checked against the Department rather than against the code alone.",
    },
    faqs: [
      {
        question: "How much is a plumbing permit in New York City?",
        answer:
          "There is no plumbing rate of its own: §28-112.2 charges a plumbing permit per Table 28-112.2, so an alteration pays its minimum filing fee — $130.00 in a one-, two- or three-family dwelling, $195.00 in most other buildings — plus $2.60 or $10.30 for each $1,000 of cost above the first $5,000 or $3,000, counting any part of a thousand as a whole step.",
        sourceId: NEW_YORK_CITY_ADMIN_CODE_SOURCE_KEY,
      },
      {
        question: "What is a Limited Alteration Application?",
        answer:
          "DOB's own definition: the LAA \"is used for plumbing work, fire suppression piping replacement and repairs, and oil burner installations that do not include construction work\", filed in DOB NOW: Build by Licensed Master Plumbers, Licensed Master Fire Suppression Piping Contractors and Licensed Oil Burner Installers. One category and one work type may be filed per application.",
        sourceId: NEW_YORK_CITY_LAA_SOURCE_KEY,
      },
      {
        question: "What are the LAA's cost limits?",
        answer:
          "Category 1 work is limited to $35,000 per building including appliance and labour in any 12-month period and to five or fewer new fixtures or connections. Category 2 has no cost limit but a closed list of work. A job that fits neither is filed as a full alteration instead — on the same rows of the table, with the Alteration Type's own base.",
        sourceId: NEW_YORK_CITY_LAA_SOURCE_KEY,
      },
      {
        question: "Does the Department publish the LAA's fees?",
        answer:
          "Yes — as rows 11 and 12 of the fee table, printed as a price list: $130.00 to $5,000 then steps of exactly $2.60 in a one-, two- or three-family dwelling, and $195.00 to $3,000 then steps of exactly $10.30 in any other building. The charts DOB links are stamped June 2018 and their arithmetic still matches the table in force.",
        sourceId: NEW_YORK_CITY_LAA_CHARTS_SOURCE_KEY,
      },
      {
        question: "Does filing building and plumbing together double the filing fee?",
        answer:
          "No. The table charges the filing fee for the application and $130 per work type for renewals, so one application carrying two work types pays one filing fee — a reader adding this page's total to the building page's total is pricing two separate applications. When the work changes the certificate of occupancy, §28-112.2.1's 50-percent payment schedule applies to the combined fee.",
        sourceId: NEW_YORK_CITY_ADMIN_CODE_SOURCE_KEY,
      },
      {
        question: "Are there fees outside DOB's?",
        answer:
          "Yes. §28-112.5 says paying DOB's fee \"shall not relieve the applicant or holder of the permit from the payment of other fees that are prescribed by law\" — FDNY permits sprinklers, standpipes and alarm systems, and DEP charges its own water and sewer items. None of those are in the total this page computes.",
        sourceId: NEW_YORK_CITY_ADMIN_CODE_SOURCE_KEY,
      },
    ],
    seoTitle: "New York City plumbing permit cost: priced as an alteration",
    seoDescription:
      "New York City plumbing permit fees — no separate schedule: Table 28-112.2's $130.00 or $195.00 minimum with $2.60 or $10.30 per $1,000, the DOB Limited Alteration Application chart, and the $45.00 or $165.00 records fee.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: NEW_YORK_CITY_LAST_VERIFIED,
  },
];

const verifications: SeedVerification[] = [
  {
    entityType: "source",
    entityKey: NEW_YORK_CITY_ADMIN_CODE_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: NEW_YORK_CITY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NEW_YORK_CITY_ADMIN_CODE_SOURCE_KEY,
    notes:
      "Read 2026-09-25 from the City's codifier: the consolidated text of §28-112.2 and all 39 rows of Table 28-112.2, with the amendment history the codifier prints at its foot — L.L. 2016/056, 2021/126, 2023/077 and 2024/128 with their effect dates. Every building and plumbing figure on this site comes from the alteration and new-building rows read here, and §28-112.3 was read in the same pass for the cost-of-the-work definition.",
  },
  {
    entityType: "source",
    entityKey: NEW_YORK_CITY_LOCAL_LAW_77_SOURCE_KEY,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: NEW_YORK_CITY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NEW_YORK_CITY_LOCAL_LAW_77_SOURCE_KEY,
    notes:
      "Read 2026-09-25 as the City Clerk's 184-page PDF. Section 14 reprints Table 28-112.2 in full, and the table's rows were extracted twice — with pdftotext's -layout and -raw modes — because a page break splits a row's Alteration Types from their minimum fees and only one of the two extractions pairs them correctly. This is the instrument that printed the $2.60, $10.30 and $17.75 rates.",
  },
  {
    entityType: "source",
    entityKey: NEW_YORK_CITY_LOCAL_LAW_128_SOURCE_KEY,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: NEW_YORK_CITY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NEW_YORK_CITY_LOCAL_LAW_128_SOURCE_KEY,
    notes:
      "Read 2026-09-25 as the City Clerk's PDF: passed 21 November 2024, effective one year later on 21 December 2025 per its §29. It added §§28-112.2.1 and 28-112.2.2 (the payment schedule and the route of electrical fees to department rules), added row 15.1, and moved no amount in the table — the two payment pages' FAQ answers and every timing statement on this site come from here.",
  },
  {
    entityType: "source",
    entityKey: NEW_YORK_CITY_RCNY_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: NEW_YORK_CITY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NEW_YORK_CITY_RCNY_SOURCE_KEY,
    notes:
      "Read 2026-09-25 from the codifier's consolidated rule text, cross-checked against the promulgation details PDF nyc.gov publishes for the section: the $40 application, the $0/$0.25 unit row, the five service switch bands, the $15 minor work permit and the $45/$165 records fee appear only in the original rule effective 1 July 2008, and no later amendment restates them.",
  },
  {
    entityType: "source",
    entityKey: NEW_YORK_CITY_LAA_CHARTS_SOURCE_KEY,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: NEW_YORK_CITY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NEW_YORK_CITY_LAA_CHARTS_SOURCE_KEY,
    notes:
      "Read 2026-09-25: the DOB page and both PDFs it links, stamped JUNE 2018. The charts are a price list for rows 11 and 12 and reproduce the table's arithmetic line by line — $130.00 to $5,000 then $2.60 a step in a house, $195.00 to $3,000 then $10.30 elsewhere. Four lines of each chart are asserted against the model's own output in the tests.",
  },
  {
    entityType: "source",
    entityKey: NEW_YORK_CITY_LAA_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: NEW_YORK_CITY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NEW_YORK_CITY_LAA_SOURCE_KEY,
    notes:
      "Read 2026-09-25 with its sibling page on limited plumbing alterations: the LAA's definition, who files it and in which portal, one category and one work type per application, Category 1's $35,000-per-building-12-months and five-fixture limits, and Category 2's closed work list with no cost cap.",
  },
  {
    entityType: "source",
    entityKey: NEW_YORK_CITY_ELECTRICAL_FAQ_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: NEW_YORK_CITY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NEW_YORK_CITY_ELECTRICAL_FAQ_SOURCE_KEY,
    notes:
      "Read 2026-09-25 for the operational facts no rule states: 12-month permit validity, the $130 renewal, the $130 Post Approval Amendment, the After-Hours Variance range, and the Electrical Plan Review triggers. It is also where the payment split of §28-112.2.2 is seen in practice — payments made directly in DOB NOW: Build.",
  },
  {
    entityType: "fee_schedule",
    entityKey: NEW_YORK_CITY_KEYS.feeSchedule,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: NEW_YORK_CITY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NEW_YORK_CITY_ADMIN_CODE_SOURCE_KEY,
    notes:
      "Table 28-112.2 dated to 11 June 2023 — the codifier's effect date for L.L. 2023/077, which printed the current amounts. L.L. 2024/128 took effect 21 December 2025 and left every amount alone; no DOB rule increasing the rates as the table permits was found on this pass.",
  },
  {
    entityType: "fee_schedule",
    entityKey: NEW_YORK_CITY_KEYS.electricalSchedule,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: NEW_YORK_CITY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NEW_YORK_CITY_RCNY_SOURCE_KEY,
    notes:
      "1 RCNY §101-03 dated to 1 July 2008 — the original rule's effective date, where the electrical and records figures first appear. The section's later amendments (sidewalk sheds, effective 13 August 2026) did not touch them, and the pending DOB-219 rulemaking with its 23 September 2026 comment date would amend the electrical rows without having done so yet.",
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-ALTER-1TO3",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: NEW_YORK_CITY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NEW_YORK_CITY_ADMIN_CODE_SOURCE_KEY,
    notes:
      "Row 11 of Table 28-112.2: \"Minimum filing fee for the first $5,000, or fraction thereof, of the cost of alteration; plus $2.60 for each $1,000, or fraction thereof, of cost of alterations in excess of $5,000\", with the $130.00 minimum filing fee shared by ALT2, ALT3 and the LAA. Checked against DOB's LAA chart, which prints $130.00 to $5,000 and then steps of exactly $2.60.",
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-ALTER-OTHER",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: NEW_YORK_CITY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NEW_YORK_CITY_ADMIN_CODE_SOURCE_KEY,
    notes:
      "Row 12 of Table 28-112.2: first $3,000 at the $195.00 minimum filing fee of ALT3 and the LAA, then $10.30 per $1,000 or fraction. Checked against DOB's LAA chart for all other buildings, which prints $195.00 to $3,000 and then steps of exactly $10.30.",
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-ALTER-LARGE-ALT1",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: NEW_YORK_CITY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NEW_YORK_CITY_LOCAL_LAW_77_SOURCE_KEY,
    notes:
      "Row 14 of Table 28-112.2, the table's most expensive row: $290.00 for the first $3,000 and $17.75 for each further $1,000 or fraction, for an ALT1 in a building of seven stories or 100,000 square feet that is not an affordable R-2. Transcribed from L.L. 2023/077's own printing of the table, where the page break between the Alteration Types and the minimum fees was resolved by extracting the PDF twice.",
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-NB-ONE-TWO-THREE-FAMILY-PER-SQFT",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: NEW_YORK_CITY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NEW_YORK_CITY_ADMIN_CODE_SOURCE_KEY,
    notes:
      "Row 1 of Table 28-112.2: \"$0.06 for each square foot, or fraction thereof, of the total floor area of the new building, but not less than $130 for each structure\", gated to a new building retaining no existing element — \"building elements\" including party walls, foundations, footings, piles and slabs on grade. The per-structure minimum is the rule's own minimumCents, so a 1,000 sq ft house is charged $130.00 rather than $60.00.",
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-RECORDS-MGMT-1TO3",
    permitTypeKey: "building",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: NEW_YORK_CITY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NEW_YORK_CITY_RCNY_SOURCE_KEY,
    notes:
      "1 RCNY §101-03: \"Records management fee for applications for new buildings and alterations and associated documentation — $45 for one-, two- or three-family dwellings, $165 for all other types of buildings\". Charged once per application rather than per trade; the rule says the Department is authorized to charge it, and both pages say where the figure comes from.",
  },
  {
    entityType: "fee_rule",
    entityKey: "PLUMB-ALTER-1TO3",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: NEW_YORK_CITY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NEW_YORK_CITY_ADMIN_CODE_SOURCE_KEY,
    notes:
      "The same row 11 arithmetic, attached to the plumbing permit type with its own id because §28-112.2 charges \"permits for … plumbing … systems or alterations\" per this table — the schedule publishes no plumbing-only row. DOB's LAA chart is the independent confirmation: its price list is this row's formula for the Limited Alteration Application.",
  },
  {
    entityType: "fee_rule",
    entityKey: "ELEC-INITIAL-APPLICATION",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: NEW_YORK_CITY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NEW_YORK_CITY_RCNY_SOURCE_KEY,
    notes:
      "1 RCNY §101-03: \"Electrical permit initial application (excluding minor work): $40\". Charged once, gated off a minor work permit — which is its own $15.00 permit — and cross-referenced by §28-112.2.2 as the rule electrical fees follow.",
  },
  {
    entityType: "fee_rule",
    entityKey: "ELEC-UNITS",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: NEW_YORK_CITY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NEW_YORK_CITY_RCNY_SOURCE_KEY,
    notes:
      "1 RCNY §101-03: \"1 – 10 units, $0; Over 10 units, $.25\", with the unit defined as each outlet, fixture, horsepower of motor or generator, kilowatt of heater, horsepower of air conditioner and kilovolt-ampere of transformer. Modelled as thresholdUnits 10 with no base, which reproduces the published figure at every boundary: 10 units are $0.00, 11 pay $0.25, 30 pay $5.00.",
  },
  {
    entityType: "fee_rule",
    entityKey: "ELEC-SERVICE-SWITCH-200",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: NEW_YORK_CITY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NEW_YORK_CITY_RCNY_SOURCE_KEY,
    notes:
      "1 RCNY §101-03's second band: \"101-200 Amperes $30.00\" of \"For each service switch installed, altered or repaired\". The five bands are gated by one amperage fact so exactly one can apply, and each prices one switch — a job with two switches pays the band twice, which the page states rather than the model charging silently.",
  },
  {
    entityType: "permit_page",
    entityKey: "building-permit-cost",
    permitTypeKey: "building",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: NEW_YORK_CITY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NEW_YORK_CITY_ADMIN_CODE_SOURCE_KEY,
    notes:
      "The alteration ladder, the four Alteration Type bases, the new-building area rows and the records fee, with the worked example as arithmetic on the table: $40,000 ALT2 in a house is $130.00 plus 35 steps of $2.60 ($221.00) plus $45.00 records — $266.00 — and every figure in the prose is asserted against the engine's output in the tests.",
  },
  {
    entityType: "permit_page",
    entityKey: "electrical-permit-cost",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: NEW_YORK_CITY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NEW_YORK_CITY_RCNY_SOURCE_KEY,
    notes:
      "The $40 application, the ten free units, the five service switch bands and the $15 minor work permit, with §28-112.2.2's payment split and DOB's FAQ facts on validity and renewal. The worked example — 30 outlets and a 200-ampere switch — computes to $75.00 from the rule alone.",
  },
  {
    entityType: "permit_page",
    entityKey: "plumbing-permit-cost",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: NEW_YORK_CITY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NEW_YORK_CITY_LAA_CHARTS_SOURCE_KEY,
    notes:
      "The claim that plumbing has no schedule of its own, with the LAA's limits from DOB's own pages and DOB's charts as the price list for rows 11 and 12. The worked example — a $7,500 LAA in a house — computes to $137.80 plus the $45.00 records fee, and the chart's printed lines are asserted against the engine in the tests.",
  },
  {
    entityType: "jurisdiction_profile",
    entityKey: NEW_YORK_CITY_KEYS.jurisdiction,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: NEW_YORK_CITY_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NEW_YORK_CITY_ADMIN_CODE_SOURCE_KEY,
    notes:
      "Hub content built from Table 28-112.2, 1 RCNY §101-03, L.L. 2023/077, L.L. 2024/128 and DOB's LAA and electrical pages. The profile states the three readings the model depends on — the base as the Alteration Type's minimum, plumbing charged through the alteration rows, and the absence of plan review, technology and surcharge lines — and names the unmodelled rows of the table and the rule.",
  },
];

export const newYorkCitySeed: JurisdictionSeed = {
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
export const NEW_YORK_CITY_PUBLISHED_PERMIT_PAGES = newYorkCitySeed.permitPages.filter(
  (page) => page.publishStatus === "published" && !page.noindex,
);
