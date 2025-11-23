import { Link } from "@tanstack/react-router";
import { Stack, Button, Group, Text, Title } from "@mantine/core";

export function NotFound({ children }: { children?: React.ReactNode }) {
  return (
    <Stack p="xl" gap="lg" maw={600} mx="auto" align="center" mt="xl">
      <Title order={2}>🎄 Seite nicht gefunden</Title>

      <Text c="dimmed" ta="center">
        {children || "Die Seite, die du suchst, existiert nicht."}
      </Text>

      <Group gap="md">
        <Button onClick={() => window.history.back()} variant="filled">
          Zurück
        </Button>
        <Link to="/">
          <Button variant="light">Zur Startseite</Button>
        </Link>
      </Group>
    </Stack>
  );
}
