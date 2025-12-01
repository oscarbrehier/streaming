"use server"

import { redirect } from "next/navigation";
import { createClient } from "../utils/supabase/server";

export async function retryTranscodeJob(jobId: string) {

	const supabase = await createClient();
	const { data: { session } } = await supabase.auth.getSession();

	if (!session?.access_token) redirect("/login");
	
	await fetch(`${process.env.NEXT_PUBLIC_STREAMING_API_URL}/api/media/queue/${jobId}/retry`, {
		method: "POST",
		headers: {
			"Authorization": `Bearer ${session?.access_token}`
		}
	});

};