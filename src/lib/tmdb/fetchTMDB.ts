"use server"

import { PostCardItem } from "@/components/movie-cards/Poster";
import { filterCurated } from "./curated";

export async function fetchTMDB<T = any>(endpoint: string, options: RequestInit = {}) {

	const headers: Record<string, string> = {
		...(!(options.body instanceof FormData) && { "Content-Type": "application/json" }),
		...options.headers as Record<string, string>,
		"Authorization": `Bearer ${process.env.TMDB_READ_TOKEN}`
	};

	const url = `https://api.themoviedb.org/3${endpoint}`;

	const res = await fetch(url, {
		...options,
		headers,
	});

	if (!res.ok) {
		throw new Error(`HTTP Error ${res.status}:${res.statusText}`);
	};

	const data = await res.json();
	return data as T;

};

export async function fetchUntilEnough<T extends { id: number; poster_path?: string | null }>(
	buildUrl: (page: number) => string,
	mediaType: "movie" | "tv",
	target: number = 10,
	maxPages: number = 5,
	startPage: number = 1
): Promise<T[]> {

	const results: T[] = [];
	let page = startPage;

	while (results.length < target && page <= startPage + maxPages) {

		const data = await fetchTMDB<{ results: T[] }>(buildUrl(page));

		const filtered = await filterCurated(
			data.results.map(item => ({ ...item, mediaType }))
		);

		results.push(...filtered as T[]);
		page++;

	};

	return results.slice(0, target);

}