import type { HTMLAttributes, ReactNode } from "react";

/**
 * Layout primitives.
 *
 * One gutter and three measures: `read` for prose, `default` for a page, `wide`
 * for tables and the map. A fourth measure is how layouts start to drift, so
 * anything narrower than the measure is handled by `.prose-editorial` inside it.
 */

const WIDTHS = {
  read: "u-container",
  default: "u-container",
  wide: "u-container u-container--wide",
} as const;

export function Container({
  children,
  width = "default",
  className,
}: {
  children: ReactNode;
  width?: keyof typeof WIDTHS;
  className?: string;
}) {
  return (
    <div className={[WIDTHS[width], width === "read" ? "u-container--read" : "", className]
      .filter(Boolean)
      .join(" ")}>
      {children}
    </div>
  );
}

/**
 * A vertical band of the page.
 *
 * `tone` distinguishes a band that sits on the canvas from one that needs a
 * surface to separate it, and `ruled` adds the hairline that marks a new section
 * inside a band. Section padding comes from one token, so bands cannot drift
 * apart page by page — which is what happened when every page set its own.
 */
export function Section({
  children,
  tone = "canvas",
  padding = "default",
  ruled = false,
  className,
  ...rest
}: {
  children: ReactNode;
  tone?: "canvas" | "surface" | "subtle";
  padding?: "default" | "tight" | "lead" | "none";
  ruled?: boolean;
} & HTMLAttributes<HTMLElement>) {
  const classes = [
    "band",
    tone === "surface" ? "band--surface" : "",
    tone === "subtle" ? "band--subtle" : "",
    padding === "tight" ? "band--tight" : "",
    padding === "lead" ? "band--lead" : "",
    padding === "none" ? "band--none" : "",
    ruled ? "band--ruled" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={classes} {...rest}>
      {children}
    </section>
  );
}

/** A horizontal rule that matches the token system rather than the UA default. */
export function Rule() {
  return <hr className="rule" />;
}
