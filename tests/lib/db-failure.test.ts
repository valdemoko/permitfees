import { describe, expect, it } from "vitest";

import { DatabaseUnavailableError, getStateBySlug, safeQuery } from "@/lib/db/queries";

/**
 * Block B — a query that FAILS must not be mistaken for a row that is MISSING.
 *
 * The routes turn `null` / `[]` from a *successful* query into a 404. If a
 * database outage resolved to the same fallback, every published page would
 * answer "Not Found" during the outage — telling readers and search engines
 * that existing pages no longer exist. So:
 *
 *   1. DB configured and working  -> the query returns its value (or null for a
 *      genuinely missing record, which the routes 404 — that stays).
 *   2. DB configured but failing  -> `safeQuery` throws `DatabaseUnavailableError`,
 *      which reaches `error.tsx` (controlled 500 + retry), never a 404.
 *   3. Message safety             -> the error the boundary can see must not
 *      carry connection details (the raw driver error is only logged, redacted).
 *
 * The "no database configured" case is covered separately in
 * `db-not-configured.test.ts`, because `getServerEnv()` caches on first read
 * and this file runs with the real `.env.local`.
 */

const hasDatabase = Boolean(process.env.DATABASE_URL);

describe.skipIf(!hasDatabase)("safeQuery with a configured database", () => {
  it("returns the row when the database works", async () => {
    const texas = await getStateBySlug("texas");
    expect(texas).not.toBeNull();
    expect(texas?.name).toBe("Texas");
  });

  it("returns null for a record that does not exist (the real 404 case)", async () => {
    const missing = await getStateBySlug("definitely-not-a-state");
    expect(missing).toBeNull();
  });

  it("throws DatabaseUnavailableError when the query fails instead of returning the fallback", async () => {
    const failing = async (): Promise<null> => {
      throw new Error('connect ECONNREFUSED "postgres://user:secret@host:5432/db"');
    };

    await expect(safeQuery("failingQuery", failing, null)).rejects.toBeInstanceOf(
      DatabaseUnavailableError,
    );
  });

  it("keeps connection details out of the error that reaches the boundary", async () => {
    const failing = async (): Promise<null> => {
      throw new Error("password=supersecret postgres://user:secret@host:5432/db");
    };

    const error = await safeQuery("failingQuery", failing, null).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(DatabaseUnavailableError);
    const message = (error as Error).message;
    expect(message).not.toContain("postgres://");
    expect(message).not.toContain("secret");
    expect(message).not.toContain("password=");
    // The label is kept so the server-side log line identifies the query.
    expect(message).toContain("failingQuery");
  });
});
