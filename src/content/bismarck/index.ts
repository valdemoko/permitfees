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
  BISMARCK_BUILDING_LADDER_RULES,
  BISMARCK_COMMERCIAL_REVIEW_FEE,
  BISMARCK_COMMERCIAL_SCHEDULE_SOURCE_KEY,
  BISMARCK_ELECTRICAL_PERMIT,
  BISMARCK_HUB_SOURCE_KEY,
  BISMARCK_NDSEB_BAND_RULES,
  BISMARCK_NDSEB_EFFECTIVE_FROM,
  BISMARCK_NDSEB_LATE_CERTIFICATE,
  BISMARCK_NDSEB_SOURCE_KEY,
  BISMARCK_PLUMBING_LADDER_RULES,
  BISMARCK_RESIDENTIAL_EFFECTIVE_FROM,
  BISMARCK_RESIDENTIAL_SCHEDULE_SOURCE_KEY,
  BISMARCK_SEPTIC_RULE,
  BISMARCK_TITLE4_SOURCE_KEY,
  BISMARCK_TRADE_BUILDING_RULES,
  BISMARCK_TRADE_EFFECTIVE_FROM,
  BISMARCK_TRADE_SCHEDULE_SOURCE_KEY,
} from "./fee-rules";

export * from "./fee-rules";

/**
 * The complete Bismarck, North Dakota seed payload.
 *
 * Every figure traces to research/north-dakota/bismarck.md, which traces to the
 * Community Development Department's own fee PDFs on bismarcknd.gov: the residential
 * sheet "Last Revised 1/01/25", the commercial and trade sheets "Last Revised
 * 1/10/2018", the Permit Fees hub, Title 4, and the North Dakota State Electrical
 * Board's Inspection Fees page. Nothing is estimated.
 *
 * Three pages, all published: building, electrical and plumbing. The headline reading:
 * the two building sheets print numerically identical ladders, so the ladder is one
 * rule set answering both classes — the class switch does only the one job the sheets
 * actually differ on, the commercial sheet's unconditional 20% review fee. Neither
 * sheet prints "or fraction thereof", so every band prorates, the opposite of Fargo's
 * sheets two days' drive west.
 */

const RESEARCHER = "Permit Fee Intelligence research pass 14 (North Dakota)";

export const BISMARCK_LAST_VERIFIED = "2026-09-25";

export const BISMARCK_KEYS = {
  state: "nd",
  county: "burleigh-county",
  jurisdiction: "bismarck",
  residentialSchedule: "bismarck-residential-building-fees",
  commercialSchedule: "bismarck-commercial-building-fees",
  tradeSchedule: "bismarck-trade-permit-fees",
  electricalSchedule: "bismarck-ndseb-inspection-fees",
} as const;

const state: SeedState = {
  code: "ND",
  slug: "north-dakota",
  name: "North Dakota",
  fipsCode: "38",
};

const county: SeedCounty = {
  key: BISMARCK_KEYS.county,
  slug: "burleigh-county",
  name: "Burleigh County",
  fipsCode: "38015",
};

const jurisdiction: SeedJurisdiction = {
  key: BISMARCK_KEYS.jurisdiction,
  stateKey: BISMARCK_KEYS.state,
  countyKey: BISMARCK_KEYS.county,
  type: "city",
  slug: "bismarck",
  name: "Bismarck",
  officialName: "City of Bismarck",
  websiteUrl: "https://www.bismarcknd.gov/",
  permitPortalUrl: "https://www.bismarcknd.gov/123/Permit-Fees",
  timezone: "America/Chicago",
  isActive: true,
};

const departments: SeedDepartment[] = [
  {
    key: "bismarck-building-inspections-division",
    jurisdictionKey: BISMARCK_KEYS.jurisdiction,
    kind: "building",
    name: "City of Bismarck — Community Development Department, Building Inspections Division",
    phone: "701-355-1465",
    email: "buildinginspections@bismarcknd.gov",
    url: "https://www.bismarcknd.gov/123/Permit-Fees",
    addressLine: "PO Box 5503, Bismarck, ND 58506-5503",
    hours: null,
    notes:
      "The Division's own contact block, printed on the letterhead of every fee sheet this jurisdiction transcribes — phone, email and PO box come from the sheets themselves rather than a directory. The Division publishes three fee documents (residential, commercial, additional/trade), enforces Title 4 — Building Regulations as the City's ordinance, and links them all from the Permit Fees hub, whose own \"Effective January 1, 2020\" sentence disagrees with the 2025 residential sheet it links.",
  },
];

