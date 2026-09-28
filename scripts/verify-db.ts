import { neon } from "@neondatabase/serverless";

import { ALL_PUBLISHED_PERMIT_PAGES, ALL_SEEDS } from "@/content";
import { calculatePermitFees } from "@/lib/calc/engine";
import { validateFeeRule } from "@/lib/calc/schemas";
import { PER_UNIT_KINDS } from "@/lib/calc/types";
import { getPermitPageDetail, getJurisdictionContext, listSitemapEntries } from "@/lib/db/queries";

import { loadEnvFiles } from "./load-env";

/**
 * Read-only verification of the live database.
 *
 * This exists because "the migration file exists" and "the seed script has no
 * syntax errors" are not evidence. Every number this prints comes from a query
 * against the real database, and every fee figure is recomputed through the same
 * query layer the pages use, not from a fixture.
 *
 * It writes nothing. Safe to run against any environment.
 *
 * Usage: `npm run db:verify` (requires DATABASE_URL).
 */

const { files } = loadEnvFiles();
const url = process.env.DATABASE_URL;

if (!url) {
  console.error("DATABASE_URL is not set. Loaded environment from:", files.join(", ") || "(none)");
  process.exit(1);
}

// Raw client rather than the app's Drizzle client: the point of some of these
// checks is to see the catalogue itself, which Drizzle's schema does not expose.
const sql = neon(url);
const rows = async <T>(text: string, params: unknown[] = []): Promise<T[]> =>
  (await (sql.query as (t: string, p: unknown[]) => Promise<unknown>)(text, params)) as T[];

const one = async <T>(text: string, params: unknown[] = []): Promise<T | undefined> =>
  (await rows<T>(text, params))[0];

let failures = 0;
const ok = (label: string, value: string): void => console.log(`  ok    ${label}: ${value}`);
const bad = (label: string, value: string): void => {
  failures += 1;
  console.log(`  FAIL  ${label}: ${value}`);
};
const check = (label: string, pass: boolean, value: string): void =>
  pass ? ok(label, value) : bad(label, value);

const section = (title: string): void => console.log(`\n## ${title}`);

