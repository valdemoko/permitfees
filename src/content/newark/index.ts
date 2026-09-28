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
  NEWARK_BUILDING_BASE_RULES,
  NEWARK_CODE_SOURCE_KEY,
  NEWARK_ELECTRICAL_BASE_RULES,
  NEWARK_FEE_EFFECTIVE_FROM,
  NEWARK_PLUMBING_BASE_RULES,
  NEWARK_STATE_UCC_SOURCE_KEY,
} from "./fee-rules";

export * from "./fee-rules";

/**
 * The complete Newark, New Jersey seed payload.
 *
 * Every figure traces to research/new-jersey/newark.md, which traces to Chapter 7:2 of the
 * Newark Municipal Code as amended 3-20-2024, and to N.J.A.C. 5:23-4.18 and 5:23-4.19 for the
 * State's share of the bill. Nothing is estimated.
 *
 * Three pages, all published: building, electrical and plumbing. They are not three separate
 * schedules — New Jersey's Uniform Construction Code makes a construction permit "the sum of
 * the fees for each subcode permit", so a Newark project usually carries all three at once, and
 * the three pages read as parts of one bill rather than as three cities' worth of rules.
 */

const RESEARCHER = "Permit Fee Intelligence research pass 11 (New Jersey)";

export const NEWARK_LAST_VERIFIED = "2026-09-25";

export const NEWARK_KEYS = {
  state: "nj",
  county: "essex-county",
  jurisdiction: "newark",
  feeSchedule: "newark-chapter-7-2-fee-schedule",
} as const;

const state: SeedState = {
  code: "NJ",
  slug: "new-jersey",
  name: "New Jersey",
  fipsCode: "34",
};

const county: SeedCounty = {
  key: NEWARK_KEYS.county,
  slug: "essex-county",
  name: "Essex County",
  fipsCode: "34013",
};

const jurisdiction: SeedJurisdiction = {
  key: NEWARK_KEYS.jurisdiction,
  stateKey: NEWARK_KEYS.state,
  countyKey: NEWARK_KEYS.county,
  type: "city",
  slug: "newark",
  name: "Newark",
  officialName: "City of Newark",
  websiteUrl: "https://www.newarknj.gov/",
  permitPortalUrl: "https://www.newarknj.gov/543/Building-Division---Office-of-Uniform-Co",
  timezone: "America/New_York",
  isActive: true,
};

const departments: SeedDepartment[] = [
  {
    key: "newark-uniform-construction-code",
    jurisdictionKey: NEWARK_KEYS.jurisdiction,
    kind: "building",
    name: "Department of Engineering — Office of Uniform Construction Code",
    phone: null,
    email: null,
    url: "https://www.newarknj.gov/543/Building-Division---Office-of-Uniform-Co",
    addressLine: "920 Broad Street, Newark, NJ 07102",
    hours: null,
    notes:
      "The Construction Official's office issues the construction permit and its building, electrical, fire protection and plumbing subcode permits, and §7A:2-1 of the City Code directs that \"all construction fees shall be payable by check or money order to the 'Construction Official-City of Newark, New Jersey,' at 920 Broad Street, Newark, New Jersey\". The address is the code's; the department's telephone number and office hours are not published in any document this pass could read, so they are left empty rather than guessed at.",
  },
];

const sources: SeedSource[] = [
  {
    key: NEWARK_CODE_SOURCE_KEY,
    jurisdictionKey: NEWARK_KEYS.jurisdiction,
    title:
      'Newark Municipal Code, Chapter 7:2 "Permits and Fees" — §7A:2-1, §7A:2-2 and §7A:2-3 (building, electrical, fire protection and plumbing subcode fee schedules)',
    url: "https://ecode360.com/36645711",
    sourceType: "municipal_code",
    issuingAuthority: "City of Newark",
    authorityKind: "city",
    isPrimary: true,
    documentDate: NEWARK_FEE_EFFECTIVE_FROM,
    effectiveFrom: NEWARK_FEE_EFFECTIVE_FROM,
    retrievedAt: NEWARK_LAST_VERIFIED,
    lastVerifiedAt: NEWARK_LAST_VERIFIED,
    notes:
      "Read 2026-09-25 through the City's codifier, whose consolidation carries the section's full amendment history — §7A:2-3 is annotated \"amended 3-20-2024 by Ord. No. 6PSF-A, 03-20-2024\", and that ordinance is the instrument behind every modelled amount. Newark's own website could not be read from this environment (it answers with a bot challenge to non-browser clients), so the codifier's text is the source of record. It carries the two per-cubic-foot building rates by use group, the three-band renovation and alteration table, the $58 permit review fee and the $58 minimum, the certificates of occupancy and other permits, the electrical, fire protection and plumbing subcodes, and the elevator administrative fee.",
  },
  {
    key: NEWARK_STATE_UCC_SOURCE_KEY,
    jurisdictionKey: NEWARK_KEYS.jurisdiction,
    title:
      "N.J.A.C. 5:23-4, Uniform Construction Code — §5:23-4.17 (municipal enforcing agency fees), §5:23-4.18 (standards for municipal fees) and §5:23-4.19 (New Jersey State permit surcharge fees)",
    url: "https://www.nj.gov/dca/codes/codreg/pdf_regs/njac_5_23_4.pdf",
    sourceType: "state_agency",
    issuingAuthority: "New Jersey Department of Community Affairs, Division of Codes and Standards",
    authorityKind: "state",
    isPrimary: true,
    documentDate: "2026-08-17",
    effectiveFrom: null,
    retrievedAt: NEWARK_LAST_VERIFIED,
    lastVerifiedAt: NEWARK_LAST_VERIFIED,
    notes:
      "Read 2026-09-25 as the Department's own consolidated PDF of Subchapter 4, \"including all Regulations adopted and published through the New Jersey Register, Vol. 58 No. 16, August 17, 2026\". §5:23-4.18 is the standard every New Jersey municipal fee ordinance has to meet — the fee is computed \"on the basis of the volume of the building or, in the case of alterations, the estimated construction cost\" and the unit rates belong to the municipality — and §5:23-4.19(b) sets the State permit surcharge at $0.00371 a cubic foot of new construction and additions, $1.90 per $1,000 of value for all other construction, with a $1.00 minimum. The amount is the State's; §5:23-4.19(a) has the enforcing agency collect and forward it.",
  },
];