const sources: SeedSource[] = [
  {
    key: BISMARCK_RESIDENTIAL_SCHEDULE_SOURCE_KEY,
    jurisdictionKey: BISMARCK_KEYS.jurisdiction,
    title: "City of Bismarck — Residential Permit Fees (permit fee multiplier table and area valuation)",
    url: "https://www.bismarcknd.gov/DocumentCenter/View/49820/2025_RESIDENTIAL-PERMIT-FEES-",
    sourceType: "fee_schedule_pdf",
    issuingAuthority: "City of Bismarck — Community Development Department, Building Inspections Division",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: BISMARCK_RESIDENTIAL_EFFECTIVE_FROM,
    retrievedAt: BISMARCK_LAST_VERIFIED,
    lastVerifiedAt: BISMARCK_LAST_VERIFIED,
    notes:
      'Read 2026-09-25 as the Division\'s own one-page PDF, printed "Last Revised 1/01/25" — the later of the two building sheets, which is why the shared ladder is sourced here. Transcribed: the eight-band permit fee multiplier table ($40.00 flat; then $1.85 per $100, $8.40, $6.10, $4.20, $3.40, $2.85 and $2.20 per $1,000, over printed bases $40.00 through $3,408.45), the area valuation table (Garage $25.00, 1st Floor $165.67, 2nd Floor $79.50, and the rest), and the valuation instructions (new construction from the area table; alterations "the construction value based on the total bid amount of the project"). The sheet prints its fifth range as "$50,0001.00" — a typo for $50,001.00, read as the figure the arithmetic confirms.',
  },
  {
    key: BISMARCK_COMMERCIAL_SCHEDULE_SOURCE_KEY,
    jurisdictionKey: BISMARCK_KEYS.jurisdiction,
    title: "City of Bismarck — Commercial Permit Fees (the same ladder, plus the review fee)",
    url: "https://bismarcknd.gov/DocumentCenter/View/30726",
    sourceType: "fee_schedule_pdf",
    issuingAuthority: "City of Bismarck — Community Development Department, Building Inspections Division",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2018-01-10",
    effectiveFrom: BISMARCK_TRADE_EFFECTIVE_FROM,
    retrievedAt: BISMARCK_LAST_VERIFIED,
    lastVerifiedAt: BISMARCK_LAST_VERIFIED,
    notes:
      'Read 2026-09-25 as the Division\'s own one-page PDF, printed "Last Revised 1/10/2018". Transcribed: "TOTAL COST OF JOB" priced by eight bands numerically identical to the residential sheet\'s — same bases, same rates, verified row by row against the 2025 sheet — and the one line the residential sheet does not print: "A Review Fee of 20% of the permit fee will be added to all Commercial Building Permits." The commercial copy prints its fifth band\'s rate as "$$4.20" (a doubled dollar sign), read as $4.20 because $413.45 + 50 × $4.20 closes the next seam at $623.45. Extracted with pdftotext -table, which pairs the wrapping fee column that -layout mispairs, cross-checked against -layout.',
  },
  {
    key: BISMARCK_TRADE_SCHEDULE_SOURCE_KEY,
    jurisdictionKey: BISMARCK_KEYS.jurisdiction,
    title: "City of Bismarck — Additional Permit Fees (plumbing, mechanical, electrical, septic, demolition, moving…)",
    url: "https://bismarcknd.gov/DocumentCenter/View/30724",
    sourceType: "fee_schedule_pdf",
    issuingAuthority: "City of Bismarck — Community Development Department, Building Inspections Division",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2018-01-10",
    effectiveFrom: BISMARCK_TRADE_EFFECTIVE_FROM,
    retrievedAt: BISMARCK_LAST_VERIFIED,
    lastVerifiedAt: BISMARCK_LAST_VERIFIED,
    notes:
      'Read 2026-09-25 as the Division\'s own one-page PDF, printed "Last Revised 1/10/2018". Transcribed in full: plumbing\'s four-band valuation ladder ($40.00 flat to $2,000; then $1.65, $1.10 and $0.60 per $1,000 over bases $40.00, $69.70 and $157.70); the mechanical/HVAC ladder, printed with figures identical to plumbing\'s; "Electrical permits $25.00"; Septic/Drainfield $75.00; Home Occupation $25.00; Temporary Use $50.00; Demolition $75.00; Moving $25.00; Manufactured Homes $150.00. The rows are split across this site\'s three pages by what they permit (reading f).',
  },
  {
    key: BISMARCK_HUB_SOURCE_KEY,
    jurisdictionKey: BISMARCK_KEYS.jurisdiction,
    title: "City of Bismarck — Permit Fees hub page",
    url: "https://www.bismarcknd.gov/123/Permit-Fees",
    sourceType: "municipal_website",
    issuingAuthority: "City of Bismarck",
    authorityKind: "city",
    isPrimary: false,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: BISMARCK_LAST_VERIFIED,
    lastVerifiedAt: BISMARCK_LAST_VERIFIED,
    notes:
      'Read 2026-09-25 as the index that links the sheets — and the source of this jurisdiction\'s kept disagreement: the hub still says "Permit Fees Effective January 1, 2020" while its own "Residential Permit Fees (PDF)" anchor points at the 2025 revision (the hub\'s link was followed, not the older /32654 copy the document centre also holds). The dated documents win for their own figures; the hub\'s 2020 sentence is recorded rather than deleted, exactly as Buffalo\'s stale hub date is.',
  },
  {
    key: BISMARCK_TITLE4_SOURCE_KEY,
    jurisdictionKey: BISMARCK_KEYS.jurisdiction,
    title: "City of Bismarck — Title 4, Building Regulations (the ordinance the Division enforces)",
    url: "https://www.bismarcknd.gov/DocumentCenter/View/151/Title-04---Building-Regulations",
    sourceType: "municipal_code",
    issuingAuthority: "City of Bismarck",
    authorityKind: "city",
    isPrimary: false,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: BISMARCK_LAST_VERIFIED,
    lastVerifiedAt: BISMARCK_LAST_VERIFIED,
    notes:
      "Read 2026-09-25, HTTP 200 — the City's building ordinance, readable here unlike the codifiers that answered 403 in New Jersey, New York and Buffalo. Cited for jurisdiction context only: the fee sheets, not the ordinance, are the operative price list, and no figure on this site comes from Title 4.",
  },
  {
    key: BISMARCK_NDSEB_SOURCE_KEY,
    jurisdictionKey: BISMARCK_KEYS.jurisdiction,
    title: "North Dakota State Electrical Board — Inspection Fees",
    url: "https://www.ndseb.com/inspections/inspection-fees/",
    sourceType: "state_agency",
    issuingAuthority: "North Dakota State Electrical Board",
    authorityKind: "state",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: BISMARCK_NDSEB_EFFECTIVE_FROM,
    retrievedAt: BISMARCK_LAST_VERIFIED,
    lastVerifiedAt: BISMARCK_LAST_VERIFIED,
    notes:
      'Read 2026-09-25 as the board\'s own page, printing "Effective July 1, 2024" above the current table with the superseded table beneath it. Both job-cost bands are transcribed from it (up to $500.00 → $50.00 minimum; $500.00 to $20,000.00 → $50.00 plus 2% on the balance; over $20,000.00 → $440.00 plus 1/10 of 1% on the balance), with the basis sentence ("the total amount of the contract or total cost to the owner, including extras"), the four exclusions (appliances, HVAC units, electric motors/PLC/generators, industrial machines) and the $50.00 late-certificate increase. Bismarck and Fargo each carry their own source row for the board, because NDSEB bills the installer directly in both — a state fee, not a city one.',
  },
];

/** Empty on purpose: the permit types Bismarck uses already exist as shared rows. */
const permitTypes: JurisdictionSeed["permitTypes"] = [];
const projectTypes: JurisdictionSeed["projectTypes"] = [];

const jurisdictionPermitTypes: SeedJurisdictionPermitType[] = [
  {
    jurisdictionKey: BISMARCK_KEYS.jurisdiction,
    permitTypeKey: "building",
    isAvailable: true,
    localName: "Building permit — one shared ladder, both sheets; 20% review fee on commercial",
    officialUrl: "https://bismarcknd.gov/DocumentCenter/View/30726",
    notes:
      'Two sheets, one table: the residential sheet ("Last Revised 1/01/25") and the commercial sheet ("Last Revised 1/10/2018") print eight bands that are numerically identical — same bases, same rates — so the ladder answers both classes at once. The sheets differ in exactly one printed price: "A Review Fee of 20% of the permit fee will be added to all Commercial Building Permits", unconditional and commercial-only. The trade sheet adds the building-shaped flat rows (demolition $75, moving $25, manufactured homes $150, home occupation $25, temporary use $50).',
  },
  {
    jurisdictionKey: BISMARCK_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    isAvailable: true,
    localName: "Electrical permit — $25 from the City, inspection fee from the state board",
    officialUrl: "https://bismarcknd.gov/DocumentCenter/View/30724",
    notes:
      "Two sources, one total: the City's trade sheet charges a flat $25.00 permit, and the North Dakota State Electrical Board charges the inspection fee on the job cost — $50 minimum to $500, 2% of the balance to $20,000 (closing at $440.00), then $440 plus one tenth of one percent — with $50 more for a late wiring certificate. The board's rules are state fees in the breakdown, which is what they are.",
  },
  {
    jurisdictionKey: BISMARCK_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    isAvailable: true,
    localName: "Plumbing permit — four-band valuation ladder, plus the septic row",
    officialUrl: "https://bismarcknd.gov/DocumentCenter/View/30724",
    notes:
      'A four-band ladder on the total cost of job — $40.00 flat to $2,000, then $1.65, $1.10 and $0.60 per $1,000 over bases $40.00, $69.70 and $157.70 — prorating every fraction because the sheet prints no round-up phrase, plus Septic/Drainfield at $75.00 as its own row. The sheet\'s mechanical/HVAC ladder is printed with figures identical to plumbing\'s; it is quoted on this page as a separate permit rather than attached to a mechanical page this site does not publish.',
  },
];

