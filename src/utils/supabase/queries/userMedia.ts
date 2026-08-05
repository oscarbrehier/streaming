import { getMovie } from "@/lib/tmdb/movie";
import { createClient } from "../server";
import { getActiveProfileId } from "@/utils/profiles";
import { getSerie } from "@/lib/tmdb/series";

export async function getRecentlyWatched(userId: string): Promise<(MovieSummary | TvSummary)[]> {


	const supabase = await createClient();

	const profileId = await getActiveProfileId();
	if (!profileId) return [];

	const { data, error } = await supabase
		.from("user_media_status")
		.select("*")
		.eq("user_id", userId)
		.eq("profile_id", profileId)
		.order("last_watched", { ascending: false })
		.limit(20);

	if (error || !data?.length) return [];

	const results = await Promise.all(
		data.map(async (entry) => {
			try {
				return entry.media_type === "tv"
					? await getSerie<TvSummary>(entry.media_id)
					: await getMovie<MovieSummary>(entry.media_id);
			} catch {
				return null;
			}
		})
	);

	return results.filter(Boolean) as (MovieSummary | TvSummary)[];

};

export async function getWatchHistory(limit = 50): Promise<((MovieDetailsWithImages | TvDetailsWithImages) & { mediaStatus: UserMediaStatus })[]> {

	const supabase = await createClient();

	const { data: { user } } = await supabase.auth.getUser();
	if (!user) return [];

	const profileId = await getActiveProfileId();
	if (!profileId) return [];

	const { data, error } = await supabase
		.from("user_media_status")
		.select("*")
		.eq("user_id", user.id)
		.eq("profile_id", profileId)
		.order("last_watched", { ascending: false })
		.limit(limit);

	if (error || !data?.length) return [];

	const results = await Promise.all(
		data.map(async (entry) => {

			try {

				const media = entry.media_type === "tv"
					? await getSerie<TvDetailsWithImages>(entry.media_id)
					: await getMovie<MovieDetailsWithImages>(entry.media_id);


				if (!media) return null;

				return { ...media, mediaStatus: entry };

			} catch {
				return null;
			};

		})
	);

	return results.filter(Boolean) as ((MovieDetailsWithImages | TvDetailsWithImages) & { mediaStatus: UserMediaStatus })[];

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