import type { JurisdictionSeed } from "@/content/seed-types";

import {
  CLARK_ADMIN_CODE_SOURCE_KEY,
  CLARK_BUILDING_RULES,
  CLARK_ELECTRICAL_RULES,
  CLARK_FEE_EFFECTIVE_FROM,
  CLARK_FEES_PAGE_SOURCE_KEY,
  CLARK_PLUMBING_RULES,
} from "./fee-rules";

/**
 * Clark County, Nevada — the county as a permitting authority.
 *
 * Recorded as `county` and not as "the area around Las Vegas", because that is what
 * it is: a county that issues its own construction permits under its own code, with
 * its own fees, alongside four cities that each do the same. An address in the Las
 * Vegas Valley is covered by one authority or another and which one is the first
 * question worth answering — so the hub says what the county is and what it is not.
 *
 * The research record is research/nevada/clark-county.md. Every figure here traces to
 * Table 3-A, 3-B or 3-D of Chapter 22.02 of the Clark County Code, as published in the
 * County's own compilation.
 */

export const CLARK_LAST_VERIFIED = "2026-09-24";

export const CLARK_KEYS = {
  state: "nv",
  county: "clark-county",
  jurisdiction: "clark-county",
  feeSchedule: CLARK_ADMIN_CODE_SOURCE_KEY,
} as const;

const RESEARCHER = "Permit Fee Intelligence research pass 6 (Nevada)";

const state = {
  code: "NV",
  slug: "nevada",
  name: "Nevada",
  fipsCode: "32",
};

const county = {
  key: CLARK_KEYS.county,
  slug: "clark-county",
  name: "Clark County",
  fipsCode: "32003",
};

