import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getParticipantInfo } from "../server/getParticipantInfo";

export const Route = createFileRoute("/p/$eventSlug")({
  validateSearch: search => {
    const token = search?.token as string;
    if (!token) {
      throw new Error("Participant token is required");
    }
    return { token };
  },
  loaderDeps: ({ search }) => ({ token: search.token }),
  loader: async ({ deps, params, location }) => {
    const info = await getParticipantInfo({
      data: { participantToken: deps.token }
    });

    // If accessing parent route directly, redirect to correct child based on state
    const isParentRoute =
      location.pathname === `/p/${params.eventSlug}` ||
      location.pathname === `/p/${params.eventSlug}/`;

    if (isParentRoute) {
      if (info.hasDrawn) {
        throw redirect({
          to: "/p/$eventSlug/result",
          params,
          search: { token: deps.token }
        });
      }
      if (info.isLocked) {
        throw redirect({
          to: "/p/$eventSlug/draw",
          params,
          search: { token: deps.token }
        });
      }
      throw redirect({
        to: "/p/$eventSlug/interests",
        params,
        search: { token: deps.token }
      });
    }

    return info;
  },
  component: ParticipantLayout
});

function ParticipantLayout() {
  return <Outlet />;
}
