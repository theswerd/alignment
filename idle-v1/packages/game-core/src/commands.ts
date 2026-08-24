import { appendTrace, totalAllocated } from "./state";
import { computeCost, hireCost } from "./selectors";
import type { GameCommand, GameContent, GameState, TransitionResult } from "./types";

function accept(state: GameState): TransitionResult {
  return { state, accepted: true };
}

function reject(state: GameState, reason: string): TransitionResult {
  return { state, accepted: false, reason };
}

export function applyCommand(
  state: GameState,
  command: GameCommand,
  content: GameContent,
): TransitionResult {
  switch (command.type) {
    case "allocate": {
      const researchers = Math.max(0, Math.floor(command.researchers));
      const nextAllocation = { ...state.allocation, [command.department]: researchers };
      if (totalAllocated(nextAllocation) > state.researchers) {
        return reject(state, "Not enough unallocated researchers");
      }
      return accept(
        appendTrace(
          { ...state, allocation: nextAllocation },
          "command",
          `Allocated ${researchers} researchers to ${command.department}`,
        ),
      );
    }
    case "hire": {
      const cost = hireCost(state, content);
      if (state.cash < cost) return reject(state, "Insufficient cash");
      return accept(
        appendTrace(
          {
            ...state,
            cash: state.cash - cost,
            researchers: state.researchers + 1,
            stats: {
              ...state.stats,
              cashSpent: state.stats.cashSpent + cost,
              researchersHired: state.stats.researchersHired + 1,
            },
          },
          "economy",
          "Hired one researcher",
          { cost },
        ),
      );
    }
    case "buy-compute": {
      const cost = computeCost(state, content);
      if (state.cash < cost) return reject(state, "Insufficient cash");
      return accept(
        appendTrace(
          {
            ...state,
            cash: state.cash - cost,
            compute: state.compute + content.balance.computePurchaseSize,
            stats: { ...state.stats, cashSpent: state.stats.cashSpent + cost },
          },
          "economy",
          `Bought ${content.balance.computePurchaseSize} compute`,
          { cost },
        ),
      );
    }
    case "release-checkpoint": {
      if (state.intelligence <= state.releasedIntelligence + 0.5) {
        return reject(state, "The current checkpoint is not meaningfully better");
      }
      return accept(
        appendTrace(
          {
            ...state,
            releasedIntelligence: state.intelligence,
            publicTrust: Math.max(0, state.publicTrust - state.observedMisalignment * 0.04),
            stats: {
              ...state.stats,
              checkpointsReleased: state.stats.checkpointsReleased + 1,
            },
          },
          "command",
          `Released model at ${state.intelligence.toFixed(1)} intelligence`,
        ),
      );
    }
    case "set-automation":
      return accept({ ...state, automation: Math.max(0, Math.min(1, command.value)) });
    case "set-speed":
      return accept({ ...state, clock: { ...state.clock, speed: command.speed } });
    case "debug-add-cash":
      return accept(
        appendTrace(
          { ...state, cash: state.cash + command.amount },
          "system",
          "Debug cash adjustment",
          { amount: command.amount },
        ),
      );
    case "debug-advance-week":
      return accept({
        ...state,
        clock: {
          ...state.clock,
          accumulatorMs: state.clock.accumulatorMs + content.balance.millisecondsPerWeek,
        },
      });
  }
}
