import type { ActionFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { Form, redirect, useNavigate } from "@remix-run/react";
import { useAtomValue } from "jotai";
import { useTransition } from "react";
import EditableName from "~/components/editable-name";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { roomsAtom } from "~/lib/store";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    {
      name: "description",
      content: "Welcome to Remix on Cloudflare!",
    },
  ];
};

export default function Index() {
  const rooms = useAtomValue(roomsAtom);
  const [pending, startTransition] = useTransition();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-full gap-2 p-2">
      <h2 className="text-lg font-medium">Choose your name</h2>
      <EditableName className="w-48" />
      {/* select a room */}
      <Form method="post">
        <Select
          name="room"
          onValueChange={(value) => {
            startTransition(() => {
              navigate(`/rooms/${value}`);
            });
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a room" />
          </SelectTrigger>
          <SelectContent>
            {rooms.map((room) => (
              <SelectItem key={room} value={room}>
                {room}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Form>
    </div>
  );
}
