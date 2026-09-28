import type { JurisdictionSeed } from "@/content/seed-types";
import {
  ATL_BUILDING_RULES,
  ATL_BUILDING_SOURCE_KEY,
  ATL_ATL311_SOURCE_KEY,
  ATL_ELECTRICAL_RULES,
  ATL_FEE_EFFECTIVE_FROM,
  ATL_PLUMBING_RULES,
} from "@/content/atlanta/fee-rules";

export const ATL_LAST_VERIFIED = "2026-09-26";

export const ATL_KEYS = {
  state: "ga",
  county: "fulton-county",
  jurisdiction: "atlanta",
  building: ATL_BUILDING_SOURCE_KEY,
  atl311: ATL_ATL311_SOURCE_KEY,
} as const;

const state = {
  code: "GA",
  slug: "georgia",
  name: "Georgia",
  fipsCode: "13",
};

const county = {
  key: ATL_KEYS.county,
  slug: "fulton-county",
  name: "Fulton County",
  fipsCode: "13121",
};

const DCP_URL =
  "https://www.atlantaga.gov/government/departments/city-planning/zoning-development-permitting-services/getting-started-with-our-zd-p-services";
const ATL311_URL = "https://www.atl311.com/en-us/knowledgearticle/?code=KB0012509";
const MUNICODE_URL = "https://library.municode.com/ga/atlanta/codes/code_of_ordinances";
const ACCELA_URL = "https://aca-prod.accela.com/ATLANTA_GA/";

