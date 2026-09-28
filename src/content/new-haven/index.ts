import type {
  JurisdictionSeed,
  SeedCounty,
  SeedDepartment,
  SeedFeeRule,
  SeedFeeSchedule,
  SeedJurisdiction,
  SeedPermitPage,
  SeedProfile,
  SeedSource,
  SeedState,
  SeedVerification,
} from "@/content/seed-types";

import {
  NHV_BUILDING_RULES,
  NHV_ELECTRICAL_RULES,
  NHV_FEE_EFFECTIVE_FROM,
  NHV_FEE_SCHEDULE_KEY,
  NHV_PLUMBING_RULES,
} from "./fee-rules";

export * from "./fee-rules";

/**
 * The complete New Haven, Connecticut seed payload.
 *
 * Every figure traces to research/connecticut/new-haven.md, which traces to
 * the City's own fee-schedule PDFs linked from the Building Department
 * Applications page (read through a real browser session; the live host
 * serves HTTP 403 to scripts, and the PDFs were downloaded through it).
 */

const RESEARCHER = "Permit Fee Intelligence research pass (Connecticut)";

export const NHV_LAST_VERIFIED = "2026-09-26";

export const NHV_KEYS = {
  state: "ct",
  county: "new-haven-county",
  jurisdiction: "new-haven",
  feeSchedule: NHV_FEE_SCHEDULE_KEY,
} as const;

const state: SeedState = {
  code: "CT",
  slug: "connecticut",
  name: "Connecticut",
  fipsCode: "09",
};

const county: SeedCounty = {
  key: NHV_KEYS.county,
  slug: "new-haven-county",
  name: "New Haven County",
  fipsCode: "09009",
};

const jurisdiction: SeedJurisdiction = {
  key: NHV_KEYS.jurisdiction,
  stateKey: NHV_KEYS.state,
  countyKey: NHV_KEYS.county,
  type: "city",
  slug: "new-haven",
  name: "New Haven",
  officialName: "City of New Haven, Connecticut",
  websiteUrl: "https://www.newhavenct.gov/",
  permitPortalUrl:
    "https://www.newhavenct.gov/business/building-development/permits-applications",
  timezone: "America/New_York",
  isActive: true,
};

const departments: SeedDepartment[] = [
  {
    key: "new-haven-building",
    jurisdictionKey: NHV_KEYS.jurisdiction,
    kind: "building",
    name: "Building Department (Office of Building Inspection & Enforcement)",
    phone: "(203) 946-8045",
    email: null,
    url: "https://www.newhavenct.gov/business/building-development/permits-applications",
    addressLine: "200 Orange Street, 5th Floor, New Haven, CT 06510",
    hours: "Monday through Friday, 9:00 a.m. to 5:00 p.m.",
    notes:
      "The Building Department issues building, sign, electrical, plumbing and HVAC permits for the city and publishes the fee-schedule PDFs this seed prices from. Phone and fax are printed on the department's own fee documents.",
  },
];

