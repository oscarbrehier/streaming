import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { createCacheClient, createClient } from "@/utils/supabase/server";
import { cacheTag } from "next/cache";
import { InviteCollapsible } from "./InviteCollapsible";

async function getInviteCodes(): Promise<InviteCode[] | null> {

	"use cache"

	cacheTag("invite-codes");

	const supabase = await createCacheClient();

	const { data, error } = await supabase
		.from("invites")
		.select(`
			id,
			code_hint,
			role,
			max_uses,
			uses,
			created_by,
			created_at	
		`);

	if (error || data.length === 0) return null;
	return data as InviteCode[];

};

export async function InviteCodes() {

	const data = await getInviteCodes();
	if (!data) return;

	return (

		<section>

			<p className="mb-4">Generated Invites</p>

			<div className="space-y-2 flex flex-col">

				{data.map((invite, idx) => (

					<InviteCollapsible
						key={`${invite.id}-${idx}`}
						invite={invite}
					/>

				))}

			</div>

		</section>

	);

};