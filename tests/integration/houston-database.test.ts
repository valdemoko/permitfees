import { sql, type SQL } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";

import { ALL_SEEDS } from "@/content";
import { houstonSeed } from "@/content/houston";
import { calculatePermitFees } from "@/lib/calc/engine";
import { validateFeeRule } from "@/lib/calc/schemas";
import { FEE_COMPONENT_TYPES, FEE_RULE_STATUSES, FEE_TYPES } from "@/lib/calc/types";
import { getDb } from "@/lib/db/client";
import {
  counties,
  departments,
  feeRules,
  feeSchedules,
  jurisdictions,
  jurisdictionPermitPages,
  jurisdictionPermitTypes,
  jurisdictionProfiles,
  permitRequirements,
  permitTypes,
  projectTypes,
  sources,
  states,
  verificationRecords,
} from "@/lib/db/schema";
import {
  getJurisdictionContext,
  getPermitPageDetail,
  listPermitPages,
  listSitemapEntries,
  toFeeRuleRecord,
} from "@/lib/db/queries";
import { evaluatePublishability } from "@/lib/editorial";

/**
 * Houston, end to end, against a real PostgreSQL database.
 *
 * This suite is skipped unless `DATABASE_URL` is set, because everything in it is
 * a claim about a database that exists. When it does run, it is the only test that
 * can answer the questions the unit tests cannot:
 *
 *   - did the migration actually create the tables, enums and unique indexes?
 *   - does the seed write exactly the payload, with no duplicates left behind?
 *   - can the engine compute from what came back out of PostgreSQL?
 *   - does the sitemap contain a URL only when the same gate lets the page exist?
 *
 * It reads through the application's own query layer, not around it. A query layer
 * that works in this test is the one the pages use.
 */

const DATABASE_URL = process.env.DATABASE_URL;
const db = getDb();

const describeWithDatabase = describe.skipIf(!DATABASE_URL);

/**
 * `db.execute` on the Neon HTTP driver returns rows, but the exact envelope has
 * changed between driver versions. Accepting both shapes keeps the test honest
 * rather than encoding an assumption about a library's internals.
 */
async function rawRows<T>(query: SQL): Promise<T[]> {
  if (!db) return [];
  const result: unknown = await db.execute(query);
  if (Array.isArray(result)) return result as T[];
  const envelope = result as { rows?: unknown };
  return Array.isArray(envelope.rows) ? (envelope.rows as T[]) : [];
}

async function countRows(table: PgTable): Promise<number> {
  if (!db) return -1;
  const [row] = await db.select({ n: sql<number>`count(*)::int` }).from(table);
  return row?.n ?? -1;
}

/** A count that has to be filtered — by jurisdiction, by entity type — not just totalled. */
async function countFor(query: SQL): Promise<number> {
  const [row] = await rawRows<{ n: number }>(query);
  return row?.n ?? -1;
}

