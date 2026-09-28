import "server-only";

import { z } from "zod";

/**
 * Server environment.
 *
 * Two rules, both deliberate:
 *
 *   1. `server-only` at the top. Importing this module from a client component
 *      is a build error, so `DATABASE_URL` cannot leak into the browser bundle
 *      by accident.
 *   2. Validation happens lazily, on first access, not at module load. That is
 *      what allows `next build` and the test suite to run with no database and
 *      no `.env` file at all.
 */

const emptyToUndefined = (value: unknown): unknown =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .refine(
        (value) => value.startsWith("postgres://") || value.startsWith("postgresql://"),
        "DATABASE_URL must be a PostgreSQL connection string.",
      )
      .optional(),
  ),
  /**
   * Shared secret for the on-demand revalidation endpoint (Phase 2). Optional
   * until that endpoint exists, so it is not a required variable yet.
   */
  REVALIDATE_TOKEN: z.preprocess(emptyToUndefined, z.string().min(16).optional()),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cachedEnv: ServerEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (cachedEnv) return cachedEnv;

  const parsed = serverEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".") || "environment"}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid server environment configuration. ${details}`);
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}

/**
 * Whether a database is available.
 *
 * Every data access path checks this so the application degrades to its
 * editorial pages instead of failing, which is what lets a fresh clone, CI and
 * preview deployments build and render without Neon credentials.
 */
export function isDatabaseConfigured(): boolean {
  return getServerEnv().DATABASE_URL !== undefined;
}

/** The connection string, or `null` when no database is configured. */
export function getDatabaseUrl(): string | null {
  return getServerEnv().DATABASE_URL ?? null;
}

export function isProduction(): boolean {
  return getServerEnv().NODE_ENV === "production";
}
