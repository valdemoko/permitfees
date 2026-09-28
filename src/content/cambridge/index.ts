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
  CAMBRIDGE_BUILDING_BASE_RULES,
  CAMBRIDGE_BUILDING_FEES_SOURCE_KEY,
  CAMBRIDGE_ELECTRICAL_BASE_RULES,
  CAMBRIDGE_ELECTRICAL_FEES_SOURCE_KEY,
  CAMBRIDGE_FEE_EFFECTIVE_FROM,
  CAMBRIDGE_FEE_CHANGES_2024_SOURCE_KEY,
  CAMBRIDGE_PLUMBING_BASE_RULES,
  CAMBRIDGE_PLUMBING_FEES_SOURCE_KEY,
} from "./fee-rules";

export * from "./fee-rules";

/**
 * The complete Cambridge, Massachusetts seed payload.
 *
 * Every figure traces to research/massachusetts/cambridge.md, which traces to the three
 * Inspectional Services fee pages — building, electrical/wiring and plumbing — and to the
 * DPW announcement that does not date them. Nothing is estimated.
 *
 * Three pages, all published. Cambridge is the jurisdiction whose schedule is the *opposite
 * rounding* of Boston's: its building rows print "or fraction thereof" four times and round
 * up to the whole thousand, where Boston's sheet never prints the phrase and prorates, and
 * its plumbing is a five-fixture block where Boston's is a straight per-fixture rate — both
 * contrasts are asserted in the two cities' tests.
 *
 * The county row records **Middlesex County**. ISD issues permits citywide, so the county
 * is a locator rather than an authority: 831 Massachusetts Avenue, the address printed in
 * the footer of every fee page, sits in it.
 */

const RESEARCHER = "Permit Fee Intelligence research pass 14 (Massachusetts)";

export const CAMBRIDGE_LAST_VERIFIED = "2026-09-25";

export const CAMBRIDGE_KEYS = {
  state: "ma",
  county: "middlesex-county",
  jurisdiction: "cambridge",
  feeSchedule: "cambridge-isd-fee-pages",
} as const;

const state: SeedState = {
  code: "MA",
  slug: "massachusetts",
  name: "Massachusetts",
  fipsCode: "25",
};

const county: SeedCounty = {
  key: CAMBRIDGE_KEYS.county,
  slug: "middlesex-county",
  name: "Middlesex County",
  fipsCode: "25017",
};

const jurisdiction: SeedJurisdiction = {
  key: CAMBRIDGE_KEYS.jurisdiction,
  stateKey: CAMBRIDGE_KEYS.state,
  countyKey: CAMBRIDGE_KEYS.county,
  type: "city",
  slug: "cambridge",
  name: "Cambridge",
  officialName: "City of Cambridge",
  websiteUrl: "https://www.cambridgema.gov/",
  permitPortalUrl: "https://www.cambridgema.gov/inspection",
  timezone: "America/New_York",
  isActive: true,
};

const departments: SeedDepartment[] = [
  {
    key: "cambridge-inspectional-services-department",
    jurisdictionKey: CAMBRIDGE_KEYS.jurisdiction,
    kind: "building",
    name: "Cambridge Inspectional Services Department (ISD)",
    phone: "(617) 349-6100",
    email: null,
    hours: "Monday 7:00-8:30 a.m. and 3:30-5:30 p.m.; Tuesday through Thursday 7:00-8:30 a.m. and 3:00-3:30 p.m.; Friday 7:00-8:30 a.m. and 11:00 a.m. - 12:00 p.m.",
    addressLine: "831 Massachusetts Avenue, Cambridge, MA 02139",
    url: "https://www.cambridgema.gov/inspection",
    notes:
      "ISD issues every permit this site prices for Cambridge — building, electrical and plumbing — and its three fee pages are the schedule behind all three of them. The phone number, address and counter hours here are printed in the footer of every one of the three fee pages, which is how the pages were matched to the department. The DPW announcement of January 2024 fee changes is a Public Works instrument, not an ISD one, and names no ISD row.",
  },
];

