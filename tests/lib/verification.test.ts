import { describe, expect, it } from "vitest";

import { describeVerification } from "@/lib/sources/verification";

const AS_OF = "2026-09-23";

describe("describeVerification", () => {
  it("reports a recent check as verified, with month and year only", () => {
    const result = describeVerification({ lastVerifiedAt: "2026-09-01", asOf: AS_OF });
    expect(result.status).toBe("verified");
    expect(result.tone).toBe("verified");
    expect(result.isFresh).toBe(true);
    expect(result.label).toBe("Verified Sep 2026");
    expect(result.sentence).toContain("official source");
  });

  it("flags data past the review window instead of presenting it as current", () => {
    const result = describeVerification({ lastVerifiedAt: "2025-03-01", asOf: AS_OF });
    expect(result.status).toBe("needs_review");
    expect(result.tone).toBe("caution");
    expect(result.isFresh).toBe(false);
    expect(result.sentence).toContain("may have changed");
  });

  it("says plainly when a figure has never been checked", () => {
    const result = describeVerification({ lastVerifiedAt: null, asOf: AS_OF });
    expect(result.status).toBe("unverified");
    expect(result.ageDays).toBeNull();
    expect(result.label).toBe("Not yet verified");
  });

  it("lets a disputed source override freshness, because a conflict matters more", () => {
    const result = describeVerification({
      lastVerifiedAt: "2026-09-01",
      asOf: AS_OF,
      status: "disputed",
    });
    expect(result.status).toBe("disputed");
    expect(result.tone).toBe("danger");
    expect(result.sentence).toContain("disagree");
  });

  it("honours a page-class-specific review window", () => {
    expect(
      describeVerification({ lastVerifiedAt: "2026-06-01", asOf: AS_OF, freshnessDays: 30 })
        .isFresh,
    ).toBe(false);
  });
});
