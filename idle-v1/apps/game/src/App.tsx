import { useEffect, useRef, useState } from "react";
import {
  acquisitionCompanies,
  alignmentContent,
  openingInvestorEvents,
} from "@idle-v1/game-content";
import {
  advanceGame,
  applyCommand,
  computeClassCount,
  computeCost,
  computeSellValue,
  createInitialState,
  deserializeGame,
  employeeClassCount,
  researchPerWeek,
  respondToInvestor,
  serializeGame,
  totalComputeFlops,
  totalEmployees,
  weeklyPayroll,
  type GameCommand,
} from "@idle-v1/game-core";
import {
  GameShell,
  GAME_SECTIONS,
  GameOverDialog,
  INVESTOR_PORTRAITS,
  InvestorEventDialog,
  LAB_REGIONS,
  LabOverview,
  OpeningDialog,
  SettingsPage,
  type GameSectionId,
  type GameOverOutcome,
  type LabRegion,
} from "@idle-v1/game-ui";

const GAME_START_UTC = Date.UTC(2014, 0, 27);
const DAY_MS = 24 * 60 * 60 * 1_000;
const SAVE_KEY = "idle-v1.lab-save";
const SAVE_FORMAT_VERSION = 1;
const FOUNDING_EMPLOYEE_CLASS = alignmentContent.employeeClasses[0];
const FOUNDING_COMPUTE_CLASS = alignmentContent.computeClasses[0];

