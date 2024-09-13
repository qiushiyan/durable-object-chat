import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import "./tailwind.css";
import { Toaster } from "sonner";
import { RoomsSidebar } from "./components/rooms-sidebar";

import { cssBundleHref } from "@remix-run/css-bundle";
import sonnerStyles from "~/styles/sonner.css?url";
import { LinksFunction } from "@remix-run/cloudflare";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: sonnerStyles },
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
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

      <body className="w-screen h-screen grid place-items-center bg-background">
        <div className="background-split fixed inset-0 hidden min-[480px]:grid">
          <div className="col-span-2 bg-muted/50"></div>
          <div className="col-span-2 bg-background"></div>
        </div>
        <div className="isolate mx-auto w-full max-w-[70vw] px-8">
          <div className="grid h-[60vh] overflow-hidden rounded-2xl shadow-2xl min-[480px]:grid-cols-[theme(width.56),1fr]">
            <RoomsSidebar />
            {children}
          </div>
        </div>
        <Toaster visibleToasts={1} />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
