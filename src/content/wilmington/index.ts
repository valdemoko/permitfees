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
  WILMINGTON_BUILDING_RULES,
  WILMINGTON_ELECTRICAL_RULES,
  WILMINGTON_FEE_EFFECTIVE_FROM,
  WILMINGTON_LI_KEY,
  WILMINGTON_PLUMBING_RULES,
} from "./fee-rules";

export * from "./fee-rules";

/**
 * The complete Wilmington, Delaware seed payload.
 *
 * Every figure traces to research/delaware/wilmington.md, which traces to the
 * City's own "Approved L & I Fee Increases" page (Department of Licenses &
 * Inspections), read from the City's URL via its Internet Archive capture of
 * 2026-06-09 because the live host serves HTTP 403 to scripts. The schedule is
 * the last fee schedule the City has published in an addressable form, dated
 * "Effective June 1, 2014", and the research record says so plainly.
 */

const RESEARCHER = "Permit Fee Intelligence research pass (Delaware)";

export const WILMINGTON_LAST_VERIFIED = "2026-09-26";

export const WILMINGTON_KEYS = {
  state: "de",
  county: "new-castle",
  jurisdiction: "wilmington",
  feeSchedule: "wilmington-li-fee-schedule",
} as const;

const state: SeedState = {
  code: "DE",
  slug: "delaware",
  name: "Delaware",
  fipsCode: "10",
};

const county: SeedCounty = {
  key: WILMINGTON_KEYS.county,
  slug: "new-castle",
  name: "New Castle County",
  fipsCode: "10003",
};

const jurisdiction: SeedJurisdiction = {
  key: WILMINGTON_KEYS.jurisdiction,
  stateKey: WILMINGTON_KEYS.state,
  countyKey: WILMINGTON_KEYS.county,
  type: "city",
  slug: "wilmington",
  name: "Wilmington",
  officialName: "City of Wilmington, Delaware",
  websiteUrl: "https://www.wilmingtonde.gov/",
  permitPortalUrl:
    "https://www.wilmingtonde.gov/government/city-departments/department-of-licenses-and-inspections",
  timezone: "America/New_York",
  isActive: true,
};

const departments: SeedDepartment[] = [
  {
    key: "wilmington-li",
    jurisdictionKey: WILMINGTON_KEYS.jurisdiction,
    kind: "building",
    name: "Department of Licenses & Inspections",
    phone: "(302) 576-2620",
    email: null,
    url:
      "https://www.wilmingtonde.gov/government/city-departments/department-of-licenses-and-inspections",
    addressLine: "Louis L. Redding City/County Building, 800 N. French Street, 3rd Floor, Wilmington, DE 19801",
    hours: "Monday through Friday, 8:30 a.m. to 4:30 p.m.",
    notes:
      "L&I issues building, electrical, plumbing and mechanical permits for the city and publishes the fee table this seed prices from. Contact numbers and hours are printed in the department's own page footer (Wilmington 311: dial 311 inside city limits, (302) 576-2620 outside).",
  },
];

const sources: SeedSource[] = [
  {
    key: WILMINGTON_LI_KEY,
    jurisdictionKey: WILMINGTON_KEYS.jurisdiction,
    title:
      'City of Wilmington, Department of Licenses & Inspections — "Approved L & I Fee Increases" (Effective June 1, 2014)',
    url:
      "https://www.wilmingtonde.gov/government/city-departments/department-of-licenses-and-inspections/approved-l-i-fee-increases",
    sourceType: "municipal_website",
    issuingAuthority: "City of Wilmington Department of Licenses & Inspections",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2014-06-01",
    effectiveFrom: WILMINGTON_FEE_EFFECTIVE_FROM,
    retrievedAt: WILMINGTON_LAST_VERIFIED,
    lastVerifiedAt: WILMINGTON_LAST_VERIFIED,
    notes:
      "Read 2026-09-26 from the City's own URL via its Internet Archive capture of 2026-06-09 (HTTP 200); the live host serves HTTP 403 to scripted requests and the capture is the same document. The page presents every fee in CURRENT FEE / NEW FEE columns dated 'Effective June 1, 2014'; this seed prices the NEW FEE column: permit fees $12.00 per $1,000.00 (from $10.00), plumbing $20.00 (from $10.00), electrical work $20.00 (from $10.00), heating, air conditioning, mechanical ventilation, fire suppression, alarm and refrigeration rows each $20.00. The page states the fees 'coincide with the approved and adopted International Code Council Building Codes'. No minimum fee appears anywhere on the page, and none is charged. This is the most recent fee schedule the City publishes in an addressable form; the department's Construction & Development Review page (read via the 2026-08-14 capture) links fee amounts only through a Step-by-Step Guide document that is itself not addressable HTML.",
  },
];

