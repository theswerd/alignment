import type { Preview } from "@storybook/react-vite";
import "@idle-v1/game-ui/styles.css";

const preview: Preview = {
  parameters: {
    controls: { expanded: true },
    backgrounds: {
      default: "laboratory",
      values: [
        { name: "laboratory", value: "#f7eacb" },
        { name: "sidebar", value: "#dbc08f" },
      ],
    },
    a11y: { test: "todo" },
  },
};

export default preview;