export const clarkCountySeed: JurisdictionSeed = {
  state,
  county,

  jurisdiction: {
    key: CLARK_KEYS.jurisdiction,
    stateKey: CLARK_KEYS.state,
    countyKey: CLARK_KEYS.county,
    type: "county",
    slug: "clark-county",
    name: "Clark County",
    officialName: "Clark County",
    websiteUrl: "https://www.clarkcountynv.gov/government/departments/building___fire_prevention/",
    permitPortalUrl: "https://www.clarkcountynv.gov/government/departments/building___fire_prevention/permit_issuance/fees",
    timezone: "America/Los_Angeles",
    isActive: true,
  },

  departments: [
    {
      key: "clark-building-fire-prevention",
      jurisdictionKey: CLARK_KEYS.jurisdiction,
      kind: "building",
      name: "Department of Building & Fire Prevention",
      /*
        No phone number is recorded, and that is deliberate rather than an omission.
        The document read for this jurisdiction prints a department address and a
        County Clerk information number, and the department's own site was not
        reached directly; putting a number on a page that tells someone who to call
        is the one error a reader cannot detect. The address is the one the
        department prints on its own code.
      */
      phone: null,
      email: null,
      url: "https://www.clarkcountynv.gov/government/departments/building___fire_prevention/",
      addressLine: "4701 W. Russell Rd., Las Vegas, NV 89118",
      hours: null,
      notes:
        "Address taken from the front matter of the Department's own Building Administrative Code compilation. No telephone number or counter hours are recorded: neither was verified from the Department's own site in this pass, and a wrong number is worse than none.",
    },
  ],

  sources: [
    {
      key: CLARK_ADMIN_CODE_SOURCE_KEY,
      jurisdictionKey: CLARK_KEYS.jurisdiction,
      title: "2018 Clark County Building Administrative Code (Clark County Code Chapter 22.02)",
      url: "https://www.clarkcountynv.gov/adobe/assets/urn:aaid:aem:d43c9c5d-c4bc-46a5-8ca1-6f3bd9a5b921/original/as/administrative-code-2nd-proof-final-08-18-22-printed-10-2022.pdf",
      sourceType: "municipal_code",
      issuingAuthority: "Clark County Department of Building & Fire Prevention",
      authorityKind: "county",
      isPrimary: true,
      documentDate: "2022-10-01",
      effectiveFrom: CLARK_FEE_EFFECTIVE_FROM,
      retrievedAt: "2026-09-24",
      lastVerifiedAt: CLARK_LAST_VERIFIED,
      notes:
        "92 pages, sha256 0df85ac497b9a57703bab62ccbb6bc1e8152b56d8b871a8dae3bfb0bcd244e48. Tables 3-A to 3-D are on pages 67-69 and were read in two pdftotext modes, which agree row for row. The compilation is dated October 2022 and its day is not printed, so the first of the month is recorded. Its own front matter states that only the adopted Code is law, so the effective dates below are taken from its amendment history: section 22.02.390 (Table 3-A) last amended by Ordinance 4663 with effect from 6 February 2019, and sections 22.02.395, 400 and 405 (Tables 3-B, 3-C and 3-D) by Ordinance 4917 with effect from 1 March 2022.",
    },
    {
      key: CLARK_FEES_PAGE_SOURCE_KEY,
      jurisdictionKey: CLARK_KEYS.jurisdiction,
      title: "Clark County Building & Fire Prevention — Fees Calculator",
      url: "https://www.clarkcountynv.gov/government/departments/building___fire_prevention/permit_issuance/fees",
      sourceType: "official_calculator",
      issuingAuthority: "Clark County Department of Building & Fire Prevention",
      authorityKind: "county",
      isPrimary: false,
      documentDate: null,
      effectiveFrom: null,
      retrievedAt: "2026-09-24",
      lastVerifiedAt: CLARK_LAST_VERIFIED,
      notes:
        "The Department's own fee page. It names the impact fees charged at permit issuance — transportation tax, residential park fee, residential multi-family park fee, MSHCP mitigation and administrative fees, public facility needs assessment, traffic mitigation, state water impact fee — and states that some or all apply to some projects and may not be charged. It publishes no rate for any of them, and its calculator is client-rendered, so no figure is taken from it. Every one of those fees is named on the pages here and charged by none of them.",
    },
  ],

  /*
    Empty on purpose: building, electrical and plumbing are global rows already
    defined by the Texas and Arizona seeds, and the seed resolves them by key. A
    second copy would either be the same row or a silent fork of it.
  */
  permitTypes: [],
  projectTypes: [],

  jurisdictionPermitTypes: [
    {
      jurisdictionKey: CLARK_KEYS.jurisdiction,
      permitTypeKey: "building",
      isAvailable: true,
      localName: "Building permit",
      officialUrl: null,
      notes:
        "Priced from Table 3-A, section 22.02.390, applied to the valuation of the work. The table's own words: \"Contract valuations supplied by the applicant shall be utilized by the Building Official\", who reserves the right to request documentation and to set the final valuation.",
    },
    {
      jurisdictionKey: CLARK_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      isAvailable: true,
      localName: "Electrical permit",
      officialUrl: null,
      notes:
        "Table 3-B, section 22.02.395, plus Table 3-A for work the table does not price: \"Fees for projects not specified in this schedule shall be determined by the Building Official by applying the total value of the scope of work being performed to Table 3-A of this chapter.\" The table also charges $4.35 per subpanel or distribution board and $0.45 per low-voltage point.",
    },
    {
      jurisdictionKey: CLARK_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      isAvailable: true,
      localName: "Plumbing permit",
      officialUrl: null,
      notes:
        "Table 3-D, section 22.02.405, with the same Table 3-A fallback as the electrical table and in the same words. Its published items are a gas re-tag at $61.88 and re-pipes, reverse osmosis, water heaters and water softeners at $56.57 each.",
    },
    {
      jurisdictionKey: CLARK_KEYS.jurisdiction,
      permitTypeKey: "mechanical",
      isAvailable: true,
      localName: "Mechanical permit",
      officialUrl: null,
      notes:
        "Table 3-C, section 22.02.400, is published and readable — a $54.00 issuance row, four online simple fees from $61.88 to $83.34, and the same Table 3-A fallback. No mechanical page is published yet, and that is a decision about this release rather than a gap in the research: the table is transcribed in research/nevada/clark-county.md.",
    },
  ],

  feeSchedules: [
    {
      key: CLARK_ADMIN_CODE_SOURCE_KEY,
      jurisdictionKey: CLARK_KEYS.jurisdiction,
      sourceKey: CLARK_ADMIN_CODE_SOURCE_KEY,
      title: "Clark County Building Administrative Code — Permit Fee Tables 3-A to 3-D",
      officialUrl:
        "https://www.clarkcountynv.gov/adobe/assets/urn:aaid:aem:d43c9c5d-c4bc-46a5-8ca1-6f3bd9a5b921/original/as/administrative-code-2nd-proof-final-08-18-22-printed-10-2022.pdf",
      effectiveFrom: CLARK_FEE_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: CLARK_LAST_VERIFIED,
      notes:
        "One schedule row for the chapter, because the tables are one document. The two effective dates inside it are recorded per rule: Table 3-A's bands carry 2019-02-06 (Ordinance 4663) and the trade tables carry 2022-03-01 (Ordinance 4917). Flattening them into one date would have thrown away the only place the difference is visible.",
    },
  ],

  feeRules: [
    ...CLARK_BUILDING_RULES.map((rule) => ({
      jurisdictionKey: CLARK_KEYS.jurisdiction,
      permitTypeKey: "building",
      scheduleKey: CLARK_ADMIN_CODE_SOURCE_KEY,
      rule,
    })),
    ...CLARK_ELECTRICAL_RULES.map((rule) => ({
      jurisdictionKey: CLARK_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      scheduleKey: CLARK_ADMIN_CODE_SOURCE_KEY,
      rule,
    })),
    ...CLARK_PLUMBING_RULES.map((rule) => ({
      jurisdictionKey: CLARK_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      scheduleKey: CLARK_ADMIN_CODE_SOURCE_KEY,
      rule,
    })),
  ],

  requirements: [
    {
      jurisdictionKey: CLARK_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "document",
      title: "Contract valuation of the work",
      description:
        "The permit fee is a function of valuation, and the schedule says whose number that is: \"Contract valuations supplied by the applicant shall be utilized by the Building Official. The Building Official reserves the option of requesting appropriate additional documentation of contract valuations supplied by the applicant. Final Building permit valuations shall be set by the Building Official.\" So the applicant declares the figure and the department may challenge it.",
      isMandatory: true,
      sortOrder: 10,
      sourceKey: CLARK_ADMIN_CODE_SOURCE_KEY,
      lastVerifiedAt: CLARK_LAST_VERIFIED,
    },
    {
      jurisdictionKey: CLARK_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "other",
      title: "Property in Clark County, outside a city's limits",
      description:
        "The county issues construction permits under its own code. Four cities in the same valley — Las Vegas, Henderson, North Las Vegas and Boulder City — issue their own under theirs, and an address inside one of them is not the county's permit to issue. Whether a given parcel is unincorporated is a question for the county's own records, not for this page.",
      isMandatory: true,
      sortOrder: 20,
      sourceKey: CLARK_ADMIN_CODE_SOURCE_KEY,
      lastVerifiedAt: CLARK_LAST_VERIFIED,
    },
    {
      jurisdictionKey: CLARK_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      requirementType: "document",
      title: "The value of the electrical scope of work",
      description:
        "Table 3-B prices a short list of items flat and routes everything else to Table 3-A, applied to \"the total value of the scope of work being performed\" rather than to the building's value. The electrical contractor's contract value is therefore the input that decides a general electrical permit.",
      isMandatory: true,
      sortOrder: 10,
      sourceKey: CLARK_ADMIN_CODE_SOURCE_KEY,
      lastVerifiedAt: CLARK_LAST_VERIFIED,
    },
    {
      jurisdictionKey: CLARK_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      requirementType: "other",
      title: "A count of subpanels and low-voltage points",
      description:
        "Two rows of Table 3-B are charged per device rather than per permit: $4.35 for each subpanel or distribution board, and $0.45 for each signal, alarm, television outlet, control panel, telephone or switchboard. Neither is counted by the fee tables themselves, so both have to be declared.",
      isMandatory: false,
      sortOrder: 20,
      sourceKey: CLARK_ADMIN_CODE_SOURCE_KEY,
      lastVerifiedAt: CLARK_LAST_VERIFIED,
    },
    {
      jurisdictionKey: CLARK_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      requirementType: "document",
      title: "The value of the plumbing scope of work",
      description:
        "As with electrical, the flat rows in Table 3-D cover a short list of common jobs and everything else is priced by applying Table 3-A to the total value of the plumbing work being performed.",
      isMandatory: true,
      sortOrder: 10,
      sourceKey: CLARK_ADMIN_CODE_SOURCE_KEY,
      lastVerifiedAt: CLARK_LAST_VERIFIED,
    },
    {
      jurisdictionKey: CLARK_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      requirementType: "other",
      title: "Whether the job is one of the five published flat items",
      description:
        "A gas re-tag, a re-pipe, a reverse osmosis system, a water heater and a water softener are each priced at a published flat figure. The schedule does not say whether a permit can carry more than one of them, so the works here price one item at a time rather than adding two flat rows the document never adds.",
      isMandatory: false,
      sortOrder: 20,
      sourceKey: CLARK_ADMIN_CODE_SOURCE_KEY,
      lastVerifiedAt: CLARK_LAST_VERIFIED,
    },
  ],

  profile: {
    jurisdictionKey: CLARK_KEYS.jurisdiction,
    headline: "What construction permits cost in Clark County",
    summary:
      "Clark County prices a building permit from one valuation table, in bands that chain: each band is written as an amount for the first part of the valuation plus a rate for every additional $1,000. Its electrical and plumbing permits are priced by the same table, applied to the value of that trade's work, with a short list of flat fees for common jobs on top. No occupancy type, no square footage and no project category changes the arithmetic.",
    localContext:
      "Three things about this schedule are worth knowing before you read any figure from it.\n\nThe first is that it chains, and Houston's does not. Every band in Table 3-A is written as \"an amount for the first N of valuation, plus a rate for each additional $1,000 or fraction thereof\", so the bands build on one another — and four of the five seams between them close to the cent: $54.00 at $500, $248.82 at $25,000, $366.95 at $50,000, $537.05 at $100,000. The last three only close once the half-cent increments are rounded, which is why this site checks them by running the arithmetic rather than by multiplying on paper.\n\nOne seam does not close, and it belongs to the schedule rather than to this site. The band covering $501 to $2,000 charges $54.00 plus $1.683 per additional $100, which gives $79.245 — $79.25 rounded — at $2,000, and the band above it opens at $79.29. Four cents apart, both figures printed, both in this site's model. Nothing about the discrepancy is large; it is stated on the page instead of smoothed over, because a schedule that disagrees with itself by four cents is a fact about the schedule a reader is entitled to know.\n\nThe second is that four of the five rates in the table are finer than a cent per thousand dollars. $7.371, $4.725, $3.402 and $2.934 per $1,000 are 737.1, 472.5, 340.2 and 293.4 cents. None can be stored as whole cents per $1,000 or as basis points without rounding before the multiplication, so all four are carried as exact fractions and reproduced exactly. The one that got away first was $7.371: read as 7,371 cents per $1,000, it charges a $25,000 valuation $1,774.62 where the table says $248.82 — ten times the published fee, invisible in prose and caught only by an arithmetic test. This is the same problem Dallas's plan review rate created, in a different primitive.\n\nThe third is that the trades are priced by the building table. Tables 3-B and 3-D each end with the same sentence: fees for projects not specified in the schedule \"shall be determined by the Building Official by applying the total value of the scope of work being performed to Table 3-A of this chapter\". A general electrical or plumbing permit is therefore a valuation-table permit on the value of that work, and the short list of flat fees above the sentence is the set of exceptions to it. That is why the electrical and plumbing pages here recompute Table 3-A rather than showing only a handful of flat rows.",
    valuationBasis:
      "Valuation is the applicant's contract valuation for the work being permitted, not a figure the county derives from square footage.\n\nThe department's own words: \"Contract valuations supplied by the applicant shall be utilized by the Building Official. The Building Official reserves the option of requesting appropriate additional documentation of contract valuations supplied by the applicant. Final Building permit valuations shall be set by the Building Official.\"\n\nSo there are two steps and they belong to different people. You declare the value of the work; the department may ask for the documents behind it and sets the final figure. Everything on this site takes the declared value as an input and computes from it — no cost per square foot is applied, because Clark County publishes none.",
    notIncluded:
      "These figures are the permit fees published in Tables 3-A, 3-B and 3-D of the Clark County Building Administrative Code, Chapter 22.02, computed by this site's engine. They are not a total project cost. In particular they exclude:\n\n- **Every development impact fee**, which the Department's own fees page lists separately: transportation tax, residential park fee, residential multi-family park fee, MSHCP mitigation and administrative fees, public facility needs assessment, traffic mitigation and the state water impact fee. The Department states that some or all apply to some projects and may not be charged, and publishes no rate for any of them.\n- **Grading permits and grading plan review** (Tables 3-E and 3-F), which are charged per cubic yard of excavation and fill — a real fee and a different question from a construction permit.\n- **Amusement and transportation system permits** (Table 3-G), **administrative and investigative fees** (Table 3-H), **other plans examination, inspection and miscellaneous fees** (Table 3-I), **sign permits** (Table 3-J) and **storm sewer inspection fees** (Table 3-L). All are published; none is modelled here.\n- **Mechanical permits** (Table 3-C), which are transcribed but not published as a page in this release.\n- **Plan review**, which the tables price through the same value table and through hourly rates in Table 3-I, and which is not separated from the permit fee in the tables read.\n- **Every event fee**: re-inspection, revision review, extensions, after-hours and overtime inspections, all charged in Table 3-I at hourly rates or flat amounts.\n- **Anything charged by a city.** Las Vegas, Henderson, North Las Vegas and Boulder City each issue their own permits under their own schedules; an address inside one of them is not this authority's permit.",
    seoTitle: "Clark County, Nevada building permit fees",
    seoDescription:
      "How Clark County prices building, electrical and plumbing permits — one valuation table applied to the work, with its chained bands, its flat trade items and the official code behind every figure.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: CLARK_LAST_VERIFIED,
  },

  permitPages: [
    {
      jurisdictionKey: CLARK_KEYS.jurisdiction,
      permitTypeKey: "building",
      slug: "building-permit-cost",
      title: "Clark County building permit cost",
      intro:
        "A Clark County building permit is priced from one table, applied to the valuation of the work. The table runs in six bands from $54.00 for $500 or less of valuation to $537.05 for the first $100,000 plus $2.934 for every additional $1,000. There is no separate rate for a house, a commercial building or a remodel, and no square-footage rate anywhere in the schedule: a $250,000 valuation pays $977.15 whichever of those it is.",
      localSummary:
        "The bands chain, and that is the whole mechanism. Each row of Table 3-A is \"an amount for the first part of the valuation, plus a rate for each additional $1,000 or fraction thereof\", so a project above $25,000 is charged the third band's figure for its first $25,000 and the fourth band's rate above that.\n\nFour of the five seams between bands close to the cent once their half-cent increments are rounded: $54.00 at $500, $248.82 at $25,000, $366.95 at $50,000 and $537.05 at $100,000 — each one the opening figure of the band above. The fifth does not: the second band's published rate of $1.683 per additional $100 gives $79.245, $79.25 rounded, at $2,000, while the third band opens at $79.29. Four cents, in the County's own document. Both figures are in the model here — the band boundaries decide which row is read, and the rows are reproduced as printed.\n\n\"Or fraction thereof\" matters and is modelled as written. One cent into a band is a whole additional $1,000, so $25,001 is charged $248.82 plus $4.725, not $248.82 plus a fraction of a cent.\n\nFour of the five rates in the table are finer than a cent per thousand dollars — $7.371, $4.725, $3.402 and $2.934 — and all four are carried as exact fractions rather than rounded. Rounding them first would have made every Clark County building permit above $25,000 of valuation wrong by cents, which is exactly the kind of error this site is built to avoid.",
      notIncluded:
        "This estimate is the building permit fee from Table 3-A alone. It excludes:\n\n- **Plan review**, which the chapter prices through the same value table and through hourly rates in Table 3-I, and which the tables read here do not separate from the permit fee. No plan review figure is charged on this page.\n- **Every development impact fee** the Department lists on its own fee page — transportation tax, residential park fee, multi-family park fee, MSHCP mitigation and administrative fees, public facility needs assessment, traffic mitigation and the state water impact fee. The Department publishes no rate for any of them and states that they vary by project.\n- **Grading permits and grading plan review** (Tables 3-E and 3-F), charged per cubic yard of excavation and fill.\n- **Sign permits** (Table 3-J), **storm sewer inspection** (Table 3-L) and every **administrative, investigative, examination and miscellaneous fee** in Tables 3-H and 3-I.\n- **Event fees**: re-inspection, revision review, permit extensions, after-hours and overtime inspections.\n- **Anything for property inside a city.** Las Vegas, Henderson, North Las Vegas and Boulder City issue their own permits; a county estimate does not describe them.",
      workedExample: {
        scenario:
          "A commercial tenant improvement with a declared contract valuation of $250,000, which is the applicant's own figure and the one the schedule says the Building Official will use.",
        inputs: {
          valuationCents: 25_000_000,
        },
        notes:
          "Table 3-A's sixth band: $537.05 for the first $100,000, plus $2.934 for each of the 150 additional thousands. This is arithmetic on the table rather than a figure the County published for a specific job — Clark County publishes no worked example of its own, so there is none to reproduce.",
      },
      faqs: [
        {
          question: "Does Clark County charge more for a house than for a commercial building of the same value?",
          answer:
            "No. Table 3-A is a single valuation table with no occupancy or construction-type column, and no independent table by project category. A $250,000 house and a $250,000 tenant improvement pay $977.15 each. That is the opposite of Dallas, where the same valuation is charged differently depending on what is being built.",
        },
        {
          question: "How is the valuation arrived at?",
          answer:
            "You declare it. The table says contract valuations supplied by the applicant shall be used by the Building Official, that the Building Official may request supporting documentation, and that the final valuation is the Building Official's to set. Nothing on this page derives a valuation from square footage, because the schedule publishes no rate that would let it.",
        },
        {
          question: "What does \"or fraction thereof\" mean in the table?",
          answer:
            "That the rate applies to every whole $1,000 the valuation reaches, including a partial one. A valuation of $100,001 is charged for 101 thousands, not 100.001, so the step from $100,000 to $100,001 adds $2.934 rather than a fraction of a cent.",
        },
        {
          question: "Is the plan review fee included?",
          answer:
            "No. The chapter prices plan review through the same valuation table and through hourly rates in Table 3-I, and the tables read for this page do not separate it from the permit fee. Adding the table to itself would double it, so no plan review figure is charged and this page says so.",
        },
        {
          question: "Why is one band boundary four cents off?",
          answer:
            "Because the schedule says two things that do not quite agree. The band covering $501 to $2,000 charges $54.00 plus $1.683 per additional $100, which is $79.245 at $2,000, while the band above it opens at $79.29. Both are printed. This site reproduces the printed rows, and states the discrepancy rather than choosing one figure and hiding the other.",
        },
        {
          question: "Is this the same as a Las Vegas permit?",
          answer:
            "No. The City of Las Vegas, Henderson, North Las Vegas and Boulder City each issue construction permits under their own codes and fee schedules. Clark County's table applies to property it permits. Which authority covers a given address follows from whether the parcel is inside a city's limits, and that is a question for the county's records rather than for this page.",
        },
      ],
      seoTitle: "Clark County, Nevada building permit cost",
      seoDescription:
        "Clark County building permit fees from the County's own Table 3-A: six chained valuation bands from $54.00 to $537.05 plus $2.934 per additional $1,000, with a computed worked example.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: CLARK_LAST_VERIFIED,
    },
    {
      jurisdictionKey: CLARK_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      slug: "electrical-permit-cost",
      title: "Clark County electrical permit cost",
      intro:
        "Clark County prices an electrical permit two ways, and the schedule says which applies. A short list of standard jobs applied for online has a flat fee — $61.88 for a re-tag or a same-size panel replacement up to 200 amps, up to $119.16 above 2000 amps. Everything else is priced by applying the building table, Table 3-A, to the value of the electrical work. On any electrical permit, subpanels cost $4.35 each and low-voltage points $0.45 each.",
      localSummary:
        "The sentence that decides most electrical permits is the last one in the table: \"Fees for projects not specified in this schedule shall be determined by the Building Official by applying the total value of the scope of work being performed to Table 3-A of this chapter.\" It is the document's own instruction, not an inference, and it means a general electrical permit in Clark County is a valuation-table permit whose valuation is the electrical contract value rather than the building's.\n\nThat also explains the shape of the table. The flat rows — a re-tag, four same-size panel replacements by amperage — are the exceptions the department has decided to price directly, and they are the jobs that can be applied for and issued online. A service upgrade, a tenant improvement's wiring, a new building's electrical scope: all of those go to Table 3-A.\n\nThe two per-device rows are charged on top, and neither is a permit in its own right. $4.35 for each subpanel or distribution board and $0.45 for each signal, alarm, television outlet, control panel, telephone or switchboard. The second row is the reason this site counts \"low-voltage points\" rather than reusing the outlet count it already had: a switchboard is not an outlet, and two jurisdictions should not be charged from one number.\n\nOne reading is worth stating. The table opens with \"Permit Issuance — for issuing permit — $54.00\", and Table 3-A's own first row is also $54.00, for a valuation of $1 to $500. Those are the same floor, so this site treats the $54 as the value table's minimum rather than as a second charge on top of it. If the County means the issuance fee to be additional, a general electrical permit here is $54 more than shown.",
      notIncluded:
        "This estimate is the electrical permit fee from Table 3-B, with Table 3-A applied where the table routes it there. It excludes:\n\n- **The building permit fee**, if the electrical work is part of a construction or remodelling project rather than a stand-alone electrical permit. That fee is on the building permit page.\n- **Plan review**, which the chapter prices through the same valuation table and hourly Table 3-I rates and does not separate from the permit fee.\n- **The $54.00 permit issuance row**, treated here as Table 3-A's own $54 floor rather than as an additional charge, for the reason given on the page. If the County charges both, this figure is $54 low.\n- **Mechanical work** (Table 3-C) and every fee in Tables 3-E, 3-F, 3-G, 3-H, 3-I, 3-J and 3-L.\n- **Development impact fees**, which the Department lists on its own page and publishes no rate for.\n- **Event fees**: re-inspection, revisions, extensions, after-hours and overtime inspections.\n- **Anything for property inside a city.** Las Vegas, Henderson, North Las Vegas and Boulder City issue their own electrical permits.",
      workedExample: {
        scenario:
          "A stand-alone electrical permit for a workshop fit-out with a declared scope-of-work value of $30,000, including two new subpanels. No item from the flat online list applies, so Table 3-A is the table that prices it.",
        inputs: {
          valuationCents: 3_000_000,
          custom: { panels: 2 },
        },
        notes:
          "Table 3-A's fourth band: $248.82 for the first $25,000, plus $4.725 for each of the five additional thousands, and then $4.35 for each of the two subpanels. That is $272.45 for the valuation bands and $8.70 for the panels, $281.15 in total. The valuation is the value of the electrical work rather than of the building, which is what the table's final sentence requires and what makes this a different figure from the same project's building permit.",
      },
      faqs: [
        {
          question: "When does the flat fee apply instead of the valuation table?",
          answer:
            "When the job is one of the five the table publishes: a re-tag, or a same-size panel replacement in one of four amperage ranges. Those are priced directly because they are standard enough to be applied for and issued online. Anything else — a service upgrade, new wiring, the electrical scope of a construction project — is priced by Table 3-A applied to the value of the work.",
        },
        {
          question: "What value does Clark County use for an electrical permit?",
          answer:
            "The value of the electrical scope of work being performed, in the table's own words, rather than the value of the whole building. That is why the same workshop can have a different electrical fee from its building fee, and it is the input this page asks for.",
        },
        {
          question: "Are subpanels charged on top of the permit fee?",
          answer:
            "Yes. Table 3-B's Services rows charge $4.35 for each subpanel or distribution board and $0.45 for each signal, alarm, television outlet, control panel, telephone or switchboard. They are per-device charges on any electrical permit, including one the valuation table prices.",
        },
        {
          question: "Is the $54 permit issuance fee extra?",
          answer:
            "Not in the reading used here. The table prints a $54 issuance row, and Table 3-A's first row is also $54 — for a valuation of $1 to $500 — so the two are treated as the same floor rather than as two charges, because charging both would bill one permit twice. If the County charges them cumulatively, every general electrical figure on this page is $54 short of the City's own.",
        },
        {
          question: "Does the online panel replacement fee scale with the panel size?",
          answer:
            "Yes, in four published steps: $61.88 up to 200 amps, $70.56 up to 600, $86.80 up to 2000, and $119.16 above 2000. Each is for a same-size replacement, so the fee is for the permit rather than for the work's value, and a service change rather than a like-for-like replacement goes to the valuation table instead.",
        },
        {
          question: "Does a low-voltage or alarm system need its own permit?",
          answer:
            "The schedule prices low-voltage work rather than describing a separate permit: $0.45 for each signal, alarm, television outlet, control panel, telephone or switchboard. Whether that is taken out alone or added to another electrical permit is a question for the department, and the fee is the same either way.",
        },
      ],
      seoTitle: "Clark County, Nevada electrical permit cost",
      seoDescription:
        "Clark County electrical permit fees from Table 3-B: flat online fees from $61.88 to $119.16, Table 3-A applied to the value of the work, $4.35 per subpanel and $0.45 per low-voltage point.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: CLARK_LAST_VERIFIED,
    },
    {
      jurisdictionKey: CLARK_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      slug: "plumbing-permit-cost",
      title: "Clark County plumbing permit cost",
      intro:
        "A water heater permit in Clark County costs $56.57, and so does a re-pipe, a reverse osmosis system or a water softener; a gas re-tag is $61.88. Those five figures come straight from the County's plumbing table and are the ones most people are looking for. Anything else — a commercial re-pipe, the plumbing scope of a new building — is priced from the same valuation table as a building permit, applied to the value of the plumbing work: $248.82 for the first $25,000, plus $4.725 for every additional $1,000, at the band a $30,000 job falls in.",
      localSummary:
        "The water heater figure is the one that surprises people, and it is real: $56.57, published in Table 3-D's list of online simple permit fees, alongside re-pipes, reverse osmosis systems and water softeners at the same amount and a gas re-tag at $61.88. None of them is measured against anything. Replace a 40-gallon tank with another and the permit is $56.57; replace it with a commercial unit and re-plumb half the building and you are back at the valuation table.\n\nThat is because the table's last sentence routes everything it does not list to Table 3-A: \"Fees for projects not specified in this schedule shall be determined by the Building Official by applying the total value of the scope of work being performed to Table 3-A of this chapter.\" So a plumbing permit in Clark County is either one of five flat figures or a valuation-table permit on the value of the plumbing work — never both, in the model here, because the schedule calls the value table the fee for what the trade table does not specify.\n\nThe five flat rows are alternatives to each other as well. The document lists them as separate items and never adds two, so this page prices one at a time; charging a re-pipe and a water heater on one permit would invent a sum the schedule does not contain. That is the same rule the Scottsdale pages follow for its minimum and its water heater.\n\nOne reading is worth stating. Table 3-D opens with \"Permit Issuance — for issuing permit — $54.00\", and Table 3-A's own first row is also $54.00. They are the same floor, so the $54 is treated as the value table's minimum rather than as a second charge. If the County means it to be additional, a general plumbing permit here is $54 more than shown.",
      notIncluded:
        "This estimate is the plumbing permit fee from Table 3-D, with Table 3-A applied where the table routes it there. It excludes:\n\n- **The building permit fee**, if the plumbing work belongs to a construction or remodelling project rather than a stand-alone plumbing permit.\n- **Water and sewer connections**, which are not in this schedule at all — they are charged separately, and neither is modelled here.\n- **Plan review**, which the chapter prices through the same valuation table and hourly Table 3-I rates and does not separate from the permit fee.\n- **The $54.00 permit issuance row**, treated here as Table 3-A's own $54 floor rather than as an additional charge. If the County charges both, this figure is $54 low.\n- **Mechanical work** (Table 3-C), **grading** (Tables 3-E and 3-F) and every fee in Tables 3-G, 3-H, 3-I, 3-J and 3-L.\n- **Development impact fees**, which the Department lists on its own page and publishes no rate for.\n- **Event fees**: re-inspection, revisions, extensions, after-hours and overtime inspections.\n- **Anything for property inside a city.** Las Vegas, Henderson, North Las Vegas and Boulder City issue their own plumbing permits.",
      workedExample: {
        scenario:
          "A like-for-like residential water heater replacement, which is one of the five jobs the plumbing table prices directly rather than by valuation. No valuation is used and none is asked for.",
        inputs: {
          custom: { schedule_item: "water_heater" },
        },
        notes:
          "Table 3-D, Online Plumbing Simple Permit Fees: \"Water Heater — $56.57\". The figure is flat, so nothing about the size of the tank, the property or the contract changes it. Re-place the same job as a commercial re-pipe and it leaves the flat list and returns to Table 3-A, which is the route the rest of this page describes and which the electrical page computes.",
      },
      faqs: [
        {
          question: "How much is a water heater permit in Clark County?",
          answer:
            "$56.57, published in Table 3-D's online simple permit fees. It is a flat figure rather than a percentage of the work: the schedule lists it precisely so that a like-for-like replacement does not need a valuation.",
        },
        {
          question: "Do I pay the flat fee and the valuation table both?",
          answer:
            "No. The plumbing table's own last sentence makes Table 3-A the fee for what the table does not specify, so a listed job is priced flat and a job that is not listed is priced by valuation. Charging both would bill one permit twice, and the schedule never adds them.",
        },
        {
          question: "Can one permit cover a re-pipe and a water heater?",
          answer:
            "The schedule lists them as separate items with separate fees and never adds two together. This page therefore prices one published item at a time; a permit covering both would be a question for the department rather than a sum this site is willing to invent.",
        },
        {
          question: "What is a gas re-tag and why does it cost more?",
          answer:
            "It is the online simple permit for gas work that does not involve running new piping, and at $61.88 it is $5.31 more than the other four flat rows. The schedule publishes the figure without explaining the difference; this page reproduces it rather than speculating about it.",
        },
        {
          question: "Is the $54 permit issuance fee charged on a plumbing permit?",
          answer:
            "Not in the reading used here. Table 3-D opens with a $54 issuance row and Table 3-A's own first row is also $54 — for a valuation of $1 to $500 — so the two are treated as the same floor rather than as two charges, because charging both would bill one permit twice. If the County means the issuance fee to be additional, every general plumbing figure on this page is $54 low.",
        },
        {
          question: "Are water and sewer connections included?",
          answer:
            "No. Connection charges are not part of Chapter 22.02's permit fee tables at all, and they are not modelled here. On a new building they can be the largest single charge after the impact fees, which is why they are named on every page.",
        },
        {
          question: "Is plumbing work priced from the building's value or from the plumbing contract?",
          answer:
            "From the plumbing scope of work's value. Table 3-D routes unspecified work to Table 3-A applied to \"the total value of the scope of work being performed\", not to the building's valuation, so a tenant improvement's plumbing is priced on the plumbing contract and the building permit is priced separately.",
        },
      ],
      seoTitle: "Clark County, Nevada plumbing permit cost",
      seoDescription:
        "Clark County plumbing permit fees from Table 3-D: $56.57 for a water heater, re-pipe, reverse osmosis or water softener, $61.88 for a gas re-tag, or Table 3-A applied to the value of the work.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: CLARK_LAST_VERIFIED,
    },
  ],

  verifications: [
    {
      entityType: "source",
      entityKey: CLARK_ADMIN_CODE_SOURCE_KEY,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: CLARK_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: CLARK_ADMIN_CODE_SOURCE_KEY,
      notes:
        "Read on 2026-09-24 in two pdftotext modes. sha256 0df85ac497b9a57703bab62ccbb6bc1e8152b56d8b871a8dae3bfb0bcd244e48, 92 pages. Table 3-A was read with -layout and with -table and the two agree row for row, label against amount; Tables 3-B, 3-C and 3-D were read with -layout after the same check on 3-A. Its front matter states that only the adopted Code is law, and records the amendment history the effective dates here are taken from.",
    },
    {
      entityType: "source",
      entityKey: CLARK_FEES_PAGE_SOURCE_KEY,
      status: "verified",
      method: "official_portal_check",
      verifiedAt: CLARK_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: CLARK_FEES_PAGE_SOURCE_KEY,
      notes:
        "Read on 2026-09-24. The page answers 200 and names the development impact fees charged at issuance, without rates. Its fee calculator is rendered client-side: the extracted page text contains the calculator's heading and no figures, so no rate is taken from it and none is claimed. Recorded as read-but-not-a-source-of-rates rather than as a failure.",
    },
    {
      entityType: "fee_rule",
      entityKey: "TABLE-3A-1-500",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: CLARK_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: CLARK_ADMIN_CODE_SOURCE_KEY,
      notes:
        "Table 3-A, first row, section 22.02.390: \"$1 to $500 — $54.00\". Conditional on valuation at or below $500 and on no schedule item being selected, so that a project choosing a flat trade item is not charged this as well.",
    },
    {
      entityType: "fee_rule",
      entityKey: "TABLE-3A-501-2000",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: CLARK_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: CLARK_ADMIN_CODE_SOURCE_KEY,
      notes:
        "Table 3-A: \"$501 to $2,000 — $54.00 for the first $500.00 plus $1.683 for each additional $100.00 or fraction thereof\". The step is $100 here and $1,000 everywhere else in the table; stored as $16.83 per $1,000 with a $100 increment, which is the same arithmetic and keeps the published $1.683 readable. At $2,000 this produces $79.245, $79.25 rounded, while the band above opens at $79.29 — a four-cent seam, the only one of the five that does not close, pinned in tests/content/clarkcounty-seed.test.ts.",
    },
    {
      entityType: "fee_rule",
      entityKey: "TABLE-3A-2001-25000",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: CLARK_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: CLARK_ADMIN_CODE_SOURCE_KEY,
      notes:
        "Table 3-A: \"$2,001 to $25,000 — $79.29 for the first $2,000.00 plus $7.371 for each additional $1,000.00 or fraction thereof\". $7.371 per $1,000 is 737.1 cents, so the rate is stored as the fraction 7,371/10. Storing it as 7,371 whole cents per $1,000 — the reading the field name invites — charges a $25,000 valuation $1,774.62 instead of the published $248.82, and tests/content/clarkcounty-seed.test.ts pins the correct figure.",
    },
    {
      entityType: "fee_rule",
      entityKey: "TABLE-3A-25001-50000",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: CLARK_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: CLARK_ADMIN_CODE_SOURCE_KEY,
      notes:
        "Table 3-A: \"$248.82 for the first $25,000.00 plus $4.725 for each additional $1,000.00 or fraction thereof\". $4.725 is 472.5 cents per $1,000 and 47.25 basis points, so it is carried as the exact fraction 945/2. The band's arithmetic is reproduced in tests/calc/per-thousand-exact.test.ts: $40,000 is 15 additional thousands, $70.875, and $319.695 rounds to $319.70.",
    },
    {
      entityType: "fee_rule",
      entityKey: "TABLE-3A-50001-100000",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: CLARK_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: CLARK_ADMIN_CODE_SOURCE_KEY,
      notes:
        "Table 3-A: \"$366.95 for the first $50,000.00 plus $3.402 for each additional $1,000.00 or fraction thereof\". $3.402 per $1,000 is 340.2 cents, carried as 3402/10. This band's opening figure is exactly what the band below produces at $50,000 once its half-cent increment is rounded — $366.945 becomes $366.95 — which is asserted as a boundary test.",
    },
    {
      entityType: "fee_rule",
      entityKey: "TABLE-3A-100001-UP",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: CLARK_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: CLARK_ADMIN_CODE_SOURCE_KEY,
      notes:
        "Table 3-A, final row: \"$100,001 and up — $537.05 for the first $100,000.00 plus $2.934 for each additional $1,000.00 or fraction thereof\". $2.934 per $1,000 is 293.4 cents, carried as 2934/10. The page's worked example is in this band: $250,000 gives $537.05 plus 150 increments of $2.934, which is $977.15.",
    },
    {
      entityType: "fee_rule",
      entityKey: "TABLE-3B-SUBPANEL",
      permitTypeKey: "electrical",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: CLARK_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: CLARK_ADMIN_CODE_SOURCE_KEY,
      notes:
        "Table 3-B, Services: \"For each subpanel or distribution board — $4.35\". Modelled with the existing `panels` count rather than a new kind: a subpanel is an electrical panel, and Clark County charges that count once, so there is nothing for a second kind to disambiguate.",
    },
    {
      entityType: "fee_rule",
      entityKey: "TABLE-3B-LOW-VOLTAGE",
      permitTypeKey: "electrical",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: CLARK_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: CLARK_ADMIN_CODE_SOURCE_KEY,
      notes:
        "Table 3-B, Power Limited: \"$0.45 — for signals, alarms, or television outlets, control panels, telephones, switchboards, each\". Modelled with a new `low_voltage_points` count: half the row is not an outlet, and reading Clark County's switchboards as Houston's outlets would have made two jurisdictions report one number. See PER_UNIT_KINDS in @/lib/calc/types.",
    },
    {
      entityType: "fee_rule",
      entityKey: "TABLE-3D-WATER-HEATER",
      permitTypeKey: "plumbing",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: CLARK_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: CLARK_ADMIN_CODE_SOURCE_KEY,
      notes:
        "Table 3-D, Online Plumbing Simple Permit Fees: \"Water Heater — $56.57\". Conditional on the water heater item being selected, which is what keeps it mutually exclusive with the Table 3-A bands rather than additive: the plumbing table calls Table 3-A the fee for work the table does not list.",
    },
    {
      entityType: "permit_page",
      entityKey: "building-permit-cost",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: CLARK_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: CLARK_ADMIN_CODE_SOURCE_KEY,
      notes:
        "All six bands of Table 3-A transcribed as rules, with the four seams that close and the one that does not — four cents between the second and third bands — stated on the page rather than resolved. The worked example is arithmetic on the table, not a County worked example: Clark County publishes none.",
    },
    {
      entityType: "permit_page",
      entityKey: "electrical-permit-cost",
      permitTypeKey: "electrical",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: CLARK_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: CLARK_ADMIN_CODE_SOURCE_KEY,
      notes:
        "The five flat online rows, both per-device service rows and the Table 3-A bands, which the table's own final sentence routes unspecified work to. The $54 permit issuance row is treated as Table 3-A's own $54 floor and that reading is stated on the page and in research/nevada/clark-county.md as an open question.",
    },
    {
      entityType: "permit_page",
      entityKey: "plumbing-permit-cost",
      permitTypeKey: "plumbing",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: CLARK_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: CLARK_ADMIN_CODE_SOURCE_KEY,
      notes:
        "The five flat rows of Table 3-D and the Table 3-A bands, with the same $54 reading as the electrical page. Water and sewer connection charges are named as outside the schedule and are not modelled.",
    },
    {
      entityType: "jurisdiction_profile",
      entityKey: CLARK_KEYS.jurisdiction,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: CLARK_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: CLARK_ADMIN_CODE_SOURCE_KEY,
      notes:
        "Hub content built from the chapter and the Department's own fee page. The Department's postal address comes from the code's front matter; no telephone number or counter hours are recorded, because neither was verified in this pass and a wrong number on a page that tells someone who to call is the error a reader cannot detect. Mechanical, grading and the seven unmodelled tables are named in the coverage notes.",
    },
  ],
};

/** Permit pages that clear the editorial gate, for use in tests without a database. */
export const CLARK_PUBLISHED_PERMIT_PAGES = clarkCountySeed.permitPages.filter(
  (page) => page.publishStatus === "published" && !page.noindex,
);

