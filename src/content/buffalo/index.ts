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
  BUFFALO_BUILDING_EFFECTIVE_FROM,
  BUFFALO_COMMERCIAL_SCHEDULE_SOURCE_KEY,
  BUFFALO_COMMERCIAL_BUILDING_RULES,
  BUFFALO_DEPARTMENT_SOURCE_KEY,
  BUFFALO_ELECTRICAL_EFFECTIVE_FROM,
  BUFFALO_ELECTRICAL_RULES,
  BUFFALO_ELECTRICAL_SOURCE_KEY,
  BUFFALO_FEE_HUB_SOURCE_KEY,
  BUFFALO_ICC_BVD_SOURCE_KEY,
  BUFFALO_PLUMBING_EFFECTIVE_FROM,
  BUFFALO_PLUMBING_RULES,
  BUFFALO_PLUMBING_SOURCE_KEY,
  BUFFALO_RESIDENTIAL_BUILDING_RULES,
  BUFFALO_RESIDENTIAL_SCHEDULE_SOURCE_KEY,
} from "./fee-rules";

export * from "./fee-rules";

/**
 * The complete Buffalo, New York seed payload.
 *
 * Every figure traces to research/new-york/buffalo.md, which traces to the Department of
 * Permit & Inspection Services' own fee sheets on buffalony.gov: the residential and
 * commercial building sheets both printed EFFECTIVE 7/1/2025, the undated plumbing price
 * list, and the electrical schedule's two regimes with Schedule B's multiplier table. The
 * City Code itself could not be read from this environment — ecode360, which the City's
 * own pages link, answers 403 — so the sheets, which are what an applicant pays against,
 * are the sources. Nothing is estimated.
 *
 * Three pages, all published: building, electrical and plumbing. Buffalo is the second
 * jurisdiction in this dataset whose commercial sheet reproduces its own arithmetic as
 * worked examples (the second one is asserted cent for cent), and the first whose
 * electrical schedule is a product of a published multiplier table and a fixed rate —
 * Schedule B is stored as the lookup table it is printed as, blanks included.
 */

const RESEARCHER = "Permit Fee Intelligence research pass 13 (New York)";

export const BUFFALO_LAST_VERIFIED = "2026-09-25";

export const BUFFALO_KEYS = {
  state: "ny",
  county: "erie-county",
  jurisdiction: "buffalo",
  residentialSchedule: "buffalo-residential-building-fees",
  commercialSchedule: "buffalo-commercial-building-fees",
  electricalSchedule: "buffalo-electric-permit-fees",
  plumbingSchedule: "buffalo-plumbing-permit-fees",
} as const;

const state: SeedState = {
  code: "NY",
  slug: "new-york",
  name: "New York",
  fipsCode: "36",
};

const county: SeedCounty = {
  key: BUFFALO_KEYS.county,
  slug: "erie-county",
  name: "Erie County",
  fipsCode: "36029",
};

const jurisdiction: SeedJurisdiction = {
  key: BUFFALO_KEYS.jurisdiction,
  stateKey: BUFFALO_KEYS.state,
  countyKey: BUFFALO_KEYS.county,
  type: "city",
  slug: "buffalo",
  name: "Buffalo",
  officialName: "City of Buffalo",
  websiteUrl: "https://www.buffalony.gov/",
  permitPortalUrl: "https://www.buffalony.gov/719/Permits",
  timezone: "America/New_York",
  isActive: true,
};

const departments: SeedDepartment[] = [
  {
    key: "buffalo-department-permit-inspection-services",
    jurisdictionKey: BUFFALO_KEYS.jurisdiction,
    kind: "building",
    name: "City of Buffalo — Department of Permit & Inspection Services",
    phone: "(716) 851-5924",
    email: null,
    url: "https://www.buffalony.gov/435/Permit-Inspection-Services",
    addressLine: "65 Niagara Square, City Hall Room 313, Buffalo, NY 14202",
    hours: null,
    notes:
      "The Department issues every permit this site prices and keeps the trades in their own divisions — building, electrical, plumbing and heating each have a division page with a named contact, which is why the City's commercial fee sheet states in its header that \"Heating, Electrical, and Plumbing (M/E/P) permits and fees are separate.\" The residential fee sheet prints the main line above; the commercial sheet prints (716) 851-4290. The plumbing division sits one floor down in Room 312 of the same building, and its fee page states that applications must be signed by a City of Buffalo Licensed Master Plumber. Call 311 for city services.",
  },
];

