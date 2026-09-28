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
  ABQ_BUILDING_BASE_RULES,
  ABQ_ELECTRICAL_BASE_RULES,
  ABQ_FEE_EFFECTIVE_FROM,
  ABQ_FAQ_SOURCE_KEY,
  ABQ_FEE_SCHEDULE_SOURCE_KEY,
  ABQ_PLUMBING_BASE_RULES,
  ABQ_UAC_SOURCE_KEY,
} from "./fee-rules";

export * from "./fee-rules";

/**
 * The complete Albuquerque, New Mexico seed payload.
 *
 * Every figure traces to research/new-mexico/albuquerque.md, which traces to Section 112 of
 * the 2024 City of Albuquerque Uniform Administrative Code — Tables 112-A (building),
 * 112-B (electrical) and 112-D (plumbing), §112.2.1's regional modifiers and valuation
 * rules, §112.3's plan review fees and §112.4's investigation fee — corroborated line by
 * line against the Building Safety Division's own fee handout. Nothing is estimated.
 *
 * Three pages, all published: building, electrical and plumbing. The building page carries
 * the schedule Albuquerque is known for — one raw ladder, two modifiers — and the two trade
 * pages carry the per-item tables the same section publishes, whose modifier is 1.0.
 */

const RESEARCHER = "Permit Fee Intelligence research pass 12 (New Mexico)";

export const ABQ_LAST_VERIFIED = "2026-09-25";

export const ABQ_KEYS = {
  state: "nm",
  county: "bernalillo-county",
  jurisdiction: "albuquerque",
  feeSchedule: "albuquerque-umc-section-112-fees",
} as const;

const state: SeedState = {
  code: "NM",
  slug: "new-mexico",
  name: "New Mexico",
  fipsCode: "35",
};

const county: SeedCounty = {
  key: ABQ_KEYS.county,
  slug: "bernalillo-county",
  name: "Bernalillo County",
  fipsCode: "35001",
};

const jurisdiction: SeedJurisdiction = {
  key: ABQ_KEYS.jurisdiction,
  stateKey: ABQ_KEYS.state,
  countyKey: ABQ_KEYS.county,
  type: "city",
  slug: "albuquerque",
  name: "Albuquerque",
  officialName: "City of Albuquerque",
  websiteUrl: "https://www.cabq.gov/",
  permitPortalUrl: "https://www.cabq.gov/planning/online-planning-permitting-applications",
  timezone: "America/Denver",
  isActive: true,
};

const departments: SeedDepartment[] = [
  {
    key: "albuquerque-building-safety-division",
    jurisdictionKey: ABQ_KEYS.jurisdiction,
    kind: "building",
    name: "Planning Department — Building Safety Division",
    phone: "505-924-3320",
    email: null,
    url: "https://www.cabq.gov/planning/building-safety-division/permits",
    addressLine: null,
    hours: "8 a.m. to 5 p.m., Monday to Friday (building permits and plan review); inspections and trade permits counter 7:30 a.m. to 4:30 p.m., Monday to Friday",
    notes:
      "Both counters are reached at 505-924-3320 and both work out of Plaza Del Sol — the permits page links a map of the building, the Division Manager is James Perez at 505-924-3313, and the Division's inspection and trade-permit line keeps the earlier 7:30 a.m. to 4:30 p.m. hours beside the 8-to-5 permit counter. Plaza Del Sol is named on every contact row of the permits page; its street address is not printed there, so the address line is left empty rather than completed from memory. The Division's page also says appointments should be called in for individual attention.",
  },
];

const sources: SeedSource[] = [
  {
    key: ABQ_UAC_SOURCE_KEY,
    jurisdictionKey: ABQ_KEYS.jurisdiction,
    title:
      '2024 City of Albuquerque Uniform Administrative Code — Section 112 "Fees" (Tables 112-A through 112-H, regional modifiers, plan review and investigation fees)',
    url: "https://www.cabq.gov/planning/documents/2024-uac-adopted.pdf",
    sourceType: "municipal_code",
    issuingAuthority: "City of Albuquerque",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2025-01-01",
    effectiveFrom: ABQ_FEE_EFFECTIVE_FROM,
    retrievedAt: ABQ_LAST_VERIFIED,
    lastVerifiedAt: ABQ_LAST_VERIFIED,
    notes:
      "Read 2026-09-25 from the City's own PDF of the 2024 UAC edition, whose Exhibit A states that the technical codes it amends carry an effective date of January 1, 2025. Section 112 read in full: §112.2's instruction that permit fees be set by Table 112-A and the other tables; §112.2.1's estimated-permit-value rule and the modifier schedule (.67 commercial and apartments, .50 one- and two-family and townhouse, 1.0 for Tables 112-B through 112-G, each with a $23.50 minimum on Table 112-A); §112.3's plan review fees (65 percent of the building or sign permit fee, 25 percent of the electrical, mechanical and plumbing permit fee, 'separate fees from the permit fees ... and are in addition to the permit fees'); §112.4's investigation fee for work without a permit; §112.5 on refunds; and Tables 112-A, 112-B and 112-D line by line. The fee tables themselves are printed inside this document — Section 112 collects no fees anywhere else.",
  },
  {
    key: ABQ_FEE_SCHEDULE_SOURCE_KEY,
    jurisdictionKey: ABQ_KEYS.jurisdiction,
    title:
      'City of Albuquerque, "Fee Schedule — Plan Review & Building Permit Handout" (Revised April 2010)',
    url: "https://www.cabq.gov/planning/documents/FeeSchedule.pdf",
    sourceType: "fee_schedule_pdf",
    issuingAuthority: "City of Albuquerque Building Safety Division",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2010-04-01",
    effectiveFrom: null,
    retrievedAt: ABQ_LAST_VERIFIED,
    lastVerifiedAt: ABQ_LAST_VERIFIED,
    notes:
      "Read 2026-09-25. The seven-page handout the Building Safety Division publishes prints Table 112-A already multiplied out, in four columns: commercial (.67), residential (.50), plan review at 65 percent of each, and the totals. Every one of its 335 rows was reproduced from the UAC's raw schedule times the modifier, rounded half up and floored at $23.50 — the check that pinned down both readings this dataset depends on: the minimum applies after the modifier, and the columns are derived rather than independent. Each page of the handout also carries the zoning and hydrology lines ($25 or $45 by square footage, $50) that this site does not charge, and the columns stop at a $321,000 valuation while the UAC's sixth band does not.",
  },
  {
    key: ABQ_FAQ_SOURCE_KEY,
    jurisdictionKey: ABQ_KEYS.jurisdiction,
    title: "City of Albuquerque Building Safety Division — Frequently Asked Questions",
    url: "https://www.cabq.gov/planning/building-safety-division/building-safety-faqs",
    sourceType: "municipal_website",
    issuingAuthority: "City of Albuquerque Building Safety Division",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: ABQ_LAST_VERIFIED,
    lastVerifiedAt: ABQ_LAST_VERIFIED,
    notes:
      'Read 2026-09-25. The Division answers "Plan review fees are paid at the time of submittal. They are 65% of the permit fee, plus zoning and hydrology fees" — the counter-side of §112.3, and the sentence that settled how plan review is modelled here: it is a charge, it is paid up front, and it is on top of the permit. The same page describes FasTrax as "an optional expedited plan review program ... The fee for this expedited service is three times the cost for the standard plan review", and states that fees "are based on the square footage and valuation of the construction project".',
  },
];

