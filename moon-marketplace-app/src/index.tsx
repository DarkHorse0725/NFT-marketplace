import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { WagmiConfig } from "wagmi";
import { BrowserRouter as Router } from "react-router-dom";

import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { client } from "./wagmi";
import "./polyfills.ts";
import "react-slidedown/lib/slidedown.css";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <Router>
      <WagmiConfig client={client}>
        <App />
      </WagmiConfig>
    </Router>
  </React.StrictMode>
);

reportWebVitals();
