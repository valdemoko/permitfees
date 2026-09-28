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
  ANNAPOLIS_BUILDING_RULES,
  ANNAPOLIS_ELECTRICAL_RULES,
  ANNAPOLIS_FEE_EFFECTIVE_FROM,
  ANNAPOLIS_FY26_KEY,
  ANNAPOLIS_PLUMBING_RULES,
} from "./fee-rules";

export * from "./fee-rules";

/**
 * The complete Annapolis, Maryland seed payload.
 *
 * Every figure traces to research/maryland/annapolis.md, which traces to the
 * City of Annapolis FY26 Fee Schedule's Title 17 pages, cross-referenced to
 * Annapolis City Code §17.05-§17.28. Nothing is estimated.
 */

const RESEARCHER = "Permit Fee Intelligence research pass (Maryland)";

export const ANNAPOLIS_LAST_VERIFIED = "2026-09-26";

export const ANNAPOLIS_KEYS = {
  state: "md",
  county: "anne-arundel-county",
  jurisdiction: "annapolis",
  feeSchedule: "annapolis-fy26-fee-schedule",
} as const;

const state: SeedState = {
  code: "MD",
  slug: "maryland",
  name: "Maryland",
  fipsCode: "24",
};

const county: SeedCounty = {
  key: ANNAPOLIS_KEYS.county,
  slug: "anne-arundel-county",
  name: "Anne Arundel County",
  fipsCode: "24003",
};

const jurisdiction: SeedJurisdiction = {
  key: ANNAPOLIS_KEYS.jurisdiction,
  stateKey: ANNAPOLIS_KEYS.state,
  countyKey: ANNAPOLIS_KEYS.county,
  type: "city",
  slug: "annapolis",
  name: "Annapolis",
  officialName: "City of Annapolis",
  websiteUrl: "https://www.annapolis.gov/",
  permitPortalUrl: "https://www.annapolis.gov/800/Forms-Permits-Licenses",
  timezone: "America/New_York",
  isActive: true,
};

const departments: SeedDepartment[] = [
  {
    key: "annapolis-pz",
    jurisdictionKey: ANNAPOLIS_KEYS.jurisdiction,
    kind: "building",
    name: "Department of Planning & Zoning",
    phone: null,
    email: null,
    url: "https://www.annapolis.gov/800/Forms-Permits-Licenses",
    addressLine: "145 Gorman Street, 3rd Floor, Annapolis, MD 21401",
    hours: null,
    notes:
      "Planning & Zoning receives building, electrical, mechanical and plumbing permit applications and publishes the City's forms and fee schedule at the URL recorded here. The department's telephone number and office hours were not published in any document this pass could read, so they are left empty rather than guessed at.",
  },
];

const sources: SeedSource[] = [
  {
    key: ANNAPOLIS_FY26_KEY,
    jurisdictionKey: ANNAPOLIS_KEYS.jurisdiction,
    title:
      'City of Annapolis FY26 Fee Schedule — Title 17 "Buildings & Construction" pages (§17.05 through §17.28)',
    url: "https://library.municode.com/md/annapolis/codes/code_of_ordinances?nodeId=AP_FEES_SCHEDULEFY2026",
    sourceType: "municipal_code",
    issuingAuthority: "City of Annapolis",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: ANNAPOLIS_FEE_EFFECTIVE_FROM,
    retrievedAt: ANNAPOLIS_LAST_VERIFIED,
    lastVerifiedAt: ANNAPOLIS_LAST_VERIFIED,
    notes:
      "Read 2026-09-26 as the City's 27-page official FY26 schedule. The PDF the City served from annapolis.gov/DocumentCenter/View/3809 no longer resolves (404), so this source now carries the City's own “Fee Schedule FY2026” link — annapolis.gov resolves it to the Municode codification, HTTP 200. The building page transcribes the permit-fee value bands ($25/$150/$175/$200 and $250 + 0.8% over $10,000), the nonrefundable application-fee bands and the drawing-submittal plan-review bands, each with its printed code section (§17.05.130, §17.08.080, §17.09.070). The electrical page transcribes §17.16's dwelling-unit and rough-wiring rows. The plumbing page transcribes §17.28's installation charges, fixture charges and gas service pipe charges. The schedule prints code citations alongside every row, which is what allows the two-column extraction problem to be resolved line by line.",
  },
];

/** Empty on purpose: the permit types Annapolis uses already exist as shared rows. */
const permitTypes: JurisdictionSeed["permitTypes"] = [];
const projectTypes: JurisdictionSeed["projectTypes"] = [];

