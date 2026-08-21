import { formatPrice } from "@car-marketplace/utils";
import { cn } from "@/lib/utils";

interface PriceDisplayProps {
  amount: number;
  currency?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  negotiable?: boolean;
}

export function PriceDisplay({
  amount,
  currency = "ETB",
  size = "md",
  className,
  negotiable,
}: PriceDisplayProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      <span
        className={cn("font-display font-semibold tracking-tight text-brand-charcoal", {
          "text-base": size === "sm",
          "text-xl": size === "md",
          "text-3xl": size === "lg",
        })}
      >
        {formatPrice(amount, currency)}
      </span>
      {negotiable && (
        <span className="text-xs text-gray-500">Negotiable</span>
      )}
    </div>
  );
}
