import { describe, expect, test } from "bun:test";
import { advanceGame, applyCommand, createInitialState, deserializeGame, serializeGame } from "../src";
import type { GameContent } from "../src";

const content: GameContent = {
  id: "test",
  saveVersion: 1,
  title: "Test",
  subtitle: "Test",
  departments: [],
  milestones: [{ id: "first", name: "First", description: "", intelligenceRequired: 2.01 }],
  balance: {
    tickMs: 100,
    millisecondsPerWeek: 1_000,
    startingCash: 100,
    startingCompute: 100,
    startingResearchers: 8,
    startingMisalignment: 20,
    hireBaseCost: 10,
    computeBaseCost: 20,
    computePurchaseSize: 10,
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

  test("enforces costs and records accepted purchases", () => {
    const initial = createInitialState(content);
    const hired = applyCommand(initial, { type: "hire" }, content);
    expect(hired.accepted).toBeTrue();
    expect(hired.state.researchers).toBe(9);
    expect(hired.state.cash).toBe(90);

    const broke = { ...initial, cash: 0 };
    const rejected = applyCommand(broke, { type: "buy-compute" }, content);
    expect(rejected.accepted).toBeFalse();
    expect(rejected.state).toBe(broke);
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