/** Empty on purpose: the permit types Wilmington uses already exist as shared rows. */
const permitTypes: JurisdictionSeed["permitTypes"] = [];
const projectTypes: JurisdictionSeed["projectTypes"] = [];

const jurisdictionPermitTypes: SeedJurisdictionPermitType[] = [
  {
    jurisdictionKey: WILMINGTON_KEYS.jurisdiction,
    permitTypeKey: "building",
    isAvailable: true,
    localName: "Building permit (L&I 'Permit fees')",
    officialUrl:
      "https://www.wilmingtonde.gov/government/city-departments/department-of-licenses-and-inspections/approved-l-i-fee-increases",
    notes:
      "The construction permit fee is $12.00 per $1,000.00 of cost — one rate at every valuation, with no bands, minimum or maximum printed on the schedule. Certificates of occupancy are separate rows: $75 for dwellings and two-family houses, $100 for all other buildings, $100 residential / $250 commercial for a temporary CO.",
  },
  {
    jurisdictionKey: WILMINGTON_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    isAvailable: true,
    localName: "Electrical work permit",
    officialUrl:
      "https://www.wilmingtonde.gov/government/city-departments/department-of-licenses-and-inspections/approved-l-i-fee-increases",
    notes:
      "'Electrical work' is a flat $20.00 — unlike the valuation-based permit row on the same table. A panel change and a full commercial fit-out's electrical permit carry the same printed fee.",
  },
  {
    jurisdictionKey: WILMINGTON_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    isAvailable: true,
    localName: "Plumbing permit",
    officialUrl:
      "https://www.wilmingtonde.gov/government/city-departments/department-of-licenses-and-inspections/approved-l-i-fee-increases",
    notes:
      "'Plumbing' is a flat $20.00 — not a per-fixture rate; the schedule publishes no fixture count and no valuation band for plumbing. Heating, air conditioning, mechanical ventilation, fire suppression, alarm and refrigeration rows carry the identical $20.00.",
  },
];

const feeSchedules: SeedFeeSchedule[] = [
  {
    key: WILMINGTON_KEYS.feeSchedule,
    jurisdictionKey: WILMINGTON_KEYS.jurisdiction,
    sourceKey: WILMINGTON_LI_KEY,
    title: "Wilmington L&I fee table — Effective June 1, 2014 (NEW FEE column)",
    officialUrl:
      "https://www.wilmingtonde.gov/government/city-departments/department-of-licenses-and-inspections/approved-l-i-fee-increases",
    effectiveFrom: WILMINGTON_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: WILMINGTON_LAST_VERIFIED,
    notes:
      "The effective date is the page's own heading. The table is an increase schedule (CURRENT -> NEW); the NEW FEE column is what the City charges and what this seed prices. Verified against the City's Internet Archive capture because the live host blocks scripted reads; both carry identical content.",
  },
];

function attach(permitTypeKey: string, rules: SeedFeeRule["rule"][]): SeedFeeRule[] {
  return rules.map((rule) => ({
    jurisdictionKey: WILMINGTON_KEYS.jurisdiction,
    permitTypeKey,
    scheduleKey: WILMINGTON_KEYS.feeSchedule,
    rule,
  }));
}

const feeRules: SeedFeeRule[] = [
  ...attach("building", WILMINGTON_BUILDING_RULES),
  ...attach("electrical", WILMINGTON_ELECTRICAL_RULES),
  ...attach("plumbing", WILMINGTON_PLUMBING_RULES),
];

