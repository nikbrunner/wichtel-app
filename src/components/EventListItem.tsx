import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Paper, Stack, Group, Text, Button, Collapse, Divider } from "@mantine/core";
import { EventDateBadge } from "./EventDateBadge";
import { ParticipantLinkTable } from "./ParticipantLinkTable";
import type { EventWithStats } from "../types/database";

type EventListItemProps = {
  event: EventWithStats;
};

export function EventListItem({ event }: EventListItemProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Paper p="lg" withBorder shadow="sm">
      <Stack gap="sm">
        {/* Event Header */}
        <Group justify="space-between" wrap="nowrap">
          <div style={{ flex: 1 }}>
            <Group gap="sm" mb={4}>
              <Text fw={700} size="lg">
                {event.name}
              </Text>
              <EventDateBadge
                eventDate={event.event_date}
                daysUntil={event.days_until_event}
                isPast={event.is_past}
              />
            </Group>
            <Text size="sm" c="dimmed">
              {new Date(event.event_date).toLocaleDateString("de-DE", {
                day: "2-digit",
                month: "long",
                year: "numeric"
              })}
              {event.days_until_event !== null && (
                <> • {event.days_until_event} Tage bis Event</>
              )}
            </Text>
          </div>
        </Group>

        {/* Stats */}
        <Group gap="lg">
          <div>
            <Text size="xs" c="dimmed">
              Teilnehmer
            </Text>
            <Text fw={600}>{event.participant_count}</Text>
          </div>
          <div>
            <Text size="xs" c="dimmed">
              Gezogen
            </Text>
            <Text fw={600}>
              {event.drawn_count} / {event.participant_count}
            </Text>
          </div>
        </Group>

        {/* Action Buttons */}
        <Group gap="sm" mt="sm">
          <Button
            component={Link}
            to={`/admin/${event.slug}`}
            variant="light"
            size="sm"
          >
            Event verwalten
          </Button>
          <Button variant="subtle" size="sm" onClick={() => setExpanded(!expanded)}>
            {expanded ? "Weniger anzeigen" : "Teilnehmer-Links anzeigen"}
          </Button>
        </Group>

        {/* Collapsible Participant Details */}
        <Collapse in={expanded}>
          <Divider my="md" />
          <Stack gap="md">
            <Text size="sm" fw={600}>
              Teilnehmer-Links
            </Text>
            <ParticipantLinkTable
              eventSlug={event.slug}
              participants={event.participants}
            />
          </Stack>
        </Collapse>
      </Stack>
    </Paper>
  );
}
