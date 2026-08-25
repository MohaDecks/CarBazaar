import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { AppShell } from "./components/AppShell";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { TabBar } from "./components/TabBar";
import { WelcomePage } from "./pages/WelcomePage";

export function App() {
  const location = useLocation();
  const [seenWelcome, setSeenWelcome] = useState(
    () => localStorage.getItem("dirshay-welcome-seen") === "1"
  );

  useEffect(() => {
    function sync() {
      setSeenWelcome(localStorage.getItem("dirshay-welcome-seen") === "1");
    }
    sync();
    window.addEventListener("dirshay-welcome", sync);
    return () => window.removeEventListener("dirshay-welcome", sync);
  }, [location.pathname]);

  const showWelcome = !seenWelcome && location.pathname === "/";
  const showTabs =
    !showWelcome &&
    !location.pathname.startsWith("/vehicle/") &&
    !location.pathname.startsWith("/auth/") &&
    location.pathname !== "/welcome" &&
    location.pathname !== "/sell";

  return (
    <AppShell>
      <main className="app-main">
        <ErrorBoundary>
          {showWelcome ? <WelcomePage /> : <Outlet />}
        </ErrorBoundary>
      </main>
      {showTabs ? <TabBar /> : null}
    </AppShell>
  );
}
