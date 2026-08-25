export type DepartmentId = "alignment" | "capabilities" | "interpretability" | "evals";

export type Allocation = Record<DepartmentId, number>;

export interface DepartmentDefinition {
  id: DepartmentId;
  name: string;
  shortName: string;
  description: string;
  accent: string;
}

export interface BalanceDefinition {
  tickMs: number;
  millisecondsPerWeek: number;
  startingCash: number;
  startingCompute: Readonly<Record<string, number>>;
  startingEmployees: Readonly<Record<string, number>>;
  startingMisalignment: number;
  worldEndingMinimumWeek: number;
  worldEndingResearch: number;
  capabilityRate: number;
  alignmentRate: number;
  interpretationRate: number;
  evalRate: number;
  automationMultiplier: number;
  automationRisk: number;
  releasedModelRevenue: number;
}

export interface MilestoneDefinition {
  id: string;
  name: string;
  description: string;
  intelligenceRequired: number;
}

export interface EmployeeClassDefinition {
  id: string;
  name: string;
  description: string;
  annualSalary: number;
  baselineFlops: number;
  researchPerWeek: number;
}

export interface ComputeClassDefinition {
  id: string;
  name: string;
  description: string;
  releaseYear: number;
  flopsPerUnit: number;
  precisionLabel: string;
  baseCost: number;
  purchaseSize: number;
}

export interface GameContent {
  id: string;
  saveVersion: number;
  title: string;
  subtitle: string;
  balance: BalanceDefinition;
  computeClasses: readonly ComputeClassDefinition[];
  departments: readonly DepartmentDefinition[];
  employeeClasses: readonly EmployeeClassDefinition[];
  milestones: readonly MilestoneDefinition[];
}

export type GameSpeed = 0 | 1 | 2 | 4;

export interface GameClock {
  elapsedMs: number;
  accumulatorMs: number;
  week: number;
  speed: GameSpeed;
}

export interface GameStats {
  cashEarned: number;
  cashSpent: number;
  employeesHired: number;
  checkpointsReleased: number;
  ticksSimulated: number;
}

export type TraceKind = "system" | "command" | "economy" | "research" | "milestone";

export interface TraceEntry {
  id: number;
  week: number;
  kind: TraceKind;
  message: string;
  data?: Record<string, number | string | boolean>;
}

export interface GameState {
  acceptedInvestorIds: string[];
  dismissedInvestorIds: string[];
  saveVersion: number;
  contentId: string;
  seed: number;
  randomState: number;
  nextTraceId: number;
  clock: GameClock;
  cash: number;
  computeCounts: Record<string, number>;
  employeeCounts: Record<string, number>;
  allocation: Allocation;
  intelligence: number;
  trueMisalignment: number;
  observedMisalignment: number;
  uncertainty: number;
  publicTrust: number;
  releasedIntelligence: number;
  research: number;
  automation: number;
  unlockedMilestones: string[];
  trace: TraceEntry[];
  stats: GameStats;
}

export type GameCommand =
  | { type: "allocate"; department: DepartmentId; researchers: number }
  | { type: "hire"; employeeClassId: string }
  | { type: "fire"; employeeClassId: string }
  | { type: "buy-compute"; computeClassId: string }
  | { type: "sell-compute"; computeClassId: string }
  | { type: "release-checkpoint" }
  | { type: "set-automation"; value: number }
  | { type: "set-speed"; speed: GameSpeed }
  | { type: "debug-add-cash"; amount: number }
  | { type: "debug-advance-week" };

export interface TransitionResult {
  state: GameState;
  accepted: boolean;
  reason?: string;
}
