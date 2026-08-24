import type { ReactNode } from "react";

export const GAME_SECTIONS = [
  { id: "overview", label: "Overview", glyph: "⌂" },
  { id: "research", label: "Research", glyph: "✦" },
  { id: "models", label: "Models", glyph: "M" },
  { id: "compute", label: "Compute", glyph: "⚙" },
  { id: "world", label: "World", glyph: "◎" },
] as const;

export type GameSectionId = (typeof GAME_SECTIONS)[number]["id"];

export interface GameHeaderProps {
  day?: number;
  season?: string;
  title?: string;
  year?: number;
}

export function GameHeader({
  day = 118,
  season = "Autumn",
  title = "Lantern Laboratory",
  year = 2,
}: GameHeaderProps) {
  return (
    <header className="idle-game-header">
      <span className="idle-game-header__mark" aria-hidden="true" />
      <div className="idle-game-header__copy">
        <strong>{title}</strong>
        <span>
          Day {day} · {season}, Year {year}
        </span>
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