const requirements: SeedRequirement[] = [
  {
    jurisdictionKey: WILMINGTON_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "Cost of the work is the permit's only measure",
    description:
      "The L&I table prices 'Permit fees' at $12.00 per $1,000.00, with no bands and no stated valuation floor, so the declared cost of the work scales the whole fee linearly: every additional $1,000 of declared cost adds exactly $12.00.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: WILMINGTON_LI_KEY,
    lastVerifiedAt: WILMINGTON_LAST_VERIFIED,
  },
  {
    jurisdictionKey: WILMINGTON_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "other",
    title: "Permits required for electrical, plumbing and mechanical work",
    description:
      "The City's Construction & Development Review page requires permits for new structures, changes to existing structures including demolition, and repairs 'including electrical, plumbing, and mechanical work'. Each trade is its own permit and its own $20.00 row on the L&I table.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: WILMINGTON_LI_KEY,
    lastVerifiedAt: WILMINGTON_LAST_VERIFIED,
  },
];

const profile: SeedProfile = {
  jurisdictionKey: WILMINGTON_KEYS.jurisdiction,
  headline: "What building permits cost in Wilmington",
  summary:
    "Wilmington prices its construction permit at **$12.00 per $1,000.00** of cost — one rate at every valuation, with no bands and no published minimum. Each trade permit is flat: **$20.00** for electrical work and **$20.00** for plumbing, the same figure the schedule prints for heating, air conditioning, mechanical ventilation, fire suppression, alarm and refrigeration permits. Certificates of occupancy are separate: **$75** for a dwelling, **$100** for other buildings, and a temporary CO runs **$100** residential / **$250** commercial.",
  localContext:
    "Wilmington's permit fees live on one page maintained by the Department of Licenses & Inspections, whose fee table states in its own header that the amounts 'coincide with the approved and adopted International Code Council Building Codes'. The table is an increase schedule — every row printed in CURRENT FEE and NEW FEE columns, 'Effective June 1, 2014' — and the NEW FEE column is what the City charges: permit fees rose from $10 to $12 per $1,000, and each trade permit doubled from $10 to $20.\n\nThe schedule's simplicity is its most useful fact: there is one valuation rate and a handful of flat trade fees, no bands to misread and no minimum printed anywhere on the page. A $60,000 addition costs exactly 60 times what a $1,000 repair costs on the permit row.\n\nTwo things a cost-estimator should know sit outside the table. Certificates of occupancy and compliance are their own schedule on the same page — $75 for dwellings and two-family houses, $100 for all other buildings and new commercial construction, $50 for a certificate of compliance, and temporary COs at $100 residential and $250 commercial. And the Fire Marshal's office prices fire-protection plan review separately: a $200 minimum on all plans, rising by $5.00 for every $1,000 of construction cost above $1,000,000.",
  valuationBasis:
    "The declared **cost of the work**, at a single published rate: $12.00 for each $1,000.00, with the trade permits flat at $20.00 regardless of the job's size. The schedule publishes no valuation bands, no square-foot rows and no minimum fee; nothing on the L&I table derives from area, volume or fixture counts.",
  notIncluded:
    "These figures are Wilmington's building, electrical and plumbing permit fees from the L&I table. They exclude:\n\n- **Certificates of occupancy and compliance** on the same page: $75 for dwellings and two-family houses, $75 for private accessory buildings, $100 for all other buildings and new commercial construction or alterations, $100 for a change of occupancy, $50 for a certificate of compliance, $15->$50 duplicates, and temporary COs at $100 residential / $250 commercial.\n- **Fire protection plan review** (Fire Marshal's Office): a $200 minimum on all plans, plus $5.00 for every $1,000 of construction cost above $1,000,000.\n- **Elevator and moving-stairway certificates of registration** at $50 each on the same page.\n- **Annual license permits** for theaters, assembly halls and similar occupancies, each a separate row.\n- **Water, sewer and stormwater charges** billed by the City's water utility, and any Public Works sewer permit, which are separate bills from the L&I permit.\n- **State of Delaware licences** — a contractor's state registration is not a City fee.",
  seoTitle: "Wilmington building permit fees",
  seoDescription:
    "How Wilmington, Delaware prices building, electrical and plumbing permits — $12 per $1,000 of cost for construction, flat $20 trade permits, from the City's L&I fee table.",
  publishStatus: "published",
  noindex: false,
  lastReviewedAt: WILMINGTON_LAST_VERIFIED,
};

