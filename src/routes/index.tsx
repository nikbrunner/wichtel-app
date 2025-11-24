import {
  createFileRoute,
  Link,
  redirect,
  ErrorComponentProps
} from "@tanstack/react-router";
import {
  Stack,
  Title,
  Button,
  Group,
  Text,
  Paper,
  Divider,
  Alert
} from "@mantine/core";
import { getAdminEvents } from "../server/getAdminEvents";
import { EventListItem } from "../components/EventListItem";
import { EventListSkeleton } from "../components/EventListSkeleton";

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
  component: Component,
  pendingComponent: PendingComponent,
  errorComponent: ErrorComponent
});

function PendingComponent() {
  return (
    <Stack gap={{ base: "md", sm: "xl" }} p={{ base: "xs", sm: "xl" }}>
      <Group justify="space-between" align="center">
        <Title order={1}>Deine Wichtel-Events</Title>
        <Button component={Link} to="/new-event" size="md" visibleFrom="sm">
          + Neues Event
        </Button>
        <Button component={Link} to="/new-event" size="xs" hiddenFrom="sm">
          + Event
        </Button>
      </Group>

      <div>
        <Title order={2} size="h3" mb="md">
          Aktuelle Events
        </Title>
        <EventListSkeleton />
      </div>
    </Stack>
  );
}

function ErrorComponent({ error }: ErrorComponentProps) {
  return (
    <Stack gap={{ base: "md", sm: "xl" }} p={{ base: "xs", sm: "xl" }}>
      <Title order={1}>Fehler beim Laden der Events</Title>
      <Alert color="red" title="Es ist ein Fehler aufgetreten">
        <Text>{error.message || "Unbekannter Fehler beim Laden der Events"}</Text>
        <Button component={Link} to="/" mt="md" variant="light">
          Erneut versuchen
        </Button>
      </Alert>
    </Stack>
  );
}

function Component() {
  const { events } = Route.useLoaderData();

  // Split events into running (future) and past
  const runningEvents = events.filter(e => !e.is_past);
  const pastEvents = events.filter(e => e.is_past);

  return (
    <Stack gap={{ base: "md", sm: "xl" }} p={{ base: "xs", sm: "xl" }}>
      {/* Header with New Event Button */}
      <Group justify="space-between" align="center">
        <Title order={1}>Deine Wichtel-Events</Title>
        <Button component={Link} to="/new-event" size="md" visibleFrom="sm">
          + Neues Event
        </Button>
        <Button component={Link} to="/new-event" size="xs" hiddenFrom="sm">
          + Event
        </Button>
      </Group>

      {/* Running Events Section */}
      <div>
        <Title order={2} size="h3" mb="md">
          Aktuelle Events
        </Title>
        {runningEvents.length === 0 ? (
          <Paper p={{ base: "md", sm: "xl" }} withBorder>
            <Text c="dimmed" ta="center">
              Keine aktuellen Events. Erstelle ein neues Event!
            </Text>
          </Paper>
        ) : (
          <Stack gap="md">
            {runningEvents.map(event => (
              <EventListItem key={event.id} event={event} />
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
              <EventListItem key={event.id} event={event} />
            ))}
          </Stack>
        </div>
      )}
    </Stack>
  );
}
