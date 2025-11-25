import { cn } from "@/lib/utils";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { cva, VariantProps } from "class-variance-authority";
import { Check } from "lucide-react";

const checkboxVariants = cva("border-2 border-border rounded-lg shadow-sm bg-card", {
  variants: {
    variant: {
      default:
        "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:shadow-primary-sm",
      success:
        "data-[state=checked]:bg-success data-[state=checked]:text-success-foreground data-[state=checked]:shadow-success-sm",
      info: "data-[state=checked]:bg-info data-[state=checked]:text-info-foreground data-[state=checked]:shadow-info-sm",
      pink: "data-[state=checked]:bg-pink data-[state=checked]:text-pink-foreground data-[state=checked]:shadow-pink-sm",
      destructive:
        "data-[state=checked]:bg-destructive data-[state=checked]:text-destructive-foreground data-[state=checked]:shadow-destructive-sm",
      solid:
        "data-[state=checked]:bg-foreground data-[state=checked]:text-background"
    },
    size: {
      sm: "h-4 w-4",
      md: "h-5 w-5",
      lg: "h-6 w-6"
    }
  },
  defaultVariants: {
    variant: "default",
    size: "md"
  }
});

interface CheckboxProps
  extends React.ComponentProps<typeof CheckboxPrimitive.Root>,
    VariantProps<typeof checkboxVariants> {}

export const Checkbox = ({ className, size, variant, ...props }: CheckboxProps) => (
  <CheckboxPrimitive.Root
    className={cn(
      checkboxVariants({
        size,
        variant
      }),
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="h-full w-full">
      <Check className="h-full w-full" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
);
