import { describe, expect, it } from "vitest";

import { saintPaulSeed } from "@/content/saintpaul";
import { calculatePermitFees, validateFeeRule } from "@/lib/calc";
import type { CalculationInput } from "@/lib/calc/types";
import { MIN_INTRO_LENGTH, MIN_LOCAL_SUMMARY_LENGTH, evaluatePublishability } from "@/lib/editorial";

/**
 * Saint Paul, Minnesota — the 103-row valuation table that is one arithmetic, the statutory
 * surcharge standing above it, the shortest plumbing table in the dataset, and the City's own
 * electrical tables.
 *
 * The checks that matter, in the order they would catch a real error:
 *
 *  1. **The table's rows are the arithmetic.** Every printed row from $501 to $100,000 is
 *     reproduced by four segments, and the three rows that are not printed correctly are
 *     asserted where they are: the two the sheet omits ($81,500 and $83,500) and the one it
 *     misprints ($85,500). A regression in any segment shows up as a mismatch against the
 *     schedule itself, which is parsed row by row in the research pass.
 *  2. **The open bands' printed bases step down, and the plan check reads the fee.** $1,522 at
 *     $100,000 and $1,507 at $100,001; a plan check gated off at $1,000 of valuation at 65% of
 *     the permit fee.
 *  3. **The surcharge is the statute's.** § 326B.148's bands reproduced at their seams
 *     ($500/$900/$1,500) with the schedule's own $0.50 floor, plus one-twentieth mill above
 *     $5,000,000.
 *  4. **Saint Paul prices electrical itself.** The City's tables, six scopes, two minimums
 *     ($85 and the fire alarm's $78), one count of devices that only one table may charge.
 *  5. **Plumbing is a base and four counts.** $92 always; $36, $6, $34 and $15 per block; no
 *     minimum row at all.
 */

const asOf = "2026-09-25";

function rulesFor(permitTypeKey: string) {
  return saintPaulSeed.feeRules
    .filter((entry) => entry.permitTypeKey === permitTypeKey)
    .map((entry) => entry.rule);
}

function totalFor(permitTypeKey: string, input: Omit<CalculationInput, "asOf">): number {
  return calculatePermitFees({ asOf, ...input }, rulesFor(permitTypeKey)).totalCents;
}

function codesFor(
  permitTypeKey: string,
  input: Omit<CalculationInput, "asOf">,
  prefix: string,
): string[] {
  return calculatePermitFees({ asOf, ...input }, rulesFor(permitTypeKey))
    .components.filter((component) => component.code.startsWith(prefix))
    .map((component) => component.code);
}

function componentFor(
  permitTypeKey: string,
  code: string,
  input: Omit<CalculationInput, "asOf">,
): number | undefined {
  return calculatePermitFees({ asOf, ...input }, rulesFor(permitTypeKey)).components.find(
    (component) => component.code === code,
  )?.amountCents;
}

