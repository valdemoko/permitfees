/**
 * Editorial text.
 *
 * Stored prose — a jurisdiction's local context, a page's "not included" note, a
 * source's annotation — is written as a single string, because it is stored in one
 * column. It is *written* as prose, though: blank lines separate paragraphs, lines
 * beginning with `-` are list items, and `**this**` is emphasis.
 *
 * Until this module existed the renderers dumped that string into one element with
 * `white-space: pre-line`. Three things were wrong with that. The paragraph breaks
 * became single line breaks, so a four-paragraph explanation arrived as one grey
 * slab; the list markers stayed in the text as literal hyphens; and the emphasis
 * reached the reader as literal asterisks. The content was fine — the reader never
 * saw it.
 *
 * So the parsing lives here, as a pure function with no React in it, and the
 * component that renders it (`ui/editorial-text.tsx`) is a thin map over the
 * blocks. Pure because it is testable, and because a display bug in a fee note is
 * the kind of thing that should fail a test rather than be noticed by a reader.
 *
 * The grammar is deliberately tiny. It is not Markdown and does not try to be: it
 * is the three conventions the content actually uses, and anything else stays
 * literal rather than being guessed at.
 */

/** A run of text, optionally emphasised with `**`. */
export type EditorialInline = {
  text: string;
  strong: boolean;
};

export type EditorialBlock =
  | { kind: "paragraph"; content: EditorialInline[] }
  | { kind: "list"; items: EditorialInline[][] };

/** One or more blank lines. The paragraph separator in every stored string. */
const BLANK_LINE = /\n[ \t]*\n+/;

/** `- item`, `* item`, `• item`. The bullets the content uses. */
const BULLET = /^[-*•]\s+/;

/** `**emphasis**`, non-greedy, so two pairs on one line are two runs. */
const EMPHASIS = /\*\*(.+?)\*\*/g;

/**
 * Split one line of text into plain and emphasised runs.
 *
 * An unmatched `**` stays literal: content is never silently altered, so a
 * transcription mistake shows up on the page instead of disappearing into the
 * renderer.
 */
export function parseInline(text: string): EditorialInline[] {
  const runs: EditorialInline[] = [];
  let cursor = 0;

  for (const match of text.matchAll(EMPHASIS)) {
    const start = match.index ?? 0;
    if (start > cursor) runs.push({ text: text.slice(cursor, start), strong: false });
    runs.push({ text: match[1] ?? "", strong: true });
    cursor = start + match[0].length;
  }

  if (cursor < text.length) runs.push({ text: text.slice(cursor), strong: false });

  return runs.length > 0 ? runs : [{ text: "", strong: false }];
}

/**
 * Turn a stored string into blocks.
 *
 * Blank lines split blocks; inside a block, runs of bullet lines become a list and
 * everything else is joined into a paragraph. A bullet whose text wraps onto the
 * next line *in the source* is still one line here, because the stored value has no
 * newline in it — only the separators do.
 */
export function parseEditorialText(input: string): EditorialBlock[] {
  const text = input.replace(/\r\n?/g, "\n").trim();
  if (text.length === 0) return [];

  const blocks: EditorialBlock[] = [];

  for (const chunk of text.split(BLANK_LINE)) {
    let paragraph: string[] = [];
    let items: EditorialInline[][] = [];

    const flushParagraph = () => {
      if (paragraph.length === 0) return;
      blocks.push({ kind: "paragraph", content: parseInline(paragraph.join(" ")) });
      paragraph = [];
    };

    const flushList = () => {
      if (items.length === 0) return;
      blocks.push({ kind: "list", items });
      items = [];
    };

    for (const rawLine of chunk.split("\n")) {
      const line = rawLine.trim();
      if (line.length === 0) continue;

      if (BULLET.test(line)) {
        flushParagraph();
        items.push(parseInline(line.replace(BULLET, "").trim()));
      } else {
        flushList();
        paragraph.push(line);
      }
    }

    flushParagraph();
    flushList();
  }

  return blocks;
}

