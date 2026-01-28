"use server"

import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logout() {

	const supabase = await createClient();

	await supabase.auth.signOut();

	const cookieStore = await cookies();
	cookieStore.delete("2fa_verified");

	redirect("/login");

};