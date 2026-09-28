import type { ReactElement, ReactNode } from "react";

import { describe, expect, it } from "vitest";

import { LeadText } from "@/components/ui/lead-text";
import { ALL_SEEDS } from "@/content";
import { parseInline } from "@/lib/editorial";

/**
 * The lead, asserted as rendered rather than as stored.
 *
 * This is the third bug of one family, and the first two were found by a *reader*
 * looking at a page: prose rendered with `white-space: pre-line`, prose stored with its
 * paragraph separators escaped, and now the lead — set as a standfirst by the page
 * header and rendered as a raw string, so every `**` in it reached the browser as
 * asterisks. The first two are guarded by tests over the data. This one cannot be,
 * because the data was always correct: the stored string is right, and the thing that
 * was wrong is that a component never called the parser.
 *
 * So the assertion is taken over the elements the component returns. A React component
 * is a function and its return value is a tree of plain objects, so calling it needs no
 * DOM, no renderer and no browser — and the question "did any marker survive to the
 * reader" can be asked directly of the tree, for every jurisdiction the site publishes.
 */

/** Every string that will be text in the DOM, in document order. */
function textOf(node: ReactNode): string[] {
  if (node === null || node === undefined || typeof node === "boolean") return [];
  if (typeof node === "string") return [node];
  if (typeof node === "number") return [String(node)];
  if (Array.isArray(node)) return node.flatMap(textOf);

  const element = node as ReactElement<{ children?: ReactNode }>;
  return textOf(element.props?.children);
}

/** The text of every `<strong>` the tree will render, in document order. */
function strongOf(node: ReactNode): string[] {
  if (node === null || node === undefined) return [];
  if (Array.isArray(node)) return node.flatMap(strongOf);
  if (typeof node !== "object") return [];

  const element = node as ReactElement<{ children?: ReactNode }>;

  // The emphasis and the text around it are siblings, so the search walks the elements
  // themselves: flattening the children to strings first would erase the `<strong>` it
  // is looking for.
  if (element.type === "strong") return [textOf(element.props?.children).join("")];
  return strongOf(element.props?.children);
}

/** Every lead the site renders: a jurisdiction's hub summary and each permit page's intro. */
const LEADS: Array<{ label: string; text: string }> = ALL_SEEDS.flatMap((seed) => [
  { label: `${seed.jurisdiction.slug} profile.summary`, text: seed.profile?.summary ?? "" },
  ...seed.permitPages.map((page) => ({
    label: `${seed.jurisdiction.slug} ${page.slug}.intro`,
    text: page.intro,
  })),
]).filter((lead) => lead.text.trim().length > 0);

describe("LeadText", () => {
  it("renders no emphasis marker, whether the lead is split or left whole", () => {
    const failures: string[] = [];

    for (const lead of LEADS) {
      const rendered = textOf(LeadText({ text: lead.text })).join(" ");
      if (rendered.includes("**")) {
        failures.push(`${lead.label}: ${JSON.stringify(rendered.slice(0, 80))}`);
      }
    }

    expect(failures).toEqual([]);
  });

  it("renders the emphasised words as emphasis, in the same order the parser found them", () => {
    const failures: string[] = [];

    for (const lead of LEADS) {
      const emphasised = parseInline(lead.text)
        .filter((run) => run.strong)
        .map((run) => run.text);

      const strong = strongOf(LeadText({ text: lead.text }));

      if (JSON.stringify(emphasised) !== JSON.stringify(strong)) {
        failures.push(
          `${lead.label}: expected ${JSON.stringify(emphasised)}, rendered ${JSON.stringify(strong)}`,
        );
      }
    }

    expect(failures).toEqual([]);
  });

  it("keeps every character of a lead that is too short to split", () => {
    const lead = "Boulder City prices a permit from a bracket table.";
    expect(textOf(LeadText({ text: lead })).join("")).toBe(lead);
  });

  it("keeps every character of a split lead, across both halves", () => {
    const lead =
      "A long lead is set as a standfirst plus the explanation that follows it. The pair " +
      "between the two halves is **kept whole** by the splitter, because a marker on one " +
      "side of the cut and another on the other side would both reach the reader as " +
      "literal asterisks, which is what this test exists to prevent happening again.";

    const rendered = textOf(LeadText({ text: lead })).join(" ");

    expect(rendered).not.toContain("**");
    expect(rendered).toContain("kept whole");
    expect(rendered).toContain("A long lead is set as a standfirst");
    expect(rendered).toContain("literal asterisks");
  });

  it("marks up an emphasised figure rather than stripping it to plain text", () => {
    const tree = LeadText({ text: "The fee is **$167.00** as a minimum, and the rest follows." });
    expect(strongOf(tree)).toEqual(["$167.00"]);
  });
});
