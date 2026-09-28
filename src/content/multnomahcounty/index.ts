import type { JurisdictionSeed } from "@/content/seed-types";

import {
  MULTNOMAH_BUILDING_RULES,
  MULTNOMAH_BUILDING_SOURCE_KEY,
  MULTNOMAH_ELECTRICAL_RULES,
  MULTNOMAH_ELECTRICAL_SOURCE_KEY,
  MULTNOMAH_PLUMBING_RULES,
  MULTNOMAH_PLUMBING_SOURCE_KEY,
  OREGON_BUILDING_REVIEW_BPS,
  OREGON_FEE_EFFECTIVE_FROM,
  OREGON_STATE_SURCHARGE_BPS,
  OREGON_VALUATION_METHOD_NOTE,
  OREGON_VALUATION_SOURCE_KEY,
} from "@/content/portland/fee-rules";

/**
 * Unincorporated Multnomah County, Oregon — the county's schedule, published by the
 * City of Portland's permitting department.
 *
 * This is the second Oregon jurisdiction and the closest pair on this site: Portland
 * Permitting & Development issues permits for the City of Portland **and** for
 * unincorporated Multnomah County, and publishes a separate fee schedule for each. The
 * building permit fee table is identical in both documents, the electrical schedules are
 * identical in every amount, the plumbing schedules are identical — and the City charges
 * a Development Services Fee that the county does not, plus $334 more to demolish a
 * commercial building.
 *
 * The rules here are built by the same factories the city's payload calls, with the
 * county's document as their source, which is what makes "the same fee in two places" a
 * property the tests can check.
 *
 * Research record: research/oregon/multnomah-county.md.
 */

export const MULTNOMAH_LAST_VERIFIED = "2026-09-24";

export const MULTNOMAH_KEYS = {
  state: "or",
  county: "multnomah-county",
  jurisdiction: "multnomah-county",
  buildingSchedule: MULTNOMAH_BUILDING_SOURCE_KEY,
  electricalSchedule: MULTNOMAH_ELECTRICAL_SOURCE_KEY,
  plumbingSchedule: MULTNOMAH_PLUMBING_SOURCE_KEY,
} as const;

const RESEARCHER = "Permit Fee Intelligence research pass 10 (Oregon, second jurisdiction)";

const SURCHARGE_SOURCE_KEY = "oregon-bcd-surcharge-backgrounder";

const state = {
  code: "OR",
  slug: "oregon",
  name: "Oregon",
  fipsCode: "41",
};

const county = {
  key: MULTNOMAH_KEYS.county,
  slug: "multnomah-county",
  name: "Multnomah County",
  fipsCode: "41051",
};

