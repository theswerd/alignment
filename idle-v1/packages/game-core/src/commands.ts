import { appendTrace, ensureClassInventories, totalAllocated } from "./state";
import {
  computeClassCount,
  computeCost,
  computeSellValue,
  employeeClassCount,
  totalEmployees,
} from "./selectors";
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
  state = ensureClassInventories(state, content);
  switch (command.type) {
    case "allocate": {
      const researchers = Math.max(0, Math.floor(command.researchers));
      const nextAllocation = { ...state.allocation, [command.department]: researchers };
      if (totalAllocated(nextAllocation) > totalEmployees(state)) {
        return reject(state, "Not enough unallocated employees");
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
      const definition = content.employeeClasses.find(
        (candidate) => candidate.id === command.employeeClassId,
      );
      if (!definition) return reject(state, "Unknown employee class");
      return accept(
        appendTrace(
          {
            ...state,
            employeeCounts: {
              ...state.employeeCounts,
              [definition.id]: employeeClassCount(state, definition.id) + 1,
            },
            stats: {
              ...state.stats,
              employeesHired: state.stats.employeesHired + 1,
            },
          },
          "economy",
          `Hired one ${definition.name}`,
        ),
      );
    }
    case "fire": {
      const definition = content.employeeClasses.find(
        (candidate) => candidate.id === command.employeeClassId,
      );
      if (!definition) return reject(state, "Unknown employee class");
      const classCount = employeeClassCount(state, definition.id);
      if (classCount <= 0) return reject(state, "No employee of that class to remove");
      if (totalEmployees(state) <= 1) return reject(state, "The founder cannot be removed");
      if (totalAllocated(state.allocation) >= totalEmployees(state)) {
        return reject(state, "Unassign an employee before removing them");
      }
      return accept(
        appendTrace(
          {
            ...state,
            employeeCounts: { ...state.employeeCounts, [definition.id]: classCount - 1 },
          },
          "economy",
          `Removed one ${definition.name}`,
        ),
      );
    }
    case "buy-compute": {
      const definition = content.computeClasses.find(
        (candidate) => candidate.id === command.computeClassId,
      );
      if (!definition) return reject(state, "Unknown compute class");
      const cost = computeCost(state, content, definition.id);
      if (state.cash < cost) return reject(state, "Insufficient cash");
      return accept(
        appendTrace(
          {
            ...state,
            cash: state.cash - cost,
            computeCounts: {
              ...state.computeCounts,
              [definition.id]: computeClassCount(state, definition.id) + definition.purchaseSize,
            },
            stats: { ...state.stats, cashSpent: state.stats.cashSpent + cost },
          },
          "economy",
          `Bought ${definition.purchaseSize} ${definition.name}`,
          { cost },
        ),
      );
    }
    case "sell-compute": {
      const definition = content.computeClasses.find(
        (candidate) => candidate.id === command.computeClassId,
      );
      if (!definition) return reject(state, "Unknown compute class");
      const classCount = computeClassCount(state, definition.id);
      if (classCount <= (content.balance.startingCompute[definition.id] ?? 0)) {
        return reject(state, "The starter GPUs cannot be sold");
      }
      const refund = computeSellValue(state, content, definition.id);
      return accept(
        appendTrace(
          {
            ...state,
            cash: state.cash + refund,
            computeCounts: {
              ...state.computeCounts,
              [definition.id]: classCount - definition.purchaseSize,
            },
          },
          "economy",
          `Sold ${definition.purchaseSize} ${definition.name}`,
          { refund },
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
