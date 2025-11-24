import {
  Table,
  Badge,
  Button,
  CopyButton,
  Tooltip,
  TextInput,
  Group
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
};

export function ParticipantLinkTable({
  eventSlug,
  participants
}: ParticipantLinkTableProps) {
  const generateLink = (token: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/e/${eventSlug}?token=${token}`;
  };

  return (
    <Table striped highlightOnHover>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Teilnehmer</Table.Th>
          <Table.Th>Status</Table.Th>
          <Table.Th>Link</Table.Th>
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
            </Table.Tr>
          );
        })}
      </Table.Tbody>
    </Table>
  );
}
