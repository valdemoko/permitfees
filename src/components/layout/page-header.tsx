import type { ReactNode } from "react";

import { Breadcrumbs, type BreadcrumbEntry } from "@/components/seo/breadcrumbs";
import { LeadText } from "@/components/ui/lead-text";

/**
 * Page header.
 *
 * One `<h1>` per page, an optional eyebrow, the lead sentence, then an optional
 * meta row and an optional aside.
 *
 * The aside is the structural device that replaces the old pattern of stacking
 * everything in one column: on a data page the facts *about* the page — which
 * department, how many permit types, when it was verified — belong beside the
 * title, where they answer "is this the right page and can I trust it" before the
 * reader starts reading. On narrow screens it moves below the lead, which is the
 * same order the eye wants anyway.
 *
 * **It has to be used, or the page renders as a narrow column with half the screen
 * empty.** The grid reserves the right-hand column whenever the viewport is wide
 * enough, and a page that keeps its facts in a block below the header instead of
 * passing them here leaves that column blank — which is exactly what every data page
 * did until it was noticed next to a 600-character summary. If a page has facts about
 * itself, they belong in `aside`.
 *
 * A long string lead is set as a standfirst plus body (`splitLead` in
 * `@/lib/editorial`): the jurisdiction summaries are several sentences of real
 * information, and giving the first one display weight is what stops the block from
 * reading as a slab. No text is removed or reworded to achieve it.
 */

export function PageHeader({
  breadcrumbs,
  eyebrow,
  title,
  lead,
  meta,
  actions,
  aside,
}: {
  breadcrumbs?: BreadcrumbEntry[];
  /** Small label above the title, e.g. "Texas" or "Methodology". */
  eyebrow?: string;
  title: string;
  lead?: ReactNode;
  meta?: ReactNode;
  /** Primary next steps, directly under the lead. Keeps button spacing in one place. */
  actions?: ReactNode;
  /** Facts about the page: authority, coverage, verification. */
  aside?: ReactNode;
}) {
  return (
    <div className="page-head">
      <div className="page-head__main">
        {breadcrumbs && breadcrumbs.length > 1 ? <Breadcrumbs items={breadcrumbs} /> : null}

        {eyebrow ? <p className="eyebrow eyebrow--accent">{eyebrow}</p> : null}

        <h1 className="page-head__title">{title}</h1>

        {typeof lead === "string" ? <LeadText text={lead} /> : lead ? <p className="lede">{lead}</p> : null}

        {actions ? <div className="page-head__actions">{actions}</div> : null}

        {meta ? <div className="stack-md page-head__meta">{meta}</div> : null}
      </div>

      {aside ? <aside className="page-head__aside">{aside}</aside> : null}
    </div>
  );
}
