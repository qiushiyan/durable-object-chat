import { Hono, HonoRequest } from "hono";
import { cors } from "hono/cors";

const app = new Hono<{ Bindings: Env }>();

app.get("/rooms/:name/ws", async (c) => {
	const upgrade = c.req.header("Upgrade");
	if (!upgrade || upgrade !== "websocket") {
		return c.text("Upgrade header must be websocket", 426);
	}

	const name = c.req.param("name");
	const id = c.env.ROOM.idFromName(name);
	const stub = c.env.ROOM.get(id);
	return stub.fetch(c.req.raw);
});

export * from "./room";
export * from "./limiter";
export default app;
