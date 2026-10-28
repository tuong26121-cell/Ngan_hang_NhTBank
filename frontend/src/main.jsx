import React from "react";
import ReactDOM from "react-dom/client";
import { MotionConfig } from "framer-motion";
import App from "./App.jsx";
import { getDisplayMode } from "./components/ReferenceArt";
import "./styles.css";
import "./reference-theme.css";
document.documentElement.dataset.display = getDisplayMode();
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>
  </React.StrictMode>,
);
