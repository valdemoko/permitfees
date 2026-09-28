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
  PITT_BUILDING_BASE_RULES,
  PITT_ELECTRICAL_BASE_RULES,
  PITT_ELECTRICAL_PAGE_SOURCE_KEY,
  PITT_FEE_CALCULATOR_PAGE_SOURCE_KEY,
  PITT_FEE_CALCULATOR_SOURCE_KEY,
  PITT_FEE_EFFECTIVE_FROM,
  PITT_FEE_SCHEDULE_2025_SOURCE_KEY,
  PITT_FEE_SCHEDULE_SOURCE_KEY,
  PITT_FEES_PAGE_SOURCE_KEY,
  PITT_MECHANICAL_BASE_RULES,
  PITT_MECHANICAL_PAGE_SOURCE_KEY,
  PITT_PERMITTING_SOURCE_KEY,
  PITT_TPA_SOURCE_KEY,
  PITT_WORK_NOT_REQUIRING_SOURCE_KEY,
} from "./fee-rules";

export * from "./fee-rules";

/**
 * The complete Pittsburgh, Pennsylvania seed payload.
 *
 * Every figure traces to research/pennsylvania/pittsburgh.md, which traces to
 * PLI's four-page 2026 fee schedule (effective January 1, 2026), its 2025
 * predecessor diffed line for line against it, the City's own Permit Fee
 * Calculator — whose HTML source carries the arithmetic as code — and the
 * service pages that define the two structure types the fee split turns on.
 *
 * Three pages: building, electrical and mechanical. Plumbing is not one of them
 * because Pittsburgh does not issue it — "all plumbing not associated with
 * sprinkler systems in the City of Pittsburgh is regulated by Allegheny County
 * Health Department, not the City" — and the three published pages are three
 * readings of *one* formula rather than three schedules: construction value × a
 * rate per $1,000, clamped, plus the same three add-ons, with exactly one
 * figure in the whole stack that reduces a total (the required 15% Third Party
 * Agency discount on commercial electrical permits, folded into that row's rate
 * because the engine has no negative component).
 */

const RESEARCHER = "Permit Fee Intelligence research pass 14 (Pennsylvania)";

export const PITT_LAST_VERIFIED = "2026-09-25";

export const PITT_KEYS = {
  state: "pa",
  county: "allegheny-county",
  jurisdiction: "pittsburgh",
  feeSchedule: "pittsburgh-pli-permit-fees",
} as const;

const state: SeedState = {
  code: "PA",
  slug: "pennsylvania",
  name: "Pennsylvania",
  fipsCode: "42",
};

const county: SeedCounty = {
  key: PITT_KEYS.county,
  slug: "allegheny-county",
  name: "Allegheny County",
  fipsCode: "42003",
};

const jurisdiction: SeedJurisdiction = {
  key: PITT_KEYS.jurisdiction,
  stateKey: PITT_KEYS.state,
  countyKey: PITT_KEYS.county,
  type: "city",
  slug: "pittsburgh",
  name: "Pittsburgh",
  officialName: "City of Pittsburgh",
  websiteUrl: "https://www.pittsburghpa.gov/",
  permitPortalUrl: "https://onestoppgh.pittsburghpa.gov/",
  timezone: "America/New_York",
  isActive: true,
};

const departments: SeedDepartment[] = [
  {
    key: "pittsburgh-permits-licenses-inspections",
    jurisdictionKey: PITT_KEYS.jurisdiction,
    kind: "building",
    name: "Department of Permits, Licenses, and Inspections (PLI)",
    phone: "412-255-2175",
    email: "PLIAppTech@pittsburghpa.gov",
    url: "https://www.pittsburghpa.gov/Business-Development/Permits-Licenses-and-Inspections",
    addressLine: "412 Boulevard of the Allies, Pittsburgh, PA",
    hours: null,
    notes:
      "PLI issues building (the Building and Development Application), demolition, land operations, signs, electrical, mechanical, fire alarm, suppression, occupancy-only and occupant-load placard permits. It does not issue plumbing permits: \"all plumbing not associated with sprinkler systems in the City of Pittsburgh is regulated by Allegheny County Health Department, not the City.\" Applications and payment run through OneStopPGH (https://onestoppgh.pittsburghpa.gov/) or the OneStopPGH counter at 412 Boulevard of the Allies — card, check, money order or cashier's check, made out to \"Treasurer - City of Pittsburgh\"; no cash, no mail, and every card or eCheck payment carries a processing fee. The phone number is the one printed in the footer of every schedule page; application-technology questions go to PLIAppTech@pittsburghpa.gov.",
  },
];

