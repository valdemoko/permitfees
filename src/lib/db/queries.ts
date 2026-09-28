import "server-only";

import { and, asc, eq, inArray } from "drizzle-orm";

import type { FeeRuleRecord } from "@/lib/calc/types";
import type { FaqEntry, WorkedExample } from "@/lib/content/types";
import { parseWorkedExample } from "@/lib/content/worked-example";
import { logSafeError } from "@/lib/errors";

import { getDb, type Database } from "./client";import {
  departments,
  feeRules,
  jurisdictions,
  jurisdictionPermitPages,
  jurisdictionProfiles,
  permitRequirements,
  permitTypes,
  projectTypes,
  sources,
  states,
  verificationRecords,
  type DepartmentRow,
  type FeeRuleRow,
  type JurisdictionPermitPageRow,
  type JurisdictionRow,
  type PermitRequirementRow,
  type PermitTypeRow,
  type ProjectTypeRow,
  type SourceRow,
  type StateRow,
} from "./schema";

/**
 * Read queries for the public site.
 *
 * Two deliberate choices:
 *
 * 1. **Every query is wrapped in `safeQuery`.** A database that is unconfigured
 *    or unreachable must degrade to "we have no data for this", never to a 500
 *    served to a crawler.
 * 2. **No SQL aggregates.** We fetch slim rows and group in JavaScript. At the
 *    scale this dataset will reach (hundreds of rows, not millions) that is
 *    faster to reason about and impossible to get subtly wrong. Revisit if row
 *    counts make it matter, which will not be soon.
 */

/* -------------------------------------------------------------------------- */
/* Resilience                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Raised when the database is configured but could not be read.
 *
 * This is deliberately distinct from "the row does not exist": a failed query
 * must never be mistaken for a missing record, because the routes turn missing
 * records into 404s. During an outage every page would answer "Not Found" —
 * telling search engines and readers that published pages no longer exist.
 *
 * Throwing lets the failure reach the route's `error.tsx` boundary, which shows
 * a retry UI with a controlled 500 and never renders the message itself, so a
 * driver error that quotes the connection string cannot reach a browser.
 */
export class DatabaseUnavailableError extends Error {
  constructor(label: string) {
    super(`Database query "${label}" failed: the database could not be read.`);
    this.name = "DatabaseUnavailableError";
  }
}

export async function safeQuery<T>(
  label: string,
  run: (db: Database) => Promise<T>,
  fallback: T,
): Promise<T> {
  const db = getDb();
  // No database configured at all (fresh clone, CI): the documented degraded
  // mode still applies — there is nothing to distinguish from, and failing the
  // whole build here would punish environments that never had a database.
  if (!db) return fallback;

  try {
    return await run(db);
  } catch (error) {
    // Logged with enough context to diagnose (redacted by `logSafeError`), then
    // rethrown: a query that failed is not a query that found nothing.
    logSafeError("db", error, `query "${label}" failed`);
    throw new DatabaseUnavailableError(label);
  }
}

/* -------------------------------------------------------------------------- */
/* Row projections                                                            */
/* -------------------------------------------------------------------------- */

export function toFeeRuleRecord(row: FeeRuleRow): FeeRuleRecord {
  return {
    id: row.id,
    code: row.code,
    label: row.label,
    description: row.description,
    componentType: row.componentType,
    feeType: row.feeType,
    // The stored shape is JSONB, so it is `unknown` to the engine until the
    // engine's own Zod validation has run. That is the honest contract.
    config: row.config satisfies unknown,
    conditions: row.conditions satisfies unknown,
    minimumCents: row.minimumCents,
    maximumCents: row.maximumCents,
    priority: row.priority,
    effectiveFrom: row.effectiveFrom,
    effectiveTo: row.effectiveTo,
    status: row.status,
    sourceId: row.sourceId,
  };
}

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type StateSummary = {
  id: string;
  code: string;
  slug: string;
  name: string;
  jurisdictionCount: number;
};

export type JurisdictionSummary = {
  id: string;
  slug: string;
  name: string;
  officialName: string | null;
  type: JurisdictionRow["type"];
  permitPageCount: number;
};

