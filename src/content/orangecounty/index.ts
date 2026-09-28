import type { JurisdictionSeed } from "@/content/seed-types";

import {
  OC_ANNUAL_ADJUSTMENT_NOTE,
  OC_AVERAGE_COST_PER_SQ_FT,
  OC_BUILDING_RULES,
  OC_BUILDING_SOURCE_KEY,
  OC_ELECTRICAL_RULES,
  OC_FEE_EFFECTIVE_FROM,
  OC_MAIN_PHONE,
  OC_MINIMUM_TRADE_FEE_CENTS,
  OC_PLUMBING_RULES,
  OC_STATE_SURCHARGE_BPS,
  OC_STATE_SURCHARGE_MINIMUM_CENTS,
  OC_VALUATION_METHOD_NOTE,
} from "./fee-rules";

/**
 * Orange County, Florida — **a county that publishes its own valuation inputs.**
 *
 * Miami-Dade prices a building permit by area; Orange County prices it by valuation, in
 * marginal bands, and then publishes the table of average cost per square foot that the
 * valuation is derived from — 124 for an IA one-and-two-family dwelling, 97 for a VB one,
 * 158 and 106 for the same two construction types of a business. That is unusual enough to
 * be the reason this jurisdiction is here: most fee authorities make the applicant guess a
 * number the authority then uses, and this one prints the number it uses.
 *
 * The second reason is the review rows. A house pays the Building Safety section's permit
 * rows, plus a residential plans review printed in the **Zoning Division** section of the
 * same document, plus the 2.5% surcharge the Building Safety section states. A commercial
 * project pays the permit rows, plus a commercial architectural review with a $10,000
 * ceiling, plus the same surcharge — and the County's own FAQ says a new construction permit
 * "can involve review and/or inspection fees by 10 or more different divisions".
 *
 * Research record: research/florida/orange-county.md.
 */

export const OC_LAST_VERIFIED = "2026-09-24";

export const OC_KEYS = {
  state: "fl",
  county: "orange-county",
  jurisdiction: "orange-county",
  feeSchedule: OC_BUILDING_SOURCE_KEY,
  buildingSafetyPage: "orange-county-building-safety-page",
} as const;

const RESEARCHER = "Permit Fee Intelligence research pass 11 (Florida, first jurisdiction)";

/** The directory's own two-line summary of where a reader finds these rows. */
const DIRECTORY_LOCATION_NOTE =
  "\"Building Safety\" is section 3 of the document, \"Planning, Environmental and Development\", and runs from page 26 to page 45.";

const state = {
  code: "FL",
  slug: "florida",
  name: "Florida",
  fipsCode: "12",
};

const county = {
  key: OC_KEYS.county,
  slug: "orange-county",
  name: "Orange County",
  fipsCode: "12095",
};

