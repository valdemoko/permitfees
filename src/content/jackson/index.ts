import type { JurisdictionSeed } from "@/content/seed-types";
import {
  JK_BUILDING_RULES,
  JK_ELECTRICAL_RULES,
  JK_FEE_EFFECTIVE_FROM,
  JK_PLUMBING_RULES,
  JK_SOURCE_KEY,
} from "@/content/jackson/fee-rules";

export const JK_LAST_VERIFIED = "2026-09-26";

export const JK_KEYS = {
  state: "ms",
  county: "hinds-county-ms",
  jurisdiction: "jackson",
} as const;

const state = {
  code: "MS",
  slug: "mississippi",
  name: "Mississippi",
  fipsCode: "28",
};

const county = {
  key: JK_KEYS.county,
  slug: "hinds-county-ms",
  name: "Hinds County",
  fipsCode: "28049",
};

const CITY_URL = "https://www.jacksonms.gov";
const BUILDING_PERMITS_URL = `${CITY_URL}/government/city-departments/planning-and-development/office-of-code-services/building-permits/`;
const RESIDENTIAL_URL = `${CITY_URL}/residents/residential-building-and-permits/`;
const OPENGOV_URL = "https://jacksonms.portal.opengov.com/categories/1071";
const MUNICODE_URL =
  "https://library.municode.com/ms/jackson/codes/code_of_ordinances?nodeId=PTIICOOR_CH26BUBURE";

/**
 * Jackson publishes three permit pages with **zero fee rules**. This is the
 * editorial gate's `hasNoScheduleStatement` case: a page that says plainly
 * that the City publishes no fee schedule is publishable; a page that
 * pretended to estimate from nothing would not be. No dollar amount appears
 * on any Jackson page, worked example, or FAQ answer.
 */
