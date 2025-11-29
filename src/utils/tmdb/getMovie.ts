import { fetchtTMDB } from "./fetchTMDB";

export async function getMovie<T = MovieDetailsWithImages>(movieId: string): Promise<T> {

	const data = await fetchtTMDB(`/movie/${movieId}?language=en-US&append_to_response=images`);
	return data as T;

};