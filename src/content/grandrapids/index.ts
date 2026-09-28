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
  GR_CALCULATOR_SOURCE_KEY,
  GR_BUILDING_RULES,
  GR_ELECTRICAL_RULES,
  GR_FEE_EFFECTIVE_FROM,
  GR_FEE_SCHEDULE_SOURCE_KEY,
  GR_PERMITS_SOURCE_KEY,
  GR_PLUMBING_RULES,
  GR_RESIDENTIAL_PERMITS_SOURCE_KEY,
  GR_TRADE_PERMITS_SOURCE_KEY,
} from "./fee-rules";

export * from "./fee-rules";

/**
 * The complete Grand Rapids, Michigan seed payload.
 *
 * Every figure traces to research/michigan/grand-rapids.md, which traces to
 * the City's FY 2027 fee schedule (effective July 1, 2026) — read in three
 * pdftotext modes because -layout mispairs rows in this document, with -table
 * and -raw agreeing on every disputed row — its 500-row building permit fee
 * chart (extracted programmatically and checked against four formulas, all
 * matching), and the fee page's own calculator, whose arithmetic is inline
 * JavaScript on the page.
 *
 * Three pages: building, electrical and plumbing. Building is a four-component
 * stack — $54 application, $6.80 per each additional $1,000, a commercial-only
 * plan review floored at $50 in whole dollars, and a zoning fee that is $25
 * flat residential and a sliding 10% between $25 and $290 commercial — where
 * two components are percentages of the fee itself. That is the opposite of
 * Detroit's nine-band ladder in the same state: one city prices a percentage
 * of money, the other prices percentages of its own fee.
 */

const RESEARCHER = "Permit Fee Intelligence research pass 15 (Michigan)";

export const GR_LAST_VERIFIED = "2026-09-25";

export const GR_KEYS = {
  state: "mi",
  county: "kent-county",
  jurisdiction: "grandrapids",
  feeSchedule: "grandrapids-pdd-fee-schedule-fy2027",
} as const;

const state: SeedState = {
  code: "MI",
  slug: "michigan",
  name: "Michigan",
  fipsCode: "26",
};

const county: SeedCounty = {
  key: GR_KEYS.county,
  slug: "kent-county",
  name: "Kent County",
  fipsCode: "26081",
};

const jurisdiction: SeedJurisdiction = {
  key: GR_KEYS.jurisdiction,
  stateKey: GR_KEYS.state,
  countyKey: GR_KEYS.county,
  type: "city",
  slug: "grandrapids",
  name: "Grand Rapids",
  officialName: "City of Grand Rapids",
  websiteUrl: "https://www.grandrapidsmi.gov/",
  permitPortalUrl: "https://aca-prod.accela.com/GRANDRAPIDS",
  timezone: "America/Detroit",
  isActive: true,
};

const departments: SeedDepartment[] = [
  {
    key: "grandrapids-development-center",
    jurisdictionKey: GR_KEYS.jurisdiction,
    kind: "building",
    name:
      "Planning, Design and Development Department — Building Inspections Division (Development Center)",
    phone: "(616) 456-4100",
    email: "devcenter@grcity.us",
    url: "https://www.grandrapidsmi.gov/grow-and-thrive/development-center/",
    addressLine: "1120 Monroe Ave. NW, 3rd Floor, Grand Rapids, MI 49503",
    hours: "Mon–Fri 7:30 AM – 4 PM",
    notes:
      "The Development Center takes every building and trade application; its Building Inspections Division prints the \"CONSTRUCTION CODE ADMINISTRATION FEES\" schedule this site charges from, and its Planning Division prints the separate schedule of zoning and land-use fees. Applications and payment run through Accela Citizen Access at https://aca-prod.accela.com/GRANDRAPIDS, with plans through the City's ePlan Room (a \"Citizen Access Guide\" and \"ePlan Room Guide\" sit beside the portal link on every Development Center page). Fax 616-456-4088. New development involving excavating, grading or paving is filed through the LUDS program, which combines \"your review and permit fee for one simple payment\".",
  },
];

const sources: SeedSource[] = [
  {
    key: GR_FEE_SCHEDULE_SOURCE_KEY,
    jurisdictionKey: GR_KEYS.jurisdiction,
    title:
      "Planning, Design and Development Fee Schedule, FY 2027 (effective July 1, 2026)",
    url: "https://media-002-us.cdn.govstack.com/grandrapidsmi-us/media/4lzl0erl/planning-design-and-development-fee-schedule-fy2027.pdf",
    sourceType: "fee_schedule_pdf",
    issuingAuthority:
      "City of Grand Rapids, Planning, Design and Development Department",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2026-07-01",
    effectiveFrom: GR_FEE_EFFECTIVE_FROM,
    retrievedAt: GR_LAST_VERIFIED,
    lastVerifiedAt: GR_LAST_VERIFIED,
    notes:
      "Read 2026-09-25 in three pdftotext modes: -layout mispairs rows in this document (it drops the $4.00 of \"Alternative Power, ea. add'l 1 KW\" and shifts every electrical row below it, ending in orphan amounts with no label), while -table and -raw agree on every disputed row — their pairing is the one recorded. Building division fees (permits, administrative, electrical, mechanical, plumbing), the Planning Division's own schedule, the building-use group classifications, and the BUILDING PERMIT FEE CHART: 500 rows keyed by $1,000 value ranges from $1 to $501,000, each printing App Fee, Com Plan Review, Permit Fee, both Zoning columns and both Totals. Every chart row was extracted and checked against four formulas — all matching.",
  },
  {
    key: GR_CALCULATOR_SOURCE_KEY,
    jurisdictionKey: GR_KEYS.jurisdiction,
    title: "Grand Rapids Building Permit Fee Calculator",
    url: "https://www.grandrapidsmi.gov/grow-and-thrive/development-center/building-permit-fees/",
    sourceType: "official_calculator",
    issuingAuthority: "City of Grand Rapids, Development Center",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: GR_LAST_VERIFIED,
    lastVerifiedAt: GR_LAST_VERIFIED,
    notes:
      "Read 2026-09-25 (HTTP 200). Links the fee schedule as \"a full list of fees\" and carries the City's own arithmetic as inline JavaScript: the four result lines (Building Application Fee, Permit Fee, Plan Review Fee, Zoning Fee), the constants revMin 50 / zoneMin 25 / zoneMax 290 / residentialZoneCap 25, units = floor((value − 1000)/1000), baselinePermitFee = units * 6.8, floor(0.68 * units) for zoning and plan review, and three project-type branches (standard / roofSiding / deckPool). Also states the occupancy split — \"Residential projects include only single-family homes or duplexes. For projects with three or more residential units, please select commercial.\" — and disclaims \"This estimate does not include trade, planning, or land use develoment permit fees\" [sic]. Where its arithmetic and the chart's differ (zoning formula, rounding of the partial thousand) the chart is what is charged.",
  },
  {
    key: GR_PERMITS_SOURCE_KEY,
    jurisdictionKey: GR_KEYS.jurisdiction,
    title: "Permits — City of Grand Rapids",
    url: "https://www.grandrapidsmi.gov/grow-and-thrive/development-center/permits/",
    sourceType: "municipal_website",
    issuingAuthority: "City of Grand Rapids, Development Center",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: GR_LAST_VERIFIED,
    lastVerifiedAt: GR_LAST_VERIFIED,
    notes:
      "Read 2026-09-25 (HTTP 200). The permit taxonomy — residential building permits are single-family and duplex, commercial building and multiplex permits are \"Commercial, Industrial, Multi-family (3 or more) Projects\", trade permits are \"Applications for mechanical, electrical, and plumbing permits\" — plus the portal link (https://aca-prod.accela.com/GRANDRAPIDS) and the Development Center contact block quoted on the profile.",
  },
  {
    key: GR_TRADE_PERMITS_SOURCE_KEY,
    jurisdictionKey: GR_KEYS.jurisdiction,
    title: "Trade Permits — City of Grand Rapids",
    url: "https://www.grandrapidsmi.gov/grow-and-thrive/development-center/permits/trade-permits/",
    sourceType: "municipal_website",
    issuingAuthority: "City of Grand Rapids, Development Center",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: GR_LAST_VERIFIED,
    lastVerifiedAt: GR_LAST_VERIFIED,
    notes:
      "Read 2026-09-25 (HTTP 200). Nine trade-permit cards: commercial and residential electrical, mechanical and plumbing, plus Mechanical CO₂, Mechanical Sprinkler and Electrical Fire Alarm permits. The electrical card frames the permit by code — work \"under the Michigan Electrical Code or Michigan Residential Code\" — and the plumbing card routes new development involving excavating, grading or paving to LUDS. Several card descriptions are visibly copy-paste mismatches (the LUDS paragraph sits on the residential electrical and plumbing cards); recorded, never quoted for a figure.",
  },
  {
    key: GR_RESIDENTIAL_PERMITS_SOURCE_KEY,
    jurisdictionKey: GR_KEYS.jurisdiction,
    title: "Residential Building Permits — City of Grand Rapids",
    url: "https://www.grandrapidsmi.gov/grow-and-thrive/development-center/permits/residential-building-permits/",
    sourceType: "municipal_website",
    issuingAuthority: "City of Grand Rapids, Development Center",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: GR_LAST_VERIFIED,
    lastVerifiedAt: GR_LAST_VERIFIED,
    notes:
      "Read 2026-09-25 (HTTP 200). The filing rule — \"To apply, you must be either the property owner or a licensed contractor\" — the full application list (new/addition, remodel, ADU, accessory structure, re-roof/re-side, demolition, temporary occupancy, the three trade applications, water/sewer connection, deck, driveway, fence, pool, change of use), and the LUDS trigger: \"A LUDS site plan review is required on single-family or duplex properties when the parcel is within 500 feet of a body of water or wetland.\"",
  },
];

