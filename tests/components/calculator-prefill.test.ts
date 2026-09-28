import { describe, expect, it } from "vitest";

import { resolvePrefill } from "@/components/calculator/permit-fee-calculator";

/**
 * Unit tests for the calculator's contextual-prefill parser.
 *
 * The prefill is the one place where user-controlled query-string data enters
 * the calculator, so the contract matters: only the three whitelisted keys are
 * read, a selection only takes effect when the slugs exist in the catalogue,
 * and any mismatch degrades to "no prefill" rather than a broken or invented
 * selection. Unknown parameters and extra query strings must be inert.
 */

const catalogue = [
  {
    stateSlug: "texas",
    jurisdictionSlug: "houston",
    permits: [
      { permitTypeKey: "building", pageSlug: "building-permit-cost", title: null, permitTypeName: "Building" },
      { permitTypeKey: "electrical", pageSlug: "electrical-permit-cost", title: null, permitTypeName: "Electrical" },
    ],
  },
  {
    stateSlug: "minnesota",
    jurisdictionSlug: "minneapolis",
    permits: [{ permitTypeKey: "building", pageSlug: "building-permit-cost", title: null, permitTypeName: "Building" }],
  },
];

describe("resolvePrefill", () => {
  it("resolves a full state + city + permit prefill", () => {
    const result = resolvePrefill(new URLSearchParams("state=texas&city=houston&permit=building"), catalogue);
    expect(result).toEqual({ stateSlug: "texas", jurisdictionSlug: "houston", permitTypeKey: "building" });
  });

  it("resolves state + city without a permit, leaving permitTypeKey null", () => {
    const result = resolvePrefill(new URLSearchParams("state=texas&city=houston"), catalogue);
    expect(result).toEqual({ stateSlug: "texas", jurisdictionSlug: "houston", permitTypeKey: null });
  });

  it("returns null when state or city is missing", () => {
    expect(resolvePrefill(new URLSearchParams("state=texas"), catalogue)).toBeNull();
    expect(resolvePrefill(new URLSearchParams("city=houston"), catalogue)).toBeNull();
    expect(resolvePrefill(new URLSearchParams(""), catalogue)).toBeNull();
  });

  it("returns null for a state/city pair that does not exist in the catalogue", () => {
    expect(resolvePrefill(new URLSearchParams("state=texas&city=dallas"), catalogue)).toBeNull();
    expect(resolvePrefill(new URLSearchParams("state=alaska&city=houston"), catalogue)).toBeNull();
  });

  it("degrades to location-only when the permit key does not exist for the jurisdiction", () => {
    // Minneapolis has no electrical permit in the catalogue.
    const result = resolvePrefill(new URLSearchParams("state=minnesota&city=minneapolis&permit=electrical"), catalogue);
    expect(result).toEqual({ stateSlug: "minnesota", jurisdictionSlug: "minneapolis", permitTypeKey: null });
  });

  it("degrades to location-only when the permit exists but belongs to another jurisdiction", () => {
    const result = resolvePrefill(new URLSearchParams("state=minnesota&city=minneapolis&permit=electrical"), catalogue);
    expect(result?.permitTypeKey).toBeNull();
  });

  it("ignores unknown parameters entirely", () => {
    const result = resolvePrefill(
      new URLSearchParams("state=texas&city=houston&permit=building&utm_source=x&sort=price&foo=bar"),
      catalogue,
    );
    expect(result).toEqual({ stateSlug: "texas", jurisdictionSlug: "houston", permitTypeKey: "building" });
  });

  it("is case-sensitive: uppercase slugs do not match catalogue slugs", () => {
    expect(resolvePrefill(new URLSearchParams("state=Texas&city=Houston"), catalogue)).toBeNull();
  });

  it("does not match a jurisdiction whose city slug equals another state's", () => {
    // `portland` exists in two states in the real catalogue; a prefill must
    // match the exact (state, city) pair, not the first city hit.
    const twoPortlands = [
      { stateSlug: "oregon", jurisdictionSlug: "portland", permits: [] },
      { stateSlug: "maine", jurisdictionSlug: "portland", permits: [] },
    ];
    const result = resolvePrefill(new URLSearchParams("state=maine&city=portland"), twoPortlands);
    expect(result).toEqual({ stateSlug: "maine", jurisdictionSlug: "portland", permitTypeKey: null });
  });
});
