import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * SYNTHETIC fixtures.
 *
 * These rules exist only to validate the engine's arithmetic and control flow.
 * No number here describes a real jurisdiction, and nothing in this folder is
 * imported by the application. Real jurisdiction rules get their own fixtures
 * once a primary source has been captured, and those fixtures cite the document.
 */

let sequence = 0;

export function syntheticRule(overrides: Partial<FeeRuleRecord> = {}): FeeRuleRecord {
  sequence += 1;
  return {
    id: overrides.id ?? `synthetic-rule-${sequence}`,
    code: overrides.code ?? `SYN${sequence}`,
    label: overrides.label ?? `Synthetic component ${sequence}`,
    description: null,
    componentType: overrides.componentType ?? "base",
    feeType: overrides.feeType ?? "flat",
    config: overrides.config ?? { amountCents: 15000 },
    conditions: overrides.conditions ?? null,
    minimumCents: overrides.minimumCents ?? null,
    maximumCents: overrides.maximumCents ?? null,
    priority: overrides.priority ?? 10,
    effectiveFrom: overrides.effectiveFrom ?? "2026-01-01",
    effectiveTo: overrides.effectiveTo ?? null,
    status: overrides.status ?? "active",
    sourceId: overrides.sourceId ?? null,
  };
}

export const AS_OF = "2026-09-23";
