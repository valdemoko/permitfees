import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

/**
 * Buttons.
 *
 * Four weights. `primary` is used once or twice per page — a page with five
 * primary buttons has no primary action. `quiet` is for actions inside dense
 * data blocks, where a bordered button would compete with the table.
 *
 * Sizes line up with form controls so a button and an input can share a row
 * without the baseline wobbling.
 *
 * Every appearance, including `:hover`, `:active` and the disabled state, lives
 * in `globals.css`. Keeping them in the stylesheet rather than in a style object
 * is what makes the states possible at all.
 */

export type ButtonVariant = "primary" | "secondary" | "quiet" | "danger";
export type ButtonSize = "default" | "small" | "large";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "btn--primary",
  secondary: "btn--secondary",
  quiet: "btn--quiet",
  danger: "btn--danger",
};

const SIZES: Record<ButtonSize, string> = {
  default: "",
  small: "btn--sm",
  large: "btn--lg",
};

function classes(variant: ButtonVariant, size: ButtonSize, block: boolean): string {
  return ["btn", VARIANTS[variant], SIZES[size], block ? "btn--block" : ""]
    .filter(Boolean)
    .join(" ");
}

/** The class string for a button, for the rare case a button is not a component. */
export function buttonClassName(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "default",
  block = false,
): string {
  return classes(variant, size, block);
}

export function Button({
  children,
  variant = "primary",
  size = "default",
  block = false,
  loading = false,
  type = "button",
  disabled,
  ...rest
}: {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  /** Shows the spinner and blocks activation, without moving the label. */
  loading?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={classes(variant, size, block)}
      disabled={disabled || loading}
      data-loading={loading ? "true" : undefined}
      aria-busy={loading ? true : undefined}
      {...rest}
    >
      {loading ? <span className="btn__spinner" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

export function ButtonLink({
  children,
  href,
  variant = "secondary",
  size = "default",
  block = false,
}: {
  children: ReactNode;
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
}) {
  return (
    <Link href={href} className={classes(variant, size, block)}>
      {children}
    </Link>
  );
}
