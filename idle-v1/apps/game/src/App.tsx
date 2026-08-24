import { useState } from "react";
import {
  GameShell,
  OpeningDialog,
  type GameSectionId,
  type LabRegion,
} from "@idle-v1/game-ui";

const LAB_NAME_PREFIXES = [
  "Definitely",
  "Really",
  "Probably",
  "Mostly",
  "Supposedly",
  "Technically",
  "Allegedly",
  "Almost",
  "Ostensibly",
  "Accidentally",
] as const;

const LAB_NAME_CONCEPTS = [
  "Aligned",
  "Intelligent",
  "Cognitive",
  "Beneficial",
  "Recursive",
  "Frontier",
  "Gradient",
  "Sentient",
] as const;

const LAB_NAME_ORGANIZATIONS = [
  "Labs",
  "Systems",
  "Research",
  "Industries",
  "Holdings",
  "Technologies",
  "Dynamics",
  "Machines",
] as const;

function pickNamePart(parts: readonly string[]): string {
  return parts[Math.floor(Math.random() * parts.length)] ?? parts[0] ?? "";
}

function randomLabName(currentName: string): string {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const suggestion = [
      pickNamePart(LAB_NAME_PREFIXES),
      pickNamePart(LAB_NAME_CONCEPTS),
      pickNamePart(LAB_NAME_ORGANIZATIONS),
    ].join(" ");
    if (suggestion !== currentName) return suggestion;
  }
  return "Definitely Aligned Systems";
}

export function App() {
  const [hasOpenedLab, setHasOpenedLab] = useState(false);
  const [labName, setLabName] = useState("Definitely Aligned Systems");
  const [labRegion, setLabRegion] = useState<LabRegion>("USA");
  const [activeSection, setActiveSection] = useState<GameSectionId>("research");

  return (
    <>
      <GameShell
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        title={labName}
      />
      {!hasOpenedLab ? (
        <OpeningDialog
          labName={labName}
          region={labRegion}
          onLabNameChange={setLabName}
          onRandomizeName={() => setLabName((currentName) => randomLabName(currentName))}
          onRegionChange={setLabRegion}
          onStartLab={(name, region) => {
            setLabName(name);
            setLabRegion(region);
            setHasOpenedLab(true);
          }}
          onJoinPermanentUnderclass={() => undefined}
        />
      ) : null}
    </>
  );
}
