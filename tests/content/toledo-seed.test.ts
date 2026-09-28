import { describe, expect, it } from "vitest";

import { toledoSeed } from "@/content/toledo";
import { calculatePermitFees, validateFeeRule } from "@/lib/calc";
import type { CalculationInput } from "@/lib/calc/types";
import { MIN_INTRO_LENGTH, MIN_LOCAL_SUMMARY_LENGTH, evaluatePublishability } from "@/lib/editorial";

/**
 * Toledo, Ohio — the data, and the arithmetic Chapter 1307 and the City's own
 * worked example print.
 *
 * The checks that matter, in the order they would catch a real error:
 *
 *  1. **The City's worked example reproduces to the cent.** $1,414.00 on a 5,000 sq ft
 *     commercial alteration — permit $1,075, plan review $225, surcharge $39, certificate
 *     $75 — with the surcharge base being plan review + permit and the certificate
 *     outside it, exactly as the table orders its lines.
 *  2. **The website's swapped rate prose charges nothing.** The code's pairing ($.03
 *     plan review, $.20 permit) is what computes; the floor assertions double as proof
 *     the rates are attached to the right lines.
 *  3. **The demolition bands meet from both sides** — the flat $100 band at 50,000 cu ft
 *     and the volume band's $253 at 50,001, the schedule's own seam jump, read on whole
 *     volume as the amount line states.
 *  4. **The surcharge pair is strict and the amperage is billed once**: class missing
 *     means no surcharge, and the service row stands down when a temp-pole, release or
 *     mobile-home row carries its own $0.50-per-amp component.
 *  5. **Plumbing's "each additional fixture" differs from commercial's "each fixture"**,
 *     and the $75 permit floor is asserted from both sides.
 */

const asOf = "2026-09-25";

function rulesFor(permitTypeKey: string) {
  return toledoSeed.feeRules
    .filter((entry) => entry.permitTypeKey === permitTypeKey)
    .map((entry) => entry.rule);
}

function calculate(permitTypeKey: string, input: Omit<CalculationInput, "asOf">) {
  return calculatePermitFees({ ...input, asOf }, rulesFor(permitTypeKey));
}

function totalFor(permitTypeKey: string, input: Omit<CalculationInput, "asOf">): number {
  return calculate(permitTypeKey, input).totalCents;
}

function amountFor(
  permitTypeKey: string,
  input: Omit<CalculationInput, "asOf">,
  code: string,
): number | undefined {
  return calculate(permitTypeKey, input).components.find((component) => component.code === code)
    ?.amountCents;
}

function codesFor(permitTypeKey: string, input: Omit<CalculationInput, "asOf">): string[] {
  return calculate(permitTypeKey, input).components.map((component) => component.code);
}

describe("Toledo seed payload", () => {
  it("identifies the jurisdiction, its state and its county", () => {
    expect(toledoSeed.state).toMatchObject({ code: "OH", slug: "ohio", fipsCode: "39" });
    expect(toledoSeed.county).toMatchObject({ key: "lucas-county", fipsCode: "39095" });
    expect(toledoSeed.jurisdiction).toMatchObject({
      key: "toledo",
      slug: "toledo",
      officialName: "City of Toledo",
      countyKey: "lucas-county",
      timezone: "America/New_York",
      isActive: true,
      permitPortalUrl: "https://applyforpermits.toledo.oh.gov/portal",
    });
  });

  it("shares the Ohio state row rather than defining its own permit types", () => {
    expect(toledoSeed.state.code).toBe("OH");
    expect(toledoSeed.permitTypes).toEqual([]);
  });

  it("cites only sources it can reference, and every rule validates", () => {
    const sourceKeys = new Set(toledoSeed.sources.map((source) => source.key));
    const scheduleKeys = new Set(toledoSeed.feeSchedules.map((schedule) => schedule.key));

    expect(sourceKeys.size).toBe(4);
    expect(scheduleKeys.size).toBe(2);
    expect(toledoSeed.sources.filter((source) => source.isPrimary)).toHaveLength(3);

    for (const entry of toledoSeed.feeRules) {
      expect(scheduleKeys.has(entry.scheduleKey), `unknown schedule ${entry.scheduleKey}`).toBe(
        true,
      );
      if (entry.rule.sourceId !== null) {
        expect(sourceKeys.has(entry.rule.sourceId), `unknown source ${entry.rule.sourceId}`).toBe(
          true,
        );
      }
      const validation = validateFeeRule(entry.rule);
      expect(
        validation.ok,
        `${entry.rule.code}: ${validation.ok ? "" : validation.error}`,
      ).toBe(true);
    }

    const ids = toledoSeed.feeRules.map((entry) => entry.rule.id);
    expect(new Set(ids).size, "rule ids are the primary key").toBe(ids.length);
  });

  it("publishes three pages that clear the editorial gate", () => {
    expect(toledoSeed.permitPages).toHaveLength(3);
    expect(
      toledoSeed.permitPages.map((page) => page.slug).sort(),
    ).toEqual(["building-permit-cost", "electrical-permit-cost", "plumbing-permit-cost"]);

    for (const page of toledoSeed.permitPages) {
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
        sourceCount: toledoSeed.sources.length,
        feeRuleCount: rulesFor(page.permitTypeKey).length,
        lastVerifiedAt: page.lastReviewedAt,
        faqCount: page.faqs?.length ?? 0,
        asOf,
      });

      expect(gate.failures, `${page.slug}: ${gate.failures.join("; ")}`).toEqual([]);
      expect(gate.indexable).toBe(true);
    }
  });

  it("verifies every permit page in the ledger, where the route reads its date from", () => {
    for (const page of toledoSeed.permitPages) {
      const record = toledoSeed.verifications.find(
        (entry) => entry.entityType === "permit_page" && entry.entityKey === page.slug,
      );
      expect(record, page.slug).toBeDefined();
      expect(record?.permitTypeKey, page.slug).toBe(page.permitTypeKey);
      expect(record?.status, page.slug).toBe("verified");
      expect(record?.verifiedAt, page.slug).toBe(page.lastReviewedAt);
    }
  });
});

