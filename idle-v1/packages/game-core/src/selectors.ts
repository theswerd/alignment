import type {
  ComputeClassDefinition,
  DepartmentId,
  EmployeeClassDefinition,
  GameContent,
  GameState,
} from "./types";

function employeeDefinition(content: GameContent, classId: string): EmployeeClassDefinition {
  const definition = content.employeeClasses.find((candidate) => candidate.id === classId);
  if (!definition) throw new Error(`Unknown employee class: ${classId}`);
  return definition;
}

function computeDefinition(content: GameContent, classId: string): ComputeClassDefinition {
  const definition = content.computeClasses.find((candidate) => candidate.id === classId);
  if (!definition) throw new Error(`Unknown compute class: ${classId}`);
  return definition;
}

export function employeeClassCount(state: GameState, classId: string): number {
  const legacy = state as GameState & { researchers?: number };
  return state.employeeCounts?.[classId] ?? legacy.researchers ?? 0;
}

export function computeClassCount(state: GameState, classId: string): number {
  const legacy = state as GameState & { compute?: number };
  return state.computeCounts?.[classId] ?? legacy.compute ?? 0;
}

export function totalEmployees(state: GameState): number {
  const legacy = state as GameState & { researchers?: number };
  if (!state.employeeCounts) return legacy.researchers ?? 0;
  return Object.values(state.employeeCounts).reduce((total, count) => total + count, 0);
}

export function totalComputeUnits(state: GameState): number {
  const legacy = state as GameState & { compute?: number };
  if (!state.computeCounts) return legacy.compute ?? 0;
  return Object.values(state.computeCounts).reduce((total, count) => total + count, 0);
}

export function totalComputeFlops(state: GameState, content: GameContent): number {
  return content.computeClasses.reduce(
    (total, definition) => total + computeClassCount(state, definition.id) * definition.flopsPerUnit,
    0,
  );
}

export function weeklyPayroll(state: GameState, content: GameContent): number {
  return content.employeeClasses.reduce(
    (total, definition) =>
      total + (employeeClassCount(state, definition.id) * definition.annualSalary) / 52,
    0,
  );
}

export function computeCost(state: GameState, content: GameContent, classId: string): number {
  const definition = computeDefinition(content, classId);
  const purchases = Math.max(
    0,
    (computeClassCount(state, classId) - (content.balance.startingCompute[classId] ?? 0)) /
      definition.purchaseSize,
  );
  return Math.round(definition.baseCost * 1.22 ** purchases);
}

export function computeSellValue(state: GameState, content: GameContent, classId: string): number {
  const definition = computeDefinition(content, classId);
  const purchases = Math.max(
    0,
    (computeClassCount(state, classId) - (content.balance.startingCompute[classId] ?? 0)) /
      definition.purchaseSize,
  );
  if (purchases < 1) return 0;
  return Math.round(definition.baseCost * 1.22 ** (purchases - 1));
}

export function researchPerWeek(state: GameState, content: GameContent): number {
  const baseResearch = content.employeeClasses.reduce(
    (total, definition) =>
      total + employeeClassCount(state, definition.id) * definition.researchPerWeek,
    0,
  );
  const baselineFlops = content.employeeClasses.reduce(
    (total, definition) =>
      total + employeeClassCount(state, definition.id) * definition.baselineFlops,
    0,
  );
  const availableFlops = totalComputeFlops(state, content);
  if (baseResearch <= 0 || baselineFlops <= 0 || availableFlops <= 0) return 0;
  return baseResearch * Math.sqrt(availableFlops / baselineFlops);
}

export function unallocatedResearchers(state: GameState): number {
  const allocated = Object.values(state.allocation).reduce((sum, count) => sum + count, 0);
  return totalEmployees(state) - allocated;
}

export function departmentOutput(
  state: GameState,
  department: DepartmentId,
  content: GameContent,
): number {
  const researchers = state.allocation[department];
  const baselineFlops = content.computeClasses[0]?.flopsPerUnit ?? 1;
  const equivalentComputeUnits = totalComputeFlops(state, content) / baselineFlops;
  const computeFactor = Math.sqrt(equivalentComputeUnits / 100);
  const automationFactor = 1 + state.automation * 2;
  return researchers * computeFactor * automationFactor;
}

export function misalignmentBand(state: GameState): [number, number] {
  return [
    Math.max(0, state.observedMisalignment - state.uncertainty / 2),
    Math.min(100, state.observedMisalignment + state.uncertainty / 2),
  ];
}