const jurisdictionPermitTypes: SeedJurisdictionPermitType[] = [
  {
    jurisdictionKey: ANNAPOLIS_KEYS.jurisdiction,
    permitTypeKey: "building",
    isAvailable: true,
    localName: "Building permit",
    officialUrl: "https://www.annapolis.gov/800/Forms-Permits-Licenses",
    notes:
      "Priced on the estimated value of the work in bands: $25 to $500 of value, $150 to $3,000, $175 to $5,000, $200 to $10,000, and $250 plus 0.8% of the value over $10,000 above that. A nonrefundable application fee runs $25 to $200 plus 0.25% over $75,000, and drawing submittal for plan review runs $100 to $350 plus 0.1% over $100,000.",
  },
  {
    jurisdictionKey: ANNAPOLIS_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    isAvailable: true,
    localName: "Electrical permit",
    officialUrl: "https://www.annapolis.gov/800/Forms-Permits-Licenses",
    notes:
      "A new dwelling unit with a 200-ampere service or less is $150, plus $8 for each 100 amperes or fraction over 200. Rough wiring for additions, alterations and repairs is $25 for 1-10 outlets, $50 for 11-40 and $75 for 41-75, with $10 per 25 outlets or fraction above 75 — switches, lighting and receptacles each count as outlets. New apartment dwelling units pay 80% of the dwelling fees.",
  },
  {
    jurisdictionKey: ANNAPOLIS_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    isAvailable: true,
    localName: "Plumbing permit",
    officialUrl: "https://www.annapolis.gov/800/Forms-Permits-Licenses",
    notes:
      "Priced as the sum of fixture charges plus applicable gas service pipe charges: the first fixture $60 residential and $80 commercial, each additional fixture connected to public sewer $15 (private sewer $30), and the gas service pipe by diameter from $50 at 2½ inches or less to $500 at 12 inches. Grease traps, oil interceptors and gas water heaters carry special fixture charges.",
  },
];

const feeSchedules: SeedFeeSchedule[] = [
  {
    key: ANNAPOLIS_KEYS.feeSchedule,
    jurisdictionKey: ANNAPOLIS_KEYS.jurisdiction,
    sourceKey: ANNAPOLIS_FY26_KEY,
    title: "City of Annapolis FY26 Fee Schedule — Title 17 fee rows",
    officialUrl: "https://library.municode.com/md/annapolis/codes/code_of_ordinances?nodeId=AP_FEES_SCHEDULEFY2026",
    effectiveFrom: ANNAPOLIS_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: ANNAPOLIS_LAST_VERIFIED,
    notes:
      "The FY26 schedule takes effect with the fiscal year the City adopted it for; the date modelled here is the start of FY26. Each row cites its own section of City Code Title 17, so the schedule is a consolidated view of the code rather than a standalone instrument.",
  },
];

function attach(permitTypeKey: string, rules: SeedFeeRule["rule"][]): SeedFeeRule[] {
  return rules.map((rule) => ({
    jurisdictionKey: ANNAPOLIS_KEYS.jurisdiction,
    permitTypeKey,
    scheduleKey: ANNAPOLIS_KEYS.feeSchedule,
    rule,
  }));
}

const feeRules: SeedFeeRule[] = [
  ...attach("building", ANNAPOLIS_BUILDING_RULES),
  ...attach("electrical", ANNAPOLIS_ELECTRICAL_RULES),
  ...attach("plumbing", ANNAPOLIS_PLUMBING_RULES),
];

const requirements: SeedRequirement[] = [
  {
    jurisdictionKey: ANNAPOLIS_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "Estimated value of the work declared by the applicant",
    description:
      "The building permit bands key off the estimated value of the work, which the application declares; the schedule's valuation guidance elsewhere in Title 17 points to total contract price or cost of construction. The declared value selects both the permit band and the nonrefundable application-fee band.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: ANNAPOLIS_FY26_KEY,
    lastVerifiedAt: ANNAPOLIS_LAST_VERIFIED,
  },
  {
    jurisdictionKey: ANNAPOLIS_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "Nonrefundable application fee, separate from the permit fee",
    description:
      "The FY26 schedule prices a nonrefundable application fee on the estimated value of the work — $25 to $500 of value, $100 to $25,000, $150 to $50,000, $200 to $75,000 and $200 plus 0.25% of the excess above. It is due at application and does not credit against the permit fee.",
    isMandatory: true,
    sortOrder: 20,
    sourceKey: ANNAPOLIS_FY26_KEY,
    lastVerifiedAt: ANNAPOLIS_LAST_VERIFIED,
  },
  {
    jurisdictionKey: ANNAPOLIS_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "Drawing submittal fee when plans are reviewed",
    description:
      "The FY26 schedule prices the fee to submit new or revised construction drawings and submittals for review on the estimated cost of construction — $100 to $10,000, $150 to $15,000, $200 to $25,000, $350 to $100,000 and $350 plus 0.1% of the excess above. Outside review at the Director's option is $100 plus $150 per hour in quarter-hour increments.",
    isMandatory: true,
    sortOrder: 30,
    sourceKey: ANNAPOLIS_FY26_KEY,
    lastVerifiedAt: ANNAPOLIS_LAST_VERIFIED,
  },
  {
    jurisdictionKey: ANNAPOLIS_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "other",
    title: "Outlets counted as switches, lighting and receptacles",
    description:
      "§17.16's rough-wiring rows state the counting rule in the row itself: 'All switches, lighting and receptacles to be counted as outlets.' The declared outlet count selects the band, and the fixture row runs the identical bands in parallel.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: ANNAPOLIS_FY26_KEY,
    lastVerifiedAt: ANNAPOLIS_LAST_VERIFIED,
  },
  {
    jurisdictionKey: ANNAPOLIS_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    requirementType: "other",
    title: "Fixture charges plus applicable gas service pipe charges",
    description:
      "§17.28 reads the plumbing permit as 'the sum of the fixture charges plus the amount of the applicable gas service pipe charges set forth in this section' — the first fixture carries the installation-charge row ($60 residential, $80 commercial), each additional fixture $15 on public sewer or $30 on private sewer, and the gas pipe by diameter where gas service is part of the permit.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: ANNAPOLIS_FY26_KEY,
    lastVerifiedAt: ANNAPOLIS_LAST_VERIFIED,
  },
];