async function main(): Promise<void> {
  /* ---------------------------------------------------------------------- */
  /* Schema                                                                 */
  /* ---------------------------------------------------------------------- */

  section("Migration: what actually exists in the database");

  const tables = await rows<{ table_name: string }>(
    "select table_name from information_schema.tables where table_schema = 'public' order by 1",
  );
  const expectedTables = [
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
  const tableNames = tables.map((t) => t.table_name);
  const missingTables = expectedTables.filter((t) => !tableNames.includes(t));
  check("tables", missingTables.length === 0, `${tableNames.length} present, missing: ${missingTables.join(", ") || "none"}`);

  const fees = await rows<{ enumlabel: string }>(
    `select e.enumlabel from pg_enum e join pg_type t on t.oid = e.enumtypid
     where t.typname = 'fee_type' order by e.enumsortorder`,
  );
  const feeLabels = fees.map((f) => f.enumlabel);
  check("fee_type enum", feeLabels.includes("per_thousand"), feeLabels.join(", "));

  const enums = await rows<{ typname: string; n: number }>(
    `select t.typname, count(*)::int as n from pg_enum e join pg_type t on t.oid = e.enumtypid
     group by 1 order by 1`,
  );
  ok("enums", `${enums.length} defined`);

  const indexes = await rows<{ indexname: string }>(
    "select indexname from pg_indexes where schemaname = 'public' order by 1",
  );
  const unique = indexes.filter((i) => i.indexname.endsWith("_uq")).map((i) => i.indexname);
  check("unique indexes", unique.length >= 11, unique.join(", "));

  const constraints = await one<{ n: number }>(
    `select count(*)::int as n from information_schema.table_constraints
     where constraint_schema = 'public' and constraint_type = 'FOREIGN KEY'`,
  );
  ok("foreign keys", String(constraints?.n ?? 0));

  /* ---------------------------------------------------------------------- */
  /* Row counts                                                             */
  /* ---------------------------------------------------------------------- */

  section("Seed: real row counts");

  const counts: Record<string, number> = {};
  for (const table of expectedTables) {
    const [row] = await rows<{ n: number }>(`select count(*)::int as n from "${table}"`);
    counts[table] = row?.n ?? -1;
  }
  for (const [table, n] of Object.entries(counts)) console.log(`        ${table.padEnd(28)} ${n}`);

  for (const table of ["states", "jurisdictions", "jurisdiction_profiles", "sources", "fee_rules"]) {
    const n = counts[table] ?? 0;
    if (n < 1) bad(table, `expected at least one row, found ${n}`);
  }

  /* ---------------------------------------------------------------------- */
  /* Houston                                                                */
  /* ---------------------------------------------------------------------- */

  section("Houston: what the rows actually say");

  const houston = await one<{ id: string; state: string; type: string }>(
    `select j.id, s.name as state, j.type::text as type
     from jurisdictions j join states s on s.id = j.state_id where j.slug = 'houston'`,
  );
  if (!houston) {
    bad("Houston", "no jurisdiction row");
    process.exit(1);
  }
  ok("jurisdiction", `state=${houston.state} type=${houston.type} (id redacted)`);

  const deptRows = await rows<{ kind: string; name: string }>(
    `select kind::text as kind, name from departments where jurisdiction_id = $1 order by 1`,
    [houston.id],
  );
  ok("departments", deptRows.map((d) => `${d.kind}=${d.name}`).join(" | ") || "(none)");

  const permitRows = await rows<{ key: string; status: string; noindex: boolean }>(
    `select pt.key, p.publish_status::text as status, p.noindex
     from jurisdiction_permit_pages p join permit_types pt on pt.id = p.permit_type_id
     where p.jurisdiction_id = $1 order by pt.key`,
    [houston.id],
  );
  for (const p of permitRows) {
    console.log(`        page ${p.key.padEnd(12)} ${p.status.padEnd(10)} noindex=${p.noindex}`);
  }

  const byStatus = await rows<{ status: string; n: number }>(
    `select status::text as status, count(*)::int as n from fee_rules
     where jurisdiction_id = $1 group by 1 order by 1`,
    [houston.id],
  );
  ok("fee rules by status", byStatus.map((r) => `${r.status}=${r.n}`).join(", "));

  const byType = await rows<{ fee_type: string; n: number }>(
    `select fee_type::text as fee_type, count(*)::int as n from fee_rules
     where jurisdiction_id = $1 group by 1 order by 2 desc`,
    [houston.id],
  );
  ok("fee rules by fee_type", byType.map((r) => `${r.fee_type}=${r.n}`).join(", "));

  const verification = await rows<{ status: string; entity: string; n: number }>(
    `select status::text as status, entity_type::text as entity, count(*)::int as n
     from verification_records group by 1, 2 order by 1, 2`,
  );
  ok("verifications", verification.map((v) => `${v.entity}/${v.status}=${v.n}`).join(", ") || "(none)");

  /* ---------------------------------------------------------------------- */
  /* Dallas                                                                 */
  /* ---------------------------------------------------------------------- */

  section("Dallas: what the rows actually say");

  const dallas = await one<{ id: string; state: string }>(
    `select j.id, s.name as state
     from jurisdictions j join states s on s.id = j.state_id where j.slug = 'dallas'`,
  );
  if (!dallas) {
    bad("Dallas", "no jurisdiction row");
    process.exit(1);
  }
  ok("jurisdiction", `state=${dallas.state} (id redacted)`);

  const dallasDepts = await rows<{ kind: string; name: string; phone: string | null }>(
    `select kind::text as kind, name, phone from departments where jurisdiction_id = $1 order by 1`,
    [dallas.id],
  );
  ok(
    "departments",
    dallasDepts.map((d) => `${d.kind}=${d.name} (phone=${d.phone ?? "none recorded"})`).join(" | ") ||
      "(none)",
  );

  const dallasPages = await rows<{ key: string; status: string; noindex: boolean }>(
    `select pt.key, p.publish_status::text as status, p.noindex
     from jurisdiction_permit_pages p join permit_types pt on pt.id = p.permit_type_id
     where p.jurisdiction_id = $1 order by pt.key`,
    [dallas.id],
  );
  for (const p of dallasPages) {
    console.log(`        page ${p.key.padEnd(12)} ${p.status.padEnd(10)} noindex=${p.noindex}`);
  }

  const dallasByStatus = await rows<{ status: string; n: number }>(
    `select status::text as status, count(*)::int as n from fee_rules
     where jurisdiction_id = $1 group by 1 order by 1`,
    [dallas.id],
  );
  ok("fee rules by status", dallasByStatus.map((r) => `${r.status}=${r.n}`).join(", "));

  const dallasByType = await rows<{ fee_type: string; n: number }>(
    `select fee_type::text as fee_type, count(*)::int as n from fee_rules
     where jurisdiction_id = $1 group by 1 order by 2 desc`,
    [dallas.id],
  );
  ok("fee rules by fee_type", dallasByType.map((r) => `${r.fee_type}=${r.n}`).join(", "));

  const dallasExactRates = await rows<{ code: string }>(
    `select code from fee_rules
     where jurisdiction_id = $1 and fee_type = 'percent' and config ? 'rate' order by 1`,
    [dallas.id],
  );
  ok(
    "rules using an exact rational rate",
    `${dallasExactRates.length}: ${dallasExactRates.map((r) => r.code).join(", ")}`,
  );

  const dallasVerifications = await rows<{ status: string; entity: string; n: number }>(
    `select v.status::text as status, v.entity_type::text as entity, count(*)::int as n
     from verification_records v
     join jurisdictions j on j.id = v.entity_id and v.entity_type = 'jurisdiction_profile'
     where j.slug = 'dallas' group by 1, 2`,
  );
  ok(
    "verifications attached to Dallas",
    dallasVerifications.map((v) => `${v.entity}/${v.status}=${v.n}`).join(", ") ||
      "(none directly; rules and sources are verified by entity id)",
  );

  const dallasDisputed = await rows<{ code: string; status: string }>(
    `select r.code, r.status::text as status from fee_rules r
     where r.jurisdiction_id = $1 and r.code = 'PLAN-REVIEW-303' order by 1`,
    [dallas.id],
  );
  check(
    "the disputed plan review rule ships as draft everywhere",
    dallasDisputed.length > 0 && dallasDisputed.every((r) => r.status === "draft"),
    dallasDisputed.map((r) => `${r.code}=${r.status}`).join(", ") || "missing",
  );

  /* ---------------------------------------------------------------------- */
  /* Phoenix                                                                */
  /* ---------------------------------------------------------------------- */

  section("Phoenix: what the rows actually say");

  const phoenix = await one<{ id: string; state: string }>(
    `select j.id, s.name as state
     from jurisdictions j join states s on s.id = j.state_id where j.slug = 'phoenix'`,
  );
  if (!phoenix) {
    bad("Phoenix", "no jurisdiction row");
    process.exit(1);
  }
  ok("jurisdiction", `state=${phoenix.state} (id redacted)`);

  const phoenixDepts = await rows<{ kind: string; name: string; phone: string | null }>(
    `select kind::text as kind, name, phone from departments where jurisdiction_id = $1 order by 1`,
    [phoenix.id],
  );
  ok(
    "departments",
    phoenixDepts.map((d) => `${d.kind}=${d.name} (phone=${d.phone ?? "none recorded"})`).join(" | ") ||
      "(none)",
  );

  const phoenixPages = await rows<{ key: string; status: string; noindex: boolean }>(
    `select pt.key, p.publish_status::text as status, p.noindex
     from jurisdiction_permit_pages p join permit_types pt on pt.id = p.permit_type_id
     where p.jurisdiction_id = $1 order by pt.key`,
    [phoenix.id],
  );
  for (const p of phoenixPages) {
    console.log(`        page ${p.key.padEnd(12)} ${p.status.padEnd(10)} noindex=${p.noindex}`);
  }

  const phoenixByType = await rows<{ fee_type: string; n: number }>(
    `select fee_type::text as fee_type, count(*)::int as n from fee_rules
     where jurisdiction_id = $1 group by 1 order by 2 desc`,
    [phoenix.id],
  );
  ok("fee rules by fee_type", phoenixByType.map((r) => `${r.fee_type}=${r.n}`).join(", "));

  // The capability Phoenix needed: a component priced against the permit fee it is
  // added to. Nothing else in the database should use it, so the count is stated.
  const permitFeeBasisRules = await rows<{ code: string; basis: string }>(
    `select code, config->>'basis' as basis from fee_rules
     where config->>'basis' = 'permit_fee' order by 1`,
  );
  ok(
    "rules priced against the calculated permit fee",
    permitFeeBasisRules.length
      ? `${permitFeeBasisRules.length}: ${permitFeeBasisRules.map((r) => r.code).join(", ")}`
      : "none",
  );

  /* ---------------------------------------------------------------------- */
  /* Integrity                                                              */
  /* ---------------------------------------------------------------------- */

  section("Integrity: can the engine compute every stored rule?");

  const stored = await rows<{
    id: string;
    code: string;
    label: string;
    description: string | null;
    component_type: string;
    fee_type: string;
    config: unknown;
    conditions: unknown;
    minimum_cents: number | null;
    maximum_cents: number | null;
    priority: number;
    effective_from: string;
    effective_to: string | null;
    status: string;
    source_id: string | null;
  }>("select * from fee_rules");

  let invalid = 0;
  const unitKinds = new Set<string>();
  for (const row of stored) {
    const validation = validateFeeRule({
      id: row.id,
      code: row.code,
      label: row.label,
      description: row.description,
      componentType: row.component_type as never,
      feeType: row.fee_type as never,
      config: row.config,
      conditions: row.conditions,
      minimumCents: row.minimum_cents,
      maximumCents: row.maximum_cents,
      priority: row.priority,
      effectiveFrom: row.effective_from,
      effectiveTo: row.effective_to,
      status: row.status as never,
      sourceId: row.source_id,
    });
    if (row.fee_type === "per_unit") {
      unitKinds.add((row.config as { unit?: string }).unit ?? "(missing)");
    }
    if (!validation.ok) {
      invalid += 1;
      bad(`rule ${row.code}`, validation.error);
    }
  }
  check("engine validation of stored rules", invalid === 0, `${stored.length} rules, ${invalid} invalid`);

  const unknownUnits = [...unitKinds].filter((u) => !(PER_UNIT_KINDS as readonly string[]).includes(u));
  check("per_unit unit kinds", unknownUnits.length === 0, `${unitKinds.size} distinct: ${[...unitKinds].join(", ")}`);

  const orphanSources = await one<{ n: number }>(
    `select count(*)::int as n from fee_rules r
     where (r.source_id is not null and not exists (select 1 from sources s where s.id = r.source_id))
        or not exists (select 1 from jurisdictions j where j.id = r.jurisdiction_id)
        or not exists (select 1 from permit_types p where p.id = r.permit_type_id)`,
  );
  check("rule → source/jurisdiction/permit_type", (orphanSources?.n ?? 1) === 0, `${orphanSources?.n ?? "?"} orphans`);

  const rulesWithoutSource = await one<{ n: number }>(
    `select count(*)::int as n from fee_rules where source_id is null`,
  );
  ok("rules without a source", String(rulesWithoutSource?.n ?? "?"));

  const duplicates = await one<{ n: number }>(
    `select count(*)::int as n from (
       select jurisdiction_id, permit_type_id, code, effective_from from fee_rules
       group by 1, 2, 3, 4 having count(*) > 1) d`,
  );
  check("duplicate rule identity", (duplicates?.n ?? 1) === 0, `${duplicates?.n ?? "?"} duplicates`);

  const duplicatePages = await one<{ n: number }>(
    `select count(*)::int as n from (
       select jurisdiction_id, scope_key from jurisdiction_permit_pages
       group by 1, 2 having count(*) > 1) d`,
  );
  check("duplicate page scope_key", (duplicatePages?.n ?? 1) === 0, `${duplicatePages?.n ?? "?"} duplicates`);

  const duplicateVerifications = await one<{ n: number }>(
    `select count(*)::int as n from (
       select entity_type, entity_id, verified_at, status from verification_records
       group by 1, 2, 3, 4 having count(*) > 1) d`,
  );
  check("duplicate verification rows", (duplicateVerifications?.n ?? 1) === 0, `${duplicateVerifications?.n ?? "?"} duplicates`);

  const ruleSchedules = await one<{ n: number }>(
    `select count(*)::int as n from fee_rules r
     left join fee_schedules s on s.id = r.fee_schedule_id
     where r.fee_schedule_id is null or s.id is null`,
  );
  check("rules attached to a schedule", (ruleSchedules?.n ?? 1) === 0, `${ruleSchedules?.n ?? "?"} unattached`);

  /* ---------------------------------------------------------------------- */
  /* Four calculations, through the app's query layer                       */
  /* ---------------------------------------------------------------------- */

  section("Calculation: four published figures, recomputed from PostgreSQL rules");

  const context = await getJurisdictionContext("texas", "houston");
  if (!context) {
    bad("query layer", "getJurisdictionContext returned null");
    process.exit(1);
  }
  ok("query layer", `Texas → ${context.jurisdiction.name}, ${context.sources.length} sources`);

  const asOf = new Date().toISOString().slice(0, 10);

  const scenarios: Array<{
    slug: string;
    label: string;
    input: { valuationCents?: number; fixtures?: number; custom?: Record<string, number> };
    expected: number;
  }> = [
    { slug: "building-permit-cost", label: "valuation $100,000", input: { valuationCents: 10_000_000 }, expected: 54_548 },
    { slug: "building-permit-cost", label: "valuation $400,000", input: { valuationCents: 40_000_000 }, expected: 197_283 },
    { slug: "plumbing-permit-cost", label: "10 fixtures", input: { fixtures: 10 }, expected: 11_411 },
    { slug: "electrical-permit-cost", label: "meter loop + 40 outlets", input: { custom: { outlets: 40 } }, expected: 14_760 },
  ];

  for (const scenario of scenarios) {
    const detail = await getPermitPageDetail(context.jurisdiction.id, scenario.slug);
    if (!detail) {
      bad(scenario.slug, "page did not resolve");
      continue;
    }
    const result = calculatePermitFees({ asOf, ...scenario.input }, detail.feeRuleRecords);
    const pass = result.totalCents === scenario.expected;
    const cents = (c: number): string => `$${(c / 100).toFixed(2)}`;
    check(
      `${scenario.slug} — ${scenario.label}`,
      pass,
      `computed ${cents(result.totalCents)}, published ${cents(scenario.expected)}, ` +
        `${result.components.length} components, ${result.excluded.length} excluded`,
    );
    if (pass) {
      for (const component of result.components) {
        console.log(`          + ${cents(component.amountCents).padStart(12)}  ${component.code}  ${component.formula}`);
      }
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Dallas: the City's own worked examples, recomputed                     */
  /* ---------------------------------------------------------------------- */

  /**
   * The strongest check in this file.
   *
   * The City of Dallas publishes five estimate worksheets with worked examples.
   * Each of the three below is recomputed from the rules read out of PostgreSQL,
   * and each is compared against the number printed in the City's own document —
   * including the plan review line this site refuses to charge, added back from
   * the same stored rule with its draft status lifted, purely to prove that the
   * difference between our total and the City's is exactly that line.
   */
  section("Dallas: the City's own worked examples, recomputed from PostgreSQL");

  const dallasContext = await getJurisdictionContext("texas", "dallas");
  if (!dallasContext) {
    bad("query layer", "getJurisdictionContext(texas, dallas) returned null");
    process.exit(1);
  }
  ok("query layer", `Texas → ${dallasContext.jurisdiction.name}, ${dallasContext.sources.length} sources`);

  const cents = (c: number): string => `$${(c / 100).toFixed(2)}`;

  const dallasScenarios: Array<{
    slug: string;
    label: string;
    input: Parameters<typeof calculatePermitFees>[0];
    /** The City's own total, in cents, from its estimate worksheet. */
    cityTotalCents: number;
    /** What this site publishes for the same scenario, without the disputed line. */
    publishedCents: number;
  }> = [
    {
      slug: "building-permit-cost",
      label: "worksheet 1: new single-family dwelling, 2,500 sq ft, 4 trades",
      input: {
        asOf,
        squareFootage: 2_500,
        occupancy: "residential",
        workType: "new_construction",
        custom: { project_class: "one_and_two_family", trades: 4 },
      },
      cityTotalCents: 208_450,
      publishedCents: 150_750,
    },
    {
      slug: "building-permit-cost",
      label: "worksheet 3: new commercial office building, $6,000,500, 8 trades",
      input: {
        asOf,
        valuationCents: 600_050_000,
        occupancy: "commercial",
        workType: "new_construction",
        custom: { project_class: "commercial", trades: 8 },
        squareFootage: 25_000,
      },
      cityTotalCents: 3_383_755,
      publishedCents: 3_268_755,
    },
    {
      slug: "building-permit-cost",
      label: "worksheet 5: multi-family, 200 dwelling units, 6 trades",
      input: {
        asOf,
        units: 200,
        squareFootage: 180_000,
        occupancy: "residential",
        workType: "new_construction",
        custom: { project_class: "multifamily", trades: 6 },
      },
      cityTotalCents: 13_944_500,
      publishedCents: 13_116_500,
    },
  ];

  for (const scenario of dallasScenarios) {
    const detail = await getPermitPageDetail(dallasContext.jurisdiction.id, scenario.slug);
    if (!detail) {
      bad(scenario.slug, "page did not resolve");
      continue;
    }

    const result = calculatePermitFees(scenario.input, detail.feeRuleRecords);
    check(
      `${scenario.label} — published total`,
      result.totalCents === scenario.publishedCents,
      `computed ${cents(result.totalCents)}, expected ${cents(scenario.publishedCents)}, ` +
        `${result.components.length} components, ${result.excluded.length} excluded`,
    );
    for (const component of result.components) {
      console.log(`          + ${cents(component.amountCents).padStart(12)}  ${component.code}  ${component.formula}`);
    }

    // Same rules, same inputs, with the disputed plan review rule treated as if it
    // were settled. The result must equal the number the City's worksheet prints.
    const withDisputed = detail.feeRuleRecords.map((record) =>
      record.code === "PLAN-REVIEW-303" ? { ...record, status: "active" as const } : record,
    );
    const cityResult = calculatePermitFees(scenario.input, withDisputed);
    const planReview = cityResult.components.find((c) => c.code === "PLAN-REVIEW-303");
    check(
      `${scenario.label} — City total with the disputed plan review added back`,
      cityResult.totalCents === scenario.cityTotalCents,
      `${cents(result.totalCents)} + ${cents(planReview?.amountCents ?? 0)} plan review = ` +
        `${cents(cityResult.totalCents)}, City's worksheet says ${cents(scenario.cityTotalCents)}`,
    );
  }

  /**
   * Worksheet 5's printed total also contains the 10% zoning surcharge and a
   * separately valued accessory structure, neither of which this site estimates.
   * Shown as a derivation so the arithmetic in the City's document is fully
   * accounted for rather than left as a silent gap.
   */
  const mfdDetail = await getPermitPageDetail(dallasContext.jurisdiction.id, "building-permit-cost");
  if (mfdDetail) {
    // The multi-family worksheet's own printed rows: base $130,400 on 200 units,
    // a 10% DR zoning surcharge, plan review, the six-trade inspection fee, the
    // technology fee, and a separately valued accessory structure.
    const mfdSurcharge = 1_304_000;
    const accessory = calculatePermitFees(
      {
        asOf,
        valuationCents: 485_000_000,
        occupancy: "commercial",
        workType: "new_construction",
        custom: { project_class: "commercial", trades: 6 },
        squareFootage: 100_000,
      },
      mfdDetail.feeRuleRecords.map((record) =>
        record.code === "PLAN-REVIEW-303" ? { ...record, status: "active" as const } : record,
      ),
    );
    // The zoning surcharge is 10% of the base permit fee only, not of the whole
    // invoice — which is how the City's worksheet applies it, and why it is
    // derived from the base component instead of from the total.
    const accessoryBase = accessory.components.find((c) => c.componentType === "base");
    const accessorySurcharge = Math.round(0.1 * (accessoryBase?.amountCents ?? 0));
    const accessoryWithSurcharge = accessory.totalCents + accessorySurcharge;
    const grandTotal = 13_944_500 + mfdSurcharge + accessoryWithSurcharge;
    check(
      "worksheet 5 — the City's $178,151.05 total, accounted for line by line",
      grandTotal === 17_815_105,
      `${cents(13_944_500)} (base + plan review + inspection + technology, our engine) + ` +
        `${cents(mfdSurcharge)} zoning surcharge + ${cents(accessoryWithSurcharge)} ` +
        `(accessory structure: ${cents(accessoryBase?.amountCents ?? 0)} base + ` +
        `${cents(accessory.totalCents - (accessoryBase?.amountCents ?? 0))} in other fees + ` +
        `${cents(accessorySurcharge)} surcharge) = ${cents(grandTotal)}`,
    );
  }

  for (const slug of ["mechanical-permit-cost", "demolition-permit-cost"]) {
    const detail = await getPermitPageDetail(dallasContext.jurisdiction.id, slug);
    check(
      `Dallas has no ${slug} page`,
      detail === null,
      detail === null ? "null, route will 404" : "RESOLVED",
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Phoenix: every published row, and the City's own example                */
  /* ---------------------------------------------------------------------- */

  /**
   * The second-strongest check in this file.
   *
   * Phoenix's Table A is one marginal rule standing in for seven published rows.
   * Each of those rows is a boundary value the rule must reproduce exactly, and
   * the City's own worked example ($250,500 -> a $2,512 permit fee) is reproduced
   * on top of them. Nothing here is compared against a number this project chose.
   */
  section("Phoenix: Table A's published rows, recomputed from PostgreSQL");

  const phoenixContext = await getJurisdictionContext("arizona", "phoenix");
  if (!phoenixContext) {
    bad("query layer", "getJurisdictionContext(arizona, phoenix) returned null");
    process.exit(1);
  }
  ok(
    "query layer",
    `Arizona → ${phoenixContext.jurisdiction.name}, ${phoenixContext.sources.length} sources`,
  );

  const phoenixDetail = await getPermitPageDetail(
    phoenixContext.jurisdiction.id,
    "building-permit-cost",
  );
  if (!phoenixDetail) {
    bad("phoenix building page", "page did not resolve");
    process.exit(1);
  }

  const tableABoundaries: Array<{ valuation: number; permitFeeCents: number; row: string }> = [
    { valuation: 1_000, permitFeeCents: 19_500, row: "$195 Base fee only" },
    { valuation: 10_000, permitFeeCents: 30_300, row: "$303 on first $10,000" },
    { valuation: 50_000, permitFeeCents: 70_300, row: "$703 on first $50,000" },
    { valuation: 200_000, permitFeeCents: 205_300, row: "$2,053 on first $200,000" },
    { valuation: 1_000_000, permitFeeCents: 925_300, row: "$9,253 on first $1,000,000" },
    { valuation: 10_000_000, permitFeeCents: 5_425_300, row: "$54,253 on first $10,000,000" },
  ];

  for (const boundary of tableABoundaries) {
    const result = calculatePermitFees(
      { asOf, valuationCents: boundary.valuation * 100 },
      phoenixDetail.feeRuleRecords,
    );
    const base = result.components.find((component) => component.code === "TABLE-A");
    check(
      `Table A at $${boundary.valuation.toLocaleString("en-US")} — ${boundary.row}`,
      base?.amountCents === boundary.permitFeeCents,
      `computed ${cents(base?.amountCents ?? 0)}, published ${cents(boundary.permitFeeCents)}`,
    );
  }

  {
    // The City's own example, verbatim: "assuming a total project valuation of
    // $250,500: $2,053 base fee plus $459 (51 x $9) ... Total permit fee cost of
    // $2,512". Plan review is published separately in the same document, at 80% of
    // the permit fee above $50,000 of valuation.
    const result = calculatePermitFees(
      { asOf, valuationCents: 25_050_000, workType: "new_construction" },
      phoenixDetail.feeRuleRecords,
    );
    const base = result.components.find((component) => component.code === "TABLE-A");
    const review = result.components.find((component) => component.code === "PLAN-REVIEW-80");

    check(
      "the City's own example: $250,500 pays a $2,512 permit fee",
      base?.amountCents === 251_200,
      `computed ${cents(base?.amountCents ?? 0)}, City's document says $2,512.00`,
    );
    check(
      "...and plan review is 80% of it",
      review?.amountCents === 200_960,
      `computed ${cents(review?.amountCents ?? 0)}, expected ${cents(200_960)} (0.8 x ${cents(base?.amountCents ?? 0)})`,
    );
    check(
      "...for a published total of $4,521.60",
      result.totalCents === 452_160,
      `${cents(result.totalCents)} from ${result.components.length} components, ${result.excluded.length} excluded`,
    );
    for (const component of result.components) {
      console.log(`          + ${cents(component.amountCents).padStart(12)}  ${component.code}  ${component.formula}`);
    }
  }

  {
    // The step at $50,000: the plan review percentage drops from 100% to 80%, so
    // the total falls as the project grows. A published property of the schedule,
    // not a transcription artefact.
    const atBoundary = calculatePermitFees({ asOf, valuationCents: 5_000_000 }, phoenixDetail.feeRuleRecords);
    const justOver = calculatePermitFees({ asOf, valuationCents: 5_000_100 }, phoenixDetail.feeRuleRecords);
    check(
      "the plan review step at $50,000 of valuation",
      atBoundary.totalCents === 140_600 && justOver.totalCents === 128_160,
      `$50,000 pays ${cents(atBoundary.totalCents)}; $50,001 pays ${cents(justOver.totalCents)} — the total falls by ${cents(atBoundary.totalCents - justOver.totalCents)} as plan review drops from 100% to 80%`,
    );
  }

  for (const slug of ["mechanical-permit-cost", "demolition-permit-cost"]) {
    const detail = await getPermitPageDetail(phoenixContext.jurisdiction.id, slug);
    check(
      `Phoenix publishes no ${slug} page`,
      detail === null,
      detail === null ? "null, route will 404" : "RESOLVED",
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Phoenix: the trade fees, which are not Table A                            */
  /* ---------------------------------------------------------------------- */

  /**
   * Phoenix prices electrical and plumbing work from Table A like everything else,
   * and publishes four fees that belong to a trade and nothing else. The check that
   * matters is the allowance: "one meter of each type is included in the permit fee"
   * is the row most likely to be transcribed as a flat per-unit charge, which would
   * overstate a three-meter project by $98.
   */
  section("Phoenix: the trade fees, recomputed from PostgreSQL");

  const phoenixTradePages: Array<{
    slug: string;
    codes: string[];
    input: Parameters<typeof calculatePermitFees>[0];
    expectedCents: number;
  }> = [
    {
      slug: "electrical-permit-cost",
      codes: ["TABLE-A", "METER-ELECTRIC-ADDITIONAL", "TEMPORARY-POWER", "REINSPECTION"],
      input: {
        asOf,
        valuationCents: 1_800_000,
        workType: "new_construction",
        occupancy: "commercial",
        custom: { meters: 3, temporary_power: true },
      },
      // $383 Table A + $196 for three meters, two of them chargeable + $195.
      expectedCents: 77_400,
    },
    {
      slug: "plumbing-permit-cost",
      codes: ["TABLE-A", "METER-GAS-WATER-ADDITIONAL", "BACKFLOW-DEVICES", "REINSPECTION"],
      input: {
        asOf,
        valuationCents: 4_000_000,
        workType: "new_construction",
        occupancy: "commercial",
        custom: { meters: 3, backflow_devices: 3 },
      },
      // $603 Table A + $196 + $391 for three backflow devices.
      expectedCents: 119_000,
    },
  ];

  for (const scenario of phoenixTradePages) {
    const detail = await getPermitPageDetail(phoenixContext.jurisdiction.id, scenario.slug);
    if (!detail) {
      bad(scenario.slug, "page did not resolve");
      continue;
    }

    check(
      `${scenario.slug} — the rules stored`,
      detail.feeRuleRecords.map((rule) => rule.code).sort().join(",") ===
        [...scenario.codes].sort().join(","),
      detail.feeRuleRecords.map((rule) => rule.code).join(", "),
    );

    const result = calculatePermitFees(scenario.input, detail.feeRuleRecords);
    check(
      `${scenario.slug} — the fee`,
      result.totalCents === scenario.expectedCents,
      `${cents(result.totalCents)}, expected ${cents(scenario.expectedCents)} from ${result.components.length} components`,
    );
    for (const component of result.components) {
      console.log(
        `          + ${cents(component.amountCents).padStart(12)}  ${component.code}  ${component.formula}`,
      );
    }
  }

  {
    // The allowance, on its own. One meter is included in the permit fee whatever the
    // permit costs, so a count of 1 must charge nothing and a count of 3 must charge
    // $196 rather than $294.
    const detail = await getPermitPageDetail(
      phoenixContext.jurisdiction.id,
      "electrical-permit-cost",
    );
    if (detail) {
      const meters = (count: number): number =>
        calculatePermitFees({ asOf, custom: { meters: count } }, detail.feeRuleRecords).totalCents;

      check(
        "the first meter of each type is included in the permit fee",
        meters(1) === 0 && meters(3) === 19_600,
        `1 meter -> ${cents(meters(1))}, 3 meters -> ${cents(meters(3))}; charging every meter would have been ${cents(meters(3) + 9_800)}`,
      );
    }
  }

  {
    // Backflow devices are the one plumbing fee charged by count. $195 then $98.
    const detail = await getPermitPageDetail(
      phoenixContext.jurisdiction.id,
      "plumbing-permit-cost",
    );
    if (detail) {
      const devices = (count: number): number =>
        calculatePermitFees(
          { asOf, custom: { backflow_devices: count } },
          detail.feeRuleRecords,
        ).totalCents;

      check(
        "backflow prevention devices are $195 for the first and $98 after",
        devices(1) === 19_500 && devices(3) === 39_100,
        `1 device -> ${cents(devices(1))}, 3 devices -> ${cents(devices(3))}`,
      );
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Scottsdale: two areas, and the 30% remodel rate                         */
  /* ---------------------------------------------------------------------- */

  /**
   * Scottsdale's fee is driven by two different areas of the same building, so the
   * checks that matter here are about which fact each rule reads. A rule that read
   * `square_footage` where it meant `covered_square_footage` would look right, add
   * up, and be wrong — which is exactly what happened once while this jurisdiction
   * was being built, and what the basis count below now catches.
   */
  section("Scottsdale: the two-area mechanism, recomputed from PostgreSQL");

  const scottsdaleContext = await getJurisdictionContext("arizona", "scottsdale");
  if (!scottsdaleContext) {
    bad("query layer", "getJurisdictionContext(arizona, scottsdale) returned null");
    process.exit(1);
  }
  ok(
    "query layer",
    `Arizona → ${scottsdaleContext.jurisdiction.name}, ${scottsdaleContext.sources.length} sources`,
  );

  const scottsdale = await one<{ id: string; state: string }>(
    `select j.id, s.name as state
     from jurisdictions j join states s on s.id = j.state_id where j.slug = 'scottsdale'`,
  );
  if (!scottsdale) {
    bad("Scottsdale", "no jurisdiction row");
    process.exit(1);
  }
  ok("jurisdiction", `state=${scottsdale.state} (id redacted)`);

  const scottsdaleDepts = await rows<{ kind: string; name: string; phone: string | null }>(
    `select kind::text as kind, name, phone from departments where jurisdiction_id = $1 order by 1`,
    [scottsdale.id],
  );
  ok(
    "departments",
    scottsdaleDepts.map((d) => `${d.kind}=${d.name} (phone=${d.phone ?? "none recorded"})`).join(" | ") ||
      "(none)",
  );

  const scottsdalePages = await rows<{ key: string; status: string; noindex: boolean }>(
    `select pt.key, p.publish_status::text as status, p.noindex
     from jurisdiction_permit_pages p join permit_types pt on pt.id = p.permit_type_id
     where p.jurisdiction_id = $1 order by pt.key`,
    [scottsdale.id],
  );
  for (const p of scottsdalePages) {
    console.log(`        page ${p.key.padEnd(12)} ${p.status.padEnd(10)} noindex=${p.noindex}`);
  }

  const scottsdaleBases = await rows<{ basis: string; n: number }>(
    `select config->>'basis' as basis, count(*)::int as n from fee_rules
     where jurisdiction_id = $1 group by 1 order by 1`,
    [scottsdale.id],
  );
  ok(
    "fee rules by basis",
    scottsdaleBases.map((r) => `${r.basis}=${r.n}`).join(", ") || "(none)",
  );
  {
    // Four on the area with A/C (the new-work and remodel rates, each on the permit
    // and on the review), two on the covered area (the permit rate, on the permit and
    // on the review), and one with no basis at all — the flat base fee.
    const byBasis = new Map(scottsdaleBases.map((r) => [r.basis, r.n]));
    check(
      "the second area is read by rules of its own",
      (byBasis.get("covered_square_footage") ?? 0) === 2 &&
        (byBasis.get("square_footage") ?? 0) === 4,
      `${byBasis.get("square_footage") ?? 0} on the area with A/C, ` +
        `${byBasis.get("covered_square_footage") ?? 0} on the covered area`,
    );
    check(
      "nothing in Scottsdale reads a valuation",
      !byBasis.has("valuation"),
      byBasis.has("valuation") ? "a valuation rule exists" : "no valuation basis anywhere",
    );
  }

  const scottsdaleDetail = await getPermitPageDetail(
    scottsdaleContext.jurisdiction.id,
    "building-permit-cost",
  );
  if (!scottsdaleDetail) {
    bad("scottsdale building page", "page did not resolve");
    process.exit(1);
  }

  {
    // $237 + 2,500 x $0.94 + 400 x $0.54 = $2,803 of permit fee, and
    // 2,500 x $0.54 + 400 x $0.34 = $1,486 of plan review, whose schedule has no
    // base fee. $4,289 in all.
    const result = calculatePermitFees(
      {
        asOf,
        squareFootage: 2_500,
        workType: "new_construction",
        occupancy: "residential",
        custom: { covered_square_footage: 400 },
      },
      scottsdaleDetail.feeRuleRecords,
    );
    const base = result.components
      .filter((component) => component.componentType === "base")
      .reduce((sum, component) => sum + component.amountCents, 0);
    const review = result.components
      .filter((component) => component.componentType === "plan_review")
      .reduce((sum, component) => sum + component.amountCents, 0);

    check(
      "a 2,500 sq ft home with 400 sq ft covered — permit fee",
      base === 280_300,
      `${cents(base)}, published $237 + 2,500 x $0.94 + 400 x $0.54 = ${cents(280_300)}`,
    );
    check(
      "...and plan review, which carries no base fee",
      review === 148_600,
      `${cents(review)}, published 2,500 x $0.54 + 400 x $0.34 = ${cents(148_600)}`,
    );
    check(
      "...for a total of $4,289.00",
      result.totalCents === 428_900,
      `${cents(result.totalCents)} from ${result.components.length} components, ${result.excluded.length} excluded`,
    );
    for (const component of result.components) {
      console.log(
        `          + ${cents(component.amountCents).padStart(12)}  ${component.code}  ${component.formula}`,
      );
    }
  }

  {
    // The mistake the schedule invites: reading the two rows as two rates on one
    // total. With no covered area entered the covered rules drop out entirely, so
    // 2,500 sq ft is charged 2,500 feet once, not twice.
    const noCovered = calculatePermitFees(
      { asOf, squareFootage: 2_500, workType: "new_construction", occupancy: "residential" },
      scottsdaleDetail.feeRuleRecords,
    );
    const coveredOnTheSameArea = 2_500 * 54;
    check(
      "the covered area is not charged on the area with A/C",
      noCovered.totalCents === 393_700,
      `${cents(noCovered.totalCents)}; charging the same 2,500 sq ft at $0.54 as well would have been ${cents(393_700 + coveredOnTheSameArea)}`,
    );
    check(
      "...and the covered rule is reported as excluded, not silently skipped",
      noCovered.excluded.some((excluded) => excluded.code === "PERMIT-COVERED-AREA"),
      noCovered.excluded.map((excluded) => excluded.code).join(", ") || "(none)",
    );
  }

  {
    // The 30% remodel rate, charged on both the permit and the review, on a
    // conditioned area only for the review. 1,200 sq ft with 400 sq ft covered:
    // $237 + 1,200 x $0.282 + 400 x $0.54 = $791.40, then 1,200 x $0.162 = $194.40.
    const remodel = calculatePermitFees(
      {
        asOf,
        squareFootage: 1_200,
        workType: "remodel",
        occupancy: "residential",
        custom: { covered_square_footage: 400 },
      },
      scottsdaleDetail.feeRuleRecords,
    );
    check(
      "a remodel pays 30% of the area rate",
      remodel.totalCents === 98_580,
      `${cents(remodel.totalCents)}: $237 + 1,200 x $0.282 + 400 x $0.54 + 1,200 x $0.162`,
    );
    check(
      "...with no covered-area line in its plan review",
      remodel.excluded.some((excluded) => excluded.code === "REVIEW-COVERED-AREA"),
      remodel.excluded.map((excluded) => excluded.code).join(", ") || "(none)",
    );
  }

  {
    // The rows this site names and does not model. Work the schedule prices
    // differently must produce no fee at all rather than inherit the
    // new-construction rate.
    const unmodelled = calculatePermitFees(
      { asOf, squareFootage: 2_500, workType: "other", occupancy: "residential" },
      scottsdaleDetail.feeRuleRecords,
    );
    check(
      "a work type outside the modelled rows charges nothing",
      unmodelled.totalCents === 0 && unmodelled.warnings.length > 0,
      `${cents(unmodelled.totalCents)}, ${unmodelled.excluded.length} rules excluded, warning present: ${unmodelled.warnings.length > 0}`,
    );
  }

  for (const slug of ["mechanical-permit-cost", "demolition-permit-cost"]) {
    const detail = await getPermitPageDetail(scottsdaleContext.jurisdiction.id, slug);
    check(
      `Scottsdale publishes no ${slug} page`,
      detail === null,
      detail === null ? "null, route will 404" : "RESOLVED",
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Scottsdale: the flat trade fees, and the sum that must never happen      */
  /* ---------------------------------------------------------------------- */

  /**
   * The decision this section exists to guard.
   *
   * The Miscellaneous schedule lists a minimum permit fee for one discipline *and* a
   * flat fee for several individual items, and never says the minimum floors them. Two
   * rules that both fired would charge $184 for a water heater the City prices at $63.
   * So the rules are mutually exclusive by condition, and this checks that the loser of
   * each pair is reported as excluded rather than quietly summed.
   */
  section("Scottsdale: the flat trade fees, recomputed from PostgreSQL");

  const scottsdaleTradePages: Array<{
    slug: string;
    item: string;
    expectedCents: number;
    minimumCents: number;
  }> = [
    { slug: "electrical-permit-cost", item: "temporary_power_pole", expectedCents: 12_100, minimumCents: 12_100 },
    { slug: "plumbing-permit-cost", item: "water_heater", expectedCents: 6_300, minimumCents: 12_100 },
  ];

  for (const scenario of scottsdaleTradePages) {
    const detail = await getPermitPageDetail(scottsdaleContext.jurisdiction.id, scenario.slug);
    if (!detail) {
      bad(scenario.slug, "page did not resolve");
      continue;
    }

    const withItem = calculatePermitFees(
      { asOf, custom: { schedule_item: scenario.item } },
      detail.feeRuleRecords,
    );
    check(
      `${scenario.slug} — a ${scenario.item.replace(/_/g, " ")} permit`,
      withItem.totalCents === scenario.expectedCents && withItem.components.length === 1,
      `${cents(withItem.totalCents)} from ${withItem.components.length} component(s); $${scenario.minimumCents / 100} + this would have been ${cents(scenario.expectedCents + scenario.minimumCents)}`,
    );

    const withoutItem = calculatePermitFees({ asOf }, detail.feeRuleRecords);
    check(
      `${scenario.slug} — with no item selected, the published minimum`,
      withoutItem.totalCents === scenario.minimumCents &&
        withoutItem.components[0]?.code === "TRADE-MINIMUM-ONE-DISCIPLINE",
      `${cents(withoutItem.totalCents)} from ${withoutItem.components[0]?.code ?? "nothing"}`,
    );
    for (const component of withItem.components) {
      console.log(
        `          + ${cents(component.amountCents).padStart(12)}  ${component.code}  ${component.formula}`,
      );
    }
  }

  {
    // No trade rule may be a rate. The area schedules price construction; a stand-alone
    // trade permit is not priced by them, and a rate appearing here would be that claim
    // being made silently.
    const tradeRules = await rows<{ code: string; fee_type: string }>(
      `select r.code, r.fee_type::text as fee_type from fee_rules r
       join jurisdictions j on j.id = r.jurisdiction_id
       join permit_types p on p.id = r.permit_type_id
       where j.slug = 'scottsdale' and p.key in ('electrical','plumbing') order by 1`,
    );
    const notFlat = tradeRules.filter((rule) => rule.fee_type !== "flat");
    check(
      "every Scottsdale trade rule is a flat published fee",
      tradeRules.length === 8 && notFlat.length === 0,
      `${tradeRules.length} rules, ${notFlat.length} of them rates`,
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Clark County: a chained valuation table, and the one seam that is off   */
  /* ---------------------------------------------------------------------- */

  /**
   * Clark County's Table 3-A chains: each band's opening figure is what the band
   * below produces at its top, so the table can be checked against itself. Four of
   * the five seams close to the cent once the half-cent increments are rounded;
   * the fifth is four cents apart, and that discrepancy is in the County's own
   * document. Also worth pinning here is the storage of `$7.371` per $1,000 — read
   * as 7,371 whole cents it charges $1,774.62 where the table says $248.82.
   */
  section("Clark County: the chained valuation table, recomputed from PostgreSQL");

  const clarkContext = await getJurisdictionContext("nevada", "clark-county");
  if (!clarkContext) {
    bad("query layer", "getJurisdictionContext(nevada, clark-county) returned null");
    process.exit(1);
  }
  ok(
    "query layer",
    `Nevada → ${clarkContext.jurisdiction.name}, ${clarkContext.sources.length} sources`,
  );

  const clarkBuilding = await getPermitPageDetail(
    clarkContext.jurisdiction.id,
    "building-permit-cost",
  );
  if (!clarkBuilding) {
    bad("Clark County building page", "did not resolve");
  } else {
    const feeAt = (valuationCents: number): number =>
      calculatePermitFees({ asOf, valuationCents }, clarkBuilding.feeRuleRecords).totalCents;

    for (const [valuationCents, expected, label] of [
      [50_000, 5_400, "$54.00, the flat first row"],
      [200_000, 7_925, "$79.25 — $79.245 rounded, the figure the band below produces at $2,000"],
      [2_500_000, 24_882, "$248.82, the base of the band above"],
      [5_000_000, 36_695, "$366.95, the base of the band above"],
      [10_000_000, 53_705, "$537.05, the base of the band above"],
    ] as Array<[number, number, string]>) {
      check(
        `Table 3-A at ${cents(valuationCents)}`,
        feeAt(valuationCents) === expected,
        `${cents(feeAt(valuationCents))}; ${label}`,
      );
    }

    check(
      "four of the five seams close to the cent",
      feeAt(50_000) === 5_400 &&
        feeAt(2_500_000) === 24_882 &&
        feeAt(5_000_000) === 36_695 &&
        feeAt(10_000_000) === 53_705,
      "$54.00 / $248.82 / $366.95 / $537.05 — each one the base of the band above it",
    );

    check(
      "the $2,000 seam is four cents apart, as the schedule prints it",
      feeAt(200_000) === 7_925,
      `${cents(feeAt(200_000))} against the $79.29 the band above opens with — the discrepancy belongs to the County's table`,
    );

    check(
      "a cent into a band buys a whole thousand, as \"fraction thereof\" says",
      feeAt(2_500_100) === 24_882 + 473,
      `${cents(feeAt(2_500_100))} at $25,001 — one increment of $4.725 rounded to $4.73`,
    );

    check(
      "the building worked example: valuation $250,000",
      feeAt(25_000_000) === 97_715,
      cents(feeAt(25_000_000)),
    );

    const band3 = clarkBuilding.feeRuleRecords.find(
      (rule) => rule.code === "TABLE-3A-2001-25000",
    );
    const config = (band3?.config ?? {}) as {
      centsPerThousand?: number;
      rateCentsPerThousand?: { numerator: number; denominator: number };
    };
    check(
      "$7.371 per $1,000 is stored as an exact fraction, not as 7,371 whole cents",
      band3?.feeType === "per_thousand" &&
        config.rateCentsPerThousand?.numerator === 7_371 &&
        config.rateCentsPerThousand?.denominator === 10 &&
        config.centsPerThousand === undefined,
      JSON.stringify(config),
    );
    check(
      "what that storage defends: $25,000 of valuation",
      feeAt(2_500_000) === 24_882,
      `${cents(feeAt(2_500_000))} published; 7,371 cents per $1,000 would give ${cents(177_462)}`,
    );
  }

  const clarkElectrical = await getPermitPageDetail(
    clarkContext.jurisdiction.id,
    "electrical-permit-cost",
  );
  if (!clarkElectrical) {
    bad("Clark County electrical page", "did not resolve");
  } else {
    const result = calculatePermitFees(
      { asOf, valuationCents: 3_000_000, custom: { panels: 2 } },
      clarkElectrical.feeRuleRecords,
    );
    check(
      "electrical worked example — $30,000 of electrical work, two subpanels",
      result.totalCents === 28_115,
      `${cents(result.totalCents)} from ${result.components.length} component(s)`,
    );
    for (const component of result.components) {
      console.log(
        `          + ${cents(component.amountCents).padStart(12)}  ${component.code}  ${component.formula}`,
      );
    }
  }

  const clarkPlumbing = await getPermitPageDetail(
    clarkContext.jurisdiction.id,
    "plumbing-permit-cost",
  );
  if (!clarkPlumbing) {
    bad("Clark County plumbing page", "did not resolve");
  } else {
    const result = calculatePermitFees(
      { asOf, custom: { schedule_item: "water_heater" } },
      clarkPlumbing.feeRuleRecords,
    );
    check(
      "plumbing worked example — a water heater, flat, instead of the bands",
      result.totalCents === 5_657 &&
        result.components.length === 1 &&
        result.components[0]?.code === "TABLE-3D-WATER-HEATER",
      `${cents(result.totalCents)} from ${result.components[0]?.code ?? "nothing"}`,
    );
  }

  {
    const clarkRules = await rows<{
      code: string;
      fee_type: string;
      component_type: string;
      permit: string;
    }>(
      `select r.code, r.fee_type::text as fee_type,
              r.component_type::text as component_type, p.key as permit
         from fee_rules r
         join jurisdictions j on j.id = r.jurisdiction_id
         join permit_types p on p.id = r.permit_type_id
        where j.slug = 'clark-county' order by 1`,
    );
    const codes = new Set(clarkRules.map((rule) => rule.code));
    check(
      "Clark County stores 18 distinct rules across three permit types",
      clarkRules.length === 30 && codes.size === 18,
      `${clarkRules.length} rows, ${codes.size} distinct codes`,
    );
    check(
      "Clark County models no plan review component",
      clarkRules.every((rule) => rule.component_type !== "plan_review"),
      `${clarkRules.filter((rule) => rule.component_type === "plan_review").length} of ${clarkRules.length}`,
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Boulder City: brackets that chain, and a $40 charged exactly once      */
  /* ---------------------------------------------------------------------- */

  /**
   * Two schedules in one state, both valuation tables, and only one of them needs
   * rounding to close its seams. The checks here are the handovers, the issuance
   * fee the trade blocks say is already inside their figures, and the one row that
   * is per unit rather than flat — a two-tank permit is where the two readings
   * give different answers.
   */
  section("Boulder City: the bracket table, recomputed from PostgreSQL");

  const boulderContext = await getJurisdictionContext("nevada", "boulder-city");
  if (!boulderContext) {
    bad("query layer", "getJurisdictionContext(nevada, boulder-city) returned null");
    process.exit(1);
  }
  ok(
    "query layer",
    `Nevada → ${boulderContext.jurisdiction.name}, ${boulderContext.sources.length} sources`,
  );

  const boulderBuilding = await getPermitPageDetail(
    boulderContext.jurisdiction.id,
    "building-permit-cost",
  );
  if (!boulderBuilding) {
    bad("Boulder City building page", "did not resolve");
  } else {
    const buildingAt = (valuationCents: number): number =>
      calculatePermitFees({ asOf, valuationCents }, boulderBuilding.feeRuleRecords).totalCents;

    for (const [valuationCents, expected, label] of [
      [100, 6_700, "the $27.00 first bracket plus the $40 issuance fee"],
      [2_500_000, 29_200, "the published $252.00 at $25,000, plus $40"],
      [5_000_000, 45_450, "$414.50 at $50,000 — the handover to the $4.50 band closes"],
      [5_000_100, 45_900, "one whole $1,000 of the $4.50 band, plus $40"],
      [10_000_000, 67_950, "$639.50 at $100,000 — the handover to the $3.50 band closes"],
      [11_265_000, 72_500, "the worked example: 1,000 sq ft at the City's own $112.65"],
    ] as Array<[number, number, string]>) {
      check(
        `Valuation Table at ${cents(valuationCents)}`,
        buildingAt(valuationCents) === expected,
        `${cents(buildingAt(valuationCents))}; ${label}`,
      );
    }
  }

  const boulderElectrical = await getPermitPageDetail(
    boulderContext.jurisdiction.id,
    "electrical-permit-cost",
  );
  if (!boulderElectrical) {
    bad("Boulder City electrical page", "did not resolve");
  } else {
    const result = calculatePermitFees(
      { asOf, custom: { schedule_item: "service_change_1000" } },
      boulderElectrical.feeRuleRecords,
    );
    check(
      "electrical worked example — a 400-amp service change",
      result.totalCents === 10_000 && result.components.length === 1,
      `${cents(result.totalCents)} from ${result.components[0]?.code ?? "nothing"}; the $40 issuance fee is inside it, not on top`,
    );
  }

  const boulderPlumbing = await getPermitPageDetail(
    boulderContext.jurisdiction.id,
    "plumbing-permit-cost",
  );
  if (!boulderPlumbing) {
    bad("Boulder City plumbing page", "did not resolve");
  } else {
    const heaters = (count: number): number =>
      calculatePermitFees(
        { asOf, custom: { schedule_item: "water_heater", heaters: count } },
        boulderPlumbing.feeRuleRecords,
      ).totalCents;
    const gasLine = calculatePermitFees(
      { asOf, custom: { schedule_item: "gas_line_test" } },
      boulderPlumbing.feeRuleRecords,
    );
    check(
      "a water heater is priced per unit: one tank $50.00, two tanks $100.00",
      heaters(1) === 5_000 && heaters(2) === 10_000,
      `1 tank -> ${cents(heaters(1))}, 2 tanks -> ${cents(heaters(2))}; a flat rule would have answered ${cents(heaters(2))} for two tanks at half the schedule's figure`,
    );
    check(
      "a gas line or pressure test is $70.00",
      gasLine.totalCents === 7_000 && gasLine.components.length === 1,
      cents(gasLine.totalCents),
    );
  }

  {
    const boulderRules = await rows<{
      code: string;
      fee_type: string;
      permit: string;
    }>(
      `select r.code, r.fee_type::text as fee_type, p.key as permit
         from fee_rules r
         join jurisdictions j on j.id = r.jurisdiction_id
         join permit_types p on p.id = r.permit_type_id
        where j.slug = 'boulder-city' order by 1`,
    );

    check(
      "Boulder City stores its ten rules across three permit types",
      boulderRules.length === 10 && new Set(boulderRules.map((rule) => rule.code)).size === 10,
      `${boulderRules.length} rows, ${new Set(boulderRules.map((rule) => rule.code)).size} distinct codes`,
    );

    const issuance = boulderRules.filter((rule) => rule.code === "ISSUANCE-40");
    check(
      "the $40 issuance fee is attached to the building permit only",
      issuance.length === 1 && issuance[0]?.permit === "building",
      issuance.length === 0 ? "absent" : issuance.map((rule) => rule.permit).join(", "),
    );

    const waterHeater = boulderRules.find((rule) => rule.code === "PLUMB-WATER-HEATER");
    check(
      "the water heater row is stored per unit, not flat",
      waterHeater?.fee_type === "per_unit",
      waterHeater?.fee_type ?? "missing",
    );

    const tradeByValuation = boulderRules.filter(
      (rule) =>
        rule.permit !== "building" &&
        (rule.fee_type === "per_thousand" || rule.fee_type === "tiered_table"),
    );
    check(
      "neither Boulder City trade is priced by valuation",
      tradeByValuation.length === 0,
      `${tradeByValuation.length} of ${boulderRules.length} rules`,
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Retired pages                                                          */
  /* ---------------------------------------------------------------------- */

  /* ---------------------------------------------------------------------- */
  /* Colorado                                                              */
  /* ---------------------------------------------------------------------- */

  /**
   * Denver and Westminster answer the same question in incompatible ways: Denver prices a
   * trade as a permit of its own, from the value of that trade's work, and Westminster
   * prices it as 15% of the project's permit fee plus 15% of its plan review fee. What the
   * two have in common is that both tables are testable at their seams, which is what is
   * recomputed here — from the rules as PostgreSQL stores them rather than from the payload
   * that wrote them.
   *
   * Denver's table is a dollar short at one handover and Westminster's closes at all seven,
   * so the seams are asserted on both sides of each joint: "the two tables agree with
   * themselves" and "they nearly do" are different findings and only one of them is true.
   */
  section("Colorado: the two tables and their seams, recomputed from PostgreSQL");

  const denverContext = await getJurisdictionContext("colorado", "denver");
  if (!denverContext) {
    bad("query layer", "getJurisdictionContext(colorado, denver) returned null");
    process.exit(1);
  }
  ok("query layer", `Colorado → ${denverContext.jurisdiction.name}, ${denverContext.sources.length} sources`);

  const denverBuilding = await getPermitPageDetail(
    denverContext.jurisdiction.id,
    "building-permit-cost",
  );
  if (!denverBuilding) {
    bad("Denver building page", "did not resolve");
  } else {
    const at = (
      valuationCents: number,
      custom?: Record<string, string | number | boolean | null | undefined>,
    ) =>
      calculatePermitFees(
        { asOf, valuationCents, ...(custom ? { custom } : {}) },
        denverBuilding.feeRuleRecords,
      );
    const permitFee = (valuationCents: number): number =>
      at(valuationCents)
        .components.filter((component) => component.componentType !== "plan_review")
        .reduce((sum, component) => sum + component.amountCents, 0);

    for (const [valuationCents, expected, label] of [
      [1, 2_000, "the first band's flat $20.00"],
      [200_000, 3_500, "$35.00 at $2,000"],
      [1_200_000, 11_500, "$35.00 plus ten increments of $8.00 at $12,000"],
      [5_000_000, 42_000, "$420.00 at $50,000 — the seam closes"],
      [10_000_000, 77_000, "$770.00 at $100,000 — the seam closes"],
      [50_000_000, 301_000, "$3,010.00 at $500,000 — the seam closes"],
      [100_000_000, 538_500, "$5,385.00 at $1,000,000 — the seam closes"],
    ] as Array<[number, number, string]>) {
      check(
        `Denver Table No. 1 at ${cents(valuationCents)}`,
        permitFee(valuationCents) === expected,
        `${cents(permitFee(valuationCents))}; ${label}`,
      );
    }

    check(
      "Denver's $25,000 seam, both readings",
      permitFee(2_500_000) === 21_900 && permitFee(2_500_001) === 22_800,
      `${cents(permitFee(2_500_000))} at $25,000 against ${cents(permitFee(2_500_001))} at $25,001 — the band above opens at $220.00 and the fraction adds $8.00`,
    );

    check(
      "Denver's plan review is 50% of the permit fee, above $2,000 of valuation",
      at(5_000_000).totalCents === 63_000 && at(200_000).totalCents === 3_500,
      `${cents(at(5_000_000).totalCents)} at $50,000 and ${cents(at(200_000).totalCents)} at $2,000`,
    );

    check(
      "Denver's express review replaces the column and holds its $100 floor",
      at(5_000_000, { review_type: "express" }).totalCents === 52_000 &&
        at(20_000_000, { review_type: "express" }).totalCents === 159_600,
      `${cents(at(5_000_000, { review_type: "express" }).totalCents)} at $50,000 (20% would be $84.00, the floor lifts it) and ${cents(at(20_000_000, { review_type: "express" }).totalCents)} at $200,000`,
    );

    check(
      "Denver charges no review on a quick permit",
      at(5_000_000, { permit_kind: "quick" }).totalCents === 42_000,
      `${cents(at(5_000_000, { permit_kind: "quick" }).totalCents)} at $50,000`,
    );
  }

  const westminsterContext = await getJurisdictionContext("colorado", "westminster");
  if (!westminsterContext) {
    bad("query layer", "getJurisdictionContext(colorado, westminster) returned null");
    process.exit(1);
  }
  ok(
    "query layer",
    `Colorado → ${westminsterContext.jurisdiction.name}, ${westminsterContext.sources.length} sources`,
  );

  const westminsterBuilding = await getPermitPageDetail(
    westminsterContext.jurisdiction.id,
    "building-permit-cost",
  );
  if (!westminsterBuilding) {
    bad("Westminster building page", "did not resolve");
  } else {
    const at = (
      valuationCents: number,
      custom?: Record<string, string | number | boolean | null | undefined>,
    ) =>
      calculatePermitFees(
        { asOf, valuationCents, ...(custom ? { custom } : {}) },
        westminsterBuilding.feeRuleRecords,
      );
    const sumOf = (
      valuationCents: number,
      componentType: string,
      custom?: Record<string, string | number | boolean | null | undefined>,
    ) =>
      at(valuationCents, custom)
        .components.filter((component) => component.componentType === componentType)
        .reduce((sum, component) => sum + component.amountCents, 0);

    // The finding this jurisdiction contributes: all seven handovers close.
    for (const [valuationCents, opening, label] of [
      [50_000, 1_950, "$19.50"],
      [200_000, 5_925, "$59.25 — the band that counts in hundreds"],
      [2_500_000, 33_295, "$332.95"],
      [5_000_000, 54_670, "$546.70"],
      [10_000_000, 84_420, "$844.20"],
      [50_000_000, 268_420, "$2,684.20"],
      [100_000_000, 465_920, "$4,659.20"],
    ] as Array<[number, number, string]>) {
      const bandsOnly = calculatePermitFees(
        { asOf, valuationCents },
        westminsterBuilding.feeRuleRecords.filter((rule) => rule.code.startsWith("VALUATION-")),
      ).totalCents;
      check(
        `Westminster seam at ${cents(valuationCents)}`,
        bandsOnly === opening,
        `${cents(bandsOnly)} — the band above opens with ${label}`,
      );
    }

    check(
      "Westminster charges plan review at every size of job",
      at(100).totalCents === 3_220 && sumOf(100, "plan_review") === 1_268,
      `${cents(at(100).totalCents)} on a $1 valuation: $19.50 of permit fee and 65% of it in review`,
    );

    check(
      "Westminster's use tax is 4.25% of half the valuation, exactly",
      sumOf(25_000_000, "surcharge") === 531_250,
      `${cents(sumOf(25_000_000, "surcharge"))} on $250,000 — 2.125% is not a whole basis point, so it is carried as 17/800`,
    );

    const threeTrades = { mechanical_trade: true, plumbing_trade: true, electrical_trade: true };
    check(
      "Westminster's worked example: $250,000 with three trades",
      at(25_000_000, threeTrades).totalCents === 898_306,
      `${cents(at(25_000_000, threeTrades).totalCents)} from ${cents(sumOf(25_000_000, "base", threeTrades))} of permit fee, ${cents(sumOf(25_000_000, "plan_review", threeTrades))} of review, ${cents(sumOf(25_000_000, "surcharge", threeTrades))} of use tax and ${cents(sumOf(25_000_000, "other", threeTrades))} of trade fees`,
    );

    check(
      "Westminster's trades are additions, not permits of their own",
      at(25_000_000).totalCents === 784_393 &&
        sumOf(25_000_000, "other") === 0 &&
        at(25_000_000, { electrical_trade: true }).totalCents === 784_393 + 23_013 + 14_958,
      `$7,843.93 without a trade, and each trade adds $230.13 plus $149.58`,
    );

    check(
      "Westminster's flat rows replace the valuation route rather than adding to it",
      at(0, { schedule_item: "water_heater" }).totalCents === 4_000 &&
        at(0, { schedule_item: "air_conditioner" }).totalCents === 9_200 &&
        at(0, { schedule_item: "solar_systems" }).totalCents === 30_000 &&
        at(0, { schedule_item: "demolition" }).totalCents === 2_500,
      `water heater ${cents(at(0, { schedule_item: "water_heater" }).totalCents)}, air conditioner ${cents(at(0, { schedule_item: "air_conditioner" }).totalCents)}, solar ${cents(at(0, { schedule_item: "solar_systems" }).totalCents)}, demolition ${cents(at(0, { schedule_item: "demolition" }).totalCents)}`,
    );

    check(
      "Westminster never bills one electrical permit twice",
      at(0, { schedule_item: "air_conditioner", electrical_trade: true }).totalCents === 9_200,
      `${cents(at(0, { schedule_item: "air_conditioner", electrical_trade: true }).totalCents)} with the electrical trade selected as well — the flat row and the 15% do not stack`,
    );
  }

  const westminsterElectrical = await getPermitPageDetail(
    westminsterContext.jurisdiction.id,
    "electrical-permit-cost",
  );
  if (!westminsterElectrical) {
    bad("Westminster electrical page", "did not resolve");
  } else {
    const result = calculatePermitFees(
      { asOf, valuationCents: 6_000_000, custom: { electrical_trade: true } },
      westminsterElectrical.feeRuleRecords,
    );
    const trade = result.components
      .filter((component) => component.componentType === "other")
      .reduce((sum, component) => sum + component.amountCents, 0);
    check(
      "Westminster's electrical trade on a $60,000 project",
      result.totalCents === 242_526 && trade === 9_093 + 5_910,
      `${cents(result.totalCents)} in project fees, of which the electrical permit is ${cents(trade)} — 15% of the permit fee plus 15% of the review fee`,
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Washington                                                             */
  /* ---------------------------------------------------------------------- */

  /**
   * King County and Seattle are the first pair on this site whose permits come from
   * different authorities *within* one project: the county prices building work, the
   * county health department prices plumbing in both jurisdictions, and the state prices
   * electrical work. So this section checks three things that are not the same check —
   * that the county's two valuation tables close at all twelve seams from PostgreSQL's
   * own copy of the rules, that the surcharge really does depend on the occupancy fact,
   * and that Seattle's index is stored as one number charged twice rather than as two
   * rows that could drift.
   */
  section("Washington: two tables, three authorities, recomputed from PostgreSQL");

  const kingContext = await getJurisdictionContext("washington", "king-county");
  if (!kingContext) {
    bad("query layer", "getJurisdictionContext(washington, king-county) returned null");
    process.exit(1);
  }
  ok(
    "query layer",
    `Washington → ${kingContext.jurisdiction.name}, ${kingContext.sources.length} sources`,
  );

  const kingBuilding = await getPermitPageDetail(
    kingContext.jurisdiction.id,
    "building-permit-cost",
  );
  if (!kingBuilding) {
    bad("King County building page", "did not resolve");
  } else {
    const at = (
      valuationCents: number,
      custom?: Record<string, string | number | boolean | null | undefined>,
    ) =>
      calculatePermitFees(
        { asOf, valuationCents, ...(custom ? { custom } : {}) },
        kingBuilding.feeRuleRecords,
      );
    const sumOf = (valuationCents: number, componentType: string) =>
      at(valuationCents)
        .components.filter((component) => component.componentType === componentType)
        .reduce((sum, component) => sum + component.amountCents, 0);

    for (const [valuationCents, review, inspection, label] of [
      [2_500_000, 78_800, 129_800, "$25,000"],
      [5_000_000, 130_300, 206_800, "$50,000"],
      [10_000_000, 198_800, 315_300, "$100,000"],
      [50_000_000, 654_800, 999_300, "$500,000"],
      [100_000_000, 1_054_800, 1_684_300, "$1,000,000"],
      [500_000_000, 3_794_800, 5_804_300, "$5,000,000"],
    ] as Array<[number, number, number, string]>) {
      check(
        `King County's two tables at ${label}`,
        sumOf(valuationCents, "plan_review") === review &&
          sumOf(valuationCents, "inspection") === inspection,
        `${cents(sumOf(valuationCents, "plan_review"))} of review and ${cents(sumOf(valuationCents, "inspection"))} of inspection`,
      );
    }

    check(
      "King County's worked example, both tables and the surcharge",
      at(120_000_000).totalCents === 3_084_600,
      `${cents(at(120_000_000).totalCents)} at $1,200,000`,
    );

    check(
      "King County prorates inside a thousand, because neither guide says \"or fraction thereof\"",
      sumOf(1_250_000, "plan_review") === 44_550 &&
        sumOf(1_260_000, "plan_review") === 44_824,
      `${cents(sumOf(1_250_000, "plan_review"))} at $12,500 and ${cents(sumOf(1_260_000, "plan_review"))} at $12,600 — 12.5 and 12.6 thousands, where rounding up would give $459.20 and $448.24`,
    );

    const surchargeAt = (custom?: Record<string, string | number | boolean>) =>
      at(2_500_000, custom)
        .components.filter((component) => component.componentType === "state_surcharge")
        .reduce((sum, component) => sum + component.amountCents, 0);
    check(
      "King County's surcharge follows the occupancy, at the two amounts its two guides print",
      surchargeAt() === 2_500 &&
        surchargeAt({ building_class: "single_family" }) === 650 &&
        surchargeAt({ building_class: "residential" }) === 650,
      `${cents(surchargeAt())} commercial and ${cents(surchargeAt({ building_class: "single_family" }))} single-family`,
    );
    const surchargeWithUnits = (units: number) =>
      calculatePermitFees({ asOf, valuationCents: 2_500_000, units }, kingBuilding.feeRuleRecords)
        .components.filter((component) => component.componentType === "state_surcharge")
        .reduce((sum, component) => sum + component.amountCents, 0);
    check(
      "King County's surcharge adds $2 per dwelling unit after the first",
      surchargeWithUnits(1) === 2_500 && surchargeWithUnits(4) === 2_500 + 600,
      `${cents(surchargeWithUnits(1))} at one unit and ${cents(surchargeWithUnits(4))} at four`,
    );
  }

  const kingPlumbing = await getPermitPageDetail(
    kingContext.jurisdiction.id,
    "plumbing-permit-cost",
  );
  if (!kingPlumbing) {
    bad("King County plumbing page", "did not resolve");
  } else {
    const feeAtFixtures = (fixtures: number) =>
      calculatePermitFees({ asOf, fixtures }, kingPlumbing.feeRuleRecords).totalCents;
    check(
      "King County's plumbing base is a charge rather than a first fixture",
      feeAtFixtures(1) === 16_400 && feeAtFixtures(3) === 21_800,
      `${cents(feeAtFixtures(1))} for one fixture and ${cents(feeAtFixtures(3))} for three`,
    );
  }

  const kingElectrical = await getPermitPageDetail(
    kingContext.jurisdiction.id,
    "electrical-permit-cost",
  );
  if (!kingElectrical) {
    bad("King County electrical page", "did not resolve");
  } else {
    const electrical = (custom: Record<string, string | number | boolean>) =>
      calculatePermitFees({ asOf, custom }, kingElectrical.feeRuleRecords).totalCents;
    check(
      "Washington's electrical schedule prices a service by amperage, residential against commercial",
      electrical({ schedule_item: "altered_service", service_amps: 200 }) === 10_990 &&
        electrical({ schedule_item: "commercial_altered_service", service_amps: 200 }) === 12_940 &&
        electrical({ schedule_item: "altered_service", service_amps: 601 }) === 24_270,
      `$109.90 residential at 200 A, $129.40 commercial at the same amperage, $242.70 at 601 A`,
    );
    check(
      "Washington's residential circuit row stops at the cost of a complete altered service",
      electrical({ circuits: 6 }) === 9_520 && electrical({ circuits: 200 }) === 10_990,
      `${cents(electrical({ circuits: 6 }))} at six circuits and ${cents(electrical({ circuits: 200 }))} at two hundred — the $109.90 ceiling of a 0-200 A service`,
    );
    check(
      "Washington charges nothing when no item is named",
      electrical({ service_amps: 200 }) === 0,
      `${cents(electrical({ service_amps: 200 }))} for an amperage with no item`,
    );
  }

  const seattleContext = await getJurisdictionContext("washington", "seattle");
  if (!seattleContext) {
    bad("query layer", "getJurisdictionContext(washington, seattle) returned null");
    process.exit(1);
  }
  ok(
    "query layer",
    `Washington → ${seattleContext.jurisdiction.name}, ${seattleContext.sources.length} sources`,
  );

  const seattleBuilding = await getPermitPageDetail(
    seattleContext.jurisdiction.id,
    "building-permit-cost",
  );
  if (!seattleBuilding) {
    bad("Seattle building page", "did not resolve");
  } else {
    const atSeattle = (
      valuationCents: number,
      custom?: Record<string, string | number | boolean>,
    ) =>
      calculatePermitFees(
        { asOf, valuationCents, ...(custom ? { custom } : {}) },
        seattleBuilding.feeRuleRecords,
      );
    const component = (valuationCents: number, componentType: string) =>
      atSeattle(valuationCents)
        .components.filter((entry) => entry.componentType === componentType)
        .reduce((sum, entry) => sum + entry.amountCents, 0);

    check(
      "Seattle's index is one number charged twice, from PostgreSQL's copy of the rules",
      component(200_000_000, "base") === 1_498_400 &&
        component(200_000_000, "plan_review") === 1_498_400,
      `${cents(component(200_000_000, "base"))} as the permit fee and the same again as plan review at $2,000,000`,
    );
    check(
      "Seattle's index closes at its seams",
      component(150_000_000, "base") === 1_173_400 &&
        component(150_000_001, "base") === 1_173_400 + 650,
      `${cents(component(150_000_000, "base"))} at $1,500,000 and ${cents(component(150_000_001, "base"))} one cent above it`,
    );
    check(
      "Seattle's technology fee is 5% of the components it applies to",
      component(200_000_000, "technology") === (1_498_400 + 1_498_400) / 20,
      `${cents(component(200_000_000, "technology"))} on a $29,968.00 pre-surcharge bill`,
    );
    check(
      "Seattle's worked example, all four lines",
      atSeattle(200_000_000, { building_class: "commercial" }).totalCents === 3_149_140 &&
        atSeattle(200_000_000).totalCents === 3_147_290,
      `${cents(atSeattle(200_000_000, { building_class: "commercial" }).totalCents)} commercial against ${cents(atSeattle(200_000_000).totalCents)} residential — the state fee is the only difference`,
    );
    check(
      "Seattle's subject-to-field-inspection review is 40% of the index",
      component(200_000_000, "plan_review") === 1_498_400 &&
        atSeattle(200_000_000, { review_type: "stfi", building_class: "commercial" })
          .totalCents === 2_205_148,
      `${cents(atSeattle(200_000_000, { review_type: "stfi", building_class: "commercial" }).totalCents)} with the review at 40% on the commercial example`,
    );
  }

  const seattleElectrical = await getPermitPageDetail(
    seattleContext.jurisdiction.id,
    "electrical-permit-cost",
  );
  if (!seattleElectrical) {
    bad("Seattle electrical page", "did not resolve");
  } else {
    const electrical = (custom: Record<string, string | number | boolean>) =>
      calculatePermitFees({ asOf, custom }, seattleElectrical.feeRuleRecords);
    const itemRowsOf = (custom: Record<string, string | number | boolean>) =>
      electrical(custom).components.filter(
        (entry) =>
          entry.code.startsWith("ELEC-SERVICE") || entry.code.startsWith("ELEC-BRANCH-CIRCUIT"),
      ).length;

    check(
      "Seattle's electrical items are gated by kind of work, not by amperage alone",
      electrical({ electrical_item: "service", service_amps: 200 }).totalCents === 36_485 &&
        electrical({ electrical_item: "branch_circuit", service_amps: 200, circuits: 1 })
          .totalCents < 36_485,
      `$364.85 for a 200 A service against ${cents(electrical({ electrical_item: "branch_circuit", service_amps: 200, circuits: 1 }).totalCents)} for a 200 A branch circuit`,
    );
    check(
      "Seattle charges one electrical item at a time",
      itemRowsOf({ electrical_item: "branch_circuit", service_amps: 200, circuits: 1 }) === 1 &&
        itemRowsOf({ electrical_item: "service", service_amps: 200 }) === 1,
      "one service row, one branch-circuit row, never both",
    );
    check(
      "Seattle adds the administrative fee to the item, and the technology fee on top",
      electrical({ electrical_item: "service", service_amps: 200 }).totalCents ===
        29_200 + 5_548 + Math.trunc((29_200 + 5_548) / 20),
      `${cents(electrical({ electrical_item: "service", service_amps: 200 }).totalCents)} from a $292.00 service, $55.48 of administration and 5% of both`,
    );
  }

  const seattlePlumbing = await getPermitPageDetail(
    seattleContext.jurisdiction.id,
    "plumbing-permit-cost",
  );
  if (!seattlePlumbing) {
    bad("Seattle plumbing page", "did not resolve");
  } else {
    const seattleRules = seattlePlumbing.feeRuleRecords.map((rule) => rule.code).sort();
    const countyRules = (kingPlumbing?.feeRuleRecords ?? []).map((rule) => rule.code).sort();
    check(
      "Seattle's plumbing rules are the county's records rather than a second transcription",
      seattleRules.length === countyRules.length &&
        seattleRules.every((code, index) => code === countyRules[index]),
      `${seattleRules.length} rule(s) in each, identical by code`,
    );
    check(
      "Seattle's plumbing fee is the county's published arithmetic",
      calculatePermitFees({ asOf, fixtures: 4 }, seattlePlumbing.feeRuleRecords).totalCents === 24_500,
      `${cents(calculatePermitFees({ asOf, fixtures: 4 }, seattlePlumbing.feeRuleRecords).totalCents)} for four fixtures`,
    );
  }

  /**
   * Oregon: one department, two jurisdictions, and a fee table the two documents share.
   *
   * The checks below are about that relationship rather than about a single schedule:
   * the building permit fee table is the same in the city's document and the county's, the
   * two trade schedules are identical in every amount, the 12% state surcharge is the
   * state's in both — and the city charges a Development Services Fee on the same valuation
   * that the county does not, which is the whole of the difference between them.
   */
  section("Oregon: one department, two schedules, recomputed from PostgreSQL");

  const portlandContext = await getJurisdictionContext("oregon", "portland");
  if (!portlandContext) {
    bad("query layer", "getJurisdictionContext(oregon, portland) returned null");
    process.exit(1);
  }
  ok(
    "query layer",
    `Oregon → ${portlandContext.jurisdiction.name}, ${portlandContext.sources.length} sources`,
  );

  const multnomahContext = await getJurisdictionContext("oregon", "multnomah-county");
  if (!multnomahContext) {
    bad("query layer", "getJurisdictionContext(oregon, multnomah-county) returned null");
    process.exit(1);
  }
  ok(
    "query layer",
    `Oregon → ${multnomahContext.jurisdiction.name}, ${multnomahContext.sources.length} sources`,
  );

  const portlandBuilding = await getPermitPageDetail(
    portlandContext.jurisdiction.id,
    "building-permit-cost",
  );
  const multnomahBuilding = await getPermitPageDetail(
    multnomahContext.jurisdiction.id,
    "building-permit-cost",
  );
  if (!portlandBuilding || !multnomahBuilding) {
    bad("Oregon building pages", "one of the two did not resolve");
  } else {
    const atPortland = (
      valuationCents: number,
      custom?: Record<string, string | number | boolean>,
    ) =>
      calculatePermitFees(
        { asOf, valuationCents, ...(custom ? { custom } : {}) },
        portlandBuilding.feeRuleRecords,
      );
    const atMultnomah = (
      valuationCents: number,
      custom?: Record<string, string | number | boolean>,
    ) =>
      calculatePermitFees(
        { asOf, valuationCents, ...(custom ? { custom } : {}) },
        multnomahBuilding.feeRuleRecords,
      );
    const codeOf = (result: ReturnType<typeof calculatePermitFees>, code: string) =>
      result.components.find((entry) => entry.code === code)?.amountCents ?? -1;
    const typeOf = (result: ReturnType<typeof calculatePermitFees>, componentType: string) =>
      result.components
        .filter((entry) => entry.componentType === componentType)
        .reduce((sum, entry) => sum + entry.amountCents, 0);

    /**
     * The five bands, at the valuation each chain closes on, in both jurisdictions. The
     * first band counts in hundreds ($3.59 per additional $100 is $35.90 per $1,000),
     * which is what makes a $2,000 valuation land exactly on the next band's opening
     * figure.
     */
    const seams: Array<[number, number, string]> = [
      [50_000, 16_700, "BUILD-FEE-1"],
      [200_000, 22_085, "BUILD-FEE-1"],
      [2_500_000, 54_078, "BUILD-FEE-2"],
      [5_000_000, 79_728, "BUILD-FEE-3"],
      [10_000_000, 113_778, "BUILD-FEE-4"],
      [20_000_000, 170_078, "BUILD-FEE-5"],
    ];
    for (const [valuationCents, expected, code] of seams) {
      const cityFee = codeOf(atPortland(valuationCents), code);
      const countyFee = codeOf(atMultnomah(valuationCents), code);
      check(
        `Oregon's building permit fee at ${cents(valuationCents)}`,
        cityFee === expected && countyFee === expected,
        `${cents(cityFee)} in the city and ${cents(countyFee)} in the county`,
      );
    }

    check(
      "Portland's worked example, all four lines",
      atPortland(25_000_000, { building_class: "commercial" }).totalCents === 415_954 &&
        codeOf(atPortland(25_000_000), "BUILD-FEE-5") === 198_228 &&
        codeOf(atPortland(25_000_000), "PLAN-REVIEW-65") === 128_848 &&
        codeOf(atPortland(25_000_000), "STATE-SURCHARGE-12") === 23_787,
      `${cents(atPortland(25_000_000, { building_class: "commercial" }).totalCents)} against ${cents(atPortland(25_000_000).totalCents)} when no occupancy is named — the commercial table either way`,
    );

    check(
      "The county's worked example, with no Development Services Fee in the total",
      atMultnomah(25_000_000, { building_class: "commercial" }).totalCents === 350_863 &&
        atMultnomah(25_000_000, { building_class: "commercial" }).components.every(
          (entry) => !entry.code.startsWith("DEV-SERVICES"),
        ),
      `${cents(atMultnomah(25_000_000, { building_class: "commercial" }).totalCents)} and no city fee of any kind`,
    );

    for (const valuationCents of [25_000_000, 100_000_000, 500_000_000]) {
      const city = atPortland(valuationCents, { building_class: "commercial" });
      const county = atMultnomah(valuationCents, { building_class: "commercial" });
      const cityOnly = typeOf(city, "other");
      check(
        `Oregon's two jurisdictions differ by the city's own fee at ${cents(valuationCents)}`,
        cityOnly > 0 && city.totalCents - county.totalCents === cityOnly,
        `${cents(city.totalCents)} and ${cents(county.totalCents)}, ${cents(cityOnly)} apart`,
      );
    }

    check(
      "Oregon's plan review and surcharge are percentages of the permit fee, not of the total",
      codeOf(atPortland(25_000_000), "PLAN-REVIEW-65") === Math.round((198_228 * 65) / 100) &&
        codeOf(atPortland(25_000_000), "STATE-SURCHARGE-12") === Math.round((198_228 * 12) / 100),
      `${cents(codeOf(atPortland(25_000_000), "PLAN-REVIEW-65"))} of review and ${cents(codeOf(atPortland(25_000_000), "STATE-SURCHARGE-12"))} of surcharge on a ${cents(198_228)} permit fee`,
    );

    /**
     * The city-only table's first seam. The commercial version does not close with its
     * own second band — the money is ninety cents apart, in the document — and the
     * residential version does.
     */
    check(
      "Portland's Development Services Fee does not close at its first commercial seam",
      codeOf(atPortland(2_000_00, { building_class: "commercial" }), "DEV-SERVICES-COMMERCIAL-1") === 4_389 &&
        codeOf(atPortland(2_001_00, { building_class: "commercial" }), "DEV-SERVICES-COMMERCIAL-2") === 4_479 + 469,
      `${cents(codeOf(atPortland(2_000_00, { building_class: "commercial" }), "DEV-SERVICES-COMMERCIAL-1"))} at $2,000 against the $44.79 its next band opens with`,
    );
    check(
      "Portland's residential Development Services Fee does close at its first seam",
      codeOf(atPortland(2_000_00, { building_class: "residential" }), "DEV-SERVICES-RESIDENTIAL-1") === 3_574 &&
        codeOf(atPortland(2_001_00, { building_class: "residential" }), "DEV-SERVICES-RESIDENTIAL-2") === 3_574 + 374,
      `${cents(codeOf(atPortland(2_000_00, { building_class: "residential" }), "DEV-SERVICES-RESIDENTIAL-1"))} at $2,000 against the $35.74 its next band opens with`,
    );
    check(
      "only one Development Services table applies at a time",
      atPortland(25_000_000).components.filter((entry) => entry.code.startsWith("DEV-SERVICES")).length === 1 &&
        atPortland(25_000_000, { building_class: "residential" }).components.filter((entry) =>
          entry.code.startsWith("DEV-SERVICES-RESIDENTIAL"),
        ).length === 1,
      "the commercial table for an unnamed or commercial occupancy, the residential one for a dwelling",
    );
  }

  const portlandElectrical = await getPermitPageDetail(
    portlandContext.jurisdiction.id,
    "electrical-permit-cost",
  );
  const multnomahElectrical = await getPermitPageDetail(
    multnomahContext.jurisdiction.id,
    "electrical-permit-cost",
  );
  if (!portlandElectrical || !multnomahElectrical) {
    bad("Oregon electrical pages", "one of the two did not resolve");
  } else {
    const electricalAt = (
      detail: typeof portlandElectrical,
      input: Omit<Parameters<typeof calculatePermitFees>[0], "asOf">,
    ) => calculatePermitFees({ asOf, ...input }, detail.feeRuleRecords);
    const circuitCase = { custom: { electrical_item: "service", service_amps: 200, circuits: 6 } };
    const circuitsOnly = { custom: { electrical_item: "circuits", circuits: 6 } };
    const packageCase = {
      squareFootage: 1_700,
      custom: { electrical_item: "residential_package" },
    };

    check(
      "Oregon's branch circuits cost $21.00 each on a permit that bought a service",
      electricalAt(portlandElectrical, circuitCase).totalCents === 46_306 &&
        electricalAt(multnomahElectrical, circuitCase).totalCents === 46_306,
      `${cents(electricalAt(portlandElectrical, circuitCase).totalCents)} in both jurisdictions`,
    );
    check(
      "Oregon's first circuit without a service costs $174.00, not $21.00",
      electricalAt(portlandElectrical, circuitsOnly).totalCents === 38_223 &&
        electricalAt(portlandElectrical, circuitsOnly).components.find(
          (entry) => entry.code === "ELEC-CIRCUITS-WITHOUT-SERVICE",
        )?.amountCents === 17_400 + 2_100 * 5,
      `${cents(electricalAt(portlandElectrical, circuitsOnly).totalCents)} for the same six circuits filed without a service`,
    );
    check(
      "Oregon's residential square-foot package rounds up in 500-square-foot steps",
      electricalAt(portlandElectrical, packageCase).components.find(
        (entry) => entry.code === "ELEC-RESIDENTIAL-SQFT-PACKAGE",
      )?.amountCents === 59_400 &&
        electricalAt(portlandElectrical, { ...packageCase, squareFootage: 1_001 }).components.find(
          (entry) => entry.code === "ELEC-RESIDENTIAL-SQFT-PACKAGE",
        )?.amountCents === 50_100,
      `${cents(59_400)} at 1,700 square feet and a whole 500-square-foot portion more at 1,001`,
    );
    check(
      "Oregon's electrical permits are 25% plan review, not the building permit's 65%",
      electricalAt(portlandElectrical, circuitCase).components.some(
        (entry) => entry.code === "ELEC-PLAN-REVIEW-25",
      ) &&
        !electricalAt(portlandElectrical, circuitCase).components.some(
          (entry) => entry.code === "PLAN-REVIEW-65",
        ),
      `${cents(electricalAt(portlandElectrical, circuitCase).components.find((entry) => entry.code === "ELEC-PLAN-REVIEW-25")?.amountCents ?? 0)} of review on a $338.00 electrical permit fee`,
    );
  }

  const portlandPlumbing = await getPermitPageDetail(
    portlandContext.jurisdiction.id,
    "plumbing-permit-cost",
  );
  const multnomahPlumbing = await getPermitPageDetail(
    multnomahContext.jurisdiction.id,
    "plumbing-permit-cost",
  );
  if (!portlandPlumbing || !multnomahPlumbing) {
    bad("Oregon plumbing pages", "one of the two did not resolve");
  } else {
    const dwelling = { custom: { dwelling_scope: "new_1_2_family", bathrooms: 2 } };
    const fixtures = { fixtures: 4 };
    const atPlumbing = (
      detail: typeof portlandPlumbing,
      input: Omit<Parameters<typeof calculatePermitFees>[0], "asOf">,
    ) => calculatePermitFees({ asOf, ...input }, detail.feeRuleRecords);

    check(
      "Oregon prices a new dwelling by its baths, and the county's schedule agrees",
      atPlumbing(portlandPlumbing, dwelling).totalCents === 162_619 &&
        atPlumbing(multnomahPlumbing, dwelling).totalCents === 162_619,
      `${cents(atPlumbing(portlandPlumbing, dwelling).totalCents)} for a two-bath house in both`,
    );
    check(
      "Oregon charges $63.00 a fixture for anything that is not a new dwelling",
      atPlumbing(portlandPlumbing, fixtures).totalCents === 34_524 &&
        atPlumbing(multnomahPlumbing, fixtures).totalCents === 34_524,
      `${cents(atPlumbing(portlandPlumbing, fixtures).totalCents)} for four fixtures`,
    );
    check(
      "Oregon never charges the bath rows and the fixture rows to one permit",
      !atPlumbing(portlandPlumbing, { ...dwelling, fixtures: 6 }).components.some(
        (entry) => entry.code === "PLUMB-FIXTURE-EACH",
      ) &&
        !atPlumbing(portlandPlumbing, fixtures).components.some((entry) =>
          entry.code.startsWith("PLUMB-DWELLING"),
        ),
      "a two-bath house with six fixtures entered pays the bath row and no fixture line",
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Illinois                                                               */
  /* ---------------------------------------------------------------------- */

  section("Illinois: the product of two published tables, recomputed from PostgreSQL");

  const chicagoContext = await getJurisdictionContext("illinois", "chicago");
  if (!chicagoContext) {
    bad("query layer", "getJurisdictionContext(illinois, chicago) returned null");
    process.exit(1);
  }
  ok(
    "query layer",
    `Illinois → ${chicagoContext.jurisdiction.name}, ${chicagoContext.sources.length} sources`,
  );

  const chicagoBuilding = await getPermitPageDetail(
    chicagoContext.jurisdiction.id,
    "building-permit-cost",
  );
  if (!chicagoBuilding) {
    bad("Chicago building page", "did not resolve");
  } else {
    const atBuilding = (
      occupancy_group: string,
      construction_type: string,
      scope: string,
      squareFootage: number,
      extra: Record<string, string | number | boolean> = {},
    ) => {
      const { units, ...custom } = extra;
      return calculatePermitFees(
        {
          asOf,
          squareFootage,
          ...(typeof units === "number" ? { units } : {}),
          custom: { occupancy_group, construction_type, scope, ...custom },
        },
        chicagoBuilding.feeRuleRecords,
      );
    };
    const codeOf = (result: ReturnType<typeof calculatePermitFees>, code: string) =>
      result.components.find((entry) => entry.code === code)?.amountCents ?? -1;

    /**
     * The formula at the four amounts this site publishes. Each is the product of a
     * construction factor and a scope factor from two different tables, charged against
     * the area — a rate no single rule holds, which is what the tables exist to express.
     */
    const figures: Array<[string, string, string, string, number, number]> = [
      ["B", "II", "new_multi_story", "10,000 sq ft", 10_000, 780_000],
      ["A", "I", "new_all", "42,000 sq ft", 42_000, 4_074_000],
      ["R-2", "III", "new_small_residential", "2,400 sq ft", 2_400, 245_000],
      ["B", "II", "rehab_level1", "1,500 sq ft", 1_500, 60_200],
    ];
    for (const [group, type, scope, area, squareFootage, expected] of figures) {
      const fee = atBuilding(group, type, scope, squareFootage, { units: 3 });
      check(
        `Chicago Group ${group} Type ${type} ${scope} at ${area}`,
        fee.totalCents === expected,
        `${cents(fee.totalCents)} against the published ${cents(expected)}`,
      );
    }

    check(
      "Chicago's row minimum and city-wide floor are both applied, the larger winning",
      atBuilding("B", "II", "rehab_level1", 1_500).totalCents === 60_200 &&
        atBuilding("B", "II", "new_tenant_buildout", 200, { stories: 2 }).totalCents === 180_000 &&
        atBuilding("R-2", "III", "rehab_porch_balcony", 200, { units: 5 }).totalCents === 125_000,
      "$602.00 at the city-wide floor, $1,800.00 on the $900-per-story row and $1,250.00 on the $250-per-unit row",
    );
    check(
      "Chicago gives a temporary structure the $302 floor footnote c prints for it",
      atBuilding("U", "V", "new_temporary_structure", 800).totalCents === 30_200,
      `${cents(atBuilding("U", "V", "new_temporary_structure", 800).totalCents)} rather than $602.00`,
    );
    check(
      "Chicago's demolition is flat, outside the formula",
      atBuilding("B", "II", "demolition_ordinary", 0).totalCents === 60_200 &&
        atBuilding("B", "II", "demolition_complex", 0).totalCents === 245_000,
      `${cents(60_200)} ordinary and ${cents(245_000)} complex`,
    );
    check(
      "Chicago's two formula tables do not both apply to one project",
      atBuilding("B", "II", "new_multi_story", 10_000).components.length === 1 &&
        atBuilding("B", "II", "new_multi_story", 10_000).excluded.some((entry) =>
          entry.detail.includes("publishes no rate"),
        ),
      "the rehabilitation rule is excluded for publishing no rate rather than charged as well",
    );

    const chicagoElectrical = await getPermitPageDetail(
      chicagoContext.jurisdiction.id,
      "electrical-permit-cost",
    );
    const chicagoPlumbing = await getPermitPageDetail(
      chicagoContext.jurisdiction.id,
      "plumbing-permit-cost",
    );
    if (!chicagoElectrical || !chicagoPlumbing) {
      bad("Chicago trade pages", "the electrical or the plumbing page did not resolve");
    } else {
      const serviceAndCircuits = calculatePermitFees(
        { asOf, custom: { service_amperage: 200, new_circuits: 18 } },
        chicagoElectrical.feeRuleRecords,
      );
      const withGenerator = calculatePermitFees(
        {
          asOf,
          custom: {
            service_amperage: 200,
            new_circuits: 18,
            electrical_item: "residential_generator",
          },
        },
        chicagoElectrical.feeRuleRecords,
      );
      check(
        "Chicago's electrical stand-alone fees stack, per §14A-4-412.1",
        serviceAndCircuits.totalCents === 37_500 &&
          codeOf(serviceAndCircuits, "ELEC-SERVICE-UNDER-400") === 7_500 &&
          codeOf(serviceAndCircuits, "ELEC-CIRCUITS-11-20") === 30_000,
        `${cents(serviceAndCircuits.totalCents)} for a 200-ampere service and eighteen circuits`, 
      );
      check(
        "Chicago's residential generator row is $75.00 rather than $750.00",
        withGenerator.totalCents === 45_000,
        `${cents(withGenerator.totalCents)} with a residential generator on the permit`,
      );

      const sixUnits = calculatePermitFees(
        { asOf, units: 6, custom: { plumbing_scope: "water_heater_or_fixtures" } },
        chicagoPlumbing.feeRuleRecords,
      );
      const withPool = calculatePermitFees(
        {
          asOf,
          units: 6,
          custom: { plumbing_scope: "water_heater_or_fixtures", pool_install: true },
        },
        chicagoPlumbing.feeRuleRecords,
      );
      check(
        "Chicago's plumbing rows price per dwelling unit, and the pool flat",
        sixUnits.totalCents === 45_000 && withPool.totalCents === 85_000,
        `${cents(sixUnits.totalCents)} for six units and ${cents(withPool.totalCents)} with the pool row`,
      );
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Oak Park                                                               */
  /* ---------------------------------------------------------------------- */

  section("Oak Park: the ICC chart times a printed multiplier, recomputed from PostgreSQL");

  const oakParkContext = await getJurisdictionContext("illinois", "oak-park");
  if (!oakParkContext) {
    bad("query layer", "getJurisdictionContext(illinois, oak-park) returned null");
  } else {
    ok(
      "query layer",
      `Illinois → ${oakParkContext.jurisdiction.name}, ${oakParkContext.sources.length} sources`,
    );

    const oakParkBuilding = await getPermitPageDetail(
      oakParkContext.jurisdiction.id,
      "building-permit-cost",
    );
    if (!oakParkBuilding) {
      bad("Oak Park building page", "did not resolve");
    } else {
      const chartCell = (use_group: string, construction_type: string) =>
        calculatePermitFees(
          {
            asOf,
            squareFootage: 1_000,
            custom: { use_group, construction_type, project_scope: "new_construction_addition" },
          },
          oakParkBuilding.feeRuleRecords,
        ).totalCents;

      // The schedule's own arithmetic: 1,000 SF × $195.98 × .0194 = $3,802.01.
      check(
        "Oak Park's new-construction fee is the chart cell times .0194",
        chartCell("R-3 one and two family", "IIIA") === 380_201,
        `${cents(chartCell("R-3 one and two family", "IIIA"))} for 1,000 SF of R-3 IIIA`,
      );
      // The chart's top cell: 1,000 SF × $473.85 × .0194 = $9,192.69.
      check(
        "Oak Park reads the I-2 hospital row from the same chart",
        chartCell("I-2 hospitals", "IA") === 919_269,
        `${cents(chartCell("I-2 hospitals", "IA"))} for 1,000 SF of I-2 IA`,
      );
      // An NP cell publishes no rate: nothing is charged and nothing invented.
      const npCell = calculatePermitFees(
        {
          asOf,
          squareFootage: 5_000,
          custom: {
            use_group: "I-2 hospitals",
            construction_type: "IIIB",
            project_scope: "new_construction_addition",
          },
        },
        oakParkBuilding.feeRuleRecords,
      );
      check(
        "Oak Park's NP cells publish no rate and are excluded, not priced",
        npCell.components.length === 0 && npCell.totalCents === 0,
        `zero components for the I-2 IIIB cell the chart prints NP`,
      );
    }

    const oakParkTrades = await getPermitPageDetail(
      oakParkContext.jurisdiction.id,
      "electrical-permit-cost",
    );
    if (!oakParkTrades) {
      bad("Oak Park electrical page", "did not resolve");
    } else {
      const circuits = calculatePermitFees(
        { asOf, custom: { electrical_scope: "alteration", circuits: 12 } },
        oakParkTrades.feeRuleRecords,
      );
      check(
        "Oak Park prices electrical alterations per circuit",
        circuits.totalCents === 120_000,
        `${cents(circuits.totalCents)} for twelve circuits at $100.00 each`,
      );
    }
  }

  section("Withdrawn pages must not resolve");

  for (const slug of ["mechanical-permit-cost", "demolition-permit-cost", "roofing-permit-cost"]) {
    const detail = await getPermitPageDetail(context.jurisdiction.id, slug);
    check(`${slug} is not public`, detail === null, detail === null ? "null, route will 404" : "RESOLVED");
  }

  /* ---------------------------------------------------------------------- */
  /* Sitemap                                                               */
  /* ---------------------------------------------------------------------- */

  section("Sitemap contains exactly the indexable URLs");

  const entries = await listSitemapEntries();
  const paths = entries.map((e) => e.path).sort();
  for (const path of paths) console.log(`        ${path}`);
  // Demolition and roofing: no payload publishes either, so no path may contain
  // them. Mechanical is checked below, once the published paths are derived, so
  // that the ban is scoped to the mechanical pages no payload claims rather than
  // to a hand-counted list of the ones that do.
  for (const withdrawn of ["demolition", "roofing"]) {
    check(`sitemap omits ${withdrawn}`, !paths.join("\n").includes(withdrawn), "absent");
  }

  /**
   * Every URL the payloads say is published, derived rather than listed.
   *
   * This was a hand-written array. It stopped at Oregon while three more states had
   * already been published (North Carolina, and now Illinois), so the check that exists to
   * prove the sitemap and the routes agree was itself the thing that had fallen behind. The
   * list of what the site publishes lives in `@/content` already; this reads it.
   */
  const expectedPaths = new Set<string>();
  for (const seed of ALL_SEEDS) {
    expectedPaths.add(`/${seed.state.slug}/`);
    expectedPaths.add(`/${seed.state.slug}/${seed.jurisdiction.slug}/`);
  }
  for (const { seed, page } of ALL_PUBLISHED_PERMIT_PAGES) {
    expectedPaths.add(`/${seed.state.slug}/${seed.jurisdiction.slug}/${page.slug}/`);
  }

  for (const expected of [...expectedPaths].sort()) {
    check(`sitemap contains ${expected}`, paths.includes(expected), "present");
  }

  // Mechanical: the payloads publish exactly the mechanical pages they list —
  // Lincoln's fuel-gas permit, and Pittsburgh's, whose City issues no plumbing
  // permits at all so its third page is mechanical. A mechanical path no payload
  // claims is therefore an orphan row, and this is the check that catches it: the
  // blanket ban this replaced was scoped to a hand-counted list of publishers and
  // fell behind the moment a second one was published.
  const mechanicalOutsidePayload = paths.filter(
    (path) => path.includes("mechanical") && !expectedPaths.has(path),
  );
  check(
    "sitemap omits mechanical no payload publishes",
    mechanicalOutsidePayload.length === 0,
    "absent",
  );

  // Arizona has exactly one page, so the sitemap must not advertise trade pages
  // for Phoenix that do not exist.
  for (const absent of [
    "/arizona/phoenix/mechanical-permit-cost/",
    "/arizona/phoenix/demolition-permit-cost/",
    "/arizona/scottsdale/mechanical-permit-cost/",
    "/arizona/scottsdale/demolition-permit-cost/",
    // Nevada publishes three pages per jurisdiction and no mechanical page in
    // either, because neither schedule prices a mechanical permit for this release.
    "/nevada/clark-county/mechanical-permit-cost/",
    "/nevada/clark-county/demolition-permit-cost/",
    "/nevada/boulder-city/mechanical-permit-cost/",
    "/nevada/boulder-city/demolition-permit-cost/",
    // Colorado publishes three pages per jurisdiction and no mechanical page in
    // either city, because neither schedule prices a mechanical permit of its own
    // for this release: Denver prices trades from their own valuations and
    // Westminster as a percentage of the building permit fee.
    "/colorado/denver/mechanical-permit-cost/",
    "/colorado/denver/demolition-permit-cost/",
    "/colorado/westminster/mechanical-permit-cost/",
    "/colorado/westminster/demolition-permit-cost/",
    // Washington publishes three pages per jurisdiction. King County prices a
    // mechanical permit with the same two tables minus the state surcharge and Seattle
    // prices one as a percentage of its own index, and neither publishes a demolition
    // row this release could model, so neither has a page for either.
    "/washington/king-county/mechanical-permit-cost/",
    "/washington/king-county/demolition-permit-cost/",
    "/washington/seattle/mechanical-permit-cost/",
    "/washington/seattle/demolition-permit-cost/",
    // Oregon publishes three pages per jurisdiction. Both schedules price mechanical
    // permits — and both publish demolition rows — but neither is modelled in this
    // release, and the city's mechanical schedule was not transcribed, so there is no
    // page for either in either jurisdiction.
    "/oregon/portland/mechanical-permit-cost/",
    "/oregon/portland/demolition-permit-cost/",
    "/oregon/multnomah-county/mechanical-permit-cost/",
    "/oregon/multnomah-county/demolition-permit-cost/",
  ]) {
    check(`sitemap omits ${absent}`, !paths.includes(absent), "absent");
  }

  section("Result");
  if (failures === 0) {
    console.log("  All database-level checks passed.");
  } else {
    console.log(`  ${failures} check(s) FAILED.`);
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  console.error("Verification aborted:", error instanceof Error ? error.message : String(error));
  process.exit(1);
});
