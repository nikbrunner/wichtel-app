/// <reference types="vite/client" />
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
  Link
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { createServerFn } from "@tanstack/react-start";
import * as React from "react";
import { Button } from "@/components/retroui/Button";
import { DefaultCatchBoundary } from "../components/DefaultCatchBoundary";
import { NotFound } from "../components/NotFound";
import appCss from "../styles/app.css?url";
import { seo } from "../utils/seo";
import { getSupabaseServerClient } from "../utils/supabase";

const fetchUser = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user?.email) {
    return null;
  }

  return {
    email: data.user.email
  };
});

export const Route = createRootRoute({
  beforeLoad: async () => {
    const user = await fetchUser();

    return {
      user
    };
  },
  head: () => ({
    meta: [
      {
        charSet: "utf-8"
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      },
      ...seo({
        title: "Wichtel-App | Geheimer Geschenketausch für Familie & Freunde",
        description: `Erstelle ein geheimes Wichtel-Event für deine Familie oder Freunde. Einfach, sicher und kostenlos - niemand sieht, wer wen beschenkt!`
      })
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "icon",
        href: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎁</text></svg>"
      }
    ]
  }),
  errorComponent: props => {
    return (
      <RootDocument>
        <DefaultCatchBoundary {...props} />
      </RootDocument>
    );
  },
  notFoundComponent: () => <NotFound />,
  component: RootComponent
});

function RootComponent() {
  const { user } = Route.useRouteContext();

  return (
    <RootDocument>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="h-16 border-b-2 border-border bg-primary text-primary-foreground">
          <div className="max-w-6xl mx-auto h-full px-4 flex items-center justify-between">
            {/* Logo/Brand */}
            <Link to="/" className="flex items-center gap-2 no-underline">
              <span className="text-2xl">🎁</span>
              <span className="font-head text-xl">Wichtel-App</span>
            </Link>

            {/* Navigation */}
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm hidden sm:block">{user.email}</span>
                <Button asChild variant="outline" size="sm">
                  <Link to="/auth/logout">Logout</Link>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button asChild variant="link" size="sm">
                  <Link to="/auth/login">Login</Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/auth/signup">Sign up</Link>
                </Button>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 py-4 sm:py-6">
          <div className="max-w-6xl mx-auto px-4">
            <Outlet />
          </div>
        </main>
      </div>
      <TanStackRouterDevtools position="bottom-right" />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="font-sans bg-background text-foreground">
        {children}
        <TanStackRouterDevtools position="bottom-right" />
        <Scripts />
      </body>
    </html>
  );
}