export type PermitPageSummary = {
  id: string;
  slug: string;
  title: string | null;
  permitTypeName: string;
  permitTypeKey: string;
  permitCategory: PermitTypeRow["category"];
  lastReviewedAt: string | null;
};

export type JurisdictionContext = {
  state: StateRow;
  jurisdiction: JurisdictionRow;
  profile: {
    headline: string | null;
    summary: string | null;
    localContext: string | null;
    valuationBasis: string | null;
    notIncluded: string | null;
    lastReviewedAt: string | null;
  } | null;
  departments: DepartmentRow[];
  sources: SourceRow[];
};

export type PermitPageDetail = {
  /**
   * Every fee rule row for this jurisdiction + permit type, before any status
   * or effective-window filtering. The page gate uses the gap between this and
   * the active count to tell "the schedule expired" apart from "no schedule is
   * published", which are opposite editorial facts.
   */
  totalRuleCount: number;
  page: JurisdictionPermitPageRow;
  permitType: PermitTypeRow;
  projectType: ProjectTypeRow | null;
  feeRuleRecords: FeeRuleRecord[];
  requirements: PermitRequirementRow[];
  sources: SourceRow[];
  lastVerifiedAt: string | null;
  verificationCount: number;
};

export type SitemapEntry = {
  path: string;
  lastModified: string | null;
};

/** A published city, as the directory and the map need to describe it. */
export type DirectoryJurisdiction = {
  id: string;
  slug: string;
  name: string;
  officialName: string | null;
  permitPageCount: number;
};

/** A state with the published cities behind it. */
export type StateDirectoryEntry = {
  stateId: string;
  stateCode: string;
  stateSlug: string;
  stateName: string;
  jurisdictions: DirectoryJurisdiction[];
};

/**
 * What a state page's coverage section can state about one permit kind.
 *
 * Every field is a count or a date read from the database — the section is
 * deliberately not allowed to contain prose that is not derived from these
 * numbers, because a state page must never say more than its record shows.
 */
export type StateCoverageEntry = {
  permitTypeName: string;
  permitPageCount: number;
  feeRuleCount: number;
  sourceCount: number;
  lastVerifiedAt: string | null;
};

/** Everything the state page's coverage section shows, all of it counted from rows. */
export type StateCoverage = {
  jurisdictionCount: number;
  permitPageCount: number;
  feeRuleCount: number;
  sourceCount: number;
  verificationCount: number;
  oldestDocumentDate: string | null;
  newestDocumentDate: string | null;
  permitKinds: StateCoverageEntry[];
};

/* -------------------------------------------------------------------------- */
/* States and jurisdictions                                                   */
/* -------------------------------------------------------------------------- */

/**
 * States that have at least one published jurisdiction.
 *
 * A state with nothing publishable behind it is deliberately absent: it would be
 * a directory entry leading nowhere.
 */
export async function listStates(): Promise<StateSummary[]> {
  return safeQuery(
    "listStates",
    async (db) => {
      const [stateRows, published] = await Promise.all([
        db
          .select({
            id: states.id,
            code: states.code,
            slug: states.slug,
            name: states.name,
          })
          .from(states)
          .orderBy(asc(states.name)),
        db
          .select({ id: jurisdictions.id, stateId: jurisdictions.stateId })
          .from(jurisdictions)
          .innerJoin(jurisdictionProfiles, eq(jurisdictionProfiles.jurisdictionId, jurisdictions.id))
          .where(
            and(
              eq(jurisdictions.isActive, true),
              eq(jurisdictionProfiles.publishStatus, "published"),
              eq(jurisdictionProfiles.noindex, false),
            ),
          ),
      ]);

      const counts = new Map<string, number>();
      for (const row of published) {
        counts.set(row.stateId, (counts.get(row.stateId) ?? 0) + 1);
      }

      return stateRows
        .map((row) => ({ ...row, jurisdictionCount: counts.get(row.id) ?? 0 }))
        .filter((row) => row.jurisdictionCount > 0);
    },
    [],
  );
}

