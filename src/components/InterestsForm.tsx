import { useState } from "react";
import { Button } from "@/components/retroui/Button";
import { Input } from "@/components/retroui/Input";
import { Card } from "@/components/retroui/Card";
import { Alert, AlertTitle, AlertDescription } from "@/components/retroui/Alert";

type InterestsFormProps = {
  interests: string[];
  onChange: (interests: string[]) => void;
  onSave: (interestsToSave: string[]) => Promise<void>;
  onSkip: () => Promise<void>;
  isSaving: boolean;
  isSkipping: boolean;
  error: string | null;
  saveSuccess: boolean;
};

const MIN_INTEREST_LENGTH = 3;

export function InterestsForm({
  interests,
  onChange,
  onSave,
  onSkip,
  isSaving,
  isSkipping,
  error,
  saveSuccess
}: InterestsFormProps) {
  const [newItem, setNewItem] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const addItem = () => {
    const trimmed = newItem.trim();
    setValidationError(null);

    if (!trimmed) return;

    if (trimmed.length < MIN_INTEREST_LENGTH) {
      setValidationError(`Mindestens ${MIN_INTEREST_LENGTH} Zeichen erforderlich`);
      return;
    }

    if (interests.includes(trimmed)) {
      setValidationError("Dieses Interesse existiert bereits");
      return;
    }

    onChange([...interests, trimmed]);
    setNewItem("");
  };

  const removeItem = (index: number) => {
    onChange(interests.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewItem(e.target.value);
    if (validationError) setValidationError(null);
  };

  const isProcessing = isSaving || isSkipping;

  const handleSave = () => {
    const trimmed = newItem.trim();
    let finalInterests = interests;
    setValidationError(null);

    // Include pending input if there's something typed
    if (trimmed) {
      if (trimmed.length < MIN_INTEREST_LENGTH) {
        setValidationError(`Mindestens ${MIN_INTEREST_LENGTH} Zeichen erforderlich`);
        return;
      }
      if (!interests.includes(trimmed)) {
        finalInterests = [...interests, trimmed];
        onChange(finalInterests);
        setNewItem("");
      }
    }

    onSave(finalInterests);
  };

  return (
    <Card className="p-6 w-full">
      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-semibold">Deine Interessen</h3>
        <p className="mb-4">
          Was interessiert dich? Was wünschst du dir?
          <br />
          Die Person, die dich zieht, kann diese Hinweise später sehen.
        </p>

        {interests.length > 0 && (
          <ul className="flex flex-col gap-2">
            {interests.map((item, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="flex-1 bg-muted/30 px-3 py-2 rounded-lg border-2 border-border">
                  {item}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeItem(idx)}
                  disabled={isProcessing}
                  className="text-red-600 hover:bg-red-50"
                >
                  ×
                </Button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-col gap-2 mb-4">
          <div className="flex gap-2">
            <Input
              placeholder="Neues Interesse..."
              value={newItem}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="flex-1"
              variant="pink"
              disabled={isProcessing}
            />
            <Button
              type="button"
              variant="outline"
              onClick={addItem}
              disabled={!newItem.trim() || isProcessing}
            >
              +
            </Button>
          </div>
          {validationError && (
            <p className="text-sm text-destructive">{validationError}</p>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            onClick={onSkip}
            disabled={isProcessing}
            variant="outline"
            className="flex-1"
          >
            {isSkipping ? "..." : "Keine Interessen"}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isProcessing}
            variant="success"
            className="flex-1"
          >
            {isSaving ? "Speichern..." : "Interessen speichern"}
          </Button>
        </div>

        {saveSuccess && (
          <p className="text-sm text-success text-center font-medium">Gespeichert</p>
        )}

        {error && (
          <Alert variant="danger">
            <AlertTitle>Fehler</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </Card>
  );
}
