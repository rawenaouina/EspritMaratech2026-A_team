import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./app.jsx";
import "./styles.css";

import { setLang, getLang } from "./i18n/i18n.js";
import { applyThemeFromStorage, applyVisualFromStorage, applyA11yFromStorage } from "./utils/format.js";

setLang(getLang());
applyThemeFromStorage();
applyVisualFromStorage();
applyA11yFromStorage();

const qc = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