const feeSchedules: SeedFeeSchedule[] = [
  {
    key: BISMARCK_KEYS.residentialSchedule,
    jurisdictionKey: BISMARCK_KEYS.jurisdiction,
    sourceKey: BISMARCK_RESIDENTIAL_SCHEDULE_SOURCE_KEY,
    title: "City of Bismarck — Residential Permit Fees (permit fee multiplier)",
    officialUrl: "https://www.bismarcknd.gov/DocumentCenter/View/49820/2025_RESIDENTIAL-PERMIT-FEES-",
    effectiveFrom: BISMARCK_RESIDENTIAL_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: BISMARCK_LAST_VERIFIED,
    notes:
      'The later revision ("Last Revised 1/01/25") of the two sheets that print the same table, which is why the shared ladder attaches here: one rule set, both classes, sourced to the newer document. No band prints "or fraction thereof" — every band prorates.',
  },
  {
    key: BISMARCK_KEYS.commercialSchedule,
    jurisdictionKey: BISMARCK_KEYS.jurisdiction,
    sourceKey: BISMARCK_COMMERCIAL_SCHEDULE_SOURCE_KEY,
    title: "City of Bismarck — Commercial Permit Fees (the same ladder, plus the review fee)",
    officialUrl: "https://bismarcknd.gov/DocumentCenter/View/30726",
    effectiveFrom: BISMARCK_TRADE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: BISMARCK_LAST_VERIFIED,
    notes:
      '"Last Revised 1/10/2018". Its eight bands are the residential sheet\'s bands, verified row by row; what it adds is the one line the residential sheet does not print — the unconditional 20% review fee — and that rule is what attaches to this schedule.',
  },
  {
    key: BISMARCK_KEYS.tradeSchedule,
    jurisdictionKey: BISMARCK_KEYS.jurisdiction,
    sourceKey: BISMARCK_TRADE_SCHEDULE_SOURCE_KEY,
    title: "City of Bismarck — Additional Permit Fees (trade and flat-row permits)",
    officialUrl: "https://bismarcknd.gov/DocumentCenter/View/30724",
    effectiveFrom: BISMARCK_TRADE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: BISMARCK_LAST_VERIFIED,
    notes:
      '"Last Revised 1/10/2018". Holds plumbing\'s four-band ladder and septic\'s flat row for the plumbing page, the $25 electrical permit for the electrical page, and the five building-shaped rows (demolition, moving, manufactured homes, home occupation, temporary use) for the building page — the sheet a single document\'s worth of trade prices, split across pages by what each row permits.',
  },
  {
    key: BISMARCK_KEYS.electricalSchedule,
    jurisdictionKey: BISMARCK_KEYS.jurisdiction,
    sourceKey: BISMARCK_NDSEB_SOURCE_KEY,
    title: "North Dakota State Electrical Board — Inspection Fees (the state half of every electrical total)",
    officialUrl: "https://www.ndseb.com/inspections/inspection-fees/",
    effectiveFrom: BISMARCK_NDSEB_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: BISMARCK_LAST_VERIFIED,
    notes:
      'The board\'s "Effective July 1, 2024" table, held as its own schedule because it is its own instrument: two job-cost bands and the late-certificate increase, all state fees that ride beside the City\'s flat $25 permit rather than replacing it.',
  },
];

function attach(permitTypeKey: string, rules: SeedFeeRule["rule"][], scheduleKey: string): SeedFeeRule[] {
  return rules.map((rule) => ({
    jurisdictionKey: BISMARCK_KEYS.jurisdiction,
    permitTypeKey,
    scheduleKey,
    rule,
  }));
}

const feeRules: SeedFeeRule[] = [
  // Building: the shared ladder (both classes), the commercial review fee, the trade
  // sheet's flat rows.
  ...attach("building", BISMARCK_BUILDING_LADDER_RULES, BISMARCK_KEYS.residentialSchedule),
  ...attach("building", [BISMARCK_COMMERCIAL_REVIEW_FEE], BISMARCK_KEYS.commercialSchedule),
  ...attach("building", BISMARCK_TRADE_BUILDING_RULES, BISMARCK_KEYS.tradeSchedule),
  // Electrical: the City's permit (trade sheet) and the board's fees (NDSEB schedule).
  ...attach("electrical", [BISMARCK_ELECTRICAL_PERMIT], BISMARCK_KEYS.tradeSchedule),
  ...attach("electrical", [...BISMARCK_NDSEB_BAND_RULES, BISMARCK_NDSEB_LATE_CERTIFICATE], BISMARCK_KEYS.electricalSchedule),
  // Plumbing: the trade sheet's ladder and septic row.
  ...attach("plumbing", [...BISMARCK_PLUMBING_LADDER_RULES, BISMARCK_SEPTIC_RULE], BISMARCK_KEYS.tradeSchedule),
];

const requirements: SeedRequirement[] = [
  {
    jurisdictionKey: BISMARCK_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "The valuation is determined before the ladder runs: area table for new work, total bid for alterations",
    description:
      'The residential sheet states how the number the ladder reads is produced: for new construction, square footage at the sheet\'s own per-square-foot rates — Garage $25.00, 1st Floor $165.67, 2nd Floor $79.50, Unfinished Basement $15.25, Finished Basement $36.75, Deck $15.75, Covered Deck $22.50, Covered Patio/Entry $15.00, Basement Finish $21.50, Detached Shed $15.00, Detached Shop or Garage $25.00 — and for alterations, "the construction value based on the total bid amount of the project". The commercial sheet prices its own "TOTAL COST OF JOB". This site takes the resulting figure as its input; the area-times-rate derivation is the applicant\'s calculation, quoted on the page rather than re-run (the same stance as Buffalo\'s ICC table and Fargo\'s ICC-minus-15%).',
    isMandatory: true,
    sortOrder: 10,
    sourceKey: BISMARCK_RESIDENTIAL_SCHEDULE_SOURCE_KEY,
    lastVerifiedAt: BISMARCK_LAST_VERIFIED,
  },
  {
    jurisdictionKey: BISMARCK_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "document",
    title: "A review fee of 20% rides every commercial building permit — unconditionally",
    description:
      'The commercial sheet\'s own sentence: "A Review Fee of 20% of the permit fee will be added to all Commercial Building Permits." The word "all" is the requirement: no condition about plans is printed, so the fee answers every commercial permit whether or not drawings accompany it — and the residential sheet prints no such line, so a one- or two-family job never carries a twin of it. The percentage reads the permit fee the ladder computed, and there is no application fee for it to include: neither sheet prints one.',
    isMandatory: true,
    sortOrder: 20,
    sourceKey: BISMARCK_COMMERCIAL_SCHEDULE_SOURCE_KEY,
    lastVerifiedAt: BISMARCK_LAST_VERIFIED,
  },
  {
    jurisdictionKey: BISMARCK_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "Title 4 — Building Regulations is the ordinance the Division enforces",
    description:
      "The City's building ordinance, published as Title 4 in the document centre and read for this pass as jurisdiction context: it is the regulation the Building Inspections Division administers, and the fee sheets are its price list. No figure on this site is taken from the ordinance — the three fee PDFs are the operative documents, each carrying its own \"Last Revised\" line.",
    isMandatory: false,
    sortOrder: 30,
    sourceKey: BISMARCK_TITLE4_SOURCE_KEY,
    lastVerifiedAt: BISMARCK_LAST_VERIFIED,
  },
  {
    jurisdictionKey: BISMARCK_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "other",
    title: "The board's fee is computed on the contract cost less four named exclusions",
    description:
      'NDSEB\'s basis: "the total amount of the contract or total cost to the owner, including extras" — and four things stay out of it: "Appliances, HVAC units, electric motors, PLC\'s and generators, Industrial machines … need not be included in the cost." The City\'s flat $25 permit is billed beside that state fee, not inside it, so the exclusions move the state line only. The board\'s page also prints the superseded table beneath the current one; the July 1, 2024 figures are the ones this site charges.',
    isMandatory: true,
    sortOrder: 10,
    sourceKey: BISMARCK_NDSEB_SOURCE_KEY,
    lastVerifiedAt: BISMARCK_LAST_VERIFIED,
  },
  {
    jurisdictionKey: BISMARCK_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "other",
    title: "A wiring certificate filed late adds $50 to the state fee",
    description:
      'The board\'s rule: whenever an electrical installation "is commenced or in use without submitting an electrical wiring certificate the certificate may be considered late and the normal inspection fee … is increased in the amount of fifty dollars." It is a state increase with its own gated line on this site — and the board\'s $50-per-hour special services and $50 correction-order administration charge are quoted beside the bands rather than charged, because this calculator collects neither hours nor correction orders.',
    isMandatory: false,
    sortOrder: 20,
    sourceKey: BISMARCK_NDSEB_SOURCE_KEY,
    lastVerifiedAt: BISMARCK_LAST_VERIFIED,
  },
  {
    jurisdictionKey: BISMARCK_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    requirementType: "other",
    title: "Plumbing is priced on the total cost of job; mechanical is a separate permit with its own ladder",
    description:
      "The trade sheet prices plumbing on the same measure as the building sheets — the total cost of job — through four bands that prorate every fraction. The same sheet prints a mechanical/HVAC ladder whose figures are identical to plumbing's in every band; it is a separate permit, quoted on this site's plumbing and building pages rather than attached to a mechanical page this site does not publish (the record keeps open whether the identical figures are policy or a copied table).",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: BISMARCK_TRADE_SCHEDULE_SOURCE_KEY,
    lastVerifiedAt: BISMARCK_LAST_VERIFIED,
  },
  {
    jurisdictionKey: BISMARCK_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    requirementType: "other",
    title: "Septic and drainfield work is its own permit row",
    description:
      'The trade sheet lists "Septic/Drainfield — $75.00" as a row of its own beside the plumbing ladder: a flat price for the permit rather than a band of the job cost, answering its own fact. A job that both runs plumbing work and touches the septic system carries the ladder and this row together, because each is a permit the sheet prices separately.',
    isMandatory: false,
    sortOrder: 20,
    sourceKey: BISMARCK_TRADE_SCHEDULE_SOURCE_KEY,
    lastVerifiedAt: BISMARCK_LAST_VERIFIED,
  },
];

