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
  MEMPHIS_BUILDING_FEE_RULES,
  MEMPHIS_ELECTRICAL_BASE_RULES,
  MEMPHIS_FEE_EFFECTIVE_FROM,
  MEMPHIS_FEE_SCHEDULE_SOURCE_KEY,
  MEMPHIS_FEE_SCHEDULE_2019_SOURCE_KEY,
  MEMPHIS_DEVELOP901_SOURCE_KEY,
  MEMPHIS_PLUMBING_BASE_RULES,
} from "./fee-rules";

export * from "./fee-rules";

/**
 * The complete Memphis / Shelby County, Tennessee seed payload.
 *
 * Every figure traces to research/tennessee/memphis.md, which traces to the
 * Shelby County Office of Construction Code Enforcement's own 2022 Building Fee
 * Schedule. Nothing is estimated. Shelby County's OCCE issues building,
 * electrical, plumbing, mechanical and gas permits for Memphis, Arlington,
 * Germantown, Lakeland, Millington and unincorporated Shelby County; Memphis
 * and the county share the same OCCE fee schedule, so this jurisdiction is
 * carried as Memphis with a Shelby County county row.
 *
 * Three pages, all published: building, electrical and plumbing. The building
 * permit is the second in Tennessee and the first whose plan review is a flat
 * tiered table rather than a percentage of the permit fee.
 */

const RESEARCHER = "Permit Fee Intelligence research pass 18 (Tennessee)";

export const MEMPHIS_LAST_VERIFIED = "2026-09-25";

export const MEMPHIS_KEYS = {
  state: "tn",
  county: "shelby-county",
  jurisdiction: "memphis",
  feeSchedule: "memphis-shelby-fee-schedule",
} as const;

const state: SeedState = {
  code: "TN",
  slug: "tennessee",
  name: "Tennessee",
  fipsCode: "47",
};

const county: SeedCounty = {
  key: MEMPHIS_KEYS.county,
  slug: "shelby-county",
  name: "Shelby County",
  fipsCode: "47157",
};

const jurisdiction: SeedJurisdiction = {
  key: MEMPHIS_KEYS.jurisdiction,
  stateKey: MEMPHIS_KEYS.state,
  countyKey: MEMPHIS_KEYS.county,
  type: "city",
  slug: "memphis",
  name: "Memphis",
  officialName: "City of Memphis",
  websiteUrl: "https://www.memphistn.gov/",
  permitPortalUrl: "https://www.develop901.com/fee-information",
  timezone: "America/Chicago",
  isActive: true,
};

const departments: SeedDepartment[] = [
  {
    key: "memphis-shelby-occe",
    jurisdictionKey: MEMPHIS_KEYS.jurisdiction,
    kind: "building",
    name: "Memphis and Shelby County Office of Construction Code Enforcement",
    phone: "(901) 222-8300",
    email: null,
    url: "https://www.shelbycountytn.gov/DocumentCenter/View/39428/2022-BUILDING-FEE-SCHEDULE",
    addressLine: "6465 Mullins Station Road, Memphis, TN 38134",
    hours: "Permit counter weekdays; inspections scheduled through the OCCE portal.",
    notes:
      "The OCCE issues building, electrical, plumbing, mechanical and gas permits for Memphis and five suburban cities plus unincorporated Shelby County, and publishes one fee schedule for all of them. The schedule states the data processing and surcharge lines that ride every permit, and the Develop 901 portal links it as the approved building fee schedule.",
  },
];

const sources: SeedSource[] = [
  {
    key: MEMPHIS_FEE_SCHEDULE_SOURCE_KEY,
    jurisdictionKey: MEMPHIS_KEYS.jurisdiction,
    title: "Shelby County Office of Construction Code Enforcement — 2022 Building Fee Schedule",
    url: "https://www.shelbycountytn.gov/DocumentCenter/View/39428/2022-BUILDING-FEE-SCHEDULE",
    sourceType: "fee_schedule_pdf",
    issuingAuthority: "Shelby County Office of Construction Code Enforcement",
    authorityKind: "county",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: MEMPHIS_FEE_EFFECTIVE_FROM,
    retrievedAt: MEMPHIS_LAST_VERIFIED,
    lastVerifiedAt: MEMPHIS_LAST_VERIFIED,
    notes:
      'Read 2026-09-25 with pymupdf in blocks mode and pdftotext in layout mode (9 pages, 357,947 bytes, HTTP 200). The cover line is the whole surcharge mechanism: \"ALL FEES BELOW DO NOT INCLUDE AN ADMINISTRATIVE CHARGE OF $4.00 AND A SURCHARGE OF $1.00 FOR RESIDENTIAL OR $5.00 FOR COMMERCIAL (ADD $5 TO RESIDENTIAL TOTAL AND $9 TO COMMERCIAL TOTAL)\". Commercial building: \"NEW CONSTRUCTION/ ADDITIONS/ ACCESSORY BUILDINGS COMMERCIAL\" at $5.00/1,000 to $25,000, $125 + $3.50/1,000 to $1,000,000, $3,537.50 + $2.25 to $25,000,000, $57,537.50 + $1.75 beyond, minimum $75; plan review at nine flat bands ($80-$3,000); signs by valuation; residential at $0.07 per sq ft ($125 minimum) and alteration/repair at $5.00/1,000 ($50-$325). Electrical E-0 to E-8 (issuance $20, minimum $15, new multi-family by amperage with $1.00 per tenant, existing residential by circuit count, commercial KVA ladder). Plumbing P-1 (fixtures $7.50, residential sewer $30, commercial sewer/water/fire/medical gas at $8.00/1,000, water service by size). Mechanical and gas tables at $15/$8/$3 per $1,000.',
  },
  {
    key: MEMPHIS_FEE_SCHEDULE_2019_SOURCE_KEY,
    jurisdictionKey: MEMPHIS_KEYS.jurisdiction,
    title: "Shelby County OCCE — 2019 New Fee Schedule (predecessor, 6 pages)",
    url: "https://www.shelbycountytn.gov/DocumentCenter/View/33930/New-Fee-Schedule-2019",
    sourceType: "fee_schedule_pdf",
    issuingAuthority: "Shelby County Office of Construction Code Enforcement",
    authorityKind: "county",
    isPrimary: false,
    documentDate: null,
    effectiveFrom: "2019-01-01",
    retrievedAt: MEMPHIS_LAST_VERIFIED,
    lastVerifiedAt: MEMPHIS_LAST_VERIFIED,
    notes:
      'Read 2026-09-25 (6 pages, 179,040 bytes, HTTP 200). Same commercial building bands with the 2019 printing\'s rounded bases ($3,025 instead of $3,537.50, $51,025 instead of $57,537.50) and the same plan-review tiers; read to confirm the mechanism was stable before modelling the 2022 figures.',
  },
  {
    key: MEMPHIS_DEVELOP901_SOURCE_KEY,
    jurisdictionKey: MEMPHIS_KEYS.jurisdiction,
    title: "Develop 901 — Fee Information (Memphis-Shelby joint portal)",
    url: "https://www.develop901.com/fee-information",
    sourceType: "municipal_website",
    issuingAuthority: "Memphis and Shelby County Division of Planning and Development",
    authorityKind: "county",
    isPrimary: false,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: MEMPHIS_LAST_VERIFIED,
    lastVerifiedAt: MEMPHIS_LAST_VERIFIED,
    notes:
      'Read 2026-09-25 (HTTP 200). The joint portal\'s fee-information hub describes the OCCE as the building construction authority for Memphis, Arlington, Germantown, Lakeland, Millington and unincorporated Shelby County, and links the approved fee schedule that the \"Construction Enforcement\" tab resolves to — the same 2022 schedule carried as the primary source.',
  },
];

