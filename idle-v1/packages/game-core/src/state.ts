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
  const startingEmployeeCount = Object.values(content.balance.startingEmployees).reduce(
    (total, count) => total + count,
    0,
  );
  for (let researcher = 0; researcher < startingEmployeeCount; researcher += 1) {
    const department = departments[researcher % departments.length];
    if (department) allocation[department] += 1;
  }

  const state: GameState = {
    acceptedInvestorIds: [],
    dismissedInvestorIds: [],
    saveVersion: content.saveVersion,
    contentId: content.id,
    seed,
    randomState: seed,
    nextTraceId: 1,
    clock: { elapsedMs: 0, accumulatorMs: 0, week: 1, speed: 1 },
    cash: content.balance.startingCash,
    computeCounts: { ...content.balance.startingCompute },
    employeeCounts: { ...content.balance.startingEmployees },
    allocation,
    intelligence: 2,
    trueMisalignment: content.balance.startingMisalignment,
    observedMisalignment: content.balance.startingMisalignment,
    uncertainty: 34,
    publicTrust: 50,
    releasedIntelligence: 0,
    research: 0,
    automation: 0,
    unlockedMilestones: [],
    trace: [],
    stats: {
      cashEarned: 0,
      cashSpent: 0,
      employeesHired: 0,
      checkpointsReleased: 0,
      ticksSimulated: 0,
    },
  };

  return appendTrace(state, "system", "Simulation initialized", { seed });
}

export function ensureClassInventories(state: GameState, content: GameContent): GameState {
  const legacy = state as GameState & {
    compute?: number;
    dismissedInvestorIds?: string[];
    researchers?: number;
    stats: GameState["stats"] & { researchersHired?: number };
  };
  if (
    state.computeCounts &&
    state.employeeCounts &&
    legacy.dismissedInvestorIds &&
    state.saveVersion === content.saveVersion
  ) {
    return state;
  }

  const employeeClassId = content.employeeClasses[0]?.id;
  const computeClassId = content.computeClasses[0]?.id;
  if (!employeeClassId || !computeClassId) {
    throw new Error("Game content must define at least one employee and compute class");
  }

  return {
    ...state,
    saveVersion: content.saveVersion,
    dismissedInvestorIds: legacy.dismissedInvestorIds ?? [],
    employeeCounts: {
      ...(state.employeeCounts ?? {
        [employeeClassId]:
          legacy.researchers ?? content.balance.startingEmployees[employeeClassId] ?? 0,
      }),
    },
    computeCounts: {
      ...(state.computeCounts ?? {
        [computeClassId]: legacy.compute ?? content.balance.startingCompute[computeClassId] ?? 0,
      }),
    },
    stats: {
      ...state.stats,
      employeesHired: legacy.stats.employeesHired ?? legacy.stats.researchersHired ?? 0,
    },
  };
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
