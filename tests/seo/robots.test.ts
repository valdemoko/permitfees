import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * `robots.txt`.
 *
 * Tested by importing the real route handler, because the directives it emits are
 * the thing that matters, not the shape of the object. Two properties are worth
 * locking down:
 *
 *   1. A non-indexable deployment disallows everything. That default is what
 *      stops a preview build from being indexed, so it is asserted explicitly.
 *   2. The `Sitemap:` directive points at the file. `/sitemap.xml/` answers `308`
 *      and redirects, which is what the page-URL helper would have produced.
 */

async function robotsWithEnv(indexable: string | undefined) {
  if (indexable === undefined) delete process.env.NEXT_PUBLIC_SITE_INDEXABLE;
  else process.env.NEXT_PUBLIC_SITE_INDEXABLE = indexable;

  // `site.ts` reads the environment when it is first evaluated, so the module
  // graph has to be rebuilt for the flag to take effect.
  vi.resetModules();
  const module = await import("@/app/robots");
  return module.default();
}

afterEach(() => {
  delete process.env.NEXT_PUBLIC_SITE_INDEXABLE;
  vi.resetModules();
});

describe("robots", () => {
  it("disallows everything when the deployment is not marked indexable", async () => {
    const rules = await robotsWithEnv(undefined);

    expect(rules.rules).toEqual([{ userAgent: "*", disallow: "/" }]);
    expect(rules.sitemap).toBeUndefined();
  });

  it("allows crawling and points at the sitemap when it is", async () => {
    const rules = await robotsWithEnv("true");

    expect(rules.rules).toEqual([
      { userAgent: "*", allow: "/", disallow: ["/admin/", "/api/"] },
    ]);
    expect(rules.sitemap).toBe(
      `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/sitemap.xml`,
    );
  });

  it("emits a bare host, not a URL, for the Host directive", async () => {
    const rules = await robotsWithEnv("true");

    // `Host: http://localhost:3000` is malformed; the directive takes a hostname.
    expect(rules.host).toBe(
      (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000")
        .replace(/^https?:\/\//, ""),
    );
    expect(rules.host).not.toContain("://");
  });
});
