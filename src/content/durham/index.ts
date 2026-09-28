import type { JurisdictionSeed } from "@/content/seed-types";
import {
  DUR_BUILDING_RULES,
  DUR_BUILDING_SOURCE_KEY,
  DUR_ELECTRICAL_RULES,
  DUR_ELECTRICAL_SOURCE_KEY,
  DUR_FEE_EFFECTIVE_FROM,
  DUR_FEE_INDEX_SOURCE_KEY,
  DUR_MECHANICAL_SOURCE_KEY,
  DUR_PLUMBING_RULES,
  DUR_PLUMBING_SOURCE_KEY,
} from "@/content/durham/fee-rules";

/**
 * Durham, North Carolina — the City and the County under one department and one set of
 * schedules, and the jurisdiction whose technology surcharge is already inside every
 * number on the page.
 *
 * Everything here is priced from four PDFs the City publishes from its own Fee Schedules
 * page, each headed `(Effective 7/1/18--Includes Technology Surcharge)`. The effective
 * date is read from that header rather than inferred, which is why the payload's
 * `effectiveFrom` is eight years older than its `lastVerifiedAt`: a schedule that is old
 * and still published is still the schedule, and saying so is more useful to a reader
 * than dating it as though it had been reissued.
 */

export const DUR_LAST_VERIFIED = "2026-09-25";

export const DUR_KEYS = {
  state: "nc",
  county: "durham-county",
  jurisdiction: "durham",
  building: DUR_BUILDING_SOURCE_KEY,
  electrical: DUR_ELECTRICAL_SOURCE_KEY,
  plumbing: DUR_PLUMBING_SOURCE_KEY,
} as const;

const RESEARCHER = "Permit Fee Intelligence research pass 15 (North Carolina)";

const state = {
  code: "NC",
  slug: "north-carolina",
  name: "North Carolina",
  fipsCode: "37",
};

const county = {
  key: DUR_KEYS.county,
  slug: "durham-county",
  name: "Durham County",
  fipsCode: "37063",
};

const BUILDING_URL =
  "https://www.durhamnc.gov/DocumentCenter/View/2706/Building-Permits-PDF";
const ELECTRICAL_URL =
  "https://www.durhamnc.gov/DocumentCenter/View/1008/Electrical-Permits-PDF";
const PLUMBING_URL =
  "https://www.durhamnc.gov/DocumentCenter/View/1010/Plumbing-Permits-PDF";
const MECHANICAL_URL =
  "https://www.durhamnc.gov/DocumentCenter/View/1009/Mechanical-Permits-PDF";
const FEE_INDEX_URL = "https://www.durhamnc.gov/302/Fee-Schedules";

