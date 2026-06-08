"use server"

import { cookies } from "next/headers";
import { createClient } from "./supabase/server";
import bcrypt from "bcryptjs";
import { MAX_USER_PROFILES } from "./constants";

export async function getActiveProfileId(): Promise<string | null> {
	const cookieStore = await cookies();
	return cookieStore.get("active_profile")?.value ?? null;
};

export async function getActiveProfile(): Promise<ViewingProfile | null> {

	const profileId = await getActiveProfileId();
	if (!profileId) return null;

	const supabase = await createClient();

	const { data, error } = await supabase
		.from("user_profiles")
		.select("*")
		.eq("id", profileId)
		.single();

	if (error || !data) return null;

	return data;

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

export async function createViewingProfile({
	name,
	color,
	pin
}: {
	name: string;
	color: string;
	pin: string | null;
}): Promise<{ success?: boolean, error?: string }> {

	const supabase = await createClient();

	const { data: { user } } = await supabase.auth.getUser();
	if (!user) return { error: "Not authenticated" };

	const { data: existing } = await supabase
		.from("user_profiles")
		.select("id")
		.eq("user_id", user.id);

	if (existing && existing.length >= MAX_USER_PROFILES) {
		return { error: `Maximum of ${MAX_USER_PROFILES} profiles reached.` };
	}

	const isDefault = !existing || existing.length === 0;

	const pinHash = pin ? await bcrypt.hash(pin, 10) : null;

	const { error } = await supabase
		.from("user_profiles")
		.insert({
			user_id: user.id,
			name,
			avatar_url: color,
			pin_hash: pinHash,
			is_default: isDefault
		});

	if (error) return { error: error.message };

	return { success: true };

};

export async function verifyProfilePin(profileId: string, pin: string): Promise<{ success: boolean; locked?: boolean; attemptsLeft?: number }> {

	const supabase = await createClient();

	const { data, error } = await supabase
		.from("user_profiles")
		.select("pin_hash, pin_attempts, pin_locked_until")
		.eq("id", profileId)
		.single();

	if (error || !data?.pin_hash) return { success: false };

	if (data.pin_locked_until && new Date(data.pin_locked_until) > new Date()) {
		return { success: false, locked: true };
	}

	const MAX_ATTEMPTS = 5;
	const LOCKOUT_MINUTES = 15;

	const result = await bcrypt.compare(pin, data.pin_hash);

	if (!result) {

		const attempts = data.pin_attempts + 1;
		const isLocked = attempts >= MAX_ATTEMPTS;

		await supabase
			.from("user_profiles")
			.update({
				pin_attempts: isLocked ? 0 : attempts,
				pin_locked_until: isLocked
					? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000).toISOString()
					: null,
			})
			.eq("id", profileId);

		return {
			success: false,
			locked: isLocked,
			attemptsLeft: MAX_ATTEMPTS - attempts,
		};

	};

	await supabase
		.from("user_profiles")
		.update({ pin_attempts: 0, pin_locked_until: null })
		.eq("id", profileId);

	return { success: true };

};

export async function updateViewingProfile(
	profileId: string,
	data: { name: string; color: string; pin: string | null }
): Promise<{ success?: boolean; error?: string }> {

	const supabase = await createClient();

	const { data: { user } } = await supabase.auth.getUser();
	if (!user) return { error: "Not authenticated" };

	const pinHash = data.pin ? await bcrypt.hash(data.pin, 10) : undefined;

	const { error } = await supabase
		.from("user_profiles")
		.update({
			name: data.name,
			avatar_url: data.color,
			...(pinHash !== undefined && { pin_hash: pinHash }),
		})
		.eq("id", profileId)
		.eq("user_id", user.id);

	if (error) return { error: error.message };

	return { success: true };

};

export async function deleteViewingProfile(profileId: string): Promise<{ success?: boolean; error?: string }> {

	const supabase = await createClient();

	const { data: { user } } = await supabase.auth.getUser();
	if (!user) return { error: "Not authenticated" };

	const { error } = await supabase
		.from("user_profiles")
		.delete()
		.eq("id", profileId)
		.eq("user_id", user.id);

	if (error) return { error: error.message };

	return { success: true };

};