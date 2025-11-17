"use server"

import { createClient } from "@/utils/supabase/server";
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

	const supabase = await createClient();
	const { data, error } = await supabase
		.auth
		.signInWithPassword(validateFields.data);

	if (error || !data.session) {

		return {
			error: error?.message ?? "An error occurred. Please try again later.",
			values: rawData
		};
		
	};

	(await cookies()).set({
		name: "sb-access-token",
		value: data.session.access_token,
		httpOnly: true,
		path: "/",
	});

	redirect("/");

};