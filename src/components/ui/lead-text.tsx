import { renderRuns } from "@/components/ui/editorial-text";
import { parseInline, splitLead } from "@/lib/editorial";

/**
 * The lead, split into a standfirst and the explanation when it is long enough to
 * deserve it. Kept here rather than in the callers so that every page's lead is set
 * the same way, and so a page never has to decide how long its own summary is.
 *
 * **Both halves go through `parseInline`, because a lead is stored prose like any
 * other.** It is written with `**emphasis**` in it, and the only thing that turns that
 * into a `<strong>` is the parser. Rendering the two strings directly is what put
 * literal `**` in front of readers on twelve published pages, in the one block of text
 * at the top of the page that everyone reads. `splitLead` keeps its side of the bargain
 * by refusing to cut a pair in half, and `tests/lib/lead-text.test.ts` asserts both
 * halves of the arrangement against every jurisdiction the site publishes — because
 * this is the third bug of one family, and the first two were found by a reader.
 *
 * It lives in its own module, rather than inside `layout/page-header.tsx`, so that it
 * can be rendered in a test without pulling in the header's Next.js dependencies. A
 * component is a function; calling it is enough to inspect the elements it returns,
 * and no DOM is needed to see whether an asterisk survived.
 */
export function LeadText({ text }: { text: string }) {
  const { opening, body } = splitLead(text);

  if (!opening) return <p className="lede">{renderRuns(parseInline(body))}</p>;

  return (
    <div className="lede-group">
      <p className="lede lede--opening">{renderRuns(parseInline(opening))}</p>
      <p className="lede lede--body">{renderRuns(parseInline(body))}</p>
    </div>
  );
}