const permitTypes: JurisdictionSeed["permitTypes"] = [];
const projectTypes: JurisdictionSeed["projectTypes"] = [];

const jurisdictionPermitTypes: SeedJurisdictionPermitType[] = [
  {
    jurisdictionKey: MEMPHIS_KEYS.jurisdiction,
    permitTypeKey: "building",
    isAvailable: true,
    localName: "Building permit — Shelby County OCCE commercial ladder, residential by area, plan review tiered",
    officialUrl: "https://www.shelbycountytn.gov/DocumentCenter/View/39428/2022-BUILDING-FEE-SCHEDULE",
    notes:
      "Commercial new construction: $5.00 per $1,000 to $25,000; $125 plus $3.50 per $1,000 to $1,000,000; $3,537.50 plus $2.25 to $25,000,000; $57,537.50 plus $1.75 beyond, $75 minimum, prorated (no fraction phrase). Plan review: nine flat bands ($80 to $3,000) by valuation. Residential: new construction/addition at $0.07 per sq ft ($125 minimum); alteration/repair at $5.00 per $1,000, $50 minimum and $325 maximum. Every permit adds $4.00 admin plus $1 residential or $5 commercial surcharge ($5/$9 totals).",
  },
  {
    jurisdictionKey: MEMPHIS_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    isAvailable: true,
    localName: "Electrical permit — issuance $20, minimum $15, residential by amperage/circuits, commercial by KVA",
    officialUrl: "https://www.shelbycountytn.gov/DocumentCenter/View/39428/2022-BUILDING-FEE-SCHEDULE",
    notes:
      "Section E: issuance $20, minimum $15, reinspection $50. New multi-family by main overcurrent (0–150A $70, 151–400A $125, over 400A $250) plus $1.00 per tenant device; existing residential by count (1–5 circuits $30, over 5 $45); service/feeder/panel replacement $50; low voltage $30; swimming pool $100; commercial new/increased service at $1.00/amp (120/240V) or the excess-480V KVA ladder (first 10,000 KVA $1.50) with the two higher KVA steps noted rather than guessed as marginal tiers.",
  },
  {
    jurisdictionKey: MEMPHIS_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    isAvailable: true,
    localName: "Plumbing permit — fixtures $7.50, residential sewer $30, commercial sewer/water/fire at $8.00/1,000",
    officialUrl: "https://www.shelbycountytn.gov/DocumentCenter/View/39428/2022-BUILDING-FEE-SCHEDULE",
    notes:
      "Section P: issuance $20 plus $4 data processing. Fixtures, roof drains, electric water heaters, interceptors and backflow at $7.50; residential sewer and private sewage disposal at $30; water service 1\" $20 and 1-1/4\"–2\" $30; commercial sewer, large commercial water service, fire protection and medical gas at $8.00 per $1,000 of valuation with floors ($100 for sewer/fire/medical, $200 for large water service). Second reinspection and each trip thereafter $50.",
  },
];

const feeSchedules: SeedFeeSchedule[] = [
  {
    key: MEMPHIS_KEYS.feeSchedule,
    jurisdictionKey: MEMPHIS_KEYS.jurisdiction,
    sourceKey: MEMPHIS_FEE_SCHEDULE_SOURCE_KEY,
    title: "Shelby County OCCE — 2022 Building Fee Schedule (building, electrical, plumbing, mechanical, gas)",
    officialUrl: "https://www.shelbycountytn.gov/DocumentCenter/View/39428/2022-BUILDING-FEE-SCHEDULE",
    effectiveFrom: MEMPHIS_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: MEMPHIS_LAST_VERIFIED,
    notes:
      "Nine pages, HTTP 200, read twice. One instrument for every OCCE trade, with the $4.00 + $1.00/$5.00 cover line that the tests assert on every permit type.",
  },
];

function attach(permitTypeKey: string, rules: FeeRuleRecord[]): SeedFeeRule[] {
  return rules.map((rule) => ({
    jurisdictionKey: MEMPHIS_KEYS.jurisdiction,
    permitTypeKey,
    scheduleKey: MEMPHIS_KEYS.feeSchedule,
    rule,
  }));
}

