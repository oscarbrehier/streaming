import { fetchtTMDB } from "./fetchTMDB";

export async function getMovie(movieId: string) {

	const data = await fetchtTMDB(`/movie/${movieId}`);
	return data;

};