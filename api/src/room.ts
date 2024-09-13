import { DurableObject } from "cloudflare:workers";
import { RateLimiter } from "./limiter";

// a client's session
type Session = {
	name?: string;
	limiterId: string;
	blockedMessages: Message[];
};

type Message =
	| {
			type: "chat";
			message: string;
			from: string;
			timestamp: number;
	  }
	| {
			type: "system";
			message: string;
			timestamp: number;
	  }
	| {
			type: "users";
			users: string[];
	  };

export class Room extends DurableObject<Env> {
	private storage: DurableObjectStorage;

	private sessions: Map<WebSocket, Session>;

	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
		this.storage = this.ctx.storage;
		this.sessions = new Map();
		this.env = env;

		// restore connections after hibernation
		this.ctx.blockConcurrencyWhile(async () => {
			this.storage.deleteAll();
			this.ctx.getWebSockets().forEach((websocket) => {
				this.sessions.set(websocket, {
					...websocket.deserializeAttachment(),
					blockedMessages: [],
				});
			});
		});
	}

	async fetch(request: Request) {
		const websocketPair = new WebSocketPair();
		const [client, server] = Object.values(websocketPair);

		this.ctx.acceptWebSocket(server);
		await this.handleSession(
			server,
			request.headers.get("CF-Connecting-IP") || "global",
		);

		return new Response(null, {
			status: 101,
			webSocket: client,
		});
	}

	async handleSession(server: WebSocket, ip: string) {
		const limiterId = this.env.LIMITER.idFromName(ip);
		const limiterStub = this.env.LIMITER.get(limiterId);

		const session: Session = {
			limiterId: limiterId.toString(),
			blockedMessages: [],
		};

		server.serializeAttachment({
			...server.deserializeAttachment(),
			limiterId: limiterId.toString(),
		});

		this.sessions.set(server, session);

		const historyMessages = await this.storage.list({
			reverse: true,
			limit: 100,
		});
		const backlog = [...historyMessages.values()];
		backlog.reverse();
		backlog.forEach((message) => {
			session.blockedMessages.push(JSON.parse(message as string) as Message);
		});
	}

	async broadcast(message: Message) {
		this.sessions.forEach((session, ws) => {
			if (!session.name) {
				session.blockedMessages.push(message);
			} else {
				ws.send(JSON.stringify(message));
			}
		});
	}

	async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
		console.log("received message", message);
		const session = this.sessions.get(ws);

		if (!session) {
			ws.close(1011, "Session not found");
			return;
		}

		const limiterId = this.env.LIMITER.idFromString(session.limiterId);
		const limiterStub = this.env.LIMITER.get(limiterId);

		const millisecondsToNextRequest =
			// @ts-ignore
			await limiterStub.getMillisecondsToNextRequest();

		if (millisecondsToNextRequest > 0) {
			ws.send(
				JSON.stringify({
					type: "rate-limit",
					retryAfter: millisecondsToNextRequest / 1000,
				}),
			);
			return;
		}

		const payload = JSON.parse(message as string) as any;
		if (payload.type === "join") {
			session.name = payload.name;
			ws.serializeAttachment({
				...ws.deserializeAttachment(),
				name: payload.name,
			});

			// release blocked messages for new user
			session.blockedMessages.forEach((message) => {
				ws.send(JSON.stringify(message));
			});

			this.broadcast(SystemMessage(`${session.name} joined the room`));
			this.broadcast(UsersMessage(await this.getUsers()));

			session.blockedMessages = [];

			return;
		}

		if (payload.type === "update-name") {
			session.name = payload.name;
			ws.serializeAttachment({
				...ws.deserializeAttachment(),
				name: payload.name,
			});
			return;
		}

		if (payload.type === "chat") {
			if (!session.name) {
				ws.close(1011, "Session without name");
				return;
			}
			const data = ChatMessage(
				payload.message,
				session.name,
				payload.timestamp,
			);
			this.broadcast(data);
			// Save message.
			const key = new Date(payload.timestamp).toISOString();
			await this.storage.put(key, JSON.stringify(data));
		}
	}

	async webSocketClose(ws: WebSocket, code?: number, reason?: string) {
		this.sessions.delete(ws);
		ws.close(code || 1000, reason || "durable object closed websocket");

		this.broadcast(UsersMessage(await this.getUsers()));
	}

	async getUsers() {
		const names: string[] = [];
		this.sessions.forEach((session) => {
			if (session.name) {
				names.push(session.name);
			}
		});
		return names;
	}
}

function ChatMessage(
	message: string,
	from: string,
	timestamp: number,
): Message {
	return { message, from, timestamp, type: "chat" };
}

function SystemMessage(message: string): Message {
	return { message, type: "system", timestamp: Date.now() };
}

function UsersMessage(users: string[]): Message {
	return { users, type: "users" };
}
