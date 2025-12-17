"use server"

import { redirect } from "next/navigation";
import { createClient } from "../../utils/supabase/server";

export async function retryTranscodingJob(jobId: string) {

	const supabase = await createClient();
	const { data: { session } } = await supabase.auth.getSession();

	if (!session?.access_token) redirect("/login");
	
	const res = await fetch(`${process.env.NEXT_PUBLIC_STREAMING_API_URL}/media/transcoding/${jobId}/retry`, {
		method: "POST",
		headers: {
			"Authorization": `Bearer ${session?.access_token}`
		}
	});

	if (!res.ok) throw new Error(`Failed to retry job. ${res.status}-${res.statusText}`);

	const data = await res.json();
	return data;

};