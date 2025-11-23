import { createFileRoute, redirect } from "@tanstack/react-router";
import { signOut } from "~/server/auth/signOut";

export const Route = createFileRoute("/auth/logout")({
  beforeLoad: async () => {
    await signOut();
    throw redirect({ to: "/" });
  }
});
