import type { Metadata } from "next";
import type { ReactElement } from "react";
import { afterAll, describe, expect, it, vi } from "vitest";

/**
 * Route-level flow tests: a MISSING record and an UNREADABLE database must not
 * receive the same answer.
 *
 * These tests exercise the real route components — the same `page.tsx` files
 * Next.js compiles — rather than isolated query functions, because the failure
 * the 2026-09-28 audit found lives in the *route's* decision to turn a falsy
 * query result into `notFound()`. A mock of `safeQuery` alone would never catch
 * that regression.
 *
 * The "database down" scenarios are not mocks of the query layer: they run the
 * real components against a genuinely broken PostgreSQL endpoint (a connection
 * that is refused), so the whole chain — driver, drizzle, `safeQuery`,
 * `DatabaseUnavailableError`, the route's catch and its `generateMetadata`
 * fallback — is the production chain.
 *
 * The 404 scenarios use real slugs against the configured database, so "the
 * row genuinely does not exist" means exactly what it means in production.
 *
 * suites that read the real database are skipped when `DATABASE_URL` is absent
 * (fresh clone, CI without secrets) — the same rule the integration suite uses.
 */

const ORIGINAL_DATABASE_URL = process.env.DATABASE_URL;

/** A syntactically valid PostgreSQL URL pointing at a port nothing listens on. */
const BROKEN_DATABASE_URL = "postgres://outage@example.com:1/no-such-database";

/**
 * The exact error Next.js uses to render a 404. The mock replaces
 * `next/navigation`'s `notFound()` with this, so a test can assert "the route
 * took the not-found path" the same way Next itself would judge it.
 */
const { NotFoundError } = vi.hoisted(() => {
  class NotFoundError extends Error {
    readonly digest = "NEXT_HTTP_ERROR_FALLBACK;404";
    constructor() {
      super("This page could not be found.");
      this.name = "NotFoundError";
    }
  }
  return { NotFoundError };
});

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new NotFoundError();
  }),
}));

type RouteParams = Record<string, string>;
type PageComponent = (props: { params: Promise<RouteParams> }) => Promise<ReactElement>;
type GenerateMetadata = (props: { params: Promise<RouteParams> }) => Promise<Metadata>;

type LoadedModules = {
  renderToStaticMarkup: (element: ReactElement) => string;
  queries: typeof import("@/lib/db/queries");
  StatePage: PageComponent;
  stateGenerateMetadata: GenerateMetadata;
  CityPage: PageComponent;
  cityGenerateMetadata: GenerateMetadata;
  PermitPage: PageComponent;
  permitGenerateMetadata: GenerateMetadata;
};

/**
 * Import the routes and their query layer into a fresh module registry with the
 * given `DATABASE_URL`.
 *
 * The registry reset is what makes the broken-URL scenarios honest: the app
 * caches both the parsed environment and the database client per process, so
 * the only way to point the *real* client at the broken endpoint is to import
 * the chain anew. Every import in this helper comes from the same registry, so
 * React's renderer and the components it renders always share one copy.
 */
async function loadModules(databaseUrl: string | undefined): Promise<LoadedModules> {
  vi.resetModules();

  if (databaseUrl === undefined) {
    delete process.env.DATABASE_URL;
  } else {
    process.env.DATABASE_URL = databaseUrl;
  }

  const [reactDom, queries, stateRoute, cityRoute, permitRoute] = await Promise.all([
    import("react-dom/server"),
    import("@/lib/db/queries"),
    import("@/app/[state]/page"),
    import("@/app/[state]/[city]/page"),
    import("@/app/[state]/[city]/[permit]/page"),
  ]);

  return {
    renderToStaticMarkup: reactDom.renderToStaticMarkup,
    queries,
    StatePage: stateRoute.default as unknown as PageComponent,
    stateGenerateMetadata: stateRoute.generateMetadata as unknown as GenerateMetadata,
    CityPage: cityRoute.default as unknown as PageComponent,
    cityGenerateMetadata: cityRoute.generateMetadata as unknown as GenerateMetadata,
    PermitPage: permitRoute.default as unknown as PageComponent,
    permitGenerateMetadata: permitRoute.generateMetadata as unknown as GenerateMetadata,
  };
}

afterAll(() => {
  if (ORIGINAL_DATABASE_URL === undefined) {
    delete process.env.DATABASE_URL;
  } else {
    process.env.DATABASE_URL = ORIGINAL_DATABASE_URL;
  }
});