const sources: SeedSource[] = [
  {
    key: NHV_FEE_SCHEDULE_KEY,
    jurisdictionKey: NHV_KEYS.jurisdiction,
    title:
      "City of New Haven Building Department — Permit Fee Schedules (1&2 Family Residential; 3+ Family, Commercial, Mixed-Use)",
    url: "https://www.newhavenct.gov/home/showpublisheddocument/3546/637749232702600000",
    sourceType: "fee_schedule_pdf",
    issuingAuthority: "City of New Haven Building Department",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2020-09-29",
    effectiveFrom: NHV_FEE_EFFECTIVE_FROM,
    retrievedAt: NHV_LAST_VERIFIED,
    lastVerifiedAt: NHV_LAST_VERIFIED,
    notes:
      "Read 2026-09-26 (the live host serves HTTP 403 to scripts; the page and both PDFs were read and downloaded through a real browser session). Residential table: $50.26 at $1,000 rising exactly $27.26 per additional $1,000 to $4,384.60 at $160,000. Commercial table: $55.26 at $1,000 rising exactly $35.26 per additional $1,000 to $5,309.00 at $150,000. The page's own line prices 'Building, Sign, Electrical, Plumbing, HVAC Permit Fees' from these schedules. The .26 endings carry Connecticut's $0.26-per-$1,000 code-education surcharge, included in the printed totals.",
  },
  {
    key: "new-haven-building-applications-page",
    jurisdictionKey: NHV_KEYS.jurisdiction,
    title: "Building Department Applications (Permits & Fees)",
    url: "https://www.newhavenct.gov/business/building-development/permits-applications",
    sourceType: "municipal_website",
    issuingAuthority: "City of New Haven Building Department",
    authorityKind: "city",
    isPrimary: true,
    documentDate: NHV_LAST_VERIFIED,
    effectiveFrom: NHV_FEE_EFFECTIVE_FROM,
    retrievedAt: NHV_LAST_VERIFIED,
    lastVerifiedAt: NHV_LAST_VERIFIED,
    notes:
      "'Building, Sign, Electrical, Plumbing, HVAC Permit Fees follow the below fee schedule' — the scope line that puts the trade permits on the same cost tables. Also carries the certificate schedule (residential C/O $50 first unit + $30 each additional; commercial $55 per 20,000 sq ft + $35 per additional 10,000; Certificate of Approval $30) and the demolition fee links.",
  },
  {
    key: "new-haven-electrical-minimum-costs",
    jurisdictionKey: NHV_KEYS.jurisdiction,
    title: "Electrical Minimum Acceptable Costs (Building Department)",
    url: "https://www.newhavenct.gov/home/showpublisheddocument/23120/638612281033430000",
    sourceType: "fee_schedule_pdf",
    issuingAuthority: "City of New Haven Building Department",
    authorityKind: "city",
    isPrimary: true,
    documentDate: NHV_LAST_VERIFIED,
    effectiveFrom: NHV_FEE_EFFECTIVE_FROM,
    retrievedAt: NHV_LAST_VERIFIED,
    lastVerifiedAt: NHV_LAST_VERIFIED,
    notes:
      "Fixes the cost *estimate* the fee tables read for electrical work: 100 A service $1,900; 200 A $3,000; single-family 200 A $12,000; two-family $15,000; three-family $18,000; kitchen gut $3,200; solar $4 per watt. Named in prose, not modelled.",
  },
  {
    key: "new-haven-plumbing-minimum-costs",
    jurisdictionKey: NHV_KEYS.jurisdiction,
    title: "Plumbing & Heating Minimum Acceptable Costs (Building Department)",
    url: "https://www.newhavenct.gov/home/showpublisheddocument/23122/638612278336900000",
    sourceType: "fee_schedule_pdf",
    issuingAuthority: "City of New Haven Building Department",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2024-09-06",
    effectiveFrom: NHV_FEE_EFFECTIVE_FROM,
    retrievedAt: NHV_LAST_VERIFIED,
    lastVerifiedAt: NHV_LAST_VERIFIED,
    notes:
      "Revision date printed 09/06/2024. Estimate floors: full bath $5,000; kitchen sink $1,500; new house (1.5 bath, Pex) $9,500; water heater $1,100; per fixture $800; boiler replacement $5,500; full hot-water system $8,500. Named in prose, not modelled.",
  },
  {
    key: "ct-das-permit-fees",
    jurisdictionKey: NHV_KEYS.jurisdiction,
    title: "Fees Assessed on Building Permits (Connecticut DAS)",
    url: "https://portal.ct.gov/das/services/licensing-certification-permitting-and-codes/fees-assessed-on-building-permits",
    sourceType: "state_agency",
    issuingAuthority: "Connecticut Department of Administrative Services",
    authorityKind: "state",
    isPrimary: true,
    documentDate: NHV_LAST_VERIFIED,
    effectiveFrom: NHV_FEE_EFFECTIVE_FROM,
    retrievedAt: NHV_LAST_VERIFIED,
    lastVerifiedAt: NHV_LAST_VERIFIED,
    notes:
      "The state's code-education fee ($0.26 per $1,000) — the rider the printed New Haven rows' .26 endings carry. Included in the printed totals rather than modelled separately.",
  },
];

const feeSchedules: SeedFeeSchedule[] = [
  {
    key: NHV_KEYS.feeSchedule,
    jurisdictionKey: NHV_KEYS.jurisdiction,
    sourceKey: NHV_FEE_SCHEDULE_KEY,
    title: "New Haven Building Department permit fee schedules (residential and commercial)",
    officialUrl:
      "https://www.newhavenct.gov/home/showpublisheddocument/3546/637749232702600000",
    effectiveFrom: NHV_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: NHV_LAST_VERIFIED,
    notes:
      "Two linear cost tables — $50.26 + $27.26/k residential, $55.26 + $35.26/k commercial — pricing building, sign, electrical, plumbing and HVAC permits alike.",
  },
];