const sources: SeedSource[] = [
  {
    key: PITT_FEE_SCHEDULE_SOURCE_KEY,
    jurisdictionKey: PITT_KEYS.jurisdiction,
    title: "2026 Fee Schedule, Department of Permits, Licenses, and Inspections, effective 1/1/2026",
    url: "https://www.pittsburghpa.gov/files/assets/city/v/1/pli/documents/fees/2026-fee-schedule-final-2.pdf",
    sourceType: "fee_schedule_pdf",
    issuingAuthority: "City of Pittsburgh, Department of Permits, Licenses, and Inspections",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: PITT_FEE_EFFECTIVE_FROM,
    retrievedAt: PITT_LAST_VERIFIED,
    lastVerifiedAt: PITT_LAST_VERIFIED,
    notes:
      "Read 2026-09-25 in both pdftotext -layout and plain modes, then diffed line for line against the 2025 predecessor so the year's change is recorded rather than assumed. Four pages: the \"ALL CONSTRUCTION PERMIT TYPES\" block ($6.00/$7.00 per $1,000 with printed minimums and maximums), the additional fees and discounts (technology fee brackets, SETF, digital record retention, the 15% Third Party Agency discount and the 40% application split), accelerated review and boards, and licenses and registrations. Every figure this site charges comes from the first two blocks; the calculator is cited only for arithmetic, never for amounts.",
  },
  {
    key: PITT_FEE_SCHEDULE_2025_SOURCE_KEY,
    jurisdictionKey: PITT_KEYS.jurisdiction,
    title: "2025 Fee Schedule, Department of Permits, Licenses, and Inspections, effective 1/1/2025",
    url: "https://www.pittsburghpa.gov/files/assets/city/v/1/pli/documents/fees/pli-fee-schedule-1-1-2025.pdf",
    sourceType: "fee_schedule_pdf",
    issuingAuthority: "City of Pittsburgh, Department of Permits, Licenses, and Inspections",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: "2025-01-01",
    retrievedAt: PITT_LAST_VERIFIED,
    lastVerifiedAt: PITT_LAST_VERIFIED,
    notes:
      "Superseded, read and diffed against the 2026 schedule on 2026-09-25. The residential rows did not move at all — rate, minimum and maximum are byte-identical — and the commercial, sign and stormwater ceiling went $80,000 → $95,000, with accelerated-review ceilings ($80,000 → $95,000, residential $8,000 → $9,200), commercial overtime inspections $785 → $699, residential $175 → $150, and some business-license rows. Recorded because a ceiling that moved is the kind of figure a page must not publish from memory.",
  },
  {
    key: PITT_FEES_PAGE_SOURCE_KEY,
    jurisdictionKey: PITT_KEYS.jurisdiction,
    title: "PLI Fees — City of Pittsburgh",
    url: "https://www.pittsburghpa.gov/Business-Development/Permits-Licenses-and-Inspections/Fees",
    sourceType: "municipal_website",
    issuingAuthority: "City of Pittsburgh, Department of Permits, Licenses, and Inspections",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: PITT_LAST_VERIFIED,
    lastVerifiedAt: PITT_LAST_VERIFIED,
    notes:
      "Read 2026-09-25 (page states \"last updated: 09/02/2026\"). It links the schedule in force and states the mechanism in one sentence: \"The cost of a permit will now be calculated based on the total construction value of the project… if the construction value changes between the time of application and permit issuance, the total cost of your permit may also change.\" It also carries the SETF statute the schedule does not (Act 37 of 2017, $4.00 → $4.50 effective October 25, 2017), the zoning note (\"Zoning Fees may apply. Please consult the Zoning Fee Schedule.\"), the expedited-review capacity limit, the payment rules, and the link to City Planning's separate zoning fee schedule.",
  },
  {
    key: PITT_FEE_CALCULATOR_SOURCE_KEY,
    jurisdictionKey: PITT_KEYS.jurisdiction,
    title: "PLI Permitting Fee Calculator (HTML app, dated 1-3-2025)",
    url: "https://www.pittsburghpa.gov/files/assets/city/v/2/pli/documents/fees/pli-permitting-fee-calculator_1-3-2025.html",
    sourceType: "official_calculator",
    issuingAuthority: "City of Pittsburgh, Department of Permits, Licenses, and Inspections",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2025-01-03",
    effectiveFrom: null,
    retrievedAt: PITT_LAST_VERIFIED,
    lastVerifiedAt: PITT_LAST_VERIFIED,
    notes:
      "Read 2026-09-25 by extracting the four quoted passages from the app's own tw-passagedata source rather than inferring them from its output. It carries the City's arithmetic as code: `permit_fee_rate_residential = .006`, `permit_fee_rate_commercial = .007`, the min–max clamps on the multiplied figure, the technology brackets keyed on `adj_base_fee_calc`, `tpa_discount = adj_base_fee_calc * .15`, the 40% application fee, the SETF waiver, the flat reconnect rows and the bundled zoning estimate. It predates the 2026 schedule and still holds the $80,000 commercial maximum, so where the two disagree on an amount the schedule wins.",
  },
  {
    key: PITT_FEE_CALCULATOR_PAGE_SOURCE_KEY,
    jurisdictionKey: PITT_KEYS.jurisdiction,
    title: "Fee Calculator — City of Pittsburgh PLI",
    url: "https://www.pittsburghpa.gov/Business-Development/Permits-Licenses-and-Inspections/Fees/Fee-Calculator",
    sourceType: "municipal_website",
    issuingAuthority: "City of Pittsburgh, Department of Permits, Licenses, and Inspections",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: PITT_LAST_VERIFIED,
    lastVerifiedAt: PITT_LAST_VERIFIED,
    notes:
      "Read 2026-09-25. The index that points at both calculators and states the honesty rule this site quotes on its pages: \"PLI will verify the final cost of your application based on our most current fee schedule both when you apply for your permit and again when your permit is issued.\"",
  },
  {
    key: PITT_PERMITTING_SOURCE_KEY,
    jurisdictionKey: PITT_KEYS.jurisdiction,
    title: "Permitting — City of Pittsburgh PLI",
    url: "https://www.pittsburghpa.gov/Business-Development/Permits-Licenses-and-Inspections/Permitting",
    sourceType: "municipal_website",
    issuingAuthority: "City of Pittsburgh, Department of Permits, Licenses, and Inspections",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: PITT_LAST_VERIFIED,
    lastVerifiedAt: PITT_LAST_VERIFIED,
    notes:
      "Read 2026-09-25 (page states \"last updated: 09/14/2026\"). The source of the two structure-type definitions the fee split turns on — Residential single-family, Residential two-family and Commercial \"all other uses\", each stated in IRC and IBC terms — the three work types, the five-step permit process, the list of permit types PLI issues, the hand-off \"Allegheny County Health Department Plumbing Division is responsible for plumbing permits\", and the asbestos warning that can stop a demolition before PLI sees it.",
  },
  {
    key: PITT_ELECTRICAL_PAGE_SOURCE_KEY,
    jurisdictionKey: PITT_KEYS.jurisdiction,
    title: "Electrical Permit — City of Pittsburgh PLI",
    url: "https://www.pittsburghpa.gov/Business-Development/Permits-Licenses-and-Inspections/Permitting/Electrical-Permit",
    sourceType: "municipal_website",
    issuingAuthority: "City of Pittsburgh, Department of Permits, Licenses, and Inspections",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: PITT_LAST_VERIFIED,
    lastVerifiedAt: PITT_LAST_VERIFIED,
    notes:
      "Read 2026-09-25. States when an electrical permit is required (renovate and repair, extend or modify, install new), the residential and commercial work scopes, and the one sentence that tells a reader which fee column applies: \"Work on single and two-family homes and structures accessory to them requires a Residential permit, while all other work requires a Commercial permit.\" It is also where the stamped-drawing requirements live: a service rated over 400 A, and every commercial new-construction scope.",
  },
  {
    key: PITT_MECHANICAL_PAGE_SOURCE_KEY,
    jurisdictionKey: PITT_KEYS.jurisdiction,
    title: "Mechanical Permit — City of Pittsburgh PLI",
    url: "https://www.pittsburghpa.gov/Business-Development/Permits-Licenses-and-Inspections/Permitting/Mechanical-Permit",
    sourceType: "municipal_website",
    issuingAuthority: "City of Pittsburgh, Department of Permits, Licenses, and Inspections",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: PITT_LAST_VERIFIED,
    lastVerifiedAt: PITT_LAST_VERIFIED,
    notes:
      "Read 2026-09-25. The same residential/commercial sentence as the electrical page for mechanical and fuel-gas work, the work scopes for each work type (including the emergency-replacement scopes for equipment condemned by PLI), and the requirement that commercial new-construction mechanical work \"requires the submission of stamped drawings\". It publishes no fee of its own, which is why this page's rules are the schedule's rows verbatim.",
  },
  {
    key: PITT_TPA_SOURCE_KEY,
    jurisdictionKey: PITT_KEYS.jurisdiction,
    title: "Third Party Agencies and Special Inspections — City of Pittsburgh PLI",
    url: "https://www.pittsburghpa.gov/Business-Development/Permits-Licenses-and-Inspections/Permitting/Third-Party-Agencies-and-Special-Inspections",
    sourceType: "municipal_website",
    issuingAuthority: "City of Pittsburgh, Department of Permits, Licenses, and Inspections",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: PITT_LAST_VERIFIED,
    lastVerifiedAt: PITT_LAST_VERIFIED,
    notes:
      "Read 2026-09-25. The page that resolves the schedule's \"on applicable permit types\": PLI requires \"TPA Inspection of commercial electrical permits\" (plus stormwater after 5/25/22 and residential electrical before 1/1/21) and says \"A TPA discount per PLI's Current Fee Schedule is applicable to permits that require TPA services.\" Without it, the 15% discount could not be attached to a specific row; with it, the discounted commercial electrical row is sourced rather than guessed.",
  },
  {
    key: PITT_WORK_NOT_REQUIRING_SOURCE_KEY,
    jurisdictionKey: PITT_KEYS.jurisdiction,
    title: "Work Not Requiring a Permit — City of Pittsburgh PLI",
    url: "https://www.pittsburghpa.gov/Business-Development/Permits-Licenses-and-Inspections/Permitting/Work-Not-Requiring-a-Permit",
    sourceType: "municipal_website",
    issuingAuthority: "City of Pittsburgh, Department of Permits, Licenses, and Inspections",
    authorityKind: "city",
    isPrimary: true,
    documentDate: null,
    effectiveFrom: null,
    retrievedAt: PITT_LAST_VERIFIED,
    lastVerifiedAt: PITT_LAST_VERIFIED,
    notes:
      "Read 2026-09-25. Three exemption lists (no Building and Development Application at all, zoning review only, and no electrical permit) with the City's own disclaimer that \"we reserve the right to make exceptions to the information listed on this page\". It is also where the June 2024 BDA consolidation is stated — \"the Building and Development Application (BDA), which combined the Building Permit with Zoning approval into one application\" — and where the Allegheny County plumbing sentence appears a second time, independently confirming the fact that made this jurisdiction's third page mechanical rather than plumbing.",
  },
];

/** Empty on purpose: the permit types Pittsburgh uses already exist as shared rows. */
const permitTypes: JurisdictionSeed["permitTypes"] = [];
const projectTypes: JurisdictionSeed["projectTypes"] = [];

const jurisdictionPermitTypes: SeedJurisdictionPermitType[] = [
  {
    jurisdictionKey: PITT_KEYS.jurisdiction,
    permitTypeKey: "building",
    isAvailable: true,
    localName: "Building permit (Building and Development Application)",
    officialUrl:
      "https://www.pittsburghpa.gov/Business-Development/Permits-Licenses-and-Inspections/Permitting",
    notes:
      "One formula for every construction permit type: total construction value × $6.00 per $1,000 (residential, $130–$8,000) or × $7.00 per $1,000 (commercial, $605–$95,000), prorated because neither the schedule nor the City's calculator rounds to whole thousands. The technology fee, the $4.50 SETF and the $5.00 digital record retention ride on top, and 40% of the base fee is due at application, non-refundable, with the balance at issuance. Zoning approval has been bundled into this application since June 2024; the zoning fee has not.",
  },
  {
    jurisdictionKey: PITT_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    isAvailable: true,
    localName: "Electrical permit",
    officialUrl:
      "https://www.pittsburghpa.gov/Business-Development/Permits-Licenses-and-Inspections/Permitting/Electrical-Permit",
    notes:
      "The same two rows, chosen by the same sentence the City prints on this page (single and two-family homes are Residential, everything else is Commercial) — except that commercial electrical permits require third-party inspection and therefore take the schedule's 15% TPA discount, which this site folds into the row: $5.95 per $1,000, minimum $514.25, maximum $80,750. Stand-alone permit, outside the Building and Development Application.",
  },
  {
    jurisdictionKey: PITT_KEYS.jurisdiction,
    permitTypeKey: "mechanical",
    isAvailable: true,
    localName: "Mechanical permit",
    officialUrl:
      "https://www.pittsburghpa.gov/Business-Development/Permits-Licenses-and-Inspections/Permitting/Mechanical-Permit",
    notes:
      "Mechanical and fuel-gas work on the schedule's own rows — the undiscounted $6.00/$7.00 per $1,000 with the same clamps — because PLI's third-party-inspection list covers electrical and stormwater permits, never mechanical. A stand-alone permit; commercial new construction requires stamped drawings. Plumbing is not priced by the City at all: Allegheny County Health Department issues those permits.",
  },
];

