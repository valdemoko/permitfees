import type { JurisdictionSeed } from "@/content/seed-types";
import {
  FS_BUILDING_RULES,
  FS_BUILDING_SOURCE_KEY,
  FS_ELECTRICAL_RULES,
  FS_ELECTRICAL_SOURCE_KEY,
  FS_FEE_EFFECTIVE_FROM,
  FS_PLUMBING_RULES,
  FS_PLUMBING_SOURCE_KEY,
} from "@/content/fortsmith/fee-rules";

export const FS_LAST_VERIFIED = "2026-09-26";

export const FS_KEYS = {
  state: "ar",
  county: "sebastian-county",
  jurisdiction: "fort-smith",
} as const;

const state = {
  code: "AR",
  slug: "arkansas",
  name: "Arkansas",
  fipsCode: "05",
};

const county = {
  key: FS_KEYS.county,
  slug: "sebastian-county",
  name: "Sebastian County",
  fipsCode: "05131",
};

const CITY_URL = "https://www.fortsmithar.gov";
const BUILDING_DEV_URL =
  "https://www.fortsmithar.gov/building-business/building-development/building-development-permits/permit-fee-schedule";
const BUILDING_CODE_URL =
  "https://library.municode.com/ar/fort_smith/codes/code_of_ordinances?nodeId=COOR_CH6BUBURE_ARTIIBUCO_S6-30FESC";
const ELECTRICAL_CODE_URL =
  "https://library.municode.com/ar/fort_smith/codes/code_of_ordinances?nodeId=COOR_CH6BUBURE_ARTIIIELCO_DIV2ADEN_SDIIPEINET_S6-75PEFE";
const PLUMBING_CODE_URL =
  "https://library.municode.com/ar/fort_smith/codes/code_of_ordinances?nodeId=COOR_CH6BUBURE_ARTVIPLGA_DIV1GE_S6-242IN";
const PERMIT_PORTAL_URL = "https://cityview2.iharriscomputer.com/FortSmithARPortal/";

