import type { JurisdictionSeed } from "@/content/seed-types";

import {
  RLY_BUILDING_RULES,
  RLY_ELECTRICAL_RULES,
  RLY_FEE_EFFECTIVE_FROM,
  RLY_FEE_SOURCE_KEY,
  RLY_PLUMBING_RULES,
} from "./fee-rules";

/**
 * City of Raleigh, North Carolina — **the city whose trade permits are a percentage of
 * its building permit fee.**
 *
 * Every other jurisdiction here prices a trade permit from its own basis: an item count,
 * a unit of work, a flat named scope, a valuation table. Raleigh prices it from a number
 * the same schedule computes somewhere else — "New Residential Electrical Permit — 49%
 * % Of Calculated Building Permit", "New Commercial Plumbing Permit — 56%" — and floors
 * it with a per-trade minimum of $124.00. On top sits a **4% technology surcharge**
 * which the City documents by reprinting every fee twice, once bare and once with the
 * surcharge, so the reader can check the arithmetic on the City's own page.
 *
 * One document is the whole schedule: the *Development Fee Guide* for **July 1, 2026 –
 * June 30, 2027**, a fiscal-year publication whose own cover states the period it is
 * in force.
 *
 * Research record: research/north-carolina/raleigh.md.
 */

export const RLY_LAST_VERIFIED = "2026-09-25";

export const RLY_KEYS = {
  state: "nc",
  county: "wake-county",
  jurisdiction: "raleigh",
  guide: RLY_FEE_SOURCE_KEY,
} as const;

const RESEARCHER = "Permit Fee Intelligence research pass 14 (North Carolina)";

const state = {
  code: "NC",
  slug: "north-carolina",
  name: "North Carolina",
  fipsCode: "37",
};

const county = {
  key: RLY_KEYS.county,
  slug: "wake-county",
  name: "Wake County",
  fipsCode: "37183",
};

