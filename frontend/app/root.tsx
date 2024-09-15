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
import { LinksFunction, MetaFunction } from "@remix-run/cloudflare";

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
        <title>Chat</title>
        <meta
          name="description"
          content="Chat room powered by cloudflare durable objects"
        />
        <Meta />
        <Links />
      </head>

      <body className="w-screen h-screen grid place-items-center bg-background">
        <div className="background-split fixed inset-0 hidden min-[480px]:grid">
          <div className="col-span-2 bg-muted/50"></div>
          <div className="col-span-2 bg-background"></div>
        </div>
        <div className="isolate mx-auto w-full max-w-[70vw] px-8 h-[60vh]">
          <div className="grid h-full overflow-hidden rounded-2xl shadow-2xl min-[480px]:grid-cols-[theme(width.56),1fr]">
            <RoomsSidebar />
            {children}
          </div>
          <footer className="flex justify-center mt-4">
            <a href="https://github.com/qiushiyan/durable-object-chat">
              <span className="sr-only">github link</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
          </footer>
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