/**
 * The whole directory in one pass: every state, and the published cities behind
 * each one.
 *
 * This exists because the directory page renders a fifty-state map and a
 * fifty-row list, and asking for the cities of each state in turn would be a
 * fifty-query page. Three queries and a grouping in JavaScript is the same shape
 * the rest of this module uses, and it keeps the indexability predicates in one
 * place — the directory, the map and the permit routes must agree about which
 * cities exist, and they can only do that by reading the same conditions.
 *
 * States with nothing published are simply absent, which is what lets the caller
 * distinguish "available" from "not yet available" without a second query.
 */
export async function listStateDirectory(): Promise<StateDirectoryEntry[]> {
  return safeQuery(
    "listStateDirectory",
    async (db) => {
      const [stateRows, jurisdictionRows, pageRows] = await Promise.all([
        db.select().from(states).orderBy(asc(states.name)),
        db
          .select({
            id: jurisdictions.id,
            stateId: jurisdictions.stateId,
            slug: jurisdictions.slug,
            name: jurisdictions.name,
            officialName: jurisdictions.officialName,
          })
          .from(jurisdictions)
          .innerJoin(jurisdictionProfiles, eq(jurisdictionProfiles.jurisdictionId, jurisdictions.id))
          .where(
            and(
              eq(jurisdictions.isActive, true),
              eq(jurisdictionProfiles.publishStatus, "published"),
              eq(jurisdictionProfiles.noindex, false),
            ),
          )
          .orderBy(asc(jurisdictions.name)),
        db
          .select({
            jurisdictionId: jurisdictionPermitPages.jurisdictionId,
            id: jurisdictionPermitPages.id,
          })
          .from(jurisdictionPermitPages)
          .where(
            and(
              eq(jurisdictionPermitPages.publishStatus, "published"),
              eq(jurisdictionPermitPages.noindex, false),
            ),
          ),
      ]);

      const pageCounts = new Map<string, number>();
      for (const row of pageRows) {
        pageCounts.set(row.jurisdictionId, (pageCounts.get(row.jurisdictionId) ?? 0) + 1);
      }

      const byState = new Map<string, DirectoryJurisdiction[]>();
      for (const row of jurisdictionRows) {
        const list = byState.get(row.stateId) ?? [];
        list.push({
          id: row.id,
          slug: row.slug,
          name: row.name,
          officialName: row.officialName,
          permitPageCount: pageCounts.get(row.id) ?? 0,
        });
        byState.set(row.stateId, list);
      }

      return stateRows
        .map((row) => ({
          stateId: row.id,
          stateCode: row.code,
          stateSlug: row.slug,
          stateName: row.name,
          jurisdictions: byState.get(row.id) ?? [],
        }))
        .filter((entry) => entry.jurisdictions.length > 0);
    },
    [],
  );
}

export async function getStateBySlug(slug: string): Promise<StateRow | null> {
  return safeQuery(
    "getStateBySlug",
    async (db) => {
      const [row] = await db.select().from(states).where(eq(states.slug, slug)).limit(1);
      return row ?? null;
    },
    null,
  );
}

/**
 * Verifiable coverage facts for one state, for the state page's coverage
 * section.
 *
 * The section's purpose is to let a state page say precisely what its record
 * contains — how many jurisdictions, pages, fee rules and sources, and which
 * permit kinds are covered — without a single sentence of invented local
 * colour. Every number here is counted from published rows only, using the
 * same indexability predicates as the routes, so the page can never claim more
 * than a reader can click through.
 */
