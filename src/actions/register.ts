"use server"

import { useRateLimit } from "@/lib/rateLimit";
import { consumeInvite } from "@/utils/db/consumeInvite";
import { createProfile } from "@/utils/db/createProfile";
import { validateInvite } from "@/utils/db/validateInvite";
import { createClient } from "@/utils/supabase/server";
import { Session } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

const formSchema = z.object({
	email: z
		.email("Invalid email"),
	password: z
		.string()
		.min(8, "Password must be at least 8 characters"),
	confirmPassword: z
		.string(),
	inviteCode: z
		.string()
		.regex(
			/^[A-Z0-9_-]{4}(?:-[A-Z0-9_-]{4})+$/,
			"Invalid invite code format"
		),
}).refine((data) => data.password === data.confirmPassword, {
	message: "Passwords do not match",
	path: ["confirmPassword"]
});

export type RegisterFormState = {
	errors?: Record<string, string[]>;
	error?: string;
	values?: {
		email: string;
		inviteCode: string;
		password: string;
		confirmPassword: string;
	}
};

export async function registerHandler(
	supabase: Awaited<ReturnType<typeof createClient>>,
	validatedData: z.infer<typeof formSchema>
): Promise<Session> {

	const isValidInvite = await validateInvite(validatedData.inviteCode);

	if (!isValidInvite) {
		throw new Error("Invalid signup information.");
	};

	const invite = isValidInvite as InviteCode;

	const { data, error } = await supabase.auth.signUp({
		email: validatedData.email,
		password: validatedData.password
	});

	if (error || !data.session || !data.user) {
		throw new Error(error?.message ?? "An error occurred. Please try again later.");
	};

	const user = data.user;

	await consumeInvite(invite as InviteCode);

	await createProfile({
		id: user.id,
		email: user.email!,
		display_name: "",
		role: invite.role
	});

	return data.session;

};

export async function register(prevState: RegisterFormState, formData: FormData) {

	const rawData = {
		email: formData.get("email") as string,
		password: formData.get("password") as string,
		confirmPassword: formData.get("confirm-password") as string,
		inviteCode: formData.get("invite-code") as string,
	};

	const validateFields = formSchema.safeParse(rawData);

	if (!validateFields.success) {

		const flattened = z.flattenError(validateFields.error);

		return {
			errors: flattened.fieldErrors,
			values: rawData
		};

	};

	const rateLimitedRegister = await useRateLimit(registerHandler, "register", {
		maxRequests: 3,
		windowSize: 60 * 60 * 1000
	});

	try {

		const session = await rateLimitedRegister(validateFields.data);

		(await cookies()).set({
			name: "sb-access-token",
			value: session.access_token,
			httpOnly: true,
			path: "/",
		});

		
	} catch (err) {
		
		return {
			values: rawData,
			error: err instanceof Error ? err.message : "An error occurred. Please try again later.",
		};
		
	};

	redirect("/");

};