"use server"

import { v4 as uuidv4 } from "uuid";
import { createClient } from "../supabase/server";

export async function createLog(log: Omit<AuditLogs, "id" | "created_at">) {

	const supabase = await createClient();
	await supabase
		.from("audit_logs")
		.insert({
			id: uuidv4(),
			created_at: new Date(),
			...log
		});

};