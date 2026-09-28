import { mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

import { afterAll, describe, expect, it } from "vitest";

import { redactSecrets } from "@/lib/errors";

import { loadEnvFiles } from "../../scripts/load-env";

/**
 * Security tests.
 *
 * These guard the two ways a database credential escapes a repository:
 *
 *   1. it is committed, because the ignore rule was wrong or missing;
 *   2. it is printed, because an error path logged the connection string.
 *
 * Both are cheap to check and expensive to discover in a public repo, so they are
 * asserted rather than trusted.
 */

const REPO_ROOT = fileURLToPath(new URL("../../", import.meta.url));

/* -------------------------------------------------------------------------- */
/* .gitignore                                                                 */
/* -------------------------------------------------------------------------- */

describe(".gitignore", () => {
  const gitignore = readFileSync(join(REPO_ROOT, ".gitignore"), "utf8");
  const lines = gitignore
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"));

  it("ignores every file a real credential could be stored in", () => {
    // `.env.local` is the file Next recommends and the one the seed and
    // drizzle-kit now read, so it is the most likely place for a real URL.
    expect(lines).toContain(".env");
    expect(lines).toContain(".env.local");
    expect(lines).toContain(".env*.local");
  });

  it("keeps the template tracked so a fresh clone knows what to set", () => {
    expect(lines).toContain("!.env.example");
  });

  it("covers every env file the loaders read", () => {
    for (const file of [".env", ".env.local"]) {
      const ignored = lines.some(
        (line) => line === file || (line.includes("*") && matchesGlob(line, file)),
      );
      expect(ignored, `${file} must be ignored`).toBe(true);
    }
  });
});

/** Minimal glob match for the `*` patterns used in .gitignore. */
function matchesGlob(pattern: string, name: string): boolean {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, "[^/]*");
  return new RegExp(`^${escaped}$`).test(name);
}

/* -------------------------------------------------------------------------- */
/* Committed credentials                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Credential-shaped text that is deliberately *not* a secret.
 *
 * The canary used by the redaction tests below lives in this very file, so the
 * scanner has to be able to tell a documented example from a real one. Anything
 * obviously synthetic is allowed; anything else is a failure.
 */
const PLACEHOLDER = /(user|password|passwd|xxx|example|placeholder|redacted|dummy|canary|host|localhost|your|change[_-]?me)/i;

const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  "coverage",
  "dist",
  "out",
  ".freebuff",
  ".vscode",
  ".idea",
]);

/** Files that legitimately hold real credentials and must never be read here. */
const SKIP_FILES = /^\.env$|^\.env\.local$|^\.env\..*\.local$/;

const SCANNABLE = /\.(ts|tsx|js|mjs|cjs|json|md|sql|ya?ml|example|css|txt)$/i;

function walk(dir: string, found: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") && SKIP_DIRS.has(entry.name)) continue;
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walk(join(dir, entry.name), found);
      continue;
    }
    if (SKIP_FILES.test(entry.name)) continue;
    if (SKIP_DIRS.has(entry.name)) continue;
    if (!SCANNABLE.test(entry.name)) continue;
    found.push(join(dir, entry.name));
  }
  return found;
}