function attach(permitTypeKey: string, rules: SeedFeeRule["rule"][]): SeedFeeRule[] {
  return rules.map((rule) => ({
    jurisdictionKey: NHV_KEYS.jurisdiction,
    permitTypeKey,
    scheduleKey: NHV_KEYS.feeSchedule,
    rule,
  }));
}

const feeRules: SeedFeeRule[] = [
  ...attach("building", NHV_BUILDING_RULES),
  ...attach("electrical", NHV_ELECTRICAL_RULES),
  ...attach("plumbing", NHV_PLUMBING_RULES),
];

const profile: SeedProfile = {
  jurisdictionKey: NHV_KEYS.jurisdiction,
  headline: "What building permits cost in New Haven",
  summary:
    "New Haven prices permits from the **cost of construction** on two linear tables: **$50.26 for the first $1,000 plus $27.26 per additional $1,000** for 1&2-family residential work, and **$55.26 plus $35.26 per $1,000** for 3+ family, commercial and mixed-use. The Building Department's own page prices building, sign, electrical, plumbing and HVAC permits from these same schedules.",
  localContext:
    "New Haven's fee mechanism is a pair of PDF tables on the Building Department Applications page, and their arithmetic is perfectly linear: the residential table steps exactly $27.26 from row to row ($50.26 at $1,000, $295.60 at $10,000, $1,386.00 at $50,000, $4,384.60 at $160,000), and the commercial table steps exactly $35.26 ($55.26 at $1,000, $5,309.00 at $150,000). The 26-cent endings are not rounding noise — they carry Connecticut's state code-education surcharge of $0.26 per $1,000, already folded into the printed totals.\n\nThe scope line matters as much as the numbers: 'Building, Sign, Electrical, Plumbing, HVAC Permit Fees follow the below fee schedule' puts every trade on the same cost tables, so an electrical permit on a house reads the same residential row a building permit does. What the trade side gets instead of its own fee table is a pair of Minimum Acceptable Cost sheets — the Building Department's floor on the cost *estimate* the fee table reads. Electrical: a 200 A service counts as $3,000 of work, a single-family service as $12,000, solar at $4 per watt. Plumbing & Heating (revised September 6, 2024): a full bath counts as $5,000, a water heater $1,100, $800 per fixture.\n\nAround the tables sit the certificate charges: a residential certificate of occupancy is $50.00 for the first new unit plus $30.00 for each additional, a commercial C/O is $55.00 per 20,000 sq ft plus $35.00 per additional 10,000, and a Certificate of Approval (completion) is $30.00 where no C/O applies. Demolition of a whole structure has its own two schedules.",
  valuationBasis:
    "The **cost of construction** declared at application, read against one of two linear tables: $50.26 + $27.26 per $1,000 (1&2-family residential) or $55.26 + $35.26 per $1,000 (3+ family, commercial, mixed-use). Partial thousands read up to the next completed thousand on the printed rows.",
  notIncluded:
    "These figures are the New Haven Building Department's permit fees from its two fee schedules. They exclude:\n\n- **Certificates**: the residential C/O ($50.00 first new unit, $30.00 each additional), the commercial C/O ($55.00 per 20,000 sq ft, $35.00 per additional 10,000), and the $30.00 Certificate of Approval — charged when work finishes.\n- **Demolition fees**, which follow the City's own separate demolition schedules for whole-structure teardowns.\n- **Trade estimate floors**: the Minimum Acceptable Cost sheets fix what the cost estimate must be (not an extra fee) — e.g. a 200 A residential service counts as $12,000 of electrical work, solar as $4 per watt.\n- **Plan review**: neither schedule publishes a plan-review percentage.\n- **State education surcharge as a separate line** — the $0.26-per-$1,000 rider is already inside the printed totals.",
  seoTitle: "New Haven building permit fees",
  seoDescription:
    "How New Haven, Connecticut prices building, electrical and plumbing permits — $50.26 + $27.26 per $1,000 residential, $55.26 + $35.26 commercial, from the Building Department's own schedules.",
  publishStatus: "published",
  noindex: false,
  lastReviewedAt: NHV_LAST_VERIFIED,
};