function formatMoney(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${Math.round(value / 1_000)}K`;
  return `$${Math.round(value)}`;
}

function formatPayroll(value: number): string {
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

function formatFlops(value: number): string {
  const units = [
    { threshold: 1_000_000_000_000_000, suffix: "PFLOPS" },
    { threshold: 1_000_000_000_000, suffix: "TFLOPS" },
    { threshold: 1_000_000_000, suffix: "GFLOPS" },
  ] as const;
  const unit = units.find(({ threshold }) => value >= threshold) ?? units[2];
  const scaled = value / unit.threshold;
  const formatted = Number.isInteger(scaled) ? String(scaled) : scaled.toFixed(1);
  return `${formatted} ${unit.suffix}`;
}

function runwayFromWeeklyBurn(cash: number, weeklyBurn: number) {
  if (weeklyBurn <= 0) return { label: "∞", isCritical: false };
  const months = (Math.max(0, cash) / weeklyBurn) * (12 / 52);
  return {
    label: months >= 24 ? `${(months / 12).toFixed(1)} yr` : `${months.toFixed(1)} mo`,
    isCritical: months < 6,
  };
}

function seasonForMonth(month: number): string {
  if (month === 11 || month <= 1) return "Winter";
  if (month <= 4) return "Spring";
  if (month <= 7) return "Summer";
  return "Autumn";
}

function calendarForWeek(week: number) {
  const day = 1 + Math.round((week - 1) * 7);
  const date = new Date(GAME_START_UTC + (day - 1) * DAY_MS);
  return { day, season: seasonForMonth(date.getUTCMonth()), year: date.getUTCFullYear() };
}

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

interface PersistedLab {
  activeSection: GameSectionId;
  gameState: ReturnType<typeof createInitialState>;
  labName: string;
  labRegion: LabRegion;
}

function clearPersistedLab() {
  try {
    window.localStorage.removeItem(SAVE_KEY);
  } catch {
    // Storage can be unavailable in private or embedded browsing contexts.
  }
}

function loadPersistedLab(): PersistedLab | null {
  try {
    const serialized = window.localStorage.getItem(SAVE_KEY);
    if (!serialized) return null;

    const candidate: unknown = JSON.parse(serialized);
    if (!candidate || typeof candidate !== "object") throw new Error("Invalid lab save");
    const save = candidate as Record<string, unknown>;
    if (save.formatVersion !== SAVE_FORMAT_VERSION) throw new Error("Unsupported lab save");
    if (typeof save.labName !== "string" || !save.labName.trim()) throw new Error("Missing lab name");
    if (
      typeof save.labRegion !== "string" ||
      !LAB_REGIONS.some((region) => region === save.labRegion)
    ) {
      throw new Error("Invalid lab region");
    }
    const activeSection = save.activeSection === "investors" ? "overview" : save.activeSection;
    if (
      typeof activeSection !== "string" ||
      !GAME_SECTIONS.some((section) => section.id === activeSection)
    ) {
      throw new Error("Invalid game section");
    }
    if (typeof save.gameState !== "string") throw new Error("Missing game state");

    return {
      activeSection: activeSection as GameSectionId,
      gameState: deserializeGame(save.gameState, alignmentContent),
      labName: save.labName,
      labRegion: save.labRegion as LabRegion,
    };
  } catch {
    clearPersistedLab();
    return null;
  }
}

export function App() {
  const [restoredLab] = useState(loadPersistedLab);
  const [hasOpenedLab, setHasOpenedLab] = useState(restoredLab !== null);
  const [labName, setLabName] = useState(() => restoredLab?.labName ?? randomLabName(""));
  const [labRegion, setLabRegion] = useState<LabRegion>(() => restoredLab?.labRegion ?? "USA");
  const [activeSection, setActiveSection] = useState<GameSectionId>(
    () => restoredLab?.activeSection ?? "overview",
  );
  const [gameState, setGameState] = useState(
    () => restoredLab?.gameState ?? createInitialState(alignmentContent),
  );
  const saveSnapshotRef = useRef<string | null>(null);
  const employeeCount = employeeClassCount(gameState, FOUNDING_EMPLOYEE_CLASS.id);
  const computeCount = computeClassCount(gameState, FOUNDING_COMPUTE_CLASS.id);
  const totalEmployeeCount = totalEmployees(gameState);
  const totalCompute = totalComputeFlops(gameState, alignmentContent);
  const nextComputeCost = computeCost(
    gameState,
    alignmentContent,
    FOUNDING_COMPUTE_CLASS.id,
  );
  const currentComputeSellValue = computeSellValue(
    gameState,
    alignmentContent,
    FOUNDING_COMPUTE_CLASS.id,
  );
  const currentResearchPerWeek = researchPerWeek(gameState, alignmentContent);
  const gpusPerEmployee = employeeCount > 0 ? computeCount / employeeCount : 0;
  const gpuResearchMultiplier =
    employeeCount > 0
      ? Math.sqrt(totalCompute / (employeeCount * FOUNDING_EMPLOYEE_CLASS.baselineFlops))
      : 0;
  const currentWeeklyPayroll = weeklyPayroll(gameState, alignmentContent);
  const runway = runwayFromWeeklyBurn(gameState.cash, currentWeeklyPayroll);
  const firstInvestorGoal =
    openingInvestorEvents[0]?.trigger.researchAtLeast ?? 10;
  const hasWorldEnded =
    gameState.clock.week >= alignmentContent.balance.worldEndingMinimumWeek &&
    gameState.research >= alignmentContent.balance.worldEndingResearch;
  const hasGameEnded = hasOpenedLab && (gameState.cash <= 0 || hasWorldEnded);
  const calendar = calendarForWeek(gameState.clock.week);
  const pendingInvestorEvent =
    hasOpenedLab && !hasGameEnded
      ? openingInvestorEvents.find(
          (event) =>
            gameState.research >= event.trigger.researchAtLeast &&
            !gameState.acceptedInvestorIds.includes(event.id) &&
            !(gameState.dismissedInvestorIds ?? []).includes(event.id),
        )
      : undefined;
  const acquisitionValuation = Math.max(
    2_000_000,
    Math.round(
      (gameState.research * 1_250_000 +
        totalEmployeeCount * 350_000 +
        (totalCompute / 1_000_000_000_000) * 25_000) /
        100_000,
    ) * 100_000,
  );
  const founderPayout = acquisitionValuation * 0.65;
  const acquirer =
    acquisitionCompanies[
      (gameState.seed + Math.floor(gameState.research) + totalEmployeeCount) %
        acquisitionCompanies.length
    ] ?? acquisitionCompanies[0];
  const gameOverOutcome: GameOverOutcome | null = hasGameEnded
    ? hasWorldEnded
      ? {
          kind: "world-ended",
          labName,
          research: gameState.research.toFixed(1),
        }
      : gameState.research < firstInvestorGoal
        ? {
            kind: "underclass",
            labName,
            research: gameState.research.toFixed(1),
          }
        : {
            kind: "acquired",
            acquirer,
            founderPayout: formatMoney(founderPayout),
            labName,
            valuation: formatMoney(acquisitionValuation),
          }
    : null;

  useEffect(() => {
    if (!hasOpenedLab) {
      saveSnapshotRef.current = null;
      return;
    }
    saveSnapshotRef.current = JSON.stringify({
      formatVersion: SAVE_FORMAT_VERSION,
      labName,
      labRegion,
      activeSection,
      gameState: serializeGame(gameState),
      savedAt: Date.now(),
    });
  }, [activeSection, gameState, hasOpenedLab, labName, labRegion]);

  useEffect(() => {
    const persist = () => {
      if (!saveSnapshotRef.current) return;
      try {
        window.localStorage.setItem(SAVE_KEY, saveSnapshotRef.current);
      } catch {
        // Storage can be unavailable in private or embedded browsing contexts.
      }
    };
    const timer = window.setInterval(persist, 1_000);
    window.addEventListener("pagehide", persist);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("pagehide", persist);
      persist();
    };
  }, []);

  useEffect(() => {
    if (!hasOpenedLab || hasGameEnded || pendingInvestorEvent) return undefined;

    const timer = window.setInterval(() => {
      setGameState((current) => {
        if (
          current.cash <= 0 ||
          (current.clock.week >= alignmentContent.balance.worldEndingMinimumWeek &&
            current.research >= alignmentContent.balance.worldEndingResearch)
        ) {
          return current;
        }
        return advanceGame(current, alignmentContent.balance.tickMs, alignmentContent);
      });
    }, alignmentContent.balance.tickMs);

    return () => window.clearInterval(timer);
  }, [hasGameEnded, hasOpenedLab, pendingInvestorEvent]);

  function runCommand(command: GameCommand) {
    setGameState((current) => applyCommand(current, command, alignmentContent).state);
  }

  function startFreshGame() {
    saveSnapshotRef.current = null;
    clearPersistedLab();
    setGameState(createInitialState(alignmentContent));
    setLabName(randomLabName(""));
    setLabRegion("USA");
    setActiveSection("overview");
    setHasOpenedLab(false);
  }

  function resetGame() {
    if (!window.confirm("Reset this lab and erase all progress?")) return;
    startFreshGame();
  }

  return (
    <>
      <GameShell
        activeSection={activeSection}
        cash={formatMoney(gameState.cash)}
        day={calendar.day}
        flops={formatFlops(totalCompute)}
        onSectionChange={setActiveSection}
        runway={runway.label}
        runwayCritical={runway.isCritical}
        season={calendar.season}
        title={labName}
        year={calendar.year}
      >
        {activeSection === "overview" ? (
          <LabOverview
            canBuyCompute={gameState.cash >= nextComputeCost}
            canRemoveEmployee={totalEmployeeCount > 1}
            canSellCompute={computeCount > (alignmentContent.balance.startingCompute[FOUNDING_COMPUTE_CLASS.id] ?? 0)}
            compute={`${computeCount} GPUs`}
            computeDescription={`${formatFlops(FOUNDING_COMPUTE_CLASS.flopsPerUnit)} ${FOUNDING_COMPUTE_CLASS.precisionLabel} per card · no ongoing cost.`}
            employeeClassName={FOUNDING_EMPLOYEE_CLASS.name}
            employeeCount={employeeCount}
            employeeDescription={`${Number.isInteger(gpusPerEmployee) ? gpusPerEmployee : gpusPerEmployee.toFixed(1)}:1 GPU ratio · ${gpuResearchMultiplier.toFixed(2)}× GPU boost · +${currentResearchPerWeek.toFixed(1)} research / wk.`}
            gpuCost={formatMoney(nextComputeCost)}
            gpuPurchaseSize={FOUNDING_COMPUTE_CLASS.purchaseSize}
            gpuModel={FOUNDING_COMPUTE_CLASS.name}
            gpuSellValue={formatMoney(currentComputeSellValue)}
            onBuyCompute={() =>
              runCommand({ type: "buy-compute", computeClassId: FOUNDING_COMPUTE_CLASS.id })
            }
            onAddEmployee={() =>
              runCommand({ type: "hire", employeeClassId: FOUNDING_EMPLOYEE_CLASS.id })
            }
            onRemoveEmployee={() =>
              runCommand({ type: "fire", employeeClassId: FOUNDING_EMPLOYEE_CLASS.id })
            }
            onSellCompute={() =>
              runCommand({ type: "sell-compute", computeClassId: FOUNDING_COMPUTE_CLASS.id })
            }
            region={labRegion}
            researchGoal={firstInvestorGoal}
            researchProgress={gameState.research}
            weeklyPayroll={formatPayroll(currentWeeklyPayroll)}
          />
        ) : activeSection === "settings" ? (
          <SettingsPage onReset={resetGame} />
        ) : null}
      </GameShell>
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
          onJoinPermanentUnderclass={() => {
            setGameState({ ...createInitialState(alignmentContent), cash: 0 });
            setActiveSection("overview");
            setHasOpenedLab(true);
          }}
        />
      ) : null}
      {pendingInvestorEvent ? (
        <InvestorEventDialog
          amount={formatMoney(pendingInvestorEvent.giftAmount)}
          dialogue={pendingInvestorEvent.dialogue}
          labName={labName}
          name={pendingInvestorEvent.name}
          onRespond={(response) => {
            setGameState((current) =>
              respondToInvestor(current, pendingInvestorEvent, response).state,
            );
          }}
          portraitSrc={
            pendingInvestorEvent.portraitKey
              ? INVESTOR_PORTRAITS[pendingInvestorEvent.portraitKey]
              : undefined
          }
          role={pendingInvestorEvent.role}
        />
      ) : null}
      {gameOverOutcome ? (
        <GameOverDialog outcome={gameOverOutcome} onRestart={startFreshGame} />
      ) : null}
    </>
  );
}
