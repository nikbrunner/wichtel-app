import React, { InputHTMLAttributes } from "react";
import { cva, VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const inputVariants = cva(
  "px-4 py-2 w-full rounded-lg border-2 transition focus:outline-hidden",
  {
    variants: {
      variant: {
        default: "shadow-md focus:shadow-xs bg-card",
        primary:
          "shadow-primary focus:shadow-primary-sm bg-primary/10 border-primary",
        success:
          "shadow-success focus:shadow-success-sm bg-success/10 border-success",
        info: "shadow-info focus:shadow-info-sm bg-info/10 border-info",
        pink: "shadow-pink focus:shadow-pink-sm bg-pink/10 border-pink"
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
