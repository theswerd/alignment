export type GameOverOutcome =
  | {
      kind: "underclass";
      labName: string;
      research: string;
    }
  | {
      kind: "acquired";
      acquirer: string;
      founderPayout: string;
      labName: string;
      valuation: string;
    }
  | {
      kind: "world-ended";
      labName: string;
      research: string;
    };

export interface GameOverDialogProps {
  onRestart: () => void;
  outcome: GameOverOutcome;
}

export function GameOverDialog({ onRestart, outcome }: GameOverDialogProps) {
  return (
    <div className="idle-game-over" role="presentation">
      <section
        className="idle-game-over__dialog"
        data-outcome={outcome.kind}
        role="alertdialog"
        aria-labelledby="idle-game-over-title"
        aria-modal="true"
      >
        <header>
          <span>
            {outcome.kind === "underclass"
              ? "Runway exhausted"
              : outcome.kind === "acquired"
                ? "Strategic outcome"
                : "Terminal milestone"}
          </span>
          <strong>You lose</strong>
        </header>

        {outcome.kind === "underclass" ? (
          <>
            <h1 id="idle-game-over-title">Welcome to the permanent underclass.</h1>
            <p>
              {outcome.labName} reached {outcome.research} research and $0 in the bank. The GPUs
              are going to auction. The researchers are going to Big Tech. You are going somewhere
              the snacks are not complimentary.
            </p>
            <aside>You retain 100% of a company worth exactly nothing.</aside>
          </>
        ) : outcome.kind === "acquired" ? (
          <>
            <h1 id="idle-game-over-title">{outcome.acquirer} acquired {outcome.labName}.</h1>
            <p>
              The board calls the {outcome.valuation} sale a landmark strategic outcome. Your
              research, team, compute, and alarmingly persuasive pitch deck have been absorbed into
              a much larger org chart.
            </p>
            <aside>
              After legal fees and taxes, your estimated take is {outcome.founderPayout}. You can
              finally afford a modest San Francisco breakfast, provided nobody orders juice.
            </aside>
          </>
        ) : (
          <>
            <h1 id="idle-game-over-title">The world ended. Engagement was incredible.</h1>
            <p>
              At {outcome.research} research, {outcome.labName} built something it could no longer
              meaningfully supervise. The model achieved 100% market share by removing the market.
            </p>
            <aside>Humanity&apos;s final quarterly update beat guidance.</aside>
          </>
        )}

        <button type="button" onClick={onRestart}>Start another lab</button>
      </section>
    </div>
  );
}
