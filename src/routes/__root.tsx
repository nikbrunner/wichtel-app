/// <reference types="vite/client" />
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
  Link,
  useRouter
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { createServerFn } from "@tanstack/react-start";
import * as React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/retroui/Button";
import { Toaster } from "@/components/retroui/Sonner";
import { AuthModal } from "../components/AuthModal";
import { Logo } from "../components/Logo";
import { DefaultCatchBoundary } from "../components/DefaultCatchBoundary";
import { NotFound } from "../components/NotFound";
import { useAuthModal } from "../stores/authModal";
import appCss from "../styles/app.css?url";
import { seo } from "../utils/seo";
import { getSupabaseServerClient } from "../utils/supabase";
import { signOut } from "../server/auth/signOut";

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
        type: "image/svg+xml",
        href: "/logo.svg"
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
  const router = useRouter();
  const authModal = useAuthModal();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      toast.success("Erfolgreich abgemeldet");
      router.navigate({ to: "/" });
      router.invalidate();
    } catch {
      toast.error("Fehler beim Abmelden");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <RootDocument>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="h-16 border-b-2 border-border bg-primary text-primary-foreground">
          <div className="max-w-6xl mx-auto h-full px-4 flex items-center justify-between">
            {/* Logo/Brand */}
            <Link
              to={user ? "/dashboard" : "/"}
              className="flex items-center gap-2 no-underline"
            >
              <Logo />
            </Link>

            {/* Navigation */}
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm hidden sm:block">{user.email}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? "..." : "Logout"}
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => authModal.open("login")}
                >
                  Login
                </Button>
                <Button size="sm" onClick={() => authModal.open("signup")}>
                  Registrieren
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
      <AuthModal />
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
        <Toaster position="bottom-center" richColors />
        <TanStackRouterDevtools position="bottom-right" />
        <Scripts />
      </body>
    </html>
  );
}
