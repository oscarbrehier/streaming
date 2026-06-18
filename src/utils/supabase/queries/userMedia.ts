import { getMovie } from "@/lib/tmdb/movie";
import { createClient } from "../server";
import { getActiveProfileId } from "@/utils/profiles";

export async function getRecentlyWatched(userId: string): Promise<MovieSummary[]> {

	const supabase = await createClient();

	const profileId = await getActiveProfileId();
	if (!profileId) return [];

	const { data, error } = await supabase
		.from("user_media_status")
		.select("*")
		.eq("user_id", userId)
		.eq("profile_id", profileId)
		.order("last_watched", { ascending: false });;

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

export async function getMediaStatus(mediaId: string): Promise<UserMediaStatus | null> {

	const supabase = await createClient();

	const { data: { user } } = await supabase.auth.getUser();
	if (!user) return null;

	const profileId = await getActiveProfileId();
	if (!profileId) return null;

	const { data, error } = await supabase
		.from("user_media_status")
		.select("*")
		.eq("user_id", user.id)
		.eq("profile_id", profileId)
		.eq("media_id", mediaId)
		.maybeSingle();

	if (error || !data) return null;

	return data;

};