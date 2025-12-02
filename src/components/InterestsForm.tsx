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

  const addItem = () => {
    const trimmed = newItem.trim();
    if (trimmed && !interests.includes(trimmed)) {
      onChange([...interests, trimmed]);
      setNewItem("");
    }
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

  const isProcessing = isSaving || isSkipping;

  const handleSave = () => {
    const trimmed = newItem.trim();
    let finalInterests = interests;

    // Include pending input if there's something typed
    if (trimmed && !interests.includes(trimmed)) {
      finalInterests = [...interests, trimmed];
      onChange(finalInterests);
      setNewItem("");
    }

    onSave(finalInterests);
  };

  return (
    <Card className="p-6 w-full">
      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-semibold">Meine Interessen</h3>

        {interests.length > 0 ? (
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
        ) : (
          <p className="text-muted-foreground text-sm italic">
            Noch keine Interessen eingetragen
          </p>
        )}

        <div className="flex gap-2">
          <Input
            placeholder="Neues Interesse..."
            value={newItem}
            onChange={e => setNewItem(e.target.value)}
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

        <div className="flex gap-3">
          <Button
            onClick={handleSave}
            disabled={isProcessing}
            variant="success"
            className="flex-1"
          >
            {isSaving ? "Speichern..." : "Interessen speichern"}
          </Button>
          <Button
            onClick={onSkip}
            disabled={isProcessing}
            variant="outline"
            className="flex-1"
          >
            {isSkipping ? "..." : "Keine Interessen"}
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