/** Empty on purpose: the permit types Grand Rapids uses already exist as shared rows. */
const permitTypes: JurisdictionSeed["permitTypes"] = [];
const projectTypes: JurisdictionSeed["projectTypes"] = [];

const jurisdictionPermitTypes: SeedJurisdictionPermitType[] = [
  {
    jurisdictionKey: GR_KEYS.jurisdiction,
    permitTypeKey: "building",
    isAvailable: true,
    localName: "Building permit",
    officialUrl:
      "https://www.grandrapidsmi.gov/grow-and-thrive/development-center/building-permit-fees/",
    notes:
      "Four components, two of them percentages of the fee itself: $54 application, $6.80 per each additional $1,000 after the first (rounding the partial thousand up, as the chart's rows do), commercial-only plan review at max($50, floor(units × $0.68)) in whole dollars, and the zoning fee — $25 flat residential, 10% of application + permit clamped $25–$290 commercial. The City's chart prints all four across 500 value ranges; its calculator reproduces the same arithmetic with two differences that are named, not adopted.",
  },
  {
    jurisdictionKey: GR_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    isAvailable: true,
    localName: "Electrical permit",
    officialUrl:
      "https://www.grandrapidsmi.gov/grow-and-thrive/development-center/permits/trade-permits/",
    notes:
      "A $52 application that includes one inspection, plus one of four amperage bands — $17 up to 200 A, $31 to 600 A, $63 to 1,000 A, $105 over — keyed on custom.amperage. The schedule's remaining rows (fire alarm, branch circuits, appliances, motors, the $210 new-single-family-home row) are named on the page and not modelled. Filed under the Michigan Electrical Code or Michigan Residential Code.",
  },
  {
    jurisdictionKey: GR_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    isAvailable: true,
    localName: "Plumbing permit",
    officialUrl:
      "https://www.grandrapidsmi.gov/grow-and-thrive/development-center/permits/trade-permits/",
    notes:
      "A $52 application that includes one inspection, $5 for each of the schedule's twenty-eight listed items, $21 for a water heater, and one of six water-distribution rows by pipe size ($6 to $36) keyed on custom.water_distribution. Medical gas zones ($52) and gas piping ($5 an opening) are named, not modelled.",
  },
];

const feeSchedules: SeedFeeSchedule[] = [
  {
    key: GR_KEYS.feeSchedule,
    jurisdictionKey: GR_KEYS.jurisdiction,
    sourceKey: GR_FEE_SCHEDULE_SOURCE_KEY,
    title:
      "City of Grand Rapids Planning, Design and Development Fee Schedule (FY 2027, effective July 1, 2026)",
    officialUrl:
      "https://media-002-us.cdn.govstack.com/grandrapidsmi-us/media/4lzl0erl/planning-design-and-development-fee-schedule-fy2027.pdf",
    effectiveFrom: GR_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: GR_LAST_VERIFIED,
    notes:
      "Every page is headed \"CONSTRUCTION CODE ADMINISTRATION FEES - EFFECTIVE JULY 1, 2026\" and the document is titled \"FY 2027\"; read 2026-09-25, three months into force. The fee page links it as \"a full list of fees\". Its BUILDING PERMIT FEE CHART (500 rows) is the arithmetic this site implements; the City's calculator agrees with it everywhere except the commercial zoning formula and the rounding of the partial thousand, where the chart wins.",
  },
];

function attach(permitTypeKey: string, rules: SeedFeeRule["rule"][]): SeedFeeRule[] {
  return rules.map((rule) => ({
    jurisdictionKey: GR_KEYS.jurisdiction,
    permitTypeKey,
    scheduleKey: GR_KEYS.feeSchedule,
    rule,
  }));
}

const feeRules: SeedFeeRule[] = [
  ...attach("building", GR_BUILDING_RULES),
  ...attach("electrical", GR_ELECTRICAL_RULES),
  ...attach("plumbing", GR_PLUMBING_RULES),
];

