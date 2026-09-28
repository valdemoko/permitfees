/**
 * Public surface of the calculation engine.
 *
 * Consumers should import from here rather than reaching into individual files,
 * so the internal layout can change without touching routes or components.
 */

export {
  calculatePermitFees,
  buildFacts,
  describeApplicability,
  describeCalculationInput,
  describeConditionForReader,
  describeFeeRule,
} from "./engine";
export {
  BASIS_LABELS,
  COMPONENT_TYPE_LABELS,
  PER_UNIT_LABELS,
} from "./engine";
export {
  describeCondition,
  evaluateCondition,
  validateCondition,
} from "./conditions";
export { validateFeeRule, type FeeRuleValidation } from "./schemas";
export { CalculationError, type CalculationErrorCode } from "./errors";
export {
  applyCentsPerThousand,
  applyMinMax,
  applyRateBps,
  dollarsToCents,
  PER_THOUSAND_DENOMINATOR,
  roundHalfUpCents,
  roundUpToIncrement,
} from "./money";
export type {
  CalculationComponent,
  CalculationFacts,
  CalculationInput,
  CalculationResult,
  CalculationStep,
  ExcludedRule,
  ExclusionReason,
  FactValue,
  FeeBasis,
  FeeComponentType,
  FeeCondition,
  FeeRuleConfig,
  FeeRuleRecord,
  FeeRuleStatus,
  FeeType,
  ExactRate,
  FlatFeeConfig,
  FloorTable,
  FloorTableEntry,
  OccupancyClass,
  PercentFeeConfig,
  PerThousandFeeConfig,
  PerUnitFeeConfig,
  RateTable,
  RateTableEntry,
  TieredMarginalConfig,
  TieredTableConfig,
  ValidatedFeeRule,
  WorkType,
} from "./types";
export {
  BASIS_FACT_KEYS,
  COMPARISON_OPERATORS,
  FEE_BASES,
  FEE_COMPONENT_TYPES,
  FEE_RULE_STATUSES,
  FEE_TYPES,
  OCCUPANCY_CLASSES,
  PER_UNIT_KINDS,
  WORK_TYPES,
} from "./types";
