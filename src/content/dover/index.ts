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
  DOVER_APPENDIX_F_KEY,
  DOVER_BUILDING_RULES,
  DOVER_FEE_EFFECTIVE_FROM,
  DOVER_MECHANICAL_RULES,
  DOVER_PLUMBING_RULES,
} from "./fee-rules";

export * from "./fee-rules";

/**
 * The complete Dover, Delaware seed payload.
 *
 * Every figure traces to research/delaware/dover.md, which traces to the City's
 * own June 24, 2024 council packet (Ordinances #2024-15 and #2024-19 amending
 * Chapter 22 and Appendix F). The distinctive finding: Dover's electrical
 * permits are free by ordinance (§22-109(a) "No fee"), so the third published
 * page is mechanical — a category with real published fees — and the zero-fee
 * electrical result is documented on the profile and in the research record
 * rather than shipped as a page that charges $0.00.
 */

const RESEARCHER = "Permit Fee Intelligence research pass (Delaware)";

export const DOVER_LAST_VERIFIED = "2026-09-26";

export const DOVER_KEYS = {
  state: "de",
  county: "kent",
  jurisdiction: "dover",
  feeSchedule: "dover-appendix-f-fee-schedule",
} as const;

const state: SeedState = {
  code: "DE",
  slug: "delaware",
  name: "Delaware",
  fipsCode: "10",
};

const county: SeedCounty = {
  key: DOVER_KEYS.county,
  slug: "kent",
  name: "Kent County",
  fipsCode: "10001",
};

const jurisdiction: SeedJurisdiction = {
  key: DOVER_KEYS.jurisdiction,
  stateKey: DOVER_KEYS.state,
  countyKey: DOVER_KEYS.county,
  type: "city",
  slug: "dover",
  name: "Dover",
  officialName: "City of Dover, Delaware",
  websiteUrl: "https://www.cityofdover.com/",
  permitPortalUrl: "https://www.cityofdover.com/building-permits-inspections",
  timezone: "America/New_York",
  isActive: true,
};

const departments: SeedDepartment[] = [
  {
    key: "dover-licensing-permitting",
    jurisdictionKey: DOVER_KEYS.jurisdiction,
    kind: "building",
    name: "Licensing and Permitting Office (Building Inspector)",
    phone: "(302) 736-7008",
    email: "cityclerk@dover.de.us",
    url: "https://www.cityofdover.com/",
    addressLine: "Dover City Hall, Dover, DE",
    hours: null,
    notes:
      "Chapter 22 vests enforcement in the city's building inspector, and §22-65(a) points every permit fee at Appendix F - Fees and Fines. The phone recorded is the City Clerk's published line, which the packet itself cites for ordinance access; the Licensing and Permitting Office's own direct line is not printed in either ordinance this pass read, so it is left unset rather than guessed at.",
  },
];

const sources: SeedSource[] = [
  {
    key: DOVER_APPENDIX_F_KEY,
    jurisdictionKey: DOVER_KEYS.jurisdiction,
    title:
      "City of Dover Code of Ordinances, Chapter 22 (Buildings and Building Regulations) and Appendix F (Fees and Fines) — adopted text of Proposed Ordinances #2024-15 and #2024-19",
    url: "https://evogov.s3.us-west-2.amazonaws.com/meetings/27/attachments/17187.pdf",
    sourceType: "municipal_code",
    issuingAuthority: "City of Dover Mayor and Council",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2024-06-24",
    effectiveFrom: DOVER_FEE_EFFECTIVE_FROM,
    retrievedAt: DOVER_LAST_VERIFIED,
    lastVerifiedAt: DOVER_LAST_VERIFIED,
    notes:
      "Read 2026-09-26 in full (HTTP 200) from the City's own council-meeting packet for the June 24, 2024 Regular City Council meeting, which reprints the complete adopted texts. Ordinance #2024-15 amends Chapter 22 (ICC code adoption; §22-65, §22-109, §22-145, §22-185 fee sections) and Ordinance #2024-19, with Staff Amendment #1, reprints Appendix F's Chapter 22 fee rows: building permits $25.00 first $1,000 + $8.00 per additional $1,000 to $10M, $6.00 per additional $1,000 to $20M, $5.00 above $20M ('or multiples thereof' throughout); plumbing fixtures $35.00 first five + $3.00 each additional; underground gas/water/sewer inspection $30.00 first 150 feet + $0.75 per additional ten feet; mechanical permits $40.00 first 10,000 BTU / $40.00 per ton first five + $7.00 per unit above; electrical permits 'No fee' (§22-109(a)). First reading June 10, 2024; final reading July 8, 2024, the date recorded as effective.",
  },
];

/** Empty on purpose: the permit types Dover uses already exist as shared rows. */
const permitTypes: JurisdictionSeed["permitTypes"] = [];
const projectTypes: JurisdictionSeed["projectTypes"] = [];

