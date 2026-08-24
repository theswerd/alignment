# Idle v1

A Bun monorepo for turning the Alignment idle-game prototype into a game that is easy to balance, inspect, test, and polish without coupling its rules to its interface.

## Workspace map

```text
idle-v1/
├── apps/
│   ├── game/             Playable React/Vite game; composition and persistence only
│   └── storybook/        Isolated component preview, controls, docs, and a11y checks
├── packages/
│   ├── game-core/        Pure deterministic simulation, commands, selectors, saves
│   ├── game-content/     Departments, milestones, copy, theme hints, balance values
│   ├── game-ui/          Presentational React components and their stories
│   └── game-testkit/     Headless scenarios and invariant checks for balancing
├── ARCHITECTURE.md       Dependency rules and debugging design
├── bunfig.toml
└── package.json          Bun workspace commands
```

The dependency direction is deliberate:

```text
game-content ──┐
game-core ─────┼──> game app <── game-ui
               │                  ▲
               └──> game-testkit  │
                                  │
storybook ────────────────────────┘
```

`game-core` has no browser or React dependency. `game-content` is declarative data. `game-ui` owns no game state. The game app is the eventual composition boundary; during the current shell pass it intentionally renders only `game-ui`.

## Run it

```bash
bun install
bun run dev
```

The frontend runs with Vite hot reload at the URL printed in the terminal (normally `http://127.0.0.1:5173`). Its page canvas is intentionally empty while the shell is developed.

```bash
bun run dev:game       # frontend hot reload
bun run dev:components # Storybook component hot reload at localhost:6006
bun run storybook      # alias for dev:components
bun test            # deterministic engine tests
bun run typecheck   # all workspaces
bun run build       # game and Storybook production builds
bun run simulate    # headless balance scenario
```

## Debugging contract

- Every simulation step is a fixed tick and seeded; equal state plus equal commands always gives equal output.
- The PRNG state, full simulation state, and structured trace are persisted in the save.
- Commands return an explicit accepted/rejected result and never partially mutate state.
- `game-testkit` runs long balance scenarios without rendering the UI and checks invariants after each step.
- The in-game inspector can add cash, advance time, export a save, and reset a run.
- Production builds include source maps so runtime failures can be traced back to package source.
