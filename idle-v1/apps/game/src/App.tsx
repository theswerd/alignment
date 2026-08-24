import { useState } from "react";
import { GameShell, type GameSectionId } from "@idle-v1/game-ui";

export function App() {
  const [activeSection, setActiveSection] = useState<GameSectionId>("research");

  return <GameShell activeSection={activeSection} onSectionChange={setActiveSection} />;
}