/** Empty on purpose: the permit types Newark uses already exist as shared rows. */
const permitTypes: JurisdictionSeed["permitTypes"] = [];
const projectTypes: JurisdictionSeed["projectTypes"] = [];

const jurisdictionPermitTypes: SeedJurisdictionPermitType[] = [
  {
    jurisdictionKey: NEWARK_KEYS.jurisdiction,
    permitTypeKey: "building",
    isAvailable: true,
    localName: "Construction permit — building subcode",
    officialUrl: "https://www.newarknj.gov/543/Building-Division---Office-of-Uniform-Co",
    notes:
      "Priced on the volume of the building for new construction and additions — $0.02 a cubic foot for use groups A, F, I and S, $0.03 for B, E, H, M, R and U — and on the estimated construction cost for renovations and alterations, at a graduating $28 / $21 / $17 per $1,000. A non-refundable $58 processing fee is charged with the application and applied against the total, and $58 is separately published as the minimum building permit.",
  },
  {
    jurisdictionKey: NEWARK_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    isAvailable: true,
    localName: "Construction permit — electrical subcode",
    officialUrl: "https://www.newarknj.gov/543/Building-Division---Office-of-Uniform-Co",
    notes:
      "Receptacles and fixtures are charged in blocks — $58 for the first fifty, then $12 for each additional twenty or part thereof — and services, panel boards, entrances and subpanels are priced per device in three amperage bands ($81 to 200 amps, $460 to 1,000, $1,150 above). Motors, transformers and generators are published as their own horsepower and kilowatt ladders and are not priced by this site. Minimum fee $58.",
  },
  {
    jurisdictionKey: NEWARK_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    isAvailable: true,
    localName: "Construction permit — plumbing subcode",
    officialUrl: "https://www.newarknj.gov/543/Building-Division---Office-of-Uniform-Co",
    notes:
      "$14 for each fixture, piece of equipment or appliance connected to the plumbing system, and for each appliance connected to the gas or oil piping system; $75 for each special device — grease traps, oil separators, refrigeration units, utility service connections, backflow preventers with test ports, steam and hot water boilers, active solar systems, sewer pumps and interceptors. Minimum fee $58.",
  },
  {
    jurisdictionKey: NEWARK_KEYS.jurisdiction,
    permitTypeKey: "demolition",
    isAvailable: true,
    localName: "Demolition permit",
    officialUrl: "https://www.newarknj.gov/543/Building-Division---Office-of-Uniform-Co",
    notes:
      "$144 for a structure under 30 feet tall and under 5,000 square feet, $403 for all other structures. Published in §7A:2-3 and named on the building page; not priced here, because the calculator's building permit takes no demolition input.",
  },
];

const feeSchedules: SeedFeeSchedule[] = [
  {
    key: NEWARK_KEYS.feeSchedule,
    jurisdictionKey: NEWARK_KEYS.jurisdiction,
    sourceKey: NEWARK_CODE_SOURCE_KEY,
    title: "Newark Municipal Code, Chapter 7:2 — Permits and Fees, §7A:2-3",
    officialUrl: "https://ecode360.com/36645711",
    effectiveFrom: NEWARK_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: NEWARK_LAST_VERIFIED,
    notes:
      "One chapter for every construction fee the City charges, amended 3-20-2024 by Ord. No. 6PSF-A. The State permit surcharge that sits on top of it is not in the chapter: N.J.A.C. 5:23-4.19 sets the amount and §7A:2-3 instructs that it be added \"as required by U.C.C. 5:23-4.19(B)\".",
  },
];

function attach(permitTypeKey: string, rules: SeedFeeRule["rule"][]): SeedFeeRule[] {
  return rules.map((rule) => ({
    jurisdictionKey: NEWARK_KEYS.jurisdiction,
    permitTypeKey,
    scheduleKey: NEWARK_KEYS.feeSchedule,
    rule,
  }));
}

const feeRules: SeedFeeRule[] = [
  ...attach("building", NEWARK_BUILDING_BASE_RULES),
  ...attach("electrical", NEWARK_ELECTRICAL_BASE_RULES),
  ...attach("plumbing", NEWARK_PLUMBING_BASE_RULES),
];