const jurisdictionPermitTypes: SeedJurisdictionPermitType[] = [
  {
    jurisdictionKey: DOVER_KEYS.jurisdiction,
    permitTypeKey: "building",
    isAvailable: true,
    localName: "Building permit (§22-65)",
    officialUrl: "https://evogov.s3.us-west-2.amazonaws.com/meetings/27/attachments/17187.pdf",
    notes:
      "$25.00 for the first $1,000 of costs, $8.00 per additional $1,000 (or multiple thereof) to $10M, $6.00 per additional $1,000 to $20M, and $5.00 per additional $1,000 above $20M. Fence, sign, pool and demolition rows sit beside it; nonresidential plan review is $20.00 per set of plans and is not subject to the doubling penalty. Fees double when work started without a permit, waivable for non-professionals.",
  },
  {
    jurisdictionKey: DOVER_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    isAvailable: false,
    localName: "Electrical permit (§22-109(a): no fee)",
    officialUrl: "https://evogov.s3.us-west-2.amazonaws.com/meetings/27/attachments/17187.pdf",
    notes:
      "§22-109(a): 'No fee. There shall be no fee for permits or renewals thereof by the building inspector as may be required by this article.' Appendix F's Article IV block contains no permit-fee rows — only violation fines. Any inspection charge is set by the City's authorized inspection agency 'as determined by said agency' (§22-109(b)), an amount Dover does not publish. This site therefore does not publish a Dover electrical-fee page: a page would charge $0.00 or an unpublished third-party amount.",
  },
  {
    jurisdictionKey: DOVER_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    isAvailable: true,
    localName: "Plumbing permit (§22-185)",
    officialUrl: "https://evogov.s3.us-west-2.amazonaws.com/meetings/27/attachments/17187.pdf",
    notes:
      "Fixtures: $35.00 for the first five and $3.00 for each additional fixture. Garbage disposal and hot-water-heater work carries its own $35.00 minimum row. Underground gas, water and sewer inspections: $30.00 for the first 150 feet plus $0.75 for each additional ten feet or multiple thereof. Fees double when work started without a permit.",
  },
  {
    jurisdictionKey: DOVER_KEYS.jurisdiction,
    permitTypeKey: "mechanical",
    isAvailable: true,
    localName: "Heating, air conditioning and heat pump permit (§22-145)",
    officialUrl: "https://evogov.s3.us-west-2.amazonaws.com/meetings/27/attachments/17187.pdf",
    notes:
      "Air conditioning: $40.00 per ton for the first five tons plus $7.00 per ton over five (or multiple thereof). Heating: $40.00 first 10,000 BTU plus $7.00 per additional 10,000 BTU (or multiple thereof). Heat pumps price under whichever of the two shapes fits the equipment. This is the third page published here because Dover's electrical permits are free by ordinance.",
  },
];

const feeSchedules: SeedFeeSchedule[] = [
  {
    key: DOVER_KEYS.feeSchedule,
    jurisdictionKey: DOVER_KEYS.jurisdiction,
    sourceKey: DOVER_APPENDIX_F_KEY,
    title: "Dover Appendix F — Fees and Fines, Chapter 22 rows (2024 adoption)",
    officialUrl: "https://evogov.s3.us-west-2.amazonaws.com/meetings/27/attachments/17187.pdf",
    effectiveFrom: DOVER_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: DOVER_LAST_VERIFIED,
    notes:
      "The effective date is the second-reading adoption date printed in the packet (July 8, 2024). Every fee row says fees 'shall double in the event that a permit is applied for after construction has commenced without the permission of the building inspector', waivable where the applicant is not a professional contractor; the doubling is a penalty, not a fee, and is not modelled.",
  },
];

function attach(permitTypeKey: string, rules: SeedFeeRule["rule"][]): SeedFeeRule[] {
  return rules.map((rule) => ({
    jurisdictionKey: DOVER_KEYS.jurisdiction,
    permitTypeKey,
    scheduleKey: DOVER_KEYS.feeSchedule,
    rule,
  }));
}

const feeRules: SeedFeeRule[] = [
  ...attach("building", DOVER_BUILDING_RULES),
  ...attach("mechanical", DOVER_MECHANICAL_RULES),
  ...attach("plumbing", DOVER_PLUMBING_RULES),
];

