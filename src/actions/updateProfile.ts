"use server"

import { createAuditLog } from "@/utils/db/createAuditLog";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache"

interface ProfileUpdateFields {
	display_name: string
};

export async function updateProfile(data: ProfileUpdateFields) {

	const supabase = await createClient();

	const { display_name } = data;

	const { error } = await supabase.auth.updateUser({
		data: {
			display_name
		}
	});

	console.log(error)

	if (error) {

		createAuditLog({
			action: "update_profile_failed",
			resource: "profile.display_name",
			details: { error: error.message }
		});

	} else {

		createAuditLog({
			action: "update_profile",
			resource: "profile.display_name",
			details: { new_value: display_name }
		});

	};

	revalidatePath("/profile");

};