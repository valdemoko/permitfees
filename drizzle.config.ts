import { defineConfig } from "drizzle-kit";

import { loadEnvFiles } from "./scripts/load-env";

/**
 * `drizzle-kit generate` works offline (it only diffs the schema against the
 * migration folder). `push` / `migrate` / `studio` require DATABASE_URL.
 *
 * drizzle-kit's own bundled dotenv reads `.env` only, so we load the files
 * ourselves — `.env.local` first, matching Next.js. `npm run dev` and
 * `npm run db:migrate` therefore read the same variable from the same place.
 * Real credentials are never committed.
 */
loadEnvFiles();

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  strict: true,
  verbose: true,
  dbCredentials: {
    // Read after `loadEnvFiles()` above. Never logged.
    url: process.env.DATABASE_URL ?? "",
  },
});
