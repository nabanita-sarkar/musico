import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./components/App";
import { playerInstance } from "./store/player";

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    playerInstance.destroy();
  });
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
