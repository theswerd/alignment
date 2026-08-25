import type { Meta, StoryObj } from "@storybook/react-vite";
import { GameOverDialog } from "./game-over";

const meta = {
  title: "Shell/Game Over",
  component: GameOverDialog,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    onRestart: () => undefined,
  },
} satisfies Meta<typeof GameOverDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PermanentUnderclass: Story = {
  args: {
    outcome: {
      kind: "underclass",
      labName: "Probably Beneficial Holdings",
      research: "4.2",
    },
  },
};

export const Acquired: Story = {
  args: {
    outcome: {
      kind: "acquired",
      acquirer: "Google",
      founderPayout: "$11.62M",
      labName: "Probably Beneficial Holdings",
      valuation: "$22.40M",
    },
  },
};

export const WorldEnded: Story = {
  args: {
    outcome: {
      kind: "world-ended",
      labName: "Probably Beneficial Holdings",
      research: "104.8",
    },
  },
};