const requirements: SeedRequirement[] = [
  {
    jurisdictionKey: DOVER_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "Costs are the basis, in three marginal legs",
    description:
      "§22-65(a) prices building permits on 'costs': $25.00 for the first $1,000 plus $8.00 per additional $1,000 (or multiple thereof) up to $10,000,000, $6.00 per additional $1,000 up to $20,000,000, and $5.00 per additional $1,000 above that. Each leg's excess rounds up to whole thousands before its rate applies.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: DOVER_APPENDIX_F_KEY,
    lastVerifiedAt: DOVER_LAST_VERIFIED,
  },
  {
    jurisdictionKey: DOVER_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "Doubling for work started without a permit",
    description:
      "§22-65(c): fees for building, fence, sign, swimming pool, demolition and moving permits 'shall double in the event that a permit is applied for after construction has commenced without the permission of the building inspector', with the doubling waivable where neither the applicant nor the contractor is a professional. The same clause appears in the mechanical (§22-145) and plumbing (§22-185) sections.",
    isMandatory: true,
    sortOrder: 20,
    sourceKey: DOVER_APPENDIX_F_KEY,
    lastVerifiedAt: DOVER_LAST_VERIFIED,
  },
  {
    jurisdictionKey: DOVER_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    requirementType: "other",
    title: "Fixture count with the five-fixture base",
    description:
      "§22-185(a) charges '$35.00 first five fixtures and $3.00 for each additional fixture', so the permit application carries the fixture count; garbage disposal and hot-water-heater work carries its own separate $35.00 minimum row.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: DOVER_APPENDIX_F_KEY,
    lastVerifiedAt: DOVER_LAST_VERIFIED,
  },
];

const profile: SeedProfile = {
  jurisdictionKey: DOVER_KEYS.jurisdiction,
  headline: "What building permits cost in Dover",
  summary:
    "Dover prices building permits on cost in **three marginal legs**: **$25.00 for the first $1,000 plus $8.00 per additional $1,000** (each partial thousand rounds up) up to $10 million, **$6.00 per additional $1,000** to $20 million, and **$5.00 per additional $1,000** above that. Plumbing is **$35.00 for the first five fixtures plus $3.00 each additional**, and mechanical permits run **$40.00 per ton for the first five tons plus $7.00 per ton over** (the same shape on BTUs for heating). Dover's electrical permits are **free by ordinance** — §22-109(a): \"There shall be no fee for permits or renewals thereof.\"",
  localContext:
    "Dover's fee schedule is Appendix F to its Code of Ordinances, last adopted through Ordinances #2024-15 and #2024-19 (final reading July 8, 2024), which this site reads from the City's own council packet. Chapter 22 points every permit at Appendix F: building under §22-65, heating/AC/heat pump under §22-145, and plumbing under §22-185.\n\nThe schedule's most distinctive line is the one that charges nothing. Article IV (Electrical Installations), §22-109(a): **\"No fee. There shall be no fee for permits or renewals thereof by the building inspector as may be required by this article.\"** Appendix F's Article IV block contains only violation fines, no permit rows. Any inspection charge is set by the City's *authorized inspection agency* \"as determined by said agency\" (§22-109(b)) — a third-party amount Dover does not publish. That is why this site publishes a mechanical page for Dover instead of an electrical one: a page charging $0.00 would be arithmetic without a document behind it.\n\nThe rest of the schedule carries a warning most cities bury: every permit row doubles if work started without a permit, though the building inspector may waive the doubling where neither applicant nor contractor is a professional. Nonresidential plan review — $20.00 per set of plans — is the one row expressly marked \"not subject to doubling\". Sign permits are $0.75 per square foot of sign area with a $50 minimum per permit, demolition is $50.00 ($0.00 where the city or a public entity ordered the demolition), and moving a building is $250.00.",
  valuationBasis:
    "The declared **cost of the work**, banded in three marginal legs whose excesses each round up to whole thousands — $8.00 per $1,000 to $10M, $6.00 to $20M, $5.00 above. Plumbing is charged on the **fixture count** (five included in $35.00, then $3.00 each), mechanical on **tons of cooling** ($40.00 per ton to five, $7.00 above) or **BTUs of heating** ($40.00 first 10,000, $7.00 per additional 10,000), and the underground inspection on **linear feet** ($30.00 first 150 feet, $0.75 per additional ten feet or multiple thereof).",
  notIncluded:
    "These figures are Dover's building, plumbing and mechanical permit fees from Appendix F. They exclude:\n\n- **Electrical permit charges — deliberately, because there are none**: §22-109(a) provides no fee for electrical permits or renewals, and any inspection charge is set by the authorized inspection agency rather than published by the City.\n- **The other building rows**: fence permits ($25.00 first $1,000 + $8.00 per additional $1,000), sign permits ($0.75 per square foot, $50 minimum per permit), swimming pools ($25.00 first $1,000 + $8.00 per additional $1,000), demolition ($50.00, waived where ordered by the city or a public entity), and moving permits ($250.00 per building).\n- **Nonresidential construction plan review** at $20.00 per set of plans, charged on the building page here only as a named surcharge for commercial work.\n- **Reinspection charges** — first $0.00, second $25.00, third $50.00, subsequent $100.00.\n- **Violation fines**, which Appendix F lists separately: $100-$1,000 escalating inspection penalties, and IBC violation penalties of $100-$10,000 per day.\n- **The doubling penalty** for work started without a permit — a multiplier on these fees, not a fee of its own.\n- **Kent County and State of Delaware** charges, which are separate jurisdictions.",
  seoTitle: "Dover building permit fees",
  seoDescription:
    "How Dover, Delaware prices building, plumbing and mechanical permits — three marginal cost bands, $35 first five plumbing fixtures, $40-per-ton AC permits, and electrical permits free by ordinance.",
  publishStatus: "published",
  noindex: false,
  lastReviewedAt: DOVER_LAST_VERIFIED,
};

