# Design System

The brief for this interface was **authority + precision + transparency**, for an
audience of homeowners, contractors, builders and permit expeditors who are about
to spend real money. That rules out most of what a modern SaaS marketing page looks
like, and the reasoning is worth recording because these constraints erode one
component at a time.

The whole system lives in two files: `src/app/globals.css` (tokens and classes) and
`src/components/ui/*` (the primitives that consume them). No component ships
JavaScript except the map's tooltip layer and the calculator, when it exists.

## 1. The direction: a reference work, not a landing page

Permit-Fee is set as a **professional reference publication about money** — closer
to a county fee schedule, a specification sheet or a surveyor's plat than to a
software product. Three consequences, applied everywhere:

1. **Rules instead of containers.** Separation is a 1px hairline and a surface
   tone. There are no drop shadows, no floating cards, no glass. The one shadow in
   the system (`--shadow-pop`) belongs to the map tooltip, which genuinely floats
   over content.
2. **Figures are the subject.** Money and counts get display type, tabular
   lining figures, and their own alignment rules. The calculated total is the only
   element in the product allowed to dominate a page.
3. **Every statement is dated and attributed.** Provenance is part of the layout
   (see §7), not a footnote.

### What was rejected, and why

| Rejected | Why |
| --- | --- |
| Gradients, glows, blobs, noise textures | Decoration that implies a pitch. Nothing here is being sold. |
| Glassmorphism / translucent chrome | A translucent header smears the page behind it while scrolling. The header is opaque; the border does the work. |
| `rounded-xl` / `rounded-2xl` cards | Aggressively round corners read as "app". The radius scale is **2px, 3px, 4px** and nothing rounds more. |
| Identical card grids | Four interchangeable boxes is the single strongest "generated template" signal. Records became ruled data rows (`.dataset`), prose became an editorial spread (`.spread`), and processes became a numbered ledger (`.steps`). |
| Marketing pills and badges | Badges exist only for status facts: verification state, source kind, jurisdiction type. They are square-cornered and uppercase, so they read as data labels. |
| An icon per section | Icons are used where they carry a convention (the map, the mobile menu glyph) and nowhere else. There is no icon library. |
| Inter / Roboto / system-ui as the identity | See §2. |
| Purple, SaaS blue, dashboard teal | See §3. |
| Dark mode at launch | It doubles the surface area of a colour system whose entire job is to carry semantic state accurately. Worth doing deliberately later, not as a toggle. |
| A UI component library | It would bring its own opinions, bundle and definition of "primary" into a system whose whole value is that the definitions are ours. |

## 2. Typography

Three faces, each with one job. All are self-hosted through `next/font`, so there
is no third-party font request and no layout shift.

| Role | Face | Why this face |
| --- | --- | --- |
| **Display** | **Besley** | A Clarendon revival — the slab-serif family that carried nineteenth-century American public documents, railroad timetables and municipal printing. It is the vernacular of the material this product is *about*. It gives headings authority without the neutrality of a sans, and without the costume-drama feel of a fashion serif. Used for `h1`/`h2`, the calculated figure, and record names. |
| **Body / UI** | **Archivo** | A grotesque drawn for high-performance typography with a tall x-height, open apertures and a real italic. It stays legible at 13–15px in dense table cells and long legal-adjacent prose, and it is distinctly *not* Inter/Roboto/Open Sans. Chosen for tables, forms, breadcrumbs and body copy. |
| **Figures** | **IBM Plex Mono** | Fee formulas, per-unit rates, URL paths and step indices. Fixed advance width means a decimal point lands in the same column on every row, which is the whole reason a schedule can be scanned. Deliberately *not* used for money in prose — only where alignment or literal syntax matters. |

Rules:

- One `<h1>` per page. Heading levels are never skipped: order is a navigation aid
  for screen readers before it is an SEO signal.
- Money uses the display face with `font-variant-numeric: tabular-nums lining`
  (`.tnum`); body figures use tabular numerals too, so columns do not shimmer.
- Reading measure is capped (44rem reading, 58rem default, 76rem wide). Long-form
  prose at full width is where "looks generic" actually comes from.
- Headings use `text-wrap: balance`, paragraphs `text-wrap: pretty`.
- Apostrophes in visible copy are typographic (’), including in JSX attributes —
  HTML entities are not decoded inside a JSX string literal.

## 3. Colour

