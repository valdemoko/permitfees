import type { ReactNode } from "react";

/**
 * Table primitives.
 *
 * Real `<table>` markup with `<caption>`, `<th scope>` and a `<tfoot>` for
 * totals, because fee data is genuinely tabular and a grid of divs would lose the
 * relationships that screen readers and search engines both need.
 *
 * Figures are set in the monospace face with tabular numerals, which is the only
 * way a column of amounts scans cleanly, and the whole row highlights on hover so
 * a reader can follow a long row across four columns.
 *
 * `dense` reduces the vertical padding for tables with many rows. On mobile a
 * wide table scrolls inside its own container rather than collapsing into cards:
 * a two-column card loses the comparison between columns, which is the entire
 * reason the table exists.
 */

export function DataTable({
  caption,
  children,
  /** Hidden captions are used where a visible heading already says the same thing. */
  captionVisible = true,
  align = "left",
}: {
  caption: string;
  children: ReactNode;
  captionVisible?: boolean;
  /** Caption alignment, so it can sit opposite a right-aligned figure column. */
  align?: "left" | "right";
}) {
  return (
    <div className="tablewrap">
      <table className="table">
        <caption
          className={captionVisible ? "table__caption" : "visually-hidden"}
          style={align === "right" ? { textAlign: "right" } : undefined}
        >
          {caption}
        </caption>
        {children}
      </table>
    </div>
  );
}

export function Th({
  children,
  align = "left",
  scope = "col",
}: {
  children: ReactNode;
  align?: "left" | "right";
  scope?: "col" | "row";
}) {
  return (
    <th scope={scope} style={align === "right" ? { textAlign: "right" } : undefined}>
      {children}
    </th>
  );
}

export function Td({
  children,
  align = "left",
  /** Apply to money and counts so digits align in the column. */
  numeric = false,
  muted = false,
  strong = false,
}: {
  children: ReactNode;
  align?: "left" | "right";
  numeric?: boolean;
  muted?: boolean;
  strong?: boolean;
}) {
  const classes = [numeric ? "is-num" : "", muted ? "is-muted" : "", strong ? "is-strong" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <td
      className={classes || undefined}
      style={align === "right" && !numeric ? { textAlign: "right" } : undefined}
    >
      {children}
    </td>
  );
}

export function Tfoot({ children }: { children: ReactNode }) {
  return <tfoot>{children}</tfoot>;
}

export function Tr({
  children,
  /** Row-level facts, used for the map and for rows that are not links. */
  ...rest
}: { children: ReactNode } & React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr {...rest}>{children}</tr>;
}
