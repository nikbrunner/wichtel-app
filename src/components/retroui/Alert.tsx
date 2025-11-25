import { HtmlHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Text } from "@/components/retroui/Text";

const alertVariants = cva("relative w-full rounded-lg border-2 p-4", {
  variants: {
    variant: {
      default: "bg-card text-foreground shadow-md [&_svg]:shrink-0",
      solid: "bg-black text-white shadow-md",
      danger:
        "bg-destructive/20 text-destructive border-destructive shadow-destructive",
      success: "bg-success/20 text-success border-success shadow-success",
      warning: "bg-warning/20 text-warning border-warning shadow-warning",
      info: "bg-info/20 text-info border-info shadow-info"
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
  <div className={cn("text-muted-foreground", className)} {...props} />
);

AlertDescription.displayName = "AlertDescription";

const AlertComponent = Object.assign(Alert, {
  Title: AlertTitle,
  Description: AlertDescription
});

export { AlertComponent as Alert, AlertTitle, AlertDescription };