/** Empty on purpose: the permit types Albuquerque uses already exist as shared rows. */
const permitTypes: JurisdictionSeed["permitTypes"] = [];
const projectTypes: JurisdictionSeed["projectTypes"] = [];

const jurisdictionPermitTypes: SeedJurisdictionPermitType[] = [
  {
    jurisdictionKey: ABQ_KEYS.jurisdiction,
    permitTypeKey: "building",
    isAvailable: true,
    localName: "Building permit (plan review fee charged with the application)",
    officialUrl: "https://www.cabq.gov/planning/building-safety-division/permits",
    notes:
      "Table 112-A's six-band ladder, multiplied by the §112.2.1 regional modifier — .67 for apartments, public and commercial construction, .50 for one- and two-family dwellings and townhouses including renovations, alterations and additions — with a $23.50 minimum printed beside each modifier. Plan review is 65 percent of the permit fee under §112.3 and is charged in addition to it, paid at submittal.",
  },
  {
    jurisdictionKey: ABQ_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    isAvailable: true,
    localName: "Electrical permit",
    officialUrl: "https://www.cabq.gov/planning/building-safety-division/permits",
    notes:
      "Table 112-B: a $47.00 administrative charge on every application, then per-item rows — meter loops at $40.00, outlets and devices at $1.50 each for the first 20 and $0.90 above, commercial lighting fixtures at $1.50 and $1.00, panels at $8.00, sign connections at $40.00. The §112.2.1 modifier for this table is 1.0, so the printed rates are charged as written, and plan review is 25 percent of the permit fee under §112.3.",
  },
  {
    jurisdictionKey: ABQ_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    isAvailable: true,
    localName: "Plumbing permit",
    officialUrl: "https://www.cabq.gov/planning/building-safety-division/permits",
    notes:
      "Table 112-D: the same $47.00 administrative charge, then $10.00 per plumbing fixture including its drain and vent, $15.00/$30.00 per backflow device by size, $18.00 per meter for a lawn sprinkler system including its backflow protection, and flat rows for water service ($14.00), sewer taps ($18.00), house sewer with 2-way cleanout ($28.00) and septic tanks ($80.00). Modifier 1.0; plan review 25 percent.",
  },
];

const feeSchedules: SeedFeeSchedule[] = [
  {
    key: ABQ_KEYS.feeSchedule,
    jurisdictionKey: ABQ_KEYS.jurisdiction,
    sourceKey: ABQ_UAC_SOURCE_KEY,
    title: "City of Albuquerque Uniform Administrative Code, Section 112 — Fees",
    officialUrl: "https://www.cabq.gov/planning/documents/2024-uac-adopted.pdf",
    effectiveFrom: ABQ_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: ABQ_LAST_VERIFIED,
    notes:
      "One section, and the fee tables live inside it: Table 112-A building, 112-B electrical, 112-C mechanical, 112-D plumbing, 112-E signs, 112-F walls, 112-G re-roof, 112-H general. The modifiers, plan review percentages and investigation fee sit in the same section's prose. The handout the Division publishes is this section worked out for a reader, not a second schedule.",
  },
];

function attach(permitTypeKey: string, rules: SeedFeeRule["rule"][]): SeedFeeRule[] {
  return rules.map((rule) => ({
    jurisdictionKey: ABQ_KEYS.jurisdiction,
    permitTypeKey,
    scheduleKey: ABQ_KEYS.feeSchedule,
    rule,
  }));
}

const feeRules: SeedFeeRule[] = [
  ...attach("building", ABQ_BUILDING_BASE_RULES),
  ...attach("electrical", ABQ_ELECTRICAL_BASE_RULES),
  ...attach("plumbing", ABQ_PLUMBING_BASE_RULES),
];

