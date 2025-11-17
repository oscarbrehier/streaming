"use server"

import crypto from "crypto";
import { createClient } from "../utils/supabase/server";
import { hashInvite } from "../utils/db/hashInvite";
import { useRateLimit } from "@/lib/rateLimit";
import { revalidatePath, revalidateTag } from "next/cache";
import { createAuditLog } from "@/utils/db/createAuditLog";

function generateInviteHint(code: string): string {

	const parts = code.split("-");
	if (parts.length === 0) return "****";

	return [parts[0], ...Array(parts.length - 1).fill("****")].join("-");

};

async function handler(
	supabase: Awaited<ReturnType<typeof createClient>>,
	role: UserRole,
): Promise<{
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

	// const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();

	if (!user) {

		await createAuditLog({
			user_id: "unknown",
			action: "unauthenticated_access_attempt",
			resource: "invites:generate",
			details: {
				context: "User not authenticated"
			}
		});

		return { error: "Not authenticated" };

	};

	const max_uses = 1;
	const expires_at = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();

	const { data, error } = await supabase
		.from("invites")
		.insert({
			code_hash: hashedCode,
			code_hint: codeHint,
			role,
			max_uses,
			uses: 0,
			created_by: user?.id,
			expires_at
		})
		.select()
		.single();

	if (error) {

		await createAuditLog({
			user_id: user?.id ?? "unknown",
			action: "invite_generation_failed",
			resource: "invites",
			details: {
				error: error.message,
				role,
				max_uses,
				expires_at,
				context: "Database insert failed"
			}
		});

		return {
			error: error.message
		};

	};

	await createAuditLog({
		user_id: user.id,
		action: "invite_generated",
		resource: data.id,
		details: { role, max_uses, expires_at }
	});

	revalidateTag("invite-codes", "max");
	revalidatePath("/dashboard");

	return {
		code: result
	};

};

export async function generateInviteCode(role: UserRole): Promise<{
	error?: string;
	code?: string;
}> {

	const rateLimitedHandler = await useRateLimit(handler, "invites");
	return rateLimitedHandler(role);
}