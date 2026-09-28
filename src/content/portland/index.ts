import type { JurisdictionSeed } from "@/content/seed-types";

import {
  OREGON_BUILDING_REVIEW_BPS,
  OREGON_FEE_EFFECTIVE_FROM,
  OREGON_PLUMBING_FIXTURE_CENTS,
  OREGON_STATE_SURCHARGE_BPS,
  OREGON_TRADE_REVIEW_BPS,
  OREGON_VALUATION_METHOD_NOTE,
  OREGON_VALUATION_SOURCE_KEY,
  PORTLAND_BUILDING_RULES,
  PORTLAND_BUILDING_SOURCE_KEY,
  PORTLAND_ELECTRICAL_RULES,
  PORTLAND_ELECTRICAL_SOURCE_KEY,
  PORTLAND_PLUMBING_RULES,
  PORTLAND_PLUMBING_SOURCE_KEY,
} from "./fee-rules";

/**
 * Portland, Oregon — the City of Portland, which shares one fee schedule set with
 * unincorporated Multnomah County.
 *
 * The two jurisdictions are the same department's customers. Portland Permitting &
 * Development issues permits for the city **and** for unincorporated Multnomah County,
 * and publishes a separate schedule for each — but only the *building* schedule differs
 * in what it charges, and only by one table. That is why this payload and the county's are
 * built from the same rule factories in `./fee-rules`: the building permit fee, the two
 * trade schedules and the 12% state surcharge are literally the same rules with a
 * different source id, so the two pages cannot drift apart.
 *
 * Research record: research/oregon/portland.md.
 */

export const PORTLAND_LAST_VERIFIED = "2026-09-24";

export const PORTLAND_KEYS = {
  state: "or",
  county: "multnomah-county",
  jurisdiction: "portland",
  buildingSchedule: PORTLAND_BUILDING_SOURCE_KEY,
  electricalSchedule: PORTLAND_ELECTRICAL_SOURCE_KEY,
  plumbingSchedule: PORTLAND_PLUMBING_SOURCE_KEY,
} as const;

const RESEARCHER = "Permit Fee Intelligence research pass 10 (Oregon, first jurisdiction)";

/** The schedules' own words for the two fees that are not in a table. */
const REVIEW_NOTE = `Plan review is ${OREGON_BUILDING_REVIEW_BPS / 100}% of the building permit fee and ${OREGON_TRADE_REVIEW_BPS / 100}% of the electrical or plumbing permit fee.`;

const EFFECTIVE_NOTE = `"Effective Date: July 10, 2026" is printed on the title page of all six documents.`;

const state = {
  code: "OR",
  slug: "oregon",
  name: "Oregon",
  fipsCode: "41",
};

const county = {
  key: PORTLAND_KEYS.county,
  slug: "multnomah-county",
  name: "Multnomah County",
  fipsCode: "41051",
};