const requirements: SeedRequirement[] = [
  {
    jurisdictionKey: ABQ_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "document",
    title: "The estimated permit value, and the Building Official's last word on it",
    description:
      'UAC §112.2.1: "The applicant for a permit shall provide an estimated permit value at time of application. Permit valuations shall include total value of work, including materials and labor, for which the permit is being issued, such as electrical, gas, mechanical, plumbing equipment and other building service equipment. If, in the opinion of the Building Official, the valuation is underestimated on the application, the permit shall be denied, unless the applicant can show detailed estimates to meet the approval of the Building Official. Final building permit valuation shall be set by the Building Official." The fee is charged on that figure, and the figure is the City\'s to settle.',
    isMandatory: true,
    sortOrder: 10,
    sourceKey: ABQ_UAC_SOURCE_KEY,
    lastVerifiedAt: ABQ_LAST_VERIFIED,
  },
  {
    jurisdictionKey: ABQ_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "document",
    title: "Plans whenever §§110.2 and 110.3 call for them — and the 65 percent paid with them",
    description:
      'UAC §112.3: "When a plan or other data is required to be submitted by Sections 110.2 and 110.3, a plan review fee shall be paid at the time of submitting plans and specifications for review. Said plan review fee for buildings, signs, or structures shall be 65 percent of the building or sign permit fee as shown in Tables 112-A and 112-E." The same subsection makes the plan review fee "separate fees from the permit fees specified in Section 112.2 and ... in addition to the permit fees", so the money is due at submittal and sits on top of the permit.',
    isMandatory: true,
    sortOrder: 20,
    sourceKey: ABQ_UAC_SOURCE_KEY,
    lastVerifiedAt: ABQ_LAST_VERIFIED,
  },
  {
    jurisdictionKey: ABQ_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "Work started without a permit begins with an investigation, and an extra fee",
    description:
      'UAC §112.4.1: "Whenever any work for which a permit is required by this Code has been commenced without first obtaining a permit, a special investigation may be made before a permit may be issued for such work." §112.4.2 then collects "an investigation fee, in addition to the permit fee ... whether or not a permit is then or subsequently issued", equal to "the amount of the permit fee required by this Code" — a second permit fee, not a fine set by this site.',
    isMandatory: true,
    sortOrder: 30,
    sourceKey: ABQ_UAC_SOURCE_KEY,
    lastVerifiedAt: ABQ_LAST_VERIFIED,
  },
  {
    jurisdictionKey: ABQ_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "other",
    title: "A temporary meter is its own permit",
    description:
      'Table 112-B item 2 prices the meter loop at "$40.00 each" and then prices "(a) Temporary meters (separate permit required) $40.00 each" and "(b) Ganged meters $60.00 per gang" — the schedule says outright that the temporary meter needs its own application, at the same $40.00.',
    isMandatory: false,
    sortOrder: 10,
    sourceKey: ABQ_UAC_SOURCE_KEY,
    lastVerifiedAt: ABQ_LAST_VERIFIED,
  },
  {
    jurisdictionKey: ABQ_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "license",
    title: "A homeowner who wants their own electrical or plumbing permit sits an exam first",
    description:
      'The Building Safety Division\'s permits page: "An electrical or plumbing permit may be issued to a homeowner who successfully completes a written plumbing and/or electrical exam with a score of 75% or greater. If a homeowner cannot obtain the required score, a contractor will be required to request a permit for the work that will be performed. Homeowners will be allowed four (4) hours to complete each exam. Homeowners who do not pass the exam on the first attempt, can retake the exam 30 days later. Only two attempts to pass the exam. Homeowners are only allowed one passing exam a year. A permit will be issued to the homeowner immediately after passing the exam." The same page requires "a licensed contractor ... to obtain a permit" for "all homes leased or rented to others".',
    isMandatory: true,
    sortOrder: 20,
    sourceKey: ABQ_FAQ_SOURCE_KEY,
    lastVerifiedAt: ABQ_LAST_VERIFIED,
  },
  {
    jurisdictionKey: ABQ_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    requirementType: "inspection",
    title: "The sewer tap is its own inspected item",
    description:
      'Table 112-D item 9 charges "$18.00 each" for a "new storm sewer or sanitary sewer tap inspection (connection to public storm or sanitary sewer)" — the City prices the connection as an inspection, which is what makes it a permit row rather than a utility bill, and item 10 charges the house sewer and its 2-way cleanout separately at "$28.00 each".',
    isMandatory: true,
    sortOrder: 10,
    sourceKey: ABQ_UAC_SOURCE_KEY,
    lastVerifiedAt: ABQ_LAST_VERIFIED,
  },
];

const profile: SeedProfile = {
  jurisdictionKey: ABQ_KEYS.jurisdiction,
  headline: "What construction permits cost in Albuquerque",
  summary:
    "Albuquerque prices a building permit off **one raw fee ladder** — Table 112-A of the City's Uniform Administrative Code — and then multiplies the result by a **regional modifier**: .67 for apartments, public and commercial construction, .50 for one- and two-family dwellings and townhouses, renovations and additions included. Each modifier carries a printed **$23.50 minimum**, taken after the multiplication, which is why the commercial column of the City's own handout stops falling below the floor at an $801 valuation and the residential one at $1,201. Plan review is **65% of the permit fee** under §112.3 and is charged in addition to it, paid when the plans are submitted. Electrical and plumbing permits use per-item tables — a $47.00 administrative charge, $1.50 for each of the first 20 outlets, $10.00 for a plumbing fixture including its drain and vent — at a modifier of 1.0, with plan review at 25% of the permit fee.",
  localContext:
    "Albuquerque's fee schedule is one document with three layers, and reading it in order is what keeps the arithmetic honest. The first layer is the raw ladder of Table 112-A, printed once: $23.50 for the first $500 and $3.05 for each additional $100 or fraction to $2,000, $69.25 plus $14.00 per $1,000 to $25,000, $391.75 plus $10.10 to $50,000, $643.75 plus $7.00 to $100,000, then $993.75 for the first $100,000 plus $5.60 for each additional $1,000 or fraction with no upper bound. Nobody pays those numbers. The second layer is §112.2.1's regional modifier, which the legislative body sets: .67 for apartments, public and commercial construction and .50 for one- and two-family dwellings and townhouses — \"including renovations, alterations and additions\" — and 1.0 for every other table in the section. The third layer is the $23.50 minimum, printed in parentheses beside each Table 112-A modifier.\n\nThat structure means the published handout and the code are the same thing computed twice. The Division's \"Plan Review and Building Permit Fees\" handout prints the four columns a reader would want — commercial, residential, and the 65 percent plan review against each — and every one of its 335 rows is the raw ladder times the modifier, rounded half up, floored at $23.50. This site computes that product directly, which has one consequence worth knowing: the handout stops at a $321,000 valuation because its typesetting stopped, while the UAC's sixth band does not end. Valuations above the handout's last row are extended by the City's own $5.60-per-$1,000 formula rather than by an invented bracket, and the page says so.\n\nPlan review is where Albuquerque differs from cities that fold it into the permit. §112.3 charges it \"at the time of submitting plans and specifications for review\", states the percentages — 65 percent of the building or sign permit fee, 25 percent of the electrical, mechanical and plumbing permit fee — and then says the part that matters: these are \"separate fees from the permit fees specified in Section 112.2 and are in addition to the permit fees\". The Building Safety Division's FAQ says the same thing from the counter: \"Plan review fees are paid at the time of submittal. They are 65% of the permit fee, plus zoning and hydrology fees.\" So it is a real charge on this site, gated behind the plan-review input rather than assumed, because §112.3 only charges it when §§110.2 and 110.3 require plans to be submitted.\n\nTwo smaller mechanics are worth carrying into any reading of the tables. Work started without a permit does not just get priced: §112.4.2 collects an investigation fee \"in addition to the permit fee\", equal to the permit fee itself, \"whether or not a permit is then or subsequently issued\" — a second permit fee by the code's own definition. And the trade tables are not on the modifier's schedule: §112.2.1 sets the electrical, mechanical, plumbing, sign, wall and re-roof modifiers all at 1.0, so Table 112-B and Table 112-D rows are charged exactly as printed.",
  valuationBasis:
    "The basis is **valuation**, and §112.2.1 defines it in the applicant's own words before giving the City the last one: \"The applicant for a permit shall provide an estimated permit value at time of application. Permit valuations shall include total value of work, including materials and labor, for which the permit is being issued, such as electrical, gas, mechanical, plumbing equipment and other building service equipment.\" The same subsection lets the Building Official reject an estimate that looks low — the permit \"shall be denied, unless the applicant can show detailed estimates to meet the approval of the Building Official\" — and closes with \"Final building permit valuation shall be set by the Building Official.\" Table 112-A's left column is headed TOTAL VALUATION, and the fee is charged on that figure, never on a square-footage rate: there is no square-foot fee basis anywhere in Section 112.\n\nThe trade tables do not use valuation at all. Table 112-B is priced per device and per item — outlets, fixtures, panels, meter loops, sign connections — and Table 112-D per fixture, per device and per flat connection, which is why a $400 service upgrade and a $400,000 office remodel can carry the same $47.00 administrative charge plus the same per-item rows. Valuation enters the electrical and plumbing pages only through the 25 percent plan review, which is a percentage of the permit fee the item rows produce.",
  notIncluded:
    "These figures are Albuquerque's Table 112-A building fees with the regional modifiers, the Table 112-B and 112-D trade rows, the plan review percentages §112.3 sets, and the §112.4 investigation fee when work started without a permit. They are not a total project cost, and they exclude:\n\n- **The zoning and hydrology fees** the handout prints under every page of its table — \"Zoning: $25 < 4000sqft or $45 > 4000sqft\" and \"Hydrology: $50\". Real charges on a plan-reviewed permit, but the schedule never says what the 4,000 square feet is measured on — lot, floor area or review area — and that ambiguity is the whole fee, so they are named rather than charged.\n- **The other fee tables in Section 112**: mechanical (112-C), signs (112-E), walls (112-F) and re-roofing (112-G), all published in the same section and attached to no page here.\n- **Demolition, certificates and occupancy**: demolition \"up to and including 1500 sq. ft. of floor area\" at $47.00 plus $10.00 for each additional 500 square feet or fraction, a temporary certificate of occupancy at $50.00, and a certificate of occupancy at $100.00.\n- **The hourly and recheck review charges** §112.3 and Table 112-A publish: inspections outside normal business hours and inspections with no stated fee at $47.00 an hour with a two-hour minimum, additional plan review for changes and revisions at the same $47.00 an hour, rechecking lost or worn-out plans and duplicate plan sets at half the plan check fee, and preliminary and integrated plan review at $75.00 an hour. Albuquerque's re-inspection under §113.5.8 is $47.00 each on the building table and $47.00 an hour on the trade tables — the schedule prints it differently for each, and only the building row is charged here.\n- **FasTrax**, the Division's optional expedited plan review: \"three times the cost for the standard plan review\", per its own FAQ.\n- **Electrical rows rated by equipment**: motor operated equipment, evaporative coolers, residential fixed appliances, transformers, space heating equipment, communication and signal systems, pre-final inspections and swimming pools — all published in Table 112-B, all priced per horsepower, per unit or per pool, none collected by an input on this site.\n- **Plumbing rows not collected here**: gas line tests, temporary gas, water distribution systems, atmospheric vacuum breakers by count, sewer repair in a public street, roof drains, swimming pools, the fire-protection rows (automatic extinguishing systems, standpipes), utility service lines, fire hydrant inspections, interceptors and sewer ejector pumps, and the catch-all fixture row.\n- **Anything another authority charges** — the utility's own service and tap charges where they are not City permit rows, State licensing, and the Construction Industries Division's statewide jurisdiction.",
  seoTitle: "Albuquerque construction permit fees",
  seoDescription:
    "How Albuquerque prices construction permits — Table 112-A's six bands times the .67 or .50 regional modifier with a $23.50 minimum, 65% plan review, and $47 plus per-item rows on electrical and plumbing permits.",
  publishStatus: "published",
  noindex: false,
  lastReviewedAt: ABQ_LAST_VERIFIED,
};