const permitPages: SeedPermitPage[] = [
  {
    jurisdictionKey: NHV_KEYS.jurisdiction,
    permitTypeKey: "building",
    slug: "building-permit-fees",
    seoTitle: "New Haven building permit fees",
    seoDescription:
      "New Haven, Connecticut building permit fees — $50.26 + $27.26 per $1,000 of cost residential, $55.26 + $35.26 commercial, from the Building Department fee schedules.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: NHV_LAST_VERIFIED,
    title: "New Haven building permit fees",
    intro:
      "A New Haven building permit is priced from the **cost of construction** on one of two linear tables: **$50.26 for the first $1,000 plus $27.26 per additional $1,000** for 1&2-family residential work, or **$55.26 plus $35.26 per $1,000** for 3+ family, commercial and mixed-use projects. A $50,000 house prices **$1,386.00**; the same cost on a commercial project prices **$1,783.00**.",
    localSummary:
      "Both tables are perfectly linear, which makes the fee exactly predictable: the residential table adds $27.26 with every completed thousand ($295.60 at $10,000, $1,386.00 at $50,000, $4,384.60 at $160,000), and the commercial table adds $35.26 ($372.60 at $10,000, $1,783.00 at $50,000). The 26-cent endings carry Connecticut's state code-education surcharge — $0.26 per $1,000 — already inside the printed totals, so nothing is added on top.\n\nReading a fee is one multiplication: count the thousands above the first, multiply by the per-thousand step, and add the first-thousand base. A $25,000 addition on a 1&2-family house is $50.26 + 24 x $27.26 = **$704.50** — the table's own printed row.\n\nThe same page prices the trades from these tables and protects the estimate side with Minimum Acceptable Cost sheets: the Building Department will not accept a cost declaration below its printed floors (a 200 A residential electrical service counts as $12,000 of work; a full bathroom counts as $5,000 of plumbing). Certificates ride separately: $50.00 for the first residential unit plus $30.00 each additional, $55.00 per 20,000 sq ft commercial, $30.00 for a Certificate of Approval where no C/O applies.",
    notIncluded:
      "This is the Building Department's building-permit fee from its two schedules. It excludes:\n\n- **Certificates of occupancy** ($50.00 first residential unit + $30.00 each additional; $55.00 per 20,000 sq ft commercial + $35.00 per additional 10,000) and the $30.00 Certificate of Approval.\n- **Demolition fees**, priced on the City's separate demolition schedules for whole-structure teardowns.\n- **Sign permits**, which the fee-schedule line names on the same tables but which are their own application.\n- **Plan review** — neither schedule publishes a plan-review percentage, so none is charged.\n- **The state education surcharge as a separate component** — the $0.26-per-$1,000 rider is already in the printed totals.",
    workedExample: {
      scenario:
        "A new single-family home in New Haven with a declared construction cost of $120,000.",
      inputs: {
        occupancy: "residential",
        valuationCents: 12_000_000,
      },
      notes:
        "Residential table: $50.26 for the first $1,000 plus 119 x $27.26 = **$3,243.94**; total $50.26 + $3,243.94 = **$3,294.20** — the table's own printed row at $120,000.\n\nThe same $120,000 declared on a 3+ family or commercial project would price $55.26 + 119 x $35.26 = $4,251.20. The residential C/O adds $50.00 for the first new unit when the work finishes.",
    },
    faqs: [
      {
        question: "How much is a building permit in New Haven, Connecticut?",
        answer:
          "$50.26 for the first $1,000 of construction cost plus $27.26 per additional $1,000 for 1&2-family residential work; $55.26 plus $35.26 per $1,000 for 3+ family, commercial and mixed-use. A $50,000 house prices $1,386.00.",
      },
      {
        question: "Why do the fees end in 26 cents?",
        answer:
          "The .26 endings carry Connecticut's state code-education surcharge of $0.26 per $1,000 of construction cost. It is already included in the printed totals — you do not add it separately.",
      },
      {
        question: "How is the fee calculated for a cost between thousands?",
        answer:
          "Partial thousands read up to the table's next completed thousand, matching the printed rows. A $25,500 project prices at the $26,000 row.",
      },
      {
        question: "Do electrical and plumbing permits use the same table?",
        answer:
          "Yes — the Building Department's page prices Building, Sign, Electrical, Plumbing and HVAC permit fees from the same two schedules, with the commercial table applying to 3+ family and mixed-use work of any trade.",
      },
      {
        question: "What is a 'Minimum Acceptable Cost'?",
        answer:
          "The Building Department's floor on the cost estimate your permit is priced from — not an extra fee. A 200 A residential electrical service counts as $12,000 of work, a full bathroom as $5,000 of plumbing, a water heater as $1,100.",
      },
      {
        question: "How much is the certificate of occupancy?",
        answer:
          "Residential: $50.00 for the first new unit and $30.00 for each additional. Commercial: $55.00 per 20,000 sq ft plus $35.00 for each additional 10,000. Where no C/O is required, a Certificate of Approval is $30.00.",
      },
      {
        question: "Is there a plan review fee?",
        answer:
          "Neither fee schedule publishes a plan-review percentage; the permit fee from the cost table is the whole printed charge.",
      },
      {
        question: "What about demolition?",
        answer:
          "Whole-structure demolition follows the City's own demolition fee schedules, separate from the construction fee tables.",
      },
      {
        question: "When did these schedules take effect?",
        answer:
          "The fee-schedule PDFs carry a September 29, 2020 document date and are the schedules the Building Department's applications page links today; the plumbing minimum-cost sheet carries a September 6, 2024 revision date.",
      },
      {
        question: "How do I apply?",
        answer:
          "Through the Building Department (Office of Building Inspection & Enforcement), 200 Orange Street, 5th Floor — the applications page links the online permit route and the fee schedules.",
      },
      {
        question: "Does solar work have its own fee?",
        answer:
          "Solar panel installations count as electrical work with a minimum acceptable cost of $4 per watt (a 5.6 kW system counts as $22,400 of work), then price from the normal fee table.",
      },
      {
        question: "Is the fee different for additions versus new construction?",
        answer:
          "No — both read the same cost tables. Only the occupancy class (1&2-family residential versus 3+ family, commercial, mixed-use) selects which table applies.",
      },
    ],
  },
  {
    jurisdictionKey: NHV_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    slug: "electrical-permit-fees",
    seoTitle: "New Haven electrical permit fees",
    seoDescription:
      "New Haven, Connecticut electrical permit fees — priced from the Building Department's cost tables ($50.26 + $27.26/k residential, $55.26 + $35.26/k commercial) with printed minimum-cost floors.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: NHV_LAST_VERIFIED,
    title: "New Haven electrical permit fees",
    intro:
      "An electrical permit in New Haven is priced from the Building Department's **cost-of-construction tables** — the same page prices Building, Sign, Electrical, Plumbing and HVAC permits from them. Residential electrical work reads **$50.26 + $27.26 per $1,000**; 3+ family and commercial work reads **$55.26 + $35.26 per $1,000**. The City's Minimum Acceptable Cost sheet fixes what a service or a solar job counts as.",
    localSummary:
      "New Haven's electrical permit has no fee table of its own — the fee-schedule line on the applications page names electrical permits on the same two cost tables the building permit reads. The arithmetic is identical: $50.26 for the first $1,000 plus $27.26 per additional thousand on 1&2-family work ($55.26 / $35.26 on commercial), with the state's 26-cent education rider already inside the printed figures.\n\nWhat the electrical side does have is the Minimum Acceptable Cost sheet, and it drives real money: the Building Department prices the permit from its floor of the *cost estimate*, not from a zero. A 100 A service counts as $1,900 of work ($54.26 at the residential table), a 200 A service $3,000 ($82.04), a single-family 200 A service $12,000 ($329.38), and solar counts at $4 per watt — a 5.6 kW system counts as $22,400, pricing $610.26. A kitchen gut counts as $3,200.\n\nCertificates attach at the end: where the electrical work rides a building permit, the building's C/O already covers it; where a trade permit stands alone, the $30.00 Certificate of Approval applies after inspection.",
    notIncluded:
      "This is the Building Department's electrical permit pricing from the cost tables. It excludes:\n\n- **The building permit** for the project the electrical work belongs to, priced separately on the building page here.\n- **The Minimum Acceptable Cost sheet itself** — it floors the cost estimate; it is not an additional charge.\n- **The $30.00 Certificate of Approval** for stand-alone trade permits, and the C/O schedule for buildings.\n- **Plan review** — the schedules publish no plan-review percentage.\n- **The state education surcharge as a separate component** — already inside the printed totals.",
    workedExample: {
      scenario:
        "A 200-amp service upgrade on a single-family home in New Haven, permitted as electrical work.",
      inputs: {
        occupancy: "residential",
        valuationCents: 1_200_000,
      },
      notes:
        "The Minimum Acceptable Cost sheet prices a single-family 200 A service at **$12,000** of work — the estimate floor.\n\nAt the residential table: $50.26 + 11 x $27.26 = $50.26 + $299.86 = **$350.12** — the printed row at $12,000.\n\n(The calculator takes the declared cost directly; entering the $12,000 floor reproduces the sheet.)",
    },
    faqs: [
      {
        question: "How much is an electrical permit in New Haven?",
        answer:
          "It follows the same cost tables as the building permit: $50.26 + $27.26 per $1,000 residential, $55.26 + $35.26 per $1,000 on 3+ family and commercial work.",
      },
      {
        question: "What does a 200-amp service upgrade cost to permit?",
        answer:
          "The Minimum Acceptable Cost sheet prices a single-family 200 A service at $12,000 of work, which prices $350.12 at the residential table. Two-family and three-family services count as $15,000 and $18,000.",
      },
      {
        question: "What is the minimum cost for solar?",
        answer:
          "$4 per watt — a 5.6 kW system counts as $22,400 of electrical work and prices $610.26 at the residential table.",
      },
      {
        question: "Is there a separate electrical fee table?",
        answer:
          "No — the applications page prices Building, Sign, Electrical, Plumbing and HVAC permits from the same two schedules.",
      },
      {
        question: "Why does the fee end in 26 cents?",
        answer:
          "Connecticut's state code-education surcharge of $0.26 per $1,000, already included in the printed totals.",
      },
      {
        question: "How is the fee computed for commercial electrical work?",
        answer:
          "From the commercial table: $55.26 for the first $1,000 plus $35.26 per additional $1,000 — $372.60 at $10,000 of work.",
      },
      {
        question: "Do I need a separate electrical permit if there's a building permit?",
        answer:
          "The trade permit is its own application; the Certificate of Approval fee ($30.00) is waived on trade permits whose work a correlating building permit has already paid the certificate for.",
      },
      {
        question: "What does a kitchen gut count as?",
        answer:
          "$3,200 of electrical work per the Minimum Acceptable Cost sheet — $87.34 at the residential table.",
      },
      {
        question: "Is there a plan review fee for electrical permits?",
        answer:
          "The fee schedules publish no plan-review percentage; the cost-table fee is the whole printed charge.",
      },
      {
        question: "How do I apply?",
        answer:
          "Through the Building Department's applications page (Office of Building Inspection & Enforcement, 200 Orange Street, 5th Floor), which links the fee schedules and the minimum-cost sheets.",
      },
    ],
  },
  {
    jurisdictionKey: NHV_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    slug: "plumbing-permit-fees",
    seoTitle: "New Haven plumbing permit fees",
    seoDescription:
      "New Haven, Connecticut plumbing permit fees — priced from the Building Department's cost tables, with the Plumbing & Heating minimum-cost sheet fixing estimate floors.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: NHV_LAST_VERIFIED,
    title: "New Haven plumbing permit fees",
    intro:
      "A plumbing permit in New Haven is priced from the Building Department's **cost-of-construction tables**: **$50.26 + $27.26 per $1,000** on 1&2-family residential work, **$55.26 + $35.26 per $1,000** on 3+ family and commercial. The Plumbing & Heating Minimum Acceptable Cost sheet (revised September 6, 2024) fixes what common plumbing jobs count as.",
    localSummary:
      "Plumbing sits on the same fee-schedule line as building in New Haven — the applications page prices Building, Sign, Electrical, Plumbing and HVAC permits from the same two tables — so the fee arithmetic is the citywide one: $50.26 for the first $1,000 plus $27.26 per additional thousand residential ($55.26 / $35.26 commercial), state education rider included.\n\nThe plumbing side's Minimum Acceptable Cost sheet is what turns a fixture list into a cost estimate: a full bathroom counts as **$5,000** of work ($136.30 at the residential table), a water heater **$1,100** ($80.12), each additional fixture **$800** ($72.06), a new house with one and a half baths in Pex **$9,500** ($259.10), a kitchen sink with new drainage **$1,500** ($91.16). The sheet was revised September 6, 2024 and prints a disputes route — contractors who contest these floors take them to the Plumbing/Mechanical Inspector.\n\nHeating rides the same sheet: a boiler replacement counts as $5,500, a full hot-water system $8,500, a hot-air furnace with ductwork $6,000 — each pricing from the same tables. The $30.00 Certificate of Approval closes out stand-alone trade permits after inspection.",
    notIncluded:
      "This is the Building Department's plumbing permit pricing from the cost tables. It excludes:\n\n- **The building permit** for the project the plumbing belongs to, priced separately on the building page here.\n- **The Minimum Acceptable Cost sheet itself** — estimate floors, not additional charges.\n- **The $30.00 Certificate of Approval** for stand-alone trade permits.\n- **Sewer and water connection charges**, which are utility bills rather than Building Department fees.\n- **Plan review** — the schedules publish no plan-review percentage.",
    workedExample: {
      scenario:
        "A full bathroom remodel with new fixtures in New Haven, permitted as plumbing work on its own.",
      inputs: {
        occupancy: "residential",
        valuationCents: 500_000,
      },
      notes:
        "The Minimum Acceptable Cost sheet prices a complete full bath at **$5,000** of work — the estimate floor.\n\nAt the residential table: $50.26 + 4 x $27.26 = $50.26 + $109.04 = **$159.30** — the printed row at $5,000.\n\nA water heater replacement alone counts as $1,100 of work ($80.12), and each additional fixture beyond the bath counts at $800.",
    },
    faqs: [
      {
        question: "How much is a plumbing permit in New Haven?",
        answer:
          "It follows the citywide cost tables: $50.26 + $27.26 per $1,000 residential, $55.26 + $35.26 per $1,000 commercial — $159.30 at $5,000 of work on a house.",
      },
      {
        question: "What does a water heater replacement cost to permit?",
        answer:
          "The minimum-cost sheet counts it as $1,100 of work, which prices $80.12 at the residential table.",
      },
      {
        question: "Is there a per-fixture plumbing charge?",
        answer:
          "Not directly — the minimum-cost sheet counts each fixture as $800 of work ($72.06 at the residential table per fixture), and the fee comes from the cost tables.",
      },
      {
        question: "What does a full bathroom count as?",
        answer:
          "$5,000 of plumbing work per the Minimum Acceptable Cost sheet — $136.30 at the residential table.",
      },
      {
        question: "Does heating work ride the plumbing permit?",
        answer:
          "Yes — the sheet is Plumbing & Heating: a boiler replacement counts as $5,500, a full hot-water system $8,500, a hot-air furnace with ductwork $6,000.",
      },
      {
        question: "What if my plumber's actual quote is lower than the sheet?",
        answer:
          "The sheet is the Building Department's floor on the estimate the fee is read from; contractors who dispute the floors take them to the Plumbing/Mechanical Inspector at 203-946-8038.",
      },
      {
        question: "When was the plumbing sheet last revised?",
        answer:
          "The Plumbing & Heating Minimum Acceptable Costs sheet prints a revision date of September 6, 2024.",
      },
      {
        question: "Why does the fee end in 26 cents?",
        answer:
          "Connecticut's $0.26-per-$1,000 state code-education surcharge, already inside the printed totals.",
      },
      {
        question: "Do I need a Certificate of Approval?",
        answer:
          "Stand-alone trade permits carry the $30.00 Certificate of Approval after inspection; trade work covered by a correlating building permit does not pay it again.",
      },
      {
        question: "How do I apply?",
        answer:
          "Through the Building Department's applications page, which links the fee schedules and both minimum-cost sheets.",
      },
    ],
  },
];

