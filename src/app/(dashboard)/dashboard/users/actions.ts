"use server"

import { createClient } from "@/utils/supabase/server";
import { createAuditLog } from "@/utils/db/createAuditLog";

export async function updateUserRole(
	userId: string,
	role: UserRole
): Promise<{ success: boolean; error?: string }> {

	const supabase = await createClient();

	const { error } = await supabase
		.from("profiles")
		.update({ role })
		.eq("id", userId);

	if (error) {
		await createAuditLog({
			action: "role_update_failed",
			resource: `profiles:${userId}`,
			details: { role, error: error.message },
		});
		return { success: false, error: error.message };
	}

	await createAuditLog({
		action: "role_updated",
		resource: `profiles:${userId}`,
		details: { new_role: role },
	});

	return { success: true };

}

export async function getUserStats(userId: string) {

	const supabase = await createClient();

	const [watchlistRes, historyRes, statsRes] = await Promise.all([
		supabase
			.from("watchlists")
			.select("*", { count: "exact", head: true })
			.eq("user_id", userId),
		supabase
			.from("user_media_status")
			.select("media_id, last_watched, completed, rating")
			.eq("user_id", userId)
			.order("last_watched", { ascending: false })
			.limit(8),
		supabase
			.from("user_media_status")
			.select("rating, favorited, completed")
			.eq("user_id", userId),
	]);

	const stats = statsRes.data ?? [];
	const ratingsArr = stats.filter(s => s.rating !== null).map(s => s.rating as number);
	const avgRating = ratingsArr.length
		? +(ratingsArr.reduce((a, b) => a + b, 0) / ratingsArr.length).toFixed(1)
		: null;

	return {
		watchlistCount: watchlistRes.count ?? 0,
		history:        historyRes.data   ?? [],
		totalEntries:   stats.length,
		completions:    stats.filter(s => s.completed).length,
		favorites:      stats.filter(s => s.favorited).length,
		avgRating,
	};

}
