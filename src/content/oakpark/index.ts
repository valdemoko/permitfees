import type { JurisdictionSeed } from "@/content/seed-types";
import {
  OP_BUILDING_RULES,
  OP_ELECTRICAL_RULES,
  OP_FEE_EFFECTIVE_FROM,
  OP_FEE_SCHEDULE_SOURCE_KEY,
  OP_PERMITS_PAGE_SOURCE_KEY,
  OP_PLUMBING_RULES,
} from "@/content/oakpark/fee-rules";

/**
 * Oak Park, Illinois — the second Illinois jurisdiction, and Chicago's village-scale
 * opposite: the same state, the same county, and a completely different idea of what a
 * permit fee is. Chicago prices a building from its own factor tables with no valuation;
 * Oak Park prices it from the ICC's published square-foot construction cost multiplied by
 * a factor printed beside the chart. Chicago issues the trades as stand-alone permits with
 * flat fees; Oak Park does the same, but prices each at a small published rate per circuit
 * or per system — which is why the Village's own page says the trades need "a separate
 * permit from a general construction permit".
 */

export const OP_LAST_VERIFIED = "2026-09-25";

export const OP_KEYS = {
  state: "il",
  county: "cook-county",
  jurisdiction: "oak-park",
  feeSchedule: OP_FEE_SCHEDULE_SOURCE_KEY,
  permitsPage: OP_PERMITS_PAGE_SOURCE_KEY,
} as const;

const RESEARCHER = "Permit Fee Intelligence research pass 16 (Illinois, second jurisdiction)";

const state = {
  code: "IL",
  slug: "illinois",
  name: "Illinois",
  fipsCode: "17",
};

const county = {
  key: OP_KEYS.county,
  slug: "cook-county",
  name: "Cook County",
  fipsCode: "17031",
};

const FEES_URL =
  "https://www.oak-park.us/files/assets/oakpark/v/3/development-services/permits/2026-construction-fees-and-credits.pdf";
const PERMITS_URL = "https://www.oak-park.us/Building-Business/Building-Permits";

