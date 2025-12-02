import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/retroui/Alert";
import { InterestsForm } from "@/components/InterestsForm";
import { updateInterests } from "../../server/updateInterests";
import { skipInterests } from "../../server/skipInterests";
import { getParticipantInfo } from "../../server/getParticipantInfo";

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

        <Alert variant="info" className="w-full">
          <AlertTitle>Keine Interessen eingetragen</AlertTitle>
          <AlertDescription>
            Du hast angegeben, dass du keine Interessen eintragen möchtest. Nach dem
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
        Hallo {loaderData.participantName}!
      </h1>

      <div className="text-center space-y-3">
        <p className="text-xl font-semibold">Du wurdest zum Wichteln eingeladen!</p>
        <p className="text-muted-foreground">
          Beim Wichteln zieht jeder geheim einen Namen und beschenkt diese Person.
          Damit dein Wichtel weiß, was dir gefällt, kannst du hier deine Interessen
          eintragen. Nach dem Stichtag kannst du dann deinen Namen ziehen.
        </p>
      </div>

      <Alert variant="info" className="w-full">
        <AlertTitle>Deine Interessen</AlertTitle>
        <AlertDescription>
          Was interessiert dich? Was wünschst du dir? Die Person, die dich zieht,
          kann diese Hinweise später sehen.
          {lockDateFormatted && (
            <span className="block mt-2 font-semibold">
              Stichtag: {lockDateFormatted}
            </span>
          )}
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