export async function getStateCoverage(stateId: string): Promise<StateCoverage | null> {
  return safeQuery(
    "getStateCoverage",
    async (db) => {
      const [stateRow] = await db.select().from(states).where(eq(states.id, stateId)).limit(1);
      if (!stateRow) return null;

      const jurisdictionRows = await db
        .select({ id: jurisdictions.id })
        .from(jurisdictions)
        .innerJoin(jurisdictionProfiles, eq(jurisdictionProfiles.jurisdictionId, jurisdictions.id))
        .where(
          and(
            eq(jurisdictions.stateId, stateId),
            eq(jurisdictions.isActive, true),
            eq(jurisdictionProfiles.publishStatus, "published"),
            eq(jurisdictionProfiles.noindex, false),
          ),
        );
      const jurisdictionIds = jurisdictionRows.map((row) => row.id);
      if (jurisdictionIds.length === 0) {
        return {
          jurisdictionCount: 0,
          permitPageCount: 0,
          feeRuleCount: 0,
          sourceCount: 0,
          verificationCount: 0,
          oldestDocumentDate: null,
          newestDocumentDate: null,
          permitKinds: [],
        };
      }

      const [pageRows, ruleRows, sourceRows, verificationRows] = await Promise.all([
        db
          .select({
            id: jurisdictionPermitPages.id,
            jurisdictionId: jurisdictionPermitPages.jurisdictionId,
            permitTypeName: permitTypes.name,
            lastReviewedAt: jurisdictionPermitPages.lastReviewedAt,
          })
          .from(jurisdictionPermitPages)
          .innerJoin(permitTypes, eq(permitTypes.id, jurisdictionPermitPages.permitTypeId))
          .where(
            and(
              inArray(jurisdictionPermitPages.jurisdictionId, jurisdictionIds),
              eq(jurisdictionPermitPages.publishStatus, "published"),
              eq(jurisdictionPermitPages.noindex, false),
            ),
          ),
        db
          .select({ id: feeRules.id, jurisdictionId: feeRules.jurisdictionId })
          .from(feeRules)
          .where(inArray(feeRules.jurisdictionId, jurisdictionIds)),
        db
          .select({ documentDate: sources.documentDate })
          .from(sources)
          .where(inArray(sources.jurisdictionId, jurisdictionIds)),
        db
          .select({ id: verificationRecords.id })
          .from(verificationRecords)
          .innerJoin(
            jurisdictionPermitPages,
            eq(jurisdictionPermitPages.id, verificationRecords.entityId),
          )
          .where(
            and(
              eq(verificationRecords.entityType, "permit_page"),
              inArray(jurisdictionPermitPages.jurisdictionId, jurisdictionIds),
            ),
          ),
      ]);

      // Group the published pages by permit kind so the section can list what
      // is covered, and only that.
      const kindMap = new Map<string, { pages: number; reviewed: string[] }>();
      for (const row of pageRows) {
        const entry = kindMap.get(row.permitTypeName) ?? { pages: 0, reviewed: [] };
        entry.pages += 1;
        if (row.lastReviewedAt) entry.reviewed.push(row.lastReviewedAt);
        kindMap.set(row.permitTypeName, entry);
      }

      const documentDates = sourceRows
        .map((row) => row.documentDate)
        .filter((date): date is string => date !== null)
        .sort();

      const latestReviewed = pageRows
        .map((row) => row.lastReviewedAt)
        .filter((date): date is string => date !== null)
        .sort();

      return {
        jurisdictionCount: jurisdictionIds.length,
        permitPageCount: pageRows.length,
        feeRuleCount: ruleRows.length,
        sourceCount: sourceRows.length,
        verificationCount: verificationRows.length,
        oldestDocumentDate: documentDates[0] ?? null,
        newestDocumentDate: documentDates[documentDates.length - 1] ?? null,
        permitKinds: [...kindMap.entries()]
          .map(([permitTypeName, entry]) => ({
            permitTypeName,
            permitPageCount: entry.pages,
            feeRuleCount: 0,
            sourceCount: 0,
            lastVerifiedAt:
              entry.reviewed.length > 0
                ? (entry.reviewed[entry.reviewed.length - 1] ?? null)
                : null,
          }))
          .sort((a, b) => a.permitTypeName.localeCompare(b.permitTypeName)),
      };
    },
    null,
  );
}

