"use server"

import { createAuditLog } from "@/utils/db/createAuditLog";
import { createClient } from "@/utils/supabase/server"

export async function addToAtlas(mediaId: string): Promise<{ success: boolean }> {

	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();

	if (!user) return { success: false };

	const { error } = await supabase
		.from("atlas_queue")
		.insert({
			media_id: mediaId,
			user_id: user.id,
			status: "pending",
		});

	if (error) {

		createAuditLog({
			action: "add_atlas_failed",
			resource: "atlas_queue",
			details: { error: error.message }
		});

		return { success: false };

	};

	return { success: true };

};

export async function getAtlasEntries(): Promise<AtlasQueueItem[]> {

	const supabase = await createClient();
	const { data, error } = await supabase
		.from("atlas_queue")
		.select("*");

	if (error || data.length === 0) return [];

	return data;

};

export async function updateAtlasEntry(entryId: string, state: "pending" | "processing" | "completed"): Promise<{ error?: string } | undefined> {

	const supabase = await createClient();
	const { error } = await supabase
		.from("atlas_queue")
		.update({
			status: state
		})
		.eq("id", entryId);

	if (error) return { error: error.message };

};