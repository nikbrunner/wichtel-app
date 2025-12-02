import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
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
  const form = useForm({
    defaultValues: { name: "" },
    onSubmit: ({ value }) => {
      onConfirm(value.name.trim());
    }
  });

  // Reset form when modal closes
  useEffect(() => {
    if (!opened) {
      form.reset();
    }
  }, [opened, form]);

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={opened} onOpenChange={open => !open && handleClose()}>
      <DialogContent>
        <DialogHeader>Teilnehmer hinzufügen</DialogHeader>
        <form
          onSubmit={e => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <div className="flex flex-col gap-4 p-6">
            <form.Field
              name="name"
              validators={{
                onChange: ({ value }) =>
                  !value.trim() ? "Name ist erforderlich" : undefined
              }}
            >
              {field => (
                <div className="flex flex-col gap-2">
                  <label htmlFor="participantName" className="text-sm font-medium">
                    Name des Teilnehmers
                  </label>
                  <Input
                    id="participantName"
                    placeholder="Name eingeben"
                    value={field.state.value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      field.handleChange(e.target.value)
                    }
                    onBlur={field.handleBlur}
                    disabled={isLoading}
                    autoFocus
                  />
                  {field.state.meta.errors.length > 0 &&
                    field.state.meta.isTouched && (
                      <p className="text-sm text-destructive">
                        {field.state.meta.errors.join(", ")}
                      </p>
                    )}
                </div>
              )}
            </form.Field>
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
            <form.Subscribe
              selector={state => ({
                canSubmit: state.canSubmit,
                values: state.values
              })}
            >
              {({ canSubmit, values }) => (
                <Button
                  type="submit"
                  disabled={isLoading || !canSubmit || !values.name.trim()}
                >
                  {isLoading ? "Wird hinzugefügt..." : "Hinzufügen"}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
