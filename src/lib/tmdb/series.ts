import { fetchTMDB } from "./fetchTMDB";

export async function getSerie<T = TvDetailsWithImages>(seriesId: string): Promise<T> {
	const data = await fetchTMDB(`/tv/${seriesId}?language=en-US&append_to_response=images&include_image_language=en,null`, { next: { revalidate: 43200 } });
	return { ...data, mediaType: "tv" } as T;
};

export async function getSeriesCredits(seriesId: string): Promise<CreditsResponse | null> {

	try {

		const data = await fetchTMDB<CreditsResponse>(`/tv/${seriesId}/credits?language=en-US`, { next: { revalidate: 86400 } });
		if (data.cast.length === 0) return null;

		return data;

	} catch (err) {
		return null;
	};

};

export async function getSeason(seriesId: string, season: string): Promise<TvSeason | null> {
	try {

		const data = await fetchTMDB<TvSeason>(`/tv/${seriesId}/season/${season}?language=en-US`, { next: { revalidate: 86400 } });
		return data;

	} catch (err) {
		return null;
	};
};