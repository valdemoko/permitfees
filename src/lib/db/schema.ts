import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import type { FeeCondition, FeeRuleConfig } from "@/lib/calc/types";
import type { FaqEntry, WorkedExample } from "@/lib/content/types";

/**
 * Database schema.
 *
 * Design notes that are not obvious from the DDL:
 *
 * 1. **Money columns are integer CENTS.** They are never numeric/float.
 * 2. **Effective dating, not overwrites.** Fee rules and schedules carry
 *    `effective_from` / `effective_to`. History is preserved by closing a row and
 *    inserting a new one, never by updating an old value in place.
 * 3. **No `relations()` helpers.** Every read uses an explicit join, so the SQL
 *    is visible and index usage is reviewable. The query surface is small.
 * 4. **`sources` is one row per document URL.** A source is a document; a
 *    schedule PDF that governs two jurisdictions is still one document, so the
 *    jurisdiction link on the rule carries the scoping. This avoids a join table
 *    without allowing duplicate source rows.
 * 5. **Duplicate pages are prevented by `scope_key`**, an application-generated
 *    key, because PostgreSQL treats NULLs as distinct in unique indexes and a
 *    nullable `project_type_id` would therefore not prevent duplicates.
 *
 * See DATABASE.md for the full rationale.
 */

/* -------------------------------------------------------------------------- */
/* Enumerations                                                               */
/* -------------------------------------------------------------------------- */

export const jurisdictionTypeEnum = pgEnum("jurisdiction_type", [
  "city",
  "county",
  "town",
  "village",
  "borough",
  "special_district",
]);

export const departmentKindEnum = pgEnum("department_kind", [
  "building",
  "planning",
  "fire",
  "health",
  "utilities",
  "other",
]);

export const permitCategoryEnum = pgEnum("permit_category", [
  "structural",
  "electrical",
  "plumbing",
  "mechanical",
  "fire",
  "zoning",
  "site",
  "other",
]);

export const permitApplicabilityEnum = pgEnum("permit_applicability", [
  "residential",
  "commercial",
  "both",
]);

export const occupancyClassEnum = pgEnum("occupancy_class", [
  "residential",
  "commercial",
  "industrial",
  "mixed",
  "other",
]);

export const sourceTypeEnum = pgEnum("source_type", [
  "municipal_website",
  "municipal_code",
  "ordinance",
  "fee_schedule_pdf",
  "state_agency",
  "county_website",
  "official_calculator",
  "permit_portal",
  "other",
]);

export const authorityKindEnum = pgEnum("authority_kind", [
  "city",
  "county",
  "state",
  "other",
]);

export const requirementTypeEnum = pgEnum("requirement_type", [
  "document",
  "inspection",
  "license",
  "bond",
  "insurance",
  "zoning_review",
  "hoa_review",
  "energy_code",
  "other",
]);

export const feeComponentTypeEnum = pgEnum("fee_component_type", [
  "base",
  "plan_review",
  "technology",
  "inspection",
  "surcharge",
  "state_surcharge",
  "other",
]);

export const feeTypeEnum = pgEnum("fee_type", [
  "flat",
  "percent",
  "per_thousand",
  "tiered_marginal",
  "tiered_table",
  "per_unit",
  // A floor on the whole permit, charged as the shortfall. Added for Miami-Dade's trade
  // fee sheets, which state a minimum per permit rather than per row; the enum has to
  // carry it or the seeder cannot store a rule the engine can evaluate.
  "permit_minimum",
]);

export const feeRuleStatusEnum = pgEnum("fee_rule_status", [
  "draft",
  "active",
  "superseded",
  "archived",
]);

export const publishStatusEnum = pgEnum("publish_status", [
  "draft",
  "published",
  "hidden",
]);

export const verificationStatusEnum = pgEnum("verification_status", [
  "unverified",
  "verified",
  "needs_review",
  "outdated",
  "disputed",
]);

export const verificationMethodEnum = pgEnum("verification_method", [
  "manual_review",
  "official_pdf_review",
  "official_portal_check",
  "phone",
  "email",
]);

export const verificationEntityTypeEnum = pgEnum("verification_entity_type", [
  "source",
  "fee_schedule",
  "fee_rule",
  "requirement",
  "jurisdiction_profile",
  "permit_page",
]);

