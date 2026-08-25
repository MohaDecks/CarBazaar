import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store";
import { BackButton } from "./BackButton";
import { isEmbedded } from "../lib/embed";

export function DirshayHeader({
  showBack = true,
}: {
  showBack?: boolean;
}) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  return (
    <header className="row between" style={{ marginBottom: 14 }}>
      <div className="row gap-10">
        {showBack && !isEmbedded() ? <BackButton label={false} /> : null}
        <div className="mark" aria-hidden>
          D
        </div>
        <div>
          <p className="eyebrow">{user ? user.firstName : "Ethiopia"}</p>
          <div className="logo">
            Dirs<span>hay</span>
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
          {user ? user.firstName.charAt(0).toUpperCase() : "D"}
        </button>
      </div>
    </header>
  );
}
