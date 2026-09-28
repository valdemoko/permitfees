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
  NASHUA_BUILDING_BASE_RULES,
  NASHUA_CODE_FEES_SOURCE_KEY,
  NASHUA_COSTS_PAGE_SOURCE_KEY,
  NASHUA_ELECTRICAL_BASE_RULES,
  NASHUA_ELECTRICAL_FORM_SOURCE_KEY,
  NASHUA_FEE_EFFECTIVE_FROM,
  NASHUA_ORDINANCE_SOURCE_KEY,
  NASHUA_PERMITS_PAGE_SOURCE_KEY,
  NASHUA_PLUMBING_BASE_RULES,
  NASHUA_PLUMBING_FORM_SOURCE_KEY,
} from "./fee-rules";

export * from "./fee-rules";

/**
 * The complete Nashua, New Hampshire seed payload.
 *
 * Every figure traces to research/new-hampshire/nashua.md, which traces to Chapter 105
 * Article VIII of the Nashua Revised Ordinances as consolidated by the codifier. Nothing is
 * estimated.
 *
 * Nashua is the counterpart to Manchester in this state and prices the trades the opposite
 * way round: Manchester charges a percentage of the estimated cost of the work, and Nashua
 * charges published measurements — square feet of area affected, fixtures counted one by
 * one, outlets, amperes of service. Both put the whole schedule in the municipal code, and
 * neither publishes a separate fee document.
 */

const RESEARCHER = "Permit Fee Intelligence research pass 10 (New Hampshire)";

export const NASHUA_LAST_VERIFIED = "2026-09-25";

export const NASHUA_KEYS = {
  state: "nh",
  county: "hillsborough-county",
  jurisdiction: "nashua",
  feeSchedule: "nashua-code-105-28-schedule",
} as const;

const state: SeedState = {
  code: "NH",
  slug: "new-hampshire",
  name: "New Hampshire",
  fipsCode: "33",
};

const county: SeedCounty = {
  key: NASHUA_KEYS.county,
  slug: "hillsborough-county",
  name: "Hillsborough County",
  fipsCode: "33011",
};

const jurisdiction: SeedJurisdiction = {
  key: NASHUA_KEYS.jurisdiction,
  stateKey: NASHUA_KEYS.state,
  countyKey: NASHUA_KEYS.county,
  type: "city",
  slug: "nashua",
  name: "Nashua",
  officialName: "City of Nashua",
  websiteUrl: "https://www.nashuanh.gov/",
  permitPortalUrl: "https://www.nashuanh.gov/278/Permits",
  timezone: "America/New_York",
  isActive: true,
};

const departments: SeedDepartment[] = [
  {
    key: "nashua-building-safety",
    jurisdictionKey: NASHUA_KEYS.jurisdiction,
    kind: "building",
    name: "Department of Building Safety",
    phone: "(603) 589-3080",
    email: "permits@nashuanh.gov",
    url: "https://www.nashuanh.gov/275/Building-Safety-Department",
    addressLine: "229 Main Street, 2nd Floor of City Hall, Nashua, NH 03060",
    hours: "Monday to Friday 8 a.m. to 5 p.m.; permit desk to 4:30 p.m.; inspections 8:30 a.m. to 3:30 p.m.",
    notes:
      "Accepts and reviews construction documents for building, electrical, mechanical and plumbing work. Permit requests are filed by email using the department's fillable forms; there is no permit portal for the trades.",
  },
];

