import React, { InputHTMLAttributes } from "react";
import { cva, VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const inputVariants = cva(
  "px-4 py-2 w-full rounded-lg border-2 transition focus:outline-hidden placeholder:text-foreground/60",
  {
    variants: {
      variant: {
        default: "shadow-md focus:shadow-xs bg-card border-border",
        primary:
          "shadow-primary focus:shadow-primary-sm bg-primary border-border text-primary-foreground placeholder:text-primary-foreground/60",
        success:
          "shadow-success focus:shadow-success-sm bg-success border-border text-success-foreground placeholder:text-success-foreground/60",
        info: "shadow-info focus:shadow-info-sm bg-info border-border text-info-foreground placeholder:text-info-foreground/60",
        pink: "shadow-pink focus:shadow-pink-sm bg-pink border-border text-pink-foreground placeholder:text-pink-foreground/60",
        destructive:
          "shadow-destructive focus:shadow-destructive-sm bg-destructive border-border text-destructive-foreground placeholder:text-destructive-foreground/60"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

interface InputProps
  extends InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {}

export const Input: React.FC<InputProps> = ({
  type = "text",
  placeholder = "Enter text",
  className = "",
  variant = "default",
  ...props
}) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      className={cn(
        inputVariants({ variant }),
        props["aria-invalid"] &&
          "border-destructive text-destructive shadow-xs shadow-destructive",
        className
      )}
      {...props}
    />
  );
};