export const oakParkSeed: JurisdictionSeed = {
  state,
  county,

  jurisdiction: {
    key: OP_KEYS.jurisdiction,
    stateKey: OP_KEYS.state,
    countyKey: OP_KEYS.county,
    type: "village",
    slug: "oak-park",
    name: "Oak Park",
    officialName: "Village of Oak Park — Development Services Department",
    websiteUrl: "https://www.oak-park.us/Building-Business",
    permitPortalUrl: PERMITS_URL,
    timezone: "America/Chicago",
    isActive: true,
  },

  departments: [
    {
      key: "oak-park-development-services",
      jurisdictionKey: OP_KEYS.jurisdiction,
      kind: "building",
      name: "Development Services Department — Permits & Development Division",
      /*
        No telephone number or email is recorded. The fee schedule read for these pages
        prints a Village header, an ordinance reference and its tables, and no contact
        details at all; the permits page was not read for them in this pass. A page that
        tells someone who to call is the one place a wrong number cannot be caught by
        the reader, so it is left out rather than guessed.
      */
      phone: null,
      email: null,
      url: PERMITS_URL,
      addressLine: null,
      hours: null,
      notes:
        "The Permits & Development Division administers the Annual Fee Ordinance's construction fees (§7-8-1, with administration under §7-8-2) and issues the Village's building, electrical and plumbing permits. The Village's own page explains why the trades are separate permits: electrical work 'requires specialized skills and knowledge', particularly in Oak Park's older housing stock.",
    },
  ],

  sources: [
    {
      key: OP_FEE_SCHEDULE_SOURCE_KEY,
      jurisdictionKey: OP_KEYS.jurisdiction,
      title: "Village of Oak Park 2026 Construction Fees (Annual Fee Ordinance §7-8-1)",
      url: FEES_URL,
      sourceType: "fee_schedule_pdf",
      issuingAuthority: "Village of Oak Park, Development Services Department",
      authorityKind: "city",
      isPrimary: true,
      documentDate: "2026-01-26",
      effectiveFrom: OP_FEE_EFFECTIVE_FROM,
      retrievedAt: OP_LAST_VERIFIED,
      lastVerifiedAt: OP_LAST_VERIFIED,
      notes:
        "One document, updated 01/26/2026 on its face, carrying the ordinance's own heading 'Construction Fee(s) Effective on March 1st, 2026'. Read with pdftotext; the ICC chart was transcribed cell by cell and re-checked against the schedule's own arithmetic (an R-3 Type IIIA building at $195.98 × .0194 × area). The chart and its footnotes are credited to ICC Building Valuation Data, August 2025.",
    },
    {
      key: OP_PERMITS_PAGE_SOURCE_KEY,
      jurisdictionKey: OP_KEYS.jurisdiction,
      title: "Village of Oak Park — Building Permits",
      url: PERMITS_URL,
      sourceType: "municipal_website",
      issuingAuthority: "Village of Oak Park",
      authorityKind: "city",
      isPrimary: true,
      documentDate: null,
      effectiveFrom: null,
      retrievedAt: OP_LAST_VERIFIED,
      lastVerifiedAt: OP_LAST_VERIFIED,
      notes:
        "The Village's permit information page, and the authority for the stand-alone trade structure: 'A separate permit from a general construction permit is necessary because electrical work requires specialized skills and knowledge', with the same reasoning for plumbing. It also records that owners of single-family homes may pull their own plumbing permit by affidavit.",
    },
  ],

  /** Empty on purpose: the permit types this jurisdiction uses already exist. */
  permitTypes: [],
  projectTypes: [],

  jurisdictionPermitTypes: [
    {
      jurisdictionKey: OP_KEYS.jurisdiction,
      permitTypeKey: "building",
      isAvailable: true,
      localName: "Building permit",
      officialUrl: FEES_URL,
      notes:
        "Priced from the ICC square-foot construction cost chart the schedule reproduces: new construction and additions are **Area × CC × .0194**, and remodel or tenant-buildout work is **Area × CC × .008** with a $300 residential / $500 multi-family-or-commercial floor. The chart is 27 use groups across nine construction types, five of its cells printed NP — Not Permitted, where the schedule publishes no cost at all. Plan review is charged from its own list on top.",
    },
    {
      jurisdictionKey: OP_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      isAvailable: true,
      localName: "Electrical permit",
      officialUrl: PERMITS_URL,
      notes:
        "A permit separate from the general construction permit, priced from the ELECTRICAL section of the schedule: alterations at **$100.00 per circuit** and system installations at **$175.00 per system or unit**. The Village's own page explains the separateness — 'electrical work requires specialized skills and knowledge' — rather than leaving it to inference.",
    },
    {
      jurisdictionKey: OP_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      isAvailable: true,
      localName: "Plumbing permit",
      officialUrl: PERMITS_URL,
      notes:
        "Also a separate permit, priced from the PLUMBING section: alterations at **$100.00 per unit**, system installations at **$175.00 per system or unit**, flood control at **$200.00 per system or unit**, and a sewer connection at a flat **$250.00** (plus a refundable $1,000 restoration deposit where a right-of-way opening is needed). Owners of single-family homes may do their own plumbing by affidavit.",
    },
  ],

  feeSchedules: [
    {
      key: OP_FEE_SCHEDULE_SOURCE_KEY,
      jurisdictionKey: OP_KEYS.jurisdiction,
      sourceKey: OP_FEE_SCHEDULE_SOURCE_KEY,
      title: "2026 Construction Fees (effective 2026-03-01)",
      officialUrl: FEES_URL,
      effectiveFrom: OP_FEE_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: OP_LAST_VERIFIED,
      notes:
        "One schedule for all four trades and the miscellaneous rows. The building fee and the plan-review list are priced here; the HVAC rows are named on the pages but not modelled, because mechanical is not one of this site's three priced permit types, and the fire-alarm and fire-sprinkler inspection rows carry per-unit amounts whose count is not an input this calculator asks for.",
    },
  ],

  feeRules: [
    ...OP_BUILDING_RULES.map((rule) => ({
      jurisdictionKey: OP_KEYS.jurisdiction,
      permitTypeKey: "building",
      scheduleKey: OP_FEE_SCHEDULE_SOURCE_KEY,
      rule,
    })),
    ...OP_ELECTRICAL_RULES.map((rule) => ({
      jurisdictionKey: OP_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      scheduleKey: OP_FEE_SCHEDULE_SOURCE_KEY,
      rule,
    })),
    ...OP_PLUMBING_RULES.map((rule) => ({
      jurisdictionKey: OP_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      scheduleKey: OP_FEE_SCHEDULE_SOURCE_KEY,
      rule,
    })),
  ],

  requirements: [
    {
      jurisdictionKey: OP_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "other",
      title: "The fee is area and construction type, not the value of the work",
      description:
        'New Construction and Additions reads "Area (SF) x Construction Cost (CC) x .0194", where CC comes from the ICC Square Foot Construction Cost Chart attached to the schedule itself. There is no valuation field anywhere in the fee: the cost per square foot is the ICC\'s published figure for the use group and construction type, not the applicant\'s contract price. Remodel work is the same chart at .008, with the printed minimum ($300 residential, $500 multi-family, commercial and institutional) charged when the product is smaller.',
      isMandatory: true,
      sortOrder: 10,
      sourceKey: OP_FEE_SCHEDULE_SOURCE_KEY,
      lastVerifiedAt: OP_LAST_VERIFIED,
    },
    {
      jurisdictionKey: OP_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "other",
      title: "The building fee excludes exterior work and every other trade",
      description:
        'The schedule says so in the row itself: the new-construction fee "does not include any exterior work or other required fees for Water Service, Sprinklers, Alarms, Electric Service, Demolition, Plan Review Fees". Plan review is charged from its own list on top of the building fee, and the trades are permits of their own with their own fees — a reader should expect the building page\'s figure to be one part of the project\'s permit cost, not the whole of it.',
      isMandatory: true,
      sortOrder: 20,
      sourceKey: OP_FEE_SCHEDULE_SOURCE_KEY,
      lastVerifiedAt: OP_LAST_VERIFIED,
    },
    {
      jurisdictionKey: OP_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "other",
      title: "NP on the chart means no fee is published, not a nearby fee",
      description:
        'Five cells of the ICC chart are printed "NP — Not Permitted" (H-1 explosives in Type VB, both I-2 rows in Types IIIB and VB). The schedule publishes no construction cost for those combinations, so this site leaves the rule out for them rather than charging a neighbouring use group\'s rate — the same policy the engine applies to any schedule that publishes no rate for a combination of its inputs.',
      isMandatory: false,
      sortOrder: 30,
      sourceKey: OP_FEE_SCHEDULE_SOURCE_KEY,
      lastVerifiedAt: OP_LAST_VERIFIED,
    },
    {
      jurisdictionKey: OP_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      requirementType: "other",
      title: "A separate permit, because the work requires specialised skills",
      description:
        'The Village\'s own page: "A separate permit from a general construction permit is necessary because electrical work requires specialized skills and knowledge. Electrical work done improperly can have tragic results, particularly in older, more fire-prone housing stock such as found in Oak Park." The fee is $100.00 per circuit for alterations and $175.00 per system or unit for a new or replacement system — a service, a generator, a solar array, an EV charger.',
      isMandatory: true,
      sortOrder: 10,
      sourceKey: OP_PERMITS_PAGE_SOURCE_KEY,
      lastVerifiedAt: OP_LAST_VERIFIED,
    },
    {
      jurisdictionKey: OP_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      requirementType: "other",
      title: "A separate permit, with an affidavit route for single-family owners",
      description:
        'Plumbing is permitted separately for the same reason the Village gives for electrical: "plumbing requires specialized skills and knowledge", and improper work "can cause significant water damage to a building". Owners of single-family homes may obtain the permit by signing an affidavit attesting to their intent to do the work themselves. Fees run $100.00 per unit for alterations, $175.00 per system for installations, $200.00 per system for flood control, and $250.00 flat for a sewer connection.',
      isMandatory: true,
      sortOrder: 10,
      sourceKey: OP_PERMITS_PAGE_SOURCE_KEY,
      lastVerifiedAt: OP_LAST_VERIFIED,
    },
  ],

  profile: {
    jurisdictionKey: OP_KEYS.jurisdiction,
    headline: "Permit fees for Oak Park, from the Village's 2026 Construction Fees",
    summary:
      "Oak Park prices a building permit from **area and construction type**: Area (SF) × the ICC square-foot construction cost (CC) × **.0194** for new construction and additions, or × **.008** for remodel and tenant-buildout work with a printed minimum of $300 residential / $500 multi-family or commercial. The chart CC is read from is reproduced inside the fee schedule itself — 27 use groups across nine construction types, with five cells printed **NP**, where the Village publishes no cost at all. There is no valuation field on the schedule. Plan review is a separate list charged on top ($500 per dwelling unit for a new one- or two-family home, $500 per floor for multifamily and commercial), and the electrical and plumbing trades are **permits of their own** at $100–$200 per circuit, unit or system.",
    localContext:
      "Oak Park is a village of roughly 54,000 people bordering Chicago's West Side, governed by an Annual Fee Ordinance whose construction-fee article the Development Services Department administers. The 2026 fees took effect March 1, 2026.\n\nThe fee's arithmetic is the thing to understand first, because it is not a valuation system. The ICC publishes a square-foot construction cost for each use group and construction type — from $69.64 for a Group U building of Type VB up to $473.85 for a hospital of Type IA — and the Village multiplies that published figure by the area and by a small factor (.0194 new, .008 remodel). A 1,000-square-foot one-family home in Type IIIA is 1,000 × $195.98 × .0194 = **$3,802.01**. The same home priced as a remodel would be 1,000 × $195.98 × .008 = $1,567.84. Neither number involves what the owner is actually paying a contractor.\n\nThe trades are structurally different from most of this site's jurisdictions. The Village's permits page explains why electrical and plumbing need \"a separate permit from a general construction permit\" — specialised skills, older housing stock, water damage — and the schedule prices those separate permits per unit of work: $100 per circuit for electrical alterations, $175 per system installation, $100 per unit for plumbing alterations. A kitchen remodel therefore generates at least two permits here, and this site prices each on its own page.",
    valuationBasis:
      "**Oak Park does not use a project valuation.** The building fee is Area × CC × .0194 (new construction and additions) or Area × CC × .008 (remodel, tenant buildout), where CC is the ICC's published square-foot construction cost for the use group and construction type, read from the chart printed inside the fee schedule. The applicant supplies the area, the use group and the construction type; the cost comes from the ICC, not from a contract price.\n\nTwo adjustments the schedule notes on the chart's face: private garages take the Utility (miscellaneous) row, and shell-only buildings deduct 20% from the chart figure. Unfinished basements in R-3 homes are priced at **$31.50 per square foot** in addition to the above-grade area.\n\nThe trade permits are not valuation-priced either: they are published amounts per circuit, unit or system, so a plumbing alteration touching five units is $500.00 regardless of what the fixtures cost.",
    notIncluded:
      "This profile describes the construction fees of the Annual Fee Ordinance that this site computes. It excludes:\n\n- **The permit application deposits** — $100 residential, $200 commercial, non-refundable but applied to the permit fee. They are paid up front and credited back, so the net fee is unchanged, but the applicant fronts them.\n- **The HVAC/mechanical rows** ($100 per unit, $175 per system), which are priced on the same schedule but issued as mechanical permits this site does not publish a page for.\n- **The fire-protection inspection rows** — fire alarm and fire sprinkler final inspections at $25 per unit with a $350 minimum, and the Fire Department's own plan reviews at $200 and $400 — whose counts are not inputs this calculator asks for.\n- **Zoning applications, water service and ROW fees**, the sustainable-construction credits, and the penalty rows (work without a permit starts at a $300 minimum or double the fee).\n- **Demolition**, which the schedule prices per structure or per square foot as the *greater* of two products — a construction this site names rather than computes.",
    seoTitle: "Oak Park IL Permit Fees (ICC chart × .0194)",
    seoDescription:
      "What a Village of Oak Park permit costs: area × ICC construction cost × .0194 new / .008 remodel, the NP cells, plan review per unit or floor, and $100–$200 trade permits.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: OP_LAST_VERIFIED,
  },

  permitPages: [
    {
      jurisdictionKey: OP_KEYS.jurisdiction,
      permitTypeKey: "building",
      slug: "building-permit-cost",
      title: "Oak Park building permit cost",
      intro:
        "A Village of Oak Park building permit is priced from the **International Code Council's square-foot construction cost chart**, which the fee schedule reproduces in full: new construction and additions are **Area (SF) × Construction Cost (CC) × .0194**, and remodel or tenant-buildout work is **Area × CC × .008** with a printed minimum of **$300.00** residential or **$500.00** multi-family, commercial and institutional. There is **no valuation field** on the schedule — the cost per square foot comes from the ICC, not from a contract price. The chart runs 27 use groups across nine construction types, from $69.64 for a Group U utility building of Type VB to $473.85 for a Type IA hospital, and five of its cells are printed **NP — Not Permitted**, where the Village publishes no cost at all. Plan review is charged from its own list: **$500.00 per dwelling unit** for a new one- or two-family home and **$500.00 per floor** for multifamily, commercial or institutional work.",
      localSummary:
        "Three things decide the building fee, and none of them is a dollar the applicant spent. The **use group and construction type** pick the chart's cell — a 1,000-square-foot R-3 one-family home in Type IIIA reads $195.98 — and the **project scope** picks the multiplier: .0194 new, .008 remodel. That home is 1,000 × $195.98 × .0194 = **$3,802.01**. The row also excludes, in the schedule's own words, \"any exterior work or other required fees for Water Service, Sprinklers, Alarms, Electric Service, Demolition, Plan Review Fees\" — so the plan-review amount is added on top, and the trades are permits of their own. Five chart cells are **NP**, and this page refuses to price them rather than charging a neighbour's rate.",
      notIncluded:
        "This estimate is the building fee and the plan-review rows the schedule prices from a count this calculator asks for. It excludes:\n\n- **The permit application deposit** — $100.00 residential or $200.00 commercial, non-refundable but applied to the permit, so it changes what is paid at the counter and not the fee itself.\n- **Demolition**, which the schedule prices as \"whichever is greater\" between a per-structure or per-unit amount and $.35 × SF — a comparison between two products this site names rather than computes.\n- **The Alteration – General rows** ($150.00 residential, $250.00 IBC, charged \"per type of work\"), where the count is the number of kinds of work on the application, which this calculator does not ask for. The named alterations it can price — fencing, structural-only, fire alarm, fire sprinkler, parking lot, residential hardscape — are computed above.\n- **Fire-alarm and fire-sprinkler final inspections** at $25.00 per unit with a $350.00 minimum, and the Fire Department's plan reviews, which belong to the fire permit process.\n- **Water service, sewer and right-of-way fees**, which the schedule defers to the Water & Sewer Division's separate schedule, plus the $1,000.00 ROW restoration deposit where an opening is made.",
      workedExample: {
        scenario:
          "A new one-family home of 1,000 square feet, Group R-3, Type IIIA construction, two dwelling units, with the residential plan review for a new dwelling.",
        inputs: {
          squareFootage: 1000,
          units: 2,
          custom: {
            use_group: "R-3 one and two family",
            construction_type: "IIIA",
            project_scope: "new_construction_addition",
            plan_review: "residential_new_family",
          },
        },
        notes:
          "The chart's R-3 Type IIIA cell is **$195.98** per square foot, and new construction multiplies the area by it and by **.0194**: 1,000 × $195.98 × .0194 = **$3,802.01**. Plan review for a new one- or two-family dwelling is **$500.00 per unit**, and the home has two: **$1,000.00**. The permit total is **$4,802.01**, before the $100.00 application deposit that is credited back.\n\nThree variations show the shape of the schedule. **The same home as a remodel** (a gut renovation within the walls) reads the same $195.98 cell at .008 — $1,567.84, above the $300 residential minimum. **A 2,000-square-foot hospital** (Group I-2, Type IA, $473.85) is 2,000 × $473.85 × .0194 = **$18,385.38** plus $500.00 per floor of plan review. **A Group I-2 hospital in Type IIIB** cannot be priced at all: the chart prints **NP** there, and the Village publishes no cost for that combination.",
      },
      faqs: [
        {
          question: "How is an Oak Park building permit calculated?",
          answer:
            "From area and construction type: **Area × Construction Cost × .0194** for new construction and additions, and **Area × Construction Cost × .008** for remodel work. The Construction Cost is the ICC's square-foot figure for the use group and construction type, read from the chart printed in the fee schedule. There is no valuation input anywhere on the schedule.",
          sourceId: OP_FEE_SCHEDULE_SOURCE_KEY,
          attribution: "Village of Oak Park 2026 Construction Fees",
        },
        {
          question: "What is the minimum building permit fee in Oak Park?",
          answer:
            "New construction has no printed minimum — the fee is the product itself. Remodel work carries one: **$300.00** for residential and **$500.00** for multi-family, commercial and institutional projects, charged when SF × CC × .008 comes out smaller. A very small bathroom remodel still pays $300.00.",
          sourceId: OP_FEE_SCHEDULE_SOURCE_KEY,
          attribution: "Village of Oak Park 2026 Construction Fees",
        },
        {
          question: "Why can't this page price my Type VB hospital or nursing home?",
          answer:
            "Because the Village doesn't either. Five cells of the ICC chart are printed **NP — Not Permitted**: H-1 explosives in Type VB, and both I-2 (hospitals and nursing homes) rows in Types IIIB and VB. No construction cost is published for those combinations, so no fee can be computed from the schedule — this page names the cell rather than substituting a neighbouring use group's rate.",
          sourceId: OP_FEE_SCHEDULE_SOURCE_KEY,
          attribution: "ICC Square Foot Construction Cost Chart, 2026 Construction Fees",
        },
        {
          question: "Does the building permit include plan review?",
          answer:
            "No. The schedule says the new-construction fee \"does not include any exterior work or other required fees for Water Service, Sprinklers, Alarms, Electric Service, Demolition, **Plan Review Fees**\". Plan review is its own list: $500.00 per dwelling unit for a new one- or two-family home, $150.00 per floor for residential interior alterations, $500.00 per floor for multifamily and commercial work, and $50–$200 for accessory structures. Plan review fees are non-refundable under §7-8-2.",
          sourceId: OP_FEE_SCHEDULE_SOURCE_KEY,
          attribution: "Village of Oak Park 2026 Construction Fees, §7-8-2",
        },
        {
          question: "How much is the permit for an unfinished basement in an R-3 home?",
          answer:
            "The chart's footnote 2 prices unfinished basements at **$31.50 per square foot**, on top of the above-grade area's fee at the usual R-3 cell. Finishing the basement is remodel work instead, priced from the same chart at .008 with the $300.00 residential minimum.",
          sourceId: OP_FEE_SCHEDULE_SOURCE_KEY,
          attribution: "2026 Construction Fees, chart footnote 2",
        },
      ],
      seoTitle: "Oak Park Building Permit Cost (Area × ICC cost × .0194)",
      seoDescription:
        "What an Oak Park IL building permit costs: SF × ICC construction cost × .0194 new / .008 remodel, $300–$500 minimums, plan review per unit, and the NP cells the Village won't price.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: OP_LAST_VERIFIED,
    },
    {
      jurisdictionKey: OP_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      slug: "electrical-permit-cost",
      title: "Oak Park electrical permit cost",
      intro:
        "An Oak Park electrical permit is a **permit separate from the general construction permit** — the Village's own page says so, and gives the reason: \"electrical work requires specialized skills and knowledge. Electrical work done improperly can have tragic results, particularly in older, more fire-prone housing stock such as found in Oak Park.\" The fee schedule prices the two rows a standalone electrical permit can carry: **alterations** — wiring, outlets, lighting, fixtures, low voltage, exit signs — at **$100.00 per circuit**, and **system installations** — a new or replacement service, feeder, panel, generator, transformer, solar array, EV charger or energy storage system — at **$175.00 per system or unit**.",
      localSummary:
        "The unit that matters is the **circuit**, not the outlet. A job that replaces twenty devices on six circuits is six circuits — **$600.00** — because the schedule prices the wiring work per circuit altered. A new system is priced as one thing: a service upgrade or an EV charger circuit with its own panel work is a **$175.00** system installation, not a stack of circuit charges. Where a project's electrical work is genuinely two kinds — an alteration on existing circuits plus a new system — the schedule prices each row on its own permit, and this page charges each when its inputs are given.",
      notIncluded:
        "This estimate is the two electrical rows of the 2026 Construction Fees that can be computed from a count the applicant gives. It excludes:\n\n- **Fire alarm systems**, which the schedule prices under Building Alterations ($200.00 each, new or altered) with the Fire Department's separate $200.00 plan review and the $25.00-per-unit final inspection — fire-protection process rather than the electrical trade row.\n- **The electrical work inside a general building permit** — the building fee's own row says it does not include Electric Service, and a service upgrade needed by a new building is the $175.00 system row here, not part of the building fee.\n- **ComEd and utility-side work**, meter equipment, and anything the utility charges for a service change.\n- **The permit application deposit** — $100.00 residential or $200.00 commercial, applied to the permit fee rather than added to it.\n- **Re-inspection fees** ($100.00 after the second inspection) and the penalty rows for working without a permit, which are enforcement charges rather than the fee for the work.",
      workedExample: {
        scenario:
          "A kitchen and basement remodel whose electrical permit covers rewiring and new lighting on twelve existing circuits, plus a new sub-panel installed as its own system.",
        inputs: {
          custom: {
            electrical_scope: "alteration",
            circuits: 12,
          },
        },
        notes:
          "The alteration row is **$100.00 per circuit**, and twelve circuits are altered: **$1,200.00**. The new sub-panel is a **system installation** — $175.00 per system or unit — and the schedule lists sub-panels among its examples explicitly, so the whole job is $1,200.00 **plus** $175.00 = **$1,375.00** across the two rows.\n\nTwo cautions belong with the number. The unit is the circuit the work touches: twenty new outlets on four circuits are four circuits, not twenty. And a single new system with no other alteration — a generator, an EV charger, a solar array — is one **$175.00** row, which is what this page charges when only the system inputs are given.",
      },
      faqs: [
        {
          question: "How much is an electrical permit in Oak Park?",
          answer:
            "Two published rows: **$100.00 per circuit** for alterations and replacements (wiring, outlets, lighting, fixtures, low voltage, exit signs), and **$175.00 per system or unit** for a new or replacement system — services, feeders, panels, sub-panels, generators, transformers, solar, EV chargers and energy storage.",
          sourceId: OP_FEE_SCHEDULE_SOURCE_KEY,
          attribution: "Village of Oak Park 2026 Construction Fees, ELECTRICAL",
        },
        {
          question: "Why does electrical work need its own permit in Oak Park?",
          answer:
            "The Village's own page: \"A separate permit from a general construction permit is necessary because electrical work requires specialized skills and knowledge. Electrical work done improperly can have tragic results, particularly in older, more fire-prone housing stock such as found in Oak Park.\" It is a safety rule as much as a fee structure.",
          sourceId: OP_PERMITS_PAGE_SOURCE_KEY,
          attribution: "Village of Oak Park — Building Permits",
        },
        {
          question: "Is an EV charger or solar installation $100 per circuit or $175?",
          answer:
            "**$175.00**. The schedule's system-installation row names EV chargers, solar panels and energy storage systems explicitly, and a new circuit serving a new system is one system installation rather than an alteration of the building's existing circuits. The $100.00 per-circuit row is for work on the existing wiring.",
          sourceId: OP_FEE_SCHEDULE_SOURCE_KEY,
          attribution: "Village of Oak Park 2026 Construction Fees, ELECTRICAL",
        },
        {
          question: "Do electrical permits stack with the building permit?",
          answer:
            "They are separate permits with separate fees — the building fee's own row excludes \"Electric Service\". A construction project that includes electrical work carries the building permit's fee and, on the electrical permit, the $100-per-circuit or $175-per-system row for the electrical scope. This page prices the electrical permit alone.",
          sourceId: OP_FEE_SCHEDULE_SOURCE_KEY,
          attribution: "Village of Oak Park 2026 Construction Fees",
        },
      ],
      seoTitle: "Oak Park Electrical Permit Cost ($100 per circuit)",
      seoDescription:
        "What a Village of Oak Park electrical permit costs: $100 per circuit for alterations, $175 per system installation, and why the Village requires a separate permit for the trade.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: OP_LAST_VERIFIED,
    },
    {
      jurisdictionKey: OP_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      slug: "plumbing-permit-cost",
      title: "Oak Park plumbing permit cost",
      intro:
        "An Oak Park plumbing permit is **a permit separate from the general construction permit** — \"because plumbing requires specialized skills and knowledge\", as the Village's page puts it, and because improper work \"can cause significant water damage to a building\". The schedule prices the PLUMBING section in four rows: **alterations** — piping, fixtures and similar work — at **$100.00 per unit**; **system installations** — water heaters, water softeners, lawn irrigation, grease interceptors, sewer systems, drain tile, RPZ devices — at **$175.00 per system or unit**; **flood control and sewer backup protection** at **$200.00 per system or unit**; and a **sanitary or storm sewer connection or repair** at a flat **$250.00** (with a refundable $1,000.00 restoration deposit where a right-of-way opening is made). Owners of single-family homes may pull the permit themselves by affidavit.",
      localSummary:
        "Most of this schedule is priced **per unit of what the job touches**: replacing fixtures in five bathrooms is five units — **$500.00** — on the alteration row, while one water heater is one **$175.00** system. Flood control work (overhead plumbing, backwater valves) is the same structure at **$200.00** per system. The sewer connection is the one flat row: **$250.00**, and the $1,000.00 restoration deposit that may accompany it is refundable, so it is named on the page rather than added to the fee. Where a job covers two kinds of plumbing work, each row is charged — a water heater replacement with a new backwater valve is $175.00 **plus** $200.00.",
      notIncluded:
        "This estimate is the plumbing rows of the 2026 Construction Fees that can be computed from a count the applicant gives. It excludes:\n\n- **Water service work**, which the schedule defers to the Water & Sewer Division's separate *Schedule of Water Service Cost and Fees* — repairing or replacing an existing service and new water connections alike. Only the sanitary/storm **sewer** connection is priced here.\n- **The $1,000.00 ROW restoration deposit** that may accompany the sewer connection. It is refundable if applicable, so it is a deposit and not part of the fee.\n- **Sump pumps and drain tile attached to flood control** are on the flood-control row, but **interior demolition** to reach the plumbing is a building-alterations row priced \"whichever is greater\" between $300.00 per unit and $.35 × SF — a comparison this site names rather than computes.\n- **The permit application deposit** — $100.00 residential or $200.00 commercial, applied to the permit fee rather than added to it.\n- **Re-inspection and penalty rows** ($100.00 re-inspection after the second visit; work without a permit at a $300.00 minimum or double the fee), which are enforcement charges rather than the fee for the work.",
      workedExample: {
        scenario:
          "A basement flood-control project on a single-family home: interior overhead plumbing modification and a new exterior backwater valve, plus replacement of the water heater on the same plumbing permit.",
        inputs: {
          custom: {
            plumbing_scope: "flood_control",
          },
          fixtures: 1,
        },
        notes:
          "Flood control is **$200.00 per system or unit**, and the project is one system: **$200.00**. The water heater is a separate row — system installations at **$175.00** each — and the schedule names water heaters among its examples explicitly, so the whole permit is $200.00 **plus** $175.00 = **$375.00**.\n\nThe per-unit rows behave the same way: a job replacing fixtures across **five** bathrooms is five units on the $100.00 alteration row — **$500.00**. And a **sewer connection or repair** is the one flat row at $250.00, with the $1,000.00 restoration deposit named here but not charged, because the schedule marks it refundable.",
      },
      faqs: [
        {
          question: "How much is a plumbing permit in Oak Park?",
          answer:
            "Four published rows: **$100.00 per unit** for alterations and repairs (piping, fixtures, similar work), **$175.00 per system** for installations (water heater, softener, irrigation, grease interceptor, sewer system, drain tile, RPZ), **$200.00 per system** for flood control and sewer backup protection, and **$250.00 flat** for a sanitary or storm sewer connection or repair.",
          sourceId: OP_FEE_SCHEDULE_SOURCE_KEY,
          attribution: "Village of Oak Park 2026 Construction Fees, PLUMBING",
        },
        {
          question: "Can I do my own plumbing work in Oak Park?",
          answer:
            "If you own a single-family home, yes: the Village's page says owners \"may obtain a plumbing permit by signing an affidavit attesting to their intent to do the work themselves.\" The fee is the same either way — the affidavit changes who does the work, not what the permit costs.",
          sourceId: OP_PERMITS_PAGE_SOURCE_KEY,
          attribution: "Village of Oak Park — Building Permits",
        },
        {
          question: "Is a water heater replacement $100 or $175?",
          answer:
            "**$175.00**, on the system-installation row: the schedule names water heaters among its examples explicitly. The $100.00 per-unit row is for alterations and repairs to existing piping and fixtures. Replacing a heater that serves the building is a system installation, not a fixture alteration.",
          sourceId: OP_FEE_SCHEDULE_SOURCE_KEY,
          attribution: "Village of Oak Park 2026 Construction Fees, PLUMBING",
        },
        {
          question: "What is the $1,000 deposit on a sewer connection?",
          answer:
            "A **refundable right-of-way restoration deposit**. The schedule's sewer row reads \"$250.00, plus $1,000.00 restoration deposit, if applicable\", and the ROW section describes it as the Public Works refundable deposit for each opening. It comes back when the opening is restored, so this page names it rather than charging it.",
          sourceId: OP_FEE_SCHEDULE_SOURCE_KEY,
          attribution: "Village of Oak Park 2026 Construction Fees, PLUMBING / PUBLIC WORKS",
        },
        {
          question: "Does a plumbing permit cover the water service too?",
          answer:
            "No. The schedule defers water service work — repairing or replacing an existing service, new connections — to the Water & Sewer Division's separate *Schedule of Water Service Cost and Fees*. Only the sanitary/storm **sewer** connection and the drainage rows are priced on the construction fee schedule this page uses.",
          sourceId: OP_FEE_SCHEDULE_SOURCE_KEY,
          attribution: "Village of Oak Park 2026 Construction Fees",
        },
      ],
      seoTitle: "Oak Park Plumbing Permit Cost ($100 per unit, $175 system)",
      seoDescription:
        "What a Village of Oak Park plumbing permit costs: $100 per unit for alterations, $175 per system installation, $200 flood control, $250 sewer connection, plus the owner-affidavit route.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: OP_LAST_VERIFIED,
    },
  ],

  verifications: [
    {
      entityType: "source",
      entityKey: OP_FEE_SCHEDULE_SOURCE_KEY,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: OP_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: OP_FEE_SCHEDULE_SOURCE_KEY,
      notes:
        "Read with pdftotext, chart transcribed cell by cell (27 use groups × nine construction types) and re-checked: every cell re-read against the PDF, five NP cells confirmed as printed, and the schedule's own arithmetic reproduced (R-3 Type IIIA at $195.98 × .0194 × area). Effective date taken from the ordinance heading on the document's face: 'Construction Fee(s) Effective on March 1st, 2026', updated 01/26/2026.",
    },
    {
      entityType: "source",
      entityKey: OP_PERMITS_PAGE_SOURCE_KEY,
      status: "verified",
      method: "official_portal_check",
      verifiedAt: OP_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: OP_PERMITS_PAGE_SOURCE_KEY,
      notes:
        "Read 2026-09-25, HTTP 200. The authority for the stand-alone trade structure: the page states the separate-permit requirement for electrical and plumbing and gives the reasons, and records the owner-affidavit route for single-family plumbing work.",
    },
    {
      entityType: "fee_schedule",
      entityKey: OP_FEE_SCHEDULE_SOURCE_KEY,
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: OP_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: OP_FEE_SCHEDULE_SOURCE_KEY,
      notes:
        "Every chart cell and both multipliers recomputed with the engine: 238 published cells across 27 use groups and nine construction types, five NP cells excluded, and the two printed minimums ($300 residential, $500 IBC) applied as a floor table on the remodel rule. The published figures ($3,802.01 new, $1,567.84 remodel, $872.32 at the 500-square-foot remodel example) are asserted in tests/content/oakpark-seed.test.ts.",
    },
    {
      entityType: "fee_schedule",
      entityKey: OP_FEE_SCHEDULE_SOURCE_KEY,
      permitTypeKey: "electrical",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: OP_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: OP_FEE_SCHEDULE_SOURCE_KEY,
      notes:
        "Both ELECTRICAL rows recomputed: twelve circuits at $1,200.00, a sub-panel added as a $175.00 system installation, and the two rows stacked to $1,375.00 on one permit.",
    },
    {
      entityType: "fee_schedule",
      entityKey: OP_FEE_SCHEDULE_SOURCE_KEY,
      permitTypeKey: "plumbing",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: OP_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: OP_FEE_SCHEDULE_SOURCE_KEY,
      notes:
        "All four PLUMBING rows recomputed: flood control plus water heater stacked to $375.00 on one permit, five units of alteration work at $500.00, and the sewer connection flat at $250.00 with the refundable deposit named rather than charged.",
    },
    {
      entityType: "permit_page",
      entityKey: "building-permit-cost",
      permitTypeKey: "building",
      status: "verified",
      method: "manual_review",
      verifiedAt: OP_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: OP_FEE_SCHEDULE_SOURCE_KEY,
      notes:
        "Worked example recomputed with the engine: $4,802.01 for the 1,000-square-foot R-3 Type IIIA home with two dwelling units and the per-unit plan review, and each variation quoted in the prose — $1,567.84 as a remodel, $18,385.38 for the I-2 hospital, and the NP cell for I-2 Type IIIB — reproduced before publication.",
    },
    {
      entityType: "permit_page",
      entityKey: "electrical-permit-cost",
      permitTypeKey: "electrical",
      status: "verified",
      method: "manual_review",
      verifiedAt: OP_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: OP_FEE_SCHEDULE_SOURCE_KEY,
      notes:
        "Worked example recomputed: $1,375.00 for twelve circuits plus the sub-panel system, with the per-circuit unit explicitly distinguished from the device count in the notes.",
    },
    {
      entityType: "permit_page",
      entityKey: "plumbing-permit-cost",
      permitTypeKey: "plumbing",
      status: "verified",
      method: "manual_review",
      verifiedAt: OP_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: OP_FEE_SCHEDULE_SOURCE_KEY,
      notes:
        "Worked example recomputed: $375.00 for the flood-control system plus the water heater, with the five-unit alteration and the flat sewer row quoted as variations.",
    },
    {
      entityType: "jurisdiction_profile",
      entityKey: OP_KEYS.jurisdiction,
      status: "verified",
      method: "manual_review",
      verifiedAt: OP_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: OP_FEE_SCHEDULE_SOURCE_KEY,
      notes:
        "The profile's central claim — that Oak Park prices from the ICC chart times a printed multiplier with no valuation field, and issues the trades as separate permits — is read from the schedule's formula row, the chart's own header, and the permits page's separate-permit sentences.",
    },
  ],
};

export const OP_PUBLISHED_PERMIT_PAGES = oakParkSeed.permitPages.filter(
  (page) => page.publishStatus === "published" && !page.noindex,
);
