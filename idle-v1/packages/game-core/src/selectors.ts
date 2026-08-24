import type { DepartmentId, GameContent, GameState } from "./types";

export function hireCost(state: GameState, content: GameContent): number {
  return Math.round(content.balance.hireBaseCost * 1.18 ** state.stats.researchersHired);
}

export function computeCost(state: GameState, content: GameContent): number {
  const purchases = Math.max(
    0,
    (state.compute - content.balance.startingCompute) / content.balance.computePurchaseSize,
  );
  return Math.round(content.balance.computeBaseCost * 1.22 ** purchases);
}

export function unallocatedResearchers(state: GameState): number {
  const allocated = Object.values(state.allocation).reduce((sum, count) => sum + count, 0);
  return state.researchers - allocated;
}

export function departmentOutput(state: GameState, department: DepartmentId): number {
  const researchers = state.allocation[department];
  const computeFactor = Math.sqrt(state.compute / 100);
  const automationFactor = 1 + state.automation * 2;
  return researchers * computeFactor * automationFactor;
}

export function misalignmentBand(state: GameState): [number, number] {
  return [
    Math.max(0, state.observedMisalignment - state.uncertainty / 2),
    Math.min(100, state.observedMisalignment + state.uncertainty / 2),
  ];
}
