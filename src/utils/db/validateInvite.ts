"use server"

import { createClient } from "../supabase/server"
import { hashInvite } from "./hashInvite";

export async function validateInvite(code: string): Promise<InviteCode | boolean> {

	const supabase = await createClient();
	const hashed = hashInvite(code);

	const { data, error } = await supabase
		.from("invites")
		.select("*")
		.eq("code_hash", hashed)
		.single();

	if (error || !data) {
		return false;
	};

	if (data.uses >= data.max_uses) return false;
	if (new Date(data.expires_at) <= new Date()) return false;

	return data;

};