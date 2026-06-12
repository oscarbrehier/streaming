const CANONICAL_IDS: Set<number> = new Set([]);

const EXCLUDED_GENRES = new Set([10763, 10764, 10766, 10767]);

const MAJOR_LANGUAGES = new Set([
	"en", "fr", "it", "ja", "de", "ko", "es", "pt", "ru", "zh", "sv", "da", "pl", "hu", "fa", "tr", "cn"
]);

export async function filterCurated(results: any[]): Promise<any[]> {

	return results.filter(item => {

		if (!item.poster_path) return false;
		if (item.adult) return false;

		if (CANONICAL_IDS.has(item.id)) return true;

		const genreIds: number[] = item.genre_ids ?? item.genres?.map((g: any) => g.id) ?? [];
		if (genreIds.some(id => EXCLUDED_GENRES.has(id))) return false;

		if (item.vote_count < 50) return false;
		if (item.vote_average < 6.0) return false;

		if (!MAJOR_LANGUAGES.has(item.original_language)) {
			if (item.vote_average < 7.0 || item.vote_count < 200) return false;
		}

		return true;

	});

};