const profile: SeedProfile = {
  jurisdictionKey: ANNAPOLIS_KEYS.jurisdiction,
  headline: "What building permits cost in Annapolis",
  summary:
    "Annapolis prices a building permit on the **estimated value of the work** in bands: **$25** up to $500 of value, **$150** to $3,000, **$175** to $5,000, **$200** to $10,000, and **$250 plus 0.8%** of the value over $10,000 above that. A separate nonrefundable application fee runs **$25 to $200** by value, and drawing submittal for plan review runs **$100 to $350** plus 0.1% over $100,000. Electrical permits are **$150** for a new dwelling with a 200-ampere service plus **$8 per 100 amperes** over, or **$25-$75** by outlet band for alterations, and plumbing permits are the **first fixture $60 plus $15 per additional** fixture plus the gas pipe charge.",
  localContext:
    "Annapolis publishes its fees as one consolidated FY26 schedule whose every row cites its own section of City Code Title 17, Buildings & Construction. That makes the document unusually traceable — a fee can be checked against the section it cites — and unusually dense: Title 17 also prices grading, demolition, signs, rental licences, use-and-occupancy inspections and watershed restoration charges on the same pages.\n\nThe building side is a straight value ladder, unlike Baltimore's volumetric fee one exit up the road: a small job of $5,000 pays $175.00, a $10,000 job pays $200.00, and above $10,000 the fee grows linearly at 0.8% of the excess plus the $250 base. The application fee and the plan-review fee each have their own ladders on top, so a mid-size job carries three bands read from three tables.\n\nThe electrical section is where the schedule shows its age in a good way: the dwelling row is priced by service amperage, and the rough-wiring rows are priced by counting every switch, lighting outlet and receptacle as an 'outlet'. Annapolis apartment dwellings pay 80% of the dwelling-unit fees, which the schedule prints rather than derives. And the plumbing section reads as its own sentence: the permit is 'the sum of the fixture charges plus the amount of the applicable gas service pipe charges', which means a gas water heater, a range or a furnace line rides the same plumbing permit as the fixtures.",
  valuationBasis:
    "**Estimated value of the work** for the building permit and its application and plan-review fees — declared by the applicant and banded. **Service amperage and outlet counts** for electrical: $150 for a dwelling service of 200 amperes or less, $8 per 100 amperes or fraction over, and $25-$75 by outlet band for rough wiring on additions, alterations and repairs. **Fixture counts and gas pipe diameter** for plumbing: first fixture $60 residential, $15 per additional public-sewer fixture, and $50-$500 by pipe diameter. No fee here is derived from a per-square-foot rate.",
  notIncluded:
    "These figures are Annapolis's building, electrical and plumbing permit fees and the application fee. They are not a total project cost, and they exclude:\n\n- **The plan-review drawing submittal fee** ($100-$350 plus 0.1% over $100,000), which the model names in the requirements rather than charging, because the worked example prices a permit without drawings.\n- **Grading permits** at $713 to $1,575 by sitework cost plus 5.4% of the excess over $200,000, with $300 milestone inspections.\n- **Moving or demolishing a building** at a $100 residential and $150 commercial nonrefundable application fee.\n- **Mechanical permits** at $125 to $10,000 of value and 2% of total cost above, and fire plan review at $50 per inspector hour.\n- **Use and occupancy inspection** at $0.325 per square foot, residential unit $250.\n- **Utility connection charges** — $9,400 for a city-installed 4-inch sewer connection and $8,400 for a 1-inch water connection with meter — which are DPW charges, not permit fees.\n- **Special fixture charges**: grease traps and oil interceptors at $100 each, water conditioning units at $50, gas hot water heaters at $40.\n- **Licences**: master and journeyman plumbers at $200 biennially, electrical contractors at $200 biennially, gas fitters at $50 a year, utility contractors at $100 a year.\n- **Watershed restoration quarterly charges** based on impervious area, and **tree fee-in-lieu** at $1,250-$2,000 per tree.\n- **Anything charged by Anne Arundel County or the State of Maryland.**",
  seoTitle: "Annapolis building permit fees",
  seoDescription:
    "How Annapolis, Maryland prices building, electrical and plumbing permits — value bands from $25 to $250 plus 0.8%, $150 dwelling electrical, and fixture-plus-gas-pipe plumbing pricing.",
  publishStatus: "published",
  noindex: false,
  lastReviewedAt: ANNAPOLIS_LAST_VERIFIED,
};

