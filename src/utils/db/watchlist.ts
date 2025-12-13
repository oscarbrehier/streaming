"use server"

import { createClient } from "../supabase/server"
import { Session } from "@supabase/supabase-js";
import { cacheTag, revalidateTag } from "next/cache";
import { createClientWithSession } from "../supabase/createClientWithSession";

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
	
	revalidateTag(`watchlist-${user.id}`, "max");
	return { success: true };

};

export async function getWatchlist(session: Session, mediaId?: string): Promise<{ data: Wishlist[], error?: string }> {

	"use cache"
if (!session) return { data: [], error: "User not authenticated" };
	
	cacheTag(`watchlist-${session.user.id}`);

	const supabase = createClientWithSession(session);

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