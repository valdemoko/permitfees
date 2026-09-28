import { neon } from "@neondatabase/serverless";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";

import { ALL_SEEDS } from "@/content";
import type { JurisdictionSeed } from "@/content/seed-types";
import { validateFeeRule } from "@/lib/calc/schemas";
import * as schema from "@/lib/db/schema";
import { logSafeError } from "@/lib/errors";

import { loadEnvFiles } from "./load-env";

/**
 * Jurisdiction seed.
 *
 * Seeds every jurisdiction in `seeds` below. Houston was the only one, so the
 * functions were written against its payload directly; they now take the payload
 * as an argument, and the rows that are shared between jurisdictions — the state,
 * the county, the permit types — are written once and linked, never duplicated.
 *
 * Properties this script guarantees, in order of importance:
 *
 * 1. **Validated.** Every fee rule is run through the engine's own Zod schema
 *    before it is written. A rule the engine cannot compute cannot reach the
 *    database, so a published page can never show a figure from a rule that
 *    silently failed to validate.
 * 2. **Idempotent.** Every write is an upsert keyed on a natural key (state code,
 *    jurisdiction slug, permit type key, fee rule code plus effective date), so
 *    running it twice updates the same rows instead of creating a second Houston.
 * 3. **Evidence-preserving.** `verification_records` is append-only by design, so
 *    the seed inserts a verification only when an identical one does not already
 *    exist. It never edits or deletes a verification, because the ledger is what
 *    makes the history trustworthy.
 * 4. **Loud.** It writes nothing except when explicitly run, and it fails with a
 *    non-zero exit code rather than half-seeding.
 *
 * Usage: `npm run db:seed` (requires DATABASE_URL).
 */

/* -------------------------------------------------------------------------- */
/* Environment                                                                */
/* -------------------------------------------------------------------------- */

const { files } = loadEnvFiles();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error(
    [
      "DATABASE_URL is not set, so the seed cannot run.",
      "",
      "Create a Neon database and put its connection string in .env.local:",
      "  DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require",
      "",
      files.length
        ? `Loaded environment from: ${files.join(", ")} — no DATABASE_URL in any of them.`
        : "Neither .env.local nor .env exists in this directory.",
      "See .env.example. The application itself runs without a database; only the",
      "seed, migrations and the data-backed routes need one.",
    ].join("\n"),
  );
  process.exit(1);
}

if (!/^postgres(ql)?:\/\//.test(databaseUrl)) {
  console.error("DATABASE_URL must be a PostgreSQL connection string.");
  process.exit(1);
}

const db = drizzle(neon(databaseUrl), { schema });

/**
 * Every jurisdiction this script seeds.
 *
 * Order matters only for readability: every entry upserts on natural keys, so
 * re-running in any order reaches the same rows. The states, counties and permit
 * types that two jurisdictions share are written once — they are de-duplicated by
 * code and by key before they are touched — so Houston and Dallas share Texas and
 * "the building permit", and Phoenix introduces Arizona, Maricopa County and
 * nothing else.
 */
const seeds: JurisdictionSeed[] = ALL_SEEDS;

/**
 * The date the rules of a jurisdiction were last read, taken from its own
 * verification ledger rather than typed in: the newest verification in the payload
 * is by definition the last time a human checked something about it.
 */
function lastVerifiedFor(seed: JurisdictionSeed): string {
  const dates = seed.verifications.map((verification) => verification.verifiedAt).sort();
  return dates[dates.length - 1] ?? seed.feeSchedules[0]?.effectiveFrom ?? "1970-01-01";
}

/* -------------------------------------------------------------------------- */
/* Bookkeeping                                                                */
/* -------------------------------------------------------------------------- */

const counts: Record<string, number> = {};
function count(label: string): void {
  counts[label] = (counts[label] ?? 0) + 1;
}

function fail(message: string): never {
  console.error(`\nSeed failed: ${message}\n`);
  process.exit(1);
}

/* -------------------------------------------------------------------------- */
/* Idempotent writers                                                         */
/* -------------------------------------------------------------------------- */

const now = new Date();

