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
import { useForm } from "@tanstack/react-form";
import { createEvent } from "../server/createEvent";
import type { CreateEventOutput } from "../types/database";

export const Route = createFileRoute("/")({
  component: Home
});

function Home() {
  const [result, setResult] = useState<CreateEventOutput | null>(null);

  const form = useForm({
    defaultValues: {
      eventName: "",
      participants: ["", "", ""]
    },
    onSubmit: async ({ value }) => {
      try {
        const filteredNames = value.participants
          .map(name => name.trim())
          .filter(name => name.length > 0);

        const eventResult = await createEvent({
          data: {
            eventName: value.eventName.trim(),
            participantNames: filteredNames
          }
        });

        setResult(eventResult);
      } catch (err) {
        throw err;
      }
    }
  });

  const resetForm = () => {
    form.reset();
    setResult(null);
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
                          value={`${window.location.origin}${participant.link}`}
                          size="xs"
                          style={{ flex: 1 }}
                        />
                        <CopyButton
                          value={`${window.location.origin}${participant.link}`}
                        >
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

      <form
        onSubmit={e => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <Stack gap="md">
          <form.Field
            name="eventName"
            validators={{
              onChange: ({ value }) =>
                value.trim().length === 0 ? "Event-Name ist erforderlich" : undefined
            }}
          >
            {field => (
              <div>
                <TextInput
                  label="Event-Name"
                  placeholder="Weihnachten 2025"
                  value={field.state.value}
                  onChange={e => field.handleChange(e.currentTarget.value)}
                  onBlur={field.handleBlur}
                  error={field.state.meta.errors.join(", ")}
                  required
                />
              </div>
            )}
          </form.Field>

          <div>
            <Text fw={600} mb="xs">
              Teilnehmer
            </Text>
            <form.Field name="participants" mode="array">
              {field => (
                <>
                  <Stack gap="sm">
                    {field.state.value.map((_, index) => (
                      <form.Field key={index} name={`participants[${index}]`}>
                        {subField => (
                          <Group gap="xs">
                            <TextInput
                              placeholder={`Teilnehmer ${index + 1}`}
                              value={subField.state.value}
                              onChange={e =>
                                subField.handleChange(e.currentTarget.value)
                              }
                              style={{ flex: 1 }}
                              required
                            />
                            {field.state.value.length > 3 && (
                              <ActionIcon
                                color="red"
                                variant="light"
                                onClick={() => field.removeValue(index)}
                              >
                                ✕
                              </ActionIcon>
                            )}
                          </Group>
                        )}
                      </form.Field>
                    ))}
                  </Stack>
                  <Button
                    onClick={() => field.pushValue("")}
                    variant="light"
                    mt="sm"
                    fullWidth
                    type="button"
                  >
                    + Teilnehmer hinzufügen
                  </Button>
                </>
              )}
            </form.Field>
          </div>

          <form.Subscribe
            selector={state => ({
              canSubmit: state.canSubmit,
              isSubmitting: state.isSubmitting,
              errors: state.errors
            })}
          >
            {({ canSubmit, isSubmitting, errors }) => (
              <>
                {errors.length > 0 && (
                  <Alert color="red" title="Fehler">
                    {errors.join(", ")}
                  </Alert>
                )}
                <Button
                  type="submit"
                  disabled={!canSubmit}
                  loading={isSubmitting}
                  size="lg"
                  fullWidth
                >
                  Event erstellen
                </Button>
              </>
            )}
          </form.Subscribe>
        </Stack>
      </form>
    </Stack>
  );
}