export async function listJurisdictionSummaries(
  stateId: string,
): Promise<JurisdictionSummary[]> {
  return safeQuery(
    "listJurisdictionSummaries",
    async (db) => {
      const [jurisdictionRows, publishedPages] = await Promise.all([
        db
          .select({
            id: jurisdictions.id,
            slug: jurisdictions.slug,
            name: jurisdictions.name,
            officialName: jurisdictions.officialName,
            type: jurisdictions.type,
          })
          .from(jurisdictions)
          .innerJoin(jurisdictionProfiles, eq(jurisdictionProfiles.jurisdictionId, jurisdictions.id))
          .where(
            and(
              eq(jurisdictions.stateId, stateId),
              eq(jurisdictions.isActive, true),
              eq(jurisdictionProfiles.publishStatus, "published"),
              eq(jurisdictionProfiles.noindex, false),
            ),
          )
          .orderBy(asc(jurisdictions.name)),
        db
          .select({
            id: jurisdictionPermitPages.id,
            jurisdictionId: jurisdictionPermitPages.jurisdictionId,
          })
          .from(jurisdictionPermitPages)
          .where(
            and(
              eq(jurisdictionPermitPages.publishStatus, "published"),
              eq(jurisdictionPermitPages.noindex, false),
            ),
          ),
      ]);

      const counts = new Map<string, number>();
      for (const row of publishedPages) {
        counts.set(row.jurisdictionId, (counts.get(row.jurisdictionId) ?? 0) + 1);
      }

      return jurisdictionRows.map((row) => ({
        ...row,
        permitPageCount: counts.get(row.id) ?? 0,
      }));
    },
    [],
  );
}

export async function getJurisdictionContext(
  stateSlug: string,
  jurisdictionSlug: string,
): Promise<JurisdictionContext | null> {
  return safeQuery(
    "getJurisdictionContext",
    async (db) => {
      const [row] = await db
        .select({ jurisdiction: jurisdictions, state: states })
        .from(jurisdictions)
        .innerJoin(states, eq(states.id, jurisdictions.stateId))
        .where(and(eq(states.slug, stateSlug), eq(jurisdictions.slug, jurisdictionSlug)))
        .limit(1);

      if (!row) return null;
      if (!row.jurisdiction.isActive) return null;

      const [profileRow] = await db
        .select()
        .from(jurisdictionProfiles)
        .where(eq(jurisdictionProfiles.jurisdictionId, row.jurisdiction.id))
        .limit(1);

      // A jurisdiction hub is only published deliberately.
      if (
        !profileRow ||
        profileRow.publishStatus !== "published" ||
        profileRow.noindex
      ) {
        return null;
      }

      const [departmentRows, sourceRows] = await Promise.all([
        db
          .select()
          .from(departments)
          .where(eq(departments.jurisdictionId, row.jurisdiction.id))
          .orderBy(asc(departments.kind)),
        db
          .select()
          .from(sources)
          .where(eq(sources.jurisdictionId, row.jurisdiction.id))
          .orderBy(asc(sources.title)),
      ]);

      return {
        state: row.state,
        jurisdiction: row.jurisdiction,
        profile: {
          headline: profileRow.headline,
          summary: profileRow.summary,
          localContext: profileRow.localContext,
          valuationBasis: profileRow.valuationBasis,
          notIncluded: profileRow.notIncluded,
          lastReviewedAt: profileRow.lastReviewedAt,
        },
        departments: departmentRows,
        sources: sourceRows,
      };
    },
    null,
  );
}

/* -------------------------------------------------------------------------- */
/* Permit pages                                                               */
/* -------------------------------------------------------------------------- */

export async function listPermitPages(jurisdictionId: string): Promise<PermitPageSummary[]> {
  return safeQuery(
    "listPermitPages",
    async (db) => {
      const rows = await db
        .select({
          id: jurisdictionPermitPages.id,
          slug: jurisdictionPermitPages.slug,
          title: jurisdictionPermitPages.title,
          lastReviewedAt: jurisdictionPermitPages.lastReviewedAt,
          permitTypeName: permitTypes.name,
          permitTypeKey: permitTypes.key,
          permitCategory: permitTypes.category,
          sortOrder: permitTypes.sortOrder,
        })
        .from(jurisdictionPermitPages)
        .innerJoin(permitTypes, eq(permitTypes.id, jurisdictionPermitPages.permitTypeId))
        .where(
          and(
            eq(jurisdictionPermitPages.jurisdictionId, jurisdictionId),
            eq(jurisdictionPermitPages.publishStatus, "published"),
            eq(jurisdictionPermitPages.noindex, false),
          ),
        )
        .orderBy(asc(permitTypes.sortOrder), asc(permitTypes.name));

      return rows.map(({ sortOrder: _sortOrder, ...page }) => page);
    },
    [],
  );
}