export const orangeCountySeed: JurisdictionSeed = {
  state,
  county,

  jurisdiction: {
    key: OC_KEYS.jurisdiction,
    stateKey: OC_KEYS.state,
    countyKey: OC_KEYS.county,
    type: "county",
    slug: "orange-county",
    name: "Orange County",
    officialName: "Orange County, Florida, Division of Building Safety",
    websiteUrl: "https://www.orangecountyfl.net/PermitsLicenses/DivisionOfBuildingSafety.aspx",
    permitPortalUrl: "https://onlineservices.ocfl.net/",
    timezone: "America/New_York",
    isActive: true,
  },

  departments: [
    {
      key: "orange-county-building-safety",
      jurisdictionKey: OC_KEYS.jurisdiction,
      kind: "building",
      name: "Division of Building Safety",
      phone: OC_MAIN_PHONE,
      email: "PermittingServices@ocfl.net",
      url: "https://www.orangecountyfl.net/PermitsLicenses/DivisionOfBuildingSafety.aspx",
      addressLine: null,
      hours: null,
      notes:
        "The division whose rows are on these pages, and the one whose own FAQ answers the fee question with a caveat rather than a number: \"Permits for new construction can involve review and/or inspection fees by 10 or more different divisions. These fees are not all set amounts, but can be based on factors such as site perimeter, square footage, value of work, use/number of units and type of construction which can only be determined during plan review... Consequently, it's not possible to provide the total cost of a permit before it's ready to issue.\" The phone number is the one printed at the head of the Building Safety section of the Fee Directory. No street address is recorded here: the county's own page places counter services inside the Orange County Government Administration Building by appointment only, without printing an address this site could check.",
    },
    {
      key: "orange-county-zoning",
      jurisdictionKey: OC_KEYS.jurisdiction,
      kind: "planning",
      name: "Zoning Division",
      phone: "407-836-3111",
      email: "Zoning@ocfl.net",
      url: null,
      addressLine: null,
      hours: null,
      notes:
        "The division that publishes the residential plans review rows this site charges on the building page — $34.00 for new construction, $32.00 for anything else, $12.00 for an accessory structure — and the division whose fee pages the Building Safety directory cross-references as \"See Zoning Division Page 56\". Its contact details are quoted from the Building Safety page's own contact list, which routes residential fence, RV storage, pavers and business tax enquiries to the Zoning Division.",
    },
    {
      key: "orange-county-peds",
      jurisdictionKey: OC_KEYS.jurisdiction,
      kind: "other",
      name: "Planning, Environmental and Development Services",
      phone: "407-836-5600",
      email: null,
      url: null,
      addressLine: null,
      hours: null,
      notes:
        "The department that owns section 3 of the Fee Directory, of which the Building Safety pages are one part. Its Planning and Concurrency pages print 407-836-5600 and carry their own concurrency management, development application and impact fee schedules, none of which is a building permit fee. Named here because the directory's own headings put them in the same document as the fee schedule, which is exactly how a reader comes to add an impact fee to a permit fee.",
    },
  ],

  sources: [
    {
      key: OC_BUILDING_SOURCE_KEY,
      jurisdictionKey: OC_KEYS.jurisdiction,
      title: "Orange County Fee Directory, Fiscal Year 2025-2026",
      url: "https://www.orangecountyfl.net/Portals/0/resource%20library/Open%20Government/FeeDirectory.pdf",
      sourceType: "fee_schedule_pdf",
      issuingAuthority: "Orange County Office of Management and Budget",
      authorityKind: "county",
      isPrimary: true,
      documentDate: null,
      effectiveFrom: OC_FEE_EFFECTIVE_FROM,
      retrievedAt: OC_LAST_VERIFIED,
      lastVerifiedAt: OC_LAST_VERIFIED,
      notes:
        "The whole directory, 1,157,045 bytes, sha256 beginning 8eb4eaaec6770373, read in three pdftotext modes and compared. It is the document the Division of Building Safety's own FAQ points to: \"Please see Orange County's Fee Directory, Building Safety fees are in Section 3.\" Two details about its own dating are worth recording. Every content page in the Building Safety section is footed \"Effective July 2025\", while the table-of-contents pages still carry a stale footer reading \"Effective 10/1/13\" — the effective date on these pages is taken from the content pages, and the stale one is left in the document rather than tidied. And the document is dated by fiscal year, not by date: \"Fee Directory Fiscal Year 2025-2026, Prepared by: Office of Management and Budget\". The rows this site models are the Building Safety section's building, electrical, plumbing and gas schedules (pages 26-45), its shared Inspection Fees section (page 40), the commercial architectural review (page 44), and the residential plans review printed in the Zoning Division section (page 57).",
    },
    {
      key: OC_KEYS.buildingSafetyPage,
      jurisdictionKey: OC_KEYS.jurisdiction,
      title: "Division of Building Safety — permits, fees and frequently asked questions",
      url: "https://www.orangecountyfl.net/PermitsLicenses/DivisionOfBuildingSafety.aspx",
      sourceType: "county_website",
      issuingAuthority: "Orange County Division of Building Safety",
      authorityKind: "county",
      isPrimary: false,
      documentDate: null,
      effectiveFrom: null,
      retrievedAt: OC_LAST_VERIFIED,
      lastVerifiedAt: OC_LAST_VERIFIED,
      notes:
        "Read 2026-09-24. Not a fee schedule, and load-bearing anyway, because it is where the County states what its own fee directory does and does not cover. It answers \"How much does a permit cost?\" by pointing at the directory and then warning that \"it's not possible to provide the total cost of a permit before it's ready to issue\"; it says \"Permits for mechanical, electrical, plumbing or gas work are usually based on the estimated cost of scope of work to be completed\", which is a rule the electrical and plumbing schedules do not actually follow — they price a service by amperage and a fixture by count; and it answers the expiry question with a number: \"A permit expires 180 days after the date it was issued or 180 days from the last passed inspection\", plus \"A one-time 90-day permit extension can be granted on active permits for a fee\", which the directory prices at $32.00.",
    },
  ],

  /** Empty on purpose: the permit types this jurisdiction uses already exist. */
  permitTypes: [],
  projectTypes: [],

  jurisdictionPermitTypes: [
    {
      jurisdictionKey: OC_KEYS.jurisdiction,
      permitTypeKey: "building",
      isAvailable: true,
      localName: "Building permit",
      officialUrl: null,
      notes:
        "Priced on **total valuation** in two bands that break at $2,000,000: $26.00 to the first $1,000, then $3.00 per additional $1,000 for a one and two family dwelling, $4.00 for commercial new construction, and $5.00 for everything else. Above $2,000,000 every one of them steps down to $1.00. The County also publishes the average cost per square foot it derives a valuation from, so the number the fee is charged on is checkable rather than asserted. A residential plans review, a commercial architectural review with a $10,000 ceiling, and the 2.5% surcharge ride on top.",
    },
    {
      jurisdictionKey: OC_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      isAvailable: true,
      localName: "Electrical permit",
      officialUrl: null,
      notes:
        "Priced by **service size**, not by valuation, in three tables — single phase 240 volt, three phase 208 or 240 volt, three phase 480 volt — of six amperage bands each, plus a rate for each additional 1,000 amperes above 1,000. The same 400-ampere service is $117.00, $181.00 or $399.00 depending on which table it lands in, which is the clearest example on this site of a trade permit fee that is a function of what was installed rather than of what it cost. Flat rows cover a low-voltage permit, an equipment installation, pool wiring, a temporary construction service, tents, carnivals, a meter reset and re-inspection.",
    },
    {
      jurisdictionKey: OC_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      isAvailable: true,
      localName: "Plumbing permit",
      officialUrl: null,
      notes:
        "The simplest schedule on this site: $75.00 for new construction, an addition or an alteration, plus $6.00 per fixture, and then a list of twelve stand-alone jobs — a water heater, a softener, a backflow preventer, a re-pipe, a sewer replacement — that are each exactly $38.00. A lawn irrigation system steps by how many heads it has, from $38.00 to $64.00. The **gas** permit is its own valuation schedule in the same document, $64.00 to the first $1,000 plus $6.00 per additional $1,000, and is priced on the plumbing page because that is the division that issues it.",
    },
    {
      jurisdictionKey: OC_KEYS.jurisdiction,
      permitTypeKey: "mechanical",
      isAvailable: true,
      localName: "Mechanical permit",
      officialUrl: null,
      notes:
        "Published in the same directory and not modelled, for the reason the other states' mechanical schedules are not modelled: its air-conditioning rows are priced per ton in five marginal bands, its refrigeration rows chain on valuation at two different rates across a $25,000 break, and its exceptions list six rows with a $38.00 floor. That the 2.5% surcharge note sits between the air-conditioning table and the refrigeration table, and so applies to gas permits as well as mechanical ones, is stated on the pages because the surcharge source says it.",
    },
  ],

  feeSchedules: [
    {
      key: OC_BUILDING_SOURCE_KEY,
      jurisdictionKey: OC_KEYS.jurisdiction,
      sourceKey: OC_BUILDING_SOURCE_KEY,
      title: "Orange County Building Permit Fee Schedule (Fee Directory, Building Safety section)",
      officialUrl:
        "https://www.orangecountyfl.net/Portals/0/resource%20library/Open%20Government/FeeDirectory.pdf",
      effectiveFrom: OC_FEE_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: OC_LAST_VERIFIED,
      notes: `${DIRECTORY_LOCATION_NOTE} Its building rows are one page of tables — a one and two family dwelling, accessory structures, a roof permit on a new dwelling, a residential re-roof, the commercial and multifamily rows, and site work — all priced the same way, on total valuation, at three different rates.`,
    },
    {
      key: OC_BUILDING_SOURCE_KEY,
      jurisdictionKey: OC_KEYS.jurisdiction,
      sourceKey: OC_BUILDING_SOURCE_KEY,
      title: "Orange County Electrical Permit Fee Schedule (Fee Directory, Building Safety section)",
      officialUrl:
        "https://www.orangecountyfl.net/Portals/0/resource%20library/Open%20Government/FeeDirectory.pdf",
      effectiveFrom: OC_FEE_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: OC_LAST_VERIFIED,
      notes:
        "Pages 35 to 37 of the directory. Three service tables, a proportional-increase rule for services above 480 volts, six flat rows, and the paragraph that says what the amperage is: \"Electrical permit fees are based upon the total amperage of the service required to meet the needs of all fixtures, etc., installed. Service is determined by the KVA Load available to the premises\".",
    },
    {
      key: OC_BUILDING_SOURCE_KEY,
      jurisdictionKey: OC_KEYS.jurisdiction,
      sourceKey: OC_BUILDING_SOURCE_KEY,
      title: "Orange County Plumbing and Gas Permit Fee Schedule (Fee Directory, Building Safety section)",
      officialUrl:
        "https://www.orangecountyfl.net/Portals/0/resource%20library/Open%20Government/FeeDirectory.pdf",
      effectiveFrom: OC_FEE_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: OC_LAST_VERIFIED,
      notes:
        "Pages 38 and 39. One permit fee, one fixture charge, twelve stand-alone rows at $38.00, three irrigation bands, and the gas schedule. The plumbing rows are the only place on this site where the whole fee for an ordinary job is two lines long.",
    },
  ],

  feeRules: [
    ...OC_BUILDING_RULES.map((rule) => ({
      jurisdictionKey: OC_KEYS.jurisdiction,
      permitTypeKey: "building",
      scheduleKey: OC_BUILDING_SOURCE_KEY,
      rule,
    })),
    ...OC_ELECTRICAL_RULES.map((rule) => ({
      jurisdictionKey: OC_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      scheduleKey: OC_BUILDING_SOURCE_KEY,
      rule,
    })),
    ...OC_PLUMBING_RULES.map((rule) => ({
      jurisdictionKey: OC_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      scheduleKey: OC_BUILDING_SOURCE_KEY,
      rule,
    })),
  ],

  requirements: [
    {
      jurisdictionKey: OC_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "other",
      title: "The County publishes the valuation the fee is charged on",
      description: `${OC_VALUATION_METHOD_NOTE}\n\nTwo details of the table are worth knowing before using it. The figures are the directory's own minimums, and the fee is charged on whichever is greater: "should the contract valuation be greater it shall be used for determining the fee". And the table is not a single number per occupancy: each occupancy has nine construction types, and the spread between them is large — an IA business is 158 a square foot and the same business in VB is 106, while a storage building runs from 71 down to 43. ${OC_ANNUAL_ADJUSTMENT_NOTE}`,
      isMandatory: true,
      sortOrder: 10,
      sourceKey: OC_BUILDING_SOURCE_KEY,
      lastVerifiedAt: OC_LAST_VERIFIED,
    },
    {
      jurisdictionKey: OC_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "other",
      title: "A 2.5% state surcharge with a $4.00 floor, on every permit",
      description: `The Building Safety section states one surcharge for all of its permits: "A surcharge will be assessed at the rate of 2.5% of each permit (building, electrical, mechanical, plumbing, roof, and gas) fee associated with the enforcement of the Florida Building Code as per Florida Statutes section 468.631 and 553.721. The minimum amount collected in accordance with the Florida Statutes mentioned above on any permit issued shall be $4.00." The two statutes are the 1% and the 1.5% Miami-Dade states as two separate rows with two separate $2.00 floors; at a $147.00 permit fee the two counties therefore collect $4.00 and $4.21 respectively, and the difference is visible in both jurisdictions' tests on this site. The $4.00 floor is what most trade permits actually pay, because 2.5% of a $75.00 plumbing permit is $1.88.`,
      isMandatory: true,
      sortOrder: 20,
      sourceKey: OC_BUILDING_SOURCE_KEY,
      lastVerifiedAt: OC_LAST_VERIFIED,
    },
    {
      jurisdictionKey: OC_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "other",
      title: "Ten or more divisions can charge for one new building",
      description:
        'The Division of Building Safety states plainly that the permit fee is not the cost of the permit: "Permits for new construction can involve review and/or inspection fees by 10 or more different divisions... Consequently, it\'s not possible to provide the total cost of a permit before it\'s ready to issue." Fire Rescue publishes its own plans review and inspection fees on its own pages of the same directory, the Zoning Division publishes the residential plans review this site charges, and Planning, Environmental and Development Services publishes concurrency, development application and impact fee schedules.\n\nThe same section reduces the fee in one case and can raise every fee in another. Under Florida Statute 553.791, "applicable Permit fee(s) shall be reduced to 55% of the total permit fee if private provider is selected to perform either plan review or inspections or to 10% of the total permit fee if private provider is selected to perform both the plan review and inspections. However, in no event shall permit fees be reduced below the stated minimum." And the annual adjustment the directory reserves: "Fees will be adjusted for private providers according to Florida Statue 553.791. All fees may be adjusted annually for changes in the Consumer Price index or 3%, whichever is less."',
      isMandatory: false,
      sortOrder: 30,
      sourceKey: OC_KEYS.buildingSafetyPage,
      lastVerifiedAt: OC_LAST_VERIFIED,
    },
    {
      jurisdictionKey: OC_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "inspection",
      title: "Starting work without a permit doubles the fee",
      description:
        '"If any work is commenced without a permit, the penalty will be double the permit fee or $103.00, whichever is greater, and this penalty will be in addition to the permit fee which will be assessed." Both halves are unusual: the penalty is measured off the fee it is in addition to, and it has a floor of its own, so the cheapest possible violation costs $103.00 on top of the permit.',
      isMandatory: true,
      sortOrder: 40,
      sourceKey: OC_BUILDING_SOURCE_KEY,
      lastVerifiedAt: OC_LAST_VERIFIED,
    },
    {
      jurisdictionKey: OC_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      requirementType: "other",
      title: "The amperage of the service is the measurement, not the cost of the work",
      description:
        '"Electrical permit fees are based upon the total amperage of the service required to meet the needs of all fixtures, etc., installed. Service is determined by the KVA Load available to the premises." That last sentence is the one to hold onto: the service is sized by what the utility makes available, not by what the job happens to draw, so two identical installations can be charged differently. The County\'s general FAQ says the opposite in one sentence — "Permits for mechanical, electrical, plumbing or gas work are usually based on the estimated cost of scope of work to be completed" — and the schedule is the more specific document of the two.\n\nTwo rows in the same section are the exceptions that prove the rule: an addition, alteration or repair that does not change the service *is* priced on valuation ($38.00 to the first $1,000, then $5.00 per additional $1,000 of material and labour), and an addition, alteration or repair that *does* change the service is priced on the difference between the new amperage and the previous one, which this site does not model because it needs two amperages rather than one.',
      isMandatory: true,
      sortOrder: 10,
      sourceKey: OC_BUILDING_SOURCE_KEY,
      lastVerifiedAt: OC_LAST_VERIFIED,
    },
    {
      jurisdictionKey: OC_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      requirementType: "other",
      title: "One permit fee plus one charge per fixture, unless the job is on the stand-alone list",
      description:
        '"Permit Fee for New Construction, Addition or Alteration (Commercial or Residential, plus $6 per fixture charge, unless specified otherwise) $75.00" and "Per Plumbing Fixture charge, (added, plugged, moved or future opening) 6.00". The parenthetical is what decides most plumbing permits: a job that is on the stand-alone list — a water heater, a solar water heater, a backflow preventer, a water softener, a sewer replacement, a re-pipe, a spa with permanent connections, a mobile home, a second irrigation meter, or a replacement of a permit that expired less than six months ago — pays $38.00 and no fixture charge, and everything else pays $75.00 plus $6.00 a fixture. In the commercial case the per-unit re-pipe row is expressly "per unit", so a re-pipe across a building with eight units is charged eight times.',
      isMandatory: true,
      sortOrder: 10,
      sourceKey: OC_BUILDING_SOURCE_KEY,
      lastVerifiedAt: OC_LAST_VERIFIED,
    },
    {
      jurisdictionKey: OC_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      requirementType: "other",
      title: "A permit is valid for 180 days, and one extension is available",
      description:
        '"A permit expires 180 days after the date it was issued or 180 days from the last passed inspection." The County offers "A one-time 90-day permit extension" on active permits, priced in the directory\'s Other Fees section at $32.00, and a permit that expired inside six months can be replaced rather than re-applied for, at $38.00. Past six months the extension is gone and "plans will be discarded and applicant shall be required to resubmit plans and pay another submittal fee".',
      isMandatory: true,
      sortOrder: 20,
      sourceKey: OC_KEYS.buildingSafetyPage,
      lastVerifiedAt: OC_LAST_VERIFIED,
    },
  ],

  profile: {
    jurisdictionKey: OC_KEYS.jurisdiction,
    headline: "Orange County building permit fees, from the County's own valuation table",
    summary:
      "Orange County charges a building permit on **total valuation**, in marginal bands that break at $2,000,000 — $26.00 to the first $1,000, then $3.00 per additional $1,000 for a one and two family dwelling, $4.00 for commercial new construction, $5.00 for everything else, and $1.00 above two million. Its trade permits are priced by what was installed: an electrical permit by the amperage of the service, a plumbing permit at $75.00 plus $6.00 a fixture or $38.00 for a stand-alone job, a gas permit on valuation. Every one of them carries a 2.5% state surcharge with a $4.00 floor, and every one of them is charged on its own permit fee rather than on the bill.",
    localContext:
      "This is the jurisdiction that answers the question a fee schedule usually raises and leaves open: where does the valuation come from? Above its building tables the directory prints, in its own words, that \"the following minimum schedule of valuations shall be applied to the structure(s) for which a permit is filed. However, should the contract valuation be greater it shall be used\", followed by a full ICC occupancy-by-construction-type table of average cost per square foot. A 2,500 square foot house is therefore 2,500 times 97 — VB, the ordinary wood-frame type — which is $242,500, which is band one of the residential table, which is $752.00.\n\nThe second local fact is who is charging. The County's Division of Building Safety prices the permit and the inspection; the Zoning Division prints the residential plans review the site charges in the same total; Fire Rescue, Environmental Protection, Utilities and Planning each publish their own schedules in the same document, which is why the division's own FAQ declines to quote a total. Its estimate is honest in the way that matters: it says the number can only be finished once the plan review is.",
    valuationBasis:
      "The greater of the County's published average cost per square foot, by occupancy class and construction type, and the contract valuation. Three notes decide the figure: \"Unfinished basements (all use groups) = $15.00 per sq.ft.\", \"For shell only buildings deduct 20%\", and \"Private Detached Garages use 'Utility, miscellaneous'\".",
    notIncluded:
      "These pages price the permit fee rows, the plans review row that applies to the project, and the 2.5% state surcharge. They exclude:\n\n- **Other divisions' fees on the same project**: Fire Rescue's plans review and inspection fees, the Planning, Environmental and Development and Zoning review fees that accompany a commercial site plan, Lot Grading and Development Engineering charges, and every impact fee, which the directory publishes in its own schedules and which are the reason the County declines to quote a total.\n- **The Plan Submittal Fee** and its re-submittal table: a non-refundable per-project fee of $32.00 below $10,000 of valuation, $54.00 to $25,000, $106.00 to $50,000, $212.00 to $100,000, $424.00 to $500,000, $637.00 to $1,000,000, $849.00 above, plus $22.00 per additional $100,000 over $2,000,000 — and \"N/C\" for a one and two family dwelling. It is conditional on all building permits being issued at once, which is a workflow rather than a property of the project, so it is stated here rather than charged.\n- **The private provider reduction** under F.S. 553.791: 55% of the total permit fee if a private provider does either the plan review or the inspections, 10% if it does both, and never below the minimum fee.\n- **The mechanical schedule**: air conditioning at $75.00 to three tons and $12.00 a ton to ten, then marginal rates to fifty tons and $5.00 a ton above; refrigeration, ductwork, hoods and boilers priced on valuation at two rates across a $25,000 break.\n- **The sign schedule**: $38.00 to 25 square feet rising to $69.00 to 300 square feet, then $11.00 per additional 100 square feet.\n- **Demolition**: priced per 25,000 cubic feet with a $25.00 minimum and a $400.00 maximum, which needs a volume this site does not collect.\n- **Everything priced by the hour or by the sheet**: after-hours inspections at a four-hour $212.00 minimum and $51.00 an hour after, additional plan review at actual labour rates, contractor list processing at $43.00 an hour, plan reproduction at $4.00 a sheet and stamping at $3.00 a page.\n- **The refund and penalty tables**: a refund of a permit fee costs \"a minimum of $31.00 or 1/3 of the permit fee, whichever is greater\", and work begun without a permit is penalised at double the permit fee or $103.00, whichever is greater, on top of the fee.\n- **Any permit on land in a city.** Orlando, Winter Park, Apopka, Ocoee, Maitland, Edgewood, Belle Isle, Windermere, Oakland and Winter Garden each issue their own permits and set their own fees, and a City of Orlando address is not covered by any figure on this page.",
    seoTitle: "Orange County FL Building Permit Fees (2025-2026 Fee Directory)",
    seoDescription:
      "What an Orange County, Florida building, electrical, plumbing or gas permit costs, calculated from the County's own valuation bands and its published cost-per-square-foot table, with the 2.5% state surcharge and its $4.00 floor.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: OC_LAST_VERIFIED,
  },

  permitPages: [
    {
      jurisdictionKey: OC_KEYS.jurisdiction,
      permitTypeKey: "building",
      slug: "building-permit-cost",
      title: "Orange County building permit cost",
      intro:
        "An Orange County building permit is charged on **total valuation**, and the County publishes the table it uses to derive one: a one and two family dwelling is $26.00 up to the first $1,000 of valuation, then $3.00 per additional $1,000 to $2,000,000 and $1.00 above it; commercial new construction is the same shape at $4.00, and everything else at $5.00. A 2,500 square foot house of ordinary construction is valued at the County's own **97 a square foot**, which is $242,500, which makes the permit fee **$752.00**, the residential plans review $34.00 and the 2.5% state surcharge $18.80 — **$804.80**.",
      localSummary:
        "Two bands, three rates and one break at $2,000,000 is the whole of the building table. What makes this jurisdiction worth reading is the arithmetic behind the number it is charged on. Above the bands the directory prints an ICC table of **average cost per square foot** by occupancy and construction type and says the fee is charged on whichever is greater, that figure or the contract valuation. A 2,500 square foot one and two family dwelling at VB is 2,500 x 97 = $242,500 and pays $752.00; the same 2,500 square feet as an IA business at 158 is $395,000 and pays $1,592.00. Neither number is guesswork, and the second one is why a permit estimate that only asks for square footage is not an estimate.\n\nFour things decide which row applies. **Occupancy**: a one and two family dwelling is a row of its own, and accessory structures to one — a utility building, a pool, a pool screen enclosure, a boat dock, a slab poured after the original construction, an air conditioner, a generator — are a second row at $26.00 plus **$4.00** per additional $1,000, which is a higher rate than the house they stand beside. **The kind of work**: commercial new construction is $4.00 and commercial work that is not new construction is $5.00, and the same split exists for roofs, where a residential re-roof is $5.00 per $1,000 against the house's $3.00. **A roof on a new dwelling** is a flat $38.00, and a roof on new construction under an active general contractor permit needs a permit but no fee. **Site work only** is a flat $27.00.\n\nThe review rows come from two different divisions. For a one and two family dwelling the County publishes three flat figures in the **Zoning Division** section of the directory — $34.00 for new construction, $32.00 for anything else, $12.00 for an accessory structure, with the note listing what an accessory structure covers. For a commercial project the review is in the Building Safety section itself: \"Architectural Standards and Guidelines for Commercial Buildings and Projects\", $27.00 up to the first $1,000 of value and $3.00 per additional $1,000, capped at **$10,000** — the only ceiling on this page, and one that stops the review rising at about $3.3 million of valuation. It applies to C-1, C-2, C-3 and Professional Office buildings and the commercial components of Planned Developments, which is why this site asks for the zoning classification: a commercial project that has not named one is left out of the total rather than charged a fee that may not apply to it.\n\nThen the **2.5% surcharge**, stated in the Building Safety section as one row with a $4.00 floor and citing the same two Florida Statutes Miami-Dade cites as two rows. It is charged on each permit's fee, so a $75.00 plumbing permit pays $4.00 rather than $1.88, and a $752.00 building permit pays $18.80. On the whole bill instead of on the permit fee the same house would pay $20.12, and the page would rather say so than choose quietly.\n\nAnd a warning the County gives about its own total: \"Permits for new construction can involve review and/or inspection fees by 10 or more different divisions... Consequently, it's not possible to provide the total cost of a permit before it's ready to issue.\" What is calculated here is the Building Safety rows, the review row that applies, and the surcharge. Fire Rescue, Planning, Environmental Protection, Utilities and Engineering each publish their own schedules in the same document, and none of them is on this page.",
      notIncluded:
        "This estimate is the building permit table, the plans review row for the project, and the 2.5% state surcharge. It excludes:\n\n- **Every other division's charge**: Fire Rescue plans review and inspection, Zoning review of a commercial site plan, Lot Grading and Development Engineering, concurrency and impact fees, and the Utilities connection charges.\n- **The Plan Submittal Fee** and its re-submittal table, which are conditional on all permits being issued simultaneously, and the $27.00 permit amendment fee, the $106.00 early start permit and the $173.00 temporary certificate of occupancy.\n- **The private provider reduction** under F.S. 553.791, which takes the permit fee to 55% or 10% of the total but never below the minimum.\n- **The mechanical and sign schedules**, and **demolition**, which is priced per 25,000 cubic feet.\n- **The penalty for starting work without a permit**, which is double the permit fee or $103.00, whichever is greater, in addition to the fee itself.\n- **Anything the mechanical, electrical and plumbing permits on the same project cost**, which this site prices on their own pages.\n- **Sites inside a city.** The ten municipalities in the county issue their own permits and set their own fees.",
      workedExample: {
        scenario:
          "A new one and two family dwelling in unincorporated Orange County: 2,500 square feet, construction type VB, no contract valuation stated, permitted as a building permit.",
        inputs: {
          valuationCents: 2_500 * 97 * 100,
          occupancy: "residential",
          workType: "new_construction",
        },
        notes:
          "The valuation is the County's own: 2,500 square feet at the 97 a square foot its table gives an R-3 dwelling of construction type VB, so $242,500. That is band one of the residential table — $26.00 for the first $1,000 plus 242 further thousands at $3.00, since the 242nd thousand is a fraction and the schedule charges \"each additional $1,000 or fraction thereof\" — so the permit fee is $752.00. The Zoning Division's residential plans review for new construction is a flat $34.00. The state surcharge is 2.5% of the permit fee, $18.80. Total: **$804.80**.\n\nTwo variations worth the arithmetic. Change the occupancy to commercial new construction and keep everything else: $26.00 plus 242 thousands at $4.00 is $994.00, and with a C-2 zoning classification the commercial architectural review adds $27.00 plus 242 thousands at $3.00, $753.00, and the surcharge is $24.85 — $1,771.85. Raise the valuation to $2,000,000 exactly and band one produces $6,023.00 for the house, which is exactly what band two opens with, so the break at two million does not step. At $2,000,001 the thousand above the break is a fraction thereof and band two charges $6,024.00.\n\nThe estimate is deliberately not the cost of the permit. If the same house is re-roofed, the roof is priced separately at $26.00 plus $5.00 per additional $1,000; if the work starts before the permit, the penalty is double the fee; and the development review, fire and utility charges that other divisions assess are not included at all.",
      },
      faqs: [
        {
          question: "How does Orange County decide what my project is worth?",
          answer:
            "It publishes the table it uses. Above the building fee bands the directory prints an ICC occupancy-by-construction-type schedule of average cost per square foot and says \"the following minimum schedule of valuations shall be applied to the structure(s) for which a permit is filed. However, should the contract valuation be greater it shall be used for determining the fee\". Three notes amend it: unfinished basements are $15.00 a square foot in every use group, shell-only buildings deduct 20%, and private detached garages are valued as \"Utility, miscellaneous\". The example on this page is a 2,500 square foot VB dwelling at the 97 a square foot the table gives it.",
          sourceId: OC_BUILDING_SOURCE_KEY,
          attribution: "Orange County Fee Directory, FY 2025-2026, Building Safety section",
        },
        {
          question: "Why is a commercial permit charged more than a house on the same valuation?",
          answer:
            "Because the County prints three different rates for the same measurement. A one and two family dwelling pays $26.00 plus $3.00 per additional $1,000; commercial and multifamily new construction pays $26.00 plus $4.00; and commercial work that is not new construction pays $26.00 plus $5.00 — as does a re-roof, residential or commercial, and an accessory structure to a dwelling. Above $2,000,000 every one of them drops to $1.00 per additional $1,000, so a large enough project ends up paying the same marginal rate whichever row it started in.",
          sourceId: OC_BUILDING_SOURCE_KEY,
          attribution: "Orange County Fee Directory, FY 2025-2026, page 27",
        },
        {
          question: "Is the plans review included?",
          answer:
            "The one the County publishes for your kind of project is, and it comes from two different divisions. A one and two family dwelling is reviewed in the Zoning Division's section at a flat $34.00 for new construction or $32.00 for anything else, and an accessory structure at $12.00. A commercial project is reviewed under the Building Safety section's Architectural Standards and Guidelines at $27.00 plus $3.00 per additional $1,000 of value, capped at $10,000, and scoped to C-1, C-2, C-3 and Professional Office buildings and the commercial components of Planned Developments — so name the zoning classification, or the review is left out of the total rather than guessed at.",
          sourceId: OC_BUILDING_SOURCE_KEY,
          attribution: "Orange County Fee Directory, FY 2025-2026, pages 44 and 57",
        },
        {
          question: "What is the $4.00 item on my trade permit?",
          answer:
            "The state surcharge's floor. The County states it as one row: \"A surcharge will be assessed at the rate of 2.5% of each permit (building, electrical, mechanical, plumbing, roof, and gas) fee associated with the enforcement of the Florida Building Code as per Florida Statutes section 468.631 and 553.721. The minimum amount collected... on any permit issued shall be $4.00.\" Most trade permits pay exactly the minimum, because 2.5% of a $75.00 plumbing permit is $1.88 and 2.5% of a $59.00 pool wiring permit is $1.48.",
          sourceId: OC_BUILDING_SOURCE_KEY,
          attribution: "Orange County Fee Directory, FY 2025-2026, page 44",
        },
        {
          question: "Can the fee be lower if I hire my own inspector or plan reviewer?",
          answer:
            "Yes, by a lot, and it is in the same section: \"In accordance with Florida Statute 553.791 applicable Permit fee(s) shall be reduced to 55% of the total permit fee if private provider is selected to perform either plan review or inspections or to 10% of the total permit fee if private provider is selected to perform both the plan review and inspections. However, in no event shall permit fees be reduced below the stated minimum.\" At 10% of the $752.00 permit fee in the example on this page, the fee would be $75.20, and the site does not compute the reduction because the workflow it depends on is not an attribute of the project.",
          sourceId: OC_BUILDING_SOURCE_KEY,
          attribution: "Orange County Fee Directory, FY 2025-2026, page 40",
        },
        {
          question: "What happens if I start the work without a permit?",
          answer:
            "\"If any work is commenced without a permit, the penalty will be double the permit fee or $103.00, whichever is greater, and this penalty will be in addition to the permit fee which will be assessed.\" A plan review, a fire review and a re-inspection may follow, and the County's Building Safety page adds that a permit expires 180 days after issue or 180 days from the last passed inspection, with one 90-day extension available for $32.00.",
          sourceId: OC_BUILDING_SOURCE_KEY,
          attribution: "Orange County Fee Directory, FY 2025-2026, page 42",
        },
        {
          question: "How is a renovation priced, and a re-roof?",
          answer:
            "Residential work that is not new construction is priced on the same valuation bands as a house — $26.00 plus $3.00 per additional $1,000 — and the zoning review is the $32.00 row. Commercial work that is not new construction steps up to $5.00 per additional $1,000, and a re-roof is charged on the value of the roofing work alone at $26.00 plus $5.00 per additional $1,000 for a house and $26.00 plus $5.00 for a commercial building, with the commercial roof permit itself printed as a flat $54.00 for the first $1,000 of valuation of a new roof. A roof on a new dwelling is a flat $38.00.",
          sourceId: OC_BUILDING_SOURCE_KEY,
          attribution: "Orange County Fee Directory, FY 2025-2026, page 27",
        },
        {
          question: "Does this cover a project inside Orlando, or inside any city?",
          answer:
            "No. Orange County issues permits in unincorporated Orange County. Orlando, Winter Park, Apopka, Ocoee, Maitland, Edgewood, Belle Isle, Windermere, Oakland and Winter Garden are each their own permitting authority with their own fee schedule, and an address inside one of them is not priced by any figure here.",
          sourceId: OC_KEYS.buildingSafetyPage,
          attribution: "Orange County Division of Building Safety",
        },
      ],
      seoTitle: "Orange County FL Building Permit Cost (2025-2026 Fee Directory)",
      seoDescription:
        "An Orange County, Florida building permit is charged on total valuation — $26.00 to the first $1,000, then $3.00, $4.00 or $5.00 per additional $1,000 — from the County's own cost-per-square-foot table, plus review and the 2.5% surcharge.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: OC_LAST_VERIFIED,
    },

    {
      jurisdictionKey: OC_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      slug: "electrical-permit-cost",
      title: "Orange County electrical permit cost",
      intro:
        "An Orange County electrical permit is priced by the **size of the service**, in three tables: single phase 240 volt, three phase 208 or 240 volt, and three phase 480 volt. Each has six amperage bands and a rate for each additional 1,000 amperes above 1,000. The same 400-ampere service is **$117.00** in the single phase table, **$181.00** in the three phase table and **$399.00** at 480 volts, plus a 2.5% state surcharge with a $4.00 floor — so $121.00, $185.53 and $408.98.",
      localSummary:
        "The schedule starts by saying what it measures, which is not what most trade schedules measure: \"Electrical permit fees are based upon the total amperage of the service required to meet the needs of all fixtures, etc., installed. Service is determined by the KVA Load available to the premises.\" So the fee follows the size of the service the utility makes available rather than the cost of the work or the load the job happens to draw.\n\nThe three tables are alternatives, not a chain, and their bands do not overlap: 0 to 150 amperes, 151 to 200, 201 to 400, 401 to 600, 601 to 800, and 801 to 1,000. At 480 volts they repeat at roughly double the single phase figures — $250.00, $313.00, $399.00, $606.00, $796.00 and $982.00 — and there is a seventh rule above them: a service above 480 volts \"will be determined by a proportional increase over the cost for 480V\", illustrated by the directory with a 600-ampere, 480-volt service at $606.00 becoming $60,600.00 where 48,000 volts are available from the transformer. That row needs a voltage, so this site names it rather than models it.\n\nAbove 1,000 amperes each table has a rate rather than a band: $170.00, $281.00 or $584.00 \"per ea. add'l. 1,000 amp or fraction\". A 1,500-ampere three phase service is therefore one additional thousand, $281.00, not half of one; and whether the 801-to-1,000 band is charged as well on top of it is not stated, so the page prices both readings.\n\nThe flat rows are where the small jobs live: a temporary construction service for a one or two family dwelling site at $27.00 — maximum 60 amperes, 240 volts, single phase — a low voltage permit at $38.00 to the first $1,000 of valuation and $5.00 per additional $1,000, an installation of one item of equipment at $38.00 \"regardless of amperage\", pool wiring at $59.00, a T.U.G. agreement at $106.00, a tent at $59.00 plus $11.00 for each additional tent, a carnival safety inspection at $101.00, a meter reset at $38.00 and a re-inspection at $38.00. Two of those — the meter reset and the re-inspection — are printed in the division's own shared Inspection Fees section rather than in the electrical schedule, which is why the same two figures appear on the plumbing page of this site.\n\nOne row is priced on valuation after all: an addition, alteration or repair that does **not** require a change in service, at $38.00 to the first $1,000 \"(All valuations based on material and labor costs)\" and $5.00 per additional $1,000. Its sibling — work that **does** change the service — is priced on \"the difference between the new service amperage and the previous service amperage, if positive\", which is a basis this site does not have: it needs two amperages to compute one fee.\n\nThen the 2.5% surcharge on every permit, with its $4.00 floor. It is the reason the smallest rows on this schedule all cost $4.00 more than the table says, and the reason a 400-ampere single phase service at $117.00 pays $121.00.",
      notIncluded:
        "This estimate is the electrical permit row that applies and the 2.5% state surcharge. It excludes:\n\n- **The service above 480 volts**, which is priced as a proportional increase over the 480-volt cost measured by the voltage available from the transformer, and needs a voltage this site does not collect.\n- **The mechanical work on the same job** — air conditioning, refrigeration, hoods and ventilation — which is a separate permit with its own schedule, and the **gas** permit, which this site prices on its plumbing page because the same division issues both.\n- **After-hours inspections**: a four-hour minimum at $212.00, then $51.00 an hour.\n- **The $11.00 collection fee** added to a re-inspection unpaid for more than sixty days, and the $32.00 administrative extension.\n- **The part of a refund**: refunding a permit costs \"a minimum of $31.00 or 1/3 of the permit fee, whichever is greater\".\n- **Engagement with the utility**: the schedule prices the permit, not the connection, the meter or the service the utility installs.\n- **The penalty for working without a permit**, at double the permit fee or $103.00, whichever is greater.",
      workedExample: {
        scenario:
          "A commercial building in unincorporated Orange County with a 400-ampere, three phase 208/240 volt service, permitted as an electrical permit.",
        inputs: {
          custom: { electrical_service: "three_phase_208_240", amperage: 400 },
        },
        notes:
          "The 400-ampere service is in the table's fourth band, where both the 151-200 band and the 201-400 band are alternatives and neither is added to the other: the row prints 201 to 400 — **$181.00**. The service is 400 amperes exactly, so the rate above 1,000 does not apply. The state surcharge is 2.5% of $181.00, $4.53. Total: **$185.53**.\n\nThe same service in the other two tables shows what a schedule that prices the installation rather than the cost of the work does: 400 amperes single phase is $117.00 and pays $121.00, because 2.5% of $117.00 is $2.93 and the $4.00 floor applies; 400 amperes at 480 volts is $399.00 and pays $408.98. One measurement, three answers, spanning $287.98.\n\nThe same 400 amperes of 480-volt service in the site's plumbing example — an unrelated job, listed only to show the shape of the schedule — would be $408.98, and a 1,500-ampere three phase service is charged as one additional thousand amperes above 1,000 at $281.00 and pays $288.03, with the 801-1,000 band's $468.00 not counted. If the County charges that band as well, the figure is $288.03 + $479.70 — the band and its own surcharge — and the page states both readings because the schedule does not say.",
      },
      faqs: [
        {
          question: "What is measured to price an electrical permit?",
          answer:
            "The amperage of the service, and the directory is explicit about which amperage: \"Electrical permit fees are based upon the total amperage of the service required to meet the needs of all fixtures, etc., installed. Service is determined by the KVA Load available to the premises.\" Not the cost of the work, and not the load the installation happens to draw — the size of the service the premises is given.",
          sourceId: OC_BUILDING_SOURCE_KEY,
          attribution: "Orange County Fee Directory, FY 2025-2026, page 35",
        },
        {
          question: "Why does the same amperage cost three different amounts?",
          answer:
            "Because there are three tables, one per service type, and their rates differ widely: a 400-ampere service is $117.00 single phase 240 volt, $181.00 three phase 208 or 240 volt, and $399.00 three phase 480 volt. The 480-volt table is roughly double the single phase table at every band, from $250.00 against $75.00 in the first band to $982.00 against $308.00 in the sixth.",
          sourceId: OC_BUILDING_SOURCE_KEY,
          attribution: "Orange County Fee Directory, FY 2025-2026, page 36",
        },
        {
          question: "What does a service above 1,000 amperes cost?",
          answer:
            "Each table prints a rate rather than a band: $170.00 single phase, $281.00 three phase 208/240 and $584.00 at 480 volts, per each additional 1,000 amperes or fraction thereof. \"Or fraction thereof\" is why a 1,001-ampere service and a 2,000-ampere service both pay one additional thousand, and a 2,001-ampere service pays two. Whether the 801-1,000 band is charged as well is not stated anywhere in the schedule, so this page shows the fee both with and without it.",
          sourceId: OC_BUILDING_SOURCE_KEY,
          attribution: "Orange County Fee Directory, FY 2025-2026, page 36",
        },
        {
          question: "What about a new service for a house under construction?",
          answer:
            "\"Exception: Temporary construction service for 1 and 2 family dwelling construction sites shall be (Maximum 60 amps/240 volts/single phase) 27.00\", plus the $4.00 surcharge. It is the cheapest row on the electrical schedule and the only one with its limits printed in the rate table.",
          sourceId: OC_BUILDING_SOURCE_KEY,
          attribution: "Orange County Fee Directory, FY 2025-2026, page 36",
        },
        {
          question: "Is a panel change or a repair priced on valuation?",
          answer:
            "Sometimes. Work that does not require a change in service is priced on valuation — $38.00 to the first $1,000 of \"material and labor costs\", then $5.00 per additional $1,000 — and work that does require a change in service is priced on \"the difference between the new service amperage and the previous service amperage, if positive\", which is a fee on the increase alone. This site computes the first and not the second, which needs two amperages to produce one number.",
          sourceId: OC_BUILDING_SOURCE_KEY,
          attribution: "Orange County Fee Directory, FY 2025-2026, page 37",
        },
        {
          question: "How much is a re-inspection or a meter reset?",
          answer:
            "$38.00 each, from the division's shared Inspection Fees section rather than from the electrical schedule itself, which is why the same two figures appear on the plumbing page. A re-inspection fee unpaid for more than sixty days adds \"a $11.00 collection fee per account\", and there is a separate after-hours inspection fee with a four-hour minimum at $212.00 and $51.00 an hour after that.",
          sourceId: OC_BUILDING_SOURCE_KEY,
          attribution: "Orange County Fee Directory, FY 2025-2026, page 40",
        },
      ],
      seoTitle: "Orange County FL Electrical Permit Cost (2025-2026 Fee Directory)",
      seoDescription:
        "An Orange County, Florida electrical permit is priced by service amperage — 400 amperes is $117.00 single phase, $181.00 three phase or $399.00 at 480 volts — plus a 2.5% state surcharge with a $4.00 minimum.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: OC_LAST_VERIFIED,
    },

    {
      jurisdictionKey: OC_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      slug: "plumbing-permit-cost",
      title: "Orange County plumbing permit cost",
      intro:
        "An Orange County plumbing permit for new construction, an addition or an alteration is **$75.00 plus $6.00 per fixture**, and twelve named stand-alone jobs — a water heater, a solar water heater, a backflow preventer, a water softener, a sewer replacement, a re-pipe, a spa with permanent connections, a mobile home, a second irrigation meter, an expired replacement and a few more — are **$38.00** each. A swimming pool is $64.00, a lawn irrigation system is $38.00 to 100 heads, $54.00 to 200 and $64.00 above, and a gas permit is priced on valuation at $64.00 to the first $1,000 plus $6.00 per additional $1,000. Every one of them carries a 2.5% state surcharge with a $4.00 floor.",
      localSummary:
        "This is the simplest schedule on the site, and the $4.00 surcharge floor is what makes it interesting. Six fixtures on one permit come to $75.00 + $36.00 = $111.00, and the surcharge on it is 2.5%, or $2.78 — so the county collects the $4.00 minimum instead, and the total is **$115.00**. A stand-alone water heater is $38.00 and pays $42.00, of which $4.00 is the state. The floor is worth knowing before comparing trades: 2.5% of anything below $160.00 is less than $4.00, and most of this schedule's rows are below $160.00.\n\nThe rule that decides which row applies is the parenthetical in the first one: \"Permit Fee for New Construction, Addition or Alteration (Commercial or Residential, plus $6 per fixture charge, unless specified otherwise) $75.00\". \"Unless specified otherwise\" points at the list of stand-alone rows, and that list is where a plumbing job usually lands. It is worth reading closely for two entries. A **re-pipe** appears twice, once residential at $38.00 and once commercial \"per unit\" at $38.00, so a re-pipe across an eight-unit building is eight charges. And a swimming pool is not on the list: it has its own $64.00 permit row, while the spa **with permanent connections** is on the list at $38.00 — and the pool's electrical wiring is a separate $59.00 on the electrical page, not included here.\n\nThe fixture charge is the row to avoid double-counting. It is a charge \"(added, plugged, moved or future opening)\" for each fixture, and it rides on the same permit as the $75.00 rather than replacing it. The site adds it once per fixture the caller reports.\n\n**Gas** is the one part of this schedule priced on valuation, and it is its own schedule in the same document: \"Equipment, Ventilation, Combustion Air, Piping, Boilers and any other installation(s) which requires(s) a Gas Permit — valuation based on cost of all equipment supplied by owner or contractor, materials and labor — up to and including the first $1,000 $64.00; for each additional $1,000 or fraction thereof 6.00\". It is priced on this page because the same division issues it, and because a gas permit with no plumbing permit beside it is the ordinary case for a water heater replacement.\n\nThe **mechanical** schedule lives in the same section and is not modelled anywhere on this site: air conditioning is priced per ton in marginal bands from $75.00 for up to three tons, and refrigeration, ductwork, hoods and boilers are priced on valuation at $38.00 to the first $1,000, then $10.00 per additional $1,000 to $25,000 and $6.00 above that, with a $38.00 re-inspection row and one footnote that matters: under the Florida Power Plant Siting Act, mechanical equipment directly related to electrical power generation is valued at 25% of its actual cost for the purpose of the permit fee.",
      notIncluded:
        "This estimate is the plumbing permit row and fixture charge that apply, the gas row when the job is a gas job, and the 2.5% state surcharge. It excludes:\n\n- **The mechanical permit** on the same project: air conditioning per ton, and refrigeration, hoods and ventilation on valuation.\n- **The electrical work**: a pool's wiring is a separate electrical permit at $59.00, and a water heater that needs a new circuit is a separate permit too.\n- **Irrigation backflow and water service charges** from the utility, and the site's own water and sewer connection fees.\n- **After-hours inspections** at a four-hour $212.00 minimum, and the $11.00 collection fee on a re-inspection unpaid for more than sixty days.\n- **The $32.00 administrative extension** and the $38.00 replacement of a permit expired within six months.\n- **The penalty for working without a permit**, at double the permit fee or $103.00, whichever is greater.\n- **The private provider reduction** under F.S. 553.791, which takes a permit fee down to 55% or 10% of the total but never below the minimum.",
      workedExample: {
        scenario:
          "A new house in unincorporated Orange County with six plumbing fixtures — two water closets, two lavatories, one bath tub and one kitchen sink — permitted as a plumbing permit.",
        inputs: {
          fixtures: 6,
          custom: { plumbing_item: "new_construction" },
        },
        notes:
          "The permit fee is the flat $75.00 the schedule prints for new construction, addition or alteration, and the fixture charge is six times $6.00, $36.00, on the same permit. The subtotal of $111.00 is the base the surcharge is charged on: 2.5% of it is $2.78, which is less than the $4.00 the County's own note sets as the minimum collected on any permit, so the surcharge is $4.00. Total: **$115.00**.\n\nThree nearby readings, to show what moves the number. A stand-alone water heater is $38.00 plus the $4.00 floor, $42.00 — the fixture charge does not apply to it. A lawn irrigation system with 150 heads is in the second band, $54.00 plus $4.00, $58.00; with 100 heads it is $38.00, and with 250 heads $64.00, because the three rows are alternatives rather than a rate per head. A gas permit for $8,000 of equipment, materials and labour is $64.00 plus seven thousands at $6.00, $106.00, plus the $4.00 floor — $110.00 — and at $50,000 of valuation it is $358.00 plus $8.95, $366.95.\n\nThe one thing the estimate cannot do is tell you which of the twelve stand-alone rows applies. A water heater replacement that also moves a drain is a stand-alone job; the same replacement inside a larger remodel is part of the $75.00 permit and the fixture count, and the page says so rather than picking one.",
      },
      faqs: [
        {
          question: "How much is a plumbing permit for a new house?",
          answer:
            "$75.00 plus $6.00 for each fixture, and the fixture charge is on the same permit rather than instead of it: \"Permit Fee for New Construction, Addition or Alteration (Commercial or Residential, plus $6 per fixture charge, unless specified otherwise) $75.00\" and \"Per Plumbing Fixture charge, (added, plugged, moved or future opening) 6.00\". Six fixtures is $111.00, which with the $4.00 state surcharge floor is $115.00.",
          sourceId: OC_BUILDING_SOURCE_KEY,
          attribution: "Orange County Fee Directory, FY 2025-2026, pages 38-39",
        },
        {
          question: "Which jobs are charged $38.00 instead of the $75.00 permit fee?",
          answer:
            "The stand-alone list: a replacement permit issued for one that expired within six months, mobile home plumbing, a water heater, a solar water heater, a backflow preventer, a water softener, a spa with permanent connections, a sewer replacement, a residential re-pipe, a commercial re-pipe per unit, a second irrigation meter, and a swimming pool permit — except that the pool is $64.00 rather than $38.00. None of them takes the $6.00 fixture charge.",
          sourceId: OC_BUILDING_SOURCE_KEY,
          attribution: "Orange County Fee Directory, FY 2025-2026, page 39",
        },
        {
          question: "Is a sprinkler system charged per head?",
          answer:
            "No — it is a three-row table: 1 to 100 heads $38.00, 101 to 200 heads $54.00, 201 and up $64.00. One head and one hundred heads cost the same, and the only way to pay more is to cross a break. The same page prices a second meter for irrigation at $38.00.",
          sourceId: OC_BUILDING_SOURCE_KEY,
          attribution: "Orange County Fee Directory, FY 2025-2026, page 39",
        },
        {
          question: "How is a gas permit priced?",
          answer:
            "On valuation, in its own schedule in the same section: $64.00 up to and including the first $1,000 of \"cost of all equipment supplied by owner or contractor, materials and labor\", then $6.00 for each additional $1,000 or fraction thereof. There is no fixture count and no tonnage. A $50,000 gas job is $358.00 before the $4.00 surcharge floor.",
          sourceId: OC_BUILDING_SOURCE_KEY,
          attribution: "Orange County Fee Directory, FY 2025-2026, page 39",
        },
        {
          question: "Is the water heater's electrical or mechanical work included?",
          answer:
            "No. The plumbing permit covers the plumbing side of the water heater at $38.00; a new circuit is a separate electrical permit, and the air conditioning on the same project is a separate mechanical permit with its own schedule. This site prices the electrical permit on its own page; the mechanical one is not modelled anywhere on the site.",
          sourceId: OC_BUILDING_SOURCE_KEY,
          attribution: "Orange County Fee Directory, FY 2025-2026, pages 37-38",
        },
        {
          question: "Why does a $38.00 permit cost $42.00?",
          answer:
            "The state surcharge has a floor. It is 2.5% of each permit fee — which would be 95 cents on $38.00 — but \"the minimum amount collected in accordance with the Florida Statutes mentioned above on any permit issued shall be $4.00\". Every row on this page below $160.00 therefore pays $4.00 rather than 2.5%.",
          sourceId: OC_BUILDING_SOURCE_KEY,
          attribution: "Orange County Fee Directory, FY 2025-2026, page 44",
        },
      ],
      seoTitle: "Orange County FL Plumbing Permit Cost (2025-2026 Fee Directory)",
      seoDescription:
        "An Orange County, Florida plumbing permit is $75.00 plus $6.00 per fixture, or $38.00 for a stand-alone job like a water heater or a re-pipe, plus a 2.5% state surcharge with a $4.00 minimum.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: OC_LAST_VERIFIED,
    },
  ],

  verifications: [
    {
      entityType: "source",
      entityKey: OC_BUILDING_SOURCE_KEY,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: OC_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: OC_BUILDING_SOURCE_KEY,
      notes:
        "Read in full in three pdftotext modes and compared line by line. The document is one PDF for every department of the county, so the section boundaries were checked against its own table of contents before any row was copied: Building Safety is section 3, pages 26 to 45, and the Zoning Division's review rows are on page 57 in a different section.",
    },
    {
      entityType: "source",
      entityKey: OC_KEYS.buildingSafetyPage,
      status: "verified",
      method: "manual_review",
      verifiedAt: OC_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: OC_KEYS.buildingSafetyPage,
      notes:
        "The page's FAQ answers, contact routing and the expiry and extension rules were quoted from the page as served on 2026-09-24. It is the only source on this site that records a fee authority telling readers that a total cannot be given in advance.",
    },
    {
      entityType: "fee_schedule",
      entityKey: OC_BUILDING_SOURCE_KEY,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: OC_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: OC_BUILDING_SOURCE_KEY,
      notes:
        "One document supplies all three of this jurisdiction's fee schedules. The three schedule rows are therefore deliberately keyed to the same source, rather than to three keys for one file.",
    },
    {
      entityType: "permit_page",
      entityKey: "building-permit-cost",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: OC_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: OC_BUILDING_SOURCE_KEY,
      notes:
        "Every figure in the worked example recomputed with the engine against the directory's rows: $752.00 + $34.00 + $18.80 = $804.80. The two bands were checked at $1,999,999, $2,000,000 and $2,000,001 of valuation (residential $6,207.58, $6,207.58, $6,208.60 including review and surcharge; commercial $8,222.55, $8,222.55, $8,223.58) and the break closes exactly, so unlike Portland's Development Services Fee there is no seam to report.",
    },
    {
      entityType: "permit_page",
      entityKey: "electrical-permit-cost",
      permitTypeKey: "electrical",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: OC_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: OC_BUILDING_SOURCE_KEY,
      notes:
        "All three service tables were transcribed band by band and every one of the eighteen bands plus the three over-1,000 rates was recomputed. The band boundaries were checked at each edge (150, 151, 200, 201, 400, 401, 600, 601, 800, 801, 1,000, 1,001, 1,500, 2,000 amperes) to confirm the bands are alternatives and that no amperage matches two rows.",
    },
    {
      entityType: "permit_page",
      entityKey: "plumbing-permit-cost",
      permitTypeKey: "plumbing",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: OC_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: OC_BUILDING_SOURCE_KEY,
      notes:
        "The whole plumbing and gas schedule was transcribed. The $4.00 surcharge floor was verified to bind on every row below $160.00 of permit fee, which is most of the schedule, and the irrigation table was checked at 1, 100, 101, 200, 201 and 250 heads.",
    },
    {
      entityType: "fee_rule",
      entityKey: "BUILD-1-2-FAMILY",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: OC_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: OC_BUILDING_SOURCE_KEY,
      notes:
        "\"Residential--Up to and including $1,000. $26.00 / For each additional $1,000 or fraction thereof, to $2,000,000 3.00\", and the continuation row \"For each additional $1,000 or fraction thereof, above $2,000,000 1.00\" on the following page. The tier above $2,000,000 opens with the value the lower tier produces at its own ceiling, which is the same arithmetic the document prints.",
    },
    {
      entityType: "fee_rule",
      entityKey: "BUILD-COMMERCIAL-NEW",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: OC_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: OC_BUILDING_SOURCE_KEY,
      notes:
        "The row is marked with the document's own double asterisk, whose footnote is the Florida Power Plant Siting Act valuation of mechanical equipment used for electrical power generation at 25% of its actual cost. The footnote is quoted on the page rather than applied, because it amends a valuation this site asks the reader for.",
    },
    {
      entityType: "fee_rule",
      entityKey: "PLAN-REVIEW-COMM-ARCHITECTURAL",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: OC_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: OC_BUILDING_SOURCE_KEY,
      notes:
        "$27.00 up to and including $1,000 of value, $3.00 per additional $1,000 or fraction thereof, \"Note: Maximum fee of $10,000\". The ceiling was verified to bind: at $4,000,000 of valuation the review is $10,000.00 rather than the $11,997.00 the rate would produce. The row is scoped to C-1, C-2, C-3 and PO buildings and the commercial components of Planned Developments, which the rule expresses as a required zoning classification rather than as an assumption.",
    },
    {
      entityType: "fee_rule",
      entityKey: "ELEC-3PH-208-240V-OVER-1000",
      permitTypeKey: "electrical",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: OC_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: OC_BUILDING_SOURCE_KEY,
      notes:
        "\"Over 1,000 per ea. add'l. 1,000 amp or fraction 281.00\". This row is the reason the engine's per-thousand divisor had to become basis-aware: read on the money divisor it produced $2.81 for a 1,500-ampere service instead of $281.00. The fix and the regression test are in tests/calc/per-thousand-count-basis.test.ts.",
    },
    {
      entityType: "fee_rule",
      entityKey: "PLUMB-PERMIT",
      permitTypeKey: "plumbing",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: OC_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: OC_BUILDING_SOURCE_KEY,
      notes:
        "The parenthetical \"(Commercial or Residential, plus $6 per fixture charge, unless specified otherwise)\" is what makes the fixture rule an addition rather than an alternative, and the tests assert the pair together so the two rows cannot be separated by a later edit.",
    },
    {
      entityType: "fee_rule",
      entityKey: "GAS-PERMIT",
      permitTypeKey: "plumbing",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: OC_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: OC_BUILDING_SOURCE_KEY,
      notes:
        "Gas is issued as its own permit by the same division and is modelled on the plumbing page for that reason. Read from the Gas Permit Fees section on page 39, and cross-checked against the 2.5% surcharge note on page 44, which names gas permits among the permits the surcharge covers.",
    },
    {
      entityType: "fee_rule",
      entityKey: "PLUMB-STANDALONE",
      permitTypeKey: "plumbing",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: OC_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: OC_BUILDING_SOURCE_KEY,
      notes:
        "The stand-alone list was transcribed in full, all twelve rows including the two re-pipe rows. The commercial re-pipe's \"per unit\" wording is why the page says an eight-unit building pays it eight times.",
    },
    {
      entityType: "jurisdiction_profile",
      entityKey: OC_KEYS.jurisdiction,
      status: "verified",
      method: "manual_review",
      verifiedAt: OC_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: OC_BUILDING_SOURCE_KEY,
      notes:
        "The profile's claims about which divisions charge what were checked against the directory's own section headings and cross-references rather than against the county's narrative pages, and the ten municipalities named in the exclusions are the ones in Orange County.",
    },
  ],
};

/** Permit pages that clear the editorial gate for this jurisdiction. */
export const OC_PUBLISHED_PERMIT_PAGES = orangeCountySeed.permitPages.filter(
  (page) => page.publishStatus === "published" && !page.noindex,
);
