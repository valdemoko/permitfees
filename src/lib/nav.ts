import { ROUTES } from "@/lib/seo/urls";

/**
 * Navigation, defined once.
 *
 * The header and footer read from here so they cannot drift apart, and so that
 * adding a section is a single edit.
 *
 * **Why the primary nav is three items and not five.** The brief for the visual
 * redesign asked the navigation to answer States / Cities / Permit information /
 * About. Two of those cannot honestly be top-level today: there is one city
 * (Houston) and its permit pages are only reachable through it, so "Cities" and
 * "Permits" would each be a link to a directory of one — precisely the thin
 * doorway the editorial gate exists to prevent. The structure is here and
 * `CITY_INDEX` documents the shape it takes when the second city lands: a
 * primary item appears when the directory behind it has more than one entry.
 *
 * The secondary items are always available and live in the mobile panel and the
 * footer, which keeps the header itself to three decisions.
 */

export type NavItem = {
  label: string;
  href: string;
  /** Short description used in the footer, not shown in the header. */
  description?: string;
};

export const PRIMARY_NAV: readonly NavItem[] = [
  { label: "States", href: ROUTES.states, description: "Every state we publish, and a map." },
  {
    label: "Methodology",
    href: ROUTES.methodology,
    description: "Where the data comes from and how the numbers are produced.",
  },
  { label: "About", href: ROUTES.about, description: "What this is, and what it deliberately is not." },
];

/**
 * Shown in the mobile panel and the footer, never in the header.
 *
 * `CITY_INDEX` is not a link to a page that does not exist yet — it is the note
 * that the next primary nav item is a city index, so the header does not need to
 * be redesigned to add it.
 */
export const SECONDARY_NAV: readonly NavItem[] = [
  {
    label: "Fee calculator",
    href: ROUTES.calculator,
    description: "Estimate a permit fee from a published fee schedule.",
  },
  { label: "Contact", href: ROUTES.contact },
  { label: "Privacy", href: ROUTES.privacy },
  { label: "Cookies", href: ROUTES.cookies },
  { label: "Terms", href: ROUTES.terms },
];

export type FooterSection = {
  heading: string;
  items: readonly NavItem[];
};

/**
 * True when `href` points at the page already open.
 *
 * This matters because of how the router behaves, not for styling. A `Link` to the
 * current URL does not navigate — there is nowhere to go — so the router never runs
 * its scroll reset, and a reader who clicks the brand (or the nav item for the page
 * they are on) while scrolled down sees nothing happen at all. That is the same
 * complaint as arriving part-way down a *different* page, so it is handled the same
 * way: treat the click as "back to the top".
 *
 * Trailing slashes are ignored, which is also the site's URL policy.
 */
export function isCurrentPath(pathname: string, href: string): boolean {
  const normalise = (path: string): string => path.replace(/\/+$/, "") || "/";
  return normalise(pathname) === normalise(href);
}

export const FOOTER_SECTIONS: readonly FooterSection[] = [
  {
    heading: "PermitFees",
    items: [
      { label: "All states", href: ROUTES.states },
      {
        label: "Permit fee calculator",
        href: ROUTES.calculator,
        description: "Estimate a fee from a published fee schedule.",
      },
      {
        label: "Methodology",
        href: ROUTES.methodology,
        description: "Where the data comes from and how the numbers are produced.",
      },
      { label: "About", href: ROUTES.about },
      { label: "Contact", href: ROUTES.contact },
    ],
  },
  {
    heading: "Legal",
    items: [
      { label: "Privacy Policy", href: ROUTES.privacy },
      { label: "Cookie Policy", href: ROUTES.cookies },
      { label: "Terms", href: ROUTES.terms },
    ],
  },
  {
    heading: "More",
    items: [
      // Links to the author page without naming the author: personal details
      // belong only on that page, not in a footer rendered on every route.
      { label: "About the author", href: ROUTES.author },
    ],
  },
];
