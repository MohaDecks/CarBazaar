import { ChevronLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { isEmbedded } from "../lib/embed";

export function goBack(navigate: ReturnType<typeof useNavigate>, key: string) {
  if (key === "default") navigate("/");
  else navigate(-1);
}

export function BackButton({
  className = "back-icon",
  label = false,
}: {
  className?: string;
  label?: boolean;
}) {
  const navigate = useNavigate();
  const location = useLocation();

  if (isEmbedded()) return null;

  return (
    <button
      type="button"
      className={className}
      aria-label="Back"
      onClick={() => goBack(navigate, location.key)}
    >
      <ChevronLeft size={18} strokeWidth={2.4} />
      {label ? <span>Back</span> : null}
    </button>
  );
}

export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="page-head">
      <div className="page-head-row">
        <BackButton label={false} />
        <div>
          <h1 className="title">{title}</h1>
          {subtitle ? <p className="subtitle">{subtitle}</p> : null}
        </div>
      </div>
    </div>
  );
}
