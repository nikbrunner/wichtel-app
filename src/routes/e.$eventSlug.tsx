import { createFileRoute, useSearch } from "@tanstack/react-router";
import { Stack, Title, Text, Button, Paper, Alert } from "@mantine/core";
import { useState } from "react";
import { getParticipantInfo } from "../server/getParticipantInfo";
import { drawName } from "../server/drawName";

export const Route = createFileRoute("/e/$eventSlug")({
  component: ParticipantDraw,
  validateSearch: search => {
    const token = search?.token as string;
    if (!token) {
      throw new Error("Participant token is required");
    }
    return { token };
  },
  loaderDeps: ({ search }) => ({ token: search.token }),
  loader: async ({ deps }) => {
    try {
      const info = await getParticipantInfo({
        data: {
          participantToken: deps.token
        }
      });
      return info;
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : "Fehler beim Laden der Teilnehmer-Daten"
      );
    }
  }
});

function ParticipantDraw() {
  const participantInfo = Route.useLoaderData();
  const search = useSearch({ from: "/e/$eventSlug" });
  const token = search?.token || "";

  const [isDrawing, setIsDrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drawnName, setDrawnName] = useState<string | null>(
    participantInfo.drawnName
  );

  const handleDraw = async () => {
    setError(null);
    setIsDrawing(true);

    try {
      const result = await drawName({
        data: {
          participantToken: token
        }
      });

      setDrawnName(result.drawnName);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Ziehen des Namens");
    } finally {
      setIsDrawing(false);
    }
  };

  if (drawnName) {
    return (
      <Stack p="xl" gap="lg" maw={600} mx="auto" align="center">
        <Title order={1} ta="center">
          🎁 Hallo {participantInfo.participantName}!
        </Title>

        <Paper p="xl" withBorder w="100%">
          <Stack gap="md" align="center">
            <Text size="lg" fw={500}>
              Du beschenkst:
            </Text>
            <Title order={2} c="green" ta="center">
              🎄 {drawnName} 🎄
            </Title>
          </Stack>
        </Paper>

        <Text size="sm" c="dimmed" ta="center">
          Merke dir diesen Namen gut! Du kannst diese Seite jederzeit wieder
          aufrufen.
        </Text>
      </Stack>
    );
  }

  return (
    <Stack p="xl" gap="lg" maw={600} mx="auto" align="center">
      <Title order={1} ta="center">
        🎁 Hallo {participantInfo.participantName}!
      </Title>

      <Text ta="center" size="lg">
        Klicke auf den Button unten, um zu erfahren, wen du beschenkst.
      </Text>

      {error && (
        <Alert color="red" title="Fehler" w="100%">
          {error}
        </Alert>
      )}

      <Button onClick={handleDraw} loading={isDrawing} size="xl" fullWidth maw={400}>
        🎄 Namen ziehen 🎄
      </Button>

      <Text size="xs" c="dimmed" ta="center">
        Du ziehst zufällig einen Namen aus den verbleibenden Teilnehmern
      </Text>
    </Stack>
  );
}
