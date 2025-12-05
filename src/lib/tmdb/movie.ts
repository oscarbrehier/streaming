import { fetchtTMDB } from "./fetchTMDB";

export async function getMovie<T = MovieDetailsWithImages>(movieId: string): Promise<T> {

	const data = await fetchtTMDB(`/movie/${movieId}?language=en-US&append_to_response=images`);
	return data as T;

};

export async function getMainCast(movieId: string, maxSize?: number): Promise<CastMember[] | null> {

	"use cache"

	try {

		const data = await fetchtTMDB<CreditsResponse>(`/movie/${movieId}/credits?language=en-US`);
		if (data.cast.length === 0) return null;

		const mainCast = data.cast
			.filter((member) => member.known_for_department === "Acting")
			.slice(0, maxSize ?? 5);

		return mainCast;

	} catch (err) {
		return null;
	};

};