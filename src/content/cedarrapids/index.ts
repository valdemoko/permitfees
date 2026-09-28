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
  CR_BUILDING_RULES,
  CR_ELECTRICAL_RULES,
  CR_FEE_EFFECTIVE_FROM,
  CR_PLUMBING_RULES,
  CR_SOURCE_KEY,
} from "./fee-rules";

export * from "./fee-rules";

/**
 * The complete Cedar Rapids, Iowa seed payload.
 *
 * Every figure traces to research/iowa/cedar-rapids.md, which traces to one
 * City instrument: Resolution No. 1707-12-24 (passed 2024-12-17) and its
 * Exhibit A, "Schedule of Building Permit Fees, Amended, Effective January 1,
 * 2025" — one resolution carrying building, electrical, plumbing and mechanical
 * permit fees together, superseding Resolution No. 0489-05-19 (May 14, 2019).
 *
 * Access record: www.cedar-rapids.org 403s scripted requests (awselb), but the
 * PDF is served unguarded from cms8.revize.com. The PDF's Type 3 font defeats
 * every text-extraction mode, so its pages were rendered at 150 dpi and
 * OCR-read; the Section B ladder's seams chain exactly, which is the internal
 * check on the read. Table B's 100-row table interleaves its two fee columns
 * under OCR and is recorded but NOT modelled — no Table B amount enters any
 * total; building examples price above $100,000, where Table A's text carries
 * the rates unambiguously.
 *
 * Three pages, all published: building, electrical, plumbing.
 */

const RESEARCHER = "Permit Fee Intelligence — Iowa pass (Cedar Rapids)";

export const CEDAR_RAPIDS_LAST_VERIFIED = "2026-09-26";

export const CEDAR_RAPIDS_KEYS = {
  state: "ia",
  county: "linn-county",
  jurisdiction: "cedar-rapids",
  schedule: "cr-exhibit-a-2025",
} as const;

const state: SeedState = {
  code: "IA",
  slug: "iowa",
  name: "Iowa",
  fipsCode: "19",
};

const county: SeedCounty = {
  key: CEDAR_RAPIDS_KEYS.county,
  slug: "linn-county",
  name: "Linn County",
  fipsCode: "19113",
};

const jurisdiction: SeedJurisdiction = {
  key: CEDAR_RAPIDS_KEYS.jurisdiction,
  stateKey: CEDAR_RAPIDS_KEYS.state,
  countyKey: CEDAR_RAPIDS_KEYS.county,
  type: "city",
  slug: "cedar-rapids",
  name: "Cedar Rapids",
  officialName: "City of Cedar Rapids — Building Services",
  websiteUrl: "https://www.cedar-rapids.org/",
  permitPortalUrl:
    "https://www.cedar-rapids.org/local_government/departments_a_-_f/building_services/building_and_trades/index.php",
  timezone: "America/Chicago",
  isActive: true,
};

const departments: SeedDepartment[] = [
  {
    key: "cedar-rapids-building-services",
    jurisdictionKey: CEDAR_RAPIDS_KEYS.jurisdiction,
    kind: "building",
    name: "Building Services Department",
    phone: "(319) 286-5831",
    email: "residential@cedar-rapids.org",
    url:
      "https://www.cedar-rapids.org/local_government/departments_a_-_f/building_services/building_and_trades/index.php",
    addressLine: "City Services Center, 500 15th Avenue SW, Cedar Rapids, IA 52404",
    hours: "Monday – Friday, 7:30 a.m. – 4:30 p.m. CT",
    notes:
      "Building Services issues building, electrical, plumbing and mechanical permits under Chapters 33–36 of the Municipal Code, whose fee sections delegate amounts to City Council resolution. Trade-permit questions: electrical (319) 286-5834, plumbing plumbinginspector@cedar-rapids.org.",
  },
];

