import { Search } from "./Search";
import { searchTMDB } from "@/utils/tmdb/search";

export default async function Page({
	searchParams
}: {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {

	const params = await searchParams;

	const query = Array.isArray(params.query) ? params.query[0] : params.query;

	const allowedTypes = ["all", "movie", "tv"] as const;
	const mediaTypeParam = Array.isArray(params.type) ? params.type[0] : params.type;
	const mediaType = allowedTypes.includes(mediaTypeParam as any) ? (mediaTypeParam as "all" | "movie" | "tv") : null;

	let data: any | null;

	if (query) {

		try {

			data = await searchTMDB(query, mediaType);

		} catch (err) {

			console.error("Search failed:", err);

		};

	};


	return (

		<Search
			query={query ?? null}
			type={mediaType ?? null}
			data={data}
		/>

	);

};