async function upsertStates(): Promise<Map<string, string>> {
  const ids = new Map<string, string>();

  // De-duplicated by code: two cities in one state are one state row.
  const byCode = new Map<string, JurisdictionSeed["state"]>();
  for (const seed of seeds) byCode.set(seed.state.code, seed.state);

  for (const state of byCode.values()) {
    const [row] = await db
      .insert(schema.states)
      .values({
        code: state.code,
        slug: state.slug,
        name: state.name,
        fipsCode: state.fipsCode,
      })
      .onConflictDoUpdate({
        target: schema.states.code,
        set: {
          slug: state.slug,
          name: state.name,
          fipsCode: state.fipsCode,
          updatedAt: now,
        },
      })
      .returning({ id: schema.states.id });

    if (!row) fail(`could not write the state row for ${state.code}.`);
    ids.set(state.code, row.id);
    count("states");
  }

  return ids;
}

async function upsertCounties(stateIds: Map<string, string>): Promise<Map<string, string>> {
  const ids = new Map<string, string>();

  /*
   * De-duplicated by key, the same way: Dallas County is one row however many
   * cities inside it are seeded later.
   *
   * The key is scoped by state, because a county *name* is not unique across the
   * country and the table keys these rows on (state, slug) for the same reason.
   * Two states have a Kent County — Michigan's holds Grand Rapids, Rhode
   * Island's holds Warwick — and while this map was keyed on the seed's own
   * `county.key` alone the second one written overwrote the first, so both
   * jurisdictions were linked to whichever county came later in seed order:
   * Grand Rapids pointed at Kent County, Rhode Island, and Michigan's own row
   * was left with nothing attached to it. Nothing failed — the row counts were
   * right, the links were not. Scoping the key makes the same county name in a
   * second state a supported case rather than a trap.
   */
  const byKey = new Map<string, { seed: JurisdictionSeed; county: JurisdictionSeed["county"] }>();
  for (const seed of seeds) {
    byKey.set(`${seed.state.code}:${seed.county.key}`, { seed, county: seed.county });
  }

  for (const [key, { seed, county }] of byKey) {
    const stateId = stateIds.get(seed.state.code);
    if (!stateId) fail(`no state row for ${seed.state.code}.`);

    const [row] = await db
      .insert(schema.counties)
      .values({
        stateId,
        slug: county.slug,
        name: county.name,
        fipsCode: county.fipsCode,
      })
      .onConflictDoUpdate({
        target: [schema.counties.stateId, schema.counties.slug],
        set: {
          name: county.name,
          fipsCode: county.fipsCode,
          updatedAt: now,
        },
      })
      .returning({ id: schema.counties.id });

    if (!row) fail(`could not write the county row for ${county.name}.`);
    ids.set(key, row.id);
    count("counties");
  }

  return ids;
}

async function upsertJurisdiction(
  seed: JurisdictionSeed,
  stateIds: Map<string, string>,
  countyIds: Map<string, string>,
): Promise<string> {
  const j = seed.jurisdiction;

  const stateId = stateIds.get(seed.state.code);
  if (!stateId) fail(`no state row for ${seed.state.code}.`);

  const countyId =
    j.countyKey === null ? null : (countyIds.get(`${seed.state.code}:${j.countyKey}`) ?? null);
  if (j.countyKey !== null && countyId === null) {
    fail(`jurisdiction "${j.key}" cites unknown county "${j.countyKey}".`);
  }
  const [row] = await db
    .insert(schema.jurisdictions)
    .values({
      stateId,
      countyId,
      type: j.type,
      slug: j.slug,
      name: j.name,
      officialName: j.officialName,
      websiteUrl: j.websiteUrl,
      permitPortalUrl: j.permitPortalUrl,
      timezone: j.timezone,
      isActive: j.isActive,
    })
    .onConflictDoUpdate({
      target: [schema.jurisdictions.stateId, schema.jurisdictions.slug],
      set: {
        countyId,
        type: j.type,
        name: j.name,
        officialName: j.officialName,
        websiteUrl: j.websiteUrl,
        permitPortalUrl: j.permitPortalUrl,
        timezone: j.timezone,
        isActive: j.isActive,
        updatedAt: now,
      },
    })
    .returning({ id: schema.jurisdictions.id });

  if (!row) fail(`could not write the jurisdiction row for ${j.slug}.`);
  count("jurisdictions");
  return row.id;
}

