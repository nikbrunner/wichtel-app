import {
  createFileRoute,
  Link,
  redirect,
  ErrorComponentProps
} from "@tanstack/react-router";
import { Button } from "@/components/retroui/Button";
import { Card } from "@/components/retroui/Card";
import { Alert, AlertTitle, AlertDescription } from "@/components/retroui/Alert";
import { getAdminEvents } from "../server/getAdminEvents";
import { EventListItem } from "../components/EventListItem";
import { EventListSkeleton } from "../components/EventListSkeleton";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: ({ context }) => {
    if (!context.user) {
      throw redirect({ to: "/" });
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
    <div className="flex flex-col gap-8 sm:gap-12">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl sm:text-5xl font-black">Deine Wichtel-Events</h1>
        <Button asChild size="sm" className="sm:hidden">
          <Link to="/new-event">+ Event</Link>
        </Button>
        <Button asChild className="hidden sm:flex">
          <Link to="/new-event">+ Neues Event</Link>
        </Button>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Aktuelle Events</h2>
        <EventListSkeleton />
      </div>
    </div>
  );
}

function ErrorComponent({ error }: ErrorComponentProps) {
  return (
    <div className="flex flex-col gap-8 sm:gap-12">
      <h1 className="text-4xl sm:text-5xl font-black">
        Fehler beim Laden der Events
      </h1>
      <Alert variant="danger">
        <AlertTitle>Es ist ein Fehler aufgetreten</AlertTitle>
        <AlertDescription>
          {error.message || "Unbekannter Fehler beim Laden der Events"}
        </AlertDescription>
      </Alert>
      <Button asChild variant="outline">
        <Link to="/dashboard">Erneut versuchen</Link>
      </Button>
    </div>
  );
}

function Component() {
  const { events } = Route.useLoaderData();

  // Split events into running (future) and past
  const runningEvents = events.filter(e => !e.is_past);
  const pastEvents = events.filter(e => e.is_past);

  return (
    <div className="flex flex-col gap-8 sm:gap-12">
      {/* Header with New Event Button */}
      <div className="flex justify-between items-center">
        <h1 className="text-4xl sm:text-5xl font-black">Deine Wichtel-Events</h1>
        <Button asChild size="sm" className="sm:hidden">
          <Link to="/new-event">+ Event</Link>
        </Button>
        <Button asChild className="hidden sm:flex">
          <Link to="/new-event">+ Neues Event</Link>
        </Button>
      </div>

      {/* Running Events Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Aktuelle Events</h2>
        {runningEvents.length === 0 ? (
          <Card className="p-6">
            <p className="text-muted-foreground text-center">
              Keine aktuellen Events. Erstelle ein neues Event!
            </p>
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            {runningEvents.map(event => (
              <EventListItem key={event.id} evt={event} />
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      {pastEvents.length > 0 && <hr className="border-t-2 border-border" />}

      {/* Past Events Section */}
      {pastEvents.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Vergangene Events</h2>
          <div className="flex flex-col gap-4">
            {pastEvents.map(event => (
              <EventListItem key={event.id} evt={event} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
