import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/retroui/Button";
import { Card } from "@/components/retroui/Card";
import { Alert, AlertTitle, AlertDescription } from "@/components/retroui/Alert";
import { getParticipantInfo } from "../server/getParticipantInfo";
import { drawName } from "../server/drawName";

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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Ziehen des Namens");
    } finally {
      setIsDrawing(false);
    }
  };

  if (drawnName) {
    return (
      <div className="flex flex-col items-center gap-6 max-w-xl mx-auto p-6">
        <h1 className="font-head text-2xl sm:text-3xl text-center">
          Hallo {participantInfo.participantName}!
        </h1>

        <Card className="p-6 w-full">
          <div className="flex flex-col items-center gap-4">
            <p className="text-lg font-medium">Du beschenkst:</p>
            <h2 className="font-head text-2xl text-success text-center">
              {drawnName}
            </h2>
          </div>
        </Card>

        <p className="text-sm text-muted-foreground text-center">
          Merke dir diesen Namen gut! Du kannst diese Seite jederzeit wieder
          aufrufen.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 max-w-xl mx-auto p-6">
      <h1 className="font-head text-2xl sm:text-3xl text-center">
        Hallo {participantInfo.participantName}!
      </h1>

      <p className="text-center text-lg">
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
