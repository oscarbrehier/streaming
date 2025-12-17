"use server"

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function validateOTPCode(code: string): Promise<{ success: boolean; error?: string }> {

	if (code.length != 6 || !/^\d+$/.test(code)) {
		return { success: false, error: "Invalid code format" };
	};

	const supabase = await createClient();
	const { data: { session } } = await supabase.auth.getSession();
	if (!session?.access_token) redirect("/login");

	const res = await fetch(`${process.env.NEXT_PUBLIC_STREAMING_API_URL}/2fa/verify`, {
		method: "POST",
		headers: {
			"Authorization": `Bearer ${session.access_token}`,
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			code
		})
	});

	if (!res.ok) return { success: false, error: "Invalid code." };

	const data = await res.json();

	if (!data.verified) {
		return { success: false, error: "Invalid code." };
	};

	return {
		success: true
	};

};