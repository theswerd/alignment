import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "@idle-v1/game-ui/styles.css";
import "./app.css";

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root element");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
