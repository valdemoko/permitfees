import { afterAll, describe, expect, it, vi } from "vitest";

/**
 * Block B — when NO database is configured at all (fresh clone, CI, preview
 * deployment without Neon), `safeQuery` keeps its historical behaviour and
 * returns the caller's fallback. There is no "existing record" to misreport,
 * so degrading is correct here — unlike a configured-but-unreachable database,
 * which is covered by `db-failure.test.ts`.
 *
 * This lives in its own file because `getServerEnv()` caches on first read:
 * stubbing `DATABASE_URL` has to happen before anything touches the env, and
 * vitest isolates files in their own workers.
 */

describe("safeQuery with no database configured", () => {
  it("degrades to the caller's fallback instead of throwing", async () => {
    vi.stubEnv("DATABASE_URL", "");
    try {
      const { safeQuery } = await import("@/lib/db/queries");
      const result = await safeQuery(
        "noDatabaseAtAll",
        async () => {
          throw new Error("run() must not be reached without a database client");
        },
        "fallback-value",
      );
      expect(result).toBe("fallback-value");
    } finally {
      vi.unstubAllEnvs();
    }
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });
});
