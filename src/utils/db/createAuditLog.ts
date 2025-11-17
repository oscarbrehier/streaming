"use server"

import { v4 as uuidv4 } from "uuid";
import { createClient } from "../supabase/server";
import { headers } from "next/headers";

export async function createAuditLog(log: Omit<AuditLogs, "id" | "created_at">) {

	const headersList = await headers();
	const ip = headersList.get("x-forwarded-for");

	const supabase = await createClient();
	await supabase
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