import { describe, expect, test } from "bun:test";
import {
  advanceGame,
  applyCommand,
  computeClassCount,
  createInitialState,
  deserializeGame,
  employeeClassCount,
  respondToInvestor,
  serializeGame,
} from "../src";
import type { GameContent } from "../src";

const content: GameContent = {
  id: "test",
  saveVersion: 1,
  title: "Test",
  subtitle: "Test",
  employeeClasses: [
    {
      id: "test-scientist",
      name: "Test Scientist",
      description: "Tests research",
      annualSalary: 52,
      baselineFlops: 10_000_000_000_000,
      researchPerWeek: 1,
    },
  ],
  computeClasses: [
    {
      id: "test-gpu",
      name: "Test GPU",
      description: "Tests compute",
      releaseYear: 2015,
      flopsPerUnit: 1_000_000_000_000,
      precisionLabel: "FP32",
      baseCost: 20,
      purchaseSize: 10,
    },
  ],
  departments: [],
  milestones: [{ id: "first", name: "First", description: "", intelligenceRequired: 2.01 }],
  balance: {
    tickMs: 100,
    millisecondsPerWeek: 1_000,
    startingCash: 100,
    startingCompute: { "test-gpu": 100 },
    startingEmployees: { "test-scientist": 8 },
    startingMisalignment: 20,
    worldEndingMinimumWeek: 50,
    worldEndingResearch: 100,
    capabilityRate: 0.1,
    alignmentRate: 0.1,
    interpretationRate: 0.1,
    evalRate: 0.1,
    automationMultiplier: 2,
    automationRisk: 0.1,
    releasedModelRevenue: 0.01,
  },
};

