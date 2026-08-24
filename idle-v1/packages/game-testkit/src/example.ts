import { alignmentContent } from "@idle-v1/game-content";
import { runScenario } from "./index";

const result = runScenario(alignmentContent, [
  { label: "baseline month", elapsedMs: 32_000 },
  {
    label: "automate research",
    commands: [{ type: "set-automation", value: 0.65 }],
    elapsedMs: 64_000,
  },
  {
    label: "release",
    commands: [{ type: "release-checkpoint" }],
    elapsedMs: 80_000,
  },
]);

console.table(
  result.checkpoints.map((checkpoint) => ({
    ...checkpoint,
    week: checkpoint.week.toFixed(1),
    cash: `$${(checkpoint.cash / 1_000_000).toFixed(1)}m`,
    intelligence: checkpoint.intelligence.toFixed(2),
    trueMisalignment: checkpoint.trueMisalignment.toFixed(2),
    uncertainty: checkpoint.uncertainty.toFixed(2),
  })),
);
