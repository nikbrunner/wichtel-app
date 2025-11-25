import React, { TextareaHTMLAttributes } from "react";
import { cva, VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const textareaVariants = cva(
  "px-4 py-2 w-full border-2 border-border rounded-lg transition focus:outline-hidden placeholder:text-foreground/60",
  {
    variants: {
      variant: {
        default: "shadow-md focus:shadow-xs bg-card",
        primary:
          "shadow-primary focus:shadow-primary-sm bg-primary text-primary-foreground placeholder:text-primary-foreground/60",
        success:
          "shadow-success focus:shadow-success-sm bg-success text-success-foreground placeholder:text-success-foreground/60",
        info: "shadow-info focus:shadow-info-sm bg-info text-info-foreground placeholder:text-info-foreground/60",
        pink: "shadow-pink focus:shadow-pink-sm bg-pink text-pink-foreground placeholder:text-pink-foreground/60",
        destructive:
          "shadow-destructive focus:shadow-destructive-sm bg-destructive text-destructive-foreground placeholder:text-destructive-foreground/60"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {}

export function Textarea({
  placeholder = "Enter text...",
  className = "",
  variant = "default",
  ...props
}: TextareaProps) {
  return (
    <textarea
      placeholder={placeholder}
      rows={4}
      className={cn(textareaVariants({ variant }), className)}
      {...props}
    />
  );
}