export async function getPermitPageDetail(
  jurisdictionId: string,
  pageSlug: string,
): Promise<PermitPageDetail | null> {
  return safeQuery(
    "getPermitPageDetail",
    async (db) => {
      const [row] = await db
        .select({
          page: jurisdictionPermitPages,
          permitType: permitTypes,
          projectType: projectTypes,
        })
        .from(jurisdictionPermitPages)
        .innerJoin(permitTypes, eq(permitTypes.id, jurisdictionPermitPages.permitTypeId))
        .leftJoin(projectTypes, eq(projectTypes.id, jurisdictionPermitPages.projectTypeId))
        .where(
          and(
            eq(jurisdictionPermitPages.jurisdictionId, jurisdictionId),
            eq(jurisdictionPermitPages.slug, pageSlug),
            eq(jurisdictionPermitPages.publishStatus, "published"),
            eq(jurisdictionPermitPages.noindex, false),
          ),
        )
        .limit(1);

      if (!row) return null;

      const [ruleRows, requirementRows, verificationRows] = await Promise.all([
        db
          .select()
          .from(feeRules)
          .where(
            and(
              eq(feeRules.jurisdictionId, jurisdictionId),
              eq(feeRules.permitTypeId, row.permitType.id),
            ),
          )
          .orderBy(asc(feeRules.priority), asc(feeRules.code)),
        db
          .select()
          .from(permitRequirements)
          .where(
            and(
              eq(permitRequirements.jurisdictionId, jurisdictionId),
              eq(permitRequirements.permitTypeId, row.permitType.id),
            ),
          )
          .orderBy(asc(permitRequirements.sortOrder), asc(permitRequirements.title)),
        db
          .select()
          .from(verificationRecords)
          .where(
            and(
              eq(verificationRecords.entityType, "permit_page"),
              eq(verificationRecords.entityId, row.page.id),
            ),
          ),
      ]);

      const sourceIds = new Set<string>();
      if (row.page.id) {
        for (const rule of ruleRows) if (rule.sourceId) sourceIds.add(rule.sourceId);
        for (const requirement of requirementRows) {
          if (requirement.sourceId) sourceIds.add(requirement.sourceId);
        }
        for (const verification of verificationRows) {
          if (verification.sourceId) sourceIds.add(verification.sourceId);
        }
      }

      const sourceRows = sourceIds.size
        ? await db
            .select()
            .from(sources)
            .where(inArray(sources.id, [...sourceIds]))
            .orderBy(asc(sources.title))
        : [];

      const verifiedDates = verificationRows
        .map((verification) => verification.verifiedAt)
        .sort();

      return {
        page: row.page,
        permitType: row.permitType,
        projectType: row.projectType,
        feeRuleRecords: ruleRows.map(toFeeRuleRecord),
        totalRuleCount: ruleRows.length,
        requirements: requirementRows,
        sources: sourceRows,
        lastVerifiedAt:
          verifiedDates.length > 0 ? (verifiedDates[verifiedDates.length - 1] ?? null) : null,
        verificationCount: verificationRows.length,
      };
    },
    null,
  );
}

/* -------------------------------------------------------------------------- */
/* Calculator                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * One permit kind a jurisdiction exposes to the calculator.
 *
 * A jurisdiction appears in the calculator's second selector only through its
 * *published* permit pages — the same rows the hub page lists — because the
 * calculator computes from the same rules those pages publish, and offering a
 * combination the site cannot calculate would contradict the pages beside it.
 */
export type CalculatorPermitOption = {
  /** Jurisdiction permit page slug, for the deep link back to the full page. */
  pageSlug: string;
  /** Page title as the hub shows it, when one is stored. */
  title: string | null;
  permitTypeName: string;
  permitTypeKey: string;
};

/** One state's entry in the calculator's first selector. */
export type CalculatorStateOption = {
  stateSlug: string;
  stateName: string;
  stateCode: string;
};

/** One jurisdiction's entry in the calculator's second selector. */
export type CalculatorJurisdictionOption = {
  jurisdictionSlug: string;
  jurisdictionName: string;
  stateSlug: string;
  stateName: string;
  stateCode: string;
  /** Every published permit kind this jurisdiction can calculate. */
  permits: CalculatorPermitOption[];
};