Warm paper, warm black ink, one petrol accent, and three semantic families. The
palette is deliberately *analogue*: it reads as printed matter rather than as a
dashboard. A screenshot of Permit-Fee should be recognisable from the paper tone
and the petrol accent alone.

| Token group | Value | Meaning |
| --- | --- | --- |
| `--color-canvas` | `#faf8f3` | The page: warm paper, never pure white. |
| `--color-surface` | `#ffffff` | A band that needs to lift off the paper (tables, disclosures). |
| `--color-subtle`, `--color-sunken` | `#f2efe7`, `#ece8de` | Quieter bands and code/`formula` fills. |
| `--color-line`, `--color-line-strong` | `#e4e0d5`, `#c7c2b4` | Hairlines, and the heavier rule used by table headers and source gutters. |
| `--color-ink-900` → `ink-400` | `#171614` → `#9a9587` | Six warm greys: headings, body, secondary, tertiary, meta, disabled. |
| **Accent** `--color-accent-*` | petrol `#08262e` → `#19697c` | Interaction only: links, focus rings, buttons, hover rules, the result rule. |
| **Signal** `--color-caution-*` | vermilion `#6f1f13` → `#ac3520` | *This is an estimate.* Every calculated figure and every "not included" note. |
| **Verified** `--color-verified-*` | green `#1b3d25` → `#275e39` | Checked against the source and inside its review window. |
| **Danger** `--color-danger-*` | dark red `#7a2118` → `#9a2a1e` | Something is wrong: overdue verification, disputed fee rule, form error. |

Why this palette works for this product:

- **Petrol is not SaaS blue.** It sits between teal and slate, appears in
  engineering drawings and ordinance stamps, and is dark enough that white text on
  it passes contrast at small sizes.
- **The estimate signal is vermilion, not amber.** Amber is the default warning
  colour of every dashboard on the internet. Vermilion is a stamp colour — it says
  "provisional" the way a rubber stamp does, and it survives greyscale as a dark
  tone.
- **Signal and danger are separated.** They are different sentences: *this number
  is an estimate* versus *this data needs attention*. Sharing one colour would make
  both weaker.

Contrast: body text is `--color-ink-800` on `--color-canvas` (>12:1); all ink
tones used for text meet WCAG AA on their backgrounds. No state is ever conveyed by
colour alone — every coloured element also carries a word.

## 4. Spacing, layout and rhythm

- **One vertical rhythm token**: `--section-y` (`clamp(3rem, 6.5vw, 5rem)`) with a
  tight variant for headers. Sections cannot drift apart because there is only one
  value to change.
- **Three measures**: read (44rem), default (58rem), wide (76rem). A fourth width
  is how layouts start to drift.
- **Bands**: `.band`, `.band--surface`, `.band--subtle`, `.band--tight`,
  `.band--lead`, `.band--ruled`. A page alternates paper → surface → paper so the
  eye can see where one subject ends, without a single card being drawn.
- **Grids**: `.grid-cards` (auto-fit, 16rem min) for contact cards and coverage
  descriptions; `.spread` (heading rail + reading column) for prose; `.steps`
  (numbered ledger) for process.
- Minimum tap target is 44px on mobile. Tables scroll inside `.tablewrap` rather
  than squeezing columns into illegibility.

### The grid bug worth remembering

`.grid-stack` exists because of a real defect, and it is the kind that only shows
up once real data is in the page. An `auto` grid track sizes to the widest item's
*max-content*, so one wide fee table (nowrap formulas, ~1000px of max-content)
stretched every sibling in the same grid — including the inputs table and the
result panel — straight through the panel's own border. The fix is
`grid-template-columns: minmax(0, 1fr)` plus `min-width: 0` on the items, which
lets `.tablewrap` scroll internally instead. Any vertical grid whose children may
contain a table needs both.

## 5. Component inventory

Small on purpose. Each one exists because a real page needed it.

**Primitives** (`components/ui`): `Container`, `Section`, `Rule`, `Button`,
`ButtonLink`, `Callout`, `Badge`, `Field`, `Input`, `CurrencyInput`, `Select`,
`DataTable` (+ `Th`, `Td`, `Tr`, `Tfoot`), `EditorialText`.

### Stored prose has a renderer, and it is not a paragraph

`EditorialText` exists because of a bug that was reported, not forecast. The prose
in this product — a jurisdiction's local context, the "not included" note, a
source's annotation — lives in one database column as one string, but it is written
as prose: blank lines separate paragraphs, lines beginning `- ` are list items, and
`**this**` is emphasis.

