import { fetchtTMDB } from "./fetchTMDB";

async function getTopRatedIds(): Promise<Set<number>> {

	const pages = await Promise.all(
		Array.from({ length: 10 }, (_, i) =>
			fetchtTMDB(`/movie/top_rated?language=en-US&page=${i + 1}`, { next: { revalidate: 86400 } })
		)
	);

	const ids = new Set<number>();
	pages.forEach(page => page.results.forEach((m: any) => ids.add(m.id)));

	return ids;

};

export async function searchTMDB(
	query: string,
	type: "all" | "movie" | "tv" | null,
	page: number = 1,
	strict: boolean = true
) {
	if (!type) type = "all";

	const baseEndpoint = (type: string) =>
		`/search/${type}?query=${encodeURIComponent(query)}&language=en-US&page=${page}`;

	const filterResults = async (results: any[], mediaType: "movie" | "tv" | "all") => {

		if (!strict) return results;
		const topRatedIds = await getTopRatedIds();

		return results.filter(item => {
			if (!item.poster_path) return false;
			if (topRatedIds.has(item.id)) return true;
			if (item.vote_count < 50) return false;
			if (item.vote_average < 6.0) return false;
			if (item.adult) return false;

			const majorLanguages = ["en", "fr", "it", "ja", "de", "ko", "es", "pt", "ru", "zh"];
			if (!majorLanguages.includes(item.original_language) && item.vote_average < 7.0) return false;

			return true;
		});

	};

	try {

		if (type === "all") {

			const [movies, tv] = await Promise.all([
				fetchtTMDB(baseEndpoint("movie"), { next: { revalidate: 120 } }),
				fetchtTMDB(baseEndpoint("tv"), { next: { revalidate: 120 } }),
			]);

			const allResults = [
				...movies.results.map((item: any) => ({ ...item, type: "movie" })),
				...tv.results.map((item: any) => ({ ...item, type: "tv" })),
			];

			return {
				...movies,
				results: await filterResults(allResults, type),
				total_results: movies.total_results + tv.total_results,
				total_pages: movies.total_pages + tv.total_pages,
			};

		};

		const data = await fetchtTMDB(baseEndpoint(type), { next: { revalidate: 120 } });
		return { ...data, results: await filterResults(data.results, type) };

	} catch (err) {
		throw err;
	};

};