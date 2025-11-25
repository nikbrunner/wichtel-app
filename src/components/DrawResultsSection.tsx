import { Stack, Title, Text, Paper, Table, Alert } from "@mantine/core";
import type { DrawResult } from "../types/database";
import dayjs from "dayjs";

type DrawResultsSectionProps = {
  eventDate: string;
  isPast: boolean;
  drawResults: DrawResult[] | null;
};

export function DrawResultsSection({
  eventDate,
  isPast,
  drawResults
}: DrawResultsSectionProps) {
  // If event date hasn't passed, show lock message
  if (!isPast) {
    return (
      <Stack gap="md">
        <Title order={3} size="h4">
          🔒 Ziehungsergebnisse
        </Title>
        <Alert color="blue" title="Noch nicht verfügbar">
          <Text size="sm">
            Die Ziehungsergebnisse werden erst nach dem Event-Datum ({" "}
            {dayjs(eventDate).format("DD.MM.YYYY")}) sichtbar, um die Überraschung zu
            bewahren.
          </Text>
        </Alert>
      </Stack>
    );
  }

  // If past but no results yet
  if (!drawResults || drawResults.length === 0) {
    return (
      <Stack gap="md">
        <Title order={3} size="h4">
          Ziehungsergebnisse
        </Title>
        <Paper p="md" withBorder>
          <Text c="dimmed" ta="center">
            Noch niemand hat gezogen.
          </Text>
        </Paper>
      </Stack>
    );
  }

  // Show results
  return (
    <Stack gap="md">
      <Title order={3} size="h4">
        Ziehungsergebnisse
      </Title>
      <Paper withBorder>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Wer zieht</Table.Th>
              <Table.Th>Hat gezogen</Table.Th>
              <Table.Th>Wann</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {drawResults.map((result, index) => (
              <Table.Tr key={index}>
                <Table.Td>
                  <Text fw={600}>{result.drawer_name}</Text>
                </Table.Td>
                <Table.Td>
                  <Text>{result.drawn_name}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed">
                    {dayjs(result.created_at).format("DD.MM.YYYY HH:mm")}
                  </Text>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>
    </Stack>
  );
}
