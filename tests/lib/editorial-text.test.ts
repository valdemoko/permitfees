import { describe, expect, it } from "vitest";

import {
  hasMultipleParagraphs,
  parseEditorialText,
  parseInline,
  splitLead,
  type EditorialBlock,
  type EditorialInline,
} from "@/lib/editorial/text";

/**
 * These assertions are about what a reader sees. The bug this module fixes was
 * invisible to the type system and to every other test in the suite: the stored
 * string was correct and the page rendered it as one paragraph, with the list
 * markers and the asterisks left in the text.
 */

/**
 * The suite runs with `noUncheckedIndexedAccess`, which is the point of it, so the
 * helpers below do the narrowing instead of every assertion carrying a `!`.
 */
function blockAt(blocks: EditorialBlock[], index: number): EditorialBlock {
  const block = blocks[index];
  if (!block) throw new Error(`expected a block at index ${index}`);
  return block;
}

function listItems(block: EditorialBlock): EditorialInline[][] {
  if (block.kind !== "list") throw new Error(`expected a list, got ${block.kind}`);
  return block.items;
}

function paragraphRuns(block: EditorialBlock): EditorialInline[] {
  if (block.kind !== "paragraph") throw new Error(`expected a paragraph, got ${block.kind}`);
  return block.content;
}

function blocksOfKind(blocks: EditorialBlock[], kind: EditorialBlock["kind"]) {
  return blocks.filter((block) => block.kind === kind);
}

describe("parseInline", () => {
  it("returns plain text as a single run", () => {
    expect(parseInline("A fee is a published figure.")).toEqual([
      { text: "A fee is a published figure.", strong: false },
    ]);
  });

  it("splits emphasis out of the surrounding text", () => {
    expect(parseInline("It is deliberately **not** charged.")).toEqual([
      { text: "It is deliberately ", strong: false },
      { text: "not", strong: true },
      { text: " charged.", strong: false },
    ]);
  });

  it("handles two emphasised runs on one line", () => {
    expect(parseInline("**Plan review** and **zoning** are excluded.")).toEqual([
      { text: "Plan review", strong: true },
      { text: " and ", strong: false },
      { text: "zoning", strong: true },
      { text: " are excluded.", strong: false },
    ]);
  });

  it("leaves an unmatched marker literal rather than swallowing text", () => {
    const runs = parseInline("A fee of 2 ** 3");
    expect(runs.map((run) => run.text).join("")).toBe("A fee of 2 ** 3");
  });

  it("preserves the exact characters of the input", () => {
    const input = "Rates, brackets, and **conditions** — all of them.";
    expect(parseInline(input).map((run) => run.text).join("")).toBe(
      input.replace(/\*\*/g, ""),
    );
  });
});

describe("parseEditorialText", () => {
  it("splits paragraphs on a blank line", () => {
    const blocks = parseEditorialText("First paragraph.\n\nSecond paragraph.");
    expect(blocks).toEqual([
      { kind: "paragraph", content: [{ text: "First paragraph.", strong: false }] },
      { kind: "paragraph", content: [{ text: "Second paragraph.", strong: false }] },
    ]);
  });

  it("joins a single newline inside a paragraph into one line of prose", () => {
    const blocks = parseEditorialText("A sentence that wrapped\nin the source file.");
    expect(blocks).toHaveLength(1);
    expect(blockAt(blocks, 0)).toEqual({
      kind: "paragraph",
      content: [{ text: "A sentence that wrapped in the source file.", strong: false }],
    });
  });

  it("turns a run of bullet lines into a list, one item per bullet", () => {
    const blocks = parseEditorialText(
      "It excludes:\n\n- **Plan review.** The two documents disagree.\n- **The zoning surcharge.** 10% of the permit fee.",
    );
    expect(blocks.map((block) => block.kind)).toEqual(["paragraph", "list"]);

    const items = listItems(blockAt(blocks, 1));
    expect(items).toHaveLength(2);
    expect(items[0]?.[0]).toEqual({ text: "Plan review.", strong: true });
    expect(items[1]?.[0]).toEqual({ text: "The zoning surcharge.", strong: true });
  });

  it("accepts - , * and • as the same marker", () => {
    const items = listItems(blockAt(parseEditorialText("- one\n* two\n• three"), 0));
    expect(items.map((item) => item[0]?.text)).toEqual(["one", "two", "three"]);
  });

  it("closes a list and starts a paragraph when the bullets stop", () => {
    const blocks = parseEditorialText("- one\n- two\nThen a closing sentence.");
    expect(blocks.map((block) => block.kind)).toEqual(["list", "paragraph"]);
    expect(listItems(blockAt(blocks, 0))).toHaveLength(2);
    expect(paragraphRuns(blockAt(blocks, 1))[0]?.text).toBe("Then a closing sentence.");
  });

  it("never leaves a marker or an asterisk in the text", () => {
    const stored =
      "These are the published fees. They exclude:\n\n- **Plan review.** Disputed, so not charged.\n- Everything from another department.\n\nSee the note on each page.";
    const rendered = parseEditorialText(stored)
      .flatMap((block) => (block.kind === "list" ? block.items : [block.content]))
      .flatMap((runs) => runs.map((run) => run.text))
      .join(" ");

    expect(rendered).not.toContain("**");
    expect(rendered).not.toContain("- ");
  });

  it("keeps every word of a real stored note", () => {
    const stored =
      "This estimate covers the construction tables.\n\nIt excludes:\n\n- **Plan review**, which is disputed and therefore not charged.\n- **Permit extension** ($200) and **reinspection** ($75).";
    const words = parseEditorialText(stored)
      .flatMap((block) => (block.kind === "list" ? block.items : [block.content]))
      .flatMap((runs) => runs.map((run) => run.text))
      .join(" ");
    expect(words).toContain("Plan review");
    expect(words).toContain("$200");
    expect(words).toContain("reinspection");
    expect(blocksOfKind(parseEditorialText(stored), "list")).toHaveLength(1);
  });

  it("is empty for empty, whitespace-only and separator-only input", () => {
    expect(parseEditorialText("")).toEqual([]);
    expect(parseEditorialText("   \n\n  \n")).toEqual([]);
  });

  it("normalises CRLF and collapses a run of blank lines", () => {
    expect(parseEditorialText("One.\r\n\r\n\r\nTwo.").map((block) => block.kind)).toEqual([
      "paragraph",
      "paragraph",
    ]);
  });
});

