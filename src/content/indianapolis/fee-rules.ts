import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * Indianapolis, Indiana (Marion County) fee rules — REAL DATA.
 *
 * Sources (research/indiana/indianapolis.md records how each was read):
 *
 *  S1  The Department of Business and Neighborhood Services' fee schedule workbook, "As of
 *      1.5.2026" — five worksheets (Permits, Inspections, Code Enforcement, Licenses, Misc.),
 *      published from the department's own fee page. It is an `.xlsx`, not a PDF, so it was
 *      read as a spreadsheet rather than through `pdftotext`: every row's cell reference was
 *      read, which is how the three-column structure below was settled.
 *      https://us-east-1-indy.graphassets.com/ActDBC5rvRWeCZlNNnLrDz/cmk5m819t0az807k8xug0dwuw?dl=true
 *  S2  The department's "License and Permit Fees" page, which publishes the workbook and the
 *      effective date, and states that the craft permits did not change.
 *      https://www.indy.gov/activity/license-and-permit-fees
 *  S3  City-County Council Proposal No. 239, 2025 — the adopted ordinance behind the 1/5/2026
 *      table, carrying every section's old and new figure side by side. It is the source for
 *      the plan-review and permit-fee readings and for the administrative fee (536-609,
 *      $215.00 → $250.00) and the additional service fee (536-619, $32.00 → $40.00).
 *      https://us-east-1-indy.graphassets.com/ActDBC5rvRWeCZlNNnLrDz/cme31mtvm1fbp07k64bi1va4o
 *  S4  The "Residential Development Permits" page — the Class 2 permit types, their plans and
 *      their exemptions, which is where the plumbing and electrical requirement rules come from.
 *      https://www.indy.gov/activity/residential-development-permits
 *  S5  The Administrative Fee Appeal Form, which states the section the administrative fee is
 *      assessed under ("in accordance with Section 536-609 of the Building Standards and
 *      Procedures of the Consolidated City of Indianapolis").
 *      https://citybase-cms-prod.s3.amazonaws.com/2ec73be1277c4ea1b2e822861ec160e3.pdf
 *
 * **The mechanism, in three sentences.** A structural permit is **three separately stated
 * components** — a $40.00 application fee, a review fee, and an issuance fee — where the
 * review and issuance figures are selected by the subtype on the application and the square
 * footage then prices them inside that subtype. Electrical, plumbing and heating/cooling are
 * the opposite: one figure per subtype, printed in a single cell with no application, review or
 * issuance split beside it. Nothing in the 1/5/2026 schedule reads a valuation; every row reads
 * either a subtype or a square footage, and one row reads a fixture count.
 *
 * **Six readings this module depends on, all stated on the instruments.**
 *
 *  1. **A structural permit is application + review + issuance, and the three are separate
 *     columns.** The workbook's Permits sheet heads its columns "Permit Type | Subtype/Description
 *     | Application Fee | Review Fee | Issuance Fee", and every Structural Permit row carries
 *     $40.00 in the application column, a review figure, and an issuance figure. A residential
 *     new primary structure of 3,000 square feet is therefore $40.00 + $225.00 + $950.00 =
 *     $1,215.00, not any one of those three numbers.
 *  2. **The $40.00 is the ordinance's own fee and it applies to structural work.** Proposal 239
 *     amends "536-619 Additional service fee for applying for all demolition, master, sign,
 *     structural, and infrastructure related permits" from $32.00 to $40.00 — which is the
 *     figure the workbook prints in the Application Fee column of every Structural Permit row,
 *     and the reason the improvement location and floodplain rows carry $32.00 instead.
 *  3. **The subtype selects the arithmetic and the square footage prices it.** The review and
 *     issuance cells are two-part: "$175 (≤2,000 sqft) $25 per additional 500 sqft" and "$750
 *     (≤2,000 sqft) ... $100 per additional 500 sqft". The subtype is a scope, the allowance is
 *     its own printed threshold, and the rate is per block above it — the same base-plus-block
 *     shape the per-unit and per-thousand primitives already carry.
 *  4. **The commercial remodel ladder is the one subtype whose issuance fee is bracketed rather
 *     than rate-based below its top.** "$350 (1 - 999 sqft); $750 (1,000 - 2,500 sqft); $150 per
 *     additional 1,000 sqft" — two closed brackets and an open rate above them, so it is stated
 *     as a table under $2,500 and a rate above it.
 *  5. **Craft permits are one fee, printed in the Application Fee column with nothing beside
 *     it.** Every Plumbing (PLM), Electrical (ELE) and Heating/Cooling (HTG) row has a single
 *     figure and empty cells to its right. The page says the same thing in words — "Craft
 *     permits, such as electrical, HVAC, and plumbing, did not change" — and Proposal 239 does
 *     not amend them, which is why they appear in no amendment of that ordinance. Whether the
 *     sheet means the figure to be an application fee with no further charge, or the whole
 *     permit fee, the amount charged is the same; the calculator treats it as the permit fee and
 *     the page names the reading.
 *  6. **The $250.00 administrative fee is not a per-permit charge.** Every worksheet's header
 *     block carries a row reading "Admin Fees 250", and Proposal 239 shows where it comes from:
 *     "536-609 Administrative fee $215.00 $250.00". Section 536-609 is assessed to compensate
 *     the department "for the administrative expenses" of a permit for which a Certificate of
 *     Completion and Compliance has not been filed — the appeal form beside the schedule is the
 *     appeal of it. It is therefore stated as a requirement and never added to a permit's
 *     arithmetic, because charging $250.00 to every applicant would charge it to the ones who
 *     close their permits on time.
 *
 * **What is deliberately NOT here:** the improvement location permit (a zoning-side permit with
 * its own $32.00 application fee and its own table), the sign, encroachment, right-of-way,
 * street, driveway, wrecking, floodplain, drainage and private-provider rows, the residential
 * parking, short-term rental and special event rows, the inspection fee table (every
 * inspection is included in the Issuance Fee "unless otherwise noted", and the noted rows are
 * accelerated and reinspection charges), the code-enforcement penalties, and the contractor
 * licensing and business licensing tables. This module is the single definition of
 * Indianapolis's fee rules: the seed writes exactly these records and the tests assert against
 * exactly these records.
 */

/** The workbook prints it on every sheet: "As of 1.5.2026". */
export const INDIANAPOLIS_FEE_EFFECTIVE_FROM = "2026-01-05";

export const INDIANAPOLIS_SCHEDULE_SOURCE_KEY = "indianapolis-dbns-fee-schedule-2026";
export const INDIANAPOLIS_FEE_PAGE_SOURCE_KEY = "indianapolis-dbns-fee-page";
export const INDIANAPOLIS_PROPOSAL_239_SOURCE_KEY = "indianapolis-proposal-239-2025";
export const INDIANAPOLIS_RESIDENTIAL_PAGE_SOURCE_KEY = "indianapolis-residential-development-permits";
export const INDIANAPOLIS_ADMIN_FEE_FORM_SOURCE_KEY = "indianapolis-administrative-fee-appeal-form";

/** 536-619's additional service fee, raised from $32.00 to $40.00 on 1/5/2026. */
export const INDIANAPOLIS_APPLICATION_FEE_CENTS = 4_000;

/** The nine subtypes a Structural Permit is priced by, in the sheet's own order. */
export const INDIANAPOLIS_STRUCTURAL_SCOPES = [
  "residential_primary_new",
  "residential_primary_addition",
  "residential_accessory_new",
  "residential_accessory_addition",
  "residential_remodel",
  "residential_misc",
  "commercial_new",
  "commercial_remodel",
  "commercial_misc",
] as const;
export type IndianapolisStructuralScope = (typeof INDIANAPOLIS_STRUCTURAL_SCOPES)[number];

/** The electrical subtypes, in the sheet's own order. */
export const INDIANAPOLIS_ELECTRICAL_SCOPES = [
  "installation_new",
  "repair_residential",
  "space_heating",
  "space_cooling",
  "space_heating_cooling",
  "reconnection",
  "manufactured_home",
  "general_service",
  "self_certification_tags",
] as const;
export type IndianapolisElectricalScope = (typeof INDIANAPOLIS_ELECTRICAL_SCOPES)[number];

/** The plumbing subtypes, in the sheet's own order. */
export const INDIANAPOLIS_PLUMBING_SCOPES = [
  "new_residential",
  "repair_residential",
  "commercial",
  "reconnection",
  "general_service",
] as const;
export type IndianapolisPlumbingScope = (typeof INDIANAPOLIS_PLUMBING_SCOPES)[number];

function indyRule(
  sourceId: string,
  overrides: Pick<FeeRuleRecord, "id" | "code" | "label" | "feeType" | "config"> &
    Partial<FeeRuleRecord>,
): FeeRuleRecord {
  return {
    description: null,
    componentType: "base",
    conditions: null,
    minimumCents: null,
    maximumCents: null,
    priority: 100,
    effectiveFrom: INDIANAPOLIS_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId,
    ...overrides,
  };
}

function structuralScope(scope: IndianapolisStructuralScope) {
  return { field: "custom.structural_scope", op: "eq", value: scope } as const;
}

/* -------------------------------------------------------------------------- */
/* Building — the structural permit's application, review and issuance rows   */
/* -------------------------------------------------------------------------- */

/**
 * The $40.00 that every Structural Permit row carries.
 *
 * It is one rule rather than nine, because the sheet prints one figure beside all nine subtypes
 * — and it is gated on a subtype being stated, so a permit with no subtype is not charged an
 * application fee for nothing.
 */
export const INDIANAPOLIS_BUILDING_APPLICATION_RULES: FeeRuleRecord[] = [
  indyRule(INDIANAPOLIS_SCHEDULE_SOURCE_KEY, {
    id: "indianapolis-bld-application",
    code: "BLD-APPLICATION",
    label: "Structural permit — $40.00 additional service fee for applying",
    feeType: "flat",
    config: { amountCents: INDIANAPOLIS_APPLICATION_FEE_CENTS },
    conditions: { field: "custom.structural_scope", op: "exists" },
    description:
      'The Application Fee column of every Structural Permit row: "$40 per application" beside all nine subtypes. Its section is named in Proposal No. 239, 2025, which amends "536-619 Additional service fee for applying for all demolition, master, sign, structural, and infrastructure related permits" from $32.00 to $40.00 — which is why the improvement location and floodplain rows on the same sheet still carry $32.00 and this one carries $40.00. It is a component of the permit rather than a separate charge: the same sheet prices the plan review and the permit itself in the two columns beside it.',
  }),
];

export const INDIANAPOLIS_BUILDING_REVIEW_RULES: FeeRuleRecord[] = [
  indyRule(INDIANAPOLIS_SCHEDULE_SOURCE_KEY, {
    id: "indianapolis-bld-review-res-primary-new",
    code: "BLD-REVIEW-NEW-PRIMARY",
    label: "Structural permit — plan review, new Class 2 primary structure: $175 to 2,000 sq ft plus $25 per additional 500",
    feeType: "per_thousand",
    config: {
      basis: "square_footage",
      baseCents: 17_500,
      thresholdCents: 2_000,
      incrementCents: 500,
      centsPerThousand: 5_000,
    },
    componentType: "plan_review",
    conditions: structuralScope("residential_primary_new"),
    description:
      'The residential Class 2 new-structure row\'s Review Fee cell: "$175 (≤2,000 sqft) $25 per additional 500 sqft". Proposal No. 239 states the same row in words under "536-620 Plan review of a new primary or accessory Class 2 structure ... one hundred and seventy-five dollars ($175.00) for structures less than ... 2,000 square feet. For each additional 500 square feet an additional fee of twenty-one dollars ($21.00) twenty-five dollars ($25.00)". $25.00 per block of 500 square feet is $50.00 per 1,000, which is the rate the per-thousand primitive takes; the increment is the sheet\'s own 500-square-foot block.',
  }),
  indyRule(INDIANAPOLIS_SCHEDULE_SOURCE_KEY, {
    id: "indianapolis-bld-review-res-primary-add",
    code: "BLD-REVIEW-ADD-PRIMARY",
    label: "Structural permit — plan review, addition and simultaneous remodel of a primary Class 2 structure: $150 plus $25 per additional 500 sq ft",
    feeType: "per_thousand",
    config: {
      basis: "square_footage",
      baseCents: 15_000,
      thresholdCents: 1_000,
      incrementCents: 500,
      centsPerThousand: 5_000,
    },
    componentType: "plan_review",
    conditions: structuralScope("residential_primary_addition"),
    description:
      'The row\'s Review Fee cell: "$150 (≤1,000 sqft) $25 per additional 500 sqft", and in the ordinance: "Plan review of a remodel for any Class 2 structure or addition with simultaneous remodel for a primary Class 2 structure. One hundred and fifty dollars ($150.00) for structures less than 1,000 square feet. For each additional 500 square feet an additional fee of twenty-five dollars ($25.00)."',
  }),
  indyRule(INDIANAPOLIS_SCHEDULE_SOURCE_KEY, {
    id: "indianapolis-bld-review-res-accessory-new",
    code: "BLD-REVIEW-ACCESSORY-NEW",
    label: "Structural permit — plan review, new accessory Class 2 structure: $150 plus $25 per additional 500 sq ft",
    feeType: "per_thousand",
    config: {
      basis: "square_footage",
      baseCents: 15_000,
      thresholdCents: 1_000,
      incrementCents: 500,
      centsPerThousand: 5_000,
    },
    componentType: "plan_review",
    conditions: structuralScope("residential_accessory_new"),
    description:
      'The accessory row\'s Review Fee cell: "$150 (≤1,000 sqft) $25 per additional 500 sqft" — the ordinance\'s "Plan review of a new accessory Class 2 structure. One hundred and fifty dollars ($150.00) for structures less than 1,000 square feet. For each additional 500 square feet an additional fee of twenty-five dollars ($25.00)."',
  }),
  indyRule(INDIANAPOLIS_SCHEDULE_SOURCE_KEY, {
    id: "indianapolis-bld-review-res-accessory-add",
    code: "BLD-REVIEW-ACCESSORY-ADD",
    label: "Structural permit — plan review, addition and simultaneous remodel of an accessory Class 2 structure: $100 plus $25 per additional 500 sq ft",
    feeType: "per_thousand",
    config: {
      basis: "square_footage",
      baseCents: 10_000,
      thresholdCents: 1_000,
      incrementCents: 500,
      centsPerThousand: 5_000,
    },
    componentType: "plan_review",
    conditions: structuralScope("residential_accessory_addition"),
    description:
      'The row\'s Review Fee cell: "$100 (≤1,000 sqft) $25 per additional 500 sqft" — the ordinance\'s "Plan review of an addition with simultaneous remodel for an accessory Class 2 structure. One hundred dollars ($100.00) for structures less than 1,000 square feet. For each additional 500 square feet an additional fee of twenty-five dollars ($25.00)"; the cheapest plan review on the sheet.',
  }),
  indyRule(INDIANAPOLIS_SCHEDULE_SOURCE_KEY, {
    id: "indianapolis-bld-review-res-remodel",
    code: "BLD-REVIEW-REMODEL",
    label: "Structural permit — plan review, remodel of a Class 2 structure: $150 plus $25 per additional 500 sq ft",
    feeType: "per_thousand",
    config: {
      basis: "square_footage",
      baseCents: 15_000,
      thresholdCents: 1_000,
      incrementCents: 500,
      centsPerThousand: 5_000,
    },
    componentType: "plan_review",
    conditions: structuralScope("residential_remodel"),
    description:
      'The row\'s Review Fee cell: "$150 (≤1,000 sqft) $25 per additional 500 sqft". The sheet prices the review of a residential remodel and of a residential addition identically, which is the ordinance\'s own structure: both are listed under the same 536-620 plan review heading at one figure.',
  }),
  indyRule(INDIANAPOLIS_SCHEDULE_SOURCE_KEY, {
    id: "indianapolis-bld-review-res-misc",
    code: "BLD-REVIEW-MISC-RES",
    label: "Structural permit — plan review, miscellaneous residential (Class 2): $100 plus $25 per additional 500 sq ft",
    feeType: "per_thousand",
    config: {
      basis: "square_footage",
      baseCents: 10_000,
      thresholdCents: 1_000,
      incrementCents: 500,
      centsPerThousand: 5_000,
    },
    componentType: "plan_review",
    conditions: structuralScope("residential_misc"),
    description:
      'The "Misc. Residential (Class 2)" row\'s Review Fee cell: "$100 (≤1,000 sqft) $25 per additional 500 sqft" — the same $100 entry the accessory-addition review carries, beside an issuance fee that is not rate-based at all.',
  }),
  indyRule(INDIANAPOLIS_SCHEDULE_SOURCE_KEY, {
    id: "indianapolis-bld-review-commercial-new",
    code: "BLD-REVIEW-COMM-NEW",
    label: "Structural permit — plan review, Class 1 structures: $200.00",
    feeType: "flat",
    config: { amountCents: 20_000 },
    componentType: "plan_review",
    conditions: {
      field: "custom.structural_scope",
      op: "in",
      value: ["commercial_new", "commercial_remodel", "commercial_misc"],
    },
    description:
      'All three Commercial (Class 1) rows carry the same Review Fee: "200". The ordinance says why it is flat while the residential rows are not: "Plan review of Class 1 structures. Review includes appropriate structural and mechanical plan review ... Included in fees for Sections 536-602 and 536-603 $200.00" — one figure for every Class 1 plan review, whatever the building\'s size. One rule carries all three subtypes because the sheet prints one number beside all three.',
  }),
];

export const INDIANAPOLIS_BUILDING_ISSUANCE_RULES: FeeRuleRecord[] = [
  indyRule(INDIANAPOLIS_SCHEDULE_SOURCE_KEY, {
    id: "indianapolis-bld-issue-res-primary-new",
    code: "BLD-ISSUE-NEW-PRIMARY",
    label: "Structural permit — new Class 2 primary structure: $750 to 2,000 sq ft plus $100 per additional 500",
    feeType: "per_thousand",
    config: {
      basis: "square_footage",
      baseCents: 75_000,
      thresholdCents: 2_000,
      incrementCents: 500,
      centsPerThousand: 20_000,
    },
    conditions: structuralScope("residential_primary_new"),
    description:
      'The row\'s Issuance Fee cell, in full: "$750 (≤2,000 sqft) 2,000 sqft; $100 per additional 500 sqft. Sqft calculations include the area of an attached garage or carport, and the area of a finished basement or attic, but excludes the area of an unfinished basement or attic." The stray "2,000 sqft" in the middle of the cell is a typo in the workbook — the figure is $750 for 2,000 square feet and $100 per block of 500 above it — and the sentence after it is the sheet defining which area it reads, which is why the note is quoted here rather than paraphrased.',
  }),
  indyRule(INDIANAPOLIS_SCHEDULE_SOURCE_KEY, {
    id: "indianapolis-bld-issue-res-primary-add",
    code: "BLD-ISSUE-ADD-PRIMARY",
    label: "Structural permit — addition and simultaneous remodel of a primary Class 2 structure: $400 plus $50 per additional 500 sq ft",
    feeType: "per_thousand",
    config: {
      basis: "square_footage",
      baseCents: 40_000,
      thresholdCents: 1_000,
      incrementCents: 500,
      centsPerThousand: 10_000,
    },
    conditions: structuralScope("residential_primary_addition"),
    description:
      'The row\'s Issuance Fee cell: "$400 (≤1,000 sqft) $50 per additional 500 sqft". It is the residential section\'s most expensive per-square-foot issuance row — $100 per 1,000 square feet, twice the new-structure row\'s $100-per-500 — and the ordinance prints the same figures under 536-603: "Addition and simultaneous remodeling, alteration, or repair of primary Class 2 structures. For structures less than or equal to 1,000 square feet, a fee of four hundred dollars ($400.00); for each additional 500 square feet, an additional fee of fifty dollars ($50.00) shall apply."',
  }),
  indyRule(INDIANAPOLIS_SCHEDULE_SOURCE_KEY, {
    id: "indianapolis-bld-issue-res-accessory-new",
    code: "BLD-ISSUE-ACCESSORY-NEW",
    label: "Structural permit — new accessory Class 2 structure: $300 for 200 to 1,000 sq ft plus $25 per additional 500",
    feeType: "per_thousand",
    config: {
      basis: "square_footage",
      baseCents: 30_000,
      thresholdCents: 1_000,
      incrementCents: 500,
      centsPerThousand: 5_000,
    },
    conditions: structuralScope("residential_accessory_new"),
    description:
      'The row\'s Issuance Fee cell: "$300 (200 - 1000 sqft) $25 per additional 500 sqft" — the only cell on the sheet whose bracket opens at 200 square feet rather than at one square foot, which is the accessory-structure threshold the ordinance sets elsewhere. The calculator charges $300 up to 1,000 square feet and $25 per 500 above it, which is what the cell states; the 200-square-foot lower bound is a statement about what needs a permit rather than about what is charged.',
  }),
  indyRule(INDIANAPOLIS_SCHEDULE_SOURCE_KEY, {
    id: "indianapolis-bld-issue-res-accessory-add",
    code: "BLD-ISSUE-ACCESSORY-ADD",
    label: "Structural permit — addition and simultaneous remodel of an accessory Class 2 structure: $250 plus $25 per additional 500 sq ft",
    feeType: "per_thousand",
    config: {
      basis: "square_footage",
      baseCents: 25_000,
      thresholdCents: 1_000,
      incrementCents: 500,
      centsPerThousand: 5_000,
    },
    conditions: structuralScope("residential_accessory_addition"),
    description:
      'The row\'s Issuance Fee cell: "$250 (≤1,000 sqft) $25 per additional 500 sqft" — the cheapest permit on the residential side of the sheet, and the second place where an accessory row is 50 dollars below the primary row beside it.',
  }),
  indyRule(INDIANAPOLIS_SCHEDULE_SOURCE_KEY, {
    id: "indianapolis-bld-issue-res-remodel",
    code: "BLD-ISSUE-REMODEL",
    label: "Structural permit — remodel of a Class 2 structure: $200 plus $50 per additional 500 sq ft",
    feeType: "per_thousand",
    config: {
      basis: "square_footage",
      baseCents: 20_000,
      thresholdCents: 1_000,
      incrementCents: 500,
      centsPerThousand: 10_000,
    },
    conditions: structuralScope("residential_remodel"),
    description:
      'The row\'s Issuance Fee cell: "$200 (≤1,000 sqft) $50 per additional 500 sqft" — the ordinance\'s "536-603 Remodeling, alteration, or repair of Class 2 structures; provided, however, that when remodeling, alteration, or repair of a Class 2 structure is accomplished at the same time as an addition to an existing structure, a single permit fee shall be determined according to section 536-602", where Proposal 239 shows the $159.00-to-$200.00 change and the $39.00-to-$50.00 step.',
  }),
  indyRule(INDIANAPOLIS_SCHEDULE_SOURCE_KEY, {
    id: "indianapolis-bld-issue-res-misc",
    code: "BLD-ISSUE-MISC-RES",
    label: "Structural permit — miscellaneous residential (Class 2): $150.00",
    feeType: "flat",
    config: { amountCents: 15_000 },
    conditions: structuralScope("residential_misc"),
    description:
      'The row\'s Issuance Fee cell is a bare "150" — the one residential issuance fee with no square footage in it, and one of only two rows on the sheet whose issuance figure is a single number rather than a bracket and a rate.',
  }),
  indyRule(INDIANAPOLIS_SCHEDULE_SOURCE_KEY, {
    id: "indianapolis-bld-issue-commercial-new",
    code: "BLD-ISSUE-COMM-NEW",
    label: "Structural permit — new Class 1 structure: $1,000 to 2,500 sq ft plus $150 per additional 1,000",
    feeType: "per_thousand",
    config: {
      basis: "square_footage",
      baseCents: 100_000,
      thresholdCents: 2_500,
      incrementCents: 1_000,
      centsPerThousand: 15_000,
    },
    conditions: structuralScope("commercial_new"),
    description:
      'The row\'s Issuance Fee cell: "$1,000 (≤2,500 sqft) $150 per additional 1,000 sqft". It is the largest single figure in the building section and the widest allowance — 2,500 square feet inside the base against the residential rows\' 1,000 or 2,000 — so a 5,000-square-foot commercial building pays $1,000.00 + $450.00 of issuance and a 5,000-square-foot house pays $750.00 + $600.00.',
  }),
  indyRule(INDIANAPOLIS_SCHEDULE_SOURCE_KEY, {
    id: "indianapolis-bld-issue-commercial-remodel-closed",
    code: "BLD-ISSUE-COMM-REMODEL-CLOSED",
    label: "Structural permit — remodel of a Class 1 structure: $350 for 1 to 999 sq ft or $750 for 1,000 to 2,500 sq ft",
    feeType: "tiered_table",
    config: {
      basis: "square_footage",
      tiers: [
        { upToCents: 999, amountCents: 35_000 },
        { upToCents: 2_500, amountCents: 75_000 },
      ],
    },
    conditions: {
      all: [
        structuralScope("commercial_remodel"),
        { field: "square_footage", op: "lte", value: 2_500 },
      ],
    },
    description:
      'The first two brackets of the row\'s Issuance Fee cell: "$350 (1 - 999 sqft); $750 (1,000 - 2,500 sqft)". It is the sheet\'s only bracketed issuance fee — the other rate-based rows are one bracket and one rate — and the ordinance prints both figures, where Proposal 239 shows $697.00 becoming $350.00 and the $750.00 bracket standing still.',
  }),
  indyRule(INDIANAPOLIS_SCHEDULE_SOURCE_KEY, {
    id: "indianapolis-bld-issue-commercial-remodel-open",
    code: "BLD-ISSUE-COMM-REMODEL-OPEN",
    label: "Structural permit — remodel of a Class 1 structure above 2,500 sq ft: $750.00 plus $150 per additional 1,000",
    feeType: "per_thousand",
    config: {
      basis: "square_footage",
      baseCents: 75_000,
      thresholdCents: 2_500,
      incrementCents: 1_000,
      centsPerThousand: 15_000,
    },
    conditions: {
      all: [
        structuralScope("commercial_remodel"),
        { field: "square_footage", op: "gt", value: 2_500 },
      ],
    },
    description:
      'The last part of the same cell: "$150 per additional 1,000 sqft", read above the closed ladder\'s top bracket. The base is the $750.00 that bracket reaches at 2,500 square feet, so the two rules are continuous at the seam: the ordinance writes them as one sentence — "for structures equal to or greater than 1,000 square feet, but are less than 2,500 square feet, a fee of seven hundred and fifty dollars ($750.00), each additional 1,000 square feet, an additional fee of forty-two dollars ($42.00) one hundred and fifty dollars ($150.00) shall apply."',
  }),
  indyRule(INDIANAPOLIS_SCHEDULE_SOURCE_KEY, {
    id: "indianapolis-bld-issue-commercial-misc",
    code: "BLD-ISSUE-MISC-COMM",
    label: "Structural permit — miscellaneous commercial (Class 1): $175.00",
    feeType: "flat",
    config: { amountCents: 17_500 },
    conditions: structuralScope("commercial_misc"),
    description:
      'The row\'s Issuance Fee cell is a bare "175". The ordinance names its section: "536-612 General construction permit, where not specified by chapter 536 or 131 of this Code", which Proposal 239 amends from "$170.00 $141.00" to "$175.00 for Class 1 structures; and $150.00 for Class 2 structures" — the second of the two places where the sheet\'s residential and commercial figures are the same section\'s two rates.',
  }),
];

export const INDIANAPOLIS_BUILDING_BASE_RULES: FeeRuleRecord[] = [
  ...INDIANAPOLIS_BUILDING_APPLICATION_RULES,
  ...INDIANAPOLIS_BUILDING_ISSUANCE_RULES,
  ...INDIANAPOLIS_BUILDING_REVIEW_RULES,
];

/* -------------------------------------------------------------------------- */
/* Electrical permits — one figure per subtype, no application/review split    */
/* -------------------------------------------------------------------------- */

function electricalScope(scope: IndianapolisElectricalScope) {
  return { field: "custom.electrical_scope", op: "eq", value: scope } as const;
}

export const INDIANAPOLIS_ELECTRICAL_BASE_RULES: FeeRuleRecord[] = [
  indyRule(INDIANAPOLIS_SCHEDULE_SOURCE_KEY, {
    id: "indianapolis-elec-new-structure",
    code: "ELEC-NEW-STRUCTURE",
    label: "Electrical permit — installation, new structure or commercial addition: $202 to 2,500 sq ft plus $23 per additional 1,000",
    feeType: "per_thousand",
    config: {
      basis: "square_footage",
      baseCents: 20_200,
      thresholdCents: 2_500,
      incrementCents: 1_000,
      centsPerThousand: 2_300,
    },
    conditions: electricalScope("installation_new"),
    description:
      'The Electrical Permit (ELE) row\'s cell: "$202 (≤ 2,500 sf) $23 (per additional 1,000 sf over 2,500 sf)". The craft rows carry their whole fee in the workbook\'s Application Fee column with the review and issuance cells empty beside them, and this is the row a new building or a commercial addition is priced on.',
  }),
  indyRule(INDIANAPOLIS_SCHEDULE_SOURCE_KEY, {
    id: "indianapolis-elec-repair",
    code: "ELEC-REPAIR",
    label: "Electrical permit — repair to an existing structure or residential addition: $169 to 1,000 sq ft plus $23 per additional 500",
    feeType: "per_thousand",
    config: {
      basis: "square_footage",
      baseCents: 16_900,
      thresholdCents: 1_000,
      incrementCents: 500,
      centsPerThousand: 4_600,
    },
    conditions: electricalScope("repair_residential"),
    description:
      'The ELE row\'s second line: "$169 (≤ 1,000 sf) $23 (per additional 500 sf over 1,000 sf)". The block is half the size of the new-structure row\'s and the rate is the same $23.00, so the repair row steps at $46.00 per 1,000 square feet where the new-structure row steps at $23.00 — a doubling that is easy to miss in the two cells\' similar wording.',
  }),
  indyRule(INDIANAPOLIS_SCHEDULE_SOURCE_KEY, {
    id: "indianapolis-elec-space-heating",
    code: "ELEC-SPACE-HEATING",
    label: "Electrical permit — install or replace space heating equipment: $146 to 10,000 sq ft plus $23 per additional 2,500",
    feeType: "per_thousand",
    config: {
      basis: "square_footage",
      baseCents: 14_600,
      thresholdCents: 10_000,
      incrementCents: 2_500,
      centsPerThousand: 920,
    },
    conditions: electricalScope("space_heating"),
    description:
      'The third ELE line, read for space heating alone: "Space Heating--$146 (≤ 10,000 sf) ... $23 (per additional 2,500 sf over 10,000 sf)". One cell states three appliances at three figures — heating and cooling at $146.00 each and the two together at $178.00 — with one allowance and one rate behind all three, which is why this is three rules selected by scope rather than one.',
  }),
  indyRule(INDIANAPOLIS_SCHEDULE_SOURCE_KEY, {
    id: "indianapolis-elec-space-cooling",
    code: "ELEC-SPACE-COOLING",
    label: "Electrical permit — install or replace space cooling equipment: $146 to 10,000 sq ft plus $23 per additional 2,500",
    feeType: "per_thousand",
    config: {
      basis: "square_footage",
      baseCents: 14_600,
      thresholdCents: 10_000,
      incrementCents: 2_500,
      centsPerThousand: 920,
    },
    conditions: electricalScope("space_cooling"),
    description:
      'The same cell, read for space cooling: "Space Cooling--$146 (≤ 10,000 sf)". Cooling and heating are the same price on this row and are counted apart, because a job may install one without the other and the sheet gives each its own figure.',
  }),
  indyRule(INDIANAPOLIS_SCHEDULE_SOURCE_KEY, {
    id: "indianapolis-elec-space-heating-cooling",
    code: "ELEC-SPACE-HEATING-COOLING",
    label: "Electrical permit — combined heating and cooling equipment: $178 to 10,000 sq ft plus $23 per additional 2,500",
    feeType: "per_thousand",
    config: {
      basis: "square_footage",
      baseCents: 17_800,
      thresholdCents: 10_000,
      incrementCents: 2_500,
      centsPerThousand: 920,
    },
    conditions: electricalScope("space_heating_cooling"),
    description:
      'The cell\'s third figure: "Combined Htg/Clg--$178 (≤ 10,000 sf)". Installing both is $32.00 more than installing either — not twice $146.00 — which is the sheet pricing one piece of equipment that does both rather than two permits.',
  }),
  indyRule(INDIANAPOLIS_SCHEDULE_SOURCE_KEY, {
    id: "indianapolis-elec-reconnection",
    code: "ELEC-RECONNECTION",
    label: "Electrical permit — initial connection or reconnection to a relocated structure: $89.00",
    feeType: "flat",
    config: { amountCents: 8_900 },
    conditions: electricalScope("reconnection"),
    description:
      'The ELE row "Initial Connection or Reconnection to Relocated Structure ... 89". The same figure appears on the plumbing sheet for the same act on the other trade, and the two are separate permits: a house moved onto a lot needs both.',
  }),
  indyRule(INDIANAPOLIS_SCHEDULE_SOURCE_KEY, {
    id: "indianapolis-elec-manufactured-home",
    code: "ELEC-MANUFACTURED-HOME",
    label: "Electrical permit — manufactured home, new mobile home park, installation, alteration, replacement or repair: $498.00",
    feeType: "flat",
    config: { amountCents: 49_800 },
    conditions: electricalScope("manufactured_home"),
    description:
      'The ELE row "Manufactured Home--New Mobile Home Park, Installation, Alteration, Replacement, Repair ... 498". It is the largest single figure in the electrical section by a factor of five — the next largest is this row\'s own general-service sibling at $89.00 — and the heading is what explains it: the row covers a whole mobile home park as well as one manufactured home.',
  }),
  indyRule(INDIANAPOLIS_SCHEDULE_SOURCE_KEY, {
    id: "indianapolis-elec-general-service",
    code: "ELEC-GENERAL-SERVICE",
    label: "Electrical permit — general service activity: $89.00",
    feeType: "flat",
    config: { amountCents: 8_900 },
    conditions: electricalScope("general_service"),
    description:
      'The ELE row "General Service Activity ... 89" — the sheet\'s catch-all for electrical work that is neither a new installation, a repair, an appliance nor a reconnection. The plumbing sheet carries the same row at the same $89.00.',
  }),
  indyRule(INDIANAPOLIS_SCHEDULE_SOURCE_KEY, {
    id: "indianapolis-elec-self-certification-tags",
    code: "ELEC-SELF-CERT-TAGS",
    label: "Electrical permit — self-certification tags: $22.00",
    feeType: "flat",
    config: { amountCents: 2_200 },
    conditions: electricalScope("self_certification_tags"),
    description:
      'The last ELE row: "Self-Certification Tags ... 22". The sheet prints a figure with no unit beside it — no "each", no "/tag" — so it is charged once per application under its own scope, and the page says so rather than multiplying a count the schedule never names. The tags themselves are the labels a self-certifying contractor applies to work it inspects on the department\'s behalf; the row is the smallest on the sheet.',
  }),
];

/* -------------------------------------------------------------------------- */
/* Plumbing permits — one figure per subtype, and one row read by fixture      */
/* -------------------------------------------------------------------------- */

function plumbingScope(scope: IndianapolisPlumbingScope) {
  return { field: "custom.plumbing_scope", op: "eq", value: scope } as const;
}

export const INDIANAPOLIS_PLUMBING_BASE_RULES: FeeRuleRecord[] = [
  indyRule(INDIANAPOLIS_SCHEDULE_SOURCE_KEY, {
    id: "indianapolis-plumb-new-residential",
    code: "PLUMB-NEW-RESIDENTIAL",
    label: "Plumbing permit — new residential structure, installation: $185 to 2,500 sq ft plus $23 per additional 500",
    feeType: "per_thousand",
    config: {
      basis: "square_footage",
      baseCents: 18_500,
      thresholdCents: 2_500,
      incrementCents: 500,
      centsPerThousand: 4_600,
    },
    conditions: plumbingScope("new_residential"),
    description:
      'The Plumbing Permit (PLM) row\'s first line: "$185 (≤ 2,500 sf) $23 (per 500 sf over 2,500 sf)". It is the only plumbing row priced by the building\'s area; the commercial row beneath it is priced by fixtures, which is the same division the two trades make everywhere else in this dataset.',
  }),
  indyRule(INDIANAPOLIS_SCHEDULE_SOURCE_KEY, {
    id: "indianapolis-plumb-residential-repair",
    code: "PLUMB-REPAIR-RESIDENTIAL",
    label: "Plumbing permit — residential repair, alteration or remodel: $153 to 1,000 sq ft plus $23 per additional 500",
    feeType: "per_thousand",
    config: {
      basis: "square_footage",
      baseCents: 15_300,
      thresholdCents: 1_000,
      incrementCents: 500,
      centsPerThousand: 4_600,
    },
    conditions: plumbingScope("repair_residential"),
    description:
      'The PLM row\'s second line: "$153 (≤ 1,000 sf) $23 (per 500 sf over 1,000 sf)". The electrical sheet\'s repair row is the same shape at $169.00 against a $23.00 block; the plumbing row starts $16.00 lower, which is the only difference between the two trades\' repair pricing.',
  }),
  indyRule(INDIANAPOLIS_SCHEDULE_SOURCE_KEY, {
    id: "indianapolis-plumb-commercial",
    code: "PLUMB-COMMERCIAL",
    label: "Plumbing permit — commercial structure: $182 for 0 to 10 fixtures plus $23 per additional 5",
    feeType: "per_unit",
    config: {
      unit: "fixtures",
      baseCents: 18_200,
      thresholdUnits: 10,
      incrementUnits: 5,
      centsPerUnit: 460,
    },
    conditions: plumbingScope("commercial"),
    description:
      'The PLM row\'s third line, in full: "Commercial Structure--Installation, Repair, Alteration, Remodel, Additions, Accessory Structures ... $182 (0-10 fixtures) $23 (per additional 5 fixtures)". One row for every kind of commercial plumbing work, priced by the fixture count rather than by the building. Ten fixtures are inside the $182.00 base and each whole or partial five above them is $23.00, which is why the rate is carried as $4.60 a fixture inside a five-fixture increment: eleven fixtures is one block and $205.00, sixteen is two blocks and $228.00, and a hundred and six is twenty blocks and $642.00. The block, and not the head count, is what the $23.00 prices — the same reading the fire-protection sprinkler row needs in South Bend, and the reason both rows divide the block rate by its size.',
  }),
  indyRule(INDIANAPOLIS_SCHEDULE_SOURCE_KEY, {
    id: "indianapolis-plumb-reconnection",
    code: "PLUMB-RECONNECTION",
    label: "Plumbing permit — initial connection or reconnection to a relocated structure: $134.00",
    feeType: "flat",
    config: { amountCents: 13_400 },
    conditions: plumbingScope("reconnection"),
    description:
      'The PLM row "Initial Connection or Reconnection to Relocated Structure ... 134". The electrical sheet prices the same act on its own trade at $89.00; the $45.00 difference is what a sewer and water connection costs over a service reconnect in this schedule, and the two are charged separately because a moved house needs both permits.',
  }),
  indyRule(INDIANAPOLIS_SCHEDULE_SOURCE_KEY, {
    id: "indianapolis-plumb-general-service",
    code: "PLUMB-GENERAL-SERVICE",
    label: "Plumbing permit — general service activity: $89.00",
    feeType: "flat",
    config: { amountCents: 8_900 },
    conditions: plumbingScope("general_service"),
    description:
      'The PLM row "General Service Activity ... 89" — the plumbing sheet\'s catch-all at exactly the figure its electrical twin carries, and the cheapest plumbing permit in Indianapolis.',
  }),
];
