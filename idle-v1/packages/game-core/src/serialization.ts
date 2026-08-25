import type { GameContent, GameState } from "./types";
import { ensureClassInventories } from "./state";

export function serializeGame(state: GameState): string {
  return JSON.stringify(state);
}

export function deserializeGame(serialized: string, content: GameContent): GameState {
  const candidate: unknown = JSON.parse(serialized);
  if (!candidate || typeof candidate !== "object") throw new Error("Save is not an object");
  let state = candidate as Partial<GameState>;
  if (state.contentId !== content.id) throw new Error("Save belongs to different game content");
  if (
    (state.saveVersion === 4 && content.saveVersion >= 5) ||
    (state.saveVersion === 5 && content.saveVersion === 6)
  ) {
    state = ensureClassInventories(state as GameState, content);
  }
  if (state.saveVersion !== content.saveVersion) throw new Error("Save version is unsupported");
  if (!state.clock || !state.allocation || !state.stats || !Array.isArray(state.trace)) {
    throw new Error("Save is incomplete");
  }
  if (!Array.isArray(state.acceptedInvestorIds)) throw new Error("Save has no investor state");
  if (!Array.isArray(state.dismissedInvestorIds)) throw new Error("Save has no investor decisions");
  if (typeof state.research !== "number") throw new Error("Save has no research state");
  if (!state.employeeCounts || !state.computeCounts) throw new Error("Save has no class inventory");
  return state as GameState;
}