const profile: SeedProfile = {
  jurisdictionKey: BISMARCK_KEYS.jurisdiction,
  headline: "What construction permits cost in Bismarck",
  summary:
    "Bismarck prices construction on **one ladder printed on both building sheets** — eight bands on the total cost of job, from $40.00 flat to $3,408.45 plus $2.20 for each additional $1,000 — that prorates every fraction because neither sheet prints the round-up phrase. The sheets differ in one printed price: an unconditional 20% review fee on commercial permits the residential sheet never prints. Beside the ladder sit a trade sheet of flat rows, a four-band plumbing ladder, and electrical priced half by the City ($25.00) and half by the state board's job-cost bands.",
  localContext:
    'Two sheets that agree. The residential sheet ("Last Revised 1/01/25") and the commercial sheet ("Last Revised 1/10/2018") print eight bands that are numerically identical — same bases, same rates — so this jurisdiction models one ladder answering both classes rather than two rule sets that must agree to stay honest; a test charges each class at several valuations to keep them identical. The class switch does exactly one job the sheets actually differ on: "A Review Fee of 20% of the permit fee will be added to all Commercial Building Permits" is printed on the commercial sheet alone, and its word "all" leaves it unconditional — no plan-review fact gates it, because the sheet does not condition it.\n\nWhere Fargo\'s sheets print "or fraction thereof" in every band, Bismarck\'s never do, and the reading follows the phrase: every band prorates. $2,500 of job cost is $67.75 plus $500\'s share of the $8.40 rate — $4.20, for $71.95 — where a whole-thousand reading would be $76.15. The ladder was built to close and it closes at all seven seams: $40.00 + 15 × $1.85 is exactly $67.75 at $2,000, and the chain runs through $260.95, $413.45, $623.45, $1,983.45 and $3,408.45 with each closing figure the next band\'s printed base. Two typos are read as the figure the arithmetic confirms and recorded: the residential copy\'s "$50,0001.00" for $50,001.00, and the commercial copy\'s "$$4.20" doubled dollar sign.\n\nOne disagreement is kept rather than resolved: the Permit Fees hub still says "Permit Fees Effective January 1, 2020" while its own residential anchor points at the 2025 sheet — the dated documents win for their own figures, and the stale sentence is recorded beside them, exactly as Buffalo\'s hub date is. Electrical is split between two governments: the City\'s trade sheet charges a flat $25.00 permit, and the North Dakota State Electrical Board charges the inspection fee on the job cost, effective July 1, 2024 — a state fee, labeled as one in the breakdown.',
  valuationBasis:
    "Three permits, two measures — and one half of a third that belongs to the state.\n\n**Building: the total cost of job.** Both sheets feed the same eight-band ladder. The residential sheet says how its number is produced — new construction from the area table's per-square-foot rates (1st Floor $165.67, 2nd Floor $79.50, Garage $25.00 and the rest), alterations from \"the construction value based on the total bid amount of the project\" — and the commercial sheet prices its own \"TOTAL COST OF JOB\". The ladder prorates: no band prints the round-up phrase, so a fraction of a $1,000 step is charged as the fraction it is. This site takes the valuation as its input; the area-times-rate derivation is the applicant's side of the exchange.\n\n**Plumbing: the same measure, its own four bands.** $40.00 flat to $2,000, then $1.65, $1.10 and $0.60 per $1,000 over bases of $40.00, $69.70 and $157.70 — the same shape as the building ladder with plumbing's own figures, prorated the same way, closing at $20,000 and $100,000.\n\n**Electrical: the contract cost, billed by the state.** NDSEB's basis is \"the total amount of the contract or total cost to the owner, including extras\", less the four exclusions the board names. The first band charges $50.00 and 2% of the balance above $500 to $20,000; above that, $440.00 and one tenth of one percent. The state table prints no round-up phrase either, so both rates are prorated — and the City's own $25.00 permit reads no cost at all.",
  notIncluded:
    "These figures are Bismarck's own building, electrical and plumbing permit fees. They are not a project cost, and they exclude:\n\n- **Mechanical/HVAC permits.** The trade sheet prices them by a ladder printed with figures identical to plumbing's; it is a separate permit quoted on this site's pages rather than attached to a mechanical page this site does not publish, so no mechanical figure enters any total here.\n- **The area-table derivation.** The residential sheet's per-square-foot rates produce the valuation the ladder reads; taking off area and rate to reach that number is the applicant's calculation, quoted on the page rather than re-run.\n- **The hub's \"Effective January 1, 2020\" sentence.** Contradicted by the 2025 residential sheet its own anchor links — recorded rather than followed, so a reader who lands on the hub first knows why the dates disagree.\n- **NDSEB's exclusions, hourly special services and correction-order charge.** The four cost exclusions belong to the job-cost figure the board bills against; the $50.00-per-hour special services and the $50.00 correction-order administration charge are quoted beside the bands rather than charged by them.\n- **License, rental and administrative charges** outside the permit sheets — not permitting, and not charged.\n- **The application fee that does not exist.** Neither sheet prints one; nothing is missing from a total here for lack of one.",
  seoTitle: "Bismarck construction permit fees",
  seoDescription:
    "How Bismarck prices construction permits — one eight-band ladder printed identically on both building sheets and prorating every fraction, the commercial sheet's unconditional 20% review fee, the trade sheet's flat rows, and electrical billed by the City's $25 permit plus the state board's job-cost bands.",
  publishStatus: "published",
  noindex: false,
  lastReviewedAt: BISMARCK_LAST_VERIFIED,
};

