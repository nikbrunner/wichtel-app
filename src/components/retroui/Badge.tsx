import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import React, { HTMLAttributes } from "react";

const badgeVariants = cva(
  "font-mono font-semibold rounded-lg border-2 border-border",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground shadow-sm",
        outline: "bg-transparent text-foreground shadow-sm",
        solid: "bg-foreground text-background shadow-sm",
        primary: "bg-primary text-primary-foreground shadow-primary-sm",
        success: "bg-success text-success-foreground shadow-success-sm",
        destructive:
          "bg-destructive text-destructive-foreground shadow-destructive-sm",
        info: "bg-info text-info-foreground shadow-info-sm",
        warning: "bg-warning text-warning-foreground shadow-warning-sm",
        pink: "bg-pink text-pink-foreground shadow-pink-sm"
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-1 text-sm",
        lg: "px-3 py-1.5 text-base"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md"
    }
  }
);

interface ButtonProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({
  children,
  size = "md",
  variant = "default",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {children}
    </span>
  );
}
