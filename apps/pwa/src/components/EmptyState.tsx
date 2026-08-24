import { Car } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon = Car,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="empty">
      <div className="empty-icon">
        <Icon size={24} strokeWidth={1.5} />
      </div>
      <h3>{title}</h3>
      {description ? <p>{description}</p> : null}
      {actionLabel && onAction ? (
        <button type="button" className="btn btn-sm" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

export function HomeSkeletons() {
  return (
    <div>
      <div className="hscroll" style={{ marginTop: 16 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ width: 72, height: 36, borderRadius: 999 }} />
        ))}
      </div>
      <div className="skeleton" style={{ width: "100%", aspectRatio: "4/3", borderRadius: 26, marginTop: 28 }} />
      <div className="card" style={{ marginTop: 16 }}>
        <div className="skeleton" style={{ width: "100%", aspectRatio: "16/10", borderRadius: 0 }} />
        <div className="card-body">
          <div className="skeleton" style={{ width: 60, height: 10, marginBottom: 8 }} />
          <div className="skeleton" style={{ width: "70%", height: 16 }} />
        </div>
      </div>
    </div>
  );
}

export function VehicleCardSkeleton() {
  return (
    <div className="card">
      <div className="skeleton" style={{ width: "100%", aspectRatio: "16/10", borderRadius: 0 }} />
      <div className="card-body">
        <div className="skeleton" style={{ width: 60, height: 10, marginBottom: 8 }} />
        <div className="skeleton" style={{ width: "70%", height: 16, marginBottom: 8 }} />
        <div className="skeleton" style={{ width: "50%", height: 12 }} />
      </div>
    </div>
  );
}