const permitPages: SeedPermitPage[] = [
  {
    jurisdictionKey: BISMARCK_KEYS.jurisdiction,
    permitTypeKey: "building",
    slug: "building-permit-cost",
    title: "Bismarck building permit cost",
    intro:
      "A Bismarck building permit runs on **one ladder both sheets print identically**: $40.00 flat to $500 of job cost, then $1.85 for each additional $100 to $2,000, and five more bands of $8.40 down to $2.20 per $1,000 over bases that reach $3,408.45. A house and a store pay the same table; a commercial permit adds one line the residential sheet never prints — 20% of the permit fee, charged on all of them.",
    localSummary:
      'The residential sheet ("Last Revised 1/01/25") and the commercial sheet ("Last Revised 1/10/2018") print eight bands that are numerically identical — same bases, same rates — so this page charges one ladder for both classes rather than two copies that must agree to stay honest. What the sheets actually differ on is the review fee, and the difference is a sentence: "A Review Fee of 20% of the permit fee will be added to all Commercial Building Permits" — unconditional, because the sheet conditions it on nothing, and commercial-only, because the residential sheet prints no such line.\n\nNeither sheet prints "or fraction thereof" — the phrase Fargo\'s sheets print in every band and Bismarck never prints — so every band prorates: $2,500 of job cost is $67.75 plus $500\'s share of the $8.40 rate, or $4.20, for $71.95, where a whole-thousand reading would be $76.15. The ladder closes at all seven seams, each band\'s endpoint being the printed base of the band above: $40.00 + 15 × $1.85 is exactly $67.75 at $2,000, and the chain runs through $260.95, $413.45, $623.45, $1,983.45 and $3,408.45. Two printed typos are read as the figure the arithmetic confirms — the residential copy\'s "$50,0001.00" and the commercial copy\'s "$$4.20" — and recorded rather than quietly cleaned.\n\nThe trade sheet\'s building-shaped rows are added beside the ladder as their own permits: demolition $75.00, moving $25.00, manufactured homes $150.00, home occupation $25.00 and temporary use $50.00, each on its own fact, with the ladder excluding demolition work so the two never answer the same job. Neither sheet prints an application fee, and this page charges none.',
    notIncluded:
      "This is the Bismarck building permit fee — the shared ladder, the commercial review fee, and the flat rows the job triggers. It excludes:\n\n- **Mechanical/HVAC permits.** The trade sheet prices them by a ladder printed with figures identical to plumbing's — a separate permit, quoted rather than attached to a mechanical page this site does not publish.\n- **The area-table derivation.** New-construction valuations are built from the sheet's per-square-foot rates ($165.67 first floor, $79.50 second, $25.00 garage…) and alterations from the total bid; producing that figure is the applicant's calculation, quoted on the page rather than run here.\n- **The residential review fee that does not exist.** The residential sheet prints no review line; no residential rule charges one, and the absence is recorded rather than assumed — whether the City requires one anyway is the record's open question.\n- **The hub's 2020 date.** The Permit Fees page says \"Effective January 1, 2020\" while linking the 2025 sheet; the dated sheets win and the stale sentence is kept beside them.\n- **Electrical, plumbing and septic permits.** Separate permits on their own pages — the trade sheet prices them apart from the building ladder, and this total adds none of them.\n- **License, rental and administrative charges.** Not permitting, and not charged.",
    workedExample: {
      scenario:
        "A $60,000 commercial alteration — the shared ladder's fifth band and the commercial sheet's unconditional review fee.",
      inputs: {
        valuationCents: 6_000_000,
        occupancy: "commercial",
        workType: "alteration",
        custom: { one_two_family: false },
      },
      notes:
        'The fifth band prices it: "$50,001.00 to $100,000.00 — $413.45 for first $50,000.00 PLUS $4.20 for each additional $1000.00".\n\n$60,000 of job cost is $10,000 above the band\'s floor, and the rate charges it as the fraction it is: $10,000 × $4.20 per $1,000 = $42.00. Permit fee: $413.45 + $42.00 = $455.45.\n\nReview fee: twenty percent of that permit fee, $91.09 — unconditionally, because the commercial sheet adds it to "all Commercial Building Permits" and conditions it on nothing.\n\nTotal: $455.45 + $91.09 = $546.54. What moves it: the same job on a one- and two-family dwelling runs the identical ladder but no review line, for $455.45 — the residential sheet prints none; a $2,500 job computes $71.95 with no round-up, where a whole-thousand reading would be $76.15; and demolition instead of alteration is the trade sheet\'s flat $75.00, with the ladder excluded from the job entirely.',
    },
    faqs: [
      {
        question: "How much is a building permit in Bismarck?",
        answer:
          "$40.00 for a job cost to $500, then $1.85 for each additional $100 to $2,000, and five bands after that — $8.40, $6.10, $4.20, $3.40, $2.85 and $2.20 per $1,000 over printed bases running from $67.75 to $3,408.45. A commercial permit adds 20% of the permit fee as the sheet's review line. Flat rows on the trade sheet — demolition $75, moving $25, manufactured homes $150, home occupation $25, temporary use $50 — are added when the job triggers them.",
        sourceId: BISMARCK_RESIDENTIAL_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "Do a house and a store pay the same ladder?",
        answer:
          "Yes — the two sheets print numerically identical tables. The residential sheet's eight bands and the commercial sheet's eight bands carry the same bases and the same rates, verified row by row against each other, so this page runs one ladder for both classes. The sheets differ in exactly one printed price: the commercial sheet's unconditional 20% review fee, which the residential sheet does not print.",
        sourceId: BISMARCK_COMMERCIAL_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "Why does a fraction of a thousand cost a fraction of the rate?",
        answer:
          'Because neither sheet prints the round-up phrase. Fargo\'s sheets say "or fraction thereof" in every band and round up; Bismarck\'s sheets never print it, so the fraction is charged as the fraction it is: $2,500 of job cost is $67.75 plus $500\'s share of the $8.40 rate — $4.20 — for $71.95, where a whole-thousand reading would be $76.15. The phrase decides, and the phrase is absent.',
        sourceId: BISMARCK_RESIDENTIAL_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "Is plan review charged, and when?",
        answer:
          'On commercial permits, always: "A Review Fee of 20% of the permit fee will be added to all Commercial Building Permits." The sentence conditions it on nothing — not on plans, not on project type — so no fact gates it here; the class is the only switch it leaves. The residential sheet prints no review line, so a one- or two-family job pays none. There is no application fee on either sheet.',
        sourceId: BISMARCK_COMMERCIAL_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "How is a residential valuation determined?",
        answer:
          'From the sheet\'s own table: square footage at its per-square-foot rates — $165.67 for a first floor, $79.50 for a second, $25.00 a garage, $15.25 an unfinished basement, $36.75 a finished one, and the deck, shed, shop and finish rows beside them — while alterations are "the construction value based on the total bid amount of the project". This site takes the resulting number as its input; the multiplication is the applicant\'s side of the exchange.',
        sourceId: BISMARCK_RESIDENTIAL_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "Where does the review fee's percentage come from?",
        answer:
          "The permit fee the ladder computed — 20% of it, added as its own line in the breakdown. Nothing else sits in the basis: the sheets print no application fee for the percentage to have swallowed, so a $60,000 commercial alteration with a $455.45 permit fee pays exactly $91.09 of review.",
        sourceId: BISMARCK_COMMERCIAL_SCHEDULE_SOURCE_KEY,
      },
    ],
    seoTitle: "Bismarck building permit cost: one ladder, both sheets",
    seoDescription:
      "Bismarck building permit fees — the eight-band ladder both sheets print identically ($40 flat, then $1.85 per $100 and five bands to $2.20 per $1,000, prorating every fraction), the commercial 20% review fee, and the trade sheet's flat rows.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: BISMARCK_LAST_VERIFIED,
  },
  {
    jurisdictionKey: BISMARCK_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    slug: "electrical-permit-cost",
    title: "Bismarck electrical permit cost",
    intro:
      "A Bismarck electrical permit is **two fees from two governments**: a flat $25.00 from the City's trade sheet, and the North Dakota State Electrical Board's inspection fee on the job cost — $50.00 minimum up to $500, 2% of the balance above it to $20,000 (where the formula closes at exactly $440.00), then $440.00 plus one tenth of one percent of everything over. The board's table is effective July 1, 2024, and $50.00 more is owed if the wiring certificate is filed late.",
    localSummary:
      'The two halves never blur. The City\'s sheet — "Additional Permit Fees, Last Revised 1/10/2018" — prints one line, "Electrical permits $25.00", flat and unconditional, and it is the base of every electrical total here. Everything else on the page belongs to the state board: the job-cost bands, the basis, the exclusions and the late-certificate increase, each a state_surcharge in the breakdown because that is what they are.\n\nThe board\'s arithmetic closes on itself: $50.00 for the first $500.00 plus 2% of the balance reaches $440.00 at a job cost of $20,000 — the figure the second band prints as its own base — and above that one tenth of one percent runs on the balance. The basis is "the total amount of the contract or total cost to the owner, including extras", and four things are left out of it: appliances, HVAC units, electric motors, PLCs, generators and industrial machines "need not be included in the cost". The table prints no round-up phrase, so both rates are prorated.\n\nWhat the state charges, the state dates: the board\'s page prints "Effective July 1, 2024" above the current table with the superseded one beneath it, and this page charges the dated figures — $50.00 more for a wiring certificate filed late, its own gated line.',
    notIncluded:
      "This is the City's $25 permit plus the state board's inspection fee — the whole of what an electrical permit in Bismarck costs. It excludes:\n\n- **The four exclusions the board lists.** Appliances, HVAC units, electric motors, PLCs, generators and industrial machines \"need not be included in the cost\" — they come out of the job cost before either band computes.\n- **The correction-order administration charge.** A correction order not completed in time is a $50.00 administration charge under the board's rules; it needs a correction order this calculator does not collect, and it is quoted beside the bands.\n- **Special services and mileage.** The board charges $50.00 per hour plus mileage — priced by hours, quoted rather than charged.\n- **Mechanical, plumbing and building permits.** Separate permits with separate pages; the trade sheet prices each apart, and none of them is in this total.\n- **License, rental and administrative charges** outside the permit sheets — not permitting, and not charged.",
    workedExample: {
      scenario:
        "A kitchen remodel whose work the inspector values at $10,500 of contract cost — the City's permit and the board's first band.",
      inputs: {
        valuationCents: 1_050_000,
        custom: {},
      },
      notes:
        'The City\'s line first: "Electrical permits — $25.00", flat, on every electrical permit.\n\nThe board\'s first band answers on the job cost: "$500.00 to $20,000.00 — $50.00 for the first $500.00 plus 2% on balance up to $20,000.00". The balance is $10,500 − $500 = $10,000, and 2% of $10,000 is $200.00 — so $50.00 + $200.00 = $250.00 of state fee.\n\nTotal: $25.00 + $250.00 = $275.00. What moves it: at $500.00 and below the balance is nothing and the $50.00 minimum is the whole state fee; at $20,000.00 the same formula closes at exactly $440.00, the base the second band prints; above that one tenth of one percent runs, so a $40,000 job cost is $440.00 plus 0.1% of $20,000, or $460.00 — plus the City\'s $25.00. A wiring certificate filed late adds $50.00 more, and the board\'s four exclusions come out of the job cost before any of it computes.',
    },
    faqs: [
      {
        question: "How much is an electrical permit in Bismarck?",
        answer:
          "$275.00 on a $10,500 job: $25.00 flat from the City, plus the state board's $50.00 minimum and 2% of the balance above $500. In general the City's share is always $25.00 and the board's share is $50.00 up to $500 of job cost, then 2% of the balance to $20,000 (closing at $440.00), then $440.00 plus one tenth of one percent — with $50.00 more for a late wiring certificate.",
        sourceId: BISMARCK_TRADE_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "Why is part of the fee a state charge?",
        answer:
          "Because the North Dakota State Electrical Board sets the inspection fee, and the City's sheet prints nothing else: \"Electrical permits $25.00\" is the City's entire published line. The board bills the installer on the job cost under its own table, effective July 1, 2024 — so the breakdown labels the board's lines as state surcharges, which is what they are, and the City's $25.00 stands beside them as the base.",
        sourceId: BISMARCK_NDSEB_SOURCE_KEY,
      },
      {
        question: "What is the job cost measured from?",
        answer:
          "The board's own basis: \"the total amount of the contract or total cost to the owner, including extras\". Four things stay out of it — appliances, HVAC units, electric motors, PLCs, generators and industrial machines \"need not be included in the cost\" — and the exclusions move only the state line, since the City's $25.00 reads no cost at all.",
        sourceId: BISMARCK_NDSEB_SOURCE_KEY,
      },
      {
        question: "What does a late wiring certificate cost?",
        answer:
          "$50.00 more. The board's rule: an installation \"commenced or in use without submitting an electrical wiring certificate\" may have the certificate considered late, and then \"the normal inspection fee … is increased in the amount of fifty dollars.\" It is charged as its own state line when the filing is late.",
        sourceId: BISMARCK_NDSEB_SOURCE_KEY,
      },
      {
        question: "Does the fee round up to a whole thousand?",
        answer:
          "No — the state table prints no round-up phrase anywhere, so 2% and one tenth of one percent charge the balance as the fraction it is. The distinction matters at the seams: the first band's formula reaches exactly $440.00 at $20,000 of job cost, which is the base the second band prints — the table closes on itself without any rounding to close it.",
        sourceId: BISMARCK_NDSEB_SOURCE_KEY,
      },
    ],
    seoTitle: "Bismarck electrical permit cost: $25 plus the state fee",
    seoDescription:
      "Bismarck electrical permit fees — the City's flat $25 permit plus NDSEB's inspection fee: $50 minimum to $500 of job cost, 2% of the balance to $20,000 (closing at $440), then $440 plus 1/10 of 1%, with $50 for a late wiring certificate.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: BISMARCK_LAST_VERIFIED,
  },
  {
    jurisdictionKey: BISMARCK_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    slug: "plumbing-permit-cost",
    title: "Bismarck plumbing permit cost",
    intro:
      "A Bismarck plumbing permit is a **four-band ladder on the total cost of job**: $40.00 flat to $2,000, then $1.65 for each additional $1,000 to $20,000, then $1.10 to $100,000, then $0.60 above — over printed bases of $40.00, $69.70 and $157.70. Every band prorates, because the sheet prints no round-up phrase, and Septic/Drainfield work is its own $75.00 row beside the ladder.",
    localSummary:
      'The trade sheet ("Last Revised 1/10/2018") prices plumbing the way the building sheets price construction — on the total cost of job — through four bands with the same shape as the building ladder and plumbing\'s own figures. It closes the way the building ladder closes: $40.00 + 18 × $1.65 is exactly $69.70 at $20,000, and $69.70 + 80 × $1.10 is exactly $157.70 at $100,000, each closing figure the next band\'s printed base.\n\nProration is the reading, and it is the phrase that decides it: no band says "or fraction thereof", so a fraction of a $1,000 step is charged as the fraction it is — $2,500 of plumbing cost is $40.00 plus $500\'s share of the $1.65 rate rather than a whole rounded step. The contrast is two states east: Fargo\'s sheets print the phrase in every band and round up; Bismarck\'s never print it and never round.\n\nThe sheet\'s other rows sit beside the ladder rather than inside it: Septic/Drainfield is $75.00 on its own fact, and the mechanical/HVAC ladder printed with figures identical to plumbing\'s is a separate permit — quoted on this page rather than attached to a mechanical page this site does not publish. The record keeps open whether those identical figures are policy or a copied table; either way, no mechanical number enters a total here.',
    notIncluded:
      "This is the Bismarck plumbing permit fee — the four-band ladder and the septic row. It excludes:\n\n- **Mechanical/HVAC permits.** The trade sheet prices them by a ladder whose figures are identical to plumbing's in every band; it is a separate permit, quoted on this page rather than charged, because this site publishes no mechanical page.\n- **The building and electrical permits beside it.** Separate permits on their own pages — the trade sheet prices each apart, and this total adds neither.\n- **The hub's 2020 date.** The Permit Fees page says \"Effective January 1, 2020\" while its own anchors carry the sheets' revision lines; the dated sheet wins and the disagreement is kept.\n- **A round-up that does not exist.** No band prints \"or fraction thereof\", so nothing here is rounded to a whole $1,000 — an absence stated rather than silently filled.\n- **License, rental and administrative charges** outside the permit sheets — not permitting, and not charged.",
    workedExample: {
      scenario: "A $30,000 plumbing job — the trade sheet's third band.",
      inputs: {
        valuationCents: 3_000_000,
        custom: {},
      },
      notes:
        'The third band prices it: "$20,001.00 to $100,000.00 — $69.70 for first $20,000.00 PLUS $1.10 for each additional $1,000.00".\n\n$30,000 of job cost is $10,000 above the band\'s floor, charged as the fraction it is: $10,000 × $1.10 per $1,000 = $11.00. Permit fee: $69.70 + $11.00 = $80.70.\n\nTotal: $80.70. What moves it: $2,500 of job cost computes $40.83 — $40.00 plus $500\'s share of the $1.65 rate — where a whole-$1,000 reading would be $41.65; the ladder closes at $20,000 ($69.70) and $100,000 ($157.70) exactly; septic/drainfield work adds its own flat $75.00 row beside the ladder; and the trade sheet\'s mechanical ladder, printed with identical figures, is a separate permit this page quotes rather than charges.',
    },
    faqs: [
      {
        question: "How much is a plumbing permit in Bismarck?",
        answer:
          "$40.00 for a job cost to $2,000, then $1.65 for each additional $1,000 to $20,000, then $1.10 to $100,000, then $0.60 above — over printed bases of $40.00, $69.70 and $157.70. Septic/drainfield work is a separate flat $75.00 row when the job has it.",
        sourceId: BISMARCK_TRADE_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "Does the job's cost change the plumbing fee?",
        answer:
          "Yes — plumbing is priced on the total cost of job, the same measure the building sheets use, through four bands of its own. What it never does is round: no band prints \"or fraction thereof\", so $2,500 of plumbing cost is $40.00 plus $500's share of the $1.65 rate rather than a whole rounded step.",
        sourceId: BISMARCK_TRADE_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "How does the septic permit get charged?",
        answer:
          'As its own row: the trade sheet lists "Septic/Drainfield — $75.00" beside the plumbing ladder, a flat price for the permit rather than a band of the job cost. It answers its own fact, and a job that both runs plumbing work and touches the septic system carries the ladder and this row together.',
        sourceId: BISMARCK_TRADE_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "Is a mechanical or HVAC permit included?",
        answer:
          "No. The trade sheet prints a mechanical/HVAC ladder whose figures are identical to plumbing's in every band, but it is a separate permit — quoted on this page rather than charged, because this site publishes building, electrical and plumbing pages only. Whether the identical figures are deliberate policy or a copied table is not stated anywhere on the sheet, and the record says so.",
        sourceId: BISMARCK_TRADE_SCHEDULE_SOURCE_KEY,
      },
      {
        question: "Do the bands connect at their seams?",
        answer:
          "Exactly, and the sheet was built to: $40.00 + 18 × $1.65 is $69.70 at $20,000 — the base the third band prints — and $69.70 + 80 × $1.10 is $157.70 at $100,000, the base the fourth prints. Each closing figure is the next band's printed base, and the tests walk both seams.",
        sourceId: BISMARCK_TRADE_SCHEDULE_SOURCE_KEY,
      },
    ],
    seoTitle: "Bismarck plumbing permit cost: four bands on job cost",
    seoDescription:
      "Bismarck plumbing permit fees — $40 flat to $2,000, then $1.65, $1.10 and $0.60 per $1,000 over bases of $40.00, $69.70 and $157.70, prorating every fraction, plus the $75 septic/drainfield row.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: BISMARCK_LAST_VERIFIED,
  },
];

