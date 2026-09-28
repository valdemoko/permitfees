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
  TULSA_CH1_SOURCE_KEY,
  TULSA_CH3_SOURCE_KEY,
  TULSA_CH4_SOURCE_KEY,
  TULSA_CH8_SOURCE_KEY,
  TULSA_BUILDING_RULES,
  TULSA_ELECTRICAL_RULES,
  TULSA_ORD_25351_DATE,
  TULSA_ORD_25794_DATE,
  TULSA_ORD_25794_SOURCE_KEY,
  TULSA_PLANS_PAGE_SOURCE_KEY,
  TULSA_PLUMBING_RULES,
  tulsaChapterOneStack,
} from "./fee-rules";

export * from "./fee-rules";

/**
 * The complete Tulsa, Oklahoma seed payload.
 *
 * Every figure traces to research/oklahoma/tulsa.md, which traces to Title 49
 * of the Tulsa Revised Ordinances read through the codifier on 2026-09-26 —
 * section by section, after the City's own link to the title turned out to be
 * stale — beside the City Clerk's packet for Ordinance 25794 (staff memo plus
 * the adopted text, the FY2027 adjustment "to meet cost of service, inflation
 * and other necessary adjustments").
 *
 * The shape this jurisdiction is known by: Chapter 1 is a stack applied to
 * every permit in the title (state $4.00 + City $0.50 + $5.50 and 8% + $5.00
 * processing + a global $80 floor), § 302's bands round "to the closest One
 * Thousand Dollars" — the schedule that made this engine add
 * `incrementRounding: "nearest"` — and the over-$150,000 band is charged as
 * B's ceiling ($927.00) plus $3.09 per closest thousand of the excess, with
 * the full-valuation reading kept on the page under a needs_review
 * verification. § 301's application fee is credited and never summed, and a
 * storm shelter pays its flat plus Section 100 and nothing else.
 *
 * Three pages, all published. The worked examples reproduce cent for cent:
 * building $1,349.88 ($250,000 valuation through the stack), electrical
 * $456.72 (8,000 sq ft residential new construction, no service stated),
 * plumbing $80.00 (a single water heater, floored by § 107).
 */

const RESEARCHER = "Permit Fee Intelligence research pass 15 (Oklahoma)";

export const TULSA_LAST_VERIFIED = "2026-09-26";

export const TULSA_KEYS = {
  state: "ok",
  county: "tulsa-county",
  jurisdiction: "tulsa",
  adminSchedule: "tulsa-t49-ch1-admin-fees",
  buildingSchedule: "tulsa-t49-ch3-building-fees",
  electricalSchedule: "tulsa-t49-ch4-electrical-fees",
  plumbingSchedule: "tulsa-t49-ch8-plumbing-fees",
} as const;

const state: SeedState = {
  code: "OK",
  slug: "oklahoma",
  name: "Oklahoma",
  fipsCode: "40",
};

const county: SeedCounty = {
  key: TULSA_KEYS.county,
  slug: "tulsa-county",
  name: "Tulsa County",
  fipsCode: "40143",
};

const jurisdiction: SeedJurisdiction = {
  key: TULSA_KEYS.jurisdiction,
  stateKey: TULSA_KEYS.state,
  countyKey: TULSA_KEYS.county,
  type: "city",
  slug: "tulsa",
  name: "Tulsa",
  officialName: "City of Tulsa",
  websiteUrl: "https://www.cityoftulsa.org/",
  permitPortalUrl: "https://tulsaok-energovweb.tylerhost.net/apps/selfservice",
  timezone: "America/Chicago",
  isActive: true,
};

const departments: SeedDepartment[] = [
  {
    key: "tulsa-development-services",
    jurisdictionKey: TULSA_KEYS.jurisdiction,
    kind: "building",
    name: "City of Tulsa — Development Services (Permit Center)",
    phone: "(918) 596-9456",
    email: "COTDevSvcs@cityoftulsa.org",
    url: "https://www.cityoftulsa.org/government/departments/development-services/contact-us/",
    addressLine: null,
    hours: null,
    notes:
      "The City's Development Services contact list, read 2026-09-26: Permitting Main Office (918) 596-9456; Trade Permits and Trade Licenses (918) 596-9656 with tradepermits@cityoftulsa.org; building permit and license questions bldgandlic@cityoftulsa.org; Director Michael Skates (918) 596-1865; Permitting Manager Danette Williams (918) 596-9603. Inspections run through Bob Kolibas (918) 596-1612 with trade supervisors for building, plumbing, mechanical and electrical. General questions: COTDevSvcs@cityoftulsa.org. The printed address in the page footer is 175 East 2nd Street, Suite 690, Tulsa, OK 74103 — recorded as the page's own footer rather than asserted as the counter's address.",
  },
];

