import { fetchtTMDB } from "./fetchTMDB";

export async function getTopRatedIds(): Promise<Set<number>> {
	const pages = await Promise.all(
		Array.from({ length: 10 }, (_, i) =>
			fetchtTMDB(`/movie/top_rated?language=en-US&page=${i + 1}`, { next: { revalidate: 86400 } })
		)
	);
	const ids = new Set<number>();
	pages.forEach(page => page.results.forEach((m: any) => ids.add(m.id)));
	return ids;
};

export async function filterCurated(results: any[]): Promise<any[]> {
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