const feeSchedules: SeedFeeSchedule[] = [
  {
    key: PITT_KEYS.feeSchedule,
    jurisdictionKey: PITT_KEYS.jurisdiction,
    sourceKey: PITT_FEE_SCHEDULE_SOURCE_KEY,
    title: "City of Pittsburgh PLI Fee Schedule (2026, effective January 1, 2026)",
    officialUrl:
      "https://www.pittsburghpa.gov/files/assets/city/v/1/pli/documents/fees/2026-fee-schedule-final-2.pdf",
    effectiveFrom: PITT_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: PITT_LAST_VERIFIED,
    notes:
      "The document the PLI Fees page links as current, headed \"2026 FEE SCHEDULE / EFFECTIVE 1/1/2026\". Diffed against the 2025 predecessor on 2026-09-25: the residential rows are unchanged and the commercial/sign/stormwater maximum moved $80,000 → $95,000, so the modelled ceiling is the 2026 one. PLI's own calculator is dated 1-3-2025 and still carries $80,000 — where the two disagree on an amount the schedule wins, and the calculator is cited only for arithmetic.",
  },
];

function attach(permitTypeKey: string, rules: SeedFeeRule["rule"][]): SeedFeeRule[] {
  return rules.map((rule) => ({
    jurisdictionKey: PITT_KEYS.jurisdiction,
    permitTypeKey,
    scheduleKey: PITT_KEYS.feeSchedule,
    rule,
  }));
}

const feeRules: SeedFeeRule[] = [
  ...attach("building", PITT_BUILDING_BASE_RULES),
  ...attach("electrical", PITT_ELECTRICAL_BASE_RULES),
  ...attach("mechanical", PITT_MECHANICAL_BASE_RULES),
];

const requirements: SeedRequirement[] = [
  {
    jurisdictionKey: PITT_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "document",
    title: "One Building and Development Application through OneStopPGH, zoning approval included",
    description:
      "Since June 2024 the application itself changed shape: \"In June 2024, OneStopPGH launched the Building and Development Application (BDA), which combined the Building Permit with Zoning approval into one application. You can apply for a BDA for work that requires only PLI review, only Zoning review, or both.\" So the building permit and the zoning decision are filed together, while the separate trades — electrical, mechanical — are still their own stand-alone permits. PLI's own disclaimer stands beside the list: \"Because every situation is unique and can be interpreted individually by the Building Code Official, we reserve the right to make exceptions to the information listed on this page.\"",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: PITT_WORK_NOT_REQUIRING_SOURCE_KEY,
    lastVerifiedAt: PITT_LAST_VERIFIED,
  },
  {
    jurisdictionKey: PITT_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "document",
    title: "The total construction value — declared at application, checked again at issuance",
    description:
      "The fee is \"calculated based on the total construction value of the project\", and the value is not taken once: \"PLI will verify the final cost of your application based on our most current fee schedule both when you apply for your permit and again when your permit is issued\" — which the Fees page puts as \"if the construction value changes between the time of application and permit issuance, the total cost of your permit may also change.\" The figure the permit ultimately costs is therefore the one verified at issuance, not necessarily the one declared at submission.",
    isMandatory: true,
    sortOrder: 20,
    sourceKey: PITT_FEES_PAGE_SOURCE_KEY,
    lastVerifiedAt: PITT_LAST_VERIFIED,
  },
  {
    jurisdictionKey: PITT_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "zoning_review",
    title: "A mandatory pre-application meeting for complex projects, with every other fee deferred to after it",
    description:
      "The calculator's own flag states the threshold and the consequence: a Building & Development permit of 50,000+ square feet, or 100 or more new dwelling units, or more than $20,000,000 of construction value \"requires a mandatory pre-application meeting. You will be charged only for this meeting at application. All other fees and requirements will be assessed following the pre-application meeting.\" A total for such a project is therefore not final before that meeting, and this site says so on the page rather than publishing a figure the City has not set. Zoning fees likewise sit outside the BDA: \"Zoning Fees may apply. Please consult the Zoning Fee Schedule.\"",
    isMandatory: true,
    sortOrder: 30,
    sourceKey: PITT_FEE_CALCULATOR_SOURCE_KEY,
    lastVerifiedAt: PITT_LAST_VERIFIED,
  },
  {
    jurisdictionKey: PITT_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "document",
    title: "An electrical permit of its own, filed outside the Building and Development Application",
    description:
      "\"An electrical permit is required for the following work in the City of Pittsburgh: Renovate and repair existing electrical systems. Extend or modify an existing electrical system. Installation of a new electrical system.\" It is one of the stand-alone trade permits PLI issues alongside the BDA, and the City tells the reader which column it takes in the same paragraph: \"Work on single and two-family homes and structures accessory to them requires a Residential permit, while all other work requires a Commercial permit.\"",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: PITT_ELECTRICAL_PAGE_SOURCE_KEY,
    lastVerifiedAt: PITT_LAST_VERIFIED,
  },
  {
    jurisdictionKey: PITT_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "document",
    title: "Stamped drawings for a service over 400 A and for commercial new construction",
    description:
      "Two scopes on the electrical page carry the same parenthetical — \"( Requires the submission of stamped drawings. )\" — a service rated over 400 amperes (residential new construction and addition/alteration alike) and the whole commercial new-construction block, which \"requires the submission of stamped drawings\" as a condition of the work type rather than of the fee. Neither changes a figure on this site's pages; both change what has to be submitted with the application.",
    isMandatory: true,
    sortOrder: 20,
    sourceKey: PITT_ELECTRICAL_PAGE_SOURCE_KEY,
    lastVerifiedAt: PITT_LAST_VERIFIED,
  },
  {
    jurisdictionKey: PITT_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "inspection",
    title: "Third-party inspection on commercial electrical permits — and the discount that comes with it",
    description:
      "PLI's Third Party Agencies page lists \"TPA Inspection of commercial electrical permits\" among the services PLI requires, and states \"A TPA discount per PLI's Current Fee Schedule is applicable to permits that require TPA services.\" The requirement and the discount are one fact seen from two sides: the inspection is outsourced to an agency, and the schedule pays 15% of the base fee back for the permits that require it. This site models the money as a lower commercial electrical rate ($5.95 per $1,000 rather than $7.00) and names the requirement beside it.",
    isMandatory: true,
    sortOrder: 30,
    sourceKey: PITT_TPA_SOURCE_KEY,
    lastVerifiedAt: PITT_LAST_VERIFIED,
  },
  {
    jurisdictionKey: PITT_KEYS.jurisdiction,
    permitTypeKey: "mechanical",
    requirementType: "document",
    title: "A mechanical permit of its own, with stamped drawings for commercial new construction",
    description:
      "\"A mechanical permit is required for the following work in the City of Pittsburgh: Renovate and repair mechanical or fuel gas systems. Extend or modify an existing mechanical or fuel gas system. Installation of new mechanical or fuel gas systems.\" It is a stand-alone trade permit, and the commercial new-construction block \"requires the submission of stamped drawings\" — the same submission rule the electrical page prints for its own commercial scopes. The same residential/commercial sentence applies verbatim.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: PITT_MECHANICAL_PAGE_SOURCE_KEY,
    lastVerifiedAt: PITT_LAST_VERIFIED,
  },
  {
    jurisdictionKey: PITT_KEYS.jurisdiction,
    permitTypeKey: "mechanical",
    requirementType: "other",
    title: "Plumbing is not filed here at all — Allegheny County issues those permits",
    description:
      "\"Please note that Allegheny County Health Department Plumbing Division is responsible for plumbing permits\", and the work-not-requiring-a-permit page says it again: \"all plumbing not associated with sprinkler systems in the City of Pittsburgh is regulated by Allegheny County Health Department, not the City.\" A reader who reaches this page expecting a plumbing fee has not been given a wrong answer — the City publishes no plumbing rate to quote, which is why this jurisdiction's third page is mechanical.",
    isMandatory: false,
    sortOrder: 20,
    sourceKey: PITT_PERMITTING_SOURCE_KEY,
    lastVerifiedAt: PITT_LAST_VERIFIED,
  },
];

