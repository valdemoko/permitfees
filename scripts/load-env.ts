import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Environment loading for everything that runs *outside* Next.js.
 *
 * Next.js loads `.env.local`, then `.env`, then `.env.example`-free defaults, and
 * a real process variable always wins over all of them. Migrations and the seed
 * run in plain Node, so without this they would see only what the shell exports.
 *
 * The specific trap this closes: `drizzle-kit` bundles `dotenv` and reads `.env`
 * only. `.env.local` is the file Next recommends for secrets and the one
 * `.gitignore` protects, so a developer who follows that advice — and puts
 * `DATABASE_URL` there — would find `npm run db:migrate` and `npm run db:seed`
 * reporting a missing database URL while `npm run dev` worked fine. Both entry
 * points now call this loader instead, so there is one answer to "where do
 * environment variables come from".
 *
 * Precedence, highest first:
 *
 *   1. the real environment (so `DATABASE_URL=... npm run db:seed` overrides)
 *   2. `.env.local`
 *   3. `.env`
 *
 * Values are never logged, returned, or echoed. Only the file names are.
 */

const FILES = [".env.local", ".env"] as const;

export type LoadedEnv = {
  /** Files that existed and were read, in precedence order, for diagnostics. */
  files: string[];
  /** Keys that were taken from a file because the environment did not have them. */
  keys: string[];
};

export function loadEnvFiles(cwd: string = process.cwd()): LoadedEnv {
  const files: string[] = [];
  const keys: string[] = [];

  for (const file of FILES) {
    let contents: string;
    try {
      contents = readFileSync(resolve(cwd, file), "utf8");
    } catch {
      continue; // Absent file is normal: the environment supplies the values.
    }

    files.push(file);

    for (const rawLine of contents.split("\n")) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;

      // `export FOO=bar` is valid in a dotenv file and common in shell-derived ones.
      const body = line.startsWith("export ") ? line.slice("export ".length).trim() : line;

      const separator = body.indexOf("=");
      if (separator === -1) continue;

      const key = body.slice(0, separator).trim();
      if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;

      let value = body.slice(separator + 1).trim();

      const quote = value[0];
      if ((quote === '"' || quote === "'") && value.endsWith(quote) && value.length > 1) {
        value = value.slice(1, -1);
      } else {
        // Unquoted values may carry a trailing comment: `PORT=3000 # local`.
        const comment = value.indexOf(" #");
        if (comment !== -1) value = value.slice(0, comment).trim();
      }

      // A real environment variable always wins, which is what makes
      // `DATABASE_URL=... npm run db:seed` behave the way it reads.
      if (process.env[key] === undefined) {
        process.env[key] = value;
        keys.push(key);
      }
    }
  }

  return { files, keys };
}