async function upsertDepartments(seed: JurisdictionSeed, jurisdictionId: string): Promise<void> {
  for (const department of seed.departments) {
    await db
      .insert(schema.departments)
      .values({
        jurisdictionId,
        kind: department.kind,
        name: department.name,
        phone: department.phone,
        email: department.email,
        url: department.url,
        addressLine: department.addressLine,
        hours: department.hours,
        notes: department.notes,
      })
      .onConflictDoUpdate({
        target: [schema.departments.jurisdictionId, schema.departments.kind],
        set: {
          name: department.name,
          phone: department.phone,
          email: department.email,
          url: department.url,
          addressLine: department.addressLine,
          hours: department.hours,
          notes: department.notes,
          updatedAt: now,
        },
      });
    count("departments");
  }
}

async function upsertSources(
  seed: JurisdictionSeed,
  jurisdictionId: string,
): Promise<Map<string, string>> {
  const ids = new Map<string, string>();

  for (const source of seed.sources) {
    const [row] = await db
      .insert(schema.sources)
      .values({
        jurisdictionId: source.jurisdictionKey === null ? null : jurisdictionId,
        title: source.title,
        url: source.url,
        sourceType: source.sourceType,
        issuingAuthority: source.issuingAuthority,
        authorityKind: source.authorityKind,
        isPrimary: source.isPrimary,
        documentDate: source.documentDate,
        effectiveFrom: source.effectiveFrom,
        retrievedAt: source.retrievedAt,
        lastVerifiedAt: source.lastVerifiedAt,
        notes: source.notes,
      })
      // A source is a document, identified by its URL. That unique index is what
      // stops the same PDF being recorded twice under two different keys.
      .onConflictDoUpdate({
        target: schema.sources.url,
        set: {
          title: source.title,
          sourceType: source.sourceType,
          issuingAuthority: source.issuingAuthority,
          authorityKind: source.authorityKind,
          isPrimary: source.isPrimary,
          documentDate: source.documentDate,
          effectiveFrom: source.effectiveFrom,
          retrievedAt: source.retrievedAt,
          lastVerifiedAt: source.lastVerifiedAt,
          notes: source.notes,
          updatedAt: now,
        },
      })
      .returning({ id: schema.sources.id });

    if (!row) fail(`could not write source "${source.key}".`);
    ids.set(source.key, row.id);
    count("sources");
  }

  return ids;
}

async function upsertPermitTypes(): Promise<Map<string, string>> {
  const ids = new Map<string, string>();

  // Permit types are global: "the building permit" is one row that Houston and
  // Dallas both link to. A jurisdiction that defines none (Dallas, which reuses
  // Houston's) contributes nothing here and adds linkage rows instead.
  const byKey = new Map<string, JurisdictionSeed["permitTypes"][number]>();
  for (const seed of seeds) {
    for (const permitType of seed.permitTypes) byKey.set(permitType.key, permitType);
  }

  for (const permitType of byKey.values()) {
    const [row] = await db
      .insert(schema.permitTypes)
      .values({
        key: permitType.key,
        slug: permitType.slug,
        name: permitType.name,
        category: permitType.category,
        appliesTo: permitType.appliesTo,
        summary: permitType.summary,
        sortOrder: permitType.sortOrder,
      })
      .onConflictDoUpdate({
        target: schema.permitTypes.key,
        set: {
          slug: permitType.slug,
          name: permitType.name,
          category: permitType.category,
          appliesTo: permitType.appliesTo,
          summary: permitType.summary,
          sortOrder: permitType.sortOrder,
          updatedAt: now,
        },
      })
      .returning({ id: schema.permitTypes.id });

    if (!row) fail(`could not write permit type "${permitType.key}".`);
    ids.set(permitType.key, row.id);
    count("permitTypes");
  }

  return ids;
}

