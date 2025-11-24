import { Badge } from "@mantine/core";

type EventDateBadgeProps = {
  eventDate: string;
  daysUntil: number | null;
  isPast: boolean;
};

export function EventDateBadge({
  eventDate,
  daysUntil,
  isPast
}: EventDateBadgeProps) {
  if (isPast) {
    return (
      <Badge color="gray" variant="light">
        Vergangen
      </Badge>
    );
  }

  if (daysUntil === 0) {
    return (
      <Badge color="orange" variant="filled">
        Heute!
      </Badge>
    );
  }

  if (daysUntil !== null && daysUntil <= 7) {
    return (
      <Badge color="yellow" variant="filled">
        in {daysUntil} {daysUntil === 1 ? "Tag" : "Tagen"}
      </Badge>
    );
  }

  return (
    <Badge color="blue" variant="light">
      in {daysUntil} Tagen
    </Badge>
  );
}
