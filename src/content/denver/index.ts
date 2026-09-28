import type { JurisdictionSeed } from "@/content/seed-types";

import {
  DENVER_BUILDING_RULES,
  DENVER_ELECTRICAL_RULES,
  DENVER_FEE_EFFECTIVE_FROM,
  DENVER_FEES_PAGE_SOURCE_KEY,
  DENVER_PLUMBING_RULES,
  DENVER_POLICY_SOURCE_KEY,
} from "./fee-rules";

/**
 * Denver, Colorado — the City and County of Denver, which is one government.
 *
 * It is recorded with a county row because every jurisdiction here has one, but there
 * is no second authority to distinguish from: Denver City and Denver County are the
 * same entity with one building department, so a reader who arrives looking for "the
 * county's fee" is looking for this page.
 *
 * Research record: research/colorado/denver.md.
 */

export const DENVER_LAST_VERIFIED = "2026-09-24";

export const DENVER_KEYS = {
  state: "co",
  county: "denver-county",
  jurisdiction: "denver",
  feeSchedule: DENVER_POLICY_SOURCE_KEY,
} as const;

const RESEARCHER = "Permit Fee Intelligence research pass 7 (Colorado)";

const state = {
  code: "CO",
  slug: "colorado",
  name: "Colorado",
  fipsCode: "08",
};

const county = {
  key: DENVER_KEYS.county,
  slug: "denver-county",
  name: "Denver County",
  fipsCode: "08031",
};

