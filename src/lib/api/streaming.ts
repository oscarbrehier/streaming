"use server"

import { createAuditLog } from "@/utils/db/createAuditLog";
import { cacheLife } from "next/cache";

export async function getStreamingSources(mediaId: string, type: "movie" | "tv"): Promise<{ sources: MediaSources | null }> {

	"use cache"
	cacheLife("hours");

	const endpoint = `${process.env.NEXT_PUBLIC_LIBRARY_URL}/movie/${mediaId}`;

	try {

		const res = await fetch(endpoint, {
			method: "GET",
			headers: {
				"Authorization": `Bearer ${process.env.LIBRARY_SECRET}`,
				"Content-Type": "application/json"
			}
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
				}
			});

			return { sources: null };

		}

		const data = await res.json();

		return { sources: data ?? null };

	} catch (err) {

		createAuditLog({
			action: "fetch_sources_exception",
			resource: "streaming",
			details: {
				mediaId,
				mediaType: type,
				endpoint,
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

		return { sources: null };

	};

};