const permitPages: SeedPermitPage[] = [
  {
    jurisdictionKey: DOVER_KEYS.jurisdiction,
    permitTypeKey: "building",
    slug: "building-permit-fees",
    seoTitle: "Dover building permit fees",
    seoDescription:
      "Dover, Delaware building permit fees — $25 first $1,000 plus $8/$6/$5 per $1,000 in three marginal legs, from Appendix F as adopted July 2024.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: DOVER_LAST_VERIFIED,
    title: "Dover building permit fees",
    intro:
      "A Dover building permit is **$25.00 for the first $1,000 of costs**, then **$8.00 for each additional $1,000 — or multiple thereof** — up to $10 million, **$6.00 per additional $1,000** to $20 million, and **$5.00 per additional $1,000** above that. The bands are marginal and each partial thousand rounds up. Nonresidential plan review adds **$20.00 per set of plans**, and every permit row **doubles** if work started without one.",
    localSummary:
      "The first leg is where ordinary projects live: $25.00 covers the first $1,000 of declared costs, and each additional thousand — with any fraction rounded up to a whole thousand — adds $8.00. A $50,000 house permit is $25.00 + 49 x $8.00 = **$417.00**. The word the schedule uses is 'multiples thereof': $500 of excess buys a whole $8.00 increment, which makes the fee step at every thousand-dollar boundary rather than glide.\n\nAbove $10,000,000 of costs the marginal rate drops to $6.00 per additional $1,000, and above $20,000,000 to $5.00 — an economy of scale that makes Dover's schedule gentler to very large projects than to mid-size ones. The legs stack: the second leg charges only the portion between $10M and $20M, on top of whatever the first leg produced at $10M, and the third leg the portion above $20M.\n\nThe rows beside the building row share its arithmetic: fences and swimming pools are $25.00 for the first $1,000 plus $8.00 per additional $1,000; signs are $0.75 per square foot of sign area with a $50.00 minimum per permit; demolition is $50.00 — $0.00 where the city or a public entity ordered the demolition — and moving a building is $250.00. Nonresidential construction plan review is $20.00 per set of plans and is the one row the schedule expressly marks 'not subject to doubling'.\n\nThe doubling clause is the schedule's teeth: fees 'shall double in the event that a permit is applied for after construction has commenced without the permission of the building inspector', with a waiver where the applicant is not a professional contractor and the work is not being done by one. Reinsections run $0.00 first, $25.00 second, $50.00 third, $100.00 after.",
    notIncluded:
      "This is §22-65's building permit row and the Appendix F rows beside it. It excludes:\n\n- **Mechanical permits** (§22-145) — heating, air conditioning and heat pumps at $40.00 per ton or per 10,000 BTU structures — which have their own page here.\n- **Plumbing permits** (§22-185) — fixtures at $35.00 first five plus $3.00 each additional, and the underground inspection rows — their own page here.\n- **Electrical permits**, which §22-109(a) prices at no fee by ordinance; no electrical page is published because there is no amount to compute.\n- **The doubling penalty** — a multiplier applied after the fact to work started without a permit, not a fee row.\n- **Reinspection charges** ($0/$25/$50/$100) and **violation fines** ($100-$1,000 escalating; IBC penalties to $10,000 per day), which Appendix F lists separately.\n- **State of Delaware and Kent County** charges, including the state's own licensing.",
    workedExample: {
      scenario:
        "A new single-family dwelling in Dover declared at $50,000 of construction costs, filed before any work begins.",
      inputs: {
        occupancy: "residential",
        valuationCents: 5_000_000,
        workType: "new_construction",
      },
      notes:
        "First leg: $25.00 covers the first $1,000. The excess is $49,000, which rounds to 49 whole thousands ('or multiples thereof'), each at $8.00: 49 x $8.00 = **$392.00**.\n\nPermit fee: $25.00 + $392.00 = **$417.00**.\n\nNo nonresidential plan review applies to a dwelling. At $500,000 the same arithmetic gives $25.00 + 499 x $8.00 = **$4,017.00**; at $12,000,000 the first leg produces $80,017.00 and the second leg adds 2,000 x $6.00 = $12,000.00 for **$92,017.00**. Beginning the work first would double every one of those figures, subject to the inspector's waiver for non-professionals.",
    },
    faqs: [
      {
        question: "How much is a building permit in Dover, Delaware?",
        answer:
          "$25.00 for the first $1,000 of costs plus $8.00 for each additional $1,000 or multiple thereof, up to $10,000,000 of costs. A $50,000 project is $25.00 + 49 x $8.00 = $417.00.",
      },
      {
        question: "What does 'or multiples thereof' mean in the fee?",
        answer:
          "Any partial thousand of cost rounds up before the rate applies: $1,500 of excess pays for two thousands. The fee steps at every $1,000 boundary rather than prorating.",
      },
      {
        question: "Do large projects pay a lower rate?",
        answer:
          "Yes. The marginal rate drops to $6.00 per additional $1,000 between $10,000,000 and $20,000,000 of costs, and to $5.00 per $1,000 above $20,000,000 — each leg charged only on its own portion, stacked on the legs below.",
      },
      {
        question: "What happens if work starts before the permit?",
        answer:
          "The permit fee doubles. §22-65(c) applies the doubling to building, fence, sign, pool, demolition and moving permits, and the building inspector may waive it where neither the applicant nor the contractor is a professional.",
      },
      {
        question: "How much is an electrical permit in Dover?",
        answer:
          "Nothing. §22-109(a): 'No fee. There shall be no fee for permits or renewals thereof by the building inspector as may be required by this article.' Any inspection charge is set by the City's authorized inspection agency, not by Dover's schedule.",
      },
      {
        question: "How much is plan review?",
        answer:
          "$20.00 per set of plans for nonresidential construction plan review — the one row marked 'not subject to doubling'.",
      },
      {
        question: "How much is a fence or pool permit?",
        answer:
          "The same structure as the building row: $25.00 for the first $1,000 of costs plus $8.00 for each additional $1,000 or multiple thereof.",
      },
      {
        question: "How much is a sign permit?",
        answer:
          "$0.75 per square foot of sign area, with a minimum fee of $50.00 for each sign permit.",
      },
      {
        question: "What does demolition cost?",
        answer:
          "$50.00 — but $0.00 where the building is being demolished for redevelopment or where the city or another public entity required the demolition.",
      },
      {
        question: "How much does a reinspection cost?",
        answer:
          "The first reinspection is free, the second is $25.00, the third is $50.00, and any reinspection after that is $100.00.",
      },
      {
        question: "When did these fees take effect?",
        answer:
          "The current Appendix F rows come from Ordinances #2024-15 and #2024-19, adopted on final reading July 8, 2024 — the date this site records as effective.",
      },
      {
        question: "Where do I file?",
        answer:
          "With the City's Licensing and Permitting Office; Chapter 22 vests enforcement in the building inspector, and §22-65(a) requires the Appendix F fee to be paid before any permit is issued.",
      },
    ],
  },
  {
    jurisdictionKey: DOVER_KEYS.jurisdiction,
    permitTypeKey: "mechanical",
    slug: "mechanical-permit-fees",
    seoTitle: "Dover mechanical permit fees",
    seoDescription:
      "Dover, Delaware heating, air conditioning and heat pump permit fees — $40 per ton for the first five tons plus $7 per ton over, and the BTU shape for heating. (Electrical permits are free by ordinance.)",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: DOVER_LAST_VERIFIED,
    title: "Dover mechanical permit fees (heating, AC and heat pumps)",
    intro:
      "Dover prices mechanical permits at **$40.00 per ton for the first five tons of air conditioning** plus **$7.00 per ton over five** — with any partial ton rounding up — and the same shape on BTUs for heating: **$40.00 for the first 10,000 BTU plus $7.00 per additional 10,000**. Heat pumps price under whichever structure fits the equipment. This page exists instead of an electrical page because Dover's electrical permits are **free by ordinance**.",
    localSummary:
      "§22-145 requires a fee before any heating, air-conditioning or heat-pump permit issues, and Appendix F prices each: the AC row is a five-ton base block ($40.00 x 5 = $200.00 of capacity covered) plus $7.00 per ton above five, each partial ton bought whole ('or multiple thereof'). A 6-ton system is $200.00 + $7.00 = $207.00; a 10-ton system is $200.00 + 5 x $7.00 = $235.00. The heating row reads the same way on 10,000-BTU blocks: $40.00 for the first block, $7.00 per additional block or multiple thereof — so a heat pump is charged under whichever of the two rows describes it.\n\nThe mechanical sections carry the same doubling clause as building: fees double if the permit is applied for after installation has begun, waivable for non-professionals. And the reason this page stands where other cities publish an electrical page is Dover's §22-109(a): 'No fee. There shall be no fee for permits or renewals thereof' for electrical work — Article IV of Appendix F contains violation fines only, and any electrical inspection charge is set by the City's authorized inspection agency rather than by the schedule. A site that priced Dover electrical permits would have to invent a number the City does not publish; this one documents the zero instead.",
    notIncluded:
      "This is §22-145's heating, air conditioning and heat pump rows. It excludes:\n\n- **Electrical permits** — free by ordinance under §22-109(a); no amount exists to charge, and any inspection fee is set by the authorized inspection agency.\n- **Plumbing permits** (§22-185) — fixtures, water heaters and the underground inspection rows — their own page here.\n- **Building permits** (§22-65) for the structure the equipment serves — the building page here.\n- **The BTU-scaled heating add above the $40.00 base row**, which the schedule prints ($7.00 per additional 10,000 BTU) but which the calculator names rather than charges, because BTU capacity is not a count its inputs hold.\n- **The doubling penalty** for work started without a permit — a multiplier, not a fee.\n- **Reinspection charges and violation fines** listed separately in Appendix F.",
    workedExample: {
      scenario:
        "A commercial fit-out in Dover installing a 10-ton rooftop air-conditioning system, permitted under §22-145.",
      inputs: {
        occupancy: "commercial",
        custom: { tons: 10 },
      },
      notes:
        "The AC row charges $40.00 per ton for the first five tons: 5 x $40.00 = **$200.00**.\n\nEach ton above five is $7.00, with partial tons rounded up: 10 − 5 = 5 whole tons, 5 x $7.00 = **$35.00**.\n\nPermit fee: $200.00 + $35.00 = **$235.00**. A 6-ton system would be $207.00 and a 5.5-ton system would also charge as 6 tons ($207.00), because 'or multiple thereof' buys the half-ton a whole $7.00 block — the calculator takes tonnage in whole tons, so enter a 5.5-ton system as 6. A nonresidential project also carries the $20.00-per-set plan review on the building page.",
    },
    faqs: [
      {
        question: "How much is an air conditioning permit in Dover?",
        answer:
          "$40.00 per ton for the first five tons, plus $7.00 per ton over five — any partial ton rounding up to a whole ton. Five tons is $200.00; ten tons is $235.00.",
      },
      {
        question: "How much is a heating permit?",
        answer:
          "$40.00 for the first 10,000 BTU of capacity plus $7.00 for each additional 10,000 BTU or multiple thereof. The calculator charges the $40.00 base row for a standard furnace entry.",
      },
      {
        question: "How is a heat pump charged?",
        answer:
          "Under whichever structure fits the equipment — the ton shape of the air-conditioning row or the BTU shape of the heating row; Appendix F gives heat pumps both.",
      },
      {
        question: "Why is there an electrical page missing for Dover?",
        answer:
          "There is no fee to publish: §22-109(a) provides 'No fee' for electrical permits and renewals, and Appendix F's Article IV block lists only fines. Inspection charges are set by the City's authorized inspection agency, not by the City's schedule.",
      },
      {
        question: "Does a bigger system pay proportionally less?",
        answer:
          "Only through the structure: the first five tons always price at $40.00 each ($200.00), and everything above at $7.00 — so the marginal ton is far cheaper than the base, and a 20-ton system is $270.00.",
      },
      {
        question: "What if my system is 5.5 tons?",
        answer:
          "'Or multiple thereof' rounds the excess up: a half-ton above five buys a whole $7.00 block, so 5.5 tons prices as 6 tons — $207.00. The calculator takes tonnage in whole tons; enter a 5.5-ton system as 6 and the fee comes out the same $207.00.",
      },
      {
        question: "Do fees double if installation started first?",
        answer:
          "Yes — §22-145(b) carries the same doubling clause as the building section, waivable where neither the applicant nor the contractor is a professional.",
      },
      {
        question: "Is a furnace replacement itself a permit?",
        answer:
          "Yes — §22-145(a) requires a fee before any heating permit is issued, which the $40.00 heating row covers for an ordinary residential furnace.",
      },
      {
        question: "Is the mechanical permit separate from the building permit?",
        answer:
          "Yes — §22-145 prices its own permit, and Chapter 22 keeps each trade's fee separate; a project with structural and mechanical work pays both.",
      },
      {
        question: "When did these amounts take effect?",
        answer:
          "With Ordinances #2024-15 and #2024-19, adopted July 8, 2024 — the date this site records as effective for the whole Appendix F schedule.",
      },
    ],
  },
  {
    jurisdictionKey: DOVER_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    slug: "plumbing-permit-fees",
    seoTitle: "Dover plumbing permit fees",
    seoDescription:
      "Dover, Delaware plumbing permit fees — $35.00 for the first five fixtures plus $3.00 each additional, and underground inspections at $30.00 first 150 feet plus $0.75 per ten feet.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: DOVER_LAST_VERIFIED,
    title: "Dover plumbing permit fees",
    intro:
      "A Dover plumbing permit charges **$35.00 for the first five fixtures** and **$3.00 for each additional fixture** — a five-fixture bathroom job and a water-heater swap can both sit at the schedule's own $35.00 minimum row. Underground gas, water and sewer inspections are **$30.00 for the first 150 feet plus $0.75 for each additional ten feet or multiple thereof**.",
    localSummary:
      "The fixture row is block-structured rather than flat: $35.00 buys the first five fixtures, and each fixture beyond the fifth adds $3.00 — 8 fixtures are $35.00 + 3 x $3.00 = **$44.00**, and a 20-fixture commercial job is $35.00 + 15 x $3.00 = **$80.00**. Beside it, Appendix F gives garbage disposal and hot-water-heater work its own row at a **$35.00 minimum fee**, so the small jobs the fixture block would underprice carry their own floor.\n\nThe underground inspection row is the schedule's only linear-feet charge: $30.00 covers the first 150 feet of gas, water or sewer service underground, and each ten feet beyond — any multiple thereof — adds $0.75. A 300-foot run is $30.00 + 15 x $0.75 = **$41.25**. The row's phrasing prices the *inspection* rather than the pipe, which is why it sits inside the plumbing article rather than being a connection charge.\n\nThe plumbing article carries the doubling clause like every other permit row in Chapter 22: work started without a permit doubles the fee, subject to the inspector's waiver for non-professionals. And §22-185(a) itself just points at Appendix F, so the 2024 adoption of Ordinance #2024-19 is what gives these figures force.",
    notIncluded:
      "This is §22-185's plumbing rows. It excludes:\n\n- **Electrical permits** — free by ordinance (§22-109(a)); no electrical page is published here.\n- **Mechanical permits** (§22-145) for heating, air conditioning and heat pumps — their own page here.\n- **The building permit** for the structure — the building page here, including its nonresidential $20.00-per-set plan review.\n- **Connection and capacity charges** levied by Dover's utilities or Kent County's water and sewer authority — Appendix F prices the underground *inspection*, not the tap.\n- **The doubling penalty** for work started without a permit — a multiplier, not a fee row.\n- **Reinspection charges** ($0/$25/$50/$100) and the article's violation fines, listed separately in Appendix F.",
    workedExample: {
      scenario:
        "A residential kitchen and bath remodel in Dover adding 8 plumbing fixtures, with a 300-foot underground water service inspection on the same permit.",
      inputs: {
        occupancy: "residential",
        fixtures: 8,
        custom: { linear_feet: 300 },
      },
      notes:
        "The fixture row charges $35.00 for the first five fixtures, and each fixture beyond the fifth is $3.00: 3 x $3.00 = **$9.00**, for **$44.00**.\n\nThe underground inspection charges $30.00 for the first 150 feet, and each ten feet beyond is $0.75 with partial tens rounded up: (300 − 150) / 10 = 15 whole tens, 15 x $0.75 = **$11.25**, for **$41.25**.\n\nTotal: $44.00 + $41.25 = **$85.25**. A 310-foot run would round to 16 tens — $42.00 — because 'or multiple thereof' buys the extra foot a whole ten-foot block. Garbage-disposal or water-heater work alone would sit at its own $35.00 minimum row instead of the fixture count.",
    },
    faqs: [
      {
        question: "How much is a plumbing permit in Dover?",
        answer:
          "$35.00 for the first five fixtures plus $3.00 for each additional fixture. Eight fixtures are $44.00; twenty are $80.00.",
      },
      {
        question: "What does a water heater replacement cost to permit?",
        answer:
          "Appendix F gives garbage disposal and hot-water-heater work its own row at a $35.00 minimum fee — the floor the small jobs carry instead of the fixture count.",
      },
      {
        question: "How is the underground inspection priced?",
        answer:
          "$30.00 for the first 150 feet of gas, water or sewer service underground, plus $0.75 for each additional ten feet or multiple thereof. A 300-foot run is $41.25.",
      },
      {
        question: "Is there a per-fixture rate from fixture one?",
        answer:
          "No — the $35.00 covers up to five fixtures. Only fixtures beyond the fifth pay the $3.00 rate.",
      },
      {
        question: "Does the fee double if work started first?",
        answer:
          "Yes — §22-185(b) applies the same doubling clause as every Chapter 22 permit, waivable where neither applicant nor contractor is a professional.",
      },
      {
        question: "Is a sewer tap included in the permit?",
        answer:
          "No — the Appendix F row prices the underground inspection, not the connection; tap and capacity charges are utility bills, not permit fees.",
      },
      {
        question: "How does a commercial plumbing job differ?",
        answer:
          "Only in fixture count: the block structure is the same for all occupancies, so a 20-fixture restaurant is $35.00 + 15 x $3.00 = $80.00 plus any underground rows.",
      },
      {
        question: "What about gas piping?",
        answer:
          "The underground gas inspection row prices the inspection of buried gas service at the same $30.00-first-150-feet structure; above-ground piping work rides the fixture and appliance rows.",
      },
      {
        question: "Are partial hundreds of feet prorated?",
        answer:
          "No — 'or multiple thereof' rounds the excess up to whole ten-foot blocks, so a 305-foot run pays as 310 feet.",
      },
      {
        question: "When did these amounts take effect?",
        answer:
          "With Ordinance #2024-19's adoption of the Appendix F text, final reading July 8, 2024 — the date this site records as effective.",
      },
    ],
  },
];

