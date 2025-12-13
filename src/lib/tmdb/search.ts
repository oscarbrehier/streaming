import { fetchtTMDB } from "./fetchTMDB";

export async function searchTMDB(query: string, type: "all" | "movie" | "tv" | null, page: number = 1) {

	if (!type) type = "all";

	const baseEndpoint = (type: string) =>
		`/search/${type}?query=${encodeURIComponent(query)}&language=en-US&page=${page}`;

	try {

		if (type === "all") {

			const movies = await fetchtTMDB(baseEndpoint("movie"), { next: { revalidate: 120 } });
			const tv = await fetchtTMDB(baseEndpoint("tv"), { next: { revalidate: 120 } });

			const combined = {
				...movies,
				results: [
					...movies.results.map((item: any) => ({ ...item, type: "movie" })),
					...tv.results.map((item: any) => ({ ...item, type: "tv" }))
				],
				total_results: movies.total_results + tv.total_results,
				total_pages: movies.total_pages + tv.total_pages
			};

			return combined;

		};

		const data = await fetchtTMDB(baseEndpoint(type), { next: { revalidate: 120 } });
		return data;

	} catch (err) {

		throw err;

	};

};