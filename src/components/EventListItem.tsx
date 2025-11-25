import { useState } from "react";
import {
  Paper,
  Stack,
  Group,
  Text,
  Button,
  Collapse,
  Divider,
  Alert
} from "@mantine/core";
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
          <Button variant="filled" size="sm" onClick={() => setExpanded(!expanded)}>
            {expanded ? "Weniger anzeigen" : "Teilnehmer-Links anzeigen"}
          </Button>
        </Group>

        {/* Collapsible Participant Details */}
        <Collapse in={expanded}>
          <Divider my="md" />
          <Stack gap="md">
            {error && (
              <Alert
                color="red"
                title="Fehler"
                withCloseButton
                onClose={() => setError(null)}
              >
                {error}
              </Alert>
            )}
            {successMessage && (
              <Alert
                color="green"
                title="Erfolg"
                withCloseButton
                onClose={() => setSuccessMessage(null)}
              >
                {successMessage}
              </Alert>
            )}
            <Text size="sm" fw={600}>
              Teilnehmer-Links
            </Text>
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
            <Divider my="md" />
            <DrawResultsSection
              eventDate={event.event_date}
              isPast={event.is_past}
              drawResults={event.draw_results}
            />
          </Stack>
        </Collapse>
      </Stack>
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
    </Paper>
  );
}