const sources: SeedSource[] = [
  {
    key: BUFFALO_RESIDENTIAL_SCHEDULE_SOURCE_KEY,
    jurisdictionKey: BUFFALO_KEYS.jurisdiction,
    title:
      "City of Buffalo — Building Permit Fee Schedule, Residential: Detached 1- & 2-Family Dwellings",
    url: "https://www.buffalony.gov/DocumentCenter/View/15213/Residential_Permit_Fees",
    sourceType: "fee_schedule_pdf",
    issuingAuthority: "City of Buffalo — Department of Permit & Inspection Services",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: BUFFALO_BUILDING_EFFECTIVE_FROM,
    retrievedAt: BUFFALO_LAST_VERIFIED,
    lastVerifiedAt: BUFFALO_LAST_VERIFIED,
    notes:
      "Read 2026-09-25 as the Department's own one-page PDF, printed \"EFFECTIVE 7/1/2025\" at the foot of the sheet. Transcribed in full: the $25 application fee, the 20% plan review with its $25 minimum and its note that it includes M/E/P review fees, the four one-family area bands with the $1,000 two-family and $500-per-unit townhouse rows, the $5-per-$1,000 cost row with its $50 minimum, the eight flat fees, the two demolition rows and the three use permits, and the sheet's own total line. The extraction needed the PDF's content-stream coordinates: a stray \"65\" sits mid-page in a different font, away from every value column, and is a layout artifact of the header block rather than a fee — all real values sit at one x-coordinate, and the application fee row reads $25.",
  },
  {
    key: BUFFALO_COMMERCIAL_SCHEDULE_SOURCE_KEY,
    jurisdictionKey: BUFFALO_KEYS.jurisdiction,
    title: "City of Buffalo — Building Permit Fee Schedule, Commercial Buildings (4 pages, with the ICC Building Valuation Data Table)",
    url: "https://www.buffalony.gov/DocumentCenter/View/15216/Commercial_Permit_Fees",
    sourceType: "fee_schedule_pdf",
    issuingAuthority: "City of Buffalo — Department of Permit & Inspection Services",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: BUFFALO_BUILDING_EFFECTIVE_FROM,
    retrievedAt: BUFFALO_LAST_VERIFIED,
    lastVerifiedAt: BUFFALO_LAST_VERIFIED,
    notes:
      "Read 2026-09-25 as the Department's own four-page PDF, every page printed \"EFFECTIVE 7/1/2025\". Page 1 is the fee schedule: $50 application, $0.75 per $1,000 plan review \"or portion thereof\" with a $75 minimum, $8 per $1,000 permit with a $100 minimum, twelve flat fees, the demolition rows including the $1,500 no-permit penalty, the certificate prices and the use permit. Page 2 is the ICC Building Valuation Data Table (February 2023) with the City's own scope-of-work factors; pages 3 and 4 are two worked examples — $32,792.50 on a $3,741,600 new building and $8,377.50 on a $945,496 alteration — both of which this jurisdiction's tests reproduce cent for cent. The sheet opens with the Charter's exemption clause and keeps the trades out: \"Heating, Electrical, and Plumbing (M/E/P) permits and fees are separate.\"",
  },
  {
    key: BUFFALO_PLUMBING_SOURCE_KEY,
    jurisdictionKey: BUFFALO_KEYS.jurisdiction,
    title: "City of Buffalo — Plumbing Permit Fee Schedule",
    url: "https://www.buffalony.gov/614/Plumbing-Permit-Fees",
    sourceType: "municipal_website",
    issuingAuthority: "City of Buffalo — Department of Permit & Inspection Services, Plumbing Division",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: BUFFALO_LAST_VERIFIED,
    lastVerifiedAt: BUFFALO_LAST_VERIFIED,
    notes:
      "Read 2026-09-25 as the Department's own plain-text page, which says of itself that it \"provides a plain-text summary of the Plumbing Permit fees\". Every figure on the plumbing page comes from it: the $50 application, the $100 plan review when plans are required, the $12 residential fixture and the $50-first/$20-additional commercial fixture rows with the page's own fixture list, the underground piping lines ($60 for the first 100 feet, then $20 or $55 per additional 100 by pipe size), the $75 reinspection, the note that the declared valuation \"is used for record-keeping purposes and does not replace the required permit fees\", the requirement that applications be signed by a Licensed Master Plumber, and the page's own total. The page carries no effective date; it is read as current because the Department publishes it as its live fee page.",
  },
  {
    key: BUFFALO_ELECTRICAL_SOURCE_KEY,
    jurisdictionKey: BUFFALO_KEYS.jurisdiction,
    title: "City of Buffalo — Electric Permit Types and Fees (flat fee schedule, Schedule A and Use Multiplier Schedule B)",
    url: "https://www.buffalony.gov/DocumentCenter/View/3204/NEW-electrical-fee-schedule",
    sourceType: "fee_schedule_pdf",
    issuingAuthority: "City of Buffalo — Department of Permit & Inspection Services",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2017-05-31",
    effectiveFrom: null,
    retrievedAt: BUFFALO_LAST_VERIFIED,
    lastVerifiedAt: BUFFALO_LAST_VERIFIED,
    notes:
      "Read 2026-09-25. The URL is served as a Word file rather than a PDF — its type was checked with `file` rather than assumed — and was unzipped and read from its document XML; the file's metadata dates it 2017-05-31, and the schedule itself prints no date. Both regimes are transcribed from it: the flat schedule's \"APPLICATION FEE of $50 PLUS one of the following\" with its five rows and its $5-per-termination low-voltage plus, and Schedule A's three area charges (application $50; plan review $50 or $0.0025 × SF × multiplier; permit and inspection $50 or $0.0275 × SF × multiplier; plus $25 a meter and $3.00 a solar panel) with Schedule B's occupancy multipliers — including its three blank rows, I-2, I-3 and I-4, which print no multiplier and are modelled by no rate.",
  },
  {
    key: BUFFALO_FEE_HUB_SOURCE_KEY,
    jurisdictionKey: BUFFALO_KEYS.jurisdiction,
    title: "City of Buffalo — Fee Schedule hub page",
    url: "https://www.buffalony.gov/721/Fee-Schedule",
    sourceType: "municipal_website",
    issuingAuthority: "City of Buffalo",
    authorityKind: "city",
    isPrimary: false,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: BUFFALO_LAST_VERIFIED,
    lastVerifiedAt: BUFFALO_LAST_VERIFIED,
    notes:
      "Read 2026-09-25 as the index that links the sheets. The hub carries a stale sentence — \"The fee changes are effective from July 29, 2014\" — while both building PDFs it links are printed EFFECTIVE 7/1/2025. The PDFs are the dated instruments and they win; the disagreement is recorded rather than resolved in favour of the newer-looking page copy. The page also states the split this jurisdiction is built on: \"Building Permit fees … does not include plumbing, electrical, or heating work.\"",
  },
  {
    key: BUFFALO_DEPARTMENT_SOURCE_KEY,
    jurisdictionKey: BUFFALO_KEYS.jurisdiction,
    title: "City of Buffalo — Department of Permit & Inspection Services, division pages",
    url: "https://www.buffalony.gov/435/Permit-Inspection-Services",
    sourceType: "municipal_website",
    issuingAuthority: "City of Buffalo",
    authorityKind: "city",
    isPrimary: false,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: BUFFALO_LAST_VERIFIED,
    lastVerifiedAt: BUFFALO_LAST_VERIFIED,
    notes:
      "Read 2026-09-25, together with the Permits page (/719/Permits) and the Electrical division page (/499/Electrical). The division pages are where the trade split is operated — each trade has its own division, contact and process — and where online filing is offered through ePermits, whose page notes a convenience fee for card payments. The department contact facts on this site (address, main line, plumbing room) come from these pages and from the fee sheets' own letterheads.",
  },
  {
    key: BUFFALO_ICC_BVD_SOURCE_KEY,
    jurisdictionKey: BUFFALO_KEYS.jurisdiction,
    title: "ICC Building Valuation Data, February 2023 — the mean-cost table the commercial sheet points to",
    url: "https://www.buffalony.gov/DocumentCenter/View/11964/ICC_BuildingValuationFeb2023cleaned",
    sourceType: "fee_schedule_pdf",
    issuingAuthority: "International Code Council, as republished by the City of Buffalo",
    authorityKind: "city",
    isPrimary: false,
    documentDate: "2023-02-01",
    effectiveFrom: null,
    retrievedAt: BUFFALO_LAST_VERIFIED,
    lastVerifiedAt: BUFFALO_LAST_VERIFIED,
    notes:
      "Read 2026-09-25: the mean construction rate table the commercial sheet instructs applicants to use — rate by use/occupancy and construction type, times the City's own scope-of-work factor, times the work area, equals the mean construction cost that the $0.75 and $8 per-$1,000 charges are computed from. The City republishes the ICC's February 2023 table on its own document centre. This jurisdiction takes the resulting cost as an input; the area-times-rate derivation itself is a 300-cell lookup this engine does not model as one rule, and the pages say so (reading c).",
  },
];

/** Empty on purpose: the permit types Buffalo uses already exist as shared rows. */
const permitTypes: JurisdictionSeed["permitTypes"] = [];
const projectTypes: JurisdictionSeed["projectTypes"] = [];

const jurisdictionPermitTypes: SeedJurisdictionPermitType[] = [
  {
    jurisdictionKey: BUFFALO_KEYS.jurisdiction,
    permitTypeKey: "building",
    isAvailable: true,
    localName: "Building permit — residential sheet or commercial sheet, by construction class",
    officialUrl: "https://www.buffalony.gov/719/Permits",
    notes:
      "Two sheets, not one schedule with a column split. The residential sheet covers detached 1- and 2-family dwellings and prices new dwellings by flat area bands and alterations by cost at $5 per $1,000 with a $50 minimum; the commercial sheet covers everything else and prices off mean construction cost at $8 per $1,000 with a $100 minimum, plan review at $0.75 per $1,000 with a $75 minimum, both rounding the cost up to a whole $1,000 as the sheet's own worked examples do. Which sheet answers is a single fact — whether the job is a one- or two-family dwelling.",
  },
  {
    jurisdictionKey: BUFFALO_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    isAvailable: true,
    localName: "Electrical permit — flat fee or area-calculated",
    officialUrl: "https://www.buffalony.gov/499/Electrical",
    notes:
      "Two regimes, chosen by the plans. When no drawings or plans are required by the Building Code of New York State: a $50 application plus one flat row — $50 for one-family work, $75 for both apartments of a two-family, $50 for a first meter release, $75 for a low-voltage system plus $5.00 a termination, $75 for site work. When plans are required: Schedule A's area charges, $50 or $0.0025 × SF × multiplier for plan review and $50 or $0.0275 × SF × multiplier for permit and inspection, floored at $50 each, with Schedule B's occupancy multiplier — and Schedule B prints no multiplier for I-2, I-3 or I-4.",
  },
  {
    jurisdictionKey: BUFFALO_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    isAvailable: true,
    localName: "Plumbing permit — flat price list",
    officialUrl: "https://www.buffalony.gov/614/Plumbing-Permit-Fees",
    notes:
      "A plain-text price list rather than a valuation schedule: $50 application on every filing, $100 plan review when plans are required, fixtures at $12 each in a 1- or 2-family home or $50 first plus $20 each additional elsewhere, underground piping at $60 for the first 100 linear feet and $20 or $55 per additional 100 by pipe size, $75 per reinspection. The declared job valuation is taken for the record and prices nothing. A City of Buffalo Licensed Master Plumber must sign the application.",
  },
];

