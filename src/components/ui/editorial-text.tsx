import type { ReactNode } from "react";

import { parseEditorialText, type EditorialInline } from "@/lib/editorial/text";

/**
 * Editorial text.
 *
 * Renders one stored string as the paragraphs, lists and emphasis it was written
 * as. Every place the site shows prose that came out of the database goes through
 * here, so the reader never meets a wall of text, a literal `- ` marker, or a
 * stray `**`.
 *
 * A server component with no client JavaScript, and no `dangerouslySetInnerHTML`:
 * the parser returns data, this maps it to elements, and React escapes every
 * string on the way through. Emphasis is a `<strong>` because that is what it is;
 * nothing here can emit a tag that was not written in this file.
 *
 * The wrapper is a plain `<div>` with one class rather than a fragment, so the
 * spacing rules live in CSS with every other measure in the system instead of
 * being spread through the pages that use it.
 */

export function renderRuns(runs: EditorialInline[]): ReactNode[] {
  return runs.map((run, index) =>
    run.strong ? <strong key={index}>{run.text}</strong> : run.text,
  );
}

/**
 * A list item whose first run is emphasised gets that run marked as a term. It is
 * the convention the "not included" notes already use in their source — `- **Plan
 * review.** The two documents disagree…` — and styling it is what turns a bullet
 * into something a reader can scan for the heading they care about.
 */
function renderItem(runs: EditorialInline[]): ReactNode[] {
  return runs.map((run, index) =>
    run.strong ? (
      <strong key={index} className={index === 0 ? "editorial__term" : undefined}>
        {run.text}
      </strong>
    ) : (
      run.text
    ),
  );
}

export function EditorialText({ text, className }: { text: string; className?: string }) {
  const blocks = parseEditorialText(text);
  if (blocks.length === 0) return null;

  return (
    <div className={["editorial", className].filter(Boolean).join(" ")}>
      {blocks.map((block, index) =>
        block.kind === "paragraph" ? (
          <p key={index}>{renderRuns(block.content)}</p>
        ) : (
          <ul key={index}>
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex}>{renderItem(item)}</li>
            ))}
          </ul>
        ),
      )}
    </div>
  );
}
