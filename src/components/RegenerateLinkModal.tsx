import { Modal, Stack, Text, Group, Button } from "@mantine/core";

type RegenerateLinkModalProps = {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  participantName: string;
  isLoading: boolean;
};

export function RegenerateLinkModal({
  opened,
  onClose,
  onConfirm,
  participantName,
  isLoading
}: RegenerateLinkModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title="Link regenerieren?" centered>
      <Stack gap="md">
        <Text>
          Möchtest du wirklich einen neuen Link für{" "}
          <strong>{participantName}</strong> generieren?
        </Text>
        <Text size="sm" c="dimmed">
          Der alte Link wird ungültig und die bisherige Ziehung (falls vorhanden)
          wird gelöscht. Der Teilnehmer muss erneut ziehen.
        </Text>
        <Group justify="flex-end" gap="xs">
          <Button variant="subtle" onClick={onClose} disabled={isLoading}>
            Abbrechen
          </Button>
          <Button
            color="orange"
            onClick={onConfirm}
            loading={isLoading}
            disabled={isLoading}
          >
            Regenerieren
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
