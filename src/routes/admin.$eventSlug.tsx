import { createFileRoute, useSearch } from "@tanstack/react-router";
import {
  Stack,
  Title,
  Text,
  Paper,
  Table,
  Button,
  Alert,
  Group,
  Badge
} from "@mantine/core";
import { useState } from "react";
import { getEventDetails } from "../server/getEventDetails";
import { regenerateParticipantLink } from "../server/regenerateParticipantLink";

type AdminSearch = {
  token: string;
};

export const Route = createFileRoute("/admin/$eventSlug")({
  component: AdminOverview,
  validateSearch: (search: Record<string, unknown>): AdminSearch => {
    const token = search?.token as string;
    if (!token) {
      throw new Error("Admin token is required");
    }
    return { token };
  },
  loaderDeps: ({ search }) => ({ adminToken: search.token }),
  loader: async ({ params, deps }) => {
    try {
      const details = await getEventDetails({
        data: {
          eventSlug: params.eventSlug,
          adminToken: deps.adminToken
        }
      });
      return details;
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : "Fehler beim Laden der Event-Details"
      );
    }
  }
});

function AdminOverview() {
  const { eventSlug } = Route.useParams();
  const search = useSearch({ from: "/admin/$eventSlug" });
  const token = search?.token || "";
  const eventDetails = Route.useLoaderData();

  const [regenerating, setRegenerating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const drawnCount = eventDetails.participants.filter(p => p.hasDrawn).length;
  const totalCount = eventDetails.participants.length;

  const handleRegenerateLink = async (participantId: string) => {
    setError(null);
    setSuccessMessage(null);
    setRegenerating(participantId);

    try {
      const result = await regenerateParticipantLink({
        data: {
          eventSlug,
          adminToken: token,
          participantId
        }
      });

      setSuccessMessage(
        `Neuer Link generiert! Sende diesen Link an den Teilnehmer:\n${result.newLink}`
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Fehler beim Regenerieren des Links"
      );
    } finally {
      setRegenerating(null);
    }
  };

  return (
    <Stack p="xl" gap="lg" maw={900} mx="auto">
      <div>
        <Title order={1} ta="center">
          🎄 {eventDetails.eventName}
        </Title>
        <Text ta="center" c="dimmed" mt="xs">
          Admin-Übersicht
        </Text>
      </div>

      <Paper p="lg" withBorder>
        <Group justify="space-between" mb="md">
          <Text size="lg" fw={600}>
            Fortschritt
          </Text>
          <Badge
            size="lg"
            variant="filled"
            color={drawnCount === totalCount ? "green" : "blue"}
          >
            {drawnCount} von {totalCount} haben gezogen
          </Badge>
        </Group>

        {successMessage && (
          <Alert
            color="green"
            title="Erfolg"
            mb="md"
            onClose={() => setSuccessMessage(null)}
          >
            {successMessage}
          </Alert>
        )}

        {error && (
          <Alert color="red" title="Fehler" mb="md" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Teilnehmer</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Gezogen am</Table.Th>
              <Table.Th>Aktionen</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {eventDetails.participants.map(participant => (
              <Table.Tr key={participant.id}>
                <Table.Td>
                  <Text fw={500}>{participant.name}</Text>
                </Table.Td>
                <Table.Td>
                  {participant.hasDrawn ? (
                    <Badge color="green" variant="filled">
                      ✓ Gezogen
                    </Badge>
                  ) : (
                    <Badge color="gray" variant="light">
                      ✗ Noch nicht gezogen
                    </Badge>
                  )}
                </Table.Td>
                <Table.Td>
                  {participant.drawnAt
                    ? new Date(participant.drawnAt).toLocaleString("de-DE")
                    : "-"}
                </Table.Td>
                <Table.Td>
                  <Button
                    size="xs"
                    variant="light"
                    color="orange"
                    onClick={() => handleRegenerateLink(participant.id)}
                    loading={regenerating === participant.id}
                    disabled={regenerating !== null}
                  >
                    Link regenerieren
                  </Button>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>

      <Text size="xs" c="dimmed" ta="center">
        💡 Tipp: Verwende &quot;Link regenerieren&quot;, wenn ein Teilnehmer seinen
        Link verloren hat oder neu ziehen möchte
      </Text>
    </Stack>
  );
}