const sources: SeedSource[] = [
  {
    key: CAMBRIDGE_BUILDING_FEES_SOURCE_KEY,
    jurisdictionKey: CAMBRIDGE_KEYS.jurisdiction,
    title: 'ISD — "Building Fees" (the cost ladder, its Exemption line, Sheet Metal, Moving buildings)',
    url: "https://www.cambridgema.gov/inspection/buildingelectricplumbingpermits/buildingfees",
    sourceType: "municipal_website",
    issuingAuthority: "City of Cambridge — Inspectional Services Department",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: CAMBRIDGE_FEE_EFFECTIVE_FROM,
    retrievedAt: CAMBRIDGE_LAST_VERIFIED,
    lastVerifiedAt: CAMBRIDGE_LAST_VERIFIED,
    notes:
      'Read 2026-09-25 as a two-column HTML table: the cost ladder ($20.00 per $1,000.00 or fraction thereof of construction cost, $50.00 minimum fee) printed identically under four row names — "All new construction Repairs & Alterations", "Amendments to plans", "Demolition of buildings & structures" and "Preliminary permits for foundation" — with the "Exemption" line at $15.00 for three residential dwelling units or less beneath each. Moving buildings is $15.00 per $1,000 rounded up with the same $50.00 minimum; Sheet Metal is $50 plus $25 per each 100 linear feet, the one row priced in linear feet without a block phrase; signs are priced on a percentage of a sign cost, which no basis here reads. The plan-review cell reads verbatim "$100 included in building permit fee$50.00" — one cell, two amounts, no legend — so no plan-review rule is written.',
  },
  {
    key: CAMBRIDGE_ELECTRICAL_FEES_SOURCE_KEY,
    jurisdictionKey: CAMBRIDGE_KEYS.jurisdiction,
    title: 'ISD — "Electrical/Wiring Fees" (the itemised price list)',
    url: "https://www.cambridgema.gov/inspection/buildingelectricplumbingpermits/electricalwiringfees",
    sourceType: "municipal_website",
    issuingAuthority: "City of Cambridge — Inspectional Services Department",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: CAMBRIDGE_LAST_VERIFIED,
    lastVerifiedAt: CAMBRIDGE_LAST_VERIFIED,
    notes:
      'Read 2026-09-25: the schedule prices line items rather than applications — "New Service — Per 100 AMPS — $10.00" and the identical "Service per 100 amps" row, receptacles priced five ways by ampere rating ($1/$4/$5/$8/$15 at 15/20/30/50/70 amps) under "Receptacles/air conditioners, check amps", "Meter, each — $5.00", "Generator — $100.00" and "Alarm system (security & fire) — Residential $25.00 / Commercial $75.00". No branch language anywhere on the page: a service and four receptacles pay both rows, which is why the rules here stack where Boston\'s branch.',
  },
  {
    key: CAMBRIDGE_PLUMBING_FEES_SOURCE_KEY,
    jurisdictionKey: CAMBRIDGE_KEYS.jurisdiction,
    title: 'ISD — "Plumbing Fees" (the fixture block and the device rows)',
    url: "https://www.cambridgema.gov/inspection/buildingelectricplumbingpermits/plumbingfees",
    sourceType: "municipal_website",
    issuingAuthority: "City of Cambridge — Inspectional Services Department",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: CAMBRIDGE_LAST_VERIFIED,
    lastVerifiedAt: CAMBRIDGE_LAST_VERIFIED,
    notes:
      'Read 2026-09-25: the fixture list — "Bathtub, Dishwasher, Drinking Fountain, Floor/Area Drain, Food Disposal, Icemaker, Kitchen Sink, Lavatory, Roof Drain, Mop Sink, Shower Stall, Toilet, Urinal, Washing Machine" — marked "Include in Fixture Count", priced "$50.00 for 5 fixtures, $5.00 for each additional fixture"; water heaters at $50.00 (electric/gas/indirect) and $100.00 (tankless); the page\'s own header lines "Re-Inspection Fee - $50.00" and the triple-fee ordinance warning. Boston prices the same trade straight per fixture, with no allowance — both readings are asserted in their cities\' tests.',
  },
  {
    key: CAMBRIDGE_FEE_CHANGES_2024_SOURCE_KEY,
    jurisdictionKey: CAMBRIDGE_KEYS.jurisdiction,
    title: 'DPW — "Changes to Construction Permit Fees Effective January 1, 2024"',
    url: "https://www.cambridgema.gov/Departments/publicworks/news/2023/12/changestoconstructionpermitfeeseffectivejanuary1,2024",
    sourceType: "municipal_website",
    issuingAuthority: "City of Cambridge — Department of Public Works",
    authorityKind: "city",
    isPrimary: false,
    documentDate: "2023-12-11",
    effectiveFrom: null,
    retrievedAt: CAMBRIDGE_LAST_VERIFIED,
    lastVerifiedAt: CAMBRIDGE_LAST_VERIFIED,
    notes:
      'Read 2026-09-25 for what the only dated instrument found does and does not date: it lists Sidewalk Obstruction Permits (monthly fee) and the Utility Inspectors\' Overtime Fee, and says "certain construction permit fees have been revised" after "a review of construction-related permit fees that have not been increased in a decade", with "a complete revised fee schedule … available … on January 1, 2024". It names no ISD row, so it cannot date the three fee pages — which is why those carry the read date as their effectiveFrom, and why this source is held so the possibility stays visible.',
  },
];

/** Empty on purpose: the permit types Cambridge uses already exist as shared rows. */
const permitTypes: JurisdictionSeed["permitTypes"] = [];
const projectTypes: JurisdictionSeed["projectTypes"] = [];

const jurisdictionPermitTypes: SeedJurisdictionPermitType[] = [
  {
    jurisdictionKey: CAMBRIDGE_KEYS.jurisdiction,
    permitTypeKey: "building",
    isAvailable: true,
    localName: "Building permit — cost ladder with Exemption rate, Moving buildings, Sheet Metal",
    officialUrl:
      "https://www.cambridgema.gov/inspection/buildingelectricplumbingpermits/buildingfees",
    notes:
      "The Building Fees page prices a permit at $20.00 per $1,000 or fraction of construction cost, $50.00 minimum, and prints the identical pair under four row names; the Exemption line is $15.00 for three residential dwelling units or less; Moving buildings is $15.00 per $1,000 rounded up whatever the building; Sheet Metal is $50 plus $25 per each 100 linear feet. The phrase \"or fraction thereof\" is printed on every cost row, so a partial thousand buys a whole step — the opposite of Boston's prorating sheet three miles east — and the $50.00 minimum is the rule's own floor, binding below $2,500 of cost.",
  },
  {
    jurisdictionKey: CAMBRIDGE_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    isAvailable: true,
    localName: "Electrical permit — itemised price list, charged line by line",
    officialUrl:
      "https://www.cambridgema.gov/inspection/buildingelectricplumbingpermits/electricalwiringfees",
    notes:
      "The Electrical/Wiring Fees page is a price list, not a branch: a new or existing service at $10.00 per 100 amperes, receptacles at five prices by ampere rating ($1/$4/$5/$8/$15 at 15/20/30/50/70), a meter at $5.00 each, a generator at $100.00 and an alarm at $25.00 residential / $75.00 commercial. The rows stack — a service and four receptacles pay both — where Boston's sheet branches and only one row answers; the receptacle rating is asked for by custom fact, with the schedule's first row (15 amps) as the default.",
  },
  {
    jurisdictionKey: CAMBRIDGE_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    isAvailable: true,
    localName: "Plumbing permit — $50.00 for five fixtures, $5.00 for each additional fixture",
    officialUrl:
      "https://www.cambridgema.gov/inspection/buildingelectricplumbingpermits/plumbingfees",
    notes:
      "The Plumbing Fees page defines the count and its price in one cell: the fourteen-fixture list marked \"Include in Fixture Count\", priced $50.00 for 5 fixtures and $5.00 for each additional — a $50.00 base with a five-fixture allowance, not five fixtures at $10.00. Water heaters are $50.00 (electric, gas or indirect) and $100.00 tankless; the page's own header carries the $50.00 re-inspection fee and the triple-fee ordinance warning for work started without a permit.",
  },
];