describe("hasMultipleParagraphs", () => {
  it("is true for real stored prose and false for a single sentence", () => {
    expect(hasMultipleParagraphs("One.\n\nTwo.")).toBe(true);
    expect(hasMultipleParagraphs("One.")).toBe(false);
  });
});

describe("splitLead", () => {
  it("leaves a short lead alone", () => {
    const lead = "Boulder City prices a building permit from a bracket table.";
    expect(splitLead(lead)).toEqual({ opening: "", body: lead });
  });

  it("splits a long lead after its first sentence, keeping every character", () => {
    const lead =
      "Phoenix prices a building permit from one valuation table. Table A pairs a base amount " +
      "with a dollar rate for each additional $1,000 of project valuation — $12 up to $10,000, " +
      "then $10, $9 and $5 as the valuation rises — and rounds the valuation up to the next whole " +
      "$1,000 before applying it. Plan review is added on top and is published as a percentage.";

    const { opening, body } = splitLead(lead);
    expect(opening).toBe("Phoenix prices a building permit from one valuation table.");
    expect(`${opening} ${body}`).toBe(lead);
  });

  it("does not mistake a currency figure for the end of a sentence", () => {
    const lead =
      "A $7.371 rate read as 7,371 cents per $1,000 charges a $25,000 valuation $1,774.62 where " +
      "the printed table says $248.82, which is ten times the published fee and wrong in every " +
      "reading of the document. The full-cents reading is the trap.";

    const { opening, body } = splitLead(lead);

    // The break is at the comma after $248.82, not at a decimal point or a thousands
    // separator inside a figure.
    expect(opening).toContain("$1,774.62");
    expect(opening).toContain("$25,000");
    expect(opening).not.toContain("full-cents");
    expect(body).toContain("The full-cents reading is the trap");
  });

  it("splits at a clause boundary when the first sentence is too long for a standfirst", () => {
    const lead =
      "Clark County prices a building permit from one valuation table, in bands that chain: each " +
      "band is written as an amount for the first part plus a rate for every additional $1,000, " +
      "and no occupancy type, square footage or project category changes the arithmetic.";

    const { opening, body } = splitLead(lead);
    expect(opening).toBe("Clark County prices a building permit from one valuation table");
    expect(body.startsWith("in bands that chain")).toBe(true);
  });

  it("refuses to split inside an emphasis pair, and moves to the next boundary", () => {
    // A pair around the first candidate keeps its own markers in one half or the
    // other, never one in each: an unmatched `**` is left literal by `parseInline`,
    // on purpose, and the reader would meet it in the first sentence of the page.
    const lead =
      "The schedule prints a base amount for the first part and " +
      "**charges a rate per thousand, and it does**" +
      " then stops. The rest of the paragraph continues after that for a while, and then " +
      "it keeps going until the stored string is long enough to be a lead at all.";

    const { opening, body } = splitLead(lead);

    // The comma inside the pair is skipped and the split lands on the sentence after
    // it, so the pair arrives whole and still marked up.
    expect(opening).toContain("**charges a rate per thousand, and it does**");
    expect(opening.endsWith("then stops.")).toBe(true);
    expect(body.startsWith("The rest of the paragraph")).toBe(true);
    expect(opening.match(/\*\*/g)).toHaveLength(2);
    expect(body.includes("**")).toBe(false);
  });

  it("does not split at all when every candidate boundary is inside a pair", () => {
    const lead = `**${"word. ".repeat(60)}end**`;

    expect(splitLead(lead)).toEqual({ opening: "", body: lead });
  });

  it("keeps a colon, because a standfirst that introduces a list should", () => {
    const lead =
      "Three things decide what this permit costs: the valuation, the work type, and the count " +
      "of fixtures. Everything else on the page follows from those three, and nothing on it is " +
      "taken from a second jurisdiction or averaged with one.";

    const { opening, body } = splitLead(lead);
    expect(opening).toBe("Three things decide what this permit costs:");
    expect(body.startsWith("the valuation, the work type")).toBe(true);
  });

  it("returns the text unchanged when no boundary can carry a standfirst", () => {
    const lead =
      "A single long clause with no punctuation inside it at all that simply keeps going and " +
      "going until it is well past the maximum opening length and therefore cannot be split";

    const { opening, body } = splitLead(lead);
    expect(opening).toBe("");
    expect(body).toBe(lead.trim());
  });
});
