import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import { HTMLAttributes } from "react";
import { Text } from "@/components/retroui/Text";

const cardVariants = cva(
  "inline-block border-2 border-border rounded-lg transition-all hover:shadow-none",
  {
    variants: {
      variant: {
        default: "shadow-md bg-card",
        primary: "shadow-primary bg-primary text-primary-foreground",
        success: "shadow-success bg-success text-success-foreground",
        info: "shadow-info bg-info text-info-foreground",
        warning: "shadow-warning bg-warning text-warning-foreground",
        pink: "shadow-pink bg-pink text-pink-foreground",
        destructive: "shadow-destructive bg-destructive text-destructive-foreground",
        muted: "shadow-sm bg-muted text-muted-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

interface ICardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = ({ className, variant, ...props }: ICardProps) => {
  return <div className={cn(cardVariants({ variant }), className)} {...props} />;
};

const CardHeader = ({ className, ...props }: ICardProps) => {
  return (
    <div className={cn("flex flex-col justify-start p-4", className)} {...props} />
  );
};

const CardTitle = ({ className, ...props }: ICardProps) => {
  return <Text as="h3" className={cn("mb-2", className)} {...props} />;
};

const CardDescription = ({ className, ...props }: ICardProps) => (
  <p className={cn("text-muted-foreground", className)} {...props} />
);

const CardContent = ({ className, ...props }: ICardProps) => {
  return <div className={cn("p-4", className)} {...props} />;
};

const CardComponent = Object.assign(Card, {
  Header: CardHeader,
  Title: CardTitle,
  Description: CardDescription,
  Content: CardContent
});

export { CardComponent as Card };