const permitPages: SeedPermitPage[] = [
  {
    jurisdictionKey: WILMINGTON_KEYS.jurisdiction,
    permitTypeKey: "building",
    slug: "building-permit-fees",
    seoTitle: "Wilmington building permit fees",
    seoDescription:
      "Wilmington, Delaware building permit fees — $12.00 per $1,000.00 of cost, flat $20 trade permits, and certificate of occupancy amounts from the City's L&I fee table.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: WILMINGTON_LAST_VERIFIED,
    title: "Wilmington building permit fees",
    intro:
      "A Wilmington building permit costs **$12.00 per $1,000.00** of the work's cost — one rate at every valuation. There are no bands to fall between and no published minimum: the Department of Licenses & Inspections fee table prices 'Permit fees' at a single rate, and each trade permit beside it is flat at **$20.00**. Certificates of occupancy are a separate schedule on the same page, from **$75** for a dwelling to **$250** for a temporary commercial CO.",
    localSummary:
      "The rate is the whole mechanism. 'Permit fees — $12.00 per $1,000.00' is the only row on the L&I table expressed as a rate; every other construction-adjacent row is a flat amount. The fee scales linearly with the declared cost of the work: $1,200.00 at $100,000, $12,000.00 at $1,000,000, every additional thousand of declared cost worth exactly $12.00. A round-number cost estimate makes the fee easy to predict before applying, which is not true in the band-table cities this dataset also covers.\n\nThe trade rows read differently, and the distinction matters when budgeting: plumbing, electrical work, heating installation, air conditioning, mechanical ventilation, fire suppression, alarm systems and refrigeration equipment are each a **flat $20.00**, independent of the job's size. The 2014 increase schedule doubled all of them from $10.00 at once and raised the permit rate from $10.00 to $12.00 per $1,000 — so the building fee is value-sensitive while the trade fees are not, a two-speed structure the page preserves to this day.\n\nThe certificates schedule rides on the same page. A certificate of occupancy for a dwelling or two-family house is $75.00, for a private accessory building $75.00, and for all other buildings $100.00 — the same $100.00 that applies to new commercial construction or alterations, a change of occupancy, and a certificate requested by an owner. A temporary certificate of occupancy is $100.00 residential and $250.00 commercial, and a duplicate certificate is $50.00.\n\nThe Fire Marshal's plan review is the one surcharge a large project must budget separately: a minimum of $200.00 on all plans, plus $5.00 for every $1,000 of construction cost above $1,000,000. It is a fire-protection review charge rather than an L&I permit fee, and it is not folded into the calculator here.",
    notIncluded:
      "This is the L&I 'Permit fees' row and the certificate schedule beside it. It excludes:\n\n- **Trade permits** — electrical work and plumbing at $20.00 each, which have their own pages here, and the mechanical rows (heating installation, air conditioning system, mechanical ventilation, fire suppression, alarm system, refrigeration equipment) at the same $20.00 each.\n- **Fire protection plan review** (Fire Marshal's Office): $200 minimum on all plans, plus $5.00 per $1,000 of construction cost above $1,000,000.\n- **Elevator certificates of registration** at $50.00 each, and annual licence permits for theaters and assembly halls.\n- **Water, sewer and stormwater bills** from the City's utility, and Public Works sewer permits, which are separate from the L&I permit.\n- **Any minimum fee** — the L&I table publishes none, so none is charged here.",
    workedExample: {
      scenario:
        "A single-family addition and kitchen enlargement in Wilmington declared at a construction cost of $60,000, with the electrical and plumbing work on the same project pulled as their own trade permits.",
      inputs: {
        occupancy: "residential",
        valuationCents: 6_000_000,
      },
      notes:
        "The permit row charges $12.00 per $1,000.00: 60 thousands x $12.00 = **$720.00**.\n\nThe electrical permit adds a flat **$20.00** and the plumbing permit a flat **$20.00** — the trade rows do not scale with the job.\n\nTotal for the three permits: $720.00 + $20.00 + $20.00 = **$760.00**, plus the certificate of occupancy for the altered dwelling ($75.00) when the work is finished. The same project declared at $120,000 would double the permit row to $1,440.00 and leave the trade fees untouched.",
    },
    faqs: [
      {
        question: "How much is a building permit in Wilmington, Delaware?",
        answer:
          "$12.00 per $1,000.00 of the work's cost. A $60,000 project is $720.00; a $150,000 project is $1,800.00. The rate is flat at every valuation — the schedule has no bands and publishes no minimum fee.",
      },
      {
        question: "Is there a minimum building permit fee?",
        answer:
          "The L&I fee table publishes no minimum. At the $12.00-per-$1,000 rate even the smallest permits charge by value; there is no floor printed anywhere on the page.",
      },
      {
        question: "How much are trade permits?",
        answer:
          "Flat $20.00 each — the same amount for electrical work, plumbing, heating installation, air conditioning, mechanical ventilation, fire suppression, alarm systems and refrigeration equipment. They do not scale with the job's cost.",
      },
      {
        question: "Did the fees change recently?",
        answer:
          "The fee table in force is the City's 'Approved L & I Fee Increases' schedule, effective June 1, 2014: permit fees rose from $10.00 to $12.00 per $1,000, and every trade permit doubled from $10.00 to $20.00. It is the most recent schedule the City publishes in an addressable form.",
      },
      {
        question: "How much is a certificate of occupancy?",
        answer:
          "$75.00 for a dwelling or two-family house and for a private accessory building, $100.00 for all other buildings, for new commercial construction or alterations, for a change of occupancy, and for a certificate requested by the owner. A temporary CO is $100.00 residential and $250.00 commercial.",
      },
      {
        question: "What does fire protection plan review cost?",
        answer:
          "The Fire Marshal's Office charges a $200.00 minimum on all plans, plus $5.00 for every $1,000 of construction cost above $1,000,000. It is a separate review charge from the L&I permit fee.",
      },
      {
        question: "Is the electrical permit included in the building permit?",
        answer:
          "No. Each trade is its own permit and its own row: electrical work $20.00, plumbing $20.00, and the mechanical rows $20.00 each, all charged in addition to the $12.00-per-$1,000 construction permit.",
      },
      {
        question: "How is the cost of the work determined?",
        answer:
          "The fee scales with the declared construction cost in thousands. The schedule prints no valuation-validation rule; declaring the real cost matters because every additional $1,000 declared adds exactly $12.00 to the permit.",
      },
      {
        question: "What does an elevator certificate cost?",
        answer:
          "A certificate of registration for an elevator or a moving stairway is $50.00 each, and a duplicate certificate is $25.00 — separate rows from the permit table.",
      },
      {
        question: "Where do I apply?",
        answer:
          "At the Department of Licenses & Inspections, Louis L. Redding City/County Building, 800 N. French Street, 3rd Floor — open weekdays 8:30 a.m. to 4:30 p.m., with Wilmington 311 at (302) 576-2620 for intake outside the city's phone exchange.",
      },
      {
        question: "Do fees double if I start without a permit?",
        answer:
          "The L&I page publishes no doubling clause; that consequence is not part of the fee table this page prices. What the schedule does publish is the certificate and trade structure above, all of which are charged whether or not the work was permitted on time.",
      },
      {
        question: "Are the fees the same for commercial work?",
        answer:
          "Yes on the permit row: $12.00 per $1,000.00 at every valuation, residential or commercial, and the trade permits are $20.00 flat either way. The certificate schedule is where the two diverge — $75.00 for a dwelling versus $100.00 for other buildings, and $100.00 versus $250.00 for a temporary CO.",
      },
    ],
  },
  {
    jurisdictionKey: WILMINGTON_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    slug: "electrical-permit-fees",
    seoTitle: "Wilmington electrical permit fees",
    seoDescription:
      "Wilmington, Delaware electrical permit fees — a flat $20.00 per electrical work permit from the City's L&I fee table, independent of the job's size.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: WILMINGTON_LAST_VERIFIED,
    title: "Wilmington electrical permit fees",
    intro:
      "An electrical work permit in Wilmington costs **$20.00 flat**. The L&I fee table prices 'Electrical work' as a single amount — not a rate on the job's cost, not a per-circuit charge, and not a service-size band — so a panel swap and a whole-house rewiring carry the same printed fee. It is one of eight trade rows on the table, all at the identical $20.00.",
    localSummary:
      "The row's flatness is the finding. On the same table, 'Permit fees' — the construction permit — is priced at $12.00 per $1,000.00 of cost, so the building side of a project scales with value. 'Electrical work' does not: $20.00 whether the job is a single circuit or a commercial service upgrade. The 2014 increase schedule is where the current figure comes from — the row doubled from $10.00 to $20.00 in the same revision that raised the permit rate.\n\nWhat the row covers follows the City's own permit requirement: the Construction & Development Review page requires permits for 'repairs, including electrical, plumbing, and mechanical work', so the electrical permit is its own application even when it rides on a larger project. There is no published per-fixture, per-circuit or per-ampere schedule in the City's fee table — no row to read one from.\n\nThe certificates schedule on the same page matters to electrical contractors who commission buildings: a certificate of occupancy for all other buildings is $100.00, a temporary commercial CO is $250.00, and an elevator certificate of registration is $50.00. Those are the amounts that attach to finishing a building, and none of them ride the electrical permit row.",
    notIncluded:
      "This is the L&I 'Electrical work' row at $20.00 flat. It excludes:\n\n- **The construction permit** for the building the electrical work belongs to, priced at $12.00 per $1,000.00 on the building page here.\n- **Fire alarm systems**, which the table prices under their own row at $20.00 — a fire-suppression-adjacent permit rather than the electrical row.\n- **Certificates of occupancy and compliance** on the same page: $75-$100 by building type, temporary COs at $100 residential / $250 commercial, and $50 certificates of compliance.\n- **Fire protection plan review** (Fire Marshal's Office): $200 minimum on all plans plus $5.00 per $1,000 above $1,000,000 of construction cost.\n- **Any minimum fee, band or per-unit rate** — the table publishes none for electrical work, and none is charged.",
    workedExample: {
      scenario:
        "A residential service panel upgrade with two new kitchen circuits, permitted as electrical work on its own.",
      inputs: {
        occupancy: "residential",
      },
      notes:
        "The 'Electrical work' row charges a flat **$20.00** — the schedule publishes no per-circuit or per-ampere amount, so the panel and the two circuits together are one $20.00 permit.\n\nIf the same job were declared with a construction cost (say a $6,000 scope), the building-style rate would have been $72.00 — the flat row is the cheaper route the City itself prints for trade work. A plumbing permit on the same job would add a second flat $20.00.",
    },
    faqs: [
      {
        question: "How much is an electrical permit in Wilmington?",
        answer:
          "$20.00 flat. The L&I fee table prices 'Electrical work' as a single amount with no valuation band, no per-circuit rate and no minimum.",
      },
      {
        question: "Does a bigger electrical job cost more?",
        answer:
          "Not on the printed table. Whether the work is a lamp circuit or a service upgrade, the 'Electrical work' row is $20.00 — the valuation-based $12.00-per-$1,000 rate belongs to the construction permit, not to the trade rows.",
      },
      {
        question: "Is a fire alarm permit the same thing?",
        answer:
          "No — the table prices 'Alarm system' under its own row, also $20.00. A fire alarm installation is that permit, not the electrical work permit.",
      },
      {
        question: "Do I need a separate electrical permit for repair work?",
        answer:
          "Yes — the City requires permits for 'repairs, including electrical, plumbing, and mechanical work', so electrical repairs are permitted and charged under the trade row rather than folded into a building permit.",
      },
      {
        question: "When did the fee last change?",
        answer:
          "The current $20.00 comes from the City's approved increase schedule effective June 1, 2014, which doubled the row from $10.00. It is the latest amount the City publishes in an addressable form.",
      },
      {
        question: "Is there a minimum or maximum?",
        answer:
          "None is published. The row is a single flat amount, so there is nothing to floor or cap.",
      },
      {
        question: "How many trade permits does a typical remodel need?",
        answer:
          "One per trade touched: electrical work $20.00, plumbing $20.00, and $20.00 each for heating, air conditioning or ventilation rows if those trades are involved — plus the construction permit itself at $12.00 per $1,000 of cost.",
      },
      {
        question: "What about solar panels or generators?",
        answer:
          "The table publishes no dedicated photovoltaic or generator row; such work falls under the general 'Electrical work' permit at $20.00 unless the City issues new schedule language.",
      },
      {
        question: "Do subcontractors pull their own permits?",
        answer:
          "The table prices each trade as its own permit, so the electrical contractor files the electrical permit and pays its $20.00 — the construction permit holder does not absorb the trade rows.",
      },
      {
        question: "What does a reinspection cost?",
        answer:
          "The L&I fee table publishes no reinspection amount for electrical work; inspection-related charges beyond the permit rows are not part of the printed schedule this page prices.",
      },
    ],
  },
  {
    jurisdictionKey: WILMINGTON_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    slug: "plumbing-permit-fees",
    seoTitle: "Wilmington plumbing permit fees",
    seoDescription:
      "Wilmington, Delaware plumbing permit fees — a flat $20.00 per plumbing permit from the City's L&I fee table, with no per-fixture charge.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: WILMINGTON_LAST_VERIFIED,
    title: "Wilmington plumbing permit fees",
    intro:
      "A plumbing permit in Wilmington costs **$20.00 flat**. The L&I fee table prices 'Plumbing' as one amount — not per fixture and not by valuation — so a water-heater swap and a whole-house repipe carry the same printed fee. The identical $20.00 sits beside it for heating, air conditioning and ventilation, which makes the City's trade side a flat-fee schedule in contrast to its value-scaled construction permit.",
    localSummary:
      "The plumbing row's structure is the opposite of the construction permit's. The building permit scales at $12.00 per $1,000.00 of cost; 'Plumbing' is $20.00 at any size. The schedule publishes no fixture count, no per-fixture rate and no valuation band for plumbing — there is no row a per-fixture figure could be read from, and none has been printed since the 2014 increase doubled the row from $10.00.\n\nThe mechanical rows bracket plumbing on the same table and read the same way: heating installation $20.00, air conditioning system $20.00, mechanical ventilation $20.00, fire suppression $20.00, alarm system $20.00, refrigeration equipment $20.00. A whole-house mechanical-and-plumbing retrofit therefore adds a predictable $20.00 per trade to the budget regardless of scope.\n\nWhere the plumbing trade does meet value-sensitive pricing is the construction permit the work usually rides on: if the plumbing is part of a $60,000 remodel, the construction permit on that remodel is charged at $12.00 per $1,000 on the building page here, and the plumbing permit adds its flat $20.00 on top. Sewer and water utility charges are a separate City bill entirely, set by the water utility rather than the L&I table.",
    notIncluded:
      "This is the L&I 'Plumbing' row at $20.00 flat. It excludes:\n\n- **The construction permit** for the project the plumbing belongs to, at $12.00 per $1,000.00 — charged on the building page here.\n- **Heating, air conditioning and ventilation permits** at $20.00 each, and **fire suppression** and **alarm system** rows at $20.00 each.\n- **Sewer permits and water/sewer/stormwater utility charges**, which are Public Works and water-utility bills, not L&I permit fees.\n- **Certificates of occupancy and compliance** on the same page, from $50.00 to $250.00 by type.\n- **Any per-fixture rate, valuation band or minimum fee** — the table publishes none for plumbing, and none is charged.",
    workedExample: {
      scenario:
        "A bathroom remodel adding three fixtures plus a water heater, permitted as plumbing on its own in a single-family dwelling.",
      inputs: {
        occupancy: "residential",
        fixtures: 3,
      },
      notes:
        "The 'Plumbing' row charges a flat **$20.00** — the schedule publishes no per-fixture amount, so the three fixtures and the water heater are one $20.00 permit.\n\nContrast the band-table cities: a $3,000 standalone plumbing job declared as construction would price at $36.00 on the valuation rate, but the City's own printed plumbing row is $20.00 regardless. If the same remodel were part of a larger $60,000 project, the construction permit would add $720.00 on the building page and the plumbing permit would remain $20.00.",
    },
    faqs: [
      {
        question: "How much is a plumbing permit in Wilmington?",
        answer:
          "$20.00 flat. The L&I fee table prices 'Plumbing' as a single amount — no per-fixture rate, no valuation band, and no published minimum.",
      },
      {
        question: "Is there a per-fixture charge?",
        answer:
          "No. The table publishes one amount for the permit. A one-fixture job and a twelve-fixture job print the same $20.00 plumbing permit.",
      },
      {
        question: "Does the plumbing permit scale with the project's cost?",
        answer:
          "No — only the construction permit does, at $12.00 per $1,000.00. The plumbing row is flat at any job size.",
      },
      {
        question: "What about a water heater replacement?",
        answer:
          "It is a plumbing permit at the same flat $20.00. The table publishes no separate water-heater row.",
      },
      {
        question: "Is a sewer connection part of the plumbing permit?",
        answer:
          "No — sewer permits and the water, sewer and stormwater utility charges are Public Works and water-utility bills, separate from the L&I plumbing permit.",
      },
      {
        question: "When did the fee last change?",
        answer:
          "The current $20.00 is from the City's approved increase schedule effective June 1, 2014, which doubled plumbing from $10.00. It is the latest amount the City publishes in an addressable form.",
      },
      {
        question: "How does a commercial plumbing job get priced?",
        answer:
          "The same $20.00 flat. The table makes no residential/commercial distinction on any trade row; only the certificate of occupancy schedule differs by building type.",
      },
      {
        question: "Do I need a plumbing permit for repairs?",
        answer:
          "Yes — the City requires permits for 'repairs, including electrical, plumbing, and mechanical work', so plumbing repairs are permitted under the trade row.",
      },
      {
        question: "What other fees attach to finishing the work?",
        answer:
          "The certificate of occupancy: $75.00 for a dwelling, $100.00 for other buildings, and $100.00 residential / $250.00 commercial for a temporary CO — all on the same L&I page.",
      },
      {
        question: "Can the plumbing permit ride on the general contractor's building permit?",
        answer:
          "The table prices the trade as its own permit, so the plumbing permit is its own $20.00 application rather than a percentage or line item of the construction permit.",
      },
    ],
  },
];

