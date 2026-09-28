/**
 * The shape of a jurisdiction seed payload.
 *
 * Extracted from `@/content/houston` when Dallas became the second jurisdiction:
 * the seed script and every content module have to agree on this contract, and a
 * second jurisdiction is exactly when a duplicated type definition starts to drift.
 *
 * Two categories live here, and the split matters for idempotency:
 *
 *  - **Shared rows** (`SeedState`, `SeedCounty`, `SeedPermitType`,
 *    `SeedProjectType`) are keyed globally. Texas and the building/electrical/
 *    plumbing permit types exist once, however many cities cite them, so a second
 *    jurisdiction adds linkage rows rather than a second copy.
 *  - **Jurisdiction rows** carry a `jurisdictionKey`. The seed resolves those keys
 *    to ids, which is what lets it be run twice without creating a second city.
 */

import type { FeeRuleRecord } from "@/lib/calc/types";
import type { WorkedExample } from "@/lib/content/types";

export type SeedState = {
  code: string;
  slug: string;
  name: string;
  fipsCode: string;
};

export type SeedCounty = {
  key: string;
  slug: string;
  name: string;
  fipsCode: string;
};

export type SeedJurisdiction = {
  key: string;
  stateKey: string;
  countyKey: string | null;
  type: "city" | "county" | "town" | "village" | "borough" | "special_district";
  slug: string;
  name: string;
  officialName: string;
  websiteUrl: string;
  permitPortalUrl: string;
  timezone: string;
  isActive: boolean;
};

export type SeedDepartment = {
  key: string;
  jurisdictionKey: string;
  kind: "building" | "planning" | "fire" | "health" | "utilities" | "other";
  name: string;
  phone: string | null;
  email: string | null;
  url: string | null;
  addressLine: string | null;
  hours: string | null;
  notes: string | null;
};

export type SeedSourceType =
  | "municipal_website"
  | "municipal_code"
  | "ordinance"
  | "fee_schedule_pdf"
  | "state_agency"
  | "county_website"
  | "official_calculator"
  | "permit_portal"
  | "other";

export type SeedSource = {
  key: string;
  jurisdictionKey: string | null;
  title: string;
  url: string;
  sourceType: SeedSourceType;
  issuingAuthority: string;
  authorityKind: "city" | "county" | "state" | "other";
  isPrimary: boolean;
  documentDate: string | null;
  effectiveFrom: string | null;
  retrievedAt: string;
  lastVerifiedAt: string | null;
  notes: string | null;
};

export type SeedPermitType = {
  key: string;
  slug: string;
  name: string;
  category:
    | "structural"
    | "electrical"
    | "plumbing"
    | "mechanical"
    | "fire"
    | "zoning"
    | "site"
    | "other";
  appliesTo: "residential" | "commercial" | "both";
  summary: string;
  sortOrder: number;
};

export type SeedProjectType = {
  key: string;
  slug: string;
  name: string;
  description: string | null;
  sortOrder: number;
};

export type SeedJurisdictionPermitType = {
  jurisdictionKey: string;
  permitTypeKey: string;
  isAvailable: boolean;
  localName: string | null;
  officialUrl: string | null;
  notes: string | null;
};

export type SeedFeeSchedule = {
  key: string;
  jurisdictionKey: string;
  sourceKey: string | null;
  title: string;
  officialUrl: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  status: "draft" | "active" | "superseded" | "archived";
  lastVerifiedAt: string | null;
  notes: string | null;
};

export type SeedRequirement = {
  jurisdictionKey: string;
  permitTypeKey: string;
  requirementType:
    | "document"
    | "inspection"
    | "license"
    | "bond"
    | "insurance"
    | "zoning_review"
    | "hoa_review"
    | "energy_code"
    | "other";
  title: string;
  description: string | null;
  isMandatory: boolean;
  sortOrder: number;
  sourceKey: string | null;
  lastVerifiedAt: string | null;
};

export type SeedProfile = {
  jurisdictionKey: string;
  headline: string;
  summary: string;
  localContext: string;
  valuationBasis: string;
  notIncluded: string;
  seoTitle: string;
  seoDescription: string;
  publishStatus: "draft" | "published" | "hidden";
  noindex: boolean;
  lastReviewedAt: string | null;
};

export type SeedPermitPage = {
  jurisdictionKey: string;
  permitTypeKey: string;
  slug: string;
  title: string;
  intro: string;
  localSummary: string;
  notIncluded: string;
  /**
   * Inputs and prose only. The amounts are computed by the engine at render time
   * — see `WorkedExample` in `@/lib/content/types`.
   */
  workedExample: WorkedExample | null;
  faqs: Array<{ question: string; answer: string; sourceId?: string; attribution?: string }> | null;
  seoTitle: string;
  seoDescription: string;
  publishStatus: "draft" | "published" | "hidden";
  noindex: boolean;
  lastReviewedAt: string | null;
};

export type SeedVerification = {
  entityType:
    | "source"
    | "fee_schedule"
    | "fee_rule"
    | "requirement"
    | "jurisdiction_profile"
    | "permit_page";
  /** Resolved against the natural key of the target table. */
  entityKey: string;
  /** For fee rules, the natural key is the rule code, which is not unique on its own. */
  permitTypeKey?: string;
  status: "unverified" | "verified" | "needs_review" | "outdated" | "disputed";
  method: "manual_review" | "official_pdf_review" | "official_portal_check" | "phone" | "email";
  verifiedAt: string;
  verifiedBy: string | null;
  sourceKey: string | null;
  notes: string | null;
};

export type SeedFeeRule = {
  jurisdictionKey: string;
  permitTypeKey: string;
  scheduleKey: string;
  rule: FeeRuleRecord;
};

/** One jurisdiction's complete payload. */
export type JurisdictionSeed = {
  state: SeedState;
  county: SeedCounty;
  jurisdiction: SeedJurisdiction;
  departments: SeedDepartment[];
  sources: SeedSource[];
  /** Global rows. Empty when another jurisdiction in the same run defines them. */
  permitTypes: SeedPermitType[];
  projectTypes: SeedProjectType[];
  jurisdictionPermitTypes: SeedJurisdictionPermitType[];
  feeSchedules: SeedFeeSchedule[];
  feeRules: SeedFeeRule[];
  requirements: SeedRequirement[];
  profile: SeedProfile;
  permitPages: SeedPermitPage[];
  verifications: SeedVerification[];
};
