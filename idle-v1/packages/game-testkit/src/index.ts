import {
  advanceGame,
  applyCommand,
  createInitialState,
  totalAllocated,
  type GameCommand,
  type GameContent,
  type GameState,
} from "@idle-v1/game-core";

export interface ScenarioStep {
  label: string;
  elapsedMs?: number;
  commands?: readonly GameCommand[];
}

export interface ScenarioCheckpoint {
  label: string;
  week: number;
  cash: number;
  intelligence: number;
  trueMisalignment: number;
  uncertainty: number;
  researchers: number;
}

export interface ScenarioResult {
  state: GameState;
  checkpoints: ScenarioCheckpoint[];
}

export function assertInvariants(state: GameState): void {
  if (totalAllocated(state.allocation) > state.researchers) {
    throw new Error("Invariant failed: allocations exceed researcher count");
  }
  if (state.cash < 0) throw new Error("Invariant failed: cash is negative");
  if (state.intelligence < 0 || state.intelligence > 100) {
    throw new Error("Invariant failed: intelligence outside 0..100");
  }
  if (state.trueMisalignment < 0 || state.trueMisalignment > 100) {
    throw new Error("Invariant failed: misalignment outside 0..100");
  }
}

export function runScenario(
  content: GameContent,
  steps: readonly ScenarioStep[],
  seed = 42,
): ScenarioResult {
  let state = createInitialState(content, seed);
  const checkpoints: ScenarioCheckpoint[] = [];

  for (const step of steps) {
    for (const command of step.commands ?? []) {
      const result = applyCommand(state, command, content);
      if (!result.accepted) throw new Error(`${step.label}: ${result.reason}`);
      state = result.state;
    }
    state = advanceGame(state, step.elapsedMs ?? 0, content);
    assertInvariants(state);
    checkpoints.push({
      label: step.label,
      week: state.clock.week,
      cash: state.cash,
      intelligence: state.intelligence,
      trueMisalignment: state.trueMisalignment,
      uncertainty: state.uncertainty,
      researchers: state.researchers,
    });
  }

  return { state, checkpoints };
}