const feeSchedules: SeedFeeSchedule[] = [
  {
    key: BUFFALO_KEYS.residentialSchedule,
    jurisdictionKey: BUFFALO_KEYS.jurisdiction,
    sourceKey: BUFFALO_RESIDENTIAL_SCHEDULE_SOURCE_KEY,
    title: "City of Buffalo — Building Permit Fee Schedule (Residential: Detached 1- & 2-Family Dwellings)",
    officialUrl: "https://www.buffalony.gov/DocumentCenter/View/15213/Residential_Permit_Fees",
    effectiveFrom: BUFFALO_BUILDING_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: BUFFALO_LAST_VERIFIED,
    notes:
      "The dated instrument: printed EFFECTIVE 7/1/2025 on the sheet itself, which is later than the stale 2014 sentence the fee-schedule hub still carries — the sheet wins, and the disagreement is recorded in the research record.",
  },
  {
    key: BUFFALO_KEYS.commercialSchedule,
    jurisdictionKey: BUFFALO_KEYS.jurisdiction,
    sourceKey: BUFFALO_COMMERCIAL_SCHEDULE_SOURCE_KEY,
    title: "City of Buffalo — Building Permit Fee Schedule (Commercial Buildings)",
    officialUrl: "https://www.buffalony.gov/DocumentCenter/View/15216/Commercial_Permit_Fees",
    effectiveFrom: BUFFALO_BUILDING_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: BUFFALO_LAST_VERIFIED,
    notes:
      "Also printed EFFECTIVE 7/1/2025. Four pages: the schedule, the ICC Building Valuation Data Table with the City's scope-of-work factors, and two worked examples whose totals — $32,792.50 and $8,377.50 — this jurisdiction's tests reproduce exactly.",
  },
  {
    key: BUFFALO_KEYS.electricalSchedule,
    jurisdictionKey: BUFFALO_KEYS.jurisdiction,
    sourceKey: BUFFALO_ELECTRICAL_SOURCE_KEY,
    title: "City of Buffalo — Electric Permit Types and Fees (flat fee, Schedule A, Schedule B)",
    officialUrl: "https://www.buffalony.gov/DocumentCenter/View/3204/NEW-electrical-fee-schedule",
    effectiveFrom: BUFFALO_ELECTRICAL_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: BUFFALO_LAST_VERIFIED,
    notes:
      "Undated on its face; the document metadata reads 2017-05-31, which is the effectiveFrom above — the engine needs a date, and the metadata is the only one the document carries. Read as current because the Department publishes it as its live electrical schedule.",
  },
  {
    key: BUFFALO_KEYS.plumbingSchedule,
    jurisdictionKey: BUFFALO_KEYS.jurisdiction,
    sourceKey: BUFFALO_PLUMBING_SOURCE_KEY,
    title: "City of Buffalo — Plumbing Permit Fee Schedule",
    officialUrl: "https://www.buffalony.gov/614/Plumbing-Permit-Fees",
    effectiveFrom: BUFFALO_PLUMBING_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: BUFFALO_LAST_VERIFIED,
    notes:
      "Undated on its face, so effective from the day it was read — the date the Department's own page became this site's source for the figures. Every amount on it is a flat price; the page prices no valuation.",
  },
];

function attach(permitTypeKey: string, rules: SeedFeeRule["rule"][], scheduleKey: string): SeedFeeRule[] {
  return rules.map((rule) => ({
    jurisdictionKey: BUFFALO_KEYS.jurisdiction,
    permitTypeKey,
    scheduleKey,
    rule,
  }));
}

const feeRules: SeedFeeRule[] = [
  ...attach("building", BUFFALO_RESIDENTIAL_BUILDING_RULES, BUFFALO_KEYS.residentialSchedule),
  ...attach("building", BUFFALO_COMMERCIAL_BUILDING_RULES, BUFFALO_KEYS.commercialSchedule),
  ...attach("electrical", BUFFALO_ELECTRICAL_RULES, BUFFALO_KEYS.electricalSchedule),
  ...attach("plumbing", BUFFALO_PLUMBING_RULES, BUFFALO_KEYS.plumbingSchedule),
];

const requirements: SeedRequirement[] = [
  {
    jurisdictionKey: BUFFALO_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "Permits for all work not exempt under Charter §103-2.3 — and the two sheets never overlap",
    description:
      "The commercial sheet opens with it: \"Permits are required for all work that is not listed as exempted in Section 103-2.3 of the Buffalo City Charter.\" The fee-schedule hub adds the split from the other direction — \"Building Permit fees … does not include plumbing, electrical, or heating work\" — and the commercial sheet's own header keeps the trades out: \"Heating, Electrical, and Plumbing (M/E/P) permits and fees are separate.\" Which building sheet answers is therefore one fact on this site: whether the job is on a detached 1- or 2-family dwelling.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: BUFFALO_COMMERCIAL_SCHEDULE_SOURCE_KEY,
    lastVerifiedAt: BUFFALO_LAST_VERIFIED,
  },
  {
    jurisdictionKey: BUFFALO_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "document",
    title: "Plan review is charged when the work requires plans, at each sheet's own rate",
    description:
      "Residential: \"Plan Review Fee (if work requires plans) (includes M/E/P plan review fees) — 20% of permit fee; $25 minimum\" — one percentage that already contains the mechanical, electrical and plumbing reviews, so those are not added again on their own pages. Commercial: \"$0.75 per $1,000 of mean construction cost or portion thereof; $75 minimum\", which is when plans are required as well. Both are in addition to the permit fee, and both are modelled as their own line rather than folded into the permit.",
    isMandatory: false,
    sortOrder: 20,
    sourceKey: BUFFALO_COMMERCIAL_SCHEDULE_SOURCE_KEY,
    lastVerifiedAt: BUFFALO_LAST_VERIFIED,
  },
  {
    jurisdictionKey: BUFFALO_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "The mean construction cost is the applicant's own lookup: R × S × W = C",
    description:
      "The commercial sheet prints the method on page 2: find the tabular rate R for the use and construction type in the ICC Building Valuation Data Table, multiply by the City's scope-of-work factor S (1 for a new building, .6 with foundation and superstructure only, .8 with the envelope, .7 for an addition or alteration, .5, .3, .3 for narrower scopes), multiply by the work area W, and the result C is the mean construction cost the $0.75 and $8 per-$1,000 charges are computed from — with multi-use buildings summed use by use. This site takes C as an input; producing it from area and occupancy is the applicant's calculation, and the pages say so rather than pretending the engine ran it.",
    isMandatory: true,
    sortOrder: 30,
    sourceKey: BUFFALO_ICC_BVD_SOURCE_KEY,
    lastVerifiedAt: BUFFALO_LAST_VERIFIED,
  },
  {
    jurisdictionKey: BUFFALO_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "document",
    title: "The plans decide which electrical schedule answers",
    description:
      "\"All Electrical Flat Fee work is only when NO drawings or plans are required by the Building Code of New York State\" — and, in the other regime, \"When drawings and or plans are required fees will be derived using the area-calculated fee table, employing the building occupancy/use class multiplier.\" The flat schedule adds that flat fees \"are not applicable for new construction projects or where plans are required by the Building Code of New York State, e.g. Fire Alarm Systems.\" One fact on this site — whether plans are required — chooses between the two, and they never answer together.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: BUFFALO_ELECTRICAL_SOURCE_KEY,
    lastVerifiedAt: BUFFALO_LAST_VERIFIED,
  },
  {
    jurisdictionKey: BUFFALO_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "other",
    title: "Each use is totalled by floor and multiplied by its Schedule B row",
    description:
      "Schedule A's own instructions: \"Identify each use or occupancy on each floor, story, or mezzanine … calculate each area use in square footage … Total the sum of all similar uses … Apply the Area-Calculated Use Multiplier from Schedule B to each use total,\" with common areas charged at the principal use of their floor. A mixed-use building therefore computes once per use and adds the results; this site carries a single occupancy and its single area, so a mixed-use project's per-use totals are the applicant's to run — named on the page rather than silently approximated. Schedule B's I-2, I-3 and I-4 rows print no multiplier at all, and no rate is invented for them.",
    isMandatory: true,
    sortOrder: 20,
    sourceKey: BUFFALO_ELECTRICAL_SOURCE_KEY,
    lastVerifiedAt: BUFFALO_LAST_VERIFIED,
  },
  {
    jurisdictionKey: BUFFALO_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    requirementType: "license",
    title: "A City of Buffalo Licensed Master Plumber signs the application",
    description:
      "The plumbing fee page states it in its notes: \"Applications must be completed and signed by a Licensed Master Plumber\", and \"A valid Plumbing Permit must be approved before work begins.\" The page adds what happens when an inspection fails or the work is not ready at the agreed time: \"a separate permit, with application fee, will be required\" — beside the $75.00 reinspection fee this site charges.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: BUFFALO_PLUMBING_SOURCE_KEY,
    lastVerifiedAt: BUFFALO_LAST_VERIFIED,
  },
  {
    jurisdictionKey: BUFFALO_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    requirementType: "other",
    title: "The linear footage is reported; the declared valuation prices nothing",
    description:
      "\"Total linear footage must be reported on the application\", and the underground run is priced in 100-foot segments by pipe size from that number. The valuation is a different matter: \"Applicants must declare the total value of the plumbing work being performed. The declared valuation is used for record-keeping purposes and does not replace the required permit fees\" — so no plumbing rule on this site reads a cost, and a plumbing total never changes because a job got more expensive.",
    isMandatory: true,
    sortOrder: 20,
    sourceKey: BUFFALO_PLUMBING_SOURCE_KEY,
    lastVerifiedAt: BUFFALO_LAST_VERIFIED,
  },
  {
    jurisdictionKey: BUFFALO_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "Online filing through ePermits",
    description:
      "The Department's pages offer online filing through ePermits, linked from the fee-schedule hub, and the ePermits page notes a convenience fee on card payments. That fee is the payment processor's rather than a permit fee of the sheets transcribed here, so it is named rather than charged — as the hub's stale 2014 effective-date sentence is recorded rather than followed.",
    isMandatory: false,
    sortOrder: 40,
    sourceKey: BUFFALO_DEPARTMENT_SOURCE_KEY,
    lastVerifiedAt: BUFFALO_LAST_VERIFIED,
  },
];