const feeRules: SeedFeeRule[] = [
  ...attach("building", MEMPHIS_BUILDING_FEE_RULES),
  ...attach("electrical", MEMPHIS_ELECTRICAL_BASE_RULES),
  ...attach("plumbing", MEMPHIS_PLUMBING_BASE_RULES),
];

const requirements: SeedRequirement[] = [
  {
    jurisdictionKey: MEMPHIS_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "Every permit adds $4.00 admin plus a $1 (residential) or $5 (commercial) surcharge",
    description:
      'The cover sheet\'s line in full: \"ALL FEES BELOW DO NOT INCLUDE AN ADMINISTRATIVE CHARGE OF $4.00 AND A SURCHARGE OF $1.00 FOR RESIDENTIAL OR $5.00 FOR COMMERCIAL (ADD $5 TO RESIDENTIAL TOTAL AND $9 TO COMMERCIAL TOTAL)\" — so a residential total is $5.00 of other charges and a commercial total is $9.00. The arithmetic checks: $4 + $1 = $5, $4 + $5 = $9.',
    isMandatory: true,
    sortOrder: 10,
    sourceKey: MEMPHIS_FEE_SCHEDULE_SOURCE_KEY,
    lastVerifiedAt: MEMPHIS_LAST_VERIFIED,
  },
  {
    jurisdictionKey: MEMPHIS_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "The commercial building ladder is prorated, not rounded to whole thousands",
    description:
      'Each commercial building band writes \"$5.00/1,000\", \"$3.50/1,000\" etc. with no \"or fraction thereof\". The rate is therefore charged on the exact valuation: $10,500 of valuation is $52.50 on the $5.00 band rather than $55.00 — the opposite of Nashville\'s ladder, kept distinct.',
    isMandatory: true,
    sortOrder: 20,
    sourceKey: MEMPHIS_FEE_SCHEDULE_SOURCE_KEY,
    lastVerifiedAt: MEMPHIS_LAST_VERIFIED,
  },
  {
    jurisdictionKey: MEMPHIS_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "other",
    title: "Work without a permit doubles the fee; signs without a permit triple it",
    description:
      'E-2.1/M-2/G-2 \"WORK COMMENCING BEFORE PERMIT ISSUANCE DOUBLE FEE\" on every trade, and the sign-erection row \"INSTALLATION PRIOR TO ISSUANCE OF PERMIT TRIPLE FEE\" — two multipliers on the fee, stated on every page rather than charged as a rule.',
    isMandatory: true,
    sortOrder: 10,
    sourceKey: MEMPHIS_FEE_SCHEDULE_SOURCE_KEY,
    lastVerifiedAt: MEMPHIS_LAST_VERIFIED,
  },
];

