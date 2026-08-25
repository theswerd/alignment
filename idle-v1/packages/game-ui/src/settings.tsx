export interface SettingsPageProps {
  onReset: () => void;
}

export function SettingsPage({ onReset }: SettingsPageProps) {
  return (
    <section className="idle-settings" aria-labelledby="idle-settings-title">
      <header>
        <span>Laboratory</span>
        <h1 id="idle-settings-title">Settings</h1>
      </header>
      <section className="idle-settings__reset" aria-labelledby="idle-settings-reset-title">
        <div>
          <h2 id="idle-settings-reset-title">Reset game</h2>
          <p>Erase this lab and return to the opening screen.</p>
        </div>
        <button type="button" onClick={onReset}>Reset game</button>
      </section>
    </section>
  );
}
