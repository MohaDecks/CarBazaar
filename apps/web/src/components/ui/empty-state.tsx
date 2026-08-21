import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-16 text-center",
        className
      )}
    >
      {Icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
          <Icon className="h-5 w-5 text-gray-500" />
        </div>
      )}
      <h3 className="font-display text-xl font-semibold text-brand-charcoal">
        {title}
      </h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-gray-500">{description}</p>
      )}
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-6 inline-flex h-11 items-center rounded-md bg-accent px-5 text-sm font-medium text-white hover:bg-accent-hover"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
