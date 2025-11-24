import {
  Table,
  Badge,
  Button,
  CopyButton,
  Tooltip,
  TextInput,
  Group,
  Stack,
  Paper,
  Text,
  Box
} from "@mantine/core";

type ParticipantLinkTableProps = {
  eventSlug: string;
  participants: Array<{
    id: string;
    name: string;
    token: string;
    has_drawn: boolean;
    drawn_at: string | null;
  }>;
  onRegenerateLink: (participantId: string, participantName: string) => void;
  regeneratingId: string | null;
};

export function ParticipantLinkTable({
  eventSlug,
  participants,
  onRegenerateLink,
  regeneratingId
}: ParticipantLinkTableProps) {
  const generateLink = (token: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/e/${eventSlug}?token=${token}`;
  };

  return (
    <>
      {/* Desktop Table View */}
      <Box visibleFrom="sm">
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Teilnehmer</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Link</Table.Th>
              <Table.Th>Aktionen</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {participants.map(participant => {
              const link = generateLink(participant.token);
              return (
                <Table.Tr key={participant.id}>
                  <Table.Td>
                    <strong>{participant.name}</strong>
                  </Table.Td>
                  <Table.Td>
                    {participant.has_drawn ? (
                      <Badge color="green" variant="filled" size="sm">
                        ✓ Gezogen
                      </Badge>
                    ) : (
                      <Badge color="gray" variant="light" size="sm">
                        ✗ Noch nicht
                      </Badge>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <TextInput
                        readOnly
                        value={link}
                        size="xs"
                        style={{ flex: 1, minWidth: 200 }}
                      />
                      <CopyButton value={link}>
                        {({ copied, copy }) => (
                          <Tooltip label={copied ? "Kopiert!" : "Kopieren"}>
                            <Button
                              onClick={copy}
                              variant={copied ? "filled" : "light"}
                              size="xs"
                            >
                              {copied ? "✓" : "Kopieren"}
                            </Button>
                          </Tooltip>
                        )}
                      </CopyButton>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Button
                      size="xs"
                      variant="light"
                      color="orange"
                      onClick={() =>
                        onRegenerateLink(participant.id, participant.name)
                      }
                      loading={regeneratingId === participant.id}
                      disabled={regeneratingId !== null}
                    >
                      Regenerieren
                    </Button>
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </Box>

      {/* Mobile Card View */}
      <Stack gap="sm" hiddenFrom="sm">
        {participants.map(participant => {
          const link = generateLink(participant.token);
          return (
            <Paper key={participant.id} p="sm" withBorder>
              <Stack gap="xs">
                <Group justify="space-between" align="flex-start">
                  <Text fw={600}>{participant.name}</Text>
                  {participant.has_drawn ? (
                    <Badge color="green" variant="filled" size="sm">
                      ✓ Gezogen
                    </Badge>
                  ) : (
                    <Badge color="gray" variant="light" size="sm">
                      ✗ Noch nicht
                    </Badge>
                  )}
                </Group>

                <Stack gap="xs">
                  <TextInput
                    readOnly
                    value={link}
                    size="xs"
                    styles={{
                      input: {
                        fontSize: "11px",
                        padding: "4px 8px"
                      }
                    }}
                  />
                  <Group gap="xs" grow>
                    <CopyButton value={link}>
                      {({ copied, copy }) => (
                        <Button
                          onClick={copy}
                          variant={copied ? "filled" : "light"}
                          size="xs"
                          fullWidth
                        >
                          {copied ? "✓ Kopiert" : "Kopieren"}
                        </Button>
                      )}
                    </CopyButton>
                    <Button
                      size="xs"
                      variant="light"
                      color="orange"
                      onClick={() =>
                        onRegenerateLink(participant.id, participant.name)
                      }
                      loading={regeneratingId === participant.id}
                      disabled={regeneratingId !== null}
                      fullWidth
                    >
                      Regenerieren
                    </Button>
                  </Group>
                </Stack>
              </Stack>
            </Paper>
          );
        })}
      </Stack>
    </>
  );
}
