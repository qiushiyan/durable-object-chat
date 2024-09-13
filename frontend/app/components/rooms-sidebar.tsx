import { NavLink, useNavigate } from "@remix-run/react";
import { useAtom } from "jotai";
import { Plus } from "lucide-react";
import { roomsAtom } from "~/lib/store";
import { cn } from "~/lib/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useTransition } from "react";
import { toast } from "sonner";

export const RoomsSidebar = () => {
  const [rooms, setRooms] = useAtom(roomsAtom);
  const [pending, startTransition] = useTransition();
  const navigate = useNavigate();

  const handleAddRoom = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);
    const roomName = String(formData.get("room"));
    if (roomName.length < 3) {
      toast.warning("Room name must be at least 3 characters long");
      return;
    }

    if (rooms.includes(roomName)) {
      toast.warning("Room already exists");
      return;
    }

    setRooms([...rooms, roomName]);

    startTransition(() => {
      navigate(`/rooms/${roomName}`);
    });
  };

  return (
    <aside className="p-4">
      <h2 className="text-lg font-semibold mb-4 text-primary">Rooms</h2>{" "}
      <ul className="flex flex-col gap-2 text-lg">
        {rooms.map((room) => (
          <li key={room}>
            <NavLink
              className={({ isActive }) =>
                cn(
                  isActive ? "bg-muted shadow-md" : "",
                  "block py-2 px-4 rounded-md font-light"
                )
              }
              to={`/rooms/${room}`}
            >
              {room}
            </NavLink>
          </li>
        ))}
      </ul>
      {/* <form onSubmit={handleAddRoom} className="flex space-x-2 mt-4">
        <Input
          type="text"
          placeholder="New room name"
          name="room"
          className="flex-grow"
        />
        <Button type="submit" size="icon">
          <Plus className="h-4 w-4" />
          <span className="sr-only">Add room</span>
        </Button>
      </form> */}
    </aside>
  );
};