const verifications: SeedVerification[] = [
  {
    entityType: "source",
    entityKey: WILMINGTON_LI_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: WILMINGTON_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: WILMINGTON_LI_KEY,
    notes:
      "Read 2026-09-26. The live City host serves HTTP 403 to scripted requests, so the City's own URL was read through its Internet Archive capture of 2026-06-09 (HTTP 200, same document). The CURRENT/NEW fee columns and the 'Effective June 1, 2014' heading were transcribed from that capture; the Fire Marshal plan-review page and the Construction & Development Review page were read the same way (capture 2026-08-14) for context amounts that are named rather than modelled.",
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-PER-1000",
    permitTypeKey: "building",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: WILMINGTON_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: WILMINGTON_LI_KEY,
    notes:
      "'Permit fees — $12.00 per $1,000.00' (NEW FEE column). The only rate row on the table; no bands, minimum or maximum printed anywhere on the page.",
  },
  {
    entityType: "fee_rule",
    entityKey: "ELEC-FLAT",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: WILMINGTON_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: WILMINGTON_LI_KEY,
    notes:
      "'Electrical work — $20.00' (NEW FEE column, doubled from $10.00). Flat amount, not a rate; modelled as such.",
  },
  {
    entityType: "fee_rule",
    entityKey: "PLUMB-FLAT",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: WILMINGTON_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: WILMINGTON_LI_KEY,
    notes:
      "'Plumbing — $20.00' (NEW FEE column, doubled from $10.00). Flat amount; no per-fixture row exists on the schedule.",
  },
  {
    entityType: "jurisdiction_profile",
    entityKey: WILMINGTON_KEYS.jurisdiction,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: WILMINGTON_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: WILMINGTON_LI_KEY,
    notes:
      "Profile built from the L&I fee page in full: the permit rate, the eight flat trade rows, the certificate schedule and the Fire Marshal plan-review minimum, with the 2014 dating of the schedule stated on the record rather than presented as current-year policy.",
  },
  {
    entityType: "permit_page",
    entityKey: "building-permit-fees",
    permitTypeKey: "building",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: WILMINGTON_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: WILMINGTON_LI_KEY,
    notes:
      "Recorded for the editorial gate: this page's prose, sources and fee-rule mapping were checked against the schedule published by City of Wilmington, Delaware during the research pass that produced this seed; the seed's content tests assert the arithmetic. No amount on this page is estimated.",
  },
  {
    entityType: "permit_page",
    entityKey: "electrical-permit-fees",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: WILMINGTON_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: WILMINGTON_LI_KEY,
    notes:
      "Recorded for the editorial gate: this page's prose, sources and fee-rule mapping were checked against the schedule published by City of Wilmington, Delaware during the research pass that produced this seed; the seed's content tests assert the arithmetic. No amount on this page is estimated.",
  },
  {
    entityType: "permit_page",
    entityKey: "plumbing-permit-fees",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: WILMINGTON_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: WILMINGTON_LI_KEY,
    notes:
      "Recorded for the editorial gate: this page's prose, sources and fee-rule mapping were checked against the schedule published by City of Wilmington, Delaware during the research pass that produced this seed; the seed's content tests assert the arithmetic. No amount on this page is estimated.",
  },
];

export const wilmingtonSeed: JurisdictionSeed = {
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
export const WILMINGTON_PUBLISHED_PERMIT_PAGES = wilmingtonSeed.permitPages.filter(
  (page) => page.publishStatus === "published" && !page.noindex,
);
