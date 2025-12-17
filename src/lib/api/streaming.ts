"use server"

import { createAuditLog } from "@/utils/db/createAuditLog";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

type SourceAPIResponse = {
	files: { file: string, type: string, lang: string }[];
	subtitles: { url: string, lang: string, type: string }[];
};

export async function getStreamingSources(mediaId: string, type: "movie" | "tv"): Promise<{ result: SourceAPIResponse | null }> {

	const supabase = await createClient();
	const { data: { session } } = await supabase.auth.getSession();

	if (!session?.access_token) redirect("/login");

	const endpoint = `${process.env.NEXT_PUBLIC_STREAMING_API_URL}/streaming/sources`;

	try {

		const res = await fetch(endpoint, {
			method: "POST",
			headers: {
				"Authorization": `Bearer ${session.access_token}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ mediaId, type })
		});

		if (!res.ok) {

			createAuditLog({
				action: "fetch_sources_api_error",
				resource: "streaming",
				details: {
					mediaId,
					mediaType: type,
					endpoint,
					statusCode: res.status,
					statusText: res.statusText,
					userId: session.user.id,
				}
			});

			return { result: null };

		}

		const data = await res.json();

		return { result: data?.result ?? null };

	} catch (err) {

		createAuditLog({
			action: "fetch_sources_exception",
			resource: "streaming",
			details: {
				mediaId,
				mediaType: type,
				endpoint,
				userId: session.user.id,
				error:
					err instanceof Error
						? {
							message: err.message,
							stack: err.stack,
							name: err.name,
						}
						: "Unknown error",
			}
		});

		return { result: null };

	};

};