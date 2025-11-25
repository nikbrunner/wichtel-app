import { Button } from "@/components/retroui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/retroui/Dialog";

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
    <Dialog open={opened} onOpenChange={open => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Link regenerieren?</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <p>
            Möchtest du wirklich einen neuen Link für{" "}
            <strong>{participantName}</strong> generieren?
          </p>
          <p className="text-sm text-muted-foreground">
            Der alte Link wird ungültig und die bisherige Ziehung (falls vorhanden)
            wird gelöscht. Der Teilnehmer muss erneut ziehen.
          </p>
        </div>
        <DialogFooter>
          <Button variant="link" onClick={onClose} disabled={isLoading}>
            Abbrechen
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "Wird regeneriert..." : "Regenerieren"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
