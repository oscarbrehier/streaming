"use server"

import { v4 as uuidv4 } from "uuid";
import { headers } from "next/headers";
import { supabaseAdmin } from "../supabase/admin";
import { createClient } from "../supabase/server";

type CreateAuditLogInput = {
	action: string;
	resource: string;
	details?: Record<string, any>;
	user_id?: string | null;
};


export async function createAuditLog(log: CreateAuditLogInput) {

	let userId = log.user_id ?? null;

	const headersList = await headers();
	const ip = headersList.get("x-forwarded-for");

	if (!userId) {

		const supabase = await createClient();
		const { data: { user } } = await supabase.auth.getUser();

		userId = user?.id ?? null;

	};

	await supabaseAdmin
		.from("audit_logs")
		.insert({
			id: uuidv4(),
			created_at: new Date(),
			action: log.action,
			resource: log.resource,
			user_id: userId,
			details: {
				...(log.details ?? {}),
				ip
			}
		});

};