describe("Saint Paul seed payload", () => {
  it("identifies the jurisdiction, its state and its county", () => {
    expect(saintPaulSeed.state).toMatchObject({
      code: "MN",
      slug: "minnesota",
      fipsCode: "27",
    });
    expect(saintPaulSeed.county).toMatchObject({
      key: "ramsey-county",
      name: "Ramsey County",
      fipsCode: "27123",
    });
    expect(saintPaulSeed.jurisdiction).toMatchObject({
      key: "saint-paul",
      slug: "saint-paul",
      officialName: "City of Saint Paul",
      countyKey: "ramsey-county",
      timezone: "America/Chicago",
      isActive: true,
    });
  });

  it("shares the Minnesota state row and the permit catalogue", () => {
    expect(saintPaulSeed.state.code).toBe("MN");
    expect(saintPaulSeed.permitTypes).toEqual([]);
    expect(saintPaulSeed.projectTypes).toEqual([]);
  });

  it("cites only sources it can reference, and every rule validates", () => {
    const sourceKeys = new Set(saintPaulSeed.sources.map((source) => source.key));
    const scheduleKeys = new Set(saintPaulSeed.feeSchedules.map((schedule) => schedule.key));

    for (const entry of saintPaulSeed.feeRules) {
      expect(scheduleKeys.has(entry.scheduleKey), `unknown schedule ${entry.scheduleKey}`).toBe(
        true,
      );
      if (entry.rule.sourceId !== null) {
        expect(sourceKeys.has(entry.rule.sourceId), `unknown source ${entry.rule.sourceId}`).toBe(
          true,
        );
      }
      const validation = validateFeeRule(entry.rule);
      expect(validation.ok, `${entry.rule.code}: ${validation.ok ? "" : validation.error}`).toBe(
        true,
      );
    }
  });

  it("publishes three pages that clear the editorial gate", () => {
    const published = saintPaulSeed.permitPages.filter(
      (page) => page.publishStatus === "published" && !page.noindex,
    );

    expect(saintPaulSeed.permitPages).toHaveLength(3);
    expect(published.map((page) => page.slug).sort()).toEqual([
      "building-permit-cost",
      "electrical-permit-cost",
      "plumbing-permit-cost",
    ]);

    for (const page of published) {
      expect(page.intro.length, `${page.slug} intro`).toBeGreaterThanOrEqual(MIN_INTRO_LENGTH);
      expect(page.localSummary.length, `${page.slug} localSummary`).toBeGreaterThanOrEqual(
        MIN_LOCAL_SUMMARY_LENGTH,
      );
      expect(page.faqs?.length ?? 0, `${page.slug} faqs`).toBeGreaterThanOrEqual(4);

      const gate = evaluatePublishability({
        publishStatus: page.publishStatus,
        noindex: page.noindex,
        intro: page.intro,
        localSummary: page.localSummary,
        sourceCount: saintPaulSeed.sources.length,
        feeRuleCount: rulesFor(page.permitTypeKey).length,
        lastVerifiedAt: page.lastReviewedAt,
        faqCount: page.faqs?.length ?? 0,
        asOf,
      });

      expect(gate.failures, `${page.slug}: ${gate.failures.join("; ")}`).toEqual([]);
      expect(gate.indexable).toBe(true);
    }
  });

  it("verifies every source, the schedule, the three pages and the profile on the research date", () => {
    const sourceVerifications = saintPaulSeed.verifications.filter(
      (verification) => verification.entityType === "source",
    );
    expect(sourceVerifications.map((verification) => verification.entityKey).sort()).toEqual(
      saintPaulSeed.sources.map((source) => source.key).sort(),
    );

    for (const verification of saintPaulSeed.verifications) {
      expect(verification.status, verification.entityKey).toBe("verified");
      expect(verification.verifiedAt, verification.entityKey).toBe("2026-09-25");
      expect(verification.verifiedBy, verification.entityKey).toContain("Minnesota");
    }
  });

  it("dates the building schedule to its own stamp and the trade tables to the platform launch", () => {
    const building = rulesFor("building")[0];
    const electrical = rulesFor("electrical")[0];
    const plumbing = rulesFor("plumbing")[0];

    expect(building?.effectiveFrom).toBe("2023-02-25");
    expect(electrical?.effectiveFrom).toBe("2025-09-17");
    expect(plumbing?.effectiveFrom).toBe("2025-09-17");
  });
});