const verifications: SeedVerification[] = [
  {
    entityType: "source",
    entityKey: DOVER_APPENDIX_F_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: DOVER_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: DOVER_APPENDIX_F_KEY,
    notes:
      "Read 2026-09-26 in full (HTTP 200) from the City of Dover's June 24, 2024 Regular City Council packet (evogov = the City's agenda platform). Ordinances #2024-15 (Chapter 22) and #2024-19 with Staff Amendment #1 (Appendix F) were transcribed row by row: §22-65's three-leg building row, the fence/sign/pool/demolition/moving rows, §22-145's mechanical rows, §22-185's plumbing rows, §22-109's no-fee electrical finding, and the doubling and reinspection clauses. The packet prints first reading June 10, 2024 and second reading July 8, 2024.",
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-LEG-1",
    permitTypeKey: "building",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: DOVER_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: DOVER_APPENDIX_F_KEY,
    notes:
      "Appendix F §22-65(a) Building permits, first leg: $25.00 first $1,000 plus $8.00 per additional $1,000 or multiples thereof up to $10,000,000. Excess rounded up to whole thousands, modelled with incrementCents 100_000.",
  },
  {
    entityType: "fee_rule",
    entityKey: "MECH-AC",
    permitTypeKey: "mechanical",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: DOVER_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: DOVER_APPENDIX_F_KEY,
    notes:
      "Appendix F §22-145(a) Air conditioning permit: $40.00 per ton for the first five tons plus $7.00 per ton over five or multiple thereof. Modelled as a five-ton base ($200.00) with $7.00 per whole additional ton.",
  },
  {
    entityType: "fee_rule",
    entityKey: "PLUMB-FIXTURES",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: DOVER_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: DOVER_APPENDIX_F_KEY,
    notes:
      "Appendix F §22-185(a) Fixtures: $35.00 first five fixtures and $3.00 for each additional fixture. Modelled as a five-fixture base with $3.00 per fixture beyond.",
  },
  {
    entityType: "jurisdiction_profile",
    entityKey: DOVER_KEYS.jurisdiction,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: DOVER_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: DOVER_APPENDIX_F_KEY,
    notes:
      "Profile built from Appendix F's Chapter 22 block in full, with the §22-109(a) no-fee electrical finding stated as the reason the third published page is mechanical rather than electrical.",
  },
  {
    entityType: "permit_page",
    entityKey: "building-permit-fees",
    permitTypeKey: "building",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: DOVER_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: DOVER_APPENDIX_F_KEY,
    notes:
      "Recorded for the editorial gate: this page's prose, sources and fee-rule mapping were checked against the schedule published by City of Dover, Delaware during the research pass that produced this seed; the seed's content tests assert the arithmetic. No amount on this page is estimated.",
  },
  {
    entityType: "permit_page",
    entityKey: "mechanical-permit-fees",
    permitTypeKey: "mechanical",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: DOVER_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: DOVER_APPENDIX_F_KEY,
    notes:
      "Recorded for the editorial gate: this page's prose, sources and fee-rule mapping were checked against the schedule published by City of Dover, Delaware during the research pass that produced this seed; the seed's content tests assert the arithmetic. No amount on this page is estimated.",
  },
  {
    entityType: "permit_page",
    entityKey: "plumbing-permit-fees",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: DOVER_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: DOVER_APPENDIX_F_KEY,
    notes:
      "Recorded for the editorial gate: this page's prose, sources and fee-rule mapping were checked against the schedule published by City of Dover, Delaware during the research pass that produced this seed; the seed's content tests assert the arithmetic. No amount on this page is estimated.",
  },
];

export const doverSeed: JurisdictionSeed = {
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
export const DOVER_PUBLISHED_PERMIT_PAGES = doverSeed.permitPages.filter(
  (page) => page.publishStatus === "published" && !page.noindex,
);