const sources: SeedSource[] = [
  {
    key: TULSA_CH1_SOURCE_KEY,
    jurisdictionKey: TULSA_KEYS.jurisdiction,
    title: "Tulsa Revised Ordinances, Title 49, Chapter 1 — General Administrative Fees",
    url: "https://library.municode.com/ok/tulsa/codes/code_of_ordinances?nodeId=COOR_TIT49ADPELIFE_CH1GEADFE",
    sourceType: "municipal_code",
    issuingAuthority: "City of Tulsa",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2024-07-17",
    effectiveFrom: TULSA_ORD_25351_DATE,
    retrievedAt: TULSA_LAST_VERIFIED,
    lastVerifiedAt: TULSA_LAST_VERIFIED,
    notes:
      "Read 2026-09-26 through the codifier (an SPA; the City's own link to Title 49, nodeId=CD_ORD_TIT49ADPELIFE, 404s — the live ids are the COOR_TIT49… ones, recorded so the next pass does not spend the hour this one did). § 102 applies the chapter's fees to every permit in the title unless a chapter says otherwise, and each trade chapter repeats the instruction. § 100's two state lines ($4.00 to the OUBCC, $0.50 retained by the City), § 103's $5.00 processing surcharge, § 107's global $80 floor and § 117's \"$5.50 plus eight percent of the … permit fee\" were read in full, along with the event rows named on the pages: § 105's penalty for work started without a permit, § 106 resubmission, § 108 additional inspection (amended by Ord. 25794), § 109 reinspection, § 110 recall, § 111 records, § 114 appeal and § 116's governmental waiver.",
  },
  {
    key: TULSA_CH3_SOURCE_KEY,
    jurisdictionKey: TULSA_KEYS.jurisdiction,
    title: "Tulsa Revised Ordinances, Title 49, Chapter 3 — Building Permit Fees",
    url: "https://library.municode.com/ok/tulsa/codes/code_of_ordinances?nodeId=COOR_TIT49ADPELIFE_CH3BUPEFE",
    sourceType: "municipal_code",
    issuingAuthority: "City of Tulsa",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2026-05-13",
    effectiveFrom: TULSA_ORD_25794_DATE,
    retrievedAt: TULSA_LAST_VERIFIED,
    lastVerifiedAt: TULSA_LAST_VERIFIED,
    notes:
      "Read 2026-09-26 through the codifier, with §§ 301–302 double-checked word for word against the City Clerk's packet for Ordinance 25794 (adopted 5-13-26 with an emergency clause). § 302's four bands and its \"calculated in One Thousand Dollar increments to the closest One Thousand Dollars\" rounding; § 301's credited application fee; § 304's carport flat; § 306's storm-shelter carve-out with its own exclusivity sentence; § 314's demolition flat. The recorded-not-charged rows: § 303's certificate-of-occupancy and zoning-clearance table, § 305's expediting trio (the $121 professional-home-builder row from Ord. 25572), §§ 307–313's fire regime, § 315 tents, § 316 special assembly, § 317's sign table, § 318 temporary residential use, §§ 319–323 building moves, § 327 registration.",
  },
  {
    key: TULSA_CH4_SOURCE_KEY,
    jurisdictionKey: TULSA_KEYS.jurisdiction,
    title: "Tulsa Revised Ordinances, Title 49, Chapter 4 — Electrical Permit Fees",
    url: "https://library.municode.com/ok/tulsa/codes/code_of_ordinances?nodeId=COOR_TIT49ADPELIFE_CH4ELPEFE",
    sourceType: "municipal_code",
    issuingAuthority: "City of Tulsa",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2024-07-17",
    effectiveFrom: TULSA_ORD_25351_DATE,
    retrievedAt: TULSA_LAST_VERIFIED,
    lastVerifiedAt: TULSA_LAST_VERIFIED,
    notes:
      "Read 2026-09-26 through the codifier, section header to section header: § 401's three residential bands, § 402's two six-band commercial tables with the 50%-remodel note under (B), § 403's low-density table, and § 404's catch-all with the service fee every covered regime says its total includes — plus § 405's $178 contractor registration (licensing). The history of every section is Ord. 24664 (8-25-21) then Ord. 25351 (7-17-24).",
  },
  {
    key: TULSA_CH8_SOURCE_KEY,
    jurisdictionKey: TULSA_KEYS.jurisdiction,
    title: "Tulsa Revised Ordinances, Title 49, Chapter 8 — Plumbing Permit Fees",
    url: "https://library.municode.com/ok/tulsa/codes/code_of_ordinances?nodeId=COOR_TIT49ADPELIFE_CH8PLPEFE",
    sourceType: "municipal_code",
    issuingAuthority: "City of Tulsa",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2024-07-17",
    effectiveFrom: TULSA_ORD_25351_DATE,
    retrievedAt: TULSA_LAST_VERIFIED,
    lastVerifiedAt: TULSA_LAST_VERIFIED,
    notes:
      "Read 2026-09-26 through the codifier. § 801's six-row price list — gas piping per meter, backflow assembly, interceptor/separator, water heater, water service, fixtures base plus each additional — and the one figure this title cannot read: \"Plus, per opening .....$2.6887.00\", two decimal points in one amount, present in the codified text exactly as the City's 2021 Title 49 printing had it (that PDF is image-only and could not be OCR'd here; Google's index confirms the same wording in 2021). § 802's outside-city travel fee and § 803's registration are named.",
  },
  {
    key: TULSA_ORD_25794_SOURCE_KEY,
    jurisdictionKey: TULSA_KEYS.jurisdiction,
    title: "Ordinance No. 25794 — City Clerk's packet (staff memo + adopted text), adopted 5-13-26",
    url: "https://www.cityoftulsa.org/apps/COTDisplayDocument?DocumentType=CouncilDocument&DocumentIdentifiers=6369",
    sourceType: "ordinance",
    issuingAuthority: "City of Tulsa City Council",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2026-05-13",
    effectiveFrom: TULSA_ORD_25794_DATE,
    retrievedAt: TULSA_LAST_VERIFIED,
    lastVerifiedAt: TULSA_LAST_VERIFIED,
    notes:
      "The 14-page scanned packet the City Clerk filed for the May 13, 2026 council meeting, located through the Granicus agenda and read with pdftotext — Municode does not host ordinance full text for this organization (\"This organization does not use MuniDocs\"). The staff memo gives the reason for the amendment: \"As part of the FY2027 budget these are adjusted to meet cost of service, inflation and other necessary adjustments\", adopted with an emergency clause to coincide with the 2027 budget approval. The recitals of §§ 301–302 in the packet match the codified text word for word — this is the document the FY2027 figures were double-checked against.",
  },
  {
    key: TULSA_PLANS_PAGE_SOURCE_KEY,
    jurisdictionKey: TULSA_KEYS.jurisdiction,
    title: "City of Tulsa — Plans Review (Development Services): process, adopted codes and fees link",
    url: "https://www.cityoftulsa.org/government/departments/development-services/plans-review/",
    sourceType: "municipal_website",
    issuingAuthority: "City of Tulsa Development Services",
    authorityKind: "city",
    isPrimary: false,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: TULSA_LAST_VERIFIED,
    lastVerifiedAt: TULSA_LAST_VERIFIED,
    notes:
      "Read 2026-09-26. The City's process page — what gets reviewed, which codes are adopted, and its \"building and development fees\" anchor into Title 49. That anchor is stale: nodeId=CD_ORD_TIT49ADPELIFE returns \"Content Not Found\" in Municode, and the page still publishes it. Recorded here with the live node ids so the next pass starts where this one ended. This source publishes no fee figures of its own, which is why it is not marked primary.",
  },
];

/** Empty on purpose: the permit types Tulsa uses already exist as shared rows. */
const permitTypes: JurisdictionSeed["permitTypes"] = [];
const projectTypes: JurisdictionSeed["projectTypes"] = [];

const jurisdictionPermitTypes: SeedJurisdictionPermitType[] = [
  {
    jurisdictionKey: TULSA_KEYS.jurisdiction,
    permitTypeKey: "building",
    isAvailable: true,
    localName: "Building permit — four valuation bands on \"closest thousand\" rounding, plus the Chapter 1 stack",
    officialUrl:
      "https://www.cityoftulsa.org/government/departments/development-services/plans-review/",
    notes:
      "§ 302 is the whole fee: $137 up to $5,000, $219 to $40,000, $6.18 per closest thousand to $150,000, then $3.09 per closest thousand above — with § 301's application fee credited against it (never summed, because § 302 exceeds § 301 at every valuation) and § 306's storm shelters standing entirely outside the stack but Section 100. The Chapter 1 stack rides every permit: $4.50 to the state, $5.50 + 8%, $5.00 processing, $80 floor.",
  },
  {
    jurisdictionKey: TULSA_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    isAvailable: true,
    localName: "Electrical permit — three six-band area tables plus the § 404 catch-all and service fee",
    officialUrl:
      "https://www.cityoftulsa.org/government/departments/development-services/plans-review/",
    notes:
      "§ 401 prices residential one-/two-family new construction and additions ($230/$293 bands, $58 per additional 1,000 sq ft, prorated); § 402 prices commercial new construction and additions/major remodels through two six-band tables with a $64-per-5,000 continuation; § 403 shadows 402 for low-density projects; § 404 is the catch-all the chapter points to — and the home of the electric service fee ($98 first 100 amps + $18 each additional or portion) that every covered regime says its total includes. The Chapter 1 stack rides on top.",
  },
  {
    jurisdictionKey: TULSA_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    isAvailable: true,
    localName: "Plumbing permit — six count-based rows, floored by the stack's $80 minimum",
    officialUrl:
      "https://www.cityoftulsa.org/government/departments/development-services/plans-review/",
    notes:
      "§ 801 prices six rows, every one a count: gas piping $41 per meter, backflow assembly $79, interceptor $150, water heater $35, water service $35, fixtures $81 including the first plus $3.31 each additional. No valuation is read. The section's garbled \"per opening $2.6887.00\" line is quoted on the page and charged nowhere. The Chapter 1 stack — including the $80 floor — rides on top, which is why a single water-heater permit costs $80.",
  },
];

