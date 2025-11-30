import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/retroui/Button";
import { Card } from "@/components/retroui/Card";
import { Alert, AlertTitle, AlertDescription } from "@/components/retroui/Alert";
import { InterestsForm } from "@/components/InterestsForm";
import { getParticipantInfo } from "../server/getParticipantInfo";
import { drawName } from "../server/drawName";
import { updateInterests } from "../server/updateInterests";
import { skipInterests } from "../server/skipInterests";

export const Route = createFileRoute("/e/$eventSlug")({
  component: ParticipantDraw,
  validateSearch: search => {
    const token = search?.token as string;
    if (!token) {
      throw new Error("Participant token is required");
    }
    return { token };
  },
  loaderDeps: ({ search }) => ({ token: search.token }),
  loader: async ({ deps }) => {
    try {
      const info = await getParticipantInfo({
        data: {
          participantToken: deps.token
        }
      });
      return info;
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : "Fehler beim Laden der Teilnehmer-Daten"
      );
    }
  }
});

function ParticipantDraw() {
  const participantInfo = Route.useLoaderData();
  const search = useSearch({ from: "/e/$eventSlug" });
  const token = search?.token || "";

  const [isDrawing, setIsDrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drawnName, setDrawnName] = useState<string | null>(
    participantInfo.drawnName
  );
  const [drawnPersonInterests] = useState<string[] | null>(
    participantInfo.drawnPersonInterests
  );

  // Interests form state
  const [interests, setInterests] = useState<string[]>(participantInfo.myInterests);
  const [isSaving, setIsSaving] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [interestsStatus, setInterestsStatus] = useState(
    participantInfo.interestsStatus
  );

  const handleDraw = async () => {
    setError(null);
    setIsDrawing(true);

    try {
      const result = await drawName({
        data: {
          participantToken: token
        }
      });

      setDrawnName(result.drawnName);

      // Reload page to get drawn person's interests
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Ziehen des Namens");
    } finally {
      setIsDrawing(false);
    }
  };

  const handleSaveInterests = async () => {
    setError(null);
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const result = await updateInterests({
        data: { participantToken: token, interests }
      });
      setInterests(result.interests);
      setInterestsStatus("submitted");
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Speichern");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkipInterests = async () => {
    setError(null);
    setIsSkipping(true);

    try {
      await skipInterests({
        data: { participantToken: token }
      });
      setInterestsStatus("skipped");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Aktualisieren");
    } finally {
      setIsSkipping(false);
    }
  };

  // STATE C: Already drawn - show result with drawn person's interests
  if (drawnName) {
    return (
      <div className="flex flex-col items-center gap-8 max-w-xl mx-auto p-4 sm:p-6 md:p-8">
        <h1 className="text-4xl sm:text-5xl font-black text-center">
          Hallo {participantInfo.participantName}!
        </h1>

        <Card variant="success" className="p-8 w-full">
          <div className="flex flex-col items-center gap-4">
            <p className="text-xl font-semibold">Du beschenkst:</p>
            <h2 className="text-4xl font-black text-center">{drawnName}</h2>
          </div>
        </Card>

        {drawnPersonInterests && drawnPersonInterests.length > 0 && (
          <Card className="p-6 w-full">
            <h3 className="text-xl font-semibold mb-4">{drawnName}s Wünsche:</h3>
            <ul className="list-disc list-inside space-y-2">
              {drawnPersonInterests.map((interest, idx) => (
                <li key={idx} className="text-lg">
                  {interest}
                </li>
              ))}
            </ul>
          </Card>
        )}

        <p className="text-xs text-muted-foreground text-center">
          Merke dir diesen Namen gut! Du kannst diese Seite jederzeit wieder
          aufrufen.
        </p>
      </div>
    );
  }

  // STATE A: Before lock date - show interests form
  if (!participantInfo.isLocked) {
    const lockDateFormatted = participantInfo.lockDate
      ? new Date(participantInfo.lockDate).toLocaleDateString("de-DE", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric"
        })
      : null;

    // If already skipped, show confirmation
    if (interestsStatus === "skipped") {
      return (
        <div className="flex flex-col items-center gap-8 max-w-xl mx-auto p-4 sm:p-6 md:p-8">
          <h1 className="text-4xl sm:text-5xl font-black text-center">
            Hallo {participantInfo.participantName}!
          </h1>

          <Alert variant="info" className="w-full">
            <AlertTitle>Keine Wünsche eingetragen</AlertTitle>
            <AlertDescription>
              Du hast angegeben, dass du keine Wünsche eintragen möchtest. Nach dem
              Stichtag kannst du hier einen Namen ziehen.
              {lockDateFormatted && (
                <span className="block mt-2 font-semibold">
                  Stichtag: {lockDateFormatted}
                </span>
              )}
            </AlertDescription>
          </Alert>

          <p className="text-xs text-muted-foreground text-center">
            Du kannst diese Seite jederzeit wieder aufrufen.
          </p>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center gap-8 max-w-xl mx-auto p-4 sm:p-6 md:p-8">
        <h1 className="text-4xl sm:text-5xl font-black text-center">
          Hallo {participantInfo.participantName}!
        </h1>

        <Alert variant="info" className="w-full">
          <AlertTitle>Wunschliste</AlertTitle>
          <AlertDescription>
            Trage hier deine Geschenkwünsche ein. Die Person, die dich zieht, kann
            diese später sehen.
            {lockDateFormatted && (
              <span className="block mt-2 font-semibold">
                Stichtag: {lockDateFormatted}
              </span>
            )}
          </AlertDescription>
        </Alert>

        <InterestsForm
          interests={interests}
          onChange={setInterests}
          onSave={handleSaveInterests}
          onSkip={handleSkipInterests}
          isSaving={isSaving}
          isSkipping={isSkipping}
          error={error}
          saveSuccess={saveSuccess}
        />

        <p className="text-xs text-muted-foreground text-center">
          Das Ausfüllen ist optional. Nach dem Stichtag kannst du einen Namen ziehen.
        </p>
      </div>
    );
  }

  // STATE B: After lock date, not drawn yet - show draw button
  return (
    <div className="flex flex-col items-center gap-8 max-w-xl mx-auto p-4 sm:p-6 md:p-8">
      <h1 className="text-4xl sm:text-5xl font-black text-center">
        Hallo {participantInfo.participantName}!
      </h1>

      <p className="text-center text-xl font-semibold">
        Klicke auf den Button unten, um zu erfahren, wen du beschenkst.
      </p>

      {error && (
        <Alert variant="danger" className="w-full">
          <AlertTitle>Fehler</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        onClick={handleDraw}
        disabled={isDrawing}
        variant="success"
        size="lg"
        className="w-full max-w-sm"
      >
        {isDrawing ? "Wird gezogen..." : "Namen ziehen"}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Du ziehst zufällig einen Namen aus den verbleibenden Teilnehmern
      </p>
    </div>
  );
}
