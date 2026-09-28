/**
 * The only place the current time enters the application.
 *
 * The engine, the publishing gate and every pure helper take an explicit `asOf`.
 * Isolating the clock here means:
 *
 *   - the calculation engine stays deterministic and testable;
 *   - a page rendered by ISR records the date it was rendered, which is what we
 *     actually want to display, rather than pretending to be real-time.
 */

/** Today as an ISO `YYYY-MM-DD` date, in UTC. */
export function currentIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}
