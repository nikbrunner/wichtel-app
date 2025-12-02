import { useState } from "react";
import { useRouter, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/retroui/Button";
import { Card } from "@/components/retroui/Card";
import { Alert, AlertTitle, AlertDescription } from "@/components/retroui/Alert";
import { EventDateBadge } from "./EventDateBadge";
import { ParticipantLinkTable } from "./ParticipantLinkTable";
import { DrawResultsSection } from "./DrawResultsSection";
import { CopyAllLinksButton } from "./CopyAllLinksButton";
import { RegenerateLinkModal } from "./RegenerateLinkModal";
import { DeleteEventModal } from "./DeleteEventModal";
import { DeleteParticipantModal } from "./DeleteParticipantModal";
import { AddParticipantModal } from "./AddParticipantModal";
import { regenerateParticipantLink } from "../server/regenerateParticipantLink";
import { deleteEvent } from "../server/deleteEvent";
import { deleteParticipant } from "../server/deleteParticipant";
import { addParticipant } from "../server/addParticipant";
import { lockEvent } from "../server/lockEvent";
import type { EventWithStats } from "../types/database";

type EventListItemProps = {
  event: EventWithStats;
};

export function EventListItem({ event }: EventListItemProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [regenerating, setRegenerating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Regenerate link modal state
  const [regenerateModalOpened, setRegenerateModalOpened] = useState(false);
  const [selectedForRegenerate, setSelectedForRegenerate] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Delete event modal state
  const [deleteEventModalOpened, setDeleteEventModalOpened] = useState(false);
  const [deletingEvent, setDeletingEvent] = useState(false);

  // Delete participant modal state
  const [deleteParticipantModalOpened, setDeleteParticipantModalOpened] =
    useState(false);
  const [selectedForDeletion, setSelectedForDeletion] = useState<{
    id: string;
    name: string;
    hasDraws: boolean;
  } | null>(null);
  const [deletingParticipant, setDeletingParticipant] = useState<string | null>(
    null
  );

  // Add participant modal state
  const [addParticipantModalOpened, setAddParticipantModalOpened] = useState(false);
  const [addingParticipant, setAddingParticipant] = useState(false);
  const [addParticipantError, setAddParticipantError] = useState<string | null>(
    null
  );

  // Lock event state
  const [lockingEvent, setLockingEvent] = useState(false);

  // Can only add participants if no draws have been made
  const canAddParticipants = event.drawn_count === 0;

  // Check if event is in interests phase (lock_date is in the future)
  const isInInterestsPhase =
    event.lock_date && new Date(event.lock_date) > new Date();

  // Regenerate link handlers
  const handleRegenerateClick = (participantId: string, participantName: string) => {
    setSelectedForRegenerate({ id: participantId, name: participantName });
    setRegenerateModalOpened(true);
  };

  const handleRegenerateConfirm = async () => {
    if (!selectedForRegenerate) return;

    setError(null);
    setRegenerating(selectedForRegenerate.id);

    try {
      await regenerateParticipantLink({
        data: {
          eventSlug: event.slug,
          participantId: selectedForRegenerate.id
        }
      });

      toast.success(
        `Link für ${selectedForRegenerate.name} wurde erfolgreich regeneriert.`
      );
      setRegenerateModalOpened(false);
      router.invalidate();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Fehler beim Regenerieren des Links"
      );
    } finally {
      setRegenerating(null);
      setSelectedForRegenerate(null);
    }
  };

  // Delete event handlers
  const handleDeleteEventConfirm = async () => {
    setError(null);
    setDeletingEvent(true);

    try {
      await deleteEvent({ data: { eventId: event.id } });
      setDeleteEventModalOpened(false);
      router.invalidate();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Fehler beim Löschen des Events"
      );
    } finally {
      setDeletingEvent(false);
    }
  };

  // Delete participant handlers
  const handleDeleteParticipantClick = (
    participantId: string,
    participantName: string
  ) => {
    const participant = event.participants.find(p => p.id === participantId);
    const hasDraws = participant?.has_drawn ?? false;
    setSelectedForDeletion({ id: participantId, name: participantName, hasDraws });
    setDeleteParticipantModalOpened(true);
  };

  const handleDeleteParticipantConfirm = async () => {
    if (!selectedForDeletion) return;

    setError(null);
    setDeletingParticipant(selectedForDeletion.id);

    try {
      await deleteParticipant({
        data: { eventId: event.id, participantId: selectedForDeletion.id }
      });
      toast.success(`${selectedForDeletion.name} wurde entfernt.`);
      setDeleteParticipantModalOpened(false);
      setSelectedForDeletion(null);
      router.invalidate();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Fehler beim Löschen des Teilnehmers"
      );
    } finally {
      setDeletingParticipant(null);
    }
  };

  // Add participant handlers
  const handleAddParticipantConfirm = async (name: string) => {
    setAddParticipantError(null);
    setAddingParticipant(true);

    try {
      await addParticipant({ data: { eventId: event.id, participantName: name } });
      toast.success(`${name} wurde hinzugefügt.`);
      setAddParticipantModalOpened(false);
      router.invalidate();
    } catch (err) {
      setAddParticipantError(
        err instanceof Error ? err.message : "Fehler beim Hinzufügen"
      );
    } finally {
      setAddingParticipant(false);
    }
  };

  // Lock event handler (transition to draw phase)
  const handleLockEvent = async () => {
    setError(null);
    setLockingEvent(true);

    try {
      await lockEvent({ data: { eventId: event.id } });
      toast.success("Ziehen ist jetzt freigeschaltet!");
      router.invalidate();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Fehler beim Sperren des Events"
      );
    } finally {
      setLockingEvent(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col gap-4">
        {/* Event Header - 3 column grid on desktop, stacked on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 md:items-start">
          {/* Name Column */}
          <div>
            <div className="flex items-center gap-8 mb-4">
              <Link
                to="/e/$eventSlug"
                params={{ eventSlug: event.slug }}
                className="text-2xl font-bold hover:underline"
              >
                {event.name}
              </Link>
              <EventDateBadge
                eventDate={event.event_date}
                daysUntil={event.days_until_event}
                isPast={event.is_past}
              />
            </div>
            <p className="text-xs text-muted-foreground font-mono">
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

          {/* Stats Column */}
          <div className="flex gap-6">
            <div>
              <span className="text-xs text-muted-foreground">Teilnehmer</span>
              <p className="text-sm font-medium font-mono">
                {event.participant_count}
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Gezogen</span>
              <p className="text-sm font-medium font-mono">
                {event.drawn_count} / {event.participant_count}
              </p>
            </div>
          </div>

          {/* Actions Column */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={expanded ? "outline" : "info"}
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? "Weniger anzeigen" : "Teilnehmer-Links anzeigen"}
            </Button>
          </div>

          <div className="flex gap-2 justify-self-end">
            {isInInterestsPhase && (
              <Button
                size="sm"
                variant="success"
                onClick={handleLockEvent}
                disabled={lockingEvent}
              >
                {lockingEvent ? "..." : "Ziehen freischalten"}
              </Button>
            )}
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setDeleteEventModalOpened(true)}
            >
              Löschen
            </Button>
          </div>
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
              <span className="text-xl font-semibold">Teilnehmer-Links</span>
              <ParticipantLinkTable
                eventSlug={event.slug}
                participants={event.participants}
                onRegenerateLink={handleRegenerateClick}
                regeneratingId={regenerating}
                onDeleteParticipant={handleDeleteParticipantClick}
                deletingId={deletingParticipant}
                canAddParticipants={canAddParticipants}
                onAddParticipant={() => setAddParticipantModalOpened(true)}
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
      {/* Regenerate Link Modal */}
      <RegenerateLinkModal
        opened={regenerateModalOpened}
        onClose={() => {
          setRegenerateModalOpened(false);
          setSelectedForRegenerate(null);
        }}
        onConfirm={handleRegenerateConfirm}
        participantName={selectedForRegenerate?.name ?? ""}
        isLoading={regenerating !== null}
      />

      {/* Delete Event Modal */}
      <DeleteEventModal
        opened={deleteEventModalOpened}
        onClose={() => setDeleteEventModalOpened(false)}
        onConfirm={handleDeleteEventConfirm}
        eventName={event.name}
        participantCount={event.participant_count}
        isLoading={deletingEvent}
      />

      {/* Delete Participant Modal */}
      <DeleteParticipantModal
        opened={deleteParticipantModalOpened}
        onClose={() => {
          setDeleteParticipantModalOpened(false);
          setSelectedForDeletion(null);
        }}
        onConfirm={handleDeleteParticipantConfirm}
        participantName={selectedForDeletion?.name ?? ""}
        hasDraws={selectedForDeletion?.hasDraws ?? false}
        isLoading={deletingParticipant !== null}
      />

      {/* Add Participant Modal */}
      <AddParticipantModal
        opened={addParticipantModalOpened}
        onClose={() => {
          setAddParticipantModalOpened(false);
          setAddParticipantError(null);
        }}
        onConfirm={handleAddParticipantConfirm}
        isLoading={addingParticipant}
        error={addParticipantError}
      />
    </Card>
  );
}
