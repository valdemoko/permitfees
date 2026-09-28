import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * HTTP status codes are a SEO surface, and one that fails silently.
 *
 * A global `app/loading.tsx` introduces a Suspense boundary above every route.
 * Next then flushes the shell — and its `200` — before `notFound()` has had a
 * chance to resolve, so a page that is *supposed* to be a 404 starts answering
 * `200` with the 404 body inside. Search engines treat that as a soft 404: the
 * URL stays in the index, and the sitemap gate this project spends the most
 * effort on stops meaning anything.
 *
 * This was measured, not assumed. With `src/app/loading.tsx` present:
 *
 *   /nope/                                200  (expected 404)
 *   /texas/dallas/                        200  (expected 404)
 *   /texas/houston/mechanical-permit-cost/ 200  (expected 404)
 *   /texas/houston/roofing-permit-cost/    200  (expected 404)
 *
 * With the file removed, the same build answers 404 on every one of them. So the
 * rule is a structural one: a loading boundary may not sit above a route that can
 * return "not found". These routes do exactly that, which is why there is no
 * `loading.tsx` in this project and why adding one is a regression rather than a
 * polish improvement.
 *
 * If a loading state is ever wanted, it has to be a `<Suspense>` placed *inside*
 * the page, after its existence checks have passed.
 */

const appDirectory = join(process.cwd(), "src", "app");

/** Route segments whose pages call `notFound()`, and so must keep their 404. */
const SEGMENTS_THAT_CAN_404 = ["", "[state]", "[state]/[city]", "[state]/[city]/[permit]"];

describe("route status codes", () => {
  it("keeps no loading boundary above a route that can 404", () => {
    const offenders = SEGMENTS_THAT_CAN_404.filter((segment) => {
      const file = segment ? join(appDirectory, segment, "loading.tsx") : join(appDirectory, "loading.tsx");
      try {
        readFileSync(file);
        return true;
      } catch {
        return false;
      }
    });

    expect(offenders).toEqual([]);
  });

  it("still routes 404s through a real page rather than an empty response", () => {
    // The not-found page is what makes a 404 useful: it navigates the reader to
    // the states we have published instead of ending the visit.
    const notFound = readFileSync(join(appDirectory, "not-found.tsx"), "utf8");

    expect(notFound).toContain("PageHeader");
    expect(notFound).toContain("noindex: true");
  });
});
