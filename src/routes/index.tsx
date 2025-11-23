import { createFileRoute } from "@tanstack/react-router";
import {
  Button,
  Stack,
  Title,
  TextInput,
  Text,
  Paper,
  Group,
  ActionIcon,
  CopyButton,
  Tooltip,
  Alert
} from "@mantine/core";
import { useState } from "react";
import { createEvent } from "../server/createEvent";
import type { CreateEventOutput } from "../types/database";

export const Route = createFileRoute("/")({
  component: Home
});

function Home() {
  const [eventName, setEventName] = useState("");
  const [participantNames, setParticipantNames] = useState(["", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreateEventOutput | null>(null);

  const addParticipant = () => {
    setParticipantNames([...participantNames, ""]);
  };

  const removeParticipant = (index: number) => {
    if (participantNames.length > 2) {
      setParticipantNames(participantNames.filter((_, i) => i !== index));
    }
  };

  const updateParticipant = (index: number, value: string) => {
    const updated = [...participantNames];
    updated[index] = value;
    setParticipantNames(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const filteredNames = participantNames
        .map(name => name.trim())
        .filter(name => name.length > 0);

      if (filteredNames.length < 2) {
        throw new Error("Mindestens 2 Teilnehmer erforderlich");
      }

      const eventResult = await createEvent({
        data: {
          eventName: eventName.trim(),
          participantNames: filteredNames
        }
      });

      setResult(eventResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEventName("");
    setParticipantNames(["", ""]);
    setResult(null);
    setError(null);
  };

  if (result) {
    return (
      <Stack p="xl" gap="lg" maw={800} mx="auto">
        <Title order={1} ta="center">
          🎄 Wichtel-Event erstellt!
        </Title>

        <Alert color="green" title="Erfolg">
          Dein Wichtel-Event &quot;{result.eventSlug}&quot; wurde erstellt!
        </Alert>

        <Paper p="lg" withBorder>
          <Stack gap="md">
            <div>
              <Text fw={700} mb="xs">
                Admin-Link (für dich):
              </Text>
              <Group gap="xs">
                <TextInput
                  readOnly
                  value={`${window.location.origin}/admin/${result.eventSlug}?token=${result.adminToken}`}
                  style={{ flex: 1 }}
                />
                <CopyButton
                  value={`${window.location.origin}/admin/${result.eventSlug}?token=${result.adminToken}`}
                >
                  {({ copied, copy }) => (
                    <Tooltip label={copied ? "Kopiert!" : "Kopieren"}>
                      <Button onClick={copy} variant={copied ? "filled" : "light"}>
                        {copied ? "✓" : "Kopieren"}
                      </Button>
                    </Tooltip>
                  )}
                </CopyButton>
              </Group>
            </div>

            <div>
              <Text fw={700} mb="xs">
                Teilnehmer-Links:
              </Text>
              <Stack gap="sm">
                {result.participants.map(participant => (
                  <Paper key={participant.token} p="sm" withBorder bg="gray.0">
                    <Stack gap="xs">
                      <Text size="sm" fw={600}>
                        {participant.name}
                      </Text>
                      <Group gap="xs">
                        <TextInput
                          readOnly
                          value={participant.link}
                          size="xs"
                          style={{ flex: 1 }}
                        />
                        <CopyButton value={participant.link}>
                          {({ copied, copy }) => (
                            <Tooltip label={copied ? "Kopiert!" : "Kopieren"}>
                              <ActionIcon
                                onClick={copy}
                                variant={copied ? "filled" : "light"}
                                size="lg"
                              >
                                {copied ? "✓" : "📋"}
                              </ActionIcon>
                            </Tooltip>
                          )}
                        </CopyButton>
                      </Group>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </div>
          </Stack>
        </Paper>

        <Button onClick={resetForm} variant="light">
          Neues Event erstellen
        </Button>
      </Stack>
    );
  }

  return (
    <Stack p="xl" gap="lg" maw={600} mx="auto">
      <Title order={1} ta="center">
        🎁 Wichtel-Event erstellen
      </Title>

      <Text ta="center" c="dimmed">
        Erstelle ein geheimes Wichtel-Event für deine Familie oder Freunde
      </Text>

      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            label="Event-Name"
            placeholder="Weihnachten 2025"
            value={eventName}
            onChange={e => setEventName(e.currentTarget.value)}
            required
          />

          <div>
            <Text fw={600} mb="xs">
              Teilnehmer
            </Text>
            <Stack gap="sm">
              {participantNames.map((name, index) => (
                <Group key={index} gap="xs">
                  <TextInput
                    placeholder={`Teilnehmer ${index + 1}`}
                    value={name}
                    onChange={e => updateParticipant(index, e.currentTarget.value)}
                    style={{ flex: 1 }}
                    required
                  />
                  {participantNames.length > 2 && (
                    <ActionIcon
                      color="red"
                      variant="light"
                      onClick={() => removeParticipant(index)}
                    >
                      ✕
                    </ActionIcon>
                  )}
                </Group>
              ))}
            </Stack>
            <Button onClick={addParticipant} variant="light" mt="sm" fullWidth>
              + Teilnehmer hinzufügen
            </Button>
          </div>

          {error && (
            <Alert color="red" title="Fehler">
              {error}
            </Alert>
          )}

          <Button type="submit" loading={isLoading} size="lg" fullWidth>
            Event erstellen
          </Button>
        </Stack>
      </form>
    </Stack>
  );
}
