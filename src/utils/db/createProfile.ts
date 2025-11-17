"use server"

import { createClient } from "../supabase/server"
import { createAuditLog } from "./createAuditLog";

export async function createProfile(profileData: Omit<UserProfile, "created_at">): Promise<{ error: string | null }> {

	const supabase = await createClient();

	const { error } = await supabase
		.from("profiles")
		.insert(profileData);
	
	if (error) {

		await createAuditLog({
			user_id: profileData.id,
			action: "profile_create",
			resource: error.message,
		});

		return { error: "Failed to create profile." };

	};

	return { error: null };

};