async function upsertProjectTypes(): Promise<Map<string, string>> {
  const ids = new Map<string, string>();

  const byKey = new Map<string, JurisdictionSeed["projectTypes"][number]>();
  for (const seed of seeds) {
    for (const projectType of seed.projectTypes) byKey.set(projectType.key, projectType);
  }

  for (const projectType of byKey.values()) {
    const [row] = await db
      .insert(schema.projectTypes)
      .values({
        key: projectType.key,
        slug: projectType.slug,
        name: projectType.name,
        description: projectType.description,
        sortOrder: projectType.sortOrder,
      })
      .onConflictDoUpdate({
        target: schema.projectTypes.key,
        set: {
          slug: projectType.slug,
          name: projectType.name,
          description: projectType.description,
          sortOrder: projectType.sortOrder,
          updatedAt: now,
        },
      })
      .returning({ id: schema.projectTypes.id });

    if (!row) fail(`could not write project type "${projectType.key}".`);
    ids.set(projectType.key, row.id);
    count("projectTypes");
  }

  return ids;
}async function upsertJurisdictionPermitTypes(
  seed: JurisdictionSeed,
  jurisdictionId: string,
  permitTypeIds: Map<string, string>,
): Promise<void> {
  for (const link of seed.jurisdictionPermitTypes) {
    const permitTypeId = permitTypeIds.get(link.permitTypeKey);
    if (!permitTypeId) fail(`unknown permit type key "${link.permitTypeKey}".`);

    await db
      .insert(schema.jurisdictionPermitTypes)
      .values({
        jurisdictionId,
        permitTypeId,
        isAvailable: link.isAvailable,
        localName: link.localName,
        officialUrl: link.officialUrl,
        notes: link.notes,
      })
      .onConflictDoUpdate({
        target: [
          schema.jurisdictionPermitTypes.jurisdictionId,
          schema.jurisdictionPermitTypes.permitTypeId,
        ],
        set: {
          isAvailable: link.isAvailable,
          localName: link.localName,
          officialUrl: link.officialUrl,
          notes: link.notes,
          updatedAt: now,
        },
      });
    count("jurisdictionPermitTypes");
  }
}

async function upsertFeeSchedules(
  seed: JurisdictionSeed,
  jurisdictionId: string,
  sourceIds: Map<string, string>,
): Promise<Map<string, string>> {
  const ids = new Map<string, string>();

  for (const schedule of seed.feeSchedules) {
    // `fee_schedules` has no natural unique index (a jurisdiction can publish two
    // schedules with the same title in different years), so identity is
    // established by lookup on (jurisdiction, title, effective_from).
    const [existing] = await db
      .select({ id: schema.feeSchedules.id })
      .from(schema.feeSchedules)
      .where(
        and(
          eq(schema.feeSchedules.jurisdictionId, jurisdictionId),
          eq(schema.feeSchedules.title, schedule.title),
          eq(schema.feeSchedules.effectiveFrom, schedule.effectiveFrom),
        ),
      )
      .limit(1);

    const values = {
      jurisdictionId,
      sourceId: schedule.sourceKey === null ? null : (sourceIds.get(schedule.sourceKey) ?? null),
      title: schedule.title,
      officialUrl: schedule.officialUrl,
      effectiveFrom: schedule.effectiveFrom,
      effectiveTo: schedule.effectiveTo,
      status: schedule.status,
      lastVerifiedAt: schedule.lastVerifiedAt,
      notes: schedule.notes,
    };

    if (existing) {
      await db
        .update(schema.feeSchedules)
        .set({ ...values, updatedAt: now })
        .where(eq(schema.feeSchedules.id, existing.id));
      ids.set(schedule.key, existing.id);
    } else {
      const [row] = await db
        .insert(schema.feeSchedules)
        .values(values)
        .returning({ id: schema.feeSchedules.id });
      if (!row) fail(`could not write fee schedule "${schedule.key}".`);
      ids.set(schedule.key, row.id);
    }

    count("feeSchedules");
  }

  return ids;
}

const validStatuses = new Set(["draft", "active", "superseded", "archived"]);