const feeSchedules: SeedFeeSchedule[] = [
  {
    key: TULSA_KEYS.adminSchedule,
    jurisdictionKey: TULSA_KEYS.jurisdiction,
    sourceKey: TULSA_CH1_SOURCE_KEY,
    title: "TRO Title 49, Chapter 1 — General Administrative Fees (the stack)",
    officialUrl:
      "https://library.municode.com/ok/tulsa/codes/code_of_ordinances?nodeId=COOR_TIT49ADPELIFE_CH1GEADFE",
    effectiveFrom: TULSA_ORD_25351_DATE,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: TULSA_LAST_VERIFIED,
    notes:
      "Five lines on every permit in the title: § 100.A's $4.00 state collection, § 100.D's $0.50 City retention, § 117's $5.50 + 8% of the permit fee, § 103's $5.00 processing surcharge and § 107's $80 floor — attached to all three pages because the chapters each say Chapter 1 applies.",
  },
  {
    key: TULSA_KEYS.buildingSchedule,
    jurisdictionKey: TULSA_KEYS.jurisdiction,
    sourceKey: TULSA_CH3_SOURCE_KEY,
    title: "TRO Title 49, Chapter 3 — Building Permit Fees",
    officialUrl:
      "https://library.municode.com/ok/tulsa/codes/code_of_ordinances?nodeId=COOR_TIT49ADPELIFE_CH3BUPEFE",
    effectiveFrom: TULSA_ORD_25794_DATE,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: TULSA_LAST_VERIFIED,
    notes:
      "FY2027 figures from Ord. 25794 for §§ 301–302; Ord. 25351 for the demolition, carport and storm-shelter rows. The four bands, the closest-thousand rounding and § 306's exclusivity sentence are what the building rules carry.",
  },
  {
    key: TULSA_KEYS.electricalSchedule,
    jurisdictionKey: TULSA_KEYS.jurisdiction,
    sourceKey: TULSA_CH4_SOURCE_KEY,
    title: "TRO Title 49, Chapter 4 — Electrical Permit Fees",
    officialUrl:
      "https://library.municode.com/ok/tulsa/codes/code_of_ordinances?nodeId=COOR_TIT49ADPELIFE_CH4ELPEFE",
    effectiveFrom: TULSA_ORD_25351_DATE,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: TULSA_LAST_VERIFIED,
    notes:
      "Three six-band tables plus their identical $64-per-5,000 continuations, the § 404.A service fee, and the eight catch-all rows — all Ord. 25351 (7-17-24), which rewrote the title.",
  },
  {
    key: TULSA_KEYS.plumbingSchedule,
    jurisdictionKey: TULSA_KEYS.jurisdiction,
    sourceKey: TULSA_CH8_SOURCE_KEY,
    title: "TRO Title 49, Chapter 8 — Plumbing Permit Fees",
    officialUrl:
      "https://library.municode.com/ok/tulsa/codes/code_of_ordinances?nodeId=COOR_TIT49ADPELIFE_CH8PLPEFE",
    effectiveFrom: TULSA_ORD_25351_DATE,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: TULSA_LAST_VERIFIED,
    notes:
      "§ 801's six count-based rows, Ord. 25351. The garbled per-opening figure is quoted on the pages and charged nowhere.",
  },
];

function attach(
  permitTypeKey: string,
  rules: SeedFeeRule["rule"][],
  scheduleKey: string,
): SeedFeeRule[] {
  return rules.map((rule) => ({
    jurisdictionKey: TULSA_KEYS.jurisdiction,
    permitTypeKey,
    scheduleKey,
    rule,
  }));
}

const feeRules: SeedFeeRule[] = [
  ...attach("building", tulsaChapterOneStack("tul-bld"), TULSA_KEYS.adminSchedule),
  ...attach("building", TULSA_BUILDING_RULES, TULSA_KEYS.buildingSchedule),
  ...attach("electrical", tulsaChapterOneStack("tul-elec"), TULSA_KEYS.adminSchedule),
  ...attach("electrical", TULSA_ELECTRICAL_RULES, TULSA_KEYS.electricalSchedule),
  ...attach("plumbing", tulsaChapterOneStack("tul-pl"), TULSA_KEYS.adminSchedule),
  ...attach("plumbing", TULSA_PLUMBING_RULES, TULSA_KEYS.plumbingSchedule),
];

const requirements: SeedRequirement[] = [
  {
    jurisdictionKey: TULSA_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "document",
    title: "The application fee is paid first and credited against the permit fee",
    description:
      "§ 301 prices the application by declared valuation ($66 up to $15,000, $101.50 to $100,000, $1.00 per $1,000 above), and § 302.A then says the permit fee \"shall be decreased by the amount of any previously paid building permit application fee\". Because § 302's figure exceeds § 301's at every valuation (checked band by band: $137 > $66, $219 > $101.50, $6.18/k > $1.00/k), the credit never changes the total — a prepayment, Pittsburgh's precedent, named on the page and summed nowhere. § 118's own words agree: application fee first, \"upon approval … advised of what remaining fees are due\".",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: TULSA_CH3_SOURCE_KEY,
    lastVerifiedAt: TULSA_LAST_VERIFIED,
  },
  {
    jurisdictionKey: TULSA_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "Every rate band rounds to the closest thousand dollars",
    description:
      "\"All fees calculated in One Thousand Dollar ($1,000.00) increments to the closest One Thousand Dollars\" (§ 302) — the schedule's own rounding, and the reason this jurisdiction's rules carry `incrementRounding: \"nearest\"` rather than the round-up every other schedule in the dataset prints. $40,499 buys forty steps of $6.18, not forty-one; ties round half up. Google's index of the City's own 2021 Title 49 PDF shows the same phrase five years before the FY2027 adjustment, so it is not a 2026 typo.",
    isMandatory: true,
    sortOrder: 20,
    sourceKey: TULSA_CH3_SOURCE_KEY,
    lastVerifiedAt: TULSA_LAST_VERIFIED,
  },
  {
    jurisdictionKey: TULSA_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "A storm-shelter permit is a flat fee plus Section 100, and nothing else",
    description:
      "§ 306's own words: \"Storm shelter permit fee shall be a flat fee with no other administrative, zoning, or watershed fees applicable with the exception of Section 100\". So the shelter flat ($88 indoor, $132 outdoor) charges with the state's $4.50 — and the § 302 bands, § 117's 8%, § 103's $5.00 and the $80 floor all stand down while custom.storm_shelter_indoor or _outdoor is set.",
    isMandatory: true,
    sortOrder: 30,
    sourceKey: TULSA_CH3_SOURCE_KEY,
    lastVerifiedAt: TULSA_LAST_VERIFIED,
  },
  {
    jurisdictionKey: TULSA_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "Chapter 1 stacks on top of every permit in the title",
    description:
      "§ 102: the chapter's fees \"are applied to each permit, license, certificate, and registration governed by this Title 49, unless specifically provided otherwise in any individual chapters\", and Chapters 3, 4 and 8 each repeat the instruction. The five lines: $4.00 to the OUBCC and $0.50 retained by the City (both § 100), $5.50 plus 8% of the permit fee (§ 117, \"in addition to any … minimum fee\"), $5.00 processing (§ 103), and the $80 floor (§ 107, \"shall apply to any permit\"). § 116 waives fees for governmental entities on written request — a waiver with its own process, named rather than modelled.",
    isMandatory: true,
    sortOrder: 40,
    sourceKey: TULSA_CH1_SOURCE_KEY,
    lastVerifiedAt: TULSA_LAST_VERIFIED,
  },
  {
    jurisdictionKey: TULSA_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "other",
    title: "The electric service fee is inside every covered total — and required only when a service is involved",
    description:
      "§ 401 and § 402.A both define the permit as \"a total of the electric service fee, as determined in Subsection 404.A … plus a base fee\", so the $98/first-100-amps + $18/each-additional line rides on residential and commercial new construction whenever the filing states an amperage. § 402.B and § 403 print \"(when required)\" — their totals include it only when the job involves a service, which is the custom.electrical_service fact. A filing with no amperage is charged no service line rather than a guessed service size.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: TULSA_CH4_SOURCE_KEY,
    lastVerifiedAt: TULSA_LAST_VERIFIED,
  },
  {
    jurisdictionKey: TULSA_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "other",
    title: "A remodel under half the space is not a § 402(B) remodel",
    description:
      "The note under § 402.B: \"On remodel projects having less than fifty percent (50%) of the space in the area involved, the fees shall be as provided in Section 404 of this chapter.\" The commercial additions-and-major-remodels table therefore answers only for the ≥50% job — custom.major_remodel is the fact that marks it — and a smaller remodel falls to the catch-all's flat rows. § 403 (parking garages, shell buildings, warehouses) shadows the commercial tables the other way: while custom.low_density_project is set, § 402 stands down.",
    isMandatory: true,
    sortOrder: 20,
    sourceKey: TULSA_CH4_SOURCE_KEY,
    lastVerifiedAt: TULSA_LAST_VERIFIED,
  },
  {
    jurisdictionKey: TULSA_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    requirementType: "other",
    title: "One figure in this title cannot be read, and is not charged",
    description:
      "§ 801.A's second line reads \"Plus, per opening .....$2.6887.00\" — two decimal points in one amount, in the codified text exactly as the 2021 Title 49 printing had it. It is quoted verbatim on this site's pages and charged nowhere: $2.68, $87.00 and $2.6887 are all defensible splits of the same characters, and the schedule offers no arithmetic to check them against. A figure that cannot be read is named, never guessed — the same call Toledo's garbled row required.",
    isMandatory: false,
    sortOrder: 10,
    sourceKey: TULSA_CH8_SOURCE_KEY,
    lastVerifiedAt: TULSA_LAST_VERIFIED,
  },
];