const sources: SeedSource[] = [
  {
    key: NASHUA_CODE_FEES_SOURCE_KEY,
    jurisdictionKey: NASHUA_KEYS.jurisdiction,
    title:
      "Nashua Revised Ordinances, Chapter 105 Building Construction, Article VIII Fees — §105-27 Permits and fees and §105-28 Fee Schedule",
    url: "https://ecode360.com/8729813",
    sourceType: "municipal_code",
    issuingAuthority: "City of Nashua",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: NASHUA_FEE_EFFECTIVE_FROM,
    retrievedAt: NASHUA_LAST_VERIFIED,
    lastVerifiedAt: NASHUA_LAST_VERIFIED,
    notes:
      "Read 2026-09-25 from the codifier's consolidation (code date 2026-02-10). §105-28 carries four schedules — A building, B mechanical, C electrical, D plumbing — with the amending ordinance and date printed against each subsection, most recently 3-9-2021 by Ord. No. O-21-045. This is the operative source for every fee rule in the seed.",
  },
  {
    key: NASHUA_ORDINANCE_SOURCE_KEY,
    jurisdictionKey: NASHUA_KEYS.jurisdiction,
    title:
      "Ordinance O-21-045 — amending the building construction ordinances and increasing the Building Department fees",
    url: "https://www.nashuanh.gov/Archive.aspx?ADID=6680",
    sourceType: "ordinance",
    issuingAuthority: "City of Nashua Board of Aldermen",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2021-03-09",
    effectiveFrom: NASHUA_FEE_EFFECTIVE_FROM,
    retrievedAt: NASHUA_LAST_VERIFIED,
    lastVerifiedAt: NASHUA_LAST_VERIFIED,
    notes:
      "Read 2026-09-25 as a 22-page scanned ordinance. It is the amendment the code's own notes point to for the current rates, and the document the department's permits page names when it says the new fees are listed under it.",
  },
  {
    key: NASHUA_PERMITS_PAGE_SOURCE_KEY,
    jurisdictionKey: NASHUA_KEYS.jurisdiction,
    title: "Permits — Department of Building Safety, City of Nashua",
    url: "https://www.nashuanh.gov/278/Permits",
    sourceType: "municipal_website",
    issuingAuthority: "City of Nashua, Department of Building Safety",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: NASHUA_LAST_VERIFIED,
    lastVerifiedAt: NASHUA_LAST_VERIFIED,
    notes:
      "Read 2026-09-25. Lists the trade applications this seed's rules were checked against — residential and commercial electrical, mechanical and plumbing — and states that \"the new fees for the permits are listed under Ordinance 0-21-045\". Also notes that internally and externally illuminated signs require an electrical permit.",
  },
  {
    key: NASHUA_COSTS_PAGE_SOURCE_KEY,
    jurisdictionKey: NASHUA_KEYS.jurisdiction,
    title: "Permits Required & Cost — City of Nashua",
    url: "https://www.nashuanh.gov/281/Permits-Required-Cost",
    sourceType: "municipal_website",
    issuingAuthority: "City of Nashua, Department of Building Safety",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: NASHUA_LAST_VERIFIED,
    lastVerifiedAt: NASHUA_LAST_VERIFIED,
    notes:
      "Read 2026-09-25. The department's own summary in plain language: fees \"are normally determined by the square footage of the project\", \"there is an additional $35 filing fee for each permit\" and \"an additional $25 fee for Land Use review\", and \"a building permit only includes the structural portion. Separate permits are required for plumbing, electrical or mechanical work\". The $35 filing fee is described in this source and is not in the code's fee article, so the site names it rather than charging it.",
  },
  {
    key: NASHUA_ELECTRICAL_FORM_SOURCE_KEY,
    jurisdictionKey: NASHUA_KEYS.jurisdiction,
    title: "Residential Electrical Permit application, City of Nashua",
    url: "https://www.nashuanh.gov/DocumentCenter/View/18496",
    sourceType: "other",
    issuingAuthority: "City of Nashua, Department of Building Safety",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: NASHUA_LAST_VERIFIED,
    lastVerifiedAt: NASHUA_LAST_VERIFIED,
    notes:
      "Read 2026-09-25 as a scanned PDF with no text layer, so its figures were read as page images against the code text rather than extracted. Prints the §105-28C(1) rows as an itemised table with a $50.00 application fee line and the $275.00 surcharge footnote. Four sibling forms — commercial electrical, residential and commercial mechanical, commercial plumbing — were printed from their own URLs beside it.",
  },
  {
    key: NASHUA_PLUMBING_FORM_SOURCE_KEY,
    jurisdictionKey: NASHUA_KEYS.jurisdiction,
    title: "Residential Plumbing Permit application, City of Nashua",
    url: "https://www.nashuanh.gov/DocumentCenter/View/18500",
    sourceType: "other",
    issuingAuthority: "City of Nashua, Department of Building Safety",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: NASHUA_LAST_VERIFIED,
    lastVerifiedAt: NASHUA_LAST_VERIFIED,
    notes:
      "Read 2026-09-25 as a scanned PDF. Its fixture table is the list the code's \"per fixture or fixture connection\" row names — sink, lavatory, outside faucet, backflow preventer, shower, water closet, floor drain, garbage disposal, tub, dishwasher, washing machine, other — plus the electric water heater, water pipe, drain/waste/vent, sewer connection and pump rows, with the $50.00 application fee and the $275.00 surcharge footnote.",
  },
];

/** Empty on purpose: the permit types Nashua uses already exist as shared rows. */
const permitTypes: JurisdictionSeed["permitTypes"] = [];
const projectTypes: JurisdictionSeed["projectTypes"] = [];

const jurisdictionPermitTypes: SeedJurisdictionPermitType[] = [
  {
    jurisdictionKey: NASHUA_KEYS.jurisdiction,
    permitTypeKey: "building",
    isAvailable: true,
    localName: "Building permit",
    officialUrl: "https://www.nashuanh.gov/278/Permits",
    notes:
      "Priced by area affected: $0.18 per square foot for new residential work and $0.28 commercial, and $0.13 / $0.18 per square foot for alterations and repairs. A building permit \"only includes the structural portion\", with separate permits required for plumbing, electrical and mechanical work.",
  },
  {
    jurisdictionKey: NASHUA_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    isAvailable: true,
    localName: "Electrical permit",
    officialUrl: "https://www.nashuanh.gov/DocumentCenter/View/18496",
    notes:
      "Priced by measurement rather than by valuation: $0.080 per square foot of habitable area for new residential construction, $0.50 per ampere of commercial service, $1.00 per outlet or lighting fixture, $30.00 per panel, plus the $50.00 application fee.",
  },
  {
    jurisdictionKey: NASHUA_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    isAvailable: true,
    localName: "Plumbing permit",
    officialUrl: "https://www.nashuanh.gov/DocumentCenter/View/18500",
    notes:
      "Priced per fixture or fixture connection — $9.50 residential, $12.00 commercial — with separate rows for electric water heaters, irrigation systems, backflow preventers, grease interceptors and sewer connections, and per-100-foot rows for pipe runs that this site documents rather than prices.",
  },
  {
    jurisdictionKey: NASHUA_KEYS.jurisdiction,
    permitTypeKey: "mechanical",
    isAvailable: true,
    localName: "Mechanical permit",
    officialUrl: "https://www.nashuanh.gov/DocumentCenter/View/18498",
    notes:
      "§105-28B prices mechanical work by equipment and by delivered capacity — gas supply piping at $0.30 per 1,000 BTU residential and $0.35 commercial, furnaces and boilers at $45.00 residential and $55.00 commercial, fireplaces and pellet stoves at $45.00, masonry fireplaces at $75.00, ductwork at $0.125 per ten square feet of area served, hoods and exhaust fans at $90.00 commercial. Transcribed in the research record and not attached to a page: Nashua's third page here is plumbing.",
  },
];