describe("deterministic simulation", () => {
  test("same seed and elapsed time produce identical state", () => {
    const first = advanceGame(createInitialState(content, 42), 1_000, content);
    const second = advanceGame(createInitialState(content, 42), 1_000, content);
    expect(first).toEqual(second);
    expect(first.stats.ticksSimulated).toBe(10);
  });

  test("fixed ticks make chunking equivalent", () => {
    const initial = createInitialState(content, 42);
    const whole = advanceGame(initial, 1_000, content);
    const chunks = Array.from({ length: 10 }).reduce<GameStateForTest>(
      (state) => advanceGame(state, 100, content),
      initial,
    );
    expect(chunks).toEqual(whole);
  });

  test("rejects over-allocation without mutating state", () => {
    const initial = createInitialState(content);
    const result = applyCommand(
      initial,
      { type: "allocate", department: "alignment", researchers: 99 },
      content,
    );
    expect(result.accepted).toBeFalse();
    expect(result.state).toBe(initial);
  });

  test("round-trips a valid save", () => {
    const state = advanceGame(createInitialState(content), 500, content);
    expect(deserializeGame(serializeGame(state), content)).toEqual(state);
  });

  test("migrates version-4 scalar inventories into the first employee and compute classes", () => {
    const versionFiveContent = { ...content, saveVersion: 5 };
    const legacy = JSON.parse(
      JSON.stringify(createInitialState(versionFiveContent)),
    ) as Record<string, unknown>;
    const legacyStats = legacy.stats as Record<string, unknown>;

    legacy.saveVersion = 4;
    legacy.researchers = 12;
    legacy.compute = 130;
    legacyStats.researchersHired = 4;
    delete legacyStats.employeesHired;
    delete legacy.employeeCounts;
    delete legacy.computeCounts;
    delete legacy.dismissedInvestorIds;

    const migrated = deserializeGame(JSON.stringify(legacy), versionFiveContent);

    expect(migrated.saveVersion).toBe(5);
    expect(employeeClassCount(migrated, "test-scientist")).toBe(12);
    expect(computeClassCount(migrated, "test-gpu")).toBe(130);
    expect(migrated.stats.employeesHired).toBe(4);
  });

  test("migrates version-5 saves with no dismissed investor state", () => {
    const versionFiveContent = { ...content, saveVersion: 5 };
    const versionSixContent = { ...content, saveVersion: 6 };
    const legacy = JSON.parse(
      JSON.stringify(createInitialState(versionFiveContent)),
    ) as Record<string, unknown>;

    delete legacy.dismissedInvestorIds;

    const migrated = deserializeGame(JSON.stringify(legacy), versionSixContent);
    expect(migrated.saveVersion).toBe(6);
    expect(migrated.dismissedInvestorIds).toEqual([]);
  });

  test("does not advance wall time while paused", () => {
    const paused = applyCommand(createInitialState(content), { type: "set-speed", speed: 0 }, content).state;
    expect(advanceGame(paused, 5_000, content)).toEqual(paused);
  });

  test("processes a debug time jump even while paused", () => {
    const paused = applyCommand(createInitialState(content), { type: "set-speed", speed: 0 }, content).state;
    const queued = applyCommand(paused, { type: "debug-advance-week" }, content).state;
    const advanced = advanceGame(queued, 16, content);
    expect(advanced.clock.week).toBeCloseTo(2);
    expect(advanced.clock.speed).toBe(0);
  });

  test("uses a reversible staffing dial with one founder as the minimum", () => {
    const initial = createInitialState(content);
    const hired = applyCommand(
      initial,
      { type: "hire", employeeClassId: "test-scientist" },
      content,
    );
    expect(hired.accepted).toBeTrue();
    expect(employeeClassCount(hired.state, "test-scientist")).toBe(9);
    expect(hired.state.cash).toBe(100);

    const fired = applyCommand(
      hired.state,
      { type: "fire", employeeClassId: "test-scientist" },
      content,
    );
    expect(fired.accepted).toBeTrue();
    expect(employeeClassCount(fired.state, "test-scientist")).toBe(8);

    const founder = {
      ...initial,
      employeeCounts: { "test-scientist": 1 },
      allocation: { ...initial.allocation, alignment: 1 },
    };
    const rejectedFounder = applyCommand(
      founder,
      { type: "fire", employeeClassId: "test-scientist" },
      content,
    );
    expect(rejectedFounder.accepted).toBeFalse();
    expect(rejectedFounder.state).toBe(founder);
  });

  test("charges weekly payroll continuously but only charges GPUs when purchased", () => {
    const initial = createInitialState(content);
    const afterWeek = advanceGame(initial, content.balance.millisecondsPerWeek, content);
    expect(afterWeek.cash).toBeCloseTo(92);
    expect(afterWeek.stats.cashSpent).toBeCloseTo(8);

    const broke = { ...initial, cash: 0 };
    const rejected = applyCommand(
      broke,
      { type: "buy-compute", computeClassId: "test-gpu" },
      content,
    );
    expect(rejected.accepted).toBeFalse();
    expect(rejected.state).toBe(broke);

    const purchased = applyCommand(
      initial,
      { type: "buy-compute", computeClassId: "test-gpu" },
      content,
    );
    expect(purchased.state.cash).toBe(80);
    expect(advanceGame(purchased.state, 100, content).cash).toBeCloseTo(79.2);

    const sold = applyCommand(
      purchased.state,
      { type: "sell-compute", computeClassId: "test-gpu" },
      content,
    );
    expect(sold.accepted).toBeTrue();
    expect(computeClassCount(sold.state, "test-gpu")).toBe(
      computeClassCount(initial, "test-gpu"),
    );
    expect(sold.state.cash).toBe(initial.cash);

    const starterSale = applyCommand(
      initial,
      { type: "sell-compute", computeClassId: "test-gpu" },
      content,
    );
    expect(starterSale.accepted).toBeFalse();
    expect(starterSale.state).toBe(initial);
  });

  test("produces research automatically from the researcher to GPU ratio", () => {
    const initial = createInitialState(content);
    const supplied = advanceGame(initial, content.balance.millisecondsPerWeek, content);
    expect(supplied.research).toBeCloseTo(8 * Math.sqrt(1.25));

    const gpuConstrained = { ...initial, computeCounts: { "test-gpu": 20 } };
    const constrained = advanceGame(
      gpuConstrained,
      content.balance.millisecondsPerWeek,
      content,
    );
    expect(constrained.research).toBeCloseTo(4);

    const extraGpus = advanceGame(
      { ...initial, computeCounts: { "test-gpu": 200 } },
      content.balance.millisecondsPerWeek,
      content,
    );
    expect(extraGpus.research).toBeGreaterThan(supplied.research);
    expect(extraGpus.research).toBeLessThan(supplied.research * 2);
  });

  test("makes insolvency and world-ending research terminal", () => {
    const initial = createInitialState(content);
    const insolvent = { ...initial, cash: 0 };
    expect(advanceGame(insolvent, 10_000, content)).toBe(insolvent);

    const earlyResearch = { ...initial, research: 150 };
    expect(advanceGame(earlyResearch, 100, content)).not.toBe(earlyResearch);

    const nearEnding = {
      ...initial,
      research: 99.9,
      clock: { ...initial.clock, week: content.balance.worldEndingMinimumWeek },
    };
    const ended = advanceGame(nearEnding, 10_000, content);
    expect(ended.research).toBeGreaterThanOrEqual(100);
    expect(advanceGame(ended, 10_000, content)).toBe(ended);
  });

  test("resolves a triggered investor gift once without creating equity state", () => {
    const initial = { ...createInitialState(content), research: 10 };
    const event = {
      id: "first",
      giftAmount: 50,
      trigger: { researchAtLeast: 10 },
    };
    const accepted = respondToInvestor(initial, event, "yes");
    expect(accepted.accepted).toBeTrue();
    expect(accepted.state.cash).toBe(150);
    expect(accepted.state.acceptedInvestorIds).toEqual(["first"]);
    expect(respondToInvestor(accepted.state, event, "yes").accepted).toBeFalse();

    const declined = respondToInvestor(initial, event, "no");
    expect(declined.accepted).toBeTrue();
    expect(declined.state.cash).toBe(100);
    expect(declined.state.dismissedInvestorIds).toEqual(["first"]);
    expect(respondToInvestor(declined.state, event, "yes").accepted).toBeFalse();
  });

  test("only releases meaningfully improved checkpoints", () => {
    const initial = createInitialState(content);
    expect(applyCommand(initial, { type: "release-checkpoint" }, content).accepted).toBeTrue();
    const released = { ...initial, releasedIntelligence: initial.intelligence };
    expect(applyCommand(released, { type: "release-checkpoint" }, content).accepted).toBeFalse();
  });

  test("rejects saves for another content contract", () => {
    const state = createInitialState(content);
    expect(() => deserializeGame(serializeGame(state), { ...content, id: "another" })).toThrow();
  });
});

type GameStateForTest = ReturnType<typeof createInitialState>;