const profile: SeedProfile = {
  jurisdictionKey: MEMPHIS_KEYS.jurisdiction,
  headline: "What construction permits cost in Memphis",
  summary:
    "A Shelby County building permit is **the commercial ladder plus plan review plus $4.00 admin and a $1/$5 surcharge**: **$5.00 per $1,000** to $25,000; **$125 plus $3.50** a thousand to $1,000,000; **$3,537.50 plus $2.25** to $25,000,000; **$57,537.50 plus $1.75** beyond, with a **$75 minimum** and **no rounding to whole thousands**. Residential is **$0.07 a square foot** ($125 minimum) for new construction and **$5.00 per $1,000 ($50–$325)** for alterations. Electrical and plumbing are price lists gated by amperage, circuit count, KVA and fixture/sewer counts.",
  localContext:
    "Memphis answers to the **Memphis and Shelby County Office of Construction Code Enforcement**, not to a city department of its own. The same county OCCE reviews plans, issues construction permits and inspects for Memphis, Arlington, Germantown, Lakeland, Millington and unincorporated Shelby County, and the joint **Develop 901** portal links the one fee schedule that prices all of them — the 2022 Building Fee Schedule whose cover line is the whole surcharge mechanism: \"ALL FEES BELOW DO NOT INCLUDE AN ADMINISTRATIVE CHARGE OF $4.00 AND A SURCHARGE OF $1.00 FOR RESIDENTIAL OR $5.00 FOR COMMERCIAL (ADD $5 TO RESIDENTIAL TOTAL AND $9 TO COMMERCIAL TOTAL)\". Each is an `other` component so the $75 building minimum, which measures the base subtotal, cannot read them.\n\nThe commercial building ladder is the mirror of Nashville's. Nashville prints three bases that are not its own arithmetic and rounds every band's chargeable part up to a whole thousand because every row says \"or fraction thereof\"; Shelby County's bands chain exactly — $125 + 975 × $3.50 is $3,537.50, and $3,537.50 + 24,000 × $2.25 is $57,537.50 — and no row rounds, because no row prints the fraction phrase. The plan review is tiered the other way too: Nashville charges half the permit fee then a ladder; Shelby County charges nine flat amounts keyed by valuation — $80, $160, $325, $650, $875, $1,200, $1,600, $2,000 and $3,000 — as a `tiered_table`, never as a percentage of anything.\n\nResidential answers a different question — square feet, not valuation — at $0.07 a foot with a $125 floor for new construction and an addition, and $5.00 per $1,000 clamped $50–$325 for an alteration or repair. Electrical opens with the same $20 issuance and $15 minimum as plumbing and mechanical, then branches: new multi-family by the main's amperage (three flat bands, $70/$125/$250) with a $1.00 charge for each tenant device running alongside them, existing residential by circuit count (two bands at $30/$45), service/feeder/panel replacement at $50, low voltage and manufactured homes at $30–$50, and commercial new/increased service at $1.00 per amp (120/240V) or the excess-480V KVA ladder whose first 10,000 KVA are $1.50. Plumbing is fixtures at $7.50 ($1.50 less than Clark County's 2030 figure), residential sewer $30, commercial sewer/water/fire/medical gas at $8.00 per $1,000 with floors of $100 ($200 for large commercial water service), and water service by size ($20 at 1\" and $30 through 2\").",
  valuationBasis:
    "Commercial valuation is **prorated**: the schedule writes \"$5.00/1,000\", \"$3.50/1,000\" etc. with no \"or fraction thereof\", so the rate is charged on the exact valuation. The four bands are $5.00 per $1,000 to $25,000 (which is $125.00 at the top), $125 plus $3.50 per $1,000 above $25,000 to $1,000,000 ($3,537.50 at the top), $3,537.50 plus $2.25 per $1,000 above $1,000,000 to $25,000,000 ($57,537.50 at the top), and $57,537.50 plus $1.75 per $1,000 beyond, with a $75 minimum on the permit fee. Each base above the first is exactly the arithmetic below it — the ladder chains — so the printed bases are derivable rather than printed over a seam.\n\nResidential new construction is the opposite shape: **square footage at $0.07 per foot**, $125 minimum, which is the ordinary price for a house, a duplex or an addition. Residential alteration or repair is **valuation at $5.00 per $1,000**, $50 minimum and $325 maximum — the same $5.00 rate commercial uses at its bottom, clamped to a different window. The plan review is neither: nine valuation brackets priced flat — $0–$25,000 $80; $25,001–$50,000 $160; $50,001–$100,000 $325; $100,001–$200,000 $650; $200,001–$500,000 $875; $500,001–$1,000,000 $1,200; $1,000,001–$2,000,000 $1,600; $2,000,001–$5,000,000 $2,000; $5,000,001 and up $3,000.\n\nPlumbing and electrical do not read a valuation at all except where the sheet says \"$8.00 PER $1000 OF VALUATION\" — which is commercial sewer, large commercial water service, fire protection and medical gas — and electrical's excess-480V KVA ladder reads KVA.",
  notIncluded:
    "These are the Shelby County OCCE's building, electrical and plumbing permit fees for Memphis. They are not a project cost, and they exclude:\n\n- **Sign erection, construction, relocation, alteration or maintenance** — $1.25 per sq ft by the sign's area, with a $25.00 minimum and $25/$50 annual reinspection — and the sign plan review tiers beside them.\n- **Elevators, escalators, dumbwaiters, stair lifts and amusement devices** — new elevator/escalator at $15 for the first $1,000 and $8 per $1,000 to $1,000,000 then $3, lunch-landings renewals, etc.\n- **Mechanical (Section M) and gas (Section G)** — the other two OCCE trades, each priced valuation at $15/$8/$3 per $1,000 with a $15 minimum, transcribed in the research record; the same mechanism as the building ladder, applied to a different permit.\n- **Demolition, roofing and temporary structures** — demolition at $9.00 per 25,000 cu ft ($70 min–$560 max), commercial roofing at $5.00 per $1,000 ($70–$560), temporary construction office/storage at $45 per six months; each its own instrument.\n- **Appurtenances** — conveyor, process piping, racking/shelving and the appurtenance valuation rows ($70 to $250,000, $2.00 per $1,000 beyond).\n- **Miscellaneous construction** — tower/stack/pool/retaining wall at $5.00/1,000, gate/wall/fence, portable building move ($224), implosion ($1,120), curb cut, fence, trailer/manufactured-home and pool rows, all flat.\n- **The doubling and tripling penalties** — \"WORK COMMENCING BEFORE PERMIT ISSUANCE DOUBLE FEE\" on building/mechanical/gas and \"INSTALLATION PRIOR TO ISSUANCE OF PERMIT TRIPLE FEE\" on signs: multipliers on the fee.\n- **Credit-card processing (2.75%) and LUCB/BZA/ARC zoning fees** — administrative charges printed on the same fee directory but not part of the building permit fee.",
  seoTitle: "Memphis construction permit fees",
  seoDescription:
    "How Memphis/Shelby County prices construction permits — the commercial valuation ladder ($5.00/$3.50/$2.25/$1.75 per $1,000, plan review $80–$3,000), residential $0.07 a foot, and electrical and plumbing price lists with the $4 + $1/$5 surcharge on every permit.",
  publishStatus: "published",
  noindex: false,
  lastReviewedAt: MEMPHIS_LAST_VERIFIED,
};