const profile: SeedProfile = {
  jurisdictionKey: PITT_KEYS.jurisdiction,
  headline: "What construction permits cost in Pittsburgh",
  summary:
    "Pittsburgh prices every construction permit — building, electrical, mechanical — off one number: the total construction value of the project. Multiply it by $6.00 per $1,000 for a residential structure or $7.00 per $1,000 for a commercial one, clamp the answer between the published minimum and maximum ($130 to $8,000 residential, $605 to $95,000 commercial), and three add-ons ride on top of every permit: a technology fee of $2, $5, $15 or $25 selected by the size of the base fee itself, the State's $4.50 code-official training fund, and a $5.00 digital record retention fee. Exactly one published figure in the whole stack reduces a total instead of adding to it — the required 15% Third Party Agency discount on commercial electrical permits, folded into that row's rate as $5.95 per $1,000.",
  localContext:
    "One department, one portal, one formula. The **Department of Permits, Licenses, and Inspections (PLI)** issues building, electrical, mechanical, demolition, sign, fire alarm and suppression permits from 412 Boulevard of the Allies (412-255-2175), and applications and payment run through **OneStopPGH** — online, or at the OneStopPGH counter with a card, check, money order or cashier's check made out to \"Treasurer - City of Pittsburgh\"; no cash, no mail, and every card or eCheck payment carries a processing fee the City names rather than hides.\n\n**The application changed shape in June 2024.** OneStopPGH's Building and Development Application \"combined the Building Permit with Zoning approval into one application\", so the zoning *decision* now travels inside the permit application. The zoning *fee* does not: it stays on City Planning's own schedule, and the Fees page says so — \"Zoning Fees may apply. Please consult the Zoning Fee Schedule.\" Electrical and mechanical permits remain stand-alone trade permits beside the BDA.\n\n**The column is declared, not derived, and the City defines it twice.** The Permitting page defines Residential – single-family (detached single-family dwellings and townhouses three stories or less under the IRC, plus their accessory structures) and Residential – two-family (detached two-family dwellings on the same terms), against Commercial – \"all other uses\": everything the IBC regulates, attached and mixed-use dwellings, anything over three stories, and non-residential uses. The trade pages compress it to one sentence — \"Work on single and two-family homes and structures accessory to them requires a Residential permit, while all other work requires a Commercial permit.\" The calculator's dropdown offers exactly those two values, and absent the flag this site applies the commercial row, which is the larger figure. Work type and occupancy class touch no figure on the schedule.\n\n**The schedule and the calculator disagree on one amount, and the schedule wins.** The 2026 schedule (effective 1/1/2026) prints a commercial ceiling of $95,000; its 2025 predecessor printed $80,000, and the two were diffed line for line on 2026-09-25 to see which was in force — the residential rows did not move at all. The City's calculator is dated 1-3-2025 and still holds $80,000, so it is cited for *arithmetic* (the rate variables, the clamps, the bracket logic) and never for an amount.\n\n**The City checks the value twice, and says so.** \"PLI will verify the final cost of your application based on our most current fee schedule both when you apply for your permit and again when your permit is issued\" — so the fee can move between submission and issuance if the construction value does. And 40% of the base fee is due at application, non-refundable, with the balance due at issuance: a payment schedule and a forfeiture risk rather than an extra charge, because the total the permit costs does not change.",
  valuationBasis:
    "**Total construction value** — one basis for all three permits. The Fees page states it plainly: \"The cost of a permit will now be calculated based on the total construction value of the project\". There is no square-footage row, no fixture count, no per-device ladder anywhere in the construction block; the reader declares a structure type and gives a value, and the schedule does the rest.\n\n**The multiplication is prorated, not rounded.** Neither the schedule nor the calculator prints \"or fraction thereof\" anywhere in the base block, and the calculator's code is `base_fee_calc = con_value_validated * permit_fee_rate_residential` with `permit_fee_rate_residential = .006` — a straight multiplication. $25,100 of construction value is therefore **$150.60** of fee, not the $156 a per-thousand round-up would charge. This site models that as `per_thousand` with no increment, which is exactly what that optional field means: the basis was not rounded (Las Cruces, on a schedule that does print the phrase, is the opposite reading in the same engine).\n\n**The clamp sits on the multiplied figure.** The calculator proves it by labelling its outputs \"PLI Minimum Fee Applies\" and \"PLI Maximum Fee Applies\" against the adjusted base: `if base < minimum → adj = minimum; elif base > maximum → adj = maximum`. So a $5,000 residential project is $30 of arithmetic lifted to the printed $130, and a $20,000,000 commercial project's $140,000 is held to the printed $95,000.\n\n**One add-on reads the fee rather than the value.** The technology fee's four brackets ($2 / $5 / $15 / $25) are selected by \"range of Base Permit Fee\", which the calculator keys on the clamped base — so it is a table read on this permit's own base fee, and it exists even when the base fee hit its minimum: a $130 permit still pays the $2.00 bracket.",
  notIncluded:
    "These figures are Pittsburgh's building, electrical and mechanical permit fees from the 2026 schedule, plus the three add-ons that ride on every one of them. They are not a total project cost, and they exclude:\n\n- **Zoning fees.** The BDA bundles the zoning *approval*; City Planning's Zoning Fee Schedule sets the price, and the Fees page directs the reader there. The calculator embeds an internal estimate (0.1% of value residential, 0.3% commercial, $50/$100 minimums, $40,000 cap) that appears on no published schedule, so it is recorded in the research file and never quoted as a rate.\n- **Accelerated Plan Review** — 1.5% or 1.0% of value with their own floors and caps — and currently unavailable for everything except fire alarm and fire suppression: \"Due to current capacity, expedited review is only offered for Fire Alarm and Fire Suppression permit types.\"\n- **The pre-application plan review meeting** (0.25% of project value, $125–$7,000) and **the complex-project path**, where a mandatory meeting is charged first and \"All other fees and requirements will be assessed following the pre-application meeting\" — so such a total is not final.\n- **The 40% application split** — \"40% of Base Fee (Non-Refundable) Due at Application; Remainder of Base Fee Due at Issuance\". Timing and forfeiture risk, never an addition: named on every page, never summed.\n- **The reconnect flat rows** ($75 residential / $150 commercial), which exist only in the City's calculator and print on no schedule.\n- **Every other row on the same schedule**: sign (with its own $350 minimum) and stormwater base rows, demolition, land operations, occupancy-only and placard permits, fire alarm and suppression with their $100 maintenance fee, certificates of occupancy, floodplain review, overtime inspections, boards, trade and business licenses, registrations, permit amendments (the same rates on the *change* in value) and the $50 license-holder change.\n- **Plumbing**, which the City does not issue: \"all plumbing not associated with sprinkler systems in the City of Pittsburgh is regulated by Allegheny County Health Department, not the City.\" The County's asbestos permit, needed before many demolitions, is another authority's charge entirely.\n- **Payment processing fees** — the credit card and eCheck surcharges the fees page warns about.",
  seoTitle: "Pittsburgh PA construction permit fees",
  seoDescription:
    "How Pittsburgh prices building, electrical and mechanical permits — $6 or $7 per $1,000 of construction value, clamped $130-$8,000 or $605-$95,000, prorated rather than rounded up, with a $2-$25 technology fee, $4.50 SETF and $5.00 record retention on top.",
  publishStatus: "published",
  noindex: false,
  lastReviewedAt: PITT_LAST_VERIFIED,
};

