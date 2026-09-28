import "server-only";

import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";

import { getDatabaseUrl } from "@/lib/env";

import * as schema from "./schema";

/**
 * Database client.
 *
 * `server-only` guarantees a client-component import fails the build, so the
 * connection string cannot reach the browser bundle.
 *
 * The client is created once per process, on first use. The Neon HTTP driver is
 * stateless, which suits the free plan: an idle deployment holds no connection
 * and lets compute suspend.
 */

export type Database = NeonHttpDatabase<typeof schema>;

let cachedClient: Database | null = null;

/**
 * The database client, or `null` when no database is configured.
 *
 * Returning `null` rather than throwing is what allows a fresh clone, CI and
 * preview deployments to build and serve the editorial pages with no Neon
 * project at all.
 */
export function getDb(): Database | null {
  if (cachedClient) return cachedClient;

  const url = getDatabaseUrl();
  if (!url) return null;

  cachedClient = drizzle(neon(url), { schema });
  return cachedClient;
}