export const denverSeed: JurisdictionSeed = {
  state,
  county,

  jurisdiction: {
    key: DENVER_KEYS.jurisdiction,
    stateKey: DENVER_KEYS.state,
    countyKey: DENVER_KEYS.county,
    type: "city",
    slug: "denver",
    name: "Denver",
    officialName: "City and County of Denver",
    websiteUrl:
      "https://www.denvergov.org/Government/Agencies-Departments-Offices/Agencies-Departments-Offices-Directory/Community-Planning-and-Development/Plan-Review-Permits-and-Inspections",
    permitPortalUrl:
      "https://www.denvergov.org/Government/Agencies-Departments-Offices/Agencies-Departments-Offices-Directory/Community-Planning-and-Development/Plan-Review-Permits-and-Inspections/Development-Fees",
    timezone: "America/Denver",
    isActive: true,
  },

  departments: [
    {
      key: "denver-cpd",
      jurisdictionKey: DENVER_KEYS.jurisdiction,
      kind: "building",
      name: "Community Planning & Development — Building",
      /*
        No telephone number is recorded. The building policy read for this page prints
        a Chief Building Official, a policy number and a revision date, and no contact
        details at all; the department's own site was not read for them in this pass.
        A page that tells someone who to call is the one place a wrong number cannot be
        caught by the reader, so it is left out rather than guessed.
      */
      phone: null,
      email: null,
      url: "https://www.denvergov.org/Government/Agencies-Departments-Offices/Agencies-Departments-Offices-Directory/Community-Planning-and-Development/Plan-Review-Permits-and-Inspections",
      addressLine: null,
      hours: null,
      notes:
        "The policy that publishes these fees is signed by the Chief Building Official, Eric Browning, P.E., as \"ADMIN 125 and 138\", and applies to the Building Code of the City and County of Denver. This site records the department's portal rather than an address or a number, because neither was verified from a City page in this pass.",
    },
  ],

  sources: [
    {
      key: DENVER_POLICY_SOURCE_KEY,
      jurisdictionKey: DENVER_KEYS.jurisdiction,
      title: "Building Permit Policy — Building and Related Fees (ADMIN 125 and 138)",
      url: "https://www.denvergov.org/files/assets/public/v/9/community-planning-and-development/documents/ds/building-codes/policies/admin_138.pdf",
      sourceType: "fee_schedule_pdf",
      issuingAuthority: "City and County of Denver, Community Planning & Development",
      authorityKind: "city",
      isPrimary: true,
      documentDate: "2024-05-21",
      effectiveFrom: DENVER_FEE_EFFECTIVE_FROM,
      retrievedAt: "2026-09-24",
      lastVerifiedAt: DENVER_LAST_VERIFIED,
      notes:
        "Six pages, revision date 21 May 2024, replacing the policy dated 1 February 2024. Read 2026-09-24 in three pdftotext modes: `-layout` interleaves Table No. 1's three columns, `-table` pairs them, and `-raw` confirms the order of the rows. Table No. 1 is the valuation table, Table No. 2 is ICC valuation data and quick-permit square-foot prices, and Table No. 3 is contractor licence fees.",
    },
    {
      key: DENVER_FEES_PAGE_SOURCE_KEY,
      jurisdictionKey: DENVER_KEYS.jurisdiction,
      title: "Building and Land Development Fees",
      url: "https://www.denvergov.org/Government/Agencies-Departments-Offices/Agencies-Departments-Offices-Directory/Community-Planning-and-Development/Plan-Review-Permits-and-Inspections/Development-Fees",
      sourceType: "municipal_website",
      issuingAuthority: "City and County of Denver",
      authorityKind: "city",
      isPrimary: false,
      documentDate: null,
      effectiveFrom: null,
      retrievedAt: "2026-09-24",
      lastVerifiedAt: DENVER_LAST_VERIFIED,
      notes:
        "The City's development fees landing page, recorded as the route to the policy rather than as a source of rates. No figure on this site is taken from it.",
    },
  ],

  /** Empty on purpose: the permit types this jurisdiction uses already exist. */
  permitTypes: [],
  projectTypes: [],

  jurisdictionPermitTypes: [
    {
      jurisdictionKey: DENVER_KEYS.jurisdiction,
      permitTypeKey: "building",
      isAvailable: true,
      localName: "Building permit",
      officialUrl: null,
      notes:
        "Priced from Table No. 1 on the valuation of the work, with plan review as the third column of the same table: 50% of the permit fee, and $0 below $2,000 of valuation. Express reviews are 20% with a $100 floor, type-approved permits 10%.",
    },
    {
      jurisdictionKey: DENVER_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      isAvailable: true,
      localName: "Electrical permit",
      officialUrl: null,
      notes:
        "A separate permit is required for each discipline once plans are released, and the policy states that \"the permit fee is based on the valuation of the work for that specific trade permitted under that specific permit\" — so an electrical permit is Table No. 1 applied to the electrical value, not a percentage of the building permit.",
    },
    {
      jurisdictionKey: DENVER_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      isAvailable: true,
      localName: "Plumbing permit",
      officialUrl: null,
      notes:
        "Priced the same way as electrical, from the plumbing value of the work. A water heater replacement is a quick permit: Table No. 1 on its valuation, and no plan review, because \"a review is not performed and there are no plan review fees associated with quick permits\".",
    },
    {
      jurisdictionKey: DENVER_KEYS.jurisdiction,
      permitTypeKey: "mechanical",
      isAvailable: true,
      localName: "Mechanical permit",
      officialUrl: null,
      notes:
        "Also a separate discipline permit priced from the mechanical value of the work under the same sentence. No mechanical page is published in this release; the mechanism is the electrical and plumbing one, and the table it reads is already modelled here.",
    },
  ],

  feeSchedules: [
    {
      key: DENVER_POLICY_SOURCE_KEY,
      jurisdictionKey: DENVER_KEYS.jurisdiction,
      sourceKey: DENVER_POLICY_SOURCE_KEY,
      title: "Building Permit Policy (ADMIN 125 and 138) — Tables 1 and 2",
      officialUrl:
        "https://www.denvergov.org/files/assets/public/v/9/community-planning-and-development/documents/ds/building-codes/policies/admin_138.pdf",
      effectiveFrom: DENVER_FEE_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: DENVER_LAST_VERIFIED,
      notes:
        "One policy, one revision date, one table of rates. The revision date is the effective date recorded here: the policy replaces one dated 1 February 2024, so it is in force from 21 May 2024 and a reader can see which version these figures belong to.",
    },
  ],

  feeRules: [
    ...DENVER_BUILDING_RULES.map((rule) => ({
      jurisdictionKey: DENVER_KEYS.jurisdiction,
      permitTypeKey: "building",
      scheduleKey: DENVER_POLICY_SOURCE_KEY,
      rule,
    })),
    ...DENVER_ELECTRICAL_RULES.map((rule) => ({
      jurisdictionKey: DENVER_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      scheduleKey: DENVER_POLICY_SOURCE_KEY,
      rule,
    })),
    ...DENVER_PLUMBING_RULES.map((rule) => ({
      jurisdictionKey: DENVER_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      scheduleKey: DENVER_POLICY_SOURCE_KEY,
      rule,
    })),
  ],

  requirements: [
    {
      jurisdictionKey: DENVER_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "document",
      title: "A valuation, and it is the higher of two numbers",
      description:
        "Section 100 sets the rule in one sentence: \"Valuation shall be the higher of either the base data derived from the current International Code Council (ICC) building valuation data or the value of the work covered by the permit provided by the applicant at the time of permit application.\" The policy lists what the valuation must include — labour, materials, profit, overhead, finish work, roofing, electrical, plumbing, heating, air conditioning, elevators and any other permanent equipment — and adds shoring and excavation for single-family and duplex projects. For commercial work, shoring and excavation are logged and permitted separately. The Building Official's determination \"is not subject to appeal\".",
      isMandatory: true,
      sortOrder: 10,
      sourceKey: DENVER_POLICY_SOURCE_KEY,
      lastVerifiedAt: DENVER_LAST_VERIFIED,
    },
    {
      jurisdictionKey: DENVER_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "other",
      title: "Plan review is paid before review begins",
      description:
        "\"The plan review process will not begin for a project until the plan review fee is paid in full\", and an application whose review fee is unpaid 45 days after notification expires. The fee is charged as a percentage of the permit fee, so it is known before submission — the payment is what starts the clock rather than what ends it.",
      isMandatory: true,
      sortOrder: 20,
      sourceKey: DENVER_POLICY_SOURCE_KEY,
      lastVerifiedAt: DENVER_LAST_VERIFIED,
    },
    {
      jurisdictionKey: DENVER_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "license",
      title: "Licensed contractors, with one exception for a homeowner",
      description:
        "Permits \"must be obtained by contractors licensed with the City and County of Denver\" — Table No. 3 prices those licences at $250 every three years, with supervisor and journeyman certificates at $60 and $40. The exception is narrow and stated: a homeowner may be issued permits for a single-family home, but not for an accessory dwelling unit.",
      isMandatory: true,
      sortOrder: 30,
      sourceKey: DENVER_POLICY_SOURCE_KEY,
      lastVerifiedAt: DENVER_LAST_VERIFIED,
    },
    {
      jurisdictionKey: DENVER_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "other",
      title: "One permit per discipline, priced per discipline",
      description:
        "Once plans are released, \"separate permits are required for each discipline\" — architectural, structural, mechanical, plumbing and electrical — and each one's fee \"is based on the valuation of the work for that specific trade permitted under that specific permit\". Four disciplines are four permits and four valuations, not one fee split four ways.",
      isMandatory: true,
      sortOrder: 40,
      sourceKey: DENVER_POLICY_SOURCE_KEY,
      lastVerifiedAt: DENVER_LAST_VERIFIED,
    },
    {
      jurisdictionKey: DENVER_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      requirementType: "document",
      title: "The value of the electrical work",
      description:
        "An electrical permit is priced from Table No. 1 on \"the valuation of the work for that specific trade\", so the electrical contract value is the input. It is not a share of the building valuation and it is not a percentage of the building permit fee — Denver's trades are not surcharges on the building permit the way Westminster's are.",
      isMandatory: true,
      sortOrder: 10,
      sourceKey: DENVER_POLICY_SOURCE_KEY,
      lastVerifiedAt: DENVER_LAST_VERIFIED,
    },
    {
      jurisdictionKey: DENVER_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      requirementType: "other",
      title: "Whether the job is a quick permit",
      description:
        "Quick permits cover small projects that replace existing systems — roof coverings, hot water heaters, light fixtures and similar — and they \"only require building permit fees as set forth in Table No. 1\", with no plan review at all. A water heater replacement is priced from its own valuation the same way a bathroom remodel's plumbing is; what changes is that no review fee is charged.",
      isMandatory: false,
      sortOrder: 20,
      sourceKey: DENVER_POLICY_SOURCE_KEY,
      lastVerifiedAt: DENVER_LAST_VERIFIED,
    },
  ],

  profile: {
    jurisdictionKey: DENVER_KEYS.jurisdiction,
    headline: "What construction permits cost in Denver",
    summary:
      "Denver prices a building permit from one valuation table — $20.00 up to $500 of valuation, then $35.00, then $35.00 plus $8.00 for each additional $1,000 — and prints plan review as a third column of the same table: 50% of the permit fee, and nothing at all below $2,000 of valuation. A separate permit is required for each trade, each priced from the value of that trade's work, so an electrical permit is not a share of the building fee.",
    localContext:
      "Four things about this schedule decide the figure, and one of them is a dollar.\n\nThe first is that **plan review is a column of the fee table, not a separate schedule**. Every band above $2,000 prints \"50%\" in the review column, and the two bands below it print \"0\". That single fact answers the question most people arrive with — whether review is included — and it is why this site computes review as a percentage of the permit fee rather than as a second valuation table. The policy adds three review *modes* that replace the 50% figure rather than stacking on it: an express review is 20% with a $100 minimum, a type-approved permit is 10%, and a master plan is 50% of its own valuation — which the policy points out is the same arithmetic as the table's column.\n\nThe second is that the trades are priced like the building, not like a surcharge. \"Once released, separate permits are required for each discipline... and the permit fee is based on the valuation of the work for that specific trade permitted under that specific permit.\" So four disciplines are four permits with four valuations, and an electrical permit for $25,000 of work costs the same as a $25,000 building permit. Compare Westminster, twenty minutes north, where a trade permit is a percentage of the building permit fee — the same state, two different ideas of what a trade permit *is*.\n\nThe third is that the table disagrees with itself by a dollar, and the page says so. Five of the six handovers close exactly: the band below produces precisely the figure the band above opens with at $2,000, $50,000, $100,000, $500,000 and $1,000,000. The sixth does not. The band covering $2,001 to $25,000 charges $35.00 plus $8.00 for each additional $1,000, which gives **$219.00** at $25,000, and the band above opens at **$220.00**. Because the table also says \"or fraction thereof\", one cent past $25,000 moves the project into the band above and charges a whole additional $1,000 of increment, so the step from $25,000 to $25,001 is **$9.00, not $1.00**. Both readings are the City's; this site reproduces them instead of tidying the seam.\n\nThe fourth is what the valuation is, because it is not simply what the applicant says. Denver takes the higher of the ICC's published construction cost data and the applicant's own contract value, and the Building Official's determination is not subject to appeal. That makes Table No. 2 — which publishes square-foot prices for common quick-permit work — a valuation input rather than a fee: $5.25 per square foot for a residential shingle roof, $7.25 for a commercial low-slope roof, $60.00 for residential interior renovations. No page here ever applies one of those to a fee.",
    valuationBasis:
      "Denver takes the **higher of two numbers**: \"Valuation shall be the higher of either the base data derived from the current International Code Council (ICC) building valuation data or the value of the work covered by the permit provided by the applicant at the time of permit application.\"\n\nThe valuation must include labour, materials, profit, overhead, finish work, roofing, electrical, plumbing, heating, air conditioning, elevators and any other permanent equipment, on top of what most contractors would call the contract price. For single-family and duplex projects it also includes shoring and excavation; commercial shoring and excavation is logged and permitted separately, so it is not part of the building permit's valuation.\n\nWhere the two numbers are disputed, the Building Official decides \"using all resources available\" and that determination is not subject to appeal. So the applicant's figure is an input that can be raised, and this site computes from the figure you give it — no square-foot rate is ever substituted for a valuation, because the ICC data table it would come from is published by the Code Council rather than by Denver and changes twice a year.",
    notIncluded:
      "These figures are the fees published in the City and County of Denver's own Building Permit Policy, tables 1 and 2, computed by this site's engine. They are not a total project cost. In particular they exclude:\n\n- **Multi-phase surcharges.** \"Two Phase Construction Permits — Fee plus 25%\" and \"Three or More Phase Construction Permits — Fee plus 50%\", applied by the policy to both the permit and the plan review fee. The policy does not say whether the surcharge on the review fee is taken before or after the surcharge on the permit fee, so no figure here includes one and the building page states that plainly.\n- **The Affordable Housing Linkage Fee and the Fee-in-Lieu alternative**, established in Chapter 27 of the Denver Revised Municipal Code and adjusted annually.\n- **The affordable-housing permit-fee reduction** — up to $6,500 or $10,000 per income restricted unit, capped at 50% of the construction permit fee. A reduction is not an exclusion, but a quoted figure here is the un-reduced one, so a project that qualifies will pay less than this site shows.\n- **Every hourly fee**: additional plan review at $125.00 per hour for incomplete, deferred or modified drawings; re-inspection and out-of-hours inspection at $100.00 per hour, with a two-hour minimum prepaid after hours.\n- **Contractor licences** (Table No. 3): $250.00 for a contractor licence every three years, $60.00 for a supervisor certificate, $40.00 for journeyman, engineer and operator certificates. A licence, not a permit.\n- **Shoring, benching, grading and demolition permits**, which are separate permits on commercial projects rather than lines in this fee.\n- **Anything charged by another Colorado authority.** Denver is a consolidated city and county with its own building department; a neighbouring city's schedule does not describe a Denver permit, and vice versa.",
    seoTitle: "Denver building permit fees and plan review",
    seoDescription:
      "How Denver prices building, electrical and plumbing permits — one valuation table with plan review as its third column at 50%, express and type-approved review rates, and the official policy behind every figure.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: DENVER_LAST_VERIFIED,
  },

  permitPages: [
    {
      jurisdictionKey: DENVER_KEYS.jurisdiction,
      permitTypeKey: "building",
      slug: "building-permit-cost",
      title: "Denver building permit cost",
      intro:
        "A Denver building permit comes from Table No. 1 of the City's building policy: $20.00 for a valuation up to $500, $35.00 up to $2,000, then $35.00 plus $8.00 for every additional $1,000, with the rate easing to $7.00, $5.60, $4.75 and $3.65 as the valuation rises. Plan review is the third column of that same table — 50% of the permit fee, and $0 below $2,000 — so a $250,000 project pays $1,610.00 in permit fees and $805.00 in review.",
      localSummary:
        "The table is a run of chained bands, and its arithmetic is checkable at every handover. Five of the six close exactly: at $2,000, $50,000, $100,000, $500,000 and $1,000,000 the band below produces precisely the amount the band above opens with — $35, $420, $770, $3,010 and $5,385. The sixth does not. The band covering $2,001 to $25,000 is written as $35.00 for the first $2,000 plus $8.00 for each additional $1,000, which comes to **$219.00** at its own top, while the band above opens at **$220.00**.\n\nOne dollar is the whole of the discrepancy, and the table's own phrase \"or fraction thereof\" is what makes it cost more than a dollar. A valuation of $25,001 falls in the band above, which charges $220.00 for the first $25,000 plus a further $8.00 for the one dollar — rounded up to a whole $1,000 — that pushed it over. So the step from $25,000 to $25,001 is **$9.00**, and it is the City's table that says both things.\n\n\"Or fraction thereof\" applies throughout, and one cent past any thousand buys a whole additional one. At $100,000 exactly the fifth band closes at $770.00; at $100,001 the sixth opens at $770.00 plus $5.60.\n\nPlan review is the part most people miss, because it is a column rather than a section. Section 200 puts it in one sentence: \"The plan review fee is a percentage of the building permit fee as shown in Table No. 1\", and it \"is separate from and in addition to the permit fee\". The column prints 50% beside every band from $2,000 up and 0 beside the two below it, so a small repair pays no review fee at all and a $250,000 project pays half again as much in review as in permit fees. Three modes replace the 50% rather than adding to it — express review at 20% of the permit fee with a $100 minimum, type-approved permits at 10%, and master plans at 50% of their own valuation, which the policy notes is the same arithmetic as the column.\n\nOne more thing this page does not charge: quick permits, which cover roof coverings, hot water heaters, light fixtures and similar replacements, take building permit fees from the same table and **no plan review at all** — \"a review is not performed and there are no plan review fees associated with quick permits\". The City's own square-foot prices for that work are in Table No. 2: $5.25 per square foot for a residential shingle roof, $7.25 for a commercial low-slope roof.",
      notIncluded:
        "This estimate is the Table No. 1 permit fee plus the plan review fee from the same table's third column. It excludes:\n\n- **Multi-phase surcharges**: the policy adds 25% to both fees for a two-phase permit and 50% for three or more phases. It does not say whether the review surcharge is taken before or after the permit surcharge, so neither is charged here.\n- **The Affordable Housing Linkage Fee**, set in Chapter 27 of the Denver Revised Municipal Code and adjusted annually, and the Fee-in-Lieu alternative that can replace it.\n- **Shoring and benching permits**, which are separate permits on commercial projects. On a single-family or duplex project, shoring and excavation are *inside* the valuation instead.\n- **Demolition permits**, which carry their own review fee at the express rate with a $100 minimum.\n- **Hourly review and inspection fees**: $125.00 per hour for additional plan review of incomplete, deferred or modified drawings, and $100.00 per hour for re-inspection or out-of-hours inspection with a two-hour prepaid minimum after hours.\n- **All other development charges** the City collects: linkage, zoning, wastewater, transportation and parks fees, and the Denver Fire review for projects that need one.\n- **Contractor licences** (Table No. 3), which are not permits.\n- **The affordable-housing reduction**, which can take up to 50% off the construction permit fee for qualifying projects — a figure quoted here is the un-reduced one.",
      workedExample: {
        scenario:
          "A commercial tenant finish with a declared construction valuation of $250,000, built in one phase, with plans submitted for a standard review rather than an express or type-approved one.",
        inputs: {
          valuationCents: 25_000_000,
        },
        notes:
          "Table No. 1's sixth band: $770.00 for the first $100,000, plus $5.60 for each of the 150 additional thousands, which is $1,610.00. Plan review is 50% of that permit fee, $805.00, and it is charged in addition to it rather than inside it. Two things would move these figures and neither is charged on this page: a two- or three-phase project adds 25% or 50% to both fees, and an express review replaces the 50% with 20% of the permit fee subject to a $100 minimum.",
      },
      faqs: [
        {
          question: "Is plan review included in the Denver permit fee?",
          answer:
            "No, and it is the largest line most projects miss. Table No. 1 prints plan review as a third column: 50% of the permit fee everywhere from $2,000 of valuation up, and 0 for the two bands below it. Section 200 says the review fee \"is separate from and in addition to the permit fee\", so a $250,000 project pays $1,610.00 plus $805.00.",
        },
        {
          question: "What is the valuation based on?",
          answer:
            "The higher of two numbers: the ICC's published construction cost data for the building type, or the value of the work you declare. Denver list what the value must include — labour, materials, profit, overhead, finish work, roofing, electrical, plumbing, heating, air conditioning, elevators and permanent equipment — and the Building Official's determination is not subject to appeal.",
        },
        {
          question: "Why does one dollar of valuation cost nine dollars?",
          answer:
            "Because two printed rows disagree and the table rounds up. The band ending at $25,000 comes to $219.00 at its own top, while the band above opens at $220.00 — a dollar apart, in the City's own table. It also says \"or fraction thereof\", so $25,001 falls in the band above and buys a whole additional $1,000 of increment at $8.00. The fee goes from $219.00 to $228.00.",
        },
        {
          question: "Do I need a separate permit for electrical and plumbing?",
          answer:
            "Yes. \"Once released, separate permits are required for each discipline\", and each discipline's fee is based on the valuation of its own work rather than on a share of the building fee. A $25,000 electrical scope costs the same in permit fees as a $25,000 building project, which is $219.00 on this table.",
        },
        {
          question: "What is an express review and when is it cheaper?",
          answer:
            "It is a faster review for eligible projects, charged at 20% of the permit fee with a $100 minimum instead of the standard 50%. On the $250,000 project above, that is $322.00 rather than $805.00 — and the policy applies the express rate to any construction review with a valuation over $2,000 and to all demolition projects.",
        },
        {
          question: "Does a water heater need plan review?",
          answer:
            "No. Water heaters, light fixtures, roof coverings and similar replacements are quick permits: they take building permit fees from Table No. 1 and no plan review, because \"a review is not performed and there are no plan review fees associated with quick permits\". Compliance is checked by field inspection instead.",
        },
      ],
      seoTitle: "Denver building permit cost and plan review fee",
      seoDescription:
        "Denver building permit fees from the City's own Table No. 1 — $35.00 plus $8.00 per additional $1,000 at $25,000 — with plan review at 50% of the permit fee and a computed worked example.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: DENVER_LAST_VERIFIED,
    },
    {
      jurisdictionKey: DENVER_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      slug: "electrical-permit-cost",
      title: "Denver electrical permit cost",
      intro:
        "A Denver electrical permit is a building permit for electrical work: the City requires a separate permit for each discipline once plans are released, and prices it \"based on the valuation of the work for that specific trade\". So an electrical permit reads the same Table No. 1 as a building, applied to the electrical contract value — $25,000 of electrical work is $219.00, exactly what $25,000 of building work costs.",
      localSummary:
        "The trade fee in Denver is not a surcharge on the building permit and not a flat inspection fee. The policy is explicit twice over: separate permits \"are required for each discipline\", and each one's fee \"is based on the valuation of the work for that specific trade permitted under that specific permit\". That single sentence decides everything on this page — the electrical value is the input, and the table does the rest.\n\nWhich makes the electrical page a demonstration of the same seam the building page has to explain. An electrical scope of exactly $25,000 lands in the band covering $2,001 to $25,000, which charges $35.00 for the first $2,000 plus $8.00 for each additional $1,000: twenty-three increments, $184.00, for **$219.00**. One dollar more puts the same scope in the band above, which charges $220.00 for the first $25,000 plus $8.00 for the dollar that pushed it over, rounded up to a whole $1,000 as the table's \"or fraction thereof\" requires — **$228.00**. The nine-dollar step is the table's arithmetic rather than this site's.\n\nTwo things this page does not charge, both deliberately. The first is plan review. Table No. 1's review column is written about the building permit, and the commercial plan review team is described as reviewing \"architectural, structural, mechanical, plumbing, and electrical\" disciplines together — that is the building's drawings, not a separate trade review. Whether a *stand-alone* electrical permit attracts its own review fee is not stated in the policy, so nothing is charged for it and the question is recorded rather than answered.\n\nThe second is anything per-device. Denver's policy prices electrical work by value, not by outlet, fixture or circuit, so this page asks for one number and returns one figure. A jurisdiction that prices the same work per device — Houston does, and Clark County charges $0.45 per low-voltage point — answers a different question, which is why those pages ask for different inputs.",
      notIncluded:
        "This estimate is Table No. 1's permit fee for the electrical value of the work. It excludes:\n\n- **Plan review.** The review column is the building permit's, at 50% of the permit fee above $2,000 of valuation; whether a stand-alone electrical permit attracts one is not stated in the policy, so none is charged here.\n- **The building permit fee**, if the electrical work is part of a construction project rather than a stand-alone electrical permit.\n- **The other disciplines' permits.** Mechanical, plumbing and sometimes fire suppression permits are separate permits with their own valuations on the same project.\n- **Multi-phase surcharges** of 25% or 50% on both the permit and the review fee, for projects permitted in two or more phases.\n- **Hourly fees**: additional plan review at $125.00 per hour, re-inspection and out-of-hours inspection at $100.00 per hour with a two-hour prepaid minimum after hours.\n- **Electric service connection and utility charges**, which are made by the utility rather than by Community Planning & Development and are not in this policy.\n- **The Affordable Housing Linkage Fee** and every other development charge the City collects on a project.\n- **Licensing**: an electrical contractor working in Denver must hold a City licence and the individual holding the permit a certificate, priced in Table No. 3 at $250.00 and $60.00 every three years.",
      workedExample: {
        scenario:
          "A stand-alone electrical permit for a service upgrade and distribution work with an electrical contract value of exactly $25,000. No building permit is being pulled with it.",
        inputs: {
          valuationCents: 2_500_000,
        },
        notes:
          "Table No. 1's band for $2,001 to $25,000: $35.00 for the first $2,000, plus $8.00 for each of the twenty-three additional thousands, which is $219.00. One dollar more would move this into the next band at $228.00, because the table rounds a partial thousand up to a whole one — the seam the building page explains at length.",
      },
      faqs: [
        {
          question: "How much is an electrical permit in Denver?",
          answer:
            "It depends on the electrical value of the work, not on the size of the building. The table runs from $20.00 for work valued up to $500 to $5,385.00 for the first $1,000,000 plus $3.65 per additional $1,000. A $25,000 electrical scope is $219.00, which is exactly what a $25,000 building project pays.",
        },
        {
          question: "Is the electrical fee a percentage of the building permit fee?",
          answer:
            "No. Denver requires a separate permit for each discipline and prices each one \"based on the valuation of the work for that specific trade permitted under that specific permit\". The fee is computed from the electrical value directly, so it never moves when an unrelated part of the building's valuation moves.",
        },
        {
          question: "Does an electrical permit include plan review?",
          answer:
            "Not on this page, and that is a stated reading rather than a certainty. Table No. 1's review column is written about the building permit, and the commercial review team reviews the building's drawings across all disciplines. The policy does not say whether a stand-alone electrical permit attracts its own review fee, so none is charged here.",
        },
        {
          question: "Is a permit needed to change a light fixture or a panel?",
          answer:
            "Light fixtures are named in the policy's quick-permit list, which covers small projects that replace existing systems and take building permit fees with no plan review. Compliance is checked by field inspection. A service upgrade or new distribution work is not quick-permit work and is priced from the value of the electrical scope.",
        },
        {
          question: "Does a licensed contractor have to pull the permit?",
          answer:
            "Permits \"must be obtained by contractors licensed with the City and County of Denver\". A homeowner may be issued permits for a single-family home, but not for an accessory dwelling unit. Contractor licences are $250.00 every three years and certificates for the individual in charge $40.00 to $60.00.",
        },
        {
          question: "What if the project is built in phases?",
          answer:
            "A two-phase construction permit adds 25% to both the permit and the plan review fee, and three or more phases adds 50%. Neither surcharge is included in any figure on this page, because the policy does not say whether the review surcharge is taken before or after the permit surcharge.",
        },
      ],
      seoTitle: "Denver electrical permit cost",
      seoDescription:
        "Denver electrical permit fees from the City's own valuation table: a separate permit per discipline, priced on the value of the electrical work — $25,000 of electrical work is $219.00, with no plan review charged.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: DENVER_LAST_VERIFIED,
    },
    {
      jurisdictionKey: DENVER_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      slug: "plumbing-permit-cost",
      title: "Denver plumbing permit cost",
      intro:
        "A Denver plumbing permit is priced the same way as an electrical one — a separate permit for the discipline, with its fee \"based on the valuation of the work for that specific trade\" — so a plumbing scope worth $8,000 pays $83.00 from Table No. 1. A water heater replacement is a quick permit: it takes the same table, and no plan review at all, because Denver does not review quick-permit work.",
      localSummary:
        "Two things decide a Denver plumbing permit, and the first is the value of the plumbing work rather than the value of the building. The policy requires a separate permit for each discipline and says each is priced from its own scope, so a $8,000 plumbing contract on a $2,000,000 building pays $83.00 — the table on the plumbing number, with the building's valuation playing no part in it.\n\nThe second is whether the job is on the City's quick-permit list, and that list is where the water heater lives. Quick permits \"are issued for small projects that replace existing systems, including but not limited to roof coverings, hot water heaters, light fixtures and similar project types\", and the policy is blunt about what they do not carry: \"A review is not performed and there are no plan review fees associated with quick permits. These projects only require building permit fees as set forth in Table No. 1.\" So a like-for-like water heater replacement pays the table's rate for its valuation and nothing else — and compliance is confirmed by the inspector in the field rather than by a reviewer at a desk.\n\nThat is a different answer from a city that publishes a flat water-heater fee, and the difference is worth knowing. Denver has no water-heater row: the fee comes from the declared or ICC valuation, which for a replacement is small, so the practical figure is the bottom of the table — $20.00 up to $500 of valuation and $35.00 up to $2,000. A city like Boulder City, which prints $50.00 per tank, is pricing the same job with a completely different mechanism.\n\nWhat this page does not charge is plan review, for the reason the electrical page gives: the review column of Table No. 1 is the building permit's review, and whether a stand-alone plumbing permit attracts its own is not stated in the policy. It is recorded as an open question rather than filled in.",
      notIncluded:
        "This estimate is Table No. 1's permit fee for the plumbing value of the work, which for a quick permit is the whole fee. It excludes:\n\n- **Plan review.** The table's review column is the building permit's, at 50% of the permit fee above $2,000; whether a stand-alone plumbing permit attracts one is not stated.\n- **The building permit fee**, if the plumbing work belongs to a construction project. On a commercial project the disciplines are separate permits with separate valuations.\n- **The other disciplines' permits** — mechanical, electrical and, where required, fire suppression — each with its own valuation on the same job.\n- **Water and sewer connection charges**, which are utility charges rather than permit fees and are not in this policy.\n- **Multi-phase surcharges** of 25% or 50% on the permit and review fees.\n- **Hourly fees**: additional plan review at $125.00 per hour, re-inspection and out-of-hours inspection at $100.00 per hour with a two-hour prepaid minimum after hours.\n- **The Affordable Housing Linkage Fee** and the City's other development charges.\n- **Backflow and cross-connection testing**, which is a certification process rather than a permit line in this policy.",
      workedExample: {
        scenario:
          "A stand-alone plumbing permit for a commercial restroom remodel with a plumbing contract value of $8,000. It is not quick-permit work — the fixtures are being replaced and relocated rather than swapped like for like — so it is priced from the value of the plumbing scope.",
        inputs: {
          valuationCents: 800_000,
        },
        notes:
          "Table No. 1's band for $2,001 to $25,000: $35.00 for the first $2,000, plus $8.00 for each of the six additional thousands, which is $83.00. A like-for-like water heater replacement instead sits at the bottom of the same table — $35.00 for a valuation between $501 and $2,000 — and is charged no review fee because it is a quick permit.",
      },
      faqs: [
        {
          question: "How much is a plumbing permit in Denver?",
          answer:
            "It is the value of the plumbing work run through Table No. 1 of the City's building policy: $20.00 up to $500 of valuation, $35.00 up to $2,000, then $35.00 plus $8.00 per additional $1,000 until $25,000. An $8,000 plumbing scope is $83.00.",
        },
        {
          question: "Is a permit required to replace a water heater?",
          answer:
            "Yes, as a quick permit. Quick permits cover small replacements — roof coverings, hot water heaters, light fixtures and similar — and \"only require building permit fees as set forth in Table No. 1\". No plan review is performed and no review fee is charged; compliance is determined by field inspection.",
        },
        {
          question: "Is the plumbing fee based on my contract price?",
          answer:
            "On the value of the plumbing work, and Denver takes the higher of your declared value or the ICC's published construction cost data for the work. The declared figure has to include labour, materials, profit, overhead and the permanent equipment being installed, not just the fixtures.",
        },
        {
          question: "Do I pay plan review on a plumbing permit?",
          answer:
            "Not here, and the page says why rather than hiding it. Table No. 1's review column is the building permit's — 50% of the permit fee above $2,000 of valuation — and the policy does not state whether a stand-alone plumbing permit attracts its own review fee. None is charged on this page.",
        },
        {
          question: "Are water and sewer connections part of the permit fee?",
          answer:
            "No. Connection charges are made by the utility rather than by Community Planning & Development and do not appear in the building policy at all. On a new building they are a separate line, and usually a much larger one than the permit.",
        },
        {
          question: "Does a plumber need a Denver licence to pull the permit?",
          answer:
            "Permits must be obtained by contractors licensed with the City and County of Denver, and the plumber in charge needs a certificate. Table No. 3 prices the contractor licence at $250.00 and certificates at $40.00 to $60.00, renewed every three years — two years for a plumbing licence.",
        },
      ],
      seoTitle: "Denver plumbing permit cost",
      seoDescription:
        "Denver plumbing permit fees from the City's own valuation table — $35.00 plus $8.00 per additional $1,000 — and why a water heater is a quick permit with no plan review fee at all.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: DENVER_LAST_VERIFIED,
    },
  ],

  verifications: [
    {
      entityType: "source",
      entityKey: DENVER_POLICY_SOURCE_KEY,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: DENVER_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: DENVER_POLICY_SOURCE_KEY,
      notes:
        "Read 2026-09-24 in three pdftotext modes. `-layout` interleaves Table No. 1's columns — valuation range, permit fee and review percentage arrive out of step with one another — `-table` pairs them correctly, and `-raw` was read to confirm the row order. The policy carries its own revision date, 21 May 2024, and states that it replaces the policy dated 1 February 2024.",
    },
    {
      entityType: "source",
      entityKey: DENVER_FEES_PAGE_SOURCE_KEY,
      status: "verified",
      method: "official_portal_check",
      verifiedAt: DENVER_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: DENVER_FEES_PAGE_SOURCE_KEY,
      notes:
        "Read 2026-09-24 as the route to the policy. No rate on this site is taken from it; the policy is the source of every figure.",
    },
    {
      entityType: "fee_rule",
      entityKey: "TABLE1-2001-25000",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: DENVER_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: DENVER_POLICY_SOURCE_KEY,
      notes:
        "Table No. 1: \"$35.00 for the first $2,000 plus $8.00 for each additional $1,000 or fraction thereof, to and including $25,000\". At $25,000 it produces $219.00. The band above opens at $220.00, so this is the table's one seam that does not close, and the difference is a dollar. Pinned in tests/content/denver-seed.test.ts, together with the $9.00 step from $25,000 to $25,001.",
    },
    {
      entityType: "fee_rule",
      entityKey: "PLAN-REVIEW-50",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: DENVER_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: DENVER_POLICY_SOURCE_KEY,
      notes:
        "Table No. 1's third column prints \"50%\" beside every band from $2,000 of valuation up and \"0\" beside the two below it. Section 200: \"The plan review fee is a percentage of the building permit fee as shown in Table No. 1\" and \"is separate from and in addition to the permit fee\". Modelled on the `permit_fee` basis, so the review fee is computed from the permit fee this run produced.",
    },
    {
      entityType: "fee_rule",
      entityKey: "PLAN-REVIEW-EXPRESS-20",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: DENVER_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: DENVER_POLICY_SOURCE_KEY,
      notes:
        "Section 200: express reviews for construction \"with a valuation over $2,000\" and all demolition projects \"are charged at a rate of 20% of the permit fee with a minimum charge of $100\". Modelled as an alternative to the 50% column rather than an addition to it, by a condition on `custom.review_type`.",
    },
    {
      entityType: "fee_rule",
      entityKey: "PLAN-REVIEW-TA-10",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: DENVER_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: DENVER_POLICY_SOURCE_KEY,
      notes:
        "Section 200: \"Plan review fees for non-master, type approved (\"TA\") permits shall be charged at a rate of 10% of the Permit Fee. The permit fee for TAs shall be based on 100% of the valuation for each unit.\" Modelled as a third mutually exclusive review mode.",
    },
    {
      entityType: "fee_rule",
      entityKey: "TABLE1-1000001-UP",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: DENVER_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: DENVER_POLICY_SOURCE_KEY,
      notes:
        "Table No. 1, final row: \"$5,385.00 for the first $1,000,000 plus $3.65 for each additional $1,000 or fraction thereof.\" The four bands above it were checked against their own arithmetic at each handover: $420, $770, $3,010 and $5,385 are each exactly what the band below produces at its top.",
    },
    {
      entityType: "permit_page",
      entityKey: "building-permit-cost",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: DENVER_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: DENVER_POLICY_SOURCE_KEY,
      notes:
        "All eight bands, the three review modes and the $2,000 review threshold, with the $219.00/$220.00 seam and its $9.00 step stated on the page. The worked example is arithmetic on the table: $250,000 gives $1,610.00 of permit fee and $805.00 of review. Quick permits and the multi-phase surcharges are named in the exclusions.",
    },
    {
      entityType: "permit_page",
      entityKey: "electrical-permit-cost",
      permitTypeKey: "electrical",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: DENVER_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: DENVER_POLICY_SOURCE_KEY,
      notes:
        "Table No. 1 applied to the electrical value, on the policy's own sentence that a trade permit's fee \"is based on the valuation of the work for that specific trade permitted under that specific permit\". No plan review is charged on a stand-alone trade permit, and that reading is stated on the page and recorded as an open question rather than as a finding.",
    },
    {
      entityType: "permit_page",
      entityKey: "plumbing-permit-cost",
      permitTypeKey: "plumbing",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: DENVER_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: DENVER_POLICY_SOURCE_KEY,
      notes:
        "The same table on the plumbing value, with the quick-permit rule quoted in full: \"A review is not performed and there are no plan review fees associated with quick permits. These projects only require building permit fees as set forth in Table No. 1.\" No water-heater row is invented; Denver prices that job from valuation.",
    },
    {
      entityType: "jurisdiction_profile",
      entityKey: DENVER_KEYS.jurisdiction,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: DENVER_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: DENVER_POLICY_SOURCE_KEY,
      notes:
        "Hub content built from the policy. Denver is a consolidated city and county, so the county row records the same government rather than a second authority, and the page says so. No telephone number or address is recorded: the policy prints a Chief Building Official and a policy number and no contact details, and a wrong number is the one error a reader cannot detect. Multi-phase surcharges, the linkage fee, the affordable-housing reduction, hourly fees and licences are each named.",
    },
  ],
};

/** Permit pages that clear the editorial gate, for use in tests without a database. */
export const DENVER_PUBLISHED_PERMIT_PAGES = denverSeed.permitPages.filter(
  (page) => page.publishStatus === "published" && !page.noindex,
);
