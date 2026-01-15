"use server"

import { createAuditLog } from "@/utils/db/createAuditLog";

export async function getStreamingSources(mediaId: string, type: "movie" | "tv"): Promise<{ sources: MediaSources | null }> {

	const { data: cached, isStale } = await checkCacheForSources(mediaId);

	if (cached && !isStale) {
		console.log("Serving sources from cache")
		return { sources: cached };
	};

	if (cached && isStale) {
		triggerBackgroundScrape(mediaId).catch((err) => console.log("Background Scrape Error:", err));
		return { sources: cached };
	};

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

async function triggerBackgroundScrape(mediaId: string) {

	const endpoint = `${process.env.NEXT_PUBLIC_LIBRARY_URL}/movie/${mediaId}`;
	await fetch(endpoint, {
		method: "GET",
		headers: {
			"Authorization": `Bearer ${process.env.LIBRARY_SECRET}`,
			"Content-Type": "application/json"
		}
	});

};

async function checkCacheForSources(mediaId: string): Promise<{ data: MediaSources | null, isStale: boolean }> {

	const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cache/media-${mediaId}`, {
		headers: {
			'Authorization': `Bearer ${process.env.API_INTERNAL_KEY}`
		}
	});

	if (!res.ok) return { data: null, isStale: false };
	return await res.json();

};