const permitPages: SeedPermitPage[] = [
  {
    jurisdictionKey: ANNAPOLIS_KEYS.jurisdiction,
    permitTypeKey: "building",
    slug: "building-permit-fees",
    seoTitle: "Annapolis building permit fees",
    seoDescription:
      "Annapolis, Maryland building, electrical and plumbing permit fees — value bands from $25 to $250 plus 0.8%, $150 dwelling electrical, and fixture-plus-gas-pipe plumbing pricing.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: ANNAPOLIS_LAST_VERIFIED,
    title: "Annapolis building permit fees",
    intro:
      "An Annapolis building permit is priced on the **estimated value of the work** in bands: **$25.00** for work valued at $500 or less, **$150.00** to $3,000, **$175.00** to $5,000, **$200.00** to $10,000, and above that **$250.00 plus 0.8% of the value in excess of $10,000**. A separate nonrefundable application fee applies at application, and a drawing-submittal fee applies when plans are reviewed.",
    localSummary:
      "The ladder is steep at the bottom and linear at the top. A $500 deck pays $25.00; a $3,000 job pays $150.00; a $5,000 job $175.00; a $10,000 job $200.00 — and from $10,001 the fee is the $250.00 base plus 0.8% of everything over $10,000, so a $60,000 addition is $250.00 + 0.8% x $50,000 = $650.00. There is no per-square-foot route and no volume measurement; the declared value is everything.\n\nTwo more tables ride the same declared value. The nonrefundable application fee — $25 at the bottom, $100 through $25,000, $150 to $50,000, $200 to $75,000 and $200 plus 0.25% of the excess above — is due before the application is processed and does not credit against the permit. The drawing-submittal fee, $100 to $350 plus 0.1% over $100,000 of construction cost, applies when plans are reviewed and, at the Director's option, outside review is billed at $100 plus $150 an hour.\n\nWatch what the value declaration touches: the permit band, the application band and the plan-review band all key off the same number, so an honest valuation is not just a compliance question — it is the single input that moves every line of the fee.",
    notIncluded:
      "This is the FY26 schedule's permit-fee bands and the application fee. It excludes:\n\n- **The drawing-submittal plan-review fee** ($100-$350 plus 0.1%), named in the requirements and not charged in the worked example.\n- **Grading permits** at $713-$1,575 plus 5.4% of sitework cost over $200,000, and $300 milestone inspections.\n- **Moving or demolition applications** at $100 residential and $150 commercial.\n- **Mechanical permits** ($125-$200 by value and 2% above $10,000) and **fire plan review** at $50 an hour.\n- **Use and occupancy inspection** at $0.325 per square foot, $250 per residential unit.\n- **Utility connection charges** ($9,400 sewer, $8,400 water), which are DPW bills rather than permit fees.\n- **Reinspection fees** at $100 residential and $150 commercial, and the $450 appeal to the Building Board of Appeals.",
    workedExample: {
      scenario:
        "A residential addition valued at $60,000 in Annapolis, filed with the standard application and no plan-review drawings priced.",
      inputs: {
        valuationCents: 6_000_000,
        occupancy: "residential",
      },
      notes:
        "The permit fee: $60,000 is above $10,000, so the top row applies — **$250.00 + 0.8% x ($60,000 − $10,000)** = $250.00 + 0.8% x $50,000 = $250.00 + **$400.00** = **$650.00**.\n\nThe nonrefundable application fee adds **$200.00** — the schedule's $50,001-$75,000 row, where a $60,000 valuation sits.\n\nTotal: $650.00 + $200.00 = **$850.00**. A plan review of drawings would add $350.00 — the schedule's $25,001-$100,000 row — bringing the same permit to $1,200.00 with drawings.",
    },
    faqs: [
      {
        question: "How much is a building permit in Annapolis?",
        answer:
          "It depends on the estimated value of the work: $25 to $500 of value, $150 to $3,000, $175 to $5,000, $200 to $10,000, and $250 plus 0.8% of the value over $10,000 above that. A $60,000 addition is $650.00.",
      },
      {
        question: "Is there an application fee separate from the permit fee?",
        answer:
          "Yes. The nonrefundable application fee is $25 up to $500 of value, $100 to $25,000, $150 to $50,000, $200 to $75,000 and $200 plus 0.25% of the excess above. It is due at application and does not credit against the permit fee.",
      },
      {
        question: "What does plan review cost?",
        answer:
          "Submitting new or revised construction drawings for review runs $100 up to $10,000 of construction cost, $150 to $15,000, $200 to $25,000, $350 to $100,000 and $350 plus 0.1% of the excess above. Outside review at the Director's option is $100 plus $150 per hour in quarter-hour increments.",
      },
      {
        question: "How much is a permit for a small job like a water heater or deck?",
        answer:
          "A job valued at $500 or less pays the $25.00 band; $501 to $3,000 pays $150.00. The $25.00 band is narrow — most real jobs land at $150.00 or above.",
      },
      {
        question: "Does Annapolis price permits per square foot like some cities?",
        answer:
          "No. The building permit is a value ladder, and the only per-square-foot fee in Title 17's building pages is the use-and-occupancy inspection at $0.325 per square foot, which is a different fee.",
      },
      {
        question: "What is the fee for demolishing a building?",
        answer:
          "The nonrefundable application fee for moving or demolishing a building is $100 for residential properties and $150 for commercial — the demolition work itself is then priced under the permit fees.",
      },
      {
        question: "How much is a grading permit?",
        answer:
          "The grading application fee runs $713 to $1,575 by sitework cost, and the grading permit fee is $713 plus 5.4% of the estimated sitework cost over $200,000, with $300 milestone inspections and a $300 reinspection fee.",
      },
      {
        question: "What happens if work fails inspection?",
        answer:
          "Reinspection fees are $100 for residential and $150 for commercial work. Failing to notify the Department that permitted work is complete adds a $75 failure-to-notify fee, and an investigation fee of $75 applies where the Department investigates unpermitted work.",
      },
      {
        question: "Can I appeal a fee or a permit decision?",
        answer:
          "Filing an appeal to the Building Board of Appeals is $450, across the building, grading, fence-and-wall and residential property maintenance dockets alike.",
      },
      {
        question: "Do apartments pay the same electrical fees as houses?",
        answer:
          "No. New apartment dwelling units pay 80% of the dwelling-unit electrical fees, which the FY26 schedule prints as its own row rather than deriving.",
      },
      {
        question: "Is the permit fee the same at any valuation above $10,000?",
        answer:
          "No — above $10,000 the fee grows linearly: $250 plus 0.8% of the excess. A $110,000 project is $850.00, and a $1,000,000 project is $7,930.00.",
      },
      {
        question: "Where do I file, and what does the City cite for its fees?",
        answer:
          "The Department of Planning & Zoning receives applications, and the City's FY26 Fee Schedule cites Annapolis City Code Title 17 for every row — so a fee can be checked against the section it comes from.",
      },
    ],
  },
  {
    jurisdictionKey: ANNAPOLIS_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    slug: "electrical-permit-fees",
    seoTitle: "Annapolis electrical permit fees",
    seoDescription:
      "Annapolis electrical permit fees — $150 for a new dwelling service up to 200 amperes, and $25-$75 by outlet band for rough wiring.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: ANNAPOLIS_LAST_VERIFIED,
    title: "Annapolis electrical permit fees",
    intro:
      "An Annapolis electrical permit for a **new dwelling unit** is **$150.00** with a service of 200 amperes or less, plus **$8.00 for each 100 amperes or fraction** over 200. Rough wiring for additions, alterations and repairs is banded by outlet count — **$25.00 for 1-10 outlets, $50.00 for 11-40, $75.00 for 41-75** — plus **$10.00 per 25 outlets or fraction** above 75. New apartment dwelling units pay **80%** of the dwelling fees.",
    localSummary:
      "The dwelling row is amperage-priced, and the add-on is rounded the way Charleston and Miami-Dade round — per 100 amperes *or fraction thereof*. A 320-ampere service is $150.00 plus $8.00 for each of the two excess hundreds, rounding 120 amperes of excess up to two blocks.\n\nThe rough-wiring rows count everything fixed: 'All switches, lighting and receptacles to be counted as outlets.' Ten outlets or fewer is $25.00, eleven to forty $50.00, forty-one to seventy-five $75.00, and above seventy-five the schedule adds $10.00 for every 25 outlets or fraction — one hundred outlets are $85.00, not $75.00. The fixture row runs the identical bands in parallel, so a job with both counts pays both.\n\nSection C's additions catch the rest: electrically operated signs at $75.00, radio and television receiving installations at $50.00, solar photovoltaic at $10.00 per module, generators at $75.00 for 1-8 kW plus $30.00 per additional 10 kW, and a $75.00 fee for a change in service size without new construction.",
    notIncluded:
      "This is §17.16's dwelling and rough-wiring rows. It excludes:\n\n- **Nonresidential service equipment**: $175 at 200 amperes or less, $225 to 300, $250 to 400, $250 plus $0.75 per ampere over 400 to 1,200, and $1,250 plus $2.50 per ampere over 1,200.\n- **Swimming pools**: $100 bonding for inground pools, $50 for lighting, fixtures, pumps and filters, and $45 above ground.\n- **Protective signaling systems** at $80 for the first 10 devices plus $10 per additional multiple of ten.\n- **Transformers and vaults** at $80, $125 and $130 by KVA, and modular or prefabricated structure stickers.\n- **Section C additions**: signs $75, radio/TV $50, the $75 change-in-service fee, and the $10 solar module charge — named on the page but not folded into the worked example.\n- **Reinspection fees** at $100 residential and $150 commercial, the $50 failure-to-notify fee and the $75 investigation fee.",
    workedExample: {
      scenario:
        "A new single-family dwelling in Annapolis with a 200-ampere service, filed as new construction.",
      inputs: {
        occupancy: "residential",
      },
      notes:
        "The dwelling row charges **$150.00** — §17.16's new dwelling unit, 200 ampere service or less. The over-200 add does not apply because the service is exactly at 200 amperes.\n\nA 300-ampere service on the same house would be $150.00 plus $8.00 for each 100 amperes or fraction over 200 — one block — for **$158.00**. A 205-ampere service would pay the same $158.00, because the fraction rounds up.\n\nApartment dwelling units pay 80% of these figures: the same dwelling permit in a new apartment building is $120.00.",
    },
    faqs: [
      {
        question: "How much is an electrical permit for a new house in Annapolis?",
        answer:
          "$150.00 for a dwelling unit with a 200-ampere service or less. Above 200 amperes the fee is $150.00 plus $8.00 for each 100 amperes or fraction thereof in excess of 200.",
      },
      {
        question: "How are outlets counted for a remodel?",
        answer:
          "All switches, lighting and receptacles count as outlets. One to ten outlets is $25.00, eleven to forty $50.00, forty-one to seventy-five $75.00, and above seventy-five $10.00 per every 25 outlets or fraction thereof.",
      },
      {
        question: "What does rough wiring of fixtures cost?",
        answer:
          "The identical bands: $25.00 for 1-10 fixtures, $50.00 for 11-40, $75.00 for 41-75 and $10.00 per 25 or fraction above. A job with both outlets and fixtures pays both rows.",
      },
      {
        question: "Do apartment units pay less?",
        answer:
          "Yes — new apartment dwelling units pay 80% of the dwelling-unit fees, printed as the schedule's own row.",
      },
      {
        question: "What does nonresidential service equipment cost?",
        answer:
          "$175.00 at 200 amperes or less, $225.00 up to 300, $250.00 up to 400, $250.00 plus $0.75 per ampere over 400 up to 1,200, and $1,250.00 plus $2.50 per ampere over 1,200 above that.",
      },
      {
        question: "How much for solar panels?",
        answer:
          "$10.00 per module. Generators are $75.00 for 1-8 kW plus $30.00 for each additional 10 kW or fraction.",
      },
      {
        question: "Is there a fee to change my service size without new work?",
        answer:
          "Yes — a fee for change in service size of $75.00, separate from the dwelling and nonresidential rows.",
      },
      {
        question: "What about smoke detectors and alarms?",
        answer:
          "Protective signaling systems are $80.00 for the first 10 devices plus $10.00 for each additional multiple of ten devices or part thereof.",
      },
      {
        question: "Do pool electrical permits cost extra?",
        answer:
          "Yes — inground pool bonding is $100.00, lighting, fixtures, pumps and filters $50.00, and an above-ground pool $45.00.",
      },
      {
        question: "What happens if I fail an electrical inspection?",
        answer:
          "Reinspection is $100.00 residential and $150.00 commercial. Failing to notify the Department within the prescribed time adds a $50.00 fee.",
      },
    ],
  },
  {
    jurisdictionKey: ANNAPOLIS_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    slug: "plumbing-permit-fees",
    seoTitle: "Annapolis plumbing permit fees",
    seoDescription:
      "Annapolis plumbing permit fees — $60 for the first fixture plus $15 each additional, and gas service pipe charges from $50 to $500 by diameter.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: ANNAPOLIS_LAST_VERIFIED,
    title: "Annapolis plumbing permit fees",
    intro:
      "An Annapolis plumbing permit is the **sum of the fixture charges plus the applicable gas service pipe charges**: the first fixture is **$60.00 residential** ($80.00 commercial), each **additional fixture connected to public sewer is $15.00** ($30.00 on private sewer), and the gas service pipe runs **$50.00** at 2½ inches or less up to **$500.00** at 12 inches by diameter.",
    localSummary:
      "The schedule states the shape in its own words — 'the sum of the fixture charges plus the amount of the applicable gas service pipe charges set forth in this section' — so a permit is built line by line from the job's fixture list and its gas service diameter rather than read off one row.\n\nThe fixture side: $60.00 for the first fixture in a dwelling and $80.00 commercially, then $15.00 per additional fixture on public sewer and $30.00 on private sewer. Fixtures omitted from an original permit are added at $20.00 and $40.00. The special charges sit alongside: grease traps and oil interceptors $100.00 each, water conditioning units $50.00, gas hot water heaters $40.00.\n\nThe gas side is priced by pipe diameter, inspection included: $50.00 at 2½ inches or less, $60.00 at 3 inches, $70.00 at 4 inches, $125.00 at 6 inches, $250.00 at 8 inches, $350.00 at 10 inches and $500.00 at 12 inches. Connection charges are not permits — the city-installed 4-inch sewer connection is $9,400.00 and the 1-inch water connection $8,400.00, both DPW bills.",
    notIncluded:
      "This is §17.28's installation, fixture and gas-pipe charges. It excludes:\n\n- **The special fixture charges** — grease traps and oil interceptors at $100.00 each, water conditioning units at $50.00, gas hot water heaters at $40.00 single installation — named on the page and not folded into the fixture rows.\n- **Inspection charges** for water or sewer installation at $100.00, private sewer reconstruction at $50.00 and air-conditioning with water or drain connection at $60.00.\n- **Omitted fixtures** at $20.00 public sewer and $40.00 private sewer, charged when a permit is amended rather than filed new.\n- **Connection charges**: the $9,400.00 city-installed 4-inch sewer connection and the $8,400.00 1-inch water connection with meter, plus the $1,700 and $3,200 per-equivalent-dwelling-unit capital facility charges, which are utility bills.\n- **Utility contractor licences** at $100 a year and **master/journeyman plumber licences** at $200 biennially.\n- **Reinspection fees** at $100 residential and $150 commercial.",
    workedExample: {
      scenario:
        "A residential bathroom remodel in Annapolis adding 3 fixtures — a water closet, a lavatory and a shower — connected to public sewer, with no gas work.",
      inputs: {
        occupancy: "residential",
        fixtures: 3,
      },
      notes:
        "The first fixture charges **$60.00** — §17.28's residential installation charge — and each additional fixture on public sewer adds **$15.00** x 2 = **$30.00**. Fixture charges: **$90.00**.\n\nNo gas service pipe is part of the permit, so the gas rows add nothing.\n\nTotal: **$90.00**. The same three fixtures in a commercial space would be $80.00 + 2 x $15.00 = **$110.00**, and adding a gas water heater would carry the $40.00 special fixture charge rather than the gas pipe diameter rows.",
    },
    faqs: [
      {
        question: "How is a plumbing permit priced in Annapolis?",
        answer:
          "As the sum of the fixture charges plus the applicable gas service pipe charges: $60.00 for the first residential fixture ($80.00 commercial), $15.00 per additional fixture on public sewer, and the gas pipe by diameter where gas service is in the permit.",
      },
      {
        question: "What does the first fixture cost?",
        answer:
          "$60.00 in residential work and $80.00 commercial — the schedule's 'Installation charges — first fixture' row.",
      },
      {
        question: "How much is each additional fixture?",
        answer:
          "$15.00 each if connected to public sewer and $30.00 each if connected to private sewer. Fixtures omitted from an original permit are added at $20.00 and $40.00 respectively.",
      },
      {
        question: "What does a gas water heater permit cost?",
        answer:
          "The gas hot water heater special fixture charge is $40.00 for a single installation, and an additional gas connection for gas hot water heaters is $10.00.",
      },
      {
        question: "How is gas piping priced?",
        answer:
          "By pipe diameter, inspection by the City plumbing inspector included: $50.00 at 2½ inches or less, $60.00 at 3 inches, $70.00 at 4 inches, $125.00 at 6 inches, $250.00 at 8 inches, $350.00 at 10 inches and $500.00 at 12 inches.",
      },
      {
        question: "What does a grease trap cost to permit?",
        answer:
          "$100.00 per grease trap, and $100.00 per oil interceptor — the schedule's special fixture charges.",
      },
      {
        question: "Is the sewer connection fee part of the permit?",
        answer:
          "No. A city-installed 4-inch public sewer connection is $9,400.00 and a 1-inch water connection with meter $8,400.00 — utility connection charges, separate from the plumbing permit fee.",
      },
      {
        question: "How much is a plumbing inspection charge?",
        answer:
          "$100.00 for a water or sewer installation, $50.00 to reconstruct a private sewer, and $60.00 for air-conditioning with a water or drain connection.",
      },
      {
        question: "Do plumbers need a City licence?",
        answer:
          "Yes — master plumber and journeyman plumber licences are $200.00 biennially, and an annual utility contractor licence is $100.00.",
      },
      {
        question: "What if my inspection fails?",
        answer:
          "Reinspection fees are $100.00 residential and $150.00 commercial under §17.28's inspection charge rows.",
      },
    ],
  },
];

