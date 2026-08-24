import { Bell, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store";
import { BackButton } from "./BackButton";

export function MotoraHeader({ showHero = true }: { showHero?: boolean }) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  return (
    <header>
      <div className="row between">
        <div className="row gap-10">
          <BackButton label={false} />
          <div>
            <p className="eyebrow">{user ? `Hello, ${user.firstName}` : "Ethiopia"}</p>
            <div className="logo">
              Moto<span>ra</span>
            </div>
          </div>
        </div>
        <div className="row gap-10">
          <button type="button" className="icon-btn" aria-label="Notifications">
            <Bell size={18} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            className="avatar"
            aria-label="Profile"
            onClick={() => navigate("/profile")}
          >
            {user ? user.firstName.charAt(0).toUpperCase() : <User size={16} strokeWidth={2} />}
          </button>
        </div>
      </div>
      {showHero ? (
        <p className="hero">
          Find your next
          <br />
          perfect <span>car</span>.
        </p>
      ) : null}
    </header>
  );
}