const feeSchedules: SeedFeeSchedule[] = [
  {
    key: CAMBRIDGE_KEYS.feeSchedule,
    jurisdictionKey: CAMBRIDGE_KEYS.jurisdiction,
    sourceKey: CAMBRIDGE_BUILDING_FEES_SOURCE_KEY,
    title: "ISD fee pages — Building / Electrical / Plumbing (undated, read 2026-09-25)",
    officialUrl:
      "https://www.cambridgema.gov/inspection/buildingelectricplumbingpermits/buildingfees",
    effectiveFrom: CAMBRIDGE_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: CAMBRIDGE_LAST_VERIFIED,
    notes:
      "One schedule covers all three pages, because three pages of one ISD section are one schedule: each is headed by the same three ordinance warnings, and each is undated. The only dated instrument found — DPW's January 1, 2024 fee-change announcement — names no ISD row, so the effectiveFrom records the read date (2026-09-25) rather than an enactment the pages never printed. The DPW announcement is held as a source with its own date so the possibility that these rows moved in 2024 stays visible.",
  },
];

function attach(permitTypeKey: string, rules: FeeRuleRecord[]): SeedFeeRule[] {
  return rules.map((rule) => ({
    jurisdictionKey: CAMBRIDGE_KEYS.jurisdiction,
    permitTypeKey,
    scheduleKey: CAMBRIDGE_KEYS.feeSchedule,
    rule,
  }));
}

const feeRules: SeedFeeRule[] = [
  ...attach("building", CAMBRIDGE_BUILDING_BASE_RULES),
  ...attach("electrical", CAMBRIDGE_ELECTRICAL_BASE_RULES),
  ...attach("plumbing", CAMBRIDGE_PLUMBING_BASE_RULES),
];

const requirements: SeedRequirement[] = [
  {
    jurisdictionKey: CAMBRIDGE_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "Work may not start before the permit issues — the fee is tripled if it does",
    description:
      'All three fee pages carry the same ordinance header, Section 15.04.010: where work "for which a permit is required by this code is started or proceeded with, prior to obtaining such permit, the fee specified shall be tripled, but payment of such triple fee shall not relieve any person from fully complying with the requirements of this code". The triple fee is a multiplier on a fee that has not been computed, so it is stated here rather than charged as a rule.',
    isMandatory: true,
    sortOrder: 10,
    sourceKey: CAMBRIDGE_BUILDING_FEES_SOURCE_KEY,
    lastVerifiedAt: CAMBRIDGE_LAST_VERIFIED,
  },
  {
    jurisdictionKey: CAMBRIDGE_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "other",
    title: "Employers of permanent electricians may take a period permit (Ordinance 15.08.020)",
    description:
      'City Ordinance 15.08.020 & 15.12.020, "Co-Work Completed By Others": a person or firm — other than electrical or plumbing contractors or public service agencies — who employs permanent electricians or plumbers "may obtain a permit covering the work done by such permanent electrician/plumber for a period of time to be determined in each case. The fee … will be charged in the same manner as if separate permits had been given for each job." A period permit is priced as separate permits would be, so it changes no arithmetic here.',
    isMandatory: false,
    sortOrder: 10,
    sourceKey: CAMBRIDGE_ELECTRICAL_FEES_SOURCE_KEY,
    lastVerifiedAt: CAMBRIDGE_LAST_VERIFIED,
  },
  {
    jurisdictionKey: CAMBRIDGE_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    requirementType: "inspection",
    title: "A final inspection is called for within five days of completion",
    description:
      'The plumbing page\'s own header lines: "Performing work without a permit: Triple the permit fee", "Failure to call for final inspection within 5 days of completion — $50.00" and "Re-Inspection Fee — $50.00". The failure-to-call line is a consequence of not calling, so it is named rather than charged a second time; the re-inspection is charged as an inspection component when one actually happens.',
    isMandatory: true,
    sortOrder: 10,
    sourceKey: CAMBRIDGE_PLUMBING_FEES_SOURCE_KEY,
    lastVerifiedAt: CAMBRIDGE_LAST_VERIFIED,
  },
];

