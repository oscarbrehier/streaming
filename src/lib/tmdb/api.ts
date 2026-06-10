import { PostCardItem } from "@/components/movie-cards/Poster";
import { fetchTMDB, fetchUntilEnough } from "./fetchTMDB";
import { filterCurated } from "./curated";

export async function getGenres(): Promise<{ result: Genre[] | null, error: string | null }> {

	try {

		const res = await fetchTMDB<{ genres: Genre[] }>(`/genre/movie/list`);
		return { result: res.genres, error: null };

	} catch (err) {
		return { error: (err as Error).message, result: null }
	};

};

export async function getTopToday<T = MovieSearchResponse | TvSearchResponse>(mediaType: MediaType = "movie"): Promise<PostCardItem[]> {

	const randomPage = Math.floor(Math.random() * 8) + 1;

	return fetchUntilEnough(
		page => `/discover/${mediaType}?include_adult=false&language=en-US&page=${page}&sort_by=vote_average.desc&vote_count.gte=1000&vote_count.lte=150000&vote_average.gte=7.2`,
		mediaType,
		16,
		5,
		randomPage
	);

};

export async function getPerson(query: string): Promise<PersonDetails[]> {

	const res = await fetchTMDB<PersonSearchResponse>(`/search/person?query=${query}`);
	return res.results ?? [];

};