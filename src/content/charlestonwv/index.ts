import type { JurisdictionSeed } from "@/content/seed-types";
import {
  CH_BUILDING_EFFECTIVE_FROM,
  CH_BUILDING_RULES,
  CH_BUILDING_SOURCE_KEY,
  CH_ELECTRICAL_EFFECTIVE_FROM,
  CH_ELECTRICAL_RULES,
  CH_ELECTRICAL_SOURCE_KEY,
} from "@/content/charlestonwv/fee-rules";

export const CH_LAST_VERIFIED = "2026-09-27";

export const CH_KEYS = {
  state: "wv",
  county: "kanawha-county-wv",
  jurisdiction: "charleston-wv",
} as const;

const state = {
  code: "WV",
  slug: "west-virginia",
  name: "West Virginia",
  fipsCode: "54",
};

const county = {
  key: CH_KEYS.county,
  slug: "kanawha-county-wv",
  name: "Kanawha County",
  fipsCode: "54039",
};

const CITY_URL = "https://www.charlestonwv.gov";
const PERMITS_URL = `${CITY_URL}/government/city-departments/building-commission/permits`;
const SCHEDULE_URL = `${CITY_URL}/sites/default/files/non-departmental-documents/2022-08/SCHEDULE%20OF%20FEES%20PDF.pdf`;
const ELECTRICAL_URL = `${CITY_URL}/sites/default/files/non-departmental-documents/2019-09/ELECTRICAL%20PERMIT%20APP%202016_0.pdf`;
const RBP1_URL = `${CITY_URL}/sites/default/files/non-departmental-documents/2022-08/RESIDENTIAL%20PERMIT%20-%20NEW.pdf`;

const BUILDING_SCHEDULE_KEY = "charleston-building-fee-schedule";

