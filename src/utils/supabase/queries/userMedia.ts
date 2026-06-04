import { getMovie } from "@/lib/tmdb/movie";
import { createClient } from "../server";

export async function getRecentlyWatched(userId: string): Promise<MovieSummary[]> {

	const supabase = await createClient();

	const { data, error } = await supabase
		.from("user_media_status")
		.select("*")
		.eq("user_id", userId);

		
	if (error || data.length === 0) return [];
		
	const movies = [];

	for (const entry of data) {

		try {

			const movie = await getMovie<MovieSummary>(entry.media_id);
			if (movie) movies.push(movie);

		} catch (err) {};

	};

	return movies;

};
