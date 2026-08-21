import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-accent text-white hover:bg-accent-hover",
        secondary:
          "bg-brand-charcoal text-white hover:bg-brand-black",
        outline:
          "border border-gray-300 bg-transparent text-brand-charcoal hover:border-brand-charcoal hover:bg-white",
        ghost:
          "text-brand-charcoal hover:bg-gray-100",
        danger:
          "bg-semantic-error text-white hover:bg-red-800",
      },
      size: {
        sm: "h-9 px-3 text-sm rounded-md",
        md: "h-11 px-5 text-sm rounded-md",
        lg: "h-12 px-6 text-base rounded-md",
        icon: "h-10 w-10 rounded-md",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { buttonVariants };
