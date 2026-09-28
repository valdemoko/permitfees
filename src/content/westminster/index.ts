import type { JurisdictionSeed } from "@/content/seed-types";

import {
  WESTMINSTER_BUILDING_RULES,
  WESTMINSTER_ELECTRICAL_RULES,
  WESTMINSTER_FEE_EFFECTIVE_FROM,
  WESTMINSTER_FEES_PAGE_SOURCE_KEY,
  WESTMINSTER_PLUMBING_RULES,
  WESTMINSTER_SCHEDULE_SOURCE_KEY,
} from "./fee-rules";

/**
 * Westminster, Colorado — the City of Westminster, which issues its own permits.
 *
 * The City spans Adams, Jefferson and Weld counties. Neither county's schedule describes
 * a Westminster permit, so the county row here is a coordinate rather than an authority:
 * it exists because every jurisdiction in this dataset has one, and a reader who arrives
 * looking for "the county's fee" is looking for the wrong document.
 *
 * Research record: research/colorado/westminster.md.
 */

export const WESTMINSTER_LAST_VERIFIED = "2026-09-24";

export const WESTMINSTER_KEYS = {
  state: "co",
  county: "adams-county",
  jurisdiction: "westminster",
  feeSchedule: WESTMINSTER_SCHEDULE_SOURCE_KEY,
} as const;

const RESEARCHER = "Permit Fee Intelligence research pass 8 (Colorado, second jurisdiction)";

const state = {
  code: "CO",
  slug: "colorado",
  name: "Colorado",
  fipsCode: "08",
};

const county = {
  key: WESTMINSTER_KEYS.county,
  slug: "adams-county",
  name: "Adams County",
  fipsCode: "08001",
};