describe("Toledo building permits — the City's own example, line for line", () => {
  it("reproduces the alteration page's worked table at $1,414.00", () => {
    const inputs = {
      squareFootage: 5_000,
      occupancy: "commercial",
      workType: "alteration",
      custom: {
        one_two_family: false,
        plan_review: true,
        certificate_of_occupancy: true,
      },
    } as const;

    expect(amountFor("building", inputs, "BLD-COMM-BASE")).toBe(107_500); // $75 + 5,000 × $0.20
    expect(amountFor("building", inputs, "BLD-PLAN-OBC")).toBe(22_500); // $75 + 5,000 × $0.03
    expect(amountFor("building", inputs, "BLD-STATE-SURCHARGE-3PCT")).toBe(3_900); // 3% × $1,300
    expect(amountFor("building", inputs, "BLD-CO")).toBe(7_500);
    expect(totalFor("building", inputs)).toBe(141_400); // $1,414.00
  });

  it("keeps the certificate outside the surcharge base — the table lists it after", () => {
    // If the $75 certificate were inside the base, the surcharge would be 3% of
    // $1,375 = $41.25. The City's table prints $39.
    expect(
      amountFor(
        "building",
        {
          squareFootage: 5_000,
          occupancy: "commercial",
          workType: "alteration",
          custom: { one_two_family: false, plan_review: true, certificate_of_occupancy: true },
        },
        "BLD-STATE-SURCHARGE-3PCT",
      ),
    ).toBe(3_900);
    // …and a permit with no plan review still sur-charges what exists.
    expect(
      amountFor(
        "building",
        {
          squareFootage: 5_000,
          occupancy: "commercial",
          workType: "alteration",
          custom: { one_two_family: false, certificate_of_occupancy: true },
        },
        "BLD-STATE-SURCHARGE-3PCT",
      ),
    ).toBe(3_225); // 3% × $1,075
  });

  it("holds both 100-square-foot floors and releases above them", () => {
    // $60 + $0.20 × 50 = $70 computes under the $80 floor; $0.20 × 150 clears it.
    expect(
      amountFor(
        "building",
        {
          squareFootage: 50,
          occupancy: "residential",
          workType: "alteration",
          custom: { one_two_family: true },
        },
        "BLD-RES-BASE",
      ),
    ).toBe(8_000);
    expect(
      amountFor(
        "building",
        {
          squareFootage: 150,
          occupancy: "residential",
          workType: "alteration",
          custom: { one_two_family: true },
        },
        "BLD-RES-BASE",
      ),
    ).toBe(9_000); // $60 + 150 × $0.20

    // Commercial: $75 + $0.20 × 60 = $87 under the $95 floor; 200 sq ft clears it.
    expect(
      amountFor(
        "building",
        {
          squareFootage: 60,
          occupancy: "commercial",
          workType: "alteration",
          custom: { one_two_family: false },
        },
        "BLD-COMM-BASE",
      ),
    ).toBe(9_500);
    expect(
      amountFor(
        "building",
        {
          squareFootage: 200,
          occupancy: "commercial",
          workType: "alteration",
          custom: { one_two_family: false },
        },
        "BLD-COMM-BASE",
      ),
    ).toBe(11_500); // $75 + 200 × $0.20
  });

  it("holds both plan-review floors — and attaches each rate to the code's line", () => {
    // The website prose swaps these two rates. The floors are the proof the code's
    // pairing is what computes: residential plan review is $50 + $0.03/sq ft.
    expect(
      amountFor(
        "building",
        {
          squareFootage: 50,
          occupancy: "residential",
          workType: "alteration",
          custom: { one_two_family: true, plan_review: true },
        },
        "BLD-PLAN-RES",
      ),
    ).toBe(5_300); // $50 + $0.03 × 50 = $51.50 → floor $53.00
    expect(
      amountFor(
        "building",
        {
          squareFootage: 5_000,
          occupancy: "residential",
          workType: "alteration",
          custom: { one_two_family: true, plan_review: true },
        },
        "BLD-PLAN-RES",
      ),
    ).toBe(20_000); // $50 + 5,000 × $0.03 = $200 — far above the floor
    expect(
      amountFor(
        "building",
        {
          squareFootage: 5_000,
          occupancy: "commercial",
          workType: "alteration",
          custom: { one_two_family: false, plan_review: true },
        },
        "BLD-PLAN-OBC",
      ),
    ).toBe(22_500); // $75 + 5,000 × $0.03 — the $.03 line, not $.20
  });

  it("splits the exterior non-structural row away from the area formula", () => {
    const residentialExterior = {
      occupancy: "residential",
      workType: "alteration",
      custom: { one_two_family: true, non_structural_exterior: true },
    } as const;
    expect(amountFor("building", residentialExterior, "BLD-RES-EXTERIOR")).toBe(6_000);
    expect(amountFor("building", residentialExterior, "BLD-RES-BASE")).toBeUndefined();

    // The commercial $95 comes from the application form — the chapter prints no
    // commercial exterior row, so the rule cites the form as its source.
    const commercialExterior = { ...residentialExterior, custom: { one_two_family: false, non_structural_exterior: true } } as const;
    expect(amountFor("building", commercialExterior, "BLD-COMM-EXTERIOR")).toBe(9_500);
    expect(amountFor("building", commercialExterior, "BLD-COMM-BASE")).toBeUndefined();
    const rule = toledoSeed.feeRules.find((entry) => entry.rule.code === "BLD-COMM-EXTERIOR")?.rule;
    expect(rule?.sourceId).toBe("toledo-building-permit-application");
  });

  it("bands demolition on cubic feet, seam from both sides", () => {
    const demo = (cubicFeet: number) =>
      amountFor(
        "building",
        {
          occupancy: "commercial",
          workType: "demolition",
          custom: { one_two_family: false, cubic_footage: cubicFeet },
        },
        cubicFeet <= 6_000
          ? "BLD-DEMO-SMALL"
          : cubicFeet <= 50_000
            ? "BLD-DEMO-MID"
            : "BLD-DEMO-LARGE",
      );

    expect(demo(6_000)).toBe(7_500); // "not exceeding 6,000"
    expect(demo(6_001)).toBe(10_000); // the flat middle band
    expect(demo(50_000)).toBe(10_000); // "6,000 to 50,000" closes at the top
    expect(demo(50_001)).toBe(25_300); // $100 + 51 × $3 — the schedule's own jump
    expect(demo(60_000)).toBe(28_000); // $100 + 60 × $3, whole volume

    // Each band answers alone: no input fires two of them.
    for (const volume of [1_000, 6_001, 50_001]) {
      const codes = codesFor("building", {
        occupancy: "commercial",
        workType: "demolition",
        custom: { one_two_family: false, cubic_footage: volume },
      }).filter((code) => code.startsWith("BLD-DEMO"));
      expect(codes, `volume ${volume}`).toHaveLength(1);
    }
  });

  it("sur-charges strictly by class: 1% residential, 3% commercial, nothing missing", () => {
    const res = {
      squareFootage: 1_200,
      occupancy: "residential",
      workType: "alteration",
      custom: { one_two_family: true },
    } as const;
    expect(amountFor("building", res, "BLD-STATE-SURCHARGE-1PCT")).toBe(300); // 1% × $300

    const comm = { ...res, custom: { one_two_family: false } } as const;
    expect(amountFor("building", comm, "BLD-STATE-SURCHARGE-3PCT")).toBe(945); // 3% × $315

    // Class missing means no surcharge — both leaves compare false on an absent fact.
    const unknown = { ...res, custom: {} } as const;
    expect(codesFor("building", unknown).some((code) => code.includes("STATE-SURCHARGE"))).toBe(false);
  });

  it("prices the flat permits and the certificate lines by their own facts", () => {
    const base = {
      squareFootage: 1_000,
      units: 1,
      occupancy: "commercial",
      workType: "alteration",
      custom: { one_two_family: false },
    } as const;

    const rows: Array<[string, number]> = [
      ["BLD-ZONING-APPEAL", 20_000],
      ["BLD-CO", 7_500],
      ["BLD-CZC", 5_000],
      ["BLD-PARKING", 7_500],
      ["BLD-FLOOD-ACK", 5_000],
      ["BLD-FESTIVAL", 7_500],
      ["BLD-TANKS", 7_500],
    ];

    for (const [code, amount] of rows) {
      const fact = factKeyFor(code);
      expect(
        amountFor("building", { ...base, custom: { ...base.custom, [fact]: true } }, code),
        code,
      ).toBe(amount);
      // …and unanswered when its fact is absent.
      expect(amountFor("building", base, code), `${code} absent`).toBeUndefined();
    }

    // Floodplain splits by class; the certificate lines sit outside the surcharge base.
    expect(
      amountFor(
        "building",
        { ...base, custom: { ...base.custom, floodplain: true } },
        "BLD-FLOOD-OTHER",
      ),
    ).toBe(10_000);
    expect(
      amountFor(
        "building",
        { ...base, squareFootage: 500, custom: { one_two_family: false, floodplain: true } },
        "BLD-FLOOD-RES",
      ),
    ).toBeUndefined();
    expect(
      amountFor(
        "building",
        { ...base, custom: { ...base.custom, manufactured_home: true } },
        "BLD-MANUFACTURED",
      ),
    ).toBe(25_000);
  });

  it("prices the ESPP at half a percent of valuation, $100 minimum, alterations only", () => {
    const espp = (valuationCents: number) =>
      amountFor(
        "building",
        {
          valuationCents,
          occupancy: "commercial",
          workType: "alteration",
          custom: { one_two_family: false, early_start: true },
        },
        "BLD-ESPP",
      );

    expect(espp(1_000_000)).toBe(10_000); // 0.5% of $10,000 = $50 → the $100 floor
    expect(espp(40_000_000)).toBe(200_000); // 0.5% of $400,000 = $2,000

    // Not an interior alteration: the chapter's eligibility gate does not answer.
    expect(
      amountFor(
        "building",
        {
          valuationCents: 40_000_000,
          occupancy: "commercial",
          workType: "new_construction",
          custom: { one_two_family: false, early_start: true },
        },
        "BLD-ESPP",
      ),
    ).toBeUndefined();
  });
});

