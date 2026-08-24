import { useEffect, useState, type ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  const [wide, setWide] = useState(
    () => typeof window !== "undefined" && window.innerWidth >= 720
  );

  useEffect(() => {
    function onResize() {
      setWide(window.innerWidth >= 720);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  if (!wide) {
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
