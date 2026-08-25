import { NavLink, useNavigate } from "react-router-dom";
import { Compass, Home, MessageCircle, Plus, User } from "lucide-react";
import { useAuthStore } from "../store";

const TABS = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/search", label: "Explore", icon: Compass, end: false },
  { to: "/messages", label: "Messages", icon: MessageCircle, end: false },
  { to: "/profile", label: "Profile", icon: User, end: false },
] as const;

export function TabBar() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.accessToken);

  function onSell() {
    if (!token) {
      navigate("/profile");
      return;
    }
    navigate("/sell");
  }

  return (
    <nav className="tabs-nav">
      {TABS.slice(0, 2).map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => `tab-item${isActive ? " active" : ""}`}
        >
          {({ isActive }) => (
            <>
              <span className="tab-icon">
                <Icon size={20} strokeWidth={isActive ? 2.25 : 1.7} />
              </span>
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
      <button type="button" className="tab-item" onClick={onSell} aria-label="Sell">
        <span className="sell-fab">
          <Plus size={26} strokeWidth={2.4} />
        </span>
        <span>Sell</span>
      </button>
      {TABS.slice(2).map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => `tab-item${isActive ? " active" : ""}`}
        >
          {({ isActive }) => (
            <>
              <span className="tab-icon">
                <Icon size={20} strokeWidth={isActive ? 2.25 : 1.7} />
              </span>
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
