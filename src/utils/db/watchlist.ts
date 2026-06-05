"use server"

import { getSerie } from "@/lib/tmdb/series";
import { createClient } from "../supabase/server"
import { getMovie } from "@/lib/tmdb/movie";

export async function addToWatchlist(mediaId: string, mediaType?: "movie" | "tv"): Promise<{ success?: boolean, error?: string }> {

	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();

	if (!user) return { error: "User not authenticated" };

	const { error } = await supabase
		.from("watchlists")
		.insert({
			user_id: user.id,
			media_id: mediaId,
			media_type: mediaType ?? "movie"
		});

	if (error) return { error: error.message };

	return { success: true };

};

export async function getWatchlistEntries(opts?: {
	mediaId?: string,
	mediaType?: MediaType
}): Promise<{ data: Watchlist[], error?: string }> {

	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();

	if (!user) return { data: [], error: "User not authenticated" };

	let query = supabase
		.from("watchlists")
		.select("*");

	if (opts?.mediaId) {
		query = query.eq("media_id", opts.mediaId);
	};

	if (opts?.mediaType) {
		query = query.eq("media_type", opts.mediaType);
	};

	const { data, error } = await query;

	if (error) return { data: [], error: error.message };
	return { data };

};

export async function getWatchlist(mediaType?: MediaType): Promise<MovieDetails[]> {

	const { data: watchlistEntries, error } = await getWatchlistEntries({ mediaType });
	if (error || watchlistEntries.length == 0) return [];

	const movies = watchlistEntries.filter(i => i.media_type == "movie");
	const series = watchlistEntries.filter(i => i.media_type == "tv");

	const [movieResults, seriesResults] = await Promise.all([
		Promise.all(movies.map(item => getMovie<MovieDetails>(item.media_id))),
		Promise.all(series.map(item => getSerie<MovieDetails>(item.media_id))),
	]);

	return [...movieResults, ...seriesResults].filter(Boolean) as MovieDetails[];

};

export async function isInWatchlist(
	mediaId: string,
	mediaType?: "movie" | "tv"
): Promise<boolean> {

	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();

	if (!user) return false;

	const { data, error } = await supabase
		.from("watchlists")
		.select("id")
		.eq("user_id", user.id)
		.eq("media_id", mediaId)
		.eq("media_type", mediaType ?? "movie")
		.maybeSingle();

	if (error) return false;

	return !!data;

};