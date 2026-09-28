"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

import { CalculationBreakdown } from "@/components/data/calculation-breakdown";
import { Callout } from "@/components/ui/callout";
import { Button } from "@/components/ui/button";
import {
  calculatePermitFees,
  type CalculationInput,
  type CalculationResult,
  type FeeRuleRecord,
} from "@/lib/calc";
import { formatCents } from "@/lib/format";
import { calculatorEstimateDisclaimer } from "@/lib/content/calculator-page";
import type { CalculatorJurisdictionOption } from "@/lib/db/queries";
import { jurisdictionPath, permitPagePath, statePath } from "@/lib/seo/urls";

/**
 * The interactive permit fee calculator.
 *
 * Architecture note: this is the ONLY client component on the page. The
 * jurisdiction catalogue arrives as a serialisable prop from the server
 * component; the fee rules for a selection are fetched from a server action
 * (`fetchCalculatorRules`), so no rule JSON for the other jurisdictions ever
 * reaches the browser. The calculation itself is the site's real engine —
 * `calculatePermitFees` — running the same pure function the published permit
 * pages run, on the same rule records, so an estimate here and a worked
 * example on a permit page cannot disagree.
 *
 * Inputs the reader types are parsed defensively before they become engine
 * facts: money in cents, counts as whole numbers, and every invalid state is
 * a visible message rather than a plausible-looking total.
 */

type RulesState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error" }
  | {
      status: "ready";
      feeRuleRecords: FeeRuleRecord[];
      lastVerifiedAt: string | null;
    };

export type PermitFeeCalculatorProps = {
  jurisdictions: CalculatorJurisdictionOption[];
  /** Server action that loads the rule records for one jurisdiction + permit. */
  fetchRules: (jurisdictionSlug: string, permitTypeKey: string) => Promise<{
    ok: boolean;
    feeRuleRecords?: FeeRuleRecord[];
    lastVerifiedAt?: string | null;
  }>;
};

/* -------------------------------------------------------------------------- */
/* Input parsing                                                              */
/* -------------------------------------------------------------------------- */

/** Parse a money string ("250000", "250,000.50") into integer cents. */
function parseMoneyCents(raw: string): { ok: true; cents: number } | { ok: false; error: string } {
  const cleaned = raw.replace(/[$,\s]/g, "");
  if (cleaned === "") return { ok: false, error: "Enter a project value greater than $0." };
  if (!/^\d*(\.\d{0,2})?$/.test(cleaned)) {
    return { ok: false, error: "Enter a dollar amount, for example 250000 or 250000.50." };
  }
  const value = Number(cleaned);
  if (!Number.isFinite(value) || value <= 0) {
    return { ok: false, error: "Enter a project value greater than $0." };
  }
  if (value > 5_000_000_000) {
    return { ok: false, error: "That value is too large — check the amount and try again." };
  }
  return { ok: true, cents: Math.round(value * 100) };
}

/** Parse a whole-number count ("40"), rejecting negatives, decimals, nonsense. */
function parseCount(raw: string, label: string): { ok: true; value: number } | { ok: false; error: string } {
  const cleaned = raw.replace(/[,\s]/g, "");
  if (cleaned === "") return { ok: false, error: `Enter ${label.toLowerCase()} to calculate with.` };
  if (!/^\d+$/.test(cleaned)) {
    return { ok: false, error: `Enter ${label.toLowerCase()} as a whole number, for example 12.` };
  }
  const value = Number(cleaned);
  if (value === 0) {
    return { ok: false, error: `Enter ${label.toLowerCase()} greater than 0.` };
  }
  if (value > 1_000_000) {
    return { ok: false, error: `That ${label.toLowerCase()} is too large — check the number and try again.` };
  }
  return { ok: true, value };
}

/* -------------------------------------------------------------------------- */
/* Which inputs the selected rules need                                       */
/* -------------------------------------------------------------------------- */

