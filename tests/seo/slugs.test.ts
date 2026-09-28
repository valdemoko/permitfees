import { describe, expect, it } from "vitest";

import {
  RESERVED_ROOT_SLUGS,
  checkSlug,
  isReservedSlug,
  isValidSlug,
  normalizeSlug,
} from "@/lib/seo/slugs";
import { ROUTES } from "@/lib/seo/urls";

describe("normalizeSlug", () => {
  it("lowercases and hyphenates", () => {
    expect(normalizeSlug("Building Permit Cost")).toBe("building-permit-cost");
  });

  it("strips accents rather than dropping the letter", () => {
    expect(normalizeSlug("Cañon City")).toBe("canon-city");
    expect(normalizeSlug("San José")).toBe("san-jose");
  });

  it("removes apostrophes and expands ampersands", () => {
    expect(normalizeSlug("St. Mary's")).toBe("st-marys");
    expect(normalizeSlug("Dallas & Fort Worth")).toBe("dallas-and-fort-worth");
  });

  it("collapses runs of separators and trims them", () => {
    expect(normalizeSlug("  --Fort   Worth--  ")).toBe("fort-worth");
  });
});

describe("isValidSlug", () => {
  it("accepts the canonical shape", () => {
    expect(isValidSlug("building-permit-cost")).toBe(true);
    expect(isValidSlug("st-louis")).toBe(true);
  });

  it("rejects anything that would need encoding or could duplicate a URL", () => {
    for (const bad of ["Building", "building_permit", "building permit", "-houston", "houston-", "hou--ston", "café"]) {
      expect(isValidSlug(bad), `expected "${bad}" to be invalid`).toBe(false);
    }
  });
});

describe("checkSlug", () => {
  it("accepts a normal slug", () => {
    expect(checkSlug("houston")).toEqual({ ok: true, slug: "houston" });
  });

  it("rejects an empty slug", () => {
    expect(checkSlug("").ok).toBe(false);
  });

  it("rejects a slug longer than the column allows", () => {
    expect(checkSlug("a".repeat(97)).ok).toBe(false);
  });

  it("rejects every reserved root slug, so a content route can never be shadowed", () => {
    for (const reserved of RESERVED_ROOT_SLUGS) {
      const result = checkSlug(reserved);
      expect(result.ok, `expected "${reserved}" to be rejected`).toBe(false);
    }
  });

  it("covers every static route in the reserved list", () => {
    for (const route of Object.values(ROUTES)) {
      const slug = route.replaceAll("/", "");
      if (slug === "") continue;
      expect(isReservedSlug(slug), `"${slug}" must be reserved`).toBe(true);
    }
  });

  it("allows a reserved word when the caller explicitly permits it", () => {
    expect(checkSlug("states", { allowReserved: true })).toEqual({ ok: true, slug: "states" });
  });
});
