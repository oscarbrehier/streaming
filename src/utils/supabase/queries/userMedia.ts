import { getMovie } from "@/lib/tmdb/movie";
import { createClient } from "../server";
import { getActiveProfileId } from "@/utils/profiles";

export async function getRecentlyWatched(userId: string): Promise<MovieSummary[]> {

	const supabase = await createClient();

	const profileId = await getActiveProfileId();

	if (!profileId) throw "TODO_profile_id";

	const { data, error } = await supabase
		.from("user_media_status")
		.select("*")
		.eq("user_id", userId)
		.eq("profile_id", profileId);

	if (error || data.length === 0) return [];

	const movies = [];

	for (const entry of data) {

		try {

			const movie = await getMovie<MovieSummary>(entry.media_id);
			if (movie) movies.push(movie);

		} catch (err) { };

	};

	return movies;

};
