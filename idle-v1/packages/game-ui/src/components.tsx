import type { ReactNode } from "react";

export const GAME_SECTIONS = [
  { id: "overview", label: "Home", glyph: "⌂" },
  { id: "settings", label: "Settings", glyph: "⚙" },
] as const;

export type GameSectionId = (typeof GAME_SECTIONS)[number]["id"];

export const LAB_REGIONS = ["USA", "China", "Europe"] as const;
export type LabRegion = (typeof LAB_REGIONS)[number];

const LAB_REGION_DESCRIPTIONS: Record<LabRegion, string> = {
  USA: "Low regulation, high talent",
  China: "Government support, government rules",
  Europe: "Extreme difficulty",
};

function RegionMark({ region }: { region: LabRegion }) {
  return (
    <span className="idle-region-mark" aria-hidden="true">
      <svg className="idle-region-mark__shape" viewBox="0 0 48 32" role="img">
        {region === "USA" ? (
          <>
            <polygon points="2,10 7,10 7,7 12,8 15,7 19,9 22,7 27,9 36,8 39,10 45,10 45,14 42,14 41,18 37,18 35,22 31,22 30,27 27,27 25,21 20,20 17,23 13,22 12,19 8,19 8,16 3,15" />
            <rect x="4" y="24" width="6" height="4" />
            <rect x="12" y="27" width="3" height="2" />
            <rect x="16" y="28" width="2" height="2" />
          </>
        ) : null}
        {region === "China" ? (
          <>
            <polygon points="6,7 11,7 13,4 18,5 21,3 25,5 31,5 33,8 40,8 44,11 42,15 39,15 40,20 36,23 32,22 29,27 24,29 21,24 16,25 14,21 9,20 10,16 5,14 7,11 3,10" />
            <rect x="35" y="25" width="3" height="2" />
          </>
        ) : null}
        {region === "Europe" ? (
          <>
            <polygon points="10,11 15,8 21,9 25,7 31,9 36,8 41,11 39,15 35,16 34,21 30,20 27,24 23,22 20,24 16,21 11,21 9,17 6,15" />
            <polygon points="7,18 15,18 16,23 12,26 7,23" />
            <polygon points="25,20 29,21 30,26 34,28 31,31 27,26" />
            <polygon points="24,2 28,2 31,6 29,11 25,9 22,5" />
            <polygon points="5,8 8,6 10,10 8,14 5,13" />
            <rect x="2" y="12" width="2" height="3" />
          </>
        ) : null}
      </svg>
      <span className="idle-region-mark__flag" data-region={region} />
    </span>
  );
}

export interface OpeningDialogProps {
  labName: string;
  region: LabRegion | null;
  onJoinPermanentUnderclass: () => void;
  onLabNameChange: (name: string) => void;
  onRandomizeName: () => void;
  onRegionChange: (region: LabRegion) => void;
  onStartLab: (name: string, region: LabRegion) => void;
}

