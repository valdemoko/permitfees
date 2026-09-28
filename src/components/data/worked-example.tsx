import { CalculationBreakdown } from "@/components/data/calculation-breakdown";
import { EditorialText } from "@/components/ui/editorial-text";
import { DataTable, Td, Th, Tr } from "@/components/ui/table";
import { describeCalculationInput, type CalculationResult } from "@/lib/calc";
import type { WorkedExample } from "@/lib/content/types";

/**
 * A worked example, computed rather than transcribed.
 *
 * The panel shows three things in order: what was assumed, what the fee schedule
 * produces from it, and what that does not cover. The second part is the engine's
 * own output — inputs listed, formula shown, working expandable, and a named
 * reason for every rule that was considered and left out.
 *
 * Nothing here is stored. The reader is looking at a calculation performed from
 * the rules as they read from the database on this request, which is why there is
 * no way for a published amount to drift away from the schedule behind it.
 *
 * Server component: no client JavaScript, so the numbers are in the HTML a
 * crawler receives.
 */
export function WorkedExamplePanel({
  example,
  result,
}: {
  example: WorkedExample;
  result: CalculationResult;
}) {
  const inputs = describeCalculationInput(example.inputs);

  return (
    <div className="panel">
      <div className="panel__header">
        <p className="panel__title">Worked example</p>
      </div>

      <div className="panel__body grid-stack">
        <EditorialText text={example.scenario} />

        {/*
          `grid-stack` rather than an inline grid: see the note on `.grid-stack` in
          globals.css. Without a constrained track, the components table below
          (nowrap formulas, ~1000px of max-content) stretched this column and drew
          the inputs table and the total panel past the panel's own border.
        */}
        <div className="grid-stack grid-stack--loose">
          <DataTable caption="Inputs used for this example">
            <thead>
              <tr>
                <Th>Input</Th>
                <Th align="right">Value</Th>
              </tr>
            </thead>
            <tbody>
              {inputs.map((row) => (
                <Tr key={row.label}>
                  <Td muted>{row.label}</Td>
                  <Td align="right" numeric>
                    {row.value}
                  </Td>
                </Tr>
              ))}
            </tbody>
          </DataTable>

          <CalculationBreakdown result={result} totalLabel="Example total" />
        </div>

        {example.notes ? (
          <div style={{ maxWidth: "68ch", color: "var(--color-ink-500)", fontSize: "0.875rem" }}>
            <EditorialText text={example.notes} className="editorial--compact" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
