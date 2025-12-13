"use server"

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
			movie_id: mediaId,
			media_type: mediaType ?? "movie"
		});

	if (error) return { error: error.message };

	return { success: true };

};

export async function getWatchlistEntries(mediaId?: string): Promise<{ data: Wishlist[], error?: string }> {

	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();
	
	if (!user) return { data: [], error: "User not authenticated" };

	const query = supabase
		.from("watchlists")
		.select("*");

	if (mediaId) {
		query.eq("movie_id", mediaId);
	};

	const { data, error } = await query;

	if (error) return { data: [], error: error.message };
	return { data };

};

export async function getWatchlist(): Promise<MovieDetails[]> {

	const { data: watchlistEntries, error } = await getWatchlistEntries();
	if (error || watchlistEntries.length == 0) return [];

	const watchlist = (await Promise.all(
		watchlistEntries.map(async (item) => {

			const movie = await getMovie<MovieDetails>(item.movie_id);
			return movie;

		})
	)).filter(Boolean);

	return watchlist;

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
		.eq("movie_id", mediaId)
		.eq("media_type", mediaType ?? "movie")
		.maybeSingle();

	if (error) return false;

	return !!data;

};