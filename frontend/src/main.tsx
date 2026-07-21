import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { InterestLoopExperience } from "./components/InterestLoopExperience";
import "./styles.css";
import "./interest-loop.css";

const root = document.getElementById("root");
if (!root) {
  throw new Error("Root element is missing");
}

createRoot(root).render(
  <StrictMode>
    <App />
    <InterestLoopExperience />
  </StrictMode>,
);