const requirements: SeedRequirement[] = [
  {
    jurisdictionKey: GR_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "document",
    title: "One application through Accela Citizen Access, with plans in the ePlan Room",
    description:
      "Every Development Center page links the same two tools beside the fee schedule: the \"Citizen Access Application Portal\" (https://aca-prod.accela.com/GRANDRAPIDS), where the application and payment happen, and the ePlan Room for plan submission, each with its own guide. The fee calculator lives on the fee page itself, so the estimate precedes the application rather than replacing it.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: GR_PERMITS_SOURCE_KEY,
    lastVerifiedAt: GR_LAST_VERIFIED,
  },
  {
    jurisdictionKey: GR_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "license",
    title: "The property owner or a licensed contractor",
    description:
      "The residential building permits page states the rule for every residential application: \"To apply, you must be either the property owner or a licensed contractor. Please note that multiple permits may be required depending on the scope of your work.\" Trade work is its own application on top of the building permit, which is what makes the electrical and plumbing pages here separate estimates rather than lines of one.",
    isMandatory: true,
    sortOrder: 20,
    sourceKey: GR_RESIDENTIAL_PERMITS_SOURCE_KEY,
    lastVerifiedAt: GR_LAST_VERIFIED,
  },
  {
    jurisdictionKey: GR_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "zoning_review",
    title: "Residential means single-family or duplex — three or more units take the commercial path",
    description:
      "The fee calculator states the classification the chart's two Total columns turn on: \"Residential projects include only single-family homes or duplexes. For projects with three or more residential units, please select commercial.\" So a triplex is priced with plan review and the sliding zoning fee even though it is housing, and the split is about the building's unit count rather than its use.",
    isMandatory: true,
    sortOrder: 30,
    sourceKey: GR_CALCULATOR_SOURCE_KEY,
    lastVerifiedAt: GR_LAST_VERIFIED,
  },
  {
    jurisdictionKey: GR_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "zoning_review",
    title: "LUDS site plan review near water, and a zoning fee on every permit",
    description:
      "\"A LUDS site plan review is required on single-family or duplex properties when the parcel is within 500 feet of a body of water or wetland\" — and the trade pages add that new development involving excavating, grading or paving files through LUDS, whose \"single application with a coordinated review process\" combines \"your review and permit fee for one simple payment\". The $25 / sliding-scale zoning fee modelled here is the permit's own zoning line, not the LUDS review.",
    isMandatory: false,
    sortOrder: 40,
    sourceKey: GR_RESIDENTIAL_PERMITS_SOURCE_KEY,
    lastVerifiedAt: GR_LAST_VERIFIED,
  },
  {
    jurisdictionKey: GR_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "license",
    title: "An electrical permit under the Michigan Electrical Code or Michigan Residential Code",
    description:
      "The trade permits page: an electrical permit is needed for work \"under the Michigan Electrical Code or Michigan Residential Code\", and the page separates commercial and residential electrical into their own applications — the same single-family/duplex line the fee page draws. Filed by the property owner or a licensed contractor through the Accela portal.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: GR_TRADE_PERMITS_SOURCE_KEY,
    lastVerifiedAt: GR_LAST_VERIFIED,
  },
  {
    jurisdictionKey: GR_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "inspection",
    title: "One inspection is included in the application; each additional one is $42",
    description:
      "The schedule's own row names the allowance — \"Application (Includes 1 inspection) — $52.00\" — and prices what exceeds it on the next line: \"Additional Inspection — $42.00\". So the first visit after the permit is already paid for, and the re-inspection economics are stated by the schedule rather than left to a visit fee nobody published.",
    isMandatory: true,
    sortOrder: 20,
    sourceKey: GR_FEE_SCHEDULE_SOURCE_KEY,
    lastVerifiedAt: GR_LAST_VERIFIED,
  },
  {
    jurisdictionKey: GR_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    requirementType: "license",
    title: "Residential and commercial plumbing permits are separate applications",
    description:
      "The trade permits page carries a card for each — \"Residential Plumbing Permit\" and \"Commercial Plumbing Permit\" — and routes new development involving excavating, grading or paving to the LUDS program's single coordinated application. The residential application list includes its own \"Plumbing - Residential Application\" for work on a single-family or duplex home, filed by the owner or a licensed contractor.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: GR_TRADE_PERMITS_SOURCE_KEY,
    lastVerifiedAt: GR_LAST_VERIFIED,
  },
  {
    jurisdictionKey: GR_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    requirementType: "inspection",
    title: "One inspection is included in the $52 application",
    description:
      "\"Application (Includes 1 inspection) — City Code, Chapter 132 — $52.00\", with \"Additional Inspection — $42.00\" beside it: the plumbing application carries the same inspection allowance and the same additional-inspection price as the electrical one, because the schedule prices the three trades' applications identically.",
    isMandatory: true,
    sortOrder: 20,
    sourceKey: GR_FEE_SCHEDULE_SOURCE_KEY,
    lastVerifiedAt: GR_LAST_VERIFIED,
  },
];

