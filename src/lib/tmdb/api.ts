import { PostCardItem } from "@/components/movie-cards/Poster";
import { fetchtTMDB } from "./fetchTMDB";

export async function getGenres(): Promise<{ result: Genre[] | null, error: string | null }> {

	try {

		const res = await fetchtTMDB<{ genres: Genre[] }>(`/genre/movie/list`);
		return { result: res.genres, error: null };

	} catch (err) {
		return { error: (err as Error).message, result: null }
	};

};

export async function getTopToday<T = MovieSearchResponse | TvSearchResponse>(mediaType?: MediaType): Promise<PostCardItem[]> {
	const type = mediaType ?? "movie";
	const data = await fetchtTMDB<{ results: PostCardItem[] }>(`/discover/${type}?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc`);

	return data.results.map(item => ({ ...item, mediaType: type })) ?? [];
};