/* -------------------------------------------------------------------------- */
/* Geography                                                                  */
/* -------------------------------------------------------------------------- */

export const states = pgTable(
  "states",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: varchar("code", { length: 2 }).notNull(),
    slug: varchar("slug", { length: 96 }).notNull(),
    name: varchar("name", { length: 96 }).notNull(),
    fipsCode: varchar("fips_code", { length: 2 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("states_code_uq").on(table.code),
    uniqueIndex("states_slug_uq").on(table.slug),
  ],
);

export const counties = pgTable(
  "counties",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    stateId: uuid("state_id")
      .notNull()
      .references(() => states.id, { onDelete: "cascade" }),
    slug: varchar("slug", { length: 96 }).notNull(),
    name: varchar("name", { length: 160 }).notNull(),
    fipsCode: varchar("fips_code", { length: 5 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("counties_state_slug_uq").on(table.stateId, table.slug)],
);

/**
 * The permit-issuing authority. Usually a city, sometimes a county (for
 * unincorporated areas) or a special district, which is why `type` exists rather
 * than a `cities` table.
 */
export const jurisdictions = pgTable(
  "jurisdictions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    stateId: uuid("state_id")
      .notNull()
      .references(() => states.id, { onDelete: "cascade" }),
    countyId: uuid("county_id").references(() => counties.id, { onDelete: "set null" }),
    type: jurisdictionTypeEnum("type").notNull(),
    slug: varchar("slug", { length: 96 }).notNull(),
    /** Short, natural name used in prose: "Houston". */
    name: varchar("name", { length: 160 }).notNull(),
    /** The official name it uses for itself: "City of Houston". */
    officialName: varchar("official_name", { length: 200 }),
    websiteUrl: text("website_url"),
    permitPortalUrl: text("permit_portal_url"),
    timezone: varchar("timezone", { length: 64 }),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("jurisdictions_state_slug_uq").on(table.stateId, table.slug),
    index("jurisdictions_state_type_idx").on(table.stateId, table.type),
  ],
);

export const departments = pgTable(
  "departments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    jurisdictionId: uuid("jurisdiction_id")
      .notNull()
      .references(() => jurisdictions.id, { onDelete: "cascade" }),
    kind: departmentKindEnum("kind").notNull(),
    name: varchar("name", { length: 200 }).notNull(),
    phone: varchar("phone", { length: 40 }),
    email: varchar("email", { length: 200 }),
    url: text("url"),
    addressLine: varchar("address_line", { length: 240 }),
    hours: varchar("hours", { length: 240 }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("departments_jurisdiction_kind_uq").on(table.jurisdictionId, table.kind),
  ],
);

/* -------------------------------------------------------------------------- */
/* Sources and evidence                                                       */
/* -------------------------------------------------------------------------- */

/**
 * The official reference behind a fact. This table is the reason the product can
 * be trusted: nothing is published without a row here.
 */
export const sources = pgTable(
  "sources",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Primary jurisdiction this document belongs to. Null for state-wide or multi-city documents. */
    jurisdictionId: uuid("jurisdiction_id").references(() => jurisdictions.id, {
      onDelete: "set null",
    }),
    title: varchar("title", { length: 300 }).notNull(),
    url: text("url").notNull(),
    sourceType: sourceTypeEnum("source_type").notNull(),
    issuingAuthority: varchar("issuing_authority", { length: 240 }).notNull(),
    authorityKind: authorityKindEnum("authority_kind").notNull(),
    /** Only a primary source may be cited as the basis for a published fact. */
    isPrimary: boolean("is_primary").notNull().default(true),
    /** When the document itself is dated. Null when undated, which is recorded honestly. */
    documentDate: date("document_date"),
    effectiveFrom: date("effective_from"),
    /** When we fetched it. */
    retrievedAt: date("retrieved_at").notNull(),
    lastVerifiedAt: date("last_verified_at"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("sources_url_uq").on(table.url),
    index("sources_jurisdiction_idx").on(table.jurisdictionId),
  ],
);

/** Immutable evidence that a document said X at time T. Survives URL changes. */
export const sourceSnapshots = pgTable(
  "source_snapshots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sourceId: uuid("source_id")
      .notNull()
      .references(() => sources.id, { onDelete: "cascade" }),
    capturedAt: timestamp("captured_at", { withTimezone: true }).notNull().defaultNow(),
    contentHash: varchar("content_hash", { length: 80 }).notNull(),
    /** Where the archived copy lives, when we keep one. */
    storageRef: text("storage_ref"),
    note: text("note"),
  },
  (table) => [
    uniqueIndex("source_snapshots_source_hash_uq").on(table.sourceId, table.contentHash),
  ],
);