const sources: SeedSource[] = [
  {
    key: CR_SOURCE_KEY,
    jurisdictionKey: CEDAR_RAPIDS_KEYS.jurisdiction,
    title:
      "Resolution No. 1707-12-24 — Exhibit A, Schedule of Building Permit Fees, Amended, Effective January 1, 2025",
    url:
      "https://cms8.revize.com/revize/cedarrapids/Building%20Services/Documents/2025%20Fee%20Schedule%20-%20FINAL.pdf",
    sourceType: "ordinance",
    issuingAuthority: "Cedar Rapids City Council",
    authorityKind: "city",
    isPrimary: true,
    documentDate: "2024-12-17",
    effectiveFrom: CR_FEE_EFFECTIVE_FROM,
    retrievedAt: CEDAR_RAPIDS_LAST_VERIFIED,
    lastVerifiedAt: CEDAR_RAPIDS_LAST_VERIFIED,
    notes:
      "Read 2026-09-26. The PDF (9 pp., HTTP 200 application/pdf from the City's CMS host; the City's HTML pages 403 scripted requests) embeds its text in a Type 3 font with no usable ToUnicode map — pdftotext and PyMuPDF return glyph codes — so the pages were rendered to PNG at 150 dpi and OCR-read (RapidOCR). Carries: the $20 administration fee with its stated exceptions; the residential new-construction flat area table ($1,000/$1,400/$2,400, trades bundled, no admin fee); Table A valuation bands above $100,000 (residential $671.48 + $3.68, $2,141.48 + $3.15, $3,716.48 + $2.10; commercial $987.00 + $5.36, $3,147.90 + $4.62, $5,507.25 + $3.05 — every band 'or fraction thereof'); the 40% plan check for non-R-3 buildings over $1,000 of valuation; trade Section A flats at $75; and the shared Section B trade ladder ($25 flat to $1,000, then 1%/0.9%/0.8%/0.7%/0.6%/0.5%/0.4%/0.3%/0.2%/0.2% marginal bands whose bases chain exactly). Table B (valuations $1–$100,000, 100 rows) is recorded in the research file and not modelled — OCR interleaves its two fee columns.",
  },
];

/** Empty on purpose: the permit types Cedar Rapids uses already exist as shared rows. */
const permitTypes: JurisdictionSeed["permitTypes"] = [];
const projectTypes: JurisdictionSeed["projectTypes"] = [];

const jurisdictionPermitTypes: SeedJurisdictionPermitType[] = [
  {
    jurisdictionKey: CEDAR_RAPIDS_KEYS.jurisdiction,
    permitTypeKey: "building",
    isAvailable: true,
    localName:
      "Building permit — flat area table for new dwellings, Table A valuation bands, 40% plan check",
    officialUrl:
      "https://cms8.revize.com/revize/cedarrapids/Building%20Services/Documents/2025%20Fee%20Schedule%20-%20FINAL.pdf",
    notes:
      "New single-family, duplex and townhouse projects of four units or less pay flat area fees ($1,000/$1,400/$2,400; 3-unit TH $2,000; 4-unit TH $2,500) with the trades bundled and no administration fee. Everything else reads fair market value of materials and labor — Table B to $100,000 (recorded, not modelled), Table A above it — plus the $20 administration fee and the 40% plan check for non-R-3 buildings valued over $1,000.",
  },
  {
    jurisdictionKey: CEDAR_RAPIDS_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    isAvailable: true,
    localName: "Electrical permit — Section A flats, Section B valuation ladder",
    officialUrl:
      "https://cms8.revize.com/revize/cedarrapids/Building%20Services/Documents/2025%20Fee%20Schedule%20-%20FINAL.pdf",
    notes:
      "Section A flats at $75.00: residential service installs, residential photovoltaic, detached garages, temporary power poles. All other electrical work prices on the Section B ladder from the trade's total contract price or estimated final invoice — $25.00 flat to $1,000, then marginal bands from 1% down to 0.2%.",
  },
  {
    jurisdictionKey: CEDAR_RAPIDS_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    isAvailable: true,
    localName: "Plumbing permit — Section A flats, Section B valuation ladder",
    officialUrl:
      "https://cms8.revize.com/revize/cedarrapids/Building%20Services/Documents/2025%20Fee%20Schedule%20-%20FINAL.pdf",
    notes:
      "Section A flats at $75.00: appliance replacement (furnace, water heater, AC), fuel gas, sewer. All other plumbing work prices on the same Section B ladder the electrical page uses, from the trade's own contract price.",
  },
];

const feeSchedules: SeedFeeSchedule[] = [
  {
    key: CEDAR_RAPIDS_KEYS.schedule,
    jurisdictionKey: CEDAR_RAPIDS_KEYS.jurisdiction,
    sourceKey: CR_SOURCE_KEY,
    title: "Cedar Rapids Exhibit A — Schedule of Building Permit Fees (eff. 2025-01-01)",
    officialUrl:
      "https://cms8.revize.com/revize/cedarrapids/Building%20Services/Documents/2025%20Fee%20Schedule%20-%20FINAL.pdf",
    effectiveFrom: CR_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    lastVerifiedAt: CEDAR_RAPIDS_LAST_VERIFIED,
    notes:
      "One resolution, one Exhibit A, four trades. Adopted by Resolution 1707-12-24 on 2024-12-17, superseding Resolution 0489-05-19.",
  },
];

