import { headers } from "next/headers";

interface RateLimit {
	windowStart: number;
	windowSize: number;
	maxRequests: number;
};

const requestMap = new Map<string, number>();
const rateLimiterDefault: RateLimit = {
	windowStart: Date.now(),
	windowSize: 60 * 60 * 1000,
	maxRequests: 5
};

export async function useRateLimit<T extends (...args: any[]) => any>(handler: T, options?: RateLimit) {

	return async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>> | { error: string }> => {

		const rateLimiter: RateLimit = {
			...rateLimiterDefault,
			...options,
			windowStart: options?.windowStart ?? Date.now()
		};

		const headersList = await headers();
		const ip = headersList.get("x-real-ip") ?? "unknown";

		const now = Date.now();
		const isNewWindow = now - rateLimiter.windowStart > rateLimiter.windowSize;

		if (isNewWindow) {

			rateLimiter.windowStart = now;
			requestMap.set(ip, 0);

		};

		const currentRequestCount = requestMap.get(ip) ?? 0;
		if (currentRequestCount >= rateLimiter.maxRequests) return { error: "Rate limit exceeded." };

		requestMap.set(ip, currentRequestCount + 1);
		return handler(...args);

	};

};