import type { Meta, StoryObj } from "@storybook/react-vite";
import { SettingsPage } from "./settings";

const meta = {
  title: "Pages/Settings",
  component: SettingsPage,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    onReset: () => undefined,
  },
} satisfies Meta<typeof SettingsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
