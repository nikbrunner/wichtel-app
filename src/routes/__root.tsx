/// <reference types="vite/client" />
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { createServerFn } from "@tanstack/react-start";
import * as React from "react";
import { MantineProvider, mantineHtmlProps, ColorSchemeScript } from "@mantine/core";
import { DefaultCatchBoundary } from "../components/DefaultCatchBoundary";
import { NotFound } from "../components/NotFound";
import appCss from "../styles/app.css?url";
import mantineCss from "@mantine/core/styles.css?url";
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
      { rel: "stylesheet", href: mantineCss },
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
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
        <HeadContent />
      </head>
      <body>
        <MantineProvider withGlobalClasses={false}>
          {children}
          <TanStackRouterDevtools position="bottom-right" />
        </MantineProvider>
        <Scripts />
      </body>
    </html>
  );
}
