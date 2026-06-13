"use server"

import { getMovie } from "@/lib/tmdb/movie";
import { createClient } from "../supabase/server";
import { createAuditLog } from "./createAuditLog"
import { getFeaturedFilm } from "@/lib/tmdb/editorial";

export async function addFeaturedContent(options: Partial<FeaturedContent>): Promise<{ success: boolean, error?: string }> {

	const supabase = await createClient();
	const { error } = await supabase
		.from("featured_content")
		.insert(options);

	if (error) {

		createAuditLog({
			action: "add_failed",
			resource: "featured_content",
			details: {
				error: error.message
			}
		});

		return {
			success: false,
			error: error.message
		};

	}

	return { success: true };

};

export async function getFeaturedContent(options: Partial<FeaturedContent> & { select?: string, limit?: number }): Promise<Partial<FeaturedContent>[]> {

	const supabase = await createClient();
	let query = supabase
		.from("featured_content")
		.select(options.select ?? "*");

	for (const [option, value] of Object.entries(options)) {

		if (value === undefined || option === "select" || option === "limit") continue;

		const v = value instanceof Date ? value.toISOString() : value;

		if (option === "active_from") {
			query = query.lte("active_from", v).or("active_from.is.null");
		} else if (option === "active_to") {
			query = query.gte("active_to", v).or("active_to.is.null");
		} else {
			query = query.eq(option, value);
		};

	};

	if (options.limit) {
		query = query.limit(options.limit);
	}

	const { data, error } = await query;

	if (error) {

		console.log(error)

		createAuditLog({
			action: "fetch_failed",
			resource: "featured_content",
			details: {
				error: error.message
			}
		});

		return [];

	};

	console.log(data);

	return (data ?? []) as Partial<FeaturedContent>[];

};

export async function getHeroBannerItems(): Promise<MovieDetailsWithImages[]> {

	const featured = await getFeaturedFilm();
	if (featured) {

		const movie = await getMovie(String(featured.id), { credits: true });
		return [movie];

	};

	const data = await getFeaturedContent({
		feature_type: "hero",
		is_active: true,
		select: "movie_id, priority",
		limit: 5
	});

	const sortedByPriority = data.sort((a, b) => a.priority! - b.priority!);
	let items = await Promise.all(sortedByPriority
		.map(async (item) => {
			const res = await getMovie(item.movie_id!);
			return res;
		})
		.filter(Boolean)
	);

	if (!items.length) {
		const defaultMovieIds = [649, 456, 789];
		items = await Promise.all(defaultMovieIds.map(id => getMovie(id.toString())));
	}

	return items;

};