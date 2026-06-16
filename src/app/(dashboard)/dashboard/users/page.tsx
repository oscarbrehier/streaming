import { createClient } from "@/utils/supabase/server";
import { UsersTable } from "./UsersTable";

export default async function Page() {

	const supabase = await createClient();

	const [profilesRes, lastActiveRes] = await Promise.all([
		supabase
			.from("profiles")
			.select("id, email, display_name, role, created_at")
			.order("created_at", { ascending: false }),
		supabase
			.from("user_media_status")
			.select("user_id, last_watched")
			.not("last_watched", "is", null)
			.order("last_watched", { ascending: false }),
	]);

	const profiles = profilesRes.data ?? [];
	const lastActiveMap: Record<string, string> = {};

	for (const item of lastActiveRes.data ?? []) {
		if (item.user_id && !lastActiveMap[item.user_id]) {
			lastActiveMap[item.user_id] = item.last_watched as string;
		}
	}

	const users = profiles.map(p => ({
		...p,
		last_active: lastActiveMap[p.id] ?? null,
	}));

	return <UsersTable users={users} />;

}
