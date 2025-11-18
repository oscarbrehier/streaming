import { createAuditLog } from "@/utils/db/createAuditLog";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";

interface RateLimit {
	windowStart: number;
	windowSize: number;
	maxRequests: number;
}

const requestMap = new Map<string, number>();
const rateLimiterDefault: RateLimit = {
	windowStart: Date.now(),
	windowSize: 60 * 60 * 1000,
	maxRequests: 5
};

export async function useRateLimit<Args extends any[], Return>(
	handler: (supabase: Awaited<ReturnType<typeof createClient>>, ...args: Args) => Promise<Return>,
	resource: string,
	options?: Partial<RateLimit>
): Promise<(...args: Args) => Promise<Return>> {

	return async (...args: Args): Promise<Return> => {

		const rateLimiter: RateLimit = {
			...rateLimiterDefault,
			...options,
			windowStart: options?.windowStart ?? Date.now()
		};

		const headersList = await headers();
		const ip = headersList.get("x-forwarded-for") ?? "unknown";

		const now = Date.now();
		const isNewWindow = now - rateLimiter.windowStart > rateLimiter.windowSize;

		if (isNewWindow) {
			rateLimiter.windowStart = now;
			requestMap.set(ip, 0);
		};

		const supabase = await createClient();
		
		const currentRequestCount = requestMap.get(ip) ?? 0;

		if (currentRequestCount >= rateLimiter.maxRequests) {
			const { data: { user } } = await supabase.auth.getUser();

			await createAuditLog({
				user_id: user?.id ?? "unknown",
				action: "rate_limit_exceeded",
				resource,
				details: {
					context: `Rate limit exceeded on: ${resource}`
				}
			});

			throw new Error("Rate limit exceeded.");
		}

		requestMap.set(ip, currentRequestCount + 1);

		return handler(supabase, ...args);

	};

};