export const westminsterSeed: JurisdictionSeed = {
  state,
  county,

  jurisdiction: {
    key: WESTMINSTER_KEYS.jurisdiction,
    stateKey: WESTMINSTER_KEYS.state,
    countyKey: WESTMINSTER_KEYS.county,
    type: "city",
    slug: "westminster",
    name: "Westminster",
    officialName: "City of Westminster",
    websiteUrl: "https://www.westminsterco.gov/833/Permits-Licenses",
    permitPortalUrl: "https://www.westminsterco.gov/979/Fees",
    timezone: "America/Denver",
    isActive: true,
  },

  departments: [
    {
      key: "westminster-building",
      jurisdictionKey: WESTMINSTER_KEYS.jurisdiction,
      kind: "building",
      name: "Building Division",
      /*
        No telephone number or address is recorded. The fee schedule read for these pages
        prints a document title, an effective date and its tables, and no contact details
        at all, so none is asserted here — a page that tells someone who to call is the
        one place a wrong number cannot be caught by the reader.
      */
      phone: null,
      email: null,
      url: "https://www.westminsterco.gov/833/Permits-Licenses",
      addressLine: null,
      hours: null,
      notes:
        "The Building Division publishes one page of fees and applies them to residential and commercial work alike. The schedule is titled \"Building Division Fee Schedule\" and is dated by its own effective date, January 1, 2026.",
    },
  ],

  sources: [
    {
      key: WESTMINSTER_SCHEDULE_SOURCE_KEY,
      jurisdictionKey: WESTMINSTER_KEYS.jurisdiction,
      title: "Building Division Fee Schedule (effective January 1, 2026)",
      url: "https://www.westminsterco.gov/DocumentCenter/View/6284/Fee-Schedule-V3-2026",
      sourceType: "fee_schedule_pdf",
      issuingAuthority: "City of Westminster, Building Division",
      authorityKind: "city",
      isPrimary: true,
      documentDate: null,
      effectiveFrom: WESTMINSTER_FEE_EFFECTIVE_FROM,
      retrievedAt: WESTMINSTER_LAST_VERIFIED,
      lastVerifiedAt: WESTMINSTER_LAST_VERIFIED,
      notes:
        "One page, headed \"BUILDING DIVISION FEE SCHEDULE\" and \"(Effective January 1, 2026)\", sha256 beginning 8d77172fe6affc1d. Read 2026-09-24 in three pdftotext modes. `-raw` and `-table` disagree by one row throughout the two flat lists at the foot of the page — `-raw` puts each value on the line above its label — and both agree once that shift is accounted for, which is the check the project's two-mode rule exists for. The valuation table, the review percentage and the use tax rate are unaffected by the shift.",
    },
    {
      key: WESTMINSTER_FEES_PAGE_SOURCE_KEY,
      jurisdictionKey: WESTMINSTER_KEYS.jurisdiction,
      title: "Fees",
      url: "https://www.westminsterco.gov/979/Fees",
      sourceType: "municipal_website",
      issuingAuthority: "City of Westminster",
      authorityKind: "city",
      isPrimary: false,
      documentDate: null,
      effectiveFrom: null,
      retrievedAt: WESTMINSTER_LAST_VERIFIED,
      lastVerifiedAt: WESTMINSTER_LAST_VERIFIED,
      notes:
        "The City's own Fees page, which repeats the valuation table and is the corroborating reading for the two percentage rows: plan review at 65% of the building permit fee, and use tax at 4.25% of half the valuation. It also carries the rate this one replaced — 3.85% — which is what makes the \"effective 1/1/2026\" reading certain rather than inferred. No figure on this site is taken from it that the schedule does not also print.",
    },
  ],

  /** Empty on purpose: the permit types this jurisdiction uses already exist. */
  permitTypes: [],
  projectTypes: [],

  jurisdictionPermitTypes: [
    {
      jurisdictionKey: WESTMINSTER_KEYS.jurisdiction,
      permitTypeKey: "building",
      isAvailable: true,
      localName: "Building permit",
      officialUrl: null,
      notes:
        "Priced from the Building Division Fee Schedule's valuation table, and the schedule's own opening sentence says what the fee includes: \"Building permit fees are valuation based and shall include the permit and plan review fees, use tax and trade fees (as applicable).\" Four lines, one permit: the table's figure, plan review at 65% of it, use tax at 4.25% of half the valuation, and 15% per trade scope.",
    },
    {
      jurisdictionKey: WESTMINSTER_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      isAvailable: true,
      localName: "Electrical permit",
      officialUrl: null,
      notes:
        "Westminster prices the electrical work as a **trade fee on the project**, not as a permit of its own: \"An additional 15% of the permit fee for each of the following; mechanical, plumbing, electric\", plus a further 15% of the plan review fee for each. Four of the flat single-family rows carry an asterisk — \"May also require an electrical permit fee\" — and the only electrical rate the schedule publishes is that 15%, applied there to the row's own flat fee.",
    },
    {
      jurisdictionKey: WESTMINSTER_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      isAvailable: true,
      localName: "Plumbing permit",
      officialUrl: null,
      notes:
        "Two published routes. A named single-family job is priced flat on the \"Miscellaneous SFD Residential Permit Fees\" list — a water heater replacement is $40.00, a lawn irrigation sprinkler $60.00, a gas log $60.00. Everything else is a plumbing trade fee of 15% of the project's permit fee plus 15% of its plan review fee.",
    },
    {
      jurisdictionKey: WESTMINSTER_KEYS.jurisdiction,
      permitTypeKey: "mechanical",
      isAvailable: true,
      localName: "Mechanical permit",
      officialUrl: null,
      notes:
        "Priced the same way as electrical and plumbing, at 15% of the permit fee plus 15% of the review fee, and with three flat single-family rows of its own: air conditioner $80.00, furnace replacement $60.00, evaporative cooler $60.00. No mechanical page is published in this release; the mechanism it would describe is the one the electrical and plumbing pages already carry.",
    },
  ],

  feeSchedules: [
    {
      key: WESTMINSTER_SCHEDULE_SOURCE_KEY,
      jurisdictionKey: WESTMINSTER_KEYS.jurisdiction,
      sourceKey: WESTMINSTER_SCHEDULE_SOURCE_KEY,
      title: "Building Division Fee Schedule, effective January 1, 2026",
      officialUrl:
        "https://www.westminsterco.gov/DocumentCenter/View/6284/Fee-Schedule-V3-2026",
      effectiveFrom: WESTMINSTER_FEE_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: WESTMINSTER_LAST_VERIFIED,
      notes:
        "One page, one effective date, and it states its own supersession: the use tax row is marked \"(effective 1/1/2026)\", and the City's Fees page still prints the rate it replaced. A reader can therefore tell which version these figures belong to, which is the point of recording an effective date at all.",
    },
  ],

  feeRules: [
    ...WESTMINSTER_BUILDING_RULES.map((rule) => ({
      jurisdictionKey: WESTMINSTER_KEYS.jurisdiction,
      permitTypeKey: "building",
      scheduleKey: WESTMINSTER_SCHEDULE_SOURCE_KEY,
      rule,
    })),
    ...WESTMINSTER_ELECTRICAL_RULES.map((rule) => ({
      jurisdictionKey: WESTMINSTER_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      scheduleKey: WESTMINSTER_SCHEDULE_SOURCE_KEY,
      rule,
    })),
    ...WESTMINSTER_PLUMBING_RULES.map((rule) => ({
      jurisdictionKey: WESTMINSTER_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      scheduleKey: WESTMINSTER_SCHEDULE_SOURCE_KEY,
      rule,
    })),
  ],

  requirements: [
    {
      jurisdictionKey: WESTMINSTER_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "document",
      title: "A total valuation, not a contract price",
      description:
        "\"The valuation to be used in computing the permit and plan review fees shall be the total value of all construction work, including labor and materials, for all finish work, painting, roofing, electrical, plumbing, heating, air conditioning, conveyance systems, fire protection systems and other permanent work or equipment.\" The list is deliberately broad: the electrical and plumbing work is *inside* the valuation that produces the permit fee, and is then charged again as its own 15% trade fee.",
      isMandatory: true,
      sortOrder: 10,
      sourceKey: WESTMINSTER_SCHEDULE_SOURCE_KEY,
      lastVerifiedAt: WESTMINSTER_LAST_VERIFIED,
    },
    {
      jurisdictionKey: WESTMINSTER_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "other",
      title: "Plan review is 65% of the permit fee, at every size of job",
      description:
        "\"Plan Review Fee — 65% of Building Permit Fee.\" There is no threshold and no minimum: a $1 valuation pays $19.50 in permit fees and $12.68 in review fees, so unlike Denver — where the review column prints 0 below $2,000 of valuation — Westminster charges a review fee on the smallest permit it issues.",
      isMandatory: true,
      sortOrder: 20,
      sourceKey: WESTMINSTER_SCHEDULE_SOURCE_KEY,
      lastVerifiedAt: WESTMINSTER_LAST_VERIFIED,
    },
    {
      jurisdictionKey: WESTMINSTER_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "other",
      title: "A trade scope is an addition, not a separate permit",
      description:
        "\"Permit trade fees — An additional 15% of the permit fee for each of the following; mechanical, plumbing, electric\", and \"Plan review trade fees — An additional 15% of the plan review fee for each\". Because it is an *additional* percentage of the building permit fee, it is only computable once that fee is known, and a project with all three trades pays three times the addition rather than one.",
      isMandatory: false,
      sortOrder: 30,
      sourceKey: WESTMINSTER_SCHEDULE_SOURCE_KEY,
      lastVerifiedAt: WESTMINSTER_LAST_VERIFIED,
    },
    {
      jurisdictionKey: WESTMINSTER_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      requirementType: "other",
      title: "Some jobs are priced flat instead of by valuation",
      description:
        "\"Miscellaneous SFD Residential Permit Fees\" lists named single-family jobs at flat figures: a water heater replacement at $40.00, re-roofing at $100.00, a detached storage shed at $80.00, a fence at $50.00. The schedule prints these as one figure where the valuation route prints a permit fee and a review fee separately, and they are charged as printed.",
      isMandatory: false,
      sortOrder: 20,
      sourceKey: WESTMINSTER_SCHEDULE_SOURCE_KEY,
      lastVerifiedAt: WESTMINSTER_LAST_VERIFIED,
    },
    {
      jurisdictionKey: WESTMINSTER_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      requirementType: "other",
      title: "Four flat rows carry an electrical permit fee of their own",
      description:
        "Air conditioner, furnace replacement, evaporative cooler and spa/hot tub are each marked \"* May also require an electrical permit fee\". The schedule publishes exactly one electrical rate — 15% of the permit fee — so on those rows that is 15% of the row's own flat figure: $12.00 on an $80.00 air-conditioner permit.",
      isMandatory: false,
      sortOrder: 10,
      sourceKey: WESTMINSTER_SCHEDULE_SOURCE_KEY,
      lastVerifiedAt: WESTMINSTER_LAST_VERIFIED,
    },
  ],

  profile: {
    jurisdictionKey: WESTMINSTER_KEYS.jurisdiction,
    headline: "What construction permits cost in Westminster",
    summary:
      "Westminster prices a building permit from one valuation table — $19.50 up to $500 of valuation, then $19.50 plus $2.65 for each additional $100, then $59.25 plus $11.90 for each additional $1,000 — and its opening sentence says what the fee includes: plan review at 65% of it, estimated use tax at 4.25% of half the valuation, and 15% for each trade scope. The table closes at every one of its seven seams, which no schedule on this site had done before.",
    localContext:
      "Three things about this schedule change the answer, and one of them is arithmetic rather than policy.\n\nThe first is that **a trade permit here is not a permit**. Where Denver requires a separate permit for each discipline and prices it from the value of that trade's work, Westminster adds 15% of the *building permit fee* for each of mechanical, plumbing and electric, and a further 15% of the *plan review fee* for each. The same two towns, twenty minutes apart, disagree about what an electrical permit is — and a schedule that prices a trade as a percentage of something else cannot be computed until that something else is known. That is why the electrical and plumbing pages ask for the project's valuation: there is no electrical figure to look up in isolation.\n\nThe second is that **the use tax is a percentage of a percentage**. \"Estimated Use Tax — 4.25% of 50% of Total Valuation (effective 1/1/2026)\" is 2.125%, which is not a whole number of basis points. It is carried here as the exact fraction 17/800 rather than rounded, and on a $250,000 project it is the largest single line in the bill — $5,312.50, more than three times the permit fee itself. A reader who assumes a permit costs about 1% of the work should see that number early.\n\nThe third is the one worth trusting the table for: **every seam closes**. Band by band, the figure the lower band produces at its top is exactly the figure the upper band opens with — $19.50 at $500, $59.25 at $2,000, $332.95 at $25,000, $546.70 at $50,000, $844.20 at $100,000, $2,684.20 at $500,000 and $4,659.20 at $1,000,000. Denver's table is a dollar short at one handover, Clark County's four cents short at another, and Houston's brackets deliberately do not chain at all. This one is internally exact, which is a finding about the document and not a courtesy to it: it means a reader can check any row against the one below it and get the same answer. The bands are asserted at every boundary in the tests.\n\nAlongside all of that sits a flat list of named jobs — \"Miscellaneous SFD Residential Permit Fees\" — where a water heater replacement is $40.00 and re-roofing is $100.00. Those are permits priced by job rather than by value, and they are the only place in this schedule where a common household job has a published figure.",
    valuationBasis:
      "Westminster asks for **the total value of all construction work**, and its wording is unusually specific about what that includes: \"labor and materials, for all finish work, painting, roofing, electrical, plumbing, heating, air conditioning, conveyance systems, fire protection systems and other permanent work or equipment\".\n\nTwo consequences follow. The first is that the electrical and plumbing scopes are *inside* the valuation — the permit fee is computed on a number that already contains them — and are then charged again as 15% trade fees. The second is that a subcontractor's contract value is not the valuation: it is one slice of a number that the applicant declares in full.\n\nUnlike Denver, Westminster's schedule states no rule about taking the higher of the declared value and a published cost table. The pages here compute from the figure you give them and never substitute a rate for a valuation.",
    notIncluded:
      "These figures are what the City of Westminster's own Building Division Fee Schedule publishes, computed by this site's engine. They are not a total project cost. In particular they exclude:\n\n- **Everything in the schedule's \"Other Inspections and Fees\" block**, which is charged by event or by hour rather than by valuation: inspections outside normal business hours at $50.00 per hour with a two-hour minimum, re-inspection at $50.00, additional plan review for revisions at $50.00 per hour, a temporary certificate of occupancy at 5% of the building permit fee with a $100.00 floor, and a letter of code compliance at $25.00.\n- **Sign permits.** Monument signs and wall or building signs are \"per fee schedule\" and a wall sign is specifically marked no use tax, so their price is not in this schedule at all. Banners and bus benches are priced on the miscellaneous list; they are not construction work and are not modelled here.\n- **Fire department and operational permits**, which the schedule lists in its miscellaneous block. The two readings of this document disagree about whether the $100.00 on that block belongs to operational permits or to fire department fees, so no figure from that block is published on this site rather than the wrong one being published.\n- **Stop-work order penalties** — double the permit fee with a $250 floor for a first offence, triple with a $500 floor for a second. A penalty is not a fee.\n- **Anything charged by another Colorado authority.** Westminster issues its own permits; Adams, Jefferson and Weld counties do not issue a Westminster permit, and Denver's schedule describes a different city.\n- **Water, sewer and utility connection charges**, which are utility charges rather than permit fees and appear nowhere in this schedule.",
    seoTitle: "Westminster building permit fees, plan review and use tax",
    seoDescription:
      "How Westminster prices building, electrical and plumbing permits — one valuation table that closes at all seven seams, plan review at 65%, use tax at 4.25% of half the valuation, and 15% per trade scope.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: WESTMINSTER_LAST_VERIFIED,
  },

  permitPages: [
    {
      jurisdictionKey: WESTMINSTER_KEYS.jurisdiction,
      permitTypeKey: "building",
      slug: "building-permit-cost",
      title: "Westminster building permit cost",
      intro:
        "A Westminster building permit comes from one valuation table: $19.50 up to $500, then $19.50 plus $2.65 for each additional $100, then $59.25 plus $11.90 for each additional $1,000 — and the schedule's own opening sentence says the fee \"shall include the permit and plan review fees, use tax and trade fees\". Plan review is 65% of the permit fee, use tax is 4.25% of half the valuation, and each trade scope adds 15% of the permit fee. A $250,000 project with mechanical, plumbing and electrical scopes pays $8,983.06.",
      localSummary:
        "The table has eight bands and **all seven seams close**. Read down the list of opening figures — $19.50, $59.25, $332.95, $546.70, $844.20, $2,684.20, $4,659.20 — and each one is exactly what the band below it produces at its own top. Denver's table is a dollar short at one handover, Clark County's four cents short at another, and Houston's brackets do not chain at all; this one is exact, and the pages here assert it band by band rather than assuming it.\n\nOne band counts in hundreds rather than thousands: \"$19.50 for the first $500 plus $2.65 for each additional $100, or fraction thereof\". That is the only row of its kind in this table, and it is what makes a $2,000 valuation cost exactly the $59.25 the next band opens with.\n\nThree rows sit under the table and are read off it rather than looked up. **Plan review is 65% of the building permit fee** — no threshold, no minimum, so a $1 valuation pays $19.50 plus $12.68. **Estimated use tax is 4.25% of 50% of the total valuation**, which is 2.125% of the work; on a $250,000 project that is $5,312.50, the largest line in the bill and more than three times the permit fee. And **each trade is an addition**: \"an additional 15% of the permit fee for each of the following; mechanical, plumbing, electric\", plus 15% of the review fee for each — not a separate permit, and not a figure you can look up on its own.\n\nBecause all three of those are percentages of something else, the order matters and the schedule fixes it: the permit fee comes from the table, the review fee is 65% of that permit fee, and the trade fees are 15% of the permit fee rather than 15% of the permit fee plus trade fees. This site computes them in that order for every job.\n\nFinally, the schedule prices some jobs by name instead of by value. Its \"Miscellaneous SFD Residential Permit Fees\" list fixes a water heater replacement at $40.00, re-roofing at $100.00, a detached storage shed at $80.00 and a fence at $50.00, and its miscellaneous list fixes solar systems at $300.00 and a demolition permit at $25.00. Those rows replace the valuation route for the job they name.",
      notIncluded:
        "This estimate is the schedule's valuation table for the permit fee, plus the plan review fee, the estimated use tax and any trade fees selected. It excludes:\n\n- **The \"Other Inspections and Fees\" block**, charged by event or by hour: inspections outside normal business hours at $50.00 per hour with a two-hour minimum, re-inspection at $50.00, additional plan review for revisions at $50.00 per hour, a temporary certificate of occupancy at 5% of the building permit fee with a $100.00 minimum, a copy of a previously issued certificate of occupancy at $5.00 and a letter of code compliance at $25.00.\n- **Sign permits.** Monument signs and wall or building signs are priced \"per fee schedule\", and the wall sign row is specifically marked no use tax. Banners and bus benches are on the miscellaneous list but are not construction work.\n- **Fire department fees and operational permits**, where the two readings of this document disagree about which row the $100.00 belongs to — so no figure from that block is published here.\n- **Stop-work order penalties**: double the permit fee with a $250 floor for a first offence, triple with a $500 floor for a second.\n- **Water, sewer and utility connections**, which are utility charges rather than permit fees.\n- **Anything charged by another Colorado authority**, including planning and engineering fees, which the City publishes on a separate schedule for land use and development review.\n- **The cost of the work itself.** A use tax estimate is a tax on materials, not a permit cost, and it is shown as its own line for that reason.",
      workedExample: {
        scenario:
          "A commercial tenant finish with a declared total valuation of $250,000, including mechanical, plumbing and electrical scopes, filed as one permit rather than in phases.",
        inputs: {
          valuationCents: 25_000_000,
          custom: {
            mechanical_trade: true,
            plumbing_trade: true,
            electrical_trade: true,
          },
        },
        notes:
          "The table's sixth band: $844.20 for the first $100,000, plus $4.60 for each of the 150 additional thousands, which is $1,534.20. Plan review is 65% of that permit fee, $997.23, and the estimated use tax is 4.25% of half the $250,000 valuation, $5,312.50 — more than three times the permit fee itself. Each of the three trade scopes adds 15% of the permit fee, $230.13, plus 15% of the review fee, $149.58, so the three together add $1,139.13. The total is $8,983.06. Drop the three trade scopes and the same project pays $7,843.93, which is the permit fee, the review fee and the tax only.",
      },
      faqs: [
        {
          question: "How much is a building permit in Westminster?",
          answer:
            "It depends on the total valuation of the work: $19.50 up to $500, $59.25 at $2,000, $332.95 at $25,000, $546.70 at $50,000, $844.20 at $100,000, $2,684.20 at $500,000 and $4,659.20 at $1,000,000, with dollar rates easing from $11.90 to $2.65 per additional $1,000 along the way. Plan review, use tax and trade fees are then added on top of that figure.",
        },
        {
          question: "Is plan review included in the permit fee?",
          answer:
            "No — it is 65% of the permit fee, charged in addition, and unlike Denver there is no threshold below which it disappears. A $1 valuation pays $19.50 in permit fees and a further $12.68 in review fees. The schedule's first sentence says the permit cost \"shall include the permit and plan review fees, use tax and trade fees (as applicable)\", which is a statement about what a permit costs overall, not three separate applications.",
        },
        {
          question: "What is the use tax on a Westminster permit?",
          answer:
            "\"Estimated Use Tax — 4.25% of 50% of Total Valuation\", which is 2.125% of the declared valuation. It is the largest line on a commercial project: $5,312.50 on a $250,000 valuation, against a $1,534.20 permit fee. It is an estimate of sales or use tax on the materials rather than a permit fee, and it is shown as its own line here for that reason.",
        },
        {
          question: "How much does an electrical or plumbing permit add?",
          answer:
            "15% of the building permit fee for each trade, plus 15% of the plan review fee for each. On the $250,000 project above that is $230.13 plus $149.58 per trade, so a project with all three trades adds $1,139.13. Westminster does not charge trades as separate permits priced from their own value the way Denver does.",
        },
        {
          question: "Do some jobs avoid the valuation table?",
          answer:
            "Yes. The schedule's \"Miscellaneous SFD Residential Permit Fees\" list prices named single-family jobs at flat figures — water heater replacement $40.00, re-roofing $100.00, detached storage shed $80.00, fence $50.00, above-ground pool $50.00 — and its miscellaneous list fixes solar systems at $300.00, a demolition permit at $25.00, a mobile home set-up with electrical at $125.00 and a construction trailer with electrical at $125.00.",
        },
        {
          question: "Does the table agree with itself?",
          answer:
            "Yes, at every seam. Each band's opening figure is exactly what the band below produces at its top — $59.25 at $2,000, $332.95 at $25,000, $546.70 at $50,000, $844.20 at $100,000, $2,684.20 at $500,000 and $4,659.20 at $1,000,000. Denver's table is a dollar short at one handover and Clark County's is four cents short at another; this one is exact, and this site checks it at every boundary rather than trusting the arithmetic.",
        },
      ],
      seoTitle: "Westminster building permit cost, plan review and use tax",
      seoDescription:
        "Westminster building permit fees from the City's own 2026 fee schedule — the valuation table, plan review at 65%, use tax at 4.25% of half the valuation, and 15% per trade scope, with a computed example.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: WESTMINSTER_LAST_VERIFIED,
    },
    {
      jurisdictionKey: WESTMINSTER_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      slug: "electrical-permit-cost",
      title: "Westminster electrical permit cost",
      intro:
        "Westminster does not price an electrical permit as a permit of its own. It publishes an electrical trade fee — \"an additional 15% of the permit fee\" — plus 15% of the plan review fee, so the electrical cost exists only in relation to a project's permit. On the flat single-family rows the schedule marks four jobs \"* May also require an electrical permit fee\", and at that same 15% an $80.00 air conditioner permit carries $12.00 of electrical permit fee: $92.00 in total.",
      localSummary:
        "There are two published routes to an electrical figure here, and neither is a table of electrical fees.\n\nThe first is a **trade fee on a project**. \"Permit trade fees — An additional 15% of the permit fee for each of the following; mechanical, plumbing, electric\", and \"Plan review trade fees — An additional 15% of the plan review fee for each\". Both are add-ons to a building permit, so both depend on the building permit fee: on a $60,000 project the table gives $606.20, the electrical trade fee is $90.93, plan review is $394.03 and the electrical share of it $59.10 — $150.03 for the electrical permit itself, on a project whose fees come to $2,425.26 with the use tax included.\n\nThe second is a **flat single-family row**. Four rows are marked \"* May also require an electrical permit fee\" — air conditioner at $80.00, furnace replacement at $60.00, evaporative cooler at $60.00 and spa or hot tub at $80.00 — and the schedule publishes exactly one electrical rate anywhere, the 15% trade fee. Applied to the row's own flat figure, that is $12.00 on the air conditioner, so the job costs $92.00 in permit fees rather than $80.00.\n\nThat application is a reading rather than a printed figure, and the page states it as one. What the schedule prints is the asterisk and the 15%; what it does not print is a stand-alone electrical permit fee for work that is not part of a permitted project. If your electrical job is not attached to a building permit, this schedule has no rate for it, and no figure is invented here to fill the gap.\n\nTwo comparisons are worth making, because they explain why this page asks for a project valuation at all. Denver prices an electrical permit from the value of the electrical work, so $25,000 of electrical work costs $219.00 there regardless of the building. Westminster prices it as a share of the building permit fee, so the same electrical work costs whatever 15% of the project's permit fee comes to. Houston and Clark County price the same work per device instead. Four jurisdictions, four different questions — and only the one you are actually asking can give you the right number.",
      notIncluded:
        "This estimate is the schedule's electrical trade fee for the scope selected, plus the electrical share of the plan review fee, and on a flat single-family row the electrical permit fee applied to that row's figure. It excludes:\n\n- **The building permit fee, the plan review fee and the estimated use tax** when a valuation is given, which are the project's lines rather than the electrical permit's. They are shown separately for exactly that reason: the electrical permit is the 15% line, not the total.\n- **A stand-alone electrical permit for work with no building permit.** The schedule publishes no rate for it; only the 15% trade fee and the flat rows exist, and no figure has been invented here to cover the difference.\n- **Service connection and utility charges**, which are made by the utility rather than by the Building Division.\n- **The solar systems permit**, which is a flat $300.00 on the miscellaneous list rather than a 15% trade fee, and the electric vehicle charger and similar work, which has no published row at all.\n- **The other trades' fees** — mechanical and plumbing are 15% each of the same permit fee, and on a project with all three the additions total 45% of it.\n- **The \"Other Inspections and Fees\" block**: after-hours inspection at $50.00 per hour with a two-hour minimum, re-inspection at $50.00, additional plan review at $50.00 per hour.\n- **Contractor registration and licensing**, which the City requires of electrical contractors separately from the permit itself.",
      workedExample: {
        scenario:
          "An air-conditioner replacement in a single-family home. The schedule prices the job at a flat $80.00 and marks that row \"* May also require an electrical permit fee\", so the electrical permit fee is added to the same job.",
        inputs: {
          custom: { schedule_item: "air_conditioner" },
        },
        notes:
          "The flat row is $80.00. The electrical permit fee is the schedule's own electrical rate — 15% of the permit fee — applied to that row's figure, which is $12.00, and the job comes to $92.00. The same 15% applied to a furnace, an evaporative cooler or a spa gives $9.00, $9.00 and $12.00 respectively on their published rows. Note what is *not* added: no plan review and no use tax, because the flat single-family rows are printed as one figure where the valuation route prints permit and review separately.",
      },
      faqs: [
        {
          question: "How much is an electrical permit in Westminster?",
          answer:
            "There is no electrical permit fee table. The schedule charges \"an additional 15% of the permit fee\" for each of mechanical, plumbing and electric, so an electrical permit costs 15% of the project's building permit fee plus 15% of its plan review fee. On a $60,000 project that is $90.93 plus $59.10.",
        },
        {
          question: "What does a permit cost with an air conditioner replacement?",
          answer:
            "$92.00. The air conditioner row is a flat $80.00, and it is one of four rows marked \"* May also require an electrical permit fee\". At the schedule's own electrical rate of 15% of the permit fee, that adds $12.00. Furnace and evaporative cooler rows are $60.00 each and add $9.00; a spa or hot tub is $80.00 and adds $12.00.",
        },
        {
          question: "Is that $12.00 printed in the schedule?",
          answer:
            "No, and this page says so. The schedule prints the asterisk — \"May also require an electrical permit fee\" — and it prints the 15% trade rate. Applying one to the other is this site's reading, and it is the only reading available that uses the City's own numbers. What the schedule genuinely does not price is a stand-alone electrical permit for work that is not part of a permitted project.",
        },
        {
          question: "Do I pay plan review on an electrical permit?",
          answer:
            "On a project, yes — 15% of the plan review fee, and the plan review fee is itself 65% of the building permit fee, so the electrical share of review is 9.75% of the permit fee. On a flat single-family row there is no review line at all, because those rows are printed as a single figure.",
        },
        {
          question: "How does this compare with Denver?",
          answer:
            "Denver requires a separate permit per discipline and prices each from the value of that trade's work, so an electrical permit there is the same table applied to the electrical contract value. Westminster treats the electrical scope as an addition to the building permit. Same state, twenty minutes apart, and the same job carries a different fee in each.",
        },
        {
          question: "What about solar panels or EV chargers?",
          answer:
            "Solar systems have their own flat row on the schedule's miscellaneous list: $300.00 for the installation. Electric vehicle chargers have no row in this schedule at all, so their fee is not published here — check with the Building Division rather than assuming the solar figure applies.",
        },
      ],
      seoTitle: "Westminster electrical permit cost and trade fees",
      seoDescription:
        "Westminster electrical permit fees explained from the City's 2026 schedule — an additional 15% of the permit fee plus 15% of plan review, and $92.00 for an air conditioner replacement that also needs an electrical permit.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: WESTMINSTER_LAST_VERIFIED,
    },
    {
      jurisdictionKey: WESTMINSTER_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      slug: "plumbing-permit-cost",
      title: "Westminster plumbing permit cost",
      intro:
        "A water heater replacement in Westminster is $40.00 — the schedule prices named single-family jobs at flat figures rather than by valuation. A plumbing scope on a larger project works the other way: the schedule adds \"an additional 15% of the permit fee\" for plumbing work plus 15% of the plan review fee, so on a $60,000 project the plumbing permit is $90.93 plus $59.10 rather than a figure of its own.",
      localSummary:
        "Westminster's plumbing answer depends entirely on which of two published routes the job takes.\n\nThe first is a **named flat job**. \"Miscellaneous SFD Residential Permit Fees\" prices a water heater replacement at $40.00, a lawn irrigation sprinkler at $60.00 and a gas log at $60.00, and the mixed list beside it has an above-ground pool at $50.00, a spa or hot tub at $80.00 and a fence at $50.00. Those figures are the whole permit for that job — no plan review and no use tax are added to them, because the schedule prints each as one figure where the valuation route prints a permit fee and a review fee separately. That is a reading of a schedule that does not say so in words, and it is stated on the page rather than buried.\n\nThe second is a **plumbing trade fee on a project**: \"An additional 15% of the permit fee for each of the following; mechanical, plumbing, electric\", plus \"an additional 15% of the plan review fee\". Two percentages against two other figures, which is why this page needs the project's valuation. On a $60,000 project the valuation table gives $606.20, the plumbing trade fee is $90.93, the plan review fee is $394.03 and the plumbing share of it $59.10.\n\nComparing the two routes is what the price difference is. Denver has no water-heater row at all — a like-for-like replacement there is a quick permit priced from its valuation, which lands near the bottom of the table at $20.00 or $35.00 with no plan review. Westminster publishes $40.00 flat. Both are real prices for the same job in the same state, which is the clearest argument for checking the schedule of the city you are working in rather than assuming a neighbouring one applies.\n\nTwo things this page will not do: charge a water heater the 15% trade fee as well as its flat figure — the schedule's trade percentage applies to a project priced by valuation, and charging both would bill the same plumbing permit twice — and invent a stand-alone plumbing permit fee for a job with no published row.",
      notIncluded:
        "This estimate is either the schedule's flat figure for the single-family job named, or the plumbing trade fee for a project plus the plumbing share of its plan review fee. It excludes:\n\n- **The water and sewer connection charges**, which are utility charges rather than permit fees and appear nowhere in this schedule.\n- **Backflow testing and certification**, which the City requires separately and which has no fee row here.\n- **A stand-alone plumbing permit for work with no published flat row and no building permit** — the schedule publishes no such rate, and none is invented here.\n- **The building permit fee, plan review fee and estimated use tax** when a project valuation is given: those are the project's lines, shown separately because the plumbing permit is the 15% line rather than the total.\n- **The other trades' fees** — mechanical and electrical are 15% each of the same permit fee, and each also carries 15% of the plan review fee.\n- **Gas fitting outside the plumbing scope** and any utility-side work, which is not part of a building permit.\n- **The \"Other Inspections and Fees\" block**, charged per hour or per event: after-hours inspection at $50.00 per hour with a two-hour minimum, re-inspection at $50.00, additional plan review at $50.00 per hour.\n- **Contractor registration**, which the City requires of plumbing contractors separately from the permit itself.",
      workedExample: {
        scenario:
          "A like-for-like water heater replacement in a single-family home, with no other work on the permit.",
        inputs: {
          custom: { schedule_item: "water_heater" },
        },
        notes:
          "The schedule prices this job by name rather than by valuation: \"Water Heater Replacement — $40.00\" on the Miscellaneous SFD Residential Permit Fees list. Nothing is added to it on this site — no plan review, because the flat lists print one figure rather than a permit fee and a review fee, and no 15% trade fee, because that percentage is defined against a valuation-based permit fee and this job is not priced that way. A plumbing scope on a larger project is the other route: on a $60,000 valuation the plumbing trade fee is $90.93 and the plumbing share of plan review $59.10.",
      },
      faqs: [
        {
          question: "How much is a water heater permit in Westminster?",
          answer:
            "$40.00. The City's fee schedule lists \"Water Heater Replacement — $40.00\" on its Miscellaneous SFD Residential Permit Fees list, which prices named single-family jobs at flat figures instead of by valuation. Nothing else is added to that figure here.",
        },
        {
          question: "Is a permit needed to replace a water heater?",
          answer:
            "Yes — the City publishes a fee for it, which is the clearest statement that one is required. The schedule sets the figure at $40.00 for a single-family home rather than pricing it from the value of the work, so there is no valuation to declare for a like-for-like swap.",
        },
        {
          question: "What does a plumbing permit cost on a commercial project?",
          answer:
            "15% of the building permit fee plus 15% of the plan review fee — \"an additional 15% of the permit fee for each of the following; mechanical, plumbing, electric\". Plan review is 65% of the permit fee, so the plumbing share of review is 9.75% of it. On a $60,000 valuation that is $90.93 plus $59.10, on a project whose fees total $2,425.26.",
        },
        {
          question: "Why is the water heater fee not charged the 15% trade fee as well?",
          answer:
            "Because the two are alternative routes through the schedule, not two charges. The 15% is defined as a percentage of a valuation-based permit fee; the flat single-family lists price the job in full instead, and they are printed as one figure where the valuation route prints a permit fee and a review fee separately. Charging both would bill the same permit twice.",
        },
        {
          question: "Which other jobs have flat fees?",
          answer:
            "On the single-family list: re-roofing $100.00, detached storage shed $80.00, air conditioner $80.00, furnace replacement $60.00, evaporative cooler $60.00, lawn irrigation sprinkler $60.00, gas log $60.00, fence $50.00 and above-ground pool $50.00. On the miscellaneous list: solar systems $300.00, mobile home set-up with electrical $125.00, construction trailer with electrical $125.00 and a demolition permit $25.00.",
        },
        {
          question: "Do I pay plan review on a plumbing permit?",
          answer:
            "On a project, yes: 15% of a plan review fee that is itself 65% of the permit fee. On the flat single-family jobs, no review fee is added here, because the schedule prints those rows as a single figure. The schedule does not say in words whether review attaches to them, so the reading is stated on the page rather than presented as certain.",
        },
      ],
      seoTitle: "Westminster plumbing permit cost and water heater fee",
      seoDescription:
        "Westminster plumbing permit fees from the City's 2026 schedule — a water heater replacement is $40.00 flat, and a plumbing scope on a project adds 15% of the permit fee plus 15% of plan review.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: WESTMINSTER_LAST_VERIFIED,
    },
  ],

  verifications: [
    {
      entityType: "source",
      entityKey: WESTMINSTER_SCHEDULE_SOURCE_KEY,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: WESTMINSTER_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: WESTMINSTER_SCHEDULE_SOURCE_KEY,
      notes:
        "Read 2026-09-24 in three pdftotext modes. The valuation table, the 65% review row and the 4.25% use tax row are stable across all three. The two flat lists at the foot of the page are not: `-raw` places each value on the line above its label, `-table` pairs them, and the two readings agree exactly once that one-row shift is allowed for — which is why the values here were cross-checked line by line rather than taken from whichever reading printed first.",
    },
    {
      entityType: "source",
      entityKey: WESTMINSTER_FEES_PAGE_SOURCE_KEY,
      status: "verified",
      method: "official_portal_check",
      verifiedAt: WESTMINSTER_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: WESTMINSTER_FEES_PAGE_SOURCE_KEY,
      notes:
        "The City's Fees page repeats the valuation table and both percentage rows, and prints the use tax rate this one replaced (3.85%), which dates the change to 1 January 2026. It is used as corroboration only: every figure on this site is one the schedule itself prints.",
    },
    {
      entityType: "fee_rule",
      entityKey: "VALUATION-1000001-UP",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: WESTMINSTER_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: WESTMINSTER_SCHEDULE_SOURCE_KEY,
      notes:
        "The final band: \"$4,659.20 for the first $1,000,000 plus $2.65 for each additional $1,000 or fraction thereof\". All seven seams of this table close — $19.50, $59.25, $332.95, $546.70, $844.20, $2,684.20 and $4,659.20 are each what the band below produces at its own top — and every one is asserted in tests/content/westminster-seed.test.ts. The document prints the band's lower bound as \"$1,000,0001\", a typographical slip for $1,000,001; the boundary modelled is where the band below ends.",
    },
    {
      entityType: "fee_rule",
      entityKey: "USE-TAX-4.25-OF-HALF",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: WESTMINSTER_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: WESTMINSTER_SCHEDULE_SOURCE_KEY,
      notes:
        "\"Estimated Use Tax — 4.25% of 50% of Total Valuation (effective 1/1/2026)\". 4.25% of a half is 2.125%, which is not a whole number of basis points, so the rule carries the exact fraction 17/800 — the same extension Dallas required of the `percent` primitive. On a $250,000 valuation it produces $5,312.50, the largest line in the example on the building page.",
    },
    {
      entityType: "fee_rule",
      entityKey: "PLAN-REVIEW-65",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: WESTMINSTER_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: WESTMINSTER_SCHEDULE_SOURCE_KEY,
      notes:
        "\"Plan Review Fee — 65% of Building Permit Fee\", charged with no threshold and no floor, so unlike Denver's review column there is no valuation below which it disappears. Modelled on the `permit_fee` basis so it is computed from the permit fee the run produced.",
    },
    {
      entityType: "fee_rule",
      entityKey: "TRADE-ELECTRICAL-15PCT",
      permitTypeKey: "electrical",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: WESTMINSTER_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: WESTMINSTER_SCHEDULE_SOURCE_KEY,
      notes:
        "\"Permit trade fees — An additional 15% of the permit fee for each of the following; mechanical, plumbing, electric\", with the companion row \"Plan review trade fees — An additional 15% of the plan review fee\". Both are additions to a valuation-based permit, so both carry a `custom.schedule_item absent` condition: without it an air-conditioner replacement would be charged the flat $80.00 plus its electrical note *and* the same 15% again as a project trade fee.",
    },
    {
      entityType: "fee_rule",
      entityKey: "ELEC-NOTE-AIR_CONDITIONER-15PCT",
      permitTypeKey: "electrical",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: WESTMINSTER_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: WESTMINSTER_SCHEDULE_SOURCE_KEY,
      notes:
        "The air conditioner row is marked \"* May also require an electrical permit fee\", as are furnace replacement, evaporative cooler and spa/hot tub. The schedule publishes exactly one electrical rate — the 15% trade fee — so it is applied to the row's own flat figure: $12.00 on $80.00. Recorded as a reading, with the consequence stated on the page, and as an open question in the research record: the schedule prices no stand-alone electrical permit.",
    },
    {
      entityType: "fee_rule",
      entityKey: "SFD-WATER-HEATER",
      permitTypeKey: "plumbing",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: WESTMINSTER_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: WESTMINSTER_SCHEDULE_SOURCE_KEY,
      notes:
        "\"Water Heater Replacement — $40.00\" on the Miscellaneous SFD Residential Permit Fees list. The first flat-by-job fee this project has published, and the reason the plumbing page can answer the question Denver's cannot: a common household job with a printed figure rather than a valuation to declare.",
    },
    {
      entityType: "permit_page",
      entityKey: "building-permit-cost",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: WESTMINSTER_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: WESTMINSTER_SCHEDULE_SOURCE_KEY,
      notes:
        "All eight bands with every seam asserted, the 65% review row, the exact 17/800 use tax and the three per-trade rules. The worked example — $250,000 with mechanical, plumbing and electrical scopes — computes to $8,983.06 from $1,534.20 of permit fee, $997.23 of review, $5,312.50 of use tax and three lots of $230.13 plus $149.58, and the test recomputes it rather than trusting the notes.",
    },
    {
      entityType: "permit_page",
      entityKey: "electrical-permit-cost",
      permitTypeKey: "electrical",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: WESTMINSTER_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: WESTMINSTER_SCHEDULE_SOURCE_KEY,
      notes:
        "The 15% trade fee, its 15%-of-65% review share, and the four asterisked flat rows. The reading — 15% of the flat row is the electrical permit fee — is stated on the page with its result ($92.00 for an air-conditioner replacement) and as an open question, because the schedule prices no stand-alone electrical permit.",
    },
    {
      entityType: "permit_page",
      entityKey: "plumbing-permit-cost",
      permitTypeKey: "plumbing",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: WESTMINSTER_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: WESTMINSTER_SCHEDULE_SOURCE_KEY,
      notes:
        "The flat single-family route ($40.00 water heater, $60.00 lawn sprinkler, $60.00 gas log) and the project route (15% of the permit fee plus 15% of review, which is 9.75% of the permit fee). The page states that the two are alternatives rather than charges that stack, and that no review fee is added to the flat rows — a reading of a schedule that prints them as one figure.",
    },
  ],
};

/** The pages that clear the editorial gate and may be rendered and indexed. */
export const WESTMINSTER_PUBLISHED_PERMIT_PAGES = westminsterSeed.permitPages.filter(
  (page) => page.publishStatus === "published" && page.noindex === false,
);