const profile: SeedProfile = {
  jurisdictionKey: BUFFALO_KEYS.jurisdiction,
  headline: "What construction permits cost in Buffalo",
  summary:
    "Buffalo prices construction on **two building sheets split by construction class** — detached 1- and 2-family dwellings on one, everything else on the other — plus a trade schedule for electrical work that is either a flat fee or a price on square footage times an occupancy multiplier, and a plumbing price list where no valuation is a fee basis at all. A residential alteration is $5 for each $1,000 of cost above a $50 floor; a commercial one is $8 per $1,000 of mean construction cost rounded up to the next whole thousand, with plan review at $0.75 alongside it.",
  localContext:
    "One department, three separate books. The Department of Permit & Inspection Services sits in City Hall and keeps each trade in its own division, and the fee documents say so twice over: the commercial sheet's header reads \"Heating, Electrical, and Plumbing (M/E/P) permits and fees are separate\", and the fee-schedule hub says from the other side that building permit fees do not include plumbing, electrical or heating work. The three pages on this site therefore price three permits that an applicant adds together, exactly as each sheet's own total adds its own lines.\n\nThe construction class is the switch that decides which building sheet answers — a fact rather than a guess, because the two sheets are different schedules rather than one schedule with a column split. The residential sheet has no valuation table at all: it bands new dwellings by floor area ($500 to $900 for a one-family, $1,000 for a two-family, $500 per townhouse unit) and prices alterations by cost at $5 per $1,000. The commercial sheet has no area bands: it takes a mean construction cost and charges $8 per $1,000 with $100 minimum, beside $0.75 per $1,000 of plan review with $75 minimum — and both of those rows round the cost up to a whole $1,000, because both print \"or portion thereof\" in the sheet's own words and in both of its worked examples.\n\nTwo documents in this research disagree and the disagreement is kept: the fee-schedule hub still prints \"The fee changes are effective from July 29, 2014\" while the PDFs it links are stamped EFFECTIVE 7/1/2025. The dated instruments win, and the stale sentence is recorded rather than deleted, because a reader who lands on the hub first deserves to know why the two do not match. The City Code itself could not be read from this environment — ecode360, which the City's own pages link for Chapters 103 and 175, answers 403 — so every figure comes from the Department's own sheets, which is what an applicant pays against anyway.",
  valuationBasis:
    "Three different bases, because the three schedules measure three different things — and one price list that measures none.\n\n**Commercial construction: mean construction cost.** The sheet's method is printed as a formula: R × S × W = C, where R is the ICC table's rate for the use and construction type, S the City's scope-of-work factor (1 for a new building or addition, .7 for an addition or alteration to an existing building, .3 for interior build-out alone, and the others the sheet lists), and W the work area. The resulting cost C is what $0.75 and $8 per $1,000 are charged on, in whole thousands. For repairs and work on elements that are not part of the building the sheet says to use the contract amount instead — the same basis, a different number. This site takes the cost as an input; the area-times-rate derivation is the applicant's lookup.\n\n**Residential construction: the cost of the work**, but only for additions, alterations and repairs — $5 per $1,000 with a $50 minimum, prorated, because that row never prints the round-up phrase. New residential dwellings are priced on floor area instead, in flat bands, and no cost figure moves them.\n\n**Electrical: square footage times an occupancy multiplier.** In the area regime each charge is a rate per square foot multiplied by Schedule B's row for the occupancy — $0.0025 × SF × 1.5 for plan review in an assembly building, $0.0275 × SF × 1.28 for permit and inspection in an R-2 — each floored at $50. In the flat regime there is no basis at all: the job's kind decides the row.\n\n**Plumbing: no valuation is read anywhere.** The page says why: the declared valuation \"is used for record-keeping purposes and does not replace the required permit fees\". Fixtures and linear feet are the only quantities the plumbing fees are made of.",
  notIncluded:
    "These figures are Buffalo's own building, electrical and plumbing permit fees. They are not a project cost, and they exclude:\n\n- **Certificates.** The commercial sheet prices a Conditional Certificate at $200, a residential certificate at $50, and commercial certificates at $300, $600 and $900 by floor-area band. They are charged for a certificate rather than for a permit, quoted on the page and not computed here.\n- **The ICC area-times-rate derivation.** The commercial per-thousand charges compute from the mean construction cost you supply; producing that cost from an occupancy, a construction type, a scope factor and a work area is the applicant's own calculation against the table, and this site does not run it.\n- **Mixed-use apportionment on electrical permits.** Schedule A's instructions total each use separately and multiply each by its own Schedule B row, common areas at their floor's principal use. One occupancy and one area are collected here, so a mixed-use building's per-use totals are the applicant's to add.\n- **Heating and mechanical permits.** The Department's pages kept no separate heating fee sheet on this pass — the commercial header names heating among the separate trades, and no sheet for it was found. Its fees are not in any total on this site.\n- **The ePermits convenience fee.** Online filing through ePermits notes a convenience fee on card payments; it is the payment channel's charge rather than a fee on any sheet transcribed here.\n- **License fees, rental registration and returned-check charges.** None of them is permitting, and none is charged.\n- **The stale date on the hub.** The fee-schedule page's \"effective July 29, 2014\" sentence contradicts the PDFs it links; the sheets' EFFECTIVE 7/1/2025 stamps are the dates used, and the disagreement is recorded rather than smoothed over.",
  seoTitle: "Buffalo construction permit fees",
  seoDescription:
    "How Buffalo prices construction permits — two building sheets split by construction class ($5 per $1,000 residential, $8 per $1,000 of mean cost commercial), the electrical schedule's flat and area regimes with Schedule B's multipliers, and the plumbing price list.",
  publishStatus: "published",
  noindex: false,
  lastReviewedAt: BUFFALO_LAST_VERIFIED,
};

