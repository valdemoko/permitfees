import { describe, expect, it } from "vitest";

import { isCurrentPath } from "@/lib/nav";

/**
 * `isCurrentPath` decides whether a nav click is a real navigation or a link to
 * where the reader already is. The second case is the one a router cannot handle:
 * there is no navigation, so nothing resets the scroll position, and the click
 * looks broken. Getting this predicate wrong in the other direction would be
 * worse — swallowing a real navigation would trap the reader on one page.
 */

describe("isCurrentPath", () => {
  it("matches a path against itself, with or without the trailing slash", () => {
    expect(isCurrentPath("/states/", "/states/")).toBe(true);
    expect(isCurrentPath("/states", "/states/")).toBe(true);
    expect(isCurrentPath("/states/", "/states")).toBe(true);
    expect(isCurrentPath("/", "/")).toBe(true);
  });

  it("does not match a different section", () => {
    expect(isCurrentPath("/states/", "/methodology/")).toBe(false);
    expect(isCurrentPath("/methodology/", "/about/")).toBe(false);
    expect(isCurrentPath("/states/", "/")).toBe(false);
    expect(isCurrentPath("/", "/states/")).toBe(false);
  });

  it("treats a child route as a different page, because it is one", () => {
    expect(isCurrentPath("/arizona/phoenix/", "/states/")).toBe(false);
    expect(isCurrentPath("/states/", "/states/texas/")).toBe(false);
  });

  it("strips a run of trailing slashes and nothing else", () => {
    expect(isCurrentPath("/states////", "/states/")).toBe(true);
    // Case matters, because it matters in a URL. The router would not silently
    // serve the other page, and neither should this.
    expect(isCurrentPath("/States/", "/states/")).toBe(false);
  });
});
