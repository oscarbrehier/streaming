import { fetchtTMDB } from "./fetchTMDB";

export async function getMovie(movieId: string): Promise<MovieDetailsWithImages> {

	const data = await fetchtTMDB(`/movie/${movieId}?language=en-US&append_to_response=images`);
	return data;

};