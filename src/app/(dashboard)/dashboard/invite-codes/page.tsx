import { createClient } from "@/utils/supabase/server";
import { InviteManager } from "./InviteManager";

export default async function Page() {

	const supabase = await createClient();

	const { data } = await supabase
		.from("invites")
		.select("id, code_hint, role, max_uses, uses, created_by, created_at, expires_at")
		.order("created_at", { ascending: false });

	return <InviteManager initialCodes={(data ?? []) as InviteCode[]} />;

}
