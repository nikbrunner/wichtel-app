import * as React from "react";
import {
  ErrorComponent,
  Link,
  rootRouteId,
  useMatch,
  useRouter
} from "@tanstack/react-router";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { Stack, Button, Group, Alert, Title } from "@mantine/core";

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
  const router = useRouter();
  const isRoot = useMatch({
    strict: false,
    select: state => state.id === rootRouteId
  });

  console.error(error);

  return (
    <Stack p="xl" gap="lg" maw={600} mx="auto" align="center" mt="xl">
      <Title order={2}>🎄 Etwas ist schiefgelaufen</Title>

      <Alert color="red" title="Fehler" w="100%">
        <ErrorComponent error={error} />
      </Alert>

      <Group gap="md">
        <Button
          onClick={() => {
            router.invalidate();
          }}
          variant="filled"
        >
          Erneut versuchen
        </Button>
        {isRoot ? (
          <Button component={Link} to="/" variant="light">
            Zur Startseite
          </Button>
        ) : (
          <Button
            component={Link}
            to="/"
            variant="light"
            onClick={e => {
              e.preventDefault();
              window.history.back();
            }}
          >
            Zurück
          </Button>
        )}
      </Group>
    </Stack>
  );
}
