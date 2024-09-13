import {
  useFetcher,
  useLoaderData,
  useLocation,
  useParams,
} from "@remix-run/react";
import { useAtom } from "jotai";
import { cn } from "lib/utils";
import { SendHorizontal, UsersIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import EditableName from "~/components/editable-name";
import { nameAtom } from "~/lib/store";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Button } from "~/components/ui/button";
import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

type Message =
  | { message: string; from: string; timestamp: number; type: "chat" }
  | { message: string; timestamp: number; type: "system" };

export const loader = async ({ context }: LoaderFunctionArgs) => {
  return {
    context: context.cloudflare,
  };
};

export default function Room() {
  const { context } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const { pathname } = useLocation();

  const params = useParams() as { name: string };
  const [messages, setMessages] = useState<Message[]>([]);
  const ws = useRef<WebSocket>();
  const [name, _] = useAtom(nameAtom);
  const [users, setUsers] = useState<string[]>([]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const message = String(formData.get("message"));

    if (!ws.current) return;

    ws.current.send(
      JSON.stringify({
        type: "chat",
        message,
        timestamp: Date.now(),
      })
    );
    e.currentTarget.reset();
  };

  useEffect(() => {
    try {
      setMessages([]);
      const wss = document.location.protocol === "http:" ? "ws://" : "wss://";
      const wsUrl = `${wss}${context.env.API_URL}/rooms/${params.name}/ws`;

      console.log("connecting to", wsUrl);

      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        ws.current?.send(JSON.stringify({ type: "join", name }));
      };

      ws.current.onmessage = (e) => {
        console.log("received", e.data);
        const payload = JSON.parse(e.data);
        if (payload.type === "users") {
          setUsers(payload.users);
        } else {
          setMessages((messages) => [...messages, payload]);
        }
      };

      ws.current.onclose = () => {};

      ws.current.onerror = (error) => {
        console.log("Websocket connection error", error);
        toast.error("The websocket API is not available");
      };
    } catch (error) {
      console.error("WebSocket connection error:", error);
      toast.error("The websocket API is not available");
      throw error;
    }

    return () => {
      //   ws.current?.send(JSON.stringify({ type: "leave", name }));
      ws.current?.close(1000, "User left");
    };
  }, [params, name]);

  return (
    <main className="flex flex-col h-full" key={pathname}>
      <div className="flex-grow p-4 relative">
        <UsersList users={users} />
        <ul className="grid gap-1.5">
          {messages.map((message, index) => (
            <li
              key={index}
              className={cn(
                message.type === "chat" ? "" : "text-muted-foreground"
              )}
            >
              {message.type === "chat" ? (
                <div key={message.timestamp}>
                  <div className="flex items-baseline">
                    <span className="font-semibold mr-2">{message.from}</span>
                    <span className="text-xs text-accent hidden lg:block">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-foreground/80">{message.message}</p>
                </div>
              ) : (
                <div className="flex gap-2  items-center">
                  <p className="text-muted-foreground">{message.message}</p>
                  <time className="text-sm text-muted-foreground hidden lg:block">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </time>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      <footer className="mt-auto flex flex-col gap-2 p-4 border-t border-slate-300">
        <fetcher.Form
          className="grid lg:grid-cols-[1fr_auto] gap-2"
          onSubmit={onSubmit}
        >
          <Label className="flex flex-col flex-grow gap-2">
            <span className="sr-only">Enter Message</span>
            <Input
              name="message"
              type="text"
              placeholder="Type a message..."
              className="flex-grow"
            />
          </Label>
          <Button type="submit" className="gap-1">
            <SendHorizontal className="size-4" />
            Send
          </Button>
          <EditableName
            onSave={(name) =>
              ws.current?.send(JSON.stringify({ type: "update-name", name }))
            }
          />
        </fetcher.Form>
      </footer>
    </main>
  );
}
const UsersList = ({
  users,
  className,
}: {
  users: string[];
  className?: string;
}) => {
  return (
    <Popover>
      <PopoverTrigger
        className={cn("absolute top-2 right-2", className)}
        asChild
      >
        <Button variant={"ghost"}>
          <UsersIcon className="size-4" />
          <span className="sr-only">users</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="start" className="w-40">
        <ul>
          {users.map((user) => (
            <li key={user} className="text-sm flex gap-1 items-center">
              <span className="size-2 rounded-full bg-green-400" />
              {user}
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
};
