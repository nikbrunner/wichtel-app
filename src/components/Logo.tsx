import { cn } from "~/lib/utils";

type LogoProps = {
  className?: string;
};

export function Logo({ className }: LogoProps) {
  return (
    <img src="/logo.svg" alt="Wichtel-App" className={cn("h-8 w-8", className)} />
  );
}
