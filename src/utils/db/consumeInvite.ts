"use server"

import { supabaseAdmin } from "../supabase/admin"
import { createAuditLog } from "./createAuditLog";

export async function consumeInvite(invite: InviteCode) {

	const { error } = await supabaseAdmin
		.rpc("consume_invite", { invite_id: invite.id });

	if (error) {
		
		createAuditLog({
			action: "consume_invite",
			resource: invite.id
		});

		throw new Error(error.message);
	};

};