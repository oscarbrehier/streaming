import { filterCurated } from "./curated";
import { fetchtTMDB } from "./fetchTMDB";

export async function searchTMDB(
	query: string,
	type: "all" | "movie" | "tv" | null,
	page: number = 1,
	strict: boolean = true
) {
	
	if (!type) type = "all";

	const baseEndpoint = (type: string) =>
		`/search/${type}?query=${encodeURIComponent(query)}&language=en-US&page=${page}`;

	const applyFilter = async (results: any[]) =>
		strict ? filterCurated(results) : results;

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
				results: await applyFilter(allResults),
				total_results: movies.total_results + tv.total_results,
				total_pages: movies.total_pages + tv.total_pages,
			};

		};

		const data = await fetchtTMDB(baseEndpoint(type), { next: { revalidate: 120 } });
		return { ...data, results: await applyFilter(data.results) };

	} catch (err) {
		throw err;
	};

};