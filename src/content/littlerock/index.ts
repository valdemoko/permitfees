import type { JurisdictionSeed } from "@/content/seed-types";
import {
  LR_BUILDING_RULES,
  LR_BUILDING_SOURCE_KEY,
  LR_ELECTRICAL_RULES,
  LR_FEE_EFFECTIVE_FROM,
  LR_PLUMBING_RULES,
} from "@/content/littlerock/fee-rules";

export const LR_LAST_VERIFIED = "2026-09-26";

export const LR_KEYS = {
  state: "ar",
  county: "pulaski-county-ar",
  jurisdiction: "little-rock",
} as const;

const state = {
  code: "AR",
  slug: "arkansas",
  name: "Arkansas",
  fipsCode: "05",
};

const county = {
  key: LR_KEYS.county,
  slug: "pulaski-county-ar",
  name: "Pulaski County",
  fipsCode: "05119",
};

const CITY_URL = "https://www.littlerock.gov";
const BUILDING_CODES_URL =
  "https://littlerock.gov/government/city-departments/planning-and-development/";
const CODE_TEXT_URL =
  "https://web.littlerock.state.ar.us/WebLink/DocView.aspx?id=40904";
const PERMIT_PORTAL_URL = "https://etrakit.littlerockar.gov/etrakit/";