It was rendered, everywhere, as a single element with `white-space: pre-line`. That
produced three defects at once, none of which the content or the tests could see: a
four-paragraph explanation arrived as one grey slab, the list markers reached the
reader as literal hyphens, and the emphasis as literal asterisks.

The fix is a pure parser (`lib/editorial/text.ts`) and a thin server component that
maps its blocks to elements — paragraphs, a `<ul>` with a drawn marker, and a
`<strong>` that is `editorial__term` when it leads a list item. The term styling is
deliberate: `- **Plan review.** The two documents disagree…` is a list of exclusions
someone is scanning for one specific entry, so the lead of each item is set in full
ink and the rest recedes.

Three rules came out of it:

1. **No `pre-line` in this codebase.** `tests/content/prose-rendering.test.ts` fails
   if any `.tsx` or `.css` file reintroduces it, because the property *is* the bug.
2. **The parser may only consume markers, never text.** The same test file feeds
   every long prose field of every jurisdiction seed through the parser and asserts
   the reader's text equals the stored text with only `**` and bullet markers
   removed — a character more or less fails the suite.
3. **Structure claims are assertions.** Each jurisdiction must have a not-included
   list and a local context of more than one paragraph. If a future jurisdiction
   writes one flat paragraph, the suite says so rather than shipping a slab.

**Layout** (`components/layout`): `SiteHeader`, `SiteNav`, `BrandLink`,
`SiteFooter`, `PageHeader`.

`SiteNav` and `BrandLink` are the only two client components in the shell, and both
are there for behaviour a server component cannot provide: the current-section
marker, closing the mobile panel after a navigation, and the click that is a link to
the page you are already on — which the router treats as a no-op, so the reader is
put back at the top instead. The header's markup is still server-rendered HTML.

**Data** (`components/data`): `CalculationBreakdown`, `WorkedExamplePanel`,
`SourceList`, `VerificationBadge`, `VerificationNote`, `EmptyState`.

**Map** (`components/map`): `UsStatesMap` (server), `MapInteraction` (the single
client boundary, tooltip only).

**SEO** (`components/seo`): `Breadcrumbs`, `JsonLd`, `JsonLdBlocks`.

**Brand** (`components/brand`): `Mark` — a marginal-rate step chart, i.e. a literal
drawing of what a tiered fee schedule is — and `HeroPlate`, the same motif drawn
as a plotting sheet behind the home masthead.

### A page header is two columns, and the right one has to be filled

Every data page — state, jurisdiction, permit — opens with the same header: breadcrumbs, eyebrow,
title, lead, and the facts about the page. The header reserves a **19rem right-hand column** at
desktop widths, separated by a hairline.

That column was empty on all three page types for as long as they existed: the facts were passed
to a `.facts` block *below* the header instead of to the header's `aside` slot, so the lead sat in
a narrow measure on the left with the reserved column doing nothing, and the facts stacked into a
tall thin list underneath. On a 600-character jurisdiction summary that reads as a slab of text
beside a blank half-page — the exact complaint that produced this section.

The rule, therefore: **facts that are about the page belong in `aside`, not below the lead.** In
the rail they are ruled off from one another by hairlines and set as a specification, which is
what they are: issuing authority, permit pages, official sources, profile reviewed. Below 62rem
the grid collapses and they move under the lead, which is the order the eye wants on a phone.

### The lead is a standfirst plus body, and nothing is cut to make it fit

A jurisdiction summary carries real information — the mechanism, the authority, what is specific
to the place — and shortening it to look tidy would trade the product for the layout. Instead a
string lead above ~220 characters is split once by `splitLead` (`@/lib/editorial`): the first
sentence, or the first clause when the first sentence is too long, is set as a **standfirst** in
the display face at `clamp(1.3125rem, 2.1vw, 1.625rem)`, and everything else follows as the lead
body at the normal measure.

Two constraints make it safe to do automatically rather than per page. The split never happens
inside a figure — a boundary must be followed by whitespace, so the `.` in `$1,774.62` and the
`,` in `$25,000` are invisible to it, which matters in prose that is mostly numbers. And the
standfirst must be between 40 and 170 characters: any shorter and it is a fragment, any longer
and it is the same slab in a larger typeface. When no boundary qualifies, the lead renders as a
plain paragraph, which is what a short lead should do. The split is asserted in
`tests/lib/editorial-text.test.ts`, including the currency case.