/** The row's own boolean fact, for the flat-permit loop. */
function factKeyFor(code: string): string {
  const map: Record<string, string> = {
    "BLD-ZONING-APPEAL": "zoning_appeal",
    "BLD-CO": "certificate_of_occupancy",
    "BLD-CZC": "czc",
    "BLD-PARKING": "parking_lot",
    "BLD-FLOOD-ACK": "floodplain_ack",
    "BLD-FESTIVAL": "festival",
    "BLD-TANKS": "in_ground_tank",
  };
  const fact = map[code];
  if (fact === undefined) throw new Error(`no fact mapped for ${code}`);
  return fact;
}

describe("Toledo electrical permits — per-unit bases, amperage billed once", () => {
  it("reproduces the commercial new-construction computation", () => {
    const inputs = {
      units: 1,
      occupancy: "commercial",
      workType: "new_construction",
      custom: { one_two_family: false, amperage: 400 },
    } as const;

    expect(amountFor("electrical", inputs, "ELEC-COMM-BASE")).toBe(10_000);
    expect(amountFor("electrical", inputs, "ELEC-SERVICE-AMPS")).toBe(20_000); // 400 × $0.50
    expect(amountFor("electrical", inputs, "ELEC-MIN")).toBe(0); // $300 clears $75
    expect(amountFor("electrical", inputs, "ELEC-STATE-SURCHARGE-3PCT")).toBe(900);
    expect(totalFor("electrical", inputs)).toBe(30_900);
  });

  it("bills the amperage exactly once when a self-service row is selected", () => {
    const tempPole = {
      units: 1,
      occupancy: "commercial",
      workType: "new_construction",
      custom: { one_two_family: false, amperage: 400, temp_pole: true },
    } as const;

    expect(amountFor("electrical", tempPole, "ELEC-TEMP-POLE-COMM")).toBe(7_500);
    expect(amountFor("electrical", tempPole, "ELEC-TEMP-POLE-AMPS")).toBe(20_000); // its own $0.50/amp
    expect(amountFor("electrical", tempPole, "ELEC-SERVICE-AMPS")).toBeUndefined(); // stands down

    const release = { ...tempPole, custom: { one_two_family: false, amperage: 400, service_release: true } } as const;
    expect(amountFor("electrical", release, "ELEC-RELEASE-COMM")).toBe(7_500);
    expect(amountFor("electrical", release, "ELEC-RELEASE-AMPS")).toBe(20_000);
    expect(amountFor("electrical", release, "ELEC-SERVICE-AMPS")).toBeUndefined();

    // …and with neither selected, the service row answers on its own.
    const serviceOnly = { ...tempPole, custom: { one_two_family: false, amperage: 400 } } as const;
    expect(amountFor("electrical", serviceOnly, "ELEC-SERVICE-AMPS")).toBe(20_000);
  });

  it("prices the residential bases per unit, split by new against existing", () => {
    const residential = (workType: "new_construction" | "alteration", units: number) =>
      totalFor("electrical", {
        units,
        occupancy: "residential",
        workType,
        custom: { one_two_family: true },
      });

    expect(residential("new_construction", 3)).toBe(27_000 + 270); // 3 × $90 + 1%
    expect(residential("alteration", 3)).toBe(18_000 + 180); // 3 × $60 + 1%

    // Commercial bases never answer residential inputs and vice versa.
    expect(
      codesFor("electrical", {
        units: 1,
        occupancy: "residential",
        workType: "new_construction",
        custom: { one_two_family: true },
      }),
    ).not.toContain("ELEC-COMM-BASE");
  });

  it("lifts an item-only permit to the $75 floor as the shortfall", () => {
    const circuitsOnly = {
      occupancy: "commercial",
      workType: "alteration",
      custom: { one_two_family: false, circuits: 4 },
    } as const;
    expect(amountFor("electrical", circuitsOnly, "ELEC-CIRCUITS")).toBe(800); // 4 × $2
    expect(amountFor("electrical", circuitsOnly, "ELEC-MIN")).toBe(6_700); // up to $75
    // The floor becomes the surcharge's base too: 3% of $75 is $2.25.
    expect(totalFor("electrical", circuitsOnly)).toBe(7_725);
  });

  it("prices pool bonding flat and leaves generators and motors to no rule", () => {
    const bonded = {
      occupancy: "residential",
      workType: "alteration",
      custom: { one_two_family: true, pool_bonding: true },
    } as const;
    expect(amountFor("electrical", bonded, "ELEC-POOL-BOND")).toBe(7_500);

    // No horsepower or kilowatt basis exists: the chapter's rows are quoted in the
    // descriptions and charged by nothing, and no rule claims those amounts.
    const codes = toledoSeed.feeRules
      .filter((entry) => entry.permitTypeKey === "electrical")
      .map((entry) => entry.rule.code);
    expect(codes.some((code) => code.includes("MOTOR") || code.includes("GENERATOR"))).toBe(false);
  });
});

