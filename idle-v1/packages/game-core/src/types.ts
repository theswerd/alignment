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
  startingCompute: number;
  startingResearchers: number;
  startingMisalignment: number;
  hireBaseCost: number;
  computeBaseCost: number;
  computePurchaseSize: number;
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

export interface GameContent {
  id: string;
  saveVersion: number;
  title: string;
  subtitle: string;
  balance: BalanceDefinition;
  departments: readonly DepartmentDefinition[];
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
  researchersHired: number;
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
  saveVersion: number;
  contentId: string;
  seed: number;
  randomState: number;
  nextTraceId: number;
  clock: GameClock;
  cash: number;
  compute: number;
  researchers: number;
  allocation: Allocation;
  intelligence: number;
  trueMisalignment: number;
  observedMisalignment: number;
  uncertainty: number;
  publicTrust: number;
  releasedIntelligence: number;
  automation: number;
  unlockedMilestones: string[];
  trace: TraceEntry[];
  stats: GameStats;
}

export type GameCommand =
  | { type: "allocate"; department: DepartmentId; researchers: number }
  | { type: "hire" }
  | { type: "buy-compute" }
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