function attach(
  permitTypeKey: string,
  rules: SeedFeeRule["rule"][],
  scheduleKey: string,
): SeedFeeRule[] {
  return rules.map((rule) => ({
    jurisdictionKey: CEDAR_RAPIDS_KEYS.jurisdiction,
    permitTypeKey,
    scheduleKey,
    rule,
  }));
}

const feeRules: SeedFeeRule[] = [
  ...attach("building", CR_BUILDING_RULES, CEDAR_RAPIDS_KEYS.schedule),
  ...attach("electrical", CR_ELECTRICAL_RULES, CEDAR_RAPIDS_KEYS.schedule),
  ...attach("plumbing", CR_PLUMBING_RULES, CEDAR_RAPIDS_KEYS.schedule),
];

const requirements: SeedRequirement[] = [
  {
    jurisdictionKey: CEDAR_RAPIDS_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "document",
    title: "Valuation is fair market value of materials and labor",
    description:
      "The Exhibit defines valuation as 'fair market value of materials and labor', determined by the building official, excluding the lot and lot improvements (grading, landscaping, walks, drives). The Municipal Code's § 109.3 exception excludes the cost of electrical, plumbing, heating and air-conditioning systems in R-2/R-3 occupancies from valuation.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: CR_SOURCE_KEY,
    lastVerifiedAt: CEDAR_RAPIDS_LAST_VERIFIED,
  },
  {
    jurisdictionKey: CEDAR_RAPIDS_KEYS.jurisdiction,
    permitTypeKey: "building",
    requirementType: "other",
    title: "New dwellings of four units or less bundle the trades",
    description:
      "The flat area table's own note: 'Fee includes Building, Electrical, Mechanical, Plumbing, Erosion Control' — and the trade section repeats it: 'New one/two-family and townhouse structures not greater than 4 units shall be included in the building permit fee.' Those projects also skip the $20 administration fee. The rules key on custom.res_new_bundled so neither side is charged twice.",
    isMandatory: true,
    sortOrder: 20,
    sourceKey: CR_SOURCE_KEY,
    lastVerifiedAt: CEDAR_RAPIDS_LAST_VERIFIED,
  },
  {
    jurisdictionKey: CEDAR_RAPIDS_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    requirementType: "other",
    title: "Each trade permit is for individual structures",
    description:
      "Section B's own words: 'Each permit is for individual structures' — a trade permit prices one structure's contract price, not a whole project's.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: CR_SOURCE_KEY,
    lastVerifiedAt: CEDAR_RAPIDS_LAST_VERIFIED,
  },
  {
    jurisdictionKey: CEDAR_RAPIDS_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    requirementType: "other",
    title: "The Section B ladder is shared by all three trades",
    description:
      "'ALL OTHER PERMITS FOR ELECTRICAL, MECHANICAL, AND PLUMBING — Fees for permits for all other electrical, mechanical, and plumbing work shall be based on the total contract price or estimated final invoice for that trade.' One ladder, three trades; each permit reads its own trade's contract price.",
    isMandatory: true,
    sortOrder: 10,
    sourceKey: CR_SOURCE_KEY,
    lastVerifiedAt: CEDAR_RAPIDS_LAST_VERIFIED,
  },
];

