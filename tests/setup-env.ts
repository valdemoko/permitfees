import { loadEnvFiles } from "../scripts/load-env";

/**
 * Environment for the test process.
 *
 * Vitest does not load `.env.local`: Vite's env handling exposes only
 * `VITE_`-prefixed variables on `import.meta.env`, and nothing at all on
 * `process.env`. The database integration suite reads `process.env.DATABASE_URL`,
 * so without this it would skip silently on a machine that *has* a database —
 * the worst outcome, because a skipped suite looks like a passing one.
 *
 * This uses the project's single loader rather than reimplementing precedence, so
 * tests, the seed and the application agree about where environment variables
 * come from. Nothing here is asserted about the contents: a test file that needs
 * a database checks for it itself and skips when it is absent.
 */

loadEnvFiles();