const feeSchedules: SeedFeeSchedule[] = [
  {
    key: NASHUA_KEYS.feeSchedule,
    jurisdictionKey: NASHUA_KEYS.jurisdiction,
    sourceKey: NASHUA_CODE_FEES_SOURCE_KEY,
    title: "Nashua Revised Ordinances §105-28 — Fee Schedule",
    officialUrl: "https://ecode360.com/8729813",
    effectiveFrom: NASHUA_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: NASHUA_LAST_VERIFIED,
    notes:
      "Four schedules in one code section: A building, B mechanical, C electrical and D plumbing, last amended 3-9-2021 by Ord. No. O-21-045. Each schedule prices a $50.00 application fee, a $75.00 re-inspection and a 100% surcharge for unpermitted work capped at $275.00 residential and $750.00 commercial.",
  },
];

function attach(permitTypeKey: string, rules: SeedFeeRule["rule"][]): SeedFeeRule[] {
  return rules.map((rule) => ({
    jurisdictionKey: NASHUA_KEYS.jurisdiction,
    permitTypeKey,
    scheduleKey: NASHUA_KEYS.feeSchedule,
    rule,
  }));
}

const feeRules: SeedFeeRule[] = [
  ...attach("building", NASHUA_BUILDING_BASE_RULES),
  ...attach("electrical", NASHUA_ELECTRICAL_BASE_RULES),
  ...attach("plumbing", NASHUA_PLUMBING_BASE_RULES),
];

const requirements: SeedRequirement[] = [
  {
    jurisdictionKey: NASHUA_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "document",
    title: "The area affected by the work, in square feet",
    description:
      "§105-28A(2) defines what goes into the measurement: \"New buildings, additions, alterations, mobile homes, in-ground swimming pools, basements, connecting structures, future expansion areas and areas capable of being used as living or occupiable space shall be included to calculate aggregate floor area.\" A permit is priced on that area rather than on the whole building, which is why a small addition to a large house is a small permit fee.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: NASHUA_CODE_FEES_SOURCE_KEY,
    lastVerifiedAt: NASHUA_LAST_VERIFIED,
  },
  {
    jurisdictionKey: NASHUA_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "document",
    title: "Plan requirements, by project type",
    description:
      "The department publishes separate plan-requirement checklists for commercial and multi-family dwellings and for residential work, and takes permit requests by email at permits@nashuanh.gov with the completed form attached. The City's fees summary also notes a $35.00 filing fee for each permit and a $25.00 fee for land use review, neither of which is in the code's fee article.",
    isMandatory: true,
    sortOrder: 20,
    sourceKey: NASHUA_PERMITS_PAGE_SOURCE_KEY,
    lastVerifiedAt: NASHUA_LAST_VERIFIED,
  },
  {
    jurisdictionKey: NASHUA_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "license",
    title: "A licensed electrician's number on the application",
    description:
      "The electrical permit forms carry a Licence # field beside the contractor's signature, and the applicant attests that \"all statements made on this application are true to the best of my knowledge\" — a false statement on the form being a criminal offence. An Eversource work order number is required against the service entrance, house meter and service-change rows.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: NASHUA_ELECTRICAL_FORM_SOURCE_KEY,
    lastVerifiedAt: NASHUA_LAST_VERIFIED,
  },
  {
    jurisdictionKey: NASHUA_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    requirementType: "license",
    title: "A licensed plumber's number on the application",
    description:
      "The plumbing permit forms carry a Plumbing Lic. # field beside the contractor's signature, and an itemised fixture table that has to be filled in: the fee is charged per fixture, so the count on the form is the fee.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: NASHUA_PLUMBING_FORM_SOURCE_KEY,
    lastVerifiedAt: NASHUA_LAST_VERIFIED,
  },
  {
    jurisdictionKey: NASHUA_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    requirementType: "other",
    title: "Separate permits for each trade",
    description:
      "\"A building permit only includes the structural portion. Separate permits are required for plumbing, electrical or mechanical work.\" An electric water heater is the clearest case: it is priced on the plumbing schedule at $18.00 residential and $25.00 commercial and again on the electrical schedule at $15.00 commercial, because it is both a plumbing and an electrical installation.",
    isMandatory: true,
    sortOrder: 20,
    sourceKey: NASHUA_COSTS_PAGE_SOURCE_KEY,
    lastVerifiedAt: NASHUA_LAST_VERIFIED,
  },
];

