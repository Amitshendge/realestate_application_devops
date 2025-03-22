import React from "react";
import { createRoot } from "react-dom/client";
import { MsalProvider } from "@azure/msal-react";
import App from "./App";
import "./index.css"; // Optional for additional styles


// Create a root using createRoot
const root = createRoot(document.getElementById("root"));

// Render the app
root.render(
  <React.StrictMode>
      <App />
  </React.StrictMode>
);