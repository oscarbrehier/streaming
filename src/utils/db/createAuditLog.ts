"use server"

import { v4 as uuidv4 } from "uuid";
import { headers } from "next/headers";
import { supabaseAdmin } from "../supabase/admin";

export async function createAuditLog(log: Omit<AuditLogs, "id" | "created_at">) {

	const headersList = await headers();
	const ip = headersList.get("x-forwarded-for");

	await supabaseAdmin
		.from("audit_logs")
		.insert({
			id: uuidv4(),
			created_at: new Date(),
			...log,
			details: {
				...log.details,
				ip
			}
		});

};