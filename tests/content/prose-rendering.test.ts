import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { ALL_SEEDS } from "@/content";
import type { JurisdictionSeed } from "@/content/seed-types";
import { parseEditorialText, parseInline, splitLead } from "@/lib/editorial/text";

/**
 * Two guards, both earned by a bug a reader found.
 *
 * The stored prose on this site is real prose — several paragraphs, bulleted
 * lists of exclusions, `**emphasis**` on the words that matter. It was being
 * rendered into a single element with `white-space: pre-line`, so a reader got one
 * grey slab, literal hyphens as list markers and literal asterisks around the
 * emphasis. Nothing failed: the content was right and the page was wrong.
 *
 * 1. **No `pre-line` left anywhere.** The specific property that turned a stored
 *    string into a wall of text is now forbidden in this codebase, so the old
 *    pattern cannot come back through a later page.
 * 2. **The parser loses nothing on real content.** For every long prose field in
 *    every jurisdiction seed, the text the reader ends up with is the stored text
 *    with the markers consumed — not a character more or less. This is the check
 *    that would have caught the original rendering.
 */

/**
 * Every jurisdiction, taken from the one list of what the site contains.
 *
 * It was six hand-written entries until a third bug of this same family was found:
 * Westminster, King County and Seattle had each been written with their paragraph
 * separators escaped one time too many, so `\n\n` reached the browser as four visible
 * characters and the published pages rendered a four-paragraph explanation as one grey
 * slab with backslashes in it. The three guards below all passed, because the list of
 * seeds they ran over was written out by hand and stopped at Boulder City — the content
 * added afterwards was never checked. Deriving the list from `ALL_SEEDS` is what makes
 * the guards apply to the next jurisdiction as well as to the last one.
 */
const SEEDS: Array<{ name: string; seed: JurisdictionSeed }> = ALL_SEEDS.map((seed) => ({
  name: seed.jurisdiction.name,
  seed,
}));

/** Every stored string that reaches a reader as prose. */
function collectProse(label: string, seed: JurisdictionSeed): Array<{ label: string; text: string }> {
  const fields: Array<{ label: string; text: string | null }> = [
    { label: `${label} profile.localContext`, text: seed.profile?.localContext ?? null },
    { label: `${label} profile.valuationBasis`, text: seed.profile?.valuationBasis ?? null },
    { label: `${label} profile.notIncluded`, text: seed.profile?.notIncluded ?? null },
    { label: `${label} profile.summary`, text: seed.profile?.summary ?? null },
  ];

  for (const rule of seed.feeRules) {
    fields.push({
      label: `${label} feeRule ${rule.rule.code}.description`,
      text: rule.rule.description,
    });
  }

  for (const source of seed.sources) {
    fields.push({ label: `${label} source ${source.key}.notes`, text: source.notes });
  }

  for (const requirement of seed.requirements) {
    fields.push({
      label: `${label} requirement ${requirement.title}.description`,
      text: requirement.description,
    });
  }

  for (const page of seed.permitPages) {
    fields.push({ label: `${label} ${page.slug}.localSummary`, text: page.localSummary });
    fields.push({ label: `${label} ${page.slug}.notIncluded`, text: page.notIncluded });
    fields.push({ label: `${label} ${page.slug}.intro`, text: page.intro });
    fields.push({
      label: `${label} ${page.slug}.workedExample.notes`,
      text: page.workedExample?.notes ?? null,
    });
    for (const faq of page.faqs ?? []) {
      fields.push({ label: `${label} ${page.slug} FAQ.answer`, text: faq.answer });
    }
  }

  return fields
    .filter((field): field is { label: string; text: string } => typeof field.text === "string")
    .filter((field) => field.text.trim().length > 0);
}

/**
 * The text a reader ends up with, from the blocks the component renders.
 *
 * Runs inside one line are concatenated with no separator, because that is what
 * the component does — they are one sentence split around an emphasised word, not
 * two sentences. Blocks and list items are separated by a space.
 */
function renderToText(text: string): string {
  return parseEditorialText(text)
    .flatMap((block) => (block.kind === "list" ? block.items : [block.content]))
    .map((runs) => runs.map((run) => run.text).join(""))
    .join(" ");
}

function normalise(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/** The stored text with the two markers the parser is allowed to consume. */
function stripMarkers(text: string): string {
  return text.replace(/\*\*/g, "").replace(/^[-*•]\s+/gm, "");
}

function sourceFiles(dir: string, extensions: string[]): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      found.push(...sourceFiles(path, extensions));
    } else if (extensions.some((extension) => path.endsWith(extension))) {
      found.push(path);
    }
  }
  return found;
}

