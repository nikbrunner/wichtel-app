import {
  createFileRoute,
  redirect,
  Link,
  ErrorComponentProps
} from "@tanstack/react-router";
import { Button } from "@/components/retroui/Button";
import { Alert, AlertTitle, AlertDescription } from "@/components/retroui/Alert";
import { EventListItem } from "@/components/EventListItem";
import { getEventBySlug } from "../server/getEventBySlug";

export const Route = createFileRoute("/e/$eventSlug")({
  beforeLoad: ({ context }) => {
    if (!context.user) {
      throw redirect({ to: "/" });
    }
  },
  loader: async ({ params }) => {
    const event = await getEventBySlug({
      data: { slug: params.eventSlug }
    });
    return { event };
  },
  component: EventDetailPage,
  errorComponent: ErrorComponent
});

function ErrorComponent({ error }: ErrorComponentProps) {
  return (
    <div className="flex flex-col gap-8 max-w-3xl mx-auto p-4 sm:p-6 md:p-8">
      <h1 className="text-4xl sm:text-5xl font-black">Event nicht gefunden</h1>
      <Alert variant="danger">
        <AlertTitle>Fehler</AlertTitle>
        <AlertDescription>
          {error.message || "Das Event konnte nicht gefunden werden."}
        </AlertDescription>
      </Alert>
      <Button asChild variant="outline">
        <Link to="/dashboard">Zurück zum Dashboard</Link>
      </Button>
    </div>
  );
}

function EventDetailPage() {
  const { event } = Route.useLoaderData();

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="sm">
          <Link to="/dashboard">← Zurück</Link>
        </Button>
        <h1 className="text-2xl font-black">{event.name}</h1>
      </div>

      <EventListItem initiallyExpanded evt={event} />
    </div>
  );
}