const profile: SeedProfile = {
  jurisdictionKey: CEDAR_RAPIDS_KEYS.jurisdiction,
  headline: "What construction permits cost in Cedar Rapids",
  summary:
    "Cedar Rapids prices construction out of **one resolution — Exhibit A, effective January 1, 2025** — that carries building, electrical, plumbing and mechanical fees together. New dwellings of four units or less pay flat area fees ($1,000 to $2,400, trades bundled, no administration fee); everything else reads **fair market value of materials and labor** through Table B (to $100,000) and Table A (above it, residential and commercial columns), plus a **$20 administration fee** and a **40% plan check for non-R-3 buildings** valued over $1,000. Trade permits are $75 flats for the scope rows and a shared percentage ladder ($25 flat, then 1% down to 0.2% marginal) for everything else.",
  localContext:
    "Building Services, at the City Services Center on 15th Avenue SW, issues the four trade permits under Chapters 33–36 of the Municipal Code — and each chapter's fee section delegates the amounts to City Council resolution. The operative resolution is No. 1707-12-24, passed December 17, 2024, adopting Exhibit A effective January 1, 2025 and superseding the 2019 schedule.\n\nThe residential new-construction table is the schedule's center of gravity: a single-family, duplex or townhouse project of four units or less pays a flat fee by habitable above-grade area (garage excluded) — $1,000 to 1,200 sq ft, $1,400 to 2,000, $2,400 above — and that fee *includes* building, electrical, mechanical, plumbing and erosion control, with no $20 administration fee. The trade section says the same thing from its side: new one/two-family and townhouse structures of four units or less have their trade fees included in the building permit.\n\nEverything outside that table reads valuation. Table B (printed, $1 to $100,000, separate residential and commercial columns) and Table A above it ($671.48 + $3.68 per $1,000 or fraction for residential; $987.00 + $5.36 for commercial, and so on) price the building permit, the $20 administration fee rides on top except where the schedule notes otherwise, and the plan check adds 40% of the computed permit fee for any building other than an R-3 dwelling valued over $1,000. Trade permits outside the bundled projects are $75 flats (residential service installs, photovoltaic, detached garages, temporary power poles, appliance replacement, fuel gas, sewer) or the shared Section B ladder: $25.00 flat to $1,000 of trade contract price, then marginal percentage bands — 1% of the amount over $1,000, easing to 0.2% above $800,000.",
  valuationBasis:
    "Three bases across the Exhibit. **The residential new-construction table reads area** — total habitable square footage above grade, garage excluded — and pays flats that bundle the trades. **Tables A and B read valuation** — fair market value of materials and labor, determined by the building official, with R-2/R-3 electrical-plumbing-heating-cooling costs excluded by the code's own exception — in $1,000 bands whose excess rounds up ('or fraction thereof'). **The trade Section B ladder reads each trade's total contract price or estimated final invoice** — one ladder shared by electrical, mechanical and plumbing, each permit pricing its own trade and each permit covering an individual structure.",
  notIncluded:
    "These figures are Cedar Rapids' own permit amounts from Exhibit A. They are not a project cost, and they exclude:\n\n- **Table B (valuations $1–$100,000).** The 100-row printed table is read and recorded, but its two fee columns interleave under the OCR extraction this document required, so no Table B amount enters a total. Building work below $100,001 of valuation needs a fee quote from Building Services — the honest gap is named rather than papered over.\n- **Mechanical permits as a page.** The Exhibit prices mechanical alongside plumbing (Section A flats and the shared Section B ladder); it is recorded in the research file without its own page in this pass.\n- **Miscellaneous flats.** Basement finish ($100 new structures), accessory buildings ($110/$165/$275), re-roof and re-side ($100 residential), demolition ($100/building), building moving ($250 + $50 inspection), pool and retaining-wall rows — recorded, not modelled.\n- **Event and administrative fees.** Re-inspection $100, after-hours inspection $150/hr, special inspection minimum $25, investigation $100/hr, permit renewals $50/$100/$250, temporary COs, work-before-permit doubling ($250 min / $1,000 max).\n- **Fire Department fees**, which the City publishes as a separate structure.",
  seoTitle: "Cedar Rapids construction permit fees — Exhibit A 2025",
  seoDescription:
    "How Cedar Rapids prices construction permits: flat area fees for new dwellings ($1,000–$2,400, trades bundled), Table A valuation bands, the $20 administration fee, 40% plan check for non-R-3 buildings, and $75 trade flats vs the shared Section B percentage ladder.",
  publishStatus: "published",
  noindex: false,
  lastReviewedAt: CEDAR_RAPIDS_LAST_VERIFIED,
};

