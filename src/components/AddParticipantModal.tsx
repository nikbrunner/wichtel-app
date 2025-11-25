import { useState, useEffect } from "react";
import { Button } from "@/components/retroui/Button";
import { Input } from "@/components/retroui/Input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter
} from "@/components/retroui/Dialog";

type AddParticipantModalProps = {
  opened: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
  isLoading: boolean;
  error?: string | null;
};

export function AddParticipantModal({
  opened,
  onClose,
  onConfirm,
  isLoading,
  error
}: AddParticipantModalProps) {
  const [name, setName] = useState("");

  // Reset name when modal closes
  useEffect(() => {
    if (!opened) {
      setName("");
    }
  }, [opened]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onConfirm(name.trim());
    }
  };

  const handleClose = () => {
    setName("");
    onClose();
  };

  return (
    <Dialog open={opened} onOpenChange={open => !open && handleClose()}>
      <DialogContent>
        <DialogHeader>Teilnehmer hinzufügen</DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4 p-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="participantName" className="text-sm font-medium">
                Name des Teilnehmers
              </label>
              <Input
                id="participantName"
                placeholder="Name eingeben"
                value={name}
                onChange={e => setName(e.target.value)}
                disabled={isLoading}
                autoFocus
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="link"
              onClick={handleClose}
              disabled={isLoading}
            >
              Abbrechen
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading ? "Wird hinzugefügt..." : "Hinzufügen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
