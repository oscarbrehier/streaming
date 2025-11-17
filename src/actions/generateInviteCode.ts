"use server"

import crypto from "crypto";
import { createClient } from "../utils/supabase/server";
import { hashInvite } from "../utils/db/hashInvite";

function generateInviteHint(code: string): string {

	const parts = code.split("-");
	if (parts.length === 0) return "****";

	return [parts[0], ...Array(parts.length - 1).fill("****")].join("-");

};

export async function generateInviteCode(): Promise<{
	error?: string;
	code?: string;
}> {

	let result = "";

	const raw = crypto.randomBytes(8)
		.toString("base64")
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/, "")
		.toUpperCase();

	for (let i = 0; i < raw.length; i += 4) {

		result += raw.slice(i, i + 4);
		if (i + 4 < raw.length) result += "-";

	};

	const hashedCode = hashInvite(result);
	const codeHint = generateInviteHint(result);

	const supabase = await createClient();
	const { data: { user }} = await supabase.auth.getUser();

	if (!user) {
		return { error: "Not authenticated" };
	};

	const { error } = await supabase
		.from("invites")
		.insert({
			code_hash: hashedCode,
			code_hint: codeHint,
			role: "member",
			max_uses: 1,
			uses: 0,
			created_by: user?.id,
			expires_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()
		});

	if (error) {

		return {
			error: error.message
		};

	};

	return {
		code: result
	};

};