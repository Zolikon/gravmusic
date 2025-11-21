import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";

export const meta: Route.MetaFunction = () => [
  { title: "GravMusic" },
];

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  { rel: "icon", href: "/favicon.png", type: "image/png" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

import { useEffect, useRef } from "react";
import { useLoaderData } from "react-router";
import { usePlayerStore } from "./store/usePlayerStore";
import { PlayerControls } from "./components/PlayerControls";
import type { Album } from "./types";

export async function clientLoader() {
  const response = await fetch("/albums.json");
  if (!response.ok) {
    throw new Error("Failed to load albums");
  }
  const albums: Album[] = await response.json();
  return { albums };
}

export default function App() {
  const { albums } = useLoaderData<typeof clientLoader>();
  const setAlbums = usePlayerStore((state) => state.setAlbums);

  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      setAlbums(albums);
      initialized.current = true;
    }
  }, [albums, setAlbums]);

  return (
    <div className="flex flex-col h-screen bg-neutral-950 text-white font-sans">
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
      <PlayerControls />
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
