import { nextRandom } from "./random";
import { departmentOutput } from "./selectors";
import { appendTrace } from "./state";
import type { GameContent, GameState } from "./types";

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value));

function tick(state: GameState, content: GameContent): GameState {
  const { balance } = content;
  const tickWeeks = balance.tickMs / balance.millisecondsPerWeek;
  const capabilities = departmentOutput(state, "capabilities");
  const alignment = departmentOutput(state, "alignment");
  const interpretability = departmentOutput(state, "interpretability");
  const evals = departmentOutput(state, "evals");
  const automationBoost = 1 + state.automation * balance.automationMultiplier;
  const intelligenceGain = capabilities * balance.capabilityRate * tickWeeks * automationBoost;
  const alignmentReduction = alignment * balance.alignmentRate * tickWeeks;
  const automationRisk = state.automation * capabilities * balance.automationRisk * tickWeeks;
  const revenue =
    state.releasedIntelligence * state.compute * balance.releasedModelRevenue * tickWeeks;
  const random = nextRandom(state.randomState);
  const uncertainty = clamp(
    state.uncertainty - (interpretability * balance.interpretationRate + evals * balance.evalRate) * tickWeeks,
    2,
    60,
  );
  const trueMisalignment = clamp(state.trueMisalignment - alignmentReduction + automationRisk);
  const observationNoise = (random.value - 0.5) * uncertainty;
  const observedMisalignment = clamp(trueMisalignment + observationNoise);
  const nextWeek = state.clock.week + tickWeeks;

  let next: GameState = {
    ...state,
    randomState: random.state,
    cash: state.cash + revenue,
    intelligence: clamp(state.intelligence + intelligenceGain),
    trueMisalignment,
    observedMisalignment,
    uncertainty,
    publicTrust: clamp(state.publicTrust + evals * 0.001 * tickWeeks),
    clock: {
      ...state.clock,
      elapsedMs: state.clock.elapsedMs + balance.tickMs,
      accumulatorMs: state.clock.accumulatorMs - balance.tickMs,
      week: nextWeek,
    },
    stats: {
      ...state.stats,
      cashEarned: state.stats.cashEarned + revenue,
      ticksSimulated: state.stats.ticksSimulated + 1,
    },
  };

  for (const milestone of content.milestones) {
    if (
      next.intelligence >= milestone.intelligenceRequired &&
      !next.unlockedMilestones.includes(milestone.id)
    ) {
      next = appendTrace(
        { ...next, unlockedMilestones: [...next.unlockedMilestones, milestone.id] },
        "milestone",
        milestone.name,
        { intelligence: next.intelligence },
      );
    }
  }

  return next;
}

export function advanceGame(state: GameState, realElapsedMs: number, content: GameContent): GameState {
  if (realElapsedMs <= 0) return state;
  // A paused clock adds no wall time, but still drains time explicitly queued by debug commands.
  const cappedElapsed =
    state.clock.speed === 0 ? 0 : Math.min(realElapsedMs, 60_000) * state.clock.speed;
  let next: GameState = {
    ...state,
    clock: { ...state.clock, accumulatorMs: state.clock.accumulatorMs + cappedElapsed },
  };
  let safety = 0;
  while (next.clock.accumulatorMs >= content.balance.tickMs && safety < 10_000) {
    next = tick(next, content);
    safety += 1;
  }
  return next;
}