export const multnomahCountySeed: JurisdictionSeed = {
  state,
  county,

  jurisdiction: {
    key: MULTNOMAH_KEYS.jurisdiction,
    stateKey: MULTNOMAH_KEYS.state,
    countyKey: MULTNOMAH_KEYS.county,
    type: "county",
    slug: "multnomah-county",
    name: "Multnomah County",
    officialName: "Multnomah County (unincorporated)",
    websiteUrl: "https://multco.us",
    permitPortalUrl: "https://www.portland.gov/ppd/permits",
    timezone: "America/Los_Angeles",
    isActive: true,
  },

  departments: [
    {
      key: "multnomah-ppd",
      jurisdictionKey: MULTNOMAH_KEYS.jurisdiction,
      kind: "building",
      name: "Portland Permitting & Development (PP&D)",
      phone: null,
      email: null,
      url: "https://www.portland.gov/ppd/permits",
      addressLine: "Development Services Center, 1900 SW 4th Ave, Portland, OR 97201",
      hours: null,
      notes:
        "The department that issues these permits and publishes this schedule, and it is the **City's**, not the county's. That is the fact this page exists to state: unincorporated Multnomah County's building permits come from the City of Portland's permitting department, on a schedule that department publishes under the county's name, and the county's own government is not the fee authority for them.",
    },
    {
      key: "multnomah-bcd",
      jurisdictionKey: MULTNOMAH_KEYS.jurisdiction,
      kind: "other",
      name: "Oregon Building Codes Division (BCD), Department of Consumer and Business Services",
      phone: null,
      email: null,
      url: "https://www.oregon.gov/bcd/pages/index.aspx",
      addressLine: null,
      hours: null,
      notes:
        "The state body behind two of the figures on this page: the 12% surcharge the schedule's totals carry (ORS 455.210(4)) and the permit valuation methodology the schedule is required to use (OAR 918-050-0100). It also sets the statewide trade permit minimums and the requirement that a municipality charge its plan review as a percentage of its permit fee.",
    },
  ],

  sources: [
    {
      key: MULTNOMAH_BUILDING_SOURCE_KEY,
      jurisdictionKey: MULTNOMAH_KEYS.jurisdiction,
      title:
        "Building and Other Permits Fee Schedule, Unincorporated Multnomah County, effective July 10, 2026",
      url: "https://www.portland.gov/ppd/documents/building-and-other-permits-fee-schedule-unincorporated-multnomah-county-effective-1/download",
      sourceType: "fee_schedule_pdf",
      issuingAuthority: "Portland Permitting & Development, for unincorporated Multnomah County",
      authorityKind: "county",
      isPrimary: true,
      documentDate: null,
      effectiveFrom: OREGON_FEE_EFFECTIVE_FROM,
      retrievedAt: MULTNOMAH_LAST_VERIFIED,
      lastVerifiedAt: MULTNOMAH_LAST_VERIFIED,
      notes:
        "Four pages, sha256 beginning 4211463f0eac9f3e, read 2026-09-24 in three pdftotext modes. Its **Building Permit Fee** table is identical to the City of Portland's, row for row and figure for figure, which was established by comparing the two documents' full text rather than by reading both. Its two proprietary rows are the demolition fees: $1,038.00 for a commercial demolition with or without a basement and $1,018.00 for a residential one, against the City's $1,372.00 and $1,352.00. It contains no Development Services Fee at all, which is the whole of the difference in ordinary work.",
    },
    {
      key: MULTNOMAH_ELECTRICAL_SOURCE_KEY,
      jurisdictionKey: MULTNOMAH_KEYS.jurisdiction,
      title: "Electrical Permit Fee Schedule, Unincorporated Multnomah County, effective July 10, 2026",
      url: "https://www.portland.gov/ppd/documents/electrical-permit-fee-schedule-unincorporated-multnomah-county-effective-july-10-2026/download",
      sourceType: "fee_schedule_pdf",
      issuingAuthority: "Portland Permitting & Development, for unincorporated Multnomah County",
      authorityKind: "county",
      isPrimary: true,
      documentDate: null,
      effectiveFrom: OREGON_FEE_EFFECTIVE_FROM,
      retrievedAt: MULTNOMAH_LAST_VERIFIED,
      lastVerifiedAt: MULTNOMAH_LAST_VERIFIED,
      notes:
        "Three pages, sha256 beginning ab23308d3994, read in three modes. Every dollar amount in it matches the City of Portland's electrical schedule — checked by extracting the amounts from both documents and comparing the two sorted multisets, which came out identical — and so do the plan review percentage and the rows that are not fee figures. The county's electrical permit therefore costs exactly what the city's does for the same work.",
    },
    {
      key: MULTNOMAH_PLUMBING_SOURCE_KEY,
      jurisdictionKey: MULTNOMAH_KEYS.jurisdiction,
      title: "Plumbing Permit Fee Schedule, Unincorporated Multnomah County, effective July 10, 2026",
      url: "https://www.portland.gov/ppd/documents/plumbing-permit-fee-schedule-unincorporated-multnomah-county-effective-july-10-2026/download",
      sourceType: "fee_schedule_pdf",
      issuingAuthority: "Portland Permitting & Development, for unincorporated Multnomah County",
      authorityKind: "county",
      isPrimary: true,
      documentDate: null,
      effectiveFrom: OREGON_FEE_EFFECTIVE_FROM,
      retrievedAt: MULTNOMAH_LAST_VERIFIED,
      lastVerifiedAt: MULTNOMAH_LAST_VERIFIED,
      notes:
        "Four pages, sha256 beginning a42ebd9f8969, read in three modes and identical in every amount to the City of Portland's plumbing schedule. A new one- or two-family dwelling is priced by the number of baths — $792.00, $1,187.00, $1,388.00 and $334.00 for each additional bath or kitchen — and everything else at $63.00 per fixture or item. Its plan review row prints \"25% of total mechanical permit fee\", the same slip in the City's document, read here as 25% of the plumbing permit fee.",
    },
    {
      key: OREGON_VALUATION_SOURCE_KEY,
      jurisdictionKey: null,
      title: "OAR 918-050-0100 — Statewide Fee Methodologies for Residential and Commercial Permits",
      url: "https://secure.sos.state.or.us/oard/view.action?ruleNumber=918-050-0100",
      sourceType: "state_agency",
      issuingAuthority: "Oregon Secretary of State, Administrative Rules (Building Codes Division, Chapter 918)",
      authorityKind: "state",
      isPrimary: false,
      documentDate: null,
      effectiveFrom: null,
      retrievedAt: MULTNOMAH_LAST_VERIFIED,
      lastVerifiedAt: MULTNOMAH_LAST_VERIFIED,
      notes:
        "Read 2026-09-24 from the Secretary of State's current-rules database, and the reason two rows of the county's schedule read the way they do: a structural permit fee for new construction is calculated from the ICC Building Valuation Data Table current as of April 1 multiplied by the square footage, a commercial one takes \"the greater of\" that figure or the applicant's stated value, a residential plumbing permit is \"based on the number of bathrooms, from one to three, on a graduated scale\" with no additional fee for the first 100 feet of water and sewer lines, and a plan review fee \"shall be based on a predetermined percentage of the permit fee set by the municipality\".",
    },
    {
      key: SURCHARGE_SOURCE_KEY,
      jurisdictionKey: null,
      title: "State of Oregon Permit Surcharge Fee — BCD backgrounder",
      url: "https://www.oregon.gov/bcd/jurisdictions/Documents/surcharge-backgrounder.pdf",
      sourceType: "state_agency",
      issuingAuthority: "Oregon Building Codes Division",
      authorityKind: "state",
      isPrimary: true,
      documentDate: null,
      effectiveFrom: null,
      retrievedAt: MULTNOMAH_LAST_VERIFIED,
      lastVerifiedAt: MULTNOMAH_LAST_VERIFIED,
      notes:
        "The same 12% the city's pages carry, because it is the state's and not either jurisdiction's: \"A state surcharge fee of 12% is applied to all building permit types issued in the State of Oregon\", applied as \"Total permit fee × 0.12\", and it implements the four surcharges of ORS 455.210(4) — 4% for state administrative costs, 2% for state inspection costs, up to 1% for administering the state building code and 4% for the electronic building codes information system. It covers building, mechanical, plumbing including fixtures, electrical including services and structural permits, so it is on all three permits this page prices.",
    },
  ],

  /** Empty on purpose: the permit types this jurisdiction uses already exist. */
  permitTypes: [],
  projectTypes: [],

  jurisdictionPermitTypes: [
    {
      jurisdictionKey: MULTNOMAH_KEYS.jurisdiction,
      permitTypeKey: "building",
      isAvailable: true,
      localName: "Building permit (Multnomah County)",
      officialUrl: null,
      notes:
        "Priced from the permit valuation by the same five-band table the City of Portland uses, with the same $167.00 minimum — and then, unlike the city, with no Development Services Fee. Plan review is 65% of the permit fee and the 12% state surcharge follows it. On a $250,000 commercial project the county's total is $3,508.63 against the city's $4,159.54.",
    },
    {
      jurisdictionKey: MULTNOMAH_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      isAvailable: true,
      localName: "Electrical permit",
      officialUrl: null,
      notes:
        "The county's electrical schedule is the city's, amount for amount: services and feeders from $212.00 to $1,077.00, the $408.00 residential square-foot package with $93.00 per additional 500 square feet, temporary services from $187.00, and branch circuits at $21.00 each with a service or $174.00 for the first without one. Plan review is 25% and the 12% state surcharge applies.",
    },
    {
      jurisdictionKey: MULTNOMAH_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      isAvailable: true,
      localName: "Plumbing permit",
      officialUrl: null,
      notes:
        "Identical to the city's plumbing schedule: a new one- or two-family dwelling is priced by baths from $792.00 to $1,388.00 plus $334.00 for each additional bath or kitchen, with 100 feet included for each utility connection, and every other permit is $63.00 per fixture or item. Plan review is 25%, and the 12% state surcharge applies.",
    },
    {
      jurisdictionKey: MULTNOMAH_KEYS.jurisdiction,
      permitTypeKey: "mechanical",
      isAvailable: true,
      localName: "Mechanical permit",
      officialUrl: null,
      notes:
        "Priced by the county's own mechanical schedule for the same effective date, which is not modelled in this release and for which no page is published — the same treatment the other states' mechanical schedules get, because the rows are priced per appliance and per unit of equipment. The state surcharge applies to mechanical permits, which the surcharge source states.",
    },
  ],

  feeSchedules: [
    {
      key: MULTNOMAH_BUILDING_SOURCE_KEY,
      jurisdictionKey: MULTNOMAH_KEYS.jurisdiction,
      sourceKey: MULTNOMAH_BUILDING_SOURCE_KEY,
      title: "Unincorporated Multnomah County Building and Other Permits Fee Schedule, effective July 10, 2026",
      officialUrl:
        "https://www.portland.gov/ppd/documents/building-and-other-permits-fee-schedule-unincorporated-multnomah-county-effective-1/download",
      effectiveFrom: OREGON_FEE_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: MULTNOMAH_LAST_VERIFIED,
      notes:
        "\"Effective Date: July 10, 2026\", printed on the title page. Four pages against the city document's eleven: the extra pages of the city's are the two Development Services Fee tables and the long miscellaneous list, and the county has neither. The building permit fee table, the plan review percentage and the valuation paragraph are the same text in both.",
    },
    {
      key: MULTNOMAH_ELECTRICAL_SOURCE_KEY,
      jurisdictionKey: MULTNOMAH_KEYS.jurisdiction,
      sourceKey: MULTNOMAH_ELECTRICAL_SOURCE_KEY,
      title: "Unincorporated Multnomah County Electrical Permit Fee Schedule, effective July 10, 2026",
      officialUrl:
        "https://www.portland.gov/ppd/documents/electrical-permit-fee-schedule-unincorporated-multnomah-county-effective-july-10-2026/download",
      effectiveFrom: OREGON_FEE_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: MULTNOMAH_LAST_VERIFIED,
      notes:
        "The same schedule as the city's in every amount. Recorded as its own source rather than pointed at the city's document, because it is a separate published document with its own title page and its own address, and because a rule should cite the page it was read from.",
    },
    {
      key: MULTNOMAH_PLUMBING_SOURCE_KEY,
      jurisdictionKey: MULTNOMAH_KEYS.jurisdiction,
      sourceKey: MULTNOMAH_PLUMBING_SOURCE_KEY,
      title: "Unincorporated Multnomah County Plumbing Permit Fee Schedule, effective July 10, 2026",
      officialUrl:
        "https://www.portland.gov/ppd/documents/plumbing-permit-fee-schedule-unincorporated-multnomah-county-effective-july-10-2026/download",
      effectiveFrom: OREGON_FEE_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: MULTNOMAH_LAST_VERIFIED,
      notes:
        "Identical in every amount to the City of Portland's plumbing schedule, including the $63.00 fixture list and the bath-based dwelling rows, and including the plan review row's reference to a mechanical fee.",
    },
  ],

  feeRules: [
    ...MULTNOMAH_BUILDING_RULES.map((rule) => ({
      jurisdictionKey: MULTNOMAH_KEYS.jurisdiction,
      permitTypeKey: "building",
      scheduleKey: MULTNOMAH_BUILDING_SOURCE_KEY,
      rule,
    })),
    ...MULTNOMAH_ELECTRICAL_RULES.map((rule) => ({
      jurisdictionKey: MULTNOMAH_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      scheduleKey: MULTNOMAH_ELECTRICAL_SOURCE_KEY,
      rule,
    })),
    ...MULTNOMAH_PLUMBING_RULES.map((rule) => ({
      jurisdictionKey: MULTNOMAH_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      scheduleKey: MULTNOMAH_PLUMBING_SOURCE_KEY,
      rule,
    })),
  ],

  requirements: [
    {
      jurisdictionKey: MULTNOMAH_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "document",
      title: "The city's permitting department issues the county's permits",
      description:
        "Portland Permitting & Development — a City bureau — publishes this schedule and issues these permits for unincorporated Multnomah County, and the same department issues the City of Portland's on a separate schedule. The practical consequence is that the two jurisdictions' building permits differ by exactly one table: the county has no Development Services Fee, and its demolition fees are lower by $334.00 commercial and $334.00 residential.",
      isMandatory: true,
      sortOrder: 10,
      sourceKey: MULTNOMAH_BUILDING_SOURCE_KEY,
      lastVerifiedAt: MULTNOMAH_LAST_VERIFIED,
    },
    {
      jurisdictionKey: MULTNOMAH_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "other",
      title: "The valuation is set by a state rule, not by the county",
      description: `${OREGON_VALUATION_METHOD_NOTE}\n\nFor an alteration or repair the schedule prints its own definition of the basis: the \"Fair Market Value... shall be the total value of all construction work for which the permit is issued, as well as all finish work, painting, roofing, electrical, plumbing, heating, air conditioning, elevators, fire extinguishing systems and other permanent work or equipment, and contractor's profit\".`,
      isMandatory: true,
      sortOrder: 20,
      sourceKey: OREGON_VALUATION_SOURCE_KEY,
      lastVerifiedAt: MULTNOMAH_LAST_VERIFIED,
    },
    {
      jurisdictionKey: MULTNOMAH_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "other",
      title: `Plan review is ${OREGON_BUILDING_REVIEW_BPS / 100}% of the permit fee`,
      description:
        'The schedule prints one line for it: "Plan Review 65% of the permit fee", and the fuller wording on the city\'s own page — "Plan Review/Process Fee — For the original submittal - 65% of the building permit fee, maximum of 2 allowable checksheets" — is the same percentage with its checksheet limit stated. The county charges no Development Services Fee, so a plan review here is 65% of a smaller number than in the city: on a $250,000 project the review is $1,288.48 either way, because the review reads the building permit fee and not the total.',
      isMandatory: true,
      sortOrder: 30,
      sourceKey: MULTNOMAH_BUILDING_SOURCE_KEY,
      lastVerifiedAt: MULTNOMAH_LAST_VERIFIED,
    },
    {
      jurisdictionKey: MULTNOMAH_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "other",
      title: `A ${OREGON_STATE_SURCHARGE_BPS / 100}% state surcharge is added to every permit`,
      description:
        'The Building Codes Division: "A state surcharge fee of 12% is applied to all building permit types issued in the State of Oregon", covering building, mechanical, plumbing (including fixtures), electrical (including services) and structural permits. It implements ORS 455.210(4) — 4% for state administrative costs, 2% for state inspection costs, up to 1% for administering the state building code and 4% for the electronic building codes information system — and it is the same in the county as in the city, because it is the state\'s. The pages charge it on the permit fee rather than on the finished total and state the other reading\'s size.',
      isMandatory: true,
      sortOrder: 40,
      sourceKey: SURCHARGE_SOURCE_KEY,
      lastVerifiedAt: MULTNOMAH_LAST_VERIFIED,
    },
    {
      jurisdictionKey: MULTNOMAH_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      requirementType: "other",
      title: "The county's electrical schedule is the city's, amount for amount",
      description:
        'The two documents were compared by extracting every dollar figure from each and diffing the sorted multisets: no difference. So a 200-ampere service is $212.00 in the county as in the city, the residential square-foot package is $408.00 for the first 1,000 square feet, a branch circuit is $21.00 on a permit that bought a service and $174.00 for the first one without, and plan review is 25% of the electrical permit fee in both. What differs between an address in the county and one in the city is the building permit, not the electrical one.',
      isMandatory: true,
      sortOrder: 10,
      sourceKey: MULTNOMAH_ELECTRICAL_SOURCE_KEY,
      lastVerifiedAt: MULTNOMAH_LAST_VERIFIED,
    },
    {
      jurisdictionKey: MULTNOMAH_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      requirementType: "other",
      title: "A new house is priced by its baths, with 100 feet included per connection",
      description:
        'The plumbing schedule\'s first table is "New 1 & 2 Family Dwellings Only - Includes 100 feet for each utility connection": $792.00 for one bath, $1,187.00 for two, $1,388.00 for three and $334.00 for each additional bath or kitchen. OAR 918-050-0100 is where both halves of that row come from — a residential plumbing permit fee "includes one kitchen and is based on the number of bathrooms, from one to three, on a graduated scale", and no additional fee is charged "for the first 100 feet of water and sewer lines, hose bibbs, icemakers, underfloor low-point drains, and rain drain packages". Everything that is not a new dwelling is $63.00 per fixture or item.',
      isMandatory: true,
      sortOrder: 10,
      sourceKey: MULTNOMAH_PLUMBING_SOURCE_KEY,
      lastVerifiedAt: MULTNOMAH_LAST_VERIFIED,
    },
  ],

  profile: {
    jurisdictionKey: MULTNOMAH_KEYS.jurisdiction,
    headline: "What construction permits cost in unincorporated Multnomah County",
    summary:
      "Unincorporated Multnomah County's permits are issued by the **City of Portland's** permitting department, on a schedule it publishes separately — and the two documents are nearly the same. The building permit fee table is identical in both, with the same $167.00 minimum; the electrical and plumbing schedules match amount for amount; the 12% state surcharge is the same. What the county does not have is the City's **Development Services Fee**, which is why a $250,000 commercial project is $3,508.63 here and $4,159.54 inside the city.",
    localContext:
      "This is the closest pair of jurisdictions on this site, and the reason is an accident of local government. **Portland Permitting & Development is a City bureau**, and it also issues building, electrical and plumbing permits for **unincorporated Multnomah County**, publishing a separate fee schedule under the county's name for each trade. The two schedules are the same documents with different title pages: the Building Permit Fee table is identical row for row — same $167.00 minimum, same $3.59 per additional $100 in the first band, same seams at $220.85, $540.78, $797.28 and $1,137.78 — and the electrical and plumbing schedules match in every dollar amount, which was established by extracting the amounts from both and comparing the sets rather than by reading them.\n\nThree things separate the county from the city. The first and by far the largest is the **Development Services Fee**: two tables, Commercial and Residential, charged on the same valuation as the building permit fee, present in the city's document and absent from the county's. On a $250,000 commercial project that is $650.91, and it is the whole of the difference between $4,159.54 in the city and $3,508.63 in the county. The second is demolition: the county charges $1,038.00 for a commercial demolition and $1,018.00 for a residential one, against the city's $1,372.00 and $1,352.00 — $334.00 lower on both rows. The third is the title page.\n\nEverything else about the fee is the state's rather than the municipality's. **OAR 918-050-0100** mandates the valuation method — the ICC Building Valuation Data Table current as of April 1 multiplied by square footage, with a commercial project paying on \"the greater of\" that figure or the applicant's stated value — and requires that a plumbing permit for a new house be priced by the number of baths rather than by the number of fixtures. **ORS 455.210(4)** imposes the 12% surcharge that sits on all three permits, in the county as in the city.\n\nThe practical reading is that moving a project across the county line changes the building permit and nothing else. A plumber or electrician working in unincorporated Multnomah County pays exactly what the same work costs inside Portland, and a builder pays $650.91 less on a $250,000 building permit — while a site inside the county still needs the building permit, because the county's own government does not issue it.",
    valuationBasis:
      "The county's schedule repeats the state's mandate rather than setting its own: the method \"is mandated by the State of Oregon in OAR 918-050-0100\", a structural permit fee for new construction and additions is calculated from the ICC Building Valuation Data Table current as of April 1, using the occupancy and construction type as determined by the building official, multiplied by the square footage — measured from outside exterior wall to outside exterior wall for each level — and \"the valuation used will be the greater of either the above calculated value or the value as stated by the applicant\".\n\nNeither document prints the ICC table itself, so the pages here compute from the valuation you enter. What they cannot tell you is which figure the building official would use for a given building, or how a carport, covered porch, patio or deck would be valued: the same rule calculates those separately at 50% of the value of a private garage.\n\nA commercial project therefore cannot lower its fee by submitting a low valuation — the \"greater of\" wording is a floor as well as a ceiling — while an alteration or a repair is priced on the fair market value of the permitted work as the schedule defines it, which includes the electrical, plumbing, heating, elevator, fire protection and contractor's-profit components of the job.",
    notIncluded:
      "These figures are what the unincorporated county's own 2026 fee schedules publish, computed by this site's engine. They are not a total project cost. In particular they exclude:\n\n- **Construction excise taxes**: Metro's construction excise tax and the City of Portland's Affordable Housing Construction Excise Tax are taxes on permit valuation imposed by other bodies, not permit fees, and their status on county land follows Metro's boundary rather than the city limits.\n- **The Fire and Life Safety Review Fee**, charged at 40% of the building permit fee by the Fire Marshal rather than by the permitting department.\n- **Every hourly charge**: additional plan review, inspections outside normal business hours, investigation fees where work began without a permit, and the county schedule's own inspection hourly rates.\n- **The deferred submittal fee**, at 10% of the building permit fee on the deferred portion, with a minimum of $570.00 for one- and two-family projects and $912.00 for commercial, and 50% of that where the submittal is exempt from plan review under ORS 455.628.\n- **The re-inspection fee** of $167.00 for each inspection beyond a band's allowance; the building table caps included inspections at three in its smallest band and seven in the band below the top.\n- **Exterior plumbing lines and site work**: rain, sanitary and storm drain rows and the water service row at $180.00 for the first 100 feet plus $137.00 for each additional 100 feet, and the schedule's note that sewer cap, erosion control and site review fees \"will be added separately\".\n- **The electrical rows not modelled**: solar above 25 kVA at $15.52 per kVA, wind generation from $587.00, borderline neon at $309.00 per elevation, wall washing at $1.23 per square foot, the $324.00 additional electrical checksheet, and appeal fees of $346.00 for one- and two-family dwellings and $721.00 for all other occupancies.\n- **Mechanical permits**, which the county prices on its own schedule and which this release does not model, and appliance and equipment permits generally.\n- **Anything the county's own government charges for the same project**: land use, road and right-of-way permits are the county's, and the parking, transportation and system development charges that accompany a project are not permit fees.\n- **The Development Services Fee — because there is none here.** This is the one line the city's pages carry and this one does not, and it is why the same valuation produces two totals on this site.\n- **The cost of the work itself, and any tax on it.**",
    seoTitle: "Multnomah County permit fees: building, electrical and plumbing",
    seoDescription:
      "Unincorporated Multnomah County permits, issued by Portland Permitting & Development — the same building table as the city without the Development Services Fee, plus 65% plan review and the 12% state surcharge.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: MULTNOMAH_LAST_VERIFIED,
  },

  permitPages: [
    {
      jurisdictionKey: MULTNOMAH_KEYS.jurisdiction,
      permitTypeKey: "building",
      slug: "building-permit-cost",
      title: "Multnomah County building permit cost",
      intro:
        "A building permit for unincorporated Multnomah County is issued by **Portland Permitting & Development** and priced on the permit valuation by a five-band table starting at a **$167.00 minimum** and reaching $1,137.78 plus $5.63 per $1,000 above $100,000. Plan review adds 65% of the permit fee and Oregon's 12% state surcharge follows. A $250,000 commercial project comes to **$3,508.63** — the same project inside the City of Portland is $4,159.54, and the entire $650.91 difference is a City fee the county does not charge.",
      localSummary:
        "The building permit fee table is the City of Portland's, because the same department publishes both schedules and the table is identical in the two documents. Five bands on the permit valuation, and every seam closes: $167.00 is the minimum and also the figure for the first $500, $220.85 at $2,000 is exactly what the band above opens with, and so are $540.78 at $25,000, $797.28 at $50,000 and $1,137.78 at $100,000. The first band counts in **hundreds** — $3.59 for each additional $100, which is $35.90 per $1,000 — and that is what makes it land exactly on the second band's opening figure.\n\nWhat the county does not have is the City's **Development Services Fee**, a second table charged on the same valuation under both a Commercial and a Residential version, \"applies to all Building Permits, Site Development Permits (except where work involves only clearing) and Zoning Permits\". It is not in the county's document at all, which is why the same valuation produces a smaller total here: $650.91 smaller on a $250,000 commercial project.\n\n**Plan review is 65%** of the permit fee, printed as one line — \"Plan Review 65% of the permit fee\" — and it reads the permit fee rather than the total, so it is the same $1,288.48 on a $250,000 project here as in the city even though the county charges less overall. A trade plan review is a different percentage in the same jurisdiction: 25% of the electrical or plumbing permit fee.\n\nThen the **12% state surcharge**, which is not the county's decision and not the city's either: ORS 455.210(4) imposes four surcharges totalling 12% on the total permit fees — 4% for state administrative costs, 2% for state inspection costs, up to 1% for administering the state building code, and 4% for the electronic building codes information system — and the Building Codes Division states that it \"is applied to all building permit types issued in the State of Oregon\". On a $250,000 project it is $237.87, charged here on the permit fee the table produces; read on the finished total instead it would be $392.49, which is $154.62 more, and the page states both.\n\nThe two rows where the county's document differs from the city's are the **demolition fees**, and they are worth knowing because they are the only figures in four pages that are not the city's: $1,038.00 to demolish a commercial building with or without a basement and $1,018.00 for a residential one, against $1,372.00 and $1,352.00 inside the city. Everything else — the valuation method mandated by OAR 918-050-0100, the \"greater of\" tie-break for commercial work, the $167.00 re-inspection, the deferred submittal percentage and the plan review line — is the same text.",
      notIncluded:
        "This estimate is the Building Permit Fee table, plan review at 65% of the permit fee and the 12% state surcharge. It excludes:\n\n- **The Development Services Fee**, deliberately: unincorporated Multnomah County has none, and the city's pages of this site price it for sites inside the city limits.\n- **Construction excise taxes**: Metro's and the City's Affordable Housing Construction Excise Tax, which are taxes on permit valuation rather than permit fees.\n- **The Fire and Life Safety Review Fee** at 40% of the building permit fee, which is charged by the Fire Marshal.\n- **Every hourly charge**: additional plan review, inspections outside normal business hours, investigation where work began without a permit, and the miscellaneous hourly rates on the schedule's later pages.\n- **Program fees**: the master, facility and field-issuance programme registrations, and the re-roof permit packets, which the city's schedule lists in detail and the county's four pages carry as its own shorter list.\n- **The deferred submittal fee** at 10% of the building permit fee on the deferred portion, with a $570.00 minimum for one- and two-family projects and $912.00 for commercial, halved for submittals exempt under ORS 455.628.\n- **The $167.00 re-inspection** for each inspection beyond a band's allowance, and the demolition rows the county publishes at $1,038.00 and $1,018.00, which this release states rather than models.\n- **Electrical, plumbing and mechanical permits** on the same project, which are separate permits: this site prices the first two on their own pages, and they cost exactly what they cost inside the city.\n- **What the county's own government charges** — land use, road and right-of-way permits, and any system development charge — which are not fees of this schedule.\n- **The cost of the work itself, and any tax on it.**",
      workedExample: {
        scenario:
          "A commercial tenant improvement on unincorporated Multnomah County land with a construction valuation of $250,000, permitted with plans.",
        inputs: {
          valuationCents: 25_000_000,
          custom: { building_class: "commercial" },
        },
        notes:
          "The valuation falls in the top band: $1,137.78 for the first $100,000 plus $5.63 for each additional $1,000 or fraction thereof, and 150 further thousands is $844.50, so the permit fee is $1,982.28. Plan review is 65% of that, $1,288.48. The state surcharge is 12% of the permit fee, $237.87. Total: $3,508.63.\n\nThe identical project inside the City of Portland is $4,159.54, because the city charges a **Development Services Fee** on the same valuation — $650.91 under its Commercial table — and the county charges none. Nothing else differs: the building permit fee, the plan review percentage and the surcharge are the same three figures on both pages, which is the point of publishing the two together.\n\nThe surcharge is computed on the permit fee and not on the finished total, for the reason the city's page gives: the plan review fee is itself a percentage of the permit fee, so a percentage of the two together would be a percentage of a percentage. On the total it would be $392.49 rather than $237.87. And the demolition fees, the one place the two documents genuinely part company on an amount, are $1,038.00 here against the city's $1,372.00.",
      },
      faqs: [
        {
          question: "Who issues a building permit in unincorporated Multnomah County?",
          answer:
            "Portland Permitting & Development — the City of Portland's permitting department. It publishes a separate fee schedule under the county's name for building, electrical and plumbing permits in unincorporated Multnomah County, and that schedule is the same building permit fee table as the City's, with the same $167.00 minimum and the same bands up to $1,137.78 plus $5.63 per $1,000.",
        },
        {
          question: "Why is a Multnomah County permit cheaper than a Portland one?",
          answer:
            "Because the City charges a second table on the same valuation that the county's schedule does not contain: the Development Services Fee, in Commercial and Residential versions, charged \"on all Building Permits, Site Development Permits (except where work involves only clearing) and Zoning Permits\". On a $250,000 commercial project it is $650.91, which is exactly the difference between the county's $3,508.63 and the city's $4,159.54.",
        },
        {
          question: "How much is a building permit on a $250,000 commercial project?",
          answer:
            "$3,508.63. The permit fee is $1,982.28 — $1,137.78 for the first $100,000 plus $5.63 for each additional $1,000 — plan review is 65% of that, $1,288.48, and the state surcharge is 12% of the permit fee, $237.87. The same project inside the city limits is $4,159.54 because of the city's Development Services Fee.",
        },
        {
          question: "What are the demolition fees?",
          answer:
            "$1,038.00 for a commercial demolition with or without a basement and $1,018.00 for a residential one, for plan review, processing and inspections. The city's schedule charges $1,372.00 and $1,352.00 for the same two rows, so this is one of the few amounts in the county's four pages that is not identical to the city's. Sewer cap, erosion control and site review fees are added separately.",
        },
        {
          question: "Is plan review included?",
          answer:
            "No: it is 65% of the permit fee — \"Plan Review 65% of the permit fee\" — which on a $250,000 project is $1,288.48. The county has no additional fee table, so the review here is 65% of the same permit fee the city charges, and it comes to the same figure on both pages.",
        },
        {
          question: "Does the 12% state surcharge apply in the county?",
          answer:
            "Yes, and it is identical to the city's because it is the state's: \"A state surcharge fee of 12% is applied to all building permit types issued in the State of Oregon\", raised by ORS 455.210(4) as four surcharges — 4% for state administrative costs, 2% for state inspection costs, up to 1% for administering the state building code and 4% for the electronic building codes information system. On a $250,000 project it is $237.87.",
        },
      ],
      seoTitle: "Multnomah County building permit cost: the table",
      seoDescription:
        "Unincorporated Multnomah County building permit fees — the same valuation table as Portland, no Development Services Fee, 65% plan review and the 12% state surcharge, with a $250,000 example.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: MULTNOMAH_LAST_VERIFIED,
    },
    {
      jurisdictionKey: MULTNOMAH_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      slug: "electrical-permit-cost",
      title: "Multnomah County electrical permit cost",
      intro:
        "The county's electrical schedule is the City of Portland's, amount for amount: a residential square-foot wiring package at **$408.00** for 1,000 square feet with $93.00 for each additional 500, services and feeders from **$212.00** to **$1,077.00**, temporary services from $187.00, and branch circuits at $21.00 each with a service on the permit or $174.00 for the first without one. Plan review is 25% of the permit fee and the 12% state surcharge follows — the same three figures as inside the city.",
      localSummary:
        "Every dollar figure in the county's electrical schedule appears in the city's as well, which was checked by extracting the amounts from both documents and comparing the two sets: they are identical. That makes this page short by this site's standards, because there is no local quirk to explain — only the rows a reader needs.\n\nA **residential square-foot wiring package** is \"1,000 square feet or less — $408.00; Each additional 500 square feet or portion thereof — $93.00\", per dwelling unit, with the garage and the service included. \"Portion thereof\" matters: 1,501 square feet is three chargeable 500-square-foot portions, and the row is modelled as $0.186 a square foot above the published first 1,000 square feet, rounded up in 500-square-foot steps, with the $408.00 as the base charge. A 1,700-square-foot unit is $408.00 plus two $93.00 steps, $594.00. For a building of three or more apartments, OAR 918-309-0030(5)(b) applies: the fee is computed on the largest apartment and each additional apartment pays half of the first unit's fee.\n\n**Services and feeders** run $212.00 at 200 amperes, $298.00 at 201 to 400, $391.00 at 401 to 600, $588.00 at 601 to 1,000 and $1,077.00 above, with reconnect-only at $190.00; **temporary** services are $187.00, $283.00 and $356.00 over the same bands. **Renewable energy** is $212.00 to $391.00 up to 25 kVA, and above 25 kVA the schedule changes method to $15.52 per kVA for solar and flat bands of $587.00 and $1,077.00 for wind.\n\nThe **branch-circuit row** is the one that decides most small permits: \"with the purchase of service or feeder fee — $21.00\", and \"without the purchase of service or feeder fee: First branch circuit — $174.00; Each additional branch circuit — $21.00\". Six circuits are $126.00 on a permit that also paid for a service and $279.00 on one that did not.\n\n**Plan review is 25%** of the electrical permit fee, capped at two allowable checksheets with $324.00 for each additional one — a different percentage from the 65% the building permit pays, in the same department. Then the **12% state surcharge**, on electrical permits \"including services\", which is the state's and identical on both sides of the city boundary.",
      notIncluded:
        "This estimate is the electrical schedule's item fee, plan review at 25% of that fee and the 12% state surcharge. It excludes:\n\n- **The $324.00 additional checksheet**, and additional plan review at $114.00 for half an hour or less and $228.00 an hour beyond.\n- **Solar generation above 25 kVA** at $15.52 per kVA, wind generation from $587.00, and any temporary service above the bands modelled.\n- **The per-unit rows not modelled**: borderline neon at $309.00 per elevation, wall washing at $1.23 per square foot, pumps and irrigation circles at $161.00, manufactured and modular dwelling services at $239.00, and limited energy installations at $93.00.\n- **Appeal fees** of $346.00 for one- and two-family dwellings and $721.00 for all other occupancies, plus $176.00 for each item over two.\n- **Inspections outside normal business hours** at $308.00 an hour, **investigation fees** at $161.00 an hour with a one-hour minimum, and other inspections at $228.00 an hour.\n- **Programme fees**: the Field Issuance Remodel Program's $640.00 registration and $423.00 hourly rate, and the master permit programme's registration and hourly rates.\n- **The building, plumbing and mechanical permits on the same project**, which are separate permits with their own schedules — the building permit's plan review, for instance, is 65% of a much larger fee.\n- **The electrical work itself**: the schedule prices the permit, not the installation, and utility connection charges are not permit fees.",
      workedExample: {
        scenario:
          "A 1,700-square-foot house on unincorporated Multnomah County land rewired under the residential square-foot package, service included.",
        inputs: {
          squareFootage: 1_700,
          custom: { electrical_item: "residential_package" },
        },
        notes:
          "\"Residential Square Foot Wiring Packages for New and Remodels: Single or multi-family, per dwelling unit. Include garage. Service included.\" The first 1,000 square feet are $408.00 and the remaining 700 are two chargeable 500-square-foot portions at $93.00 — $594.00 for the permit fee. Plan review is 25% of that, $148.50, and the state surcharge is 12% of the same $594.00, $71.28. Total: $813.78.\n\nThe arithmetic is worth checking at the boundary, because \"or portion thereof\" is what makes this row different from a rate. At 1,000 square feet the fee is $408.00 and at 1,001 it is $501.00, not $408.19 — one square foot past the allowance buys a whole 500-square-foot portion. At 2,001 square feet it is $687.00, and the third portion is the last one the row needs until 2,500.\n\nThe county's electrical permit costs exactly what the city's does for this job: every amount in the two schedules matches, as does the 25% plan review and the 12% surcharge. The Development Services Fee that separates the two jurisdictions on a building permit does not apply to electrical work, because it is charged on building, site development and zoning permits.",
      },
      faqs: [
        {
          question: "Is a Multnomah County electrical permit cheaper than a Portland one?",
          answer:
            "No — it costs exactly the same, because the two schedules are identical in every amount. A 200-ampere service is $212.00 in both, a residential square-foot package is $408.00 for 1,000 square feet plus $93.00 per additional 500 in both, and plan review is 25% of the electrical permit fee in both. The fee that separates the two jurisdictions, the Development Services Fee, is charged on building permits rather than on electrical ones.",
        },
        {
          question: "How much is an electrical permit for a 1,700-square-foot house?",
          answer:
            "$813.78 under the residential square-foot wiring package: $408.00 for the first 1,000 square feet plus two $93.00 portions, which is $594.00, then 25% plan review of $148.50 and the 12% state surcharge of $71.28. The package price includes the service and the garage, and it is charged per dwelling unit.",
        },
        {
          question: "Why does 1,001 square feet cost more than 1,000?",
          answer:
            "Because the row says \"each additional 500 square feet or portion thereof\" — one square foot past the 1,000 allowance buys a whole 500-square-foot portion, so the fee steps from $408.00 to $501.00 rather than rising smoothly. The same rounding puts the fee at $594.00 for 1,501 to 2,000 square feet and $687.00 at 2,001.",
        },
        {
          question: "What does a branch circuit cost?",
          answer:
            "$21.00 if the permit also bought a service or feeder fee, and $174.00 for the first circuit if it did not — then $21.00 for each additional one. So six circuits are $126.00 on a service permit and $279.00 on a circuits-only permit, which is the schedule's own pricing rather than a penalty for filing separately.",
        },
        {
          question: "How much is a solar permit?",
          answer:
            "$212.00 up to 5 kVA, $298.00 at 5.01 to 15 kVA and $391.00 at 15.01 to 25 kVA. Above 25 kVA the schedule changes method and charges $15.52 for each kVA over 25.01 up to 100, with no additional fee at 100.01 and above, and plan review is required. Wind systems over 25 kVA are priced at $587.00 and $1,077.00.",
        },
        {
          question: "Does the county's electrical permit carry the 12% state surcharge?",
          answer:
            "Yes: 12% of the electrical permit fee, because the Building Codes Division applies it to \"all building permit types issued in the State of Oregon\" and lists electrical permits including services. On a $594.00 package that is $71.28. It is the same amount the city charges for the same work, since the surcharge is the state's rather than either jurisdiction's.",
        },
      ],
      seoTitle: "Multnomah County electrical permit cost: Portland's schedule",
      seoDescription:
        "Unincorporated Multnomah County electrical permit fees — the identical schedule to Portland's: $408 for the first 1,000 square feet of a residential package, $212 for a 200-amp service, 25% plan review and 12% state surcharge.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: MULTNOMAH_LAST_VERIFIED,
    },
    {
      jurisdictionKey: MULTNOMAH_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      slug: "plumbing-permit-cost",
      title: "Multnomah County plumbing permit cost",
      intro:
        "A plumbing permit for unincorporated Multnomah County is priced by **$63.00 per fixture or item** — a water heater, a water closet, a tub, a hose bibb, a dishwasher, a garbage disposal, a backflow preventer — and a **new one- or two-family house is priced by its baths instead**: $792.00 for one, $1,187.00 for two, $1,388.00 for three and $334.00 for each additional bath or kitchen, with 100 feet included for every utility connection. Plan review is 25% and the state adds 12%.",
      localSummary:
        "The county's plumbing schedule is the city's, amount for amount, so the same two routes apply on both sides of the line. A **new** one- or two-family dwelling is priced by how many baths it has: $792.00, $1,187.00, $1,388.00 and $334.00 for each bath or kitchen after the third, and the heading says what the row includes — \"Includes 100 feet for each utility connection\". Everything else is **$63.00 per fixture or item**, across more than thirty named rows that run from a water heater to an ice maker, a dishwasher, a floor drain, a hose bibb and a grease interceptor.\n\nWhich route applies is the first question rather than a detail, because the two are alternatives: a new house charged by its baths and then again per fixture would be billed twice for one permit. The $63.00 rows therefore apply only where the dwelling rows do not, which in practice means an alteration, an addition, a replacement, or plumbing in a commercial or multi-family building.\n\nBoth halves of the dwelling row come from the **state's rule**, OAR 918-050-0100: a residential plumbing permit fee \"includes one kitchen and is based on the number of bathrooms, from one to three, on a graduated scale\", with an additional set fee for each bath or kitchen beyond, and \"no additional fee shall be charged for the first 100 feet of water and sewer lines, hose bibbs, icemakers, underfloor low-point drains, and rain drain packages\". The same rule is why exterior lines past the first 100 feet are priced separately — $180.00 for the first 100 feet and $137.00 for each additional 100 — and why storm water retention or detention facilities, irrigation systems, fire suppression systems and any private storm drainage beyond the first 100 feet are outside the plumbing permit.\n\nTwo rows are worth knowing for a remodel. **Replacing in-building water supply lines** in a residence is $128.00 for the first floor and $52.00 for each additional floor, and the commercial route beside it is priced per branch — $128.00 for the first five branches, $31.00 for each fixture branch over five. And a separate, more expensive sewer cap row at $159.00 sits two pages after the $63.00 \"Fixture/Sewer cap\" row.\n\n**Plan review is 25%** of the plumbing permit fee, and the row in the schedule prints \"25% of total mechanical permit fee\" — a copy-and-paste slip in the department's own document, since the heading above it is \"Plan Review Fee\" and the paragraph above that scopes the charge to plumbing and medical gas systems under OAR 918-780-0040. It is modelled as 25% of the plumbing permit fee here, as on the city's page, and recorded as a reading. Then the **12% state surcharge**, which applies to plumbing permits \"including fixtures\" and is the same in the county as in the city.",
      notIncluded:
        "This estimate is the plumbing schedule's dwelling or fixture fee, plan review at 25% of that fee and the 12% state surcharge. It excludes:\n\n- **Exterior and site line work**: rain drain, sanitary sewer, storm sewer and water service at $180.00 for the first 100 feet plus $137.00 per additional 100 feet, interior mainline water and drainage piping on the same terms, catch basins and area drains at $63.00, manufactured home utilities at $144.00, and the storm water retention or detention facility row at $162.00.\n- **The commercial route for replacing in-building water supply lines**, priced per branch rather than per floor: $128.00 for the first five branches and $31.00 for each fixture branch over five.\n- **Fixtures the schedule prices but this release does not model**: solar potable water units at $139.00, the $159.00 sewer cap, and commercial roof drains at $63.00.\n- **Irrigation, fire suppression and storm water facilities**, which the state's rule excludes from the plumbing permit altogether and which are permitted or billed separately.\n- **Every hourly charge** the schedule's later pages carry, including additional plan review.\n- **The building, electrical and mechanical permits** on the same project: the building permit carries the 65% plan review and the 12% surcharge, and this site prices the building and electrical permits on their own pages.\n- **Sewer, stormwater and water charges**, which are utility accounts rather than permit fees, and any system development charge.\n- **The $63.00 per-fixture rate applied to a new house.** Where the dwelling rows apply, the fixtures are inside them, and a permit is never charged both ways.\n- **The cost of the fixtures and their installation**, which is the work rather than the permit.",
      workedExample: {
        scenario:
          "A bathroom and kitchen remodel in unincorporated Multnomah County replacing four fixtures — a water closet, a basin, a tub and a water heater — filed as one plumbing permit.",
        inputs: {
          fixtures: 4,
        },
        notes:
          "The work is an alteration rather than a new dwelling, so the dwelling rows do not apply and every item is $63.00: four fixtures are $252.00. Plan review is 25% of that, $63.00, and the state surcharge is 12%, $30.24. Total: $345.24.\n\nThe comparison worth making is with a new house on the same schedule. A new two-bath single family residence is $1,187.00 for the whole plumbing permit — $1,626.19 with review and surcharge — and the same $63.00 rate would price its fixtures at a fraction of that. The two rows are alternatives rather than a sequence: the dwelling row says \"New 1 & 2 Family Dwellings Only\" and includes 100 feet for each utility connection, so a house is never charged both ways. It is also why the answer to \"how much is a plumbing permit\" depends on what is being built and not only on how much of it there is.\n\nThe county's plumbing permit costs exactly what the city's does for this job: $345.24 either side of the line. Only the building permit differs between the two jurisdictions, and it differs by the Development Services Fee the city charges and the county does not.",
      },
      faqs: [
        {
          question: "How much is a plumbing permit in unincorporated Multnomah County?",
          answer:
            "$63.00 per fixture or item for most work — a four-fixture remodel is $252.00 before review and surcharge — and for a new one- or two-family dwelling it is priced by baths instead: $792.00 for one, $1,187.00 for two, $1,388.00 for three and $334.00 for each additional bath or kitchen, with 100 feet included per utility connection. Plan review is 25% of the permit fee and the state surcharge is 12%.",
        },
        {
          question: "Is the county's plumbing permit the same as Portland's?",
          answer:
            "Yes, in every amount — the two schedules are identical, including the $63.00 fixture list, the bath-based dwelling rows and the 25% plan review. What differs between an address in the county and one in the city is the building permit, which is where the city's Development Services Fee applies, and the demolition fees. Plumbing work costs the same either way.",
        },
        {
          question: "How much is a water heater permit?",
          answer:
            "$63.00 if it is the only item on the permit, with $15.75 of plan review and $7.56 of state surcharge — $86.31 in all. A water heater is one row on the fixture or item list. It is not covered by the dwelling rows, which apply to a new one- or two-family dwelling rather than to a replacement.",
        },
        {
          question: "Why is a new house priced by baths rather than fixtures?",
          answer:
            "Because OAR 918-050-0100 requires it: a residential plumbing permit fee \"includes one kitchen and is based on the number of bathrooms, from one to three, on a graduated scale\", with an additional set fee for each additional bath or kitchen, and no additional fee for the first 100 feet of water and sewer lines, hose bibbs, icemakers, underfloor low-point drains and rain drain packages. The schedule's rows are that scale, and the \"Includes 100 feet for each utility connection\" in the heading is the same rule.",
        },
        {
          question: "Does the plumbing permit include the line to the street?",
          answer:
            "The first 100 feet are included through the dwelling row, as the state's rule requires. Past that the schedule prices exterior lines separately: rain drain, sanitary sewer, storm sewer and water service are each $180.00 for the first 100 feet and $137.00 for each additional 100 feet, in addition to the fixture fees. Storm water retention and detention facilities, irrigation and fire suppression are outside the plumbing permit entirely.",
        },
        {
          question: "What is the plan review fee for plumbing?",
          answer:
            "25% of the plumbing permit fee, capped at two allowable checksheets. The schedule's own row says \"25% of total mechanical permit fee\", which is a slip in the document — the heading above it is \"Plan Review Fee\" and the paragraph above that scopes it to plumbing and medical gas systems under OAR 918-780-0040. A building plan review in the same jurisdiction is 65% of the building permit fee.",
        },
      ],
      seoTitle: "Multnomah County plumbing permit cost: $63 per fixture",
      seoDescription:
        "Unincorporated Multnomah County plumbing permit fees — $63 per fixture or item, $792 to $1,388 by bath for a new house with 100 feet included, 25% plan review and the 12% state surcharge.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: MULTNOMAH_LAST_VERIFIED,
    },
  ],

  verifications: [
    {
      entityType: "source",
      entityKey: MULTNOMAH_BUILDING_SOURCE_KEY,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: MULTNOMAH_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: MULTNOMAH_BUILDING_SOURCE_KEY,
      notes:
        "Read 2026-09-24 in three pdftotext modes and compared with the City of Portland's schedule of the same effective date: the Building Permit Fee table is identical, and the only amounts that differ anywhere in the two documents are the demolition rows — $1,038.00 and $1,018.00 here against $1,372.00 and $1,352.00 in the city's document. The comparison was made by extracting every dollar amount from both files and diffing the sorted multisets, so a difference anywhere in four pages could not have been missed.",
    },
    {
      entityType: "source",
      entityKey: MULTNOMAH_ELECTRICAL_SOURCE_KEY,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: MULTNOMAH_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: MULTNOMAH_ELECTRICAL_SOURCE_KEY,
      notes:
        "Read in three modes and compared with the city's electrical schedule on the same multisets-of-amounts basis: identical, with no row present in one document and absent from the other. Every figure on this page's electrical page is a row of it.",
    },
    {
      entityType: "source",
      entityKey: MULTNOMAH_PLUMBING_SOURCE_KEY,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: MULTNOMAH_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: MULTNOMAH_PLUMBING_SOURCE_KEY,
      notes:
        "Read in three modes, and identical in every amount to the city's plumbing schedule. The plan review row's \"25% of total mechanical permit fee\" wording is present in this document too, so the slip is in the department's template rather than in one file; it is read as 25% of the plumbing permit fee on both jurisdictions' pages and recorded in research/oregon/multnomah-county.md.",
    },
    {
      entityType: "source",
      entityKey: OREGON_VALUATION_SOURCE_KEY,
      status: "verified",
      method: "official_portal_check",
      verifiedAt: MULTNOMAH_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: OREGON_VALUATION_SOURCE_KEY,
      notes:
        "The rule read from the Secretary of State's current-rules database on 2026-09-24. It is the source for the valuation method both Oregon jurisdictions are required to use, for the \"greater of\" tie-break on commercial work, and for the bath-based residential plumbing method with the first 100 feet of water and sewer line included.",
    },
    {
      entityType: "source",
      entityKey: SURCHARGE_SOURCE_KEY,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: MULTNOMAH_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: SURCHARGE_SOURCE_KEY,
      notes:
        "The Building Codes Division's backgrounder. The same instrument the city's pages cite, because the 12% is imposed by ORS 455.210(4) on the whole state; the pages charge it on the permit fee rather than on the finished total and state the other reading's size at the example valuation.",
    },
    {
      entityType: "fee_rule",
      entityKey: "BUILD-FEE-1",
      permitTypeKey: "building",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: MULTNOMAH_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: MULTNOMAH_BUILDING_SOURCE_KEY,
      notes:
        "The county's own copy of the smallest band and the $167.00 minimum. It is built by the same function the city's rule is built from, so the tests can assert that the two jurisdictions' building permit fee configs are identical rather than merely stating that the documents agree. The seam values $167.00, $220.85, $540.78, $797.28 and $1,137.78 are asserted at the county's own rules.",
    },
    {
      entityType: "fee_rule",
      entityKey: "PLUMB-FIXTURE-EACH",
      permitTypeKey: "plumbing",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: MULTNOMAH_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: MULTNOMAH_PLUMBING_SOURCE_KEY,
      notes:
        "$63.00 for every named fixture or item, from a water heater to a grease interceptor, on the county's own copy of the schedule. The rule is gated on the dwelling scope being absent so that a new house priced by its baths is not charged again per fixture — the guard the pair needs, and one the tests assert in both directions.",
    },
    {
      entityType: "jurisdiction_profile",
      entityKey: MULTNOMAH_KEYS.jurisdiction,
      status: "verified",
      method: "manual_review",
      verifiedAt: MULTNOMAH_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: MULTNOMAH_BUILDING_SOURCE_KEY,
      notes:
        "Every claim is traceable to a document: that the county's permits are issued by the City's permitting department to the schedules' own title pages and to the PPD permits page, which names Portland, Maywood Park and unincorporated Multnomah County; the identical building table and the demolition differences to the two documents' full texts; the 65% and 25% reviews to the plan review rows and to OAR 918-050-0100 for the requirement that a percentage exist; and the 12% to the Building Codes Division.",
    },
    {
      entityType: "permit_page",
      entityKey: "building-permit-cost",
      permitTypeKey: "building",
      status: "verified",
      method: "manual_review",
      verifiedAt: MULTNOMAH_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: MULTNOMAH_BUILDING_SOURCE_KEY,
      notes:
        "The worked example was computed by the engine before the prose was written: $1,982.28 of permit fee, $1,288.48 of plan review and $237.87 of state surcharge, $3,508.63 in all. The test recomputes it from the stored rules, asserts that the same input under the city's rules produces $4,159.54, and asserts that the difference is exactly the city's Development Services Fee — the claim the page is built on.",
    },
    {
      entityType: "permit_page",
      entityKey: "electrical-permit-cost",
      permitTypeKey: "electrical",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: MULTNOMAH_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: MULTNOMAH_ELECTRICAL_SOURCE_KEY,
      notes:
        "Every figure is a row of the county's electrical schedule, and the page's central claim — that it costs the same as the city's — is checked by the tests, which run the same inputs through both jurisdictions' rules and assert equal totals. The worked example (a 1,700-square-foot residential package, $813.78) is asserted at its boundary values as well: $408.00 at 1,000 square feet, $501.00 at 1,001 and $687.00 at 2,001.",
    },
    {
      entityType: "permit_page",
      entityKey: "plumbing-permit-cost",
      permitTypeKey: "plumbing",
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: MULTNOMAH_LAST_VERIFIED,
      verifiedBy: RESEARCHER,
      sourceKey: MULTNOMAH_PLUMBING_SOURCE_KEY,
      notes:
        "The page's two routes and the guard between them are asserted in the tests, in both directions: four fixtures pay $252.00 and no dwelling line, a new two-bath house pays $1,187.00 and no fixture line. The one reading on the page — that the plan review row's \"mechanical\" is a slip — is stated as a reading on the page itself and in the research file.",
    },
  ],
};

/**
 * The pages this jurisdiction publishes: three, derived from the payload rather than
 * written out again.
 */
export const MULTNOMAH_PUBLISHED_PERMIT_PAGES = multnomahCountySeed.permitPages.filter(
  (page) => page.publishStatus === "published" && !page.noindex,
);
