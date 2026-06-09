import { SearchForm } from "./SearchForm";
import { searchTMDB, searchTMDBFast } from "@/lib/tmdb/search";

export default async function Page({
	searchParams
}: {
	searchParams: Promise<{ query: string, type: string, strict: string }>
}) {

	const { query, type, strict: strictParams = "true" } = await searchParams;
	const strict = strictParams !== "false";

	const allowedTypes = ["all", "movie", "tv"] as const;
	const mediaType = allowedTypes.includes(type as any) ? (type as "all" | "movie" | "tv") : null;

	let fastData: any  = null;

	if (query) {

		try {

			const results = await searchTMDBFast(query, mediaType ?? "all");
			fastData = {
				results,
				total_results: results.length,
				total_page: 1
			};

		} catch (err) {

			console.error("Search failed:", err);

		};

	};

	return (

		<SearchForm
			query={query ?? null}
			type={mediaType ?? null}
			strict={strict}
			data={fastData}
		/>

	);

};