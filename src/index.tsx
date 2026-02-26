import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CharacterProvider } from "./context/CharacterContext";
import App from "./App";
import "./index.css";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
root.render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <CharacterProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </CharacterProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