const profile: SeedProfile = {
  jurisdictionKey: CAMBRIDGE_KEYS.jurisdiction,
  headline: "What construction permits cost in Cambridge",
  summary:
    "Cambridge prices a building permit on **the construction cost**, rounded up: $20.00 for each $1,000 or fraction of it, with a $50.00 minimum, or $15.00 at the Exemption rate for a building of three residential dwelling units or less. Plumbing is $50.00 for up to five fixtures and $5.00 for each one after them. Electrical is a price list rather than a ladder — $10.00 per 100 amperes on a service, $1.00 to $15.00 a receptacle by its rating, $5.00 a meter — and its rows stack, one charge per line item on the application.",
  localContext:
    "One department, three pages, no PDF. The Inspectional Services Department publishes its schedule as three HTML tables — Building Fees, Electrical/Wiring Fees, Plumbing Fees — each headed by the same three ordinance warnings about work started before a permit (the fee \"shall be tripled\") and about permits taken by employers of permanent electricians and plumbers, and each footed with the department's address, phone number and counter hours. There is no effective date anywhere on the pages, and the only dated instrument found — the DPW announcement of fee changes effective January 1, 2024 — lists sidewalk obstruction permits and utility inspectors' overtime, not these rows, so the schedules are dated to the read date and the announcement is kept visible as a source.\n\nWhat distinguishes Cambridge from its neighbours is the rounding, printed on the page. Every cost row reads \"$20.00 per $1,000.00 **or fraction thereof** of construction cost\" — the phrase Boston's sheet never prints — and Moving buildings says \"rounded up to the next thousand\" in its own words, so a partial thousand buys a whole step: $18,750 is nineteen steps of $20.00, not eighteen and three quarters. The Exemption line beneath the rate is not a waiver: it charges $15.00 where a building has three residential dwelling units or less, and the standard $20.00 rule is written as the negation of that condition so a reader who does not state a unit count pays the standard rate rather than nothing.\n\nThe trades are a price list, and the contrast with Boston is structural, not just in amounts. Boston's electrical sheet branches — by amperage, by device count, by cost — and exactly one branch answers; Cambridge's electrical page is line items that stack, a service and four receptacles paying both rows. Boston's plumbing is $5.00 a fixture from the first; Cambridge's is $50.00 for up to five fixtures and $5.00 after them. Both contrasts are asserted in the two cities' tests so neither can drift into the other.\n\nWhat is absent is itself a fact. No plan review percentage, no technology fee and no state surcharge appears on any page: the schedule's one plan-review cell is a garbled export — \"$100 included in building permit fee$50.00\", one cell, two amounts, no legend — and is quoted verbatim rather than charged, and Massachusetts adds no levy of its own to a local permit.",
  valuationBasis:
    "The basis for building work is **the construction cost**, and the rounding is part of the rate: \"$20.00 per $1,000.00 or fraction thereof of construction cost, $50.00 minimum fee\", printed four times over. The phrase means the basis is rounded up to the next whole thousand before $20.00 is applied — $18,750 is nineteen steps of $20.00, or $380.00 — and the minimum is the rule's own floor, which binds below $2,500 of cost: a $2,000 job is two steps of $20.00, $40.00, charged at $50.00.\n\nThe Exemption line is selected by the building, not the job: $15.00 per $1,000 or fraction for \"three residential dwelling units or less\", asked for as a custom fact about the building, with the standard rate charging wherever that fact is absent or above three. Moving buildings takes the $15.00 rate without asking about units, because that is what its row prints. Sheet Metal is the one row priced on a run rather than on cost — $25.00 per 100 linear feet is 25 cents a foot, charged on the exact run because that row, alone on the page, prints neither \"or fraction thereof\" nor \"rounded up\".\n\nElectrical and plumbing are priced from counts, not from cost: the service's amperes, the receptacles' rating, the meters, the fixtures. Nothing here derives a cost from square footage: the schedule publishes no conversion, and the pages ask for a dollar figure or a count instead.",
  notIncluded:
    "These figures are Cambridge's own building, electrical and plumbing permit fees, as printed on ISD's three fee pages. They are not a project cost, and they exclude:\n\n- **The triple fee.** Work started before the permit issues triples the fee — a multiplier on a fee that has not been computed, printed as ordinance 15.04.010 on all three pages and quoted in the requirements.\n- **Certificates of Occupancy and Certificates of Inspections** — seven rows priced on units, rooms, occupants and square feet ($100 for the first residential unit plus $50.00 each additional; $100 plus $50.00 per 1,000 sq. ft. commercial; assembly groups at $50.00 for 1-50 occupants plus $2.00 each over 50; R-1 at $50.00 plus $5.00 a room over 10; R-2/R-4/R-5 at $100.00 plus $5.00 a unit), read and transcribed in the research record, not attached to a page.\n- **Signs** — $10 per $100 of sign cost rounded up to the next hundred, $20.00 minimum: the rate is a percentage of a *sign cost*, which no basis here reads.\n- **Building licenses** ($50.00 initial for two years, $50.00 renewal, $60.00 late, $10.00 a year after), **annual sign inspections** ($10.00) and **publicly subsidized dwelling inspections** ($100.00) — licensing and inspection tariffs rather than permit fees.\n- **Electrical rows priced by a count this site does not collect**: motors by horsepower, heating units by kilowatt, air conditioners by ton, ductless units, solar arrays at $100.00 each (the page prices solar service at the same $10.00 per 100 amperes named in the service rule), maintenance permits quarterly and yearly, data/low-voltage/audio-visual work by occupancy, bounced cheques at $35.00 and shutdowns at $100.00 plus inspection.\n- **Plumbing rows for individual devices** — back water valve, hose bib, irrigation meter, cross-connection devices, dedicated systems, water piping per floor, sanitary waste and vent per floor, sprinkler heads and standpipe valves — read, priced on the page's own table, and named rather than charged: each would need a fact of its own, and the fixture block is the row a plumbing job actually starts from.\n- **Plan review, technology and state surcharges — none of them exist.** The schedule's one plan-review cell is quoted verbatim (\"$100 included in building permit fee$50.00\") rather than charged, and Massachusetts adds no levy of its own to a Cambridge permit.",
  seoTitle: "Cambridge construction permit fees",
  seoDescription:
    "How Cambridge prices construction permits — $20.00 per $1,000 or fraction of construction cost rounded up, $15.00 for three units or less, $50.00 for five plumbing fixtures, and an electrical price list by the item.",
  publishStatus: "published",
  noindex: false,
  lastReviewedAt: CAMBRIDGE_LAST_VERIFIED,
};