export const portlandSeed: JurisdictionSeed = {
  state,
  county,

  jurisdiction: {
    key: PORTLAND_KEYS.jurisdiction,
    stateKey: PORTLAND_KEYS.state,
    countyKey: PORTLAND_KEYS.county,
    type: "city",
    slug: "portland",
    name: "Portland",
    officialName: "City of Portland",
    websiteUrl: "https://www.portland.gov/ppd",
    permitPortalUrl: "https://www.portland.gov/ppd/permits",
    timezone: "America/Los_Angeles",
    isActive: true,
  },

  departments: [
    {
      key: "portland-ppd",
      jurisdictionKey: PORTLAND_KEYS.jurisdiction,
      kind: "building",
      name: "Portland Permitting & Development (PP&D)",
      phone: null,
      email: null,
      url: "https://www.portland.gov/ppd/contact",
      addressLine: "Development Services Center, 1900 SW 4th Ave, Portland, OR 97201",
      hours: null,
      notes:
        "The department whose fees these are, and the one that publishes two sets of them. Its own permits page says the building and zoning permit application serves \"Portland and Maywood Park\" as well as unincorporated Multnomah County, which is how one department's schedule comes to price three jurisdictions' permits. No telephone number is asserted here: it is not printed on any of the six fee schedules, and a number that changed would be a fact this page could not keep true.",
    },
    {
      key: "oregon-bcd",
      jurisdictionKey: PORTLAND_KEYS.jurisdiction,
      kind: "other",
      name: "Oregon Building Codes Division (BCD), Department of Consumer and Business Services",
      phone: null,
      email: null,
      url: "https://www.oregon.gov/bcd/pages/index.aspx",
      addressLine: null,
      hours: null,
      notes:
        "A state body, and a fee authority on this page twice over. It administers the 12% surcharge the schedules' totals include (ORS 455.210(4)), and it writes the permit valuation methodology the local schedules are required to use (OAR 918-050-0100). It also sets the trade permit minimums, hourly review rates and plan review percentages statewide.",
    },
    {
      key: "portland-environmental-services",
      jurisdictionKey: PORTLAND_KEYS.jurisdiction,
      kind: "utilities",
      name: "Bureau of Environmental Services and Portland Water Bureau",
      phone: null,
      email: null,
      url: "https://www.portland.gov/bes",
      addressLine: null,
      hours: null,
      notes:
        "The two bureaus that bill the sewer, stormwater and water work this site does not price: the plumbing schedule's exterior line rows and its \"Fees for Sewer Cap, Erosion Control, and Site Review fee will be added separately\" note both point at charges that are not PP&D's. Named here so a reader can tell a permit fee from a utility charge.",
    },
  ],

  sources: [
    {
      key: PORTLAND_BUILDING_SOURCE_KEY,
      jurisdictionKey: PORTLAND_KEYS.jurisdiction,
      title: "Building and Other Permits Fee Schedule, City of Portland, effective July 10, 2026",
      url: "https://www.portland.gov/ppd/documents/building-and-other-permits-fee-schedule-city-portland-effective-july-10-2026/download",
      sourceType: "fee_schedule_pdf",
      issuingAuthority: "City of Portland, Portland Permitting & Development",
      authorityKind: "city",
      isPrimary: true,
      documentDate: null,
      effectiveFrom: OREGON_FEE_EFFECTIVE_FROM,
      retrievedAt: PORTLAND_LAST_VERIFIED,
      lastVerifiedAt: PORTLAND_LAST_VERIFIED,
      notes:
        "Eleven pages, sha256 beginning 1f61bb394035119e, read 2026-09-24 in three pdftotext modes and compared line by line. Two things in it are load-bearing for this site. The **Building Permit Fee** table (page 1) is identical to the one in the county's document, row for row, which is the fact that lets one set of rules price both. And the two **Development Services Fee** tables (pages 2 and 3) exist in this document and not in the county's — so the same valuation, the same building permit fee and the same plan review percentage produce a different total depending on which side of the city boundary the site is on.",
    },
    {
      key: PORTLAND_ELECTRICAL_SOURCE_KEY,
      jurisdictionKey: PORTLAND_KEYS.jurisdiction,
      title: "Electrical Permit Fee Schedule, City of Portland, effective July 10, 2026",
      url: "https://www.portland.gov/ppd/documents/electrical-permit-fee-schedule-city-portland-effective-july-10-2026/download",
      sourceType: "fee_schedule_pdf",
      issuingAuthority: "City of Portland, Portland Permitting & Development",
      authorityKind: "city",
      isPrimary: true,
      documentDate: null,
      effectiveFrom: OREGON_FEE_EFFECTIVE_FROM,
      retrievedAt: PORTLAND_LAST_VERIFIED,
      lastVerifiedAt: PORTLAND_LAST_VERIFIED,
      notes:
        "Three pages, sha256 beginning 934b553c3f27, read in three modes. Its amounts are **identical to the county's electrical schedule**, which was checked by extracting every dollar figure from both documents and comparing the two multisets: they match exactly. The rows that matter most are the residential square-foot wiring package, the service and feeder bands, and the branch-circuit pair where the first circuit without a service fee costs $174.00 and the same circuit on a permit that bought a service costs $21.00.",
    },
    {
      key: PORTLAND_PLUMBING_SOURCE_KEY,
      jurisdictionKey: PORTLAND_KEYS.jurisdiction,
      title: "Plumbing Permit Fee Schedule, City of Portland, effective July 10, 2026",
      url: "https://www.portland.gov/ppd/documents/plumbing-permit-fee-schedule-city-portland-effective-july-10-2026/download",
      sourceType: "fee_schedule_pdf",
      issuingAuthority: "City of Portland, Portland Permitting & Development",
      authorityKind: "city",
      isPrimary: true,
      documentDate: null,
      effectiveFrom: OREGON_FEE_EFFECTIVE_FROM,
      retrievedAt: PORTLAND_LAST_VERIFIED,
      lastVerifiedAt: PORTLAND_LAST_VERIFIED,
      notes:
        "Four pages, sha256 beginning 7388a9804250, read in three modes, and again identical in every amount to the county's plumbing schedule. It prices a new one- or two-family dwelling by **how many baths it has** — $792.00, $1,187.00, $1,388.00 and $334.00 for each one after that — and prices everything else at $63.00 per fixture or item across more than thirty named rows. Its plan review row prints \"25% of total mechanical permit fee\", a copy-and-paste slip in the City's own document; the row is read as 25% of the plumbing permit fee and the slip is recorded in `research/oregon/portland.md` and on the page.",
    },
    {
      key: OREGON_VALUATION_SOURCE_KEY,
      jurisdictionKey: null,
      title: "OAR 918-050-0100 — Statewide Fee Methodologies for Residential and Commercial Permits",
      url: "https://secure.sos.state.or.us/oard/view.action?ruleNumber=918-050-0100",
      sourceType: "state_agency",
      issuingAuthority: "Oregon Secretary of State, Administrative Rules (Building Codes Division, Chapter 918)",
      authorityKind: "state",
      isPrimary: false,
      documentDate: null,
      effectiveFrom: null,
      retrievedAt: PORTLAND_LAST_VERIFIED,
      lastVerifiedAt: PORTLAND_LAST_VERIFIED,
      notes:
        "Read 2026-09-24 from the Secretary of State's current-rules database. It is the rule the local schedules cite and it explains three of their rows: a residential structural permit fee is calculated from \"the ICC Building Valuation Data Table current as of April 1 of each year... multiplied by the square footage\"; a commercial structural fee takes \"the greater of\" that value or \"the value as stated by the applicant\"; and a residential plumbing permit fee \"includes one kitchen and is based on the number of bathrooms, from one to three, on a graduated scale\", with no additional fee \"for the first 100 feet of water and sewer lines, hose bibbs, icemakers, underfloor low-point drains, and rain drain packages\" — which is what the City's own plumbing row summarises as \"Includes 100 feet for each utility connection\". The rule also says a plan review fee \"shall be based on a predetermined percentage of the permit fee set by the municipality\", which is where the 65% and the 25% come from.",
    },
    {
      key: "oregon-bcd-surcharge-backgrounder",
      jurisdictionKey: null,
      title: "State of Oregon Permit Surcharge Fee — BCD backgrounder",
      url: "https://www.oregon.gov/bcd/jurisdictions/Documents/surcharge-backgrounder.pdf",
      sourceType: "state_agency",
      issuingAuthority: "Oregon Building Codes Division",
      authorityKind: "state",
      isPrimary: true,
      documentDate: null,
      effectiveFrom: null,
      retrievedAt: PORTLAND_LAST_VERIFIED,
      lastVerifiedAt: PORTLAND_LAST_VERIFIED,
      notes:
        "The Building Codes Division's own explanation of the surcharge the local schedules collect: \"A state surcharge fee of 12% is applied to all building permit types issued in the State of Oregon\" and \"Surcharge fees are calculated by using the total permit fee: Total permit fee × 0.12 (12%).\" It lists the permit types it covers — building, mechanical, plumbing (including fixtures), electrical (including services), structural — and breaks the 12% into the four surcharges of ORS 455.210(4): 4% for state administrative costs, 2% for state inspection costs, up to 1% for administering and enforcing the state building code, and 4% for the electronic building codes information system. It is the only source on this site that is a state's explanation of a surcharge rather than the statute itself, and both Oregon jurisdictions' pages cite it because both collect the same 12%.",
    },
  ],

  /** Empty on purpose: the permit types this jurisdiction uses already exist. */
  permitTypes: [],
  projectTypes: [],

  jurisdictionPermitTypes: [
    {
      jurisdictionKey: PORTLAND_KEYS.jurisdiction,
      permitTypeKey: "building",
      isAvailable: true,
      localName: "Building permit",
      officialUrl: null,
      notes:
        "Priced on the **permit valuation**, which the state's own rule fixes the method for, by a five-band table that chains exactly and whose smallest row is a $167.00 minimum. Two more components ride on it: plan review at 65% of the permit fee, and the City's own **Development Services Fee**, a second table on the same valuation that the county does not charge.",
    },
    {
      jurisdictionKey: PORTLAND_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      isAvailable: true,
      localName: "Electrical permit",
      officialUrl: null,
      notes:
        "Priced per job rather than per valuation: a residential square-foot package, service and feeder bands from $212.00 to $1,077.00, temporary services, renewable energy rows, and a branch-circuit row that charges $21.00 a circuit on a permit that bought a service and $174.00 for the first one on a permit that did not. Plan review is 25% of the electrical permit fee, and the same 12% state surcharge applies.",
    },
    {
      jurisdictionKey: PORTLAND_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      isAvailable: true,
      localName: "Plumbing permit",
      officialUrl: null,
      notes:
        "A new one- or two-family dwelling is priced by **how many baths it has**, from $792.00 for one to $334.00 for each bath or kitchen beyond three, and the row includes 100 feet for each utility connection because OAR 918-050-0100 says it must. Everything else is $63.00 per fixture or item. Plan review is 25%, and the 12% state surcharge applies to both.",
    },
    {
      jurisdictionKey: PORTLAND_KEYS.jurisdiction,
      permitTypeKey: "mechanical",
      isAvailable: true,
      localName: "Mechanical permit",
      officialUrl: null,
      notes:
        "The City publishes a mechanical fee schedule for the same effective date, and it is not modelled here: no mechanical page is published in this release, for the reason the other states' mechanical schedules are not modelled either — the rows are per appliance and per unit of equipment and would need their own transcription and their own set of worked examples. That the state surcharge applies to mechanical permits as well is stated on the pages, because it is quoted in the surcharge source.",
    },
  ],

  feeSchedules: [
    {
      key: PORTLAND_BUILDING_SOURCE_KEY,
      jurisdictionKey: PORTLAND_KEYS.jurisdiction,
      sourceKey: PORTLAND_BUILDING_SOURCE_KEY,
      title: "City of Portland Building and Other Permits Fee Schedule, effective July 10, 2026",
      officialUrl:
        "https://www.portland.gov/ppd/documents/building-and-other-permits-fee-schedule-city-portland-effective-july-10-2026/download",
      effectiveFrom: OREGON_FEE_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: PORTLAND_LAST_VERIFIED,
      notes: `${EFFECTIVE_NOTE} It is one document with three tables that matter — the Building Permit Fee, the Development Services Fee - Commercial and the Development Services Fee - Residential — plus a plan review percentage and a page of miscellaneous hourly and program fees.`,
    },
    {
      key: PORTLAND_ELECTRICAL_SOURCE_KEY,
      jurisdictionKey: PORTLAND_KEYS.jurisdiction,
      sourceKey: PORTLAND_ELECTRICAL_SOURCE_KEY,
      title: "City of Portland Electrical Permit Fee Schedule, effective July 10, 2026",
      officialUrl:
        "https://www.portland.gov/ppd/documents/electrical-permit-fee-schedule-city-portland-effective-july-10-2026/download",
      effectiveFrom: OREGON_FEE_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: PORTLAND_LAST_VERIFIED,
      notes: `${EFFECTIVE_NOTE} The same document structure as the county's electrical schedule, with the same amounts.`,
    },
    {
      key: PORTLAND_PLUMBING_SOURCE_KEY,
      jurisdictionKey: PORTLAND_KEYS.jurisdiction,
      sourceKey: PORTLAND_PLUMBING_SOURCE_KEY,
      title: "City of Portland Plumbing Permit Fee Schedule, effective July 10, 2026",
      officialUrl:
        "https://www.portland.gov/ppd/documents/plumbing-permit-fee-schedule-city-portland-effective-july-10-2026/download",
      effectiveFrom: OREGON_FEE_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: PORTLAND_LAST_VERIFIED,
      notes: `${EFFECTIVE_NOTE} Its dwelling row and its $63.00 fixture row are the two halves of the plumbing fee; which one applies is a question about what is being built, not about how big it is.`,
    },
  ],

  feeRules: [
    ...PORTLAND_BUILDING_RULES.map((rule) => ({
      jurisdictionKey: PORTLAND_KEYS.jurisdiction,
      permitTypeKey: "building",
      scheduleKey: PORTLAND_BUILDING_SOURCE_KEY,
      rule,
    })),
    ...PORTLAND_ELECTRICAL_RULES.map((rule) => ({
      jurisdictionKey: PORTLAND_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      scheduleKey: PORTLAND_ELECTRICAL_SOURCE_KEY,
      rule,
    })),
    ...PORTLAND_PLUMBING_RULES.map((rule) => ({
      jurisdictionKey: PORTLAND_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      scheduleKey: PORTLAND_PLUMBING_SOURCE_KEY,
      rule,
    })),
  ],

  requirements: [
    {
      jurisdictionKey: PORTLAND_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "other",
      title: "The valuation is set by a state rule, not by the City",
      description: `${OREGON_VALUATION_METHOD_NOTE}\n\nFor an alteration or repair the schedule uses a different basis, its own defined \"Fair Market Value\": \"the total value of all construction work for which the permit is issued, as well as all finish work, painting, roofing, electrical, plumbing, heating, air conditioning, elevators, fire extinguishing systems and other permanent work or equipment, and contractor's profit\".`,
      isMandatory: true,
      sortOrder: 10,
      sourceKey: OREGON_VALUATION_SOURCE_KEY,
      lastVerifiedAt: PORTLAND_LAST_VERIFIED,
    },
    {
      jurisdictionKey: PORTLAND_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "other",
      title: "A second table is charged on the same valuation",
      description:
        "The **Development Services Fee** applies, in the schedule's own words, \"to all Building Permits, Site Development Permits (except where work involves only clearing) and Zoning Permits\". It comes in two versions — Commercial and Residential — and which one applies depends on the occupancy: the residential table is for one- and two-family dwellings and the commercial table is the document's residual category, so a project that has not named an occupancy is priced with the commercial table, which is the higher of the two at every band. This is the only charge on this site's Oregon pages that the unincorporated county does not levy, and it is the entire difference between the two jurisdictions' totals.",
      isMandatory: true,
      sortOrder: 20,
      sourceKey: PORTLAND_BUILDING_SOURCE_KEY,
      lastVerifiedAt: PORTLAND_LAST_VERIFIED,
    },
    {
      jurisdictionKey: PORTLAND_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "other",
      title: "Plan review is 65% of the permit fee; a trade plan review is 25% of that permit's fee",
      description: `${REVIEW_NOTE}\n\nThe building schedule's own line is \"Plan Review/Process Fee — For the original submittal - 65% of the building permit fee, maximum of 2 allowable checksheets\", plus $336.00 for each additional checksheet, and the same 65% applies \"for value-added revisions\" on the additional permit fee with a $489.00 minimum. The electrical and plumbing schedules each print \"Plan review fee — 25% of total electrical permit fee - Maximum number of allowable checksheets: 2\", with one additional checksheet at $324.00. OAR 918-050-0100 is what requires a percentage at all: a plan review fee \"shall be based on a predetermined percentage of the permit fee set by the municipality\" — the percentage is local, the mechanism is statewide.`,
      isMandatory: true,
      sortOrder: 30,
      sourceKey: PORTLAND_BUILDING_SOURCE_KEY,
      lastVerifiedAt: PORTLAND_LAST_VERIFIED,
    },
    {
      jurisdictionKey: PORTLAND_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "other",
      title: "A 12% state surcharge is added to every permit",
      description: `The Building Codes Division: \"A state surcharge fee of 12% is applied to all building permit types issued in the State of Oregon\", covering building, mechanical, plumbing (including fixtures), electrical (including services) and structural permits — \"Total permit fee × 0.12\". It implements ORS 455.210(4), which imposes four surcharges on the total permit fees: 4% for state administrative costs, 2% for state inspection costs, up to 1% for administering the state building code and 4% for the electronic building codes information system. The pages charge it on the permit fee the table produces rather than on the finished total; the other reading is stated on each page with the dollar difference it makes, at ${OREGON_STATE_SURCHARGE_BPS / 100}%.`,
      isMandatory: true,
      sortOrder: 40,
      sourceKey: "oregon-bcd-surcharge-backgrounder",
      lastVerifiedAt: PORTLAND_LAST_VERIFIED,
    },
    {
      jurisdictionKey: PORTLAND_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      requirementType: "other",
      title: "The same circuit costs $21.00 or $174.00 depending on the rest of the permit",
      description:
        'The electrical schedule prices branch circuits twice: "a. The fee for branch circuits with the purchase of service or feeder fee — $21.00", and "b. The fee for branch circuits without the purchase of service or feeder fee: First branch circuit — $174.00; Each additional branch circuit — $21.00". So the first circuit on a circuits-only permit costs more than eight times what it costs on a permit that also paid for a service or feeder, and the fee for identical wiring depends on what else is on the permit. Which row applies is the applicant\'s answer to a question about the scope of the work, not a threshold.',
      isMandatory: true,
      sortOrder: 10,
      sourceKey: PORTLAND_ELECTRICAL_SOURCE_KEY,
      lastVerifiedAt: PORTLAND_LAST_VERIFIED,
    },
    {
      jurisdictionKey: PORTLAND_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      requirementType: "other",
      title: "A new house is priced by the number of baths, not by the number of fixtures",
      description:
        'The plumbing schedule\'s first table is "New 1 & 2 Family Dwellings Only": $792.00 for a one-bath single family residence, $1,187.00 for two, $1,388.00 for three and $334.00 for each additional bath or kitchen. OAR 918-050-0100 is where that method comes from: a residential plumbing permit fee "includes one kitchen and is based on the number of bathrooms, from one to three, on a graduated scale", with "an additional set fee... for each additional bath or kitchen". The same rule is why the row says "Includes 100 feet for each utility connection" — no additional fee is charged "for the first 100 feet of water and sewer lines, hose bibbs, icemakers, underfloor low-point drains, and rain drain packages". Every other plumbing permit, including an addition or an alteration to a house, is $63.00 per fixture or item.',
      isMandatory: true,
      sortOrder: 10,
      sourceKey: PORTLAND_PLUMBING_SOURCE_KEY,
      lastVerifiedAt: PORTLAND_LAST_VERIFIED,
    },
  ],

  profile: {
    jurisdictionKey: PORTLAND_KEYS.jurisdiction,
    headline: "What construction permits cost in Portland",
    summary:
      "Portland prices a building permit from the project valuation with a $167.00 minimum, adds **a second table on the same valuation** that the unincorporated county does not charge, then plan review at 65% of the permit fee and a 12% state surcharge. A $250,000 commercial project in the city comes to $4,159.54; the same project a mile outside the city limits in unincorporated Multnomah County comes to $3,508.63.",
    localContext:
      "Portland Permitting & Development issues permits for the **City of Portland** and for **unincorporated Multnomah County**, and publishes a separate fee schedule for each. What makes this pair worth publishing together is how little the two documents differ. The **Building Permit Fee** table is identical in both — same five bands, same $167.00 minimum, same $3.59 for each additional $100 in the smallest band, same $5.63 per $1,000 at the top. The electrical schedules are identical in every amount, and so are the plumbing schedules. Only three things separate the city from the county: the two **Development Services Fee** tables, which exist in the city's document and not in the county's; two demolition rows, where the city charges $1,372.00 to demolish a commercial building and the county charges $1,038.00; and the title page.\n\nThe **Development Services Fee** is the whole of the difference in ordinary work, and it is charged on the *same valuation* as the building permit fee rather than on the fee itself. It comes in two published versions: a Commercial table and a Residential one, applied by occupancy, with the residential table for one- and two-family dwellings and the commercial table for everything else. On a $250,000 commercial project the commercial table adds $650.91, which is exactly what the unincorporated county does not charge.\n\nThe **plan review** percentage is not the same for a building permit and a trade permit in the same jurisdiction. A building plan review is 65% of the building permit fee — on a $250,000 project, $1,288.48 — while an electrical plan review is 25% of the electrical permit fee and a plumbing plan review is 25% of that permit's fee. OAR 918-050-0100 is why a percentage exists at all: a plan review fee \"shall be based on a predetermined percentage of the permit fee set by the municipality\". The percentage is local; the mechanism is a state requirement.\n\nOn top of all of it sits Oregon's **12% state surcharge**, on every permit type and not only building: \"A state surcharge fee of 12% is applied to all building permit types issued in the State of Oregon\", covering building, mechanical, plumbing including fixtures, electrical including services, and structural permits. It is the same surcharge in the city and in the county, the same one in every other Oregon jurisdiction, and it is a large line — on a $250,000 project it is $237.87, more than a third of the plan review fee.\n\nTwo more things decide what a reader pays. The valuation itself is not the applicant's to choose: **OAR 918-050-0100** requires a structural permit fee for new construction to be calculated from the ICC Building Valuation Data Table current as of April 1, multiplied by the square footage, and for commercial work says the value used is \"the greater of either\" that figure or the value as stated by the applicant. And a **new house is priced by how many baths it has** rather than by how many fixtures: $792.00 for one, $1,187.00 for two, $1,388.00 for three and $334.00 for each one after that, with 100 feet of water and sewer line included per utility connection. Every other plumbing permit, including an alteration to the same house, is $63.00 per fixture.",
    valuationBasis:
      "The permit valuation is not the City's to define. OAR 918-050-0100 mandates the method: a structural permit fee for new construction and additions \"shall be calculated using the ICC Building Valuation Data Table current as of April 1 of each year, using the occupancy and construction type as determined by the building official, multiplied by the square footage of the structure\", with the square footage of a building, addition or garage \"determined from outside exterior wall to outside exterior wall for each level\". For commercial work the rule states the tie-break the City's schedule repeats word for word: \"Valuation shall be the greater of either\" the ICC figure or the value as stated by the applicant.\n\nNeither document prints the valuation table itself, so the pages here compute from the valuation you enter rather than reproducing ICC's figures. What they cannot tell you is which figure the building official would use for a given building: the schedule prices the consequence of the method, not the method's inputs, and a carport, covered porch, patio or deck is calculated separately at 50% of the value of a private garage per the same rule.\n\nOne consequence is worth stating plainly, because it is the opposite of a fee table. On a commercial project the greater of the two figures is used, so submitting a low valuation does not lower the fee — it just means the ICC-based figure is the one charged, and the market-value basis applies to alterations and repairs in the same way.",
    notIncluded:
      "These figures are what the City of Portland's own 2026 fee schedules publish, computed by this site's engine. They are not a total project cost. In particular they exclude:\n\n- **Construction excise taxes.** Metro's construction excise tax and the City's Affordable Housing Construction Excise Tax are taxes imposed by other bodies, on permit valuation, and are not permit fees.\n- **The Fire and Life Safety Review Fee**, which is 40% of the building permit fee and is charged by the Fire Marshal rather than by PP&D.\n- **Every hourly charge**: additional plan review at $228.00 an hour with a $114.00 half-hour row, inspections outside normal business hours at $320.00 an hour, investigation fees where work started without a permit at $167.00, key-milestone meetings from $228.00 an hour, peer review at $228.00 an hour per discipline, and process management from $1,806.00 for the first five hours.\n- **Program registrations**: the Facility Permit/Master Permit Program's annual registration from $255.00, the Field Issuance Remodel Program's $640.00 registration, the Major Projects Group's $112,687.00 project fee, the Emergency Quick Inspection Program's $229.00 enrolment, and the re-roof permit packets at $2,142.00 per packet of five.\n- **The deferred submittal fee** at 10% of the building permit fee on the deferred portion, with a $570.00 minimum for one- and two-family and $912.00 for commercial, halved for submittals exempt from plan review under ORS 455.628.\n- **Phased-project plan review** at 10% of the total building permit fee per phase, with a $3,936.00 per-phase maximum and $511.00 per phase.\n- **The re-inspection fee** of $167.00 per inspection beyond a band's allowance — the building table caps inspections at three in the smallest band and seven in the band below the top, and charges $167.00 for each one after that.\n- **Exterior plumbing lines and site work**: the plumbing schedule's rain, sanitary and storm drain rows and its water service row are $180.00 for the first 100 feet plus $137.00 per additional 100 feet, and it says its \"Fees for Sewer Cap, Erosion Control, and Site Review fee will be added separately\".\n- **The electrical rows not modelled**: solar above 25 kVA at $15.52 per kVA, wind generation from $587.00, borderline neon at $309.00 per elevation, wall washing at $1.23 per square foot, the $324.00 additional electrical checksheet, and the appeal fees of $346.00 for one- and two-family dwellings and $721.00 for everything else.\n- **Mechanical permits**, for which the City publishes a separate schedule that is not modelled in this release, and **appliance and equipment permits** generally.\n- **Anything the county charges that the city does not**, and vice versa: a site outside the city limits is not a Portland permit even though the same department issues it.\n- **The cost of the work itself, and any tax on it.**",
    seoTitle: "Portland permit fees: building, electrical and plumbing",
    seoDescription:
      "How Portland prices permits — a $167 minimum on valuation, a Development Services Fee the county does not charge, plan review at 65% and 25%, and Oregon's 12% state surcharge.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: PORTLAND_LAST_VERIFIED,
  },

  permitPages: [
    {
      jurisdictionKey: PORTLAND_KEYS.jurisdiction,
      permitTypeKey: "building",
      slug: "building-permit-cost",
      title: "Portland building permit cost",
      intro:
        "A Portland building permit is priced from the project valuation by a five-band table whose smallest row is a **$167.00 minimum** — $167.00 for the first $500 plus $3.59 for each additional $100 up to $2,000, then $220.85 plus $13.91 per $1,000, and so on to $1,137.78 plus $5.63 per $1,000 above $100,000. Plan review adds 65% of the permit fee, the City's **Development Services Fee** adds a second table on the same valuation, and Oregon's 12% surcharge closes it out: a $250,000 commercial project comes to $4,159.54.",
      localSummary:
        "The permit fee table is the easy part, because it is short and it chains. Five bands, and at every seam the figure the lower band produces at its top is exactly the figure the next band opens with: $220.85 at $2,000, $540.78 at $25,000, $797.28 at $50,000 and $1,137.78 at $100,000. The smallest row is a minimum, so a $500 job and a $2,000 job both pay $167.00 for the first part, and only the second is charged the $3.59 steps. One band counts in **hundreds** rather than thousands — $3.59 for each additional $100, which is $35.90 per $1,000 — and that is what makes the arithmetic land exactly on the next band's opening figure.\n\nWhat makes Portland different from most of this site is that the permit fee is not the whole of the City's charge on a building permit. The **Development Services Fee** is a second table applied to the **same valuation**, and it \"applies to all Building Permits, Site Development Permits (except where work involves only clearing) and Zoning Permits\". It has a Commercial version and a Residential version, applied by occupancy: the residential table is for one- and two-family dwellings and the commercial table is the residual category, so a project that has not named an occupancy is priced with the commercial table. On a $250,000 valuation the commercial table is $650.91 and the residential table, for a one- or two-family dwelling, is $523.01.\n\nIt also does not close at its own first seam. The commercial table's first band produces $26.49 plus fifteen steps of $1.16 at $2,000 — $43.89 — while its second band opens at **$44.79, ninety cents higher**. The residential table closes exactly: $21.19 plus fifteen steps of $0.97 is $35.74, which is what its second band opens with. The same document therefore disagrees with itself in one table and not the other, and this site reports the ninety cents rather than smoothing it.\n\n**Plan review** is 65% of the permit fee, printed as \"Plan Review/Process Fee — For the original submittal - 65% of the building permit fee, maximum of 2 allowable checksheets\", with $336.00 per additional checksheet and the same 65% applied to the additional permit fee on a value-added revision with a $489.00 minimum.\n\nThen the **12% state surcharge**, imposed by ORS 455.210(4) as four separate surcharges — 4% for state administrative costs, 2% for state inspection costs, up to 1% for administering the state building code, and 4% for the electronic building codes information system — and collected by the City. The pages here charge it on the permit fee the table produces and not on the total, because the plan review fee is itself a percentage of that figure and charging a percentage of a percentage compounds it. Read on the finished total instead, the same $250,000 project's surcharge would be $470.60 rather than $237.87 — $232.73 more — and the page says so rather than choosing quietly.\n\nNone of this starts with the City. The valuation method is mandated by **OAR 918-050-0100**: the ICC Building Valuation Data Table current as of April 1, multiplied by square footage, with the square footage measured from outside exterior wall to outside exterior wall for each level. For commercial work the rule is explicit that the fee is computed on \"the greater of either\" that figure or \"the value as stated by the applicant\", so a low stated value does not lower the fee. And the fee is not the whole cost of the permit: the building table caps included inspections at three in its smallest band and seven in the band below the top, and charges $167.00 for each inspection after that.",
      notIncluded:
        "This estimate is the Building Permit Fee table, the Development Services Fee, plan review at 65% of the permit fee and the 12% state surcharge. It excludes:\n\n- **Construction excise taxes**: Metro's and the City's Affordable Housing Construction Excise Tax, which are taxes on permit valuation imposed by other bodies rather than permit fees.\n- **The Fire and Life Safety Review Fee**, at 40% of the building permit fee, which is charged by the Fire Marshal rather than by Portland Permitting & Development.\n- **Every hourly charge**: additional plan review at $114.00 for half an hour or less and $228.00 an hour beyond, inspections outside normal business hours at $320.00 an hour, investigation where work began without a permit at $167.00 an hour with a one-hour minimum, key-milestone meetings and peer review at $228.00 an hour per discipline, and process management from $1,806.00 for the first five hours.\n- **Program and registration fees**: the Facility Permit/Master Permit Program from $255.00 a year, the Field Issuance Remodel Program's $640.00 registration and $423.00 hourly rate, the Major Projects Group's $112,687.00 project fee, and the re-roof permit packets at $2,142.00 per packet of five.\n- **The deferred submittal fee** at 10% of the building permit fee on the deferred portion, with a $570.00 minimum for one- and two-family projects and $912.00 for commercial, and 50% of that for submittals exempt from plan review under ORS 455.628.\n- **Phased-project plan review** at 10% of the total building permit fee per phase, capped at $3,936.00 per phase plus $511.00.\n- **The $167.00 re-inspection** for each inspection beyond a band's allowance, and the $167.00 inspection minimum on the investigation fee.\n- **Other permit types on the same project**: electrical, plumbing and mechanical permits are separate permits with their own schedules, and the plumbing and electrical pages of this site price two of them.\n- **The trade work itself**, and the utility and site charges assessed by other City bureaus — sewer, stormwater, water, erosion control and street use — which the schedule prices separately or says will be \"added separately\".\n- **Anything on a site outside the city limits.** Portland Permitting & Development also issues permits for unincorporated Multnomah County and for Maywood Park, and the same valuation there is priced by the county's schedule, which is the same building table without the Development Services Fee.",
      workedExample: {
        scenario:
          "A commercial tenant improvement in Portland with a construction valuation of $250,000, permitted with plans and filed as a building permit.",
        inputs: {
          valuationCents: 25_000_000,
          custom: { building_class: "commercial" },
        },
        notes:
          "The valuation falls in the top band, whose published line is $1,137.78 for the first $100,000 plus $5.63 for each additional $1,000 or fraction thereof: 150 further thousands is $844.50, so the permit fee is $1,982.28. The Development Services Fee - Commercial is charged on the same valuation from its own top band, $356.91 plus $1.96 per additional $1,000, which is $650.91. Plan review is 65% of the permit fee, $1,288.48. The state surcharge is 12% of the permit fee, $237.87. Total: $4,159.54.\n\nThe same project on unincorporated Multnomah County land is $3,508.63, because the county's schedule has the same building permit fee table — the same $1,982.28 — the same 65% plan review and the same 12% surcharge, and no Development Services Fee at all. The $650.91 is the whole difference.\n\nTwo caveats belong with the numbers. The Development Services Fee used here is the commercial table, which is the one that applies to a project that has named a commercial occupancy and also the one applied by default when no occupancy is named. And the surcharge is computed on the permit fee rather than on the finished total; on the total it would be $470.60, which is $232.73 more.",
      },
      faqs: [
        {
          question: "How much is a building permit in Portland?",
          answer:
            "It depends on the project valuation, and it is more than one table. The Building Permit Fee starts at a $167.00 minimum for anything up to $500, then $167.00 for the first $500 plus $3.59 for each additional $100 to $2,000, then $220.85 plus $13.91 per $1,000 to $25,000, and continues through $540.78 at $25,000, $797.28 at $50,000 and $1,137.78 at $100,000 plus $5.63 per $1,000 above that. On top of it: the City's Development Services Fee on the same valuation, plan review at 65% of the permit fee, and the 12% state surcharge. A $250,000 commercial project is $4,159.54 in the city.",
        },
        {
          question: "Why is a Portland permit more expensive than one just outside the city?",
          answer:
            "Because the City charges a second table on the same valuation that unincorporated Multnomah County does not. The Development Services Fee \"applies to all Building Permits, Site Development Permits (except where work involves only clearing) and Zoning Permits\", and comes in a Commercial and a Residential version. The building permit fee table itself is identical in both schedules — same bands, same minimum, same rates — as are the electrical and plumbing schedules and the 12% state surcharge. On a $250,000 commercial project the Development Services Fee is $650.91, which is exactly the difference between the city's $4,159.54 and the county's $3,508.63.",
        },
        {
          question: "What is the Development Services Fee?",
          answer:
            "A second fee table charged on the same project valuation as the building permit fee, in both a Commercial and a Residential version, and the City's own fee rather than a state one. The Commercial table runs from $26.49 to $356.91 plus a rate per additional $1,000, and the Residential table from $21.19 to $286.01 plus a rate. Its first band does not close with its second: at $2,000 the commercial table's own rate produces $43.89 while the next band opens at $44.79, ninety cents higher. The residential table's seam closes exactly.",
        },
        {
          question: "Is plan review included?",
          answer:
            "No, and it is the second largest line on the permit: 65% of the building permit fee, printed as \"Plan Review/Process Fee — For the original submittal - 65% of the building permit fee, maximum of 2 allowable checksheets\". On a $250,000 project that is $1,288.48. An extra checksheet is $336.00, and a value-added revision is another 65% on the additional permit fee with a $489.00 minimum. A trade plan review is a different percentage: 25% of the electrical or plumbing permit fee.",
        },
        {
          question: "What is the 12% state surcharge on a Portland permit?",
          answer:
            "Oregon's own surcharge, imposed by ORS 455.210(4) and collected by the City: 4% for state administrative costs, 2% for state inspection costs, up to 1% for administering and enforcing the state building code, and 4% for the electronic building codes information system — \"Total permit fee × 0.12\". The Building Codes Division states that it \"is applied to all building permit types issued in the State of Oregon\", including mechanical, plumbing including fixtures, and electrical including services. On a $250,000 project it is $237.87.",
        },
        {
          question: "Who decides the permit valuation?",
          answer:
            "The state's rule does. OAR 918-050-0100 requires a structural permit fee for new construction and additions to be calculated from the ICC Building Valuation Data Table current as of April 1, multiplied by the square footage, measured from outside exterior wall to outside exterior wall for each level. For a commercial project it says the valuation used \"shall be the greater of either\" that figure or the value as stated by the applicant, so a low stated value does not lower the fee. Alterations and repairs are priced on the fair market value of the permitted work as the schedule defines it.",
        },
      ],
      seoTitle: "Portland building permit cost: valuation table and 12% state surcharge",
      seoDescription:
        "Portland building permit fees from the City's 2026 schedule — a $167 minimum, the Development Services Fee the county does not charge, 65% plan review, the 12% state surcharge and a $250,000 example.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: PORTLAND_LAST_VERIFIED,
    },
    {
      jurisdictionKey: PORTLAND_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      slug: "electrical-permit-cost",
      title: "Portland electrical permit cost",
      intro:
        "Portland prices electrical work per job rather than per valuation: a residential square-foot package at $408.00 for 1,000 square feet with $93.00 for each additional 500, services and feeders from **$212.00** at 200 amperes to **$1,077.00** above 1,000, temporary services from $187.00, and branch circuits at **$21.00 each if the permit also bought a service** — or $174.00 for the first circuit if it did not. Plan review is 25% of the electrical permit fee and the 12% state surcharge follows everything.",
      localSummary:
        "The schedule is a list of jobs, and how a job is described decides which row applies. A 200-ampere **service or feeder** is $212.00, but 200 amperes installed as a residential **square-foot package** is $408.00 for 1,000 square feet, service included. A 300-ampere **temporary** service is $283.00 while a 300-ampere permanent one is $298.00. None of these are the same row priced twice: they are four published rows, and the rules here are gated on which one a reader selects rather than on the numbers alone.\n\nThe **branch-circuit row is the one to understand before applying**. \"Branch Circuits: New, alteration or extension per panel\" is priced twice: with the purchase of a service or feeder fee it is $21.00 a circuit, and **without** it the first branch circuit is $174.00 and each additional one is $21.00. So the same six circuits cost $126.00 on a permit that also paid for a service and $279.00 on one that did not, and the first circuit on a circuits-only permit is the most expensive single circuit the schedule sells.\n\nThe **residential square-foot package** is priced by area and includes the service: \"1,000 square feet or less — $408.00; Each additional 500 square feet or portion thereof — $93.00\", per dwelling unit and with the garage included. \"Portion thereof\" is not decoration — 1,501 square feet is three chargeable 500-foot portions, not 1.002 of them — which is why the row is modelled as a rate of $0.186 a square foot above the published first 1,000 square feet, rounded up in 500-square-foot steps, with the $408.00 as the base charge and the 1,000 square feet as the allowance. A 1,700-square-foot unit is $408.00 + two steps of $93.00 = $594.00. OAR 918-309-0030(5)(b) adds the multi-family rule: for a building of three or more apartments the fee is computed on the largest apartment and each additional apartment pays half of the first unit's fee.\n\n**Services and feeders** run $212.00 at 200 amperes, $298.00 at 201 to 400, $391.00 at 401 to 600, $588.00 at 601 to 1,000 and $1,077.00 above, with a reconnect-only row at $190.00. **Renewable energy** is $212.00 up to 5 kVA, $298.00 at 5.01 to 15 and $391.00 at 15.01 to 25, above which the schedule changes method completely: a solar generation system over 25 kVA is charged $15.52 for each kVA over 25.01 up to 100, and nothing above 100. Wind over 25 kVA is priced in two flat bands, $587.00 and $1,077.00, and above 100 kVA the schedule sends the applicant back to the standard service and feeder rows.\n\n**Plan review is 25%** of the electrical permit fee, capped at two allowable checksheets with a $324.00 fee for each additional one — a different percentage from the 65% the building permit's review is charged at, in the same jurisdiction. Then the **12% state surcharge**, which the Building Codes Division applies to electrical permits \"including services\" as well as to building permits.",
      notIncluded:
        "This estimate is the electrical schedule's item fee, plan review at 25% of that fee and the 12% state surcharge. It excludes:\n\n- **The $324.00 additional checksheet** where a review needs more than the two allowable ones, and every hourly plan review charge: $114.00 for half an hour or less and $228.00 an hour beyond.\n- **Solar generation above 25 kVA** at $15.52 per kVA up to 100, wind generation between $587.00 and $1,077.00, and the temporary-service and renewable rows above the bands modelled here.\n- **The rows the schedule prices per unit that are not modelled**: borderline neon at $309.00 per elevation, wall washing of non-illuminated signs at $1.23 per square foot, each pump or irrigation circle at $161.00, each manufactured home or modular dwelling service at $239.00, and limited energy installations at $93.00.\n- **Appeal fees**: $346.00 for a one- or two-family dwelling and $721.00 for all other occupancies, plus $176.00 for each appeal item over two.\n- **Inspections outside normal business hours** at $308.00 an hour, **investigation fees** where work began without a permit at $161.00 an hour with a one-hour minimum, and other inspections not specifically identified at $228.00 an hour.\n- **Program fees**: the Field Issuance Remodel Program's $640.00 registration and $423.00 hourly rate, and the Electrical Master Permit Program's $100.00 per-facility registration with $305.00 hourly rates.\n- **Mechanical, building and plumbing permits on the same project**, which are separate permits with their own schedules, and the building permit's 65% plan review fee.\n- **The electrical work itself**, and any utility service connection charge from Portland General Electric or Pacific Power, which is not a permit fee.",
      workedExample: {
        scenario:
          "A 200-ampere service upgrade with six branch circuits in a Portland house, filed as one electrical permit.",
        inputs: {
          custom: { electrical_item: "service", service_amps: 200, circuits: 6 },
        },
        notes:
          "Two rows apply, and their order matters. The service is $212.00 under \"Services or Feeders: Installation, alteration or relocation — 200 amps\". The six branch circuits are $21.00 each, because this permit bought a service or feeder fee: $126.00. The electrical permit fee is therefore $338.00, and the plan review is 25% of it, $84.50. The state surcharge is 12% of the same $338.00, $40.56. Total: $463.06.\n\nHad the same six circuits been filed without a service — a circuits-only permit — the first circuit would have cost $174.00 and the other five $21.00 each, so the permit fee would have been $279.00 rather than $126.00: $382.23 in all, for the same wiring. That is the schedule's own pricing, not a surcharge for filing separately, and it is the reason the page asks what else is on the permit rather than only how many circuits.\n\nThe 12% surcharge is computed on the electrical permit fee and not on the total, for the same reason as on the building page: the plan review is a percentage of the permit fee, so charging the surcharge on the two together would take a percentage of a percentage.",
      },
      faqs: [
        {
          question: "How much is an electrical permit in Portland?",
          answer:
            "It depends on the job, not on a valuation. A service or feeder is $212.00 at 200 amperes, $298.00 at 201 to 400, $391.00 at 401 to 600, $588.00 at 601 to 1,000 and $1,077.00 above that, with a reconnect-only row at $190.00. A residential square-foot wiring package is $408.00 for 1,000 square feet and $93.00 for each additional 500 square feet, service included. Branch circuits are $21.00 each with a service on the permit, or $174.00 for the first one without. Plan review is 25% and the state adds 12%.",
        },
        {
          question: "Why does the first branch circuit cost $174.00?",
          answer:
            "Because the schedule prices branch circuits twice. Row a is \"the fee for branch circuits with the purchase of service or feeder fee — $21.00\"; row b is \"the fee for branch circuits without the purchase of service or feeder fee: First branch circuit — $174.00; Each additional branch circuit — $21.00\". So six circuits are $126.00 with a service fee on the permit and $279.00 without it, and the first circuit on a circuits-only permit is the most expensive circuit in the schedule.",
        },
        {
          question: "How is a residential square-foot wiring package priced?",
          answer:
            "\"1,000 square feet or less — $408.00; Each additional 500 square feet or portion thereof — $93.00\", per dwelling unit, garage included and service included. A 1,700-square-foot unit is $408.00 plus two 500-square-foot portions, $594.00. For a building of three or more apartments the rule is different: the fee is computed on the largest apartment and each additional apartment pays half of the first unit's fee.",
        },
        {
          question: "Is plan review included in an electrical permit?",
          answer:
            "No. The schedule's Plan Review Fee row is \"25% of total electrical permit fee - Maximum number of allowable checksheets: 2\", with $324.00 for each additional checksheet. On a 200-ampere service with six circuits the permit fee is $338.00 and the plan review is $84.50. Note that this is a different percentage from the 65% charged for a building plan review in the same jurisdiction.",
        },
        {
          question: "How much is a solar permit in Portland?",
          answer:
            "A renewable energy installation is $212.00 up to 5 kVA, $298.00 at 5.01 to 15 kVA and $391.00 at 15.01 to 25 kVA. Above 25 kVA the schedule changes method: a solar generation system is charged $15.52 for each kVA over 25.01 up to 100 kVA, with no additional fee at 100.01 kVA and above, and plan review is required. Wind systems over 25 kVA are priced in flat bands of $587.00 and $1,077.00.",
        },
        {
          question: "Does an electrical permit carry the 12% state surcharge?",
          answer:
            "Yes. The Building Codes Division states that the surcharge \"is applied to all building permit types issued in the State of Oregon\", and lists electrical permits including services among them, along with building, mechanical, plumbing including fixtures and structural permits. It is 12% of the electrical permit fee — $40.56 on a $338.00 service-and-circuits permit — and it is the same surcharge the building permit pays.",
        },
      ],
      seoTitle: "Portland electrical permit cost: service, circuits and plan review",
      seoDescription:
        "Portland electrical permit fees from the City's 2026 schedule — $212 for a 200-amp service, $21 or $174 per branch circuit, the $408 residential package, 25% plan review and the 12% state surcharge.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: PORTLAND_LAST_VERIFIED,
    },
    {
      jurisdictionKey: PORTLAND_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      slug: "plumbing-permit-cost",
      title: "Portland plumbing permit cost",
      intro:
        "A Portland plumbing permit for a **new one- or two-family dwelling is priced by how many baths it has**: $792.00 for one bath, $1,187.00 for two, $1,388.00 for three and $334.00 for each additional bath or kitchen, with 100 feet included for each utility connection. Everything else — an alteration, an addition, a replaced water heater — is **$63.00 per fixture or item** across more than thirty named rows. Plan review is 25% of the permit fee and the state adds 12%.",
      localSummary:
        "There are two prices for plumbing work in Portland and they are not a scale of each other. A **new house** is priced by how many baths it has: \"New 1 & 2 Family Dwellings Only — Single Family Residence (1) bath — $792.00; (2) bath — $1,187.00; (3) bath — $1,388.00; Each additional bath/kitchen — $334.00\", and the row \"includes 100 feet for each utility connection\". Everything else is **$63.00 per fixture or item**, from a water heater to a water closet to a hose bibb, a dishwasher, a garbage disposal, a backflow preventer and an ice maker, across more than thirty named rows on the schedule.\n\nWhich of the two applies is the question the page asks first, because a house priced by its baths and then charged again for its fixtures would be billed twice for one permit. The rule that prices the dwelling's baths therefore excludes the $63.00 rows entirely, and the $63.00 rows apply only where the dwelling row does not.\n\nThe bath-based method is not the City's invention and neither is the 100 feet. **OAR 918-050-0100** requires it: a residential plumbing permit fee \"includes one kitchen and is based on the number of bathrooms, from one to three, on a graduated scale\", with \"an additional set fee\" for each additional bath or kitchen, and \"no additional fee shall be charged for the first 100 feet of water and sewer lines, hose bibbs, icemakers, underfloor low-point drains, and rain drain packages\". The rule also lists what the plumbing permit does not include — storm water retention or detention facilities, irrigation and fire suppression systems, and any water, sewer or storm piping past the first 100 feet — which is why the schedule prices exterior lines separately at $180.00 for the first 100 feet and $137.00 for each additional 100.\n\nTwo smaller rows are worth knowing. **Replacing in-building water supply lines** in a residence is $128.00 for the first floor and $52.00 for each additional floor; the commercial route beside it is priced per branch rather than per floor, $128.00 for the first five branches and $31.00 for each fixture branch over five. And the fixture list has a second, more expensive sewer cap row at $159.00, separate from the $63.00 \"Fixture/Sewer cap\" two pages earlier.\n\n**Plan review is 25%** of the plumbing permit fee, on the same row as the electrical schedule's, and the schedule's own text there is a mistake worth naming: it reads \"25% of total mechanical permit fee\". The heading above it says \"Plan Review Fee\", the paragraph above that scopes the charge to plumbing and medical gas systems under OAR 918-780-0040, and the only reading that makes it a plumbing fee is 25% of the plumbing permit fee, which is how it is modelled here and recorded in the research file. Then the **12% state surcharge**, which applies to plumbing permits \"including fixtures\".",
      notIncluded:
        "This estimate is the plumbing schedule's dwelling or fixture fee, plan review at 25% of that fee and the 12% state surcharge. It excludes:\n\n- **Exterior and site line work**: rain drain, sanitary sewer, storm sewer and water service rows at $180.00 for the first 100 feet plus $137.00 per additional 100 feet, interior mainline water and drainage piping on the same terms, site utility catch basins and area drains at $63.00, manufactured home utilities at $144.00, and the standalone storm water retention or detention facility row at $162.00.\n- **The commercial route for replacing in-building water supply lines**, which is priced per branch rather than per floor: $128.00 for the first five branches and $31.00 for each fixture branch over five.\n- **The rows of the fixture list not modelled**: solar potable water units at $139.00, the $159.00 sewer cap row, commercial roof drains at $63.00, and the irrigation and fire suppression systems the state's rule excludes from the plumbing permit altogether.\n- **Every hourly charge**: additional plan review, and the inspection and plan review hourly rates the schedule's miscellaneous pages carry.\n- **Anything else on the same project**: the building permit with its Development Services Fee, its 65% plan review and 12% surcharge; the electrical permit; the mechanical permit; and the separate sewer, stormwater and water charges billed by the Bureau of Environmental Services and the Portland Water Bureau, which are utility accounts rather than permit fees.\n- **The $63.00 per-fixture rate applied to a new house.** If the dwelling row applies, the fixtures are already inside it — 100 feet per utility connection included — and the two are never added together on this site.\n- **The cost of the fixtures and their installation**, which is the work rather than the permit.",
      workedExample: {
        scenario:
          "A new two-bath single family house in Portland, filed as one plumbing permit before construction.",
        inputs: {
          custom: { dwelling_scope: "new_1_2_family", bathrooms: 2 },
        },
        notes:
          "The dwelling row applies, so the permit fee is the published $1,187.00 for a two-bath single family residence and nothing is added per fixture — the row itself includes 100 feet for each utility connection. Plan review is 25% of the permit fee, $296.75, and the state surcharge is 12% of the same $1,187.00, $142.44. Total: $1,626.19.\n\nA one-bath house on the same schedule is $792.00 before review and surcharge, a three-bath house $1,388.00, and a four-bath house $1,388.00 plus one $334.00 additional bath — and it is worth seeing how far those rows are from the per-fixture rate. The same four-bath house charged at $63.00 a fixture, with four water closets, four basins, a tub, a shower, a kitchen sink, a dishwasher and a water heater in it, would be a third of that. The two rates answer different questions, which is why the page asks which one applies rather than assuming the larger.\n\nIf the same work were an alteration to an existing house rather than a new dwelling, the dwelling row would not be available at all: it says \"New 1 & 2 Family Dwellings Only\", and the permit would be $63.00 per fixture or item, so four fixtures would be $252.00 with $63.00 of plan review and $30.24 of surcharge — $345.24 in all.",
      },
      faqs: [
        {
          question: "How much is a plumbing permit in Portland?",
          answer:
            "For a new one- or two-family dwelling it is priced by the number of baths: $792.00 for one, $1,187.00 for two, $1,388.00 for three and $334.00 for each additional bath or kitchen, with 100 feet included for each utility connection. For anything else it is $63.00 per fixture or item, from a water heater to a hose bibb. Plan review is 25% of the permit fee and the state surcharge is 12%.",
        },
        {
          question: "How much is a water heater permit?",
          answer:
            "A replaced water heater is one fixture on the $63.00 row, so if it is the only item on the permit the plumbing fee is $63.00, with $15.75 of plan review and $7.56 of surcharge — $86.31 in all. It is not covered by the dwelling row, which is only for a new one- or two-family dwelling.",
        },
        {
          question: "Why is a plumbing permit priced by baths instead of fixtures?",
          answer:
            "Because the state's rule says so. OAR 918-050-0100 requires a residential plumbing permit fee to \"include one kitchen\" and be \"based on the number of bathrooms, from one to three, on a graduated scale\", with an additional set fee for each additional bath or kitchen — and that no additional fee be charged for the first 100 feet of water and sewer lines, hose bibbs, icemakers, underfloor low-point drains and rain drain packages. The City's schedule is the graduated scale, $792.00 to $1,388.00 plus $334.00 a bath thereafter.",
        },
        {
          question: "Does the plumbing permit include the sewer line to the street?",
          answer:
            "The first 100 feet are included through the dwelling row's \"Includes 100 feet for each utility connection\", and the state's rule is what requires that. Beyond it the schedule prices exterior lines separately: rain drain, sanitary sewer, storm sewer and water service are each $180.00 for the first 100 feet and $137.00 for each additional 100 feet, and those rows are \"in addition to the unit fixture fees\".",
        },
        {
          question: "What is the plan review percentage for plumbing?",
          answer:
            "25% of the plumbing permit fee, capped at two allowable checksheets. The row in the City's own schedule prints \"25% of total mechanical permit fee\", which is a copy-and-paste slip: the heading above it is \"Plan Review Fee\" and the paragraph above that scopes the charge to plumbing and medical gas systems under OAR 918-780-0040. Read as 25% of the plumbing permit fee — and note that a building plan review in the same jurisdiction is 65%.",
        },
        {
          question: "Are fixtures charged on top of a new house's plumbing fee?",
          answer:
            "No. The dwelling rows are the whole plumbing permit for a new one- or two-family dwelling — they are headed \"New 1 & 2 Family Dwellings Only\" and include 100 feet for each utility connection. The $63.00 per-fixture rate applies to work that is not a new dwelling: an alteration, an addition, a replacement, or any plumbing in a commercial or multi-family building. Adding the two together would bill one permit twice.",
        },
      ],
      seoTitle: "Portland plumbing permit cost: per bath, $63 per fixture, 25% review",
      seoDescription:
        "Portland plumbing permit fees from the City's 2026 schedule — $792 to $1,388 by bath plus $334 each after, $63 per fixture or item, 25% plan review and the 12% state surcharge.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: PORTLAND_LAST_VERIFIED,
    },
  ],

  verifications: [
    {
      entityType: "source",
      entityKey: PORTLAND_BUILDING_SOURCE_KEY,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: PORTLAND_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: PORTLAND_BUILDING_SOURCE_KEY,
      notes:
        "Read 2026-09-24 in three pdftotext modes from the PP&D documents library. The Building Permit Fee table was then compared against the county's separate document row by row and found identical, which is what the shared rule factory in fee-rules.ts depends on. The two Development Services Fee tables were checked for the seam behaviour described on the page: the residential table's first band produces exactly what its second band opens with, and the commercial table's does not — $43.89 against $44.79. Both figures are asserted in tests/content/portland-seed.test.ts.",
    },
    {
      entityType: "source",
      entityKey: PORTLAND_ELECTRICAL_SOURCE_KEY,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: PORTLAND_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: PORTLAND_ELECTRICAL_SOURCE_KEY,
      notes:
        "Read in three modes, then compared with the county's electrical schedule by extracting every dollar amount from both and diffing the sorted multisets: no difference. Every figure on the electrical page comes from it — the service and feeder bands, the two branch-circuit rows, the residential square-foot package and its 500-square-foot increment, the temporary service rows, the renewable rows, the plan review percentage and the appeal fees.",
    },
    {
      entityType: "source",
      entityKey: PORTLAND_PLUMBING_SOURCE_KEY,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: PORTLAND_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: PORTLAND_PLUMBING_SOURCE_KEY,
      notes:
        "Read in three modes and compared with the county's plumbing schedule on the same multisets-of-amounts basis: identical. The page's two central claims were checked against it — that a new dwelling is priced by baths with 100 feet included, and that every other permit is $63.00 per fixture or item — and the plan review row's \"25% of total mechanical permit fee\" wording was recorded as a slip in the City's document. The state rule that requires the bath method and the 100 feet is recorded separately, as OAR 918-050-0100.",
    },
    {
      entityType: "source",
      entityKey: OREGON_VALUATION_SOURCE_KEY,
      status: "verified",
      method: "official_portal_check",
      verifiedAt: PORTLAND_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: OREGON_VALUATION_SOURCE_KEY,
      notes:
        "The rule read from the Secretary of State's current-rules database on 2026-09-24, not from the City's paraphrase of it. It is the source for four claims on these pages: the ICC valuation method and the \"greater of\" tie-break for commercial work, the bath-based residential plumbing method, the inclusion of the first 100 feet of water and sewer lines, and the statement that a plan review fee \"shall be based on a predetermined percentage of the permit fee set by the municipality\".",
    },
    {
      entityType: "source",
      entityKey: "oregon-bcd-surcharge-backgrounder",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: PORTLAND_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: "oregon-bcd-surcharge-backgrounder",
      notes:
        "The Building Codes Division's backgrounder read 2026-09-24. It is the source for the 12%, for the list of permit types it covers including mechanical and electrical services, and for the four statutory surcharges of ORS 455.210(4) that add up to it. The pages charge it on the permit fee rather than on the total, and both readings are stated with the dollar difference at the example valuation.",
    },
    {
      entityType: "fee_rule",
      entityKey: "BUILD-FEE-1",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: PORTLAND_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: PORTLAND_BUILDING_SOURCE_KEY,
      notes:
        "The smallest band, which is also the schedule's minimum: \"$1 - $500 Minimum Fee — $167.00\" and \"$501 - $2,000 Fee for the first $500 — $167.00; For each additional $100 or fraction thereof up to and including $2,000 — $3.59\". The band counts in hundreds rather than thousands, which is why its rate is carried as $35.90 per $1,000 against a $100 increment. The tests assert $167.00 at $500 and $220.85 at $2,000, the latter being exactly what the next band opens with.",
    },
    {
      entityType: "fee_rule",
      entityKey: "DEV-SERVICES-COMMERCIAL-1",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: PORTLAND_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: PORTLAND_BUILDING_SOURCE_KEY,
      notes:
        "The city-only table's first band: \"$1 - $500 Minimum Fee — $26.49; $501 - $2,000 Fee for the first $500 — $26.49; For each additional $100 or fraction thereof — $1.22\", against a second band that opens at $44.79 while this band's own rate produces $43.89 at its top. The ninety cents is asserted in the tests and stated on the page rather than smoothed away, because the residential table's equivalent seam does close and the discrepancy is a property of the document.",
    },
    {
      entityType: "fee_rule",
      entityKey: "ELEC-CIRCUITS-WITHOUT-SERVICE",
      permitTypeKey: "electrical",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: PORTLAND_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: PORTLAND_ELECTRICAL_SOURCE_KEY,
      notes:
        "\"Branch Circuits: New, alteration or extension per panel — b. The fee for branch circuits without the purchase of service or feeder fee: First branch circuit — $174.00; Each additional branch circuit — $21.00\". The tests assert one circuit at $174.00 and six at $279.00, against $126.00 for the same six on a permit that bought a service — the schedule's own pricing, and the row that makes the kind of work a required input rather than the circuit count alone.",
    },
    {
      entityType: "fee_rule",
      entityKey: "ELEC-RESIDENTIAL-SQFT-PACKAGE",
      permitTypeKey: "electrical",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: PORTLAND_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: PORTLAND_ELECTRICAL_SOURCE_KEY,
      notes:
        "\"Residential Square Foot Wiring Packages for New and Remodels: Single or multi-family, per dwelling unit. Include garage. Service included. — 1,000 square feet or less — $408.00; Each additional 500 square feet or portion thereof — $93.00\". Modelled as $0.186 a square foot above the published first 1,000 square feet, rounded up in 500-square-foot steps, with the published $408.00 as the base charge — which required the engine to gain a threshold on its percent rate, because that is the shape the row has and inventing an add factor to fit the old shape would have put a number in the breakdown that appears in no document. The tests assert the row's own arithmetic at 1,000, 1,001, 1,500, 1,700 and 2,001 square feet.",
    },
    {
      entityType: "fee_rule",
      entityKey: "PLUMB-DWELLING-2BATH",
      permitTypeKey: "plumbing",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: PORTLAND_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: PORTLAND_PLUMBING_SOURCE_KEY,
      notes:
        "\"New 1 & 2 Family Dwellings Only - Includes 100 feet for each utility connection — Single Family Residence (2) bath — $1,187.00\". The row is the whole plumbing permit for that dwelling, which is why `custom.dwelling_scope` gates both it and the $63.00 per-fixture rule — a house charged once by its baths and again per fixture would be billed twice. The tests assert that a two-bath house pays $1,187.00 and no fixture line, and that four fixtures on an alteration pay $252.00 and no dwelling line.",
    },
    {
      entityType: "jurisdiction_profile",
      entityKey: PORTLAND_KEYS.jurisdiction,
      status: "verified",
      method: "manual_review",
      verifiedAt: PORTLAND_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: PORTLAND_BUILDING_SOURCE_KEY,
      notes:
        "Each claim in the profile is traceable: the building table and its minimum to the city schedule's first page, the Development Services Fee to its second and third, the 65% and 25% reviews to the schedules' plan review rows and to OAR 918-050-0100 for the requirement that a percentage exist, the bath-based plumbing method and the 100 feet to the same rule, the 12% to the Building Codes Division's backgrounder, and the difference from the county to the county's own document. The comparison table with unincorporated Multnomah County is computed by the engine from both rule sets rather than written from arithmetic done by hand.",
    },
    {
      entityType: "permit_page",
      entityKey: "building-permit-cost",
      permitTypeKey: "building",
      status: "verified",
      method: "manual_review",
      verifiedAt: PORTLAND_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: PORTLAND_BUILDING_SOURCE_KEY,
      notes:
        "The worked example was computed by the engine before the prose was written: $1,982.28 of permit fee, $650.91 of Development Services Fee, $1,288.48 of plan review and $237.87 of state surcharge, $4,159.54 in all — and $3,508.63 for the same input under the county's rules. The test recomputes both from the stored rules and asserts each component, the totals and the $650.91 difference, and a further test asserts the surcharge's subject is the permit fee alone.",
    },
    {
      entityType: "permit_page",
      entityKey: "electrical-permit-cost",
      permitTypeKey: "electrical",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: PORTLAND_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: PORTLAND_ELECTRICAL_SOURCE_KEY,
      notes:
        "Every figure on the page is a row of the City's electrical schedule, checked row by row. Two of its claims are readings rather than printed sentences and both are attributed: that the overlapping items mean a job description rather than an amperage decides the fee, and that the plan review percentage differs from the building permit's. The tests recompute the 200-ampere-with-six-circuits example at $463.06 and the same six circuits without a service at $382.23.",
    },
    {
      entityType: "permit_page",
      entityKey: "plumbing-permit-cost",
      permitTypeKey: "plumbing",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: PORTLAND_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: PORTLAND_PLUMBING_SOURCE_KEY,
      notes:
        "The page states one thing that is a reading rather than a printed sentence — that the plan review row's \"mechanical\" is a slip in the City's own document — and it says so on the page as well as here. The fixtures-are-not-added-on-top rule is enforced by the rules themselves rather than by prose, and the tests assert both directions. The worked example ($1,626.19 for a two-bath house) is computed by the engine and asserted in the tests.",
    },
  ],
};

/**
 * The pages this jurisdiction publishes: three, derived from the payload rather than
 * written out again.
 */
export const PORTLAND_PUBLISHED_PERMIT_PAGES = portlandSeed.permitPages.filter(
  (page) => page.publishStatus === "published" && !page.noindex,
);
