import { DurableObject } from "cloudflare:workers";

const milliseconds_per_request = 500;
const milliseconds_for_grace_period = 5000;

export class RateLimiter extends DurableObject {
	private nextAllowedTime: number;

	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
		this.nextAllowedTime = 0;
	}

	async getMillisecondsToNextRequest() {
		const now = Date.now();

		this.nextAllowedTime = Math.max(now, this.nextAllowedTime);
		this.nextAllowedTime += milliseconds_per_request;

		const value = Math.max(
			0,
			this.nextAllowedTime - now - milliseconds_for_grace_period,
		);
		return value;
	}
}