const permitPages: SeedPermitPage[] = [
  {
    jurisdictionKey: CAMBRIDGE_KEYS.jurisdiction,
    permitTypeKey: "building",
    slug: "building-permit-cost",
    title: "Cambridge building permit cost",
    intro:
      "A Cambridge building permit is priced on **the construction cost, rounded up**: $20.00 for each $1,000.00 **or fraction thereof** of construction cost, with a $50.00 minimum fee — the phrase is printed on every cost row of the Building Fees page, so a partial thousand buys a whole step. A building of three residential dwelling units or less pays the Exemption rate instead: $15.00 per $1,000 or fraction, same minimum.",
    localSummary:
      "The page prints the identical pair of numbers under four row names — \"All new construction Repairs & Alterations\", \"Amendments to plans\", \"Demolition of buildings & structures\" and \"Preliminary permits for foundation\" — so one arithmetic answers all four. A $18,750 job is nineteen steps of $20.00, or $380.00; the same job in a two-unit house is nineteen steps of $15.00, or $285.00; a $2,000 job is two steps of $20.00, $40.00, charged at the $50.00 minimum.\n\nThe rounding is where Cambridge differs from Boston, three miles east: Boston's sheet never prints \"or fraction thereof\" and prorates a partial thousand — $47,550 pays $475.50 of rate there — while Cambridge buys the whole step. Both readings are asserted against the engine in their cities' tests, so neither can drift into the other.\n\nTwo further rows are charged on this page. Sheet Metal is $50.00 plus $25.00 per 100 linear feet — 25 cents a foot, charged on the exact run, because that row alone prints neither rounding phrase. Moving buildings is $15.00 per $1,000 rounded up whatever the building. And one expected charge is documented as absent: the schedule's one plan-review cell reads \"$100 included in building permit fee$50.00\" — one cell, two amounts, no legend — so nothing is charged for plan review and the cell is quoted verbatim.",
    notIncluded:
      "This is ISD's Building Fees page, priced on the construction cost. It excludes:\n\n- **The triple fee.** Work started before the permit issues triples the fee — ordinance 15.04.010, printed on the page itself, a multiplier rather than a charge.\n- **Certificates of Occupancy and Certificates of Inspections** — seven rows priced on units, rooms, occupants and square feet, read and transcribed in the research record, not attached to this page.\n- **Signs** — $10 per $100 of sign cost rounded up, $20.00 minimum: a percentage of a sign cost, which no basis here reads.\n- **Building licenses** ($50.00 initial, $50.00 renewal, $60.00 late, $10.00 a year after), **annual sign inspections** ($10.00) and **publicly subsidized dwelling inspections** ($100.00).\n- **Plan review** — the schedule's one plan-review cell is quoted verbatim rather than charged; no percentage, technology fee or state surcharge exists anywhere on the page.\n- **Other departments' fees** — DPW's sidewalk obstruction permits and the utility inspectors' overtime fee from the January 2024 announcement, and any zoning board charges.",
    workedExample: {
      scenario:
        "A $18,750 alteration to a two-family house — repairs and alterations under the schedule's standard row, the building inside the Exemption line at three units or less.",
      inputs: {
        valuationCents: 1_875_000,
        custom: { residential_units: 2 },
      },
      notes:
        "The Exemption rate is selected by the building: $15.00 for each $1,000 or fraction of the $18,750 construction cost. The fraction is printed on the page, so the chargeable basis is rounded up to $19,000 — nineteen steps — and the permit is 19 × $15.00, or $285.00.\n\nThe same job in a four-unit building pays the standard rate, 19 × $20.00, or $380.00 — $95.00 more, because the Exemption line is a rate for small residential buildings, not a waiver. A reader who does not state a unit count also pays the standard rate: the standard rule is written as the negation of the Exemption condition, so the absence of the fact charges rather than exempts.\n\nThe minimum never moves these numbers — it binds below $2,500 of cost, where one step of $20.00 or $15.00 would fall under $50.00. Starting work before the permit issues triples whatever the permit comes to.",
    },
    faqs: [
      {
        question: "How much is a building permit in Cambridge?",
        answer:
          "$20.00 for each $1,000.00 or fraction thereof of construction cost, with a $50.00 minimum fee — printed identically under four row names on the Building Fees page. A building of three residential dwelling units or less pays $15.00 per $1,000 or fraction instead, same minimum. There is no plan review charge and no state surcharge to add.",
        sourceId: CAMBRIDGE_BUILDING_FEES_SOURCE_KEY,
      },
      {
        question: "Does Cambridge round the cost up to the next $1,000?",
        answer:
          "Yes — the page prints \"or fraction thereof\" on every cost row, so a partial thousand buys a whole step: $18,750 is nineteen steps, not eighteen and three quarters. Boston, three miles east, prints no such phrase and prorates a partial thousand; the two cities round differently and both readings are asserted in their own tests.",
        sourceId: CAMBRIDGE_BUILDING_FEES_SOURCE_KEY,
      },
      {
        question: "What is the Exemption rate?",
        answer:
          "The schedule's own second line, printed beneath each cost row: $15.00 per $1,000.00 or fraction thereof for buildings of three residential dwelling units or less, with the same $50.00 minimum. It is a rate, not a waiver — the row still charges, 25% less than the standard $20.00. The rate is selected by the building, and a reader who does not state a unit count pays the standard rate.",
        sourceId: CAMBRIDGE_BUILDING_FEES_SOURCE_KEY,
      },
      {
        question: "Is there a plan review fee in Cambridge?",
        answer:
          "Not one that can be charged. The schedule's plan-review cell reads verbatim \"$100 included in building permit fee$50.00\" — one table cell, two amounts, no separator and no legend — so no plan-review rule exists and the cell is quoted rather than interpreted. No percentage, technology fee or state surcharge appears anywhere on the page.",
        sourceId: CAMBRIDGE_BUILDING_FEES_SOURCE_KEY,
      },
      {
        question: "What does moving a building cost?",
        answer:
          "The Building Fees page prints it twice: $15.00 per $1,000 rounded up to the next thousand of the construction cost, with the $50.00 minimum — the Exemption rate for any building, whatever its unit count. Its own words, \"rounded up to the next thousand\", are the second place the schedule states the round-up that \"or fraction thereof\" states four times.",
        sourceId: CAMBRIDGE_BUILDING_FEES_SOURCE_KEY,
      },
      {
        question: "What happens if work starts before the permit is issued?",
        answer:
          "The fee is tripled. All three ISD fee pages carry the same ordinance header — Section 15.04.010, the fee \"shall be tripled\" where work starts before the permit — with payment explicitly not relieving anyone from complying with the code. The triple fee is a multiplier on a fee rather than a charge, so it is stated rather than computed here.",
        sourceId: CAMBRIDGE_BUILDING_FEES_SOURCE_KEY,
      },
    ],
    seoTitle: "Cambridge building permit cost: $20 per $1,000, rounded up",
    seoDescription:
      "Cambridge building permit fees — $20.00 per $1,000 or fraction of construction cost with a $50.00 minimum, $15.00 at the Exemption rate for three units or less, Moving buildings at $15.00, and a plan-review cell quoted rather than charged.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: CAMBRIDGE_LAST_VERIFIED,
  },
  {
    jurisdictionKey: CAMBRIDGE_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    slug: "electrical-permit-cost",
    title: "Cambridge electrical permit cost",
    intro:
      "A Cambridge electrical permit is **a price list, not a ladder**: the Electrical/Wiring Fees page charges line items that stack — a new or existing service at $10.00 per 100 amperes, receptacles at $1.00 to $15.00 each by their ampere rating, a meter at $5.00 each, a generator at $100.00, an alarm at $25.00 residential or $75.00 commercial. There is no branch to fall into and no application fee: each line on the application pays its own row.",
    localSummary:
      "The service row is printed twice at one price — \"New Service — Per 100 AMPS — $10.00\" and \"Service per 100 amps\" — so a 200-ampere service is $20.00 and a 400-ampere one $40.00, charged on the service's amperage. Receptacles are five prices for one count, by the rating the applicant states: 15 amps $1.00 each, 20 amps $4.00 (the disposal and dishwasher row), 30 amps $5.00 (dryer), 50 amps $8.00 (range and hot water heater), 70 amps $15.00 — and the 15-ampere row doubles as the default when no rating is given, so a reader who counts receptacles without saying what they are is priced on the schedule's first row rather than charged nothing.\n\nThe rows stack, which is the structural contrast with Boston: a permit for a new service and four receptacles pays the service row *and* the receptacle rows, where Boston's sheet branches and exactly one branch answers. The meter's \"each\" is on the page, so two meters are $10.00; the generator and alarm print no \"each\", so they charge once per permit.\n\nNo application fee, no plan review percentage and no state surcharge exists on the page, and the schedule's one note names a testing requirement rather than a fee: \"All service equipment greater than 1,000 amps to be tested by certified testing firm\".",
    notIncluded:
      "This is ISD's Electrical/Wiring Fees page, charged line by line. It excludes:\n\n- **Rows priced by a count this site does not collect**: motors (by horsepower), heating units (by kilowatt), air conditioners (by tonnage), ductless A/C units, solar arrays ($100.00 each; the page prices solar service at the same $10.00 per 100 amperes the service rule charges), maintenance permits (quarterly $100.00, yearly $400.00), and data/low-voltage/audio-visual work by occupancy ($25.00 residential / $100.00 commercial).\n- **The electrical re-inspection** ($50.00) — charged as an inspection component when one actually happens, not part of a first-time permit.\n- **The triple fee** for work started before the permit issues — a multiplier printed on the page, not a charge.\n- **Bounced cheques ($35.00) and shutdowns ($100.00 plus inspection)** — consequences and later acts rather than permit fees.\n- **Plan review, technology and state surcharges — none exist** on the page.\n- **The 1,000-ampere testing note**, which is a requirement (\"to be tested by certified testing firm\") rather than a fee.",
    workedExample: {
      scenario:
        "A kitchen remodel's electrical work on one permit: a 200-ampere service upgrade, four 20-ampere receptacles for the appliances, and one meter.",
      inputs: {
        custom: { service_change: true, amperage: 200, receptacle_amps: 20, outlets: 4, meters: 1 },
      },
      notes:
        "The rows stack: the service at $10.00 per 100 amperes is 2 × $10.00, or $20.00; the four 20-ampere receptacles at $4.00 each are $16.00; the meter at $5.00 each is $5.00. The permit is $41.00.\n\nNothing branches. Had the same four receptacles been rated at 50 amperes — the range and hot-water-heater row — they would be $8.00 each and the permit $61.00; had no rating been stated, the schedule's first row would price them at $1.00 each and the permit $25.00. The rating, not the appliance, is what sets the receptacle price — the schedule's own hint, \"check amps\".\n\nA generator or an alarm would add $100.00 or $25.00/$75.00 once per permit, because those rows print no \"each\" where the meter's does. There is no application fee to add: every dollar here is a line item.",
    },
    faqs: [
      {
        question: "How much is an electrical permit in Cambridge?",
        answer:
          "It is the sum of the rows on the application: $10.00 per 100 amperes on a new or existing service, $1.00 to $15.00 for each receptacle by its ampere rating, $5.00 for each meter, $100.00 for a generator, $25.00 residential or $75.00 commercial for an alarm. The rows stack, and there is no application fee.",
        sourceId: CAMBRIDGE_ELECTRICAL_FEES_SOURCE_KEY,
      },
      {
        question: "How are receptacles priced?",
        answer:
          "By their ampere rating, under the line \"Receptacles/air conditioners, check amps\": 15 amps $1.00 each, 20 amps $4.00 (disposal, dishwasher), 30 amps $5.00 (dryer), 50 amps $8.00 (range, hot water heater/tub), 70 amps $15.00. The 15-ampere row is the default when no rating is stated. The rows also name the appliance each rating typically serves — the rating, not the appliance, is what sets the price.",
        sourceId: CAMBRIDGE_ELECTRICAL_FEES_SOURCE_KEY,
      },
      {
        question: "Do the rows stack or does one branch apply?",
        answer:
          "They stack. The page carries no \"when…\" branch language: it is a price list, so a service and four receptacles pay both rows. Boston's electrical sheet, by contrast, branches three ways and exactly one branch answers — the structural contrast between the two cities' schedules, asserted in their tests.",
        sourceId: CAMBRIDGE_ELECTRICAL_FEES_SOURCE_KEY,
      },
      {
        question: "Why does the meter say \"each\" but the generator does not?",
        answer:
          "Because the page prints it that way: \"Meter, each — $5.00\" charges per meter, while \"Generator — $100.00\" and the alarm rows print no \"each\" and charge once for the permit. If ISD charges generators or alarms per device, multi-device jobs are undercharged here — the research record carries it as an open question.",
        sourceId: CAMBRIDGE_ELECTRICAL_FEES_SOURCE_KEY,
      },
      {
        question: "Is there a plan review or application fee on an electrical permit?",
        answer:
          "Neither appears on the Electrical/Wiring Fees page. There is no application fee, no plan review percentage, no technology fee and no state surcharge — the schedule is a list of line items and nothing else. What the page does carry beyond prices is a note: service equipment over 1,000 amperes is to be tested by a certified testing firm, a requirement rather than a fee.",
        sourceId: CAMBRIDGE_ELECTRICAL_FEES_SOURCE_KEY,
      },
      {
        question: "What about solar panels?",
        answer:
          "The page prices the panels themselves at $100.00 per array — a count this site does not collect — but prices the solar *service* at the same \"$10/100 AMPS\" the ordinary service row charges, so a solar service is charged by the service rule on the same basis. The array row is named rather than charged.",
        sourceId: CAMBRIDGE_ELECTRICAL_FEES_SOURCE_KEY,
      },
    ],
    seoTitle: "Cambridge electrical permit cost: a price list by the item",
    seoDescription:
      "Cambridge electrical permit fees — $10.00 per 100 amperes on a service, $1.00-$15.00 receptacles by rating, $5.00 a meter, $100.00 generator, $25/$75 alarms, rows that stack, no application fee.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: CAMBRIDGE_LAST_VERIFIED,
  },
  {
    jurisdictionKey: CAMBRIDGE_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    slug: "plumbing-permit-cost",
    title: "Cambridge plumbing permit cost",
    intro:
      "A Cambridge plumbing permit is priced on **the fixture count with an allowance**: $50.00 for 5 fixtures and $5.00 for each additional fixture — the Plumbing Fees page's own cell, with the fourteen-fixture list that defines the count printed beside it. One to five fixtures are $50.00 together; each one after the fifth adds $5.00.",
    localSummary:
      "The count is defined on the same page: \"Bathtub, Dishwasher, Drinking Fountain, Floor/Area Drain, Food Disposal, Icemaker, Kitchen Sink, Lavatory, Roof Drain, Mop Sink, Shower Stall, Toilet, Urinal, Washing Machine\", marked \"Include in Fixture Count\". Three fixtures are $50.00, five are $50.00, eight are $50.00 plus $15.00 — $65.00.\n\nThe shape is the opposite of Boston's plumbing row, three miles east: Boston charges $5.00 for each fixture from the first, so five fixtures are $45.00 there against Cambridge's $50.00, and eight are $60.00 against $65.00 — Cambridge is $5.00 more at five and diverges further as the count grows. Both readings are asserted in their cities' tests.\n\nWater heaters are charged beside the block: $50.00 for electric, gas or indirect, and $100.00 for tankless — twice the tanked price. The page's own header carries the enforcement lines: triple the permit fee for work started without one, $50.00 for failing to call the final inspection within five days of completion, and a $50.00 re-inspection fee, charged as an inspection component when one actually happens.",
    notIncluded:
      "This is ISD's Plumbing Fees page, priced from the fixture block. It excludes:\n\n- **Rows for individual devices**, read and transcribed in the research record: back water valve, hose bib, irrigation meter and water meter at $25.00; cross-connection devices at $50.00 testable and $20.00 non-testable; dedicated systems at $100.00; disconnects, emergency showers, grease interceptors, lab sinks and the rest of the $50.00 rows; water piping and sanitary waste and vent at $50.00 per floor; sprinklers at $50.00 up to five heads plus $2.00 each after; standpipe valves at $40.00 plus $5.00 each; backflow preventors at $50.00. Each would need a fact of its own; the fixture block is the row a plumbing job starts from.\n- **The $50.00 re-inspection fee** — charged as an inspection component when one actually happens, not part of a first-time permit.\n- **The $50.00 failure-to-call penalty** — a consequence of not calling the final inspection within five days, named rather than charged.\n- **The triple fee** for work started before the permit issues — a multiplier printed on the page, not a charge.\n- **Plan review, technology and state surcharges — none exist** on the page.",
    workedExample: {
      scenario:
        "A full bathroom rough-in on one permit: tub, lavatory, toilet and washing machine connection, with the kitchen's dishwasher and food disposal added to the same filing — six fixtures in all.",
      inputs: { fixtures: 6 },
      notes:
        "The block: $50.00 covers the first five fixtures together and the sixth costs $5.00, so the permit is $55.00.\n\nThe allowance is what makes the shape: one to five fixtures all cost $50.00 — three are $50.00, five are $50.00 — and only the sixth and beyond add $5.00 each, so eight are $65.00 and twelve $85.00. Boston, three miles east, prices the same six fixtures at $20.00 plus 6 × $5.00, or $50.00 — $5.00 less at six, $5.00 more at five, and the two cross between five and six fixtures.\n\nAdd a tankless water heater to the filing and it adds $100.00, twice the $50.00 a tanked heater costs. Starting work before the permit issues triples all of it.",
    },
    faqs: [
      {
        question: "How much is a plumbing permit in Cambridge?",
        answer:
          "$50.00 for 5 fixtures and $5.00 for each additional fixture — the page's own cell, with the fourteen-fixture list (bathtub through washing machine) that defines the count printed beside it. One to five fixtures are $50.00 together; each one after the fifth adds $5.00.",
        sourceId: CAMBRIDGE_PLUMBING_FEES_SOURCE_KEY,
      },
      {
        question: "What counts as a fixture?",
        answer:
          "The fourteen items the page lists under \"Include in Fixture Count\": bathtub, dishwasher, drinking fountain, floor/area drain, food disposal, icemaker, kitchen sink, lavatory, roof drain, mop sink, shower stall, toilet, urinal and washing machine. The page defines the count and its price in one cell, so the list and the $50.00-for-5 price are read together.",
        sourceId: CAMBRIDGE_PLUMBING_FEES_SOURCE_KEY,
      },
      {
        question: "How does this compare with Boston?",
        answer:
          "Boston charges $5.00 for each fixture from the first plus a $20.00 application fee; Cambridge charges $50.00 for up to five and $5.00 after. Five fixtures are $45.00 in Boston and $50.00 in Cambridge; eight are $60.00 against $65.00. The two shapes are asserted in their cities' tests so neither can drift into the other.",
        sourceId: CAMBRIDGE_PLUMBING_FEES_SOURCE_KEY,
      },
      {
        question: "How much is a water heater?",
        answer:
          "$50.00 for electric, gas or indirect — three rows at one price — and $100.00 for tankless, twice the tanked price. The two are separate rows on the page and are charged beside the fixture block, so a filing with six fixtures and a tankless heater is $55.00 plus $100.00.",
        sourceId: CAMBRIDGE_PLUMBING_FEES_SOURCE_KEY,
      },
      {
        question: "What are the penalties on the page?",
        answer:
          "Three lines from the page's own header: work started without a permit triples the permit fee; failing to call the final inspection within five days of completion costs $50.00; and a re-inspection is $50.00. The re-inspection is charged as an inspection component when one actually happens; the other two are multipliers and consequences rather than permit charges.",
        sourceId: CAMBRIDGE_PLUMBING_FEES_SOURCE_KEY,
      },
    ],
    seoTitle: "Cambridge plumbing permit cost: $50 for 5 fixtures",
    seoDescription:
      "Cambridge plumbing permit fees — $50.00 for 5 fixtures with $5.00 for each additional, water heaters at $50/$100, the re-inspection and triple-fee warnings, and the fourteen-fixture list that defines the count.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: CAMBRIDGE_LAST_VERIFIED,
  },
];

