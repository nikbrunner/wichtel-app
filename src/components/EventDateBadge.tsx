import { Badge } from "@/components/retroui/Badge";

type EventDateBadgeProps = {
  eventDate: string;
  daysUntil: number | null;
  isPast: boolean;
};

export function EventDateBadge({ daysUntil, isPast }: EventDateBadgeProps) {
  if (isPast) {
    return (
      <Badge variant="default" className="bg-muted text-muted-foreground">
        Vergangen
      </Badge>
    );
  }

  if (daysUntil === 0) {
    return (
      <Badge variant="solid" className="bg-orange-500">
        Heute!
      </Badge>
    );
  }

  if (daysUntil !== null && daysUntil <= 7) {
    return (
      <Badge variant="solid" className="bg-yellow-500 text-black">
        in {daysUntil} {daysUntil === 1 ? "Tag" : "Tagen"}
      </Badge>
    );
  }

  return <Badge variant="outline">in {daysUntil} Tagen</Badge>;
}
