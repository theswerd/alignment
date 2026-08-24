import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { GameShell, OpeningDialog, type LabRegion } from "./components";

const SUGGESTED_NAMES = [
  "Definitely Aligned Systems",
  "Probably Beneficial Holdings",
  "Allegedly Sentient Labs",
] as const;

function OpeningWorkbench() {
  const [labName, setLabName] = useState<string>(SUGGESTED_NAMES[0]);
  const [region, setRegion] = useState<LabRegion>("USA");

  return (
    <>
      <GameShell activeSection="research" title={labName} />
      <OpeningDialog
        labName={labName}
        region={region}
        onLabNameChange={setLabName}
        onRandomizeName={() => {
          const currentIndex = SUGGESTED_NAMES.indexOf(labName as (typeof SUGGESTED_NAMES)[number]);
          setLabName(SUGGESTED_NAMES[(currentIndex + 1) % SUGGESTED_NAMES.length] ?? SUGGESTED_NAMES[0]);
        }}
        onRegionChange={setRegion}
        onStartLab={() => undefined}
        onJoinPermanentUnderclass={() => undefined}
      />
    </>
  );
}

const meta = {
  title: "Shell/Opening",
  component: OpeningDialog,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof OpeningDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Initial: Story = {
  args: {
    labName: "Definitely Aligned Systems",
    region: "USA",
    onLabNameChange: () => undefined,
    onJoinPermanentUnderclass: () => undefined,
    onRandomizeName: () => undefined,
    onRegionChange: () => undefined,
    onStartLab: () => undefined,
  },
  render: () => <OpeningWorkbench />,
};
