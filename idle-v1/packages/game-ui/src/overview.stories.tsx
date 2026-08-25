import type { Meta, StoryObj } from "@storybook/react-vite";
import { LabOverview } from "./components";

const meta = {
  title: "Pages/Overview",
  component: LabOverview,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    employeeClassName: "Research Scientist",
    employeeCount: 1,
    employeeDescription: "16:1 GPU ratio · 2.00× GPU boost · +2.0 research / wk.",
    compute: "16 GPUs",
    computeDescription: "7 TFLOPS FP32 per card · no ongoing cost.",
    gpuModel: "Titan X GPU",
    region: "USA",
    weeklyPayroll: "$3,462",
  },
} satisfies Meta<typeof LabOverview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const StartingLab: Story = {};
