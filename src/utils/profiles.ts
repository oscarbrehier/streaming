"use server"

import { cookies } from "next/headers";
import { createClient } from "./supabase/server";

export async function getActiveProfileId(): Promise<string | null> {
	const cookieStore = await cookies();
	return cookieStore.get("active_profile")?.value ?? null;
};

export async function setActiveProfile(profileId: string) {

	const cookieStore = await cookies();

	cookieStore.set("active_profile", profileId, {
		httpOnly: true,
		sameSite: "lax",
		maxAge: 60 * 60 * 24 * 30
	});

};

export async function getUserViewingProfiles(): Promise<ViewingProfile[]> {

	const supabase = await createClient();

	const { data: { user } } = await supabase.auth.getUser();
	if (!user) return [];

	const { data, error } = await supabase
		.from("user_profiles")
		.select("*")
		.eq("user_id", user.id)
		.order("is_default", { ascending: false });;

	if (error || !data) return [];

	return data;

};