/* -------------------------------------------------------------------------- */
/* Permit catalogue (global, reusable)                                        */
/* -------------------------------------------------------------------------- */

/**
 * Global permit catalogue. "Electrical permit" means the same thing everywhere,
 * so it is one row. Anything jurisdiction-specific lives on
 * `jurisdiction_permit_types` or on the fee rules themselves.
 *
 * `slug` is the URL segment and is data, not code, so the URL convention can be
 * tuned per page type once real query data exists.
 */
export const permitTypes = pgTable(
  "permit_types",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Stable machine key used by code: "building", "electrical". */
    key: varchar("key", { length: 64 }).notNull(),
    /** URL segment, e.g. "building-permit-cost". */
    slug: varchar("slug", { length: 96 }).notNull(),
    name: varchar("name", { length: 160 }).notNull(),
    category: permitCategoryEnum("category").notNull(),
    appliesTo: permitApplicabilityEnum("applies_to").notNull().default("both"),
    summary: text("summary"),
    isActive: boolean("is_active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(100),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("permit_types_key_uq").on(table.key),
    uniqueIndex("permit_types_slug_uq").on(table.slug),
  ],
);

/**
 * How people actually describe the work: "kitchen remodel", "new home", "ADU".
 * Distinct from permit types because one project routinely needs several permits,
 * and because project phrasing carries the strongest search intent.
 */
export const projectTypes = pgTable(
  "project_types",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    key: varchar("key", { length: 64 }).notNull(),
    slug: varchar("slug", { length: 96 }).notNull(),
    name: varchar("name", { length: 160 }).notNull(),
    description: text("description"),
    isActive: boolean("is_active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(100),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("project_types_key_uq").on(table.key),
    uniqueIndex("project_types_slug_uq").on(table.slug),
  ],
);

/**
 * Does this jurisdiction issue this permit, and what does it call it locally?
 * The place to record "no separate electrical permit fee is issued".
 */
export const jurisdictionPermitTypes = pgTable(
  "jurisdiction_permit_types",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    jurisdictionId: uuid("jurisdiction_id")
      .notNull()
      .references(() => jurisdictions.id, { onDelete: "cascade" }),
    permitTypeId: uuid("permit_type_id")
      .notNull()
      .references(() => permitTypes.id, { onDelete: "cascade" }),
    isAvailable: boolean("is_available").notNull().default(true),
    /** The jurisdiction's own name for it, e.g. "Building Construction Permit". */
    localName: varchar("local_name", { length: 200 }),
    officialUrl: text("official_url"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("jurisdiction_permit_types_uq").on(table.jurisdictionId, table.permitTypeId),
  ],
);

/* -------------------------------------------------------------------------- */
/* Requirements                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Documents, inspections, licences, bonds. Separate from fees because people
 * research them separately, and because they change on a different cadence.
 */
export const permitRequirements = pgTable(
  "permit_requirements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    jurisdictionId: uuid("jurisdiction_id")
      .notNull()
      .references(() => jurisdictions.id, { onDelete: "cascade" }),
    permitTypeId: uuid("permit_type_id")
      .notNull()
      .references(() => permitTypes.id, { onDelete: "cascade" }),
    projectTypeId: uuid("project_type_id").references(() => projectTypes.id, {
      onDelete: "set null",
    }),
    requirementType: requirementTypeEnum("requirement_type").notNull(),
    title: varchar("title", { length: 240 }).notNull(),
    description: text("description"),
    isMandatory: boolean("is_mandatory").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(100),
    sourceId: uuid("source_id").references(() => sources.id, { onDelete: "set null" }),
    lastVerifiedAt: date("last_verified_at"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("permit_requirements_lookup_idx").on(table.jurisdictionId, table.permitTypeId),
    index("permit_requirements_type_idx").on(table.requirementType),
  ],
);