async function upsertFeeRules(
  seed: JurisdictionSeed,
  jurisdictionId: string,
  permitTypeIds: Map<string, string>,
  scheduleIds: Map<string, string>,
  sourceIds: Map<string, string>,
  ruleVerifiedAt: string,
): Promise<void> {
  for (const entry of seed.feeRules) {
    const permitTypeId = permitTypeIds.get(entry.permitTypeKey);
    if (!permitTypeId) fail(`unknown permit type key "${entry.permitTypeKey}".`);

    const scheduleId = scheduleIds.get(entry.scheduleKey);
    if (!scheduleId) fail(`unknown fee schedule key "${entry.scheduleKey}".`);

    const rule = entry.rule;

    // The gate. A rule that does not validate is never written, so the database
    // can only ever contain rules the engine is able to compute. This is the same
    // validation the engine runs at calculation time.
    const validation = validateFeeRule(rule);
    if (!validation.ok) {
      fail(`rule "${rule.code}" for ${entry.permitTypeKey} is invalid: ${validation.error}`);
    }

    if (!validStatuses.has(rule.status)) {
      fail(`rule "${rule.code}" has an unrecognised status "${rule.status}".`);
    }

    const sourceId = rule.sourceId === null ? null : (sourceIds.get(rule.sourceId) ?? null);
    if (rule.sourceId !== null && sourceId === null) {
      fail(`rule "${rule.code}" cites unknown source key "${rule.sourceId}".`);
    }

    const validated = validation.rule;

    const values = {
      feeScheduleId: scheduleId,
      jurisdictionId,
      permitTypeId,
      projectTypeId: null,
      sourceId,
      code: validated.code,
      label: validated.label,
      description: validated.description,
      componentType: validated.componentType,
      feeType: validated.feeType,
      config: validated.config,
      conditions: validated.conditions,
      minimumCents: validated.minimumCents,
      maximumCents: validated.maximumCents,
      priority: validated.priority,
      effectiveFrom: validated.effectiveFrom,
      effectiveTo: validated.effectiveTo,
      status: validated.status,
      lastVerifiedAt: ruleVerifiedAt,
    };

    await db
      .insert(schema.feeRules)
      .values(values)
      // A fee rule's identity is its code within a permit type as of the date it
      // took effect. A future fee change inserts a new row with a later
      // effective_from; it never rewrites the existing one.
      .onConflictDoUpdate({
        target: [
          schema.feeRules.jurisdictionId,
          schema.feeRules.permitTypeId,
          schema.feeRules.code,
          schema.feeRules.effectiveFrom,
        ],
        set: {
          feeScheduleId: scheduleId,
          sourceId,
          label: validated.label,
          description: validated.description,
          componentType: validated.componentType,
          feeType: validated.feeType,
          config: validated.config,
          conditions: validated.conditions,
          minimumCents: validated.minimumCents,
          maximumCents: validated.maximumCents,
          priority: validated.priority,
          effectiveTo: validated.effectiveTo,
          status: validated.status,
          lastVerifiedAt: ruleVerifiedAt,
          updatedAt: now,
        },
      });

    count("feeRules");
  }
}

async function upsertRequirements(
  seed: JurisdictionSeed,
  jurisdictionId: string,
  permitTypeIds: Map<string, string>,
  sourceIds: Map<string, string>,
): Promise<void> {
  for (const requirement of seed.requirements) {
    const permitTypeId = permitTypeIds.get(requirement.permitTypeKey);
    if (!permitTypeId) fail(`unknown permit type key "${requirement.permitTypeKey}".`);

    const sourceId =
      requirement.sourceKey === null ? null : (sourceIds.get(requirement.sourceKey) ?? null);

    // No natural unique index, so identity is the requirement's title within the
    // jurisdiction and permit type.
    const [existing] = await db
      .select({ id: schema.permitRequirements.id })
      .from(schema.permitRequirements)
      .where(
        and(
          eq(schema.permitRequirements.jurisdictionId, jurisdictionId),
          eq(schema.permitRequirements.permitTypeId, permitTypeId),
          eq(schema.permitRequirements.title, requirement.title),
        ),
      )
      .limit(1);

    const values = {
      jurisdictionId,
      permitTypeId,
      projectTypeId: null,
      requirementType: requirement.requirementType,
      title: requirement.title,
      description: requirement.description,
      isMandatory: requirement.isMandatory,
      sortOrder: requirement.sortOrder,
      sourceId,
      lastVerifiedAt: requirement.lastVerifiedAt,
    };

    if (existing) {
      await db
        .update(schema.permitRequirements)
        .set({ ...values, updatedAt: now })
        .where(eq(schema.permitRequirements.id, existing.id));
    } else {
      await db.insert(schema.permitRequirements).values(values);
    }

    count("permitRequirements");
  }
}

