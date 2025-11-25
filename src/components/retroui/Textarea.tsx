import React, { TextareaHTMLAttributes } from "react";
import { cva, VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const textareaVariants = cva(
  "px-4 py-2 w-full border-2 rounded-lg transition focus:outline-hidden placeholder:text-muted-foreground",
  {
    variants: {
      variant: {
        default: "shadow-md focus:shadow-xs bg-card border-border",
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