describe("Toledo plumbing permits — \"each additional\" against \"each\"", () => {
  it("charges eight fixtures as $90 + 7 × $6 residential and $100 + 8 × $6 commercial", () => {
    const residential = {
      fixtures: 8,
      occupancy: "residential",
      workType: "new_construction",
      custom: { one_two_family: true },
    } as const;
    expect(amountFor("plumbing", residential, "PLUMB-RES-NEW-BASE")).toBe(9_000);
    expect(amountFor("plumbing", residential, "PLUMB-RES-NEW-EXTRA")).toBe(4_200); // 7 × $6
    expect(amountFor("plumbing", residential, "PLUMB-STATE-SURCHARGE-1PCT")).toBe(132);

    const commercial = { ...residential, custom: { one_two_family: false } } as const;
    expect(amountFor("plumbing", commercial, "PLUMB-COMM-BASE")).toBe(10_000);
    expect(amountFor("plumbing", commercial, "PLUMB-COMM-FIXTURES")).toBe(4_800); // 8 × $6, no allowance
    expect(amountFor("plumbing", commercial, "PLUMB-STATE-SURCHARGE-3PCT")).toBe(444); // 3% × $148
  });

  it("splits new from existing on the residential side only", () => {
    const existing = {
      fixtures: 1,
      occupancy: "residential",
      workType: "repair",
      custom: { one_two_family: true },
    } as const;
    expect(amountFor("plumbing", existing, "PLUMB-RES-EXIST-BASE")).toBe(6_500);
    expect(amountFor("plumbing", existing, "PLUMB-RES-NEW-BASE")).toBeUndefined();
    expect(amountFor("plumbing", existing, "PLUMB-MIN")).toBe(1_000); // $65 → $75 floor
    expect(totalFor("plumbing", existing)).toBe(7_575); // + 1% = $0.75
  });

  it("holds the $75 floor from both sides", () => {
    const under = {
      fixtures: 1,
      occupancy: "residential",
      workType: "repair",
      custom: { one_two_family: false, ...{} },
    } as const;
    // Commercial with one fixture: $100 + $6 clears the floor with nothing to add.
    expect(amountFor("plumbing", under, "PLUMB-MIN")).toBe(0);
    // $100 + $6, plus the commercial 3% of it.
    expect(totalFor("plumbing", under)).toBe(10_918);

    // Residential existing with no fixtures at all: $65 is short by $10.
    const short = {
      occupancy: "residential",
      workType: "repair",
      custom: { one_two_family: true },
    } as const;
    expect(amountFor("plumbing", short, "PLUMB-RES-EXIST-BASE")).toBe(6_500);
    expect(amountFor("plumbing", short, "PLUMB-MIN")).toBe(1_000);
  });

  it("prices the backflow surveys by category on the chapter's own periods", () => {
    const survey = (category: string) =>
      amountFor(
        "plumbing",
        {
          occupancy: "commercial",
          workType: "alteration",
          custom: { one_two_family: false, backflow_survey: true, backflow_category: category },
        },
        category === "I" ? "PLUMB-BACKFLOW-I" : "PLUMB-BACKFLOW-II",
      );

    expect(survey("I")).toBe(10_000); // annual fee
    expect(survey("II")).toBe(7_500); // fee for two years, not annualised

    // The survey flag alone answers nothing — the category decides the row.
    expect(
      amountFor(
        "plumbing",
        {
          occupancy: "commercial",
          workType: "alteration",
          custom: { one_two_family: false, backflow_survey: true },
        },
        "PLUMB-BACKFLOW-I",
      ),
    ).toBeUndefined();
    expect(
      amountFor(
        "plumbing",
        {
          occupancy: "commercial",
          workType: "alteration",
          custom: { one_two_family: false, backflow_survey: true },
        },
        "PLUMB-BACKFLOW-II",
      ),
    ).toBeUndefined();
  });

  it("prices nothing from a valuation — plumbing reads fixtures", () => {
    const cheap = {
      fixtures: 7,
      occupancy: "commercial",
      workType: "alteration",
      valuationCents: 1,
      custom: { one_two_family: false },
    } as const;
    const rich = { ...cheap, valuationCents: 900_000_000 } as const;
    expect(totalFor("plumbing", cheap)).toBe(totalFor("plumbing", rich));
  });
});

describe("Toledo's worked examples", () => {
  it("computes each page's own example from its own stored inputs", () => {
    const expected: Array<[string, string, number]> = [
      ["building-permit-cost", "building", 141_400], // $1,075 + $225 + $39 + $75
      ["electrical-permit-cost", "electrical", 30_900], // $100 + $200 + $9
      ["plumbing-permit-cost", "plumbing", 13_332], // $90 + 7 × $6 + 1% = $1.32
    ];

    for (const [slug, permitTypeKey, total] of expected) {
      const page = toledoSeed.permitPages.find((entry) => entry.slug === slug);
      expect(page?.workedExample, `${slug} has an example`).toBeDefined();

      const inputs = page?.workedExample?.inputs ?? {};
      expect(totalFor(permitTypeKey, inputs), slug).toBe(total);
    }
  });
});