export const littlerockSeed: JurisdictionSeed = {
  state,
  county,

  jurisdiction: {
    key: LR_KEYS.jurisdiction,
    stateKey: LR_KEYS.state,
    countyKey: LR_KEYS.county,
    type: "city",
    slug: "little-rock",
    name: "Little Rock",
    officialName: "City of Little Rock — Planning & Development Department, Building Codes Division",
    websiteUrl: CITY_URL,
    permitPortalUrl: PERMIT_PORTAL_URL,
    timezone: "America/Chicago",
    isActive: true,
  },

  departments: [
    {
      key: "littlerock-building-codes",
      jurisdictionKey: LR_KEYS.jurisdiction,
      kind: "building",
      name: "Little Rock Building Codes Division",
      phone: "(501) 371-4790",
      email: null,
      url: BUILDING_CODES_URL,
      addressLine: "700 W. Markham Street, Little Rock, AR 72201",
      hours: "Monday – Friday, 8:00 a.m. – 5:00 p.m. CT",
      notes:
        "The Building Codes Division within Planning & Development administers the Arkansas Fire Prevention Code, issues building, electrical, plumbing and mechanical permits under City Code Sec. 8-31, and conducts inspections citywide.",
    },
  ],

  sources: [
    {
      key: LR_BUILDING_SOURCE_KEY,
      jurisdictionKey: LR_KEYS.jurisdiction,
      title:
        "Little Rock City Code, Chapter 8 Art. III, Sec. 8-31 — Building permits and permit fees",
      url: CODE_TEXT_URL,
      sourceType: "municipal_code",
      issuingAuthority: "City of Little Rock Board of Directors",
      authorityKind: "city",
      isPrimary: true,
      documentDate: "2005-11-06",
      effectiveFrom: LR_FEE_EFFECTIVE_FROM,
      retrievedAt: "2026-09-26",
      lastVerifiedAt: LR_LAST_VERIFIED,
      notes:
        "Sec. 8-31(c) establishes the permit fee schedules for building, electrical, plumbing, mechanical and other related work. Full text of the published City of Little Rock Building Code (including Sec. 8-31's fee tables) read via the City's WebLink record; a public full-text mirror of the same code (archive.org/details/gov.ar.littlerock.buiding) was used for reading because the WebLink server requires cookie sign-in for scripted access.",
    },
    {
      key: "littlerock-planning-development",
      jurisdictionKey: LR_KEYS.jurisdiction,
      title: "Planning & Development Department — Building Codes Division",
      url: BUILDING_CODES_URL,
      sourceType: "municipal_website",
      issuingAuthority: "City of Little Rock",
      authorityKind: "city",
      isPrimary: true,
      documentDate: null,
      effectiveFrom: null,
      retrievedAt: "2026-09-26",
      lastVerifiedAt: LR_LAST_VERIFIED,
      notes:
        "Department page naming the Building Codes Division as the permit issuer and linking the eTrakit portal.",
    },
  ],

  permitTypes: [],
  projectTypes: [],

  jurisdictionPermitTypes: [
    {
      jurisdictionKey: LR_KEYS.jurisdiction,
      permitTypeKey: "building",
      isAvailable: true,
      localName: "Building Permit",
      officialUrl: CODE_TEXT_URL,
      notes:
        "Sec. 8-31(c)(I): valuation ladder ($30 base structure) plus a 50% commercial plan-checking fee, a $3–$8 data processing fee and a $30 minimum.",
    },
    {
      jurisdictionKey: LR_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      isAvailable: true,
      localName: "Electrical Permit",
      officialUrl: CODE_TEXT_URL,
      notes:
        "Sec. 8-31(c)(II): new dwellings at $0.08/sq ft under roof; load centers and openings ladders; $30 minimum.",
    },
    {
      jurisdictionKey: LR_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      isAvailable: true,
      localName: "Plumbing Permit",
      officialUrl: CODE_TEXT_URL,
      notes:
        "Sec. 8-31(c)(III): new dwellings at $0.08/sq ft under roof; unit-cost price list ($5.00 per fixture outlet); $30 minimum.",
    },
  ],

  feeSchedules: [
    {
      key: "littlerock-fee-schedule",
      jurisdictionKey: LR_KEYS.jurisdiction,
      sourceKey: LR_BUILDING_SOURCE_KEY,
      title: "City of Little Rock Permit Fee Schedules (Sec. 8-31(c))",
      officialUrl: CODE_TEXT_URL,
      effectiveFrom: LR_FEE_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: LR_LAST_VERIFIED,
      notes:
        "One code section carries all four trade schedules (building, electrical, plumbing, mechanical). Ord. No. 2005-153 (2005-11-06) is the most recent fee-establishing ordinance identified.",
    },
  ],

  feeRules: [
    ...LR_BUILDING_RULES.map((rule) => ({
      jurisdictionKey: LR_KEYS.jurisdiction,
      permitTypeKey: "building",
      scheduleKey: "littlerock-fee-schedule",
      rule,
    })),
    ...LR_ELECTRICAL_RULES.map((rule) => ({
      jurisdictionKey: LR_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      scheduleKey: "littlerock-fee-schedule",
      rule,
    })),
    ...LR_PLUMBING_RULES.map((rule) => ({
      jurisdictionKey: LR_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      scheduleKey: "littlerock-fee-schedule",
      rule,
    })),
  ],

  requirements: [
    {
      jurisdictionKey: LR_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "document",
      title: "Valuation documentation (contract or affidavit)",
      description:
        "Proper documentation — a copy of the contract or a letter of affidavit from the applicant — must be presented when obtaining permits. Without it, the latest ICC building valuation data chart determines the permit valuation.",
      isMandatory: true,
      sortOrder: 1,
      sourceKey: LR_BUILDING_SOURCE_KEY,
      lastVerifiedAt: LR_LAST_VERIFIED,
    },
    {
      jurisdictionKey: LR_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "license",
      title: "State contractor registration for new dwellings",
      description:
        "Applications for a new dwelling (1–4 units) built for sale must include the applicant's Secretary of State certificate of registration (A.C.A. ch. 17, tit. 47) and a statement that it is in full force.",
      isMandatory: true,
      sortOrder: 2,
      sourceKey: LR_BUILDING_SOURCE_KEY,
      lastVerifiedAt: LR_LAST_VERIFIED,
    },
    {
      jurisdictionKey: LR_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      requirementType: "license",
      title: "Licensed electrician / homeowner examination",
      description:
        "Electrical permits are issued to registered electrical contractors; a homeowner may take the City's $35.00 homeowner (electrical) examination to work on their own residence.",
      isMandatory: true,
      sortOrder: 3,
      sourceKey: LR_BUILDING_SOURCE_KEY,
      lastVerifiedAt: LR_LAST_VERIFIED,
    },
    {
      jurisdictionKey: LR_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      requirementType: "license",
      title: "State-licensed master plumber",
      description:
        "Plumbing permits must be pulled under the supervision of a state-licensed master plumber registered with the City.",
      isMandatory: true,
      sortOrder: 4,
      sourceKey: LR_BUILDING_SOURCE_KEY,
      lastVerifiedAt: LR_LAST_VERIFIED,
    },
  ],

  profile: {
    jurisdictionKey: LR_KEYS.jurisdiction,
    headline: "Little Rock, Arkansas Permit Fees & Building Codes",
    summary:
      "The Little Rock Building Codes Division issues building, electrical, plumbing and mechanical permits under City Code Sec. 8-31. Building permit fees follow a valuation ladder that starts at $30.00 (first $500 up to $2,000, plus $3.50 per additional $1,000 or fraction) and runs to $1,158.00 plus $1.60 per $1,000 above $500,000. Commercial projects also pay a plan-checking fee equal to one-half of the building permit fee (minimum $50.00), and every permit carries a $3–$8 data processing fee and a $30.00 minimum. Electrical and plumbing work on new one- and two-family dwellings is priced at $0.08 per square foot under roof; other work is priced from unit-cost schedules.",
    localContext:
      "Little Rock anchors a consolidated city-county permitting landscape in Pulaski County: the City's Building Codes Division permits everything inside city limits, while Pulaski County and neighboring cities (North Little Rock, Jacksonville) run their own offices for work outside it. The City cuts permit fees by 75% in three Targeted Neighborhood Enhancement Areas — Central High, Downtown and Philander Smith — a reinvestment incentive written directly into Sec. 8-31's fee section.\n\nPlan review is split by occupancy: residential construction proceeds with over-the-counter review, while commercial plans pay the plan-checking fee described on this page. The data processing fee that rides every permit funds the division's permitting software and staff training.",
    valuationBasis:
      "Valuation is the total value of the work, including labor and materials. Applicants must present a copy of the contract or an affidavit; when documentation is not presented, the Building Codes Division uses the ICC building valuation data chart to set the permit valuation.",
    notIncluded:
      "These figures cover the City of Little Rock building, electrical and plumbing permit fees only. They exclude:\n\n- **Mechanical (HVAC) permits**, priced on a separate schedule in the same section.\n- **Pulaski County and state permits** — septic systems, floodplain and right-of-way work.\n- **Little Rock Water Reclamation Authority** connection and capacity charges.\n- **Fire marshal plan review** for suppression systems and special-events permits.\n- **Zoning, boarding and variance application fees** from the Planning Department.",
    seoTitle: "Little Rock AR Permit Fees | Sec. 8-31 Fee Schedule & Calculator",
    seoDescription:
      "Calculate Little Rock building permit costs: valuation ladder from $30, 50% commercial plan check, $3–$8 data fee. Electrical & plumbing $0.08/sq ft for new dwellings.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: LR_LAST_VERIFIED,
  },

  permitPages: [
    {
      jurisdictionKey: LR_KEYS.jurisdiction,
      permitTypeKey: "building",
      slug: "building-permit-cost",
      title: "Little Rock Building Permit Cost",
      intro:
        "A City of Little Rock building permit is priced from **construction valuation** on the ladder in City Code Sec. 8-31(c)(I). Fees start at **$30.00 for the first $500 up to $2,000** plus **$3.50 per additional $1,000 or fraction thereof** to $50,000, then step down: **$198.00 + $2.40** per $1,000 to $100,000, **$318.00 + $2.10** to $500,000, and **$1,158.00 + $1.60** above it. Commercial projects requiring plans also pay a **plan-checking fee of one-half the building permit fee (minimum $50.00)**, and every permit carries a **data processing fee** of $3–$8 and a **$30.00 minimum**.",
      localSummary:
        "Building permits are issued by the Building Codes Division at 700 W. Markham Street and applied for through the City's eTrakit portal. Permits are required for new construction, additions, structural alterations, demolition ($0.08/sq ft of floor area, $30 minimum) and most accessory work. Three targeted neighborhoods — Central High, Downtown and Philander Smith — receive a 75% residential fee reduction as a reinvestment incentive. Unpermitted work triples the fee.",
      notIncluded:
        "This estimate covers the City of Little Rock building permit, plan-checking and data processing fees only. It excludes:\n\n- **Electrical, plumbing and mechanical permits**, which are issued separately.\n- **Impact, sidewalk and routing assessments** charged by other City departments.\n- **Fire marshal review** for suppression systems and tents.\n- **Water Reclamation Authority** tap and capacity charges.\n- **State and county permits** for septic systems and state-managed rights-of-way.",
      workedExample: {
        scenario:
          "A commercial tenant build-out in Little Rock with an estimated construction valuation of $220,000, plans submitted for review.",
        inputs: {
          valuationCents: 22_000_000,
          squareFootage: 4_000,
          occupancy: "commercial",
          workType: "alteration",
        },
        notes:
          "Sec. 8-31(c)(I) band $100,001–$500,000: **$318.00** for the first $100,000 plus $2.10 × 120 whole thousands (fraction rounds up) = **$252.00** → permit **$570.00**. Plan check (commercial, plans required): 50% × $570.00 = **$285.00**. Data processing fee ($100,001–$500,000 band): **$6.00**. Total: **$861.00**.",
      },
      faqs: [
        {
          question: "How is a Little Rock building permit fee calculated?",
          answer:
            "From total construction valuation on the Sec. 8-31(c)(I) ladder. Each band states a base amount for its lower range plus a per-$1,000 rate (or fraction thereof) for the remainder. A $220,000 project, for example, pays $318.00 for the first $100,000 plus $2.10 × 120 = $570.00.",
          sourceId: LR_BUILDING_SOURCE_KEY,
          attribution: "Little Rock City Code Sec. 8-31(c)(I)",
        },
        {
          question: "What is the minimum building permit fee in Little Rock?",
          answer:
            "The minimum fee for any permit is $30.00 (Sec. 8-31(c)(I)(B)). Work valued at $500 or less carries no fee unless an inspection is required, in which case $20.00 is charged per inspection — but any permit issued is floored at $30.00.",
          sourceId: LR_BUILDING_SOURCE_KEY,
          attribution: "Little Rock City Code Sec. 8-31(c)(I)(A)–(B)",
        },
        {
          question: "Does Little Rock charge a plan review fee?",
          answer:
            "Yes, for commercial work. When valuation exceeds $500 and plans are required, a plan-checking fee equal to one-half of the building permit fee is collected at submission, with a $50.00 minimum for new construction, repairs, remodels and miscellaneous permits. It is nonrefundable and in addition to the permit fee.",
          sourceId: LR_BUILDING_SOURCE_KEY,
          attribution: "Little Rock City Code Sec. 8-31(c)(I)(C)",
        },
        {
          question: "What is the data processing fee on a Little Rock permit?",
          answer:
            "A flat $3.00 (valuation $501–$50,000), $4.00 ($50,001–$100,000), $6.00 ($100,001–$500,000) or $8.00 ($500,001 and up), charged on building, electrical, plumbing and mechanical permits alike. It funds permitting software and staff training.",
          sourceId: LR_BUILDING_SOURCE_KEY,
          attribution: "Little Rock City Code Sec. 8-31(c)(I)(D)",
        },
        {
          question: "How much does a demolition permit cost in Little Rock?",
          answer:
            "Demolition of a structure is $0.08 per square foot of floor area with a $30.00 minimum fee. The demolition permit expires one year from issuance.",
          sourceId: LR_BUILDING_SOURCE_KEY,
          attribution: "Little Rock City Code Sec. 8-31(c)(I)(F)",
        },
        {
          question: "Do targeted neighborhoods get a permit fee discount?",
          answer:
            "Yes. Residential building, electrical, plumbing and mechanical fees in the Central High, Downtown and Philander Smith Targeted Neighborhood Enhancement Areas are reduced by 75% (rounded to the nearest dollar), but never below the $30.00 minimum.",
          sourceId: LR_BUILDING_SOURCE_KEY,
          attribution: "Little Rock City Code Sec. 8-31(b)",
        },
        {
          question: "What happens if I build without a permit in Little Rock?",
          answer:
            "Where work requiring a permit starts before one is obtained, the fee that would have been charged is tripled. Payment of the triple fee does not excuse compliance or other penalties.",
          sourceId: LR_BUILDING_SOURCE_KEY,
          attribution: "Little Rock City Code Sec. 8-31(c)(I)(P)",
        },
        {
          question: "How long does a Little Rock building permit stay valid?",
          answer:
            "Permits valued at $50,000 or less expire after one year ($30.00 per 90-day extension); $50,001–$500,000 after two years ($50.00 per extension); above $500,000 after three years ($70.00 per extension). Work not started within six months invalidates the permit.",
          sourceId: LR_BUILDING_SOURCE_KEY,
          attribution: "Little Rock City Code Sec. 8-31(c)(I)(S)",
        },
      ],
      seoTitle: "Little Rock AR Building Permit Cost (Valuation Table & Plan Check)",
      seoDescription:
        "Little Rock building permit fees on the Sec. 8-31 valuation ladder, plus the 50% commercial plan-checking fee, data processing fee and $30 minimum.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: LR_LAST_VERIFIED,
    },
    {
      jurisdictionKey: LR_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      slug: "electrical-permit-cost",
      title: "Little Rock Electrical Permit Cost",
      intro:
        "Little Rock electrical permits are priced under City Code Sec. 8-31(c)(II). A **new one- or two-family dwelling** pays **$0.08 per square foot under roof** — about $160 on a 2,000-square-foot house. Everything else is priced from the **load-center ladder** ($8.00 up to 60 amps to $33.00 at 200 amps, then $5.00 per 100 amps over) and the **openings ladder** ($10.00 for 1–20 openings to $80.00 for 301–400, then $5.00 per 25 over), with a **$30.00 minimum** and the citywide **data processing fee** of $3–$8.",
      localSummary:
        "Electrical permits are issued to registered electrical contractors through the Building Codes Division; homeowners may take the City's $35.00 homeowner examination to wire their own residence. Permits cover service changes, panel upgrades, new circuits, temporary power ($20.00) and signs ($25.00). Inspections and reinspections run $20.00 and $40.00 respectively when not covered by the permit fee. Unpermitted work triples the fee.",
      notIncluded:
        "This estimate covers the City of Little Rock electrical permit fees only. It excludes:\n\n- **Entergy Arkansas** service connection, metering and transformer charges.\n- **Building, plumbing and mechanical permits** for the same project.\n- **Fire alarm plan review** by the Fire Department.\n- **Sign permits** issued through Planning for zoning clearance (the $25.00 electrical sign fee is separate).\n- **State licensing and registration fees** for electrical contractors.",
      workedExample: {
        scenario:
          "A new one-family dwelling in Little Rock, 2,000 square feet under roof, with 200-amp service and a permit for the complete electrical installation.",
        inputs: {
          squareFootage: 2_000,
          valuationCents: 3_000_000,
          occupancy: "residential",
          workType: "new_construction",
        },
        notes:
          "Sec. 8-31(c)(II)(A)(1): 2,000 sq ft × $0.08 = **$160.00**. Data processing fee ($501–$50,000 band): **$3.00**. Total: **$163.00**. (The load-center and openings ladders price repair/alteration permits; a new dwelling's service and wiring are inside the square-foot rate.)",
      },
      faqs: [
        {
          question: "How much is an electrical permit for a new house in Little Rock?",
          answer:
            "New one- and two-family dwellings pay $0.08 per square foot under roof — $160.00 for a 2,000-square-foot house — plus the $3.00 data processing fee. The rate covers the dwelling's complete wiring, service equipment and garage.",
          sourceId: LR_BUILDING_SOURCE_KEY,
          attribution: "Little Rock City Code Sec. 8-31(c)(II)(A)(1)",
        },
        {
          question: "How is an electrical permit for a panel upgrade priced?",
          answer:
            "By the load-center ladder: $8.00 up to 60 amps, $16.00 to 100 amps, $24.00 to 150 amps, $33.00 to 200 amps, and $5.00 per 100 amps over 200. A 200-amp panel swap pays $33.00 plus the data processing fee, subject to the $30.00 minimum.",
          sourceId: LR_BUILDING_SOURCE_KEY,
          attribution: "Little Rock City Code Sec. 8-31(c)(II)(C)(2)",
        },
        {
          question: "What are the fees for electrical openings?",
          answer:
            "The openings ladder prices $10.00 for 1–20 openings, $25.00 for 21–60, $30.00 for 61–100, $50.00 for 101–200, $65.00 for 201–300, $80.00 for 301–400, and $5.00 for each 25 openings over 400.",
          sourceId: LR_BUILDING_SOURCE_KEY,
          attribution: "Little Rock City Code Sec. 8-31(c)(II)(C)(3)",
        },
        {
          question: "What is the minimum electrical permit fee in Little Rock?",
          answer:
            "The minimum electrical permit is $30.00 (Sec. 8-31(c)(II)(G)). A small job priced below that — say a single load center at $8.00 — pays the $30.00 floor.",
          sourceId: LR_BUILDING_SOURCE_KEY,
          attribution: "Little Rock City Code Sec. 8-31(c)(II)(G)",
        },
        {
          question: "Can a homeowner pull an electrical permit in Little Rock?",
          answer:
            "A homeowner may perform electrical work on their own residence after passing the City's homeowner (electrical) examination, which carries a $35.00 fee, and paying the applicable permit fees in advance.",
          sourceId: LR_BUILDING_SOURCE_KEY,
          attribution: "Little Rock City Code Sec. 8-31(c)(II)(E)(1)",
        },
        {
          question: "Does Little Rock charge triple for unpermitted electrical work?",
          answer:
            "Yes. Work installed or put into use without a permit incurs a fee equal to three times what the permit would have cost, and no additional permits are granted until it is paid.",
          sourceId: LR_BUILDING_SOURCE_KEY,
          attribution: "Little Rock City Code Sec. 8-31(c)(II)(H)",
        },
        {
          question: "How much is temporary power and reinspection?",
          answer:
            "Temporary power to a building is $20.00; each inspection is $20.00 and each reinspection $40.00 where conditions of the fee section apply.",
          sourceId: LR_BUILDING_SOURCE_KEY,
          attribution: "Little Rock City Code Sec. 8-31(c)(II)(C)(5), (C)(16)–(17)",
        },
      ],
      seoTitle: "Little Rock AR Electrical Permit Cost & Requirements",
      seoDescription:
        "Little Rock electrical permit fees: $0.08/sq ft for new dwellings, load-center and openings ladders, $30 minimum. Full Sec. 8-31(c)(II) schedule.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: LR_LAST_VERIFIED,
    },
    {
      jurisdictionKey: LR_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      slug: "plumbing-permit-cost",
      title: "Little Rock Plumbing Permit Cost",
      intro:
        "Little Rock plumbing permits are priced under City Code Sec. 8-31(c)(III). A **new one- or two-family dwelling** pays **$0.08 per square foot under roof**. Repair, alteration and addition work — and all other occupancies — pay the **unit-cost schedule**: **$5.00 per plumbing fixture outlet or appliance**, **$25.00** for a water service or gas housepiping, and **$15.00** for a water heater, with a **$30.00 minimum** and the citywide **data processing fee** of $3–$8. Work outside city limits carries a 50% surcharge.",
      localSummary:
        "Plumbing permits are issued under the supervision of a state-licensed master plumber registered with the City, through the Building Codes Division. Permits cover fixture rough-ins, water and sewer services, water heaters, gas piping and drain work; inspections run $20.00 where separately charged. Central Arkansas winters are mild by national standards, but Little Rock sits in climate zone 3A and supply lines outside the thermal envelope still need freeze protection. Unpermitted work triples the fee.",
      notIncluded:
        "This estimate covers the City of Little Rock plumbing permit fees only. It excludes:\n\n- **Central Arkansas Water** tap, meter and impact fees.\n- **Little Rock Water Reclamation Authority** sewer connection charges.\n- **Building, electrical and mechanical permits** for the same project.\n- **State plumbing licensing** fees for contractors and journeyman registrations.\n- **Septic system permits** from the Arkansas Department of Health or Pulaski County.",
      workedExample: {
        scenario:
          "A bathroom remodel in an existing Little Rock home: 6 fixture outlets (toilet, lavatory, tub/shower, floor drain, washing machine box, sill cock) plus a water heater replacement.",
        inputs: {
          valuationCents: 1_500_000,
          occupancy: "residential",
          workType: "alteration",
          fixtures: 6,
          custom: { water_heaters: 1 },
        },
        notes:
          "Sec. 8-31(c)(III)(B)(1): 6 fixture outlets × $5.00 = **$30.00**. (B)(17) water heater: **$15.00**. Data processing fee ($501–$50,000 band): **$3.00**. Total: **$48.00**.",
      },
      faqs: [
        {
          question: "How is a Little Rock plumbing permit fee calculated?",
          answer:
            "New one- and two-family dwellings pay $0.08 per square foot under roof. All other work pays unit costs: $5.00 for each plumbing fixture outlet or appliance — every water closet, sink, tub, shower, floor drain and similar element — plus specific amounts for services ($25.00), water heaters ($15.00) and gas housepiping ($25.00).",
          sourceId: LR_BUILDING_SOURCE_KEY,
          attribution: "Little Rock City Code Sec. 8-31(c)(III)",
        },
        {
          question: "What is the minimum plumbing permit fee in Little Rock?",
          answer:
            "The minimum fee for any plumbing permit is $30.00. A single-fixture repair priced at $5.00 pays the $30.00 floor.",
          sourceId: LR_BUILDING_SOURCE_KEY,
          attribution: "Little Rock City Code Sec. 8-31(c)(III)(E)",
        },
        {
          question: "How much is a water heater permit in Little Rock?",
          answer:
            "A water heater replacement is $15.00 on the unit-cost schedule, plus the data processing fee — $18.00 for work under $50,000 in valuation. Note the $30.00 minimum: a water heater alone pays $30.00.",
          sourceId: LR_BUILDING_SOURCE_KEY,
          attribution: "Little Rock City Code Sec. 8-31(c)(III)(B)(17)",
        },
        {
          question: "Does Little Rock charge extra for plumbing work outside city limits?",
          answer:
            "Yes. Work located out of the city limits is charged a surcharge of 50% of the total permit charge, a provision aimed at properties inside the City's water-service area.",
          sourceId: LR_BUILDING_SOURCE_KEY,
          attribution: "Little Rock City Code Sec. 8-31(c)(III)(D)",
        },
        {
          question: "Who can pull a plumbing permit in Little Rock?",
          answer:
            "Plumbing installations must be supervised by a master plumber licensed by the state and registered with the City. A homeowner may perform plumbing in their own residence after appearing before the plumbing inspector.",
          sourceId: LR_BUILDING_SOURCE_KEY,
          attribution: "Little Rock City Code Sec. 8-31(c)(III); registration provisions of the code",
        },
        {
          question: "What counts as a fixture outlet for the $5.00 fee?",
          answer:
            "The code's list is long and explicit: each water closet, urinal, bidet, sink, lavatory, basin, laundry sink, wash tray, bath tub, hot tub, shower, sauna, drinking fountain, wet bar, washing machine, hose cabinet, fire pump, sewer ejector, cooling tower, sill cock, dental unit, hub drain, floor/area/roof drain, sand trap, grease trap, sump pump and any other element commonly known as a plumbing fixture.",
          sourceId: LR_BUILDING_SOURCE_KEY,
          attribution: "Little Rock City Code Sec. 8-31(c)(III)(B)(1)",
        },
        {
          question: "How much is a plumbing permit for a new house in Little Rock?",
          answer:
            "New one- and two-family dwellings pay $0.08 per square foot under roof — $192.00 for a 2,400-square-foot house — plus the data processing fee. The rate covers the dwelling's complete plumbing installation.",
          sourceId: LR_BUILDING_SOURCE_KEY,
          attribution: "Little Rock City Code Sec. 8-31(c)(III)(A)(1)",
        },
        {
          question: "What is the penalty for unpermitted plumbing work?",
          answer:
            "The violator pays a fee equal to three times the permit fee that would have applied, in addition to any fine or imprisonment under the penalty section of the code.",
          sourceId: LR_BUILDING_SOURCE_KEY,
          attribution: "Little Rock City Code Sec. 8-31(c)(III)(F)",
        },
      ],
      seoTitle: "Little Rock AR Plumbing Permit Cost & Requirements",
      seoDescription:
        "Little Rock plumbing permit fees: $0.08/sq ft for new dwellings, $5.00 per fixture outlet, $15 water heater, $30 minimum. Full Sec. 8-31(c)(III) schedule.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: LR_LAST_VERIFIED,
    },
  ],

  verifications: [
    {
      entityType: "jurisdiction_profile",
      entityKey: LR_KEYS.jurisdiction,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: LR_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Arkansas Expansion",
      sourceKey: LR_BUILDING_SOURCE_KEY,
      notes:
        "Verified against the published text of Little Rock City Code Sec. 8-31 read from the City's WebLink record (public full-text mirror used for reading).",
    },
    {
      entityType: "fee_schedule",
      entityKey: "littlerock-fee-schedule",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: LR_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Arkansas Expansion",
      sourceKey: LR_BUILDING_SOURCE_KEY,
      notes:
        "Verified the Sec. 8-31(c) valuation ladder, 50% commercial plan-checking fee, data processing fee bands and $30 minimums.",
    },
    {
      entityType: "permit_page",
      entityKey: "building-permit-cost",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: LR_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Arkansas Expansion",
      sourceKey: LR_BUILDING_SOURCE_KEY,
      notes: "Passed editorial gate checks for Little Rock building permit page.",
    },
    {
      entityType: "permit_page",
      entityKey: "electrical-permit-cost",
      permitTypeKey: "electrical",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: LR_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Arkansas Expansion",
      sourceKey: LR_BUILDING_SOURCE_KEY,
      notes: "Passed editorial gate checks for Little Rock electrical permit page.",
    },
    {
      entityType: "permit_page",
      entityKey: "plumbing-permit-cost",
      permitTypeKey: "plumbing",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: LR_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Arkansas Expansion",
      sourceKey: LR_BUILDING_SOURCE_KEY,
      notes: "Passed editorial gate checks for Little Rock plumbing permit page.",
    },
  ],
};
