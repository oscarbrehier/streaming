"use server"

import { useRateLimit } from "@/lib/rateLimit"
import { createAuditLog } from "@/utils/db/createAuditLog";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function requestOTPCodeHandler(
	supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<{ error: null | string }> {

	try {

		const { data: { session }, error: sessionError } = await supabase.auth.getSession();

		if (sessionError || !session?.access_token) {

			createAuditLog({
				action: "initiate_2fa_failed",
				resource: "auth.session",
				details: {
					error: sessionError?.message || "No active session"
				}
			});

			return { error: "Session expired. Please login in again." };

		}

		const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/2fa/initiate`, {
			method: "POST",
			headers: {
				"Authorization": `Bearer ${session.access_token}`
			}
		});

		if (!res.ok) {

			const errorText = await res.text();
			createAuditLog({
				action: "initiate_2fa_failed",
				resource: "api.2fa.initiate",
				details: {
					status: res.status,
					statusText: res.statusText,
					body: errorText.slice(0, 200)
				}
			});

			if (res.status === 429) return { error: "Too many attempts. Please wait." };
			return { error: "We couldn't send your code. Please try again in a moment." };

		};

		if (res.ok) {

			const cookieStore = await cookies();

			cookieStore.set("otp_sent_recently", "true", {
				maxAge: 60,
				path: "/",
				httpOnly: true
			});

			return { error: null };

		};

		createAuditLog({
			action: "initiate_2fa_success",
			resource: "api.2fa.initiate",
		});

		return { error: null };

	} catch (err) {

		console.error(err)

		await createAuditLog({
			action: "initiate_2fa_error",
			resource: "internal.server_error",
			details: { error: err instanceof Error ? err.message : "Unknown" }
		});

		return { error: "A connection error occurred. Check your network." };

	};

};

export async function requestOTPCode(): Promise<{ error: string | null }> {

	const rateLimitedRequest = await useRateLimit(requestOTPCodeHandler, "request-code", {
		maxRequests: process.env.NODE_ENV === "development" ? 100 : 1,
		windowSize: 1 * 60 * 1000
	});

	try {

		const result = await rateLimitedRequest();
		return result;

	} catch (err) {

		const isRateLimit = err instanceof Error && err.message.toLowerCase().includes("rate limit");

		if (isRateLimit) {

			createAuditLog({
				action: "rate_limit_triggered",
				resource: "otp_request",
			});

			return { error: "Please wait 60 seconds before requesting another code." };

		};

		return { error: "An unexpected error occurred." };

	};

};