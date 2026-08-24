import { useEffect, useState, type ReactNode } from "react";
import { isEmbedded } from "../lib/embed";

export function AppShell({ children }: { children: ReactNode }) {
  const embedded = isEmbedded();
  const [wide, setWide] = useState(
    () => !embedded && typeof window !== "undefined" && window.innerWidth >= 720
  );

  useEffect(() => {
    if (embedded) return;
    function onResize() {
      setWide(window.innerWidth >= 720);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [embedded]);

  if (embedded || !wide) {
    return <div className="phone-fill">{children}</div>;
  }

  return (
    <div className="desktop-shell">
      <div className="desktop-brand">
        <p className="desktop-logo">
          Moto<span>ra</span>
        </p>
        <p className="desktop-tag">Verified cars across Ethiopia — browse, save, and contact sellers.</p>
      </div>
      <div className="phone-frame">{children}</div>
    </div>
  );
}