const permitPages: SeedPermitPage[] = [
  {
    jurisdictionKey: CEDAR_RAPIDS_KEYS.jurisdiction,
    permitTypeKey: "building",
    slug: "building-permit-cost",
    title: "Cedar Rapids building permit cost",
    intro:
      "A Cedar Rapids building permit is priced by **which side of Exhibit A answers the job**. New single-family, duplex and townhouse projects of four units or less pay a **flat fee by habitable above-grade area** — $1,000.00 to 1,200 sq ft, $1,400.00 to 2,000, $2,400.00 above — with the trades bundled in and **no administration fee**. Everything else reads **fair market value of materials and labor** through Table B (to $100,000) and Table A above it, with every band's excess rounded up to the whole $1,000 ('or fraction thereof'), plus the **$20.00 administration fee** and the **plan check at 40% of the computed permit fee** for any building other than an R-3 dwelling valued over $1,000.",
    localSummary:
      "The flat rows are the schedule's own carve-out, and they do three things at once: they skip the $20 administration fee, they bundle building, electrical, mechanical, plumbing and erosion control into one permit, and they measure the dwelling by habitable area above grade with the garage excluded — so finishing a basement in an existing structure is its own $100 row, not an area band.\n\nThe valuation side is where the round-up lives. Table A's bands print 'or fraction thereof': $150,000 of residential valuation is $671.48 plus fifty whole $1,000 steps at $3.68 — $185.00 — totaling $856.48; $150,001 pays one full step more. The residential and commercial columns diverge above the same $100,000 seam and never cross.\n\nThe plan check's own sentence both charges and exempts: 40% of the computed permit fee 'for all commercial and residential buildings, other than R-3' — so a dwelling pays none of it and an apartment building or a store pays 40%. This site models the R-3 exemption as the explicit fact the schedule's class carve-out makes it.",
    notIncluded:
      "This is Exhibit A's building permit fee. It excludes:\n\n- **Table B amounts.** Valuations of $1–$100,000 are priced by the printed 100-row table, which this site records but does not model (the extraction note is in the research file); such a project needs a quote from Building Services.\n- **Trade permits** for projects outside the bundled new-dwelling table — priced on the electrical and plumbing pages.\n- **Mechanical permits** as a separate page — recorded in the research file.\n- **Miscellaneous flats** (basement finish, accessory buildings, re-roof, re-side, demolition, building moving, pools) and **event fees** (re-inspection $100, after-hours $150/hr, renewals, work-before-permit doubling) — recorded, not modelled.\n- **Fire Department fees**, published separately by the City.",
    workedExample: {
      scenario:
        "A new multi-family apartment building with a declared valuation of $150,000, not an R-3 dwelling — administration fee applies.",
      inputs: {
        valuationCents: 15_000_000,
        occupancy: "residential",
        custom: {
          not_r3_dwelling: true,
        },
      },
      notes:
        "Three lines — **$1,217.67**.\n\nTable A, residential band 1: $150,000 is above the $100,000 seam and at or below $500,000, so $671.48 for the first $100,000 plus $3.68 for each additional $1,000 or fraction. The excess is $50,000 — fifty whole steps at $3.68 = $184.00. Band total: $671.48 + $184.00 = $855.48.\n\nAdministration fee: $20.00 — the schedule's 'in addition to the permit fee, except where noted', and no exception reaches an apartment building.\n\nPlan check: 40% of the computed building permit fee, for a non-R-3 building valued over $1,000 — 0.40 × $855.48 = $342.192, which rounds to $342.19.\n\nTotal: $855.48 + $20.00 + $342.19 = **$1,217.67**. The same valuation inside the flat-table world would be impossible — a dwelling of four units or less never reads valuation at all.",
    },
    faqs: [
      {
        question: "How much is a building permit for a new house in Cedar Rapids?",
        answer:
          "A flat fee by habitable above-grade area (garage excluded): $1,000.00 up to 1,200 sq ft, $1,400.00 from 1,201 to 2,000, and $2,400.00 above 2,000. The fee includes building, electrical, mechanical, plumbing and erosion control, and no $20 administration fee applies.",
        sourceId: CR_SOURCE_KEY,
      },
      {
        question: "What is the $20 administration fee?",
        answer:
          "A $20.00 non-refundable administration fee charged 'in addition to the permit fee, except where noted'. The noted exceptions are the residential new-construction table and the ADA-ramp row.",
        sourceId: CR_SOURCE_KEY,
      },
      {
        question: "How is a building permit over $100,000 of valuation calculated?",
        answer:
          "By Table A: residential pays $671.48 for the first $100,000 plus $3.68 for each additional $1,000 or fraction (to $500,000), then $2,141.48 + $3.15 (to $1,000,000), then $3,716.48 + $2.10. Commercial pays $987.00 + $5.36, $3,147.90 + $4.62, and $5,507.25 + $3.05 over the same seams.",
        sourceId: CR_SOURCE_KEY,
      },
      {
        question: "Who pays the 40% plan check fee?",
        answer:
          "Every building other than an R-3 dwelling whose proposed construction is valued over $1,000: 'Plan checking fees for all commercial and residential buildings, other than R-3, are 40% of the computed building permit fee.' Incomplete or changed plans add $30 per hour with a 30-minute minimum.",
        sourceId: CR_SOURCE_KEY,
      },
      {
        question: "What does Exhibit A say about townhouses?",
        answer:
          "Three-unit townhouses pay $2,000.00 flat and four-unit townhouses $2,500.00 — both with the trades bundled and no administration fee. Townhouse projects greater than four units leave the flat table entirely and price on valuation like any other building.",
        sourceId: CR_SOURCE_KEY,
      },
      {
        question: "Is the permit fee based on the value of the land or the construction?",
        answer:
          "The construction only: valuation is the fair market value of materials and labor for the permitted work, excluding the lot and lot improvements such as grading, landscaping, walks and drives. In R-2 and R-3 occupancies the code's own exception also excludes the cost of the electrical, plumbing, heating and air-conditioning systems.",
        sourceId: CR_SOURCE_KEY,
      },
    ],
    seoTitle: "Cedar Rapids building permit cost: flat area table, Table A, 40% plan check",
    seoDescription:
      "Cedar Rapids building permit fees — $1,000–$2,400 flat for new dwellings with trades bundled, Table A valuation bands above $100,000, the $20 administration fee, and the 40% plan check for non-R-3 buildings under Exhibit A.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: CEDAR_RAPIDS_LAST_VERIFIED,
  },
  {
    jurisdictionKey: CEDAR_RAPIDS_KEYS.jurisdiction,
    permitTypeKey: "electrical",
    slug: "electrical-permit-cost",
    title: "Cedar Rapids electrical permit cost",
    intro:
      "A Cedar Rapids electrical permit has **two sections**. Section A is a flat price list: **$75.00** for residential service installs (new, repair or replacement), residential photovoltaic systems, detached garages and temporary power poles. Section B is a **valuation ladder for everything else**, reading the trade's total contract price or estimated final invoice: **$25.00 flat to $1,000**, then **1% of the amount over $1,000**, easing through 0.9%, 0.8%, 0.7%, 0.6%, 0.5%, 0.4%, 0.3% and 0.2% marginal bands. New one/two-family and townhouse structures of four units or less carry their electrical fee **inside the building permit**.",
    localSummary:
      "The two sections split on the schedule's own words: Section A's rows are named scopes, Section B is 'ALL OTHER PERMITS FOR ELECTRICAL, MECHANICAL, AND PLUMBING' — with the ladder reading 'the total contract price or estimated final invoice for that trade', not the whole project's value, and 'each permit is for individual structures'.\n\nThe ladder's bands chain exactly — $25.00 plus 1% of $99,000 is $1,015.00, the printed base of the next band; $1,015 plus 0.9% of $100,000 is $1,915.00 — so the ladder is one marginal rate table over a $25.00 base, and the arithmetic closes at every seam. The final band prints '0.2% of the amount over $800,000' for the $900,001+ bracket, continuing the band below's rate — charged as printed.\n\nThe bundled-dwelling rule runs both ways: a new dwelling pays no separate electrical permit and no administration fee, because the building permit's flat amount already carries the trade.",
    notIncluded:
      "This is Exhibit A's electrical permit fee. It excludes:\n\n- **The building permit** and its plan check — on the building page.\n- **Stand-alone commercial trade plan checking** ($200, if required) — a general fee recorded in the research file.\n- **Re-inspection ($100), after-hours inspections ($150/hr), special inspection (minimum $25) and investigation ($100/hr)** — event fees.\n- **Work-before-permit doubling** ($250 min, $1,000 max) — a penalty regime, not a fee schedule row.",
    workedExample: {
      scenario:
        "A commercial electrical fit-out with a trade contract price of $40,000 — not part of a bundled new-dwelling project.",
      inputs: {
        valuationCents: 4_000_000,
        occupancy: "commercial",
        custom: {
          trade_bundled: null,
        },
      },
      notes:
        "One line — **$415.00**.\n\nSection B: the $40,000 contract price sits in the '1% of the amount over $1,000' band. $25.00 base plus 1% of $39,000 = $25.00 + $390.00 = $415.00.\n\nThe marginal reading matters: the 1% applies only to the portion above $1,000, not to the whole contract price — at $100,001 the fee is $1,015.00 (the printed base of the next band) plus 0.9% of the excess, not 1% of everything.\n\nWhat moves it: the same job inside a bundled new dwelling pays nothing here — the building permit's flat amount carries it; a residential service install on an existing home is a flat $75.00 under Section A; and the administration fee does not appear because it is a building-permit line, not a trade one.",
    },
    faqs: [
      {
        question: "How much is an electrical permit in Cedar Rapids?",
        answer:
          "Named scopes are $75.00 flat (Section A): residential service installs — new, repair or replacement — residential photovoltaic systems, detached garages and temporary power poles. Everything else prices on the Section B ladder: $25.00 flat to $1,000 of trade contract price, then 1% of the amount over $1,000, easing to 0.2% in the highest bands.",
        sourceId: CR_SOURCE_KEY,
      },
      {
        question: "Do I need a separate electrical permit for a new house?",
        answer:
          "No. 'New one/two-family and townhouse structures not greater than 4 units shall be included in the building permit fee' — the electrical, mechanical, plumbing and erosion-control fees are inside the building permit's flat amount.",
        sourceId: CR_SOURCE_KEY,
      },
      {
        question: "What contract price does the trade ladder read?",
        answer:
          "The trade's own: 'based on the total contract price or estimated final invoice for that trade' — not the whole project's valuation. Each permit is also 'for individual structures', so a two-building job prices two permits.",
        sourceId: CR_SOURCE_KEY,
      },
      {
        question: "How is a $50,000 electrical contract priced?",
        answer:
          "$25.00 plus 1% of $49,000 = $515.00. The 1% band runs to $100,000 of contract price; above it the marginal rate steps down — 0.9% to $200,000, 0.8% to $300,000, and so on to 0.2% above $800,000.",
        sourceId: CR_SOURCE_KEY,
      },
      {
        question: "Does the $20 administration fee apply to electrical permits?",
        answer:
          "The Exhibit's administration fee is stated 'in addition to the permit fee, except where noted', and its noted exceptions are the residential new-construction table and the ADA-ramp row — building-permit lines. This site charges it on the building page only.",
        sourceId: CR_SOURCE_KEY,
      },
      {
        question: "Who can pull an electrical permit in Cedar Rapids?",
        answer:
          "Electrical permits are issued to licensed, insured contractors; homeowners of their single-family residence may pull permits for work they perform themselves. The City licenses electrical, heating, air-conditioning and plumbing contractors through Building Services.",
        sourceId: CR_SOURCE_KEY,
      },
    ],
    seoTitle: "Cedar Rapids electrical permit cost: $75 flats and the Section B ladder",
    seoDescription:
      "Cedar Rapids electrical permit fees — $75.00 flat for service installs, solar, garages and temp poles; $25.00 plus marginal percentage bands (1% down to 0.2%) of trade contract price for everything else, under Exhibit A 2025.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: CEDAR_RAPIDS_LAST_VERIFIED,
  },
  {
    jurisdictionKey: CEDAR_RAPIDS_KEYS.jurisdiction,
    permitTypeKey: "plumbing",
    slug: "plumbing-permit-cost",
    title: "Cedar Rapids plumbing permit cost",
    intro:
      "A Cedar Rapids plumbing permit has **the same two sections as electrical**. Section A is a flat price list: **$75.00** for appliance replacement permits (furnace, water heater, AC), **$75.00** for fuel gas permits and **$75.00** for sewer permits. Section B is the **shared valuation ladder** for all other plumbing work, reading the trade's total contract price or estimated final invoice: **$25.00 flat to $1,000**, then **1% of the amount over $1,000**, easing through 0.9% down to 0.2% marginal bands. New one/two-family and townhouse structures of four units or less carry their plumbing fee **inside the building permit**.",
    localSummary:
      "The Exhibit prints one Section B for all three trades — 'ALL OTHER PERMITS FOR ELECTRICAL, MECHANICAL, AND PLUMBING' — so a plumbing permit and an electrical permit of the same contract price cost the same, and neither reads the building's valuation, only the trade's own contract price or estimated final invoice.\n\nThe Section A rows are scope-named, not size-named: a water heater swap is the appliance-replacement row at $75.00 whether it is a 40-gallon residential tank or a commercial unit, and a sewer lateral is the sewer row at $75.00 regardless of length. Repairs that touch only faucet working parts, stoppage clearance or like-for-like fixture replacement without altering waste, vent or water piping need no permit at all — the code's own exception.\n\nThe bundled-dwelling rule applies here as on the electrical page: a new dwelling's plumbing is inside the building permit's flat amount.",
    notIncluded:
      "This is Exhibit A's plumbing permit fee. It excludes:\n\n- **The building permit** and its plan check — on the building page.\n- **Mechanical permits as a page** — the Exhibit prices them on the same sections; recorded in the research file.\n- **Stand-alone commercial trade plan checking** ($200, if required) and the event fees (re-inspection $100, after-hours $150/hr, investigation $100/hr) — recorded, not modelled.\n- **Work-before-permit doubling** ($250 min, $1,000 max).",
    workedExample: {
      scenario:
        "A commercial plumbing build-out with a trade contract price of $120,000 — not part of a bundled new-dwelling project.",
      inputs: {
        valuationCents: 12_000_000,
        occupancy: "commercial",
        custom: {
          trade_bundled: null,
        },
      },
      notes:
        "One line — **$1,088.50**.\n\nSection B, band 3: the $120,000 contract price sits in the '$100,001.00 to $200,000.00 — $1,015.00 plus 0.9% of the amount over $100,000.00' band. $1,015.00 + 0.9% × $20,000 = $1,015.00 + $180.00 = $1,195.00... check the seam first: the band above ends at $100,000 with $25.00 + 1% × $99,000 = $1,015.00 — exactly the printed base, so the ladder chains. Band total: $1,195.00.\n\nTotal: **$1,195.00**. The marginal reading matters: at $100,001 the fee is $1,015.01, not $1,015.00 + 1% of the whole — each band prices only its own excess.\n\nWhat moves it: a water-heater swap is a flat $75.00 Section A row; the same contract price inside a bundled new dwelling is $0.00 here and inside the building fee; and the trade ladder never reads the building permit's valuation column.",
    },
    faqs: [
      {
        question: "How much is a plumbing permit in Cedar Rapids?",
        answer:
          "Named scopes are $75.00 flat (Section A): appliance replacement (furnace, water heater, AC), fuel gas and sewer permits. Everything else prices on the shared Section B ladder — $25.00 flat to $1,000 of the trade's contract price, then marginal percentage bands from 1% down to 0.2%.",
        sourceId: CR_SOURCE_KEY,
      },
      {
        question: "Do I need a plumbing permit to replace a water heater?",
        answer:
          "Yes, but it is the flat $75.00 appliance-replacement row. Like-for-like faucet, valve and fixture replacement that does not alter existing waste, vent or water piping is the code's own no-permit exception.",
        sourceId: CR_SOURCE_KEY,
      },
      {
        question: "Is the plumbing ladder different from the electrical one?",
        answer:
          "No — the Exhibit prints one Section B for electrical, mechanical and plumbing: 'Fees for permits for all other electrical, mechanical, and plumbing work shall be based on the total contract price or estimated final invoice for that trade.' Same ladder, each trade reading its own contract price.",
        sourceId: CR_SOURCE_KEY,
      },
      {
        question: "Does the trade permit read the project's building valuation?",
        answer:
          "No. Section B reads 'the total contract price or estimated final invoice for that trade', and 'each permit is for individual structures' — the building permit's valuation column is a different number on a different page.",
        sourceId: CR_SOURCE_KEY,
      },
      {
        question: "What does a new home's plumbing permit cost?",
        answer:
          "Nothing separately: 'New one/two-family and townhouse structures not greater than 4 units shall be included in the building permit fee.' The flat building rows ($1,000–$2,400 by area) bundle plumbing, electrical, mechanical and erosion control.",
        sourceId: CR_SOURCE_KEY,
      },
      {
        question: "Where do I get a Cedar Rapids plumbing permit?",
        answer:
          "Building Services at the City Services Center, 500 15th Avenue SW — apply through the Customer Self Service portal, by email, mail or in person; plumbing inspection questions go to plumbinginspector@cedar-rapids.org.",
        sourceId: CR_SOURCE_KEY,
      },
    ],
    seoTitle: "Cedar Rapids plumbing permit cost: $75 flats and the shared Section B ladder",
    seoDescription:
      "Cedar Rapids plumbing permit fees — $75.00 flat for appliance replacement, fuel gas and sewer; $25.00 plus marginal percentage bands of trade contract price for all other plumbing work, under Exhibit A 2025.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: CEDAR_RAPIDS_LAST_VERIFIED,
  },
];

