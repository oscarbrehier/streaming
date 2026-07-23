"use server"

import { scrape } from "@/services/sources/providers";

const PROXY_PREFIX = "/api/proxy/m3u8?url=";

function withProxiedSources(sources: MediaSources): MediaSources {

	return {
		...sources,
		files: sources.files.map((f) => {
			if (f.type !== "hls") return f;
			if (f.file.startsWith(PROXY_PREFIX)) return f;
			return { ...f, file: `${PROXY_PREFIX}${encodeURIComponent(f.file)}` };
		}),

	};

};

export async function getStreamingSources(mediaId: string, type: "movie" | "tv"): Promise<{ sources: MediaSources | null }> {

	try {

		const sources = await scrape(mediaId);
		return { sources: withProxiedSources(sources) };

	} catch (err) {

		console.error(err);
		return { sources: null };

	};

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

export async function hasCachedSources(mediaId: string): Promise<boolean> {

	const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cache/media-${mediaId}`, {
		method: "HEAD",
		headers: {
			'Authorization': `Bearer ${process.env.API_INTERNAL_KEY}`
		}
	});

	return res.ok;

};