const profile: SeedProfile = {
  jurisdictionKey: NASHUA_KEYS.jurisdiction,
  headline: "What construction permits cost in Nashua",
  summary:
    "Nashua prices permits by measurement rather than by the value of the work: $0.18 per square foot of area affected for new residential construction and $0.28 for commercial, $0.080 per square foot of habitable area for a new home's electrical system, $0.50 per ampere of commercial service, $1.00 per outlet, and $9.50 per plumbing fixture residential against $12.00 commercial. Every application carries a $50.00 non-refundable fee, every permit pays $75.00 if an inspector has to return, and work started without a permit doubles the fee up to a $275.00 or $750.00 cap.",
  localContext:
    "Three things about Nashua are worth reading before any number here.\n\nThe first is that nothing is priced from cost. Manchester, forty miles north, charges .006 to .015 of the estimated cost of the work; Nashua charges square feet, fixtures, outlets and amperes. That has a practical consequence for a reader comparing the two: in Nashua a small, expensive job — a laboratory fit-out, a service upgrade — is cheap, and a large, cheap job — a warehouse, a long duct run — is not, whereas in Manchester the reverse is closer to true.\n\nThe second is that the residential and commercial tables are genuinely separate, and the same work can be two different prices. A commercial outlet is $1.00 and a residential outlet has no row at all, because a house's electrical permit is priced from habitable area instead. An electric water heater is $18.00 on the residential plumbing table and $25.00 on the commercial one, and it is on the electrical table as well — one appliance, two permits, three rows. And a fixture is $9.50 in a house and $12.00 in a commercial building, which makes the table a reader is in the first thing to check.\n\nThe third is that the fee is the count on the form. Nashua's plumbing application has a fixture table with a box for each kind of fixture, and the fee is $9.50 times the boxes that are ticked; the electrical forms ask for the quantity beside each item for the same reason. That means an application with twenty outlet boxes that are not counted is an application that will be re-invoiced.",
  valuationBasis:
    "Nashua does not price from valuation at all, and this site does not ask for one. The building schedule is charged per square foot of **area affected**, and §105-28A(2) says what that means: \"New buildings, additions, alterations, mobile homes, in-ground swimming pools, basements, connecting structures, future expansion areas and areas capable of being used as living or occupiable space shall be included to calculate aggregate floor area.\" It is the area being worked on, not the area of the finished building.\n\nThe electrical and plumbing schedules are charged per item instead — habitable square feet for a new house's service, fixtures, outlets, lighting fixtures, panels, amperes of commercial service. Where a figure in this dataset needs a measurement, it is that measurement and not a cost; where a schedule row needs a measurement this site has no basis for (the per-100-foot pipe rows, most notably) the row is documented and not priced.",
  notIncluded:
    "These figures are Nashua's building, electrical and plumbing permit fees as published in §105-28 of the Revised Ordinances, with the $50.00 application fee, the $75.00 re-inspection and the unpermitted-work surcharge that attach to every permit. They are not a total project cost, and they exclude:\n\n- **The $35.00 filing fee and the $25.00 land use review fee** the department's own summary describes. They are not in the code's fee article and their scope is not stated there, so the site names them and does not charge them; ask Building Safety which permits carry them.\n- **The per-100-foot pipe rows** — water pipes, drain/waste/vent pipes and storm drainage at $18.00 per 100 feet or part thereof, in both the residential and the commercial table. The fee engine has no linear-measure basis and this dataset does not add one for a single city's pipe rows.\n- **Demolition**, which is $40.00 up to 1,000 square feet plus \"$3.15 for each additional 100 square feet or part thereof\". The round-up is the fee and there is no honest per-foot rate for it.\n- **The discretionary minimums**: $30.00 residential and $50.00 commercial for miscellaneous equipment, and the trade equivalents at $40.00, $45.00 and $50.00. They apply where the Building Official judges them appropriate rather than to a defined scope.\n- **The LEED reductions** — 5%, 10%, 15% and 20% off the building permit fee for certified, silver, gold and platinum projects — which this site does not apply to a reader who has not shown the certification.\n- **Moving a building** ($200.00), **a certificate of occupancy** ($50.00), work not related to floor area (construction cost × $0.65 per $100), **retaining walls** ($0.15 or $0.30 per linear foot against a $25.00 or $50.00 minimum), **phased construction** (a 25% surcharge per upgrade phase) and the **expedite service fee** ($80.00 per hour per staff member, $250.00 minimum out of hours).\n- **Mechanical permits**, which §105-28B prices by equipment and capacity and which are transcribed in the research record rather than attached to a page.\n- **Fire protection system permits**, which are the Fire Marshal's under a separate schedule, and anything charged by the State of New Hampshire or by another department.",
  seoTitle: "Nashua construction permit fees",
  seoDescription:
    "How Nashua, New Hampshire prices building, electrical and plumbing permits — $0.18 and $0.28 per square foot, $9.50 and $12.00 per fixture, $0.50 per ampere — with a $50.00 application fee and a $75.00 re-inspection, cited to §105-28.",
  publishStatus: "published",
  noindex: false,
  lastReviewedAt: NASHUA_LAST_VERIFIED,
};

