import { useState } from "react";
import { Button } from "@/components/retroui/Button";
import { Card } from "@/components/retroui/Card";
import { Alert, AlertTitle, AlertDescription } from "@/components/retroui/Alert";
import { EventDateBadge } from "./EventDateBadge";
import { ParticipantLinkTable } from "./ParticipantLinkTable";
import { DrawResultsSection } from "./DrawResultsSection";
import { CopyAllLinksButton } from "./CopyAllLinksButton";
import { RegenerateLinkModal } from "./RegenerateLinkModal";
import { regenerateParticipantLink } from "../server/regenerateParticipantLink";
import type { EventWithStats } from "../types/database";

type EventListItemProps = {
  event: EventWithStats;
};

export function EventListItem({ event }: EventListItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [regenerating, setRegenerating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleRegenerateClick = (participantId: string, participantName: string) => {
    setSelectedParticipant({ id: participantId, name: participantName });
    setModalOpened(true);
  };

  const handleRegenerateConfirm = async () => {
    if (!selectedParticipant) return;

    setError(null);
    setSuccessMessage(null);
    setRegenerating(selectedParticipant.id);

    try {
      await regenerateParticipantLink({
        data: {
          eventSlug: event.slug,
          participantId: selectedParticipant.id
        }
      });

      setSuccessMessage(
        `Link für ${selectedParticipant.name} wurde erfolgreich regeneriert. Bitte die Seite neu laden, um den neuen Link zu sehen.`
      );
      setModalOpened(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Fehler beim Regenerieren des Links"
      );
    } finally {
      setRegenerating(null);
      setSelectedParticipant(null);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col gap-3">
        {/* Event Header */}
        <div className="flex justify-between flex-nowrap">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-head text-lg">{event.name}</span>
              <EventDateBadge
                eventDate={event.event_date}
                daysUntil={event.days_until_event}
                isPast={event.is_past}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {new Date(event.event_date).toLocaleDateString("de-DE", {
                day: "2-digit",
                month: "long",
                year: "numeric"
              })}
              {event.days_until_event !== null && (
                <> · {event.days_until_event} Tage bis Event</>
              )}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-6">
          <div>
            <span className="text-xs text-muted-foreground">Teilnehmer</span>
            <p className="font-semibold">{event.participant_count}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Gezogen</span>
            <p className="font-semibold">
              {event.drawn_count} / {event.participant_count}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-2">
          <Button size="sm" onClick={() => setExpanded(!expanded)}>
            {expanded ? "Weniger anzeigen" : "Teilnehmer-Links anzeigen"}
          </Button>
        </div>

        {/* Collapsible Participant Details */}
        {expanded && (
          <>
            <hr className="border-t-2 border-border my-4" />
            <div className="flex flex-col gap-4">
              {error && (
                <Alert variant="danger">
                  <AlertTitle>Fehler</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                  <button
                    onClick={() => setError(null)}
                    className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
                  >
                    ×
                  </button>
                </Alert>
              )}
              {successMessage && (
                <Alert variant="success">
                  <AlertTitle>Erfolg</AlertTitle>
                  <AlertDescription>{successMessage}</AlertDescription>
                  <button
                    onClick={() => setSuccessMessage(null)}
                    className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
                  >
                    ×
                  </button>
                </Alert>
              )}
              <span className="text-sm font-semibold">Teilnehmer-Links</span>
              <ParticipantLinkTable
                eventSlug={event.slug}
                participants={event.participants}
                onRegenerateLink={handleRegenerateClick}
                regeneratingId={regenerating}
              />
              <CopyAllLinksButton
                eventName={event.name}
                eventSlug={event.slug}
                participants={event.participants}
              />
              <hr className="border-t-2 border-border my-4" />
              <DrawResultsSection
                eventDate={event.event_date}
                isPast={event.is_past}
                drawResults={event.draw_results}
              />
            </div>
          </>
        )}
      </div>
      <RegenerateLinkModal
        opened={modalOpened}
        onClose={() => {
          setModalOpened(false);
          setSelectedParticipant(null);
        }}
        onConfirm={handleRegenerateConfirm}
        participantName={selectedParticipant?.name || ""}
        isLoading={regenerating !== null}
      />
    </Card>
  );
}