describe("Saint Paul building permits", () => {
  it("reproduces the printed table's rows with four segments", () => {
    // Band 1: $36 at $500, then $5 per $100 — the table's own rows 41, 46, 51 and 111.
    expect(componentFor("building", "BLD-BAND-1", { valuationCents: 50_000 })).toBe(3_600);
    expect(componentFor("building", "BLD-BAND-1", { valuationCents: 60_000 })).toBe(4_100);
    expect(componentFor("building", "BLD-BAND-1", { valuationCents: 70_000 })).toBe(4_600);
    expect(componentFor("building", "BLD-BAND-1", { valuationCents: 200_000 })).toBe(11_100);
    // A valuation inside a step buys the whole step: $501 is priced as $600.
    expect(componentFor("building", "BLD-BAND-1", { valuationCents: 50_100 })).toBe(4_100);
    // Band 2: $2,001 buys one whole $21 step over the $106 base — the table's "127".
    expect(componentFor("building", "BLD-BAND-2", { valuationCents: 200_100 })).toBe(12_700);
    expect(componentFor("building", "BLD-BAND-2", { valuationCents: 2_500_000 })).toBe(58_900);
    // Band 3: $25,001 is "606" and $38,000 is "786" in the printed table.
    expect(componentFor("building", "BLD-BAND-3", { valuationCents: 2_500_100 })).toBe(60_600);
    expect(componentFor("building", "BLD-BAND-3", { valuationCents: 3_800_000 })).toBe(78_600);
    expect(componentFor("building", "BLD-BAND-3", { valuationCents: 5_000_000 })).toBe(96_600);
    // Band 4: the top of the closed table is $1,522.
    expect(componentFor("building", "BLD-BAND-4", { valuationCents: 5_000_100 })).toBe(98_300);
    expect(componentFor("building", "BLD-BAND-4", { valuationCents: 10_000_000 })).toBe(152_200);
  });

  it("charges the arithmetic where the sheet drops or misprints a row", () => {
    // The sheet omits its $81,001–$82,000 row; the $11-per-$1,000 arithmetic gives $1,324.
    expect(componentFor("building", "BLD-BAND-4", { valuationCents: 8_100_000 })).toBe(131_300);
    expect(componentFor("building", "BLD-BAND-4", { valuationCents: 8_150_000 })).toBe(132_400);
    expect(componentFor("building", "BLD-BAND-4", { valuationCents: 8_200_000 })).toBe(132_400);
    // The sheet omits $83,001–$84,000 too: $1,335 then $1,346.
    expect(componentFor("building", "BLD-BAND-4", { valuationCents: 8_300_000 })).toBe(133_500);
    expect(componentFor("building", "BLD-BAND-4", { valuationCents: 8_350_000 })).toBe(134_600);
    // And it prints $1,369 for $85,001–$86,000 where every neighbouring row says $1,368.
    expect(componentFor("building", "BLD-BAND-4", { valuationCents: 8_550_000 })).toBe(136_800);
    expect(componentFor("building", "BLD-BAND-4", { valuationCents: 8_650_000 })).toBe(137_900);
  });

  it("charges the open bands' printed bases, including the step down at $100,000", () => {
    // The closed table reaches $1,522 at $100,000; the open band starts $23 lower.
    expect(componentFor("building", "BLD-BAND-5", { valuationCents: 10_000_100 })).toBe(150_700);
    expect(componentFor("building", "BLD-BAND-5", { valuationCents: 15_000_000 })).toBe(189_900);
    expect(componentFor("building", "BLD-BAND-5", { valuationCents: 50_000_000 })).toBe(469_900);
    expect(componentFor("building", "BLD-BAND-6", { valuationCents: 100_000_000 })).toBe(839_900);
    expect(componentFor("building", "BLD-BAND-6", { valuationCents: 50_000_100 })).toBe(489_900 + 700);
    expect(componentFor("building", "BLD-BAND-7", { valuationCents: 100_000_100 })).toBe(846_800);
    expect(componentFor("building", "BLD-BAND-7", { valuationCents: 200_000_000 })).toBe(1_346_300);
    // Exactly one band charges at a time, and none does without a valuation.
    expect(codesFor("building", { valuationCents: 15_000_000 }, "BLD-BAND")).toEqual([
      "BLD-BAND-5",
    ]);
    expect(codesFor("building", {}, "BLD-BAND")).toEqual([]);
  });

  it("gates the 65% plan check at $1,000 of valuation and reads the permit fee", () => {
    // $1,000 or less: no plan check at all.
    expect(componentFor("building", "BLD-PLAN-CHECK", { valuationCents: 100_000 })).toBeUndefined();
    // $1,001 is priced as $1,100 of work — the table's "$66" row — and 65% of that is $42.90.
    expect(componentFor("building", "BLD-BAND-1", { valuationCents: 100_100 })).toBe(6_600);
    expect(componentFor("building", "BLD-PLAN-CHECK", { valuationCents: 100_100 })).toBe(4_290);
    // At $150,000: 65% of the $1,899.00 permit fee, not of the job.
    expect(componentFor("building", "BLD-PLAN-CHECK", { valuationCents: 15_000_000 })).toBe(
      Math.round(189_900 * 0.65),
    );
    expect(componentFor("building", "BLD-PLAN-CHECK", { valuationCents: 15_000_000 })).toBe(
      123_435,
    );
  });

  it("charges the statutory surcharge at its band seams, with the sheet's $0.50 floor", () => {
    // One-half mill of the valuation, with the schedule's own $0.50 row as the floor.
    expect(componentFor("building", "MN-SURCHARGE", { valuationCents: 50_000 })).toBe(50);
    expect(componentFor("building", "MN-SURCHARGE", { valuationCents: 1_000_000 })).toBe(500);
    expect(componentFor("building", "MN-SURCHARGE", { valuationCents: 100_000_000 })).toBe(50_000);
    // § 326B.148's seams: $500 at $1,000,000, $900 at $2,000,000, $1,500 at $5,000,000.
    expect(componentFor("building", "MN-SURCHARGE", { valuationCents: 200_000_000 })).toBe(90_000);
    expect(componentFor("building", "MN-SURCHARGE", { valuationCents: 300_000_000 })).toBe(
      120_000,
    );
    expect(componentFor("building", "MN-SURCHARGE", { valuationCents: 400_000_000 })).toBe(
      140_000,
    );
    expect(componentFor("building", "MN-SURCHARGE", { valuationCents: 500_000_000 })).toBe(
      150_000,
    );
    // Above $5,000,000 the statute adds one-twentieth mill on the excess — $50 per $1,000,000 —
    // and the banded rule stops at $1,500 rather than charging a base of its own twice.
    expect(componentFor("building", "MN-SURCHARGE", { valuationCents: 600_000_000 })).toBe(150_000);
    expect(componentFor("building", "MN-SURCHARGE-OVER-5M", { valuationCents: 600_000_000 })).toBe(
      5_000,
    );
    expect(
      componentFor("building", "MN-SURCHARGE-OVER-5M", { valuationCents: 500_000_000 }),
    ).toBeUndefined();
  });

  it("totals a worked example the way the schedule's three components stack", () => {
    // $150,000 of work: $1,899.00 of permit fee, $1,234.35 of plan check, $75.00 of surcharge.
    expect(totalFor("building", { valuationCents: 15_000_000 })).toBe(320_835);
    // $500 of work: the $36.00 row, no plan check, and the surcharge's $0.50 floor.
    expect(totalFor("building", { valuationCents: 50_000 })).toBe(3_650);
    expect(codesFor("building", { valuationCents: 50_000 }, "BLD-")).toEqual(["BLD-BAND-1"]);
  });
});