const profile: SeedProfile = {
  jurisdictionKey: GR_KEYS.jurisdiction,
  headline: "What construction permits cost in Grand Rapids",
  summary:
    "Grand Rapids prices a building permit as four published components rather than one rate: a $54 application fee, $6.80 for each additional $1,000 of construction cost after the first $1,000, a plan review fee that applies to commercial projects only and floors at $50 in whole dollars, and a zoning fee — $25 flat on single-family and duplex projects, and on everything else 10% of the application-plus-permit subtotal between $25 and $290. The City's own fee chart prints all four columns across 500 value ranges from $1 to $501,000, and the calculator on the fee page reproduces the same arithmetic as inline JavaScript. Electrical and plumbing permits are $52 applications that each include one inspection, plus itemised rows: four amperage bands for a service, $5 per listed plumbing item, $21 a water heater, six water-distribution sizes.",
  localContext:
    "**One department, one counter, one portal.** The **Development Center** — the Planning, Design and Development Department's service counter — takes every building and trade application at 1120 Monroe Ave. NW, 3rd Floor (phone **616-456-4100**, devcenter@grcity.us, Mon–Fri 7:30 AM – 4 PM), and its **Building Inspections Division** prints the fee schedule this site charges from. Applications and payment run through **Accela Citizen Access** at https://aca-prod.accela.com/GRANDRAPIDS, plans go through the City's ePlan Room, and the filing rule is one sentence on the residential permits page: \"To apply, you must be either the property owner or a licensed contractor.\"\n\n**The City publishes its arithmetic twice, and both publications are readable.** The FY 2027 fee schedule carries the BUILDING PERMIT FEE CHART — 500 rows, each printing the App Fee, the Com Plan Review, the Permit Fee, both Zoning columns and both Totals — and the fee page carries the **Estimated Permit Fee Calculator as inline JavaScript**: `units = Math.floor((value - 1000) / 1000)`, `baselinePermitFee = units * 6.8`, `Math.floor(0.68 * units)` for zoning and plan review, and the constants `revMin 50`, `zoneMin 25`, `zoneMax 290`, `residentialZoneCap 25`. That is the City's own code, read as code rather than inferred from output.\n\n**Where the two disagree, the chart wins — and it disagrees twice.** The calculator rounds the partial thousand *down*, so $150,001 computes 149 units where the chart's \"$150,001 – $151,000\" row charges 150 ($1,013.20 against $1,020.00); and its zoning formula, `Math.floor(0.68 * units)`, omits the $5.40 that is 10% of the $54 application fee and floors to whole dollars, so 149 units computes $101.00 where the chart prints $106.72. The calculator is labelled an estimate; the chart is the schedule with \"City Code, Chapter 131\" printed beside each row. On plan review the two agree to the cent, which is the independent check that the chart's column is the formula rather than a transcription.\n\n**The occupancy split is a rule about the building, not the use.** \"Residential projects include only single-family homes or duplexes. For projects with three or more residential units, please select commercial.\" A triplex takes the commercial path — plan review, sliding zoning — because the count of units decides, and absent a declaration this site charges the commercial path, which is the larger figure and the one the calculator defaults toward.",
  valuationBasis:
    "**The construction value buys steps of $1,000.** The schedule's footnote defines the whole ladder: \"Base fee charged for first $1,000 of construction cost; incremental fee charged for each additional $1,000 of construction/contract cost.\" The $54 application fee is that first $1,000, and $6.80 buys each further step — with the partial step charged as a whole one, because the chart is keyed by value *ranges* and its row for \"$150,001 – $151,000\" prints 150 steps. The City's calculator rounds that remainder down instead (`floor((value − 1000)/1000)`); the chart is the schedule, so this site rounds up and records the calculator's reading.\n\n**Two of the four components are percentages of the fee itself, made whole.** Plan review is `max($50, floor(units × $0.68))` — 68 cents a thousand *in whole dollars*, $50 until units 75, $101 at 149 units, $340 at the chart's last row — modelled as the chart's own 501 printed tiers because no percentage in any engine can floor to a dollar. Commercial zoning is 10% of the application-plus-permit subtotal between $25 and $290: $25.12 first appears at 29 units, $106.72 at 149, and the $290 cap binds from 419 units where 10% first reaches $290.32. All three boundaries are the chart's own, checked on all 500 rows.\n\n**Residential zoning never moves.** The chart's residential column is $25.00 on every row, the calculator's `Math.min(baseline, 25)` can only ever be 25, and footnote 6 says \"For 1-2 family residential projects, a $25 Zoning Permit fee typically is added\" — three surfaces, one number.\n\n**Above $501,000 the chart stops.** Its last row is \"$500,001 – $501,000\" (plan review $340, zoning capped at $290, total commercial $4,084.00) and no document this pass read publishes a row beyond it; the calculator's formulas, which have no cap, imply the same arithmetic continues. This site applies the top printed row and warns rather than publishing a row the City has not.",
  notIncluded:
    "These figures are Grand Rapids's building, electrical and plumbing permit fees from the FY 2027 schedule. They are not a total project cost, and they exclude:\n\n- **The calculator's project-type branches.** The fee page's script prices *Roofing and/or Siding* at $66 residential (application and plan review waived) or $220 commercial, and *Deck and/or Pool* at $66 residential with the application waived — while the schedule's own flat rows say *Residential Deck $22.00*, *Residential Pool $15.00* (plans larger than 11x17), *Residential Re-siding $5.00* (same condition) and *Residential Re-roofing* with no amount printed at all, and the script's own comment reads \"capped at $24\" beside a constant of 25. Three disagreements between two City surfaces; named everywhere, modelled nowhere.\n- **Mechanical permits** (Chapter 134) in full — the same $52 application and $42 inspection head, then commercial items $7–$99, cfm-banded ventilation and air handlers, the ductwork ladder ($31/$42/$57/$73, then $11 per each additional $3,000 over $15,000) and residential rows $5–$52.\n- **The rest of the electrical section**: Additional Inspection $42, Admin Fee $173, Written Report / Certificates / Special Inspection $63, New Single Family Home $210 (its relationship to the itemised rows is not stated), Conduit or Grounding Only $47, Hazardous Locations \"2x Permit Fee\", Meter Set $10, Temporary Service $17, Alternative Power, fire alarm ($63 up to 10 devices + $6 each), branch circuits, the $10 appliance rows, vehicles, pools, signs, feeders and motors.\n- **The rest of the plumbing section**: Medical Gas Zones $52 and Gas Piping $5 an opening, plus the same $42 additional inspection and $173 admin fee.\n- **Change of Use ($220), demolition ($220 residential + zoning / $250 commercial + $70 sewer inspection / $331 explosives), the incomplete application ($551 + $70), Re-Review of Plans ($88 a page), Large Format Scanning (\"10% permit fee $50.00 min\"), Temporary Use, tents, re-opened permits ($189), the hourly rates ($141 administrative, $63 written report) and the whole construction-code enforcement schedule** (working without a permit $173, correction notice $165, notice of violation $260).\n- **The Planning Division's own schedule** — zoning map amendments $3,610–$5,560, special land use, site plan review, board of zoning appeals $750–$2,640, signs, historic preservation — a different division's money, on pages this site does not price.\n- **Right-of-way permits and the LUDS program** (which combines \"review and permit fee for one simple payment\"), and **water/sewer connection permits**, filed on their own application.",
  seoTitle: "Grand Rapids MI construction permit fees",
  seoDescription:
    "How Grand Rapids prices permits — $54 plus $6.80 per $1,000 of construction value, a commercial plan review from $50 and a sliding $25–$290 zoning fee, with electrical and plumbing at $52 plus itemised rows.",
  publishStatus: "published",
  noindex: false,
  lastReviewedAt: GR_LAST_VERIFIED,
};