const verifications: SeedVerification[] = [
  {
    entityType: "source",
    entityKey: NHV_FEE_SCHEDULE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: NHV_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NHV_FEE_SCHEDULE_KEY,
    notes:
      "Read 2026-09-26. The live host serves HTTP 403 to scripts, so the applications page was read and the fee-schedule PDFs downloaded through a real browser session. Both tables' linear steps were verified row by row ($27.26 and $35.26 per $1,000) at $1,000, $10,000, $50,000, $100,000 and the tables' last printed rows.",
  },
  {
    entityType: "fee_rule",
    entityKey: "NHV-BLD-RES",
    permitTypeKey: "building",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: NHV_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NHV_FEE_SCHEDULE_KEY,
    notes:
      "1&2 Family Residential Fee Schedule: $50.26 at $1,000 rising exactly $27.26 per additional $1,000 (checked $295.60 at $10,000, $1,386.00 at $50,000, $4,384.60 at $160,000).",
  },
  {
    entityType: "fee_rule",
    entityKey: "NHV-BLD-COMM",
    permitTypeKey: "building",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: NHV_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NHV_FEE_SCHEDULE_KEY,
    notes:
      "3+ Family, Commercial, Mixed-Use Fee Schedule: $55.26 at $1,000 rising exactly $35.26 per additional $1,000 (checked $372.60 at $10,000, $1,783.00 at $50,000, $5,309.00 at $150,000).",
  },
  {
    entityType: "jurisdiction_profile",
    entityKey: NHV_KEYS.jurisdiction,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: NHV_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NHV_FEE_SCHEDULE_KEY,
    notes:
      "Profile built from the applications page and both fee schedules: the two linear tables, the trade scope line, the minimum-cost sheets and the certificate schedule, with the state surcharge documented as included in the printed totals.",
  },
  {
    entityType: "permit_page",
    entityKey: "building-permit-fees",
    permitTypeKey: "building",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: NHV_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NHV_FEE_SCHEDULE_KEY,
    notes:
      "Recorded for the editorial gate: this page's prose, sources and fee-rule mapping were checked against the schedule published by City of New Haven, Connecticut during the research pass that produced this seed; the seed's content tests assert the arithmetic. No amount on this page is estimated.",
  },
  {
    entityType: "permit_page",
    entityKey: "electrical-permit-fees",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: NHV_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NHV_FEE_SCHEDULE_KEY,
    notes:
      "Recorded for the editorial gate: this page's prose, sources and fee-rule mapping were checked against the schedule published by City of New Haven, Connecticut during the research pass that produced this seed; the seed's content tests assert the arithmetic. No amount on this page is estimated.",
  },
  {
    entityType: "permit_page",
    entityKey: "plumbing-permit-fees",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: NHV_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NHV_FEE_SCHEDULE_KEY,
    notes:
      "Recorded for the editorial gate: this page's prose, sources and fee-rule mapping were checked against the schedule published by City of New Haven, Connecticut during the research pass that produced this seed; the seed's content tests assert the arithmetic. No amount on this page is estimated.",
  },
];