/**
 * Derive the input form from the rules themselves.
 *
 * This is the "do not invent inputs" rule, enforced in code: a jurisdiction
 * that prices everything off valuation shows one money field; Houston's
 * plumbing sheet asks for fixtures; a schedule with conditional custom facts
 * asks for the ones its rules actually read. The mapping below covers the
 * first-class facts and the per-unit kinds that occur across the current
 * dataset; anything else surfaces as a missing-input warning from the engine
 * in the result, which is the honest fallback.
 */
function deriveInputSpec(rules: FeeRuleRecord[]): {
  needsValuation: boolean;
  needsSquareFootage: boolean;
  needsUnits: boolean;
  needsFixtures: boolean;
  needsOccupancy: boolean;
  needsWorkType: boolean;
  countLabels: Array<{ key: string; label: string }>;
} {
  const spec = {
    needsValuation: false,
    needsSquareFootage: false,
    needsUnits: false,
    needsFixtures: false,
    needsOccupancy: false,
    needsWorkType: false,
    countLabels: [] as Array<{ key: string; label: string }>,
  };

  const seenCounts = new Set<string>();

  // The human label for each custom fact key, derived from the same convention
  // the engine's description layer uses: snake_case to words.
  const labelForFact = (key: string): string =>
    key
      .replace(/^custom\./, "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const visitCondition = (condition: unknown): void => {
    if (condition === null || typeof condition !== "object") return;
    if ("all" in condition) (condition.all as unknown[]).forEach(visitCondition);
    else if ("any" in condition) (condition.any as unknown[]).forEach(visitCondition);
    else if ("not" in condition) visitCondition(condition.not);
    else if ("field" in condition) {
      const field = String((condition as { field: unknown }).field);
      switch (field) {
        case "valuation":
          spec.needsValuation = true;
          break;
        case "square_footage":
          spec.needsSquareFootage = true;
          break;
        case "units":
          spec.needsUnits = true;
          break;
        case "fixtures":
          spec.needsFixtures = true;
          break;
        case "occupancy":
          spec.needsOccupancy = true;
          break;
        case "work_type":
          spec.needsWorkType = true;
          break;
        default:
          if (!seenCounts.has(field)) {
            seenCounts.add(field);
            spec.countLabels.push({ key: field, label: labelForFact(field) });
          }
      }
    }
  };

  for (const rule of rules) {
    if (rule.status !== "active") continue;
    if (rule.conditions) visitCondition(rule.conditions);

    const config = rule.config as { basis?: string; unit?: string };
    switch (config?.basis) {
      case "valuation":
      case "permit_fee":
      case "fee_subtotal":
        spec.needsValuation = true;
        break;
      case "square_footage":
        spec.needsSquareFootage = true;
        break;
      case "units":
        spec.needsUnits = true;
        break;
      case "fixtures":
        spec.needsFixtures = true;
        break;
      default:
        if (typeof config?.basis === "string" && config.basis.startsWith("custom.")) {
          if (!seenCounts.has(config.basis)) {
            seenCounts.add(config.basis);
            spec.countLabels.push({ key: config.basis, label: labelForFact(config.basis) });
          }
        }
    }

    if (typeof config?.unit === "string") {
      // per_unit kinds read the fact `custom.<unit>` (dwelling_units reads `units`).
      const factKey = config.unit === "dwelling_units" ? "units" : `custom.${config.unit}`;
      if (factKey === "units") spec.needsUnits = true;
      else if (factKey === "fixtures") spec.needsFixtures = true;
      else if (!seenCounts.has(factKey)) {
        seenCounts.add(factKey);
        spec.countLabels.push({ key: factKey, label: labelForFact(config.unit) });
      }
    }
  }

  return spec;
}