export function OpeningDialog({
  labName,
  region,
  onJoinPermanentUnderclass,
  onLabNameChange,
  onRandomizeName,
  onRegionChange,
  onStartLab,
}: OpeningDialogProps) {
  const trimmedLabName = labName.trim();

  return (
    <div className="idle-opening" role="presentation">
      <section
        className="idle-opening__dialog"
        role="dialog"
        aria-labelledby="idle-opening-title"
        aria-modal="true"
      >
        <span className="idle-opening__eyebrow">2014 · The race begins</span>
        <h1 id="idle-opening-title">Name your lab.</h1>
        <p className="idle-opening__copy">
          It&apos;s 2014. Google just bought DeepMind. You and your fellow researchers know AI is
          going to change the world, so you decide to start your own lab.
        </p>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (trimmedLabName && region) onStartLab(trimmedLabName, region);
          }}
        >
          <label htmlFor="idle-opening-lab-name">Name your lab</label>
          <div className="idle-opening__name-field">
            <input
              id="idle-opening-lab-name"
              autoComplete="organization"
              autoFocus
              maxLength={48}
              placeholder="Enter a name"
              value={labName}
              onChange={(event) => onLabNameChange(event.target.value)}
            />
            <button
              className="idle-opening__randomize"
              type="button"
              aria-label="Choose a random lab name"
              title="Choose a random lab name"
              onClick={onRandomizeName}
            >
              <span aria-hidden="true">⚄</span>
            </button>
          </div>

          <fieldset className="idle-opening__regions">
            <legend>Choose a region</legend>
            <div>
              {LAB_REGIONS.map((option) => (
                <label
                  data-region={option}
                  data-selected={region === option || undefined}
                  key={option}
                >
                  <input
                    type="radio"
                    name="lab-region"
                    value={option}
                    checked={region === option}
                    onChange={() => onRegionChange(option)}
                  />
                  <RegionMark region={option} />
                  <span className="idle-opening__region-copy">
                    <span className="idle-opening__region-name">{option}</span>
                    <small>{LAB_REGION_DESCRIPTIONS[option]}</small>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="idle-opening__actions">
            <button className="idle-opening__start" type="submit" disabled={!trimmedLabName || !region}>
              Start Lab
            </button>
            <button
              className="idle-opening__underclass"
              type="button"
              onClick={onJoinPermanentUnderclass}
            >
              Join Permanent Underclass
            </button>
          </div>
        </form>
        <footer className="idle-opening__disclaimer">
          Any resemblance to real people, organizations, or events is entirely coincidental.
        </footer>
      </section>
    </div>
  );
}

export interface LabOverviewProps {
  canBuyCompute?: boolean;
  canRemoveEmployee?: boolean;
  canSellCompute?: boolean;
  compute: string;
  computeDescription?: string;
  employeeClassName?: string;
  employeeCount: number;
  employeeDescription?: string;
  gpuCost?: string;
  gpuPurchaseSize?: number;
  gpuModel?: string;
  gpuSellValue?: string;
  onAddEmployee?: () => void;
  onBuyCompute?: () => void;
  onRemoveEmployee?: () => void;
  onSellCompute?: () => void;
  region: LabRegion;
  researchGoal?: number;
  researchProgress?: number;
  weeklyPayroll?: string;
}

export function LabOverview({
  canBuyCompute = true,
  canRemoveEmployee = false,
  canSellCompute = false,
  compute,
  computeDescription = "7 TFLOPS FP32 per card · no ongoing cost.",
  employeeClassName = "Research Scientist",
  employeeCount,
  employeeDescription = "16:1 GPU ratio · 2.00× GPU boost · +2.0 research / wk.",
  gpuCost = "$80K",
  gpuPurchaseSize = 4,
  gpuModel = "Titan X GPU",
  gpuSellValue = "$0",
  onAddEmployee,
  onBuyCompute,
  onRemoveEmployee,
  onSellCompute,
  region,
  researchGoal = 10,
  researchProgress = 0,
  weeklyPayroll = "$3,462",
}: LabOverviewProps) {
  const progress = Math.max(0, Math.min(100, (researchProgress / researchGoal) * 100));
  const displayedResearch = Number.isInteger(researchProgress)
    ? String(researchProgress)
    : researchProgress.toFixed(1);

  return (
    <section className="idle-lab-overview" aria-label={`Lab operations in ${region}`}>
      <section className="idle-home-loop" aria-labelledby="idle-home-loop-title">
        <header>
          <div>
            <span>Day-to-day</span>
            <h2 id="idle-home-loop-title">Lab operations</h2>
          </div>
          <small>Grow the resources that keep the lab moving.</small>
        </header>
        <div className="idle-home-loop__actions">
          <article data-action="hiring">
            <div className="idle-home-loop__details">
              <div className="idle-home-loop__heading">
                <h3>{employeeClassName}</h3>
                <span>Employee</span>
              </div>
              <p>{employeeDescription}</p>
            </div>
            <div className="idle-home-loop__staffing">
              <small>{weeklyPayroll} / wk</small>
              <div className="idle-home-loop__dial" role="group" aria-label="Researcher count">
                <button
                  type="button"
                  aria-label="Remove one researcher"
                  disabled={!canRemoveEmployee}
                  onClick={onRemoveEmployee}
                >
                  −1
                </button>
                <strong>{employeeCount}</strong>
                <button type="button" aria-label="Add one researcher" onClick={onAddEmployee}>
                  +1
                </button>
              </div>
            </div>
          </article>
          <article data-action="compute">
            <div className="idle-home-loop__details">
              <div className="idle-home-loop__heading">
                <h3>{gpuModel}</h3>
                <span>Compute</span>
              </div>
              <p>{computeDescription}</p>
            </div>
            <div className="idle-home-loop__compute-trade">
              <div
                className="idle-home-loop__dial idle-home-loop__dial--compute"
                role="group"
                aria-label="GPU count"
              >
                <button type="button" disabled={!canSellCompute} onClick={onSellCompute}>
                  Sell {gpuPurchaseSize} · {gpuSellValue}
                </button>
                <strong>{compute}</strong>
                <button type="button" disabled={!canBuyCompute} onClick={onBuyCompute}>
                  Buy {gpuPurchaseSize} · {gpuCost}
                </button>
              </div>
            </div>
          </article>
        </div>
      </section>
      <section className="idle-research-unlock" aria-labelledby="idle-research-unlock-title">
        <div className="idle-research-unlock__copy">
          <span>Next research unlock</span>
          <strong id="idle-research-unlock-title">First investor visit</strong>
        </div>
        <div className="idle-research-unlock__meter">
          <div aria-hidden="true">
            <span style={{ width: `${progress}%` }} />
          </div>
          <small>{displayedResearch} / {researchGoal} research</small>
        </div>
        <span className="idle-research-unlock__locked" data-unlocked={progress >= 100 || undefined}>
          {progress >= 100 ? "Unlocked" : "Locked"}
        </span>
      </section>
    </section>
  );
}

export interface GameHeaderProps {
  cash?: string;
  day?: number;
  flops?: string;
  runway?: string;
  runwayCritical?: boolean;
  season?: string;
  title?: string;
  year?: number;
}

export function GameHeader({
  cash = "$5.00M",
  day = 1,
  flops = "112 TFLOPS",
  runway = "27.8 yr",
  runwayCritical = false,
  season = "Winter",
  title = "Lantern Laboratory",
  year = 2014,
}: GameHeaderProps) {
  return (
    <header className="idle-game-header">
      <span className="idle-game-header__mark" aria-hidden="true" />
      <div className="idle-game-header__copy">
        <strong>{title}</strong>
        <span>
          Day {day} · {season}, {year}
        </span>
      </div>
      <div className="idle-game-header__metrics" aria-label="Lab metrics">
        <div className="idle-game-header__metric" data-critical={runwayCritical || undefined}>
          <span>Runway</span>
          <strong>{runway}</strong>
        </div>
        <div className="idle-game-header__metric">
          <span>Compute</span>
          <strong>{flops}</strong>
        </div>
        <div className="idle-game-header__metric">
          <span>Cash in bank</span>
          <strong>{cash}</strong>
        </div>
      </div>
    </header>
  );
}

export interface GameSidebarProps {
  activeSection: GameSectionId;
  onSectionChange?: (section: GameSectionId) => void;
}

export function GameSidebar({ activeSection, onSectionChange }: GameSidebarProps) {
  return (
    <aside className="idle-game-sidebar">
      <span className="idle-game-sidebar__label">Laboratory</span>
      <nav className="idle-game-sidebar__nav" aria-label="Game sections">
        {GAME_SECTIONS.map((section) => {
          const isActive = section.id === activeSection;
          return (
            <button
              className="idle-game-sidebar__item"
              data-active={isActive || undefined}
              key={section.id}
              type="button"
              aria-current={isActive ? "page" : undefined}
              onClick={() => onSectionChange?.(section.id)}
            >
              <span className="idle-game-sidebar__glyph" aria-hidden="true">
                {section.glyph}
              </span>
              <span>{section.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

export interface GameShellProps extends GameHeaderProps {
  activeSection: GameSectionId;
  children?: ReactNode;
  onSectionChange?: (section: GameSectionId) => void;
}

export function GameShell({
  activeSection,
  children,
  onSectionChange,
  ...headerProps
}: GameShellProps) {
  const activeLabel = GAME_SECTIONS.find((section) => section.id === activeSection)?.label;

  return (
    <div className="idle-game-shell">
      <GameHeader {...headerProps} />
      <div className="idle-game-shell__body">
        <GameSidebar activeSection={activeSection} onSectionChange={onSectionChange} />
        <main className="idle-game-workspace" aria-label={`${activeLabel ?? "Game"} workspace`}>
          {children}
        </main>
      </div>
    </div>
  );
}
