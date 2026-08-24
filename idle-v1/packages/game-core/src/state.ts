import type { Allocation, GameContent, GameState, TraceEntry, TraceKind } from "./types";

const TRACE_LIMIT = 120;

export function createInitialState(content: GameContent, seed = 0x1d1e): GameState {
  const allocation: Allocation = {
    alignment: 0,
    capabilities: 0,
    interpretability: 0,
    evals: 0,
  };
  const departments = Object.keys(allocation) as (keyof Allocation)[];
  for (let researcher = 0; researcher < content.balance.startingResearchers; researcher += 1) {
    const department = departments[researcher % departments.length];
    if (department) allocation[department] += 1;
  }

  const state: GameState = {
    saveVersion: content.saveVersion,
    contentId: content.id,
    seed,
    randomState: seed,
    nextTraceId: 1,
    clock: { elapsedMs: 0, accumulatorMs: 0, week: 1, speed: 1 },
    cash: content.balance.startingCash,
    compute: content.balance.startingCompute,
    researchers: content.balance.startingResearchers,
    allocation,
    intelligence: 2,
    trueMisalignment: content.balance.startingMisalignment,
    observedMisalignment: content.balance.startingMisalignment,
    uncertainty: 34,
    publicTrust: 50,
    releasedIntelligence: 0,
    automation: 0,
    unlockedMilestones: [],
    trace: [],
    stats: {
      cashEarned: 0,
      cashSpent: 0,
      researchersHired: 0,
      checkpointsReleased: 0,
      ticksSimulated: 0,
    },
  };

  return appendTrace(state, "system", "Simulation initialized", { seed });
}

export function appendTrace(
  state: GameState,
  kind: TraceKind,
  message: string,
  data?: TraceEntry["data"],
): GameState {
  const entry: TraceEntry = {
    id: state.nextTraceId,
    week: state.clock.week,
    kind,
    message,
    ...(data ? { data } : {}),
  };
  return {
    ...state,
    nextTraceId: state.nextTraceId + 1,
    trace: [...state.trace, entry].slice(-TRACE_LIMIT),
  };
}

export function totalAllocated(allocation: Allocation): number {
  return Object.values(allocation).reduce((total, value) => total + value, 0);
}