const requirements: SeedRequirement[] = [
  {
    jurisdictionKey: NEWARK_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "The volume of the building, and what it includes",
    description:
      "§7A:2-2 defines the measurement the new-construction fee is charged on. A structure with a basement or cellar counts \"all enclosed dormers, porches, penthouses, and other enclosed portions ... extending from the basement or cellar floor to the mean height of a pitched roof or the average height to the top of the roof beams of a flat roof\"; one without counts from the same top line down to a point one fifth of the way from the first floor to the bottom of the footings, \"but not to exceed 2 1/2 feet below the first floor level\"; and an open shed or similar structure is measured \"within the perimeter of the roof for a height from grade line to the mean roof level\". N.J.A.C. 5:23-2.28 is the State rule §7A:2-2 implements.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: NEWARK_CODE_SOURCE_KEY,
    lastVerifiedAt: NEWARK_LAST_VERIFIED,
  },
  {
    jurisdictionKey: NEWARK_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "document",
    title: "Cost data for an alteration, and the Construction Official's determination of it",
    description:
      "§7A:2-3: \"In order to determine estimated cost of construction, the applicant shall submit to the Construction Official such cost data as may be available, produced by the architect or engineer of record or by a recognized estimating firm or by the contractor. A bona fide contractor's bid, if available, shall be submitted. The Construction Official shall make the final determination regarding estimated cost of construction.\" The renovation and alteration fee is charged on that figure, not on the contract price alone.",
    isMandatory: true,
    sortOrder: 20,
    sourceKey: NEWARK_CODE_SOURCE_KEY,
    lastVerifiedAt: NEWARK_LAST_VERIFIED,
  },
  {
    jurisdictionKey: NEWARK_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "Plan review is paid with the application, and credited against the permit",
    description:
      "§7A:2-1: \"20% of the construction fee shall be the plan review fee paid at the time of submission of an application for a permit, the amount of this fee shall then be deducted from the amount of the fee due for a construction permit when same is issued. Plan review fees are not refundable.\" N.J.A.C. 5:23-4.18(a)1 requires the same treatment, and adds that when a plan review is waived the permit fee is reduced by 20 percent from the municipal schedule.",
    isMandatory: true,
    sortOrder: 30,
    sourceKey: NEWARK_CODE_SOURCE_KEY,
    lastVerifiedAt: NEWARK_LAST_VERIFIED,
  },
  {
    jurisdictionKey: NEWARK_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "license",
    title: "A licensed electrical contractor, or a restricted permit and an annual registration",
    description:
      "§7A:2-3(2): \"Regular permits will be issued only to licensed electrical contractors complying with the requirements of the Electrical Contractors Licensing Act of 1962, Section 45:5A-1 et seq. of the New Jersey Statutes.\" Work that the Act exempts — elevators, escalators, oil burners, gas pumps — may be done on a restricted permit limited to one class of work, issued to a firm with a licensed journeyman electrician in its employ, on payment of a $50 annual registration.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: NEWARK_CODE_SOURCE_KEY,
    lastVerifiedAt: NEWARK_LAST_VERIFIED,
  },
  {
    jurisdictionKey: NEWARK_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    requirementType: "license",
    title: "A licensed plumber, with an exception for an owner-occupied single-family house",
    description:
      "§7A:2-3(4)(h): \"all plumbers and plumbing work performed in the City of Newark shall be done consistent with the State Plumbing License Law of 1968 (N.J.S.A. 45:14C-1 et seq.) except for work specifically performed by individual homeowners for their own occupied single family premises as prescribed by law and DCA regulation.\"",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: NEWARK_CODE_SOURCE_KEY,
    lastVerifiedAt: NEWARK_LAST_VERIFIED,
  },
  {
    jurisdictionKey: NEWARK_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    requirementType: "inspection",
    title: "The permit is inspected, which is what the $58 minimum is charged for",
    description:
      "§7A:2-3(4)(h) sets a minimum fee of $58 on the plumbing subcode, and every subcode in the chapter carries the same figure. The subcode empowers the inspector to require repairs to be completed \"within 15 days after notification\", and the chapter's own minimum is the price of the inspection that notification implies.",
    isMandatory: true,
    sortOrder: 20,
    sourceKey: NEWARK_CODE_SOURCE_KEY,
    lastVerifiedAt: NEWARK_LAST_VERIFIED,
  },
];

const profile: SeedProfile = {
  jurisdictionKey: NEWARK_KEYS.jurisdiction,
  headline: "What construction permits cost in Newark",
  summary:
    "Newark prices a new building on its **volume**: $0.02 a cubic foot for use groups A, F, I and S, and $0.03 for B, E, H, M, R and U. A renovation or alteration is priced on the estimated construction cost instead, at a graduating $28, then $21, then $17 per $1,000. The electrical subcode charges $58 for the first fifty receptacles and $12 for each additional twenty; the plumbing subcode charges $14 a fixture and $75 a special device. Every permit carries a non-refundable $58 processing fee applied against the total, which is also the published minimum, and the State's own permit surcharge of $0.00371 a cubic foot or $1.90 per $1,000 is added to it.",
  localContext:
    "Newark's fees are shaped by Trenton before they are shaped by Newark. N.J.A.C. 5:23-4.18 sets the standards every municipal fee ordinance has to meet — the basic construction fee is computed \"on the basis of the volume of the building or, in the case of alterations, the estimated construction cost\", plus a unit rate per plumbing fixture, per electrical device and per sprinkler head — and then leaves the unit rates to the municipality. Newark's rates are in Chapter 7:2 of the City Code, amended most recently on 20 March 2024.\n\nThe first thing that follows from that structure is that a Newark permit is rarely one number. A construction permit is \"the sum of the fees for each subcode permit\", so a new building carries a building fee on its volume, an electrical fee on its devices, a plumbing fee on its fixtures, and often a fire protection fee on its sprinklers, all on one application. The three pages here are three subcodes of one bill, not three competing quotes.\n\nThe second is that volume is not area. §7A:2-2 spells out how the City measures it — enclosed dormers, porches and penthouses count; a building without a cellar is measured to a point one fifth of the way down to the footings but no more than two and a half feet below the first floor; an open shed is measured to the mean roof level — and there is no square-foot rate in the chapter to fall back on. A reader who knows their building's footprint does not yet know the number this fee is charged on.\n\nThe third is the piece of the bill the City keeps none of. Every New Jersey construction permit carries a State permit surcharge, which the enforcing agency collects and forwards to the Division of Codes and Standards. Newark's chapter prints it as \"State Surcharge $0.016 per cubic feet\" and, for alterations, as \"0.80 per $1,000 ... as required by U.C.C. 5:23-4.19(B)\". The regulation it cites has moved since those lines were written: §5:23-4.19(b) now sets $0.00371 a cubic foot and $1.90 per $1,000, with a $1.00 minimum. This site charges the State's current figures and prints the City's older ones beside them on every page, because the City collects this fee rather than setting it, and the chapter itself points at the regulation for the amount.\n\nOne more thing is worth knowing before reading any figure here. The $58 that appears in the chapter as a processing fee and again as a minimum is not charged twice: the chapter says the processing fee \"will be applied against the total permit fee\", so a permit whose own rows come to more than $58 pays its rows and a permit that comes to less pays $58. The percentage for plan review works the same way and for the same reason — it is paid at submission and then deducted from the permit fee when the permit is issued, so it is a prepayment and not a surcharge, and this site does not add it to any total.",
  valuationBasis:
    "Newark uses **two bases in one chapter**, and which one applies is about the work rather than about the applicant. A new building or an addition is priced on **volume in cubic feet**, computed under §7A:2-2 (and, at the State level, under N.J.A.C. 5:23-2.28) and multiplied by the use group's rate. A renovation or alteration is priced on the **estimated cost of construction**, which §7A:2-3 defines by its own procedure: the applicant submits cost data from the architect or engineer of record, a recognised estimating firm or the contractor, a bona fide contractor's bid is submitted if one exists, and \"the Construction Official shall make the final determination regarding estimated cost of construction\".\n\nNothing here substitutes a square-foot rate for either figure, because the City publishes none. The electrical and plumbing subcodes work differently again: they are priced per device and per fixture rather than on any measurement of the building, which is why a service upgrade and a bathroom replacement can each be priced exactly while a whole-building figure cannot.",
  notIncluded:
    "These figures are Newark's building, electrical and plumbing subcode fees, the $58 that attaches to every permit, and the State permit surcharge on top of them. They are not a total project cost, and they exclude:\n\n- **Plan review**, which is not a charge: §7A:2-1 has 20% of the construction fee paid with the application and then \"deducted from the amount of the fee due for a construction permit when same is issued\". Adding it would charge the same money twice.\n- **The fire protection subcode** — sprinkler heads at $75 for up to 20, $138 to 100, $252 to 200, $683 to 400, $945 to 1,000 and $1,208 above; smoke and heat detectors at $40, $55, $70 and $85 by band; pre-engineered suppression systems at $106 each; standpipes at $263; kitchen hood exhaust and gas or oil fired appliances at $58; incinerators and crematoriums at $420. Published, transcribed in the research record, and not attached to a page.\n- **Certificates and other permits**: certificates of occupancy from $230 for a one- or two-unit dwelling to $460 plus $20 a unit over 100, $173 to $460 by area for business, factory, mercantile and storage buildings, $115 to $1,150 for assembly and high-hazard occupancies, certificates of continued occupancy and of change of use at $138 each, demolition at $144 or $403, asbestos abatement at $81 plus a $32 certificate of clearance, lead abatement at $161 plus $32, signs at $1 a square foot to a $690 maximum, and the R-3/R-4/R-5 siding and roofing permit at $58.\n- **Motors, electrical devices, transformers and generators**, published as horsepower and kilowatt ladders — $58, $115, $575 and $863 — which no input on this site collects. The amounts are named on the electrical page.\n- **The annual construction permit** at $173 plus a $161 State training registration fee, the **restricted-permit registration** at $50, and the **annual electrical repair permit** at $150 plus $140.\n- **Elevator permits**, which §7A:2-3 prices by N.J.A.C. 5:23-12.5 and 5:23-12.6 with a 40% administrative fee added to the third-party vendor's charges.\n- **The 20% reduction when plan review is waived**, and the **fee waivers** for City-occupied properties and for non-profit developers of low and moderate income housing.\n- **Anything charged by the State rather than the City** — the training registration fees, and the permits and licences the Department of Community Affairs issues directly.",
  seoTitle: "Newark construction permit fees",
  seoDescription:
    "How Newark, New Jersey prices construction permits — $0.02 and $0.03 per cubic foot by use group, $28/$21/$17 per $1,000 of alteration cost, $14 a plumbing fixture and $75 a special device, plus the $58 permit fee and the State surcharge.",
  publishStatus: "published",
  noindex: false,
  lastReviewedAt: NEWARK_LAST_VERIFIED,
};