describe("committed credentials", () => {
  const files = walk(REPO_ROOT);

  it("finds files to scan (guards against a silently empty walk)", () => {
    expect(files.length).toBeGreaterThan(30);
  });

  it("contains no non-placeholder PostgreSQL connection string", () => {
    const offenders: string[] = [];
    const pattern = /postgres(?:ql)?:\/\/([^\s"'`@/]+):([^\s"'`@/]+)@([^\s"'`/?]+)/gi;

    for (const file of files) {
      const contents = readFileSync(file, "utf8");
      for (const match of contents.matchAll(pattern)) {
        const [, user, password, host] = match;
        if (!user || !password || !host) continue;
        // Any part that looks synthetically written makes the whole URL an example.
        if (PLACEHOLDER.test(user) || PLACEHOLDER.test(password) || PLACEHOLDER.test(host)) {
          continue;
        }
        offenders.push(`${relative(REPO_ROOT, file)} → ${host}`);
      }
    }

    expect(offenders, `connection strings with real-looking credentials: ${offenders.join(", ")}`).toEqual([]);
  });

  it("contains no Neon API key", () => {
    const offenders: string[] = [];

    for (const file of files) {
      const contents = readFileSync(file, "utf8");
      // Neon API keys are `npg_` + base62. Nothing in this project should hold one.
      if (/\bnpg_[A-Za-z0-9]{20,}\b/.test(contents)) {
        offenders.push(relative(REPO_ROOT, file).split(sep).join("/"));
      }
    }

    expect(offenders).toEqual([]);
  });
});

/* -------------------------------------------------------------------------- */
/* Redaction                                                                  */
/* -------------------------------------------------------------------------- */

describe("redactSecrets", () => {
  const CANARY = "postgresql://leakuser:LEAKCANARY1234@ep-real-1.us-east-2.aws.neon.tech/db";

  it("removes the whole connection string", () => {
    const redacted = redactSecrets(new Error(`connect failed: ${CANARY}`));
    expect(redacted).not.toContain("LEAKCANARY1234");
    expect(redacted).not.toContain("ep-real-1");
    expect(redacted).toContain("postgresql://[redacted]");
  });

  it("removes a password query parameter", () => {
    const redacted = redactSecrets("host=x db=permit password=LEAKCANARY1234 sslmode=require");
    expect(redacted).not.toContain("LEAKCANARY1234");
    expect(redacted).toContain("password=[redacted]");
  });

  it("removes a bare assignment to a sensitive key", () => {
    expect(redactSecrets("DATABASE_URL=LEAKCANARY1234")).not.toContain("LEAKCANARY1234");
    expect(redactSecrets("PGPASSWORD: LEAKCANARY1234")).not.toContain("LEAKCANARY1234");
  });

  it("removes a Neon API key wherever it appears", () => {
    const key = "npg_" + "A".repeat(24);
    expect(redactSecrets(`Authorization: Bearer ${key}`)).not.toContain(key);
  });

  it("keeps the parts that make an error diagnosable", () => {
    const redacted = redactSecrets(new Error("relation \"fee_rules\" does not exist"));
    expect(redacted).toContain("relation \"fee_rules\" does not exist");
  });

  it("handles the shapes an error can arrive in", () => {
    expect(redactSecrets(undefined)).toBe("undefined");
    expect(redactSecrets(null)).toBe("null");
    expect(redactSecrets({ url: CANARY })).not.toContain("LEAKCANARY1234");
    expect(redactSecrets(42)).toBe("42");

    const circular: Record<string, unknown> = {};
    circular.self = circular;
    expect(redactSecrets(circular)).toBe("[unserialisable error]");
  });
});

/* -------------------------------------------------------------------------- */
/* Environment loading                                                        */
/* -------------------------------------------------------------------------- */

describe("loadEnvFiles", () => {
  const created: string[] = [];

  afterAll(() => {
    for (const dir of created) rmSync(dir, { recursive: true, force: true });
  });

  function tempDir(files: Record<string, string>): string {
    const dir = mkdtempSync(join(tmpdir(), "pfi-env-"));
    created.push(dir);
    for (const [name, contents] of Object.entries(files)) {
      writeFileSync(join(dir, name), contents, "utf8");
    }
    return dir;
  }

  it("reads `.env.local`, the file migrations and the seed need", () => {
    const dir = tempDir({ ".env.local": "PFI_TEST_FROM_LOCAL=local\n" });
    loadEnvFiles(dir);
    expect(process.env.PFI_TEST_FROM_LOCAL).toBe("local");
    delete process.env.PFI_TEST_FROM_LOCAL;
  });

  it("gives `.env.local` precedence over `.env`, matching Next.js", () => {
    const dir = tempDir({
      ".env.local": "PFI_TEST_PRECEDENCE=local\n",
      ".env": "PFI_TEST_PRECEDENCE=base\n",
    });
    loadEnvFiles(dir);
    expect(process.env.PFI_TEST_PRECEDENCE).toBe("local");
    delete process.env.PFI_TEST_PRECEDENCE;
  });

  it("lets a real environment variable win over both files", () => {
    const dir = tempDir({
      ".env.local": "PFI_TEST_OVERRIDE=local\n",
      ".env": "PFI_TEST_OVERRIDE=base\n",
    });
    process.env.PFI_TEST_OVERRIDE = "shell";
    loadEnvFiles(dir);
    expect(process.env.PFI_TEST_OVERRIDE).toBe("shell");
    delete process.env.PFI_TEST_OVERRIDE;
  });

  it("handles quotes, comments and `export`, and reports the files it read", () => {
    const dir = tempDir({
      ".env": [
        "# a comment",
        "",
        'PFI_TEST_QUOTED="  spaced  "',
        // Only a line-leading `export ` is stripped. Here the key is
        // PFI_TEST_EXPORTED and everything after the first `=` is the value.
        "PFI_TEST_EXPORTED=export PFI_TEST_EXPORTED_VALUE=1",
        "export PFI_TEST_EXPORT=2",
        "PFI_TEST_COMMENTED=3 # trailing",
        "not a valid line",
        "PFI_TEST_TRAILING_SPACE=4   ",
      ].join("\r\n"),
    });

    const result = loadEnvFiles(dir);

    expect(result.files).toEqual([".env"]);
    expect(process.env.PFI_TEST_QUOTED).toBe("  spaced  ");
    expect(process.env.PFI_TEST_EXPORT).toBe("2");
    expect(process.env.PFI_TEST_COMMENTED).toBe("3");
    expect(process.env.PFI_TEST_TRAILING_SPACE).toBe("4");
    expect(process.env.PFI_TEST_EXPORTED).toBe("export PFI_TEST_EXPORTED_VALUE=1");
    // The embedded key is not exported under its own name: only the text before
    // the first `=` names a variable.
    expect(process.env.PFI_TEST_EXPORTED_VALUE).toBeUndefined();

    for (const key of [
      "PFI_TEST_QUOTED",
      "PFI_TEST_EXPORT",
      "PFI_TEST_COMMENTED",
      "PFI_TEST_TRAILING_SPACE",
      "PFI_TEST_EXPORTED",
    ]) {
      delete process.env[key];
    }
  });

  it("is a no-op when neither file exists, and never returns values", () => {
    const dir = mkdtempSync(join(tmpdir(), "pfi-env-empty-"));
    created.push(dir);
    expect(statSync(dir).isDirectory()).toBe(true);

    const result = loadEnvFiles(dir);
    expect(result.files).toEqual([]);
    expect(result.keys).toEqual([]);
    // The return value carries file names only — never a value that could be logged.
    expect(JSON.stringify(result)).not.toContain("PFI_TEST");
  });
});