export const atlantaSeed: JurisdictionSeed = {
  state,
  county,

  jurisdiction: {
    key: ATL_KEYS.jurisdiction,
    stateKey: ATL_KEYS.state,
    countyKey: ATL_KEYS.county,
    type: "city",
    slug: "atlanta",
    name: "Atlanta",
    officialName: "City of Atlanta — Department of City Planning, Office of Buildings",
    websiteUrl: "https://www.atlantaga.gov",
    permitPortalUrl: ACCELA_URL,
    timezone: "America/New_York",
    isActive: true,
  },

  departments: [
    {
      key: "atlanta-oob",
      jurisdictionKey: ATL_KEYS.jurisdiction,
      kind: "building",
      name: "Department of City Planning — Office of Buildings",
      phone: "(404) 330-6906",
      email: "residential-oob@atlantaga.gov",
      url: DCP_URL,
      addressLine: "55 Trinity Avenue SW, Suite 3900, Atlanta, GA 30303",
      hours: "Monday – Friday, 8:15 a.m. – 5:00 p.m. ET",
      notes:
        "The Office of Buildings reviews permit applications, performs plan review, and issues building, trade and demolition permits for the City of Atlanta. All application types are submitted electronically through the Accela Citizen portal except Express permits, which are accepted in person.",
    },
  ],

  sources: [
    {
      key: ATL_BUILDING_SOURCE_KEY,
      jurisdictionKey: ATL_KEYS.jurisdiction,
      title:
        "City of Atlanta — Getting Started with Zoning, Development & Permitting Services (DCP fee tables)",
      url: DCP_URL,
      sourceType: "municipal_website",
      issuingAuthority: "City of Atlanta Department of City Planning",
      authorityKind: "city",
      // The live host answers 403 to non-browser clients; the fee tables were
      // read from the Internet Archive's 2025-11-05 snapshot of this page.
      // The snapshot is the City's own page content, not a third party's.
      isPrimary: true,
      documentDate: "2025-11-05",
      effectiveFrom: ATL_FEE_EFFECTIVE_FROM,
      retrievedAt: "2026-09-26",
      lastVerifiedAt: ATL_LAST_VERIFIED,
      notes:
        "Building Permit $7 per $1,000 of Cost of Construction ($150 min); Technology Fee $25 per permit; Electrical Permit $150 base / $75 min; Plumbing Permit $150 base / $175 min. Footnote: a $25 technology fee applies to each of the permit base fees. The page names the Code of Ordinances fee schedule as the legal source.",
    },
    {
      key: ATL_ATL311_SOURCE_KEY,
      jurisdictionKey: ATL_KEYS.jurisdiction,
      title: "ATL311 Knowledge Article — Office of Buildings, Residential Permits",
      url: ATL311_URL,
      sourceType: "municipal_website",
      issuingAuthority: "City of Atlanta (ATL311 / Department of City Planning)",
      authorityKind: "city",
      isPrimary: true,
      documentDate: "2026-08-20",
      effectiveFrom: ATL_FEE_EFFECTIVE_FROM,
      retrievedAt: "2026-09-26",
      lastVerifiedAt: ATL_LAST_VERIFIED,
      notes:
        'Official 311 article states: "The minimum cost for a permit is $150, plus a $25 technology fee. The permit fee schedule for the City of Atlanta, found in the Code of Ordinances..." Confirms the two figures the fee tables carry.',
    },
    {
      key: "atlanta-municode",
      jurisdictionKey: ATL_KEYS.jurisdiction,
      title: "City of Atlanta Code of Ordinances (Ch. 20, Art. IV; Appendix B Table 100)",
      url: MUNICODE_URL,
      sourceType: "municipal_code",
      issuingAuthority: "Atlanta City Council",
      authorityKind: "city",
      isPrimary: true,
      documentDate: null,
      effectiveFrom: ATL_FEE_EFFECTIVE_FROM,
      retrievedAt: "2026-09-26",
      lastVerifiedAt: ATL_LAST_VERIFIED,
      notes:
        "Legal source named by the DCP page and the 311 article. Table 100 of Appendix B supplies the building-valuation data used to check the sworn cost of construction. The Municode viewer requires an authenticated session, so amounts are carried from the City's own fee tables.",
    },
  ],

  permitTypes: [],
  projectTypes: [],

  jurisdictionPermitTypes: [
    {
      jurisdictionKey: ATL_KEYS.jurisdiction,
      permitTypeKey: "building",
      isAvailable: true,
      localName: "Building Permit",
      officialUrl: DCP_URL,
      notes:
        "Assessed at $7 per $1,000 of Cost of Construction with a $150 minimum fee and a $25 technology fee. Repairs under $10,000 of total valuation are exempt (Ord. 17-O-1307); in historic districts the repair exemption drops to $2,500.",
    },
    {
      jurisdictionKey: ATL_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      isAvailable: true,
      localName: "Electrical Permit",
      officialUrl: DCP_URL,
      notes:
        "Standalone trade permit: $150 base fee, $75 minimum fee, $25 technology fee. Issued by the Office of Buildings; work must conform to the NEC as adopted.",
    },
    {
      jurisdictionKey: ATL_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      isAvailable: true,
      localName: "Plumbing Permit",
      officialUrl: DCP_URL,
      notes:
        "Standalone trade permit: $150 base fee, $175 minimum fee, $25 technology fee. Water and sewer availability charges are separate Atlanta Department of Watershed Management items.",
    },
  ],

  feeSchedules: [
    {
      key: ATL_BUILDING_SOURCE_KEY,
      jurisdictionKey: ATL_KEYS.jurisdiction,
      sourceKey: ATL_BUILDING_SOURCE_KEY,
      title: "City of Atlanta Building & Trade Permit Fee Schedule",
      officialUrl: DCP_URL,
      effectiveFrom: ATL_FEE_EFFECTIVE_FROM,
      effectiveTo: null,
      status: "active",
      lastVerifiedAt: ATL_LAST_VERIFIED,
      notes:
        "Fee tables published by the Department of City Planning under the Code of Ordinances; read from the City's archived official page after the live host began refusing automated reads.",
    },
  ],

  feeRules: [
    ...ATL_BUILDING_RULES.map((rule) => ({
      jurisdictionKey: ATL_KEYS.jurisdiction,
      permitTypeKey: "building",
      scheduleKey: ATL_BUILDING_SOURCE_KEY,
      rule,
    })),
    ...ATL_ELECTRICAL_RULES.map((rule) => ({
      jurisdictionKey: ATL_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      scheduleKey: ATL_BUILDING_SOURCE_KEY,
      rule,
    })),
    ...ATL_PLUMBING_RULES.map((rule) => ({
      jurisdictionKey: ATL_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      scheduleKey: ATL_BUILDING_SOURCE_KEY,
      rule,
    })),
  ],

  requirements: [
    {
      jurisdictionKey: ATL_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "document",
      title: "Sworn Cost of Construction Affidavit",
      description:
        "Building Permit Application Packet including a sworn cost-of-construction statement; the fee is set on the higher of the sworn estimate or the reviewer's estimate from the City's Appendix B Table 100 construction-cost data.",
      isMandatory: true,
      sortOrder: 1,
      sourceKey: ATL_BUILDING_SOURCE_KEY,
      lastVerifiedAt: ATL_LAST_VERIFIED,
    },
    {
      jurisdictionKey: ATL_KEYS.jurisdiction,
      permitTypeKey: "building",
      requirementType: "zoning_review",
      title: "Zoning, Arborist and Site Development Review",
      description:
        "Zoning review, arborist review under the Tree Protection Ordinance, and site development review run inside the building permit. Historic and SPI districts require a Certificate of Appropriateness or Special Administrative Permit before the building permit.",
      isMandatory: true,
      sortOrder: 2,
      sourceKey: ATL_BUILDING_SOURCE_KEY,
      lastVerifiedAt: ATL_LAST_VERIFIED,
    },
    {
      jurisdictionKey: ATL_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      requirementType: "license",
      title: "Georgia Statewide Electrical Contractor License",
      description:
        "Electrical trade permits are issued to contractors holding the appropriate Georgia electrical contractor license (Class I/II unrestricted or low-voltage) registered with the City.",
      isMandatory: true,
      sortOrder: 3,
      sourceKey: ATL_BUILDING_SOURCE_KEY,
      lastVerifiedAt: ATL_LAST_VERIFIED,
    },
    {
      jurisdictionKey: ATL_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      requirementType: "license",
      title: "Georgia Journeyman/Master Plumber License",
      description:
        "Plumbing trade permits are issued to contractors holding a Georgia plumbing contractor license (P-1) registered with the City of Atlanta.",
      isMandatory: true,
      sortOrder: 4,
      sourceKey: ATL_BUILDING_SOURCE_KEY,
      lastVerifiedAt: ATL_LAST_VERIFIED,
    },
  ],

  profile: {
    jurisdictionKey: ATL_KEYS.jurisdiction,
    headline: "Atlanta, Georgia Permit Fees & Municipal Building Code",
    summary:
      "The City of Atlanta Department of City Planning, Office of Buildings regulates construction under the Atlanta Building Code (Code of Ordinances Chapter 20, Article IV, Sec. 20-6, with valuation keyed to Appendix B Table 100). Building permits are assessed at $7 per $1,000 of cost of construction with a $150 minimum, plus the City's $25 technology fee — the fee table's own footnote applies it 'to each of the permit base fees'. Trade permits are $150 base fees: electrical with a $75 minimum, plumbing and mechanical with $175 minimums. Notably, the fee table prints no separate plan-review percentage — plan review is bundled into the permit process.",
    localContext:
      "Atlanta enforces the Georgia State Minimum Standard Codes (IBC and IRC) with local amendments, administered by the Department of City Planning through the Accela Citizen portal. The Office of Buildings serves the city across Fulton and DeKalb counties from 55 Trinity Avenue SW.\n\nPermits are entirely electronic except Express permits, which are accepted in person; the Office screens a submittal for acceptance within 48 business hours and routes it for review after the invoiced deposit is paid. Repairs under $10,000 of total valuation are exempt from permit and fee under Ordinance 17-O-1307, with a $2,500 threshold inside historic districts governed by Chapter 20 of the zoning ordinance. Standalone electrical, plumbing and mechanical permits are pulled separately by state-licensed trade contractors, and the $25 technology fee rides every permit the Office of Buildings issues.\n\nTwo reading notes the fee data requires. Atlanta's '$7 per $1,000' prints no 'or fraction thereof', so the rate prorates — unlike neighboring Savannah, whose Revenue Ordinance rounds every fraction up. And the trade minimums look inverted on the City's table (electrical '$150 base / $75 minimum' against plumbing's '$175 minimum'): the minimum column is what a combination permit pays, and the seed models each trade exactly as printed.",
    valuationBasis:
      "Cost of construction is the sworn estimate of the total value of all construction work for the project, verified against the reviewer's estimate from the City's Appendix B Table 100 construction-cost data; the fee is set on the higher of the two.",
    notIncluded:
      "These municipal figures cover the building permit, its minimum, and the technology fee. They exclude:\n\n- **Development impact fees** assessed at building permit under Code Part 19, Ch. 1 (Ord. 21-O-0096) — the smallest residential tier pays $4,591, halved to $3,121 in the transportation share within 1,000 walking feet of a MARTA station.\n- **Water and sewer availability and meter fees** charged by the Atlanta Department of Watershed Management.\n- **Certificates of Appropriateness ($10–$200) and Special Administrative Permits ($500)** for historic and SPI districts.\n- **Right-of-way and metered parking permits** for work in the public way.",
    seoTitle: "Atlanta GA Permit Fees | Official Fee Schedule & Cost Calculator",
    seoDescription:
      "Calculate official Atlanta building permit costs: $7 per $1,000 of construction cost ($150 min) plus $25 technology fee; electrical $75 min, plumbing $175 min; no separate plan-review fee.",
    publishStatus: "published",
    noindex: false,
    lastReviewedAt: ATL_LAST_VERIFIED,
  },

  permitPages: [
    {
      jurisdictionKey: ATL_KEYS.jurisdiction,
      permitTypeKey: "building",
      slug: "building-permit-cost",
      title: "Atlanta Building Permit Cost",
      intro:
        "A City of Atlanta building permit is priced directly from the **sworn cost of construction** at **$7 per $1,000** with a city-wide **minimum fee of $150.00**, and every building permit also carries the City's **$25.00 technology fee** — the fee table's own footnote applies it 'to each of the permit base fees'. The City publishes no separate plan-review percentage: plan review is part of the permit process and the fee table prints no plan-review line. Repairs under $10,000 of total valuation are exempt under Ordinance 17-O-1307, and inside historic districts the repair exemption drops to $2,500.",
      localSummary:
        "Building permits in Atlanta are issued by the Office of Buildings at 55 Trinity Avenue SW and filed through the Accela Citizen portal. The Office screens a submittal for acceptance within 48 business hours and routes it for review after the invoiced deposit is paid. New single- and duplex-family homes up to three stories, additions, basement and attic build-outs, retaining walls and demolitions all file with the Residential Permits Division; larger and commercial projects file with the Commercial division. The fee is set on the higher of your sworn cost estimate or the reviewer's estimate from the City's Appendix B Table 100 data, so understating the sworn figure only delays issuance.",
      notIncluded:
        "This estimate covers the municipal building permit, its minimum and the technology fee. It excludes:\n\n- **Development impact fees** (Ord. 21-O-0096) — the smallest residential tier pays $4,591, halved to $3,121 in the transportation share within 1,000 walking feet of a MARTA station.\n- **Certificates of Appropriateness or Special Administrative Permits** required before the building permit in historic and SPI districts.\n- **Trade permits** (electrical, plumbing, mechanical) pulled separately.\n- **Water/sewer availability charges** from the Department of Watershed Management and right-of-way permits for work in the public way.",
      workedExample: {
        scenario:
          "A single-family home addition in Atlanta with a sworn cost of construction of $85,000.",
        inputs: {
          valuationCents: 8_500_000,
          squareFootage: 650,
          occupancy: "residential",
        },
        notes:
          "The permit fee is $7.00 per $1,000 × 85 = **$595.00**, which exceeds the $150.00 minimum, so no shortfall is charged. The technology fee adds **$25.00** to every permit. The total municipal fee is $595.00 + $25.00 = **$620.00**.",
      },
      faqs: [
        {
          question: "How is an Atlanta building permit fee calculated?",
          answer:
            "The fee table assesses the Building Permit at $7 per $1,000 of Cost of Construction with a $150 minimum fee, plus a $25 technology fee. The cost of construction is your sworn estimate checked against the reviewer's estimate from the City's Appendix B Table 100 data, and the fee is set on the higher of the two.",
          sourceId: ATL_BUILDING_SOURCE_KEY,
          attribution: "City of Atlanta Department of City Planning fee tables",
        },
        {
          question: "What is the minimum building permit fee in Atlanta?",
          answer:
            "$150 per permit, plus the $25 technology fee. The official ATL311 knowledge base states: 'The minimum cost for a permit is $150, plus a $25 technology fee.'",
          sourceId: ATL_ATL311_SOURCE_KEY,
          attribution: "ATL311 — Office of Buildings, Residential Permits",
        },
        {
          question: "Does Atlanta charge a separate plan review fee?",
          answer:
            "No. The City's published fee table prints no separate plan-review percentage for building permits; plan review is part of the permit process. (Trade-plan revisions are a different item: $100 commercial or $50 residential per discipline beyond the initial review.)",
          sourceId: ATL_BUILDING_SOURCE_KEY,
          attribution: "City of Atlanta DCP fee tables",
        },
        {
          question: "Is a permit required for small repairs in Atlanta?",
          answer:
            "No permit or fee is required for repair work with a total valuation under $10,000, provided the work is otherwise lawful, under Ordinance 17-O-1307. In historic districts governed by Chapter 20 of the zoning ordinance the repair threshold drops to $2,500.",
          sourceId: ATL_BUILDING_SOURCE_KEY,
          attribution: "Ordinance 17-O-1307 / DCP permit exemptions",
        },
        {
          question: "Can homeowners pull their own building permits in Atlanta?",
          answer:
            "Yes. Property owners may obtain building permits for their own residences; the application packet identifies whether the general contractor or the property owner is applying and requires the owner's signature and contact details for owner-pulled permits.",
          sourceId: ATL_BUILDING_SOURCE_KEY,
          attribution: "Atlanta Office of Buildings, Building Permit Application Packet",
        },
      ],
      seoTitle: "Atlanta GA Building Permit Cost (Cost of Construction & Tech Fee)",
      seoDescription:
        "Calculate City of Atlanta building permit costs: $7 per $1,000 of construction cost, $150 minimum, $25 technology fee. Repair exemptions under $10,000.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: ATL_LAST_VERIFIED,
    },
    {
      jurisdictionKey: ATL_KEYS.jurisdiction,
      permitTypeKey: "electrical",
      slug: "electrical-permit-cost",
      title: "Atlanta Electrical Permit Cost",
      intro:
        "An Atlanta electrical permit is a **standalone trade permit** issued by the Office of Buildings to state-licensed electrical contractors. The fee table assesses the Electrical Permit at a **$150.00 base fee with a $75.00 minimum fee**, and the $25.00 technology fee applies on top — the table's footnote applies it 'to each of the permit base fees'. Work must conform to the National Electrical Code as adopted under the Georgia State Minimum Standard Electrical Code.",
      localSummary:
        "Electrical permits are required for new wiring, service upgrades and changes, panel replacements and relocations, sub-fed panels, temporary poles and trailer services. Applications are filed through the Accela Citizen portal with the contractor's Georgia electrical contractor registration and the physical address of the work. Rough-in wiring must be inspected before insulation conceals it, and power is released after final inspection.",
      notIncluded:
        "Georgia Power's meter and service connection charges, utility reconnection fees, and after-hours or re-inspection fees are separate items. Low-voltage work has its own row on the City's fee table (minimum $45 for the first 3,000 square feet, $1.50 per additional 1,000).",
      workedExample: {
        scenario:
          "A licensed electrical contractor pulls a permit for a residential service panel upgrade and new kitchen circuits in Atlanta.",
        inputs: {
          valuationCents: 550_000,
        },
        notes:
          "The Electrical Permit base fee is **$150.00**, which exceeds the $75.00 minimum, so no shortfall is charged. The technology fee adds **$25.00**. The total municipal fee is $150.00 + $25.00 = **$175.00**.",
      },
      faqs: [
        {
          question: "Who can pull an electrical permit in Atlanta?",
          answer:
            "Electrical trade permits are issued to contractors holding the appropriate Georgia electrical contractor license (Class I or II unrestricted, or low-voltage) registered with the City of Atlanta.",
          sourceId: ATL_BUILDING_SOURCE_KEY,
          attribution: "Atlanta Office of Buildings trade permit requirements",
        },
        {
          question: "What is the fee for an electrical permit in Atlanta?",
          answer:
            "The fee table assesses the Electrical Permit at a $150 base fee with a $75 minimum fee, plus the $25 technology fee that applies to each of the permit base fees.",
          sourceId: ATL_BUILDING_SOURCE_KEY,
          attribution: "City of Atlanta DCP fee tables",
        },
        {
          question: "Why is the electrical minimum lower than plumbing's?",
          answer:
            "The City publishes its trade minimums directly: the MIN FEE AMT column shows $75 for electrical and $175 for plumbing and mechanical. Those are the amounts the City charges; the asymmetry is the schedule's own, not an error.",
          sourceId: ATL_BUILDING_SOURCE_KEY,
          attribution: "City of Atlanta DCP fee tables",
        },
        {
          question: "When is an electrical inspection required in Atlanta?",
          answer:
            "Rough wiring must be inspected and approved before insulation and wall concealment, and a final inspection follows after fixtures, devices and panel trim are installed and the service is energized for test.",
          sourceId: ATL_BUILDING_SOURCE_KEY,
          attribution: "Atlanta Office of Buildings inspection sequence",
        },
      ],
      seoTitle: "Atlanta GA Electrical Permit Cost & Requirements",
      seoDescription:
        "Find electrical permit fees in Atlanta, GA: $150 base fee, $75 minimum, plus the $25 technology fee. Georgia contractor license requirements and inspections.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: ATL_LAST_VERIFIED,
    },
    {
      jurisdictionKey: ATL_KEYS.jurisdiction,
      permitTypeKey: "plumbing",
      slug: "plumbing-permit-cost",
      title: "Atlanta Plumbing Permit Cost",
      intro:
        "An Atlanta plumbing permit is a **standalone trade permit** issued to Georgia-licensed plumbing contractors. The fee table assesses the Plumbing Permit at a **$150.00 base fee with a $175.00 minimum fee** — the one trade in the City's table whose minimum exceeds its base — plus the **$25.00 technology fee** applied 'to each of the permit base fees'. Work must conform to the Georgia State Minimum Standard Plumbing Code.",
      localSummary:
        "Plumbing permits cover water heater replacements, fixture rough-ins, repiping, sewer laterals and backflow prevention. Applications file through the Accela Citizen portal with the licensed plumbing contractor's registration. City plumbing inspectors verify venting, pressure testing and backflow protection before concealment, and the Department of Watershed Management's water/sewer availability and tap fees are separate and paid before permit issuance where new service is involved.",
      notIncluded:
        "Department of Watershed Management availability, tap and meter fees; water and sewer impact fees for new connections; grease-trap review for food-service buildouts; and re-inspection or after-hours inspection charges are all outside the permit fee.",
      workedExample: {
        scenario:
          "A plumbing contractor pulls a permit for a bathroom repipe and water heater replacement in an Atlanta bungalow.",
        inputs: {
          valuationCents: 400_000,
        },
        notes:
          "The Plumbing Permit base fee is **$150.00**. Because the row's minimum fee is **$175.00**, a permit-minimum shortfall of $25.00 is charged to raise the base to the floor. The technology fee adds **$25.00**. The total municipal fee is $175.00 + $25.00 = **$200.00**.",
      },
      faqs: [
        {
          question: "What is the fee for a plumbing permit in Atlanta?",
          answer:
            "The fee table assesses the Plumbing Permit at a $150 base fee with a $175 minimum fee, plus the $25 technology fee that applies to each of the permit base fees.",
          sourceId: ATL_BUILDING_SOURCE_KEY,
          attribution: "City of Atlanta DCP fee tables",
        },
        {
          question: "Does replacing a water heater require a permit in Atlanta?",
          answer:
            "Yes. The City prices a like-for-like water heater remove-and-replace for one- and two-family residences as its own row ($50 base / $175 minimum plus the technology fee); any larger plumbing scope files the standard plumbing permit.",
          sourceId: ATL_BUILDING_SOURCE_KEY,
          attribution: "City of Atlanta DCP fee tables",
        },
        {
          question: "Who handles water and sewer connection fees in Atlanta?",
          answer:
            "The Atlanta Department of Watershed Management charges water and sewer availability, tap and meter fees separately from the building permit. The Office of Buildings issues the construction permit; Watershed Management bills for the utility connection.",
          sourceId: ATL_BUILDING_SOURCE_KEY,
          attribution: "City of Atlanta Department of Watershed Management",
        },
        {
          question: "Are express permits available for plumbing work?",
          answer:
            "Express permits are accepted in person only — all other permit types must be submitted electronically through the Accela Citizen website. Water heater changeouts are the typical plumbing scope handled at the counter.",
          sourceId: ATL_ATL311_SOURCE_KEY,
          attribution: "ATL311 — Office of Buildings, Residential Permits",
        },
      ],
      seoTitle: "Atlanta GA Plumbing Permit Cost & Regulations",
      seoDescription:
        "City of Atlanta plumbing permit fees: $150 base / $175 minimum plus the $25 technology fee. Licensed Georgia plumber requirements and inspections.",
      publishStatus: "published",
      noindex: false,
      lastReviewedAt: ATL_LAST_VERIFIED,
    },
  ],

  verifications: [
    {
      entityType: "jurisdiction_profile",
      entityKey: ATL_KEYS.jurisdiction,
      status: "verified",
      method: "official_portal_check",
      verifiedAt: ATL_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Georgia Expansion",
      sourceKey: ATL_BUILDING_SOURCE_KEY,
      notes:
        "Fee tables read from the City's archived official page (live host 403s to scripts) and cross-checked against ATL311 article KB0012509 read live the same day.",
    },
    {
      entityType: "fee_schedule",
      entityKey: ATL_BUILDING_SOURCE_KEY,
      status: "verified",
      method: "official_pdf_review",
      verifiedAt: ATL_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Georgia Expansion",
      sourceKey: ATL_BUILDING_SOURCE_KEY,
      notes:
        "Verified $7 per $1,000 / $150 minimum building permit, $25 technology fee, and the trade base/minimum pairs for electrical ($150/$75) and plumbing ($150/$175).",
    },
    {
      entityType: "permit_page",
      entityKey: "building-permit-cost",
      permitTypeKey: "building",
      status: "verified",
      method: "official_portal_check",
      verifiedAt: ATL_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Georgia Expansion",
      sourceKey: ATL_BUILDING_SOURCE_KEY,
      notes: "Passed editorial gate checks for building permit page.",
    },
    {
      entityType: "permit_page",
      entityKey: "electrical-permit-cost",
      permitTypeKey: "electrical",
      status: "verified",
      method: "official_portal_check",
      verifiedAt: ATL_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Georgia Expansion",
      sourceKey: ATL_BUILDING_SOURCE_KEY,
      notes: "Passed editorial gate checks for electrical permit page.",
    },
    {
      entityType: "permit_page",
      entityKey: "plumbing-permit-cost",
      permitTypeKey: "plumbing",
      status: "verified",
      method: "official_portal_check",
      verifiedAt: ATL_LAST_VERIFIED,
      verifiedBy: "Permit Fee Intelligence Georgia Expansion",
      sourceKey: ATL_BUILDING_SOURCE_KEY,
      notes: "Passed editorial gate checks for plumbing permit page.",
    },
  ],
};