const verifications: SeedVerification[] = [
  {
    entityType: "source",
    entityKey: ANNAPOLIS_FY26_KEY,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: ANNAPOLIS_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: ANNAPOLIS_FY26_KEY,
    notes:
      "Read 2026-09-26 as the City's official 27-page FY26 schedule; the document URL is the City's own “Fee Schedule FY2026” link (annapolis.gov → Municode), HTTP 200. Title 17 pages transcribed row by row with their printed code citations (§17.05.130 permit bands, §17.08.080, §17.09.070, §17.16 electrical, §17.28 plumbing). The schedule's two-column layout was re-aligned against the printed page structure before transcription, and the FY25/FY26 paired figures resolved to the FY26 column.",
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-TABLE",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: ANNAPOLIS_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: ANNAPOLIS_FY26_KEY,
    notes:
      "'Permit fees based on the estimated value of the work': $25 / $150 / $175 / $200 across the first four bands, transcribed with the printed code sections. The top band is charged by the marginal rule rather than the table so the 0.8% arithmetic stays exact.",
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-OVER-10K",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: ANNAPOLIS_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: ANNAPOLIS_FY26_KEY,
    notes:
      "$10,001 and more: $250.00 plus 0.8% of the estimated value of work in excess of $10,000. Stored as 80 cents per $1,000 of the excess with the $250.00 base on the same rule, and gated to values above $10,000 so the two rows never double-charge.",
  },
  {
    entityType: "fee_rule",
    entityKey: "ELEC-DWELLING",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: ANNAPOLIS_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: ANNAPOLIS_FY26_KEY,
    notes:
      "§17.16 A: new dwelling units, 200 ampere service or less — $150.00, with the $8.00-per-100-amperes-or-fraction excess named rather than charged. The 80% apartment row and the nonresidential service table transcribed in the rule description.",
  },
  {
    entityType: "fee_rule",
    entityKey: "PLUMB-FIRST-FIXTURE",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: ANNAPOLIS_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: ANNAPOLIS_FY26_KEY,
    notes:
      "§17.28 installation charges: first fixture $60.00 residential / $80.00 commercial, with the schedule's own sentence — 'the sum of the fixture charges plus the amount of the applicable gas service pipe charges' — governing how the rows combine.",
  },
  {
    entityType: "jurisdiction_profile",
    entityKey: ANNAPOLIS_KEYS.jurisdiction,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: ANNAPOLIS_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: ANNAPOLIS_FY26_KEY,
    notes:
      "Hub content built from the FY26 schedule's Title 17 pages. The profile states the reading the model depends on — the declared estimated value selecting three bands at once — and names the grading, demolition, mechanical, use-and-occupancy, connection-charge and licence amounts as published and out of scope.",
  },
  {
    entityType: "permit_page",
    entityKey: "building-permit-fees",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: ANNAPOLIS_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: ANNAPOLIS_FY26_KEY,
    notes:
      "Recorded for the editorial gate: this page's prose, sources and fee-rule mapping were checked against the schedule published by City of Annapolis during the research pass that produced this seed; the seed's content tests assert the arithmetic. No amount on this page is estimated.",
  },
  {
    entityType: "permit_page",
    entityKey: "electrical-permit-fees",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: ANNAPOLIS_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: ANNAPOLIS_FY26_KEY,
    notes:
      "Recorded for the editorial gate: this page's prose, sources and fee-rule mapping were checked against the schedule published by City of Annapolis during the research pass that produced this seed; the seed's content tests assert the arithmetic. No amount on this page is estimated.",
  },
  {
    entityType: "permit_page",
    entityKey: "plumbing-permit-fees",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: ANNAPOLIS_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: ANNAPOLIS_FY26_KEY,
    notes:
      "Recorded for the editorial gate: this page's prose, sources and fee-rule mapping were checked against the schedule published by City of Annapolis during the research pass that produced this seed; the seed's content tests assert the arithmetic. No amount on this page is estimated.",
  },
];

export const annapolisSeed: JurisdictionSeed = {
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
export const ANNAPOLIS_PUBLISHED_PERMIT_PAGES = annapolisSeed.permitPages.filter(
  (page) => page.publishStatus === "published" && !page.noindex,
);
