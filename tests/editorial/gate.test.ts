import { describe, expect, it } from "vitest";

import {
  MIN_INTRO_LENGTH,
  MIN_LOCAL_SUMMARY_LENGTH,
  evaluatePublishability,
  isVerificationFresh,
  type PublishabilityInput,
} from "@/lib/editorial";

const AS_OF = "2026-09-23";

/** A page that satisfies every requirement, as a baseline to break one field at a time. */
function passingInput(overrides: Partial<PublishabilityInput> = {}): PublishabilityInput {
  return {
    publishStatus: "published",
    noindex: false,
    intro: "x".repeat(MIN_INTRO_LENGTH),
    localSummary: "y".repeat(MIN_LOCAL_SUMMARY_LENGTH),
    sourceCount: 1,
    feeRuleCount: 3,
    lastVerifiedAt: "2026-09-01",
    faqCount: 2,
    asOf: AS_OF,
    ...overrides,
  };
}

describe("evaluatePublishability", () => {
  it("publishes and indexes a page that clears every check", () => {
    const result = evaluatePublishability(passingInput());
    expect(result.publishable).toBe(true);
    expect(result.indexable).toBe(true);
    expect(result.failures).toEqual([]);
  });

  it("refuses a draft", () => {
    const result = evaluatePublishability(passingInput({ publishStatus: "draft" }));
    expect(result.publishable).toBe(false);
    expect(result.failures.join(" ")).toContain("draft");
  });

  it("refuses a page with no prose", () => {
    const result = evaluatePublishability(passingInput({ intro: null }));
    expect(result.publishable).toBe(false);
    expect(result.failures.join(" ")).toContain("introductory section");
  });

  it("refuses a page that is not specific to its location", () => {
    const result = evaluatePublishability(passingInput({ localSummary: "  shorter  " }));
    expect(result.publishable).toBe(false);
    expect(result.failures.join(" ")).toContain("locality-specific");
  });

  it("refuses a page with no primary source", () => {
    const result = evaluatePublishability(passingInput({ sourceCount: 0 }));
    expect(result.publishable).toBe(false);
    expect(result.failures.join(" ")).toContain("no primary source");
  });

  it("refuses a page with no fees and no honest explanation for that", () => {
    const result = evaluatePublishability(passingInput({ feeRuleCount: 0 }));
    expect(result.publishable).toBe(false);
    expect(result.failures.join(" ")).toContain("no fee schedule is published");
  });

  it("allows an honest 'no published schedule' page", () => {
    const result = evaluatePublishability(
      passingInput({ feeRuleCount: 0, hasNoScheduleStatement: true }),
    );
    expect(result.publishable).toBe(true);
  });

  it("refuses a page that has never been verified", () => {
    const result = evaluatePublishability(passingInput({ lastVerifiedAt: null }));
    expect(result.publishable).toBe(false);
    expect(result.failures.join(" ")).toContain("never been verified");
  });

  it("publishes but does not index a page that is explicitly noindexed", () => {
    const result = evaluatePublishability(passingInput({ noindex: true }));
    expect(result.publishable).toBe(true);
    expect(result.indexable).toBe(false);
    expect(result.warnings.join(" ")).toContain("excluded from search");
  });

  it("warns rather than fails when there are no FAQs", () => {
    const result = evaluatePublishability(passingInput({ faqCount: 0 }));
    expect(result.publishable).toBe(true);
    expect(result.warnings.join(" ")).toContain("No FAQs");
  });

  it("warns when verification has aged past the review window", () => {
    const result = evaluatePublishability(passingInput({ lastVerifiedAt: "2025-01-01" }));
    expect(result.publishable).toBe(true);
    expect(result.warnings.join(" ")).toContain("due for review");
  });

  it("reports every failure at once rather than one at a time", () => {
    const result = evaluatePublishability({
      publishStatus: "draft",
      noindex: true,
      intro: null,
      localSummary: null,
      sourceCount: 0,
      feeRuleCount: 0,
      lastVerifiedAt: null,
      faqCount: 0,
      asOf: AS_OF,
    });

    expect(result.publishable).toBe(false);
    expect(result.failures.length).toBe(6);
  });
});

describe("isVerificationFresh", () => {
  it("is true inside the window and false outside it", () => {
    expect(isVerificationFresh("2026-09-01", AS_OF)).toBe(true);
    expect(isVerificationFresh("2026-01-01", AS_OF)).toBe(false);
  });

  it("is false when there is no verification date", () => {
    expect(isVerificationFresh(null, AS_OF)).toBe(false);
  });

  it("treats the boundary itself as fresh", () => {
    // 2026-05-26 is exactly 120 days before 2026-09-23.
    expect(isVerificationFresh("2026-05-26", AS_OF, 120)).toBe(true);
    expect(isVerificationFresh("2026-05-25", AS_OF, 120)).toBe(false);
  });
});