export const fortsmithSeed: JurisdictionSeed = {
  state,
  county,

  jurisdiction: {
    key: FS_KEYS.jurisdiction,
    stateKey: FS_KEYS.state,
    countyKey: FS_KEYS.county,
    type: "city",
    slug: "fort-smith",
    name: "Fort Smith",
    officialName: "City of Fort Smith — Building & Development, Building Safety Division",
    websiteUrl: CITY_URL,
    permitPortalUrl: PERMIT_PORTAL_URL,
    timezone: "America/Chicago",
    isActive: true,
  },

  departments: [
    {
      key: "fortsmith-building-safety",
      jurisdictionKey: FS_KEYS.jurisdiction,
      kind: "building",
      name: "Fort Smith Building Safety Division",
      phone: "(479) 784-1000",
      email: null,
      url: BUILDING_DEV_URL,
      addressLine: "623 Garrison Avenue, Fort Smith, AR 72901",
      hours: "Monday – Friday, 8:00 a.m. – 5:00 p.m. CT",
      notes:
        "The Building Safety Division administers the Arkansas Fire Prevention Code (2021 IBC volume), the Arkansas Plumbing Code, the Arkansas Mechanical Code and the NEC as amended locally; issues building, electrical, mechanical and plumbing permits under Chapter 6 of the Code of Ordinances; and conducts inspections, including for the plumbing 'transfer area' south of the city per Ord. 96-05.",
    },
  ],

  sources: [
    {
      key: FS_BUILDING_SOURCE_KEY,
      jurisdictionKey: FS_KEYS.jurisdiction,
      title: "Fort Smith Code of Ordinances Ch. 6 Art. II, Sec. 6-30 — Fee schedule",
      url: BUILDING_CODE_URL,
      sourceType: "municipal_code",
      issuingAuthority: "City of Fort Smith Board of Directors",
      authorityKind: "city",
      isPrimary: true,
      documentDate: "1999-04-20",
      effectiveFrom: FS_FEE_EFFECTIVE_FROM,
      retrievedAt: "2026-09-26",
      lastVerifiedAt: FS_LAST_VERIFIED,
      notes:
        "Sec. 6-30 (Ord. 23-99; Ord. 108-09, altered in the 2019 recodification) carries the residential and nonresidential cost-of-construction ladders, the residential minimum-valuation chart, demolition and plan review at 20% capped at $1,500. Read from the Municode Library consolidation, which is where the City's own fee-schedule page links.",
    },
    {
      key: FS_ELECTRICAL_SOURCE_KEY,
      jurisdictionKey: FS_KEYS.jurisdiction,
      title: "Fort Smith Code of Ordinances Ch. 6 Art. III, Sec. 6-75 — Permit fees",
      url: ELECTRICAL_CODE_URL,
      sourceType: "municipal_code",
      issuingAuthority: "City of Fort Smith Board of Directors",
      authorityKind: "city",
      isPrimary: true,
      documentDate: "1999-04-20",
      effectiveFrom: FS_FEE_EFFECTIVE_FROM,
      retrievedAt: "2026-09-26",
      lastVerifiedAt: FS_LAST_VERIFIED,
      notes:
        "Sec. 6-75 (Ord. 23-99) prices electrical permits by active circuits ($5.50/$5.00/$4.50/$4.00/$3.50 per circuit by band) with a $30.00 minimum inspection fee, plus flat rows for panel replacement, temporary service, mobile-home service, signs, generators and transformers.",
    },
    {
      key: FS_PLUMBING_SOURCE_KEY,
      jurisdictionKey: FS_KEYS.jurisdiction,
      title: "Fort Smith Code of Ordinances Ch. 6 Art. VI, Sec. 6-242(b) — Inspection fees",
      url: PLUMBING_CODE_URL,
      sourceType: "municipal_code",
      issuingAuthority: "City of Fort Smith Board of Directors",
      authorityKind: "city",
      isPrimary: true,
      documentDate: "2002-09-17",
      effectiveFrom: FS_FEE_EFFECTIVE_FROM,
      retrievedAt: "2026-09-26",
      lastVerifiedAt: FS_LAST_VERIFIED,
      notes:
        "Sec. 6-242(b) (Ord. 23-99; Ord. 55-02) prices plumbing inspections per fixture outlet ($5.50), water/sewer service ($5.50), appliance ($4.00), gas service ($5.50 for up to five outlets, $1.50 each additional), final inspection ($12.00) with a $24.00 minimum fee.",
    },
    {
      key: "fortsmith-building-development",
      jurisdictionKey: FS_KEYS.jurisdiction,
      title: "Building Permit Fee Schedule Information — Fort Smith Building & Development",
      url: BUILDING_DEV_URL,
      sourceType: "municipal_website",
      issuingAuthority: "City of Fort Smith",
      authorityKind: "city",
      isPrimary: true,
      documentDate: null,
      effectiveFrom: null,
      retrievedAt: "2026-09-26",
      lastVerifiedAt: FS_LAST_VERIFIED,
      notes:
        "The City's fee-schedule hub page. Its four fee links point at the Municode sections for Secs. 6-30, 6-75, 6-242 and the mechanical schedule — the routing that identifies the operative code texts. The page itself 403s scripted requests (Akamai) and was read in a browser session.",
    },
  ],

  permitTypes: [],
  projectTypes: [],

  jurisdictionPermitTypes: [
    {
      jurisdictionKey: FS_KEYS.jurisdiction,
      permitTypeKey: "building",
      isAvailable: true,
      localName: "Building Permit",
      officialUrl: BUILDING_CODE_URL,
      notes:
        "Sec. 6-30: cost-of-construction ladders (residential $15–$37.50 + $1.50/$1,000; nonresidential $15 to $2,536.50 + $1.50/$1,000), plan review at 20% capped at $1,500 for multifamily/commercial/industrial. The residential top band prints 'or fraction thereof' and rounds up; the nonresidential bands prorate.",
    },
    {
      jurisdictionKey: FS_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      isAvailable: true,
      localName: "Electrical Permit",
      officialUrl: ELECTRICAL_CODE_URL,
      notes:
        "Sec. 6-75: fees by number of active circuits at band rates ($5.50 down to $3.50), $30.00 minimum, flat rows for panel replacement and temporary service.",
    },
    {
      jurisdictionKey: FS_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      isAvailable: true,
      localName: "Plumbing Permit",
      officialUrl: PLUMBING_CODE_URL,
      notes:
        "Sec. 6-242(b): inspection fees per fixture outlet, service, appliance and gas outlet, plus a $12.00 final inspection, floored at $24.00 per permit.",
    },
  ],

  feeSchedules: [
    {
      key: "fortsmith-building-schedule",
      jurisdictionKey: FS_KEYS.jurisdiction,
      sourceKey: FS_BUILDING_SOURCE_KEY,
      title: "Fort Smith Building Permit Fee Schedule (Sec. 6-30)",
      officialUrl: BUILDING_CODE_URL,
      effectiveFrom: FS_FEE_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: FS_LAST_VERIFIED,
      notes:
        "Cost-of-construction ladders plus plan review at 20% (max $1,500). Includes the residential minimum-valuation chart ($80–$180 per sq ft by size).",
    },
    {
      key: "fortsmith-electrical-schedule",
      jurisdictionKey: FS_KEYS.jurisdiction,
      sourceKey: FS_ELECTRICAL_SOURCE_KEY,
      title: "Fort Smith Electrical Permit Fee Schedule (Sec. 6-75)",
      officialUrl: ELECTRICAL_CODE_URL,
      effectiveFrom: FS_FEE_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: FS_LAST_VERIFIED,
      notes: "Active-circuit ladder with $30.00 minimum and flat special-purpose rows.",
    },
    {
      key: "fortsmith-plumbing-schedule",
      jurisdictionKey: FS_KEYS.jurisdiction,
      sourceKey: FS_PLUMBING_SOURCE_KEY,
      title: "Fort Smith Plumbing Inspection Fee Schedule (Sec. 6-242(b))",
      officialUrl: PLUMBING_CODE_URL,
      effectiveFrom: FS_FEE_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: FS_LAST_VERIFIED,
      notes: "Per-unit inspection fees with a $24.00 permit minimum.",
    },
  ],

  feeRules: [
    ...FS_BUILDING_RULES.map((rule) => ({
      jurisdictionKey: FS_KEYS.jurisdiction,
      permitTypeKey: "building",
      scheduleKey: "fortsmith-building-schedule",
      rule,
    })),
    ...FS_ELECTRICAL_RULES.map((rule) => ({
      jurisdictionKey: FS_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      scheduleKey: "fortsmith-electrical-schedule",
      rule,
    })),
    ...FS_PLUMBING_RULES.map((rule) => ({
      jurisdictionKey: FS_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      scheduleKey: "fortsmith-plumbing-schedule",
      rule,
    })),
  ],

  requirements: [
    {
      jurisdictionKey: FS_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "document",
      title: "Plans and site plan by project type",
      description:
        "Single-family/duplex: site plan, floor plan, elevations and a structural plan. Triplex/fourplex: working drawings with riser diagrams. Five units and all commercial/industrial: plans prepared by a registered engineer or architect, a certified survey and five sets of plans.",
      isMandatory: true,
      sortOrder: 1,
      sourceKey: FS_BUILDING_SOURCE_KEY,
      lastVerifiedAt: FS_LAST_VERIFIED,
    },
    {
      jurisdictionKey: FS_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "license",
      title: "State contractor license and city occupational license",
      description:
        "Contractors must hold the applicable state license and a city occupational license. New single-family dwellings require proof of state residential contractor registration when the work exceeds $2,000.",
      isMandatory: true,
      sortOrder: 2,
      sourceKey: FS_BUILDING_SOURCE_KEY,
      lastVerifiedAt: FS_LAST_VERIFIED,
    },
    {
      jurisdictionKey: FS_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      requirementType: "license",
      title: "Registered electrical contractor",
      description:
        "Electrical permits are issued to registered electrical contractors. A homeowner may perform work in their own single-family residence after appearing before the electrical inspector and paying permit fees in advance.",
      isMandatory: true,
      sortOrder: 3,
      sourceKey: FS_ELECTRICAL_SOURCE_KEY,
      lastVerifiedAt: FS_LAST_VERIFIED,
    },
    {
      jurisdictionKey: FS_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      requirementType: "license",
      title: "State-licensed master plumber with city registration and $2,000 bond",
      description:
        "All plumbing must be supervised by a state-licensed master plumber registered with the City (annual registration $25.00) and bonded to the City for $2,000.",
      isMandatory: true,
      sortOrder: 4,
      sourceKey: FS_PLUMBING_SOURCE_KEY,
      lastVerifiedAt: FS_LAST_VERIFIED,
    },
  ],

  profile: {
    jurisdictionKey: FS_KEYS.jurisdiction,
    headline: "Fort Smith, Arkansas Permit Fees & Building Codes",
    summary:
      "Fort Smith's Building Safety Division issues permits under Chapter 6 of the Code of Ordinances. Building permit fees read the cost of construction: residential (single-family and duplex) pays $15.00–$37.50 by bracket plus $1.50 per additional $1,000 or fraction thereof above $2,000, while nonresidential work climbs a banded ladder from $15.00 to $2,536.50 plus $1.50 per $1,000 above $1,000,000. Multifamily and commercial projects add a plan review of 20% of the permit fee capped at $1,500. Electrical permits price each active circuit ($5.50 down to $3.50 by band, $30.00 minimum), and plumbing inspection fees run $5.50 per fixture outlet with a $24.00 permit minimum.",
    localContext:
      "Fort Smith sits on the Oklahoma line in Sebastian County and permits everything inside city limits through its Building Safety Division on Garrison Avenue, with applications through the CityView portal. The City's plumbing inspection program uniquely reaches beyond the city: Ordinance 96-05 requires all plumbing in the 'transfer area' south of Fort Smith — wherever the City is the water supplier — to be inspected by a Fort Smith plumbing inspector.\n\nThe building section also publishes a minimum-valuation chart for new homes, from $80 per square foot under 1,800 sq ft to $180 per square foot at 3,501 and larger, which floors the valuation a permit is priced from unless the builder documents a lower figure with a Marshall & Swift report.",
    valuationBasis:
      "Valuation is the 'cost of construction' — all labor, material, subcontracts, overhead, profit and other costs, including all site work such as parking lots. New residential construction uses the minimum-valuation chart unless a Marshall & Swift Valuation Service report establishes a lesser figure.",
    notIncluded:
      "These figures cover the City of Fort Smith building, electrical and plumbing permit fees only. They exclude:\n\n- **Mechanical (HVAC) permits**, priced on a separate schedule (Sec. 6-355).\n- **Sidewalk assessments**, charged by construction year in the same section but not a permit fee.\n- **Sebastian County and state permits** — septic systems, floodplain and state rights-of-way.\n- **Fort Smith Utility Department** water, sewer and gas tap and connection charges.\n- **Fire Department reviews** for suppression systems and special events.",
    seoTitle: "Fort Smith AR Permit Fees | Sec. 6-30 Fee Schedule & Calculator",
    seoDescription:
      "Calculate Fort Smith building permit costs: residential $1.50/$1,000 ladder, nonresidential banded ladder, 20% plan review. Electrical per circuit, plumbing per fixture.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: FS_LAST_VERIFIED,
  },

  permitPages: [
    {
      jurisdictionKey: FS_KEYS.jurisdiction,
      permitTypeKey: "building",
      slug: "building-permit-cost",
      title: "Fort Smith Building Permit Cost",
      intro:
        "A Fort Smith building permit is priced from the **cost of construction** under Code of Ordinances Sec. 6-30. **Residential** work (single-family and duplex) pays **$15.00–$37.50** by bracket, then **$37.50 plus $1.50 per additional $1,000 or fraction thereof** above $2,000. **Nonresidential** work climbs a banded ladder — **$67.50 + $4.50** per $1,000 to $10,000, **$103.50 + $3.75** to $50,000, **$253.50 + $3.00** to $100,000, **$403.50 + $2.25** to $1,000,000, then **$2,536.50 + $1.50** above it. Multifamily, commercial and industrial projects add a **plan review of 20% of the permit fee, capped at $1,500**.",
      localSummary:
        "Permits are issued by the Building Safety Division at 623 Garrison Avenue and applied for through the CityView portal. The residential ladder's top band prints 'or fraction thereof' and rounds up; the nonresidential bands, which omit the phrase, prorate — a distinction the fee engine reads from the code's own wording. New homes are valued against the city's minimum-valuation chart ($80–$180 per sq ft by size) unless a Marshall & Swift report documents otherwise. Unpermitted work doubles the fee via the 100% penalty in the local building-code amendments.",
      notIncluded:
        "This estimate covers the City of Fort Smith building permit and plan review fees only. It excludes:\n\n- **Electrical, plumbing and mechanical permits**, which are issued separately.\n- **Sidewalk assessments**, which scale by construction year rather than by the permit.\n- **Fort Smith Utility Department** water, sewer and gas tap charges.\n- **Fire Department plan review** for suppression systems.\n- **Sebastian County and state permits** for septic systems and rights-of-way.",
      workedExample: {
        scenario:
          "A new single-family home in Fort Smith with a documented cost of construction of $220,000.",
        inputs: {
          valuationCents: 22_000_000,
          squareFootage: 2_200,
          occupancy: "residential",
          workType: "new_construction",
        },
        notes:
          "Sec. 6-30(1) top band ($2,001 and over): **$37.50** for the first $2,000 plus $1.50 × 218 whole thousands (fraction rounds up) = **$327.00** → permit **$364.50**. Residential permits carry no plan review. Total: **$364.50**. (The 2,200 sq ft × $100/sq ft minimum-valuation chart floors the valuation at $220,000 — exactly the documented figure here.)",
      },
      faqs: [
        {
          question: "How is a Fort Smith building permit fee calculated?",
          answer:
            "From the cost of construction on the Sec. 6-30 ladders. Residential (single-family and duplex) work pays $15.00–$37.50 by bracket, then $37.50 plus $1.50 per additional $1,000 or fraction thereof above $2,000. Nonresidential work pays a banded ladder of printed bases plus per-$1,000 rates — note the top band's $2,536.50 base steps $108.00 above where the band beneath it lands at $1,000,000, exactly as the schedule prints it.",
          sourceId: FS_BUILDING_SOURCE_KEY,
          attribution: "Fort Smith Code of Ordinances Sec. 6-30(1)–(2)",
        },
        {
          question: "What counts as 'cost of construction' in Fort Smith?",
          answer:
            "All labor, material, subcontracts, overhead, profit and other costs necessary to complete the job, including all site work such as parking lots. For new residential construction the city applies a minimum-valuation chart — $80/sq ft up to 1,800 sq ft, $100 to 2,500, $125 to 3,500, $180 above — unless a Marshall & Swift report supports a lesser figure.",
          sourceId: FS_BUILDING_SOURCE_KEY,
          attribution: "Fort Smith Code of Ordinances Sec. 6-30",
        },
        {
          question: "Does Fort Smith charge a plan review fee?",
          answer:
            "Yes, for multifamily, commercial and industrial projects: a nonrefundable plan review fee equal to 20% of the building permit fee, capped at $1,500, submitted with the plans and charged in addition to the permit fee. Single-family and duplex work pays no plan review.",
          sourceId: FS_BUILDING_SOURCE_KEY,
          attribution: "Fort Smith Code of Ordinances Sec. 6-30(15)",
        },
        {
          question: "What is the minimum building permit fee in Fort Smith?",
          answer:
            "The residential and nonresidential ladders both open at $15.00 for work valued $50–$500. There is no separate global minimum — the $15.00 bottom bracket is the schedule's floor for permitted work.",
          sourceId: FS_BUILDING_SOURCE_KEY,
          attribution: "Fort Smith Code of Ordinances Sec. 6-30(1)–(2)",
        },
        {
          question: "How much does a demolition permit cost in Fort Smith?",
          answer:
            "Demolition is $50.00 for the first 1,000 square feet of structure and $1.00 per 100 square feet after that, plus a $25.00 sewer and water inspection.",
          sourceId: FS_BUILDING_SOURCE_KEY,
          attribution: "Fort Smith Code of Ordinances Sec. 6-30(4)",
        },
        {
          question: "What is the penalty for building without a permit in Fort Smith?",
          answer:
            "The locally amended building code imposes a penalty of 100% of the usual permit fee in addition to the required permit fee — effectively doubling the cost of unpermitted work.",
          sourceId: FS_BUILDING_SOURCE_KEY,
          attribution: "Fort Smith Code of Ordinances Sec. 6-27(4)",
        },
        {
          question: "How long is a Fort Smith building permit valid?",
          answer:
            "Permits run with the building code's standard validity; a permit renewal is $25.00 and a permit cancellation is $25.00 under the same fee schedule.",
          sourceId: FS_BUILDING_SOURCE_KEY,
          attribution: "Fort Smith Code of Ordinances Sec. 6-30(8), (12)",
        },
        {
          question: "Do I pay extra for reinspections in Fort Smith?",
          answer:
            "Yes. A reinspection is $50.00, and an emergency after-hours inspection is $25.00 plus twice the inspector's hourly salary per hour or fraction thereof.",
          sourceId: FS_BUILDING_SOURCE_KEY,
          attribution: "Fort Smith Code of Ordinances Sec. 6-30(9), (14)",
        },
      ],
      seoTitle: "Fort Smith AR Building Permit Cost (Residential & Commercial Ladders)",
      seoDescription:
        "Fort Smith building permit fees from Sec. 6-30: residential $1.50/$1,000 rounding up, nonresidential banded ladder, 20% plan review capped at $1,500.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: FS_LAST_VERIFIED,
    },
    {
      jurisdictionKey: FS_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      slug: "electrical-permit-cost",
      title: "Fort Smith Electrical Permit Cost",
      intro:
        "Fort Smith prices electrical permits by the **number of active circuits** installed under one permit: **$5.50 per circuit** for circuits 1–4, **$5.00** for 5–10, **$4.50** for 11–20, **$4.00** for 21–42 and **$3.50** for 43 and over, with a **$30.00 minimum inspection fee**. Counting rules matter — a two- or three-wire single-phase circuit counts as **two** circuits and a three- or four-wire three-phase circuit as **three**. A panel-only replacement is a flat **$30.00**, as is a temporary construction service.",
      localSummary:
        "Electrical permits are issued to registered electrical contractors through the Building Safety Division. Inspections, the final inspection and one deficiency re-check are included in the circuit fee; additional trips caused by the electrician run $20.00 each. Unpermitted work triples the fee under the local electrical-code provisions. Fees may be billed monthly to bonded contractors, with payment due by the tenth of the following month.",
      notIncluded:
        "This estimate covers the City of Fort Smith electrical permit fees only. It excludes:\n\n- **OG&E and Arkansas Valley Electric** service, metering and transformer charges.\n- **Building, plumbing and mechanical permits** for the same project.\n- **Sign zoning permits** from Planning (the $35.00 electrical sign fee is separate).\n- **State electrical licensing** and city occupational license fees.\n- **Generators and transformers** — priced flat ($30/$40 and $15/$40/$60) but not modelled as calculable rows.",
      workedExample: {
        scenario:
          "A commercial tenant finish in Fort Smith installing 24 active branch circuits (all two-wire single-phase, counted as 24 circuits).",
        inputs: {
          occupancy: "commercial",
          workType: "alteration",
          custom: { circuits: 24 },
        },
        notes:
          "Sec. 6-75(a) ladder: circuits 1–4 × $5.50 = **$22.00**; 5–10 (6 circuits) × $5.00 = **$30.00**; 11–20 (10) × $4.50 = **$45.00**; 21–24 (4) × $4.00 = **$16.00**. Total: **$113.00** — above the $30.00 minimum, so no floor applies.",
      },
      faqs: [
        {
          question: "How is a Fort Smith electrical permit fee calculated?",
          answer:
            "By the number of active circuits installed under the permit, each priced at its band's per-circuit rate: $5.50 for circuits 1–4, $5.00 for 5–10, $4.50 for 11–20, $4.00 for 21–42 and $3.50 for 43 and over — subject to the $30.00 minimum inspection fee.",
          sourceId: FS_ELECTRICAL_SOURCE_KEY,
          attribution: "Fort Smith Code of Ordinances Sec. 6-75(a)",
        },
        {
          question: "How are circuits counted for the fee?",
          answer:
            "A two- or three-wire single-phase circuit counts as two circuits; a three- or four-wire three-phase circuit counts as three. Multiwire arrangements are therefore charged at the count the code assigns them, not one each.",
          sourceId: FS_ELECTRICAL_SOURCE_KEY,
          attribution: "Fort Smith Code of Ordinances Sec. 6-75(b)",
        },
        {
          question: "How much is a panel replacement permit in Fort Smith?",
          answer:
            "A permit for work consisting only of replacing an existing panel is a flat $30.00. If the panel is relocated more than five feet, the fee reverts to the total active circuits in the panel times the appropriate per-circuit charge.",
          sourceId: FS_ELECTRICAL_SOURCE_KEY,
          attribution: "Fort Smith Code of Ordinances Sec. 6-75(c)",
        },
        {
          question: "What is the minimum electrical permit fee in Fort Smith?",
          answer:
            "The minimum inspection fee is $30.00. Where the total fee cannot be determined at issuance, a minimum of $30.00 is paid and any additional fees or refunds are settled at final inspection.",
          sourceId: FS_ELECTRICAL_SOURCE_KEY,
          attribution: "Fort Smith Code of Ordinances Sec. 6-75(a), (l)",
        },
        {
          question: "How much is a temporary construction service permit?",
          answer:
            "A temporary service used only during construction is $30.00. A mobile home or travel trailer service is $35.00.",
          sourceId: FS_ELECTRICAL_SOURCE_KEY,
          attribution: "Fort Smith Code of Ordinances Sec. 6-75(d)–(e)",
        },
        {
          question: "Are inspections included in the circuit fee?",
          answer:
            "Yes. The permit fee includes all inspections during construction, the final inspection and one subsequent inspection to verify corrections. Additional trips caused by the electrician carry a $20.00 penalty each.",
          sourceId: FS_ELECTRICAL_SOURCE_KEY,
          attribution: "Fort Smith Code of Ordinances Sec. 6-75(j)",
        },
        {
          question: "What is the penalty for unpermitted electrical work in Fort Smith?",
          answer:
            "The permit fee for work started before a permit is issued is three times the fee that would otherwise be charged.",
          sourceId: FS_ELECTRICAL_SOURCE_KEY,
          attribution: "Fort Smith Code of Ordinances Sec. 6-75(k)",
        },
      ],
      seoTitle: "Fort Smith AR Electrical Permit Cost & Requirements",
      seoDescription:
        "Fort Smith electrical permit fees by active circuits: $5.50 down to $3.50 per circuit, $30 minimum. Panel replacement flat $30. Full Sec. 6-75 schedule.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: FS_LAST_VERIFIED,
    },
    {
      jurisdictionKey: FS_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      slug: "plumbing-permit-cost",
      title: "Fort Smith Plumbing Permit Cost",
      intro:
        "Fort Smith plumbing permits are priced as **inspection fees** under Code of Ordinances Sec. 6-242(b): **$5.50 per fixture outlet**, **$5.50 per water or sewer service**, **$4.00 per water heater, disposer, dishwasher or floor drain**, **$5.50 for a gas service with up to five outlets** plus **$1.50 per additional gas outlet**, and **$12.00 for the final inspection** — all subject to a **$24.00 minimum fee** per permit.",
      localSummary:
        "Plumbing permits are issued under the supervision of a state-licensed master plumber registered with the City and bonded for $2,000. Fort Smith's inspection program is unusual in reaching beyond the city line: Ordinance 96-05 requires all plumbing in the 'transfer area' south of the city — wherever Fort Smith is the water supplier — to be inspected by a city plumbing inspector. Rough-in, slab and final inspections are required in sequence; a missed or failed inspection adds a $20.00 penalty per extra trip.",
      notIncluded:
        "This estimate covers the City of Fort Smith plumbing inspection fees only. It excludes:\n\n- **Fort Smith Utility Department** water, sewer and gas tap, meter and connection charges.\n- **Building, electrical and mechanical permits** for the same project.\n- **Gas piping registration fees** — the annual $20.00–$25.00 registrations are licensing, not permit fees.\n- **Septic system permits** from the Arkansas Department of Health.\n- **Backflow and grease-interceptor programs** administered through the Utility Department.",
      workedExample: {
        scenario:
          "A bathroom remodel in Fort Smith: 6 fixture outlets, 1 water heater replacement, and the final inspection.",
        inputs: {
          occupancy: "residential",
          workType: "alteration",
          fixtures: 6,
          custom: { heaters: 1, final_inspections: 1 },
        },
        notes:
          "Sec. 6-242(b)(1): 6 fixture outlets × $5.50 = **$33.00**. (b)(3): 1 water heater × $4.00 = **$4.00**. (b)(6): final inspection **$12.00**. Total: **$49.00** — above the $24.00 minimum, so no floor applies.",
      },
      faqs: [
        {
          question: "How is a Fort Smith plumbing permit fee calculated?",
          answer:
            "As inspection fees per item: $5.50 for each fixture outlet, $5.50 for each water or sewer service, $4.00 for each water heater, disposer, dishwasher or floor drain, $5.50 for a gas service with up to five outlets plus $1.50 per additional outlet, and $12.00 for the final inspection. The permit minimum is $24.00.",
          sourceId: FS_PLUMBING_SOURCE_KEY,
          attribution: "Fort Smith Code of Ordinances Sec. 6-242(b)",
        },
        {
          question: "What is the minimum plumbing permit fee in Fort Smith?",
          answer:
            "The minimum fee is $24.00. A permit for a single small item — a water heater at $4.00, for instance — pays the $24.00 floor.",
          sourceId: FS_PLUMBING_SOURCE_KEY,
          attribution: "Fort Smith Code of Ordinances Sec. 6-242(b)(7)",
        },
        {
          question: "How much is a water heater permit in Fort Smith?",
          answer:
            "Each water heater, disposer, dishwasher and floor drain is $4.00. A water heater replacement alone pays the $24.00 permit minimum.",
          sourceId: FS_PLUMBING_SOURCE_KEY,
          attribution: "Fort Smith Code of Ordinances Sec. 6-242(b)(3), (7)",
        },
        {
          question: "Who can pull a plumbing permit in Fort Smith?",
          answer:
            "Plumbing must be supervised by a master plumber licensed by the state and registered with the city plumbing inspector, with a $2,000 bond filed with the city clerk. A homeowner may perform plumbing in their own residence after appearing before the inspector.",
          sourceId: FS_PLUMBING_SOURCE_KEY,
          attribution: "Fort Smith Code of Ordinances Sec. 6-240",
        },
        {
          question: "Does Fort Smith inspect plumbing outside the city limits?",
          answer:
            "Yes, in the 'transfer area'. Ordinance 96-05 requires all plumbing connected to the city water system south of Fort Smith to be inspected by a Fort Smith plumbing inspector for compliance with the Arkansas Plumbing Code. Contact the Utility Department or Building Safety to confirm whether a property is in the transfer area.",
          sourceId: "fortsmith-building-development",
          attribution: "City of Fort Smith Building Safety Division (Ord. 96-05)",
        },
        {
          question: "How much is a gas piping permit in Fort Smith?",
          answer:
            "Gas service with up to five outlets is $5.50, and each additional gas outlet is $1.50 — charged on the same inspection-fee schedule as the plumbing work.",
          sourceId: FS_PLUMBING_SOURCE_KEY,
          attribution: "Fort Smith Code of Ordinances Sec. 6-242(b)(4)–(5)",
        },
        {
          question: "What happens if an inspection fails in Fort Smith?",
          answer:
            "If extra inspections or tests become necessary because the plumber was not ready or did not comply, the plumber pays a $20.00 penalty for each additional inspection or test.",
          sourceId: FS_PLUMBING_SOURCE_KEY,
          attribution: "Fort Smith Code of Ordinances Sec. 6-242(a)(4)",
        },
      ],
      seoTitle: "Fort Smith AR Plumbing Permit Cost & Requirements",
      seoDescription:
        "Fort Smith plumbing permit fees: $5.50 per fixture outlet, $4.00 per appliance, $12 final inspection, $24 minimum. Full Sec. 6-242(b) schedule.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: FS_LAST_VERIFIED,
    },
  ],

  verifications: [
    {
      entityType: "jurisdiction_profile",
      entityKey: FS_KEYS.jurisdiction,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: FS_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Arkansas Expansion",
      sourceKey: FS_BUILDING_SOURCE_KEY,
      notes:
        "Verified against the Municode consolidation of Fort Smith Code of Ordinances Chapter 6, cross-checked against the City's own fee-schedule hub page linking those sections.",
    },
    {
      entityType: "fee_schedule",
      entityKey: "fortsmith-building-schedule",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: FS_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Arkansas Expansion",
      sourceKey: FS_BUILDING_SOURCE_KEY,
      notes:
        "Verified the residential and nonresidential ladders (including the band-seam arithmetic and the printed $108.00 step-up at the $1M base), the plan review at 20% capped at $1,500, and the minimum-valuation chart.",
    },
    {
      entityType: "fee_schedule",
      entityKey: "fortsmith-electrical-schedule",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: FS_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Arkansas Expansion",
      sourceKey: FS_ELECTRICAL_SOURCE_KEY,
      notes: "Verified the active-circuit ladder, $30.00 minimum and flat rows.",
    },
    {
      entityType: "fee_schedule",
      entityKey: "fortsmith-plumbing-schedule",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: FS_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Arkansas Expansion",
      sourceKey: FS_PLUMBING_SOURCE_KEY,
      notes: "Verified the per-unit inspection fees and the $24.00 permit minimum.",
    },
    {
      entityType: "permit_page",
      entityKey: "building-permit-cost",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: FS_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Arkansas Expansion",
      sourceKey: FS_BUILDING_SOURCE_KEY,
      notes: "Passed editorial gate checks for Fort Smith building permit page.",
    },
    {
      entityType: "permit_page",
      entityKey: "electrical-permit-cost",
      permitTypeKey: "electrical",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: FS_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Arkansas Expansion",
      sourceKey: FS_ELECTRICAL_SOURCE_KEY,
      notes: "Passed editorial gate checks for Fort Smith electrical permit page.",
    },
    {
      entityType: "permit_page",
      entityKey: "plumbing-permit-cost",
      permitTypeKey: "plumbing",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: FS_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Arkansas Expansion",
      sourceKey: FS_PLUMBING_SOURCE_KEY,
      notes: "Passed editorial gate checks for Fort Smith plumbing permit page.",
    },
  ],
};
