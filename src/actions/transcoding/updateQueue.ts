"use server"

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function updateTranscodingQueue(action: "pause" | "resume") {

	const supabase = await createClient();
	const { data: { session } } = await supabase.auth.getSession();

	if (!session) redirect("/login");

	const res = await fetch(`${process.env.NEXT_PUBLIC_STREAMING_API_URL}/api/media/transcoding`, {
		method: "PATCH",
		headers: {
			"Authorization": `Bearer ${session.access_token}`,
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			action
		})
	});

	if (!res.ok) throw new Error(`Failed to delete job. ${res.status}-${res.statusText}`);

	const data = await res.json();
	return data;

};