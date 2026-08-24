# Prototype 1 — Alignment: The Game (idle/management)

Single-file HTML idle game. Open `alignment-the-game.html` in a browser, or play the hosted version:
https://claude.ai/code/artifact/71de19d9-457e-43fa-b359-62c0ebcba00d

## Concept

You run a frontier AI lab (OpenBrain). Allocate MOTS (Members of Technical Staff) across alignment, control, interpretability, capabilities, and optimization; split compute between inference (revenue), evals, and research; decide how much to let the models do the research. Race three rival labs to superintelligence while managing a misalignment variable **you can never directly observe**.

## Core design bets

1. **Uncertainty is the spine.** True misalignment is hidden; the player sees an estimate with an error band. Evals compute and interpretability research narrow the band; alignment research moves the true value. Past intelligence ~55 the model starts sandbagging, so estimates bias optimistic exactly when stakes are highest. No other idle game makes the player act on error bars — this is the mechanic that makes it *about* alignment rather than skinned as alignment.
2. **Automation is the risk.** The idle-game reward ladder (model reliance → full RSI) multiplies research speed but lets misalignment grow unchecked. The genre's core pleasure (numbers go up while you do nothing) is the game's core danger. Late game, the soft cap on intelligence gains means RSI is the only way to reach ASI on time — the game forces the handoff question.
3. **No good endings.** 9 collectible endings, all bad or mixed (value lock-in, eternal warden/AI-boxing, glass-box interpretability, the successor, "it says it's aligned", exfiltration, outcompeted, misaligned launch, bankruptcy). Discovering that there is no aligned-ASI ending is the intended tweet. Ending counter persists per browser via localStorage.
4. **Revenue requires releases.** Income only flows from a *released* checkpoint, and the release rolls against true misalignment at ship time. Money pressure is what pushes the player to do bad things (release undertested checkpoints, take Peter Peel's money) — the "game pushes you toward bad choices" requirement implemented through the economy rather than through villain dialogue.

## Inspirations

- **Cookie Clicker / Evolve** — allocation and unlock structure, prestige-adjacent ending collection.
- **Plague Inc** — specific, darkly funny end screens; news ticker as world-building.
- **Universal Paperclips** — the obvious ancestor; this game inverts it (you're the lab, not the AI).
- The doc's own jokes: region select (Europe: +100% taxes, that's the whole bonus), Buy TBPN, Waffle House incident, Better Future PAC, world-models-team money pit.

## Balance state (headless-tested)

- Reckless play (all caps, 90% reliance, ship everything): loses weights ~week 26.
- Caps-hungry but safety-conscious: "It says it's aligned" ambiguous ending.
- Alignment staff matched 1:1 with capabilities: true low-misalignment endings ~week 450–500, with the lead rival at ~94/100 (photo finish).
- Tuning knobs, all in `tick()`: `0.007` in `capPts` (overall pace), the `15`/`1.7` soft-cap pair (endgame length), rival `rate` values, and the misalignment grow/drop constants `0.5`/`0.65`.

## Known gaps

- Mid-game decision density is thin for a 10–15 min run: needs more events or a proper upgrade tree.
- Money stops being a binding constraint mid-game (genre-typical, but flattens the release dilemma).
- The pixel aesthetic includes a diegetic glitch system (UI corrupts with *true* misalignment, not the estimate) — worth expanding; observant players get a signal the evals can't give them.
