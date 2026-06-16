"use server"

import { createClient } from "@/utils/supabase/server";
import { generateInviteCode } from "@/actions/generateInviteCode";
import { createAuditLog } from "@/utils/db/createAuditLog";

export { generateInviteCode };

export async function deleteInviteCode(id: string): Promise<{ success: boolean; error?: string }> {

	const supabase = await createClient();

	const { error } = await supabase
		.from("invites")
		.delete()
		.eq("id", id);

	if (error) return { success: false, error: error.message };

	await createAuditLog({
		action: "invite_deleted",
		resource: `invites:${id}`,
	});

	return { success: true };

}

export async function expireInviteCode(id: string): Promise<{ success: boolean; error?: string }> {

	const supabase = await createClient();

	const { error } = await supabase
		.from("invites")
		.update({ expires_at: new Date().toISOString() })
		.eq("id", id);

	if (error) return { success: false, error: error.message };

	await createAuditLog({
		action: "invite_expired",
		resource: `invites:${id}`,
	});

	return { success: true };

}
