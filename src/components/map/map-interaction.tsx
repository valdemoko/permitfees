"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * The map's interaction layer.
 *
 * The geometry is rendered by the server as SVG paths and arrives here as
 * `children`, so the boundary data is never part of a client bundle — it is in the
 * HTML, where it can be cached, indexed and printed. This component adds only the
 * tooltip, and nothing about it changes the document if JavaScript never runs:
 * the map is still a map, and the list below it is still the navigation.
 *
 * **Native listeners, not React props.** React's synthetic events on SVG
 * descendants did not fire here — a `mouseover` dispatched on a `<path>` bubbled
 * to the container natively but never reached the `onMouseOver` prop, so the
 * tooltip was dead. Attaching three listeners to the container in an effect is
 * both reliable and cheaper: React is not asked to build a synthetic event for
 * every pointer move across fifty shapes.
 */

type Hovered = {
  code: string;
  name: string;
  available: boolean;
  detail: string | null;
  /** Anchor point, in container-relative pixels. */
  x: number;
  y: number;
};

export function MapInteraction({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<Hovered | null>(null);
  const [placement, setPlacement] = useState<{ x: number; y: number; below: boolean } | null>(null);

  const readState = useCallback((target: EventTarget | null): Hovered | null => {
    if (!(target instanceof Element)) return null;

    // A pointer lands on the `<path>`, which carries the data. Keyboard focus
    // lands on the `<a>` that wraps it, which does not — so the shape is looked
    // for downwards as well as upwards. Missing that case is why the tooltip used
    // to show the previous state's city when a published state was tabbed to.
    const shape =
      target.closest("[data-map-code]") ?? target.querySelector("[data-map-code]");

    const container = containerRef.current;
    if (!shape || !container) return null;

    const box = shape.getBoundingClientRect();
    const frame = container.getBoundingClientRect();

    return {
      code: shape.getAttribute("data-map-code") ?? "",
      name: shape.getAttribute("data-map-name") ?? "",
      available: shape.getAttribute("data-map-available") === "true",
      detail: shape.getAttribute("data-map-detail"),
      x: box.left - frame.left + box.width / 2,
      y: box.top - frame.top,
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleOver = (event: Event) => {
      const next = readState(event.target);
      if (next) setHovered(next);
    };

    const handleOut = (event: Event) => {
      const related = (event as MouseEvent).relatedTarget;
      // Moving between two shapes fires `out` then `over`; clearing only when the
      // pointer has actually left a shape avoids a flicker on every boundary.
      if (related instanceof Element && related.closest("[data-map-code]")) return;
      setHovered(null);
    };

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setHovered(null);
    };

    container.addEventListener("mouseover", handleOver);
    container.addEventListener("mouseout", handleOut);
    // Focus and blur do not bubble, so the bubbling equivalents are used: this is
    // what makes the tooltip appear when a published state is reached by keyboard.
    container.addEventListener("focusin", handleOver);
    container.addEventListener("focusout", handleOut);
    container.addEventListener("keydown", handleKey);

    return () => {
      container.removeEventListener("mouseover", handleOver);
      container.removeEventListener("mouseout", handleOut);
      container.removeEventListener("focusin", handleOver);
      container.removeEventListener("focusout", handleOut);
      container.removeEventListener("keydown", handleKey);
    };
  }, [readState]);

  /**
   * Keep the tooltip inside the card.
   *
   * Measured rather than assumed: this runs after the tooltip has rendered, so it
   * knows its own size and the container's. It clamps horizontally and flips below
   * the shape when there is no room above it, which are the two ways a tooltip
   * fails — half outside the card, or clipped off the top of the map.
   *
   * The unmeasured first paint uses the shape's own anchor point, which is already
   * correct for the common case, so the clamp is a correction rather than a jump.
   */
  useLayoutEffect(() => {
    const tooltip = tooltipRef.current;
    const container = containerRef.current;

    if (!tooltip || !container || !hovered) {
      setPlacement(null);
      return;
    }

    const half = tooltip.offsetWidth / 2;
    const height = tooltip.offsetHeight;
    const width = container.clientWidth;

    setPlacement({
      x: Math.min(Math.max(hovered.x, half + 4), Math.max(half + 4, width - half - 4)),
      y: hovered.y,
      below: hovered.y - height - 12 < 0,
    });
  }, [hovered]);

  return (
    <div className="map" ref={containerRef}>
      {children}

      {hovered ? (
        <div
          className="map__tooltip"
          ref={tooltipRef}
          style={{
            left: placement?.x ?? hovered.x,
            top: placement?.y ?? hovered.y,
            ...(placement?.below ? { transform: "translate(-50%, 14px)" } : {}),
          }}
          role="status"
        >
          <span className="map__tooltip-name">{hovered.name}</span>
          <span className="map__tooltip-state" data-map-available={hovered.available}>
            {hovered.available ? "Available" : "Not yet available"}
          </span>
          {hovered.detail ? <span className="map__tooltip-detail">{hovered.detail}</span> : null}
        </div>
      ) : null}
    </div>
  );
}