const verifications: SeedVerification[] = [
  {
    entityType: "fee_schedule",
    entityKey: CEDAR_RAPIDS_KEYS.schedule,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: CEDAR_RAPIDS_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: CR_SOURCE_KEY,
    notes:
      "OCR-read from the City PDF (Type 3 font defeats text extraction); the Section B ladder's seam chaining and Table A's band structure are the internal checks. Table B recorded, not modelled.",
  },
  {
    entityType: "jurisdiction_profile",
    entityKey: CEDAR_RAPIDS_KEYS.jurisdiction,
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: CEDAR_RAPIDS_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: CR_SOURCE_KEY,
    notes:
      "Authority confirmed as Building Services under Chapters 33–36, fees by council resolution; Resolution 1707-12-24 adopted 2024-12-17, effective 2025-01-01.",
  },
  {
    entityType: "permit_page",
    entityKey: "building-permit-cost",
    permitTypeKey: "building",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: CEDAR_RAPIDS_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: CR_SOURCE_KEY,
    notes: "Worked example reproduces Table A band 1, the administration fee and the 40% plan check.",
  },
  {
    entityType: "permit_page",
    entityKey: "electrical-permit-cost",
    permitTypeKey: "electrical",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: CEDAR_RAPIDS_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: CR_SOURCE_KEY,
    notes: "Worked example reproduces the Section B 1% band at a $40,000 contract price.",
  },
  {
    entityType: "permit_page",
    entityKey: "plumbing-permit-cost",
    permitTypeKey: "plumbing",
    status: "verified",
    method: "official_pdf_review",
    verifiedAt: CEDAR_RAPIDS_LAST_VERIFIED,
    verifiedBy: RESEARCHER,
    sourceKey: CR_SOURCE_KEY,
    notes: "Worked example reproduces the Section B 0.9% band at a $120,000 contract price.",
  },
];

export const cedarRapidsSeed: JurisdictionSeed = {
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