describe("stored prose never renders as one block of text", () => {
  it("no component or stylesheet asks the browser to lay prose out with pre-line", () => {
    // `.tsx` and `.css` are where a layout property can live. The parser module is
    // the one `.ts` file that names the property, in the comment explaining why it
    // is gone, so the scan deliberately stops at the two file types that could
    // apply it.
    const offenders = sourceFiles("src", [".tsx", ".css"]).filter((path) =>
      readFileSync(path, "utf8").includes("pre-line"),
    );

    expect(offenders).toEqual([]);
  });

  it("the parser returns the stored text with only the markers consumed", () => {
    const failures: string[] = [];

    for (const { name, seed } of SEEDS) {
      for (const field of collectProse(name, seed)) {
        const expected = normalise(stripMarkers(field.text));
        const actual = normalise(renderToText(field.text));
        if (expected !== actual) {
          failures.push(`${field.label}\n  expected: ${expected}\n  actual:   ${actual}`);
        }
      }
    }

    expect(failures).toEqual([]);
  });

  it("stores no escaped separator where a paragraph break was meant", () => {
    /**
     * The bug that produced the wall of text twice.
     *
     * Long prose is stored as one string with blank lines between paragraphs. Where that
     * string is written as `\"...\\n\\n...\"` the browser is handed a backslash and an `n`
     * rather than a line break, and nothing fails — the content is right and the page is
     * wrong, twice over: the break is gone and a reader sees the escape.
     */
    const failures: string[] = [];

    for (const { name, seed } of SEEDS) {
      for (const field of collectProse(name, seed)) {
        const escape = /\\[ntu]/.exec(field.text);
        if (escape) {
          const at = escape.index;
          failures.push(
            `${field.label}: literal ${JSON.stringify(escape[0])} at ${at} — ${JSON.stringify(field.text.slice(Math.max(0, at - 30), at + 20))}`,
          );
        }
      }
    }

    expect(failures).toEqual([]);
  });

  it("leaves no emphasis marker and no bullet marker in the output", () => {
    const failures: string[] = [];

    for (const { name, seed } of SEEDS) {
      for (const field of collectProse(name, seed)) {
        const rendered = renderToText(field.text);
        if (rendered.includes("**")) failures.push(`${field.label}: literal ** in the output`);
        if (/^\s*[-*•]\s/.test(rendered)) {
          failures.push(`${field.label}: a bullet marker survived into the output`);
        }
      }
    }

    expect(failures).toEqual([]);
  });

  it("produces more than one block for the fields that are genuinely long", () => {
    // The point of the parser, stated as an assertion: these fields are not
    // sentences, they are explanations, and rendering them as one paragraph is
    // what produced the wall of text the reader reported.
    //
    // Both numbers scale with the number of jurisdictions, so the bar is set per
    // jurisdiction rather than at a fixed count that a new state happens to clear.
    const counts = { multiBlock: 0, lists: 0 };

    for (const { name, seed } of SEEDS) {
      for (const field of collectProse(name, seed)) {
        const blocks = parseEditorialText(field.text);
        if (blocks.length > 1) counts.multiBlock += 1;
        if (blocks.some((block) => block.kind === "list")) counts.lists += 1;
      }
    }

    expect(counts.multiBlock).toBeGreaterThanOrEqual(SEEDS.length * 3);
    expect(counts.lists).toBeGreaterThanOrEqual(SEEDS.length * 2);
  });

  it("never leaves a lead with an emphasis marker in it, split or not", () => {
    /**
     * The third rendering path, and the last one that was unchecked.
     *
     * A page's lead is set as a standfirst rather than as body copy, so the page header
     * renders it itself — and it was rendering the stored string directly. Every lead
     * written with `**emphasis**` in it therefore put literal asterisks in the first
     * sentence of the page, on twelve published pages, while the prose guards below it
     * passed because they only ever looked at the blocks the body renderer produces.
     *
     * Two things have to hold, and both are asserted here rather than assumed: the
     * whole lead loses its markers when it is parsed, and the split keeps every pair on
     * one side of the cut, because `splitLead` hands the two halves to `parseInline`
     * separately and an unmatched marker is left literal.
     */
    const failures: string[] = [];

    for (const { name, seed } of SEEDS) {
      const leads: Array<[string, string]> = [
        [`${name} profile.summary`, seed.profile?.summary ?? ""],
        ...seed.permitPages.map(
          (page) => [`${name} ${page.slug}.intro`, page.intro] as [string, string],
        ),
      ];

      for (const [label, lead] of leads) {
        if (lead.trim().length === 0) continue;

        const runs = (text: string) => parseInline(text);
        const emphasised = (text: string) =>
          runs(text)
            .filter((run) => run.strong)
            .map((run) => run.text);
        const visible = (text: string) =>
          runs(text)
            .map((run) => run.text)
            .join("");

        if (visible(lead).includes("**")) {
          failures.push(`${label}: unmatched ** in the stored lead`);
        }

        const { opening, body } = splitLead(lead);

        if (visible(opening).includes("**") || visible(body).includes("**")) {
          failures.push(`${label}: the split left an emphasis marker in one half`);
        }

        const whole = emphasised(lead);
        const afterSplit = [...emphasised(opening), ...emphasised(body)];
        if (JSON.stringify(whole) !== JSON.stringify(afterSplit)) {
          failures.push(
            `${label}: emphasis changed across the split — ${JSON.stringify(whole)} became ${JSON.stringify(afterSplit)}`,
          );
        }
      }
    }

    expect(failures).toEqual([]);
  });

  it("gives every jurisdiction a not-included list and a multi-paragraph local context", () => {
    for (const { name, seed } of SEEDS) {
      const notIncluded = seed.profile?.notIncluded;
      expect(notIncluded, `${name} profile.notIncluded`).toBeTruthy();
      expect(
        parseEditorialText(notIncluded as string).some((block) => block.kind === "list"),
        `${name} notIncluded should be a list`,
      ).toBe(true);

      const localContext = seed.profile?.localContext;
      expect(localContext, `${name} profile.localContext`).toBeTruthy();
      expect(
        parseEditorialText(localContext as string).length,
        `${name} localContext should be several paragraphs`,
      ).toBeGreaterThan(1);
    }
  });
});
