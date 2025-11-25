import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import { HTMLAttributes } from "react";
import { Text } from "@/components/retroui/Text";

const cardVariants = cva(
  "inline-block border-2 rounded-lg transition-all hover:shadow-none bg-card",
  {
    variants: {
      variant: {
        default: "shadow-md",
        primary: "shadow-primary border-primary",
        success: "shadow-success border-success",
        info: "shadow-info border-info",
        warning: "shadow-warning border-warning",
        pink: "shadow-pink border-pink",
        destructive: "shadow-destructive border-destructive"
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