const verifications: SeedVerification[] = [
  {
    entityType: "source",
    entityKey: BISMARCK_RESIDENTIAL_SCHEDULE_SOURCE_KEY,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: BISMARCK_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BISMARCK_RESIDENTIAL_SCHEDULE_SOURCE_KEY,
    notes:
      'Read 2026-09-25 as the Division\'s PDF printed "Last Revised 1/01/25". Transcribed: all eight bands of the multiplier table, the eleven-row area valuation table, and the valuation instructions — with the "$50,0001.00" typo recorded and read as $50,001.00 because the band\'s own base confirms it.',
  },
  {
    entityType: "source",
    entityKey: BISMARCK_COMMERCIAL_SCHEDULE_SOURCE_KEY,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: BISMARCK_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BISMARCK_COMMERCIAL_SCHEDULE_SOURCE_KEY,
    notes:
      'Read 2026-09-25 as the Division\'s PDF printed "Last Revised 1/10/2018". Transcribed: the eight bands — checked row by row against the residential sheet\'s to confirm the two tables are the same table — and the unconditional review-fee sentence, with the "$$4.20" typo recorded and read as $4.20 because the next seam closes on it.',
  },
  {
    entityType: "source",
    entityKey: BISMARCK_TRADE_SCHEDULE_SOURCE_KEY,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: BISMARCK_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BISMARCK_TRADE_SCHEDULE_SOURCE_KEY,
    notes:
      'Read 2026-09-25 as the Division\'s PDF printed "Last Revised 1/10/2018". Transcribed: plumbing\'s four bands, the mechanical ladder printed beside them with identical figures, the $25 electrical line, septic\'s $75, and all five building-shaped flat rows — split across the three pages by what each row permits (reading f).',
  },
  {
    entityType: "source",
    entityKey: BISMARCK_HUB_SOURCE_KEY,
    status: "verified",
    method: "manual_review",
    verifiedAt: BISMARCK_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BISMARCK_HUB_SOURCE_KEY,
    notes:
      'Read 2026-09-25 as the index linking every sheet. Its "Permit Fees Effective January 1, 2020" sentence is recorded against its own residential anchor, which points at the 2025 revision — the dated sheet wins and the stale sentence is kept, as Buffalo\'s hub date is.',
  },
  {
    entityType: "source",
    entityKey: BISMARCK_TITLE4_SOURCE_KEY,
    status: "verified",
    method: "manual_review",
    verifiedAt: BISMARCK_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BISMARCK_TITLE4_SOURCE_KEY,
    notes:
      "Read 2026-09-25, HTTP 200: the City's building ordinance, cited for jurisdiction context only — the three fee sheets are the operative price list and no figure here comes from Title 4.",
  },
  {
    entityType: "source",
    entityKey: BISMARCK_NDSEB_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: BISMARCK_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BISMARCK_NDSEB_SOURCE_KEY,
    notes:
      'Read 2026-09-25: the board\'s page printing "Effective July 1, 2024" above the current table with the superseded table beneath it. Both job-cost bands, the basis sentence, the four exclusions and the $50 late-certificate increase transcribed; the superseded figures ignored in favour of the dated ones the page leads with.',
  },
  {
    entityType: "fee_schedule",
    entityKey: BISMARCK_KEYS.residentialSchedule,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: BISMARCK_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BISMARCK_RESIDENTIAL_SCHEDULE_SOURCE_KEY,
    notes:
      'The schedule row carries the sheet\'s own "Last Revised 1/01/25" as 2025-01-01 — the later of the two building sheets, which is why the shared ladder attaches here rather than to the 2018 commercial copy of the same table.',
  },
  {
    entityType: "fee_schedule",
    entityKey: BISMARCK_KEYS.commercialSchedule,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: BISMARCK_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BISMARCK_COMMERCIAL_SCHEDULE_SOURCE_KEY,
    notes:
      'The schedule row carries 2018-01-10 as printed. Its bands are the residential sheet\'s bands — the identity is the reading this jurisdiction depends on — and its one unique rule, the unconditional review fee, attaches here.',
  },
  {
    entityType: "fee_schedule",
    entityKey: BISMARCK_KEYS.tradeSchedule,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: BISMARCK_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BISMARCK_TRADE_SCHEDULE_SOURCE_KEY,
    notes:
      'The schedule row carries 2018-01-10 as printed, and holds the rows three pages draw from: plumbing\'s ladder and septic for plumbing, the $25 permit for electrical, and the five flat rows for building.',
  },
  {
    entityType: "fee_schedule",
    entityKey: BISMARCK_KEYS.electricalSchedule,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: BISMARCK_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BISMARCK_NDSEB_SOURCE_KEY,
    notes:
      'The schedule row carries the board\'s "Effective July 1, 2024" date — its own instrument, held beside the City\'s trade sheet because the electrical total is built from both governments\' figures.',
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-LADDER-2001-25000",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: BISMARCK_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BISMARCK_RESIDENTIAL_SCHEDULE_SOURCE_KEY,
    notes:
      '"$2,001 to $25,000.00 — $67.75 for first $2,000.00 PLUS $8.40 for each additional $1000.00" — the band that pins the proration reading: $2,500 computes $71.95 ($67.75 + $4.20), asserted beside Fargo\'s round-up as the pair of readings the phrase decides, with no increment on the rule because no band prints "or fraction thereof". Its endpoint, $260.95, is the next band\'s printed base — one of the six seams the tests walk.',
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-REVIEW-20",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: BISMARCK_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BISMARCK_COMMERCIAL_SCHEDULE_SOURCE_KEY,
    notes:
      '"A Review Fee of 20% of the permit fee will be added to all Commercial Building Permits." Gated only by the class — the sentence conditions it on nothing, so no plan-review fact exists on this jurisdiction\'s rules — and it reads permit_fee, which no application fee sits inside, because neither sheet prints one. The residential sheet\'s silence keeps the rule commercial-only.',
  },
  {
    entityType: "fee_rule",
    entityKey: "ELEC-NDSEB-UP-TO-20000",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: BISMARCK_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BISMARCK_NDSEB_SOURCE_KEY,
    notes:
      '"$500.00 to $20,000.00 — $50.00 for the first $500.00 plus 2% on balance up to $20,000.00", holding the printed minimum row in the same rule — below $500 the threshold charges nothing and the $50 base is the fee — and closing at exactly $440.00 at $20,000, the base the band above prints. Gated as a negated greater-than so a calculation with no valuation still reaches the rule and asks for the input instead of dropping out silently.',
  },
  {
    entityType: "fee_rule",
    entityKey: "PLUMB-LADDER-2001-20000",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: BISMARCK_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BISMARCK_TRADE_SCHEDULE_SOURCE_KEY,
    notes:
      '"$2,001.00 to $20,000.00 — $40.00 for first $2,000.00 PLUS $1.65 for each additional $1,000.00" — plumbing\'s own figures on the building ladder\'s shape, prorated like every band on the sheet, seamed at $20,000 where $40.00 + 18 × $1.65 is exactly $69.70, the next band\'s base. The sheet\'s mechanical ladder prints identical figures; it is quoted as a separate permit rather than modelled.',
  },
  {
    entityType: "permit_page",
    entityKey: "building-permit-cost",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: BISMARCK_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BISMARCK_RESIDENTIAL_SCHEDULE_SOURCE_KEY,
    notes:
      "Gate-checked 2026-09-25: both building sheets read in full and their tables checked against each other — eight identical bands, the review-fee sentence on one sheet only, the area table and valuation instructions, both printed typos recorded — and the page's worked example computes $546.54 from the sheet's own band arithmetic.",
  },
  {
    entityType: "permit_page",
    entityKey: "electrical-permit-cost",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: BISMARCK_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BISMARCK_NDSEB_SOURCE_KEY,
    notes:
      "Gate-checked 2026-09-25: the City's flat $25 line from the trade sheet, both NDSEB bands with their basis, exclusions and $440 seam, and the late-certificate increase — the page states which government charges each line, and the worked example computes $275.00 from both.",
  },
  {
    entityType: "permit_page",
    entityKey: "plumbing-permit-cost",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: BISMARCK_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BISMARCK_TRADE_SCHEDULE_SOURCE_KEY,
    notes:
      "Gate-checked 2026-09-25 against the trade sheet: all four plumbing bands with their two closing seams, the septic row, the proration reading with no round-up phrase anywhere, and the mechanical ladder quoted as a separate permit rather than charged. The worked example computes $80.70 from the third band.",
  },
  {
    entityType: "jurisdiction_profile",
    entityKey: BISMARCK_KEYS.jurisdiction,
    status: "verified",
    method: "manual_review",
    verifiedAt: BISMARCK_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: BISMARCK_HUB_SOURCE_KEY,
    notes:
      "The profile states the readings the model depends on — one ladder printed on both sheets, prorated because no band prints the round-up phrase, with the class switch doing only the review fee — and keeps both document facts a reader would trip on: the hub's 2020 sentence against its own 2025 link, and the two printed typos read as the figures their arithmetic confirms.",
  },
];

export const bismarckSeed: JurisdictionSeed = {
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
export const BISMARCK_PUBLISHED_PERMIT_PAGES = bismarckSeed.permitPages.filter(
  (page) => page.publishStatus === "published" && !page.noindex,
);