const permitPages: SeedPermitPage[] = [
  {
    jurisdictionKey: PITT_KEYS.jurisdiction,
    permitTypeKey: "building",
    slug: "building-permit-cost",
    title: "Pittsburgh building permit cost",
    intro:
      "Pittsburgh prices a building permit off the project's total construction value, in one of two columns the applicant declares rather than derives: $6.00 per $1,000 for a residential structure, floored at $130 and capped at $8,000 — or $7.00 per $1,000 for everything else, floored at $605 and capped at $95,000 as the 2026 schedule prints it. The schedule shows no \"or fraction thereof\" anywhere in the block and the City's own calculator multiplies straight through, so $25,100 of construction value is $150.60 of fee rather than the $156 a round-up would charge. Three add-ons ride on every permit: a technology fee of $2, $5, $15 or $25 chosen by the size of the base fee itself, the State's $4.50 code-official training fund, and a $5.00 digital record retention fee — and 40% of the base fee is due at application, non-refundable, with the balance at issuance.",
    localSummary:
      "Structure type is the whole switch, and the City defines it twice. Detached single-family dwellings and townhouses three stories or less under the IRC — and detached two-family dwellings on the same terms — are residential; everything the IBC regulates is commercial, including attached single- and two-family dwellings, mixed-use buildings and anything over three stories. So a three-storey apartment building takes the commercial column while a three-storey townhouse does not: the split is the building type, not the occupancy. Work type, occupancy class and scope questions touch no figure on this schedule, and absent a structure-type flag the commercial row applies, which is the larger figure.\n\nThe clamp sits after the multiplication rather than before it, which is what makes the two published extremes behave differently from the arithmetic. A $5,000 residential project computes $30 of fee and pays the printed $130; a $1,240,000 commercial addition computes $8,680 of fee with nothing to clamp, and the technology fee then reads its bracket off that figure — $15, because $8,680 sits in the $1,001 to $10,000 band. Zoning approval has travelled inside this application since June 2024; the zoning fee has not, and it stays on City Planning's separate schedule.",
    notIncluded:
      "This is the 2026 schedule's construction block — the two base rows with their printed clamps — plus the technology fee, the $4.50 SETF and the $5.00 record retention that ride on every permit. It excludes:\n\n- **Zoning fees**, which stay on City Planning's Zoning Fee Schedule even though zoning approval now comes inside the BDA; the calculator's internal estimate (0.1% / 0.3% of value, $50 / $100 minimums, $40,000 cap) is recorded in the research record and never published as a rate.\n- **Accelerated Plan Review** — 1.5% of value on the BDA (minimum $2,500, maximum $95,000) — and currently offered only for fire alarm and fire suppression: \"Due to current capacity, expedited review is only offered for Fire Alarm and Fire Suppression permit types.\"\n- **The pre-application plan review meeting** (0.25% of project value, $125–$7,000) and the **complex-project path**, whose mandatory meeting is charged first while every other fee waits: a total for a project of 50,000+ square feet, 100+ units or more than $20,000,000 is not final here.\n- **The 40% application split** — timing and a forfeiture risk, never an addition to the total.\n- **Every other row on the same schedule**: sign, stormwater, demolition, land operations, occupancy-only and placard permits, fire alarm and suppression (plus the $100 maintenance fee), certificates of occupancy, floodplain review, overtime inspections, boards, licenses, registrations and amendments.\n- **Plumbing**, issued by Allegheny County Health Department, and the County's asbestos permit that may be needed before a demolition.\n- **Payment processing fees** on credit card and eCheck, and every other authority's charge.",
    workedExample: {
      scenario:
        "A warehouse addition built onto an existing commercial building — attached, so the commercial column — with a declared construction value of $1,240,000.",
      inputs: {
        valuationCents: 124_000_000,
        occupancy: "commercial",
        workType: "addition",
      },
      notes:
        "The commercial row: $7.00 per $1,000 of $1,240,000 is $8,680.00, above the printed $605 minimum and far below the printed $95,000 maximum, so neither clamp contributes. The technology fee reads its bracket off that base fee — $1,001 to $10,000 is the $15.00 band — and the two flat add-ons complete the stack: $5.00 of digital record retention and the $4.50 State training fund, for $8,704.50 in total.\n\nThe neighbouring cases show each published boundary doing its own job. The same addition flagged as a residential structure computes $7,440.00 at $6.00 per $1,000, still unclamped, for $7,464.50 with the same add-ons. A $25,100 project computes $150.60 — prorated, not the $156 a round-up would charge — plus $2.00 of technology fee (the $0 to $200 band) and the same two flats, for $162.10. And a $5,000 project computes $30 of arithmetic that the published $130 minimum lifts, so its total is $141.50.",
    },
    faqs: [
      {
        question: "How much is a building permit for a house in Pittsburgh?",
        answer:
          "$6.00 for every $1,000 of construction value, with a minimum of $130 and a maximum of $8,000. A $25,100 project is $150.60 of fee — the schedule's rate applied to the value without rounding up to whole thousands — plus the $2.00 technology fee, $5.00 record retention and $4.50 State training fund. Set the structure type to residential to reach this row; it covers detached single-family dwellings and townhouses three stories or less under the IRC, and detached two-family dwellings.",
        sourceId: PITT_FEE_SCHEDULE_SOURCE_KEY,
        attribution: "2026 Fee Schedule, \"ALL CONSTRUCTION PERMIT TYPES\" block, effective 1/1/2026.",
      },
      {
        question: "How much is a building permit for a commercial project?",
        answer:
          "$7.00 for every $1,000 of construction value, with a minimum of $605 and a maximum of $95,000. The $95,000 ceiling is the 2026 schedule's own: its 2025 predecessor printed $80,000, and the two documents were diffed line for line on 2026-09-25 to confirm which was in force. Attached and mixed-use buildings, non-residential uses and anything over three stories all take this column, whether or not a flag is set.",
        sourceId: PITT_FEE_SCHEDULE_SOURCE_KEY,
        attribution: "2026 Fee Schedule (commercial row) with the 2025 predecessor, both read 2026-09-25.",
      },
      {
        question: "Does the fee round up to the next $1,000 of value?",
        answer:
          "No. The schedule prints no \"or fraction thereof\" in the base block, and PLI's own calculator multiplies straight through — its code is `con_value_validated * .006` — so $25,100 of construction value is $150.60 of fee, not the $156 a per-thousand round-up would produce. The clamp applies to that multiplied figure: the calculator's own outputs are labelled \"PLI Minimum Fee Applies\" and \"PLI Maximum Fee Applies\" on the adjusted base.",
        sourceId: PITT_FEE_CALCULATOR_SOURCE_KEY,
        attribution: "PLI Permitting Fee Calculator, base-fee and clamp arithmetic, read from its source on 2026-09-25.",
      },
      {
        question: "What fees are added on top of the base fee?",
        answer:
          "Three, on every permit of this type. A technology fee whose bracket is chosen by the size of the base fee itself — $2.00 for a base fee of $0 to $200, $5.00 for $201 to $1,000, $15.00 for $1,001 to $10,000, $25.00 above that; a $130 minimum permit still pays the $2.00 bracket. A State Education & Training Fund fee of $4.50, which the City's fees page ties to Act 37 of 2017 raising the code-official training fund from $4.00 effective October 25, 2017. And a $5.00 digital record retention fee.",
        sourceId: PITT_FEES_PAGE_SOURCE_KEY,
        attribution: "2026 Fee Schedule's \"ADDITIONAL PERMIT FEES AND DISCOUNTS\" rows; the SETF statute is on the PLI Fees page.",
      },
      {
        question: "How much is due when I apply?",
        answer:
          "40% of the base fee, and it is non-refundable: \"40% of Base Fee (Non-Refundable) Due at Application; Remainder of Base Fee Due at Issuance\", printed once per base row. The split is a payment schedule rather than an extra charge — the total the permit costs does not change — but the first 40% is at risk if the application is abandoned. PLI also verifies the value twice: \"PLI will verify the final cost of your application based on our most current fee schedule both when you apply for your permit and again when your permit is issued.\"",
        sourceId: PITT_FEES_PAGE_SOURCE_KEY,
        attribution: "2026 Fee Schedule's application-split row; the verification sentence is on the Fee Calculator page.",
      },
      {
        question: "Is the zoning fee inside this total?",
        answer:
          "No. Since June 2024 the Building and Development Application has \"combined the Building Permit with Zoning approval into one application\", so the zoning decision arrives with the permit — but the zoning fee is City Planning's own schedule, and the Fees page says \"Zoning Fees may apply. Please consult the Zoning Fee Schedule.\" The calculator's internal zoning estimate (0.1% of value residential, 0.3% commercial, $50 / $100 minimums, a $40,000 cap) appears on no published schedule, so this site names it rather than charging it.",
        sourceId: PITT_WORK_NOT_REQUIRING_SOURCE_KEY,
        attribution: "Work Not Requiring a Permit page (June 2024 BDA consolidation); the zoning sentence is on the PLI Fees page.",
      },
    ],
    seoTitle: "Pittsburgh PA building permit cost",
    seoDescription:
      "Pittsburgh building permit fees — $6 per $1,000 residential ($130-$8,000) or $7 per $1,000 commercial ($605-$95,000) of construction value, prorated rather than rounded, plus a $2-$25 technology fee, $4.50 SETF and $5.00 retention.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: PITT_LAST_VERIFIED,
  },
  {
    jurisdictionKey: PITT_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    slug: "electrical-permit-cost",
    title: "Pittsburgh electrical permit cost",
    intro:
      "Pittsburgh charges an electrical permit with the same formula as a building permit, and the City prints the column rule on the permit page itself: \"Work on single and two-family homes and structures accessory to them requires a Residential permit, while all other work requires a Commercial permit.\" Residential work is $6.00 per $1,000 of construction value between $130 and $8,000. Commercial work is the $7.00 row between $605 and $95,000 with the schedule's 15% Third Party Agency discount already applied to it — PLI requires third-party inspection of commercial electrical permits — which lands at $5.95 per $1,000, floored at $514.25 and capped at $80,750. The technology fee, the State's $4.50 training fund and $5.00 of record retention ride on top as they do everywhere else.",
    localSummary:
      "The discount is folded into the row rather than subtracted at the end because this engine has no negative component — and the folding is exact. The City's calculator clamps first and then subtracts 15% of the clamped figure; scaling by 0.85 and clamping commute for a positive scale, so $605 × 0.85 = $514.25 and $95,000 × 0.85 = $80,750 reproduce the City's arithmetic for every input. A $100,000 commercial job is $595.00 of base where the undiscounted schedule row would say $700 — the discount is worth $105 on that job, and it comes from the inspection PLI requires rather than from an election the filer makes.\n\nOne nuance is recorded rather than smoothed over. The calculator reads the technology fee's bracket off the base fee *before* the discount, while this page's commercial row already carries it, so a pre-discount base fee just above $200, $1,000 or $10,000 is charged one band lower here than the calculator shows — a difference of $3 to $10, carried as a needs-review note against that rule. The reconnect fees ($75 residential, $150 commercial) exist only in the calculator, and the scopes that need no permit at all are listed on the City's exemptions page.",
    notIncluded:
      "This is the 2026 schedule's construction block as the electrical permit takes it — the residential row, the commercial row after the required TPA discount — plus the technology fee, the $4.50 SETF and the $5.00 record retention. It excludes:\n\n- **The reconnect flat rows**, $75 residential and $150 commercial, which the City's calculator carries and the schedule never prints: a different work scope (\"Service Reconnect In-Kind\"), named with their amounts rather than modelled.\n- **Accelerated Plan Review**, currently offered only for fire alarm and fire suppression permits, and the **pre-application plan review meeting** (0.25% of project value, $125–$7,000).\n- **The complex-project deferral**, where a mandatory meeting is charged first and every other fee waits until after it.\n- **The 40% application split** — timing and a forfeiture risk, never an addition to the total.\n- **Any discount on residential work.** PLI's third-party list covers commercial electrical permits, stormwater permits and residential electrical permits filed before 1/1/21; current residential work takes the undiscounted $6.00 row.\n- **Zoning fees**, which stay on City Planning's Zoning Fee Schedule.\n- **Fire alarm and suppression permits** with their $100 maintenance fee — separate permits, not this one.\n- **The scopes that need no electrical permit at all**, listed by the City (replacement of lamps, connection of approved portable equipment to permanently installed receptacles, temporary systems, radio and television transmission equipment) and worth reading before filing.\n- **Payment processing fees** and every other authority's charge, including the Allegheny County asbestos permit that may be needed before a demolition.",
    workedExample: {
      scenario:
        "The electrical work of a commercial tenant fit-out in an existing building — not a single- or two-family home, so the commercial column — with a declared construction value of $100,000.",
      inputs: {
        valuationCents: 10_000_000,
        occupancy: "commercial",
        workType: "alteration",
      },
      notes:
        "The discounted commercial row: $5.95 per $1,000 of $100,000 is $595.00, above the discounted $514.25 floor and far below the discounted $80,750 ceiling, so neither clamp contributes. The technology fee reads its bracket off that base — $201 to $1,000 is the $5.00 band — and the two flat add-ons complete the stack: $5.00 of record retention and the $4.50 State training fund, for $609.50 in total. The same job at the undiscounted $7.00 row would have been $700 of base, so the required discount is worth $105 here.\n\nThe neighbouring cases show the rest of the shape. The same $100,000 flagged as a residential structure takes the undiscounted $6.00 row — $600.00 of base, same $5.00 bracket, $614.50 in total — because PLI's third-party list does not reach current residential work. And a $5,000 commercial job computes $29.75 of rate that the discounted $514.25 minimum lifts, for $528.75 in total: the floor is the City's own $605 scaled by the discount, not a second minimum.",
    },
    faqs: [
      {
        question: "How much is an electrical permit in Pittsburgh?",
        answer:
          "The same as a building permit: $6.00 per $1,000 of construction value for a residential structure (minimum $130, maximum $8,000) and $7.00 per $1,000 for a commercial one (minimum $605, maximum $95,000), prorated rather than rounded to whole thousands — plus the technology fee, $4.50 State training fund and $5.00 record retention. There is no separate electrical schedule anywhere: the block is headed \"ALL CONSTRUCTION PERMIT TYPES\".",
        sourceId: PITT_FEE_SCHEDULE_SOURCE_KEY,
        attribution: "2026 Fee Schedule, \"ALL CONSTRUCTION PERMIT TYPES\" block, effective 1/1/2026.",
      },
      {
        question: "Why is a commercial electrical permit cheaper than a commercial building permit?",
        answer:
          "Because the third-party inspection PLI requires on it carries a published discount: \"Third Party Agency Discount — 15% of Base Fee on applicable permit types\", and PLI's Third Party Agencies page resolves \"applicable\" by listing \"TPA Inspection of commercial electrical permits\" among the services PLI requires. Fifteen percent off $7.00 per $1,000 is $5.95, and the clamps scale with it — $514.25 and $80,750 — because the discount applies to the clamped figure. This site folds it into the row, since the engine has no negative component.",
        sourceId: PITT_TPA_SOURCE_KEY,
        attribution: "Third Party Agencies and Special Inspections page with the schedule's discount row, both read 2026-09-25.",
      },
      {
        question: "Which column applies to my project — residential or commercial?",
        answer:
          "One sentence decides it: \"Work on single and two-family homes and structures accessory to them requires a Residential permit, while all other work requires a Commercial permit.\" So a detached house or townhouse three stories or less is residential, and an apartment building, an addition to a house with another use in it, or anything over three stories is commercial. The Permitting page gives the same split in IRC and IBC terms, and the calculator's dropdown offers exactly those two values.",
        sourceId: PITT_ELECTRICAL_PAGE_SOURCE_KEY,
        attribution: "Electrical Permit page, column rule; the definitions are on the Permitting page.",
      },
      {
        question: "What is the technology fee, and when is it charged?",
        answer:
          "A flat amount selected by the size of the permit's own base fee: $2.00 when the base fee is $0 to $200, $5.00 for $201 to $1,000, $15.00 for $1,001 to $10,000 and $25.00 above that. The calculator keys the bracket on the clamped base fee, so it is charged whether or not the base hit its minimum — a $130 permit still pays $2.00. On commercial electrical work this site reads the bracket off the discounted base, which differs from the calculator by $3 to $10 in three narrow bands; that difference is recorded as a needs-review note rather than hidden.",
        sourceId: PITT_FEE_SCHEDULE_SOURCE_KEY,
        attribution: "2026 Fee Schedule's technology-fee table; the bracket's basis is the calculator's `adj_base_fee_calc`.",
      },
      {
        question: "What electrical work needs no permit at all?",
        answer:
          "PLI publishes three exemption lists, and the electrical one covers \"Minor repair and maintenance work that includes the replacement of lamps or the connection of approved portable electrical equipment to approved permanently installed receptacles\", \"Radio and television transmission equipment\" (the Uniform Construction Code still applies to tower and antenna installation) and \"The installation of a temporary system\". The page carries the City's own caveat: \"Because every situation is unique and can be interpreted individually by the Building Code Official, we reserve the right to make exceptions.\"",
        sourceId: PITT_WORK_NOT_REQUIRING_SOURCE_KEY,
        attribution: "Work Not Requiring a Permit page, \"Work Not Requiring an Electrical Permit\".",
      },
      {
        question: "When are stamped drawings required?",
        answer:
          "For a service rated over 400 amperes — the residential new-construction and addition/alteration scopes each carry \"( Requires the submission of stamped drawings. )\" beside that scope — and for commercial new-construction electrical work as a condition of the work type. Neither rule changes the fee: the price is still construction value times the rate, but the application needs the drawings with it.",
        sourceId: PITT_ELECTRICAL_PAGE_SOURCE_KEY,
        attribution: "Electrical Permit page, residential and commercial work scopes.",
      },
    ],
    seoTitle: "Pittsburgh PA electrical permit cost",
    seoDescription:
      "Pittsburgh electrical permit fees — $6 per $1,000 residential, $5.95 per $1,000 commercial after the required 15% TPA discount ($514.25-$80,750), prorated construction value with the technology fee, $4.50 SETF and $5.00 retention on top.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: PITT_LAST_VERIFIED,
  },
  {
    jurisdictionKey: PITT_KEYS.jurisdiction,
    permitTypeKey: "mechanical",
    slug: "mechanical-permit-cost",
    title: "Pittsburgh mechanical permit cost",
    intro:
      "A mechanical permit covers mechanical and fuel-gas work in Pittsburgh, and it is priced from the same block as every other construction permit: $6.00 per $1,000 of construction value for a residential structure between $130 and $8,000, $7.00 per $1,000 for a commercial one between $605 and $95,000, applied to the value without rounding up to whole thousands. Mechanical work takes no Third Party Agency discount — PLI's third-party list covers electrical and stormwater permits — so the commercial row here is the undiscounted $7.00 one. The same three add-ons ride on top: a technology fee of $2 to $25 selected by the base fee's own size, the State's $4.50 training fund and $5.00 of record retention. Plumbing is not on this page at all: Allegheny County Health Department issues those permits.",
    localSummary:
      "Nothing about the job changes the price — not the system, not the work scope, not the occupancy. The mechanical permit page lists exhaust, fuel gas, hydronic, heating and ventilation, exterior equipment and refrigeration systems across new construction, addition/alteration and minor alteration scopes, and every one of them is priced by the same two rows, selected by nothing but the structure type the reader declares. A house's furnace replacement and a warehouse's rooftop unit run through identical arithmetic at $6 or $7 per $1,000; the work type decides which work scope is filed, and the work scope changes no figure.\n\nTwo submission facts sit outside the fee. Commercial new-construction mechanical work \"requires the submission of stamped drawings\", and the emergency-replacement scopes — interior or exterior equipment condemned by PLI and needed to keep the building safely occupied — are their own work scopes, one of them carrying the note that a Zoning Development Review may still be required. Fire alarm and suppression systems are separate permits with a $100 maintenance fee, and a demolition may need the County's asbestos permit before the City sees the project at all.",
    notIncluded:
      "This is the 2026 schedule's construction block as the mechanical permit takes it — the two undiscounted base rows — plus the technology fee, the $4.50 SETF and the $5.00 record retention. It excludes:\n\n- **Plumbing**, which Pittsburgh does not issue: \"all plumbing not associated with sprinkler systems in the City of Pittsburgh is regulated by Allegheny County Health Department, not the City.\" No plumbing rate exists on this site's Pittsburgh pages because the City publishes none.\n- **Fire alarm and suppression permits**, separate permits with their own $100 maintenance fee, and the accelerated plan review that is currently \"only offered for Fire Alarm and Fire Suppression permit types\" — those two trades are the only ones that can buy it.\n- **The Allegheny County asbestos permit**, which may be required before a demolition and which PLI warns about with fines \"of up to $25,000\" — another authority's charge entirely.\n- **The 40% application split** — timing and a forfeiture risk, never an addition to the total.\n- **The pre-application plan review meeting** (0.25% of project value, $125–$7,000) and the **complex-project deferral** that makes such a total non-final.\n- **Zoning fees**, which stay on City Planning's Zoning Fee Schedule.\n- **Every other row on the same schedule**: sign, stormwater, demolition, land operations, occupancy-only and placard permits, certificates of occupancy, floodplain review, overtime inspections, boards, licenses, registrations and amendments.\n- **Payment processing fees** on credit card and eCheck, and every other authority's charge.",
    workedExample: {
      scenario:
        "Replacing a furnace and its ductwork in a single-family house — residential structure type — with a declared construction value of $60,000.",
      inputs: {
        valuationCents: 6_000_000,
        workType: "replacement",
        custom: { structure_type: "residential" },
      },
      notes:
        "The residential row: $6.00 per $1,000 of $60,000 is $360.00, above the printed $130 minimum and below the printed $8,000 maximum, so neither clamp contributes. The technology fee reads its bracket off that base — $201 to $1,000 is the $5.00 band — and the two flat add-ons complete the stack: $5.00 of record retention and the $4.50 State training fund, for $374.50 in total.\n\nThe neighbouring cases show the shape from the other side. The same $60,000 without the residential flag computes $420.00 of rate at $7.00 per $1,000 — and the printed $605 commercial minimum lifts it, which is the first time on these three pages a minimum changes the answer rather than confirming it; the technology fee reads the clamped $605 and stays in its $5.00 band, for $619.50 in total. Mechanical work never takes the TPA discount either, because PLI's third-party-inspection list does not include mechanical permits. And a $5,000 residential project computes $30 of fee that the printed $130 minimum lifts, for $141.50 with the same add-ons.",
    },
    faqs: [
      {
        question: "How much is a mechanical permit in Pittsburgh?",
        answer:
          "$6.00 per $1,000 of construction value for a residential structure (minimum $130, maximum $8,000) and $7.00 per $1,000 for a commercial one (minimum $605, maximum $95,000), prorated rather than rounded to whole thousands, plus the technology fee, $4.50 State training fund and $5.00 record retention. The schedule publishes no mechanical-specific fee anywhere: the block is headed \"ALL CONSTRUCTION PERMIT TYPES\".",
        sourceId: PITT_FEE_SCHEDULE_SOURCE_KEY,
        attribution: "2026 Fee Schedule, \"ALL CONSTRUCTION PERMIT TYPES\" block, effective 1/1/2026.",
      },
      {
        question: "Does a mechanical permit get the 15% TPA discount?",
        answer:
          "No. The discount attaches to \"permits that require TPA services\", and PLI's Third Party Agencies page lists those: \"TPA Inspection of commercial electrical permits\", stormwater permits after 5/25/22 and residential electrical permits filed before 1/1/21. Mechanical work is not among them, so this page's commercial row is the schedule's undiscounted $7.00 per $1,000 with the un-scaled $605 and $95,000 clamps.",
        sourceId: PITT_TPA_SOURCE_KEY,
        attribution: "Third Party Agencies and Special Inspections page, list of TPA-inspected permit types, read 2026-09-25.",
      },
      {
        question: "Who issues plumbing permits in Pittsburgh?",
        answer:
          "Allegheny County, not the City: \"Please note that Allegheny County Health Department Plumbing Division is responsible for plumbing permits\", and the work-not-requiring-a-permit page repeats it — \"all plumbing not associated with sprinkler systems in the City of Pittsburgh is regulated by Allegheny County Health Department, not the City.\" That is why this jurisdiction's published pages are building, electrical and mechanical: there is no City plumbing rate to quote.",
        sourceId: PITT_PERMITTING_SOURCE_KEY,
        attribution: "Permitting page, \"Permit Type\"; confirmed independently on the Work Not Requiring a Permit page.",
      },
      {
        question: "Do I need stamped drawings with a mechanical permit?",
        answer:
          "For commercial new construction, yes: that work type \"requires the submission of stamped drawings\" on the mechanical permit page, the same condition the electrical page states for its own commercial scopes. Residential scopes — exhaust, fuel gas, hydronic, heating and ventilation, exterior equipment and refrigeration in a house — are filed by work scope without that condition. The requirement changes the submission, not the fee.",
        sourceId: PITT_MECHANICAL_PAGE_SOURCE_KEY,
        attribution: "Mechanical Permit page, \"Commercial Mechanical Work Scopes / New Construction Work Scopes\".",
      },
      {
        question: "Is there a separate plan review fee for a mechanical permit?",
        answer:
          "No separate plan review line is published on the schedule: plan review sits inside the fee calculated from construction value. The one line that prices faster review is Accelerated Plan Review (1.5% or 1.0% of value with their own floors and caps), and it is currently unavailable for mechanical work — \"Due to current capacity, expedited review is only offered for Fire Alarm and Fire Suppression permit types.\"",
        sourceId: PITT_FEES_PAGE_SOURCE_KEY,
        attribution: "PLI Fees page, expedited-review capacity notice, read 2026-09-25.",
      },
    ],
    seoTitle: "Pittsburgh PA mechanical permit cost",
    seoDescription:
      "Pittsburgh mechanical permit fees — $6 per $1,000 residential or $7 per $1,000 commercial of construction value, clamped $130-$8,000 or $605-$95,000, no TPA discount, with the technology fee, $4.50 SETF and $5.00 retention on top.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: PITT_LAST_VERIFIED,
  },
];

