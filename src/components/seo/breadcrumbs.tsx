import Link from "next/link";

/**
 * Visible breadcrumbs.
 *
 * The same list is passed to `breadcrumbJsonLd`, so the markup and the structured
 * data cannot disagree — which is an explicit structured-data requirement, not
 * just tidiness.
 *
 * The separator is a hairline slash rather than a chevron: it is the convention of
 * printed indexes, and it does not ask the reader to decode a symbol.
 */

export type BreadcrumbEntry = {
  name: string;
  /** Root-relative path, already canonical. */
  path: string;
};

export function Breadcrumbs({ items }: { items: BreadcrumbEntry[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="crumbs">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.path} style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
              {isLast ? (
                <span className="crumbs__current" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link href={item.path} className="crumbs__link">
                  {item.name}
                </Link>
              )}
              {!isLast ? (
                <span className="crumbs__sep" aria-hidden="true">
                  /
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