export const durhamSeed: JurisdictionSeed = {
  state,
  county,

  jurisdiction: {
    key: DUR_KEYS.jurisdiction,
    stateKey: DUR_KEYS.state,
    countyKey: DUR_KEYS.county,
    type: "city",
    slug: "durham",
    name: "Durham",
    officialName: "City of Durham / Durham County — City-County Building & Safety Department",
    websiteUrl: "https://www.durhamnc.gov/293",
    permitPortalUrl: "https://www.durhamnc.gov/467/Dplans",
    timezone: "America/New_York",
    isActive: true,
  },

  departments: [
    {
      key: "durham-city-county-building-and-safety",
      jurisdictionKey: DUR_KEYS.jurisdiction,
      kind: "building",
      name: "City-County Building & Safety Department",
      phone: "919-560-1200",
      email: null,
      url: "https://www.durhamnc.gov/293",
      addressLine: "101 City Hall Plaza, Durham, NC 27701",
      hours: null,
      notes:
        'The department states its own scope in one sentence: "The City-County Building & Safety Department provides permit, plan review, and inspection services for the City and County of Durham … through administration and enforcement of the North Carolina State Building Code and the zoning ordinances for both the City and County." One authority therefore covers the incorporated city and the unincorporated county, which is why this payload has no second jurisdiction beside it — the counterpart of Wake County, which sits beside Raleigh as a separate authority with its own fee schedule.',
    },
  ],

  sources: [
    {
      key: DUR_BUILDING_SOURCE_KEY,
      jurisdictionKey: DUR_KEYS.jurisdiction,
      title: "Durham City-County Building & Safety Department — Building Permit Fee Schedule",
      url: BUILDING_URL,
      sourceType: "fee_schedule_pdf",
      issuingAuthority: "Durham City-County Building & Safety Department",
      authorityKind: "city",
      isPrimary: true,
      documentDate: "2018-07-01",
      effectiveFrom: DUR_FEE_EFFECTIVE_FROM,
      retrievedAt: DUR_LAST_VERIFIED,
      lastVerifiedAt: DUR_LAST_VERIFIED,
      notes:
        'Read 2026-09-25, 1,127,925 bytes, sha256 beginning `84dc8a02035d810f`, linked from the City\'s Fee Schedules page. Five pages, Schedules A through I. Its own header states `(Effective 7/1/18--Includes Technology Surcharge)`, which is where both the effective date and the absence of a separate surcharge rule come from. Extracted with `pdftotext -raw` and re-read with `-layout`, because Schedule C and Schedule D print their plan review column out of line with the permit column and only the layout pass shows which amount belongs to which.',
    },
    {
      key: DUR_ELECTRICAL_SOURCE_KEY,
      jurisdictionKey: DUR_KEYS.jurisdiction,
      title: "Durham City-County Building & Safety Department — Electrical Permit Fee Schedule",
      url: ELECTRICAL_URL,
      sourceType: "fee_schedule_pdf",
      issuingAuthority: "Durham City-County Building & Safety Department",
      authorityKind: "city",
      isPrimary: true,
      documentDate: "2018-07-01",
      effectiveFrom: DUR_FEE_EFFECTIVE_FROM,
      retrievedAt: DUR_LAST_VERIFIED,
      lastVerifiedAt: DUR_LAST_VERIFIED,
      notes:
        "Read 2026-09-25, 1,084,801 bytes, sha256 beginning `10763b17d1426cc4`. Four pages, Schedules A to H, plus the paper-application surcharge notice that heads every trade schedule. The three floors — $65.00 minimum permit, $100.00 residential and $150.00 commercial for a permit requiring a rough-in inspection — are all on this document, and they are stated per permit rather than per row.",
    },
    {
      key: DUR_PLUMBING_SOURCE_KEY,
      jurisdictionKey: DUR_KEYS.jurisdiction,
      title: "Durham City-County Building & Safety Department — Plumbing Permit Fee Schedule",
      url: PLUMBING_URL,
      sourceType: "fee_schedule_pdf",
      issuingAuthority: "Durham City-County Building & Safety Department",
      authorityKind: "city",
      isPrimary: true,
      documentDate: "2018-07-01",
      effectiveFrom: DUR_FEE_EFFECTIVE_FROM,
      retrievedAt: DUR_LAST_VERIFIED,
      lastVerifiedAt: DUR_LAST_VERIFIED,
      notes:
        "Read 2026-09-25, 1,060,919 bytes, sha256 beginning `fc4f685508fa5b60`. Three pages, Schedules A to G plus two notes. Note 1 is about inspector trips, not fees; the second note defines the schedule's own three Type Application options — New Construction, Addition, Replacement — which is the vocabulary the plumbing page asks a reader to choose from.",
    },
    {
      key: DUR_MECHANICAL_SOURCE_KEY,
      jurisdictionKey: DUR_KEYS.jurisdiction,
      title: "Durham City-County Building & Safety Department — Mechanical Permit Fee Schedule",
      url: MECHANICAL_URL,
      sourceType: "fee_schedule_pdf",
      issuingAuthority: "Durham City-County Building & Safety Department",
      authorityKind: "city",
      isPrimary: true,
      documentDate: "2018-07-01",
      effectiveFrom: DUR_FEE_EFFECTIVE_FROM,
      retrievedAt: DUR_LAST_VERIFIED,
      lastVerifiedAt: DUR_LAST_VERIFIED,
      notes:
        "Read 2026-09-25, 1,060,244 bytes, sha256 beginning `cc11b8ca62d5f703`. Published beside the other three and cited here for completeness. **No page of this site prices a mechanical permit in any jurisdiction**, so this source is named on Durham's pages as the schedule that exists and is not computed, rather than left out as though it did not exist.",
    },
    {
      key: DUR_FEE_INDEX_SOURCE_KEY,
      jurisdictionKey: DUR_KEYS.jurisdiction,
      title: "City of Durham — Fee Schedules",
      url: FEE_INDEX_URL,
      sourceType: "municipal_website",
      issuingAuthority: "City of Durham",
      authorityKind: "city",
      isPrimary: true,
      documentDate: null,
      effectiveFrom: null,
      retrievedAt: DUR_LAST_VERIFIED,
      lastVerifiedAt: DUR_LAST_VERIFIED,
      notes:
        "Read 2026-09-25. The page that publishes the four permit schedules above and nothing else besides the City Impact Fee Ordinance — which is why the four PDFs can be called the City's current schedules: they are the ones this index links on the day the research was done.",
    },
  ],

  /** Empty on purpose: the permit types this jurisdiction uses already exist. */
  permitTypes: [],
  projectTypes: [],

  jurisdictionPermitTypes: [
    {
      jurisdictionKey: DUR_KEYS.jurisdiction,
      permitTypeKey: "building",
      isAvailable: true,
      localName: "Building permit",
      officialUrl: null,
      notes:
        "Priced from **gross area** for a new one- or two-family dwelling (eight brackets, $146.00 to $810.00) and from **construction contract value** for renovations, additions and nonresidential work — the latter in five bands carrying a per-thousand increment. Multi-family is priced per dwelling unit and accessory buildings are flat. Every schedule that prints a plan review column is charged for that column as well, because the schedule says the plan review fee is paid at submittal.",
    },
    {
      jurisdictionKey: DUR_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      isAvailable: true,
      localName: "Electrical permit",
      officialUrl: null,
      notes:
        "Priced **by the count of what is being permitted**: house service by ampacity ($156.00 for 100–200 A, $187.00 for 400 A), outlets and fixtures as $21.00 for the first ten and $0.83 each after that, service equipment by ampacity, water heaters and sign circuits by count. Three permit-level floors sit on top — $65.00 minimum, $100.00 or $150.00 when a rough-in inspection is required — and a $5.00 paper surcharge applies to a manual application.",
    },
    {
      jurisdictionKey: DUR_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      isAvailable: true,
      localName: "Plumbing permit",
      officialUrl: null,
      notes:
        "Priced **by scope and fixture count** across six schedules: a flat $170.00 for a new dwelling, $6.24 and $7.90 per fixture for multi-family and nonresidential work with two different minima, additions as separate lines, fixture replacement in two brackets, and four miscellany flats.",
    },
  ],

  feeSchedules: [
    {
      key: DUR_BUILDING_SOURCE_KEY,
      jurisdictionKey: DUR_KEYS.jurisdiction,
      sourceKey: DUR_BUILDING_SOURCE_KEY,
      title: "Durham City-County Building Permit Fee Schedule (Effective 7/1/18, includes the technology surcharge)",
      officialUrl: BUILDING_URL,
      effectiveFrom: DUR_FEE_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: DUR_LAST_VERIFIED,
      notes:
        "Schedules A to F are priced here; Schedules G to I (fire prevention permits, enhanced plan review, after-hours inspections) and the administrative rows are named on the pages instead. The schedule is dated on its own face and was still the one linked from the City's Fee Schedules page when it was read.",
    },
    {
      key: DUR_ELECTRICAL_SOURCE_KEY,
      jurisdictionKey: DUR_KEYS.jurisdiction,
      sourceKey: DUR_ELECTRICAL_SOURCE_KEY,
      title: "Durham City-County Electrical Permit Fee Schedule (Effective 7/1/18, includes the technology surcharge)",
      officialUrl: ELECTRICAL_URL,
      effectiveFrom: DUR_FEE_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: DUR_LAST_VERIFIED,
      notes:
        "Schedules A, B, C, E, F and G are priced here. Schedule D (motors and generators) and Schedule F's feeder and transformer rows are named on the page with their published amounts rather than computed, for the reasons the page gives.",
    },
    {
      key: DUR_PLUMBING_SOURCE_KEY,
      jurisdictionKey: DUR_KEYS.jurisdiction,
      sourceKey: DUR_PLUMBING_SOURCE_KEY,
      title: "Durham City-County Plumbing Permit Fee Schedule (Effective 7/1/18, includes the technology surcharge)",
      officialUrl: PLUMBING_URL,
      effectiveFrom: DUR_FEE_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: DUR_LAST_VERIFIED,
      notes:
        "All six schedules are priced. The schedule's second note — which defines New Construction, Addition and Replacement as the three Type Application options — is the vocabulary the calculator's plumbing scope asks for.",
    },
  ],

  feeRules: [
    ...DUR_BUILDING_RULES.map((rule) => ({
      jurisdictionKey: DUR_KEYS.jurisdiction,
      permitTypeKey: "building",
      scheduleKey: DUR_BUILDING_SOURCE_KEY,
      rule,
    })),
    ...DUR_ELECTRICAL_RULES.map((rule) => ({
      jurisdictionKey: DUR_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      scheduleKey: DUR_ELECTRICAL_SOURCE_KEY,
      rule,
    })),
    ...DUR_PLUMBING_RULES.map((rule) => ({
      jurisdictionKey: DUR_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      scheduleKey: DUR_PLUMBING_SOURCE_KEY,
      rule,
    })),
  ],

  requirements: [
    {
      jurisdictionKey: DUR_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "other",
      title: "The Department places the project in one of five building schedules",
      description:
        'The schedule the fee comes from is a property of the project, not of the amount: Schedule A is a new one- or two-family dwelling, B a multi-family building, C an accessory building, D a renovation or addition, E nonresidential construction. The calculator asks for that choice directly rather than inferring it, because the same $50,000 of contract value prices as $125.00 under Schedule D and as $104.00 plus $7.80 per thousand under Schedule E.',
      isMandatory: true,
      sortOrder: 10,
      sourceKey: DUR_BUILDING_SOURCE_KEY,
      lastVerifiedAt: DUR_LAST_VERIFIED,
    },
    {
      jurisdictionKey: DUR_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "document",
      title: "Plan review is a second column, paid at plan submittal",
      description:
        'The building schedule prints two amounts on every row — "Building Permit Fee" and "Plan Review Fee" — and states above the table: "The Plan Review Fee must be paid at time of plan submittal with credit card, check or cash." It is a separate payment, not an option, which is why every building figure on this page is the sum of the two columns.',
      isMandatory: true,
      sortOrder: 20,
      sourceKey: DUR_BUILDING_SOURCE_KEY,
      lastVerifiedAt: DUR_LAST_VERIFIED,
    },
    {
      jurisdictionKey: DUR_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "other",
      title: "Nonresidential cost is the construction contract, unless a reason is identified",
      description:
        'Schedule E is headed: "Nonresidential Buildings - Cost will be based on construction contracts unless a reason is identified to base cost on other information." The figure the bands are taken against is therefore the contract the applicant signs, and the page says so rather than offering a valuation table the schedule does not publish.',
      isMandatory: true,
      sortOrder: 30,
      sourceKey: DUR_BUILDING_SOURCE_KEY,
      lastVerifiedAt: DUR_LAST_VERIFIED,
    },
    {
      jurisdictionKey: DUR_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      requirementType: "other",
      title: "Three floors can apply to one electrical permit",
      description:
        'The schedule states a $65.00 minimum permit fee and, for a permit requiring a rough-in inspection, a $100.00 residential or $150.00 commercial minimum. They are floors on the permit rather than on any one row, and they are reached in that order: a small job is brought to $65.00, and a rough-in job is then brought to $100.00 or $150.00 — never charged three times over.',
      isMandatory: true,
      sortOrder: 10,
      sourceKey: DUR_ELECTRICAL_SOURCE_KEY,
      lastVerifiedAt: DUR_LAST_VERIFIED,
    },
    {
      jurisdictionKey: DUR_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      requirementType: "other",
      title: "The nonresidential row has two minima, selected by the water and sewer line",
      description:
        'Schedule C prints "Per Fixture $7.90" with "Minimum (without water & sewer) $187.00" and "Minimum (with water & sewer) $265.00". Two floors for one row, distinguished by whether the job includes the building water and sewer connection — so they are two rules, and the page asks which one applies rather than choosing the larger.',
      isMandatory: true,
      sortOrder: 10,
      sourceKey: DUR_PLUMBING_SOURCE_KEY,
      lastVerifiedAt: DUR_LAST_VERIFIED,
    },
  ],

  profile: {
    jurisdictionKey: DUR_KEYS.jurisdiction,
    headline: "Permit fees for Durham, from the City-County Building & Safety schedules",
    summary:
      "Durham prices a **new house by gross square footage** — eight brackets from $146.00 to $810.00 — and **commercial work by construction contract value** in five bands carrying a per-thousand increment, with plan review published as a second column beside every row. The trades are priced **by the count of the thing permitted**: outlets and fixtures as $21.00 for the first ten and $0.83 each after that, house service by ampacity, plumbing by scope and fixture count. The technology surcharge is **already inside every amount**, because the schedule says so on its own face.",
    localContext:
      "One department covers all of it. The **City-County Building & Safety Department** issues permits, plans reviews and inspections for the City *and* the County of Durham under one set of schedules — so unlike Wake County beside Raleigh, there is no second authority whose fees a reader might be about to pay instead. Its own page states the scope in a single sentence, and the address and telephone number on this page are the ones printed there.\n\nThe four schedules are dated on their faces: `(Effective 7/1/18--Includes Technology Surcharge)`. That header is the source of two facts this page relies on. It gives the effective date without any inference from a previous version, and it says the technology surcharge has **already been folded into each amount** — which is the exact counterpart of Raleigh, 12 miles away, where a 4% technology surcharge is printed as its own row and charged last against the fees. A reader comparing the two cities will otherwise assume one of the numbers is missing the surcharge, and neither is.\n\nDurham is also the counterexample to Raleigh on the fee itself. Raleigh takes a percentage of a valuation the City calculates for you, from the national Building Valuation Data adjusted 12.4% down; Durham asks for the **gross area of the house** or the **construction contract**, and the schedule says in terms that nonresidential cost is the contract \"unless a reason is identified to base cost on other information\". Neither is a rounding of the other: the same project priced both ways comes out as different numbers from different documents, which is why the pages here never carry a figure across from Raleigh's.",
    valuationBasis:
      "**Valuation is only one of three bases Durham uses, and not the one a new house is priced from.** A new one- or two-family dwelling is priced from **gross square footage** in eight flat brackets, so a bigger house steps to the next bracket rather than growing with its value. Multi-family is priced **per dwelling unit**. Renovations, additions and nonresidential construction are priced from **construction contract value**, in bands that add a per-thousand increment over a threshold — $7.80 over $5,000, then $6.60 over $50,000, $4.32 over $100,000 and $1.25 over $500,000. Nothing in these schedules publishes a valuation table for the City to derive a figure from, so the pages take the area, the contract and the counts the applicant supplies and say which one each figure came from.",
    notIncluded:
      "These pages price Schedules A to F of the building schedule, the priced rows of the electrical and plumbing schedules, the plan review column and the paper-application surcharge. They exclude:\n\n- **The technology surcharge as a separate line**, because the schedules say it is already included in the published amounts. There is no surcharge rule in this payload, and adding one would charge it twice.\n- **Electrical Schedule D — motors and generators**: a $18.00 minimum charge, $3.22 per motor, and $0.62 per horsepower applied against total horsepower. Three lines with two variables, and the schedule never says whether the minimum includes the first motor or replaces it; the page names all three amounts instead.\n- **The rest of the electrical device rows** — disposals, dryers and dishwashers, electric heat, unit heaters, furnaces and \"all other devices … each $10.90\" — priced per item, with each amount named.\n- **Feeders and transformers**: priced by the ampacity of the feeder, which is a second amperage figure the schedule does not ask this calculator for.\n- **Re-reviews, re-inspections and after-hours work**: 2nd re-review $200.00, each after $300.00; re-inspections $100.00, $200.00 and $300.00 by count; after-hours inspection $125.00 per hour with a two-hour minimum; Enhanced Plan Review $600.00 per hour. Every one of these is a fee for a second encounter with the Department, not for the permit.\n- **The building schedule's administrative rows**: work begun without a permit (double fee), voiding a permit (15% of permit cost), duplicate placard $5.00, change of address/PIN/PID $10.00 per trade, re-stamping plans $20.00 per plan, partial occupancy $200.00, stocking permit $100.00, floodplain permits $150.00 and $500.00, change of impervious surface $250.00, and Schedules G, H and I in full.\n- **The mechanical permit**, published as a fourth schedule and not priced: no page of this site prices mechanical work in any jurisdiction.\n- **The $50.00 trip charge** for water or sewer work needing more than two inspector trips, and **the City Impact Fee Ordinance**, which the Fee Schedules page publishes as a separate document.",
    seoTitle: "Durham Permit Fees (Building, Electrical, Plumbing)",
    seoDescription:
      "What a Durham building, electrical or plumbing permit costs: a new house by gross area from $146, nonresidential by contract value in five bands, trades by fixture and outlet count, plan review as a second column.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: DUR_LAST_VERIFIED,
  },

  permitPages: [
    {
      jurisdictionKey: DUR_KEYS.jurisdiction,
      permitTypeKey: "building",
      slug: "building-permit-cost",
      title: "Durham building permit cost",
      intro:
        "A Durham building permit is priced from **one of three bases, chosen by the schedule the Department places the project in**. A new one- or two-family dwelling falls in Schedule A and is priced from its **gross area**: eight brackets running from $146.00 up to 1,200 square feet to $810.00 at 5,001 square feet and above, with a $146.00 plan review fee beside every bracket. Multi-family buildings are priced per dwelling unit — $300.00 for the first, $150.00 for each additional one in the building — and accessory buildings are flat at $50.00 without a footing and $100.00 with one. Renovations, additions and nonresidential construction are priced from **construction contract value**: Schedule D in two bands ($125.00 under $10,001, $250.00 above it) and Schedule E in five bands that add a per-thousand increment — $7.80 over $5,000, $6.60 over $50,000, $4.32 over $100,000, $1.25 over $500,000 — with plan review published as a flat amount beside each one.",
      localSummary:
        "Two things about the number surprise people who have priced a permit elsewhere. The first is that **plan review is a second column, not an option**: the schedule states \"The Plan Review Fee must be paid at time of plan submittal\", so a 2,000-square-foot house at $400.00 of permit also carries $146.00 of plan review and the figure on this page is $546.00. The second is that **the nonresidential bands do not join**. At $50,000 of contract value Schedule E charges $104.00 plus 45 increments of $7.80, which is $455.00; the band above it opens at $50,001 printing $456.00. A dollar of step the schedule does not explain, carried as printed. The middle seam closes exactly — $456.00 plus 50 increments of $6.60 is $786.00, which is what the next band prints — and at $500,000 the band below yields $2,514.00 against $2,513.00 plus one $1.25 increment above, a step of 25 cents. Each band is charged over the range the schedule states for it, and both boundaries are asserted in this site's tests.",
      notIncluded:
        "This estimate is one building schedule's permit fee plus its plan review column. It excludes:\n\n- **The technology surcharge as a separate amount**, because all four Durham schedules state that their figures include it.\n- **The other schedules.** Choosing Schedule A prices Schedule A: multi-family, accessory, renovation and nonresidential work each print their own rows, and the calculator asks which one applies rather than guessing from the amount.\n- **The footing difference** unless the applicant says a footing is required: Schedule C and Schedule D each print \"(add $50.00 if footing required)\".\n- **Fire prevention permits (Schedule G), Enhanced Plan Review (Schedule H) and after-hours inspections (Schedule I)**, and the administrative rows — re-inspections, re-reviews, work begun without a permit at double fee, voiding a permit at 15% of its cost, partial occupancy, floodplain permits and the stocking permit.\n- **The mechanical permit**, published as a fourth schedule and not priced on this site.\n- **Water and sewer connection charges, impact fees and stormwater fees**, which sit in other documents — including the City Impact Fee Ordinance published beside these schedules on the City's Fee Schedules page.",
      workedExample: {
        scenario:
          "A new single-family house in Durham with a gross area of 2,000 square feet — the figure Schedule A prices from, rather than a valuation of the work.",
        inputs: {
          squareFootage: 2_000,
          custom: { building_schedule: "new_dwelling" },
        },
        notes:
          "Schedule A prices 1,801 to 2,400 square feet at $400.00, and the plan review column beside it is $146.00 in every bracket of that schedule — $546.00 together, paid as two amounts at two moments: the plan review fee at submittal, the permit fee with it. Nothing else is added, because the schedule's amounts already include the technology surcharge.\n\nThree variations show the other schedules. **A four-unit multi-family building** pays $300.00 for the first unit and $150.00 for each of the three more — $750.00 — plus the $450.00 plan review that schedule publishes for the first unit, for $1,200.00. **An accessory building with a footing** is $50.00 plus the $50.00 footing line plus $50.00 of plan review, $150.00. **A $400,000 nonresidential project** is in Schedule E's fourth band: $786.00 plus 300 increments of $4.32 over $100,000, which is $2,082.00 of permit, and $400.00 of plan review — $2,482.00.\n\nOne caution belongs with the number. The schedule dates itself `(Effective 7/1/18)` and was still the schedule the City published when this page was written; it is charged as printed on the day you calculate.",
      },
      faqs: [
        {
          question: "Is a Durham building permit based on the value of the work?",
          answer:
            "Only for some schedules. A new one- or two-family dwelling is priced from **gross square footage** in eight flat brackets, so a larger house steps to the next bracket instead of growing with its value. Renovations, additions and nonresidential construction are priced from **construction contract value** — Schedule E says so in its own heading: cost \"will be based on construction contracts unless a reason is identified to base cost on other information\". Multi-family is priced per dwelling unit and accessory buildings are flat.",
          sourceId: DUR_BUILDING_SOURCE_KEY,
          attribution: "Building Permit Fee Schedule, Schedules A to E",
        },
        {
          question: "How much is plan review?",
          answer:
            "It is published as a second column on every row of the building schedule: $146.00 in all eight Schedule A brackets, $450.00 for a multi-family building, $50.00 for an accessory building, $125.00 for a renovation or addition, and $104.00, $104.00, $230.00, $400.00 and $1,300.00 across Schedule E's five bands. The schedule states it is paid at plan submittal, so it is charged with the permit it belongs to — on a 2,000-square-foot new house, $146.00 beside a $400.00 permit.",
          sourceId: DUR_BUILDING_SOURCE_KEY,
          attribution: "Building Permit Fee Schedule, plan review column",
        },
        {
          question: "Why does the nonresidential fee jump a dollar at $50,001?",
          answer:
            "Because the bands are printed as alternatives and do not join. The $5,001–$50,000 band yields $104.00 plus 45 increments of $7.80 at $50,000 — $455.00 — and the band above opens at $50,001 printing $456.00. The middle seam does close: $456.00 plus 50 increments of $6.60 at $100,000 is exactly $786.00, the next band's printed base. This site charges each band over the range the schedule states for it rather than interpolating, so the step is the schedule's and not a modelling artefact.",
          sourceId: DUR_BUILDING_SOURCE_KEY,
          attribution: "Building Permit Fee Schedule, Schedule E",
        },
        {
          question: "Does Durham charge a technology surcharge on top?",
          answer:
            "No separate line. All four schedules carry the header `(Effective 7/1/18--Includes Technology Surcharge)`, which says the published amounts already contain it. That is the opposite of Raleigh's schedule, where a 4% technology surcharge is printed as its own row and charged last against the fees — both are North Carolina, and adding one here would charge it twice.",
          sourceId: DUR_BUILDING_SOURCE_KEY,
          attribution: "Building Permit Fee Schedule, document header",
        },
        {
          question: "Which schedule applies to my project?",
          answer:
            "The Department assigns it: Schedule A for a new one- or two-family or townhouse unit, B for apartments, condominiums, triplex and fourplex buildings, C for accessory buildings, D for residential renovations and additions, and E for nonresidential buildings. The calculator asks for that choice directly, because the amount alone cannot tell them apart — $50,000 of contract work is $125.00 of permit under Schedule D and $104.00 plus $7.80 per thousand under Schedule E.",
          sourceId: DUR_BUILDING_SOURCE_KEY,
          attribution: "Building Permit Fee Schedule, Schedules A to E",
        },
        {
          question: "Who issues Durham's building permits?",
          answer:
            "The City-County Building & Safety Department, which states on its own page that it \"provides permit, plan review, and inspection services for the City and County of Durham\" under the North Carolina State Building Code and the zoning ordinances of both. One authority covers the incorporated city and the unincorporated county, so there is no second schedule to check against — unlike Wake County beside Raleigh.",
          sourceId: DUR_FEE_INDEX_SOURCE_KEY,
          attribution: "City-County Building & Safety, durhamnc.gov/293",
        },
      ],
      seoTitle: "Durham Building Permit Cost (area for houses, contract value for commercial)",
      seoDescription:
        "What a City of Durham building permit costs: $146 to $810 by gross square footage for a new house, $125 or $250 by contract value for renovations, five bands for nonresidential work, and plan review as a second column.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: DUR_LAST_VERIFIED,
    },
    {
      jurisdictionKey: DUR_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      slug: "electrical-permit-cost",
      title: "Durham electrical permit cost",
      intro:
        "A Durham electrical permit is priced **by the count of what is being permitted**, in the schedule's own rows rather than as a share of anything. House service is flat by size — **$156.00** for a 100 to 200 ampere service and **$187.00** for 400 amperes, one permit per house meter on a multi-family project. Outlets are **$21.00 for the first ten and $0.83 for each one after that**, and fixtures are the same shape on their own row. Service equipment not covered by those schedules is priced by the ampacity of its buses: $34.00 up to 100 amperes and $6.97 for each additional 100 amperes or fraction thereof. Water heaters are $10.90 each, an electric sign's first circuit is $10.90 with $3.22 for each further circuit, and three floors sit underneath the whole schedule — a **$65.00 minimum permit fee**, and **$100.00 residential or $150.00 commercial** for a permit that requires a rough-in inspection.",
      localSummary:
        "The floors are what make this schedule different from the building one, and they are **floors on the permit, not on any row**. A job of eighteen outlets is $21.00 plus eight at $0.83 — $27.64 — which is well under $65.00, so the permit pays $65.00. The schedule states three amounts for one permit, and they are reached in that order rather than added: the small job is brought to $65.00, and when a rough-in inspection is required a residential job is then brought to $100.00 and a commercial one to $150.00. Three floors never become three charges. A job that already clears them pays nothing for them at all — a 200-ampere service at $156.00 with eighteen outlets at $27.64 is $183.64, and the floors are silent. On top sits a **$5.00 surcharge for a paper application**, which the schedule applies to any plumbing, electrical or mechanical application submitted manually rather than electronically.",
      notIncluded:
        "This estimate is the electrical schedule's priced rows, its three permit-level floors and the paper surcharge. It excludes:\n\n- **The technology surcharge as a separate amount**, because the schedule's header states its figures include it.\n- **Electrical Schedule D, motors and generators**: \"Minimum charge $18.00 / Each motor $3.22 / Additional charge per hp or fraction thereof, applied against total hp $0.62\". Two of those three lines are variables and the schedule does not say whether the minimum includes the first motor's $3.22 or replaces it, so all three amounts are named rather than one guessed at.\n- **The remaining device rows of Schedule E**: disposals under 1 hp, dryers and dishwashers, electric heat (first unit $10.90, each after $3.95), unit heaters and furnaces by kilowatt, and \"all other devices, appliances or equipment … each $10.90\".\n- **Feeders and transformers**, priced by the ampacity of the feeder itself — a second amperage figure the schedule does not ask this calculator for — and the lampholder and solar ground-mount trip rows.\n- **Re-inspections and re-reviews**: $100.00 when an inspection is not ready or five or more code violations are found, $200.00 for a third reinspection, $300.00 for a fourth, $200.00 for a second plan re-review and $300.00 for each after; the first re-review is free.\n- **After-hours inspections** at $125.00 per hour with a two-hour minimum, and **commercial reinspection** at $65.00.\n- **The mechanical permit**, published as a fourth schedule and not priced on this site.",
      workedExample: {
        scenario:
          "A new house's electrical permit in Durham: a 100-to-200-ampere service and eighteen outlets on general-purpose branch circuits.",
        inputs: {
          occupancy: "residential",
          custom: { electrical_service: "service_100_200", outlets: 18 },
        },
        notes:
          "Two rows, both from their own schedule: the 100-to-200-ampere service is $156.00 flat, and the outlet row is $21.00 for the first ten together plus $0.83 for each of the eight after — $27.64. The permit is $183.64, comfortably above the $65.00 minimum, so no floor is charged; the paper-application surcharge is not applied either, because the application was electronic.\n\nThree variations show the parts that bite. **Three outlets on their own** come to $21.00, which is below the minimum, so the permit is the **$65.00 minimum permit fee** — and if that job also needs a rough-in inspection, a residential permit is brought to **$100.00** and a commercial one to **$150.00**, the shortfall measured after the $65.00 floor rather than added to it. **Service equipment of 450 amperes** on a non-dwelling job is $34.00 for the first 100 and four rounded increments of $6.97 for the rest — $61.88. A **paper application** adds the schedule's $5.00 surcharge to the total.\n\nOne caution belongs with the number. Schedule A house service and Schedule F's service equipment are alternatives, and the calculator charges the one the applicant selected: a 400-ampere dwelling service is $187.00, not the ampacity arithmetic of the miscellaneous schedule.",
      },
      faqs: [
        {
          question: "How much is a Durham electrical permit for a small job?",
          answer:
            "The schedule's floor is **$65.00**. Three outlets are $21.00 on the outlet row, so the permit is $65.00 — the minimum is on the permit, not on the row, and a job whose rows already clear it pays only what the rows come to.",
          sourceId: DUR_ELECTRICAL_SOURCE_KEY,
          attribution: "Electrical Permit Fee Schedule, Schedules B and G",
        },
        {
          question: "How are outlets and fixtures priced?",
          answer:
            "$21.00 for the first ten of either, and $0.83 for each one after that. The flat charge covers the first ten together, so eighteen outlets are $21.00 plus eight at $0.83 — $27.64 — and not $21.00 plus eighteen rates. Fixtures are priced on their own row in the same shape.",
          sourceId: DUR_ELECTRICAL_SOURCE_KEY,
          attribution: "Electrical Permit Fee Schedule, Schedules B and C",
        },
        {
          question: "What is the rough-in minimum?",
          answer:
            "\"Minimum fee for any permit requiring a rough-in inspection: Commercial $150.00 / Residential $100.00\". It is a floor on the permit, reached after the $65.00 minimum rather than added to it: a residential job charging $21.00 is brought to $65.00 and then to $100.00, which is one shortfall of $79.00 and not two separate charges.",
          sourceId: DUR_ELECTRICAL_SOURCE_KEY,
          attribution: "Electrical Permit Fee Schedule, Schedule G",
        },
        {
          question: "How much is an electrical permit for a new 200-ampere service?",
          answer:
            "$156.00 for a 100-to-200-ampere house service, one permit per house meter — a multi-family project needs a separate permit for each meter. Add the other rows the job involves: eighteen outlets on the same permit are $27.64, for $183.64 together.",
          sourceId: DUR_ELECTRICAL_SOURCE_KEY,
          attribution: "Electrical Permit Fee Schedule, Schedule A",
        },
        {
          question: "Is there a technology surcharge on Durham's electrical permits?",
          answer:
            "Not as a separate line. Every Durham schedule carries the header `(Effective 7/1/18--Includes Technology Surcharge)`, so the published amounts already contain it. What the schedule does add separately is the **$5.00 paper-application surcharge**, charged when the application is submitted manually rather than through the electronic system.",
          sourceId: DUR_ELECTRICAL_SOURCE_KEY,
          attribution: "Electrical Permit Fee Schedule, header and surcharge notice",
        },
        {
          question: "Does Durham price an electrical permit by square footage or valuation?",
          answer:
            "No. The electrical schedule's only measurement of the work is the count of things being permitted — services, outlets, fixtures, circuits, amperes of service equipment. That is the clearest difference from the building schedule next door, which prices a new house by gross area, and from Raleigh's schedule, which prices a trade permit as a share of the building permit fee.",
          sourceId: DUR_ELECTRICAL_SOURCE_KEY,
          attribution: "Electrical Permit Fee Schedule, Schedules A to G",
        },
      ],
      seoTitle: "Durham Electrical Permit Cost ($156 service, $65 minimum)",
      seoDescription:
        "What a City of Durham electrical permit costs: $156 for a 100–200 amp service, $21 for the first ten outlets then $0.83 each, a $65 minimum permit fee and $100 or $150 for a rough-in.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: DUR_LAST_VERIFIED,
    },
    {
      jurisdictionKey: DUR_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      slug: "plumbing-permit-cost",
      title: "Durham plumbing permit cost",
      intro:
        "A Durham plumbing permit is priced **by the scope of the work and the number of fixtures it touches**, in six schedules. A new one- or two-family or townhouse dwelling is one flat **$170.00**, which covers the dwelling's new fixtures and its building water and sewer service. Multi-family construction is **$6.24 per fixture with a $127.00 minimum**; nonresidential work is **$7.90 per fixture with a minimum of $187.00 without water and sewer and $265.00 with it**. Additions are priced as separate lines — building sewer and water $65.00, then $94.00 for one to seven fixtures, $119.00 for eight to fifteen, and $7.90 per fixture above fifteen. Fixture replacement without a change to rough-in is $65.00 for one to four fixtures and $6.86 each for five or more, with an electric water heater permit at $65.00, and four miscellaneous flats close the schedule.",
      localSummary:
        "The floor on this schedule belongs to the row rather than to the permit, which is the opposite of the electrical schedule: \"Per Fixture $6.24 / Minimum $127.00\" prints the two together, so the minimum is a floor on that one row. It shows up clearly — **twelve multi-family fixtures** are $74.80 of rate and pay the $127.00 minimum, while **forty** are $249.60 and pay the rate. The nonresidential row carries **two** minima distinguished by one word: without the building water and sewer connection a ten-fixture job is $187.00, with it the same job is $265.00, and the calculator asks which rather than charging the larger. Additions read as the schedule prints them — a twelve-fixture addition is the $119.00 fixture line, plus the $65.00 building sewer and water line only when the job includes that work, for $184.00.",
      notIncluded:
        "This estimate is the plumbing schedule's six priced scopes and the paper-application surcharge. It excludes:\n\n- **The technology surcharge as a separate amount**, which the schedule's header says is already included in its figures.\n- **The $50.00 trip charge** \"when due to the length of water or sewer work more than two trips are required\" — a charge per extra inspector trip, not per permit.\n- **Re-inspections**: $100.00 for four or more code items or an inspection that was not ready, $200.00 for a third, $300.00 for a fourth, and the schedule's `Work begun without a permit — Double Fee` and `Voiding of permits — 15% of permit cost` rows.\n- **After-hours inspections** at $125.00 per hour with a two-hour minimum.\n- **The mechanical permit**, published as a fourth schedule and not priced on this site.\n- **Water and sewer connection and meter charges**, which are the water utility's fees rather than this department's, and the City Impact Fee Ordinance published beside these schedules.",
      workedExample: {
        scenario:
          "A plumbing permit for a new single-family house in Durham — the schedule's Schedule A, which prices the dwelling as one amount.",
        inputs: {
          custom: { plumbing_schedule: "new_dwelling" },
        },
        notes:
          'Schedule A reads "All dwellings $170.00" and covers new residential construction, one- and two-family and townhouse ownership, the installation of new plumbing fixtures and building water and sewer service — one flat figure with no count to take, which is why this example needs no fixture number at all.\n\nThree variations show the schedules that do count. **A twelve-fixture multi-family job** is $6.24 per fixture, $74.80, which is under the schedule\'s $127.00 minimum for that row — so the permit is $127.00; **forty fixtures** are $249.60 and pay the rate. **A ten-fixture nonresidential job** is $79.00 of rate against a $187.00 minimum without water and sewer, or $265.00 with it, because the schedule prints two minima for that one row. **A twelve-fixture addition** is the $119.00 fixture line, and becomes $184.00 when the job also includes the $65.00 building sewer and water line the schedule prints above it.\n\nOne caution belongs with the number. The schedule\'s second note defines its three Type Application options — New Construction, Addition, Replacement — and the calculator asks for that scope because the same twelve fixtures price differently under each: $127.00 as multi-family, $119.00 as an addition, $82.32 as a replacement.',
      },
      faqs: [
        {
          question: "How much is a plumbing permit for a new house in Durham?",
          answer:
            "**$170.00.** Schedule A reads \"All dwellings $170.00\" and covers new one- and two-family and townhouse construction, the installation of new plumbing fixtures and building water and sewer service for the dwelling — one flat amount with no per-fixture calculation.",
          sourceId: DUR_PLUMBING_SOURCE_KEY,
          attribution: "Plumbing Permit Fee Schedule, Schedule A",
        },
        {
          question: "How much per plumbing fixture?",
          answer:
            "It depends on the schedule: **$6.24** per fixture for new multi-family construction with a **$127.00** minimum, **$7.90** per fixture for nonresidential work with a minimum of **$187.00** without water and sewer or **$265.00** with it, and **$6.86** per fixture for replacing fixtures with no change to rough-in when there are five or more (one to four is a flat $65.00).",
          sourceId: DUR_PLUMBING_SOURCE_KEY,
          attribution: "Plumbing Permit Fee Schedule, Schedules B, C and E",
        },
        {
          question: "Why does the same nonresidential job cost $187.00 or $265.00?",
          answer:
            "Because Schedule C prints two minima beside the one per-fixture rate: \"Minimum (without water & sewer) $187.00\" and \"Minimum (with water & sewer) $265.00\". The difference is whether the job includes the building water and sewer connection. This calculator asks which applies rather than charging the larger one.",
          sourceId: DUR_PLUMBING_SOURCE_KEY,
          attribution: "Plumbing Permit Fee Schedule, Schedule C",
        },
        {
          question: "What does a plumbing permit for an addition cost?",
          answer:
            "Schedule D prints the fixture rows and the building sewer and water line separately: $94.00 for one to seven fixtures, $119.00 for eight to fifteen, $7.90 each above fifteen, and $65.00 for building sewer and water. A twelve-fixture addition is $119.00, or $184.00 when the job includes the sewer and water work as well.",
          sourceId: DUR_PLUMBING_SOURCE_KEY,
          attribution: "Plumbing Permit Fee Schedule, Schedule D",
        },
        {
          question: "Is there a minimum plumbing permit fee?",
          answer:
            "Not on the permit as a whole — the minima in this schedule sit on individual rows: $127.00 for the multi-family per-fixture row, $187.00 or $265.00 for the nonresidential one. That is the opposite of the electrical schedule beside it, which states a $65.00 minimum permit fee and $100.00 or $150.00 for a rough-in permit, measured against the whole permit.",
          sourceId: DUR_PLUMBING_SOURCE_KEY,
          attribution: "Plumbing Permit Fee Schedule, Schedules B and C",
        },
        {
          question: "Does Durham add a technology surcharge to plumbing permits?",
          answer:
            "No separate amount: the schedule's header is `(Effective 7/1/18--Includes Technology Surcharge)`, so the published figures already contain it. The schedule does add **$5.00 for a paper application**, submitted manually rather than electronically, and that is charged as its own line.",
          sourceId: DUR_PLUMBING_SOURCE_KEY,
          attribution: "Plumbing Permit Fee Schedule, header and surcharge notice",
        },
      ],
      seoTitle: "Durham Plumbing Permit Cost ($170 new dwelling, $6.24 per fixture)",
      seoDescription:
        "What a City of Durham plumbing permit costs: $170 for a new dwelling, $6.24 or $7.90 per fixture with published minima, additions by fixture bracket and fixture replacement in two brackets.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: DUR_LAST_VERIFIED,
    },
  ],

  verifications: [
    {
      entityType: "source",
      entityKey: DUR_BUILDING_SOURCE_KEY,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: DUR_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: DUR_BUILDING_SOURCE_KEY,
      notes:
        "Read twice: `-raw` for the rows, `-layout` for the two-column alignment, because Schedules C and D print their plan review amount out of line with the permit amount. The header's effective date is where the schedule's `effectiveFrom` comes from.",
    },
    {
      entityType: "source",
      entityKey: DUR_ELECTRICAL_SOURCE_KEY,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: DUR_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: DUR_ELECTRICAL_SOURCE_KEY,
      notes:
        "Read in both extraction modes. Confirms the two service rows, the ten-unit allowance on outlets and fixtures, the ampacity thresholds of Schedule F, and the three floors stated per permit in Schedule G.",
    },
    {
      entityType: "source",
      entityKey: DUR_PLUMBING_SOURCE_KEY,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: DUR_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: DUR_PLUMBING_SOURCE_KEY,
      notes:
        "Read in both extraction modes. Confirms the two Schedule C minima, the Schedule D lines as separate rows, and the schedule's second note defining the three Type Application options.",
    },
    {
      entityType: "source",
      entityKey: DUR_MECHANICAL_SOURCE_KEY,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: DUR_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: DUR_MECHANICAL_SOURCE_KEY,
      notes:
        "Read and deliberately not modelled: no page of this site prices mechanical work in any jurisdiction. Cited so the pages can say the schedule exists.",
    },
    {
      entityType: "source",
      entityKey: DUR_FEE_INDEX_SOURCE_KEY,
      status: "verified",
      method: "official_portal_check",
      verifiedAt: DUR_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: DUR_FEE_INDEX_SOURCE_KEY,
      notes:
        "Read on 2026-09-25. It links exactly these four permit schedules plus the City Impact Fee Ordinance, which is what lets the payload call the PDFs the City's current schedules.",
    },
    {
      entityType: "fee_schedule",
      entityKey: DUR_BUILDING_SOURCE_KEY,
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: DUR_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: DUR_BUILDING_SOURCE_KEY,
      notes:
        "All six priced schedules recomputed with the engine: 2,000 sq ft gives $400.00 plus $146.00 of plan review; $400,000 of contract value gives $2,082.00 plus $400.00; the three seams at $50,000, $100,000 and $500,000 reproduce $455.00, $786.00 and $2,514.00 against the bands that follow.",
    },
    {
      entityType: "fee_schedule",
      entityKey: DUR_ELECTRICAL_SOURCE_KEY,
      permitTypeKey: "electrical",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: DUR_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: DUR_ELECTRICAL_SOURCE_KEY,
      notes:
        "Recomputed: eighteen outlets $27.64 against the $65.00 floor; a rough-in residential permit reaching $100.00 and a commercial one $150.00, each as one shortfall; 450 amperes of service equipment at $61.88.",
    },
    {
      entityType: "fee_schedule",
      entityKey: DUR_PLUMBING_SOURCE_KEY,
      permitTypeKey: "plumbing",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: DUR_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: DUR_PLUMBING_SOURCE_KEY,
      notes:
        "Recomputed: twelve multi-family fixtures at the $127.00 minimum and forty at $249.60; nonresidential ten fixtures at $187.00 and $265.00 across the two minima; a twelve-fixture addition at $119.00, $184.00 with the sewer and water line.",
    },
    {
      entityType: "permit_page",
      entityKey: "building-permit-cost",
      permitTypeKey: "building",
      status: "verified",
      method: "manual_review",
      verifiedAt: DUR_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: DUR_BUILDING_SOURCE_KEY,
      notes:
        "Worked example recomputed with the engine: $546.00 for a 2,000-square-foot house, and every variation quoted in the prose reproduced before publication.",
    },
    {
      entityType: "permit_page",
      entityKey: "electrical-permit-cost",
      permitTypeKey: "electrical",
      status: "verified",
      method: "manual_review",
      verifiedAt: DUR_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: DUR_ELECTRICAL_SOURCE_KEY,
      notes:
        "Worked example recomputed: $183.64 for a 200-ampere service with eighteen outlets, $65.00 at the floor for three outlets, $100.00 and $150.00 for the two rough-in floors.",
    },
    {
      entityType: "permit_page",
      entityKey: "plumbing-permit-cost",
      permitTypeKey: "plumbing",
      status: "verified",
      method: "manual_review",
      verifiedAt: DUR_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: DUR_PLUMBING_SOURCE_KEY,
      notes:
        "Worked example recomputed: $170.00 for a new dwelling, and the six schedule variations quoted in the prose reproduced before publication.",
    },
    {
      entityType: "jurisdiction_profile",
      entityKey: DUR_KEYS.jurisdiction,
      status: "verified",
      method: "manual_review",
      verifiedAt: DUR_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: DUR_FEE_INDEX_SOURCE_KEY,
      notes:
        "The profile's central claim — that the technology surcharge is already inside Durham's figures and must not be added — is quoted from the header printed on all four schedules, and is why this payload has no surcharge rule.",
    },
  ],
};

export const DUR_PUBLISHED_PERMIT_PAGES = durhamSeed.permitPages.filter(
  (page) => page.publishStatus === "published" && !page.noindex,
);
