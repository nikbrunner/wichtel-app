import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import React, { ButtonHTMLAttributes } from "react";
import { Slot } from "@radix-ui/react-slot";

export const buttonVariants = cva(
  "font-head transition-all rounded-lg outline-hidden cursor-pointer duration-200 font-medium flex items-center justify-center border-2 border-black",
  {
    variants: {
      variant: {
        default:
          "shadow-primary hover:shadow-primary-sm active:shadow-none bg-primary text-primary-foreground transition hover:translate-y-1 active:translate-y-2 active:translate-x-1 hover:bg-primary-hover",
        secondary:
          "shadow-md hover:shadow active:shadow-none bg-secondary text-secondary-foreground transition hover:translate-y-1 active:translate-y-2 active:translate-x-1",
        outline:
          "shadow-md hover:shadow active:shadow-none bg-transparent transition hover:translate-y-1 active:translate-y-2 active:translate-x-1",
        success:
          "shadow-success hover:shadow-success-sm active:shadow-none bg-success text-success-foreground transition hover:translate-y-1 active:translate-y-2 active:translate-x-1",
        destructive:
          "shadow-destructive hover:shadow-destructive-sm active:shadow-none bg-destructive text-destructive-foreground transition hover:translate-y-1 active:translate-y-2 active:translate-x-1",
        info: "shadow-info hover:shadow-info-sm active:shadow-none bg-info text-info-foreground transition hover:translate-y-1 active:translate-y-2 active:translate-x-1",
        warning:
          "shadow-warning hover:shadow-warning-sm active:shadow-none bg-warning text-warning-foreground transition hover:translate-y-1 active:translate-y-2 active:translate-x-1",
        pink: "shadow-pink hover:shadow-pink-sm active:shadow-none bg-pink text-pink-foreground transition hover:translate-y-1 active:translate-y-2 active:translate-x-1",
        link: "bg-transparent hover:underline border-0",
        ghost: "bg-transparent hover:bg-muted border-0"
      },
      size: {
        sm: "px-3 py-1 text-sm",
        md: "px-4 py-1.5 text-base",
        lg: "px-6 lg:px-8 py-2 lg:py-3 text-md lg:text-lg",
        icon: "p-2 h-9 w-9"
      }
    },
    defaultVariants: {
      size: "md",
      variant: "default"
    }
  }
);

export interface IButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, IButtonProps>(
  (
    {
      children,
      size = "md",
      className = "",
      variant = "default",
      asChild = false,
      ...props
    }: IButtonProps,
    forwardedRef
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={forwardedRef}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);

Button.displayName = "Button";