/* -------------------------------------------------------------------------- */
/* Fees                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * A published schedule document, as an era. Rules belong to the schedule that
 * introduced them, so "the 2026 fee schedule" is a queryable thing.
 */
export const feeSchedules = pgTable(
  "fee_schedules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    jurisdictionId: uuid("jurisdiction_id")
      .notNull()
      .references(() => jurisdictions.id, { onDelete: "cascade" }),
    sourceId: uuid("source_id").references(() => sources.id, { onDelete: "set null" }),
    title: varchar("title", { length: 300 }).notNull(),
    officialUrl: text("official_url"),
    effectiveFrom: date("effective_from").notNull(),
    effectiveTo: date("effective_to"),
    status: feeRuleStatusEnum("status").notNull().default("active"),
    lastVerifiedAt: date("last_verified_at"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("fee_schedules_jurisdiction_idx").on(table.jurisdictionId, table.status),
  ],
);

/**
 * One calculable fee component.
 *
 * `config` and `conditions` are JSONB validated by the engine's Zod schemas. A
 * fee change closes the existing rows and inserts new ones; it never rewrites
 * history.
 */
export const feeRules = pgTable(
  "fee_rules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    feeScheduleId: uuid("fee_schedule_id").references(() => feeSchedules.id, {
      onDelete: "set null",
    }),
    jurisdictionId: uuid("jurisdiction_id")
      .notNull()
      .references(() => jurisdictions.id, { onDelete: "cascade" }),
    permitTypeId: uuid("permit_type_id")
      .notNull()
      .references(() => permitTypes.id, { onDelete: "cascade" }),
    projectTypeId: uuid("project_type_id").references(() => projectTypes.id, {
      onDelete: "set null",
    }),
    sourceId: uuid("source_id").references(() => sources.id, { onDelete: "set null" }),
    /** Stable identifier used in tests and in UI keys: "BASE-RES". */
    code: varchar("code", { length: 80 }).notNull(),
    label: varchar("label", { length: 240 }).notNull(),
    description: text("description"),
    componentType: feeComponentTypeEnum("component_type").notNull(),
    feeType: feeTypeEnum("fee_type").notNull(),
    config: jsonb("config").$type<FeeRuleConfig>().notNull(),
    conditions: jsonb("conditions").$type<FeeCondition>(),
    minimumCents: integer("minimum_cents"),
    maximumCents: integer("maximum_cents"),
    priority: integer("priority").notNull().default(100),
    effectiveFrom: date("effective_from").notNull(),
    effectiveTo: date("effective_to"),
    status: feeRuleStatusEnum("status").notNull().default("active"),
    lastVerifiedAt: date("last_verified_at"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("fee_rules_identity_uq").on(
      table.jurisdictionId,
      table.permitTypeId,
      table.code,
      table.effectiveFrom,
    ),
    index("fee_rules_lookup_idx").on(
      table.jurisdictionId,
      table.permitTypeId,
      table.status,
    ),
    index("fee_rules_window_idx").on(table.effectiveFrom, table.effectiveTo),
    index("fee_rules_schedule_idx").on(table.feeScheduleId),
  ],
);

/* -------------------------------------------------------------------------- */
/* Editorial content                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Human-written context for a jurisdiction hub page, plus the publish switch.
 * `noindex` defaults to TRUE: a page has to be deliberately opened to search
 * engines once it passes the editorial gate.
 */
export const jurisdictionProfiles = pgTable(
  "jurisdiction_profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    jurisdictionId: uuid("jurisdiction_id")
      .notNull()
      .references(() => jurisdictions.id, { onDelete: "cascade" }),
    headline: varchar("headline", { length: 300 }),
    summary: text("summary"),
    localContext: text("local_context"),
    valuationBasis: text("valuation_basis"),
    notIncluded: text("not_included"),
    seoTitle: varchar("seo_title", { length: 200 }),
    seoDescription: text("seo_description"),
    publishStatus: publishStatusEnum("publish_status").notNull().default("draft"),
    noindex: boolean("noindex").notNull().default(true),
    lastReviewedAt: date("last_reviewed_at"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("jurisdiction_profiles_jurisdiction_uq").on(table.jurisdictionId),
    index("jurisdiction_profiles_publish_idx").on(table.publishStatus, table.noindex),
  ],
);

