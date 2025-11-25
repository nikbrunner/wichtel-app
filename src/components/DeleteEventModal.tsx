import { Button } from "@/components/retroui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter
} from "@/components/retroui/Dialog";

type DeleteEventModalProps = {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  eventName: string;
  participantCount: number;
  isLoading: boolean;
};

export function DeleteEventModal({
  opened,
  onClose,
  onConfirm,
  eventName,
  participantCount,
  isLoading
}: DeleteEventModalProps) {
  return (
    <Dialog open={opened} onOpenChange={open => !open && onClose()}>
      <DialogContent>
        <DialogHeader>Event löschen?</DialogHeader>
        <div className="flex flex-col gap-4 p-6">
          <p>
            Möchtest du wirklich das Event <strong>{eventName}</strong> löschen?
          </p>
          <p className="text-sm text-muted-foreground">
            {participantCount} Teilnehmer und alle Ziehungen werden unwiderruflich
            gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.
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
