import { cn } from "~/lib/utils";
import { cva, VariantProps } from "class-variance-authority";

const logoVariants = cva("", {
  variants: {
    size: {
      "s": "h-8 w-8",
      "sm": "h-10 w-10",
      "md": "h-16 w-16",
      "lg": "h-24 w-24",
      "xl": "h-32 w-32",
      "2xl": "h-48 w-48",
      "3xl": "h-56 w-56",
      "4xl": "h-64 w-64",
      "5xl": "h-72 w-72"
    }
  },
  defaultVariants: {
    size: "sm"
  }
});

// Stroke widths scale inversely with size (smaller = thicker strokes)
const strokeWidths: Record<NonNullable<Props["size"]>, number> = {
  "s": 24,
  "sm": 24,
  "md": 18,
  "lg": 14,
  "xl": 11,
  "2xl": 9,
  "3xl": 7,
  "4xl": 7,
  "5xl": 7
};

type Props = {
  className?: string;
} & VariantProps<typeof logoVariants>;

export function Logo({ size = "md", className }: Props) {
  const strokeWidth = strokeWidths[size ?? "md"];

  return (
    <svg
      viewBox="0 0 375 375"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(logoVariants({ size }), className)}
      aria-label="Wichtel-App"
      role="img"
    >
      {/* Face */}
      <circle
        cx="182"
        cy="257"
        r="63"
        fill="#F7F3DF"
        stroke="#b8b09a"
        strokeWidth={strokeWidth}
      />
      {/* Hat */}
      <path
        d="M166.466 51.2827C171.576 37.2494 191.424 37.2493 196.534 51.2826L260.209 226.13C264.547 238.042 253.935 250.231 241.451 248.03C223.505 244.865 200.495 241.555 182.5 241.5C163.872 241.443 139.975 244.842 121.522 248.073C109.044 250.258 98.4419 238.072 102.777 226.169L166.466 51.2827Z"
        fill="#19835E"
        stroke="#0f5a3d"
        strokeWidth={strokeWidth}
      />
      {/* Smile */}
      <path
        d="M164 278C164 278 171 284.72 179.5 287C200 292.5 200.5 278 200.5 278"
        stroke="#424031"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
}
