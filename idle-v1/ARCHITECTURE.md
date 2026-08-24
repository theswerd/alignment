# Architecture

## Boundary rules

### `@idle-v1/game-core`

Owns authoritative state and transitions. It must stay deterministic, serializable, and independent of React, the DOM, timers, storage, and authored game copy. The app supplies elapsed time; the core quantizes it into fixed ticks.

### `@idle-v1/game-content`

Owns what makes this game *Alignment*: balance constants, departments, milestone thresholds, descriptions, and presentation hints such as accent colors. New campaigns can provide another `GameContent` object without forking the engine.

### `@idle-v1/game-ui`

Owns presentational components. Components receive values and callbacks and must not import concrete content, call the simulation, or access local storage. Stories live beside the components so states such as zero resources, uncertainty bands, locked actions, and long text can be reviewed in isolation.

### `apps/game`

Owns composition, the animation loop, browser persistence, keyboard shortcuts, and product layout. It translates user intent into core commands. It should not contain balance math.

### `@idle-v1/game-testkit`

Owns headless scenario execution. Long-run balance checks belong here, not in browser tests. Scenario failures should print the first broken invariant and the named checkpoint that caused it.

## Adding a mechanic

1. Extend the state and command contract in `game-core`.
2. Implement the pure transition and add a deterministic test.
3. Put its tuning values and copy in `game-content`.
4. Add presentational states to `game-ui` and a Storybook story.
5. Wire the command and state into `apps/game`.
6. Add at least one headless scenario that exercises the mechanic over time.

This sequence keeps the mechanic playable at every layer and makes balance regressions attributable to a specific boundary.