const permitPages: SeedPermitPage[] = [
  {
    jurisdictionKey: BUFFALO_KEYS.jurisdiction,
    permitTypeKey: "building",
    slug: "building-permit-cost",
    title: "Buffalo building permit cost",
    intro:
      "A Buffalo building permit is priced on **one of two sheets, chosen by the building**: a detached 1- or 2-family dwelling pays a flat band for a new house ($500 to $900 by floor area, $1,000 for a two-family) or $5.00 for each $1,000 of cost on an addition, with a $50 floor — and everything else pays $8.00 for each $1,000 of mean construction cost, rounded up to a whole thousand, above a $100 minimum. Plan review rides beside it: 20% of the permit fee in a house, $0.75 per $1,000 of mean cost elsewhere.",
    localSummary:
      "The sheet is decided by one fact — whether the job is on a detached 1- or 2-family dwelling — because the two schedules are different documents rather than one schedule split into columns. The residential sheet has no valuation table: it bands new dwellings by floor area and prices alterations by cost, and its $5 row never prints the round-up phrase, so a fraction of a thousand is charged as the fraction it is ($12,001 of cost is $60.01) with the $50 floor binding at $10,000 and below. The commercial sheet works the other way round: it takes a mean construction cost from the ICC table, rounds the cost itself up to the next whole $1,000, and multiplies — the sheet's own Example 1 runs a $3,741,600 new building up to $3,742,000, then $2,806.50 of plan review and $29,936.00 of permit fee, and $50 of application makes $32,792.50. This site reproduces that total to the cent.\n\nPlan review is a separate line with its own floor on each sheet — 20% of the permit fee with $25 minimum, where the percentage reads the permit fee alone so the $25 application is not part of it, and $0.75 per $1,000 with $75 minimum where the floor binds below $100,000 of mean cost. Flat fees for small work — a fence, a sign, a tank, a shed — are added beside the permit rather than folded into it, because the sheets' own totals add them: application, plan review, use permit, flat fees, then the permit fee itself.\n\nTwo charges a reader might expect are absent and their absence is documented rather than assumed: no state or county surcharge appears anywhere in the City's fee documents, and the certificate prices ($200 to $900) are charged for a certificate rather than for the permit.",
    notIncluded:
      "This is the Buffalo building permit fee — application, plan review and permit fee under the sheet that answers the job, plus whatever flat fees the job triggers. It excludes:\n\n- **Certificate fees.** The commercial sheet prices a Conditional Certificate at $200, a residential certificate at $50, and commercial certificates at $300, $600 and $900 by floor-area band. They are named here and not computed.\n- **The ICC mean-cost derivation.** The commercial charges compute from the mean construction cost you supply; producing it from the ICC table's rate, the scope-of-work factor and the work area is the applicant's calculation (R × S × W = C), printed on page 2 of the sheet.\n- **Heating, electrical and plumbing work.** The commercial sheet's own header: \"Heating, Electrical, and Plumbing (M/E/P) permits and fees are separate.\" The residential sheet's plan review line says it \"includes M/E/P plan review fees\", so those reviews are not added again — but the trade permits themselves are separate permits priced on their own pages.\n- **Demolition penalties for unpermitted work on the residential sheet.** The $1,500 penalty for demolishing without a permit is printed on the commercial sheet only; the residential sheet's demolition rows are $300 and $75 by unit and carry no penalty line.\n- **The exemptions in Charter §103-2.3.** The sheet requires permits for all work not listed as exempt there; the list itself is in the Charter, which this pass could not read (the City's codifier answers 403), so an exempt project would still be priced here.\n- **License, rental registration and returned-check charges.** Not permitting, and not charged.\n- **The ePermits convenience fee.** Online filing notes a convenience fee on card payments — the payment channel's charge rather than the sheet's.",
    workedExample: {
      scenario:
        "The sheet's own Example 1: a new 16,000 sq. ft. office building, Group B, Type IIB, whose mean construction cost is $3,741,600, with plans required for review.",
      inputs: {
        valuationCents: 374_160_000,
        occupancy: "commercial",
        workType: "new_construction",
        custom: { one_two_family: false, plan_review: true },
      },
      notes:
        "The sheet computes this on page 3, and every line here is its own. Application fee: $50.00.\n\nPlan review is $0.75 per $1,000 of mean construction cost \"or portion thereof\": the $3,741,600 is charged as $3,742,000 — the sheet's own step, rounding the cost up to the next whole thousand — and 3,742 thousands at $0.75 is $2,806.50, above the $75 floor.\n\nThe permit fee is $8.00 per $1,000 of the same rounded cost: 3,742 × $8.00 is $29,936.00, above the $100 minimum.\n\nTotal: $50.00 + $2,806.50 + $29,936.00 = $32,792.50 — the figure the sheet prints. What moves it: at $945,496 of mean cost (the sheet's Example 2) the same three lines come to $8,377.50 with the $50 use permit of an occupancy change added; without plans, the plan review line disappears; and in a house the same job would be priced on the residential sheet's bands and $5-per-$1,000 row instead, where nothing rounds to a whole thousand.",
    },
    faqs: [
      {
        question: "How much is a building permit in Buffalo?",
        answer:
          "It depends on the sheet. A detached 1- or 2-family dwelling pays $25 to apply, then a flat band for a new house ($500 to $900 by floor area, $1,000 for a two-family, $500 per townhouse unit) or $5.00 per $1,000 of cost for an addition, alteration or repair with a $50 minimum. Any other building pays $50 to apply, $8.00 per $1,000 of mean construction cost with a $100 minimum, and — when plans are required — $0.75 per $1,000 of plan review with a $75 minimum.",
        sourceId: BUFFALO_COMMERCIAL_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "What is mean construction cost, and where does it come from?",
        answer:
          "The commercial sheet's own basis: the ICC Building Valuation Data rate for the building's use and construction type, multiplied by the City's scope-of-work factor, multiplied by the work area — R × S × W = C. The sheet prints the table and seven scope factors on page 2 and works two examples on pages 3 and 4. This site takes the resulting cost as your input; the lookup itself is the applicant's calculation.",
        sourceId: BUFFALO_ICC_BVD_SOURCE_KEY,
      },
      {
        question: "Why does the cost round up to a whole $1,000?",
        answer:
          "Because the commercial sheet says so in two places: the plan review line reads \"$0.75 per $1,000 of mean construction cost or portion thereof\", and both worked examples charge $8.00 per $1,000 \"or portion thereof\" — rounding $3,741,600 to $3,742,000 before multiplying. The residential $5 row prints no such phrase and prorates instead, which is why $12,001 of residential cost is $60.01 rather than $60.00.",
        sourceId: BUFFALO_COMMERCIAL_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "Is plan review included in the permit fee?",
        answer:
          "No — it is a separate line on both sheets, in addition to the permit fee. Residential plan review is 20% of the permit fee with a $25 minimum, taken when the work requires plans, and its percentage reads the permit fee alone: the $25 application fee is not part of the basis. Commercial plan review is $0.75 per $1,000 of mean cost with a $75 minimum. The residential line explicitly includes the M/E/P plan review fees, so the trade reviews are not charged again.",
        sourceId: BUFFALO_RESIDENTIAL_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "Are electrical or plumbing work included in this total?",
        answer:
          "No. The commercial sheet's header states that \"Heating, Electrical, and Plumbing (M/E/P) permits and fees are separate\", and the fee-schedule hub says that building permit fees do not include plumbing, electrical or heating work. Each trade has its own permit, its own schedule and its own page here — and the residential plan review line's note that it \"includes M/E/P plan review fees\" means only the reviews ride along, not the permits.",
        sourceId: BUFFALO_FEE_HUB_SOURCE_KEY,
      },
      {
        question: "When is a certificate fee charged?",
        answer:
          "The commercial sheet prices certificates separately from the permit: a Conditional Certificate is $200, a residential certificate for a 1- or 2-family home is $50, and commercial certificates are $300, $600 or $900 by floor-area band. They are charged when a certificate issues rather than when a permit is taken, so they are named on this site and not added to any permit total.",
        sourceId: BUFFALO_COMMERCIAL_SCHEDULE_SOURCE_KEY,
      },
    ],
    seoTitle: "Buffalo building permit cost: $5 or $8 per $1,000",
    seoDescription:
      "Buffalo building permit fees — the residential sheet's $500–$900 new-dwelling bands and $5.00 per $1,000 alterations with a $50 floor, the commercial sheet's $8.00 per $1,000 of mean cost with a $100 minimum, plan review at 20% or $0.75 per $1,000, and the $25 or $50 application.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: BUFFALO_LAST_VERIFIED,
  },
  {
    jurisdictionKey: BUFFALO_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    slug: "electrical-permit-cost",
    title: "Buffalo electrical permit cost",
    intro:
      "A Buffalo electrical permit is **either a flat fee or a price on square footage**, and the plans decide which: with no drawings required by the Building Code, a $50 application plus one flat row ($50 for one-family work, $75 for both apartments of a two-family, $50 for a first meter release, $75 for a low-voltage system, $75 for site work); with plans, Schedule A's charges — $50 or $0.0025 × SF × multiplier for plan review, $50 or $0.0275 × SF × multiplier for permit and inspection, each floored at $50, times Schedule B's multiplier for the building's occupancy.",
    localSummary:
      "The two regimes are mutually exclusive by the schedule's own words: \"All Electrical Flat Fee work is only when NO drawings or plans are required by the Building Code of New York State\", and \"When drawings and or plans are required fees will be derived using the area-calculated fee table, employing the building occupancy/use class multiplier\". The application fee is the one charge both share — the flat schedule's \"APPLICATION FEE of $50 PLUS one of the following\" and Schedule A's first of three charges are the same $50.\n\nIn the area regime every charge is a product of two published numbers: the schedule's constant per square foot and Schedule B's multiplier for the occupancy named on the filing. Plan review is a quarter of a cent per square foot times the multiplier, permit and inspection two and three quarter cents times it, each with a $50 floor — \"whichever is greater\" is a floor on a rate, so a 5,000 sq. ft. R-2 alteration computes $16.00 of plan review and pays $50.00, while its permit and inspection computes $176.00 and pays that. Schedule B's table is stored as the table it is: assembly and educational are 1.5, business, factory and mercantile are 1, high hazard 2.25, R-2 is 1.28, R-3 is 0.5, and so on down the printed rows.\n\nOne gap is a fact about the City's document rather than a gap in this model: Schedule B's I-2, I-3 and I-4 rows print no multiplier at all — the I-2 row stops mid-sentence — so an application naming one of those occupancies is priced by no rate here, and the schedule is quoted rather than completed.",
    notIncluded:
      "This is 1 RCNY's counterpart for Buffalo — the flat schedule's application-plus-one, or Schedule A's area charges with Schedule B's multiplier. It excludes:\n\n- **The regime the plans did not choose.** Flat rows answer only when no drawings or plans are required; the area rows answer only when they are. A job with plans carries no flat row, and a job without them carries no area row — the schedule's own either/or.\n- **Mixed-use per-use totals.** Schedule A's instructions total each use on each floor separately and multiply each by its own Schedule B row, common areas at their floor's principal use. One occupancy and one area are collected here, so a mixed-use building's per-use arithmetic is the applicant's to add.\n- **The no-fee provisions the schedule refers to.** \"All other installations which are not subject of no-fee provisions have area-calculated permit fees\" — the no-fee provisions themselves are not printed on this schedule, so an installation exempted elsewhere would still be priced here.\n- **Site work billed beside building work.** The schedule adds the two when a job is both: \"FOR WORK ON BOTH BUILDINGS & STRUCTURES AND SITES: add the total electric permit cost for Buildings & Structures and the permit cost for the Site Work.\" Enter the site work as its own flat row when that is what the job is.\n- **Heating and alarm work under other permits.** Fire alarm systems are named in the schedule as an example of work that requires plans; the Department's other trade permits are separate permits, and no heating fee sheet was found on its pages this pass.",
    workedExample: {
      scenario:
        "A 5,000 sq. ft. alteration of an R-2 apartment building with plans required — Schedule A and Schedule B together, no meter or solar rows.",
      inputs: {
        squareFootage: 5_000,
        custom: { plans_required: true, elec_occupancy: "R-2" },
      },
      notes:
        "Schedule A's three charges, in the order the schedule lists them. Application fee: $50.00, the same $50 the flat schedule charges.\n\nPlan review: $50.00 or $0.0025 × 5,000 × 1.28 — the R-2 multiplier of Schedule B — which computes $16.00, so the \"whichever is greater\" floor of $50.00 is what is paid.\n\nPermit and inspection: $50.00 or $0.0275 × 5,000 × 1.28, which computes $176.00 and is above the floor, so $176.00 is paid.\n\nTotal: $50.00 + $50.00 + $176.00 = $276.00. What moves it: at 20,000 sq. ft. the same occupancy's plan review computes $64.00 and the floor stops binding; in an R-3 building (multiplier 0.5) the permit line computes $68.75 at this area; and an assembly occupancy's 1.5 multiplier lifts both rates by half again. Adding an electric meter is $25.00 each, and a commercial solar installation adds $3.00 per panel on the same two rows.",
    },
    faqs: [
      {
        question: "How much is an electrical permit in Buffalo?",
        answer:
          "Two answers, chosen by the plans. Without plans required by the Building Code: a $50 application plus one flat row — $50 for new work at a one-family dwelling or one apartment of a two-family, $75 for both apartments, $50 for a first meter release, $75 per low-voltage system plus $5.00 per termination, or $75 for site work. With plans: the $50 application, then plan review at $50 or $0.0025 × SF × multiplier and permit and inspection at $50 or $0.0275 × SF × multiplier, each floored at $50, with Schedule B's occupancy multiplier.",
        sourceId: BUFFALO_ELECTRICAL_SOURCE_KEY,
      },
      {
        question: "What is the occupancy multiplier?",
        answer:
          "Schedule B of the area schedule: one printed row per class/use, applied to the square footage of each use. Assembly and educational are 1.5; business, factory and mercantile are 1; high hazard is 2.25; I-1 is 1.75; R-1 and R-2 are 1.28; R-3 is 0.5; R-4 is 1.34; S-1 and S-2 are 0.7; utility is 0.85. Each area charge is the schedule's own per-square-foot constant times that row.",
        sourceId: BUFFALO_ELECTRICAL_SOURCE_KEY,
      },
      {
        question: "What if the building's occupancy is I-2, I-3 or I-4?",
        answer:
          "The schedule prices it by nothing. Schedule B's rows for I-2, I-3 and I-4 print no multiplier — the I-2 row of the City's document stops mid-sentence — so no rate exists for them and none is invented. An application naming one of those occupancies gets the application fee and a schedule that does not say what the rest costs; the Department is the place to ask.",
        sourceId: BUFFALO_ELECTRICAL_SOURCE_KEY,
      },
      {
        question: "Does the permit include the meters and the panels?",
        answer:
          "Meters are their own line in the area regime: \"PLUS each electric meter to be installed $25\", charged per meter. Commercial solar is priced per panel at $3.00 beside the same plan review and permit rows. In the flat regime a first meter release is a $50 flat row instead — the two regimes never answer the same job.",
        sourceId: BUFFALO_ELECTRICAL_SOURCE_KEY,
      },
      {
        question: "How are low-voltage systems charged?",
        answer:
          "In the flat regime only: $75 \"Per system PLUS $5.00 per termination\" for telephone, data cabling, security, CCTV, thermostats, sound systems, intercoms and energy management systems installed by an individual contractor. The $75 is the flat row and the $5.00 is charged per termination; with plans required, low-voltage work falls under the area schedule instead, as the schedule's own note about fire alarm systems shows.",
        sourceId: BUFFALO_ELECTRICAL_SOURCE_KEY,
      },
      {
        question: "Can a job pay both a flat fee and an area charge?",
        answer:
          "Not for the same work. The flat schedule applies \"only when NO drawings or plans are required\", and the area schedule applies \"When drawings and or plans are required\" — an either/or printed by the schedule itself. What a job can do is combine a building project with site work, which the schedule says to add: the building total plus the site work's flat fee.",
        sourceId: BUFFALO_ELECTRICAL_SOURCE_KEY,
      },
    ],
    seoTitle: "Buffalo electrical permit cost: flat fee or area schedule",
    seoDescription:
      "Buffalo electrical permit fees — the flat schedule's $50 application plus one row ($50–$75) when no plans are required, and Schedule A's $50-or-rate area charges times Schedule B's occupancy multiplier when they are.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: BUFFALO_LAST_VERIFIED,
  },
  {
    jurisdictionKey: BUFFALO_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    slug: "plumbing-permit-cost",
    title: "Buffalo plumbing permit cost",
    intro:
      "A Buffalo plumbing permit is a **price list, not a valuation**: $50.00 to apply on every filing, $100.00 of plan review when plans are required, fixtures at $12.00 each in a 1- or 2-family home or $50.00 for the first and $20.00 each after anywhere else, and underground piping at $60.00 for the first 100 linear feet with $20.00 or $55.00 per additional 100 feet by pipe size. The declared job valuation is taken for the record and prices nothing.",
    localSummary:
      "The page is explicit that no cost is a fee basis: \"The declared valuation is used for record-keeping purposes and does not replace the required permit fees listed above.\" Everything the fee is made of is a count — fixtures installed, linear feet of underground pipe laid — plus two flat lines (the $50 application on every filing, the $100 plan review when plans are required) and the $75 reinspection when one is needed.\n\nThe fixture row splits on the construction class the same way the building sheets do: $12.00 each for a 1- or 2-family residential fixture, and for commercial or other work $50.00 for the first fixture plus $20.00 each additional — four fixtures are $48.00 in a house and $110.00 in a store. The page's own fixture list is the one that counts: toilet, urinal, basin, bathtub, shower, sink, water heater, sump pump, floor drain, backflow device, drinking fountain, laundry connection, catch basin, manhole, other.\n\nUnderground piping is priced in 100-foot segments: $60.00 covers the first 100 feet of any size, then each additional 100 feet or part of one is $20.00 at 6 inches and under or $55.00 over 6 inches — so 250 feet of small pipe is the $60.00 line plus two segments, $40.00. \"Total linear footage must be reported on the application\", and the fee comes from that number alone.",
    notIncluded:
      "This is the plumbing permit fee as the Department's price list prints it. It excludes:\n\n- **Any valuation-based charge.** The declared job valuation is taken for the record and, in the page's own words, \"does not replace the required permit fees\" — so no line here changes because the job got more expensive.\n- **The separate permit required after a failed inspection.** The page states that for \"failure to pass inspection, or work not ready at the agreed-on inspection time, a separate permit, with application fee, will be required\" — that is a new permit at its own application fee, not an addition to this one; the $75.00 reinspection charged here is the reinspection itself.\n- **Building, electrical and heating work.** The commercial building sheet's header keeps the trades apart — \"Heating, Electrical, and Plumbing (M/E/P) permits and fees are separate\" — and each has its own page here. The building sheets' residential plan review line includes M/E/P plan review fees, so only the reviews ride along.\n- **Work performed before the permit issues.** \"A valid Plumbing Permit must be approved before work begins\" — a compliance requirement rather than a fee, and no penalty line for starting early is printed on this page.\n- **Code compliance work with no fee.** \"All plumbing work performed within the City of Buffalo must comply with applicable codes, rules, and regulations\" — the rules are requirements, not prices, and none is charged.",
    workedExample: {
      scenario:
        "A bathroom and laundry remodel in a one-family home: four fixtures, 250 linear feet of underground pipe at 6 inches or under, plans required for review.",
      inputs: {
        fixtures: 4,
        custom: { one_two_family: true, plan_review: true, linear_feet: 250 },
      },
      notes:
        "The page adds five lines, and its total says which: application, plan review, fixture fees, underground piping fees, reinspection fees if applicable.\n\nApplication fee: $50.00 — flat, required for all applications.\n\nPlan review: $100.00, because plans are required.\n\nFixtures: four at $12.00 each in a 1- or 2-family residence is $48.00.\n\nUnderground piping: $60.00 for the first 100 linear feet, then 150 feet past the first hundred buy two whole 100-foot segments at $20.00 each — $40.00 — because the schedule charges each additional 100 linear feet \"or part thereof\" by segments. Total underground: $100.00.\n\nTotal: $50.00 + $100.00 + $48.00 + $100.00 = $298.00. What moves it: the same job in a commercial building puts four fixtures on the $50-first/$20-additional row at $110.00; pipe over 6 inches takes $55.00 a segment instead of $20.00; and no reinspection is owed unless one happens, at $75.00 each. The declared valuation changes none of it.",
    },
    faqs: [
      {
        question: "How much is a plumbing permit in Buffalo?",
        answer:
          "$50.00 to apply on every application, then: $100.00 of plan review if plans are required; fixtures at $12.00 each in a 1- or 2-family home, or $50.00 for the first fixture plus $20.00 each additional elsewhere; underground piping at $60.00 for the first 100 linear feet plus $20.00 (pipe 6 inches and under) or $55.00 (over 6 inches) per additional 100 feet; and $75.00 per reinspection if one is needed.",
        sourceId: BUFFALO_PLUMBING_SOURCE_KEY,
      },
      {
        question: "Does the value of the plumbing work affect the permit fee?",
        answer:
          "No. Applicants declare the total value of the plumbing work, and the page states what the declaration is for: \"The declared valuation is used for record-keeping purposes and does not replace the required permit fees.\" Every fee on this page is made of counts — fixtures and linear feet — plus flat lines.",
        sourceId: BUFFALO_PLUMBING_SOURCE_KEY,
      },
      {
        question: "How is underground piping priced?",
        answer:
          "In 100-foot segments. The first 100 linear feet of any pipe size are $60.00; beyond that, each additional 100 linear feet or part of one is $20.00 for pipe 6 inches in diameter or under and $55.00 for pipe over 6 inches. The application must report the total linear footage, and that number is the whole basis.",
        sourceId: BUFFALO_PLUMBING_SOURCE_KEY,
      },
      {
        question: "Who signs the plumbing application?",
        answer:
          "A City of Buffalo Licensed Master Plumber: \"Applications must be completed and signed by a Licensed Master Plumber\", and \"A valid Plumbing Permit must be approved before work begins.\" The fee page also provides that a failed or missed inspection requires a separate permit with its own application fee.",
        sourceId: BUFFALO_PLUMBING_SOURCE_KEY,
      },
      {
        question: "What does a reinspection cost?",
        answer:
          "$75.00 per reinspection, charged for \"failure to pass inspection, or work not ready at the agreed-on inspection time\". The same note adds that a separate permit with an application fee will be required in that case — that is a new permit, not part of this total.",
        sourceId: BUFFALO_PLUMBING_SOURCE_KEY,
      },
    ],
    seoTitle: "Buffalo plumbing permit cost: fixtures and linear feet",
    seoDescription:
      "Buffalo plumbing permit fees — $50 application, $100 plan review, fixtures at $12 each residential or $50 first plus $20 each additional, underground piping at $60 per first 100 feet plus $20 or $55 per 100, $75 reinspection.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: BUFFALO_LAST_VERIFIED,
  },
];

