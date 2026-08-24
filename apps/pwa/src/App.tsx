import { Outlet, useLocation } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { TabBar } from "./components/TabBar";

export function App() {
  const location = useLocation();
  const showTabs =
    !location.pathname.startsWith("/vehicle/") &&
    !location.pathname.startsWith("/auth/");

  return (
    <AppShell>
      <main className="app-main">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      {showTabs ? <TabBar /> : null}
    </AppShell>
  );
}