### The mark, in two files

The mark exists twice and has to: the header's is a React component that inherits
`currentColor`; the favicon (`src/app/icon.svg`) must be a standalone file the
browser can fetch. Geometry is therefore repeated, and
`tests/brand/icon.test.ts` compares the two — bar positions, sizes and the opacity
ramp — so the favicon cannot silently fall behind the logo.

Named classes carry the system: `.btn`, `.badge`, `.callout`, `.table`, `.field`,
`.input`, `.panel`, `.stat`, `.facts`, `.dataset`, `.index-list`, `.source`,
`.crumbs`, `.steps`, `.spread`, `.result`, `.exclusions`, `.disclosure`, `.working`,
`.map`, `.skeleton`, `.empty`, `.formula`, `.tnum`.

## 6. State design

| State | Treatment |
| --- | --- |
| Calculated result | `.result` panel: uppercase label, display-size figure, provenance note, then a stamp row (schedule date, rules applied, rules considered). A left rule in petrol is the only accent. |
| Estimated total in an example | Same panel with the label "Example total"; the vermilion family marks the estimate caveat. |
| Verified data | Green badge, "Verified Sep 2026". |
| Overdue verification | Amber-family badge plus a sentence stating how far past the window it is. |
| No published fee schedule | A `Callout`, not silence, with the department route instead of a number. |
| Excluded fee components | Grouped list with a named reason per line — identical outcomes collapsed, with a count, so nine brackets do not print the same sentence nine times. |
| Verification | `:focus-visible` ring on **every** focusable element, including map states. |
| Disabled / loading buttons | `.btn[disabled]`, `.btn[data-loading="true"]` with a `.btn__spinner`; `aria-busy` is the caller's job. |
| Empty directory | `EmptyState`: what is missing, why, and a way forward. |
| Route failure | `app/error.tsx`: plain-language explanation, retry, and routes that do not depend on the failed request. The driver message is never rendered. |
| Form errors | `role="alert"`, `aria-describedby`, red text — not colour alone. |

## 7. The map

The states map is a real cartographic asset, not a decorative SVG:

- **Source**: US Census 20m state boundaries (public domain), projected with
  `d3-geo` in Albers USA, simplified and written to
  `src/content/geo/us-states.ts` by `scripts/generate-us-map.ts`. Nothing is
  fetched at runtime and no mapping library is shipped to the browser.
- **Rendering**: one `<svg>` server-rendered with real `viewBox` geometry, Alaska
  and Hawaii as insets, and one `<path>` per state. ~50KB of path data, no
  JavaScript to see the map.
- **Interaction**: every state is an `<a>` or a `<span>`, so hover, focus, click
  and keyboard navigation are native. Available states are drawn in a stronger
  ink; unavailable ones recede. The tooltip is the only client component: it
  measures itself against the container and flips below the shape near an edge.
- **Accessibility**: the map is never the only route. `.index-list` below it lists
  every state, published or not, and each published state is a link.
- **Verification**: the projection was checked visually, not just numerically —
  the first version mirrored the country vertically and pushed the insets off the
  canvas, which no assertion would have caught.

## 8. Interaction and motion

Short and purposeful. Durations are tokens: 120ms (feedback), 180ms (state
changes), 260ms (overlays). One ease curve: `cubic-bezier(0.32, 0.72, 0.3, 1)`.

- Hover: hairlines turn petrol, links underline, table rows and map states shift
  tone. Nothing moves.
- Press: `.btn:active` translates 1px. That is the entire "press" language.
- Disclosure: native `<details>` for mobile navigation, FAQ answers and
  "show the working". Zero JavaScript, correct semantics, real keyboard support.
- Reduced motion: `prefers-reduced-motion: reduce` collapses every transition and
  animation to 0.01ms globally, including the skeleton shimmer.

Implemented, in three layers:

1. **On load (hero).** The masthead elements rise in reading order, 70ms apart, and
the plotting sheet behind them drifts 14px over 46 seconds. The step trace draws
itself once with `stroke-dashoffset` and then stops.
2. **On load (map).** Each state rises 7 user units and fades in, 12ms after the
previous one. The delay is computed by the server component and passed as
`--enter-delay`, so the whole country arrives in about a second and a half without
a line of JavaScript.
3. **On scroll.** Bands and the items inside the ledger lists (`.steps`,
`.grid-cards`, `.dataset`, `.index-list`) rise in as they enter the viewport, using
`animation-timeline: view()` and gated behind `@supports`. A browser without
scroll-driven animations renders everything plainly rather than leaving it
invisible, and the first band on every page is excluded because it is on screen at
load. The reveal range is short (`entry 0% → entry 14%`) so a tall block that is
already partly visible never sits frozen half-transparent.

