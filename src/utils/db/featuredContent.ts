"use server"

import { createClient } from "../supabase/server";
import { createAuditLog } from "./createAuditLog";

type FeaturedContent = {
	id: string;
	movie_id: string;
	headline?: string;
	subheadling?: string;
	feature_type: string;
	is_active: boolean;
	active_from?: Date;
	active_to?: Date;
	priority: number;
	created_at: Date;
	updated_at: Date;
};

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

export async function getFeaturedContent(options: Partial<FeaturedContent>): Promise<FeaturedContent[]> {

	const supabase = await createClient();
	let query = supabase
		.from("featured_content")
		.select("*");

	for (const [option, value] of Object.entries(options)) {
		if (value !== undefined) query = query.eq(option, value);
	};

	const { data, error } = await query;

	if (error) {

		createAuditLog({
			action: "fetch_failed",
			resource: "featured_content",
			details: {
				error: error.message
			}
		});

		return [];

	};

	return data;

};