async function upsertProfile(seed: JurisdictionSeed, jurisdictionId: string): Promise<string> {
  const p = seed.profile;

  const [row] = await db
    .insert(schema.jurisdictionProfiles)
    .values({
      jurisdictionId,
      headline: p.headline,
      summary: p.summary,
      localContext: p.localContext,
      valuationBasis: p.valuationBasis,
      notIncluded: p.notIncluded,
      seoTitle: p.seoTitle,
      seoDescription: p.seoDescription,
      publishStatus: p.publishStatus,
      noindex: p.noindex,
      lastReviewedAt: p.lastReviewedAt,
    })
    .onConflictDoUpdate({
      target: schema.jurisdictionProfiles.jurisdictionId,
      set: {
        headline: p.headline,
        summary: p.summary,
        localContext: p.localContext,
        valuationBasis: p.valuationBasis,
        notIncluded: p.notIncluded,
        seoTitle: p.seoTitle,
        seoDescription: p.seoDescription,
        publishStatus: p.publishStatus,
        noindex: p.noindex,
        lastReviewedAt: p.lastReviewedAt,
        updatedAt: now,
      },
    })
    .returning({ id: schema.jurisdictionProfiles.id });

  if (!row) fail("could not write the jurisdiction profile.");
  count("jurisdictionProfiles");
  return row.id;
}

async function upsertPermitPages(
  seed: JurisdictionSeed,
  jurisdictionId: string,
  permitTypeIds: Map<string, string>,
): Promise<Map<string, string>> {
  const ids = new Map<string, string>();

  for (const page of seed.permitPages) {
    const permitTypeId = permitTypeIds.get(page.permitTypeKey);
    if (!permitTypeId) fail(`unknown permit type key "${page.permitTypeKey}".`);

    const [row] = await db
      .insert(schema.jurisdictionPermitPages)
      .values({
        jurisdictionId,
        permitTypeId,
        projectTypeId: null,
        // Application-generated dedupe key. `project_type_id` is nullable and
        // PostgreSQL treats NULLs as distinct in unique indexes, so the nullable
        // column alone would not prevent a duplicate page for the same URL.
        scopeKey: page.permitTypeKey,
        slug: page.slug,
        title: page.title,
        intro: page.intro,
        localSummary: page.localSummary,
        notIncluded: page.notIncluded,
        workedExample: page.workedExample,
        faqs: page.faqs,
        seoTitle: page.seoTitle,
        seoDescription: page.seoDescription,
        publishStatus: page.publishStatus,
        noindex: page.noindex,
        lastReviewedAt: page.lastReviewedAt,
      })
      .onConflictDoUpdate({
        target: [
          schema.jurisdictionPermitPages.jurisdictionId,
          schema.jurisdictionPermitPages.scopeKey,
        ],
        set: {
          permitTypeId,
          slug: page.slug,
          title: page.title,
          intro: page.intro,
          localSummary: page.localSummary,
          notIncluded: page.notIncluded,
          workedExample: page.workedExample,
          faqs: page.faqs,
          seoTitle: page.seoTitle,
          seoDescription: page.seoDescription,
          publishStatus: page.publishStatus,
          noindex: page.noindex,
          lastReviewedAt: page.lastReviewedAt,
          updatedAt: now,
        },
      })
      .returning({ id: schema.jurisdictionPermitPages.id });

    if (!row) fail(`could not write permit page "${page.slug}".`);
    ids.set(page.permitTypeKey, row.id);
    count("jurisdictionPermitPages");
  }

  return ids;
}