/**
 * The per-permit cost page. A URL exists only when a row here passes the
 * editorial gate, which is how "quality over quantity" is enforced structurally
 * rather than by discipline.
 */
export const jurisdictionPermitPages = pgTable(
  "jurisdiction_permit_pages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    jurisdictionId: uuid("jurisdiction_id")
      .notNull()
      .references(() => jurisdictions.id, { onDelete: "cascade" }),
    permitTypeId: uuid("permit_type_id")
      .notNull()
      .references(() => permitTypes.id, { onDelete: "cascade" }),
    projectTypeId: uuid("project_type_id").references(() => projectTypes.id, {
      onDelete: "set null",
    }),
    /**
     * Application-generated dedupe key: `"<permitTypeId>"` or
     * `"<permitTypeId>:<projectTypeId>"`. Exists because PostgreSQL treats NULLs
     * as distinct in unique indexes, so a nullable `project_type_id` alone would
     * allow duplicate pages for the same URL.
     */
    scopeKey: varchar("scope_key", { length: 200 }).notNull(),
    /** URL segment for this page, resolved from the permit or project type. */
    slug: varchar("slug", { length: 160 }).notNull(),
    title: varchar("title", { length: 240 }),
    intro: text("intro"),
    localSummary: text("local_summary"),
    notIncluded: text("not_included"),
    workedExample: jsonb("worked_example").$type<WorkedExample>(),
    faqs: jsonb("faqs").$type<FaqEntry[]>(),
    seoTitle: varchar("seo_title", { length: 200 }),
    seoDescription: text("seo_description"),
    publishStatus: publishStatusEnum("publish_status").notNull().default("draft"),
    noindex: boolean("noindex").notNull().default(true),
    lastReviewedAt: date("last_reviewed_at"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("jurisdiction_permit_pages_scope_uq").on(table.jurisdictionId, table.scopeKey),
    uniqueIndex("jurisdiction_permit_pages_slug_uq").on(table.jurisdictionId, table.slug),
    index("jurisdiction_permit_pages_publish_idx").on(table.publishStatus, table.noindex),
  ],
);

/* -------------------------------------------------------------------------- */
/* Verification                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Append-only verification ledger.
 *
 * Polymorphic by design: verification applies uniformly to sources, schedules,
 * rules, requirements and content, and four typed join tables would add
 * complexity without adding integrity we currently depend on.
 *
 * A verification is never edited. Corrections are new rows, which is what makes
 * the history trustworthy.
 */
export const verificationRecords = pgTable(
  "verification_records",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    entityType: verificationEntityTypeEnum("entity_type").notNull(),
    entityId: uuid("entity_id").notNull(),
    status: verificationStatusEnum("status").notNull(),
    method: verificationMethodEnum("method").notNull(),
    verifiedAt: date("verified_at").notNull(),
    verifiedBy: varchar("verified_by", { length: 120 }),
    sourceId: uuid("source_id").references(() => sources.id, { onDelete: "set null" }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("verification_records_entity_idx").on(table.entityType, table.entityId),
    index("verification_records_verified_at_idx").on(table.verifiedAt),
  ],
);

/* -------------------------------------------------------------------------- */
/* Inferred row types                                                         */
/* -------------------------------------------------------------------------- */

export type StateRow = typeof states.$inferSelect;
export type CountyRow = typeof counties.$inferSelect;
export type JurisdictionRow = typeof jurisdictions.$inferSelect;
export type DepartmentRow = typeof departments.$inferSelect;
export type SourceRow = typeof sources.$inferSelect;
export type SourceSnapshotRow = typeof sourceSnapshots.$inferSelect;
export type PermitTypeRow = typeof permitTypes.$inferSelect;
export type ProjectTypeRow = typeof projectTypes.$inferSelect;
export type JurisdictionPermitTypeRow = typeof jurisdictionPermitTypes.$inferSelect;
export type PermitRequirementRow = typeof permitRequirements.$inferSelect;
export type FeeScheduleRow = typeof feeSchedules.$inferSelect;
export type FeeRuleRow = typeof feeRules.$inferSelect;
export type JurisdictionProfileRow = typeof jurisdictionProfiles.$inferSelect;
export type JurisdictionPermitPageRow = typeof jurisdictionPermitPages.$inferSelect;
export type VerificationRecordRow = typeof verificationRecords.$inferSelect;