const permitPages: SeedPermitPage[] = [
  {
    jurisdictionKey: GR_KEYS.jurisdiction,
    permitTypeKey: "building",
    slug: "building-permit-cost",
    title: "Grand Rapids building permit cost",
    intro:
      "Grand Rapids prices a building permit as four published components stacked on one construction value. The application fee is $54 — the schedule's own \"Base Fee\", \"charged for first $1,000 of construction cost\" — and each additional $1,000 of construction or contract cost buys a $6.80 step, with the partial step charged as a whole one, because the City's fee chart is keyed by $1,000 value ranges. On top of that sit two more: plan review, on commercial projects only, at a $50 floor rising by 68¢ a thousand in whole dollars; and the zoning fee — a flat $25 on single-family and duplex projects, and on everything else 10% of the application-plus-permit subtotal between $25 and $290. The City prints all four columns across 500 rows of its fee chart, from $1 to $501,000, so a $40,000 residential project totals $344.20 under them and a $150,000 commercial one totals $1,274.92.",
    localSummary:
      "The chart is the schedule and the calculator is the estimate, and the two disagree twice — both times the chart wins. The chart is keyed by value ranges, so any value inside the \"$150,001 – $151,000\" row pays that row's 150 steps ($1,020.00), while the calculator's `floor((value − 1000)/1000)` rounds the partial thousand down ($1,013.20). And the chart's commercial zoning column is exactly 10% of the application fee plus the permit fee in cents — $106.72 at 149 units — while the calculator computes `floor(0.68 × units)` in whole dollars, which is 10% of the permit fee alone ($101.00). On plan review the two agree to the cent, which is the independent check that the chart's column is a formula rather than a transcription.\n\nTwo of the four components are percentages of the fee itself, made whole by a floor and a cap, and each boundary is the chart's own: the $50 plan-review floor stops binding at the $74,001 row and $51 begins at $75,001; the $25 zoning floor gives way to $25.12 at 29 units; the $290 cap first binds at 419 units where 10% reaches $290.32. Residential projects never pay plan review — the residential Total column omits it — and pay exactly $25 of zoning on every one of the 500 rows. Demolition is refused by all four components because the schedule prices wrecking on its own rows, and the chart's last row is $500,001 – $501,000: above it this site applies the top printed row and warns rather than inventing one.",
    notIncluded:
      "This is the FY 2027 schedule's standard building stack — application, incremental fee, commercial plan review, zoning. It excludes:\n\n- **The calculator's project-type branches**, which the fee page's script prices at $66 for residential Roofing/Siding and Deck/Pool (application and plan review waived) and $220 for commercial Roofing/Siding — against the schedule's own flat rows: Residential Deck $22.00, Residential Pool $15.00 (plans larger than 11x17), Residential Re-siding $5.00 (same condition), Residential Re-roofing with no amount printed. Three disagreements between two City surfaces, plus a code comment reading \"capped at $24\" beside a constant of 25; named, not modelled.\n- **Demolition** — $220 residential plus the zoning fee, $250 commercial plus a $70 sewer inspection fee, $331 with explosives — and **Change of Use** ($220), the **incomplete application** ($551 plus $70 sewer), temporary occupancy and tents ($66 each).\n- **Re-Review of Plans** ($88 a page), **Large Format Scanning** (\"10% permit fee $50.00 min\"), the $141 administrative hourly rate, re-opened expired permits ($189) and the construction code board of appeals.\n- **The inspection schedule** ($131 failure to gain access or work not ready; $84 stop work and evenings/weekends/holidays) and **the enforcement schedule** (working without a permit $173, correction notice $165, notice of violation $260, civil infraction preparation $360).\n- **Mechanical, electrical and plumbing permits** — the calculator says so itself: \"This estimate does not include trade, planning, or land use develoment permit fees, such as Electrical, Plumbing, or Mechanical permits.\"\n- **The Planning Division's schedule** — zoning map amendments $3,610–$5,560, special land use, site plan review, board of zoning appeals $750–$2,640, signs and historic preservation.\n- **Right-of-way permits, the LUDS program** (which combines \"review and permit fee for one simple payment\") and **water/sewer connection permits**.\n- **Anything above $501,000**, where the chart's rows stop: the top printed row is applied with a warning, because no document this pass read publishes a row beyond it.",
    workedExample: {
      scenario:
        "A new commercial building declared at $150,000 of construction value — the chart's own $149,001 – $150,000 row.",
      inputs: {
        valuationCents: 15_000_000,
        occupancy: "commercial",
        workType: "new_construction",
      },
      notes:
        "The four components reproduce the chart's row exactly: the $54.00 application fee; 149 steps of $6.80 = $1,013.20 of permit fee; plan review at max($50, floor(149 × $0.68)) = $101.00; and the zoning fee at 10% of ($54.00 + $1,013.20) = $106.72. The chart's Total Commercial column for that row prints $1,274.92 — this example's total, to the cent, from four separately published parts.\n\nThe neighbouring cases show each column doing its own job. The same $40,000 declared as a single-family project is $54.00 + 39 steps ($265.20) + $25.00 zoning = $344.20, with plan review absent rather than zero, because the residential Total column never includes it. A $1,000 project — one that has not left the first thousand the base fee pays for — is $54.00 of application, no incremental step, the $50 plan-review floor and $25 of zoning: $129.00, the chart's very first row.",
    },
    faqs: [
      {
        question: "How much is a building permit in Grand Rapids?",
        answer:
          "Four components: a $54 application fee, $6.80 for each additional $1,000 of construction cost after the first $1,000, a commercial-only plan review from $50, and the zoning fee ($25 residential; 10% of application plus permit, $25 to $290, commercial). A $40,000 single-family project totals $344.20; a $150,000 commercial project totals $1,274.92 — both are the City's own chart's totals for those rows.",
        sourceId: GR_FEE_SCHEDULE_SOURCE_KEY,
        attribution:
          "FY 2027 fee schedule, BUILDING PERMITS block and BUILDING PERMIT FEE CHART, effective July 1, 2026.",
      },
      {
        question: "Does the permit fee round up to the next $1,000?",
        answer:
          "Yes — the chart's rows charge the row's steps, so any value in the \"$150,001 – $151,000\" row pays 150 steps of $6.80 ($1,020.00), not 149. The City's calculator rounds the remainder down instead (`floor((value − 1000)/1000)` gives $1,013.20), but it labels itself an estimate and the chart is the schedule with \"City Code, Chapter 131\" printed beside each row — so the partial thousand is charged as a whole step here.",
        sourceId: GR_FEE_SCHEDULE_SOURCE_KEY,
        attribution:
          "FY 2027 fee chart rows versus the calculator's units expression; both read 2026-09-25.",
      },
      {
        question: "What is the plan review fee?",
        answer:
          "Commercial projects only: $50 minimum, then 68¢ per $1,000 of construction value, floored to whole dollars — $50 through the $74,001 row, $51 from $75,001, $101 at $149,001, $340 at the chart's last row. Residential projects never pay it: the residential Total column omits it entirely, and the calculator shows \"N/A\". The calculator computes the same expression the chart prints, which is the check that column is a formula rather than a transcription.",
        sourceId: GR_FEE_SCHEDULE_SOURCE_KEY,
        attribution: "FY 2027 fee chart, Com Plan Review column; calculator confirms it to the cent.",
      },
      {
        question: "How is the zoning fee calculated?",
        answer:
          "Residential (single-family or duplex): a flat $25, printed on all 500 chart rows. Everything else: a sliding scale — \"a maximum $290 Zoning Permit fee typically is added; this fee is implemented on a sliding scale so as not to be more than 10% of the Building Permit fee\" — which the chart computes as 10% of the application fee plus the permit fee: $25.12 first appears at 29 units, $106.72 at 149, capped at $290 from 419 units. The calculator computes a lower, whole-dollar figure ($101.00 at 149 units); the chart is the schedule, and this page charges the chart.",
        sourceId: GR_FEE_SCHEDULE_SOURCE_KEY,
        attribution: "FY 2027 fee schedule, footnote 6, with the chart's Zoning columns.",
      },
      {
        question: "Does this total include electrical, plumbing or mechanical permits?",
        answer:
          "No. The fee page's own note: \"This estimate does not include trade, planning, or land use develoment permit fees, such as Electrical, Plumbing, or Mechanical permits.\" Those are separate applications with their own rows — a $52 application that includes one inspection for each trade — and this site prices them on their own pages.",
        sourceId: GR_CALCULATOR_SOURCE_KEY,
        attribution: "Building Permit Fee Calculator page, Important Notes, read 2026-09-25.",
      },
      {
        question: "How do I apply, and what counts as residential?",
        answer:
          "Through the City's Accela Citizen Access portal at aca-prod.accela.com/GRANDRAPIDS, with plans in the ePlan Room — filed by \"either the property owner or a licensed contractor\". The occupancy split is a rule about unit count: \"Residential projects include only single-family homes or duplexes. For projects with three or more residential units, please select commercial.\" Questions go to the Development Center at 616-456-4100.",
        sourceId: GR_RESIDENTIAL_PERMITS_SOURCE_KEY,
        attribution:
          "Residential Building Permits page (filing rule); the occupancy sentence is on the fee calculator page.",
      },
    ],
    seoTitle: "Grand Rapids MI building permit cost",
    seoDescription:
      "Grand Rapids building permit fees — $54 application plus $6.80 per each additional $1,000, commercial plan review from $50, and a zoning fee of $25 residential or 10% of the fee ($25-$290) commercial.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: GR_LAST_VERIFIED,
  },
  {
    jurisdictionKey: GR_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    slug: "electrical-permit-cost",
    title: "Grand Rapids electrical permit cost",
    intro:
      "A Grand Rapids electrical permit starts with one row: \"Application (Includes 1 inspection) — $52.00\". What the job itself costs is the second row the schedule prices — the service's size — in four bands: up to 200 amps is $17, 201 to 600 amps is $31, 601 to 1,000 amps is $63, and over 1,000 amps (or a GFPE service) is $105. Exactly one band can fire, chosen by the amperage you declare, and a permit that never declares one charges the $52 application alone rather than guessing at a band. Every other row in the section — fire alarm devices, branch circuits, appliances, motors, the $210 new-single-family-home row — is published beside these and named below, not summed.",
    localSummary:
      "The $52 is not just the permit: the row itself says \"Includes 1 inspection\", so the first visit is already paid for, and the schedule prices the excess on the next line at $42 an inspection. That is the whole shape of this section — an application price that carries an allowance, plus itemised work priced by what it is, with the admin fee ($173 for working prior to permit), written reports ($63/hour) and special inspections ($63/hour) sitting outside an estimate for ordinary work.\n\nNothing here depends on construction value: the four service bands are the only quantity this page multiplies, and they are gated rather than defaulted, so an estimate without an amperage is honestly just the application fee with four excluded rows beside it. The permit itself is a code permit — the City's trade page frames it as work \"under the Michigan Electrical Code or Michigan Residential Code\" — and fire alarm work has its own permit card on the same page, while the schedule prices those devices at $63 for up to 10 and $6 each after.",
    notIncluded:
      "This is the FY 2027 schedule's application row and the four service bands. It excludes:\n\n- **Everything else in the electrical section**: Additional Inspection $42, Admin Fee (working prior to permit) $173, Written Report and Certificates and Special Inspection $63, **New Single Family Home $210** (the schedule never says whether that is an alternative to these rows or one of them), Conduit or Grounding Only $47, Hazardous Locations \"2x Permit Fee\", Meter Set / Mast Repair $10, Temporary Service $17.\n- **Alternative power** ($42 first 10 KW, $4 each KW after), **fire alarm** ($63 up to 10 devices, $6 each additional), **General and Lighting Branch Circuits** ($10 each), the \"Addition, Alteration, Repair Existing, Replace per 25 Devices or Lighting\" $10 rows, and the $10 appliance rows (range, dryer, A/C, furnace, data outlets per 20, temperature control, microwave, water heater, heating device per 5,000 watts).\n- **Vehicle Charging Station $21, Pool $63, Hot Tub $21, Other Fixed Appliances $10, Illuminated Signs $21 per circuit, Neon/LED supplies $21, Feeders $11, Bus Duct $11 per 50 ft, motors at $10 / $26 / $52 by HP.**\n- **Mechanical and plumbing permits** — separate applications, priced on their own pages — and **building, planning and right-of-way fees** entirely.\n- **The LUDS program** for new development involving excavating, grading or paving, which combines \"your review and permit fee for one simple payment\".",
    workedExample: {
      scenario:
        "A service upgrade to 400 amps on a single-family home — one application, one band.",
      inputs: {
        custom: { amperage: 400 },
      },
      notes:
        "The $52 application (with its included inspection) plus the \"201-600 Amp Service\" band at $31: $83.00, and nothing else can fire — the four bands are gated on the same amperage fact, so exactly one applies.\n\nThe neighbours show each band: the same permit at 200 amps is $52 + $17 = $69.00; at 800 amps, $52 + $63 = $115.00; above 1,000 amps, $52 + $105 = $157.00. Declare no amperage at all and the permit is $52.00 with all four bands excluded as not applicable — the schedule publishes no default service size, so none is invented.",
    },
    faqs: [
      {
        question: "How much is an electrical permit in Grand Rapids?",
        answer:
          "$52 for the application, which includes one inspection, plus the service's band: $17 up to 200 amps, $31 for 201–600, $63 for 601–1,000, $105 over 1,000 (and GFPE services). A 400-amp service upgrade is $83.00 in total; without a declared service size the permit is the $52 application alone.",
        sourceId: GR_FEE_SCHEDULE_SOURCE_KEY,
        attribution: "FY 2027 fee schedule, ELECTRCIAL [sic] PERMIT FEES, Chapter 133.",
      },
      {
        question: "How much is a 200-amp service upgrade?",
        answer:
          "$17 for the service — the \"Up to 200 Amp Service\" row covers everything at 200 amps or under — plus the $52 application, for $69.00. The next bands are $31 for 201–600 amps, $63 for 601–1,000 and $105 above 1,000, and each band replaces the others rather than stacking.",
        sourceId: GR_FEE_SCHEDULE_SOURCE_KEY,
        attribution: "FY 2027 fee schedule, the four Amp Service rows.",
      },
      {
        question: "What does the $52 application fee include?",
        answer:
          "The permit and one inspection — the row says so: \"Application (Includes 1 inspection)\". Each additional inspection is $42, printed on the next line. Two more rows sit outside this total: the $173 admin fee for \"working prior to permit\" and the $63 hourly written report and special inspection rates.",
        sourceId: GR_FEE_SCHEDULE_SOURCE_KEY,
        attribution: "FY 2027 fee schedule, electrical section head rows, Chapter 133.",
      },
      {
        question: "Is there a separate fire alarm permit?",
        answer:
          "Yes — the Development Center lists an \"Electrical Fire Alarm Permit\" as its own card among the trade permits, for work under the Michigan Electrical Code. The schedule prices the devices on the electrical sheet: $63 for up to 10 devices and $6 for each additional one. Those device amounts are named here, not included in any total.",
        sourceId: GR_TRADE_PERMITS_SOURCE_KEY,
        attribution: "Trade Permits page, fire alarm card; amounts from the FY 2027 schedule.",
      },
      {
        question: "Who can apply for an electrical permit?",
        answer:
          "The property owner or a licensed contractor — the City's residential permits page states it for every application — and the electrical permit itself is required for work \"under the Michigan Electrical Code or Michigan Residential Code\". Commercial and residential electrical work are separate application cards on the trade permits page.",
        sourceId: GR_TRADE_PERMITS_SOURCE_KEY,
        attribution: "Trade Permits page, electrical cards; the owner-or-contractor rule is on the residential permits page.",
      },
      {
        question: "Are branch circuits, fire alarm devices and appliances in this total?",
        answer:
          "No — they are published rows this page names rather than sums: General and Lighting Branch Circuits at $10, fire alarm at $63 for up to 10 devices plus $6 each after, the $10 appliance rows (range, dryer, A/C, furnace, microwave, water heater and more), feeders at $11, motors at $10 to $52. The \"New Single Family Home — $210\" row is the one the schedule leaves ambiguous — an alternative permit price or an add-on — so it is recorded rather than guessed.",
        sourceId: GR_FEE_SCHEDULE_SOURCE_KEY,
        attribution: "FY 2027 fee schedule, electrical section rows; the $210 ambiguity is research §6.",
      },
    ],
    seoTitle: "Grand Rapids MI electrical permit cost",
    seoDescription:
      "Grand Rapids electrical permit fees — $52 application including one inspection, plus service bands of $17, $31, $63 and $105 by amperage.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: GR_LAST_VERIFIED,
  },
  {
    jurisdictionKey: GR_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    slug: "plumbing-permit-cost",
    title: "Grand Rapids plumbing permit cost",
    intro:
      "A Grand Rapids plumbing permit is a $52 application that includes one inspection, plus a short price list. Each of the schedule's twenty-eight listed items — backflow preventer, backwater valve, tub-shower, floor drain, grease trap, lavatory, kitchen sink, stacks, urinal, water closet and the rest — is $5.00. A water heater is $21 on its own row, and the water distribution system is priced by pipe size: $6 at 3/4 inch, $10 at 1 inch, $21 at 1-1/4, $26 at 1-1/2, $31 at 2 inches, $36 above 2. Eight items, a water heater and a 1-inch distribution line is $123.00 in total.",
    localSummary:
      "The $5 list is closed: twenty-eight things are named and the schedule says \"plus any other\" nowhere, so the count is the count — there is no catch-all line that could bill an item the document never priced. That is the difference a reader can verify: every dollar here sits next to a name on the schedule, from the $5 rows to the $21 water heater to the six distribution sizes, exactly one of which fires because a permit declares one service line's size.\n\nWhat the $52 buys is stated in its own row: one inspection. The excess is $42 an inspection, and the rows this page does not sum are named with their amounts — medical gas zones at $52, gas piping at $5 an opening, the $173 admin fee for \"working prior to permit\", and the mechanical sheet beside this one. The City keeps residential and commercial plumbing as separate application cards, and new development that involves excavating, grading or paving files through LUDS instead, where \"your review and permit fee\" are combined \"for one simple payment\".",
    notIncluded:
      "This is the FY 2027 schedule's plumbing application, the $5 item rows, the water heater and the distribution sizes. It excludes:\n\n- **Medical Gas Zones ($52)** and **Gas Piping ($5 per opening)** — priced on the same sheet and named rather than folded into a count this calculator does not take.\n- **Additional Inspection ($42)**, **Admin Fee (working prior to permit) $173** and **Written Report ($63 per hour)** — real charges outside an ordinary permit estimate.\n- **Mechanical permits** (Chapter 134) in full: the same $52 application head, then commercial items $7–$99, cfm-banded ventilation and air handlers, the ductwork ladder ($31/$42/$57/$73, then $11 per each additional $3,000 over $15,000) and residential rows $5–$52.\n- **Building, electrical and planning fees**, and the calculator's disclaimer applies here too: the estimate on the fee page \"does not include trade, planning, or land use develoment permit fees\".\n- **The LUDS program** for new development involving excavating, grading or paving — a \"single application with a coordinated review process\" that combines \"your review and permit fee for one simple payment\" — and **water/sewer connection permits**, which are their own application.",
    workedExample: {
      scenario:
        "A kitchen and bath remodel: eight listed items, a new water heater, and a 1-inch water distribution line.",
      inputs: {
        fixtures: 8,
        custom: { water_heater: true, water_distribution: "1" },
      },
      notes:
        "The schedule read top to bottom: the $52 application (one inspection included), eight listed items at $5.00 = $40.00, the $21 water heater, and the 1-inch distribution row at $10.00 — $123.00 in total. Nothing here is a percentage or a step; every row is a published dollar amount times something the reader declared.\n\nThe neighbours show each switch on its own. Drop the water heater and the distribution line and the same eight items are $92.00. Keep everything but take the distribution to over 2 inches and the total is $149.00 ($36 instead of $10). Declare no fixture count at all and the application fee still charges, with the item row saying the input was not provided rather than pricing zero items as though none were needed.",
    },
    faqs: [
      {
        question: "How much is a plumbing permit in Grand Rapids?",
        answer:
          "$52 for the application, which includes one inspection, then $5.00 for each of the schedule's listed items, $21 for a water heater, and the water distribution line by size ($6 to $36). Eight items with a water heater and a 1-inch line is $123.00; the barest permit is the $52 application alone.",
        sourceId: GR_FEE_SCHEDULE_SOURCE_KEY,
        attribution: "FY 2027 fee schedule, PLUMBING PERMIT FEES, Chapter 132.",
      },
      {
        question: "What counts as a $5 item?",
        answer:
          "The schedule's own twenty-eight: backflow preventer, backwater valve, bath tub-shower, catch basin/sump/roof drain, dishwashing machine, drinking fountain, floor drain/floor sink/trench drain, garbage disposal, grease trap/oil separator, laundry tray/stand pipes, lavatory, lawn sprinkler, water connected appliance, three-compartment pot and pan, kitchen sink, sink other than family use, slop or service sink, stacks (soil, waste, vent), urinal, water closet/toilet, foot bath/pedicure bath/shampoo, clinical sink, eye wash/emergency shower and bidet. The list is closed — no catch-all clause — so an item not on it is not charged as one.",
        sourceId: GR_FEE_SCHEDULE_SOURCE_KEY,
        attribution: "FY 2027 fee schedule, the $5.00 rows of Chapter 132.",
      },
      {
        question: "How much is a water heater and the water distribution line?",
        answer:
          "The water heater is $21 on its own row, above the $5 items. The water distribution system is priced by pipe size — $6 for 3/4 inch, $10 for 1 inch, $21 for 1-1/4, $26 for 1-1/2, $31 for 2 inches, $36 above 2 — and this site models it as one declared size per permit, because the schedule's \"Fee per Unit\" column never says what the unit beyond the size itself is.",
        sourceId: GR_FEE_SCHEDULE_SOURCE_KEY,
        attribution: "FY 2027 fee schedule, Water Heater and Water Distribution rows, Chapter 132.",
      },
      {
        question: "Are inspections included in the plumbing permit?",
        answer:
          "The first one is: the application row reads \"Application (Includes 1 inspection) — $52.00\". Each additional inspection is $42, printed directly beneath it. The $173 \"Admin Fee (working prior to permit)\" and the $63 hourly written report are separate rows and are not in any total on this page.",
        sourceId: GR_FEE_SCHEDULE_SOURCE_KEY,
        attribution: "FY 2027 fee schedule, plumbing section head rows, Chapter 132.",
      },
      {
        question: "Are residential and commercial plumbing permits different?",
        answer:
          "They are separate application cards on the City's trade permits page — \"Residential Plumbing Permit\" and \"Commercial Plumbing Permit\" — while the fee schedule prices the application, the items and the distribution rows the same way for both. New development involving excavating, grading or paving routes to the LUDS program instead, whose single application combines \"your review and permit fee for one simple payment\".",
        sourceId: GR_TRADE_PERMITS_SOURCE_KEY,
        attribution: "Trade Permits page, plumbing cards, read 2026-09-25.",
      },
      {
        question: "Who can apply for a plumbing permit, and where?",
        answer:
          "The property owner or a licensed contractor, through the Accela Citizen Access portal at aca-prod.accela.com/GRANDRAPIDS with plans in the ePlan Room. The residential list carries its own \"Plumbing - Residential Application\" for work on a single-family or duplex home, and the Development Center answers questions at 616-456-4100 (devcenter@grcity.us, Mon–Fri 7:30 AM – 4 PM).",
        sourceId: GR_RESIDENTIAL_PERMITS_SOURCE_KEY,
        attribution: "Residential Building Permits page, application list and filing rule.",
      },
    ],
    seoTitle: "Grand Rapids MI plumbing permit cost",
    seoDescription:
      "Grand Rapids plumbing permit fees — $52 application including one inspection, $5 per listed item, $21 a water heater and water distribution by pipe size ($6-$36).",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: GR_LAST_VERIFIED,
  },
];

