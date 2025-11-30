import { createFileRoute, redirect } from "@tanstack/react-router";
import { Card } from "@/components/retroui/Card";
import { getParticipantInfo } from "../../server/getParticipantInfo";

export const Route = createFileRoute("/p/$eventSlug/result")({
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
    if (!info.hasDrawn) {
      if (info.isLocked) {
        throw redirect({
          to: "/p/$eventSlug/draw",
          params,
          search: { token }
        });
      }
      throw redirect({
        to: "/p/$eventSlug/interests",
        params,
        search: { token }
      });
    }

    return info;
  },
  component: ResultPage
});

function ResultPage() {
  const loaderData = Route.useLoaderData();

  const drawnName = loaderData.drawnName;
  const drawnPersonInterests = loaderData.drawnPersonInterests;

  return (
    <div className="flex flex-col items-center gap-8 max-w-xl mx-auto p-4 sm:p-6 md:p-8">
      <h1 className="text-4xl sm:text-5xl font-black text-center">
        Hallo {loaderData.participantName}!
      </h1>

      <Card variant="success" className="p-8 w-full">
        <div className="flex flex-col items-center gap-4">
          <p className="text-xl font-semibold">Du beschenkst:</p>
          <h2 className="text-4xl font-black text-center">{drawnName}</h2>
        </div>
      </Card>

      {drawnPersonInterests && drawnPersonInterests.length > 0 && (
        <Card className="p-6 w-full">
          <h3 className="text-xl font-semibold mb-4">{drawnName}s Interessen:</h3>
          <ul className="list-disc list-inside space-y-2">
            {drawnPersonInterests.map((interest: string, idx: number) => (
              <li key={idx} className="text-lg">
                {interest}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <p className="text-xs text-muted-foreground text-center">
        Merke dir diesen Namen gut! Du kannst diese Seite jederzeit wieder aufrufen.
      </p>
    </div>
  );
}