4. **Ambient, on the home hero only.** The plotting sheet drifts 14px over 46
seconds, and one short bright dash travels the whole fee-schedule trace every 9
seconds. The second is the one infinite decorative loop in the product.

That loop is a change of position, made on request rather than discovered. This
document previously listed "infinite decorative loops" among the things absent on
purpose, and the argument for it was not wrong: a tool answering a question should
not make the reader wait for a flourish. What changed the answer is which loop it
is. The plate is a marginal fee schedule; a mark travelling up it is the act of
reading that schedule from the first bracket to the last, which is literally what
the product does. It is drawn in the accent ink at full strength over a line at 42%
opacity, so the movement reads *on* the graphic rather than as the graphic moving.

The constraints it has to keep, and does:

- **One.** No second loop anywhere, and nothing loops in the data surfaces.
- **Slow and low contrast.** Nine seconds per pass; the eye finds it, it never
  interrupts a sentence.
- **Nothing depends on it.** It is decorative, `aria-hidden`, and it carries no
  content.
- **Reduced motion removes it entirely.** Not frozen — hidden, because the global
  rule collapses animations to 0.01ms with a single iteration, which would park the
dash at the foot of the trace as a stray bright dot.

Still absent, on purpose: parallax, animated gradients, page-transition wipes, and
any loop that is not this one. A tool that answers a question should not make the
reader wait for a flourish.

### Route changes jump, and that is a fix

`scroll-behavior: smooth` is deliberately not set on `html`, and the mechanism is
worth recording because the symptom looked like something else entirely.

Next's router resets the scroll position on a client-side navigation, and to do it
safely it wraps the reset in `disableSmoothScrollDuringRouteTransition`. That helper
only kicks in when `<html>` carries `data-scroll-behavior="smooth"`; without the
attribute it leaves the CSS alone and warns in development. So a global
`scroll-behavior: smooth` with no data attribute meant the reset to the top was
animated, and the incoming page's own layout change could interrupt the animation
part-way. Following a link therefore left the reader somewhere down the page they
had just asked for — clicking the brand from the directory landed on "How it
works", and Methodology landed on its second heading, while About happened to
survive because the previous scroll position was near the top.

Two fixes were available: keep the smooth scrolling and add the data attribute, or
drop the property. The property is the one that is wrong here. There are no in-page
anchors except the skip link, so nothing on this site benefits from animated
scrolling — and a jump is the correct behaviour for a reference work. A jump is not
a journey.

### One rule the animations taught us

The entrance lives on the map's wrapper element and the hover lift lives on the
shape inside it. Putting both on one element does not work: an animation with
`fill-mode: both` keeps its final `transform` forever, and an animation always
outranks a hover declaration — so the lift would simply never happen.

## 9. Accessibility baseline

- Semantic landmarks: `<header>`, `<main id="main">`, `<footer>`, `<nav aria-label>`.
- "Skip to content" is the first focusable element and is visible when focused.
- One consistent `:focus-visible` ring, defined once as `--ring`.
- Every form control has a real `<label>`; hints and errors are wired through
  `aria-describedby`; ids are derived from field names, never from render order.
- Tables use `<caption>`, `<th scope>` and a `<tfoot>` for totals, so header
  relationships survive being read aloud.
- Breadcrumbs are `<nav aria-label="Breadcrumb">` with `aria-current="page"`.
- Decorative rules are `aria-hidden`.
- Body text exceeds WCAG AA, and no meaning depends on colour.

## 10. Performance constraints the design respects

- The system is CSS-only: `globals.css` plus class names. No styling runtime.
- Only two client boundaries exist in the entire application: the map tooltip and
  (planned) the calculator. Everything else renders on the server.
- Icons are inline SVG or absent; there is no icon font and no sprite request.
- `next/font` self-hosts and preloads the three faces; the map is a server
  component, so its 50KB of geometry costs no client JavaScript.
- Tables, disclosures and the mobile menu are native HTML elements — faster and
  more accessible than any React equivalent.