describe("Saint Paul plumbing permits", () => {
  it("charges the $92 initial permit fee on every permit, with no minimum row", () => {
    expect(componentFor("plumbing", "PLUMB-BASE", {})).toBe(9_200);
    // The table prints no minimum, so an empty application is the base plus the flat surcharge.
    expect(totalFor("plumbing", {})).toBe(9_300);
    expect(codesFor("plumbing", {}, "PLUMB-")).toEqual(["PLUMB-BASE"]);
  });

  it("prices the three unit counts separately and the BTU blocks above the first", () => {
    expect(componentFor("plumbing", "PLUMB-UNIT", { fixtures: 2 })).toBe(7_200);
    expect(componentFor("plumbing", "PLUMB-WATER-UNIT", { custom: { water_units: 1 } })).toBe(600);
    expect(componentFor("plumbing", "PLUMB-GAS-UNIT", { custom: { gas_units: 1 } })).toBe(3_400);
    // BTU: the first 100,000 is included, each block above it is $15 — three blocks, two charges.
    expect(componentFor("plumbing", "PLUMB-BTU", { custom: { btu_blocks: 1 } })).toBe(0);
    expect(componentFor("plumbing", "PLUMB-BTU", { custom: { btu_blocks: 2 } })).toBe(1_500);
    expect(componentFor("plumbing", "PLUMB-BTU", { custom: { btu_blocks: 3 } })).toBe(3_000);
  });

  it("totals a permit the way the table reads down", () => {
    // $92.00 + 2 × $36.00 + $34.00 + $1.00 = $199.00.
    expect(totalFor("plumbing", { fixtures: 2, custom: { gas_units: 1 } })).toBe(19_900);
    // One water unit on its own: $92.00 + $6.00 + $1.00 = $99.00.
    expect(totalFor("plumbing", { custom: { water_units: 1 } })).toBe(9_900);
    // A 250,000 BTU boiler adds two chargeable blocks: $92 + $30 + $1.
    expect(totalFor("plumbing", { custom: { btu_blocks: 3 } })).toBe(12_300);
  });
});