const permitPages: SeedPermitPage[] = [
  {
    jurisdictionKey: ABQ_KEYS.jurisdiction,
    permitTypeKey: "building",
    slug: "building-permit-cost",
    title: "Albuquerque building permit cost",
    intro:
      "Albuquerque's building permit fee is **one published ladder, priced twice**. Table 112-A of the City's Uniform Administrative Code runs $23.50 for the first $500 of valuation and $3.05 for each additional $100 or fraction to $2,000, then $69.25 plus $14.00 per $1,000 to $25,000, $391.75 plus $10.10 to $50,000, $643.75 plus $7.00 to $100,000, and above that $993.75 for the first $100,000 plus $5.60 for each additional $1,000 or fraction — and then §112.2.1 multiplies the result by the **Albuquerque regional modifier**: .67 for apartments, public and commercial construction, .50 for one- and two-family dwellings and townhouses including renovations, alterations and additions. A printed **$23.50 minimum** applies after the multiplication. When plans must be submitted, plan review is **65% of the permit fee** and §112.3 charges it in addition to the permit.",
    localSummary:
      "The modifier is the first thing to settle, and it is about construction rather than about occupancy: a three-unit apartment building is on the .67 side even though the building is full of dwellings, because §112.2.1 writes \"apartments, public and commercial construction\" on one side and \"one- and two-family dwelling and town-house construction\" on the other. On the same $250,000 valuation the two sides are $1,228.61 and $916.88 — a difference of more than a third for a question that has nothing to do with how big the building is.\n\nThe $23.50 floor is the second. It is applied after the modifier, which the City's own handout shows by crossing the floor at different valuations on each side: the commercial column first exceeds $23.50 at an $801 valuation, the residential one at $1,201. Below those points the fee is $23.50 on either side.\n\nPlan review is the third. §112.3 makes it \"65 percent of the building or sign permit fee\" and then says the fee is \"separate ... and in addition to\" the permit fee — so a $1,228.61 permit with plans carries $798.60 of plan review on top, paid when the plans go in, not credited back when the permit issues.",
    notIncluded:
      "This is the Table 112-A building fee with the regional modifier, the 65% plan review §112.3 charges, and the §112.4 investigation fee when work started without a permit. It excludes:\n\n- **Zoning and hydrology review**, which the handout prints as \"Zoning: $25 < 4000sqft or $45 > 4000sqft\" and \"Hydrology: $50\" — charged on plan-reviewed permits, but the schedule never says what the square footage is measured on.\n- **Demolition**: $47.00 up to and including 1,500 square feet of floor area plus $10.00 for each additional 500 square feet or fraction, published under Other Inspections and Fees in Table 112-A.\n- **Certificates**: a temporary certificate of occupancy at $50.00 and a certificate of occupancy at $100.00, both issued at the end of the work.\n- **The hourly review charges**: additional plan review for changes, additions and revisions to approved plans at $47.00 an hour with a two-hour minimum, rechecking lost or worn-out plans and duplicate plan sets at half the plan check fee, and preliminary and integrated plan review at $75.00 an hour.\n- **FasTrax**, the optional expedited plan review at \"three times the cost for the standard plan review\", and **third-party plan review** where the Division allows it.\n- **The mechanical, sign, wall and re-roof schedules** — Tables 112-C, 112-E, 112-F and 112-G of the same section, which a full permit often carries alongside this one.\n- **The rest of the bill that is not a City fee**: plan review is charged here only when you say plans are being submitted, zoning and hydrology are not charged at all, and any utility or State charge sits outside Section 112.",
    workedExample: {
      scenario:
        "A new commercial office building valued at $250,000, with plans submitted for review, in a construction class other than a one- or two-family dwelling or townhouse.",
      inputs: {
        valuationCents: 25_000_000,
        occupancy: "commercial",
        workType: "new_construction",
        custom: { one_two_family: false, plan_review: true },
      },
      notes:
        "The raw ladder prices $250,000 with its sixth band: $993.75 for the first $100,000, plus $5.60 for each of the 150 remaining thousands — $993.75 + $840.00 = $1,833.75. The commercial modifier takes .67 of that, rounded half up: $1,228.61, comfortably above the $23.50 floor. Plan review is 65 percent of $1,228.61, which is $798.60, and §112.3 puts it on top rather than inside the permit: the bill at submittal is $2,027.36.\n\nThe residential side of the same valuation is worth seeing next to it. The same $1,833.75 raw figure at .50 is $916.88 — and had this been a one- or two-family dwelling, plan review would have been $595.97 rather than $798.60, for a total of $1,512.85. The modifier changes the permit fee by more than $300 on this job alone.\n\nNothing in this example touches the $23.50 minimum, which would matter on a permit under an $801 commercial or $1,201 residential valuation: the handout's own columns show both sides sitting at exactly $23.50 below those points.",
    },
    faqs: [
      {
        question: "How does Albuquerque calculate a building permit fee?",
        answer:
          "Table 112-A prices the valuation in six bands — $23.50 for the first $500 plus $3.05 per $100 or fraction to $2,000, $69.25 plus $14.00 per $1,000 to $25,000, $391.75 plus $10.10 to $50,000, $643.75 plus $7.00 to $100,000, and $993.75 plus $5.60 per $1,000 above $100,000 — and §112.2.1 then multiplies the result by the Albuquerque regional modifier: .67 for apartments, public and commercial construction, .50 for one- and two-family dwellings and townhouses. A $23.50 minimum applies after the multiplication.",
        sourceId: ABQ_UAC_SOURCE_KEY,
      },
      {
        question: "What is the Albuquerque regional modifier?",
        answer:
          'A multiplier the legislative body sets on top of the published table, stated in §112.2.1: "The Albuquerque Regional Modifier for Table 112-A Building Permit Fees shall be (.67) for apartments, public and commercial construction" and "(.50) for one- and two-family dwelling and town-house construction, including renovations, alterations and additions." Every other table in Section 112 — electrical, mechanical, plumbing, sign, wall and re-roof — carries a modifier of 1.0.',
        sourceId: ABQ_UAC_SOURCE_KEY,
      },
      {
        question: "What is the minimum building permit fee in Albuquerque?",
        answer:
          "$23.50, printed in §112.2.1 beside each Table 112-A modifier as \"(Minimum fee shall be $23.50.)\" — and the minimum is taken after the modifier, not before it. That is why the City's own fee handout shows the commercial column first rising above the floor at an $801 valuation and the residential column at $1,201: the same raw fee multiplied by different factors crosses the same floor at different places.",
        sourceId: ABQ_UAC_SOURCE_KEY,
      },
      {
        question: "What valuation is the fee charged on?",
        answer:
          'The estimated permit value the applicant provides, in §112.2.1\'s words: "Permit valuations shall include total value of work, including materials and labor, for which the permit is being issued, such as electrical, gas, mechanical, plumbing equipment and other building service equipment." If the Building Official thinks it is underestimated the permit is denied unless detailed estimates support it, and "Final building permit valuation shall be set by the Building Official."',
        sourceId: ABQ_UAC_SOURCE_KEY,
      },
      {
        question: "Is plan review an extra fee?",
        answer:
          'Yes, and the code is explicit about it. §112.3 sets the plan review fee at "65 percent of the building or sign permit fee" and adds that "The plan review fees specified in this subsection are separate fees from the permit fees specified in Section 112.2 and are in addition to the permit fees." The Building Safety Division puts it the same way from the counter: "Plan review fees are paid at the time of submittal. They are 65% of the permit fee, plus zoning and hydrology fees."',
        sourceId: ABQ_FAQ_SOURCE_KEY,
      },
      {
        question: "What happens if work was done without a permit?",
        answer:
          '§112.4.1 lets a special investigation be made before a permit may issue, and §112.4.2 collects "an investigation fee, in addition to the permit fee ... whether or not a permit is then or subsequently issued", equal to "the amount of the permit fee required by this Code" — the permit fee once more, on its own line, with the same $23.50 minimum the tables set.',
        sourceId: ABQ_UAC_SOURCE_KEY,
      },
    ],
    seoTitle: "Albuquerque NM building permit cost: Table 112-A × the regional modifier",
    seoDescription:
      "Albuquerque, New Mexico building permit fees — the six-band Table 112-A ladder times the .67 or .50 regional modifier, a $23.50 minimum after the multiplication, and 65% plan review charged in addition.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: ABQ_LAST_VERIFIED,
  },
  {
    jurisdictionKey: ABQ_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    slug: "electrical-permit-cost",
    title: "Albuquerque electrical permit cost",
    intro:
      "Albuquerque prices electrical work **by the item, not by the value of the job**, and the regional modifier does not touch it: §112.2.1 sets the Table 112-B modifier at 1.0, so the printed rates are the charged rates. Every application starts with a **$47.00 administrative charge**, then the table's own rows: meter loops at $40.00 each, outlets — communication and signal points, fixtures, switches and receptacles — at **$1.50 each for the first 20 and $0.90 each above**, commercial lighting fixtures at $1.50 and $1.00, panels at $8.00 and sign connections at $40.00. When plans are required, §112.3 adds **25% of the permit fee** as a separate plan review charge.",
    localSummary:
      "The two over-twenty rates are different, and the difference is published rather than accidental: outlets drop to $0.90 each above the first 20, while commercial lighting fixtures drop only to $1.00. A job with 40 outlets and 40 lighting fixtures pays $30.00 + $18.00 and $30.00 + $20.00 respectively — the same counts, two schedules, two totals.\n\nThe fixture count has a definition worth knowing before quoting it. Table 112-B's note says \"When fluorescent lighting is installed in continuous rows, each unit shall be considered a separate fixture\" and \"The term fixture shall be interpreted to mean the lighting device at any outlet\" — so a continuous run of troffers counts by unit, not by run.\n\nPlan review for electrical is a different percentage from the building page's: §112.3 charges 25 percent of the total permit fee for electrical, mechanical and plumbing, against 65 percent for buildings — and it is charged the same way, separately and in addition, at submittal.",
    notIncluded:
      "This is Table 112-B's administrative charge and per-item rows, with the 25% plan review §112.3 charges when plans are required. It excludes:\n\n- **Motor operated equipment, evaporative coolers, residential fixed appliances, transformers, space heating equipment, communication and signal systems, pre-final inspections and swimming pools**, all rows of the same table priced per horsepower, per unit or per pool — published, not collected here, because no input on this site takes a horsepower or a pool count.\n- **Temporary meters**, which Table 112-B item 2(a) says require \"(separate permit required)\" at the same $40.00, and **ganged meters** at $60.00 per gang — named on the meter loop row rather than charged as their own permits.\n- **The hourly charges on the trade table**: installation for which no fee is prescribed, re-inspection under §113.5.8, and overtime or after-hour inspections, all $47.00 an hour with a two-hour minimum. The building table prints re-inspection as $47.00 each; the trade tables print it per hour, and neither is charged on this page.\n- **Zoning and hydrology review** ($25 or $45 by square footage, $50), which the fee handout prints under its building columns and which belongs to plan review as a whole.\n- **FasTrax** at three times the standard plan review fee, and **third-party plan review** where the Division allows it.\n- **Anything charged by another authority** — the Construction Industries Division's State licensing and examinations, and utility fees for service and connection work that are not City permit rows.",
    workedExample: {
      scenario:
        "A permit for 40 outlets and devices, 12 commercial lighting fixtures and one panel, with plans submitted for review.",
      inputs: {
        custom: { outlets: 40, lighting_fixtures: 12, panels: 1, plan_review: true },
      },
      notes:
        "The administrative charge opens every application at $47.00. The 40 outlets split at the table's own seam: the first 20 at $1.50 is $30.00, the next 20 at $0.90 is $18.00. Twelve lighting fixtures at $1.50 is $18.00 — under the first-20 rate, so the over-twenty dollar does not enter. One panel is $8.00. The permit fee is $121.00, and plan review at 25 percent of it is $30.25 — a total of $151.25 at submittal.\n\nNotice what does not appear: a valuation. This page never asks what the job is worth, because Table 112-B does not price by worth — $1,000 of electrical work and $100,000 of it carry the same rows. The 40th outlet costs $0.90 whether it belongs to a kitchen refresh or a data centre.\n\nThe §112.4 investigation fee is the one line that could double this: if the work had already been started without a permit, §112.4.2 collects an investigation fee equal to the permit fee — another $121.00 here, on top of it, with plan review still separate.",
    },
    faqs: [
      {
        question: "How is an Albuquerque electrical permit fee calculated?",
        answer:
          "A $47.00 administrative charge applies to every application, then Table 112-B's per-item rows are charged as printed: $40.00 a meter loop, $1.50 each for the first 20 outlets and $0.90 each above, $1.50 each for the first 20 commercial lighting fixtures and $1.00 each above, $8.00 a panel, $40.00 a sign connection. Plan review, when required, is 25 percent of that permit fee.",
        sourceId: ABQ_UAC_SOURCE_KEY,
      },
      {
        question: "Does the regional modifier apply to electrical permits?",
        answer:
          'No. §112.2.1 sets the modifier for every table except 112-A at 1.0: "The Albuquerque regional modifier for Table 112-B Electrical Permit Fees shall be (1.0)." The .67 and .50 modifiers are building-permit modifiers, and the electrical rates are charged exactly as the table prints them.',
        sourceId: ABQ_UAC_SOURCE_KEY,
      },
      {
        question: "How are outlets and lighting fixtures charged above twenty?",
        answer:
          'Table 112-B splits both rows in two, at different rates: outlets (communication and signal, fixtures, switches and receptacles) are "(a) First 20 — $1.50 each" and "(b) All over 20 — $0.90 each"; commercial lighting fixtures are "(a) First 20 — $1.50 each" and "(b) All over 20 — $1.00 each". Forty outlets are $48.00 and forty lighting fixtures are $50.00.',
        sourceId: ABQ_UAC_SOURCE_KEY,
      },
      {
        question: "Is plan review 65 percent for electrical too?",
        answer:
          "No — 65 percent is the building and sign rate. §112.3 sets the electrical, mechanical and plumbing plan review fee at \"25 percent of the total permit fee as set forth in Tables 112-B, 112-C, and 112-D\", and charges it the same way: separate from the permit fee and in addition to it, paid when plans are submitted.",
        sourceId: ABQ_UAC_SOURCE_KEY,
      },
      {
        question: "Are motors, transformers and swimming pools priced here?",
        answer:
          "No. Table 112-B publishes rows for motor operated equipment by horsepower, evaporative coolers, residential fixed appliances, transformers, space heating equipment per 1,000 watts, communication and signal systems, pre-final inspections and public and private swimming pools — and this page does not collect a horsepower, a wattage or a pool, so those rows are named rather than charged.",
        sourceId: ABQ_UAC_SOURCE_KEY,
      },
    ],
    seoTitle: "Albuquerque NM electrical permit cost: $47 + $1.50 an outlet",
    seoDescription:
      "Albuquerque, New Mexico electrical permit fees — the $47.00 administrative charge, $1.50 per outlet for the first 20 and $0.90 above, $8.00 a panel, no regional modifier, and 25% plan review.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: ABQ_LAST_VERIFIED,
  },
  {
    jurisdictionKey: ABQ_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    slug: "plumbing-permit-cost",
    title: "Albuquerque plumbing permit cost",
    intro:
      "Albuquerque's plumbing permit is Table 112-D: a **$47.00 administrative charge** on every application, then **$10.00 for each plumbing fixture including its drain and vent**, $15.00 for a backflow protective device of two inches or smaller and $30.00 above that size, $18.00 for a lawn sprinkler system on any one meter including its backflow protection, and flat rows for the connections a job makes — **$14.00** from the property line to the building for a water service, **$18.00** for a new storm or sanitary sewer tap, **$28.00** for the house sewer with its 2-way cleanout, and $80.00 for a septic tank or cesspool. The regional modifier does not apply (§112.2.1 sets Table 112-D at 1.0), and plan review is **25% of the permit fee** when plans are required.",
    localSummary:
      "The fixture row is the spine of this table, and its wording is the whole definition: \"Plumbing fixture includes drain and vent — $10.00 each.\" One fixture, and its drain and vent are inside the price — there is no separate venting row and no per-fixture plan-review multiplier to add.\n\nThe sprinkler and backflow rows are the ones that interact. A lawn sprinkler system is priced per meter at $18.00 \"including backflow protection devices thereof\", and atmospheric-type vacuum breakers that are not covered by that row have their own ladder ($15.00 for one through five, $3.00 each above five). Every other backflow protective device — the testable kind — is $15.00 at two inches or smaller and $30.00 above, charged for a repair exactly as for an installation: the table says \"(ALSO FOR REPAIR)\".\n\nThe connection rows are flat and separate, which is what makes a new build's plumbing permit predictable: $14.00 for the water service, $18.00 for the tap into the public sewer, $28.00 for the house sewer to the property line with its 2-way cleanout. They are three rows because they are three inspections, and the tap row is worded as one — \"For new storm sewer or sanitary sewer tap inspection\".",
    notIncluded:
      "This is Table 112-D's administrative charge, fixture, backflow, sprinkler, connection and septic rows, with the 25% plan review §112.3 charges when plans are required. It excludes:\n\n- **Gas work priced by the other rows of the same table**: gas line tests with no outlets or appliances ($10.00), recording chart and other high-pressure tests ($16.00) and temporary gas for heating ($40.00, not allowed before October 1 or after April 30 and never beyond 90 days). Gas outlets at $6.00 each are charged here; the tests are named rather than charged because this site has no input for a line test.\n- **Water distribution systems**, including pool filling systems with their backflow prevention, at $14.00 each — the row parallel to the water service row this page does charge, left off because the schedule does not distinguish a distribution system from a service by any fact this site asks for.\n- **Atmospheric-type vacuum breakers** by count ($15.00 for one through five, $3.00 each above five), **sewer repair in a public street** ($16.00), **roof drains** ($12.00 each), **public and private swimming pools** ($80.00 and $60.00) and the **fire-protection rows** — automatic fire extinguishing systems, type I hoods, wet and dry standpipes and combination standpipes, plus utility service lines, fire hydrant inspections, interceptors and sewer ejector pumps, and the catch-all fixture row for anything the Code requires that no other row covers.\n- **The hourly trade charges**: installation with no prescribed fee, re-inspection under §113.5.8 and overtime or after-hour inspections at $47.00 an hour with a two-hour minimum — printed per hour on the trade tables, where the building table prints re-inspection as $47.00 each.\n- **Zoning and hydrology review** and **FasTrax** at three times the standard plan review fee, both named on the building page rather than repeated as charges.\n- **Anything charged by another authority**: the utility's own fees for service and meter work, State licensing for the trades, and the Construction Industries Division's statewide jurisdiction.",
    workedExample: {
      scenario:
        "A permit for eight plumbing fixtures, two backflow protective devices of two inches or smaller, one lawn sprinkler system on a meter, with plans submitted for review.",
      inputs: {
        fixtures: 8,
        custom: { backflow_devices: 2, meters: 1, plan_review: true },
      },
      notes:
        "Four rows price this job before plan review: the $47.00 administrative charge, eight fixtures at $10.00 including their drains and vents ($80.00), one lawn sprinkler meter at $18.00 with its backflow protection included, and two backflow devices at $15.00 each ($30.00) — the devices are two inches or smaller, and the size is the only thing the table asks about them. The permit fee is $175.00, plan review at 25 percent is $43.75, and the total at submittal is $218.75.\n\nTwo things are worth noticing. The sprinkler row already carries its backflow protection, so the two devices charged separately are the testable ones elsewhere on the job — if they belonged to the sprinkler system they would be inside the $18.00. And had the devices been over two inches, the same permit would be $175.00 + $60.00 instead of $30.00 for those two rows, which changes plan review to $58.50 and the total to $293.50.\n\nValuation never enters this page. Eight fixtures in a $50,000 repair and eight fixtures in a $500,000 renovation carry the same $175.00 permit fee, because Table 112-D prices fixtures and connections rather than work.",
    },
    faqs: [
      {
        question: "How is an Albuquerque plumbing permit fee calculated?",
        answer:
          "A $47.00 administrative charge applies to every application, then Table 112-D's rows are charged as printed: $10.00 per plumbing fixture including its drain and vent, $15.00/$30.00 per backflow device by size, $18.00 per meter for a lawn sprinkler system, and $14.00/$18.00/$28.00 for water service, sewer tap and house sewer connections. Plan review, when required, is 25 percent of that permit fee.",
        sourceId: ABQ_UAC_SOURCE_KEY,
      },
      {
        question: "What counts as a plumbing fixture?",
        answer:
          'The table\'s own definition: "Plumbing fixture includes drain and vent — $10.00 each." The fixture, its drain and its vent are one $10.00 row, and no other row in Table 112-D charges for them separately.',
        sourceId: ABQ_UAC_SOURCE_KEY,
      },
      {
        question: "How are backflow devices charged?",
        answer:
          'Two rows, and the size decides. "For each backflow protective device other than atmospheric-type vacuum breakers: (ALSO FOR REPAIR) 2 inches and smaller — $15.00; over 2 inches — $30.00." Atmospheric-type vacuum breakers that are not part of a lawn sprinkler system are priced differently again — $15.00 for one through five and $3.00 each above five — and a lawn sprinkler system\'s backflow protection is already inside its own $18.00 meter row.',
        sourceId: ABQ_UAC_SOURCE_KEY,
      },
      {
        question: "Does the regional modifier apply to plumbing permits?",
        answer:
          'No. §112.2.1 sets the modifier for Table 112-D — and for the mechanical, sign and wall tables — at 1.0: "The Albuquerque regional modifier for Table 112-D Plumbing Permit Fees shall be (1.0)." The .67 and .50 modifiers belong to the building table alone.',
        sourceId: ABQ_UAC_SOURCE_KEY,
      },
      {
        question: "Is plan review 65 percent for plumbing too?",
        answer:
          "No — that is the building and sign rate. §112.3 sets electrical, mechanical and plumbing plan review at \"25 percent of the total permit fee as set forth in Tables 112-B, 112-C, and 112-D\", and makes it a separate fee, in addition to the permit fee, paid when plans are submitted.",
        sourceId: ABQ_UAC_SOURCE_KEY,
      },
    ],
    seoTitle: "Albuquerque NM plumbing permit cost: $10 a fixture",
    seoDescription:
      "Albuquerque, New Mexico plumbing permit fees — the $47.00 administrative charge, $10 per fixture including drain and vent, $15/$30 backflow devices, $18 per sprinkler meter, and 25% plan review.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: ABQ_LAST_VERIFIED,
  },
];

