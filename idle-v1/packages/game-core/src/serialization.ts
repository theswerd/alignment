import type { GameContent, GameState } from "./types";

export function serializeGame(state: GameState): string {
  return JSON.stringify(state);
}

export function deserializeGame(serialized: string, content: GameContent): GameState {
  const candidate: unknown = JSON.parse(serialized);
  if (!candidate || typeof candidate !== "object") throw new Error("Save is not an object");
  const state = candidate as Partial<GameState>;
  if (state.contentId !== content.id) throw new Error("Save belongs to different game content");
  if (state.saveVersion !== content.saveVersion) throw new Error("Save version is unsupported");
  if (!state.clock || !state.allocation || !state.stats || !Array.isArray(state.trace)) {
    throw new Error("Save is incomplete");
  }
  return state as GameState;
}
