import { NavLink } from "react-router-dom";
import { Compass, Heart, Home, MessageCircle, User } from "lucide-react";

const TABS = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/search", label: "Explore", icon: Compass, end: false },
  { to: "/favorites", label: "Favorites", icon: Heart, end: false },
  { to: "/messages", label: "Messages", icon: MessageCircle, end: false },
  { to: "/profile", label: "Profile", icon: User, end: false },
] as const;

export function TabBar() {
  return (
    <nav className="tabs-nav">
      {TABS.map(({ to, label, icon: Icon, end }) => (
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