/**
 * The calculator's jurisdiction catalogue: every published permit page, grouped
 * by jurisdiction, in one pass.
 *
 * Three queries and a grouping in JavaScript — the same shape as
 * `listStateDirectory`, which this deliberately mirrors so the calculator, the
 * directory and the routes can never disagree about what exists. The
 * indexability predicates are the same ones every other read applies, so a
 * page the calculator offers always resolves to a real published URL.
 *
 * The client selector needs only slugs and names, so the rows are slim: the
 * fee rules themselves are fetched per jurisdiction by
 * `getCalculatorFeeRules` when one is selected, never up front.
 */
export async function listCalculatorJurisdictions(): Promise<CalculatorJurisdictionOption[]> {
  return safeQuery(
    "listCalculatorJurisdictions",
    async (db) => {
      const pageRows = await db
        .select({
          stateSlug: states.slug,
          stateName: states.name,
          stateCode: states.code,
          jurisdictionSlug: jurisdictions.slug,
          jurisdictionName: jurisdictions.name,
          pageSlug: jurisdictionPermitPages.slug,
          pageTitle: jurisdictionPermitPages.title,
          permitTypeName: permitTypes.name,
          permitTypeKey: permitTypes.key,
          permitSortOrder: permitTypes.sortOrder,
        })
        .from(jurisdictionPermitPages)
        .innerJoin(jurisdictions, eq(jurisdictions.id, jurisdictionPermitPages.jurisdictionId))
        .innerJoin(states, eq(states.id, jurisdictions.stateId))
        .innerJoin(permitTypes, eq(permitTypes.id, jurisdictionPermitPages.permitTypeId))
        .innerJoin(
          jurisdictionProfiles,
          eq(jurisdictionProfiles.jurisdictionId, jurisdictions.id),
        )
        .where(
          and(
            eq(jurisdictionPermitPages.publishStatus, "published"),
            eq(jurisdictionPermitPages.noindex, false),
            eq(jurisdictions.isActive, true),
            eq(jurisdictionProfiles.publishStatus, "published"),
            eq(jurisdictionProfiles.noindex, false),
          ),
        )
        .orderBy(asc(states.name), asc(jurisdictions.name), asc(permitTypes.sortOrder));

      const grouped = new Map<string, CalculatorJurisdictionOption>();
      for (const row of pageRows) {
        const key = `${row.stateSlug}/${row.jurisdictionSlug}`;
        let entry = grouped.get(key);
        if (!entry) {
          entry = {
            jurisdictionSlug: row.jurisdictionSlug,
            jurisdictionName: row.jurisdictionName,
            stateSlug: row.stateSlug,
            stateName: row.stateName,
            stateCode: row.stateCode,
            permits: [],
          };
          grouped.set(key, entry);
        }
        entry?.permits.push({
          pageSlug: row.pageSlug,
          title: row.pageTitle,
          permitTypeName: row.permitTypeName,
          permitTypeKey: row.permitTypeKey,
        });
      }

      return [...grouped.values()];
    },
    [],
  );
}
/** What a calculator selection needs to calculate: the rules and their source. */
export type CalculatorRuleSet = {
  /** The fee rules attached to this jurisdiction + permit type, as stored. */
  feeRuleRecords: FeeRuleRecord[];
  /** The primary source documents behind them. */
  sources: SourceRow[];
  /** The most recent verification date across those sources, if any. */
  lastVerifiedAt: string | null;
};

/**
 * The fee rules and sources for one jurisdiction + permit type, for the
 * calculator's client component.
 *
 * Mirrors `getPermitPageDetail`'s rule fetch — same filter, same ordering, same
 * `toFeeRuleRecord` projection — so the calculator computes from exactly the
 * rows the permit page would, with no second transcription and no drift. The
 * verification date comes from the sources themselves (their
 * `lastVerifiedAt`), not from the permit page's ledger, because the calculator
 * is a page in its own right and has no permit-page row to read.
 */