describe.skipIf(!ORIGINAL_DATABASE_URL)("route flow — database configured and working", () => {
  it("TEST A: an existing state/city/permit renders its content — notFound() never fires", async () => {
    const mod = await loadModules(ORIGINAL_DATABASE_URL);

    // A call to `notFound()` throws, so any of these renders completing is
    // itself the proof that the not-found path was not taken.
    const stateHtml = mod.renderToStaticMarkup(
      await mod.StatePage({ params: Promise.resolve({ state: "texas" }) }),
    );
    expect(stateHtml).toContain("Texas");

    const cityHtml = mod.renderToStaticMarkup(
      await mod.CityPage({ params: Promise.resolve({ state: "texas", city: "houston" }) }),
    );
    expect(cityHtml).toContain("Houston");

    const permitHtml = mod.renderToStaticMarkup(
      await mod.PermitPage({
        params: Promise.resolve({
          state: "texas",
          city: "houston",
          permit: "building-permit-cost",
        }),
      }),
    );
    expect(permitHtml).toContain("How this fee is calculated");
  }, 30_000);

  it("TEST A: an existing route with a permit slug that does not exist takes the 404 path", async () => {
    const mod = await loadModules(ORIGINAL_DATABASE_URL);

    await expect(
      mod.PermitPage({
        params: Promise.resolve({
          state: "texas",
          city: "houston",
          permit: "definitely-not-a-permit",
        }),
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  }, 30_000);

  it("TEST B: a city slug that does not exist takes the 404 path, not a database error", async () => {
    const mod = await loadModules(ORIGINAL_DATABASE_URL);

    await expect(
      mod.CityPage({
        params: Promise.resolve({ state: "texas", city: "definitely-not-a-city" }),
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  }, 30_000);
});

describe.skipIf(!ORIGINAL_DATABASE_URL)("route flow — database unreachable", () => {
  it("TEST C: the state route reports a database error and never takes the 404 path", async () => {
    const mod = await loadModules(BROKEN_DATABASE_URL);

    await expect(
      mod.StatePage({ params: Promise.resolve({ state: "texas" }) }),
    ).rejects.toBeInstanceOf(mod.queries.DatabaseUnavailableError);

    // Not `NotFoundError`: a real 404 would tell search engines the page is gone.
  }, 30_000);

  it("TEST D: the city route reports a database error and never takes the 404 path", async () => {
    const mod = await loadModules(BROKEN_DATABASE_URL);

    await expect(
      mod.CityPage({ params: Promise.resolve({ state: "texas", city: "houston" }) }),
    ).rejects.toBeInstanceOf(mod.queries.DatabaseUnavailableError);
  }, 30_000);

  it("TEST D: the permit route reports a database error and never takes the 404 path", async () => {
    const mod = await loadModules(BROKEN_DATABASE_URL);

    await expect(
      mod.PermitPage({
        params: Promise.resolve({
          state: "texas",
          city: "houston",
          permit: "building-permit-cost",
        }),
      }),
    ).rejects.toBeInstanceOf(mod.queries.DatabaseUnavailableError);
  }, 30_000);

  it("TEST C: generateMetadata falls back to 'Temporarily unavailable', not 'Page not found'", async () => {
    const mod = await loadModules(BROKEN_DATABASE_URL);

    // Next maps an error escaping `generateMetadata` to the not-found page, so
    // the route catches `DatabaseUnavailableError` and emits a noindex page
    // whose title says the site is unavailable — anything else would turn the
    // outage into a fleet of 404s (or a 500) in the eyes of a crawler.
    const metadata = await mod.stateGenerateMetadata({
      params: Promise.resolve({ state: "texas" }),
    });

    expect(metadata.title).toContain("Temporarily unavailable");
    expect(metadata.title).not.toContain("Page not found");
    expect(metadata.robots).toMatchObject({ index: false });
  }, 30_000);

  it("the error reaching the boundary names no connection details", async () => {
    const mod = await loadModules(BROKEN_DATABASE_URL);

    const error = await mod
      .StatePage({ params: Promise.resolve({ state: "texas" }) })
      .then(
        () => null,
        (caught: unknown) => caught,
      );

    expect(error).toBeInstanceOf(mod.queries.DatabaseUnavailableError);
    const message = (error as Error).message;
    expect(message).not.toContain("postgres://");
    expect(message).not.toContain("outage");
    expect(message).not.toContain("example.com");
  }, 30_000);
});