const permitPages: SeedPermitPage[] = [
  {
    jurisdictionKey: NASHUA_KEYS.jurisdiction,
    permitTypeKey: "building",
    slug: "building-permit-cost",
    title: "Nashua building permit cost",
    intro:
      "Nashua charges a building permit by the square foot of area affected, not by the value of the work: $0.18 per square foot for new residential construction, $0.28 for commercial and multifamily, and a reduced $0.13 and $0.18 per square foot for alterations, repairs and fire damage. Every application also pays a $50.00 non-refundable application processing and review fee, and any permit issued after work has started is surcharged 100%, capped at $275.00 residential and $750.00 commercial.",
    localSummary:
      "Area affected is the phrase that decides the fee, and it is not the size of the building. §105-28A(2) lists what counts — new buildings, additions, alterations, mobile homes, in-ground swimming pools, basements, connecting structures, future expansion areas and \"areas capable of being used as living or occupiable space\" — so a 400 square foot addition to a 3,000 square foot house is charged on 400 square feet.\n\nThe second thing to know is that a commercial alteration is charged at $0.18 per square foot, which is the same rate as brand-new residential work, while a residential alteration is $0.13. Two facts decide the rate — occupancy and whether the work is an alteration — and the four combinations are all different prices except that one.\n\nPlan review is not part of the building permit in Nashua. What the schedule prices is *additional* review at $0.10 or $0.15 per square foot for minor modifications to drawings that were already approved, such as a commercial tenant fit-up that changes after the fact.",
    notIncluded:
      "This is the §105-28A area rates plus the $50.00 application fee, the $75.00 re-inspection fee and the unpermitted-work surcharge. It excludes:\n\n- **The $35.00 filing fee and the $25.00 land use review fee** the department's summary describes, which are not in the code's fee article.\n- **Demolition**, priced at $40.00 up to 1,000 square feet plus $3.15 per additional 100 square feet or part thereof. The round-up is the fee, so a job one square foot over a boundary and a job ninety-nine feet over it pay the same $3.15 for that band, and no per-foot rate reproduces it.\n- **The LEED reductions** — 5%, 10%, 15% and 20% off the permit fee for certified, silver, gold and platinum buildings — which are not applied here because the discount depends on a certification document rather than on anything a reader has entered.\n- **Retaining walls** over four feet ($0.15 per linear foot residential and $0.30 commercial, against $25.00 and $50.00 minimums), **moving a building** ($200.00), **certificates of occupancy** ($50.00), work not related to floor area (cost × $0.65 per $100), **phased construction** (a 25% surcharge per upgrade phase) and the **expedite service fee** ($80.00 per hour per staff member).\n- **The discretionary minimums** for miscellaneous equipment — $30.00 residential, $50.00 commercial — which apply where the Building Official judges them appropriate.\n- **Every trade permit.** A building permit \"only includes the structural portion\", so electrical, plumbing and mechanical work each carry their own application and their own $50.00 fee.\n- **Fire protection permits** and anything charged by another department or by the State.",
    workedExample: {
      scenario: "A new one-family house of 3,000 square feet of area affected.",
      inputs: { squareFootage: 3_000, occupancy: "residential" },
      notes:
        "New residential work at $0.18 per square foot over 3,000 square feet is $540.00, and the $50.00 application processing and review fee is added, for $590.00.\n\nTwo comparisons worth making. If the same 3,000 square feet were commercial it would be $0.28 a foot, or $840.00 — the commercial rate is 56% higher for the same area. And if it were an alteration to an existing house instead of new construction, the rate would be $0.13 and the permit $390.00 before the application fee. Nothing in this figure depends on what the house will cost to build: Nashua does not read a valuation, and this site's calculator does not offer one for this city.",
    },
    faqs: [
      {
        question: "How is a Nashua building permit fee calculated?",
        answer:
          "By area affected, in square feet. §105-28A(2) charges $0.18 per square foot for residential one- and two-family and townhouses and $0.28 for commercial, including multifamily, with reduced rates of $0.13 and $0.18 for alterations, repairs and fire damage.",
        sourceId: NASHUA_CODE_FEES_SOURCE_KEY,
      },
      {
        question: "Is the fee based on the whole building or just the work?",
        answer:
          "Just the work. The measurement is the \"area affected\", and the section lists what it includes — new buildings, additions, in-ground swimming pools, basements, connecting structures, future expansion areas and areas capable of being used as living or occupiable space.",
        sourceId: NASHUA_CODE_FEES_SOURCE_KEY,
      },
      {
        question: "What is the application fee?",
        answer:
          "$50.00, described as a nonrefundable application processing and review fee, paid at the time of filing any application. It is the same $50.00 in every one of the four schedules — building, mechanical, electrical and plumbing.",
        sourceId: NASHUA_CODE_FEES_SOURCE_KEY,
      },
      {
        question: "What happens if I build without a permit?",
        answer:
          "The permit is surcharged 100% of the applicable fee, capped at $275.00 for residential work and $750.00 for commercial. The Nashua surcharge is a real charge on the permit rather than a fine, and it does not excuse the permit itself.",
        sourceId: NASHUA_CODE_FEES_SOURCE_KEY,
      },
      {
        question: "Is plan review included?",
        answer:
          "The building permit's area rates are the permit fee. What the schedule prices separately is additional plan review for minor modifications of already-approved drawings — $0.10 per square foot residential and $0.15 commercial — which is what a commercial tenant fit-up pays when its drawings change.",
        sourceId: NASHUA_CODE_FEES_SOURCE_KEY,
      },
      {
        question: "Where can I see the fee schedule?",
        answer:
          "In the Revised Ordinances at Chapter 105, Article VIII, §105-28. The department's permits page points at Ordinance O-21-045, which is the amendment that set the current rates on 9 March 2021, and the code prints that ordinance's date against every subsection it amended.",
        sourceId: NASHUA_ORDINANCE_SOURCE_KEY,
      },
    ],
    seoTitle: "Nashua NH building permit cost: $0.18 and $0.28 per square foot",
    seoDescription:
      "Nashua, New Hampshire building permit fees — $0.18 per square foot residential, $0.28 commercial, $0.13 and $0.18 for alterations — with a $50.00 application fee and a 100% surcharge for unpermitted work.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: NASHUA_LAST_VERIFIED,
  },
  {
    jurisdictionKey: NASHUA_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    slug: "electrical-permit-cost",
    title: "Nashua electrical permit cost",
    intro:
      "A Nashua electrical permit is priced from measurements rather than from cost. A new house pays $0.080 per square foot of habitable area for the wiring; a commercial service entrance is $0.50 per ampere; each outlet, switch, receptacle, smoke detector and lighting fixture is $1.00; a panel is $30.00; a house meter or a meter relocation is $55.00; an in-ground pool is $60.00; and low-voltage wiring is $0.080 per square foot of work area. Every application carries a $50.00 non-refundable fee on top.",
    localSummary:
      "The divide that matters is residential against commercial, because the two tables are priced on entirely different things. A house's electrical permit is measured in habitable square feet at $0.080 — 3,000 square feet is $240.00 — and a house's outlets are not counted at all. A commercial building is counted item by item instead: $1.00 an outlet, $1.00 a lighting fixture, $30.00 a panel, $35.00 a sign, $0.50 an ampere of service.\n\nTwo rows catch people out. The first is low voltage: phone, data, television and alarm wiring is its own row at $0.080 per square foot of work area, priced by area rather than by device, and it only appears on the residential table. The second is that a commercial service entrance is charged per ampere, so a 400-ampere service is $200.00 on its own — against $35.00 for a new dwelling's service entrance, which is a flat fee.\n\nThe schedule also prices an annual permit at $300.00, in lieu of an individual permit for each alteration, for a firm with a certified electrician on premises it owns or operates. That is the only fee in the article that replaces others rather than adding to them.",
    notIncluded:
      "This is the §105-28C rows plus the $50.00 application fee, the $75.00 re-inspection fee and the unpermitted-work surcharge. It excludes:\n\n- **Where a row needs a unit the calculator does not count.** Ranges, dryers and similar heating devices are $15.00 each; high-intensity lighting 250 watts and above is $15.00 each; fixed multi-outlet receptacle assemblies are $8.00 per six feet; track lighting $8.00 per ten feet; motor control centres, automatic transfer switches and HVAC unit wiring $35.00 each; electric baseboard heat $10.00 a unit; bus ducts $15.00 a section; transformers, generators, motors and x-ray machines $25.00 each; paging and sound systems $5.00 a speaker and $25.00 a console. All are published, and none is charged here.\n- **Circuit breakers, conduit runs and wire lengths**, which the schedule does not price at all — Nashua counts devices, not circuits.\n- **The discretionary minimum** for miscellaneous equipment, $40.00, which applies where the Code Official judges it appropriate.\n- **Signs, in the case of an illuminated sign**, which is charged here and also requires the sign to be UL listed and labelled.\n- **Re-inspection above $75.00 in effect**: the fee is $75.00 for the same work, and a job that fails repeatedly is charged it again rather than more.\n- **Fire alarm and sprinkler permits**, which are the Fire Marshal's, and the mechanical and plumbing permits a job usually carries alongside this one.\n- **Everything the building schedule prices**, including the $35.00 filing fee and the $25.00 land use review fee the department's summary describes.",
    workedExample: {
      scenario:
        "A commercial fit-out: a 400-ampere service entrance, 120 outlets and switches, and 60 lighting fixtures, with no other permit on the job.",
      inputs: {
        occupancy: "commercial",
        custom: { service_entrance: true, amperage: 400, outlets: 120, lighting_fixtures: 60 },
      },
      notes:
        "Every row is priced from a count rather than from a cost.\n\n- Service entrance: 400 amperes at $0.50 is $200.00.\n- Outlets, switches, receptacles and fire and smoke detectors: 120 at $1.00 is $120.00.\n- Lighting fixtures: 60 at $1.00 is $60.00, where the schedule counts four feet of continuous fluorescent lighting as one fixture — a conversion the filer makes, since the City prices fixtures and not feet.\n- Application fee: $50.00.\n\nThat is $430.00. Put the same measurements into a house and almost none of it applies: a new dwelling is priced at $0.080 per square foot of habitable area, its outlets are not counted, and its service entrance is a flat $35.00 instead of a rate per ampere.",
    },
    faqs: [
      {
        question: "How much does an outlet cost on a Nashua electrical permit?",
        answer:
          "$1.00 each on the commercial table, for switches, receptacles, and fire and smoke detectors. Residential permits are not priced per outlet — a house is charged $0.080 per square foot of habitable area for new construction instead.",
        sourceId: NASHUA_ELECTRICAL_FORM_SOURCE_KEY,
      },
      {
        question: "How is a commercial service entrance priced?",
        answer:
          "At $0.50 per ampere, so a 200-ampere service is $100.00 and a 400-ampere service is $200.00. A house's service entrance is different: a flat $35.00 for a new dwelling, and $55.00 for a service change covering up to two units with $20.00 for each additional one.",
        sourceId: NASHUA_CODE_FEES_SOURCE_KEY,
      },
      {
        question: "What does a Nashua electrical permit cost for a new house?",
        answer:
          "$0.080 per square foot of habitable area, plus $35.00 for the service entrance, plus $55.00 for the house meter, plus the $50.00 application fee. A 3,000 square foot house is $240.00 of area charge, and the two equipment rows bring it to $330.00 before the application fee.",
        sourceId: NASHUA_CODE_FEES_SOURCE_KEY,
      },
      {
        question: "Is low-voltage wiring priced separately?",
        answer:
          "Yes — $0.080 per square foot of work area, as its own residential row. Phone, data, television and alarm wiring are priced by area rather than by device, which is why a large cabling job in a small building is cheaper than the count would suggest.",
        sourceId: NASHUA_CODE_FEES_SOURCE_KEY,
      },
      {
        question: "What is the annual electrical permit?",
        answer:
          "$300.00, issued in lieu of an individual permit for each alteration to an approved installation to a firm regularly employing one or more certified electricians on premises it owns or operates, against a detailed record of every alteration kept available to the Code Official.",
        sourceId: NASHUA_CODE_FEES_SOURCE_KEY,
      },
    ],
    seoTitle: "Nashua NH electrical permit cost: per ampere, per outlet, per fixture",
    seoDescription:
      "Nashua, New Hampshire electrical permit fees — $0.080 per square foot of habitable area, $0.50 per ampere of commercial service, $1.00 per outlet, $30.00 per panel and a $50.00 application fee.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: NASHUA_LAST_VERIFIED,
  },
  {
    jurisdictionKey: NASHUA_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    slug: "plumbing-permit-cost",
    title: "Nashua plumbing permit cost",
    intro:
      "Nashua prices a plumbing permit per fixture: $9.50 for each fixture or fixture connection in a residential one- or two-family dwelling or townhouse, and $12.00 for each one in commercial work, including multifamily. Separate rows charge electric water heaters at $18.00 residential and $25.00 commercial, a sanitary sewer connection at $35.00 residential, grease interceptors at $30.00, irrigation systems at $20.00 and backflow preventers at $16.00 each. The $50.00 application fee is charged on top of all of it.",
    localSummary:
      "The fixture count is the fee, and the City's application is a tick-box table for exactly that reason. A bathroom remodel with a tub, a toilet, a lavatory and a shower connection is four fixtures and $38.00; a whole-house repipe with twelve fixtures is $114.00; and a commercial restroom fit-out with the same four fixtures is $48.00, because the commercial row is $12.00 rather than $9.50.\n\nTwo things the schedule does that a reader may not expect. The first is that pipe runs are priced, not just fixtures: water pipes, drain/waste/vent pipes and storm drainage are $18.00 for each 100 feet or part thereof, which means a 101-foot run costs the same as a 200-foot one. The second is that an electric water heater carries two permits — the plumbing schedule charges $18.00 or $25.00 for it, and the electrical schedule charges $15.00 for it as well, because it is both a water connection and an electrical installation.\n\nThe per-100-foot pipe rows are documented here and not priced, because this site has no linear-measure unit to price them with. Everything that is priced on this page is a published rate applied to a count you supply.",
    notIncluded:
      "This is the §105-28D per-fixture and per-item rows plus the $50.00 application fee, the $75.00 re-inspection fee and the unpermitted-work surcharge. It excludes:\n\n- **The per-100-foot pipe rows**: water pipes $18.00, drain/waste/vent pipes $18.00 and storm drainage $18.00 for each 100 feet or part thereof, residential and commercial alike, plus roof drain and storm drainage piping at $18.00 and roof drain inlets at $20.00 each on the commercial table. They are published and named, and this site prices no pipe runs for any city because the fee engine has no linear-measure basis.\n- **Pumps and ejectors** — $18.00 each residential, $35.00 each commercial — which are counted in a unit this site does not have.\n- **The discretionary minimum** for miscellaneous equipment, $40.00, which applies where the Building Official judges it appropriate.\n- **The $35.00 filing fee and the $25.00 land use review fee** the department's summary describes, which are not in the code's fee article.\n- **Water and sewer connection charges** made by the City's Engineering Department or by the utility, which are not Building Safety permit fees.\n- **The electrical and mechanical permits** the same job usually carries, and **fire protection permits**, which are the Fire Marshal's.\n- **Anything charged by the State of New Hampshire**, including plumber and gas fitter licensing.",
    workedExample: {
      scenario:
        "A residential bathroom and kitchen renovation: four fixtures — a tub, a water closet, a lavatory and a kitchen sink — plus one electric water heater.",
      inputs: { occupancy: "residential", fixtures: 4, custom: { heaters: 1 } },
      notes:
        "Four fixtures at $9.50 is $38.00, and one electric water heater at $18.00 is $18.00, for $56.00 of plumbing fee. The $50.00 application processing and review fee is added, making $106.00.\n\nThe count is the example's and not the City's, and it is worth checking against the application before filing: the fixture row covers \"tub, shower, sink, water closet, lavatory, dishwasher, outside faucet, clothes-washing machine, backflow preventer, etc.\" on the residential table, and a dishwasher or an outside faucet that is replaced counts like any other fixture. If the same four fixtures were in a commercial building the plumbing fee would be $48.00 rather than $38.00, and the water heater would be $25.00 rather than $18.00 — and it would also carry a $15.00 electrical permit for the same appliance.",
    },
    faqs: [
      {
        question: "How much is a plumbing permit per fixture in Nashua?",
        answer:
          "$9.50 for each fixture or fixture connection in a residential one- or two-family dwelling or townhouse, and $12.00 for each one in commercial work including multifamily. The fixtures the schedule names are tubs, showers, sinks, water closets, lavatories, floor drains, drinking fountains, urinals, dishwashers, garbage grinders, outside faucets, washing machines and washdown stations.",
        sourceId: NASHUA_CODE_FEES_SOURCE_KEY,
      },
      {
        question: "How much is a plumbing permit for a water heater?",
        answer:
          "$18.00 for an electric water heater in a residential building and $25.00 in a commercial one, on the plumbing schedule. An electric water heater also carries an electrical permit — $15.00 each on the commercial electrical table — because it is both a water and an electrical installation.",
        sourceId: NASHUA_PLUMBING_FORM_SOURCE_KEY,
      },
      {
        question: "Are pipe runs charged?",
        answer:
          "Yes — water pipes, drain/waste/vent pipes and storm drainage are $18.00 for each 100 feet or part thereof, in both the residential and commercial tables. This site names that row and does not price it, because the calculator has no linear-measure unit for pipe lengths.",
        sourceId: NASHUA_CODE_FEES_SOURCE_KEY,
      },
      {
        question: "What is the application fee for a plumbing permit?",
        answer:
          "$50.00, the same nonrefundable application processing and review fee the building, electrical and mechanical schedules charge. It is paid at the time of filing and does not depend on the size of the job.",
        sourceId: NASHUA_CODE_FEES_SOURCE_KEY,
      },
      {
        question: "How much is a backflow preventer?",
        answer:
          "$16.00 each on the commercial table, for all four kinds the schedule names — atmospheric vacuum breakers, pressure vacuum breakers, dual check valves and reduced-pressure principle assemblies. An irrigation system is priced as a whole at $20.00, which includes its backflow preventer rather than charging for it again.",
        sourceId: NASHUA_CODE_FEES_SOURCE_KEY,
      },
    ],
    seoTitle: "Nashua NH plumbing permit cost: $9.50 and $12.00 per fixture",
    seoDescription:
      "Nashua, New Hampshire plumbing permit fees — $9.50 per residential fixture and $12.00 commercial, water heaters at $18.00 and $25.00, backflow preventers from $16.00 — with a $50.00 application fee.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: NASHUA_LAST_VERIFIED,
  },
];