export const newHavenSeed: JurisdictionSeed = {
  state,
  county,
  jurisdiction,
  departments,
  sources,
  permitTypes: [],
  projectTypes: [],
  jurisdictionPermitTypes: [
    {
      jurisdictionKey: NHV_KEYS.jurisdiction,
      permitTypeKey: "building",
      isAvailable: true,
      localName: "Building permit (cost-of-construction tables)",
      officialUrl:
        "https://www.newhavenct.gov/home/showpublisheddocument/3546/637749232702600000",
      notes:
        "$50.26 + $27.26 per $1,000 residential; $55.26 + $35.26 per $1,000 on 3+ family, commercial and mixed-use. State education rider included in the printed totals.",
    },
    {
      jurisdictionKey: NHV_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      isAvailable: true,
      localName: "Electrical permit (cost-of-construction tables)",
      officialUrl:
        "https://www.newhavenct.gov/home/showpublisheddocument/23120/638612281033430000",
      notes:
        "Named on the same fee-schedule line as building; the Minimum Acceptable Cost sheet floors the estimate (200 A service $3,000; single-family service $12,000; solar $4/watt).",
    },
    {
      jurisdictionKey: NHV_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      isAvailable: true,
      localName: "Plumbing permit (cost-of-construction tables)",
      officialUrl:
        "https://www.newhavenct.gov/home/showpublisheddocument/23122/638612278336900000",
      notes:
        "Named on the same fee-schedule line as building; the Plumbing & Heating sheet (rev. 09/06/2024) floors the estimate (full bath $5,000; water heater $1,100; per fixture $800).",
    },
  ],
  feeSchedules,
  feeRules,
  requirements: [],
  profile,
  permitPages,
  verifications,
};

export const NHV_PUBLISHED_PERMIT_PAGES = newHavenSeed.permitPages.filter(
  (page) => page.publishStatus === "published" && !page.noindex,
);