export const charlestonWvSeed: JurisdictionSeed = {
  state,
  county,

  jurisdiction: {
    key: CH_KEYS.jurisdiction,
    stateKey: CH_KEYS.state,
    countyKey: CH_KEYS.county,
    type: "city",
    slug: "charleston",
    name: "Charleston",
    officialName: "City of Charleston — Building Commission, Building Department",
    websiteUrl: CITY_URL,
    permitPortalUrl: PERMITS_URL,
    timezone: "America/New_York",
    isActive: true,
  },

  departments: [
    {
      key: "charleston-building-commission",
      jurisdictionKey: CH_KEYS.jurisdiction,
      kind: "building",
      name: "City of Charleston Building Commission",
      phone: "(304) 348-6833",
      email: null,
      url: PERMITS_URL,
      addressLine: "915 Quarrier Street, Suite 5, Charleston, WV 25301-2607",
      hours: "Monday – Friday, 8:30 a.m. – 4:30 p.m. ET",
      notes:
        "The Building Commission issues building, electrical, plumbing and HVAC permits for the City and performs the inspections. Permit questions: (304) 348-6833.",
    },
  ],

  sources: [
    {
      key: CH_BUILDING_SOURCE_KEY,
      jurisdictionKey: CH_KEYS.jurisdiction,
      title: "City of Charleston Building Department — Schedule of Permit Fees",
      url: SCHEDULE_URL,
      sourceType: "fee_schedule_pdf",
      issuingAuthority: "City of Charleston Building Department",
      authorityKind: "city",
      isPrimary: true,
      documentDate: "2008-04-14",
      effectiveFrom: CH_BUILDING_EFFECTIVE_FROM,
      retrievedAt: CH_LAST_VERIFIED,
      lastVerifiedAt: CH_LAST_VERIFIED,
      notes:
        "EFFECTIVE: APRIL 14, 2008. Image scan with no text layer: read by OCR over a 300-dpi render and reconciled row by row against the printed checkpoints ($60,000 → $280.50, $1,000,000 → $4,980.50). Carries the closing note 'BUILDING PERMIT FEES WILL BE WAIVED FOR TOTAL JOB COSTS UP TO $2500.00' and the plan-review rate. Says in its own text that it does not apply to electrical, HVAC or plumbing permits.",
    },
    {
      key: "charleston-permits-page",
      jurisdictionKey: CH_KEYS.jurisdiction,
      title: "Building Commission — Permits",
      url: PERMITS_URL,
      sourceType: "municipal_website",
      issuingAuthority: "City of Charleston",
      authorityKind: "city",
      isPrimary: true,
      documentDate: null,
      effectiveFrom: null,
      retrievedAt: CH_LAST_VERIFIED,
      lastVerifiedAt: CH_LAST_VERIFIED,
      notes:
        "States that 'Construction permit fees are assessed using the Schedule of Permit Fees and are waived for construction total job cost up to $2,500.00', gives the sign-permit rates and the penalty (minimum $100 or twice the permit fee), and defers electrical, plumbing and HVAC amounts to the permit applications themselves.",
    },
    {
      key: CH_ELECTRICAL_SOURCE_KEY,
      jurisdictionKey: CH_KEYS.jurisdiction,
      title: "City of Charleston — Electrical Permit application, REVISED 01-30-2015",
      url: ELECTRICAL_URL,
      sourceType: "fee_schedule_pdf",
      issuingAuthority: "City of Charleston Building Commission",
      authorityKind: "city",
      isPrimary: true,
      documentDate: "2015-01-30",
      effectiveFrom: CH_ELECTRICAL_EFFECTIVE_FROM,
      retrievedAt: CH_LAST_VERIFIED,
      lastVerifiedAt: CH_LAST_VERIFIED,
      notes:
        "Scanned form whose two fee columns (Residential / Commercial) are the City's only published electrical figures. Read cell by cell with OCR over the 300-dpi render. The commercial new-service row's boundary between the $65.00 and $75.00 bands is the one reading the scan left ambiguous; the amounts themselves are certain. Carries the note 'A FINAL INSPECTION FEE OF $15.00 SHALL BE ADDED TO ALL ELECTRICAL PERMITS'.",
    },
    {
      key: "charleston-residential-permit-form",
      jurisdictionKey: CH_KEYS.jurisdiction,
      title: "City of Charleston — Residential Building Permit (RBP-1)",
      url: RBP1_URL,
      sourceType: "fee_schedule_pdf",
      issuingAuthority: "City of Charleston Building Commission",
      authorityKind: "city",
      isPrimary: true,
      documentDate: "2015-06-15",
      effectiveFrom: null,
      retrievedAt: CH_LAST_VERIFIED,
      lastVerifiedAt: CH_LAST_VERIFIED,
      notes:
        "Has a text layer. Confirms the building fee is entered from the schedule against 'Total Estimated Cost (all labor & materials)' and that a copy of the executed contract is required for all projects valued at $10,000.00 or more; the form prints no fee table of its own.",
    },
  ],

  permitTypes: [],
  projectTypes: [],

  jurisdictionPermitTypes: [
    {
      jurisdictionKey: CH_KEYS.jurisdiction,
      permitTypeKey: "building",
      isAvailable: true,
      localName: "Building Permit",
      officialUrl: SCHEDULE_URL,
      notes:
        "Priced on total job cost by the Schedule of Permit Fees: waived to $2,500.00, then the printed ladder to $30,000.00 and $5.00 per additional $1,000 above it. Commercial construction $50,000.00 and up also pays plan review at .00075.",
    },
    {
      jurisdictionKey: CH_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      isAvailable: true,
      localName: "Electrical Permit",
      officialUrl: ELECTRICAL_URL,
      notes:
        "Priced by the Electrical Permit application's own two fee columns; a $15.00 final inspection fee is added to every electrical permit.",
    },
    {
      jurisdictionKey: CH_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      isAvailable: true,
      localName: "Plumbing Permit",
      officialUrl: PERMITS_URL,
      notes:
        "The City issues plumbing permits but publishes no plumbing fee table: the Schedule of Permit Fees says it does not apply to plumbing, and the permits page defers to the permit applications, whose plumbing amounts are not posted. The page states that absence.",
    },
  ],

  feeSchedules: [
    {
      key: BUILDING_SCHEDULE_KEY,
      jurisdictionKey: CH_KEYS.jurisdiction,
      sourceKey: CH_BUILDING_SOURCE_KEY,
      title: "Charleston Schedule of Permit Fees (effective 2008-04-14)",
      officialUrl: SCHEDULE_URL,
      effectiveFrom: CH_BUILDING_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: CH_LAST_VERIFIED,
      notes:
        "The operative building fee schedule. Old but current: it is the document the City still links from its permits page and it carries its own effective date.",
    },
    {
      key: "charleston-electrical-fee-schedule",
      jurisdictionKey: CH_KEYS.jurisdiction,
      sourceKey: CH_ELECTRICAL_SOURCE_KEY,
      title: "Charleston Electrical Permit fee table (form revised 2015-01-30)",
      officialUrl: ELECTRICAL_URL,
      effectiveFrom: CH_ELECTRICAL_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: CH_LAST_VERIFIED,
      notes: "The electrical application's own fee columns; the only published electrical amounts.",
    },
  ],

  feeRules: [
    ...CH_BUILDING_RULES.map((rule) => ({
      jurisdictionKey: CH_KEYS.jurisdiction,
      permitTypeKey: "building",
      scheduleKey: BUILDING_SCHEDULE_KEY,
      rule,
    })),
    ...CH_ELECTRICAL_RULES.map((rule) => ({
      jurisdictionKey: CH_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      scheduleKey: "charleston-electrical-fee-schedule",
      rule,
    })),
  ],

  requirements: [
    {
      jurisdictionKey: CH_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "document",
      title: "Two sets of plans and two site plans",
      description:
        "The Residential Building Permit lists what accompanies an application: two sets of construction plans; two site plans showing the proposed structure's location, distances to lot lines, existing structures, parking, the sanitary sewer tap and the stormwater plan; the Kanawha County tax map and parcel number; a zoning permit from the Municipal Planning Commission; a determination of floodway/flood plain designation; and a list of all contractors and subcontractors.",
      isMandatory: true,
      sortOrder: 1,
      sourceKey: "charleston-residential-permit-form",
      lastVerifiedAt: CH_LAST_VERIFIED,
    },
    {
      jurisdictionKey: CH_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "document",
      title: "Copy of the executed contract at $10,000 or more",
      description:
        "The Schedule of Permit Fees states that jobs exceeding $10,000.00 require a copy of an executed contract, and the residential form repeats the requirement for all projects valued at $10,000.00 or more.",
      isMandatory: true,
      sortOrder: 2,
      sourceKey: CH_BUILDING_SOURCE_KEY,
      lastVerifiedAt: CH_LAST_VERIFIED,
    },
    {
      jurisdictionKey: CH_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      requirementType: "document",
      title: "Copy of the executed contract above $10,000",
      description:
        "The Electrical Permit form states that projects exceeding $10,000.00 will require a copy of an executed contract.",
      isMandatory: true,
      sortOrder: 3,
      sourceKey: CH_ELECTRICAL_SOURCE_KEY,
      lastVerifiedAt: CH_LAST_VERIFIED,
    },
    {
      jurisdictionKey: CH_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "license",
      title: "West Virginia contractor licence and Charleston registration",
      description:
        "The residential building permit asks for the contractor's West Virginia contractor's licence number and Charleston registration number.",
      isMandatory: true,
      sortOrder: 4,
      sourceKey: "charleston-residential-permit-form",
      lastVerifiedAt: CH_LAST_VERIFIED,
    },
  ],

  profile: {
    jurisdictionKey: CH_KEYS.jurisdiction,
    headline: "Charleston, West Virginia Permit Fees & Building Commission",
    summary:
      "Charleston's Building Commission, at 915 Quarrier Street, issues the City's building, electrical, plumbing and HVAC permits. Building work is priced from **total job cost** on the City's Schedule of Permit Fees: the fee is **waived entirely up to $2,500.00**, runs a printed ladder to **$130.50 at $30,000.00**, and adds **$5.00 per additional $1,000 or fraction** above that. Commercial construction of $50,000.00 or more also pays **plan review at 0.075% of the job cost** ($37.50 at $50,000). Electrical permits are priced from the Electrical Permit application's own two columns and always carry a **$15.00 final inspection fee**. The City publishes no plumbing fee table, which the plumbing page states plainly.",
    localContext:
      "Charleston is West Virginia's capital and its largest city, and it sits in a river valley where the Kanawha and Elk rivers meet — which is why the Building Commission's permit paperwork carries land-disturbance, stormwater and flood-plain questions alongside the construction details. The City enforces the West Virginia State Building Code and issues a zoning permit through the Municipal Planning Commission before construction permits are issued.\n\nThe fee schedule is old and dated: it was enacted effective April 14, 2008 and the City still links it from its permits page, so the amounts here are genuinely current in the only sense that matters — they are what the department assesses today. Electrical amounts live on the permit application rather than in the schedule, and plumbing amounts are on an application the City does not post.",
    valuationBasis:
      "Building permit fees are computed from 'Total Estimated Cost (all labor & materials)' — the declared job cost, the figure the residential application asks for by that name. The history is that the printed bands are $1,000 wide with a $5.00 step above $30,000.00; the fraction language is the schedule's own ('Add $5.00 per $1000.00 after $30,000.00'), so a partial thousand pays a whole step.",
    notIncluded:
      "These figures cover City of Charleston building and electrical permit fees only. They exclude:\n\n- **Plumbing and HVAC permits**, which the City prices on the permit applications and does not publish.\n- **Zoning permits** issued by the Municipal Planning Commission, required before the building permit.\n- **Land-disturbance and stormwater approvals**, and any flood-plain review or elevation certificate.\n- **Sign permits**, priced separately on the permits page.\n- **Penalties for work without a permit** — a minimum $100 fee or twice the normal permit fee, whichever is greater.\n- **Fire, health and state permits** issued by other authorities.",
    seoTitle: "Charleston WV Permit Fees | Building Commission Fee Schedule",
    seoDescription:
      "Charleston, WV permit fees: building waived to $2,500 then the 2008 schedule ladder, plan review at 0.075% on commercial work, electrical from $20 with a $15 final inspection.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: CH_LAST_VERIFIED,
  },

  permitPages: [
    {
      jurisdictionKey: CH_KEYS.jurisdiction,
      permitTypeKey: "building",
      slug: "building-permit-cost",
      title: "Charleston, WV Building Permit Cost",
      intro:
        "A Charleston building permit is assessed on **total job cost** from the Building Department's Schedule of Permit Fees. The fee is **waived entirely where the job cost is $2,500.00 or less**. Above that, the printed ladder runs in $1,000 bands: **$18.50 at $1,501–$2,500**, then **$4.00 per additional $1,000 or fraction**, reaching **$130.50 at $30,000**. From there the schedule's own note adds **$5.00 per additional $1,000 or fraction** — $280.50 at $60,000, $980.50 at $200,000, $4,980.50 at $1,000,000. Commercial construction of $50,000.00 or more also pays an environmental-style **plan review of 0.075% ( .00075) of the job cost**, which the schedule illustrates as $37.50 at $50,000 and $75.00 at $100,000.",
      localSummary:
        "The Building Commission at 915 Quarrier Street administers the schedule and performs the inspections. Applications carry two sets of plans and two site plans along with zoning, flood-plain and stormwater information, and any job over $10,000 needs a copy of the executed contract. West Virginia's State Building Code governs; the City's zoning permit from the Municipal Planning Commission comes first. Building work without a permit is penalised at a minimum $100 or twice the normal fee, whichever is greater.",
      notIncluded:
        "This estimate covers the City of Charleston building permit fee and the commercial plan-review fee only. It excludes:\n\n- **Electrical, plumbing and HVAC permits**, which the schedule says it does not cover.\n- **The zoning permit** issued by the Municipal Planning Commission.\n- **Land-disturbance approval and stormwater review** for sites disturbing more than 5,000 square feet or adding 1,000 square feet of impervious area.\n- **Demolition and landscaping permits** beyond the $30.00 demolition line.\n- **Penalties for unpermitted work.**",
      workedExample: {
        scenario:
          "A commercial alteration in Charleston with a total estimated job cost of $60,000, priced on the building schedule.",
        inputs: {
          valuationCents: 6_000_000,
          squareFootage: 3_000,
          occupancy: "commercial",
          workType: "alteration",
        },
        notes:
          "Fee: **$280.50**, which is the schedule's own printed checkpoint — $130.50 at $30,000.00 plus 30 × $5.00 for the thirty $1,000 bands above it. Plan review is charged separately at 0.075% of the job cost, because a commercial job of $50,000.00 or more pays it: **$45.00** here.",
      },
      faqs: [
        {
          question: "How is a Charleston building permit fee calculated?",
          answer:
            "From total job cost on the City's Schedule of Permit Fees. Job costs up to $2,500.00 are waived. Above that the printed ladder charges $18.50 in the $1,501–$2,500 band and $4.00 for each additional $1,000 or fraction to $30,000.00, then $5.00 per additional $1,000 or fraction.",
          sourceId: CH_BUILDING_SOURCE_KEY,
          attribution: "City of Charleston Schedule of Permit Fees",
        },
        {
          question: "Is there a minimum building permit fee in Charleston?",
          answer:
            "No — the opposite. The schedule waives building permit fees entirely where the total job cost is $2,500.00 or less, so most small repairs and replacements pay nothing. The first charged band begins at $2,501.00.",
          sourceId: CH_BUILDING_SOURCE_KEY,
          attribution: "City of Charleston Schedule of Permit Fees",
        },
        {
          question: "When does plan review apply, and how much is it?",
          answer:
            "Plan review is charged on all commercial construction of $50,000.00 and above, at .00075 of the construction figure — three-quarters of a dollar per $1,000. The schedule's own examples are $37.50 at $50,000.00 and $75.00 at $100,000.00. Residential work pays no separate plan-review fee.",
          sourceId: CH_BUILDING_SOURCE_KEY,
          attribution: "City of Charleston Schedule of Permit Fees",
        },
        {
          question: "How much is a demolition permit in Charleston?",
          answer:
            "A flat $30.00 for any structure valued up to $5,000.00. Above $5,000.00 the demolition is priced 'by schedule of fees' — the same valuation ladder that prices a construction permit.",
          sourceId: CH_BUILDING_SOURCE_KEY,
          attribution: "City of Charleston Schedule of Permit Fees",
        },
        {
          question: "What paperwork goes with a Charleston building permit application?",
          answer:
            "Two sets of construction plans and two site plans, the Kanawha County tax map and parcel number, a zoning permit from the Municipal Planning Commission, a floodway/flood-plain determination, and a list of all contractors and subcontractors. Jobs over $10,000.00 need a copy of the executed contract.",
          sourceId: "charleston-residential-permit-form",
          attribution: "City of Charleston Residential Building Permit (RBP-1)",
        },
        {
          question: "What happens if work starts without a Charleston building permit?",
          answer:
            "The permits page states that work done without a permit pays a minimum $100 fee or twice the normal permit fee, whichever is greater, and can lead to licence suspension.",
          sourceId: "charleston-permits-page",
          attribution: "City of Charleston Building Commission — Permits",
        },
      ],
      seoTitle: "Charleston WV Building Permit Cost (2008 Fee Schedule & $2,500 Waiver)",
      seoDescription:
        "Charleston WV building permit fees: waived to $2,500 of job cost, then $4 per $1,000 to $30,000 and $5 per $1,000 above; plan review .00075 on commercial work.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: CH_LAST_VERIFIED,
    },
    {
      jurisdictionKey: CH_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      slug: "electrical-permit-cost",
      title: "Charleston, WV Electrical Permit Cost",
      intro:
        "Charleston electrical permits are priced from the Electrical Permit application's own two fee columns, not from the building schedule — which says explicitly that it does not apply to electrical work. **A final inspection fee of $15.00 is added to every electrical permit.** A residential permit prices each scope flat: $20.00 for a service upgrade, $25.00 for a temporary service pole or an emergency power system, $30.00 for remodeling, new construction or a security system, $20.00 for a burglar alarm or low-voltage work, and $5.00 per opening; a new service is $30.00 up to 99 amps, $40.00 to 200 amps and $50.00 above. A commercial permit prices the trade from job cost — $15.00 to $1,500, stepping to $25.00, $40.00 and $50.00 and then $60.00 plus $1.00 per $1,000 over $10,000 — with its own amperage, fire-alarm and low-voltage rows.",
      localSummary:
        "The form's residential and commercial columns answer different questions, so the first input is whether the job is a dwelling or a commercial occupancy. Commercial permits also price openings at $0.50 each rather than $5.00, and a fire alarm is $20.00 up to three floors and $40.00 at four or more. The form is the office's own application (revised 01-30-2015), and the final-inspection fee is printed on it as an instruction rather than a row.",
      notIncluded:
        "This estimate covers the City of Charleston electrical permit fee and its final-inspection fee only. It excludes:\n\n- **Building, plumbing and HVAC permits** for the same project.\n- **Zoning approval** from the Municipal Planning Commission where the work changes a use.\n- **Appalachian Power or Mon Power** service connection and metering charges.\n- **State electrical licensing** fees and contractor registration with the City.\n- **Plan review** where the electrical work is part of a commercial project's construction plans.",
      workedExample: {
        scenario:
          "A Charleston commercial tenant fit-out: $20,000 of electrical job cost, six openings and a low-voltage run.",
        inputs: {
          valuationCents: 2_000_000,
          occupancy: "commercial",
          workType: "alteration",
          custom: { openings: 6, low_voltage: true },
        },
        notes:
          "Job-cost row above $10,000: **$60.00 + $1.00 × 10** (the ten whole $1,000 bands over the threshold) = **$70.00**. Openings: 6 × $0.50 = **$3.00**. Low voltage: **$30.00**. Final inspection: **$15.00**. Total: **$118.00**.",
      },
      faqs: [
        {
          question: "How much is a residential electrical service upgrade in Charleston?",
          answer:
            "A service upgrade is a flat $20.00 on the residential column, plus the $15.00 final inspection fee that every electrical permit carries — $35.00 in all.",
          sourceId: CH_ELECTRICAL_SOURCE_KEY,
          attribution: "City of Charleston Electrical Permit application",
        },
        {
          question: "How is a commercial electrical permit priced in Charleston?",
          answer:
            "From the job cost, on the form's commercial column: $15.00 to $1,500, $25.00 to $2,500, $40.00 to $5,000, $50.00 to $10,000, and $60.00 plus $1.00 for each $1,000 over $10,000 — plus the $15.00 final inspection fee.",
          sourceId: CH_ELECTRICAL_SOURCE_KEY,
          attribution: "City of Charleston Electrical Permit application",
        },
        {
          question: "How much does a new electrical service cost in Charleston?",
          answer:
            "On a residence it is $30.00 up to 99 amps, $40.00 from 100 to 200 amps and $50.00 above 200 amps. Commercial services run $55.00 at 99 amps or less and rise in bands to $110.00 at 1,600 amps and above, with the $15.00 final inspection added.",
          sourceId: CH_ELECTRICAL_SOURCE_KEY,
          attribution: "City of Charleston Electrical Permit application",
        },
        {
          question: "What does an electrical opening cost in Charleston?",
          answer:
            "Each connection to a box or fixture is $5.00 on the residential column and $0.50 on the commercial column, on top of whatever scope rows the job uses.",
          sourceId: CH_ELECTRICAL_SOURCE_KEY,
          attribution: "City of Charleston Electrical Permit application",
        },
        {
          question: "Is there a final inspection fee on every Charleston electrical permit?",
          answer:
            "Yes. The form prints 'A FINAL INSPECTION FEE OF $15.00 SHALL BE ADDED TO ALL ELECTRICAL PERMITS', and it is charged here on every electrical calculation.",
          sourceId: CH_ELECTRICAL_SOURCE_KEY,
          attribution: "City of Charleston Electrical Permit application",
        },
        {
          question: "How much is a fire alarm system permit in Charleston?",
          answer:
            "On the commercial column a fire alarm system is $20.00 for up to three floors and $40.00 for four floors and above, with the $15.00 final inspection fee added.",
          sourceId: CH_ELECTRICAL_SOURCE_KEY,
          attribution: "City of Charleston Electrical Permit application",
        },
      ],
      seoTitle: "Charleston WV Electrical Permit Cost (Residential & Commercial Columns)",
      seoDescription:
        "Charleston WV electrical permit fees: residential rows from $20, commercial job-cost ladder from $15, openings $5 or $0.50, plus a $15 final inspection fee.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: CH_LAST_VERIFIED,
    },
    {
      jurisdictionKey: CH_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      slug: "plumbing-permit-cost",
      title: "Charleston, WV Plumbing Permit Cost",
      intro:
        "**Charleston publishes no plumbing fee table, so this site publishes no plumbing amount.** The City does issue plumbing permits — the Building Commission's permits page lists plumbing alongside electrical and HVAC and says their fees 'include a wide range of amounts for different services', directing applicants to the permit applications — but the Schedule of Permit Fees states in its closing note that it 'DOES NOT APPLY TO ELECTRICAL, HVAC AND PLUMBING PERMITS', and the plumbing application that would carry the amounts is not posted anywhere on the City's website. Rather than estimate a figure from a neighbouring trade's table, this page records the position exactly: the plumbing fee is assessed at the counter from the City's application, and it is asked for there.",
      localSummary:
        "Plumbing permits in Charleston are issued by the Building Commission at 915 Quarrier Street, which also inspects the work. Permit questions go to (304) 348-6833. Because the plumbing application is not published, the only reliable way to know a plumbing fee before filing is to call the Commission and ask for the current plumbing fee schedule.",
      notIncluded:
        "This page carries no fee figures by design. It is here so that the service is identifiable and the absence is stated rather than hidden.\n\nIt does not cover:\n\n- **The plumbing permit fee itself**, which lives on the City's plumbing application.\n- **Building, electrical and HVAC permits**, priced on their own pages.\n- **Sewer tap and utility connection charges** from Charleston's water and sewer systems.\n- **Zoning and land-disturbance approvals** tied to the project.",
      workedExample: null,
      faqs: [
        {
          question: "How much is a plumbing permit in Charleston, West Virginia?",
          answer:
            "The City does not publish the amount. The permits page says plumbing fees 'include a wide range of amounts for different services' and points to the permit applications, but the plumbing application is not posted, so the figure is quoted at the counter. This page states that rather than estimating one.",
          sourceId: "charleston-permits-page",
          attribution: "City of Charleston Building Commission — Permits",
        },
        {
          question: "Why is the plumbing page empty when the electrical page has amounts?",
          answer:
            "Because the electrical amounts are printed on a document the City publishes (the Electrical Permit application) and the plumbing amounts are not. The building schedule says it does not apply to plumbing, so there is no other table to read.",
          sourceId: CH_BUILDING_SOURCE_KEY,
          attribution: "City of Charleston Schedule of Permit Fees",
        },
        {
          question: "Does Charleston issue plumbing permits at all?",
          answer:
            "Yes. The Building Commission lists plumbing among the permits it issues beside electrical and HVAC, and it performs the inspections. Only the published fee is missing, not the permit.",
          sourceId: "charleston-permits-page",
          attribution: "City of Charleston Building Commission — Permits",
        },
        {
          question: "How do I find out what a plumbing permit will cost?",
          answer:
            "Call the Building Commission at (304) 348-6833 and ask for the current plumbing fee schedule, or submit the permit application and ask for the fee at intake. The Commission is at 915 Quarrier Street, Suite 5.",
          sourceId: "charleston-permits-page",
          attribution: "City of Charleston Building Commission — Permits",
        },
      ],
      seoTitle: "Charleston WV Plumbing Permit Fees (No Published Schedule)",
      seoDescription:
        "Charleston, West Virginia issues plumbing permits but publishes no plumbing fee table. This page records what the City does publish and how to get the figure.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: CH_LAST_VERIFIED,
    },
  ],

  verifications: [
    {
      entityType: "source",
      entityKey: CH_BUILDING_SOURCE_KEY,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: CH_LAST_VERIFIED,
      verifiedBy: null,
      sourceKey: CH_BUILDING_SOURCE_KEY,
      notes: "Schedule re-read and its printed checkpoints reconciled against the ladder's arithmetic.",
    },
    {
      entityType: "source",
      entityKey: CH_ELECTRICAL_SOURCE_KEY,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: CH_LAST_VERIFIED,
      verifiedBy: null,
      sourceKey: CH_ELECTRICAL_SOURCE_KEY,
      notes:
        "Amounts read cell by cell; the commercial $65.00/$75.00 band boundary remains the one ambiguous reading and is charged wide so no amperage is unpriced.",
    },
    {
      entityType: "fee_rule",
      entityKey: "CH-BLD-LADDER",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: CH_LAST_VERIFIED,
      verifiedBy: null,
      sourceKey: CH_BUILDING_SOURCE_KEY,
      notes: "$18.50 base at $2,500 plus $4.00 per $1,000 band reproduces the printed $130.50 at $30,000.",
    },
    {
      entityType: "fee_rule",
      entityKey: "CH-BLD-30K-UP",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: CH_LAST_VERIFIED,
      verifiedBy: null,
      sourceKey: CH_BUILDING_SOURCE_KEY,
      notes: "Reproduces every printed checkpoint above $30,000 ($60,000, $100,000, $500,000, $1,000,000).",
    },
    {
      entityType: "fee_rule",
      entityKey: "CH-ELEC-COMM-SVC-100",
      permitTypeKey: "electrical",
      status: "needs_review",
      method: "official_pdf_review",
      verifiedAt: CH_LAST_VERIFIED,
      verifiedBy: null,
      sourceKey: CH_ELECTRICAL_SOURCE_KEY,
      notes:
        "The amount ($65.00) is certain; the band's upper boundary (399 A here) is the one reading the scanned form leaves ambiguous. Charged wide so no amperage is unpriced.",
    },
    {
      entityType: "permit_page",
      entityKey: "building-permit-cost",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: CH_LAST_VERIFIED,
      verifiedBy: null,
      sourceKey: CH_BUILDING_SOURCE_KEY,
      notes: null,
    },
    {
      entityType: "permit_page",
      entityKey: "electrical-permit-cost",
      permitTypeKey: "electrical",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: CH_LAST_VERIFIED,
      verifiedBy: null,
      sourceKey: CH_ELECTRICAL_SOURCE_KEY,
      notes: null,
    },
    {
      entityType: "permit_page",
      entityKey: "plumbing-permit-cost",
      permitTypeKey: "plumbing",
      status: "verified",
      method: "manual_review",
      verifiedAt: CH_LAST_VERIFIED,
      verifiedBy: null,
      sourceKey: "charleston-permits-page",
      notes: "No-schedule page: verified that the City posts no plumbing fee table.",
    },
    {
      entityType: "jurisdiction_profile",
      entityKey: CH_KEYS.jurisdiction,
      status: "verified",
      method: "manual_review",
      verifiedAt: CH_LAST_VERIFIED,
      verifiedBy: null,
      sourceKey: "charleston-permits-page",
      notes: null,
    },
  ],
};