/** True when the string renders as more than one paragraph. Used by tests. */
export function hasMultipleParagraphs(input: string): boolean {
  return parseEditorialText(input).filter((block) => block.kind === "paragraph").length > 1;
}

/**
 * The character spans covered by an emphasis pair, its `**` markers included.
 *
 * `splitLead` uses these to refuse a boundary that would fall inside a pair. It is a
 * helper rather than a condition inside the loop because the answer is needed for
 * every candidate boundary, not for the first one that fits the length window.
 */
function emphasisSpans(text: string): { start: number; end: number }[] {
  const spans: { start: number; end: number }[] = [];

  for (const match of text.matchAll(EMPHASIS)) {
    const start = match.index ?? 0;
    spans.push({ start, end: start + match[0].length });
  }

  return spans;
}

/** Long enough that one paragraph of it would read as a slab rather than a lead. */
const LEAD_SPLIT_MIN_LENGTH = 220;

/**
 * How long the standfirst may be, in characters.
 *
 * The floor is a fragment guard: "It chains." is not a standfirst. The ceiling is
 * the point of the exercise — a first sentence of 230 characters set in display type
 * is a bigger slab than the paragraph it replaced, so when the first sentence is too
 * long the split moves to the first clause boundary instead (Phoenix's summary splits
 * after its first sentence, Clark County's after its first clause, and the difference
 * is not something a page should have to think about).
 */
const LEAD_OPENING_MIN = 40;
const LEAD_OPENING_MAX = 170;

const SENTENCE_END = /[.!?](\s)/g;
const CLAUSE_END = /[,;:](\s)/g;

/**
 * Splits a lead into an opening sentence and the rest of it.
 *
 * A jurisdiction summary is around 600 characters and carries real information: the
 * mechanism, the authority, what is specific to the place. Setting all of it at one
 * size and one measure is what makes a page look like a wall of text — and the fix
 * is not to shorten it, because the information is the product. It is to give the
 * first sentence display weight so the eye has an entry point and the rest of it
 * reads as explanation rather than as a block.
 *
 * Deliberately conservative: it splits once, after the first sentence, and only when
 * the text is long enough for the split to help and the opening sentence is long
 * enough to stand on its own. Everything else is returned as the body unchanged, so
 * a short lead renders exactly as it did before.
 */
export function splitLead(lead: string): { opening: string; body: string } {
  const text = lead.trim();
  if (text.length < LEAD_SPLIT_MIN_LENGTH) return { opening: "", body: text };

  /*
    Every sentence end and clause end that is followed by whitespace, in order. A
    decimal point or a thousands separator inside a currency figure ("$1,774.62",
    "$25,000") is followed by a digit rather than by a space, so neither can be taken
    for a boundary — which matters here, because this prose is full of both.
  */
  const boundaries: number[] = [];
  for (const pattern of [SENTENCE_END, CLAUSE_END]) {
    pattern.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) boundaries.push(match.index + 1);
  }
  boundaries.sort((a, b) => a - b);

  /*
    A boundary inside an emphasis pair would leave a dangling `**` at the end of the
    standfirst and another at the start of the body — and an unmatched marker is left
    literal by `parseInline` on purpose, so both would reach the reader as asterisks.
    The split therefore has to respect the pairs rather than cut through them: a
    boundary inside one is skipped and the next eligible boundary is used, and if none
    is, the lead is not split at all.
  */
  const pairs = emphasisSpans(text);

  const at = boundaries.find(
    (index) =>
      index >= LEAD_OPENING_MIN &&
      index <= LEAD_OPENING_MAX &&
      !pairs.some((pair) => index > pair.start && index < pair.end),
  );
  if (at === undefined) return { opening: "", body: text };

  const body = text.slice(at).trim();
  if (body.length === 0) return { opening: "", body: text };

  // A standfirst ending in a comma or a semicolon reads as a truncation; a colon
  // reads as an introduction to what follows, so only the first two are trimmed.
  const opening = text.slice(0, at).trim().replace(/[,;]$/, "");

  return { opening, body };
}
