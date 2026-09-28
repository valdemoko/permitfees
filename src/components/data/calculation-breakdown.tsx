import { Callout } from "@/components/ui/callout";
import { DataTable, Td, Tfoot, Th, Tr } from "@/components/ui/table";
import { COMPONENT_TYPE_LABELS, type CalculationResult } from "@/lib/calc";
import { formatCents } from "@/lib/format";

/**
 * The calculation breakdown.
 *
 * The result is never shown as a bare number. It leads, at display size, and
 * every component underneath carries the rule that produced it and the
 * intermediate values, because a reader who can follow the arithmetic can also
 * check it — and because that transparency is the only honest way to present a
 * figure that may not match the permit office's own.
 *
 * Layout order is deliberate: the answer, then the money, then the evidence
 * (what was considered and left out), then the limits of the estimate.
 *
 * Everything is server-rendered: no client component, no JavaScript.
 */

export function CalculationBreakdown({
  result,
  /** What the jurisdiction's own document calls the total, when it names one. */
  totalLabel = "Estimated permit fee",
}: {
  result: CalculationResult;
  totalLabel?: string;
}) {
  const hasComponents = result.components.length > 0;

  /**
   * The rules that were left out, with identical outcomes collapsed.
   *
   * Houston prices a building permit with nine mutually exclusive brackets, so a
   * single valuation left eight of them applying nothing — and the list printed
   * the same sentence eight times, which reads as noise rather than as evidence.
   * Grouping keeps every exclusion accounted for and says how many share it.
   */
  const exclusions = [
    ...result.excluded
      .reduce((groups, rule) => {
        const key = `${rule.label}\u0000${rule.detail}`;
        const existing = groups.get(key);
        if (existing) existing.count += 1;
        else groups.set(key, { key, label: rule.label, detail: rule.detail, count: 1 });
        return groups;
      }, new Map<string, { key: string; label: string; detail: string; count: number }>())
      .values(),
  ];

  const considered = result.components.length + result.excluded.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      <div className="result">
        <p className="result__label">{totalLabel}</p>
        <p className="result__figure tnum">{formatCents(result.totalCents)}</p>
        <p className="result__note">
          An estimate, not an official fee. It is calculated from the published fee schedule as it
          applied on {result.asOf}. The permit office&rsquo;s own calculation is the one that
          applies, and your project may fall under rules this schedule does not describe.
        </p>
        <p className="result__stamp">
          <span>
            Fee schedule as of <b>{result.asOf}</b>
          </span>
          <span>
            Rules applied <b>{result.components.length}</b>
          </span>
          <span>
            Rules considered <b>{considered}</b>
          </span>
        </p>
      </div>

      {hasComponents ? (
        <DataTable caption="Fee components">
          <thead>
            <tr>
              <Th>Component</Th>
              <Th>How it is calculated</Th>
              <Th align="right">Amount</Th>
            </tr>
          </thead>
          <tbody>
            {result.components.map((component) => (
              <Tr key={component.ruleId}>
                <Td strong>
                  {component.label}
                  <span className="table__sub">{COMPONENT_TYPE_LABELS[component.componentType]}</span>
                  {component.description ? (
                    <span className="table__note">{component.description}</span>
                  ) : null}
                  {component.steps.length > 0 ? (
                    <details className="working">
                      <summary>Show the working</summary>
                      <dl className="working__grid">
                        {component.steps.map((step, index) => (
                          <div className="working__row" key={`${step.label}-${index}`}>
                            <dt className="working__label">{step.label}</dt>
                            <dd className="working__value">{step.value}</dd>
                          </div>
                        ))}
                      </dl>
                    </details>
                  ) : null}
                </Td>
                <Td>
                  <code className="formula">{component.formula}</code>
                </Td>
                <Td align="right" numeric>
                  {formatCents(component.amountCents)}
                </Td>
              </Tr>
            ))}
          </tbody>
          <Tfoot>
            <tr>
              <Td strong>Total</Td>
              <Td>&nbsp;</Td>
              <Td align="right" numeric strong>
                {formatCents(result.totalCents)}
              </Td>
            </tr>
          </Tfoot>
        </DataTable>
      ) : (
        <p className="empty">
          No fee component applies to the inputs given, so the total is{" "}
          {formatCents(result.totalCents)}. The list below shows every rule that was considered.
        </p>
      )}

      {result.excluded.length > 0 ? (
        <div>
          <div className="section-head">
            <h3>Fees that do not apply here</h3>
            <p>
              Listed so you can see what was considered and left out, rather than wondering whether
              something is missing. A rule can also be left out because it is not published for this
              permit at all, and that is stated where it matters.
            </p>
          </div>
          <ul className="exclusions">
            {exclusions.map((line) => (
              <li key={line.key}>
                <b>{line.label}</b> — {line.detail}
                {line.count > 1 ? <span> ({line.count} rules with the same outcome)</span> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {result.warnings.length > 0 ? (
        <Callout variant="warning" label="Limits of this estimate">
          <ul style={{ margin: 0, paddingLeft: "1.125rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            {result.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </Callout>
      ) : null}

      {result.assumptions.length > 0 ? (
        <div>
          <div className="section-head">
            <h3>Assumptions</h3>
          </div>
          <ul className="exclusions">
            {result.assumptions.map((assumption) => (
              <li key={assumption}>{assumption}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