describe("Saint Paul electrical permits", () => {
  it("prices services and circuits, with the $85 minimum charging the shortfall", () => {
    expect(
      componentFor("electrical", "ELEC-SERVICE", {
        custom: { electrical_scope: "service_circuit", electrical_services: 1 },
      }),
    ).toBe(8_500);
    expect(
      componentFor("electrical", "ELEC-CIRCUIT", {
        custom: { electrical_scope: "service_circuit", circuits: 4 },
      }),
    ).toBe(6_000);
    // A service and four circuits clear the floor and pay their own arithmetic.
    expect(
      totalFor("electrical", {
        custom: { electrical_scope: "service_circuit", electrical_services: 1, circuits: 4 },
      }),
    ).toBe(14_600);
    // One circuit alone computes $15.00 and pays the $85.00 minimum: $70.00 of shortfall.
    expect(
      componentFor("electrical", "ELEC-MINIMUM", {
        custom: { electrical_scope: "service_circuit", circuits: 1 },
      }),
    ).toBe(7_000);
    expect(
      totalFor("electrical", { custom: { electrical_scope: "service_circuit", circuits: 1 } }),
    ).toBe(8_600);
  });

  it("charges nothing without a scope: the tables are selected, not stacked", () => {
    // The counts are present but no scope is stated, so no table is selected.
    expect(totalFor("electrical", { custom: { circuits: 4 } })).toBe(0);
    expect(codesFor("electrical", { custom: { circuits: 4 } }, "ELEC-")).toEqual([]);
  });

  it("prices the appliance table per unit, and only under its own scope", () => {
    const scope = { electrical_scope: "ac_furnace_boiler" };
    expect(componentFor("electrical", "ELEC-AC-UNIT", { custom: { ...scope, ac_units: 1 } })).toBe(
      1_500,
    );
    expect(
      componentFor("electrical", "ELEC-FURNACE-UNIT", { custom: { ...scope, furnaces: 1 } }),
    ).toBe(1_500);
    expect(componentFor("electrical", "ELEC-BOILER-UNIT", { custom: { ...scope, heaters: 1 } })).toBe(
      1_500,
    );
    // An air conditioner and a furnace are two units: $30.00 computed, floored at $85.00.
    expect(
      totalFor("electrical", { custom: { ...scope, ac_units: 1, furnaces: 1 } }),
    ).toBe(8_600);
    // The appliance counts are not the services table's: no service, no circuit, nothing charges.
    expect(componentFor("electrical", "ELEC-SERVICE", { custom: { ...scope, ac_units: 1 } })).toBe(
      undefined,
    );
  });

  it("keeps fire alarm's $78 floor apart from the trade's $85", () => {
    const fireAlarm = { electrical_scope: "fire_alarm" };
    expect(
      componentFor("electrical", "ELEC-FIRE-ALARM-PANEL", { custom: { ...fireAlarm, panels: 1 } }),
    ).toBe(7_800);
    expect(
      componentFor("electrical", "ELEC-FIRE-ALARM-DEVICE", {
        custom: { ...fireAlarm, low_voltage_points: 5 },
      }),
    ).toBe(940);
    // Panel plus five devices is above its own floor and pays as computed.
    expect(
      totalFor("electrical", { custom: { ...fireAlarm, panels: 1, low_voltage_points: 5 } }),
    ).toBe(8_840);
    // Five devices with no panel fall to the fire alarm minimum, not the $85 one.
    expect(
      componentFor("electrical", "ELEC-FIRE-ALARM-MINIMUM", {
        custom: { ...fireAlarm, low_voltage_points: 5 },
      }),
    ).toBe(6_860);
    expect(componentFor("electrical", "ELEC-MINIMUM", { custom: fireAlarm })).toBeUndefined();
  });

  it("prices low voltage, power equipment and solar on their own tables", () => {
    // Low voltage: $85.00 for the panel and $2.00 a device.
    expect(
      componentFor("electrical", "ELEC-LV-PANEL", {
        custom: { electrical_scope: "low_voltage", panels: 1 },
      }),
    ).toBe(8_500);
    expect(
      componentFor("electrical", "ELEC-LV-DEVICE", {
        custom: { electrical_scope: "low_voltage", low_voltage_points: 5 },
      }),
    ).toBe(1_000);
    // The same device count under fire alarm is charged at $1.88, never at both rates.
    expect(
      codesFor(
        "electrical",
        { custom: { electrical_scope: "low_voltage", panels: 1, low_voltage_points: 5 } },
        "ELEC-",
      ).sort(),
    ).toEqual(["ELEC-LV-DEVICE", "ELEC-LV-PANEL", "ELEC-MINIMUM"]);
    // Power equipment: $54.00 a machine plus $1.00 a KVA.
    expect(
      componentFor("electrical", "ELEC-POWER-DEVICE", {
        custom: { electrical_scope: "power_equipment", power_devices: 2 },
      }),
    ).toBe(10_800);
    expect(
      componentFor("electrical", "ELEC-KVA", {
        custom: { electrical_scope: "power_equipment", kilovolt_amperes: 10 },
      }),
    ).toBe(1_000);
    // Solar by capacity: flat bands, then a base plus $3 a kW above 40.
    expect(
      componentFor("electrical", "ELEC-SOLAR-0-20", {
        custom: { electrical_scope: "solar_pv", kilowatts: 10 },
      }),
    ).toBe(13_800);
    expect(
      componentFor("electrical", "ELEC-SOLAR-21-40", {
        custom: { electrical_scope: "solar_pv", kilowatts: 30 },
      }),
    ).toBe(33_200);
    expect(
      componentFor("electrical", "ELEC-SOLAR-ABOVE-40", {
        custom: { electrical_scope: "solar_pv", kilowatts: 50 },
      }),
    ).toBe(31_500 + 10 * 300);
    // Solar prints no minimum, so a 10 kW system pays its band and nothing else.
    expect(codesFor("electrical", { custom: { electrical_scope: "solar_pv", kilowatts: 10 } }, "ELEC-")).toEqual(
      ["ELEC-SOLAR-0-20"],
    );
    expect(totalFor("electrical", { custom: { electrical_scope: "solar_pv", kilowatts: 10 } })).toBe(
      13_900,
    );
  });

  it("charges one-half mill of the permit fee for the surcharge, floored at $1.00", () => {
    // Every table's own row is "Minimum State Surcharge | $1.00": one-half mill or $1, greater.
    expect(
      componentFor("electrical", "MN-ELEC-SURCHARGE", {
        custom: { electrical_scope: "service_circuit", circuits: 1 },
      }),
    ).toBe(100);
    // Thirty services is $2,550.00 of permit fee; one-half mill of it is $1.275, rounded to
    // the cent — the floor no longer governs.
    expect(
      componentFor("electrical", "MN-ELEC-SURCHARGE", {
        custom: { electrical_scope: "service_circuit", electrical_services: 30 },
      }),
    ).toBe(128);
  });
});
