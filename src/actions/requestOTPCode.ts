"use server"

import { useRateLimit } from "@/lib/rateLimit"
import { createClient } from "@/utils/supabase/server";

export async function requestOTPCodeHandler(
	supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<void> {

	const { data: { session } } = await supabase.auth.getSession();
	if (!session?.access_token) throw new Error("User not authenticated");
	
	await fetch(`${process.env.NEXT_PUBLIC_STREAMING_API_URL}/2fa/initiate`, {
		method: "POST",
		headers: {
			"Authorization": `Bearer ${session.access_token}`
		}
	});

};

export async function requestOTPCode(): Promise<{ error: string | null }> {

	const rateLimitedRequest = await useRateLimit(requestOTPCodeHandler, "request-code", {
		maxRequests: process.env.NODE_ENV === "development" ? 100 : 1,
		windowSize: 1 * 60 * 1000
	});

	try {

		await rateLimitedRequest();
		return { error: null }

	} catch (err) {

		console.error(err)

		return {
			error: err instanceof Error ? err.message : "An error occurred. Please try again later."
		};

	};

};