describeWithDatabase("Houston — database", () => {
  it("has a database to test against", () => {
    expect(DATABASE_URL, "DATABASE_URL is required for the integration suite").toBeTruthy();
    expect(db, "the database client did not initialise").not.toBeNull();
  });

  /* ---------------------------------------------------------------------- */
  /* Migration                                                              */
  /* ---------------------------------------------------------------------- */

  describe("migration", () => {
    it("created every table", async () => {
      const rows = await rawRows<{ table_name: string }>(
        sql`select table_name from information_schema.tables where table_schema = 'public'`,
      );
      const present = new Set(rows.map((row) => row.table_name));

      const expected = [
        "counties",
        "departments",
        "fee_rules",
        "fee_schedules",
        "jurisdiction_permit_pages",
        "jurisdiction_permit_types",
        "jurisdiction_profiles",
        "jurisdictions",
        "permit_requirements",
        "permit_types",
        "project_types",
        "source_snapshots",
        "sources",
        "states",
        "verification_records",
      ];

      for (const table of expected) {
        expect(present, `table "${table}" is missing`).toContain(table);
      }
    });

    it("created the fee_type enum with every type the engine can compute", async () => {
      const rows = await rawRows<{ enumlabel: string }>(
        sql`select e.enumlabel
            from pg_enum e
            join pg_type t on t.oid = e.enumtypid
            where t.typname = 'fee_type'`,
      );
      const labels = rows.map((row) => row.enumlabel).sort();

      expect(labels).toEqual([...FEE_TYPES].sort());
      // Called out on its own because it is the unit Houston's schedule is written
      // in, and the one a basis-point rate cannot reproduce.
      expect(labels).toContain("per_thousand");
    });

    it("created the unique indexes the seed's upserts depend on", async () => {
      const rows = await rawRows<{ indexname: string }>(
        sql`select indexname from pg_indexes where schemaname = 'public'`,
      );
      const present = new Set(rows.map((row) => row.indexname));

      const required = [
        "states_code_uq",
        "counties_state_slug_uq",
        "jurisdictions_state_slug_uq",
        "departments_jurisdiction_kind_uq",
        "sources_url_uq",
        "permit_types_key_uq",
        "project_types_key_uq",
        "jurisdiction_permit_types_uq",
        "fee_rules_identity_uq",
        "jurisdiction_profiles_jurisdiction_uq",
        "jurisdiction_permit_pages_scope_uq",
      ];

      for (const index of required) {
        expect(present, `unique index "${index}" is missing`).toContain(index);
      }
    });
  });

  /* ---------------------------------------------------------------------- */
  /* Seed                                                                   */
  /* ---------------------------------------------------------------------- */

  describe("seed", () => {
    it("wrote exactly the payload, row for row", async () => {
      // The counts are compared against the payloads rather than hard-coded, so a
      // partial seed — a failure halfway through, a table missed in `main()` —
      // fails here instead of producing a page that is quietly missing a source.
      //
      // Two kinds of row, counted two ways. Texas and the permit catalogue are
      // shared: one row each however many cities cite them, so the expectation is
      // the de-duplicated union of every payload. Everything else belongs to one
      // jurisdiction and is counted through Houston's id, because a global count
      // of `fee_rules` would pass while Houston's own rules were missing.
      const context = await getJurisdictionContext("texas", "houston");
      expect(context).not.toBeNull();
      if (!context) return;
      const jurisdictionId = context.jurisdiction.id;

      // Every seeded payload, so the shared-table expectations below stay the
      // de-duplicated union as jurisdictions are added. Adding Phoenix moved the
      // expected states count from one to two, adding Scottsdale left it at two
      // while moving the jurisdiction count to four, and adding Nevada moved it to
      // three and six — which is the point of deriving both from the payloads
      // rather than from a number. The list itself lives in @/content, once.
      const payloads = ALL_SEEDS;
      const shared: Array<[string, PgTable, number]> = [
        ["states", states, new Set(payloads.map((seed) => seed.state.code)).size],
        // Counted as (state, slug) rather than by the payload's own `county.key`,
        // because that is what the table is keyed on — and the two are not the
        // same number: the seed list reuses `kent-county` for Michigan's Kent
        // County and Rhode Island's, which are two rows in two states. The key is
        // a handle inside one payload, not an identity across the country.
        [
          "counties",
          counties,
          new Set(payloads.map((seed) => `${seed.state.code}:${seed.county.slug}`)).size,
        ],
        ["jurisdictions", jurisdictions, payloads.length],
        [
          "permit_types",
          permitTypes,
          new Set(payloads.flatMap((seed) => seed.permitTypes.map((type) => type.key))).size,
        ],
        [
          "project_types",
          projectTypes,
          new Set(payloads.flatMap((seed) => seed.projectTypes.map((type) => type.key))).size,
        ],
      ];

      for (const [label, table, expected] of shared) {
        expect(await countRows(table), `${label} row count`).toBe(expected);
      }

      const scoped: Array<[string, number, SQL]> = [
        ["departments", houstonSeed.departments.length, sql`select count(*)::int as n from departments where jurisdiction_id = ${jurisdictionId}`],
        ["sources", houstonSeed.sources.length, sql`select count(*)::int as n from sources where jurisdiction_id = ${jurisdictionId}`],
        [
          "jurisdiction_permit_types",
          houstonSeed.jurisdictionPermitTypes.length,
          sql`select count(*)::int as n from jurisdiction_permit_types where jurisdiction_id = ${jurisdictionId}`,
        ],
        ["fee_schedules", houstonSeed.feeSchedules.length, sql`select count(*)::int as n from fee_schedules where jurisdiction_id = ${jurisdictionId}`],
        ["fee_rules", houstonSeed.feeRules.length, sql`select count(*)::int as n from fee_rules where jurisdiction_id = ${jurisdictionId}`],
        [
          "permit_requirements",
          houstonSeed.requirements.length,
          sql`select count(*)::int as n from permit_requirements where jurisdiction_id = ${jurisdictionId}`,
        ],
        ["jurisdiction_profiles", 1, sql`select count(*)::int as n from jurisdiction_profiles where jurisdiction_id = ${jurisdictionId}`],
        [
          "jurisdiction_permit_pages",
          houstonSeed.permitPages.length,
          sql`select count(*)::int as n from jurisdiction_permit_pages where jurisdiction_id = ${jurisdictionId}`,
        ],
        [
          "verification_records",
          houstonSeed.verifications.length,
          // The ledger has no jurisdiction column by design: it points at the
          // entity it verifies. So a record belongs to Houston when the entity is
          // one of Houston's, in whichever table that entity lives.
          sql`select count(*)::int as n from verification_records v where
                (v.entity_type = 'permit_page' and v.entity_id in (select id from jurisdiction_permit_pages where jurisdiction_id = ${jurisdictionId}))
                or (v.entity_type = 'fee_schedule' and v.entity_id in (select id from fee_schedules where jurisdiction_id = ${jurisdictionId}))
                or (v.entity_type = 'fee_rule' and v.entity_id in (select id from fee_rules where jurisdiction_id = ${jurisdictionId}))
                or (v.entity_type = 'source' and v.entity_id in (select id from sources where jurisdiction_id = ${jurisdictionId}))
                or (v.entity_type = 'requirement' and v.entity_id in (select id from permit_requirements where jurisdiction_id = ${jurisdictionId}))
                or (v.entity_type = 'jurisdiction_profile' and v.entity_id = ${jurisdictionId})`,
        ],
      ];

      for (const [label, expected, query] of scoped) {
        expect(await countFor(query), `${label} row count`).toBe(expected);
      }
    });

    it("left no duplicate on any natural key", async () => {
      // These are the keys the seed upserts on. A duplicate means the second run
      // inserted instead of updating, which is the failure mode "idempotent" is
      // supposed to rule out.
      const keys: Array<[string, SQL]> = [
        [
          "fee_rules",
          sql`select count(*)::int as n from (
                select jurisdiction_id, permit_type_id, code, effective_from
                from fee_rules group by 1, 2, 3, 4 having count(*) > 1
              ) d`,
        ],
        [
          "jurisdiction_permit_pages",
          sql`select count(*)::int as n from (
                select jurisdiction_id, scope_key from jurisdiction_permit_pages
                group by 1, 2 having count(*) > 1
              ) d`,
        ],
        [
          "sources",
          sql`select count(*)::int as n from (
                select url from sources group by 1 having count(*) > 1
              ) d`,
        ],
        [
          "verification_records",
          sql`select count(*)::int as n from (
                select entity_type, entity_id, verified_at, status from verification_records
                group by 1, 2, 3, 4 having count(*) > 1
              ) d`,
        ],
        [
          "fee_schedules",
          sql`select count(*)::int as n from (
                select jurisdiction_id, title, effective_from from fee_schedules
                group by 1, 2, 3 having count(*) > 1
              ) d`,
        ],
      ];

      for (const [label, query] of keys) {
        const [row] = await rawRows<{ n: number }>(query);
        expect(row?.n, `${label} has duplicate natural keys`).toBe(0);
      }
    });

    it("links every jurisdiction to a county in its own state", async () => {
      // The guard for the bug this assertion was written after. The seed resolved
      // its county keys through one map keyed on the payload's own `county.key`,
      // so the second state to declare a Kent County overwrote the first and
      // Grand Rapids (Michigan) was linked to Kent County, Rhode Island. Every
      // row count in this file still passed; only the link was wrong, and only a
      // cross-state check can see it.
      const strays = await rawRows<{ jurisdiction: string; county: string }>(
        sql`select js.code || '/' || j.slug as jurisdiction, cs.code || '/' || c.slug as county
            from jurisdictions j
            join states js on js.id = j.state_id
            join counties c on c.id = j.county_id
            join states cs on cs.id = c.state_id
            where js.code <> cs.code`,
      );

      expect(strays.map((row) => `${row.jurisdiction} -> ${row.county}`)).toEqual([]);
    });
  });

  /* ---------------------------------------------------------------------- */
  /* Engine <-> database                                                    */
  /* ---------------------------------------------------------------------- */

  describe("stored rules are rules the engine can compute", () => {
    it("recognises every enum value the database contains", async () => {
      const context = await getJurisdictionContext("texas", "houston");
      expect(context).not.toBeNull();
      if (!context) return;

      const rows = await rawRows<{ fee_type: string; component_type: string; status: string }>(
        sql`select fee_type, component_type, status from fee_rules
            where jurisdiction_id = ${context.jurisdiction.id}`,
      );

      expect(rows.length).toBe(houstonSeed.feeRules.length);

      for (const row of rows) {
        expect(FEE_TYPES as readonly string[]).toContain(row.fee_type);
        expect(FEE_COMPONENT_TYPES as readonly string[]).toContain(row.component_type);
        expect(FEE_RULE_STATUSES as readonly string[]).toContain(row.status);
      }
    });

    it("passes every stored rule through the engine's own validation", async () => {
      if (!db) return;

      const stored = await db.select().from(feeRules);

      for (const row of stored) {
        const validation = validateFeeRule(toFeeRuleRecord(row));
        expect(validation.ok, `${row.code} failed validation: ${JSON.stringify(validation)}`).toBe(
          true,
        );
      }
    });

    it("resolves every rule's source and jurisdiction", async () => {
      const orphans = await rawRows<{ n: number }>(
        sql`select count(*)::int as n
            from fee_rules r
            left join sources s on s.id = r.source_id
            left join jurisdictions j on j.id = r.jurisdiction_id
            where (r.source_id is not null and s.id is null) or j.id is null`,
      );
      expect(orphans[0]?.n).toBe(0);
    });
  });

  /* ---------------------------------------------------------------------- */
  /* Pages, gate, calculation                                               */
  /* ---------------------------------------------------------------------- */

  describe("published pages", () => {
    it("resolves Houston through the query layer", async () => {
      const context = await getJurisdictionContext("texas", "houston");

      expect(context).not.toBeNull();
      expect(context?.state.code).toBe("TX");
      expect(context?.jurisdiction.slug).toBe("houston");
      expect(context?.sources.length).toBeGreaterThan(0);
    });

    it("serves exactly the three published permit pages", async () => {
      const context = await getJurisdictionContext("texas", "houston");
      expect(context).not.toBeNull();
      if (!context) return;

      const pages = await listPermitPages(context.jurisdiction.id);
      expect(pages.map((page) => page.slug).sort()).toEqual([
        "building-permit-cost",
        "electrical-permit-cost",
        "plumbing-permit-cost",
      ]);
    });

    it("404s the pages Phase 1 withdrew, and has no data for roofing", async () => {
      const context = await getJurisdictionContext("texas", "houston");
      expect(context).not.toBeNull();
      if (!context) return;

      // Withdrawn by their own publish status, so the query layer never returns
      // them and the route reaches `notFound()`.
      expect(await getPermitPageDetail(context.jurisdiction.id, "mechanical-permit-cost")).toBeNull();
      expect(await getPermitPageDetail(context.jurisdiction.id, "demolition-permit-cost")).toBeNull();

      // Never researched, so there is no row at all.
      expect(await getPermitPageDetail(context.jurisdiction.id, "roofing-permit-cost")).toBeNull();
    });

    it("passes the editorial gate for each published page", async () => {
      const context = await getJurisdictionContext("texas", "houston");
      expect(context).not.toBeNull();
      if (!context) return;

      for (const slug of [
        "building-permit-cost",
        "electrical-permit-cost",
        "plumbing-permit-cost",
      ]) {
        const detail = await getPermitPageDetail(context.jurisdiction.id, slug);
        expect(detail, `${slug} did not resolve`).not.toBeNull();
        if (!detail) continue;

        const gate = evaluatePublishability({
          publishStatus: detail.page.publishStatus,
          noindex: detail.page.noindex,
          intro: detail.page.intro,
          localSummary: detail.page.localSummary,
          sourceCount: detail.sources.length,
          feeRuleCount: detail.feeRuleRecords.length,
          lastVerifiedAt: detail.lastVerifiedAt,
          faqCount: Array.isArray(detail.page.faqs) ? detail.page.faqs.length : 0,
          asOf: new Date().toISOString().slice(0, 10),
        });

        expect(gate.publishable, `${slug} is not publishable: ${JSON.stringify(gate.failures)}`).toBe(
          true,
        );
        expect(detail.sources.length).toBeGreaterThan(0);
        expect(detail.lastVerifiedAt).toBeTruthy();
      }
    });

    it("computes the published figures from the rules PostgreSQL returned", async () => {
      const context = await getJurisdictionContext("texas", "houston");
      expect(context).not.toBeNull();
      if (!context) return;

      const detail = await getPermitPageDetail(context.jurisdiction.id, "building-permit-cost");
      expect(detail).not.toBeNull();
      if (!detail) return;

      const rules = detail.feeRuleRecords;
      const asOf = new Date().toISOString().slice(0, 10);

      expect(calculatePermitFees({ asOf, valuationCents: 10_000_000 }, rules).totalCents).toBe(54_548);
      expect(calculatePermitFees({ asOf, valuationCents: 40_000_000 }, rules).totalCents).toBe(197_283);

      const electrical = await getPermitPageDetail(
        context.jurisdiction.id,
        "electrical-permit-cost",
      );
      expect(
        electrical &&
          calculatePermitFees({ asOf, custom: { outlets: 40 } }, electrical.feeRuleRecords)
            .totalCents,
      ).toBe(14_760);

      const plumbing = await getPermitPageDetail(context.jurisdiction.id, "plumbing-permit-cost");
      expect(
        plumbing &&
          calculatePermitFees({ asOf, fixtures: 10 }, plumbing.feeRuleRecords).totalCents,
      ).toBe(11_411);
    });

    it("computes each published example from its own stored inputs", async () => {
      const context = await getJurisdictionContext("texas", "houston");
      expect(context).not.toBeNull();
      if (!context) return;

      const asOf = new Date().toISOString().slice(0, 10);
      const expected: Record<string, number> = {
        "building-permit-cost": 197_283,
        "electrical-permit-cost": 14_760,
        "plumbing-permit-cost": 11_411,
      };

      for (const [slug, total] of Object.entries(expected)) {
        const detail = await getPermitPageDetail(context.jurisdiction.id, slug);
        expect(detail, `${slug} did not resolve`).not.toBeNull();
        if (!detail) continue;

        const example = detail.page.workedExample as { inputs?: Record<string, unknown> } | null;
        expect(example?.inputs, `${slug} has no stored example inputs`).toBeTruthy();
        if (!example?.inputs) continue;

        const result = calculatePermitFees(
          { ...(example.inputs as Record<string, never>), asOf },
          detail.feeRuleRecords,
        );
        expect(result.totalCents, `${slug} example total`).toBe(total);
        expect(result.components.length).toBeGreaterThan(0);
      }
    });
  });

  /* ---------------------------------------------------------------------- */
  /* Sitemap and indexability                                               */
  /* ---------------------------------------------------------------------- */

  describe("sitemap", () => {
    it("lists the pages the gate allows and nothing else", async () => {
      const entries = await listSitemapEntries();
      const paths = entries.map((entry) => entry.path);

      expect(paths).toContain("/texas/");
      expect(paths).toContain("/texas/houston/");
      expect(paths).toContain("/texas/houston/building-permit-cost/");
      expect(paths).toContain("/texas/houston/electrical-permit-cost/");
      expect(paths).toContain("/texas/houston/plumbing-permit-cost/");

      // Scoped to Houston's own URLs: the slugs are generic, so a bare substring check
      // would also fail for a jurisdiction that legitimately publishes one of them —
      // Lincoln publishes a mechanical page, and its absence here is Houston's fact, not
      // a site-wide one.
      const houstonPaths = paths.filter((path) => path.startsWith("/texas/houston/"));
      for (const withheld of [
        "mechanical-permit-cost",
        "demolition-permit-cost",
        "roofing-permit-cost",
      ]) {
        expect(
          houstonPaths.join("\n"),
          `Houston's ${withheld} must not be in the sitemap`,
        ).not.toContain(withheld);
      }
    });

    it("uses the same criterion as the routes", async () => {
      // The sitemap and the page template must not disagree about whether a URL
      // exists. Each URL the sitemap lists is re-resolved through the query layer
      // the route uses, so a URL in the sitemap that would 404 fails here.
      const context = await getJurisdictionContext("texas", "houston");
      expect(context).not.toBeNull();
      if (!context) return;

      const entries = await listSitemapEntries();
      const paths = entries.map((entry) => entry.path);
      const prefix = `/${context.state.slug}/${context.jurisdiction.slug}/`;

      // Everything the sitemap lists below the jurisdiction prefix is a permit
      // page. The prefix itself *is* the hub, so it is excluded rather than
      // turned into a slug — its remainder is the empty string. Deriving the
      // prefix from the resolved slugs keeps this honest for the second city
      // instead of hard-coding Texas.
      const permitSlugs = paths
        .filter((path) => path.startsWith(prefix))
        .map((path) => path.slice(prefix.length).replace(/\/$/, ""))
        .filter((slug) => slug.length > 0);

      expect(permitSlugs.length).toBeGreaterThan(0);

      for (const slug of permitSlugs) {
        const detail = await getPermitPageDetail(context.jurisdiction.id, slug);
        expect(detail, `sitemap lists ${slug} but the route cannot resolve it`).not.toBeNull();
      }

      // The hub the sitemap lists is not a permit page, so it is checked against
      // the query the hub route uses.
      expect(paths).toContain(prefix);
    });
  });
});
