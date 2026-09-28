/**
 * Houston fee rules, re-exported for the regression tests.
 *
 * The definitions live in `src/content/houston/fee-rules.ts` on purpose. If the
 * tests held their own copy, a test could keep passing after the published data
 * changed, which is the one failure mode a financial regression suite must not
 * have. There is exactly one definition and both the seed and these tests read it.
 */
export * from "@/content/houston/fee-rules";