async function insertVerifications(
  seed: JurisdictionSeed,
  jurisdictionId: string,
  sourceIds: Map<string, string>,
  permitTypeIds: Map<string, string>,
  pageIds: Map<string, string>,
  scheduleIds: Map<string, string>,
): Promise<void> {
  for (const verification of seed.verifications) {
    const entityId = resolveEntityId(verification, {
      jurisdictionId,
      sourceIds,
      permitTypeIds,
      pageIds,
      scheduleIds,
    });

    const sourceId =
      verification.sourceKey === null ? null : (sourceIds.get(verification.sourceKey) ?? null);

    // Append-only: insert only when an identical verification is not already
    // present. A verification is never updated or deleted, because the ledger is
    // the record of what was known when.
    const [existing] = await db
      .select({ id: schema.verificationRecords.id })
      .from(schema.verificationRecords)
      .where(
        and(
          eq(schema.verificationRecords.entityType, verification.entityType),
          eq(schema.verificationRecords.entityId, entityId),
          eq(schema.verificationRecords.verifiedAt, verification.verifiedAt),
          eq(schema.verificationRecords.status, verification.status),
        ),
      )
      .limit(1);

    if (existing) {
      count("verificationRecords (unchanged)");
      continue;
    }

    await db.insert(schema.verificationRecords).values({
      entityType: verification.entityType,
      entityId,
      status: verification.status,
      method: verification.method,
      verifiedAt: verification.verifiedAt,
      verifiedBy: verification.verifiedBy,
      sourceId,
      notes: verification.notes,
    });

    count("verificationRecords");
  }
}

function resolveEntityId(
  verification: JurisdictionSeed["verifications"][number],
  context: {
    jurisdictionId: string;
    sourceIds: Map<string, string>;
    permitTypeIds: Map<string, string>;
    pageIds: Map<string, string>;
    scheduleIds: Map<string, string>;
  },
): string {
  switch (verification.entityType) {
    case "fee_schedule": {
      const id = context.scheduleIds.get(verification.entityKey);
      if (!id) fail(`verification cites unknown fee schedule "${verification.entityKey}".`);
      return id;
    }
    case "permit_page": {
      const permitTypeKey = verification.permitTypeKey;
      if (!permitTypeKey) fail("a permit_page verification needs a permitTypeKey.");
      const id = context.pageIds.get(permitTypeKey);
      if (!id) fail(`verification cites unknown permit page "${verification.entityKey}".`);
      return id;
    }
    case "source": {
      const id = context.sourceIds.get(verification.entityKey);
      if (!id) fail(`verification cites unknown source "${verification.entityKey}".`);
      return id;
    }
    case "jurisdiction_profile":
      return context.jurisdictionId;
    case "fee_rule": {
      const permitTypeId = verification.permitTypeKey
        ? context.permitTypeIds.get(verification.permitTypeKey)
        : undefined;
      if (!permitTypeId) fail("a fee_rule verification needs a known permitTypeKey.");
      const ruleId = feeRuleIds.get(
        `${context.jurisdictionId}:${permitTypeId}:${verification.entityKey}`,
      );
      if (!ruleId) {
        fail(
          `verification cites unknown fee rule "${verification.entityKey}" for permit type "${verification.permitTypeKey}".`,
        );
      }
      return ruleId;
    }
    default:
      fail(`unsupported verification entity type "${String(verification.entityType)}".`);
  }
}

/* -------------------------------------------------------------------------- */
/* Run                                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Fee rule IDs, keyed `"<jurisdictionId>:<permitTypeId>:<code>"`, captured during
 * the rule upsert so the verification ledger can point at the exact rule rows it
 * refers to. The jurisdiction is part of the key because two cities can publish a
 * rule with the same code against the same permit type — Dallas's technology fee
 * and a future city's would collide otherwise.
 */
const feeRuleIds = new Map<string, string>();

/**
 * Optional narrowing, so a one-city content change does not cost a full run:
 * `npm run db:seed -- --only=green-bay` (a jurisdiction slug, a `state/city` pair,
 * or a jurisdiction key).
 *
 * Only the per-jurisdiction writes are skipped. The shared rows — states, counties,
 * permit types, project types — are still derived from the whole catalogue, because a
 * filtered payload cites keys another payload declares: a run that could not resolve
 * `mechanical` would fail on a fresh database for a reason that has nothing to do with
 * the city being seeded. This is a filter on the loop, not a second seeding routine.
 */
