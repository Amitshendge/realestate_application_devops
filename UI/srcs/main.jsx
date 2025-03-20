import React from "react";
import { createRoot } from "react-dom/client";
import { MsalProvider } from "@azure/msal-react";
import { PublicClientApplication } from "@azure/msal-browser";
import App from "./App";
import { msalConfig } from "./authConfig"; // Import your MSAL config
import "./index.css"; // Optional for additional styles

// Initialize MSAL instance
const msalInstance = new PublicClientApplication(msalConfig);

// Create a root using createRoot
const root = createRoot(document.getElementById("root"));

// Render the app
root.render(
  <React.StrictMode>
    <MsalProvider instance={msalInstance}>
      <App />
    </MsalProvider>
  </React.StrictMode>
);