const permitPages: SeedPermitPage[] = [
  {
    jurisdictionKey: MEMPHIS_KEYS.jurisdiction,
    permitTypeKey: "building",
    slug: "building-permit-cost",
    title: "Memphis building permit cost",
    intro:
      "A Shelby County building permit is **the commercial valuation ladder plus plan review plus $4.00 admin and a $1/$5 surcharge**. Commercial new construction is **$5.00 per $1,000** to $25,000; **$125 plus $3.50 a thousand** to $1,000,000; **$3,537.50 plus $2.25** to $25,000,000; **$57,537.50 plus $1.75** beyond, with a **$75 minimum** and **no rounding to whole thousands** — the schedule never prints \"or fraction thereof\". The plan review is **nine flat bands from $80 to $3,000** by valuation. Residential is **$0.07 a square foot** ($125 floor) for new construction and **$5.00 per $1,000 ($50–$325)** for an alteration.",
    localSummary:
      "The building page is really three: a commercial valuation ladder, a plan-review tiered table, and a residential area-and-valuation split. The commercial ladder is $5.00 per $1,000 to $25,000 (so $25,000 is $125.00), $125 plus $3.50 per $1,000 above $25,000 to $1,000,000 ($3,537.50 at the top), $3,537.50 plus $2.25 to $25,000,000 ($57,537.50 at the top), and $57,537.50 plus $1.75 beyond, $75 minimum, prorated — which is why this schedule's printed bases *chain* where Nashville's sit $0.16–$0.54 off the band below. A $750,000 commercial addition is $2,662.50 plus $650 of plan review ($100,001–$200,000 is $650; $200,001–$500,000 is already $875) plus $9 of other charges ($4 admin, $5 commercial surcharge).\n\nThe plan review tiers are six-figure wide above $100,000, which is how a valuation that crosses $500,000 changes the plan review by $325 while the valuation fee moves only cents per thousand. A $150,000 commercial valuation is $562.50 of building fee and $650 of plan review; a $1.5M valuation is $4,662.50 of building fee and $1,600 of plan review, because the plan review sits in the $1,000,001–$2,000,000 band.\n\nResidential answers a different question — square feet. \"NEW CONSTRUCTION OR ADDITION PER SQ. FT. $0.07\" with \"MINIMUM FEE FOR NEW SFR OR DUP $125.00\": 1,000 sq ft is $70 charged at $125, 2,000 sq ft is $140, 5,000 is $350. Alteration/repair is the same $5.00 rate commercial uses at its bottom, clamped rather than tiered: \"ALTERATION/REPAIR ($5.00/1,000) $50.00 MIN / $325.00 MAX\" — a $4,000 alteration is $50, a $30,000 alteration is $150, a $100,000 alteration is $325.\n\nAnd underneath all of it, every permit adds two other charges the cover sheet names: $4.00 data processing and a $1.00 residential / $5.00 commercial surcharge — so a residential permit totals $5 of other charges and a commercial one totals $9.",
    notIncluded:
      "This is the OCCE building permit fee. It excludes:\n\n- **Sign erection, construction, relocation, alteration or maintenance** — $1.25 per sq ft of sign area, with a $25.00 minimum, and its own plan review tiers.\n- **Demolition and roofing** — demolition $9.00 per 25,000 cu ft ($70–$560); commercial roofing $5.00 per 1,000 ($70–$560).\n- **Temporary construction office/storage** — $45 per six months, and portable building move $224.\n- **Miscellaneous construction** — tower/stack/pool/retaining wall $5.00/1,000 ($70 minimum), gate/wall/fence, implosion $1,120.\n- **Mechanical and gas** — Sections M and G, the other OCCE trades, at $15/$8/$3 per $1,000.\n- **The doubling penalty** — work before permit issuance doubles the fee.\n- **Zoning compliance and research letters** — $50–$100 per letter, separate from the building permit.",
    workedExample: {
      scenario: "A $750,000 commercial addition at a Memphis shopping center.",
      inputs: { valuationCents: 75_000_000, custom: { building_class: "commercial" } },
      notes:
        'The valuation fee, band 2: $25,001–$1,000,000 is \"$125 + $3.50/1,000\" above $25,000. $725,000 above $25,000 at $3.50 is $2,537.50, plus $125 is $2,662.50. No rounding — the schedule never prints \"or fraction thereof\", so $25,000.01 is $125.00 plus a few ten-thousandths of $3.50 rather than a whole $3.50.\n\nThe plan review, valuation $750,000: the $500,001–$1,000,000 band is $1,200. The two other charges are the cover sheet\'s own: $4.00 admin plus $5.00 commercial surcharge, $9.00 in all. Total: $3,871.50 — three components, each on its own base.\n\nThe ladder chains: $125 is $5.00 × 25 (indeed $125), and $3,537.50 at $1,000,000 is $125 + 975 × $3.50 — so the commercial bands meet without the sixteen-cent and fifty-four-cent seams Nashville prints in the next county. A $25,000 commercial job computes $125.00 and pays $125.00 (above the $75 minimum); a $5,000 commercial job computes $25.00 and pays the $75 minimum.\n\nA 2,000 sq ft house is the residential shape: $0.07 × 2,000 = $140.00, above the $125 floor, plus $5 of other charges ($4 + $1 residential) — $145.00.',
    },
    faqs: [
      {
        question: "How much is a building permit in Memphis?",
        answer:
          "Commercial: $5.00 per $1,000 to $25,000; $125 + $3.50 per $1,000 to $1,000,000; $3,537.50 + $2.25 to $25,000,000; $57,537.50 + $1.75 beyond, $75 minimum, plus a $4.00 admin charge and a $1 (residential) or $5 (commercial) surcharge on every permit — so $750,000 of commercial construction is $2,662.50 + $1,200 + $9.00 in all. Residential new construction is $0.07 per sq ft ($125 minimum); residential alteration is $5.00 per $1,000, $50 minimum and $325 maximum.",
        sourceId: MEMPHIS_FEE_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "How much is plan review in Memphis?",
        answer:
          "A flat tiered table by valuation, not a percentage of the permit fee: $0–$25,000 $80; $25,001–$50,000 $160; $50,001–$100,000 $325; $100,001–$200,000 $650; $200,001–$500,000 $875; $500,001–$1,000,000 $1,200; $1,000,001–$2,000,000 $1,600; $2,000,001–$5,000,000 $2,000; $5,000,001 and up $3,000.",
        sourceId: MEMPHIS_FEE_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "How much is a residential building permit?",
        answer:
          'New construction or addition: $0.07 per square foot, $125 minimum — so 1,000 sq ft is $125, 2,000 is $140. Alteration or repair: $5.00 per $1,000 of valuation, $50 minimum and $325 maximum — so a $4,000 alteration is $50, a $30,000 alteration is $150. Detached accessory buildings have their own floors ($25 / $50 min), and one- and two-family dwellings carry a $50 new/addition application fee ($25 for alterations) with plan review at $125 to 2,500 sq ft and $150 beyond.',
        sourceId: MEMPHIS_FEE_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "Why does the small commercial ladder not round up to whole thousands?",
        answer:
          'Because the schedule never prints \"or fraction thereof\". Nashville\'s ladder prints the phrase on every band, rounding the chargeable part up to a whole $1,000 — $25,000.01 on the $6.92 band buys a whole $6.92 step; Shelby County\'s $5.00/1,000 does not, so $25,000.01 is $125.00 plus a few ten-thousandths of $3.50. The opposite reading, kept distinct.',
        sourceId: MEMPHIS_FEE_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "What surcharges ride a Memphis permit?",
        answer:
          'Two, stated on the cover sheet: \"AN ADMINISTRATIVE CHARGE OF $4.00 AND A SURCHARGE OF $1.00 FOR RESIDENTIAL OR $5.00 FOR COMMERCIAL (ADD $5 TO RESIDENTIAL TOTAL AND $9 TO COMMERCIAL TOTAL)\" — so a residential permit totals $5.00 of other charges ($4 + $1) and a commercial one totals $9.00 ($4 + $5). They are `other` components so they never enter the minimum\'s base.',
        sourceId: MEMPHIS_FEE_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "Who does the Shelby County OCCE cover?",
        answer:
          "Memphis, Arlington, Germantown, Lakeland, Millington and unincorporated Shelby County — the six jurisdictions whose building, electrical, plumbing, mechanical and gas permits the OCCE issues from one office at 6465 Mullins Station Road, and whose single 2022 Building Fee Schedule the Develop 901 portal links as the approved schedule.",
        sourceId: MEMPHIS_DEVELOP901_SOURCE_KEY,
      },
    ],
    seoTitle: "Memphis building permit cost: the commercial ladder and plan review",
    seoDescription:
      "Memphis building permit fees — the commercial valuation ladder ($5.00/$3.50/$2.25/$1.75 per $1,000), nine-band plan review ($80–$3,000), residential $0.07 a foot, and the $4 + $1/$5 surcharge on every permit.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: MEMPHIS_LAST_VERIFIED,
  },
  {
    jurisdictionKey: MEMPHIS_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    slug: "electrical-permit-cost",
    title: "Memphis electrical permit cost",
    intro:
      "A Memphis electrical permit is **issuance $20 plus a trade minimum and a price list gated by scope**. **New multi-family is three amperage bands — $70 to 150A, $125 at 151–400A, $250 above 400A — plus $1.00 for each tenant device.** **Existing residential is $30 for 1–5 circuits and $45 beyond.** **Service/feeder/panel replacement is $50; low voltage $30; commercial 120/240V $1.00 per amp** and **excess 480V first 10,000 KVA $1.50 per KVA**. The **$15 minimum** sits on the permit fee, and every permit adds **$4 admin and a $5 commercial surcharge** where that scope is stated.",
    localSummary:
      "The electrical page is really five permits under one header. It opens with \"FEE ISSUANCE COST PER PERMIT $20.00\" (E-0), the same $20 plumbing and mechanical open with, and \"MINIMUM FEE $15.00\" (E-3.1) as a `permit_minimum` on the base — so a permit that computes $5.00 pays $15.00 of shortfall, not $15 on top.\n\nNew multi-family branches three ways on one fact: main overcurrent amperage — 0–150A $70, 151–400A $125, over 400A $250 — and the line above those three is a count at $1.00: \"MAIN OVERCURRENT DEVICES PER TENANT $1.00\" — one device per tenant, charged alongside whichever amperage band fires. A 300A service for 12 tenants is $125 + $12. Existing residential (1 & 2 family and multi-family alike, same two rows) branches on circuit count: 1–5 circuits $30, over 5 $45 — the kind of two-band flat table that no per-unit rate can express, because one unit above the threshold does not buy one unit of rate. Service/feeder/panel replacement is $50 (one inspection), residential swimming pool $100 (two), low voltage $30, temporary meter center $25, manufactured homes $50.\n\nCommercial new/increased service is the KVA ladder's mirror: the same E7 and E8 sections print both. 120/240V single phase is $1.00 per amp; 277V single phase $1.50/$2.00 by amperage; excess 480V is a KVA table — first 10,000 KVA $1.50, 10,001–50,000 $0.50, over 50,000 $0.25 — whose two higher bands are registered as `needs_review` here rather than guessed as marginal tiers on a count that is not a money basis. Reinspection is $50 as an inspection component, and the $4 + $1/$5 cover line rides as `other`.",
    notIncluded:
      "This is the electrical schedule (E-0 to E-8) at the prices the 2022 fee schedule prints. It excludes:\n\n- **Excess 480V KVA bands above 10,000** — 10,001–50,000 $0.50 and over 50,000 $0.25 — transcribed and registered as `needs_review`, not charged as marginal tiers on a non-money count.\n- **Commercial 277V rows** — 277V single phase over/under 400A at $1.50/$2.00 — named on the schedule beside the 120/240V row.\n- **Elevator/escalator and amusement** — elevator $15/$8/$3 per $1,000, renewals by landings, the same $15/$8/$3 mechanical and gas open with.\n- **The doubling penalty** — work before permit issuance doubles the fee.\n- **State and county zoning** — LUCB, BZA and planning fees on the same fee directory.",
    workedExample: {
      scenario: "A new 12-tenant apartment building, 300A main, Memphis — the ordinary new multi-family electrical permit.",
      inputs: { custom: { electrical_scope: "new_multifamily", amperage: 300, dwelling_units: 12 } },
      notes:
        'E-6.1: 151–400A is $125.00. Main overcurrent devices per tenant $1.00 adds $12.00. Issuance $20.00 sits on top. The permit computes $157.00 — above the $15 minimum, so no shortfall — plus $9 of other charges on a commercial-class permit ($4 admin, $5 commercial surcharge) where that class is stated.\n\nExisting residential is the other shape: 4 circuits at an existing duplex is \"1 TO 5 CIRCUITS $30.00\" plus $20 issuance = $50.00; 9 circuits is \"OVER 5 CIRCUITS $45.00\" plus $20 = $65.00. Neither pays the KVA rate, because neither states that voltage.\n\nCommercial new service at 120/240V 200A is $200.00 of amperage plus $20 issuance = $220.00 — the dollar-per-amp figure that makes the amperage row chargeable as a currency-per-unit percent.',
    },
    faqs: [
      {
        question: "How much is an electrical permit in Memphis?",
        answer:
          "Issuance $20 plus the trade: new multi-family $70/$125/$250 by amperage plus $1.00 per tenant device; existing residential $30 for 1–5 circuits and $45 beyond; service/feeder/panel replacement $50; low voltage $30; swimming pool $100; commercial 120/240V $1.00 per amp and excess 480V first 10,000 KVA $1.50 per KVA, minimum $15, reinspection $50 and $4 admin + $1/$5 surcharge.",
        sourceId: MEMPHIS_FEE_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "How much is the new multi-family electrical permit?",
        answer:
          "Three amperage bands — 0–150A $70, 151–400A $125, over 400A $250 — plus $1.00 per tenant for each main overcurrent device. A 300A service for 12 tenants is $125 + $12 plus $20 issuance.",
        sourceId: MEMPHIS_FEE_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "How much is an existing residential electrical permit?",
        answer:
          "1 to 5 circuits $30, over 5 circuits $45 — the same two rows for 1 & 2 family and multi-family alike — plus the $20 issuance. The $15 minimum governs a permit whose own rows compute less.",
        sourceId: MEMPHIS_FEE_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "What does the KVA row mean?",
        answer:
          'Electrical service for industrial loads priced at excess of 480 volts: \"FIRST 10,000 KVA $1.50\" (so 2,000 KVA is $3,000), then \"BETWENN 10,001 AND UP TO 50,000 KVA $0.50\" and \"GREATER THAN 50,000 KVA $0.25\" — the latter two transcribed and registered as `needs_review` rather than charged as marginal tiers on a non-money count, because the schedule does not state them as marginal rates.',
        sourceId: MEMPHIS_FEE_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "Does the schedule charge before a permit is issued?",
        answer:
          '\"WORK COMMENCING BEFORE PERMIT ISSUANCE DOUBLE FEE\" on electrical (E-2.1), mechanical (M-2) and gas (G-2) — and \"INSTALLATION PRIOR TO ISSUANCE OF PERMIT TRIPLE FEE\" on sign erection — multipliers on the fee, not separate fees.',
        sourceId: MEMPHIS_FEE_SCHEDULE_SOURCE_KEY,
      },
    ],
    seoTitle: "Memphis electrical permit cost: issuance, amperage and circuit counts",
    seoDescription:
      "Memphis electrical permit fees — issuance $20, new multi-family by amperage ($70/$125/$250 + $1/tenant), existing residential by circuits ($30/$45), commercial $1.00/amp and $1.50/KVA, plus the $15 minimum.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: MEMPHIS_LAST_VERIFIED,
  },
  {
    jurisdictionKey: MEMPHIS_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    slug: "plumbing-permit-cost",
    title: "Memphis plumbing permit cost",
    intro:
      "A Memphis plumbing permit is **$20 issuance plus $4 processing plus a price list**. **Each fixture, roof drain, electric water heater, interceptor and backflow is $7.50; residential sewer connections and private sewage disposal $30; commercial sewer, fire and medical gas $8.00 per $1,000 ($100 minimum); commercial water service 2-1/2\" and larger $8.00 per $1,000 ($200 minimum); household water service 1\" $20 and 1-1/4\"–2\" $30.** The **second reinspection and each trip thereafter is $50**, and every permit carries the same **$4 admin and $1/$5 surcharge** as the building permit.",
    localSummary:
      "The plumbing header is \"PERMIT ISSUANCE $20.00\" plus \"ISSUING EACH PERMIT (DATA PROCESSING) $4.00\" — so $24.00 of opening charges before any unit fee, the same $20 plumbing and mechanical and electrical all open with. \"RESIDENTIAL/COMMERCIAL (SURCHARGE) $1.00/$5.00\" prints beside them; the $4.00 below that is the same processing line building's cover names, now carried as the plumbing permit's own `other` row so the permit is whole.\n\nThe unit fee schedule is one line repeated: P-1.1 \"EACH PLUMBING FIXTURE OR TRAP OR SET OF FIXTURES ON ONE TRAP (INCLUDING WATER & DRAINAGE PIPING) $7.50\" and the same $7.50 for roof drains, electric water heaters (each and replacement), interceptors and backflow preventers — five separate scopes, one price, one `fixtures` fact where each counts as a fixture. A 5-fixture addition is therefore $37.50 of fixtures plus $24 issuance = $61.50 before surcharge — cheaper than Clark County's 2030 figure ($9), dearer than Green Bay's ($7–$8), and $3.50 less than Nashville's $11.\n\nSewer and water branch by occupancy and size: residential sewer $30 (and the same $30 for residential sewer repair/replacement and private sewage disposal), commercial sewer $8.00 per $1,000 of valuation with a $100 minimum — and the same $8.00/$100 for commercial sewer repair, fire protection (P-1.5) and medical gas (P-1.6). Water service 1\" is flat $20, 1-1/4\" through 2\" $30, and commercial water service 2-1/2\" and larger is the $8.00 valuation rate with a $200 floor — the same $8.00 rate as sewer, with a different floor. Reinspection is \"SECOND RE-INSPECTION TRIP $50.00 / EACH TRIP THEREAFTER $50.00\" as an inspection component, the first trip free.",
    notIncluded:
      "This is the plumbing schedule (Section P) at the prices the 2022 fee schedule prints. It excludes:\n\n- **Mechanical and gas permits** — Sections M and G, the other OCCE trades, at $15/$8/$3 per $1,000 (valuation), transcribed beside plumbing in the research record.\n- **Elevator/escalator** — the same $15/$8/$3 shape with its annual landing renewals.\n- **Zoning compliance and records research** — $50–$100 per letter/hour on the same fee directory.\n- **The reinspection before the second trip** — the first reinspection trip is free; only the second and later $50 rows are charged.\n- **State and county planning** — LUCB, BZA and ARC fees on the same directory.",
    workedExample: {
      scenario: "A 5-fixture house addition with a new 1-1/4\" water service, Memphis.",
      inputs: { fixtures: 5, custom: { water_service_size: "1_1_4_to_2in" } },
      notes:
        'Fixtures: 5 × $7.50 = $37.50. Water service 1-1/4\" through 2\" $30.00. Issuance $20 + processing $4 = $24.00. Total $91.50 before the per-permit surcharge — so a $3,000 residential sewer connection at $30 beside those fixtures is a different fact (`custom.sewer_scope`) and never charged as a fixture.\n\nCommercial sewer tells the other story: $8.00 per $1,000 on a $5,000 commercial sewer job is $40 computed and $100 charged at the $100 minimum; on a $50,000 job it is $400. The same $8.00/$100 for fire protection: a $5,000 fire system pays $100, a $50,000 one pays $400.\n\nLarge commercial water service is the same $8.00 with its own $200 floor: a $10,000 commercial water service is $80 computed and $200 charged; a $50,000 one is $400.',
    },
    faqs: [
      {
        question: "How much is a plumbing permit in Memphis?",
        answer:
          "Issuance $20 plus $4 processing plus the unit fee: $7.50 per fixture/trap/roof drain/electric water heater/interceptor/backflow; residential sewer or private sewage disposal $30; water service 1\" $20 and 1-1/4\"–2\" $30; commercial sewer, large commercial water service, fire protection and medical gas $8.00 per $1,000 of valuation with floors $100 ($200 for large water service). Reinspection $50 from the second trip, plus the $4 + $1/$5 surcharge.",
        sourceId: MEMPHIS_FEE_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "What does $7.50 buy on the plumbing schedule?",
        answer:
          "One fixture (or trap or set of fixtures on one trap), one roof drain opening, one electric water heater (each or replacement), one waste pretreatment interceptor or one backflow preventer — five scopes the sheet prices at the same $7.50 and carried as one fixtures fact. A 5-fixture addition is $37.50 before issuance.",
        sourceId: MEMPHIS_FEE_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "How much is commercial sewer and fire protection?",
        answer:
          "$8.00 per $1,000 of valuation — the same rate the sheet charges for commercial water service 2-1/2\" and larger and for medical gas — with floors of $100 for sewer/fire/medical and $200 for large water service: so $5,000 of commercial sewer is $100, $50,000 is $400.",
        sourceId: MEMPHIS_FEE_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "Does the schedule double the fee for work without a permit?",
        answer:
          '\"WORK COMMENCING BEFORE PERMIT ISSUANCE DOUBLE FEE\" — on building (permit amendment), mechanical (M-2) and gas (G-2), and the plumbing page\'s \"PERMIT AMENDMENT $20.00\" — the fee the schedule would have charged, doubled, a multiplier rather than a rule here.',
        sourceId: MEMPHIS_FEE_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "Why is residential sewer $30 and commercial sewer $8.00 per $1,000?",
        answer:
          "Because the schedule branches by occupancy: P-1.2 is residential sewer $30 flat, P-1.3 is commercial sewer $8.00 per $1,000 of valuation with a $100 minimum. A residential sewer connection is one sewer connection at $30; a commercial one reads the valuation — a $5,000 commercial sewer job computes $40 and pays $100.",
        sourceId: MEMPHIS_FEE_SCHEDULE_SOURCE_KEY,
      },
    ],
    seoTitle: "Memphis plumbing permit cost: $7.50 fixtures, $30 residential sewer, $8.00/1,000 commercial",
    seoDescription:
      "Memphis plumbing permit fees — fixtures and water heaters at $7.50, residential sewer $30, water service $20/$30, commercial sewer/fire/medical gas $8.00 per $1,000 with $100–$200 floors.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: MEMPHIS_LAST_VERIFIED,
  },
];

