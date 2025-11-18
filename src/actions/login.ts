"use server"

import { useRateLimit } from "@/lib/rateLimit";
import { createClient } from "@/utils/supabase/server";
import { Session } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import z from "zod";

const formSchema = z.object({
	email: z.email("Invalid email"),
	password: z.string()
});

export type LoginFormState = {
	errors?: Record<string, string[]>;
	error?: string;
	values?: {
		email: string;
		password: string;
	}
};

async function loginHandler(
	supabase: Awaited<ReturnType<typeof createClient>>,
	validatedData: z.infer<typeof formSchema>
): Promise<Session> {

	const { data, error } = await supabase
		.auth
		.signInWithPassword(validatedData);

	if (error || !data.session) {
		throw new Error(error?.message ?? "An error occurred. Please try again later.");
	};

	return data.session;

};

export async function login(prevState: LoginFormState, formData: FormData) {

	const rawData = {
		email: formData.get("email") as string,
		password: formData.get("password") as string
	};

	const validateFields = formSchema.safeParse(rawData);

	if (!validateFields.success) {

		const flattened = z.flattenError(validateFields.error);

		return {
			errors: flattened.fieldErrors,
			values: rawData
		};

	};

	const rateLimitedLogin = await useRateLimit(loginHandler, "login", {
		maxRequests: 3,
		windowSize: 15 * 60 * 1000
	});

	try {

		const session = await rateLimitedLogin(validateFields.data);

		(await cookies()).set({
			name: "sb-access-token",
			value: session.access_token,
			httpOnly: true,
			path: "/",
		});

		
	} catch (err) {
		
		console.log(err)
		
		return {
			error: err instanceof Error ? err.message : "An error occurred. Please try again later.",
			values: rawData
		};
		
	};

	redirect("/");

};