const profile: SeedProfile = {
  jurisdictionKey: TULSA_KEYS.jurisdiction,
  headline: "What construction permits cost in Tulsa",
  summary:
    "Tulsa prices construction out of **one fee title read as a stack**: the trade schedule names the permit fee (four valuation bands on a *closest-thousand* rounding, three six-band electrical tables, six plumbing rows), and Chapter 1 then adds five lines the trade chapters never mention — $4.50 to the state, $5.50 plus 8% of the fee, $5.00 processing, and a global $80 floor. A $250,000 building permit is $1,236.00 of § 302 and $134.88 of stack: $1,349.88 total.",
  localContext:
    "Title 49 is Tulsa's whole fee title — eighteen chapters from general administrative fees to animal services — and Ordinance 25351 (July 17, 2024) rewrote almost all of it. Ordinance 25794, adopted May 13, 2026 with an emergency clause, then adjusted the sections this site prices: the staff memo says why — \"As part of the FY2027 budget these are adjusted to meet cost of service, inflation and other necessary adjustments\" — and the figures below are the FY2027 column, in force since that date. The City Clerk's own packet (staff memo plus adopted text) was read beside the codified text, and the two match word for word.\n\nTwo readings decide how this site computes Tulsa. First, § 302's rounding: every rate band is \"calculated in One Thousand Dollar ($1,000.00) increments to the closest One Thousand Dollars\" — a nearest rounding, not the \"or fraction thereof\" round-up the rest of this dataset prints, and not a 2026 transcription error: Google's index of the City's own 2021 Title 49 PDF carries the same phrase. Second, the over-$150,000 band: the text states only an *additional* fee ($3.09 per closest thousand of the excess), and § 302.B caps itself at $150,000 — so the base it must be additional to is B's own ceiling, $6.18 × 150 = $927.00, charged here. The alternative reading (B's rate continuing on the full valuation with the excess stacked on it) is quoted on this site under a needs_review verification, because Tulsa publishes no worked example that settles it.\n\nWhat is *not* in a Tulsa total is as instructive as what is. § 301's application fee is credited against § 302 and never summed — § 302 exceeds it at every valuation, checked band by band. The certificate-of-occupancy and zoning-clearance table, the expediting trio, the fire regime's sprinkler-head and alarm-device tables, the sign table and the tent rows are separate permits and certificates, not lines of a building permit. And § 105's penalty for work started without a permit — $214.00 or three times the regular fee, whichever is greater — cannot be modelled as a line on top of a fee this engine computes, so it is named instead.",
  valuationBasis:
    "The building bands read an estimated valuation, and § 301 tells you whose estimate rules: the applicant *declares* it with the application fee, and § 302 then prices the permit on that same figure. The declaration is the input — there is no separate departmental re-estimate published in this title.\n\n**What moves a total, and what does not.** Valuation moves the building page alone: four bands, rounded to the closest thousand. Area moves the electrical page — three six-band tables and their continuation rows, all in square feet. Counts move the plumbing page: meters, backflow assemblies, interceptors, heaters, water service connections and fixtures, with the first fixture inside its $81 base. None of the three cross over: a plumbing total never changes because the job got more expensive, and an electrical total never changes because the land got pricier.\n\n**The stack reads the fee, not the project.** § 117's 8% is a percentage of the chapter's permit fee — evaluated while the subtotal is still just that fee, before the state and maintenance lines exist — and § 107's $80 floor reads everything, because it is charged last.",
  notIncluded:
    "These figures are Tulsa's own permit and administrative fees for building, electrical and plumbing work. They are not a project cost, and they exclude:\n\n- **§ 301's application fee as a separate charge.** It is paid first and credited against the permit fee; because § 302 exceeds it at every valuation, summing it would overstate every total on this site.\n- **Certificates, clearances and the fire regime.** § 303's certificate-of-occupancy and zoning-clearance table, § 307–§ 313's sprinkler-head and fire-alarm-device bands (up to $781 and $1,550, then per head/device over 750) price their own permits, not lines of a building permit.\n- **The expediting trio and event rows.** § 305's $121/$500/$500 expedites, § 105's penalty for unpermitted work ($214 or 3× the fee), § 106 resubmission, § 108 additional inspection, § 109 reinspection, § 110 recall by the hour, § 111 records, § 114 appeal — each attaches to an event this calculator does not model.\n- **The garbled per-opening figure.** § 801.A's \"Plus, per opening .....$2.6887.00\" has two decimal points in one amount, in the codified text as the 2021 printing had it; it is quoted on the pages and charged nowhere.\n- **\"Each additional\" counts on § 404's equipment rows.** Generators beyond the first, HVAC units, motors, transformers, elevators and equipment beyond 25 are published at $11.89/$2.68 each — counts the inputs do not carry, recorded beside the first-unit figures rather than priced.\n- **Registrations and travel.** § 327/§ 405/§ 803's $178 registrations and § 802's outside-city travel fee are licensing and event rows.\n- **Uncodified Ord. 25849 (8-5-26).** It amends Title 49 Chapter 18 — animal services only, no effect on these pages.",
  seoTitle: "Tulsa construction permit fees",
  seoDescription:
    "How Tulsa prices construction permits — § 302's four bands on closest-thousand rounding ($137/$219/$6.18 per $1,000/$3.09 above $150k), six-band electrical tables, six plumbing rows, and the Chapter 1 stack ($4.50 + 8% + $5 + $80 floor).",
  publishStatus: "published",
  noindex: false,
  lastReviewedAt: TULSA_LAST_VERIFIED,
};