const permitPages: SeedPermitPage[] = [
  {
    jurisdictionKey: NEWARK_KEYS.jurisdiction,
    permitTypeKey: "building",
    slug: "building-permit-cost",
    title: "Newark building permit cost",
    intro:
      "A Newark building permit is priced on the **volume of the building** for new construction and additions — $0.02 a cubic foot for use groups A, F, I and S and $0.03 a cubic foot for B, E, H, M, R and U — and on the **estimated cost of construction** for renovations and alterations, at a graduating $28 per $1,000 on the first $50,000, $21 on the next $50,000 and $17 above that. A non-refundable $58 processing fee is charged with the application and applied against the total permit fee, and the State's own permit surcharge is added on top.",
    localSummary:
      "Which of the two rates applies is the first question, and it is not about the applicant: a new building or an addition pays by volume, and a renovation or alteration pays by cost. On a 60,000 cubic foot residential building the volume rate is $1,800.00; the same work as an alteration with a $400,000 estimated cost is $7,550.00, and the two figures are not comparable because they measure different things.\n\nThe use group changes the volume rate by 50%, and it is worth checking before the number is trusted: $0.02 a cubic foot for A, F, I and S, $0.03 for B, E, H, M, R and U. On a 200,000 cubic foot warehouse that is $2,000 of difference between reading the building as Storage and reading it as Mercantile.\n\nThe $58 is the third thing to know, and it behaves like a floor rather than a fee. The chapter calls it a non-refundable processing fee charged with the application and says it \"will be applied against the total permit fee\"; it also publishes \"Minimum Building Permit: $58\". A permit whose rows exceed $58 pays its rows; one that does not pays $58.",
    notIncluded:
      "This is the building subcode's fee, the $58 that attaches to every permit, and the State permit surcharge. It excludes:\n\n- **Plan review**, which is not charged twice: §7A:2-1 has 20% of the construction fee paid at submission and then deducted from the permit fee when the permit issues. The chapter also reduces the permit fee by 20% when a plan review is waived, and that reduction is not applied here either.\n- **The fire protection subcode** — sprinkler heads, detectors, standpipes, suppression systems, kitchen hood exhaust and gas or oil fired appliances — which is published in §7A:2-3 and not priced on any page of this site.\n- **Certificates of occupancy**, which are priced separately and by a different measurement: $230 for a one- or two-unit dwelling, $288 to $403 by unit count up to 40, $460 above that plus $20 a unit over 100, $173 to $460 by floor area for business, factory, mercantile and storage buildings, and $115 to $1,150 for assembly, institutional and high-hazard occupancies.\n- **Demolition** ($144 under 30 feet and under 5,000 square feet, $403 otherwise), **asbestos abatement** ($81 plus $32 for a certificate of clearance), **lead abatement** ($161 plus $32), **signs** ($1 a square foot one side only, $690 maximum) and the **R-3/R-4/R-5 siding and roofing permit** at $58.\n- **The annual construction permit** at $173 plus a $161 State training registration fee, and **elevator permits**, which are priced by N.J.A.C. 5:23-12.5 and 5:23-12.6 with a 40% administrative fee added.\n- **Anything charged by another authority.** Essex County, the Newark Watershed and the State of New Jersey each charge their own fees, and the State permit surcharge shown here is the only State charge included.\n- **The fee waivers** for City-occupied properties and for non-profit developers of low and moderate income housing, which can remove the building fee entirely for a qualifying project.",
    workedExample: {
      scenario:
        "A new residential building of 60,000 cubic feet, whose occupancy is use group R, with no alteration, addition or other use on the permit.",
      inputs: { custom: { use_group: "R", cubic_footage: 60_000 } },
      notes:
        "The building is new, so the fee is volume and not cost: 60,000 cubic feet at three cents a cubic foot is $1,800.00, and no valuation is asked for. Use group R is on the three cent side of the table, with B, E, H, M and U; a use group of A, F, I or S in the same building would be $1,200.00 instead.\n\nThe State permit surcharge is the second line, and it is the part of the bill the City keeps none of. N.J.A.C. 5:23-4.19(b) sets it at $0.00371 a cubic foot on new buildings and additions and has the enforcing agency collect and forward it, so 60,000 cubic feet is $222.60 on its own line. Newark's own chapter prints the same line as \"$0.016 per cubic feet\", which is an older figure of the same State fee — the City collects it rather than setting it, and the amount is the regulation's, so that is the amount charged here.\n\nThe $58 minimum never comes into it, because the calculated fee is $1,800.00. It would apply to a small demolition-free permit of a few hundred cubic feet, where the fee would otherwise be a few dollars.",
    },
    faqs: [
      {
        question: "How does Newark calculate a building permit fee?",
        answer:
          "Two ways, and the work decides which. New construction and additions are charged on the volume of the building at $0.02 a cubic foot for use groups A, F, I and S or $0.03 for B, E, H, M, R and U. Renovations and alterations are charged on the estimated cost of construction at $28 per $1,000 up to $50,000, $21 on the next $50,000 and $17 above $100,000.",
        sourceId: NEWARK_CODE_SOURCE_KEY,
      },
      {
        question: "What is the minimum building permit fee in Newark?",
        answer:
          "The chapter publishes \"Minimum Building Permit: $58\" and charges a non-refundable processing fee of $58 on all permits, which it says \"will be applied against the total permit fee\". So $58 is a floor rather than a charge on top: a permit whose own rows come to more than $58 pays its rows and no more.",
        sourceId: NEWARK_CODE_SOURCE_KEY,
      },
      {
        question: "How is the volume of the building measured?",
        answer:
          "§7A:2-2 defines it. A building with a basement or cellar counts all enclosed dormers, porches, penthouses and other enclosed portions, from the basement floor to the mean height of a pitched roof or the top of the roof beams of a flat roof. A building without one is measured down to a point one fifth of the way from the first floor to the bottom of the footings, but no more than two and a half feet below the first floor. Open sheds are measured within the roof perimeter from grade to the mean roof level.",
        sourceId: NEWARK_CODE_SOURCE_KEY,
      },
      {
        question: "Do the alteration bands apply to the whole cost or only to each band?",
        answer:
          "Only to each band. The first $50,000 of estimated cost is charged at $28 per $1,000 whatever the job costs, the next $50,000 at $21, and anything above $100,000 at $17 — which is how the other New Jersey ordinances that print the same State table state it, as \"an additional fee\" for each band above the first.",
        sourceId: NEWARK_CODE_SOURCE_KEY,
      },
      {
        question: "Is plan review an extra fee?",
        answer:
          "No. §7A:2-1 says 20% of the construction fee is paid as the plan review fee at the time of submission, and that the amount \"shall then be deducted from the amount of the fee due for a construction permit when same is issued\". N.J.A.C. 5:23-4.18(a)1 is the same rule. It is a prepayment, and this site does not add it to the total.",
        sourceId: NEWARK_CODE_SOURCE_KEY,
      },
      {
        question: "What is the State surcharge on a Newark building permit?",
        answer:
          "N.J.A.C. 5:23-4.19(b) requires the City to collect $0.00371 per cubic foot of new construction and additions, or $1.90 per $1,000 of value for all other construction, with a $1.00 minimum, and forward it to the Division of Codes and Standards. Newark's own chapter prints older figures for the same fee — $0.016 a cubic foot and $0.80 per $1,000 — and says the surcharge is added \"as required by U.C.C. 5:23-4.19(B)\". The State's current amount is what is charged here.",
        sourceId: NEWARK_STATE_UCC_SOURCE_KEY,
      },
    ],
    seoTitle: "Newark NJ building permit cost: $0.02 or $0.03 per cubic foot",
    seoDescription:
      "Newark, New Jersey building permit fees — $0.02 and $0.03 per cubic foot by use group, $28/$21/$17 per $1,000 of alteration cost, a $58 minimum and the State permit surcharge of $0.00371 per cubic foot.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: NEWARK_LAST_VERIFIED,
  },
  {
    jurisdictionKey: NEWARK_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    slug: "electrical-permit-cost",
    title: "Newark electrical permit cost",
    intro:
      "Newark prices electrical work by devices rather than by the value of the job. Receptacles and fixtures are charged in **blocks**: $58 for the first fifty, then $12 for each additional twenty or part thereof. A service, panel board, entrance or subpanel is priced by its amperage — $81 up to 200 amps, $460 to 1,000, $1,150 above — and the subcode's minimum fee is $58. The State permit surcharge of $1.90 per $1,000 of the value of the work is added to the bill.",
    localSummary:
      "The block row is the one that surprises people. The fee for receptacles and fixtures is not a rate per outlet with a rounding error: it is $58 for the first fifty and $12 for each additional twenty or part thereof, so a permit with fifty-one outlets pays the same as one with seventy, and the fifty-first outlet costs a whole $12 rather than sixty cents.\n\nService work is priced by amperage, in three bands, and the band is the only thing that changes the price — a 200-amp service upgrade is $81 whether the house behind it is worth $300,000 or $3,000,000. It is charged per service, panel board, entrance or subpanel, so a job replacing two panels pays twice.\n\nTwo rows are published and not priced here, which matters because they are common on a commercial job: motors and electrical devices at $58 up to ten horsepower, $115 to fifty, $575 to a hundred and $863 above, and transformers and generators on the same ladder by kilowatt. Both are rated per device rather than counted, and no input on this page collects a horsepower or a kilowatt.",
    notIncluded:
      "This is the electrical subcode's device and service rows, the $58 minimum and the State permit surcharge. It excludes:\n\n- **Motors and electrical devices**: $58 for one to ten horsepower, $115 up to fifty, $575 up to a hundred, and $863 above that, each device. Published in §7A:2-3(2) and named here rather than charged, because the row is priced by horsepower and this page does not collect one.\n- **Transformers and generators**: $58 up to ten kilowatts, $115 up to 45, $575 up to 112.5, and $863 above, each device, on the same ratings problem.\n- **The D.C.A. fee as the chapter prints it.** §7A:2-3(2) writes the State surcharge as \"D.C.A. fee: 1 per $1,000\"; the amount charged here is N.J.A.C. 5:23-4.19(b)'s current $1.90 per $1,000, with the City's older figure named beside it.\n- **The annual construction permit** at $173 plus a $161 State training registration fee, the **restricted-permit annual registration** at $50, and the **annual electrical repair permit** at $150 plus $140, all of which are for firms maintaining premises rather than for a single job.\n- **Inspection charges on an existing building.** The subcode publishes a separate schedule for inspecting occupied buildings for electrical violations — $5 for up to five dwelling units, $0.75 for each additional unit to twenty-one, then $20 plus $0.50 a unit, and a square-foot scale for commercial buildings. That is an inspection certificate rather than a construction permit.\n- **The fire protection subcode** — sprinkler heads, detectors and alarm devices — which is a separate subcode permit with its own schedule and is not priced on any page of this site.\n- **Plan review**, which is a prepayment under §7A:2-1 rather than a fee, and **anything charged by another authority**, including the State's own training fees.",
    workedExample: {
      scenario:
        "A residential service upgrade to 200 amperes with one new panel board, sixty receptacles and devices on the job, and $8,500 of electrical work.",
      inputs: {
        valuationCents: 850_000,
        custom: { amperage: 200, panels: 1, outlets: 60 },
      },
      notes:
        "Three rows price this job. The sixty receptacles and devices are one block plus the $58 that covers the first fifty: 60 is one whole block of twenty above fifty, so $58.00 + $12.00 = $70.00, and a sixty-first device would not change it. The panel is in the lowest amperage band at $81.00, charged for the one device on the permit. The State permit surcharge is $1.90 per $1,000 of the $8,500 of work, which is $16.15 on its own line.\n\nTwo things are worth noticing. The first is that the fee moves with the *count* of devices rather than with the value of the work: $8,500 and $85,000 of electrical work cost the same $70.00 on the block row, and only the State surcharge differs. The second is that the amperage belongs to the service rather than to the panel — a permit with a 200-amp service and a 400-amp panel has one amperage to enter, and a filer in that position should confirm with the Construction Official which band the device is charged in.\n\nThe $58 minimum does not apply here, because the permit's own rows come to $151.00. It applies to a permit whose rows come to less, which is what the chapter's \"Minimum fee: $58\" is for.",
    },
    faqs: [
      {
        question: "How is a Newark electrical permit fee calculated?",
        answer:
          "By devices rather than by the value of the work. Receptacles and fixtures are charged in blocks — $58 for the first fifty and $12 for each additional twenty or part thereof — services and panels are priced by amperage in three bands, and the minimum fee is $58. The State permit surcharge of $1.90 per $1,000 of the value of the work is added to it.",
        sourceId: NEWARK_CODE_SOURCE_KEY,
      },
      {
        question: "How much does a 200-amp service upgrade cost in permit fees?",
        answer:
          "$81.00 for the service or panel itself, in the subcode's lowest amperage band, plus the $58 block for the first fifty receptacles and devices on the job and $12 for each additional twenty. The band covers everything up to and including 200 amperes, so the size of the building behind the service does not change it.",
        sourceId: NEWARK_CODE_SOURCE_KEY,
      },
      {
        question: "How many outlets are included in the first block?",
        answer:
          "Fifty. §7A:2-3(2) reads \"Receptacles and Fixtures: First 50 — $58; Each additional 20 — $12\", and the row is charged in whole blocks, so a permit with fifty-one outlets pays $70.00 — $58.00 plus one $12.00 block — and one with seventy pays the same.",
        sourceId: NEWARK_CODE_SOURCE_KEY,
      },
      {
        question: "Is there a minimum electrical permit fee?",
        answer:
          "Yes, $58, printed in the electrical subcode as \"Minimum fee: $58\". It works as a floor: a permit whose own rows exceed it pays its rows, and one that does not pays $58. The $58 processing fee charged with the application is the same money and is applied against the total rather than added to it.",
        sourceId: NEWARK_CODE_SOURCE_KEY,
      },
      {
        question: "Who may take out an electrical permit in Newark?",
        answer:
          "A licensed electrical contractor: §7A:2-3(2) issues regular permits only to contractors complying with the Electrical Contractors Licensing Act of 1962. Work the Act exempts — elevators, escalators, oil burners and gas pumps — may be done on a restricted permit limited to one class of work, issued to a firm employing a licensed journeyman electrician, on a $50 annual registration.",
        sourceId: NEWARK_CODE_SOURCE_KEY,
      },
    ],
    seoTitle: "Newark NJ electrical permit cost: $58 a block and $81 a service",
    seoDescription:
      "Newark, New Jersey electrical permit fees — $58 for the first fifty receptacles and $12 per additional twenty, $81/$460/$1,150 by amperage for a service or panel, a $58 minimum and the State surcharge.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: NEWARK_LAST_VERIFIED,
  },
  {
    jurisdictionKey: NEWARK_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    slug: "plumbing-permit-cost",
    title: "Newark plumbing permit cost",
    intro:
      "Newark's plumbing subcode has two rates and they are easy to remember: **$14** for each fixture, piece of equipment or appliance connected to the plumbing system — and for each appliance connected to the gas or oil piping system — and **$75** for each special device on the subcode's own list, which is grease traps, oil separators, refrigeration units, utility service connections, backflow preventers with test ports, steam and hot water boilers, active solar systems, sewer pumps and interceptors. The minimum fee is $58, and the State permit surcharge is added on top.",
    localSummary:
      "The list of what counts as a special device is the interesting part of this subcode, because those devices cost $75 instead of $14 and the list is printed. A backflow preventer with a test port is a special device; a water heater, a gas range and a lavatory are not, and all three are $14.00 each on the fixture row.\n\nGas appliances are priced here rather than on a separate gas permit: the fixture row covers \"each appliance connected to the gas piping or oil piping system\", so a new range or a boiler swap carries a $14.00 plumbing fee per appliance. That is unusual among the schedules on this site and it is what the City publishes.\n\nService connections are the third thing to check. A utility service connection is on the special device list, so a new water or sewer service is $75.00 rather than $14.00 — and if it is a backflow preventer being installed under a cross-connection control program, the $75 applies to the device as well.",
    notIncluded:
      "This is the plumbing subcode's fixture and special device rows, the $58 minimum and the State permit surcharge. It excludes:\n\n- **The fire protection subcode's own plumbing-adjacent rows**, including standpipes at $263 and pre-engineered suppression systems at $106 a system, which are issued under a different subcode.\n- **The annual construction permit** at $173 plus a $161 State training registration fee, which is for a firm maintaining premises rather than for a single job.\n- **Water and sewer charges made by the utility**, which are for service rather than for a permit and are not in Chapter 7:2.\n- **Certificates of occupancy and of continued occupancy**, at $230 and up by unit count or floor area, and $138 for a certificate of continued occupancy — issued at the end of the work rather than with the permit.\n- **The D.C.A. fee as the chapter prints it**, \"$1 per $1,000\". The State surcharge charged here is N.J.A.C. 5:23-4.19(b)'s current $1.90 per $1,000, and the City's older figure is named on the page rather than charged.\n- **Plan review**, which §7A:2-1 has paid at submission and deducted from the permit fee when it issues.\n- **Anything charged by another authority**, including the State's plumbing licence and its training fees.",
    workedExample: {
      scenario:
        "A restaurant fit-out with twelve plumbing fixtures, a grease interceptor and a backflow preventer with a test port, and $9,000 of plumbing work.",
      inputs: {
        valuationCents: 900_000,
        fixtures: 12,
        custom: { special_devices: 2 },
      },
      notes:
        "The two rows are charged separately and the total is their sum: twelve fixtures at $14.00 is $168.00, and the interceptor and the backflow preventer are both on the special device list, so two devices at $75.00 is $150.00. The State permit surcharge is $1.90 per $1,000 of the $9,000 of work, which is $17.10.\n\nThe fixture count is the number the subcode asks for rather than a list of device names, and it is worth reading the rows beside the device list before counting. A grease interceptor is a special device at $75.00 and not a fixture at $14.00; a gas range is a fixture at $14.00 and not a special device; and a water heater is $14.00, because the special device list names steam and hot water boilers but excludes \"those for domestic water heating\".\n\nThe $58 minimum does not apply here, because the permit's own rows come to $318.00. It exists for the small job — one fixture replaced, a single gas appliance swapped — where $14.00 alone would otherwise be the whole fee.",
    },
    faqs: [
      {
        question: "How much is a plumbing permit in Newark?",
        answer:
          "$14 for each fixture, piece of equipment or appliance connected to the plumbing system, and for each appliance connected to the gas or oil piping system. The subcode's minimum fee is $58, so a permit for one or two items pays $58 rather than $14 or $28.",
        sourceId: NEWARK_CODE_SOURCE_KEY,
      },
      {
        question: "What are the special devices charged at $75?",
        answer:
          "Grease traps, oil separators, refrigeration units, utility service connections, backflow preventers equipped with test ports — double check valve assemblies, reduced pressure zone and pressure vacuum breaker backflow preventers — steam boilers, hot water boilers other than those for domestic water heating, active solar systems, sewer pumps and interceptors. The list is printed in §7A:2-3(4)(h) and each device on it is $75.00 rather than $14.00.",
        sourceId: NEWARK_CODE_SOURCE_KEY,
      },
      {
        question: "Is a water heater a fixture or a special device?",
        answer:
          "A fixture, at $14.00. The special device list names steam boilers and hot water boilers explicitly \"excluding those for domestic water heating\", so a domestic water heater is on the fixture row — and so is a gas range, because the fixture row covers each appliance connected to the gas or oil piping system.",
        sourceId: NEWARK_CODE_SOURCE_KEY,
      },
      {
        question: "Does a new water or sewer service connection cost extra?",
        answer:
          "Yes — a utility service connection is on the special device list, so it is $75.00 rather than $14.00. A backflow preventer with a test port is on the same list and is also $75.00, which is the device rather than the cross-connection programme's own testing charge.",
        sourceId: NEWARK_CODE_SOURCE_KEY,
      },
      {
        question: "Who may do plumbing work in Newark?",
        answer:
          "A licensed plumber, under the State Plumbing License Law of 1968, with one exception in §7A:2-3(4)(h): work \"specifically performed by individual homeowners for their own occupied single family premises as prescribed by law and DCA regulation\". The exception is the homeowner's and not a contractor's.",
        sourceId: NEWARK_CODE_SOURCE_KEY,
      },
    ],
    seoTitle: "Newark NJ plumbing permit cost: $14 a fixture and $75 a device",
    seoDescription:
      "Newark, New Jersey plumbing permit fees — $14 per fixture, equipment or gas appliance, $75 per special device such as a grease trap or a backflow preventer, a $58 minimum and the State permit surcharge.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: NEWARK_LAST_VERIFIED,
  },
];

