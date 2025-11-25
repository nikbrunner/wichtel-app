import { Badge } from "@/components/retroui/Badge";

type EventDateBadgeProps = {
  eventDate: string;
  daysUntil: number | null;
  isPast: boolean;
};

export function EventDateBadge({ daysUntil, isPast }: EventDateBadgeProps) {
  if (isPast) {
    return <Badge variant="default">Vergangen</Badge>;
  }

  if (daysUntil === 0) {
    return <Badge variant="warning">Heute!</Badge>;
  }

  if (daysUntil !== null && daysUntil <= 7) {
    return (
      <Badge variant="primary">
        in {daysUntil} {daysUntil === 1 ? "Tag" : "Tagen"}
      </Badge>
    );
  }

  return <Badge variant="warning">in {daysUntil} Tagen</Badge>;
}
