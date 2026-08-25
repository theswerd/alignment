import type { Meta, StoryObj } from "@storybook/react-vite";
import { INVESTOR_PORTRAITS } from "./assets";
import { GameShell } from "./components";
import { InvestorEventDialog } from "./investors";

const meta = {
  title: "Events/Investor visit",
  component: InvestorEventDialog,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof InvestorEventDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Gift: Story = {
  args: {
    amount: "$1.50M",
    dialogue: "You’re early, underfunded, and talking about AGI with a straight face. I like it.",
    labName: "Probably Beneficial Labs",
    name: "Garry Tan",
    onRespond: () => undefined,
    portraitSrc: INVESTOR_PORTRAITS["garry-tan"],
    role: "Y Combinator partner",
  },
  render: (args) => (
    <>
      <GameShell activeSection="overview" title="Probably Beneficial Labs" />
      <InvestorEventDialog {...args} />
    </>
  ),
};
