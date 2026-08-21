import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "new" | "used" | "certified" | "outline";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide",
        {
          "bg-brand-charcoal text-white": variant === "default",
          "bg-condition-new text-white": variant === "new",
          "bg-gray-600 text-white": variant === "used",
          "bg-condition-certified text-white": variant === "certified",
          "border border-gray-300 text-gray-600": variant === "outline",
        },
        className
      )}
    >
      {children}
    </span>
  );
}