const verifications: SeedVerification[] = [
  {
    entityType: "source",
    entityKey: NEWARK_CODE_SOURCE_KEY,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: NEWARK_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NEWARK_CODE_SOURCE_KEY,
    notes:
      "Read 2026-09-25 through the City's codifier, which serves the chapter's text as amended. Chapter 7:2 transcribed in full: the $58 processing fee and the plan-review rule, the volume definition in §7A:2-2, the ten use-group rates per cubic foot, the three-band renovation and alteration table with the Construction Official's cost determination, the certificates of occupancy and other permits, the electrical subcode's block, motor, transformer and service rows, the fire protection subcode's sprinkler, detector, suppression and appliance rows, the plumbing subcode's fixture and special device rows, and the elevator administrative fee.",
  },
  {
    entityType: "source",
    entityKey: NEWARK_STATE_UCC_SOURCE_KEY,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: NEWARK_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NEWARK_STATE_UCC_SOURCE_KEY,
    notes:
      "Read 2026-09-25 as the Department of Community Affairs' consolidated PDF of N.J.A.C. 5:23-4, current through New Jersey Register Volume 58 No. 16. §5:23-4.18 read in full for the fee standards, including (a)1 on plan review being deducted from the permit fee, (c) on the volume and construction-cost bases, and (f) on certificate fees; §5:23-4.19 read for the State permit surcharge's amount, exemptions and $1.00 minimum, together with the regulation's own amendment history, which shows the amount moving from $0.0016 to $0.00265 to $0.00334 to $0.00371 a cubic foot.",
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-NEW-PER-CF-2",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: NEWARK_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NEWARK_CODE_SOURCE_KEY,
    notes:
      "\"A - Assembly Buildings $0.02 per cubic foot ... F - Factory and Industrial Buildings $0.02 per cubic foot ... I - Institutional Buildings $0.02 per cubic foot ... S - Storage Buildings $0.02 per cubic foot.\" Four of the ten published rows, charged at one rate.",
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-NEW-PER-CF-3",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: NEWARK_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NEWARK_CODE_SOURCE_KEY,
    notes:
      "$0.03 per cubic foot for use groups B, E, H, M, R and U — including \"R - Residential Buildings $0.03 per cubic foot\", the rate a Newark house is charged at.",
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-ALTERATION",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: NEWARK_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NEWARK_CODE_SOURCE_KEY,
    notes:
      "The published table: \"Between $0 - $50,000 — $28; $50,001 - $100,000 — 21; Over $100,000 — 17\", per $1,000 of estimated construction cost. Modelled as graduating bands, which is how the State table behind it is written in the municipalities that spell it out.",
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-STATE-SURCHARGE-NEW",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: NEWARK_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NEWARK_STATE_UCC_SOURCE_KEY,
    notes:
      "N.J.A.C. 5:23-4.19(b): $0.00371 per cubic foot of new buildings and additions, minimum $1.00. Newark's chapter prints \"State Surcharge $0.016 per cubic feet\" — an older figure of the same State fee, named on the page and not charged.",
  },
  {
    entityType: "fee_rule",
    entityKey: "ELEC-RECEPTACLES",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: NEWARK_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NEWARK_CODE_SOURCE_KEY,
    notes:
      "\"Receptacles and Fixtures: First 50 — $58; Each additional 20 — $12.\" Stored as 60 cents a device with a fifty-device allowance and a twenty-device block, which reproduces the published $58 and $12 at every boundary: 50 pays $58, 51 and 70 pay $70, 71 pays $82.",
  },
  {
    entityType: "fee_rule",
    entityKey: "ELEC-PANELS-TO-200A",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: NEWARK_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NEWARK_CODE_SOURCE_KEY,
    notes:
      "\"Service Panels, Entrances and Subpanels: Up to 200 amps — $81.\" Charged for each device on the permit at the amperage entered; its two sibling bands ($460 to 1,000 amps, $1,150 above) are gated to the ranges they cover so exactly one can apply.",
  },
  {
    entityType: "fee_rule",
    entityKey: "PLUMB-FIXTURES",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: NEWARK_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NEWARK_CODE_SOURCE_KEY,
    notes:
      "\"The fee shall be in the amount of $14 per fixture, piece of equipment or appliance connected to the plumbing system, and for each appliance connected to the gas piping or oil piping system.\"",
  },
  {
    entityType: "fee_rule",
    entityKey: "PLUMB-SPECIAL-DEVICES",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: NEWARK_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NEWARK_CODE_SOURCE_KEY,
    notes:
      "\"The fee shall be $75 per special device for the following: Grease traps, oil separators, refrigeration units, utility service connections, backflow preventers equipped with test ports ..., steam boilers, hot water boilers (excluding those for domestic water heating), active solar systems, sewer pumps, and interceptors.\" The whole list at one published price, which is why the per-unit kind is named after the document's own phrase.",
  },
  {
    entityType: "permit_page",
    entityKey: "building-permit-cost",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: NEWARK_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NEWARK_CODE_SOURCE_KEY,
    notes:
      "The two volume rates, the alteration table, the $58 floor and the State surcharge. The worked example is arithmetic on the chapter: 60,000 cubic feet at $0.03 is $1,800.00, and the State's $0.00371 a cubic foot is $222.60 on its own line.",
  },
  {
    entityType: "permit_page",
    entityKey: "electrical-permit-cost",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: NEWARK_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NEWARK_CODE_SOURCE_KEY,
    notes:
      "The block row, the three service bands and the $58 minimum. The page names the motor, transformer, annual-permit and inspection rows it does not charge, and says why the amperage belongs to the service rather than to each device.",
  },
  {
    entityType: "permit_page",
    entityKey: "plumbing-permit-cost",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: NEWARK_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NEWARK_CODE_SOURCE_KEY,
    notes:
      "The $14 fixture row and the $75 special device row, with the domestic-water-heating exclusion stated on the page because it is the question a water heater raises.",
  },
  {
    entityType: "jurisdiction_profile",
    entityKey: NEWARK_KEYS.jurisdiction,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: NEWARK_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: NEWARK_CODE_SOURCE_KEY,
    notes:
      "Hub content built from Chapter 7:2 and N.J.A.C. 5:23-4. The profile records what the three pages do not cover — the fire protection subcode, the certificates of occupancy, the motor and transformer ladders and the elevator subcode — and states the two readings the model depends on: the alteration bands are graduating, and the State surcharge is charged at the State's current amount.",
  },
];

export const newarkSeed: JurisdictionSeed = {
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
export const NEWARK_PUBLISHED_PERMIT_PAGES = newarkSeed.permitPages.filter(
  (page) => page.publishStatus === "published" && !page.noindex,
);
