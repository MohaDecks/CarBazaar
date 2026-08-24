import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { App } from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { HomePage } from "./pages/HomePage";
import { SearchPage } from "./pages/SearchPage";
import { FavoritesPage } from "./pages/FavoritesPage";
import { MessagesPage } from "./pages/MessagesPage";
import { ProfilePage } from "./pages/ProfilePage";
import { VehiclePage } from "./pages/VehiclePage";
import "./index.css";

function showCrash(err: unknown) {
  const root = document.getElementById("root");
  if (!root) return;
  const message = err instanceof Error ? err.stack || err.message : String(err);
  root.innerHTML = `<pre style="white-space:pre-wrap;padding:24px;color:#fecaca;font-size:13px">${message.replace(/</g, "&lt;")}</pre>`;
}

window.addEventListener("error", (event) => {
  showCrash(event.error || event.message);
});
window.addEventListener("unhandledrejection", (event) => {
  showCrash(event.reason);
});

const el = document.getElementById("root");
if (!el) {
  throw new Error("Missing #root");
}

try {
  createRoot(el).render(
    <StrictMode>
      <ErrorBoundary>
        <BrowserRouter>
          <Routes>
            <Route element={<App />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/vehicle/*" element={<VehiclePage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </StrictMode>
  );
} catch (err) {
  showCrash(err);
}