const verifications: SeedVerification[] = [
  {
    entityType: "source",
    entityKey: NASHUA_CODE_FEES_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: NASHUA_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NASHUA_CODE_FEES_SOURCE_KEY,
    notes:
      "Read 2026-09-25 from the codifier's site, which serves the section as HTML and renders where the City's own PDFs are scans. Schedules A, C and D transcribed in full, with the mechanical schedule B read and recorded in the research file. Every subsection carries the ordinance and date that last amended it.",
  },
  {
    entityType: "source",
    entityKey: NASHUA_ORDINANCE_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: NASHUA_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NASHUA_ORDINANCE_SOURCE_KEY,
    notes:
      "Read 2026-09-25. The City archive serves the ordinance as 22 pages of page images with no text layer, so it was read as a document and used to confirm the amendment's date and its effect rather than to transcribe rates from.",
  },
  {
    entityType: "source",
    entityKey: NASHUA_ELECTRICAL_FORM_SOURCE_KEY,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: NASHUA_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NASHUA_ELECTRICAL_FORM_SOURCE_KEY,
    notes:
      "Read 2026-09-25. A scanned form: the PDF has no text layer, so its rows were checked as page images against §105-28C and against the sibling commercial, mechanical and plumbing forms. Its itemised rows carry no printed rates, which is the one limitation recorded on the pages that cite it.",
  },
  {
    entityType: "source",
    entityKey: NASHUA_PLUMBING_FORM_SOURCE_KEY,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: NASHUA_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NASHUA_PLUMBING_FORM_SOURCE_KEY,
    notes:
      "Read 2026-09-25. Scanned, and used for the fixture list and the itemised structure rather than for the rates, which come from §105-28D.",
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-NEW-RESIDENTIAL",
    permitTypeKey: "building",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: NASHUA_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NASHUA_CODE_FEES_SOURCE_KEY,
    notes:
      "§105-28A(2)(a) — $0.18 per square foot of area affected, residential one- and two-family and townhouses. Modelled as 18 cents per square foot with `rateUnit: \"currency_per_unit\"`, the form Dallas's dollar-per-foot rows use.",
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-NEW-COMMERCIAL",
    permitTypeKey: "building",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: NASHUA_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NASHUA_CODE_FEES_SOURCE_KEY,
    notes:
      "§105-28A(2)(b) — $0.28 per square foot, commercial including multifamily. The schedule puts multifamily here rather than in the residential row, and the page says so.",
  },
  {
    entityType: "fee_rule",
    entityKey: "ELEC-COM-SERVICE-ENTRANCE",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: NASHUA_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NASHUA_CODE_FEES_SOURCE_KEY,
    notes:
      "§105-28C(2)(b) — $0.50 per ampere. One of the few rules in this dataset priced on the `amperage` basis, which Miami-Dade's service rows produced.",
  },
  {
    entityType: "fee_rule",
    entityKey: "ELEC-RES-SERVICE-ENTRANCE",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: NASHUA_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NASHUA_CODE_FEES_SOURCE_KEY,
    notes:
      "§105-28C(1)(b)[1] — $35.00 flat for a new dwelling. Gated to the residential occupancy, which is what keeps it from charging alongside the per-ampere commercial row.",
  },
  {
    entityType: "fee_rule",
    entityKey: "ELEC-SERVICE-CHANGE",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: NASHUA_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NASHUA_CODE_FEES_SOURCE_KEY,
    notes:
      "§105-28C(1)(d) — $55.00 up to two units plus $20.00 each additional one. Modelled as a base covering the first two units, so the allowance is two rather than the usual one.",
  },
  {
    entityType: "fee_rule",
    entityKey: "PLUMB-RES-FIXTURES",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: NASHUA_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NASHUA_CODE_FEES_SOURCE_KEY,
    notes:
      "§105-28D(1)(b) — $9.50 per fixture or fixture connection. The commercial sibling is $12.00, so the two are gated to their occupancies rather than sharing one rule with a lookup.",
  },
  {
    entityType: "fee_rule",
    entityKey: "SURCHARGE-UNPERMITTED-RESIDENTIAL",
    permitTypeKey: "building",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: NASHUA_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NASHUA_CODE_FEES_SOURCE_KEY,
    notes:
      "§105-28A(14) — 100% of the applicable fee, capped at $275.00 residential. Priced against `fee_subtotal` at priority 900 so that \"the applicable fee\" includes everything already charged on the permit, with the cap as the rule's own `maximumCents`. The same rule shape is attached to all three permit types.",
  },
  {
    entityType: "permit_page",
    entityKey: "building-permit-cost",
    permitTypeKey: "building",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: NASHUA_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NASHUA_CODE_FEES_SOURCE_KEY,
    notes:
      "The four area rates, the application fee and the two surcharge caps. The worked example is arithmetic on the schedule: 3,000 square feet at $0.18 is $540.00 of permit fee plus the $50.00 application fee.",
  },
  {
    entityType: "permit_page",
    entityKey: "electrical-permit-cost",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: NASHUA_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NASHUA_CODE_FEES_SOURCE_KEY,
    notes:
      "The residential area and low-voltage rows, the per-unit and per-item rows, and the commercial per-ampere service rate. The page names the rows it does not price rather than leaving them out.",
  },
  {
    entityType: "permit_page",
    entityKey: "plumbing-permit-cost",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_portal_check",
    verifiedAt: NASHUA_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NASHUA_CODE_FEES_SOURCE_KEY,
    notes:
      "The per-fixture rows, electric water heaters at both occupancies, and the commercial item rows. The per-100-foot pipe rows are described on the page and excluded from the model, with the reason stated where a reader will see it.",
  },
  {
    entityType: "jurisdiction_profile",
    entityKey: NASHUA_KEYS.jurisdiction,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: NASHUA_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NASHUA_CODE_FEES_SOURCE_KEY,
    notes:
      "Hub content built from Chapter 105 Article VIII and the department's two summary pages. The mechanical schedule and the rows this site cannot price — pipe lengths, demolition's round-up, the discretionary minimums, the LEED reductions — are named in the profile rather than omitted.",
  },
];

export const nashuaSeed: JurisdictionSeed = {
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
export const NASHUA_PUBLISHED_PERMIT_PAGES = nashuaSeed.permitPages.filter(
  (page) => page.publishStatus === "published" && !page.noindex,
);