const verifications: SeedVerification[] = [
  {
    entityType: "source",
    entityKey: ABQ_UAC_SOURCE_KEY,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: ABQ_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: ABQ_UAC_SOURCE_KEY,
    notes:
      "Read 2026-09-25 from the City's own PDF. Section 112 transcribed in full: §112.2's table instruction, §112.2.1's estimated-permit-value rule and the modifier schedule including the 1.0 modifiers for Tables 112-B through 112-G, §112.3's plan review percentages and its 'in addition to' sentence, §112.4's investigation fee, §112.5's refunds, and Tables 112-A, 112-B and 112-D line by line — including the Other Inspections and Fees tails, where 112-A prints re-inspection at $47.00 each and the trade tables print $47.00 per hour.",
  },
  {
    entityType: "source",
    entityKey: ABQ_FEE_SCHEDULE_SOURCE_KEY,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: ABQ_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: ABQ_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "Read 2026-09-25. All 335 rows reproduced from the UAC's raw schedule times .67 and .50, rounded half up, floored at $23.50 — zero mismatches, which fixed the two readings this dataset depends on: the minimum is applied after the modifier (the columns cross the floor at $801 and $1,201), and the handout's plan review column is derived from the permit column. Its zoning and hydrology footers were transcribed verbatim and deliberately not charged.",
  },
  {
    entityType: "source",
    entityKey: ABQ_FAQ_SOURCE_KEY,
    status: "verified",
    method: "manual_review",
    verifiedAt: ABQ_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: ABQ_FAQ_SOURCE_KEY,
    notes:
      'Read 2026-09-25. The plan review sentence quoted verbatim ("Plan review fees are paid at the time of submittal. They are 65% of the permit fee, plus zoning and hydrology fees"), FasTrax\'s three-times fee, and the homeowner exam rules from the Division\'s permits page — 75 percent to pass, four hours, two attempts thirty days apart, one passing exam a year — which are what the electrical page\'s contractor requirement is built from.',
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-COMMERCIAL-TABLE",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: ABQ_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: ABQ_UAC_SOURCE_KEY,
    notes:
      '§112.2.1: "The Albuquerque Regional Modifier for Table 112-A Building Permit Fees shall be (.67) for apartments, public and commercial construction. (Minimum fee shall be $23.50.)" The rule stores the six-band raw ladder times .67 with the floor taken after the multiplication — the construction the handout\'s commercial column reproduces row for row.',
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-RESIDENTIAL-TABLE",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: ABQ_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: ABQ_UAC_SOURCE_KEY,
    notes:
      '§112.2.1: "shall be (.50) for one- and two-family dwelling and town-house construction, including renovations, alterations and additions. (Minimum fee shall be $23.50)." The inclusion of renovations, alterations and additions is why this is a construction-class condition rather than an occupancy one — an addition to a house stays on the .50 side whatever the work is called elsewhere.',
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-PLAN-REVIEW",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: ABQ_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: ABQ_UAC_SOURCE_KEY,
    notes:
      '§112.3: "Said plan review fee for buildings, signs, or structures shall be 65 percent of the building or sign permit fee as shown in Tables 112-A and 112-E" and "The plan review fees specified in this subsection are separate fees from the permit fees specified in Section 112.2 and are in addition to the permit fees." Charged as its own component on the permit fee, gated behind the plan-review input because §112.3 opens with "When a plan or other data is required to be submitted by Sections 110.2 and 110.3".',
  },
  {
    entityType: "fee_rule",
    entityKey: "ELEC-OUTLETS-OVER-20",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: ABQ_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: ABQ_UAC_SOURCE_KEY,
    notes:
      'Table 112-B item 3: "(a) First 20 — $1.50 each; (b) All over 20 — $0.90 each", against item 4\'s "(b) All over 20 — $1.00 each" for commercial lighting fixtures. The 10-cent difference between two rows that otherwise match is the schedule\'s, cross-checked against the City\'s historical electrical table, where the same two rows are $0.45 and $0.50.',
  },
  {
    entityType: "fee_rule",
    entityKey: "PLUMB-FIXTURES",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: ABQ_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: ABQ_UAC_SOURCE_KEY,
    notes:
      'Table 112-D item 6: "Plumbing fixture includes drain and vent — $10.00 each." One rate covering fixture, drain and vent, which is the row the whole plumbing page is counted on.',
  },
  {
    entityType: "permit_page",
    entityKey: "building-permit-cost",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: ABQ_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: ABQ_UAC_SOURCE_KEY,
    notes:
      "Gate-checked 2026-09-25: the six-band Table 112-A ladder times the §112.2.1 regional modifier with the $23.50 floor taken after the multiplication, the 65 percent plan review of §112.3 charged in addition, and the §112.4 investigation fee — every figure read from Section 112 of the City's own UAC PDF.",
  },
  {
    entityType: "permit_page",
    entityKey: "electrical-permit-cost",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: ABQ_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: ABQ_UAC_SOURCE_KEY,
    notes:
      "Gate-checked 2026-09-25: Table 112-B's per-item rows — the $47.00 administrative charge, outlets first-20/over-20, lighting fixtures, panels, meter loops and sign connections — with the trade tables at modifier 1.0 and §112.3's 25 percent plan review, read line by line from Section 112.",
  },
  {
    entityType: "permit_page",
    entityKey: "plumbing-permit-cost",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: ABQ_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: ABQ_UAC_SOURCE_KEY,
    notes:
      "Gate-checked 2026-09-25: Table 112-D's fixture, backflow, sprinkler-meter, connection and septic rows at modifier 1.0, plus §112.3's 25 percent plan review — read line by line from Section 112 of the City's own UAC PDF.",
  },
  {
    entityType: "jurisdiction_profile",
    entityKey: ABQ_KEYS.jurisdiction,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: ABQ_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: ABQ_UAC_SOURCE_KEY,
    notes:
      "Hub content built from Section 112 and checked against the Division's handout and FAQ. The profile records the three readings the model depends on — the minimum applies after the modifier, plan review is a separate charge in addition to the permit, and the trade tables sit at modifier 1.0 — and states what is not charged: zoning and hydrology, the other fee tables, the hourly review charges and FasTrax.",
  },
];

export const albuquerqueSeed: JurisdictionSeed = {
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
export const ALBUQUERQUE_PUBLISHED_PERMIT_PAGES = albuquerqueSeed.permitPages.filter(
  (page) => page.publishStatus === "published" && !page.noindex,
);