const verifications: SeedVerification[] = [
  {
    entityType: "source",
    entityKey: BUFFALO_RESIDENTIAL_SCHEDULE_SOURCE_KEY,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: BUFFALO_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BUFFALO_RESIDENTIAL_SCHEDULE_SOURCE_KEY,
    notes:
      "Read 2026-09-25 as the Department's one-page PDF stamped EFFECTIVE 7/1/2025. Transcribed: the $25 application, the 20% plan review with its $25 minimum and its M/E/P note, the four one-family area bands with the two-family and townhouse rows, the $5-per-$1,000 cost row with the $50 minimum, all eight flat fees, both demolition rows, all three use permits, and the sheet's own total. The stray \"65\" mid-page was checked against the PDF's content-stream coordinates and is a header-block artifact at no value column.",
  },
  {
    entityType: "source",
    entityKey: BUFFALO_COMMERCIAL_SCHEDULE_SOURCE_KEY,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: BUFFALO_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BUFFALO_COMMERCIAL_SCHEDULE_SOURCE_KEY,
    notes:
      "Read 2026-09-25 as the four-page PDF stamped EFFECTIVE 7/1/2025 on every page. Transcribed: $50 application, the $0.75-per-$1,000 plan review line with \"or portion thereof\" and its $75 minimum, the $8-per-$1,000 permit row with its $100 minimum, twelve flat fees, the three demolition rows with the $1,500 penalty, the five certificate prices, the use permit, the ICC table with the City's seven scope factors, and both worked examples — whose totals this jurisdiction's tests reproduce as $32,792.50 and $8,377.50.",
  },
  {
    entityType: "source",
    entityKey: BUFFALO_PLUMBING_SOURCE_KEY,
    status: "verified",
    method: "manual_review",
    verifiedAt: BUFFALO_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BUFFALO_PLUMBING_SOURCE_KEY,
    notes:
      "Read 2026-09-25 as the Department's plain-text page, which describes itself as a plain-text summary of the plumbing fees. Every figure on the plumbing page comes from it, including the fixture list, the underground segments, the \"record-keeping purposes\" sentence about the declared valuation, and the Licensed Master Plumber requirement. The page prints no effective date.",
  },
  {
    entityType: "source",
    entityKey: BUFFALO_ELECTRICAL_SOURCE_KEY,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: BUFFALO_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BUFFALO_ELECTRICAL_SOURCE_KEY,
    notes:
      "Read 2026-09-25 from the Word file the URL actually serves (type checked with `file`, then unzipped); its metadata dates 2017-05-31. Transcribed: the flat schedule's five rows with its \"PLUS one of the following\" and the $5-per-termination low-voltage plus, Schedule A's three charges with both $50 floors and both per-square-foot constants, the $25 meter and $3.00 solar panel lines, the schedule's own regime-switch sentences, and Schedule B in full — all thirteen printed multiplier rows and the three blanks at I-2, I-3 and I-4.",
  },
  {
    entityType: "source",
    entityKey: BUFFALO_FEE_HUB_SOURCE_KEY,
    status: "verified",
    method: "manual_review",
    verifiedAt: BUFFALO_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BUFFALO_FEE_HUB_SOURCE_KEY,
    notes:
      "Read 2026-09-25 as the index linking every sheet. Its stale \"effective from July 29, 2014\" sentence is recorded against its own links, which are stamped 7/1/2025, and its \"does not include plumbing, electrical, or heating work\" sentence is quoted on all three pages as the trade split.",
  },
  {
    entityType: "source",
    entityKey: BUFFALO_DEPARTMENT_SOURCE_KEY,
    status: "verified",
    method: "manual_review",
    verifiedAt: BUFFALO_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BUFFALO_DEPARTMENT_SOURCE_KEY,
    notes:
      "Read 2026-09-25 with the Permits and Electrical division pages: the department address and division structure behind this site's contact block, and the ePermits online-filing link whose convenience fee is named rather than charged.",
  },
  {
    entityType: "source",
    entityKey: BUFFALO_ICC_BVD_SOURCE_KEY,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: BUFFALO_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BUFFALO_ICC_BVD_SOURCE_KEY,
    notes:
      "Read 2026-09-25 as the City's own republication of the ICC's February 2023 Building Valuation Data: rates by use and construction type, which the commercial sheet combines with its scope factor and work area into the mean construction cost this jurisdiction takes as an input. The derivation itself is not modelled and is named on the page (reading c).",
  },
  {
    entityType: "fee_schedule",
    entityKey: BUFFALO_KEYS.residentialSchedule,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: BUFFALO_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BUFFALO_RESIDENTIAL_SCHEDULE_SOURCE_KEY,
    notes:
      "The schedule row points at the sheet's own PDF and carries the printed effective date 2025-07-01 — later than the hub's stale 2014 sentence, which is recorded rather than followed.",
  },
  {
    entityType: "fee_schedule",
    entityKey: BUFFALO_KEYS.commercialSchedule,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: BUFFALO_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BUFFALO_COMMERCIAL_SCHEDULE_SOURCE_KEY,
    notes:
      "The schedule row points at the four-page PDF and carries 2025-07-01, printed on every page; its two worked examples are the arithmetic check this jurisdiction's tests run.",
  },
  {
    entityType: "fee_schedule",
    entityKey: BUFFALO_KEYS.electricalSchedule,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: BUFFALO_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BUFFALO_ELECTRICAL_SOURCE_KEY,
    notes:
      "The schedule row carries 2017-05-31 — the document metadata, since the schedule prints no date of its own — with the page noting that the file is served as Word and read as current because the Department publishes it as its live schedule.",
  },
  {
    entityType: "fee_schedule",
    entityKey: BUFFALO_KEYS.plumbingSchedule,
    status: "verified",
    method: "manual_review",
    verifiedAt: BUFFALO_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BUFFALO_PLUMBING_SOURCE_KEY,
    notes:
      "The schedule row carries the read date as its effectiveFrom because the page prints no date; the page is the Department's live fee page, and the record's open questions keep the point visible.",
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-RES-COST",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: BUFFALO_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BUFFALO_RESIDENTIAL_SCHEDULE_SOURCE_KEY,
    notes:
      '"Cost per $1,000 of construction cost — $5 per $1,000; $50 minimum". The row never prints the round-up phrase, so it prorates: $12,001 of cost is $60.01, asserted in the content test beside the commercial sheet\'s round-up, and the $50 floor binds at $10,000 and below. The reading is the sheet\'s own wording against the commercial sheet\'s "or portion thereof", asserted from both sides.',
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-COM-PERMIT",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: BUFFALO_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BUFFALO_COMMERCIAL_SCHEDULE_SOURCE_KEY,
    notes:
      '"New construction, additions, change of use, or alterations — $8 per $1,000 of cost; $100 minimum", with the round-up from the sheet\'s own examples ("$8.00 per $1,000. of mean construction cost or portion thereof") and the repairs paragraph directing contract amount into the same basis. Example 1 reproduces $29,936.00 on $3,741,600 exactly; demolition rows are excluded so the sheet\'s separate demolition section answers instead.',
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-COM-PLAN-REVIEW",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: BUFFALO_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BUFFALO_COMMERCIAL_SCHEDULE_SOURCE_KEY,
    notes:
      '"Plan Review Fee (if work requires plans) $0.75 per $1,000 of mean construction cost or portion thereof; $75 minimum" — the round-up phrase printed on the line itself, so the cost is charged in whole $1,000s before multiplying: Example 1\'s $3,741,600 is charged as $3,742,000 for $2,806.50. The $75 floor binds below $100,000 of mean cost.',
  },
  {
    entityType: "fee_rule",
    entityKey: "ELEC-AREA-PERMIT-INSPECTION",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: BUFFALO_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BUFFALO_ELECTRICAL_SOURCE_KEY,
    notes:
      'Schedule A: "permit & inspection fee $50 or $0.0275 x SF x multiplier (whichever is greater)" — one line the schedule charges as one. The $50 is the rule\'s floor, the 2.75-cents constant its rateMultiplier, Schedule B its keyed table; each occupancy\'s exact product is asserted in the tests (5,000 sq. ft. of R-2 is $176.00), and Schedule B\'s blank I-2, I-3 and I-4 rows carry no rate at all.',
  },
  {
    entityType: "fee_rule",
    entityKey: "ELEC-FLAT-ONE-FAMILY",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: BUFFALO_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BUFFALO_ELECTRICAL_SOURCE_KEY,
    notes:
      '"$50 — For any new electrical work at a one-family dwelling or at one (1) apartment of a two-family dwelling, including Service, Lights/receptacles, Equipment, Low Voltage applications", one of the flat schedule\'s "one of the following" after the $50 application. Gated on its own job fact beside the four sibling rows so exactly one answers, asserted like Albuquerque\'s disjoint columns, and never with Schedule A\'s rows: "only when NO drawings or plans are required".',
  },
  {
    entityType: "fee_rule",
    entityKey: "PLUMB-FIXTURES-COMMERCIAL",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "manual_review",
    verifiedAt: BUFFALO_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BUFFALO_PLUMBING_SOURCE_KEY,
    notes:
      '"Commercial / Other (Not one or two family homes): First Fixture $50.00, Each Additional Fixture $20.00 per fixture" — a base of $50 with the first fixture inside it and $20 after, so four fixtures are $110.00 against the residential row\'s $48.00 for the same four. The split is the same construction-class fact the building sheets use.',
  },
  {
    entityType: "fee_rule",
    entityKey: "PLUMB-UG-PIPE-6IN-AND-UNDER",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "manual_review",
    verifiedAt: BUFFALO_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BUFFALO_PLUMBING_SOURCE_KEY,
    notes:
      '"Piping 6 inches in diameter or under: $20.00 per additional 100 linear feet" — priced in whole 100-foot segments beyond the flat $60.00 first line, the per-foot rate being the segment price divided out (20 cents a foot), with the size flag splitting to the $55.00 over-6-inch row. The engine\'s linear_feet kind was added for this row; 250 feet is two segments, asserted in the tests.',
  },
  {
    entityType: "permit_page",
    entityKey: "building-permit-cost",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: BUFFALO_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BUFFALO_COMMERCIAL_SCHEDULE_SOURCE_KEY,
    notes:
      "Gate-checked 2026-09-25: both sheets read in full — the residential bands, cost row and flat fees, the commercial $0.75/$8 rows with their round-up, the certificate prices named rather than charged — and the sheet's own Example 1 reproduced by the page's worked example at $32,792.50.",
  },
  {
    entityType: "permit_page",
    entityKey: "electrical-permit-cost",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: BUFFALO_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BUFFALO_ELECTRICAL_SOURCE_KEY,
    notes:
      "Gate-checked 2026-09-25: both regimes transcribed from the Department's schedule — the five flat rows with the application-plus-one structure, Schedule A's floors and constants, Schedule B's thirteen multiplier rows — with the three blank occupancies stated as a gap on the page rather than filled in.",
  },
  {
    entityType: "permit_page",
    entityKey: "plumbing-permit-cost",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "manual_review",
    verifiedAt: BUFFALO_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BUFFALO_PLUMBING_SOURCE_KEY,
    notes:
      "Gate-checked 2026-09-25 against the Department's price-list page: the five lines of its own total, the two fixture rows split by construction class, the underground segments, and the sentence that keeps the declared valuation out of every fee — \"used for record-keeping purposes and does not replace the required permit fees\".",
  },
  {
    entityType: "jurisdiction_profile",
    entityKey: BUFFALO_KEYS.jurisdiction,
    status: "verified",
    method: "manual_review",
    verifiedAt: BUFFALO_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BUFFALO_FEE_HUB_SOURCE_KEY,
    notes:
      "The profile states the three readings the model depends on — the two sheets are separate schedules split by construction class, the commercial rows round up where the residential row prorates, and plumbing prices counts rather than costs — and keeps both document facts a reader would otherwise trip on: the hub's stale 2014 date against its own 2025 PDFs, and the City Code's 403 that put the Department's sheets in the sources' place.",
  },
];

export const buffaloSeed: JurisdictionSeed = {
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
export const BUFFALO_PUBLISHED_PERMIT_PAGES = buffaloSeed.permitPages.filter(
  (page) => page.publishStatus === "published" && !page.noindex,
);
