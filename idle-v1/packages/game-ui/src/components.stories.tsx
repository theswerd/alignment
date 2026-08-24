import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { GameSidebar, type GameSectionId } from "./components";

function SidebarWorkbench({ initialSection }: { initialSection: GameSectionId }) {
  const [activeSection, setActiveSection] = useState(initialSection);

  return (
    <div className="idle-story-sidebar-stage">
      <GameSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <div aria-hidden="true" />
    </div>
  );
}

const meta = {
  title: "Shell/Sidebar",
  component: GameSidebar,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    activeSection: "research",
  },
} satisfies Meta<typeof GameSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Workbench: Story = {
  render: (args) => <SidebarWorkbench initialSection={args.activeSection} />,
};
