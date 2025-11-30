import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/retroui/Button";
import { Alert, AlertTitle, AlertDescription } from "@/components/retroui/Alert";
import { drawName } from "../../server/drawName";
import { getParticipantInfo } from "../../server/getParticipantInfo";

export const Route = createFileRoute("/p/$eventSlug/draw")({
  loader: async ({ params, location }) => {
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
    if (!info.isLocked) {
      throw redirect({
        to: "/p/$eventSlug/interests",
        params,
        search: { token }
      });
    }

    return info;
  },
  component: DrawPage
});

function DrawPage() {
  const loaderData = Route.useLoaderData();
  const search = Route.useSearch();
  const token = search.token;

  const [isDrawing, setIsDrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDraw = async () => {
    setError(null);
    setIsDrawing(true);

    try {
      await drawName({
        data: {
          participantToken: token
        }
      });

      // Reload page to get drawn person's interests and redirect to result
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Ziehen des Namens");
    } finally {
      setIsDrawing(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 max-w-xl mx-auto p-4 sm:p-6 md:p-8">
      <h1 className="text-4xl sm:text-5xl font-black text-center">
        Hallo {loaderData.participantName}!
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