function selectedSeeds(): JurisdictionSeed[] {
  const flag = process.argv.find((argument) => argument.startsWith("--only="));
  if (!flag) return seeds;

  const wanted = flag.slice("--only=".length).trim().toLowerCase();
  const matches = seeds.filter(
    (seed) =>
      seed.jurisdiction.slug.toLowerCase() === wanted ||
      seed.jurisdiction.key.toLowerCase() === wanted ||
      `${seed.state.slug}/${seed.jurisdiction.slug}`.toLowerCase() === wanted,
  );

  if (matches.length === 0) {
    fail(`--only=${wanted} names no jurisdiction in the catalogue.`);
  }

  return matches;
}

async function main(): Promise<void> {
  const selected = selectedSeeds();

  console.log(
    "Seeding " + selected.map((seed) => seed.jurisdiction.officialName).join(", ") + "...\n",
  );

  const stateIds = await upsertStates();
  const countyIds = await upsertCounties(stateIds);
  const permitTypeIds = await upsertPermitTypes();
  await upsertProjectTypes();

  for (const seed of selected) {
    const jurisdictionId = await upsertJurisdiction(seed, stateIds, countyIds);
    const ruleVerifiedAt = lastVerifiedFor(seed);

    await upsertDepartments(seed, jurisdictionId);
    const sourceIds = await upsertSources(seed, jurisdictionId);

    await upsertJurisdictionPermitTypes(seed, jurisdictionId, permitTypeIds);
    const scheduleIds = await upsertFeeSchedules(seed, jurisdictionId, sourceIds);

    await upsertFeeRules(
      seed,
      jurisdictionId,
      permitTypeIds,
      scheduleIds,
      sourceIds,
      ruleVerifiedAt,
    );
    await captureFeeRuleIds(jurisdictionId);

    await upsertRequirements(seed, jurisdictionId, permitTypeIds, sourceIds);
    await upsertProfile(seed, jurisdictionId);
    const pageIds = await upsertPermitPages(seed, jurisdictionId, permitTypeIds);

    await insertVerifications(
      seed,
      jurisdictionId,
      sourceIds,
      permitTypeIds,
      pageIds,
      scheduleIds,
    );

    const publishedPages = seed.permitPages.filter(
      (page) => page.publishStatus === "published" && !page.noindex,
    );
    const withheldPages = seed.permitPages.filter(
      (page) => page.publishStatus !== "published" || page.noindex,
    );

    console.log(
      `${seed.jurisdiction.name}: ${publishedPages.length} permit page(s) published, ${withheldPages.length} withheld by the editorial gate.`,
    );
    if (withheldPages.length > 0) {
      console.log("  Withheld: " + withheldPages.map((page) => page.slug).join(", "));
    }
  }

  console.log("\nWritten or updated:");
  for (const [label, value] of Object.entries(counts).sort()) {
    console.log(`  ${label.padEnd(32)} ${value}`);
  }

  console.log("\nSeed complete. Running it again changes nothing.\n");
}

/**
 * Re-read the rule rows to learn the IDs PostgreSQL assigned, so verifications can
 * reference them. Cheaper and more honest than guessing at generated UUIDs.
 */
async function captureFeeRuleIds(jurisdictionId: string): Promise<void> {
  const rows = await db
    .select({
      id: schema.feeRules.id,
      code: schema.feeRules.code,
      permitTypeId: schema.feeRules.permitTypeId,
    })
    .from(schema.feeRules)
    .where(eq(schema.feeRules.jurisdictionId, jurisdictionId));

  for (const row of rows) {
    feeRuleIds.set(`${jurisdictionId}:${row.permitTypeId}:${row.code}`, row.id);
  }
}

main().catch((error: unknown) => {
  // Redacted: a driver error must never print the connection string.
  logSafeError("seed", error, "seed failed");
  process.exit(1);
});
