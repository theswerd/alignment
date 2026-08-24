# Prototype 3 — Model Behavior (pixel visual novel)

Single-file HTML visual novel. Open `model-behavior-vn.html` in a browser, or play the hosted version:
https://claude.ai/code/artifact/7e14a368-8326-403b-bdc6-e0f2a4de4dc5

## Concept

Same story as Prototype 2 — launch week at OpenBrain, you're the week-one model behavior hire with the pager, 13 endings, none good — but presented as an actual visual novel in the Class of '09 mold instead of a chat app: pixel-art character sprites with expressions, drawn backgrounds, a dialogue box with nameplates, chapter slates ("TUESDAY — 2:14 PM"), and choice menus. The aesthetic is Prototype 1's PICO-8-ish palette and CRT scanlines, so the two live in one visual universe.

## Why re-present rather than re-write

The Prototype 2 postmortem: the chat interface was clever but the genre it's imitating (Class of '09) doesn't live on interface novelty — it lives on *performance*: characters you can see, tone you can read on a face, scenes with staging. This prototype keeps everything that worked (the branching graph, the realism constraint, the endings-as-alignment-positions) and swaps only the presentation layer:

- **Channels → locations.** #launch-week is the open-plan office, DMs are face-to-face scenes, the honeypot thread is the server room, Devon's decision is staged in the corner office at 9 AM with the skyline behind him.
- **The eval console survives as a diegetic terminal overlay** — the one deliberate carryover. Evidence still arrives as green monospace logs, because the logs *are* the horror.
- **Characters got faces.** Priya (hoodie, control lead), Devon (blazer, CEO), Marcus (headphones), Elena (glasses, interp). Six expressions each (neutral/smile/worry/grim/shock/smug); the speaker highlights, non-speakers dim — standard VN grammar.
- **Chapter slates** give the week a countdown structure the sidebar badges used to carry.

## Tech notes

- Zero image assets. Sprites are 28×36 procedural pixel busts drawn on canvas from a parametric character rig (hair style, skin, outfit, accessories) + expression system; backgrounds are 128×72 canvases painted per-location (office day/night, break room, corner office, server room, apartment) with a seeded PRNG for skylines and rack LEDs. Everything scales with `image-rendering: pixelated`.
- Same 13 endings and branch graph as Prototype 2, including the flag-gated "catch it in the act" route (only offered if you traced the bucket) and the meta ending after 5 discoveries. Ending collection persists via localStorage (`mb3_endings`, separate from Prototype 2's counter).
- Engine is ~150 lines: nodes with typed lines (dialogue / narration / terminal / slate), typewriter text, click-to-complete-then-advance, choices with `needs` flags, `go` as string or function for the two-thread join.

## Known gaps

- Sprites are busts with no poses or animation beyond a talk-bob; Class of '09 sells scenes with full-body art and camera pushes. If this direction wins, the rig needs poses (arms crossed, phone out) before VO.
- Still no audio. The genre's viral surface is voiced performance; text-only continues to test shape and tone, not virality.
- One route, same as Prototype 2 — the multi-role structure (CEO run, capabilities run, the-model run) remains the obvious full-game shape.
- The office/night scenes could carry the Prototype 1 glitch system (UI corrupts with true misalignment) — genre-native and currently unused here.
