import { Button } from "@/components/retroui/Button";
import { Alert, AlertDescription } from "@/components/retroui/Alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter
} from "@/components/retroui/Dialog";

type DeleteParticipantModalProps = {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  participantName: string;
  hasDraws: boolean;
  isLoading: boolean;
};

export function DeleteParticipantModal({
  opened,
  onClose,
  onConfirm,
  participantName,
  hasDraws,
  isLoading
}: DeleteParticipantModalProps) {
  return (
    <Dialog open={opened} onOpenChange={open => !open && onClose()}>
      <DialogContent>
        <DialogHeader>Teilnehmer löschen?</DialogHeader>
        <div className="flex flex-col gap-4 p-6">
          <p>
            Möchtest du wirklich <strong>{participantName}</strong> aus dem Event
            entfernen?
          </p>
          {hasDraws && (
            <Alert variant="warning">
              <AlertDescription>
                Dieser Teilnehmer ist in Ziehungen involviert. Betroffene Ziehungen
                werden gelöscht und die entsprechenden Teilnehmer müssen erneut
                ziehen.
              </AlertDescription>
            </Alert>
          )}
          <p className="text-sm text-muted-foreground">
            Der persönliche Link wird ungültig.
          </p>
        </div>
        <DialogFooter>
          <Button variant="link" onClick={onClose} disabled={isLoading}>
            Abbrechen
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "Wird gelöscht..." : "Löschen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
