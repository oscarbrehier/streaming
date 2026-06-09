import { SearchForm } from "./SearchForm";

export default async function Page({
	searchParams
}: {
	searchParams: Promise<{ query: string, type: string, strict: string }>
}) {

	const { query, type, strict: strictParams = "true" } = await searchParams;
	const strict = strictParams !== "false";

	const allowedTypes = ["all", "movie", "tv"] as const;
	const mediaType = allowedTypes.includes(type as any) ? (type as "all" | "movie" | "tv") : null;

	return (

		<SearchForm
			query={query ?? null}
			type={mediaType ?? null}
			strict={strict}
		/>

	);

};