const verifications: SeedVerification[] = [
  {
    entityType: "source",
    entityKey: MEMPHIS_FEE_SCHEDULE_SOURCE_KEY,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: MEMPHIS_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MEMPHIS_FEE_SCHEDULE_SOURCE_KEY,
    notes: "Primary (2022 building fee schedule, 9 pages, HTTP 200, blocks-mode extraction, cover line through gas table, compared to 2019 predecessor where the bases moved).",
  },
  {
    entityType: "source",
    entityKey: MEMPHIS_FEE_SCHEDULE_2019_SOURCE_KEY,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: MEMPHIS_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MEMPHIS_FEE_SCHEDULE_2019_SOURCE_KEY,
    notes: "Secondary (2019 predecessor, same ladder with rounded bases) read as stability check on the 2022 figures.",
  },
  {
    entityType: "source",
    entityKey: MEMPHIS_DEVELOP901_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: MEMPHIS_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MEMPHIS_DEVELOP901_SOURCE_KEY,
    notes: "Joint jurisdiction proof: Develop 901 as the Memphis-Shelby portal linking the OCCE schedule.",
  },
  {
    entityType: "fee_schedule",
    entityKey: MEMPHIS_KEYS.feeSchedule,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: MEMPHIS_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MEMPHIS_FEE_SCHEDULE_SOURCE_KEY,
    notes: "One schedule row for the county, charged on all three permits.",
  },
  {
    entityType: "permit_page",
    entityKey: `${MEMPHIS_KEYS.jurisdiction}:building:building-permit-cost`,
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: MEMPHIS_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MEMPHIS_FEE_SCHEDULE_SOURCE_KEY,
    notes: "Three published pages, each with intro ≥240, localSummary ≥120 and four to six FAQs, verified together.",
  },
  {
    entityType: "permit_page",
    entityKey: `${MEMPHIS_KEYS.jurisdiction}:electrical:electrical-permit-cost`,
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: MEMPHIS_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MEMPHIS_FEE_SCHEDULE_SOURCE_KEY,
    notes: "Electrical price list, gated by scope, as printed.",
  },
  {
    entityType: "permit_page",
    entityKey: `${MEMPHIS_KEYS.jurisdiction}:plumbing:plumbing-permit-cost`,
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: MEMPHIS_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MEMPHIS_FEE_SCHEDULE_SOURCE_KEY,
    notes: "Plumbing price list, $7.50 fixtures with valuation-gated commercial branches.",
  },
  {
    entityType: "jurisdiction_profile",
    entityKey: MEMPHIS_KEYS.jurisdiction,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: MEMPHIS_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: MEMPHIS_FEE_SCHEDULE_SOURCE_KEY,
    notes: "Memphis summary and context, with the Shelby County joint-jurisdiction fact.",
  },
];

export const memphisSeed: JurisdictionSeed = {
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