/**
 * Parse the contextual-prefill query parameters against the jurisdiction
 * catalogue.
 *
 * Pure and exported for tests. The whitelist is the three documented keys
 * (`state`, `city`, `permit`); unknown parameters are ignored. A selection
 * only takes effect when the slugs actually exist in the catalogue, so nothing
 * from the query string reaches anything but a string comparison — a wrong or
 * stale prefill simply does nothing, which is the honest outcome for a link
 * whose target data moved.
 *
 * `state` + `city` are required together (the location selectors are a pair);
 * `permit` is optional and only resolves when the location resolved and the
 * catalogue offers that permit type for the jurisdiction.
 */
export function resolvePrefill(
  params: URLSearchParams,
  jurisdictions: Array<Pick<CalculatorJurisdictionOption, "stateSlug" | "jurisdictionSlug" | "permits">>,
): { stateSlug: string; jurisdictionSlug: string; permitTypeKey: string | null } | null {
  const state = params.get("state");
  const city = params.get("city");
  if (!state || !city) return null;

  const jurisdiction = jurisdictions.find(
    (entry) => entry.stateSlug === state && entry.jurisdictionSlug === city,
  );
  if (!jurisdiction) return null;

  const permitKey = params.get("permit");
  if (!permitKey) return { stateSlug: jurisdiction.stateSlug, jurisdictionSlug: jurisdiction.jurisdictionSlug, permitTypeKey: null };

  const permit = jurisdiction.permits.find((p) => p.permitTypeKey === permitKey);
  if (!permit) return { stateSlug: jurisdiction.stateSlug, jurisdictionSlug: jurisdiction.jurisdictionSlug, permitTypeKey: null };

  return { stateSlug: jurisdiction.stateSlug, jurisdictionSlug: jurisdiction.jurisdictionSlug, permitTypeKey: permit.permitTypeKey };
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export function PermitFeeCalculator({ jurisdictions, fetchRules }: PermitFeeCalculatorProps) {
  //
  // Contextual prefill, read in the mount effect below from `window.location`.
  // It is deliberately NOT read with `useSearchParams`: the hook would force
  // the component behind a Suspense fallback in the static output, and the
  // whole point of this layout is that the calculator shell renders on the
  // server. The query string is also deliberately not read on the page: that
  // would make the route dynamic. The whitelist is the three keys in the
  // effect; the values only take effect when both slugs exist in the
  // catalogue, so nothing untrusted reaches anything but a string comparison.
  // The canonical stays the bare path regardless of the parameters.
  //
  const prefillApplied = useRef(false);

  const [stateSlug, setStateSlug] = useState("");
  const [jurisdictionSlug, setJurisdictionSlug] = useState("");
  const [permitTypeKey, setPermitTypeKey] = useState("");
  const [rules, setRules] = useState<RulesState>({ status: "idle" });

  // Project inputs — all strings until a valid calculation needs them.
  const [valuation, setValuation] = useState("");
  const [squareFootage, setSquareFootage] = useState("");
  const [units, setUnits] = useState("");
  const [fixtures, setFixtures] = useState("");
  const [occupancy, setOccupancy] = useState("");
  const [workType, setWorkType] = useState("");
  const [counts, setCounts] = useState<Record<string, string>>({});

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<CalculationResult | null>(null);

  const states = useMemo(() => {
    const seen = new Map<string, { stateSlug: string; stateName: string; stateCode: string }>();
    for (const entry of jurisdictions) {
      if (!seen.has(entry.stateSlug)) {
        seen.set(entry.stateSlug, {
          stateSlug: entry.stateSlug,
          stateName: entry.stateName,
          stateCode: entry.stateCode,
        });
      }
    }
    return [...seen.values()].sort((a, b) => a.stateName.localeCompare(b.stateName));
  }, [jurisdictions]);

  const selectedJurisdiction = useMemo(
    () => jurisdictions.find((entry) => entry.jurisdictionSlug === jurisdictionSlug) ?? null,
    [jurisdictions, jurisdictionSlug],
  );

  const jurisdictionOptions = useMemo(
    () => jurisdictions.filter((entry) => entry.stateSlug === stateSlug),
    [jurisdictions, stateSlug],
  );

  const selectedPermit = selectedJurisdiction?.permits.find((p) => p.permitTypeKey === permitTypeKey) ?? null;

  const inputSpec = useMemo(
    () => (rules.status === "ready" ? deriveInputSpec(rules.feeRuleRecords) : null),
    [rules],
  );

  // Load the prefilled selection once, after mount, from the query string.
  // (The state+city link without a permit just preselects location and leaves
  // step 2 waiting for the reader.)
  useEffect(() => {
    if (prefillApplied.current) return;
    prefillApplied.current = true;

    const params = new URLSearchParams(window.location.search);
    const prefill = resolvePrefill(params, jurisdictions);
    if (!prefill) return;

    setStateSlug(prefill.stateSlug);
    setJurisdictionSlug(prefill.jurisdictionSlug);

    if (!prefill.permitTypeKey) return;
    const permit = jurisdictions
      .find((entry) => entry.jurisdictionSlug === prefill.jurisdictionSlug)
      ?.permits.find((p) => p.permitTypeKey === prefill.permitTypeKey);
    if (!permit) return;
    // The permit's rules are loaded directly with the slugs in hand rather than
    // through `onPermitChange`: that function closes over this render's state,
    // where `jurisdictionSlug` is still "" on mount. The state setters above
    // and the fetch below together produce exactly the state a manual
    // selection would.
    const loadPrefilledRules = async (): Promise<void> => {
      setPermitTypeKey(permit.permitTypeKey);
      setRules({ status: "loading" });
      const response = await fetchRules(prefill.jurisdictionSlug, permit.permitTypeKey);
      if (response.ok && response.feeRuleRecords) {
        setRules({
          status: "ready",
          feeRuleRecords: response.feeRuleRecords,
          lastVerifiedAt: response.lastVerifiedAt ?? null,
        });
      } else {
        setRules({ status: "error" });
      }
    };
    void loadPrefilledRules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jurisdictions]);

  function resetProject() {
    setValuation("");
    setSquareFootage("");
    setUnits("");
    setFixtures("");
    setOccupancy("");
    setWorkType("");
    setCounts({});
    setErrors({});
    setResult(null);
  }

  async function onJurisdictionChange(slug: string) {
    setJurisdictionSlug(slug);
    setPermitTypeKey("");
    setRules({ status: "idle" });
    resetProject();
  }

  async function onPermitChange(key: string) {
    setPermitTypeKey(key);
    setResult(null);
    setErrors({});
    if (!jurisdictionSlug || !key) {
      setRules({ status: "idle" });
      return;
    }
    setRules({ status: "loading" });
    const response = await fetchRules(jurisdictionSlug, key);
    if (response.ok && response.feeRuleRecords) {
      setRules({
        status: "ready",
        feeRuleRecords: response.feeRuleRecords,
        lastVerifiedAt: response.lastVerifiedAt ?? null,
      });
    } else {
      setRules({ status: "error" });
    }
  }

  function buildInput(): CalculationInput | null {
    const nextErrors: Record<string, string> = {};
    const input: CalculationInput & { custom: Record<string, string | number> } = {
      asOf: new Date().toISOString().slice(0, 10),
      custom: {},
    };

    if (inputSpec?.needsValuation) {
      const parsed = parseMoneyCents(valuation);
      if (parsed.ok) input.valuationCents = parsed.cents;
      else nextErrors.valuation = parsed.error;
    }
    if (inputSpec?.needsSquareFootage) {
      const parsed = parseCount(squareFootage, "Square footage");
      if (parsed.ok) input.squareFootage = parsed.value;
      else nextErrors.squareFootage = parsed.error;
    }
    if (inputSpec?.needsUnits) {
      const parsed = parseCount(units, "Dwelling units");
      if (parsed.ok) input.units = parsed.value;
      else nextErrors.units = parsed.error;
    }
    if (inputSpec?.needsFixtures) {
      const parsed = parseCount(fixtures, "Number of fixtures");
      if (parsed.ok) input.fixtures = parsed.value;
      else nextErrors.fixtures = parsed.error;
    }
    if (inputSpec?.needsOccupancy && !occupancy) {
      nextErrors.occupancy = "Select the occupancy class.";
    } else if (occupancy) {
      input.occupancy = occupancy as CalculationInput["occupancy"];
    }
    if (inputSpec?.needsWorkType && !workType) {
      nextErrors.workType = "Select the type of work.";
    } else if (workType) {
      input.workType = workType as CalculationInput["workType"];
    }

    for (const { key, label } of inputSpec?.countLabels ?? []) {
      const raw = counts[key] ?? "";
      const parsed = parseCount(raw, label);
      if (parsed.ok) input.custom[key.replace(/^custom\./, "")] = parsed.value;
      else nextErrors[key] = parsed.error;
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return null;
    return input;
  }

  function onCalculate() {
    if (!rules || rules.status !== "ready") return;
    const input = buildInput();
    if (!input) {
      setResult(null);
      return;
    }
    setResult(calculatePermitFees(input, rules.feeRuleRecords));
  }

  function onStartOver() {
    setStateSlug("");
    setJurisdictionSlug("");
    setPermitTypeKey("");
    setRules({ status: "idle" });
    resetProject();
  }

  const hasSelection = Boolean(stateSlug && jurisdictionSlug && permitTypeKey);
  const stateName = states.find((s) => s.stateSlug === stateSlug)?.stateName ?? "";
  const jurisdictionName = selectedJurisdiction?.jurisdictionName ?? "";
  const jurisdictionLabel =
    jurisdictionName && stateName ? `${jurisdictionName}, ${stateName}` : jurisdictionName || stateName;

  return (
    <div className="panel" id="calculator">
      <div className="panel__header">
        <p className="panel__title">Estimate a permit fee</p>
        <p className="muted" style={{ margin: 0, fontSize: "0.8125rem" }}>
          Based on the published fee schedule for the jurisdiction you select
        </p>
      </div>

      <div className="panel__body" style={{ display: "grid", gap: "1.25rem" }}>
        {/* Step 1 — Location */}
        <fieldset style={{ border: 0, margin: 0, padding: 0, display: "grid", gap: "0.75rem" }}>
          <legend className="facts__label" style={{ marginBottom: "0.25rem" }}>
            Step 1 — Location
          </legend>
          <div className="calculator-grid">
            <div className="field">
              <label className="field__label" htmlFor="calc-state">
                State
              </label>
              <select
                id="calc-state"
                className="select"
                value={stateSlug}
                onChange={(event) => {
                  setStateSlug(event.target.value);
                  void onJurisdictionChange("");
                }}
              >
                <option value="">Select a state…</option>
                {states.map((state) => (
                  <option key={state.stateSlug} value={state.stateSlug}>
                    {state.stateName}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label className="field__label" htmlFor="calc-jurisdiction">
                City / Jurisdiction
              </label>
              <select
                id="calc-jurisdiction"
                className="select"
                value={jurisdictionSlug}
                onChange={(event) => void onJurisdictionChange(event.target.value)}
                disabled={stateSlug === ""}
              >
                <option value="">
                  {stateSlug === "" ? "Select a state first" : "Select a city or county…"}
                </option>
                {jurisdictionOptions.map((entry) => (
                  <option key={entry.jurisdictionSlug} value={entry.jurisdictionSlug}>
                    {entry.jurisdictionName} ({entry.permits.length} permit{" "}
                    {entry.permits.length === 1 ? "type" : "types"})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        {/* Step 2 — Permit type */}
        {jurisdictionSlug ? (
          <fieldset style={{ border: 0, margin: 0, padding: 0, display: "grid", gap: "0.75rem" }}>
            <legend className="facts__label" style={{ marginBottom: "0.25rem" }}>
              Step 2 — Permit type
            </legend>
            {selectedJurisdiction && selectedJurisdiction.permits.length > 0 ? (
              <div className="field">
                <label className="field__label" htmlFor="calc-permit">
                  Permit type
                </label>
                <select
                  id="calc-permit"
                  className="select"
                  value={permitTypeKey}
                  onChange={(event) => void onPermitChange(event.target.value)}
                >
                  <option value="">Select a permit type…</option>
                  {selectedJurisdiction.permits.map((permit) => (
                    <option key={permit.permitTypeKey} value={permit.permitTypeKey}>
                      {permit.permitTypeName}
                    </option>
                  ))}
                </select>
                <p className="field__hint">
                  Only the permit types this jurisdiction&rsquo;s published pages cover are listed.
                </p>
              </div>
            ) : (
              <p className="empty">
                We don&rsquo;t currently have enough verified fee data for this jurisdiction to offer a
                calculation. See the{" "}
                {selectedJurisdiction ? (
                  <Link href={jurisdictionPath(selectedJurisdiction.stateSlug, selectedJurisdiction.jurisdictionSlug)}>
                    {jurisdictionName} jurisdiction page
                  </Link>
                ) : null}{" "}
                for what is published.
              </p>
            )}
          </fieldset>
        ) : null}

        {/* Step 3 — Project inputs, derived from the rules */}
        {rules.status === "loading" ? (
          <p className="muted" role="status">
            Loading the fee rules for this permit type…
          </p>
        ) : null}

        {rules.status === "error" ? (
          <Callout variant="warning" label="Could not load the fee rules">
            <p style={{ margin: 0 }}>
              The fee rules could not be loaded just now. This is a temporary problem on our side —
              try again in a moment. Nothing has been estimated.
            </p>
          </Callout>
        ) : null}

        {rules.status === "ready" && inputSpec ? (
          <fieldset style={{ border: 0, margin: 0, padding: 0, display: "grid", gap: "0.75rem" }}>
            <legend className="facts__label" style={{ marginBottom: "0.25rem" }}>
              Step 3 — Project information
            </legend>
            {rules.feeRuleRecords.filter((r) => r.status === "active").length === 0 ? (
              <Callout variant="note" label="No published fee rules">
                <p style={{ margin: 0 }}>
                  This jurisdiction does not publish a fee schedule we can calculate from for this
                  permit type, so no estimate is possible. The{" "}
                  {selectedJurisdiction ? (
                    <Link
                      href={
                        selectedPermit
                          ? permitPagePath(
                              selectedJurisdiction.stateSlug,
                              selectedJurisdiction.jurisdictionSlug,
                              selectedPermit.pageSlug,
                            )
                          : jurisdictionPath(
                              selectedJurisdiction.stateSlug,
                              selectedJurisdiction.jurisdictionSlug,
                            )
                      }
                    >
                      {jurisdictionName} permit page
                    </Link>
                  ) : null}{" "}
                  explains what is published, and the official source is linked there.
                </p>
              </Callout>
            ) : (
              <>
                <div className="calculator-grid">
                  {inputSpec.needsValuation ? (
                    <div className="field">
                      <label className="field__label" htmlFor="calc-valuation">
                        Project valuation ($)
                      </label>
                      <div className="input-affix">
                        <span className="input-affix__unit" aria-hidden="true">
                          $
                        </span>
                        <input
                          id="calc-valuation"
                          className="input input--figures"
                          type="text"
                          inputMode="decimal"
                          autoComplete="off"
                          placeholder="250,000"
                          value={valuation}
                          onChange={(event) => setValuation(event.target.value)}
                          aria-invalid={errors.valuation ? true : undefined}
                          aria-describedby={errors.valuation ? "calc-valuation-error" : undefined}
                        />
                      </div>
                      <p className="field__hint">The total cost of construction, not including land.</p>
                      {errors.valuation ? (
                        <p className="field__error" id="calc-valuation-error" role="alert">
                          {errors.valuation}
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  {inputSpec.needsSquareFootage ? (
                    <div className="field">
                      <label className="field__label" htmlFor="calc-area">
                        Square footage
                      </label>
                      <input
                        id="calc-area"
                        className="input input--figures"
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        placeholder="2000"
                        value={squareFootage}
                        onChange={(event) => setSquareFootage(event.target.value)}
                        aria-invalid={errors.squareFootage ? true : undefined}
                        aria-describedby={errors.squareFootage ? "calc-area-error" : undefined}
                      />
                      {errors.squareFootage ? (
                        <p className="field__error" id="calc-area-error" role="alert">
                          {errors.squareFootage}
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  {inputSpec.needsUnits ? (
                    <div className="field">
                      <label className="field__label" htmlFor="calc-units">
                        Number of units
                      </label>
                      <input
                        id="calc-units"
                        className="input input--figures"
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        placeholder="1"
                        value={units}
                        onChange={(event) => setUnits(event.target.value)}
                        aria-invalid={errors.units ? true : undefined}
                        aria-describedby={errors.units ? "calc-units-error" : undefined}
                      />
                      {errors.units ? (
                        <p className="field__error" id="calc-units-error" role="alert">
                          {errors.units}
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  {inputSpec.needsFixtures ? (
                    <div className="field">
                      <label className="field__label" htmlFor="calc-fixtures">
                        Number of fixtures
                      </label>
                      <input
                        id="calc-fixtures"
                        className="input input--figures"
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        placeholder="10"
                        value={fixtures}
                        onChange={(event) => setFixtures(event.target.value)}
                        aria-invalid={errors.fixtures ? true : undefined}
                        aria-describedby={errors.fixtures ? "calc-fixtures-error" : undefined}
                      />
                      {errors.fixtures ? (
                        <p className="field__error" id="calc-fixtures-error" role="alert">
                          {errors.fixtures}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                <div className="calculator-grid">
                  {inputSpec.needsOccupancy ? (
                    <div className="field">
                      <label className="field__label" htmlFor="calc-occupancy">
                        Occupancy
                      </label>
                      <select
                        id="calc-occupancy"
                        className="select"
                        value={occupancy}
                        onChange={(event) => setOccupancy(event.target.value)}
                        aria-invalid={errors.occupancy ? true : undefined}
                      >
                        <option value="">Select…</option>
                        <option value="residential">Residential</option>
                        <option value="commercial">Commercial</option>
                        <option value="industrial">Industrial</option>
                        <option value="mixed">Mixed</option>
                        <option value="other">Other</option>
                      </select>
                      {errors.occupancy ? (
                        <p className="field__error" role="alert">
                          {errors.occupancy}
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  {inputSpec.needsWorkType ? (
                    <div className="field">
                      <label className="field__label" htmlFor="calc-worktype">
                        Type of work
                      </label>
                      <select
                        id="calc-worktype"
                        className="select"
                        value={workType}
                        onChange={(event) => setWorkType(event.target.value)}
                        aria-invalid={errors.workType ? true : undefined}
                      >
                        <option value="">Select…</option>
                        <option value="new_construction">New construction</option>
                        <option value="addition">Addition</option>
                        <option value="remodel">Remodel</option>
                        <option value="alteration">Alteration</option>
                        <option value="repair">Repair</option>
                        <option value="replacement">Replacement</option>
                        <option value="demolition">Demolition</option>
                        <option value="other">Other</option>
                      </select>
                      {errors.workType ? (
                        <p className="field__error" role="alert">
                          {errors.workType}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                {inputSpec.countLabels.length > 0 ? (
                  <div className="calculator-grid">
                    {inputSpec.countLabels.map(({ key, label }) => (
                      <div className="field" key={key}>
                        <label className="field__label" htmlFor={`calc-count-${key}`}>
                          {label}
                        </label>
                        <input
                          id={`calc-count-${key}`}
                          className="input input--figures"
                          type="text"
                          inputMode="numeric"
                          autoComplete="off"
                          value={counts[key] ?? ""}
                          onChange={(event) =>
                            setCounts((previous) => ({ ...previous, [key]: event.target.value }))
                          }
                          aria-invalid={errors[key] ? true : undefined}
                          aria-describedby={errors[key] ? `calc-count-${key}-error` : undefined}
                        />
                        {errors[key] ? (
                          <p className="field__error" id={`calc-count-${key}-error`} role="alert">
                            {errors[key]}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className="page-head__actions" style={{ marginTop: 0 }}>
                  <Button type="button" variant="primary" size="large" onClick={onCalculate}>
                    Calculate permit fee
                  </Button>
                  {result ? (
                    <Button type="button" variant="secondary" onClick={onCalculate}>
                      Recalculate
                    </Button>
                  ) : null}
                  <Button type="button" variant="quiet" onClick={onStartOver}>
                    Start over
                  </Button>
                </div>
              </>
            )}
          </fieldset>
        ) : null}

        {/* Result */}
        <div aria-live="polite">
          {result ? (
            <div style={{ display: "grid", gap: "1.5rem" }}>
              <CalculationBreakdown result={result} totalLabel="Estimated permit fee" />

              <Callout variant="estimate" label="What this estimate covers">
                <p style={{ margin: 0 }}>{calculatorEstimateDisclaimer(jurisdictionLabel)}</p>
              </Callout>

              {/* Official source */}
              {rules.status === "ready" && rules.feeRuleRecords.length > 0 ? (
                <div>
                  <h3 className="step__title" style={{ marginBottom: "0.5rem" }}>
                    Official source
                  </h3>
                  <p className="muted" style={{ fontSize: "0.875rem", maxWidth: "68ch" }}>
                    The rates in this calculation come from the jurisdiction&rsquo;s own published
                    documents. Verify the final amount with the issuing authority.
                  </p>
                  <p style={{ fontSize: "0.875rem" }}>
                    <Link
                      href={
                        selectedJurisdiction
                          ? jurisdictionPath(
                              selectedJurisdiction.stateSlug,
                              selectedJurisdiction.jurisdictionSlug,
                            )
                          : "#"
                      }
                    >
                      {jurisdictionLabel} permit fees and official sources
                    </Link>
                    {rules.lastVerifiedAt ? (
                      <span className="muted"> · Last verified {rules.lastVerifiedAt}</span>
                    ) : null}
                  </p>
                </div>
              ) : null}

              {/* Explore this jurisdiction — real URLs, built by the site's own helpers */}
              {selectedJurisdiction ? (
                <div>
                  <h3 className="step__title" style={{ marginBottom: "0.5rem" }}>
                    Explore this jurisdiction
                  </h3>
                  <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "0.375rem" }}>
                    <li>
                      <Link
                        className="link-quiet"
                        href={jurisdictionPath(selectedJurisdiction.stateSlug, selectedJurisdiction.jurisdictionSlug)}
                      >
                        {jurisdictionName} permit fees
                      </Link>
                    </li>
                    {selectedPermit ? (
                      <li>
                        <Link
                          className="link-quiet"
                          href={permitPagePath(
                            selectedJurisdiction.stateSlug,
                            selectedJurisdiction.jurisdictionSlug,
                            selectedPermit.pageSlug,
                          )}
                        >
                          {selectedPermit.title ?? `${selectedPermit.permitTypeName} cost in ${jurisdictionName}`}
                        </Link>
                      </li>
                    ) : null}
                    <li>
                      <Link className="link-quiet" href={statePath(selectedJurisdiction.stateSlug)}>
                        {stateName} permit fees
                      </Link>
                    </li>
                  </ul>
                </div>
              ) : null}
            </div>
          ) : hasSelection && rules.status === "ready" ? (
            <p className="muted" style={{ fontSize: "0.875rem" }}>
              Enter the project details above and calculate to see the estimated fee, the full
              breakdown, and the rules used.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