export async function getCalculatorRuleSet(
  jurisdictionId: string,
  permitTypeId: string,
): Promise<CalculatorRuleSet> {
  return safeQuery(
    "getCalculatorRuleSet",
    async (db) => {
      const ruleRows = await db
        .select()
        .from(feeRules)
        .where(
          and(
            eq(feeRules.jurisdictionId, jurisdictionId),
            eq(feeRules.permitTypeId, permitTypeId),
          ),
        )
        .orderBy(asc(feeRules.priority), asc(feeRules.code));

      const sourceIds = new Set<string>();
      for (const rule of ruleRows) {
        if (rule.sourceId) sourceIds.add(rule.sourceId);
      }

      const sourceRows = sourceIds.size
        ? await db
            .select()
            .from(sources)
            .where(inArray(sources.id, [...sourceIds]))
            .orderBy(asc(sources.title))
        : [];

      const verifiedDates = sourceRows
        .map((source) => source.lastVerifiedAt)
        .filter((date): date is string => date !== null)
        .sort();

      return {
        feeRuleRecords: ruleRows.map(toFeeRuleRecord),
        sources: sourceRows,
        lastVerifiedAt:
          verifiedDates.length > 0 ? (verifiedDates[verifiedDates.length - 1] ?? null) : null,
      };
    },
    { feeRuleRecords: [], sources: [], lastVerifiedAt: null },
  );
}

/* -------------------------------------------------------------------------- */
/* Sitemap                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Every URL that passes the indexability gate.
 *
 * This shares its conditions with the routes, so the sitemap can never advertise
 * a page the router would 404, and never advertise a `noindex` page.
 */
export async function listSitemapEntries(): Promise<SitemapEntry[]> {
  return safeQuery(
    "listSitemapEntries",
    async (db) => {
      const jurisdictionsWithPages = await db
        .select({
          stateSlug: states.slug,
          jurisdictionSlug: jurisdictions.slug,
          pageSlug: jurisdictionPermitPages.slug,
          lastReviewedAt: jurisdictionPermitPages.lastReviewedAt,
          updatedAt: jurisdictionPermitPages.updatedAt,
        })
        .from(jurisdictionPermitPages)
        .innerJoin(jurisdictions, eq(jurisdictions.id, jurisdictionPermitPages.jurisdictionId))
        .innerJoin(states, eq(states.id, jurisdictions.stateId))
        .innerJoin(
          jurisdictionProfiles,
          eq(jurisdictionProfiles.jurisdictionId, jurisdictions.id),
        )
        .where(
          and(
            eq(jurisdictionPermitPages.publishStatus, "published"),
            eq(jurisdictionPermitPages.noindex, false),
            eq(jurisdictions.isActive, true),
            eq(jurisdictionProfiles.publishStatus, "published"),
            eq(jurisdictionProfiles.noindex, false),
          ),
        );

      const entries: SitemapEntry[] = [];
      const stateSlugs = new Set<string>();
      const jurisdictionSlugs = new Set<string>();

      for (const row of jurisdictionsWithPages) {
        stateSlugs.add(row.stateSlug);
        jurisdictionSlugs.add(`${row.stateSlug}/${row.jurisdictionSlug}`);
        entries.push({
          path: `/${row.stateSlug}/${row.jurisdictionSlug}/${row.pageSlug}/`,
          lastModified: row.lastReviewedAt ?? row.updatedAt.toISOString().slice(0, 10),
        });
      }

      for (const key of jurisdictionSlugs) {
        entries.push({ path: `/${key}/`, lastModified: null });
      }
      for (const slug of stateSlugs) {
        entries.push({ path: `/${slug}/`, lastModified: null });
      }

      return entries;
    },
    [],
  );
}

/* -------------------------------------------------------------------------- */
/* Content helpers                                                            */
/* -------------------------------------------------------------------------- */

export function readFaqs(value: FaqEntry[] | null): FaqEntry[] {
  return Array.isArray(value) ? value : [];
}

/**
 * The worked example attached to a page, validated.
 *
 * The column is JSONB, so this is the boundary between "we stored something" and
 * "the engine can compute from it". An example that does not parse is dropped: a
 * published page loses one section rather than showing a figure derived from
 * inputs the reader cannot fully see.
 */
export function readWorkedExample(value: unknown): WorkedExample | null {
  return parseWorkedExample(value);
}
