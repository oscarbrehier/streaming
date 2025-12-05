"use server"

import { createClient } from "@/utils/supabase/server";

export async function getLogEntries(pageIndex?: number, pageSize?: number): Promise<{ data: AuditLogs[], count: number }> {

	if (!pageSize) pageSize = 10;

	const from = ((pageIndex ?? 1) - 1) * pageSize;
	const to = from + pageSize - 1;

	const supabase = await createClient();
	const { data, count, error } = await supabase
		.from("audit_logs")
		.select("*", { count: "exact" })
		.range(from, to)
		.order("created_at", { ascending: false });

	if (error || data.length === 0) return { count: count ?? 0, data: [] };

	return { count: count ?? data.length, data };

};