const verifications: SeedVerification[] = [
  {
    entityType: "source",
    entityKey: GR_FEE_SCHEDULE_SOURCE_KEY,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: GR_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: GR_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "Read 2026-09-25 in three pdftotext modes; -table and -raw agree on every row -layout mispairs, so their pairing is the one charged. Source of every figure this site charges, and the BUILDING PERMIT FEE CHART's 500 rows were extracted programmatically and checked against four formulas (app fee, permit steps, plan review, zoning and both totals) with zero mismatches.",
  },
  {
    entityType: "source",
    entityKey: GR_CALCULATOR_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: GR_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: GR_CALCULATOR_SOURCE_KEY,
    notes:
      "Read 2026-09-25 (HTTP 200). The City's arithmetic read as code: units expression, 6.8 multiplier, floor(0.68 * units) for zoning and plan review, the four constants and three project-type branches. Source of the occupancy split and the trade-fee disclaimer quoted on the pages; where it and the chart disagree (zoning formula, partial-thousand rounding) the chart is charged and the disagreement is recorded.",
  },
  {
    entityType: "source",
    entityKey: GR_PERMITS_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: GR_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: GR_PERMITS_SOURCE_KEY,
    notes:
      "Read 2026-09-25 (HTTP 200). Source of the permit taxonomy (residential = single-family and duplex; multiplex = 3+ units; trade permits = mechanical, electrical and plumbing applications), the Accela portal link and the Development Center contact block.",
  },
  {
    entityType: "source",
    entityKey: GR_TRADE_PERMITS_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: GR_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: GR_TRADE_PERMITS_SOURCE_KEY,
    notes:
      "Read 2026-09-25 (HTTP 200). Nine trade cards; source of the Michigan Electrical/Mechanical Code framing and the fire-alarm permit card quoted on the electrical page. Several card descriptions are copy-paste mismatches (the LUDS paragraph on residential electrical and plumbing) — recorded, never quoted for a figure.",
  },
  {
    entityType: "source",
    entityKey: GR_RESIDENTIAL_PERMITS_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: GR_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: GR_RESIDENTIAL_PERMITS_SOURCE_KEY,
    notes:
      "Read 2026-09-25 (HTTP 200). Source of the filing rule (\"either the property owner or a licensed contractor\"), the full application list including the plumbing and electrical residential applications, and the LUDS 500-feet trigger.",
  },
  {
    entityType: "fee_schedule",
    entityKey: GR_KEYS.feeSchedule,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: GR_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: GR_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "Effective 2026-07-01 per every page's own header (\"EFFECTIVE JULY 1, 2026\"), titled FY 2027, linked from the fee page as \"a full list of fees\" on 2026-09-25 — three months into force on the research date.",
  },
  {
    entityType: "fee_rule",
    entityKey: "GR-BLD-APP",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: GR_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: GR_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "\"Building Permit, Base Fee — City Code, Chapter 131 — $54.00 plus Zoning Permit fee\" with footnote 1 defining the base as the first $1,000 of construction cost. Printed as the App Fee column on all 500 chart rows and initialised first in the calculator's script (buildingAppFee = 54.00) — two surfaces, same number. Gated only on demolition, which the schedule prices on its own rows.",
  },
  {
    entityType: "fee_rule",
    entityKey: "GR-BLD-INCREMENTAL",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: GR_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: GR_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "\"Building Permit, Incremental Fee — $6.80\" with footnote 1 (\"each additional $1,000 of construction/contract cost\"), modelled with a $1,000 threshold and a $1,000 round-up because the chart is keyed by value ranges and its $150,001–$151,000 row charges 150 steps. The calculator's floor() on the same expression gives 149 — recorded in research §6; the chart is the schedule.",
  },
  {
    entityType: "fee_rule",
    entityKey: "GR-BLD-ZONING-COM",
    permitTypeKey: "building",
    status: "needs_review",
    method: "official_pdf_review",
    verifiedAt: GR_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: GR_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "The amounts are certain — footnote 6's sliding scale \"not to be more than 10% of the Building Permit fee\", which the chart computes as 10% of (application + permit) in exact cents, verified on all 500 rows ($25.12 at 29 units, $106.72 at 149, capped $290 from 419). What the two City surfaces disagree on is the expression: the calculator computes Math.floor(0.68 * units) clamped [25, 290] — 10% of the permit fee alone, floored to whole dollars ($101.00 at 149 units, $5.72 less). The chart is the schedule with its Chapter 131 authority printed beside each row and is what is charged; flagged needs_review so the $5-6 disagreement stays visible instead of being smoothed over.",
  },
  {
    entityType: "fee_rule",
    entityKey: "GR-PLUMB-ITEM",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: GR_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: GR_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "The twenty-eight $5.00 rows of Chapter 132, read in -table and -raw modes. The list is closed — no \"plus any other\" clause, unlike Detroit's catch-all — so the row is modelled as what it prints: each listed item at $5.00 on the fixtures count, with no default and no catch-all.",
  },
  {
    entityType: "permit_page",
    entityKey: "building-permit-cost",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: GR_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: GR_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "The four components with the chart's own boundaries ($50 floor to the $74,001 row, $25.12 first above the zoning floor at 29 units, $290 cap from 419, chart ends $501,000), the calculator's two disagreements named rather than adopted, and the project-type branches recorded on both sides. The worked example is the chart's own row: $54.00 + $1,013.20 + $101.00 + $106.72 = $1,274.92 for $150,000 commercial, with the $40,000 residential ($344.20) and $1,000 ($129.00 first row) neighbours stated beside it.",
  },
  {
    entityType: "permit_page",
    entityKey: "electrical-permit-cost",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: GR_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: GR_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "The $52 application with its included-inspection wording and the four service bands gated on custom.amperage, read in -table and -raw (the -layout pass mispairs this whole section). The worked example is arithmetic on the schedule: $52 + $31 = $83.00 for 400 amps, with $69.00 / $115.00 / $157.00 and the amperage-less $52.00 stated beside it. The $210 new-single-family-home ambiguity is recorded, not charged.",
  },
  {
    entityType: "permit_page",
    entityKey: "plumbing-permit-cost",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: GR_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: GR_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "The $52 application, the closed twenty-eight-item $5 list, the $21 water heater and the six distribution sizes. The worked example is arithmetic on the schedule: $52 + 8 × $5 + $21 + $10 = $123.00, with the $92.00 and $149.00 neighbours and the missing-input behaviour stated beside it. The unit distribution rows are priced per is recorded in research §6.",
  },
  {
    entityType: "jurisdiction_profile",
    entityKey: GR_KEYS.jurisdiction,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: GR_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: GR_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "Hub content built from the FY 2027 schedule (three extraction modes), the fee page's inline calculator (read as code), and the permits, trade permits and residential permits pages for process, contacts and the filing rule. The calculator's zoning and rounding disagreements, the project-type contradictions, the chart's $501,000 end and the distribution-row unit are each named as open questions in the research record and on the pages rather than resolved by guess.",
  },
];

export const grandrapidsSeed: JurisdictionSeed = {
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
export const GR_PUBLISHED_PERMIT_PAGES = grandrapidsSeed.permitPages.filter(
  (page) => page.publishStatus === "published" && !page.noindex,
);
