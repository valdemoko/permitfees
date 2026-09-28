import type { ReactNode } from "react";

import { ButtonLink } from "@/components/ui/button";

/**
 * Empty state.
 *
 * The dataset starts empty by design, and an empty directory must say so
 * honestly rather than render an empty table or, worse, hide the page. This
 * component is the honest version: it states what is missing, why, and what to do
 * instead.
 */

export function EmptyState({
  title,
  children,
  action,
}: {
  title: string;
  children?: ReactNode;
  action?: { label: string; href: string };
}) {
  return (
    <div className="empty">
      <p className="empty__title">{title}</p>
      {children ? (
        <div
          style={{
            marginTop: "0.5rem",
            color: "var(--color-ink-600)",
            fontSize: "0.9375rem",
            maxWidth: "60ch",
          }}
        >
          {children}
        </div>
      ) : null}
      {action ? (
        <div style={{ marginTop: "1.125rem" }}>
          <ButtonLink href={action.href} size="small">
            {action.label}
          </ButtonLink>
        </div>
      ) : null}
    </div>
  );
}
