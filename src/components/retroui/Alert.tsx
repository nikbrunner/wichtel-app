import { HtmlHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Text } from "@/components/retroui/Text";

const alertVariants = cva("relative w-full rounded-lg border-2 border-border p-4", {
  variants: {
    variant: {
      default: "bg-card text-foreground shadow-md [&_svg]:shrink-0",
      solid: "bg-foreground text-background shadow-md",
      danger: "bg-destructive text-destructive-foreground shadow-destructive",
      success: "bg-success text-success-foreground shadow-success",
      warning: "bg-warning text-warning-foreground shadow-warning",
      info: "bg-info text-info-foreground shadow-info",
      pink: "bg-pink text-pink-foreground shadow-pink"
    }
  },
  defaultVariants: {
    variant: "default"
  }
});

interface IAlertProps
  extends HtmlHTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {}

const Alert = ({ className, variant, ...props }: IAlertProps) => (
  <div
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
);
Alert.displayName = "Alert";

type IAlertTitleProps = HtmlHTMLAttributes<HTMLHeadingElement>;
const AlertTitle = ({ className, ...props }: IAlertTitleProps) => (
  <Text as="h5" className={cn(className)} {...props} />
);
AlertTitle.displayName = "AlertTitle";

type IAlertDescriptionProps = HtmlHTMLAttributes<HTMLParagraphElement>;
const AlertDescription = ({ className, ...props }: IAlertDescriptionProps) => (
  <div className={cn("opacity-90", className)} {...props} />
);

AlertDescription.displayName = "AlertDescription";

const AlertComponent = Object.assign(Alert, {
  Title: AlertTitle,
  Description: AlertDescription
});

export { AlertComponent as Alert, AlertTitle, AlertDescription };