export const raleighSeed: JurisdictionSeed = {
  state,
  county,

  jurisdiction: {
    key: RLY_KEYS.jurisdiction,
    stateKey: RLY_KEYS.state,
    countyKey: RLY_KEYS.county,
    type: "city",
    slug: "raleigh",
    name: "Raleigh",
    officialName: "City of Raleigh Planning and Development Department",
    websiteUrl: "https://raleighnc.gov/permits",
    permitPortalUrl: "https://permittinginspections.cityofraleigh.org/",
    timezone: "America/New_York",
    isActive: true,
  },

  departments: [
    {
      key: "raleigh-planning-and-development",
      jurisdictionKey: RLY_KEYS.jurisdiction,
      kind: "building",
      name: "Planning and Development Department",
      phone: "919-996-2682",
      email: "planning@raleighnc.gov",
      url: "https://raleighnc.gov/permits",
      addressLine: null,
      hours: null,
      notes:
        "The department responsible for \"conducting comprehensive project reviews and inspections for all private developments within Raleigh\" and for the Development Fee Guide itself. The email and telephone number are the ones printed on the guide's Planning and Development page. The guide is published by this department alone rather than by a shared county office, which is why the pages describe it as the City's schedule and not the county's.",
    },
  ],

  sources: [
    {
      key: RLY_FEE_SOURCE_KEY,
      jurisdictionKey: RLY_KEYS.jurisdiction,
      title:
        "City of Raleigh Development Fee Guide \u2014 Comprehensive Guide for Raleigh Development Fees, July 1, 2026 \u2013 June 30, 2027",
      url: "https://cityofraleigh0drupal.blob.core.usgovcloudapi.net/drupal-prod/COR15/DevelopmentFeeGuide.pdf",
      sourceType: "fee_schedule_pdf",
      issuingAuthority: "City of Raleigh",
      authorityKind: "city",
      isPrimary: true,
      documentDate: "2026-07-01",
      effectiveFrom: RLY_FEE_EFFECTIVE_FROM,
      retrievedAt: RLY_LAST_VERIFIED,
      lastVerifiedAt: RLY_LAST_VERIFIED,
      notes:
        'Read 2026-09-25. 993,935 bytes, sha256 beginning b10565b399afaede, linked from raleighnc.gov/permits/services/development-fee-guide-and-calculator. **The cover page states the period: "Development Fee Guide — July 1, 2026 - June 30, 2027"**, which is why this schedule has an effective date from its own cover rather than from an inference about when a previous version ended. Every fee row prints two cost columns, **Prior Year Cost and FY27 Cost**, and both were read: taking the left-hand column would publish last year\'s schedule throughout, and the differences are not small — the new residential electrical permit went from 54% to 49% and the commercial plan review from an unread prior rate to 65%. The Technology Fee Reference Guide near the end of the document is what carries the 4% surcharge, and it was read there rather than inferred from the difference between the guide\'s two columns.',
    },
  ],

  /** Empty on purpose: the permit types this jurisdiction uses already exist. */
  permitTypes: [],
  projectTypes: [],

  jurisdictionPermitTypes: [
    {
      jurisdictionKey: RLY_KEYS.jurisdiction,
      permitTypeKey: "building",
      isAvailable: true,
      localName: "Building permit",
      officialUrl: null,
      notes:
        "Priced from **calculated construction value**: 0.38% for new residential construction, and for new commercial work a three-band schedule — 0.21% on the first $500,000, then a $1,050.00 base plus 0.06% to $10,000,000, then a $7,250.00 base plus 0.01% above it. Plan review is a share of that same figure, 57% residential and 65% commercial, and a 4% technology surcharge is applied to the fees. The City derives the value itself from the ICC Building Valuation Data, reduced by 12.4% for a regional adjustment.",
    },
    {
      jurisdictionKey: RLY_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      isAvailable: true,
      localName: "Electrical permit",
      officialUrl: null,
      notes:
        "Priced as **a share of the calculated building permit fee** — 49% for new residential construction and 100% for new commercial — floored at the guide's $124.00 Minimum Trade Permit Fee. Stand-alone electrical permits are flat: a commercial generator $396, parking lot lighting $320, a UPS system $340, and co-locating a cell on a building $300. The 28%, 50% and 75% alteration shares are named here rather than modelled, for the reason the page gives.",
    },
    {
      jurisdictionKey: RLY_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      isAvailable: true,
      localName: "Plumbing permit",
      officialUrl: null,
      notes:
        "Priced as **a share of the calculated building permit fee** — 34% for new residential construction and 56% for new commercial — floored at the same $124.00 per-trade minimum. Stand-alone plumbing permits are flat and count the work: fixture replacement at 26–50 fixtures $236, 51–100 $297, over 100 $325, and a plumbing utility inspection $133.",
    },
  ],

  feeSchedules: [
    {
      key: RLY_FEE_SOURCE_KEY,
      jurisdictionKey: RLY_KEYS.jurisdiction,
      sourceKey: RLY_FEE_SOURCE_KEY,
      title: "City of Raleigh Development Fee Guide, FY27 (July 1, 2026 – June 30, 2027)",
      officialUrl:
        "https://cityofraleigh0drupal.blob.core.usgovcloudapi.net/drupal-prod/COR15/DevelopmentFeeGuide.pdf",
      effectiveFrom: RLY_FEE_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: RLY_LAST_VERIFIED,
      notes:
        "One document, four departments and a dozen sections. The pages here read the Planning and Development department's Building and Safety section, plus the Technology Fee Reference Guide; Fire, Parks, Raleigh Water, Stormwater and Transportation fees are in the same PDF under other departments' names and are not modelled. The schedule is reviewed annually and the guide states the City caps any individual fee's annual change at 10%, which is why the Prior Year and FY27 columns differ but do not jump.",
    },
  ],

  feeRules: [
    ...RLY_BUILDING_RULES.map((rule) => ({
      jurisdictionKey: RLY_KEYS.jurisdiction,
      permitTypeKey: "building",
      scheduleKey: RLY_FEE_SOURCE_KEY,
      rule,
    })),
    ...RLY_ELECTRICAL_RULES.map((rule) => ({
      jurisdictionKey: RLY_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      scheduleKey: RLY_FEE_SOURCE_KEY,
      rule,
    })),
    ...RLY_PLUMBING_RULES.map((rule) => ({
      jurisdictionKey: RLY_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      scheduleKey: RLY_FEE_SOURCE_KEY,
      rule,
    })),
  ],

  requirements: [
    {
      jurisdictionKey: RLY_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "other",
      title: "The permit is priced from the City's own calculated construction value",
      description:
        'The guide states the valuation is Raleigh\'s, not the applicant\'s: "Permit fees are based off a valuation calculation for construction projects. This calculation uses nationally … Building Valuation Data (BVD) … The City of Raleigh further adjusts the calculated values by using a regional cost adjustment … Currently, our valuation calculation reduces the national average by 12.4%." Every building, electrical and plumbing figure on these pages is a percentage of that number, so it is the single input that decides the bill.',
      isMandatory: true,
      sortOrder: 10,
      sourceKey: RLY_FEE_SOURCE_KEY,
      lastVerifiedAt: RLY_LAST_VERIFIED,
    },
    {
      jurisdictionKey: RLY_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "other",
      title: "Plan review is a share of the building permit fee, and it is charged with it",
      description:
        'The guide prints "New Residential Plans Review Fee — 57.00%" and "New Commercial Plans Review Fee — 65.00%", both "% Of Calculated Building Permit". So plan review is not a second rate on the value: it is a share of the permit fee the same schedule has already computed, which is why a $400,000 residential project pays $1,520.00 of permit and $866.40 of plan review on the same basis.',
      isMandatory: true,
      sortOrder: 20,
      sourceKey: RLY_FEE_SOURCE_KEY,
      lastVerifiedAt: RLY_LAST_VERIFIED,
    },
    {
      jurisdictionKey: RLY_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      requirementType: "other",
      title: "The electrical permit is a percentage of the building permit fee, not a rate of its own",
      description:
        'Development Fee Guide FY27: "New Residential Electrical Permit — 49.00% % Of Calculated Building Permit" and "New Commercial Electrical Permit — 100% % Of Calculated Building Permit". There is no per-circuit, per-outlet or per-ampere row anywhere in the Building and Safety section; the trade does not have its own rate schedule, it has a share of the building permit\'s.',
      isMandatory: true,
      sortOrder: 10,
      sourceKey: RLY_FEE_SOURCE_KEY,
      lastVerifiedAt: RLY_LAST_VERIFIED,
    },
    {
      jurisdictionKey: RLY_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      requirementType: "other",
      title: "A $124.00 minimum applies to every trade permit",
      description:
        '"Minimum Trade Permit Fee — Any fee not specifically listed as an individual fee will be charged at the minimum permit fee. This also applies to a minimum building plan review fee. Which are assessed as per trade per review. $124.00." So a small project whose 49% share comes to less than $124 pays $124, and the floor is per trade rather than per project: an electrical and a plumbing permit on one job are two floors.',
      isMandatory: true,
      sortOrder: 20,
      sourceKey: RLY_FEE_SOURCE_KEY,
      lastVerifiedAt: RLY_LAST_VERIFIED,
    },
    {
      jurisdictionKey: RLY_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      requirementType: "other",
      title: "The plumbing permit is a percentage of the building permit fee",
      description:
        'Development Fee Guide FY27: "New Residential Plumbing Permit — 34.00% % Of Calculated Building Permit" and "New Commercial Plumbing Permit — 56.00%". The same $124.00 per-trade minimum applies, and the same 4% technology surcharge is applied to the result.',
      isMandatory: true,
      sortOrder: 10,
      sourceKey: RLY_FEE_SOURCE_KEY,
      lastVerifiedAt: RLY_LAST_VERIFIED,
    },
  ],

  profile: {
    jurisdictionKey: RLY_KEYS.jurisdiction,
    headline: "Permit fees for the City of Raleigh, from the City's own FY27 fee guide",
    summary:
      "Raleigh prices a building permit from **calculated construction value** — 0.38% for new residential work, and a three-band schedule for commercial — and then prices the **trades as a share of that permit fee**: electrical at 49% residential and 100% commercial, plumbing at 34% and 56%, each floored at a **$124.00 per-trade minimum**. Plan review is a further share of the same permit fee, and a **4% technology surcharge** is applied to the fees.",
    localContext:
      "The whole schedule is **one document**: the City's Development Fee Guide, whose cover states the fiscal year it runs — **July 1, 2026 to June 30, 2027** — rather than asking a reader to infer the date from when a previous version stopped. That matters more than it sounds, because every fee row in the guide prints **two** cost columns, Prior Year Cost and FY27 Cost, and several of the rates this site prices moved between them: the new residential electrical permit fell from 54% to 49%, and the Tier 1 commercial rate rose from 0.20% to 0.21%. Reading the wrong column would produce a complete, internally consistent, last-year schedule.\n\nRaleigh is the third way this site has seen a trade permit priced, and the strangest of the three. Houston and Dallas price by item, San Diego by unit of work, Sacramento by a flat named scope — and Raleigh prices a trade permit as **a percentage of the building permit fee**, a number the same document computes somewhere else. \"49% of the calculated building permit\" is printed as the electrical permit for a new house. The consequence a reader feels is that the electrical permit is not independently sized: a project with a larger building permit has a larger electrical permit, in a fixed ratio, whatever the wiring actually involves.\n\nThree things surround that relationship. The **valuation is the City's own** — Raleigh applies the ICC Building Valuation Data and then \"reduces the national average by 12.4%\" for a regional cost adjustment, so the figure the percentages are taken against is Raleigh's, not a declaration. Plan review is **another share of the same permit fee**, 57% residential and 65% commercial, not a second rate on the value. And a **4% technology surcharge** sits on top of everything, which the City documents in an unusual and helpful way: its Technology Fee Reference Guide reprints every fee twice, once bare and once as \"Fee Total = Fee + Surcharge\", so a reader can check the arithmetic on the City's own page — $150.00 becomes $156.00, $124.00 becomes $129.00.",
    valuationBasis:
      "**Every figure on these pages is a percentage of one number: the calculated construction value.** The building permit is 0.38% of it for residential work and one of three bands for commercial; the electrical and plumbing permits are percentages of the building permit fee, which is itself a percentage of it; plan review is a percentage of the building permit fee; and the technology surcharge is 4% of the fees. Nothing on these pages is priced per fixture, per outlet or per item of equipment except the four flat stand-alone permits, which are flat precisely because they are not part of this chain. A valuation difference therefore moves the whole bill at once, and the City supplies the valuation itself.",
    notIncluded:
      "These pages price the Building and Safety section's building, electrical and plumbing rows and the 4% technology surcharge. They exclude:\n\n- **The alteration levels.** The guide prices alterations at 28%, 50% and 75% of the calculated building permit by Level 1, 2 and 3 — but it never prints a building permit fee for an alteration, so there is no figure for that share to apply to. The pages name the three levels and say why they are not computed.\n- **The mechanical permit**, which the guide prices at 28% residential and 76% commercial of the calculated building permit; no page of this site prices a mechanical permit in any jurisdiction.\n- **The special projects fee** of 0.25% of calculated construction value per trade, and the **conditional service fees** — $215 per trade per unit commercial and $157 residential — which charge for a service rather than for a permit.\n- **The other five departments' fees in the same document**: the Fire Department's own permits and inspections, Raleigh Parks' tree and fee-in-lieu charges, Raleigh Water's meter installation, tap and capital facility fees, Stormwater, and the Transportation Department's thoroughfare and right-of-way fees.\n- **Express and hourly services**: Express Plan Review at $1,146 per hour, alternative means of compliance at $173 per hour after the first ten, after-hours inspections, re-inspections at $122, and the pre-construction meeting at $419.\n- **Enumerated permits this site does not price**: demolition $150, manufactured homes $415, building relocation $472, temporary and partial certificates of occupancy, the stocking permit and the Pony Express expedited review.\n- **The Building Valuation Data appendix itself.** The City applies it and adjusts it by 12.4%; this site takes the value it is given, as it does everywhere else, and says so rather than reproducing the tables.",
    seoTitle: "Raleigh Permit Fees (Building, Electrical, Plumbing)",
    seoDescription:
      "What a City of Raleigh building, electrical or plumbing permit costs: 0.38% of the calculated construction value, trade permits as a share of the building permit fee, a $124 per-trade minimum and a 4% technology surcharge.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: RLY_LAST_VERIFIED,
  },

  permitPages: [
    {
      jurisdictionKey: RLY_KEYS.jurisdiction,
      permitTypeKey: "building",
      slug: "building-permit-cost",
      title: "Raleigh building permit cost",
      intro:
        "A City of Raleigh building permit is a **percentage of the calculated construction value**: 0.38% for new residential construction, and for new commercial work a three-band schedule of 0.21% up to $500,000, then a $1,050.00 base plus 0.06% to $10,000,000, then a $7,250.00 base plus 0.01% above it. Plan review is a further share of that same permit fee — 57% residential, 65% commercial — and a 4% technology surcharge is applied to the fees.",
      localSummary:
        "The rate is small and the reason the bill is not is that **five separate percentages of the same figure** stack on one another. On a $400,000 new house the permit is 0.38%, which is $1,520.00; plan review is 57% of *that*, $866.40; and the technology surcharge is 4% of the fees, $95.46 — a total of $2,481.86. None of the three is a rate on the value twice: the first is on the value, the second is on the permit fee, the third is on the fees, and the guide says which is which by naming the unit in every row as \"% Of Calculated Construction Value\" or \"% Of Calculated Building Permit\".\n\nThe commercial schedule is a three-band table with **base fees**, and the bands are alternatives rather than a ladder. Tier 1 charges 0.21% with no base; Tier 2 charges $1,050.00 plus 0.06%; Tier 3 charges $7,250.00 plus 0.01%. They do not meet: at $500,000 the first band yields $1,050.00 and the second, opened at $500,001, yields $1,350.00 — a $300 step — and at $10,000,001 the third band opens at $8,250.00 against the $7,050.00 the second band yields at the top of its range, a $1,200 step in the same direction. The second and third formulas are only equal at $12,400,000, so above that figure Tier 2 would have charged more than Tier 3 does: the bands are alternatives, not a ladder. This site charges each band exactly as printed over its own range rather than interpolating between them, because the guide prints a base fee and a rate per band and nothing that would say the bands are meant to join.\n\nTwo limits belong with the number. The **valuation is the City's**, derived from the ICC Building Valuation Data and then \"reduces[d] the national average by 12.4%\", so a reader's own estimate and Raleigh's figure may differ and the fee follows Raleigh's. And the **plan review share applies to new construction**: the guide prints 57% and 65% for new work and, for alterations, a 55% share of a building permit fee it never prints — so alterations are named here rather than computed.",
      notIncluded:
        "This estimate is the building permit fee, the plan review share and the 4% technology surcharge for new construction. It excludes:\n\n- **The electrical, plumbing and mechanical permits** on the same project, which are separate figures; this site prices two of the three trades.\n- **The alteration levels' plan review and permit shares** — 55% plan review and 28%, 50% or 75% by alteration level — which the guide prices against a building permit fee it does not print for an alteration.\n- **The special projects fee** of 0.25% of calculated construction value per trade, and the **conditional service fees** of $215 per trade per unit commercial and $157 residential.\n- **Fire, Parks, Raleigh Water, Stormwater and Transportation fees**, all in the same guide under other departments: water and sewer tap and meter fees, capital facility fees, thoroughfare and right-of-way charges, tree fees in lieu, and the fire marshal's permits.\n- **Express plan review** at $1,146 per hour and the other expedited services, re-inspections at $122, after-hours inspections, and the pre-construction meeting fee of $419.\n- **Enumerated permits**: demolition $150, manufactured homes $415, building relocation $472, temporary and partial certificates of occupancy, and the stocking permit.",
      workedExample: {
        scenario:
          "A new single-family house in the City of Raleigh with a calculated construction value of $400,000 — the City's own figure, not the applicant's declaration.",
        inputs: {
          valuationCents: 40_000_000,
          occupancy: "residential",
          workType: "new_construction",
        },
        notes:
          "Three figures, one base. The building permit is 0.38% of $400,000, which is $1,520.00. Plan review is 57% of that permit fee — not of the value — which is $866.40. The technology surcharge is 4% of the fees charged, $95.46, and the total is $2,481.86. The guide's own Technology Fee Reference Guide is where a reader can check the last step: it reprints each fee as \"Fee\" and \"Fee Total = Fee + Surcharge\".\n\nTwo variations show the commercial schedule. **At $300,000 commercial** the project is in Tier 1: 0.21% is $630.00, plan review at 65% is $409.50, and the surcharge $41.58, for $1,081.08. **At $2,000,000 commercial** it is in Tier 2: $1,050.00 plus 0.06% of the value is $2,250.00, plan review 65% is $1,462.50, surcharge $148.50, total $3,861.00. The bands do not meet at their boundary — that is the City's structure, and this site charges each band over its own range rather than smoothing the step.\n\nOne caution belongs with the number. The valuation is Raleigh's own, derived from the national Building Valuation Data and reduced by 12.4%, so a figure from a builder's estimate may not be the figure the City prices from.",
      },
      faqs: [
        {
          question: "Is the fee a percentage of construction value?",
          answer:
            "Yes, and only 0.38% of it for new residential construction. The guide prints it as \"% Of Calculated Construction Value\", and the commercial schedule is the same idea in three bands — 0.21% on the first $500,000, then $1,050.00 plus 0.06%, then $7,250.00 plus 0.01%. What makes the total larger than the rate suggests is that plan review and the technology surcharge are percentages *of the permit fee and of the fees*, not of the value a second time.",
          sourceId: RLY_FEE_SOURCE_KEY,
          attribution: "Development Fee Guide FY27, Building and Safety",
        },
        {
          question: "Who sets the construction value?",
          answer:
            'Raleigh does. The guide says so plainly: "Permit fees are based off a valuation calculation for construction projects … The City of Raleigh further adjusts the calculated values by using a regional cost adjustment … Currently, our valuation calculation reduces the national average by 12.4%." The guide carries the ICC Building Valuation Data tables as its appendix, which is the document a reader would check the figure against.',
          sourceId: RLY_FEE_SOURCE_KEY,
          attribution: "Development Fee Guide FY27, Appendix",
        },
        {
          question: "How much is plan review?",
          answer:
            '57% of the calculated building permit fee for new residential construction and 65% for new commercial work — a share of the permit fee, not a second rate on the value. On a $400,000 new house that is 57% of $1,520.00, or $866.40.',
          sourceId: RLY_FEE_SOURCE_KEY,
          attribution: "Development Fee Guide FY27, Building and Safety",
        },
        {
          question: "What is the 4% technology surcharge?",
          answer:
            'The guide states it in one sentence: "A 4% technology surcharge is applied to the following development fees to support the technology resources that allow for permitting in the City of Raleigh." It then reprints every fee as "Fee" and "Fee Total = Fee + Surcharge" — $150.00 becomes $156.00 and $124.00 becomes $129.00 — so the surcharge is 4% of each fee, and on this site it is charged last against everything calculated before it.',
          sourceId: RLY_FEE_SOURCE_KEY,
          attribution: "Development Fee Guide FY27, Technology Fee Reference Guide",
        },
        {
          question: "Why do the commercial bands not meet at their boundaries?",
          answer:
            "Because each band carries its own base fee and its own rate, and the guide prints them as alternatives rather than as a ladder. At $500,000 the Tier 1 rate alone yields $1,050.00; Tier 2 opened at $500,001 yields $1,050.00 plus 0.06% of the value, about $1,350.00. This site charges each band exactly as printed over the range the guide states for it, and does not interpolate — the step is the City's.",
          sourceId: RLY_FEE_SOURCE_KEY,
          attribution: "Development Fee Guide FY27, Tier 1, Tier 2 and Tier 3 rows",
        },
        {
          question: "Are alterations priced the same way?",
          answer:
            'Not on these pages. The guide prices alterations at 28%, 50% and 75% of the calculated building permit for Level 1, 2 and 3 — but it never prints a building permit fee for an alteration, only for new construction, so there is no figure for those shares to apply to. The pages say so rather than inventing the base.',
          sourceId: RLY_FEE_SOURCE_KEY,
          attribution: "Development Fee Guide FY27, Permit Fees for Alterations and Repairs",
        },
      ],
      seoTitle: "Raleigh Building Permit Cost (0.38% of value, plus plan review)",
      seoDescription:
        "A City of Raleigh building permit is 0.38% of the calculated construction value for a new house and a three-band schedule for commercial work, with plan review at 57% or 65% of the permit fee and a 4% technology surcharge.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: RLY_LAST_VERIFIED,
    },

    {
      jurisdictionKey: RLY_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      slug: "electrical-permit-cost",
      title: "Raleigh electrical permit cost",
      intro:
        "A City of Raleigh electrical permit is **a percentage of the calculated building permit fee** rather than a rate of its own: 49% for new residential construction and 100% for new commercial work, each floored at the City's **$124.00 Minimum Trade Permit Fee**. There is no per-circuit, per-outlet or per-ampere row anywhere in the schedule. A 4% technology surcharge is applied to the result.",
      localSummary:
        "The share is the whole mechanism, and it has a consequence worth seeing before quoting anyone: **the electrical permit does not scale with the wiring, it scales with the building.** On a $400,000 new house the building permit is 0.38% of the value, $1,520.00, and the electrical permit is 49% of that — $744.80 — plus 4% technology surcharge, $29.79, for $774.59. Rewire the house completely and the figure is the same, because the City prices the share of a permit rather than the work in it.\n\nThe **$124.00 floor** is what stops that from becoming trivially small, and it is where the schedule bites. A project whose calculated value is $10,000 produces a building permit of $38.00 and a 49% share of $18.62 — well under the floor — so the electrical permit is $124.00, and with the surcharge $128.96. The guide is explicit that the floor is **per trade per review**: \"Any fee not specifically listed as an individual fee will be charged at the minimum permit fee … assessed as per trade per review\", so an electrical and a plumbing permit on one job are two floors, not one between them.\n\nFour **stand-alone permits** are the exception to the percentage, because each prices a named piece of equipment rather than a share of a building: a commercial electric generator $396, parking lot lighting $320, a UPS system $340, and co-locating a cell on a building $300. They are alternatives to the percentage rather than additions to it, and the schedule keeps them separate for that reason.",
      notIncluded:
        "This estimate is the electrical permit as a percentage of the calculated building permit fee, its $124.00 floor, the four stand-alone electrical permits and the 4% technology surcharge. It excludes:\n\n- **The building permit itself**, which is priced on the building page and is what this figure is a share of; it is not part of the electrical permit total.\n- **The alteration shares** of 28%, 50% and 75% of the calculated building permit, which the guide prices for Level 1, 2 and 3 alterations against a building permit fee it never prints for an alteration.\n- **The mechanical permit**, which the guide prices at 28% residential and 76% commercial of the calculated building permit; no page of this site prices mechanical work.\n- **Electrical work priced elsewhere in the guide** — the commercial service repair permit at $198, the co-locate site permit at $169, and the fire marshal's own permits, which are a different department's fees in the same document.\n- **Conditional service fees** of $215 per trade per unit commercial and $157 residential, the **special projects fee** of 0.25% of construction value per trade, and re-inspections at $122 each.\n- **Water, sewer, stormwater and transportation fees**, which are four other departments' schedules inside the same guide.",
      workedExample: {
        scenario:
          "A new single-family house in the City of Raleigh with a calculated construction value of $400,000, permitted for its electrical work.",
        inputs: {
          valuationCents: 40_000_000,
          occupancy: "residential",
          workType: "new_construction",
        },
        notes:
          "The guide prints the electrical permit as 49% of the calculated building permit fee. The building permit for this project is 0.38% of $400,000, which is $1,520.00, so 49% of it is $744.80 — the rule charges the two published rates composed, 49% of 0.38%, which is 0.1862% of the value, and arrives at the same figure without needing the building permit to be charged on this page. The 4% technology surcharge is $29.79, and the electrical permit is $774.59.\n\nTwo variations show the edges. **A $10,000 project** has a building permit of $38.00, whose 49% is $18.62 — far below the floor — so the permit is the **$124.00 Minimum Trade Permit Fee**, and $128.96 with the surcharge. That floor is per trade, so the plumbing permit on the same job carries its own $124.00. **A commercial generator** is not a share at all: the guide's Stand Alone Trade Permits price it flat at $396.00, which is $411.84 with the surcharge.\n\nOne caution belongs with the number. The valuation the percentage is taken against is Raleigh's own figure, derived from the ICC Building Valuation Data and reduced by 12.4%, so a builder's estimate may not be the number the City prices from.",
      },
      faqs: [
        {
          question: "How much is an electrical permit in Raleigh?",
          answer:
            'It depends on the building permit, because that is what it is a share of. For new residential construction the guide prints "49.00% % Of Calculated Building Permit"; for new commercial work, 100%. On a $400,000 new house, 49% of the $1,520.00 building permit is $744.80, and $774.59 after the 4% technology surcharge. Every permit is floored at $124.00.',
          sourceId: RLY_FEE_SOURCE_KEY,
          attribution: "Development Fee Guide FY27, New Residential Electrical Permit",
        },
        {
          question: "Is there a fee per outlet, per circuit or per ampere?",
          answer:
            "No. The Building and Safety section contains no such row. Raleigh prices the electrical permit as a share of the building permit fee for new construction, and prices four named pieces of equipment flat — a commercial generator $396, parking lot lighting $320, a UPS system $340, co-locating a cell on a building $300. Nothing is priced by a count of devices.",
          sourceId: RLY_FEE_SOURCE_KEY,
          attribution: "Development Fee Guide FY27, Building and Safety and Stand Alone Trade Permits",
        },
        {
          question: "What is the $124 minimum and when does it apply?",
          answer:
            'The guide\'s "Minimum Trade Permit Fee": "Any fee not specifically listed as an individual fee will be charged at the minimum permit fee. This also applies to a minimum building plan review fee. Which are assessed as per trade per review. $124.00." It bites on small projects — a $10,000 new residential project would otherwise pay $18.62 — and it is assessed per trade, so electrical and plumbing on one job are two separate floors.',
          sourceId: RLY_FEE_SOURCE_KEY,
          attribution: "Development Fee Guide FY27, Minimum Trade Permit Fee",
        },
        {
          question: "Does rewiring a house cost more than a service change?",
          answer:
            'Not under this schedule, for new construction. Both are the same 49% share of the calculated building permit fee, and the guide prints no per-item electrical rate to distinguish them. The four stand-alone permits are the only electrical figures that price a specific thing, and each is a named piece of equipment rather than an amount of wiring.',
          sourceId: RLY_FEE_SOURCE_KEY,
          attribution: "Development Fee Guide FY27, New Residential Electrical Permit",
        },
        {
          question: "Is plan review included in the electrical permit?",
          answer:
            "No. Plan review is priced on the building permit as 57% residential or 65% commercial of the calculated building permit fee, and is a charge of its own. The guide also prints a minimum building plan review fee alongside the $124 trade floor, which is why the two are separate rows on the building page rather than part of this one.",
          sourceId: RLY_FEE_SOURCE_KEY,
          attribution: "Development Fee Guide FY27, Plan Review Fee rows",
        },
        {
          question: "What is the 4% technology surcharge?",
          answer:
            'The last step on any Raleigh permit: "A 4% technology surcharge is applied to the following development fees to support the technology resources that allow for permitting in the City of Raleigh." The City reprints every fee with it applied, so a reader can check $744.80 becoming $774.59 on the guide\'s own page.',
          sourceId: RLY_FEE_SOURCE_KEY,
          attribution: "Development Fee Guide FY27, Technology Fee Reference Guide",
        },
      ],
      seoTitle: "Raleigh Electrical Permit Cost (49% / 100% of the building permit fee)",
      seoDescription:
        "A City of Raleigh electrical permit is 49% of the calculated building permit fee for new residential work and 100% for commercial, floored at a $124 per-trade minimum, plus a 4% technology surcharge.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: RLY_LAST_VERIFIED,
    },

    {
      jurisdictionKey: RLY_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      slug: "plumbing-permit-cost",
      title: "Raleigh plumbing permit cost",
      intro:
        "A City of Raleigh plumbing permit is **a percentage of the calculated building permit fee**: **34%** for new residential construction and **56%** for new commercial work, each floored at the City's **$124.00 Minimum Trade Permit Fee** and then carrying a 4% technology surcharge. Stand-alone plumbing work — fixture replacement and the plumbing utility inspection — is priced flat instead.",
      localSummary:
        "Plumbing is the same relationship as electrical at a different share, and comparing the two is the quickest way to understand the schedule: on a $400,000 new house the building permit is $1,520.00, so the plumbing permit is 34% of it — $516.80 — against electrical's 49% of $744.80. The City has priced the two trades as two percentages of one figure rather than as two schedules, and neither is sized by the amount of work in it. With the 4% surcharge of $20.67 the plumbing permit is **$537.47**.\n\nThe commercial share is larger than the residential one — **56% against 34%** — and it is a share of a permit fee that already has base fees in it, so the composition has to be read carefully. On a $2,000,000 commercial project the building permit is Tier 2: $1,050.00 plus 0.06% of the value, which is $2,250.00. The plumbing share of that is $588.00 plus 0.0336% of the value, which is $1,260.00, and $1,310.40 after the surcharge. The base fee is part of what the share applies to, which is what \"56% of the calculated building permit\" means.\n\nThe **four flat rows** are the part priced by work rather than by share, and each counts something: fixture replacement or retro-fit is $236 for 26–50 fixtures, $297 for 51–100, $325 for over 100, and a plumbing utility inspection is $133. They are the guide's Stand Alone Trade Permits, and they are alternatives to the percentage — a plumbing utility inspection is not a share of a building.",
      notIncluded:
        "This estimate is the plumbing permit as a share of the calculated building permit fee, its $124.00 floor, the four flat stand-alone plumbing permits and the 4% technology surcharge. It excludes:\n\n- **The building permit itself**, which is priced on the building page and is what this figure is a share of.\n- **The alteration shares** of 28%, 50% and 75% of the calculated building permit, applied to a building permit fee the guide never prints for an alteration.\n- **The mechanical permit**, priced by the City at 28% residential and 76% commercial of the calculated building permit; no page of this site prices mechanical work.\n- **Water, sewer and meter charges**, which are Raleigh Water's section of the same guide: meter installation from $290 for a 5/8-inch meter, water and sewer tap fees, capital facility fees and main reimbursement policies.\n- **Stormwater, thoroughfare and right-of-way fees**, and the **conditional service fees** of $215 per trade per unit commercial and $157 residential.\n- **The special projects fee** of 0.25% of calculated construction value per trade, re-inspections at $122 each, and after-hours inspections.\n- **The fire marshal's permits**, which are a different department's fees in the same document.",
      workedExample: {
        scenario:
          "A new single-family house in the City of Raleigh with a calculated construction value of $400,000, permitted for its plumbing work.",
        inputs: {
          valuationCents: 40_000_000,
          occupancy: "residential",
          workType: "new_construction",
        },
        notes:
          "The guide prints the plumbing permit as 34% of the calculated building permit fee. That fee is 0.38% of $400,000, which is $1,520.00, so the plumbing permit is $516.80 — the rule charges 34% of 0.38%, which is 0.1292% of the value, without the building permit having to be charged on this page. The 4% technology surcharge is $20.67, and the permit is $537.47.\n\nTwo variations show the other shapes. **A $10,000 project** produces a building permit of $38.00 whose 34% is $12.92 — under the floor — so the permit is the **$124.00 Minimum Trade Permit Fee**, $128.96 with the surcharge. **A $2,000,000 commercial project** is Tier 2: the building permit is $1,050.00 plus 0.06% of value, $2,250.00, and 56% of that is $1,260.00 — which is $588.00 of base plus 0.0336% of the value — for $1,310.40 with the surcharge.\n\nOne caution belongs with the number. The floor is **per trade per review**, so an electrical permit on the same job carries its own $124.00 rather than sharing this one.",
      },
      faqs: [
        {
          question: "How much is a plumbing permit in Raleigh?",
          answer:
            'A share of the building permit: "New Residential Plumbing Permit — 34.00% % Of Calculated Building Permit" and "New Commercial Plumbing Permit — 56.00%", each floored at $124.00. On a $400,000 new house the 34% share of the $1,520.00 building permit is $516.80, or $537.47 after the 4% technology surcharge.',
          sourceId: RLY_FEE_SOURCE_KEY,
          attribution: "Development Fee Guide FY27, New Residential Plumbing Permit",
        },
        {
          question: "Why is the plumbing share smaller than electrical's?",
          answer:
            'Because the City prints different shares per trade and they did not move together this year: residential electrical went from 54% to 49% while residential plumbing stayed at 34%, and commercial plumbing stayed at 56%. The shares are the guide\'s own figures, and this site charges each as published rather than assuming a trade relationship between them.',
          sourceId: RLY_FEE_SOURCE_KEY,
          attribution: "Development Fee Guide FY27, Prior Year Cost and FY27 Cost columns",
        },
        {
          question: "Is there a minimum plumbing permit fee?",
          answer:
            "Yes, $124.00, and it is assessed **per trade per review**. A project whose 34% share comes to $12.92 pays $124.00, and the electrical permit on the same job pays its own $124.00 — the guide does not combine the floors into one per project.",
          sourceId: RLY_FEE_SOURCE_KEY,
          attribution: "Development Fee Guide FY27, Minimum Trade Permit Fee",
        },
        {
          question: "What does a fixture replacement permit cost?",
          answer:
            'A flat amount that counts the fixtures: "Fixture Replacement/Retro-fit: 26-50 Fixtures - Commercial — $236.00", "51-100 Fixtures — $297.00" and "Over 100 Fixtures — $325.00". This is one of the few places in the schedule where the amount of work changes the fee, and each is a Stand Alone Trade Permit rather than a share of a building.',
          sourceId: RLY_FEE_SOURCE_KEY,
          attribution: "Development Fee Guide FY27, Stand Alone Trade Permits",
        },
        {
          question: "Are water and sewer connection fees included?",
          answer:
            "They are not. They belong to Raleigh Water's section of the same guide — meter installation, water and sewer tap fees, capital facility fees and main reimbursement — and are charges for connection rather than for the plumbing permit. A reader will see them on the same bill, which is why this page names them instead of folding them into a permit fee.",
          sourceId: RLY_FEE_SOURCE_KEY,
          attribution: "Development Fee Guide FY27, Raleigh Water",
        },
        {
          question: "What is the 4% technology surcharge?",
          answer:
            'The last step on any Raleigh permit: "A 4% technology surcharge is applied to the following development fees to support the technology resources that allow for permitting in the City of Raleigh." The guide reprints every fee with it applied, so a reader can check $516.80 becoming $537.47 on its own page.',
          sourceId: RLY_FEE_SOURCE_KEY,
          attribution: "Development Fee Guide FY27, Technology Fee Reference Guide",
        },
      ],
      seoTitle: "Raleigh Plumbing Permit Cost (34% / 56% of the building permit fee)",
      seoDescription:
        "A City of Raleigh plumbing permit is 34% of the calculated building permit fee for new residential work and 56% for commercial, floored at a $124 per-trade minimum, plus a 4% technology surcharge.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: RLY_LAST_VERIFIED,
    },
  ],

  verifications: [
    {
      entityType: "source",
      entityKey: RLY_FEE_SOURCE_KEY,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: RLY_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: RLY_FEE_SOURCE_KEY,
      notes:
        "Read twice: a row-by-row pass for the fee tables, and a second pass confirming that the right-hand of the two cost columns is FY27. The cover page's stated period, July 1 2026 – June 30 2027, is the effective date; no inference from a previous-version list was needed.",
    },
    {
      entityType: "fee_rule",
      entityKey: "BUILD-RESIDENTIAL",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: RLY_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: RLY_FEE_SOURCE_KEY,
      notes: "0.38% of calculated construction value: $400,000 computes $1,520.00.",
    },
    {
      entityType: "fee_rule",
      entityKey: "BUILD-COMMERCIAL-TIER-2",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: RLY_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: RLY_FEE_SOURCE_KEY,
      notes:
        "$1,050.00 base plus 0.06% of value: $2,000,000 computes $2,250.00, and $500,001 computes $1,350.00 — the step above Tier 1's $1,050.00 at $500,000, which is the City's structure and not a modelling artefact.",
    },
    {
      entityType: "fee_rule",
      entityKey: "ELEC-RESIDENTIAL",
      permitTypeKey: "electrical",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: RLY_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: RLY_FEE_SOURCE_KEY,
      notes:
        "49% of the calculated building permit fee, composed as 49% × 0.38%: $400,000 computes $744.80, which is 49% of the $1,520.00 building permit the same schedule prices. Checked both ways so the composition and the City's wording agree.",
    },
    {
      entityType: "fee_rule",
      entityKey: "ELEC-RESIDENTIAL",
      permitTypeKey: "electrical",
      status: "verified",
      method: "manual_review",
      verifiedAt: RLY_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: RLY_FEE_SOURCE_KEY,
      notes:
        "The per-trade floor bites as the guide states: a $10,000 project's 49% share of its $38.00 building permit is $18.62, and the rule charges the published $124.00 instead.",
    },
    {
      entityType: "fee_rule",
      entityKey: "PLAN-REVIEW-RESIDENTIAL",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: RLY_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: RLY_FEE_SOURCE_KEY,
      notes:
        "57% of the calculated permit fee rather than of the valuation: $400,000 gives a $1,520.00 permit and $866.40 of plan review, which is 57% of the permit and not 57% of the value.",
    },
    {
      entityType: "fee_rule",
      entityKey: "TECHNOLOGY-SURCHARGE",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: RLY_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: RLY_FEE_SOURCE_KEY,
      notes:
        "Checked against the guide's own Technology Fee Reference Guide arithmetic: $150.00 becomes $156.00 and $124.00 becomes $129.00 there, and on this site $1,520.00 plus $866.40 of fees is charged $95.46, which is 4% of the fees rather than of the valuation.",
    },
    {
      entityType: "permit_page",
      entityKey: "building-permit-cost",
      permitTypeKey: "building",
      status: "verified",
      method: "manual_review",
      verifiedAt: RLY_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: RLY_FEE_SOURCE_KEY,
      notes:
        "Recomputed with the engine: $1,520.00 permit, $866.40 plan review, $95.46 technology surcharge, $2,481.86 — and the commercial variations at $1,081.08 (Tier 1) and $3,861.00 (Tier 2).",
    },
    {
      entityType: "permit_page",
      entityKey: "electrical-permit-cost",
      permitTypeKey: "electrical",
      status: "verified",
      method: "manual_review",
      verifiedAt: RLY_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: RLY_FEE_SOURCE_KEY,
      notes:
        "Recomputed with the engine: $744.80 plus $29.79 of surcharge, $774.59; the $10,000 variation at the $124.00 floor for $128.96; and the commercial generator at $411.84.",
    },
    {
      entityType: "permit_page",
      entityKey: "plumbing-permit-cost",
      permitTypeKey: "plumbing",
      status: "verified",
      method: "manual_review",
      verifiedAt: RLY_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: RLY_FEE_SOURCE_KEY,
      notes:
        "Recomputed with the engine: $516.80 plus $20.67 of surcharge, $537.47; the commercial Tier 2 variation at $1,310.40; and the plumbing utility inspection at $138.32.",
    },
    {
      entityType: "jurisdiction_profile",
      entityKey: RLY_KEYS.jurisdiction,
      status: "verified",
      method: "manual_review",
      verifiedAt: RLY_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: RLY_FEE_SOURCE_KEY,
      notes:
        "The profile's claims about which column of the two cost columns is FY27, about the valuation being the City's own figure reduced by 12.4%, and about the surcharge being a fee-level charge rather than a rate on the value, are read off the guide rather than inferred; the department contact details are the ones printed on its Planning and Development page.",
    },
  ],
};

/** Permit pages that clear the editorial gate for this jurisdiction. */
export const RLY_PUBLISHED_PERMIT_PAGES = raleighSeed.permitPages.filter(
  (page) => page.publishStatus === "published" && !page.noindex,
);
