import type { CSSProperties } from "react";

import Link from "next/link";

import { MapInteraction } from "@/components/map/map-interaction";
import { US_MAP_VIEWBOX, US_STATE_SHAPES } from "@/content/geo/us-states";
import type { StateDirectoryEntry } from "@/lib/db/queries";
import { statePath } from "@/lib/seo/urls";

/**
 * The states map.
 *
 * A cartographic plate rather than a decorative graphic: real Albers USA
 * geometry, hairline borders, and exactly two meanings — states we publish, and
 * states we do not yet. There is no third colour and no choropleth, because a
 * choropleth would encode something we do not have (fee levels vary by permit,
 * not by state) and inventing a scale is the one thing this product must not do.
 *
 * Three deliberate properties:
 *
 *   1. **Rendered on the server.** The fifty paths are in the HTML. The client
 *      component receives them as children and only adds a tooltip, so the
 *      boundary data costs nothing in the JavaScript bundle.
 *   2. **A published state is a real link.** A `<Link>` inside the SVG means
 *      middle-click, copy-link, right-click and crawling all behave, which a
 *      `div` with an `onClick` handler never does.
 *   3. **The map is never the only route.** The full list below it is the
 *      accessible index, holds every state including the unavailable ones, and is
 *      complete without JavaScript.
 */

export function UsStatesMap({ directory }: { directory: StateDirectoryEntry[] }) {
  const published = new Map(directory.map((entry) => [entry.stateCode, entry]));

  return (
    <MapInteraction>
      <svg
        viewBox={US_MAP_VIEWBOX}
        className="map__svg"
        aria-labelledby="us-map-title us-map-desc"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title id="us-map-title">United States permit fee coverage</title>
        <desc id="us-map-desc">
          A map of the fifty states. States where permit fees are published are shown in colour and
          link to their page. Every state is also listed below the map.
        </desc>

        {US_STATE_SHAPES.map((state, index) => {
          const entry = published.get(state.code);
          const detail = entry
            ? entry.jurisdictions.map((item) => item.name).join(", ")
            : null;

          // The plate draws in, state by state. The delay is computed here rather
          // than in CSS because it depends on the position in the list, and it is
          // passed as a custom property so the animation itself stays in the
          // stylesheet. Twelve milliseconds apart: the whole country arrives in
          // under a second and a half, which is a drawing, not a slideshow.
          const enter = { "--enter-delay": `${index * 12}ms` } as CSSProperties;

          // `pointerEvents` is left alone: the fill is what makes a state hittable,
          // so a shape with no fill still reports hover as long as it is drawn.
          const path = (
            <path
              className="map__state"
              d={state.path}
              data-map-code={state.code}
              data-map-name={state.name}
              data-map-available={entry ? "true" : "false"}
              data-map-detail={detail ?? undefined}
            />
          );

          if (!entry) {
            // Unavailable states stay interactive for the tooltip but are not
            // focusable: fifty tab stops between the reader and the content is a
            // worse accessibility outcome than a shorter tab order, and the list
            // below carries them all.
            return (
              <g className="map__group" key={state.code} style={enter}>
                {path}
              </g>
            );
          }

          return (
            <Link
              key={state.code}
              className="map__link"
              href={statePath(entry.stateSlug)}
              aria-label={`${state.name}: permit fees published`}
              style={enter}
            >
              {path}
            </Link>
          );
        })}
      </svg>

      <div className="map__legend">
        <span className="map__legend-item">
          <span className="map__swatch map__swatch--available" aria-hidden="true" />
          {published.size === 1 ? "1 state covered" : `${published.size} states covered`}
        </span>
        <span className="map__legend-item">
          <span className="map__swatch" aria-hidden="true" />
          Not yet published
        </span>
        <span className="map__legend-item muted">Select a state to open its cities</span>
      </div>

      {/*
        The map itself is a picture of coverage, not the navigation: a dozen states
        render smaller than a fingertip at phone widths (Rhode Island is 4×5 px), and
        they are deliberately not tab stops. This row is the touchable, focusable
        surface for the states the map colours — the same links the list below gives
        in full, in map order so it reads as a caption to the picture above it.
      */}
      <p className="map__index">
        {directory.map((entry, index) => (
          <span key={entry.stateCode}>
            {index > 0 ? <span aria-hidden="true"> · </span> : null}
            <Link href={statePath(entry.stateSlug)}>{entry.stateName}</Link>
          </span>
        ))}
      </p>
    </MapInteraction>
  );
}