export const jacksonSeed: JurisdictionSeed = {
  state,
  county,

  jurisdiction: {
    key: JK_KEYS.jurisdiction,
    stateKey: JK_KEYS.state,
    countyKey: JK_KEYS.county,
    type: "city",
    slug: "jackson",
    name: "Jackson",
    officialName:
      "City of Jackson — Department of Planning and Development, Office of Code Services",
    websiteUrl: CITY_URL,
    permitPortalUrl: OPENGOV_URL,
    timezone: "America/Chicago",
    isActive: true,
  },

  departments: [
    {
      key: "jackson-code-services",
      jurisdictionKey: JK_KEYS.jurisdiction,
      kind: "building",
      name: "Jackson Building Permit Division (Office of Code Services)",
      phone: "(601) 960-1160",
      email: null,
      url: BUILDING_PERMITS_URL,
      addressLine: "Warren Hood Building, 200 S. President Street, 3rd Floor, Jackson, MS 39201",
      hours: "Monday – Friday, 8:00 a.m. – 5:00 p.m. CT",
      notes:
        "The Building Permit Division within Planning and Development's Office of Code Services reviews applications, routes them through zoning, floodplain, historic-preservation and plan review, and collects permit fees at issuance. Permits phone: (601) 960-1167.",
    },
  ],

  sources: [
    {
      key: JK_SOURCE_KEY,
      jurisdictionKey: JK_KEYS.jurisdiction,
      title:
        "Jackson Code of Ordinances, Ch. 26 (Buildings and Building Regulations), Sec. 26-2 — Permit, fee",
      url: MUNICODE_URL,
      sourceType: "municipal_code",
      issuingAuthority: "City of Jackson",
      authorityKind: "city",
      isPrimary: true,
      documentDate: "2019-03-05",
      effectiveFrom: JK_FEE_EFFECTIVE_FROM,
      retrievedAt: "2026-09-26",
      lastVerifiedAt: JK_LAST_VERIFIED,
      notes:
        "Sec. 26-2: 'The permit fee for work requiring a permit shall be established by the adopted schedule of fees. The adopted schedule of fees shall govern.' (Ord. No. 2019-30(9), eff. 2019-03-05.) The code defers to the adopted schedule without reproducing it, and no appendix of the Municode consolidation publishes one.",
    },
    {
      key: "jackson-building-permits-page",
      jurisdictionKey: JK_KEYS.jurisdiction,
      title: "Office of Code Services — Building Permits",
      url: BUILDING_PERMITS_URL,
      sourceType: "municipal_website",
      issuingAuthority: "City of Jackson",
      authorityKind: "city",
      isPrimary: true,
      documentDate: null,
      effectiveFrom: null,
      retrievedAt: "2026-09-26",
      lastVerifiedAt: JK_LAST_VERIFIED,
      notes:
        "Describes the building-permit process and the Warren Hood Building permit counter. Publishes no fee amounts — this page and the OpenGov portal are the City's complete public permitting material, and neither states a fee.",
    },
    {
      key: "jackson-opengov-portal",
      jurisdictionKey: JK_KEYS.jurisdiction,
      title: "City of Jackson Building Permitting portal (OpenGov)",
      url: OPENGOV_URL,
      sourceType: "permit_portal",
      issuingAuthority: "City of Jackson",
      authorityKind: "city",
      isPrimary: true,
      documentDate: null,
      effectiveFrom: null,
      retrievedAt: "2026-09-26",
      lastVerifiedAt: JK_LAST_VERIFIED,
      notes:
        "The application channel. Lists Residential Building, Commercial Building, Demolition/Moving, Electrical, Fence, Gas, Mechanical, Plumbing, POD, generator and related permit types with their scope descriptions (quoted on the pages). Every 'Apply Online' action routes to the Viewpoint Cloud sign-in, so fees are visible only after authentication; the payment step happens after review ('you will receive notification to pay your permit fee').",
    },
    {
      key: "jackson-residential-page",
      jurisdictionKey: JK_KEYS.jurisdiction,
      title: "Residential Building and Permits",
      url: RESIDENTIAL_URL,
      sourceType: "municipal_website",
      issuingAuthority: "City of Jackson",
      authorityKind: "city",
      isPrimary: true,
      documentDate: null,
      effectiveFrom: null,
      retrievedAt: "2026-09-26",
      lastVerifiedAt: JK_LAST_VERIFIED,
      notes:
        "Residential permitting guidance. Publishes no fee amounts.",
    },
  ],

  permitTypes: [],
  projectTypes: [],

  jurisdictionPermitTypes: [
    {
      jurisdictionKey: JK_KEYS.jurisdiction,
      permitTypeKey: "building",
      isAvailable: true,
      localName: "Residential or Commercial Building Permit",
      officialUrl: OPENGOV_URL,
      notes:
        "Applied through OpenGov; two physical plan sets delivered to the Warren Hood Building before approval. Fee set by the adopted schedule, which the City does not publish online; quoted at issuance.",
    },
    {
      jurisdictionKey: JK_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      isAvailable: true,
      localName: "Electrical Permit",
      officialUrl: OPENGOV_URL,
      notes:
        "Single-issue trade permit (meter change-outs, outlets and fixtures, panel repairs, temporary poles) for work not attached to a building permit. No published fee.",
    },
    {
      jurisdictionKey: JK_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      isAvailable: true,
      localName: "Plumbing Permit",
      officialUrl: OPENGOV_URL,
      notes:
        "Single-issue trade permit (sewer line replacement, fixture replacements) for work not attached to a building permit. No published fee.",
    },
  ],

  feeSchedules: [
    {
      key: "jackson-adopted-fee-schedule",
      jurisdictionKey: JK_KEYS.jurisdiction,
      sourceKey: JK_SOURCE_KEY,
      title: "City of Jackson adopted schedule of permit fees (referenced, not published)",
      officialUrl: MUNICODE_URL,
      effectiveFrom: JK_FEE_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "draft",
      lastVerifiedAt: JK_LAST_VERIFIED,
      notes:
        "Sec. 26-2 establishes that an adopted schedule of fees governs, but no public document reproduces it: the City website, the Municode consolidation and the OpenGov portal (whose application forms sit behind the Viewpoint Cloud login) publish no amounts. Status 'draft' records that no public schedule has been identified — never filled by invention. See research/mississippi/jackson.md.",
    },
  ],

  feeRules: [
    ...JK_BUILDING_RULES.map((rule) => ({
      jurisdictionKey: JK_KEYS.jurisdiction,
      permitTypeKey: "building",
      scheduleKey: "jackson-adopted-fee-schedule",
      rule,
    })),
    ...JK_ELECTRICAL_RULES.map((rule) => ({
      jurisdictionKey: JK_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      scheduleKey: "jackson-adopted-fee-schedule",
      rule,
    })),
    ...JK_PLUMBING_RULES.map((rule) => ({
      jurisdictionKey: JK_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      scheduleKey: "jackson-adopted-fee-schedule",
      rule,
    })),
  ],

  requirements: [
    {
      jurisdictionKey: JK_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "document",
      title: "Two sets of physical plans and specifications",
      description:
        "Before permit approvals, two sets of physical plans and a specification sheet or book must be delivered to the Building Permit Division at the Warren Hood Building, 200 S. President Street, 3rd floor. Online applications are routed through review automatically; incomplete applications are rejected.",
      isMandatory: true,
      sortOrder: 1,
      sourceKey: "jackson-opengov-portal",
      lastVerifiedAt: JK_LAST_VERIFIED,
    },
    {
      jurisdictionKey: JK_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "other",
      title: "Intake review and multi-department routing",
      description:
        "A permitting staff member verifies application completeness, required attachments and contractor qualifications ('Intake Approval'), then routes the application through zoning, floodplain, historic preservation and construction plan review as applicable. Reviewers comment directly through the OpenGov system.",
      isMandatory: true,
      sortOrder: 2,
      sourceKey: "jackson-opengov-portal",
      lastVerifiedAt: JK_LAST_VERIFIED,
    },
    {
      jurisdictionKey: JK_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      requirementType: "license",
      title: "Bonded, licensed contractor",
      description:
        "Permits are issued only to master technicians who are bonded contractors; any contractor performing construction work in Jackson must have a bond on file with the office as required by ordinance, and advertising as licensed without the proper City of Jackson Mechanical Board license is unlawful.",
      isMandatory: true,
      sortOrder: 3,
      sourceKey: "jackson-opengov-portal",
      lastVerifiedAt: JK_LAST_VERIFIED,
    },
    {
      jurisdictionKey: JK_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      requirementType: "license",
      title: "Bonded master technician",
      description:
        "Plumbing permits are issued to master technicians who are bonded contractors, with the contractor's bond on file in the office as the ordinance requires. Drawings showing fixtures, pipe sizes, waste and sewer lines accompany applications unless the work is minor.",
      isMandatory: true,
      sortOrder: 4,
      sourceKey: "jackson-opengov-portal",
      lastVerifiedAt: JK_LAST_VERIFIED,
    },
  ],

  profile: {
    jurisdictionKey: JK_KEYS.jurisdiction,
    headline: "Jackson, Mississippi Permit Fees & Code Services",
    summary:
      "Jackson's Office of Code Services, on the third floor of the Warren Hood Building at 200 S. President Street, issues building, electrical, plumbing, mechanical, gas, fence and demolition permits through the City's OpenGov portal. Under Code of Ordinances Sec. 26-2, permit fees are 'established by the adopted schedule of fees', and that adopted schedule **is not published online**: the City's permit pages, the municipal code and the OpenGov portal (whose application forms open only to signed-in users) state no amounts. Fees are quoted during review and collected when the permit is issued — the portal notifies applicants when payment is due, and the division can be reached at (601) 960-1160. These pages describe the process, the permit catalogue and what drives the final amount, and state the absence plainly rather than inventing numbers.",
    localContext:
      "Jackson is Mississippi's capital and largest city, anchoring a permitting landscape that spans Hinds County and neighboring Rankin and Madison counties; work outside city limits goes to the counties or suburban cities (Ridgeland, Flowood, Clinton), each with its own office. Inside Jackson, every application passes intake review at the Warren Hood Building before routing to zoning, floodplain, historic preservation and plan review — the city's substantial historic districts make the preservation routing common.\n\nThe fee absence matters for budgeting: Jackson is one of the few large Mississippi cities with no public fee schedule, so applicants budget from the division's quote rather than from a table. This site records that absence and directs readers to the division, rather than estimating from third-party figures that no official source corroborates.",
    valuationBasis:
      "Not publishable: the adopted schedule that Sec. 26-2 defers to is not public, so the basis the City prices permits on is stated only inside that schedule. No valuation table is asserted here.",
    notIncluded:
      "Because no fee amounts are modelled for Jackson, there is nothing to add to or subtract from. For orientation, items that typically ride a Jackson permit but appear in no public schedule here include:\n\n- **Mechanical (HVAC) and gas permits**, separate single-issue trade permits.\n- **Water and sewer connection charges** billed by the City's water/sewer utility.\n- **Hinds County and state permits** — septic systems, driveways, rights-of-way.\n- **Impact or development fees** adopted separately from the permit fee schedule.\n\nThese are listed to frame the division's quote, not priced.",
    seoTitle: "Jackson MS Permit Fees | What the City Publishes (and What It Doesn't)",
    seoDescription:
      "Jackson, MS permit process for building, electrical and plumbing work: OpenGov applications, Code Services review, and why no public fee schedule exists. Fees quoted at issuance.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: JK_LAST_VERIFIED,
  },

  permitPages: [
    {
      jurisdictionKey: JK_KEYS.jurisdiction,
      permitTypeKey: "building",
      slug: "building-permit-cost",
      title: "Jackson Building Permit Cost",
      intro:
        "Jackson requires a building permit for new construction, substantial renovation, alteration and additions — one- and two-family structures under the International Residential Code apply on the residential application, everything else on the commercial one. But the City **publishes no building permit fee schedule**: Code of Ordinances Sec. 26-2 says fees are 'established by the adopted schedule of fees', which the City does not post online, and the OpenGov portal's application forms open only to signed-in users. Your fee is computed from that adopted schedule during review and quoted when you're notified to pay. This page documents the process and the honest absence — no invented amount appears here.",
      localSummary:
        "Applications go through Jackson's OpenGov portal, and before approval two sets of physical plans and the specification sheet must be delivered to the Building Permit Division on the third floor of the Warren Hood Building at 200 S. President Street. An intake reviewer checks completeness, attachments and contractor qualifications, then the application routes automatically through zoning, floodplain, historic preservation and plan review. When all reviews clear, you're notified to pay — online by credit card or ACH, or by cash, check or mail — and the permit issues automatically with printable job cards.",
      notIncluded:
        "No fee estimate is offered on this page, so there is nothing to itemize. The figures a final Jackson permit bill may include, none of which are publicly published, are the building permit fee itself, any plan-review charge in the adopted schedule, and trade permits for electrical, plumbing, mechanical and gas work that ride the same project. Water and sewer connection charges from the City's utility and any county or state permits sit outside the building permit entirely.",
      workedExample: null,
      faqs: [
        {
          question: "How much does a building permit cost in Jackson, Mississippi?",
          answer:
            "The City does not publish its fee schedule. Sec. 26-2 of the Code of Ordinances defers to an 'adopted schedule of fees' that the City does not post online — not on its permit pages, not in the municipal code, and not on the OpenGov portal, whose application forms are visible only after sign-in. The Building Permit Division computes the fee from that schedule during review and quotes it when you're notified to pay. Call (601) 960-1160 or (601) 960-1167 for the amount before you apply.",
          sourceId: JK_SOURCE_KEY,
          attribution: "Jackson Code of Ordinances Sec. 26-2; OpenGov portal process text",
        },
        {
          question: "Why doesn't Jackson publish its permit fees like other cities?",
          answer:
            "That's simply how the City administers it: the ordinance establishes fees by reference to an adopted internal schedule rather than by publishing amounts. Nothing in the code hides them — but nothing reproduces them either, and third-party sites that quote Jackson figures (such as '$85 base plus $8 per $1,000') cite no official source and should not be relied on.",
          sourceId: JK_SOURCE_KEY,
          attribution: "Jackson Code of Ordinances Sec. 26-2",
        },
        {
          question: "How do I apply for a Jackson building permit?",
          answer:
            "Through the City's OpenGov portal (jacksonms.portal.opengov.com), choosing the residential application for one- and two-family work under the IRC and the commercial one for everything else. After the online application, two sets of physical plans and the specification sheet or book must be delivered to the Building Permit Division, Warren Hood Building, 200 S. President Street, 3rd floor, before approvals.",
          sourceId: "jackson-opengov-portal",
          attribution: "City of Jackson Building Permitting portal",
        },
        {
          question: "What happens after I submit a Jackson permit application?",
          answer:
            "A staff member performs 'Intake Approval' — verifying completeness, required attachments and contractor qualifications — and you're notified when it's done. The application then routes automatically through zoning, floodplain, historic preservation and construction plan review as applicable, with reviewers commenting to you through the system. When all reviews are complete you receive notification to pay the permit fee.",
          sourceId: "jackson-opengov-portal",
          attribution: "City of Jackson Building Permitting portal",
        },
        {
          question: "When do I pay for a Jackson building permit?",
          answer:
            "After all reviews are complete, not at submission. The portal notifies you that your permit is ready to pay; you can pay online by credit card or ACH check draft, drop off cash, or mail a check. Once payment is complete the permit issues automatically and can be printed online.",
          sourceId: "jackson-opengov-portal",
          attribution: "City of Jackson Building Permitting portal",
        },
        {
          question: "Who can pull a building permit in Jackson?",
          answer:
            "Permits are issued only to master technicians who are bonded contractors. Any contractor performing construction work in the City must have a bond on file in the office as required by ordinance, and it is unlawful to advertise as licensed without the proper City of Jackson Mechanical Board license for the trade.",
          sourceId: "jackson-opengov-portal",
          attribution: "City of Jackson Building Permitting portal, permit conditions",
        },
        {
          question: "Does Jackson require separate permits for electrical and plumbing work?",
          answer:
            "Yes for stand-alone trade work. The OpenGov catalogue lists single-issue Electrical, Plumbing, Gas and Mechanical permits for projects not associated with a building permit — meter change-outs, outlets and fixtures, panel repairs, sewer line replacements and similar. If the trade work is part of a larger project, the general contractor includes it in the residential or commercial building application.",
          sourceId: "jackson-opengov-portal",
          attribution: "City of Jackson Building Permitting portal",
        },
        {
          question: "What if my project address isn't in Jackson's system?",
          answer:
            "Contact staff to have the missing address added or the address assigned — you can also apply with the parcel number and comment to the intake reviewer that the address needs to be added. For support, call the division at (601) 960-1160.",
          sourceId: "jackson-opengov-portal",
          attribution: "City of Jackson Building Permitting portal",
        },
      ],
      seoTitle: "Jackson MS Building Permit Cost | No Public Fee Schedule — Here's the Process",
      seoDescription:
        "Jackson, MS publishes no building permit fee schedule. How fees are set under Sec. 26-2, how to apply through OpenGov, and how to get a quote from Code Services.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: JK_LAST_VERIFIED,
    },
    {
      jurisdictionKey: JK_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      slug: "electrical-permit-cost",
      title: "Jackson Electrical Permit Cost",
      intro:
        "Jackson's electrical permit is a single-issue trade permit for electrical projects **not** attached to a larger building application — meter change-outs, adding outlets and fixtures, panel repairs, temporary electric poles. It's applied for through the City's OpenGov portal. But the City **publishes no electrical permit fee schedule**: the adopted schedule that Sec. 26-2 defers to is not online, and the portal's application form is visible only after sign-in. The fee is set from that schedule at review and quoted when you're notified to pay. No amount is invented here — this page documents what the permit covers and how the fee gets set.",
      localSummary:
        "The permit covers single-issue work by bonded, licensed electrical contractors; larger projects include their electrical scope in the general building application instead. Applications route through intake review at the Warren Hood Building, and payment comes only after all reviews complete — by credit card or ACH online, or by cash or check at the division. Inspections are requested and monitored through the same portal, and the permit prints with job cards that must be posted on site.",
      notIncluded:
        "No fee estimate is offered because none is published. A final Jackson electrical permit may include the permit fee itself and any reinspection charges in the adopted schedule; Entergy's metering and connection charges, state licensing costs and any building-permit fee for a larger project sit outside this trade permit entirely.",
      workedExample: null,
      faqs: [
        {
          question: "How much does an electrical permit cost in Jackson, MS?",
          answer:
            "The City doesn't publish the amount. The adopted schedule of fees that Sec. 26-2 defers to isn't posted online, and the OpenGov application form shows fees only after sign-in. The Building Permit Division quotes the fee during review; call (601) 960-1160 for the amount. Third-party sites quoting Jackson electrical fees cite no official source.",
          sourceId: JK_SOURCE_KEY,
          attribution: "Jackson Code of Ordinances Sec. 26-2; OpenGov portal",
        },
        {
          question: "What work needs a stand-alone electrical permit in Jackson?",
          answer:
            "Electrical projects not associated with a Commercial or Residential Building Permit: meter change-outs, adding outlets and fixtures, panel repairs, temporary electric poles and similar single-issue jobs. If the work is part of a larger project, the general contractor or project lead includes it in the building application rather than filing separately.",
          sourceId: "jackson-opengov-portal",
          attribution: "City of Jackson Building Permitting portal",
        },
        {
          question: "How do I apply for a Jackson electrical permit?",
          answer:
            "Through the City's OpenGov portal under Building Permitting. Applications must be complete or they're rejected, and permits are issued only to master technicians who are bonded contractors with a bond on file in the office.",
          sourceId: "jackson-opengov-portal",
          attribution: "City of Jackson Building Permitting portal",
        },
        {
          question: "When is the electrical permit fee paid in Jackson?",
          answer:
            "After review. The portal notifies you when the permit is ready to pay; payment is online by credit card or ACH, or by cash or check at the division. The permit issues automatically once payment completes.",
          sourceId: "jackson-opengov-portal",
          attribution: "City of Jackson Building Permitting portal",
        },
        {
          question: "Do I need plans for a Jackson electrical permit?",
          answer:
            "Applications must be accompanied by two complete sets of drawings unless the work is minor enough not to require plan review or is part of a permitted building project. For typical single-issue electrical work — a meter swap, a panel repair — the minor-work exception applies.",
          sourceId: "jackson-opengov-portal",
          attribution: "City of Jackson Building Permitting portal",
        },
        {
          question: "Can a homeowner pull an electrical permit in Jackson?",
          answer:
            "The portal's conditions state permits are issued only to master technicians who are bonded contractors, and contractors must hold the proper City of Jackson Mechanical Board license. Homeowners planning their own electrical work should contact the Building Permit Division at (601) 960-1160 to confirm how the rule applies to them.",
          sourceId: "jackson-opengov-portal",
          attribution: "City of Jackson Building Permitting portal",
        },
        {
          question: "How are electrical inspections handled in Jackson?",
          answer:
            "Through the OpenGov portal: you request and monitor inspections online as needed, and the permit prints with a job card that must be posted on site in a protective sleeve somewhere easily visible.",
          sourceId: "jackson-opengov-portal",
          attribution: "City of Jackson Building Permitting portal",
        },
        {
          question: "What is a temporary electric pole permit in Jackson?",
          answer:
            "The portal lists temporary power among the examples a stand-alone electrical permit covers — service for construction sites before permanent power is connected. The fee comes from the same unpublished adopted schedule; the division quotes it at (601) 960-1160.",
          sourceId: "jackson-opengov-portal",
          attribution: "City of Jackson Building Permitting portal",
        },
      ],
      seoTitle: "Jackson MS Electrical Permit Cost | Process & Fee Quote (No Public Schedule)",
      seoDescription:
        "Jackson, MS electrical permits: what work needs one, how to apply through OpenGov, and why the fee amount isn't published. Quoted by Code Services at review.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: JK_LAST_VERIFIED,
    },
    {
      jurisdictionKey: JK_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      slug: "plumbing-permit-cost",
      title: "Jackson Plumbing Permit Cost",
      intro:
        "Jackson's plumbing permit is a single-issue trade permit for plumbing projects **not** attached to a larger building application — sewer line replacements, plumbing fixture replacements and similar work. It's applied for through the City's OpenGov portal. But the City **publishes no plumbing permit fee schedule**: the adopted schedule that Code of Ordinances Sec. 26-2 defers to is not online, and the portal's application form is visible only after sign-in. The fee is computed from that schedule during review and quoted when you're notified to pay. This page states the absence plainly rather than inventing an amount.",
      localSummary:
        "The permit covers single-issue plumbing work by bonded master technicians; larger projects include their plumbing scope in the building application instead. Applications must be complete and, unless the work is minor, accompanied by two sets of drawings showing fixtures, pipe sizes and waste and sewer lines. After intake review and any routing through other departments, the portal notifies you to pay — online by card or ACH, or by cash or check — and the permit issues automatically with a printable job card.",
      notIncluded:
        "No fee estimate is offered because none is published. A final Jackson plumbing permit may include the permit fee itself and any inspection or reinspection charges in the adopted schedule; water and sewer tap and connection charges from the City's utility, county septic permits outside the sewer area, and any building-permit fee for a larger project sit outside this trade permit.",
      workedExample: null,
      faqs: [
        {
          question: "How much does a plumbing permit cost in Jackson, Mississippi?",
          answer:
            "Jackson doesn't publish the figure. The adopted schedule of fees referenced in Sec. 26-2 isn't posted online — the City's permit pages, the municipal code and the OpenGov portal all publish no amounts, and the portal's application form opens only to signed-in users. The Building Permit Division quotes the fee during review; call (601) 960-1160.",
          sourceId: JK_SOURCE_KEY,
          attribution: "Jackson Code of Ordinances Sec. 26-2; OpenGov portal",
        },
        {
          question: "What plumbing work needs a stand-alone permit in Jackson?",
          answer:
            "Plumbing projects not associated with a Commercial or Residential Building Permit — the portal's examples are sewer line replacement and plumbing fixture replacements. If the plumbing is part of a larger project, the general contractor includes it in the building application.",
          sourceId: "jackson-opengov-portal",
          attribution: "City of Jackson Building Permitting portal",
        },
        {
          question: "Do I need drawings for a Jackson plumbing permit?",
          answer:
            "Two complete sets of drawings showing plans, fixture counts, pipe sizes, waste lines and sewer lines accompany applications unless the work is minor and needs no plan review, or is part of a permitted building project. An architect's or engineer's Mississippi seal is required only on larger occupancies and buildings.",
          sourceId: "jackson-opengov-portal",
          attribution: "City of Jackson Building Permitting portal",
        },
        {
          question: "Who can pull a plumbing permit in Jackson?",
          answer:
            "Permits are issued only to master technicians who are bonded contractors, with a bond on file in the office as the ordinance requires. Advertising as a licensed contractor without the proper City of Jackson Mechanical Board license is unlawful.",
          sourceId: "jackson-opengov-portal",
          attribution: "City of Jackson Building Permitting portal",
        },
        {
          question: "When is the plumbing permit fee paid?",
          answer:
            "After all reviews complete. The OpenGov system notifies you to pay; payment is online by credit card or ACH check draft, or by cash or check at the division. Once payment completes the permit issues automatically and prints with a job card for the site.",
          sourceId: "jackson-opengov-portal",
          attribution: "City of Jackson Building Permitting portal",
        },
        {
          question: "Does Jackson charge separately for water and sewer connections?",
          answer:
            "Any connection charges are separate from the permit and billed by the City's water and sewer utility, not set in the permit fee schedule — and neither amount is published online here. The permit's own fee comes from the adopted schedule; contact the division at (601) 960-1160 and the utility for the respective amounts.",
          sourceId: JK_SOURCE_KEY,
          attribution: "Jackson Code of Ordinances Sec. 26-2",
        },
        {
          question: "How do inspections work after a Jackson plumbing permit?",
          answer:
            "Through the portal: you request and monitor inspections online as needed, keep the printed job card posted on site, and request the certificate of occupancy or inspection through the system where applicable. Final inspections won't be made if the work doesn't match the approved drawings.",
          sourceId: "jackson-opengov-portal",
          attribution: "City of Jackson Building Permitting portal",
        },
        {
          question: "Are Jackson permit fees the same for commercial work?",
          answer:
            "The adopted schedule the code defers to governs all permit types, and its internal structure isn't public. Rather than guessing at commercial-to-residential ratios, this page records the absence; the Building Permit Division at (601) 960-1160 quotes the fee for your specific application.",
          sourceId: JK_SOURCE_KEY,
          attribution: "Jackson Code of Ordinances Sec. 26-2",
        },
      ],
      seoTitle: "Jackson MS Plumbing Permit Cost | Process & Fee Quote (No Public Schedule)",
      seoDescription:
        "Jackson, MS plumbing permits: what work needs one, drawings required, who can pull it, and why the fee isn't published. Quoted by Code Services at review.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: JK_LAST_VERIFIED,
    },
  ],

  verifications: [
    {
      entityType: "jurisdiction_profile",
      entityKey: JK_KEYS.jurisdiction,
      status: "verified",
      method: "official_portal_check",
      verifiedAt: JK_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Mississippi Expansion",
      sourceKey: "jackson-opengov-portal",
      notes:
        "Department identity, Warren Hood Building address, phones and portal process verified from the City pages and the OpenGov portal.",
    },
    {
      entityType: "fee_schedule",
      entityKey: "jackson-adopted-fee-schedule",
      status: "needs_review",
      method: "official_portal_check",
      verifiedAt: JK_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Mississippi Expansion",
      sourceKey: JK_SOURCE_KEY,
      notes:
        "No public fee schedule found. Verified the absence across: City permit pages (no amounts), Municode Ch. 26 (defers to the adopted schedule without reproducing it), and the OpenGov portal — the Plumbing Permit record type's 'Apply Online' action was followed live on 2026-09-26 and routes to the Viewpoint Cloud sign-in, so application forms and any embedded fees are behind authentication. Third-party figures are uncorroborated and not adopted. Re-verify if the City publishes the schedule.",
    },
    {
      entityType: "permit_page",
      entityKey: "building-permit-cost",
      permitTypeKey: "building",
      status: "verified",
      method: "manual_review",
      verifiedAt: JK_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Mississippi Expansion",
      sourceKey: JK_SOURCE_KEY,
      notes:
        "Published with the no-schedule statement: zero fee rules, no worked example, no dollar amounts anywhere on the page, per the editorial gate's hasNoScheduleStatement case.",
    },
    {
      entityType: "permit_page",
      entityKey: "electrical-permit-cost",
      permitTypeKey: "electrical",
      status: "verified",
      method: "manual_review",
      verifiedAt: JK_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Mississippi Expansion",
      sourceKey: JK_SOURCE_KEY,
      notes:
        "Published with the no-schedule statement: zero fee rules, no worked example, no dollar amounts anywhere on the page.",
    },
    {
      entityType: "permit_page",
      entityKey: "plumbing-permit-cost",
      permitTypeKey: "plumbing",
      status: "verified",
      method: "manual_review",
      verifiedAt: JK_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Mississippi Expansion",
      sourceKey: JK_SOURCE_KEY,
      notes:
        "Published with the no-schedule statement: zero fee rules, no worked example, no dollar amounts anywhere on the page.",
    },
  ],
};