const permitPages: SeedPermitPage[] = [
  {
    jurisdictionKey: TULSA_KEYS.jurisdiction,
    permitTypeKey: "building",
    slug: "building-permit-cost",
    title: "Tulsa building permit cost",
    intro:
      "A Tulsa building permit is **§ 302's four valuation bands, plus Chapter 1's stack**. Up to $5,000 the fee is $137.00; from $5,000.01 to $40,000 it is $219.00; from $40,000.01 to $150,000 it is $6.18 for each $1,000 of valuation **rounded to the closest thousand**; above $150,000 it is $927.00 plus $3.09 for each $1,000 above $150,000, again to the closest thousand. Then every permit adds the stack: $4.00 to the state's Uniform Building Code Commission, $0.50 retained by the City, $5.50 plus 8% of the permit fee, $5.00 processing — and an $80 floor under the whole bill. The application fee (§ 301) is paid first and credited against all of it.",
    localSummary:
      "The rounding is the reading people miss: every rate band is \"calculated in One Thousand Dollar increments to the closest One Thousand Dollars\", so $40,499 buys forty steps of $6.18 — $247.20 — not forty-one, and ties round half up. This is a real nearest rounding, not the \"or fraction thereof\" round-up every other schedule in this dataset prints, and Google's index of the City's own 2021 Title 49 PDF shows the same wording five years before the FY2027 adjustment.\n\nThe over-$150,000 band states only an *additional* fee, and § 302.B caps itself at $150,000 — so the base that addition must come off is B's own ceiling, $6.18 × 150 = $927.00. The seam is continuous: exactly $150,000 pays $927.00, one dollar more pays $927.00 and nothing else. The alternative reading (B's rate on the full valuation plus the excess layer, a $9.27 marginal rate above the seam) is published on this site under a needs_review note, because the City publishes no worked example that settles it.\n\nTwo exclusivity instructions are wired rather than described. § 301's application fee is credited — § 302 exceeds it at every valuation, so it never changes the total, and this site names it instead of summing it. And a storm-shelter permit is \"a flat fee with no other administrative, zoning, or watershed fees applicable with the exception of Section 100\": $88 indoor or $132 outdoor plus the state's $4.50, with the bands, the 8%, the $5 processing line and the $80 floor all standing down.",
    notIncluded:
      "This is Tulsa's building permit fee — the § 302 band that answers the valuation, the Chapter 1 stack on top of it, and the flat rows the job's facts select. It excludes:\n\n- **§ 301's application fee as an addition.** It is paid first and credited against the permit fee; because § 302 exceeds it at every valuation, it never changes the total this page shows.\n- **Certificates and clearances.** § 303's certificate-of-occupancy and zoning-clearance fees are separate certificates, not lines of a building permit — and § 306's carve-out says so outright for shelters.\n- **The fire regime, signs, tents and assembly.** § 307–§ 313's sprinkler-head and alarm-device tables, § 315's tents, § 316's special assembly and § 317's sign table price their own permits.\n- **Expediting and event rows.** § 305's $121/$500/$500 expedites, § 105's unpermitted-work penalty ($214 or 3× the fee, whichever is greater), resubmission, reinspection, recall and appeal fees attach to events.\n- **Building moves and registration.** §§ 319–323 price house moves on their own tables; § 327's $178 is registration.\n- **The application-fee timing this page cannot show.** The credit exists in dollars — this total is what remains after it, which at every valuation is the same figure as before.",
    workedExample: {
      scenario:
        "A new commercial building with a declared valuation of $250,000 — no expediting, no shelter, no application-fee credit yet applied.",
      inputs: {
        valuationCents: 25_000_000,
        occupancy: "commercial",
        workType: "new_construction",
        custom: {},
      },
      notes:
        "The fourth band and the whole stack — $1,349.88.\n\n§ 302's band: $250,000 is over $150,000, so the rule is B's ceiling plus the additional fee. The excess is $100,000; \"to the closest One Thousand Dollars\" makes it 100 steps of $3.09 — $309.00 — and the ceiling is $6.18 × 150 = $927.00. Permit fee: $1,236.00. (At exactly $150,000 the band above pays $6.18 × 150 = $927.00 — the same figure, which is the seam working.)\n\n§ 117: $5.50 plus 8% of the permit fee — 8% of $1,236.00 is $98.88, so $104.38. The percentage reads the chapter's fee and nothing else: the state and maintenance lines have not been added yet when it runs, and the schedule's own words — \"in addition to any … minimum fee\" — keep it outside the floor's arithmetic.\n\n§ 100: $4.00 to the state plus $0.50 retained by the City. § 103: $5.00 processing.\n\n§ 107's floor: the bill so far is $1,236.00 + $104.38 + $4.50 + $5.00 = $1,349.88, far above $80.00, so the shortfall is nothing.\n\nTotal: $1,349.88. What moves it: the same job at $150,000 pays $927.00 + $74.16 + $9.50 = $1,010.66; at $40,000 it pays the $219.00 band with 8% still on top; at $40,499 the closest-thousand rounding keeps it at forty steps ($247.20) rather than forty-one; a $500 repair pays the $137.00 band floored at $80 — irrelevant, the band is already above it; and a $35 job of any other kind on the plumbing page is the one that lands on the floor.",
    },
    faqs: [
      {
        question: "How much is a building permit in Tulsa?",
        answer:
          "Four bands on the estimated valuation: $137.00 up to $5,000; $219.00 from $5,000.01 to $40,000; $6.18 per $1,000 from $40,000.01 to $150,000 (rounded to the closest $1,000); and $927.00 plus $3.09 per $1,000 above $150,000 (also to the closest $1,000). Then the Chapter 1 stack: $4.00 state, $0.50 City, $5.50 + 8% of the permit fee, $5.00 processing, with an $80 minimum on the whole bill.",
        sourceId: TULSA_CH3_SOURCE_KEY,
      },
      {
        question: "How does the \"closest thousand\" rounding work?",
        answer:
          "§ 302 says every rate band is \"calculated in One Thousand Dollar increments to the closest One Thousand Dollars\" — round to the nearest $1,000, ties up. $40,499 rounds to $40,000, so the fee is 40 × $6.18 = $247.20, not 41 × $6.18 = $253.38. It is the opposite of the \"or fraction thereof\" round-up most schedules print.",
        sourceId: TULSA_CH3_SOURCE_KEY,
      },
      {
        question: "Why does the fee become $927 plus a rate above $150,000?",
        answer:
          "Because § 302.B stops at $150,000 — \"Over $40,000.00 to $150,000.00\" — and the fourth band states only an *additional* $3.09 per thousand of \"the estimated valuation above $150,000.00\". The base that addition comes off is therefore B's own ceiling: $6.18 × 150 = $927.00. Exactly $150,000 pays $927.00 from the third band; one dollar more pays $927.00 from the fourth. The alternative reading (a $9.27 marginal rate above the seam) is recorded as an open question on this site, because the City publishes no example that settles it.",
        sourceId: TULSA_CH3_SOURCE_KEY,
      },
      {
        question: "Is the application fee extra?",
        answer:
          "No — it is a prepayment. § 301 prices the application ($66 up to $15,000, $101.50 to $100,000, $1.00 per $1,000 above), and § 302.A then says the permit fee \"shall be decreased by the amount of any previously paid building permit application fee\". § 302's figure exceeds § 301's at every valuation, so the credit never changes the total you owe.",
        sourceId: TULSA_CH3_SOURCE_KEY,
      },
      {
        question: "What is the Chapter 1 stack?",
        answer:
          "Five lines every Tulsa permit carries, from Title 49 Chapter 1: $4.00 collected for the Oklahoma Uniform Building Code Commission (§ 100.A), $0.50 retained by the City (§ 100.D), $5.50 plus 8% of the permit fee (§ 117), $5.00 permit processing (§ 103), and an $80 minimum on the whole bill (§ 107). A storm-shelter permit stands down everything but Section 100, by § 306's own words.",
        sourceId: TULSA_CH1_SOURCE_KEY,
      },
      {
        question: "What does a demolition permit cost?",
        answer:
          "$133.00 flat (§ 314) — priced as its own row rather than as a valuation band, so a demolition does not read a declared cost. The Chapter 1 stack still applies on top, and the sewer plug permit the same section mentions is Chapter 13's.",
        sourceId: TULSA_CH3_SOURCE_KEY,
      },
    ],
    seoTitle: "Tulsa building permit cost: $137–$927 + $3.09 per $1,000",
    seoDescription:
      "Tulsa building permit fees — § 302's four valuation bands with closest-thousand rounding, $927 + $3.09 per $1,000 above $150,000, the Chapter 1 stack ($4.50 + 8% + $5 + $80 floor), and the credited application fee.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: TULSA_LAST_VERIFIED,
  },
  {
    jurisdictionKey: TULSA_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    slug: "electrical-permit-cost",
    title: "Tulsa electrical permit cost",
    intro:
      "A Tulsa electrical permit is **one of three six-band tables plus the service fee, then the stack**. Residential one-/two-family new construction and additions (§ 401) run $230.00 to 2,000 sq ft, $293.00 to 6,000, then $58.00 per each additional 1,000 sq ft. Commercial and industrial new construction (§ 402.A) runs $293.00 to $1,179.00 across six bands to 100,000 sq ft, then $64.00 per each additional 5,000. Additions and major remodels (§ 402.B) have their own six bands ($189–$745); low-density projects (§ 403) a third ($144–$739). Every covered total includes the electric service fee from § 404.A — $98.00 for the first 100 amps plus $18.00 per each additional 100 or portion — and Chapter 1's five stack lines ride on top.",
    localSummary:
      "The service fee is the line readers miss: § 401 and § 402.A define the permit as \"a total of the electric service fee … plus a base fee\", so it rides automatically when the filing states an amperage; § 402.B and § 403 print \"(when required)\", so there it rides only when the job involves a service (the custom.electrical_service fact). No amperage stated means no service line — the engine declines to guess a service size rather than inventing one.\n\nThe three tables are alternatives, selected by the chapter's own scope: § 401 needs a one-/two-family dwelling in new construction or addition; § 402.A is commercial new construction; § 402.B is additions and major remodels — where the note under it is a gate, sending remodels of less than half the space to § 404's catch-all; and § 403 shadows 402 for parking garages, shell buildings and warehouses, which price by land use rather than occupancy (custom.low_density_project). Work that fits none of them is § 404's: pool $235, generator $235, HVAC/transformer/motor/elevator/equipment/reconnect $81 each.\n\nThe continuation rows prorate rather than round: \"Each additional 5,000 sq. ft. — $64.00\" prints no \"or fraction\", so 101,000 sq ft adds one-fifth of a step, $12.80, above the sixth band's ceiling.",
    notIncluded:
      "This is Tulsa's electrical permit fee — the area band that answers the job, the service fee when a service is involved, the catch-all rows, and the Chapter 1 stack. It excludes:\n\n- **\"Each additional\" counts on § 404's rows.** Generators beyond the first, HVAC units, motors, transformers, elevators and equipment beyond 25 carry published $11.89/$2.68 continuations — counts the inputs do not carry, recorded beside the first-unit figures rather than priced.\n- **The § 404.B–I rows the job does not touch.** Each row answers only when its own fact is set and no branch table covers the work.\n- **Registrations.** § 405's $178 electrical contractor certificate is licensing, expiring on the contractor's birth month — not a permit fee.\n- **The service fee when no service is involved.** On § 402.B and § 403 work it is \"(when required)\"; on a filing with no amperage stated, no service line is charged rather than a guessed size.\n- **Event rows in Chapter 1.** The additional-inspection, reinspection, recall and appeal fees attach to events, and § 105's unpermitted-work penalty cannot be modelled as a line on top of a fee this engine computes.\n- **The 50%-remodel question this page answers with a fact.** Under half the space means § 404's flats, not § 402.B's band — custom.major_remodel marks the job the band table prices.",
    workedExample: {
      scenario:
        "A residential new-construction electrical permit on a one- and two-family dwelling: 8,000 square feet, no service change stated (no amperage given).",
      inputs: {
        squareFootage: 8_000,
        occupancy: "residential",
        workType: "new_construction",
        custom: { one_two_family: true },
      },
      notes:
        "The third § 401 band and the whole stack — $456.72.\n\n§ 401's base: 8,000 sq ft is over 6,000, so the rule is the second band's $293.00 plus \"Each additional 1,000 sq. ft. — $58.00\". The line prints no \"or fraction thereof\", so 2,000 additional square feet are exactly two thousands: $116.00. Base: $409.00.\n\nThe service fee: nothing — this filing states no amperage, so § 404.A's $98 + $18-per-100 line has no size to read. The section would charge it if the filing said a service was involved, because § 401's total includes it \"as determined in Subsection 404.A\".\n\n§ 117: $5.50 plus 8% of $409.00 — 8% is $32.72, so $38.22. It reads the chapter's fee only: the state and maintenance lines run after it.\n\n§ 100: $4.00 + $0.50. § 103: $5.00. § 107's floor: $409.00 + $38.22 + $9.50 = $456.72, above $80.00 — no shortfall.\n\nTotal: $456.72. What moves it: 6,000 sq ft exactly lands in the middle band at $293.00 and pays $346.02 with the stack; 12,000 sq ft is $293 + 6 × $58 = $641.00 base; a commercial new-construction version of the same job would read § 402.A's table instead ($344.00 at 8,000 sq ft) — but only after one_two_family stops being true; and stating a 200-amp service would add § 404.A's $98.00 with no amp row above it, since the first 100 amps are inside that base.",
    },
    faqs: [
      {
        question: "How much is an electrical permit in Tulsa?",
        answer:
          "By table. Residential one-/two-family new construction or addition: $230.00 to 2,000 sq ft, $293.00 for 2,001–6,000, then $58.00 per each additional 1,000 sq ft. Commercial new construction: six bands from $293.00 (1–2,500 sq ft) to $1,179.00 (75,001–100,000), then $64.00 per each additional 5,000. Additions and major remodels: $189–$745 across the same bands. Low-density projects: $144–$739. Plus the service fee when a service is involved and the Chapter 1 stack ($4.50 + 8% + $5 + $80 floor).",
        sourceId: TULSA_CH4_SOURCE_KEY,
      },
      {
        question: "Is the electric service fee included?",
        answer:
          "For § 401 and § 402.A work, yes by the section's own words — the permit \"shall be a total of the electric service fee, as determined in Subsection 404.A … plus a base fee\" — and § 404.A prices it at $98.00 for the first 100 amps plus $18.00 for each additional 100 amps or portion (250 amps is two additional hundreds, $36.00). For § 402.B and § 403 work it applies \"(when required)\": state a service with custom.electrical_service. No amperage stated means no service line — the size is never guessed.",
        sourceId: TULSA_CH4_SOURCE_KEY,
      },
      {
        question: "Which table prices my remodel?",
        answer:
          "It turns on how much of the space is involved. § 402.B's additions-and-major-remodels table answers when at least half the space is in the area involved — custom.major_remodel marks that job — and the section's own note sends remodels under fifty percent to § 404: \"the fees shall be as provided in Section 404\". A one- or two-family dwelling in new construction or addition is § 401's table instead.",
        sourceId: TULSA_CH4_SOURCE_KEY,
      },
      {
        question: "What is a low-density project?",
        answer:
          "§ 403's own list: \"parking garages, shell buildings, and warehouses\" — priced by land use rather than occupancy, from $144.00 (1–2,500 sq ft) to $739.00 (75,001–100,000), then the same $64.00 per additional 5,000. It stands against § 402: while custom.low_density_project is set, the commercial tables stand down.",
        sourceId: TULSA_CH4_SOURCE_KEY,
      },
      {
        question: "Is there a minimum on the electrical permit?",
        answer:
          "Not in Chapter 4 — but Chapter 1's § 107 still applies: \"A minimum fee of Eighty Dollars ($80.00) shall apply to any permit.\" The floor reads the whole bill, including the stack's own lines, so the smallest electrical permit this site can price costs $80.00 total.",
        sourceId: TULSA_CH1_SOURCE_KEY,
      },
    ],
    seoTitle: "Tulsa electrical permit cost: $230–$1,179 area bands",
    seoDescription:
      "Tulsa electrical permit fees — § 401's $230/$293 residential bands plus $58 per 1,000 sq ft, § 402's six-band commercial tables, § 403 low density, the $98 service fee, and the Chapter 1 stack.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: TULSA_LAST_VERIFIED,
  },
  {
    jurisdictionKey: TULSA_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    slug: "plumbing-permit-cost",
    title: "Tulsa plumbing permit cost",
    intro:
      "A Tulsa plumbing permit is **§ 801's six count-based rows, then the stack** — and no valuation anywhere. Gas piping is $41.00 per meter; a backflow prevention assembly $79.00; an interceptor or separator $150.00; a water heater $35.00; a water service $35.00; and plumbing fixtures are $81.00 for the base including the first fixture plus $3.31 each additional. A permit charges exactly the rows its job touches. Then Chapter 1 adds its five lines — $4.00 and $0.50 to the state-and-City pair, $5.50 plus 8% of the permit fee, $5.00 processing — and § 107's $80 floor reads the whole bill, which is why a single water-heater permit costs $80.00 rather than $45.07.",
    localSummary:
      "Every row is a count the application already carries — meters, backflow devices, interceptors, heaters, water service connections, fixtures — so there is no scope switch on this page at all: a permit charges the rows its job touches and nothing else. The fixtures row is one formula with the first fixture inside its base: four fixtures are $81.00 + 3 × $3.31 = $90.93 before the stack.\n\nThe floor is the story. A $35 water heater computes $35.00 of § 801; § 117 adds $5.50 + 8% ($8.30); § 100 adds $4.50; § 103 adds $5.00 — $52.80 in all — and § 107's \"minimum fee of Eighty Dollars … shall apply to any permit\" lifts the bill to $80.00. The floor is charged last, after every other line, so it reads the whole bill rather than any single row.\n\nOne figure in this title cannot be read: § 801.A's \"Plus, per opening .....$2.6887.00\", two decimal points in one amount, present in the codified text exactly as the City's 2021 Title 49 printing had it. $2.68, $87.00 and $2.6887 are all defensible splits of the same characters and the schedule offers no arithmetic to check them against — so it is quoted verbatim on this page and charged nowhere.",
    notIncluded:
      "This is Tulsa's plumbing permit fee — the § 801 rows the job's counts select, plus the Chapter 1 stack. It excludes:\n\n- **The garbled per-opening figure.** § 801.A's \"Plus, per opening .....$2.6887.00\" cannot be read as a number; it is quoted on this page and charged nowhere rather than guessed at $2.68, $87.00 or $2.6887.\n- **§ 802's outside-city travel fee ($92) and § 803's registration ($178).** Licensing and an event row, not permit lines.\n- **Registrations and the governmental waiver.** § 116 waives fees for governmental entities on written request — a waiver with its own process.\n- **Event rows in Chapter 1.** Resubmission, additional inspection, reinspection, recall, records and appeal fees attach to events; § 105's unpermitted-work penalty ($214 or 3× the fee) is named rather than modelled.\n- **Any valuation.** Nothing on this page reads a declared cost: meters, devices, heaters, services and fixtures are counts, and the total never moves because the job got more expensive.\n- **The mechanical trade.** Chapter 5 prices mechanical permits and is not published as a page in this pass.",
    workedExample: {
      scenario:
        "A permit for a single water heater — the smallest plumbing job this title prices — with nothing else touched.",
      inputs: {
        occupancy: "residential",
        workType: "repair",
        custom: { heaters: 1 },
      },
      notes:
        "The floor is the whole story — $80.00.\n\n§ 801's row: one water heater at $35.00. The other five rows answer nothing — no meters, backflow assemblies, interceptors, services or fixtures were given.\n\n§ 117: $5.50 plus 8% of $35.00 — 8% is $2.80, so $8.30. It reads the chapter's fee only, before the state and maintenance lines exist.\n\n§ 100: $4.00 to the state plus $0.50 retained by the City. § 103: $5.00 processing.\n\nSubtotal: $35.00 + $8.30 + $4.50 + $5.00 = $52.80.\n\n§ 107's floor: \"A minimum fee of Eighty Dollars ($80.00) shall apply to any permit\" — charged last of all, reading the whole bill, so the shortfall is $80.00 − $52.80 = $27.20 and the permit pays $80.00. (The schedule's own \"in addition to any … minimum fee\" in § 117 is what keeps the 8% inside the arithmetic the floor then reads.)\n\nTotal: $80.00. What moves it: four fixtures instead compute $81.00 + 3 × $3.31 = $90.93 of § 801 and pay $90.93 × 1.08 + $14.50 ≈ $112.70 with the stack — past the floor, no shortfall; a heater plus a water service is $70.00 of rows, $67.60-plus stack, still floored at $80.00; and the same job with an amperage-bearing electrical cousin on the other page would read § 404.A instead.",
    },
    faqs: [
      {
        question: "How much is a plumbing permit in Tulsa?",
        answer:
          "§ 801's six rows, each charged for what the job touches: gas piping $41.00 per meter, backflow prevention assembly $79.00, interceptor/separator $150.00, water heater $35.00, water service $35.00, and fixtures $81.00 including the first plus $3.31 each additional. On top: the Chapter 1 stack — $4.00 state, $0.50 City, $5.50 + 8% of the permit fee, $5.00 processing — with an $80 minimum on the whole bill.",
        sourceId: TULSA_CH8_SOURCE_KEY,
      },
      {
        question: "Why does one water heater cost $80?",
        answer:
          "Because § 107 floors every permit: \"A minimum fee of Eighty Dollars ($80.00) shall apply to any permit\". The heater row computes $35.00; the stack brings the bill to $52.80 ($35.00 + $8.30 for § 117's $5.50 and 8%, $4.50 to the state and City, $5.00 processing); the floor then adds the $27.20 shortfall. It is charged last, so it reads the entire bill rather than any single row.",
        sourceId: TULSA_CH1_SOURCE_KEY,
      },
      {
        question: "Is the fee based on the value of the work?",
        answer:
          "No. § 801 reads counts only — meters, backflow assemblies, interceptors, heaters, water service connections and fixtures. Nothing on this page changes because the job got more expensive; only the building page (§ 302) reads a valuation.",
        sourceId: TULSA_CH8_SOURCE_KEY,
      },
      {
        question: "How are fixtures charged?",
        answer:
          "One row with the first fixture inside its base: \"Fixtures base (including the first fixture) — $81.00\" plus \"each additional fixture — $3.31\". Four fixtures are $81.00 + 3 × $3.31 = $90.93 before the stack; one fixture is $81.00 before the stack, already past the $80 floor by itself.",
        sourceId: TULSA_CH8_SOURCE_KEY,
      },
      {
        question: "What is the 'per opening $2.6887.00' line?",
        answer:
          "§ 801.A's second line, printed with two decimal points in one amount — in the codified text exactly as the City's 2021 Title 49 printing had it. This site quotes it verbatim and charges nothing for it: $2.68, $87.00 and $2.6887 are all defensible readings of the same characters, and the schedule offers no arithmetic to check them against. A figure that cannot be read is named, never guessed.",
        sourceId: TULSA_CH8_SOURCE_KEY,
      },
    ],
    seoTitle: "Tulsa plumbing permit cost: $81 fixtures base, $80 floor",
    seoDescription:
      "Tulsa plumbing permit fees — § 801's six count-based rows ($41/meter, $79 backflow, $150 interceptor, $35 heater, $35 water service, $81 fixtures + $3.31 each) and the Chapter 1 stack's $80 floor.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: TULSA_LAST_VERIFIED,
  },
];

