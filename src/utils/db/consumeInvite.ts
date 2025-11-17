"use server"

import { createClient } from "../supabase/server";

export async function consumeInvite(invite: InviteCode) {

	const supabase = await createClient();

	await supabase
		.from("invites")
		.update({ uses: invite.uses })
		.eq("id", invite.id)

};