const verifications: SeedVerification[] = [
  {
    entityType: "source",
    entityKey: CAMBRIDGE_BUILDING_FEES_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: CAMBRIDGE_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: CAMBRIDGE_BUILDING_FEES_SOURCE_KEY,
    notes:
      "Read 2026-09-25 as an HTML table: the cost ladder four times over with its Exemption line, Moving buildings, Sheet Metal, the sign and certificate rows, and the plan-review cell quoted verbatim — one cell, two amounts, no legend.",
  },
  {
    entityType: "source",
    entityKey: CAMBRIDGE_ELECTRICAL_FEES_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: CAMBRIDGE_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: CAMBRIDGE_ELECTRICAL_FEES_SOURCE_KEY,
    notes:
      "Read 2026-09-25: the service rows, the five receptacle prices by ampere rating, meters, generators, alarms, and the row names that carry no branch language — the structural fact behind the stacking rules.",
  },
  {
    entityType: "source",
    entityKey: CAMBRIDGE_PLUMBING_FEES_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: CAMBRIDGE_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: CAMBRIDGE_PLUMBING_FEES_SOURCE_KEY,
    notes:
      "Read 2026-09-25: the fixture list and its $50.00-for-5 price in one cell, the water heater rows, and the header lines — triple fee, failure to call, re-inspection at $50.00.",
  },
  {
    entityType: "source",
    entityKey: CAMBRIDGE_FEE_CHANGES_2024_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: CAMBRIDGE_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: CAMBRIDGE_FEE_CHANGES_2024_SOURCE_KEY,
    notes:
      "Read 2026-09-25 for what the only dated instrument found does and does not date: sidewalk obstruction permits and utility inspectors' overtime, no ISD row — which is why the fee pages carry the read date as their effectiveFrom.",
  },
  {
    entityType: "fee_schedule",
    entityKey: CAMBRIDGE_KEYS.feeSchedule,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: CAMBRIDGE_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: CAMBRIDGE_BUILDING_FEES_SOURCE_KEY,
    notes:
      "One schedule across three undated HTML pages of one ISD section, dated to the read date (2026-09-25) because no enactment date exists to record — the same choice Buffalo's undated sheets record. The DPW announcement of January 2024 names no ISD row and is held as a source so the possibility stays visible.",
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-COST-PER-THOUSAND",
    permitTypeKey: "building",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: CAMBRIDGE_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: CAMBRIDGE_BUILDING_FEES_SOURCE_KEY,
    notes:
      "\"$20.00 per $1,000.00 or fraction thereof of construction cost, $50.00 minimum fee\", printed identically under four row names. One rule charges all four because the arithmetic is identical; \"or fraction thereof\" sets incrementCents, and the minimum is the rule's own floor.",
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-EXEMPTION-1TO3",
    permitTypeKey: "building",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: CAMBRIDGE_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: CAMBRIDGE_BUILDING_FEES_SOURCE_KEY,
    notes:
      "\"Exemption: $15.00 per $1,000.00 or fraction thereof of construction cost for three residential dwelling units or less, $50.00 minimum fee.\" A rate, not a waiver — the City's own word on a row that still charges; selected by the building's unit count, with the standard rule written as its negation.",
  },
  {
    entityType: "fee_rule",
    entityKey: "PLUMB-FIXTURE-BLOCK",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: CAMBRIDGE_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: CAMBRIDGE_PLUMBING_FEES_SOURCE_KEY,
    notes:
      "\"$50.00 for 5 fixtures, $5.00 for each additional fixture\" — a base with a five-fixture allowance, charged as baseCents 5000, thresholdUnits 5, centsPerUnit 500. Asserted at three, five, six and eight fixtures in the content test, against Boston's straight $5.00-a-fixture row.",
  },
  {
    entityType: "permit_page",
    entityKey: "building-permit-cost",
    permitTypeKey: "building",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: CAMBRIDGE_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: CAMBRIDGE_BUILDING_FEES_SOURCE_KEY,
    notes:
      "The rounding contrast with Boston stated and asserted, the Exemption line as a rate rather than a waiver, the $50.00 minimum as the rule's own floor, and the plan-review cell quoted verbatim rather than charged.",
  },
  {
    entityType: "permit_page",
    entityKey: "electrical-permit-cost",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: CAMBRIDGE_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: CAMBRIDGE_ELECTRICAL_FEES_SOURCE_KEY,
    notes:
      "The price-list structure stated against Boston's branches, the worked example with the rows stacking ($20.00 + $16.00 + $5.00 = $41.00), and the receptacle default documented as the schedule's first row.",
  },
  {
    entityType: "permit_page",
    entityKey: "plumbing-permit-cost",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: CAMBRIDGE_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: CAMBRIDGE_PLUMBING_FEES_SOURCE_KEY,
    notes:
      "The allowance shape ($50.00 for one to five, $5.00 after), the water heater rows, and the comparison with Boston's per-fixture row — five fixtures $45.00 against $50.00, crossing between five and six.",
  },
  {
    entityType: "jurisdiction_profile",
    entityKey: CAMBRIDGE_KEYS.jurisdiction,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: CAMBRIDGE_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: CAMBRIDGE_BUILDING_FEES_SOURCE_KEY,
    notes:
      "Profile built from the three fee pages and the DPW announcement. It states the readings the model depends on — the printed round-up, the Exemption as a rate, the stacking price list, the fixture block's allowance, and the plan-review cell quoted rather than charged — and names every row it does not charge.",
  },
];

export const cambridgeSeed: JurisdictionSeed = {
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
export const CAMBRIDGE_PUBLISHED_PERMIT_PAGES = cambridgeSeed.permitPages.filter(
  (page) => page.publishStatus === "published" && !page.noindex,
);