const verifications: SeedVerification[] = [
  {
    entityType: "source",
    entityKey: TULSA_CH3_SOURCE_KEY,
    status: "verified",
    method: "manual_review",
    verifiedAt: TULSA_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: TULSA_CH3_SOURCE_KEY,
    notes:
      "Read 2026-09-26 through the codifier, with §§ 301–302 double-checked against the City Clerk's Ord. 25794 packet word for word — the closest-thousand phrase, the four bands and the \"additional fee … above $150,000.00\" all present in both.",
  },
  {
    entityType: "source",
    entityKey: TULSA_ORD_25794_SOURCE_KEY,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: TULSA_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: TULSA_ORD_25794_SOURCE_KEY,
    notes:
      "The 14-page packet read from the City Clerk's own PDF (pdftotext -layout) on 2026-09-26: staff memo's FY2027 rationale, the emergency clause, and the adopted text of §§ 301–302 matching the codified figures.",
  },
  {
    entityType: "source",
    entityKey: TULSA_CH1_SOURCE_KEY,
    status: "verified",
    method: "manual_review",
    verifiedAt: TULSA_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: TULSA_CH1_SOURCE_KEY,
    notes:
      "Read 2026-09-26: § 102's application-to-every-permit sentence, § 100's pair, § 117's 8% with its \"in addition to any … minimum fee\", § 103 and § 107's global floor — the stack's order fixed by these texts and by the component evaluation order together.",
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-302-D",
    permitTypeKey: "building",
    status: "needs_review",
    method: "manual_review",
    verifiedAt: TULSA_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: TULSA_CH3_SOURCE_KEY,
    notes:
      "The over-$150,000 band is charged as B's own ceiling ($927.00 = $6.18 × 150) plus $3.09 per closest thousand of the excess — continuous at the seam, and supported by the drafter's pattern (where § 301 means a replacement formula it prints one; where § 302 means an addition it says \"additional\"). The alternative — B's rate continuing on the full valuation with the excess stacked on it, a $9.27 marginal rate above the seam — requires applying B outside the cap its own scope states. Both readings are asserted in the tests; a City-published worked example would settle it, and none exists.",
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-302-C",
    permitTypeKey: "building",
    status: "verified",
    method: "manual_review",
    verifiedAt: TULSA_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: TULSA_CH3_SOURCE_KEY,
    notes:
      "$6.18 per thousand with incrementRounding \"nearest\" — the schedule's own \"to the closest One Thousand Dollars\". Asserted from both directions: $40,499 buys forty steps ($247.20), $41,000 buys forty-one; the phrase is confirmed in the City's 2021 Title 49 PDF through Google's index, so it predates the FY2027 amendment.",
  },
  {
    entityType: "fee_rule",
    entityKey: "TUL-BLD-107",
    permitTypeKey: "building",
    status: "verified",
    method: "manual_review",
    verifiedAt: TULSA_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: TULSA_CH1_SOURCE_KEY,
    notes:
      "$80 floor as a permit_minimum on fee_subtotal with priority 200 inside the other component, so it runs after § 117, § 100 and § 103 and reads the whole bill — asserted by the plumbing worked example ($52.80 lifted to $80.00) and by the building example where it does not bind at $1,349.88. NOT_SHELTER keeps it out of § 306's carve-out.",
  },
  {
    entityType: "fee_rule",
    entityKey: "ELEC-404A-SERVICE",
    permitTypeKey: "electrical",
    status: "verified",
    method: "manual_review",
    verifiedAt: TULSA_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: TULSA_CH4_SOURCE_KEY,
    notes:
      "$98.00 base + $18.00 per each additional 100 amps or portion above 100, on basis amperage — and the condition split three ways exactly as the sections word it: automatic on 401 and 402.A (\"shall be a total of the electric service fee … plus a base fee\"), fact-gated elsewhere (\"(when required)\"), and absent entirely when no amperage is stated.",
  },
  {
    entityType: "fee_rule",
    entityKey: "PL-801-FIXTURES",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "manual_review",
    verifiedAt: TULSA_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: TULSA_CH8_SOURCE_KEY,
    notes:
      "\"Fixtures base (including the first fixture) $81.00 + each additional $3.31\" as one per-unit row with thresholdUnits 1 — four fixtures compute $90.93, and the garbled per-opening line beside it stays quoted and uncharged.",
  },
  {
    entityType: "permit_page",
    entityKey: "building-permit-cost",
    permitTypeKey: "building",
    status: "verified",
    method: "manual_review",
    verifiedAt: TULSA_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: TULSA_CH3_SOURCE_KEY,
    notes:
      "Gate-checked 2026-09-26: the four bands wired as four explicit rules so both sides of every seam are stated, the nearest rounding charged from the schedule's own phrase, § 301 named as a credit rather than summed, § 306's carve-out standing down bands and stack alike, and the worked example reproducing $1,349.88 ($1,236.00 band + $104.38 § 117 + $9.50 lines).",
  },
  {
    entityType: "permit_page",
    entityKey: "electrical-permit-cost",
    permitTypeKey: "electrical",
    status: "verified",
    method: "manual_review",
    verifiedAt: TULSA_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: TULSA_CH4_SOURCE_KEY,
    notes:
      "Gate-checked 2026-09-26: three six-band tables with their prorating continuations, the 50%-remodel note wired as custom.major_remodel, § 403 shadowing § 402, the service fee's three-way condition, and the worked example reproducing $456.72 ($409.00 band + $38.22 § 117 + $9.50 lines) with no service line because no amperage was stated.",
  },
  {
    entityType: "permit_page",
    entityKey: "plumbing-permit-cost",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "manual_review",
    verifiedAt: TULSA_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: TULSA_CH8_SOURCE_KEY,
    notes:
      "Gate-checked 2026-09-26: six count rows with no scope switch, the fixtures base-plus-allowance row, the garbled per-opening figure quoted and uncharged, and the worked example reproducing the $80.00 floor ($52.80 lifted by a $27.20 shortfall) — the floor asserted from both sides.",
  },
  {
    entityType: "jurisdiction_profile",
    entityKey: TULSA_KEYS.jurisdiction,
    status: "verified",
    method: "manual_review",
    verifiedAt: TULSA_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: TULSA_PLANS_PAGE_SOURCE_KEY,
    notes:
      "The profile states the readings the model depends on — the stack's order, the closest-thousand rounding, § 302.D's charged reading under needs_review, § 301 as a credit — and keeps every document fact a reader would trip on: the stale City link to Title 49, the image-only 2021 PDF, and the uncodified Ord. 25849 that touches animal services only.",
  },
];

export const tulsaSeed: JurisdictionSeed = {
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
export const TULSA_PUBLISHED_PERMIT_PAGES = tulsaSeed.permitPages.filter(
  (page) => page.publishStatus === "published" && !page.noindex,
);
