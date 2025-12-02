import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/retroui/Alert";
import { InterestsForm } from "@/components/InterestsForm";
import { updateInterests } from "../../server/updateInterests";
import { skipInterests } from "../../server/skipInterests";
import { getParticipantInfo } from "../../server/getParticipantInfo";
import { Card } from "~/components/retroui/Card";

export const Route = createFileRoute("/p/$eventSlug/interests")({
  loader: async ({ params, location }) => {
    // Load participant info for this route
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get("token");

    if (!token) {
      throw new Error("Token is required");
    }

    const info = await getParticipantInfo({
      data: { participantToken: token }
    });

    // Redirect based on state
    if (info.hasDrawn) {
      throw redirect({
        to: "/p/$eventSlug/result",
        params,
        search: { token }
      });
    }
    if (info.isLocked) {
      throw redirect({
        to: "/p/$eventSlug/draw",
        params,
        search: { token }
      });
    }

    return info;
  },
  component: InterestsPage
});

function InterestsPage() {
  const router = useRouter();
  const loaderData = Route.useLoaderData();
  const search = Route.useSearch();
  const token = search.token;

  const [interests, setInterests] = useState<string[]>(loaderData.myInterests);

  // Clear saved indicator when interests change (dirty state)
  const handleInterestsChange = (newInterests: string[]) => {
    setInterests(newInterests);
    setSaveSuccess(false);
  };
  const [isSaving, setIsSaving] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [interestsStatus, setInterestsStatus] = useState(loaderData.interestsStatus);

  const lockDateFormatted = loaderData.lockDate
    ? new Date(loaderData.lockDate).toLocaleDateString("de-DE", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      })
    : null;

  const handleSaveInterests = async (interestsToSave: string[]) => {
    setError(null);
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const result = await updateInterests({
        data: { participantToken: token, interests: interestsToSave }
      });
      setInterests(result.interests);
      setInterestsStatus("submitted");
      setSaveSuccess(true);
      router.invalidate();
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
      router.invalidate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Aktualisieren");
    } finally {
      setIsSkipping(false);
    }
  };

  // If already skipped, show confirmation
  if (interestsStatus === "skipped") {
    return (
      <div className="flex flex-col items-center gap-8 max-w-xl mx-auto p-4 sm:p-6 md:p-8">
        <h1 className="text-4xl sm:text-5xl font-black text-center">
          Hallo {loaderData.participantName}!
        </h1>

        {/* Step indicator */}
        <div className="w-full flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-success border-2 border-black flex items-center justify-center font-bold text-sm">
              ✓
            </span>
            <span className="font-semibold">Interessen</span>
          </div>
          <div className="flex-1 h-0.5 bg-border" />
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-muted border-2 border-black flex items-center justify-center font-bold text-sm text-muted-foreground">
              2
            </span>
            <span className="text-muted-foreground">Namen ziehen</span>
          </div>
        </div>

        <Alert variant="info" className="w-full">
          <AlertTitle>Schritt 1 erledigt!</AlertTitle>
          <AlertDescription>
            Du hast keine Interessen eingetragen – kein Problem!
            {lockDateFormatted && (
              <span className="block mt-2">
                <span className="font-semibold">Nächster Schritt:</span> Ab{" "}
                {lockDateFormatted} kannst du hier zurückkommen und einen Namen
                ziehen.
              </span>
            )}
          </AlertDescription>
        </Alert>

        <p className="text-xs text-muted-foreground text-center">
          Speichere diesen Link – du brauchst ihn für Schritt 2.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8 max-w-xl mx-auto p-4 sm:p-6 md:p-8">
      <h1 className="text-4xl sm:text-5xl font-black text-center">
        Hallo {loaderData.participantName}!
      </h1>

      <p className="text-xl font-semibold text-center">
        Du wurdest zum Wichteln eingeladen!
      </p>

      {/* Step indicator */}
      <div className="w-full flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-primary border-2 border-black flex items-center justify-center font-bold text-sm">
            1
          </span>
          <span className="font-semibold">Interessen</span>
        </div>
        <div className="flex-1 h-0.5 bg-border" />
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-muted border-2 border-black flex items-center justify-center font-bold text-sm text-muted-foreground">
            2
          </span>
          <span className="text-muted-foreground">Namen ziehen</span>
        </div>
      </div>

      {/* Explanation */}
      <Card variant="primary">
        <Card.Header>
          <Card.Title>So funktioniert&apos;s</Card.Title>
        </Card.Header>
        <Card.Content className="flex flex-col gap-4">
          <div>
            <h3 className="font-semibold">Jetzt</h3>
            <p>
              Trage deine Interessen ein, damit dein Wichtel weiß, was dir gefällt
            </p>
          </div>
          <div>
            <h3 className="font-semibold">
              {lockDateFormatted ? `Ab ${lockDateFormatted}` : "Nach dem Stichtag"}
            </h3>
            <p>
              Komm zurück und ziehe einen Namen – das ist die Person, die du
              beschenkst
            </p>
          </div>
          <Alert className="text-sm">
            Falls alle ihre Interessen eingetragen haben kann der Organisator auch
            die nächste Phase starten.
          </Alert>
        </Card.Content>
      </Card>

      <Alert variant="info" className="w-full">
        <AlertTitle>Deine Interessen</AlertTitle>
        <AlertDescription>
          Was interessiert dich? Was wünschst du dir? Die Person, die dich zieht,
          kann diese Hinweise später sehen.
        </AlertDescription>
      </Alert>

      <InterestsForm
        interests={interests}
        onChange={handleInterestsChange}
        onSave={handleSaveInterests}
        onSkip={handleSkipInterests}
        isSaving={isSaving}
        isSkipping={isSkipping}
        error={error}
        saveSuccess={saveSuccess}
      />

      <p className="text-xs text-muted-foreground text-center">
        Das Ausfüllen ist optional. Dieser Link bleibt gültig – du kannst jederzeit
        zurückkommen und deine Interessen bis zum Stichtag bearbeiten.
      </p>
    </div>
  );
}