const verifications: SeedVerification[] = [
  {
    entityType: "source",
    entityKey: PITT_FEE_SCHEDULE_SOURCE_KEY,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: PITT_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PITT_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "Read 2026-09-25 in both pdftotext modes and diffed line for line against the 2025 predecessor. Every amount this site charges comes from this document's first two blocks; the calculator is cited for arithmetic only.",
  },
  {
    entityType: "source",
    entityKey: PITT_FEE_SCHEDULE_2025_SOURCE_KEY,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: PITT_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PITT_FEE_SCHEDULE_2025_SOURCE_KEY,
    notes:
      "Read 2026-09-25 for the diff. Residential rows byte-identical; commercial/sign/stormwater maximum $80,000 → $95,000; accelerated-review caps and two overtime rows moved. Superseded, and recorded as the check that the modelled ceiling is the current one.",
  },
  {
    entityType: "source",
    entityKey: PITT_FEES_PAGE_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: PITT_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PITT_FEES_PAGE_SOURCE_KEY,
    notes:
      "Read 2026-09-25 (\"last updated: 09/02/2026\"). Source of the construction-value mechanism sentence, the Act 37 SETF statute, the zoning note, the expedited-review capacity limit and the payment rules.",
  },
  {
    entityType: "source",
    entityKey: PITT_FEE_CALCULATOR_SOURCE_KEY,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: PITT_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PITT_FEE_CALCULATOR_SOURCE_KEY,
    notes:
      "Read 2026-09-25 by extracting the quoted passages from the app's own tw-passagedata source: rates .006/.007, the min-max clamps on the multiplied figure, brackets keyed on adj_base_fee_calc, tpa_discount = adj_base_fee_calc * .15, the 40% split, the SETF waiver and the reconnect rows. Dated 1-3-2025, so it predates the schedule's $95,000 ceiling and never supplies an amount.",
  },
  {
    entityType: "source",
    entityKey: PITT_FEE_CALCULATOR_PAGE_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: PITT_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PITT_FEE_CALCULATOR_PAGE_SOURCE_KEY,
    notes:
      "Read 2026-09-25. Supplies the sentence quoted on every page about the value being verified at application and again at issuance.",
  },
  {
    entityType: "source",
    entityKey: PITT_PERMITTING_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: PITT_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PITT_PERMITTING_SOURCE_KEY,
    notes:
      "Read 2026-09-25 (\"last updated: 09/14/2026\"). Source of the structure-type definitions the fee split turns on, the work types, the permit-process steps and the Allegheny County plumbing hand-off.",
  },
  {
    entityType: "source",
    entityKey: PITT_ELECTRICAL_PAGE_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: PITT_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PITT_ELECTRICAL_PAGE_SOURCE_KEY,
    notes:
      "Read 2026-09-25. Source of the residential/commercial column sentence quoted on both trade pages, the required-work list and the stamped-drawing conditions (service over 400 A, commercial new construction).",
  },
  {
    entityType: "source",
    entityKey: PITT_MECHANICAL_PAGE_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: PITT_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PITT_MECHANICAL_PAGE_SOURCE_KEY,
    notes:
      "Read 2026-09-25. The same column sentence as the electrical page, the work scopes by work type, and the stamped-drawing condition for commercial new construction. Publishes no fee of its own.",
  },
  {
    entityType: "source",
    entityKey: PITT_TPA_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: PITT_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PITT_TPA_SOURCE_KEY,
    notes:
      "Read 2026-09-25. The page that resolves the schedule's \"applicable permit types\" — commercial electrical, stormwater after 5/25/22, residential electrical before 1/1/21 — and states that a discount is applicable to permits that require TPA services. Without it the discounted row would be an inference; with it the discount has a source.",
  },
  {
    entityType: "source",
    entityKey: PITT_WORK_NOT_REQUIRING_SOURCE_KEY,
    status: "verified",
    method: "official_portal_check",
    verifiedAt: PITT_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PITT_WORK_NOT_REQUIRING_SOURCE_KEY,
    notes:
      "Read 2026-09-25. Three exemption lists with the City's exception disclaimer, the June 2024 BDA consolidation, and a second independent statement of the Allegheny County plumbing sentence.",
  },
  {
    entityType: "fee_schedule",
    entityKey: PITT_KEYS.feeSchedule,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: PITT_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PITT_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "Effective 2026-01-01 per the document's own header, which the PLI Fees page links as current. Diffed against the 2025 predecessor on 2026-09-25: the modelled residential rows are unchanged and the commercial ceiling is the 2026 one.",
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-BASE-RESIDENTIAL",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: PITT_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PITT_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "\"Base Permit Fee (Residential) — $6.00 per $1,000 of Construction Value (Minimum: $130 – Maximum: $8,000)\", under a block headed \"ALL CONSTRUCTION PERMIT TYPES\". Modelled prorated — no incrementCents — because neither the schedule nor the calculator prints \"or fraction thereof\" and the calculator multiplies straight through; the clamp is applied to the multiplied figure, which the calculator's \"PLI Minimum Fee Applies\" output label confirms.",
  },
  {
    entityType: "fee_rule",
    entityKey: "BLD-BASE-COMMERCIAL",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: PITT_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PITT_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "\"Base Permit Fee (Commercial) — $7.00 per $1,000 of Construction Value (Minimum: $605 – Maximum: $95,000)\", and the row this permit takes whenever the structure type is absent or anything other than \"residential\". The $95,000 ceiling was confirmed by diffing the 2026 schedule against the 2025 one, which printed $80,000.",
  },
  {
    entityType: "fee_rule",
    entityKey: "ELEC-BASE-COMMERCIAL",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: PITT_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PITT_TPA_SOURCE_KEY,
    notes:
      "The schedule's commercial row with its own \"Third Party Agency Discount — 15% of Base Fee on applicable permit types\" applied, because the Third Party Agencies page requires \"TPA Inspection of commercial electrical permits\" and states that a discount is applicable to permits that require TPA services. Folded into the row as $5.95 per $1,000 with the clamps scaled to $514.25 and $80,750 — algebraically the calculator's clamp-then-discount for every input, since scaling and clamping commute for a positive scale.",
  },
  {
    entityType: "fee_rule",
    entityKey: "ELEC-TECH-FEE",
    permitTypeKey: "electrical",
    status: "needs_review",
    method: "official_pdf_review",
    verifiedAt: PITT_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PITT_FEE_CALCULATOR_SOURCE_KEY,
    notes:
      "The four brackets are the schedule's own ($0-$200 → $2.00, $201-$1,000 → $5.00, $1,001-$10,000 → $15.00, $10,001+ → $25.00) and certain; what is not settled is which side of the TPA discount the bracket is read from. The calculator reads `adj_base_fee_calc` before its discount, while this page's commercial base row already carries the discount, so a pre-discount base fee in ($200, $235.29], ($1,000, $1,176.47] or ($10,000, $11,764.71] is charged one band lower here than the calculator shows — $3 to $10. Flagged needs_review so the disagreement stays visible instead of being smoothed over.",
  },
  {
    entityType: "fee_rule",
    entityKey: "MECH-BASE-COMMERCIAL",
    permitTypeKey: "mechanical",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: PITT_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PITT_MECHANICAL_PAGE_SOURCE_KEY,
    notes:
      "The undiscounted commercial row — $7.00 per $1,000, $605 to $95,000 — because the schedule's TPA discount reaches electrical and stormwater permits only, and the mechanical page's own column sentence is the same one the electrical page prints. Prorated like every other row in the block.",
  },
  {
    entityType: "permit_page",
    entityKey: "building-permit-cost",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: PITT_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PITT_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "The two base rows with their printed clamps, the technology table, SETF and record retention, plus the 40% split and the construction-value mechanism from the fees pages. The worked example is arithmetic on the schedule: $1,240,000 × $7.00/1,000 = $8,680.00, $15.00 technology bracket, $5.00 and $4.50 flats, $8,704.50 total — and the page states the prorated $150.60 reading and the zoning exclusion rather than leaving them implicit.",
  },
  {
    entityType: "permit_page",
    entityKey: "electrical-permit-cost",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: PITT_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PITT_TPA_SOURCE_KEY,
    notes:
      "The discounted commercial row sourced to the Third Party Agencies page, the undiscounted residential row sourced to the schedule, the same three add-ons, and the exemptions named rather than dropped. The worked example is arithmetic on the schedule: $100,000 × $5.95/1,000 = $595.00, $5.00 technology bracket, $5.00 and $4.50 flats, $609.50 total. The technology-bracket nuance is carried as a needs_review verification against the rule.",
  },
  {
    entityType: "permit_page",
    entityKey: "mechanical-permit-cost",
    permitTypeKey: "mechanical",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: PITT_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PITT_MECHANICAL_PAGE_SOURCE_KEY,
    notes:
      "The two undiscounted base rows with their printed clamps, the three add-ons, and the absence stated out loud — plumbing is Allegheny County's, fire alarm and suppression are separate permits, the County's asbestos permit is another authority's charge. The worked example is arithmetic on the schedule: $60,000 × $6.00/1,000 = $360.00, $5.00 technology bracket, $5.00 and $4.50 flats, $374.50 total.",
  },
  {
    entityType: "jurisdiction_profile",
    entityKey: PITT_KEYS.jurisdiction,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: PITT_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: PITT_FEE_SCHEDULE_SOURCE_KEY,
    notes:
      "Hub content built from the 2026 schedule, its 2025 predecessor (for the ceiling diff), the calculator's own code (for the arithmetic) and the City's service pages (for the structure types, the BDA consolidation and the plumbing hand-off). The zoning rates, the complex-project meeting fee, the reconnect rows and the technology-bracket interaction are named as open questions in the research record rather than resolved by guess.",
  },
];

export const pittsburghSeed: JurisdictionSeed = {
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
export const PITT_PUBLISHED_PERMIT_PAGES = pittsburghSeed.permitPages.filter(
  (page) => page.publishStatus === "published" && !page.noindex,
);
