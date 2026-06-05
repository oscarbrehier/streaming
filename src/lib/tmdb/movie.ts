import { fetchtTMDB } from "./fetchTMDB";

export async function getMovie<T = MovieDetailsWithImages>(movieId: string): Promise<T> {
	const data = await fetchtTMDB(`/movie/${movieId}?language=en-US&append_to_response=images`, { next: { revalidate: 43200 } });
	return { ...data, mediaType: "movie" } as T;
};

export async function getMovieVideos(movieId: string): Promise<VideoResult[]> {
	const data = await fetchtTMDB<VideosResponse>(`/movie/${movieId}/videos?language=en-US`, { next: { revalidate: 43200 } });
	return data.results.filter(v => v.site == "YouTube");
};

export async function getCast(movieId: string): Promise<CreditsResponse | null> {

	try {

		const data = await fetchtTMDB<CreditsResponse>(`/movie/${movieId}/credits?language=en-US`, { next: { revalidate: 86400 } });
		if (data.cast.length === 0) return null;

		return data;

	} catch (err) {
		return null;
	};

};