import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
  Stack,
  Title,
  Button,
  Group,
  Text,
  Paper,
  Badge,
  Divider
} from "@mantine/core";
import { getAdminEvents } from "../server/getAdminEvents";
import type { EventWithStats } from "../types/database";

export const Route = createFileRoute("/")({
  beforeLoad: ({ context }) => {
    if (!context.user) {
      throw redirect({ to: "/auth/login" });
    }
  },
  loader: async () => {
    const events = await getAdminEvents();
    return { events };
  },
  component: Component
});

function Component() {
  const { events } = Route.useLoaderData();

  // Split events into running (future) and past
  const runningEvents = events.filter(e => !e.is_past);
  const pastEvents = events.filter(e => e.is_past);

  return (
    <Stack gap="xl" p="xl">
      {/* Header with New Event Button */}
      <Group justify="space-between" align="center">
        <Title order={1}>Deine Wichtel-Events</Title>
        <Button component={Link} to="/new-event" size="lg">
          + Neues Event
        </Button>
      </Group>

      {/* Running Events Section */}
      <div>
        <Title order={2} size="h3" mb="md">
          Aktuelle Events
        </Title>
        {runningEvents.length === 0 ? (
          <Paper p="xl" withBorder>
            <Text c="dimmed" ta="center">
              Keine aktuellen Events. Erstelle ein neues Event!
            </Text>
          </Paper>
        ) : (
          <Stack gap="md">
            {runningEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </Stack>
        )}
      </div>

      {/* Divider */}
      {pastEvents.length > 0 && <Divider />}

      {/* Past Events Section */}
      {pastEvents.length > 0 && (
        <div>
          <Title order={2} size="h3" mb="md">
            Vergangene Events
          </Title>
          <Stack gap="md">
            {pastEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </Stack>
        </div>
      )}
    </Stack>
  );
}

function EventCard({ event }: { event: EventWithStats }) {
  return (
    <Paper p="lg" withBorder shadow="sm">
      <Stack gap="sm">
        <Group justify="space-between">
          <div>
            <Group gap="sm">
              <Text fw={700} size="lg">
                {event.name}
              </Text>
              {event.is_past && <Badge color="gray">Vergangen</Badge>}
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

        <Group gap="sm" mt="sm">
          <Button
            component={Link}
            to={`/admin/${event.slug}`}
            variant="light"
            size="sm"
          >
            Event verwalten
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}
